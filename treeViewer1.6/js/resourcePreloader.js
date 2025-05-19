/**
 * resourcePreloader.js - Gestion des fichiers importants en cache
 * Complètement séparé de mapTilesPreloader.js
 */

// Import de debugLog si disponible
import { debugLog } from './debugLogUtils.js';

// Nom du cache pour les ressources importantes
const APP_CACHE_NAME = 'app-resources-cache-v1';

// Liste des ressources importantes à précharger
const RESOURCES_TO_CACHE = [
  // Fichiers critiques .enc
  './arbre.enc',
  './arbreX.enc',
  
  // Fichiers JSON
  './geolocalisation.json',
  './geolocalisationX.json',
  
  // Images
  './background_images/contemporain.jpg',
  './background_images/fort_lalatte.jpg',
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

/**
 * Initialise le préchargement des ressources
 * À appeler au chargement de la page
 */
export function initResourcePreloading() {
    console.log("🚀 Initialisation du préchargement des ressources...");
    log("🚀 Initialisation du préchargement des ressources...", 'info');
    
    // Vérifier si le navigateur supporte le Cache API
    if (!('caches' in window)) {
        console.warn("⚠️ Cache API non supportée par ce navigateur");
        log("⚠️ Cache API non supportée par ce navigateur", 'warning');
        return false;
    }
    
    // Précharger les ressources importantes
    preloadAppResources();
    
    return true;
}

/**
 * Précharge les ressources importantes de l'application
 */
async function preloadAppResources() {
    console.log(`🔄 Préchargement de ${RESOURCES_TO_CACHE.length} ressources de l'application...`);
    log(`🔄 Préchargement de ${RESOURCES_TO_CACHE.length} ressources importantes...`, 'info');
    
    // Créer un élément de notification pour l'utilisateur
    const notification = createPreloadNotification("Préchargement des ressources...");
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
    const encFiles = ['./arbre.enc', './arbreX.enc'];
    
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
    notification.firstChild.textContent = `Préchargement: ${current}/${total} (${percentage}%)`;
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
        for (const file of ['arbre.enc', 'arbreX.enc']) {
            const isInCache = entries.some(req => req.url.includes(file));
            log(`${file}: ${isInCache ? '✅ En cache' : '❌ Absent'}`, isInCache ? 'success' : 'error');
        }
        
        return counts;
    } catch (error) {
        log(`❌ Erreur lors de la vérification du cache: ${error.message}`, 'error');
        return null;
    }
}











// /**
//  * Système de préchargement des ressources importantes en tâche de fond
//  * Basé sur le mapTilesPreloader.js qui fonctionne correctement
//  */

// // Noms des caches spécifiques pour chaque type de ressource
// const TILE_CACHE_NAME = 'map-tiles-cache-v1';
// const APP_CACHE_NAME = 'app-resources-cache-v1';

// // Liste des ressources importantes à précharger
// const RESOURCES_TO_CACHE = [
//   // Fichiers critiques .enc
//   './arbre.enc',
//   './arbreX.enc',
  
//   // Fichiers JSON
//   './geolocalisation.json',
//   './geolocalisationX.json',
  
//   // Images
//   './background_images/contemporain.jpg',
//   './background_images/republique.jpg',
//   './background_images/fort_lalatte.jpg',
//   './background_images/thomas.jpg',
//   './background_images/steph.jpg',
//   './background_images/garand.jpg',
//   './background_images/charlemagne.jpg',
//   './background_images/hugues.jpg',
//   './background_images/brigitte.jpg',
//   './background_images/kamber.jpg',
//   './background_images/pharabert.jpg',
//   './background_images/dominique.jpg',
//   './background_images/riad.jpg',
  
//   // Sons
//   './sounds/lalatte_remix.mp3'
// ];

// /**
//  * Initialise le préchargement des tuiles et autres ressources
//  * À appeler au chargement de la page
//  */
// export async function initResourcePreloading() {
//     console.log("🚀 Initialisation du préchargement des ressources...");
    
//     // Envoyer un log au DebugPanel si disponible
//     logToDebugPanel("🚀 Initialisation du préchargement des ressources...", 'info');
    
//     // Vérifier si le navigateur supporte le Cache API
//     if (!('caches' in window)) {
//         console.warn("⚠️ Cache API non supportée par ce navigateur");
//         logToDebugPanel("⚠️ Cache API non supportée par ce navigateur", 'warning');
//         return false;
//     }
    
