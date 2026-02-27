// mapTilesPreloader.js est importé dynamiquement dans appInitializer.js si on clique sur le bouton loadDataButton "Entrez"
// donc pas de problème de lightHouse score au démarrage
/**
 * Système de préchargement des tuiles de carte en tâche de fond
 */

// // Nom du cache pour les tuiles
// const TILE_CACHE_NAME = 'map-tiles-cache-v2';

import {TILE_CACHE_NAME} from './main.js';


const isProduction = window.location.pathname.includes('/obfusc/');
const MAPS_PATH = isProduction ? '../maps/' : './maps/';

/**
 * Précharge les tuiles en tâche de fond avec mesures de temps
 */
async function preloadTilesInBackground(tileUrls) {
    // Limite de sécurité
    const LIMIT = 2000;
    const tilesToPreload = tileUrls.slice(0, LIMIT);
    
    console.log(`🔄 Démarrage du préchargement de ${tilesToPreload.length} tuiles...`);
    
    const tStartTotal = performance.now();
    
    // Compteurs pour le bilan
    const stats = {
        cached: 0,
        downloaded: 0,
        errors: 0,
        totalTimeCached: 0,
        totalTimeDownload: 0
    };

    try {
        const cache = await caches.open(TILE_CACHE_NAME);
        
        // On récupère d'abord TOUTES les clés du cache en une fois pour éviter de faire .match() en boucle (très lent)
        // C'est une optimisation majeure pour 2000 éléments.
        const keys = await cache.keys();
        const urlSet = new Set(keys.map(k => k.url));
        const baseUrl = new URL(MAPS_PATH , window.location.origin).href;

        await processInChunks(tilesToPreload, async (tileUrl) => {
            const tTileStart = performance.now();
            try {
                // Construction URL absolue pour vérification fiable dans le Set
                // tileUrl est relatif (ex: "z/x/y.png"), on doit matcher l'URL complète du cache
                const fullUrl = new URL(tileUrl, baseUrl).href;

                // CAS 1 : DÉJÀ PRÉSENT (Vérification via Set = instantané)
                if (urlSet.has(fullUrl)) {
                    stats.cached++;
                    // On simule un temps minime pour la stat, car le Set est quasi immédiat
                    stats.totalTimeCached += (performance.now() - tTileStart);
                } 
                // CAS 2 : ABSENT (Téléchargement)
                else {
                    const response = await fetch(MAPS_PATH + tileUrl, { 
                        method: 'GET', cache: 'no-cache', mode: 'no-cors',
                        headers: { 'X-Requested-With': 'no-sw-intercept' }
                    });
                    
                    if (response.ok) {
                        await cache.put(MAPS_PATH + tileUrl, response.clone());
                        stats.downloaded++;
                        stats.totalTimeDownload += (performance.now() - tTileStart);
                    } else {
                        stats.errors++;
                    }
                }
            } catch (e) {
                console.warn(`⚠️ Erreur sur: ${tileUrl}`, e);
                stats.errors++;
            }
        }, 10, 20); // 10 tuiles, 20ms pause
        
        // --- RAPPORT FINAL DÉTAILLÉ ---
        const totalDuration = (performance.now() - tStartTotal).toFixed(2);
        const avgDownload = stats.downloaded > 0 ? (stats.totalTimeDownload / stats.downloaded).toFixed(2) : 0;
        
        console.group(`🗺️ BILAN TUILES (${totalDuration}ms)`);
        console.log(`📦 Déjà en cache : ${stats.cached} tuiles (Scan rapide)`);
        
        if (stats.downloaded > 0) {
            console.log(`🌐 Téléchargées  : ${stats.downloaded} tuiles`);
            console.log(`⏱️ Temps moyen DL : ${avgDownload}ms / tuile`);
            console.log(`💾 Volume total estimé : ~${(stats.downloaded * 15).toFixed(0)} Ko (si ~15Ko/tuile)`);
        }
        
        if (stats.errors > 0) console.log(`❌ Erreurs      : ${stats.errors}`);
        
        console.log(`✅ Opération terminée sur ${tilesToPreload.length} fichiers.`);
        console.groupEnd();

    } catch (error) {
        console.error("❌ Erreur critique background:", error);
    }
}

export async function initTilePreloading() {
    const tStart = performance.now();
    console.log("🗺️ Initialisation du préchargement des tuiles...");
    
    if (!('caches' in window)) return false;
    
    try {
        // 1. Récupérer le manifeste d'abord pour savoir combien on DOIT avoir
        const manifestResponse = await fetch(MAPS_PATH + 'manifest.json');
        if (!manifestResponse.ok) return false;
        
        const manifest = await manifestResponse.json();
        // On définit la cible : soit tout le manifeste, soit la limite de 2000
        const targetCount = Math.min(manifest.tileUrls.length, 2000); 

        // 2. Vérifier l'état réel du cache
        const cacheStatus = await checkCacheStatus();
        
        // --- LE BYPASS ---
        // Si le nombre en cache est supérieur ou égal à notre cible, on gagne du temps !
        if (cacheStatus.hasCache && cacheStatus.count >= targetCount) {
            const duration = (performance.now() - tStart).toFixed(2);
            console.log(`🚀 [BYPASS] Cache tuiles complet : ${cacheStatus.count} tuiles détectées (Cible: ${targetCount}).`);
            console.log(`✅ Initialisation tuiles terminée en ${duration}ms (Aucun téléchargement requis).`);
            return true;
        }

        // 3. Si le compte n'est pas bon, on lance le chargement
        console.log(`Missing tiles: ${targetCount - cacheStatus.count} tuiles à récupérer.`);
        preloadTilesInBackground(manifest.tileUrls, targetCount);
        
        return true;
    } catch (error) {
        console.error("❌ Erreur bypass tuiles:", error);
        return false;
    }
}

/**
 * Audit flash du cache (Mesure de performance)
 */
async function checkCacheStatus() {
    const t0 = performance.now();
    try {
        const cache = await caches.open(TILE_CACHE_NAME);
        const keys = await cache.keys();
        const duration = (performance.now() - t0).toFixed(2);
        
        return { 
            hasCache: true, 
            count: keys.length, 
            duration 
        };
    } catch (e) {
        return { hasCache: false, count: 0 };
    }
}

/**
 * Traite des éléments par lot (Strictement identique à l'original)
 */
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
 * Intercepteur runtime (Optimisé pour le silence et la vitesse)
 */
export async function fetchTileWithCache(url) {
    if (!('caches' in window)) return fetch(url);
    
    try {
        const cache = await caches.open(TILE_CACHE_NAME);
        const cachedResponse = await cache.match(url);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(url, {
            headers: { 'X-Requested-With': 'no-sw-intercept' }
        });
        
        cache.put(url, networkResponse.clone());
        return networkResponse;
    } catch (error) {
        // En runtime map, on évite les logs sauf erreur critique
        return fetch(url);
    }
}
