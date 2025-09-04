
// Fonction pour remplacer les sélecteurs standard par des sélecteurs personnalisés
import { createCustomSelector, createOptionsFromLists } from './UIutils.js';
import { state, displayGenealogicTree, showToast } from './main.js';
import { nameCloudState } from './nameCloud.js';
import { selectFoundPerson } from './eventHandlers.js';
import { extractYear, findDateForPerson } from './nameCloudUtils.js';

// Variable pour suivre si les sélecteurs ont été initialisés
let selectorsInitialized = false;

// Variable pour stocker une référence au sélecteur de personnes racines
let rootPersonSelector = null;

export function initializeCustomSelectors() {
    if (selectorsInitialized) return;

    // 1. Remplacer le sélecteur de générations
    replaceGenerationSelector();
    
    // 2. Remplacer le sélecteur de mode d'arbre
    replaceTreeModeSelector();

    // Marquer comme initialisé
    selectorsInitialized = true;
}

// Fonction pour remplacer le sélecteur de générations
function replaceGenerationSelector() {
    const originalSelect = document.getElementById('generations');
    if (!originalSelect) return;
    
    // Récupérer les attributs data-* et title de l'élément original
    const dataAction = originalSelect.getAttribute('data-action');
    const dataTextKey = originalSelect.getAttribute('data-text-key');
    const titleValue = originalSelect.getAttribute('title');

    // Créer les options pour le sélecteur personnalisé
    const options = [];
    for (let i = 2; i <= 101; i++) {
        options.push({ value: i.toString(), label: i.toString() });
    }
    
    // Configurer le sélecteur personnalisé
    const customSelector = createCustomSelector({
        options: options,
        selectedValue: state.nombre_generation.toString() || "6",
        colors: {
            main: ' #4CAF50',    // Vert pour le sélecteur principal
            options: ' #4361ee', // Bleu pour les options
            hover: ' #4CAF50',   // Vert au survol
            selected: ' #1a237e' // Bleu foncé pour l'option sélectionnée
        },
        isMobile: nameCloudState.mobilePhone,
        dimensions: {
            width: '35px',
            height: '25px',
            dropdownWidth: '45px',
            dropdownHeight: '240px' 
        },
        // Padding très réduit pour maximiser la compacité
        padding: {
            display: { x: 8, y: 1 },    // Padding minimal pour le sélecteur
            options: { x: 1, y: 2}     // Padding pour les options
        },   
        arrow: {
            position: 'top-right',
            size: 5.5,
            offset: { x: -5, y: 1} // Décale 5px vers la gauche et 2px vers le bas
        },
        onChange: (value) => {
            // Appeler la fonction de mise à jour des générations
            window.updateGenerations(value);
        },
        // Personnalisation supplémentaire du sélecteur
        onCreated: (selector) => {
            // Enlever les bordures blanches et appliquer le style voulu immédiatement
            const displayElement = selector.querySelector('div[style*="border"]');
            if (displayElement) {
                // Appliquer tous les styles en une seule fois pour éviter les reflows
                Object.assign(displayElement.style, {
                    border: 'none',  // Supprimer la bordure
                    backgroundColor: 'rgba(76, 175, 80, 0.85)',  // Vert plus visible
                    color: 'white',                               // Texte blanc pour meilleur contraste
                    boxSizing: 'border-box',
                    fontWeight: 'bold'                           // Texte en gras
                });
            }
            
            // Supprimer toute bordure blanche potentielle du conteneur
            Object.assign(selector.style, {
                border: 'none',
                backgroundColor: 'transparent',
                boxShadow: 'none',
                outline: 'none'  // Supprimer également le outline
            });
            
            // Force un repaint pour s'assurer que les styles sont appliqués immédiatement
            selector.offsetHeight;
        }
    });
    
    // IMPORTANT: Conserver l'ID original
    customSelector.id = 'generations';

    // Vérifier que la propriété value est correctement exposée
    if (typeof customSelector.value === 'undefined') {
        Object.defineProperty(customSelector, 'value', {
            get: function() {
                return this.getAttribute('data-value') || state.nombre_generation.toString();
            },
            set: function(val) {
                this.setAttribute('data-value', val);
                // Mettre à jour l'affichage si nécessaire
                const displayElement = this.querySelector('div span');
                if (displayElement) {
                    displayElement.textContent = val;
                }
            }
        });
    }

    // Transférer les attributs pour le toast
    customSelector.setAttribute('data-text-key', dataTextKey || 'treeMode');
    customSelector.setAttribute('data-action', dataAction || 'choisir le mode de visualisation de l\'arbre en ancêtre, descendant ou les 2');
    customSelector.setAttribute('title', titleValue || 'choisir le mode de visualisation de l\'arbre en ancêtre, descendant ou les 2');
    
    // Ajouter un gestionnaire d'événements pour le clic
    customSelector.addEventListener('click', function() {
        const message = this.getAttribute('data-action');
        if (message && window.showToast) {
            const key = this.getAttribute('data-text-key');
            if (!window.actionCounters) {
                window.actionCounters = {};
            }
            if (!window.actionCounters[key]) {
                window.actionCounters[key] = 0;
            }
            window.actionCounters[key]++;
            
            const max_count = 3; // Limiter à 3 affichages comme dans votre code original
            if (window.actionCounters[key] <= max_count) {
                window.showToast(message);
            }
        }
    });

    // Remplacer le sélecteur original par le sélecteur personnalisé
    const parentElement = originalSelect.parentElement;
    parentElement.replaceChild(customSelector, originalSelect);
}


// Fonction pour mettre à jour l'affichage du sélecteur de générations
export function updateGenerationSelector(newValue) {
    const customSelector = document.getElementById('generations');
    if (!customSelector) return;
    
    // Mettre à jour la propriété value
    customSelector.value = newValue.toString();
    
    // Mettre à jour l'attribut data-value
    customSelector.setAttribute('data-value', newValue.toString());
    
    // Trouver et mettre à jour l'élément d'affichage
    const displayElement = customSelector.querySelector('div span') || 
                          customSelector.querySelector('div');
    
    if (displayElement) {
        displayElement.textContent = newValue.toString();
    }
    
    console.log(`Sélecteur générations mis à jour: ${newValue}`);
}

// Fonction pour remplacer le sélecteur TreeMode
function replaceTreeModeSelector() {
    const originalSelect = document.getElementById('treeMode');
    if (!originalSelect) return;
    
    // Récupérer les attributs data-* et title de l'élément original
    const dataAction = originalSelect.getAttribute('data-action');
    const dataTextKey = originalSelect.getAttribute('data-text-key');
    const titleValue = originalSelect.getAttribute('title');
    
    // Définir les options et les valeurs correspondantes
    let typeOptions = ['Ascd', 'Asc.', 'Desd', 'Desc.', 'A+D']; 
    let typeOptionsExpanded = ['Ascendants directs', 'Ascendants + fratrie', 'Descendants directs', 'Descendants + conjoints', 'Ascend+Descend'];          
    const typeValues = ['directAncestors', 'ancestors', 'directDescendants', 'descendants', 'both'];
    

    if (window.CURRENT_LANGUAGE === 'en') {  
        // Traduire les options en anglais
        typeOptions = ['dAnc', 'Anc.', 'dDes', 'Desc.', 'A+D'];   
        typeOptionsExpanded = ['Direct Ancestors', 'Ancestors + Siblings', 'Direct Descendants', 'Descendants + Spouses', 'Ancest+Descend'];
    } else if (window.CURRENT_LANGUAGE === 'es') {
        // Traduire les options en espagnol
        typeOptions = ['Antd', 'Ant.', 'Desd', 'Desc.', 'A+D']; 
        typeOptionsExpanded = ['Antepasados ​​directos', 'Antepasados + hermanos', 'descendientes directos', 'descendientes + cónyuges', 'Ant+Desc'];
    } else if (window.CURRENT_LANGUAGE === 'hu') {
        // Traduire les options en hongrois
        typeOptions = ['k.őse', 'Őse.', 'k.Les', 'Les.', 'Ő+L']; 
        typeOptionsExpanded = ['Közvetlen őseink', 'Őseink + testvérek', 'Közvetlen leszármazottaink', 'Leszármazottaink + házastársak', 'Ős+Leszármazott'];
    }



    // Créer la liste d'options
    const options = createOptionsFromLists(typeOptions, typeOptionsExpanded, typeValues);

    // Configurer le sélecteur personnalisé
    const customSelector = createCustomSelector({
        options: options,
        selectedValue: state.treeMode || 'ancestors',
        colors: {
            main: ' #4361ee',    // Bleu pour le sélecteur
            options: ' #38b000', // Vert pour les options
            hover: ' #2e9800',   // Vert légèrement plus foncé au survol
            selected: ' #1a4d00' // Vert beaucoup plus foncé pour l'option sélectionnée
        },
        isMobile: nameCloudState.mobilePhone,
        dimensions: {
            width: '45px',
            height: '25px',
            dropdownWidth: '180px'
        },
        // Padding très réduit pour maximiser la compacité
        padding: {
            display: { x: 4, y: 1 },    // Padding minimal pour le sélecteur
            options: { x: 8, y: 10 }     // Padding pour les options
        },   
        arrow: {
            position: 'top-right',
            size: 5.5,
            offset: { x: -5, y: 1} // Décale 5px vers la gauche et 2px vers le bas
        },
        // Personnalisation des options
        customizeOptionElement: (optionElement, option) => {
            // Utiliser le label étendu dans le menu déroulant
            optionElement.textContent = option.expandedLabel;
            
            // Centrer le texte
            optionElement.style.textAlign = 'center';
            
            // Padding spécifique
            optionElement.style.padding = '10px 8px';
        },
        onChange: (value) => {
            // Appeler la fonction de mise à jour du mode d'arbre
            window.updateTreeMode(value);
        },
        // Personnalisation supplémentaire du sélecteur
        onCreated: (selector) => {
            // Enlever les bordures blanches et appliquer le style voulu immédiatement
            const displayElement = selector.querySelector('div[style*="border"]');
            if (displayElement) {
                // Appliquer tous les styles en une seule fois pour éviter les reflows
                Object.assign(displayElement.style, {
                    border: 'none',  // Supprimer la bordure
                    backgroundColor: 'rgba(33, 150, 243, 0.85)',  // Bleu plus visible
                    color: 'white',                               // Texte blanc pour meilleur contraste
                    boxSizing: 'border-box',
                    fontWeight: 'bold'                           // Texte en gras
                });
            }
            
            // Supprimer toute bordure blanche potentielle du conteneur
            Object.assign(selector.style, {
                border: 'none',
                backgroundColor: 'transparent',
                boxShadow: 'none',
                outline: 'none'  // Supprimer également le outline
            });
            
            // Force un repaint pour s'assurer que les styles sont appliqués immédiatement
            selector.offsetHeight;
        }
    });
    
    
    // IMPORTANT: Conserver l'ID original
    customSelector.id = 'treeMode';

    // Transférer les attributs pour le toast
    customSelector.setAttribute('data-text-key', dataTextKey || 'treeMode');
    customSelector.setAttribute('data-action', dataAction || 'choisir le mode de visualisation de l\'arbre en ancêtre, descendant ou les 2');
    customSelector.setAttribute('title', titleValue || 'choisir le mode de visualisation de l\'arbre en ancêtre, descendant ou les 2');
    
    // Ajouter un gestionnaire d'événements pour le clic
    customSelector.addEventListener('click', function() {
        const message = this.getAttribute('data-action');
        if (message && window.showToast) {
            const key = this.getAttribute('data-text-key');
            if (!window.actionCounters) {
                window.actionCounters = {};
            }
            if (!window.actionCounters[key]) {
                window.actionCounters[key] = 0;
            }
            window.actionCounters[key]++;
            
            const max_count = 3; // Limiter à 3 affichages comme dans votre code original
            if (window.actionCounters[key] <= max_count) {
                window.showToast(message);
            }
        }
    });

    // Remplacer le sélecteur original par le sélecteur personnalisé
    const parentElement = originalSelect.parentElement;
    parentElement.replaceChild(customSelector, originalSelect);   
}


