// geoLocalisation.js
import { state } from './main.js';
import { displayPersonDetails } from './modalWindow.js';
import { buildAncestorTree, buildDescendantTree} from './treeOperations.js';
import { nameCloudState, getPersonsFromTree, processPersonData } from './nameCloud.js';

export async function validateLocations() {
    const unlocatableLocations = document.getElementById('unlocatableLocations');
    unlocatableLocations.innerHTML = ''; // Réinitialiser
    unlocatableLocations.style.height = '300px';  // Hauteur fixe
    unlocatableLocations.style.overflowY = 'scroll';  // Scrollbar verticale

    const unlocatable = [];
    let errorCount = 0;

    // Créer un conteneur pour les informations de progression
    const progressContainer = document.createElement('div');
    progressContainer.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <div>
                <progress id="locationProgress" value="0" max="100" style="width: 300px;"></progress>
                <span id="progressText">Validation des lieux : 0/0</span>
            </div>
            <div>
                <strong>Erreurs de géolocalisation : <span id="errorCounter">0</span></strong>
            </div>
        </div>
    `;
    unlocatableLocations.parentNode.insertBefore(progressContainer, unlocatableLocations);

    // Collecter tous les lieux
    const allLocations = [];

    // Parcourir tous les individus
    Object.values(state.gedcomData.individuals).forEach(person => {
        if (person.birthPlace) allLocations.push({ 
            id: person.id, 
            name: person.name.replace(/\//g, ''), 
            place: person.birthPlace, 
            type: 'Naissance' 
        });
        if (person.deathPlace) allLocations.push({ 
            id: person.id, 
            name: person.name.replace(/\//g, ''), 
            place: person.deathPlace, 
            type: 'Décès' 
        });

        // Lieux de mariage via les familles
        if (person.spouseFamilies) {
            person.spouseFamilies.forEach(famId => {
                const family = state.gedcomData.families[famId];
                if (family && family.marriagePlace) {
                    allLocations.push({
                        id: person.id,
                        name: person.name.replace(/\//g, ''),
                        place: family.marriagePlace,
                        type: 'Mariage'
                    });
                }
            });
        }
    });

    // Tester la géolocalisation de chaque lieu avec limitation
    const batchSize = 5; // Nombre de requêtes simultanées

    // Fonction pour mettre à jour le compteur d'erreurs
    function updateErrorCounter() {
        const errorCounterEl = document.getElementById('errorCounter');
        if (errorCounterEl) {
            errorCounterEl.textContent = errorCount;
        }
    }

    // Tester la géolocalisation de chaque lieu avec limitation
    for (let i = 0; i < allLocations.length; i += batchSize) {
        const batch = allLocations.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (location) => {
            const coords = await geocodeLocation(location.place);
            
            // Mettre à jour la progression
            const progress = document.getElementById('locationProgress');
            const progressText = document.getElementById('progressText');
            if (progress && progressText) {
                progress.value = Math.round((i + batchSize) / allLocations.length * 100);
                progressText.textContent = `Validation des lieux : ${Math.min(i + batchSize, allLocations.length)}/${allLocations.length}`;
            }

            if (!coords) {
                // Ajouter immédiatement à la liste
                errorCount++;
                updateErrorCounter();

                const option = document.createElement('option');
                option.value = location.id;
                option.textContent = `${location.name} (${location.type}) : ${location.place}`;
                unlocatableLocations.appendChild(option);
            }

            return !coords ? location : null;
        });

        await Promise.all(batchPromises);
    }

    // Message final si aucune erreur
    if (errorCount === 0) {
        const option = document.createElement('option');
        option.textContent = 'Tous les lieux sont géolocalisables !';
        unlocatableLocations.appendChild(option);
    }

    // Ajouter un événement pour afficher les détails quand on sélectionne
    unlocatableLocations.onchange = () => {
        const selectedId = unlocatableLocations.value;
        displayPersonDetails(selectedId);
    };

    // Supprimer la barre de progression
    progressContainer.remove();
}

// Ajouter un délai entre les requêtes pour éviter la surcharge
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const HEATMAP_STORAGE_PREFIX = 'genealogy_heatmap_';


function getExistingHeatmaps() {
    return Object.keys(localStorage)
        .filter(key => key.startsWith(HEATMAP_STORAGE_PREFIX))
        .map(key => key.replace(HEATMAP_STORAGE_PREFIX, ''));
}

function saveHeatmapData(name, data) {
    try {
        localStorage.setItem(HEATMAP_STORAGE_PREFIX + name, JSON.stringify(data));
        console.log(`Heatmap ${name} sauvegardée`);
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
    }
}

function loadHeatmapData(name) {
    try {
        const data = localStorage.getItem(HEATMAP_STORAGE_PREFIX + name);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Erreur lors du chargement:', error);
        return null;
    }
}

function createProgressContainer() {
    const progressContainer = document.createElement('div');
    progressContainer.id = 'heatmap-progress';
    progressContainer.style.position = 'fixed';
    progressContainer.style.top = '50%';
    progressContainer.style.left = '50%';
    progressContainer.style.transform = 'translate(-50%, -50%)';
    progressContainer.style.backgroundColor = 'white';
    progressContainer.style.padding = '20px';
    progressContainer.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
    progressContainer.style.zIndex = '1000';
    progressContainer.style.borderRadius = '10px';
    
    const progressText = document.createElement('p');
    progressText.id = 'heatmap-progress-text';
    progressText.textContent = 'Génération de la heatmap en cours...';
    
    const progressBar = document.createElement('progress');
    progressBar.id = 'heatmap-progress-bar';
    progressBar.style.width = '100%';
    
    progressContainer.appendChild(progressText);
    progressContainer.appendChild(progressBar);
    
    document.body.appendChild(progressContainer);
    
    return progressContainer;
}

function updateProgressContainer(progressContainer, progress, message = null) {
    if (!progressContainer) return;

    const progressBar = document.getElementById('heatmap-progress-bar');
    const progressText = document.getElementById('heatmap-progress-text');

    if (progressBar) progressBar.value = progress;
    if (progressText) {
        progressText.textContent = message || `Génération de la heatmap : ${Math.round(progress)}%`;
    }
}

// Fonction pour exporter une heatmap vers un fichier
function exportHeatmapToFile(name, data) {
    try {
        // Créer un objet Blob avec les données
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        
        // Créer un lien de téléchargement
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${name}.json`;
        
        // Déclencher le téléchargement
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Nettoyer l'URL
        URL.revokeObjectURL(a.href);
        
        return true;
    } catch (error) {
        console.error('Erreur lors de l\'export:', error);
        return false;
    }
}

