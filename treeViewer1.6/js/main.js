// ====================================
// Configuration et initialisation
// ====================================
import { parseGEDCOM } from './gedcomParser.js';
import { drawTree } from './treeRenderer.js';
import { findYoungestPerson, findPersonByName } from './utils.js';
import { buildAncestorTree, buildDescendantTree, buildCombinedTree } from './treeOperations.js';
import { initNetworkListeners, startAncestorAnimation, initializeAnimationMapPosition, 
    toggleAnimationPause, resetAnimationState  } from './treeAnimation.js';
import { geocodeLocation, loadGeolocalisationFile } from './geoLocalisation.js';
import { nameCloudState } from './nameCloud.js';
import { initializeCustomSelectors, replaceRootPersonSelector, enforceTextTruncation, 
    applyTextDefinitions, updateGenerationSelectorValue, updateTreeModeSelector,
    setupSearchFieldModal } from './mainUI.js'; 
import { createEnhancedSettingsModal } from './treeSettingsModal.js';
import { hideLoginBackground } from './eventHandlers.js';
import { showHamburgerMenu, initializeHamburgerOnce } from './hamburgerMenu.js';
import { initTilePreloading } from './mapTilesPreloader.js';
import { initResourcePreloading, fetchResourceWithCache } from './resourcePreloader.js';
import { createAudioElement } from './audioPlayer.js';

import { cleanupExportControls } from './exportSettings.js';

import { setMaxGenerationsInit } from './treeWheelRenderer.js';
import { enableFortuneMode, disableFortuneModeWithLever } from './treeWheelAnimation.js'
import { debugLog } from './debugLogUtils.js'
import { createDataForHeatMap } from './geoHeatMapDataProcessor.js';
import { createImprovedHeatmap } from './geoHeatMapUI.js';

import { getTranslation } from './nameCloudUI.js';


import { 
    displayPersonDetails, 
    closePersonDetails,
    setAsRootPerson,
    closeModal
} from './modalWindow.js';
import {
    initializeEventHandlers,
    updatePrenoms,
    updateLettersInNames,
    updateGenerations,
    zoomIn,
    zoomOut,
    resetView,
    resetZoom,
    searchTree
} from './eventHandlers.js';

let stopMonitoring = null;


// Enregistrement du Service Worker pour permettre le mode hors ligne
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')
      .then(registration => {
        console.log('✅ Service Worker enregistré avec succès:', registration.scope);
        
        // Vérifier si une mise à jour est disponible
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                console.log('Nouveau Service Worker installé, sera activé au prochain chargement');
              } else {
                console.log('Service Worker installé pour la première fois');
              }
            }
          };
        };
      })
      .catch(error => {
        console.error('Échec de l\'enregistrement du Service Worker:', error);
      });
  }

  
// for tracking with google Analytics
export function trackPageView(pagePath) {
    if (window.gtag) {
        console.log(`📊 Suivi de la vue de page pour google Analytics: ${pagePath}`);
        gtag('event', 'page_view', {
            page_location: window.location.href,
            page_title: pagePath
        });
    }
}




export const state = {
    gedcomData: null,
    rootPersonId: null,
    rootPerson: null,
    currentTree: null,
    nombre_prenoms: 2,
    nombre_lettersInPrenoms: 20,
    nombre_lettersInNames: 15,
    nombre_generation: 4,
    boxWidth: 150,
    boxHeight: 50,
    treeMode: 'ancestors', // ou 'descendants' ou 'both'
    treeModeReal: 'ancestors', // ou 'descendants' ou 'both'
    treeModeReal_backup: 'ancestors', // ou 'descendants' ou 'both'    
    lastHorizontalPosition: 0,
    lastVerticalPosition: 0,
    isSpeechEnabled: true,
    isSpeechEnabled2: true,
    isVoiceSelected: false,
    isAnimationPaused: false,
    isAnimationLaunched: false,
    isAnimationMapInitialized: false,
    targetAncestorId: "@I739@",
    targetCousinId: null,
    animationTargetAncestorId: "@I739@",
    animationRootPersonId: '@I1@',
    isTouchDevice: false,
    isMobile: false,
    isIOS: false,
    initialTreeDisplay: true,
    isHamburgerMenuInitialized: false,
    menuHamburgerInitialized: false,
    backgroundEnabled: true,
    previousWindowInnerWidth: 0,
    previousWindowInnerHeight: 0,
    lastWindowInnerWidth: 0,
    lastWindowInnerHeight: 0,
    screenResizeHasOccured: false,
    previousWindowInnerWidthInMap: 0,
    previousWindowInnerHeightInMap: 0,
    prevPrevWindowInnerWidthInMap: 0,
    prevPrevWindowInnerHeightInMap: 0,
    treeOwner: 1,
    isOnLine: false,
    isDebugLog: false,
    isRadarEnabled: false,
    radarStyle: 0,
    isWordCloudEnabled: false,
    WheelMode: {
        maxGenerations: 5,
        showSpouses: true,
        showSiblings: true,
        animationsEnabled: true
    },
    currentRadarAngle: 0,
    WheelZoom: null,
    cachedRadarPNG: null,
    isCacheValid: false,
    userHasInteracted: false,
    currentAnimationTimeouts: [],
    WheelConfig: {
        innerRadius: 80,
        generationWidth: 80,
        centerX: 0,
        centerY: 0,
        totalAngle: 2 * Math.PI, // 360° complet
        startAngle: -Math.PI / 2, // Commencer en haut
        maxGenerations: 4,
        limitMaxGenerations: 26 
    },
    lastWheelTransform: null,
    leverEnabled: true,
    isSpinning: false,
    speechSynthesisInitialized: false,
    isSpeechInGoodHealth: false,
    frenchVoice: null,
    currentNameCloudModal: null, // Pour stocker le modal du nuage de mots
    currentScale: 1.0,
    currentX: 0,
    currentY: 0,
    nodeStyle: 'classic', //'heraldic', //'hextech',//'bubble',//'galaxy', //'diamond', //'organic', //'silhouettes', //'heraldic', //'classic', 
    linkStyle: 'normal-dark', //'thick-light' //'veryThick-light', //, //, //'veryThick-colored', //'thin-dark', // 'thick-light' //, //,  //, //'normal-dark',

};

export { geocodeLocation };

window.toggleAnimationPause = toggleAnimationPause;


document.addEventListener('DOMContentLoaded', async () => {
    // Lancer le préchargement des tuiles en tâche de fond
    initResourcePreloading();
    initTilePreloading();
});


function openGedcomModal() {
    document.getElementById('gedcom-modal').style.display = 'block';
}

function closeGedcomModal() {
    document.getElementById('gedcom-modal').style.display = 'none';
}

// ajoutez des options pour différents types de heatmap
export function createAncestorsHeatMap(type = 'all', rootPersonId = null) {
    import('./geoLocalisation.js').then(module => {
        module.createAncestorsHeatMap({
            type: type,
            rootPersonId: rootPersonId
        });k
    });
}

export function updateRadarButtonText() {
    const treeRadarToggleBtn = document.getElementById('radarBtn');
    const menu_nameTreeRadarBtn = document.getElementById('menu-nameTreeRadarBtn');
    if (treeRadarToggleBtn) {
        const span = treeRadarToggleBtn.querySelector('span');
        if (span) {
            span.textContent = state.isRadarEnabled ? '🌳' : '🎯';
        }
    }

    if (menu_nameTreeRadarBtn) {
        // Mettre à jour le bouton du menu hamburger
        if (window.innerHeight < 800) {
            menu_nameTreeRadarBtn.querySelector('span').textContent = state.isRadarEnabled ? '  -  🌿🌳' : '  -  🕸️🎯';
        } else {
            menu_nameTreeRadarBtn.querySelector('span').textContent = state.isRadarEnabled ? '🌿🌳' : '🕸️🎯';
        }
    }

}

/**
 * Extrait toutes les personnes contenues dans un rootHierarchy (d3.hierarchy)

 * @returns {Array} Tableau de toutes les personnes (node.data)
 */
