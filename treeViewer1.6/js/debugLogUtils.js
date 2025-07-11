/**
 * debugLogUtils.js - Module de débogage unifié pour souris et tactile
 * Fournit un panneau de débogage entièrement fonctionnel et propre
 */

import { state } from './main.js';

import { verifyResourceCache } from './resourcePreloader.js';



/**
 * Gère l'affichage du panneau de débogage (ouverture/fermeture)
 * @param {boolean} show - True pour afficher, false pour masquer
 */
 function toggleDebugPanel(show) {
    // Récupérer le panneau existant
    let panel = document.getElementById('debug-panel');
    
    // Si le panneau n'existe pas et qu'on veut l'afficher, le créer
    if (!panel && show) {
        createDebugPanel();
        return;
    }
    
    // Si le panneau existe, changer sa visibilité
    if (panel) {
        panel.style.display = show ? 'block' : 'none';
    }
}


// Exposer la fonction pour qu'elle soit accessible globalement
window.activateDebugLogs = activateDebugLogs;



/**
 * Crée et configure le panneau de débogage
 * @returns {HTMLElement} Le panneau créé
 */
function createDebugPanel() {
    // Ne créer le panneau qu'une seule fois
    if (document.getElementById('debug-panel')) {
        return document.getElementById('debug-panel');
    }
    
    // 1. Créer le panneau principal
    const panel = document.createElement('div');
    panel.id = 'debug-panel';
    
    // Styles de base du panneau
    Object.assign(panel.style, {
        position: 'fixed',
        top: '10px',
        right: '10px',
        width: '80%',
        maxHeight: '70%',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontFamily: 'monospace',
        fontSize: '12px',
        zIndex: '9999',
        boxShadow: '0 0 10px rgba(0,0,0,0.5)',
        resize: 'both',
        overflow: 'auto'
    });
    
    // 2. Créer la barre d'en-tête pour le déplacement
    const header = document.createElement('div');
    Object.assign(header.style, {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#333',
        padding: '5px',
        marginBottom: '10px',
        borderRadius: '3px',
        cursor: 'move'
    });
    
    // 3. Ajouter le titre
    const title = document.createElement('div');
    title.textContent = 'Debug Cache et Bibliothèques';
    title.style.fontWeight = 'bold';
    
    // 4. Créer le conteneur de boutons (horizontal)
    const buttonContainer = document.createElement('div');
    Object.assign(buttonContainer.style, {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    });
    
    // 5. Créer les boutons de contrôle
    // Bouton de déplacement
    const moveButton = createButton('⇄', '#555');
    
    // Bouton de réduction
    const toggleButton = createButton('−', '#555');
    
    // Bouton de fermeture
    const closeButton = createButton('×', '#F44336');
    
    // 6. Ajouter les boutons au conteneur (dans l'ordre)
    buttonContainer.appendChild(moveButton);
    buttonContainer.appendChild(toggleButton);
    buttonContainer.appendChild(closeButton);
    
    // 7. Ajouter le titre et les boutons à l'en-tête
    header.appendChild(title);
    header.appendChild(buttonContainer);
    
    // 8. Créer le conteneur de contenu (pour pouvoir le masquer/afficher)
    const content = document.createElement('div');
    content.id = 'debug-panel-content';
    
    // 9. Créer la barre de boutons d'action
    const actionBar = document.createElement('div');
    Object.assign(actionBar.style, {
        display: 'flex',
        flexDirection: 'row',
        gap: '5px',
        marginBottom: '10px',
        flexWrap: 'wrap'
    });
    
    // 10. Créer les boutons d'action
    const clearButton = createButton('Effacer logs', '#F44336', true);
    const checkLibsButton = createButton('Vérifier bibliothèques', '#4CAF50', true);
    const checkCacheButton = createButton('Vérifier cache', '#2196F3', true);
    const checkResourcesButton = createButton('Vérifier ressources', '#FF9800', true);




    // 11. Ajouter les boutons à la barre d'action
    actionBar.appendChild(clearButton);
    actionBar.appendChild(checkLibsButton);
    actionBar.appendChild(checkCacheButton);
    actionBar.appendChild(checkResourcesButton);


    // Ajouter le bouton de vérification du service worker
    addServiceWorkerDebugButton(actionBar);


    
    // 12. Créer le conteneur de messages
    const messagesContainer = document.createElement('div');
    messagesContainer.id = 'debug-messages';
    messagesContainer.style.overflowY = 'auto';
    
    // 13. Assembler tous les éléments
    content.appendChild(actionBar);
    content.appendChild(messagesContainer);
    panel.appendChild(header);
    panel.appendChild(content);
    
    // 14. Ajouter au document
    document.body.appendChild(panel);
    
    // 15. Ajouter les fonctionnalités interactives
    
    // Déplacement (souris et tactile)
    makeElementDraggable(panel, header);
    
    // Redimensionnement tactile
    addResizeHandle(panel);
    
    // Fonctionnalités des boutons
    
    // Déplacer le panneau (droite/gauche)
    let isOnRight = true;
    const togglePosition = () => {
        isOnRight = !isOnRight;
        if (isOnRight) {
            panel.style.right = '10px';
            panel.style.left = 'auto';
        } else {
            panel.style.left = '10px';
            panel.style.right = 'auto';
        }
    };
    
    // Réduire/étendre le panneau
    let isCollapsed = false;
    const toggleCollapse = () => {
        isCollapsed = !isCollapsed;
        content.style.display = isCollapsed ? 'none' : 'block';
        toggleButton.textContent = isCollapsed ? '+' : '−';
        panel.style.height = isCollapsed ? 'auto' : '50%';
        panel.style.resize = isCollapsed ? 'none' : 'both';
    };
    
    // Fermer le panneau
    const closePanel = () => {
        // panel.style.display = 'none';
        toggleDebugPanel(false);
    };
    
    // Effacer les logs
    const clearLogs = () => {
        messagesContainer.innerHTML = '';
    };
    
    // Associer les fonctions aux boutons (souris et tactile)
    addButtonListeners(moveButton, togglePosition);
    addButtonListeners(toggleButton, toggleCollapse);
    addButtonListeners(closeButton, closePanel);
    addButtonListeners(clearButton, clearLogs);
    addButtonListeners(checkLibsButton, checkLibraries);
    addButtonListeners(checkCacheButton, checkCache);
    addButtonListeners(checkResourcesButton, verifyResourceCache);
    
    return panel;
}

