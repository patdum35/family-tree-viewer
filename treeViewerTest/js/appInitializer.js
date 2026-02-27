
// Importation des fonctions depuis les différents modules
// const { initResourcePreloading } = await import('./resourcePreloader.js');
const getInitTilePreloader = async () => {
    const { initTilePreloading } = await import('./mapTilesPreloader.js');
    return initTilePreloading;
};

const getInitResourcePreloading = async () => {
    const { initResourcePreloading } = await import('./resourcePreloader.js');
    return initResourcePreloading;
};


// async function loadAndCache(path, functionName) {
//     // 1. On importe le module
//     const module = await import(path);
//     // 2. On l'ajoute manuellement au Cache Storage pour la prochaine fois (Offline)
//     if ('caches' in window) {
//         const cache = await caches.open(CACHE_NAME); // Remplace par ton nom de cache exact
//         cache.add(path); 
//     }
//     return module[functionName];
// }

// function prepareLazyModules() {
//     // Bouton documentation
//     document.getElementById('help-button')?.addEventListener('click', async () => {
//         const documentation = await loadAndCache('./documentation.js', 'documentation');
//         documentation();
//     });

//     // Bouton statsModal
//     document.getElementById('statsBtn')?.addEventListener('click', async () => {
//         const statsModal = await loadAndCache('./statsModalUI.js', 'statsModal');
//         statsModal();
//     });

//     // Bouton Caméra
//     document.getElementById('openCameraModalBtn')?.addEventListener('click', async () => {
//         // const { openCameraModal } = await import('./cameraManager.js');
//         const openCameraModal = await loadAndCache('./cameraManager.js', 'openCameraModal');
//         openCameraModal();
//     });

//     // Bouton Accéléromeètre
//     document.getElementById('activateAccelerometerBtn')?.addEventListener('click', async () => {
//         const toggleAccelerometer = await loadAndCache('./accelerometer.js', 'toggleAccelerometer');
//         toggleAccelerometer();
//     });

//     // Bouton heatmap
//     document.getElementById('heatMapBtn')?.addEventListener('click', async () => {
//         const displayHeatMap = await loadAndCache('./geoHeatMapUI.js', 'displayHeatMap');
//         displayHeatMap();
//     }); 
    
//     // Bouton geolocalisation
//     document.getElementById('generateGeocodeFileBtn')?.addEventListener('click', async () => {
//         const generateGeocodeFile = await loadAndCache('./geolocalisation.js', 'generateGeocodeFile');
//         generateGeocodeFile();
//     });
    
//     //bouton activateDebugLogsBtn
//     document.getElementById('activateDebugLogsBtn')?.addEventListener('click', async () => {
//         const activateDebugLogs = await loadAndCache('./debugLogUtils.js', 'activateDebugLogs');
//         activateDebugLogs();
//     });
// }


function prepareLazyModules() {
    // Bouton documentation
    document.getElementById('help-button')?.addEventListener('click', async () => {
        const { documentation } = await import('./documentation.js');
        // const documentationentation.js', 'documentation');
        documentation();
    });

    // Bouton statsModal
    document.getElementById('statsBtn')?.addEventListener('click', async () => {
        const { statsModal } = await import('./statsModalUI.js');
        statsModal();
    });

    // Bouton Caméra
    document.getElementById('openCameraModalBtn')?.addEventListener('click', async () => {
        const { openCameraModal } = await import('./cameraManager.js');
        openCameraModal();
    });

    // Bouton Accéléromeètre
    document.getElementById('activateAccelerometerBtn')?.addEventListener('click', async () => {
        const { toggleAccelerometer } = await import('./accelerometer.js');
        toggleAccelerometer();
    });

    // Bouton heatmap
    document.getElementById('heatMapBtn')?.addEventListener('click', async () => {
        const { displayHeatMap } = await import('./geoHeatMapUI.js');
        displayHeatMap();
    }); 
    
    // Bouton geolocalisation
    document.getElementById('generateGeocodeFileBtn')?.addEventListener('click', async () => {
        const { generateGeocodeFile } = await import('./geoLocalisation.js');
        generateGeocodeFile();
    });
    
    //bouton activateDebugLogsBtn
    document.getElementById('activateDebugLogsBtn')?.addEventListener('click', async () => {
        const { activateDebugLogs } = await import('./debugLogUtils.js');
        activateDebugLogs();
    });

    //bouton CloudBtn
    document.getElementById('cloudBtn')?.addEventListener('click', async () => {
        const { processNamesCloudWithDate } = await import('./nameCloud.js');
        processNamesCloudWithDate({ type: 'prenoms', startDate: 1500, endDate: new Date().getFullYear(), scope: 'ancestors' });
    }); 

    //bouton Play Animation
    document.getElementById('animationPauseBtn')?.addEventListener('click', async () => {
        const { toggleAnimationPause } = await import('./treeAnimation.js');
        toggleAnimationPause();
    }); 
    
    //bouton selection de la voie
    document.getElementById('voiceBtn')?.addEventListener('click', async () => {
        const { voiceModal } = await import('./voiceSelect.js');
        voiceModal();
    }); 
    
    //bouton commande vocale page accueil
    document.getElementById('voiceCommandBtn')?.addEventListener('click', async () => {
        const { voiceCommand } = await import('./voiceSelect.js');
        voiceCommand('start');
    }); 
    
    //bouton commande vocale page arbre
    document.getElementById('voiceCommand2Btn')?.addEventListener('click', async () => {
        const { voiceCommand } = await import('./voiceSelect.js');
        voiceCommand('full');
    }); 

    //bouton browser bar puzzle
    document.getElementById('browserBar-button')?.addEventListener('click', async () => {
        const { browserBarPuzzle } = await import('./puzzleSwipe.js');
        browserBarPuzzle();
    });



    //selecteur nombre de prénoms
    document.getElementById('prenoms')?.addEventListener('change', async () => {
        const { updatePrenoms } = await import('./eventHandlers.js');
        updatePrenoms(this.value);
    });

 
    //selecteur nombre de générations
    document.getElementById('generations')?.addEventListener('change', async () => {
        const { updateGenerations } = await import('./eventHandlers.js');
        updateGenerations(this.value);
    });

}

