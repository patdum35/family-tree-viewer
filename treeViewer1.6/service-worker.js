// Importer la configuration de cache
importScripts('./cacheConfig.js');

// Console pour le logging
const swConsole = {
  log: function(message) {
    console.log(`[SW] ${message}`);
    try {
      self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({type: 'SW_LOG', message}));
      });
    } catch (e) {}
  },
  error: function(message) {
    console.error(`[SW] ${message}`);
    try {
      self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({type: 'SW_ERROR', message}));
      });
    } catch (e) {}
  }
};

swConsole.log(`Service Worker démarré - Cache: ${CACHE_NAME}`);

// Liste des ressources à mettre en cache immédiatement
const RESOURCES_TO_CACHE = [
  './',
  './treeViewer1.6.html',
  './offline.html',
  './css/styles.css',
  './cacheConfig.js',
  './ios-install.html',

  // Fichiers JS principaux (seulement les plus critiques)
  './js/libraryLoader.js',
  './js/main.js',
  './js/appInitializer.js',
  './js/debugLogUtils.js',
  './js/serviceWorkerInit.js',
  './js/i18n.js',
  './js/pwaInstaller_ProgressiveWebApps.js',

  // Bibliothèques externes essentielles
  './libs/pako.min.js',
  './libs/d3.v7.min.js',
  './libs/leaflet.js',
  './libs/leaflet.css',
  
  
  // icones et manifest
  './icons/icon-192x192.png',
  './manifest.webmanifest'
];

// Installation du Service Worker - adaptation de la technique de mapTilesPreloader.js
self.addEventListener('install', (event) => {
  swConsole.log('🚀 Service Worker: Installation démarrée');
  
  // Forcer l'activation immédiate
  self.skipWaiting();
  
  event.waitUntil((async () => {
    try {
      // Ouvrir le cache
      const cache = await caches.open(CACHE_NAME);
      swConsole.log(`📦 Cache '${CACHE_NAME}' ouvert avec succès`);
      
      // Compter les ressources déjà en cache
      let existingCount = 0;
      let successCount = 0;
      let failedCount = 0;
      
      // Utiliser la technique de processInChunks qui fonctionne sur mobile
      await processInChunks(RESOURCES_TO_CACHE, async (url) => {
        try {
          // Vérifier d'abord si la ressource est déjà en cache
          const cachedResponse = await cache.match(url);
          
          if (cachedResponse) {
            // Déjà en cache
            existingCount++;
            return;
          }
          
          // Charger la ressource avec une approche similaire à fetchTileWithCache
          const response = await fetch(url, {
            method: 'GET',
            cache: 'no-cache',
            mode: 'no-cors'
          });
          
          if (response.ok || response.type === 'opaque') {
            await cache.put(url, response.clone());
            successCount++;
            swConsole.log(`✅ Mise en cache: ${url}`);
          } else {
            failedCount++;
            swConsole.error(`❌ Échec pour ${url}: ${response.status}`);
          }
        } catch (err) {
          failedCount++;
          swConsole.error(`❌ Erreur pour ${url}: ${err.message}`);
        }
      }, 3, 50); // 3 ressources à la fois, 50ms entre les lots
      
      // Rapport final
      swConsole.log(`📊 Bilan de mise en cache: ${successCount} ajoutés, ${existingCount} existants, ${failedCount} échecs`);
      
      // Vérification spécifique pour arbre.enc et arbreX.enc
      const verifyFiles = ['arbre.enc', 'arbreX.enc', 'arbreB.enc', 'arbreC.enc', 'arbreG.enc', 'arbreLE.enc'];
      for (const file of verifyFiles) {
        const response = await cache.match(file);
        if (response) {
          swConsole.log(`✅ Fichier critique trouvé en cache: ${file}`);
        } else {
          swConsole.error(`❌ ÉCHEC: ${file} n'est PAS en cache!`);
        }
      }
    } catch (error) {
      swConsole.error(`🔥 Erreur critique: ${error.message}`);
    }
  })());
});

