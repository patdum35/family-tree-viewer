// // =================================================================
// // SERVICE WORKER
// // Version: 1.0.20 - Correction communication update
// // =================================================================
// // const isProduction = window.location.pathname.includes('/dist/');
// const isProduction = self.location.pathname.includes('/obfusc/');
// const GEDCOM_PATH = isProduction ? '../' : './';
// const LIBS_PATH = isProduction ? '../libs/' : './libs/';


// importScripts(`${GEDCOM_PATH}cacheConfig.js`);

// // Console pour le logging
// const swConsole = {
//   log: function(message) {
//     console.log(`[SW] ${message}`);
//     try {
//       self.clients.matchAll({includeUncontrolled: true}).then(clients => {
//         clients.forEach(client => client.postMessage({type: 'SW_LOG', message}));
//       });
//     } catch (e) {}
//   },
//   error: function(message) {
//     console.error(`[SW] ${message}`);
//     try {
//       self.clients.matchAll({includeUncontrolled: true}).then(clients => {
//         clients.forEach(client => client.postMessage({type: 'SW_ERROR', message}));
//       });
//     } catch (e) {}
//   }
// };

// swConsole.log(`Service Worker démarré - Cache: ${CACHE_NAME}`);

// // Liste des ressources à mettre en cache immédiatement
// const RESOURCES_TO_CACHE = [
//   './',
//   // './index.html',
//   // './treeViewer1.6.html',
//   './private_index_4691.html',
//   './offline.html',
//   `${GEDCOM_PATH}css/styles.css`,
//   `${GEDCOM_PATH}cacheConfig.js`,
//   `${GEDCOM_PATH}ios-install.html`,
//   // './background_images/tree-log-lowQuality.jpg',

//   // Fichiers JS principaux (seulement les plus critiques)
//   './js/libraryLoader.js',
//   './js/main.js',
//   './js/treeWheelAnimation.js',
//   './js/appInitializer.js',
//   './js/importState.js',
//   // './js/debugLogUtils.js',
//   './js/serviceWorkerInit.js',
//   './js/i18n.js',
//   './js/pwaInstaller_ProgressiveWebApps.js',
//    './service-worker.js',
//    './js/eventHandlers.js',
//    './js/hamburgerMenu.js',

//   // Bibliothèques externes essentielles
//   // './libs/pako.min.js',
//   // './libs/d3.v7.min.js',
//   // './libs/leaflet.js',
//   // './libs/leaflet.css',
  
  
//   // icones et manifest
//   `${GEDCOM_PATH}icons/icon-192x192.png`,
//   `${GEDCOM_PATH}manifest.webmanifest`
// ];

// // Fonction de mise en cache déplacée (appelée manuellement)
// async function performCaching() {
//   try {
//     // Ouvrir le cache
//     const cache = await caches.open(CACHE_NAME);
//     swConsole.log(`📦 Cache '${CACHE_NAME}' ouvert pour téléchargement manuel`);
    
//     let successCount = 0;
//     let failedCount = 0;
    
//     // Utiliser la technique de processInChunks
//     await processInChunks(RESOURCES_TO_CACHE, async (url) => {
//       try {
//         const response = await fetch(url, {
//           method: 'GET',
//           cache: 'no-cache',
//           mode: 'no-cors'
//         });
        
//         if (response.ok || response.type === 'opaque') {
//           await cache.put(url, response.clone());
//           successCount++;
//           // swConsole.log(`✅ Téléchargé: ${url}`);
//         } else {
//           failedCount++;
//           swConsole.error(`❌ Échec: ${url} (${response.status})`);
//         }
//       } catch (err) {
//         failedCount++;
//         swConsole.error(`❌ Erreur: ${url} (${err.message})`);
//       }
//     }, 3, 50);
    
//     swConsole.log(`📊 Téléchargement terminé: ${successCount} OK, ${failedCount} Erreurs`);
//     return true;
//   } catch (error) {
//     swConsole.error(`🔥 Erreur critique cache: ${error.message}`);
//     return false;
//   }
// }

// // Installation : NE FAIT RIEN (pas de téléchargement)
// // self.addEventListener('install', (event) => {
// //   swConsole.log('🚀 Service Worker: Installation détectée (Attente validation utilisateur)');
// //   // On passe immédiatement à l'état "installed" sans rien télécharger
// //   event.waitUntil(Promise.resolve());
// // });


// self.addEventListener('install', (event) => {
//   swConsole.log('\n\n🚀 Installation : Mise en cache du squelette minimal\n\n');
//   event.waitUntil(
//     caches.open(CACHE_NAME).then((cache) => {
//       // On ne met que l'essentiel absolu. 
//       // Si un de ces fichiers est manquant, le SW ne s'installera pas.
//       return cache.addAll(
//         [
//         './', 
//         './private_index_4691.html',
//         `${GEDCOM_PATH}css/styles.css`,
//         `${GEDCOM_PATH}cacheConfig.js`, 
//         `${GEDCOM_PATH}manifest.webmanifest`,
//         './js/importState.js',
//         './js/appInitializer.js',
//         './js/libraryLoader.js',
//         './js/main.js',
//        ]
//       ).catch(err => {
//         swConsole.error('⚠️ Échec de la mise en cache initiale (Ignoré pour éviter blocage): ' + err.message);
//       });
//       // return cache.addAll(
//       // //   [
//       // //   './', 
//       // //   './index.html', 
//       // //   './manifest.webmanifest',
//       // //   // './js/treeWheelAnimation.js'
//       // //  ]
//       //   [
//       //     './',
//       //     './index.html',
//       //     './offline.html',
//       //     './css/styles.css',
//       //     './cacheConfig.js',
//       //     './ios-install.html',
//       //     './background_images/tree-log-lowQuality.jpg',
//       //     './js/libraryLoader.js',
//       //     './js/main.js',
//       //     './js/treeWheelAnimation.js',
//       //     './js/appInitializer.js',
//       //     './js/serviceWorkerInit.js',
//       //     './js/i18n.js',
//       //     './js/pwaInstaller_ProgressiveWebApps.js',
//       //     './service-worker.js',
//       //     './eventHandlers.js',
//       //     './hamburgerMenu.js',
//       //     './icons/icon-192x192.png',
//       //     './manifest.webmanifest'
//       //   ]
//       // ).catch(err => {
//       //   swConsole.error('⚠️ Échec de la mise en cache initiale (Ignoré pour éviter blocage): ' + err.message);
//       // });
//     })
//   );
//   // Optionnel : forcer le passage à l'activation
//   self.skipWaiting();
// });




