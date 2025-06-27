// ====================================
// Gestionnaire d'export PDF/PNG - VERSION CORRIGÉE
// ====================================
import { state } from './main.js';

/**
 * Exporte l'arbre au format PNG - VERSION CORRIGÉE
 */
export async function exportToPNG(filename = null) {
    try {
        console.log('📷 Début export PNG...');
        
        const svg = document.querySelector('#tree-svg');
        if (!svg) {
            throw new Error('SVG non trouvé');
        }

        // Vérifier qu'il y a du contenu dans le SVG
        const svgContent = svg.innerHTML;
        if (!svgContent || svgContent.trim().length === 0) {
            throw new Error('SVG vide - aucun contenu à exporter');
        }

        console.log('📊 SVG trouvé, contenu:', svgContent.length, 'caractères');

        // Générer le nom de fichier
        const finalFilename = filename || generateFilename('png');
        
        // Créer un canvas avec une meilleure résolution
        const canvas = await svgToCanvasFixed(svg, 2); // 2x pour meilleure qualité
        
        // Télécharger l'image
        downloadCanvas(canvas, finalFilename);
        
        console.log(`✅ Export PNG réussi: ${finalFilename}`);
        showExportNotification('PNG exporté avec succès!', 'success');
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'export PNG:', error);
        showExportNotification('Erreur lors de l\'export PNG: ' + error.message, 'error');
    }
}

/**
 * Exporte l'arbre au format PDF - VERSION CORRIGÉE
 */
export async function exportToPDF(filename = null) {
    try {
        console.log('📄 Début export PDF...');
        
        // Vérifier si jsPDF est disponible
        if (typeof window.jsPDF === 'undefined') {
            await loadJsPDF();
        }

        const svg = document.querySelector('#tree-svg');
        if (!svg) {
            throw new Error('SVG non trouvé');
        }

        // Vérifier qu'il y a du contenu
        const svgContent = svg.innerHTML;
        if (!svgContent || svgContent.trim().length === 0) {
            throw new Error('SVG vide - aucun contenu à exporter');
        }

        console.log('📊 SVG trouvé pour PDF, contenu:', svgContent.length, 'caractères');

        // Générer le nom de fichier
        const finalFilename = filename || generateFilename('pdf');
        
        // Convertir SVG en canvas
        const canvas = await svgToCanvasFixed(svg, 1.5); // Bonne qualité pour PDF
        
        // Créer le PDF
        await createPDFFromCanvas(canvas, finalFilename);
        
        console.log(`✅ Export PDF réussi: ${finalFilename}`);
        showExportNotification('PDF exporté avec succès!', 'success');
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'export PDF:', error);
        showExportNotification('Erreur lors de l\'export PDF: ' + error.message, 'error');
    }
}

/**
 * Convertit un SVG en canvas - VERSION CORRIGÉE
 */
