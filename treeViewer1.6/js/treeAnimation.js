// ====================================
// Animation de l'arbre
// ====================================
import { state, searchRootPersonId } from './main.js';
import { handleAncestorsClick, handleDescendantsClick, handleDescendants } from './nodeControls.js';
import { getZoom, getLastTransform, drawTree } from './treeRenderer.js';
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


let animationTimeouts = [];
let optimalSpeechRate = 1.0; //1.1;
let animationMap = null;
let animationMarker = null;

let frenchVoice = null;
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



let isSpeechInGoodHealth = false;
let animationController = null;

export let animationState = {
    path: [],          // Le chemin complet de l'animation de la racine vers l'ancetre
    descendpath: [],   // Le chemin complet descendant de l'ancetre vers la racine
    cousinPath: [], // Le chemin complet du cousin vers l'ancetre commun
    cousinDescendantPath: [], // Le chemin complet descendant de l'ancetre vers le cousin
    currentIndex: 0,   // L'index du nœud actuel
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

if (window.CURRENT_LANGUAGE == "fr") {
    voice_language = 'fr-FR';
    voice_language_short = 'fr-';
    startMessage = 'en /voiture Simone';
    endMessage = 'et /voila !';
    reverseMessage = 'attention / la descente c\'est reparti !';
} else if (window.CURRENT_LANGUAGE == "en") {
    voice_language = 'en-US';
    voice_language_short = 'en-'; 
    startMessage = 'let\'s /go';
    endMessage = 'that\'s /it !';
    reverseMessage = 'let\'s /go we\'re going back down';
} else if (window.CURRENT_LANGUAGE == "es") { 
    voice_language = 'es-ES';
    voice_language_short = 'es-';
    startMessage = 'vamos';
    endMessage = 'eso /es todo !';
    reverseMessage = 'vamos /volvemos a bajar';
} else if (window.CURRENT_LANGUAGE == "hu") {  
    voice_language = 'hu-HU';
    voice_language_short = 'hu-';
    startMessage = 'Menjünk';
    endMessage = 'Ennyi !';
    reverseMessage = 'menjünk /visszamegyünk lemászni';
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


























export async function testRealConnectivity() {
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
        return false;
    }
}

window.testRealConnectivity = testRealConnectivity;

export function initNetworkListeners() {
    // console.log("🌐 Initialisation des écouteurs réseau...");
    
    // Test initial
    testRealConnectivity().then(online => {
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
            selectVoice();
        }
    });



    testRealConnectivity();


    // // Test périodique de connectivité (optionnel)
    // setInterval(() => {
    //     console.log('lancement du test de connectivité internet')
    //     testRealConnectivity();
    // }, 15000); // Test toutes les 15 secondes




    // console.log("✅ Écouteurs réseau initialisés");

}

