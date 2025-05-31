// 6 cas d'utilisation pour le service worker:
// 1- mode de test/developpement sur PC windows avec VS code et test avec Live Server
// 2- mode opérationnel sur PC avec le lien gitHub
// 3- mode opérationnel sur mobile avec le lien gitHub
// 4- mode opérationnel sur PC à partir de l'appli installée
// 5- mode opérationnel sur mobile Android à partir de l'appli installée
// 6- sur mobile IOS on ne peut pas installer l'appli

// Pour chacun des 6 cas il faut aussi considérer le mode connecté et le mode hors ligne

// Pour la mise à jour à jour du logiciel, avant de vider le cache, il faut être sûr de 2 choses:
//  - mode connecté
//  - serveur web disponible
//  - si ces 2 conditions ne sont pas réunies il faut interdire la mise à jour du logiciel





// js/serviceWorkerInit.js - Code déplacé depuis le HTML
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Ajouter un délai pour s'assurer que la page est complètement chargée
        setTimeout(() => {
            navigator.serviceWorker.register('./service-worker.js', {
                scope: './' // Spécifier explicitement le scope
            }).then(function(registration) {
                console.log('ServiceWorker enregistré avec succès sur scope: ', registration.scope);
                
                // Vérifier si le service worker contrôle déjà la page
                if (!navigator.serviceWorker.controller) {
                    console.log('ServiceWorker est enregistré mais ne contrôle pas encore la page');
                    
                    // Sur Chrome mobile, parfois il faut un rechargement
                    if (navigator.userAgent.includes('Android') || navigator.userAgent.includes('Mobile')) {
                        console.log('Appareil mobile détecté, tentative de prise de contrôle');
                        
                        // Activer le service worker s'il est en attente
                        if (registration.waiting) {
                            registration.waiting.postMessage({action: 'skipWaiting'});
                        }
                        
                        // Essayer de forcer la prise de contrôle
                        if (registration.active) {
                            registration.active.postMessage({action: 'claimClients'});
                        }
                        
                        // Écouter les changements d'état
                        navigator.serviceWorker.addEventListener('controllerchange', function() {
                            console.log('ServiceWorker a pris le contrôle, rechargement de la page');
                            // Recharger la page pour s'assurer que le SW la contrôle
                            window.location.reload();
                        });
                    }
                } else {
                    console.log('ServiceWorker contrôle déjà cette page');
                }
                
                // Mettre à jour le service worker si une nouvelle version est disponible
                registration.update().then(() => {
                    console.log('Vérification des mises à jour du SW effectuée');
                });
            }).catch(function(error) {
                console.error('Échec d\'enregistrement du ServiceWorker:', error);
                
                // Tentative d'enregistrement avec une approche différente sur mobile
                if (navigator.userAgent.includes('Android') || navigator.userAgent.includes('Mobile')) {
                    console.log('Tentative alternative d\'enregistrement sur mobile');
                    
                    // Attendre un peu plus longtemps et réessayer
                    setTimeout(() => {
                        navigator.serviceWorker.register('./service-worker.js')
                        .then(reg => console.log('Enregistrement alternatif réussi:', reg.scope))
                        .catch(err => console.error('Échec définitif:', err));
                    }, 3000);
                }
            });
        }, 1000); // Délai d'1 seconde avant d'essayer d'enregistrer le SW
    });
    
    // Écouter les messages du service worker
    navigator.serviceWorker.addEventListener('message', function(event) {
        console.log('Message reçu du ServiceWorker:', event.data);
        
        // Traiter les messages spécifiques
        if (event.data && event.data.action === 'reload') {
            console.log('Rechargement demandé par le ServiceWorker');
            window.location.reload();
        }
    });
}




// Fonction pour détecter l'environnement d'exécution
function detectEnvironment() {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const port = window.location.port;
    
    // Cas 1: Développement local avec Live Server
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('192.168.')) {
        return {
            type: 'development',
            description: 'Développement local (VS Code Live Server)',
            requiresLocalServer: true
        };
    }
    
    // Cas 2: GitHub Pages ou autre hébergement web
    if (hostname.includes('github.io') || 
        hostname.includes('githubusercontent.com') ||
        (protocol === 'https:' && !hostname.includes('localhost'))) {
        return {
            type: 'production-web',
            description: 'Production web (GitHub Pages ou similaire)',
            requiresLocalServer: false
        };
    }
    
    // Cas 4 & 5: Application installée (PWA)
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
        return {
            type: 'pwa-installed',
            description: 'Application installée (PWA)',
            requiresLocalServer: false
        };
    }
    
    // Cas par défaut - probablement ouverture de fichier local
    return {
        type: 'file-local',
        description: 'Fichier local (file://)',
        requiresLocalServer: true
    };
}


