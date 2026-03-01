import { makeElementDraggable } from './geoHeatMapInteractions.js';
import { debugLog } from './debugLogUtils.js'
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
 * Récupère le toto
 */
function getToto(longToto) {
    // récupère le toto depuis sa version Base64
    return atob(longToto);
}

/**
 * deTotoise n'importe quel fichier avec toto
 * @param {Uint8Array} totoData - Données totoisées
 * @returns {Uint8Array} - Données deTotoisées
 */
function deTotoFile(totoData) {
    // Créer une copie des données pour le résultat
    const result = new Uint8Array(totoData.length);
    const toto = getToto("dHJlZVZpZXdlcl8yMDI1XyMkKiM="); 

    // console.log("\n\n\n\n ******* DEBUG deTotoFile *****", toto, "\n\n\n");
    
    // Convertir le toto en bytes
    const totoBytes = new TextEncoder().encode(toto);
    
    // Générer la solution à partir du toto
    let keyPos = 0;
    
    // Appliquer transform sur chaque octet
    for (let i = 0; i < totoData.length; i++) {
        result[i] = totoData[i] ^ totoBytes[keyPos];
        keyPos = (keyPos + 1) % totoBytes.length;
    }
    
    return result;
}

/**
 * Charge et déTotoise n'importe quel fichier totoisé
 * @param {string} url - URL du fichier totoisé
 * @param {string} mimeType - Type MIME du fichier detotoisé
 * @returns {Promise<string>} - URL blob du fichier detotoisé
 */
async function loadAndDeTotoFile(url, mimeType) {
    debugLog(`Chargement du fichier à deToto: ${url}`, 'info');
    
    try {
        // Utiliser fetchResourceWithCache si disponible, sinon fetch normal
        let response;
        if (typeof fetchResourceWithCache === 'function') {
            response = await fetchResourceWithCache(url);
        } else {
            response = await fetch(url);
        }
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const totoData = new Uint8Array(arrayBuffer);
        
        // deTotoiser les données avec le toto
        const detotoData = deTotoFile(totoData);
        
        // Créer un blob et retourner l'URL
        const blob = new Blob([detotoData], { type: mimeType });
        return URL.createObjectURL(blob);
        
    } catch (error) {
        debugLog(`Erreur de chargement: ${error.message}`, 'error');
        throw error;
    }
}

/**
 * Récupère une ressource en tenant compte du mode hors connexion et du toto
 * @param {string} relativePath - Chemin relatif de la ressource
 * @returns {Promise<string>} URL de la ressource
 */