// Fonction pour traiter les individus et créer les données de heatmap
async function processIndividualsForHeatmap(individuals, progressContainer) {
    const locationCounts = {};
    const totalPersons = individuals.length;

    for (let i = 0; i < individuals.length; i++) {
        const person = individuals[i];
        
        // Mettre à jour la progression
        if (progressContainer) {
            updateProgressContainer(progressContainer, (i / totalPersons) * 100);
        }

        const locations = [
            { type: 'Naissance', place: person.birthPlace },
            { type: 'Décès', place: person.deathPlace }
        ];

        // Ajouter le lieu de mariage si disponible
        if (person.spouseFamilies && person.spouseFamilies.length > 0) {
            const marriageFamily = state.gedcomData.families[person.spouseFamilies[0]];
            if (marriageFamily && marriageFamily.marriagePlace) {
                locations.push({ type: 'Mariage', place: marriageFamily.marriagePlace });
            }
        }

        // Géocoder et traiter chaque lieu
        for (const location of locations.filter(loc => loc.place)) {
            try {
                const coords = await geocodeLocation(location.place);
                if (coords) {
                    const key = `${coords.lat.toFixed(2)},${coords.lon.toFixed(2)}`;
                    
                    if (!locationCounts[key]) {
                        locationCounts[key] = {
                            coords: coords,
                            count: 0,
                            families: {},
                            locations: []
                        };
                    }
                    
                    locationCounts[key].count++;
                    
                    // Extraire et compter le nom de famille
                    const familyName = person.name.split('/')[1]?.trim().toUpperCase();
                    if (familyName) {
                        locationCounts[key].families[familyName] = 
                            (locationCounts[key].families[familyName] || 0) + 1;
                    }
                    
                    locationCounts[key].locations.push({
                        type: location.type,
                        name: person.name.replace(/\//g, '').trim()
                    });
                }
            } catch (error) {
                console.error(`Erreur de géocodage pour ${location.place}:`, error);
            }
        }
    }

    return Object.values(locationCounts);
}

// Fonction utilitaire pour collecter les individus d'un arbre
function collectIndividualsFromTree(node, collected = []) {
    if (!node) return collected;
    
    if (node.id) {
        const person = state.gedcomData.individuals[node.id];
        if (person && !collected.some(p => p.id === person.id)) {
            collected.push(person);
        }
    }

    // Collecter les enfants
    if (node.children) {
        node.children.forEach(child => collectIndividualsFromTree(child, collected));
    }

    // Collecter les époux/épouses
    if (node.spouses) {
        node.spouses.forEach(spouse => {
            const spousePerson = state.gedcomData.individuals[spouse.id];
            if (spousePerson && !collected.some(p => p.id === spouse.id)) {
                collected.push(spousePerson);
            }
        });
    }
    
    return collected;
}

// Fonction pour collecter les individus par génération pour les ancêtres
function collectAncestorsPerGeneration(node, generations = new Map()) {
    if (!node) return generations;

    // Obtenir la génération actuelle ou créer un nouveau tableau
    const currentGen = generations.get(node.generation) || [];
    
    // Ajouter uniquement la personne principale (pas les siblings)
    if (node.id && !node.isSibling) {
        const person = state.gedcomData.individuals[node.id];
        if (person) {
            currentGen.push(person);
            generations.set(node.generation, currentGen);
        }
    }

    // Récursion sur les enfants (qui sont en fait les parents dans l'arbre des ancêtres)
    if (node.children) {
        node.children.forEach(child => {
            if (!child.isSibling) { // Ignorer les siblings
                collectAncestorsPerGeneration(child, generations);
            }
        });
    }

    return generations;
}

// Fonction pour collecter les individus par génération pour les descendants
function collectDescendantsPerGeneration(node, generations = new Map()) {
    if (!node) return generations;

    // Obtenir la génération actuelle ou créer un nouveau tableau
    const currentGen = generations.get(node.generation) || [];
    
    // Ajouter uniquement la personne principale (pas les époux/épouses)
    if (node.id && !node.isSpouse) {
        const person = state.gedcomData.individuals[node.id];
        if (person) {
            currentGen.push(person);
            generations.set(node.generation, currentGen);
        }
    }

    // Récursion sur les enfants
    if (node.children) {
        node.children.forEach(child => {
            if (!child.isSpouse) { // Ignorer les époux/épouses
                collectDescendantsPerGeneration(child, generations);
            }
        });
    }

    return generations;
}

// Fonction pour obtenir les N premiers individus en respectant l'ordre des générations
function getFirstNIndividualsPerGeneration(generations, maxPersons) {
    const result = [];
    const sortedGenerations = Array.from(generations.entries())
        .sort((a, b) => a[0] - b[0]); // Trier par numéro de génération

    for (const [_, individuals] of sortedGenerations) {
        result.push(...individuals);
        if (result.length >= maxPersons) {
            return result.slice(0, maxPersons);
        }
    }

    return result;
}

// Modification de la fonction getIndividualsToProcess
async function getIndividualsToProcess(type, rootPersonId, maxPersons) {
    let individuals = [];

    if (type === 'all') {
        individuals = Object.values(state.gedcomData.individuals);
    } 
    else if (type === 'ancestors' && rootPersonId) {
        const processed = new Set();
        const ancestorTree = buildAncestorTree(rootPersonId, processed);
        const generationsMap = collectAncestorsPerGeneration(ancestorTree);
        individuals = getFirstNIndividualsPerGeneration(generationsMap, maxPersons);
    } 
    else if (type === 'descendants' && rootPersonId) {
        const processed = new Set();
        const descendantTree = buildDescendantTree(rootPersonId, processed);
        const generationsMap = collectDescendantsPerGeneration(descendantTree);
        individuals = getFirstNIndividualsPerGeneration(generationsMap, maxPersons);
    }

    return individuals;
}

export function createInteractiveHeatmap(locationData, heatmapName) {
    // Fermer toute modale existante
    const existingModal = document.querySelector('.settings-modal');
    if (existingModal) {
        document.body.removeChild(existingModal);
    }

    // Créer un conteneur principal
    const heatmapWrapper = document.createElement('div');
    heatmapWrapper.style.position = 'fixed';
    heatmapWrapper.style.top = '0';
    heatmapWrapper.style.left = '0';
    heatmapWrapper.style.width = '100%';
    heatmapWrapper.style.height = '100%';
    heatmapWrapper.style.backgroundColor = 'rgba(0,0,0,0.1)';
    heatmapWrapper.style.zIndex = '1200';
    heatmapWrapper.style.display = 'flex';
    heatmapWrapper.style.justifyContent = 'center';
    heatmapWrapper.style.alignItems = 'center';


























































    // Conteneur interne
    const contentContainer = document.createElement('div');
    contentContainer.style.width = '90%';
    contentContainer.style.height = '90%';
    contentContainer.style.backgroundColor = 'white';
    contentContainer.style.borderRadius = '10px';
    contentContainer.style.position = 'relative';
    contentContainer.style.overflow = 'hidden';

    // Conteneur de carte
    const mapContainer = document.createElement('div');
    mapContainer.id = 'ancestors-heatmap';
    mapContainer.style.width = '100%';
    mapContainer.style.height = 'calc(100% - 50px)';

    // Assembler les éléments
    contentContainer.appendChild(mapContainer);
    heatmapWrapper.appendChild(contentContainer);

    // Ajouter au body
    document.body.appendChild(heatmapWrapper);

    // Initialiser la carte avec une vue par défaut
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
        const detailsContainer = document.createElement('div');
        detailsContainer.id = 'heatmap-details';
        detailsContainer.style.padding = '10px';
        detailsContainer.style.backgroundColor = 'rgba(255,255,255,0.8)';
        detailsContainer.style.position = 'absolute';
        detailsContainer.style.top = '10px';
        detailsContainer.style.right = '10px';
        detailsContainer.style.zIndex = '1000';
        detailsContainer.style.maxWidth = '300px';
        detailsContainer.style.maxHeight = '400px';
        detailsContainer.style.overflowY = 'auto';
        contentContainer.appendChild(detailsContainer);

        // Événements de survol
        marker.on('mouseover', () => {
            let details = `<h3>Détails du point</h3>
                <p><strong>Lieu :</strong> ${location.placeName || "Lieu non spécifié"}</p>
                <p><strong>Nombre total d'occurences :</strong> ${location.count}</p>`;

            if (location.families && Object.keys(location.families).length > 0) {
                details += `<h4>Noms de famille :</h4><ul>`;
                const sortedFamilies = Object.entries(location.families)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5);

                sortedFamilies.forEach(([family, count]) => {
                    details += `<li>${family}: ${count} occurences</li>`;
                });
                details += `</ul>`;
            }

            if (location.locations && location.locations.length > 0) {
                details += `<h4>Personnes :</h4><ul>`;
                location.locations.slice(0, 10).forEach(person => {
                    details += `<li>${person.name} (${person.type})</li>`;
                });

                if (location.locations.length > 10) {
                    details += `<li>... et ${location.locations.length - 10} autres</li>`;
                }
                details += `</ul>`;
            }

            detailsContainer.innerHTML = details;
        });

        marker.on('mouseout', () => {
            detailsContainer.innerHTML = '<p>Survolez un point pour plus de détails</p>';
        });
    });

    // Créer un bouton de fermeture
    const exitButton = document.createElement('button');
    exitButton.textContent = '✖ Fermer la Heatmap';
    exitButton.style.position = 'absolute';
    exitButton.style.top = '10px';
    exitButton.style.right = '10px';
    // exitButton.style.zIndex = '1000';


    exitButton.style.zIndex = '2000';  // S'assurer qu'il est au-dessus de tout
    exitButton.style.backgroundColor = 'white';
    exitButton.style.border = '1px solid #ccc';
    exitButton.style.borderRadius = '4px';
    exitButton.style.padding = '5px 10px';
    exitButton.style.cursor = 'pointer';






    exitButton.onclick = () => {
        document.body.removeChild(heatmapWrapper);
    };
    contentContainer.appendChild(exitButton);

    // Ajuster la vue à toutes les coordonnées valides APRÈS avoir vérifié qu'elles sont valides
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
        // En cas d'erreur, on garde la vue par défaut sur la France
    }
}

