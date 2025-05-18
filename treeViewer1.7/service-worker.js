// Utiliser une console globale pour pouvoir logger même quand le service worker est en arrière-plan
const swConsole = {
  log: function(message) {
    console.log(`[SW] ${message}`);
    // Tenter d'envoyer des logs aux clients connectés
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'SW_LOG',
          message: message
        });
      });
    });
  },
  error: function(message) {
    console.error(`[SW] ${message}`);
    // Tenter d'envoyer des logs aux clients connectés
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'SW_ERROR',
          message: message
        });
      });
    });
  }
};

// // Définir le nom du cache directement ici pour éviter les problèmes de chargement de cacheConfig.js
// const CACHE_NAME = 'treeViewer-app-v4'; // Incrémenté pour forcer la mise à jour

// // Indiquer au debugger que le SW a commencé à s'exécuter
// swConsole.log('🚀 Service Worker script chargé - v4');

// // Essayer de charger la configuration
// try {
//   importScripts('./cacheConfig.js');
//   swConsole.log('✅ cacheConfig.js importé avec succès');
// } catch (e) {
//   swConsole.error(`❌ Erreur lors de l'import de cacheConfig.js: ${e.message}`);
//   // On continue avec notre définition de CACHE_NAME
// }



// Indiquer au debugger que le SW a commencé à s'exécuter
swConsole.log('🚀 Service Worker script chargé');

// Importer la configuration de cache - UNIQUE SOURCE DE VÉRITÉ
importScripts('./cacheConfig.js');
swConsole.log(`✅ cacheConfig.js importé avec succès, CACHE_NAME: ${CACHE_NAME}`);







// Liste des ressources à mettre en cache immédiatement
const RESOURCES_TO_CACHE = [
  './',
  './treeViewer1.7.html', // Ajouté pour correspondre au manifest
  './css/styles.css',
  './cacheConfig.js', 

  // Ajoutez ici vos fichiers JS principaux
    './js/appInitializer.js',
    './js/debugLogUtils.js',
    './js/audioPlayer.js',
    './js/backgroundManager.js',
    './js/dateUI.js',
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
    './js/libraryLoader.js',
    './js/main.js',
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
    './js/UIutils.js',
    './js/utils.js',

  // Bibliothèques externes
  './libs/leaflet.css',
  './libs/d3.v7.min.js',
  './libs/pako.min.js',
  './libs/lodash.min.js',
  './libs/leaflet.js',
  './libs/leaflet-heat.js',
  './libs/react.production.min.js',
  './libs/react-dom.production.min.js',
  './libs/d3.layout.cloud.min.js',

  // Autres ressources
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './manifest.webmanifest',

  // Ressources génealogiques
  './arbre.enc',
  './arbreX.enc',
  './geolocalisation.json',
  './geolocalisationX.json',

  //Images
  './background_images/contemporain.jpg',
  './background_images/republique.jpg',
  './background_images/fort_lalatte.jpg',
  './background_images/thomas.jpg',
  './background_images/steph.jpg',
  './background_images/garand.jpg',
  './background_images/charlemagne.jpg',
  './background_images/hugues.jpg',
  './background_images/brigitte.jpg',
  './background_images/kamber.jpg',
  './background_images/pharabert.jpg',
  './background_images/dominique.jpg',
  './background_images/riad.jpg',

  //Sounds
  './sounds/lalatte_remix.mp3'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
    swConsole.log('🔧 Service Worker: Installation démarrée');
    
    // Force le Service Worker à s'activer immédiatement sans attendre
    swConsole.log('📋 Tentative de skipWaiting()');
    self.skipWaiting();
    
    // Sur mobile, nous adoptons une stratégie différente:
    // 1. Mettre en cache les ressources vraiment critiques d'abord
    // 2. Compléter progressivement le reste
    
    const CRITICAL_RESOURCES = [
      './',
      './treeViewer1.7.html',
      './css/styles.css',
      './js/main.js',
      './js/libraryLoader.js',
      './js/debugLogUtils.js',
      './arbre.enc',
      './arbreX.enc'
    ];
    
    event.waitUntil(
      (async function() {
        try {
          // 1. Ouvrir le cache
          swConsole.log(`📦 Ouverture du cache '${CACHE_NAME}'`);
          const cache = await caches.open(CACHE_NAME);
          
          // 2. Mettre en cache les ressources critiques en premier
          swConsole.log(`🔍 Mise en cache de ${CRITICAL_RESOURCES.length} ressources critiques`);
          
          for (let i = 0; i < CRITICAL_RESOURCES.length; i++) {
            const url = CRITICAL_RESOURCES[i];
            try {
              // Utiliser put au lieu de add pour plus de contrôle
              const response = await fetch(url, { cache: 'no-store' });
              if (response.ok) {
                await cache.put(url, response);
                swConsole.log(`✅ Ressource critique mise en cache: ${url}`);
              } else {
                swConsole.error(`❌ Échec fetch pour ressource critique ${url}: ${response.status}`);
              }
            } catch (err) {
              swConsole.error(`❌ Erreur pour ressource critique ${url}: ${err.message}`);
            }
          }
          
          // 3. Mettre en cache les ressources non-critiques
          const nonCriticalResources = RESOURCES_TO_CACHE.filter(
            url => !CRITICAL_RESOURCES.includes(url)
          );
          
          swConsole.log(`🔍 Mise en cache de ${nonCriticalResources.length} ressources non-critiques`);
          
          // Mettre en cache par lots pour éviter de surcharger le navigateur mobile
          const BATCH_SIZE = 5;
          
          for (let i = 0; i < nonCriticalResources.length; i += BATCH_SIZE) {
            const batch = nonCriticalResources.slice(i, i + BATCH_SIZE);
            
            await Promise.all(batch.map(async (url) => {
              try {
                const response = await fetch(url, { cache: 'no-store' });
                if (response.ok) {
                  await cache.put(url, response);
                  if (i % 10 === 0 || i === nonCriticalResources.length - 1) {
                    swConsole.log(`🔄 Mise en cache: ${i + 1}/${nonCriticalResources.length} (${url})`);
                  }
                } else {
                  swConsole.error(`❌ Échec fetch pour ${url}: ${response.status}`);
                }
              } catch (err) {
                swConsole.error(`❌ Erreur pour ${url}: ${err.message}`);
                // Continuer malgré l'erreur
              }
            }));
            
            // Petite pause entre les lots pour ne pas saturer le mobile
            if (i + BATCH_SIZE < nonCriticalResources.length) {
              await new Promise(resolve => setTimeout(resolve, 50));
            }
          }
          
          swConsole.log('✅ Installation du Service Worker terminée avec succès');
          
          // Vérifier le contenu du cache après installation
          const keys = await cache.keys();
          swConsole.log(`📊 ${keys.length} ressources en cache après installation`);
          
          // Vérifier spécifiquement si arbre.enc est en cache
          const arbreInCache = keys.some(req => 
            req.url.includes('arbre.enc') || 
            req.url.endsWith('/arbre.enc') || 
            req.url.endsWith('./arbre.enc')
          );
          
          if (arbreInCache) {
            swConsole.log('✅ arbre.enc trouvé dans le cache');
          } else {
            swConsole.error('❌ arbre.enc INTROUVABLE dans le cache!');
          }
          
        } catch (error) {
          swConsole.error(`❌ Erreur critique durant l'installation: ${error.message}`);
          swConsole.error(`Stack: ${error.stack}`);
        }
      })()
    );
});
  
