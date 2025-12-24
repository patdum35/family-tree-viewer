/**
 * Module pour gérer l'affichage de la caméra en arrière-plan (Réalité Augmentée).
 */
const CameraManager = (function() {
    let videoElement = null;
    let stream = null;
    let isRunning = false;

    function createVideoElement() {
        const vid = document.createElement('video');
        vid.id = 'camera-feed';
        vid.autoplay = true;
        vid.playsInline = true; // Nécessaire pour iOS pour ne pas passer en plein écran natif
        vid.muted = true;
        
        // Style pour placer la vidéo en fond absolu
        vid.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            z-index: -100; /* Derrière tout le reste */
        `;
        return vid;
    }

    async function start() {
        if (isRunning) return;

        try {
            // Contraintes pour demander la caméra arrière (environnement)
            const constraints = {
                video: {
                    facingMode: 'environment'
                },
                audio: false
            };
            
            stream = await navigator.mediaDevices.getUserMedia(constraints);
            
            videoElement = createVideoElement();
            videoElement.srcObject = stream;
            
            // Insérer au tout début du body
            document.body.insertBefore(videoElement, document.body.firstChild);
            
            // --- Gestion de la transparence ---
            // Masquer les fonds d'écran existants pour voir la caméra
            document.body.classList.add('camera-active');
            
            // Masquer spécifiquement le conteneur de fond d'image
            const bgContainer = document.querySelector('.background-container');
            if (bgContainer) bgContainer.style.display = 'none';

            isRunning = true;
            console.log("🎥 Caméra activée en arrière-plan");

        } catch (err) {
            console.error("Erreur d'accès à la caméra:", err);
            alert("Impossible d'accéder à la caméra. Vérifiez les permissions (HTTPS requis).");
        }
    }

    function stop() {
        if (!isRunning) return;

        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }

        if (videoElement) {
            videoElement.remove();
            videoElement = null;
        }

        // Restaurer les fonds
        document.body.classList.remove('camera-active');
        const bgContainer = document.querySelector('.background-container');
        if (bgContainer) bgContainer.style.display = '';

        isRunning = false;
        console.log("🎥 Caméra désactivée");
    }

    return {
        toggle: () => isRunning ? stop() : start(),
        isActive: () => isRunning
    };
})();

// Export pour utilisation externe
export function toggleCamera() {
    CameraManager.toggle();
}