/**
 * Crée un bouton stylisé
 * @param {string} text - Texte du bouton
 * @param {string} bgColor - Couleur de fond
 * @param {boolean} isTextButton - True si c'est un bouton avec texte
 * @returns {HTMLButtonElement} Bouton créé
 */
function createButton(text, bgColor, isTextButton = false) {
    const button = document.createElement('button');
    button.textContent = text;
    
    // Styles communs
    Object.assign(button.style, {
        backgroundColor: bgColor,
        color: 'white',
        border: 'none',
        borderRadius: '3px',
        cursor: 'pointer',
        margin: '0 2px'
    });
    
    // Styles spécifiques selon le type de bouton
    if (isTextButton) {
        // Bouton avec texte
        Object.assign(button.style, {
            padding: '5px 10px',
            fontSize: '12px'
        });
    } else {
        // Bouton icône (pour contrôles)
        Object.assign(button.style, {
            width: '24px',
            height: '24px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        });
    }
    
    return button;
}

/**
 * Ajoute des écouteurs d'événements (souris et tactile) à un bouton
 * @param {HTMLButtonElement} button - Le bouton
 * @param {Function} action - La fonction à exécuter
 */
function addButtonListeners(button, action) {
    // Événement de clic (souris)
    button.addEventListener('click', (e) => {
        e.preventDefault();
        action();
    });
    
    // Événement tactile
    button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        action();
    }, { passive: false });
}

/**
 * Rend un élément déplaçable (souris et tactile)
 * @param {HTMLElement} element - L'élément à rendre déplaçable
 * @param {HTMLElement} handle - L'élément qui sert de poignée
 */
function makeElementDraggable(element, handle) {
    // Variables pour le déplacement
    let startX, startY, initialLeft, initialTop;
    
    // === SUPPORT TACTILE ===
    handle.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1) return;
        e.preventDefault();
        
        // Initialiser les positions
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        initialLeft = element.offsetLeft;
        initialTop = element.offsetTop;
        
        // Forcer le positionnement left/top
        element.style.right = 'auto';
    }, { passive: false });
    
    document.addEventListener('touchmove', (e) => {
        if (e.touches.length !== 1) return;
        
        // Vérifier si nous sommes en train de déplacer cet élément
        if (startX === undefined || startY === undefined) return;
        
        e.preventDefault();
        
        // Calculer le déplacement
        const deltaX = e.touches[0].clientX - startX;
        const deltaY = e.touches[0].clientY - startY;
        
        // Appliquer le déplacement
        element.style.left = (initialLeft + deltaX) + 'px';
        element.style.top = (initialTop + deltaY) + 'px';
    }, { passive: false });
    
    document.addEventListener('touchend', () => {
        // Réinitialiser les positions
        startX = undefined;
        startY = undefined;
    });
    
    // === SUPPORT SOURIS ===
    handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        
        // Initialiser les positions
        startX = e.clientX;
        startY = e.clientY;
        initialLeft = element.offsetLeft;
        initialTop = element.offsetTop;
        
        // Forcer le positionnement left/top
        element.style.right = 'auto';
        
        // Ajouter les écouteurs temporaires
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
    
    function onMouseMove(e) {
        e.preventDefault();
        
        // Calculer le déplacement
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        // Appliquer le déplacement
        element.style.left = (initialLeft + deltaX) + 'px';
        element.style.top = (initialTop + deltaY) + 'px';
    }
    
    function onMouseUp() {
        // Supprimer les écouteurs temporaires
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
}

