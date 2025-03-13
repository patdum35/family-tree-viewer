import { state, displayPersonDetails } from './main.js';
import { startAncestorAnimation } from './treeAnimation.js';
import { nameCloudState, extractSearchTextFromTitle, filterPeopleByText } from './nameCloud.js'
import { extractYear } from './nameCloudUtils.js';
import { removeAllStatsElements } from './nameCloudAverageAge.js';
import { createDataForHeatMap, refreshHeatmap } from './geoHeatMapDataProcessor.js';
import { createImprovedHeatmap } from './geoHeatMapUI.js';
import { geocodeLocation } from './geoLocalisation.js';


window.lastSelectedLocationId = null;
window.isIndividualMapMode = false;

export function showPersonsList(name, people, config) {
    
    const modal = document.createElement('div');
    modal.className = 'person-list-modal'; // Ajouter une classe pour faciliter la sélection ultérieure
    
    // Position et taille différentes si la heatmap est visible
    let heatmapWrapper = null;

    if (nameCloudState.isHeatmapVisible)  {
        heatmapWrapper = nameCloudState.heatmapWrapper
        adjustSplitScreenLayout(modal, heatmapWrapper);
    } else {
        // Configuration standard (sans heatmap visible)
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
    }
    
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '2000';

    const content = document.createElement('div');
    content.style.backgroundColor = 'white';
    content.style.padding = '20px';
    content.style.borderRadius = '10px';
    
    // Ajuster la taille du contenu si la heatmap est visible
    if (nameCloudState.isHeatmapVisible)  {
        content.style.width = '90%';
        content.style.maxWidth = '100%';
        content.style.height = '90%';
        content.style.maxHeight = '100%';
    } else {
        content.style.width = '80%';
        content.style.maxWidth = '800px';
        content.style.maxHeight = '80vh';
    }
    
    content.style.overflowY = 'auto';
    content.style.position = 'relative';

    // Titre
    const title = document.createElement('h2');
    title.textContent = config.type === 'prenoms' ? 
        `Personnes avec le prénom "${name}" (${people.length} personnes)` :
        config.type === 'noms' ?
            `Personnes avec le nom "${name}" (${people.length} personnes)` :
            config.type === 'professions' ? 
                `Personnes avec la profession "${name}" (${people.length} personnes)` :
                config.type === 'duree_vie' ? 
                    `Personnes ayant vécu ${name} ans (${people.length} personnes)` :
                    config.type === 'age_procreation' ?
                    `Personnes ayant eu un enfant à ${name} ans (${people.length} personnes)` : 
                        config.type === 'lieux' ?
                        `Personnes ayant un lien avec le lieu ${name}  (${people.length} personnes)`:
                        'Personnes';

    title.style.marginBottom = '10px';
    title.style.borderBottom = '1px solid #eee';
    title.style.paddingBottom = '5px';
    title.style.fontSize = nameCloudState.mobilePhone ? '12px' : '16px'; 

    // Bouton de fermeture
    const closeBtn = document.createElement('button');
    closeBtn.id = 'person-list-close-button';  // Ajout d'un ID unique
    closeBtn.innerHTML = '×';
    closeBtn.style.position = 'absolute';
    closeBtn.style.right = '10px';
    closeBtn.style.top = '10px';
    closeBtn.style.border = 'none';
    closeBtn.style.background = 'none';
    closeBtn.style.fontSize = '20px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = () => {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
            
            // Restaurer la taille originale de la heatmap si elle était visible
            if ((nameCloudState.isHeatmapVisible)  && heatmapWrapper) {
                try {
                    const originalStyle = JSON.parse(modal.dataset.originalHeatmapStyle || '{}');
                    if (originalStyle.top) heatmapWrapper.style.top = originalStyle.top;
                    if (originalStyle.left) heatmapWrapper.style.left = originalStyle.left;
                    if (originalStyle.width) heatmapWrapper.style.width = originalStyle.width;
                    if (originalStyle.height) heatmapWrapper.style.height = originalStyle.height;
                    
                    // Réinitialiser les variables de suivi
                    lastSelectedLocationId = null;
                    isIndividualMapMode = false;
                    
                    // Rafraîchir la carte avec les données initiales
                    if (heatmapWrapper.map) {
                        // Attendre un peu pour que les changements CSS prennent effet
                        setTimeout(() => {
                            if (typeof refreshHeatmap === 'function') {
                                refreshHeatmap();
                            } else if (heatmapWrapper.map) {
                                heatmapWrapper.map.invalidateSize();
                            }
                        }, 100);
                    }
                } catch (error) {
                    console.error('Erreur lors de la restauration du style de la heatmap:', error);
                    
                    // Restaurer aux valeurs par défaut en cas d'erreur
                    heatmapWrapper.style.top = '60px';
                    heatmapWrapper.style.left = '20px';
                    heatmapWrapper.style.width = 'calc(100% - 40px)';
                    heatmapWrapper.style.height = 'calc(100% - 100px)';
                    
                    setTimeout(() => {
                        if (heatmapWrapper.map) {
                            heatmapWrapper.map.invalidateSize();
                        }
                    }, 100);
                }
            }
        }
    };

    // Liste des personnes
    const list = document.createElement('div');
    list.style.display = 'grid';
    list.style.gap = '2px';  // Espacement réduit
    list.style.fontSize = '14px';  // Taille de police réduite

    // Trier les personnes par date
    const peopleWithDates = people.map(person => {
        let date = '';
        let sortDate = 0;
        let symbolType = ''; // Pour stocker le type de symbole
        const individual = state.gedcomData.individuals[person.id];

        if (individual) {
            if (individual.birthDate) {
                symbolType = 'birth';
                date = `<span class="date-symbol" style="font-size: 1.5em; vertical-align: middle;">👶</span> ${individual.birthDate}`; //🚼
                sortDate = extractYear(individual.birthDate) || 0;
            } else if (individual.deathDate) {
                symbolType = 'death';
                date = `<span class="date-symbol" style="font-size: 1.6em; vertical-align: middle;">✝️</span> ${individual.deathDate}`; //'✝'; ////☦🏴⚰️
                sortDate = extractYear(individual.deathDate) || 0;
            } else if (individual.spouseFamilies && individual.spouseFamilies.length > 0) {
                for (const famId of individual.spouseFamilies) {
                    const family = state.gedcomData.families[famId];
                    if (family && family.marriageDate) {
                        symbolType = 'marriage';
                        date = `<span class="date-symbol" style="font-size: 1.6em; vertical-align: middle;">💍</span> ${family.marriageDate}`; //🔗💞⚭
                        sortDate = extractYear(family.marriageDate) || 0;
                        break;
                    }
                }
            }
            
            // Ajouter les informations de lieu
            individual.hasLocations = !!(
                individual.birthPlace || 
                individual.deathPlace || 
                individual.residPlace1 || 
                individual.residPlace2 || 
                individual.residPlace3 ||
                (individual.spouseFamilies && individual.spouseFamilies.some(famId => {
                    const family = state.gedcomData.families[famId];
                    return family && family.marriagePlace;
                }))
            );
        }

        return {
            name: person.name,
            id: person.id,
            date: date,
            symbolType: symbolType,
            sortDate: sortDate,
            hasLocations: individual ? individual.hasLocations : false
        };
    }).sort((a, b) => b.sortDate - a.sortDate);


    /**
     * Crée une carte individuelle avec les lieux d'une personne
     * @param {string} personId - ID de la personne
     * @returns {Promise<void>}
     */
    async function createIndividualLocationMap(personId) {
        // console.log("Début createIndividualLocationMap pour personId:", personId);
        
        // Vérifier que le wrapper de la heatmap existe
        const heatmapWrapper = document.getElementById('namecloud-heatmap-wrapper');
        if (!heatmapWrapper) {
            console.error("Wrapper de heatmap non trouvé");
            return;
        }
        
        // Vérifier que la carte existe dans le wrapper
        if (!heatmapWrapper.map) {
            console.error("Carte Leaflet non trouvée dans le wrapper");
            return;
        }
        
        // Récupérer les informations de la personne
        const person = state.gedcomData.individuals[personId];
        if (!person) {
            console.error("Personne non trouvée avec l'ID:", personId);
            return;
        }
        
        console.log("Personne trouvée:", person.name);
        
        // Symboles pour chaque type de lieu
        const locationSymbols = {
            'Naissance': '👶', 
            'Mariage': '💍',
            'Décès': '✝️',
            'Résidence1': '🏠',
            'Résidence2': '🏠',
            'Résidence3': '🏠'
        };
        
        // Collecter les lieux
        const locations = [
            { type: 'Naissance', place: person.birthPlace },
            { type: 'Décès', place: person.deathPlace },
            { type: 'Résidence1', place: person.residPlace1 },
            { type: 'Résidence2', place: person.residPlace2 },
            { type: 'Résidence3', place: person.residPlace3 }
        ];
        
        // Rechercher les lieux de mariage
        if (person.spouseFamilies && person.spouseFamilies.length > 0) {
            person.spouseFamilies.forEach((famId, index) => {
                const family = state.gedcomData.families[famId];
                if (family && family.marriagePlace) {
                    locations.push({ 
                        type: 'Mariage', 
                        place: family.marriagePlace 
                    });
                }
            });
        }
        
        // Filtrer les lieux non vides
        const validLocations = locations.filter(loc => loc.place && loc.place.trim() !== '');
        console.log("Lieux valides trouvés:", validLocations.length);
        
        if (validLocations.length === 0) {
            console.log('Aucun lieu trouvé pour cette personne');
            alert('Aucun lieu trouvé pour cette personne');
            return;
        }
        
        // Afficher un indicateur de chargement
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
        loadingOverlay.innerHTML = `<div style="text-align: center;"><p>Chargement des lieux...</p><progress style="width: 200px;"></progress></div>`;
        
        // Ajouter l'overlay de chargement à la heatmap
        const existingOverlay = document.getElementById('map-loading-overlay');
        if (existingOverlay) existingOverlay.remove();
        heatmapWrapper.appendChild(loadingOverlay);
        
        try {
            // Récupérer la carte
            const map = heatmapWrapper.map;
            // console.log("Carte récupérée:", map);
            
            // Nettoyer toutes les couches existantes sauf la couche de tuiles
            map.eachLayer(layer => {
                if (layer instanceof L.TileLayer) {
                    console.log("Couche de tuiles préservée");
                } else {
                    console.log("Suppression d'une couche:", layer);
                    map.removeLayer(layer);
                }
            });
            
            // Tableau pour stocker les marqueurs
            const markers = [];
            
            // Géocoder et placer les marqueurs
            for (const location of validLocations) {
                try {
                    console.log("Géocodage de:", location.place);
                    const coords = await geocodeLocation(location.place);
                    
                    if (coords && !isNaN(coords.lat) && !isNaN(coords.lon)) {
                        console.log("Coordonnées trouvées:", coords);
                        
                        // Créer l'icône pour le marqueur avec un style amélioré
                        const markerIcon = L.divIcon({
                            className: 'custom-marker',
                            html: `<div style="
                                font-size: 28px;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                width: 40px;
                                height: 40px;
                                background-color: white;
                                border: 2px solid #3388ff;
                                border-radius: 50%;
                                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                                text-shadow: 0 0 3px white;
                            ">${locationSymbols[location.type]}</div>`,
                            iconSize: [40, 40],
                            iconAnchor: [20, 20],
                            popupAnchor: [0, -20]
                        });
                        
                        // Créer et ajouter le marqueur
                        const marker = L.marker([coords.lat, coords.lon], { icon: markerIcon })
                            .addTo(map)
                            .bindPopup(`<strong>${location.type}:</strong> ${location.place}`);
                        
                        markers.push(marker);
                        // console.log("Marqueur ajouté pour:", location.place);
                    } else {
                        console.warn("Coordonnées invalides pour:", location.place);
                    }
                } catch (error) {
                    console.error(`Erreur lors du géocodage de ${location.place}:`, error);
                }
            }
            
            // Vérifier si des marqueurs ont été ajoutés
            if (markers.length === 0) {
                console.warn("Aucun marqueur n'a pu être ajouté à la carte");
                alert("Aucun lieu n'a pu être localisé sur la carte");
                loadingOverlay.remove();
                return;
            }
            
            // Ajuster la vue de la carte pour inclure tous les marqueurs
            // console.log("Ajustement de la vue de la carte pour inclure tous les marqueurs");
            

            
            /**
             * Applique une transition fluide entre deux vues de carte
             * À intégrer dans la fonction createIndividualLocationMap
             */


            // Créer les limites à partir des marqueurs
            const bounds = L.latLngBounds(markers.map(m => m.getLatLng()));

            // Vérifier si les limites sont valides
            if (bounds.isValid()) {
                // Calculer le centre des limites
                const center = bounds.getCenter();
                
                // Calculer le niveau de zoom pour afficher toutes les limites
                const zoomLevel = map.getBoundsZoom(bounds, false, [50, 50]);
                
                // Limiter le niveau de zoom au maximum spécifié
                const limitedZoom = Math.min(zoomLevel, 9); // 7 ≈ 200km de rayon, 9 = 50km
                
                // console.log(`Niveau de zoom calculé: ${zoomLevel}, limité à: ${limitedZoom}`);
                
                // Appliquer le zoom limité avec une transition fluide
                // Utiliser une durée plus longue (1.5 secondes) pour une animation plus visible
                map.flyTo(center, limitedZoom, {
                    animate: true,
                    duration: 1.5, // Durée en secondes
                    easeLinearity: 0.25, // Rend l'animation plus douce
                });
                
                // Ajouter un petit délai avant d'ajouter les popups pour éviter les problèmes pendant l'animation
                setTimeout(() => {
                    // Si nous voulons montrer une popup automatiquement pour le premier marqueur
                    if (markers.length > 0) {
                        // Optionnel: ouvrir automatiquement la popup du premier marqueur 
                        // markers[0].openPopup();
                    }
                }, 1600); // Juste après la fin de l'animation
            } else {
                console.warn("Limites invalides pour l'ajustement de la vue");
                
                // Fallback: centrer sur le premier marqueur avec un zoom fixe
                if (markers.length > 0) {
                    map.flyTo(markers[0].getLatLng(), 7, {
                        animate: true,
                        duration: 1.5,
                        easeLinearity: 0.25
                    });
                }
            }

            // Améliorer aussi les popups pour plus de lisibilité
            markers.forEach(marker => {
                // Personnaliser le style de la popup
                const popup = marker.getPopup();
                if (popup) {
                    popup.options.className = 'custom-popup';
                    
                    // Ajouter un style personnalisé pour les popups
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
            });


            // Ajouter un titre à la carte
            const mapTitle = document.createElement('div');
            mapTitle.className = 'individual-map-title';
            mapTitle.style.position = 'absolute';
            mapTitle.style.top = '10px';
            mapTitle.style.left = '50%';
            mapTitle.style.transform = 'translateX(-50%)';
            mapTitle.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            mapTitle.style.padding = '5px 10px';
            mapTitle.style.borderRadius = '4px';
            mapTitle.style.zIndex = '9100';
            mapTitle.style.fontSize = '14px';
            mapTitle.style.fontWeight = 'bold';
            mapTitle.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)';
            mapTitle.textContent = `Lieux de ${person.name.replace(/\//g, '')}`;
            
            // Supprimer l'ancien titre s'il existe
            const existingTitle = heatmapWrapper.querySelector('.individual-map-title');
            if (existingTitle) existingTitle.remove();
            
            heatmapWrapper.appendChild(mapTitle);
            
            // Ajouter un bouton pour revenir à la heatmap originale
            const resetButton = document.createElement('button');
            resetButton.className = 'reset-heatmap-button';
            resetButton.style.position = 'absolute';
            resetButton.style.bottom = '10px';
            resetButton.style.right = '10px';
            resetButton.style.backgroundColor = '#4361ee';
            resetButton.style.color = 'white';
            resetButton.style.border = 'none';
            resetButton.style.borderRadius = '4px';
            resetButton.style.padding = '5px 10px';
            resetButton.style.cursor = 'pointer';
            resetButton.style.zIndex = '9100';
            resetButton.style.fontSize = '14px';
            resetButton.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)';
            resetButton.textContent = 'Voir tous les lieux';
            
            // Supprimer l'ancien bouton s'il existe
            const existingButton = heatmapWrapper.querySelector('.reset-heatmap-button');
            if (existingButton) existingButton.remove();
            
            resetButton.addEventListener('click', () => {
                // Rétablir la heatmap originale
                if (typeof refreshHeatmap === 'function') {
                    refreshHeatmap();
                    
                    // Réinitialiser les variables de suivi
                    window.lastSelectedLocationId = null;
                    window.isIndividualMapMode = false;
                    
                    // Mettre à jour l'apparence des icônes de localisation
                    document.querySelectorAll('.location-icon').forEach(icon => {
                        icon.style.color = '';
                        icon.style.backgroundColor = '';
                    });
                }
                
                // Supprimer le titre et le bouton de reset
                mapTitle.remove();
                resetButton.remove();
            });
            
            heatmapWrapper.appendChild(resetButton);
            
            // console.log("Carte individuelle créée avec succès");
            
        } catch (error) {
            console.error('Erreur lors de la création de la carte individuelle:', error);
            alert('Erreur lors de la création de la carte: ' + error.message);
        } finally {
            // Supprimer l'overlay de chargement
            loadingOverlay.remove();
        }
    }


    peopleWithDates.forEach((person, index) => {
        const personDiv = document.createElement('div');
        personDiv.style.padding = '3px 5px';
        personDiv.style.backgroundColor = index % 2 === 0 ? '#f9f9f9' : 'white';
        personDiv.style.display = 'flex';
        personDiv.style.justifyContent = 'space-between';
        personDiv.style.alignItems = 'center';
        personDiv.style.lineHeight = '1.2';
        personDiv.style.cursor = 'pointer';

        // Partie gauche pour le nom et l'icône de localisation
        const leftPart = document.createElement('div');
        leftPart.style.display = 'flex';
        leftPart.style.alignItems = 'center';
        leftPart.style.gap = '5px';
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = person.name;
        if (nameCloudState.mobilePhone) {
            nameSpan.style.fontSize = '12px';
        }
        
        // Ajouter l'icône de localisation si la personne a des lieux
        // if (person.hasLocations && isHeatmapVisible) {
        if (person.hasLocations) {
            const locationIcon = document.createElement('span');
            locationIcon.className = 'location-icon';
            locationIcon.innerHTML = '🌍';
            locationIcon.style.fontSize = nameCloudState.mobilePhone ? '14px' : '16px';
            locationIcon.style.cursor = 'pointer';
            locationIcon.style.marginLeft = '5px';
            locationIcon.style.opacity = '0.7';
            locationIcon.style.borderRadius = '50%';
            locationIcon.style.padding = '2px';
            locationIcon.style.transition = 'all 0.2s ease';
            locationIcon.title = 'Afficher les lieux de cette personne sur la carte';
            
            // Si cette personne est déjà sélectionnée, mettre en évidence l'icône
            if (lastSelectedLocationId === person.id && isIndividualMapMode) {
                locationIcon.style.color = '#ffffff';
                locationIcon.style.backgroundColor = '#4361ee';
                locationIcon.style.opacity = '1';
            }
            
            // Effet de survol
            locationIcon.addEventListener('mouseover', () => {
                locationIcon.style.opacity = '1';
            });
            
            locationIcon.addEventListener('mouseout', () => {
                if (lastSelectedLocationId !== person.id || !isIndividualMapMode) {
                    locationIcon.style.opacity = '0.7';
                }
            });
            


            // Gestionnaire de clic pour l'icône de localisation
            locationIcon.addEventListener('click', async (e) => {
                e.stopPropagation(); // Empêcher la propagation au div parent
                
                // console.log("Clic sur l'icône de localisation pour la personne:", person.id);
                
                // Vérifier si une heatmap est déjà visible
                let heatmapWrapper = document.getElementById('namecloud-heatmap-wrapper');
                const currentlyHeatmapVisible = heatmapWrapper !== null;
                
                // Si la heatmap n'est pas visible, il faut la créer et ajuster le layout
                if (!currentlyHeatmapVisible) {
                    // Utiliser notre fonction qui réutilise le code existant
                    heatmapWrapper = await showHeatmapAndAdjustLayout(modal, nameCloudState.currentConfig);
                    
                    if (heatmapWrapper && heatmapWrapper.map) {
                        // Attendre un peu que la carte soit complètement initialisée
                        setTimeout(() => {
                            // Créer une carte avec les lieux de cette personne
                            createIndividualLocationMap(person.id);
                            
                            // Mettre à jour les variables de suivi
                            window.lastSelectedLocationId = person.id;
                            window.isIndividualMapMode = true;
                            
                            // Mettre en évidence cette icône
                            locationIcon.style.color = '#ffffff';
                            locationIcon.style.backgroundColor = '#4361ee';
                            locationIcon.style.opacity = '1';
                        }, 300);
                    }
                } else {
                    // La heatmap est déjà visible, comportement habituel
                    if (window.lastSelectedLocationId === person.id && window.isIndividualMapMode) {
                        // Si on clique sur la personne déjà sélectionnée, revenir à la heatmap originale
                        if (typeof refreshHeatmap === 'function') {
                            refreshHeatmap();
                            
                            // Réinitialiser les variables de suivi
                            window.lastSelectedLocationId = null;
                            window.isIndividualMapMode = false;
                            
                            // Réinitialiser le style de l'icône
                            locationIcon.style.color = '';
                            locationIcon.style.backgroundColor = '';
                            locationIcon.style.opacity = '0.7';
                            
                            // Supprimer le titre et le bouton de reset
                            const mapTitle = heatmapWrapper.querySelector('.individual-map-title');
                            if (mapTitle) mapTitle.remove();
                            
                            const resetButton = heatmapWrapper.querySelector('.reset-heatmap-button');
                            if (resetButton) resetButton.remove();
                        }
                    } else {
                        // Afficher les lieux de cette personne
                        createIndividualLocationMap(person.id);
                        
                        // Mettre à jour les variables de suivi
                        window.lastSelectedLocationId = person.id;
                        window.isIndividualMapMode = true;
                        
                        // Mettre à jour l'apparence des icônes
                        document.querySelectorAll('.location-icon').forEach(icon => {
                            icon.style.color = '';
                            icon.style.backgroundColor = '';
                            icon.style.opacity = '0.7';
                        });
                        
                        // Mettre en évidence cette icône
                        locationIcon.style.color = '#ffffff';
                        locationIcon.style.backgroundColor = '#4361ee';
                        locationIcon.style.opacity = '1';
                    }
                }
            });


            leftPart.appendChild(nameSpan);
            leftPart.appendChild(locationIcon);
        } else {
            leftPart.appendChild(nameSpan);
        }

        const dateSpan = document.createElement('span');
        dateSpan.innerHTML = person.date; // Utiliser innerHTML pour interpréter les balises span
        dateSpan.style.color = 'darkblue';
        dateSpan.style.whiteSpace = 'nowrap';
        if (nameCloudState.mobilePhone) {
            dateSpan.style.fontSize = '10px';
        }

        personDiv.appendChild(leftPart);
        personDiv.appendChild(dateSpan);

        personDiv.addEventListener('click', (event) => {
            console.log('Clicked on person:', person.name, person.id);
            event.stopPropagation();
            showPersonActions(person, event);
        });

        list.appendChild(personDiv);
    });

    content.appendChild(closeBtn);
    content.appendChild(title);
    content.appendChild(list);
    modal.appendChild(content);
    document.body.appendChild(modal);


    // Gestion de la touche Échap
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
                
                // Restaurer la taille originale de la heatmap si elle était visible
                if ((nameCloudState.isHeatmapVisible)  && heatmapWrapper) {
                    try {
                        const originalStyle = JSON.parse(modal.dataset.originalHeatmapStyle || '{}');
                        if (originalStyle.top) heatmapWrapper.style.top = originalStyle.top;
                        if (originalStyle.left) heatmapWrapper.style.left = originalStyle.left;
                        if (originalStyle.width) heatmapWrapper.style.width = originalStyle.width;
                        if (originalStyle.height) heatmapWrapper.style.height = originalStyle.height;
                        
                        setTimeout(() => {
                            if (heatmapWrapper.map) {
                                heatmapWrapper.map.invalidateSize();
                            }
                        }, 100);
                    } catch (error) {
                        console.error('Erreur lors de la restauration du style de la heatmap:', error);
                    }
                    
                    // Réinitialiser les variables de suivi
                    lastSelectedLocationId = null;
                    isIndividualMapMode = false;
                }
            }
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
    
    // Gérer la redimension de fenêtre si la heatmap est visible
    if ((nameCloudState.isHeatmapVisible) ) {
        const resizeHandler = () => {
            if (!document.body.contains(modal)) {
                window.removeEventListener('resize', resizeHandler);
                return;
            }
            
            const isLandscapeNow = window.innerWidth > window.innerHeight;
            
            if (isLandscapeNow) {
                // Mode paysage
                modal.style.top = '0';
                modal.style.left = '50%';
                modal.style.width = '50%';
                modal.style.height = '100%';
                
                heatmapWrapper.style.width = '50%';
                heatmapWrapper.style.height = 'calc(100% - 60px)';
                heatmapWrapper.style.left = '0';
                heatmapWrapper.style.top = '60px';
            } else {
                // Mode portrait
                modal.style.top = '50%';
                modal.style.left = '0';
                modal.style.width = '100%';
                modal.style.height = '50%';
                
                heatmapWrapper.style.width = '100%';
                heatmapWrapper.style.height = '50%';
                heatmapWrapper.style.top = '60px';
                heatmapWrapper.style.left = '0';
            }
            
            // Invalider la taille de la carte
            if (heatmapWrapper.map) {
                heatmapWrapper.map.invalidateSize();
            }
        };
        
        window.addEventListener('resize', resizeHandler);
        
        // Assurons-nous que l'écouteur est supprimé si la modale est fermée
        const originalCloseHandler = closeBtn.onclick;
        closeBtn.onclick = (e) => {
            window.removeEventListener('resize', resizeHandler);
            if (originalCloseHandler) originalCloseHandler.call(closeBtn, e);
        };
    }
}