// Fonction pour mettre à jour l'affichage du sélecteur
export function updateTreeModeSelector(newValue) {
    // Mettre à jour l'état global AVANT la reconstruction
    state.treeMode = newValue;
    
    // Reconstruire complètement le sélecteur avec la nouvelle valeur
    replaceTreeModeSelector();
}

/**
 * Tronque un texte à un certain nombre de caractères,
 * ajoute des points de suspension si nécessaire,
 * met uniquement la première lettre en majuscule,
 * et remplace les tirets par des espaces
 */
function truncateText(text, maxLength = 6) {
    if (!text) return '';
    
    // Remplacer les tirets par des espaces
    let formattedText = text.replace(/-/g, ' ');
    
    // Mettre tout en minuscules
    formattedText = formattedText.toLowerCase();
    
    // Capitaliser la première lettre
    formattedText = formattedText.charAt(0).toUpperCase() + formattedText.slice(1);
    
    // Tronquer si nécessaire
    if (formattedText.length <= maxLength) return formattedText;
    
    return formattedText.substring(0, maxLength);
}

export function enforceTextTruncation() {
    // Cette fonction recherche tous les sélecteurs personnalisés dans le DOM
    // et applique la troncature à leur texte affiché
    document.querySelectorAll('[data-text-key]').forEach(selector => {
        const displayElement = selector.querySelector('div span');
        if (displayElement) {
            // Si c'est le sélecteur rootPersonResults, appliquer la troncature
            if (selector.getAttribute('data-text-key') === 'rootPersonResults') {
                const fullText = displayElement.textContent || '';
                // Sauvegarder le texte complet s'il n'est pas déjà enregistré
                if (!displayElement.dataset.fullText) {
                    displayElement.dataset.fullText = fullText;
                }
                // Appliquer la troncature
                updateSelectorDisplayText(selector, fullText);
            }
        }
    });
}

// Fonction pour mettre à jour l'affichage du texte dans le sélecteur
export function updateSelectorDisplayText(selector, text) {
    if (!selector) return;
    
    const displayElement = selector.querySelector('div span');
    if (displayElement) {
        // Stocker le texte complet comme attribut data pour pouvoir l'utiliser plus tard si nécessaire
        displayElement.dataset.fullText = text;
        
        // Afficher seulement les 8 premiers caractères
        displayElement.textContent = truncateText(text);
    }
}


/**
 * Met à jour la valeur du sélecteur de générations
 * @param {number} value - Le nouveau nombre de générations
 */
export function updateGenerationSelectorValue(value) {
    // Mettre à jour l'état global
    state.nombre_generation = value;
    replaceGenerationSelector();
  }

// Ajout d'un état global pour suivre le mode du sélecteur
let selectorMode = 'history'; // Valeurs possibles: 'history', 'search'

