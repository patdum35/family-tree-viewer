
import { makeElementDraggable } from './geoHeatMapInteractions.js';
import { state } from './main.js';
// 1. Ajout des variables pour gérer le lecteur audio
let animationAudio = null;
let animationAudioPlayer = null;
let isAudioPlayerVisible = false;



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
 * Crée et configure l'élément audio
 * @returns {HTMLAudioElement} Élément audio configuré
 */
function createAudioElement() {
    if (animationAudio) return animationAudio;




    // Chemin complet vers le fichier audio
    const audioUrl = getResourceUrl('/sounds/lalatte_remix.mp3');
    console.log("\n\n Chargement audio depuis:", audioUrl);
    
    // Créer l'élément audio
    animationAudio = new Audio(audioUrl);



    // animationAudio = new Audio('/sounds/lalatte_remix.mp3');
    animationAudio.loop = true; // Option pour boucler la lecture
    // animationAudio.volume = 0.3; // Volume par défaut
    animationAudio.volume = restoreAudioVolume();
    
    // Précharger le son
    animationAudio.load();
    
    return animationAudio;
}

/**
 * Crée l'interface du mini-lecteur audio (version ultra-minimaliste)
 */
function createAudioPlayerGUI() {
    // Ne pas recréer si existe déjà
    if (document.getElementById('animation-audio-player')) {
        return document.getElementById('animation-audio-player');
    }
    
    // Créer le conteneur principal - ultra compact
    const playerContainer = document.createElement('div');
    playerContainer.id = 'animation-audio-player';
    playerContainer.style.position = 'fixed';
    playerContainer.style.bottom = '10px';
    playerContainer.style.right = '10px';
    playerContainer.style.backgroundColor = 'rgba(40, 40, 40, 0.85)';
    playerContainer.style.borderRadius = '4px';
    playerContainer.style.padding = '4px';
    playerContainer.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
    playerContainer.style.display = 'flex';
    playerContainer.style.flexDirection = 'column';
    playerContainer.style.gap = '2px';
    playerContainer.style.zIndex = '1500';
    playerContainer.style.width = '120px'; // Ultra compact
    playerContainer.style.fontSize = '10px'; // Texte très petit
    
    // Barre supérieure ultra compacte
    const titleBar = document.createElement('div');
    titleBar.style.display = 'flex';
    titleBar.style.justifyContent = 'space-between';
    titleBar.style.alignItems = 'center';
    titleBar.style.marginBottom = '2px';
    titleBar.style.cursor = 'move';
    titleBar.style.width = '100%';
    
    const title = document.createElement('div');
    title.textContent = '♫';  // Titre minimaliste
    title.style.color = 'white';
    title.style.fontWeight = 'bold';
    title.style.fontSize = '10px';
    
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.color = 'white';
    closeButton.style.fontSize = '14px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.padding = '0 2px';
    closeButton.style.marginLeft = '2px';
    closeButton.title = 'Fermer';
    
    titleBar.appendChild(title);
    titleBar.appendChild(closeButton);
    
    // Contrôles ultra compacts
    const playbackControls = document.createElement('div');
    playbackControls.style.display = 'flex';
    playbackControls.style.alignItems = 'center';
    playbackControls.style.gap = '3px';
    playbackControls.style.width = '100%';
    
    const playPauseButton = document.createElement('button');
    playPauseButton.id = 'audio-play-pause';
    playPauseButton.innerHTML = '▶️';
    playPauseButton.style.background = 'none';
    playPauseButton.style.border = 'none';
    playPauseButton.style.color = 'white';
    playPauseButton.style.fontSize = '12px';
    playPauseButton.style.cursor = 'pointer';
    playPauseButton.style.padding = '0';
    playPauseButton.style.lineHeight = '1';
    playPauseButton.style.width = '14px';
    playPauseButton.style.height = '14px';
    playPauseButton.title = 'Lecture/Pause';
    
    // Volume très compact
    const volumeControl = document.createElement('div');
    volumeControl.style.display = 'flex';
    volumeControl.style.alignItems = 'center';
    volumeControl.style.gap = '2px';
    volumeControl.style.flexGrow = '1';
    
    const volumeIcon = document.createElement('span');
    volumeIcon.innerHTML = '🔊';
    volumeIcon.style.color = 'white';
    volumeIcon.style.fontSize = '10px';
    volumeIcon.style.width = '12px';
    
    const volumeSlider = document.createElement('input');
    volumeSlider.type = 'range';
    volumeSlider.min = '0';
    volumeSlider.max = '1';
    volumeSlider.step = '0.1';
    volumeSlider.style.width = '60px';
    volumeSlider.style.height = '10px';
    volumeSlider.title = 'Volume';
    // volumeSlider.value = '0.3';
    volumeSlider.value = restoreAudioVolume().toString();
    
    volumeControl.appendChild(volumeIcon);
    volumeControl.appendChild(volumeSlider);
    
    playbackControls.appendChild(playPauseButton);
    playbackControls.appendChild(volumeControl);
    
    
    // Assembler le tout
    playerContainer.appendChild(titleBar);
    playerContainer.appendChild(playbackControls);
    
    // Ajouter au DOM
    document.body.appendChild(playerContainer);

    const rect = playerContainer.getBoundingClientRect();
    playerContainer.style.top = `${rect.top}px`;
    playerContainer.style.left = `${rect.left}px`;
    playerContainer.style.bottom = 'auto';
    playerContainer.style.right = 'auto';
    

    // Rendre déplaçable
    makeElementDraggable(playerContainer, titleBar);
    
    // Événements
    closeButton.addEventListener('click', () => {
        closeAudioPlayer();
    });
    
    playPauseButton.addEventListener('click', () => {
        toggleAudioPlayback();
    });
    
    volumeSlider.addEventListener('input', (e) => {
        if (animationAudio) {
            // animationAudio.volume = parseFloat(e.target.value);
            // updateVolumeIcon(parseFloat(e.target.value), volumeIcon);
            const volume = parseFloat(e.target.value);
            animationAudio.volume = volume;
            updateVolumeIcon(volume, volumeIcon);
            saveAudioVolume(volume); // Sauvegarder le volume
        }
    });

    // Appliquer immédiatement le volume à l'élément audio
    if (animationAudio) {
        animationAudio.volume = parseFloat(volumeSlider.value);
        updateVolumeIcon(parseFloat(volumeSlider.value), volumeIcon);
    }
    
    return playerContainer;
}

