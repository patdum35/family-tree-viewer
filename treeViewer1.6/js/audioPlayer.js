// audioPlayer.js est importé dynamiquement dans main.js si on clique sur le bouton loadDataButton "Entrez"
// donc pas de problème de lightHouse score au démarrage
import { makeElementDraggable } from './resizableModalUtils.js';
import { state, isIOSDevice, audio, audioUnlocked, getGetCachedResourceUrl } from './main.js';
// import { getCachedResourceUrl } from './photoPlayer.js';
// import { debugLog } from './debugLogUtils.js'
import { getDebugLog } from './main.js'

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
    const getCachedResourceUrl = await getGetCachedResourceUrl();

    
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
    
    console.log(' \n\n*** debug on resize :  repositionAudioPlayerOnResize \n\n ');


    // Vérifier si le player est en dehors de l'écran après redimensionnement
    const rect = player.getBoundingClientRect();

    
    // Si le player est partiellement ou totalement hors écran, le replacer
    if (rect.right > state.innerWidth || rect.bottom > state.innerHeight) {
        // Calculer la nouvelle position
        let newLeft = rect.left;
        let newTop = rect.top;
        
        // Repositionner horizontalement si nécessaire
        if (rect.right > state.innerWidth) {
            newLeft = Math.max(0, state.innerWidth - rect.width - 10);
        }
        
        // Repositionner verticalement si nécessaire
        if (rect.bottom > state.innerHeight) {
            newTop = Math.max(0, state.innerHeight - rect.height - 10);
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
        top: state.innerHeight - player.offsetHeight - 10,
        left: state.innerWidth - player.offsetWidth - 10
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
        if (rect.right > state.innerWidth || rect.bottom > state.innerHeight) {
            // Appliquer les corrections
            const marginFromEdge = 10;
            
            if (rect.right > state.innerWidth) {
                player.style.right = `${marginFromEdge}px`;
                player.style.left = 'auto';
            }
            
            if (rect.bottom > state.innerHeight) {
                player.style.bottom = `${marginFromEdge}px`;
                player.style.top = 'auto';
            }
        }
    }, 50);
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

        showAndMoveAudioPlayer();
        
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
            const debugLog = await getDebugLog();
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
 * Affiche , déplace et grossit le lecteur audio
 */
function showAndMoveAudioPlayer() {
    if (!animationAudioPlayer) {
        animationAudioPlayer = createAudioPlayerGUI();
    }
    // Afficher le lecteur avec animation
    setTimeout(() => {
        let moveX, moveY, scale; // Déplacer un peu vers le haut
        if (state.innerHeight < 400) {
            moveX = 0; // Déplacer vers le centre
            moveY = 0; // Déplacer un peu vers le haut
            scale = 1.3; //'';
            animationAudioPlayer.style.transform = `translate(-${moveX}px, -${moveY}px) scaleY(${scale})`;
        } else {
            moveX = state.innerWidth/2 - 75; // Déplacer vers le centre
            moveY = 20; // Déplacer un peu vers le haut
            scale = 1.5;
            animationAudioPlayer.style.transform = `translate(-${moveX}px, -${moveY}px) scale(${scale})`;
        }
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
    toggleButton.role = 'fontSizeChangeChrome2';

    // toggleButton.innerHTML = '🎵';
    toggleButton.style.position = 'fixed';
    toggleButton.style.bottom = '0.25em';
    toggleButton.style.right = '0.25em';
    toggleButton.style.backgroundColor = 'rgba(50, 50, 50, 0.85)';
    toggleButton.style.color = 'white';
    toggleButton.style.border = 'none';
    toggleButton.style.borderRadius = '50%';
    toggleButton.style.fontSize = '20px';
    toggleButton.style.width = '2em'; //'40px';
    toggleButton.style.height = '2em'; //'40px';
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.boxShadow = '0 0.1em 0.25em rgba(0,0,0,0.3)';
    toggleButton.style.zIndex = '1499';
    toggleButton.style.padding = '0';
    toggleButton.style.textAlign = 'center';
    toggleButton.style.verticalAlign = 'middle';

    const buttonSpan = document.createElement('span');
    buttonSpan.style.fontSize = '20px';
    buttonSpan.style.padding = '0';
    buttonSpan.style.margin = '0';
    buttonSpan.style.textAlign = 'center';
    buttonSpan.style.verticalAlign = 'middle';
    buttonSpan.role ='button2';
    buttonSpan.innerHTML = '🎵';
    toggleButton.appendChild(buttonSpan);

    





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
            animationAudioPlayer.style.transform = 'translateY(0)';
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

// // Fonction pour ajuster la position du bouton lorsque le lecteur est visible
// function updateToggleButtonPosition() {
//     const toggleButton = document.getElementById('show-audio-player-btn');
//     if (!toggleButton) return;
    
//     if (isAudioPlayerVisible) {
//         toggleButton.style.display = 'none';
//     } else {
//         toggleButton.style.display = 'block';
//     }
// }

// // Surveiller les changements de visibilité du lecteur
// setInterval(updateToggleButtonPosition, 300);

// // Initialiser le bouton de contrôle après le chargement
// window.addEventListener('load', () => {
//     // Vérifier si le son est activé globalement
//     if (state.isSpeechEnabled) {
//         createAudioPlayerToggleButton();
//     }
// });
