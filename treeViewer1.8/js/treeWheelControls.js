// ====================================
// Contrôles pour le mode éventail 360°
// ====================================
import { state } from './main.js';
// import { changeTreeMode } from './treeRenderer.js';
import { resetWheelView } from './treeWheelRenderer.js';
import { exportToPNG, exportToPDF, exportWithOptions, exportVisibleArea, exportHighResPNG, exportFullTreePNG } from './exportManager.js';


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

// /**
//  * Affiche la boîte de dialogue des options d'export
//  */
// function showExportOptionsDialog() {
//     // Créer la modal
//     const modal = document.createElement('div');
//     modal.id = 'export-options-modal';
//     modal.innerHTML = `
//         <div class="modal-overlay">
//             <div class="modal-content">
//                 <h3>Options d'export</h3>
                
//                 <div class="export-option-group">
//                     <label>Format :</label>
//                     <select id="export-format">
//                         <option value="png">PNG (Image)</option>
//                         <option value="pdf">PDF (Document)</option>
//                         <option value="jpeg">JPEG (Image)</option>
//                     </select>
//                 </div>

//                 <div class="export-option-group">
//                     <label>Qualité :</label>
//                     <input type="range" id="export-quality" min="0.1" max="1" step="0.1" value="1">
//                     <span id="export-quality-value">100%</span>
//                 </div>

//                 <div class="export-option-group">
//                     <label>Échelle :</label>
//                     <input type="range" id="export-scale" min="0.5" max="3" step="0.1" value="1">
//                     <span id="export-scale-value">100%</span>
//                 </div>

//                 <div class="export-option-group">
//                     <label>
//                         <input type="checkbox" id="export-bg" checked>
//                         Inclure le fond blanc
//                     </label>
//                 </div>

//                 <div class="export-option-group">
//                     <label>Nom du fichier :</label>
//                     <input type="text" id="export-filename" placeholder="Nom automatique">
//                 </div>

//                 <div class="modal-buttons">
//                     <button id="export-cancel" class="modal-btn cancel">Annuler</button>
//                     <button id="export-confirm" class="modal-btn confirm">Exporter</button>
//                 </div>
//             </div>
//         </div>
//     `;

//     // Ajouter les styles de la modal
//     const modalStyles = `
//         <style>
//         #export-options-modal {
//             position: fixed;
//             top: 0;
//             left: 0;
//             right: 0;
//             bottom: 0;
//             z-index: 10000;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//         }

//         .modal-overlay {
//             position: absolute;
//             top: 0;
//             left: 0;
//             right: 0;
//             bottom: 0;
//             background: rgba(0,0,0,0.5);
//             backdrop-filter: blur(5px);
//         }

//         .modal-content {
//             background: white;
//             border-radius: 10px;
//             padding: 25px;
//             max-width: 400px;
//             width: 90%;
//             max-height: 80vh;
//             overflow-y: auto;
//             box-shadow: 0 10px 30px rgba(0,0,0,0.3);
//             position: relative;
//             z-index: 1;
//         }

//         .modal-content h3 {
//             margin: 0 0 20px 0;
//             color: #333;
//             text-align: center;
//         }

//         .export-option-group {
//             margin-bottom: 15px;
//         }

//         .export-option-group label {
//             display: block;
//             margin-bottom: 5px;
//             font-weight: bold;
//             color: #555;
//         }

//         .export-option-group select,
//         .export-option-group input[type="text"] {
//             width: 100%;
//             padding: 8px;
//             border: 1px solid #ddd;
//             border-radius: 5px;
//             font-size: 14px;
//         }

//         .export-option-group input[type="range"] {
//             width: calc(100% - 60px);
//             margin-right: 10px;
//         }

//         .export-option-group span {
//             display: inline-block;
//             background: #007bff;
//             color: white;
//             padding: 2px 8px;
//             border-radius: 10px;
//             font-size: 12px;
//             font-weight: bold;
//             min-width: 40px;
//             text-align: center;
//         }

//         .export-option-group input[type="checkbox"] {
//             margin-right: 8px;
//         }

//         .modal-buttons {
//             display: flex;
//             gap: 10px;
//             margin-top: 20px;
//         }

//         .modal-btn {
//             flex: 1;
//             padding: 10px;
//             border: none;
//             border-radius: 5px;
//             cursor: pointer;
//             font-weight: bold;
//             transition: all 0.2s ease;
//         }

