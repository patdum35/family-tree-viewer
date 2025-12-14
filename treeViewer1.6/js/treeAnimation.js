// ====================================
// Animation de l'arbre
// ====================================
import { state, searchRootPersonId, trackPageView, toggleTreeRadar } from './main.js';
import { handleAncestorsClick, handleDescendantsClick, handleDescendants } from './nodeControls.js';
import { cleanIdForSelector } from './nodeRenderer.js';
import { getZoom, getLastTransform, setLastTransform, drawTree, hardResetZoom } from './treeRenderer.js';
import { buildDescendantTree, buildAncestorTree, buildCombinedTree  } from './treeOperations.js';
// import { geocodeLocation } from './modalWindow.js';
import { geocodeLocation } from './geoLocalisation.js';
import { initBackgroundContainer, updateBackgroundImage } from './backgroundManager.js';
import { extractYear } from './utils.js';
import { initAnimationMap as initMap, updateAnimationMapMarkers, createCachedTileLayer, updateAnimationMapMarkersWithLabels, collectPersonLocations, locationSymbols} from './mapUtils.js';
import { makeElementDraggable } from './geoHeatMapInteractions.js';
import { fetchTileWithCache } from './mapTilesPreloader.js';
import { playEndOfAnimationSound, stopAnimationAudio } from './audioPlayer.js';
import { showEndAnimationPhoto, closeAnimationPhoto } from './photoPlayer.js';
import { debugLog } from './debugLogUtils.js'
import { findYoungestPerson } from './utils.js';
import { closeAllModals, resetZoom } from './eventHandlers.js';

import { disableFortuneModeWithLever, disableFortuneModeClean } from './treeWheelAnimation.js';
import { selectVoice, speakText, speakTextWithWaitToEnd } from './voiceSelect.js';

let animationTimeouts = [];
let optimalSpeechRate = 1.0; //1.1;
let animationMap = null;
let animationMarker = null;

// let frenchVoice = null;
let localVoice = null;

// Au début du fichier, après les imports
let isOnline = false; // Variable pour suivre l'état de la connexion Internet
let previousOnlineState = false;

// État pour la position de la carte d'animation
let animationMapPosition = {
    top: 60,
    left: 20,
    width: 300,
    height: 250
};

// État pour la position de la carte d'animation
let initialAnimationMapPosition = {
    top: 60,
    left: 20,
    width: 300,
    height: 250
};



// let state.isSpeechInGoodHealth = false;
let animationController = null;

export let animationState = {
    path: [],          // Le chemin complet de l'animation de la racine vers l'ancetre
    descendpath: [],   // Le chemin complet descendant de l'ancetre vers la racine
    cousinPath: [], // Le chemin complet du cousin vers l'ancetre commun
    cousinDescendantPath: [], // Le chemin complet descendant de l'ancetre vers le cousin
    currentIndex: 0,   // L'index du nœud actuel
    cousinCurrentIndex: 0, // L'index du nœud actuel dans la descente vers le cousin
    isPaused: true,
    currentHighlightedNodeId: null,  // Ajout de cette propriété pour suivre le nœud actuellement mis en évidence
    visitedAncestorNodeIds: null, //: new Set(), // Ensemble pour conserver l'historique des nœuds ancestors visités
    visitedDescendantNodeIds: null, //: new Set() // Ensemble pour conserver l'historique des nœuds descendants visités
    direction: 'ancestor'
};


let voice_language = 'fr-FR';
let voice_language_short = 'fr-';
let startMessage = "Début de l'animation";
let endMessage = "Fin de l'animation";
let reverseMessage = "Animation inversée";
let noSpeechSynthesisTitle = 'Synthèse vocale indisponible 🔇';
let noSpeechSynthesisText = 'Ce navigateur ne supporte pas la parole.<br><br>Pour profiter de toutes les fonctionnalités,<br>utilise <b>Google Chrome</b> 🗣️';


if (window.CURRENT_LANGUAGE == "fr") {
    voice_language = 'fr-FR';
    voice_language_short = 'fr-';
    startMessage = 'en /voiture Simone';
    endMessage = 'et /voila !';
    // reverseMessage = 'attention / la descente c\'est reparti !';
    reverseMessage = 'l\'ancêtre / commun a été atteint, on redescend vers le cousin';
    noSpeechSynthesisTitle = 'Synthèse vocale indisponible 🔇';
    noSpeechSynthesisText = 'Ce navigateur ne supporte pas la parole.<br><br>Pour profiter de toutes les fonctionnalités,<br>utilise <b>Google Chrome</b> 🗣️';

} else if (window.CURRENT_LANGUAGE == "en") {
    voice_language = 'en-US';
    voice_language_short = 'en-'; 
    startMessage = 'let\'s /go';
    endMessage = 'that\'s /it !';
    // reverseMessage = 'let\'s /go we\'re going back down';
    reverseMessage = 'the common / ancestor has been reached, we\'re going back down to the cousin';
    noSpeechSynthesisTitle = 'Speech synthesis unavailable 🔇';
    noSpeechSynthesisText = 'This browser does not support speech.<br><br>For the best experience,<br>please use <b>Google Chrome</b> 🗣️';
} else if (window.CURRENT_LANGUAGE == "es") { 
    voice_language = 'es-ES';
    voice_language_short = 'es-';
    startMessage = 'vamos';
    endMessage = 'eso /es todo !';
    // reverseMessage = 'vamos /volvemos a bajar';
    reverseMessage = 'se ha alcanzado el /ancestro común, volvemos a bajar al primo';
    noSpeechSynthesisTitle = 'Síntesis de voz no disponible 🔇';
    noSpeechSynthesisText = 'Este navegador no admite la voz.<br><br>Para disfrutar de todas las funciones,<br>usa <b>Google Chrome</b> 🗣️';
} else if (window.CURRENT_LANGUAGE == "hu") {  
    voice_language = 'hu-HU';
    voice_language_short = 'hu-';
    startMessage = 'Menjünk';
    endMessage = 'Ennyi !';
    // reverseMessage = 'menjünk /visszamegyünk lemászni';
    reverseMessage = 'elértük a közös /ősöt, visszamászunk a unokatestvérhez';
    noSpeechSynthesisTitle = 'A beszédszintézis nem elérhető 🔇';
    noSpeechSynthesisText = 'Ez a böngésző nem támogatja a beszédet.<br><br>A teljes élményhez<br>használd a <b>Google Chrome</b>-ot 🗣️';
} 



// Fonction modifiée pour marquer et démarquer les nœuds
function highlightAnimationNode(nodeId, highlight = true) {
    // Si nodeId n'est pas fourni, ne rien faire
    if (!nodeId) return;
    
       
    try {
        if (highlight) {
            // Si un autre nœud était déjà en surbrillance, l'ajouter à l'historique
            if (animationState.currentHighlightedNodeId && 
                animationState.currentHighlightedNodeId !== nodeId) {
                
                // Ajouter l'ancien nœud à l'historique (avec vérification)
                try {
                    if (animationState.direction == 'ancestor') {
                        animationState.visitedAncestorNodeIds.add(animationState.currentHighlightedNodeId);
                        console.log(`Nœud ${animationState.currentHighlightedNodeId} ajouté à l'historique ancestor`);

                        // Démarquer l'ancien nœud comme actif et le marquer comme historique
                        d3.selectAll('.node')
                        .filter(d => d.data.id === animationState.currentHighlightedNodeId)
                        .select('rect')
                        .classed('highlight-animation-node-active', false)
                        .classed('highlight-animation-AncestorNode-history ', true);

                    } else {
                        animationState.visitedDescendantNodeIds.add(animationState.currentHighlightedNodeId);
                        console.log(`Nœud ${animationState.currentHighlightedNodeId} ajouté à l'historique descendant`); 

                        // Démarquer l'ancien nœud comme actif et le marquer comme historique
                        d3.selectAll('.node')
                        .filter(d => d.data.id === animationState.currentHighlightedNodeId)
                        .select('rect')
                        .classed('highlight-animation-node-active', false)
                        .classed('highlight-animation-DescendantNode-history ', true);                                               
                    }
                } catch (e) {
                    console.error("Erreur lors de l'ajout à visitedAncestorNodeIds:", e);
                    animationState.visitedAncestorNodeIds = new Set([animationState.currentHighlightedNodeId]);
                }
                
            }
            
            // Mémoriser le nœud actuellement en surbrillance
            animationState.currentHighlightedNodeId = nodeId;
            
            // Marquer le nœud actuel comme actif
            d3.selectAll('.node')
                .filter(d => d.data.id === nodeId)
                .select('rect')
                .classed('highlight-animation-node-active', true)
                .classed('highlight-animation-AncestorNode-history ', false)
                .classed('highlight-animation-DescendantNode-history ', false);
                
            // IMPORTANT: Appliquer la classe d'historique à TOUS les nœuds visités précédemment
            animationState.visitedAncestorNodeIds.forEach(visitedId => {
                if (visitedId !== nodeId) { // Ne pas marquer le nœud actuel comme historique
                    d3.selectAll('.node')
                        .filter(d => d.data.id === visitedId)
                        .select('rect')
                        .classed('highlight-animation-AncestorNode-history ', true);
                }
            });
            animationState.visitedDescendantNodeIds.forEach(visitedId => {
                if (visitedId !== nodeId) { // Ne pas marquer le nœud actuel comme historique
                    d3.selectAll('.node')
                        .filter(d => d.data.id === visitedId)
                        .select('rect')
                        .classed('highlight-animation-DescendantNode-history ', true);
                }
            });




        } else if (animationState.currentHighlightedNodeId === nodeId) {
            // Si on démarque le nœud actif, l'ajouter à l'historique
            try {
                if (animationState.direction == 'ancestor') {
                    animationState.visitedAncestorNodeIds.add(nodeId);
                    d3.selectAll('.node')
                    .filter(d => d.data.id === nodeId)
                    .select('rect')
                    .classed('highlight-animation-node-active', false)
                    .classed('highlight-animation-AncestorNode-history ', true);
                    console.log(`Nœud ${nodeId} ajouté à l'historique ancestor (désactivation)`);
                } else { 
                    animationState.visitedDescendantNodeIds.add(nodeId); 
                    d3.selectAll('.node')
                    .filter(d => d.data.id === nodeId)
                    .select('rect')
                    .classed('highlight-animation-node-active', false)
                    .classed('highlight-animation-DescendantNode-history ', true);
                    console.log(`Nœud ${nodeId} ajouté à l'historique descendant (désactivation)`);
                }
                
            } catch (e) {
                console.error("Erreur lors de l'ajout à visitedAncestorNodeIds:", e);
                animationState.visitedAncestorNodeIds = new Set([nodeId]);
            }
                       
            // Réinitialiser le nœud actif
            animationState.currentHighlightedNodeId = null;
        }
        
        // Pour déboguer
        console.log("État après highlight:", {
            currentHighlighted: animationState.currentHighlightedNodeId,
            visitedNodes: Array.from(animationState.visitedAncestorNodeIds)
        });
    } catch (e) {
        console.error("Erreur dans highlightAnimationNode:", e);
    }
}

// Fonction pour réinitialiser complètement l'animation
function resetAnimationHighlights() {
    try {
        // Retirer toutes les classes de surbrillance
        d3.selectAll('.node rect')
            .classed('highlight-animation-node-active', false)
            .classed('highlight-animation-AncestorNode-history ', false);
        
        // Réinitialiser l'état
        animationState.currentHighlightedNodeId = null;
        
        // Réinitialiser visitedAncestorNodeIds avec vérification
        animationState.visitedAncestorNodeIds.clear();

    } catch (e) {
        console.error("Erreur lors de la réinitialisation des surlignages:", e);
    }
}

// Fonction pour restaurer l'état visuel après un rechargement ou une mise à jour
function restoreAnimationState() {
    try {
        
        // Appliquer la surbrillance d'historique à tous les nœuds visités
        animationState.visitedAncestorNodeIds.forEach(nodeId => {
            try {
                d3.selectAll('.node')
                    .filter(d => d.data.id === nodeId)
                    .select('rect')
                    .classed('highlight-animation-AncestorNode-history ', true);
            } catch (e) {
                console.error(`Erreur lors de la restauration du nœud ${nodeId}:`, e);
            }
        });
        
        // Appliquer la surbrillance active au nœud actuel s'il y en a un
        if (animationState.currentHighlightedNodeId) {
            d3.selectAll('.node')
                .filter(d => d.data.id === animationState.currentHighlightedNodeId)
                .select('rect')
                .classed('highlight-animation-node-active', true);
        }
    } catch (e) {
        console.error("Erreur lors de la restauration de l'état:", e);
    }
}

// Ajouter un style CSS pour les classes de surbrillance
function addHighlightStyle() {
    try {
        // Vérifier si le style a déjà été ajouté
        if (document.getElementById('animation-highlight-style')) return;
        
        // Créer et ajouter le style
        const style = document.createElement('style');
        style.id = 'animation-highlight-style';

        // fill: #4285F4 !important;  /* Bleu Google */
        // stroke: #1A73E8 !important;  /* Bordure plus foncée */
        style.textContent = `
            .highlight-animation-node-active {
                fill: #FFEB3B !important;  /* Jaune */
                stroke: #FFC107 !important;  /* Bordure plus foncée */
                stroke-width: 2px !important;
            }

            .highlight-animation-AncestorNode-history {
                fill: #BBDEFB !important;  /* Bleu clair */
                stroke: #90CAF9 !important;  /* Bordure légèrement plus foncée */
                stroke-width: 1.5px !important;
            }

            .highlight-animation-DescendantNode-history {
                fill:rgb(187, 251, 207) !important;  /* Bleu clair */
                stroke:rgb(144, 249, 209) !important;  /* Bordure légèrement plus foncée */
                stroke-width: 1.5px !important;
            }
        `;
        document.head.appendChild(style);
    } catch (e) {
        console.error("Erreur lors de l'ajout du style:", e);
    }
}

