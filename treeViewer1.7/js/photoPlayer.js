import { makeElementDraggable } from './geoHeatMapInteractions.js';
import { debugLog } from './debugLogUtils.js'
// import { getResourceUrl }  from './audioPlayer.js';
import { state } from './main.js';
import { testRealConnectivity } from './treeAnimation.js'




/**
 * Obtient simplement le chemin du répertoire du HTML actuel
 * @returns {string} Le chemin du répertoire
 */
function getCurrentDirectory() {
    // Obtient l'URL complète de la page actuelle
    const currentUrl = window.location.href;
    
    // Trouver la dernière barre oblique avant un éventuel nom de fichier ou paramètres
    const lastSlashIndex = currentUrl.lastIndexOf('/');
    
    // Extraire tout ce qui est avant cette barre (le répertoire)
    if (lastSlashIndex > 0) {
        return currentUrl.substring(0, lastSlashIndex);
    }
    
    // Si pas de barre, retourner l'URL complète (cas rare)
    return currentUrl;
}

/**
 * Résout simplement un chemin relatif par rapport au répertoire actuel
 * @param {string} relativePath - Chemin relatif (avec ou sans /)
 * @returns {string} Chemin complet
 */
function getResourceUrl(relativePath) {
    // S'assurer que le chemin relatif commence par /
    const normalizedPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
    
    // Combiner avec le répertoire courant
    return `${getCurrentDirectory()}${normalizedPath}`;
}


/**
 * Affiche une image dans un conteneur déplaçable et redimensionnable
 * @param {string} imagePath - Chemin vers l'image
 * @param {Object} options - Options d'affichage (position initiale, dimensions)
 */