//     try {
//         // 1. Précharger les tuiles si le manifeste existe
//         let tilesLoaded = false;
//         try {
//             const manifestResponse = await fetch('./maps/manifest.json');
            
//             if (manifestResponse.ok) {
//                 const manifest = await manifestResponse.json();
//                 console.log(`📋 Manifeste de tuiles chargé: ${manifest.tileUrls.length} tuiles disponibles`);
//                 logToDebugPanel(`📋 Manifeste de tuiles chargé: ${manifest.tileUrls.length} tuiles disponibles`, 'info');
                
//                 // Lancer le préchargement des tuiles en tâche de fond
//                 preloadTilesInBackground(manifest.tileUrls);
//                 tilesLoaded = true;
//             } else {
//                 console.warn("⚠️ Manifeste de tuiles non trouvé");
//                 logToDebugPanel("⚠️ Manifeste de tuiles non trouvé", 'warning');
//             }
//         } catch (error) {
//             console.warn("⚠️ Erreur lors du chargement du manifeste de tuiles:", error);
//             logToDebugPanel(`⚠️ Erreur lors du chargement du manifeste de tuiles: ${error.message}`, 'warning');
//         }
        
//         // 2. Précharger les ressources de l'application (toujours exécuté)
//         preloadAppResources();
        
//         return true;
//     } catch (error) {
//         console.error("❌ Erreur lors de l'initialisation du préchargement:", error);
//         logToDebugPanel(`❌ Erreur lors de l'initialisation du préchargement: ${error.message}`, 'error');
//         return false;
//     }
// }

// /**
//  * Précharge les tuiles en tâche de fond
//  * @param {Array} tileUrls - Liste des URLs des tuiles à précharger
//  */
// async function preloadTilesInBackground(tileUrls) {
//     // Limiter le nombre de tuiles à précharger pour éviter de surcharger le navigateur
//     const tilesToPreload = tileUrls.slice(0, 2000);
    
//     console.log(`🔄 Préchargement de ${tilesToPreload.length} tuiles en tâche de fond...`);
//     logToDebugPanel(`🔄 Préchargement de ${tilesToPreload.length} tuiles en tâche de fond...`, 'info');
    
//     // Créer un élément de notification pour l'utilisateur
//     const notification = createPreloadNotification("Préchargement des tuiles de carte...");
//     document.body.appendChild(notification);
    
//     // Ouvrir ou créer le cache
//     try {
//         const cache = await caches.open(TILE_CACHE_NAME);
//         let loadedCount = 0;
        
//         // Utiliser processInChunks pour ne pas bloquer l'interface
//         await processInChunks(tilesToPreload, async (tileUrl) => {
//             try {
//                 // Vérifier si la tuile est déjà en cache
//                 const cachedResponse = await cache.match('./maps/' + tileUrl);
                
//                 if (!cachedResponse) {
//                     // Charger et mettre en cache la tuile
//                     const response = await fetch('./maps/' + tileUrl, { 
//                         method: 'GET',
//                         cache: 'no-cache',
//                         mode: 'no-cors',
//                         headers: {
//                           'X-Requested-With': 'no-sw-intercept'  // Marqueur spécial
//                         }
//                     });
                    
//                     if (response.ok || response.type === 'opaque') {
//                         await cache.put('./maps/' + tileUrl, response.clone());
//                         loadedCount++;
                        
//                         // Mettre à jour la notification tous les 10 éléments
//                         if (loadedCount % 10 === 0) {
//                             updatePreloadNotification(notification, loadedCount, tilesToPreload.length);
//                         }
//                     }
//                 } else {
//                     // La tuile est déjà en cache
//                     loadedCount++;
//                 }
//             } catch (e) {
//                 console.warn(`⚠️ Impossible de précharger: ${tileUrl}`, e);
//                 logToDebugPanel(`⚠️ Impossible de précharger la tuile: ${tileUrl}`, 'warning');
//             }
//         }, 10, 20); // Traiter 10 tuiles à la fois, avec 20ms de pause entre les lots
        
//         // Mise à jour finale de la notification
//         updatePreloadNotification(notification, loadedCount, tilesToPreload.length);
        
