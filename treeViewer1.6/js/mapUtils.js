import { geocodeLocation } from './geoLocalisation.js';

/**
 * Symboles pour chaque type de lieu
 */
export const locationSymbols = {
    'Naissance': '👶',
    'Mariage': '💍',
    'Décès': '✝️',
    'Résidence1': '🏠',
    'Résidence2': '🏠',
    'Résidence3': '🏠'
};

/**
 * Ajuste la vue de la carte pour inclure tous les marqueurs
 * @param {L.Map} map - Instance de la carte Leaflet
 * @param {Array} markers - Tableaux des marqueurs à inclure
 * @param {Object} options - Options supplémentaires
 */
export function fitMapToMarkers(map, markers, options = {}) {
    if (!map || markers.length === 0) {
        return;
    }

    const defaultOptions = {
        maxZoom: 9,        // Zoom maximum (9 ≈ 50km de rayon)
        animate: true,     // Animation activée par défaut
        duration: 1.5,     // Durée de l'animation en secondes
        padding: [50, 50], // Marge autour des marqueurs
        easeLinearity: 0.25 // Fluidité de l'animation
    };

    const mergedOptions = { ...defaultOptions, ...options };
    
    // Créer les limites à partir des marqueurs
    const coordinates = markers.map(m => m.getLatLng());
    const bounds = L.latLngBounds(coordinates);

    // Vérifier si les limites sont valides
    if (bounds.isValid()) {
        // Calculer le centre des limites
        const center = bounds.getCenter();
        
        // Calculer le niveau de zoom pour afficher toutes les limites
        const zoomLevel = map.getBoundsZoom(bounds, false, mergedOptions.padding);
        
        // Limiter le niveau de zoom au maximum spécifié
        const limitedZoom = Math.min(zoomLevel, mergedOptions.maxZoom);
        
        // Appliquer le zoom limité avec une transition fluide
        map.flyTo(center, limitedZoom, {
            animate: mergedOptions.animate,
            duration: mergedOptions.duration,
            easeLinearity: mergedOptions.easeLinearity
        });
    } else {
        // Fallback: centrer sur le premier marqueur avec un zoom fixe
        if (markers.length > 0) {
            map.flyTo(markers[0].getLatLng(), 7, {
                animate: mergedOptions.animate,
                duration: mergedOptions.duration
            });
        }
    }
}

/**
 * Crée un marqueur personnalisé avec un symbole
 * @param {string} type - Type de l'événement (Naissance, Mariage, etc.)
 * @returns {L.DivIcon} - L'icône pour Leaflet
 */
export function createEnhancedMarkerIcon(type) {
    const symbolInfo = {
        emoji: locationSymbols[type] || '📍',
        color: getColorForLocationType(type),
        bgColor: getBgColorForLocationType(type)
    };

    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="
            font-size: 28px;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 40px;
            height: 40px;
            background-color: ${symbolInfo.bgColor};
            border: 3px solid ${symbolInfo.color};
            border-radius: 50%;
            box-shadow: 0 3px 6px rgba(0,0,0,0.3);
            text-shadow: 0 0 2px white;
        ">${symbolInfo.emoji}</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });
}

/**
 * Obtient la couleur pour un type de lieu
 */
function getColorForLocationType(type) {
    const colors = {
        'Naissance': '#1976D2',
        'Mariage': '#D81B60',
        'Décès': '#5D4037',
        'Résidence1': '#388E3C',
        'Résidence2': '#388E3C',
        'Résidence3': '#388E3C'
    };
    return colors[type] || '#757575';
}

/**
 * Obtient la couleur de fond pour un type de lieu
 */
function getBgColorForLocationType(type) {
    const bgColors = {
        'Naissance': '#E3F2FD',
        'Mariage': '#FCE4EC',
        'Décès': '#EFEBE9',
        'Résidence1': '#E8F5E9',
        'Résidence2': '#E8F5E9',
        'Résidence3': '#E8F5E9'
    };
    return bgColors[type] || '#F5F5F5';
}

/**
 * Collecte les lieux d'une personne
 * @param {Object} person - Objet contenant les données de la personne
 * @param {Object} families - Objet contenant les données des familles
 * @returns {Array} - Tableau des lieux
 */
export function collectPersonLocations(person, families) {
    if (!person) return [];

    // Collecter les lieux de base
    const locations = [
        { type: 'Naissance', place: person.birthPlace, date: person.birthDate },
        { type: 'Décès', place: person.deathPlace, date: person.deathDate },
        { type: 'Résidence1', place: person.residPlace1, date: person.residDate1 },
        { type: 'Résidence2', place: person.residPlace2, date: person.residDate2 },
        { type: 'Résidence3', place: person.residPlace3, date: person.residDate3 }
    ];

    // Ajouter les lieux de mariage
    if (person.spouseFamilies && person.spouseFamilies.length > 0) {
        for (const famId of person.spouseFamilies) {
            const family = families[famId];
            if (family && family.marriagePlace) {
                locations.splice(1, 0, { 
                    type: 'Mariage', 
                    place: family.marriagePlace,
                    date: family.marriageDate
                });
            }
        }
    }

    // Filtrer les lieux non vides
    return locations.filter(loc => loc.place && loc.place.trim() !== '');
}

