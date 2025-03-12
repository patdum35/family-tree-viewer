import { state } from './main.js';
import { nameCloudState, getPersonsFromTree, processPersonData } from './nameCloud.js';
import { geocodeLocation } from './geoLocalisation.js';
import { saveHeatmapPosition } from './geoHeatMapInteractions.js';
import { createImprovedHeatmap } from './geoHeatMapUI.js';


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


        // console.log("Tentative de création de l'événement personnalisé refreshPersonList");
        // console.log("Configuration actuelle:", nameCloudState.currentConfig);
        // Créer et dispatcher un événement personnalisé
        const refreshListEvent = new CustomEvent('refreshPersonList', {
            detail: {
                config: nameCloudState.currentConfig,
                timestamp: Date.now()
            }
        });
        
        document.dispatchEvent(refreshListEvent);
        // console.log("Événement personnalisé dispatché avec succès");

        
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
            const stats = { inPeriod: 0 }; // Stats minimal
            
            // Traiter chaque personne pour extraire ses lieux sans nettoyage
            selectedPersons.forEach(person => {
                processPersonData(person, locationConfig, locationData, stats, { doNotClean: true });
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
                if (window.innerWidth < 300) {
                    heatmapTitle = `${text} (${selectedPersons.length})`;
                } else {
                    heatmapTitle = `Heatmap - "${text}" (${selectedPersons.length} personnes)`;
                }
                
                // Créer la nouvelle heatmap
                createImprovedHeatmap(result, heatmapTitle);
            } else {
                // Afficher un message si aucun lieu n'est disponible
                const notification = document.createElement('div');
                notification.textContent = 'Aucune donnée géographique pour les personnes sélectionnées';
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
            alert(`Erreur lors de la mise à jour de la heatmap: ${error.message}`);
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