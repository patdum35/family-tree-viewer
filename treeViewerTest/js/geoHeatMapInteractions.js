// import { refreshHeatmap } from './geoHeatMapDataProcessor.js';
import { getRefreshHeatmap } from './main.js';
import { nameCloudState , filterPeopleByText, extractSearchTextFromTitle } from './nameCloud.js';
// import { nameCloudState , filterPeopleByText, extractSearchTextFromTitle } from './main.js';
import { showPersonsList } from './nameCloudInteractions.js';


/**
 * Sauvegarde la position et les dimensions de la heatmap
 */
export function saveHeatmapPosition() {
    const wrapper = document.getElementById('namecloud-heatmap-wrapper');
    if (!wrapper) return;
    
    // Obtenir la position et les dimensions réelles de l'élément
    const rect = wrapper.getBoundingClientRect();
    
    // Vérifier que les valeurs sont raisonnables
    if (rect.width < 50 || rect.height < 50 || rect.top < 0 || rect.left < 0) {
        console.warn("Valeurs de position/taille invalides détectées, sauvegarde ignorée");
        return;
    }
    
    // S'assurer que l'objet existe
    if (!nameCloudState.heatmapPosition) {
        nameCloudState.heatmapPosition = {};
    }
    
    // Stocker les valeurs
    nameCloudState.heatmapPosition = {
        top: Math.round(rect.top),
        left: Math.round(rect.left),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
    };
}

/**
 * Attache des écouteurs d'événements aux filtres pour mettre à jour la heatmap automatiquement
 */
export async function attachFilterListeners() {

    // Fonction debounce pour éviter de réagir trop souvent
    const debounce = (func, wait) => {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };
    
    // Stocker les valeurs précédentes pour détecter les vrais changements
    const previousValues = {
        type: null,
        scope: null,
        startDate: null,
        endDate: null,
        rootPerson: null
    };
    
    const refreshHeatmap = await getRefreshHeatmap();

    // Fonction pour vérifier si une valeur a réellement changé
    const hasValueChanged = (element, key) => {
        
        // Si c'est un élément select ou input standard
        if (element.tagName === 'SELECT' || element.tagName === 'INPUT') {
            if (previousValues[key] === null) {
                previousValues[key] = element.value;
                return false; // Premier chargement, pas de changement
            }
            
            const hasChanged = element.value !== previousValues[key];
            if (hasChanged) {
                previousValues[key] = element.value;
            }
            return hasChanged;
        }
        
        // Pour les sélecteurs personnalisés
        if (element.className === 'custom-select-container') {
            const value = element.value || element.dataset?.value;
            if (previousValues[key] === null) {
                previousValues[key] = value;
                return false; // Premier chargement, pas de changement
            }
            
            const hasChanged = value !== previousValues[key];
            if (hasChanged) {
                previousValues[key] = value;
            }
            return hasChanged;
        }
        
        return false; // Par défaut, pas de changement
    };

    
    /**
     * Modification de smartRefresh dans attachFilterListeners
     */
    const smartRefresh = (element, key) => {
        
        // Vérifier si la valeur a vraiment changé
        if (hasValueChanged(element, key)) {
            // Mettre à jour la heatmap si elle est visible
            if (typeof refreshHeatmap === 'function' && 
                document.getElementById('namecloud-heatmap-wrapper')) {
                refreshHeatmap();
            }
            
            // Rafraîchir la liste après un petit délai
            setTimeout(() => {
                refreshPersonList();
            }, 400);
        }
    };
    
    
    // Version debounced du rafraîchissement intelligent
    const debouncedSmartRefresh = debounce(smartRefresh, 1000);
    
    // Attacher des écouteurs aux éléments de typeSelect et scopeSelect
    const rootPersonSelect = document.querySelector('[data-text-key="rootPersonResults"]');
    const typeSelect = document.querySelector('[data-text-key="typeSelect"], .custom-select-container[data-value]');
    const scopeSelect = document.querySelector('[data-text-key="scopeSelect"], .custom-select-container[data-value]');
    const startDateInput = document.querySelector('input[type="number"][data-text-key="startDateInput"]');
    const endDateInput = document.querySelector('input[type="number"][data-text-key="endDateInput"]');
    

    
    // Pour le typeSelect
    if (typeSelect) {
        typeSelect.addEventListener('change', () => debouncedSmartRefresh(typeSelect, 'type'));
    }
    
    // Pour le scopeSelect
    if (scopeSelect) {
        scopeSelect.addEventListener('change', () => debouncedSmartRefresh(scopeSelect, 'scope'));
    }
    
    // Pour les dates
    if (startDateInput) {
        startDateInput.addEventListener('change', () => debouncedSmartRefresh(startDateInput, 'startDate'));
    }
    
    if (endDateInput) {
        endDateInput.addEventListener('change', () => debouncedSmartRefresh(endDateInput, 'endDate'));
    }
    


    // Pour le bouton OK/Valider
    const validateButton = document.querySelector('button[title="Valider"]');
    if (validateButton) {
        // Modification du gestionnaire du bouton Valider aussi dans geoHeatMapInteractions.js
        validateButton.addEventListener('click', () => {
            if (typeof refreshHeatmap === 'function' && 
                document.getElementById('namecloud-heatmap-wrapper')) {
                refreshHeatmap();
                
                // Rafraîchir la liste après un petit délai
                setTimeout(refreshPersonList, 400);
            }
        });
    }
}


