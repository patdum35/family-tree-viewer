// geoLocalisation.js
import { state } from './main.js';
import { debugLog } from './debugLogUtils.js'
import { fetchResourceWithCache } from './resourcePreloader.js';


function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}



// Variable globale pour le cache
let geolocalisationCache = null;


// Version qui va directement chercher dans le bon cache
export async function loadGeolocalisationFile() {
    try {
        // Déterminer le fichier à charger selon le propriétaire de l'arbre
        const geoFileName = state.treeOwner === 2 ? 'geolocalisationX.json' : 'geolocalisation.json';
        
        console.log(`Chargement du fichier de géolocalisation: ${geoFileName} pour treeOwner=${state.treeOwner}`);
        debugLog(`🌍 Tentative de chargement: ${geoFileName}`, 'geoLocalisation');
        
        // Essayer d'abord de charger depuis le cache
        let jsonData = await loadFromCache(geoFileName);
        
        if (jsonData) {
            geolocalisationCache = jsonData;
            console.log(`✅ Fichier ${geoFileName} chargé depuis le cache`);
            debugLog(`✅ Géolocalisation chargée depuis cache: ${Object.keys(geolocalisationCache).length} entrées`, 'geoLocalisation');
            return true;
        }
        
        // Fallback : essayer avec fetch normal (mode connecté)
        console.log('🔄 Tentative de chargement depuis le réseau...');
        debugLog('🔄 Chargement réseau', 'geoLocalisation');
        
        const response = await fetch(geoFileName);
        
        if (response.ok) {
            geolocalisationCache = await response.json();
            console.log(`✅ Fichier ${geoFileName} chargé depuis le réseau`);
            debugLog(`✅ Géolocalisation chargée depuis réseau: ${Object.keys(geolocalisationCache).length} entrées`, 'geoLocalisation');
            return true;
        } else {
            console.warn(`❌ Le fichier ${geoFileName} n'a pas pu être chargé. Statut: ${response.status}`);
            debugLog(`❌ Échec réseau: statut ${response.status}`, 'geoLocalisation');
            return false;
        }
        
    } catch (error) {
        console.error('🔥 Erreur lors du chargement du fichier de géolocalisation:', error);
        debugLog(`🔥 Erreur géolocalisation: ${error.message}`, 'geoLocalisation');
        return false;
    }
}

