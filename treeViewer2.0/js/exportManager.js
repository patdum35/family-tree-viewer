// ====================================
// Gestionnaire d'export PDF/PNG 
// ====================================
import { state } from './main.js';
import { getZoom } from './treeRenderer.js';


let flipV = false;

class ExportProgressManager {
    constructor() {
        this.progressDiv = null;
        this.progressBar = null;
        this.progressText = null;
    }
    
    show(title = 'Export en cours...') {
        this.hide(); // Au cas où
        
        this.progressDiv = document.createElement('div');
        this.progressDiv.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 10001; min-width: 300px; text-align: center;
        `;
        
        this.progressDiv.innerHTML = `
            <h3 style="margin: 0 0 15px 0;">${title}</h3>
            <div style="background: #f0f0f0; border-radius: 10px; overflow: hidden; margin: 10px 0;">
                <div id="export-progress-bar" style="background: #4CAF50; height: 20px; width: 0%; transition: width 0.3s;"></div>
            </div>
            <div id="export-progress-text">Initialisation...</div>
        `;
        
        document.body.appendChild(this.progressDiv);
        this.progressBar = document.getElementById('export-progress-bar');
        this.progressText = document.getElementById('export-progress-text');
    }
    
    update(percent, text) {
        if (this.progressBar) this.progressBar.style.width = `${percent}%`;
        if (this.progressText) this.progressText.textContent = text;
    }
    
    hide() {
        if (this.progressDiv) {
            this.progressDiv.remove();
            this.progressDiv = null;
        }
    }
}

export const exportProgress = new ExportProgressManager();

// Nouveau module pour gérer le progress
const maxCanvasSize = 327670; 
// Limite réelle (surface, pas dimensions)
const maxSurface = 16300 * 16300; // 265 millions pixels
// const maxSurface = 2339 * 3366; // equivalent A4 300 dpi
// const maxSurface = 1630 * 16300; // 265 millions pixels

// Fonction pour obtenir le texte traduit selon la langue actuelle
function translateExport(key) {
    const exportTranslations = {
        'fr': {
            'exportPNGSuccess': 'PNG exporté avec succès!',
            'exportPDFSuccess': 'PDF exporté avec succès!',
            'exportJPEGSuccess': 'JPEG exporté avec succès!',
            'exportPNGError': 'Erreur lors de l\'export PNG:',
            'exportPDFError': 'Erreur lors de l\'export PDF:',
            'exportJPEGError': 'Erreur export JPEG:',
            'tilesDownloaded': 'tuiles téléchargées !',
            'batchScriptGenerated': 'Script batch corrigé généré',
            'exportComplete': 'Export terminé !',
            'scriptsGenerated': 'Scripts générés',
            'doubleClickToAssemble': 'Double-cliquez pour assembler :',
            'modeAutomatic': 'Mode automatique',
            'exportedPage': 'pages exportées!'
        },
        'en': {
            'exportPNGSuccess': 'PNG exported successfully!',
            'exportPDFSuccess': 'PDF exported successfully!',
            'exportJPEGSuccess': 'JPEG exported successfully!',
            'exportPNGError': 'PNG export error:',
            'exportPDFError': 'PDF export error:',
            'exportJPEGError': 'JPEG export error:',
            'tilesDownloaded': 'tiles downloaded!',
            'batchScriptGenerated': 'Corrected batch script generated',
            'exportComplete': 'Export completed!',
            'scriptsGenerated': 'Scripts generated',
            'doubleClickToAssemble': 'Double-click to assemble:',
            'modeAutomatic': 'Automatic mode',
            'exportedPage': ' exported pages!'
        },
        'es': {
            'exportPNGSuccess': '¡PNG exportado con éxito!',
            'exportPDFSuccess': '¡PDF exportado con éxito!',
            'exportJPEGSuccess': '¡JPEG exportado con éxito!',
            'exportPNGError': 'Error al exportar PNG:',
            'exportPDFError': 'Error al exportar PDF:',
            'exportJPEGError': 'Error al exportar JPEG:',
            'tilesDownloaded': 'mosaicos descargados!',
            'batchScriptGenerated': 'Script por lotes corregido generado',
            'exportComplete': '¡Exportación completada!',
            'scriptsGenerated': 'Scripts generados',
            'doubleClickToAssemble': 'Doble clic para ensamblar:',
            'modeAutomatic': 'Modo automático',
            'exportedPage': '¡páginas exportadas!'
        },
        'hu': {
            'exportPNGSuccess': 'PNG sikeresen exportálva!',
            'exportPDFSuccess': 'PDF sikeresen exportálva!',
            'exportJPEGSuccess': 'JPEG sikeresen exportálva!',
            'exportPNGError': 'PNG exportálási hiba:',
            'exportPDFError': 'PDF exportálási hiba:',
            'exportJPEGError': 'JPEG exportálási hiba:',
            'tilesDownloaded': 'csempe letöltve!',
            'batchScriptGenerated': 'Javított batch script generálva',
            'exportComplete': 'Exportálás befejezve!',
            'scriptsGenerated': 'Szkriptek generálva',
            'doubleClickToAssemble': 'Dupla kattintás az összeszereléshez:',
            'modeAutomatic': 'Automatikus mód',
            'exportedPage': 'exportált oldalak!'
        }
    };
   
    const currentLang = window.CURRENT_LANGUAGE || 'fr';
    return exportTranslations[currentLang]?.[key] || exportTranslations['fr'][key] || key;
}

// ====================================
// Calculateur pour impression sur pages A4/A3
// ====================================

// Dimensions des zones imprimables (sans marges 6mm)
const PRINTABLE_AREAS = {
    'a4-portrait': { width: 198, height: 285, widthPx: 2339, heightPx: 3366 },
    'a4-landscape': { width: 285, height: 198, widthPx: 3366, heightPx: 2339 },
    'a3-portrait': { width: 285, height: 408, widthPx: 3366, heightPx: 4819 },
    'a3-landscape': { width: 408, height: 285, widthPx: 4819, heightPx: 3366 }
};

/**
 * Convertit un SVG en canvas 
 */
export async function svgToCanvas(svgElement, scale = 1) {
    return new Promise((resolve, reject) => {
        try {
            console.log('🔄 Conversion SVG vers Canvas...');
            
            // Cloner le SVG pour éviter de modifier l'original
            const clonedSvg = svgElement.cloneNode(true);
            
            // Nettoyer le SVG cloné
            cleanSVGForExport(clonedSvg);
            
            // Obtenir les dimensions réelles du SVG
            const svgRect = svgElement.getBoundingClientRect();
            const svgWidth = svgRect.width || parseInt(svgElement.getAttribute('width')) || 800;
            const svgHeight = svgRect.height || parseInt(svgElement.getAttribute('height')) || 600;
            
            console.log('📐 Dimensions SVG:', svgWidth, 'x', svgHeight);
            
            const canvasWidth = svgWidth * scale;
            const canvasHeight = svgHeight * scale;
            
            // Créer un canvas
            const canvas = document.createElement('canvas');
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            const ctx = canvas.getContext('2d');
            
            // Fond blanc
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            
            // Préparer le SVG pour la conversion
            clonedSvg.setAttribute('width', svgWidth);
            clonedSvg.setAttribute('height', svgHeight);
            clonedSvg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
            
            // Convertir SVG en string
            const svgString = new XMLSerializer().serializeToString(clonedSvg);
            console.log('📝 SVG sérialisé, longueur:', svgString.length);
            
            // Créer un Blob et une URL
            const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            const svgUrl = URL.createObjectURL(svgBlob);
            
            // Créer une image et la dessiner sur le canvas
            const img = new Image();
            img.onload = function() {
                console.log('🖼️ Image chargée, dessin sur canvas...');
                try {
                    ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
                    URL.revokeObjectURL(svgUrl);
                    console.log('✅ Conversion terminée');
                    resolve(canvas);
                } catch (drawError) {
                    console.error('❌ Erreur lors du dessin:', drawError);
                    URL.revokeObjectURL(svgUrl);
                    reject(drawError);
                }
            };
            
            img.onerror = function(error) {
                console.error('❌ Erreur de chargement de l\'image:', error);
                URL.revokeObjectURL(svgUrl);
                reject(new Error('Impossible de charger l\'image SVG'));
            };
            
            // Démarrer le chargement
            img.src = svgUrl;
            
        } catch (error) {
            console.error('❌ Erreur générale dans svgToCanvas:', error);
            reject(error);
        }
    });
}

/**
 * Supprime les éléments interactifs du SVG
 */
function removeInteractiveElements(svgElement) {
    // Supprimer les boutons de contrôle
    const controlButtons = svgElement.querySelectorAll('.control-button, .expand-button, .collapse-button');
    controlButtons.forEach(button => button.remove());
    
    // Supprimer les éléments de débug
    const debugElements = svgElement.querySelectorAll('.debug, .helper');
    debugElements.forEach(element => element.remove());
    
    // Nettoyer les événements
    const allElements = svgElement.querySelectorAll('*');
    allElements.forEach(element => {
        // Supprimer les attributs d'événements
        ['onclick', 'onmouseover', 'onmouseout', 'ondblclick'].forEach(attr => {
            element.removeAttribute(attr);
        });
        
        // Supprimer le curseur pointer
        if (element.style.cursor) {
            element.style.cursor = 'default';
        }
    });
}

/**
 * Nettoie les filtres et effets 
 */
function cleanFiltersAndEffects(svgElement) {
    // Assurer que les filtres sont bien définis
    let defs = svgElement.querySelector('defs');
    if (!defs) {
        defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        svgElement.insertBefore(defs, svgElement.firstChild);
    }
    
    // Ajouter le filtre d'ombre si manquant
    if (!defs.querySelector('#drop-shadow')) {
        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.setAttribute('id', 'drop-shadow');
        filter.setAttribute('height', '125%');
        filter.setAttribute('width', '125%');
        
        const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
        feGaussianBlur.setAttribute('in', 'SourceAlpha');
        feGaussianBlur.setAttribute('stdDeviation', '2');
        feGaussianBlur.setAttribute('result', 'blur');
        
        const feOffset = document.createElementNS('http://www.w3.org/2000/svg', 'feOffset');
        feOffset.setAttribute('in', 'blur');
        feOffset.setAttribute('dx', '2');
        feOffset.setAttribute('dy', '2');
        feOffset.setAttribute('result', 'offsetBlur');
        
        const feComponentTransfer = document.createElementNS('http://www.w3.org/2000/svg', 'feComponentTransfer');
        const feFuncA = document.createElementNS('http://www.w3.org/2000/svg', 'feFuncA');
        feFuncA.setAttribute('type', 'linear');
        feFuncA.setAttribute('slope', '0.5');
        feComponentTransfer.appendChild(feFuncA);
        
        const feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
        const feMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        feMergeNode1.setAttribute('in', 'offsetBlur');
        const feMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        feMergeNode2.setAttribute('in', 'SourceGraphic');
        
        feMerge.appendChild(feMergeNode1);
        feMerge.appendChild(feMergeNode2);
        
        filter.appendChild(feGaussianBlur);
        filter.appendChild(feOffset);
        filter.appendChild(feComponentTransfer);
        filter.appendChild(feMerge);
        
        defs.appendChild(filter);
    }
}

/**
 * Télécharge un canvas comme image
 */
export function downloadCanvas(canvas, filename, quality = 0.9, format = 'png') {
    try {
        console.log('🔍 DEBUG downloadCanvas:');
        console.log('  - filename:', filename);
        console.log('  - quality:', quality);
        console.log('  - format:', format);
        console.log('  - filename.toLowerCase().endsWith(.png):', filename.toLowerCase().endsWith('.png'));
        console.log('  - quality < 1:', quality < 1);
        
        const link = document.createElement('a');
        
        // Si PNG avec qualité < 1 (100%), convertir en JPEG
        if ((format === 'png' || filename.toLowerCase().endsWith('.png')) && quality < 1) {
            console.log('🟡 CONDITION 1: PNG avec qualité < 100% → Conversion JPEG');
            const jpegFilename = filename.replace(/\.png$/i, '.jpg');
            const qualityValue = Math.max(0.1, Math.min(1.0, quality));
            link.download = jpegFilename;
            link.href = canvas.toDataURL('image/jpeg', qualityValue);
            console.log('  → Fichier final:', jpegFilename);
        } else if (format === 'jpeg' || format === 'jpg' || filename.toLowerCase().endsWith('.jpg')) {
            console.log('🟠 CONDITION 2: Format JPEG demandé');
            const qualityValue = Math.max(0.1, Math.min(1.0, quality));
            link.download = filename;
            link.href = canvas.toDataURL('image/jpeg', qualityValue);
            console.log('  → Fichier final:', filename);
        } else {
            console.log('🟢 CONDITION 3: PNG qualité maximale');
            link.download = filename;
            link.href = canvas.toDataURL('image/png', 1.0);
            console.log('  → Fichier final:', filename);
        }
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('✅ Téléchargement initié:', link.download);
    } catch (error) {
        console.error('❌ Erreur lors du téléchargement:', error);
        throw error;
    }
}

/**
 * Crée un PDF à partir d'un canvas - VERSION CORRIGÉE
 */
async function createPDFFromCanvas(canvas, filename, quality = 0.9, pageFormat = null, pageLayout = null) {
    if (typeof window.jsPDF === 'undefined') {
        await loadJsPDF();
    }
    
    const { jsPDF } = window.jspdf;
    
    // AJOUT : Déterminer format et orientation depuis les paramètres
    let format = 'a4';
    let orientation = 'portrait';
    
    if (pageFormat) {
        // Extraire format (a4, a3) et orientation depuis pageFormat
        if (pageFormat.includes('a3')) format = 'a3';
        if (pageFormat.includes('landscape')) orientation = 'landscape';
    } else {
        // Fallback : déterminer selon les dimensions du canvas
        orientation = canvas.width > canvas.height ? 'landscape' : 'portrait';
    }
    
    console.log(`📄 Création PDF: format=${format}, orientation=${orientation}`);
    
    // Créer le PDF avec les bons paramètres
    const pdf = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: format,
        compress: true
    });
    
    // Obtenir les dimensions de la page PDF
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    console.log(`📐 Dimensions page PDF: ${pageWidth}mm × ${pageHeight}mm`);
    console.log(`📐 Dimensions canvas: ${canvas.width}px × ${canvas.height}px`);
    
    // IMPORTANT : Calculer le ratio pour conserver les proportions
    const canvasRatio = canvas.width / canvas.height;
    const pageRatio = pageWidth / pageHeight;
    
    let imgWidth, imgHeight, imgX, imgY;
    
    // VERSION SANS BANDES BLANCHES - Remplir toute la page
    if (canvasRatio > pageRatio) {
        // Canvas plus large que la page proportionnellement
        // On remplit toute la hauteur et on déborde sur les côtés
        imgHeight = pageHeight;
        imgWidth = pageHeight * canvasRatio;
        imgX = -(imgWidth - pageWidth) / 2; // Centrer (parties coupées sur les côtés)
        imgY = 0;
    } else {
        // Canvas plus haut que la page proportionnellement
        // On remplit toute la largeur et on déborde en haut/bas
        imgWidth = pageWidth;
        imgHeight = pageWidth / canvasRatio;
        imgX = 0;
        imgY = -(imgHeight - pageHeight) / 2; // Centrer (parties coupées en haut/bas)
    }
    
    console.log(`🖼️ Image dans PDF: ${imgWidth}mm × ${imgHeight}mm à position (${imgX}, ${imgY})`);
    
    // Utiliser le paramètre quality pour la compression JPEG
    const pdfQuality = Math.max(0.1, Math.min(1.0, quality));
    const imgData = canvas.toDataURL('image/jpeg', pdfQuality);
    
    // Ajouter l'image en respectant les proportions
    pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth, imgHeight);
    
    // Métadonnées
    const rootPersonName = state.currentTree?.name || 'Arbre généalogique';
    pdf.setProperties({
        title: `Arbre généalogique - ${rootPersonName}`,
        subject: 'Arbre généalogique',
        author: 'Application Généalogie',
        creator: 'Application Généalogie'
    });
    
    pdf.save(filename);
    console.log(`✅ PDF généré: ${filename} (${format} ${orientation}, qualité ${Math.round(pdfQuality*100)}%)`);
}

/**
 * Charge la bibliothèque jsPDF si nécessaire
 */
async function loadJsPDF() {
    return new Promise((resolve, reject) => {
        if (typeof window.jsPDF !== 'undefined') {
            resolve();
            return;
        }
        
        console.log('📦 Chargement de jsPDF...');
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = () => {
            console.log('✅ jsPDF chargé');
            resolve();
        };
        script.onerror = () => reject(new Error('Impossible de charger jsPDF'));
        document.head.appendChild(script);
    });
}

// /**
//  * Met les styles CSS en ligne dans le SVG pour le radar 
//  */
function inlineStylesOriginal(svgElement) {
    const svgElements = svgElement.querySelectorAll('*');
    
    // Styles par défaut pour l'éventail (version originale SANS les couleurs fixes)
    const defaultStyles = {
        '.person-box': {
            'stroke': '#333',
            'stroke-width': '1px'
        },
        '.person-box.root': {
            'fill': '#ff6b6b',
            'stroke': 'white',
            'stroke-width': '4px'
        },
        '.center-person': {
            'fill': '#ff6b6b',
            'stroke': 'white',
            'stroke-width': '4px'
        },
        '.person-box.spouse': {
            'fill': '#98fb98',
            'stroke': '#333',
            'stroke-width': '2px'
        },
        '.person-box.sibling': {
            'fill': '#ffd700',
            'stroke': '#333',
            'stroke-width': '2px'
        },
        // '.person-segment': {
        //     'stroke': 'white',
        //     'stroke-width': '1.5px'
        // },
        //     // NOUVEAU : styles minimalistes pour générations élevées
        // '.generation-9, .generation-10, .generation-11, .generation-12': {
        //     'stroke': 'rgba(200,200,200,0.3)',
        //     'stroke-width': '0.001px',
        //     'filter': 'none'
        // },
        // PAS de couleurs fixes pour les générations - on garde les vraies couleurs
        'text': {
            'font-family': 'Arial, sans-serif',
            'fill': '#000'
        },
        '.center-text': {
            'fill': 'white',
            'font-weight': 'bold',
            'text-anchor': 'middle'
        },
        '.segment-text': {
            'fill': '#333',
            'text-anchor': 'middle'
        }
    };
    
    // Appliquer les styles (logique originale)
    svgElements.forEach(element => {
        const classList = Array.from(element.classList);
        
        // Appliquer les styles basés sur les classes (SAUF génération)
        classList.forEach(className => {
            const selector = '.' + className;
            if (defaultStyles[selector]) {
                Object.entries(defaultStyles[selector]).forEach(([prop, value]) => {
                    element.style.setProperty(prop, value);
                });
            }
        });


        // NOUVEAU : Gestion dynamique des générations
        const generationClass = classList.find(cls => cls.startsWith('generation-'));
        if (generationClass) {
            const generation = parseInt(generationClass.replace('generation-', ''));
            
            // Appliquer les styles selon la génération
            if (generation <= 8) {
                // Style normal pour gen <= 8 (géré par getSegmentStyle)
                // Ne rien faire ici, laisser les styles originaux
                element.style.setProperty('stroke', 'white');
                element.style.setProperty('stroke-width', '1.5px');          

            } else if (generation <= 12) {
                // Style minimaliste pour gen 9-12
                element.style.setProperty('stroke', 'rgba(200,200,200,0.3)');
                element.style.setProperty('stroke-width', '0.1px');
                element.style.setProperty('filter', 'none');
            } else {
                // Style ultra-minimaliste pour gen 13+
                element.style.setProperty('stroke', 'none');
                element.style.setProperty('stroke-width', '0');
                element.style.setProperty('filter', 'none');
            }
        }


        
        // Capturer et appliquer les couleurs réelles
        const computedStyle = window.getComputedStyle(element);
        const importantStyles = ['fill', 'stroke', 'stroke-width', 'font-family', 'font-size', 'font-weight', 'text-anchor'];
        importantStyles.forEach(prop => {
            const value = computedStyle.getPropertyValue(prop);
            if (value && value !== 'none') {
                element.style.setProperty(prop, value);
            }
        });
    });
    
    console.log('✅ Styles originaux appliqués (mode radar) avec couleurs réelles');




    // Appliquer les styles fixes
    svgElements.forEach(element => {
        const classList = Array.from(element.classList);
        
        // Appliquer les styles basés sur les classes fixes
        classList.forEach(className => {
            const selector = '.' + className;
            if (defaultStyles[selector]) {
                Object.entries(defaultStyles[selector]).forEach(([prop, value]) => {
                    element.style.setProperty(prop, value);
                });
            }
        });
        
        // NOUVEAU : Gestion dynamique des générations
        const generationClass = classList.find(cls => cls.startsWith('generation-'));
        if (generationClass) {
            const generation = parseInt(generationClass.replace('generation-', ''));
            
            // Appliquer les styles selon la génération
            if (generation <= 8) {
                // Style normal pour gen <= 8 (géré par getSegmentStyle)
                // Ne rien faire ici, laisser les styles originaux
            } else if (generation <= 12) {
                // Style minimaliste pour gen 9-12
                element.style.setProperty('stroke', 'rgba(200,200,200,0.3)');
                element.style.setProperty('stroke-width', '0.1px');
                element.style.setProperty('filter', 'none');
            } else {
                // Style ultra-minimaliste pour gen 13+
                element.style.setProperty('stroke', 'none');
                element.style.setProperty('stroke-width', '0');
                element.style.setProperty('filter', 'none');
            }
        }
        
        // Capturer et appliquer les couleurs réelles
        const computedStyle = window.getComputedStyle(element);
        const importantStyles = ['fill', 'stroke', 'stroke-width', 'font-family', 'font-size', 'font-weight', 'text-anchor'];
        importantStyles.forEach(prop => {
            const value = computedStyle.getPropertyValue(prop);
            if (value && value !== 'none') {
                element.style.setProperty(prop, value);
            }
        });
    });
    
    console.log('✅ Styles appliqués avec gestion dynamique des générations');
}

/**
 * Nettoie et prépare spécifiquement les boîtes en préservant leurs couleurs exactes
 */
function fixBoxesForExport(svgElement) {
    console.log('🔧 Correction des boîtes avec préservation des couleurs exactes...');
    
    const boxes = svgElement.querySelectorAll('rect');
    
    boxes.forEach((box, index) => {
        try {
            // Trouver l'élément correspondant dans le SVG original (non cloné)
            const originalSvg = document.querySelector('#tree-svg');
            if (originalSvg) {
                const originalBoxes = originalSvg.querySelectorAll('rect');
                if (originalBoxes[index]) {
                    // Copier les styles exacts de l'original
                    copyExactStyles(originalBoxes[index], box);
                }
            }
        } catch (error) {
            console.warn(`Erreur lors de la correction de la boîte ${index}:`, error);
        }
    });
    
    console.log(`✅ ${boxes.length} boîtes corrigées avec couleurs exactes`);
}

/**
 * Nettoie et prépare spécifiquement les textes en préservant leurs polices exactes
 */
function fixTextsForExport(svgElement) {
    console.log('🔤 Correction des textes avec préservation des polices exactes...');
    
    const texts = svgElement.querySelectorAll('text, tspan');
    
    texts.forEach((text, index) => {
        try {
            // Trouver l'élément correspondant dans le SVG original
            const originalSvg = document.querySelector('#tree-svg');
            if (originalSvg) {
                const originalTexts = originalSvg.querySelectorAll('text, tspan');
                if (originalTexts[index]) {
                    // Copier les styles exacts de l'original
                    copyExactStyles(originalTexts[index], text);
                }
            }
        } catch (error) {
            console.warn(`Erreur lors de la correction du texte ${index}:`, error);
        }
    });
    
    console.log(`✅ ${texts.length} textes corrigés avec polices exactes`);
}

/**
 * Met les styles CSS en ligne dans le SVG - VERSION QUI PRESERVE L'APPARENCE EXACTE
 */
function inlineStyles(svgElement) {
    console.log('🎨 Application des styles réels depuis l\'affichage web...');
    
    const svgElements = svgElement.querySelectorAll('*');
    
    svgElements.forEach((element, index) => {
        try {
            // Récupérer les styles calculés réels de l'élément
            const computedStyle = window.getComputedStyle(element);
            const tagName = element.tagName.toLowerCase();
            
            // Liste complète des propriétés CSS importantes selon le type d'élément
            let importantStyles = [];
            
            if (tagName === 'rect') {
                // Pour les rectangles (boîtes des personnes)
                importantStyles = [
                    'fill', 'stroke', 'stroke-width', 'stroke-opacity', 'fill-opacity',
                    'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin'
                ];
            } else if (tagName === 'path') {
                // Pour les chemins (liens)
                importantStyles = [
                    'fill', 'stroke', 'stroke-width', 'stroke-opacity', 'fill-opacity',
                    'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin'
                ];
            } else if (tagName === 'text' || tagName === 'tspan') {
                // Pour les textes
                importantStyles = [
                    'fill', 'stroke', 'stroke-width', 'font-family', 'font-size', 
                    'font-weight', 'font-style', 'text-anchor', 'dominant-baseline',
                    'alignment-baseline', 'baseline-shift', 'text-decoration',
                    'letter-spacing', 'word-spacing', 'opacity'
                ];
            } else if (tagName === 'circle' || tagName === 'ellipse') {
                // Pour les cercles/ellipses
                importantStyles = [
                    'fill', 'stroke', 'stroke-width', 'stroke-opacity', 'fill-opacity',
                    'stroke-dasharray', 'opacity'
                ];
            } else {
                // Pour tous les autres éléments
                importantStyles = [
                    'fill', 'stroke', 'stroke-width', 'stroke-opacity', 'fill-opacity',
                    'font-family', 'font-size', 'font-weight', 'text-anchor',
                    'opacity', 'stroke-dasharray'
                ];
            }
            
            // Appliquer chaque style calculé
            importantStyles.forEach(prop => {
                const value = computedStyle.getPropertyValue(prop);
                if (value && value !== 'none' && value !== 'initial' && value !== 'inherit' && value !== '') {
                    // Vérifier si c'est une valeur valide (pas de rgb(0, 0, 0) par défaut non voulu)
                    if (prop === 'fill' && tagName === 'path' && value === 'rgb(0, 0, 0)') {
                        // Pour les path, forcer fill: none si c'est noir par défaut
                        element.style.setProperty(prop, 'none', 'important');
                    } else {
                        element.style.setProperty(prop, value, 'important');
                    }
                }
            });
            
            // Corrections spécifiques par type d'élément
            if (tagName === 'path') {
                // S'assurer que les path (liens) n'ont pas de fill
                if (!element.style.getPropertyValue('fill') || element.style.getPropertyValue('fill') === 'rgb(0, 0, 0)') {
                    element.style.setProperty('fill', 'none', 'important');
                }
                // S'assurer qu'ils ont un stroke
                if (!element.style.getPropertyValue('stroke') || element.style.getPropertyValue('stroke') === 'none') {
                    element.style.setProperty('stroke', '#999', 'important');
                    element.style.setProperty('stroke-width', '2px', 'important');
                }
            }
            
            if (tagName === 'rect') {
                // Pour les rectangles, s'assurer qu'ils ont un fill
                if (!element.style.getPropertyValue('fill') || element.style.getPropertyValue('fill') === 'none') {
                    element.style.setProperty('fill', '#f0f8ff', 'important');
                }
            }
            
        } catch (error) {
            console.warn(`Erreur lors de l'application des styles pour l'élément ${index}:`, error);
        }
    });
    
    console.log(`✅ Styles réels appliqués sur ${svgElements.length} éléments`);
}

/**
 * Capture et applique les styles exacts d'un élément source vers un élément cible
 */
function copyExactStyles(sourceElement, targetElement) {
    if (!sourceElement || !targetElement) return;
    
    try {
        const computedStyle = window.getComputedStyle(sourceElement);
        const tagName = targetElement.tagName.toLowerCase();
        
        // Propriétés CSS à copier selon le type d'élément
        const propertiesToCopy = {
            rect: [
                'fill', 'stroke', 'stroke-width', 'stroke-opacity', 'fill-opacity',
                'rx', 'ry', 'opacity'
            ],
            path: [
                'fill', 'stroke', 'stroke-width', 'stroke-opacity', 'stroke-dasharray',
                'stroke-linecap', 'stroke-linejoin', 'opacity'
            ],
            text: [
                'fill', 'font-family', 'font-size', 'font-weight', 'font-style',
                'text-anchor', 'dominant-baseline', 'opacity', 'letter-spacing'
            ],
            tspan: [
                'fill', 'font-family', 'font-size', 'font-weight', 'font-style',
                'text-anchor', 'dominant-baseline', 'opacity'
            ]
        };
        
        const props = propertiesToCopy[tagName] || propertiesToCopy.rect;
        
        props.forEach(prop => {
            const value = computedStyle.getPropertyValue(prop);
            if (value && value !== 'initial' && value !== 'inherit') {
                targetElement.style.setProperty(prop, value, 'important');
            }
        });
        
    } catch (error) {
        console.warn('Erreur lors de la copie des styles:', error);
    }
}



/**
 * Nettoie et prépare spécifiquement les liens pour l'export
 */
function fixLinksForExport(svgElement) {
    console.log('🔧 Correction spécifique des liens...');
    
    // Sélectionner tous les éléments path (liens)
    const links = svgElement.querySelectorAll('path');
    
    links.forEach(link => {
        // Forcer les styles essentiels pour éviter les formes noires
        link.style.setProperty('fill', 'none', 'important');
        
        // Appliquer les styles selon la classe
        if (link.classList.contains('sibling-link')) {
            link.style.setProperty('stroke', '#4CAF50', 'important');
            link.style.setProperty('stroke-width', '2px', 'important');
            link.style.setProperty('stroke-dasharray', '5,5', 'important');
        } else if (link.classList.contains('spouse-link')) {
            link.style.setProperty('stroke', '#FF9800', 'important');
            link.style.setProperty('stroke-width', '2px', 'important');
        } else if (link.classList.contains('link') || !link.style.getPropertyValue('stroke')) {
            // Lien standard ou lien sans style défini
            link.style.setProperty('stroke', '#999', 'important');
            link.style.setProperty('stroke-width', '2px', 'important');
        }
        
        // S'assurer de l'opacité
        if (!link.style.getPropertyValue('stroke-opacity')) {
            link.style.setProperty('stroke-opacity', '0.8', 'important');
        }
    });
    
    console.log(`✅ ${links.length} liens corrigés pour l'export`);
}

/**
 * Supprime les symboles d'expansion/collapse lors de l'export
 */
function removeSymbols(svgElement) {
    console.log('🔧 Suppression des symboles pour export...');
    
    // Liste des symboles à supprimer (vous pouvez en ajouter d'autres)
    const symbolsToRemove = [
        '✶',  // Étoile Unicode
        '+',  // Plus
        '-',  // Tiret
    ];
    
    // Sélectionner tous les éléments text et tspan
    const textElements = svgElement.querySelectorAll('text, tspan');
    let removedCount = 0;
    
    textElements.forEach(textElement => {
        // Récupérer le contenu textuel (en supprimant les espaces)
        const textContent = textElement.textContent?.trim();
        
        // Vérifier si c'est un symbole à supprimer
        if (textContent && symbolsToRemove.includes(textContent)) {
            // console.log(`  → Suppression symbole: "${textContent}"`);
            textElement.remove();
            removedCount++;
        }
    });
    
    // console.log(`✅ ${removedCount} symbole(s) supprimé(s) pour l'export`);


}

/**
 * VERSION COHÉRENTE avec copyExactStyles - CORRECTION OPACITÉ
 */
function fixBackgroundForExport(svgElement) {
    console.log('🎨 ===== CORRECTION BACKGROUND dans fixBackgroundForExport =====');
    
    const backgroundLeaves = svgElement.querySelectorAll('.background-element path');
    const backgroundBranches = svgElement.querySelectorAll('.background-element line');
    
    // console.log(`📊 Éléments trouvés:`);
    // console.log(`  → Feuilles: ${backgroundLeaves.length}`);
    // console.log(`  → Branches: ${backgroundBranches.length}`);
    
    // RÉCUPÉRER LES ORIGINAUX
    const originalSvg = document.querySelector('#tree-svg');
    if (!originalSvg) {
        console.error('❌ SVG original non trouvé');
        return;
    }
    
    const originalLeaves = originalSvg.querySelectorAll('.background-element path');
    const originalBranches = originalSvg.querySelectorAll('.background-element line');
    
    // RÉCUPÉRER L'OPACITÉ GLOBALE DU BACKGROUND
    const backgroundGroup = originalSvg.querySelector('.background-element');
    const globalOpacity = backgroundGroup ? parseFloat(window.getComputedStyle(backgroundGroup).opacity || 1) : 1;
    // console.log(`🔍 Opacité globale background: ${globalOpacity}`);
    
    // 1. CORRIGER LES FEUILLES avec copyExactStyles
    // console.log(`\n🍃 CORRECTION FEUILLES:`);
    backgroundLeaves.forEach((leaf, index) => {
        if (originalLeaves[index]) {
            copyExactStylesForBackground(originalLeaves[index], leaf, 'path', index, globalOpacity);
        }
    });
    
    // 2. CORRIGER LES BRANCHES avec copyExactStyles  
    // console.log(`\n🌿 CORRECTION BRANCHES:`);
    backgroundBranches.forEach((branch, index) => {
        if (originalBranches[index]) {
            copyExactStylesForBackground(originalBranches[index], branch, 'line', index, globalOpacity);
        }
    });
    
    console.log(`\n✅ Background corrigé avec logique copyExactStyles`);
}

/**
 * Version cohérente de copyExactStyles pour background - CORRECTION OPACITÉ
 */
function copyExactStylesForBackground(sourceElement, targetElement, elementType, index, globalOpacity = 1) {
    if (!sourceElement || !targetElement) return;
    
    try {
        // UTILISER LES ATTRIBUTS DIRECTS au lieu de getComputedStyle
        let propertiesToCopy;
        if (elementType === 'path') {
            propertiesToCopy = ['fill', 'stroke', 'stroke-width', 'stroke-opacity', 'fill-opacity', 'opacity'];
        } else if (elementType === 'line') {
            propertiesToCopy = ['stroke', 'stroke-width', 'stroke-opacity', 'opacity'];
        }
        
        // Appliquer chaque style depuis les attributs directs
        propertiesToCopy.forEach(prop => {
            let value = sourceElement.getAttribute(prop);
            
            // Si pas d'attribut direct, utiliser getComputedStyle mais corriger l'opacité
            if (!value || value === 'none' || value === '') {
                const computedStyle = window.getComputedStyle(sourceElement);
                value = computedStyle.getPropertyValue(prop);
                
                // CORRECTION OPACITÉ: Diviser par l'opacité globale pour retrouver l'opacité originale
                if ((prop === 'opacity' || prop === 'fill-opacity' || prop === 'stroke-opacity') && value && globalOpacity < 1) {
                    const numericValue = parseFloat(value);
                    if (!isNaN(numericValue) && numericValue > 0) {
                        // Reconstituer l'opacité originale
                        const originalOpacity = Math.min(1, numericValue / globalOpacity);
                        value = originalOpacity.toString();
                        
                        // if (index < 2) {
                        //     console.log(`  🔧 ${elementType} ${index + 1} ${prop}: "${numericValue}" → "${originalOpacity}" (corrigé)`);
                        // }
                    }
                }
            }
            
            if (value && value !== 'initial' && value !== 'inherit' && value !== '') {
                targetElement.style.setProperty(prop, value, 'important');
                
                // if (index < 2) {
                //     console.log(`  ${elementType} ${index + 1} ${prop}: "${value}"`);
                // }
            }
        });
        
    } catch (error) {
        console.warn(`Erreur copyExactStyles ${elementType} ${index}:`, error);
    }
}

/**
 * Nettoie le SVG pour l'export 
 */
function cleanSVGForExport(svgElement) {
    console.log('🧹 Nettoyage du SVG pour export...');
    

    // Détecter le mode d'affichage
    const isWheelMode = detectWheelMode(svgElement);
    console.log(`📊 Mode détecté: ${isWheelMode ? 'Wheel/Radar' : 'Tree/Arbre'}`);
    
    // Étapes existantes
    const rect = svgElement.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 600;
    
    svgElement.setAttribute('width', width);
    svgElement.setAttribute('height', height);
    svgElement.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      
    if (isWheelMode) {
        // RADAR/WHEEL : Utiliser la logique originale qui marchait bien
        console.log('🎡 Mode Radar: utilisation de la logique originale');


        // NOUVEAU : Correction spécifique des boîtes avec couleurs exactes
        fixBoxesForExport(svgElement);
        
        // NOUVEAU : Correction spécifique des textes avec polices exactes
        fixTextsForExport(svgElement);


        inlineStylesOriginal(svgElement);
    } else {
       
        // Correction spécifique des boîtes avec couleurs exactes
        fixBoxesForExport(svgElement);
        
        // Correction spécifique des textes avec polices exactes
        fixTextsForExport(svgElement);

        // Correction spécifique des liens
        fixLinksForExport(svgElement);
        
        // Appliquer les styles réels (maintenant avec les corrections spécifiques)
        inlineStyles(svgElement);

        removeSymbols(svgElement);

        // Supprimer l'ancien background (taille écran)
        // svgElement.querySelectorAll('.background-element').forEach(bg => bg.remove());
    }


    // Supprimer les éléments interactifs
    removeInteractiveElements(svgElement);
    
    // Nettoyer les filtres et effets
    cleanFiltersAndEffects(svgElement);


    // Correction du background AVANT les autres corrections
    fixBackgroundForExport(svgElement);

    
    console.log('✅ Nettoyage SVG terminé avec correction des liens et boîtes');
}

function drawBackgroundImageSmartTiling(ctx, img, canvasWidth, canvasHeight, opacity, globalOffsetX = 0, globalOffsetY = 0) {
    const MAX_SCALE = 3.0;
    
    console.log(`🎨 Stratégie D - Image: ${img.width}x${img.height}, Canvas: ${canvasWidth}x${canvasHeight}, globalOffset: ${globalOffsetX}x${globalOffsetY}`);
    
    // 1. CALCUL DU SCALE OPTIMAL (identique)
    const baseScale = Math.min(Math.min(canvasWidth / img.width, canvasHeight / img.height), MAX_SCALE);
    let scaledWidth = img.width * baseScale;
    let scaledHeight = img.height * baseScale;
    
    // 2. SI L'IMAGE UPSCALÉE COUVRE TOUT
    if (scaledWidth >= canvasWidth && scaledHeight >= canvasHeight) {
        console.log('✅ Image upscalée couvre tout');
        const offsetX = (canvasWidth - scaledWidth) / 2;
        const offsetY = (canvasHeight - scaledHeight) / 2;
        
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
        ctx.restore();
        return;
    }
    
    // 3. MOSAÏQUE MIROIR AVEC TRAITEMENT SPÉCIAL PREMIÈRE et DERNIERE TUILE
    console.log('🔄 Tiling avec continuité globale');
    
    ctx.save();
    ctx.globalAlpha = opacity;
    
    let tilesX = Math.ceil(canvasWidth / scaledWidth);
    let tilesY = Math.ceil(canvasHeight / scaledHeight);
    if (globalOffsetY > 0) { tilesY++; }
    let lastTileIsComputed = false;
    
    let destY = 0;
    let scaledHeightVariable;

    console.log('🔄 Tiling avec continuité globale', 'nbTilesX', tilesX, canvasWidth / scaledWidth, 'nbTilesY', tilesY );

    let flipH = false;
    let isBackGroundImageFullyUsed = true;

    for (let tileY = 0; tileY < tilesY; tileY++) {
        flipH = false;
        let sourceY = 0;
        let sourceHeight = img.height;
        let destHeight = scaledHeight;
        scaledHeightVariable = scaledHeight;
        // const globalY = globalOffsetY + y;

        // TRAITEMENT SPÉCIAL : première tuile verticale peut être coupée
        if (tileY === 0 && globalOffsetY > 0) {
            // PREMIÈRE TUILE : calculer où commencer dans l'image
            const offsetInImage = globalOffsetY % scaledHeight;
            destHeight = scaledHeight - offsetInImage;
            scaledHeightVariable = destHeight;
            sourceHeight = destHeight / baseScale;
            sourceY = offsetInImage / baseScale;
            if (flipV) { sourceY = 0; }  
        }


        // TRAITEMENT SPÉCIAL : dernière tuile verticale peut être coupée
        if (destY + scaledHeightVariable > canvasHeight) {
            destHeight = canvasHeight - destY ;  // Couper la dernière tuile
            sourceHeight = destHeight / baseScale;
            if (flipV) { sourceY = (scaledHeight - destHeight) / baseScale; }
            lastTileIsComputed = true;
            if (tileY === 0) { isBackGroundImageFullyUsed = false;}
        }

        let display_log = false;
        let log_text = null;
        if (tileY === 0 && globalOffsetY === 0) { log_text = ' Première tuile entière'; display_log = true; }
        else if (tileY === 0 && globalOffsetY > 0) {log_text = ' Première tuile non entière'; display_log = true; }
        else if (destY + scaledHeightVariable > canvasHeight) { log_text = ' Dernière tuile non entière '; display_log = true;}


        for (let tileX = 0; tileX < tilesX; tileX++) {
            const x = tileX * scaledWidth;
            const y = tileY * scaledHeight;
            
            // Position globale de cette tuile
            // const globalX = globalOffsetX + x;           
            // const globalMosaicX = Math.floor(globalX / scaledWidth);

            // const flipH = globalMosaicX % 2 === 1;
            // const flipV = globalMosaicY % 2 === 1;
         
                              
            ctx.save();
                       
            if (flipH || flipV) {
                ctx.translate(x + scaledWidth / 2, destY + destHeight / 2);
                if (flipH) ctx.scale(-1, 1);
                if (flipV) ctx.scale(1, -1);
                ctx.drawImage(img, 0, sourceY, img.width, sourceHeight, 
                             -scaledWidth / 2, -destHeight / 2, scaledWidth, destHeight);
                if (tileX === 0 && display_log) {
                    console.log(`🎯 ${log_text} inversée, drawImage(img, srcX, srcY, srcW, srcH, dstX, destY, dstW, dstH); srcX=${0}, srcY=${sourceY}, srcW=${img.width}, srcH=${sourceHeight}, dstX=${-scaledWidth / 2}, dstY=${-destHeight / 2}, dstW=${scaledWidth}, dstH=${destHeight}, baseScale=${baseScale}`);
                }

            } else {
                ctx.drawImage(img, 0, sourceY, img.width, sourceHeight, 
                             x, destY, scaledWidth, destHeight);

                if (tileX === 0 && display_log) {
                    console.log(`🎯 ${log_text} normale, drawImage(img, srcX, srcY, srcW, srcH, dstX, destY, dstW, dstH); srcX=${0}, srcY=${sourceY}, srcW=${img.width}, srcH=${sourceHeight}, dstX=${x}, dstY=${destY}, dstW=${scaledWidth}, dstH=${destHeight}, baseScale=${baseScale}`);
                }
            }

            ctx.restore();
            flipH = !flipH;
        }
        destY = destY + scaledHeightVariable;

        if ( destHeight === scaledHeight ||  (tileY === 0 && isBackGroundImageFullyUsed) ) {
            // on commute le flipV si on a fini une tile avec image entière
            // on vérifie aussi si il y avait une seule Tile (tileY === 0 ) si toute l'image est entièrement utilisée (isBackGroundImageFullyUsed)
            flipV = !flipV;
        }

        if (lastTileIsComputed) break;
    }
    
    ctx.restore();
    console.log('✅ Mosaïque avec continuité terminée');
}

function drawBackgroundForRegion(ctx, regionX, regionY, regionWidth, regionHeight, totalWidth, totalHeight) {
    return new Promise((resolve) => {
        const savedBackground = localStorage.getItem('preferredBackground');
        
        if (state.backgroundEnabled && savedBackground === 'customImage') {
            const backgroundImagePath = localStorage.getItem('customImagePath');
            if (backgroundImagePath) {
                const backgroundOpacity = parseFloat(localStorage.getItem('backgroundOpacity') || 0.15);
                
                const bgImg = new Image();
                bgImg.onload = function() {
                    drawBackgroundImageSmartTiling(ctx, bgImg, regionWidth, regionHeight, backgroundOpacity, regionX, regionY);
                    resolve(true);
                };
                
                bgImg.onerror = () => resolve(false);
                bgImg.src = backgroundImagePath;
            } else {
                resolve(false);
            }
        } else {
            resolve(false);
        }
    });
}

/**
 * Conversion SVG vers Canvas avec dimensions complètes
 */
export async function svgToCanvasFullTree(svgElement, scaleFactor, fullDimensions, targetFormat = null) {
    return new Promise((resolve, reject) => {
        try {
            console.log(`🔄 Conversion SVG complet vers Canvas (${scaleFactor}x)...`);
            
            // Cloner et nettoyer le SVG
            const clonedSvg = svgElement.cloneNode(true);
                        
            // Reset du zoom pour export
            console.log('🔄 Reset du zoom pour export');
            const mainGroups = clonedSvg.querySelectorAll('g');
            mainGroups.forEach((group, index) => {
                if (index === 0) { // Premier groupe = groupe principal avec le zoom
                    const currentTransform = group.getAttribute('transform');
                    console.log(`  Transform actuel: ${currentTransform}`);
                    // Supprimer la transformation de zoom
                    group.removeAttribute('transform');
                    // Remettre une transformation neutre
                    group.setAttribute('transform', 'translate(0,0) scale(1)');
                    console.log('  → Transform réinitialisé à translate(0,0) scale(1)');
                }
            });
            
            // Nettoyer le SVG (APRÈS le reset du zoom)
            cleanSVGForExport(clonedSvg);

            // AMÉLIORATION QUALITÉ TEXTE POUR EXPORT
            console.log('📝 Amélioration qualité texte pour export...');
            const allTexts = clonedSvg.querySelectorAll('text, tspan');
            allTexts.forEach(text => {
                text.style.setProperty('text-rendering', 'optimizeLegibility', 'important');
                text.style.setProperty('shape-rendering', 'crispEdges', 'important');
            });

            console.log(`✅ ${allTexts.length} textes améliorés`);
            
            
            
            // Utiliser les dimensions réelles de l'arbre
            let finalWidth = fullDimensions.width * scaleFactor;
            let finalHeight = fullDimensions.height * scaleFactor;
            console.log(`📐 Canvas classique: ${finalWidth}×${finalHeight}px`);


            if (targetFormat) {
                // MODE A4/A3 : Utiliser les dimensions du format cible
                const scaleW = targetFormat.width / fullDimensions.width;
                const scaleH = targetFormat.height / fullDimensions.height;
                const scaleFinal = Math.min(scaleW, scaleH );

                finalWidth = fullDimensions.width * scaleFinal;
                finalHeight = fullDimensions.height * scaleFinal;
                console.log(`📐 Canvas format ${targetFormat.pageFormat}: ${finalWidth}×${finalHeight}px`);
            }            

            console.log(`📊 Canvas final: ${finalWidth}×${finalHeight} pixels`);
            
            // Vérifier les limites
            if (finalWidth > 65535 || finalHeight > 65535) {
                console.warn('⚠️ Dimensions très importantes, export en plusieurs parties recommandé');
            }
  
            // Créer le canvas
            const canvas = document.createElement('canvas');
            canvas.width = finalWidth;
            canvas.height = finalHeight;
            const ctx = canvas.getContext('2d');
            
            console.log(`🔍 VÉRIFICATION RÉSOLUTION:`);
            console.log(`  - DPI demandé: ${Math.round(150 * scaleFactor)}`);
            console.log(`  - ScaleFactor: ${scaleFactor}`);
            console.log(`  - Dimensions SVG: ${fullDimensions.width}×${fullDimensions.height}`);
            console.log(`  - Canvas final: ${canvas.width}×${canvas.height} pixels`);
            console.log(`  - Taille estimée: ${(canvas.width * canvas.height * 4 / 1024 / 1024).toFixed(1)} MB`);

            // Vérifier les limites
            if (canvas.width > maxCanvasSize || canvas.height > maxCanvasSize) {
                console.error(`❌ DIMENSIONS DÉPASSENT LES LIMITES CANVAS !`);
                console.error(`   Limite: ${maxCanvasSize}x${maxCanvasSize}, Demandé: ${canvas.width}×${canvas.height}`);
                throw new Error('Canvas trop grand pour le navigateur');
            }

            // Améliorer la qualité
            ctx.imageSmoothingQuality = 'high';
            ctx.imageSmoothingEnabled = false; // Pas de lissage pour du texte net

            // Fonction pour dessiner le SVG après le fond
            const drawSVGContent = () => {
                // Configurer le SVG avec les dimensions réelles
                clonedSvg.setAttribute('width', fullDimensions.width);
                clonedSvg.setAttribute('height', fullDimensions.height);
                clonedSvg.setAttribute('viewBox', `${fullDimensions.minX} ${fullDimensions.minY} ${fullDimensions.width} ${fullDimensions.height}`);
                
                // Sérialiser le SVG
                const svgString = new XMLSerializer().serializeToString(clonedSvg);
                const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
                const svgUrl = URL.createObjectURL(svgBlob);
                
                // Créer l'image
                const img = new Image();
                img.onload = function() {
                    console.log('🖼️ Image SVG chargée, dessin arbre complet...');
                    try {
                        ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
                        URL.revokeObjectURL(svgUrl);
                        console.log(`✅ Conversion arbre complet terminée`);
                        resolve(canvas);
                    } catch (drawError) {
                        console.error('❌ Erreur lors du dessin:', drawError);
                        URL.revokeObjectURL(svgUrl);
                        reject(drawError);
                    }
                };
                
                img.onerror = function(error) {
                    console.error('❌ Erreur de chargement image:', error);
                    URL.revokeObjectURL(svgUrl);
                    reject(new Error('Impossible de charger l\'image SVG'));
                };
                
                img.src = svgUrl;
            };

            // Vérifier s'il faut dessiner une image de fond
            const savedBackground = localStorage.getItem('preferredBackground');
            
            if (state.backgroundEnabled && savedBackground === 'customImage') {
                console.log('🖼️ Image de fond détectée pour export');
                
                const backgroundImagePath = localStorage.getItem('customImagePath');
                if (backgroundImagePath) {
                    const backgroundOpacity = parseFloat(localStorage.getItem('backgroundOpacity') || 0.15);
                    
                    // Fond blanc d'abord
                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, finalWidth, finalHeight);
                    
                    // Charger et dessiner l'image de fond
                    const bgImg = new Image();
                    bgImg.onload = function() {
                        console.log('🖼️ Image de fond chargée pour export');
                        console.log('📐 Taille image:', bgImg.width, 'x', bgImg.height);
                        console.log('📐 Taille canvas:', finalWidth, 'x', finalHeight);

                        // Dessiner le background puis continuer
                        drawBackgroundForRegion(ctx, 0, 0, finalWidth, finalHeight, finalWidth, finalHeight)
                            .then(() => {
                                // Une fois le background terminé, dessiner le SVG
                                drawSVGContent();
                            });

                        console.log('✅ Image de fond dessinée');
                    };
                    
                    bgImg.onerror = function() {
                        console.warn('⚠️ Impossible de charger l\'image de fond pour export');
                        // Fond blanc et continuer sans image
                        ctx.fillStyle = 'white';
                        ctx.fillRect(0, 0, finalWidth, finalHeight);
                        drawSVGContent();
                    };
                    
                    bgImg.src = backgroundImagePath;
                } else {
                    // Pas d'image de fond, fond blanc et continuer
                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, finalWidth, finalHeight);
                    drawSVGContent();
                }
            } else {
                // Pas d'image de fond, fond blanc et continuer
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, finalWidth, finalHeight);
                drawSVGContent();
            }
            
        } catch (error) {
            console.error('❌ Erreur générale export complet:', error);
            reject(error);
        }
    });
}