export function getPersonsFromTCurrenTree() {
    const persons = [];
    const rootHierarchy = d3.hierarchy(state.currentTree, node => node.children); 
    console.log('getPersonsFromTCurrenTree rootHierarchy', rootHierarchy);    
    function traverse(node) {
        if (!node) return;
        if (node.data) {
            persons.push(state.gedcomData.individuals[node.data.id]);
        }
        if (node.children && node.children.length > 0) {
            node.children.forEach(child => traverse(child));
        }
    }
    traverse(rootHierarchy);
    return persons;
}

export async function displayHeatMap() {
   
    // Création d'un indicateur de chargement
    const loadingIndicator = document.createElement('div');
    loadingIndicator.style.position = 'fixed';
    loadingIndicator.style.top = '50%';
    loadingIndicator.style.left = '50%';
    loadingIndicator.style.transform = 'translate(-50%, -50%)';
    loadingIndicator.style.backgroundColor = 'white';
    loadingIndicator.style.padding = '20px';
    loadingIndicator.style.borderRadius = '8px';
    loadingIndicator.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    loadingIndicator.style.zIndex = '9999';
    // loadingIndicator.innerHTML = '<p>Génération de la heatmap...</p><progress style="width: 100%;"></progress>';
    loadingIndicator.innerHTML = `<p>${getTranslation('mapGeneration')}</p><progress style="width: 100%;"></progress>`;

    document.body.appendChild(loadingIndicator);
    
    try {

        // Récupérer les paramètres actuels de filtrage
        const currentConfig = {
            type: 'name', //state.treeMode,
            startDate: -6000, //parseInt(startDateInput.value),
            endDate: 3000, //parseInt(endDateInput.value),
            scope: 'all',
            rootPersonId:  null, //state.rootPersonId//scopeSelect.value !== 'all' ? finalRootPersonSelect.value : null
        };

        // const persons = getPersonsFromTCurrenTree();

        // Générer les données pour la heatmap
        const heatmapData = await createDataForHeatMap(currentConfig, true);       

        // Supprimer l'indicateur de chargement
        document.body.removeChild(loadingIndicator);
        
        // Créer la heatmap interactive
        if (heatmapData && heatmapData.length > 0) {
        // if (true) {
            // Créer un titre pour la heatmap basé sur la configuration
            let heatmapTitle;

          
            // Utiliser la fonction pour créer la heatmap
            if (document.getElementById('namecloud-heatmap-wrapper')) {
                createImprovedHeatmap(heatmapData, heatmapTitle, true, true);
            } else {
                createImprovedHeatmap(heatmapData, heatmapTitle, true, false, { top: window.innerHeight/2, left: 25, width: window.innerWidth-50, height: window.innerHeight/2-25 });
            }
            
        } else {
            // alert('Aucune donnée géographique disponible pour les personnes sélectionnées.');
            // alert(getTranslation('noGeoData'));
        }
    } catch (error) {
        console.error('Erreur lors de la génération de la heatmap:', error);
        if (document.body.contains(loadingIndicator)) {
            document.body.removeChild(loadingIndicator);
        }
        // alert(`Erreur lors de la génération de la heatmap: ${error.message}`);
        // alert(`${getTranslation('errorHeatmap')}: ${error.message}`);
    }
}



export function toggleTreeRadar() {
    // Basculer l'état du tree/radar
    state.isRadarEnabled = !state.isRadarEnabled;  
    updateRadarButtonText();  

    if (state.isRadarEnabled) {
        state.treeModeReal_backup = state.treeMode;        
        displayGenealogicTree(null, false, false,  false, 'WheelAncestors');

    } else {

        if ((state.treeModeReal_backup.includes('ncestors')) && !(state.treeMode.includes('ncestors'))) {
            state.treeMode = 'ancestors';
            state.treeModeReal = 'ancestors';
            state.treeModeReal_backup = 'ancestors';

        } else if ((state.treeModeReal_backup.includes('escendants')) && !(state.treeMode.includes('escendants'))) {
            state.treeMode = 'descendants';
            state.treeModeReal = 'descendants';
            state.treeModeReal_backup = 'descendants';
        } else {
            state.treeMode = state.treeModeReal_backup;
            state.treeModeReal = state.treeModeReal_backup;  
        }      
        displayGenealogicTree(null, true, false);
    }
}

// Fonction pour basculer le son
export function toggleSpeech() {
    const speechToggleBtn = document.getElementById('speechToggleBtn');
    
    // Basculer l'état du son
    state.isSpeechEnabled = !state.isSpeechEnabled;




    
    // Mettre à jour le bouton
    speechToggleBtn.querySelector('span').textContent = state.isSpeechEnabled ? '🔊' : '🔇';


}

// Fonction pour desactiver complètement le son dans l'animation
export function toggleSpeech2() {
    const menu_speechToggleBtn = document.getElementById('menu-speechToggleBtn');
    
    // Basculer l'état du son
    state.isSpeechEnabled2 = !state.isSpeechEnabled2;




    
    // Mettre à jour le bouton
    menu_speechToggleBtn.querySelector('span').textContent = state.isSpeechEnabled2 ? '🗣️' : '🔇';
    // Appliquer le style uniquement pour l'emoji 🗣️
    if (menu_speechToggleBtn.querySelector('span').textContent === '🗣️') {
        menu_speechToggleBtn.querySelector('span').style.filter = 'brightness(2) contrast(0.7) saturate(2)';
    } else {
        menu_speechToggleBtn.querySelector('span').style.filter = 'none'; // Réinitialiser le filtre pour 🔇
    }



}

// Pour arrêter le monitoring
function stopBackgroundMonitoring() {
    if (window._monitoringStopFunction) {
      console.log("Arrêt du monitoring du fond d'écran");
      const stats = window._monitoringStopFunction();
      console.log("Statistiques finales:", stats);
      window._monitoringStopFunction = null;
      return stats;
    } else {
      console.log("Pas de monitoring actif à arrêter");
      return null;
    }
  }
  
// Pour redémarrer le monitoring si nécessaire
function restartBackgroundMonitoring() {
// D'abord arrêter s'il est en cours
if (window._monitoringStopFunction) {
    stopBackgroundMonitoring();
}

// Puis redémarrer avec la fonction originale
if (window._originalSetupElegantBackground) {
    console.log("Redémarrage du monitoring du fond d'écran");
    import('./performanceMonitor.js').then(module => {
    window._monitoringStopFunction = module.monitorFunction(
        window, 
        '_originalSetupElegantBackground', 
        1000
    );
    });
} else {
    console.log("Impossible de redémarrer, fonction originale non trouvée");
}
}

export function toggleFullScreen() {
    if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) { // Firefox
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) { // Chrome, Safari and Opera
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) { // IE/Edge
            document.documentElement.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

function initialize() {   
     // Initialiser le sélecteur de générations standard d'abord
    // (nécessaire pour sa création avant de le remplacer)
    initializeGenerationSelect();
    
    // Initialiser les gestionnaires d'événements
    initializeEventHandlers();

    // 🎯 : Initialisation iOS très tôt
    if (window.initializeIOSInstallation) {
        initializeIOSInstallation();
    }
    
    // Initialiser les sélecteurs personnalisés (remplace les sélecteurs standards)
    initializeCustomSelectors();

    // Appliquer les définitions de texte
    applyTextDefinitions();





    // Ajouter l'événement pour soumettre le formulaire avec Enter
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        console.log("Password input trouvé, ajout de l'écouteur d'événement pour Enter");
        passwordInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                console.log("Touche Enter détectée");
                event.preventDefault();
                loadData();
            }
        });
    } else {
        console.warn("Élément 'password' non trouvé lors de l'initialisation");
    }


    setupSearchFieldModal();

    

}

/**
 * Initialise le sélecteur de générations
 */
function initializeGenerationSelect() {
    const select = document.getElementById('generations');
    for (let i = 2; i <= 101; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.text = i;
        if (i === 6) option.selected = true;
        select.appendChild(option);
    }
}


export let audio;
export let audioUnlocked = false;

/**
 * Charge les données GEDCOM et configure l'affichage de l'arbre
 */