prepareLazyModules();


import('./serviceWorkerInit.js');
import('./i18n.js');

// import { processNamesCloudWithDate } from './nameCloud.js';
import { 
    openGedcomModal,
    closeGedcomModal,
    loadData, 
    // updatePrenoms, 
    // updateLettersInNames, 
    // updateGenerations, 
    // zoomIn, 
    // zoomOut, 
    // resetZoom,
    toggleTreeRadar,
    toggleSpeech,
    toggleSpeech2,
    // searchTree,
    // displayPersonDetails,
    // closePersonDetails,
    // setAsRootPerson,
    updateTreeMode,
    // handleRootPersonChange,
    openSettingsModal,
    closeSettingsModal,
    saveTargetAncestorId,
    toggleFullScreen,
    resetToDefaultSettings,
    displayGenealogicTree,
} from './main.js';

const isProduction = window.location.pathname.includes('/obfusc/');
const BACKGROUND_IMAGES_PATH = isProduction ? '../background_images/' : './background_images/';

// import {
//     statsModal
// } from './statsModalUI.js';

// import { 
//     startAncestorAnimation,
//     toggleAnimationPause 
// } from './treeAnimation.js';
// import {
//     initBackgroundContainer
// } from './backgroundManager.js';
// import { 
//     displayHeatMap 
// } from './geoHeatMapUI.js';
// import {
//     buttonsOnDisplay
// } from './mainUI.js'

// import { initResourcePreloading } from './resourcePreloader.js';
// import { initTilePreloading } from './mapTilesPreloader.js';

// import { toggleTreeRadarFromHamburger } from './hamburgerMenu.js';

// import { browserBarPuzzle } from './puzzleSwipe.js';
// import { documentation } from './documentation.js';
// import { voiceModal, voiceCommand, selectVoice } from './voiceSelect.js';

// import { toggleAccelerometer } from './accelerometer.js';
// import { toggleCamera, cycleCameraFilter, openCameraModal } from './cameraManager.js';


// // ou si tu veux attendre que tout soit chargé
// document.addEventListener('DOMContentLoaded', () => {