// Activation du Service Worker - prendre le contrôle immédiatement
self.addEventListener('activate', (event) => {
    swConsole.log('🚀 Service Worker: Activation');
    
    // Force le Service Worker à prendre le contrôle immédiatement
    swConsole.log('📋 Tentative de clients.claim()');
    event.waitUntil(clients.claim().then(() => {
      swConsole.log('✅ clients.claim() réussi');
    }).catch(err => {
      swConsole.error(`❌ Erreur lors de clients.claim(): ${err.message}`);
    }));
    
    // Nettoyer les anciens caches de l'application
    event.waitUntil(
      caches.keys().then(cacheNames => {
        swConsole.log(`🔍 Vérification des caches existants: ${cacheNames.join(', ')}`);
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && !cacheName.includes('map-tiles')) {
              swConsole.log(`🗑️ Suppression de l'ancien cache ${cacheName}`);
              return caches.delete(cacheName);
            }
          })
        );
      }).then(() => {
        swConsole.log('✅ Nettoyage des anciens caches terminé');
      })
    );
});

// Servir depuis le cache, sinon faire une requête réseau
self.addEventListener('fetch', (event) => {
    // Ignorer les requêtes spéciales
    if (event.request.url.includes('google.com/favicon.ico') || 
        event.request.url.startsWith('chrome-extension://') ||
        event.request.url.includes('chrome-search://') ||
        event.request.url.includes('/maps/') || 
        event.request.url.includes('tile.openstreetmap')) {
      return; // Ne pas intercepter du tout
    }
    
    // Vérifier les headers spéciaux
    if (event.request.headers.get('X-Requested-With') === 'no-sw-intercept') {
      // Cette requête demande explicitement de ne pas être interceptée
      return;
    }
    
    // Débugger tous les 20 fetch pour éviter trop de logs
    const shouldLog = Math.random() < 0.05; // Log environ 5% des fetches
    
    if (shouldLog) {
      const url = new URL(event.request.url);
      const relativePath = url.pathname.split('/').pop();
      swConsole.log(`🔄 Fetch: ${relativePath}`);
    }
    
    // Stratégie simplifiée pour mobile: Cache-First avec normalization des URLs
    try {
      event.respondWith(
        (async function() {
          // Simplifier l'URL pour améliorer les correspondances dans le cache
          const normalizedUrl = new URL(event.request.url);
          // Supprimer les paramètres de requête qui pourraient empêcher la correspondance
          const cacheKey = new Request(normalizedUrl.origin + normalizedUrl.pathname);
          
          try {
            // Vérifier d'abord dans le cache
            const cache = await caches.open(CACHE_NAME);
            const cachedResponse = await cache.match(cacheKey, { ignoreSearch: true });
            
            if (cachedResponse) {
              if (shouldLog) swConsole.log(`✅ Réponse depuis le cache pour: ${normalizedUrl.pathname}`);
              return cachedResponse;
            }
            
            // Essayer une variante de chemin relative
            const relativePath = '.' + normalizedUrl.pathname;
            const relativeResponse = await cache.match(relativePath, { ignoreSearch: true });
            
            if (relativeResponse) {
              if (shouldLog) swConsole.log(`✅ Réponse depuis le cache (chemin relatif) pour: ${relativePath}`);
              return relativeResponse;
            }
            
            // Si pas dans le cache, aller chercher sur le réseau
            if (shouldLog) swConsole.log(`📡 Passage en réseau pour: ${normalizedUrl.pathname}`);
            
            try {
              const networkResponse = await fetch(event.request);
              
              // Mettre en cache uniquement si la réponse est valide 
              // et si c'est une ressource qui fait partie de notre liste
              if (networkResponse.ok && 
                  (normalizedUrl.pathname.endsWith('.js') ||
                   normalizedUrl.pathname.endsWith('.css') ||
                   normalizedUrl.pathname.endsWith('.html') ||
                   normalizedUrl.pathname.endsWith('.json') ||
                   normalizedUrl.pathname.endsWith('.enc') ||
                   normalizedUrl.pathname.endsWith('.jpg') ||
                   normalizedUrl.pathname.endsWith('.png') ||
                   normalizedUrl.pathname.endsWith('.webmanifest') ||
                   normalizedUrl.pathname.endsWith('.mp3'))) {
                
                // Cloner la réponse pour la mettre en cache
                const clonedResponse = networkResponse.clone();
                cache.put(cacheKey, clonedResponse)
                  .then(() => {
                    if (shouldLog) swConsole.log(`💾 Mise en cache réussie pour: ${normalizedUrl.pathname}`);
                  })
                  .catch(err => {
                    swConsole.error(`❌ Erreur de mise en cache pour: ${normalizedUrl.pathname} - ${err.message}`);
                  });
              }
              
              return networkResponse;
            } catch (networkError) {
              swConsole.error(`❌ Erreur réseau pour: ${normalizedUrl.pathname} - ${networkError.message}`);
              return new Response('Ressource non disponible - vérifiez votre connexion', { 
                status: 503,
                headers: { 'Content-Type': 'text/plain' }
              });
            }
          } catch (cacheError) {
            swConsole.error(`❌ Erreur de cache pour: ${normalizedUrl.pathname} - ${cacheError.message}`);
            // En cas d'erreur de cache, tenter quand même une requête réseau
            return fetch(event.request).catch(() => {
              return new Response('Erreur de cache - vérifiez votre connexion', { 
                status: 500,
                headers: { 'Content-Type': 'text/plain' }
              });
            });
          }
        })()
      );
    } catch(e) {
      swConsole.error(`❌ Erreur critique: ${e.message} pour ${event.request.url}`);
    }
});