/**
 * Ajoute une poignée de redimensionnement tactile à un élément
 * @param {HTMLElement} element - L'élément à rendre redimensionnable
 */
function addResizeHandle(element) {
    // Créer la poignée
    const handle = document.createElement('div');
    handle.className = 'debug-panel-resize-handle';
    
    // Styles de la poignée
    Object.assign(handle.style, {
        position: 'absolute',
        right: '0',
        bottom: '0',
        width: '20px',
        height: '20px',
        cursor: 'nwse-resize',
        background: 'linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.5) 50%)',
        zIndex: '10000'
    });
    
    // Variables pour le redimensionnement
    let startX, startY, startWidth, startHeight;
    
    // === SUPPORT TACTILE ===
    handle.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1) return;
        e.preventDefault();
        
        // Initialiser les dimensions
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startWidth = element.offsetWidth;
        startHeight = element.offsetHeight;
    }, { passive: false });
    
    document.addEventListener('touchmove', (e) => {
        if (e.touches.length !== 1 || startX === undefined) return;
        e.preventDefault();
        
        // Calculer les nouvelles dimensions
        const width = startWidth + (e.touches[0].clientX - startX);
        const height = startHeight + (e.touches[0].clientY - startY);
        
        // Appliquer avec limites min
        element.style.width = Math.max(200, width) + 'px';
        element.style.height = Math.max(100, height) + 'px';
    }, { passive: false });
    
    document.addEventListener('touchend', () => {
        // Réinitialiser
        startX = undefined;
    });
    
    // === SUPPORT SOURIS ===
    handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        
        // Initialiser les dimensions
        startX = e.clientX;
        startY = e.clientY;
        startWidth = element.offsetWidth;
        startHeight = element.offsetHeight;
        
        // Ajouter les écouteurs temporaires
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
    
    function onMouseMove(e) {
        e.preventDefault();
        
        // Calculer les nouvelles dimensions
        const width = startWidth + (e.clientX - startX);
        const height = startHeight + (e.clientY - startY);
        
        // Appliquer avec limites min
        element.style.width = Math.max(200, width) + 'px';
        element.style.height = Math.max(100, height) + 'px';
    }
    
    function onMouseUp() {
        // Supprimer les écouteurs temporaires
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
    
    // Ajouter la poignée à l'élément
    element.appendChild(handle);
}

/**
 * Ajoute un message au panneau de débogage
 * @param {string} message - Message à afficher
 * @param {string} type - Type de message ('info', 'error', 'warning', 'success')
 */
export function debugLog(message, type = 'info') {
    if (!state.isDebugLog) {
        console.log(message);
        return;
    }
    
    // S'assurer que le panneau existe
    const panel = createDebugPanel();
    
    // Référence au conteneur de messages
    const messagesContainer = document.getElementById('debug-messages');
    
    // Créer un nouvel élément de message
    const messageElement = document.createElement('div');
    
    // Couleur selon le type
    let borderColor = '#2196F3'; // info (bleu)
    if (type === 'error') {
        borderColor = '#F44336'; // rouge
    } else if (type === 'warning') {
        borderColor = '#FF9800'; // orange
    } else if (type === 'success') {
        borderColor = '#4CAF50'; // vert
    }
    
    // Appliquer les styles
    Object.assign(messageElement.style, {
        borderLeft: `3px solid ${borderColor}`,
        padding: '3px 5px',
        marginBottom: '3px',
        wordBreak: 'break-word'
    });
    
    // Ajouter l'horodatage
    const time = new Date().toLocaleTimeString();
    
    // Formater le message
    messageElement.innerHTML = `<span style="color: #aaa; font-size: 10px;">${time}</span> ${message}`;
    
    // Ajouter au conteneur
    messagesContainer.appendChild(messageElement);
    
    // Faire défiler vers le bas
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Aussi envoyer à la console
    if (type === 'error') {
        console.error(message);
    } else if (type === 'warning') {
        console.warn(message);
    } else {
        console.log(message);
    }
}

/**
 * Vérification des bibliothèques JavaScript
 */
