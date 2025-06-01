// Nouvelle implémentation de la modal des paramètres
import { setupElegantBackground, setupCustomImageBackground } from './backgroundManager.js';
import { createCustomSelector, createOptionsFromLists } from './UIutils.js';
import { nameCloudState } from './nameCloud.js';
import { setTargetAncestorId } from './treeAnimation.js';
import { updatePrenoms } from './main.js';
import { createImageSelectorDialog } from './mainUI.js';
import { initializeAllFanControls } from './treeFanControls.js';



// Traductions pour les éléments de l'interface
const settingsTranslations = {
    'fr': {
        'settingsTitle': 'Paramètres Avancés',
        'backgroundTab': 'Fond d\'écran',
        'diversTab': 'Divers',
        'geolocTab': 'Géoloc',
        'backgroundType': 'Type de fond',
        'opacity': 'Opacité',
        'patternDetail': 'Détail motifs',
        'animation': 'Animation',
        'speed': 'Vitesse',
        'color': 'Couleur',
        'hue': 'Teinte:',
        'saturation': 'Satur.:',
        'brightness': 'Lumin.:',
        'selectImage': 'Sélectionner une image...',
        'targetAncestorId': 'ID de l\'Ancêtre Cible',
        'enterAncestorId': 'Entrez l\'ID de l\'ancêtre',
        'save': 'Enregistrer',
        'firstNameCount': 'Nombre de Prénoms',
        'geolocInfo': 'La fonctionnalité de géolocalisation utilise l\'interface existante.',
        'openGeolocInterface': 'Ouvrir l\'interface de géolocalisation',
        'settingsApplied': 'Paramètres appliqués avec succès!',
        'enterValidId': 'Veuillez entrer un ID valide',
        'ancestorIdSaved': 'ID de l\'ancêtre enregistré avec succès !',
        'firstNameCountUpdated': 'Nombre de prénoms mis à jour',
        'applyingBackground': 'Application du fond:',
        'none': 'Aucun fond',
        'image': 'Image',
        'bubbles': 'Bubbles',
        'bubblesPopup': 'Bubbles pop',
        'treeBranches': 'Branches d\'arbre',
        'fallingLeaves': 'Feuilles tombantes',
        'growingTree': 'Arbre qui pousse',
        'parchment': 'Parchemin',
        'grid': 'Grille',
        'paperTexture': 'Texture papier',
        'fractal': 'Motif fractal',
        'art': 'Art',
        'artDeco': 'Art Déco',
        'organicPattern': 'Motif organique',
        'curvedLines': 'Lignes courbes',
        'simpleBackground': 'Simple',
        'treeRings': 'Anneaux d\'arbre',
        
        // Messages système
        'errorApplyingBackground': 'Erreur lors de l\'application du fond:',
        'restoring': 'Tentative de restauration du fond précédent:',
        'mainSvgNotFound': 'SVG principal non trouvé',
        
        // Autres éléments d'interface
        'close': 'Fermer',
        'apply': 'Appliquer',
        'restore': 'Restaurer',
        'cancel': 'Annuler',

        'exportTab': 'Export png/jpg/pdf',
        'exportInfo': 'Configuration des options d\'export PNG, PDF et JPEG.',
        'openExportInterface': 'Ouvrir l\'interface d\'export',
    },
    'en': {
        'settingsTitle': 'Advanced Settings',
        'backgroundTab': 'Background',
        'diversTab': 'Miscellaneous',
        'geolocTab': 'Geoloc',
        'backgroundType': 'Background type',
        'opacity': 'Opacity',
        'patternDetail': 'Pattern detail',
        'animation': 'Animation',
        'speed': 'Speed',
        'color': 'Color',
        'hue': 'Hue:',
        'saturation': 'Sat.:',
        'brightness': 'Light.:',
        'selectImage': 'Select an image...',
        'targetAncestorId': 'Target Ancestor ID',
        'enterAncestorId': 'Enter ancestor ID',
        'save': 'Save',
        'firstNameCount': 'First Name Count',
        'geolocInfo': 'The geolocation feature uses the existing interface.',
        'openGeolocInterface': 'Open geolocation interface',
        'settingsApplied': 'Settings applied successfully!',
        'enterValidId': 'Please enter a valid ID',
        'ancestorIdSaved': 'Ancestor ID saved successfully!',
        'firstNameCountUpdated': 'First name count updated',
        'applyingBackground': 'Applying background:',
        'none': 'No background',
        'image': 'Image',
        'bubbles': 'Bubbles',
        'bubblesPopup': 'Bubbles popup',
        'treeBranches': 'Tree branches',
        'fallingLeaves': 'Falling leaves',
        'growingTree': 'Growing tree',
        'parchment': 'Parchment',
        'grid': 'Grid',
        'paperTexture': 'Paper texture',
        'fractal': 'Fractal pattern',
        'art': 'Art',
        'artDeco': 'Art Deco',
        'organicPattern': 'Organic Pattern',
        'curvedLines': 'Curved Lines',
        'simpleBackground': 'Simple',
        'treeRings': 'Tree Rings',
        
        // Messages système
        'errorApplyingBackground': 'Error applying background:',
        'restoring': 'Attempting to restore previous background:',
        'mainSvgNotFound': 'Main SVG not found',
        
        // Autres éléments d'interface
        'close': 'Close',
        'apply': 'Apply',
        'restore': 'Restore',
        'cancel': 'Cancel',
        'exportTab': 'Export png/jpg/pdf',
        'exportInfo': 'Configure PNG, PDF and JPEG export options.',
        'openExportInterface': 'Open export interface',
    },
    'es': {
        'settingsTitle': 'Configuración Avanzada',
        'backgroundTab': 'Fondo',
        'diversTab': 'Varios',
        'geolocTab': 'Geoloc',
        'backgroundType': 'Tipo de fondo',
        'opacity': 'Opacidad',
        'patternDetail': 'Detalle del patrón',
        'animation': 'Animación',
        'speed': 'Velocidad',
        'color': 'Color',
        'hue': 'Tono:',
        'saturation': 'Satur.:',
        'brightness': 'Lumin.:',
        'selectImage': 'Seleccionar una imagen...',
        'targetAncestorId': 'ID del Ancestro Objetivo',
        'enterAncestorId': 'Introduzca el ID del ancestro',
        'save': 'Guardar',
        'firstNameCount': 'Número de Nombres',
        'geolocInfo': 'La función de geolocalización utiliza la interfaz existente.',
        'openGeolocInterface': 'Abrir interfaz de geolocalización',
        'settingsApplied': '¡Configuración aplicada con éxito!',
        'enterValidId': 'Por favor, introduzca un ID válido',
        'ancestorIdSaved': '¡ID del ancestro guardado con éxito!',
        'firstNameCountUpdated': 'Número de nombres actualizado',
        'applyingBackground': 'Aplicando fondo:',
        'none': 'Sin fondo',
        'image': 'Imagen',
        'bubbles': 'Burbujas',
        'bubblesPopup': 'Burbujas emergentes',
        'treeBranches': 'Ramas de árbol',
        'fallingLeaves': 'Hojas cayendo',
        'growingTree': 'Árbol creciendo',
        'parchment': 'Pergamino',
        'grid': 'Cuadrícula',
        'paperTexture': 'Textura de papel',
        'fractal': 'Patrón fractal',
        'art': 'Arte',
        'artDeco': 'Art Decó',
        'organicPattern': 'Patrón orgánico',
        'curvedLines': 'Líneas curvas',
        'simpleBackground': 'Simple',
        'treeRings': 'Anillos de árbol',
        
        // Messages système
        'errorApplyingBackground': 'Error al aplicar el fondo:',
        'restoring': 'Intentando restaurar el fondo anterior:',
        'mainSvgNotFound': 'SVG principal no encontrado',
        
        // Autres éléments d'interface
        'close': 'Cerrar',
        'apply': 'Aplicar',
        'restore': 'Restaurar',
        'cancel': 'Cancelar',
        'exportTab': 'Export png/jpg/pdf', 
        'exportInfo': 'Configuración de opciones de exportación PNG, PDF y JPEG.',
        'openExportInterface': 'Abrir interfaz de exportación',
    },
    'hu': {
        'settingsTitle': 'Speciális Beállítások',
        'backgroundTab': 'Háttér',
        'diversTab': 'Egyéb',
        'geolocTab': 'Geoloc',
        'backgroundType': 'Háttér típusa',
        'opacity': 'Átlátszóság',
        'patternDetail': 'Minta részletessége',
        'animation': 'Animáció',
        'speed': 'Sebesség',
        'color': 'Szín',
        'hue': 'Árnyalat:',
        'saturation': 'Telít.:',
        'brightness': 'Fény.:',
        'selectImage': 'Kép kiválasztása...',
        'targetAncestorId': 'Célős Azonosítója',
        'enterAncestorId': 'Adja meg az ős azonosítóját',
        'save': 'Mentés',
        'firstNameCount': 'Keresztnevek Száma',
        'geolocInfo': 'A geolokációs funkció a meglévő felületet használja.',
        'openGeolocInterface': 'Geolokációs felület megnyitása',
        'settingsApplied': 'Beállítások sikeresen alkalmazva!',
        'enterValidId': 'Kérjük, adjon meg érvényes azonosítót',
        'ancestorIdSaved': 'Az ős azonosítója sikeresen mentve!',
        'firstNameCountUpdated': 'Keresztnevek száma frissítve',
        'applyingBackground': 'Háttér alkalmazása:',
        'none': 'Nincs háttér',
        'image': 'Kép',
        'bubbles': 'Buborékok',
        'bubblesPopup': 'Felbukkanó buborékok',
        'treeBranches': 'Faágak',
        'fallingLeaves': 'Hulló levelek',
        'growingTree': 'Növekvő fa',
        'parchment': 'Pergamen',
        'grid': 'Rács',
        'paperTexture': 'Papír textúra',
        'fractal': 'Fraktál minta',
        'art': 'Művészet',
        'artDeco': 'Art Deco',
        'organicPattern': 'Organikus minta',
        'curvedLines': 'Görbe vonalak',
        'simpleBackground': 'Egyszerű',
        'treeRings': 'Fa gyűrűk',
        
        // Messages système
        'errorApplyingBackground': 'Hiba a háttér alkalmazásakor:',
        'restoring': 'Kísérlet az előző háttér visszaállítására:',
        'mainSvgNotFound': 'Fő SVG nem található',
        
        // Autres éléments d'interface
        'close': 'Bezárás',
        'apply': 'Alkalmazás',
        'restore': 'Visszaállítás',
        'cancel': 'Mégse',
        'exportTab': 'Export png/jpg/pdf',
        'exportInfo': 'PNG, PDF és JPEG export opciók konfigurálása.',
        'openExportInterface': 'Export felület megnyitása',
    }
};

