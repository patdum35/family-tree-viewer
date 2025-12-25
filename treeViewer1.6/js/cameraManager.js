import { makeModalDraggableAndResizable, makeModalInteractive } from './resizableModalUtils.js';


/**
 * Module pour gérer l'affichage de la caméra en arrière-plan (Réalité Augmentée).
 */
const CameraManager = (function() {
    let videoElement = null;
    let stream = null;
    let isRunning = false;
    let isMotionDetectionEnabled = false; // Par défaut désactivé
    let currentFacingMode = 'environment'; // 'environment' (arrière) ou 'user' (avant)
    
    // --- NOUVEAU : Détection d'objets (IA) ---
    let isObjectDetectionEnabled = false;
    let objectCanvas = null;
    let objectCtx = null;
    let detector = null;
    let detectionAnimationFrame = null;
    let isModelLoading = false;
    
    // --- NOUVEAU : Gestion des filtres ---
    let currentFilterIndex = 0;
    const filters = [
        { name: 'Normal', value: 'none' },
        { name: 'Sépia (Ancien)', value: 'sepia(0.8) contrast(1.1)' },
        { name: 'Noir & Blanc', value: 'grayscale(1) contrast(1.2)' },
        { name: 'Négatif', value: 'invert(1)' },
        { name: 'Cyber', value: 'hue-rotate(90deg) contrast(1.5)' },
        { name: 'Fantôme', value: 'opacity(0.5) blur(2px)' },
        { name: 'Contours', value: 'url(#filter-edge)' },
        { name: 'Crayon', value: 'url(#filter-sketch)' },
        { name: 'Relief', value: 'url(#filter-emboss) grayscale(1)' },
        { name: 'Netteté', value: 'url(#filter-sharpen)' }
    ];

    // --- NOUVEAU : Détection de mouvement ---
    let motionCanvas = null;
    let motionCtx = null;
    let lastFrameData = null;
    let motionInterval = null;

    // --- NOUVEAU : Injection des filtres SVG ---
    function injectSVGFilters() {
        if (document.getElementById('camera-svg-filters')) return;

        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.id = 'camera-svg-filters';
        svg.style.position = 'absolute';
        svg.style.width = '0';
        svg.style.height = '0';
        svg.style.pointerEvents = 'none';

        // 1. Détection de contours (Edge Detection)
        const filterEdge = document.createElementNS(svgNS, "filter");
        filterEdge.id = "filter-edge";
        const feColorMatrixEdge = document.createElementNS(svgNS, "feColorMatrix");
        feColorMatrixEdge.setAttribute("type", "matrix");
        feColorMatrixEdge.setAttribute("values", "0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 1 0");
        filterEdge.appendChild(feColorMatrixEdge);
        const feConvolveEdge = document.createElementNS(svgNS, "feConvolveMatrix");
        feConvolveEdge.setAttribute("order", "3");
        feConvolveEdge.setAttribute("kernelMatrix", "-1 -1 -1 -1 8 -1 -1 -1 -1");
        feConvolveEdge.setAttribute("preserveAlpha", "true");
        filterEdge.appendChild(feConvolveEdge);
        svg.appendChild(filterEdge);

        // 2. Crayon (Sketch) - Contours inversés
        const filterSketch = document.createElementNS(svgNS, "filter");
        filterSketch.id = "filter-sketch";
        const feColorMatrixSketch = document.createElementNS(svgNS, "feColorMatrix");
        feColorMatrixSketch.setAttribute("type", "matrix");
        feColorMatrixSketch.setAttribute("values", "0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 1 0");
        filterSketch.appendChild(feColorMatrixSketch);
        const feConvolveSketch = document.createElementNS(svgNS, "feConvolveMatrix");
        feConvolveSketch.setAttribute("order", "3");
        feConvolveSketch.setAttribute("kernelMatrix", "-1 -1 -1 -1 8 -1 -1 -1 -1");
        feConvolveSketch.setAttribute("preserveAlpha", "true");
        filterSketch.appendChild(feConvolveSketch);
        const feCompSketch = document.createElementNS(svgNS, "feComponentTransfer");
        const feFuncRSketch = document.createElementNS(svgNS, "feFuncR");
        feFuncRSketch.setAttribute("type", "table");
        feFuncRSketch.setAttribute("tableValues", "1 0");
        const feFuncGSketch = document.createElementNS(svgNS, "feFuncG");
        feFuncGSketch.setAttribute("type", "table");
        feFuncGSketch.setAttribute("tableValues", "1 0");
        const feFuncBSketch = document.createElementNS(svgNS, "feFuncB");
        feFuncBSketch.setAttribute("type", "table");
        feFuncBSketch.setAttribute("tableValues", "1 0");
        feCompSketch.appendChild(feFuncRSketch);
        feCompSketch.appendChild(feFuncGSketch);
        feCompSketch.appendChild(feFuncBSketch);
        filterSketch.appendChild(feCompSketch);
        svg.appendChild(filterSketch);

        // 3. Relief (Emboss)
        const filterEmboss = document.createElementNS(svgNS, "filter");
        filterEmboss.id = "filter-emboss";
        const feConvolveEmboss = document.createElementNS(svgNS, "feConvolveMatrix");
        feConvolveEmboss.setAttribute("order", "3");
        feConvolveEmboss.setAttribute("kernelMatrix", "-2 -1 0 -1 1 1 0 1 2");
        feConvolveEmboss.setAttribute("preserveAlpha", "true");
        filterEmboss.appendChild(feConvolveEmboss);
        svg.appendChild(filterEmboss);

        // 4. Netteté (Sharpen)
        const filterSharpen = document.createElementNS(svgNS, "filter");
        filterSharpen.id = "filter-sharpen";
        const feConvolveSharpen = document.createElementNS(svgNS, "feConvolveMatrix");
        feConvolveSharpen.setAttribute("order", "3");
        feConvolveSharpen.setAttribute("kernelMatrix", "0 -1 0 -1 5 -1 0 -1 0");
        feConvolveSharpen.setAttribute("preserveAlpha", "true");
        filterSharpen.appendChild(feConvolveSharpen);
        svg.appendChild(filterSharpen);

        document.body.appendChild(svg);
    }

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
            transition: filter 0.5s ease; /* Transition douce pour les filtres */
        `;
        return vid;
    }

    async function start() {
        if (isRunning) return;

        injectSVGFilters();

        try {
            // Contraintes pour demander la caméra arrière (environnement)
            const constraints = {
                video: {
                    facingMode: currentFacingMode
                },
                audio: false
            };
            
            stream = await navigator.mediaDevices.getUserMedia(constraints);
            
            videoElement = createVideoElement();
            videoElement.srcObject = stream;
            
            // Effet miroir pour la caméra avant
            if (currentFacingMode === 'user') {
                videoElement.style.transform = 'scaleX(-1)';
            }
            
            // Insérer au tout début du body
            document.body.insertBefore(videoElement, document.body.firstChild);
            
            // --- Gestion de la transparence ---
            // Masquer les fonds d'écran existants pour voir la caméra
            document.body.classList.add('camera-active');
            
            // Masquer spécifiquement le conteneur de fond d'image
            const bgContainer = document.querySelector('.background-container');
            if (bgContainer) bgContainer.style.display = 'none';

            // Démarrer la détection de mouvement
            if (isMotionDetectionEnabled) {
                startMotionDetection();
            }
            if (isObjectDetectionEnabled) {
                startObjectDetection();
            }

            isRunning = true;
            console.log("🎥 Caméra activée en arrière-plan");
            updateModalUI();

        } catch (err) {
            console.error("Erreur d'accès à la caméra:", err);
            alert("Impossible d'accéder à la caméra. Vérifiez les permissions (HTTPS requis).");
        }
    }

    function stop() {
        if (!isRunning) return;

        stopMotionDetection();
        stopObjectDetection();

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
        updateModalUI();
    }

    async function switchCamera() {
        // Animation du bouton
        const btn = document.getElementById('camera-switch-btn');
        if (btn) {
            btn.style.transform = 'rotate(180deg)';
            setTimeout(() => btn.style.transform = 'rotate(0deg)', 300);
        }

        currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
        
        if (isRunning) {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            
            try {
                const constraints = { video: { facingMode: currentFacingMode }, audio: false };
                stream = await navigator.mediaDevices.getUserMedia(constraints);
                
                if (videoElement) {
                    videoElement.srcObject = stream;
                    const transform = currentFacingMode === 'user' ? 'scaleX(-1)' : 'none';
                    videoElement.style.transform = transform;
                    if (objectCanvas) {
                        objectCanvas.style.transform = 'none';
                    }
                }
            } catch (err) {
                console.error("Erreur changement caméra:", err);
                alert("Impossible de changer de caméra.");
            }
        }
        updateModalUI();
    }

    // --- Fonctions de Filtres ---
    function cycleFilter() {
        if (!videoElement) return;
        currentFilterIndex = (currentFilterIndex + 1) % filters.length;
        const filter = filters[currentFilterIndex];
        videoElement.style.filter = filter.value;
        
        if (window.showToast) {
            window.showToast(`Filtre caméra : ${filter.name}`);
        }
        updateModalUI();
    }

    function setFilter(index) {
        if (index >= 0 && index < filters.length) {
            currentFilterIndex = index - 1; // cycleFilter fait +1
            cycleFilter();
        }
    }

    // --- Fonctions de Détection de Mouvement ---
    function startMotionDetection() {
        motionCanvas = document.createElement('canvas');
        motionCanvas.width = 32; // Très petite résolution pour la perf
        motionCanvas.height = 24;
        motionCtx = motionCanvas.getContext('2d');
        
        // Vérifier le mouvement 5 fois par seconde
        motionInterval = setInterval(checkMotion, 200);
    }

    function stopMotionDetection() {
        if (motionInterval) clearInterval(motionInterval);
        motionCanvas = null;
        motionCtx = null;
        lastFrameData = null;
    }

    function checkMotion() {
        if (!videoElement || !motionCtx || videoElement.paused || videoElement.ended) return;

        // Dessiner la frame actuelle en tout petit
        motionCtx.drawImage(videoElement, 0, 0, 32, 24);
        
        // Récupérer les données de pixels
        const frameData = motionCtx.getImageData(0, 0, 32, 24).data;
        
        if (lastFrameData) {
            let diff = 0;
            // Comparer avec la frame précédente (échantillonnage)
            for (let i = 0; i < frameData.length; i += 4 * 4) { // Un pixel sur 4
                const rDiff = Math.abs(frameData[i] - lastFrameData[i]);
                const gDiff = Math.abs(frameData[i+1] - lastFrameData[i+1]);
                const bDiff = Math.abs(frameData[i+2] - lastFrameData[i+2]);
                diff += rDiff + gDiff + bDiff;
            }
            
            // Seuil de détection
            if (diff > 3000) {
                // Mouvement détecté !
                // On pourrait déclencher des actions ici (ex: faire bouger les feuilles de l'arbre)
                // console.log("Mouvement caméra détecté !", diff);
                
                // Exemple : Dispatcher un événement que d'autres modules peuvent écouter
                document.dispatchEvent(new CustomEvent('cameraMotion', { detail: { intensity: diff } }));
            }

            // Mise à jour de la barre de mouvement dans la modal si elle est ouverte
            const motionBar = document.getElementById('camera-motion-level');
            if (motionBar) {
                // Normaliser un peu pour l'affichage (0-100%)
                const percentage = Math.min(100, (diff / 10000) * 100);
                motionBar.style.width = `${percentage}%`;
                motionBar.style.backgroundColor = diff > 3000 ? '#ff4444' : '#4CAF50';
            }
        }
        
        lastFrameData = frameData;
    }

    function toggleMotionDetection(forceState = null) {
        isMotionDetectionEnabled = forceState !== null ? forceState : !isMotionDetectionEnabled;
        
        if (isRunning) {
            if (isMotionDetectionEnabled) startMotionDetection();
            else stopMotionDetection();
        }
        updateModalUI();
    }

    // --- Fonctions de Détection d'Objets (IA) ---
    
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            const s = document.createElement('script');
            s.src = src;
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });
    }

    async function loadODLibrary() {
        if (detector) return true;
        if (isModelLoading) return false;
        
        isModelLoading = true;
        updateModalUI();

        try {
            // Chargement dynamique de TensorFlow.js et COCO-SSD
            if (!window.tf) {
                await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs');
            }
            if (!window.cocoSsd) {
                await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd');
            }
            
            console.log("Chargement du modèle COCO-SSD...");
            detector = await window.cocoSsd.load();
            console.log("Modèle chargé !");
            
            isModelLoading = false;
            updateModalUI();
            return true;
        } catch (e) {
            console.error("Erreur chargement IA:", e);
            isModelLoading = false;
            updateModalUI();
            if (!navigator.onLine) {
                alert("Le modèle de détection d'objets n'est pas encore en cache. Une connexion Internet est requise pour le premier téléchargement.");
            } else {
                alert("Impossible de charger le modèle de détection d'objets. Vérifiez votre connexion Internet.");
            }
            return false;
        }
    }

    async function startObjectDetection() {
        if (!detector) {
            const loaded = await loadODLibrary();
            if (!loaded) return;
        }
        
        if (!objectCanvas) {
            objectCanvas = document.createElement('canvas');
            objectCanvas.id = 'object-detection-canvas';
            objectCanvas.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: -99; /* Devant la vidéo (-100) mais derrière l'interface */
            `;
            // Insérer après la vidéo
            if (videoElement && videoElement.parentNode) {
                videoElement.parentNode.insertBefore(objectCanvas, videoElement.nextSibling);
            } else {
                document.body.appendChild(objectCanvas);
            }
            objectCtx = objectCanvas.getContext('2d');
            
            if (currentFacingMode === 'user') {
                objectCanvas.style.transform = 'none';
            }
        }
        objectCanvas.style.display = 'block';
        detectLoop();
    }

    function stopObjectDetection() {
        if (detectionAnimationFrame) {
            cancelAnimationFrame(detectionAnimationFrame);
            detectionAnimationFrame = null;
        }
        if (objectCanvas) {
            objectCtx.clearRect(0, 0, objectCanvas.width, objectCanvas.height);
            objectCanvas.style.display = 'none';
        }
    }

    async function detectLoop() {
        if (!isObjectDetectionEnabled || !videoElement || videoElement.paused || videoElement.ended) return;

        // Ajuster la taille du canvas si la fenêtre change
        if (objectCanvas.width !== window.innerWidth || objectCanvas.height !== window.innerHeight) {
            objectCanvas.width = window.innerWidth;
            objectCanvas.height = window.innerHeight;
        }

        try {
            const predictions = await detector.detect(videoElement);
            
            objectCtx.clearRect(0, 0, objectCanvas.width, objectCanvas.height);
            
            // Calculer l'échelle pour object-fit: cover
            const videoWidth = videoElement.videoWidth;
            const videoHeight = videoElement.videoHeight;
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            
            if (videoWidth === 0 || videoHeight === 0) {
                 detectionAnimationFrame = requestAnimationFrame(detectLoop);
                 return;
            }

            const scale = Math.max(screenWidth / videoWidth, screenHeight / videoHeight);
            const scaledWidth = videoWidth * scale;
            const scaledHeight = videoHeight * scale;
            const offsetX = (screenWidth - scaledWidth) / 2;
            const offsetY = (screenHeight - scaledHeight) / 2;

            objectCtx.lineWidth = 3;
            objectCtx.font = 'bold 16px Arial';

            predictions.forEach(prediction => {
                const [x, y, width, height] = prediction.bbox;
                
                // Transformer les coordonnées vidéo -> écran
                let drawX = x * scale + offsetX;
                const drawY = y * scale + offsetY;
                const drawWidth = width * scale;
                const drawHeight = height * scale;

                // MIROIR : Si caméra avant, inverser les coordonnées X pour que le cadre suive la vidéo inversée
                // mais que le texte reste lisible (car le canvas n'est pas inversé CSS)
                if (currentFacingMode === 'user') {
                    drawX = screenWidth - drawX - drawWidth;
                }

                // Couleur Cyan futuriste
                const color = '#00FFFF';
                objectCtx.strokeStyle = color;
                objectCtx.fillStyle = color;
                
                // Dessiner le cadre
                objectCtx.beginPath();
                if (objectCtx.roundRect) {
                    objectCtx.roundRect(drawX, drawY, drawWidth, drawHeight, 5);
                } else {
                    objectCtx.rect(drawX, drawY, drawWidth, drawHeight);
                }
                objectCtx.stroke();

                // Dessiner le label
                const text = `${prediction.class} ${Math.round(prediction.score * 100)}%`;
                const textWidth = objectCtx.measureText(text).width;
                
                // Fond du texte
                objectCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                objectCtx.fillRect(drawX, drawY > 25 ? drawY - 25 : drawY, textWidth + 10, 25);
                
                // Texte
                objectCtx.fillStyle = color;
                objectCtx.fillText(text, drawX + 5, drawY > 25 ? drawY - 7 : drawY + 18);
            });

        } catch (e) {
            console.warn("Erreur détection:", e);
        }

        detectionAnimationFrame = requestAnimationFrame(detectLoop);
    }

    function toggleObjectDetection(forceState = null) {
        const newState = forceState !== null ? forceState : !isObjectDetectionEnabled;
        
        if (newState && !detector) {
            // Charger le modèle si nécessaire
            loadODLibrary().then(success => {
                if (success) {
                    isObjectDetectionEnabled = true;
                    if (isRunning) startObjectDetection();
                    updateModalUI();
                }
            });
            return; // On attend le chargement
        }

        isObjectDetectionEnabled = newState;
        
        if (isRunning) {
            if (isObjectDetectionEnabled) startObjectDetection();
            else stopObjectDetection();
        }
        updateModalUI();
    }

    // --- GESTION DE LA MODAL ---
    function createModal() {
        if (document.getElementById('camera-modal')) return;

        const modalDiv = document.createElement('div');
        modalDiv.id = 'camera-modal';
        
        // Styles pour la fenêtre flottante non bloquante
        modalDiv.style.cssText = `
            display: none;
            position: fixed;
            top: 80px;
            right: 20px;
            width: 300px;
            background-color: rgba(255, 255, 255, 0.95);
            border-radius: 15px;
            font-family: sans-serif;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            z-index: 11000;
            border: 1px solid #ccc;
            flex-direction: column;
        `;

        const headerHTML = `
            <div id="camera-modal-header" style="
                padding: 15px;
                background: #e9ecef;
                border-bottom: 1px solid #ddd;
                border-radius: 15px 15px 0 0;
                cursor: move;
                display: flex;
                justify-content: space-between;
                align-items: center;">
                <h3 style="margin: 0; font-size: 16px; color: #333;">🎥 Caméra & AR</h3>
                <span id="camera-modal-close" style="font-size: 24px; cursor: pointer; color: #666; line-height: 1;">&times;</span>
            </div>
        `;

        const contentHTML = `
            <div style="padding: 20px; overflow-y: auto; max-height: 70vh;">
                <!-- Contrôle Principal -->
                <div style="margin-bottom: 20px; text-align: center; display: flex; gap: 10px; align-items: center;">
                        <button id="camera-toggle-btn" style="padding: 12px 10px; border-radius: 25px; border: none; cursor: pointer; font-weight: bold; font-size: 16px; flex-grow: 1; transition: all 0.3s;">
                            Démarrer la Caméra
                        </button>
                        <button id="camera-switch-btn" style="width: 45px; height: 45px; border-radius: 50%; border: 1px solid #ddd; cursor: pointer; font-size: 20px; background-color: #f9f9f9; display: flex; align-items: center; justify-content: center; transition: all 0.3s;" title="Changer de caméra">
                            🔄
                        </button>
                    </div>

                    <!-- Sélection Filtre -->
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #555; font-size: 13px;">Filtre Visuel</label>
                        <select id="camera-filter-select" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #ddd; background-color: #f9f9f9; font-size: 13px;">
                            ${filters.map((f, i) => `<option value="${i}">${f.name}</option>`).join('')}
                        </select>
                    </div>

                    <!-- Détection Mouvement -->
                    <div style="margin-bottom: 10px; background: #f5f5f5; padding: 10px; border-radius: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <label style="font-weight: bold; color: #555; font-size: 13px;">Détection Mouvement</label>
                            <label class="switch" style="position: relative; display: inline-block; width: 36px; height: 18px;">
                                <input type="checkbox" id="motion-toggle-cb" style="opacity: 0; width: 0; height: 0;">
                                <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 20px;" class="slider"></span>
                                <span style="position: absolute; content: ''; height: 14px; width: 14px; left: 2px; bottom: 2px; background-color: white; transition: .4s; border-radius: 50%;" class="slider-knob"></span>
                            </label>
                        </div>
                        
                        <!-- Barre de niveau -->
                        <div style="height: 6px; background-color: #e0e0e0; border-radius: 3px; overflow: hidden;">
                            <div id="camera-motion-level" style="height: 100%; width: 0%; background-color: #4CAF50; transition: width 0.1s ease-out;"></div>
                        </div>
                        <div style="text-align: right; font-size: 10px; color: #999; margin-top: 2px;">Intensité</div>
                    </div>

                    <!-- Détection Objets (IA) -->
                    <div style="margin-bottom: 10px; background: #f5f5f5; padding: 10px; border-radius: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <label style="font-weight: bold; color: #555; font-size: 13px;">Détection Objets (IA)</label>
                            <label class="switch" style="position: relative; display: inline-block; width: 36px; height: 18px;">
                                <input type="checkbox" id="object-toggle-cb" style="opacity: 0; width: 0; height: 0;">
                                <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 20px;" class="slider"></span>
                                <span style="position: absolute; content: ''; height: 14px; width: 14px; left: 2px; bottom: 2px; background-color: white; transition: .4s; border-radius: 50%;" class="slider-knob"></span>
                            </label>
                        </div>
                        <div id="object-status" style="font-size: 10px; color: #999; margin-top: 5px; text-align: right;">Désactivé</div>
                    </div>
                </div>
            <style>
                #motion-toggle-cb:checked + .slider { background-color: #2196F3; }
                #motion-toggle-cb:checked ~ .slider-knob { transform: translateX(18px); }
                #object-toggle-cb:checked + .slider { background-color: #9C27B0; }
                #object-toggle-cb:checked ~ .slider-knob { transform: translateX(18px); }
            </style>
        `;
        
        modalDiv.innerHTML = headerHTML + contentHTML;
        document.body.appendChild(modalDiv);

        // Event Listeners
        document.getElementById('camera-modal-close').onclick = closeModal;
        
        document.getElementById('camera-toggle-btn').onclick = () => isRunning ? stop() : start();
        document.getElementById('camera-switch-btn').onclick = switchCamera;
        
        document.getElementById('camera-filter-select').onchange = (e) => {
            setFilter(parseInt(e.target.value));
        };

        document.getElementById('motion-toggle-cb').onchange = (e) => {
            toggleMotionDetection(e.target.checked);
        };

        document.getElementById('object-toggle-cb').onchange = (e) => {
            toggleObjectDetection(e.target.checked);
        };

        // Rendre la fenêtre déplaçable et redimensionnable
        const header = document.getElementById('camera-modal-header');
        makeModalDraggableAndResizable(modalDiv, header, false);
        makeModalInteractive(modalDiv);
    }

    function updateModalUI() {
        const btn = document.getElementById('camera-toggle-btn');
        const select = document.getElementById('camera-filter-select');
        const motionCb = document.getElementById('motion-toggle-cb');
        const objectCb = document.getElementById('object-toggle-cb');
        const objectStatus = document.getElementById('object-status');
        
        if (!btn) return;

        if (isRunning) {
            btn.textContent = "Arrêter la Caméra";
            btn.style.backgroundColor = "#ff4444";
            btn.style.color = "white";
        } else {
            btn.textContent = "Démarrer la Caméra";
            btn.style.backgroundColor = "#4CAF50";
            btn.style.color = "white";
        }

        select.value = currentFilterIndex;
        motionCb.checked = isMotionDetectionEnabled;
        objectCb.checked = isObjectDetectionEnabled;

        if (isModelLoading) {
            objectStatus.textContent = "Chargement du modèle...";
            objectStatus.style.color = "#FF9800";
            objectCb.disabled = true;
        } else {
            objectStatus.textContent = isObjectDetectionEnabled ? "Activé (COCO-SSD)" : "Désactivé";
            objectStatus.style.color = isObjectDetectionEnabled ? "#4CAF50" : "#999";
            objectCb.disabled = false;
        }
    }

    function openModal() {
        createModal();
        document.getElementById('camera-modal').style.display = 'flex';
        updateModalUI();
    }

    function closeModal() {
        const modal = document.getElementById('camera-modal');
        if (modal) modal.style.display = 'none';
    }

    return {
        toggle: () => isRunning ? stop() : start(),
        isActive: () => isRunning,
        cycleFilter: cycleFilter,
        openModal: openModal
    };
})();

// Export pour utilisation externe
export function toggleCamera() {
    CameraManager.toggle();
}

export function cycleCameraFilter() {
    CameraManager.cycleFilter();
}

export function openCameraModal() {
    CameraManager.openModal();
}