export async function loadData() {


    trackPageView('AccueilTreeViewer');

    audio = await createAudioElement();
    audio.preload = 'auto';
    audio.volume = 1;

    state.treeMode = 'ancestors';
    state.treeModeReal = 'ancestors';


    // 💡 Débloque l'audio à ce moment-là pour IOS
    // Pour le cas IOS qui bloque la musique si la musique n'est pas déclenchée par un clic
    // or en mode démo la musique est lancée à la fin de l'animation , loin après le clic
    // dans ce cas il faut faire un pré-init de la musique. L eproblème c'est qu'il faut déjà connaitre quel mp3 il faut jouer. 
    // Il faudra sans doute déplacer cet init juste après le clic du mode démo qui définit quelle musique doit être jouée
    if (isIOSDevice() && !audioUnlocked) {
        audio.play().then(() => {
            audio.pause();
            audio.currentTime = 0;
            audioUnlocked = true;
            console.log("🔓 Audio débloqué !");
        }).catch(e => {
            console.warn("🛑 iOS a bloqué l’audio :", e);
        });
    } else {
        audioUnlocked = true;
    }
    

    state.lastWindowInnerWidth = window.innerWidth;
    state.lastWindowInnerHeight = window.innerHeight;
    state.previousWindowInnerWidth = state.lastWindowInnerWidth;
    state.previousWindowInnerHeight = state.lastWindowInnerHeight;

    state.nombre_generation = 4;
    updateGenerationSelectorValue(state.nombre_generation);

    updateTreeModeSelector(state.treeMode);


    // Utilisation
    const device = detectDeviceType();
    // showToast("isMobile= " + device.isMobile + " , hasTouchScreen=" + device.hasTouchScreen + ", inputType=" + device.inputType + ", Width="+ device.viewportWidth + ", Height="+ device.viewportHeight, 2000);
    
    // console.log("🌐 État initial du réseau:", navigator.onLine);
    // initNetworkListeners();

    // Initialiser la position de la carte d'animation
    if (!state.isAnimationMapInitialized) {
        initializeAnimationMapPosition();
    }
    
    if (device.hasTouchScreen || device.inputType === 'tactile') state.isTouchDevice = true;
  
    const fileInput = document.getElementById('gedFile');
    const passwordInput = document.getElementById('password');
    // toggleFullScreen();

    // for mobile phone
    nameCloudState.mobilePhone = false;
    if (Math.min(window.innerWidth, window.innerHeight) < 400 ) nameCloudState.mobilePhone = 1;
    else if (Math.min(window.innerWidth, window.innerHeight) < 600 ) nameCloudState.mobilePhone = 2;    
    
    try {
        let gedcomContent = await loadGedcomContent(fileInput, passwordInput);
        state.gedcomData = parseGEDCOM(gedcomContent);


        // IMPORTANT: Supprimer l'image de fond de la page d'accueil
        const loginBackground = document.querySelector('.login-background');
        if (loginBackground) {
            loginBackground.remove(); // Supprime complètement l'élément du DOM
        }
        // Nettoyer aussi tout autre conteneur de fond d'écran existant
        const existingBackgroundContainer = document.querySelector('.background-container');
        if (existingBackgroundContainer) {
            existingBackgroundContainer.remove();
        }

        document.getElementById('password-form').style.display = 'none';

        // Cacher le bouton paramètres de la page d'accueil
        const settingsButton = document.getElementById('load-gedcom-button');
        if (settingsButton) {
            settingsButton.style.display = 'none';
        }

        document.getElementById('tree-container').style.display = 'block';

        // Si vous souhaitez remplacer l'image par un autre fond, vous pouvez initialiser
        // un nouveau conteneur ici, sinon, commentez ou supprimez cette ligne
        // initBackgroundContainer();

        // Chargement du fichier de géolocalisation
        await loadGeolocalisationFile();

        // Dispatch un événement personnalisé
        const event = new Event('gedcomLoaded');
        document.dispatchEvent(event);

        hideMap();



        let ancestor = null;
        let cousin = null;
       if ((state.treeOwner === 5 ) || (state.treeOwner === 6)) {
            // state.targetAncestorId = "@I1152@";
            ancestor = searchRootPersonId('charlem');
            cousin = null; 
            state.targetAncestorId = ancestor.id;
        } else if (state.treeOwner === 4 ) {
            // state.targetAncestorId = "@I1152@";
            ancestor = searchRootPersonId('guillaume sez');
            cousin = null; 
            state.targetAncestorId = ancestor.id;
        } else if (state.treeOwner === 3 ) {
            // state.targetAncestorId = "@I1152@";
            ancestor = searchRootPersonId('hugues cap');
            cousin = null; 
            state.targetAncestorId = ancestor.id;
        } else if (state.treeOwner === 2 ) {
            // state.targetAncestorId = "@I1152@";
            ancestor = searchRootPersonId('guillaume ducl');
            cousin = null; 
            state.targetAncestorId = ancestor.id;
        } else if (state.treeOwner === 1 ){              
            // state.targetAncestorId = "@I739@" 
            ancestor = searchRootPersonId('alain ii goyon de matignon');  
            cousin = null; 
            state.targetAncestorId = ancestor.id;
        } else {
            ancestor = searchRootPersonId('alain ii goyon de matignon', false);  
            if (ancestor != null) {
                state.treeOwner = 1;
                state.targetAncestorId = ancestor.id;
            } 
            ancestor = searchRootPersonId('guillaume ducl', false);  
            if (ancestor != null) {
                state.treeOwner = 2;
                state.targetAncestorId = ancestor.id;
            }     

        }


        state.isRadarEnabled = false;


        updateRadarButtonText();

        state.initialTreeDisplay = true;
        console.log('\n\n\n\n ###################   CALL displayGenealogicTree in loadData ################# ')

        displayGenealogicTree(null, true, true);  // Appel avec isInit = true

        // Maintenant que l'arbre est affiché, remplacer le sélecteur de personnes racines
        setTimeout(() => {
            replaceRootPersonSelector();
        }, 500); // Petit délai pour s'assurer que tout est prêt
        
        hideLoginBackground();
            
        initializeHamburgerOnce();
        showHamburgerMenu();


        toggleFullScreen();
        
        
    } catch (error) {
        console.error('Erreur complète:', error);
        alert(error.message);
    }
}

// Pour être certain que le fond est bien supprimé, on peut aussi ajouter une règle CSS
// Vous pouvez ajouter ceci à votre fichier CSS ou l'injecter dynamiquement
function injectCustomStyle() {
    const style = document.createElement('style');
    style.textContent = `
        .tree-container-active .login-background,
        .tree-container-active .background-container {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
        }
        
        /* Pour s'assurer que le fond est blanc ou transparent */
        body.tree-view {
            background: white !important;
        }
    `;
    document.head.appendChild(style);
    
    // Ajouter la classe à body quand l'arbre est affiché
    document.addEventListener('gedcomLoaded', function() {
        document.body.classList.add('tree-view');
        document.getElementById('tree-container').classList.add('tree-container-active');
    });
}

// Appelez cette fonction au chargement de la page
window.addEventListener('load', injectCustomStyle);


/**
 * Charge le contenu du fichier GEDCOM
 * @private
 */