export async function testRealConnectivity(isEndFlagRequested = false) {
    if (isEndFlagRequested) { state.isEndTestRealConnectivity = false; }

    try {

        // Utiliser le mode 'no-cors' pour éviter les erreurs CORS
        const response = await fetch('https://www.google.com/favicon.ico', {
            mode: 'no-cors',  // Crucial pour éviter les erreurs CORS
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            },
            // Timestamp pour éviter la mise en cache par le navigateur
            signal: AbortSignal.timeout(2000)
        });
        
        // Le mode no-cors retourne toujours une réponse "opaque"
        // On ne peut pas vérifier le status, mais si on arrive ici sans erreur,
        // c'est qu'une connexion a pu être établie
        
        // Sauvegarder l'état précédent
        previousOnlineState = isOnline;
        isOnline = true;
        
        // Détecter le changement d'état
        if (previousOnlineState !== isOnline) {
            console.log("✅ Connexion Internet rétablie");
            showNetworkStatus("Connexion réseau rétablie");
            // selectVoice();
        }
        state.isOnLine = true;
        console.log('\n\n -----------  debug in testRealConnectivity,  state.isOnLine= ', state.isOnLine);
        if (isEndFlagRequested) { state.isEndTestRealConnectivity = true; }
        
        return true;
    } catch (error) {
        // Si on arrive ici, c'est qu'il n'y a pas de connexion
        // Sauvegarder l'état précédent
        previousOnlineState = isOnline;
        isOnline = false;
        
        // Détecter le changement d'état
        if (previousOnlineState !== isOnline) {
            console.log("⚠️ Connexion Internet perdue");
            showNetworkStatus("Mode hors-ligne");
            // selectVoice();
        }
        state.isOnLine = false;
        console.log('\n\n -----------  debug in testRealConnectivity, state.isOnLine= ', state.isOnLine);
        if (isEndFlagRequested) { state.isEndTestRealConnectivity = true; }
        return false;
    }
}

window.testRealConnectivity = testRealConnectivity;

export function initNetworkListeners() {
    console.log("🌐 Initialisation des écouteurs réseau dans initNetworkListeners ...");
    
    // Test initial
    testRealConnectivity(true).then(online => {
        if (window.CURRENT_LANGUAGE == "fr") {
            showNetworkStatus(online ? "Connexion réseau active" : "Mode hors-ligne");
        } else if (window.CURRENT_LANGUAGE == "en") {
            showNetworkStatus(online ? "Network connection active" : "Offline mode");
        } else if (window.CURRENT_LANGUAGE == "es") {
            showNetworkStatus(online ? "Conexión de red activa" : "Modo fuera de línea");
        } else if (window.CURRENT_LANGUAGE == "hu") {
            showNetworkStatus(online ? "Hálózati kapcsolat aktív" : "Offline mód");
        }
    });

    // Écouteurs d'événements standard
    window.addEventListener('online', () => testRealConnectivity());
    window.addEventListener('offline', () => {
        previousOnlineState = isOnline;
        isOnline = false;
        if (previousOnlineState !== isOnline) {
            console.log("⚠️ Mode hors-ligne détecté");
            showNetworkStatus("Mode hors-ligne");
            if (state.isSpeechSynthesisAvailable) { 
                selectVoice();
            }
        }
    });


    // testRealConnectivity();

}