/**
 * Détecte si nous sommes en mode wheel/radar 
 */
function detectWheelMode(svgElement) {
    console.log('🔍 DÉTECTION DU MODE - Début analyse...');
    
    // Chercher des éléments spécifiques au mode wheel
    const segments = svgElement.querySelectorAll('.person-segment');
    const centerPerson = svgElement.querySelector('.center-person');
    const generationElements = svgElement.querySelectorAll('[class*="generation-"]');
    const segmentTexts = svgElement.querySelectorAll('.segment-text');
    
    console.log('📊 ÉLÉMENTS TROUVÉS:');
    console.log(`  - Segments (.person-segment): ${segments.length}`);
    console.log(`  - Centre (.center-person): ${centerPerson ? 'OUI' : 'NON'}`);
    console.log(`  - Générations ([class*="generation-"]): ${generationElements.length}`);
    console.log(`  - Textes segments (.segment-text): ${segmentTexts.length}`);
    
    // Analyser les classes présentes
    const allElements = svgElement.querySelectorAll('*');
    const foundClasses = new Set();
    allElements.forEach(el => {
        Array.from(el.classList).forEach(cls => {
            if (cls.includes('segment') || cls.includes('generation') || cls.includes('center') || cls.includes('wheel')) {
                foundClasses.add(cls);
            }
        });
    });
    
    console.log('🏷️ CLASSES RADAR DÉTECTÉES:', Array.from(foundClasses));
    
    // Déterminer le mode
    const hasSegments = segments.length > 0;
    const hasCenterPerson = centerPerson !== null;
    const hasGenerations = generationElements.length > 0;
    
    const isWheelMode = hasSegments || hasCenterPerson || hasGenerations;
    
    console.log('🎯 DÉCISION:');
    console.log(`  - hasSegments: ${hasSegments}`);
    console.log(`  - hasCenterPerson: ${hasCenterPerson}`);
    console.log(`  - hasGenerations: ${hasGenerations}`);
    console.log(`  - RÉSULTAT: ${isWheelMode ? 'MODE RADAR/WHEEL' : 'MODE ARBRE/TREE'}`);
    
    return isWheelMode;
}

