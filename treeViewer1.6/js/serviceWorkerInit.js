// ===== NOUVEAU : Logique de mise à jour PWA =====

/**
 * Affiche un popup pour informer l'utilisateur qu'une nouvelle version est disponible.
 * @param {ServiceWorkerRegistration} registration - L'objet d'enregistrement du Service Worker.
 */
function showUpdatePopup(registration) {
    if (document.getElementById('sw-update-popup')) return; // Éviter les doublons
    // Créer le conteneur du popup
    const popup = document.createElement('div');
    popup.id = 'sw-update-popup';
    // Styles pour la visibilité et le positionnement
    Object.assign(popup.style, {
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#2c3e50', // Bleu nuit
        color: 'white',
        padding: '15px 20px',
        borderRadius: '8px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.4)',
        zIndex: '10001', // Au-dessus de tout
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        fontFamily: 'sans-serif',
        opacity: '0',
        transition: 'opacity 0.5s ease'
    });

    // Contenu HTML du popup avec traductions
    popup.innerHTML = `
        <span style="font-size: 15px;">${window.i18n.getMultilingueText('newVersionAvailable')}</span>
        <button id="sw-update-accept" style="background-color: #27ae60; color: white; border: none; padding: 8px 14px; border-radius: 5px; cursor: pointer; font-weight: bold;">${window.i18n.getMultilingueText('updateNow')}</button>
        <button id="sw-update-decline" style="background: none; border: none; color: #bdc3c7; cursor: pointer; font-size: 24px; line-height: 1;">&times;</button>
    `;

    document.body.appendChild(popup);

    // Afficher avec une transition
    setTimeout(() => popup.style.opacity = '1', 100);

    // Gérer le clic sur "Mettre à jour"
    document.getElementById('sw-update-accept').addEventListener('click', () => {
        console.log('Mise à jour acceptée par l\'utilisateur.');
        const waitingWorker = registration.waiting;
        if (waitingWorker) {
            // 1. Changer le texte du bouton pour feedback
            const btn = document.getElementById('sw-update-accept');
            btn.textContent = "Téléchargement...";
            btn.disabled = true;

            // 2. Écouter la fin du téléchargement
            const onDownloadComplete = (event) => {
                if (event.data && event.data.type === 'DOWNLOAD_COMPLETE') {
                    console.log("✅ Téléchargement terminé, demande d'activation...");
                    navigator.serviceWorker.removeEventListener('message', onDownloadComplete);
                    
                    // 3. Activer le nouveau SW
                    if (registration.waiting) {
                        registration.waiting.postMessage({ action: 'skipWaiting' });
                    }
                    // Le reload se fera via l'événement 'controllerchange' plus bas
                }
            };
            navigator.serviceWorker.addEventListener('message', onDownloadComplete);

            // 4. Lancer le téléchargement
            waitingWorker.postMessage({ action: 'downloadResources' });
        }
    });

    // Gérer le clic sur "Fermer"
    document.getElementById('sw-update-decline').addEventListener('click', () => {
        console.log('Mise à jour refusée par l\'utilisateur.');
        popup.remove();
    });
}

// ===== FIN : Logique de mise à jour PWA =====

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

                // Vérifier si un Service Worker est déjà en attente (cas où on a ignoré le popup et rechargé la page)
                if (registration.waiting) {
                    console.log('Service Worker en attente détecté au démarrage.');
                    showUpdatePopup(registration);
                }

                // --- NOUVELLE LOGIQUE DE MISE À JOUR ---
                registration.addEventListener('updatefound', () => {
                    console.log('Nouvelle version du Service Worker trouvée, installation en cours...');
                    const newWorker = registration.installing;

                    newWorker.addEventListener('statechange', () => {
                        // Si le nouveau worker est installé, il est maintenant en attente (waiting)
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('Nouveau Service Worker installé et en attente.');
                            showUpdatePopup(registration);
                        }
                    });
                });
                
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
                        
                        // // Écouter les changements d'état
                        // navigator.serviceWorker.addEventListener('controllerchange', function() {
                        //     console.log('ServiceWorker a pris le contrôle, rechargement de la page');
                        //     // Recharger la page pour s'assurer que le SW la contrôle
                        //     window.location.reload();
                        // });
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

    // --- NOUVEAU : Écouteur pour le rechargement automatique ---
    let refreshing;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        console.log('Nouveau Service Worker activé, rechargement de la page...');
        window.location.reload();
        refreshing = true;
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
//         const message = window.i18n ? window.i18n.getMultilingueText('noServerDetected') : 
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
window.SWUpdate = async function() {
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
            message = window.i18n ? window.i18n.getMultilingueText('noServerDetected') : 
                '⚠️ ATTENTION ⚠️\n\nAucun serveur local n\'a été détecté.\n\nPour le développement, veuillez utiliser VS Code avec Live Server.';
        } else if (environment.type === 'production-web') {
            message = window.i18n ? window.i18n.getMultilingueText('noServerDetected2') : 
                '⚠️ ATTENTION ⚠️\n\nPas de connexion Internet détectée.\n\nLa mise à jour nécessite une connexion pour télécharger les nouvelles ressources depuis GitHub.';
        } else {
            message = window.i18n ? window.i18n.getMultilingueText('noServerDetected3') :
                '⚠️ ATTENTION ⚠️\n\nLa mise à jour du logiciel n\'est pas possible dans cet environnement.';
        }
        
        window.alert(message);
        
        // Fermer la modal si elle est ouverte
        const modal = document.getElementById('advanced-settings-modal');
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