// });



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
                    // const cachedResponse = await cache.match('background_images/tree-log.jpg');  
                    const cachedResponse = await cache.match(`${BACKGROUND_IMAGES_PATH}tree-log-lowQuality.jpg`);  
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
        // existingImage.src = 'background_images/tree-log.jpg';
        existingImage.src = `${BACKGROUND_IMAGES_PATH}tree-log-lowQuality.jpg`;

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
                // const hasImage = await cache.match('background_images/tree-log.jpg');                
                const hasImage = await cache.match(`${BACKGROUND_IMAGES_PATH}tree-log-lowQuality.jpg`);  
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
    // window.processNamesCloudWithDate = processNamesCloudWithDate;
    window.openGedcomModal = openGedcomModal;
    // window.documentation = documentation;
    window.closeGedcomModal = closeGedcomModal;
    window.loadData = loadData;
    // window.updatePrenoms = updatePrenoms;
    // window.updateLettersInNames = updateLettersInNames;
    // window.updateGenerations = updateGenerations;
    // window.zoomIn = zoomIn;
    // window.zoomOut = zoomOut;
    // window.resetZoom = resetZoom;
    // window.displayHeatMap = displayHeatMap;
    window.toggleTreeRadar = toggleTreeRadar;
    // window.toggleTreeRadarFromHamburger = toggleTreeRadarFromHamburger;
    window.toggleSpeech = toggleSpeech;
    window.toggleSpeech2 = toggleSpeech2;
    // window.toggleAnimationPause = toggleAnimationPause;
    // window.searchTree = searchTree;
    // window.displayPersonDetails = displayPersonDetails;
    // window.closePersonDetails = closePersonDetails;
    // window.setAsRootPerson = setAsRootPerson; 
    window.updateTreeMode = updateTreeMode; 
    // window.handleRootPersonChange = handleRootPersonChange;
    window.openSettingsModal = openSettingsModal;
    window.closeSettingsModal = closeSettingsModal;
    window.saveTargetAncestorId = saveTargetAncestorId;
    // window.initBackgroundContainer = initBackgroundContainer;
    window.toggleFullScreen = toggleFullScreen;
    window.resetToDefaultSettings = resetToDefaultSettings;
    // window.statsModal = statsModal;
    // window.buttonsOnDisplay = buttonsOnDisplay;
    // window.changeLanguage = changeLanguage;
    window.startAnimation = () => {
        startAncestorAnimation().catch(console.error);
    };
    // window.browserBarPuzzle = browserBarPuzzle;
    // window.voiceModal = voiceModal;
    // window.voiceCommand = voiceCommand;
    // window.selectVoice = selectVoice;
    // window.toggleAccelerometer = toggleAccelerometer;
    // window.toggleCamera = toggleCamera;
    // window.cycleCameraFilter = cycleCameraFilter;
    // window.openCameraModal = openCameraModal;



    // window.closeCameraModal = closeCameraModal;
}

// Initialise les écouteurs d'événements
// function initializeAppEventListeners() {
//     document.addEventListener('DOMContentLoaded', () => {
//         const loadDataButton = document.getElementById('loadDataButton');
//         if (loadDataButton) {
//             loadDataButton.addEventListener('click', () => { 
              
//                 // setTimeout(() => {

//                 //     //1️⃣ Scroll pour revenir en haut après le mouvement vers le haut avce le puzzle pour faire disparaitre le bandeau du brower
//                 //     window.scrollTo({ top: 0, behavior: 'auto' });
//                 //     if (state.isPuzzleSwipe) {resetPuzzle();}

//                 //      // 2️⃣ Puis bloque le scroll 
//                 //     document.body.style.height = `${window.innerHeight}px`;
//                 //     document.body.style.overflow = 'hidden'; // empêche le scroll après
//                 //     // console.log('\n\n\n *** debug document.body.style.height = ${window.innerHeight}px \n\n')
//                 // }, 200); 


//                 loadData();

//             });

//             } else {
//             console.warn("Élément 'loadDataButton' non trouvé");
//         }
        
//         // const rootPersonResults = document.getElementById('root-person-results');
//         // if (rootPersonResults) {
//         //     rootPersonResults.addEventListener('change', handleRootPersonChange);
//         // } else {
//         //     console.warn("Élément 'root-person-results' non trouvé");
//         // }


//         // const device = detectDeviceType();
//         // if (device.hasTouchScreen || device.inputType === 'tactile') state.isTouchDevice = true;

//         // function isPWA() { // test si l'appli est lancé en mode brower web ou en mode appli Progressive Web App
//         //     return (
//         //         window.matchMedia('(display-mode: standalone)').matches || // Chrome, Android
//         //         window.navigator.standalone === true // Safari iOS
//         //     );
//         // }
//         // state.isPWA = isPWA();

//         // console.log("/n/n/ ***** debug :  appel de PuzzleSwipe:  state.isTouchDevice, state.isMobile, state.isIOS, state.isPWA ",  state.isTouchDevice, state.isMobile, state.isIOS, state.isPWA , " /n/n/");

//         // // if (state.isMobile && state.isTouchDevice && !state.isPWA) {
//         // if (true) {
//         //     // 👉 activer le puzzle pour faire disparaitre la barre du navigateur
//         //     state.isPuzzleSwipe = true;
//         //     import('./puzzleSwipe.js')
//         //         .then(() => console.log("PuzzleSwipe chargé"))
//         //         .catch(err => console.error(err));
//         // } else {
//         //     // 👉 ignorer le puzzle : inutile car la barre du navigateur est déjà cachée en PWA, et sur PC c'est inutile car l'écran est grand
//         //     state.isPuzzleSwipe = false;
//         // }

//     });
// }

