// geoLocalisation.js
import { state } from './main.js';


function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
    try {fapply
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
