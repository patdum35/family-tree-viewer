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
 * Nettoie le SVG pour l'export - VERSION CORRIGÉE
 */
function cleanSVGForExportFixed(svgElement) {
    console.log('🧹 Nettoyage du SVG pour export...');
    
    // Définir les dimensions explicitement
    const rect = svgElement.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 600;
    
    svgElement.setAttribute('width', width);
    svgElement.setAttribute('height', height);
    svgElement.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    
    // Assurer que tous les styles sont en ligne
    inlineStylesFixed(svgElement);
    
    // Supprimer les éléments de contrôle interactifs
    removeInteractiveElements(svgElement);
    
    // Nettoyer les filtres et effets
    cleanFiltersAndEffectsFixed(svgElement);
    
    console.log('✅ Nettoyage SVG terminé');
}

/**
 * Met les styles CSS en ligne dans le SVG - VERSION CORRIGÉE
 */
function inlineStylesFixed(svgElement) {
    const svgElements = svgElement.querySelectorAll('*');
    
    // Styles par défaut pour l'éventail
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
        '.generation-1': { 'fill': '#e8f4fd' },
        '.generation-2': { 'fill': '#b3d9ff' },
        '.generation-3': { 'fill': '#80bfff' },
        '.generation-4': { 'fill': '#4da6ff' },
        '.generation-5': { 'fill': '#1a8cff' },
        '.generation-6': { 'fill': '#0066cc' },
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
    
    // Appliquer les styles par défaut
    svgElements.forEach(element => {
        const classList = Array.from(element.classList);
        
        // Appliquer les styles basés sur les classes
        classList.forEach(className => {
            const selector = '.' + className;
            if (defaultStyles[selector]) {
                Object.entries(defaultStyles[selector]).forEach(([prop, value]) => {
                    element.style.setProperty(prop, value);
                });
            }
        });
        
        // Styles calculés importants
        const computedStyle = window.getComputedStyle(element);
        const importantStyles = ['fill', 'stroke', 'stroke-width', 'font-family', 'font-size', 'font-weight', 'text-anchor'];
        importantStyles.forEach(prop => {
            const value = computedStyle.getPropertyValue(prop);
            if (value && value !== 'none' && !element.style.getPropertyValue(prop)) {
                element.style.setProperty(prop, value);
            }
        });
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