function checkLibraries() {
    debugLog("=== VÉRIFICATION DES BIBLIOTHÈQUES ===", 'info');
    
    const libraries = [
        { name: "pako", check: () => typeof pako !== 'undefined' && typeof pako.inflate === 'function' },
        { name: "d3", check: () => typeof d3 !== 'undefined' && typeof d3.select === 'function' },
        { name: "leaflet", check: () => typeof L !== 'undefined' && typeof L.map === 'function' },
        { name: "lodash", check: () => typeof _ !== 'undefined' && typeof _.map === 'function' },
        { name: "react", check: () => typeof React !== 'undefined' && typeof React.createElement === 'function' },
        { name: "reactDOM", check: () => typeof ReactDOM !== 'undefined' && typeof ReactDOM.render === 'function' },
        { name: "d3.layout.cloud", check: () => typeof d3 !== 'undefined' && typeof d3.layout !== 'undefined' && typeof d3.layout.cloud === 'function' }
    ];
    
    debugLog(`Mode: ${navigator.onLine ? 'Connecté' : 'Non connecté'}`);
    
    let allLoaded = true;
    libraries.forEach(lib => {
        try {
            const isLoaded = lib.check();
            const status = isLoaded ? 'CHARGÉE' : 'NON CHARGÉE';
            const type = isLoaded ? 'success' : 'error';
            debugLog(`${lib.name}: ${status}`, type);
            
            if (!isLoaded) {
                allLoaded = false;
            }
        } catch (error) {
            debugLog(`${lib.name}: ERREUR - ${error.message}`, 'error');
            allLoaded = false;
        }
    });
    
    if (allLoaded) {
        debugLog("✅ Toutes les bibliothèques sont chargées correctement!", 'success');
    } else {
        debugLog("❌ Certaines bibliothèques ne sont pas chargées!", 'error');
    }
    
    // Vérifier aussi si le chargeur de bibliothèques est disponible
    if (typeof loadAllResources === 'function') {
        debugLog("Chargeur de bibliothèques (loadAllResources) disponible", 'success');
    } else {
        debugLog("Chargeur de bibliothèques (loadAllResources) NON disponible", 'error');
    }
    
    debugLog("=== FIN VÉRIFICATION DES BIBLIOTHÈQUES ===", 'info');
}

/**
 * Vérifier l'état du Service Worker
 */
async function checkServiceWorker() {
    debugLog("=== VÉRIFICATION DU SERVICE WORKER ===", 'info');
    
    if (!('serviceWorker' in navigator)) {
        debugLog("❌ API Service Worker non supportée par ce navigateur", 'error');
        return;
    }
    
    try {
        const registration = await navigator.serviceWorker.getRegistration();
        
        if (!registration) {
            debugLog("❌ Aucun Service Worker n'est enregistré", 'error');
            return;
        }
        
        // Afficher l'état du service worker
        debugLog(`Service Worker enregistré avec scope: ${registration.scope}`, 'success');
        
        // Vérifier l'état du service worker
        if (registration.installing) {
            debugLog("État: En cours d'installation", 'warning');
        } else if (registration.waiting) {
            debugLog("État: En attente d'activation", 'warning');
        } else if (registration.active) {
            debugLog("État: Actif", 'success');
            
            // Vérifier depuis combien de temps il est actif
            if (registration.active.state) {
                debugLog(`État interne: ${registration.active.state}`, 'info');
            }
        } else {
            debugLog("État: Inconnu", 'warning');
        }
        
        // Vérifier les événements de mise à jour
        registration.addEventListener('updatefound', () => {
            debugLog("Mise à jour du Service Worker détectée", 'info');
        });
        
    } catch (error) {
        debugLog(`Erreur Service Worker: ${error.message}`, 'error');
    }
}

/**
 * Tester l'écriture dans le cache
 */
async function testCacheWriting() {
    try {
        const testCacheName = 'test-cache-' + Date.now();
        debugLog(`Création d'un cache de test: ${testCacheName}`, 'info');
        
        const cache = await caches.open(testCacheName);
        const testUrl = '/test-item-' + Date.now();
        const testResponse = new Response('Test content');
        
        debugLog(`Tentative d'écriture dans le cache...`, 'info');
        await cache.put(testUrl, testResponse);
        
        // Vérifier si l'écriture a fonctionné
        const cachedResponse = await cache.match(testUrl);
        
        if (cachedResponse) {
            const content = await cachedResponse.text();
            debugLog(`✅ Écriture réussie dans le cache! Contenu: "${content}"`, 'success');
        } else {
            debugLog("❌ Échec de l'écriture dans le cache", 'error');
        }
        
        // Supprimer le cache de test
        debugLog(`Suppression du cache de test...`, 'info');
        const deleted = await caches.delete(testCacheName);
        debugLog(`Cache de test ${deleted ? 'supprimé' : 'non supprimé'}`, deleted ? 'success' : 'warning');
        
    } catch (error) {
        debugLog(`❌ Erreur lors du test d'écriture: ${error.message}`, 'error');
    }
}