export async function getCachedResourceUrl(relativePath) {

    // Normaliser le chemin
    const normalizedPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
    
    // Obtenir l'URL complète
    const resourceUrl = `${getCurrentDirectory()}${normalizedPath}`;
    
    // Déterminer le type de fichier
    const fileExtension = normalizedPath.split('.').pop().toLowerCase();
    const isEncrypted = ['jpx', 'mpx', 'mvx', 'pnx', 'wax'].includes(fileExtension);
    
    // Déterminer le type MIME en fonction de l'extension
    let mimeType = 'application/octet-stream';
    if (fileExtension === 'jpx') mimeType = 'image/jpeg';
    else if (fileExtension === 'pnx') mimeType = 'image/png';
    else if (fileExtension === 'mpx') mimeType = 'audio/mpeg';
    else if (fileExtension === 'mvx') mimeType = 'video/mpeg';
    else if (fileExtension === 'wax') mimeType = 'audio/wav';
    else if (fileExtension === 'jpg' || fileExtension === 'jpeg') mimeType = 'image/jpeg';
    else if (fileExtension === 'mp4') mimeType = 'video/mpeg';
    else if (fileExtension === 'png') mimeType = 'image/png';
    else if (fileExtension === 'mp3') mimeType = 'audio/mpeg';
    else if (fileExtension === 'wav') mimeType = 'audio/wav';
    
    // Si c'est un fichier toto, le detTotoiser
    if (isEncrypted) {
        debugLog(`Traitement de fichier toto (${fileExtension}): ${resourceUrl}`, 'debug');
        
        try {
            // Essayer d'abord de récupérer du cache en mode hors ligne
            if (!state.isOnLine && 'caches' in window) {
                debugLog(`Mode hors ligne: recherche dans le cache pour ${normalizedPath}`, 'info');
                try {
                    const cacheNames = await caches.keys();
                    
                    for (const cacheName of cacheNames) {
                        const cache = await caches.open(cacheName);
                        const response = await cache.match(resourceUrl);
                        
                        if (response) {
                            debugLog(`Fichier totoisé trouvé dans le cache: ${cacheName}`, 'info');
                            const arrayBuffer = await response.arrayBuffer();
                            const totoData = new Uint8Array(arrayBuffer);
                            
                            // detTotoiser les données avec le toto
                            const deTotodData = deTotoFile(totoData);
                            const blob = new Blob([deTotodData], { type: mimeType });
                            return URL.createObjectURL(blob);
                        }
                    }
                    
                    debugLog(`Fichier non trouvé dans le cache`, 'warning');
                } catch (cacheError) {
                    debugLog(`Erreur lors de l'accès au cache: ${cacheError.message}`, 'error');
                }
            }
            
            // Si pas trouvé dans le cache ou en ligne, charger et détotoiser
            return await loadAndDeTotoFile(resourceUrl, mimeType);
        } catch (error) {
            debugLog(`Erreur lors du traitement du fichier: ${error.message}`, 'error');
            
            // Retourner une URL par défaut en cas d'erreur selon le type de fichier
            if (mimeType.startsWith('image/')) {
                return `${getCurrentDirectory()}/background_images/contemporain.jpg`;
            } else if (mimeType.startsWith('audio/')) {
                return `${getCurrentDirectory()}/sounds/default.mp3`;
            } else {
                return resourceUrl; // Fallback vers l'URL d'origine
            }
        }
    } else {
        // Traitement pour les fichiers normaux (code existant)
        debugLog(`Ressource normale: ${resourceUrl}`, 'debug');
        
        // Fonction à importer ou implémenter
        if (typeof testRealConnectivity === 'function') {
            testRealConnectivity();
        }
        
        // Si nous sommes en ligne, retourner directement l'URL
        if (state.isOnLine) {
            return resourceUrl;
        }
        
        // En mode hors ligne, vérifier si la ressource est dans le cache
        if ('caches' in window) {
            try {
                debugLog(`Mode hors ligne: recherche dans le cache pour ${normalizedPath}`, 'info');
                
                const cacheNames = await caches.keys();
                
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
                            debugLog(`Ressource trouvée dans le cache: ${cacheName}`, 'info');
                            
                            // Créer un blob URL pour la ressource depuis la réponse en cache
                            const blob = await response.blob();
                            return URL.createObjectURL(blob);
                        }
                    }
                    
                    // Chercher par nom de fichier dans le cache (approche plus flexible)
                    const fileName = normalizedPath.split('/').pop();
                    const allCacheEntries = await cache.keys();
                    
                    for (const request of allCacheEntries) {
                        if (request.url.includes(fileName)) {
                            debugLog(`Ressource ${fileName} trouvée avec URL: ${request.url}`, 'info');
                            const response = await cache.match(request);
                            if (response) {
                                const blob = await response.blob();
                                return URL.createObjectURL(blob);
                            }
                        }
                    }
                }
                
                debugLog(`Ressource non trouvée dans les caches`, 'warning');
            } catch (error) {
                debugLog(`Erreur lors de l'accès au cache: ${error.message}`, 'error');
            }
        }
        
        // Si la ressource n'est pas dans le cache, retourner l'URL normale
        debugLog(`Utilisation de l'URL normale (non trouvée dans le cache)`, 'info');
        return resourceUrl;
    }
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
    closeButton.style.zIndex = state.topZindex; // S'assurer qu'il est au-dessus

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
 * Appeler cette fonction à la fin de startAncestorAnimation pour afficher la photo
 */
export async function showEndAnimationPhoto(nodeName) {
    console.log("\n\n\n   **** DEBUG photo ***", nodeName);

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
        'pharabert': '/background_images/pharabert.jpx',
        'laurent': '/background_images/laurent.jpx',
        'victor': '/background_images/victor.jpx',
        'valerie': '/background_images/valerie.jpx',
        'louis': '/background_images/louison.jpx',
        'richard': '/background_images/richard.jpx',
        'christophe': '/background_images/christophe_m.jpx',
        'yoann': '/background_images/yoann_g.jpx',
        'rene': '/background_images/rene_b.jpx',
        'xavier': '/background_images/xavier_g.jpx',
        'michel': '/background_images/michel_e.jpx',
        'louis': '/background_images/louis_l.jpx',
        'didier': '/background_images/didier_s.jpx',
        'benoit': '/background_images/benoit_h.jpx',
        'daniel': '/background_images/daniel.jpx',
        'joseph': '/background_images/joseph.jpx',
    };
    
    // Trouver la correspondance dans le mapping
    let imagePath = null;
    const name = nodeName.toLowerCase();
    const nameWithoutAccent = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    for (const [key, path] of Object.entries(imageMapping)) {
        if (nameWithoutAccent.includes(key)) {
            imagePath = path;
            break;
        }
    }
    
    // Si aucune correspondance trouvée, sortir
    if (!imagePath) {
        console.log(`Pas d'image associée pour ${nodeName}`);
        return;
    }
    
    
    try {
        // Récupérer l'URL de l'image déchiffrée
        const imageUrl = await getCachedResourceUrl(imagePath);
        
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