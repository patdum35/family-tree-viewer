// Importation des fonctions depuis les différents modules
import { processNamesCloudWithDate } from './nameCloud.js';
import { 
    openGedcomModal,
    closeGedcomModal,
    loadData, 
    updatePrenoms, 
    updateLettersInNames, 
    updateGenerations, 
    zoomIn, 
    zoomOut, 
    resetZoom,
    toggleSpeech,
    toggleSpeech2,
    searchTree,
    displayPersonDetails,
    closePersonDetails,
    setAsRootPerson,
    updateTreeMode,
    handleRootPersonChange,
    openSettingsModal,
    closeSettingsModal,
    saveTargetAncestorId,
    toggleFullScreen
} from './main.js';
import { 
    startAncestorAnimation,
    toggleAnimationPause 
} from './treeAnimation.js';
import {
    initBackgroundContainer
} from './backgroundManager.js';

// Fonction d'initialisation qui rend les fonctions disponibles globalement
function initializeAppFunctions() {
    // Rendre les fonctions disponibles globalement
    window.processNamesCloudWithDate = processNamesCloudWithDate;
    window.openGedcomModal = openGedcomModal;
    window.closeGedcomModal = closeGedcomModal;
    window.loadData = loadData;
    window.updatePrenoms = updatePrenoms;
    window.updateLettersInNames = updateLettersInNames;
    window.updateGenerations = updateGenerations;
    window.zoomIn = zoomIn;
    window.zoomOut = zoomOut;
    window.resetZoom = resetZoom;
    window.toggleSpeech = toggleSpeech;
    window.toggleSpeech2 = toggleSpeech2;
    window.toggleAnimationPause = toggleAnimationPause;
    window.searchTree = searchTree;
    window.displayPersonDetails = displayPersonDetails;
    window.closePersonDetails = closePersonDetails;
    window.setAsRootPerson = setAsRootPerson; 
    window.updateTreeMode = updateTreeMode; 
    window.handleRootPersonChange = handleRootPersonChange;
    window.openSettingsModal = openSettingsModal;
    window.closeSettingsModal = closeSettingsModal;
    window.saveTargetAncestorId = saveTargetAncestorId;
    window.initBackgroundContainer = initBackgroundContainer;
    window.toggleFullScreen = toggleFullScreen;
    window.startAnimation = () => {
        startAncestorAnimation().catch(console.error);
    };
}

// Initialise les écouteurs d'événements
function initializeEventListeners() {
    document.addEventListener('DOMContentLoaded', () => {
        const loadDataButton = document.getElementById('loadDataButton');
        if (loadDataButton) {
            loadDataButton.addEventListener('click', loadData);
        } else {
            console.warn("Élément 'loadDataButton' non trouvé");
        }
        
        const rootPersonResults = document.getElementById('root-person-results');
        if (rootPersonResults) {
            rootPersonResults.addEventListener('change', handleRootPersonChange);
        } else {
            console.warn("Élément 'root-person-results' non trouvé");
        }
    });
}

// Fonction principale d'initialisation
function initialize() {
    initializeAppFunctions();
    initializeEventListeners();
    
    // Vous pouvez ajouter d'autres initialisations ici si nécessaire
    console.log("App Initializer: fonctions et écouteurs d'événements configurés");
}

// Exécuter l'initialisation
initialize();

// Exporter les fonctions si nécessaire
export {
    initialize,
    initializeAppFunctions,
    initializeEventListeners
};