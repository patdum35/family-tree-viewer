/**
 * Module pour créer des sélecteurs personnalisés réutilisables
 * Ce module fournit une fonction générique pour créer des sélecteurs stylisés
 * qui peuvent être utilisés à travers différentes parties de l'application.
 */

/**
 * Crée un sélecteur personnalisé avec des options déroulantes
 * @param {Object} config - Configuration du sélecteur
 * @param {Array<Object>} config.options - Liste des options [{value: 'value1', label: 'Label 1'}, ...]
 * @param {string} [config.selectedValue] - Valeur actuellement sélectionnée
 * @param {Object} [config.colors] - Couleurs du sélecteur
 * @param {Object} [config.dimensions] - Dimensions du sélecteur
 * @param {Object} [config.arrow] - Configuration de la flèche
 * @param {string} [config.arrow.position] - Position: 'right', 'left', 'top', 'center', 'top-right', etc.
 * @param {Object} [config.arrow.offset] - Décalage précis {x: 2, y: 0} en pixels
 * @param {Object} [config.padding] - Padding interne {display: {x: 1, y: 1}, options: {x: 8, y: 10}}
 * @param {boolean} [config.isMobile] - Indique si l'environnement est mobile
 * @returns {HTMLElement} - L'élément sélecteur créé
 */