// Fonction pour afficher visuellement le statut réseau (optionnel)
function showNetworkStatus(message) {
    // Créer ou mettre à jour un élément de notification
    let notification = document.getElementById('network-status');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'network-status';
        notification.style.position = 'fixed';
        if (window.innerHeight < 400) {
            notification.style.top = '10px';
            notification.style.left = '';
            notification.style.right = '50px';
        } else {
            notification.style.top = '50px';
            notification.style.left = window.innerWidth/2 - 100  +'px';
            notification.style.right = '';
            // notification.style.right = window.innerWidth - (window.innerWidth - notification.offsetWidth)/2  +'px'; //'10px';
            // notification.style.transform = 'translateX(-50%)';
        }


        notification.style.padding = '5px';
        notification.style.borderRadius = '5px';
        notification.style.zIndex = '9999';
        document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    notification.style.backgroundColor = isOnline ? '#4CAF50' : '#f44336';
    notification.style.color = 'white';

    if (window.innerHeight >= 400) {
        setTimeout(() => {    
            notification.style.left = window.innerWidth/2 - (notification.offsetWidth)/2  +'px';
        }, 50);
    }

    // Faire disparaître la notification après 3 secondes
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

export function initializeAnimationMapPosition() 
{

    // if (window.innerWidth < 400) {
    //     animationMapPosition.width = window.innerWidth - 20;
    //     animationMapPosition.left = 10;
    // }
    // else {
    //     animationMapPosition.width = window.innerWidth/2 ;
    //     animationMapPosition.left = window.innerWidth/4;
    // }



    if ((window.innerWidth < 400) && (window.innerHeight < 800)) {
    // format smartphone portrait
        animationMapPosition.width = window.innerWidth - 20;
        animationMapPosition.left = 10;
        animationMapPosition.height = window.innerHeight/3;
        animationMapPosition.top = window.innerHeight - animationMapPosition.height - 15;
    }
    else if ((window.innerWidth < 800) && (window.innerHeight < 400)) { 
    // format smartphone landscape
        animationMapPosition.width = window.innerWidth/2 ;
        animationMapPosition.left = 10;
        animationMapPosition.height = (window.innerHeight/2)*0.8;
        animationMapPosition.top = window.innerHeight - animationMapPosition.height - 20;
    } else {
    // larguer screens: PC ou tablette
        animationMapPosition.width = Math.max(400 - 40, window.innerWidth/2) ;
        animationMapPosition.left = (window.innerWidth - Math.max(400-40, window.innerWidth/2))/ 2; // window.innerWidth/4;
        animationMapPosition.height = Math.max(400*0.8, window.innerHeight/3);
        animationMapPosition.top = window.innerHeight - animationMapPosition.height - 20;
    }

    initialAnimationMapPosition = animationMapPosition;



    // // animationMapPosition.top = window.innerHeight*3/4 -10 ;
    // animationMapPosition.height = window.innerHeight/3;

    // animationMapPosition.top = window.innerHeight - animationMapPosition.height - 20;

    console.log("\n \n Position de la carte d'animation initialisée:", window.innerWidth, window.innerHeight, animationMapPosition, "\n\n");

    state.isAnimationMapInitialized = true;
}


// Fonction pour sauvegarder la position de la carte d'animation
function saveAnimationMapPosition() {
    const wrapper = document.getElementById('animation-map-container');
    if (!wrapper) return;
    
    // Obtenir la position et les dimensions réelles de l'élément
    const rect = wrapper.getBoundingClientRect();
    
    // Vérifier que les valeurs sont raisonnables
    if (rect.width < 50 || rect.height < 50 || rect.top < 0 || rect.left < 0) {
        console.warn("Valeurs de position/taille invalides détectées, sauvegarde ignorée");
        return;
    }
    
    // Stocker les valeurs
    animationMapPosition = {
        top: Math.round(rect.top),
        left: Math.round(rect.left),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
    };
    
    console.log("Position de la carte d'animation sauvegardée:", animationMapPosition);
}

export function getAnimationMapPosition(mapWrapperName) {
    const existingContainer = document.getElementById(mapWrapperName); //'animation-map-container');
    // console.log('\n\n *** DEBUG  getAnimationMapPosition*** ', existingContainer, '\n\n');
    if (!existingContainer) return [null, null, null, null];
    // Obtenir la position et les dimensions réelles de l'élément
    const rect = existingContainer.getBoundingClientRect();
    // console.log('\n\n *** DEBUG  getAnimationMapPosition rect *** ', existingContainer, rect, rect.top, rect.left, rect.width, rect.height,  '\n\n');
    return [rect.left, rect.top, rect.width, rect.height];
}


function initAnimationMap() {
    // Supprimer proprement toute carte existante
    const existingContainer = document.getElementById('animation-map-container');

    if (existingContainer && existingContainer.style.display) {
        existingContainer.style.removeProperty("display");
    }


    if (existingContainer && existingContainer.parentNode) {
        // Nettoyer l'observateur de redimensionnement s'il existe
        if (existingContainer.resizeObserver) {
            existingContainer.resizeObserver.disconnect();
        }
        if (existingContainer.moveObserver) {
            existingContainer.moveObserver.disconnect();
        }
        
        // Supprimer du DOM
        if (existingContainer.parentNode) {
            existingContainer.parentNode.removeChild(existingContainer);
        }
    }
    
    // Créer le conteneur principal
    const mapContainer = document.createElement('div');
    mapContainer.id = 'animation-map-container';
    mapContainer.style.position = 'fixed';
    mapContainer.style.top = `${animationMapPosition.top}px`;
    mapContainer.style.left = `${animationMapPosition.left}px`;
    mapContainer.style.width = `${animationMapPosition.width}px`;
    mapContainer.style.height = `${animationMapPosition.height}px`;
    mapContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
    mapContainer.style.zIndex = '1000';
    mapContainer.style.borderRadius = '10px';
    mapContainer.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    mapContainer.style.overflow = 'hidden';
    mapContainer.style.resize = 'both';
    mapContainer.style.minWidth = '200px';
    mapContainer.style.minHeight = '150px';


    
    // Créer le conteneur pour la carte Leaflet
    const mapElement = document.createElement('div');
    mapElement.id = 'animation-map';
    mapElement.style.width = '100%';
    mapElement.style.height = '100%';
    mapContainer.appendChild(mapElement);


    
    // Créer le bouton de fermeture
    const closeButton = document.createElement('div');
    closeButton.className = 'map-close-button';
    closeButton.innerHTML = '✖';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '3px';
    closeButton.style.left = 'auto';
    closeButton.style.right = '3px';
    closeButton.style.width = '25px';
    closeButton.style.height = '25px';
    closeButton.style.backgroundColor = 'rgba(255, 0, 0, 0.7)'; // Rouge semi-transparent
    closeButton.style.color = 'white';
    closeButton.style.fontSize = '16px';
    closeButton.style.fontWeight = 'bold';
    closeButton.style.display = 'flex';
    closeButton.style.justifyContent = 'center';
    closeButton.style.alignItems = 'center';
    closeButton.style.cursor = 'pointer';
    closeButton.style.borderRadius = '50%'; // Forme circulaire
    closeButton.style.zIndex = '1200'; // Plus élevé que les autres éléments
    closeButton.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)';
    closeButton.style.opacity = '0.7';
    closeButton.style.transition = 'opacity 0.2s ease';
    closeButton.title = 'Fermer la carte';
    
    // Ajouter l'effet de survol
    closeButton.addEventListener('mouseover', () => {
        closeButton.style.opacity = '1';
    });
    closeButton.addEventListener('mouseout', () => {
        closeButton.style.opacity = '0.7';
    });
    
    // Ajouter l'action de fermeture
    closeButton.addEventListener('click', () => {
        // Fermer la carte
        if (animationMap) {
            animationMap.remove();
            animationMap = null;
        }
        
        // Nettoyer les observateurs
        if (mapContainer.resizeObserver) {
            mapContainer.resizeObserver.disconnect();
        }
        if (mapContainer.moveObserver) {
            mapContainer.moveObserver.disconnect();
        }
        
        // Supprimer le conteneur
        if (mapContainer.parentNode) {
            mapContainer.parentNode.removeChild(mapContainer);
        }
        
        // Supprimer les marqueurs
        if (window.animationMapMarkers) {
            window.animationMapMarkers = [];
        }
    });
    
    // Ajouter le bouton au conteneur
    mapContainer.appendChild(closeButton);
    
    // Ajouter les poignées de déplacement et redimensionnement
    
    // 1. Poignée de déplacement (coin supérieur gauche)
    const dragHandle = document.createElement('div');
    dragHandle.className = 'map-drag-handle';
    dragHandle.innerHTML = '✥';
    dragHandle.style.position = 'absolute';
    dragHandle.style.top = '3px';
    dragHandle.style.left = '3px';
    dragHandle.style.width = '30px';
    dragHandle.style.height = '30px';
    dragHandle.style.borderRadius = '5px';
    dragHandle.style.backgroundColor = 'rgba(67, 97, 238, 0.7)';
    dragHandle.style.color = 'white';
    dragHandle.style.fontSize = '18px';
    dragHandle.style.display = 'flex';
    dragHandle.style.justifyContent = 'center';
    dragHandle.style.alignItems = 'center';
    dragHandle.style.cursor = 'move';
    dragHandle.style.zIndex = state.topZindex;
    dragHandle.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)';
    dragHandle.title = 'Déplacer la carte';
    dragHandle.style.opacity = '0.4';
    dragHandle.style.transition = 'opacity 0.2s ease';
    mapContainer.appendChild(dragHandle);
    
    // 2. Poignée de redimensionnement (coin inférieur droit)
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'map-resize-handle';
    resizeHandle.innerHTML = '⤡';
    resizeHandle.style.position = 'absolute';
    resizeHandle.style.bottom = '0';
    resizeHandle.style.right = '0';
    resizeHandle.style.width = '25px';
    resizeHandle.style.height = '20px';
    resizeHandle.style.backgroundColor = 'rgba(67, 97, 238, 0.7)';
    resizeHandle.style.color = 'white';
    resizeHandle.style.display = 'flex';
    resizeHandle.style.justifyContent = 'center';
    resizeHandle.style.alignItems = 'center';
    resizeHandle.style.cursor = 'nwse-resize';
    resizeHandle.style.borderTopLeftRadius = '10px';
    resizeHandle.style.zIndex = state.topZindex;
    resizeHandle.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)';
    resizeHandle.title = 'Redimensionner la carte';
    resizeHandle.style.opacity = '0.4';
    resizeHandle.style.transition = 'opacity 0.2s ease';
    resizeHandle.style.fontFamily = 'Arial, sans-serif';
    resizeHandle.style.fontSize = '20px';
    mapContainer.appendChild(resizeHandle);
    
    // Ajouter une règle de style pour l'effet de survol
    if (!document.getElementById('animation-map-styles')) {
        const styles = document.createElement('style');
        styles.id = 'animation-map-styles';
        styles.textContent = `
            .map-drag-handle:hover, .map-resize-handle:hover {
                opacity: 1 !important;
            }
            
            @media (pointer: coarse) {
                #animation-map-container {
                    resize: none !important;
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    // Rendre le conteneur déplaçable
    makeElementDraggable(mapContainer, dragHandle);
    
    // Configurer le redimensionnement manuel pour les appareils tactiles
    setupMapResizeHandlers(resizeHandle, mapContainer);
    
    // Observer les changements de taille pour mettre à jour la carte
    if (window.ResizeObserver) {
        const resizeObserver = new ResizeObserver(() => {
            if (animationMap) {
                animationMap.invalidateSize();
                saveAnimationMapPosition();
            }
        });
        
        resizeObserver.observe(mapContainer);
        mapContainer.resizeObserver = resizeObserver;
    }


    // Observer les déplacements avec MutationObserver
    if (window.MutationObserver) {
        const moveObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    // Vérifier si la position a changé
                    saveAnimationMapPosition();
                    break; // Une seule sauvegarde par batch de mutations suffit
                }
            }
        });
        
        moveObserver.observe(mapContainer, { 
            attributes: true,
            attributeFilter: ['style'] 
        });
        
        mapContainer.moveObserver = moveObserver;
    }

    
    // Ajouter le conteneur au document
    document.body.appendChild(mapContainer);
    
    // Initialiser la carte Leaflet
    animationMap = L.map('animation-map', {
        center: [46.2276, 2.2137], 
        zoom: 5,
        zoomControl: false,
        attributionControl: false
    });

    // state.animationMap = animationMap;
    
    if (useLocalTiles) {
        // Supprimer la couche de tuiles par défaut si elle existe
        animationMap.eachLayer(layer => {
            if (layer instanceof L.TileLayer) {
                animationMap.removeLayer(layer);
            }
        });       
        createCachedTileLayer({
            maxZoom: 19,
            minZoom: 1,
            attribution: '© OpenStreetMap contributors'
        }).addTo(animationMap);
        
        console.log("✅ Couche de tuiles locales/OSM initialisée");
    } else {
        // Utiliser OSM standard
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(animationMap);
        
        console.log("ℹ️ Utilisation standard d'OpenStreetMap");
    }
    
    // Initialiser la liste des marqueurs
    window.animationMapMarkers = [];

    return animationMap;
}

export function updateAnimationMapSize() {
    const mapContainer = document.getElementById('animation-map-container');
    if (!mapContainer) return;
    
    // Appliquer les nouvelles dimensions et position
    mapContainer.style.top = `${animationMapPosition.top}px`;
    mapContainer.style.left = `${animationMapPosition.left}px`;
    mapContainer.style.width = `${animationMapPosition.width}px`;
    mapContainer.style.height = `${animationMapPosition.height}px`;
    
    // Forcer la mise à jour de la carte Leaflet
    if (animationMap) {
        // Notifier Leaflet que la taille du conteneur a changé
        animationMap.invalidateSize();
        
        // Optionnel : sauvegarder la nouvelle position
        saveAnimationMapPosition();
    }
    
    // console.log("Carte d'animation redimensionnée:", animationMapPosition);
}

// Gérer le redimensionnement tactile
function setupMapResizeHandlers(resizeHandle, container) {
    let isResizing = false;
    let startX, startY, startWidth, startHeight;

    // Gestionnaire pour la souris
    resizeHandle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = container.offsetWidth;
        startHeight = container.offsetHeight;
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', stopResize);
        
        container.style.userSelect = 'none';
        document.body.style.cursor = 'nwse-resize';
    });

    // Gestionnaire pour le tactile
    resizeHandle.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            e.preventDefault();
            const touch = e.touches[0];
            
            isResizing = true;
            startX = touch.clientX;
            startY = touch.clientY;
            startWidth = container.offsetWidth;
            startHeight = container.offsetHeight;
            
            document.addEventListener('touchmove', handleTouchMove);
            document.addEventListener('touchend', stopResize);
            document.addEventListener('touchcancel', stopResize);
            
            container.style.userSelect = 'none';
        }
    });

    function handleMouseMove(e) {
        if (!isResizing) return;
        
        const width = Math.max(200, startWidth + (e.clientX - startX));
        const height = Math.max(150, startHeight + (e.clientY - startY));
        
        container.style.width = `${width}px`;
        container.style.height = `${height}px`;
        
        if (animationMap) {
            animationMap.invalidateSize();
        }
    }

    function handleTouchMove(e) {
        if (!isResizing || e.touches.length !== 1) return;
        
        e.preventDefault();
        const touch = e.touches[0];
        
        const width = Math.max(200, startWidth + (touch.clientX - startX));
        const height = Math.max(150, startHeight + (touch.clientY - startY));
        
        container.style.width = `${width}px`;
        container.style.height = `${height}px`;
        
        if (animationMap) {
            animationMap.invalidateSize();
        }
    }

    function stopResize() {
        if (isResizing) {
            isResizing = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('mouseup', stopResize);
            document.removeEventListener('touchend', stopResize);
            document.removeEventListener('touchcancel', stopResize);
            
            container.style.userSelect = '';
            document.body.style.cursor = '';
            
            saveAnimationMapPosition();
        }
    }
}


export function setTargetAncestorId(newId) {
    state.targetAncestorId = newId;
}

export function getTargetAncestorId() {
    return state.targetAncestorId;
}

const useLocalTiles = true; // Activer l'utilisation des tuiles locales
let localTilesDirectory = "maps"; // Le dossier où les tuiles locales sont stockées

let tileStats = {
    localLoaded: 0,
    osmLoaded: 0
};


export function addTooltipTransparencyFix() {
    if (!document.getElementById('tooltip-transparency-fix')) {
        const style = document.createElement('style');
        style.id = 'tooltip-transparency-fix';
        style.textContent = `
            .leaflet-tooltip {
                background: transparent !important;
                border: none !important;
                box-shadow: none !important;
            }
        `;
        document.head.appendChild(style);
    }
}

async function updateAnimationMapLocations(locations, locationSymbols) {

    // Appliquer le correctif de transparence
    addTooltipTransparencyFix();

    // Réinitialiser l'ensemble des noms de lieux déjà affichés
    window.displayedLocationNames = new Set();
    
    // Réinitialiser le compteur de labels par marqueur
    window.markerLabelCount = new Map();
    // Nettoyer les marqueurs existants
    if (window.animationMapMarkers) {
        window.animationMapMarkers.forEach(marker => animationMap.removeLayer(marker));
    }
    window.animationMapMarkers = [];

    // Filtrer les lieux non vides
    const validLocations = locations.filter(loc => loc.place && loc.place.trim() !== '');

    if (validLocations.length === 0) {
        console.log('Aucune localisation valide trouvée');
        return;
    }

    // Utiliser la fonction avec labels temporaires
    window.animationMapMarkers = await updateAnimationMapMarkersWithLabels(animationMap, validLocations, {
        enhanced: true,  // Utiliser les marqueurs améliorés avec cercle
        fitToMarkers: true,
        duration: 1.5,
        labelDuration: 2000  // Durée d'affichage des labels en millisecondes
    });
}

/**
 * Trouve le chemin entre une personne et son ancêtre
 * @private
 */
function findAncestorPath(startId, targetAncestorId) {
    // console.log("Recherche du chemin de", startId, "vers", targetAncestorId);
    
    // Sauvegarder et modifier temporairement nombre_generation
    const savedGen = state.nombre_generation;
    state.nombre_generation = 100;  // Valeur temporaire élevée
    
    // Construire l'arbre des descendants depuis l'ancêtre cible
    const descendantTree = buildDescendantTree(targetAncestorId);
    // console.log("Arbre des descendants depuis l'ancêtre:", descendantTree);

    // Restaurer nombre_generation
    state.nombre_generation = savedGen;
    
    // Fonction pour trouver un nœud et son chemin dans l'arbre
    // function findNodeAndPath(node, targetId, currentPath = []) {
        
    //     if (node.id === targetId) {
    //         const finalPath = [...currentPath, node.id];
    //         return finalPath;
    //     }
        
    //     if (node.children) {
    //         for (const child of node.children) {
    //             // Si le noeud est un spouse, on vérifie si on a déjà trouvé un chemin par l'autre branche
    //             if (child.isSpouse) {
    //                 continue;
    //             }
    //             const path = findNodeAndPath(child, targetId, [...currentPath, node.id]);
    //             if (path) {
    //                 return path;
    //             }
    //         }
    //     }
    //     return null;
    // }

    function findNodeAndPath(node, targetId, currentPath = []) {
        // Vérification explicite que le nœud existe
        if (!node) {
            return null;
        }
        
        // Si le nœud courant correspond à la cible
        if (node.id === targetId) {
            return [...currentPath, node.id];
        }
        
        // Si le nœud a des enfants, les parcourir récursivement
        if (node.children) {
            for (const child of node.children) {
                // Ignorer les nœuds "spouse"
                if (child.isSpouse) continue;
                
                // Appel récursif avec mise à jour du chemin
                const path = findNodeAndPath(child, targetId, [...currentPath, node.id]);
                
                // Si un chemin est trouvé, le retourner
                if (path) return path;
            }
        }
        
        // Aucun chemin trouvé
        return null;
    }




    
    // Trouver le chemin depuis l'ancêtre jusqu'à la racine actuelle
    const path = findNodeAndPath(descendantTree, startId);
    if (path)
    {
        const descendPath = [...path]; // Crée une copie du tableau

        // Inverser le chemin pour aller de la racine vers l'ancêtre
        const finalPath = path ? path.reverse() : [];
    
        return [finalPath, descendPath];
    }
    else {
        return [ null, null];
    }
}



/**
 * Trouve le chemin entre une personne et son ancêtre, avec les conjoints
 * @param {string} startId - ID de la personne de départ
 * @param {string} targetAncestorId - ID de l'ancêtre cible
 * @returns {Array} [finalPath, descendPath, pathWithSpouses] où pathWithSpouses contient les conjoints
 */
function findAncestorPathNew(startId, targetAncestorId) {
    // Sauvegarder et modifier temporairement nombre_generation
    const savedGen = state.nombre_generation;
    // console.log("Nombre generation sauvé:", savedGen);
    state.nombre_generation = 100; // Valeur temporaire élevée

    // Construire l'arbre des descendants depuis l'ancêtre cible
    const descendantTree = buildDescendantTree(targetAncestorId);
    
    // Restaurer nombre_generation
    state.nombre_generation = savedGen;

    // Fonction pour trouver un nœud et son chemin dans l'arbre, avec les infos complètes
    function findNodeAndPath(node, targetId, currentPathIds = [], currentPathNodes = []) {
        
        if (node.id === targetId) {
            const finalPath = [...currentPathIds, node.id];
            const finalPathWithNodes = [...currentPathNodes, node];
            return { path: finalPath, nodesPath: finalPathWithNodes };
        }

        if (node.children) {
            for (const child of node.children) {
                // Si le noeud est un spouse, on vérifie si on a déjà trouvé un chemin par l'autre branche
                if (child.isSpouse) {
                    continue;
                }
                const result = findNodeAndPath(
                    child, 
                    targetId, 
                    [...currentPathIds, node.id],
                    [...currentPathNodes, node]
                );
                if (result) {
                    return result;
                }
            }
        }
        return null;
    }

    // Trouver le chemin depuis l'ancêtre jusqu'à la racine actuelle
    const result = findNodeAndPath(descendantTree, startId, [], []);
    
    if (result) {
        const { path, nodesPath } = result;
        const descendPath = [...path]; // Crée une copie du tableau

        // Inverser le chemin pour aller de la racine vers l'ancêtre
        const finalPath = path ? path.reverse() : [];
        const finalNodesPath = [...nodesPath].reverse();
        

        // Construire le chemin avec les conjoints
        const pathWithSpouses = buildPathWithSpouses(finalNodesPath, finalPath);

        return [finalPath, descendPath, pathWithSpouses];
    } else {
        return [null, null, null];
    }
}

/**
 * Construit le chemin avec les informations des conjoints
 * @param {Array} nodesPath - Chemin avec les nœuds complets de l'arbre
 * @param {Array} idsPath - Chemin avec seulement les IDs
 * @returns {Array} Tableau d'objets avec personne et conjoint
 */
function buildPathWithSpouses(nodesPath, idsPath) {
    const pathWithSpouses = [];

    for (let i = 0; i < idsPath.length; i++) {
        const personId = idsPath[i];
        const person = state.gedcomData.individuals[personId];
        
        if (!person) {
            pathWithSpouses.push({
                person: { id: personId, name: "Personne inconnue" },
                spouse: null
            });
            continue;
        }

        let spouseInfo = null;

        // Pour le premier nœud (l'ancêtre racine), vérifier s'il a des spouses dans le nœud
        if (i === 0 && nodesPath[0] && nodesPath[0].spouses && nodesPath[0].spouses.length > 0) {
            const firstSpouse = nodesPath[0].spouses[0];
            spouseInfo = {
                id: firstSpouse.id,
                name: firstSpouse.name,
                birthDate: firstSpouse.birthDate,
                deathDate: firstSpouse.deathDate,
                sex: firstSpouse.sex,
                mainBranch: 100,
            };
        } 
        // Pour les autres nœuds, chercher le conjoint de cette personne
        else if (i < idsPath.length - 1) {
            // Trouver le conjoint de la personne actuelle en cherchant dans ses familles
            if (person.spouseFamilies && person.spouseFamilies.length > 0) {
                const firstSpouseFamily = state.gedcomData.families[person.spouseFamilies[0]];
                if (firstSpouseFamily) {
                    const spouseId = firstSpouseFamily.husband === personId 
                        ? firstSpouseFamily.wife 
                        : firstSpouseFamily.husband;
                    
                    if (spouseId) {
                        const spouse = state.gedcomData.individuals[spouseId];
                        if (spouse) {
                            spouseInfo = {
                                id: spouseId,
                                name: spouse.name,
                                birthDate: spouse.birthDate,
                                deathDate: spouse.deathDate,
                                sex: spouse.sex,
                                mainBranch: 110,
                            };
                        }
                    }
                }
            }
        }
        // Pour le dernier nœud (la personne de départ), chercher son conjoint principal
        else {
            if (person.spouseFamilies && person.spouseFamilies.length > 0) {
                const firstSpouseFamily = state.gedcomData.families[person.spouseFamilies[0]];
                if (firstSpouseFamily) {
                    const spouseId = firstSpouseFamily.husband === personId 
                        ? firstSpouseFamily.wife 
                        : firstSpouseFamily.husband;
                    
                    if (spouseId) {
                        const spouse = state.gedcomData.individuals[spouseId];
                        if (spouse) {
                            spouseInfo = {
                                id: spouseId,
                                name: spouse.name,
                                birthDate: spouse.birthDate,
                                deathDate: spouse.deathDate,
                                sex: spouse.sex,
                                mainBranch: 120,
                            };
                        }
                    }
                }
            }
        }
        pathWithSpouses.push({
            person: {
                id: personId,
                name: person.name,
                birthDate: person.birthDate,
                deathDate: person.deathDate,
                sex: person.sex,
                mainBranch: 130,
            },
            spouse: spouseInfo
        });
    }
    return pathWithSpouses;
}



/**
 * Trouve un nœud dans l'arbre D3 actuel
 * @private
 */
function findNodeInTree(nodeId) {
    let foundNode = null;
    d3.selectAll('.node').each(function(d) {
        if (d.data.id === nodeId) {
            foundNode = d;
        }
    });
    return foundNode;
}

/**
 * Lance l'animation d'expansion vers l'ancêtre
 * @export
 */
function simplifyName(fullName) {
    // Séparer le nom entre les barres obliques
    const nameParts = fullName.split('/');
    
    // Traiter les prénoms
    const firstNames = nameParts[0].trim().split(' ');
    let firstFirstName = firstNames[0]; // Garder uniquement le premier prénom
    
    // Traiter le nom de famille
    let lastName = nameParts[1] ? nameParts[1].trim() : '';
    
    // Convertir le nom de famille en format Titre (première lettre majuscule, reste en minuscule)
    if (lastName.length > 0) {
        lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();
    }
    
    // Même traitement pour le prénom si nécessaire
    firstFirstName = firstFirstName.charAt(0).toUpperCase() + firstFirstName.slice(1).toLowerCase();
    
    // Combiner le premier prénom et le nom de famille
    return `${firstFirstName} ${lastName}`;
}




/*  NOUVEAU CODE BON pour nouveau Chrome */
// Variable globale pour suivre si la synthèse vocale a été initialisée
// let state.speechSynthesisInitialized = false;
let errorInSpeechInit = false;

// Fonction d'initialisation de la synthèse vocale à exécuter au chargement
export function initSpeechSynthesis(voice) {
    if ('speechSynthesis' in window && !state.speechSynthesisInitialized) {
        console.log("🎤 Initialisation de la synthèse vocale... avec ", voice);
        // Créer et jouer une utterance silencieuse pour initialiser le moteur
        const initUtterance = new SpeechSynthesisUtterance("");
        initUtterance.volume = 0.00; // Muet
        initUtterance.rate = 1.0; // 
        initUtterance.voice = voice; // 
        initUtterance.onend = () => {
            console.log("🎤 Synthèse vocale initialisée avec succès avec ", voice);
            state.speechSynthesisInitialized = true;
            
            // Tentative de déblocage audio HTML
            new Audio().play().catch(() => {});
        };
        initUtterance.onerror = (err) => {
            console.log("🎤 Erreur lors de l'initialisation de la synthèse vocale:", err, ", avec ", voice);
            state.speechSynthesisInitialized = true; // Considérer comme initialisé quand même
            errorInSpeechInit = true;
        };
        
        // Forcer le chargement des voix
        // window.speechSynthesis.getVoices();
        
        // Jouer l'utterance silencieuse
        window.speechSynthesis.speak(initUtterance);
    }
}


function noSpeechAvailableMessage() {

    // Crée une petite fenêtre modale
    const modal = document.createElement('div');
    modal.innerHTML = `
        <div style="
        position: fixed;
        top: 0; left: 0;
        width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.5);
        display: flex; align-items: center; justify-content: center;
        z-index: 9999;
        ">
        <div style="
            background: white;
            color: #333;
            border-radius: 12px;
            padding: 20px 30px;
            max-width: 320px;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            font-family: sans-serif;
        ">
            <h3 style="margin-top:0">${noSpeechSynthesisTitle}</h3>
            <p>${noSpeechSynthesisText}</p>
            <button id="closeModalBtn" style="
            margin-top: 10px;
            background: #0078d7;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 8px 16px;
            cursor: pointer;
            ">OK</button>
        </div>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('closeModalBtn').addEventListener('click', () => {
        modal.remove();
    });
}


