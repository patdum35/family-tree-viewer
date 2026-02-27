/**
 * resourcePreloader.js - Gestion des fichiers importants en cache
 * Complètement séparé de mapTilesPreloader.js
 */
// resourcePreloader.js est importé dynamiquement dans appInitializer.js si on clique sur le bouton loadDataButton "Entrez"
// donc pas de problème de lightHouse score au démarrage

// Import de debugLog si disponible
// import { debugLog } from './debugLogUtils.js';
import { getDebugLog, APP_CACHE_NAME } from './main.js';

// Nom du cache pour les ressources importantes
// export const APP_CACHE_NAME = 'app-resources-cache-v2';

const isProduction = window.location.pathname.includes('/obfusc/');
const GEDCOM_PATH = isProduction ? '../' : './';
const SOUNDS_PATH = isProduction ? '../sounds/' : './sounds/';
const BACKGROUND_IMAGES_PATH = isProduction ? '../background_images/' : './background_images/';

// Liste des ressources importantes à précharger
const RESOURCES_TO_CACHE = [
  // Fichiers critiques .enc
  `${GEDCOM_PATH}arbre.enc`,
  `${GEDCOM_PATH}arbreX.enc`,
  `${GEDCOM_PATH}arbreB.enc`,
  `${GEDCOM_PATH}arbreC.enc`,
  `${GEDCOM_PATH}arbreG.enc`,
  `${GEDCOM_PATH}arbreLE.enc`,

  // Fichiers JSON
  `${GEDCOM_PATH}geolocalisation.json`,
  `${GEDCOM_PATH}geolocalisationX.json`,
  `${GEDCOM_PATH}geolocalisationB.json`,
  `${GEDCOM_PATH}geolocalisationC.json`,
  `${GEDCOM_PATH}geolocalisationG.json`,
  `${GEDCOM_PATH}geolocalisationLE.json`,

  // Images
  `${BACKGROUND_IMAGES_PATH}tree-log-lowQuality.jpg`,
  `${BACKGROUND_IMAGES_PATH}tree-log-mediumQuality.jpg`,
//   './background_images/tree-log.jpg',
  `${BACKGROUND_IMAGES_PATH}tree-log.webp`,
  `${BACKGROUND_IMAGES_PATH}contemporain.jpg`,
  `${BACKGROUND_IMAGES_PATH}fort_lalatte.jpg`,
  `${BACKGROUND_IMAGES_PATH}fort_lalatte.jpx`,
  `${BACKGROUND_IMAGES_PATH}thomas.jpx`,
  `${BACKGROUND_IMAGES_PATH}steph.jpx`,
  `${BACKGROUND_IMAGES_PATH}garand.jpx`,
  `${BACKGROUND_IMAGES_PATH}charlemagne.jpx`,
  `${BACKGROUND_IMAGES_PATH}hugues.jpx`,
  `${BACKGROUND_IMAGES_PATH}brigitte.jpx`,
  `${BACKGROUND_IMAGES_PATH}kamber.jpx`,
  `${BACKGROUND_IMAGES_PATH}pharabert.jpx`,
  `${BACKGROUND_IMAGES_PATH}dominique.jpx`,
  `${BACKGROUND_IMAGES_PATH}riad.jpx`,
  `${BACKGROUND_IMAGES_PATH}laurent.jpx`,
  `${BACKGROUND_IMAGES_PATH}victor.jpx`,
  `${BACKGROUND_IMAGES_PATH}valerie.jpx`,
  `${BACKGROUND_IMAGES_PATH}louison.jpx`,
  `${BACKGROUND_IMAGES_PATH}richard.jpx`,  
  // Sons
  `${SOUNDS_PATH}lalatte.mpx`
];

// Liste des ressources reduites à précharger
const RESOURCES_TO_CACHE_REDUCED = [
  `${GEDCOM_PATH}arbre.enc`,
//   './arbreX.enc',
//   './arbreB.enc',
//   './arbreC.enc',
//   './arbreG.enc',
//   './arbreLE.enc',

  // Fichiers JSON
   `${GEDCOM_PATH}geolocalisation.json`,
//   './geolocalisationX.json',
//   './geolocalisationB.json',
//   './geolocalisationC.json',
//   './geolocalisationG.json',
//   './geolocalisationLE.json',
];


