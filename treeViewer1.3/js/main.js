// ====================================
// Configuration et initialisation
// ====================================
import { parseGEDCOM } from './gedcomParser.js';
import { drawTree } from './treeRenderer.js';
import { findYoungestPerson } from './utils.js';
import { initBackgroundContainer } from './backgroundManager.js';
import { buildAncestorTree, buildDescendantTree, buildCombinedTree } from './treeOperations.js';
import { startAncestorAnimation, toggleAnimationPause, resetAnimationState  } from './treeAnimation.js';
import { geocodeLocation, validateLocations, loadGeolocalisationFile } from './geoLocalisation.js';
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

export const state = {
    gedcomData: null,
    rootPersonId: null,
    currentTree: null,
    nombre_prenoms: 2,
    nombre_lettersInPrenoms: 20,
    nombre_lettersInNames: 15,
    nombre_generation: 6,
    boxWidth: 150,
    boxHeight: 50,
    treeMode: 'ancestors', // ou 'descendants' ou 'both'
    treeModeReal: 'ancestors', // ou 'descendants' ou 'both'
    lastHorizontalPosition: 0,
    lastVerticalPosition: 0,
    isSpeechEnabled: true,
    isAnimationPaused: false,
    targetAncestorId: "@I741@"
};

export { geocodeLocation, validateLocations };

window.toggleAnimationPause = toggleAnimationPause;


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
        });
    });
}

// Fonction pour basculer le son
export function toggleSpeech() {
    const speechToggleBtn = document.getElementById('speechToggleBtn');
    
    // Basculer l'état du son
    state.isSpeechEnabled = !state.isSpeechEnabled;
    
    // Mettre à jour le bouton
    speechToggleBtn.querySelector('span').textContent = state.isSpeechEnabled ? '🔇' : '🔊';
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
    initializeGenerationSelect();
    initializeEventHandlers();

    // Ajouter l'événement pour soumettre le formulaire avec Enter
    document.addEventListener('DOMContentLoaded', function() {
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('keypress', function(event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    loadData();
                }
            });
        }
    });

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

/**
 * Charge les données GEDCOM
 */
export async function loadData() {
    const fileInput = document.getElementById('gedFile');
    const passwordInput = document.getElementById('password');
    toggleFullScreen();
    
    try {
        let gedcomContent = await loadGedcomContent(fileInput, passwordInput);
        state.gedcomData = parseGEDCOM(gedcomContent);
        

        // // Nettoyer tous les conteneurs de fond d'écran existants
        // const loginBackground = document.querySelector('.login-background');
        // if (loginBackground) {
        //     loginBackground.remove();
        // }
        // const existingBackgroundContainer = document.querySelector('.background-container');
        // if (existingBackgroundContainer) {
        //     existingBackgroundContainer.remove();
        // }



        document.getElementById('password-form').style.display = 'none';

        // Cacher le bouton paramètres de la page d'accueil
        const settingsButton = document.getElementById('load-gedcom-button');
        if (settingsButton) {
            settingsButton.style.display = 'none';
        }

        document.getElementById('tree-container').style.display = 'block';

        // Initialiser le conteneur de fond d'écran
        initBackgroundContainer();


        // Chargement du fichier de géolocalisation
        await loadGeolocalisationFile();


        // Dispatch un événement personnalisé
        const event = new Event('gedcomLoaded');
        document.dispatchEvent(event);


        hideMap();

        displayGenealogicTree(null, true, true);  // Appel avec isInit = true
    } catch (error) {
        console.error('Erreur complète:', error);
        alert(error.message);
    }
}

/**
 * Charge le contenu du fichier GEDCOM
 * @private
 */
async function loadGedcomContent(fileInput, passwordInput) {
    if ((!passwordInput.value) && (!fileInput.files[0])) {
        throw new Error('Veuillez sélectionner un fichier');
    }

    if (passwordInput.value) {
        return await loadEncryptedContent(passwordInput.value);
    } else {
        return await loadFileContent(fileInput.files[0]);
    }
}

/**
 * Charge le contenu crypté
 * @private
 */