export async function createAncestorsHeatMap(options = {}) {
    const defaultOptions = {
        type: 'all', // 'all', 'ancestors', 'descendants'
        rootPersonId: null,
        maxPersons: 10
    };
    const finalOptions = { ...defaultOptions, ...options };

    // Récupérer les heatmaps existantes
    const existingHeatmaps = getExistingHeatmaps();

    // Demander à l'utilisateur comment procéder
    // const userChoice = await showHeatmapDialog(existingHeatmaps, finalOptions.type);


    const userChoice = await showHeatmapDialog(existingHeatmaps, finalOptions.type);

    if (userChoice.action === 'load') {
        let heatmapData;
        if (userChoice.source === 'storage') {
            heatmapData = loadHeatmapData(userChoice.filename);
        } else if (userChoice.source === 'file') {
            try {
                const text = await userChoice.file.text();
                heatmapData = JSON.parse(text);
            } catch (error) {
                console.error('Erreur lors de la lecture du fichier:', error);
                return;
            }
        }

        if (heatmapData && Array.isArray(heatmapData) && heatmapData.length > 0) {
            createInteractiveHeatmap(heatmapData);
        } else {
            console.error('Données de heatmap invalides:', heatmapData);
        }
        return;
    }




    if (!userChoice || userChoice.action === 'cancel') {
        return;
    }

    // Créer un conteneur de progression
    const progressContainer = createProgressContainer();

    try {
        let individualsToProcess = await getIndividualsToProcess(
            finalOptions.type, 
            userChoice.rootPersonId, 
            userChoice.maxPersons
        );

        const heatmapData = await processIndividualsForHeatmap(
            individualsToProcess, 
            progressContainer
        );

        // Sauvegarder les données
        saveHeatmapData(userChoice.filename, heatmapData);

        // Supprimer le conteneur de progression
        if (progressContainer.parentNode) {
            progressContainer.parentNode.removeChild(progressContainer);
        }

        // Créer la carte interactive
        createInteractiveHeatmap(heatmapData, userChoice.filename);

    } catch (error) {
        console.error('Erreur lors de la création de la heatmap:', error);
        if (progressContainer) {
            updateProgressContainer(progressContainer, 0, 'Erreur lors de la génération');
        }
    }
}