/**
 * Fonction utilitaire pour logger
 */
 async function log(message, type = 'info') {
  const debugLog = await getDebugLog();
  if (typeof debugLog === 'function') {
    debugLog(message, type);
  } else {
    if (type === 'error') console.error(message);
    else if (type === 'warning') console.warn(message);
    else if (type === 'success') console.log(`%c${message}`, 'color: #00ff00');
    else console.log(message);
  }
}

// Diagnostic du contenu
async function debugCacheContent() {
    try {
        const cacheNames = await caches.keys();
        console.log("🔍 Caches disponibles:", cacheNames);
        
        if (cacheNames.includes(APP_CACHE_NAME)) {
            const cache = await caches.open(APP_CACHE_NAME);
            const requests = await cache.keys();
            requests.forEach(req => {
                if (req.url.includes('arbre.enc')) {
                    console.log("  -in debugCacheContent : ", req.url);
                }
            });
        } else {
            console.log("❌ Cache APP_CACHE_NAME introuvable");
        }
    } catch (error) {
        console.error("❌ Erreur debug cache:", error);
    }
}

// Vérification du statut avec mesure de temps
async function checkResourceCacheStatus() {
    const t0 = performance.now();
    try {
        const cacheNames = await caches.keys();
        const hasCache = cacheNames.includes(APP_CACHE_NAME);
        
        if (!hasCache) {
            return { hasCache: false, hasContent: false };
        }
        
        const cache = await caches.open(APP_CACHE_NAME);
        const cachedRequests = await cache.keys();
        const duration = (performance.now() - t0).toFixed(2);
        
        console.log(`📊 Statut : ${cachedRequests.length} ressources détectées en ${duration}ms`);
        return { 
            hasCache: true, 
            hasContent: cachedRequests.length > 0, 
            actualCount: cachedRequests.length,
            scanDuration: duration 
        };
    } catch (error) {
        console.error("❌ Erreur vérification cache:", error);
        return { hasCache: false, hasContent: false };
    }
}

export async function initResourcePreloading(scope = null) {
    console.log("🚀 Initialisation du préchargement...");
    log("🚀 Initialisation du préchargement des ressources...", 'info');

    await debugCacheContent();

    if (!('caches' in window)) {
        log("⚠️ Cache API non supportée", 'warning');
        return false;
    }

    const cacheExists = await checkResourceCacheStatus();

    // Si tout est déjà là, on ne fait rien (Gain de temps CPU)
    if (cacheExists.hasCache && cacheExists.hasContent && cacheExists.actualCount === RESOURCES_TO_CACHE.length) {
        console.log(`✅ Cache complet (${cacheExists.actualCount} items). Scan disque: ${cacheExists.scanDuration}ms`);
        log("✅ Cache des ressources déjà présent, préchargement ignoré", 'info');
        return true;
    }
    
    // Sinon, on lance le moteur de préchargement
    await preloadAppResources(scope);
    return true;
}