// Version améliorée de replaceRootPersonSelector
export function replaceRootPersonSelector(customOptions = null) {
    const originalSelect = document.getElementById('root-person-results');
    if (!originalSelect) return;

    // Si des options personnalisées sont fournies, on est en mode recherche
    if (Array.isArray(customOptions)) {
        selectorMode = 'search';
    } else {
        selectorMode = 'history';
    }

    // Récupérer les attributs data-* et title de l'élément original
    const dataAction = originalSelect.getAttribute('data-action');
    const dataTextKey = originalSelect.getAttribute('data-text-key');
    const titleValue = originalSelect.getAttribute('title');

    // Préparer les options en fonction du mode
    let options = [];
    
    if (Array.isArray(customOptions)) {
        options = customOptions;
    } else {
        // Récupération de l'historique des racines depuis le localStorage
        let rootHistory = JSON.parse(localStorage.getItem('rootPersonHistory') || '[]');
        
        // Création des options pour le sélecteur personnalisé
        options = rootHistory.map(entry => ({
            value: entry.id,
            label: entry.name
        }));
        
        // Ajouter l'option "Clear History"
        options.push({ value: 'clear-history', label: '--- Clear History ---' });
        


        // let textDemo1, textDemo2;
        // if (state.treeOwner === 2 ) { 
        //     textDemo1 = '--- démo Clou du spectacle ---';
        //     textDemo2 = '--- démo Spain ---';
        // } else { 
        //     textDemo1 = '--démo Costaud la Planche --';
        //     textDemo2 = '--démo on descend tous de lui--'; 
        // }

        // // Ajouter les options pour les démos    
        // options.push({ value: 'demo1', label: textDemo1 });
        // options.push({ value: 'demo2', label: textDemo2 });



        // // Ajouter les options pour les démos
        // options.push({ value: 'demo1', label: '--- Demo1 ---' });
        // options.push({ value: 'demo2', label: '--- Demo2 ---' });
    }

    // Configurer le sélecteur personnalisé
    const customSelector = createCustomSelector({
        options: options,
        selectedValue: selectorMode === 'history' ? 
            (state.rootPersonId || (options.length > 0 ? options[0].value : '')) : '',
        colors: {
            main: ' #ff9800',    // Orange pour le sélecteur principal
            options: ' #ff9800', // Orange pour les options
            hover: ' #f57c00',   // Orange plus foncé au survol
            selected: ' #e65100' // Orange encore plus foncé pour l'option sélectionnée
        },
        dropdownAlign: 'right',  // Alignement à droite
        isMobile: nameCloudState.mobilePhone,
        dimensions: {
            width: '80px',
            height: '25px',
            dropdownWidth: '250px' // Largeur plus importante pour le dropdown
        },
        padding: {
            display: { x: 4, y: 1 },    // Padding minimal pour le sélecteur
            options: { x: 8, y: 10 }     // Padding pour les options
        },
        arrow: {
            position: 'top-right',
            size: 5.5,
            offset: { x: -5, y: 1} // Décale 5px vers la gauche et 1px vers le bas
        },
        customizeOptionElement: (optionElement, option) => {
            // Style particulier pour les options spéciales
            if (['clear-history', 'demo1', 'demo2'].includes(option.value)) {
                optionElement.style.fontStyle = 'italic';
                optionElement.style.color = '#ffffff';
                optionElement.style.backgroundColor = '#ff9800';
            } else if (option.value === "") {
                // Style spécial pour l'option "Select"
                optionElement.style.fontWeight = 'bold';
                optionElement.style.backgroundColor = '#FF5722'; // Orange vif
                optionElement.style.color = 'white';
            }
        },
        onChange: (value) => {
            // Gérer différemment les options spéciales
            if (['clear-history', 'demo1', 'demo2'].includes(value)) {
                // Créer un objet qui imite l'événement attendu par handleRootPersonChange
                const fakeEvent = {
                    target: { value: value }
                };
                
                try {
                    // Appeler directement la fonction avec notre faux événement
                    window.handleRootPersonChange(fakeEvent);
                    
                    // Pour 'clear-history', mettre à jour immédiatement le sélecteur
                    if (value === 'clear-history') {
                        // On rappelle replaceRootPersonSelector sans arguments pour recharger l'historique
                        setTimeout(() => {
                            replaceRootPersonSelector();
                        }, 100);
                    }
                } catch (error) {
                    console.error("Erreur lors du changement de personne racine:", error);
                }
            } else if (value === "") {
                // Ne rien faire pour l'option "Select"
                return;
            } else {
                // Pour les personnes normales, sélectionner la personne comme racine
                if (selectorMode === 'search') {
                    // En mode recherche, utiliser selectFoundPerson
                    if (typeof selectFoundPerson === 'function') {
                        selectFoundPerson(value);
                    }
                } else {
                    // En mode historique, simplement afficher l'arbre
                    console.log('\n\n\n\n ###################   CALL displayGenealogicTree in replaceRootPersonSelector ################# ')
                    // displayGenealogicTree(value, true);
                    if (state.isRadarEnabled) {
                        displayGenealogicTree(value, false, false,  false, 'WheelAncestors');
                    } else {
                        displayGenealogicTree(value, true, false);
                    }
                }
            }
            
            // Afficher le toast
            if (window.showToast) {
                const message = customSelector.getAttribute('data-action');
                if (message) {
                    const key = customSelector.getAttribute('data-text-key');
                    if (!window.actionCounters) {
                        window.actionCounters = {};
                    }
                    if (!window.actionCounters[key]) {
                        window.actionCounters[key] = 0;
                    }
                    window.actionCounters[key]++;
                    
                    const max_count = 3;
                    if (window.actionCounters[key] <= max_count) {
                        window.showToast(message);
                    }
                }
            }
        },
        onCreated: (selector) => {
            // Enlever les bordures et appliquer le style voulu
            const displayElement = selector.querySelector('div[style*="border"]');
            if (displayElement) {
                // Appliquer tous les styles en une seule fois pour éviter les reflows
                Object.assign(displayElement.style, {
                    border: 'none',
                    backgroundColor: 'rgba(255, 152, 0, 0.85)', // Orange semi-transparent
                    color: 'white',
                    boxSizing: 'border-box',
                    fontWeight: 'bold'
                });
                
                // IMPORTANT : Tronquer le texte initial lors de la création
                if (selectorMode === 'history' && options.length > 0 && state.rootPersonId) {
                    // Trouver l'option sélectionnée
                    const selectedOption = options.find(opt => opt.value === state.rootPersonId);
                    if (selectedOption) {
                        updateSelectorDisplayText(selector, selectedOption.label);
                    }
                } else if (selectorMode === 'search') {
                    // En mode recherche, afficher "Select"
                    updateSelectorDisplayText(selector, "Select");
                } else if (options.length > 0) {
                    // Utiliser la première option si aucune n'est sélectionnée
                    updateSelectorDisplayText(selector, options[0].label);
                }
            }
            
            // Supprimer toute bordure du conteneur
            Object.assign(selector.style, {
                border: 'none',
                backgroundColor: 'transparent',
                boxShadow: 'none',
                outline: 'none',
                display: 'block' // Conserver le display:block de l'original
            });
            
            // Force un repaint
            selector.offsetHeight;
        }
    });
    
    // Ajouter un attribut data-mode pour suivre le mode actuel
    customSelector.setAttribute('data-mode', selectorMode);
    
    // Méthode pour activer/désactiver le clignotement
    customSelector.setBlinking = function(isBlinking, bgColor) {
        const displayElement = this.querySelector('div[style*="border"]');
        
        if (isBlinking) {
            // Utiliser un orange vif pour le clignotement
            const blinkColor = bgColor || '#FF5722'; // Orange vif (Deep Orange 500)
            
            // Définir l'animation CSS directement
            const keyframesRule = `
                @keyframes blink-animation {
                    0% { background-color: ${blinkColor}; }
                    50% { background-color: rgba(255, 87, 34, 0.5); }
                    100% { background-color: ${blinkColor}; }
                }
            `;
            
            // Ajouter les keyframes au document s'ils n'existent pas déjà
            if (!document.getElementById('blink-keyframes')) {
                const styleElement = document.createElement('style');
                styleElement.id = 'blink-keyframes';
                styleElement.textContent = keyframesRule;
                document.head.appendChild(styleElement);
            }
            
            if (displayElement) {
                // Sauvegarder la couleur d'origine pour pouvoir la restaurer plus tard
                this._originalBgColor = displayElement.style.backgroundColor;
                
                // Appliquer l'animation au displayElement
                displayElement.style.animation = 'blink-animation 0.7s infinite';
                displayElement.style.backgroundColor = blinkColor;
            } else {
                // Appliquer l'animation au sélecteur lui-même
                this.style.animation = 'blink-animation 0.7s infinite';
                this.style.backgroundColor = blinkColor;
            }
        } else {
            // Arrêter l'animation
            if (displayElement) {
                displayElement.style.animation = 'none';
                // Restaurer la couleur d'origine ou utiliser orange par défaut
                displayElement.style.backgroundColor = this._originalBgColor || 'rgba(255, 152, 0, 0.85)';
            } else {
                this.style.animation = 'none';
                this.style.backgroundColor = 'orange';
            }
        }
    };

    // Fonction améliorée pour mettre à jour les options
    function updateCustomSelectorOptions(selector, options) {
        if (!selector) return;
        
        // Récupérer le mode actuel du sélecteur
        const currentMode = selector.getAttribute('data-mode') || 'history';
        
        // Supprimer les options existantes
        const optionsContainer = selector.querySelector('div:nth-child(2)');
        if (optionsContainer) {
            optionsContainer.innerHTML = '';
            
            // Ajouter les nouvelles options
            options.forEach(option => {
                const optionElement = document.createElement('div');
                optionElement.textContent = option.label;
                optionElement.dataset.value = option.value;
                optionElement.style.padding = '8px 10px';
                optionElement.style.cursor = 'pointer';
                optionElement.style.transition = 'background-color 0.2s ease';
                
                // Style de base en fonction du type d'option
                if (option.value === "") {
                    optionElement.style.fontWeight = 'bold';
                    optionElement.style.backgroundColor = '#FF5722'; // Orange vif
                    optionElement.style.color = 'white';
                } else if (['clear-history', 'demo1', 'demo2'].includes(option.value)) {
                    optionElement.style.fontStyle = 'italic';
                    optionElement.style.color = '#ffffff';
                    optionElement.style.backgroundColor = '#ff9800';
                } else {
                    optionElement.style.backgroundColor = '#ff9800';
                    optionElement.style.color = 'white';
                }
                
                optionElement.style.borderBottom = '1px solid rgba(0,0,0,0.3)';
                optionElement.style.fontSize = '15px';
                optionElement.style.fontFamily = 'Arial, sans-serif';
                
                // Ajout des événements de survol pour tous les éléments
                optionElement.addEventListener('mouseover', function() {
                    // Sauvegarder la couleur d'origine si ce n'est pas déjà fait
                    if (!this.dataset.originalBgColor) {
                        this.dataset.originalBgColor = this.style.backgroundColor;
                    }
                    
                    // Couleur au survol en fonction du type d'option
                    if (option.value === "") {
                        this.style.backgroundColor = '#D84315'; // Deep Orange 800 (plus foncé)
                    } else if (['clear-history', 'demo1', 'demo2'].includes(option.value)) {
                        this.style.backgroundColor = '#F57C00'; // Orange 800 (plus foncé)
                    } else {
                        this.style.backgroundColor = '#F57C00'; // Orange 800 (plus foncé)
                    }
                });
                
                optionElement.addEventListener('mouseout', function() {
                    // Restaurer la couleur d'origine
                    if (this.dataset.originalBgColor) {
                        this.style.backgroundColor = this.dataset.originalBgColor;
                    }
                });
                
                // Mise en évidence de l'option actuellement sélectionnée
                if (option.value === selector.value && option.value !== "" && !['clear-history', 'demo1', 'demo2'].includes(option.value)) {
                    optionElement.style.backgroundColor = '#E65100'; // Orange 900 (encore plus foncé)
                    optionElement.dataset.originalBgColor = '#E65100';
                    optionElement.style.fontWeight = 'bold';
                }
                            
                optionElement.addEventListener('click', () => {
                    // Mettre à jour l'affichage avec texte tronqué
                    updateSelectorDisplayText(selector, option.label);
                    
                    // Fermer le menu déroulant
                    if (optionsContainer) {
                        optionsContainer.style.display = 'none';
                    }
                    
                    // Gérer différemment les options spéciales
                    if (option.value === "") {
                        // Ne rien faire pour l'option "Select"
                        return;
                    } else if (['clear-history', 'demo1', 'demo2'].includes(option.value)) {
                        // Pour les options spéciales, utiliser handleRootPersonChange
                        const fakeEvent = {
                            target: { value: option.value }
                        };
                        try {
                            window.handleRootPersonChange(fakeEvent);
                            
                            // Pour 'clear-history', mettre à jour immédiatement le sélecteur
                            if (option.value === 'clear-history') {
                                setTimeout(() => {
                                    replaceRootPersonSelector();
                                }, 100);
                            }
                        } catch (error) {
                            console.error("Erreur lors du changement de personne racine:", error);
                        }
                    } else {
                        // Pour les personnes normales, sélectionner la personne comme racine
                        // Vérifier si nous sommes en mode recherche
                        const isSearchMode = currentMode === 'search';
                        
                        if (isSearchMode) {
                            // Si nous sommes en mode recherche, utiliser selectFoundPerson
                            if (typeof selectFoundPerson === 'function') {
                                selectFoundPerson(option.value);
                            } else {
                                // Fallback si la fonction n'est pas disponible
                                console.log('\n\n\n\n ###################   CALL displayGenealogicTree in updateCustomSelectorOptions 1  ################# ')
                                displayGenealogicTree(option.value, true);
                                
                                // Recharger le sélecteur après un court délai
                                setTimeout(() => {
                                    const currentPerson = state.gedcomData.individuals[option.value];
                                    if (currentPerson) {
                                        updateRootPersonSelector(currentPerson);
                                    }
                                }, 100);
                            }
                        } else {
                            // Si nous sommes en mode normal (historique), simplement afficher l'arbre
                            console.log('\n\n\n\n ###################   CALL displayGenealogicTree in updateCustomSelectorOptions 1  ################# ')
                            displayGenealogicTree(option.value, true);
                            
                            // Désactiver le clignotement
                            if (typeof selector.setBlinking === 'function') {
                                selector.setBlinking(false);
                            }
                        }
                    }
                    
                    // Mettre à jour la valeur du sélecteur
                    selector.value = option.value;
                    
                    // Déclencher l'événement onChange pour les toasts et autres comportements
                    if (typeof selector.onChangeCallback === 'function') {
                        selector.onChangeCallback(option.value);
                    }
                });

                optionsContainer.appendChild(optionElement);
            });
        }
        
        // Mettre à jour la valeur sélectionnée si nécessaire
        if (selector.value && !options.some(opt => opt.value === selector.value)) {
            if (options.length > 0) {
                // Si "Select" est présent, le mettre par défaut
                const selectOption = options.find(opt => opt.value === "");
                if (selectOption) {
                    selector.value = "";
                    updateSelectorDisplayText(selector, "Select");
                } else if (options.length > 0) {
                    selector.value = options[0].value;
                    updateSelectorDisplayText(selector, options[0].label);
                }
            }
        }
    }
    
    // Exposer cette méthode sur le sélecteur
    customSelector.updateOptions = function(options) {
        // Mettre à jour le mode du sélecteur en fonction des options
        const hasSelectOption = options.some(opt => opt.value === "");
        this.setAttribute('data-mode', hasSelectOption ? 'search' : 'history');
        selectorMode = hasSelectOption ? 'search' : 'history';
        
        updateCustomSelectorOptions(this, options);
    };
    
    // Conserver l'ID original
    customSelector.id = 'root-person-results';
    
    // Ajouter la propriété innerHTML pour la compatibilité
    Object.defineProperty(customSelector, 'innerHTML', {
        get: function() {
            return this._innerHTML || '';
        },
        set: function(html) {
            // Sauvegarder la valeur pour le getter
            this._innerHTML = html;
            
            if (html === '') {
                // Cas spécial: vider le sélecteur
                const displayElement = this.querySelector('div span');
                if (displayElement) {
                    displayElement.textContent = '';
                }
                
                // Vider les options
                this.updateOptions([]);
                return;
            }
            
            try {
                // Créer un DOM temporaire pour analyser le HTML
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                
                // Extraire les options
                const options = [];
                const optionElements = tempDiv.querySelectorAll('option');
                
                for (let i = 0; i < optionElements.length; i++) {
                    const option = optionElements[i];
                    if (option.value) {
                        options.push({
                            value: option.value,
                            label: option.textContent
                        });
                    }
                }
                
                // Mettre à jour le sélecteur avec ces options
                if (options.length > 0) {
                    this.updateOptions(options);
                }
            } catch (e) {
                console.error("Erreur lors du traitement de innerHTML:", e);
            }
        }
    });
    
    // Transférer les attributs pour le toast
    customSelector.setAttribute('data-text-key', dataTextKey || 'rootPersonResults');
    customSelector.setAttribute('data-action', dataAction || 'selectionner la personne racine');
    customSelector.setAttribute('title', titleValue || 'selectionner la personne racine');
    
    // Ajouter un gestionnaire d'événements pour le clic
    customSelector.addEventListener('click', function() {
        const message = this.getAttribute('data-action');
        if (message && window.showToast) {
            const key = this.getAttribute('data-text-key');
            if (!window.actionCounters) {
                window.actionCounters = {};
            }
            if (!window.actionCounters[key]) {
                window.actionCounters[key] = 0;
            }
            window.actionCounters[key]++;
            
            const max_count = 3;
            if (window.actionCounters[key] <= max_count) {
                window.showToast(message);
            }
        }
    });
    
    // Remplacer le sélecteur original par le sélecteur personnalisé
    const parentElement = originalSelect.parentElement;
    parentElement.replaceChild(customSelector, originalSelect);
    
    // Ajuster la couleur si nécessaire
    if (originalSelect.style.backgroundColor === 'yellow') {
        customSelector.setBlinking(true, 'yellow');
    }
    
    // Ajouter un gestionnaire d'événements pour déplacer le menu déroulant vers la gauche
    customSelector.addEventListener('click', function(event) {
        // Trouver le conteneur d'options (généralement le deuxième div)
        const optionsContainer = this.querySelector('div:nth-child(2)');
        
        // Attendre un moment pour que le menu soit complètement chargé
        setTimeout(() => {
            if (optionsContainer && window.getComputedStyle(optionsContainer).display !== 'none') {
                // Le menu est ouvert, appliquer le décalage vers la gauche
                const selectorWidth = this.getBoundingClientRect().width;
                const menuWidth = optionsContainer.getBoundingClientRect().width;
                
                // Calculer le décalage (menu plus large que le sélecteur)
                const offset = menuWidth - selectorWidth;
                
                // Appliquer le style pour positionner vers la gauche
                Object.assign(optionsContainer.style, {
                    right: 'auto',
                    transform: `translateX(-${offset}px)`
                });
            }
        }, 10); // Un petit délai pour s'assurer que le menu est ouvert
    });
    
    // IMPORTANT: Appliquer la troncature maintenant pour assurer qu'elle est appliquée à l'ouverture
    const displayElement = customSelector.querySelector('div span');
    if (displayElement && displayElement.textContent) {
        updateSelectorDisplayText(customSelector, displayElement.textContent);
    }
    

    const event = new CustomEvent('rootPersonSelectorUpdated', {
        detail: { 
            selector: customSelector,
            isSearchMode: selectorMode === 'search'
        }
    });
    document.dispatchEvent(event);



    return customSelector;
}

