import { nameCloudState } from './nameCloud.js';
import { createCustomSelector } from './UIutils.js';



// Dictionnaire des traductions pour nameCloudSettings
const settingsTranslations = {
    'fr': {
        'cloudSettings': 'Paramètres du nuage',
        'shape': 'Forme\ndu nuage',
        'animation': 'Animation',
        'minSize': 'Taille\nminimum',
        'maxSize': 'Taille\nmaximum',
        'spacing': 'Espace\nentre mots',
        'font': 'Police',
        'options': 'Options',
        'apply': 'Appliquer',
        'initialRotation': 'Rotation init.',
        'outline': 'Contour',
        'threeZones': '3 zones',
        'none': 'Aucune',
        'rotation': 'Rotation',
        'simple': 'Simple',
        'bounce': 'Rebond',
        'float': 'Flottant',
        'rectangle': 'Rectangle',
        'ellipse': 'Ellipse',
        'heart': 'Coeur',
        'star': 'Étoile',
        'arabesque': 'Arabesque',
        'settingsLoaded': 'Paramètres du nuage de mots chargés depuis localStorage',
        'loadingError': 'Erreur lors du chargement des paramètres:'
    },
    'en': {
        'cloudSettings': 'Cloud Settings',
        'shape': 'Cloud\nShape',
        'animation': 'Animation',
        'minSize': 'Minimum\nSize',
        'maxSize': 'Maximum\nSize',
        'spacing': 'Word\nSpacing',
        'font': 'Font',
        'options': 'Options',
        'apply': 'Apply',
        'initialRotation': 'Initial Rotation',
        'outline': 'Outline',
        'threeZones': '3 Zones',
        'none': 'None',
        'rotation': 'Rotation',
        'simple': 'Simple',
        'bounce': 'Bounce',
        'float': 'Float',
        'rectangle': 'Rectangle',
        'ellipse': 'Ellipse',
        'heart': 'Heart',
        'star': 'Star',
        'arabesque': 'Arabesque',
        'settingsLoaded': 'Word cloud settings loaded from localStorage',
        'loadingError': 'Error loading settings:'
    },
    'es': {
        'cloudSettings': 'Configuración de la nube',
        'shape': 'Forma\nde la nube',
        'animation': 'Animación',
        'minSize': 'Tamaño\nmínimo',
        'maxSize': 'Tamaño\nmáximo',
        'spacing': 'Espaciado\nentre palabras',
        'font': 'Fuente',
        'options': 'Opciones',
        'apply': 'Aplicar',
        'initialRotation': 'Rotación inicial',
        'outline': 'Contorno',
        'threeZones': '3 Zonas',
        'none': 'Ninguna',
        'rotation': 'Rotación',
        'simple': 'Simple',
        'bounce': 'Rebote',
        'float': 'Flotante',
        'rectangle': 'Rectángulo',
        'ellipse': 'Elipse',
        'heart': 'Corazón',
        'star': 'Estrella',
        'arabesque': 'Arabesco',
        'settingsLoaded': 'Configuración de la nube de palabras cargada desde localStorage',
        'loadingError': 'Error al cargar la configuración:'
    },
    'hu': {
        'cloudSettings': 'Felhő beállítások',
        'shape': 'Felhő\nalakja',
        'animation': 'Animáció',
        'minSize': 'Minimum\nméret',
        'maxSize': 'Maximum\nméret',
        'spacing': 'Szavak\ntávolsága',
        'font': 'Betűtípus',
        'options': 'Opciók',
        'apply': 'Alkalmaz',
        'initialRotation': 'Kezdeti forgatás',
        'outline': 'Körvonal',
        'threeZones': '3 zóna',
        'none': 'Nincs',
        'rotation': 'Forgás',
        'simple': 'Egyszerű',
        'bounce': 'Pattogás',
        'float': 'Lebegés',
        'rectangle': 'Téglalap',
        'ellipse': 'Ellipszis',
        'heart': 'Szív',
        'star': 'Csillag',
        'arabesque': 'Arabeszk',
        'settingsLoaded': 'Szófelhő beállítások betöltve a localStorage-ból',
        'loadingError': 'Hiba a beállítások betöltésekor:'
    }
};

// Fonction pour obtenir une traduction en fonction de la langue actuelle
function translateCloudSettings(key) {
    const currentLang = window.CURRENT_LANGUAGE || 'fr';
    return settingsTranslations[currentLang]?.[key] || 
           settingsTranslations['fr'][key] || 
           key;
}