//         // Faire disparaître la notification après 3 secondes
//         setTimeout(() => {
//             notification.style.opacity = '0';
//             setTimeout(() => notification.remove(), 500);
//         }, 3000);
        
//         console.log(`✅ Préchargement des tuiles terminé: ${loadedCount}/${tilesToPreload.length} tuiles chargées`);
//         logToDebugPanel(`✅ Préchargement des tuiles terminé: ${loadedCount}/${tilesToPreload.length} tuiles chargées`, 'success');
//     } catch (error) {
//         console.error("❌ Erreur lors du préchargement des tuiles:", error);
//         logToDebugPanel(`❌ Erreur lors du préchargement des tuiles: ${error.message}`, 'error');
//         notification.remove();
//     }
// }

// /**
//  * Précharge les ressources importantes de l'application
//  * Utilise exactement la même approche que pour les tuiles
//  */
// async function preloadAppResources() {
//     console.log(`🔄 Préchargement de ${RESOURCES_TO_CACHE.length} ressources de l'application...`);
//     logToDebugPanel(`🔄 Préchargement de ${RESOURCES_TO_CACHE.length} ressources de l'application...`, 'info');
    
//     // Créer un élément de notification pour l'utilisateur
//     const notification = createPreloadNotification("Préchargement des ressources...");
//     document.body.appendChild(notification);
    
//     // Ouvrir ou créer le cache
//     try {
//         const cache = await caches.open(APP_CACHE_NAME);
//         let loadedCount = 0;
//         let skippedCount = 0;
        
//         // Utiliser processInChunks pour ne pas bloquer l'interface
//         await processInChunks(RESOURCES_TO_CACHE, async (resourceUrl) => {
//             try {
//                 // Vérifier si la ressource est déjà en cache
//                 const cachedResponse = await cache.match(resourceUrl);
                
//                 if (!cachedResponse) {
//                     // Déterminer le type MIME approprié (pour aider les navigateurs mobiles)
//                     let mimeType = '*/*';
//                     if (resourceUrl.endsWith('.jpg')) mimeType = 'image/jpeg';
//                     if (resourceUrl.endsWith('.mp3')) mimeType = 'audio/mpeg';
//                     if (resourceUrl.endsWith('.json')) mimeType = 'application/json';
//                     if (resourceUrl.endsWith('.enc')) mimeType = 'application/octet-stream';
                    
//                     // Charger et mettre en cache la ressource
//                     const response = await fetch(resourceUrl, { 
//                         method: 'GET',
//                         cache: 'no-cache',
//                         mode: 'no-cors',
//                         headers: {
//                           'Accept': mimeType,
//                           'X-Requested-With': 'no-sw-intercept'  // Marqueur spécial
//                         }
//                     });
                    
//                     if (response.ok || response.type === 'opaque') {
//                         await cache.put(resourceUrl, response.clone());
//                         loadedCount++;
                        
//                         // Log détaillé pour les fichiers importants
//                         if (resourceUrl.endsWith('.enc')) {
//                             console.log(`✅ Fichier critique mis en cache: ${resourceUrl}`);
//                             logToDebugPanel(`✅ Fichier critique mis en cache: ${resourceUrl}`, 'success');
//                         }
                        
//                         // Mettre à jour la notification tous les 2 éléments
//                         if ((loadedCount + skippedCount) % 2 === 0) {
//                             updatePreloadNotification(notification, loadedCount + skippedCount, RESOURCES_TO_CACHE.length);
//                         }
//                     }
//                 } else {
//                     // La ressource est déjà en cache
//                     skippedCount++;
//                     console.log(`ℹ️ Déjà en cache: ${resourceUrl}`);
//                     logToDebugPanel(`ℹ️ Déjà en cache: ${resourceUrl}`, 'info');
//                 }
//             } catch (e) {
//                 console.warn(`⚠️ Impossible de précharger: ${resourceUrl}`, e);
//                 logToDebugPanel(`⚠️ Impossible de précharger: ${resourceUrl} - ${e.message}`, 'warning');
//             }
//         }, 2, 100); // Traiter 2 ressources à la fois, avec 100ms de pause entre les lots
        
//         // Mise à jour finale de la notification
//         updatePreloadNotification(notification, loadedCount + skippedCount, RESOURCES_TO_CACHE.length);
        
//         // Faire disparaître la notification après 3 secondes
//         setTimeout(() => {
//             notification.style.opacity = '0';
//             setTimeout(() => notification.remove(), 500);
//         }, 3000);
        