// // Traitement par lots, comme dans votre code qui fonctionne
// async function processInChunks(items, processor, chunkSize = 3, delay = 50) {
//   for (let i = 0; i < items.length; i += chunkSize) {
//     const chunk = items.slice(i, i + chunkSize);
    
//     // Traiter le lot actuel
//     const promises = chunk.map(item => processor(item));
    
//     try {
//       await Promise.all(promises);
      
//       // Log de progression pour de grands ensembles
//       if (i % 10 === 0 || i + chunkSize >= items.length) {
//         swConsole.log(`Progression: ${Math.min(i + chunkSize, items.length)}/${items.length}`);
//       }
//     } catch (err) {
//       swConsole.error(`Erreur dans le lot ${i}-${i+chunkSize}: ${err.message}`);
//     }
    
//     // Pause pour permettre à l'interface de répondre
//     if (i + chunkSize < items.length && delay > 0) {
//       await new Promise(resolve => setTimeout(resolve, delay));
//     }
//   }
// }

// // Activation - nettoyer les anciens caches
// self.addEventListener('activate', (event) => {
//   swConsole.log('🚀 Service Worker: Activation');
  
//   // Prendre le contrôle immédiatement
//   event.waitUntil(clients.claim());
  
//   // Nettoyer les anciens caches
//   event.waitUntil(
//     caches.keys().then(cacheNames => {
//       return Promise.all(
//         cacheNames.map(cacheName => {
//           if (cacheName !== CACHE_NAME && !cacheName.includes('map-tiles') && !cacheName.includes('app-resources-cache')) {
//             swConsole.log(`🗑️ Suppression de l'ancien cache ${cacheName}`);
//             return caches.delete(cacheName);
//           }
//         })
//       );
//     })
//   );
// });


// // Stratégie de cache simplifiée - inspirée de votre fetchTileWithCache
// self.addEventListener('fetch', (event) => {


//   // 🛡️ AJOUTER CETTE CONDITION ICI
//   if (event.request.method !== 'GET') {
//     return; // On ne traite pas les requêtes HEAD, POST, etc.
//   }

//   // Ignorer certaines requêtes
//   if (event.request.url.includes('google.com/favicon.ico') || 
//       event.request.url.startsWith('chrome-extension://') ||
//       event.request.url.includes('chrome-search://')) {
//     return;
//   }

//   // Ne pas intercepter les tuiles de carte, les jpg, les enc, les mp3, les json
  
//   if (event.request.url.includes('/maps/') || 
//       event.request.url.includes('tile.openstreetmap') ||
//       event.request.url.endsWith('.jpg') ||
//       event.request.url.endsWith('.enc') ||
//       event.request.url.endsWith('.mp3') ||
//       event.request.url.endsWith('.json') ||
//       event.request.url.endsWith('.jpx') ||
//       event.request.url.endsWith('.mpx') ||
//       event.request.headers.get('X-Requested-With') === 'no-sw-intercept') {
//     return;
//   }

//   const url = new URL(event.request.url);

//   // Ne pas mettre en cache les requêtes de géolocalisation ou d'autres api
//   if (url.hostname !== location.hostname || 
//       url.href.includes('nominatim.openstreetmap.org') ||
//       url.href.includes('api.') ||
//       url.href.includes('.api.')) {
//       return; // Laisser passer sans cache
//   }


//   // Ne pas mettre en cache les requêtes de géolocalisation ou d'autres api
//   if (url.hostname !== location.hostname || 
//       url.href.includes('nominatim.openstreetmap.org') ||
//       url.href.includes('api.') ||
//       url.href.includes('.api.')) {
//       return; // Laisser passer sans cache
//   }

  
//   // Stratégie basic Cache-first
//   event.respondWith(
//     caches.open(CACHE_NAME).then(cache => {
//       return cache.match(event.request, { ignoreSearch: true, ignoreVary: true  })
//         .then(cachedResponse => {
//           if (cachedResponse) {
//             return cachedResponse;
//           }
          
//           // Rien en cache, passer au réseau
//           return fetch(event.request)
//             .then(networkResponse => {
//               // Si c'est une ressource utile à mettre en cache
//               if (networkResponse.ok) {
//                 // Mettre en cache pour la prochaine fois
//                 cache.put(event.request, networkResponse.clone());
//               }
//               return networkResponse;
//             })
//             .catch(error => {
//               // Erreur réseau
//               if (event.request.mode === 'navigate') {
//                 // Pour les pages HTML, proposer une page hors ligne
//                 return new Response(
//                   '<html><body><h1>Offline</h1><p>Cette page n\'est pas disponible hors ligne.</p></body></html>',
//                   { headers: { 'Content-Type': 'text/html' } }
//                 );
//               }
              
