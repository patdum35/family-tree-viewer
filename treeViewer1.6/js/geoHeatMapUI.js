import { state } from './main.js';
import { nameCloudState } from './nameCloud.js';
import { saveHeatmapPosition, makeElementDraggable } from './geoHeatMapInteractions.js';
import { refreshHeatmap } from './geoHeatMapDataProcessor.js';
import { collectPersonLocations, createCachedTileLayer, createEnhancedMarkerIcon, fitMapToMarkers, 
    clearMap, addMapTitle, addMapButton, addLoadingOverlay, removeLoadingOverlay, 
    setupCustomPopupStyle, cleanLocationName, showTemporaryLabel } from './mapUtils.js';
import { geocodeLocation } from './geoLocalisation.js';
import { getTranslation } from './nameCloudUI.js';
import { createDataForHeatMap } from './geoHeatMapDataProcessor.js';
import { getPersonsListTitle } from './nameCloudInteractions.js';
import { addTooltipTransparencyFix, toggleAnimationPause, animationState} from './treeAnimation.js';
import { showHeatmapFromSearch } from './searchModalUI.js';
import { showHeatmapFromShowPersonList } from './nameCloudInteractions.js';
import { disableFortuneModeWithLever, disableFortuneModeClean } from './treeWheelAnimation.js';
import { debounce } from './eventHandlers.js';

/**
 * Fonction de traduction spécifique pour geoHeatMapUI.js
 */
function getUITranslation(key) {
    const translations = {
      'fr': {
        // Titres et boutons
        'moveMap': 'Déplacer la carte',
        'resizeMap': 'Redimensionner la carte',
        'refreshHeatmap': 'Rafraîchir la heatmap',
        'closeHeatmap': 'Fermer la heatmap',
        
        // Détails des points
        'pointDetails': 'Détails du point',
        'place': 'Lieu',
        'placeNotSpecified': 'Lieu non spécifié',
        'totalOccurrences': 'Nombre total d\'occurrences',
        'familyNames': 'Noms de famille',
        'people': 'Personnes',
        'occurrence': 'occurrence',
        'occurrences': 'occurrences',
        
        // Types d'événements
        'birth': 'Naissance',
        'death': 'Décès',
        'residence': 'Résidence',
        'marriage': 'Mariage',
        'place': 'Lieu',
        
        // Messages d'erreur
        'mapInitError': 'Erreur lors de la création de la carte. Voir console pour détails.',
        'noValidCoordinates': 'Aucune coordonnée valide trouvée dans les données',
        'invalidHeatmapData': 'Données de heatmap invalides:',
        'seeAllPlaces' : 'Voir tous les lieux'
      },
      'en': {
        // Titres et boutons
        'moveMap': 'Move the map',
        'resizeMap': 'Resize the map',
        'refreshHeatmap': 'Refresh heatmap',
        'closeHeatmap': 'Close heatmap',
        
        // Détails des points
        'pointDetails': 'Point details',
        'place': 'Place',
        'placeNotSpecified': 'Place not specified',
        'totalOccurrences': 'Total occurrences',
        'familyNames': 'Family names',
        'people': 'People',
        'occurrence': 'occurrence',
        'occurrences': 'occurrences',
        
        // Types d'événements
        'birth': 'Birth',
        'death': 'Death',
        'residence': 'Residence',
        'marriage': 'Marriage',
        'place': 'Place',
        
        // Messages d'erreur
        'mapInitError': 'Error creating the map. See console for details.',
        'noValidCoordinates': 'No valid coordinates found in data',
        'invalidHeatmapData': 'Invalid heatmap data:',
        'seeAllPlaces' : 'See all places'
      },
      'es': {
        // Titres et boutons
        'moveMap': 'Mover el mapa',
        'resizeMap': 'Redimensionar el mapa',
        'refreshHeatmap': 'Actualizar mapa de calor',
        'closeHeatmap': 'Cerrar mapa de calor',
        
        // Détails des points
        'pointDetails': 'Detalles del punto',
        'place': 'Lugar',
        'placeNotSpecified': 'Lugar no especificado',
        'totalOccurrences': 'Número total de apariciones',
        'familyNames': 'Apellidos',
        'people': 'Personas',
        'occurrence': 'aparición',
        'occurrences': 'apariciones',
        
        // Types d'événements
        'birth': 'Nacimiento',
        'death': 'Fallecimiento',
        'residence': 'Residencia',
        'marriage': 'Matrimonio',
        'place': 'Lugar',
        
        // Messages d'erreur
        'mapInitError': 'Error al crear el mapa. Ver consola para detalles.',
        'noValidCoordinates': 'No se encontraron coordenadas válidas en los datos',
        'invalidHeatmapData': 'Datos de mapa de calor inválidos:',
        'seeAllPlaces' : 'Ver todos los lugares'
      },
      'hu': {
        // Titres et boutons
        'moveMap': 'Térkép mozgatása',
        'resizeMap': 'Térkép átméretezése',
        'refreshHeatmap': 'Hőtérkép frissítése',
        'closeHeatmap': 'Hőtérkép bezárása',
        
        // Détails des points
        'pointDetails': 'Pont részletei',
        'place': 'Hely',
        'placeNotSpecified': 'Hely nincs megadva',
        'totalOccurrences': 'Összes előfordulás',
        'familyNames': 'Vezetéknevek',
        'people': 'Személyek',
        'occurrence': 'előfordulás',
        'occurrences': 'előfordulás',
        
        // Types d'événements
        'birth': 'Születés',
        'death': 'Halál',
        'residence': 'Lakóhely',
        'marriage': 'Házasság',
        'place': 'Hely',
        
        // Messages d'erreur
        'mapInitError': 'Hiba a térkép létrehozásakor. Részletek a konzolon.',
        'noValidCoordinates': 'Nem található érvényes koordináta az adatokban',
        'invalidHeatmapData': 'Érvénytelen hőtérkép adatok:',
        'seeAllPlaces' : 'Összes hely megtekintése'
      }
    };
  
    // Récupérer la langue actuelle
    const currentLang = window.CURRENT_LANGUAGE || 'fr';
    
    // Retourner la traduction ou le fallback en français
    return translations[currentLang]?.[key] || translations['fr'][key];
  }
  
  /**
   * Fonction utilitaire pour obtenir le type d'événement traduit
   * @param {string} eventType - Type d'événement en français
   * @returns {string} - Type d'événement traduit
   */
  function getTranslatedEventType(eventType) {
    const eventTypeMap = {
      'Naissance': 'birth',
      'Décès': 'death',
      'Résidence': 'residence',
      'Mariage': 'marriage',
      'Lieu': 'place'
    };
    
    const key = eventTypeMap[eventType] || 'place';
    return getUITranslation(key);
  }
  
  /**
   * Fonction utilitaire pour gérer les pluriels dans les traductions
   * @param {number} count - Le nombre pour déterminer le pluriel
   * @param {string} singularKey - Clé de traduction pour le singulier
   * @param {string} pluralKey - Clé de traduction pour le pluriel
   * @returns {string} - Texte traduit au singulier ou pluriel selon le nombre
   */
  function getPlural(count, singularKey, pluralKey) {
    return count > 1 ? getUITranslation(pluralKey) : getUITranslation(singularKey);
  }


