import { nameCloudState } from './nameCloud.js';
import { createCustomSelector } from './UIutils.js';


// Fonction pour créer un sélecteur de forme personnalisé
// function createShapeSelect(selectedShape = 'rectangle') {
//     // Définir les options et les valeurs correspondantes
//     const shapes = [
//         { value: 'rectangle', label: 'Rectangle' },
//         { value: 'ellipse', label: 'Ellipse' },
//         { value: 'coeur', label: 'Coeur' },
//         { value: 'etoile', label: 'Étoile' },
//         { value: 'arabesque', label: 'Arabesque' }
//         // { value: 'A', label: 'A' },
//         // { value: 'M', label: 'M' },
//         // { value: 'puzzle', label: 'Puzzle' },
//         // { value: 'nuage', label: 'Nuage' },
//         // { value: 'arbre', label: 'Arbre' },
//         // { value: 'carte', label: 'Carte' },
//         // { value: 'ampoule', label: 'Ampoule' },
//         // { value: 'cerveau', label: 'Cerveau' },
//         // { value: 'maison', label: 'Maison' },
//         // { value: 'ballon', label: 'Ballon' }
//     ];
    
//     // Trouver l'index de l'option actuellement sélectionnée
//     const currentIndex = shapes.findIndex(shape => shape.value === selectedShape);
//     const currentOption = shapes[currentIndex >= 0 ? currentIndex : 0].label;
    
//     // Couleurs pour le sélecteur personnalisé
//     const colors = {
//         main: '#4CAF50',    // Vert pour le sélecteur principal
//         options: '#4361ee', // Bleu pour les options
//         hover: '#4CAF50',  // Vert au survol
//         selected: '#1a237e' // Bleu foncé pour l'option sélectionnée
//     };
    
//     // Si nous sommes sur mobile, utiliser une version compacte
//     const isMobile = nameCloudState.mobilePhone;
    
//     // Conteneur principal
//     const selectContainer = document.createElement('div');
//     selectContainer.style.position = 'relative';
//     selectContainer.style.width = isMobile ? '128px' : '128px';
//     selectContainer.style.height = '25px';
    
//     // Élément qui simule le select
//     const selectDisplay = document.createElement('div');
//     selectDisplay.style.padding = '4px 8px';
//     selectDisplay.style.border = '1px solid #ddd';
//     selectDisplay.style.borderRadius = '4px';
//     selectDisplay.style.backgroundColor = colors.main;
//     selectDisplay.style.color = 'white';
//     selectDisplay.style.cursor = 'pointer';
//     selectDisplay.style.fontSize = '14px';
//     selectDisplay.style.fontWeight = 'bold';
//     selectDisplay.style.display = 'flex';
//     selectDisplay.style.justifyContent = 'space-between';
//     selectDisplay.style.alignItems = 'center';
//     selectDisplay.style.height = '100%';
//     selectDisplay.style.boxSizing = 'border-box';
//     selectDisplay.style.position = 'relative'; // Position relative pour la flèche
    
//     // Texte affiché
//     const displayText = document.createElement('span');
//     displayText.textContent = currentOption;
//     displayText.style.width = '100%';
//     displayText.style.textAlign = 'left';
    
//     // Ajouter la flèche comme un pseudo-élément
//     const arrowStyle = document.createElement('style');
//     const selectId = `shape-select-${Date.now()}`;
//     selectDisplay.id = selectId;
    
//     arrowStyle.textContent = `
//         #${selectId}::after {
//             content: '';
//             position: absolute;
//             top: 50%;
//             right: 8px;
//             transform: translateY(-50%);
//             width: 0;
//             height: 0;
//             border-left: 5px solid transparent;
//             border-right: 5px solid transparent;
//             border-top: 6px solid white;
//             pointer-events: none;
//         }
//     `;
    
//     document.head.appendChild(arrowStyle);
    
//     // Ajouter le texte au display
//     selectDisplay.appendChild(displayText);
    
//     // Conteneur des options (initialement masqué)
//     const optionsContainer = document.createElement('div');
//     optionsContainer.style.position = 'absolute';
//     optionsContainer.style.top = '100%';
//     optionsContainer.style.left = '0';
//     optionsContainer.style.width = '128px';
//     optionsContainer.style.backgroundColor = '#fff';
//     optionsContainer.style.border = '1px solid #ccc';
//     optionsContainer.style.borderRadius = '4px';
//     optionsContainer.style.marginTop = '2px';
//     optionsContainer.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
//     optionsContainer.style.maxHeight = isMobile ? '200px' : '300px';
//     optionsContainer.style.overflowY = 'auto';
//     optionsContainer.style.zIndex = '1000';
//     optionsContainer.style.display = 'none';
    