/**
 * Met à jour l'icône de volume en fonction du niveau
 */
function updateVolumeIcon(volume, iconElement) {
    if (!iconElement) return;
    
    if (volume === 0) {
        iconElement.innerHTML = '🔇';
    } else if (volume < 0.5) {
        iconElement.innerHTML = '🔉';
    } else {
        iconElement.innerHTML = '🔊';
    }
}



// Pour s'assurer que le volume est bien mémorisé entre les sessions
// Ajouter cette fonction pour sauvegarder le volume

function saveAudioVolume(volume) {
    try {
        localStorage.setItem('animationAudioVolume', volume.toString());
    } catch (e) {
        console.warn("Impossible de sauvegarder le volume:", e);
    }
}
// fonction pour restaurer le volume
function restoreAudioVolume() {
    try {
        const savedVolume = localStorage.getItem('animationAudioVolume');
        if (savedVolume !== null) {
            // Retourner la valeur sauvegardée ou la valeur par défaut
            return parseFloat(savedVolume);
        }
    } catch (e) {
        console.warn("Impossible de récupérer le volume:", e);
    }
    return 0.3; // Valeur par défaut
}


/**
 * Fonction à ajouter dans handleWindowResize pour gérer le repositionnement
 */
export function repositionAudioPlayerOnResize() {
    const player = document.getElementById('animation-audio-player');
    if (!player) return;
    
    // Vérifier si le player est en dehors de l'écran après redimensionnement
    const rect = player.getBoundingClientRect();
    
    // Si le player est partiellement ou totalement hors écran, le replacer
    if (rect.right > window.innerWidth || rect.bottom > window.innerHeight) {
        // Calculer la nouvelle position
        let newLeft = rect.left;
        let newTop = rect.top;
        
        // Repositionner horizontalement si nécessaire
        if (rect.right > window.innerWidth) {
            newLeft = Math.max(0, window.innerWidth - rect.width - 10);
        }
        
        // Repositionner verticalement si nécessaire
        if (rect.bottom > window.innerHeight) {
            newTop = Math.max(0, window.innerHeight - rect.height - 10);
        }
        
        // Appliquer la nouvelle position
        player.style.left = `${newLeft}px`;
        player.style.top = `${newTop}px`;
        
        // Supprimer bottom/right pour éviter les conflits
        player.style.bottom = 'auto';
        player.style.right = 'auto';
    }
}