export async function displayHeatMap(personId = null, currentSearchResults = null, isResultsFormated = false, newConfig = null, title = null, isOnlyOnePerson = false, personName = null, showPersonListModalCounter = null) {


    // // si le mode animation était lancé, le mettre en pause
    if (!animationState.isPaused && !state.isRadarEnabled && !state.isWordCloudEnabled ) {
        console.log("🔴 Pause de l'animation pour afficher la heatmap, animationState.currentIndex=", animationState.currentIndex);
        toggleAnimationPause();
        await new Promise(resolve => setTimeout(resolve, 600));
    }

    const wrapper = document.getElementById('animation-map-container');
    if (wrapper) {
        wrapper.style.display = "none";
    }

    disableFortuneModeClean();

    // console.log('- debug displayHeatMap' , personId, currentSearchResults,isResultsFormated,  newConfig, ', title=', title, isOnlyOnePerson, ', personName=', personName)
    // Création d'un indicateur de chargement
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
    // loadingIndicator.innerHTML = '<p>Génération de la heatmap...</p><progress style="width: 100%;"></progress>';
    loadingIndicator.innerHTML = `<p>${getTranslation('mapGeneration')}</p><progress style="width: 100%;"></progress>`;

    document.body.appendChild(loadingIndicator);

    let isSearchResults = false;
    if (currentSearchResults && currentSearchResults.length > 0) {
        isSearchResults = true;
    }

    
    try {

        // Récupérer les paramètres actuels de filtrage
        // const currentConfig = {
        //     type: 'name', //state.treeMode,
        //     startDate: -6000, //parseInt(startDateInput.value),
        //     endDate: 3000, //parseInt(endDateInput.value),
        //     scope: 'all',
        //     rootPersonId:  null, //state.rootPersonId//scopeSelect.value !== 'all' ? finalRootPersonSelect.value : null
        // };


        const currentConfig = {
            type: (newConfig) ? newConfig.type : 'name', 
            startDate: (newConfig) ? ((newConfig.startDate) ? newConfig.startDate : -6000) : -6000, 
            endDate: (newConfig) ? ((newConfig.endDate) ? newConfig.endDate : 3000) : 3000, 
            scope: (newConfig) ? newConfig.scope : 'all',
            rootPersonId:  (newConfig) ? newConfig.rootPersonId : null, 
        };



        // const persons = getPersonsFromTCurrenTree();

        // Générer les données pour la heatmap
        let heatmapData;
        if (isSearchResults) {
            if (isResultsFormated) { 
                heatmapData = currentSearchResults;
            } else {
                heatmapData = await createDataForHeatMap(currentConfig, false, currentSearchResults);  
            }

        } else {
            heatmapData = await createDataForHeatMap(currentConfig, true); 
        }      

        // Supprimer l'indicateur de chargement
        document.body.removeChild(loadingIndicator);
        
        // Créer la heatmap interactive
        if (!heatmapData || heatmapData.length === 0) {
            heatmapData = [];
        }
        // Créer un titre pour la heatmap basé sur la configuration
        let heatmapTitle;
        if (title) { heatmapTitle = title;}
        else if (isOnlyOnePerson && personName) {
            heatmapTitle = personName;
        }

        if (!personName && heatmapTitle ) { personName = heatmapTitle; }

        if (personName && !heatmapTitle && heatmapData.length >1) { personName = 'Heatmap'; heatmapTitle = 'Heatmap'; }
        //  if (personName && ! heatmapTitle ) { heatmapTitle = personName; }
        

        // Utiliser la fonction pour créer la heatmap
        // console.log('- debug displayHeatMap' , ', heatmapTitle=', heatmapTitle, isOnlyOnePerson, ', personName=', personName)

        if (document.getElementById('namecloud-heatmap-wrapper')) {
            if (!isOnlyOnePerson) { 
                // console.log('- debug several Person  createImprovedHeatmap ', isOnlyOnePerson, personName, currentSearchResults, heatmapData, 'title=', heatmapTitle)
                createImprovedHeatmap(heatmapData, heatmapTitle, true, true);
                // createIndividualLocationMap(null, heatmapData, true, heatmapTitle);

            } else {
                // console.log('- debug isOnlyOnePerson = true call to  createIndividualLocationMap with ', null, heatmapData, isOnlyOnePerson, personName)
                createIndividualLocationMap(null, heatmapData, isOnlyOnePerson, personName, showPersonListModalCounter);
            }


        } else {
            // console.log('- debug first Time = true createImprovedHeatmap ', isOnlyOnePerson, ', personName=' , personName, currentSearchResults, heatmapData, 'title=', heatmapTitle)
            createImprovedHeatmap(heatmapData, heatmapTitle, true, false, { top: window.innerHeight/2, left: 25, width: window.innerWidth-50, height: window.innerHeight/2-25 });
            if (isOnlyOnePerson) {         
                // console.log('- debug isOnlyOnePerson = true call to  createIndividualLocationMap with ', null, heatmapData, isOnlyOnePerson, personName)
                setTimeout(() => {
                    createIndividualLocationMap(null, heatmapData, isOnlyOnePerson, personName, showPersonListModalCounter);  
                }, 100); // Petit délai pour s'assurer que le DOM est prêt
            }  
        }

    } catch (error) {
        console.error('Erreur lors de la génération de la heatmap:', error);
        if (document.body.contains(loadingIndicator)) {
            document.body.removeChild(loadingIndicator);
        }
        // alert(`Erreur lors de la génération de la heatmap: ${error.message}`);
        // alert(`${getTranslation('errorHeatmap')}: ${error.message}`);
    }

}



