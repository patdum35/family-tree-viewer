import { state } from './main.js';
import { displayPersonDetails } from './modalWindow.js';
import { nameCloudState } from './nameCloud.js';
import { saveHeatmapPosition, makeElementDraggable } from './geoHeatMapInteractions.js';
import { refreshHeatmap } from './geoHeatMapDataProcessor.js';

/**
 * Crée et affiche la heatmap avec son interface utilisateur
 * 
 * @param {Array} locationData - Données de localisation pour la heatmap
 * @param {String} heatmapTitle - Titre à afficher pour la heatmap
 * @returns {HTMLElement} - L'élément wrapper de la heatmap créée
 */
export function createImprovedHeatmap(locationData, heatmapTitle) {
    // Fermer toute carte existante d'abord
    const existingMap = document.getElementById('namecloud-heatmap-wrapper');
    if (existingMap) {
        document.body.removeChild(existingMap);
    }

    // Créer un conteneur principal (semi-transparent) qui ne couvre pas tout l'écran
    const heatmapWrapper = document.createElement('div');

    heatmapWrapper.id = 'namecloud-heatmap-wrapper';
    heatmapWrapper.style.position = 'fixed';
    heatmapWrapper.style.top = '60px'; // Remonté de 20px comme demandé
    heatmapWrapper.style.left = '20px';
    heatmapWrapper.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
    heatmapWrapper.style.zIndex = '9000'; // Élevé mais inférieur aux contrôles (11000+)
    heatmapWrapper.style.display = 'flex'; // IMPORTANT - NE PAS SUPPRIMER
    heatmapWrapper.style.flexDirection = 'column';
    heatmapWrapper.style.borderRadius = '10px';
    heatmapWrapper.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    heatmapWrapper.style.overflow = 'hidden';
    heatmapWrapper.style.resize = 'both'; // Permettre le redimensionnement
    heatmapWrapper.style.minWidth = '50px'; //'400px';
    heatmapWrapper.style.minHeight = '50px'; //'300px';

    function applyHeatmapPosition() {
        // Appliquer les dimensions et positions sauvegardées
        if (nameCloudState.heatmapPosition) {
            
            const validPosition = 
                nameCloudState.heatmapPosition.top !== undefined && 
                nameCloudState.heatmapPosition.left !== undefined &&
                nameCloudState.heatmapPosition.width !== undefined && 
                nameCloudState.heatmapPosition.height !== undefined &&
                nameCloudState.heatmapPosition.width >= 200 &&  // Taille minimale raisonnable
                nameCloudState.heatmapPosition.height >= 150;   // Taille minimale raisonnable
                
                    
            // Vérifier que les valeurs sauvegardées sont valides
            if (validPosition) {
                // Pour la position
                heatmapWrapper.style.top = `${nameCloudState.heatmapPosition.top}px`;
                heatmapWrapper.style.left = `${nameCloudState.heatmapPosition.left}px`;
                
                // Pour les dimensions
                heatmapWrapper.style.width = `${nameCloudState.heatmapPosition.width}px`;
                heatmapWrapper.style.height = `${nameCloudState.heatmapPosition.height}px`;
                
                return true;
            } else {
                console.warn("Position sauvegardée invalide ou trop petite:", nameCloudState.heatmapPosition);
                // Réinitialiser les valeurs problématiques
                nameCloudState.heatmapPosition = null;
            }
        } else {
            console.log("Aucune position sauvegardée à appliquer");
        }
        
        return false;
    }

    if (!applyHeatmapPosition()) {
        // Revenir aux valeurs par défaut d'origine
        heatmapWrapper.style.top = '60px';
        heatmapWrapper.style.left = '20px';
        heatmapWrapper.style.width = 'calc(100% - 40px)';
        heatmapWrapper.style.height = 'calc(100% - 100px)';
    }

    // Ajoutez également un écouteur d'événement pour le redimensionnement de la fenêtre
    if (window._resizeHeatmapListener) {
        window.removeEventListener('resize', window._resizeHeatmapListener);
    }

    // Définir et stocker le nouvel écouteur
    window._resizeHeatmapListener = function() {
        const wrapper = document.getElementById('namecloud-heatmap-wrapper');
        if (!wrapper) return;
        
        // Obtenir les dimensions actuelles
        const wrapperRect = wrapper.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // Vérifier si la heatmap dépasserait les limites de l'écran
        let needsResize = false;
        
        // Si la largeur dépasse l'écran moins la marge
        if (wrapperRect.right > windowWidth - 20) {
            needsResize = true;
        }
        
        // Si la hauteur dépasse l'écran moins la marge
        if (wrapperRect.bottom > windowHeight - 20) {
            needsResize = true;
        }
        
        // Seulement redimensionner si nécessaire
        if (needsResize) {
            // Calculer les nouvelles dimensions pour respecter les marges
            const newWidth = Math.min(wrapperRect.width, windowWidth - 40);
            const newHeight = Math.min(wrapperRect.height, windowHeight - 100);
            
            // Appliquer les nouvelles dimensions
            wrapper.style.width = `${newWidth}px`;
            wrapper.style.height = `${newHeight}px`;
            
            // Rafraîchir la carte
            if (wrapper.map) {
                setTimeout(() => {
                    wrapper.map.invalidateSize();
                    
                    // Mettre à jour heat si disponible
                    const heat = wrapper.map._layers && Object.values(wrapper.map._layers).find(layer => 
                        layer && layer.setLatLngs && typeof layer._reset === 'function');
                    if (heat) {
                        heat._reset();
                    }
                }, 0);
            }
            
            // Sauvegarder la nouvelle position
            if (typeof saveHeatmapPosition === 'function') {
                saveHeatmapPosition();
            }
        }
    };

    // Ajouter l'écouteur
    window.addEventListener('resize', window._resizeHeatmapListener);

    // Nous créons un titleBar invisible pour permettre le drag même si la barre de titre n'est pas visible
    const titleBar = document.createElement('div');
    titleBar.style.padding = '8px 12px';
    titleBar.style.backgroundColor = '#4361ee';
    titleBar.style.color = 'white';
    titleBar.style.fontWeight = 'bold';
    titleBar.style.display = 'none'; // Masqué par défaut - MODE PETIT ÉCRAN
    titleBar.style.justifyContent = 'space-between';
    titleBar.style.alignItems = 'center';
    titleBar.style.cursor = 'move'; // Indiquer que c'est déplaçable
    titleBar.innerHTML = `
        <div class="title-text">${heatmapTitle || ''}</div>
        <div style="display: flex; gap: 10px;">
            <button id="heatmap-refresh" title="Rafraîchir la heatmap" 
                    style="background: none; border: none; color: white; cursor: pointer; font-size: 16px;">
                🔄
            </button>
            <button id="heatmap-close" title="Fermer la heatmap" 
                    style="background: none; border: none; color: white; cursor: pointer; font-size: 16px;">
                ✖
            </button>
        </div>
    `;

    // Conteneur de carte
    const mapContainer = document.createElement('div');
    mapContainer.id = 'ancestors-heatmap';
    mapContainer.style.flexGrow = '1';
    mapContainer.style.width = '100%';
    mapContainer.style.margin = '0';
    mapContainer.style.padding = '0';
    mapContainer.style.position = 'relative'; // Assure un positionnement correct
    mapContainer.style.zIndex = '1'; // Assure que la carte est visible dans son conteneur

    // Assembler les éléments
    heatmapWrapper.appendChild(titleBar);
    heatmapWrapper.appendChild(mapContainer);

    // Ajouter au body
    document.body.appendChild(heatmapWrapper);

    // Ajouter une poignée de déplacement toujours visible
    const dragHandle = document.createElement('div');
    dragHandle.className = 'heatmap-drag-handle';
    dragHandle.innerHTML = '✥'; //'⋮⋮'; // Symbole de déplacement (quatre points de suspension verticaux)
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
    dragHandle.style.zIndex = '9200';
    dragHandle.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)';
    dragHandle.title = 'Déplacer la carte';

    // Styles pour les petits écrans
    const dragHandleStyle = document.createElement('style');
    dragHandleStyle.textContent = `
    .heatmap-drag-handle {
        opacity: 0.4;
        transition: opacity 0.2s ease;
    }
    
    .heatmap-drag-handle:hover {
        opacity: 1;
    }
    `;

    document.head.appendChild(dragHandleStyle);
    heatmapWrapper.appendChild(dragHandle);

    // Créer une poignée de redimensionnement spécifique pour mobile
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'heatmap-resize-handle';
    resizeHandle.innerHTML = '⤡';
    resizeHandle.style.fontFamily = 'Arial, sans-serif'; // Police simple et moderne
    resizeHandle.style.fontSize = '23px'; // Taille légèrement augmentée
    resizeHandle.style.fontWeight = 'bold'; // Rendre la flèche plus visible
    resizeHandle.style.lineHeight = '1'; // Empêcher les problèmes de hauteur de ligne
    resizeHandle.style.paddingBottom = '4px';
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
    resizeHandle.style.zIndex = '9200';
    resizeHandle.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)';
    resizeHandle.title = 'Redimensionner la carte';

    // Ajouter des styles pour l'affichage conditionnel
    const resizeHandleStyle = document.createElement('style');
    resizeHandleStyle.textContent = `
    .heatmap-resize-handle {
        opacity: 0.8;
        transition: opacity 0.2s ease;
        display: flex; /* Toujours affiché */
    }
    
    .heatmap-resize-handle:hover {
        opacity: 1;
    }
    
    /* Sur les appareils tactiles, désactiver le redimensionnement natif */
    @media (pointer: coarse) {
        #namecloud-heatmap-wrapper {
        resize: none !important;
        }
    }
    `;

    document.head.appendChild(resizeHandleStyle);
    heatmapWrapper.appendChild(resizeHandle);

    // Gestion du redimensionnement maintenant déplacée dans heatMapInteractions.js
    setupResizeHandlers(resizeHandle, heatmapWrapper);

    // Modification de l'appel à makeElementDraggable pour inclure la nouvelle poignée
    makeElementDraggable(heatmapWrapper, [titleBar, dragHandle]);

    // Ajouter un écouteur pour sauvegarder la position après déplacement
    heatmapWrapper.addEventListener('mouseup', () => {
        saveHeatmapPosition();
    });

    // Ajouter un écouteur pour le redimensionnement
    if (window.ResizeObserver) {
        const resizeObserver = new ResizeObserver(() => {
            saveHeatmapPosition();
        });
        
        resizeObserver.observe(heatmapWrapper);
        heatmapWrapper.resizeObserver = resizeObserver;
    }

    // S'assurer que le conteneur du nameCloud n'interfère pas
    const nameCloudContainer = document.getElementById('name-Cloud-Container');
    if (nameCloudContainer) {
        // Sauvegarder le z-index original pour le restaurer à la fermeture
        nameCloudContainer.dataset.originalZIndex = nameCloudContainer.style.zIndex || 'auto';
        // Temporairement réduire son z-index pour que la heatmap soit au-dessus
        nameCloudContainer.style.zIndex = '1';
    }

    const restoreOriginalZindexes = () => {
        document.querySelectorAll('[data-original-z-index]').forEach(el => {
            el.style.zIndex = el.dataset.originalZIndex;
            // Nettoyer l'attribut data pour éviter des problèmes futurs
            delete el.dataset.originalZIndex;
        });
    };

    // Initialiser la carte Leaflet
    setTimeout(() => {
        initializeLeafletMap(heatmapWrapper, mapContainer, locationData, restoreOriginalZindexes, heatmapTitle);
    }, 100); // Petit délai pour s'assurer que le DOM est prêt

    return heatmapWrapper;
}