/**
 * Ferme complètement le lecteur audio et arrête la musique
 */
function closeAudioPlayer() {
    // Arrêter la musique
    if (animationAudio) {
        animationAudio.pause();
        animationAudio.currentTime = 0;
    }
    
    // Supprimer le lecteur du DOM
    if (animationAudioPlayer && animationAudioPlayer.parentNode) {
        animationAudioPlayer.parentNode.removeChild(animationAudioPlayer);
        animationAudioPlayer = null;
    }
    
    isAudioPlayerVisible = false;
}

// Fonction qui sera appelée lors de la création du player pour le positionner initialement
function initiallyPositionAudioPlayer() {
    const player = document.getElementById('animation-audio-player');
    if (!player) return;
    
    const bottomRight = {
        top: window.innerHeight - player.offsetHeight - 10,
        left: window.innerWidth - player.offsetWidth - 10
    };

    // Positionner en bas à droite par défaut
    player.style.top = `${bottomRight.top}px`;
    player.style.left = `${bottomRight.left}px`;
    player.style.bottom = 'auto';
    player.style.right = 'auto';
    
    // S'assurer que le player est visible quand on le crée pour la première fois
    setTimeout(() => {
        // Vérifier si le player est dans l'écran
        const rect = player.getBoundingClientRect();
        if (rect.right > window.innerWidth || rect.bottom > window.innerHeight) {
            // Appliquer les corrections
            const marginFromEdge = 10;
            
            if (rect.right > window.innerWidth) {
                player.style.right = `${marginFromEdge}px`;
                player.style.left = 'auto';
            }
            
            if (rect.bottom > window.innerHeight) {
                player.style.bottom = `${marginFromEdge}px`;
                player.style.top = 'auto';
            }
        }
    }, 50);
}





/**
 * Repositionne le lecteur audio en fonction de l'orientation et de la taille de l'écran
 */
function positionAudioPlayerForCurrentScreen() {
    const player = document.getElementById('animation-audio-player');
    if (!player) return;
    
    // Détecter si on est sur mobile (approximatif)
    const isMobile = window.innerWidth <= 768;
    
    // Déterminer l'orientation
    const isLandscape = window.innerWidth > window.innerHeight;
    
    // Dimensions de l'écran
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Réinitialiser certains styles pour éviter des conflits
    player.style.transform = 'none';
    
    // Positions différentes selon le contexte
    if (isMobile) {
        if (isLandscape) {
            // Mode paysage sur mobile
            player.style.bottom = '10px';
            player.style.right = '10px';
            player.style.top = 'auto';
            player.style.left = 'auto';
        } else {
            // Mode portrait sur mobile
            player.style.bottom = '60px'; // Plus haut pour éviter les barres de navigation
            player.style.right = '10px';
            player.style.top = 'auto';
            player.style.left = 'auto';
        }
    } else {
        // Sur desktop, position par défaut en bas à droite
        player.style.bottom = '20px';
        player.style.right = '20px';
        player.style.top = 'auto';
        player.style.left = 'auto';
    }
    
    // Limiter la taille en fonction de l'écran
    const maxWidth = Math.min(250, screenWidth * 0.4);
    player.style.maxWidth = `${maxWidth}px`;
    
    // Sauvegarder la nouvelle position comme position par défaut
    saveAudioPlayerPosition();
    
    console.log(`Lecteur audio positionné pour ${isMobile ? 'mobile' : 'desktop'} en mode ${isLandscape ? 'paysage' : 'portrait'}`);
}

/**
 * Sauvegarde la position du lecteur audio
 */
function saveAudioPlayerPosition() {
    const player = document.getElementById('animation-audio-player');
    if (!player) return;
    
    try {
        // Obtenir la position et les dimensions
        const rect = player.getBoundingClientRect();
        
        // Sauvegarder dans localStorage
        localStorage.setItem('audioPlayerPosition', JSON.stringify({
            top: rect.top,
            left: rect.left,
            right: window.innerWidth - rect.right,
            bottom: window.innerHeight - rect.bottom,
            width: rect.width,
            height: rect.height,
            timestamp: Date.now()
        }));
    } catch (error) {
        console.warn("Impossible de sauvegarder la position du lecteur audio:", error);
    }
}