// Fonction pour obtenir le texte traduit selon la langue actuelle
function translateSettings(key) {
    const currentLang = window.CURRENT_LANGUAGE || 'fr';
    return settingsTranslations[currentLang]?.[key] || 
           settingsTranslations['fr'][key] || 
           key;
}

document.addEventListener('DOMContentLoaded', function() {
  // Restaurer la langue précédemment sélectionnée ou utiliser le français par défaut
  const savedLanguage = localStorage.getItem('preferredLanguage') || 'fr';
  window.CURRENT_LANGUAGE = savedLanguage;
  
  // Si un sélecteur de langue est déjà présent dans la page, le mettre à jour
  const existingSelector = document.getElementById('language-selector');
  if (existingSelector) {
    existingSelector.value = savedLanguage;
  }
});

// État des paramètres de fond d'écran avec vérification stricte des valeurs
const backgroundSettings = {
    // type: localStorage.getItem('preferredBackground') || 'growingTree',
    // opacity: getNumericValue('backgroundOpacity', 0.5),
    // patternVisibility: getNumericValue('patternVisibility', 1.0),
    // animation: localStorage.getItem('backgroundAnimation') === 'true' || false,
    // animationSpeed: getNumericValue('animationSpeed', 0.3),
    // customColor: localStorage.getItem('backgroundCustomColor') || '#F5F0E6'
    
    
    type: localStorage.getItem('preferredBackground') || 'poppingBubbles', //'growingTree',
    opacity: getNumericValue('backgroundOpacity', 1.0) || 1.0, //0.5),
    patternVisibility: getNumericValue('patternVisibility', 1.0) || 1.0 ,
    // animation: localStorage.getItem('backgroundAnimation') === null ? true : localStorage.getItem('backgroundAnimation') === 'true',
    animation: localStorage.getItem('backgroundAnimation') === null ? false : localStorage.getItem('backgroundAnimation') === 'true',
    
    animationSpeed: getNumericValue('animationSpeed', 2.0) || 2.0, //0.3),
    customColor: localStorage.getItem('backgroundCustomColor') || '#B5D9A7' //'#F5F0E6'
};

    
// Fonction d'aide pour obtenir une valeur numérique valide depuis localStorage
// Version corrigée de la fonction getNumericValue
function getNumericValue(key, defaultValue) {
    const stored = localStorage.getItem(key);
    if (stored === null || stored === '') return defaultValue;
    
    const parsed = parseFloat(stored);
    // Si la valeur n'est pas un nombre ou est NaN, renvoyer la valeur par défaut
    return !isNaN(parsed) ? parsed : defaultValue;
}

// Fonction principale pour créer la nouvelle modal
export function createEnhancedSettingsModal() {
    // Supprimer l'ancienne modal si elle existe
    const oldModal = document.getElementById('settings-modal');
    if (oldModal) {
        oldModal.style.display = 'none';
    }

    // Vérifier si une modale est déjà ouverte et la fermer
    const existingModal = document.getElementById('enhanced-settings-modal');
    if (existingModal) {
        document.body.removeChild(existingModal);
    }

    // Créer la nouvelle modal
    const modal = createModalContainer();
    const modalContent = createModalContent();
    
    // Ajouter le conteneur principal à la modal
    modal.appendChild(modalContent);
    
    // Ajouter la modal au corps du document
    document.body.appendChild(modal);
    
    // Initialiser et configurer les contrôles
    initializeControls(modalContent);
    
    // Configurer les événements
    setupModalEvents(modal);
    
    return modal;
}

function createModalContainer() {
    const modal = document.createElement('div');
    modal.id = 'enhanced-settings-modal';
    modal.className = 'enhanced-modal-container';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    // modal.style.width = '100%';
    if (window.innerWidth < 400) {
        modal.style.width = '350px';
    } else {
        modal.style.width = '100%';
    }
    modal.style.height = '100%';
    modal.style.backgroundColor = 'transparent'; // Complètement transparent
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';
    return modal;
}

