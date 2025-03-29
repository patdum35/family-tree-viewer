// Nouvelle implémentation de la modal des paramètres
import { setupElegantBackground, 
         setupTreeBranchesBackground, 
         setupFallingLeavesBackground, 
         setupGrowingTreeBackground,
         setupSimpleBackground,
         setupParchmentBackgroundFixed,
         setupGridBackgroundFixed,
         setupPaperTextureBackground,
         setupCurvedLinesBackground,
         setupTreeRingsBackground,
         setupFractalBackground,
         setupOrganicPatternBackground,
         setupArtDecoBackground,
         setupPollockBackground,
         setupKandinskyBackground,
         setupMiroBackground,
         setupBubblesBackground,
         setupPoppingBubblesBackground,
         setupCustomImageBackground } from './backgroundManager.js';
import { createCustomSelector, createOptionsFromLists } from './UIutils.js';
import { nameCloudState } from './nameCloud.js';


// État des paramètres de fond d'écran avec vérification stricte des valeurs
const backgroundSettings = {
    type: localStorage.getItem('preferredBackground') || 'growingTree',
    opacity: getNumericValue('backgroundOpacity', 0.5),
    patternVisibility: getNumericValue('patternVisibility', 1.0),
    animation: localStorage.getItem('backgroundAnimation') === 'true' || false,
    animationSpeed: getNumericValue('animationSpeed', 0.3),
    customColor: localStorage.getItem('backgroundCustomColor') || '#F5F0E6'
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
    modal.style.width = '100%';
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
    const typeOptions = ['Aucun', 'Image', 'Branches', 'Feuilles', 'Arbre', 'Parchemin', 'Grille', 'Papier', 'Fractales', 'Pollock', 'Kandinsky', 'Miró', 'Mondrian', 'Anneaux', 'Art Déco', 'Organique', 'Courbes', 'Simple', 'Bubbles', 'Popping Bubbles'];
    const typeOptionsExpanded = ['Aucun fond', 'Image personnalisée', 'Branches d\'arbre', 'Feuilles tombantes', 'Arbre qui pousse', 'Parchemin', 'Grille', 'Texture papier', 'Motif fractal', 'Pollock', 'Kandinsky', 'Miró', 'Mondrian', 'Anneaux d\'arbre', 'Art Déco', 'Motif organique', 'Lignes courbes', 'Dégradé simple', 'Bubbles', 'Popping the Bubbles'];
    const typeValues = ['none', 'customImage', 'treeBranches', 'fallingLeaves', 'growingTree', 'parchment', 'grid', 'paperTexture', 'fractal', 'pollock', 'kandinsky', 'miro', 'mondrian','treeRings', 'artDeco', 'organicPattern', 'curvedLines', 'simpleBackground', 'bubbles', 'poppingBubbles' ];
    
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
    return createCustomSelector({
        options: options,
        selectedValue: config.type,
        colors: colors,
        isMobile: nameCloudState.mobilePhone,
        dimensions: {
            width: '120px', // Plus compact
            height: '25px',  // Plus compact
            dropdownWidth: '170px',
            dropdownMaxHeight: '345px'
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

function createTabContainer() {
    const tabContainer = document.createElement('div');
    tabContainer.className = 'tabs-container';
    tabContainer.style.display = 'flex';
    tabContainer.style.flexDirection = 'column';
    tabContainer.style.gap = '15px';
    
    // Onglets
    const tabHeaders = document.createElement('div');
    tabHeaders.className = 'tab-headers';
    tabHeaders.style.display = 'flex';
    tabHeaders.style.borderBottom = '1px solid #ddd';
    tabHeaders.style.backgroundColor = 'white'; // Fond opaque
    tabHeaders.style.borderTopLeftRadius = '10px';
    tabHeaders.style.borderTopRightRadius = '10px';  
    
    const tabs = [
        { id: 'background-tab', label: 'Fond d\'écran', active: true },
        { id: 'animation-tab', label: 'Animation', active: false },
        { id: 'target-ancestor-tab', label: 'Ancêtre Cible', active: false },
        { id: 'geolocation-tab', label: 'Géolocalisation', active: false } // Nouvel onglet
    ];
    
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
        
        tabHeader.style.backgroundColor = tab.active ? '#f0f4ff' : 'white'; // Fond opaque

        
        tabHeader.addEventListener('click', () => {
            // Désactiver tous les onglets
            document.querySelectorAll('.tab-header').forEach(header => {
                header.style.borderBottom = '2px solid transparent';
                header.style.color = '#666';
                header.style.fontWeight = 'normal';
                header.style.backgroundColor = 'white'; // Réinitialiser à blanc
            });
            
            // Activer l'onglet cliqué
            tabHeader.style.borderBottom = '2px solid #4361ee';
            tabHeader.style.color = '#4361ee';
            tabHeader.style.fontWeight = 'bold';
            tabHeader.style.backgroundColor = '#f0f4ff'; // Bleu très pâle pour l'onglet actif
            document.getElementById(tab.id).style.display = 'block';
            document.querySelectorAll('.tab-content').forEach(content => {
                content.style.display = 'none';
            });
            
            // Activer l'onglet cliqué
            tabHeader.style.borderBottom = '2px solid #4361ee';
            tabHeader.style.color = '#4361ee';
            tabHeader.style.fontWeight = 'bold';
            document.getElementById(tab.id).style.display = 'block';
        });
        
        tabHeaders.appendChild(tabHeader);
    });
    
    tabContainer.appendChild(tabHeaders);
    
    // Contenu des onglets
    const tabContents = document.createElement('div');
    tabContents.className = 'tab-contents';
    tabContents.style.padding = '10px 0';
    
    // Onglet Fond d'écran
    const backgroundTab = document.createElement('div');
    backgroundTab.id = 'background-tab';
    backgroundTab.className = 'tab-content';
    backgroundTab.style.display = tabs[0].active ? 'block' : 'none';
    
    // Onglet Animation
    const animationTab = document.createElement('div');
    animationTab.id = 'animation-tab';
    animationTab.className = 'tab-content';
    animationTab.style.display = tabs[1].active ? 'block' : 'none';
    
    // Onglet Ancêtre Cible
    const targetAncestorTab = document.createElement('div');
    targetAncestorTab.id = 'target-ancestor-tab';
    targetAncestorTab.className = 'tab-content';
    targetAncestorTab.style.display = tabs[2].active ? 'block' : 'none';
    
    // Nouvel onglet Géolocalisation
    const geolocationTab = document.createElement('div');
    geolocationTab.id = 'geolocation-tab';
    geolocationTab.className = 'tab-content';
    geolocationTab.style.display = tabs[3].active ? 'block' : 'none';
    
    tabContents.appendChild(backgroundTab);
    tabContents.appendChild(animationTab);
    tabContents.appendChild(targetAncestorTab);
    tabContents.appendChild(geolocationTab);
    
    tabContainer.appendChild(tabContents);
    
    return { tabContainer, backgroundTab, animationTab, targetAncestorTab, geolocationTab };
}

function createAnimationControls() {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '15px';
    
    // Section pour activer/désactiver l'animation
    const animationSection = createControlSection('Animation du fond');
    
    // Créer un conteneur pour la case à cocher et son libellé
    const toggleContainer = document.createElement('div');
    toggleContainer.style.display = 'flex';
    toggleContainer.style.alignItems = 'center';
    toggleContainer.style.gap = '10px';
    toggleContainer.style.backgroundColor = 'white';
    toggleContainer.style.padding = '5px 10px';
    toggleContainer.style.borderRadius = '4px';
    
    // Créer la case à cocher
    const animationCheckbox = document.createElement('input');
    animationCheckbox.type = 'checkbox';
    animationCheckbox.id = 'animation-checkbox';
    animationCheckbox.checked = backgroundSettings.animation;
    animationCheckbox.style.cursor = 'pointer';
    animationCheckbox.style.width = '18px';
    animationCheckbox.style.height = '18px';
    
    // Créer le libellé
    const animationLabel = document.createElement('label');
    animationLabel.htmlFor = 'animation-checkbox';
    animationLabel.textContent = 'Activer l\'animation du fond';
    animationLabel.style.cursor = 'pointer';
    animationLabel.style.fontSize = '14px';
    
    // Ajouter les événements
    animationCheckbox.addEventListener('change', () => {
        backgroundSettings.animation = animationCheckbox.checked;
        localStorage.setItem('backgroundAnimation', backgroundSettings.animation.toString());
        updateBackgroundProperty('animation', backgroundSettings.animation);
        
        // Activer/désactiver le slider de vitesse
        const speedSliderInput = document.querySelector('#animation-tab input[type="range"]');
        if (speedSliderInput) {
            speedSliderInput.disabled = !backgroundSettings.animation;
        }
        
        // Appliquer immédiatement le changement
        applyBackground(backgroundSettings.type);
    });
    
    // Assembler la case à cocher et son libellé
    toggleContainer.appendChild(animationCheckbox);
    toggleContainer.appendChild(animationLabel);
    
    // Ajouter à la section
    animationSection.appendChild(toggleContainer);
    
    // Section pour la vitesse d'animation
    const speedSection = createControlSection('Vitesse d\'animation');
    const speedSlider = createSlider(backgroundSettings.animationSpeed, 0.1, 2, 0.1);
    
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
    
    container.appendChild(animationSection);
    container.appendChild(speedSection);
    
    return container;
}






// function createModalContent() {
//     const content = document.createElement('div');
//     content.className = 'enhanced-modal-content';
//     content.style.backgroundColor = 'rgba(240, 245, 255, 0.85)'; // Semi-transparent
//     content.style.borderRadius = '10px';
//     content.style.padding = '15px'; // Réduire le padding
//     content.style.width = '90%';
//     content.style.maxWidth = '500px';
//     content.style.maxHeight = '70vh'; // Réduire la hauteur maximale
//     content.style.overflow = 'auto';
//     content.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
//     content.style.position = 'relative';
    
//     // Créer l'en-tête de la modal avec style nameCloudUI
//     const header = document.createElement('div');
//     header.className = 'modal-header';
//     header.style.display = 'flex';
//     header.style.justifyContent = 'space-between';
//     header.style.alignItems = 'center';
//     header.style.marginBottom = '10px'; // Réduire la marge
//     header.style.borderBottom = '1px solid #e0e0e0';
//     header.style.paddingBottom = '8px'; // Réduire le padding
//     header.style.backgroundColor = 'white'; // Fond opaque pour la bande titre
//     header.style.padding = '12px';          // Réduire le padding
//     header.style.borderRadius = '10px 10px 0 0'; // Arrondir les coins supérieurs
//     header.style.marginLeft = '-15px';      // Ajuster pour le nouveau padding
//     header.style.marginRight = '-15px';     // Ajuster pour le nouveau padding
//     header.style.marginTop = '-15px';       // Ajuster pour le nouveau padding
//     header.style.width = 'calc(100% + 30px)'; // Ajuster pour le nouveau padding
    
//     const title = document.createElement('h2');
//     title.textContent = 'Paramètres Avancés';
//     title.style.margin = '0';
//     title.style.fontSize = '18px'; // Réduire la taille du titre
//     title.style.color = '#333';
    
//     const closeButton = document.createElement('button');
//     closeButton.innerHTML = '&times;';
//     closeButton.className = 'modal-close-btn';
//     closeButton.style.border = 'none';
//     closeButton.style.background = 'none';
//     closeButton.style.fontSize = '22px'; // Réduire la taille
//     closeButton.style.cursor = 'pointer';
//     closeButton.style.color = '#999';
//     closeButton.style.padding = '0';
//     closeButton.style.lineHeight = '1';
    
//     // Effet de survol
//     closeButton.addEventListener('mouseover', () => {
//         closeButton.style.color = '#333';
//     });
//     closeButton.addEventListener('mouseout', () => {
//         closeButton.style.color = '#999';
//     });
    
//     closeButton.addEventListener('click', () => {
//         document.body.removeChild(document.getElementById('enhanced-settings-modal'));
//     });
    
//     header.appendChild(title);
//     header.appendChild(closeButton);
//     content.appendChild(header);
    
//     return content;
// }

function createModalContent() {
    const content = document.createElement('div');
    content.className = 'enhanced-modal-content';
    content.style.backgroundColor = 'rgba(240, 245, 255, 0.85)';
    content.style.borderRadius = '10px';
    content.style.padding = '15px';
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
    header.style.marginBottom = '10px';
    header.style.borderBottom = '1px solid #e0e0e0';
    header.style.paddingBottom = '8px';
    header.style.backgroundColor = 'white';
    header.style.padding = '12px';
    header.style.borderRadius = '10px 10px 0 0';
    header.style.marginLeft = '-15px';
    header.style.marginRight = '-15px';
    header.style.marginTop = '-15px';
    header.style.width = 'calc(100% + 30px)';
    
    // Créer la partie gauche de l'en-tête (titre)
    const titleContainer = document.createElement('div');
    titleContainer.style.display = 'flex';
    titleContainer.style.alignItems = 'center';
    
    const title = document.createElement('h2');
    title.textContent = 'Paramètres Avancés';
    title.style.margin = '0';
    title.style.fontSize = '18px';
    title.style.color = '#333';
    
    titleContainer.appendChild(title);
    
    // Créer la partie droite de l'en-tête (boutons)
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.alignItems = 'center';
    buttonsContainer.style.gap = '10px';
    
    // Bouton Appliquer
    const applyButton = document.createElement('button');
    applyButton.textContent = 'Appliquer';
    applyButton.style.padding = '4px 10px';
    applyButton.style.backgroundColor = '#4361ee';
    applyButton.style.color = 'white';
    applyButton.style.border = 'none';
    applyButton.style.borderRadius = '4px';
    applyButton.style.cursor = 'pointer';
    applyButton.style.fontSize = '12px';
    applyButton.style.fontWeight = 'bold';
    
    applyButton.addEventListener('click', () => {
        // Appliquer tous les paramètres
        applyAllSettings();
        
        // Afficher le feedback
        showFeedback('Paramètres appliqués avec succès!', 'success');
        
        // Fermer la modale après un court délai pour voir le feedback
        setTimeout(() => {
            const modalElement = document.getElementById('enhanced-settings-modal');
            if (modalElement) {
                document.body.removeChild(modalElement);
            }
        }, 1000);
    });
    
    // Bouton Fermer
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    closeButton.className = 'modal-close-btn';
    closeButton.style.border = 'none';
    closeButton.style.background = 'none';
    closeButton.style.fontSize = '22px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.color = '#999';
    closeButton.style.padding = '0';
    closeButton.style.lineHeight = '1';
    closeButton.style.marginLeft = '8px'; // Espace entre les boutons
    
    closeButton.addEventListener('mouseover', () => {
        closeButton.style.color = '#333';
    });
    closeButton.addEventListener('mouseout', () => {
        closeButton.style.color = '#999';
    });
    
    closeButton.addEventListener('click', () => {
        document.body.removeChild(document.getElementById('enhanced-settings-modal'));
    });
    
    // Ajouter les boutons au conteneur de boutons
    buttonsContainer.appendChild(applyButton);
    buttonsContainer.appendChild(closeButton);
    
    // Assembler l'en-tête
    header.appendChild(titleContainer);
    header.appendChild(buttonsContainer);
    content.appendChild(header);
    
    return content;
}


function createControlSection(title) {
    const section = document.createElement('div');
    section.className = 'control-section';
    section.style.marginBottom = '8px'; // Réduire la marge inférieure
    section.style.backgroundColor = 'white'; // Fond opaque
    section.style.padding = '5px 8px'; // Réduire le padding
    section.style.borderRadius = '6px';
    section.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'; // Ombre plus légère
    
    const sectionTitle = document.createElement('h3');
    sectionTitle.textContent = title;
    sectionTitle.style.fontSize = '14px'; // Titre plus petit
    sectionTitle.style.margin = '2px 0 4px 0'; // Réduire les marges
    sectionTitle.style.color = '#333';
    sectionTitle.style.backgroundColor = 'white'; // Fond opaque
    
    section.appendChild(sectionTitle);
    
    return section;
}

function createBackgroundControls() {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '8px'; // Réduit l'espacement vertical
    
    // Sélecteur de type de fond
    const typeSection = createControlSection('Type de fond');
    
    // Utiliser createTypeSelect au lieu du code précédent
    const typeSelector = createTypeSelect({
        type: backgroundSettings.type
    });
    
    typeSection.appendChild(typeSelector);
    
    // Bouton pour sélectionner une image personnalisée (caché par défaut)
    const customImageButton = document.createElement('button');
    customImageButton.id = 'custom-image-button';
    customImageButton.textContent = 'Sélectionner une image...';
    customImageButton.style.marginTop = '5px'; // Réduire la marge
    customImageButton.style.padding = '6px 10px'; // Réduire le padding
    customImageButton.style.backgroundColor = '#4361ee';
    customImageButton.style.color = 'white';
    customImageButton.style.border = 'none';
    customImageButton.style.borderRadius = '4px';
    customImageButton.style.cursor = 'pointer';
    customImageButton.style.fontSize = '12px'; // Réduire la taille du texte
    customImageButton.style.display = backgroundSettings.type === 'customImage' ? 'block' : 'none';
    
    customImageButton.addEventListener('click', () => {
        import('./mainUI.js').then(module => {
            if (typeof module.createImageSelectorDialog === 'function') {
                module.createImageSelectorDialog((imagePath) => {
                    localStorage.setItem('customImagePath', imagePath);
                    localStorage.setItem('preferredBackground', 'customImage');
                    applyBackground('customImage');
                });
            } else {
                console.error("Fonction createImageSelectorDialog non disponible");
                alert("Erreur: Sélecteur d'image non disponible");
            }
        }).catch(error => {
            console.error("Erreur lors du chargement du module mainUI:", error);
        });
    });
    
    typeSection.appendChild(customImageButton);
    
    // Section pour l'opacité
    const opacitySection = createControlSection('Opacité');
    const opacitySlider = createSlider(backgroundSettings.opacity, 0, 1, 0.05);
    
    opacitySlider.querySelector('input[type="range"]').addEventListener('input', (event) => {
        const newOpacity = parseFloat(event.target.value);
        backgroundSettings.opacity = newOpacity;
        localStorage.setItem('backgroundOpacity', newOpacity.toString());
        updateBackgroundProperty('opacity', newOpacity);
        applyBackground(backgroundSettings.type);
    });
    
    opacitySection.appendChild(opacitySlider);
    
    // Section pour la visibilité des motifs
    const patternSection = createControlSection('Détail des motifs');
    const patternSlider = createSlider(backgroundSettings.patternVisibility, 0, 2, 0.1);
    
    patternSlider.querySelector('input[type="range"]').addEventListener('input', (event) => {
        const newPattern = parseFloat(event.target.value);
        backgroundSettings.patternVisibility = newPattern;
        localStorage.setItem('patternVisibility', newPattern.toString());
        updateBackgroundProperty('patternVisibility', newPattern);
        applyBackground(backgroundSettings.type);
    });
    
    patternSection.appendChild(patternSlider);
    
    // Section pour la couleur personnalisée
    const colorSection = createControlSection('Couleur personnalisée');
    
    const colorPickerContainer = document.createElement('div');
    colorPickerContainer.style.display = 'flex';
    colorPickerContainer.style.alignItems = 'center';
    colorPickerContainer.style.gap = '10px'; // Réduire l'espacement
    
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
    
    // Curseur pour la teinte (H)
    const hueContainer = document.createElement('div');
    hueContainer.style.display = 'flex';
    hueContainer.style.alignItems = 'center';
    hueContainer.style.gap = '5px'; // Réduit l'espacement
    
    const hueLabel = document.createElement('label');
    hueLabel.textContent = 'Teinte:'; // Abréger le libellé
    hueLabel.style.width = '70px'; // Réduire la largeur
    hueLabel.style.fontSize = '12px'; // Plus petit
    
    const hueSlider = document.createElement('input');
    hueSlider.type = 'range';
    hueSlider.min = '0';
    hueSlider.max = '360';
    hueSlider.step = '1';
    hueSlider.value = Math.round(currentHSV.h); // Initialiser avec la valeur HSV actuelle
    hueSlider.style.flexGrow = '1';
    hueSlider.style.height = '5px'; // Plus fin
    
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
    satLabel.textContent = 'Saturation:'; // Abréger le libellé
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
    valLabel.textContent = 'Luminosité:'; // Abréger le libellé
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
    
    const valValue = document.createElement('span');
    valValue.textContent = Math.round(currentHSV.v * 100);
    valValue.style.minWidth = '25px'; // Plus étroit
    valValue.style.textAlign = 'right';
    valValue.style.fontSize = '10px'; // Plus petit
    
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
    
    container.appendChild(typeSection);
    container.appendChild(opacitySection);
    container.appendChild(patternSection);
    container.appendChild(colorSection);
    
    return container;
}

function createSlider(value, min, max, step) {
    const sliderContainer = document.createElement('div');
    sliderContainer.style.display = 'flex';
    sliderContainer.style.alignItems = 'center';
    sliderContainer.style.gap = '10px'; // Réduit l'espacement
    sliderContainer.style.backgroundColor = 'white'; 
    sliderContainer.style.padding = '3px 5px'; // Réduit le padding
    sliderContainer.style.borderRadius = '4px';
    
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = min;
    slider.max = max;
    slider.step = step;
    
    // Gestion de la valeur pour s'assurer qu'elle est valide et dans la plage
    let numericValue = parseFloat(value);
    if (isNaN(numericValue) || numericValue < min) {
        numericValue = min;
    } else if (numericValue > max) {
        numericValue = max;
    }
    
    // Appliquer la valeur au slider
    slider.value = numericValue;
    
    slider.style.flexGrow = '1';
    slider.style.height = '5px'; // Plus fin
    slider.style.WebkitAppearance = 'none';
    slider.style.appearance = 'none';
    slider.style.background = '#e0e0e0';
    slider.style.outline = 'none';
    slider.style.borderRadius = '3px';
    
    // Style pour le thumb (définir une seule fois pour éviter les doublons)
    if (!document.getElementById('slider-thumb-style')) {
        const thumbStyle = `
            input[type=range]::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 14px; /* Plus petit */
                height: 14px; /* Plus petit */
                border-radius: 50%;
                background: #4361ee;
                cursor: pointer;
                border: none;
            }
            input[type=range]::-moz-range-thumb {
                width: 14px; /* Plus petit */
                height: 14px; /* Plus petit */
                border-radius: 50%;
                background: #4361ee;
                cursor: pointer;
                border: none;
            }
        `;
        
        const style = document.createElement('style');
        style.id = 'slider-thumb-style';
        style.textContent = thumbStyle;
        document.head.appendChild(style);
    }
    
    const valueDisplay = document.createElement('span');
    valueDisplay.textContent = numericValue.toFixed(2);
    valueDisplay.style.minWidth = '30px'; // Plus étroit
    valueDisplay.style.textAlign = 'center';
    valueDisplay.style.fontSize = '11px'; // Plus petit
    valueDisplay.style.fontWeight = 'normal'; // Moins accentué
    valueDisplay.style.color = '#666';
    
    slider.addEventListener('input', (event) => {
        valueDisplay.textContent = parseFloat(event.target.value).toFixed(2);
    });
    
    sliderContainer.appendChild(slider);
    sliderContainer.appendChild(valueDisplay);
    
    return sliderContainer;
}

// function initializeControls(modalContent) {
//     // Créer le pied de page avec le bouton Appliquer en premier
//     const footer = document.createElement('div');
//     footer.className = 'modal-footer';
//     footer.style.display = 'flex';
//     footer.style.justifyContent = 'flex-end';
//     footer.style.paddingTop = '5px';
//     footer.style.paddingBottom = '5px';
//     footer.style.position = 'sticky'; // Rendre le bouton sticky
//     footer.style.bottom = '0'; // Position en bas
//     footer.style.backgroundColor = 'rgba(240, 245, 255, 0.95)'; // Semi-transparent
//     footer.style.zIndex = '10'; // S'assurer qu'il reste au-dessus
//     footer.style.borderTop = '1px solid #e0e0e0';
    
//     // Seul bouton: Appliquer
//     const applyButton = document.createElement('button');
//     applyButton.textContent = 'Appliquer';
//     applyButton.style.padding = '5px 12px'; // Plus petit
//     applyButton.style.backgroundColor = '#4361ee';
//     applyButton.style.color = 'white';
//     applyButton.style.border = 'none';
//     applyButton.style.borderRadius = '4px';
//     applyButton.style.cursor = 'pointer';
//     applyButton.style.fontSize = '12px'; // Plus petit
//     applyButton.style.fontWeight = 'bold';
    
//     applyButton.addEventListener('click', () => {
//         // Appliquer tous les paramètres
//         applyAllSettings();
        
//         // Afficher le feedback
//         showFeedback('Paramètres appliqués avec succès!', 'success');
        
//         // Fermer la modale après un court délai pour voir le feedback
//         setTimeout(() => {
//             const modalElement = document.getElementById('enhanced-settings-modal');
//             if (modalElement) {
//                 document.body.removeChild(modalElement);
//             }
//         }, 1000); // Délai de 1 seconde pour voir le message de succès
//     });
    
//     footer.appendChild(applyButton);
    
//     // Créer le conteneur d'onglets
//     const { tabContainer, backgroundTab, animationTab, targetAncestorTab, geolocationTab } = createTabContainer();
    
//     // Ajouter les contrôles à chaque onglet
//     backgroundTab.appendChild(createBackgroundControls());
//     animationTab.appendChild(createAnimationControls());
//     targetAncestorTab.appendChild(createTargetAncestorControls());
//     geolocationTab.appendChild(createGeolocationControls());
    
//     // Ajouter le conteneur d'onglets au contenu de la modal
//     modalContent.appendChild(tabContainer);
    
//     // Ajouter le footer après le contenu
//     modalContent.appendChild(footer);
// }

function initializeControls(modalContent) {
    // Créer le conteneur d'onglets
    const { tabContainer, backgroundTab, animationTab, targetAncestorTab, geolocationTab } = createTabContainer();
    
    // Ajouter les contrôles à chaque onglet
    backgroundTab.appendChild(createBackgroundControls());
    animationTab.appendChild(createAnimationControls());
    targetAncestorTab.appendChild(createTargetAncestorControls());
    geolocationTab.appendChild(createGeolocationControls());
    
    // Ajouter le conteneur d'onglets au contenu de la modal
    modalContent.appendChild(tabContainer);
    
    // Le footer avec le bouton Appliquer a été déplacé dans l'en-tête, donc nous ne l'ajoutons plus ici
}





function createTargetAncestorControls() {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '15px';
    
    // Section pour l'ID de l'ancêtre cible
    const targetSection = createControlSection('ID de l\'Ancêtre Cible');
    
    const targetIdWrapper = document.createElement('div');
    targetIdWrapper.style.display = 'flex';
    targetIdWrapper.style.gap = '10px';
    
    const targetIdInput = document.createElement('input');
    targetIdInput.type = 'text';
    targetIdInput.id = 'targetAncestorId';
    targetIdInput.value = localStorage.getItem('targetAncestorId') || '@I741@';
    targetIdInput.placeholder = 'Entrez l\'ID de l\'ancêtre';
    targetIdInput.style.flexGrow = '1';
    targetIdInput.style.padding = '8px 12px';
    targetIdInput.style.border = '1px solid #ccc';
    targetIdInput.style.borderRadius = '4px';
    targetIdInput.style.fontSize = '14px';
    
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Enregistrer';
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
            import('./treeAnimation.js').then(module => {
                module.setTargetAncestorId(targetId);
                showFeedback('ID de l\'ancêtre enregistré avec succès !', 'success');
            });
        } else {
            showFeedback('Veuillez entrer un ID valide', 'error');
        }
    });
    
    targetIdWrapper.appendChild(targetIdInput);
    targetIdWrapper.appendChild(saveButton);
    
    targetSection.appendChild(targetIdWrapper);
    
    // Section pour le nombre de prénoms
    const prenomsSection = createControlSection('Nombre de Prénoms');
    
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
        import('./main.js').then(module => {
            if (typeof module.updatePrenoms === 'function') {
                module.updatePrenoms(prenomsSelector.value);
                showFeedback('Nombre de prénoms mis à jour', 'success');
            }
        });
    });
    
    prenomsSection.appendChild(prenomsSelector);
    
    container.appendChild(targetSection);
    container.appendChild(prenomsSection);
    
    return container;
}