/**
 * Ajuste la disposition en mode écran partagé pour la modale et la heatmap
 * @param {HTMLElement} modal - La modale de liste de personnes
 * @param {HTMLElement} heatmapWrapper - Le wrapper de la heatmap
 */
function adjustSplitScreenLayout(modal, heatmapWrapper) {
    const isLandscape = window.innerWidth > window.innerHeight;
    
    // Sauvegarder le style original pour restauration ultérieure
    const originalHeatmapStyle = {
        top: heatmapWrapper.style.top || '60px',
        left: heatmapWrapper.style.left || '20px',
        width: heatmapWrapper.style.width || 'calc(100% - 40px)',
        height: heatmapWrapper.style.height || 'calc(100% - 100px)'
    };
    
    modal.dataset.originalHeatmapStyle = JSON.stringify(originalHeatmapStyle);
    
    if (isLandscape) {
        // Mode paysage : heatmap à gauche, liste à droite
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '50%';
        modal.style.width = '50%';
        modal.style.height = '100%';
        
        heatmapWrapper.style.width = '50%';
        heatmapWrapper.style.height = 'calc(100% - 60px)';
        heatmapWrapper.style.left = '0';
        heatmapWrapper.style.top = '60px';
    } else {
        // Mode portrait : heatmap en haut, liste en bas
        // CORRECTION: Ajuster la position de la modale pour qu'elle commence exactement
        // là où se termine la heatmap, en évitant tout chevauchement
        
        const mapHeight = 'calc(50% - 30px)'; // Réduire légèrement la hauteur de la carte
        const modalTop = 'calc(50% - 30px)'; // Début de la modale après la carte
        


        // Ajuster la heatmap
        heatmapWrapper.style.width = '100%';
        heatmapWrapper.style.height = mapHeight;
        heatmapWrapper.style.left = '0';
        heatmapWrapper.style.top = '60px'; // Laisser de l'espace en haut pour les contrôles
        
        // Ajuster la modale
        modal.style.position = 'fixed';
        modal.style.top = modalTop; // Commencer exactement où se termine la carte
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = 'calc(50% + 30px)'; // Augmenter légèrement la hauteur
        modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
        
        // S'assurer que le contenu de la modale est correctement positionné
        const content = modal.querySelector('div'); // Le premier div dans la modale est généralement le contenu
        if (content) {
            content.style.maxHeight = 'calc(100% - 20px)'; // Légèrement moins que la hauteur de la modale
        }
    }
    
    // Invalider la taille de la carte après un délai pour s'assurer que 
    // les modifications de style sont appliquées
    setTimeout(() => {
        if (heatmapWrapper.map) {
            heatmapWrapper.map.invalidateSize();
        }
    }, 100);
}

