// // Nom du cache pour l'application
// const CACHE_NAME = 'treeViewer-app-v2';

// Importer la configuration de cache
importScripts('./cacheConfig.js');

// Liste des ressources à mettre en cache immédiatement
const RESOURCES_TO_CACHE = [
  './',
  './treeViewer1.6.html',
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
    console.log('Service Worker: Installation');
    
    // Force le Service Worker à s'activer immédiatement sans attendre
    self.skipWaiting();
    
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => {
          console.log('Service Worker: Mise en cache des ressources');
          // Ajouter les ressources une par une pour éviter d'échouer complètement
          return Promise.allSettled(
            RESOURCES_TO_CACHE.map(url => 
              cache.add(url).catch(error => {
                console.warn(`Échec de mise en cache pour ${url}:`, error);
                // Ne pas faire échouer l'installation complète
                return Promise.resolve();
              })
            )
          );
        })
        .catch(error => {
          console.warn('Erreur durant la mise en cache:', error);
          // Ne pas faire échouer l'installation
          return Promise.resolve();
        })
    );
  });
  
  // Activation du Service Worker - prendre le contrôle immédiatement
  self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activation');
    
    // Force le Service Worker à prendre le contrôle immédiatement
    event.waitUntil(clients.claim());
    
    // Nettoyer les anciens caches de l'application
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && !cacheName.includes('map-tiles')) {
              console.log(`Service Worker: Suppression de l'ancien cache ${cacheName}`);
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  });




  // Servir depuis le cache, sinon faire une requête réseau
self.addEventListener('fetch', (event) => {

    // Ne pas intercepter les requêtes vers Google favicon (détection de connectivité)
    if (event.request.url.includes('google.com/favicon.ico')) {
        return; // Laisser la requête passer normalement
    }


    // Ne même pas essayer d'intercepter les requêtes des extensions Chrome
    if (event.request.url.startsWith('chrome-extension://') ||
        event.request.url.includes('chrome-search://')) {
      return; // Ne pas intercepter du tout
    }
    
    // Ne pas intercepter les requêtes de tuiles
    if (event.request.url.includes('/maps/') || 
        event.request.url.includes('tile.openstreetmap')) {
      return; // Laisser le navigateur gérer normalement
    }
    
    // Wrap the respondWith in a try/catch to prevent crashing the service worker
    try {
      event.respondWith(
        caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return fetch(event.request).catch(error => {
              console.warn('Fetch error:', error);
              return new Response('Ressource non disponible', { 
                status: 404,
                headers: { 'Content-Type': 'text/plain' }
              });
            });
          })
          .catch(error => {
            console.warn('Cache match error:', error);
            return fetch(event.request).catch(() => {
              return new Response('Erreur de cache', { 
                status: 500,
                headers: { 'Content-Type': 'text/plain' }
              });
            });
          })
      );
    } catch(e) {
      console.error('Service Worker fetch handler error:', e);
    }
  });


  // Ajoutez ceci à la fin de service-worker.js

// Fonction pour vider les caches de l'application
self.addEventListener('message', (event) => {
    if (event.data && event.data.action === 'clearCache') {
      console.log('Service Worker: Demande de vidage du cache reçue');
      
      event.waitUntil(
        caches.keys().then(cacheNames => {
          return Promise.all(
            cacheNames.map(cacheName => {
              console.log(`Service Worker: Suppression du cache ${cacheName}`);
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
          });
        })
      );
    }
  });

