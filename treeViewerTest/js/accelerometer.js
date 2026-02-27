import { makeModalDraggableAndResizable, makeModalInteractive } from './resizableModalUtils.js';
import { getZoom } from './treeRenderer.js';
// accelerometer.js est importé dynamiquement dans appInitializer.js si on clique sur le bouton 🧭 Activer l'accéléromètre
// donc pas de problème de lightHouse score au démarrage

/**
 * Module pour afficher les données de l'accéléromètre en temps réel.
 */
const AccelerometerUI = (function() {
    let overlay = null;
    let isRunning = false;
    let isScrollActive = false; // État du mode scroll
    let neutralPitch = 0; // Position neutre (calibrage)
    let neutralRoll = 0;
    let currentPitch = 0;
    let currentRoll = 0;

    // Création de l'interface utilisateur
    function createUI() {
        const overlayId = 'accel-overlay';
        if (document.getElementById(overlayId)) return document.getElementById(overlayId);

        const overlayDiv = document.createElement('div');
        overlayDiv.id = overlayId;
        
        // Styles pour la fenêtre flottante
        overlayDiv.style.cssText = `
            position: fixed; 
            top: 60px; 
            right: 10px; 
            width: 260px; 
            background: rgba(255, 255, 255, 0.95); 
            border: 1px solid #ccc; 
            padding: 0; 
            z-index: 11000; 
            border-radius: 8px; 
            font-family: sans-serif; 
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            display: flex;
            flex-direction: column;
        `;

        overlayDiv.innerHTML = `
            <div id="accel-header" style="
                padding: 10px; 
                background: #e9ecef; 
                border-bottom: 1px solid #ddd; 
                border-radius: 8px 8px 0 0; 
                cursor: move; 
                font-weight: bold; 
                display: flex; 
                justify-content: space-between; 
                align-items: center;">
                <span>📊 Accéléromètre</span>
                <button id="close-accel" style="border: none; background: transparent; cursor: pointer; font-size: 1.2em;">&times;</button>
            </div>
            <div id="accel-data" style="padding: 15px; font-size: 0.95em; line-height: 1.6;">
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid #eee;"><span>Axe X :</span> <span id="accel-x" style="font-family:monospace; font-weight:bold; color:#007bff">0.00</span></div>
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid #eee;"><span>Axe Y :</span> <span id="accel-y" style="font-family:monospace; font-weight:bold; color:#28a745">0.00</span></div>
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid #eee;"><span>Axe Z :</span> <span id="accel-z" style="font-family:monospace; font-weight:bold; color:#dc3545">0.00</span></div>
                <div style="margin-top:10px; border-top: 1px solid #ddd; padding-top:5px; font-weight:bold; color:#555;">Inclinaison (Rotation)</div>
                <div style="display:flex; justify-content:space-between;"><span>Pitch (Av/Ar) :</span> <span id="accel-pitch" style="font-family:monospace; font-weight:bold;">0°</span></div>
                <div style="display:flex; justify-content:space-between;"><span>Roll (G/D) :</span> <span id="accel-roll" style="font-family:monospace; font-weight:bold;">0°</span></div>
                
                <button id="accel-calibrate" style="margin-top:10px; width:100%; padding:6px; background:#f8f9fa; border:1px solid #ccc; border-radius:4px; cursor:pointer; font-weight:bold; font-size:0.9em;">🎯 Calibrer le zéro</button>
                <div style="margin-top:15px; padding-top:10px; border-top:1px solid #eee; display:flex; align-items:center;">
                    <input type="checkbox" id="accel-scroll-toggle" style="margin-right:8px; transform:scale(1.2);">
                    <label for="accel-scroll-toggle" style="cursor:pointer; font-weight:bold; color:#333;">Activer Scroll par inclinaison</label>
                </div>
                <div style="margin-top:10px; font-size: 0.8em; color: #666; text-align:right;">Intervalle: <span id="accel-interval">0</span> ms</div>
            </div>
        `;

        document.body.appendChild(overlayDiv);

        // Gestionnaire de fermeture
        overlayDiv.querySelector('#close-accel').addEventListener('click', hideUI);
        
        // Gestionnaire du toggle Scroll
        const toggle = overlayDiv.querySelector('#accel-scroll-toggle');
        toggle.addEventListener('change', (e) => {
            isScrollActive = e.target.checked;
            if (isScrollActive) {
                calibrate(); // Calibrer automatiquement à l'activation
            }
        });

        overlayDiv.querySelector('#accel-calibrate').addEventListener('click', () => {
            calibrate();
        });

        // Rendre la fenêtre déplaçable (utilise vos utilitaires existants)
        try {
            const header = overlayDiv.querySelector('#accel-header');
            makeModalDraggableAndResizable(overlayDiv, header, false);
            makeModalInteractive(overlayDiv);
        } catch (e) {
            console.warn("Erreur lors de l'initialisation du drag & drop pour l'accéléromètre", e);
        }

        return overlayDiv;
    }

    function calibrate() {
        neutralPitch = currentPitch;
        neutralRoll = currentRoll;
        const btn = document.getElementById('accel-calibrate');
        if (btn) {
            const originalText = btn.textContent;
            btn.textContent = "✅ Calibré !";
            setTimeout(() => btn.textContent = originalText, 1000);
        }
    }

    // Fonction appelée à chaque mouvement détecté
    function handleMotion(event) {
        // accelerationIncludingGravity inclut la gravité terrestre (environ 9.81 m/s² sur l'axe Z au repos à plat)
        const acc = event.accelerationIncludingGravity;
        if (!acc) return;

        const elX = document.getElementById('accel-x');
        const elY = document.getElementById('accel-y');
        const elZ = document.getElementById('accel-z');
        const elInt = document.getElementById('accel-interval');
        const elPitch = document.getElementById('accel-pitch');
        const elRoll = document.getElementById('accel-roll');

        const x = acc.x || 0;
        const y = acc.y || 0;
        const z = acc.z || 0;

        if (elX) elX.textContent = x.toFixed(2);
        if (elY) elY.textContent = y.toFixed(2);
        if (elZ) elZ.textContent = z.toFixed(2);
        if (elInt) elInt.textContent = event.interval ? event.interval.toFixed(1) : '-';

        // Calcul de l'inclinaison (en degrés)
        // Pitch : Rotation autour de l'axe X (Inclinaison avant/arrière)
        // Utilisation de atan2(y, z) pour gérer correctement la position verticale (90°) et au-delà
        const pitch = Math.atan2(y, z) * (180/Math.PI);
        // Roll : Rotation autour de l'axe Y (Inclinaison gauche/droite)
        const roll = Math.atan2(-x, Math.sqrt(y*y + z*z)) * (180/Math.PI);

        currentPitch = pitch;
        currentRoll = roll;

        if (elPitch) elPitch.textContent = pitch.toFixed(0) + '°';
        if (elRoll) elRoll.textContent = roll.toFixed(0) + '°';

        // --- LOGIQUE DE SCROLL ---
        if (isScrollActive) {
            applyScrollFromTilt(pitch, roll); // On passe les valeurs brutes, le delta est calculé dedans
        }
    }

    function applyScrollFromTilt(pitch, roll) {
        // Configuration
        const deadZone = 5; // Augmenté pour réduire la sensibilité (était 3)
        const speedFactor = 0.8; // Réduit pour ralentir le mouvement (était 2)

        let scrollX = 0;
        let scrollY = 0;
        
        // Calcul des deltas par rapport à la position neutre (calibrée)
        const deltaPitch = pitch - neutralPitch;
        const deltaRoll = roll - neutralRoll;

        // Gestion Axe X (Roll - Gauche/Droite)
        // Roll positif = penché à droite -> on veut scroller vers la droite
        if (Math.abs(deltaRoll) > deadZone) {
            scrollX = (deltaRoll - (Math.sign(deltaRoll) * deadZone)) * speedFactor;
        }

        // Gestion Axe Y (Pitch - Haut/Bas)
        // Pitch négatif = penché vers l'avant (haut du tel descend) -> on veut descendre (scroll positif)
        // Note : Le sens peut varier selon la position tenue, ici on inverse pour un effet "naturel"
        if (Math.abs(deltaPitch) > deadZone) {
            // On inverse le pitch pour que "pencher en avant" = "descendre dans la page"
            scrollY = -(deltaPitch - (Math.sign(deltaPitch) * deadZone)) * speedFactor;
        }

        if (scrollX !== 0 || scrollY !== 0) {
            // Essayer de déplacer l'arbre D3 (priorité)
            if (typeof d3 !== 'undefined') {
                const svg = d3.select("#tree-svg");
                const zoom = getZoom();
                
                if (!svg.empty() && zoom) {
                    // On inverse les signes (-) car :
                    // Pour aller à droite (caméra), on doit pousser le contenu vers la gauche.
                    // scrollX > 0 (Tilt Droite) => translateBy(-X) => Contenu va à gauche => Effet "Voler vers la droite"
                    zoom.translateBy(svg, -scrollX, -scrollY);
                    return;
                }
            }

            // Fallback : Scroll natif de la fenêtre (si l'arbre n'est pas là)
            window.scrollBy({ left: scrollX, top: scrollY, behavior: 'auto' });
        }
    }

    function showUI() {
        overlay = createUI();
        overlay.style.display = 'flex';
        
        if (!isRunning) {
            // Sur iOS 13+, une demande de permission est nécessaire (doit être déclenchée par un clic utilisateur)
            if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
                DeviceMotionEvent.requestPermission()
                    .then(response => {
                        if (response === 'granted') {
                            window.addEventListener('devicemotion', handleMotion);
                            isRunning = true;
                        } else {
                            alert("Permission refusée pour l'accéléromètre.");
                        }
                    })
                    .catch(console.error);
            } else {
                // Android / Navigateurs standards
                window.addEventListener('devicemotion', handleMotion);
                isRunning = true;
            }
        }
    }

    function hideUI() {
        if (overlay) overlay.style.display = 'none';
        window.removeEventListener('devicemotion', handleMotion);
        isRunning = false;
    }

    return {
        show: showUI,
        hide: hideUI,
        toggle: () => isRunning ? hideUI() : showUI()
    };
})();

// Export de la fonction pour l'utiliser ailleurs (ex: main.js)
export function toggleAccelerometer() {
    AccelerometerUI.toggle();
}