async function showHeatmapDialog(existingHeatmaps, type = 'all') {
    return new Promise((resolve) => {
        // Création de la modale
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.style.zIndex = '9999';

        // Conteneur principal
        const modalContent = document.createElement('div');
        modalContent.style.backgroundColor = 'white';
        modalContent.style.padding = '20px';
        modalContent.style.borderRadius = '10px';
        modalContent.style.width = '90%';
        modalContent.style.maxWidth = '500px';
        modalContent.style.maxHeight = '80vh';
        modalContent.style.overflowY = 'auto';
        modalContent.style.position = 'relative';

        // Style commun pour les boutons
        const buttonStyle = `
            padding: 8px;
            border: none;
            border-radius: 4px;
            color: white;
            cursor: pointer;
            transition: opacity 0.2s;
            font-weight: 500;
            width: 100%;
            margin-bottom: 10px;
        `;

        // Construction du contenu HTML
        let contentHTML = `
            <h2 style="margin-bottom: 20px;">Gestion des Heatmaps</h2>`;

        // Section de recherche pour ancestors/descendants
        if (type !== 'all') {
            contentHTML += `
            <div style="margin: 20px 0; background-color: #f8f9fa; padding: 15px; border-radius: 8px;">
                <h3 style="margin-bottom: 15px;">Sélection de la personne racine</h3>
                <div style="margin-bottom: 10px;">
                    <input type="text" 
                           id="heatmap-person-search" 
                           placeholder="🔍 Rechercher une personne (Appuyez sur Entrée)" 
                           style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <select id="heatmap-person-results" 
                        style="width: 100%; padding: 8px; display: none; background-color: orange; 
                               border: 1px solid #ddd; border-radius: 4px; margin-bottom: 10px;">
                    <option value="">Sélectionnez une personne</option>
                </select>
            </div>`;
        }

        // Section création
        contentHTML += `
            <div style="margin: 20px 0; background-color: #f8f9fa; padding: 15px; border-radius: 8px;">
                <h3 style="margin-bottom: 15px;">Nouvelle Heatmap</h3>
                <input type="text" 
                       id="newHeatmapName" 
                       placeholder="Nom de la nouvelle heatmap" 
                       style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 4px;">
                <input type="number" 
                       id="maxPersonsInput" 
                       value="10" 
                       min="1" 
                       max="1000"
                       style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 4px;"
                       placeholder="Nombre maximum de personnes">
                <button id="createNewBtn" style="${buttonStyle} background-color: #4CAF50;">
                    Générer Nouvelle Heatmap
                </button>
            </div>`;

        // Section chargement
        contentHTML += `
            <div style="margin: 20px 0; background-color: #f8f9fa; padding: 15px; border-radius: 8px;">
                <h3 style="margin-bottom: 15px;">Charger une Heatmap</h3>`;

        // Sous-section stockage local
        if (existingHeatmaps.length > 0) {
            contentHTML += `
                <div style="margin-bottom: 15px;">
                    <h4 style="margin-bottom: 10px;">Depuis le stockage local</h4>
                    <select id="existingHeatmaps" 
                            style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 4px;">
                        ${existingHeatmaps.map(h => `<option value="${h}">${h}</option>`).join('')}
                    </select>
                    <button id="loadStoredBtn" style="${buttonStyle} background-color: #2196F3;">
                        Charger depuis le stockage
                    </button>
                </div>`;
        }

        // Sous-section fichier
        contentHTML += `
                <div>
                    <h4 style="margin-bottom: 10px;">Depuis un fichier</h4>
                    <button id="loadFileBtn" style="${buttonStyle} background-color: #FFC107; color: black;">
                        Charger depuis un fichier
                    </button>
                </div>
            </div>`;

        modalContent.innerHTML = contentHTML;

        // Bouton de fermeture
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.position = 'absolute';
        closeBtn.style.right = '10px';
        closeBtn.style.top = '10px';
        closeBtn.style.background = 'none';
        closeBtn.style.border = 'none';
        closeBtn.style.fontSize = '24px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.zIndex = '1001';
        modalContent.appendChild(closeBtn);

        // Gestion des événements
        // Événement de recherche pour ancestors/descendants
        if (type !== 'all') {
            const searchInput = modalContent.querySelector('#heatmap-person-search');
            const searchResults = modalContent.querySelector('#heatmap-person-results');

            searchInput.addEventListener('keyup', (event) => {
                if (event.key === 'Enter') {
                    const searchText = searchInput.value.toLowerCase();
                    const results = Object.values(state.gedcomData.individuals)
                        .filter(person => person.name.toLowerCase().includes(searchText))
                        .slice(0, 10);

                    searchResults.innerHTML = '<option value="">Sélectionnez une personne</option>';
                    results.forEach(person => {
                        const option = document.createElement('option');
                        option.value = person.id;
                        option.textContent = person.name.replace(/\//g, '');
                        searchResults.appendChild(option);
                    });

                    if (results.length > 0) {
                        searchResults.style.display = 'block';
                    }
                }
            });
        }

        // Gestion de la fermeture
        closeBtn.onclick = () => {
            document.body.removeChild(modal);
            resolve({ action: 'cancel' });
        };



        // Section Heatmaps existantes
        if (existingHeatmaps.length > 0) {
            const existingSection = document.createElement('div');
            existingSection.style.margin = '20px 0';
            existingSection.innerHTML = `
                <h3>Heatmaps Existantes</h3>
                <select id="existingHeatmaps" 
                        style="width: 100%; padding: 8px; margin-bottom: 10px;">
                    ${existingHeatmaps.map(h => `<option value="${h}">${h}</option>`).join('')}
                </select>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <button id="loadBtn" 
                            style="padding: 8px; 
                                   background-color: #2196F3; 
                                   color: white; 
                                   border: none; 
                                   border-radius: 4px; 
                                   cursor: pointer;">
                        Charger
                    </button>
                    <button id="exportBtn" 
                            style="padding: 8px; 
                                   background-color: #FFC107; 
                                   color: black; 
                                   border: none; 
                                   border-radius: 4px; 
                                   cursor: pointer;">
                        Exporter
                    </button>
                </div>
            `;
            modalContent.appendChild(existingSection);

            // Event listeners pour les boutons existants
            const loadBtn = existingSection.querySelector('#loadBtn');
            const exportBtn = existingSection.querySelector('#exportBtn');
            const existingSelect = existingSection.querySelector('#existingHeatmaps');

            loadBtn.onclick = () => {
                document.body.removeChild(modal);
                resolve({ 
                    action: 'load', 
                    filename: existingSelect.value 
                });
            };

            exportBtn.onclick = () => {
                const data = loadHeatmapData(existingSelect.value);
                if (data) {
                    exportHeatmapToFile(existingSelect.value, data);
                }
            };
        }



        // Gestion du chargement depuis le stockage
        const loadStoredBtn = modalContent.querySelector('#loadStoredBtn');
        if (loadStoredBtn) {
            loadStoredBtn.onclick = () => {
                const select = modalContent.querySelector('#existingHeatmaps');
                if (select && select.value) {
                    document.body.removeChild(modal);
                    resolve({ 
                        action: 'load', 
                        source: 'storage',
                        filename: select.value 
                    });
                }
            };
        }

        // Gestion du chargement depuis un fichier
        const loadFileBtn = modalContent.querySelector('#loadFileBtn');
        loadFileBtn.onclick = () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            
            input.onchange = async (e) => {
                if (e.target.files[0]) {
                    document.body.removeChild(modal);
                    resolve({ 
                        action: 'load',
                        source: 'file',
                        file: e.target.files[0]
                    });
                }
            };
            
            input.click();
        };

        // Gestion de la création
        const createBtn = modalContent.querySelector('#createNewBtn');
        createBtn.onclick = () => {
            const name = modalContent.querySelector('#newHeatmapName').value.trim();
            const maxPersons = parseInt(modalContent.querySelector('#maxPersonsInput').value);
            const selectedPerson = type !== 'all' ? 
                modalContent.querySelector('#heatmap-person-results')?.value : null;

            if (!name) {
                alert('Veuillez entrer un nom pour la heatmap');
                return;
            }

            if (type !== 'all' && !selectedPerson) {
                alert('Veuillez sélectionner une personne racine');
                return;
            }

            document.body.removeChild(modal);
            resolve({ 
                action: 'create', 
                filename: name,
                maxPersons: maxPersons,
                rootPersonId: selectedPerson
            });
        };

        // Ajout au document
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
    });
}



