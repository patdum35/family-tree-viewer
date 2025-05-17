import { state } from './main.js';


// Fonction pour vider le cache storage
export function activateDebugLogs() {
    state.isDebugLog = true;
    // Créer le panneau même si loadEncryptedContent n'est pas appelé
    createDebugPanel();
    

    // Appeler cette fonction après la création du panel de debug
    enhanceDebugPanel();
    // Appeler cette fonction pour améliorer le panneau
    enhanceDebugPanelForTouch();

    // Afficher des informations de base
    debugLog("=== INFORMATIONS SYSTÈME ===", 'info');
    debugLog(`User Agent: ${navigator.userAgent}`, 'info');
    debugLog(`En ligne: ${navigator.onLine ? 'Oui' : 'Non'}`, navigator.onLine ? 'success' : 'warning');
    debugLog(`URL: ${window.location.href}`, 'info');
    let screenInfo = addScreenInfoToDebug();

    // Ajouter l'information dans le panneau de débogage
    debugLog(`=== INFORMATIONS ÉCRAN ===`, 'info');
    screenInfo.split('\n').forEach(line => {
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

// Exportez et exposez la fonction pour qu'elle soit accessible globalement
window.activateDebugLogs = activateDebugLogs;






// /**
//  * Fonction simple de toast pour le débogage mobile
//  * @param {string} message Message à afficher
//  * @param {string} type Type de message ('info', 'error', 'warning')
//  * @param {number} duration Durée d'affichage en ms
//  */
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



/**
 * Fonction améliorée de débogage avec vérification des bibliothèques
 * Affiche les messages dans un panneau persistant et lisible
 */
function createDebugPanel() {
    // Ne créer le panneau qu'une seule fois
    if (document.getElementById('debug-panel')) return;
    
    // Créer le panneau de débogage
    const panel = document.createElement('div');
    panel.id = 'debug-panel';
    panel.style.position = 'fixed';
    panel.style.top = '10px';
    panel.style.right = '10px';
    panel.style.width = '80%';
    panel.style.maxHeight = '80%';
    panel.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    panel.style.color = 'white';
    panel.style.padding = '10px';
    panel.style.borderRadius = '5px';
    panel.style.fontFamily = 'monospace';
    panel.style.fontSize = '12px';
    panel.style.zIndex = '9999';
    panel.style.overflowY = 'auto';
    panel.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
    
    // Ajouter un titre
    const title = document.createElement('div');
    title.textContent = 'Debug Cache et Bibliothèques';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '5px';
    title.style.borderBottom = '1px solid #666';
    title.style.paddingBottom = '5px';
    
    // Ajouter un conteneur pour les messages
    const messagesContainer = document.createElement('div');
    messagesContainer.id = 'debug-messages';
    
    // Ajouter des boutons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.marginBottom = '10px';
    
    // Bouton pour effacer les logs
    const clearButton = document.createElement('button');
    clearButton.textContent = 'Effacer logs';
    clearButton.style.padding = '5px 10px';
    clearButton.style.marginRight = '5px';
    clearButton.style.backgroundColor = '#F44336';
    clearButton.style.color = 'white';
    clearButton.style.border = 'none';
    clearButton.style.borderRadius = '3px';
    clearButton.style.fontSize = '12px';
    
    clearButton.addEventListener('click', () => {
        document.getElementById('debug-messages').innerHTML = '';
    });
    
    // Bouton pour vérifier les bibliothèques
    const checkLibsButton = document.createElement('button');
    checkLibsButton.textContent = 'Vérifier bibliothèques';
    checkLibsButton.style.padding = '5px 10px';
    checkLibsButton.style.marginRight = '5px';
    checkLibsButton.style.backgroundColor = '#4CAF50';
    checkLibsButton.style.color = 'white';
    checkLibsButton.style.border = 'none';
    checkLibsButton.style.borderRadius = '3px';
    checkLibsButton.style.fontSize = '12px';
    
    checkLibsButton.addEventListener('click', checkLibraries);
    
    // Bouton pour vérifier le cache
    const checkCacheButton = document.createElement('button');
    checkCacheButton.textContent = 'Vérifier cache';
    checkCacheButton.style.padding = '5px 10px';
    checkCacheButton.style.backgroundColor = '#2196F3';
    checkCacheButton.style.color = 'white';
    checkCacheButton.style.border = 'none';
    checkCacheButton.style.borderRadius = '3px';
    checkCacheButton.style.fontSize = '12px';
    
    checkCacheButton.addEventListener('click', checkCache);
    
    // Assembler les boutons
    buttonContainer.appendChild(clearButton);
    buttonContainer.appendChild(checkLibsButton);
    buttonContainer.appendChild(checkCacheButton);
    
    // Assembler le panneau
    panel.appendChild(title);
    panel.appendChild(buttonContainer);
    panel.appendChild(messagesContainer);
    
    // Ajouter au document
    document.body.appendChild(panel);
    
    return panel;
}

/**
 * Ajoute un message au panneau de débogage
 * @param {string} message Message à afficher
 * @param {string} type Type de message ('info', 'error', 'warning', 'success')
 */
export function debugLog(message, type = 'info') {

    if (state.isDebugLog) {

        // S'assurer que le panneau existe
        createDebugPanel();
        
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
        
        messageElement.style.borderLeft = `3px solid ${borderColor}`;
        messageElement.style.padding = '3px 5px';
        messageElement.style.marginBottom = '3px';
        messageElement.style.wordBreak = 'break-word';
        
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
    
    // Vérifier la configuration des ressources (si disponible)
    if (typeof resources !== 'undefined' && Array.isArray(resources)) {
        debugLog(`${resources.length} ressources configurées dans le chargeur`, 'info');
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
        debugLog(`Total: ${totalItems} fichiers dans tous les caches`, 'info');
        debugLog(`Cache principal: ${treeViewerItems} fichiers (${Math.round(treeViewerItems/totalItems*100)}% du total)`, 'info');
        
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
 * Modification ciblée: ajout d'une fonction pour rendre le debug panel déplaçable et réductible
 */
function enhanceDebugPanel() {
    // Trouver le panel existant ou sortir si non trouvé
    const panel = document.getElementById('debug-panel');
    if (!panel) return;
    
    // 1. Créer une barre d'en-tête pour le déplacement
    const header = document.createElement('div');
    header.style.padding = '5px';
    header.style.marginBottom = '5px';
    header.style.cursor = 'move';
    header.style.backgroundColor = '#333';
    header.style.borderRadius = '3px';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    
    // 2. Ajouter titre
    const title = document.createElement('span');
    title.textContent = 'Debug';
    title.style.fontWeight = 'bold';
    
    // 3. Ajouter boutons de contrôle
    const buttons = document.createElement('div');
    
    // Bouton pour déplacer droite/gauche
    const moveBtn = document.createElement('button');
    moveBtn.innerHTML = '⇄';
    moveBtn.style.marginRight = '5px';
    moveBtn.style.backgroundColor = '#555';
    moveBtn.style.border = 'none';
    moveBtn.style.borderRadius = '3px';
    moveBtn.style.width = '24px';
    moveBtn.style.height = '24px';
    
    // 4. Bouton réduire/agrandir
    const collapseBtn = document.createElement('button');
    collapseBtn.innerHTML = '−';
    collapseBtn.style.marginRight = '5px';
    collapseBtn.style.backgroundColor = '#555';
    collapseBtn.style.border = 'none';
    collapseBtn.style.borderRadius = '3px';
    collapseBtn.style.width = '24px';
    collapseBtn.style.height = '24px';
    
    // 5. Bouton fermer
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.backgroundColor = '#F44336';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '3px';
    closeBtn.style.width = '24px';
    closeBtn.style.height = '24px';
    
    // 6. Sauvegarder et déplacer le contenu existant
    const content = document.createElement('div');
    content.id = 'debug-panel-content';
    while (panel.firstChild) {
        content.appendChild(panel.firstChild);
    }
    
    // 7. Assembler les éléments
    buttons.appendChild(moveBtn);
    buttons.appendChild(collapseBtn);
    buttons.appendChild(closeBtn);
    header.appendChild(title);
    header.appendChild(buttons);
    panel.appendChild(header);
    panel.appendChild(content);
    
    // 8. Ajouter les fonctionnalités
    // Déplacer
    let isOnRight = true;
    moveBtn.addEventListener('click', () => {
        isOnRight = !isOnRight;
        if (isOnRight) {
            panel.style.right = '10px';
            panel.style.left = 'auto';
        } else {
            panel.style.left = '10px';
            panel.style.right = 'auto';
        }
    });
    
    // Réduire/agrandir
    let isCollapsed = false;
    collapseBtn.addEventListener('click', () => {
        isCollapsed = !isCollapsed;
        content.style.display = isCollapsed ? 'none' : 'block';
        collapseBtn.innerHTML = isCollapsed ? '+' : '−';
    });
    
    // Fermer
    closeBtn.addEventListener('click', () => {
        panel.style.display = 'none';
    });
    
    // 9. Rendre déplaçable
    makePanelDraggable(panel, header);
    
    // Ajouter des styles supplémentaires
    panel.style.resize = 'both';
    panel.style.overflow = 'auto';
    panel.style.zIndex = '9999';
}

/**
 * Fonction pour rendre le panneau déplaçable
 */
function makePanelDraggable(panel, header) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    header.onmousedown = dragMouseDown;
    
    function dragMouseDown(e) {
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }
    
    function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        panel.style.top = (panel.offsetTop - pos2) + "px";
        panel.style.left = (panel.offsetLeft - pos1) + "px";
        panel.style.right = 'auto'; // Important: annuler le right quand on déplace
    }
    
    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}



/**
 * Modification ciblée: rendre le debug panel compatible tactile
 */
function enhanceDebugPanelForTouch() {
    const panel = document.getElementById('debug-panel');
    if (!panel) return;
    
    // Trouver ou créer l'en-tête
    let header = panel.querySelector('div[style*="cursor: move"]');
    if (!header) {
        // Si l'en-tête n'existe pas, le créer comme dans enhanceDebugPanel()
        // [code pour créer l'en-tête omis pour brièveté]
    }
    
    // Ajouter support tactile pour le déplacement
    makeTouchDraggable(panel, header);
    
    // Ajouter un coin de redimensionnement pour tactile
    addResizeHandle(panel);
}

/**
 * Rend un élément déplaçable par toucher
 */
function makeTouchDraggable(element, handle) {
    // Variables pour stocker les positions
    let startX, startY, initialLeft, initialTop;
    let isDragging = false;
    
    // Gestionnaire pour le début du toucher
    handle.addEventListener('touchstart', function(e) {
        if (e.touches.length === 1) {
            e.preventDefault(); // Empêcher le défilement de la page
            
            isDragging = true;
            
            // Position initiale du toucher
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            
            // Position initiale de l'élément
            initialLeft = element.offsetLeft;
            initialTop = element.offsetTop;
            
            // Styles pour le déplacement
            element.style.right = 'auto'; // Important pour le positionnement
        }
    }, { passive: false });
    
    // Gestionnaire pour le déplacement du toucher
    document.addEventListener('touchmove', function(e) {
        if (isDragging && e.touches.length === 1) {
            e.preventDefault(); // Empêcher le défilement de la page
            
            // Calculer le déplacement
            const deltaX = e.touches[0].clientX - startX;
            const deltaY = e.touches[0].clientY - startY;
            
            // Déplacer l'élément
            element.style.left = (initialLeft + deltaX) + 'px';
            element.style.top = (initialTop + deltaY) + 'px';
        }
    }, { passive: false });
    
    // Gestionnaire pour la fin du toucher
    document.addEventListener('touchend', function() {
        isDragging = false;
    });
    
    // Conserver aussi le support souris
    handle.onmousedown = function(e) {
        e.preventDefault();
        
        // Position initiale de la souris
        startX = e.clientX;
        startY = e.clientY;
        
        // Position initiale de l'élément
        initialLeft = element.offsetLeft;
        initialTop = element.offsetTop;
        
        // Styles pour le déplacement
        element.style.right = 'auto';
        
        // Gestionnaires pour le déplacement et la fin
        document.onmousemove = mouseDrag;
        document.onmouseup = stopDrag;
    };
    
    function mouseDrag(e) {
        e.preventDefault();
        
        // Calculer le déplacement
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        // Déplacer l'élément
        element.style.left = (initialLeft + deltaX) + 'px';
        element.style.top = (initialTop + deltaY) + 'px';
    }
    
    function stopDrag() {
        document.onmousemove = null;
        document.onmouseup = null;
    }
}

/**
 * Ajoute une poignée de redimensionnement tactile
 */
function addResizeHandle(element) {
    // Créer la poignée de redimensionnement
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'debug-panel-resize-handle';
    resizeHandle.style.position = 'absolute';
    resizeHandle.style.right = '0';
    resizeHandle.style.bottom = '0';
    resizeHandle.style.width = '20px';
    resizeHandle.style.height = '20px';
    resizeHandle.style.cursor = 'nwse-resize';
    resizeHandle.style.background = 'linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.5) 50%)';
    resizeHandle.style.zIndex = '10000';
    
    // Variables pour le redimensionnement
    let startX, startY, startWidth, startHeight;
    let isResizing = false;
    
    // Gestionnaire pour le début du toucher
    resizeHandle.addEventListener('touchstart', function(e) {
        if (e.touches.length === 1) {
            e.preventDefault();
            isResizing = true;
            
            // Position initiale du toucher
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            
            // Taille initiale de l'élément
            startWidth = element.offsetWidth;
            startHeight = element.offsetHeight;
        }
    }, { passive: false });
    
    // Gestionnaire pour le déplacement du toucher
    document.addEventListener('touchmove', function(e) {
        if (isResizing && e.touches.length === 1) {
            e.preventDefault();
            
            // Calculer les nouvelles dimensions
            const width = startWidth + (e.touches[0].clientX - startX);
            const height = startHeight + (e.touches[0].clientY - startY);
            
            // Appliquer les nouvelles dimensions (avec limites)
            element.style.width = Math.max(200, width) + 'px';
            element.style.height = Math.max(100, height) + 'px';
        }
    }, { passive: false });
    
    // Gestionnaire pour la fin du toucher
    document.addEventListener('touchend', function() {
        isResizing = false;
    });
    
    // Support souris pour redimensionnement
    resizeHandle.onmousedown = function(e) {
        e.preventDefault();
        
        isResizing = true;
        
        // Position initiale de la souris
        startX = e.clientX;
        startY = e.clientY;
        
        // Taille initiale de l'élément
        startWidth = element.offsetWidth;
        startHeight = element.offsetHeight;
        
        // Gestionnaires pour le déplacement et la fin
        document.onmousemove = mouseResize;
        document.onmouseup = stopResize;
    };
    
    function mouseResize(e) {
        if (isResizing) {
            e.preventDefault();
            
            // Calculer les nouvelles dimensions
            const width = startWidth + (e.clientX - startX);
            const height = startHeight + (e.clientY - startY);
            
            // Appliquer les nouvelles dimensions (avec limites)
            element.style.width = Math.max(200, width) + 'px';
            element.style.height = Math.max(100, height) + 'px';
        }
    }
    
    function stopResize() {
        isResizing = false;
        document.onmousemove = null;
        document.onmouseup = null;
    }
    
    // Ajouter la poignée à l'élément
    element.appendChild(resizeHandle);
    
    // S'assurer que l'élément est correctement positionné
    if (element.style.position !== 'fixed' && element.style.position !== 'absolute') {
        element.style.position = 'fixed';
    }
}


/**
 * Ajout des informations sur la taille réelle de l'écran
 */
function addScreenInfoToDebug() {
    // Informations sur l'écran à afficher
    const screenInfo = `
        Écran: ${window.screen.width}x${window.screen.height}
        Fenêtre: ${window.innerWidth}x${window.innerHeight}
        Ratio pixel: ${window.devicePixelRatio}
        Orientation: ${screen.orientation ? screen.orientation.type : 'Non disponible'}
    `.trim();
    
    
    return screenInfo; // Retourner les informations au cas où elles seraient utiles ailleurs
}

// Si vous utilisez déjà un événement DOMContentLoaded pour initialiser le debug panel,
// ajoutez cette ligne à l'intérieur de cette fonction:
// addScreenInfoToDebug();

// Ou bien, si vous préférez, vous pouvez l'appeler à tout moment:
// addScreenInfoToDebug();


// // Vérification au chargement pour déboguer rapidement
// document.addEventListener('DOMContentLoaded', () => {
//     // Créer le panneau même si loadEncryptedContent n'est pas appelé
//     createDebugPanel();
    

//     // Appeler cette fonction après la création du panel de debug
//     enhanceDebugPanel();
//     // Appeler cette fonction pour améliorer le panneau
//     enhanceDebugPanelForTouch();

//     // Afficher des informations de base
//     debugLog("=== INFORMATIONS SYSTÈME ===", 'info');
//     debugLog(`User Agent: ${navigator.userAgent}`, 'info');
//     debugLog(`En ligne: ${navigator.onLine ? 'Oui' : 'Non'}`, navigator.onLine ? 'success' : 'warning');
//     debugLog(`URL: ${window.location.href}`, 'info');
//     let screenInfo = addScreenInfoToDebug();

//     // Ajouter l'information dans le panneau de débogage
//     debugLog(`=== INFORMATIONS ÉCRAN ===`, 'info');
//     screenInfo.split('\n').forEach(line => {
//         debugLog(line.trim(), 'info');
//     });
    
//     // Vérifier l'état de chargement des bibliothèques
//     document.addEventListener('libraries-loaded', () => {
//         debugLog("Événement 'libraries-loaded' déclenché", 'success');
//         checkLibraries();
//     });
    
//     // Vérifier le cache après un court délai
//     setTimeout(() => {
//         checkCache();
//     }, 1000);
// });