/**
 * Fonction pour recevoir les logs du service worker
 * A ajouter à debugLogUtils.js près du début du fichier
 */
function setupServiceWorkerLogging() {
    // Écouter les messages du Service Worker
    navigator.serviceWorker.addEventListener('message', (event) => {
        // Traiter les messages de logs du SW
        if (event.data && event.data.type === 'SW_LOG') {
            debugLog(`📱 SW: ${event.data.message}`, 'info');
        } else if (event.data && event.data.type === 'SW_ERROR') {
            debugLog(`⚠️ SW: ${event.data.message}`, 'error');
        } else if (event.data && event.data.action === 'cacheCleared') {
            debugLog(`🗑️ SW: Cache vidé avec succès`, 'success');
        } else if (event.data && event.data.action === 'swVersion') {
            debugLog(`ℹ️ SW: Version ${event.data.version}`, 'info');
        }
    });
    
    debugLog("✅ Écoute des messages du Service Worker activée", 'success');
}

/**
 * Fonction pour demander au service worker sa version
 */
export function checkServiceWorkerVersion() {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            action: 'getSwVersion'
        });
        debugLog("📤 Demande de version envoyée au Service Worker", 'info');
    } else {
        debugLog("❌ Aucun Service Worker actif pour recevoir des messages", 'error');
    }
}

/**
 * Active le panneau de débogage et affiche les informations initiales
 */
export function activateDebugLogs() {
    state.isDebugLog = true;
    

    // Afficher le panneau
    toggleDebugPanel(true);

    // Créer le panneau
    createDebugPanel();
    
    // Mettre en place l'écoute des messages du service worker
    setupServiceWorkerLogging();
    
    // Afficher des informations de base
    debugLog("=== INFORMATIONS SYSTÈME V1.8 ===", 'info');
    debugLog(`User Agent: ${navigator.userAgent}`, 'info');
    debugLog(`En ligne: ${navigator.onLine ? 'Oui' : 'Non'}`, navigator.onLine ? 'success' : 'warning');
    debugLog(`URL: ${window.location.href}`, 'info');
    // const device = detectDeviceType();


    
    // Ajouter les informations sur l'écran
    debugLog(`=== INFORMATIONS ÉCRAN ===`, 'info');
    getScreenInfo().split('\n').forEach(line => {
        debugLog(line.trim(), 'info');
    });
    
    // Vérifier l'état de chargement des bibliothèques
    document.addEventListener('libraries-loaded', () => {
        debugLog("Événement 'libraries-loaded' déclenché", 'success');
        checkLibraries();
    });
    
    // Vérifier le service worker immédiatement
    checkServiceWorkerStatus();
    
    // Vérifier le cache après un court délai
    setTimeout(() => {
        checkCache();
    }, 1000);
}

/**
 * Fonction améliorée pour vérifier l'état du service worker
 * À ajouter à debugLogUtils.js
 */
export function checkServiceWorkerStatus() {
    debugLog("=== VÉRIFICATION DÉTAILLÉE DU SERVICE WORKER ===", 'info');
    
    if (!('serviceWorker' in navigator)) {
        debugLog("❌ API Service Worker non supportée par ce navigateur", 'error');
        return;
    }
    
    // Vérifier si un service worker est enregistré
    navigator.serviceWorker.getRegistration().then(registration => {
        if (!registration) {
            debugLog("❌ Aucun Service Worker n'est enregistré pour cette page", 'error');
            debugLog("Tentative d'enregistrement manuel en cours...", 'info');
            
            // Tenter un enregistrement manuel
            registerServiceWorkerManually();
            return;
        }
        
        debugLog(`✅ Service Worker enregistré`, 'success');
        debugLog(`Scope: ${registration.scope}`, 'info');
        
        // Vérifier l'état
        if (registration.installing) {
            debugLog("État: En cours d'installation", 'warning');
        } else if (registration.waiting) {
            debugLog("État: En attente d'activation (update en attente)", 'warning');
            
            // Option pour activer la mise à jour
            debugLog("Tentative d'activation de la mise à jour...", 'info');
            registration.waiting.postMessage({action: 'skipWaiting'});
        } else if (registration.active) {
            debugLog("État: Actif", 'success');
            
            // Vérifier s'il contrôle la page
            if (navigator.serviceWorker.controller) {
                debugLog("✅ Le Service Worker contrôle cette page", 'success');
                
                // Demander sa version
                checkServiceWorkerVersion();
            } else {
                debugLog("⚠️ Le Service Worker est actif mais ne contrôle PAS cette page!", 'warning');
                debugLog("Tentative de rechargement forcé pour prendre le contrôle...", 'info');
                
                // Sur Chrome mobile, parfois il faut forcer un rechargement
                setTimeout(() => {
                    // Envoyer un message pour tenter de prendre le contrôle
                    registration.active.postMessage({action: 'claimClients'});
                    
                    // Suggérer un rechargement manuel
                    debugLog("Vous devrez peut-être recharger la page manuellement", 'warning');
                }, 1000);
            }
        }
        
        // Vérifier les mises à jour disponibles
        registration.update().then(() => {
            debugLog("Vérification des mises à jour du Service Worker effectuée", 'info');
        }).catch(err => {
            debugLog(`Erreur lors de la vérification des mises à jour: ${err.message}`, 'error');
        });
        
        // Tester si le service worker répond aux messages
        testServiceWorkerCommunication();
    }).catch(err => {
        debugLog(`Erreur lors de la vérification du Service Worker: ${err.message}`, 'error');
    });
}