// ====================================
// 3. Version améliorée de updateRootPersonSelector
// ====================================
// Fonction pour mettre à jour le sélecteur de personnes racines 
export function updateRootPersonSelector(person) {
    if (person.name === state.gedcomData.individuals[person.id].name) {
 
        // Si le sélecteur personnalisé n'a pas encore été initialisé, on ne fait rien
        if (!selectorsInitialized) return null;
        
        // Récupérer l'historique des racines depuis le localStorage
        let rootHistory = JSON.parse(localStorage.getItem('rootPersonHistory') || '[]');
        
        // Vérifier si cette personne est déjà dans l'historique
        const existingIndex = rootHistory.findIndex(entry => entry.id === person.id);
        
        // Si la personne n'est pas dans l'historique, l'ajouter
        if (existingIndex === -1) {
            rootHistory.push({
                id: person.id,
                name: person.name.replace(/\//g, '').trim()
            });
            
            // Sauvegarder l'historique mis à jour
            localStorage.setItem('rootPersonHistory', JSON.stringify(rootHistory));
        }
        
        // Plutôt que de mettre à jour le sélecteur existant, forcer sa recréation
        // pour garantir qu'il soit en mode historique
        return replaceRootPersonSelector();

    }
}

// Version corrigée de la fonction setupPaperTextureBackground
function setupPaperTextureBackground(svg) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const defs = svg.append("defs");
    
    // Nettoyer tout fond existant
    svg.selectAll(".background-element").remove();
    
    // Créer un groupe pour le fond
    const bgGroup = svg.append("g")
        .attr("class", "background-element")
        .attr("pointer-events", "none")
        .lower();
    
    // Fond de base avec gradient subtil mais visible
    const bgGradient = defs.append("linearGradient")
        .attr("id", "paper-bg-gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%");
        
    bgGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#f7f7f7");
        
    bgGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#efefef");
    
    bgGroup.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "url(#paper-bg-gradient)");
    
    // Créer une texture de papier visible
    const noisePattern = defs.append("pattern")
        .attr("id", "noise-pattern")
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", 200)
        .attr("height", 200);
    
    // Fond du motif
    noisePattern.append("rect")
        .attr("width", 200)
        .attr("height", 200)
        .attr("fill", "transparent");
    
    // Créer une texture plus visible
    for (let i = 0; i < 5000; i++) {
        const x = Math.random() * 200;
        const y = Math.random() * 200;
        const size = Math.random() * 1.2 + 0.3;
        const opacity = Math.random() * 0.1 + 0.04; // Opacité plus élevée
        
        noisePattern.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", size)
            .attr("fill", i % 5 === 0 ? "#aaaaaa" : "#707070") // Couleurs plus visibles
            .attr("opacity", opacity);
    }
    
    // Ajouter quelques lignes/fibres de papier
    for (let i = 0; i < 50; i++) {
        const x1 = Math.random() * 200;
        const y1 = Math.random() * 200;
        const length = Math.random() * 30 + 10;
        const angle = Math.random() * Math.PI * 2;
        const x2 = x1 + Math.cos(angle) * length;
        const y2 = y1 + Math.sin(angle) * length;
        
        noisePattern.append("line")
            .attr("x1", x1)
            .attr("y1", y1)
            .attr("x2", x2)
            .attr("y2", y2)
            .attr("stroke", "#bbbbbb") // Couleur plus visible
            .attr("stroke-width", 0.7)
            .attr("opacity", 0.4); // Opacité plus élevée
    }
    
    // Appliquer le motif de texture
    bgGroup.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "url(#noise-pattern)")
        .attr("pointer-events", "none");
    
    // Ajouter quelques taches de papier plus grandes
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 40 + 20;
        
        bgGroup.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", size)
            .attr("fill", "#e8e8e8")
            .attr("opacity", Math.random() * 0.2 + 0.1);
    }
    
    // Ajouter une vignette légère
    const vignetteGradient = defs.append("radialGradient")
        .attr("id", "paper-vignette")
        .attr("cx", "50%")
        .attr("cy", "50%")
        .attr("r", "70%")
        .attr("fx", "50%")
        .attr("fy", "50%");
        
    vignetteGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#00000000");
        
    vignetteGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#00000033"); // Plus visible
        
    bgGroup.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "url(#paper-vignette)")
        .attr("pointer-events", "none");
}



/**
 * Crée et affiche un dialogue pour sélectionner une image de fond
 * @param {Function} onSelect - Fonction à appeler avec le chemin de l'image sélectionnée
 */