export function createCustomSelector(config) {
    // Valeurs par défaut pour les paramètres
    const options = config.options || [];
    const selectedValue = config.selectedValue || (options.length > 0 ? options[0].value : '');
    const dropdownAlign = config.dropdownAlign || 'left'; // 'left' par défaut, peut être 'right'

    // Couleurs par défaut
    const colors = {
        main: '#4CAF50', // Vert par défaut
        options: '#4361ee', // Bleu pour les options
        hover: '#4CAF50', // Vert au survol
        selected: '#1a237e', // Bleu foncé pour l'option sélectionnée
        ...(config.colors || {})
    };
    
    // Dimensions par défaut
    const isMobile = config.isMobile || false;
    const dimensions = {
        width: '128px',
        height: '25px',
        dropdownWidth: null, // Utilise la même largeur que le sélecteur si null
        dropdownMaxHeight: isMobile ? '200px' : '300px',
        ...(config.dimensions || {})
    };
    
    // Si dropdownWidth n'est pas spécifié, utilisez la même largeur que le sélecteur
    if (!dimensions.dropdownWidth) {
        dimensions.dropdownWidth = dimensions.width;
    }
    
    // Padding par défaut
    const padding = {
        display: { x: 4, y: 4 }, // Padding du display (x = horizontal, y = vertical)
        options: { x: 8, y: 8 }, // Padding des options
        displayPosition : 'left',
        ...(config.padding || {})
    };
    
    // Configuration de la flèche
    const arrow = {
        position: 'right', // Position par défaut
        visible: true,
        size: 6, // Taille en pixels
        offset: { x: 0, y: 0 }, // Décalage en pixels
        ...(config.arrow || {})
    };
    
    // Trouver l'index de l'option actuellement sélectionnée
    const currentIndex = options.findIndex(opt => opt.value === selectedValue);
    const currentOption = options[currentIndex >= 0 ? currentIndex : 0].label;
    
    // Conteneur principal
    const selectContainer = document.createElement('div');
    selectContainer.style.position = 'relative';
    selectContainer.style.width = dimensions.width; // + ' !important';
    selectContainer.style.height = dimensions.height;
    selectContainer.style.zIndex = '99900'; // Ajout d'un z-index élevé
    selectContainer.className = 'custom-select-container'; // Ajout d'une classe

    
    // Élément qui simule le select
    const selectDisplay = document.createElement('div');
    selectDisplay.style.padding = `${padding.display.y}px ${padding.display.x}px`;
    selectDisplay.style.border = '1px solid #ddd';
    selectDisplay.style.borderRadius = '4px';
    selectDisplay.style.backgroundColor = colors.main;
    selectDisplay.style.color = 'white';
    selectDisplay.style.cursor = 'pointer';
    selectDisplay.style.fontSize = '14px';
    selectDisplay.style.fontWeight = 'bold';
    selectDisplay.style.display = 'flex';
    selectDisplay.style.justifyContent = 'space-between';
    selectDisplay.style.alignItems = 'center';
    selectDisplay.style.height = '100%';
    selectDisplay.style.boxSizing = 'border-box';
    selectDisplay.style.position = 'relative'; // Position relative pour la flèche
    selectDisplay.style.zIndex = '99900'; // Même valeur que le conteneur
    selectDisplay.className = 'custom-select-display'; // Ajout d'une classe
    
    // Texte affiché
    const displayText = document.createElement('span');
    displayText.textContent = currentOption;
    displayText.style.width = '100%';
    
    // Aligner le texte en fonction de la position de la flèche
    if (arrow.position.includes('left')) {
        displayText.style.textAlign = 'right';
    } else if (arrow.position.includes('center')) {
        displayText.style.textAlign = 'center';
    } else {
        displayText.style.textAlign = 'left';
    }
    if (padding.displayPosition.includes('center'))  {
        displayText.style.textAlign = 'center';
    }

// displayText.style.textAlign = 'center';

    
    // Ajouter la flèche comme un pseudo-élément si elle est visible
    if (arrow.visible) {
        const arrowStyle = document.createElement('style');
        const selectId = `custom-select-${Date.now()}`;
        selectDisplay.id = selectId;
        
        // Construire le positionnement CSS de la flèche selon la position spécifiée
        let arrowCSS = '';
        let arrowTop = '50%';
        let arrowLeft = 'auto';
        let arrowRight = 'auto';
        let translateX = '0';
        let translateY = '-50%';
        
        // Position horizontale
        if (arrow.position.includes('left')) {
            arrowLeft = `${8 + arrow.offset.x}px`;
        } else if (arrow.position.includes('right')) {
            arrowRight = `${8 + arrow.offset.x}px`;
        } else if (arrow.position.includes('center')) {
            arrowLeft = '50%';
            translateX = '-50%';
        }
        
        // Position verticale
        if (arrow.position.includes('top')) {
            arrowTop = `${0 + arrow.offset.y}px`;
            translateY = '0';
        } else if (arrow.position === 'center') {
            arrowTop = '50%';
            translateY = '-50%';
        }
        
        arrowCSS = `
            #${selectId}::after {
                content: '';
                position: absolute;
                top: ${arrowTop};
                left: ${arrowLeft};
                right: ${arrowRight};
                transform: translate(${translateX}, ${translateY});
                width: 0;
                height: 0;
                border-left: ${arrow.size}px solid transparent;
                border-right: ${arrow.size}px solid transparent;
                border-top: ${arrow.size}px solid white;
                pointer-events: none;
            }
        `;
        
        arrowStyle.textContent = arrowCSS;
        document.head.appendChild(arrowStyle);
    }
    
    // Ajouter le texte au display
    selectDisplay.appendChild(displayText);
    
    // Conteneur des options (initialement masqué)
    const optionsContainer = document.createElement('div');
    optionsContainer.style.position = 'absolute';
    optionsContainer.style.top = '100%';
    optionsContainer.style.left = '0';
    optionsContainer.style.width = dimensions.dropdownWidth;
    optionsContainer.style.backgroundColor = '#fff';
    optionsContainer.style.border = '1px solid #ccc';
    optionsContainer.style.borderRadius = '4px';
    optionsContainer.style.marginTop = '2px';
    optionsContainer.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    optionsContainer.style.maxHeight = dimensions.dropdownMaxHeight;
    optionsContainer.style.overflowY = 'auto';
    optionsContainer.style.zIndex = '999999';
    optionsContainer.style.display = 'none';
    
    // Valeur cachée simulant un vrai select
    const hiddenSelect = document.createElement('select');
    hiddenSelect.style.display = 'none';
    
    // Créer les options dans le select caché
    options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.text = opt.label;
        if (opt.value === selectedValue) option.selected = true;
        hiddenSelect.appendChild(option);
    });
    
    // Ajouter les options visuelles
    options.forEach((opt, index) => {
        const optionElement = document.createElement('div');
        optionElement.style.padding = `${padding.options.y}px ${padding.options.x}px`;
        optionElement.style.cursor = 'pointer';
        optionElement.style.backgroundColor = colors.options;
        optionElement.style.color = 'white';
        // Remplacer cette ligne pour une bordure plus foncée
        optionElement.style.borderBottom = '1px solid rgba(0,0,0,0.3)'; // Bordure plus foncée
        // Augmenter la taille de police
        optionElement.style.fontSize = '15px'; // Taille de police plus grande (était 14px)
        // Ajouter une police spécifique pour correspondre à celle de la modale
        optionElement.style.fontFamily = 'Arial, sans-serif'; // Même police que la modale
        optionElement.textContent = opt.label;
        
        // Personnaliser l'élément d'option si une fonction est fournie
        if (typeof config.customizeOptionElement === 'function') {
            config.customizeOptionElement(optionElement, opt, index);
        }
        
        // Effet de survol
        optionElement.addEventListener('mouseover', () => {
            optionElement.style.backgroundColor = colors.hover;
        });
        
        optionElement.addEventListener('mouseout', () => {
            optionElement.style.backgroundColor = opt.label === displayText.textContent ? 
                colors.selected : colors.options;
        });
        
        // Sélection d'une option
        optionElement.addEventListener('click', () => {
            // Mise en évidence
            optionElement.style.backgroundColor = colors.selected;
            optionElement.style.fontWeight = 'bold';
            
            // Réinitialiser les autres options
            Array.from(optionsContainer.children).forEach(opt => {
                if (opt !== optionElement) {
                    opt.style.backgroundColor = colors.options;
                    opt.style.fontWeight = 'normal';
                }
            });
            
            // Mettre à jour le texte et la valeur
            displayText.textContent = opt.label;
            hiddenSelect.value = opt.value;
            
            // Fermer la liste après une courte pause
            setTimeout(() => {
                optionsContainer.style.display = 'none';
                
                // Déclencher un événement de changement pour simuler un select natif
                const event = new Event('change');
                hiddenSelect.dispatchEvent(event);
                
                // Appeler la fonction onChange si elle est fournie
                if (typeof config.onChange === 'function') {
                    config.onChange(opt.value, opt.label);
                }
            }, 150);
        });
        
        // Mettre en évidence l'option actuellement sélectionnée
        if (opt.value === selectedValue) {
            optionElement.style.backgroundColor = colors.selected;
            optionElement.style.fontWeight = 'bold';
        }
        
        optionsContainer.appendChild(optionElement);
    });



    // Toggle du dropdownconst selectContainer = document.createElement('div')
    selectDisplay.addEventListener('click', () => {
        const isVisible = optionsContainer.style.display === 'block';

        if (!isVisible) {
            // AVANT d'afficher le dropdown, le détacher et le rattacher au BODY
            if (optionsContainer.parentNode) {
                optionsContainer.parentNode.removeChild(optionsContainer);
            }
            
            // Récupérer la position du sélecteur par rapport à la fenêtre
            const rect = selectDisplay.getBoundingClientRect();
            
            // Appliquer cette position absolue en coordonnées de fenêtre
            optionsContainer.style.position = 'fixed';
            optionsContainer.style.top = (rect.bottom + 1) + 'px';

            // Positionner en fonction de l'alignement choisi
            if (dropdownAlign === 'right') {
                // Calculer la position à gauche pour que le dropdown soit aligné à droite avec le sélecteur
                const dropdownWidth = parseInt(dimensions.dropdownWidth);
                optionsContainer.style.left = (rect.right - dropdownWidth) + 'px';
            } else {
                optionsContainer.style.left = rect.left + 'px';
            }


            optionsContainer.style.width = dimensions.dropdownWidth;
            optionsContainer.style.zIndex = '999999';
            
            // L'ajouter directement au body pour qu'il soit au-dessus de tout
            document.body.appendChild(optionsContainer);
            
            // Maintenant l'afficher
            optionsContainer.style.display = 'block';
        } else {
            // Simplement masquer si déjà visible
            optionsContainer.style.display = 'none';
        }
    });


    // Par celle-ci:
    document.addEventListener('click', (event) => {
        // Vérifier si le clic est à l'extérieur à la fois du container et du options container
        const clickOutsideContainer = !selectContainer.contains(event.target);
        const clickOutsideOptions = !optionsContainer.contains(event.target);
        
        if (clickOutsideContainer && clickOutsideOptions) {
            optionsContainer.style.display = 'none';
        }
    });








    
    // Assembler le tout
    selectContainer.appendChild(selectDisplay);
    selectContainer.appendChild(optionsContainer);
    selectContainer.appendChild(hiddenSelect);
    
    // Exposer les événements du select caché sur le conteneur
    ['change', 'click'].forEach(eventName => {
        hiddenSelect.addEventListener(eventName, (event) => {
            const newEvent = new Event(eventName, { bubbles: true });
            selectContainer.dispatchEvent(newEvent);
        });
    });
    
    // Méthodes pour simuler le comportement d'un vrai select
    Object.defineProperty(selectContainer, 'value', {
        get: function() {
            return hiddenSelect.value;
        },
        set: function(value) {
            hiddenSelect.value = value;
            const index = options.findIndex(opt => opt.value === value);
            if (index >= 0) {
                displayText.textContent = options[index].label;
            }
        }
    });
    
    // Effet hover sur le select
    selectContainer.addEventListener('mouseover', () => {
        const hoverColor = adjustColor(colors.main, -10); // Légèrement plus foncé
        selectDisplay.style.backgroundColor = hoverColor;
    });
    
    selectContainer.addEventListener('mouseout', () => {
        selectDisplay.style.backgroundColor = colors.main;
    });
    
    // Appliquer les personnalisations après création si une fonction est fournie
    if (typeof config.onCreated === 'function') {
        config.onCreated(selectContainer);
    }


    // Ajouter une méthode pour changer la hauteur maximale
    selectContainer.setDropdownMaxHeight = function(newHeight) {
        // La référence à optionsContainer est accessible ici (closure)
        optionsContainer.style.maxHeight = newHeight;
    };

    
    return selectContainer;
}