//         console.log(`✅ Préchargement des ressources terminé: ${loadedCount} nouvelles, ${skippedCount} déjà en cache`);
//         logToDebugPanel(`✅ Préchargement des ressources terminé: ${loadedCount} nouvelles, ${skippedCount} déjà en cache`, 'success');
        
//         // Vérifier spécifiquement les fichiers .enc
//         verifyEncFiles(cache);
//     } catch (error) {
//         console.error("❌ Erreur lors du préchargement des ressources:", error);
//         logToDebugPanel(`❌ Erreur lors du préchargement des ressources: ${error.message}`, 'error');
//         notification.remove();
//     }
// }

// /**
//  * Vérifier spécifiquement que les fichiers .enc sont bien en cache
//  */
// async function verifyEncFiles(cache) {
//     const encFiles = ['./arbre.enc', './arbreX.enc'];
    
//     logToDebugPanel("🔍 Vérification des fichiers .enc en cache:", 'info');
    
//     for (const file of encFiles) {
//         try {
//             const response = await cache.match(file);
//             if (response) {
//                 console.log(`✅ Fichier .enc trouvé en cache: ${file}`);
//                 logToDebugPanel(`✅ Fichier .enc trouvé en cache: ${file}`, 'success');
//             } else {
//                 console.warn(`⚠️ Fichier .enc NON trouvé en cache: ${file}`);
//                 logToDebugPanel(`⚠️ Fichier .enc NON trouvé en cache: ${file}`, 'warning');
//             }
//         } catch (error) {
//             console.error(`❌ Erreur lors de la vérification de ${file}:`, error);
//             logToDebugPanel(`❌ Erreur lors de la vérification de ${file}: ${error.message}`, 'error');
//         }
//     }
// }

// /**
//  * Traite des éléments par lot pour éviter de bloquer l'interface
//  * @param {Array} items - Éléments à traiter
//  * @param {Function} processor - Fonction de traitement
//  * @param {number} chunkSize - Taille des lots
//  * @param {number} delay - Délai entre les lots en ms
//  */
// async function processInChunks(items, processor, chunkSize = 10, delay = 20) {
//     for (let i = 0; i < items.length; i += chunkSize) {
//         const chunk = items.slice(i, i + chunkSize);
        
//         // Traiter le lot actuel
//         const promises = chunk.map(item => processor(item));
//         await Promise.all(promises);
        
//         // Pause pour permettre à l'interface de répondre
//         if (i + chunkSize < items.length && delay > 0) {
//             await new Promise(resolve => setTimeout(resolve, delay));
//         }
//     }
// }

// /**
//  * Crée un élément de notification visuelle pour le préchargement
//  * @param {string} message - Message initial à afficher
//  * @returns {HTMLElement} - Élément de notification
//  */
// function createPreloadNotification(message) {
//     const notification = document.createElement('div');
//     notification.style.position = 'fixed';
//     notification.style.bottom = '20px';
//     notification.style.right = '20px';
//     notification.style.padding = '10px 15px';
//     notification.style.background = 'rgba(0, 0, 0, 0.7)';
//     notification.style.color = 'white';
//     notification.style.borderRadius = '5px';
//     notification.style.fontSize = '14px';
//     notification.style.zIndex = '9999';
//     notification.style.transition = 'opacity 0.5s';
//     notification.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
//     notification.innerHTML = `<div>${message}</div><div><progress id="resource-progress" value="0" max="100" style="width: 100%;"></progress></div>`;
    
//     return notification;
// }

// /**
//  * Met à jour la notification de préchargement
//  * @param {HTMLElement} notification - Élément de notification
//  * @param {number} current - Nombre de ressources chargées
//  * @param {number} total - Nombre total de ressources
//  */
// function updatePreloadNotification(notification, current, total) {
//     const progress = notification.querySelector('progress');
//     const percentage = Math.round((current / total) * 100);
    
//     progress.value = percentage;
//     notification.firstChild.textContent = `Préchargement: ${current}/${total} (${percentage}%)`;
// }

// /**
//  * Intercepteur pour utiliser les ressources en cache lorsque disponibles
//  * @param {string} url - URL de la ressource
//  * @returns {Promise<Response>} - Réponse HTTP
//  */
// export async function fetchResourceWithCache(url) {
//     // Déterminer le bon cache à utiliser
//     const cacheName = url.includes('/maps/') ? TILE_CACHE_NAME : APP_CACHE_NAME;
    
