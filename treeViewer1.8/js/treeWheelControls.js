// ====================================
// Contrôles pour le mode éventail 360°
// ====================================
import { state } from './main.js';
// import { changeTreeMode } from './treeRenderer.js';
import { resetWheelView } from './treeWheelRenderer.js';
import { exportToPNG, exportToPDF, exportWithOptions, exportVisibleArea } from './exportManager.js';


/**
 * Initialise les contrôles pour le mode éventail
 */
export function initializeWheelControls() {
    createWheelControlPanel();
    setupWheelEventListeners();
}

/**
 * Crée le panneau de contrôles pour l'éventail
 */
function createWheelControlPanel() {
    // Supprimer l'ancien panneau s'il existe
    const existingPanel = document.getElementById('Wheel-controls-panel');
    if (existingPanel) {
        existingPanel.remove();
    }

    // Créer le nouveau panneau
    const controlPanel = document.createElement('div');
    controlPanel.id = 'Wheel-controls-panel';
    controlPanel.innerHTML = `
        <div class="Wheel-controls">
            <button id="Wheel-controls-close" class="close-btn" title="Fermer">×</button>
            <h4>🌟 Mode radar / Éventail 360°</h4>
            

            <!-- Export -->
            <div class="control-group">
                <label>Export :</label>
                <div class="export-buttons">
                    <button id="Wheel-export-png">📷 PNG</button>
                    <button id="Wheel-export-pdf">📄 PDF</button>
                    <button id="Wheel-export-options">⚙️ Options</button>
                </div>
            </div>
        </div>
    `;




    // Ajouter les styles CSS
    const styles = `
        <style>
        #Wheel-controls-panel {
            position: fixed;
            top: 20px;
            left: 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            padding: 20px;
            max-width: 300px;
            z-index: 1000;
            font-family: Arial, sans-serif;
            border: 2px solid #007bff;
            animation: slideInLeft 0.3s ease-out;
        }

        .close-btn {
            position: absolute;
            top: 8px;
            right: 8px;
            width: 24px;
            height: 24px;
            border: none;
            background: #dc3545;
            color: white;
            border-radius: 50%;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            line-height: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            z-index: 1001;
        }

        .close-btn:hover {
            background: #c82333;
            transform: scale(1.1);
        }

        .close-btn:active {
            transform: scale(0.95);
        }

        .Wheel-controls h4 {
            margin: 0 0 15px 0;
            color: #007bff;
            font-size: 16px;
            text-align: center;
        }

        .control-group {
            margin-bottom: 15px;
        }

        .control-group:last-child {
            margin-bottom: 0;
        }

        .control-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #555;
            font-size: 12px;
        }

        .export-buttons {
            display: flex;
            gap: 5px;
            flex-wrap: wrap;
        }

        .export-buttons button {
            padding: 8px 12px;
            border: none;
            border-radius: 5px;
            background: #6c757d;
            color: white;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s ease;
        }

        .export-buttons button:hover {
            background: #5a6268;
            transform: translateY(-1px);
        }

        #Wheel-export-png {
            background: #17a2b8;
        }

        #Wheel-export-pdf {
            background: #dc3545;
        }

        #Wheel-export-options {
            background: #6f42c1;
        }

        @keyframes slideInLeft {
            from {
                transform: translateX(-100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        </style>
    `;



    
    // Ajouter les styles au document
    document.head.insertAdjacentHTML('beforeend', styles);

    // Ajouter le panneau au document
    document.body.appendChild(controlPanel);

}

/**
 * Configure les événements pour les contrôles
 */
function setupWheelEventListeners() {
    // Boutons de mode arbre traditionnel
    document.querySelectorAll('.tree-mode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mode = e.target.dataset.mode;
            // changeTreeMode(mode);
            hideWheelControls();
        });
    });

    // Dans la fonction setupWheelEventListeners(), ajouter cet événement :
    // Bouton de fermeture
    document.getElementById('Wheel-controls-close')?.addEventListener('click', () => {
        hideWheelControls();
    });

    // Boutons d'export
    document.getElementById('Wheel-export-png')?.addEventListener('click', () => {
        exportToPNG();
    });

    document.getElementById('Wheel-export-pdf')?.addEventListener('click', () => {
        exportToPDF();
    });

    document.getElementById('Wheel-export-options')?.addEventListener('click', () => {
        showExportOptionsDialog();
    });
}

/**
 * Contrôle de zoom pour l'éventail
 */
function zoomWheel(factor) {
    const svg = d3.select("#tree-svg");
    const currentTransform = d3.zoomTransform(svg.node());
    
    svg.transition()
        .duration(300)
        .call(
            d3.zoom().transform,
            currentTransform.scale(factor)
        );
}

/**
 * Réinitialise le zoom de l'éventail
 */
function resetWheelZoom() {
    resetWheelView();
}

/**
 * Affiche la boîte de dialogue des options d'export
 */