function createTypeSelect(config) {
    // Définir les options et les valeurs correspondantes - Version compacte
    // const typeOptions = ['Aucun', 'Image', 'Bubbles', 'Bubbles Pop', 'Branches', 'Feuilles', 'Arbre', 'Parchemin', 'Grille', 'Papier', 'Fractales', 'Pollock', 'Kandinsky', 'Miró', 'Mondrian', 'Anneaux', 'Art Déco', 'Organique', 'Courbes', 'Simple'];
    // const typeOptionsExpanded = ['Aucun fond', 'Image', 'Bubbles', 'Bubbles pop', 'Branches d\'arbre', 'Feuilles tombantes', 'Arbre qui pousse', 'Parchemin', 'Grille', 'Texture papier', 'Motif fractal', 'Pollock', 'Kandinsky', 'Miró', 'Mondrian', 'Anneaux d\'arbre', 'Art Déco', 'Motif organique', 'Lignes courbes', 'Simple'];

    const typeOptions = [
        translateSettings('none'), 
        translateSettings('image'), 
        'Bubbles', 
        'Bubbles Pop', 
        translateSettings('treeBranches'), 
        translateSettings('fallingLeaves'), 
        translateSettings('growingTree'), 
        translateSettings('parchment'), 
        translateSettings('grid'), 
        translateSettings('paperTexture'), 
        translateSettings('fractal'), 
        'Pollock', 
        'Kandinsky', 
        'Miró', 
        'Mondrian', 
        translateSettings('art')
    ];
    
    const typeOptionsExpanded = [
        translateSettings('none'), 
        translateSettings('image'), 
        'Bubbles', 
        translateSettings('bubblesPopup'), 
        translateSettings('treeBranches'), 
        translateSettings('fallingLeaves'), 
        translateSettings('growingTree'), 
        translateSettings('parchment'), 
        translateSettings('grid'), 
        translateSettings('paperTexture'), 
        translateSettings('fractal'), 
        'Pollock', 
        'Kandinsky', 
        'Miró', 
        'Mondrian',
        translateSettings('art')
    ];

    const typeValues = ['none', 'customImage', 'bubbles', 'poppingBubbles', 'treeBranches', 'fallingLeaves', 'growingTree', 'parchment', 'grid', 'paperTexture', 'fractal', 'pollock', 'kandinsky', 'miro', 'mondrian','treeRings', 'artDeco', 'organicPattern', 'curvedLines', 'simpleBackground' ];
    
    // Utiliser createOptionsFromLists au lieu de créer manuellement la liste
    const options = createOptionsFromLists(typeOptions, typeOptionsExpanded, typeValues);
    
    // Couleurs pour le sélecteur personnalisé - style nameCloudUI
    const colors = {
        main: ' #4361ee',    // Bleu nameCloudUI
        options: ' #38b000', // Vert nameCloudUI
        hover: ' #2e9800',   // Vert plus foncé nameCloudUI 
        selected: ' #1a4d00' // Vert encore plus foncé nameCloudUI
    };
    
    // Utiliser le sélecteur personnalisé avec style nameCloudUI
    let dropdownHeight;
    if (window.innerHeight < 400) {
      dropdownHeight = '160px';
    } else {
      dropdownHeight = '345px';
    }
    
    
    return createCustomSelector({
        options: options,
        selectedValue: config.type,
        colors: colors,
        isMobile: nameCloudState.mobilePhone,
        dimensions: {
            width: '120px', // Plus compact
            height: '25px',  // Plus compact
            dropdownWidth: '170px',
            dropdownMaxHeight: dropdownHeight,
        },
        padding: {
            display: { x: 4, y: 1 },    // Padding minimal comme nameCloudUI
            options: { x: 8, y: 5 }     // Padding réduit comme nameCloudUI
        },
        arrow: {
            position: 'top-right',
            size: 5.5,
            offset: { x: -5, y: 1} // Style nameCloudUI
        },
        customizeOptionElement: (optionElement, option) => {
            // Utiliser le label étendu dans le menu déroulant
            optionElement.textContent = option.expandedLabel;
            
            // Centrer le texte
            optionElement.style.textAlign = 'center';
            
            // Padding spécifique
            optionElement.style.padding = '6px 4px';
        },
        onChange: (value) => {
            backgroundSettings.type = value;
            localStorage.setItem('preferredBackground', value);
            
            // Si image personnalisée, afficher le bouton de sélection d'image
            if (value === 'customImage') {
                document.getElementById('custom-image-button').style.display = 'block';
            } else {
                document.getElementById('custom-image-button').style.display = 'none';
            }
            
            // Appliquer le fond immédiatement
            applyBackground(value);
        }
    });
}

function createModalContent() {
    const content = document.createElement('div');
    content.className = 'enhanced-modal-content';
    content.style.backgroundColor = 'rgba(240, 245, 255, 0.85)';
    content.style.borderRadius = '10px';
    content.style.padding = '10px';
    content.style.width = '90%';
    content.style.maxWidth = '500px';
    content.style.maxHeight = '70vh';
    content.style.overflow = 'auto';
    content.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
    content.style.position = 'relative';
    
    // Créer l'en-tête de la modal avec style nameCloudUI
    const header = document.createElement('div');
    header.className = 'modal-header';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '6px';
    header.style.borderBottom = '1px solid #e0e0e0';
    header.style.paddingBottom = '5px';
    header.style.backgroundColor = 'white';
    header.style.padding = '8px';
    header.style.borderRadius = '10px 10px 0 0';
    header.style.marginLeft = '-10px';
    header.style.marginRight = '-10px';
    header.style.marginTop = '-10px';
    header.style.width = 'calc(100% + 0px)';
    // header.style.width = '100%';
    header.style.position = 'sticky'; // Rendre l'en-tête sticky
    header.style.top = '-10px'; // Aligner avec le haut du contenu
    header.style.zIndex = '10'; // S'assurer qu'il reste au-dessus
    
    // Créer la partie gauche de l'en-tête (titre)
    const titleContainer = document.createElement('div');
    titleContainer.style.display = 'flex';
    titleContainer.style.alignItems = 'center';
    
    const title = document.createElement('h2');
    // title.textContent = 'Paramètres Avancés';
    title.textContent = translateSettings('settingsTitle');
    title.style.margin = '0';
    title.style.fontSize = '16px';
    title.style.color = '#333';
    
    titleContainer.appendChild(title);
    
    // Créer le bouton rond X qui remplace le bouton Appliquer
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    closeButton.className = 'modal-close-btn';
    closeButton.style.border = 'none';
    closeButton.style.background = '#4361ee';
    closeButton.style.color = 'white';
    closeButton.style.fontSize = '20px';
    closeButton.style.fontWeight = 'bold';
    closeButton.style.cursor = 'pointer';
    closeButton.style.width = '30px';
    closeButton.style.height = '30px';
    closeButton.style.borderRadius = '50%';
    closeButton.style.display = 'flex';
    closeButton.style.justifyContent = 'center';
    closeButton.style.alignItems = 'center';
    closeButton.style.lineHeight = '1';
    closeButton.style.marginRight = '15px';
    
    closeButton.addEventListener('mouseover', () => {
        closeButton.style.background = '#2e4bbe';
    });
    closeButton.addEventListener('mouseout', () => {
        closeButton.style.background = '#4361ee';
    });
    
    closeButton.addEventListener('click', () => {
        // Appliquer tous les paramètres avant de fermer
        applyAllSettings();
        
        // Afficher le feedback
        // showFeedback('Paramètres appliqués avec succès!', 'success');
        showFeedback(translateSettings('settingsApplied'), 'success');

        
        // Fermer la modale après un court délai pour voir le feedback
        setTimeout(() => {
            const modalElement = document.getElementById('enhanced-settings-modal');
            if (modalElement) {
                document.body.removeChild(modalElement);
            }
        }, 1000);
    });
    
    // Assembler l'en-tête
    header.appendChild(titleContainer);
    header.appendChild(closeButton);
    content.appendChild(header);
    
    return content;
}