/**
 * Affiche la heatmap et ajuste le layout pour l'écran partagé
 * @param {HTMLElement} modal - La modale de liste de personnes
 * @param {Object} config - La configuration actuelle
 * @returns {Promise<HTMLElement|null>} - Le wrapper de heatmap ou null en cas d'erreur
 */
// async function showHeatmapAndAdjustLayout(modal, config) {
//     // Afficher un indicateur de chargement
//     const loadingIndicator = document.createElement('div');
//     loadingIndicator.style.position = 'fixed';
//     loadingIndicator.style.top = '50%';
//     loadingIndicator.style.left = '50%';
//     loadingIndicator.style.transform = 'translate(-50%, -50%)';
//     loadingIndicator.style.backgroundColor = 'white';
//     loadingIndicator.style.padding = '20px';
//     loadingIndicator.style.borderRadius = '8px';
//     loadingIndicator.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
//     loadingIndicator.style.zIndex = '9999';
//     loadingIndicator.innerHTML = '<p>Génération de la heatmap...</p><progress style="width: 100%;"></progress>';
//     document.body.appendChild(loadingIndicator);
    
//     try {
//         // Utiliser la fonction existante pour obtenir les données
//         const heatmapData = await createDataForHeatMap(config);
        
//         // Supprimer l'indicateur de chargement
//         document.body.removeChild(loadingIndicator);
        
