
import { makeElementDraggable } from './geoHeatMapInteractions.js';
import { state, isIOSDevice, audio, audioUnlocked } from './main.js';
import { getCachedResourceUrl } from './photoPlayer.js';
import { debugLog } from './debugLogUtils.js'

let animationAudio = null;
let animationAudioPlayer = null;
let isAudioPlayerVisible = false;


// let audioUnlocked = false;


/**
 * Crée et configure l'élément audio avec support du mode hors ligne
 * @returns {Promise<HTMLAudioElement>} Élément audio configuré
 */
export async function createAudioElement() {
    if (animationAudio) return animationAudio;

    // Chemin vers le fichier audio chiffré (avec extension .mpx)
    const audioPath = '/sounds/lalatte.mpx';

    
    try {
        // Récupérer l'URL (cache ou directe selon connectivité)
        const audioUrl = await getCachedResourceUrl(audioPath);
        console.log("\n\n Chargement audio depuis:", audioUrl);
        
        // Créer l'élément audio
        animationAudio = new Audio(audioUrl);
        animationAudio.loop = true;
        animationAudio.volume = restoreAudioVolume();
        
        // Précharger le son
        animationAudio.load();
        
        return animationAudio;
    } catch (error) {
        console.error("Erreur lors du chargement audio:", error);
        
        // Fallback en cas d'erreur - essayer avec le MP3 normal
        try {
            const fallbackPath = '/sounds/lalatte_remix.mp3';
            const directUrl = await getCachedResourceUrl(fallbackPath);
            
            animationAudio = new Audio(directUrl);
            animationAudio.loop = true;
            animationAudio.volume = restoreAudioVolume();
            animationAudio.load();
            
            return animationAudio;
        } catch (fallbackError) {
            console.error("Erreur avec le fallback audio:", fallbackError);
            // Créer un élément audio vide en dernier recours
            animationAudio = new Audio();
            animationAudio.loop = true;
            animationAudio.volume = 0.5;
            return animationAudio;
        }
    }
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
    


    // Créer le bouton de fermeture amélioré pour mobile
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';  // Symbole X
    closeButton.style.position = 'absolute';
    closeButton.style.top = '5px';
    closeButton.style.right = '5px';
    closeButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'; //'rgba(255, 0, 0, 0.7)';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '50%';

    // Augmenter la taille pour smartphone
    closeButton.style.width = '14px';  // Plus grand (était 24px)
    closeButton.style.height = '14px'; // Plus grand (était 24px)
    closeButton.style.fontSize = '20px'; // Plus grand (était 16px)
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

    // Ajouter des écouteurs d'événements pour souris ET tactile
    // Événement de clic (souris)
    closeButton.addEventListener('click', () => {
        closeAudioPlayer();
    });

    // Événement tactile
    closeButton.addEventListener('touchend', (e) => {
        e.preventDefault();  // Empêcher le clic simulé qui suivrait
        closeAudioPlayer();
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
    return 0.4; // Valeur par défaut
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
export async function playEndOfAnimationSound() {
    try {


        // if (isIOSDevice() && !audioUnlocked) {
        //     console.log("⚠️ Audio pas encore débloqué - le son peut ne pas marcher");
        //     debugLog("⚠️ sur IOS, Audio pas encore débloqué - le son peut ne pas marcher");
        // }
        // if (audioUnlocked) {
        //     console.log("✅ Audio débloqué - le son peut marcher");
        //     debugLog("✅ Audio débloqué - le son peut marcher", "info");            
        // }
        
        // Créer l'élément audio s'il n'existe pas
        // const audio = await createAudioElement();
        
        // Créer et afficher le lecteur
        animationAudioPlayer = createAudioPlayerGUI();

        // S'assurer que le player est bien positionné
        initiallyPositionAudioPlayer();

        showAudioPlayer();
        
        // Réinitialiser le son pour être sûr
        audio.currentTime = 0;
        
        // Commencer la lecture
        // const playPromise = audio.play();

        let playPromise = undefined;



        if (audioUnlocked) {
            audio.currentTime = 0;
            playPromise = audio.play();
        }



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
        } else {
            console.error("❌ L'audio n'a pas été débloqué !");
            debugLog("❌ L'audio n'a pas été débloqué !", "info");
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
export function stopAnimationAudio() {
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
export async function createAudioPlayerToggleButton() {
    // Vérifier si le bouton existe déjà
    if (document.getElementById('show-audio-player-btn')) {
        return;
    }
    
    const toggleButton = document.createElement('button');
    toggleButton.id = 'show-audio-player-btn';
    toggleButton.innerHTML = '🎵';
    toggleButton.style.position = 'fixed';
    toggleButton.style.bottom = '5px';
    toggleButton.style.right = '5px';
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


    if (window.CURRENT_LANGUAGE === 'fr') {
        toggleButton.title = 'Afficher le lecteur audio';
    } else if (window.CURRENT_LANGUAGE === 'en') { 
        toggleButton.title = 'Show audio player';
    } else if (window.CURRENT_LANGUAGE === 'es') { 
        toggleButton.title = 'Mostrar reproductor de audio'; 
    } else if (window.CURRENT_LANGUAGE === 'hu') {
        toggleButton.title = 'Audiolejátszó megjelenítése';
    }   
    


    // Ajout effet hover (zoom 1.1)
    toggleButton.addEventListener('mouseover', () => {
    toggleButton.style.transform = 'scale(1.1)';
    });

    toggleButton.addEventListener('mouseout', () => {
    toggleButton.style.transform = 'scale(1)';
    });


    // Événement clic
    toggleButton.addEventListener('click', async () => {
        if (isAudioPlayerVisible) {
            hideAudioPlayer();
        } else {
            // Créer et afficher le lecteur si ce n'est pas déjà fait
            if (!animationAudio) {
                // createAudioElement();
                try {
                    await createAudioElement(); // Attendre la création de l'élément audio
                } catch (error) {
                    console.error("Erreur lors de la création de l'élément audio:", error);
                    // Optionnel: afficher un message à l'utilisateur
                    alert("Impossible de charger l'audio. Vérifiez votre connexion.");
                    return; // Sortir si l'audio ne peut pas être chargé
                }
            }
            if (!animationAudioPlayer) {
                createAudioPlayerGUI();
            }
            showAudioPlayer();
        }
    });
    
    document.body.appendChild(toggleButton);
}






// function unlockAudioOnFirstClick() {
//     if (audioUnlocked) return;
    
//     console.log("\n\n\n\n\n 🔓 Tentative de déblocage audio...\n\n\n\n\n");
    
//     const audio = new Audio();
//     audio.volume = 0;
    
//     // CORRECTION : Ajouter un timeout pour forcer la résolution
//     const playPromise = audio.play();
    
//     if (playPromise !== undefined) {
//         playPromise.then(() => {
//             audio.pause();
//             audioUnlocked = true;
//             console.log("✅ Audio débloqué automatiquement");
//             debugLog("✅ Audio débloqué automatiquement", "info");
            
//         }).catch((e) => {
//             console.log("❌ Audio toujours bloqué:", e.message);
//             debugLog("❌ Audio toujours bloqué:", "info");
//             // Sur PC, on peut quand même considérer que c'est débloqué
//             audioUnlocked = true;
//         });
//     } else {
//         // Navigateurs plus anciens - considérer comme débloqué
//         console.log("📱 Navigateur ancien - audio considéré comme débloqué");
//         debugLog("📱 Navigateur ancien - audio considéré comme débloqué", "info");
//         audioUnlocked = true;
//     }
    
//     // AJOUT : Fallback après 100ms au cas où
//     setTimeout(() => {
//         if (!audioUnlocked) {
//             console.log("⏰ Timeout - audio considéré comme débloqué sur PC");
//             debugLog("⏰ Timeout - audio considéré comme débloqué sur PC", "info");
//             audioUnlocked = true;
//         }
//     }, 100);
// }


/* */ 
// // Installation GARANTIE des event listeners
// function setupAudioUnlock() {
//     console.log("🔧 Installation des event listeners pour déblocage audio");
    
//     // Plusieurs événements pour être sûr
//     const events = ['click', 'touchstart', 'keydown', 'mousedown'];
    
//     events.forEach(eventType => {
//         document.addEventListener(eventType, unlockAudioOnFirstClick, { 
//             once: true,  // Se retire automatiquement après 1 usage
//             passive: true 
//         });
//     });
    
//     console.log("✅ Event listeners installés");
// }
/* */

// // Lancer l'installation au bon moment
// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', setupAudioUnlock);
// } else {
//     setupAudioUnlock(); // DOM déjà chargé
// }
/* */





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








/**
 * Variables globales pour l'analyse audio
 */
let audioContext = null;
let audioSource = null;
let audioAnalyser = null;
let isAudioContextInitialized = false;

/**
 * Initialise le contexte audio et connecte l'analyseur
 * @returns {boolean} Succès de l'initialisation
 */
function initAudioAnalysis() {
    if (isAudioContextInitialized || !animationAudio) return true;
    
    try {
        console.log("Initialisation de l'analyse audio...");
        
        // Créer le contexte audio
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Créer la source à partir de l'élément audio
        audioSource = audioContext.createMediaElementSource(animationAudio);
        
        // Créer l'analyseur
        audioAnalyser = audioContext.createAnalyser();
        audioAnalyser.fftSize = 32; // Petite taille pour l'efficacité
        
        // Connecter les nœuds
        audioSource.connect(audioAnalyser);
        audioAnalyser.connect(audioContext.destination);
        
        isAudioContextInitialized = true;
        console.log("Analyse audio initialisée avec succès");
        return true;
    } catch (error) {
        console.error("Erreur lors de l'initialisation de l'analyse audio:", error);
        return false;
    }
}

/**
 * Analyse le volume et l'ajuste si nécessaire
 */
function checkAndAdjustVolume() {
    if (!isAudioContextInitialized || !audioAnalyser || animationAudio.paused) return;
    
    try {
        // Créer un tableau pour les données
        const dataArray = new Uint8Array(audioAnalyser.frequencyBinCount);
        
        // Obtenir les données de fréquence
        audioAnalyser.getByteFrequencyData(dataArray);
        
        // Calculer le niveau moyen
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        
        console.log(`Niveau audio moyen: ${average.toFixed(2)}`);
        
        // Ajuster le volume si le niveau est trop bas
        if (average < 20) { // Seuil à ajuster selon vos tests
            // Augmenter progressivement le volume
            const newVolume = Math.min(0.8, animationAudio.volume + 0.1);
            console.log(`Volume trop bas (${average.toFixed(2)}), augmentation à ${newVolume.toFixed(2)}`);
            animationAudio.volume = newVolume;
            
            // Mettre à jour le slider de volume s'il existe
            const volumeSlider = document.querySelector('#animation-audio-player input[type="range"]');
            if (volumeSlider) {
                volumeSlider.value = newVolume.toString();
                
                // Mettre à jour l'icône de volume
                const volumeIcon = volumeSlider.previousElementSibling;
                if (volumeIcon) {
                    updateVolumeIcon(newVolume, volumeIcon);
                }
            }
        }
    } catch (error) {
        console.error("Erreur lors de l'analyse du volume:", error);
    }
}


/**
 * Cette fonction doit être appelée si l'utilisateur interagit avec la page
 * avant que l'audio ne démarre automatiquement
 */
function enableAudioContext() {
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