function createTargetAncestorControls() {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '15px';
    
    // Section pour l'ID de l'ancêtre cible
    // const targetSection = createControlSection('ID de l\'Ancêtre Cible');
    const targetSection = createControlSection(translateSettings('targetAncestorId'));

    
    const targetIdWrapper = document.createElement('div');
    targetIdWrapper.style.display = 'flex';
    targetIdWrapper.style.gap = '10px';
    
    const targetIdInput = document.createElement('input');
    targetIdInput.type = 'text';
    targetIdInput.id = 'targetAncestorId';
    targetIdInput.value = localStorage.getItem('targetAncestorId') || '@I741@';
    // targetIdInput.placeholder = 'Entrez l\'ID de l\'ancêtre';
    targetIdInput.placeholder = translateSettings('enterAncestorId');
    targetIdInput.style.flexGrow = '1';
    targetIdInput.style.padding = '8px 12px';
    targetIdInput.style.border = '1px solid #ccc';
    targetIdInput.style.borderRadius = '4px';
    targetIdInput.style.fontSize = '14px';
    
    const saveButton = document.createElement('button');
    // saveButton.textContent = 'Enregistrer';
    saveButton.textContent = translateSettings('save');
    saveButton.style.padding = '8px 15px';
    saveButton.style.backgroundColor = '#4CAF50';
    saveButton.style.color = 'white';
    saveButton.style.border = 'none';
    saveButton.style.borderRadius = '4px';
    saveButton.style.cursor = 'pointer';
    saveButton.style.fontWeight = 'bold';
    
    saveButton.addEventListener('click', () => {
        const targetId = targetIdInput.value.trim();
        
        if (targetId) {
            localStorage.setItem('targetAncestorId', targetId);
            
            // Utiliser la fonction de mise à jour
            setTargetAncestorId(targetId);
            // showFeedback('ID de l\'ancêtre enregistré avec succès !', 'success');
            showFeedback(translateSettings('ancestorIdSaved'), 'success');
        } else {
            // showFeedback('Veuillez entrer un ID valide', 'error');
            showFeedback(translateSettings('enterValidId'), 'error');
        }
    });
    
    targetIdWrapper.appendChild(targetIdInput);
    targetIdWrapper.appendChild(saveButton);
    
    targetSection.appendChild(targetIdWrapper);
    
    // Section pour le nombre de prénoms
    // const prenomsSection = createControlSection('Nombre de Prénoms');
    const prenomsSection = createControlSection(translateSettings('firstNameCount'));

    
    const prenomsSelector = document.createElement('select');
    prenomsSelector.id = 'prenoms';
    prenomsSelector.style.width = '100%';
    prenomsSelector.style.padding = '8px 12px';
    prenomsSelector.style.border = '1px solid #ccc';
    prenomsSelector.style.borderRadius = '4px';
    prenomsSelector.style.fontSize = '14px';
    
    for (let i = 1; i <= 4; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        if (i === parseInt(localStorage.getItem('nombre_prenoms') || 2)) {
            option.selected = true;
        }
        prenomsSelector.appendChild(option);
    }
    
    prenomsSelector.addEventListener('change', () => {
        updatePrenoms(prenomsSelector.value);
        // showFeedback('Nombre de prénoms mis à jour', 'success');
        showFeedback(translateSettings('firstNameCountUpdated'), 'success');
    });
    
    prenomsSection.appendChild(prenomsSelector);
    
    container.appendChild(targetSection);
    container.appendChild(prenomsSection);
    
    return container;
}

function showFeedback(message, type = 'info') {
    // Supprimer tout message existant
    const existingFeedback = document.querySelector('.settings-feedback');
    if (existingFeedback) {
        existingFeedback.remove();
    }
    
    const feedback = document.createElement('div');
    feedback.className = 'settings-feedback';
    feedback.textContent = message;
    feedback.style.position = 'fixed';
    feedback.style.bottom = '20px';
    feedback.style.left = '50%';
    feedback.style.transform = 'translateX(-50%)';
    feedback.style.padding = '10px 20px';
    feedback.style.borderRadius = '4px';
    feedback.style.fontSize = '14px';
    feedback.style.fontWeight = 'bold';
    feedback.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    feedback.style.zIndex = '1100';
    
    if (type === 'success') {
        feedback.style.backgroundColor = '#4CAF50';
        feedback.style.color = 'white';
    } else if (type === 'error') {
        feedback.style.backgroundColor = '#F44336';
        feedback.style.color = 'white';
    } else {
        feedback.style.backgroundColor = '#2196F3';
        feedback.style.color = 'white';
    }
    
    document.body.appendChild(feedback);
    
    // Disparaître après 3 secondes
    setTimeout(() => {
        feedback.style.opacity = '0';
        feedback.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            if (document.body.contains(feedback)) {
                document.body.removeChild(feedback);
            }
        }, 500);
    }, 3000);
}

// Fonction pour appliquer tous les paramètres à la fois
function applyAllSettings() {
    // Appliquer d'abord le fond d'écran
    applyBackground(backgroundSettings.type);
    
    // Puis appliquer les autres propriétés une fois que le fond est chargé
    setTimeout(() => {
        updateBackgroundProperty('opacity', backgroundSettings.opacity);
        updateBackgroundProperty('patternVisibility', backgroundSettings.patternVisibility);
        updateBackgroundProperty('color', backgroundSettings.customColor);
        updateBackgroundProperty('animation', backgroundSettings.animation);
        updateBackgroundProperty('animationSpeed', backgroundSettings.animationSpeed);
    }, 200);
}

// Fonction plus robuste pour mettre à jour les propriétés du fond
function updateBackgroundProperty(property, value) {
    // Obtenir le conteneur de fond d'écran actuel
    const container = document.querySelector('.background-container');
    if (!container) return;
    
    // Mettre à jour la propriété spécifique
    switch (property) {
        case 'opacity':
            // Trouver tous les éléments de fond
            const elements = container.querySelectorAll('*');
            elements.forEach(el => {
                // Ne pas modifier l'opacité du conteneur lui-même
                if (el !== container) {
                    el.style.opacity = value;
                }
            });
            break;
            
        case 'patternVisibility':
            // Ajuster l'échelle ou la densité des motifs
            const svgElements = container.querySelectorAll('svg *');
            svgElements.forEach(el => {
                if (el.tagName === 'circle' || el.tagName === 'rect' || el.tagName === 'path') {
                    // Ajuster la taille des formes
                    const currentScale = el.getAttribute('transform') || '';
                    if (!currentScale.includes('scale')) {
                        el.setAttribute('transform', currentScale + ` scale(${value})`);
                    } else {
                        el.setAttribute('transform', currentScale.replace(/scale\([^)]+\)/, `scale(${value})`));
                    }
                }
            });
            break;
            
        case 'color':
            // Modifier la couleur principale des éléments
            const colorElements = container.querySelectorAll('svg *[fill], svg *[stroke]');
            colorElements.forEach(el => {
                // Ne modifier que les éléments ayant une couleur (pas transparent)
                if (el.getAttribute('fill') && el.getAttribute('fill') !== 'none') {
                    el.setAttribute('fill', value);
                }
                if (el.getAttribute('stroke') && el.getAttribute('stroke') !== 'none') {
                    el.setAttribute('stroke', value);
                }
            });
            break;
            
        case 'animation':
            // Activer ou désactiver l'animation
            if (value) {
                container.classList.add('animated-background');
            } else {
                container.classList.remove('animated-background');
            }
            break;
            
        case 'animationSpeed':
            // Modifier la vitesse d'animation
            container.style.animationDuration = `${5 / value}s`;
            break;
    }
}