//         if (!heatmapData || heatmapData.length === 0) {
//             console.error("Aucune donnée géographique disponible");
//             alert("Aucune donnée géographique disponible.");
//             return null;
//         }
        
//         // Créer un titre pour la heatmap
//         let heatmapTitle = "Heatmap";
//         if (config) {
//             const configType = config.type;
//             heatmapTitle = `Heatmap - ${configType === 'prenoms' ? 'Prénoms' : 
//                 configType === 'noms' ? 'Noms' : 
//                 configType === 'professions' ? 'Métiers' : 
//                 configType === 'duree_vie' ? 'Durées de vie' : 
//                 configType === 'age_procreation' ? 'Âges de procréation' : 
//                 configType === 'lieux' ? 'Lieux' : 'Général'}`;
//         }
        
//         // Utiliser la fonction existante pour créer la heatmap
//         createImprovedHeatmap(heatmapData, heatmapTitle);
        
//         // Récupérer la référence à la heatmap nouvellement créée
//         const heatmapWrapper = document.getElementById('namecloud-heatmap-wrapper');
//         if (!heatmapWrapper) {
//             console.error("La heatmap n'a pas été créée correctement");
//             return null;
//         }
        
//         // Ajuster la disposition pour le mode écran partagé
//         adjustSplitScreenLayout(modal, heatmapWrapper);
        