export async function svgToCanvasFixed(svgElement, scale = 1) {
    return new Promise((resolve, reject) => {
        try {
            console.log('🔄 Conversion SVG vers Canvas...');
            
            // Cloner le SVG pour éviter de modifier l'original
            const clonedSvg = svgElement.cloneNode(true);
            
            // Nettoyer le SVG cloné
            cleanSVGForExportFixed(clonedSvg);
            
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
            console.error('❌ Erreur générale dans svgToCanvasFixed:', error);
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
 * Nettoie les filtres et effets - VERSION CORRIGÉE
 */
function cleanFiltersAndEffectsFixed(svgElement) {
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
function downloadCanvas(canvas, filename) {
    try {
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png', 1.0);
        
        // Ajouter au DOM temporairement
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('📥 Téléchargement initié:', filename);
    } catch (error) {
        console.error('❌ Erreur lors du téléchargement:', error);
        throw error;
    }
}

/**
 * Crée un PDF à partir d'un canvas
 */
async function createPDFFromCanvas(canvas, filename) {
    // const { jsPDF } = window;
    const { jsPDF } = window.jspdf;
    // Déterminer l'orientation selon les dimensions
    const isLandscape = canvas.width > canvas.height;
    const orientation = isLandscape ? 'landscape' : 'portrait';
    
    // Créer le PDF
    const pdf = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: 'a4'
    });
    
    // Dimensions de la page A4 en mm
    const pageWidth = orientation === 'landscape' ? 297 : 210;
    const pageHeight = orientation === 'landscape' ? 210 : 297;
    
    // Calculer les dimensions de l'image dans le PDF
    const imgAspectRatio = canvas.width / canvas.height;
    const pageAspectRatio = pageWidth / pageHeight;
    
    let imgWidth, imgHeight;
    if (imgAspectRatio > pageAspectRatio) {
        imgWidth = pageWidth - 20; // Marges de 10mm de chaque côté
        imgHeight = imgWidth / imgAspectRatio;
    } else {
        imgHeight = pageHeight - 20; // Marges de 10mm de chaque côté
        imgWidth = imgHeight * imgAspectRatio;
    }
    
    // Centrer l'image
    const x = (pageWidth - imgWidth) / 2;
    const y = (pageHeight - imgHeight) / 2;
    
    // Ajouter l'image au PDF
    const imgData = canvas.toDataURL('image/png', 1.0);
    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
    
    // Ajouter des métadonnées
    const rootPersonName = state.currentTree?.name || 'Arbre généalogique';
    pdf.setProperties({
        title: `Arbre généalogique - ${rootPersonName}`,
        subject: 'Arbre généalogique en éventail',
        author: 'Application Généalogie',
        creator: 'Application Généalogie'
    });
    
    // Télécharger le PDF
    pdf.save(filename);
    console.log('📄 PDF généré et téléchargé:', filename);
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

/**
 * Génère un nom de fichier automatique
 */
function generateFilename(extension) {
    const date = new Date().toISOString().split('T')[0];
    const rootPersonName = state.currentTree?.name || 'Arbre';
    const mode = state.treeModeReal || 'standard';
    
    // Nettoyer le nom pour le fichier
    const cleanName = rootPersonName
        .replace(/[^a-zA-Z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
    
    return `arbre_${cleanName}_${mode}_${date}.${extension}`;
}

/**
 * Affiche une notification d'export
 */
function showExportNotification(message, type = 'info') {
    // Supprimer les notifications existantes
    const existingNotifications = document.querySelectorAll('.export-notification');
    existingNotifications.forEach(notif => notif.remove());
    
    // Créer la notification
    const notification = document.createElement('div');
    notification.className = 'export-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    // Couleur selon le type
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#28a745';
            break;
        case 'error':
            notification.style.backgroundColor = '#dc3545';
            break;
        default:
            notification.style.backgroundColor = '#007bff';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Supprimer après 4 secondes
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

/**
 * Export simple pour test
 */
export async function exportTest() {
    console.log('🧪 Test d\'export...');
    try {
        await exportToPNG('test_export.png');
    } catch (error) {
        console.error('❌ Échec du test d\'export:', error);
    }
}

/**
 * Exporte avec options avancées
 */
export async function exportWithOptions(options = {}) {
    const {
        format = 'png',
        filename = null,
        quality = 1.0,
        scale = 1.0,
        includeBackground = true,
        backgroundColor = 'white'
    } = options;
    
    try {
        const svg = document.querySelector('#tree-svg');
        if (!svg) {
            throw new Error('SVG non trouvé');
        }
        
        // Créer un canvas avec les options spécifiées
        const canvas = await svgToCanvasWithOptions(svg, {
            scale,
            includeBackground,
            backgroundColor
        });
        
        const finalFilename = filename || generateFilename(format);
        
        if (format === 'pdf') {
            await createPDFFromCanvas(canvas, finalFilename);
        } else {
            // PNG ou JPEG
            downloadCanvasWithQuality(canvas, finalFilename, format, quality);
        }
        
        showExportNotification(`Export ${format.toUpperCase()} réussi!`, 'success');
        
    } catch (error) {
        console.error('Erreur lors de l\'export:', error);
        showExportNotification(`Erreur lors de l'export ${format.toUpperCase()}: ${error.message}`, 'error');
    }
}

/**
 * Convertit SVG en canvas avec options avancées
 */
async function svgToCanvasWithOptions(svgElement, options = {}) {
    const {
        scale = 1,
        includeBackground = true,
        backgroundColor = 'white'
    } = options;
    
    return new Promise((resolve, reject) => {
        try {
            const clonedSvg = svgElement.cloneNode(true);
            cleanSVGForExportFixed(clonedSvg);
            
            const svgRect = svgElement.getBoundingClientRect();
            const width = svgRect.width * scale;
            const height = svgRect.height * scale;
            
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            // Fond selon les options
            if (includeBackground) {
                ctx.fillStyle = backgroundColor;
                ctx.fillRect(0, 0, width, height);
            }
            
            const svgData = new XMLSerializer().serializeToString(clonedSvg);
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const svgUrl = URL.createObjectURL(svgBlob);
            
            const img = new Image();
            img.onload = function() {
                ctx.drawImage(img, 0, 0, width, height);
                URL.revokeObjectURL(svgUrl);
                resolve(canvas);
            };
            img.onerror = function(error) {
                URL.revokeObjectURL(svgUrl);
                reject(error);
            };
            
            img.src = svgUrl;
            
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Télécharge un canvas avec qualité spécifiée
 */
function downloadCanvasWithQuality(canvas, filename, format, quality) {
    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL(mimeType, quality);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Exporte seulement la partie visible de l'arbre
 */
export async function exportVisibleArea(format = 'png', filename = null) {
    try {
        const svg = document.querySelector('#tree-svg');
        const mainGroup = svg.querySelector('g');
        
        if (!svg || !mainGroup) {
            throw new Error('Éléments SVG non trouvés');
        }
        
        // Pour l'éventail, on prend tout le SVG car la zone visible est variable
        const canvas = await svgToCanvasFixed(svg, 1.5);
        const finalFilename = filename || generateFilename(format);
        
        if (format === 'pdf') {
            await createPDFFromCanvas(canvas, finalFilename);
        } else {
            downloadCanvas(canvas, finalFilename);
        }
        
        showExportNotification(`Export de la zone visible réussi!`, 'success');
        
    } catch (error) {
        console.error('Erreur lors de l\'export de la zone visible:', error);
        showExportNotification('Erreur lors de l\'export de la zone visible: ' + error.message, 'error');
    }
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
        '.person-segment': {
            'stroke': 'white',
            'stroke-width': '1.5px'
        },
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
}


/**
 * Met les styles CSS en ligne dans le SVG - VERSION QUI PRESERVE L'APPARENCE EXACTE
 */
function inlineStylesFixed(svgElement) {
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
 * Nettoie le SVG pour l'export - VERSION CORRIGÉE AVEC LIENS
 */
function cleanSVGForExportFixed(svgElement) {
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
       
        // NOUVEAU : Correction spécifique des boîtes avec couleurs exactes
        fixBoxesForExport(svgElement);
        
        // NOUVEAU : Correction spécifique des textes avec polices exactes
        fixTextsForExport(svgElement);

        // Correction spécifique des liens
        fixLinksForExport(svgElement);
        
        // Appliquer les styles réels (maintenant avec les corrections spécifiques)
        inlineStylesFixed(svgElement);
    }


    // Supprimer les éléments interactifs
    removeInteractiveElements(svgElement);
    
    // Nettoyer les filtres et effets
    cleanFiltersAndEffectsFixed(svgElement);
    
    console.log('✅ Nettoyage SVG terminé avec correction des liens et boîtes');
}




/**
 * Détecte si nous sommes en mode wheel/radar - VERSION AVEC LOGS DÉTAILLÉS
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
 * Test d'export haute résolution - À ajouter dans exportManager.js
 */

/**
 * Export PNG haute résolution pour test
 */
export async function exportHighResPNG(scaleFactor = 4) {
    try {
        console.log(`📷 Test export haute résolution (facteur ${scaleFactor}x)...`);
        
        const svg = document.querySelector('#tree-svg');
        if (!svg) {
            throw new Error('SVG non trouvé');
        }

        // Calculer les dimensions finales
        const svgRect = svg.getBoundingClientRect();
        const finalWidth = svgRect.width * scaleFactor;
        const finalHeight = svgRect.height * scaleFactor;
        
        console.log(`📐 Dimensions originales: ${svgRect.width}×${svgRect.height}`);
        console.log(`📐 Dimensions finales: ${finalWidth}×${finalHeight} pixels`);
        console.log(`📐 Équivalent DPI: ${Math.round(150 * scaleFactor)} DPI`);
        
        // Vérifier les limites du canvas
        if (finalWidth > 32767 || finalHeight > 32767) {
            console.warn('⚠️ Attention: Dimensions proches des limites Canvas!');
        }
        
        // Générer le nom de fichier avec info résolution
        const filename = generateHighResFilename('png', scaleFactor);
        
        // Créer un canvas haute résolution
        const canvas = await svgToCanvasHighRes(svg, scaleFactor);
        
        // Télécharger
        downloadCanvas(canvas, filename);
        
        console.log(`✅ Export haute résolution réussi: ${filename}`);
        showExportNotification(`PNG haute résolution (${scaleFactor}x) exporté!`, 'success');
        
    } catch (error) {
        console.error('❌ Erreur export haute résolution:', error);
        showExportNotification('Erreur export haute résolution: ' + error.message, 'error');
    }
}

/**
 * Conversion SVG vers Canvas haute résolution
 */
async function svgToCanvasHighRes(svgElement, scaleFactor) {
    return new Promise((resolve, reject) => {
        try {
            console.log(`🔄 Conversion SVG vers Canvas haute résolution (${scaleFactor}x)...`);
            
            // Cloner et nettoyer le SVG
            const clonedSvg = svgElement.cloneNode(true);
            cleanSVGForExportFixed(clonedSvg);
            
            // Dimensions originales
            const svgRect = svgElement.getBoundingClientRect();
            const originalWidth = svgRect.width || 800;
            const originalHeight = svgRect.height || 600;
            
            // Dimensions finales haute résolution
            const finalWidth = originalWidth * scaleFactor;
            const finalHeight = originalHeight * scaleFactor;
            
            console.log(`📊 Résolution finale: ${finalWidth}×${finalHeight} pixels`);
            
            // Créer le canvas haute résolution
            const canvas = document.createElement('canvas');
            canvas.width = finalWidth;
            canvas.height = finalHeight;
            const ctx = canvas.getContext('2d');
            
            // Améliorer la qualité de rendu
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            // Fond blanc haute résolution
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, finalWidth, finalHeight);
            
            // Préparer le SVG avec les bonnes dimensions
            clonedSvg.setAttribute('width', originalWidth);
            clonedSvg.setAttribute('height', originalHeight);
            clonedSvg.setAttribute('viewBox', `0 0 ${originalWidth} ${originalHeight}`);
            
            // Sérialiser le SVG
            const svgString = new XMLSerializer().serializeToString(clonedSvg);
            const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            const svgUrl = URL.createObjectURL(svgBlob);
            
            // Créer l'image et la dessiner en haute résolution
            const img = new Image();
            img.onload = function() {
                console.log('🖼️ Image chargée, dessin haute résolution...');
                try {
                    // Dessiner l'image agrandie sur le canvas
                    ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
                    URL.revokeObjectURL(svgUrl);
                    
                    console.log(`✅ Conversion haute résolution terminée (${finalWidth}×${finalHeight})`);
                    resolve(canvas);
                } catch (drawError) {
                    console.error('❌ Erreur lors du dessin haute résolution:', drawError);
                    URL.revokeObjectURL(svgUrl);
                    reject(drawError);
                }
            };
            
            img.onerror = function(error) {
                console.error('❌ Erreur de chargement image haute résolution:', error);
                URL.revokeObjectURL(svgUrl);
                reject(new Error('Impossible de charger l\'image SVG haute résolution'));
            };
            
            img.src = svgUrl;
            
        } catch (error) {
            console.error('❌ Erreur générale haute résolution:', error);
            reject(error);
        }
    });
}

/**
 * Génère un nom de fichier avec info résolution
 */
function generateHighResFilename(extension, scaleFactor) {
    const date = new Date().toISOString().split('T')[0];
    const rootPersonName = state.currentTree?.name || 'Arbre';
    const mode = state.treeModeReal || 'standard';
    const dpi = Math.round(150 * scaleFactor);
    
    const cleanName = rootPersonName
        .replace(/[^a-zA-Z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
    
    return `arbre_${cleanName}_${mode}_${dpi}dpi_${date}.${extension}`;
}
















/**
 * Export complet de l'arbre - même les parties hors écran
 */
export async function exportFullTreePNG(scaleFactor = 4) {
    try {
        console.log(`📷 Export arbre complet (facteur ${scaleFactor}x)...`);
        
        const svg = document.querySelector('#tree-svg');
        if (!svg) {
            throw new Error('SVG non trouvé');
        }

        // IMPORTANT : Calculer les dimensions réelles de l'arbre (pas de l'écran)
        const fullDimensions = calculateFullTreeDimensions(svg);
        console.log('📐 Dimensions réelles de l\'arbre:', fullDimensions);

        // Créer un canvas basé sur les dimensions réelles
        const canvas = await svgToCanvasFullTree(svg, scaleFactor, fullDimensions);
        
        const filename = generateFullTreeFilename('png', scaleFactor, fullDimensions);
        downloadCanvas(canvas, filename);
        
        console.log(`✅ Export arbre complet réussi: ${filename}`);
        showExportNotification(`Arbre complet exporté (${scaleFactor}x)!`, 'success');
        
    } catch (error) {
        console.error('❌ Erreur export arbre complet:', error);
        showExportNotification('Erreur export arbre complet: ' + error.message, 'error');
    }
}

/**
 * Calcule les dimensions réelles de l'arbre (tous les éléments)
 */
function calculateFullTreeDimensions(svg) {
    console.log('📊 Calcul des dimensions réelles de l\'arbre...');
    
    // Récupérer tous les éléments visibles de l'arbre
    const allElements = svg.querySelectorAll('rect, circle, path, text');
    
    if (allElements.length === 0) {
        console.warn('Aucun élément trouvé dans le SVG');
        return {
            width: 800,
            height: 600,
            minX: 0,
            minY: 0,
            maxX: 800,
            maxY: 600
        };
    }
    
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    
    allElements.forEach(element => {
        try {
            const bbox = element.getBBox();
            const transform = element.getAttribute('transform');
            
            let x = bbox.x;
            let y = bbox.y;
            let width = bbox.width;
            let height = bbox.height;
            
            // Prendre en compte les transformations
            if (transform) {
                const matrix = element.getScreenCTM();
                if (matrix) {
                    x = matrix.e;
                    y = matrix.f;
                }
            }
            
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x + width);
            maxY = Math.max(maxY, y + height);
            
        } catch (error) {
            // Ignorer les éléments qui ne peuvent pas être mesurés
            console.warn('Élément non mesurable:', element.tagName);
        }
    });
    
    // Ajouter une marge de sécurité
    const margin = 50;
    minX -= margin;
    minY -= margin;
    maxX += margin;
    maxY += margin;
    
    const width = maxX - minX;
    const height = maxY - minY;
    
    console.log(`📏 Dimensions calculées: ${width}×${height} (${minX},${minY} → ${maxX},${maxY})`);
    
    return {
        width: Math.ceil(width),
        height: Math.ceil(height),
        minX: Math.floor(minX),
        minY: Math.floor(minY),
        maxX: Math.ceil(maxX),
        maxY: Math.ceil(maxY)
    };
}

/**
 * Conversion SVG vers Canvas avec dimensions complètes
 */
async function svgToCanvasFullTree(svgElement, scaleFactor, fullDimensions) {
    return new Promise((resolve, reject) => {
        try {
            console.log(`🔄 Conversion SVG complet vers Canvas (${scaleFactor}x)...`);
            
            // Cloner et nettoyer le SVG
            const clonedSvg = svgElement.cloneNode(true);
            cleanSVGForExportFixed(clonedSvg);
            
            // Utiliser les dimensions réelles de l'arbre
            const finalWidth = fullDimensions.width * scaleFactor;
            const finalHeight = fullDimensions.height * scaleFactor;
            
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
            
            // Améliorer la qualité
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            // Fond blanc
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, finalWidth, finalHeight);
            
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
                console.log('🖼️ Image chargée, dessin arbre complet...');
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
            
        } catch (error) {
            console.error('❌ Erreur générale export complet:', error);
            reject(error);
        }
    });
}

/**
 * Export multi-pages pour grands arbres
 */
export async function exportMultiPageTree(options = {}) {
    try {
        console.log('📄 Export multi-pages...');
        
        const {
            pageSize = '8xa4',
            dpi = 300,
            format = 'png',
            includeGuides = true
        } = options;
        
        const svg = document.querySelector('#tree-svg');
        if (!svg) {
            throw new Error('SVG non trouvé');
        }
        
        // Calculer les dimensions réelles
        const fullDimensions = calculateFullTreeDimensions(svg);
        
        // Calculer les dimensions de page selon le format
        const pageInfo = calculatePageDimensions(pageSize, dpi);
        
        // Calculer combien de pages nécessaires
        const pagesNeeded = calculatePagesNeeded(fullDimensions, pageInfo);
        
        console.log('📊 Pages nécessaires:', pagesNeeded);
        
        // Créer chaque page
        const pages = [];
        for (let i = 0; i < pagesNeeded.total; i++) {
            const pageCanvas = await createPageCanvas(svg, fullDimensions, pageInfo, i, pagesNeeded, includeGuides);
            pages.push(pageCanvas);
        }
        
        // Télécharger toutes les pages
        for (let i = 0; i < pages.length; i++) {
            const filename = `arbre_page_${i + 1}_sur_${pages.length}_${pageSize}_${dpi}dpi.${format}`;
            downloadCanvas(pages[i], filename);
            
            // Petit délai entre les téléchargements
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        console.log(`✅ Export multi-pages terminé: ${pages.length} pages`);
        showExportNotification(`${pages.length} pages exportées!`, 'success');
        
    } catch (error) {
        console.error('❌ Erreur export multi-pages:', error);
        showExportNotification('Erreur export multi-pages: ' + error.message, 'error');
    }
}

/**
 * Calcule les dimensions d'une page selon le format
 */
function calculatePageDimensions(pageSize, dpi) {
    const mmToPx = dpi / 25.4;
    
    let width, height, name;
    
    switch (pageSize) {
        case 'a4':
            width = 210 * mmToPx;
            height = 297 * mmToPx;
            name = 'A4';
            break;
        case 'a3':
            width = 297 * mmToPx;
            height = 420 * mmToPx;
            name = 'A3';
            break;
        case '2xa4':
            width = 210 * mmToPx;
            height = 594 * mmToPx; // 2 * 297
            name = '2×A4';
            break;
        case '4xa4':
            width = 420 * mmToPx; // 2 * 210
            height = 594 * mmToPx; // 2 * 297
            name = '4×A4';
            break;
        case '8xa4':
            width = 210 * mmToPx;
            height = 2376 * mmToPx; // 8 * 297
            name = '8×A4';
            break;
        default:
            width = 210 * mmToPx;
            height = 297 * mmToPx;
            name = 'A4';
    }
    
    return {
        width: Math.round(width),
        height: Math.round(height),
        name,
        mmToPx
    };
}

/**
 * Calcule le nombre de pages nécessaires
 */
function calculatePagesNeeded(fullDimensions, pageInfo) {
    const pagesX = Math.ceil(fullDimensions.width / pageInfo.width);
    const pagesY = Math.ceil(fullDimensions.height / pageInfo.height);
    
    return {
        x: pagesX,
        y: pagesY,
        total: pagesX * pagesY
    };
}

/**
 * Crée le canvas d'une page spécifique
 */
async function createPageCanvas(svg, fullDimensions, pageInfo, pageIndex, pagesNeeded, includeGuides) {
    // Calculer la position de cette page
    const pageX = pageIndex % pagesNeeded.x;
    const pageY = Math.floor(pageIndex / pagesNeeded.x);
    
    // Calculer la zone à capturer
    const cropX = pageX * pageInfo.width;
    const cropY = pageY * pageInfo.height;
    
    console.log(`📄 Création page ${pageIndex + 1} (${pageX}, ${pageY})`);
    
    // Créer le canvas de la page
    const canvas = document.createElement('canvas');
    canvas.width = pageInfo.width;
    canvas.height = pageInfo.height;
    const ctx = canvas.getContext('2d');
    
    // Fond blanc
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, pageInfo.width, pageInfo.height);
    
    // Créer l'image complète de l'arbre
    const fullCanvas = await svgToCanvasFullTree(svg, 1, fullDimensions);
    
    // Découper la partie correspondant à cette page
    ctx.drawImage(
        fullCanvas,
        cropX, cropY, pageInfo.width, pageInfo.height, // Source
        0, 0, pageInfo.width, pageInfo.height // Destination
    );
    
    // Ajouter les guides de découpe si demandé
    if (includeGuides) {
        addCuttingGuides(ctx, pageInfo, pageIndex + 1, pagesNeeded.total);
    }
    
    return canvas;
}

/**
 * Ajoute les marques de découpe/collage
 */
function addCuttingGuides(ctx, pageInfo, pageNumber, totalPages) {
    ctx.save();
    
    // Style des guides
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.font = '12px Arial';
    ctx.fillStyle = 'red';
    
    // Coins de découpe
    const cornerSize = 20;
    
    // Coin haut-gauche
    ctx.beginPath();
    ctx.moveTo(0, cornerSize);
    ctx.lineTo(0, 0);
    ctx.lineTo(cornerSize, 0);
    ctx.stroke();
    
    // Coin haut-droite
    ctx.beginPath();
    ctx.moveTo(pageInfo.width - cornerSize, 0);
    ctx.lineTo(pageInfo.width, 0);
    ctx.lineTo(pageInfo.width, cornerSize);
    ctx.stroke();
    
    // Coin bas-gauche
    ctx.beginPath();
    ctx.moveTo(0, pageInfo.height - cornerSize);
    ctx.lineTo(0, pageInfo.height);
    ctx.lineTo(cornerSize, pageInfo.height);
    ctx.stroke();
    
    // Coin bas-droite
    ctx.beginPath();
    ctx.moveTo(pageInfo.width - cornerSize, pageInfo.height);
    ctx.lineTo(pageInfo.width, pageInfo.height);
    ctx.lineTo(pageInfo.width, pageInfo.height - cornerSize);
    ctx.stroke();
    
    // Numéro de page
    ctx.fillText(`Page ${pageNumber}/${totalPages}`, 10, 30);
    
    ctx.restore();
}

/**
 * Génère un nom de fichier pour l'arbre complet
 */
function generateFullTreeFilename(extension, scaleFactor, dimensions) {
    const date = new Date().toISOString().split('T')[0];
    const rootPersonName = state.currentTree?.name || 'Arbre';
    const mode = state.treeModeReal || 'standard';
    const dpi = Math.round(150 * scaleFactor);
    
    const cleanName = rootPersonName
        .replace(/[^a-zA-Z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
    
    return `arbre_complet_${cleanName}_${mode}_${dimensions.width}x${dimensions.height}_${dpi}dpi_${date}.${extension}`;
}