/**
 * Initialise la carte Leaflet et configure ses composants
 * 
 * @param {HTMLElement} heatmapWrapper - Conteneur principal de la heatmap
 * @param {HTMLElement} mapContainer - Conteneur spécifique pour la carte Leaflet
 * @param {Array} locationData - Données à afficher sur la carte
 * @param {Function} restoreOriginalZindexes - Fonction pour restaurer les z-index originaux
 */
function initializeLeafletMap(heatmapWrapper, mapContainer, locationData, restoreOriginalZindexes, heatmapTitle) {
    try {
        const map = L.map('ancestors-heatmap').setView([46.2276, 2.2137], 6); // Vue centrée sur la France

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Vérifier que nous avons des données valides
        if (!locationData || !Array.isArray(locationData) || locationData.length === 0) {
            console.error('Données de heatmap invalides:', locationData);
            return;
        }

        // Collecter les coordonnées valides
        const coordinates = locationData
            .filter(loc => loc.coords && typeof loc.coords.lat === 'number' && typeof loc.coords.lon === 'number')
            .map(loc => [loc.coords.lat, loc.coords.lon]);

        // Vérifier qu'il y a des coordonnées valides
        if (coordinates.length === 0) {
            console.error('Aucune coordonnée valide trouvée dans les données');
            return;
        }

        // Créer la couche de chaleur
        const heat = L.heatLayer(
            coordinates.map(coords => [...coords, 1]), 
            {
                radius: 25,
                blur: 15,
                maxZoom: 1,
            }
        ).addTo(map);

        // Ajouter des marqueurs interactifs
        locationData.forEach(location => {
            if (!location.coords || typeof location.coords.lat !== 'number' || typeof location.coords.lon !== 'number') {
                return;
            }

            const marker = L.circleMarker([location.coords.lat, location.coords.lon], {
                radius: 5,
                fillColor: 'white',
                color: '#000',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(map);

            // Conteneur de détails
            const detailsContainer = createDetailsContainer(heatmapWrapper);
            configureMarkerInteractions(marker, detailsContainer, location);
        });

        // Ajuster la vue à toutes les coordonnées valides
        try {
            if (coordinates.length > 0) {
                const bounds = L.latLngBounds(coordinates);
                if (bounds.isValid()) {
                    map.fitBounds(bounds, {
                        padding: [50, 50]
                    });
                }
            }
        } catch (error) {
            console.error('Erreur lors de l\'ajustement de la vue:', error);
        }

        // Gérer les événements des boutons avec restauration des z-index
        document.getElementById('heatmap-close').addEventListener('click', () => {
            // Restaurer le z-index original du conteneur nameCloud
            const nameCloudContainer = document.getElementById('name-Cloud-Container');
            if (nameCloudContainer) {
                nameCloudContainer.style.zIndex = nameCloudContainer.dataset.originalZIndex;
                delete nameCloudContainer.dataset.originalZIndex;
            }
            
            // Restaurer les z-index originaux de tous les éléments
            restoreOriginalZindexes();
            
            // Supprimer la heatmap
            document.body.removeChild(heatmapWrapper);
        });

        // Créer le titre intégré à la carte (toujours visible)
        createMapTitle(mapContainer, heatmapTitle);
        
        // Créer les contrôles de carte
        createMapControls(mapContainer, heatmapWrapper);
        
        // Configurer les boutons de zoom Leaflet
        configureLeafletZoomControls();
        
        // Masquer l'attribution Leaflet
        const attribution = document.querySelector('.leaflet-control-attribution');
        if (attribution) {
            attribution.style.display = 'none';
        }

        const currentCenter = map.getCenter();
        const currentZoom = map.getZoom();
        map.invalidateSize();
        map.setView(currentCenter, currentZoom, { animate: false });
        
        // Sauvegarde de la référence pour usage ultérieur
        heatmapWrapper.map = map;

        // Sauvegarder la position
        saveHeatmapPosition();
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de la carte:', error);
        alert('Erreur lors de la création de la carte. Voir console pour détails.');
    }
}

/**
 * Crée le conteneur pour afficher les détails d'un point sur la carte
 * 
 * @param {HTMLElement} heatmapWrapper - Conteneur principal de la heatmap
 * @returns {HTMLElement} - Conteneur de détails créé
 */
function createDetailsContainer(heatmapWrapper) {
    const detailsContainer = document.createElement('div');
    detailsContainer.id = 'heatmap-details';
    detailsContainer.style.padding = '10px';
    detailsContainer.style.backgroundColor = 'rgba(255,255,255,0.95)';
    detailsContainer.style.position = 'absolute';
    detailsContainer.style.bottom = '10px';
    detailsContainer.style.right = '10px';
    detailsContainer.style.zIndex = '9100'; // Z-index élevé pour être au-dessus de la carte
    detailsContainer.style.maxWidth = '300px';
    detailsContainer.style.maxHeight = '400px';
    detailsContainer.style.overflowY = 'auto';
    detailsContainer.style.borderRadius = '5px';
    detailsContainer.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    detailsContainer.style.display = 'none';
    heatmapWrapper.appendChild(detailsContainer);
    
    return detailsContainer;
}

/**
 * Configure les interactions d'un marqueur sur la carte
 * 
 * @param {L.CircleMarker} marker - Le marqueur Leaflet
 * @param {HTMLElement} detailsContainer - Conteneur pour afficher les détails
 * @param {Object} location - Données de localisation associées au marqueur
 */
function configureMarkerInteractions(marker, detailsContainer, location) {
    // Variable pour suivre l'état d'ouverture
    let isDetailsOpen = false;
    
    // Fonction pour afficher les détails
    const showDetails = () => {
        // Fermer tous les autres détails ouverts
        document.querySelectorAll('.heatmap-details-open').forEach(el => {
            el.style.display = 'none';
            el.classList.remove('heatmap-details-open');
        });
        
        // Afficher et marquer ces détails comme ouverts
        detailsContainer.style.display = 'block';
        detailsContainer.classList.add('heatmap-details-open');
        isDetailsOpen = true;
        
        // Générer le contenu des détails
        let details = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h3 style="margin: 0;">Détails du point</h3>
                <button id="close-details" style="background: none; border: none; font-size: 16px; cursor: pointer;">✖</button>
            </div>
            <p><strong>Lieu :</strong> ${location.placeName || "Lieu non spécifié"}</p>
            <p><strong>Nombre total d'occurrences :</strong> ${location.count}</p>
        `;
    
        if (location.families && Object.keys(location.families).length > 0) {
            details += `<h4>Noms de famille (${Object.keys(location.families).length}):</h4>
            <div style="max-height: 150px; overflow-y: auto; border: 1px solid #eee; padding: 5px; margin-bottom: 10px;">
                <ul style="margin: 0; padding-left: 20px;">`;
            
            // Trier les noms de famille par nombre d'occurrences
            const sortedFamilies = Object.entries(location.families)
                .sort((a, b) => b[1] - a[1]);
    
            // Afficher tous les noms de famille
            sortedFamilies.forEach(([family, count]) => {
                details += `<li>${family}: ${count} occurrence${count > 1 ? 's' : ''}</li>`;
            });
            
            details += `</ul></div>`;
        }
    
        if (location.locations && location.locations.length > 0) {
            details += `<h4>Personnes (${location.locations.length}):</h4>
            <div style="max-height: 250px; overflow-y: auto; border: 1px solid #eee; padding: 5px; margin-bottom: 10px;">
                <ul style="margin: 0; padding-left: 20px;">`;
            
            // Trier les personnes par type d'événement et par année si disponible
            const sortedLocations = [...location.locations].sort((a, b) => {
                // D'abord par type d'événement
                if (a.type !== b.type) {
                    return a.type.localeCompare(b.type);
                }
                // Ensuite par année si disponible
                if (a.year && b.year && a.year !== 'N/A' && b.year !== 'N/A') {
                    return parseInt(a.year) - parseInt(b.year);
                }
                // Sinon par nom
                return a.name.localeCompare(b.name);
            });
            
            // Afficher toutes les personnes
            sortedLocations.forEach(person => {
                details += `<li>${person.name} (${person.type}${person.year && person.year !== 'N/A' ? ` - ${person.year}` : ''})</li>`;
            });
            
            details += `</ul></div>`;
        }
    
        detailsContainer.innerHTML = details;
        
        // Ajouter un gestionnaire d'événements pour le bouton de fermeture
        const closeButton = detailsContainer.querySelector('#close-details');
        if (closeButton) {
            closeButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Empêcher la propagation aux autres écouteurs
                detailsContainer.style.display = 'none';
                detailsContainer.classList.remove('heatmap-details-open');
                isDetailsOpen = false;
            });
        }
    };

    // Événements de survol et de clic
    marker.on('mouseover', () => {
        if (!isDetailsOpen) {
            showDetails();
        }
    });
    
    marker.on('mouseout', (e) => {
        // Ne pas fermer si les détails sont fixés (après un clic)
        if (!isDetailsOpen) {
            setTimeout(() => {
                // Vérifier si la souris n'est pas revenue sur le conteneur de détails
                const x = e.originalEvent.clientX;
                const y = e.originalEvent.clientY;
                const elem = document.elementFromPoint(x, y);
                if (!detailsContainer.contains(elem)) {
                    detailsContainer.style.display = 'none';
                }
            }, 100);
        }
    });
    
    marker.on('click', () => {
        // Basculer l'état d'ouverture au clic
        isDetailsOpen = !isDetailsOpen;
        
        if (isDetailsOpen) {
            showDetails();
        } else {
            detailsContainer.style.display = 'none';
            detailsContainer.classList.remove('heatmap-details-open');
        }
    });

    // Gérer les clics sur le conteneur de détails lui-même
    detailsContainer.addEventListener('click', (e) => {
        // Empêcher que les clics sur les détails ne ferment l'info-bulle
        e.stopPropagation();
    });
    
    // Ajouter un écouteur de document pour fermer les détails quand on clique ailleurs
    document.addEventListener('click', (e) => {
        if (isDetailsOpen && !detailsContainer.contains(e.target) && 
            e.target !== marker._path) {
            detailsContainer.style.display = 'none';
            detailsContainer.classList.remove('heatmap-details-open');
            isDetailsOpen = false;
        }
    });
}

/**
 * Crée le titre affiché sur la carte
 * 
 * @param {HTMLElement} mapContainer - Conteneur de la carte
 * @param {String} heatmapTitle - Titre à afficher
 */
function createMapTitle(mapContainer, heatmapTitle = 'Heatmap') {
    const mapTitle = document.createElement('div');
    mapTitle.id = 'heatmap-map-title';
    mapTitle.style.position = 'absolute';
    mapTitle.style.top = '10px';
    mapTitle.style.left = '10px';
    mapTitle.style.zIndex = '1000';
    mapTitle.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    mapTitle.style.padding = '3px 6px';
    mapTitle.style.borderRadius = '4px';
    mapTitle.style.fontSize = '12px';
    mapTitle.style.fontWeight = 'bold';
    mapTitle.style.maxWidth = '70%';
    mapTitle.textContent = heatmapTitle.replace(/^Heatmap\s*-\s*/, '');
    mapContainer.appendChild(mapTitle);
}

/**
 * Crée les contrôles de la carte (boutons de rafraîchissement et fermeture)
 * 
 * @param {HTMLElement} mapContainer - Conteneur de la carte
 * @param {HTMLElement} heatmapWrapper - Conteneur principal de la heatmap
 */
function createMapControls(mapContainer, heatmapWrapper) {
    const controlsContainer = document.createElement('div');
    controlsContainer.id = 'heatmap-map-controls';
    controlsContainer.style.position = 'absolute';
    controlsContainer.style.top = '10px';
    controlsContainer.style.right = '10px';
    controlsContainer.style.zIndex = '1000';
    controlsContainer.style.display = 'flex';
    controlsContainer.style.gap = '5px';
    
    // Bouton refresh
    const refreshBtn = document.createElement('button');
    refreshBtn.innerHTML = '🔄';
    refreshBtn.title = 'Rafraîchir la heatmap';
    refreshBtn.style.width = '24px';
    refreshBtn.style.height = '24px';
    refreshBtn.style.padding = '0';
    refreshBtn.style.border = '1px solid #ccc';
    refreshBtn.style.borderRadius = '3px';
    refreshBtn.style.backgroundColor = 'white';
    refreshBtn.style.cursor = 'pointer';
    refreshBtn.style.fontSize = '12px';
    refreshBtn.style.display = 'flex';
    refreshBtn.style.justifyContent = 'center';
    refreshBtn.style.alignItems = 'center';
    
    // Bouton fermeture
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✖';
    closeBtn.title = 'Fermer la heatmap';
    closeBtn.style.width = '24px';
    closeBtn.style.height = '24px';
    closeBtn.style.padding = '0';
    closeBtn.style.border = '1px solid #ccc';
    closeBtn.style.borderRadius = '3px';
    closeBtn.style.backgroundColor = 'white';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.fontSize = '12px';
    closeBtn.style.display = 'flex';
    closeBtn.style.justifyContent = 'center';
    closeBtn.style.alignItems = 'center';
    
    // Ajouter les écouteurs d'événements
    refreshBtn.addEventListener('click', () => {
        if (typeof refreshHeatmap === 'function') {
            refreshHeatmap();
        }
    });
    
    closeBtn.addEventListener('click', () => {
        const wrapper = document.getElementById('namecloud-heatmap-wrapper');
        if (wrapper) {
            document.body.removeChild(wrapper);
            // Restaurer les z-index si nécessaire
            document.querySelectorAll('[data-original-z-index]').forEach(el => {
                el.style.zIndex = el.dataset.originalZIndex;
                delete el.dataset.originalZIndex;
            });
        }
    });
    
    controlsContainer.appendChild(refreshBtn);
    controlsContainer.appendChild(closeBtn);
    mapContainer.appendChild(controlsContainer);
}

/**
 * Configure les contrôles de zoom Leaflet
 */
function configureLeafletZoomControls() {
    const zoomControl = document.querySelector('.leaflet-control-zoom');
    if (zoomControl) {
        zoomControl.style.transform = 'scale(0.7)';
        zoomControl.style.transformOrigin = 'top right';
        zoomControl.style.marginTop = '40px';
        zoomControl.style.marginLeft = '-7px';
        
        const zoomButtons = zoomControl.querySelectorAll('a');
        zoomButtons.forEach(btn => {
            btn.style.width = '28px';
            btn.style.height = '28px';
            btn.style.lineHeight = '28px';
            btn.style.fontSize = '16px';
        });
    }
}

/**
 * Configure les gestionnaires d'événements pour le redimensionnement
 * 
 * @param {HTMLElement} resizeHandle - Poignée de redimensionnement
 * @param {HTMLElement} heatmapWrapper - Conteneur principal de la heatmap
 */
function setupResizeHandlers(resizeHandle, heatmapWrapper) {
    // Variables pour le suivi du redimensionnement
    let isResizing = false;
    let startX, startY, startWidth, startHeight;

    // Fonction pour gérer le début du redimensionnement (souris)
    resizeHandle.addEventListener('mousedown', (e) => {
        initResize(e.clientX, e.clientY);
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
        e.preventDefault();
    });

    // Fonction pour gérer le début du redimensionnement (tactile)
    resizeHandle.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            initResize(touch.clientX, touch.clientY);
            document.addEventListener('touchmove', resizeTouch);
            document.addEventListener('touchend', stopResize);
            document.addEventListener('touchcancel', stopResize);
            e.preventDefault();
        }
    });

    // Initialisation du redimensionnement
    function initResize(x, y) {
        isResizing = true;
        startX = x;
        startY = y;
        startWidth = heatmapWrapper.offsetWidth;
        startHeight = heatmapWrapper.offsetHeight;
        heatmapWrapper.style.userSelect = 'none'; // Empêcher la sélection de texte
        document.body.style.cursor = 'nwse-resize'; // Changer le curseur du document
    }

    // Fonction de redimensionnement (souris)
    function resize(e) {
        if (!isResizing) return;
        
        // Calculer la nouvelle taille
        const newWidth = startWidth + (e.clientX - startX);
        const newHeight = startHeight + (e.clientY - startY);
        
        // Appliquer la nouvelle taille avec des minimums
        heatmapWrapper.style.width = `${Math.max(50, newWidth)}px`;
        heatmapWrapper.style.height = `${Math.max(50, newHeight)}px`;
        
        // Rafraîchir la carte si elle existe
        if (heatmapWrapper.map) {
            heatmapWrapper.map.invalidateSize();
        }
    }

    // Fonction de redimensionnement (tactile)
    function resizeTouch(e) {
        if (!isResizing || e.touches.length !== 1) return;
        
        const touch = e.touches[0];
        const newWidth = startWidth + (touch.clientX - startX);
        const newHeight = startHeight + (touch.clientY - startY);
        
        heatmapWrapper.style.width = `${Math.max(200, newWidth)}px`;
        heatmapWrapper.style.height = `${Math.max(150, newHeight)}px`;
        
        if (heatmapWrapper.map) {
            heatmapWrapper.map.invalidateSize();
        }
        
        // Empêcher le défilement de la page pendant le redimensionnement
        e.preventDefault();
    }

    // Arrêt du redimensionnement
    function stopResize() {
        if (isResizing) {
            isResizing = false;
            heatmapWrapper.style.userSelect = '';
            document.body.style.cursor = '';
            
            // Supprimer les écouteurs d'événements
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('touchmove', resizeTouch);
            document.removeEventListener('mouseup', stopResize);
            document.removeEventListener('touchend', stopResize);
            document.removeEventListener('touchcancel', stopResize);
            
            // Ajouter un petit délai pour s'assurer que les animations sont terminées
            setTimeout(saveHeatmapPosition, 100);
        }
    }
}