//         .modal-btn.cancel {
//             background: #6c757d;
//             color: white;
//         }

//         .modal-btn.cancel:hover {
//             background: #5a6268;
//         }

//         .modal-btn.confirm {
//             background: #28a745;
//             color: white;
//         }

//         .modal-btn.confirm:hover {
//             background: #218838;
//         }
//         </style>
//     `;

//     document.head.insertAdjacentHTML('beforeend', modalStyles);
//     document.body.appendChild(modal);

//     // Configurer les événements de la modal
//     setupExportModalEvents(modal);
// }

// /**
//  * Configure les événements de la modal d'export
//  */
// function setupExportModalEvents(modal) {
//     // Sliders avec mise à jour en temps réel
//     const qualitySlider = document.getElementById('export-quality');
//     const qualityValue = document.getElementById('export-quality-value');
//     const scaleSlider = document.getElementById('export-scale');
//     const scaleValue = document.getElementById('export-scale-value');

//     qualitySlider?.addEventListener('input', (e) => {
//         qualityValue.textContent = Math.round(e.target.value * 100) + '%';
//     });

//     scaleSlider?.addEventListener('input', (e) => {
//         scaleValue.textContent = Math.round(e.target.value * 100) + '%';
//     });

//     // Boutons de contrôle
//     document.getElementById('export-cancel')?.addEventListener('click', () => {
//         closeExportModal(modal);
//     });

//     document.getElementById('export-confirm')?.addEventListener('click', () => {
//         executeExportWithOptions(modal);
//     });

//     // Fermer sur clic sur l'overlay
//     modal.querySelector('.modal-overlay')?.addEventListener('click', (e) => {
//         if (e.target === e.currentTarget) {
//             closeExportModal(modal);
//         }
//     });

//     // Échapper pour fermer
//     document.addEventListener('keydown', function escapeHandler(e) {
//         if (e.key === 'Escape') {
//             closeExportModal(modal);
//             document.removeEventListener('keydown', escapeHandler);
//         }
//     });
// }









/**
 * Affiche la boîte de dialogue des options d'export - VERSION AMÉLIORÉE
 */
