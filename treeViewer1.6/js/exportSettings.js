
// ====================================
// Contrôles pour le mode éventail 360°
// ====================================
import { fitTreeToScreen, exportWithPagePrintingParams,
    calculateFullTreeDimensions, calculatePagePrintingParams, 
    generatePrintingPreview, exportProgress } from './exportManager.js';
import { resetViewZoomBeforeExport, resetViewZoomAfterExport } from './eventHandlers.js'
import { state } from './main.js';



// Traductions pour les éléments de l'interface
const ExportControlsTranslations = {
    'fr': {
        'ExportModeTitle': '🌟 Mode radar / Éventail 360°',
        'viewLabel': 'Vue :',
        'fitTreeButton': '🔍 Vue complète',
        'exportLabel': 'Export :',
        'exportPNG': '📷 PNG',
        'exportPDF': '📄 PDF', 
        'exportOptions': '⚙️ Options',
        'closeButton': 'Fermer',
        'exportOptionsTitle': 'Options d\'export avancées',
        'formatLabel': 'Format :',
        'formatPNG': 'PNG (Image)',
        'formatPDF': 'PDF (Document)',
        'formatJPEG': 'JPEG (Image)',
        'pageSizeLabel': 'Taille de page :',
        'pageSizeAuto': 'Automatique (taille actuelle)',
        'pageSizeA4Portrait': 'A4 Portrait (210×297 mm)',
        'pageSizeA4Landscape': 'A4 Landscape (297×210 mm)',
        'pageSizeA3Portrait': 'A3 Portrait (297×420 mm)',
        'pageSizeA3Landscape': 'A3 Landscape (420×297 mm)',
        'pageLayoutLabel': 'Disposition des pages :',
        'pageLayout1x1': '1×1 (page unique)',
        'pageLayout1xN': '1×N (1 colonne, hauteur automatique)',
        'pageLayout2xN': '2×N (2 colonnes, hauteur automatique)',
        'pageLayout3xN': '3×N (3 colonnes, hauteur automatique)',
        'pageLayout4xN': '4×N (4 colonnes, hauteur automatique)',
        'resolutionLabel': 'Résolution :',
        'resolution150': '150 DPI (Écran)',
        'resolution300': '300 DPI (Impression standard)',
        'resolution600': '600 DPI (Haute qualité)',
        'resolution1200': '1200 DPI (Qualité professionnelle)',
        'resolutionCustom': 'Personnalisée...',
        'customDPILabel': 'DPI personnalisé :',
        'customDPIRecommended': 'Recommandé : 150-600 DPI',
        'previewLabel': 'Aperçu :',
        'previewDefault': 'Sélectionnez vos options...',
        'qualityLabel': 'Qualité :',
        'includeBackground': 'Inclure le fond blanc',
        'includeGuides': 'Ajouter les marques de découpe/collage',
        'filenameLabel': 'Nom du fichier :',
        'filenameAuto': 'Nom automatique',
        'cancelButton': 'Annuler',
        'previewButton': 'Aperçu',
        'exportButton': 'Exporter',
        'exportSuccess': 'exporté avec succès!',
        'exportError': 'Erreur lors de l\'export:',
        'modeAutomatic': 'Mode automatique',
        'svgNotFound': 'Erreur: SVG non trouvé',
        'cannotCalculate': 'Erreur: Impossible de calculer les dimensions',
        'calculationError': 'Erreur dans le calcul des paramètres',
        'exportInProgress': 'Export en cours...',
        'exportFailed': 'Erreur lors de l\'export. Veuillez réessayer.'
    },
    'en': {
        'ExportModeTitle': '🌟 Radar / Fan 360° Mode',
        'viewLabel': 'View:',
        'fitTreeButton': '🔍 Full View',
        'exportLabel': 'Export:',
        'exportPNG': '📷 PNG',
        'exportPDF': '📄 PDF',
        'exportOptions': '⚙️ Options',
        'closeButton': 'Close',
        'exportOptionsTitle': 'Advanced Export Options',
        'formatLabel': 'Format:',
        'formatPNG': 'PNG (Image)',
        'formatPDF': 'PDF (Document)',
        'formatJPEG': 'JPEG (Image)',
        'pageSizeLabel': 'Page size:',
        'pageSizeAuto': 'Automatic (current size)',
        'pageSizeA4Portrait': 'A4 Portrait (210×297 mm)',
        'pageSizeA4Landscape': 'A4 Landscape (297×210 mm)',
        'pageSizeA3Portrait': 'A3 Portrait (297×420 mm)',
        'pageSizeA3Landscape': 'A3 Landscape (420×297 mm)',
        'pageLayoutLabel': 'Page layout:',
        'pageLayout1x1': '1×1 (single page)',
        'pageLayout1xN': '1×N (1 column, auto height)',
        'pageLayout2xN': '2×N (2 columns, auto height)',
        'pageLayout3xN': '3×N (3 columns, auto height)',
        'pageLayout4xN': '4×N (4 columns, auto height)',
        'resolutionLabel': 'Resolution:',
        'resolution150': '150 DPI (Screen)',
        'resolution300': '300 DPI (Standard printing)',
        'resolution600': '600 DPI (High quality)',
        'resolution1200': '1200 DPI (Professional quality)',
        'resolutionCustom': 'Custom...',
        'customDPILabel': 'Custom DPI:',
        'customDPIRecommended': 'Recommended: 150-600 DPI',
        'previewLabel': 'Preview:',
        'previewDefault': 'Select your options...',
        'qualityLabel': 'Quality:',
        'includeBackground': 'Include white background',
        'includeGuides': 'Add cutting/assembly marks',
        'filenameLabel': 'File name:',
        'filenameAuto': 'Automatic name',
        'cancelButton': 'Cancel',
        'previewButton': 'Preview',
        'exportButton': 'Export',
        'exportSuccess': 'exported successfully!',
        'exportError': 'Export error:',
        'modeAutomatic': 'Automatic mode',
        'svgNotFound': 'Error: SVG not found',
        'cannotCalculate': 'Error: Cannot calculate dimensions',
        'calculationError': 'Error in parameter calculation',
        'exportInProgress': 'Export in progress...',
        'exportFailed': 'Export failed. Please try again.'
    },
    'es': {
        'ExportModeTitle': '🌟 Modo Radar / Abanico 360°',
        'viewLabel': 'Vista:',
        'fitTreeButton': '🔍 Vista Completa',
        'exportLabel': 'Exportar:',
        'exportPNG': '📷 PNG',
        'exportPDF': '📄 PDF',
        'exportOptions': '⚙️ Opciones',
        'closeButton': 'Cerrar',
        'exportOptionsTitle': 'Opciones de Exportación Avanzadas',
        'formatLabel': 'Formato:',
        'formatPNG': 'PNG (Imagen)',
        'formatPDF': 'PDF (Documento)',
        'formatJPEG': 'JPEG (Imagen)',
        'pageSizeLabel': 'Tamaño de página:',
        'pageSizeAuto': 'Automático (tamaño actual)',
        'pageSizeA4Portrait': 'A4 Vertical (210×297 mm)',
        'pageSizeA4Landscape': 'A4 Horizontal (297×210 mm)',
        'pageSizeA3Portrait': 'A3 Vertical (297×420 mm)',
        'pageSizeA3Landscape': 'A3 Horizontal (420×297 mm)',
        'pageLayoutLabel': 'Disposición de páginas:',
        'pageLayout1x1': '1×1 (página única)',
        'pageLayout1xN': '1×N (1 columna, altura automática)',
        'pageLayout2xN': '2×N (2 columnas, altura automática)',
        'pageLayout3xN': '3×N (3 columnas, altura automática)',
        'pageLayout4xN': '4×N (4 columnas, altura automática)',
        'resolutionLabel': 'Resolución:',
        'resolution150': '150 DPI (Pantalla)',
        'resolution300': '300 DPI (Impresión estándar)',
        'resolution600': '600 DPI (Alta calidad)',
        'resolution1200': '1200 DPI (Calidad profesional)',
        'resolutionCustom': 'Personalizada...',
        'customDPILabel': 'DPI personalizado:',
        'customDPIRecommended': 'Recomendado: 150-600 DPI',
        'previewLabel': 'Vista previa:',
        'previewDefault': 'Seleccione sus opciones...',
        'qualityLabel': 'Calidad:',
        'includeBackground': 'Incluir fondo blanco',
        'includeGuides': 'Agregar marcas de corte/montaje',
        'filenameLabel': 'Nombre del archivo:',
        'filenameAuto': 'Nombre automático',
        'cancelButton': 'Cancelar',
        'previewButton': 'Vista previa',
        'exportButton': 'Exportar',
        'exportSuccess': 'exportado con éxito!',
        'exportError': 'Error de exportación:',
        'modeAutomatic': 'Modo automático',
        'svgNotFound': 'Error: SVG no encontrado',
        'cannotCalculate': 'Error: No se pueden calcular las dimensiones',
        'calculationError': 'Error en el cálculo de parámetros',
        'exportInProgress': 'Exportación en progreso...',
        'exportFailed': 'Exportación fallida. Inténtelo de nuevo.'
    },
    'hu': {
        'ExportModeTitle': '🌟 Radar / Legyező 360° Mód',
        'viewLabel': 'Nézet:',
        'fitTreeButton': '🔍 Teljes Nézet',
        'exportLabel': 'Exportálás:',
        'exportPNG': '📷 PNG',
        'exportPDF': '📄 PDF',
        'exportOptions': '⚙️ Beállítások',
        'closeButton': 'Bezárás',
        'exportOptionsTitle': 'Speciális Exportálási Beállítások',
        'formatLabel': 'Formátum:',
        'formatPNG': 'PNG (Kép)',
        'formatPDF': 'PDF (Dokumentum)',
        'formatJPEG': 'JPEG (Kép)',
        'pageSizeLabel': 'Oldal mérete:',
        'pageSizeAuto': 'Automatikus (jelenlegi méret)',
        'pageSizeA4Portrait': 'A4 Álló (210×297 mm)',
        'pageSizeA4Landscape': 'A4 Fekvő (297×210 mm)',
        'pageSizeA3Portrait': 'A3 Álló (297×420 mm)',
        'pageSizeA3Landscape': 'A3 Fekvő (420×297 mm)',
        'pageLayoutLabel': 'Oldal elrendezés:',
        'pageLayout1x1': '1×1 (egy oldal)',
        'pageLayout1xN': '1×N (1 oszlop, auto magasság)',
        'pageLayout2xN': '2×N (2 oszlop, auto magasság)',
        'pageLayout3xN': '3×N (3 oszlop, auto magasság)',
        'pageLayout4xN': '4×N (4 oszlop, auto magasság)',
        'resolutionLabel': 'Felbontás:',
        'resolution150': '150 DPI (Képernyő)',
        'resolution300': '300 DPI (Szabványos nyomtatás)',
        'resolution600': '600 DPI (Magas minőség)',
        'resolution1200': '1200 DPI (Professzionális minőség)',
        'resolutionCustom': 'Egyedi...',
        'customDPILabel': 'Egyedi DPI:',
        'customDPIRecommended': 'Ajánlott: 150-600 DPI',
        'previewLabel': 'Előnézet:',
        'previewDefault': 'Válassza ki a beállításokat...',
        'qualityLabel': 'Minőség:',
        'includeBackground': 'Fehér háttér beszúrása',
        'includeGuides': 'Vágás/összeillesztés jelek hozzáadása',
        'filenameLabel': 'Fájlnév:',
        'filenameAuto': 'Automatikus név',
        'cancelButton': 'Mégse',
        'previewButton': 'Előnézet',
        'exportButton': 'Exportálás',
        'exportSuccess': 'sikeresen exportálva!',
        'exportError': 'Exportálási hiba:',
        'modeAutomatic': 'Automatikus mód',
        'svgNotFound': 'Hiba: SVG nem található',
        'cannotCalculate': 'Hiba: Nem lehet kiszámítani a méreteket',
        'calculationError': 'Hiba a paraméter számításban',
        'exportInProgress': 'Exportálás folyamatban...',
        'exportFailed': 'Exportálás sikertelen. Próbálja újra.'
    }
};