function showExportOptionsDialog() {
    // Créer la modal
    const modal = document.createElement('div');
    modal.id = 'export-options-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <h3>Options d'export</h3>
                
                <div class="export-option-group">
                    <label>Format :</label>
                    <select id="export-format">
                        <option value="png">PNG (Image)</option>
                        <option value="pdf">PDF (Document)</option>
                        <option value="jpeg">JPEG (Image)</option>
                    </select>
                </div>

                <div class="export-option-group">
                    <label>Qualité :</label>
                    <input type="range" id="export-quality" min="0.1" max="1" step="0.1" value="1">
                    <span id="export-quality-value">100%</span>
                </div>

                <div class="export-option-group">
                    <label>Échelle :</label>
                    <input type="range" id="export-scale" min="0.5" max="3" step="0.1" value="1">
                    <span id="export-scale-value">100%</span>
                </div>

                <div class="export-option-group">
                    <label>
                        <input type="checkbox" id="export-bg" checked>
                        Inclure le fond blanc
                    </label>
                </div>

                <div class="export-option-group">
                    <label>Nom du fichier :</label>
                    <input type="text" id="export-filename" placeholder="Nom automatique">
                </div>

                <div class="modal-buttons">
                    <button id="export-cancel" class="modal-btn cancel">Annuler</button>
                    <button id="export-confirm" class="modal-btn confirm">Exporter</button>
                </div>
            </div>
        </div>
    `;

    // Ajouter les styles de la modal
    const modalStyles = `
        <style>
        #export-options-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            backdrop-filter: blur(5px);
        }

        .modal-content {
            background: white;
            border-radius: 10px;
            padding: 25px;
            max-width: 400px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            position: relative;
            z-index: 1;
        }

        .modal-content h3 {
            margin: 0 0 20px 0;
            color: #333;
            text-align: center;
        }

        .export-option-group {
            margin-bottom: 15px;
        }

        .export-option-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #555;
        }

        .export-option-group select,
        .export-option-group input[type="text"] {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 14px;
        }

        .export-option-group input[type="range"] {
            width: calc(100% - 60px);
            margin-right: 10px;
        }

        .export-option-group span {
            display: inline-block;
            background: #007bff;
            color: white;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 12px;
            font-weight: bold;
            min-width: 40px;
            text-align: center;
        }

        .export-option-group input[type="checkbox"] {
            margin-right: 8px;
        }

        .modal-buttons {
            display: flex;
            gap: 10px;
            margin-top: 20px;
        }

        .modal-btn {
            flex: 1;
            padding: 10px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.2s ease;
        }

        .modal-btn.cancel {
            background: #6c757d;
            color: white;
        }

        .modal-btn.cancel:hover {
            background: #5a6268;
        }

        .modal-btn.confirm {
            background: #28a745;
            color: white;
        }

        .modal-btn.confirm:hover {
            background: #218838;
        }
        </style>
    `;

    document.head.insertAdjacentHTML('beforeend', modalStyles);
    document.body.appendChild(modal);

    // Configurer les événements de la modal
    setupExportModalEvents(modal);
}

/**
 * Configure les événements de la modal d'export
 */
function setupExportModalEvents(modal) {
    // Sliders avec mise à jour en temps réel
    const qualitySlider = document.getElementById('export-quality');
    const qualityValue = document.getElementById('export-quality-value');
    const scaleSlider = document.getElementById('export-scale');
    const scaleValue = document.getElementById('export-scale-value');

    qualitySlider?.addEventListener('input', (e) => {
        qualityValue.textContent = Math.round(e.target.value * 100) + '%';
    });

    scaleSlider?.addEventListener('input', (e) => {
        scaleValue.textContent = Math.round(e.target.value * 100) + '%';
    });

    // Boutons de contrôle
    document.getElementById('export-cancel')?.addEventListener('click', () => {
        closeExportModal(modal);
    });

    document.getElementById('export-confirm')?.addEventListener('click', () => {
        executeExportWithOptions(modal);
    });

    // Fermer sur clic sur l'overlay
    modal.querySelector('.modal-overlay')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            closeExportModal(modal);
        }
    });

    // Échapper pour fermer
    document.addEventListener('keydown', function escapeHandler(e) {
        if (e.key === 'Escape') {
            closeExportModal(modal);
            document.removeEventListener('keydown', escapeHandler);
        }
    });
}

/**
 * Ferme la modal d'export
 */
function closeExportModal(modal) {
    modal.style.opacity = '0';
    modal.style.transform = 'scale(0.9)';
    setTimeout(() => {
        modal.remove();
    }, 200);
}

/**
 * Exécute l'export avec les options sélectionnées
 */
async function executeExportWithOptions(modal) {
    const format = document.getElementById('export-format')?.value || 'png';
    const quality = parseFloat(document.getElementById('export-quality')?.value || '1');
    const scale = parseFloat(document.getElementById('export-scale')?.value || '1');
    const includeBackground = document.getElementById('export-bg')?.checked ?? true;
    const filename = document.getElementById('export-filename')?.value.trim() || null;

    const options = {
        format,
        quality,
        scale,
        includeBackground,
        backgroundColor: 'white',
        filename: filename
    };

    try {
        await exportWithOptions(options);
        closeExportModal(modal);
    } catch (error) {
        console.error('Erreur lors de l\'export:', error);
        alert('Erreur lors de l\'export. Veuillez réessayer.');
    }
}

/**
 * Masque les contrôles de l'éventail
 */
function hideWheelControls() {
    const panel = document.getElementById('Wheel-controls-panel');
    if (panel) {
        panel.style.opacity = '0';
        panel.style.transform = 'translateX(-100%)';
        setTimeout(() => {
            panel.remove();
        }, 300);
    }
}

/**
 * Affiche les contrôles de l'éventail
 */
export function showWheelControls() {
    const existingPanel = document.getElementById('Wheel-controls-panel');
    if (!existingPanel) {
        initializeWheelControls();
    }
}

/**
 * Initialise tous les contrôles de l'éventail
 */
export function initializeAllWheelControls() {
    showWheelControls();
}

/**
 * Nettoie les contrôles de l'éventail
 */
export function cleanupWheelControls() {
    hideWheelControls();
    // Supprimer les modals ouvertes
    const modals = document.querySelectorAll('#export-options-modal');
    modals.forEach(modal => modal.remove());
}