function applySmallScreenStyles(map, heatmapTitle) {
    const screenWidth = window.innerWidth;
    const heatmapWrapper = document.getElementById('namecloud-heatmap-wrapper');
    
    // Vérifier à la fois la taille de l'écran ET la taille du conteneur
    const isSmallScreen = screenWidth <= 410;
    const isSmallContainer = heatmapWrapper && 
                            (heatmapWrapper.clientWidth <= 200 || heatmapWrapper.clientHeight <= 200);
    
    // Appliquer le style petit écran si l'un des deux est vrai
    const applySmallStyle = isSmallScreen || isSmallContainer;
    
    // 1. Gérer la barre de titre et son contenu
    const titleBar = document.querySelector('#namecloud-heatmap-wrapper > div');
    const mapContainer = document.getElementById('ancestors-heatmap');
    
    if (titleBar && mapContainer) {
        if (applySmallStyle) {
            // Code existant pour le style petit écran...
            titleBar.style.display = 'none';
            
            // Reste du code pour créer/gérer mapTitle et controlsContainer...
        } else {
            // Rétablir l'affichage normal pour les écrans et conteneurs plus grands
            titleBar.style.display = 'flex';
            
            // Supprimer les éléments spécifiques aux petits écrans s'ils existent
            const mapTitle = document.getElementById('heatmap-map-title');
            const controlsContainer = document.getElementById('heatmap-map-controls');
            
            if (mapTitle) mapTitle.remove();
            if (controlsContainer) controlsContainer.remove();
        }
    }
    
    // 2. Réduire la taille des boutons de zoom et les déplacer vers le bas
    if (map) {
        const zoomControl = document.querySelector('.leaflet-control-zoom');
        if (zoomControl) {
            if (applySmallStyle) {
                // // Réduction et repositionnement des boutons de zoom
                zoomControl.style.transform = 'scale(0.7)';
                zoomControl.style.transformOrigin = 'top right';
                zoomControl.style.marginTop = '40px'; // Décalage vers le bas
                zoomControl.style.marginLeft = '-10px'; // Décalage vers le bas 

                // Ajuster également les éléments internes des boutons zoom
                const zoomButtons = zoomControl.querySelectorAll('a');
                zoomButtons.forEach(btn => {
                    btn.style.width = '22px';
                    btn.style.height = '22px';
                    btn.style.lineHeight = '22px';
                    btn.style.fontSize = '14px';
                });
                // Masquer la barre de titre originale
                titleBar.style.display = 'none';
                
                // Créer ou mettre à jour le titre à l'intérieur de la carte
                let mapTitle = document.getElementById('heatmap-map-title');
                // Enlever "Heatmap - " du début du titre pour plus de compacité

                if (!mapTitle) {
                    // Si le titre n'existe pas, le créer
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
                
                // Toujours mettre à jour le texte du titre
                // mapTitle.textContent = heatmapTitle || 'Heatmap';
                mapTitle.textContent = (heatmapTitle || 'Heatmap').replace(/^Heatmap\s*-\s*/, '');
                
                // Créer les boutons dans la carte
                let controlsContainer = document.getElementById('heatmap-map-controls');
                if (!controlsContainer) {
                    controlsContainer = document.createElement('div');
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

            } else {
                zoomControl.style.transform = 'none';
                zoomControl.style.marginTop = '0'; // Restaurer la position par défaut
                zoomControl.style.marginLeft = '+10px'; // Décalage vers le bas 
                const zoomButtons = zoomControl.querySelectorAll('a');
                zoomButtons.forEach(btn => {
                    btn.style.width = '';
                    btn.style.height = '';
                    btn.style.lineHeight = '';
                    btn.style.fontSize = '';
                });
            }
        }
    }
    
    // 3. Masquer l'attribution Leaflet sur petits écrans
    const attribution = document.querySelector('.leaflet-control-attribution');
    if (attribution) {
        attribution.style.display = applySmallStyle ? 'none' : 'block';
    }
    
    // 4. Centrer la carte sur son centre actuel pour garder le contenu centré
    if (map) {
        const currentCenter = map.getCenter();
        const currentZoom = map.getZoom();
        map.invalidateSize();
        map.setView(currentCenter, currentZoom, { animate: false });
    }
}



export function createImprovedHeatmap(locationData, heatmapTitle) {
    // Fermer toute carte existante d'abord
    const existingMap = document.getElementById('namecloud-heatmap-wrapper');
    if (existingMap) {
        document.body.removeChild(existingMap);
    }

    // Créer un conteneur principal (semi-transparent) qui ne couvre pas tout l'écran
    const heatmapWrapper = document.createElement('div');

    console.log("Création de la heatmap - État initial:", {
        nameCloudState: nameCloudState.heatmapPosition ? { ...nameCloudState.heatmapPosition } : null
    });


    heatmapWrapper.id = 'namecloud-heatmap-wrapper';
    heatmapWrapper.style.position = 'fixed';
    heatmapWrapper.style.top = '60px'; // Remonté de 20px comme demandé
    heatmapWrapper.style.left = '20px';
    heatmapWrapper.style.width = 'calc(100% - 40px)';
    heatmapWrapper.style.height = 'calc(100% - 100px)'; // Réduire la hauteur






    // Ajoutez également un écouteur d'événement pour le redimensionnement de la fenêtre
    window.addEventListener('resize', function() {
        const wrapper = document.getElementById('namecloud-heatmap-wrapper');
        if (!wrapper) return; // Ne rien faire si la heatmap n'est pas affichée
        // Ajuster la largeur en fonction de la taille de l'écran
        wrapper.style.width = 'calc(100% - 40px)';
        wrapper.style.height = 'calc(100% - 100px)';
    });



    console.log("Styles de base appliqués:", {
        top: heatmapWrapper.style.top,
        left: heatmapWrapper.style.left,
        width: heatmapWrapper.style.width,
        height: heatmapWrapper.style.height
    });


    heatmapWrapper.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
    heatmapWrapper.style.zIndex = '9000'; // Élevé mais inférieur aux contrôles (11000+)
    heatmapWrapper.style.display = 'flex';
    heatmapWrapper.style.flexDirection = 'column';
    heatmapWrapper.style.borderRadius = '10px';
    heatmapWrapper.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    heatmapWrapper.style.overflow = 'hidden';
    heatmapWrapper.style.resize = 'both'; // Permettre le redimensionnement
    heatmapWrapper.style.minWidth = '100px'; //'400px';
    heatmapWrapper.style.minHeight = '100px'; //'300px';



    
    const titleBar = document.createElement('div');
    titleBar.style.padding = '8px 12px';
    titleBar.style.backgroundColor = '#4361ee';
    titleBar.style.color = 'white';
    titleBar.style.fontWeight = 'bold';
    titleBar.style.display = 'flex';
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
    
    /* Afficher seulement quand le bandeau titre est masqué */
    .heatmap-drag-handle {
        display: none;
    }
    
    /* Afficher pour les petites tailles */
    @media (max-width: 500px), (max-height: 400px) {
        .heatmap-drag-handle {
        display: flex;
        }
    }
    `;

    document.head.appendChild(dragHandleStyle);
    heatmapWrapper.appendChild(dragHandle);










    // Créer une poignée de redimensionnement spécifique pour mobile
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'heatmap-resize-handle';
    resizeHandle.innerHTML = '⤡'; //'↘️'; // Emoji flèche diagonale
    resizeHandle.style.position = 'absolute';
    resizeHandle.style.bottom = '0';
    resizeHandle.style.right = '0';
    resizeHandle.style.width = '25px';
    resizeHandle.style.height = '25px';
    resizeHandle.style.backgroundColor = 'rgba(67, 97, 238, 0.7)';
    resizeHandle.style.color = 'white';
    resizeHandle.style.fontSize = '24px';
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
        display: none; /* Caché par défaut sur desktop */
    }
    
    .heatmap-resize-handle:hover {
        opacity: 1;
    }
    
    /* Afficher uniquement sur les appareils tactiles/mobiles */
    @media (max-width: 1024px), (pointer: coarse) {
        .heatmap-resize-handle {
        display: flex;
        }
        
        /* Masquer le coin de redimensionnement natif sur mobile */
        #namecloud-heatmap-wrapper {
        resize: none !important;
        }
    }
    `;

    document.head.appendChild(resizeHandleStyle);
    heatmapWrapper.appendChild(resizeHandle);

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
    heatmapWrapper.style.width = `${Math.max(200, newWidth)}px`;
    heatmapWrapper.style.height = `${Math.max(150, newHeight)}px`;
    
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
        
        // Sauvegarder la position et les dimensions
        if (typeof saveHeatmapPosition === 'function') {
        saveHeatmapPosition();
        }
    }
    }




















   // Rendre le conteneur déplaçable
    // Modification de l'appel à makeElementDraggable pour inclure la nouvelle poignée
    makeElementDraggable(heatmapWrapper, [titleBar, dragHandle]);














    // Fonction pour sauvegarder la position et les dimensions
    function saveHeatmapPosition() {
        const rect = heatmapWrapper.getBoundingClientRect();
        if (!nameCloudState.heatmapPosition) {
            nameCloudState.heatmapPosition = {};
        }
        nameCloudState.heatmapPosition.top = rect.top;
        nameCloudState.heatmapPosition.left = rect.left;
        nameCloudState.heatmapPosition.width = rect.width;
        nameCloudState.heatmapPosition.height = rect.height;
        console.log("Position heatmap sauvegardée:", { ...nameCloudState.heatmapPosition });
    }



    // Ajouter un écouteur pour sauvegarder la position après déplacement
    heatmapWrapper.addEventListener('mouseup', () => {
        console.log("Événement mouseup détecté sur heatmapWrapper");
        saveHeatmapPosition();
    });

    // Ajouter un écouteur pour le redimensionnement
    if (window.ResizeObserver) {
        const resizeObserver = new ResizeObserver(() => {
            console.log("Redimensionnement détecté par ResizeObserver");
            saveHeatmapPosition();
        });
        
        resizeObserver.observe(heatmapWrapper);
        heatmapWrapper.resizeObserver = resizeObserver;
        console.log("ResizeObserver attaché à heatmapWrapper");
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

    // Initialiser la carte
    setTimeout(() => {
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

                // Variable pour suivre l'état d'ouverture
                let isDetailsOpen = false;
                // Fonctions de gestion des détails
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
                // marker.on('mouseout', () => {
                //     detailsContainer.style.display = 'none';
                // });
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
                if (nameCloudContainer) {
                    nameCloudContainer.style.zIndex = nameCloudContainer.dataset.originalZIndex;
                    delete nameCloudContainer.dataset.originalZIndex;
                }
                
                // Restaurer les z-index originaux de tous les éléments
                restoreOriginalZindexes();
                
                // Supprimer la heatmap
                document.body.removeChild(heatmapWrapper);
            });


            // map.on('load', () => {
            //     applySmallScreenStyles(map, heatmapTitle);
            // });

            // Appliquer les styles immédiatement après l'initialisation
            setTimeout(() => {
                applySmallScreenStyles(map, heatmapTitle);
                heat._reset(); 
            }, 200);

            // Ajouter un écouteur pour le redimensionnement qui réapplique les styles
            window.addEventListener('resize', () => {
                const map = document.querySelector('#namecloud-heatmap-wrapper')?.map;
                const titleText = document.querySelector('.title-text')?.textContent || '';
                if (map) {
                    applySmallScreenStyles(map, titleText);
                    heat._reset(); 
                }
            });



            // Forcer un redimensionnement de la carte pour s'assurer qu'elle s'affiche correctement
            // map.invalidateSize();

            const currentCenter = map.getCenter();
            const currentZoom = map.getZoom();
            map.invalidateSize();
            map.setView(currentCenter, currentZoom, { animate: false });
            
            // Sauvegarde de la référence pour usage ultérieur
            heatmapWrapper.map = map;
        } catch (error) {
            console.error('Erreur lors de l\'initialisation de la carte:', error);
            alert('Erreur lors de la création de la carte. Voir console pour détails.');
        }
    }, 100); // Petit délai pour s'assurer que le DOM est prêt

    // Ajouter l'événement de rafraîchissement
    const refreshButton = document.getElementById('heatmap-refresh');
    if (refreshButton) {
        refreshButton.addEventListener('click', () => {
            if (typeof refreshHeatmap === 'function') {
                refreshHeatmap();
            } else {
                console.warn('La fonction refreshHeatmap n\'est pas définie');
            }
        });
    }

    // AJOUT: S'assurer que le bouton de fermeture est toujours visible
    const closeButton = document.getElementById('heatmap-close');
    if (closeButton) {
        closeButton.style.position = 'sticky';
        closeButton.style.top = '0';
        closeButton.style.right = '0';
        closeButton.style.zIndex = '99999';
    }




    // À la fin de createImprovedHeatmap, remplacez ou ajoutez ceci
    // Observer les changements de taille du conteneur pour le redimensionnement manuel
    if (window.ResizeObserver) {
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                if (entry.target.id === 'namecloud-heatmap-wrapper' && heatmapWrapper.map) {
                    // Appliquer les styles en fonction de la nouvelle taille
                    const titleText = document.querySelector('.title-text')?.textContent || 'Heatmap';
                    applySmallScreenStyles(heatmapWrapper.map, titleText);
                }
            }
        });
        
        // Observer le conteneur de la heatmap
        resizeObserver.observe(heatmapWrapper);
        
        // Sauvegarder l'observateur pour pouvoir le déconnecter lors de la fermeture
        heatmapWrapper.resizeObserver = resizeObserver;
        
        // Ajouter la déconnexion à l'événement de fermeture
        const closeButton = document.getElementById('heatmap-close');
        if (closeButton) {
            const originalClickHandler = closeButton.onclick;
            closeButton.onclick = function() {
                if (heatmapWrapper.resizeObserver) {
                    heatmapWrapper.resizeObserver.disconnect();
                }
                if (originalClickHandler) {
                    originalClickHandler.call(this);
                }
            };
        }
    }




    return heatmapWrapper;
}