/* */
export async function testSpeechSynthesisHealth(timeout = 1000) {
    // console.log("🔍 Test de la santé de la synthèse vocale...");

    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
    // if (true) {
        console.warn("Synthèse vocale non supportée par ce navigateur");
        noSpeechAvailableMessage();
        state.isSpeechEnabled = false;
        state.isSpeechSynthesisAvailable = false;
        return false;
    }
    return new Promise((resolve) => {
      let ok = false;
  
      const utterance = new SpeechSynthesisUtterance("\u00A0"); // un espace insécable = muet
      utterance.volume = 0; // au cas où
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.lang = "fr-FR";
  
      utterance.onend = () => {
        ok = true;
        resolve(true);
      };
  
      utterance.onerror = () => {
        resolve(false);
      };
  
      try {
        speechSynthesis.cancel(); // on nettoie avant test
        speechSynthesis.speak(utterance);
      } catch (e) {
        resolve(false); // fail safe
      }
  
      setTimeout(() => {
        if (!ok) resolve(false); // timeout = bloqué
      }, timeout);
    });
}


// export function selectVoice() {

//     if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
//         return;
//     } else if (state.selectedVoice === null){ 
//         // Sélectionner une voix française si possible
//         let voices = window.speechSynthesis.getVoices();
        
//         // console.log("Voix disponibles:",voices);

//         // debugLog("=== Liste des voix disponibles ===");
//         // voices.forEach(voice => {
//         //     debugLog(`Voix: ${voice.name}
//         //     - Langue: ${voice.lang}
//         //     - Local: ${voice.localService}
//         //     - Par défaut: ${voice.default}
//         //     - URI: ${voice.voiceURI}
//         //     ---------------------`);
//         // });

//         // Trouver les voix françaises disponibles
//         // let frenchVoices = voices.filter(voice => 
//         //     // voice.lang.startsWith('fr-FR') && 
//         //     voice.lang.startsWith(voice_language) && !voice.name.includes('ulti'));

//         let frenchVoices = voices.filter(voice => 
//             voice.lang.startsWith(voice_language) && 
//             !voice.name.includes('ulti') &&  // Évite Multi/multilingue
//             !voice.voiceURI.includes('eloquence')  // Évite les voix pourries sur IOS
//         );


            
//         // Chercher la première voix contenant 'compact'
//         const compactVoice = frenchVoices.find(voice => voice.voiceURI.toLowerCase().includes('compact'));

//         if (compactVoice) {
//             // Si on trouve une voix 'compact', la mettre en première position
//             frenchVoices = [
//                 compactVoice,
//                 ...frenchVoices.filter(voice => voice !== compactVoice)
//             ];
//         }


//         let localVoices = voices.filter(voice => voice.localService);

//         if (localVoices.length != 0) {
//             console.log("Voix locales disponibles:", localVoices, localVoices.map(v => v.name));
//             localVoice = localVoices[0];
//         } 







//         // console.log("Voix françaises France disponibles:", frenchVoices, frenchVoices.map(v => v.name));

//         if (frenchVoices.length === 0) {
//             frenchVoices = voices.filter(voice => 
//                 // voice.lang.startsWith('fr-') || 
//                 (voice.lang.startsWith(voice_language_short) && !voice.voiceURI.includes('eloquence')) || 
//                 (voice.name.toLowerCase().includes('french') && !voice.voiceURI.includes('eloquence'))
//             );
//             // console.log("Voix françaises autres disponibles:", frenchVoices.map(v => v.name));
//         } 
//         if (frenchVoices.length === 0) {
//             frenchVoices = voices.filter(voice => 
//                 voice.lang.startsWith('en-') && !voice.voiceURI.includes('eloquence') );

//             if (frenchVoices.length === 0) {
//                 frenchVoices = voices.filter(voice =>
//                     voice.localService);
//                 }
//             // console.log("Voix anglaise ou locales disponibles:", frenchVoices.map(v => v.name));
//         }

        
//         console.log("✅ or ⚠️ Connexion Internet ?", isOnline);
        
        
//         if (!isOnline) {
//             frenchVoices = voices.filter(voice =>
//                 // voice.lang.startsWith('fr-') && voice.localService);
//                 voice.lang.startsWith(voice_language_short) && !voice.voiceURI.includes('eloquence') && voice.localService);
//             console.log("Voix disponibles locales fr-:", frenchVoices);
//             if (frenchVoices.length === 0) {
//                 frenchVoices = voices.filter(voice =>
//                     voice.lang.startsWith('en-') &&!voice.voiceURI.includes('eloquence') && voice.localService);
//                 console.log("Voix disponibles locales en-:", frenchVoices);
//             }
//             if (frenchVoices.length === 0) {
//                 frenchVoices = voices.filter(voice =>
//                     voice.localService);
//                 console.log("Voix disponibles locales:", frenchVoices);
//             }   

//             // console.log("Voix françaises ou autres locales disponibles hors lignes :", frenchVoices.map(v => v.name));
//         }


//         if (frenchVoices.length != 0) {
//             console.log("Voix  disponibles:", frenchVoices.map(v => v.name));
//         }







        
//         // Choisir la meilleure voix française  
//         // Si en ligne, préférer les voix de haute qualité (généralement Google ou Microsoft)
//         if (isOnline) {
//             // Chercher d'abord les voix Google ou Microsoft qui sont généralement de meilleure qualité
//             state.frenchVoice = frenchVoices.find(voice => 
//                 voice.name.includes('Google') || 
//                 voice.name.includes('Microsoft')
//             );


//             // state.frenchVoice = frenchVoices[3];
            
//             if (state.frenchVoice) {
//                 console.log("✅ Utilisation de la voix réseau haute qualité:", state.frenchVoice.name, ', localService=', state.frenchVoice.localService);
//             } else if (frenchVoices.length != 0) {
//                 // Sélectionner la première voix française disponible
//                 state.frenchVoice = frenchVoices[0];
//                 console.log("ℹ️ Utilisation de la voix  ?:", state.frenchVoice.name, ', localService=', state.frenchVoice.localService);
//             }

//         } else {
//             if (frenchVoices.length != 0) {
//                 // Sélectionner la première voix française disponible
//                 state.frenchVoice = frenchVoices[0];
//                 console.log("ℹ️ Utilisation de la voix locale:", state.frenchVoice.name, ', localService=', state.frenchVoice.localService);
//             } else {
//                 console.log("⚠️ Aucune voix disponible hors ligne ");
//             }
//         }


//         if (state.frenchVoice) {
//             console.log("Voix  sélectionnée:", state.frenchVoice);
//             debugLog(`Version 1.6, Voix sélectionnée:, ${state.frenchVoice.name}, localService=, ${state.frenchVoice.localService}`);
//         }

        
//         // // Si pas de voix réseau ou hors ligne, utiliser une voix locale
//         // if (!frenchVoice) {
//         //     // Sélectionner la première voix française disponible
//         //     frenchVoice = frenchVoices[0];
            
//         //     if (frenchVoice) {
//         //         console.log("ℹ️ Utilisation de la voix locale:", frenchVoice.name, ', localService=', frenchVoice.localService);
//         //     } else {
//         //         console.log("⚠️ Aucune voix française disponible, utilisation de la voix par défaut");
//         //     }
//         // }
    

//     }






// }

/* */
// export function speakPersonName(personName, isFullText = false, isFast = false) {
//     // Initialiser la synthèse vocale si ce n'est pas déjà fait
//     if (!state.speechSynthesisInitialized) {
//         console.log("🔄 Premier appel à la synthèse vocale - initialisation... avec french voice");
//         if (state.frenchVoice) {
//             initSpeechSynthesis(state.frenchVoice);

//             // Ajouter un petit délai pour laisser le temps à l'initialisation
//             return new Promise(resolve => {
//                 setTimeout(() => {
//                     // Réappeler la fonction après initialisation
//                     speakPersonName(personName, isFullText, isFast).then(resolve);
//                 }, 200);
//             });
//         }
//     }
    
    
//     // Vérifier si le son est activé
//     if (!state.isSpeechEnabled) {
//         return new Promise(resolve => setTimeout(resolve, 1600));
//     }
    

//     return new Promise((resolve, reject) => {

//         // Vérifier si le son est activé
//         if (!state.isSpeechEnabled) {
//             // console.log("🔇 Son désactivé - résolution immédiate");
//             resolve();
//             return;
//         }

//         if (!('speechSynthesis' in window)) {
//             console.log("❌ API SpeechSynthesis non disponible - résolution immédiate");
//             resolve();
//             return;
//         }


//         // Simplifier le nom avant lecture
//         // const simplifiedName = simplifyName(personName);
//         // console.log(`📝 Nom simplifié: ${simplifiedName}, index : ${animationState.currentIndex}`);



//         let textToSpeak;
//         if (isFullText) {
//             // Pour les phrases complètes : pas de simplification
//             textToSpeak = personName.trim();
//             console.log(`📝 Texte complet à lire: ${textToSpeak}`);
//         } else {
//             // Pour les noms de personnes : utiliser simplifyName comme avant
//             textToSpeak = simplifyName(personName);
//             console.log(`📝 Nom simplifié: ${textToSpeak}, index : ${animationState.currentIndex}`);
//         }



//         // Ajustement dynamique du timeout en fonction de la longueur du nom
//         let timeOutDuration = Math.max(1800, textToSpeak.length * 150); // Base de 150ms par lettre, minimum 1800ms



//         // Ajustements spéciaux pour les noms (pas pour le texte complet)
//         if (!isFullText) {
        
//             if (animationState.currentIndex === 0) {
//                 console.log("🔄 Premier nom - forçage taux initial à 1.2");
//                 // optimalSpeechRate = 1.0;//1.2;
//                 optimalSpeechRate = state.voice_rate;
//                 timeOutDuration = Math.max(state.isSpeechInGoodHealth ? 3500 : 2500, timeOutDuration);
//             }
//             if (animationState.currentIndex === 1) {
//                 console.log("🔄 Deuxième nom - ajustement taux");
//                 // optimalSpeechRate = 1.0; //1.2;
//                 optimalSpeechRate = state.voice_rate;
//                 timeOutDuration = Math.max(state.isSpeechInGoodHealth ? 2500 : 1600, timeOutDuration);
//             }
//         } else {
//             // Pour le texte complet : timeout plus généreux
//             timeOutDuration = Math.max(4000, textToSpeak.length * 120);
//             // optimalSpeechRate = 1.0; // Vitesse normale pour le texte
//             optimalSpeechRate = state.voice_rate;





//         }


//         if (isFast) {
//             timeOutDuration = Math.max(500, textToSpeak.length * 80); // Base de 100ms par lettre, minimum 1200ms
//             // optimalSpeechRate = 1.2;
//             optimalSpeechRate = parseFloat(state.voice_rate) + 0.2;
//         }



//         // contournement pour Chrome qui ne fonctionne pas bien avec la synthèse vocale
//         let safetyTimeout;

//         //Ajouter un timeout de sécurité qui résoudra la promesse après 3 secondes quoi qu'il arrive
//         safetyTimeout = setTimeout(() => {
//             if (state.isSpeechSynthesisAvailable) {window.speechSynthesis.cancel();} // Annuler toute synthèse en cours
//             resolve(); // Résoudre la promesse pour continuer l'animation
//         }, timeOutDuration);


//         // Paramètres initiaux
//         const targetDuration = 1500; // 1.5 seconde pour lire le nom
//         const maxRate = 2.7; // Vitesse maximale
//         const minRate = 0.8; // Vitesse minimale
        

       
        
//         async function measureSpeechDuration(rate) {
//             return new Promise((innerResolve) => {
//                 // const utterance = new SpeechSynthesisUtterance(simplifiedName);



//                 window.speechSynthesis.cancel();


//                 const utterance = new SpeechSynthesisUtterance(textToSpeak);
                