//         return heatmapWrapper;
//     } catch (error) {
//         console.error("Erreur lors de la création de la heatmap:", error);
//         if (document.body.contains(loadingIndicator)) {
//             document.body.removeChild(loadingIndicator);
//         }
//         alert("Erreur lors de la création de la carte: " + error.message);
//         return null;
//     }
// }













// Dans nameCloudInteractions.js, modifiez la fonction showHeatmapAndAdjustLayout

/**
 * Affiche la heatmap et ajuste le layout pour l'écran partagé
 * @param {HTMLElement} modal - La modale de liste de personnes
 * @param {Object} config - La configuration actuelle
 * @returns {Promise<HTMLElement|null>} - Le wrapper de heatmap ou null en cas d'erreur
 */
async function showHeatmapAndAdjustLayout(modal, config) {
    // Afficher un indicateur de chargement
    const loadingIndicator = document.createElement('div');
    loadingIndicator.style.position = 'fixed';
    loadingIndicator.style.top = '50%';
    loadingIndicator.style.left = '50%';
    loadingIndicator.style.transform = 'translate(-50%, -50%)';
    loadingIndicator.style.backgroundColor = 'white';
    loadingIndicator.style.padding = '20px';
    loadingIndicator.style.borderRadius = '8px';
    loadingIndicator.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    loadingIndicator.style.zIndex = '9999';
    loadingIndicator.innerHTML = '<p>Génération de la heatmap...</p><progress style="width: 100%;"></progress>';
    document.body.appendChild(loadingIndicator);
    
    try {
        // Extraire le titre pour obtenir le texte de recherche
        const titleElement = modal.querySelector('h2');
        const searchText = extractSearchTextFromTitle(titleElement);
        
        let heatmapData;
        
        if (searchText) {
            // Utiliser les personnes déjà filtrées que nous avons dans la liste
            const filteredPeople = filterPeopleByText(searchText, config);
            
            if (filteredPeople && filteredPeople.length > 0) {
                console.log(`Création de la heatmap pour ${filteredPeople.length} personnes filtrées avec "${searchText}"`);
                
                // Utiliser la fonction qui crée des données de heatmap à partir de personnes spécifiques
                // Cette fonction existe déjà dans geoHeatMapDataProcessor.js sous le nom de updateHeatmapIfVisible
                heatmapData = await createHeatmapDataForPeople(filteredPeople);
            } else {
                console.warn("Aucune personne filtrée trouvée pour", searchText);
                heatmapData = await createDataForHeatMap(config);
            }
        } else {
            // Fallback vers la méthode standard
            heatmapData = await createDataForHeatMap(config);
        }
        
        // Supprimer l'indicateur de chargement
        document.body.removeChild(loadingIndicator);
        
        if (!heatmapData || heatmapData.length === 0) {
            console.error("Aucune donnée géographique disponible");
            alert("Aucune donnée géographique disponible.");
            return null;
        }
        
        // Créer un titre pour la heatmap
        let heatmapTitle = "Heatmap";
        if (titleElement) {
            // Extraire un titre plus propre de l'élément de titre
            const titleText = titleElement.textContent;
            const match = titleText.match(/^(Personnes.+?)\s*\(\d+\s*personnes\)$/);
            if (match && match[1]) {
                heatmapTitle = `Heatmap - ${match[1]}`;
            } else {
                heatmapTitle = `Heatmap - ${titleText}`;
            }
        }
        
        // Utiliser la fonction existante pour créer la heatmap
        createImprovedHeatmap(heatmapData, heatmapTitle);
        
        // Récupérer la référence à la heatmap nouvellement créée
        const heatmapWrapper = document.getElementById('namecloud-heatmap-wrapper');
        if (!heatmapWrapper) {
            console.error("La heatmap n'a pas été créée correctement");
            return null;
        }
        
        // Ajuster la disposition pour le mode écran partagé
        adjustSplitScreenLayout(modal, heatmapWrapper);
        
        return heatmapWrapper;
    } catch (error) {
        console.error("Erreur lors de la création de la heatmap:", error);
        if (document.body.contains(loadingIndicator)) {
            document.body.removeChild(loadingIndicator);
        }
        alert("Erreur lors de la création de la carte: " + error.message);
        return null;
    }
}