// Fonction simplifiée pour le rafraîchissement de la heatmap
export async function refreshHeatmap() {
    console.log("Début refreshHeatmap - État actuel:", {
        nameCloudState: nameCloudState.heatmapPosition ? { ...nameCloudState.heatmapPosition } : null
    });


    // Si aucune heatmap n'est affichée, ne rien faire
    const heatmapWrapper = document.getElementById('namecloud-heatmap-wrapper');
    if (heatmapWrapper) {
        const rect = heatmapWrapper.getBoundingClientRect();
        console.log("Position heatmap avant suppression:", {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
        });
    }
    if (!heatmapWrapper) return;
    
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

// Fonction pour attacher les écouteurs d'événements aux contrôles pour la mise à jour automatique
export const attachFilterListeners = () => {
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
                // console.log(`Valeur '${key}' changée: ${previousValues[key]} -> ${element.value}`);
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
                // console.log(`Valeur '${key}' changée: ${previousValues[key]} -> ${value}`);
            }
            return hasChanged;
        }
        
        return false; // Par défaut, pas de changement
    };
    
    // Fonction de rafraîchissement qui vérifie s'il y a eu un vrai changement
    const smartRefresh = (element, key) => {
        // Vérifier si la valeur a vraiment changé
        if (hasValueChanged(element, key)) {
            // console.log(`Rafraîchissement déclenché par changement de ${key}`);
            if (typeof refreshHeatmap === 'function' && 
                document.getElementById('namecloud-heatmap-wrapper')) {
                refreshHeatmap();
            }
        }
    };
    
    // Version debounced du rafraîchissement intelligent
    const debouncedSmartRefresh = debounce(smartRefresh, 1000);
    
    // Attacher des écouteurs aux éléments de typeSelect et scopeSelect
    const typeSelect = document.querySelector('[data-text-key="typeSelect"]');
    const scopeSelect = document.querySelector('[data-text-key="scopeSelect"]');
    const startDateInput = document.querySelector('[data-text-key="startDateInput"]');
    const endDateInput = document.querySelector('[data-text-key="endDateInput"]');
    const rootPersonSelect = document.querySelector('[data-text-key="rootPersonResults"]');
    
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
        validateButton.addEventListener('click', () => {
            // console.log("Rafraîchissement déclenché par clic sur Valider");
            if (typeof refreshHeatmap === 'function' && 
                document.getElementById('namecloud-heatmap-wrapper')) {
                refreshHeatmap();
            }
        });
    }
    
    // console.log('Écouteurs intelligents attachés pour mettre à jour la heatmap uniquement lors des vrais changements');
};