async function loadGedcomContent(fileInput, passwordInput) {
    if ((!passwordInput.value) && (!fileInput.files[0])) {
        if (window.CURRENT_LANGUAGE === 'fr') {
            throw new Error('Veuillez sélectionner un fichier ou entrer un mot de passe');
        } else if (window.CURRENT_LANGUAGE === 'en') {
            throw new Error('Please select a file or enter a password');
        } else if (window.CURRENT_LANGUAGE === 'es') {
            throw new Error('Por favor, seleccione un archivo o ingrese una contraseña');
        } else if (window.CURRENT_LANGUAGE === 'hu') {
            throw new Error('Kérjük, válasszon ki egy fájlt vagy adjon meg egy jelszót');
        }
    }

    if (passwordInput.value) {
        try {
            // Essayer d'abord avec arbre.enc
            const content = await loadEncryptedContent(passwordInput.value, 'arbre.enc');
            // Si succès avec arbre.enc, définir treeOwner = 1
            state.treeOwner = 1;
            console.log("Fichier arbre.enc ouvert avec succès. Owner: 1");
            return content;
        } catch (error) {
            // Si le mot de passe est incorrect pour arbre.enc, essayer avec arbreX.enc
            if (error.message === 'Mot de passe incorrect') {
                console.log("Tentative d'ouverture du fichier arbreX.enc...");
                try {
                    const content = await loadEncryptedContent(passwordInput.value, 'arbreX.enc');
                    // Si succès avec arbreX.enc, définir treeOwner = 2
                    state.treeOwner = 2;
                    console.log("Fichier arbreX.enc ouvert avec succès. Owner: 2");
                    return content;
                } catch (secondError) {
                    // Si le mot de passe est incorrect pour arbre.enc, essayer avec arbreB.enc
                    if (secondError.message === 'Mot de passe incorrect') {
                        console.log("Tentative d'ouverture du fichier arbreB.enc...");
                        try {
                            const content = await loadEncryptedContent(passwordInput.value, 'arbreB.enc');
                            // Si succès avec arbreB.enc, définir treeOwner = 3
                            state.treeOwner = 3;
                            console.log("Fichier arbreB.enc ouvert avec succès. Owner: 3");
                            return content;
                        } catch (thirdError) {

                            if (thirdError.message === 'Mot de passe incorrect') {
                                console.log("Tentative d'ouverture du fichier arbreC.enc...");
                                try {
                                    const content = await loadEncryptedContent(passwordInput.value, 'arbreC.enc');
                                    // Si succès avec arbreC.enc, définir treeOwner = 4
                                    state.treeOwner = 4;
                                    console.log("Fichier arbreC.enc ouvert avec succès. Owner: 4");
                                    return content;
                                } catch (fourthError) {

                                    if (fourthError.message === 'Mot de passe incorrect') {
                                        console.log("Tentative d'ouverture du fichier arbreG.enc...");
                                        try {
                                            const content = await loadEncryptedContent(passwordInput.value, 'arbreG.enc');
                                            // Si succès avec arbreG.enc, définir treeOwner = 5
                                            state.treeOwner = 5;
                                            console.log("Fichier arbreG.enc ouvert avec succès. Owner: 5");
                                            return content;
                                        } catch (fifthError) {


                                            if (fourthError.message === 'Mot de passe incorrect') {
                                                console.log("Tentative d'ouverture du fichier arbreLE.enc...");
                                                try {
                                                    const content = await loadEncryptedContent(passwordInput.value, 'arbreLE.enc');
                                                    // Si succès avec arbreLE.enc, définir treeOwner = 6
                                                    state.treeOwner = 6;
                                                    console.log("Fichier arbreG.enc ouvert avec succès. Owner: 6");
                                                    return content;
                                                } catch (fifthError) {
                                                    // Si le mot de passe est également incorrect pour arbreX.enc
                                                    if (window.CURRENT_LANGUAGE === 'fr') {
                                                        throw new Error('Mot de passe incorrect pour les deux fichiers');
                                                    } else if (window.CURRENT_LANGUAGE === 'en') {
                                                        throw new Error('Incorrect password for both files');
                                                    } else if (window.CURRENT_LANGUAGE === 'es') {
                                                        throw new Error('Contraseña incorrecta para ambos archivos');
                                                    } else if (window.CURRENT_LANGUAGE === 'hu') {
                                                        throw new Error('Helytelen jelszó mindkét fájlhoz');
                                                    }
                                                }
                                            }
                                        }
                                    }
                                            
                                }
                            }
                        }
                    }
                }
            } else {
                // Si c'est une autre erreur (comme un problème de réseau), la propager
                throw error;
            }
        }
    } else {
        // Pour un fichier téléchargé, définir treeOwner = 0 (ou autre valeur par défaut)
        state.treeOwner = 0;
        console.log("Fichier GEDCOM personnalisé chargé. Owner: 0");
        return await loadFileContent(fileInput.files[0]);
    }
}


/**
 * Charge le contenu crypté avec logs améliorés
 * @private
 */

async function loadEncryptedContent(password, filename) {
    debugLog(`Tentative de chargement: ${filename}`, 'info');
    debugLog(`Mode: ${state.isOnLine ? 'Connecté' : 'Non connecté'}`, state.isOnLine ? 'success' : 'warning');
    
    // Vérifier les bibliothèques essentielles avant de continuer
    try {
        if (typeof pako === 'undefined' || typeof pako.inflate !== 'function') {
            debugLog("❌ Bibliothèque 'pako' non chargée!", 'error');
        } else {
            debugLog("✓ Bibliothèque 'pako' disponible", 'success');
        }
    } catch (e) {
        debugLog("❌ Erreur lors de la vérification de pako: " + e.message, 'error');
    }
    
    let response;
    
    try {
        // Utiliser fetchResourceWithCache au lieu de fetch ou cache.match
        debugLog(`Chargement via fetchResourceWithCache...`, 'info');
        response = await fetchResourceWithCache(filename);
        debugLog(`Réponse: ${response.status} ${response.statusText}`, response.ok ? 'success' : 'error');
    } catch (fetchError) {
        debugLog(`Erreur réseau: ${fetchError.message}`, 'error');
        throw fetchError;
    }
    
    if (!response || !response.ok) {
        debugLog(`Erreur HTTP: ${response ? response.status : 'Aucune réponse'}`, 'error');
        throw new Error(`Erreur lors du chargement du fichier ${filename}: ${response ? response.statusText : 'Aucune réponse'}`);
    }
    
    try {
        const encryptedData = await response.text();
        debugLog(`Données reçues: ${encryptedData.length} caractères`, 'info');
        
        try {
            debugLog("Décodage base64...", 'info');
            const decoded = atob(encryptedData);
            debugLog(`Décodé: ${decoded.length} bytes`, 'info');
            
            debugLog("Déchiffrement...", 'info');
            const key = password.repeat(decoded.length);
            const decrypted = new Uint8Array(decoded.length);
            
            for(let i = 0; i < decoded.length; i++) {
                decrypted[i] = decoded.charCodeAt(i) ^ key.charCodeAt(i);
            }
            debugLog("Déchiffrement terminé", 'info');
            
            debugLog("Validation mot de passe...", 'info');
            await validatePassword(password, decrypted);
            debugLog("Mot de passe valide", 'info');
            
            debugLog("Décompression...", 'info');
            const result = pako.inflate(decrypted.slice(8), {to: 'string'});
            
            debugLog(`Chargement réussi: ${result.length} caractères`, 'success');
            return result;
        } catch (processError) {
            debugLog(`Erreur traitement: ${processError.message}`, 'error');
            
            if (processError.message && processError.message.includes('mot de passe')) {
                throw new Error('Mot de passe incorrect');
            } else {
                throw processError;
            }
        }
    } catch (error) {
        debugLog(`Erreur finale: ${error.message}`, 'error');
        throw error;
    }
}


/**
 * Valide le mot de passe
 * @private
 */
async function validatePassword(password, decrypted) {
    const expectedHash = decrypted.slice(0, 8);
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', passwordData);
    const actualHash = new Uint8Array(hashBuffer).slice(0, 8);
    
    if (!actualHash.every((val, i) => val === expectedHash[i])) {
        throw new Error('Mot de passe incorrect');
    }
}

/**
 * Charge le contenu du fichier
 * @private
 */
async function loadFileContent(file) {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onload = () => resolve(fileReader.result);
        fileReader.onerror = reject;
        fileReader.readAsText(file);
    });
}

/**
 * Ajoute une personne à l'historique des racines et met à jour le sélecteur
 * @param {Object} person - La personne à ajouter
 */
function addToRootHistory(person) {


    if (person.name === state.gedcomData.individuals[person.id].name) {
        console.log('-----------debug addToRootHistory OK', person.id, person.name, state.gedcomData.individuals[person.id].name);

        // Utiliser la fonction de mise à jour du sélecteur personnalisé
        // au lieu de manipuler directement le sélecteur standard
        import('./mainUI.js').then(module => {
            if (typeof module.updateRootPersonSelector === 'function') {
                module.updateRootPersonSelector(person);
            } else {
                console.warn("La fonction updateRootPersonSelector n'est pas disponible");
                // Comportement de secours en cas d'échec
                fallbackUpdateRootPersonSelector(person);
            }
        }).catch(error => {
            console.error("Erreur lors de l'import de mainUI.js:", error);
            // Comportement de secours en cas d'échec
            fallbackUpdateRootPersonSelector(person);
        });
    }
}

