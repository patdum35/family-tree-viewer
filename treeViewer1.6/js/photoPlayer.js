import { makeElementDraggable } from './geoHeatMapInteractions.js';
// import { getResourceUrl }  from './audioPlayer.js';
import { state } from './main.js';

/**
 * Affiche une image dans un conteneur déplaçable et redimensionnable
 * @param {string} imagePath - Chemin vers l'image
 * @param {Object} options - Options d'affichage (position initiale, dimensions)
 */
// function displayEndAnimationPhoto(imagePath, options = {}) {
//     // Configuration par défaut
//     const config = {
//         top: options.top || window.innerHeight / 4,
//         left: options.left || window.innerWidth / 4,
//         width: options.width || 300,
//         height: options.height || 'auto',
//         zIndex: options.zIndex || 1600
//     };
    
//     // Créer le conteneur
//     const photoContainer = document.createElement('div');
//     photoContainer.id = 'animation-photo-container';
//     photoContainer.style.position = 'fixed';
//     photoContainer.style.top = `${config.top}px`;
//     photoContainer.style.left = `${config.left}px`;
//     photoContainer.style.width = `${config.width}px`;
//     photoContainer.style.height = config.height === 'auto' ? 'auto' : `${config.height}px`;
//     photoContainer.style.zIndex = config.zIndex;
//     photoContainer.style.resize = 'both';
//     photoContainer.style.overflow = 'hidden';
//     photoContainer.style.backgroundColor = 'transparent';
//     photoContainer.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    
//     // Ajouter l'image
//     const image = document.createElement('img');
//     image.src = imagePath;
//     image.style.width = '100%';
//     image.style.height = 'auto';
//     image.style.display = 'block';
//     image.draggable = false; // Empêcher le drag de l'image elle-même
    
//     // Créer le bouton de fermeture
//     const closeButton = document.createElement('button');
//     closeButton.innerHTML = '&times;';
//     closeButton.style.position = 'absolute';
//     closeButton.style.top = '5px';
//     closeButton.style.right = '5px';
//     closeButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
//     closeButton.style.color = 'white';
//     closeButton.style.border = 'none';
//     closeButton.style.borderRadius = '50%';
//     closeButton.style.width = '24px';
//     closeButton.style.height = '24px';
//     closeButton.style.fontSize = '16px';
//     closeButton.style.cursor = 'pointer';
//     closeButton.style.display = 'flex';
//     closeButton.style.justifyContent = 'center';
//     closeButton.style.alignItems = 'center';
//     closeButton.style.padding = '0';
//     closeButton.style.opacity = '0.7';
//     closeButton.style.transition = 'opacity 0.2s';
//     closeButton.title = 'Fermer';
    
//     // Effet de survol sur le bouton de fermeture
//     closeButton.addEventListener('mouseover', () => {
//         closeButton.style.opacity = '1';
//     });
//     closeButton.addEventListener('mouseout', () => {
//         closeButton.style.opacity = '0.7';
//     });
    
//     // Ajouter les éléments au conteneur
//     photoContainer.appendChild(image);
//     photoContainer.appendChild(closeButton);
    
//     // Ajouter au DOM
//     document.body.appendChild(photoContainer);
    
//     // Rendre le conteneur déplaçable
//     makeElementDraggable(photoContainer, photoContainer);
    
//     // Gérer le clic sur le bouton de fermeture
//     closeButton.addEventListener('click', () => {
//         closeAnimationPhoto();
//     });
    
//     // Ajouter un écouteur de redimensionnement pour ajuster l'image
//     const resizeObserver = new ResizeObserver(() => {
//         // Assurer que l'image s'adapte au conteneur
//         image.style.width = '100%';
//     });
//     resizeObserver.observe(photoContainer);
    
//     // Garder une référence à l'observateur pour le nettoyage
//     photoContainer.resizeObserver = resizeObserver;
    
//     return photoContainer;
// }

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

    // Créer le bouton de fermeture
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '5px';
    closeButton.style.right = '5px';
    closeButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '50%';
    closeButton.style.width = '24px';
    closeButton.style.height = '24px';
    closeButton.style.fontSize = '16px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.display = 'flex';
    closeButton.style.justifyContent = 'center';
    closeButton.style.alignItems = 'center';
    closeButton.style.padding = '0';
    closeButton.style.opacity = '0.7';
    closeButton.style.transition = 'opacity 0.2s';
    closeButton.title = 'Fermer';

    // Effet de survol sur le bouton de fermeture
    closeButton.addEventListener('mouseover', () => {
        closeButton.style.opacity = '1';
    });
    closeButton.addEventListener('mouseout', () => {
        closeButton.style.opacity = '0.7';
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
    
    return photoContainer;
}


/**
 * Ferme la photo d'animationk
 */
function closeAnimationPhoto() {
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
export function showEndAnimationPhoto() {
    // Chemin vers l'image que vous souhaitez afficher
    // const imagePath = '/background_images/thomas.jpg';
    const imageUrl = getResourceUrl('/background_images/thomas.jpg');
    
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