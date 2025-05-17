/**
 * debugLogUtils.js - Module de débogage unifié pour souris et tactile
 * Fournit un panneau de débogage entièrement fonctionnel et propre
 */

import { state } from './main.js';




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


/**
 * Active le panneau de débogage et affiche les informations initiales
 */
export function activateDebugLogs() {
    state.isDebugLog = true;
    

    // Afficher le panneau
    toggleDebugPanel(true);

    // Créer le panneau
    createDebugPanel();
    
    // Afficher des informations de base
    debugLog("=== INFORMATIONS SYSTÈME ===", 'info');
    debugLog(`User Agent: ${navigator.userAgent}`, 'info');
    debugLog(`En ligne: ${navigator.onLine ? 'Oui' : 'Non'}`, navigator.onLine ? 'success' : 'warning');
    debugLog(`URL: ${window.location.href}`, 'info');
    
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
    
    // Vérifier le cache après un court délai
    setTimeout(() => {
        checkCache();
    }, 1000);
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
    
    // 11. Ajouter les boutons à la barre d'action
    actionBar.appendChild(clearButton);
    actionBar.appendChild(checkLibsButton);
    actionBar.appendChild(checkCacheButton);
    
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
 * Vérification du cache
 */
async function checkCache() {
    debugLog("=== VÉRIFICATION DU CACHE ===", 'info');
    debugLog(`Mode: ${navigator.onLine ? 'Connecté' : 'Non connecté'}`);
    
    // Vérifier si l'API Cache est disponible
    if (!('caches' in window)) {
        debugLog("API Cache non disponible dans ce navigateur!", 'error');
        return;
    }
    
    try {
        // Obtenir la liste des caches disponibles
        const cacheNames = await caches.keys();
        debugLog(`${cacheNames.length} caches trouvés: ${cacheNames.join(", ")}`, 'info');
        
        let totalItems = 0;
        let treeViewerItems = 0;
        let foundArbreEnc = false;
        
        // Explorer chaque cache
        for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName);
            const requests = await cache.keys();
            
            totalItems += requests.length;
            
            // Vérifier s'il s'agit de notre cache principal
            if (cacheName === CACHE_NAME) {
                treeViewerItems = requests.length;
                debugLog(`Cache principal (${CACHE_NAME}): ${requests.length} fichiers`, 'info');
                
                // Vérifier la présence de fichiers importants
                const criticalFiles = ['arbre.enc', 'arbreX.enc', 'pako.min.js', 'd3.v7.min.js'];
                
                for (const file of criticalFiles) {
                    const found = requests.some(req => req.url.includes(file));
                    const status = found ? 'Présent' : 'ABSENT';
                    const type = found ? 'success' : 'error';
                    
                    debugLog(`- ${file}: ${status}`, type);
                    
                    if (file === 'arbre.enc' && found) {
                        foundArbreEnc = true;
                    }
                }
                
                // Afficher les 5 premiers éléments
                if (requests.length > 0) {
                    debugLog("Exemples de fichiers dans le cache:", 'info');
                    const samplesToShow = Math.min(5, requests.length);
                    
                    for (let i = 0; i < samplesToShow; i++) {
                        const url = requests[i].url;
                        const fileName = url.split('/').pop();
                        debugLog(`- ${fileName} (${url})`, 'info');
                    }
                    
                    if (requests.length > samplesToShow) {
                        debugLog(`... et ${requests.length - samplesToShow} autres fichiers`, 'info');
                    }
                } else {
                    debugLog("Le cache principal est vide!", 'warning');
                }
            } else {
                // Cache auxiliaire
                debugLog(`Cache "${cacheName}": ${requests.length} fichiers`, 'info');
                
                // Vérifier si arbre.enc pourrait être dans ce cache
                const arbreEncInCache = requests.some(req => req.url.includes('arbre.enc'));
                if (arbreEncInCache) {
                    debugLog(`⚠️ 'arbre.enc' trouvé dans cache "${cacheName}" au lieu de "${CACHE_NAME}"!`, 'warning');
                    foundArbreEnc = true;
                }
            }
        }
        
        // Résumé
        if (totalItems > 0) {
            debugLog(`Total: ${totalItems} fichiers dans tous les caches`, 'info');
            debugLog(`Cache principal: ${treeViewerItems} fichiers (${Math.round(treeViewerItems/totalItems*100)}% du total)`, 'info');
        }
        
        if (foundArbreEnc) {
            debugLog("✅ 'arbre.enc' est présent dans au moins un cache", 'success');
        } else {
            debugLog("❌ 'arbre.enc' n'est présent dans AUCUN cache!", 'error');
        }
        
    } catch (error) {
        debugLog(`Erreur lors de la vérification du cache: ${error.message}`, 'error');
    }
    
    // Vérifier si le service worker est actif
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration && registration.active) {
                debugLog(`Service Worker actif: Oui (scope: ${registration.scope})`, 'success');
            } else {
                debugLog("Service Worker actif: Non", 'warning');
            }
        } catch (error) {
            debugLog(`Erreur Service Worker: ${error.message}`, 'error');
        }
    } else {
        debugLog("API Service Worker non supportée", 'error');
    }
    
    debugLog("=== FIN VÉRIFICATION DU CACHE ===", 'info');
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