/**
 * Crée une carte individuelle avec les lieux d'une personne
 * @param {string} personId - ID de la personne
 * @returns {Promise<void>}
 */
export async function createIndividualLocationMap(personId, heatmapData = null, isOnlyOnePerson = false, personName = null , showPersonListModalCounter = null) {
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

    window.displayedLocationNames = new Set();
    addTooltipTransparencyFix();
    
    // Configurer le style personnalisé pour les popups
    setupCustomPopupStyle();

    // Récupérer les informations de la personne
    
    let person  = null;
    let locations = null;
    let isMapToBeCleared = false;
    if (personId) {
        person = state.gedcomData.individuals[personId];
        if (!person) {
            console.error("Personne non trouvée avec l'ID:", personId);
            return;
        }
        console.log("Personne trouvée:", person.name);
        
        // Collecter les lieux de la personne avec la fonction centralisée
        locations = collectPersonLocations(person, state.gedcomData.families);
        personId = '';
    } else if (heatmapData) {
        person = {};
        // console.log('-debug locations : ', heatmapData);  
        if (heatmapData.length > 0) {
            person.name = heatmapData[0].locations[0].name;
            // console.log('-debug createIndividualLocationMap ', person.name)
            // locations = heatmapData[0].locations;
            locations = [];
            heatmapData.forEach( (loc, index) => {
                locations[index] = {};
                locations[index].place = loc.placeName;
                locations[index].coords = loc.coords;
                locations[index].type = loc.locations[0].type;  
            });
        } else {
            isMapToBeCleared = true;
        }

    } else {
        isMapToBeCleared = true;
    }



    if (locations && locations.length === 0) {
        console.log('Aucun lieu trouvé pour cette personne');
        alert('Aucun lieu trouvé pour cette personne');
        isMapToBeCleared = true;
        // return;
    }

    
    // Afficher un indicateur de chargement
    const loadingOverlay = addLoadingOverlay(heatmapWrapper, 'Chargement des lieux...');
    
    try {
        // Récupérer la carte
        const map = heatmapWrapper.map;
        
        const  mapTitle = document.getElementById('heatmap-map-title');
        if (mapTitle) {
            mapTitle.remove();  // 👈 boum, plus de titre
        }
        
        // Nettoyer toutes les couches existantes sauf la couche de tuiles
        clearMap(map);
        
        // Tableau pour stocker les marqueurs
        const markers = [];

        if (!isMapToBeCleared) {

            // Géocoder et placer les marqueurs
            for (const location of locations) {
                try {
                    console.log("Géocodage de:", location.place);
                    const coords = await geocodeLocation(location.place);
                    
                    if (coords && !isNaN(coords.lat) && !isNaN(coords.lon)) {
                        console.log("Coordonnées trouvées:", coords, location.place, location.type);
                        
                        // Créer l'icône pour le marqueur avec un style amélioré
                        const markerIcon = createEnhancedMarkerIcon(location.type);
                        
                        // Créer et ajouter le marqueur
                        const marker = L.marker([coords.lat, coords.lon], { icon: markerIcon })
                            .addTo(map)
                            // .bindPopup(`<strong>${location.type}:</strong> ${location.place}`);
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
                            // showTemporaryLabel(marker, displayName, options.labelDuration || 1000);
                            showTemporaryLabel(marker, displayName, 5000);
                        }



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
            await fitMapToMarkers(map, markers, {
                maxZoom: 9,
                animate: true,
                duration: 1.5,
                easeLinearity: 0.25
            });
            
            // Améliorer aussi les popups pour plus de lisibilité
            markers.forEach(marker => {
                // Personnaliser le style de la popup
                const popup = marker.getPopup();
                if (popup) {
                    popup.options.className = 'custom-popup';
                }
            });



            
            // Ajouter un bouton pour revenir à la heatmap originale
            addMapButton(heatmapWrapper, getUITranslation('seeAllPlaces'), () => {
                // Rétablir la heatmap originale
                const modal = document.getElementById('search-modal')
                const isVisible = modal && getComputedStyle(modal).display !== 'none' && getComputedStyle(modal).visibility !== 'hidden';
                if (isVisible) { 
                    showHeatmapFromSearch();
                } else {                           
                    const allModals = document.querySelectorAll('[id^="show-person-list-modal-"]');
                    const isVisible = (allModals) && allModals[allModals.length - 1] && getComputedStyle(allModals[allModals.length - 1]).display !== 'none' && getComputedStyle(allModals[allModals.length - 1]).visibility !== 'hidden';
                    if (isVisible) { 
                        showHeatmapFromShowPersonList(showPersonListModalCounter);
                    }
                } 

                // Supprimer le titre et le bouton de reset
                const mapTitle = heatmapWrapper.querySelector('.individual-map-title');
                if (mapTitle) mapTitle.remove();
                
                const resetButton = heatmapWrapper.querySelector('.reset-heatmap-button');
                if (resetButton) resetButton.remove();
            });

            // Ajouter un titre à la carte
            const confLocal = {};
            confLocal.type = 'placeOf';

            addMapTitle(heatmapWrapper, `${getPersonsListTitle(personName, (heatmapData) ? heatmapData.length : null , confLocal)} ${person.name.replace(/\//g, '')}`);


            const existingMap = document.getElementById('namecloud-heatmap-wrapper');


            // Mettre à jour aussi le titre de la carte
            const mapTitle = existingMap.querySelector('.map-title');
            if (mapTitle) {
                mapTitle.textContent = '';
            }


        } else {
            // Ajouter un titre à la carte
            if (personName) {
                const confLocal = {};
                confLocal.type = 'noPlaceFor';
                addMapTitle(heatmapWrapper, `${getPersonsListTitle(personName, (heatmapData) ? heatmapData.length : null, confLocal)}${personName}`);
            }
        }


        
    } catch (error) {
        console.error('Erreur lors de la création de la carte individuelle:', error);
        alert('Erreur lors de la création de la carte: ' + error.message);
    } finally {
        // Supprimer l'overlay de chargement
        removeLoadingOverlay(heatmapWrapper);
    }

    // Mettre à jour les variables de suivi
    window.lastSelectedLocationId = personId;
    window.isIndividualMapMode = true;
}


/**
 * Crée et affiche la heatmap avec son interface utilisateur, ou met à jour les données d'une heatmap existante
 * 
 * @param {Array} locationData - Données de localisation pour la heatmap
 * @param {String} heatmapTitle - Titre à afficher pour la heatmap
 * @param {Boolean} updateOnly - Si true, met à jour seulement les données sans recréer l'interface (défaut: false)
 * @param {Object} initialPosition - Position et taille initiales optionnelles { top, left, width, height }
 * @returns {HTMLElement} - L'élément wrapper de la heatmap créée ou mise à jour
 */
export function createImprovedHeatmap(locationData, heatmapTitle, isFromTree = false, updateOnly = false, initialPosition = null) {
    

    // console.log("\n\n\n ****** debug in createImprovedHeatmap", locationData, heatmapTitle, isFromTree , updateOnly , initialPosition);


    // Vérifier s'il existe déjà une heatmap
    const existingMap = document.getElementById('namecloud-heatmap-wrapper');
    
    // Mode mise à jour : mettre à jour les données d'une carte existante
    if (updateOnly && existingMap && existingMap.map) {
        console.log("Mode mise à jour : updating existing heatmap data");
        
        // Mettre à jour le titre si fourni
        if (heatmapTitle) {
            const titleElement = existingMap.querySelector('.title-text');
            if (titleElement) {
                titleElement.textContent = heatmapTitle;
            }
            // Mettre à jour aussi le titre de la carte
            const mapTitle = existingMap.querySelector('.map-title');
            if (mapTitle) {
                mapTitle.textContent = heatmapTitle;
            }
        }
        
        // Rafraîchir les données de la carte en utilisant votre logique existante
        refreshMapData(existingMap, locationData, isFromTree);
        
        return existingMap;
    }
    
    // Mode mise à jour demandé mais aucune carte existante : créer une nouvelle carte
    if (updateOnly && !existingMap) {
        console.warn("Mode mise à jour demandé mais aucune heatmap existante trouvée. Création d'une nouvelle heatmap.");
    }
    
    // Mode création : créer une nouvelle heatmap (comportement original)
    nameCloudState.isHeatmapVisible = true;
    
    // Fermer toute carte existante d'abord
    if (existingMap) {
        document.body.removeChild(existingMap);
    }

    // Créer un conteneur principal (semi-transparent) qui ne couvre pas tout l'écran
    const heatmapWrapper = document.createElement('div');
    
    
    heatmapWrapper.id = 'namecloud-heatmap-wrapper';
    heatmapWrapper.style.position = 'fixed';
    heatmapWrapper.style.top = '60px'; // Remonté de 20px comme demandé
    heatmapWrapper.style.left = '20px';
    // heatmapWrapper.style.left = Math.floor(Math.max(window.innerWidth - 700, 5)/2) + 'px';
    // heatmapWrapper.style.transform = 'translateX(-50%)'; // Centrer horizontalement
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
    heatmapWrapper.style.maxWidth = '800px'; 


    function applyHeatmapPosition() {
        // 1. Priorité aux paramètres passés directement à la fonction (pour création initiale)
        if (initialPosition && typeof initialPosition === 'object') {
            console.log("Application de la position initiale fournie:", initialPosition);
            
            // Appliquer les valeurs fournies (avec validation basique)
            if (initialPosition.top !== undefined) {
                heatmapWrapper.style.top = `${initialPosition.top}px`;
            }
            if (initialPosition.left !== undefined) {
                heatmapWrapper.style.left = `${initialPosition.left}px`;
            }
            if (initialPosition.width !== undefined) {
                heatmapWrapper.style.width = `${initialPosition.width}px`;
            }
            if (initialPosition.height !== undefined) {
                heatmapWrapper.style.height = `${initialPosition.height}px`;
            }
            
            return true;
        }
        
        // 2. Sinon, utiliser les dimensions et positions sauvegardées (comportement original)
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


console.log('\n\n\n - ***** debug resize Map ********* \n\n\n ')


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
            // const newWidth = Math.min(wrapperRect.width, windowWidth - 40);
            const newWidth = Math.min(wrapperRect.width, windowWidth - 2);
            // const newHeight = Math.min(wrapperRect.height, windowHeight - 100);
            const newHeight = Math.min(wrapperRect.height, windowHeight - 5);

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
    window.addEventListener('resize', debounce(() => {
        console.log('\n\n*** debug resize in window.addEventListener in createImprovedHeatmap in geoHeatMapUI.js \n\n')            
        window._resizeHeatmapListener();
    }, 150)); // Attend 150ms après le dernier resize
    window.addEventListener('orientationchange', debounce(() => {
        setTimeout(() => {
            console.log('\n\n*** debug orientationchange in window.addEventListener in createImprovedHeatmap in geoHeatMapUI.js \n\n')            
            window._resizeHeatmapListener();
        }, 300);
    }, 150)); // Attend 150ms après le dernier resize

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
    // dragHandle.title = 'Déplacer la carte';
    dragHandle.title = getUITranslation('moveMap');

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
    // resizeHandle.title = 'Redimensionner la carte';
    resizeHandle.title = getUITranslation('resizeMap');

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
        initializeLeafletMap(heatmapWrapper, mapContainer, locationData, restoreOriginalZindexes, heatmapTitle, isFromTree);
    }, 100); // Petit délai pour s'assurer que le DOM est prêt

    // Stocker la référence du wrapper
    nameCloudState.heatmapWrapper = heatmapWrapper;

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
function initializeLeafletMap(heatmapWrapper, mapContainer, locationData, restoreOriginalZindexes, heatmapTitle, isFromTree = false) {
    console.log('=== DEBUT initializeLeafletMap ===');
    console.log('window.heatLayer existe ?', !!window.heatLayer);
    console.log('heatmapWrapper.map existe ?', !!heatmapWrapper.map);
    console.log('Nombre de coordonnées:', locationData?.length);
    try {
        // Vérifier si un conteneur de carte existe déjà
        if (mapContainer._leaflet_id) {
            console.log("Un conteneur de carte existe déjà, nettoyage en cours...");
            
            // Si une carte existe déjà dans ce conteneur, la supprimer
            if (heatmapWrapper.map) {
                // AJOUT: Effacer immédiatement l'ancienne heatmap
                if (window.heatLayer) {
                    // window.heatLayer.setLatLngs([]);
                    heatmapWrapper.map.removeLayer(window.heatLayer);
                    window.heatLayer = null;
                }
                heatmapWrapper.map.remove();
                heatmapWrapper.map = null;
            }
            
            // Réinitialiser l'ID Leaflet du conteneur
            delete mapContainer._leaflet_id;
        }

        // AJOUT: Au cas où il y aurait un layer orphelin
        if (window.heatLayer) {
            window.heatLayer = null;
        }
        

        // Maintenant, créer la carte
        const map = L.map('ancestors-heatmap').setView([46.2276, 2.2137], 6); // Vue centrée sur la France


        // Utiliser la couche de tuiles en cache si l'option est activée
        const useLocalTiles = true; // Vous pouvez rendre cela configurable si nécessaire
        if (useLocalTiles) {
            createCachedTileLayer({
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);
        } else {
            // Fallback au comportement d'origine
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);
        }


        // Vérifier que nous avons des données valides
        if (!locationData || !Array.isArray(locationData) || locationData.length === 0) {
            // console.error('Données de heatmap invalides:', locationData);
            console.error(getUITranslation('invalidHeatmapData'), locationData);

            // return;
        }

        // Collecter les coordonnées valides
        const coordinates = locationData
            .filter(loc => loc.coords && typeof loc.coords.lat === 'number' && typeof loc.coords.lon === 'number')
            .map(loc => [loc.coords.lat, loc.coords.lon]);

        // Vérifier qu'il y a des coordonnées valides
        if (coordinates.length === 0) {
            // console.error('Aucune coordonnée valide trouvée dans les données');
            console.error(getUITranslation('noValidCoordinates'));
            // return;
        }


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
                // CAS SPÉCIAL: Un seul lieu
                if (coordinates.length === 1) {
                    const [lat, lon] = coordinates[0];
                    map.setView([lat, lon], 8); // Zoom 8 pour voir la région
                    
                    // Créer la heatmap après positionnement
                    setTimeout(() => {
                        const heat = L.heatLayer(
                            coordinates.map(coords => [...coords, 1]), 
                            { radius: 25, blur: 15, maxZoom: 1 }
                        ).addTo(map);
                        window.heatLayer = heat;
                    }, 100);
                    
                    return; // Sortir de la fonction, pas besoin de bounds
                }

                // CAS NORMAL: Plusieurs lieux
                const bounds = L.latLngBounds(coordinates);
                if (bounds.isValid()) {
                    // Calculer le niveau de zoom idéal pour ces limites
                    const idealZoom = map.getBoundsZoom(bounds, false, [50, 50]);
                    
                    // Limiter le zoom maximum à 7 (≈ 100-150km de rayon)
                    // Plus le chiffre est petit, plus la vue est éloignée
                    const maxAllowedZoom = 9;
                    const finalZoom = Math.min(idealZoom, maxAllowedZoom);
                    
                    console.log(`Zoom calculé: ${idealZoom}, limité à: ${finalZoom}`);
                    
                    // Si on a dû limiter le zoom, utiliser le centre des limites
                    if (finalZoom < idealZoom) {
                        const center = bounds.getCenter();
                        map.setView(center, finalZoom);

                        // AJOUT: Créer la heatmap APRÈS setView
                        setTimeout(() => {
                            const heat = L.heatLayer(
                                coordinates.map(coords => [...coords, 1]), 
                                { radius: 25, blur: 15, maxZoom: 1 }
                            ).addTo(map);
                            window.heatLayer = heat;
                        }, 100);


                    } else {
                        // console.log('\n\n debug in initializeLeafletMap (finalZoom < idealZoom) ', (finalZoom < idealZoom) )   
                        // Forcer un recalcul complet avec double invalidation pour mobile
                        map.invalidateSize();
                        
                        // Attendre que la carte soit prête ET que le DOM soit stabilisé
                        setTimeout(() => {
                            map.invalidateSize(true); // Force hard reset
                            
                            if (bounds.isValid()) {
                                // Utiliser flyToBounds au lieu de fitBounds pour une transition plus fluide
                                map.flyToBounds(bounds, {
                                    padding: [50, 50],
                                    maxZoom: maxAllowedZoom,
                                    duration: 0.5 // Animation rapide
                                });
                            }

                            // AJOUT: Créer la heatmap APRÈS flyToBounds
                            setTimeout(() => {
                                const heat = L.heatLayer(
                                    coordinates.map(coords => [...coords, 1]), 
                                    { radius: 25, blur: 15, maxZoom: 1 }
                                ).addTo(map);
                                window.heatLayer = heat;
                            }, 600); // 500ms du flyToBounds + 100ms de marge

                        }, 500); // Délai augmenté pour mobile
                    }

                }
            }
        } catch (error) {
            console.error('Erreur lors de l\'ajustement de la vue:', error);
            alert(getUITranslation('mapInitError'));
        }


        // if (!isFromTree) {

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
                

                // Nettoyer la heatmap avant de supprimer le wrapper
                if (window.heatLayer && heatmapWrapper.map) {
                    heatmapWrapper.map.removeLayer(window.heatLayer);
                    window.heatLayer = null;
                }


                // Supprimer la heatmap

                if (heatmapWrapper && document.body.contains(heatmapWrapper)) {
                    document.body.removeChild(heatmapWrapper);
                }
            });
        // }


        // Créer le titre intégré à la carte (toujours visible)
        // createMapTitle(mapContainer, heatmapTitle);

        //    mapTitle.textContent = heatmapTitle.replace(/^Heatmap\s*-\s*/, '');




        //*******************
        const existingTitle = heatmapWrapper.querySelector('.individual-map-title');
        // console.log("\n\n\n *********** :) Existing title ******* :", existingTitle);
        if (existingTitle) { existingTitle.remove(); }
        // addMapTitle(mapContainer, heatmapTitle);
        addMapTitle(heatmapWrapper, heatmapTitle);
        //***************************



        // Créer les contrôles de carte
        createMapControls(mapContainer, heatmapWrapper, isFromTree);

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
 * Fonction simple pour rafraîchir les données d'une carte existante
 * Réutilise directement initializeLeafletMap en préservant la vue actuelle
 * 
 * @param {HTMLElement} heatmapWrapper - Wrapper de la heatmap existante
 * @param {Array} newLocationData - Nouvelles données de localisation
 */