/**
 * Crée une carte avec des marqueurs pour les lieux d'une personne
 * @param {string} containerId - ID de l'élément conteneur
 * @param {Array} locations - Lieux à afficher sur la carte
 * @param {Object} options - Options supplémentaires
 */
export function createLocationMap(containerId, locations, options = {}) {
    if (!locations || locations.length === 0) return;

    const defaultOptions = {
        initialZoom: 5,               // Zoom initial
        initialCenter: [46.2276, 2.2137], // Centre de la France
        attribution: false,           // Masquer l'attribution
        zoomControl: false,           // Masquer les contrôles de zoom
        maxZoom: 9                    // Zoom maximum
    };

    const mergedOptions = { ...defaultOptions, ...options };

    // Initialiser la carte
    const map = L.map(containerId, {
        attributionControl: mergedOptions.attribution,
        zoomControl: mergedOptions.zoomControl
    }).setView(mergedOptions.initialCenter, mergedOptions.initialZoom);

    // Ajouter la couche de tuiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: mergedOptions.attribution ? '© OpenStreetMap contributors' : ''
    }).addTo(map);

    // Tableau pour stocker les marqueurs
    const markers = [];

    // Créer les marqueurs
    const markerPromises = locations.map(location => {
        return geocodeLocation(location.place).then(coords => {
            if (coords) {
                const markerIcon = createEnhancedMarkerIcon(location.type);
                
                const marker = L.marker([coords.lat, coords.lon], { icon: markerIcon })
                    .addTo(map)
                    .bindPopup(`<div style="font-weight:bold;text-align:center;">${locationSymbols[location.type]} ${location.place}</div>`);
                
                markers.push(marker);
                return marker;
            }
            return null;
        });
    });

    // Ajuster la vue
    Promise.all(markerPromises).then(() => {
        if (markers.length > 0) {
            fitMapToMarkers(map, markers, {
                maxZoom: mergedOptions.maxZoom,
                animate: true,
                duration: 1.5
            });
        }
    });

    return { map, markers, markerPromises };
}

/**
 * Initialise une carte d'animation
 * @param {string} containerId - ID du conteneur de la carte
 * @param {Object} options - Options de configuration
 * @returns {L.Map} - Instance de la carte
 */
export function initAnimationMap(containerId, options = {}) {
    const defaultOptions = {
        center: [46.2276, 2.2137], // Centre de la France
        zoom: 5,
        zoomControl: false,
        attributionControl: false
    };

    const mergedOptions = { ...defaultOptions, ...options };
    
    const container = document.getElementById(containerId);
    if (!container) return null;

    // Initialiser la carte
    const map = L.map(containerId, mergedOptions);

    // Ajouter la couche de tuiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    return map;
}

/**
 * Crée une icône de marqueur simple
 * @param {string} type - Type de lieu
 * @returns {L.DivIcon} - Icône du marqueur
 */
export function createSimpleMarkerIcon(type) {
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="font-size: 20px; display: flex; justify-content: center; align-items: center;">
                 ${locationSymbols[type] || '📍'}
               </div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
}

/**
 * Met à jour les marqueurs d'une carte d'animation
 * @param {L.Map} map - Carte à mettre à jour
 * @param {Array} locations - Lieux à afficher
 * @param {Object} options - Options supplémentaires
 * @returns {Promise<Array>} - Les marqueurs créés
 */
export async function updateAnimationMapMarkers(map, locations, options = {}) {
    if (!map) return [];
    
    // Supprimer les marqueurs existants si spécifié
    if (options.clearExisting && options.existingMarkers) {
        options.existingMarkers.forEach(marker => map.removeLayer(marker));
    }
    
    // Tableau des nouveaux marqueurs
    const markers = [];
    
    // Filtrer les lieux non vides
    const validLocations = locations.filter(loc => loc.place && loc.place.trim() !== '');
    
    if (validLocations.length === 0) {
        return markers;
    }
    
    // Géocoder et créer les marqueurs
    const locationPromises = validLocations.map(location => 
        geocodeLocation(location.place)
            .then(coords => {
                if (coords && !isNaN(coords.lat) && !isNaN(coords.lon)) {
                    // Créer l'icône en fonction du type de marqueur requis
                    // const markerIcon = options.enhanced 
                    //     ? createEnhancedMarkerIcon(location.type)
                    //     : createSimpleMarkerIcon(location.type);
                    
                    const markerIcon = options.enhanced === true 
                    ? createEnhancedMarkerIcon(location.type)
                    : options.enhanced === 'medium'
                        ? createMediumMarkerIcon(location.type)
                        : createSimpleMarkerIcon(location.type);

                        // Créer et ajouter le marqueur
                    const marker = L.marker([coords.lat, coords.lon], { icon: markerIcon })
                        .addTo(map)
                        .bindPopup(`${location.type}: ${location.place}`);
                    
                    markers.push(marker);
                    return marker;
                }
                return null;
            })
            .catch(error => {
                console.error(`Erreur lors du géocodage de ${location.place}:`, error);
                return null;
            })
    );
    
    // Attendre que tous les marqueurs soient créés
    await Promise.all(locationPromises);
    
    // Ajuster la vue pour montrer tous les marqueurs
    if (markers.length > 0 && options.fitToMarkers !== false) {
        fitMapToMarkers(map, markers, {
            maxZoom: options.maxZoom || 9,
            animate: true,
            duration: options.duration || 1.5
        });
    }
    
    return markers;
}