/**
 * Tente d'enregistrer le service worker manuellement
 */
function registerServiceWorkerManually() {
    navigator.serviceWorker.register('./service-worker.js')
    .then(registration => {
        debugLog(`✅ Service Worker enregistré manuellement avec succès!`, 'success');
        debugLog(`Scope: ${registration.scope}`, 'info');
        
        // Ajouter un délai avant de vérifier à nouveau
        setTimeout(() => {
            debugLog("Nouvelle vérification du Service Worker après enregistrement manuel...", 'info');
            checkServiceWorkerStatus();
        }, 3000);
    })
    .catch(error => {
        debugLog(`❌ Échec de l'enregistrement manuel: ${error.message}`, 'error');
        
        // Informations plus détaillées sur l'erreur
        if (error.name === 'SecurityError') {
            debugLog("Erreur de sécurité: vérifiez HTTPS ou localhost", 'error');
        } else if (error.name === 'NetworkError') {
            debugLog("Erreur réseau: vérifiez votre connexion", 'error');
        }
        
        // Enregistrer sur le scope exact
        debugLog("Tentative avec un scope explicite...", 'info');
        navigator.serviceWorker.register('./service-worker.js', {
            scope: './'
        }).then(reg => {
            debugLog(`✅ Service Worker enregistré avec scope explicite!`, 'success');
        }).catch(err => {
            debugLog(`❌ Échec définitif: ${err.message}`, 'error');
        });
    });
}

/**
 * Teste la communication avec le service worker
 */
function testServiceWorkerCommunication() {
    if (!navigator.serviceWorker.controller) {
        debugLog("❌ Test communication: Pas de Service Worker contrôleur", 'error');
        return;
    }
    
    debugLog("Test de communication avec le Service Worker...", 'info');
    
    // Envoyer un ping
    navigator.serviceWorker.controller.postMessage({
        action: 'ping',
        timestamp: Date.now()
    });
    
    // On attend la réponse dans l'écouteur de message global
    // Définir un timeout
    setTimeout(() => {
        debugLog("⚠️ Aucune réponse du Service Worker après 3 secondes", 'warning');
    }, 3000);
}

/**
 * Fonction pour créer un bouton de vérification du service worker
 * À ajouter à la fonction createDebugPanel
 */
function addServiceWorkerDebugButton(actionBar) {
    const checkSwButton = createButton('Vérifier SW', '#673AB7', true);
    actionBar.appendChild(checkSwButton);
    
    // Associer l'action au bouton
    addButtonListeners(checkSwButton, checkServiceWorkerStatus);
    
    // Ajouter un bouton pour réinstaller le service worker
    const reinstallSwButton = createButton('Réinstaller SW', '#FF5722', true);
    actionBar.appendChild(reinstallSwButton);
    
    // Associer l'action au bouton
    addButtonListeners(reinstallSwButton, () => {
        debugLog("🔄 Tentative de réinstallation du Service Worker...", 'info');
        
        // Désinscrire puis réinscrire
        navigator.serviceWorker.getRegistration().then(registration => {
            if (registration) {
                return registration.unregister().then(success => {
                    if (success) {
                        debugLog("✅ Service Worker désinscrit avec succès", 'success');
                        return true;
                    } else {
                        debugLog("❌ Échec de la désinscription", 'error');
                        return false;
                    }
                });
            } else {
                debugLog("Aucun Service Worker à désinscrire", 'info');
                return true;
            }
        }).then(canRegister => {
            if (canRegister) {
                // Attendre un peu avant de réinscrire
                setTimeout(() => {
                    registerServiceWorkerManually();
                }, 1000);
            }
        }).catch(err => {
            debugLog(`❌ Erreur lors de la réinstallation: ${err.message}`, 'error');
        });
    });
}