//     // Valeur cachée simulant un vrai select
//     const hiddenSelect = document.createElement('select');
//     hiddenSelect.style.display = 'none';
    
//     // Créer les options dans le select caché
//     shapes.forEach(shape => {
//         const option = document.createElement('option');
//         option.value = shape.value;
//         option.text = shape.label;
//         if (shape.value === selectedShape) option.selected = true;
//         hiddenSelect.appendChild(option);
//     });
    
//     // Ajouter les options visuelles
//     shapes.forEach((shape, index) => {
//         const optionElement = document.createElement('div');
//         optionElement.style.padding = '8px 10px';
//         optionElement.style.cursor = 'pointer';
//         optionElement.style.backgroundColor = colors.options;
//         optionElement.style.color = 'white';
//         optionElement.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
//         optionElement.style.fontSize = '14px';
//         optionElement.textContent = shape.label;
        
//         // Effet de survol
//         optionElement.addEventListener('mouseover', () => {
//             optionElement.style.backgroundColor = colors.hover;
//         });
        
//         optionElement.addEventListener('mouseout', () => {
//             optionElement.style.backgroundColor = shape.label === displayText.textContent ? 
//                 colors.selected : colors.options;
//         });
        
//         // Sélection d'une option
//         optionElement.addEventListener('click', () => {
//             // Mise en évidence
//             optionElement.style.backgroundColor = colors.selected;
//             optionElement.style.fontWeight = 'bold';
            
//             // Réinitialiser les autres options
//             Array.from(optionsContainer.children).forEach(opt => {
//                 if (opt !== optionElement) {
//                     opt.style.backgroundColor = colors.options;
//                     opt.style.fontWeight = 'normal';
//                 }
//             });
            
//             // Mettre à jour le texte et la valeur
//             displayText.textContent = shape.label;
//             hiddenSelect.value = shape.value;
            
//             // Fermer la liste après une courte pause
//             setTimeout(() => {
//                 optionsContainer.style.display = 'none';
                
//                 // Déclencher un événement de changement pour simuler un select natif
//                 const event = new Event('change');
//                 hiddenSelect.dispatchEvent(event);
//             }, 150);
//         });
        
//         // Mettre en évidence l'option actuellement sélectionnée
//         if (shape.value === selectedShape) {
//             optionElement.style.backgroundColor = colors.selected;
//             optionElement.style.fontWeight = 'bold';
//         }
        
//         optionsContainer.appendChild(optionElement);
//     });
    
//     // Toggle du dropdown
//     selectDisplay.addEventListener('click', () => {
//         const isVisible = optionsContainer.style.display === 'block';
//         optionsContainer.style.display = isVisible ? 'none' : 'block';
//     });
    
//     // Fermer le dropdown si on clique ailleurs
//     document.addEventListener('click', (event) => {
//         if (!selectContainer.contains(event.target)) {
//             optionsContainer.style.display = 'none';
//         }
//     });
    
//     // Assembler le tout
//     selectContainer.appendChild(selectDisplay);
//     selectContainer.appendChild(optionsContainer);
//     selectContainer.appendChild(hiddenSelect);
    
//     // Exposer les événements du select caché sur le conteneur
//     ['change', 'click'].forEach(eventName => {
//         hiddenSelect.addEventListener(eventName, (event) => {
//             const newEvent = new Event(eventName, { bubbles: true });
//             selectContainer.dispatchEvent(newEvent);
//         });
//     });
    
//     // Méthodes pour simuler le comportement d'un vrai select
//     Object.defineProperty(selectContainer, 'value', {
//         get: function() {
//             return hiddenSelect.value;
//         },
//         set: function(value) {
//             hiddenSelect.value = value;
//             const index = shapes.findIndex(shape => shape.value === value);
//             if (index >= 0) {
//                 displayText.textContent = shapes[index].label;
//             }
//         }
//     });
    
//     // Effet hover sur le select
//     selectContainer.addEventListener('mouseover', () => {
//         selectDisplay.style.backgroundColor = '#3e8e41'; // Vert légèrement plus foncé
//     });
    
//     selectContainer.addEventListener('mouseout', () => {
//         selectDisplay.style.backgroundColor = colors.main;
//     });
    
//     return selectContainer;
// }