// Fonction de secours qui utilise le code original
function fallbackUpdateRootPersonSelector(person) {
    const rootPersonResults = document.getElementById('root-person-results');
    if (!rootPersonResults) return;
    
    // Récupérer l'historique des racines depuis le localStorage
    let rootHistory = JSON.parse(localStorage.getItem('rootPersonHistory') || '[]');
    
    // Vérifier si cette personne est déjà dans l'historique
    const existingIndex = rootHistory.findIndex(entry => entry.id === person.id);
    
    // Si la personne n'est pas dans l'historique, l'ajouter
    if (existingIndex === -1) {
        rootHistory.push({
            id: person.id,
            name: person.name.replace(/\//g, '').trim()
        });
        
        // Sauvegarder l'historique mis à jour
        localStorage.setItem('rootPersonHistory', JSON.stringify(rootHistory));
    }

    // Réinitialiser le sélecteur
    rootPersonResults.innerHTML = '';
    
    // Remplir le sélecteur avec l'historique
    rootHistory.forEach(entry => {
        const option = document.createElement('option');
        option.value = entry.id;
        option.textContent = entry.name;
        rootPersonResults.appendChild(option);
    });

    // Ajouter l'option "clear history"
    const clearOption = document.createElement('option');
    clearOption.value = 'clear-history';
    clearOption.textContent = '--- Clear History ---';
    rootPersonResults.appendChild(clearOption);

    // // Ajouter l'option "demo1"
    // const demoOption = document.createElement('option');
    // demoOption.value = 'demo1';

    
    // // Ajouter l'option "demo2"
    // const demoOption2 = document.createElement('option');
    // demoOption2.value = 'demo2';
    // if (state.treeOwner ===2 ) { 
    //     demoOption.textContent = '--- démo Clou du spectacle ---';
    //     demoOption2.textContent = '--- démo Spain ---';
    // } else { 
    //     demoOption.textContent = '--démo Costaud la Planche--';
    //     demoOption2.textContent = '--démo on descend tous de lui--'; 
    // }


    // rootPersonResults.appendChild(demoOption);
    // rootPersonResults.appendChild(demoOption2);

    // Sélectionner la personne courante
    rootPersonResults.value = person.id;
}

/**
 * Gère le changement de sélection dans le sélecteur de personnes racines
 * @param {Event} event - L'événement de changement
 */
export function handleRootPersonChange(event) {
    const selectedValue = event.target.value;
    
    if (selectedValue === 'clear-history') {
        // Vider l'historique
        localStorage.removeItem('rootPersonHistory');
        
        // Garder uniquement la racine actuelle dans l'historique
        const currentPerson = state.gedcomData.individuals[state.rootPersonId];
        let newHistory = [{
            id: currentPerson.id,
            name: currentPerson.name.replace(/\//g, '').trim()
        }];
        
        // Sauvegarder le nouvel historique
        localStorage.setItem('rootPersonHistory', JSON.stringify(newHistory));
        
        // Mettre à jour le sélecteur avec seulement la racine actuelle
        addToRootHistory(currentPerson);
        
        return;
    }

    
    console.log('\ndebug handleRootPersonChange =', selectedValue)
    
    // if ((selectedValue === 'demo1') || (selectedValue === 'demo2')) {
    if (selectedValue.includes('demo')) {
        let ancestor;
        let cousin;
        if (state.treeOwner ===2 ) {
            if (selectedValue === 'demo1'){ 
                // state.targetAncestorId = "@I1152@";
                ancestor = searchRootPersonId('guillaume du');
            } //"@I74@" } // "@I739@" } //"@I6@" } //
            else { 
                // state.targetAncestorId = "@I2179@";
                ancestor = searchRootPersonId('alonso de ');
            }
            state.targetAncestorId = ancestor.id;
        } else if (state.treeOwner ===3 ) {
            if (selectedValue === 'demo1'){ 
                // state.targetAncestorId = "@I1152@";
                ancestor = searchRootPersonId('hugues c');
            } //"@I74@" } // "@I739@" } //"@I6@" } //
            else { 
                // state.targetAncestorId = "@I2179@";
                ancestor = searchRootPersonId('hugues c ');
            }
            state.targetAncestorId = ancestor.id;
        } else if (state.treeOwner ===4 ) {
            if (selectedValue === 'demo1'){ 
                // state.targetAncestorId = "@I1152@";
                ancestor = searchRootPersonId('guillaume sez');
                cousin = null;
            } else if (selectedValue === 'demo2'){  //'On descend tous de lui'
                // state.targetAncestorId = "@I1322@"
                ancestor = searchRootPersonId('richard por');
                cousin = null; 
            } else if (selectedValue === 'demo3'){  //'On descend tous de lui'
                // state.targetAncestorId = "@I1322@"
                ancestor = searchRootPersonId('catherine tymen (le)');
                cousin = null; 
            } else { 
                // state.targetAncestorId = "@I2179@";
                ancestor = searchRootPersonId('hugues c ');
            }
            state.targetAncestorId = ancestor.id;
        } else if (state.treeOwner ===5 || state.treeOwner ===6 ) {
            if (selectedValue === 'demo1'){ 
                // state.targetAncestorId = "@I1152@";
                ancestor = searchRootPersonId('charlemagne');
            } //"@I74@" } // "@I739@" } //"@I6@" } //
            else { 
                // state.targetAncestorId = "@I2179@";
                ancestor = searchRootPersonId('charlemagne');
            }
            state.targetAncestorId = ancestor.id;
        } else {
            if (selectedValue === 'demo1'){// 'Costaud la Planche'                   
                // state.targetAncestorId = "@I739@" 
                ancestor = searchRootPersonId('alain ii goyon de matignon');  
                // ancestor = searchRootPersonId('denis a');  
                // ancestor = searchRootPersonId('noël r');  

                cousin = null;       
            } else if (selectedValue === 'demo2'){  //'On descend tous de lui'
                // state.targetAncestorId = "@I1322@"
                ancestor = searchRootPersonId('charlemagne');
                cousin = null;  
            } else if (selectedValue === 'demo3'){ // 'comme un ouragan'
                // state.targetAncestorId = "@I1322@"
                ancestor = searchRootPersonId('bertrand gouyon');
                cousin = searchRootPersonId('stephanie marie elisabeth grimaldi');
            } else if (selectedValue === 'demo4'){  //'Espace'
                // state.targetAncestorId = "@I1322@"
                ancestor = searchRootPersonId('charles lebon');
                cousin = searchRootPersonId('thomas pesquet');
            } else if (selectedValue === 'demo5'){ // 'Arabe du futur'
                ancestor = searchRootPersonId('anthoine sicot');  
                cousin = searchRootPersonId('riad sattouf');          
            } else if (selectedValue === 'demo6'){ // 'Loup du Canada'
                ancestor = searchRootPersonId('andré du matz'); 
                cousin = searchRootPersonId('pierre garand');            
            } else if (selectedValue === 'demo7'){ // "c'est normal"
                ancestor = searchRootPersonId('jan demaure');
                cousin = searchRootPersonId('brigitte fontaine');             
            } else if (selectedValue === 'demo8'){ // "les bronzés"
                ancestor = searchRootPersonId('jean mathurin monvoisin');
                cousin = searchRootPersonId('dominique lavanant');             
            } else if (selectedValue === 'demo9'){ // 'avant JC'
                ancestor = searchRootPersonId('kamber de cambrie'); 
                cousin = null;            
            } else if (selectedValue === 'demo10'){ // 'Francs'
                ancestor = searchRootPersonId('pharabert des francs'); 
                cousin = null;            
            } else if (selectedValue === 'demo11'){ // 'Capet'
                ancestor = searchRootPersonId('hugues capet'); 
                cousin = null;           
            } else {
                ancestor = searchRootPersonId('charlemagne');
                cousin = null;
            }

            console.log('\n\n TARGET ANCESTOR = ', ancestor, ", COUSIN =" , cousin)
            state.targetAncestorId = ancestor.id;
            if (cousin != null) {
                state.targetCousinId = cousin.id;
            } else {
                state.targetCousinId = null;
            }   




        }


        // typeOptions = ['démo1', 'démo2', 'démo3', 'démo4', 'démo5', 'démo6', 'démo7', 'démo8', 'démo9', 'démo10'];
        // typeValues = ['demo1', 'demo2', 'demo3', 'demo4', 'demo5', 'demo6', 'demo7', 'demo8', 'demo9', 'demo10'];
        // typeOptionsExpanded = ['Costaud la Planche', 'On descend tous de lui', 'comme un ouragan', 'Espace', 'Arabe du futur', 'Loup du Canada', "c'est normal", 'avant JC', 'Francs', 'Capet'];
  



        
        // showMap();

        // Réinitialiser l'état de l'animation avant de démarrer
        resetAnimationState();

        state.isAnimationLaunched = true;
        
        // Forcer 2 générations
        state.nombre_generation = 2;
        
        // Mettre à jour le sélecteur si disponible
        const genSelect = document.getElementById('generations');
        if (genSelect) {
            genSelect.value = '2';
        }
        
        // Mettre à jour l'état de pause
        const animationPauseBtn = document.getElementById('animationPauseBtn');
        if (animationPauseBtn && animationPauseBtn.querySelector('span')) {
            animationPauseBtn.querySelector('span').textContent = '⏸️';
        }
               
        
        // Redessiner l'arbre d'abord
        console.log('\n\n\n\n ###################   CALL displayGenealogicTree in handleRootPersonChange ################# ')

        displayGenealogicTree(null, true, false, true);
        
        // Nettoyer tous les conteneurs de fond d'écran existants
        const loginBackground = document.querySelector('.login-background');
        if (loginBackground) {
            loginBackground.remove();
        }
        const existingBackgroundContainer = document.querySelector('.background-container');
        if (existingBackgroundContainer) {
            existingBackgroundContainer.remove();
        }

        // Démarrer l'animation après un court délai
        setTimeout(() => {
            startAncestorAnimation();
        }, 500);
        
        // Mettre à jour la valeur du sélecteur si possible
        const customSelector = document.querySelector('[data-text-key="rootPersonResults"]');
        if (customSelector && typeof customSelector.value !== 'undefined') {
            customSelector.value = state.rootPersonId;
        }
        

        enforceTextTruncation();

        return;
    }
}

/**
 * Affiche l'arbre généalogique
 * @param {string} rootPersonId - ID optionnel de la personne racine
 * @param {boolean} isInit - Indique s'il s'agit de l'initialisation
 */
export function displayGenealogicTree(rootPersonId = null, isZoomRefresh = false, isInit = false, isInitDemo = false, mode = 'ancestors') {

    // Réinitialiser l'état de l'animation avant de changer l'arbre
    resetAnimationState();

    if (state.isRadarEnabled) {
        disableFortuneModeWithLever();
        enableFortuneMode();
        state.currentRadarAngle = 0;
    } else {
        disableFortuneModeWithLever();
    }

    // Si pas de rootPersonId, on utilise soit l'existant soit le plus jeune
    // let person = rootPersonId ? state.gedcomData.individuals[rootPersonId] : state.rootPersonId  ? state.gedcomData.individuals[state.rootPersonId] : findYoungestPerson();


    let person; 
    if (state.treeOwner === 6) {
        person = rootPersonId ? state.gedcomData.individuals[rootPersonId] : state.rootPersonId ? state.gedcomData.individuals[state.rootPersonId] : (isInit ? findYoungestPerson() : findYoungestPerson());
    } else if (state.treeOwner === 5) {
        person = rootPersonId ? state.gedcomData.individuals[rootPersonId] : state.rootPersonId ? state.gedcomData.individuals[state.rootPersonId] : (isInit ? (findPersonByName("giovanna san") || findYoungestPerson()) : findYoungestPerson());
    } else if (state.treeOwner === 4) {
        person = rootPersonId ? state.gedcomData.individuals[rootPersonId] : state.rootPersonId ? state.gedcomData.individuals[state.rootPersonId] : (isInit ? (findPersonByName("Nadine C") || findYoungestPerson()) : findYoungestPerson());
    } else if (state.treeOwner === 3) {
        person = rootPersonId ? state.gedcomData.individuals[rootPersonId] : state.rootPersonId ? state.gedcomData.individuals[state.rootPersonId] : (isInit ? (findPersonByName("Léon Mo") || findYoungestPerson()) : findYoungestPerson());
    } else {
        person = rootPersonId ? state.gedcomData.individuals[rootPersonId] : state.rootPersonId ? state.gedcomData.individuals[state.rootPersonId] : (isInit ? (findPersonByName("Emma A") || findYoungestPerson()) : findYoungestPerson());
    }
    // Important : toujours sauvegarder l'ID de la personne courante
    if (!state.isAnimationLaunched || (state.treeModeReal !== 'descendants' && state.treeModeReal !== 'directDescendants')) {
        state.rootPersonId = rootPersonId || person.id;
        state.rootPerson = state.gedcomData.individuals[state.rootPersonId];
    } 


    // Si c'est l'initialisation, configurer le sélecteur avec la première racine
    if (isInit) {
        const rootPersonResults = document.getElementById('root-person-results');
        rootPersonResults.innerHTML = '';
        addToRootHistory(person);
        rootPersonResults.style.display = 'block';
        rootPersonResults.style.backgroundColor = 'orange';
    } else {
        // Sinon, ajouter la nouvelle racine à l'historique
        if (!state.isAnimationLaunched || (!state.treeModeReal==='descendants'&& !state.treeModeReal==='directDescendants'))  {
         addToRootHistory(person);
        }
    }


    updateBoxWidth();

    // Construire l'arbre selon le mode
    state.treeModeReal = state.treeMode;

    if (isInitDemo && state.targetCousinId != null  && state.treeModeReal === 'ancestors' ) {
        state.treeModeReal = 'directAncestors';
    }

    // Nettoyer les contrôles existants
    cleanupExportControls();

    if (state.isAnimationLaunched && (state.treeModeReal==='descendants'|| state.treeModeReal==='directDescendants'))  {
        const tempPerson = state.gedcomData.individuals[state.targetAncestorId];
        state.currentTree =  buildDescendantTree(tempPerson.id);
    }
    else {
        if (['WheelAncestors', 'WheelDescendants'].includes(mode)) {
            console.log('🌟 Mode éventail détecté:', mode);
            // state.treeModeReal = mode;

            if (state.treeMode === 'directAncestors' || state.treeMode === 'ancestors' ) {
                state.treeMode = 'directAncestors';
                state.treeModeReal = 'directAncestors';
                state.currentTree = buildAncestorTree(person.id);
            } else {
                state.treeMode = 'directDescendants';
                state.treeModeReal = 'directDescendants';
                state.currentTree = buildDescendantTree(person.id);

            }
            updateTreeModeSelector(state.treeMode);
            state.treeModeReal_backup = state.treeModeReal;
            state.treeModeReal = mode;
            setMaxGenerationsInit(state.nombre_generation);
        } else {
            updateTreeModeSelector(state.treeMode);
            console.log('🌟 Mode arbre classique détecté:', state.treeModeReal);
            // Pour les modes 'ancestors', 'directAncestors', 'both', 'directDescendants', 'descendants'
            state.currentTree = (state.treeMode === 'directDescendants' || state.treeMode === 'descendants' )
                ? buildDescendantTree(person.id)
                : (state.treeMode === 'directAncestors' || state.treeMode === 'ancestors' )
                ? buildAncestorTree(person.id)
                : (state.treeMode === 'both')
                ? buildCombinedTree(person.id) // Pour le mode 'both'
                : buildAncestorTree(person.id);
        }
    }


    updateGenerationSelectorValue(state.nombre_generation);


    // drawTree(isZoomRefresh);
    drawTree(isZoomRefresh, false); // with WheelAncestors

    // drawWheelTree(true, false);

    // Ne pas faire resetView() en mode both
    if (state.treeModeReal !== 'both') {
        resetView();    
    }

}

window.displayGenealogicTree = displayGenealogicTree; // Exposer la fonction pour l'utiliser dans d'autres modules

/**
 * Met à jour la largeur des boîtes en fonction du nombre de prénoms
 * @private
 */
function updateBoxWidth() {
    if (typeof state.nombre_prenoms === 'string') {
        state.nombre_prenoms = parseInt(state.nombre_prenoms, 10);
    }
    if (typeof state.nombre_lettersInNames === 'string') {
        state.nombre_lettersInNames = parseInt(state.nombre_lettersInNames, 10);
    }
    // state.boxWidth = state.nombre_prenoms === 1 ? 90 : state.nombre_prenoms === 2 ? 120 : state.nombre_prenoms === 3 ? 150 : 180;

    if (state.nombre_prenoms === 1) {
        state.boxWidth = 90;
        state.nombre_lettersInNames = 11;
        state.nombre_lettersInPrenoms = 13;
    }
    else if (state.nombre_prenoms === 2) {
        state.boxWidth = 120;
        state.nombre_lettersInNames = 15;
        state.nombre_lettersInPrenoms = 18;
    }
    else if (state.nombre_prenoms === 3) {
        state.boxWidth = 150;
        state.nombre_lettersInNames = 19;
        state.nombre_lettersInPrenoms = 23;
    }
    else if (state.nombre_prenoms === 4) {
        state.boxWidth = 180;
        state.nombre_lettersInNames = 24;
        state.nombre_lettersInPrenoms = 30;
    }
    // state.boxWidth = state.nombre_lettersInNames < 11 ? 90 : state.nombre_lettersInNames <= 15 ? 120 : state.nombre_lettersInNames <= 19 ? 140 : state.nombre_lettersInNames <= 13 ? 160 : 180;
}

/**
 * Met à jour le mode d'affichage de l'arbre (ascendants/descendants)
 * et redessine l'arbre avec le nouveau mode
 * @param {string} mode - Le mode d'affichage ('ancestors' ou 'descendants')
 */
export function updateTreeMode(mode) {
    // Réinitialiser l'état de l'animation avant de changer le mode
    resetAnimationState();

    if (state.isRadarEnabled) {
        // state.treeMode = 'directAncestors';
        // mode = 'directAncestors';
        state.treeMode = mode;
        displayGenealogicTree(null, false, false,  false, 'WheelAncestors');
    } else {
        state.treeMode = mode;
        displayGenealogicTree(null, true, false);
    }

    // state.treeMode = mode;
    console.log('\n\n\n\n ###################   CALL displayGenealogicTree in updateTreeMode ################# ')

    // displayGenealogicTree(null, true, false);

    // pour mettre à jour la description
    const description = document.getElementById('treeModeDescription');
    if (description) {
        if (mode === 'directAncestors') {
            description.textContent = 'Ascendants directs';
        } else if (mode === 'ancestors') {
            description.textContent = 'Ascendants + fratrie';
        } else if (mode === 'directDescendants'){
            description.textContent = 'Descendants direct';
        } else if (mode === 'descendants') {
            description.textContent = 'Descendants + conjoints';
        } else {
            description.textContent = 'Ascendants + Descendants';
        }
    }


}

// Fonctions de gestion de la modal de paramètres
// export function openSettingsModal() {
//     const settingsModal = document.getElementById('settings-modal');
//     settingsModal.style.display = 'block';

//     // Charger la valeur actuelle
//     const currentTargetId = localStorage.getItem('targetAncestorId') || '@I741@';
//     document.getElementById('targetAncestorId').value = currentTargetId;

//     initBackgroundSelector();

// }


export function openSettingsModal() {
    // Option 1: Utiliser directement la nouvelle modal
    createEnhancedSettingsModal();
}


export function closeSettingsModal() {
    const settingsModal = document.getElementById('settings-modal');
    settingsModal.style.display = 'none';
}

export function saveTargetAncestorId() {
    const targetId = document.getElementById('targetAncestorId').value.trim();
    
    if (targetId) {
        localStorage.setItem('targetAncestorId', targetId);
        
        // Utiliser la fonction de mise à jour
        import('./treeAnimation.js').then(module => {
            module.setTargetAncestorId(targetId);
        });

        alert('ID de l\'ancêtre enregistré avec succès !');
        closeSettingsModal();
    } else {
        alert('Veuillez entrer un ID valide');
    }
}

// Fonction pour masquer la map
export function hideMap() {
    const mapContainer = document.getElementById('animation-map-container');
    if (mapContainer) {
        mapContainer.style.display = 'none';
    }
}

// Fonction pour afficher la map
// export function showMap() {
//     const mapContainer = document.getElementById('animation-map-container');
//     mapContainer.style.display = 'block';
// }







// Fonction pour afficher un message toast temporaire
export function showToast(message, duration = 2500) {
    const toast = document.getElementById('mobile-toast');
    if (toast) {
        toast.textContent = message;
        toast.style.display = 'block';

        // Masquer après le délai spécifié
        setTimeout(() => {
            toast.style.display = 'none';
        }, duration);
    }
}



// Objet pour stocker les compteurs d'actions
const actionCounters = {};
const max_count = 3;


// Ajouter les messages toast aux boutons et sélecteurs
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.controls-row-1 button, .controls-row-2 button, select, .controls-row-1 input, .controls-row-2 input').forEach(element => {
        element.addEventListener('change', function() {
            const message = this.getAttribute('data-action');
            if (message) {
                const key = this.getAttribute('data-text-key');
                if (!actionCounters[key]) {
                    actionCounters[key] = 0;
                }
                actionCounters[key]++;
                if (actionCounters[key] <= max_count) {
                    showToast(message);
                }
            }
        });

        // Pour les sélecteurs, utiliser l'événement change
        if (element.tagName === 'SELECT') {
            element.addEventListener('change', function() {
                const selectedOption = this.options[this.selectedIndex];
                const message = selectedOption.getAttribute('data-action') || this.getAttribute('data-action');
                if (message) {
                    const key = this.getAttribute('data-text-key');
                    if (!actionCounters[key]) {
                        actionCounters[key] = 0;
                    }
                    actionCounters[key]++;
                    if (actionCounters[key] <= max_count) {
                        showToast(message);
                    }
                }
            });
        }

        // Pour les champs de saisie, utiliser l'événement input
        if (element.tagName === 'INPUT') {
            element.addEventListener('input', function() {
                const message = this.getAttribute('data-action');
                if (message) {
                    const key = this.getAttribute('data-text-key');
                    if (!actionCounters[key]) {
                        actionCounters[key] = 0;
                    }
                    actionCounters[key]++;
                    if (actionCounters[key] <= max_count) {
                        showToast(message);
                    }
                }
            });
        }

        // Garder le clic pour tous
        element.addEventListener('click', function() {
            const message = this.getAttribute('data-action');
            if (message) {
                const key = this.getAttribute('data-text-key');
                if (!actionCounters[key]) {
                    actionCounters[key] = 0;
                }
                actionCounters[key]++;
                if (actionCounters[key] <= max_count) {
                    showToast(message);
                }
            }
        });
    });


    initNetworkListeners();
    console.log("🌐 État initial du réseau:", state.isOnLine, ",?:", navigator.onLine);
});