export function createImageSelectorDialog(onSelect) {
    // Vérifier si le dialogue existe déjà
    if (document.getElementById('image-selector-dialog')) {
        document.getElementById('image-selector-dialog').remove();
    }
    
    // Créer le dialogue
    const dialog = document.createElement('div');
    dialog.id = 'image-selector-dialog';
    dialog.style.position = 'fixed';
    dialog.style.top = '50%';
    dialog.style.left = '50%';
    dialog.style.transform = 'translate(-50%, -50%)';
    dialog.style.backgroundColor = 'white';
    dialog.style.padding = '20px';
    dialog.style.borderRadius = '8px';
    dialog.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    dialog.style.zIndex = '10000';
    dialog.style.maxWidth = '90%';
    dialog.style.maxHeight = '80%';
    dialog.style.overflow = 'auto';
    
    // Titre
    const title = document.createElement('h3');
    title.textContent = 'Sélectionner une image de fond';
    title.style.marginTop = '0';
    title.style.marginBottom = '10px';
    dialog.appendChild(title);
    
    // Bouton de fermeture
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.style.border = 'none';
    closeButton.style.background = 'none';
    closeButton.style.fontSize = '20px';
    closeButton.style.cursor = 'pointer';
    closeButton.onclick = () => dialog.remove();
    dialog.appendChild(closeButton);
    
    // Conteneur pour les images
    const imageContainer = document.createElement('div');
    imageContainer.style.display = 'grid';
    imageContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(120px, 1fr))';
    imageContainer.style.gap = '10px';
    imageContainer.style.marginTop = '15px';
    dialog.appendChild(imageContainer);
    
    
    
    // Option pour télécharger une image personnalisée
    const uploadSection = document.createElement('div');
    uploadSection.style.gridColumn = '1 / -1';
    uploadSection.style.marginTop = '20px';
    uploadSection.style.padding = '10px';
    uploadSection.style.backgroundColor = '#f5f5f5';
    uploadSection.style.borderRadius = '4px';
    imageContainer.appendChild(uploadSection);
    
    const uploadTitle = document.createElement('h4');
    uploadTitle.textContent = 'Télécharger une image';
    uploadTitle.style.marginTop = '0';
    uploadTitle.style.marginBottom = '10px';
    uploadSection.appendChild(uploadTitle);
    
    const uploadInput = document.createElement('input');
    uploadInput.type = 'file';
    uploadInput.accept = 'image/*';
    uploadInput.style.width = '100%';
    uploadInput.style.marginBottom = '10px';
    uploadSection.appendChild(uploadInput);
    
    uploadInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                onSelect(e.target.result);
                dialog.remove();
            };
            reader.readAsDataURL(file);
        }
    });
    
    
    
    
    // Liste des dossiers à explorer
    const folders = [
        'background_images',
        // 'background_images_download'
    ];
    
    // Créer un titre pour chaque dossier
    folders.forEach(folder => {
        const folderTitle = document.createElement('h4');
        // folderTitle.textContent = folder;
        folderTitle.textContent = folder === 'background_images' ? 'Images intégrées' : 'Images téléchargées';
        folderTitle.style.gridColumn = '1 / -1';
        folderTitle.style.marginBottom = '5px';
        folderTitle.style.marginTop = '15px';
        imageContainer.appendChild(folderTitle);
        

        // Simuler une liste d'images car la plupart des serveurs ne permettent pas 
        // de lister le contenu du répertoire
        const potentialImages = [
            'contemporain.jpg',
            'republique.jpg',
            'tree-log.jpg',
            'angelot.jpg',
            'ange.jpg',
            'cupidon.jpg',
            "brick-wall.jpg",
            "small-circles.png",
            "ai-lambris.jpg",
            "crocodile-skin.jpg",
            "ecorce-chene.jpg",
            "bois.jpg",
            "glass.jpg",
            "galets.jpg",
            "circles.jpg",
            "dry-soil.jpg",
            "rock.jpg",
            "traits.jpg",
            "lichen-red.jpg",
            "lichen-blue.jpg",
            "jeans.jpg",
            "ecorce.jpg",
            "dry-ground.jpg",
            "marble.jpg",
            "texture-peiture_colorée.jpg",
            "silk.jpg",
            "elephant-skin.jpg",
            "aluminum-foil.jpg",
            "wood-lambris-vertical.jpg",
            "texture-ciment.jpg",
            "roses.jpg",
            "flowers.png",
            "feuilles.jpg",
            "parquet.jpg"
        ];
        
        // Créer une vignette pour chaque image potentielle
        potentialImages.forEach(imageName => {
            const imagePath = `${folder}/${imageName}`;
            
            // Créer l'élément pour la vignette
            const thumbnailContainer = document.createElement('div');
            thumbnailContainer.style.display = 'flex';
            thumbnailContainer.style.flexDirection = 'column';
            thumbnailContainer.style.alignItems = 'center';
            thumbnailContainer.style.cursor = 'pointer';
            thumbnailContainer.style.padding = '5px';
            thumbnailContainer.style.border = '1px solid #eee';
            thumbnailContainer.style.borderRadius = '4px';
            thumbnailContainer.onclick = () => {
                onSelect(imagePath);
                dialog.remove();
            };
            
            // Image de la vignette
            const thumbnail = document.createElement('img');
            thumbnail.src = imagePath;
            thumbnail.alt = imageName;
            thumbnail.onerror = function() {
                // Remplacer par une image de remplacement ou un message
                this.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"%3E%3Crect width="40" height="40" fill="%23f0f0f0"/%3E%3Ctext x="50%" y="50%" font-family="sans-serif" font-size="10" text-anchor="middle" dominant-baseline="middle" fill="%23999"%3ENon disponible%3C/text%3E%3C/svg%3E';
                label.textContent += " (non disponible)";
                thumbnailContainer.style.opacity = "0.5";
                thumbnailContainer.style.cursor = "default";
                thumbnailContainer.onclick = null; // Désactiver le clic
            };
            
            thumbnail.style.width = '100%';
            thumbnail.style.height = '80px';
            thumbnail.style.objectFit = 'cover';
            thumbnail.style.marginBottom = '5px';
            thumbnail.style.borderRadius = '4px';
            thumbnailContainer.appendChild(thumbnail);
            
            // Nom de l'image
            const label = document.createElement('span');
            label.textContent = imageName.split('.')[0];
            label.style.fontSize = '12px';
            label.style.textAlign = 'center';
            label.style.overflow = 'hidden';
            label.style.textOverflow = 'ellipsis';
            label.style.whiteSpace = 'nowrap';
            label.style.width = '100%';
            thumbnailContainer.appendChild(label);
            
            // Ajouter la vignette au conteneur
            imageContainer.appendChild(thumbnailContainer);
        });

    });
    

    // Ajouter le dialogue au document
    document.body.appendChild(dialog);
    
    // Ajouter une superposition sombre pour le fond
    const overlay = document.createElement('div');
    overlay.id = 'image-selector-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
    overlay.style.zIndex = '9999';
    overlay.onclick = () => {
        dialog.remove();
        overlay.remove();
    };
    document.body.appendChild(overlay);
    
    // Mettre le dialogue au-dessus de l'overlay
    dialog.style.zIndex = '10000';
    
    return dialog;
}



// Définir les textes pour les attributs title (tooltip) et data-action (toast)
export const texts = {
    // Fonction qui retourne le texte selon la langue actuelle

    get zoomIn() {
        return getLocalizedText({
          fr: "Zoom avant",
          en: "Zoom in",
          es: "Acercar",
          hu: "Nagyítás"
        });
      },
      get zoomOut() {
        return getLocalizedText({
          fr: "Zoom arrière",
          en: "Zoom out",
          es: "Alejar",
          hu: "Kicsinyítés"
        });
      },
      get resetZoom() {
        return getLocalizedText({
          fr: "reset de l'affichage",
          en: "Reset view",
          es: "Restablecer vista",
          hu: "Nézet visszaállítása"
        });
      },
      get toggleSpeech() {
        return getLocalizedText({
          fr: "eteindre/allumer le son",
          en: "Toggle sound on/off",
          es: "Activar/desactivar sonido",
          hu: "Hang be/ki kapcsolása"
        });
      },
      get toggleAnimationPause() {
        return getLocalizedText({
          fr: "pause/Play de l'animation",
          en: "Pause/Play animation",
          es: "Pausar/Reproducir animación",
          hu: "Animáció szüneteltetése/lejátszása"
        });
      },
      get openSettingsModal() {
        return getLocalizedText({
          fr: "paramètres",
          en: "Settings",
          es: "Configuración",
          hu: "Beállítások"
        });
      },
      get toggleFullScreen() {
        return getLocalizedText({
          fr: "désactive/active plein écran",
          en: "Toggle fullscreen",
          es: "Activar/desactivar pantalla completa",
          hu: "Teljes képernyő be/ki"
        });
      },
      get processNamesCloudWithDate() {
        return getLocalizedText({
          fr: "visualisation en nuage \n : prénoms / noms / métiers / durée de vie / age de procréation / lieux",
          en: "Cloud visualization: \n first names / surnames / occupations / lifespan / age of procreation / places",
          es: "Visualización en nube: \n nombres / apellidos / ocupaciones / duración de vida / edad de procreación / lugares",
          hu: "Felhő vizualizáció: \n keresztnevek / vezetéknevek / foglalkozások / élettartam / szaporodási kor / helyek"
        });
      },
      get rootPersonSearch() {
        return getLocalizedText({
          fr: "entrer le prénom ou nom ou les premières lettres \n pour rechercher une personne racine et valider",
          en: "enter first or last name or first letters \n to search for a root person and validate",
          es: "introduce nombre o apellido o primeras letras \n para buscar una persona raíz y validar",
          hu: "adja meg a keresztnevet vagy vezetéknevet vagy az első betűket \n a gyökérszemély kereséséhez és érvényesítéséhez"
        });
      },
      get rootPersonResults() {
        return getLocalizedText({
          fr: "selectionner la personne racine",
          en: "select root person",
          es: "seleccionar persona raíz",
          hu: "gyökérszemély kiválasztása"
        });
      },
      get updateGenerations() {
        return getLocalizedText({
          fr: "entrer le nombre maximum de génération à visualiser",
          en: "enter maximum number of generations to display",
          es: "introducir número máximo de generaciones a visualizar",
          hu: "adja meg a megjelenítendő generációk maximális számát"
        });
      },
      get treeMode() {
        return getLocalizedText({
          fr: "choisir le mode de visualisation de l'arbre en ancêtre, descendant ou les 2",
          en: "choose tree visualization mode: ancestors, descendants or both",
          es: "elegir modo de visualización del árbol: ancestros, descendientes o ambos",
          hu: "válassza ki a fa megjelenítési módját: ősök, leszármazottak vagy mindkettő"
        });
      },
      get treeModeAncestors() {
        return getLocalizedText({
          fr: "Affiche les ancêtres de la personne racine",
          en: "Show ancestors of root person",
          es: "Mostrar ancestros de la persona raíz",
          hu: "A gyökérszemély őseinek megjelenítése"
        });
      },
      get treeModeDescendants() {
        return getLocalizedText({
          fr: "Affiche les descendants de la personne racine",
          en: "Show descendants of root person",
          es: "Mostrar descendientes de la persona raíz",
          hu: "A gyökérszemély leszármazottainak megjelenítése"
        });
      },
      get treeModeBoth() {
        return getLocalizedText({
          fr: "Affiche à la fois les ancêtres et les descendants de la personne racine",
          en: "Show both ancestors and descendants of root person",
          es: "Mostrar tanto ancestros como descendientes de la persona raíz",
          hu: "A gyökérszemély őseinek és leszármazottainak megjelenítése"
        });
      },
      get search() {
        return getLocalizedText({
          fr: "recherche d'une personne dans la page courante",
          en: "search for a person in current page",
          es: "buscar una persona en la página actual",
          hu: "személy keresése az aktuális oldalon"
        });
      },
      get prenoms() {
        return getLocalizedText({
          fr: "nombre de prénoms entre 1 et 4, pour optimiser la largueur des cases de l'arbre",
          en: "number of first names between 1 and 4, to optimize the width of tree boxes",
          es: "número de nombres entre 1 y 4, para optimizar el ancho de las casillas del árbol",
          hu: "keresztnevek száma 1 és 4 között, a fa mezőinek szélességének optimalizálásához"
        });
      }
  };



  
  
  // Ajouter cette fonction d'aide pour récupérer le texte dans la langue actuelle
  function getLocalizedText(translations) {
    // Récupérer la langue actuelle depuis la variable globale ou utiliser 'fr' par défaut
    const currentLang = window.CURRENT_LANGUAGE || 'fr';


    // console.log("\n\n\n\n Langue actuelle:", currentLang, "\n\n\n\n");
    
    // Retourner la traduction dans la langue actuelle ou en français par défaut
    return translations[currentLang] || translations['fr'];
  }
  
  // Modifier la fonction applyTextDefinitions pour utiliser les getters dynamiques
  export function applyTextDefinitions() {
    document.querySelectorAll('[data-text-key]').forEach(element => {
      const key = element.getAttribute('data-text-key');
      if (texts[key]) {
        // Les propriétés sont maintenant des getters qui retournent le texte dans la langue actuelle
        element.setAttribute('title', texts[key]);
        element.setAttribute('data-action', texts[key]);
      }
    });
  }