//               // Pour les autres ressources, juste une erreur
//               return new Response('Offline', { status: 503 });
//             });
//         });
//     })
//   );
// });

// // Messages
// self.addEventListener('message', (event) => {
//   if (!event.data || !event.data.action) return;
  
//   if (event.data.action === 'skipWaiting') {
//     swConsole.log('🏃‍♂️ Action "skipWaiting" reçue, activation du nouveau SW...');
//     self.skipWaiting();
//   }
  
//   // NOUVEAU : Action pour déclencher le téléchargement
//   if (event.data.action === 'downloadResources') {
//     swConsole.log('📥 Ordre de téléchargement reçu de l\'utilisateur');
//     performCaching().then(() => {
//         // Prévenir le client que c'est fini
//         // IMPORTANT : includeUncontrolled: true est vital car ce SW ne contrôle pas encore la page
//         self.clients.matchAll({includeUncontrolled: true}).then(clients => {
//             clients.forEach(client => client.postMessage({type: 'DOWNLOAD_COMPLETE'}));
//         });
//     });
//   }

//   switch (event.data.action) {
//     case 'clearCache':
//       swConsole.log('🗑️ Demande de vidage du cache reçue');
      
//       event.waitUntil(
//         caches.keys().then(cacheNames => {
//           return Promise.all(
//             cacheNames.map(cacheName => {
//               swConsole.log(`🗑️ Suppression du cache ${cacheName}`);
//               return caches.delete(cacheName);
//             })
//           ).then(() => {
//             // Confirmer au client
//             event.source.postMessage({
//               action: 'cacheCleared',
//               status: 'success'
//             });
//           });
//         })
//       );
//       break;
      
//     case 'getSwVersion':
//       // Répondre avec la version
//       event.source.postMessage({
//         action: 'swVersion',
//         version: 'v5-mobile-simplifiée'
//       });
//       break;
      
//     case 'ping':
//       // Simple ping-pong pour tester la communication
//       event.source.postMessage({
//         action: 'pong',
//         timestamp: Date.now()
//       });
//       break;
//   }
// });

// // Mettre en cache du contenu supplémentaire en arrière-plan
// // après l'activation initiale






// // self.addEventListener('activate', (event) => {
// //   // Laisser s'exécuter en arrière-plan
// //   event.waitUntil((async () => {
// //     try {
// //       // Mettre en cache d'autres ressources JS, moins critiques
// //       const additionalResources = [
// //         './js/audioPlayer.js',
// //         './js/backgroundManager.js',
// //         './js/dateUI.js',
// //         './js/debugLogUtils.js',
// //         './js/directHamburgerMenu.js',
// //         './js/eventHandlers.js',
// //         './js/exportManager.js',
// //         './js/exportSettings.js',
// //         './js/gedcomParser.js',
// //         './js/geoHeatMapDataProcessor.js',
// //         './js/geoHeatMapInteractions.js',
// //         './js/geoHeatMapUI.js',
// //         './js/geoLocalisation.js',
// //         './js/hamburgerMenu.js',
// //         './js/helpHamburgerMenu.js',
// //         './js/historicalData.js',
// //         './js/mainUI.js',
// //         './js/mapTilesPreloader.js',
// //         './js/mapUtils.js',
// //         './js/modalWindow.js',
// //         './js/nameCloud.js',
// //         './js/nameCloudAverageAge.js',
// //         './js/nameCloudCenturyModal.js',
// //         './js/nameCloudInteractions.js',
// //         './js/nameCloudRenderer.js',
// //         './js/nameCloudSettings.js',
// //         './js/nameCloudShapes.js',
// //         './js/nameCloudStatModal.js',
// //         './js/nameCloudUI.js',
// //         './js/nameCloudUtils.js',
// //         './js/nodeControls.js',
// //         './js/nodeRenderer.js',
// //         './js/nodeStyles.js',
// //         './js/occupations.js',
// //         './js/photoPlayer.js',
// //         './js/puzzleSwipe.js',
// //         './js/resizableModalUtils.js',
// //         './js/searchModalUI.js',
// //         './js/statsModalUI.js',
// //         './js/treeAnimation.js',
// //         './js/treeOperations.js',
// //         './js/treeRenderer.js',
// //         './js/treeSettingsModal.js',
// //         './js/treeWheelAnimation.js',
// //         './js/treeWheelRenderer.js',
// //         './js/UIutils.js',
// //         './js/utils.js',
// //         './js/occupations.js',
// //         './js/voiceSelect.js',
// //         './libs/lodash.min.js',
// //         './libs/leaflet-heat.js',
// //         './libs/react.production.min.js',
// //         './libs/react-dom.production.min.js',
// //         './libs/d3.layout.cloud.min.js',
// //         './libs/tf.min.js',
// //         './libs/coco-ssd.min.js',

// //       ];

// //       // Attendre un peu pour ne pas interférer avec l'activation
// //       await new Promise(resolve => setTimeout(resolve, 1000));
      
// //       swConsole.log('🔄 Mise en cache différée de ressources supplémentaires...');
      
// //       const cache = await caches.open(CACHE_NAME);
// //       let successCount = 0;
// //       let failedCount = 0;

// //       // Utiliser la même technique de lots qui fonctionne déjà pour les tuiles
// //       await processInChunks(additionalResources, async (url) => {
// //         try {
// //           // Vérifier si déjà en cache
// //           const cachedResponse = await cache.match(url);
// //           if (cachedResponse) return;
          
