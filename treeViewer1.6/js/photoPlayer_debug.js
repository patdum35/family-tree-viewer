import { makeElementDraggable } from './geoHeatMapInteractions.js';
import { debugLog } from './debugLogUtils.js'
// import { getResourceUrl }  from './audioPlayer.js';
import { state } from './main.js';
import { testRealConnectivity } from './treeAnimation.js'
import { fetchResourceWithCache } from './resourcePreloader.js';


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




/**
 * Récupère une ressource image chiffrée ou non
 * @param {string} relativePath - Chemin relatif de la ressource
 * @param {string} password - Mot de passe
 * @returns {Promise<string>} URL de la ressource
 */
export async function getCachedResourceUrl(relativePath, password) {
    // Normaliser le chemin
    const normalizedPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
    
    // Détecter si c'est un fichier à en-tête chiffré (.jpx extension suggérée)
    const isHeaderEncrypted = normalizedPath.endsWith('.jpx');
    
    // Obtenir l'URL complète
    const resourceUrl = `${getCurrentDirectory()}${normalizedPath}`;
    
    // Si c'est un fichier à en-tête chiffré et que nous avons un mot de passe
    if (isHeaderEncrypted && password) {
        debugLog(`Traitement d'image à en-tête chiffré: ${resourceUrl}`, 'debug');
        
        try {
            // Charger et déchiffrer l'image
            return await loadHeaderEncryptedImage(resourceUrl, password);
        } catch (error) {
            debugLog(`Erreur lors du déchiffrement: ${error.message}`, 'error');
            // Retourner une image par défaut en cas d'échec
            return `${getCurrentDirectory()}/background_images/contemporain.jpg`;
        }
    } 
}




/**
 * Appeler cette fonction à la fin de startAncestorAnimation pour afficher la photo
 */
