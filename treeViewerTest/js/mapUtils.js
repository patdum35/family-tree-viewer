// import { geocodeLocation } from './geoLocalisation.js';
import { getGeocodeLocation } from './main.js';
import { fetchTileWithCache } from './mapTilesPreloader.js';
import { state, calcFontSize } from './main.js';
/**
 * Symboles pour chaque type de lieu
 */
export const locationSymbols = {
    'Naissance': '👶',
    'Mariage': '💍',
    'Décès': '✝️',
    'Résidence': '🏠',
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
            font-size: ${calcFontSize(28)}px;
            display: flex;
            justify-content: center;
            align-items: center;
            width: ${40*state.scaleChrome}px;
            height: ${40*state.scaleChrome}px;
            background-color: ${symbolInfo.bgColor};
            border: ${3*state.scaleChrome}px solid ${symbolInfo.color};
            border-radius: 50%;
            box-shadow: 0 ${3*state.scaleChrome}px ${6*state.scaleChrome}px rgba(0,0,0,0.3);
            text-shadow: 0 0 ${2*state.scaleChrome}px white;
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
        maxZoom: 9,                    // Zoom maximum
        useLocalTiles: true 
    };

    const mergedOptions = { ...defaultOptions, ...options };

    // Initialiser la carte
    const map = L.map(containerId, {
        attributionControl: mergedOptions.attribution,
        zoomControl: mergedOptions.zoomControl
    }).setView(mergedOptions.initialCenter, mergedOptions.initialZoom);

    // Ajouter la couche de tuiles
    // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //     attribution: mergedOptions.attribution ? '© OpenStreetMap contributors' : ''
    // }).addTo(map);


    if (mergedOptions.useLocalTiles) {
        createCachedTileLayer({
            attribution: mergedOptions.attribution ? '© OpenStreetMap contributors' : ''
        }).addTo(map);
    } else {
        // Conserver l'ancien comportement comme fallback
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: mergedOptions.attribution ? '© OpenStreetMap contributors' : ''
        }).addTo(map);
    }




    // Tableau pour stocker les marqueurs
    const markers = [];

    // Créer les marqueurs
    const markerPromises = locations.map(async location => {
        const geocodeLocation = await getGeocodeLocation();
        return geocodeLocation(location.place).then(coords => {
            if (coords) {
                const markerIcon = createEnhancedMarkerIcon(location.type);
                
                const marker = L.marker([coords.lat, coords.lon], { icon: markerIcon })
                    .addTo(map)
                    .bindPopup(`<div style="font-weight:bold;text-align:center;">${locationSymbols[location.type]} ${location.place}</div>`);
                
                markers.push(marker);

                // Afficher le label temporaire au-dessus du marqueur
                // Nettoyer et simplifier le nom du lieu
                let displayName = cleanLocationName(location.place);

                // Vérifier si ce lieu a déjà été affiché pour cette personne
                if (!window.displayedLocationNames) {
                    window.displayedLocationNames = new Set();
                }
                
                // Si le lieu n'a pas déjà été affiché, l'afficher maintenant
                if (!window.displayedLocationNames.has(displayName)) {
                    window.displayedLocationNames.add(displayName);
                    // showTemporaryLabel(marker, displayName, options.labelDuration || 1000);
                    showTemporaryLabel(marker, displayName, 5000);
                }


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
        attributionControl: false,
        useLocalTiles: true 
    };

    const mergedOptions = { ...defaultOptions, ...options };
    
    const container = document.getElementById(containerId);
    if (!container) return null;

    // Initialiser la carte
    const map = L.map(containerId, mergedOptions);

    // Ajouter la couche de tuiles
    // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);


    if (mergedOptions.useLocalTiles) {
        createCachedTileLayer({
            attribution: mergedOptions.attributionControl ? '© OpenStreetMap contributors' : ''
        }).addTo(map);
    } else {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: mergedOptions.attributionControl ? '© OpenStreetMap contributors' : ''
        }).addTo(map);
    }

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
        html: `<div style="font-size: ${calcFontSize(20)}px; display: flex; justify-content: center; align-items: center;">
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
    const geocodeLocation = await getGeocodeLocation();
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
 * Détermine si un marqueur est trop proche du bord supérieur de la carte
 * @param {L.Marker} marker - Le marqueur à vérifier
 * @param {number} threshold - Distance minimale (en pixels) du bord supérieur
 * @returns {boolean} - True si le marqueur est trop proche du bord supérieur
 */
function isMarkerNearTopEdge(marker, threshold = 50) {
    if (!marker || !marker._map) return false;
    
    // Obtenir la position du marqueur en pixels sur la carte
    const markerPoint = marker._map.latLngToContainerPoint(marker.getLatLng());
    
    // Vérifier si le marqueur est trop proche du bord supérieur
    return markerPoint.y < threshold;
}

/**
 * Crée un label temporaire au-dessus d'un marqueur
 * @param {L.Marker} marker - Le marqueur Leaflet
 * @param {string} text - Le texte à afficher
 * @param {number} duration - Durée d'affichage en millisecondes
 * @param {Object} options - Options supplémentaires
 */
export function showTemporaryLabel(marker, text, duration = 1000, options = {}) {
    if (!marker || !text) return;
    
    // Initialiser le compteur de labels pour ce marqueur
    if (!window.markerLabelCount) {
        window.markerLabelCount = new Map();
    }
    
    const markerKey = marker.getLatLng().toString();
    const labelIndex = window.markerLabelCount.get(markerKey) || 0;
    window.markerLabelCount.set(markerKey, labelIndex + 1);
    
    // Vérifier si le marqueur est proche du bord supérieur
    const nearTopEdge = isMarkerNearTopEdge(marker, 80);
    
    // Calculer les décalages en fonction du nombre de labels et de la position
    const offsetCalc = calculateLabelOffset(labelIndex, nearTopEdge);
    
    // Options par défaut
    const defaultOptions = {
        className: 'temporary-marker-label',
        offset: offsetCalc.offset,
        direction: nearTopEdge ? 'bottom' : 'top', // Changer la direction du tooltip
        permanent: true,
        interactive: false,
        opacity: 0.9
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Créer le label avec un fond semi-transparent
    const label = L.tooltip(mergedOptions)
        .setContent(`<div style="
            font-weight: bold; 
            text-align: center;
            font-size: ${calcFontSize(12)}px;
            background-color: rgba(255, 255, 255, 0.6) !important; 
            padding: ${3*state.scaleChrome}px ${6*state.scaleChrome}px;
            border-radius: ${4*state.scaleChrome}px;
            box-shadow: 0 ${1*state.scaleChrome}px ${3*state.scaleChrome}px rgba(0,0,0,0.2);
            border: ${1*state.scaleChrome}px solid rgba(200, 200, 200, 0.4);
            white-space: nowrap;
            color: rgba(0, 0, 0, 0.9);
            max-width: ${150*state.scaleChrome}px;
            overflow: hidden;
            text-overflow: ellipsis;
            z-index: ${1000 + labelIndex}; /* Plus haut index pour apparaître au-dessus */
        ">${text}</div>`)
        .setLatLng(offsetCalc.adjustedLatLng || marker.getLatLng());
    
    // Ajouter le label à la carte du marqueur
    label.addTo(marker._map);
    
    // Animation d'apparition
    const labelElement = label.getElement();
    if (labelElement) {
        labelElement.style.opacity = '0';
        labelElement.style.transform = `translate(${offsetCalc.initialTransform.x}px, ${offsetCalc.initialTransform.y}px)`;
        labelElement.style.transition = 'opacity 0.25s ease-out, transform 0.3s ease-out';
        
        // Forcer un reflow pour que la transition fonctionne
        setTimeout(() => {
            labelElement.style.opacity = '1';
            labelElement.style.transform = 'translate(0, 0)';
        }, 10 + labelIndex * 50); // Léger décalage entre les apparitions
    }
    
    // Supprimer le label après la durée spécifiée
    setTimeout(() => {
        if (labelElement) {
            // Animation de disparition
            labelElement.style.opacity = '0';
            labelElement.style.transform = `translate(${offsetCalc.exitTransform.x}px, ${offsetCalc.exitTransform.y}px)`;
            
            // Supprimer l'élément après l'animation
            setTimeout(() => {
                if (marker._map) {
                    marker._map.removeLayer(label);
                    
                    // Décrémenter le compteur de labels
                    const currentCount = window.markerLabelCount.get(markerKey) || 0;
                    if (currentCount > 0) {
                        window.markerLabelCount.set(markerKey, currentCount - 1);
                    }
                }
            }, 300); // Attendre que l'animation de disparition soit terminée
        } else {
            // Fallback si l'élément n'existe plus
            if (marker._map) {
                marker._map.removeLayer(label);
            }
        }
    }, duration + labelIndex * 150); // Décalage de la durée d'affichage
    
    // Retourner le label au cas où on voudrait le manipuler
    return label;
}

/**
 * Calcule la position optimale d'un label en fonction de son index
 * @param {number} index - Index du label (0, 1, 2, ...)
 * @returns {Object} - Configuration de position pour le label
 */


// Modifier la fonction calculateLabelOffset pour prendre en compte la proximité du bord
function calculateLabelOffset(index, nearTopEdge = false) {
    // Positions pour les marqueurs LOIN du bord supérieur (standard)
    const standardPositions = [
        { offset: [0, -25], initialTransform: {x: 0, y: 2}, exitTransform: {x: 0, y: -2} }, // Position 0: Dessus (plus proche)
        { offset: [30, -15], initialTransform: {x: 10, y: 2}, exitTransform: {x: 10, y: -2} }, // Position 1: Dessus droite
        { offset: [-30, -15], initialTransform: {x: -10, y: 2}, exitTransform: {x: -10, y: -2} }, // Position 2: Dessus gauche
        { offset: [40, 0], initialTransform: {x: 10, y: 0}, exitTransform: {x: 10, y: 0} }, // Position 3: Droite
        { offset: [-40, 0], initialTransform: {x: -10, y: 0}, exitTransform: {x: -10, y: 0} }, // Position 4: Gauche
        { offset: [30, 15], initialTransform: {x: 10, y: -2}, exitTransform: {x: 10, y: 2} }, // Position 5: Dessous droite
        { offset: [-30, 15], initialTransform: {x: -10, y: -2}, exitTransform: {x: -10, y: 2} }, // Position 6: Dessous gauche
        { offset: [0, 25], initialTransform: {x: 0, y: -2}, exitTransform: {x: 0, y: 2} } // Position 7: Dessous
    ];
    
    // Positions pour les marqueurs PROCHES du bord supérieur (inversées)
    const edgePositions = [
        { offset: [0, 25], initialTransform: {x: 0, y: -5}, exitTransform: {x: 0, y: 5} }, // Dessous (premier choix)
        { offset: [30, 15], initialTransform: {x: 10, y: -5}, exitTransform: {x: 10, y: 5} }, // Dessous droite
        { offset: [-30, 15], initialTransform: {x: -10, y: -5}, exitTransform: {x: -10, y: 5} }, // Dessous gauche
        { offset: [40, 0], initialTransform: {x: 10, y: 0}, exitTransform: {x: 10, y: 0} }, // Droite
        { offset: [-40, 0], initialTransform: {x: -10, y: 0}, exitTransform: {x: -10, y: 0} }, // Gauche
        { offset: [30, 30], initialTransform: {x: 10, y: -10}, exitTransform: {x: 10, y: 10} }, // Plus bas droite
        { offset: [-30, 30], initialTransform: {x: -10, y: -10}, exitTransform: {x: -10, y: 10} }, // Plus bas gauche
        { offset: [0, 45], initialTransform: {x: 0, y: -10}, exitTransform: {x: 0, y: 10} } // Encore plus bas
    ];
    
    // Choisir l'ensemble de positions approprié
    const positions = nearTopEdge ? edgePositions : standardPositions;
    
    // Utiliser l'index modulo le nombre de positions
    const positionIndex = index % positions.length;
    
    return positions[positionIndex];
}

/**
 * Met à jour les marqueurs d'une carte d'animation avec des labels temporaires
 * @param {L.Map} map - Carte à mettre à jour
 * @param {Array} locations - Lieux à afficher
 * @param {Object} options - Options supplémentaires
 * @returns {Promise<Array>} - Les marqueurs créés
 */
/**
 * Nettoie un nom de lieu pour l'affichage
 * @param {string} locationName - Nom de lieu brut
 * @returns {string} - Nom de lieu nettoyé
 */
export function cleanLocationName(locationName) {
    if (!locationName) return '';
    
    // 1. Supprimer tout ce qui est entre parenthèses (et les parenthèses)
    let cleanedName = locationName.replace(/\([^)]*\)/g, '').trim();
    
    // 2. Supprimer les chiffres isolés (avec un espace avant/après)
    cleanedName = cleanedName.replace(/\s\d+\s/g, ' ').trim();
    
    // 3. Supprimer les chiffres en début de chaîne
    cleanedName = cleanedName.replace(/^\d+\s/, '').trim();
    
    // 4. Supprimer les chiffres en fin de chaîne
    cleanedName = cleanedName.replace(/\s\d+$/, '').trim();
    

    // 5. Prendre seulement la première partie avant une virgule
    if (cleanedName.includes(',')) {
        cleanedName = cleanedName.split(',')[0].trim();
    }
    
    // 6. Limiter la longueur du texte affiché
    if (cleanedName.length > 20) {
        cleanedName = cleanedName.substring(0, 18) + '.';
    }
    
    // 7. Supprimer les espaces multiples
    cleanedName = cleanedName.replace(/\s+/g, ' ');

    
    return cleanedName;
}

