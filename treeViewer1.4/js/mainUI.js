
// Fonction pour remplacer les sélecteurs standard par des sélecteurs personnalisés
import { createCustomSelector, createOptionsFromLists } from './UIutils.js';
import { state, displayGenealogicTree } from './main.js';
import { nameCloudState } from './nameCloud.js';
import { selectFoundPerson } from './eventHandlers.js';

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

// Fonction pour remplacer le sélecteur TreeMode
function replaceTreeModeSelector() {
    const originalSelect = document.getElementById('treeMode');
    if (!originalSelect) return;
    
    // Récupérer les attributs data-* et title de l'élément original
    const dataAction = originalSelect.getAttribute('data-action');
    const dataTextKey = originalSelect.getAttribute('data-text-key');
    const titleValue = originalSelect.getAttribute('title');
    
    // Définir les options et les valeurs correspondantes
    const typeOptions = ['Ascd', 'Asc.', 'Desd', 'Desc.', 'A+D']; 
    const typeOptionsExpanded = ['Ascendants directs', 'Ascendants + fratrie', 'Descendants directs', 'Descendants + conjoints', 'Ascend+Descend'];          
    const typeValues = ['directAncestors', 'ancestors', 'directDescendants', 'descendants', 'both'];
    
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

// ====================================
// 1. Modifications dans mainUI.js
// ====================================

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
        


        let textDemo1, textDemo2;
        if (state.treeOwner === 2 ) { 
            textDemo1 = '--- démo Clou du spectacle ---';
            textDemo2 = '--- démo Spain ---';
        } else { 
            textDemo1 = '--démo Costaud la Planche --';
            textDemo2 = '--démo on descend tous de lui--'; 
        }

        // Ajouter les options pour les démos    
        options.push({ value: 'demo1', label: textDemo1 });
        options.push({ value: 'demo2', label: textDemo2 });



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
            width: '60px',
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
                    displayGenealogicTree(value, true);
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