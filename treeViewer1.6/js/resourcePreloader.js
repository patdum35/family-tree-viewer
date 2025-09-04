/**
 * resourcePreloader.js - Gestion des fichiers importants en cache
 * Complètement séparé de mapTilesPreloader.js
 */

// Import de debugLog si disponible
import { debugLog } from './debugLogUtils.js';

// Nom du cache pour les ressources importantes
const APP_CACHE_NAME = 'app-resources-cache-v2';

// Liste des ressources importantes à précharger
const RESOURCES_TO_CACHE = [
  // Fichiers critiques .enc
  './arbre.enc',
  './arbreX.enc',
  './arbreB.enc',
  './arbreC.enc',
  './arbreG.enc',
  './arbreLE.enc',

  // Fichiers JSON
  './geolocalisation.json',
  './geolocalisationX.json',
  './geolocalisationB.json',
  './geolocalisationC.json',
  './geolocalisationG.json',
  './geolocalisationLE.json',

  // Images
  './background_images/contemporain.jpg',
  './background_images/fort_lalatte.jpg',
  './background_images/bois.jpg',
  './background_images/contemporain.jpx',
  './background_images/republique.jpg',
  './background_images/fort_lalatte.jpx',
  './background_images/thomas.jpx',
  './background_images/steph.jpx',
  './background_images/garand.jpx',
  './background_images/charlemagne.jpx',
  './background_images/hugues.jpx',
  './background_images/brigitte.jpx',
  './background_images/kamber.jpx',
  './background_images/pharabert.jpx',
  './background_images/dominique.jpx',
  './background_images/riad.jpx',
  
  // Sons
  './sounds/lalatte.mpx'
];

/**
 * Fonction utilitaire pour logger
 * Utilise debugLog s'il est disponible, sinon console.log
 */
function log(message, type = 'info') {
  if (typeof debugLog === 'function') {
    debugLog(message, type);
  } else {
    if (type === 'error') console.error(message);
    else if (type === 'warning') console.warn(message);
    else console.log(message);
  }
}



// Ajouter cette fonction de debug
async function debugCacheContent() {
    try {
        const cacheNames = await caches.keys();
        console.log("🔍 Caches disponibles:", cacheNames);
        
        if (cacheNames.includes(APP_CACHE_NAME)) {
            const cache = await caches.open(APP_CACHE_NAME);
            const requests = await cache.keys();
            // console.log(`🔍 Contenu du cache ${APP_CACHE_NAME}:`, requests.length, "entrées");
            requests.forEach(req => console.log("  -", req.url));
        } else {
            console.log("❌ Cache APP_CACHE_NAME introuvable");
        }
    } catch (error) {
        console.error("❌ Erreur debug cache:", error);
    }
}


// Ajouter cette fonction avant initResourcePreloading()
async function checkResourceCacheStatus() {
    try {
        const cacheNames = await caches.keys();
        console.log("🔍 TOUS les caches:", cacheNames); // AJOUTER CETTE LIGNE
        
        const hasCache = cacheNames.includes(APP_CACHE_NAME);
        
        if (!hasCache) {
            console.log(`❌ Cache ${APP_CACHE_NAME} introuvable dans:`, cacheNames); // AJOUTER
            return { hasCache: false, hasContent: false };
        }
        
        const cache = await caches.open(APP_CACHE_NAME);
        const cachedRequests = await cache.keys();
        const hasContent = cachedRequests.length > 0;
        
        console.log(`📊 Statut du cache ressources: ${cachedRequests.length} ressources en cache`);
        log(`📊 Statut du cache ressources: ${cachedRequests.length} ressources en cache`, 'info');
        
        return { hasCache: true, hasContent };
    } catch (error) {
        console.error("❌ Erreur lors de la vérification du cache ressources:", error);
        log(`❌ Erreur lors de la vérification du cache ressources: ${error.message}`, 'error');
        return { hasCache: false, hasContent: false };
    }
}

// Modifier initResourcePreloading() pour devenir async et ajouter la vérification :
export async function initResourcePreloading() {
    console.log("🚀 Initialisation du préchargement des ressources...");
    log("🚀 Initialisation du préchargement des ressources...", 'info');
    

// DEBUG: Afficher le contenu actuel du cache
    await debugCacheContent();


    if (!('caches' in window)) {
        console.warn("⚠️ Cache API non supportée par ce navigateur");
        log("⚠️ Cache API non supportée par ce navigateur", 'warning');
        return false;
    }
    
    // NOUVEAU : Vérifier si le cache existe déjà et n'est pas vide
    const cacheExists = await checkResourceCacheStatus();
    
    if (cacheExists.hasCache && cacheExists.hasContent) {
        console.log("✅ Cache des ressources déjà présent, préchargement ignoré");
        log("✅ Cache des ressources déjà présent, préchargement ignoré", 'info');
        return true;
    }
    
    // Précharger les ressources importantes
    preloadAppResources();
    
    return true;
}