function detectInputType() {
  // Vérifie si l'appareil utilise principalement une souris
  const prefersMouse = window.matchMedia('(pointer: fine)').matches;
  
  // Vérifie si l'appareil utilise principalement un toucher
  const prefersTouch = window.matchMedia('(pointer: coarse)').matches;
  
  // Vérifie si l'appareil n'a pas de dispositif de pointage principal
  const noPointer = window.matchMedia('(pointer: none)').matches;
  
  if (prefersMouse) return "souris";
  if (prefersTouch) return "tactile";
  if (noPointer) return "sans_pointeur";
  
  // Fallback pour les navigateurs qui ne supportent pas ces media queries
  return "inconnu";
}

// ==========  fonction de détection iOS ==========
export function isIOSDevice() {
    let isIOS = /iPad|iPhone|iPod|Macintosh|Mac OS/.test(navigator.userAgent) || 
           (navigator.userAgent.includes('Mac') && 'ontouchend' in document) ||
           (/Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent));
    state.isIOS = isIOS;
    // state.isIOS = true;
    debugLog(`ℹ️  isIOS : ${state.isIOS}`, "info")
    return state.isIOS;
}


export function detectDeviceType() {
  const deviceInfo = {
    isMobile: false,
    hasTouchScreen: false,
    inputType: "inconnu",
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight
  };
  
  // Détection par user-agent
//   deviceInfo.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  deviceInfo.isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Macintosh|Mac OS/i.test(navigator.userAgent);
  
  // Détection de l'écran tactile
  deviceInfo.hasTouchScreen = ('ontouchstart' in window) || 
                              (navigator.maxTouchPoints > 0) || 
                              (navigator.msMaxTouchPoints > 0);
  
  state.isMobile = deviceInfo.isMobile;
  debugLog(`ℹ️  isMobile : ${state.isMobile}`, "info")
  state.isIOS = isIOSDevice();

  // Détection du type d'entrée principal
  if (window.matchMedia) {
    if (window.matchMedia('(pointer: fine)').matches) {
      deviceInfo.inputType = "souris";
    } else if (window.matchMedia('(pointer: coarse)').matches) {
      deviceInfo.inputType = "tactile";
    }
  }
  
  
  
  // // Utilisation
  // if (hasTouchScreen()) {
  //   console.log("Écran tactile détecté");
  // } else {
  //   console.log("Pas d'écran tactile détecté");
  // }

  
  
  // // Utilisation
  // console.log(`Type d'entrée principal: ${detectInputType()}`);


  
  return deviceInfo;
}