const searchModalTranslations = {
    fr: {
        title: "Recherche avancée",
        nameOption: "par Nom/Prénom",
        placeOption: "par Lieux", 
        occupationOption: "par Profession",
        searchPlaceholder: "🔍Tapez votre recherche...",
        yearStartPlaceholder: "Année début",
        yearEndPlaceholder: "Année fin",
        searchButton: "Search",
        dateFilterLabel: "filtrage<br>par dates",
        helpName: "Recherche dans les noms et prénoms",
        helpPlace: "Recherche dans les lieux de naissance, décès, résidence",
        helpOccupation: "Recherche dans les professions, métiers, titres",
        noSearchTerm: "Veuillez saisir un terme de recherche",
        noResults: "Aucun résultat pour",
        rootPersonSearch: '🔍racine',
        person:'personne',
        found:'trouvée',
        withPlace: 'avec lieux',
        withOccupation: 'avec métiers',
        over: 'sur', 
        pers: 'pers.',
        m:'H',
    },
    en: {
        title: "Advanced Search",
        nameOption: "per Name/First name",
        placeOption: "per Places",
        occupationOption: "per Profession",
        searchPlaceholder: "🔍Type your search...",
        yearStartPlaceholder: "Start year",
        yearEndPlaceholder: "End year", 
        searchButton: "Search",
        dateFilterLabel: "date<br>filtering",
        helpName: "Search in names and first names",
        helpPlace: "Search in birth, death, residence places",
        helpOccupation: "Search in professions, jobs, titles",
        noSearchTerm: "Please enter a search term",
        noResults: "No results for",
        rootPersonSearch: '🔍root',
        person: 'person',
        found: 'found',
        withPlace: 'with places',
        withOccupation: 'with occupations',
        over: 'over',
        pers: 'pers.',
        m: 'M',
    },
    es: {
        title: "Búsqueda avanzada",
        nameOption: "por Nombre/Apellido",
        placeOption: "por Lugares",
        occupationOption: "por Profesión",
        searchPlaceholder: "🔍Escriba su búsqueda...",
        yearStartPlaceholder: "Año inicio",
        yearEndPlaceholder: "Año fin",
        searchButton: "Ir",
        dateFilterLabel: "filtrado<br>por fechas",
        helpName: "Búsqueda en nombres y apellidos",
        helpPlace: "Búsqueda en lugares de nacimiento, muerte, residencia",
        helpOccupation: "Búsqueda en profesiones, trabajos, títulos",
        noSearchTerm: "Por favor ingrese un término de búsqueda",
        noResults: "Sin resultados para",
        rootPersonSearch: '🔍raíz',
        person: 'persona',
        found: 'encontrada',
        withPlace: 'con lugares',
        withOccupation: 'con profesiones',
        over: 'de',
        pers: 'pers.',
        m: 'H',
    },
    hu: {
        title: "Részletes keresés",
        nameOption: "Név/Keresztnév szerint",
        placeOption: "Helyek szerint",
        occupationOption: "Foglalkozás szerint",
        searchPlaceholder: "🔍Írja be a keresést...",
        yearStartPlaceholder: "Kezdő év",
        yearEndPlaceholder: "Befejező év",
        searchButton: "Indul",
        dateFilterLabel: "dátum<br>szűrés",
        helpName: "Keresés nevekben és keresztnevekben",
        helpPlace: "Keresés születési, halálozási, lakóhelyben",
        helpOccupation: "Keresés foglalkozásokban, munkákban, címekben",
        noSearchTerm: "Kérjük, adjon meg egy keresési kifejezést",
        noResults: "Nincs találat a következőre:",
        rootPersonSearch: '🔍gyökér',
        person: 'személy',
        found: 'találat',
        withPlace: 'helyekkel',
        withOccupation: 'foglalkozással',
        over: 'közül',
        pers: 'fő',
        m: 'F',
    }
};


/**
 * Fonction de recherche étendue avec filtrage par dates
 */