/**
 * Calcule les dimensions réelles de l'arbre 
 */
export function calculateFullTreeDimensions(svg, forExport = false)  {
    console.log('📊 Calcul des dimensions pour export...');
    
    const isWheelMode = detectWheelMode(svg);
    
    if (isWheelMode) {
        console.log('🎡 Mode radar détecté');
        const rect = svg.getBoundingClientRect();
        return {
            width: Math.ceil(rect.width || 800),
            height: Math.ceil(rect.height || 600),
            minX: 0,
            minY: 0,
            maxX: Math.ceil(rect.width || 800),
            maxY: Math.ceil(rect.height || 600)
        };
    }
    

    // Détection du background
    const hasBackground = !d3.select(svg).selectAll('.background-element').empty();
    console.log('Background présent dans le SVG ?', hasBackground);
    if (hasBackground) {
        const bg = d3.select(svg).select('.background-element').node();
        if (bg) {
            if (bg.tagName === 'rect') {
                const width = parseFloat(bg.getAttribute('width'));
                const height = parseFloat(bg.getAttribute('height'));
                console.log('Background <rect> - width:', width, 'height:', height);
            } else if (typeof bg.getBBox === 'function') {
                const bbox = bg.getBBox();
                console.log('Background BBox:', bbox.width, bbox.height);
            }
        }
    }


    console.log('🌳 Mode arbre détecté');
    
    const d3Svg = d3.select(svg);

    // Détection du zoom pour l'export
    let zoomScale = 1.0;
    // if (forExport) {
    if (true) {
        try {
            const d3Transform = d3.zoomTransform(svg);
            zoomScale = d3Transform.k;
            console.log(`🔍 Export: zoom ${zoomScale} détecté (translation: x=${d3Transform.x.toFixed(0)}, y=${d3Transform.y.toFixed(0)})`);
        } catch (e) {
            console.log(`❌ Erreur détection zoom:`, e.message);
        }
    }

    // Récupérer les positions ET les tailles des éléments
    let contentBounds = {
        minX: Infinity,
        maxX: -Infinity,
        minY: Infinity,
        maxY: -Infinity
    };
    
    // Analyser tous les rectangles visibles
    const visibleElements = d3Svg.selectAll('rect').nodes();
    
    visibleElements.forEach(element => {
        // Obtenir la bounding box réelle de l'élément
        const d3Element = d3.select(element);
        const d3Data = d3Element.datum();
        if (d3Data && d3Data.x !== undefined) {
            contentBounds.minX = Math.min(contentBounds.minX, d3Data.y);
            contentBounds.maxX = Math.max(contentBounds.maxX, d3Data.y);
            contentBounds.minY = Math.min(contentBounds.minY, d3Data.x);
            contentBounds.maxY = Math.max(contentBounds.maxY, d3Data.x);
            // console.log('x=', d3Data.y, 'y=', d3Data.x);
        }
    });

    // const firstRect = d3Svg.select('rect').node();
    const firstRect = d3Svg.select('.person-box, .person-box.root').node();
    if (firstRect) {
        // console.log('Premier rect trouvé:', firstRect);
        const bbox = firstRect.getBBox();
        // console.log(firstRect, bbox.x, bbox.y, bbox.width, bbox.height);
        contentBounds.maxX = contentBounds.maxX + bbox.width;
        contentBounds.minY = contentBounds.minY - bbox.height/2;
        contentBounds.maxY = contentBounds.maxY + bbox.height/2;
    }

   
    // Vérification de sécurité
    if (!isFinite(contentBounds.minX)) {
        console.warn('Fallback dimensions pour export');
        return {
            width: 5000,
            height: 62000,
            minX: -500,
            minY: -44000,
            maxX: 5500,
            maxY: 18000
        };
    }
  
    // Marges minimales
    const marginX = 100;
    const marginY = 100;
    
    const width = (contentBounds.maxX - contentBounds.minX) + (marginX * 2);
    const height = ((contentBounds.maxY - contentBounds.minY)*1.0 + (marginY * 2));

    let shiftX = 0; //50;
    let shiftY = 0; //height*0.01;

    // correction quand il y a un fond décran mais inexplicable ???
    if (hasBackground) {
        shiftX = shiftX + 100;
        shiftY = shiftY + window.innerHeight/2;
    }


    console.log(`📐 VRAIES LIMITES DU CONTENU:`);
    console.log(`  X: ${contentBounds.minX.toFixed(0)} → ${contentBounds.maxX.toFixed(0)} (largeur: ${(contentBounds.maxX - contentBounds.minX).toFixed(0)})`);
    console.log(`  Y: ${contentBounds.minY.toFixed(0)} → ${contentBounds.maxY.toFixed(0)} (hauteur: ${(contentBounds.maxY - contentBounds.minY).toFixed(0)})`);
    console.log(`📐 Export - Dimensions finales: ${width.toFixed(0)}×${height.toFixed(0)}`);
    
    return {
        width: Math.ceil(width),
        height: Math.ceil(height),
        minX: Math.floor(contentBounds.minX + shiftX - marginX ),
        minY: Math.floor(contentBounds.minY - marginY + shiftY),
        maxX: Math.ceil(contentBounds.maxX + shiftX + marginX),
        maxY: Math.ceil(contentBounds.maxY + marginY + shiftY)
    };
}