// Écoute des messages
self.addEventListener('message', (event) => {
    if (event.data && event.data.action === 'clearCache') {
      swConsole.log('🗑️ Demande de vidage du cache reçue');
      
      event.waitUntil(
        caches.keys().then(cacheNames => {
          return Promise.all(
            cacheNames.map(cacheName => {
              swConsole.log(`🗑️ Suppression du cache ${cacheName}`);
              return caches.delete(cacheName);
            })
          ).then(() => {
            // Envoi d'un message pour confirmer que le cache a été vidé
            self.clients.matchAll().then(clients => {
              clients.forEach(client => {
                client.postMessage({
                  action: 'cacheCleared',
                  status: 'success'
                });
              });
            });
            swConsole.log('✅ Tous les caches ont été vidés');
          });
        })
      );
    } else if (event.data && event.data.action === 'getSwVersion') {
      // Répondre avec la version du SW
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            action: 'swVersion',
            version: 'v4' // Version du SW
          });
        });
      });
    } else if (event.data && event.data.action === 'skipWaiting') {
      // Demande de prise de contrôle immédiate
      swConsole.log('⚡ Demande de skipWaiting reçue');
      self.skipWaiting();
    } else if (event.data && event.data.action === 'claimClients') {
      // Demande de prise de contrôle des clients
      swConsole.log('⚡ Demande de clients.claim() reçue');
      self.clients.claim().then(() => {
        swConsole.log('✅ clients.claim() exécuté avec succès');
        // Informer les clients qu'ils doivent se recharger
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              action: 'reload',
              reason: 'Service Worker a pris le contrôle'
            });
          });
        });
      });
    } else if (event.data && event.data.action === 'ping') {
      // Répondre au ping pour tester la communication
      swConsole.log('📍 Ping reçu');
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            action: 'pong',
            timestamp: Date.now(),
            receivedAt: event.data.timestamp
          });
        });
      });
    } else {
      // Message inconnu
      swConsole.log(`❓ Message inconnu reçu: ${JSON.stringify(event.data)}`);
    }
});