// //           // Sinon, mettre en cache
// //           const response = await fetch(url, {
// //             method: 'GET',
// //             cache: 'no-cache',
// //             mode: 'no-cors'
// //           });
          
// //           if (response.ok || response.type === 'opaque') {
// //             await cache.put(url, response.clone());
// //             successCount++;
// //           } else {
// //             failedCount++;
// //           }
// //         } catch (err) {
// //           failedCount++;
// //         }
// //       }, 2, 100); // Encore plus petit (2) et plus lent (100ms) pour les ressources additionnelles
      
// //       swConsole.log(`✅ Mise en cache différée terminée: ${successCount} réussis, ${failedCount} échoués`);
// //     } catch (error) {
// //       swConsole.error(`Erreur lors de la mise en cache différée: ${error.message}`);
// //     }
// //   })());
// // });




// // 1. On vide l'activation pour que Lighthouse ne voit rien au démarrage
// self.addEventListener('activate', (event) => {
//   swConsole.log('✅ SW activé (mode silencieux)');
//   event.waitUntil(self.clients.claim());
// });







// // 2. On met le code de cache à l'intérieur du gestionnaire de messages existant
// // self.addEventListener('message', (event) => {
// //   if (!event.data || !event.data.action) return;

// //   if (event.data.action === 'startFullCaching') {
// //     swConsole.log('📥 Ordre reçu : Lancement du cache de codes js et libs supplémentaires différé...');

// //     event.waitUntil((async () => {
// //       try {
// //         const additionalResources = [
// //           './js/audioPlayer.js',
// //           './js/backgroundManager.js',
// //           './js/dateUI.js',
// //           './js/debugLogUtils.js',
// //           './js/documentation.js',
// //           './js/eventHandlers.js',
// //           './js/exportManager.js',
// //           './js/exportSettings.js',
// //           './js/gedcomParser.js',
// //           './js/geoHeatMapDataProcessor.js',
// //           './js/geoHeatMapInteractions.js',
// //           './js/geoHeatMapUI.js',
// //           './js/geoLocalisation.js',
// //           './js/hamburgerMenu.js',
// //           './js/helpHamburgerMenu.js',
// //           './js/historicalData.js',
// //           './js/mainUI.js',
// //           './js/mapTilesPreloader.js',
// //           './js/mapUtils.js',
// //           './js/modalWindow.js',
// //           './js/nameCloud.js',
// //           './js/nameCloudAverageAge.js',
// //           './js/nameCloudCenturyModal.js',
// //           './js/nameCloudInteractions.js',
// //           './js/nameCloudRenderer.js',
// //           './js/nameCloudSettings.js',
// //           './js/nameCloudShapes.js',
// //           './js/nameCloudStatModal.js',
// //           './js/nameCloudUI.js',
// //           './js/nameCloudUtils.js',
// //           './js/nodeControls.js',
// //           './js/nodeRenderer.js',
// //           './js/nodeStyles.js',
// //           './js/occupations.js',
// //           './js/photoPlayer.js',
// //           './js/puzzleSwipe.js',
// //           './js/resizableModalUtils.js',
// //           './js/searchModalUI.js',
// //           './js/statsModalUI.js',
// //           './js/treeAnimation.js',
// //           './js/treeOperations.js',
// //           './js/treeRenderer.js',
// //           './js/treeSettingsModal.js',
// //           './js/treeWheelAnimation.js',
// //           './js/treeWheelRenderer.js',
// //           './js/UIutils.js',
// //           './js/utils.js',
// //           './js/voiceSelect.js',
// //           // './libs/lodash.min.js',
// //           // './libs/leaflet-heat.js',
// //           // './libs/react.production.min.js',
// //           // './libs/react-dom.production.min.js',
// //           // './libs/d3.layout.cloud.min.js',
// //           './libs/tf.min.js',
// //           './libs/coco-ssd.min.js',
// //         ];

// //         await new Promise(resolve => setTimeout(resolve, 1000));

// //         swConsole.log(`🔄 Mise en cache différée de codes js et libs supplémentaires ...`);

// //         let newlyAdded = [];
// //         let alreadyPresent = [];
// //         let errorFiles = [];

// //         swConsole.log(`🔄 Vérification du cache de codes js et libs supplémentaires avant traitement...`);

// //         const cache = await caches.open(CACHE_NAME);
// //         const keys = await cache.keys();

// //         // --- TON TEST D'OPTIMISATION ---
// //         // On vérifie si le nombre de fichiers en cache correspond au moins 
// //         // au nombre de fichiers qu'on veut ajouter.
// //         if (keys.length >= additionalResources.length) {
// //             // Optionnel : vérifier si un fichier clé de ta liste est bien là
// //             const lastFile = additionalResources[additionalResources.length - 1];
// //             const lastFileFull = new URL(lastFile, self.location.origin).href;
// //             const isLastFileThere = keys.some(k => k.url === lastFileFull);

// //             if (isLastFileThere) {
// //                 swConsole.log("✅ Cache de codes js et libs supplémentaires COMPLET détecté. Opération annulée pour gagner du temps.");
// //                 log("✅ Codes js et libs supplémentaires déjà présentes.", 'info');
// //                 return; // ON SORT DIRECTEMENT
// //             }
// //         }


// //         const urlsInCache = new Set(keys.map(k => k.url));

// //         await processInChunks(additionalResources, async (urlToFind) => {
// //             try {
// //                 // Transformation en URL absolue (ex: http://127.0.0.1:5502/js/file.js)
// //                 const fullUrl = new URL(urlToFind, self.location.origin).href;

