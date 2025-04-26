// ====================================
// Animation de l'arbre
// ====================================
import { state } from './main.js';
import { handleAncestorsClick, handleDescendants } from './nodeControls.js';
import { getZoom, getLastTransform, drawTree } from './treeRenderer.js';
import { buildDescendantTree } from './treeOperations.js';
// import { geocodeLocation } from './modalWindow.js';
import { geocodeLocation } from './geoLocalisation.js';
import { initBackgroundContainer, updateBackgroundImage } from './backgroundManager.js';
import { extractYear } from './utils.js';
import { initAnimationMap as initMap, updateAnimationMapMarkers, updateAnimationMapMarkersWithLabels, collectPersonLocations, locationSymbols} from './mapUtils.js';
import { makeElementDraggable } from './geoHeatMapInteractions.js';
import { fetchTileWithCache } from './mapTilesPreloader.js';



let animationTimeouts = [];
let optimalSpeechRate = 1.1;
let animationMap = null;
let animationMarker = null;

let frenchVoice = null;

// Au début du fichier, après les imports
let isOnline = false; // Variable pour suivre l'état de la connexion Internet
let previousOnlineState = false;

async function testRealConnectivity() {
    try {
        const response = await fetch('https://www.google.com/favicon.ico', {
            mode: 'no-cors',
            cache: 'no-store',
            // Ajouter un timeout court pour éviter d'attendre trop longtemps
            signal: AbortSignal.timeout(2000)
        });
        // Sauvegarder l'état précédent
        previousOnlineState = isOnline;
        isOnline = true;
        // console.log("✅ Connexion Internet établie", isOnline);

        // Détecter le changement d'état
        if (previousOnlineState !== isOnline) {
            console.log("✅ Connexion Internet rétablie");
            showNetworkStatus("Connexion réseau rétablie");
            selectVoice();
        }
        return true;
    } catch (error) {
        // Sauvegarder l'état précédent
        previousOnlineState = isOnline;
        isOnline = false;
        // console.log("⚠️ Connexion Internet perdue", isOnline);
        // Détecter le changement d'état
        if (previousOnlineState !== isOnline) {
            console.log("⚠️ Connexion Internet perdue");
            showNetworkStatus("Mode hors-ligne");
            selectVoice();
        }
        return false;
    }
}

export function initNetworkListeners() {
    console.log("🌐 Initialisation des écouteurs réseau...");
    
    // Test initial
    testRealConnectivity().then(online => {
        showNetworkStatus(online ? "Connexion réseau active" : "Mode hors-ligne");
    });

    // Écouteurs d'événements standard
    window.addEventListener('online', () => testRealConnectivity());
    window.addEventListener('offline', () => {
        previousOnlineState = isOnline;
        isOnline = false;
        // console.log("⚠️ Connexion Internet perdue", isOnline);
        if (previousOnlineState !== isOnline) {
            console.log("⚠️ Mode hors-ligne détecté");
            showNetworkStatus("Mode hors-ligne");
            selectVoice();
        }
    });

    // Test périodique de connectivité (optionnel)
    setInterval(() => {
        testRealConnectivity();
    }, 15000); // Test toutes les 30 secondes

    console.log("✅ Écouteurs réseau initialisés");

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



    // // animationMapPosition.top = window.innerHeight*3/4 -10 ;
    // animationMapPosition.height = window.innerHeight/3;

    // animationMapPosition.top = window.innerHeight - animationMapPosition.height - 20;

    console.log("\n \n Position de la carte d'animation initialisée:", window.innerWidth, window.innerHeight, animationMapPosition, "\n\n");

    state.isAnimationMapInitialized = true;
}