/**
 * Créer les données de heatmap pour un ensemble spécifique de personnes
 * @param {Array} people - Liste des personnes avec leurs IDs
 * @returns {Promise<Array>} - Données formatées pour la heatmap
 */
async function createHeatmapDataForPeople(people) {
    try {
        // Récupérer les personnes complètes à partir de leurs IDs
        const selectedPersons = people.map(p => state.gedcomData.individuals[p.id])
            .filter(p => p !== undefined);
        
        // Collecter tous les lieux non nettoyés
        const locationData = {};
        const locationDetails = {};
        
        // Traiter chaque personne pour extraire ses lieux
        for (const person of selectedPersons) {
            // Fonction pour ajouter les détails d'un lieu
            const addLocationDetail = (place, type, date) => {
                if (!place || place.trim() === '') return;
                
                if (!locationDetails[place]) {
                    locationDetails[place] = {
                        events: [],
                        families: {}
                    };
                }
                
                // Extraire l'année si disponible
                let year = null;
                if (date) {
                    const match = date.match(/\d{4}/);
                    if (match) {
                        year = match[0];
                    }
                }
                
                // Ajouter l'événement
                locationDetails[place].events.push({
                    type: type,
                    name: person.name.replace(/\//g, '').trim(),
                    year: year
                });
                
                // Ajouter le nom de famille
                const familyName = person.name.split('/')[1]?.trim().toUpperCase();
                if (familyName) {
                    locationDetails[place].families[familyName] = 
                        (locationDetails[place].families[familyName] || 0) + 1;
                }
            };
            
            // Ajouter les détails pour chaque type de lieu
            if (person.birthPlace) addLocationDetail(person.birthPlace, 'Naissance', person.birthDate);
            if (person.deathPlace) addLocationDetail(person.deathPlace, 'Décès', person.deathDate);
            if (person.residPlace1) addLocationDetail(person.residPlace1, 'Résidence', null);
            if (person.residPlace2) addLocationDetail(person.residPlace2, 'Résidence', null);
            if (person.residPlace3) addLocationDetail(person.residPlace3, 'Résidence', null);
            
            // Ajouter les mariages
            if (person.spouseFamilies) {
                for (const famId of person.spouseFamilies) {
                    const family = state.gedcomData.families[famId];
                    if (family && family.marriagePlace) {
                        addLocationDetail(family.marriagePlace, 'Mariage', family.marriageDate);
                    }
                }
            }
            
            // Collecter les lieux pour la densité de la heatmap
            const addLocationCount = (place) => {
                if (place && place.trim() !== '') {
                    locationData[place] = (locationData[place] || 0) + 1;
                }
            };
            
            addLocationCount(person.birthPlace);
            addLocationCount(person.deathPlace);
            addLocationCount(person.residPlace1);
            addLocationCount(person.residPlace2);
            addLocationCount(person.residPlace3);
            
            if (person.spouseFamilies) {
                for (const famId of person.spouseFamilies) {
                    const family = state.gedcomData.families[famId];
                    if (family && family.marriagePlace) {
                        addLocationCount(family.marriagePlace);
                    }
                }
            }
        }

        // Convertir les données de lieu en format pour la heatmap
        const heatmapData = {};
        
        // Géocoder chaque lieu et ajouter les détails
        for (const [place, count] of Object.entries(locationData)) {
            if (!place || place.trim() === '') continue;
            
            try {
                const coords = await geocodeLocation(place);
                
                if (coords) {
                    const key = `${coords.lat.toFixed(2)},${coords.lon.toFixed(2)}`;
                    
                    if (!heatmapData[key]) {
                        heatmapData[key] = {
                            coords: coords,
                            count: 0,
                            families: {},
                            locations: [],
                            placeName: place
                        };
                    }
                    
                    // Ajouter le nombre d'occurrences
                    heatmapData[key].count += count;
                    
                    // Ajouter les détails du lieu si disponibles
                    if (locationDetails[place]) {
                        // Ajouter les événements
                        heatmapData[key].locations.push(...locationDetails[place].events);
                        
                        // Fusionner les compteurs de noms de famille
                        for (const [family, famCount] of Object.entries(locationDetails[place].families)) {
                            heatmapData[key].families[family] = 
                                (heatmapData[key].families[family] || 0) + famCount;
                        }
                    } else {
                        // Fallback si pas de détails
                        heatmapData[key].locations.push({
                            type: 'Lieu',
                            name: place,
                            count: count
                        });
                    }
                }
            } catch (error) {
                console.error(`Erreur de géocodage pour "${place}":`, error);
            }
        }
        
        // Convertir l'objet en tableau
        return Object.values(heatmapData);
    } catch (error) {
        console.error('Erreur lors de la création des données pour la heatmap:', error);
        throw error;
    }
}



export function showPersonActions(person, event) {
    console.log('Showing actions for:', person.name, person.id);

    // Supprimer tout menu contextuel existant
    const existingMenu = document.getElementById('person-actions-menu');
    if (existingMenu) {
        existingMenu.remove();
    }

    const actionsMenu = document.createElement('div');
    actionsMenu.id = 'person-actions-menu';
    actionsMenu.style.position = 'fixed';
    actionsMenu.style.left = `${event.clientX}px`;
    actionsMenu.style.top = `${event.clientY}px`;
    actionsMenu.style.backgroundColor = 'white';
    actionsMenu.style.border = '1px solid #ccc';
    actionsMenu.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    actionsMenu.style.zIndex = '10000';

    const actions = [
        { text: "Voir dans l'arbre", action: () => showInTree(person.id) },
        { text: "Voir la fiche", action: () => showPersonDetails(person.id) },
        { text: "Animation", action: () => startAnimation(person.id) }
    ];

    actions.forEach(action => {
        const actionButton = document.createElement('button');
        actionButton.textContent = action.text;
        actionButton.style.display = 'block';
        actionButton.style.width = '100%';
        actionButton.style.padding = '5px 10px';
        actionButton.style.border = 'none';
        actionButton.style.backgroundColor = 'transparent';
        actionButton.style.textAlign = 'left';
        actionButton.style.cursor = 'pointer';

        actionButton.addEventListener('mouseenter', () => {
            actionButton.style.backgroundColor = '#f0f0f0';
        });

        actionButton.addEventListener('mouseleave', () => {
            actionButton.style.backgroundColor = 'transparent';
        });

        actionButton.addEventListener('click', (e) => {
            e.stopPropagation();
            actionsMenu.remove();
            action.action();
        });

        actionsMenu.appendChild(actionButton);
    });

    document.body.appendChild(actionsMenu);

    // Fermer le menu si on clique ailleurs
    document.addEventListener('click', function closeMenu(e) {
        const menu = document.getElementById('person-actions-menu');
        if (menu && !menu.contains(e.target)) {
            if (menu.parentNode) {
                menu.parentNode.removeChild(menu);
            }
            document.removeEventListener('click', closeMenu);
        }
    });
}

export function showPersonDetails(personId) {
    console.log('Showing details for:', personId);

    if (typeof removeAllStatsElements === 'function') {
        removeAllStatsElements();
    }


    displayPersonDetails(personId);

    const modal = document.querySelector('.modal-container');
    if (modal) {
        modal.remove();
    }
}

export function startAnimation(personId) {
    state.rootPersonId = personId;
    console.log('Starting animation with:', personId);

    if (typeof removeAllStatsElements === 'function') {
        removeAllStatsElements();
    }

    startAncestorAnimation();

    const modal = document.querySelector('.modal-container');
    if (modal) {
        modal.remove();
    }
}

export function showInTree(personId) {
    state.rootPersonId = personId;
    state.treeMode = 'ancestors';
    console.log('Showing in tree:', personId);
    

    if (typeof removeAllStatsElements === 'function') {
        removeAllStatsElements();
    }

    // Vous devrez importer ou définir cette fonction
    import('./treeRenderer.js').then(module => {
        module.drawTree();
    });

    const modal = document.querySelector('.modal-container');
    if (modal) {
        modal.remove();
    }
}

(function initializeGlobalListeners() {
    document.addEventListener('cloudMapRefreshed', (event) => {
        // console.log('CloudMap rafraîchie', event.detail);
        
        const refreshListEvent = new CustomEvent('refreshPersonList', {
            detail: {
                config: event.detail.config,
                timestamp: Date.now()
            }
        });
        document.dispatchEvent(refreshListEvent);
    });
})();