// //                 if (urlsInCache.has(fullUrl)) {
// //                     alreadyPresent.push(urlToFind);
// //                     return;
// //                 }

// //                 const response = await fetch(fullUrl, { method: 'GET', cache: 'no-cache', mode: 'no-cors' });
                
// //                 if (response.ok || response.type === 'opaque') {
// //                     await cache.put(fullUrl, response.clone());
// //                     newlyAdded.push(urlToFind);
// //                 } else {
// //                     errorFiles.push(urlToFind);
// //                 }
// //             } catch (err) {
// //                 errorFiles.push(urlToFind);
// //             }
// //         }, 2, 100);

// //         // --- RAPPORT CONSOLIDÉ ---
// //         swConsole.log(`📊 BILAN DES codes js et libs supplémentaires (${additionalResources.length} total) :`);

// //         if (alreadyPresent.length > 0) {
// //             swConsole.log(`ℹ️ codes js et libs supplémentaires DÉJÀ EN CACHE (${alreadyPresent.length}) :\n   - ${alreadyPresent.join('\n   - ')}`);
// //         }

// //         if (newlyAdded.length > 0) {
// //             swConsole.log(`✅ codes js et libs supplémentaires NOUVELLEMENT AJOUTÉS (${newlyAdded.length}) :\n   - ${newlyAdded.join('\n   - ')}`);
// //         }

// //         if (errorFiles.length > 0) {
// //             swConsole.log(`❌ ÉCHECS  codes js et libs supplémentaires (${errorFiles.length}) :\n   - ${errorFiles.join('\n   - ')}`);
// //         }

// //         swConsole.log(`🏁 Fin de la mise en cache des codes js et libs supplémentaires.`);
        

// //       } catch (error) {
// //         swConsole.error(`Erreur critique: ${error.message}`);
// //       }
// //     })());
// //   }
// // });


// self.addEventListener('message', (event) => {
//   if (!event.data || !event.data.action) return;

//   if (event.data.action === 'startFullCaching') {
//     swConsole.log('📥 Ordre reçu : Lancement du cache différé...');

//     event.waitUntil((async () => {
//       try {
//         const additionalResources = [
//           './js/audioPlayer.js',
//           './js/backgroundManager.js',
//           './js/dateUI.js',
//           './js/debugLogUtils.js',
//           './js/documentation.js',
//           './js/eventHandlers.js',
//           './js/exportManager.js',
//           './js/exportSettings.js',
//           './js/gedcomParser.js',
//           './js/geoHeatMapDataProcessor.js',
//           './js/geoHeatMapInteractions.js',
//           './js/geoHeatMapUI.js',
//           './js/geoLocalisation.js',
//           './js/hamburgerMenu.js',
//           './js/helpHamburgerMenu.js',
//           './js/historicalData.js',
//           './js/mainUI.js',
//           './js/mapTilesPreloader.js',
//           './js/mapUtils.js',
//           './js/modalWindow.js',
//           './js/nameCloud.js',
//           './js/nameCloudAverageAge.js',
//           './js/nameCloudCenturyModal.js',
//           './js/nameCloudInteractions.js',
//           './js/nameCloudRenderer.js',
//           './js/nameCloudSettings.js',
//           './js/nameCloudShapes.js',
//           './js/nameCloudStatModal.js',
//           './js/nameCloudUI.js',
//           './js/nameCloudUtils.js',
//           './js/nodeControls.js',
//           './js/nodeRenderer.js',
//           './js/nodeStyles.js',
//           './js/occupations.js',
//           './js/photoPlayer.js',
//           './js/puzzleSwipe.js',
//           './js/resizableModalUtils.js',
//           './js/searchModalUI.js',
//           './js/statsModalUI.js',
//           './js/treeAnimation.js',
//           './js/treeOperations.js',
//           './js/treeRenderer.js',
//           './js/treeSettingsModal.js',
//           './js/treeWheelAnimation.js',
//           './js/treeWheelRenderer.js',
//           './js/UIutils.js',
//           './js/utils.js',
//           './js/voiceSelect.js',

//           `${LIBS_PATH}tf.min.js`,
//           `${LIBS_PATH}coco-ssd.min.js`,
//         ];

//         // On attend un peu pour laisser le thread principal respirer au démarrage
//         await new Promise(resolve => setTimeout(resolve, 1000));

//         const tTotalStart = performance.now(); // Début global
//         swConsole.log(`🔄 Mise en cache différée de codes js et libs supplémentaires ...`);

//         let newlyAdded = [];
//         let alreadyPresent = [];
//         let errorFiles = [];

//         // --- 1. SCAN INITIAL DU CACHE ---
//         const tScanStart = performance.now();
//         const cache = await caches.open(CACHE_NAME);
//         const keys = await cache.keys();
//         const scanDuration = (performance.now() - tScanStart).toFixed(2);

//         swConsole.log(`🔍 Scan du cache effectué en ${scanDuration}ms`);

//         // --- 2. TEST D'OPTIMISATION (Short-circuit) ---
//         if (keys.length >= additionalResources.length) {
//             const lastFile = additionalResources[additionalResources.length - 1];
//             const lastFileFull = new URL(lastFile, self.location.origin).href;
//             const isLastFileThere = keys.some(k => k.url === lastFileFull);

//             if (isLastFileThere) {
//                 const totalDuration = (performance.now() - tTotalStart).toFixed(2);
//                 swConsole.log(`✅ Cache COMPLET détecté en ${totalDuration}ms. Opération annulée.`);
//                 // Si la fonction log() envoie un message au client :
//                 if (typeof log === 'function') log("✅ Codes js et libs supplémentaires déjà présentes.", 'info');
//                 return;
//             }
//         }