//                 utterance.rate = rate;
//                 utterance.lang = 'fr-FR';
//                 // utterance.volume = 1.0;
//                 utterance.volume = state.voice_volume;               
//                 utterance.pitch = state.voice_pitch;     

//                 const startTime = Date.now();

//                 utterance.onend = () => {
//                     const duration = Date.now() - startTime;
//                     console.log(`✅ Fin utterance après ${duration}ms , rate: ${utterance.rate }, safetyTimeout :${safetyTimeout}, isFast: ${isFast}`);
                    
//                     innerResolve({ 
//                         rate: rate, 
//                         duration: duration
//                     });
//                 };

//                 utterance.onerror = (event) => {
//                     console.log(`❌ Erreur utterance: ${event.error} , rate: ${utterance.rate }, safetyTimeout :${safetyTimeout}, isFast: ${isFast}`);
                
//                     // Si l'erreur est 'interrupted', utiliser une durée estimée plutôt que Infinity
//                     if (event.error === 'interrupted') {
//                         const elapsedTime = Date.now() - startTime;
//                         console.log(`⏱️ Temps écoulé avant interruption: ${elapsedTime}ms`);
                
//                         // Utiliser le temps écoulé comme approximation
//                         const estimatedDuration = Math.min(1500, elapsedTime * 1.5);
//                         // console.log(`📊 Durée estimée: ${estimatedDuration}ms`);
                
//                         innerResolve({ 
//                             rate: rate, 
//                             duration: estimatedDuration
//                         });
//                     } else {
//                         console.log(`🔧 Autre erreur, durée par défaut utilisée`);
//                         innerResolve({ 
//                             rate: rate, 
//                             duration: 1500
//                         });
//                     }
//                 };
                

//                 if (state.frenchVoice) {
//                     console.log(`✅  🇫🇷 Voix française sélectionnée: ${state.frenchVoice.name}`, state.selectedVoiceName, state.frenchVoice);
//                     utterance.voice = state.frenchVoice;
//                 }

//                 window.speechSynthesis.speak(utterance);
//             });
//         }

//         async function adaptiveSpeech() {
//             try {
//                 // console.log(`⚙️ DÉBUT adaptiveSpeech avec taux: ${optimalSpeechRate}`);
//                 // pour bug de chrome
//                 if (state.isSpeechSynthesisAvailable) {
//                     if (!state.isSpeechInGoodHealth) {
//                         const silentUtterance = new SpeechSynthesisUtterance(' ');
//                         window.speechSynthesis.speak(silentUtterance);
//                         window.speechSynthesis.cancel();
//                     }
//                     // console.log('\n\n\ ------ debug call to measureSpeechDuration with rate= ', optimalSpeechRate)
//                     const result = await measureSpeechDuration(optimalSpeechRate);
//                 }
                
//                 clearTimeout(safetyTimeout); // Annuler le timeout si tout s'est bien passé
//                 resolve();
//             } catch (error) {
//                 console.error(`❌ Erreur dans la synthèse vocale:`, error);
//                 clearTimeout(safetyTimeout);
//                 resolve(); // Résoudre malgré l'erreur
//             }
//         }

//         // Lancer la lecture adaptative
//         return adaptiveSpeech();
//     });

// }




export async function speakPersonName(personName, isFullText = false, isFast = false) {



    let textToSpeak;
    if (isFullText) {
        // Pour les phrases complètes : pas de simplification
        textToSpeak = personName.trim();
        console.log(`📝 Texte complet à lire: ${textToSpeak}`);
    } else {
        // Pour les noms de personnes : utiliser simplifyName comme avant
        textToSpeak = simplifyName(personName);
        console.log(`📝 Nom simplifié: ${textToSpeak}, index : ${animationState.currentIndex}`);
    }


    await speakTextWithWaitToEnd(textToSpeak) ;


    // speakText(textToSpeak) ;


}


/* */

let origineGenNb;
let treeModeBackup;