// Fonction pour tester si un serveur web est disponible
async function isServerAvailable() {
    try {
        // Tentative de récupération d'un fichier avec un paramètre aléatoire pour éviter le cache
        const testUrl = `./?test=${Date.now()}`;
        const response = await fetch(testUrl, {
            method: 'HEAD', // Utiliser HEAD pour minimiser le trafic
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache'
            },
            // Court timeout pour ne pas bloquer trop longtemps
            signal: AbortSignal.timeout(2000)
        });
        
        // Si la réponse est OK, un serveur est disponible
        return response.ok;
    } catch (error) {
        console.log('Aucun serveur détecté:', error);
        return false;
    }
}


// Exposer une fonction pour forcer le nettoyage du cache
// window.clearAppCache = async function() {

//     console.log('🔍 Vérification de l\'environnement...');
    
//     // Vérifier si un serveur est disponible (VS Code Live Server ou autre)
//     const hasServer = await isServerAvailable();
//     console.log('Serveur détecté:', hasServer ? 'OUI ✅' : 'NON ❌');
    
//     // Vérifier si on est sur mobile (Android fonctionne même sans serveur)
//     const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Macintosh|Mac OS/i.test(navigator.userAgent);
//     console.log('Appareil mobile:', isMobile ? 'OUI ✅' : 'NON ❌');
    

//     // const textMessage = `debug Appareil mobile: ${isMobile}`;
//     // console.log(textMessage);

//     // if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
//     //         navigator.serviceWorker.controller.postMessage({
//     //         action: textMessage
//     //     });
//     // }


//     // Si on est sur PC sans serveur, bloquer complètement le vidage du cache
//     if (!hasServer && !isMobile) {
//     // if (true) {
//         console.warn('⚠️ Attention: Tentative de vidage du cache sans serveur disponible - BLOQUÉE');
        
//         // Utiliser la traduction appropriée via i18n
//         const message = window.i18n ? window.i18n.getText('noServerDetected') : 
//             '⚠️ ATTENTION ⚠️\n\nAucun serveur n\'a été détecté. La mise à jour du logiciel est impossible.\n\nCette opération nécessite VS Code avec Live Server. ou vous ';
        
//         // const isMobile2 = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Macintosh|Mac OS/i.test(navigator.userAgent);

//         // const message = `⚠️ ATTENTION ⚠️\n\nAucun serveur n\'a été détecté. La mise à jour du logiciel est impossible.\n\nCette opération nécessite VS Code avec Live Server. isMobile: ${isMobile2},   DEBUG********* ${ navigator.userAgent}`;
        

//         // Afficher l'alerte avec le message traduit
//         window.alert(message);
        
//         console.log('Opération bloquée: pas de serveur disponible sur PC');
        
//         // Fermer la modal si elle est ouverte
//         const modal = document.getElementById('gedcom-modal');
//         if (modal && modal.style.display === 'block') {
//             closeGedcomModal(); // Utiliser votre fonction existante pour fermer la modal
//         }
        
//         return false;
//     }


//     console.log('🔍 Vérification de la connexion avant vidage de cache...');
    
//     // Tester la vraie connectivité
//     const isConnected = await testRealConnectivity();
    
//     if (!isConnected) {
//         console.warn('❌ Pas de connexion Internet - vidage de cache bloqué');
//         alert('⚠️ Impossible de vider le cache en mode hors ligne.\n\nVeuillez vous reconnecter à Internet avant de vider le cache.\n\n(Un téléchargement des nouvelles ressources est nécessaire)');
//         return false;
//     }
    
//     console.log('🌐 Connexion Internet confirmée - procédure de vidage autorisée');
    
//     if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
//         console.log('Envoi de la demande de vidage du cache au ServiceWorker');
        
//         // Écouter la réponse du Service Worker
//         navigator.serviceWorker.addEventListener('message', function onMessage(event) {
//             if (event.data && event.data.action === 'cacheCleared') {
//                 console.log('🔥 Cache vidé, rechargement...');
                
//                 // Supprimer l'écouteur
//                 navigator.serviceWorker.removeEventListener('message', onMessage);
                
//                 // Recharger la page
//                 setTimeout(() => {
//                     window.location.reload();
//                 }, 1000);
//             }
//         });
        