//         const urlsInCache = new Set(keys.map(k => k.url));

//         // --- 3. TRAITEMENT PAR LOTS AVEC MESURE INDIVIDUELLE ---
//         await processInChunks(additionalResources, async (urlToFind) => {
//             const tFileStart = performance.now();
//             try {
//                 // const fullUrl = new URL(urlToFind, self.location.origin).href;
//                 const fullUrl = new URL(urlToFind, self.location).href;

//                 if (urlsInCache.has(fullUrl)) {
//                     alreadyPresent.push(urlToFind);
//                     return;
//                 }

//                 const response = await fetch(fullUrl, { 
//                     method: 'GET', 
//                     cache: 'no-cache', 
//                     mode: 'no-cors' 
//                 });
                
//                 if (response.ok || response.type === 'opaque') {
//                     await cache.put(fullUrl, response.clone());
//                     const fileDuration = (performance.now() - tFileStart).toFixed(2);
//                     newlyAdded.push(`${urlToFind} (${fileDuration}ms)`);
//                 } else {
//                     errorFiles.push(urlToFind);
//                 }
//             } catch (err) {
//                 errorFiles.push(urlToFind);
//             }
//         }, 2, 100);

//         // --- RAPPORT CONSOLIDÉ MIS À JOUR ---
//         const totalDuration = (performance.now() - tTotalStart).toFixed(2);
//         swConsole.log(`📊 BILAN DES codes js et libs supplémentaires (${additionalResources.length} total) en ${totalDuration}ms :`);

//         if (alreadyPresent.length > 0) {
//             // On garde ton formatage exact : \n   - 
//             swConsole.log(`ℹ️ codes js et libs supplémentaires DÉJÀ EN CACHE (${alreadyPresent.length}) :\n   - ${alreadyPresent.join('\n   - ')}`);
//         }

//         if (newlyAdded.length > 0) {
//             // On ajoute juste le temps entre parenthèses pour les nouveaux
//             swConsole.log(`✅ codes js et libs supplémentaires NOUVELLEMENT AJOUTÉS (${newlyAdded.length}) :\n   - ${newlyAdded.join('\n   - ')}`);
//         }

//         if (errorFiles.length > 0) {
//             swConsole.log(`❌ ÉCHECS codes js et libs supplémentaires (${errorFiles.length}) :\n   - ${errorFiles.join('\n   - ')}`);
//         }

//         swConsole.log(`🏁 Fin de la mise en cache des codes js et libs supplémentaires en ${totalDuration}ms.`);


//       } catch (error) {
//         swConsole.error(`Erreur critique SW: ${error.message}`);
//       }
//     })());
//   }
// });








































// =================================================================
// SERVICE WORKER
// Version: 1.0.20 - Correction communication update
// =================================================================
// MODIF: Chemins fixes car le SW est à la racine et gère dynamiquement


// Test immédiat au chargement du script
const rawLocation = self.location.href;
const parsedUrl = new URL(rawLocation);
const modeParam = parsedUrl.searchParams.get('mode');

console.log('--- TEST SW URL ---');
console.log('URL complète du SW :', rawLocation);
console.log('Valeur du paramètre mode :', modeParam);
console.log('isDebugMode est :', modeParam === 'debug');
console.log('-------------------');


const swUrl = new URL(self.location.href);
const isDebugMode = swUrl.searchParams.get('mode') === 'debug';

const GEDCOM_PATH = './';
const LIBS_PATH = './libs/';


importScripts(`${GEDCOM_PATH}cacheConfig.js`);

// Console pour le logging
const swConsole = {
  log: function(message) {
    console.log(`[SW] ${message}`);
    try {
      self.clients.matchAll({includeUncontrolled: true}).then(clients => {
        clients.forEach(client => client.postMessage({type: 'SW_LOG', message}));
      });
    } catch (e) {}
  },
  error: function(message) {
    console.error(`[SW] ${message}`);
    try {
      self.clients.matchAll({includeUncontrolled: true}).then(clients => {
        clients.forEach(client => client.postMessage({type: 'SW_ERROR', message}));
      });
    } catch (e) {}
  }
};

swConsole.log(`Service Worker démarré - Cache: ${CACHE_NAME}`);

// --- POINT 1 : MODIFICATION ICI (Séparation Clair / Obfusc) ---
const RESOURCES_TO_CACHE_CLAIR = [
  './',
  // './index.html',
  // './treeViewer1.6.html',
  './private_index_4691.html',
  './offline.html',
  `${GEDCOM_PATH}css/styles.css`,
  `${GEDCOM_PATH}cacheConfig.js`,
  `${GEDCOM_PATH}ios-install.html`,
  // './background_images/tree-log-lowQuality.jpg',

  // Fichiers JS principaux (seulement les plus critiques)
  './js/libraryLoader.js',
  './js/main.js',
  './js/treeWheelAnimation.js',
  './js/appInitializer.js',
  './js/importState.js',
  // './js/debugLogUtils.js',
  './js/serviceWorkerInit.js',
  './js/i18n.js',
  './js/pwaInstaller_ProgressiveWebApps.js',
   './service-worker.js',
   './js/eventHandlers.js',
   './js/hamburgerMenu.js',

  
  // icones et manifest
  `${GEDCOM_PATH}icons/icon-192x192.png`,
  `${GEDCOM_PATH}manifest.webmanifest`
];

// @BUILD_INJECT_RESOURCES_OBFUSC@