/**
 * Ajuste automatiquement le zoom pour voir l'arbre entier
 */
export function fitTreeToScreen() {
    console.log('🔍 Ajustement vue complète...');
    
    const svg = d3.select("#tree-svg");
    const mainGroup = svg.select("g");
    
    if (mainGroup.empty() || !getZoom()) {
        console.warn('Groupe principal ou zoom non trouvé');
        return;
    }
    
    // UTILISER LA MÊME LOGIQUE que calculateFullTreeDimensions
    const fullDimensions = calculateFullTreeDimensions(svg.node());
    
    console.log(`📊 Ajustement sur dimensions réelles:`);
    console.log(`  Largeur: ${fullDimensions.width}`);
    console.log(`  Hauteur: ${fullDimensions.height}`);
    
    // Calculer le zoom pour ces vraies dimensions
    const svgWidth = window.innerWidth;
    const svgHeight = window.innerHeight;
    const margin = 50;
    
    const scaleX = (svgWidth - margin) / fullDimensions.width;
    const scaleY = (svgHeight - margin) / fullDimensions.height;
    const scale = Math.min(scaleX, scaleY);
    
    console.log(`📐 Scale calculé: ${scale.toFixed(4)}`);
    
    if (scale > 0.001 && scale < 10) {
        const centerX = svgWidth / 2;
        const centerY = svgHeight / 2;
        
        // Centrer sur le contenu réel
        const treeCenterX = (fullDimensions.minX + fullDimensions.maxX) / 2;
        const treeCenterY = (fullDimensions.minY + fullDimensions.maxY) / 2;
        
        const translateX = centerX - (treeCenterX * scale);
        const translateY = centerY - (treeCenterY * scale);
        
        const newTransform = d3.zoomIdentity
            .translate(translateX, translateY)
            .scale(scale);
        
        svg.transition()
            .duration(1500)
            .call(getZoom().transform, newTransform);
            
        console.log(`✅ Zoom appliqué: scale=${scale.toFixed(4)}`);
    } else {
        console.warn(`⚠️ Scale invalide: ${scale.toFixed(6)}`);
    }
}

