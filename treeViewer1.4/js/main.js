// ====================================
// Configuration et initialisation
// ====================================
import { parseGEDCOM } from './gedcomParser.js';
import { drawTree } from './treeRenderer.js';
import { findYoungestPerson } from './utils.js';
import { initBackgroundContainer } from './backgroundManager.js';
import { buildAncestorTree, buildDescendantTree, buildCombinedTree } from './treeOperations.js';
import { startAncestorAnimation, toggleAnimationPause, resetAnimationState  } from './treeAnimation.js';
import { geocodeLocation, loadGeolocalisationFile } from './geoLocalisation.js';
import { nameCloudState } from './nameCloud.js';
import { initializeCustomSelectors, replaceRootPersonSelector, enforceTextTruncation  } from './mainUI.js'; 
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
    rootPerson: null,
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
    isAnimationLaunched: false,
    targetAncestorId: "@I739@",
    animationTargetAncestorId: "@I739@",
    animationRootPersonId: '@I1@',

    treeOwner: 1
};

export { geocodeLocation };

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
     // Initialiser le sélecteur de générations standard d'abord
    // (nécessaire pour sa création avant de le remplacer)
    initializeGenerationSelect();
    
    // Initialiser les gestionnaires d'événements
    initializeEventHandlers();
    
    // Initialiser les sélecteurs personnalisés (remplace les sélecteurs standards)
    initializeCustomSelectors();


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
 * Charge les données GEDCOM et configure l'affichage de l'arbre
 */
export async function loadData() {
    const fileInput = document.getElementById('gedFile');
    const passwordInput = document.getElementById('password');
    toggleFullScreen();

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

        displayGenealogicTree(null, true, true);  // Appel avec isInit = true

        // Maintenant que l'arbre est affiché, remplacer le sélecteur de personnes racines
        setTimeout(() => {
            replaceRootPersonSelector();
        }, 500); // Petit délai pour s'assurer que tout est prêt
        
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
        throw new Error('Veuillez sélectionner un fichier ou entrer un mot de passe');
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
                    // Si le mot de passe est également incorrect pour arbreX.enc
                    throw new Error('Mot de passe incorrect pour les deux fichiers');
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
 * Charge le contenu crypté
 * @private
 */
async function loadEncryptedContent(password, filename) {
    const response = await fetch(filename);
    
    if (!response.ok) {
        throw new Error(`Erreur lors du chargement du fichier ${filename}: ${response.statusText}`);
    }
    
    const encryptedData = await response.text();
    const decoded = atob(encryptedData);
    
    const key = password.repeat(decoded.length);
    const decrypted = new Uint8Array(decoded.length);
    
    for(let i = 0; i < decoded.length; i++) {
        decrypted[i] = decoded.charCodeAt(i) ^ key.charCodeAt(i);
    }
    
    // Valider le mot de passe
    await validatePassword(password, decrypted);
    
    // Si la validation réussit, décompresser et retourner les données
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

    // Ajouter l'option "demo1"
    const demoOption = document.createElement('option');
    demoOption.value = 'demo1';

    
    // Ajouter l'option "demo2"
    const demoOption2 = document.createElement('option');
    demoOption2.value = 'demo2';
    if (state.treeOwner ===2 ) { 
        demoOption.textContent = '--- démo Clou du spectacle ---';
        demoOption2.textContent = '--- démo Spain ---';
    } else { 
        demoOption.textContent = '--démo Costaud la Planche--';
        demoOption2.textContent = '--démo on descend tous de lui--'; 
    }


    rootPersonResults.appendChild(demoOption);
    rootPersonResults.appendChild(demoOption2);

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
        
        if (state.treeOwner ===2 ) {
            if (selectedValue === 'demo1'){ state.targetAncestorId = "@I1152@"} //"@I74@" } // "@I739@" } //"@I6@" } //
            else { state.targetAncestorId = "@I2179@"}
        } else {
            if (selectedValue === 'demo1'){ state.targetAncestorId = "@I739@" } //"@I6@" } //
            else { state.targetAncestorId = "@I1322@"}
        }

        
        showMap();

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
export function displayGenealogicTree(rootPersonId = null, isZoomRefresh = false, isInit = false) {

    // Réinitialiser l'état de l'animation avant de changer l'arbre
    resetAnimationState();

    // Si pas de rootPersonId, on utilise soit l'existant soit le plus jeune
    let person = rootPersonId ? state.gedcomData.individuals[rootPersonId] : state.rootPersonId  ? state.gedcomData.individuals[state.rootPersonId] : findYoungestPerson();



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


    if (state.isAnimationLaunched && (state.treeModeReal==='descendants'|| state.treeModeReal==='directDescendants'))  {
        const tempPerson = state.gedcomData.individuals[state.targetAncestorId];
        state.currentTree =  buildDescendantTree(tempPerson.id);
    }
    else {

        state.currentTree = (state.treeMode === 'directDescendants' || state.treeMode === 'descendants' )
            ? buildDescendantTree(person.id)
            : (state.treeMode === 'directAncestors' || state.treeMode === 'ancestors' )
            ? buildAncestorTree(person.id)
            : buildCombinedTree(person.id); // Pour le mode 'both'
    }


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
});



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