// Au début du fichier nameCloudSettings.js, après les imports
// Fonction pour charger les paramètres depuis localStorage
export function loadSettingsFromLocalStorage() {
    // Essayer de récupérer les paramètres depuis localStorage
    const storedSettings = localStorage.getItem('nameCloudSettings');
    
    if (storedSettings) {
        try {
            const settings = JSON.parse(storedSettings);
            
            // Appliquer les paramètres stockés à nameCloudState
            if (settings.cloudShape) nameCloudState.cloudShape = settings.cloudShape;
            if (settings.minFontSize) nameCloudState.minFontSize = settings.minFontSize;
            if (settings.maxFontSize) nameCloudState.maxFontSize = settings.maxFontSize;
            if (settings.padding !== undefined) nameCloudState.padding = settings.padding;
            if (settings.fontFamily) nameCloudState.fontFamily = settings.fontFamily;
            if (settings.isShapeBorder !== undefined) nameCloudState.isShapeBorder = settings.isShapeBorder;
            if (settings.isThreeZones !== undefined) nameCloudState.isThreeZones = settings.isThreeZones;
            if (settings.wordRotation !== undefined) nameCloudState.wordRotation = settings.wordRotation;
            
            // Configuration de l'animation
            if (settings.animationStyle === 'rotation') {
                nameCloudState.movingRotation = true;
                nameCloudState.wordMovement = 'none';
            } else if (settings.animationStyle && settings.animationStyle !== 'none') {
                nameCloudState.movingRotation = false;
                nameCloudState.wordMovement = settings.animationStyle;
            } else {
                nameCloudState.movingRotation = false;
                nameCloudState.wordMovement = 'none';
            }
            
            // console.log('Paramètres du nuage de mots chargés depuis localStorage');
            console.log(translateCloudSettings('settingsLoaded'));
        } catch (error) {
            // console.error('Erreur lors du chargement des paramètres:', error);
            console.error(translateCloudSettings('loadingError'), error);

        }
    }
}

// Fonction pour créer un sélecteur de forme personnalisé
function createShapeSelect(selectedShape = 'rectangle') {
    // Définir les options et les valeurs correspondantes
    // const options = [
    //     { value: 'rectangle', label: 'Rectangle' },
    //     { value: 'ellipse', label: 'Ellipse' },
    //     { value: 'coeur', label: 'Coeur' },
    //     { value: 'etoile', label: 'Étoile' },
    //     // { value: 'arabesque', label: 'Arabesque' }
    // ];
    const options = [
        { value: 'rectangle', label: translateCloudSettings('rectangle') },
        { value: 'ellipse', label: translateCloudSettings('ellipse') },
        { value: 'coeur', label: translateCloudSettings('heart') },
        { value: 'etoile', label: translateCloudSettings('star') },
        // { value: 'arabesque', label: translateCloudSettings('arabesque') }
    ];
    
    // Couleurs pour le sélecteur personnalisé
    const colors = {
        main: '#4CAF50',    // Vert pour le sélecteur principal
        options: '#4361ee', // Bleu pour les options
        hover: '#4CAF50',   // Vert au survol
        selected: '#1a237e' // Bleu foncé pour l'option sélectionnée
    };
    
    // Utiliser la fonction générique
    return createCustomSelector({
        options: options,
        selectedValue: selectedShape,
        colors: colors,
        isMobile: nameCloudState.mobilePhone,
        dimensions: {
            width: '128px',
            height: '25px'
        }
    });
}

// // Function to create an animation style selector
function createAnimationStyleSelect(selectedValue = 'none') {
    // Définir les styles d'animation et leurs étiquettes correspondantes
    // const options = [
    //     { value: 'none', label: 'Aucune' },
    //     { value: 'rotation', label: 'Rotation' },
    //     { value: 'simple', label: 'Simple' },
    //     { value: 'bounce', label: 'Rebond' },
    //     { value: 'float', label: 'Flottant' }
    // ];
    const options = [
        { value: 'none', label: translateCloudSettings('none') },
        { value: 'rotation', label: translateCloudSettings('rotation') },
        { value: 'simple', label: translateCloudSettings('simple') },
        { value: 'bounce', label: translateCloudSettings('bounce') },
        { value: 'float', label: translateCloudSettings('float') }
    ];
    
    // Couleurs pour le sélecteur personnalisé
    const colors = {
        main: '#2196F3',    // Bleu pour le sélecteur principal
        options: '#4361ee', // Bleu pour les options
        hover: '#1E88E5',   // Bleu plus foncé au survol
        selected: '#1a237e' // Bleu foncé pour l'option sélectionnée
    };
    
    // Utiliser la fonction générique
    return createCustomSelector({
        options: options,
        selectedValue: selectedValue,
        colors: colors,
        isMobile: nameCloudState.mobilePhone,
        dimensions: {
            width: '128px',
            height: '25px'
        }
    });
}