function calculateTilesNeeded(arbreWidth, arbreHeight, pageFormat, pageLayout, dpi) {
    console.log(`🖨️ CALCUL tailles des tuiles page Auto :`);
    console.log(`  Arbre: ${arbreWidth}×${arbreHeight} pixels`);
    console.log(`  Layout: ${pageLayout}`);
    console.log(`  DPI choisi: ${dpi}`);
    
    const scale = dpi / 150;
    
    const finalWidth = arbreWidth * scale;
    const finalHeight = arbreHeight * scale;

    const totalPixels = finalWidth * finalHeight;
    
    console.log(`📊 Dimensions finales: ${finalWidth.toFixed(0)}×${finalHeight.toFixed(0)} pixels`);
    console.log(`📊 Surface totale: ${totalPixels.toLocaleString()} pixels`);
    
    console.log(`🔒 Limite surface: ${maxSurface.toLocaleString()} pixels`);
    
    // Si ça tient en une seule tuile
    if (totalPixels <= maxSurface) {
        console.log(`✅ TIENT EN 1 SEULE TUILE !`);
        return {
            needsTiling: false,
            tilesX: 1,
            tilesY: 1,
            totalTiles: 1,
            tileWidth: finalWidth,
            tileHeight: finalHeight,
            finalWidth,
            finalHeight,
            scale,
            fullDimensions: calculateFullTreeDimensions(document.querySelector('#tree-svg')),
            // Pour l'affichage
            pageFormat,
            pageLayout,
            nbColonnes: 1,
            nbLignes: 1,
            dpiOptimal: dpi
        };
    }
    
    // Sinon, calculer le nombre de tuiles nécessaires
    const tilesNeeded = Math.ceil(totalPixels / maxSurface);
    console.log(`🧩 Tuiles nécessaires (minimum): ${tilesNeeded}`);
    
    // Répartir les tuiles de façon optimale (privilégier découpe verticale pour votre arbre)
    let tilesX = 1;
    let tilesY = tilesNeeded;
    
    // Si trop de tuiles verticales, répartir en grille
    if (tilesY > 10) {
        tilesX = Math.ceil(Math.sqrt(tilesNeeded));
        tilesY = Math.ceil(tilesNeeded / tilesX);
    }
    
    const tileWidth = finalWidth / tilesX;
    const tileHeight = finalHeight / tilesY;

    console.log(`🧩 DÉCOUPAGE OPTIMISÉ:`);
    console.log(`  - Tuiles horizontales: ${tilesX}`);
    console.log(`  - Tuiles verticales: ${tilesY}`);
    console.log(`  - Total tuiles: ${tilesX * tilesY}`);
    console.log(`  - Taille par tuile: ${tileWidth.toFixed(0)}×${tileHeight.toFixed(0)} pixels`);
    
    return {
        needsTiling: true,
        tilesX,
        tilesY,
        totalTiles: tilesX * tilesY,
        tileWidth: Math.round(tileWidth),
        tileHeight: Math.round(tileHeight),
        finalWidth,
        finalHeight,
        scale,
        fullDimensions: calculateFullTreeDimensions(document.querySelector('#tree-svg')),
        // Pour l'affichage
        pageFormat,
        pageLayout,
        nbColonnes: tilesX,
        nbLignes: tilesY,
        dpiOptimal: dpi
    };
}