// Fonction utilitaire pour créer un délai bloquant
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//#####################################################
export async function startAncestorAnimation() {
    disableFortuneModeClean();
    disableFortuneModeWithLever();

    origineGenNb = state.nombre_generation;
    console.log("\n\n🔄 Démarrage de l'animation vers l'ancêtre avec nombre_generation =", state.nombre_generation,', animationState.currentIndex=', animationState.currentIndex);

    if (animationState.currentIndex === 0) {
        state.nombre_generation = 2;
        displayGenealogicTree(null, true, false);        
    }

    state.isFullResetAnimationRequested = false; 

    trackPageView('treeAnimation');
    // playEndOfAnimationSound();
    
    // Vérifier que visitedNodeIds est bien un Set
    if (!(animationState.visitedAncestorNodeIds instanceof Set)) {
        console.warn("visitedNodeIds n'est pas un Set, conversion...");
        const oldValues = Array.isArray(animationState.visitedAncestorNodeIds) 
            ? animationState.visitedAncestorNodeIds 
            : [];
        animationState.visitedAncestorNodeIds = new Set(oldValues);
    }
    if (!(animationState.visitedDescendantNodeIds instanceof Set)) {
        console.warn("visitedNodeIds n'est pas un Set, conversion...");
        const oldValues = Array.isArray(animationState.visitedDescendantNodeIds) 
            ? animationState.visitedDescendantNodeIds 
            : [];
        animationState.visitedDescendantNodeIds = new Set(oldValues);
    }
    
    let step_duration = 1;
    if (!state.isSpeechEnabled2) { step_duration = 0.2; }
    else { step_duration = 1; }

    animationState.direction = 'ancestor';
    addHighlightStyle();

    if (state.isSpeechEnabled2)
    {
        state.isSpeechInGoodHealth = await testSpeechSynthesisHealth();
        if (state.isSpeechInGoodHealth) {
            // Chrome ou Edge est coopératif
            console.log("✅ La synthèse vocale est prête et fonctionne correctement.");
        } else {
            // Chrome est grognon il faut utiliser une méthode de secours
            console.log("⚠️ La synthèse vocale ne fonctionne pas correctement. Utilisation de la méthode de secours.");
            if (state.isSpeechSynthesisAvailable) {window.speechSynthesis.cancel();}
        }
    }

    initAnimationMap();
    initBackgroundContainer(); // Initialiser le conteneur de fond

    state.lastHorizontalPosition = 0;
    state.lastVerticalPosition = 0;
    let firstTimeShift = true;
    let offsetX = 0;
    let offsetY = 0;    
    
    // Créer un contrôleur pour pouvoir annuler l'animation
    animationController = {
        isCancelled: false,
        cancel: function() {
            this.isCancelled = true;
        }
    };

    treeModeBackup =  state.treeModeReal;

    let rootId = state.rootPersonId.id;
   
    // Réinitialiser ou initialiser l'état si ce n'est pas déjà fait
    if (animationState.path.length === 0) {
        [animationState.path, animationState.descendpath] = findAncestorPath(state.rootPersonId, state.targetAncestorId);
       
        console.log("\n\n\n DEBUG animationState.path avec", state.rootPersonId, "et ", state.targetAncestorId, animationState.path)
        
        rootId = state.rootPersonId;
        //Pour affichage du path  : a supprimer en opérationnel
        // console.log("Chemins trouvé et conjoints  avec", rootId, "et ", state.targetAncestorId, findAncestorPathNew(rootId, state.targetAncestorId));
   
        // si la personne root ne permet pas de faire la démo, on change avec la personne root de base
        if (!animationState.path) {

            if (state.treeOwner === 2 ) {
                state.rootPersonId = searchRootPersonId('faustine d');
            } else if (state.treeOwner === 3 ) {
                state.rootPersonId = searchRootPersonId('laurence m');
            } else if (state.treeOwner === 4 ) {
                state.rootPersonId = searchRootPersonId('nadine c');
            } else if (state.treeOwner === 5 ) {
                state.rootPersonId = searchRootPersonId('giovanna sa');
            } else if (state.treeOwner === 6 ) {
                // state.rootPersonId = searchRootPersonId('pierre le');
                state.rootPersonId = findYoungestPerson();
            } else {
                state.rootPersonId = searchRootPersonId('emma a');
            }
            
            console.log("\n\n\n DEBUG state.rootPersonId", state.rootPersonId)
            if (state.rootPersonId) {

                if (state.treeModeReal==='descendants'|| state.treeModeReal==='directDescendants')  {
                    const tempPerson = state.gedcomData.individuals[state.targetAncestorId];
                    state.currentTree =  buildDescendantTree(tempPerson.id);
                }
                else {
                    state.currentTree = (state.treeMode === 'directDescendants' || state.treeMode === 'descendants' )
                        ? buildDescendantTree(state.rootPersonId)
                        : (state.treeMode === 'directAncestors' || state.treeMode === 'ancestors' )
                        ? buildAncestorTree(state.rootPersonId.id)
                        : buildCombinedTree(state.rootPersonId.id); // Pour le mode 'both'
                }
                drawTree(); 
                console.log("\n\n\n DEBUG findAncestorPath with ", state.rootPersonId , state.targetAncestorId, findAncestorPath(state.rootPersonId.id, state.targetAncestorId))
                animationState.path = [];
                animationState.descendpath = [];
                [animationState.path, animationState.descendpath] = findAncestorPath(state.rootPersonId.id, state.targetAncestorId);
                console.log("\n\n\n DEBUG animationState.path  after  ", animationState.path)

                 rootId = state.rootPersonId.id;
                //Pour affichage du path  : a supprimer en opérationnel
                // console.log("Chemins trouvé et conjoints  avec", rootId, "et ", state.targetAncestorId, findAncestorPathNew(rootId, state.targetAncestorId));
            }
        }

        if (animationState.path) {
            /////////////////
            //Pour affichage du path  : a supprimer en opérationnel
            const [unused1, unused2, pathWithSpouses] = findAncestorPathNew(rootId, state.targetAncestorId);
            if (pathWithSpouses) {
                console.log("Chemin avec conjoints :", pathWithSpouses);
                pathWithSpouses.forEach((entry, index) => {
                    console.log(`${index + 1}. ${entry.person.name} (${entry.person.birthDate}-${entry.person.deathDate})  ${entry.spouse ? `+ ${entry.spouse.name} (${entry.spouse.birthDate}-${entry.spouse.deathDate})` : ''}`);
                });
            }
            ////////////////////////////
            


            let pathWithName = [];
            for (let i = 0; i < animationState.path.length; i++) {
                const person = state.gedcomData.individuals[animationState.path[i]];
                if (person) {
                    const simplifiedName = simplifyName(person.name);
                    // pathWithName.push(`${i + 1}. ${simplifiedName}`);
                    pathWithName.push(`${person.name} (${person.birthDate}-${person.deathDate})`);
                } else {
                    pathWithName.push(`${i + 1}. Personne inconnue`);   
                }
            }
            console.log("Chemin trouvé:", animationState.path);
            console.log("Chemin trouvé avec noms:", pathWithName);

            // console.log("Chemin trouvé descendant:", animationState.descendpath);
            if (state.targetCousinId != null) {
                [animationState.cousinPath, animationState.cousinDescendantPath] = findAncestorPath(state.targetCousinId, state.targetAncestorId);
                state.treeModeReal = 'directAncestors';
                console.log("Chemin cousin trouvé:", animationState.cousinPath);
                console.log("Chemin cousin trouvé descendant:", animationState.cousinDescendantPath);
            }
            
            if (state.treeModeReal === 'descendants' || state.treeModeReal === 'directDescendants' ) {
                animationState.path = animationState.descendpath;
            }
        }
        else {
            return;
        }  
        animationState.currentIndex = 0;
        animationState.cousinCurrentIndex = 0;        
        animationState.isPaused = false;
    }

    // Initialiser la carte au début de l'animation
    let deltaXRatio = 2; // Ratio de décalage horizontal
    if (window.innerWidth < 400) { deltaXRatio = 2; } // Pour les petits écrans, on


    if (state.isSpeechEnabled2 && state.isSpeechSynthesisAvailable ) {
        // selectVoice();
        state.isVoiceSelected = true;
    } else { state.isVoiceSelected = false;}

    let svg = d3.select("#tree-svg");
    state.lastTransform = getLastTransform() || d3.zoomIdentity;  
    state.previousWindowInnerWidthInMap = window.innerWidth;
    state.previousWindowInnerHeightInMap = window.innerHeight;
    state.prevPrevWindowInnerWidthInMap = window.innerWidth;
    state.prevPrevWindowInnerHeightInMap = window.innerHeight;

    return new Promise(async (resolve, reject) => {
        try {
            let i;
            let nodeId;
            let node

            //#############################   montée vers l'ancêtre   ############################################//
            // Reprendre à partir de l'index actuel
            for (i = animationState.currentIndex; i < animationState.path.length; i++) {
              
                animationState.currentIndex = i;

                // pour le mode 'cousin', 4 avant la fin on passe en mode Ancestors pour laisser apparaitre les siclings qui vont permettre la descente
                if ((animationState.currentIndex > animationState.path.length - 4 ) && (state.targetCousinId != null) )
                { 
                    state.treeModeReal = 'ancestors';
                    console.log("\n\n debug -- passage en mode state.treeModeReal = 'Ancestors'")
                }
                // Vérifier si l'animation a été annulée ou mise en pause
                if (animationController.isCancelled || animationState.isPaused) {
                    break;
                }

                nodeId = animationState.path[i];
                node = findNodeInTree(nodeId);

                if (node) {

                    // Mettre en évidence le nœud actuel
                    highlightAnimationNode(nodeId, true);

                    // Chercher un lieu à afficher
                    const person = state.gedcomData.individuals[node.data.id];
                    // Mettre à jour l'image de fond en fonction de la date de naissance de la personne
                    // if (person && person.birthDate) {
                    //     const year = extractYear(person.birthDate);
                    //     if (year) {
                    //         updateBackgroundImage(year);
                    //     }
                    // }

                    // Utiliser la fonction centralisée pour collecter les lieux
                    const validLocations = collectPersonLocations(person, state.gedcomData.families);

                    // Mettre à jour la carte
                    if (validLocations.length > 0) {
                        // updateAnimationMapLocations(validLocations, locationSymbols);
                        updateAnimationMapLocations(validLocations);
                    }

                    let zoom = getZoom();

                    state.lastTransform = getLastTransform() || d3.zoomIdentity;  

                    // zoom = getZoom();

                    let shiftAterRescale = false
                    let horizontalShiftAfterScreenRescale = 0;
                    let verticalShiftAfterScreenRescale = 0;

                    // si resize de l'écran il faut appliquer des offset sur la position de l'arbre
                    if (zoom && state.screenResizeHasOccured && (animationState.currentIndex > 2) ) {
                        state.screenResizeHasOccured = false;

                        if (window.innerWidth - state.prevPrevWindowInnerWidthInMap < -30) {
                            horizontalShiftAfterScreenRescale =   -(window.innerWidth - state.prevPrevWindowInnerWidthInMap)  + (state.boxWidth*1);
                        } else if (window.innerWidth - state.prevPrevWindowInnerWidthInMap > 30) {    
                            horizontalShiftAfterScreenRescale =  -(window.innerWidth - state.prevPrevWindowInnerWidthInMap) ; 
                        }

                        if (window.innerHeight - state.prevPrevWindowInnerHeightInMap < -30) {
                            verticalShiftAfterScreenRescale  =  -(window.innerHeight - state.prevPrevWindowInnerHeightInMap)/2; 
                        } else  if (window.innerHeight - state.prevPrevWindowInnerHeightInMap > 30) {    
                            verticalShiftAfterScreenRescale  = -(window.innerHeight - state.prevPrevWindowInnerHeightInMap)/2; 
                        }

                        if (horizontalShiftAfterScreenRescale != 0 || verticalShiftAfterScreenRescale != 0) { 
                            shiftAterRescale = true; 
                        }                            
                        console.log("\n\n\n\n\n #############   Recalage suite à changement de taille d'écran ############### ", shiftAterRescale, ', new:', window.innerWidth, window.innerHeight,", old=", state.prevPrevWindowInnerWidthInMap, state.prevPrevWindowInnerHeightInMap,", offset X=", -horizontalShiftAfterScreenRescale ,", offset Y=", -verticalShiftAfterScreenRescale, "\n\n\n\n\n");   
                    }


                    // Pour le 1er affichage de l'animation on décale le graphe vers le haut pour pouvoir positionner la map dessous
                    if (zoom && ( (animationState.currentIndex === 0 ) || shiftAterRescale ) ) {
                        state.lastTransform = getLastTransform() || d3.zoomIdentity;                      
                    
                        offsetY = 0;
                        if (animationState.currentIndex === 0) {
                            if (window.innerHeight > 1000) {
                                offsetY = -450;
                            } else if (window.innerHeight > 800) {
                                offsetY = -300;
                            } else {
                                offsetY = -100;
                            }
                        }
                        const horizontalShift = 0; 
                        const verticalShift = - offsetY; 

                        const transition = svg.transition()
                            .duration(750)
                            .call(zoom.transform, 
                                state.lastTransform.translate(- horizontalShift - horizontalShiftAfterScreenRescale, - verticalShift - verticalShiftAfterScreenRescale)
                            );
                        await transition.end();

                        state.lastHorizontalPosition = state.lastHorizontalPosition + horizontalShift;
                        state.lastVerticalPosition = state.lastVerticalPosition + verticalShift;
                    }

                    if (animationState.currentIndex === 0 ) {
                        // Créer une promesse qui simule la lecture vocale si le son est coupé
                        const voicePromise = (state.isSpeechEnabled &&  state.isSpeechEnabled2)
                            ? speakPersonName(node.data.name)
                            : new Promise(resolve => setTimeout(resolve, 1500*step_duration));
                        // Attendre la lecture ou le délai
                        await voicePromise;
                    }

                    const marginX = state.boxWidth/2;
                    const marginY = state.boxHeight/2;
                    let  nodeScreenPos = getNodeScreenPosition(node);
                    const [mapX, mapY, mapW, mapH] = getAnimationMapPosition('animation-map-container');
                    let deltaX = nodeScreenPos.x - (window.innerWidth - state.boxWidth*1.2);
                    let deltaY =  nodeScreenPos.y - (window.innerHeight - state.boxHeight*2 - mapH);
                    if ((nodeScreenPos.x > mapX + mapW)  && (nodeScreenPos.x < (window.innerWidth - marginX))) {
                        deltaY =  nodeScreenPos.y - (window.innerHeight - state.boxHeight*2);
                    }
                    let minX = 20;
                    let minY = 50;

                    console.log('\n\n *** DEBUG *** Le nœud ' , node.data.name,' etait à la position:  nodeScreenPos.x = ', nodeScreenPos.x, ', nodeScreenPos.y=', nodeScreenPos.y, ', deltaX=', deltaX, ', deltaY=', deltaY, ', screen=', window.innerWidth, window.innerHeight, 'map x y w h', mapX, mapY, mapW, mapH , ', nodeScreenPos.x=', nodeScreenPos.x , ', mapX=', mapX,', mapX + mapW=', mapX + mapW,'\n\n');

                    if ((nodeScreenPos.x > (window.innerWidth +500)) || (nodeScreenPos.x < -500) || (nodeScreenPos.y > (window.innerHeight+500)) || (nodeScreenPos.y < -500) ) {
                        console.log("\n\n ⚠️ ⚠️ ⚠️ Le nœud est en dehors de la fenêtre position x=", nodeScreenPos.x, ", y=", nodeScreenPos.y, " , mapX=", mapX, " , mapY=", mapY, " , mapW=", mapW, " , mapH=", mapH );
                        hardResetZoom();
                    }  

                    zoom = getZoom();
                    // décaler l'arbre vers la gauche (shift left) pour toujours voir le nouveau noeud apparaitre à droite
                    if (zoom) {
                        const svg = d3.select("#tree-svg");
                           
                        if  (((deltaX > 0)  ||  (deltaY > 0) || nodeScreenPos.x < minX || nodeScreenPos.y < minY) && (animationState.currentIndex != 0 ) ){  
                                    
                            let horizontalShift = 0; 
                            let verticalShift = 0;
                            if (deltaX > 0) { horizontalShift = deltaX;}
                            if (deltaY > 0) { verticalShift = deltaY;}

                            if (nodeScreenPos.x < minX) { horizontalShift = -(minX - nodeScreenPos.x); }
                            if (nodeScreenPos.y < minY) { verticalShift = -(minY - nodeScreenPos.y); } 

                            state.lastTransform = getLastTransform() || d3.zoomIdentity;  

                            const transition = svg.transition()
                                .duration(750)
                                .call(zoom.transform, 
                                    state.lastTransform.translate(-horizontalShift, -verticalShift) // <-- Utilise l'état AVANT la transition
                                );
                            await transition.end();

                            nodeScreenPos = getNodeScreenPosition(node);

                            console.log('\n\n ****** SHIFT X,Y =', -horizontalShift, -verticalShift, ' Le nœud ', node.data.name,'est maintenant à la position: ', nodeScreenPos.x, nodeScreenPos.y, 'screen=', window.innerWidth, window.innerHeight ,  '\n\n');
                        }
                    }

                    // Actions sur le nœud pour faire apparaitre le nouvel ascendant puis redessine l'arbre avec drawTree
                    if (!node.data.children || node.data.children.length === 0) {
                        const event = new Event('click');
                        // await delay(100);
                        // Créer une promesse qui simule la lecture vocale si le son est coupé
                        const voicePromise = (state.isSpeechEnabled &&  state.isSpeechEnabled2)
                            ? speakPersonName(node.data.name)
                            : new Promise(resolve => setTimeout(resolve, 1500*step_duration));
                        
                        // Attendre la lecture ou le délai
                        await voicePromise;

                        handleAncestorsClick(event, node);
                        // drawTree();
                    }
                    
                } 
            }

            // A la fin créer une promesse qui simule la lecture vocale pour un message de fin : et voila
            if (state.targetCousinId==null && i >= (animationState.path.length) && (!state.isFullResetAnimationRequested))
            {
                // arrêter l'audio si néccessaire
                if (node) {
                    playEndOfAnimationSound();
                    showEndAnimationPhoto(node.data.name);
                }
            }


            //####################################################################################################//
            //#############################   descente vers le cousin ############################################//
            
            if (state.targetCousinId!=null && i >= (animationState.path.length) ) {

                // console.log('\n\n\n\n ########## DÉBUT de la DESCENTE vers le cousin ###########', i, animationState.currentIndex,animationState.path.length,animationState.cousinDescendantPath.length, animationState.cousinCurrentIndex, ' \n\n');

                highlightAnimationNode(nodeId, true);
                animationState.direction = 'descendant';

                if (animationState.cousinCurrentIndex === 0 ) {
                // if(true) {
                    const voicePromiseEnd = (state.isSpeechEnabled &&  state.isSpeechEnabled2)
                    ? speakPersonName(reverseMessage)
                    : new Promise(resolve => setTimeout(resolve, 3500*step_duration));
                    // Attendre la lecture ou le délai
                    await voicePromiseEnd;
                }

                // Reprendre à partir de l'index actuel
                let j = animationState.cousinCurrentIndex;
                let lastName;
                let lastNodeIdOK = null;
                let lastNodeOK = null;
                for (let i = animationState.currentIndex; i < animationState.path.length + animationState.cousinDescendantPath.length -1; i++) {
                    
                    animationState.currentIndex = i;
                    animationState.cousinCurrentIndex = j;
                    if (animationState.currentIndex > animationState.path.length + 3 ) 
                    { 
                        state.treeModeReal = 'directAncestors';
                        console.log("\n\n debug -- passage en mode state.treeModeReal = 'directAncestors'")
                    }

                    // Vérifier si l'animation a été annulée ou mise en pause
                    if (animationController.isCancelled || animationState.isPaused) {
                        // animationState.currentIndex = i;
                        break;
                    }

                    nodeId = animationState.cousinDescendantPath[j]; 
                    node = findNodeInTree(nodeId);

                    if (node) {

                        // Mettre en évidence le nœud actuel
                        highlightAnimationNode(nodeId, true);

                        // Chercher un lieu à afficher
                        const person = state.gedcomData.individuals[node.data.id];
                        // Utiliser la fonction centralisée pour collecter les lieux
                        const validLocations = collectPersonLocations(person, state.gedcomData.families);


                        // Mettre à jour la carte
                        if (validLocations.length > 0) {
                            // updateAnimationMapLocations(validLocations, locationSymbols);
                            updateAnimationMapLocations(validLocations);
                        }

                        let zoom = getZoom();
                        const marginX = state.boxWidth/2;
                        const marginY = state.boxHeight/2;
                        let  nodeScreenPos = getNodeScreenPosition(node);
                        const [mapX, mapY, mapW, mapH] = getAnimationMapPosition('animation-map-container');
                        let deltaX = nodeScreenPos.x - (window.innerWidth - state.boxWidth*1.2);
                        let deltaY =  nodeScreenPos.y - (window.innerHeight - state.boxHeight*2 - mapH);
                        if ((nodeScreenPos.x > mapX + mapW)  && (nodeScreenPos.x < (window.innerWidth - marginX))) {
                            deltaY =  nodeScreenPos.y - (window.innerHeight - state.boxHeight*2);
                        }
                        let minX = state.boxWidth*1.5;
                        let minY = state.boxHeight*1.5;

                        console.log('\n\n *** DEBUG *** Le nœud ' , node.data.name,' etait à la position:  nodeScreenPos.x = ', nodeScreenPos.x, ', nodeScreenPos.y=', nodeScreenPos.y, ', deltaX=', deltaX, ', deltaY=', deltaY, ', screen=', window.innerWidth, window.innerHeight, 'map x y w h', mapX, mapY, mapW, mapH , ', nodeScreenPos.x=', nodeScreenPos.x , ', mapX=', mapX,', mapX + mapW=', mapX + mapW,'\n\n');

                        if ((nodeScreenPos.x > (window.innerWidth + 500 )) && (nodeScreenPos.x < -500) && (nodeScreenPos.y > (window.innerHeight + 500)) && (nodeScreenPos.y < - 500) ) {
                            console.log("\n\n ⚠️ ⚠️ ⚠️ Le nœud est en dehors de la fenêtre position x=", nodeScreenPos.x, ", y=", nodeScreenPos.y, " , mapX=", mapX, " , mapY=", mapY, " , mapW=", mapW, " , mapH=", mapH );
                        } 

                        zoom = getZoom();

                        // Créer une promesse qui simule la lecture vocale si le son est coupé
                        const voicePromise = (state.isSpeechEnabled &&  state.isSpeechEnabled2)
                            ? speakPersonName(node.data.name)
                            : new Promise(resolve => setTimeout(resolve, 1500*step_duration));
                        
                        // Attendre la lecture ou le délai
                        await voicePromise;
                        
                        // Actions sur le nœud pour faire apparaitre le nouvel descendant puis redessine l'arbre 
                        const event = new Event('click');
                        if (state.treeModeReal === 'descendants' || state.treeModeReal === 'directDescendants' ) {
                            console.log("debug handleDescendants", node);
                            handleDescendants(node);
                        } else {
                            const nextNodeId = animationState.cousinDescendantPath[Math.min(j+1, animationState.cousinDescendantPath.length-1)];
                            await handleDescendantsClick(event, node, true, nextNodeId);
                        }

                        state.prevPrevWindowInnerWidthInMap = state.previousWindowInnerWidthInMap;
                        state.prevPrevWindowInnerHeightInMap =  state.previousWindowInnerHeightInMap;
                        state.previousWindowInnerWidthInMap = window.innerWidth;
                        state.previousWindowInnerHeightInMap = window.innerHeight;

                        lastName = node.data.name
                        lastNodeIdOK = nodeId;
                        lastNodeOK = node;
                    } else {
                        console.log("\\  !!!! Noeud descendant cousin NON trouvé ? :",i,  nodeId, node);
                    }
                    j++;
                }

                console.log("\\  !!!! recalage pour dernier noeud:",  lastNodeIdOK);

               // nodeId = animationState.cousinDescendantPath[j]; 
                nodeId = lastNodeIdOK;
                node = lastNodeOK;

                node = findNodeInTree(nodeId);

                if (node) {

                    // Mettre en évidence le nœud actuel
                    highlightAnimationNode(nodeId, true);

                    // Chercher un lieu à afficher
                    const person = state.gedcomData.individuals[node.data.id];
                    // Utiliser la fonction centralisée pour collecter les lieux
                    const validLocations = collectPersonLocations(person, state.gedcomData.families);


                    // Mettre à jour la carte
                    if (validLocations.length > 0) {
                        // updateAnimationMapLocations(validLocations, locationSymbols);
                        updateAnimationMapLocations(validLocations);
                    }


                    // let zoom = getZoom();


                    // const marginX = state.boxWidth/2;
                    // const marginY = state.boxHeight/2;
                    // let  nodeScreenPos = getNodeScreenPosition(node);
                    // const [mapX, mapY, mapW, mapH] = getAnimationMapPosition('animation-map-container');
                    // let deltaX = nodeScreenPos.x - (window.innerWidth - state.boxWidth*1.2);
                    // let deltaY =  nodeScreenPos.y - (window.innerHeight - state.boxHeight*2 - mapH);
                    // if ((nodeScreenPos.x > mapX + mapW)  && (nodeScreenPos.x < (window.innerWidth - marginX))) {
                    //     deltaY =  nodeScreenPos.y - (window.innerHeight - state.boxHeight*2);
                    // }
                    // let minX = state.boxWidth*1.5;
                    // let minY = state.boxHeight*1.5;

                    // console.log('\n\n *** DEBUG *** Le nœud ' , node.data.name,' etait à la position:  nodeScreenPos.x = ', nodeScreenPos.x, ', nodeScreenPos.y=', nodeScreenPos.y, ', deltaX=', deltaX, ', deltaY=', deltaY, ', screen=', window.innerWidth, window.innerHeight, 'map x y w h', mapX, mapY, mapW, mapH , ', nodeScreenPos.x=', nodeScreenPos.x , ', mapX=', mapX,', mapX + mapW=', mapX + mapW,'\n\n');

                    // if ((nodeScreenPos.x > (window.innerWidth - marginX)) && (nodeScreenPos.x < marginX) && (nodeScreenPos.y > (window.innerHeight-marginY)) && (nodeScreenPos.y < marginY) ) {
                    //     console.log("\n\n ⚠️ ⚠️ ⚠️ Le nœud est en dehors de la fenêtre position x=", nodeScreenPos.x, ", y=", nodeScreenPos.y, " , mapX=", mapX, " , mapY=", mapY, " , mapW=", mapW, " , mapH=", mapH );
                    // } 

                    // zoom = getZoom();

                    // // décaler l'arbre vers la gauche (shift left) pour toujours voir le nouveau noeud apparaitre à droite
                    // if (false) {
                    // // if (zoom) {
                    //     const svg = d3.select("#tree-svg");
                    //     state.lastTransform = getLastTransform() || d3.zoomIdentity;  
                        
                    //     if  (((deltaX > 0)  ||  (deltaY > 0) || nodeScreenPos.x < minX || nodeScreenPos.y < minY) && (animationState.currentIndex != 0 ) ){  
                                    
                    //         let horizontalShift = 0; 
                    //         let verticalShift = 0;
                    //         if (deltaX > 0) { horizontalShift = deltaX;}
                    //         if (deltaY > 0) { verticalShift = deltaY;}
                    //         if (nodeScreenPos.x < minX) { 
                    //             if(nodeScreenPos.x < 0)  {horizontalShift = nodeScreenPos.x - minX*3;}
                    //             else {horizontalShift = -minX;}}
                    //         if (nodeScreenPos.y < minY) {                        
                    //             if(nodeScreenPos.y < 0)  {verticalShift = nodeScreenPos.y - minY*2;}
                    //             else {verticalShift = -minY;}}

                    //         const transition = svg.transition()
                    //             .duration(750)
                    //             .call(zoom.transform, 
                    //                 state.lastTransform.translate(-horizontalShift, -verticalShift) // <-- Utilise l'état AVANT la transition
                    //             );
                    //         await transition.end();

                    //         nodeScreenPos = getNodeScreenPosition(node);

                    //         console.log('\n\n ****** SHIFT X,Y =', -horizontalShift, -verticalShift, ' Le nœud ', node.data.name,'est maintenant à la position: ', nodeScreenPos.x, nodeScreenPos.y, 'screen=', window.innerWidth, window.innerHeight ,  '\n\n');
                    //     }
                    // }


                }










                // A la fin créer une promesse qui simule la lecture vocale pour un message de fin : et voila

                if (j >= (animationState.cousinDescendantPath.length) && (!state.isFullResetAnimationRequested))
                {
                    playEndOfAnimationSound();
                    showEndAnimationPhoto(lastName);
                }

                if (!state.isFullResetAnimationRequested) {
                    // const voicePromiseStart = (state.isSpeechEnabled &&  state.isSpeechEnabled2)
                    //     ? speakPersonName(endMessage)
                    //     : new Promise(resolve => setTimeout(resolve, 1600*step_duration));
                    // // Attendre la lecture ou le délai
                    // await voicePromiseStart;
                }
            }


            //####################################################################################################//
            // Si l'animation est terminée, réinitialiser l'état
            // console.log("\n\n\n\n ########## FIN de l'ANIMATION ###########", state.targetCousinId, i, animationState.currentIndex, animationState.cousinCurrentIndex ,animationState.path.length, ' \n\n');

            if ((state.targetCousinId!=null && animationState.cousinCurrentIndex >= ( animationState.cousinDescendantPath.length -1)) || 
                (state.targetCousinId === null && animationState.currentIndex >= (animationState.path.length -1 )) ) {
                // Démarquer le dernier nœud
                if (animationState.currentHighlightedNodeId) {
                    highlightAnimationNode(animationState.currentHighlightedNodeId, false);
                }
                
                // Réinitialiser l'état
                animationState.path = [];
                animationState.currentIndex = 0;
                animationState.cousinCurrentIndex = 0;
                animationState.currentHighlightedNodeId = null;
                animationState.isPaused = true;
                displayPauseButton();
            }
            resolve(); // Résoudre la promesse une fois terminé
        } catch (error) {
            console.error('Erreur dans l\'animation:', error);
            reject(error); // Rejeter en cas d'erreur
            startAncestorAnimation();

        }
        state.treeModeReal = treeModeBackup;
    });
}
//######################################################