// État pour la position de la carte d'animation
let animationMapPosition = {
    top: 60,
    left: 20,
    width: 300,
    height: 250
};

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
    
    // Le reste de votre code pour l'initialisation des tuiles
    if (useLocalTiles) {
        // Supprimer la couche de tuiles par défaut si elle existe
        animationMap.eachLayer(layer => {
            if (layer instanceof L.TileLayer) {
                animationMap.removeLayer(layer);
            }
        });
        
        // Créer une classe de tuiles personnalisée
        // const CustomTileLayer = L.TileLayer.extend({
        //     createTile: function(coords, done) {
        //         const tile = document.createElement('img');
                
        //         // Essayer d'abord la tuile locale
        //         const localUrl = `maps/tile_${coords.z}_${coords.x}_${coords.y}.png`;
        //         tile.src = localUrl;
                
        //         // En cas d'erreur, utiliser OSM
        //         tile.onerror = () => {
        //             // Choisir un serveur OSM aléatoire
        //             const servers = ['a', 'b', 'c'];
        //             const server = servers[Math.floor(Math.random() * servers.length)];
        //             const osmUrl = `https://${server}.tile.openstreetmap.org/${coords.z}/${coords.x}/${coords.y}.png`;
                    
        //             console.log(`Tuile locale non trouvée: ${localUrl}, utilisation de ${osmUrl}`);
        //             tile.src = osmUrl;
                    
        //             // Mettre à jour les statistiques
        //             tileStats.osmLoaded++;
        //             console.log(`Stats de tuiles - Locales: ${tileStats.localLoaded}, OSM: ${tileStats.osmLoaded}`);
                    
        //             // Supprimer le gestionnaire d'erreur précédent pour éviter les boucles
        //             tile.onerror = (e) => {
        //                 console.error(`Impossible de charger la tuile OSM: ${osmUrl}`);
        //                 done(e, tile);
        //             };
        //         };
                
        //         tile.onload = function() {
        //             // Si la source est une URL locale, incrémenter le compteur local
        //             if (tile.src.includes('maps/tile_')) {
        //                 tileStats.localLoaded++;
        //                 console.log(`Stats de tuiles - Locales: ${tileStats.localLoaded}, OSM: ${tileStats.osmLoaded}`);
        //             }
        //             done(null, tile);
        //         };
                
        //         return tile;
        //     }
        // });






        const CustomTileLayer = L.TileLayer.extend({
            createTile: function(coords, done) {
                const tile = document.createElement('img');
                
                // Essayer d'abord la tuile locale avec le cache
                const localUrl = `maps/tile_${coords.z}_${coords.x}_${coords.y}.png`;
                
                // Utiliser fetchTileWithCache au lieu de l'assignation directe
                fetchTileWithCache(localUrl)
                    .then(response => {
                        if (response.ok) {
                            return response.blob();
                        } else {
                            throw new Error('Tuile locale non disponible');
                        }
                    })
                    .then(blob => {
                        // Créer une URL pour le blob
                        const objectURL = URL.createObjectURL(blob);
                        tile.src = objectURL;
                        
                        // Mettre à jour les statistiques
                        tileStats.localLoaded++;
                        
                        // Libérer l'URL du blob quand la tuile est chargée
                        tile.onload = function() {
                            URL.revokeObjectURL(objectURL);
                            done(null, tile);
                        };
                    })
                    .catch(error => {
                        // Fallback vers OSM si la tuile locale n'est pas disponible
                        const servers = ['a', 'b', 'c'];
                        const server = servers[Math.floor(Math.random() * servers.length)];
                        const osmUrl = `https://${server}.tile.openstreetmap.org/${coords.z}/${coords.x}/${coords.y}.png`;
                        
                        console.log(`Tuile locale non trouvée: ${localUrl}, utilisation de ${osmUrl}`);
                        tile.src = osmUrl;
                        
                        // Mettre à jour les statistiques
                        tileStats.osmLoaded++;
                        
                        tile.onload = function() {
                            done(null, tile);
                        };
                        
                        tile.onerror = function(e) {
                            console.error(`Impossible de charger la tuile OSM: ${osmUrl}`);
                            done(e, tile);
                        };
                    });
                
                return tile;
            }
        });


        
        // Ajouter la couche à la carte
        new CustomTileLayer("", {
            maxZoom: 19, // Assurez-vous que cette valeur est assez élevée
            minZoom: 1,  // Permettre un zoom arrière jusqu'au niveau mondial
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
    
    console.log("Carte d'animation redimensionnée:", animationMapPosition);
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
    const descendPath = [...path]; // Crée une copie du tableau

    // Inverser le chemin pour aller de la racine vers l'ancêtre
    const finalPath = path ? path.reverse() : [];
   
    return [finalPath, descendPath];
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

// Fonction d'initialisation de la synthèse vocale à exécuter au chargement
function initSpeechSynthesis() {
    if ('speechSynthesis' in window && !speechSynthesisInitialized) {
        console.log("🎤 Initialisation de la synthèse vocale...");
        // Créer et jouer une utterance silencieuse pour initialiser le moteur
        const initUtterance = new SpeechSynthesisUtterance("");
        initUtterance.volume = 0.00; // Muet
        initUtterance.rate = 1.8; // 
        initUtterance.onend = () => {
            console.log("🎤 Synthèse vocale initialisée avec succès");
            speechSynthesisInitialized = true;
        };
        initUtterance.onerror = (err) => {
            console.log("🎤 Erreur lors de l'initialisation de la synthèse vocale:", err);
            speechSynthesisInitialized = true; // Considérer comme initialisé quand même
        };
        
        // Forcer le chargement des voix
        window.speechSynthesis.getVoices();
        
        // Jouer l'utterance silencieuse
        window.speechSynthesis.speak(initUtterance);
    }
}
/* */

async function testSpeechSynthesisHealth(timeout = 1000) {
    console.log("🔍 Test de la santé de la synthèse vocale...");
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

    // Trouver les voix françaises disponibles
    let frenchVoices = voices.filter(voice => 
        voice.lang.startsWith('fr-FR') && 
        !voice.name.includes('ulti'));

    console.log("Voix françaises France disponibles:", frenchVoices, frenchVoices.map(v => v.name));

    if (frenchVoices.length === 0) {
        frenchVoices = voices.filter(voice => 
            voice.lang.startsWith('fr-') || 
            voice.name.toLowerCase().includes('french')
        );
        console.log("Voix françaises autres disponibles:", frenchVoices.map(v => v.name));
    } 
    if (frenchVoices.length === 0) {
        frenchVoices = voices.filter(voice => 
            voice.lang.startsWith('en-') );

        if (frenchVoices.length === 0) {
            frenchVoices = voices.filter(voice =>
                voice.localService);
            }
        console.log("Voix anglaise ou locales disponibles:", frenchVoices.map(v => v.name));
    }

    
    console.log("✅ or ⚠️ Connexion Internet ?", isOnline);
    
    
    if (!isOnline) {
        frenchVoices = voices.filter(voice =>
            voice.lang.startsWith('fr-') && voice.localService);
        console.log("Voix disponibles locales fr-:", frenchVoices);
        if (frenchVoices.length === 0) {
            frenchVoices = voices.filter(voice =>
                voice.lang.startsWith('en-') && voice.localService);
            console.log("Voix disponibles locales en-:", frenchVoices);
        }
        if (frenchVoices.length === 0) {
            frenchVoices = voices.filter(voice =>
                voice.localService);
            console.log("Voix disponibles locales:", frenchVoices);
        }   

        console.log("Voix françaises ou autres locales disponibles hors lignes :", frenchVoices.map(v => v.name));
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
    console.log(`⏱️ DÉBUT: speakPersonName pour ${personName}, vitesse initiale: ${optimalSpeechRate}`);
    
    // Initialiser la synthèse vocale si ce n'est pas déjà fait
    if (!speechSynthesisInitialized) {
        console.log("🔄 Premier appel à la synthèse vocale - initialisation...");
        initSpeechSynthesis();
        // Ajouter un petit délai pour laisser le temps à l'initialisation
        return new Promise(resolve => {
            setTimeout(() => {
                // Réappeler la fonction après initialisation
                speakPersonName(personName).then(resolve);
            }, 200);
        });
    }
    
    console.log("index animation =", animationState.currentIndex);
    
    // Vérifier si le son est activé
    if (!state.isSpeechEnabled) {
        console.log("🔇 Son désactivé - résolution immédiate");
        return new Promise(resolve => setTimeout(resolve, 1600));
    }
    


    return new Promise((resolve, reject) => {

        // Vérifier si le son est activé
        if (!state.isSpeechEnabled) {
            console.log("🔇 Son désactivé - résolution immédiate");
            resolve();
            return;
        }

        if (!('speechSynthesis' in window)) {
            console.log("❌ API SpeechSynthesis non disponible - résolution immédiate");
            resolve();
            return;
        }


        let timeOutDuration = 1800;
        if (animationState.currentIndex === 0) {
            console.log("🔄 Premier nom - forçage taux initial à 1.4");
            optimalSpeechRate = 1.2; // Commencer plus rapide pour le premier nom
            if (isSpeechInGoodHealth) timeOutDuration = 3500;
            else timeOutDuration = 2500;
        }
        if (animationState.currentIndex === 1) {
            console.log("🔄 Premier nom - forçage taux initial à 1.0");
            optimalSpeechRate = 1.2; //
            if (isSpeechInGoodHealth) timeOutDuration = 2500; 
            else timeOutDuration = 1800;

        }

        // contournement pour Chrome qui ne fonctionne pas bien avec la synthèse vocale
        let safetyTimeout;

        //Ajouter un timeout de sécurité qui résoudra la promesse après 3 secondes quoi qu'il arrive
        safetyTimeout = setTimeout(() => {
            console.log("⚠️ TIMEOUT: Timeout de sécurité de la synthèse vocale déclenché");
            window.speechSynthesis.cancel(); // Annuler toute synthèse en cours
            resolve(); // Résoudre la promesse pour continuer l'animation
        }, timeOutDuration);


        // Paramètres initiaux
        const targetDuration = 1500; // 1.5 seconde pour lire le nom
        const maxRate = 2.5; // Vitesse maximale
        const minRate = 1.0; // Vitesse minimale




        // Simplifier le nom avant lecture
        const simplifiedName = simplifyName(personName);
        console.log(`📝 Nom simplifié: ${simplifiedName}, index : ${animationState.currentIndex}`);




        
        
        async function measureSpeechDuration(rate) {
            console.log(`📏 DÉBUT mesure avec taux: ${rate}`);
            return new Promise((innerResolve) => {
                const utterance = new SpeechSynthesisUtterance(simplifiedName);
                utterance.rate = rate;
                utterance.lang = 'fr-FR';

                const startTime = Date.now();
                console.log(`⏱️ Démarrage mesure à: ${startTime}`);

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
                        console.log(`📊 Durée estimée: ${estimatedDuration}ms`);
                
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


                console.log(`🔊 Début synthèse pour ${simplifiedName} avec taux ${rate}`);
                window.speechSynthesis.speak(utterance);

                // speakAfterCancel(utterance);
            });
        }

        async function adaptiveSpeech() {
            try {
                console.log(`⚙️ DÉBUT adaptiveSpeech avec taux: ${optimalSpeechRate}`);
                const result = await measureSpeechDuration(optimalSpeechRate);
                console.log(`📊 Résultat mesure:`, result);
                
                // Ajuster la vitesse globale avec une approche plus symétrique
                if (result.duration > targetDuration + 200) {
                    // Si trop lent, augmenter progressivement
                    const oldRate = optimalSpeechRate;
                    optimalSpeechRate = Math.min(optimalSpeechRate + 0.2, maxRate);
                    console.log(`🐢 Trop LENT (${result.duration}ms) - Ajustement taux: ${oldRate} → ${optimalSpeechRate}`);
                } else if (result.duration < targetDuration - 200) {
                    // Si trop rapide, diminuer progressivement
                    const oldRate = optimalSpeechRate;
                    optimalSpeechRate = Math.max(optimalSpeechRate - 0.2, minRate);
                    console.log(`🐇 Trop RAPIDE (${result.duration}ms) - Ajustement taux: ${oldRate} → ${optimalSpeechRate}`);
                } else {
                    console.log(`✅ Durée OPTIMALE (${result.duration}ms) - Maintien taux: ${optimalSpeechRate}`);
                }
                
                clearTimeout(safetyTimeout); // Annuler le timeout si tout s'est bien passé
                console.log(`✅ FIN: speakPersonName - promesse résolue`);
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


/* solution basée sur les longeur de mots */
// window.utterances = [];
// function speakPersonName(personName) {
//     console.log(`⏱️ DÉBUT: speakPersonName pour ${personName}, vitesse initiale: ${optimalSpeechRate}`);

//     // Initialiser la synthèse vocale si ce n'est pas déjà fait
//     if (!speechSynthesisInitialized) {
//         console.log("🔄 Premier appel à la synthèse vocale - initialisation...");
//         initSpeechSynthesis();
//         // Ajouter un petit délai pour laisser le temps à l'initialisation
//         return new Promise(resolve => {
//             setTimeout(() => {
//                 speakPersonName(personName).then(resolve);
//             }, 500);
//         });
//     }

//     return new Promise((resolve) => {
//         // Vérifier si le son est activé
//         if (!state.isSpeechEnabled) {
//             resolve();
//             return;
//         }

//         // Simplifier le nom
//         const simplifiedName = simplifyName(personName);
//         console.log(`📝 Nom simplifié: ${simplifiedName}, index: ${animationState.currentIndex}`);
        
//         // Ajuster la vitesse selon le mot
//         if (animationState.currentIndex === 0) {
//             optimalSpeechRate = 1.1;
//             console.log("🔄 Premier nom - taux initial: 1.1");
//         }
        
//         // Annuler les synthèses précédentes
//         window.speechSynthesis.cancel();
        
//         // Créer l'utterance
//         const utterance = new SpeechSynthesisUtterance(simplifiedName);
//         utterance.rate = optimalSpeechRate;
//         utterance.lang = 'fr-FR';
        
//         // Sélectionner une voix française si possible
//         const voices = window.speechSynthesis.getVoices();
//         const frenchVoice = voices.find(voice => 
//             voice.lang.startsWith('fr-') || 
//             voice.name.toLowerCase().includes('french')
//         );
        
//         if (frenchVoice) {
//             utterance.voice = frenchVoice;
//         }
        
//         // IMPORTANT: Conserver la référence pour éviter le garbage collection
//         window.utterances.push(utterance);
        
//         // Calculer la durée estimée en fonction de la longueur et du taux
//         const baseTime = 1200;
//         const charTime = 90;
//         const duration = baseTime + (simplifiedName.length * charTime / optimalSpeechRate);
        
//         console.log(`🔊 Lancement synthèse avec taux ${optimalSpeechRate}, durée estimée: ${Math.round(duration)}ms`);
//         window.speechSynthesis.speak(utterance);
        
//         // Ajustement de la vitesse basé sur le mot
//         const shouldIncrease = simplifiedName.length > 14;
//         const shouldDecrease = simplifiedName.length < 6;
        
//         if (shouldIncrease && optimalSpeechRate < 1.7) {
//             optimalSpeechRate = Math.min(optimalSpeechRate + 0.1, 1.7);
//             console.log(`📏 Nom LONG (${simplifiedName.length} chars) - Augmentation taux à ${optimalSpeechRate}`);
//         } else if (shouldDecrease && optimalSpeechRate > 1.0) {
//             optimalSpeechRate = Math.max(optimalSpeechRate - 0.1, 1.0);
//             console.log(`📏 Nom COURT (${simplifiedName.length} chars) - Diminution taux à ${optimalSpeechRate}`);
//         }
        
//         // Attendre la fin estimée
//         setTimeout(() => {
//             console.log(`✅ FIN: speakPersonName - délai estimé écoulé`);
//             resolve();
//         }, duration);
//     });
// }

let isSpeechInGoodHealth = false;
let animationController = null;
let animationState = {
    path: [],          // Le chemin complet de l'animation
    descendpath: [],   // Le chemin complet descendant
    currentIndex: 0,   // L'index du nœud actuel
    isPaused: false
};


export async function startAncestorAnimation() {
    isSpeechInGoodHealth = await testSpeechSynthesisHealth();
    if (isSpeechInGoodHealth) {
        // Chrome ou Edge est coopératif
        console.log("✅ La synthèse vocale est prête et fonctionne correctement.");
    } else {
        // Chrome est grognon il faut utiliser une méthode de secours
          console.log("⚠️ La synthèse vocale ne fonctionne pas correctement. Utilisation de la méthode de secours.");
          window.speechSynthesis.cancel();
    }

    // resetMap();

    // Initialiser la carte au début de l'animation
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

    // Réinitialiser ou initialiser l'état si ce n'est pas déjà fait
    if (animationState.path.length === 0) {
        [animationState.path, animationState.descendpath] = findAncestorPath(state.rootPersonId, state.targetAncestorId);
        console.log("Chemin trouvé:", animationState.path);
        console.log("Chemin trouvé descendant:", animationState.descendpath);
        
        if (state.treeModeReal === 'descendants' || state.treeModeReal === 'directDescendants' ) {
            animationState.path = animationState.descendpath;
        }


        animationState.currentIndex = 0;
        animationState.isPaused = false;
    }

    let deltaXRatio = 1.5; // Ratio de décalage horizontal
    if (window.innerWidth < 400) { deltaXRatio = 1.0; } // Pour les petits écrans, on


    selectVoice();

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

            // Reprendre à partir de l'index actuel
            for (let i = animationState.currentIndex; i < animationState.path.length; i++) {

                animationState.currentIndex = i;
                // Vérifier si l'animation a été annulée ou mise en pause
                if (animationController.isCancelled || animationState.isPaused) {
                    animationState.currentIndex = i;
                    break;
                }

                const nodeId = animationState.path[i];
                const node = findNodeInTree(nodeId);
                // console.log("Noeud trouvé ? :",i,  nodeId, node);

                if (node) {

                    // Chercher un lieu à afficher
                    const person = state.gedcomData.individuals[node.data.id];
                    // Mettre à jour l'image de fond en fonction de la date de naissance de la personne
                    if (person && person.birthDate) {
                        const year = extractYear(person.birthDate);
                        if (year) {
                            updateBackgroundImage(year);
                        }
                    }

                    // Utiliser la fonction centralisée pour collecter les lieux
                    const validLocations = collectPersonLocations(person, state.gedcomData.families);


                    // Mettre à jour la carte
                    if (validLocations.length > 0) {
                        // updateAnimationMapLocations(validLocations, locationSymbols);
                        updateAnimationMapLocations(validLocations);
                    }


                    await new Promise(resolve => setTimeout(resolve, 100));

                    const zoom = getZoom();

                    console.log("\n\n\n #############   debug zomm", zoom, getLastTransform(), d3.zoomIdentity);

                    let initialOffsetY = 0;

                    if (zoom && (animationState.currentIndex === 0 )) {
                        lastTransform = getLastTransform() || d3.zoomIdentity;                      
                    
                        // Pour le 1er affichage de l'animation on décale le graphe vers le haut pour pouvoir positionner la map dessous
                        offsetX = 0;
                        if (window.innerHeight > 1000) {
                            offsetY = -450;
                       } else if (window.innerHeight > 800) {
                             offsetY = -300;
                        } else {
                             offsetY = -100;
                        }

                        initialOffsetY = -offsetY;
                        const horizontalShift = 0 ;
                        const verticalShift = -offsetY ;

                        svg.transition()
                            .duration(750)
                            .call(zoom.transform, 
                                lastTransform.translate(-horizontalShift, -verticalShift)
                            );
                        state.lastHorizontalPosition = state.lastHorizontalPosition + horizontalShift;
                        state.lastVerticalPosition = state.lastVerticalPosition + verticalShift;
                    }
                    let shiftAterRescale = false

                    if (zoom && state.screenResizeHasOccured && (animationState.currentIndex > 2) ) {

                        state.screenResizeHasOccured = false;

                        // console.log("\n\n\n\n\n #############   Recalage suite à changement de taille d'écran ############### new: ", window.innerWidth, window.innerHeight,", old=", state.prevPrevWindowInnerWidthInMap, state.prevPrevWindowInnerHeightInMap,"\n\n\n\n\n");
    
                        lastTransform = getLastTransform() || d3.zoomIdentity;                      
                    

                        let horizontalShift1 = 0;
                        if (window.innerWidth - state.prevPrevWindowInnerWidthInMap < -30) {
                            horizontalShift1 =   -(window.innerWidth - state.prevPrevWindowInnerWidthInMap)  + (state.boxWidth*2);
                        } else if (window.innerWidth - state.prevPrevWindowInnerWidthInMap > 30) {    
                            horizontalShift1 =  -(window.innerWidth - state.prevPrevWindowInnerWidthInMap) - (state.boxWidth*2);
                        }

                        let verticalShift1 = 0;
                        if (window.innerHeight - state.prevPrevWindowInnerHeightInMap < -30) {
                            verticalShift1 =  -(window.innerHeight - state.prevPrevWindowInnerHeightInMap); //  + (state.boxHeight*2);
                        } else  if (window.innerHeight - state.prevPrevWindowInnerHeightInMap > 30) {    
                            verticalShift1 = -(window.innerHeight - state.prevPrevWindowInnerHeightInMap); // - (state.boxHeight*2);
                        }

                        if (horizontalShift1 != 0 || verticalShift1 != 0) {
                            svg.transition()
                                .duration(750)
                                .call(zoom.transform, 
                                    lastTransform.translate(-horizontalShift1, -verticalShift1)
                                );
                            state.lastHorizontalPosition = state.lastHorizontalPosition + horizontalShift1;
                            state.lastVerticalPosition = state.lastVerticalPosition + verticalShift1;    

                            shiftAterRescale = true;
                        }

                            
                        console.log("\n\n\n\n\n #############   Recalage suite à changement de taille d'écran ############### new: ", window.innerWidth, window.innerHeight,", old=", state.prevPrevWindowInnerWidthInMap, state.prevPrevWindowInnerHeightInMap,", offset X=", -horizontalShift1 ,", offset Y=", -verticalShift1 , "\n\n\n\n\n");
   

    
                    }



                    if (animationState.currentIndex === 0) {
                        // Créer une promesse qui simule la lecture vocale si le son est coupé
                        const voicePromiseStart = state.isSpeechEnabled 
                            ? speakPersonName('en /voiture Simone')
                            : new Promise(resolve => setTimeout(resolve, 1600));
                        
                        // Attendre la lecture ou le délai
                        await voicePromiseStart;
                    }


                    let shiftTree =  false;


                    // Mettre à jour l'élément de la carte
                    if (zoom) {
                        lastTransform = getLastTransform() || d3.zoomIdentity;                                                
                        console.log("\n\n DEBUG 0 *******", node.y, window.innerWidth, state.boxWidth, deltaXRatio, 
                            (node.y > window.innerWidth - state.boxWidth*deltaXRatio),
                            (node.x + initialOffsetY > window.innerHeight - state.boxHeight*1.2),
                            (node.y + state.boxWidth - state.lastHorizontalPosition > state.boxWidth*0.2 ),
                            (node.x - state.lastVerticalPosition > state.boxHeight*0.2 ));
                        // si le noeud le plus plus à droite est trop près du bord droit on décale vers la gauche
                        if  (((node.y > window.innerWidth - state.boxWidth*deltaXRatio)  ||  (node.x + initialOffsetY > window.innerHeight - state.boxHeight*1.2))  
                             && ( (node.y + state.boxWidth - state.lastHorizontalPosition > state.boxWidth*0.2 ) || (node.x - state.lastVerticalPosition > state.boxHeight*0.2 )) )  {                                       

                            if (firstTimeShift) {
                                offsetX = (node.y - state.lastHorizontalPosition)
                                offsetY = (node.x - state.lastVerticalPosition);
                            }
                            firstTimeShift = false;
              
                            horizontalShift = (node.y - state.lastHorizontalPosition) - offsetX  + (state.boxWidth*2) ;
                            verticalShift = (node.x - state.lastVerticalPosition) - offsetY + (state.boxHeight)*2                             

                            state.lastHorizontalPosition = state.lastHorizontalPosition + horizontalShift;
                            state.lastVerticalPosition = state.lastVerticalPosition + verticalShift;
                            // console.log("\n\n DEBUG  SHIFT BEFORE  *******", node.data.name, -horizontalShift, -verticalShift, state.lastHorizontalPosition, state.lastVerticalPosition );
                            console.log("\n\n DEBUG  SHIFT compute offset   *******", node.data.name, -horizontalShift, -verticalShift );
                            shiftTree = true;
                        }
                    }




                    if (shiftTree && !shiftAterRescale) { 
                        lastTransform = getLastTransform() || d3.zoomIdentity;                                                               
                        const horizontalShift2 = state.boxWidth ;
                        const verticalShift2 = verticalShift; //0; 
                        await new Promise(resolve => {
                            svg.transition()
                                .duration(800)  // Durée plus longue pour être visible
                                .ease(d3.easeCubicOut) 
                                // d3.easeCubicOut - Démarre rapidement puis ralentit (recommandé pour les translations)
                                // d3.easeCubicInOut - Accélère puis ralentit
                                // d3.easeElasticOut - Effet avec un léger rebond à la fin
                                // d3.easeQuadInOut - Accélération et décélération douces
                                .call(zoom.transform, 
                                    lastTransform.translate(-horizontalShift2 , -verticalShift2)
                                )
                                .on("end", resolve);
                        });
                        console.log("\n\n DEBUG  SHIFT BEFORE drawTree  *******", node.data.name, -horizontalShift2, -verticalShift2 );
                    }




                    // Créer une promesse qui simule la lecture vocale si le son est coupé
                    const voicePromise = state.isSpeechEnabled 
                        ? speakPersonName(node.data.name)
                        : new Promise(resolve => setTimeout(resolve, 1600));
                    
                    // Attendre la lecture ou le délai
                    await voicePromise;



                    // Actions sur le nœud
                    if (!node.data.children || node.data.children.length === 0) {
                        const event = new Event('click');
                        if (state.treeModeReal === 'descendants' || state.treeModeReal === 'directDescendants' ) {
                            // handleNonRootDescendants(event, node);
                            console.log("debug handleDescendants", node);
                            handleDescendants(node);
                        } else {
                            handleAncestorsClick(event, node);
                        }
                        drawTree();
                    }




                    if (shiftTree) {
                        lastTransform = getLastTransform() || d3.zoomIdentity;                                         
                        svg.transition()
                            .call(zoom.transform, 
                                lastTransform.translate(-horizontalShift, -verticalShift)
                            );
                        console.log("\n\n DEBUG  SHIFT AFTER  drawTree  *******", node.data.name, -horizontalShift, -verticalShift );
                    }

                    state.prevPrevWindowInnerWidthInMap = state.previousWindowInnerWidthInMap;
                    state.prevPrevWindowInnerHeightInMap =  state.previousWindowInnerHeightInMap;
                    state.previousWindowInnerWidthInMap = window.innerWidth;
                    state.previousWindowInnerHeightInMap = window.innerHeight;


                } 
            }

            // Réinitialiser l'état si l'animation est terminée
            if (animationState.currentIndex >= animationState.path.length) {
                animationState.path = [];
                animationState.currentIndex = 0;
            }
            
            resolve(); // Résoudre la promesse une fois terminé
        } catch (error) {
            console.error('Erreur dans l\'animation:', error);
            reject(error); // Rejeter en cas d'erreur
        }
    });
}

export async function prepareAnimationDemo() {
    console.log("🔄 Préparation de la démo d'animation...");
    
    try {
        // Demander le dossier de sauvegarde
        console.log("Sélection du dossier de sauvegarde...");
        const directoryHandle = await window.showDirectoryPicker({
            mode: 'readwrite'
        });
        
        // Trouver le chemin d'animation
        const [path, descendPath] = findAncestorPath(state.rootPersonId, state.targetAncestorId);
        const finalPath = state.treeModeReal === 'descendants' ? descendPath : path;
        
        console.log(`📋 Chemin d'animation: ${finalPath.length} personnes`);
        
        // Collecter les lieux
        const locationsByPerson = [];
        for (const nodeId of finalPath) {
            const person = state.gedcomData.individuals[nodeId];
            if (person) {
                const validLocations = collectPersonLocations(person, state.gedcomData.families);
                if (validLocations.length > 0) {
                    locationsByPerson.push({
                        personId: nodeId,
                        personName: person.name || `Person ${nodeId}`,
                        locations: validLocations
                    });
                }
            }
        }
        
        console.log(`🗺️ ${locationsByPerson.length} personnes avec des lieux identifiés`);
        
        // Niveaux de zoom à télécharger
        const zoomLevels = [5, 6, 7, 8, 9];
        
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
            <p>Taille: <span id="size-estimate">0 KB</span></p>
            <p>Fichiers: <span id="files-created">0</span></p>
            <progress id="loading-bar" value="0" max="100" style="width: 300px;"></progress>
            <button id="cancel-preload" style="margin-top: 10px; padding: 5px 10px;">Annuler</button>
        `;
        document.body.appendChild(progressOverlay);
        
        let isCancelled = false;
        document.getElementById('cancel-preload').addEventListener('click', () => {
            isCancelled = true;
            progressOverlay.innerHTML = `<p>Annulation en cours...</p>`;
        });
        
        // Ensemble pour stocker les coordonnées de tuiles uniques
        const uniqueTiles = new Set();
        
        // Pour chaque personne/lieu, calculer les tuiles nécessaires
        for (const personData of locationsByPerson) {
            if (isCancelled) break;
            
            document.getElementById('current-person').textContent = personData.personName;
            
            for (const location of personData.locations) {
                if (isCancelled) break;
                
                document.getElementById('current-location').textContent = location.place;
                
                try {
                    // Géocoder le lieu
                    console.log(`Recherche de coordonnées pour ${location.place}...`);
                    const coords = await geocodeLocation(location.place);
                    
                    if (!coords) {
                        console.warn(`⚠️ Pas de coordonnées pour ${location.place}`);
                        continue;
                    }
                    
                    console.log(`Coordonnées obtenues: ${JSON.stringify(coords)}`);
                    
                    // Pour chaque niveau de zoom, calculer les tuiles visibles
                    for (const zoom of zoomLevels) {
                        if (isCancelled) break;
                        
                        // Calculer les coordonnées centrales des tuiles
                        const centerX = Math.floor((coords.lon + 180) / 360 * Math.pow(2, zoom));
                        const centerY = Math.floor((1 - Math.log(Math.tan(coords.lat * Math.PI / 180) + 1 / Math.cos(coords.lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
                        
                        // Ajouter les tuiles environnantes (pour couvrir la zone visible)
                        for (let x = centerX - 2; x <= centerX + 2; x++) {
                            for (let y = centerY - 2; y <= centerY + 2; y++) {
                                // Vérifier que les coordonnées sont valides
                                if (x >= 0 && y >= 0 && x < Math.pow(2, zoom) && y < Math.pow(2, zoom)) {
                                    uniqueTiles.add(`${zoom}_${x}_${y}`);
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error(`Erreur pour ${location.place}: ${error.message}`);
                }
            }
        }
        
        const tilesToDownload = Array.from(uniqueTiles);
        console.log(`🗺️ ${tilesToDownload.length} tuiles uniques identifiées`);
        
        // Mettre à jour l'interface
        const progressBar = document.getElementById('loading-bar');
        progressBar.max = tilesToDownload.length;
        document.getElementById('loading-progress').textContent = `0/${tilesToDownload.length}`;
        
        // Variables pour le suivi
        let totalSize = 0;
        let successCount = 0;
        let errorCount = 0;
        let processedCount = 0;
        
        // Fonction pour mettre à jour l'interface
        const updateUI = () => {
            document.getElementById('loading-progress').textContent = `${processedCount}/${tilesToDownload.length}`;
            progressBar.value = processedCount;
            document.getElementById('size-estimate').textContent = totalSize > 1024 * 1024 
                ? `${(totalSize / (1024 * 1024)).toFixed(2)} MB` 
                : `${(totalSize / 1024).toFixed(2)} KB`;
            document.getElementById('files-created').textContent = `${successCount} (${errorCount} erreurs)`;
        };
        
        // Télécharger les tuiles - limiter à 3 téléchargements simultanés
        const batchSize = 3;
        
        for (let i = 0; i < tilesToDownload.length; i += batchSize) {
            if (isCancelled) break;
            
            const batch = tilesToDownload.slice(i, i + batchSize);
            const batchPromises = batch.map(async tileKey => {
                const [zoom, x, y] = tileKey.split('_').map(Number);
                
                try {
                    // Choisir un serveur aléatoire
                    const servers = ['a', 'b', 'c'];
                    const server = servers[Math.floor(Math.random() * servers.length)];
                    
                    // URL de la tuile
                    const tileUrl = `https://${server}.tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
                    
                    // Télécharger la tuile
                    const response = await fetch(tileUrl);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error ${response.status}`);
                    }
                    
                    const blob = await response.blob();
                    
                    // Créer le nom de fichier pour la tuile
                    const fileName = `tile_${zoom}_${x}_${y}.png`;
                    
                    // Sauvegarder la tuile
                    const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
                    const writable = await fileHandle.createWritable();
                    await writable.write(blob);
                    await writable.close();
                    
                    // Mettre à jour les statistiques
                    totalSize += blob.size;
                    successCount++;
                    
                    return { success: true, file: fileName, size: blob.size };
                } catch (error) {
                    console.error(`Erreur avec la tuile ${zoom}/${x}/${y}: ${error.message}`);
                    errorCount++;
                    return { success: false, error: error.message };
                } finally {
                    processedCount++;
                    updateUI();
                }
            });
            
            // Attendre que toutes les tuiles du lot soient traitées
            await Promise.all(batchPromises);
            
            // Courte pause pour éviter de surcharger le serveur
            await new Promise(resolve => setTimeout(resolve, 300));
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
            <p>Total: ${successCount} tuiles stockées (${(totalSize / (1024 * 1024)).toFixed(2)} MB)</p>
            <p>Erreurs: ${errorCount}</p>
            <p>Chemin: ${directoryHandle.name}</p>
            <button id="close-preload-overlay" style="padding: 5px 10px; margin-top: 10px;">Fermer</button>
        `;
        progressOverlay.appendChild(finalStats);
        
        document.getElementById('close-preload-overlay').addEventListener('click', () => {
            document.body.removeChild(progressOverlay);
        });
        
        console.log("✅ Préparation de la démo terminée!");
        console.log(`📊 ${successCount} tuiles stockées, taille totale: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`);
        
        // Créer un fichier manifest
        try {
            const manifest = {
                dateCreated: new Date().toISOString(),
                totalTiles: successCount,
                totalSize: totalSize,
                errors: errorCount,
                zoomLevels: zoomLevels,
                tileUrls: tilesToDownload.map(key => {
                    const [zoom, x, y] = key.split('_').map(Number);
                    return `tile_${zoom}_${x}_${y}.png`;
                })
            };
            
            const manifestHandle = await directoryHandle.getFileHandle('manifest.json', { create: true });
            const manifestWritable = await manifestHandle.createWritable();
            await manifestWritable.write(JSON.stringify(manifest, null, 2));
            await manifestWritable.close();
        } catch (error) {
            console.warn("Erreur lors de la création du manifeste:", error);
        }
        
        return {
            persons: locationsByPerson.length,
            tiles: successCount,
            totalSize: totalSize,
            errors: errorCount
        };
    } catch (error) {
        console.error("Erreur lors de la préparation:", error);
        alert("Une erreur est survenue: " + error.message);
    }
}

export async function validateTilesCoverage() {
    // Reproduire le même chemin que startAncestorAnimation
    const [path, descendPath] = findAncestorPath(state.rootPersonId, state.targetAncestorId);
    const finalPath = state.treeModeReal === 'descendants' ? descendPath : path;
    
    // Collecter tous les emplacements
    const allLocations = [];
    for (const nodeId of finalPath) {
        const person = state.gedcomData.individuals[nodeId];
        if (person) {
            const locations = collectPersonLocations(person, state.gedcomData.families);
            for (const loc of locations) {
                if (loc.place && loc.place.trim() !== '') {
                    allLocations.push(loc);
                }
            }
        }
    }
    
    console.log(`Validation de ${allLocations.length} emplacements...`);
    
    // Niveaux de zoom à vérifier
    const zoomLevels = [5, 7, 9];
    
    // Résultats de la validation
    const results = {
        total: 0,
        found: 0,
        missing: []
    };
    
    // Pour chaque emplacement, vérifier les tuiles nécessaires
    for (const location of allLocations) {
        const coords = await geocodeLocation(location.place);
        if (!coords) continue;
        
        for (const zoom of zoomLevels) {
            // Calculer les coordonnées de tuile
            const tileX = Math.floor((coords.lon + 180) / 360 * Math.pow(2, zoom));
            const tileY = Math.floor((1 - Math.log(Math.tan(coords.lat * Math.PI / 180) + 1 / Math.cos(coords.lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
            
            // Vérifier si la tuile existe
            const fileName = `tile_${zoom}_${tileX}_${tileY}.png`;
            const filePath = `/maps/${fileName}`;
            
            results.total++;
            
            try {
                const response = await fetch(filePath, { method: 'HEAD' });
                if (response.ok) {
                    results.found++;
                } else {
                    results.missing.push({
                        location: location.place,
                        zoom,
                        x: tileX,
                        y: tileY,
                        file: fileName
                    });
                }
            } catch (e) {
                results.missing.push({
                    location: location.place,
                    zoom,
                    x: tileX,
                    y: tileY,
                    file: fileName,
                    error: e.message
                });
            }
        }
    }
    
    // Afficher les résultats
    console.log(`Validation terminée: ${results.found}/${results.total} tuiles trouvées (${(results.found/results.total*100).toFixed(1)}%)`);
    
    if (results.missing.length > 0) {
        console.warn(`${results.missing.length} tuiles manquantes`);
        console.table(results.missing.slice(0, 10)); // Afficher les 10 premières tuiles manquantes
        
        if (results.missing.length > 10) {
            console.log(`... et ${results.missing.length - 10} autres`);
        }
    } else {
        console.log("✅ Toutes les tuiles nécessaires sont disponibles!");
    }
    
    return results;
}

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

export function stopAnimation() {
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
}

export function resetAnimationState() {
    animationState = {
        path: [],
        currentIndex: 0,
        isPaused: false
    };

    // Réinitialiser le contrôleur d'animation
    if (animationController) {
        animationController.isCancelled = true;
    }

    // Arrêter toute animation en cours
    stopAnimation();

}