/**
 * Restaure la position sauvegardée ou utilise la position par défaut
 */
function restoreAudioPlayerPosition() {
    const player = document.getElementById('animation-audio-player');
    if (!player) return false;
    
    try {
        const savedPos = localStorage.getItem('audioPlayerPosition');
        if (!savedPos) return false;
        
        const pos = JSON.parse(savedPos);
        const now = Date.now();
        
        // Vérifier si la position n'est pas trop ancienne (1 jour)
        if (now - pos.timestamp > 24 * 60 * 60 * 1000) {
            localStorage.removeItem('audioPlayerPosition');
            return false;
        }
        
        // Détecter si l'écran a été fortement redimensionné depuis
        const widthRatio = window.innerWidth / (pos.left + pos.width + pos.right);
        const heightRatio = window.innerHeight / (pos.top + pos.height + pos.bottom);
        
        if (widthRatio < 0.8 || widthRatio > 1.2 || heightRatio < 0.8 || heightRatio > 1.2) {
            console.log("Dimensions d'écran trop différentes, utilisation du positionnement par défaut");
            return false;
        }
        
        // Restaurer la position
        player.style.width = `${pos.width}px`;
        player.style.height = `${pos.height}px`;
        
        // Préférer right/bottom pour un positionnement relatif au bas/droite de l'écran
        if (pos.right < window.innerWidth / 2) {
            player.style.right = `${pos.right}px`;
            player.style.left = 'auto';
        } else {
            player.style.left = `${pos.left}px`;
            player.style.right = 'auto';
        }
        
        if (pos.bottom < window.innerHeight / 2) {
            player.style.bottom = `${pos.bottom}px`;
            player.style.top = 'auto';
        } else {
            player.style.top = `${pos.top}px`;
            player.style.bottom = 'auto';
        }
        
        return true;
    } catch (error) {
        console.warn("Erreur lors de la restauration de la position:", error);
        return false;
    }
}


/**
 * Démarre la lecture audio et affiche le lecteur
 */
export function playEndOfAnimationSound() {
    try {
        // Créer l'élément audio s'il n'existe pas
        const audio = createAudioElement();
        
        // Créer et afficher le lecteur
        animationAudioPlayer = createAudioPlayerGUI();

        // S'assurer que le player est bien positionné
        initiallyPositionAudioPlayer();

        showAudioPlayer();
        
        // Réinitialiser le son pour être sûr
        audio.currentTime = 0;
        
        // Commencer la lecture
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                // Lecture démarrée avec succès
                updatePlayPauseButton(true);
                console.log("🎵 Lecture audio démarrée");
            }).catch(error => {
                // Erreur de lecture
                console.error("❌ Impossible de lire l'audio:", error);
                updatePlayPauseButton(false);
                
                // Si l'erreur est liée à l'interaction utilisateur
                if (error.name === "NotAllowedError") {
                    // Afficher un message dans le lecteur
                    showPlayerMessage("Cliquez pour lancer la musique");
                }
            });
        }
    } catch (error) {
        console.error("❌ Erreur lors de la création/lecture de l'audio:", error);
    }
}

/**
 * Affiche un message dans le lecteur
 */
function showPlayerMessage(message) {
    if (!animationAudioPlayer) return;
    
    // Créer un élément de message s'il n'existe pas déjà
    let messageElement = animationAudioPlayer.querySelector('.player-message');
    if (!messageElement) {
        messageElement = document.createElement('div');
        messageElement.className = 'player-message';
        messageElement.style.color = 'white';
        messageElement.style.fontSize = '12px';
        messageElement.style.textAlign = 'center';
        messageElement.style.marginTop = '5px';
        animationAudioPlayer.appendChild(messageElement);
    }
    
    // Mettre à jour le message
    messageElement.textContent = message;
    
    // Faire disparaître après un délai
    setTimeout(() => {
        if (messageElement && messageElement.parentNode) {
            messageElement.textContent = '';
        }
    }, 5000);
}