/**
 * Retourne la position X/Y réelle du centre du nœud à l'écran
 * en utilisant getBoundingClientRect() sur l'élément SVG.
 */
export function getNodeScreenPosition(node) {
    const cleanedId = cleanIdForSelector(node.data.id);
    const selector = `#node-${cleanedId}`;
    const nodeElement = d3.select(selector).node();
    
    // --- Vérification du Fallback ---
    if (!nodeElement) {
        console.warn(`Élément de nœud SVG non trouvé pour ID: ${node.data.id}. Tentative de fallback...`);
        
        // --- NOUVELLE LOGIQUE DE FALLBACK SÉCURISÉE ---
        
        // 1. Vérifier que les coordonnées D3 (x, y) existent et sont numériques
        const d3X = parseFloat(node.y); // y est l'axe horizontal (X)
        const d3Y = parseFloat(node.x); // x est l'axe vertical (Y)
        
        if (isNaN(d3X) || isNaN(d3Y)) {
            console.error(`Coordonnées D3 manquantes ou invalides pour le nœud: ${node.data.id}. Retourne {0, 0}.`);
            // Si le layout n'a pas encore calculé les positions, on retourne un point sûr.
            return { x: 0, y: 0 }; 
        }

        // 2. Si les coordonnées D3 existent, appliquer la transformation du zoom
        const lastTransform = getLastTransform() || d3.zoomIdentity;
        const screenX = lastTransform.applyX(d3X);
        const screenY = lastTransform.applyY(d3Y);
        
        // 3. Retourner la position calculée
        return { x: screenX, y: screenY };
    }
    // --- Fin de la vérification du Fallback ---

    // 2. Si l'élément est trouvé, utiliser getBoundingClientRect() (Méthode préférée)
    const rect = nodeElement.getBoundingClientRect();
    
    // 3. Retourner le centre du nœud
    // Vérification de sécurité pour getBoundingClientRect
    if (isNaN(rect.x) || isNaN(rect.width) || isNaN(rect.y) || isNaN(rect.height)) {
         console.error(`getBoundingClientRect() a retourné des NaN. Élément trouvé mais dimensions invalides. Retourne {0, 0}.`);
         return { x: 0, y: 0 };
    }
    
    return {
        x: rect.x + rect.width / 2, 
        y: rect.y + rect.height / 2 
    };
}