async function loadEncryptedContent(password) {
    const response = await fetch('arbre.enc');
    const encryptedData = await response.text();
    const decoded = atob(encryptedData);
    
    const key = password.repeat(decoded.length);
    const decrypted = new Uint8Array(decoded.length);
    
    for(let i = 0; i < decoded.length; i++) {
        decrypted[i] = decoded.charCodeAt(i) ^ key.charCodeAt(i);
    }
    
    validatePassword(password, decrypted);
    
    return pako.inflate(decrypted.slice(8), {to: 'string'});
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
    const rootPersonResults = document.getElementById('root-person-results');
    
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



    // Ajouter l'option "demo1"
    const demoOption = document.createElement('option');
    demoOption.value = 'demo1';
    demoOption.textContent = '--- Demo1 ---';
    rootPersonResults.appendChild(demoOption);
    
    // Ajouter l'option "demo2"
    const demoOption2 = document.createElement('option');
    demoOption2.value = 'demo2';
    demoOption2.textContent = '--- Demo2 ---';
    rootPersonResults.appendChild(demoOption2);

    // // Ajouter l'option "heatMap1"
    // const heatMapOption = document.createElement('option');
    // heatMapOption.value = 'heatMap1';
    // heatMapOption.textContent = '--- heatMap1 ---';
    // rootPersonResults.appendChild(heatMapOption);
    
    // // Ajouter l'option "demo2"
    // const heatMapOption2 = document.createElement('option');
    // heatMapOption2.value = 'heatMap2';
    // heatMapOption2.textContent = '--- heatMap2 ---';
    // rootPersonResults.appendChild(heatMapOption2);



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

    if ((selectedValue === 'demo1') || (selectedValue === 'demo2')) {
        
        if (selectedValue === 'demo1'){ state.targetAncestorId = "@I741@" } //"@I6@" } //
        else { state.targetAncestorId = "@I1327@"}
        
        showMap();

        // Réinitialiser l'état de l'animation avant de démarrer
        resetAnimationState();
        
        // Forcer 2 générations
        state.nombre_generation = 2;
        document.getElementById('generations').value = '2';
        
        // Mettre à jour l'état de pause
        const animationPauseBtn = document.getElementById('animationPauseBtn');
        animationPauseBtn.querySelector('span').textContent = '⏸️';
        
        // Redessiner l'arbre d'abord
        displayGenealogicTree(null, true, false);
        


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
        
        event.target.value = state.rootPersonId;
        return;
    }


}

/**
 * Affiche l'arbre généalogique
 * @param {string} rootPersonId - ID optionnel de la personne racine
 * @param {boolean} isInit - Indique s'il s'agit de l'initialisation
 */
export function displayGenealogicTree(rootPersonId = null, isZoomRefresh = false, isInit = false) {

    // Réinitialiser l'état de l'animation avant de changer l'arbre
    resetAnimationState();

    // Si pas de rootPersonId, on utilise soit l'existant soit le plus jeune
    const person = rootPersonId 
        ? state.gedcomData.individuals[rootPersonId]
        : state.rootPersonId 
            ? state.gedcomData.individuals[state.rootPersonId]
            : findYoungestPerson();

    // Important : toujours sauvegarder l'ID de la personne courante
    state.rootPersonId = rootPersonId || person.id;

    // Si c'est l'initialisation, configurer le sélecteur avec la première racine
    if (isInit) {
        const rootPersonResults = document.getElementById('root-person-results');
        rootPersonResults.innerHTML = '';
        addToRootHistory(person);
        rootPersonResults.style.display = 'block';
        rootPersonResults.style.backgroundColor = 'orange';
    } else {
        // Sinon, ajouter la nouvelle racine à l'historique
        addToRootHistory(person);
    }


    updateBoxWidth();
    
    // Construire l'arbre selon le mode
    state.treeModeReal = state.treeMode;
    state.currentTree = state.treeMode === 'descendants' 
        ? buildDescendantTree(person.id)
        : state.treeMode === 'ancestors'
        ? buildAncestorTree(person.id)
        : buildCombinedTree(person.id); // Pour le mode 'both'



    drawTree(isZoomRefresh);

    // Ne pas faire resetView() en mode both
    if (state.treeModeReal !== 'both') {
        resetView();    
    }

}

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
    state.treeMode = mode;
    displayGenealogicTree(null, true, false);
}

// Fonctions de gestion de la modal de paramètres
export function openSettingsModal() {
    const settingsModal = document.getElementById('settings-modal');
    settingsModal.style.display = 'block';

    // Charger la valeur actuelle
    const currentTargetId = localStorage.getItem('targetAncestorId') || '@I741@';
    document.getElementById('targetAncestorId').value = currentTargetId;





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
    mapContainer.style.display = 'none';
}

// Fonction pour afficher la map
export function showMap() {
    const mapContainer = document.getElementById('animation-map-container');
    mapContainer.style.display = 'block';
}

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