// const RESOURCES_TO_CACHE_OBFUSC = [
//   './',
//   './index.html',
//   './offline.html',
//   `${GEDCOM_PATH}css/styles.css`,
//   `${GEDCOM_PATH}cacheConfig.js`,
//   `${GEDCOM_PATH}manifest.webmanifest`
// ];

// Par défaut pour un téléchargement générique
// Sélection automatique de la liste globale
const RESOURCES_TO_CACHE = isDebugMode ? RESOURCES_TO_CACHE_CLAIR : RESOURCES_TO_CACHE_OBFUSC;
// --------------------------------------------------------------

// Fonction de mise en cache déplacée (appelée manuellement)
async function performCaching() {
  try {
    // Ouvrir le cache
    const cache = await caches.open(CACHE_NAME);
    swConsole.log(`📦 Cache '${CACHE_NAME}' ouvert pour téléchargement manuel`);
    
    let successCount = 0;
    let failedCount = 0;
    
    // Utiliser la technique de processInChunks
    await processInChunks(RESOURCES_TO_CACHE, async (url) => {
      try {
        const response = await fetch(url, {
          method: 'GET',
          cache: 'no-cache',
          mode: 'no-cors'
        });
        
        if (response.ok || response.type === 'opaque') {
          await cache.put(url, response.clone());
          successCount++;
          // swConsole.log(`✅ Téléchargé: ${url}`);
        } else {
          failedCount++;
          swConsole.error(`❌ Échec: ${url} (${response.status})`);
        }
      } catch (err) {
        failedCount++;
        swConsole.error(`❌ Erreur: ${url} (${err.message})`);
      }
    }, 3, 50);
    
    swConsole.log(`📊 Téléchargement terminé: ${successCount} OK, ${failedCount} Erreurs`);
    return true;
  } catch (error) {
    swConsole.error(`🔥 Erreur critique cache: ${error.message}`);
    return false;
  }
}

// Installation : NE FAIT RIEN (pas de téléchargement)
// self.addEventListener('install', (event) => {
//   swConsole.log('🚀 Service Worker: Installation détectée (Attente validation utilisateur)');
//   // On passe immédiatement à l'état "installed" sans rien télécharger
//   event.waitUntil(Promise.resolve());
// });


self.addEventListener('install', (event) => {
  swConsole.log('\n\n🚀 Installation : Mise en cache du squelette minimal\n\n');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // On ne met que l'essentiel absolu. 
      // Si un de ces fichiers est manquant, le SW ne s'installera pas.
      
      // --- POINT 2 : MODIFICATION ICI (Séparation Squelette) ---
      const SKELETON_CLAIR = [
        './', 
        './private_index_4691.html',
        `${GEDCOM_PATH}css/styles.css`,
        `${GEDCOM_PATH}cacheConfig.js`, 
        `${GEDCOM_PATH}manifest.webmanifest`,
        './js/importState.js',
        './js/appInitializer.js',
        './js/libraryLoader.js',
        './js/main.js',
      ];

      // @BUILD_INJECT_SKELETON_OBFUSC@

      // const SKELETON_OBFUSC = [
      //   './',
      //   './index.html',
      //   `${GEDCOM_PATH}css/styles.css`,
      //   `${GEDCOM_PATH}cacheConfig.js`,
      //   `${GEDCOM_PATH}manifest.webmanifest`
      // ];

  


      const activeSkeleton = isDebugMode ? SKELETON_CLAIR : SKELETON_OBFUSC;
      return cache.addAll(activeSkeleton).catch(err => {
      // ---------------------------------------------------------
        swConsole.error('⚠️ Échec de la mise en cache initiale (Ignoré pour éviter blocage): ' + err.message);
      });
    })
  );
  // Optionnel : forcer le passage à l'activation
  self.skipWaiting();
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


  // 🛡️ AJOUTER CETTE CONDITION ICI
  if (event.request.method !== 'GET') {
    return; // On ne traite pas les requêtes HEAD, POST, etc.
  }

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
      return cache.match(event.request, { ignoreSearch: true, ignoreVary: true  })
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
  
  if (event.data.action === 'skipWaiting') {
    swConsole.log('🏃‍♂️ Action "skipWaiting" reçue, activation du nouveau SW...');
    self.skipWaiting();
  }
  
  // NOUVEAU : Action pour déclencher le téléchargement
  if (event.data.action === 'downloadResources') {
    swConsole.log('📥 Ordre de téléchargement reçu de l\'utilisateur');
    performCaching().then(() => {
        // Prévenir le client que c'est fini
        // IMPORTANT : includeUncontrolled: true est vital car ce SW ne contrôle pas encore la page
        self.clients.matchAll({includeUncontrolled: true}).then(clients => {
            clients.forEach(client => client.postMessage({type: 'DOWNLOAD_COMPLETE'}));
        });
    });
  }

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

    case 'checkMode':
      event.source.postMessage({
        action: 'modeReport',
        detectedMode: isDebugMode ? 'DEBUG (CLAIR)' : 'PROD (OBFUSC)',
        fullUrl: self.location.href
      });
      break;


  }
});

// Mettre en cache du contenu supplémentaire en arrière-plan
// après l'activation initiale

// 1. On vide l'activation pour que Lighthouse ne voit rien au démarrage
self.addEventListener('activate', (event) => {
  swConsole.log('✅ SW activé (mode silencieux)');
  event.waitUntil(self.clients.claim());
});