// Fonction pour créer le contenu de l'onglet géolocalisation
function createGeolocationControls() {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '15px';
    
    // Message d'information
    const infoText = document.createElement('p');
    // infoText.textContent = "La fonctionnalité de géolocalisation utilise l'interface existante.";
    infoText.textContent = translateSettings('geolocInfo');
    infoText.style.margin = '10px 0';
    
    // Bouton pour ouvrir la modale de géolocalisation existante
    const openGeoModalButton = document.createElement('button');
    // openGeoModalButton.textContent = 'Ouvrir l\'interface de géolocalisation';
    openGeoModalButton.textContent = translateSettings('openGeolocInterface');

    openGeoModalButton.style.padding = '12px 20px';
    openGeoModalButton.style.backgroundColor = '#4361ee';
    openGeoModalButton.style.color = 'white';
    openGeoModalButton.style.border = 'none';
    openGeoModalButton.style.borderRadius = '4px';
    openGeoModalButton.style.cursor = 'pointer';
    openGeoModalButton.style.fontSize = '14px';
    openGeoModalButton.style.fontWeight = 'bold';
    openGeoModalButton.style.margin = '10px 0';
    
    // Gestionnaire d'événements pour ouvrir l'ancienne modale
    openGeoModalButton.addEventListener('click', () => {
        // Fermer la nouvelle modale
        const enhancedModal = document.getElementById('enhanced-settings-modal');
        if (enhancedModal) {
            document.body.removeChild(enhancedModal);
        }
        
        // Ouvrir l'ancienne modale
        const oldModal = document.getElementById('settings-modal');
        if (oldModal) {
            oldModal.style.display = 'block';
            
            // Faire défiler jusqu'à la section de géolocalisation
            const geoSection = document.querySelector('.settings-section:nth-child(3)');
            if (geoSection) {
                geoSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
    
    container.appendChild(infoText);
    container.appendChild(openGeoModalButton);
    
    return container;
}

/**
 * Fonction améliorée pour appliquer le fond d'écran sélectionné
 * @param {string} backgroundType - Type de fond à appliquer
 */
function applyBackground(backgroundType) {
    // Stocker le dernier fond utilisé
    const previousBackground = localStorage.getItem('lastAppliedBackground');
    
    
    // Feedback immédiat
    if (window.showToast) {
        // window.showToast(`Application du fond: ${backgroundType}`, 2000);
        window.showToast(`${translateSettings('applyingBackground')} ${backgroundType}`, 2000);

    }
    
    // Importer le module de gestion de fond d'écran
    // D'abord nettoyer l'ancien conteneur de fond s'il existe
    const container = document.querySelector('.background-container');
    if (container) {
        container.remove();
    }
    

    try {
        // Créer un nouveau conteneur de fond
        initBackgroundContainer();
        
        // Récupérer le SVG principal
        const svg = d3.select("#tree-svg");
        if (!svg.node()) {
            throw new Error("SVG principal non trouvé");
        }
        

        // Si on arrive ici, c'est que tout s'est bien passé
        localStorage.setItem('lastAppliedBackground', backgroundType);

        setupElegantBackground(svg);                 
        
    } catch (error) {
        console.error(`Erreur lors de l'application du fond ${backgroundType}:`, error);
        
        // Feedback d'erreur
        if (window.showToast) {
            window.showToast(`Erreur: ${error.message}`, 3000);
        }
        
        // Tenter de restaurer le fond précédent
        if (previousBackground && previousBackground !== backgroundType) {
            console.log(`Tentative de restauration du fond précédent: ${previousBackground}`);
            
            // Déjà supprimé le conteneur précédent, donc il faut en créer un nouveau
            setTimeout(() => {
                try {
                    initBackgroundContainer();
                    applyBackground(previousBackground);
                } catch (e) {
                    console.error("Erreur lors de la restauration du fond précédent:", e);
                }
            }, 500);
        }
    }

}

// Configuration des événements pour la modale
function setupModalEvents(modal) {
    // Événement pour la touche Échap
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
    
    // Clic en dehors de la modale pour fermer
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
            document.removeEventListener('keydown', handleEscape);
        }
    });
}

function createControlSection(title, isInline = false) {
    const section = document.createElement('div');
    section.className = 'control-section';
    section.style.marginBottom = '2px';
    section.style.backgroundColor = 'white';
    section.style.padding = '3px 6px';
    section.style.borderRadius = '6px';
    section.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
    
    if (isInline) {
        // Configuration pour affichage en ligne
        section.style.display = 'flex';
        section.style.alignItems = 'center';
        section.style.justifyContent = 'space-between';
    }
    
    const sectionTitle = document.createElement('h3');
    sectionTitle.textContent = title;
    sectionTitle.style.fontSize = '12px';
    sectionTitle.style.margin = '0';
    sectionTitle.style.color = '#333';
    sectionTitle.style.backgroundColor = 'white';
    
    if (isInline) {
        sectionTitle.style.width = '90px'; // Largeur fixe pour l'alignement
        sectionTitle.style.flexShrink = '0';
    }
    
    section.appendChild(sectionTitle);
    
    return section;
}

function createBackgroundControls() {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '0px';
    
    // Type de fond (en ligne)
    // const typeSection = createControlSection('Type de fond', true);
    const typeSection = createControlSection(translateSettings('backgroundType'), true);

    
    const typeSelector = createTypeSelect({
        type: backgroundSettings.type
    });



    // Conteneur pour le type de fond et le bouton d'image
    const typeAndImageContainer = document.createElement('div');
    typeAndImageContainer.style.display = 'flex';
    typeAndImageContainer.style.alignItems = 'center';
    typeAndImageContainer.style.justifyContent = 'space-between';
    typeAndImageContainer.style.width = '100%';

    // Modifier directement le style du conteneur du sélecteur
    typeSelector.style.flexGrow = '1';
    typeSelector.style.marginRight = '10px';

    // Bouton pour image personnalisée
    const customImageButton = document.createElement('button');
    customImageButton.id = 'custom-image-button';
    // customImageButton.textContent = 'Sélectionner une image...';
    customImageButton.textContent = translateSettings('selectImage');
    customImageButton.style.padding = '4px 8px';
    customImageButton.style.backgroundColor = '#4361ee';
    customImageButton.style.color = 'white';
    customImageButton.style.border = 'none';
    customImageButton.style.borderRadius = '4px';
    customImageButton.style.cursor = 'pointer';
    customImageButton.style.fontSize = '11px';
    customImageButton.style.display = backgroundSettings.type === 'customImage' ? 'block' : 'none';

    // Même gestionnaire d'événements que précédemment
    customImageButton.addEventListener('click', () => {
        createImageSelectorDialog((imagePath) => {
            console.log("DEBUG BEFORE Configuration du fond avec une image personnalisée:", imagePath);

            localStorage.setItem('customImagePath', imagePath);
            localStorage.setItem('preferredBackground', 'customImage');
            applyBackground('customImage');
        });

    });

    // Ajouter le sélecteur et le bouton au conteneur
    typeAndImageContainer.appendChild(typeSelector);
    typeAndImageContainer.appendChild(customImageButton);

    typeSection.appendChild(typeAndImageContainer);




    
    // Opacité (en ligne avec slider plus petit)
    // const opacitySection = createControlSection('Opacité', true);
    const opacitySection = createControlSection(translateSettings('opacity'), true);

    const opacitySlider = createSlider(backgroundSettings.opacity, 0, 1, 0.05, true);
    
    opacitySection.appendChild(opacitySlider);
    
    opacitySlider.querySelector('input[type="range"]').addEventListener('input', (event) => {
        const newOpacity = parseFloat(event.target.value);
        backgroundSettings.opacity = newOpacity;
        localStorage.setItem('backgroundOpacity', newOpacity.toString());
        updateBackgroundProperty('opacity', newOpacity);
        applyBackground(backgroundSettings.type);
    });
    
    // Détail des motifs (en ligne avec slider plus petit)
    // const patternSection = createControlSection('Détail motifs', true);
    const patternSection = createControlSection(translateSettings('patternDetail'), true);

    const patternSlider = createSlider(backgroundSettings.patternVisibility, 0, 2, 0.1, true);
    patternSection.appendChild(patternSlider);
    
    patternSlider.querySelector('input[type="range"]').addEventListener('input', (event) => {
        const newPattern = parseFloat(event.target.value);
        backgroundSettings.patternVisibility = newPattern;
        localStorage.setItem('patternVisibility', newPattern.toString());
        updateBackgroundProperty('patternVisibility', newPattern);
        applyBackground(backgroundSettings.type);
    });
    
    // Section pour activer/désactiver l'animation (en ligne)
    // const animationSection = createControlSection('Animation', true);
    const animationSection = createControlSection(translateSettings('animation'), true);

    
    // Créer un conteneur pour la case à cocher et son libellé
    const toggleContainer = document.createElement('div');
    toggleContainer.style.display = 'flex';
    toggleContainer.style.alignItems = 'center';
    toggleContainer.style.gap = '6px';
    toggleContainer.style.flex = '1'; // Prendre tout l'espace disponible
    toggleContainer.style.marginLeft = '0'; // S'assurer qu'il n'y a pas de marge à gauche

    // Créer la case à cocher
    const animationCheckbox = document.createElement('input');
    animationCheckbox.type = 'checkbox';
    animationCheckbox.id = 'animation-checkbox';
    animationCheckbox.checked = backgroundSettings.animation;
    animationCheckbox.style.cursor = 'pointer';
    animationCheckbox.style.width = '14px';
    animationCheckbox.style.height = '14px';
    
    animationCheckbox.addEventListener('change', () => {
        backgroundSettings.animation = animationCheckbox.checked;
        localStorage.setItem('backgroundAnimation', backgroundSettings.animation.toString());
        updateBackgroundProperty('animation', backgroundSettings.animation);
        
        // Activer/désactiver le slider de vitesse
        const speedSliderInput = document.querySelector('#speed-slider input[type="range"]');
        if (speedSliderInput) {
            speedSliderInput.disabled = !backgroundSettings.animation;
        }
        
        // Appliquer immédiatement le changement
        applyBackground(backgroundSettings.type);
    });
    
    toggleContainer.appendChild(animationCheckbox);
    animationSection.appendChild(toggleContainer);
    
    // Section pour la vitesse d'animation (en ligne)
    // const speedSection = createControlSection('Vitesse', true);
    const speedSection = createControlSection(translateSettings('speed'), true);

    const speedSlider = createSlider(backgroundSettings.animationSpeed, 0.1, 2, 0.1, true);
    speedSlider.id = 'speed-slider';
    
    const speedSliderInput = speedSlider.querySelector('input[type="range"]');
    speedSliderInput.disabled = !backgroundSettings.animation;
    
    speedSliderInput.addEventListener('input', (event) => {
        const newSpeed = parseFloat(event.target.value);
        backgroundSettings.animationSpeed = newSpeed;
        localStorage.setItem('animationSpeed', newSpeed.toString());
        updateBackgroundProperty('animationSpeed', newSpeed);
        applyBackground(backgroundSettings.type);
    });
    
    speedSection.appendChild(speedSlider);
    
    // Création de la section couleur plus compacte
    const colorSection = document.createElement('div');
    colorSection.className = 'control-section';
    colorSection.style.marginBottom = '2px';
    colorSection.style.backgroundColor = 'white';
    colorSection.style.padding = '3px 6px';
    colorSection.style.borderRadius = '6px';
    colorSection.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
    colorSection.style.display = 'flex';
    colorSection.style.alignItems = 'center';

    // Label plus court "Couleur"
    const colorTitle = document.createElement('h3');
    // colorTitle.textContent = 'Couleur';
    colorTitle.textContent = translateSettings('color');
    colorTitle.style.fontSize = '12px';
    colorTitle.style.margin = '0';
    colorTitle.style.marginRight = '5px'; // Réduit l'espace après le titre (de 10px à 5px)
    colorTitle.style.color = '#333';
    colorTitle.style.backgroundColor = 'white';
    colorTitle.style.width = '60px'; // Réduction de la largeur (de 110px à 60px)
    colorTitle.style.flexShrink = '0';

    colorSection.appendChild(colorTitle);

    // Modification du conteneur de colorPicker (style plus compact)
    const colorPickerContainer = document.createElement('div');
    colorPickerContainer.style.display = 'flex';
    colorPickerContainer.style.alignItems = 'center';
    colorPickerContainer.style.gap = '5px'; 
    colorPickerContainer.style.flex = '1';
    colorPickerContainer.style.marginLeft = '-20px';
    
    // Fonction pour convertir hex en HSV
    function hexToHSV(hex) {
        // Convertir hex en RGB
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const d = max - min;
        
        let h, s, v;
        
        if (d === 0) h = 0;
        else if (max === r) h = (((g - b) / d) % 6) * 60;
        else if (max === g) h = (((b - r) / d) + 2) * 60;
        else if (max === b) h = (((r - g) / d) + 4) * 60;
        
        if (h < 0) h += 360;
        
        s = max === 0 ? 0 : d / max;
        v = max;
        
        return { h, s, v };
    }
    
    // Fonction pour convertir HSV en hex
    function hsvToHex(h, s, v) {
        // H : 0-360, S : 0-1, V : 0-1
        s = s / 100;
        v = v / 100;
        
        let r, g, b;
        const i = Math.floor(h / 60) % 6;
        const f = h / 60 - Math.floor(h / 60);
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);
        
        switch (i) {
            case 0: r = v; g = t; b = p; break;
            case 1: r = q; g = v; b = p; break;
            case 2: r = p; g = v; b = t; break;
            case 3: r = p; g = q; b = v; break;
            case 4: r = t; g = p; b = v; break;
            case 5: r = v; g = p; b = q; break;
        }
        
        r = Math.round(r * 255).toString(16).padStart(2, '0');
        g = Math.round(g * 255).toString(16).padStart(2, '0');
        b = Math.round(b * 255).toString(16).padStart(2, '0');
        
        return `#${r}${g}${b}`;
    }
    
    // Obtenir les valeurs HSV de la couleur actuelle
    const currentHSV = hexToHSV(backgroundSettings.customColor);
    
    // Créer un conteneur pour les curseurs HSV
    const hsvControlsContainer = document.createElement('div');
    hsvControlsContainer.style.display = 'flex';
    hsvControlsContainer.style.flexDirection = 'column';
    hsvControlsContainer.style.gap = '4px'; // Réduit l'espacement entre les curseurs
    hsvControlsContainer.style.marginTop = '5px'; // Réduit la marge supérieure
    hsvControlsContainer.style.paddingLeft = "0";  // Supprime le padding gauche par défaut
    hsvControlsContainer.style.width = "100%";     // Utilise toute la largeur disponible
    hsvControlsContainer.style.marginLeft = "12px";     // Utilise toute la largeur disponible


    // Curseur pour la teinte (H)
    const hueContainer = document.createElement('div');
    hueContainer.style.display = 'flex';
    hueContainer.style.alignItems = 'center';
    hueContainer.style.gap = '5px'; // Réduit l'espacement

    
    const hueLabel = document.createElement('label');
    // hueLabel.textContent = 'Teinte:'; // Abréger le libellé
    hueLabel.textContent = translateSettings('hue');
    hueLabel.style.width = '70px'; // Réduire la largeur
    hueLabel.style.fontSize = '12px'; // Plus petit
    hueLabel.style.width = "65px";       // Réduit légèrement la largeur du label

    
    const hueSlider = document.createElement('input');
    hueSlider.type = 'range';
    hueSlider.min = '0';
    hueSlider.max = '360';
    hueSlider.step = '1';
    hueSlider.value = Math.round(currentHSV.h); // Initialiser avec la valeur HSV actuelle
    hueSlider.style.flexGrow = '1';
    hueSlider.style.height = '5px'; // Plus fin
    hueSlider.style.marginLeft = '-25px'; 
    
    const hueValue = document.createElement('span');
    hueValue.textContent = Math.round(currentHSV.h);
    hueValue.style.minWidth = '25px'; // Plus étroit
    hueValue.style.textAlign = 'right';
    hueValue.style.fontSize = '10px'; // Plus petit
    
    hueContainer.appendChild(hueLabel);
    hueContainer.appendChild(hueSlider);
    hueContainer.appendChild(hueValue);
    hsvControlsContainer.appendChild(hueContainer);
    
    // Curseur pour la saturation (S)
    const satContainer = document.createElement('div');
    satContainer.style.display = 'flex';
    satContainer.style.alignItems = 'center';
    satContainer.style.gap = '5px'; // Réduit l'espacement
    
    const satLabel = document.createElement('label');
    // satLabel.textContent = 'Satur.:'; // Abréger le libellé
    satLabel.textContent = translateSettings('saturation');
    satLabel.style.width = '70px'; // Réduire la largeur
    satLabel.style.fontSize = '12px'; // Plus petit
    
    const satSlider = document.createElement('input');
    satSlider.type = 'range';
    satSlider.min = '0';
    satSlider.max = '100';
    satSlider.step = '1';
    satSlider.value = Math.round(currentHSV.s * 100); // Initialiser avec la valeur HSV actuelle
    satSlider.style.flexGrow = '1';
    satSlider.style.height = '5px'; // Plus fin
    satSlider.style.marginLeft = '-29px'; // Plus fin

    const satValue = document.createElement('span');
    satValue.textContent = Math.round(currentHSV.s * 100);
    satValue.style.minWidth = '25px'; // Plus étroit
    satValue.style.textAlign = 'right';
    satValue.style.fontSize = '10px'; // Plus petit
    
    satContainer.appendChild(satLabel);
    satContainer.appendChild(satSlider);
    satContainer.appendChild(satValue);
    hsvControlsContainer.appendChild(satContainer);
    
    // Curseur pour la valeur/luminosité (V)
    const valContainer = document.createElement('div');
    valContainer.style.display = 'flex';
    valContainer.style.alignItems = 'center';
    valContainer.style.gap = '5px'; // Réduit l'espacement
    
    const valLabel = document.createElement('label');
    // valLabel.textContent = 'Lumin.:'; // Abréger le libellé
    valLabel.textContent = translateSettings('brightness');
    valLabel.style.width = '70px'; // Réduire la largeur
    valLabel.style.fontSize = '12px'; // Plus petit
    
    const valSlider = document.createElement('input');
    valSlider.type = 'range';
    valSlider.min = '0';
    valSlider.max = '100';
    valSlider.step = '1';
    valSlider.value = Math.round(currentHSV.v * 100); // Initialiser avec la valeur HSV actuelle
    valSlider.style.flexGrow = '1';
    valSlider.style.height = '5px'; // Plus fin
    valSlider.style.marginLeft = '-29px'; // Plus fin
    
    const valValue = document.createElement('span');
    valValue.textContent = Math.round(currentHSV.v * 100);
    valValue.style.minWidth = '25px'; // Plus étroit
    valValue.style.textAlign = 'right';
    valValue.style.fontSize = '10px'; // Plus petit


    if (window.innerWidth < 400) {
        hueSlider.style.flexGrow = '0';
        satSlider.style.flexGrow = '0';
        valSlider.style.flexGrow = '0';
        hueSlider.style.width = '55%'; 
        satSlider.style.width = '55%'; 
        valSlider.style.width = '55%'; 
    }




    
    valContainer.appendChild(valLabel);
    valContainer.appendChild(valSlider);
    valContainer.appendChild(valValue);
    hsvControlsContainer.appendChild(valContainer);
    
    // Sélecteur de couleur standard
    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.value = backgroundSettings.customColor;
    colorPicker.style.width = '30px'; // Plus petit
    colorPicker.style.height = '30px'; // Plus petit
    colorPicker.style.border = 'none';
    colorPicker.style.borderRadius = '4px';
    colorPicker.style.cursor = 'pointer';
    colorPicker.style.backgroundColor = 'transparent';
    
    // Fonction pour mettre à jour la couleur à partir des curseurs HSV
    function updateColorFromHSV() {
        const h = parseInt(hueSlider.value);
        const s = parseInt(satSlider.value);
        const v = parseInt(valSlider.value);
        
        // Mettre à jour les valeurs d'affichage
        hueValue.textContent = h;
        satValue.textContent = s;
        valValue.textContent = v;
        
        const hexColor = hsvToHex(h, s, v);
        colorPicker.value = hexColor;
        colorCode.textContent = hexColor.toUpperCase();
        
        // Mettre à jour les paramètres
        backgroundSettings.customColor = hexColor;
        localStorage.setItem('backgroundCustomColor', hexColor);
        updateBackgroundProperty('color', hexColor);
        applyBackground(backgroundSettings.type);
    }
    
    // Ajouter les écouteurs d'événements aux curseurs HSV
    hueSlider.addEventListener('input', updateColorFromHSV);
    satSlider.addEventListener('input', updateColorFromHSV);
    valSlider.addEventListener('input', updateColorFromHSV);
    
    // Mettre à jour les curseurs HSV quand le sélecteur de couleur change
    colorPicker.addEventListener('input', () => {
        const newColor = colorPicker.value;
        const newHSV = hexToHSV(newColor);
        
        // Mettre à jour les curseurs HSV
        hueSlider.value = Math.round(newHSV.h);
        satSlider.value = Math.round(newHSV.s * 100);
        valSlider.value = Math.round(newHSV.v * 100);
        
        // Mettre à jour les valeurs d'affichage
        hueValue.textContent = Math.round(newHSV.h);
        satValue.textContent = Math.round(newHSV.s * 100);
        valValue.textContent = Math.round(newHSV.v * 100);
        
        // Mettre à jour les paramètres
        backgroundSettings.customColor = newColor;
        localStorage.setItem('backgroundCustomColor', newColor);
        colorCode.textContent = newColor.toUpperCase();
        updateBackgroundProperty('color', newColor);
        applyBackground(backgroundSettings.type);
    });
    
    const colorCode = document.createElement('span');
    colorCode.textContent = backgroundSettings.customColor.toUpperCase();
    colorCode.style.fontSize = '12px'; // Plus petit
    colorCode.style.fontFamily = 'monospace';
    
    colorPickerContainer.appendChild(colorPicker);
    colorPickerContainer.appendChild(colorCode);
    
    // Ajouter les éléments au conteneur principal
    colorSection.appendChild(colorPickerContainer);
    colorSection.appendChild(hsvControlsContainer);



    // Ajouter les sections au conteneur principal dans le bon ordre
    container.appendChild(typeSection);
    container.appendChild(opacitySection);
    container.appendChild(patternSection);
    container.appendChild(animationSection);
    container.appendChild(speedSection);
    container.appendChild(colorSection);
    
    return container;
}