function initializeAppEventListeners() {
    document.addEventListener('DOMContentLoaded', () => {
        const loadDataButton = document.getElementById('loadDataButton');
        if (!loadDataButton) return;

        loadDataButton.addEventListener('click', async () => {
            // 1. Lancer le chargement des libs (si pas déjà fait)
            // if (typeof window.startAppLoading === 'function') {
            //     window.startAppLoading();
            // }

            // const { loadAllResources } = await import('./libraryLoader.js');
            // loadAllResources();



            // 2. Bloquer le bouton pour éviter les doubles clics
            loadDataButton.disabled = true;
            const loadDataButtonInnerText = loadDataButton.innerText;
            loadDataButton.innerText = "Loading";

            // 3. BOUCLE DE VÉRIFICATION (Le "Béton Armé")
            // On vérifie toutes les 100ms si pako et d3 sont là
            const checkLibs = setInterval(async () => {
                console.log("Vérification des bibliothèques...");
                
                if (typeof pako !== 'undefined' && typeof d3 !== 'undefined') {
                    console.log("✅ Bibliothèques détectées ! Lancement de l'arbre.");
                    
                    clearInterval(checkLibs); // On arrête de surveiller
                    
                    try {
                        await loadData(); // ON LANCE L'ARBRE


                        // console.log("📸 Chargement différé du module Caméra...");
                        
                        // 2. ON CHARGE LE FICHIER SEULEMENT MAINTENANT


                        /// important pour que ça rentre dans le cache même si semble inactif
                        // const statsModalModule = await import('./statsModalUI.js');
                        // const cameraModule = await import('./cameraManager.js');
                        // const accelerometerModule = await import('./accelerometer.js');


                        // 3. ON REND LES FONCTIONS DISPONIBLES 
                        // window.statsModal = statsModalModule.statsModal;
                        // window.statsModal = getStatsModalModule();
                        // window.toggleCamera = cameraModule.toggleCamera;
                        // window.cycleCameraFilter = cameraModule.cycleCameraFilter;
                        // window.openCameraModal = cameraModule.openCameraModal;
                        // window.toggleAccelerometer = accelerometerModule.toggleAccelerometer;

                        // console.log("✅ Module Caméra prêt et attaché à 'window'");





                        // B. L'arbre est affiché ! 
                        // MAINTENANT on lance les caches de fond pour le mode hors-ligne
                        console.log("🚀 Lancement des caches en arrière-plan...");

                        // 1. Ordre au Service Worker (pour tes 34 fichiers JS)
                        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
                            navigator.serviceWorker.controller.postMessage({
                                action: 'startFullCaching'
                            });
                        }

                        // On utilise await ici pour respecter ton ordre :
                        // Le code attend que les ressources soient finies...
                        const initResourcePreloading  = await getInitResourcePreloading();
                        await initResourcePreloading(); 
                        console.log("✅ Ressources chargées.");

                        // avant de lancer les tuiles qui sont optionnelles
                        console.log("🗺️ Lancement du préchargement OPTIONNEL (Tuiles)...");
                        const initTilePreloading = await getInitTilePreloader();
                        initTilePreloading(); 

                    } catch (e) {
                        console.error("Erreur lors du loadData:", e);
                    } finally {
                        loadDataButton.disabled = false;
                        loadDataButton.innerText = loadDataButtonInnerText;
                    }
                }
            }, 100); 
        });
    });



    window.addEventListener('load', () => {
        // 3000ms est le standard pour passer sous le radar des tests de performance
        setTimeout(() => {
            // Cela télécharge et pré-analyse le code sans bloquer l'UI
            if ('requestIdleCallback' in window) {
                requestIdleCallback(async () => {

                    // chargement et compil des librairies
                    const { loadAllResources } = await import('./libraryLoader.js');
                    loadAllResources();

                    // On pré-importe les gros piliers
                    import('./libraryLoader.js');
                    import('./eventHandlers.js');
                    import('./treeRenderer.js');
                    import('./treeOperations.js');
                    import('./nodeRenderer.js');
                    import('./nodeControls.js');
                    import('./nodeStyles.js');  
                    import('./hamburgerMenu.js');                                        
                    console.log("Modules pré-compilés en tâche de fond.");



                    // // --- Pré-chargement partielle de juste quelques resource ged (arbre.enc) ---
                    // Le code attend que les ressources soient finies...
                    const initResourcePreloading  = await getInitResourcePreloading();
                    await initResourcePreloading('reduced'); 
                    console.log("✅ Ressources chargées.");
                });
            }
        }, 2000); 
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
function initializeApp() {
    initializeAppFunctions();
    initializeAppEventListeners();
    initializeBackgroundLoader();
        
    // Vous pouvez ajouter d'autres initialisations ici si nécessaire
    console.log("App Initializer V1.6: fonctions, écouteurs d'événements et chargeur d'image configurés");
}

// Exécuter l'initialisation
initializeApp();