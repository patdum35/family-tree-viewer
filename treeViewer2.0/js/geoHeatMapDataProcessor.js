import { state , getPersonsFromTCurrenTree } from './main.js';
import { nameCloudState, getPersonsFromTree, processPersonData, filterPeopleByText } from './nameCloud.js';
import { geocodeLocation } from './geoLocalisation.js';
import { saveHeatmapPosition } from './geoHeatMapInteractions.js';
import { createImprovedHeatmap, displayHeatMap } from './geoHeatMapUI.js';


/**
 * Fonction de traduction spécifique pour geoHeatMapDataProcessor.js
 */
function getHeatmapTranslation(key) {
    const translations = {
      'fr': {
        // Textes des notifications et loading
        'updatingHeatmap': 'Mise à jour de la heatmap...',
        'updatingHeatmapFor': 'Mise à jour de la heatmap pour "{0}"...',
        'noGeoDataForFilters': 'Aucune donnée géographique disponible pour les filtres actuels',
        'noGeoDataForSelected': 'Aucune donnée géographique pour les personnes sélectionnées',
        'heatmapUpdateError': 'Erreur lors de la mise à jour de la heatmap: {0}',
        
        // Textes pour les titres de heatmap
        'placesFor': 'Lieux pour {0}',
        'heatmapTitle': 'Heatmap - "{0}" ({1} personnes)',
        'heatmapTitleShort': '{0} ({1})',
        
        // Types d'événements
        'birth': 'Naissance',
        'death': 'Décès',
        'residence': 'Résidence',
        'marriage': 'Mariage',
        'place': 'Lieu',
        
        // Patterns pour l'extraction de texte
        'patternFirstNameLastName': 'avec le (?:prénom|nom) "([^"]+)"',
        'patternOccupation': 'avec la profession "([^"]+)"',
        'patternLifespan': 'ayant vécu (\\d+) ans',
        'patternProcreationAge': 'ayant eu un enfant à (\\d+) ans',
        'patternPlace': 'ayant un lien avec le lieu ([^(]+)'
      },
      'en': {
        // Textes des notifications et loading
        'updatingHeatmap': 'Updating heatmap...',
        'updatingHeatmapFor': 'Updating heatmap for "{0}"...',
        'noGeoDataForFilters': 'No geographic data available for current filters',
        'noGeoDataForSelected': 'No geographic data for selected people',
        'heatmapUpdateError': 'Error updating heatmap: {0}',
        
        // Textes pour les titres de heatmap
        'placesFor': 'Places for {0}',
        'heatmapTitle': 'Heatmap - "{0}" ({1} people)',
        'heatmapTitleShort': '{0} ({1})',
        
        // Types d'événements
        'birth': 'Birth',
        'death': 'Death',
        'residence': 'Residence',
        'marriage': 'Marriage',
        'place': 'Place',
        
        // Patterns pour l'extraction de texte
        'patternFirstNameLastName': 'with (?:first|last) name "([^"]+)"',
        'patternOccupation': 'with occupation "([^"]+)"',
        'patternLifespan': 'who lived for (\\d+) years',
        'patternProcreationAge': 'who had a child at (\\d+) years old',
        'patternPlace': 'connected to the place ([^(]+)'
      },
      'es': {
        // Textes des notifications et loading
        'updatingHeatmap': 'Actualizando mapa de calor...',
        'updatingHeatmapFor': 'Actualizando mapa de calor para "{0}"...',
        'noGeoDataForFilters': 'No hay datos geográficos disponibles para los filtros actuales',
        'noGeoDataForSelected': 'No hay datos geográficos para las personas seleccionadas',
        'heatmapUpdateError': 'Error al actualizar el mapa de calor: {0}',
        
        // Textes pour les titres de heatmap
        'placesFor': 'Lugares para {0}',
        'heatmapTitle': 'Mapa de calor - "{0}" ({1} personas)',
        'heatmapTitleShort': '{0} ({1})',
        
        // Types d'événements
        'birth': 'Nacimiento',
        'death': 'Fallecimiento',
        'residence': 'Residencia',
        'marriage': 'Matrimonio',
        'place': 'Lugar',
        
        // Patterns pour l'extraction de texte
        'patternFirstNameLastName': 'con (?:nombre|apellido) "([^"]+)"',
        'patternOccupation': 'con profesión "([^"]+)"',
        'patternLifespan': 'que vivieron (\\d+) años',
        'patternProcreationAge': 'que tuvieron un hijo a los (\\d+) años',
        'patternPlace': 'relacionadas con el lugar ([^(]+)'
      },
      'hu': {
        // Textes des notifications et loading
        'updatingHeatmap': 'Hőtérkép frissítése...',
        'updatingHeatmapFor': 'Hőtérkép frissítése "{0}"...',
        'noGeoDataForFilters': 'Nincs földrajzi adat az aktuális szűrőkhöz',
        'noGeoDataForSelected': 'Nincs földrajzi adat a kiválasztott személyekhez',
        'heatmapUpdateError': 'Hiba a hőtérkép frissítésekor: {0}',
        
        // Textes pour les titres de heatmap
        'placesFor': 'Helyek ehhez: {0}',
        'heatmapTitle': 'Hőtérkép - "{0}" ({1} személy)',
        'heatmapTitleShort': '{0} ({1})',
        
        // Types d'événements
        'birth': 'Születés',
        'death': 'Halál',
        'residence': 'Lakóhely',
        'marriage': 'Házasság',
        'place': 'Hely',
        
        // Patterns pour l'extraction de texte
        'patternFirstNameLastName': '(?:keresztnév|vezetéknév) "([^"]+)"',
        'patternOccupation': 'foglalkozás "([^"]+)"',
        'patternLifespan': '(\\d+) évig éltek',
        'patternProcreationAge': '(\\d+) évesen gyermeket vállalt',
        'patternPlace': 'kapcsolódva a helyhez ([^(]+)'
      }
    };
  
    // Récupérer la langue actuelle
    const currentLang = window.CURRENT_LANGUAGE || 'fr';
    
    // Obtenir la traduction dans la langue actuelle ou en français par défaut
    const translation = translations[currentLang]?.[key] || translations['fr'][key];
    
    // S'il y a des arguments supplémentaires, les insérer dans la chaîne
    if (arguments.length > 1) {
      return translation.replace(/\{(\d+)\}/g, (match, index) => {
        const argIndex = parseInt(index, 10) + 1;
        return argIndex < arguments.length ? arguments[argIndex] : match;
      });
    }
    
    return translation;
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
    return getHeatmapTranslation(key);
  }
  
  /**
   * Fonction pour extraire le texte de recherche en fonction de la langue courante
   * @param {string} titleText - Texte du titre
   * @returns {string|null} - Texte de recherche extrait ou null si aucune correspondance
   */
  function extractSearchTextFromTitle(titleText) {
    // Liste des patterns à essayer, dans l'ordre
    const patterns = [
      getHeatmapTranslation('patternFirstNameLastName'),
      getHeatmapTranslation('patternOccupation'),
      getHeatmapTranslation('patternLifespan'),
      getHeatmapTranslation('patternProcreationAge'),
      getHeatmapTranslation('patternPlace')
    ];
    
    // Essayer chaque pattern jusqu'à trouver une correspondance
    for (const pattern of patterns) {
      const regex = new RegExp(pattern);
      const match = titleText.match(regex);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return null;
  }




/**
 * Rafraîchit la heatmap avec les données actuelles
 * Si une liste de personnes est visible, utilise uniquement ces personnes
 */
export async function refreshHeatmap(isFromTree = false) {
   console.log('refreshHeatmap appelée depuis:', new Error().stack);


    if (isFromTree) {
        console.log('-debug call to displayHeatMap from refreshHeatmap');
        displayHeatMap(null, false);
        return; // Si on vient de la carte 
    }

    // Si aucune heatmap n'est affichée, ne rien faire
    const heatmapWrapper = document.getElementById('namecloud-heatmap-wrapper');
    if (!heatmapWrapper) return;

    // Sauvegarder la position et taille actuelles avant de fermer
    saveHeatmapPosition();
    
     // Afficher un indicateur de chargement
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'heatmap-loading-overlay';
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
    loadingOverlay.innerHTML = '<div style="text-align: center;"><p>Mise à jour de la heatmap...</p><progress style="width: 200px;"></progress></div>';
    
    // Remplacer l'overlay existant s'il y en a un
    const existingOverlay = document.getElementById('heatmap-loading-overlay');
    if (existingOverlay) existingOverlay.remove();
    
    heatmapWrapper.appendChild(loadingOverlay);
    
    try {
        // MODIFICATION: Vérifier si une liste de personnes est actuellement affichée
        const personListModal = document.querySelector('.person-list-modal');
        let heatmapData;
        
        if (personListModal) {
            // Si une liste est affichée, utiliser uniquement ces personnes
            console.log("Liste de personnes détectée, création d'une heatmap filtrée");
            
            // Extraire le texte de recherche du titre
            const titleElement = personListModal.querySelector('h2');
            let searchText = null;
            
            if (titleElement) {
                const titleText = titleElement.textContent;
                
                // Essayer d'extraire le terme de recherche du titre
                let match = null;
                
                // Pattern pour prénom/nom: "Personnes avec le prénom/nom "X" (Y personnes)"
                match = titleText.match(/avec le (?:prénom|nom) "([^"]+)"/);
                if (match && match[1]) {
                    searchText = match[1];
                }
                
                // Pattern pour métier: "Personnes avec la profession "X" (Y personnes)"
                if (!searchText) {
                    match = titleText.match(/avec la profession "([^"]+)"/);
                    if (match && match[1]) {
                        searchText = match[1];
                    }
                }
                
                // Pattern pour durée de vie: "Personnes ayant vécu X ans (Y personnes)"
                if (!searchText) {
                    match = titleText.match(/ayant vécu (\d+) ans/);
                    if (match && match[1]) {
                        searchText = match[1];
                    }
                }
                
                // Pattern pour âge de procréation: "Personnes ayant eu un enfant à X ans (Y personnes)"
                if (!searchText) {
                    match = titleText.match(/ayant eu un enfant à (\d+) ans/);
                    if (match && match[1]) {
                        searchText = match[1];
                    }
                }
                
                // Pattern pour lieux: "Personnes ayant un lien avec le lieu X (Y personnes)"
                if (!searchText) {
                    match = titleText.match(/ayant un lien avec le lieu ([^(]+)/);
                    if (match && match[1]) {
                        searchText = match[1].trim();
                    }
                }
            }
            
            if (searchText && nameCloudState.currentConfig) {
                console.log(`Texte de recherche extrait: "${searchText}"`);
                // Utiliser directement le filtre de personnes existant
                const filteredPeople = filterPeopleByText(searchText, nameCloudState.currentConfig);
                console.log(`Nombre de personnes filtrées: ${filteredPeople.length}`);
                
                if (filteredPeople.length > 0) {
                    // Importer createHeatmapDataForPeople s'il n'est pas déjà disponible
                    if (typeof createHeatmapDataForPeople === 'function') {
                        heatmapData = await createHeatmapDataForPeople(filteredPeople);
                    } else {
                        // Fallback: utiliser la fonction standard
                        heatmapData = await createDataForHeatMap(nameCloudState.currentConfig);
                    }
                    
                    // Mettre à jour le titre de la heatmap
                    const titleUpdated = `Lieux pour ${titleElement.textContent.replace(/\([^)]*\)/, '').trim()}`;
                    
                    // Fermer la heatmap actuelle
                    const closeButton = document.getElementById('heatmap-close');
                    if (closeButton) closeButton.click();
                    
                    // Un petit délai pour laisser la fermeture se terminer
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                    // Créer la nouvelle heatmap avec les données filtrées
                    createImprovedHeatmap(heatmapData, titleUpdated);
                    
                    // Retirer l'overlay de chargement
                    if (loadingOverlay.parentNode) {
                        loadingOverlay.remove();
                    }
                    
                    // Ajuster la disposition pour le mode écran partagé

                    if (personListModal) {
                        adjustSplitScreenLayout(personListModal);
                    }
                    
                    return; // Arrêter ici car nous avons déjà tout géré
                } else {
                    // NOUVEAU: Protection quand la liste est vide
                    console.warn("La liste de personnes filtrées est vide");
                    
                    // Afficher un message à l'utilisateur
                    const notification = document.createElement('div');
                    notification.textContent = 'Aucune donnée géographique disponible pour les filtres actuels';
                    notification.style.position = 'fixed';
                    notification.style.top = '20px';
                    notification.style.left = '50%';
                    notification.style.transform = 'translateX(-50%)';
                    notification.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                    notification.style.color = 'white';
                    notification.style.padding = '10px 20px';
                    notification.style.borderRadius = '5px';
                    notification.style.zIndex = '10000';
                    document.body.appendChild(notification);
                    
                    // Faire disparaître la notification après 3 secondes
                    setTimeout(() => {
                        notification.style.transition = 'opacity 1s';
                        notification.style.opacity = '0';
                        setTimeout(() => {
                            if (document.body.contains(notification)) {
                                document.body.removeChild(notification);
                            }
                        }, 1000);
                    }, 3000);
                    
                    // Procéder avec la méthode standard (toutes les personnes)
                    // pour éviter d'avoir une carte vide
                    heatmapData = await createDataForHeatMap(nameCloudState.currentConfig);
                }





                
            }
        }
        
        // Si nous sommes ici, c'est qu'il n'y a pas de liste ou que nous n'avons pas pu filtrer
        // Continuer avec le comportement normal
        
        // Fermer la heatmap actuelle
        const closeButton = document.getElementById('heatmap-close');
        console.log("\n\ : DEBUG: if (closeButton) closeButton.click(), isFromTree=", isFromTree);

        if (closeButton) closeButton.click();
        
        // Un petit délai pour laisser la fermeture se terminer
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Simuler un clic sur le bouton de carte pour générer une nouvelle heatmap
        // avec les filtres actuels
        const mapButton = document.querySelector('[title="Afficher la heatmap"]');
        if (mapButton) mapButton.click();

        // Créer et dispatcher un événement personnalisé
        const refreshListEvent = new CustomEvent('refreshPersonList', {
            detail: {
                config: nameCloudState.currentConfig,
                timestamp: Date.now()
            }
        });
        
        document.dispatchEvent(refreshListEvent);
        
    } catch (error) {
        console.error('Erreur lors du rafraîchissement de la heatmap:', error);
        if (document.contains(loadingOverlay)) loadingOverlay.remove();
        alert(`Erreur lors de la mise à jour de la heatmap: ${error.message}`);
    }
}