export async function updateAnimationMapMarkersWithLabels(map, locations, options = {}) {
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
    const geocodeLocation = await getGeocodeLocation();
    const locationPromises = validLocations.map(location => 
        geocodeLocation(location.place)
            .then(coords => {
                if (coords && !isNaN(coords.lat) && !isNaN(coords.lon)) {
                    // Créer l'icône en fonction du type de marqueur requis
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
                    
                    // Afficher le label temporaire au-dessus du marqueur
                    // Nettoyer et simplifier le nom du lieu
                    let displayName = cleanLocationName(location.place);
                    
                    // Vérifier si ce lieu a déjà été affiché pour cette personne
                    if (!window.displayedLocationNames) {
                        window.displayedLocationNames = new Set();
                    }
                    
                    // Si le lieu n'a pas déjà été affiché, l'afficher maintenant
                    if (!window.displayedLocationNames.has(displayName)) {
                        window.displayedLocationNames.add(displayName);
                        showTemporaryLabel(marker, displayName, options.labelDuration || 1000);
                    }
                    
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

// Définition de createMediumMarkerIcon si elle n'existe pas encore
export function createMediumMarkerIcon(type) {
    const symbolInfo = {
        emoji: locationSymbols[type] || '📍',
        color: getColorForLocationType(type),
        bgColor: getBgColorForLocationType(type)
    };

    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="
            font-size: ${calcFontSize(22)}px;
            display: flex;
            justify-content: center;
            align-items: center;
            width: ${30*state.scaleChrome}px;
            height: ${30*state.scaleChrome}px;
            background-color: ${symbolInfo.bgColor};
            border: ${2*state.scaleChrome}px solid ${symbolInfo.color};
            border-radius: 50%;
            box-shadow: 0 ${2*state.scaleChrome}px ${4*state.scaleChrome}px rgba(0,0,0,0.2);
            text-shadow: 0 0 ${1*state.scaleChrome}px white;
        ">${symbolInfo.emoji}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });
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
    // console.log('- debug Existing title element:', existingTitle, title);

    if (existingTitle) existingTitle.remove();
    
    const titleElement = document.createElement('div');
    titleElement.className = 'individual-map-title';
    titleElement.style.position = 'absolute';
    titleElement.style.top = 10*state.scaleChrome+'px';
    titleElement.style.left = '50%';
    titleElement.style.transform = 'translateX(-50%)';
    titleElement.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    titleElement.style.padding = 10*state.scaleChrome+'px '+10*state.scaleChrome+'px';
    titleElement.style.borderRadius = 4*state.scaleChrome+'px';
    titleElement.style.zIndex = '9100';
    if (state.innerHeight < 500 || state.innerWidth < 800) {
        titleElement.style.fontSize = calcFontSize(12) +'px';
    } else {
        titleElement.style.fontSize = calcFontSize(14) +'px';  
    }
    titleElement.style.fontWeight = 'bold';
    titleElement.style.boxShadow = '0 '+1*state.scaleChrome+'px '+3*state.scaleChrome+'px rgba(0,0,0,0.3)';
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
    button.style.bottom = 10*state.scaleChrome+'px';
    button.style.right = 10*state.scaleChrome+'px';
    button.style.backgroundColor = '#4361ee';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = 4*state.scaleChrome+'px';
    button.style.padding = 5*state.scaleChrome+'px '+10*state.scaleChrome+'px';
    button.style.cursor = 'pointer';
    button.style.zIndex = '9100';
    button.style.fontSize = calcFontSize(14) +'px';
    button.style.boxShadow = '0 '+1*state.scaleChrome+'px '+ 3*state.scaleChrome+'px rgba(0,0,0,0.3)';
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
    loadingOverlay.innerHTML = `<div style="text-align: center;"><p>${message}</p><progress style="width: ${200*state.scaleChrome}px;"></progress></div>`;
    
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
                border-radius: ${8*state.scaleChrome}px;
                box-shadow: 0 ${3*state.scaleChrome}px ${14*state.scaleChrome}px rgba(0,0,0,0.4);
            }
            .custom-popup .leaflet-popup-content {
                margin: ${13*state.scaleChrome}px ${19*state.scaleChrome}px;
                font-size: ${calcFontSize(14)}px;
                line-height: 1.4;
            }
            .custom-popup .leaflet-popup-tip {
                background-color: rgba(255, 255, 255, 0.95);
            }
        `;
        document.head.appendChild(style);
    }
}




/**
 * Crée une couche de tuiles personnalisée qui utilise le cache local
 * @param {Object} options - Options pour la couche de tuiles
 * @returns {L.TileLayer} - Une couche de tuiles personnalisée
 */
export function createCachedTileLayer(options = {}) {
    const defaultOptions = {
        maxZoom: 19,
        minZoom: 1,
        attribution: '© OpenStreetMap contributors'
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Créer une couche de tuiles personnalisée qui utilise le cache
    const CustomTileLayer = L.TileLayer.extend({
        createTile: function(coords, done) {
            const tile = document.createElement('img');
            const isProduction = window.location.pathname.includes('/obfusc/');
            const MAPS_PATH = isProduction ? '../maps/' : 'maps/';
            // Essayer d'abord la tuile locale avec le cache
            const localUrl = `${MAPS_PATH}tile_${coords.z}_${coords.x}_${coords.y}.png`;
            
            // Utiliser fetchTileWithCache pour récupérer la tuile
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
    
    return new CustomTileLayer("", mergedOptions);
}