// ===== MODULE iOS INSTALLATION =====
// Chargement dynamique et gestion de l'installation sur iOS

// Détection des capacités de l'appareil
const iOSCapabilities = {
    isIOS: () => /iPad|iPhone|iPod/.test(navigator.userAgent),
    isSafari: () => /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
    isStandalone: () => window.navigator.standalone === true || 
                       window.matchMedia('(display-mode: standalone)').matches,
    shouldShowGuide: () => {
        const lastDismissed = localStorage.getItem('ios-install-dismissed');
        const daysSinceRefusal = lastDismissed ? 
            (Date.now() - parseInt(lastDismissed)) / (1000 * 60 * 60 * 24) : 999;
        
        return iOSCapabilities.isIOS() && 
               !iOSCapabilities.isStandalone() && 
               daysSinceRefusal > 7; // Réafficher après 7 jours
    }
};

// Chargeur de composant iOS
class IOSInstallationManager {
    constructor() {
        this.componentLoaded = false;
        this.componentUrl = './ios-install.html';
    }

    async loadComponent() {
        if (this.componentLoaded) {
            console.log('Composant iOS déjà chargé');
            return true;
        }

        try {
            console.log('🔄 Chargement du composant iOS...');
            
            const response = await fetch(this.componentUrl, {
                cache: 'no-cache' // S'assurer d'avoir la dernière version
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const htmlContent = await response.text();
            
            // Parser le contenu HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            
            // Extraire et injecter les styles
            const styles = doc.querySelectorAll('style');
            styles.forEach(style => {
                document.head.appendChild(style.cloneNode(true));
            });
            
            // Extraire et injecter les éléments du body
            const banner = doc.querySelector('#ios-install-banner');
            const modal = doc.querySelector('#ios-instructions-modal');
            
            if (banner) {
                document.body.appendChild(banner.cloneNode(true));
                console.log('✅ Banner iOS injecté');
            }
            
            if (modal) {
                document.body.appendChild(modal.cloneNode(true));
                console.log('✅ Modal iOS injectée');
            }
            
            // Extraire et exécuter les scripts
            const scripts = doc.querySelectorAll('script');
            scripts.forEach(script => {
                const newScript = document.createElement('script');
                if (script.src) {
                    newScript.src = script.src;
                } else {
                    newScript.textContent = script.textContent;
                }
                document.head.appendChild(newScript);
            });
            
            // Appliquer les traductions du système i18n principal
            setTimeout(() => {
                if (window.i18n && typeof window.i18n.updateUI === 'function') {
                    console.log('Applying i18n translations to iOS component...');
                    window.i18n.updateUI();
                    console.log('Traductions iOS appliquées');
                }
                
                // Forcer l'application sur les éléments iOS spécifiquement
                document.querySelectorAll('#ios-install-banner [data-text-key], #ios-instructions-modal [data-text-key]').forEach(element => {
                    const key = element.getAttribute('data-text-key');
                    const translation = window.i18n ? window.i18n.getMultilingueText(key) : element.textContent;
                    
                    if (element.tagName === 'INPUT') {
                        element.placeholder = translation;
                    } else if (key === 'iosInstallInstruction' || key.startsWith('iosStep')) {
                        element.innerHTML = translation;
                    } else {
                        element.textContent = translation;
                    }
                });
            }, 200);
            
            this.componentLoaded = true;
            console.log('🎉 Composant iOS chargé avec succès');
            return true;
            
        } catch (error) {
            console.error('❌ Erreur lors du chargement du composant iOS:', error);
            return false;
        }
    }

    showInstallationGuide() {
        const banner = document.getElementById('ios-install-banner');
        if (banner) {
            banner.classList.add('show');
            console.log('📱 Guide d\'installation iOS affiché');
            
            // Masquer automatiquement après 12 secondes
            setTimeout(() => {
                if (banner.classList.contains('show')) {
                    banner.classList.remove('show');
                    console.log('⏰ Banner iOS masqué automatiquement');
                }
            }, 12000);
        } else {
            console.warn('⚠️ Banner iOS non trouvé dans le DOM');
        }
    }

    async initialize() {
        // Vérifier si on doit afficher le guide
        if (!iOSCapabilities.shouldShowGuide()) {
            console.log('📱 iOS non détecté,  guide non nécessaire');
            return false;
        }

        console.log('🍎 iOS détecté - Initialisation du guide d\'installation');
        
        // Charger le composant
        const loaded = await this.loadComponent();
        
        if (loaded) {
            // Afficher le guide après un délai
            setTimeout(() => {
                this.showInstallationGuide();
            }, 3000); // 3 secondes après le chargement
            
            return true;
        } else {
            console.error('❌ Impossible de charger le composant iOS');
            return false;
        }
    }
}

// Instance globale du gestionnaire iOS
const iosManager = new IOSInstallationManager();

// Fonction d'initialisation à appeler depuis votre code existant
window.initializeIOSInstallation = async function() {
    return await iosManager.initialize();
};

// Fonctions utilitaires pour le debugging
window.iOSDebug = {
    capabilities: iOSCapabilities,
    manager: iosManager,
    forceShow: () => iosManager.showInstallationGuide(),
    reload: async () => {
        iosManager.componentLoaded = false;
        return await iosManager.initialize();
    }
};

// Auto-initialisation si iOS détecté
if (iOSCapabilities.isIOS()) {
    console.log('🍎 Appareil iOS détecté - Module d\'installation prêt');
}