/**
 * Fonction améliorée pour vérifier les différents caches de manière séparée et organisée
 * À ajouter à debugLogUtils.js
 */
async function checkAllCaches() {
    debugLog("=== ANALYSE COMPLÈTE DES CACHES ===", 'info');
    debugLog(`Mode: ${navigator.onLine ? 'Connecté' : 'Non connecté'}`, navigator.onLine ? 'success' : 'warning');
    
    // Vérifier si l'API Cache est disponible
    if (!('caches' in window)) {
        debugLog("API Cache non supportée par ce navigateur!", 'error');
        return;
    }
    
    try {
        // Récupérer tous les caches
        const allCacheNames = await caches.keys();
        debugLog(`${allCacheNames.length} caches trouvés: ${allCacheNames.join(", ")}`, 'info');
        
        // Classement des caches par type
        const knownCaches = {
            'app': allCacheNames.find(name => name.includes('treeViewer-app')),
            'tiles': allCacheNames.find(name => name.includes('map-tiles')),
            'resources': allCacheNames.find(name => name.includes('app-resources'))
        };
        
        let otherCaches = allCacheNames.filter(name => 
            !name.includes('treeViewer-app') && 
            !name.includes('map-tiles') && 
            !name.includes('app-resources')
        );
        
        // Analyse globale
        debugLog("=== RÉSUMÉ DES CACHES ===", 'info');
        for (const [type, cacheName] of Object.entries(knownCaches)) {
            if (cacheName) {
                const cache = await caches.open(cacheName);
                const entries = await cache.keys();
                debugLog(`Cache "${type}": ${cacheName} (${entries.length} fichiers)`, 'info');
            } else {
                debugLog(`Cache "${type}": Non trouvé`, 'warning');
            }
        }
        
        if (otherCaches.length > 0) {
            debugLog(`Autres caches: ${otherCaches.join(', ')}`, 'info');
        }
        
        // Analyse du cache d'application (Service Worker)
        if (knownCaches.app) {
            await analyzeCache(knownCaches.app, "APP (SERVICE WORKER)");
        }
        
        // Analyse du cache de tuiles
        if (knownCaches.tiles) {
            await analyzeCache(knownCaches.tiles, "TUILES DE CARTE");
        }
        
        // Analyse du cache de ressources
        if (knownCaches.resources) {
            await analyzeCache(knownCaches.resources, "RESSOURCES IMPORTANTES");
        }
        
        // Recherche des doublons
        debugLog("=== ANALYSE DES DOUBLONS ===", 'info');
        await findDuplicates(allCacheNames);
        
        // Test d'écriture dans le cache
        debugLog("=== TEST D'ÉCRITURE DANS LE CACHE ===", 'info');
        await testCacheWriting();
        
    } catch (error) {
        debugLog(`Erreur lors de l'analyse des caches: ${error.message}`, 'error');
    }
    
    debugLog("=== FIN ANALYSE DES CACHES ===", 'info');
}

/**
 * Analyse détaillée d'un cache spécifique
 */
async function analyzeCache(cacheName, title) {
    debugLog(`=== ANALYSE CACHE ${title} ===`, 'info');
    
    try {
        const cache = await caches.open(cacheName);
        const entries = await cache.keys();
        
        if (entries.length === 0) {
            debugLog("❌ Le cache est VIDE!", 'error');
            return;
        }
        
        // Analyse par type de fichier
        const fileTypes = {};
        
        for (const entry of entries) {
            const url = entry.url;
            const extension = url.split('.').pop().toLowerCase();
            
            if (!fileTypes[extension]) {
                fileTypes[extension] = [];
            }
            
            fileTypes[extension].push(url);
        }
        
        // Afficher le résumé
        debugLog(`Total: ${entries.length} fichiers`, 'info');
        
        for (const [ext, files] of Object.entries(fileTypes)) {
            debugLog(`${ext}: ${files.length} fichiers`, 'info');
        }
        
        // Lister quelques exemples de chaque type
        for (const [ext, files] of Object.entries(fileTypes)) {
            if (files.length > 0) {
                debugLog(`=== FICHIERS .${ext.toUpperCase()} ===`, 'info');
                
                // Limiter à 5 exemples maximum
                const examples = files.slice(0, 5);
                for (const file of examples) {
                    const fileName = file.split('/').pop();
                    debugLog(`✅ ${fileName}`, 'success');
                }
                
                if (files.length > 5) {
                    debugLog(`... et ${files.length - 5} autres fichiers .${ext}`, 'info');
                }
            }
        }
        
        // Vérifier les fichiers critiques
        if (title.includes("RESSOURCES") || title.includes("APP (SERVICE WORKER)")) {
            debugLog("=== VÉRIFICATION DES FICHIERS CRITIQUES ===", 'info');
            
            const criticalFiles = ['arbre.enc', 'arbreX.enc', 'arbreB.enc', 'pako.min.js', 'leaflet.js'];
            
            for (const criticalFile of criticalFiles) {
                const found = entries.some(entry => entry.url.includes(criticalFile));
                debugLog(`${criticalFile}: ${found ? '✅ Présent' : '❌ Absent'}`, found ? 'success' : 'warning');
            }
        }
        
    } catch (error) {
        debugLog(`Erreur lors de l'analyse du cache ${cacheName}: ${error.message}`, 'error');
    }
}