/**
 * Ajuste une couleur en la rendant plus claire ou plus foncée
 * @param {string} color - Couleur au format hexadécimal (#RRGGBB)
 * @param {number} percent - Pourcentage d'ajustement (-100 à 100)
 * @returns {string} - Couleur ajustée au format hexadécimal
 */
function adjustColor(color, percent) {
    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);

    R = Math.min(255, Math.max(0, R + Math.round(R * percent / 100)));
    G = Math.min(255, Math.max(0, G + Math.round(G * percent / 100)));
    B = Math.min(255, Math.max(0, B + Math.round(B * percent / 100)));

    const RR = R.toString(16).padStart(2, '0');
    const GG = G.toString(16).padStart(2, '0');
    const BB = B.toString(16).padStart(2, '0');

    return `#${RR}${GG}${BB}`;
}

/**
 * Fonction de commodité pour gérer les trois types de liste (options, optionsExpanded et values)
 * @param {Array<string>} labels - Liste des libellés courts
 * @param {Array<string>} expandedLabels - Liste des libellés longs (optionnel)
 * @param {Array<string>} values - Liste des valeurs (optionnel)
 * @returns {Array<Object>} - Liste d'options formatée pour createCustomSelector
 */
export function createOptionsFromLists(labels, expandedLabels = null, values = null) {
    return labels.map((label, index) => {
        return {
            label: label,
            expandedLabel: expandedLabels ? expandedLabels[index] : label,
            value: values ? values[index] : label
        };
    });
}