// Exposer la fonction et le compteur globalement
window.showToast = showToast;
window.actionCounters = actionCounters;
// window.displayGenealogicTree = displayGenealogicTree;



// Export des variables et fonctions nécessaires
export {
    openGedcomModal,
    closeGedcomModal,
    displayPersonDetails,
    closePersonDetails,
    setAsRootPerson,
    closeModal,
    updatePrenoms,
    updateLettersInNames,
    updateGenerations,
    zoomIn,
    zoomOut,
    resetZoom,
    searchTree
};



window.addEventListener('load', initialize);





//  fonction searchRootPerson pour utiliser findPersonsByName :
export function searchRootPersonId(searchStr, isAlert = true) {

    // searchStr = searchStr.value.toLowerCase();

    if (!searchStr) return;

    // Utiliser la nouvelle fonction findPersonsByName

    
    const matchedPerson = findPersonByName(searchStr);



    if (matchedPerson) {
        // Convertir les personnes trouvées au format d'options pour le sélecteur personnalisé
        // const options = matchedPersons.map(person => ({
        //     value: person.id,
        //     label: person.name.replace(/\//g, '').trim()
        // }));

        console.log('\n\n DEBUG search persone for demo ***********',matchedPerson)
        return matchedPerson;
        

    } else if (isAlert) {
        alert('Aucune personne trouvée');
        return null;
    }
}