function displayEndAnimationPhoto(imagePath, options = {}) {
    // Configuration par défaut
    const config = {
        top: options.top || window.innerHeight / 4,
        left: options.left || window.innerWidth / 4,
        width: options.width || 300,
        height: options.height || 'auto',
        zIndex: options.zIndex || 1600
    };
    
    // Modification du conteneur
    const photoContainer = document.createElement('div');
    photoContainer.id = 'animation-photo-container';
    photoContainer.style.position = 'fixed';
    photoContainer.style.top = `${config.top}px`;
    photoContainer.style.left = `${config.left}px`;
    photoContainer.style.width = `${config.width}px`;
    photoContainer.style.height = config.height === 'auto' ? 'auto' : `${config.height}px`;
    photoContainer.style.zIndex = config.zIndex;
    // Retirer resize:both qui ne fonctionne pas correctement
    // photoContainer.style.resize = 'both';  
    photoContainer.style.overflow = 'hidden';
    photoContainer.style.backgroundColor = 'transparent';
    photoContainer.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    
    // Ajouter l'image
    const image = document.createElement('img');
    image.src = imagePath;
    image.style.width = '100%';
    image.style.height = 'auto';
    image.style.display = 'block';
    image.draggable = false; // Empêcher le drag de l'image elle-même

    // // Créer le bouton de fermeture
    // const closeButton = document.createElement('button');
    // closeButton.innerHTML = '&times;';
    // closeButton.style.position = 'absolute';
    // closeButton.style.top = '5px';
    // closeButton.style.right = '5px';
    // closeButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    // closeButton.style.color = 'white';
    // closeButton.style.border = 'none';
    // closeButton.style.borderRadius = '50%';
    // closeButton.style.width = '24px';
    // closeButton.style.height = '24px';
    // closeButton.style.fontSize = '16px';
    // closeButton.style.cursor = 'pointer';
    // closeButton.style.display = 'flex';
    // closeButton.style.justifyContent = 'center';
    // closeButton.style.alignItems = 'center';
    // closeButton.style.padding = '2';
    // closeButton.style.opacity = '0.7';
    // closeButton.style.transition = 'opacity 0.2s';
    // closeButton.title = 'Fermer';




    // Créer le bouton de fermeture amélioré pour mobile
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';  // Symbole X
    closeButton.style.position = 'absolute';
    closeButton.style.top = '5px';
    closeButton.style.right = '5px';
    closeButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '50%';

    // Augmenter la taille pour smartphone
    closeButton.style.width = '18px';  // Plus grand (était 24px)
    closeButton.style.height = '18px'; // Plus grand (était 24px)
    closeButton.style.fontSize = '22px'; // Plus grand (était 16px)
    closeButton.style.cursor = 'pointer';
    closeButton.style.display = 'flex';
    closeButton.style.justifyContent = 'center';
    closeButton.style.alignItems = 'center';
    closeButton.style.padding = '0';
    closeButton.style.zIndex = '1100';  // S'assurer qu'il est au-dessus

    // Ajouter une zone de toucher plus grande (padding invisible)
    closeButton.style.boxSizing = 'content-box';
    closeButton.style.padding = '2px';
    closeButton.style.margin = '-5px';

    closeButton.title = 'Fermer';






    // Effet de survol sur le bouton de fermeture
    closeButton.addEventListener('mouseover', () => {
        closeButton.style.opacity = '1';
    });
    closeButton.addEventListener('mouseout', () => {
        closeButton.style.opacity = '0.7';
    });

    // Effet visuel au survol et au toucher
    closeButton.addEventListener('mouseover', () => {
        closeButton.style.backgroundColor = 'rgba(255, 0, 0, 0.9)';
        closeButton.style.transform = 'scale(1.1)';
    });

    closeButton.addEventListener('mouseout', () => {
        closeButton.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
        closeButton.style.transform = 'scale(1)';
    });

    closeButton.addEventListener('touchstart', (e) => {
        closeButton.style.backgroundColor = 'rgba(255, 0, 0, 0.9)';
        closeButton.style.transform = 'scale(1.1)';
    });
    
    //Poignée de redimensionnement personnalisée
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'photo-resize-handle';
    resizeHandle.style.position = 'absolute';
    resizeHandle.style.bottom = '0';
    resizeHandle.style.right = '0';
    resizeHandle.style.width = '20px';
    resizeHandle.style.height = '20px';
    resizeHandle.style.cursor = 'nwse-resize';
    resizeHandle.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
    resizeHandle.style.borderTop = '1px solid rgba(255, 255, 255, 0.5)';
    resizeHandle.style.borderLeft = '1px solid rgba(255, 255, 255, 0.5)';
    resizeHandle.style.zIndex = '2';
    resizeHandle.innerHTML = '⤡';
    resizeHandle.style.display = 'flex';
    resizeHandle.style.justifyContent = 'center';
    resizeHandle.style.alignItems = 'center';
    resizeHandle.style.color = 'rgba(255, 255, 255, 0.7)';
    resizeHandle.style.fontSize = '10px';
    
    // Ajouter les éléments au conteneur
    photoContainer.appendChild(image);
    photoContainer.appendChild(closeButton);
    photoContainer.appendChild(resizeHandle);  // Ajouter la poignée
    
    // Ajouter au DOM
    document.body.appendChild(photoContainer);
    
    // Rendre le conteneur déplaçable
    makeElementDraggable(photoContainer, photoContainer);
    
    // AJOUTER: Gérer le redimensionnement manuellement
    setupPhotoResize(photoContainer, resizeHandle);
    
    // Gérer le clic sur le bouton de fermeture
    closeButton.addEventListener('click', () => {
        closeAnimationPhoto();
    });
    // Événement tactile
    closeButton.addEventListener('touchend', (e) => {
        e.preventDefault();  // Empêcher le clic simulé qui suivrait
        closeAnimationPhoto();
    });
    
    return photoContainer;
}


/**
 * Ferme la photo d'animationk
 */
export function closeAnimationPhoto() {
    const photoContainer = document.getElementById('animation-photo-container');
    if (!photoContainer) return;
    
    // Arrêter l'observateur de redimensionnement
    if (photoContainer.resizeObserver) {
        photoContainer.resizeObserver.disconnect();
    }
    
    // Supprimer le conteneur
    if (photoContainer.parentNode) {
        photoContainer.parentNode.removeChild(photoContainer);
    }
}

/**
 * Appeler cette fonction à la fin de startAncestorAnimation pour afficher la photo
 */
// export function showEndAnimationPhoto(nodeName) {
//     // Chemin vers l'image que vous souhaitez afficher
//     // const imagePath = '/background_images/thomas.jpg';
//     console.log("\n\n\n   **** DEBUG photo ***", nodeName)