/**
 * Créer les données de heatmap pour un ensemble spécifique de personnes
 * @param {Array} people - Liste des personnes avec leurs IDs
 * @returns {Promise<Array>} - Données formatées pour la heatmap
 */
export async function createHeatmapDataForPeople(people) {
    try {

        // Récupérer les personnes complètes à partir de leurs IDs
        const selectedPersons = people.map(p => state.gedcomData.individuals[p.id])
            .filter(p => p !== undefined);
        
        // NOUVEAU: Protection contre une liste vide
        if (!selectedPersons || selectedPersons.length === 0) {
            console.warn("Aucune personne valide dans la liste fournie");
            
            // Retourner un tableau vide, la fonction appelante pourra décider quoi faire
            return [];
        }
        
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
                // locationDetails[place].events.push({
                //     type: type,
                //     name: person.name.replace(/\//g, '').trim(),
                //     year: year
                // });

                // Utiliser la traduction pour le type d'événement
                const translatedType = getTranslatedEventType(type);

                // Ajouter l'événement
                locationDetails[place].events.push({
                    type: translatedType,
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
                            type: getHeatmapTranslation('place'), //'Lieu',
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



/**
 * Crée les données pour la heatmap en utilisant les mêmes personnes et filtres que la CloudMap
 * 
 * @param {Object} config - Configuration contenant type, startDate, endDate, scope, rootPersonId
 * @returns {Promise<Array>} - Données formatées pour la heatmap
 */
export async function createDataForHeatMap(config, isFromCurrentTree = false, currentSearchResults = null) {
    
    console.log('\n\n - debug : call to createDataForHeatMap',  config, isFromCurrentTree);    
    try {
        // Configuration pour extraire les lieux
        const locationConfig = {
            ...config,
            type: 'lieux' // Forcer le type à 'lieux' pour extraire tous les lieux
        };
        
        // Obtenir les personnes selon le même filtrage que la CloudMap

        let persons;
        if (currentSearchResults) {
            persons = currentSearchResults;
        } else if (!isFromCurrentTree) {
            persons = getPersonsFromTree(locationConfig.scope, locationConfig.rootPersonId);
        } else {
            persons = getPersonsFromTCurrenTree();
        }

        // Collecter tous les lieux non nettoyés
        const locationData = {};
        const originalName = {};
        const stats = { inPeriod: 0 }; // Stats minimal

        // console.log('\n\n -debug  personnes à traiter pour la heatmap:', persons);
        
        // Traiter chaque personne pour extraire ses lieux sans nettoyage
        persons.forEach(person => {
            if (person != undefined) {
                // console.log('-debug processing person ID:', person, person.id);
                processPersonData(person, locationConfig, locationData, stats, { doNotClean: true }, originalName);
            }
        });
        
        // Créer une structure pour stocker les informations détaillées par lieu
        const locationDetails = {};
        
        // Collecter les détails des lieux pour chaque personne
        for (const person of persons) {
            if (person != undefined) {
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
                            // type: 'Lieu',
                            type: getHeatmapTranslation('place'),
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
        const result = Object.values(heatmapData);
        console.log(`Données de heatmap générées: ${result.length} lieux géolocalisés`);
        
        return result;
    } catch (error) {
        console.error('Erreur lors de la création des données pour la heatmap:', error);
        throw error;
    }
}

/**
 * Met à jour la heatmap avec les lieux des personnes sélectionnées
 * @param {string} text - Le texte sélectionné dans le nuage
 * @param {Array} people - Liste des personnes correspondant à ce texte
 */
export async function updateHeatmapIfVisible(text, people) {
    // Vérifier si une heatmap est actuellement affichée
    const heatmapWrapper = document.getElementById('namecloud-heatmap-wrapper');
    if (!heatmapWrapper) return; // Si pas de heatmap, ne rien faire
    
    // Afficher un indicateur de chargement
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'heatmap-loading-overlay';
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
    loadingOverlay.innerHTML = `<div style="text-align: center;"><p>Mise à jour de la heatmap pour "${text}"...</p><progress style="width: 200px;"></progress></div>`;
    
    // Remplacer l'overlay existant s'il y en a un
    const existingOverlay = document.getElementById('heatmap-loading-overlay');
    if (existingOverlay) existingOverlay.remove();
    
    heatmapWrapper.appendChild(loadingOverlay);
    
    // Utiliser setTimeout pour permettre l'affichage de l'overlay
    setTimeout(async () => {
        try {
            // Récupérer les personnes complètes à partir de leurs IDs
            const selectedPersons = people.map(p => state.gedcomData.individuals[p.id])
                .filter(p => p !== undefined);
            
            // Configuration pour extraire les lieux
            const locationConfig = {
                ...nameCloudState.currentConfig,
                type: 'lieux' // Forcer le type à 'lieux' pour extraire tous les lieux
            };
            
            // Collecter tous les lieux non nettoyés
            const locationData = {};
            const originalName = {};
            const stats = { inPeriod: 0 }; // Stats minimal
            
            // Traiter chaque personne pour extraire ses lieux sans nettoyage
            selectedPersons.forEach(person => {
                processPersonData(person, locationConfig, locationData, stats, { doNotClean: true }, originalName);
            });
            
            // Créer une structure pour stocker les informations détaillées par lieu
            const locationDetails = {};
            
            // Collecter les détails des lieux pour chaque personne sélectionnée
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
                                // type: 'Lieu',
                                type: getHeatmapTranslation('place'),
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
            const result = Object.values(heatmapData);
            
            // Supprimer l'overlay de chargement
            loadingOverlay.remove();
            
            // Sauvegarder la position actuelle
            if (typeof saveHeatmapPosition === 'function') {
                saveHeatmapPosition();
            }
            
            // Fermer la heatmap actuelle
            const closeButton = document.getElementById('heatmap-close');
            if (closeButton) closeButton.click();
            
            // Un petit délai pour laisser la fermeture se terminer
            await new Promise(resolve => setTimeout(resolve, 100));
            
            if (result.length > 0) {
                // Créer un titre pour la heatmap
                let heatmapTitle;
                // if (window.innerWidth < 300) {
                //     heatmapTitle = `${text} (${selectedPersons.length})`;
                // } else {
                //     heatmapTitle = `Heatmap - "${text}" (${selectedPersons.length} personnes)`;
                // }
                if (window.innerWidth < 300) {
                    heatmapTitle = getHeatmapTranslation('heatmapTitleShort', text, selectedPersons.length);
                } else {
                    heatmapTitle = getHeatmapTranslation('heatmapTitle', text, selectedPersons.length);
                }
                
                // Créer la nouvelle heatmap
                createImprovedHeatmap(result, heatmapTitle);
            } else {
                // Afficher un message si aucun lieu n'est disponible
                const notification = document.createElement('div');
                // notification.textContent = 'Aucune donnée géographique pour les personnes sélectionnées';
                notification.textContent = getHeatmapTranslation('noGeoDataForSelected');

                notification.style.position = 'fixed';
                notification.style.top = '20px';
                notification.style.left = '50%';
                notification.style.transform = 'translateX(-50%)';
                notification.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                notification.style.color = 'white';
                notification.style.padding = '10px 20px';
                notification.style.borderRadius = '5px';
                notification.style.zIndex = '10000';
                document.body.appendChild(notification);
                
                // Faire disparaître la notification après 3 secondes
                setTimeout(() => {
                    notification.style.transition = 'opacity 1s';
                    notification.style.opacity = '0';
                    setTimeout(() => document.body.removeChild(notification), 1000);
                }, 3000);
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la heatmap:', error);
            if (loadingOverlay.parentNode) {
                loadingOverlay.remove();
            }
            // alert(`Erreur lors de la mise à jour de la heatmap: ${error.message}`);
            alert(getHeatmapTranslation('heatmapUpdateError', error.message));

        }
    }, 100);
}

// Ajouter une variable globale pour suivre le dernier rafraîchissement
let lastHeatmapRefreshTimestamp = 0;

document.addEventListener('cloudMapRefreshed', (event) => {
    const currentTime = Date.now();
    
    // Vérifier si une heatmap est visible
    const heatmapWrapper = document.getElementById('namecloud-heatmap-wrapper');
    
    // Conditions pour rafraîchir :
    // 1. La heatmap est visible
    // 2. Pas de rafraîchissement récent (délai de 500ms)
    if (heatmapWrapper && (currentTime - lastHeatmapRefreshTimestamp > 500)) {
        console.log('Rafraîchissement de la heatmap depuis cloudMapRefreshed', event.detail);
        
        lastHeatmapRefreshTimestamp = currentTime;
        
        // Utiliser un try-catch pour éviter de bloquer l'événement en cas d'erreur
        try {
            refreshHeatmap();
        } catch (error) {
            console.error('Erreur lors du rafraîchissement de la heatmap:', error);
        }
    } else {
        console.log('Rafraîchissement de la heatmap ignoré', {
            heatmapVisible: !!heatmapWrapper,
            timeSinceLastRefresh: currentTime - lastHeatmapRefreshTimestamp
        });
    }
});