// [Gardez votre ExportControlsTranslations existant ici]

// Fonction pour obtenir le texte traduit selon la langue actuelle
function translateExportControls(key) {
    const currentLang = window.CURRENT_LANGUAGE || 'fr';
    return ExportControlsTranslations[currentLang]?.[key] || 
           ExportControlsTranslations['fr'][key] || 
           key;
}

/**
 * Affiche la boîte de dialogue des options d'export unifiée
 */
function showExportOptionsDialog() {


    const calcFontSize = (baseSize) => { 
        // On récupère la valeur de l'import seulement ICI, à l'exécution.
        const factor = state?.browserScaleFactor || 1;
        return Math.round(baseSize / factor); 
    };

    // Créer la modal
    const modal = document.createElement('div');
    modal.id = 'export-options-modal';

    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <h3>${translateExportControls('exportOptionsTitle')}</h3>
                
                <div class="export-option-group horizontal">
                    <label>${translateExportControls('formatLabel')}</label>
                    <select id="export-format">
                        <option value="png">${translateExportControls('formatPNG')}</option>
                        <option value="pdf">${translateExportControls('formatPDF')}</option>
                        <option value="jpeg">${translateExportControls('formatJPEG')}</option>
                    </select>
                </div>

                <div class="export-option-group horizontal">
                    <label class="multiline">${translateExportControls('pageSizeLabel')}</label>
                    <select id="export-page-size">
                        <option value="auto">${translateExportControls('pageSizeAuto')}</option>
                        <option value="a4-portrait">${translateExportControls('pageSizeA4Portrait')}</option>
                        <option value="a4-landscape">${translateExportControls('pageSizeA4Landscape')}</option>
                        <option value="a3-portrait">${translateExportControls('pageSizeA3Portrait')}</option>
                        <option value="a3-landscape">${translateExportControls('pageSizeA3Landscape')}</option>
                    </select>
                </div>

                <div class="export-option-group horizontal" id="page-layout-group">
                    <label class="multiline">${translateExportControls('pageLayoutLabel')}</label>
                    <select id="export-page-layout">
                        <option value="1x1">${translateExportControls('pageLayout1x1')}</option>
                        <option value="1xN">${translateExportControls('pageLayout1xN')}</option>
                        <option value="2xN">${translateExportControls('pageLayout2xN')}</option>
                        <option value="3xN">${translateExportControls('pageLayout3xN')}</option>
                        <option value="4xN">${translateExportControls('pageLayout4xN')}</option>
                    </select>
                </div>

                <div class="export-option-group horizontal">
                    <label>${translateExportControls('resolutionLabel')}</label>
                    <select id="export-resolution">
                        <option value="150">${translateExportControls('resolution150')}</option>
                        <option value="300" selected>${translateExportControls('resolution300')}</option>
                        <option value="600">${translateExportControls('resolution600')}</option>
                        <option value="1200">${translateExportControls('resolution1200')}</option>
                        <option value="custom">${translateExportControls('resolutionCustom')}</option>
                    </select>
                </div>

                <div id="custom-resolution-group" class="export-option-group" style="display: none;">
                    <label>${translateExportControls('customDPILabel')}</label>
                    <input type="number" id="custom-dpi" min="72" max="2400" value="300" step="50">
                    <small>${translateExportControls('customDPIRecommended')}</small>
                </div>

                <div class="export-option-group horizontal">
                    <label>${translateExportControls('qualityLabel')}</label>
                    <div class="quality-controls">
                        <input type="range" id="export-quality" min="0.1" max="1" step="0.1" value="1">
                        <span id="export-quality-value">100%</span>
                    </div>
                </div>

                <div class="export-option-group">
                    <label>
                        <input type="checkbox" id="export-bg" checked>
                        ${translateExportControls('includeBackground')}
                    </label>
                </div>

                <div class="export-option-group">
                    <label>
                        <input type="checkbox" id="export-guides" checked>
                        ${translateExportControls('includeGuides')}
                    </label>
                </div>

                <div class="export-option-group">
                    <label>${translateExportControls('filenameLabel')}</label>
                    <input type="text" id="export-filename" placeholder="${translateExportControls('filenameAuto')}">
                </div>

                <div class="modal-buttons">
                    <button id="export-cancel" class="modal-btn cancel">${translateExportControls('cancelButton')}</button>
                    <button id="export-preview-btn" class="modal-btn preview">${translateExportControls('previewButton')}</button>
                    <button id="export-confirm" class="modal-btn confirm">${translateExportControls('exportButton')}</button>
                </div>

                <!-- Aperçu déplacé en bas -->
                <div class="export-option-group">
                    <div id="export-preview" class="export-preview">
                        <strong>${translateExportControls('previewLabel')}</strong>
                        <div id="preview-info">${translateExportControls('previewDefault')}</div>
                    </div>
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
            margin-bottom: 10px;
        }

        .export-option-group.horizontal {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 10px;
            min-height: 40px;
        }

        .export-option-group.horizontal label {
            flex: 0 0 110px;
            margin-bottom: 0;
            font-size: ${calcFontSize(15)}px;
            line-height: 1.1;
            font-weight: bold;
            color: #555;
            display: flex;
            align-items: center;
        }

        .export-option-group.horizontal label.multiline {
            flex: 0 0 110px;
            font-size: ${calcFontSize(15)}px;
            text-align: left;
        }

        .export-option-group.horizontal select {
            flex: 1; /* Prend tout l'espace restant */
            margin-bottom: 0;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: ${calcFontSize(14)}px;
            height: 36px;
            box-sizing: border-box;
            min-width: 0; /* Permet la flexibilité */
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
            font-size: ${calcFontSize(14)}px;
        }

        .export-option-group input[type="checkbox"] {
            margin-right: 8px;
        }

        .export-option-group small {
            display: block;
            color: #6c757d;
            font-size: ${calcFontSize(12)}px;
            margin-top: 5px;
        }

        .export-preview {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 5px;
            padding: 10px;
            font-size: ${calcFontSize(13)}px;
        }

        #preview-info {
            margin-top: 5px;
            color: #495057;
        }

        .modal-buttons {
            display: flex;
            gap: 10px;
            margin-top: 20px;
            margin-bottom: 15px;
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

        .quality-controls {
            display: flex;
            align-items: center;
            gap: 10px;
            flex: 1;
        }

        .quality-controls input[type="range"] {
            flex: 1;
            margin: 0;
        }

        .quality-controls span {
            flex: 0 0 50px;
            display: inline-block;
            background: #007bff;
            color: white;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: ${calcFontSize(12)}px;
            font-weight: bold;
            text-align: center;
        }
        </style>
    `;

    document.head.insertAdjacentHTML('beforeend', modalStyles);
    document.body.appendChild(modal);

    // Configurer les événements de la modal
    setupUnifiedExportModalEvents(modal);
}

/**
 * Configure les événements de la modal d'export unifiée
 */
function setupUnifiedExportModalEvents(modal) {

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
        resetViewZoomAfterExport();
    });

    document.getElementById('export-preview-btn')?.addEventListener('click', () => {
        console.log('🔍 Ajustement vue complète...');
        fitTreeToScreen();
    });

    document.getElementById('export-confirm')?.addEventListener('click', () => {
        exportProgress.show('Préparation export...');
        exportProgress.update(5, 'Calcul des paramètres...');

        executeEnhancedExportWithOptions(modal);
    });

    // Fermer sur clic sur l'overlay
    modal.querySelector('.modal-overlay')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            closeExportModal(modal);
            resetViewZoomAfterExport();
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
    const pageLayout = document.getElementById('export-page-layout')?.value || '1x1';
    const resolutionSelect = document.getElementById('export-resolution')?.value;
    const customDpi = document.getElementById('custom-dpi')?.value;
    const previewInfo = document.getElementById('preview-info');
    
    if (!previewInfo) return;

    // Mode automatique (logique existante)
    if (pageSize === 'auto') {
        const dpi = resolutionSelect === 'custom' ? parseInt(customDpi) : parseInt(resolutionSelect);
        const svg = document.querySelector('#tree-svg');
        const svgRect = svg?.getBoundingClientRect();
        
        if (!svgRect) {
            previewInfo.innerHTML = translateExportControls('svgNotFound');
            return;
        }

        const finalWidth = Math.round(svgRect.width * dpi / 150);
        const finalHeight = Math.round(svgRect.height * dpi / 150);
        const fileSize = Math.round(finalWidth * finalHeight * 3 / 1024 / 1024);
        
        previewInfo.innerHTML = `
            <div><strong>Mode:</strong> ${translateExportControls('modeAutomatic')}</div>
            <div><strong>Dimensions:</strong> ${finalWidth} × ${finalHeight} pixels</div>
            <div><strong>Résolution:</strong> ${dpi} DPI</div>
            <div><strong>Taille estimée:</strong> ~${fileSize} MB</div>
            ${fileSize > 50 ? '<div style="color: orange;"><strong>⚠️ Fichier volumineux</strong></div>' : ''}
            ${finalWidth > 32000 || finalHeight > 32000 ? '<div style="color: red;"><strong>⚠️ Limites Canvas dépassées</strong></div>' : ''}
        `;
        return;
    }

    // Mode pages A4/A3 (nouvelle logique)
    const svg = document.querySelector('#tree-svg');
    if (!svg) {
        previewInfo.innerHTML = translateExportControls('svgNotFound');
        return;
    }

    // Calculer les dimensions de l'arbre
    const fullDimensions = calculateFullTreeDimensions ? calculateFullTreeDimensions(svg) : null;
    if (!fullDimensions) {
        previewInfo.innerHTML = translateExportControls('cannotCalculate');
        return;
    }

    // Utiliser le nouveau calculateur
    try {
        const params = calculatePagePrintingParams(
            fullDimensions.width,
            fullDimensions.height,
            pageSize,
            pageLayout
        );
        
        if (params) {
            previewInfo.innerHTML = generatePrintingPreview(params);
        } else {
            previewInfo.innerHTML = translateExportControls('calculationError');
        }
    } catch (error) {
        previewInfo.innerHTML = `${translateExportControls('exportError')} ${error.message}`;
    }
}

/**
 * Exécute l'export avec les options améliorées
 */
async function executeEnhancedExportWithOptions(modal) {
    const format = document.getElementById('export-format')?.value || 'png';
    const pageSize = document.getElementById('export-page-size')?.value || 'auto';
    const pageLayout = document.getElementById('export-page-layout')?.value || '1x1';
    const resolutionSelect = document.getElementById('export-resolution')?.value;
    const customDpi = document.getElementById('custom-dpi')?.value;
    const quality = parseFloat(document.getElementById('export-quality')?.value || '1');
    const includeBackground = document.getElementById('export-bg')?.checked ?? true;
    const includeGuides = document.getElementById('export-guides')?.checked ?? true;
    const filename = document.getElementById('export-filename')?.value.trim() || null;

    const dpi = resolutionSelect === 'custom' ? parseInt(customDpi) : parseInt(resolutionSelect);

    try {
        console.log('🔄 Export pages A4/A3...');
        await exportWithPagePrintingParams(pageSize, pageLayout, dpi, format, filename, quality);        
        closeExportModal(modal);
    } catch (error) {
        console.error(translateExportControls('exportError'), error);
        alert(translateExportControls('exportFailed'));
    }
}

/**
 * Ferme la modal d'export
 */
function closeExportModal(modal) {
    modal.style.opacity = '0';
    modal.style.transform = 'scale(0.9)';
    setTimeout(() => {
        modal.remove();
        resetViewZoomAfterExport();
    }, 200);
}


/**
 * Initialise tous les contrôles de l'éventail - Ouvre directement les options
 */
export function initializeAllExportControls() {
    resetViewZoomBeforeExport();
    showExportOptionsDialog();
}

/**
 * Nettoie les contrôles de l'éventail
 */
export function cleanupExportControls() {
    // Supprimer les modals ouvertes
    const modals = document.querySelectorAll('#export-options-modal');
    modals.forEach(modal => modal.remove());
    resetViewZoomAfterExport();
}