function createFormGroup(label, color) {
    const group = document.createElement('div');
    group.style.display = 'flex';
    group.style.alignItems = 'center';
    group.style.justifyContent = 'space-between';
    group.style.gap = '6px'; // Encore réduit de 8px à 6px
    group.style.marginBottom = '2px'; // Encore réduit de 3px à 2px
    
    const labelElement = document.createElement('div');
    labelElement.classList.add('form-group-label'); // Ajoute une classe
    labelElement.innerHTML = label.replace('\n', '<br>');
    labelElement.style.fontWeight = 'bold';
    labelElement.style.fontSize = '11px';
    labelElement.style.color = 'white';
    labelElement.style.backgroundColor = color || '#8e44ad';
    labelElement.style.padding = '2px 6px'; // Réduit le padding vertical de 4px à 2px
    labelElement.style.borderRadius = '4px';
    labelElement.style.width = '80px';
    labelElement.style.textAlign = 'center';
    labelElement.style.lineHeight = '1';  // Réduit de 1.1 à 1
    
    group.appendChild(labelElement);
    return group;
}

// Fonction utilitaire pour créer un input numérique avec boutons -/+
function createNumberInput(defaultValue, onChange) {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.gap = '4px'; 
    container.style.backgroundColor = 'white';
    container.style.padding = '3px'; 
    container.style.borderRadius = '4px';
    container.style.width = '120px';
    
    // Vérifier si on est sur un petit écran
    const isMobile = nameCloudState.mobilePhone;

    // Bouton - (en bleu)
    const minusButton = document.createElement('button');
    minusButton.textContent = '-';
    minusButton.style.width = '20px'; 
    minusButton.style.height = '20px'; 
    minusButton.style.backgroundColor = '#4361ee'; // Bleu
    minusButton.style.color = 'white';
    minusButton.style.border = 'none';
    minusButton.style.borderRadius = '50%';
    minusButton.style.fontSize = '14px';
    minusButton.style.lineHeight = '1';
    minusButton.style.paddingBottom = '2px';
    minusButton.style.display = 'flex';
    minusButton.style.justifyContent = 'center';
    minusButton.style.alignItems = 'center';
    minusButton.style.cursor = 'pointer';
    
    // Input (réduit en largeur et décalé vers la droite)
    const input = document.createElement('input');
    input.type = 'number';
    input.value = defaultValue;
    input.style.padding = '3px'; 
    input.style.borderRadius = '4px';
    input.style.border = '1px solid #ddd';
    input.style.width = '50px';
    input.style.height = '16px'; 
    input.style.textAlign = 'center';
    input.style.fontSize = '11px'; 
    input.style.marginLeft = '6px';
    // Sur mobile, désactiver l'édition directe
    if (isMobile) {
        // Désactiver les flèches haut/bas du champ numérique
        input.style.appearance = 'textfield';
        input.style.MozAppearance = 'textfield';
        input.style.webkitAppearance = 'textfield';
        
        // Rendre le champ en lecture seule
        input.readOnly = true;
        
        // Optionnel : changer le style pour indiquer qu'il n'est pas éditable
        input.style.backgroundColor = '#f8f8f8';
        
        // Empêcher le focus qui pourrait faire apparaître le clavier sur certains appareils
        input.addEventListener('focus', (e) => {
            e.preventDefault();
            input.blur();
        });
    }


    // Bouton +
    const plusButton = document.createElement('button');
    plusButton.textContent = '+';
    plusButton.style.width = '20px'; 
    plusButton.style.height = '20px'; 
    plusButton.style.backgroundColor = '#4CAF50';
    plusButton.style.color = 'white';
    plusButton.style.border = 'none';
    plusButton.style.borderRadius = '50%';
    plusButton.style.fontSize = '14px';
    plusButton.style.lineHeight = '1';
    plusButton.style.display = 'flex';
    plusButton.style.justifyContent = 'center';
    plusButton.style.alignItems = 'center';
    plusButton.style.cursor = 'pointer';
    
    // Événements
    minusButton.addEventListener('click', () => {
        input.value = Math.max(1, parseInt(input.value) - 1);
        if (typeof onChange === 'function') {
            onChange();
        }
    });
    
    plusButton.addEventListener('click', () => {
        input.value = parseInt(input.value) + 1;
        if (typeof onChange === 'function') {
            onChange();
        }
    });
    
    // Sur version desktop, conserver l'événement de modification
    if (!isMobile) {
        input.addEventListener('change', () => {
            if (typeof onChange === 'function') {
                onChange();
            }
        });
    } else {
        // Sur mobile, supprimer tous les listeners qui pourraient activer l'édition
        input.addEventListener('click', (e) => {
            e.preventDefault();
        });
        input.addEventListener('touchstart', (e) => {
            e.preventDefault();
        });
    }
    
    container.appendChild(minusButton);
    container.appendChild(input);
    container.appendChild(plusButton);
    
    return container;
}