export async function showEndAnimationPhoto(nodeName) {
    console.log("\n\n\n   **** DEBUG photo ***", nodeName);

    // Mapping des noms avec les chemins d'images cryptées
    // const imageMapping = {
    //     'thomas': '/background_images/thomas.enc',
    //     'alain': '/background_images/fort_lalatte.enc',
    //     'brigitte': '/background_images/brigitte.enc',
    //     'dominique': '/background_images/dominique.enc',
    //     'garand': '/background_images/garand.enc',
    //     'stephanie': '/background_images/steph.enc',
    //     'sattouf': '/background_images/riad.enc',
    //     'charlemagne': '/background_images/charlemagne.enc',
    //     'hugues': '/background_images/hugues.enc',
    //     'kamber': '/background_images/kamber.enc',
    //     'pharabert': '/background_images/pharabert.enc'
    // };
    const imageMapping = {
        'thomas': '/background_images/thomas.jpx',
        'alain': '/background_images/fort_lalatte.jpx',
        'brigitte': '/background_images/brigitte.jpx',
        'dominique': '/background_images/dominique.jpx',
        'garand': '/background_images/garand.jpx',
        'stephanie': '/background_images/steph.jpx',
        'sattouf': '/background_images/riad.jpx',
        'charlemagne': '/background_images/charlemagne.jpx',
        'hugues': '/background_images/hugues.jpx',
        'kamber': '/background_images/kamber.jpx',
        'pharabert': '/background_images/pharabert.jpx'
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
    
    const password = 'p';
    try {
        // Récupérer l'URL de l'image déchiffrée
        const imageUrl = await getCachedResourceUrl(imagePath, password);
        
        // Précharger l'image pour obtenir ses dimensions naturelles
        const preloadImage = new Image();
        preloadImage.src = imageUrl;
        
        // Attendre que l'image soit chargée avant de calculer les dimensions
        preloadImage.onload = function() {
            // Calcul pour que l'image tienne dans l'écran
            const maxWidth = window.innerWidth * 0.8;  // 80% de la largeur de l'écran
            const maxHeight = window.innerHeight * 0.8; // 80% de la hauteur de l'écran
            
            // Ratio d'aspect de l'image
            const imageRatio = this.naturalWidth / this.naturalHeight;
            
            // Calculer les dimensions pour tenir dans l'écran
            let finalWidth, finalHeight;
            if (this.naturalWidth / maxWidth > this.naturalHeight / maxHeight) {
                // Limité par la largeur
                finalWidth = maxWidth;
                finalHeight = maxWidth / imageRatio;
            } else {
                // Limité par la hauteur
                finalHeight = maxHeight;
                finalWidth = maxHeight * imageRatio;
            }
            
            // Options de positionnement et dimensions
            const options = {
                width: finalWidth,
                height: finalHeight,
                top: (window.innerHeight - finalHeight) / 2,
                left: (window.innerWidth - finalWidth) / 2
            };
            
            // Afficher la photo avec les dimensions calculées
            displayEndAnimationPhoto(imageUrl, options);
        };
        
        // En cas d'erreur de chargement, utiliser des valeurs par défaut
        preloadImage.onerror = function() {
            console.error("Erreur de chargement de l'image:", imageUrl);
            
            // Options par défaut
            const options = {
                width: 400,
                height: 'auto',
                top: window.innerHeight / 2 - 200, // Centré approximativement
                left: window.innerWidth / 2 - 200  // Centré approximativement
            };
            
            // Afficher une image par défaut ou message d'erreur
            displayEndAnimationPhoto(`${getCurrentDirectory()}/background_images/contemporain.jpg`, options);
        };
    } catch (error) {
        debugLog(`Erreur lors du chargement de l'image: ${error.message}`, 'error');
        // Afficher un message d'erreur ou une image par défaut
    }
}




/**
 * Charge et déchiffre une image JPG avec en-tête perturbé
 * @param {string} url - URL de l'image chiffrée
 * @param {string} password - Mot de passe
 * @returns {Promise<string>} - URL du blob de l'image déchiffrée
 */
async function loadHeaderEncryptedImage(url, password) {
    debugLog(`Chargement de l'image à en-tête chiffré: ${url}`, 'info');
    
    try {
        // Charger les données brutes
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const encryptedData = new Uint8Array(arrayBuffer);
        
        // Vérifier la signature JPEG
        if (encryptedData[0] !== 0xFF || encryptedData[1] !== 0xD8) {
            throw new Error("Format de fichier non valide - ce n'est pas un JPEG");
        }
        
        // Déchiffrer l'en-tête
        const decryptedData = decryptJpegHeader(encryptedData, password);
        
        // Créer un blob et retourner l'URL
        const blob = new Blob([decryptedData], { type: 'image/jpeg' });
        return URL.createObjectURL(blob);
    } catch (error) {
        debugLog(`Erreur de chargement d'image: ${error.message}`, 'error');
        throw error;
    }
}

/**
 * Déchiffre l'en-tête du fichier JPG
 * @param {Uint8Array} encryptedData - Données avec en-tête chiffré
 * @param {string} password - Mot de passe
 * @returns {Uint8Array} - Image restaurée
 */
function decryptJpegHeader(encryptedData, password) {
    const result = new Uint8Array(encryptedData.length);
    // Copier toutes les données
    result.set(encryptedData, 0);
    
    // Calculer le hash du mot de passe
    let hashValue = 0;
    for (let i = 0; i < password.length; i++) {
        hashValue = ((hashValue << 5) - hashValue) + password.charCodeAt(i);
        hashValue |= 0; // Convertir en entier 32 bits
    }
    
    // Vérifier la signature (4 octets à partir de l'index 4)
    const expectedSignature = new Uint8Array(4);
    let tempHash = hashValue;
    for(let i = 0; i < 4; i++) {
        expectedSignature[i] = (tempHash & 0xFF);
        tempHash = (tempHash * 1103515245 + 12345) & 0x7FFFFFFF;
    }
    
    // Vérifier la signature
    for(let i = 0; i < 4; i++) {
        if(result[i + 4] !== expectedSignature[i]) {
            throw new Error('Mot de passe incorrect');
        }
    }
    
    // Restaurer les 24 premiers octets (sauf les deux premiers - signature JPG)
    const headerSize = 24;
    for(let i = 2; i < headerSize && i < encryptedData.length; i++) {
        result[i] = encryptedData[i] ^ (hashValue & 0xFF);
        hashValue = (hashValue * 1103515245 + 12345) & 0x7FFFFFFF;
    }
    
    return result;
}