function showExportOptionsDialog() {
    // Créer la modal
    const modal = document.createElement('div');
    modal.id = 'export-options-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <h3>Options d'export avancées</h3>
                
                <div class="export-option-group">
                    <label>Format :</label>
                    <select id="export-format">
                        <option value="png">PNG (Image)</option>
                        <option value="pdf">PDF (Document)</option>
                        <option value="jpeg">JPEG (Image)</option>
                    </select>
                </div>

                <!-- NOUVEAU : Taille de page -->
                <div class="export-option-group">
                    <label>Taille de page :</label>
                    <select id="export-page-size">
                        <option value="auto">Automatique (taille actuelle)</option>
                        <option value="a4">A4 (210×297 mm)</option>
                        <option value="a3">A3 (297×420 mm)</option>
                        <option value="2xa4">2×A4 portrait</option>
                        <option value="4xa4">4×A4 (2×2)</option>
                        <option value="8xa4">8×A4 (arbre vertical)</option>
                        <option value="2xa3">2×A3 portrait</option>
                        <option value="4xa3">4×A3 (2×2)</option>
                        <option value="8xa3">8×A3 (arbre vertical)</option>
                        <option value="6xa4-radar">6×A4 radar (3×2)</option>
                    </select>
                </div>

                <!-- NOUVEAU : Résolution -->
                <div class="export-option-group">
                    <label>Résolution :</label>
                    <select id="export-resolution">
                        <option value="150">150 DPI (Écran)</option>
                        <option value="300" selected>300 DPI (Impression standard)</option>
                        <option value="600">600 DPI (Haute qualité)</option>
                        <option value="1200">1200 DPI (Qualité professionnelle)</option>
                        <option value="custom">Personnalisée...</option>
                    </select>
                </div>

                <!-- NOUVEAU : Résolution personnalisée -->
                <div id="custom-resolution-group" class="export-option-group" style="display: none;">
                    <label>DPI personnalisé :</label>
                    <input type="number" id="custom-dpi" min="72" max="2400" value="300" step="50">
                    <small>Recommandé : 150-600 DPI</small>
                </div>

                <!-- NOUVEAU : Aperçu des dimensions -->
                <div class="export-option-group">
                    <div id="export-preview" class="export-preview">
                        <strong>Aperçu :</strong>
                        <div id="preview-info">Sélectionnez vos options...</div>
                    </div>
                </div>

                <div class="export-option-group">
                    <label>Qualité :</label>
                    <input type="range" id="export-quality" min="0.1" max="1" step="0.1" value="1">
                    <span id="export-quality-value">100%</span>
                </div>

                <div class="export-option-group">
                    <label>
                        <input type="checkbox" id="export-bg" checked>
                        Inclure le fond blanc
                    </label>
                </div>

                <!-- NOUVEAU : Marques de repère -->
                <div class="export-option-group">
                    <label>
                        <input type="checkbox" id="export-guides" checked>
                        Ajouter les marques de découpe/collage
                    </label>
                </div>

                <div class="export-option-group">
                    <label>Nom du fichier :</label>
                    <input type="text" id="export-filename" placeholder="Nom automatique">
                </div>

                <div class="modal-buttons">
                    <button id="export-cancel" class="modal-btn cancel">Annuler</button>
                    <button id="export-preview-btn" class="modal-btn preview">Aperçu</button>
                    <button id="export-confirm" class="modal-btn confirm">Exporter</button>
                </div>
            </div>
        </div>
    `;

    // Ajouter les styles de la modal améliorée
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
            max-width: 500px;
            width: 90%;
            max-height: 85vh;
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
        .export-option-group input[type="text"],
        .export-option-group input[type="number"] {
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

        .export-option-group small {
            display: block;
            color: #6c757d;
            font-size: 12px;
            margin-top: 5px;
        }

        .export-preview {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 5px;
            padding: 10px;
            font-size: 13px;
        }

        #preview-info {
            margin-top: 5px;
            color: #495057;
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

        .modal-btn.preview {
            background: #17a2b8;
            color: white;
        }

        .modal-btn.preview:hover {
            background: #138496;
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
    setupEnhancedExportModalEvents(modal);
}

/**
 * Configure les événements de la modal d'export améliorée
 */
function setupEnhancedExportModalEvents(modal) {
    // Sliders avec mise à jour en temps réel
    const qualitySlider = document.getElementById('export-quality');
    const qualityValue = document.getElementById('export-quality-value');

    qualitySlider?.addEventListener('input', (e) => {
        qualityValue.textContent = Math.round(e.target.value * 100) + '%';
    });

    // Résolution personnalisée
    const resolutionSelect = document.getElementById('export-resolution');
    const customResolutionGroup = document.getElementById('custom-resolution-group');
    
    resolutionSelect?.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
            customResolutionGroup.style.display = 'block';
        } else {
            customResolutionGroup.style.display = 'none';
        }
        updateExportPreview();
    });

    // Mise à jour de l'aperçu
    const updateTriggers = ['export-page-size', 'export-resolution', 'custom-dpi'];
    updateTriggers.forEach(id => {
        document.getElementById(id)?.addEventListener('change', updateExportPreview);
    });

    // Boutons de contrôle
    document.getElementById('export-cancel')?.addEventListener('click', () => {
        closeExportModal(modal);
    });

    document.getElementById('export-preview-btn')?.addEventListener('click', () => {
        showExportPreview();
    });

    document.getElementById('export-confirm')?.addEventListener('click', () => {
        executeEnhancedExportWithOptions(modal);
    });

    // Fermer sur clic sur l'overlay
    modal.querySelector('.modal-overlay')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            closeExportModal(modal);
        }
    });

    // Initialiser l'aperçu
    updateExportPreview();
}

/**
 * Met à jour l'aperçu des dimensions d'export
 */
function updateExportPreview() {
    const pageSize = document.getElementById('export-page-size')?.value;
    const resolutionSelect = document.getElementById('export-resolution')?.value;
    const customDpi = document.getElementById('custom-dpi')?.value;
    const previewInfo = document.getElementById('preview-info');
    
    if (!previewInfo) return;

    const dpi = resolutionSelect === 'custom' ? parseInt(customDpi) : parseInt(resolutionSelect);
    const svg = document.querySelector('#tree-svg');
    const svgRect = svg?.getBoundingClientRect();
    
    if (!svgRect) {
        previewInfo.innerHTML = 'Erreur: SVG non trouvé';
        return;
    }

    // Calculer les dimensions selon le format
    let finalWidth, finalHeight, pages = 'Page unique';
    
    switch (pageSize) {
        case 'auto':
            finalWidth = Math.round(svgRect.width * dpi / 150);
            finalHeight = Math.round(svgRect.height * dpi / 150);
            break;
        case 'a4':
            finalWidth = Math.round(210 * dpi / 25.4); // A4 width in pixels
            finalHeight = Math.round(297 * dpi / 25.4); // A4 height in pixels
            break;
        case '2xa4':
            finalWidth = Math.round(210 * dpi / 25.4);
            finalHeight = Math.round(594 * dpi / 25.4); // 2*A4 height
            pages = '2 pages A4 verticales';
            break;
        case '4xa4':
            finalWidth = Math.round(420 * dpi / 25.4); // 2*A4 width
            finalHeight = Math.round(594 * dpi / 25.4); // 2*A4 height
            pages = '4 pages A4 (2×2)';
            break;
        case '8xa4':
            finalWidth = Math.round(210 * dpi / 25.4);
            finalHeight = Math.round(2376 * dpi / 25.4); // 8*A4 height
            pages = '8 pages A4 verticales';
            break;
        case '6xa4-radar':
            finalWidth = Math.round(630 * dpi / 25.4); // 3*A4 width
            finalHeight = Math.round(594 * dpi / 25.4); // 2*A4 height
            pages = '6 pages A4 radar (3×2)';
            break;
        default:
            finalWidth = Math.round(svgRect.width * dpi / 150);
            finalHeight = Math.round(svgRect.height * dpi / 150);
    }

    const fileSize = Math.round(finalWidth * finalHeight * 3 / 1024 / 1024); // Estimation MB
    
    previewInfo.innerHTML = `
        <div><strong>Dimensions:</strong> ${finalWidth} × ${finalHeight} pixels</div>
        <div><strong>Résolution:</strong> ${dpi} DPI</div>
        <div><strong>Format:</strong> ${pages}</div>
        <div><strong>Taille estimée:</strong> ~${fileSize} MB</div>
        ${fileSize > 50 ? '<div style="color: orange;"><strong>⚠️ Fichier volumineux</strong></div>' : ''}
        ${finalWidth > 32000 || finalHeight > 32000 ? '<div style="color: red;"><strong>⚠️ Limites Canvas dépassées</strong></div>' : ''}
    `;
}

/**
 * Affiche un aperçu de l'export (fonction placeholder)
 */
function showExportPreview() {
    alert('Fonction d\'aperçu en développement...');
}

/**
 * Exécute l'export avec les options améliorées
 */
async function executeEnhancedExportWithOptions(modal) {
    const format = document.getElementById('export-format')?.value || 'png';
    const pageSize = document.getElementById('export-page-size')?.value || 'auto';
    const resolutionSelect = document.getElementById('export-resolution')?.value;
    const customDpi = document.getElementById('custom-dpi')?.value;
    const quality = parseFloat(document.getElementById('export-quality')?.value || '1');
    const includeBackground = document.getElementById('export-bg')?.checked ?? true;
    const includeGuides = document.getElementById('export-guides')?.checked ?? true;
    const filename = document.getElementById('export-filename')?.value.trim() || null;

    const dpi = resolutionSelect === 'custom' ? parseInt(customDpi) : parseInt(resolutionSelect);
    const scaleFactor = dpi / 150; // 150 DPI = facteur 1

    const options = {
        format,
        pageSize,
        dpi,
        scaleFactor,
        quality,
        includeBackground,
        includeGuides,
        backgroundColor: 'white',
        filename: filename
    };

    try {
        // Utiliser la fonction d'export haute résolution
        if (pageSize === 'auto') {
            // await exportHighResPNG(scaleFactor);
            await exportFullTreePNG(scaleFactor);
        } else {
            await exportMultiPageFormat(options);
        }
        closeExportModal(modal);
    } catch (error) {
        console.error('Erreur lors de l\'export:', error);
        alert('Erreur lors de l\'export. Veuillez réessayer.');
    }
}

/**
 * Export multi-pages (fonction placeholder)
 */
async function exportMultiPageFormat(options) {
    console.log('Export multi-pages avec options:', options);
    // Cette fonction sera implémentée dans la prochaine étape
    alert('Export multi-pages en développement...');
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