/**
 * Met à jour l'apparence du bouton lecture/pause
 */
function updatePlayPauseButton(isPlaying) {
    const button = document.getElementById('audio-play-pause');
    if (button) {
        button.innerHTML = isPlaying ? '⏸️' : '▶️';
    }
}

/**
 * Bascule entre lecture et pause
 */
function toggleAudioPlayback() {
    if (!animationAudio) return;
    
    if (animationAudio.paused) {
        // Démarrer la lecture
        animationAudio.play().then(() => {
            updatePlayPauseButton(true);
        }).catch(error => {
            console.error("❌ Impossible de reprendre la lecture:", error);
        });
    } else {
        // Mettre en pause
        animationAudio.pause();
        updatePlayPauseButton(false);
    }
}

/**
 * Affiche le lecteur audio
 */
function showAudioPlayer() {
    if (!animationAudioPlayer) {
        animationAudioPlayer = createAudioPlayerGUI();
    }
    
    // Afficher le lecteur avec animation
    setTimeout(() => {
        animationAudioPlayer.style.transform = 'translateY(0)';
        isAudioPlayerVisible = true;
    }, 100);
}

/**
 * Masque le lecteur audio
 */
function hideAudioPlayer() {
    if (!animationAudioPlayer) return;
    
    // Masquer avec animation
    animationAudioPlayer.style.transform = 'translateY(150%)';
    isAudioPlayerVisible = false;
}

/**
 * Arrête la lecture et réinitialise le lecteur
 */
function stopAnimationAudio() {
    if (animationAudio) {
        animationAudio.pause();
        animationAudio.currentTime = 0;
        updatePlayPauseButton(false);
    }
}


// Créer une fonction pour nettoyer les ressources audio si nécessaire
export function cleanupAnimationAudio() {
    if (animationAudio) {
        stopAnimationAudio();
        animationAudio = null;
    }
    
    if (animationAudioPlayer && animationAudioPlayer.parentNode) {
        animationAudioPlayer.parentNode.removeChild(animationAudioPlayer);
        animationAudioPlayer = null;
    }
    
    isAudioPlayerVisible = false;
}

// Créer un bouton flottant pour montrer/masquer le lecteur
export function createAudioPlayerToggleButton() {
    // Vérifier si le bouton existe déjà
    if (document.getElementById('show-audio-player-btn')) {
        return;
    }
    
    const toggleButton = document.createElement('button');
    toggleButton.id = 'show-audio-player-btn';
    toggleButton.innerHTML = '🎵';
    toggleButton.style.position = 'fixed';
    toggleButton.style.bottom = '20px';
    toggleButton.style.right = '20px';
    toggleButton.style.backgroundColor = 'rgba(50, 50, 50, 0.85)';
    toggleButton.style.color = 'white';
    toggleButton.style.border = 'none';
    toggleButton.style.borderRadius = '50%';
    toggleButton.style.width = '40px';
    toggleButton.style.height = '40px';
    toggleButton.style.fontSize = '20px';
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
    toggleButton.style.zIndex = '1499';
    toggleButton.title = 'Afficher le lecteur audio';
    
    // Événement clic
    toggleButton.addEventListener('click', () => {
        if (isAudioPlayerVisible) {
            hideAudioPlayer();
        } else {
            // Créer et afficher le lecteur si ce n'est pas déjà fait
            if (!animationAudio) {
                createAudioElement();
            }
            if (!animationAudioPlayer) {
                createAudioPlayerGUI();
            }
            showAudioPlayer();
        }
    });
    
    document.body.appendChild(toggleButton);
}

// Fonction pour ajuster la position du bouton lorsque le lecteur est visible
function updateToggleButtonPosition() {
    const toggleButton = document.getElementById('show-audio-player-btn');
    if (!toggleButton) return;
    
    if (isAudioPlayerVisible) {
        toggleButton.style.display = 'none';
    } else {
        toggleButton.style.display = 'block';
    }
}



// Surveiller les changements de visibilité du lecteur
setInterval(updateToggleButtonPosition, 300);

// Initialiser le bouton de contrôle après le chargement
window.addEventListener('load', () => {
    // Vérifier si le son est activé globalement
    if (state.isSpeechEnabled) {
        createAudioPlayerToggleButton();
    }
});