//     let imageUrl;
//     let name = nodeName.toLowerCase();
//     if (name.includes('thomas')) { 
//         imageUrl = getResourceUrl('/background_images/thomas.jpg');
//     } else if (name.includes('alain')) {
//         imageUrl = getResourceUrl('/background_images/fort_lalatte.jpg');
//     } else if (name.includes('brigitte')) {
//         imageUrl = getResourceUrl('/background_images/brigitte.jpg');
//     } else if (name.includes('dominique')) {
//         imageUrl = getResourceUrl('/background_images/dominique.jpg');
//     } else if (name.includes('garand')) {
//         imageUrl = getResourceUrl('/background_images/garand.jpg');
//     } else if (name.includes('stephanie')) {
//         imageUrl = getResourceUrl('/background_images/steph.jpg');
//     } else if (name.includes('sattouf')) {
//         imageUrl = getResourceUrl('/background_images/riad.jpg');
//     } else if (name.includes('charlemagne')) {
//         imageUrl = getResourceUrl('/background_images/charlemagne.jpg');
//     } else if (name.includes('hugues')) {
//         imageUrl = getResourceUrl('/background_images/hugues.jpg');
//     } else if (name.includes('kamber')) {
//         imageUrl = getResourceUrl('/background_images/kamber.jpg');
//     } else if (name.includes('pharabert')) {
//         imageUrl = getResourceUrl('/background_images/pharabert.jpg');
//     } 
        
//     // Options de positionnement et dimensions
//     const options = {
//         width: 400,
//         height: 'auto',
//         top: window.innerHeight / 4,
//         left: window.innerWidth / 4
//     };
    
//     // Afficher la photo
//     displayEndAnimationPhoto(imageUrl, options);
// }





/**
 * Récupère une ressource en tenant compte du mode hors connexion
 * @param {string} relativePath - Chemin relatif de la ressource
 * @returns {Promise<string>} URL de la ressource (depuis le cache ou générée)
 */
async function getCachedResourceUrl(relativePath) {
    // Normaliser le chemin
    const normalizedPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
    
    // URL complète de la ressource
    const resourceUrl = `${getCurrentDirectory()}${normalizedPath}`;
    debugLog(`Photo  ${resourceUrl} `, "debug");

    testRealConnectivity();
    
    // Si nous sommes en ligne, retourner directement l'URL
    if (state.isOnLine) {
        return resourceUrl;
    }
    
    // En mode hors ligne, vérifier si la ressource est dans le cache
    if ('caches' in window) {
        try {
            debugLog(`Mode hors ligne: recherche de ${normalizedPath} dans le cache`);
            
            // Récupérer tous les caches disponibles
            const cacheNames = await caches.keys();
            
            // Vérifier chaque cache pour la ressource
            for (const cacheName of cacheNames) {
                const cache = await caches.open(cacheName);
                
                // Essayer plusieurs variantes de chemin pour la ressource
                const pathVariants = [
                    resourceUrl,
                    normalizedPath,
                    normalizedPath.substring(1), // sans le slash initial
                    `${getCurrentDirectory()}${normalizedPath.substring(1)}`
                ];
                
                for (const path of pathVariants) {
                    const response = await cache.match(path);
                    if (response) {
                        debugLog(`Ressource ${normalizedPath} trouvée dans le cache: ${cacheName}`);
                        
                        // Créer un blob URL pour l'image depuis la réponse en cache
                        const blob = await response.blob();
                        return URL.createObjectURL(blob);
                    }
                }
                
                // Chercher par nom de fichier dans le cache (approche plus flexible)
                const fileName = normalizedPath.split('/').pop();
                const allCacheEntries = await cache.keys();
                
                for (const request of allCacheEntries) {
                    if (request.url.includes(fileName)) {
                        debugLog(`Ressource ${fileName} trouvée avec URL: ${request.url}`);
                        const response = await cache.match(request);
                        if (response) {
                            const blob = await response.blob();
                            return URL.createObjectURL(blob);
                        }
                    }
                }
            }
            
            (`Ressource ${normalizedPath} non trouvée dans les caches`, 'warning');
        } catch (error) {
            debugLog(`Erreur lors de l'accès au cache pour ${normalizedPath}:`, error);
        }
    }
    
    // Si l'image n'est pas dans le cache, retourner une image de remplacement ou l'URL normale
    debugLog(`Utilisation de l'URL normale pour ${normalizedPath} (non trouvée dans le cache)`);
    return resourceUrl;
}

/**
 * Appeler cette fonction à la fin de startAncestorAnimation pour afficher la photo
 */