// Traitement par lots, comme dans votre code qui fonctionne
async function processInChunks(items, processor, chunkSize = 3, delay = 50) {
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    
    // Traiter le lot actuel
    const promises = chunk.map(item => processor(item));
    
    try {
      await Promise.all(promises);
      
      // Log de progression pour de grands ensembles
      if (i % 10 === 0 || i + chunkSize >= items.length) {
        swConsole.log(`Progression: ${Math.min(i + chunkSize, items.length)}/${items.length}`);
      }
    } catch (err) {
      swConsole.error(`Erreur dans le lot ${i}-${i+chunkSize}: ${err.message}`);
    }
    
    // Pause pour permettre à l'interface de répondre
    if (i + chunkSize < items.length && delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Activation - nettoyer les anciens caches
self.addEventListener('activate', (event) => {
  swConsole.log('🚀 Service Worker: Activation');
  
  // Prendre le contrôle immédiatement
  event.waitUntil(clients.claim());
  
  // Nettoyer les anciens caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && !cacheName.includes('map-tiles') && !cacheName.includes('app-resources-cache')) {
            swConsole.log(`🗑️ Suppression de l'ancien cache ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Stratégie de cache simplifiée - inspirée de votre fetchTileWithCache
self.addEventListener('fetch', (event) => {
  // Ignorer certaines requêtes
  if (event.request.url.includes('google.com/favicon.ico') || 
      event.request.url.startsWith('chrome-extension://') ||
      event.request.url.includes('chrome-search://')) {
    return;
  }

  // Ne pas intercepter les tuiles de carte, les jpg, les enc, les mp3, les json
  if (event.request.url.includes('/maps/') || 
      event.request.url.includes('tile.openstreetmap') ||
      event.request.url.endsWith('.jpg') ||
      event.request.url.endsWith('.enc') ||
      event.request.url.endsWith('.mp3') ||
      event.request.url.endsWith('.json') ||
      event.request.url.endsWith('.jpx') ||
      event.request.url.endsWith('.mpx') ||
      event.request.headers.get('X-Requested-With') === 'no-sw-intercept') {
    return;
  }

  const url = new URL(event.request.url);
  // Ne pas mettre en cache les requêtes de géolocalisation ou d'autres api
  if (url.hostname !== location.hostname || 
      url.href.includes('nominatim.openstreetmap.org') ||
      url.href.includes('api.') ||
      url.href.includes('.api.')) {
      return; // Laisser passer sans cache
  }

  
  // Stratégie basic Cache-first
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request, { ignoreSearch: true })
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Rien en cache, passer au réseau
          return fetch(event.request)
            .then(networkResponse => {
              // Si c'est une ressource utile à mettre en cache
              if (networkResponse.ok) {
                // Mettre en cache pour la prochaine fois
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(error => {
              // Erreur réseau
              if (event.request.mode === 'navigate') {
                // Pour les pages HTML, proposer une page hors ligne
                return new Response(
                  '<html><body><h1>Offline</h1><p>Cette page n\'est pas disponible hors ligne.</p></body></html>',
                  { headers: { 'Content-Type': 'text/html' } }
                );
              }
              
              // Pour les autres ressources, juste une erreur
              return new Response('Offline', { status: 503 });
            });
        });
    })
  );
});

// Messages
self.addEventListener('message', (event) => {
  if (!event.data || !event.data.action) return;
  
  switch (event.data.action) {
    case 'clearCache':
      swConsole.log('🗑️ Demande de vidage du cache reçue');
      
      event.waitUntil(
        caches.keys().then(cacheNames => {
          return Promise.all(
            cacheNames.map(cacheName => {
              swConsole.log(`🗑️ Suppression du cache ${cacheName}`);
              return caches.delete(cacheName);
            })
          ).then(() => {
            // Confirmer au client
            event.source.postMessage({
              action: 'cacheCleared',
              status: 'success'
            });
          });
        })
      );
      break;
      
    case 'getSwVersion':
      // Répondre avec la version
      event.source.postMessage({
        action: 'swVersion',
        version: 'v5-mobile-simplifiée'
      });
      break;
      
    case 'ping':
      // Simple ping-pong pour tester la communication
      event.source.postMessage({
        action: 'pong',
        timestamp: Date.now()
      });
      break;
  }
});

// Mettre en cache du contenu supplémentaire en arrière-plan
// après l'activation initiale
self.addEventListener('activate', (event) => {
  // Laisser s'exécuter en arrière-plan
  event.waitUntil((async () => {
    try {
      // Mettre en cache d'autres ressources JS, moins critiques
      const additionalResources = [
        './js/audioPlayer.js',
        './js/backgroundManager.js',
        './js/dateUI.js',
        './js/debugLogUtils.js',
        './js/directHamburgerMenu.js',
        './js/eventHandlers.js',
        './js/gedcomParser.js',
        './js/geoHeatMapDataProcessor.js',
        './js/geoHeatMapInteractions.js',
        './js/geoHeatMapUI.js',
        './js/geoLocalisation.js',
        './js/hamburgerMenu.js',
        './js/helpHamburgerMenu.js',
        './js/historicalData.js',
        './js/mainUI.js',
        './js/mapTilesPreloader.js',
        './js/mapUtils.js',
        './js/modalWindow.js',
        './js/nameCloud.js',
        './js/nameCloudAverageAge.js',
        './js/nameCloudCenturyModal.js',
        './js/nameCloudInteractions.js',
        './js/nameCloudRenderer.js',
        './js/nameCloudSettings.js',
        './js/nameCloudShapes.js',
        './js/nameCloudStatModal.js',
        './js/nameCloudUI.js',
        './js/nameCloudUtils.js',
        './js/nodeControls.js',
        './js/nodeRenderer.js',
        './js/photoPlayer.js',
        './js/resizableModalUtils.js',
        './js/treeAnimation.js',
        './js/treeOperations.js',
        './js/treeRenderer.js',
        './js/treeSettingsModal.js',
        './js/treeWheelControls.js',
        './js/treeWheelRenderer.js',
        './js/treeWheelAnimation.js',
        './js/exportManager.js',
        './js/exportSettings.js',
        './js/UIutils.js',
        './js/utils.js',
        './js/occupations.js',
        './libs/lodash.min.js',
        './libs/leaflet-heat.js',
        './libs/react.production.min.js',
        './libs/react-dom.production.min.js',
        './libs/d3.layout.cloud.min.js',
      ];

      // Attendre un peu pour ne pas interférer avec l'activation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      swConsole.log('🔄 Mise en cache différée de ressources supplémentaires...');
      
      const cache = await caches.open(CACHE_NAME);
      let successCount = 0;
      let failedCount = 0;

      // Utiliser la même technique de lots qui fonctionne déjà pour les tuiles
      await processInChunks(additionalResources, async (url) => {
        try {
          // Vérifier si déjà en cache
          const cachedResponse = await cache.match(url);
          if (cachedResponse) return;
          
          // Sinon, mettre en cache
          const response = await fetch(url, {
            method: 'GET',
            cache: 'no-cache',
            mode: 'no-cors'
          });
          
          if (response.ok || response.type === 'opaque') {
            await cache.put(url, response.clone());
            successCount++;
          } else {
            failedCount++;
          }
        } catch (err) {
          failedCount++;
        }
      }, 2, 100); // Encore plus petit (2) et plus lent (100ms) pour les ressources additionnelles
      
      swConsole.log(`✅ Mise en cache différée terminée: ${successCount} réussis, ${failedCount} échoués`);
    } catch (error) {
      swConsole.error(`Erreur lors de la mise en cache différée: ${error.message}`);
    }
  })());
});