async function preloadAppResources(scope = null) {
    const totalStart = performance.now();
    let RESOURCES_TO_CACHE_INT = RESOURCES_TO_CACHE;
    if (scope === 'reduced') {
        RESOURCES_TO_CACHE_INT = RESOURCES_TO_CACHE_REDUCED;
    }

    log(`🔄 Préchargement de ${RESOURCES_TO_CACHE_INT.length} ressources...`, 'info');
    
    try {
        const cache = await caches.open(APP_CACHE_NAME);
        const keys = await cache.keys();
        const urlsInCache = new Set(keys.map(k => k.url));
        
        let newlyAddedList = [];
        let alreadyPresentList = [];
        let errorList = [];
        
        // On traite par lots pour garder l'UI fluide
        await processInChunks(RESOURCES_TO_CACHE_INT, async (resourceUrl) => {
            const fetchStart = performance.now();
            try {
                const fullUrl = new URL(resourceUrl, window.location.origin).href;
                
                if (urlsInCache.has(fullUrl)) {
                    alreadyPresentList.push(resourceUrl);
                    return;
                }

                // Détermination du MIME
                let mimeType = '*/*';
                if (resourceUrl.endsWith('.jpg')) mimeType = 'image/jpeg';
                if (resourceUrl.endsWith('.mp3')) mimeType = 'audio/mpeg';
                if (resourceUrl.endsWith('.json')) mimeType = 'application/json';
                if (resourceUrl.endsWith('.enc')) mimeType = 'application/octet-stream';
                
                const response = await fetch(resourceUrl, { 
                    method: 'GET',
                    cache: 'no-cache',
                    mode: 'no-cors',
                    headers: { 'Accept': mimeType, 'X-Requested-With': 'no-sw-intercept' }
                });
                
                if (response.ok || response.type === 'opaque') {
                    await cache.put(resourceUrl, response.clone());
                    const fetchDuration = (performance.now() - fetchStart).toFixed(2);
                    newlyAddedList.push(`${resourceUrl} (${fetchDuration}ms)`);
                    
                    if (resourceUrl.includes('arbre.enc')) {
                        log(`✅ Fichier critique mis en cache: ${resourceUrl} (${fetchDuration}ms)`, 'success');
                    }
                } else {
                    errorList.push(resourceUrl);
                }
            } catch (e) {
                errorList.push(resourceUrl);
            }
        }, 2, 100);

        // --- RAPPORT FINAL AVEC MESURE DE TEMPS ---
        const totalDuration = (performance.now() - totalStart).toFixed(2);
        
        console.group(`📊 BILAN DU PRÉCHARGEMENT (${totalDuration}ms)`);
        if (alreadyPresentList.length > 0) {
            console.log(`ℹ️ DÉJÀ EN CACHE (${alreadyPresentList.length})`);
            console.table(alreadyPresentList); 
        }
        if (newlyAddedList.length > 0) {
            console.log(`✅ NOUVELLEMENT CHARGÉS (${newlyAddedList.length})`);
            console.table(newlyAddedList);
        }
        if (errorList.length > 0) {
            console.error(`❌ ÉCHECS (${errorList.length})`);
            console.table(errorList);
        }
        console.groupEnd();

        const summary = `✅ Terminé en ${totalDuration}ms: ${newlyAddedList.length} nouveaux, ${alreadyPresentList.length} déjà là.`;
        console.log(summary);
        log(summary, 'success');
        
        await verifyEncFiles(cache);

    } catch (error) {
        log(`❌ Erreur préchargement: ${error.message}`, 'error');
    }
}

async function verifyEncFiles(cache) {
    const encFiles = [`${GEDCOM_PATH}arbre.enc`,`${GEDCOM_PATH}arbreX.enc`, `${GEDCOM_PATH}arbreB.enc`, `${GEDCOM_PATH}arbreC.enc`, `${GEDCOM_PATH}arbreG.enc`, `${GEDCOM_PATH}arbreLE.enc`];
    const t0 = performance.now();

    for (const file of encFiles) {
        const response = await cache.match(file);
        if (response && file.includes('arbre.enc')) {
            log(`✅ Vérification : ${file} est bien sécurisé en cache`, 'success');
        }
    }
    console.log(`🔍 Vérification des fichiers .enc terminée en ${(performance.now() - t0).toFixed(2)}ms`);
}

async function processInChunks(items, processor, chunkSize = 10, delay = 20) {
    for (let i = 0; i < items.length; i += chunkSize) {
        const chunk = items.slice(i, i + chunkSize);
        await Promise.all(chunk.map(item => processor(item)));
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
        // for (const file of ['arbre.enc', 'arbreX.enc', './arbreB.enc', './arbreC.enc', './arbreG.enc', './arbreLE.enc']) {
        for (const file of [`${GEDCOM_PATH}arbre.enc`,`${GEDCOM_PATH}arbreX.enc`, `${GEDCOM_PATH}arbreB.enc`, `${GEDCOM_PATH}arbreC.enc`, `${GEDCOM_PATH}arbreG.enc`, `${GEDCOM_PATH}arbreLE.enc`]) {

            const isInCache = entries.some(req => req.url.includes(file));
            log(`${file}: ${isInCache ? '✅ En cache' : '❌ Absent'}`, isInCache ? 'success' : 'error');
        }
        
        return counts;
    } catch (error) {
        log(`❌ Erreur lors de la vérification du cache: ${error.message}`, 'error');
        return null;
    }
}