function refreshMapData(heatmapWrapper, newLocationData, isFromTree = false) {
    try {
        const map = heatmapWrapper.map;
        if (!map) {
            console.error("Aucune carte trouvée dans le wrapper");
            return;
        }

        console.log("Rafraîchissement des données avec", newLocationData.length, "nouveaux points");

        // Sauvegarder la vue actuelle (centre et zoom)
        const currentCenter = map.getCenter();
        const currentZoom = map.getZoom();
        console.log(`Sauvegarde de la vue actuelle: centre=${currentCenter.lat}, ${currentCenter.lng}, zoom=${currentZoom}`);

        // Trouver le conteneur de carte
        const mapContainer = heatmapWrapper.querySelector('#ancestors-heatmap');
        if (!mapContainer) {
            console.error("Conteneur de carte non trouvé");
            return;
        }

        // Créer une fonction de restauration qui préserve la vue au lieu de fitBounds
        const restoreOriginalZindexes = () => {
            document.querySelectorAll('[data-original-z-index]').forEach(el => {
                el.style.zIndex = el.dataset.originalZIndex;
                delete el.dataset.originalZIndex;
            });
        };

        // Obtenir le titre actuel
        const currentTitle = heatmapWrapper.querySelector('.map-title')?.textContent || 
                           heatmapWrapper.querySelector('.title-text')?.textContent || '';

        // Réutiliser directement votre fonction existante
        initializeLeafletMap(heatmapWrapper, mapContainer, newLocationData, restoreOriginalZindexes, currentTitle, isFromTree);

        // Restaurer la vue après un court délai pour laisser la carte s'initialiser
        setTimeout(() => {
            if (heatmapWrapper.map) {
                console.log(`Restauration de la vue: centre=${currentCenter.lat}, ${currentCenter.lng}, zoom=${currentZoom}`);
                heatmapWrapper.map.setView(currentCenter, currentZoom, { animate: false });
            }
        }, 100);

        console.log("Données de la carte mises à jour avec succès");

    } catch (error) {
        console.error("Erreur lors du rafraîchissement des données:", error);
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
                <h3 style="margin: 0;">${getUITranslation('pointDetails')}</h3>
                <button id="close-details" style="background: none; border: none; font-size: 16px; cursor: pointer;">✖</button>
            </div>
            <p><strong>${getUITranslation('place')} :</strong> ${location.placeName || getUITranslation('placeNotSpecified')}</p>
            <p><strong>${getUITranslation('totalOccurrences')} :</strong> ${location.count}</p>
        `;
    
        if (location.families && Object.keys(location.families).length > 0) {
            details += `<h4>${getUITranslation('familyNames')} (${Object.keys(location.families).length}):</h4>
            <div style="max-height: 150px; overflow-y: auto; border: 1px solid #eee; padding: 5px; margin-bottom: 10px;">
                <ul style="margin: 0; padding-left: 20px;">`;
            
            // Trier les noms de famille par nombre d'occurrences
            const sortedFamilies = Object.entries(location.families)
                .sort((a, b) => b[1] - a[1]);
    
            // Afficher tous les noms de famille
            sortedFamilies.forEach(([family, count]) => {
                const occurrenceText = getPlural(count, 'occurrence', 'occurrences');
                details += `<li>${family}: ${count} ${occurrenceText}</li>`;
            });
            
            details += `</ul></div>`;
        }
    
        if (location.locations && location.locations.length > 0) {
            details += `<h4>${getUITranslation('people')} (${location.locations.length}):</h4>
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
                // Traduire le type d'événement
                const translatedType = getTranslatedEventType(person.type);
                details += `<li>${person.name} (${translatedType}${person.year && person.year !== 'N/A' ? ` - ${person.year}` : ''})</li>`;
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
    let mapTitle = document.getElementById('heatmap-map-title');
    
    if (!mapTitle) {
        mapTitle = document.createElement('div');
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
        mapContainer.appendChild(mapTitle);
    }

    mapTitle.textContent = heatmapTitle.replace(/^Heatmap\s*-\s*/, '');
}


/**
 * Crée les contrôles de la carte (boutons de rafraîchissement et fermeture)
 * 
 * @param {HTMLElement} mapContainer - Conteneur de la carte
 * @param {HTMLElement} heatmapWrapper - Conteneur principal de la heatmap
 */
function createMapControls(mapContainer, heatmapWrapper, isFromTree) {
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
    // refreshBtn.title = 'Rafraîchir la heatmap';
    refreshBtn.title = getUITranslation('refreshHeatmap');
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
    closeBtn.title = getUITranslation('closeHeatmap');

    Object.assign(closeBtn.style, {
    width: '32px',               // plus grand, plus facile à viser
    height: '32px',
    padding: '0',
    border: 'none',
    borderRadius: '50%',         // bouton rond, plus élégant
    backgroundColor: '#f5f5f5',
    color: '#333',
    fontSize: '18px',            // icône plus visible
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '-6px',
    marginRight: '-6px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
    transition: 'all 0.2s ease',
    touchAction: 'manipulation', // évite les zooms parasites sur mobile
    });


    // Effet de survol / toucher
    closeBtn.addEventListener('mouseenter', () => {
    closeBtn.style.backgroundColor = '#ffdddd';
    closeBtn.style.transform = 'scale(1.1)';
    });
    closeBtn.addEventListener('mouseleave', () => {
    closeBtn.style.backgroundColor = '#f5f5f5';
    closeBtn.style.transform = 'scale(1)';
    });

    // Effet au toucher mobile
    closeBtn.addEventListener('touchstart', () => {
    closeBtn.style.backgroundColor = '#ffcccc';
    closeBtn.style.transform = 'scale(1.1)';
    }, { passive: true });
    closeBtn.addEventListener('touchend', () => {
    closeBtn.style.backgroundColor = '#f5f5f5';
    closeBtn.style.transform = 'scale(1)';
    }, { passive: true });


    // Ajouter les écouteurs d'événements
    refreshBtn.addEventListener('click', () => {
        if(!isFromTree) 
        {
            if (typeof refreshHeatmap === 'function') {
                refreshHeatmap();
            }
        } else {
            console.log('-debug call to displayHeatMap from createMapControls');
            displayHeatMap(null, false);
        }
    });
    
    closeBtn.addEventListener('click', () => {
        const wrapper = document.getElementById('namecloud-heatmap-wrapper');
        if (wrapper) {
            nameCloudState.isHeatmapVisible = false;
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

/**
 * Met à jour les données de la heatmap existante avec désactivation temporaire des événements
 * pour éviter la cascade de re-déclenchement
 * 
 * @param {Array} newLocationData - Nouvelles données de localisation
 * @param {String} newTitle - Nouveau titre (optionnel)
 * @returns {Promise<boolean>} - true si la mise à jour a réussi, false sinon
 */
export function updateHeatmapData(newLocationData, newTitle = null) {
    return new Promise((resolve) => {
        // Vérifier qu'une heatmap existe
        const heatmapWrapper = document.getElementById('namecloud-heatmap-wrapper');
        if (!heatmapWrapper || !heatmapWrapper.map) {
            console.warn('Aucune heatmap existante trouvée');
            resolve(false);
            return;
        }

        const map = heatmapWrapper.map;
        
        try {
            // 🔥 DÉSACTIVER TEMPORAIREMENT TOUS LES ÉVÉNEMENTS LEAFLET
            const originalEvents = map._events ? { ...map._events } : {};
            map._events = {}; // Couper tous les événements
            
            console.log('🚫 Événements Leaflet désactivés temporairement');

            // 1. Supprimer SEULEMENT les couches de données (pas les tuiles)
            map.eachLayer((layer) => {
                if (!(layer instanceof L.TileLayer)) {
                    map.removeLayer(layer);
                }
            });

            // 2. Tempo pour s'assurer que la suppression est terminée
            setTimeout(() => {
                try {
                    // 3. Vérifier les données (COPIÉ de createImprovedHeatmap)
                    if (!newLocationData || !Array.isArray(newLocationData) || newLocationData.length === 0) {
                        console.error(getUITranslation('invalidHeatmapData'), newLocationData);
                        // Réactiver les événements avant de partir
                        map._events = originalEvents;
                        resolve(false);
                        return;
                    }

                    // 4. Collecter les coordonnées valides (COPIÉ de createImprovedHeatmap)
                    const coordinates = newLocationData
                        .filter(loc => loc.coords && typeof loc.coords.lat === 'number' && typeof loc.coords.lon === 'number')
                        .map(loc => [loc.coords.lat, loc.coords.lon]);

                    if (coordinates.length === 0) {
                        console.error(getUITranslation('noValidCoordinates'));
                        // Réactiver les événements avant de partir
                        map._events = originalEvents;
                        resolve(false);
                        return;
                    }

                    // 5. Créer la couche de chaleur (COPIÉ de createImprovedHeatmap)
                    const heat = L.heatLayer(
                        coordinates.map(coords => [...coords, 1]), 
                        {
                            radius: 25,
                            blur: 15,
                            maxZoom: 1,
                        }
                    ).addTo(map);

                    // 6. Ajouter des marqueurs interactifs (COPIÉ de createImprovedHeatmap)
                    newLocationData.forEach(location => {
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

                        // Récupérer le conteneur de détails existant
                        let detailsContainer = heatmapWrapper.querySelector('#heatmap-details');
                        if (!detailsContainer) {
                            detailsContainer = createDetailsContainer(heatmapWrapper);
                        }
                        
                        configureMarkerInteractions(marker, detailsContainer, location);
                    });

                    // 7. Tempo pour s'assurer que les marqueurs sont ajoutés
                    setTimeout(() => {
                        try {
                            // 8. Ajuster la vue EXACTEMENT comme dans createImprovedHeatmap
                            // MAIS SANS ANIMATION pour éviter les événements
                            if (coordinates.length > 0) {
                                const bounds = L.latLngBounds(coordinates);
                                if (bounds.isValid()) {
                                    // Calculer le niveau de zoom idéal pour ces limites
                                    const idealZoom = map.getBoundsZoom(bounds, false, [50, 50]);
                                    
                                    // Limiter le zoom maximum à 9 (≈ 100-150km de rayon)
                                    const maxAllowedZoom = 9;
                                    const finalZoom = Math.min(idealZoom, maxAllowedZoom);
                                    
                                    console.log(`Zoom calculé: ${idealZoom}, limité à : ${finalZoom}`);
                                    
                                    // Si on a dû limiter le zoom, utiliser le centre des limites
                                    if (finalZoom < idealZoom) {
                                        const center = bounds.getCenter();
                                        map.setView(center, finalZoom, { animate: false }); // SANS ANIMATION
                                    } else {
                                        // Sinon, utiliser fitBounds classique SANS ANIMATION
                                        map.fitBounds(bounds, {
                                            padding: [50, 50],
                                            maxZoom: maxAllowedZoom,
                                            animate: false // SANS ANIMATION
                                        });
                                    }
                                }
                            }

                            // 9. Mettre à jour le titre si fourni
                            if (newTitle) {
                                const titleText = heatmapWrapper.querySelector('.title-text');
                                if (titleText) {
                                    titleText.textContent = newTitle;
                                }
                                
                                const mapTitle = heatmapWrapper.querySelector('#heatmap-map-title');
                                if (mapTitle) {
                                    mapTitle.textContent = newTitle.replace(/^Heatmap\s*-\s*/, '');
                                }
                            }

                            // 10. Tempo finale pour s'assurer que tout est terminé PUIS réactiver les événements
                            setTimeout(() => {
                                // 🔥 RÉACTIVER LES ÉVÉNEMENTS LEAFLET
                                map._events = originalEvents;
                                console.log('✅ Événements Leaflet réactivés');
                                
                                // Invalider la taille de la carte pour le rafraîchissement final
                                map.invalidateSize();
                                
                                console.log(`Données de heatmap mises à jour: ${newLocationData.length} éléments`);
                                resolve(true);
                            }, 100);

                        } catch (error) {
                            console.error('Erreur lors de l\'ajustement de la vue:', error);
                            // Réactiver les événements même en cas d'erreur
                            map._events = originalEvents;
                            resolve(false);
                        }
                    }, 50); // Tempo après ajout des marqueurs

                } catch (error) {
                    console.error('Erreur lors de l\'ajout des données:', error);
                    // Réactiver les événements même en cas d'erreur
                    map._events = originalEvents;
                    resolve(false);
                }
            }, 50); // Tempo après suppression des couches

        } catch (error) {
            console.error('Erreur lors de la mise à jour des données:', error);
            // Réactiver les événements même en cas d'erreur
            if (map._events !== undefined) {
                map._events = originalEvents;
            }
            resolve(false);
        }
    });
}