// ====================================
// Utilitaires pour les sélecteurs
// ====================================

/**
 * Met à jour la valeur et l'affichage d'un sélecteur, qu'il soit standard ou personnalisé
 * @param {string} selectorId - ID du sélecteur à mettre à jour
 * @param {string} value - Valeur à définir
 * @param {string} displayText - Texte à afficher (optionnel)
 * @param {Object} options - Options supplémentaires (optionnel)
 * @returns {boolean} - true si la mise à jour a réussi, false sinon
 */
export function updateSelectorValue(selectorId, value, displayText, options = {}) {
    const selector = document.getElementById(selectorId);
    if (!selector) return false;
    
    try {
        // Définir la valeur
        if (typeof selector.value !== 'undefined') {
            selector.value = value;
        }
        
        // Mettre à jour l'affichage si nécessaire
        if (displayText) {
            if (typeof selector.updateDisplay === 'function') {
                selector.updateDisplay(displayText);
            } else if (selector.tagName === 'SELECT') {
                // Pour un select standard
                if (options.replaceOptions) {
                    selector.innerHTML = '';
                }
                const option = document.createElement('option');
                option.value = value;
                option.textContent = displayText;
                selector.appendChild(option);
                
                // Sélectionner l'option
                selector.value = value;
            }
        }
        
        return true;
    } catch (error) {
        console.warn(`Erreur lors de la mise à jour du sélecteur ${selectorId}:`, error);
        return false;
    }
}

/**
 * Vérifie si un sélecteur contient une option avec une certaine valeur
 * @param {string} selectorId - ID du sélecteur à vérifier
 * @param {string|number} optionValue - Valeur à rechercher
 * @returns {boolean} - true si l'option existe, false sinon
 */
export function selectorHasOption(selectorId, optionValue) {
    const selector = document.getElementById(selectorId);
    if (!selector) return false;
    
    try {
        // Pour un sélecteur standard avec des options
        if (selector.tagName === 'SELECT' && selector.options) {
            return Array.from(selector.options)
                .some(option => option.value == optionValue);
        }
        
        // Pour un sélecteur personnalisé avec une méthode hasOption
        if (typeof selector.hasOption === 'function') {
            return selector.hasOption(optionValue);
        }
        
        // Impossible de vérifier
        return false;
    } catch (error) {
        console.warn(`Erreur lors de la vérification des options du sélecteur ${selectorId}:`, error);
        return false;
    }
}