//     // Vérifier si le navigateur supporte le Cache API
//     if (!('caches' in window)) {
//         return fetch(url, {
//             headers: {
//                 'X-Requested-With': 'no-sw-intercept'
//             }
//         });
//     }
    
//     try {
//         // Vérifier si la ressource est dans le cache
//         const cache = await caches.open(cacheName);
//         const cachedResponse = await cache.match(url);
        
//         if (cachedResponse) {
//             // Utiliser la version en cache
//             console.log(`📦 Utilisé depuis le cache: ${url}`);
//             return cachedResponse;
//         }
        
//         // Si pas en cache, faire une requête réseau AVEC le header spécial
//         const networkResponse = await fetch(url, {
//             headers: {
//                 'X-Requested-With': 'no-sw-intercept'
//             }
//         });
        
//         // Mettre en cache pour la prochaine fois
//         if (networkResponse.ok || networkResponse.type === 'opaque') {
//             cache.put(url, networkResponse.clone());
//             console.log(`💾 Mis en cache après récupération: ${url}`);
//         }
        
//         return networkResponse;
//     } catch (error) {
//         console.warn(`⚠️ Erreur lors de la récupération de ${url}:`, error);
//         logToDebugPanel(`⚠️ Erreur lors de la récupération de ${url}: ${error.message}`, 'warning');
        
//         return fetch(url, {
//             headers: {
//                 'X-Requested-With': 'no-sw-intercept'
//             }
//         });
//     }
// }

// /**
//  * Fonction utilitaire pour envoyer des logs au DebugPanel si disponible
//  * @param {string} message - Message à logger
//  * @param {string} type - Type de log (info, warning, error, success)
//  */
// function logToDebugPanel(message, type = 'info') {

//     debugLog(message, type);
//     // // Vérifier si debugLog est disponible
//     // if (typeof window.debugLog === 'function') {
//     //     window.debugLog(message, type);
//     // } else if (typeof window.state !== 'undefined' && window.state.isDebugLog) {
//     //     // Si la fonction globale n'est pas disponible mais que nous savons que le mode debug est actif
//     //     console.log(`[DEBUG-${type.toUpperCase()}] ${message}`);
        
//     //     // Essayer de l'importer dynamiquement si possible
//     //     import('./debugLogUtils.js').then(module => {
//     //         if (typeof module.debugLog === 'function') {
//     //             module.debugLog(message, type);
//     //         }
//     //     }).catch(() => {
//     //         // Échec silencieux - nous avons déjà loggé dans la console
//     //     });
//     // }
// }

// // Exposer la fonction de vérification pour usage direct
// export async function verifyResourceCache() {
//     try {
//         // Ouvrir le cache
//         const cache = await caches.open(APP_CACHE_NAME);
        
//         // Obtenir toutes les entrées
//         const entries = await cache.keys();
//         const urls = entries.map(req => req.url);
        
//         // Compter par type
//         const counts = {
//             total: entries.length,
//             enc: urls.filter(url => url.endsWith('.enc')).length,
//             jpg: urls.filter(url => url.endsWith('.jpg')).length,
//             mp3: urls.filter(url => url.endsWith('.mp3')).length,
//             json: urls.filter(url => url.endsWith('.json')).length
//         };
        
//         // Logguer les résultats
//         console.log("📊 Statistiques du cache APP:", counts);
//         logToDebugPanel(`📊 Ressources en cache: ${counts.total} total, ${counts.enc} .enc, ${counts.jpg} .jpg, ${counts.mp3} .mp3, ${counts.json} .json`, 'info');
        
//         // Vérifier les fichiers critiques
//         for (const file of ['./arbre.enc', './arbreX.enc']) {
//             const isInCache = await cache.match(file);
//             logToDebugPanel(`${file}: ${isInCache ? '✅ En cache' : '❌ Pas en cache'}`, isInCache ? 'success' : 'error');
//         }
        
//         return counts;
//     } catch (error) {
//         console.error("❌ Erreur lors de la vérification du cache:", error);
//         logToDebugPanel(`❌ Erreur lors de la vérification du cache: ${error.message}`, 'error');
//         return null;
//     }
// }