// Fonction pour charger depuis le cache directement
async function loadFromCache(fileName) {
    try {
        // Chercher dans tous les caches disponibles
        const cacheNames = await caches.keys();
        
        for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName);
            const cachedResponse = await cache.match(fileName);
            
            if (cachedResponse) {
                console.log(`📦 ${fileName} trouvé dans le cache: ${cacheName}`);
                debugLog(`📦 Trouvé dans cache: ${cacheName}`, 'geoLocalisation');
                
                const jsonData = await cachedResponse.json();
                return jsonData;
            }
        }
        
        console.log(`📦 ${fileName} non trouvé dans aucun cache`);
        debugLog(`📦 Absent des caches`, 'geoLocalisation');
        return null;
        
    } catch (error) {
        console.error('Erreur lors de la lecture du cache:', error);
        debugLog(`🔥 Erreur lecture cache: ${error.message}`, 'geoLocalisation');
        return null;
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


// export async function geocodeLocation(location) {
//     if (!location || location.trim() === '') return null;

//     // Si le cache est disponible, chercher d'abord dedans

//     // console.log(" DEBUG : in geocodeLocation ", location, geolocalisationCache, geolocalisationCache[location])

//     // if (geolocalisationCache && geolocalisationCache[location]) {
//     //     return geolocalisationCache[location];
//     // }

//     try {

//         console.log(" DEBUG : in geocodeLocation  SEARCH ... ", location,)

//         await delay(Math.random() * 500);

//         // const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`, {
//         //     headers: {
//         //         'User-Agent': 'GenealogyTreeApp/1.0'
//         //     }
//         // });

//         // console.log(" DEBUG : in geocodeLocation  RESPONSE ... ", response)




//         // AJOUT D'UN TIMESTAMP pour éviter le cache
//         const timestamp = Date.now();
//         const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&_t=${timestamp}`;
        
//         const response = await fetch(url, {
//             headers: {
//                 'User-Agent': 'GenealogyTreeApp/1.0',
//                 'Cache-Control': 'no-cache, no-store, must-revalidate',
//                 'Pragma': 'no-cache',
//                 'Expires': '0'
//             }
//         });

//         console.log(" DEBUG : in geocodeLocation  RESPONSE ... ", response)
//         console.log(" DEBUG : URL réelle :", response.url) // VÉRIFIER QUE L'URL CHANGE











//         if (!response.ok) {
//             console.error('Erreur de réponse:', response.status);
//             return null;
//         }

//         const data = await response.json();
        
//         return data && data.length > 0 ? {
//             lat: parseFloat(data[0].lat),
//             lon: parseFloat(data[0].lon)
//         } : null;
//     } catch (error) {
//         console.error('Erreur de géocodage pour', location, ':', error);
//         return null;
//     }
// }




// export async function geocodeLocation(location) {
//     if (!location || location.trim() === '') return null;

//     // DIAGNOSTIC CRUCIAL
//     console.log("🔍 VALEUR EXACTE DE location:", JSON.stringify(location));
//     console.log("🔍 TYPE DE location:", typeof location);
//     console.log("🔍 LONGUEUR DE location:", location.length);

//     try {
//         console.log(" DEBUG : in geocodeLocation  SEARCH ... ", location)

//         await delay(Math.random() * 1000);

//         const timestamp = Date.now();
//         const encodedLocation = encodeURIComponent(location);
//         const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedLocation}&_t=${timestamp}`;
        
//         console.log("🔍 URL CONSTRUITE:", url);
        
//         const response = await fetch(url, {
//             headers: {
//                 'User-Agent': 'GenealogyTreeApp/1.0',
//                 'Cache-Control': 'no-cache, no-store, must-revalidate',
//                 'Pragma': 'no-cache',
//                 'Expires': '0'
//             }
//         });

//         console.log(" DEBUG : in geocodeLocation  RESPONSE ... ", response)
//         console.log(" DEBUG : URL réelle :", response.url)

//         if (!response.ok) {
//             console.error('Erreur de réponse:', response.status);
//             return null;
//         }

//         const data = await response.json();
//         console.log(" DEBUG : DATA reçue :", data);
        
//         return data && data.length > 0 ? {
//             lat: parseFloat(data[0].lat),
//             lon: parseFloat(data[0].lon)
//         } : null;
//     } catch (error) {
//         console.error('Erreur de géocodage pour', location, ':', error);
//         return null;
//     }
// }


// export async function geocodeLocation(location) {
//     if (!location || location.trim() === '') return null;

//     try {
//         console.log(" DEBUG : in geocodeLocation  SEARCH ... ", location)

//         await delay(Math.random() * 1000);

//         const timestamp = Date.now();
//         const encodedLocation = encodeURIComponent(location);
//         const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedLocation}&_t=${timestamp}`;
        
//         console.log("🔍 URL CONSTRUITE:", url);
        
//         const response = await fetch(url, {
//             headers: {
//                 'User-Agent': 'GenealogyTreeApp/1.0',
//                 'Cache-Control': 'no-cache, no-store, must-revalidate',
//                 'Pragma': 'no-cache',
//                 'Expires': '0'
//             }
//         });

//         console.log(" DEBUG : response.bodyUsed AVANT:", response.bodyUsed);
//         console.log(" DEBUG : URL réelle :", response.url);

//         if (!response.ok) {
//             console.error('Erreur de réponse:', response.status);
//             return null;
//         }

//         // CLONER la réponse pour éviter bodyUsed
//         const responseClone = response.clone();
//         const data = await responseClone.json();
        
//         console.log(" DEBUG : response.bodyUsed APRÈS:", response.bodyUsed);
//         console.log(" DEBUG : DATA reçue :", data);
        
//         return data && data.length > 0 ? {
//             lat: parseFloat(data[0].lat),
//             lon: parseFloat(data[0].lon)
//         } : null;
//     } catch (error) {
//         console.error('Erreur de géocodage pour', location, ':', error);
//         return null;
//     }
// }





/* */















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
        console.log("🔍 ITERATION - location courante:", JSON.stringify(location));
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
                console.log(`Géocodage de ${location}...`, 'coords:', coords);
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
