/**
 * Système de préchargement des tuiles de carte en tâche de fond
 */

// Nom du cache pour les tuiles
const TILE_CACHE_NAME = 'map-tiles-cache-v2';



// Verifier le status du cache storage avant de lancer initTilePreloading
async function checkCacheStatus() {
    try {
        const cacheNames = await caches.keys();
        const hasCache = cacheNames.includes(TILE_CACHE_NAME);
        
        if (!hasCache) {
            return { hasCache: false, hasContent: false };
        }
        
        const cache = await caches.open(TILE_CACHE_NAME);
        const cachedRequests = await cache.keys();
        const hasContent = cachedRequests.length > 0;
        
        console.log(`📊 Statut du cache: ${cachedRequests.length} tuiles en cache`);
        return { hasCache: true, hasContent };
    } catch (error) {
        console.error("❌ Erreur lors de la vérification du cache:", error);
        return { hasCache: false, hasContent: false };
    }
}

/**
 * Initialise le préchargement des tuiles
 * À appeler au chargement de la page
 */
export async function initTilePreloading() {


    console.log("🗺️ Initialisation du préchargement des tuiles...");
    
    // Vérifier si le navigateur supporte le Cache API
    if (!('caches' in window)) {
        console.warn("⚠️ Cache API non supportée par ce navigateur");
        return false;
    }
    
    try {

        // Vérifier si le cache existe déjà et n'est pas vide
        const cacheExists = await checkCacheStatus();
        
        if (cacheExists.hasCache && cacheExists.hasContent) {
            console.log("✅ Cache des tuiles déjà présent, préchargement ignoré");
            return true;
        }

        // Vérifier si le manifeste de tuiles existe
        const manifestResponse = await fetch('./maps/manifest.json');
        
        if (!manifestResponse.ok) {
            console.warn("⚠️ Manifeste de tuiles non trouvé");
            return false;
        }
        
        const manifest = await manifestResponse.json();
        console.log(`📋 Manifeste de tuiles chargé: ${manifest.tileUrls.length} tuiles disponibles`);
        
        // Lancer le préchargement en tâche de fond
        preloadTilesInBackground(manifest.tileUrls);
        
        return true;
    } catch (error) {
        console.error("❌ Erreur lors de l'initialisation du préchargement:", error);
        return false;
    }
}

/**
 * Précharge les tuiles en tâche de fond
 * @param {Array} tileUrls - Liste des URLs des tuiles à précharger
 */
async function preloadTilesInBackground(tileUrls) {
    // Limiter le nombre de tuiles à précharger pour éviter de surcharger le navigateur
    const tilesToPreload = tileUrls.slice(0, 2000); // Limiter à 500 tuiles
    
    console.log(`🔄 Préchargement de ${tilesToPreload.length} tuiles en tâche de fond...`);
    
    // Créer un élément de notification pour l'utilisateur (optionnel)
    // const notification = createPreloadNotification();
    // document.body.appendChild(notification);
    
    // Ouvrir ou créer le cache
    try {
        const cache = await caches.open(TILE_CACHE_NAME);
        let loadedCount = 0;
        
        // Utiliser un worker ou setTimeout pour ne pas bloquer l'interface
        await processInChunks(tilesToPreload, async (tileUrl) => {
            try {
                // Vérifier si la tuile est déjà en cache
                const cachedResponse = await cache.match('./maps/' + tileUrl);
                
                if (!cachedResponse) {
                    // Charger et mettre en cache la tuile
                    // const response = await fetch('./maps/' + tileUrl, { 
                    //     method: 'GET',
                    //     cache: 'no-cache' // Forcer le rechargement
                    // });

                    const response = await fetch('./maps/' + tileUrl, { 
                        method: 'GET',
                        cache: 'no-cache',
                        mode: 'no-cors',
                        headers: {
                          'X-Requested-With': 'no-sw-intercept'  // Marqueur spécial
                        }
                      });
                    
                    if (response.ok) {
                        await cache.put('./maps/' + tileUrl, response.clone());
                        loadedCount++;
                        
                        // Mettre à jour la notification tous les 10 éléments
                        // if (loadedCount % 10 === 0) {
                        //     updatePreloadNotification(notification, loadedCount, tilesToPreload.length);
                        // }
                    }
                } else {
                    // La tuile est déjà en cache
                    loadedCount++;
                }
            } catch (e) {
                console.warn(`⚠️ Impossible de précharger: ${tileUrl}`, e);
            }
        }, 10, 20); // Traiter 10 tuiles à la fois, avec 20ms de pause entre les lots
        
        // Mise à jour finale de la notification
        // updatePreloadNotification(notification, loadedCount, tilesToPreload.length);
        
        // Faire disparaître la notification après 3 secondes
        // setTimeout(() => {
        //     notification.style.opacity = '0';
        //     setTimeout(() => notification.remove(), 500);
        // }, 3000);
        
        console.log(`✅ Préchargement terminé: ${loadedCount}/${tilesToPreload.length} tuiles chargées`);

        // // message unique à la fin (localisation simple)
        // const msg = window.CURRENT_LANGUAGE === 'fr' ? 'Toutes les ressources sont chargées.' : 'All resources are loaded.';
        // showCompletionNotification(msg);


    } catch (error) {
        console.error("❌ Erreur lors du préchargement des tuiles:", error);
        notification.remove();
    }
}