// Gestionnaire des paramètres avec support multi-langues
// Fonction pour réinitialiser les paramètres
export function resetToDefaultSettings() {
    // Obtenir les textes traduits
    const getText = (key) => window.i18n ? window.i18n.getText(key) : key;
    
    // Message de confirmation multilingue
    const confirmMessage = `${getText('confirmResetSettings')}\n\n${getText('resetWillDo')}:\n• ${getText('deletePrefs')}\n• ${getText('resetLang')}\n• ${getText('clearCustomSettings')}\n\n(${getText('cacheWillBeKept')})`;
    
    if (confirm(confirmMessage)) {
        try {
            // Sauvegarder la langue actuelle si on veut la conserver
            // const currentLang = localStorage.getItem('preferredLanguage');
            
            // Vider tout le localStorage
            localStorage.clear();
            
            // Optionnel : remettre la langue (décommentez si vous voulez garder la langue)
            // if (currentLang) {
            //     localStorage.setItem('preferredLanguage', currentLang);
            // }
            
            console.log('Paramètres remis à zéro');
            
            // Afficher un message de confirmation multilingue
            alert(`${getText('resetSuccess')}\n\n${getText('pageWillReload')}`);
            
            // Recharger la page pour appliquer les changements
            window.location.reload();
            
        } catch (error) {
            console.error('Erreur lors de la réinitialisation:', error);
            alert(getText('resetError'));
        }
    }
}

// Exposer la fonction globalement
// window.resetToDefaultSettings = resetToDefaultSettings;

// Fonction pour initialiser les paramètres au chargement
function initializeSettings() {
    console.log('[Settings Manager] Initialisé');
}

// Initialiser au chargement du DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSettings);
} else {
    initializeSettings();
}

// Export pour les modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { resetToDefaultSettings };
}




/**
 * Gestion des erreurs
 */
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    // Ajouter des styles d'erreur
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc3545;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    
    document.body.appendChild(errorDiv);
    
    // Supprimer après 5 secondes
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}


/**
 * Configuration par défaut à adapter selon vos besoins
 */
// export const WheelConfig = {
//     defaultMode: 'WheelAncestors',
//     maxGenerations: 5,
//     enableAnimations: true,
//     exportFormat: 'png',
//     exportQuality: 1.0
// };

// Exemple d'utilisation :
// displayPersonTree('PERSON_ID', 'WheelAncestors');
// switchTreeMode('WheelDescendants');
// exportToPDF();


function positionRadarButton() {
    const cloudButton = document.getElementById('cloudBtn');
    const radarButton = document.getElementById('radarBtn');
    
    if (cloudButton && radarButton) {
        const cloudRect = cloudButton.getBoundingClientRect();
        radarButton.style.position = 'fixed';
        radarButton.style.left = cloudRect.left + 'px';
        radarButton.style.top = (cloudRect.bottom + 5) + 'px';
        radarButton.style.zIndex = '1001';
    }
}

// Nouvelle fonction pour l'overlay
function createAndPositionRadarOverlay() {
    // Trouver les boutons
    const cloudButton = document.getElementById('cloudBtn');
    const radarButton = document.getElementById('radarBtn');
    
    // Vérifier que les boutons existent
    if (!cloudButton || !radarButton) return;
    
    // Récupérer les dimensions du bouton cloud
    const cloudRect = cloudButton.getBoundingClientRect();
    
    // Créer l'overlay s'il n'existe pas déjà
    let overlay = document.getElementById('radarBtn-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'radarBtn-overlay';
        overlay.style.position = 'fixed';
        overlay.style.backgroundColor = 'transparent';
        overlay.style.zIndex = '1002'; // Un peu plus haut que le bouton
        overlay.style.cursor = 'pointer';
        
        // Quand on clique sur l'overlay, on déclenche le clic du bouton radar
        overlay.addEventListener('click', () => {
            radarButton.click();
        });
        
        // Ajouter l'overlay au body
        document.body.appendChild(overlay);
    }
    
    // Positionner l'overlay
    overlay.style.top = `${cloudRect.bottom + 5}px`;
    overlay.style.left = `${cloudRect.left}px`;
    overlay.style.width = `${radarButton.offsetWidth}px`;
    overlay.style.height = `${radarButton.offsetHeight}px`;
}

function createAndPositionHeatMapOverlay() {
    const heatMapBtn = document.getElementById('heatMapBtn');
    if (!heatMapBtn) return;

    let overlay = document.getElementById('heatMapBtn-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'heatMapBtn-overlay';
        overlay.style.position = 'fixed';
        overlay.style.backgroundColor = 'transparent';
        overlay.style.zIndex = '1002';
        overlay.style.cursor = 'pointer';
        overlay.addEventListener('click', () => {
            heatMapBtn.click();
        });
        document.body.appendChild(overlay);
    }

    const rect = heatMapBtn.getBoundingClientRect();
    overlay.style.top = `${rect.top - 10}px`;
    overlay.style.left = `${rect.left - 10}px`;
    overlay.style.width = `${rect.width + 20}px`;
    overlay.style.height = `${rect.height + 20}px`;
}

function positionHeatMapButton() {
    // const settingsBtn = document.getElementById('settingsBtn');
    const heatMapBtn = document.getElementById('heatMapBtn');
    
    if (settingsBtn && heatMapBtn) {
        const settingRect = settingsBtn.getBoundingClientRect();
        heatMapBtn.style.position = 'fixed';
        heatMapBtn.style.left = (settingRect.left - 1)+ 'px';
        heatMapBtn.style.top = (settingRect.bottom + 5) + 'px';
        heatMapBtn.style.zIndex = '1001';
    }
}

// Modifier vos écouteurs existants
document.addEventListener('DOMContentLoaded', () => {
    positionRadarButton();
    positionHeatMapButton();
    createAndPositionRadarOverlay();
    createAndPositionHeatMapOverlay();
});

window.addEventListener('resize', () => {
    positionRadarButton();
    positionHeatMapButton();
    createAndPositionRadarOverlay();
    createAndPositionHeatMapOverlay();
});