// /**
//  * Initialise le préchargement des ressources
//  * À appeler au chargement de la page
//  */
// export function initResourcePreloading() {
//     console.log("🚀 Initialisation du préchargement des ressources...");
//     log("🚀 Initialisation du préchargement des ressources...", 'info');
    
//     // Vérifier si le navigateur supporte le Cache API
//     if (!('caches' in window)) {
//         console.warn("⚠️ Cache API non supportée par ce navigateur");
//         log("⚠️ Cache API non supportée par ce navigateur", 'warning');
//         return false;
//     }
    
//     // Précharger les ressources importantes
//     preloadAppResources();
    
//     return true;
// }

/**
 * Précharge les ressources importantes de l'application
 */
async function preloadAppResources() {
    console.log(`🔄 Préchargement de ${RESOURCES_TO_CACHE.length} ressources de l'application...`);
    log(`🔄 Préchargement de ${RESOURCES_TO_CACHE.length} ressources importantes...`, 'info');
    
    // Créer un élément de notification pour l'utilisateur
    let  notification;
    if (window.CURRENT_LANGUAGE == "fr") {
        notification = createPreloadNotification("Préchargement des ressources...");
    } else if (window.CURRENT_LANGUAGE == "en") {
        notification = createPreloadNotification("Preloading resources...");
    } else if (window.CURRENT_LANGUAGE == "es") {
        notification = createPreloadNotification("Precargando recursos...");
    } else if (window.CURRENT_LANGUAGE == "hu") {
        notification = createPreloadNotification("Előtolás...");
    }
    
    document.body.appendChild(notification);
    
    // Ouvrir ou créer le cache
    try {
        const cache = await caches.open(APP_CACHE_NAME);
        let loadedCount = 0;
        let skippedCount = 0;
        
        // Utiliser processInChunks pour ne pas bloquer l'interface
        await processInChunks(RESOURCES_TO_CACHE, async (resourceUrl) => {
            try {
                // Vérifier si la ressource est déjà en cache
                const cachedResponse = await cache.match(resourceUrl);
                
                if (!cachedResponse) {
                    // Déterminer le type MIME approprié (pour aider les navigateurs mobiles)
                    let mimeType = '*/*';
                    if (resourceUrl.endsWith('.jpg')) mimeType = 'image/jpeg';
                    if (resourceUrl.endsWith('.mp3')) mimeType = 'audio/mpeg';
                    if (resourceUrl.endsWith('.json')) mimeType = 'application/json';
                    if (resourceUrl.endsWith('.enc')) mimeType = 'application/octet-stream';
                    
                    // Charger et mettre en cache la ressource
                    const response = await fetch(resourceUrl, { 
                        method: 'GET',
                        cache: 'no-cache',
                        mode: 'no-cors',
                        headers: {
                          'Accept': mimeType,
                          'X-Requested-With': 'no-sw-intercept'  // Marqueur spécial
                        }
                    });
                    
                    if (response.ok || response.type === 'opaque') {
                        await cache.put(resourceUrl, response.clone());
                        loadedCount++;
                        
                        // Log détaillé pour les fichiers importants
                        if (resourceUrl.endsWith('.enc')) {
                            console.log(`✅ Fichier critique mis en cache: ${resourceUrl}`);
                            log(`✅ Fichier critique mis en cache: ${resourceUrl}`, 'success');
                        }
                        
                        // Mettre à jour la notification
                        updatePreloadNotification(notification, loadedCount + skippedCount, RESOURCES_TO_CACHE.length);
                    }
                } else {
                    // La ressource est déjà en cache
                    skippedCount++;
                }
            } catch (e) {
                console.warn(`⚠️ Impossible de précharger: ${resourceUrl}`, e);
                log(`⚠️ Impossible de précharger: ${resourceUrl} - ${e.message}`, 'warning');
            }
        }, 2, 100); // Traiter 2 ressources à la fois, avec 100ms de pause entre les lots
        
        // Mise à jour finale de la notification
        updatePreloadNotification(notification, loadedCount + skippedCount, RESOURCES_TO_CACHE.length);
        
        // Faire disparaître la notification après 3 secondes
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
        
        console.log(`✅ Préchargement des ressources terminé: ${loadedCount} nouvelles, ${skippedCount} déjà en cache`);
        log(`✅ Préchargement des ressources terminé: ${loadedCount} nouvelles, ${skippedCount} déjà en cache`, 'success');
        
        // Vérifier spécifiquement les fichiers .enc
        verifyEncFiles(cache);
    } catch (error) {
        console.error("❌ Erreur lors du préchargement des ressources:", error);
        log(`❌ Erreur lors du préchargement des ressources: ${error.message}`, 'error');
        notification.remove();
    }
}