//         navigator.serviceWorker.controller.postMessage({
//             action: 'clearCache'
//         });
//         return true;
//     } else {
//         console.warn('Pas de ServiceWorker actif pour vider le cache');
//         return false;
//     }
// };







// Fonction principale pour vider le cache
window.clearAppCache = async function() {
    console.log('🔍 Vérification de l\'environnement...');
    
    // Détecter l'environnement d'exécution
    const environment = detectEnvironment();
    console.log(`Environnement détecté: ${environment.type} - ${environment.description}`);
    
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Macintosh|Mac OS/i.test(navigator.userAgent);
    console.log('Appareil mobile:', isMobile ? 'OUI ✅' : 'NON ❌');
    
    // Logique différente selon l'environnement
    let canUpdate = false;
    let blockingReason = '';
    
    switch (environment.type) {
        case 'development':
            // Cas 1: Développement local - nécessite un serveur local
            const hasLocalServer = await isServerAvailable();
            console.log('Serveur local détecté:', hasLocalServer ? 'OUI ✅' : 'NON ❌');
            
            if (!hasLocalServer) {
                blockingReason = 'Développement local sans serveur (VS Code Live Server requis)';
                canUpdate = false;
            } else {
                canUpdate = true;
            }
            break;
            
        case 'production-web':
            // Cas 2: GitHub Pages - nécessite une connexion Internet
            const hasInternet = await testRealConnectivity();
            console.log('Connexion Internet:', hasInternet ? 'OUI ✅' : 'NON ❌');
            
            if (!hasInternet) {
                blockingReason = 'Pas de connexion Internet pour GitHub Pages';
                canUpdate = false;
            } else {
                canUpdate = true;
            }
            break;
            
        case 'pwa-installed':
            // Cas 4 & 5: PWA installée - vérifier la connectivité
            const hasConnection = await testRealConnectivity();
            console.log('Connexion pour PWA:', hasConnection ? 'OUI ✅' : 'NON ❌');
            
            if (!hasConnection) {
                blockingReason = 'Pas de connexion Internet pour l\'application installée';
                canUpdate = false;
            } else {
                canUpdate = true;
            }
            break;
            
        case 'file-local':
            // Ouverture directe de fichier - toujours bloquer sauf sur mobile
            if (isMobile) {
                canUpdate = true; // Les mobiles peuvent fonctionner différemment
            } else {
                blockingReason = 'Fichier ouvert localement sans serveur';
                canUpdate = false;
            }
            break;
    }
    
    // Si la mise à jour est bloquée, afficher un message approprié
    if (!canUpdate) {
        console.warn(`⚠️ Mise à jour bloquée: ${blockingReason}`);
        
        let message;
        if (environment.type === 'development') {
            message = window.i18n ? window.i18n.getText('noServerDetected') : 
                '⚠️ ATTENTION ⚠️\n\nAucun serveur local n\'a été détecté.\n\nPour le développement, veuillez utiliser VS Code avec Live Server.';
        } else if (environment.type === 'production-web') {
            message = window.i18n ? window.i18n.getText('noServerDetected2') : 
                '⚠️ ATTENTION ⚠️\n\nPas de connexion Internet détectée.\n\nLa mise à jour nécessite une connexion pour télécharger les nouvelles ressources depuis GitHub.';
        } else {
            message = window.i18n ? window.i18n.getText('noServerDetected3') :
                '⚠️ ATTENTION ⚠️\n\nLa mise à jour du logiciel n\'est pas possible dans cet environnement.';
        }
        
        window.alert(message);
        
        // Fermer la modal si elle est ouverte
        const modal = document.getElementById('gedcom-modal');
        if (modal && modal.style.display === 'block') {
            closeGedcomModal();
        }
        
        return false;
    }
    
    console.log('✅ Conditions remplies - procédure de vidage autorisée');
    
    // Procéder au vidage du cache
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        console.log('Envoi de la demande de vidage du cache au ServiceWorker');
        
        // Écouter la réponse du Service Worker
        navigator.serviceWorker.addEventListener('message', function onMessage(event) {
            if (event.data && event.data.action === 'cacheCleared') {
                console.log('🔥 Cache vidé, rechargement...');
                
                // Supprimer l'écouteur
                navigator.serviceWorker.removeEventListener('message', onMessage);
                
                // Recharger la page
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
        });
        
        navigator.serviceWorker.controller.postMessage({
            action: 'clearCache'
        });
        return true;
    } else {
        console.warn('Pas de ServiceWorker actif pour vider le cache');
        return false;
    }
};