
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
    toggleTreeRadar,
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
    toggleFullScreen,
    resetToDefaultSettings,
    displayGenealogicTree,
} from './main.js';

import {
    statsModal
} from './statsModalUI.js';

import { 
    startAncestorAnimation,
    toggleAnimationPause 
} from './treeAnimation.js';
import {
    initBackgroundContainer
} from './backgroundManager.js';
import { 
    displayHeatMap 
} from './geoHeatMapUI.js';
import {
    buttonsOnDisplay
} from './mainUI.js'

import { toggleTreeRadarFromHamburger } from './hamburgerMenu.js';



// import { changeLanguage } from './i18n.js';

// ===== GESTION DU CHARGEMENT D'IMAGE DE FOND =====

// Fonction pour charger l'image de fond depuis le cache
async function loadBackgroundImageFromCache() {
    console.log('[Background Loader] Tentative de chargement depuis le cache...');
    
    try {
        // Vérifier si les caches sont disponibles
        if ('caches' in window) {
            // Obtenir la liste de TOUS les caches disponibles
            const cacheNames = await caches.keys();
            console.log('[Background Loader] Caches disponibles:', cacheNames);
            
            // Chercher l'image dans chaque cache
            for (const cacheName of cacheNames) {
                try {
                    const cache = await caches.open(cacheName);
                    // const cachedResponse = await cache.match('background_images/fort_lalatte.jpg');
                    // const cachedResponse = await cache.match('background_images/lichen-red.jpg');   
                    // const cachedResponse = await cache.match('background_images/bois.jpg');                    
                    const cachedResponse = await cache.match('background_images/tree-log.jpg');  
                    if (cachedResponse) {
                        // Image trouvée dans ce cache !
                        const blob = await cachedResponse.blob();
                        const imageUrl = URL.createObjectURL(blob);
                        
                        console.log(`[Background Loader] Image trouvée dans le cache "${cacheName}", création de l'URL blob`);
                        
                        // Trouver l'image dans le DOM et la mettre à jour
                        const existingImage = document.querySelector('.login-background-image');
                        if (existingImage) {
                            existingImage.src = imageUrl;
                            console.log('[Background Loader] Image de fond mise à jour avec l\'URL du cache');
                            return true;
                        }
                    }
                } catch (error) {
                    console.warn(`[Background Loader] Erreur avec le cache "${cacheName}":`, error);
                    // Continuer avec le cache suivant
                }
            }
            
            console.log('[Background Loader] Image non trouvée dans aucun cache');
        } else {
            console.log('[Background Loader] Cache API non disponible');
        }
        
    } catch (error) {
        console.error('[Background Loader] Erreur lors de l\'accès aux caches:', error);
    }
    
    // Fallback : charger l'image normalement
    console.log('[Background Loader] Fallback - chargement normal de l\'image');
    const existingImage = document.querySelector('.login-background-image');
    if (existingImage) {
        // existingImage.src = 'background_images/fort_lalatte.jpg';
        // existingImage.src = 'background_images/lichen-red.jpg';
        // existingImage.src = 'background_images/bois.jpg';
        existingImage.src = 'background_images/tree-log.jpg';
        console.log('[Background Loader] Image chargée avec URL normale');
        return true;
    }
    
    return false;
}

// Fonction qui essaie de charger l'image avec plusieurs tentatives
async function attemptBackgroundLoad() {
    console.log('[Background Loader] Démarrage du chargement de l\'image de fond...');
    
    // Tentative 1 : Immédiatement
    let success = await loadBackgroundImageFromCache();
    
    if (!success) {
        console.log('[Background Loader] Première tentative échouée, nouvel essai dans 1s...');
        
        // Tentative 2 : Après 1 seconde
        setTimeout(async () => {
            success = await loadBackgroundImageFromCache();
            
            if (!success) {
                console.log('[Background Loader] Deuxième tentative échouée, dernier essai dans 3s...');
                
                // Tentative 3 : Après 3 secondes
                setTimeout(async () => {
                    await loadBackgroundImageFromCache();
                }, 3000);
            }
        }, 1000);
    }
}

// Fonctions de debug pour l'image de fond
function setupBackgroundDebugFunctions() {
    // Fonction pour forcer le rechargement (pour debug)
    window.reloadBackgroundImage = attemptBackgroundLoad;

    // Fonction pour voir tous les caches et leur contenu (pour debug)
    window.listAllCaches = async function() {
        try {
            const cacheNames = await caches.keys();
            console.log('=== LISTE DE TOUS LES CACHES ===');
            
            for (const cacheName of cacheNames) {
                const cache = await caches.open(cacheName);
                // const hasImage = await cache.match('background_images/fort_lalatte.jpg');
                // const hasImage = await cache.match('background_images/lichen-red.jpg');
                // const hasImage = await cache.match('background_images/bois.jpg');
                const hasImage = await cache.match('background_images/tree-log.jpg');                
                console.log(`📦 ${cacheName}: ${hasImage ? '✅ HAS IMAGE' : '❌ no image'}`);
            }
        } catch (error) {
            console.error('Erreur lors de la liste des caches:', error);
        }
    };
}

// ===== FONCTIONS PRINCIPALES D'INITIALISATION =====

// Fonction d'initialisation qui rend les fonctions disponibles globalement
function initializeAppFunctions() {
    // Rendre les fonctions disponibles globalement
    window.displayGenealogicTree = displayGenealogicTree;
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
    window.displayHeatMap = displayHeatMap;
    window.toggleTreeRadar = toggleTreeRadar;
    window.toggleTreeRadarFromHamburger = toggleTreeRadarFromHamburger;
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
    window.resetToDefaultSettings = resetToDefaultSettings;
    window.statsModal = statsModal;
    window.buttonsOnDisplay = buttonsOnDisplay;
    // window.changeLanguage = changeLanguage;
    window.startAnimation = () => {
        startAncestorAnimation().catch(console.error);
    };
}

// Initialise les écouteurs d'événements
function initializeEventListeners() {
    document.addEventListener('DOMContentLoaded', () => {
        const loadDataButton = document.getElementById('loadDataButton');
        if (loadDataButton) {
            loadDataButton.addEventListener('click', () => {

                window.scrollTo({
                    top: 50,
                    behavior: 'smooth'
                });

                // Optionnel : reviens en haut après un petit délai
                // setTimeout(() => window.scrollTo(0, 0), 400);

                setTimeout(() => console.log('debug'), 200);

                loadData();
            });
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

// Initialiser le chargement d'image de fond
function initializeBackgroundLoader() {
    // Configurer les fonctions de debug
    setupBackgroundDebugFunctions();
    
    // Lancer le chargement de l'image de fond
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attemptBackgroundLoad);
    } else {
        attemptBackgroundLoad();
    }
    
    console.log('[App Initializer] Chargeur d\'image de fond configuré');
}

// Fonction principale d'initialisation
function initialize() {
    initializeAppFunctions();
    initializeEventListeners();
    initializeBackgroundLoader();
        
    // Vous pouvez ajouter d'autres initialisations ici si nécessaire
    console.log("App Initializer V1.7: fonctions, écouteurs d'événements et chargeur d'image configurés");
}

// Exécuter l'initialisation
initialize();

// Exporter les fonctions si nécessaire
export {
    initialize,
    initializeAppFunctions,
    initializeEventListeners,
    initializeBackgroundLoader,
    attemptBackgroundLoad
};