/**
 * Vérifier spécifiquement que les fichiers .enc sont bien en cache
 */
async function verifyEncFiles(cache) {
    const encFiles = ['./arbre.enc', './arbreX.enc', './arbreB.enc', './arbreC.enc', './arbreG.enc', './arbreLE.enc'];
    
    log("🔍 Vérification des fichiers .enc en cache:", 'info');
    
    for (const file of encFiles) {
        try {
            const response = await cache.match(file);
            if (response) {
                console.log(`✅ Fichier .enc trouvé en cache: ${file}`);
                log(`✅ Fichier .enc trouvé en cache: ${file}`, 'success');
            } else {
                console.warn(`⚠️ Fichier .enc NON trouvé en cache: ${file}`);
                log(`⚠️ Fichier .enc NON trouvé en cache: ${file}`, 'warning');
            }
        } catch (error) {
            console.error(`❌ Erreur lors de la vérification de ${file}:`, error);
            log(`❌ Erreur lors de la vérification de ${file}: ${error.message}`, 'error');
        }
    }
}

/**
 * Traite des éléments par lot pour éviter de bloquer l'interface
 * COPIE de la fonction de mapTilesPreloader pour éviter les dépendances
 */
async function processInChunks(items, processor, chunkSize = 10, delay = 20) {
    for (let i = 0; i < items.length; i += chunkSize) {
        const chunk = items.slice(i, i + chunkSize);
        
        // Traiter le lot actuel
        const promises = chunk.map(item => processor(item));
        await Promise.all(promises);
        
        // Pause pour permettre à l'interface de répondre
        if (i + chunkSize < items.length && delay > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

/**
 * Crée un élément de notification visuelle pour le préchargement
 * COPIE de la fonction de mapTilesPreloader pour éviter les dépendances
 */
function createPreloadNotification(message) {
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.padding = '10px 15px';
    notification.style.background = 'rgba(0, 0, 0, 0.7)';
    notification.style.color = 'white';
    notification.style.borderRadius = '5px';
    notification.style.fontSize = '14px';
    notification.style.zIndex = '9999';
    notification.style.transition = 'opacity 0.5s';
    notification.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    notification.innerHTML = `<div>${message}</div><div><progress id="resource-progress" value="0" max="100" style="width: 100%;"></progress></div>`;
    
    return notification;
}

/**
 * Met à jour la notification de préchargement
 * COPIE de la fonction de mapTilesPreloader pour éviter les dépendances
 */
function updatePreloadNotification(notification, current, total) {
    const progress = notification.querySelector('progress');
    const percentage = Math.round((current / total) * 100);
    
    progress.value = percentage;
    if (window.CURRENT_LANGUAGE == "fr") {
        notification.firstChild.textContent = `Préchargement: ${current}/${total} (${percentage}%)`;
    } else if (window.CURRENT_LANGUAGE == "en") {
        notification.firstChild.textContent = `Preloading: ${current}/${total} (${percentage}%)`;
    } else if (window.CURRENT_LANGUAGE == "es") {
        notification.firstChild.textContent = `Precargando: ${current}/${total} (${percentage}%)`;
    } else if (window.CURRENT_LANGUAGE == "hu") {
        notification.firstChild.textContent = `Előtolás: ${current}/${total} (${percentage}%)`;
    }
}

/**
 * Intercepteur pour utiliser les ressources en cache lorsque disponibles
 * @param {string} url - URL de la ressource
 * @returns {Promise<Response>} - Réponse HTTP
 */
export async function fetchResourceWithCache(url) {
    // Vérifier si le navigateur supporte le Cache API
    if (!('caches' in window)) {
        return fetch(url, {
            headers: {
                'X-Requested-With': 'no-sw-intercept'
            }
        });
    }
    
    try {
        // Vérifier si la ressource est dans le cache
        const cache = await caches.open(APP_CACHE_NAME);
        const cachedResponse = await cache.match(url);
        
        if (cachedResponse) {
            // Utiliser la version en cache
            console.log(`📦 Utilisé depuis le cache: ${url}`);
            return cachedResponse;
        }
        
        // Si pas en cache, faire une requête réseau AVEC le header spécial
        const networkResponse = await fetch(url, {
            headers: {
                'X-Requested-With': 'no-sw-intercept'
            }
        });
        
        // Mettre en cache pour la prochaine fois
        if (networkResponse.ok || networkResponse.type === 'opaque') {
            cache.put(url, networkResponse.clone());
            console.log(`💾 Mis en cache après récupération: ${url}`);
        }
        
        return networkResponse;
    } catch (error) {
        console.warn(`⚠️ Erreur lors de la récupération de ${url}:`, error);
        
        return fetch(url, {
            headers: {
                'X-Requested-With': 'no-sw-intercept'
            }
        });
    }
}

/**
 * Fonction pour vérifier le contenu du cache des ressources
 * Peut être utilisée depuis le DebugPanel
 */
export async function verifyResourceCache() {
    log("=== VÉRIFICATION DES RESSOURCES EN CACHE ===", 'info');
    
    try {
        // Ouvrir le cache
        const cache = await caches.open(APP_CACHE_NAME);
        
        // Obtenir toutes les entrées
        const entries = await cache.keys();
        
        if (entries.length === 0) {
            log("❌ Aucune ressource en cache!", 'error');
            return;
        }
        
        // Compter par type
        const urls = entries.map(req => req.url);
        const counts = {
            total: entries.length,
            enc: urls.filter(url => url.endsWith('.enc')).length,
            jpg: urls.filter(url => url.endsWith('.jpg')).length,
            mp3: urls.filter(url => url.endsWith('.mp3')).length,
            json: urls.filter(url => url.endsWith('.json')).length
        };
        
        // Logguer les résultats
        log(`📊 Ressources en cache: ${counts.total} total, ${counts.enc} .enc, ${counts.jpg} .jpg, ${counts.mp3} .mp3, ${counts.json} .json`, 'info');
        
        // Vérifier les fichiers .enc
        log("=== FICHIERS .ENC ===", 'info');
        
        const encFiles = entries.filter(req => req.url.endsWith('.enc'));
        for (const req of encFiles) {
            const url = new URL(req.url);
            const fileName = url.pathname.split('/').pop();
            log(`✅ ${fileName}`, 'success');
        }
        
        // Vérifier les fichiers .jpg
        log("=== FICHIERS .JPG ===", 'info');
        
        const jpgFiles = entries.filter(req => req.url.endsWith('.jpg'));
        for (const req of jpgFiles) {
            const url = new URL(req.url);
            const fileName = url.pathname.split('/').pop();
            log(`✅ ${fileName}`, 'success');
        }
        
        // Vérifier les fichiers .mp3
        if (counts.mp3 > 0) {
            log("=== FICHIERS .MP3 ===", 'info');
            
            const mp3Files = entries.filter(req => req.url.endsWith('.mp3'));
            for (const req of mp3Files) {
                const url = new URL(req.url);
                const fileName = url.pathname.split('/').pop();
                log(`✅ ${fileName}`, 'success');
            }
        }
        
        // Vérifier les fichiers .json
        if (counts.json > 0) {
            log("=== FICHIERS .JSON ===", 'info');
            
            const jsonFiles = entries.filter(req => req.url.endsWith('.json'));
            for (const req of jsonFiles) {
                const url = new URL(req.url);
                const fileName = url.pathname.split('/').pop();
                log(`✅ ${fileName}`, 'success');
            }
        }
        
        // Vérifier spécifiquement arbre.enc et arbreX.enc
        for (const file of ['arbre.enc', 'arbreX.enc', './arbreB.enc', './arbreC.enc', './arbreG.enc', './arbreLE.enc']) {
            const isInCache = entries.some(req => req.url.includes(file));
            log(`${file}: ${isInCache ? '✅ En cache' : '❌ Absent'}`, isInCache ? 'success' : 'error');
        }
        
        return counts;
    } catch (error) {
        log(`❌ Erreur lors de la vérification du cache: ${error.message}`, 'error');
        return null;
    }
}