self.addEventListener('message', (event) => {
  if (!event.data || !event.data.action) return;

  if (event.data.action === 'startFullCaching') {
    swConsole.log('📥 Ordre reçu : Lancement du cache différé...');

    event.waitUntil((async () => {
      try {
        
        // --- POINT 3 : MODIFICATION ICI (Séparation Additional) ---
        // const clientUrl = event.source.url;
        // const isDebugMode = clientUrl.includes('private_index_4691.html');

        const CLAIR_ADDITIONAL = [
          './js/audioPlayer.js', //
          './js/backgroundManager.js',
          './js/dateUI.js',
          './js/debugLogUtils.js',
          './js/documentation.js',
          './js/eventHandlers.js',
          './js/exportManager.js',
          './js/exportSettings.js',
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
          './js/nodeStyles.js',
          './js/occupations.js',
          './js/photoPlayer.js',
          './js/puzzleSwipe.js',
          './js/resizableModalUtils.js',
          './js/searchModalUI.js',
          './js/statsModalUI.js',
          './js/treeAnimation.js',
          './js/treeOperations.js',
          './js/treeRenderer.js',
          './js/treeSettingsModal.js',
          './js/treeWheelAnimation.js',
          './js/treeWheelRenderer.js',
          './js/UIutils.js',
          './js/utils.js',
          './js/voiceSelect.js',

          `${LIBS_PATH}tf.min.js`,
          `${LIBS_PATH}coco-ssd.min.js`,
        ];

        // @BUILD_INJECT_ADDITIONAL_OBFUSC@

        // const OBFUSC_ADDITIONAL = [];

        const additionalResources = isDebugMode ? CLAIR_ADDITIONAL : OBFUSC_ADDITIONAL;
        
        // -----------------------------------------------------------

        // On attend un peu pour laisser le thread principal respirer au démarrage
        await new Promise(resolve => setTimeout(resolve, 1000));

        const tTotalStart = performance.now(); // Début global
        swConsole.log('\n\n🔄 Mise en cache différée de codes js et libs supplémentaires ... isDebugMode=', isDebugMode);

        let newlyAdded = [];
        let alreadyPresent = [];
        let errorFiles = [];

        // --- 1. SCAN INITIAL DU CACHE ---
        const tScanStart = performance.now();
        const cache = await caches.open(CACHE_NAME);
        const keys = await cache.keys();
        const scanDuration = (performance.now() - tScanStart).toFixed(2);

        swConsole.log(`🔍 Scan du cache effectué en ${scanDuration}ms`);

        // --- 2. TEST D'OPTIMISATION (Short-circuit) ---
        if (keys.length >= additionalResources.length) {
            const lastFile = additionalResources[additionalResources.length - 1];
            const lastFileFull = new URL(lastFile, self.location.origin).href;
            const isLastFileThere = keys.some(k => k.url === lastFileFull);

            if (isLastFileThere) {
                const totalDuration = (performance.now() - tTotalStart).toFixed(2);
                swConsole.log(`✅ Cache COMPLET détecté en ${totalDuration}ms. Opération annulée.`);
                // Si la fonction log() envoie un message au client :
                if (typeof log === 'function') log("✅ Codes js et libs supplémentaires déjà présentes.", 'info');
                return;
            }
        }

        const urlsInCache = new Set(keys.map(k => k.url));

        // --- 3. TRAITEMENT PAR LOTS AVEC MESURE INDIVIDUELLE ---
        await processInChunks(additionalResources, async (urlToFind) => {
            const tFileStart = performance.now();
            try {
                // const fullUrl = new URL(urlToFind, self.location.origin).href;
                const fullUrl = new URL(urlToFind, self.location).href;

                if (urlsInCache.has(fullUrl)) {
                    alreadyPresent.push(urlToFind);
                    return;
                }

                const response = await fetch(fullUrl, { 
                    method: 'GET', 
                    cache: 'no-cache', 
                    mode: 'no-cors' 
                });
                
                if (response.ok || response.type === 'opaque') {
                    await cache.put(fullUrl, response.clone());
                    const fileDuration = (performance.now() - tFileStart).toFixed(2);
                    newlyAdded.push(`${urlToFind} (${fileDuration}ms)`);
                } else {
                    errorFiles.push(urlToFind);
                }
            } catch (err) {
                errorFiles.push(urlToFind);
            }
        }, 2, 100);

        // --- RAPPORT CONSOLIDÉ MIS À JOUR ---
        const totalDuration = (performance.now() - tTotalStart).toFixed(2);
        swConsole.log(`📊 BILAN DES codes js et libs supplémentaires (${additionalResources.length} total) en ${totalDuration}ms :`);

        if (alreadyPresent.length > 0) {
            // On garde ton formatage exact : \n   - 
            swConsole.log(`ℹ️ codes js et libs supplémentaires DÉJÀ EN CACHE (${alreadyPresent.length}) :\n   - ${alreadyPresent.join('\n   - ')}`);
        }

        if (newlyAdded.length > 0) {
            // On ajoute juste le temps entre parenthèses pour les nouveaux
            swConsole.log(`✅ codes js et libs supplémentaires NOUVELLEMENT AJOUTÉS (${newlyAdded.length}) :\n   - ${newlyAdded.join('\n   - ')}`);
        }

        if (errorFiles.length > 0) {
            swConsole.log(`❌ ÉCHECS codes js et libs supplémentaires (${errorFiles.length}) :\n   - ${errorFiles.join('\n   - ')}`);
        }

        swConsole.log(`🏁 Fin de la mise en cache des codes js et libs supplémentaires en ${totalDuration}ms.`);


      } catch (error) {
        swConsole.error(`Erreur critique SW: ${error.message}`);
      }
    })());
  }
});