/**
 * Recherche des doublons entre les différents caches - Version corrigée
 */
async function findDuplicates(cacheNames) {
    // Créer un dictionnaire pour stocker tous les fichiers par URL complète
    const fileUrlMap = new Map();
    
    // Collecter tous les fichiers par URL
    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const entries = await cache.keys();
        
        for (const entry of entries) {
            const url = entry.url;
            
            if (!fileUrlMap.has(url)) {
                fileUrlMap.set(url, {
                    count: 0,
                    caches: []
                });
            }
            
            const info = fileUrlMap.get(url);
            info.count++;
            info.caches.push(cacheName);
        }
    }
    
    // Identifier les vrais doublons (même URL complète dans plusieurs caches)
    let hasDuplicates = false;
    let duplicateCount = 0;
    
    for (const [url, info] of fileUrlMap.entries()) {
        if (info.count > 1) {
            hasDuplicates = true;
            duplicateCount++;
            
            // Extraire le nom du fichier pour l'affichage
            const fileName = url.split('/').pop();
            debugLog(`⚠️ "${fileName}" (${url}) présent dans ${info.count} caches: ${info.caches.join(', ')}`, 'warning');
            
            // Limiter l'affichage si trop de doublons
            if (duplicateCount >= 10) {
                debugLog(`... et d'autres doublons (limite d'affichage atteinte)`, 'warning');
                break;
            }
        }
    }
    
    if (!hasDuplicates) {
        debugLog("✅ Aucun doublon détecté entre les caches (URLs identiques)", 'success');
    } else {
        debugLog(`Total: ${duplicateCount} URLs dupliquées entre les caches`, 'warning');
    }
}



/**
 * Remplacer la fonction checkCache existante par celle-ci
 */
async function checkCache() {
    await checkAllCaches();
}


/**
 * Récupère les informations sur l'écran
 * @returns {string} Informations formatées sur l'écran
 */
function getScreenInfo() {
    return `
        Écran: ${window.screen.width}x${window.screen.height}
        Fenêtre: ${window.innerWidth}x${window.innerHeight}
        Ratio pixel: ${window.devicePixelRatio}
        Orientation: ${screen.orientation ? screen.orientation.type : 'Non disponible'}
    `.trim();
}


/**
 * Fonction simple de toast pour le débogage mobile
 * @param {string} message Message à afficher
 * @param {string} type Type de message ('info', 'error', 'warning')
 * @param {number} duration Durée d'affichage en ms
 */
function showToastNew(message, type = 'info', duration = 3000) {
    // Créer l'élément toast
    const toast = document.createElement('div');
    
    // Appliquer le style selon le type
    toast.style.position = 'fixed';
    toast.style.bottom = '10px';
    toast.style.left = '10px';
    toast.style.right = '10px';
    toast.style.padding = '10px';
    toast.style.borderRadius = '4px';
    toast.style.color = 'white';
    toast.style.fontFamily = 'sans-serif';
    toast.style.zIndex = '10000';
    toast.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
    toast.style.wordBreak = 'break-word';
    
    // Couleur selon le type
    if (type === 'error') {
        toast.style.backgroundColor = '#F44336';
    } else if (type === 'warning') {
        toast.style.backgroundColor = '#FF9800';
    } else {
        toast.style.backgroundColor = '#2196F3';
    }
    
    // Ajouter le message
    toast.textContent = message;
    
    // Ajouter au document
    document.body.appendChild(toast);
    
    // Supprimer après la durée spécifiée
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s';
        setTimeout(() => document.body.removeChild(toast), 500);
    }, duration);
    
    // Aussi l'afficher dans la console
    if (type === 'error') {
        console.error(message);
    } else if (type === 'warning') {
        console.warn(message);
    } else {
        console.log(message);
    }
}