// Fonction pour afficher visuellement le statut réseau (optionnel)
function showNetworkStatus(message) {
    // Créer ou mettre à jour un élément de notification
    let notification = document.getElementById('network-status');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'network-status';
        notification.style.position = 'fixed';
        notification.style.top = '10px';
        notification.style.right = '10px';
        notification.style.padding = '10px';
        notification.style.borderRadius = '5px';
        notification.style.zIndex = '9999';
        document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    notification.style.backgroundColor = isOnline ? '#4CAF50' : '#f44336';
    notification.style.color = 'white';
    
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
        animationMapPosition.width = window.innerWidth/2 ;
        animationMapPosition.left = window.innerWidth/4;
        animationMapPosition.height = window.innerHeight/3;
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

function initAnimationMap() {
    // Supprimer proprement toute carte existante
    const existingContainer = document.getElementById('animation-map-container');
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
    dragHandle.style.zIndex = '1100';
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
    resizeHandle.style.zIndex = '1100';
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


function addTooltipTransparencyFix() {
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
    function findNodeAndPath(node, targetId, currentPath = []) {
        
        if (node.id === targetId) {
            const finalPath = [...currentPath, node.id];
            return finalPath;
        }
        
        if (node.children) {
            for (const child of node.children) {
                // Si le noeud est un spouse, on vérifie si on a déjà trouvé un chemin par l'autre branche
                if (child.isSpouse) {
                    continue;
                }
                const path = findNodeAndPath(child, targetId, [...currentPath, node.id]);
                if (path) {
                    return path;
                }
            }
        }
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
let speechSynthesisInitialized = false;
let errorInSpeechInit = false;

// Fonction d'initialisation de la synthèse vocale à exécuter au chargement
function initSpeechSynthesis(voice) {
    if ('speechSynthesis' in window && !speechSynthesisInitialized) {
        console.log("🎤 Initialisation de la synthèse vocale... avec ", voice);
        // Créer et jouer une utterance silencieuse pour initialiser le moteur
        const initUtterance = new SpeechSynthesisUtterance("");
        initUtterance.volume = 0.00; // Muet
        initUtterance.rate = 1.0; // 
        initUtterance.voice = voice; // 
        initUtterance.onend = () => {
            console.log("🎤 Synthèse vocale initialisée avec succès avec ", voice);
            speechSynthesisInitialized = true;
        };
        initUtterance.onerror = (err) => {
            console.log("🎤 Erreur lors de l'initialisation de la synthèse vocale:", err, ", avec ", voice);
            speechSynthesisInitialized = true; // Considérer comme initialisé quand même
            errorInSpeechInit = true;
        };
        
        // Forcer le chargement des voix
        // window.speechSynthesis.getVoices();
        
        // Jouer l'utterance silencieuse
        window.speechSynthesis.speak(initUtterance);
    }
}
/* */

async function testSpeechSynthesisHealth(timeout = 1000) {
    // console.log("🔍 Test de la santé de la synthèse vocale...");
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


function selectVoice() {
    // Sélectionner une voix française si possible
    let voices = window.speechSynthesis.getVoices();
    console.log("Voix disponibles:",voices);

    debugLog("=== Liste des voix disponibles ===");
    voices.forEach(voice => {
        debugLog(`Voix: ${voice.name}
        - Langue: ${voice.lang}
        - Local: ${voice.localService}
        - Par défaut: ${voice.default}
        - URI: ${voice.voiceURI}
        ---------------------`);
    });

    // Trouver les voix françaises disponibles
    // let frenchVoices = voices.filter(voice => 
    //     // voice.lang.startsWith('fr-FR') && 
    //     voice.lang.startsWith(voice_language) && !voice.name.includes('ulti'));

    let frenchVoices = voices.filter(voice => 
        voice.lang.startsWith(voice_language) && 
        !voice.name.includes('ulti') &&  // Évite Multi/multilingue
        !voice.voiceURI.includes('eloquence')  // Évite les voix pourries sur IOS
    );


    // Trier les voix pour prioriser celles contenant 'compact'
    frenchVoices.sort((a, b) => {
        const aHasCompact = a.name.toLowerCase().includes('compact');
        const bHasCompact = b.name.toLowerCase().includes('compact');
        if (aHasCompact && !bHasCompact) return -1;
        if (!aHasCompact && bHasCompact) return 1;
        return 0;
    });

        



    let localVoices = voices.filter(voice => voice.localService);

    if (localVoices.length != 0) {
        console.log("Voix locales disponibles:", localVoices, localVoices.map(v => v.name));
        localVoice = localVoices[0];
    } 



    // console.log("Voix françaises France disponibles:", frenchVoices, frenchVoices.map(v => v.name));

    if (frenchVoices.length === 0) {
        frenchVoices = voices.filter(voice => 
            // voice.lang.startsWith('fr-') || 
            (voice.lang.startsWith(voice_language_short) && !voice.voiceURI.includes('eloquence')) || 
            (voice.name.toLowerCase().includes('french') && !voice.voiceURI.includes('eloquence'))
        );
        // console.log("Voix françaises autres disponibles:", frenchVoices.map(v => v.name));
    } 
    if (frenchVoices.length === 0) {
        frenchVoices = voices.filter(voice => 
            voice.lang.startsWith('en-') && !voice.voiceURI.includes('eloquence') );

        if (frenchVoices.length === 0) {
            frenchVoices = voices.filter(voice =>
                voice.localService);
            }
        // console.log("Voix anglaise ou locales disponibles:", frenchVoices.map(v => v.name));
    }

    
    console.log("✅ or ⚠️ Connexion Internet ?", isOnline);
    
    
    if (!isOnline) {
        frenchVoices = voices.filter(voice =>
            // voice.lang.startsWith('fr-') && voice.localService);
            voice.lang.startsWith(voice_language_short) && !voice.voiceURI.includes('eloquence') && voice.localService);
        console.log("Voix disponibles locales fr-:", frenchVoices);
        if (frenchVoices.length === 0) {
            frenchVoices = voices.filter(voice =>
                voice.lang.startsWith('en-') &&!voice.voiceURI.includes('eloquence') && voice.localService);
            console.log("Voix disponibles locales en-:", frenchVoices);
        }
        if (frenchVoices.length === 0) {
            frenchVoices = voices.filter(voice =>
                voice.localService);
            console.log("Voix disponibles locales:", frenchVoices);
        }   

        // console.log("Voix françaises ou autres locales disponibles hors lignes :", frenchVoices.map(v => v.name));
    }


    if (frenchVoices.length != 0) {
        console.log("Voix  disponibles:", frenchVoices.map(v => v.name));
    }







    
    // Choisir la meilleure voix française  
    // Si en ligne, préférer les voix de haute qualité (généralement Google ou Microsoft)
    if (isOnline) {
        // Chercher d'abord les voix Google ou Microsoft qui sont généralement de meilleure qualité
        frenchVoice = frenchVoices.find(voice => 
            voice.name.includes('Google') || 
            voice.name.includes('Microsoft')
        );
        
        if (frenchVoice) {
            console.log("✅ Utilisation de la voix réseau haute qualité:", frenchVoice.name, ', localService=', frenchVoice.localService);
        } else if (frenchVoices.length != 0) {
            // Sélectionner la première voix française disponible
            frenchVoice = frenchVoices[0];
            console.log("ℹ️ Utilisation de la voix  ?:", frenchVoice.name, ', localService=', frenchVoice.localService);
        }

    } else {
        if (frenchVoices.length != 0) {
            // Sélectionner la première voix française disponible
            frenchVoice = frenchVoices[0];
            console.log("ℹ️ Utilisation de la voix locale:", frenchVoice.name, ', localService=', frenchVoice.localService);
        } else {
            console.log("⚠️ Aucune voix disponible hors ligne ");
        }
    }


    if (frenchVoice) {
        console.log("Voix  sélectionnée:", frenchVoice);
        debugLog(`Voix sélectionnée:, ${frenchVoice.name}, localService=, ${frenchVoice.localService}`);
    }

    
    // // Si pas de voix réseau ou hors ligne, utiliser une voix locale
    // if (!frenchVoice) {
    //     // Sélectionner la première voix française disponible
    //     frenchVoice = frenchVoices[0];
        
    //     if (frenchVoice) {
    //         console.log("ℹ️ Utilisation de la voix locale:", frenchVoice.name, ', localService=', frenchVoice.localService);
    //     } else {
    //         console.log("⚠️ Aucune voix française disponible, utilisation de la voix par défaut");
    //     }
    // }
    








}

/* */
function speakPersonName(personName) {
    // console.log(`⏱️ DÉBUT: speakPersonName pour ${personName}, vitesse initiale: ${optimalSpeechRate}`);
    
    // Initialiser la synthèse vocale si ce n'est pas déjà fait
    if (!speechSynthesisInitialized) {
        console.log("🔄 Premier appel à la synthèse vocale - initialisation... avec french voice");
        if (frenchVoice) {
            initSpeechSynthesis(frenchVoice);

            // if (!speechSynthesisInitialized) {
            //     console.log("🔄 2ième appel à la synthèse vocale - initialisation.. avec local voice");
            //     if (localVoice) {
            //         initSpeechSynthesis(localVoice);
            //         frenchVoice = localVoice;
            //         speechSynthesisInitialized = true;
            //     }   
            // }
            // Ajouter un petit délai pour laisser le temps à l'initialisation
            return new Promise(resolve => {
                setTimeout(() => {
                    // Réappeler la fonction après initialisation
                    speakPersonName(personName).then(resolve);
                }, 200);
            });
        }
    }
    
    // console.log("index animation =", animationState.currentIndex);
    
    // Vérifier si le son est activé
    if (!state.isSpeechEnabled) {
        // console.log("🔇 Son désactivé - résolution immédiate");
        return new Promise(resolve => setTimeout(resolve, 1600));
    }
    


    return new Promise((resolve, reject) => {

        // Vérifier si le son est activé
        if (!state.isSpeechEnabled) {
            // console.log("🔇 Son désactivé - résolution immédiate");
            resolve();
            return;
        }

        if (!('speechSynthesis' in window)) {
            console.log("❌ API SpeechSynthesis non disponible - résolution immédiate");
            resolve();
            return;
        }



        // Simplifier le nom avant lecture
        const simplifiedName = simplifyName(personName);
        console.log(`📝 Nom simplifié: ${simplifiedName}, index : ${animationState.currentIndex}`);



        // let timeOutDuration = 1800;
        // if (animationState.currentIndex === 0) {
        //     console.log("🔄 Premier nom - forçage taux initial à 1.2");
        //     optimalSpeechRate = 1.2; // Commencer plus rapide pour le premier nom
        //     if (isSpeechInGoodHealth) timeOutDuration = 3500;
        //     else timeOutDuration = 2500;
        // }
        // if (animationState.currentIndex === 1) {
        //     console.log("🔄 Premier nom - forçage taux initial à 1.0");
        //     optimalSpeechRate = 1.2; //
        //     if (isSpeechInGoodHealth) timeOutDuration = 2500; 
        //     else timeOutDuration = 1600;
        // }




        // Ajustement dynamique du timeout en fonction de la longueur du nom
        let timeOutDuration = Math.max(1800, simplifiedName.length * 150); // Base de 150ms par lettre, minimum 1800ms
        if (animationState.currentIndex === 0) {
            console.log("🔄 Premier nom - forçage taux initial à 1.2");
            optimalSpeechRate = 1.0;//1.2;
            timeOutDuration = Math.max(isSpeechInGoodHealth ? 3500 : 2500, timeOutDuration);
        }
        if (animationState.currentIndex === 1) {
            console.log("🔄 Deuxième nom - ajustement taux");
            optimalSpeechRate = 1.0; //1.2;
            timeOutDuration = Math.max(isSpeechInGoodHealth ? 2500 : 1600, timeOutDuration);
        }


        // contournement pour Chrome qui ne fonctionne pas bien avec la synthèse vocale
        let safetyTimeout;

        //Ajouter un timeout de sécurité qui résoudra la promesse après 3 secondes quoi qu'il arrive
        safetyTimeout = setTimeout(() => {
            // console.log("⚠️ TIMEOUT: Timeout de sécurité de la synthèse vocale déclenché");
            window.speechSynthesis.cancel(); // Annuler toute synthèse en cours
            resolve(); // Résoudre la promesse pour continuer l'animation
        }, timeOutDuration);


        // Paramètres initiaux
        const targetDuration = 1500; // 1.5 seconde pour lire le nom
        const maxRate = 2.7; // Vitesse maximale
        const minRate = 0.8; // Vitesse minimale








        
        
        async function measureSpeechDuration(rate) {
            // console.log(`📏 DÉBUT mesure avec taux: ${rate}`);
            return new Promise((innerResolve) => {
                const utterance = new SpeechSynthesisUtterance(simplifiedName);
                utterance.rate = rate;
                utterance.lang = 'fr-FR';
                utterance.volume = 1.0;

                const startTime = Date.now();
                // console.log(`⏱️ Démarrage mesure à: ${startTime}`);

                utterance.onend = () => {
                    const duration = Date.now() - startTime;
                    console.log(`✅ Fin utterance après ${duration}ms`);
                    
                    innerResolve({ 
                        rate: rate, 
                        duration: duration
                    });
                };

                utterance.onerror = (event) => {
                    console.log(`❌ Erreur utterance: ${event.error}`);
                
                    // Si l'erreur est 'interrupted', utiliser une durée estimée plutôt que Infinity
                    if (event.error === 'interrupted') {
                        const elapsedTime = Date.now() - startTime;
                        console.log(`⏱️ Temps écoulé avant interruption: ${elapsedTime}ms`);
                
                        // Utiliser le temps écoulé comme approximation
                        const estimatedDuration = Math.min(1500, elapsedTime * 1.5);
                        // console.log(`📊 Durée estimée: ${estimatedDuration}ms`);
                
                        innerResolve({ 
                            rate: rate, 
                            duration: estimatedDuration
                        });
                    } else {
                        console.log(`🔧 Autre erreur, durée par défaut utilisée`);
                        innerResolve({ 
                            rate: rate, 
                            duration: 1500
                        });
                    }
                };
                


                // // Sélectionner une voix française si possible
                // const voices = window.speechSynthesis.getVoices();
                // const frenchVoice = voices.find(voice => 
                //     voice.lang.startsWith('fr-') || 
                //     voice.name.toLowerCase().includes('french')
                // );

                if (frenchVoice) {
                    console.log(`✅  🇫🇷 Voix française sélectionnée: ${frenchVoice.name}`);
                    utterance.voice = frenchVoice;
                }

                // console.log(`🔊 Début synthèse pour ${simplifiedName} avec taux ${rate}`);
                window.speechSynthesis.speak(utterance);

                // speakAfterCancel(utterance);
            });
        }

        async function adaptiveSpeech() {
            try {
                // console.log(`⚙️ DÉBUT adaptiveSpeech avec taux: ${optimalSpeechRate}`);
                // pour bug de chrome
                if (!isSpeechInGoodHealth) {
                    const silentUtterance = new SpeechSynthesisUtterance(' ');
                    window.speechSynthesis.speak(silentUtterance);
                    window.speechSynthesis.cancel();
                }
                const result = await measureSpeechDuration(optimalSpeechRate);

                // console.log(`📊 Résultat mesure:`, result);
                



                // // Ajuster la vitesse globale avec une approche plus symétrique
                // if (result.duration > targetDuration + 200) {
                //     // Si trop lent, augmenter progressivement
                //     const oldRate = optimalSpeechRate;
                //     optimalSpeechRate = Math.min(optimalSpeechRate + 0.2, maxRate);
                //     console.log(`🐢 Trop LENT (${result.duration}ms) - Ajustement taux: ${oldRate} → ${optimalSpeechRate}`);
                // } else if (result.duration < targetDuration - 200) {
                //     // Si trop rapide, diminuer progressivement
                //     const oldRate = optimalSpeechRate;
                //     optimalSpeechRate = Math.max(optimalSpeechRate - 0.2, minRate);
                //     // console.log(`🐇 Trop RAPIDE (${result.duration}ms) - Ajustement taux: ${oldRate} → ${optimalSpeechRate}`);
                // } else {
                //     // console.log(`✅ Durée OPTIMALE (${result.duration}ms) - Maintien taux: ${optimalSpeechRate}`);
                // }




                
                clearTimeout(safetyTimeout); // Annuler le timeout si tout s'est bien passé
                // console.log(`✅ FIN: speakPersonName - promesse résolue`);
                // resolve();
                resolve();
            } catch (error) {
                console.error(`❌ Erreur dans la synthèse vocale:`, error);
                clearTimeout(safetyTimeout);
                resolve(); // Résoudre malgré l'erreur
            }
        }

        // Lancer la lecture adaptative
        return adaptiveSpeech();
    });



}
/* */



//#####################################################
export async function startAncestorAnimation() {

    
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
        isSpeechInGoodHealth = await testSpeechSynthesisHealth();
        if (isSpeechInGoodHealth) {
            // Chrome ou Edge est coopératif
            console.log("✅ La synthèse vocale est prête et fonctionne correctement.");
        } else {
            // Chrome est grognon il faut utiliser une méthode de secours
            console.log("⚠️ La synthèse vocale ne fonctionne pas correctement. Utilisation de la méthode de secours.");
            window.speechSynthesis.cancel();
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


   let treeModeBackup =  state.treeModeReal;


    // Réinitialiser ou initialiser l'état si ce n'est pas déjà fait
    if (animationState.path.length === 0) {
        [animationState.path, animationState.descendpath] = findAncestorPath(state.rootPersonId, state.targetAncestorId);

        
        console.log("\n\n\n DEBUG animationState.path ", animationState.path)
        
        // si la personne root ne permet pas de faire la démo, on change avec la personne root de base
        if (!animationState.path) {

            if (state.treeOwner ===2 ) {
                state.rootPersonId = searchRootPersonId('faustine d');

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
                animationState.path =[];
                animationState.descendpath =[];
                [animationState.path, animationState.descendpath] = findAncestorPath(state.rootPersonId.id, state.targetAncestorId);
                console.log("\n\n\n DEBUG animationState.path  after  ", animationState.path)

            }
        }

        if (animationState.path) {
        
            console.log("Chemin trouvé:", animationState.path);
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
        animationState.isPaused = false;
    }

    // Initialiser la carte au début de l'animation
    let deltaXRatio = 2; // Ratio de décalage horizontal
    if (window.innerWidth < 400) { deltaXRatio = 2; } // Pour les petits écrans, on


    if (state.isSpeechEnabled2) {
        selectVoice();
    }

    let horizontalShift = 0;
    let verticalShift = 0;
    let svg = d3.select("#tree-svg");
    let lastTransform = getLastTransform() || d3.zoomIdentity;  
    state.previousWindowInnerWidthInMap = window.innerWidth;
    state.previousWindowInnerHeightInMap = window.innerHeight;


    return new Promise(async (resolve, reject) => {
        try {
            // Nettoyer les timeouts existants
            animationTimeouts.forEach(timeout => clearTimeout(timeout));
            animationTimeouts = [];
            let i;
            let nodeId;
            let node

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
                    // animationState.currentIndex = i;
                    break;
                }

                nodeId = animationState.path[i];
                node = findNodeInTree(nodeId);
                // console.log("Noeud trouvé ? :",i,  nodeId, node);

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
                        lastTransform = getLastTransform() || d3.zoomIdentity;                      
                    
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

                        svg.transition()
                            .duration(750)
                            .call(zoom.transform, 
                                lastTransform.translate(- horizontalShift - horizontalShiftAfterScreenRescale, - verticalShift - verticalShiftAfterScreenRescale)
                            );
                        state.lastHorizontalPosition = state.lastHorizontalPosition + horizontalShift;
                        state.lastVerticalPosition = state.lastVerticalPosition + verticalShift;
                    }


                    // Avant le 1ier affichage créer une promesse qui simule la lecture vocale pour un message de démarrage : en voiture Simone
                    if (animationState.currentIndex === 0) {
                        const voicePromiseStart = (state.isSpeechEnabled &&  state.isSpeechEnabled2)
                            ? speakPersonName(startMessage)
                            : new Promise(resolve => setTimeout(resolve, 1600*step_duration));
                        
                        // Attendre la lecture ou le délai
                        await voicePromiseStart;
                    }

                    // Créer une promesse qui simule la lecture vocale si le son est coupé
                    const voicePromise = (state.isSpeechEnabled &&  state.isSpeechEnabled2)
                        ? speakPersonName(node.data.name)
                        : new Promise(resolve => setTimeout(resolve, 1500*step_duration));
                    
                    // Attendre la lecture ou le délai
                    await voicePromise;
                    
                    // Actions sur le nœud pour faire apparaitre le nouvel ascendant puis redessine l'arbre avec drawTree
                    if (!node.data.children || node.data.children.length === 0) {
                        const event = new Event('click');
                        if (state.treeModeReal === 'descendants' || state.treeModeReal === 'directDescendants' ) {
                            // handleNonRootDescendants(event, node);
                            // console.log("debug handleDescendants", node);
                            handleDescendants(node);
                        } else {
                            handleAncestorsClick(event, node);
                        }
                        drawTree();
                    }

                    let recalageX = 0;
                    let recalageY = 0;
                    zoom = getZoom();


                    // décaler l'arbre vers la gauche (shift left) pour toujours voir le nouveau noeud apparaitre à droite
                    if (zoom) {
                        const svg = d3.select("#tree-svg");
                        const lastTransform = getLastTransform() || d3.zoomIdentity;
                        
                        // si le noeud le plus plus à droite est trop près du bord droit on décale vers la gauche
                        if  (((node.y > window.innerWidth - state.boxWidth*deltaXRatio)  ||  (node.x  > window.innerHeight - state.boxHeight*1.2))  
                                && ( (node.y + state.boxWidth - state.lastHorizontalPosition > state.boxWidth*0.2 ) || (node.x - state.lastVerticalPosition > state.boxHeight*0.2 )) )  {                                       
   
                            if (firstTimeShift) {
                                offsetX = (node.y - state.lastHorizontalPosition)
                                offsetY = (node.x - state.lastVerticalPosition)
                            }
                            firstTimeShift = false;
                            const horizontalShift = (node.y - state.lastHorizontalPosition) - offsetX  + (state.boxWidth*2) ;
                            const verticalShift = (node.x - state.lastVerticalPosition) - offsetY + (state.boxHeight)*2 ;

                            svg.transition()
                                .duration(750)
                                .call(zoom.transform, 
                                    lastTransform.translate(-horizontalShift, -verticalShift)
                                );
                            state.lastHorizontalPosition = state.lastHorizontalPosition + horizontalShift;
                            state.lastVerticalPosition = state.lastVerticalPosition + verticalShift;

                            const nodeScreenPos = getNodeScreenPosition(node);
                            const marginX = state.boxWidth/2;
                            const marginY = state.boxHeight/2;
                            console.log('\n\n ****** Le nœud est maintenant à la position: ', nodeScreenPos.x, nodeScreenPos.y, 'screen=', window.innerWidth, window.innerHeight ,  '\n\n');
                            console.log("initialAnimationMapPosition.left=", initialAnimationMapPosition.left, "initialAnimationMapPosition.top=", initialAnimationMapPosition.top, "initialAnimationMapPosition.width=", initialAnimationMapPosition.width, "initialAnimationMapPosition.height=", initialAnimationMapPosition.height);

                            // vérifier si le noeud est bien visible dans la fenêtre
                            if ( nodeScreenPos.x < marginX || nodeScreenPos.y < marginY || nodeScreenPos.x > (window.innerWidth - marginX) ||  nodeScreenPos.y > (window.innerHeight-marginY) ) {
                                if ( nodeScreenPos.x < marginX) {
                                    recalageX = - nodeScreenPos.x + window.innerWidth - state.boxWidth*2;
                                } else if (nodeScreenPos.x > (window.innerWidth - marginX)) {
                                    recalageX = - (nodeScreenPos.x - window.innerWidth) - state.boxWidth*2;
                                }
                                if ( nodeScreenPos.y < marginY) {
                                    recalageY = - nodeScreenPos.y + window.innerHeight/2 - state.boxHeight*2;
                                } else if (nodeScreenPos.y > (window.innerHeight - marginY)) {
                                    recalageY = - (nodeScreenPos.y - window.innerHeight) - window.innerHeight/2 - state.boxHeight*2;
                                }
                                console.log("\n\n ⚠️ ⚠️ ⚠️ Le nœud est en dehors de l'écran, recalage de l'arbre avec shift :", recalageX, recalageY );

                                //vérifier si le noeud n'est pascaché derrière la carte
                                zoom = getZoom();
                                svg.transition()
                                .duration(250)
                                .call(zoom.transform, 
                                    lastTransform.translate(recalageX, recalageY)
                                );
                            }


                            //vérifier si le noeud n'est pas caché derrière la carte
                            else if ((nodeScreenPos.x > initialAnimationMapPosition.left) && (nodeScreenPos.x < initialAnimationMapPosition.left+initialAnimationMapPosition.width) &&
                                (nodeScreenPos.y > initialAnimationMapPosition.top) && (nodeScreenPos.y < initialAnimationMapPosition.top+initialAnimationMapPosition.height) ) {

                                if ((nodeScreenPos.x > initialAnimationMapPosition.left) && (nodeScreenPos.x < initialAnimationMapPosition.left+initialAnimationMapPosition.width)) {
                                    recalageX = - (nodeScreenPos.x - window.innerWidth) - state.boxWidth*2;
                                } 

                                if ((nodeScreenPos.y > initialAnimationMapPosition.top) && (nodeScreenPos.y < initialAnimationMapPosition.top+initialAnimationMapPosition.height) ) {
                                    recalageY = - (nodeScreenPos.y - window.innerHeight) - window.innerHeight/2 - state.boxHeight*2;
                                }
                                console.log("\n\n ⚠️ ⚠️ ⚠️ Le nœud est derrière la map, recalage de l'arbre avec shift :", recalageX, recalageY );

                                zoom = getZoom();
                                svg.transition()
                                .duration(250)
                                .call(zoom.transform, 
                                    lastTransform.translate(recalageX, recalageY)
                                );
                            }

                        }
                    }

                    state.prevPrevWindowInnerWidthInMap = state.previousWindowInnerWidthInMap;
                    state.prevPrevWindowInnerHeightInMap =  state.previousWindowInnerHeightInMap;
                    state.previousWindowInnerWidthInMap = window.innerWidth;
                    state.previousWindowInnerHeightInMap = window.innerHeight;
                } 
            }


            // A la fin créer une promesse qui simule la lecture vocale pour un message de fin : et voila


            if (state.targetCousinId==null && i >= (animationState.path.length) )
            {
                playEndOfAnimationSound();
                showEndAnimationPhoto(node.data.name);
            }





            const voicePromiseStart = (state.isSpeechEnabled &&  state.isSpeechEnabled2)
                ? speakPersonName(endMessage)
                : new Promise(resolve => setTimeout(resolve, 1600*step_duration));
            // Attendre la lecture ou le délai
            await voicePromiseStart;



            
            
            
            
            
            
            //####################################################################################################//
            //#############################   descente vers le cousin ############################################//
            
            if (state.targetCousinId!=null && i >= (animationState.path.length) ) {

                animationState.direction = 'descendant';
                const voicePromiseEnd = (state.isSpeechEnabled &&  state.isSpeechEnabled2)
                ? speakPersonName(reverseMessage)
                : new Promise(resolve => setTimeout(resolve, 3500*step_duration));
                // Attendre la lecture ou le délai
                await voicePromiseEnd;


                // Reprendre à partir de l'index actuel
                let j =0;
                let lastName;
                for (let i = animationState.currentIndex; i < animationState.path.length + animationState.cousinDescendantPath.length; i++) {
                    
                    animationState.currentIndex = i;
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

                    nodeId = animationState.cousinDescendantPath[j]; //i-animationState.cousinDescendantPath.length];
                    node = findNodeInTree(nodeId);
                    // console.log("Noeud trouvé ? :",i,  nodeId, node);

                    if (node) {

                        // Mettre en évidence le nœud actuel
                        highlightAnimationNode(nodeId, true);

                        // Chercher un lieu à afficher
                        const person = state.gedcomData.individuals[node.data.id];

                        // console.log("\\Noeud descendant cousin trouvé ? :",i, j, nodeId, node, person.name);
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
                            lastTransform = getLastTransform() || d3.zoomIdentity;                      
                        
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

                            svg.transition()
                                .duration(750)
                                .call(zoom.transform, 
                                    lastTransform.translate(- horizontalShift - horizontalShiftAfterScreenRescale, - verticalShift - verticalShiftAfterScreenRescale)
                                );
                            state.lastHorizontalPosition = state.lastHorizontalPosition + horizontalShift;
                            state.lastVerticalPosition = state.lastVerticalPosition + verticalShift;
                        }


                        // Créer une promesse qui simule la lecture vocale si le son est coupé
                        const voicePromise = (state.isSpeechEnabled &&  state.isSpeechEnabled2)
                            ? speakPersonName(node.data.name)
                            : new Promise(resolve => setTimeout(resolve, 1500*step_duration));
                        
                        // Attendre la lecture ou le délai
                        await voicePromise;
                        
                        // Actions sur le nœud pour faire apparaitre le nouvel ascendant puis redessine l'arbre avec drawTree
                        const event = new Event('click');
                        if (state.treeModeReal === 'descendants' || state.treeModeReal === 'directDescendants' ) {
                            // handleNonRootDescendants(event, node);
                            console.log("debug handleDescendants", node);
                            handleDescendants(node);
                        } else {
                            // handleAncestorsClick(event, node);
                            const nextNodeId = animationState.cousinDescendantPath[Math.min(j+1, animationState.cousinDescendantPath.length-1)];
                            handleDescendantsClick(event, node, true, nextNodeId);
                        }

                        let recalageX = 0;
                        let recalageY = 0;
                        zoom = getZoom();


                        // décaler l'arbre vers la gauche (shift left) pour toujours voir le nouveau noeud apparaitre à droite
                        if (zoom) {
                            const svg = d3.select("#tree-svg");
                            const lastTransform = getLastTransform() || d3.zoomIdentity;
                            
                            // si le noeud le plus plus à droite est trop près du bord droit on décale vers la gauche
                            if  (((node.y > window.innerWidth - state.boxWidth*deltaXRatio)  ||  (node.x  > window.innerHeight - state.boxHeight*1.2))  
                                    && ( (node.y + state.boxWidth - state.lastHorizontalPosition > state.boxWidth*0.2 ) || (node.x - state.lastVerticalPosition > state.boxHeight*0.2 )) )  {                                       
    

                                firstTimeShift = false;
                                const horizontalShift = (node.y - state.lastHorizontalPosition) - offsetX  - (state.boxWidth*2) ;
                                const verticalShift = (node.x - state.lastVerticalPosition) - offsetY + (state.boxHeight)*2 ;

                                svg.transition()
                                    .duration(750)
                                    .call(zoom.transform, 
                                        lastTransform.translate(-horizontalShift, -verticalShift)
                                    );
                                state.lastHorizontalPosition = state.lastHorizontalPosition + horizontalShift;
                                state.lastVerticalPosition = state.lastVerticalPosition + verticalShift;

                                const nodeScreenPos = getNodeScreenPosition(node);
                                const marginX = state.boxWidth/2;
                                const marginY = state.boxHeight/2;
                                console.log('\n\n ****** Le nœud est maintenant à la position: ', nodeScreenPos.x, nodeScreenPos.y, 'screen=', window.innerWidth, window.innerHeight ,  '\n\n');
                                console.log("initialAnimationMapPosition.left=", initialAnimationMapPosition.left, "initialAnimationMapPosition.top=", initialAnimationMapPosition.top, "initialAnimationMapPosition.width=", initialAnimationMapPosition.width, "initialAnimationMapPosition.height=", initialAnimationMapPosition.height);

                            }
                        }

                        state.prevPrevWindowInnerWidthInMap = state.previousWindowInnerWidthInMap;
                        state.prevPrevWindowInnerHeightInMap =  state.previousWindowInnerHeightInMap;
                        state.previousWindowInnerWidthInMap = window.innerWidth;
                        state.previousWindowInnerHeightInMap = window.innerHeight;

                        lastName = node.data.name
                    } else {
                        console.log("\\  !!!! Noeud descendant cousin NON trouvé ? :",i,  nodeId, node);
                    }
                    j++;

                }


                // A la fin créer une promesse qui simule la lecture vocale pour un message de fin : et voila

                if (j >= (animationState.cousinDescendantPath.length) )
                {
                    playEndOfAnimationSound();
                    showEndAnimationPhoto(lastName);
                }


                const voicePromiseStart = (state.isSpeechEnabled &&  state.isSpeechEnabled2)
                    ? speakPersonName(endMessage)
                    : new Promise(resolve => setTimeout(resolve, 1600*step_duration));
                // Attendre la lecture ou le délai
                await voicePromiseStart;
            }





            // Si l'animation est terminée, réinitialiser l'état
            if (animationState.currentIndex >= animationState.path.length) {
                // Démarquer le dernier nœud
                if (animationState.currentHighlightedNodeId) {
                    highlightAnimationNode(animationState.currentHighlightedNodeId, false);
                }
                
                // Réinitialiser l'état
                animationState.path = [];
                animationState.currentIndex = 0;
                animationState.currentHighlightedNodeId = null;
            }
            
            resolve(); // Résoudre la promesse une fois terminé
        } catch (error) {
            console.error('Erreur dans l\'animation:', error);
            reject(error); // Rejeter en cas d'erreur
        }


        state.treeModeReal = treeModeBackup;
    });



}
//######################################################




function getNodeScreenPosition(node) {
    const lastTransform = getLastTransform() || d3.zoomIdentity;
    
    // Appliquer la transformation actuelle aux coordonnées du nœud
    // Note: dans d3.tree, y est horizontal et x est vertical
    const screenX = lastTransform.applyX(node.y);
    const screenY = lastTransform.applyY(node.x);
    
    return {
        x: screenX,
        y: screenY
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
    const animationPauseBtn = document.getElementById('animationPauseBtn');
    
    // Basculer l'état de pause
    animationState.isPaused = !animationState.isPaused;
    
    // Mettre à jour le bouton
    animationPauseBtn.querySelector('span').textContent = animationState.isPaused ? '▶️' : '⏸️';
    
    if (animationState.isPaused) {
        // Mettre en pause
        stopAnimation();
    } else {
        // Reprendre l'animation
        startAncestorAnimation();
    }
}

// export function stopAnimation() {
//     // Arrêter la synthèse vocale
//     if ('speechSynthesis' in window) {
//         window.speechSynthesis.cancel();
//     }

//     // Annuler l'animation
//     if (animationController) {
//         animationController.cancel();
//     }

//     // Réinitialiser les timeouts
//     animationTimeouts.forEach(timeout => clearTimeout(timeout));
//     animationTimeouts = [];
// }

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