/**
 * Calcule les paramètres pour impression sur pages A4/A3 - VERSION DPI FIXE
 */
export function calculatePagePrintingParams(arbreWidth, arbreHeight, pageFormat, pageLayout, dpiChoisi) {
    console.log(`🖨️ CALCUL IMPRESSION PAGES:`);
    console.log(`  Arbre: ${arbreWidth}×${arbreHeight} pixels`);
    console.log(`  Format: ${pageFormat}`);
    console.log(`  Layout: ${pageLayout}`);
    console.log(`  DPI choisi: ${dpiChoisi}`);
    
    if (pageFormat === 'auto') {
        return null;
    }
    
    const printableArea = PRINTABLE_AREAS[pageFormat];
    if (!printableArea) {
        throw new Error(`Format non supporté: ${pageFormat}`);
    }
    
    // Parser le layout
    const [cols, rows] = pageLayout.split('x');
    const nbColonnes = parseInt(cols);

 
    // Utiliser le DPI choisi dans la GUI au lieu de 300 fixe
    const dpiFixe = dpiChoisi; // 150, 300, 600, etc.
    
    console.log(`  DPI choisi: ${dpiFixe}`);
    
    // Recalculer les dimensions de la zone imprimable selon le DPI
    const printableWidthPx = Math.round((printableArea.width / 25.4) * dpiFixe);
    const printableHeightPx = Math.round((printableArea.height / 25.4) * dpiFixe);
    
    // Calculer la largeur totale disponible
    const largeurTotalePixels = nbColonnes * printableWidthPx;
    
    // Calculer le scale factor pour que l'arbre tienne dans la largeur
    const scaleFactor = largeurTotalePixels / arbreWidth;
    
    console.log(`  Zone imprimable: ${printableArea.width}×${printableArea.height}mm`);
    console.log(`  Zone imprimable en pixels (${dpiChoisi} DPI): ${printableWidthPx}×${printableHeightPx}px`);
    console.log(`  Colonnes: ${nbColonnes}`);
    console.log(`  Largeur totale: ${largeurTotalePixels}px`);
    console.log(`  Scale factor: ${scaleFactor.toFixed(2)}`);
    console.log(`  DPI fixe: ${dpiFixe}`);
    
    // Calculer les dimensions finales de l'arbre
    const largeurFinale = arbreWidth * scaleFactor;
    const hauteurFinale = arbreHeight * scaleFactor;
    
    // Gérer les cas spécifiques pour nbLignes
    let nbLignes;
    if (rows === 'N') {
        // Mode auto (1xN, 2xN, etc.)
        nbLignes = Math.ceil(hauteurFinale / printableHeightPx);
        console.log(`  Mode auto: ${nbLignes} lignes calculées`);
    } else if (rows === '1') {
        // Mode 1x1 : forcer 1 seule page
        nbLignes = 1;
        console.log(`  Mode 1x1: forçage sur 1 page`);
    } else {
        // Mode fixe (1x12, 2x5, etc.)
        nbLignes = parseInt(rows);
        console.log(`  Mode fixe: ${nbColonnes}×${nbLignes}`);
    }

    const totalPages = nbColonnes * nbLignes;
    
    console.log(`📊 RÉSULTAT:`);
    console.log(`  Taille finale arbre: ${largeurFinale.toFixed(0)}×${hauteurFinale.toFixed(0)} pixels`);
    console.log(`  Pages: ${nbColonnes}×${nbLignes} = ${totalPages}`);
    console.log(`  Taille par tuile: ${printableArea.widthPx}×${printableArea.heightPx} pixels`);
    
    return {
        needsTiling: totalPages > 1,
        tilesX: nbColonnes,
        tilesY: nbLignes,
        totalTiles: totalPages,
        tileWidth: printableWidthPx,
        tileHeight: printableHeightPx,
        finalWidth: largeurFinale,
        finalHeight: hauteurFinale,
        scale: scaleFactor, // LE VRAI SCALE FACTOR
        
        fullDimensions: calculateFullTreeDimensions(document.querySelector('#tree-svg')),
        
        // Pour l'affichage
        pageFormat,
        pageLayout,
        nbColonnes,
        nbLignes,
        dpiOptimal: dpiFixe
    };
}

/**
 * Génère un aperçu textuel des paramètres
 */
export function generatePrintingPreview(params) {
    if (!params) {
        return translateExport('modeAutomatic');
    }
    
    const { pageFormat, nbColonnes, nbLignes, totalPages, dpiOptimal, tileWidth, tileHeight } = params;
    
    const formatName = pageFormat.replace('-', ' ').toUpperCase();
    const tailleEstimee = Math.round(tileWidth * tileHeight * totalPages * 3 / 1024 / 1024); // MB
    
    return `
        <div><strong>Format:</strong> ${totalPages} pages ${formatName}</div>
        <div><strong>Disposition:</strong> ${nbColonnes}×${nbLignes}</div>
        <div><strong>DPI optimal:</strong> ${dpiOptimal}</div>
        <div><strong>Taille par page:</strong> ${tileWidth}×${tileHeight} pixels</div>
        <div><strong>Taille estimée:</strong> ~${tailleEstimee} MB</div>
        ${totalPages > 20 ? '<div style="color: orange;"><strong>⚠️ Beaucoup de pages</strong></div>' : ''}
    `;
}

/**
 * Génère les instructions d'assemblage
 */
export function generateAssemblyInstructions(params) {
    if (!params || params.totalPages === 1) {
        return 'Page unique - pas d\'assemblage nécessaire';
    }
    
    const { pageFormat, nbColonnes, nbLignes, totalPages } = params;
    const formatName = pageFormat.replace('-', ' ').toUpperCase();
    
    return `
# 📄 INSTRUCTIONS D'ASSEMBLAGE

## 🖨️ Impression
${totalPages} pages ${formatName} à imprimer

## ✂️ Découpe
- Page 1 : garder toutes les marges
- Pages suivantes : découper marge haute seulement
- Couper précisément le long des marges blanches

## 🔗 Assemblage
Disposition finale : ${nbColonnes} colonne(s) × ${nbLignes} ligne(s)

### Ordre d'assemblage :
${Array.from({length: nbLignes}, (_, row) => 
    Array.from({length: nbColonnes}, (_, col) => 
        `Page ${row * nbColonnes + col + 1}`
    ).join(' | ')
).join('\n')}

### Technique de collage :
1. Commencer par la première ligne
2. Coller chaque page suivante sur la marge blanche
3. Utiliser scotch transparent au dos ou colle en bâton
4. Vérifier l'alignement des éléments graphiques

## 🎯 Résultat
Arbre complet assemblé sur ${totalPages} pages ${formatName}
    `;
}

