
// Fonction pour remplacer les sélecteurs standard par des sélecteurs personnalisés
import { createCustomSelector, createOptionsFromLists } from './UIutils.js';
import { state, displayGenealogicTree, showToast } from './main.js';
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
        'background_images_download'
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
        
        // Tenter de charger les images
        // fetch(`/${folder}/`)
        //     .then(response => {
                // Si le dossier existe et est accessible
                // if (response.ok) {
                    // Simuler une liste d'images car la plupart des serveurs ne permettent pas 
                    // de lister le contenu du répertoire
                    const potentialImages = [
                        'antiquite.jpg',
                        'bourbons.jpg',
                        'capetiens.jpg',
                        'carolingiens.jpg',
                        'contemporain.jpg',
                        'empire.jpg',
                        'merovingiens.jpg',
                        'republique.jpg',
                        'restauration.jpg',
                        'revolution.jpg',
                        'valois.jpg'
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
            //     } else {
            //         // Si le dossier n'est pas accessible
            //         const errorMessage = document.createElement('p');
            //         errorMessage.textContent = `Dossier ${folder} non accessible`;
            //         errorMessage.style.gridColumn = '1 / -1';
            //         errorMessage.style.color = '#999';
            //         imageContainer.appendChild(errorMessage);
            //     }
            // })
            // .catch(error => {
            //     console.error(`Erreur lors de l'accès au dossier ${folder}:`, error);
            //     const errorMessage = document.createElement('p');
            //     errorMessage.textContent = `Erreur lors de l'accès au dossier ${folder}`;
            //     errorMessage.style.gridColumn = '1 / -1';
            //     errorMessage.style.color = 'red';
            //     imageContainer.appendChild(errorMessage);
            // });
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

/**
 * Crée et ajoute un sélecteur de fond d'écran dans la modal des paramètres
 * @export
 */
export function initBackgroundSelector() {
    // Importer la fonction createImageSelectorDialog
    import('./mainUI.js').then(module => {
        // La fonction est déjà disponible dans ce scope, mais nous l'importons 
        // pour être sûrs qu'elle est définie quand elle sera utilisée
        if (typeof module.createImageSelectorDialog !== 'function') {
            console.warn("Fonction createImageSelectorDialog non disponible");
        }
    });
    
    // Vérifier si la section existe déjà
    if (document.getElementById('background-selector-section')) return;
    
    // Créer une nouvelle section pour le sélecteur de fond
    const section = document.createElement('div');
    section.className = 'settings-section';
    section.id = 'background-selector-section';
    section.style.marginBottom = '15px'; // Réduit l'espacement
    
    // Ajouter un titre avec style compact
    const heading = document.createElement('h3');
    heading.textContent = 'Fond d\'écran';
    heading.style.marginTop = '0';
    heading.style.marginBottom = '5px'; // Réduit l'espacement
    section.appendChild(heading);
    
    // Options de fond d'écran disponibles
    const backgroundOptions = [
        { value: 'none', label: 'Aucun' },
        { value: 'customImage', label: 'Image personnalisée...' }, // Nouvelle option
        // Styles artistiques
        { value: 'pollock', label: 'Pollock' },
        { value: 'kandinsky', label: 'Kandinsky' },
        { value: 'miro', label: 'Miró' },
        // Arbres et nature
        { value: 'treeBranches', label: 'Branches d\'arbre' },
        { value: 'fallingLeaves', label: 'Feuilles tombantes' },
        { value: 'growingTree', label: 'Arbre qui pousse' },
        { value: 'treeRings', label: 'Anneaux d\'arbre' },
        { value: 'fractal', label: 'Fractal' },
        // Textures et motifs de base
        { value: 'parchment', label: 'Parchemin' },
        { value: 'grid', label: 'Grille' },
        { value: 'paperTexture', label: 'Texture papier' },
        { value: 'simpleBackground', label: 'Dégradé simple' },
        { value: 'curvedLines', label: 'Lignes courbes' },
        { value: 'organicPattern', label: 'Motif organique' },
        { value: 'artDeco', label: 'Art Déco' }
    ];
    
    // Style plus compact: Label et sélecteur sur la même ligne
    const controlRow = document.createElement('div');
    controlRow.style.display = 'flex';
    controlRow.style.alignItems = 'center';
    controlRow.style.marginBottom = '5px'; // Réduit l'espacement
    
    // Créer un label pour le sélecteur
    const label = document.createElement('label');
    label.setAttribute('for', 'background-select');
    label.textContent = 'Style:';
    label.style.marginRight = '10px';
    label.style.minWidth = '50px';
    controlRow.appendChild(label);
    
    // Créer le sélecteur personnalisé
    const customSelector = createCustomSelector({
        options: backgroundOptions,
        selectedValue: localStorage.getItem('preferredBackground') || 'treeBranches', // Valeur sauvegardée ou par défaut
        colors: {
            main: '#9C27B0',    // Violet pour le sélecteur principal
            options: '#9C27B0', // Violet pour les options
            hover: '#7B1FA2',   // Violet plus foncé au survol
            selected: '#4A148C' // Violet encore plus foncé pour l'option sélectionnée
        },
        dimensions: {
            width: '170px',
            height: '25px', // Plus petit pour être plus compact
            dropdownWidth: '220px'
        },
        padding: {
            display: { x: 8, y: 3 }, // Padding vertical réduit
            options: { x: 10, y: 5 } // Padding vertical réduit pour les options
        },
        arrow: {
            position: 'right',
            size: 6,
            offset: { x: -10, y: 0 }
        },
        onChange: (value) => {
            // Traitement spécial pour l'option d'image personnalisée
            if (value === 'customImage') {
                // Récupérer la valeur actuelle pour restauration en cas d'annulation
                const currentBg = localStorage.getItem('preferredBackground') || 'treeBranches';
                
                // Ouvrir le sélecteur d'image
                import('./mainUI.js').then(module => {
                    const createImageSelectorDialog = module.createImageSelectorDialog;
                    if (typeof createImageSelectorDialog === 'function') {
                        createImageSelectorDialog((imagePath) => {
                            // Sauvegarder le chemin de l'image
                            localStorage.setItem('customImagePath', imagePath);
                            // Définir le type de fond sur "customImage"
                            localStorage.setItem('preferredBackground', 'customImage');
                            // Appliquer le fond
                            applyBackground('customImage');
                        });
                    } else {
                        console.error("Fonction createImageSelectorDialog non disponible");
                        // Restaurer l'ancienne valeur
                        customSelector.value = currentBg;
                        if (window.showToast) {
                            window.showToast("Erreur: Sélecteur d'image non disponible", 3000);
                        }
                    }
                }).catch(error => {
                    console.error("Erreur lors du chargement du module mainUI:", error);
                    // Restaurer l'ancienne valeur
                    customSelector.value = currentBg;
                });
            } else {
                // Pour les autres types de fond, procéder normalement
                applyBackground(value);
                
                // Sauvegarder la préférence dans localStorage
                localStorage.setItem('preferredBackground', value);
            }
        },
        // Style particulier pour l'option d'image personnalisée
        customizeOptionElement: (optionElement, option) => {
            if (option.value === 'customImage') {
                optionElement.style.fontStyle = 'italic';
            }
        }
    });
    
    // Donner un ID au sélecteur
    customSelector.id = 'background-select';
    
    // Ajouter le sélecteur au conteneur
    controlRow.appendChild(customSelector);
    section.appendChild(controlRow);
    
    // Ajouter une indication du chemin d'image actuel si une image personnalisée est sélectionnée
    const customImagePath = localStorage.getItem('customImagePath');
    if (customImagePath && localStorage.getItem('preferredBackground') === 'customImage') {
        const pathInfo = document.createElement('div');
        pathInfo.style.fontSize = '12px';
        pathInfo.style.color = '#666';
        pathInfo.style.marginTop = '5px';
        pathInfo.style.overflowX = 'hidden';
        pathInfo.style.textOverflow = 'ellipsis';
        pathInfo.style.whiteSpace = 'nowrap';
        
        // Extraire le nom du fichier du chemin complet
        const fileName = customImagePath.split('/').pop();
        pathInfo.textContent = `Image: ${fileName}`;
        
        section.appendChild(pathInfo);
    }
    
    // Ajouter la section au modal des paramètres
    const settingsContent = document.getElementById('settings-content');
    if (settingsContent) {
        // Ajouter au début de la modal
        if (settingsContent.firstChild) {
            settingsContent.insertBefore(section, settingsContent.firstChild);
        } else {
            settingsContent.appendChild(section);
        }
        
        // Rendre tous les sections de la modale plus compactes
        const allSections = settingsContent.querySelectorAll('.settings-section');
        allSections.forEach(sec => {
            sec.style.marginBottom = '15px'; // Réduire l'espacement vertical entre les sections
            
            // Réduire l'espacement pour les titres h3
            const title = sec.querySelector('h3');
            if (title) {
                title.style.marginTop = '0';
                title.style.marginBottom = '5px';
            }
            
            // Réduire l'espacement pour les boutons
            const buttons = sec.querySelectorAll('button');
            buttons.forEach(btn => {
                btn.style.marginTop = '5px';
                btn.style.padding = '5px 10px';
            });
            
            // Réduire l'espacement pour les inputs
            const inputs = sec.querySelectorAll('input, select');
            inputs.forEach(input => {
                input.style.marginTop = '3px';
                input.style.marginBottom = '3px';
            });
        });
    }
    
    // Charger la préférence sauvegardée
    const savedBackground = localStorage.getItem('preferredBackground');
    if (savedBackground) {
        customSelector.value = savedBackground;
        // Appliquer le fond sauvegardé
        setTimeout(() => applyBackground(savedBackground), 100);
    }
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