// Remplacement de la fonction createShapeSelect
function createShapeSelect(selectedShape = 'rectangle') {
    // Définir les options et les valeurs correspondantes
    const options = [
        { value: 'rectangle', label: 'Rectangle' },
        { value: 'ellipse', label: 'Ellipse' },
        { value: 'coeur', label: 'Coeur' },
        { value: 'etoile', label: 'Étoile' },
        // { value: 'arabesque', label: 'Arabesque' }
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
// function createAnimationStyleSelect(selectedValue = 'none') {
//     // Define the animation styles and their corresponding labels
//     const animationStyles = [
//         { value: 'none', label: 'Aucune' },
//         { value: 'rotation', label: 'Rotation' },
//         { value: 'simple', label: 'Simple' },
//         { value: 'bounce', label: 'Rebond' },
//         { value: 'float', label: 'Flottant' }
//     ];
    
//     // Find the index of the currently selected option
//     const currentIndex = animationStyles.findIndex(style => style.value === selectedValue);
//     const currentOption = animationStyles[currentIndex >= 0 ? currentIndex : 0].label;
    
//     // Colors for the custom selector
//     const colors = {
//         main: '#2196F3',    // Blue for the main selector
//         options: '#4361ee', // Blue for options
//         hover: '#1E88E5',   // Darker blue on hover
//         selected: '#1a237e' // Dark blue for selected option
//     };
    
//     // If we're on mobile, use a compact version
//     const isMobile = nameCloudState.mobilePhone;
    
//     // Main container
//     const selectContainer = document.createElement('div');
//     selectContainer.style.position = 'relative';
//     selectContainer.style.width = isMobile ? '128px' : '128px';
//     selectContainer.style.height = '25px';
    
//     // Element that simulates the select
//     const selectDisplay = document.createElement('div');
//     selectDisplay.style.padding = '4px 8px';
//     selectDisplay.style.border = '1px solid #ddd';
//     selectDisplay.style.borderRadius = '4px';
//     selectDisplay.style.backgroundColor = colors.main;
//     selectDisplay.style.color = 'white';
//     selectDisplay.style.cursor = 'pointer';
//     selectDisplay.style.fontSize = '14px';
//     selectDisplay.style.fontWeight = 'bold';
//     selectDisplay.style.display = 'flex';
//     selectDisplay.style.justifyContent = 'space-between';
//     selectDisplay.style.alignItems = 'center';
//     selectDisplay.style.height = '100%';
//     selectDisplay.style.boxSizing = 'border-box';
//     selectDisplay.style.position = 'relative'; // Relative position for the arrow
    
//     // Displayed text
//     const displayText = document.createElement('span');
//     displayText.textContent = currentOption;
//     displayText.style.width = '100%';
//     displayText.style.textAlign = 'left';
    
//     // Add arrow as a pseudo-element
//     const arrowStyle = document.createElement('style');
//     const selectId = `animation-select-${Date.now()}`;
//     selectDisplay.id = selectId;
    
//     arrowStyle.textContent = `
//         #${selectId}::after {
//             content: '';
//             position: absolute;
//             top: 50%;
//             right: 8px;
//             transform: translateY(-50%);
//             width: 0;
//             height: 0;
//             border-left: 5px solid transparent;
//             border-right: 5px solid transparent;
//             border-top: 6px solid white;
//             pointer-events: none;
//         }
//     `;
    
//     document.head.appendChild(arrowStyle);
    
//     // Add text to display
//     selectDisplay.appendChild(displayText);
    
//     // Options container (initially hidden)
//     const optionsContainer = document.createElement('div');
//     optionsContainer.style.position = 'absolute';
//     optionsContainer.style.top = '100%';
//     optionsContainer.style.left = '0';
//     optionsContainer.style.width = '128px';
//     optionsContainer.style.backgroundColor = '#fff';
//     optionsContainer.style.border = '1px solid #ccc';
//     optionsContainer.style.borderRadius = '4px';
//     optionsContainer.style.marginTop = '2px';
//     optionsContainer.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
//     optionsContainer.style.maxHeight = isMobile ? '200px' : '300px';
//     optionsContainer.style.overflowY = 'auto';
//     optionsContainer.style.zIndex = '1000';
//     optionsContainer.style.display = 'none';
    
//     // Hidden value simulating a real select
//     const hiddenSelect = document.createElement('select');
//     hiddenSelect.style.display = 'none';
    
//     // Create options in the hidden select
//     animationStyles.forEach(style => {
//         const option = document.createElement('option');
//         option.value = style.value;
//         option.text = style.label;
//         if (style.value === selectedValue) option.selected = true;
//         hiddenSelect.appendChild(option);
//     });
    
//     // Add visual options
//     animationStyles.forEach((style, index) => {
//         const optionElement = document.createElement('div');
//         optionElement.style.padding = '8px 10px';
//         optionElement.style.cursor = 'pointer';
//         optionElement.style.backgroundColor = colors.options;
//         optionElement.style.color = 'white';
//         optionElement.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
//         optionElement.style.fontSize = '14px';
//         optionElement.textContent = style.label;
        
//         // Hover effect
//         optionElement.addEventListener('mouseover', () => {
//             optionElement.style.backgroundColor = colors.hover;
//         });
        
//         optionElement.addEventListener('mouseout', () => {
//             optionElement.style.backgroundColor = style.label === displayText.textContent ? 
//                 colors.selected : colors.options;
//         });
        
//         // Select an option
//         optionElement.addEventListener('click', () => {
//             // Highlight
//             optionElement.style.backgroundColor = colors.selected;
//             optionElement.style.fontWeight = 'bold';
            
//             // Reset other options
//             Array.from(optionsContainer.children).forEach(opt => {
//                 if (opt !== optionElement) {
//                     opt.style.backgroundColor = colors.options;
//                     opt.style.fontWeight = 'normal';
//                 }
//             });
            
//             // Update text and value
//             displayText.textContent = style.label;
//             hiddenSelect.value = style.value;
            
//             // Close the list after a short pause
//             setTimeout(() => {
//                 optionsContainer.style.display = 'none';
                
//                 // Trigger a change event to simulate a native select
//                 const event = new Event('change');
//                 hiddenSelect.dispatchEvent(event);
//             }, 150);
//         });
        
//         // Highlight the currently selected option
//         if (style.value === selectedValue) {
//             optionElement.style.backgroundColor = colors.selected;
//             optionElement.style.fontWeight = 'bold';
//         }
        
//         optionsContainer.appendChild(optionElement);
//     });
    
//     // Toggle dropdown
//     selectDisplay.addEventListener('click', () => {
//         const isVisible = optionsContainer.style.display === 'block';
//         optionsContainer.style.display = isVisible ? 'none' : 'block';
//     });
    
//     // Close dropdown if clicked elsewhere
//     document.addEventListener('click', (event) => {
//         if (!selectContainer.contains(event.target)) {
//             optionsContainer.style.display = 'none';
//         }
//     });
    
//     // Assemble everything
//     selectContainer.appendChild(selectDisplay);
//     selectContainer.appendChild(optionsContainer);
//     selectContainer.appendChild(hiddenSelect);
    
//     // Expose hidden select events on the container
//     ['change', 'click'].forEach(eventName => {
//         hiddenSelect.addEventListener(eventName, (event) => {
//             const newEvent = new Event(eventName, { bubbles: true });
//             selectContainer.dispatchEvent(newEvent);
//         });
//     });
    
//     // Methods to simulate real select behavior
//     Object.defineProperty(selectContainer, 'value', {
//         get: function() {
//             return hiddenSelect.value;
//         },
//         set: function(value) {
//             hiddenSelect.value = value;
//             const index = animationStyles.findIndex(style => style.value === value);
//             if (index >= 0) {
//                 displayText.textContent = animationStyles[index].label;
//             }
//         }
//     });
    
//     // Hover effect on the select
//     selectContainer.addEventListener('mouseover', () => {
//         selectDisplay.style.backgroundColor = '#1976D2'; // Slightly darker blue
//     });
    
//     selectContainer.addEventListener('mouseout', () => {
//         selectDisplay.style.backgroundColor = colors.main;
//     });
    
//     return selectContainer;
// }

// Remplacement de la fonction createAnimationStyleSelect
function createAnimationStyleSelect(selectedValue = 'none') {
    // Définir les styles d'animation et leurs étiquettes correspondantes
    const options = [
        { value: 'none', label: 'Aucune' },
        { value: 'rotation', label: 'Rotation' },
        { value: 'simple', label: 'Simple' },
        { value: 'bounce', label: 'Rebond' },
        { value: 'float', label: 'Flottant' }
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
    title.textContent = 'Paramètres du nuage';
    title.style.margin = '0';
    title.style.color = 'white';
    title.style.textAlign = 'center';
    title.style.fontSize = '16px'; // Ajout pour réduire la taille de la police
    
    titleContainer.appendChild(title);
    
    // // Bouton de fermeture
    // const closeButton = document.createElement('button');
    // closeButton.innerHTML = '×';
    // closeButton.style.position = 'absolute';
    // closeButton.style.top = '5px'; // Réduit de 10px à 5px
    // closeButton.style.right = '5px'; // Réduit de 10px à 5px
    // closeButton.style.background = 'white';
    // closeButton.style.borderRadius = '50%';
    // closeButton.style.border = 'none';
    // closeButton.style.fontSize = '24px';
    // closeButton.style.cursor = 'pointer';
    // closeButton.style.color = '#666';
    // closeButton.style.width = '25px'; // Réduit de 30px à 25px
    // closeButton.style.height = '25px'; // Réduit de 30px à 25px
    // closeButton.style.display = 'flex';
    // closeButton.style.alignItems = 'center';
    // closeButton.style.justifyContent = 'center';
    // closeButton.style.zIndex = '2001';
    
    // closeButton.addEventListener('click', () => {
    //     document.body.removeChild(modal);
    // });



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
    const applyChanges = () => {
        // Récupérer les valeurs actuelles
        const settings = {
            cloudShape: shapeSelect.value,
            minFontSize: parseInt(minFontInput.querySelector('input').value),
            maxFontSize: parseInt(maxFontInput.querySelector('input').value),
            padding: parseFloat(paddingInput.querySelector('input').value),
            fontFamily: fontSelect.value,
            isShapeBorder: isShapeBorderCheckbox.checked,
            isThreeZones: isThreeZonesCheckbox.checked,
            wordRotation: wordRotationCheckbox.checked,
            // Gérer l'animation
            animationStyle: animationStyleSelect.value
        };
        
        // Mettre à jour les paramètres
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
        
        // Appeler la fonction de callback
        if (typeof onSave === 'function') {
            onSave(settings);
        }
    };

    // 1. Forme du nuage
    const shapeContainer = createFormGroup('Forme\ndu nuage', '#8e44ad'); // Couleur violette
    const shapeSelect = createShapeSelect(nameCloudState.cloudShape || 'rectangle');
    shapeSelect.addEventListener('change', applyChanges);
    shapeContainer.appendChild(shapeSelect);
    
    // 2. Animation (DÉPLACÉ JUSTE APRÈS LA FORME) - et avec couleur orange
    const animationContainer = createFormGroup('Animation', '#f39c12'); // Maintenant en orange
    const animationLabel = animationContainer.querySelector('.form-group-label');
    animationLabel.style.padding = '1px 6px';
    animationLabel.style.lineHeight = '2';
    
    // Créer le sélecteur d'animation
    const animationStyleSelect = createAnimationStyleSelect(currentAnimationStyle);
    animationStyleSelect.addEventListener('change', applyChanges);
    animationContainer.appendChild(animationStyleSelect);
    
    // 3. Taille de police minimum
    const minFontContainer = createFormGroup('Taille\nminimum', '#8e44ad'); // Violet
    const minFontInput = createNumberInput(nameCloudState.minFontSize, applyChanges);
    minFontContainer.appendChild(minFontInput);
    
    // 4. Taille de police maximum
    const maxFontContainer = createFormGroup('Taille\nmaximum', '#f39c12'); // Orange
    const maxFontInput = createNumberInput(nameCloudState.maxFontSize, applyChanges);
    maxFontContainer.appendChild(maxFontInput);
    
    // 5. Espace entre les mots
    const paddingContainer = createFormGroup('Espace\nentre mots', '#8e44ad'); // Violet
    const paddingInput = createNumberInput(nameCloudState.padding || 1, applyChanges);
    paddingContainer.appendChild(paddingInput);
    
    // 6. Police de caractères
    const fontContainer = createFormGroup('Police', '#f39c12'); // Orange
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
    const optionsContainer = createFormGroup('Options', '#8e44ad'); // Violet
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
    wordRotationLabel.appendChild(document.createTextNode('Rotation init.'));
    
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
    isShapeBorderLabel.appendChild(document.createTextNode('Contour'));
    
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
    isThreeZonesLabel.appendChild(document.createTextNode('3 zones'));

    // Ajouter les cases à cocher au conteneur
    checkboxesContainer.appendChild(wordRotationLabel);
    checkboxesContainer.appendChild(isShapeBorderLabel);
    checkboxesContainer.appendChild(isThreeZonesLabel);
    optionsContainer.appendChild(checkboxesContainer);
    

    // Bouton pour appliquer les paramètres
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Appliquer';
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