function showCompletionNotification(message) {
  const n = document.createElement('div');
  n.style.position = 'fixed';
  n.style.bottom = '20px';
  n.style.right = '20px';
  n.style.padding = '12px 16px';
  n.style.background = 'rgba(0,0,0,0.85)';
  n.style.color = 'white';
  n.style.borderRadius = '6px';
  n.style.zIndex = 99999;
  n.style.fontSize = '14px';
  n.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
  n.style.transition = 'opacity 0.4s';
  n.textContent = message;
  document.body.appendChild(n);
  // disparaît après 2s
  setTimeout(() => { n.style.opacity = '0'; setTimeout(()=>n.remove(), 400); }, 2000);
}




/**
 * Traite des éléments par lot pour éviter de bloquer l'interface
 * @param {Array} items - Éléments à traiter
 * @param {Function} processor - Fonction de traitement
 * @param {number} chunkSize - Taille des lots
 * @param {number} delay - Délai entre les lots en ms
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
 * @returns {HTMLElement} - Élément de notification
 */
function createPreloadNotification() {
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
    if (window.CURRENT_LANGUAGE == "fr") {
        notification.innerHTML = '<div>Préchargement des tuiles de carte...</div><div><progress id="tile-progress" value="0" max="100" style="width: 100%;"></progress></div>';
    } else if (window.CURRENT_LANGUAGE == "en") {
        notification.innerHTML = '<div>Preloading map tiles...</div><div><progress id="tile-progress" value="0" max="100" style="width: 100%;"></progress></div>';
    } else if (window.CURRENT_LANGUAGE == "es") {
        notification.innerHTML = '<div>Precargando mosaicos del mapa...</div><div><progress id="tile-progress" value="0" max="100" style="width: 100%;"></progress></div>';
    } else if (window.CURRENT_LANGUAGE == "hu") {
        notification.innerHTML = '<div>Térkép csempe előtöltése...</div><div><progress id="tile-progress" value="0" max="100" style="width: 100%;"></progress></div>';
    }
    
    return notification;
}

/**
 * Met à jour la notification de préchargement
 * @param {HTMLElement} notification - Élément de notification
 * @param {number} current - Nombre de tuiles chargées
 * @param {number} total - Nombre total de tuiles
 */
function updatePreloadNotification(notification, current, total) {
    const progress = notification.querySelector('#tile-progress');
    const percentage = Math.round((current / total) * 100);
    
    progress.value = percentage;
    if (window.CURRENT_LANGUAGE == "fr") {
        notification.firstChild.textContent = `Préchargement des tuiles: ${current}/${total} (${percentage}%)`;
    } else if (window.CURRENT_LANGUAGE == "en") {
        notification.firstChild.textContent = `Preloading tiles: ${current}/${total} (${percentage}%)`;
    } else if (window.CURRENT_LANGUAGE == "es") {
        notification.firstChild.textContent = `Precargando mosaicos: ${current}/${total} (${percentage}%)`;
    } else if (window.CURRENT_LANGUAGE == "hu") {
        notification.firstChild.textContent = `Térkép csempe előtöltése: ${current}/${total} (${percentage}%)`;
    }
}

/**
 * Intercepteur pour utiliser les tuiles en cache lorsque disponibles
 * @param {string} url - URL de la tuile
 * @returns {Promise<Response>} - Réponse HTTP
 */

export async function fetchTileWithCache(url) {
    // Vérifier si le navigateur supporte le Cache API
    if (!('caches' in window)) {
        return fetch(url, {
            headers: {
                'X-Requested-With': 'no-sw-intercept'
            }
        });
    }
    
    try {
        // Vérifier si la tuile est dans le cache
        const cache = await caches.open(TILE_CACHE_NAME);
        const cachedResponse = await cache.match(url);
        
        if (cachedResponse) {
            // Utiliser la version en cache
            return cachedResponse;
        }
        
        // Si pas en cache, faire une requête réseau AVEC le header spécial
        const networkResponse = await fetch(url, {
            headers: {
                'X-Requested-With': 'no-sw-intercept'
            }
        });
        
        // Mettre en cache pour la prochaine fois
        cache.put(url, networkResponse.clone());
        
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