function createToggleSwitch(isChecked) {
    const toggleContainer = document.createElement('label');
    toggleContainer.className = 'toggle-switch';
    toggleContainer.style.position = 'relative';
    toggleContainer.style.display = 'inline-block';
    toggleContainer.style.width = '60px';
    toggleContainer.style.height = '34px';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = isChecked;
    checkbox.style.opacity = '0';
    checkbox.style.width = '0';
    checkbox.style.height = '0';
    
    const slider = document.createElement('span');
    slider.className = 'slider round';
    slider.style.position = 'absolute';
    slider.style.cursor = 'pointer';
    slider.style.top = '0';
    slider.style.left = '0';
    slider.style.right = '0';
    slider.style.bottom = '0';
    slider.style.backgroundColor = isChecked ? '#4361ee' : '#ccc';
    slider.style.transition = '.4s';
    slider.style.borderRadius = '34px';
    
    // Créer l'indicateur (le "thumb")
    slider.innerHTML = '<span style="position: absolute; height: 26px; width: 26px; left: ' + (isChecked ? '30px' : '4px') + '; bottom: 4px; background-color: white; border-radius: 50%; transition: .4s;"></span>';
    
    checkbox.addEventListener('change', () => {
        const thumb = slider.querySelector('span');
        slider.style.backgroundColor = checkbox.checked ? '#4361ee' : '#ccc';
        thumb.style.left = checkbox.checked ? '30px' : '4px';
    });
    
    toggleContainer.appendChild(checkbox);
    toggleContainer.appendChild(slider);
    
    return checkbox;
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
    infoText.textContent = "La fonctionnalité de géolocalisation utilise l'interface existante.";
    infoText.style.margin = '10px 0';
    
    // Bouton pour ouvrir la modale de géolocalisation existante
    const openGeoModalButton = document.createElement('button');
    openGeoModalButton.textContent = 'Ouvrir l\'interface de géolocalisation';
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
        window.showToast(`Application du fond: ${backgroundType}`, 1000);
    }
    
    // Importer le module de gestion de fond d'écran
    import('./backgroundManager.js').then(module => {
        // D'abord nettoyer l'ancien conteneur de fond s'il existe
        const container = document.querySelector('.background-container');
        if (container) {
            container.remove();
        }
        
        // Si on a sélectionné "aucun", ne rien faire de plus
        if (backgroundType === 'none') {
            // Sauvegarder pour pouvoir restaurer en cas d'erreur
            localStorage.setItem('lastAppliedBackground', backgroundType);
            return;
        }
        
        try {
            // Créer un nouveau conteneur de fond
            module.initBackgroundContainer();
            
            // Récupérer le SVG principal
            const svg = d3.select("#tree-svg");
            if (!svg.node()) {
                throw new Error("SVG principal non trouvé");
            }
            
            // Cas spécial pour l'image personnalisée
            if (backgroundType === 'customImage') {
                const imagePath = localStorage.getItem('customImagePath');
                if (!imagePath) {
                    throw new Error("Aucun chemin d'image défini");
                }
                
                if (typeof module.setupCustomImageBackground === 'function') {
                    module.setupCustomImageBackground(svg, imagePath);
                } else {
                    throw new Error("Fonction setupCustomImageBackground non disponible");
                }
            }
            // Tenter d'appliquer le fond sélectionné
            else if (backgroundType === 'pollock') {
                if (typeof module.setupPollockBackground === 'function') {
                    module.setupPollockBackground(svg);
                } else {
                    throw new Error("Fonction setupPollockBackground non disponible");
                }
            }
            // Suite des conditions pour les autres types de fond...
            else if (backgroundType === 'kandinsky') {
                if (typeof module.setupKandinskyBackground === 'function') {
                    module.setupKandinskyBackground(svg);
                } else {
                    throw new Error("Fonction setupKandinskyBackground non disponible");
                }
            }
            else if (backgroundType === 'miro') {
                if (typeof module.setupMiroBackground === 'function') {
                    module.setupMiroBackground(svg);
                } else {
                    throw new Error("Fonction setupMiroBackground non disponible");
                }
            }
            else if (backgroundType === 'mondrian') {
                if (typeof module.setupMondrianBackground === 'function') {
                    module.setupMondrianBackground(svg);
                } else {
                    throw new Error("Fonction setupMondrianBackground non disponible");
                }
            }
            // Styles de base corrigés
            else if (backgroundType === 'parchment') {
                if (typeof module.setupParchmentBackgroundFixed === 'function') {
                    module.setupParchmentBackgroundFixed(svg);
                } else {
                    throw new Error("Fonction setupParchmentBackgroundFixed non disponible");
                }
            }
            else if (backgroundType === 'grid') {
                if (typeof module.setupGridBackgroundFixed === 'function') {
                    module.setupGridBackgroundFixed(svg);
                } else {
                    throw new Error("Fonction setupGridBackgroundFixed non disponible");
                }
            }
            // Autres styles existants
            else if (backgroundType === 'treeBranches') {
                if (typeof module.setupTreeBranchesBackground === 'function') {
                    module.setupTreeBranchesBackground(svg);
                } else {
                    throw new Error("Fonction setupTreeBranchesBackground non disponible");
                }
            }
            else if (backgroundType === 'fallingLeaves') {
                if (typeof module.setupFallingLeavesBackground === 'function') {
                    module.setupFallingLeavesBackground(svg);
                } else {
                    throw new Error("Fonction setupFallingLeavesBackground non disponible");
                }
            }
            else if (backgroundType === 'growingTree') {
                if (typeof module.setupGrowingTreeBackground === 'function') {
                    module.setupGrowingTreeBackground(svg);
                } else {
                    throw new Error("Fonction setupGrowingTreeBackground non disponible");
                }
            }
            else if (backgroundType === 'simpleBackground') {
                if (typeof module.setupSimpleBackground === 'function') {
                    module.setupSimpleBackground(svg);
                } else {
                    throw new Error("Fonction setupSimpleBackground non disponible");
                }
            }
            else if (backgroundType === 'paperTexture') {
                if (typeof module.setupPaperTextureBackground === 'function') {
                    module.setupPaperTextureBackground(svg);
                } else {
                    throw new Error("Fonction setupPaperTextureBackground non disponible");
                }
            }
            else if (backgroundType === 'curvedLines') {
                if (typeof module.setupCurvedLinesBackground === 'function') {
                    module.setupCurvedLinesBackground(svg);
                } else {
                    throw new Error("Fonction setupCurvedLinesBackground non disponible");
                }
            }
            else if (backgroundType === 'treeRings') {
                if (typeof module.setupTreeRingsBackground === 'function') {
                    module.setupTreeRingsBackground(svg);
                } else {
                    throw new Error("Fonction setupTreeRingsBackground non disponible");
                }
            }
            else if (backgroundType === 'fractal') {
                if (typeof module.setupFractalBackground === 'function') {
                    module.setupFractalBackground(svg);
                } else {
                    throw new Error("Fonction setupFractalBackground non disponible");
                }
            }
            else if (backgroundType === 'organicPattern') {
                if (typeof module.setupOrganicPatternBackground === 'function') {
                    module.setupOrganicPatternBackground(svg);
                } else {
                    throw new Error("Fonction setupOrganicPatternBackground non disponible");
                }
            }
            else if (backgroundType === 'artDeco') {
                if (typeof module.setupArtDecoBackground === 'function') {
                    module.setupArtDecoBackground(svg);
                } else {
                    throw new Error("Fonction setupArtDecoBackground non disponible");
                }
            }
            else if (backgroundType === 'bubbles') {
                if (typeof module.setupBubblesBackground === 'function') {
                    module.setupBubblesBackground(svg);
                } else {
                    throw new Error("Fonction setupBubblesBackground non disponible");
                }
            }
            else if (backgroundType === 'poppingBubbles') {
                if (typeof module.setupPoppingBubblesBackground === 'function') {
                    module.setupPoppingBubblesBackground(svg);
                } else {
                    throw new Error("Fonction setupPoppingBubblesBackground non disponible");
                }
            }
            else {
                throw new Error(`Type de fond inconnu: ${backgroundType}`);
            }
            
            // Si on arrive ici, c'est que tout s'est bien passé
            localStorage.setItem('lastAppliedBackground', backgroundType);
            
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
                        module.initBackgroundContainer();
                        applyBackground(previousBackground);
                    } catch (e) {
                        console.error("Erreur lors de la restauration du fond précédent:", e);
                    }
                }, 500);
            }
        }
    }).catch(error => {
        console.error("Erreur lors du chargement du module backgroundManager:", error);
        
        // Feedback d'erreur
        if (window.showToast) {
            window.showToast(`Erreur: ${error.message}`, 3000);
        }
    });
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