function createSlider(value, min, max, step, isCompact = false) {
    const sliderContainer = document.createElement('div');
    sliderContainer.style.display = 'flex';
    sliderContainer.style.alignItems = 'center';
    sliderContainer.style.gap = '5px'; // Même gap que les sliders HSV
    sliderContainer.style.flex = '1';
    
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = min;
    slider.max = max;
    slider.step = step;
    
    // Gestion de la valeur
    let numericValue = parseFloat(value);
    if (isNaN(numericValue) || numericValue < min) {
        numericValue = min;
    } else if (numericValue > max) {
        numericValue = max;
    }
    
    slider.value = numericValue;
    
    // Appliquer le même style que les sliders HSV
    slider.style.flexGrow = '1';
    slider.style.height = '5px'; // 5px comme les sliders HSV
    
    const valueDisplay = document.createElement('span');
    valueDisplay.textContent = numericValue.toFixed(2);
    valueDisplay.style.minWidth = '25px'; // Même largeur que HSV
    valueDisplay.style.textAlign = 'right'; // Aligné à droite comme HSV
    valueDisplay.style.fontSize = '10px'; // Même taille de police que HSV
    
    slider.addEventListener('input', (event) => {
        valueDisplay.textContent = parseFloat(event.target.value).toFixed(2);
    });
    
    sliderContainer.appendChild(slider);
    sliderContainer.appendChild(valueDisplay);
    
    return sliderContainer;
}

