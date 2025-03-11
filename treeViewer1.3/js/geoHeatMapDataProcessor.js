import { state } from './main.js';
import { nameCloudState, getPersonsFromTree, processPersonData } from './nameCloud.js';
import { geocodeLocation } from './geoLocalisation.js';
import { saveHeatmapPosition } from './geoHeatMapInteractions.js';


/**
 * Rafraîchit la heatmap avec les données actuelles
 */
export async function refreshHeatmap() {
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
        // Fermer la heatmap actuelle
        const closeButton = document.getElementById('heatmap-close');
        if (closeButton) closeButton.click();
        
        // Un petit délai pour laisser la fermeture se terminer
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Simuler un clic sur le bouton de carte pour générer une nouvelle heatmap
        // avec les filtres actuels
        const mapButton = document.querySelector('[title="Afficher la heatmap"]');
        if (mapButton) mapButton.click();
        
    } catch (error) {
        console.error('Erreur lors du rafraîchissement de la heatmap:', error);
        if (document.contains(loadingOverlay)) loadingOverlay.remove();
        alert(`Erreur lors de la mise à jour de la heatmap: ${error.message}`);
    }
}

/**
 * Crée les données pour la heatmap en utilisant les mêmes personnes et filtres que la CloudMap
 * 
 * @param {Object} config - Configuration contenant type, startDate, endDate, scope, rootPersonId
 * @returns {Promise<Array>} - Données formatées pour la heatmap
 */
export async function createDataForHeatMap(config) {
    try {
        // Configuration pour extraire les lieux
        const locationConfig = {
            ...config,
            type: 'lieux' // Forcer le type à 'lieux' pour extraire tous les lieux
        };
        
        // Obtenir les personnes selon le même filtrage que la CloudMap
        const persons = getPersonsFromTree(locationConfig.scope, locationConfig.rootPersonId);
        console.log(`Nombre de personnes trouvées pour la heatmap : ${persons.length}`);
        
        // Collecter tous les lieux non nettoyés
        const locationData = {};
        const stats = { inPeriod: 0 }; // Stats minimal
        
        // Traiter chaque personne pour extraire ses lieux sans nettoyage
        persons.forEach(person => {
            processPersonData(person, locationConfig, locationData, stats, { doNotClean: true });
        });
        
        // Créer une structure pour stocker les informations détaillées par lieu
        const locationDetails = {};
        
        // Collecter les détails des lieux pour chaque personne
        for (const person of persons) {
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
        const result = Object.values(heatmapData);
        console.log(`Données de heatmap générées: ${result.length} lieux géolocalisés`);
        
        return result;
    } catch (error) {
        console.error('Erreur lors de la création des données pour la heatmap:', error);
        throw error;
    }
}