export async function prepareAnimationDemo() {
    console.log("🔄 Préparation de la démo d'animation");
    
    try {
        // Demander le dossier de sauvegarde
        console.log("Sélection du dossier de sauvegarde...");
        const directoryHandle = await window.showDirectoryPicker({
            mode: 'readwrite'
        });
        
        // Trouver le chemin d'animation
        console.log("Recherche du chemin d'animation... avec ", state.rootPersonId, state.targetAncestorId);
        const [path, descendPath] = findAncestorPath(state.rootPersonId, state.targetAncestorId);
        const finalPath = state.treeModeReal === 'descendants' ? descendPath : path;
        
        console.log(`📋 Chemin d'animation: ${finalPath.length} personnes`);
        
        // Interface de progression
        const progressOverlay = document.createElement('div');
        progressOverlay.style.position = 'fixed';
        progressOverlay.style.top = '50%';
        progressOverlay.style.left = '50%';
        progressOverlay.style.transform = 'translate(-50%, -50%)';
        progressOverlay.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        progressOverlay.style.padding = '20px';
        progressOverlay.style.borderRadius = '10px';
        progressOverlay.style.zIndex = '10000';
        
        progressOverlay.innerHTML = `
            <h3>Préparation de l'animation</h3>
            <p>Personne: <span id="current-person">-</span></p>
            <p>Lieu: <span id="current-location">-</span></p>
            <p>Progression: <span id="loading-progress">0/0</span></p>
            <p>Tuiles nécessaires: <span id="tiles-found">0</span></p>
            <p>Tuiles téléchargées: <span id="tiles-downloaded">0</span></p>
            <progress id="loading-bar" value="0" max="100" style="width: 300px;"></progress>
            <button id="cancel-preload" style="margin-top: 10px; padding: 5px 10px;">Annuler</button>
        `;
        document.body.appendChild(progressOverlay);
        
        let isCancelled = false;
        document.getElementById('cancel-preload').addEventListener('click', () => {
            isCancelled = true;
            progressOverlay.innerHTML = `<p>Annulation en cours...</p>`;
        });

        // Variables pour le suivi
        let tilesFound = 0;
        let tilesDownloaded = 0;
        let processedCount = 0;
        let totalSize = 0;
        
        // Fonction pour mettre à jour l'interface
        const updateUI = () => {
            document.getElementById('loading-progress').textContent = `${processedCount}/${finalPath.length}`;
            progressBar.value = processedCount;
            document.getElementById('tiles-found').textContent = tilesFound;
            document.getElementById('tiles-downloaded').textContent = tilesDownloaded;
        };
        
        // Mettre à jour l'interface
        const progressBar = document.getElementById('loading-bar');
        progressBar.max = finalPath.length;
        
        // Niveaux de zoom à télécharger
        const zoomLevels = [5, 6, 7, 8, 9];
        
        // Stocker les tuiles qui seront nécessaires
        const necessaryTiles = new Set();
        
        // Parcourir le chemin d'animation
        for (let i = 0; i < finalPath.length; i++) {
            if (isCancelled) break;
            
            const nodeId = finalPath[i];
            const person = state.gedcomData.individuals[nodeId];
            
            if (!person) {
                processedCount++;
                updateUI();
                continue;
            }
            
            document.getElementById('current-person').textContent = person.name || `Personne ${nodeId}`;
            
            // Obtenir les lieux exactement comme dans startAncestorAnimation
            const validLocations = collectPersonLocations(person, state.gedcomData.families);
            
            console.log(`📍 ${validLocations.length} lieux trouvés pour ${person.name || nodeId}`);
            
            // Pour chaque lieu, obtenir les coordonnées et calculer les tuiles
            for (const location of validLocations) {
                if (isCancelled) break;
                
                document.getElementById('current-location').textContent = location.place;
                
                try {
                    // Obtenez les coordonnées comme dans updateAnimationMapLocations
                    const coords = await geocodeLocation(location.place);
                    
                    if (!coords || !coords.lat || !coords.lon) {
                        console.warn(`⚠️ Pas de coordonnées pour ${location.place}`);
                        continue;
                    }
                    
                    console.log(`✅ Coordonnées pour ${location.place}: ${coords.lat}, ${coords.lon}`);
                    
                    // Pour chaque niveau de zoom, calculer les tuiles visibles
                    for (const zoom of zoomLevels) {
                        // Convertir les coordonnées géographiques en coordonnées de tuile
                        const tileX = Math.floor((coords.lon + 180) / 360 * Math.pow(2, zoom));
                        const tileY = Math.floor((1 - Math.log(Math.tan(coords.lat * Math.PI / 180) + 1 / Math.cos(coords.lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
                        
                        // Ajouter les tuiles environnantes (rayon de 2 tuiles)
                        for (let x = tileX - 2; x <= tileX + 2; x++) {
                            for (let y = tileY - 2; y <= tileY + 2; y++) {
                                if (x >= 0 && y >= 0 && x < Math.pow(2, zoom) && y < Math.pow(2, zoom)) {
                                    const tileKey = `${zoom}_${x}_${y}`;
                                    if (!necessaryTiles.has(tileKey)) {
                                        necessaryTiles.add(tileKey);
                                        tilesFound++;
                                        updateUI();
                                    }
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error(`Erreur lors du géocodage de ${location.place}:`, error);
                }
            }
            
            processedCount++;
            updateUI();
        }
        
    
        // Partie modifiée pour la vérification et le téléchargement des tuiles
        console.log(`🗺️ ${necessaryTiles.size} tuiles uniques identifiées, vérification de l'existence...`);

        // Variables pour le suivi des tuiles
        let existingTiles = 0;
        let newTiles = 0;

        // Phase 2: Vérifier et télécharger les tuiles manquantes
        const tilesToDownload = Array.from(necessaryTiles);
        document.getElementById('loading-progress').textContent = `0/${tilesToDownload.length}`;
        progressBar.max = tilesToDownload.length;
        processedCount = 0;

        // Traiter les tuiles par lots plus grands pour la vérification
        const verificationBatchSize = 20; // Vérifier plus de tuiles à la fois
        const downloadedTiles = [];

        // Vérifier d'abord rapidement quelles tuiles existent déjà
        const tileExistenceMap = new Map(); // Pour stocker les résultats de vérification

        for (let i = 0; i < tilesToDownload.length; i += verificationBatchSize) {
            if (isCancelled) break;
            
            const batch = tilesToDownload.slice(i, Math.min(i + verificationBatchSize, tilesToDownload.length));
            
            // Vérifier en parallèle l'existence de chaque tuile dans ./maps/
            const verificationPromises = batch.map(async tileKey => {
                const [zoom, x, y] = tileKey.split('_').map(Number);
                const localUrl = `maps/tile_${zoom}_${x}_${y}.png`;
                
                try {
                    // Vérification rapide de l'existence dans ./maps/
                    const cacheResponse = await fetchTileWithCache(localUrl, true); // true = juste vérifier l'existence
                    
                    if (cacheResponse && cacheResponse.ok) {
                        existingTiles++;
                        tileExistenceMap.set(tileKey, true);
                        return { tileKey, exists: true };
                    }
                } catch (error) {
                    // La tuile n'existe pas dans ./maps/
                }
                
                tileExistenceMap.set(tileKey, false);
                return { tileKey, exists: false };
            });
            
            await Promise.all(verificationPromises);
            
            // Mettre à jour l'UI après chaque lot de vérifications
            processedCount += batch.length;
            updateUI();
            
            // Pas de délai entre les lots de vérification pour accélérer
        }

        console.log(`🔍 Vérification terminée: ${existingTiles}/${tilesToDownload.length} tuiles existent déjà`);

        // Récupérer la liste des tuiles manquantes à télécharger
        const missingTiles = tilesToDownload.filter(tileKey => !tileExistenceMap.get(tileKey));
        newTiles = missingTiles.length;

        // Mettre à jour l'interface pour la phase de téléchargement
        if (newTiles > 0) {
            console.log(`⬇️ Début du téléchargement de ${newTiles} tuiles manquantes`);
            
            // Réinitialiser le compteur pour le téléchargement
            processedCount = 0;
            progressBar.max = newTiles;
            document.getElementById('loading-progress').textContent = `0/${newTiles}`;
            
            // Télécharger uniquement les tuiles manquantes
            const downloadBatchSize = 3; // Plus petit pour les téléchargements
            
            for (let i = 0; i < missingTiles.length; i += downloadBatchSize) {
                if (isCancelled) break;
                
                const batch = missingTiles.slice(i, Math.min(i + downloadBatchSize, missingTiles.length));
                const downloadPromises = batch.map(async tileKey => {
                    try {
                        const [zoom, x, y] = tileKey.split('_').map(Number);
                        const tileFileName = `tile_${zoom}_${x}_${y}.png`;
                        
                        // Vérifier si la tuile existe déjà dans le répertoire cible
                        try {
                            await directoryHandle.getFileHandle(tileFileName, { create: false });
                            console.log(`ℹ️ Tuile ${tileKey} déjà présente dans le dossier cible`);
                            return { success: true, skipped: true };
                        } catch (error) {
                            // La tuile n'existe pas dans le répertoire cible, télécharger
                        }
                        
                        // Télécharger la tuile depuis OSM
                        const servers = ['a', 'b', 'c'];
                        const server = servers[Math.floor(Math.random() * servers.length)];
                        const tileUrl = `https://${server}.tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
                        
                        const response = await fetch(tileUrl);
                        if (!response.ok) {
                            throw new Error(`Erreur HTTP ${response.status}`);
                        }
                        
                        const blob = await response.blob();
                        
                        // Sauvegarder la tuile
                        const fileHandle = await directoryHandle.getFileHandle(tileFileName, { create: true });
                        const writable = await fileHandle.createWritable();
                        await writable.write(blob);
                        await writable.close();
                        
                        totalSize += blob.size;
                        tilesDownloaded++;
                        downloadedTiles.push(tileFileName);
                        
                        return { success: true, file: tileFileName };
                    } catch (error) {
                        console.error(`Erreur avec la tuile ${tileKey}: ${error.message}`);
                        return { success: false, error: error.message };
                    } finally {
                        processedCount++;
                        updateUI();
                    }
                });
                
                await Promise.all(downloadPromises);
                
                // Délai seulement pour les téléchargements
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        } else {
            console.log("✅ Toutes les tuiles existent déjà, aucun téléchargement nécessaire");
        }

        // Mise à jour du manifest avec les tuiles existantes et nouvelles
        const allTileFileNames = tilesToDownload.map(tileKey => {
            const [zoom, x, y] = tileKey.split('_').map(Number);
            return `tile_${zoom}_${x}_${y}.png`;
        });


        // Après avoir terminé le téléchargement des tuiles manquantes

        // Étape finale: Créer un manifest complet précis
        console.log("🔄 Génération d'un manifest complet...");

        try {
            // 1. Scanner les tuiles dans le dossier ./maps/
            console.log("🔍 Scan du dossier ./maps/...");
            
            // Ensemble pour stocker les chemins des tuiles uniques
            const allTileUrls = new Set();
            const zoomLevelsFound = new Set();
            
            // Collecter les tuiles du dossier local
            let localTilesCount = 0;
            
            // Utiliser fetch pour accéder au dossier local (nécessite un serveur qui expose le contenu)
            async function scanLocalDirectory() {
                try {
                    // Rechercher directement tous les fichiers .png du dossier maps
                    // Cette approche suppose que votre serveur est configuré pour permettre cette requête
                    const response = await fetch('/maps/');
                    
                    if (!response.ok) {
                        throw new Error("Impossible d'accéder au dossier maps");
                    }
                    
                    const text = await response.text();
                    
                    // Extraire tous les noms de fichiers de tuiles
                    const tilePattern = /href=['"]([^'"]*tile_\d+_\d+_\d+\.png)['"]/g;
                    let match;
                    
                    while ((match = tilePattern.exec(text)) !== null) {
                        const tilePath = match[1];
                        const fileName = tilePath.split('/').pop();
                        
                        if (fileName && fileName.match(/^tile_\d+_\d+_\d+\.png$/)) {
                            allTileUrls.add(fileName);
                            localTilesCount++;
                            
                            // Extraire le niveau de zoom
                            const zoomMatch = fileName.match(/^tile_(\d+)_\d+_\d+\.png$/);
                            if (zoomMatch) {
                                zoomLevelsFound.add(parseInt(zoomMatch[1]));
                            }
                        }
                    }
                    
                    console.log(`✅ ${localTilesCount} tuiles trouvées dans ./maps/`);
                    return true;
                } catch (error) {
                    console.warn("⚠️ Erreur lors du scan de ./maps/:", error);
                    return false;
                }
            }
            
            // Tenter de scanner le dossier local
            const scanSuccess = await scanLocalDirectory();
            
            if (!scanSuccess) {
                console.log("⚠️ Impossible de scanner automatiquement le dossier ./maps/");
                console.log("ℹ️ Utilisation uniquement des tuiles du dossier cible");
            }
            
            // 2. Ajouter les tuiles du dossier cible
            console.log("🔍 Ajout des tuiles du dossier cible...");
            
            let targetTilesCount = 0;
            
            // Scanner le dossier cible sélectionné par l'utilisateur
            async function scanTargetDirectory() {
                try {
                    for await (const entry of directoryHandle.values()) {
                        if (entry.kind === 'file' && entry.name.match(/^tile_\d+_\d+_\d+\.png$/)) {
                            allTileUrls.add(entry.name);
                            targetTilesCount++;
                            
                            // Extraire le niveau de zoom
                            const zoomMatch = entry.name.match(/^tile_(\d+)_\d+_\d+\.png$/);
                            if (zoomMatch) {
                                zoomLevelsFound.add(parseInt(zoomMatch[1]));
                            }
                        }
                    }
                    
                    console.log(`✅ ${targetTilesCount} tuiles trouvées dans le dossier cible`);
                    return true;
                } catch (error) {
                    console.warn("⚠️ Erreur lors du scan du dossier cible:", error);
                    return false;
                }
            }
            
            await scanTargetDirectory();
            
            // 3. Créer le manifest complet
            console.log(`📊 Création du manifest avec ${allTileUrls.size} tuiles...`);
            
            const completeManifest = {
                dateCreated: new Date().toISOString(),
                totalTiles: allTileUrls.size,
                mapsDirectoryTiles: localTilesCount,
                targetDirectoryTiles: targetTilesCount,
                newTilesAdded: downloadedTiles.length,
                zoomLevels: Array.from(zoomLevelsFound).sort((a, b) => a - b),
                tileUrls: Array.from(allTileUrls)
            };
            
            // 4. Sauvegarder le manifest complet
            try {
                const manifestHandle = await directoryHandle.getFileHandle('manifest_complete.json', { create: true });
                const manifestWritable = await manifestHandle.createWritable();
                await manifestWritable.write(JSON.stringify(completeManifest, null, 2));
                await manifestWritable.close();
                console.log("✅ Manifest complet créé: manifest_complete.json");
            } catch (error) {
                console.warn("⚠️ Erreur lors de la création du manifest complet:", error);
            }
            
            // Ajouter des informations sur le manifest au rapport final
            const finalStats = document.createElement('div');
            finalStats.style.marginTop = '10px';
            finalStats.innerHTML += `
                <hr style="margin: 10px 0;">
                <p><strong>Manifest complet</strong></p>
                <p>Tuiles dans ./maps/: ${localTilesCount}</p>
                <p>Tuiles dans ce dossier: ${targetTilesCount}</p>
                <p>Total tuiles uniques: ${allTileUrls.size}</p>
                <p>Un manifest complet (manifest_complete.json) a été créé.</p>
            `;
            
        } catch (error) {
            console.error("❌ Erreur lors de la génération du manifest complet:", error);
        }




        // Terminer et afficher le résumé
        if (isCancelled) {
            document.body.removeChild(progressOverlay);
            return { cancelled: true };
        }
        
        const finalStats = document.createElement('div');
        finalStats.style.marginTop = '10px';
        finalStats.innerHTML = `
            <p>✅ Préchargement terminé!</p>
            <p>Total: ${tilesDownloaded} tuiles téléchargées (${(totalSize / (1024 * 1024)).toFixed(2)} MB)</p>
            <p>Chemin: ${directoryHandle.name}</p>
            <button id="close-preload-overlay" style="padding: 5px 10px; margin-top: 10px;">Fermer</button>
        `;
        progressOverlay.appendChild(finalStats);
        
        document.getElementById('close-preload-overlay').addEventListener('click', () => {
            document.body.removeChild(progressOverlay);
        });
        
        console.log("✅ Préparation de la démo terminée!");
        console.log(`📊 ${tilesDownloaded} tuiles téléchargées, taille totale: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`);
        
        return {
            persons: finalPath.length,
            tiles: tilesDownloaded,
            totalSize: totalSize
        };


    } catch (error) {
        console.error("Erreur lors de la préparation:", error);
        alert("Une erreur est survenue: " + error.message);
    }
}


export function generateLocalMaps() {
    let demoMode = 'demo1';
    if ((demoMode === 'demo1') || (demoMode === 'demo2')) {        
        if (state.treeOwner ===2 ) {
            if (demoMode === 'demo1'){ state.targetAncestorId = "@I1152@"} //"@I74@" } // "@I739@" } //"@I6@" } //
            else { state.targetAncestorId = "@I2179@"}
        } else {
            if (demoMode === 'demo1'){ state.targetAncestorId = "@I739@" } //"@I6@" } //
            else { state.targetAncestorId = "@I1322@"}



            let ancestor;
            let cousin;
            // ancestor = searchRootPersonId('andré du matz'); 
            // cousin = searchRootPersonId('pierre garand');
            ancestor = searchRootPersonId('erzsébet keller'); 
            cousin = searchRootPersonId('angi');
            state.rootPersonId = cousin.id 
            state.targetAncestorId = ancestor.id;


            console.log('\n\n TARGET ANCESTOR = ', ancestor, ", COUSIN =" , cousin)




        }
        
        // Réinitialiser l'état de l'animation avant de démarrer
        resetAnimationState();
        state.isAnimationLaunched = true;     
              
        // Démarrer l'animation après un court délai
        setTimeout(() => {
            prepareAnimationDemo();
        }, 500);
        return;
    }
}

// Rendre la fonction accessible globalement
window.generateLocalMaps = generateLocalMaps;


export function toggleAnimationPause() {

    if (state.isRadarEnabled) {
        disableFortuneModeClean();
        disableFortuneModeWithLever();
        // displayGenealogicTree(null, true, false, true);
        toggleTreeRadar();
    }

    closeAllModals(false);

    const animationPauseBtn = document.getElementById('animationPauseBtn');
    
    // Basculer l'état de pause
    animationState.isPaused = !animationState.isPaused;
    
    // Mettre à jour le bouton
    // animationPauseBtn.querySelector('span').textContent = animationState.isPaused ? '▶️' : '⏸️';
    // animationPauseBtn.querySelector('span').textContent = animationState.isPaused ? '▶' : '⏸';
    if (animationState.isPaused) {
            animationPauseBtn.querySelector('span').textContent = '▶';
    } else {
        animationPauseBtn.querySelector('span').innerHTML =
        '<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" focusable="false" style="vertical-align:middle"><rect x="6" y="5" width="4" height="14" fill="currentColor"></rect><rect x="14" y="5" width="4" height="14" fill="currentColor"></rect></svg>';
    }


    if (animationState.isPaused) {
        // Mettre en pause
        stopAnimation();
    } else {
        // Reprendre l'animation
        startAncestorAnimation();
    }
}



export function displayPauseButton() {
    const animationPauseBtn = document.getElementById('animationPauseBtn');
    animationPauseBtn.querySelector('span').textContent = '▶';
}


export function stopAnimation() {
    // Démarquer le nœud actuellement en surbrillance
    if (animationState.currentHighlightedNodeId) {
        highlightAnimationNode(animationState.currentHighlightedNodeId, false);
    }
    
    // Arrêter la synthèse vocale
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }

    // Annuler l'animation
    if (animationController) {
        animationController.cancel();
    }

    // Réinitialiser les timeouts
    animationTimeouts.forEach(timeout => clearTimeout(timeout));
    animationTimeouts = [];
    closeAnimationPhoto();
    stopAnimationAudio();
}

export function resetAnimationState() {
    // Démarquer le nœud actuellement en surbrillance
    if (animationState.currentHighlightedNodeId) {
        highlightAnimationNode(animationState.currentHighlightedNodeId, false);
    }
    
    animationState = {
        path: [],
        currentIndex: 0,
        isPaused: true,
        currentHighlightedNodeId: null
    };

    // Réinitialiser le contrôleur d'animation
    if (animationController) {
        animationController.isCancelled = true;
    }

    // Arrêter toute animation en cours
    stopAnimation();
}

export function fullResetAnimationState() {
    console.log("\n\n🔄 Full Reset Animation State");

    const animationPauseBtn = document.getElementById('animationPauseBtn');
    
    // Basculer l'état de pause
    animationState.isPaused = true;
    if (animationController) { animationController.isCancelled = true; }
    
    // Mettre à jour le bouton
    // animationPauseBtn.querySelector('span').textContent = '▶️';
    animationPauseBtn.querySelector('span').textContent = '▶';

    state.isFullResetAnimationRequested = true;

    if (animationState.currentHighlightedNodeId) {
        highlightAnimationNode(animationState.currentHighlightedNodeId, false);
    }
    
    animationState = {
        path: [],
        currentIndex: 0,
        isPaused: true,
        currentHighlightedNodeId: null
    };

    stopAnimation();  

    if (!state.isRadarEnabled) {
        // if (origineGenNb) {state.nombre_generation = origineGenNb;}
        state.nombre_generation = 4;

        if (treeModeBackup) {state.treeModeReal = treeModeBackup;}

        displayGenealogicTree(null, true, false);

        setTimeout(() => {
            resetZoom();
        }, 200);
    }
}