/**
 * Nettoie une carte en supprimant toutes les couches sauf les tuiles de base
 * @param {L.Map} map - Instance de la carte Leaflet
 */
export function clearMap(map) {
    if (!map) return;
    
    map.eachLayer(layer => {
        if (!(layer instanceof L.TileLayer)) {
            map.removeLayer(layer);
        }
    });
}

/**
 * Ajoute un titre à la carte
 * @param {HTMLElement} container - Conteneur de la carte
 * @param {string} title - Texte du titre
 * @returns {HTMLElement} - L'élément de titre créé
 */
export function addMapTitle(container, title) {
    const existingTitle = container.querySelector('.individual-map-title');
    if (existingTitle) existingTitle.remove();
    
    const titleElement = document.createElement('div');
    titleElement.className = 'individual-map-title';
    titleElement.style.position = 'absolute';
    titleElement.style.top = '10px';
    titleElement.style.left = '50%';
    titleElement.style.transform = 'translateX(-50%)';
    titleElement.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    titleElement.style.padding = '5px 10px';
    titleElement.style.borderRadius = '4px';
    titleElement.style.zIndex = '9100';
    titleElement.style.fontSize = '14px';
    titleElement.style.fontWeight = 'bold';
    titleElement.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)';
    titleElement.textContent = title;
    
    container.appendChild(titleElement);
    return titleElement;
}

/**
 * Ajoute un bouton de retour à la carte
 * @param {HTMLElement} container - Conteneur de la carte
 * @param {string} text - Texte du bouton
 * @param {Function} onClick - Fonction appelée au clic
 * @returns {HTMLElement} - Le bouton créé
 */
export function addMapButton(container, text, onClick) {
    const existingButton = container.querySelector('.reset-heatmap-button');
    if (existingButton) existingButton.remove();
    
    const button = document.createElement('button');
    button.className = 'reset-heatmap-button';
    button.style.position = 'absolute';
    button.style.bottom = '10px';
    button.style.right = '10px';
    button.style.backgroundColor = '#4361ee';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.padding = '5px 10px';
    button.style.cursor = 'pointer';
    button.style.zIndex = '9100';
    button.style.fontSize = '14px';
    button.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)';
    button.textContent = text;
    
    button.addEventListener('click', onClick);
    
    container.appendChild(button);
    return button;
}

/**
 * Ajoute un overlay de chargement à la carte
 * @param {HTMLElement} container - Conteneur de la carte
 * @param {string} message - Message à afficher
 * @returns {HTMLElement} - L'élément d'overlay créé
 */
export function addLoadingOverlay(container, message = 'Chargement...') {
    const existingOverlay = container.querySelector('#map-loading-overlay');
    if (existingOverlay) existingOverlay.remove();
    
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'map-loading-overlay';
    loadingOverlay.style.position = 'absolute';
    loadingOverlay.style.top = '0';
    loadingOverlay.style.left = '0';
    loadingOverlay.style.width = '100%';
    loadingOverlay.style.height = '100%';
    loadingOverlay.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
    loadingOverlay.style.display = 'flex';
    loadingOverlay.style.justifyContent = 'center';
    loadingOverlay.style.alignItems = 'center';
    loadingOverlay.style.zIndex = '9500';
    loadingOverlay.innerHTML = `<div style="text-align: center;"><p>${message}</p><progress style="width: 200px;"></progress></div>`;
    
    container.appendChild(loadingOverlay);
    return loadingOverlay;
}

/**
 * Supprime l'overlay de chargement
 * @param {HTMLElement} container - Conteneur de la carte
 */
export function removeLoadingOverlay(container) {
    const overlay = container.querySelector('#map-loading-overlay');
    if (overlay) overlay.remove();
}

/**
 * Configure le style CSS personnalisé pour les popups
 */
export function setupCustomPopupStyle() {
    if (!document.getElementById('custom-popup-style')) {
        const style = document.createElement('style');
        style.id = 'custom-popup-style';
        style.textContent = `
            .custom-popup .leaflet-popup-content-wrapper {
                background-color: rgba(255, 255, 255, 0.95);
                border-radius: 8px;
                box-shadow: 0 3px 14px rgba(0,0,0,0.4);
            }
            .custom-popup .leaflet-popup-content {
                margin: 13px 19px;
                font-size: 14px;
                line-height: 1.4;
            }
            .custom-popup .leaflet-popup-tip {
                background-color: rgba(255, 255, 255, 0.95);
            }
        `;
        document.head.appendChild(style);
    }
}