// Ajouter cet écouteur quelque part où il sera initialisé une seule fois
export function initializeRefreshPersonListEventListener() {
    document.addEventListener('refreshPersonList', (event) => {
        console.log('\n\n\n ----------   Événement de rafraîchissement de liste reçu, document.addEventListener(refreshPersonList) dans geoHeatMapInteraction', event.detail);
        
        // Vérifier si une liste de personnes est actuellement affichée
        const personListModal = document.querySelector('.person-list-modal');
        if (!personListModal) return;
        
        // Extraire le texte de recherche
        const titleElement = personListModal.querySelector('h2');
        const searchText = extractSearchTextFromTitle(titleElement);
        
        if (!searchText) {
            console.log("Impossible d'extraire le texte de recherche");
            return;
        }
        
        // Utiliser la configuration actuelle
        const config = event.detail.config;
        
        // Filtrer les personnes
        const filteredPeople = filterPeopleByText(searchText, config);
        
        // Fermer l'ancienne liste et en ouvrir une nouvelle
        personListModal.remove();
        new showPersonsList(searchText, filteredPeople, config);
    });
}


/**
 * Fonction pour rafraîchir la liste de personnes
 */
function refreshPersonList() {

       console.log('\n\n\n ----------   refreshPersonList  dans geoHeatMapInteraction');


    // Vérifier si une liste de personnes est visible
    const personListModal = document.querySelector('.person-list-modal');
    if (!personListModal) return;
    
    // Récupérer le titre
    const titleElement = personListModal.querySelector('h2');
    const searchText = extractSearchTextFromTitle(titleElement);
    
    if (!searchText) {
        console.log("Impossible d'extraire le texte de recherche du titre");
        return;
    }
    
    
    // Récupérer la configuration actuelle
    const config = nameCloudState.currentConfig;
    if (!config) {
        console.log("Configuration actuelle non disponible");
        return;
    }
    
    // Utiliser la fonction factoriséé pour filtrer les personnes
    const filteredPeople = filterPeopleByText(searchText, config);
    // console.log(`Personnes filtrées: ${filteredPeople.length}`);



    // Mettre à jour la heatmap si elle est visible
    if (nameCloudState.isHeatmapVisible && document.querySelector('.person-list-modal')) {
        try {
            // Afficher un indicateur de chargement
            const loadingIndicator = document.createElement('div');
            loadingIndicator.id = 'refresh-map-indicator';
            loadingIndicator.style.position = 'fixed';
            loadingIndicator.style.top = '50%';
            loadingIndicator.style.left = '50%';
            loadingIndicator.style.transform = 'translate(-50%, -50%)';
            loadingIndicator.style.backgroundColor = 'white';
            loadingIndicator.style.padding = '10px 20px';
            loadingIndicator.style.borderRadius = '8px';
            loadingIndicator.style.zIndex = '10000';
            loadingIndicator.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
            loadingIndicator.textContent = 'Mise à jour de la carte...';
            document.body.appendChild(loadingIndicator);
            
            // Utiliser setTimeout pour permettre l'affichage de l'indicateur
            setTimeout(async () => {
                try {
                    // Créer les données de heatmap à partir des personnes filtrées
                    const heatmapData = await createHeatmapDataForPeople(filteredPeople);
                    
                    // Mettre à jour la heatmap existante
                    const heatmapWrapper = document.getElementById('namecloud-heatmap-wrapper');
                    if (heatmapWrapper && heatmapWrapper.map && heatmapData && heatmapData.length > 0) {
                        // Supprimer les couches existantes sauf la couche de tuiles
                        heatmapWrapper.map.eachLayer(layer => {
                            if (!(layer instanceof L.TileLayer)) {
                                heatmapWrapper.map.removeLayer(layer);
                            }
                        });
                        
                        // Ajouter la nouvelle couche de chaleur
                        L.heatLayer(
                            heatmapData.map(loc => [loc.coords.lat, loc.coords.lon, 1]), 
                            {
                                radius: 25,
                                blur: 15,
                                maxZoom: 1
                            }
                        ).addTo(heatmapWrapper.map);
                        
                        // Ajouter des marqueurs interactifs
                        heatmapData.forEach(location => {
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
                            }).addTo(heatmapWrapper.map);
                            
                            // Configurer la popup
                            let popupContent = `
                                <strong>Lieu :</strong> ${location.placeName || "Lieu non spécifié"}<br>
                                <strong>Occurrences :</strong> ${location.count}
                            `;
                            
                            // Ajouter des détails si disponibles
                            if (location.locations && location.locations.length > 0) {
                                popupContent += `<br><strong>Personnes :</strong><br>`;
                                const sortedLocations = [...location.locations].sort((a, b) => {
                                    if (a.type !== b.type) return a.type.localeCompare(b.type);
                                    return a.name.localeCompare(b.name);
                                });
                                
                                sortedLocations.slice(0, 5).forEach(person => {
                                    popupContent += `- ${person.name} (${person.type}${person.year ? ` - ${person.year}` : ''})<br>`;
                                });
                                
                                if (sortedLocations.length > 5) {
                                    popupContent += `... et ${sortedLocations.length - 5} autres`;
                                }
                            }
                            
                            marker.bindPopup(popupContent);
                        });
                        
                        // Ajuster la vue
                        try {
                            if (heatmapData.length > 0) {
                                const coordinates = heatmapData
                                    .filter(loc => loc.coords && typeof loc.coords.lat === 'number' && typeof loc.coords.lon === 'number')
                                    .map(loc => [loc.coords.lat, loc.coords.lon]);
                                    
                                if (coordinates.length > 0) {
                                    const bounds = L.latLngBounds(coordinates);
                                    if (bounds.isValid()) {
                                        // Calculer le niveau de zoom idéal pour ces limites
                                        const idealZoom = heatmapWrapper.map.getBoundsZoom(bounds, false, [50, 50]);
                                        
                                        // Limiter le zoom maximum à 7 (≈ 100-150km de rayon)
                                        const maxAllowedZoom = 7;
                                        const finalZoom = Math.min(idealZoom, maxAllowedZoom);
                                        
                                        // Si on a dû limiter le zoom, utiliser le centre des limites
                                        if (finalZoom < idealZoom) {
                                            const center = bounds.getCenter();
                                            heatmapWrapper.map.setView(center, finalZoom);
                                        } else {
                                            // Sinon, utiliser fitBounds classique
                                            heatmapWrapper.map.fitBounds(bounds, {
                                                padding: [50, 50],
                                                maxZoom: maxAllowedZoom
                                            });
                                        }
                                    }
                                }
                            }
                        } catch (error) {
                            console.error('Erreur lors de l\'ajustement de la vue:', error);
                        }
                        
                        // Mettre à jour le titre de la heatmap
                        const mapTitle = heatmapWrapper.querySelector('#heatmap-map-title');
                        if (mapTitle) {
                            const titleElement = document.querySelector('.person-list-modal h2');
                            if (titleElement) {
                                mapTitle.textContent = `Lieux pour ${titleElement.textContent.replace(/\([^)]*\)/, '').trim()}`;
                            }
                        }
                    }
                } catch (error) {
                    console.error('Erreur lors de la mise à jour de la heatmap:', error);
                } finally {
                    // Supprimer l'indicateur de chargement
                    const indicator = document.getElementById('refresh-map-indicator');
                    if (indicator) {
                        indicator.remove();
                    }
                }
            }, 100);
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la heatmap:', error);
        }
    }



    
    // Ajouter un effet de transition
    personListModal.style.transition = 'opacity 0.3s ease';
    personListModal.style.opacity = '0';
    
    // Attendre la fin de la transition avant de fermer/rouvrir
    setTimeout(() => {
        // Fermer la liste actuelle
        personListModal.remove();
        
        // Afficher la liste mise à jour
        new showPersonsList(searchText, filteredPeople, config);
        
        // Ajouter un effet d'apparition à la nouvelle liste
        setTimeout(() => {
            const newListModal = document.querySelector('.person-list-modal');
            if (newListModal) {
                newListModal.style.opacity = '0';
                newListModal.style.transition = 'opacity 0.3s ease';
                
                // Petit délai pour s'assurer que le style initial est appliqué
                requestAnimationFrame(() => {
                    newListModal.style.opacity = '1';
                });
            }
        }, 10);
    }, 300); // Attendre la fin de la transition
}

