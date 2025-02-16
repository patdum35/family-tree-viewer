// geoLocalisation.js
import { state } from './main.js';
import { displayPersonDetails } from './modalWindow.js';
import { buildAncestorTree, buildDescendantTree} from './treeOperations.js';

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

export async function geocodeLocation(location) {
    if (!location || location.trim() === '') return null;

    try {
        // Ajout d'un délai aléatoire pour éviter la surcharge
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

function createInteractiveHeatmap(locationData, heatmapName) {
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
                <p><strong>Coordonnées :</strong> ${location.coords.lat.toFixed(4)}, ${location.coords.lon.toFixed(4)}</p>
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