export function createSettingsModal(onSave) {
    // Conteneur principal de la modale (code existant reste inchangé)
    console.log('Creating settings modal...'); // Debugging line
    const modal = document.createElement('div');
    modal.className = 'settings-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '2000';
    
    // Conteneur du contenu - rendu transparent
    const content = document.createElement('div');
    content.style.backgroundColor = 'transparent';
    content.style.borderRadius = '8px';
    content.style.padding = '15px'; // Réduit de 20px à 15px
    content.style.width = '240px'; 
    content.style.maxWidth = '90%';
    // Suppression de maxHeight et overflow pour éviter l'ascenseur vertical
    // content.style.maxHeight = '90vh'; 
    // content.style.overflow = 'auto';
    content.style.position = 'relative';
    
    // Titre avec fond coloré
    const titleContainer = document.createElement('div');
    titleContainer.style.backgroundColor = '#4361ee';
    titleContainer.style.borderRadius = '8px 8px 0 0';
    titleContainer.style.padding = '8px'; // Réduit de 10px à 8px
    titleContainer.style.marginBottom = '10px'; // Réduit de 15px à 10px
    
    const title = document.createElement('h3');
    // title.textContent = 'Paramètres du nuage';
    title.textContent = translateCloudSettings('cloudSettings');
    title.style.margin = '0';
    title.style.color = 'white';
    title.style.textAlign = 'center';
    title.style.fontSize = '16px'; // Ajout pour réduire la taille de la police
    
    titleContainer.appendChild(title);
    



    // Bouton de fermeture
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '15px'; // Modifié pour aligner avec le titre (au lieu de 5px)
    closeButton.style.right = '5px';
    closeButton.style.background = 'white';
    closeButton.style.borderRadius = '50%';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '24px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.color = '#666';
    closeButton.style.width = '25px';
    closeButton.style.height = '25px';
    closeButton.style.display = 'flex';
    closeButton.style.alignItems = 'center';
    closeButton.style.justifyContent = 'center';
    closeButton.style.zIndex = '2001';

    closeButton.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    
    // Création des contrôles pour chaque paramètre
    const paramContainer = document.createElement('div');
    paramContainer.style.display = 'flex';
    paramContainer.style.flexDirection = 'column';
    paramContainer.style.gap = '4px'; // Encore réduit de 6px à 4px
    
    // Récupérer l'état actuel de l'animation
    let currentAnimationStyle = 'none';
    if (nameCloudState.movingRotation) {
        currentAnimationStyle = 'rotation';
    } else if (nameCloudState.wordMovement && nameCloudState.wordMovement !== 'none') {
        currentAnimationStyle = nameCloudState.wordMovement;
    }
    
    // Fonction pour appliquer les changements immédiatement (modifiée)
    // const applyChanges = () => {
    //     // Récupérer les valeurs actuelles
    //     const settings = {
    //         cloudShape: shapeSelect.value,
    //         minFontSize: parseInt(minFontInput.querySelector('input').value),
    //         maxFontSize: parseInt(maxFontInput.querySelector('input').value),
    //         padding: parseFloat(paddingInput.querySelector('input').value),
    //         fontFamily: fontSelect.value,
    //         isShapeBorder: isShapeBorderCheckbox.checked,
    //         isThreeZones: isThreeZonesCheckbox.checked,
    //         wordRotation: wordRotationCheckbox.checked,
    //         // Gérer l'animation
    //         animationStyle: animationStyleSelect.value
    //     };
        
    //     // Mettre à jour les paramètres
    //     nameCloudState.cloudShape = settings.cloudShape;
    //     nameCloudState.minFontSize = settings.minFontSize;
    //     nameCloudState.maxFontSize = settings.maxFontSize;
    //     nameCloudState.padding = settings.padding;
    //     nameCloudState.fontFamily = settings.fontFamily;
    //     nameCloudState.isShapeBorder = settings.isShapeBorder;
    //     nameCloudState.isThreeZones = settings.isThreeZones;
    //     nameCloudState.wordRotation = settings.wordRotation;
        
    //     // Configuration de l'animation basée sur la sélection
    //     nameCloudState.movingRotation = settings.animationStyle === 'rotation';
    //     nameCloudState.wordMovement = (settings.animationStyle !== 'rotation' && settings.animationStyle !== 'none') 
    //         ? settings.animationStyle : 'none';
        
    //     // Appeler la fonction de callback
    //     if (typeof onSave === 'function') {
    //         onSave(settings);
    //     }
    // };
    // Modifier la fonction applyChanges pour sauvegarder dans localStorage
    const applyChanges = () => {
        // Récupérer les valeurs actuelles (code existant inchangé)
        const settings = {
            cloudShape: shapeSelect.value,
            minFontSize: parseInt(minFontInput.querySelector('input').value),
            maxFontSize: parseInt(maxFontInput.querySelector('input').value),
            padding: parseFloat(paddingInput.querySelector('input').value),
            fontFamily: fontSelect.value,
            isShapeBorder: isShapeBorderCheckbox.checked,
            isThreeZones: isThreeZonesCheckbox.checked,
            wordRotation: wordRotationCheckbox.checked,
            animationStyle: animationStyleSelect.value
        };
        
        // Mettre à jour les paramètres (code existant inchangé)
        nameCloudState.cloudShape = settings.cloudShape;
        nameCloudState.minFontSize = settings.minFontSize;
        nameCloudState.maxFontSize = settings.maxFontSize;
        nameCloudState.padding = settings.padding;
        nameCloudState.fontFamily = settings.fontFamily;
        nameCloudState.isShapeBorder = settings.isShapeBorder;
        nameCloudState.isThreeZones = settings.isThreeZones;
        nameCloudState.wordRotation = settings.wordRotation;
        
        // Configuration de l'animation basée sur la sélection
        nameCloudState.movingRotation = settings.animationStyle === 'rotation';
        nameCloudState.wordMovement = (settings.animationStyle !== 'rotation' && settings.animationStyle !== 'none') 
            ? settings.animationStyle : 'none';
        
        // NOUVEAU : Sauvegarder les paramètres dans localStorage
        localStorage.setItem('nameCloudSettings', JSON.stringify(settings));
        
        // Appeler la fonction de callback
        if (typeof onSave === 'function') {
            onSave(settings);
        }
    };

    // 1. Forme du nuage
    // const shapeContainer = createFormGroup('Forme\ndu nuage', '#8e44ad'); // Couleur violette
    const shapeContainer = createFormGroup(translateCloudSettings('shape'), '#8e44ad'); // Couleur violette

    const shapeSelect = createShapeSelect(nameCloudState.cloudShape || 'rectangle');
    shapeSelect.addEventListener('change', applyChanges);
    shapeContainer.appendChild(shapeSelect);
    
    // 2. Animation (DÉPLACÉ JUSTE APRÈS LA FORME) - et avec couleur orange
    // const animationContainer = createFormGroup('Animation', '#f39c12'); // Maintenant en orange
    const animationContainer = createFormGroup(translateCloudSettings('animation'), '#f39c12'); // Maintenant en orange
    const animationLabel = animationContainer.querySelector('.form-group-label');
    animationLabel.style.padding = '1px 6px';
    animationLabel.style.lineHeight = '2';
    
    // Créer le sélecteur d'animation
    const animationStyleSelect = createAnimationStyleSelect(currentAnimationStyle);
    animationStyleSelect.addEventListener('change', applyChanges);
    animationContainer.appendChild(animationStyleSelect);
    
    // 3. Taille de police minimum
    // const minFontContainer = createFormGroup('Taille\nminimum', '#8e44ad'); // Violet
    const minFontContainer = createFormGroup(translateCloudSettings('minSize'), '#8e44ad'); // Violet
    const minFontInput = createNumberInput(nameCloudState.minFontSize, applyChanges);
    minFontContainer.appendChild(minFontInput);
    
    // 4. Taille de police maximum
    // const maxFontContainer = createFormGroup('Taille\nmaximum', '#f39c12'); // Orange
    const maxFontContainer = createFormGroup(translateCloudSettings('maxSize'), '#f39c12'); // Orange
    const maxFontInput = createNumberInput(nameCloudState.maxFontSize, applyChanges);
    maxFontContainer.appendChild(maxFontInput);
    
    // 5. Espace entre les mots
    // const paddingContainer = createFormGroup('Espace\nentre mots', '#8e44ad'); // Violet
    const paddingContainer = createFormGroup(translateCloudSettings('spacing'), '#8e44ad'); // Violet
    const paddingInput = createNumberInput(nameCloudState.padding || 1, applyChanges);
    paddingContainer.appendChild(paddingInput);
    
    // 6. Police de caractères
    // const fontContainer = createFormGroup('Police', '#f39c12'); // Orange
    const fontContainer = createFormGroup(translateCloudSettings('font'), '#f39c12'); // Orange
    const fontLabel = fontContainer.querySelector('.form-group-label');
    fontLabel.style.padding = '1px 6px';
    fontLabel.style.lineHeight = '2'; 
 
    const fontSelect = document.createElement('select');
    fontSelect.style.padding = '2px';
    fontSelect.style.borderRadius = '4px';
    fontSelect.style.border = '1px solid #ddd';
    fontSelect.style.width = '126px';
    fontSelect.style.backgroundColor = 'white';
    fontSelect.style.height = '22px'; // Ajout pour réduire la hauteur
    
    const fonts = [
        'Arial', 'Verdana', 'Georgia', 'Times New Roman', 
        'Courier New', 'Trebuchet MS', 'Impact', 'Comic Sans MS',
        'Helvetica', 'Tahoma', 'Palatino', 'Garamond'
    ];
    
    fonts.forEach(font => {
        const option = document.createElement('option');
        option.value = font;
        option.textContent = font;
        option.style.fontFamily = font;
        fontSelect.appendChild(option);
    });
    
    fontSelect.value = nameCloudState.fontFamily || 'Arial';
    fontSelect.addEventListener('change', applyChanges);
    fontContainer.appendChild(fontSelect);
    
    // 7. Options (cases à cocher)
    // const optionsContainer = createFormGroup('Options', '#8e44ad'); // Violet
    const optionsContainer = createFormGroup(translateCloudSettings('options'), '#8e44ad'); // Violet
    const optionsLabel = optionsContainer.querySelector('.form-group-label');
    optionsLabel.style.padding = '1px 6px';
    optionsLabel.style.lineHeight = '2'; 
    optionsLabel.style.marginTop = '-35px'; 
    
    // Container pour les cases à cocher
    const checkboxesContainer = document.createElement('div');
    checkboxesContainer.style.display = 'flex';
    checkboxesContainer.style.flexDirection = 'column';
    checkboxesContainer.style.gap = '1px';
    checkboxesContainer.style.backgroundColor = 'white';
    checkboxesContainer.style.padding = '3px';
    checkboxesContainer.style.borderRadius = '4px';
    checkboxesContainer.style.width = '120px';
    
    // Case à cocher "Rotation initiale"
    const wordRotationLabel = document.createElement('label');
    wordRotationLabel.style.display = 'flex';
    wordRotationLabel.style.alignItems = 'center';
    wordRotationLabel.style.gap = '5px';
    wordRotationLabel.style.cursor = 'pointer';
    wordRotationLabel.style.fontSize = '12px';
    wordRotationLabel.style.height = '18px';

    const wordRotationCheckbox = document.createElement('input');
    wordRotationCheckbox.type = 'checkbox';
    wordRotationCheckbox.checked = nameCloudState.wordRotation || false;
    wordRotationCheckbox.addEventListener('change', applyChanges);

    wordRotationLabel.appendChild(wordRotationCheckbox);
    // wordRotationLabel.appendChild(document.createTextNode('Rotation init.'));
    wordRotationLabel.appendChild(document.createTextNode(translateCloudSettings('initialRotation')));
    
    // Case à cocher "Contour de la forme"
    const isShapeBorderLabel = document.createElement('label');
    isShapeBorderLabel.style.display = 'flex';
    isShapeBorderLabel.style.alignItems = 'center';
    isShapeBorderLabel.style.gap = '5px';
    isShapeBorderLabel.style.cursor = 'pointer';
    isShapeBorderLabel.style.fontSize = '12px';
    isShapeBorderLabel.style.height = '18px';
    
    const isShapeBorderCheckbox = document.createElement('input');
    isShapeBorderCheckbox.type = 'checkbox';
    isShapeBorderCheckbox.checked = nameCloudState.isShapeBorder || false;
    isShapeBorderCheckbox.addEventListener('change', applyChanges);
    
    isShapeBorderLabel.appendChild(isShapeBorderCheckbox);
    // isShapeBorderLabel.appendChild(document.createTextNode('Contour'));
    isShapeBorderLabel.appendChild(document.createTextNode(translateCloudSettings('outline')));

    
    // Case à cocher "Placement 3 zones"
    const isThreeZonesLabel = document.createElement('label');
    isThreeZonesLabel.style.display = 'flex';
    isThreeZonesLabel.style.alignItems = 'center';
    isThreeZonesLabel.style.gap = '5px';
    isThreeZonesLabel.style.cursor = 'pointer';
    isThreeZonesLabel.style.fontSize = '12px';
    isThreeZonesLabel.style.height = '18px';
    
    const isThreeZonesCheckbox = document.createElement('input');
    isThreeZonesCheckbox.type = 'checkbox';
    isThreeZonesCheckbox.checked = nameCloudState.isThreeZones || false;
    isThreeZonesCheckbox.addEventListener('change', applyChanges);
    
    isThreeZonesLabel.appendChild(isThreeZonesCheckbox);
    // isThreeZonesLabel.appendChild(document.createTextNode('3 zones'));
    isThreeZonesLabel.appendChild(document.createTextNode(translateCloudSettings('threeZones')));

    // Ajouter les cases à cocher au conteneur
    checkboxesContainer.appendChild(wordRotationLabel);
    checkboxesContainer.appendChild(isShapeBorderLabel);
    checkboxesContainer.appendChild(isThreeZonesLabel);
    optionsContainer.appendChild(checkboxesContainer);
    

    // Bouton pour appliquer les paramètres
    const saveButton = document.createElement('button');
    // saveButton.textContent = 'Appliquer';
    saveButton.textContent = translateCloudSettings('apply');
    saveButton.style.padding = '5px 10px';
    saveButton.style.backgroundColor = '#4CAF50';
    saveButton.style.color = 'white';
    saveButton.style.fontWeight = 'bold';
    saveButton.style.border = 'none';
    saveButton.style.borderRadius = '4px';
    saveButton.style.cursor = 'pointer';
    saveButton.style.width = '90px';
    saveButton.style.fontSize = '12px';
    saveButton.style.position = 'absolute'; // Remettre en position absolute
    saveButton.style.bottom = '52px'; // Position fixe par rapport au bas
    saveButton.style.left = '15px'; // Positionné à gauche comme avant

    saveButton.addEventListener('click', () => {
        applyChanges();
        // Fermer la modale quand on appuie sur "Appliquer"
        document.body.removeChild(modal);
    });

    // Modifier le conteneur principal pour assurer un espace suffisant pour le bouton
    paramContainer.style.marginBottom = '35px'; // Augmenter légèrement la marge (était 35px)


    
    // Ajouter tous les contrôles au conteneur dans le bon ordre
    paramContainer.appendChild(shapeContainer);
    paramContainer.appendChild(animationContainer); // Déplacé juste après la forme
    paramContainer.appendChild(minFontContainer);
    paramContainer.appendChild(maxFontContainer);
    paramContainer.appendChild(paddingContainer);
    paramContainer.appendChild(fontContainer);
    paramContainer.appendChild(optionsContainer);
    
    // Ajouter le bouton en dernier
    paramContainer.appendChild(saveButton);
    
    // Assemblage de la modale
    content.appendChild(closeButton);
    content.appendChild(titleContainer);
    content.appendChild(paramContainer);
    modal.appendChild(content);
    
    return modal;
}