export function findPersonsBy(searchTerm, searchType = 'name', startYear = null, endYear = null) {
    if (!state.gedcomData || !state.gedcomData.individuals) {
        return [];
    }
    
    const searchStr = searchTerm.toLowerCase();
    const results = [];
    let personWithDate_counter = 0;
    let personWithOccupation_counter = 0;
    let personWithPlace_counter = 0;
    let foundPpersonWithDate_counter = 0;
    let foundPersonWithOccupation_counter = 0;
    let foundPersonWithPlace_counter = 0;

    let male_counter = 0;
    let foundMale_counter = 0;

    

    Object.values(state.gedcomData.individuals).forEach(person => {

        const matches = [];
        const birthYear = extractYear(person.birthDate);
        const deathYear = extractYear(person.deathDate);
        let marriageYear = null;
        let marriagePlace = null;
        let relevantDate = null; // Pour stocker la date pertinente si trouvée
        let isOccupation = false;
        let isPlace = false;
        let isMale = false;
        // Les personnes ne stockent généralement pas directement leur date de mariage
        // Il faut la récupérer via les familles où elles apparaissent comme conjoint
        if (person.spouseFamilies && person.spouseFamilies.length > 0) {
            // Pour chaque famille où la personne est un conjoint
            person.spouseFamilies.forEach(familyId => {
                const family = state.gedcomData.families[familyId];
                if (family && family.marriageDate) {
                    marriageYear = extractYear(family.marriageDate);
                    marriagePlace = family.marriagePlace; // On peut aussi récupérer le lieu de mariage
                }
            });
        }
        if (birthYear || deathYear || marriageYear) {
            personWithDate_counter++;
        } else {
            const dateInfo = findDateForPerson(person.id);
            if (dateInfo && dateInfo.year) {
                relevantDate = dateInfo.year;
                personWithDate_counter++;
            }
        }
        if (person.sex=='M') {
            male_counter++;
            isMale = true;
        } 


        if (person.occupationFull) {
            personWithOccupation_counter++;
            isOccupation = true;
        }
        if (person.birthPlace || person.deathPlace || person.residPlace1 || person.residPlace2 || person.residPlace3 || marriagePlace) {
            personWithPlace_counter++; 
            isPlace = true;
        }   

        // console.log(" debug before 0 : Recherche pour la personne:", person.name, "avec le terme:", searchTerm, startYear, endYear, birthYear, deathYear, marriageYear);


        // Filtrage par dates si spécifié
        if (startYear || endYear) {

            // Si on a une date de début et que la personne est née avant
            if (startYear && birthYear && (birthYear < startYear)) return;
            
            // Si on a une date de fin et que la personne est née après
            if (endYear && birthYear && (birthYear > endYear)) return;
            
            // filtrer aussi par date de décès
            if (startYear && deathYear && (deathYear < startYear)) return;
            if (endYear && deathYear && (deathYear > endYear)) return;

            // filtrer aussi par date de marriage
            if (startYear && marriageYear && (marriageYear < startYear)) return;
            if (endYear && marriageYear && (marriageYear > endYear)) return;

            // filtrer aussi par relevantDate
            if (startYear && relevantDate && (relevantDate < startYear)) return;
            if (endYear && relevantDate && (relevantDate > endYear)) return;            
        
            // console.log(" debug 0 : date is ok, Recherche pour la personne:", person.name, "avec le terme:", searchTerm, startYear, endYear, birthYear, deathYear, marriageYear, relevantDate);
        }

       
       
        // Recherche par nom
        if (searchType === 'name') {
            // console.log(" debug before :", person);

            const fullName = person.name.toLowerCase().replace(/\//g, '') + ' ' + person.givn.toLowerCase().replace(/\//g, '') + ' ' + person.surn.toLowerCase().replace(/\//g, '');
            const searchStrings = searchStr.split(' ').filter(s => s.trim() !== '');

            if (fullName.includes(searchStr)) {
                matches.push({
                    type: 'name',
                    field: 'Nom',
                    value: person.name.replace(/\//g, '').trim()
                });
                // console.log("debug 0 : Recherche pour la personne:", fullName, person.name, "avec le terme:", searchTerm, startYear, endYear, birthYear, deathYear, marriageYear);
            } else {
                let isMatch = false
                if (fullName.includes(searchStrings[0])) {
                    isMatch = true;
                    if (searchStrings.length > 1 && !fullName.includes(searchStrings[1])) {isMatch = false;}
                    if (searchStrings.length > 2 && !fullName.includes(searchStrings[2]) && isMatch) {isMatch = false;}
                    if (searchStrings.length > 3 && !fullName.includes(searchStrings[3]) && isMatch) {isMatch = false;}
                    if (searchStrings.length > 4 && !fullName.includes(searchStrings[4]) && isMatch) {isMatch = false;}
                    if (isMatch) {
                        matches.push({
                            type: 'name',
                            field: 'Nom',
                            value: person.name.replace(/\//g, '').trim()
                        });
                    }
                //    console.log("debug 1 : Recherche pour la personne:", fullName, person.name, "avec le terme:", searchTerm, startYear, endYear, birthYear, deathYear, marriageYear);
                }
            }

        }
        
        // Recherche par lieu
        else if (searchType === 'place') {
            // Lieux de naissance
            if (person.birthPlace && person.birthPlace.toLowerCase().includes(searchStr)) {
                matches.push({
                    type: 'place',
                    field: 'Lieu de naissance',
                    value: person.birthPlace
                });
            }
            
            // Lieux de décès
            if (person.deathPlace && person.deathPlace.toLowerCase().includes(searchStr)) {
                matches.push({
                    type: 'place',
                    field: 'Lieu de décès',
                    value: person.deathPlace
                });
            }
            
            // Lieux de résidence
            if (person.residPlace1 && person.residPlace1.toLowerCase().includes(searchStr)) {
                matches.push({
                    type: 'place',
                    field: 'Résidence',
                    value: person.residPlace1
                });
            }
            if (person.residPlace2 && person.residPlace2.toLowerCase().includes(searchStr)) {
                matches.push({
                    type: 'place',
                    field: 'Résidence',
                    value: person.residPlace2
                });
            }            
            if (person.residPlace3 && person.residPlace3.toLowerCase().includes(searchStr)) {
                matches.push({
                    type: 'place',
                    field: 'Résidence',
                    value: person.residPlace3
                });
            }
            if (marriagePlace && marriagePlace.toLowerCase().includes(searchStr)) {
                matches.push({
                    type: 'place',
                    field: 'Lieu de mariage',
                    value: marriagePlace
                });
            }

        }
        
        // Recherche par profession
        else if (searchType === 'occupation') {
            if (person.occupationFull && person.occupationFull.toLowerCase().includes(searchStr)) {
                matches.push({
                    type: 'occupation',
                    field: 'Profession',
                    value: person.occupationFull
                });
            }
            
        }
        
        if (matches.length > 0) {
            results.push({
                ...person,
                matches: matches
            });
            if (isOccupation) foundPersonWithOccupation_counter++;
            if (isPlace) foundPersonWithPlace_counter++;
            if (isMale) foundMale_counter++;   

        }
    });

    console.log("\n Recherche sur :", Object.keys(state.gedcomData.individuals).length, ' personnes. ', results.length, ' personnes trouvées.', ' withDate=',personWithDate_counter, ', withOccupation=',personWithOccupation_counter, ', withPlace=',personWithPlace_counter, ', homme=',male_counter,  ', FoundWithOccupation=',foundPersonWithOccupation_counter, ', foundWithPlace=',foundPersonWithPlace_counter, ', foundHomme=',foundMale_counter);

    return {results, personWithDate_counter, personWithOccupation_counter, personWithPlace_counter, male_counter, foundPersonWithOccupation_counter, foundPersonWithPlace_counter, foundMale_counter};
    // return (results);
}

// /**
//  * Extrait l'année d'une date (gère différents formats GEDCOM)
//  */
// function extractYear(dateString) {
//     if (!dateString) return null;
    
//     // Chercher un pattern d'année (4 chiffres)
//     const yearMatch = dateString.match(/\b(\d{4})\b/);
//     return yearMatch ? parseInt(yearMatch[1]) : null;
// }

/**
 * Crée et affiche la modale de recherche
 */
export function openSearchModal() {

    // Vérifier si la modale existe déjà
    let existingModal = document.getElementById('search-modal');
    if (existingModal) {
        existingModal.style.display = 'flex';
        // Vider les champs à la réouverture
        document.getElementById('search-modal-search-input').value = '';
        // document.getElementById('date-start').value = '';
        // document.getElementById('date-end').value = '';
        document.getElementById('search-modal-search-input').focus();
        return;
    }


    // Créer la modale
    const modal = document.createElement('div');
    modal.id = 'search-modal';
    modal.innerHTML = `
        <div class="search-modal-overlay">
            <div class="search-modal-content">
                <div class="search-modal-header">
                    <h3>${searchModalTranslations[window.CURRENT_LANGUAGE].title}</h3>
                    <button class="search-modal-close" onclick="closeSearchModal()">&times;</button>
                </div>
                
                <div class="search-modal-body">

                    <div class="search-type-section">
                        <select id="search-modal-search-type">
                            <option value="name">${searchModalTranslations[window.CURRENT_LANGUAGE].nameOption}</option>
                            <option value="place">${searchModalTranslations[window.CURRENT_LANGUAGE].placeOption}</option>
                            <option value="occupation">${searchModalTranslations[window.CURRENT_LANGUAGE].occupationOption}</option>
                        </select>

                    </div>
                    
                    <div class="search-input-section">
                        <input type="text" id="search-modal-search-input" placeholder="${searchModalTranslations[window.CURRENT_LANGUAGE].searchPlaceholder}">
                        <button id="search-modal-search-button"> ${searchModalTranslations[window.CURRENT_LANGUAGE].searchButton} </button>
                    </div>
                    
                    <div class="date-filter-section">
                        <input type="number" id="date-start" placeholder="${searchModalTranslations[window.CURRENT_LANGUAGE].yearStartPlaceholder}" min="1000" max="2100">
                        <span>- </span>
                        <input type="number" id="date-end" placeholder="${searchModalTranslations[window.CURRENT_LANGUAGE].yearEndPlaceholder}" min="1000" max="2100">
                        <label>${searchModalTranslations[window.CURRENT_LANGUAGE].dateFilterLabel}</label>
                        </div>
                    
                    <div class="search-help">
                        <div id="search-help-text">${searchModalTranslations[window.CURRENT_LANGUAGE].helpName}</div>
                    </div>
                    
                    <div class="search-results" id="search-modal-search-results">
                        <!-- Les résultats apparaîtront ici -->
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Ajouter les styles CSS
    const styles = `
        <style>
        #search-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: flex-start; 
            padding-top: 2px;
            z-index: 10000;
        }
        
        .search-modal-overlay {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: flex-start;  
            padding-top: 2px;
        }
        
        .search-modal-content {
            background: white;
            border-radius: 8px;
            width: 90%;
            max-width: 600px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            max-height: calc(100vh - 5px) !important; /* Utiliser presque toute la hauteur */
            height: auto !important;

        }
        
        .search-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            background: #ff9800;
            color: white;
        }
        
        .search-modal-header h3 {
            margin: 0;
            font-size: 18px;
        }
        
        .search-modal-close {
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
        }
        
        .search-modal-close:hover {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
        }
        
        .search-modal-body {
            padding: 20px;
            max-height: calc(100vh - 100px) !important; /* Ajuster selon la hauteur du header */
            overflow-y: auto !important;
        }
        
        .search-type-section, .search-input-section, .date-filter-section {
            margin-bottom: 15px;
        }
        


        .search-type-section {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .search-type-section label {
            font-weight: bold;
            color: #333;
            white-space: nowrap;
            width: 120px; /* Même largeur que le bouton rechercher */
            text-align: center;
        }   

        #search-modal-search-input {
            width: 200px;
            padding: 4px;
            border: 2px solid #ff9800;
            border-radius: 4px;
            font-size: 14px;
            box-sizing: border-box;
        }        


        #search-modal-search-type {
            width: 200px;
            padding: 4px;
            border: 2px solid #ff9800;
            border-radius: 4px;
            font-size: 14px;
            box-sizing: border-box;
        }


        .search-input-section {
            display: flex;
            gap: 10px;
        }
        
        .date-filter-section {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .date-filter-section label {
            font-weight: bold;
            color: #333;
            white-space: nowrap;
            font-size: 15px;
        }
        
        #date-start, #date-end {
            padding: 4px;
            border: 2px solid #ff9800;
            border-radius: 4px;
            font-size: 14px;
            box-sizing: border-box;
        }

        #date-start {
            margin-left: 0px;
            width: 95px;
        }

        #date-end {
            margin-left: -2px;
            width: 82px;
        }

        
        #search-modal-search-button {
            padding: 4px 4px;
            background: #ff9800;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
        }
        
        #search-modal-search-button:hover {
            background: #f57c00;
        }
        
        .search-help {
            background: #f5f5f5;
            padding: 8px;
            border-radius: 4px;
            margin-bottom: 15px;
            font-size: 13px;
            color: #666;
        }
        
        .search-results {
            overflow-y: auto;
            max-height: calc(100vh - 5px) !important; /* Utiliser presque toute la hauteur */
            height: auto !important;
        }
        
        .result-item {
            padding: 8px 10px;
            margin: 4px 0;
            background: rgba(255, 152, 0, 0.1);
            border-left: 3px solid #ff9800;
            border-radius: 3px;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        
        .result-item:hover {
            background: rgba(255, 152, 0, 0.2);
        }
        
        .result-name {
            font-weight: bold;
            color: #333;
            margin-bottom: 3px;
            font-size: 14px;
        }
        
        .result-info {
            font-size: 11px;
            color: #666;
        }
        
        .result-match {
            display: inline-block;
            background: #ff9800;
            color: white;
            padding: 2px 6px;
            border-radius: 3px;
            margin-right: 8px;
            font-size: 11px;
        }


        /* Styles pour mobile en mode paysage */
        @media screen and (max-height: 500px)  {
            .search-modal-header {
                padding: 5px 10px !important; /* Réduire de 20px à 10px */
            }
            
            .search-modal-header h3 {
                font-size: 16px !important; /* Réduire la taille du titre */
                margin: 0 !important;
            }
            
            .search-modal-body {
                padding: 5px 10px !important; /* Réduire de 20px à 10px */
                max-height: calc(100vh - 60px) !important; /* Ajuster selon la hauteur du header */
            }

            .search-type-section, 
            .search-input-section, 
            .date-filter-section {
                margin-bottom: 4px !important; /* Réduire de 15px à 8px */
            }
            
            .search-help {
                padding: 4px !important; /* Réduire de 8px à 5px */
                margin-bottom: 4px !important; /* Réduire de 15px à 8px */
                font-size: 12px !important;
            }


            #search-modal-search-type {
                -webkit-appearance: none;
                -moz-appearance: none;
                appearance: none;
                background-image: url('data:image/svg+xml;utf8,<svg fill="%23ff9800" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>');
                background-repeat: no-repeat;
                background-position: right 8px center;
                background-size: 16px;
                padding-right: 30px !important;
                border: 2px solid #ff9800 !important;
                border-radius: 6px !important;
                font-size: 16px !important; /* Évite le zoom sur iOS */
            }


        }





        </style>
    `;
    
    // Ajouter les styles au document
    if (!document.getElementById('search-modal-styles')) {
        const styleElement = document.createElement('div');
        styleElement.id = 'search-modal-styles';
        styleElement.innerHTML = styles;
        document.head.appendChild(styleElement);
    }
    
    // Ajouter la modale au document
    document.body.appendChild(modal);
    
    // Configurer les événements
    setupModalEvents();
    
    // Donner le focus au champ de recherche
    setTimeout(() => {
        document.getElementById('search-modal-search-input').focus();
    }, 100);

}

/**
 * Configure les événements de la modale
 */
function setupModalEvents() {

    const searchType = document.getElementById('search-modal-search-type');
    const searchInput = document.getElementById('search-modal-search-input');
    const searchButton = document.getElementById('search-modal-search-button');
    const helpText = document.getElementById('search-help-text');
    
    // Textes d'aide selon le type de recherche
    const helpTexts = {
        'name': searchModalTranslations[window.CURRENT_LANGUAGE].helpName,
        'place': searchModalTranslations[window.CURRENT_LANGUAGE].helpPlace,
        'occupation': searchModalTranslations[window.CURRENT_LANGUAGE].helpOccupation
    };
    
    // Changer le texte d'aide selon le type sélectionné
    searchType.addEventListener('change', function() {
        helpText.textContent = helpTexts[this.value];
        // Vider le champ de recherche quand on change de type
        document.getElementById('search-modal-search-input').value = '';
        document.getElementById('search-modal-search-results').innerHTML = '';
    });

    
    // Recherche en appuyant sur Entrée dans le champ de recherche
    searchInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            performModalSearch();
        }
    });
    
    // Recherche en appuyant sur Entrée dans les champs de dates
    document.getElementById('date-start').addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            performModalSearch();
        }
    });
    
    document.getElementById('date-end').addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            performModalSearch();
        }
    });
    
    // Recherche en cliquant sur le bouton
    searchButton.addEventListener('click', performModalSearch);
    
    // Fermer la modale en cliquant à l'extérieur
    document.getElementById('search-modal').addEventListener('click', function(event) {
        if (event.target === this) {
            closeSearchModal();
        }
    });

    // Gestion spéciale pour les champs de dates en mode paysage mobile
    const dateInputs = [document.getElementById('date-start'), document.getElementById('date-end')];
    const modal = document.getElementById('search-modal');

    dateInputs.forEach(input => {
        input.addEventListener('focus', function() {
            // Détection mobile paysage
            if (window.innerHeight <= 600) {
                modal.style.paddingTop = '5px';
                modal.style.alignItems = 'flex-start';
                
                // Faire défiler vers le haut
                setTimeout(() => {
                    this.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                    });
                }, 300);
            }
        });
        
        input.addEventListener('blur', function() {
            // Restaurer la position normale après un délai
            setTimeout(() => {
                if (window.innerHeight <= 600) {
                    modal.style.paddingTop = '20px';
                }
            }, 300);
        });
    });



    
}

/**
 * Effectue la recherche dans la modale
 */
function performModalSearch() {
    const searchType = document.getElementById('search-modal-search-type').value;
    const searchTerm = document.getElementById('search-modal-search-input').value.trim();
    const startYear = document.getElementById('date-start').value;
    const endYear = document.getElementById('date-end').value;
    const resultsContainer = document.getElementById('search-modal-search-results');
    
    // if (!searchTerm) {
    //     resultsContainer.innerHTML = '<div style="text-align: center; color: #666; padding: 10px;">Veuillez saisir un terme de recherche</div>';
    //     return;
    // }
    
    // Convertir les années en nombres ou null
    const startYearNum = startYear ? parseInt(startYear) : null;
    const endYearNum = endYear ? parseInt(endYear) : null;
    
    // Effectuer la recherche avec filtrage par dates
    const res = findPersonsBy(searchTerm, searchType, startYearNum, endYearNum);
    const results = res.results;

    
    // Afficher les résultats
    if (results.length === 0) {
        const dateInfo = (startYearNum || endYearNum) ? 
            ` (période: ${startYearNum || '?'}-${endYearNum || '?'})` : '';
        resultsContainer.innerHTML = `<div style="text-align: center; color: #666; padding: 10px;">${searchModalTranslations[window.CURRENT_LANGUAGE].noResults} "${searchTerm}"${dateInfo}</div>`;
        return;
    }
    

    // Construire l'HTML des résultats
    let resultsHTML = '';


    // console.log("\n\n\n\n DEBUG : Results ", results, "\n\n\n\n");


    results.forEach(person => {
        // Pour le type 'name', ne pas afficher le badge "Nom:"
        let matchInfo = '';
        if (searchType !== 'name') {
            matchInfo = person.matches.map(match => 
                `<span class="result-match">${match.field}: ${match.value}</span>`
            ).join('');
        }
        
        // Ajouter les dates avec icônes
        const birthYear = extractYear(person.birthDate);
        const deathYear = extractYear(person.deathDate);
        let marriageYear = null;
        let relevantDate = null; // Pour stocker la date pertinente si trouvée
        // Les personnes ne stockent généralement pas directement leur date de mariage
        // Il faut la récupérer via les familles où elles apparaissent comme conjoint
        if (person.spouseFamilies && person.spouseFamilies.length > 0) {
            // Pour chaque famille où la personne est un conjoint
            person.spouseFamilies.forEach(familyId => {
                const family = state.gedcomData.families[familyId];
                if (family && family.marriageDate) {
                    marriageYear = extractYear(family.marriageDate);
                }
            });
        }
        if (!birthYear && !deathYear && !marriageYear) {
            const dateInfo0 = findDateForPerson(person.id);
            if (dateInfo0 && dateInfo0.year) {
                relevantDate = dateInfo0.year;
            }
        }


        let dateInfo = '';
        
        if (birthYear) {
            dateInfo = ` (👶 ${birthYear})`;
        } else if (deathYear) {
            dateInfo = ` (✝️ ${deathYear})`;
        } else if (marriageYear) {
            dateInfo = ` (💍 ${marriageYear})`;
        } else if (relevantDate) {
            dateInfo = ` (~ ${relevantDate})`;
        } 
        
        resultsHTML += `
            <div class="result-item" onclick="selectPersonFromModal('${person.id}')">
                <div class="result-name">${person.name.replace(/\//g, '').trim()}${dateInfo}</div>
                ${matchInfo ? `<div class="result-info">${matchInfo}</div>` : ''}
            </div>
        `;
    });


    resultsContainer.innerHTML = resultsHTML;


    // Mettre à jour le label avec le nombre de personnes trouvées
    const helpText = document.getElementById('search-help-text');
    if (helpText) {
        helpText.textContent = `${results.length} ${searchModalTranslations[window.CURRENT_LANGUAGE].person}${results.length > 1 ? 's' : ''} 
        ${searchModalTranslations[window.CURRENT_LANGUAGE].found}${results.length > 1 ? 's' : ''} 
        (${searchModalTranslations[window.CURRENT_LANGUAGE].m}=${res.foundMale_counter}, 
        ${searchModalTranslations[window.CURRENT_LANGUAGE].withPlace}=${res.foundPersonWithPlace_counter}, 
        ${searchModalTranslations[window.CURRENT_LANGUAGE].withOccupation}=${res.foundPersonWithOccupation_counter}) 
        ${searchModalTranslations[window.CURRENT_LANGUAGE].over} ${Object.keys(state.gedcomData.individuals).length} 
        ${searchModalTranslations[window.CURRENT_LANGUAGE].pers} 
        (${searchModalTranslations[window.CURRENT_LANGUAGE].m}=${res.male_counter}, 
        ${searchModalTranslations[window.CURRENT_LANGUAGE].withPlace}=${res.personWithPlace_counter}, 
        ${searchModalTranslations[window.CURRENT_LANGUAGE].withOccupation}=${res.personWithOccupation_counter})`;
    }


}

/**
 * Sélectionne une personne depuis la modale
 */
window.selectPersonFromModal = function(personId) {
    // Fermer la modale
    closeSearchModal();
    
    // Utiliser la fonction existante selectFoundPerson ou displayGenealogicTree
    if (typeof selectFoundPerson === 'function') {
        selectFoundPerson(personId);
    } else {
        console.log('\n\n\n\n ###################   CALL displayGenealogicTree from modal ################# ');
        if (state.isRadarEnabled) {
            displayGenealogicTree(personId, false, false, false, 'WheelAncestors');
        } else {
            displayGenealogicTree(personId, true, false);
        }
    }
};

/**
 * Ferme la modale de recherche
 */
window.closeSearchModal = function() {
    const modal = document.getElementById('search-modal');
    if (modal) {
        modal.style.display = 'none';
    }
};

/**
 * Modifier la fonction d'événement du champ de recherche existant
 */
export function setupSearchFieldModal() {
    const searchField = document.getElementById('root-person-search');
    if (searchField) {
        // Remplacer l'événement focus existant
        searchField.addEventListener('focus', function(event) {
            event.preventDefault();
            this.blur(); // Enlever le focus
            openSearchModal();
        });
        
        // Empêcher la saisie directe
        searchField.addEventListener('keydown', function(event) {
            event.preventDefault();
            openSearchModal();
        });
        
        // Ajouter un placeholder informatif
        searchField.placeholder = searchModalTranslations[window.CURRENT_LANGUAGE].rootPersonSearch;
        searchField.style.cursor = "pointer";
    }
}