// // Fonction pour rendre un élément déplaçable
// Fonction makeElementDraggable modifiée pour accepter plusieurs poignées
function makeElementDraggable(element, handles) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    // Convertir en tableau si ce n'est pas déjà le cas
    if (!Array.isArray(handles)) {
        handles = [handles];
    }
    
    // Attacher l'événement à chaque poignée
    handles.forEach(handle => {
        if (handle) {
            handle.onmousedown = dragMouseDown;
            
            // Support tactile
            handle.ontouchstart = touchDragStart;
        }
    });
    
    // Si aucune poignée n'est fournie, l'élément entier devient la poignée
    if (handles.length === 0 || !handles[0]) {
        element.onmousedown = dragMouseDown;
        element.ontouchstart = touchDragStart;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // Obtenir la position de la souris au démarrage
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // Appeler la fonction quand la souris bouge
        document.onmousemove = elementDrag;
    }
    
    // Fonction pour gérer les événements tactiles
    function touchDragStart(e) {
        if (e.touches && e.touches.length === 1) {
            e.preventDefault();
            const touch = e.touches[0];
            pos3 = touch.clientX;
            pos4 = touch.clientY;
            document.ontouchend = closeDragElement;
            document.ontouchcancel = closeDragElement;
            document.ontouchmove = elementTouchDrag;
        }
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // Calculer la nouvelle position
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        // Limiter le déplacement pour ne pas sortir de la fenêtre
        const newTop = (element.offsetTop - pos2);
        const newLeft = (element.offsetLeft - pos1);
        
        // Empêcher de sortir à gauche ou en haut
        if (newTop < 0) pos2 = element.offsetTop;
        if (newLeft < 0) pos1 = element.offsetLeft;
        
        // Empêcher de sortir à droite ou en bas
        const maxRight = window.innerWidth - element.offsetWidth;
        const maxBottom = window.innerHeight - element.offsetHeight;
        
        if (newLeft > maxRight) pos1 = element.offsetLeft - maxRight;
        if (newTop > maxBottom) pos2 = element.offsetTop - maxBottom;
        
        // Définir la nouvelle position de l'élément
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }
    
    // Fonction pour gérer le déplacement tactile
    function elementTouchDrag(e) {
        if (e.touches && e.touches.length === 1) {
            e.preventDefault();
            const touch = e.touches[0];
            
            pos1 = pos3 - touch.clientX;
            pos2 = pos4 - touch.clientY;
            pos3 = touch.clientX;
            pos4 = touch.clientY;
            
            // Appliquer les mêmes limites que pour la souris
            const newTop = (element.offsetTop - pos2);
            const newLeft = (element.offsetLeft - pos1);
            
            if (newTop < 0) pos2 = element.offsetTop;
            if (newLeft < 0) pos1 = element.offsetLeft;
            
            const maxRight = window.innerWidth - element.offsetWidth;
            const maxBottom = window.innerHeight - element.offsetHeight;
            
            if (newLeft > maxRight) pos1 = element.offsetLeft - maxRight;
            if (newTop > maxBottom) pos2 = element.offsetTop - maxBottom;
            
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
        }
    }

    function closeDragElement() {
        // Arrêter de déplacer quand on relâche la souris ou le toucher
        document.onmouseup = null;
        document.onmousemove = null;
        document.ontouchend = null;
        document.ontouchcancel = null;
        document.ontouchmove = null;
        
        // Sauvegarder la position si la fonction existe
        if (typeof saveHeatmapPosition === 'function') {
            saveHeatmapPosition();
        }
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
                // console.log(" DEBUG : geocodeLocation ", place, coords)
                
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




















// Variable globale pour le cache
let geolocalisationCache = null;

// Fonction pour charger le fichier au démarrage
export async function loadGeolocalisationFile() {
    try {
        // Déterminer le fichier à charger selon le propriétaire de l'arbre
        const geoFileName = state.treeOwner === 2 ? 'geolocalisationX.json' : 'geolocalisation.json';
        console.log(`Chargement du fichier de géolocalisation: ${geoFileName} pour treeOwner=${state.treeOwner}`);
        
        // Vérifier d'abord si le fichier existe
        const response = await fetch(geoFileName, { method: 'HEAD' });
        
        if (response.ok) {
            // Charger le contenu du fichier
            const dataResponse = await fetch(geoFileName);
            geolocalisationCache = await dataResponse.json();
            console.log(`Fichier ${geoFileName} chargé avec succès`);
            return true;
        } else {
            console.warn(`Le fichier ${geoFileName} n'a pas été trouvé. Statut: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.error('Erreur lors du chargement du fichier de géolocalisation:', error);
        return false;
    }
}

export async function geocodeLocation(location) {
    if (!location || location.trim() === '') return null;

    // Si le cache est disponible, chercher d'abord dedans

    // console.log(" DEBUG : in geocodeLocation ", location, geolocalisationCache, geolocalisationCache[location])

    if (geolocalisationCache && geolocalisationCache[location]) {
        return geolocalisationCache[location];
    }

    try {

        console.log(" DEBUG : in geocodeLocation  SEARCH ... ", location)

        await delay(Math.random() * 500);

        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`, {
            headers: {
                'User-Agent': 'GenealogyTreeApp/1.0'
            }
        });

        if (!response.ok) {
            console.error('Erreur de réponse:', response.status);
            return null;
        }

        const data = await response.json();
        
        return data && data.length > 0 ? {
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon)
        } : null;
    } catch (error) {
        console.error('Erreur de géocodage pour', location, ':', error);
        return null;
    }
}

// Fonction modifiée pour générer le fichier de géolocalisation approprié
export function generateGeocodeFile() {
    generateGeocodeFileInternal();
}

// Rendre la fonction accessible globalement
window.generateGeocodeFile = generateGeocodeFile;

async function generateGeocodeFileInternal() {
    const statusDiv = document.getElementById('geocoding-status');
    const progressBar = document.getElementById('geocoding-bar');
    const resultsList = document.getElementById('geocoding-results');
    const maxLocations = parseInt(document.getElementById('maxLocations').value) || 0;
    
    document.getElementById('geocoding-progress').style.display = 'block';
    resultsList.style.display = 'block';
    resultsList.innerHTML = '';

    // Collecter tous les lieux uniques
    const locations = new Set();
    for (const person of Object.values(state.gedcomData.individuals)) {
        if (person.birthPlace) locations.add(person.birthPlace);
        if (person.deathPlace) locations.add(person.deathPlace);
        if (person.residPlace1) locations.add(person.residPlace1);
        if (person.residPlace2) locations.add(person.residPlace2);
        if (person.residPlace3) locations.add(person.residPlace3);

        if (person.spouseFamilies) {
            person.spouseFamilies.forEach(famId => {
                const family = state.gedcomData.families[famId];
                if (family?.marriagePlace) locations.add(family.marriagePlace);
            });
        }
    }

    // Convertir en array et limiter si nécessaire
    let locationsArray = Array.from(locations);
    if (maxLocations > 0) {
        locationsArray = locationsArray.slice(0, maxLocations);
    }

    const totalLocations = locationsArray.length;
    let processed = 0;
    const geolocalisationData = {};

    // Déterminer le nom de fichier à charger/générer
    const geoFileName = state.treeOwner === 2 ? 'geolocalisationX.json' : 'geolocalisation.json';

    // Charger les données existantes si disponibles
    try {
        const response = await fetch(geoFileName);
        if (response.ok) {
            const existingData = await response.json();
            Object.assign(geolocalisationData, existingData);
            console.log(`Données existantes chargées depuis ${geoFileName}`);
        }
    } catch (error) {
        // Pas de fichier existant, on continue
        console.log(`Aucun fichier ${geoFileName} existant, création d'un nouveau fichier`);
    }

    for (const location of locationsArray) {
        statusDiv.textContent = `Géocodage: ${processed + 1}/${totalLocations} - ${location}`;
        progressBar.value = (processed / totalLocations) * 100;

        try {
            if (geolocalisationData[location]) {
                resultsList.innerHTML += `<option style="color: blue;">↺ ${location} (cache)</option>`;
            } else {
                const coords = await geocodeLocation(location);
                if (coords) {
                    geolocalisationData[location] = coords;
                    resultsList.innerHTML += `<option style="color: green;">✓ ${location}</option>`;
                } else {
                    resultsList.innerHTML += `<option style="color: red;">✗ ${location}</option>`;
                }
            }
        } catch (error) {
            resultsList.innerHTML += `<option style="color: red;">✗ ${location} (${error.message})</option>`;
        }

        processed++;
        if (!geolocalisationData[location]) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    // Générer le fichier
    const blob = new Blob([JSON.stringify(geolocalisationData, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = geoFileName;  // Utiliser le nom de fichier approprié
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    statusDiv.textContent = `Terminé ! ${processed} lieux traités et sauvegardés dans ${geoFileName}`;
    progressBar.value = 100;
}