function createTabContainer() {
    const tabContainer = document.createElement('div');
    tabContainer.className = 'tabs-container';
    tabContainer.style.display = 'flex';
    tabContainer.style.flexDirection = 'column';
    tabContainer.style.gap = '0px';
    tabContainer.style.marginTop = '-10px';
    
    // Onglets - Supprimer l'onglet Animation
    const tabHeaders = document.createElement('div');
    tabHeaders.className = 'tab-headers';
    tabHeaders.style.display = 'flex';
    tabHeaders.style.borderBottom = '1px solid #ddd';
    tabHeaders.style.backgroundColor = 'white';
    tabHeaders.style.borderTopLeftRadius = '10px';
    tabHeaders.style.borderTopRightRadius = '10px';  
    
    // const tabs = [
    //     { id: 'background-tab', label: 'Fond d\'écran', active: true },
    //     // Animation retiré
    //     { id: 'target-ancestor-tab', label: 'Divers', active: false },
    //     { id: 'geolocation-tab', label: 'Géoloc', active: false }
    // ];
    const tabs = [
    { id: 'background-tab', label: translateSettings('backgroundTab'), active: true },
    { id: 'export-tab', label: translateSettings('exportTab'), active: false },
    { id: 'target-ancestor-tab', label: translateSettings('diversTab'), active: false },
    { id: 'geolocation-tab', label: translateSettings('geolocTab'), active: false }
];
    
    // Conserver le même code pour la création des onglets
    tabs.forEach(tab => {
        const tabHeader = document.createElement('div');
        tabHeader.className = 'tab-header';
        tabHeader.id = `${tab.id}-header`;
        tabHeader.textContent = tab.label;
        tabHeader.style.padding = '8px 15px';
        tabHeader.style.cursor = 'pointer';
        tabHeader.style.borderBottom = tab.active ? '2px solid #4361ee' : '2px solid transparent';
        tabHeader.style.color = tab.active ? '#4361ee' : '#666';
        tabHeader.style.fontWeight = tab.active ? 'bold' : 'normal';
        
        tabHeader.style.backgroundColor = tab.active ? '#f0f4ff' : 'white';
        
        // Conserver le gestionnaire d'événements
        tabHeader.addEventListener('click', () => {
            // Désactiver tous les onglets
            document.querySelectorAll('.tab-header').forEach(header => {
                header.style.borderBottom = '2px solid transparent';
                header.style.color = '#666';
                header.style.fontWeight = 'normal';
                header.style.backgroundColor = 'white';
            });
            
            // Activer l'onglet cliqué
            tabHeader.style.borderBottom = '2px solid #4361ee';
            tabHeader.style.color = '#4361ee';
            tabHeader.style.fontWeight = 'bold';
            tabHeader.style.backgroundColor = '#f0f4ff';
            
            document.querySelectorAll('.tab-content').forEach(content => {
                content.style.display = 'none';
            });
            
            document.getElementById(tab.id).style.display = 'block';
        });
        
        tabHeaders.appendChild(tabHeader);
    });
    
    tabContainer.appendChild(tabHeaders);
    
    // Contenu des onglets
    const tabContents = document.createElement('div');
    tabContents.className = 'tab-contents';
    tabContents.style.padding = '0px 0';
    
    // Onglet Fond d'écran
    const backgroundTab = document.createElement('div');
    backgroundTab.id = 'background-tab';
    backgroundTab.className = 'tab-content';
    backgroundTab.style.display = tabs[0].active ? 'block' : 'none';
    
    // Onglet Export
    const exportTab = document.createElement('div');
    exportTab.id = 'export-tab';
    exportTab.className = 'tab-content';
    exportTab.style.display = tabs[3].active ? 'block' : 'none';

    // Onglet Ancêtre Cible
    const targetAncestorTab = document.createElement('div');
    targetAncestorTab.id = 'target-ancestor-tab';
    targetAncestorTab.className = 'tab-content';
    targetAncestorTab.style.display = tabs[1].active ? 'block' : 'none';
    
    // Onglet Géolocalisation
    const geolocationTab = document.createElement('div');
    geolocationTab.id = 'geolocation-tab';
    geolocationTab.className = 'tab-content';
    geolocationTab.style.display = tabs[2].active ? 'block' : 'none';
    
    tabContents.appendChild(backgroundTab);
    tabContents.appendChild(exportTab);
    tabContents.appendChild(targetAncestorTab);
    tabContents.appendChild(geolocationTab);
    
    tabContainer.appendChild(tabContents);
    
    // Retourner les onglets sans l'onglet Animation
    return { 
        tabContainer, 
        backgroundTab,
        exportTab, 
        targetAncestorTab, 
        geolocationTab 
    };
}