// Fonction utilitaire pour générer une tuile
async function generateSingleTile(tileInfo, tileX, tileY) {
    const svg = document.querySelector('#tree-svg');
    
    // Calculer les coordonnées de cette tuile
    const sourceX = (tileX * tileInfo.tileWidth) / tileInfo.scale;
    const sourceY = (tileY * tileInfo.tileHeight) / tileInfo.scale;
    const sourceWidth = tileInfo.tileWidth / tileInfo.scale;
    const sourceHeight = tileInfo.tileHeight / tileInfo.scale;

    // Préparer le SVG
    const clonedSvg = svg.cloneNode(true);
    cleanSVGForExport(clonedSvg);

    // Configurer le viewBox
    const viewBoxX = tileInfo.fullDimensions.minX + sourceX;
    const viewBoxY = tileInfo.fullDimensions.minY + sourceY;
    
    clonedSvg.setAttribute('width', sourceWidth);
    clonedSvg.setAttribute('height', sourceHeight);
    clonedSvg.setAttribute('viewBox', `${viewBoxX} ${viewBoxY} ${sourceWidth} ${sourceHeight}`);
    
    // Créer le canvas
    const canvas = document.createElement('canvas');
    canvas.width = tileInfo.tileWidth;
    canvas.height = tileInfo.tileHeight;
    const ctx = canvas.getContext('2d');
    
    // Fonction pour dessiner le SVG après le fond
    const drawSVGContent = () => {
        return new Promise((resolve, reject) => {
            const svgString = new XMLSerializer().serializeToString(clonedSvg);
            const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            const svgUrl = URL.createObjectURL(svgBlob);
            
            const img = new Image();
            img.onload = function() {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                URL.revokeObjectURL(svgUrl);
                resolve(canvas);
            };
            img.onerror = function(error) {
                URL.revokeObjectURL(svgUrl);
                reject(error);
            };
            img.src = svgUrl;
        });
    };
    
    // Fond blanc
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Vérifier s'il faut dessiner une image de fond
    const savedBackground = localStorage.getItem('preferredBackground');
    
    if (state.backgroundEnabled && savedBackground === 'customImage') {
        console.log(`🖼️ Image de fond détectée pour tuile [${tileX},${tileY}]`);
        
        const backgroundImagePath = localStorage.getItem('customImagePath');
        if (backgroundImagePath) {
            // Calculer la région de cette tuile dans l'espace global
            const regionX = Math.round(tileX * tileInfo.tileWidth);
            const regionY = Math.round(tileY * tileInfo.tileHeight);

            console.log(`🔍 TUILE [${tileX},${tileY}] COORDONNÉES:`);
            console.log(`  - tileInfo.tileWidth: ${tileInfo.tileWidth}`);
            console.log(`  - tileInfo.tileHeight: ${tileInfo.tileHeight}`);
            console.log(`  - tileInfo.scale: ${tileInfo.scale}`);
            console.log(`  - tileInfo.finalWidth: ${tileInfo.finalWidth}`);
            console.log(`  - tileInfo.finalHeight: ${tileInfo.finalHeight}`);
            console.log(`  - Calcul regionX: ${tileX} * ${tileInfo.tileWidth} / ${tileInfo.scale} = ${regionX}`);
            console.log(`  - Calcul regionY: ${tileY} * ${tileInfo.tileHeight} / ${tileInfo.scale} = ${regionY}`);

            // Dessiner le background pour cette région, puis le SVG
            try {
                await drawBackgroundForRegion(ctx, regionX, regionY, 
                    canvas.width, canvas.height, 
                    tileInfo.finalWidth, tileInfo.finalHeight);
                console.log(`✅ Background tuile [${tileX},${tileY}] terminé`);
                
                return await drawSVGContent();
            } catch (error) {
                console.warn(`⚠️ Erreur background tuile [${tileX},${tileY}]:`, error);
                return await drawSVGContent();
            }
        } else {
            // Pas d'image de fond, juste le SVG
            return await drawSVGContent();
        }
    } else {
        // Pas d'image de fond, juste le SVG
        return await drawSVGContent();
    }
}

// Fonction pour générer les instructions d'assemblage
function generateAssemblyInstructionsForTiles(tileInfo, targetDPI, tiles) {
    const instructions = `# 🧩 ASSEMBLAGE ARBRE GÉNÉALOGIQUE ${targetDPI} DPI

## 📁 Fichiers générés
${tiles.length} tuiles téléchargées :
${tiles.map(t => `- ${t.filename}`).join('\n')}

## 📐 Dimensions finales
- Largeur totale: ${Math.round(tileInfo.finalWidth)} pixels
- Hauteur totale: ${Math.round(tileInfo.finalHeight)} pixels
- Grille: ${tileInfo.tilesX} colonne(s) × ${tileInfo.tilesY} ligne(s)

## 🔧 Assemblage avec GIMP (gratuit)
1. Fichier → Nouveau
   - Largeur: ${Math.round(tileInfo.finalWidth)} pixels
   - Hauteur: ${Math.round(tileInfo.finalHeight)} pixels
   - Résolution: ${targetDPI} DPI
2. Fichier → Ouvrir comme calques → Sélectionner toutes les tuiles
3. Positionner chaque tuile:
${tiles.map(t => `   - ${t.filename}: X=${t.x * Math.round(tileInfo.tileWidth)}px, Y=${t.y * Math.round(tileInfo.tileHeight)}px`).join('\n')}
4. Image → Aplatir l'image
5. Fichier → Exporter → PNG

## 🖼️ Assemblage avec ImageMagick (automatique)
\`\`\`bash
montage ${tiles.map(t => t.filename).join(' ')} -tile ${tileInfo.tilesX}x${tileInfo.tilesY} -geometry +0+0 arbre_complet_${targetDPI}dpi.png
\`\`\`

## ✅ Résultat final
Image complète: ${Math.round(tileInfo.finalWidth)}×${Math.round(tileInfo.finalHeight)} pixels à ${targetDPI} DPI
`;

    const blob = new Blob([instructions], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ASSEMBLAGE_${targetDPI}dpi.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
}

export async function exportAllTiles(targetDPI, customTileInfo = null, quality = 90, format = 'png', pageSize, pageLayout) {

    try {

        flipV = false;
        // Afficher le progress
        exportProgress.show(`Export ${targetDPI} DPI`);
        exportProgress.update(10, 'Préparation...');

        console.log(`🚀 EXPORT COMPLET PAR TUILES in exportAllTiles - ${targetDPI} DPI... format ${format}`);
      
        
        // AJOUT : Vérifier jsPDF si PDF
        if (format === 'pdf' && typeof window.jsPDF === 'undefined') {
            await loadJsPDF();
        }

        // Calculer le découpage
        let tileInfo;
        if (customTileInfo)  
        {
            tileInfo = customTileInfo;
        } 
       
        if (!tileInfo.needsTiling) {
            exportProgress.update(50, 'Génération image unique...');
            console.log('✅ Pas besoin de tuiles, export classique...');
            // Utiliser votre export classique existant
            const svg = document.querySelector('#tree-svg');
            const canvas = await svgToCanvasFullTree(svg, tileInfo.scale, tileInfo.fullDimensions);

            exportProgress.update(90, 'Finalisation...');
            
            const filename = `arbre_${targetDPI}dpi.${format}`;

            // downloadCanvas(canvas, filename, quality, format);
            if (format === 'pdf') {
                const filename = `arbre_${targetDPI}dpi.pdf`;
                await createPDFFromCanvas(canvas, filename, quality, pageSize, pageLayout);
            } else {
                const filename = `arbre_${targetDPI}dpi.${format}`;
                downloadCanvas(canvas, filename, quality, format);
            }
            exportProgress.hide();
            return;
        }
        
        console.log(`🧩 Export ${tileInfo.totalTiles} tuiles...`);
               
        // Générer toutes les tuiles
        const tiles = [];

        //  Progress pour les tuiles
        let completedTiles = 0;

        // Initialiser PDF si nécessaire
        // let pdf = null;
        // if (format === 'pdf') {
        //     const { jsPDF } = window.jspdf;
        //     pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        // }

        // Initialiser PDF si nécessaire
        let pdf = null;
        if (format === 'pdf') {
            const { jsPDF } = window.jspdf;
            
            // NOUVEAU : Déterminer format et orientation depuis pageSize
            let pdfFormat = 'a4';
            let pdfOrientation = 'portrait';
            
            if (pageSize && pageSize !== 'auto') {
                // Extraire format et orientation
                if (pageSize.includes('a3')) pdfFormat = 'a3';
                if (pageSize.includes('landscape')) pdfOrientation = 'landscape';
            }
            
            console.log(`📄 Création PDF multi-pages: format=${pdfFormat}, orientation=${pdfOrientation}`);
            
            pdf = new jsPDF({ 
                orientation: pdfOrientation, 
                unit: 'mm', 
                format: pdfFormat,
                compress: true
            });
        }


        for (let tileY = 0; tileY < tileInfo.tilesY; tileY++) {
            for (let tileX = 0; tileX < tileInfo.tilesX; tileX++) {
                const tileIndex = tileY * tileInfo.tilesX + tileX + 1;
                console.log(`🧩 Génération tuile ${tileIndex}/${tileInfo.totalTiles} [${tileX},${tileY}]...`);

                // Mise à jour progress
                const percent = (completedTiles / tileInfo.totalTiles) * 100;
                exportProgress.update(percent, `Tuile ${tileIndex}/${tileInfo.totalTiles} [${tileX},${tileY}]`);
                
                
                try {
                    const canvas = await generateSingleTile(tileInfo, tileX, tileY);
                    
                    if (format === 'pdf') {
                        if (tileIndex > 1) pdf.addPage();
                        
                        // Récupérer les dimensions de la page
                        const pageWidth = pdf.internal.pageSize.getWidth();
                        const pageHeight = pdf.internal.pageSize.getHeight();
                        
                        // Calculer le ratio pour conserver les proportions
                        const canvasRatio = canvas.width / canvas.height;
                        const pageRatio = pageWidth / pageHeight;
                        
                        let imgWidth, imgHeight, imgX, imgY;
                        
                        // Remplir toute la page sans bandes blanches
                        if (canvasRatio > pageRatio) {
                            imgHeight = pageHeight;
                            imgWidth = pageHeight * canvasRatio;
                            imgX = -(imgWidth - pageWidth) / 2;
                            imgY = 0;
                        } else {
                            imgWidth = pageWidth;
                            imgHeight = pageWidth / canvasRatio;
                            imgX = 0;
                            imgY = -(imgHeight - pageHeight) / 2;
                        }
                        
                        // Utiliser le paramètre quality
                        const pdfQuality = Math.max(0.1, Math.min(1.0, quality));
                        const imgData = canvas.toDataURL('image/jpeg', pdfQuality);
                        
                        // Ajouter l'image avec les bonnes dimensions
                        pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth, imgHeight);

                    } else {
                        // Télécharger cette tuile avec gestion quality
                        let filename = `arbre_tuile_${String(tileX).padStart(2, '0')}_${String(tileY).padStart(2, '0')}_${targetDPI}dpi.${format}`;
                        let dataUrl;
                        
                        // Si PNG avec qualité < 100, convertir en JPEG
                        if (format === 'png' && quality < 1) {
                            filename = filename.replace('.png', '.jpeg');
                            const qualityValue = Math.max(0.1, Math.min(1.0, quality));
                            dataUrl = canvas.toDataURL('image/jpeg', qualityValue);
                        } else if (format === 'jpeg' || format === 'jpg') {
                            const qualityValue = Math.max(0.1, Math.min(1.0, quality));
                            dataUrl = canvas.toDataURL('image/jpeg', qualityValue);
                        } else {
                            dataUrl = canvas.toDataURL('image/png');
                        }
                        
                        const link = document.createElement('a');
                        link.download = filename;
                        link.href = dataUrl;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);

                        console.log(`✅ Tuile ${tileIndex} téléchargée: ${filename}`);
                        tiles.push({ x: tileX, y: tileY, filename });
                    }

                    completedTiles++;
                    
                    // Pause entre téléchargements
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                } catch (error) {
                    console.error(`❌ Erreur tuile [${tileX},${tileY}]:`, error);
                }
            }
        }

        // Finalisation
        exportProgress.update(100, 'Génération des instructions...');
        
        // Générer les instructions d'assemblage
        //  Sauvegarder PDF ou instructions
        if (format === 'pdf') {
            pdf.save(`arbre_${targetDPI}dpi_${tileInfo.totalTiles}pages.pdf`);
            console.log(`✅ PDF ${tileInfo.totalTiles} pages créé`);
        } else {
            // Générer les instructions d'assemblage
            generateAssemblyInstructionsForTiles(tileInfo, targetDPI, tiles);
        }

        console.log(`✅ Export complet terminé`);
        
        // Notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 50px; right: 20px; background: #28a745; 
            color: white; padding: 15px; border-radius: 5px; z-index: 10000;
            font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        
        // MODIFICATION : Message selon format
        if (format === 'pdf') {
            notification.textContent = `PDF : ${tileInfo.totalTiles} ${translateExport('exportedPage')}`;
        } else {
            notification.textContent = `${tileInfo.totalTiles} ${translateExport('tilesDownloaded')} ${targetDPI} DPI`;
        }
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);


        // Masquer le progress
        exportProgress.hide();
        
    } catch (error) {
        console.error('❌ Erreur export complet:', error);
    }
}

/**
 * Export d'une page unique
 */