export async function showEndAnimationPhoto(nodeName) {
    console.log("\n\n\n   **** DEBUG photo ***", nodeName);

    // Mapping des noms avec les chemins d'images
    const imageMapping = {
        'thomas': '/background_images/thomas.jpg',
        'alain': '/background_images/fort_lalatte.jpg',
        'brigitte': '/background_images/brigitte.jpg',
        'dominique': '/background_images/dominique.jpg',
        'garand': '/background_images/garand.jpg',
        'stephanie': '/background_images/steph.jpg',
        'sattouf': '/background_images/riad.jpg',
        'charlemagne': '/background_images/charlemagne.jpg',
        'hugues': '/background_images/hugues.jpg',
        'kamber': '/background_images/kamber.jpg',
        'pharabert': '/background_images/pharabert.jpg'
    };
    
    // Trouver la correspondance dans le mapping
    let imagePath = null;
    const name = nodeName.toLowerCase();
    
    for (const [key, path] of Object.entries(imageMapping)) {
        if (name.includes(key)) {
            imagePath = path;
            break;
        }
    }
    
    // Si aucune correspondance trouvée, sortir
    if (!imagePath) {
        console.log(`Pas d'image associée pour ${nodeName}`);
        return;
    }
    
    // Récupérer l'URL (depuis le cache si hors ligne)
    const imageUrl = await getCachedResourceUrl(imagePath);
    
    // Options de positionnement et dimensions
    const options = {
        width: 400,
        height: 'auto',
        top: window.innerHeight / 4,
        left: window.innerWidth / 4
    };
    
    // Afficher la photo
    displayEndAnimationPhoto(imageUrl, options);
}







/**
 * Configure le redimensionnement manuel de la photo
 * @param {HTMLElement} container - Le conteneur de la photo
 * @param {HTMLElement} handle - La poignée de redimensionnement
 */
function setupPhotoResize(container, handle) {
    let isResizing = false;
    let startX, startY, startWidth, startHeight;
    
    // Gestionnaire d'événement pour le début du redimensionnement (souris)
    handle.addEventListener('mousedown', function(e) {
        e.preventDefault();
        e.stopPropagation();  // Empêcher le déplacement pendant le redimensionnement
        
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = container.offsetWidth;
        startHeight = container.offsetHeight;
        
        document.addEventListener('mousemove', mouseMoveResize);
        document.addEventListener('mouseup', stopResize);
        
        // Changer le curseur pendant le redimensionnement
        document.body.style.cursor = 'nwse-resize';
    });
    
    // Gestionnaire d'événement pour le redimensionnement (souris)
    function mouseMoveResize(e) {
        if (!isResizing) return;
        
        // Calculer les nouvelles dimensions
        const newWidth = Math.max(100, startWidth + (e.clientX - startX));
        const newHeight = startHeight + (e.clientY - startY);
        
        // Appliquer les nouvelles dimensions
        container.style.width = `${newWidth}px`;
        
        // Si height n'est pas 'auto', redimensionner la hauteur aussi
        if (container.style.height !== 'auto') {
            container.style.height = `${newHeight}px`;
        }
        
        // Ajuster l'image si nécessaire
        const image = container.querySelector('img');
        if (image) {
            image.style.width = '100%';
        }
    }
    
    // Gestionnaire pour arrêter le redimensionnement
    function stopResize() {
        if (isResizing) {
            isResizing = false;
            document.removeEventListener('mousemove', mouseMoveResize);
            document.removeEventListener('mouseup', stopResize);
            document.body.style.cursor = '';
        }
    }
    
    // Support tactile pour le redimensionnement
    handle.addEventListener('touchstart', function(e) {
        if (e.touches.length === 1) {
            e.preventDefault();
            e.stopPropagation();
            
            const touch = e.touches[0];
            isResizing = true;
            startX = touch.clientX;
            startY = touch.clientY;
            startWidth = container.offsetWidth;
            startHeight = container.offsetHeight;
            
            document.addEventListener('touchmove', touchMoveResize);
            document.addEventListener('touchend', stopTouchResize);
            document.addEventListener('touchcancel', stopTouchResize);
        }
    });
    
    // Gestionnaire pour le redimensionnement tactile
    function touchMoveResize(e) {
        if (!isResizing || e.touches.length !== 1) return;
        
        e.preventDefault();
        const touch = e.touches[0];
        
        const newWidth = Math.max(100, startWidth + (touch.clientX - startX));
        const newHeight = startHeight + (touch.clientY - startY);
        
        container.style.width = `${newWidth}px`;
        if (container.style.height !== 'auto') {
            container.style.height = `${newHeight}px`;
        }
        
        const image = container.querySelector('img');
        if (image) {
            image.style.width = '100%';
        }
    }
    
    // Arrêter le redimensionnement tactile
    function stopTouchResize() {
        if (isResizing) {
            isResizing = false;
            document.removeEventListener('touchmove', touchMoveResize);
            document.removeEventListener('touchend', stopTouchResize);
            document.removeEventListener('touchcancel', stopTouchResize);
        }
    }
}