function initializeControls(modalContent) {
    // Créer le conteneur d'onglets
    const { tabContainer, backgroundTab, exportTab, targetAncestorTab, geolocationTab } = createTabContainer();
    
    // Ajouter les contrôles à chaque onglet
    backgroundTab.appendChild(createBackgroundControls());
    exportTab.appendChild(createExportControls());
    targetAncestorTab.appendChild(createTargetAncestorControls());
    geolocationTab.appendChild(createGeolocationControls());
    
    // Ajouter le conteneur d'onglets au contenu de la modal
    modalContent.appendChild(tabContainer);
}





// 5. Ajouter la fonction createExportControls() :
function createExportControls() {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '15px';
    
    // Message d'information
    const infoText = document.createElement('p');
    infoText.textContent = translateSettings('exportInfo');
    infoText.style.margin = '10px 0';
    
    // Bouton pour ouvrir l'interface d'export
    const openExportButton = document.createElement('button');
    openExportButton.textContent = translateSettings('openExportInterface');
    openExportButton.style.padding = '12px 20px';
    openExportButton.style.backgroundColor = '#4361ee';
    openExportButton.style.color = 'white';
    openExportButton.style.border = 'none';
    openExportButton.style.borderRadius = '4px';
    openExportButton.style.cursor = 'pointer';
    openExportButton.style.fontSize = '14px';
    openExportButton.style.fontWeight = 'bold';
    openExportButton.style.margin = '10px 0';
    
    // Gestionnaire d'événements pour ouvrir l'interface d'export
    openExportButton.addEventListener('click', () => {
        initializeAllFanControls();
        // Fermer la modal de settings
        const enhancedModal = document.getElementById('enhanced-settings-modal');
        if (enhancedModal) {
            document.body.removeChild(enhancedModal);
        }
    });
    
    container.appendChild(infoText);
    container.appendChild(openExportButton);
    
    return container;
}