export async function exportSinglePage(params, format, filename, quality, pageSize, pageLayout) {
    console.log('📄 Export page unique avec paramètres:', params);
    
    // Utiliser la logique existante avec les paramètres calculés
    const svg = document.querySelector('#tree-svg');
    flipV = false;

    // Passer le format cible à svgToCanvasFullTree
    const targetFormat = {
        width: params.tileWidth,
        height: params.tileHeight,
        pageFormat: params.pageFormat
    };
    
    const canvas = await svgToCanvasFullTree(svg, params.scale, params.fullDimensions, targetFormat);
    
    
    const finalFilename = filename || `page_unique_${params.pageFormat}_${Date.now()}.${format}`;
    //  Utiliser la bonne fonction selon le format
    if (format === 'pdf') {
        await createPDFFromCanvas(canvas, finalFilename, quality, pageSize, pageLayout);
    } else {
        downloadCanvas(canvas, finalFilename, quality, format);
    }
}

// Fonction JavaScript qui génère le script Python avec logique TIFF automatique et filtrage JPEGLib
function generateOptimizedPythonScriptWithCoords(targetDPI, tilesX, tilesY, tileInfo, finalFormat = 'png', tilesFormat = 'png', quality = 1) {
    // Calculer les vraies coordonnées pour chaque tuile
    const tileCoords = [];
    
    for (let tileY = 0; tileY < tilesY; tileY++) {
        for (let tileX = 0; tileX < tilesX; tileX++) {
            // Extension des tuiles selon le format généré
            const tileExt = tilesFormat === 'jpeg' || tilesFormat === 'jpg' ? 'jpeg' : 'png';
            const filename = `arbre_tuile_${String(tileX).padStart(2, '0')}_${String(tileY).padStart(2, '0')}_${targetDPI}dpi.${tileExt}`;
            const coordX = Math.round(tileX * tileInfo.tileWidth);
            const coordY = Math.round(tileY * tileInfo.tileHeight);
            
            tileCoords.push({
                filename,
                x: coordX,
                y: coordY
            });
        }
    }
    
    const coordinatesString = tileCoords.map(coord => 
        `    "${coord.filename}": (${coord.x}, ${coord.y})`
    ).join(',\n');
    
    // Extension des tuiles pour la recherche
    const tilesExt = tilesFormat === 'jpeg' || tilesFormat === 'jpg' ? 'jpeg' : 'png';
    const searchPattern = `arbre_tuile_*_${targetDPI}dpi.${tilesExt}`;
    
    // Qualité JPEG (convertir 0-1 en 0-100)
    const jpegQuality = Math.round(quality * 100);
    
    const pythonScript = `#!/usr/bin/env python3
"""
ASSEMBLAGE OPTIMISÉ MÉMOIRE
"""
import os
import glob
import sys
import subprocess
from PIL import Image

# Configuration optimisée
Image.MAX_IMAGE_PIXELS = None

# FONCTION POUR SUPPRIMER COMPLÈTEMENT LES WARNINGS JPEGLIB
def save_with_no_warnings(image, filename, format_type, **kwargs):
    """Sauvegarde une image en supprimant tous les warnings JPEGLib"""
    
    # Méthode de redirection au niveau du file descriptor
    import os
    
    # Sauvegarder le stderr original
    stderr_fd = os.dup(2)
    
    # Ouvrir /dev/null (ou NUL sur Windows)
    if os.name == 'nt':
        null_fd = os.open('NUL', os.O_WRONLY)
    else:
        null_fd = os.open('/dev/null', os.O_WRONLY)
    
    try:
        # Rediriger stderr vers /dev/null
        os.dup2(null_fd, 2)
        
        # Faire la sauvegarde (tous les warnings JPEGLib vont dans /dev/null)
        if format_type == "TIFF":
            image.save(filename, "TIFF", **kwargs)
        else:
            image.save(filename, "JPEG", **kwargs)
            
    finally:
        # Restaurer stderr
        os.dup2(stderr_fd, 2)
        os.close(stderr_fd)
        os.close(null_fd)

# COORDONNÉES EXACTES
tile_positions = {
${coordinatesString}
}

print("🧩 ASSEMBLAGE OPTIMISÉ MÉMOIRE")
print("=" * 50)

# Trouver les fichiers avec la bonne extension
pattern = "${searchPattern}"
files = sorted(glob.glob(pattern))

if len(files) == 0:
    print(f"❌ Aucun fichier trouvé avec le pattern: {pattern}")
    exit(1)

print(f"📁 {len(files)} fichiers trouvés")
print(f"🔍 Pattern de recherche: {pattern}")

# Déterminer les dimensions finales
first_img = Image.open(files[0])
tile_width, tile_height = first_img.size
first_img.close()

max_x = max(pos[0] for pos in tile_positions.values()) + tile_width
max_y = max(pos[1] for pos in tile_positions.values()) + tile_height

print(f"📐 Canvas final: {max_x}×{max_y} pixels")
print(f"💾 Taille estimée: {(max_x * max_y * 3 / 1024 / 1024 / 1024):.1f} GB")

# Vérifier les limites JPEG et choisir automatiquement le format
if max_x > 65500 or max_y > 65500:
    print(f"⚠️ Dimensions dépassent la limite JPEG (65500 pixels)")
    print(f"🔄 Utilisation de TIFF avec compression JPEG")
    output = "arbre_final_${targetDPI}dpi.tiff"
    output_format = "TIFF"
    print(f"🎯 Format final: TIFF (compression JPEG, qualité ${jpegQuality}%)")
else:
    output = "arbre_final_${targetDPI}dpi.jpg"
    output_format = "JPEG"
    print(f"🎯 Format final: JPEG")
    print(f"🎯 Qualité JPEG: ${jpegQuality}%")

# Méthode optimisée mémoire
print("🔄 Création image finale optimisée...")

try:
    # Créer avec fond blanc (RGB pour JPEG/TIFF)
    final_image = Image.new("RGB", (max_x, max_y), "white")
    
    # Assembler avec gestion mémoire
    for i, file in enumerate(files):
        print(f"📷 {file}... ({i+1}/{len(files)})")
        
        img = Image.open(file)
        
        # Convertir en RGB si nécessaire
        if img.mode != "RGB":
            img = img.convert("RGB")
        
        if file in tile_positions:
            x, y = tile_positions[file]
            print(f"   → Position: ({x}, {y})")
        else:
            x = 0
            y = i * tile_height
            print(f"   → Position fallback: ({x}, {y})")
        
        final_image.paste(img, (x, y))
        img.close()
        
        print(f"   ✅ Tuile {i+1} assemblée")
    
    # Sauvegarder selon le format déterminé automatiquement
    print("💾 Sauvegarde avec compression...")
    print("🔇 Suppression des warnings JPEGLib...")
    
    if output_format == "TIFF":
        save_with_no_warnings(final_image, output, "TIFF", compression="jpeg", quality=${jpegQuality})
        print(f"✅ TIFF sauvegardé avec compression JPEG qualité ${jpegQuality}%")
    else:
        save_with_no_warnings(final_image, output, "JPEG", quality=${jpegQuality}, optimize=True)
        print(f"✅ JPEG sauvegardé avec qualité ${jpegQuality}%")
    
    final_image.close()
    
    print(f"🎉 SUCCÈS: {output}")
    
except MemoryError:
    print("❌ ERREUR MÉMOIRE - Image trop grande !")
    print("💡 Utilisez un format TIFF ou réduisez le DPI")
    
except Exception as e:
    print(f"❌ ERREUR: {e}")
    print("💡 Essayez la solution alternative...")

input("Appuyez sur Entrée...")
`;

    // Télécharger le script
    const blob = new Blob([pythonScript], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `assemble_${targetDPI}dpi.py`;
    link.click();
    URL.revokeObjectURL(link.href);
}

// Script .bat 
function generateWindowsBatchScript(targetDPI) {
    const batchScript = `@echo off
echo ASSEMBLAGE AUTOMATIQUE ARBRE ${targetDPI} DPI
echo ================================================

REM Verifier que Python est installe
python --version >nul 2>&1
if errorlevel 1 (
    echo Erreur: Python non trouve !
    echo Installez Python depuis https://www.python.org/
    pause
    exit /b 1
)

echo Python trouve avec succes

REM Installer Pillow si necessaire
echo Verification/Installation de Pillow...
pip install Pillow

REM Executer le script d'assemblage
echo.
echo Lancement de l'assemblage...
python assemble_${targetDPI}dpi.py

echo.
echo Assemblage termine !
pause
`;

    const blob = new Blob([batchScript], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ASSEMBLER_${targetDPI}dpi.bat`;
    link.click();
    URL.revokeObjectURL(link.href);
    
    console.log(`📝 ${translateExport('batchScriptGenerated')}: ASSEMBLER_${targetDPI}dpi.bat`);
}

/**
 * Export avec paramètres de pages A4/A3
 */
export async function exportWithPagePrintingParams(pageSize, pageLayout, dpi, format, filename, quality) {

    exportProgress.show(`Export ${dpi} DPI`);
    exportProgress.update(5, 'Préparation...');

    console.log('📄 Export avec paramètres pages:', pageSize, pageLayout, dpi);
    
    // Calculer les dimensions de l'arbre
    const svg = document.querySelector('#tree-svg');
    const fullDimensions = calculateFullTreeDimensions(svg);
    
    if (!fullDimensions) {
        throw new Error('Impossible de calculer les dimensions de l\'arbre');
    }

    let params;
    if (pageSize === 'auto') {
        params = calculateTilesNeeded(
            fullDimensions.width,
            fullDimensions.height,
            pageSize,
            pageLayout,
            dpi );

    } else {  
        // Utiliser le calculateur de pages
        params = calculatePagePrintingParams(
            fullDimensions.width,
            fullDimensions.height,
            pageSize,
            pageLayout,
            dpi );
    }
    
    if (!params) {
        throw new Error('Erreur dans le calcul des paramètres d\'impression');
    }
    
    console.log('📊 Paramètres calculés:', params);
    
    // Utiliser le système de tuiles existant
    if (params.needsTiling) {
        console.log(`🧩 Export multi-tuiles en ${params.tilesX*params.tilesY} tuiles de format ${params.tileWidth} x ${params.tileHeight}`);
        
        // Convertir nos paramètres au format attendu par exportAllTiles
        const tileInfo = {
            needsTiling: params.needsTiling,
            tilesX: params.tilesX,
            tilesY: params.tilesY,
            totalTiles: params.totalTiles,
            tileWidth: params.tileWidth,
            tileHeight: params.tileHeight,
            finalWidth: params.finalWidth,
            finalHeight: params.finalHeight,
            scale: params.scale,
            fullDimensions: params.fullDimensions
        };

        await exportAllTiles(params.dpiOptimal, tileInfo, quality, format, pageSize, pageLayout);
        
        if (pageSize === 'auto') {
            // Génération script Python + BAT avec format final ET format tuiles
            // Déterminer le format des tuiles selon la qualité
            const tilesFormat = quality < 1 ? 'jpeg' : format;
            // Format final = même que les tuiles
            const finalFormat = tilesFormat;
            generateOptimizedPythonScriptWithCoords(dpi, tileInfo.tilesX, tileInfo.tilesY, tileInfo, finalFormat, tilesFormat, quality);
            generateWindowsBatchScript(dpi);
            
            // Instructions simples
            setTimeout(() => {
                const formatMsg = finalFormat.toUpperCase() === 'JPEG' ? 'JPEG' : 'PNG';
                const qualityMsg = quality < 1 ? ` (qualité ${Math.round(quality * 100)}%)` : '';
                alert(`✅ ${translateExport('exportComplete')}\n\n📁 ${tileInfo.totalTiles} tuiles ${formatMsg} ${translateExport('tilesDownloaded')}\n🐍 ${translateExport('scriptsGenerated')}\n🎯 Format final: ${formatMsg}${qualityMsg}\n\n👉 ${translateExport('doubleClickToAssemble')} ASSEMBLER_${dpi}dpi.bat`);
            }, 2000);
        } else { 
            // Générer les instructions d'assemblage
            const instructions = generateAssemblyInstructions(params);
            downloadInstructions(instructions, pageSize, pageLayout);
        }
    } else {
        console.log('📄 Export page unique...');
        // Export page unique
        flipV = false;
        await exportSinglePage(params, format, filename, quality, pageSize, pageLayout);
    }

    exportProgress.hide();
}

/**
 * Télécharge les instructions d'assemblage
 */
function downloadInstructions(instructions, pageSize, pageLayout) {
    const blob = new Blob([instructions], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ASSEMBLAGE_${pageSize}_${pageLayout}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
    console.log('📝 Instructions d\'assemblage téléchargées');
}
