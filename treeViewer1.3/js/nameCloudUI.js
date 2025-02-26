import { state, displayPersonDetails, showToast } from './main.js';
import { NameCloud, setupResizeListeners } from './nameCloudRenderer.js';
import { nameCloudState } from './nameCloud.js';
import { startAncestorAnimation } from './treeAnimation.js';
import { buildAncestorTree, buildDescendantTree } from './treeOperations.js';


function createModalContainer() {
    const modal = document.createElement('div');
    modal.className = 'modal-container';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';
    modal.style.padding = '0';
    modal.style.margin = '0';
    modal.style.overflow = 'hidden';

    return modal;
}

function createMainContainer() {
    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    container.style.borderRadius = '10px';
    container.style.padding = '0';
    container.style.position = 'relative';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.overflow = 'hidden';
    
    return container;
}

function createCloseButton() {
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '1px';
    closeButton.style.right = '1px';
    closeButton.style.background = 'rgba(255, 255, 255, 0.7)';
    closeButton.style.border = '1px solid #ccc';
    closeButton.style.borderRadius = '50%';
    closeButton.style.width = '30px';
    closeButton.style.height = '30px';
    closeButton.style.fontSize = '24px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.display = 'flex';
    closeButton.style.justifyContent = 'center';
    closeButton.style.alignItems = 'center';
    closeButton.style.zIndex = '1001';
    closeButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    
    return closeButton;
}

function createNameCloudContainer() {
    const nameCloudContainer = document.createElement('div');
    nameCloudContainer.style.flexGrow = '1';
    nameCloudContainer.style.overflow = 'hidden';
    nameCloudContainer.style.margin = '0';
    nameCloudContainer.style.padding = '0';
    nameCloudContainer.style.position = 'relative';
    nameCloudContainer.style.marginTop = '-20px';
    nameCloudContainer.id = 'name-Cloud-Container';
    return nameCloudContainer;
}

// function createTypeSelect(config) {
//     const typeSelect = document.createElement('select');
//     typeSelect.style.padding = '0px';
//     typeSelect.style.minWidth = '10px';
//     typeSelect.style.backgroundColor = '#4361ee';
//     typeSelect.style.color = 'white';
//     typeSelect.style.border = '1px solid #3f51b5';
//     typeSelect.style.borderRadius = '3px';
//     typeSelect.style.appearance = 'none';
//     typeSelect.style.cursor = 'pointer';
//     typeSelect.style.fontSize = '14px';
//     typeSelect.style.fontWeight = 'bold';
//     typeSelect.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
    
//     typeSelect.style.backgroundImage = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'8\' height=\'8\' fill=\'white\'><polygon points=\'0,0 3,0 1.5,2\'/></svg>")';
//     typeSelect.style.backgroundRepeat = 'no-repeat';
//     typeSelect.style.backgroundPosition = 'top 0px right -13px';
//     typeSelect.style.paddingRight = '0px';
    
//     typeSelect.innerHTML = `
//         <option value="prenoms">Prénom</option>
//         <option value="noms">Nom</option>
//         <option value="professions">Métier</option>
//         <option value="duree_vie">Vie</option>
//         <option value="age_procreation">Procréat</option>
//         <option value="lieux">Lieux</option>                    
//     `;
//     typeSelect.value = config.type;
    
//     typeSelect.addEventListener('mouseover', () => {
//         typeSelect.style.backgroundColor = '#3a56e8';
//     });
//     typeSelect.addEventListener('mouseout', () => {
//         typeSelect.style.backgroundColor = '#4361ee';
//     });

    
//     // Générer un ID unique pour ce sélecteur
//     const selectId = `type-select-${Date.now()}`;
//     typeSelect.id = selectId;
    
//     // Style pour les options, incluant l'état au survol
//     const style = document.createElement('style');
//     style.textContent = `
//         #${selectId} option {
//             background-color: #38b000;
//             color: white;
//         }
        
//         #${selectId} option:hover {
//             background-color: #2e9800 !important;
//             color: white !important;
//         }
        
//         #${selectId} option:checked {
//             background-color: #38b000;
//             color: white;
//         }
//     `;
//     document.head.appendChild(style);


//     return typeSelect;
// }

function createScopeSelect(config) {
    const scopeSelect = document.createElement('select');
    scopeSelect.style.padding = '0px';
    scopeSelect.style.minWidth = '10px';
    scopeSelect.style.backgroundColor = '#38b000';
    scopeSelect.style.color = 'white';
    scopeSelect.style.border = '1px solid #2d8600';
    scopeSelect.style.borderRadius = '3px';
    scopeSelect.style.appearance = 'none';
    scopeSelect.style.cursor = 'pointer';
    scopeSelect.style.fontSize = '14px';
    scopeSelect.style.fontWeight = 'bold';
    scopeSelect.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
    
    scopeSelect.style.backgroundImage = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'8\' height=\'8\' fill=\'white\'><polygon points=\'0,0 3,0 1.5,2\'/></svg>")';
    scopeSelect.style.backgroundRepeat = 'no-repeat';
    scopeSelect.style.backgroundPosition = 'top 0px right -13px';
    scopeSelect.style.paddingRight = '0px';

    scopeSelect.innerHTML = `
        <option value="all">Tout</option>
        <option value="ancestors">Ascend</option>
        <option value="descendants">Descend</option>
    `;
    scopeSelect.value = config.scope || 'all';
    
    scopeSelect.addEventListener('mouseover', () => {
        scopeSelect.style.backgroundColor = '#2e9800';
    });
    scopeSelect.addEventListener('mouseout', () => {
        scopeSelect.style.backgroundColor = '#38b000';
    });
    
    return scopeSelect;
}



function createTypeSelect(config) {
    // Déterminer si nous sommes sur mobile
    // const isMobile = Math.min(window.innerWidth, window.innerHeight) < 600;
    
    // Si nous ne sommes pas sur mobile, utiliser la version d'origine
    if (!nameCloudState.mobilePhone) {
        return createStandardTypeSelect(config);
    }
    
    console.log("##########  New Typeselct for MOBILE ##########")

    // Définir les options et les valeurs correspondantes
    const typeOptions = ['Prénom', 'Nom', 'Métier', 'Vie', 'Procréat', 'Lieux'];
    const typeValues = ['prenoms', 'noms', 'professions', 'duree_vie', 'age_procreation', 'lieux'];
    
    // Trouver l'index de l'option actuellement sélectionnée
    const currentIndex = typeValues.indexOf(config.type);
    const currentOption = typeOptions[currentIndex >= 0 ? currentIndex : 0];
    
    // Couleurs pour le sélecteur personnalisé
    const colors = {
        main: '#4361ee',    // Bleu pour le sélecteur
        options: '#38b000', // Vert pour les options
        hover: '#2e9800',   // Vert légèrement plus foncé au survol
        selected: '#266e00' // Vert encore plus foncé pour l'option sélectionnée
    };
    
    // Conteneur principal
    const selectContainer = document.createElement('div');
    selectContainer.style.position = 'relative';
    selectContainer.style.width = '75px';
    selectContainer.style.height = '25px';
    
    // Élément qui simule le select
    const selectDisplay = document.createElement('div');
    selectDisplay.style.padding = '4px 6px';
    selectDisplay.style.border = '1px solid #3f51b5';
    selectDisplay.style.borderRadius = '3px';
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
    selectDisplay.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
    
    // Texte affiché
    const displayText = document.createElement('span');
    displayText.textContent = currentOption;
    
    // Icône de flèche
    const arrow = document.createElement('span');
    arrow.innerHTML = '▼';
    arrow.style.fontSize = '8px';
    arrow.style.marginLeft = '4px';
    
    selectDisplay.appendChild(displayText);
    selectDisplay.appendChild(arrow);
    
    // Conteneur des options (initialement masqué)
    const optionsContainer = document.createElement('div');
    optionsContainer.style.position = 'absolute';
    optionsContainer.style.top = '100%';
    optionsContainer.style.left = '0';
    optionsContainer.style.width = '100%';
    optionsContainer.style.backgroundColor = '#fff';
    optionsContainer.style.border = '1px solid #ccc';
    optionsContainer.style.borderRadius = '4px';
    optionsContainer.style.marginTop = '2px';
    optionsContainer.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    optionsContainer.style.maxHeight = '200px';
    optionsContainer.style.overflowY = 'auto';
    optionsContainer.style.zIndex = '1000';
    optionsContainer.style.display = 'none';
    
    // Valeur cachée simulant un vrai select
    const hiddenSelect = document.createElement('select');
    hiddenSelect.style.display = 'none';
    
    // Créer les options dans le select caché
    typeValues.forEach((value, index) => {
        const option = document.createElement('option');
        option.value = value;
        option.text = typeOptions[index];
        if (value === config.type) option.selected = true;
        hiddenSelect.appendChild(option);
    });
    
    // Ajouter les options visuelles
    typeOptions.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.style.padding = '8px 10px';
        optionElement.style.cursor = 'pointer';
        optionElement.style.backgroundColor = colors.options;
        optionElement.style.color = 'white';
        optionElement.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
        optionElement.textContent = option;
        
        // Effet de survol
        optionElement.addEventListener('mouseover', () => {
            optionElement.style.backgroundColor = colors.hover;
        });
        
        optionElement.addEventListener('mouseout', () => {
            optionElement.style.backgroundColor = option === displayText.textContent ? 
                colors.selected : colors.options;
        });
        
        // Sélection d'une option
        optionElement.addEventListener('click', () => {
            displayText.textContent = option;
            hiddenSelect.value = typeValues[index];
            optionsContainer.style.display = 'none';
            arrow.innerHTML = '▼';
            
            // Mettre à jour les couleurs des options
            Array.from(optionsContainer.children).forEach(opt => {
                opt.style.backgroundColor = colors.options;
            });
            optionElement.style.backgroundColor = colors.selected;
            
            // Déclencher un événement de changement pour simuler un select natif
            const event = new Event('change');
            hiddenSelect.dispatchEvent(event);
        });
        
        // Mettre en évidence l'option actuellement sélectionnée
        if (option === currentOption) {
            optionElement.style.backgroundColor = colors.selected;
        }
        
        optionsContainer.appendChild(optionElement);
    });
    
    // Toggle du dropdown
    selectDisplay.addEventListener('click', () => {
        const isVisible = optionsContainer.style.display === 'block';
        optionsContainer.style.display = isVisible ? 'none' : 'block';
        arrow.innerHTML = isVisible ? '▼' : '▲';
    });
    
    // Fermer le dropdown si on clique ailleurs
    document.addEventListener('click', (event) => {
        if (!selectContainer.contains(event.target)) {
            optionsContainer.style.display = 'none';
            arrow.innerHTML = '▼';
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
            const index = typeValues.indexOf(value);
            if (index >= 0) {
                displayText.textContent = typeOptions[index];
            }
        }
    });
    
    selectContainer.addEventListener('mouseover', () => {
        selectDisplay.style.backgroundColor = '#3a56e8';
    });
    
    selectContainer.addEventListener('mouseout', () => {
        selectDisplay.style.backgroundColor = '#4361ee';
    });
    
    return selectContainer;
}

// Fonction pour créer le select standard (non-mobile)
function createStandardTypeSelect(config) {
    const typeSelect = document.createElement('select');
    typeSelect.style.padding = '0px';
    typeSelect.style.minWidth = '10px';
    typeSelect.style.backgroundColor = '#4361ee';
    typeSelect.style.color = 'white';
    typeSelect.style.border = '1px solid #3f51b5';
    typeSelect.style.borderRadius = '3px';
    typeSelect.style.appearance = 'none';
    typeSelect.style.cursor = 'pointer';
    typeSelect.style.fontSize = '14px';
    typeSelect.style.fontWeight = 'bold';
    typeSelect.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
    
    typeSelect.style.backgroundImage = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'8\' height=\'8\' fill=\'white\'><polygon points=\'0,0 3,0 1.5,2\'/></svg>")';
    typeSelect.style.backgroundRepeat = 'no-repeat';
    typeSelect.style.backgroundPosition = 'top 0px right -13px';
    typeSelect.style.paddingRight = '0px';
    
    typeSelect.innerHTML = `
        <option value="prenoms">Prénom</option>
        <option value="noms">Nom</option>
        <option value="professions">Métier</option>
        <option value="duree_vie">Vie</option>
        <option value="age_procreation">Procréat</option>
        <option value="lieux">Lieux</option>                    
    `;
    typeSelect.value = config.type;
    
    typeSelect.addEventListener('mouseover', () => {
        typeSelect.style.backgroundColor = '#3a56e8';
    });
    typeSelect.addEventListener('mouseout', () => {
        typeSelect.style.backgroundColor = '#4361ee';
    });

    // Générer un ID unique pour ce sélecteur
    const selectId = `type-select-${Date.now()}`;
    typeSelect.id = selectId;
    
    // Style pour les options, incluant l'état au survol
    const style = document.createElement('style');
    style.textContent = `
        #${selectId} option {
            background-color: #38b000;
            color: white;
        }
        
        #${selectId} option:hover {
            background-color: #2e9800 !important;
            color: white !important;
        }
        
        #${selectId} option:checked {
            background-color: #38b000;
            color: white;
        }
    `;
    document.head.appendChild(style);

    return typeSelect;
}







function createRootPersonSelect() {
    const rootPersonSelect = document.createElement('select');
    rootPersonSelect.style.padding = '5px';
    rootPersonSelect.style.width = '100%';
    rootPersonSelect.style.display = 'none';

    const rootPersons = Object.values(state.gedcomData.individuals);
    rootPersons.sort((a, b) => a.name.localeCompare(b.name));
    rootPersons.forEach(person => {
        const option = document.createElement('option');
        option.value = person.id;
        option.textContent = person.name.replace(/\//g, '').trim();
        rootPersonSelect.appendChild(option);
    });

    if (state.rootPersonId) {
        rootPersonSelect.value = state.rootPersonId;
    }

    return rootPersonSelect;
}

function createRootPersonSearchContainer(rootPersonSelect, generateNameCloud) {
    // const container = document.createElement('div');
    // container.style.display = 'none';
    // container.style.position = 'relative';
    // container.style.marginLeft = '-10px';
    // container.style.display = 'flex';
    // container.style.width = 'auto';
    // container.style.alignSelf = 'flex-start';
    // container.style.zIndex = '10';
    // container.style.flexDirection = 'column';
    // container.style.alignItems = 'flex-start';

    // const label = document.createElement('label');
    // label.textContent = 'Personne racine';
    // label.style.fontSize = '12px';
    // label.style.marginBottom = '3px';

    // const searchWrapper = document.createElement('div');
    // searchWrapper.style.display = 'flex';
    // searchWrapper.style.gap = '5px';

    // const searchInput = document.createElement('input');
    // searchInput.type = 'text';
    // searchInput.placeholder = 'Rechercher racine';
    // searchInput.style.padding = '3px';
    // searchInput.style.width = '120px';

    // const searchButton = document.createElement('button');
    // searchButton.textContent = '🔍';
    // searchButton.style.padding = '3px 5px';


    const container = document.createElement('div');
    container.style.display = 'none'; // Caché par défaut
    container.style.position = 'relative';
    container.style.marginLeft = '5px'; // Changé de -7px à 5px pour le coller à gauche du bouton OK
    container.style.display = 'flex';
    container.style.width = 'auto';
    container.style.alignSelf = 'flex-start';
    container.style.zIndex = '10';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'flex-start'; // S'assure que tout est aligné à gauche

    const label = document.createElement('label');
    label.textContent = 'Personne racine';
    label.style.fontSize = '12px';
    label.style.marginBottom = '2px';
    label.style.textAlign = 'left'; // Assurez-vous que le texte est aligné à gauche

    const searchWrapper = document.createElement('div');
    searchWrapper.style.display = 'flex';
    searchWrapper.style.gap = '5px';
    searchWrapper.style.width = '100%'; // Assure que le wrapper prend toute la largeur disponible
    searchWrapper.style.height = '25px'; // Hauteur réduite

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Rechercher racine';
    searchInput.style.padding = '2px 3px'; // Padding réduit
    searchInput.style.width = '120px';
    searchInput.style.height = '22px'; // Hauteur réduite


    const searchButton = document.createElement('button');
    searchButton.textContent = '🔍';
    searchButton.style.padding = '2px 5px'; // Padding réduit
    searchButton.style.height = '22px'; // Hauteur réduite



    const resultsSelect = document.createElement('select');
    resultsSelect.style.display = 'none';
    resultsSelect.style.position = 'absolute';
    resultsSelect.style.top = '100%';
    resultsSelect.style.left = '0';
    resultsSelect.style.width = '100%';
    resultsSelect.style.zIndex = '1000';

    function normalizeString(str) {
        return str.toLowerCase()
            .replace(/[éèêë]/g, 'e')
            .replace(/[àâä]/g, 'a')
            .replace(/[îï]/g, 'i')
            .replace(/[ôö]/g, 'o')
            .replace(/[ûüù]/g, 'u')
            .replace(/ç/g, 'c');
    }

    function searchRootPerson() {
        const searchStr = normalizeString(searchInput.value);
        
        resultsSelect.innerHTML = '<option value="">Select</option>';
        resultsSelect.style.display = 'none';
        
        resultsSelect.style.textAlign = 'left';
        resultsSelect.style.backgroundColor = '#4361ee';
        resultsSelect.style.color = 'white';
        resultsSelect.style.border = '1px solid #3f51b5';
        resultsSelect.style.borderRadius = '4px';
        resultsSelect.style.appearance = 'none';
        resultsSelect.style.cursor = 'pointer';
        resultsSelect.style.fontSize = '14px';
        resultsSelect.style.fontWeight = 'bold';
        resultsSelect.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
        
        resultsSelect.style.backgroundImage = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'8\' height=\'8\' fill=\'white\'><polygon points=\'0,0 3,0 1.5,2\'/></svg>")';
        resultsSelect.style.backgroundRepeat = 'no-repeat';
        resultsSelect.style.backgroundPosition = 'top 0px left 5px';
        resultsSelect.style.paddingLeft = '0px';

        if (!searchStr) return;
    
        const matchedPersons = Object.values(state.gedcomData.individuals)
            .filter(person => {
                const fullName = normalizeString(person.name.replace(/\//g, ''));
                return fullName.includes(searchStr);
            });
    
        if (matchedPersons.length > 0) {
            matchedPersons.forEach(person => {
                const option = document.createElement('option');
                option.value = person.id;
                option.textContent = person.name.replace(/\//g, '').trim();
                resultsSelect.appendChild(option);
            });
            
            resultsSelect.style.display = 'block';
            
            resultsSelect.style.backgroundColor = '#FF6D00';
            resultsSelect.style.border = '1px solid #E65100';
        } else {
            alert('Aucune personne trouvée');
        }
    }

    searchButton.addEventListener('click', searchRootPerson);
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            searchRootPerson();
        }
    });

    resultsSelect.addEventListener('change', () => {
        const selectedPersonId = resultsSelect.value;
        if (selectedPersonId) {
            resultsSelect.style.animation = 'none';
            resultsSelect.style.backgroundColor = 'orange';
            rootPersonSelect.value = selectedPersonId;
            generateNameCloud();
        }
    });

    searchWrapper.appendChild(searchInput);
    searchWrapper.appendChild(searchButton);

    container.appendChild(label);
    container.appendChild(searchWrapper);
    container.appendChild(resultsSelect);
    container.appendChild(rootPersonSelect);

    return {
        container: container,
        rootPersonSelect: rootPersonSelect
    };
}

// function createDateInput(label, defaultValue, width = '55px') {
//     const container = document.createElement('div');
//     container.style.display = 'flex';
//     container.style.flexDirection = 'column';
//     container.style.alignItems = 'center';
    
//     const labelElement = document.createElement('div');
//     labelElement.innerHTML = label;
//     labelElement.style.fontSize = '12px';
//     labelElement.style.marginBottom = '3px';

//     const input = document.createElement('input');
//     input.type = 'number';
//     input.style.width = width;
//     input.style.padding = '0px';
//     input.style.height = '25px';
//     input.value = defaultValue;
//     input.step = '100';

//     // Gestion de l'incrément/décrément manuel
//     input.addEventListener('keydown', (e) => {
//         if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
//             e.preventDefault();
//             const currentValue = parseInt(input.value) || 0;
//             const newValue = e.key === 'ArrowUp' ? currentValue + 100 : currentValue - 100;
//             input.value = newValue;
//         }
//     });

//     container.appendChild(labelElement);
//     container.appendChild(input);

//     return { container, input };
// }











function createDateInput(label, defaultValue, width = '55px') {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    
    const labelElement = document.createElement('div');
    labelElement.innerHTML = label;
    labelElement.style.fontSize = '12px';
    labelElement.style.marginBottom = '3px';

    // Déterminer si nous sommes sur mobile
    // const nameCloud.mobilePhone = Math.min(window.innerWidth, window.innerHeight) < 600;
    
    if (nameCloudState.mobilePhone) {
        // Créer un bouton qui ouvrira un sélecteur mobile-friendly
        const dateButton = document.createElement('button');
        dateButton.textContent = defaultValue;
        dateButton.style.width = '70px';
        dateButton.style.padding = '5px';
        dateButton.style.fontSize = '14px';
        dateButton.style.border = '1px solid #ccc';
        dateButton.style.borderRadius = '4px';
        dateButton.style.backgroundColor = 'white';
        dateButton.style.cursor = 'pointer';
        
        // Input caché pour stocker la valeur
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.value = defaultValue;
        
        // Événement pour ouvrir le sélecteur
        dateButton.addEventListener('click', () => {
            showYearPickerModal(hiddenInput.value, (selectedYear) => {
                hiddenInput.value = selectedYear;
                dateButton.textContent = selectedYear;
                
                // Déclencher un événement de changement
                const event = new Event('change');
                hiddenInput.dispatchEvent(event);
            });
        });
        
        container.appendChild(labelElement);
        container.appendChild(dateButton);
        container.appendChild(hiddenInput);
        
        return { container, input: hiddenInput };
    } else {
        // Version desktop - sélecteur numérique standard
        const input = document.createElement('input');
        input.type = 'number';
        input.style.width = '57px';
        input.style.padding = '0px';
        input.style.height = '25px';
        input.value = defaultValue;
        input.step = '100';
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                const currentValue = parseInt(input.value) || 0;
                const newValue = e.key === 'ArrowUp' ? currentValue + 100 : currentValue - 100;
                input.value = newValue;
            }
        });
        
        container.appendChild(labelElement);
        container.appendChild(input);
        
        return { container, input };
    }
}

// Fonction pour afficher la modale de sélection d'année

function showYearPickerModal(initialYear, onSelect) {
    // Supprimer toute modale existante
    const existingModal = document.getElementById('year-picker-modal');
    if (existingModal) {
        document.body.removeChild(existingModal);
    }
    
    // Créer la modale
    const modal = document.createElement('div');
    modal.id = 'year-picker-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '2000';
    
    const content = document.createElement('div');
    content.style.backgroundColor = 'white';
    content.style.padding = '20px';
    content.style.borderRadius = '10px';
    content.style.width = '80%';
    content.style.maxWidth = '300px';
    content.style.textAlign = 'center';
    content.style.maxHeight = '70vh';
    content.style.overflowY = 'auto';
    
    // Titre
    const title = document.createElement('h3');
    title.textContent = 'Sélectionner une année';
    title.style.marginTop = '0';
    title.style.marginBottom = '15px';
    
    // Conteneur des boutons d'année
    const yearSelector = document.createElement('div');
    yearSelector.style.display = 'flex';
    yearSelector.style.flexDirection = 'column';
    yearSelector.style.maxHeight = '300px';
    yearSelector.style.overflow = 'auto';
    yearSelector.style.margin = '10px 0';
    
    // Boutons d'actions
    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.justifyContent = 'space-between';
    actions.style.marginTop = '15px';
    
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Annuler';
    cancelButton.style.padding = '10px 20px';
    cancelButton.style.border = '1px solid #ccc';
    cancelButton.style.borderRadius = '5px';
    cancelButton.style.backgroundColor = '#f0f0f0';
    cancelButton.style.cursor = 'pointer';
    
    cancelButton.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    actions.appendChild(cancelButton);
    
    // Fonction pour afficher les siècles
    function showCenturies() {
        yearSelector.innerHTML = '';
        
        // Générer les boutons par siècle
        const centuries = [1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000];
        const currentCentury = Math.floor(initialYear / 100) * 100;
        
        centuries.forEach(century => {
            const centuryButton = document.createElement('button');
            centuryButton.textContent = `${century} - ${century + 99}`;
            centuryButton.style.margin = '5px';
            centuryButton.style.padding = '10px';
            centuryButton.style.border = '1px solid #ccc';
            centuryButton.style.borderRadius = '5px';
            centuryButton.style.fontSize = '16px';
            centuryButton.style.width = '100%';
            centuryButton.style.cursor = 'pointer';
            centuryButton.style.backgroundColor = century <= initialYear && initialYear < century + 100 ? '#e0e0e0' : 'white';
            
            centuryButton.addEventListener('click', () => {
                showDecadesForCentury(century);
            });
            
            yearSelector.appendChild(centuryButton);
        });
    }
    
    // Fonction pour afficher les décennies d'un siècle
    function showDecadesForCentury(century) {
        yearSelector.innerHTML = '';
        
        // Bouton de retour
        const backButton = document.createElement('button');
        backButton.textContent = '← Retour aux siècles';
        backButton.style.margin = '5px';
        backButton.style.padding = '10px';
        backButton.style.border = '1px solid #ccc';
        backButton.style.borderRadius = '5px';
        backButton.style.fontSize = '16px';
        backButton.style.width = '100%';
        backButton.style.cursor = 'pointer';
        backButton.style.backgroundColor = '#f8f8f8';
        
        backButton.addEventListener('click', () => {
            showCenturies();
        });
        
        yearSelector.appendChild(backButton);
        
        // Générer les décennies
        for (let decade = century; decade < century + 100; decade += 10) {
            const decadeButton = document.createElement('button');
            decadeButton.textContent = `${decade} - ${decade + 9}`;
            decadeButton.style.margin = '5px';
            decadeButton.style.padding = '10px';
            decadeButton.style.border = '1px solid #ccc';
            decadeButton.style.borderRadius = '5px';
            decadeButton.style.fontSize = '16px';
            decadeButton.style.width = '100%';
            decadeButton.style.cursor = 'pointer';
            decadeButton.style.backgroundColor = decade <= initialYear && initialYear < decade + 10 ? '#e0e0e0' : 'white';
            
            decadeButton.addEventListener('click', () => {
                showYearsForDecade(decade, century);
            });
            
            yearSelector.appendChild(decadeButton);
        }
    }
    
    // Fonction pour afficher les années d'une décennie
    function showYearsForDecade(decade, century) {
        yearSelector.innerHTML = '';
        
        // Bouton de retour
        const backButton = document.createElement('button');
        backButton.textContent = '← Retour aux décennies';
        backButton.style.margin = '5px';
        backButton.style.padding = '10px';
        backButton.style.border = '1px solid #ccc';
        backButton.style.borderRadius = '5px';
        backButton.style.fontSize = '16px';
        backButton.style.width = '100%';
        backButton.style.cursor = 'pointer';
        backButton.style.backgroundColor = '#f8f8f8';
        
        backButton.addEventListener('click', () => {
            showDecadesForCentury(century);
        });
        
        yearSelector.appendChild(backButton);
        
        // Générer les années
        for (let year = decade; year < decade + 10; year++) {
            const yearButton = document.createElement('button');
            yearButton.textContent = year;
            yearButton.style.margin = '5px';
            yearButton.style.padding = '10px';
            yearButton.style.border = '1px solid #ccc';
            yearButton.style.borderRadius = '5px';
            yearButton.style.fontSize = '16px';
            yearButton.style.width = '100%';
            yearButton.style.cursor = 'pointer';
            yearButton.style.backgroundColor = year === parseInt(initialYear) ? '#e0e0e0' : 'white';
            
            yearButton.addEventListener('click', () => {
                onSelect(year);
                document.body.removeChild(modal);
            });
            
            yearSelector.appendChild(yearButton);
        }
    }
    
    // Afficher initialement les siècles
    content.appendChild(title);
    content.appendChild(yearSelector);
    content.appendChild(actions);
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Afficher les siècles au démarrage
    showCenturies();
    
    // Ajouter un gestionnaire d'événement pour fermer la modale avec Echap
    const handleEscapeKey = (e) => {
        if (e.key === 'Escape') {
            document.body.removeChild(modal);
            document.removeEventListener('keydown', handleEscapeKey);
        }
    };
    document.addEventListener('keydown', handleEscapeKey);
}





















function setupModalEvents(modal, closeButton, generateNameCloud) {
    // Événement pour le bouton Fermer
    closeButton.addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    // Événement pour la touche Échap
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            document.body.removeChild(modal);
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

// Fonction pour mettre à jour le texte du titre
export function updateTitleText(element, cfg) {
    let titleText = '';
    if (cfg.type === 'prenoms') {
        titleText = `${nameCloudState.totalWords} Prénoms`;
    } else if (cfg.type === 'noms') {
        titleText = `${nameCloudState.totalWords} Noms`;
    } else if (cfg.type === 'professions') {
        titleText = `${nameCloudState.totalWords} Métiers`;
    } else if (cfg.type === 'duree_vie') {
        titleText = `${nameCloudState.totalWords} Durées de vie `;
    } else if (cfg.type === 'age_procreation') {
        titleText = `${nameCloudState.totalWords} Ages de procréation`;
    } else {
        titleText = `${nameCloudState.totalWords} Lieux entre ${cfg.startDate} et ${cfg.endDate}`;
    }
    
    if (!nameCloudState.mobilePhone || window.innerWidth > 600) 
        titleText = titleText + ` entre ${cfg.startDate} et ${cfg.endDate}`;
    else
        // titleText = titleText + ` <span style="font-size: 0.8em">entre ${cfg.startDate} et ${cfg.endDate}</span>`;
        titleText = ` <span style="font-size: 0.7em">` + titleText + `</span> <span style="font-size: 0.6em">entre ${cfg.startDate} et ${cfg.endDate}</span>`;


    if (nameCloudState.placedWords < nameCloudState.totalWords) {
        if (!nameCloudState.mobilePhone || window.innerWidth > 600)
            titleText = titleText + ` <span style="font-size: 0.6em; color: red">(${nameCloudState.placedWords} mots placés)</span>`;
        else
            titleText = titleText + ` <span style="font-size: 0.5em; color: red">(${nameCloudState.placedWords} mots placés)</span>`;
        // element.innerHTML = titleText; // Utiliser innerHTML au lieu de textContent
    } 
    // else {
    //     element.textContent = titleText;
    // }

    element.innerHTML = titleText;

    // element.textContent = titleText;
}

function showNameCloud(nameData, config) {
    const modal = createModalContainer();
    const container = createMainContainer();
    const closeButton = createCloseButton();
    const nameCloudContainer = createNameCloudContainer();

    const optionsContainer = document.createElement('div');
    optionsContainer.style.display = 'flex';
    optionsContainer.style.flexDirection = 'column';
    optionsContainer.style.alignItems = 'center';
    optionsContainer.style.padding = '5px';
    optionsContainer.style.backgroundColor = 'transparent';
    optionsContainer.style.position = 'absolute';
    optionsContainer.style.top = '0';
    optionsContainer.style.left = '0';
    optionsContainer.style.right = '0';
    optionsContainer.style.zIndex = '10';

    const typeSelect = createTypeSelect(config);
    const scopeSelect = createScopeSelect(config);
    const rootPersonSelect = createRootPersonSelect();

    // Modification ici pour utiliser config.startDate et config.endDate
    const { container: startDateContainer, input: startDateInput } = createDateInput('début', config.startDate || 1500);
    const { container: endDateContainer, input: endDateInput } = createDateInput('fin', config.endDate || new Date().getFullYear());

    const showButton = document.createElement('button');
    showButton.innerHTML = '✓';
    showButton.style.padding = '0';
    showButton.style.backgroundColor = '#4CAF50';
    showButton.style.color = 'white';
    showButton.style.border = 'none';
    showButton.style.borderRadius = '50%';
    showButton.style.width = '23px';
    showButton.style.height = '23px';
    showButton.style.position = 'relative';
    showButton.style.marginLeft = '-8px';
    showButton.style.transform = 'translateY(-4px)';
    showButton.style.fontSize = '16px';
    showButton.style.cursor = 'pointer';
    showButton.style.display = 'flex';
    showButton.style.justifyContent = 'center';
    showButton.style.alignItems = 'center';
    showButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    showButton.title = 'Valider';

    // Modification pour le conteneur de personne racine
    // const rootPersonContainer = createRootPersonSearchContainer(rootPersonSelect, () => {
    //     generateNameCloud();
    // });

    const { container: rootPersonContainer, rootPersonSelect: finalRootPersonSelect } = 
    createRootPersonSearchContainer(rootPersonSelect, () => {
        generateNameCloud();
    });


    rootPersonContainer.style.marginLeft = '-7px';
    rootPersonContainer.style.marginTop = '3px';

    function updateRootPersonVisibility() {
        const isRootPersonNeeded = ['ancestors', 'descendants'].includes(scopeSelect.value);
        rootPersonContainer.style.display = isRootPersonNeeded ? 'flex' : 'none';
    }
    scopeSelect.addEventListener('change', updateRootPersonVisibility);
    updateRootPersonVisibility();

    // Titre
    const titleElement = document.createElement('div');
    titleElement.style.fontSize = '22px';
    titleElement.style.fontWeight = 'bold';
    titleElement.id = 'name-cloud-title';
    titleElement.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
    titleElement.style.padding = '2px 10px';
    titleElement.style.borderRadius = '4px';
    titleElement.style.marginTop = '2px'; //'5px';
    titleElement.style.textAlign = 'center';
    titleElement.style.position = 'relative';
    titleElement.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
    titleElement.style.zIndex = '15'; // Z-index plus élevé pour superposer sur le sélecteur

    // Définir le texte du titre
    nameCloudState.totalWords = nameData.length;

    updateTitleText(titleElement, config);
    
    // function updateTitleText() {
    //     const totalWords = nameData.length;
    //     const isMobile = Math.min(window.innerWidth, window.innerHeight) < 600;
        
    //     let titleText = '';
        
    //     if (config.type === 'prenoms') {
    //         titleText = `${totalWords} Prénoms`;
    //     } else if (config.type === 'noms') {
    //         titleText = `${totalWords} Noms`;
    //     } else if (config.type === 'professions') {
    //         titleText = `${totalWords} Métiers`;
    //     } else if (config.type === 'duree_vie') {
    //         titleText = `${totalWords} Durées de vie`;
    //     } else if (config.type === 'age_procreation') {
    //         titleText = `${totalWords} Ages de procréation`;
    //     } else if (config.type === 'lieux') {
    //         titleText = `${totalWords} Lieux`;
    //     }
        
    //     if (!isMobile || window.innerWidth > 600) {
    //         titleText += ` entre ${startDateInput.value} et ${endDateInput.value}`;
    //     } else {
    //         titleText = `<span style="font-size: 0.7em">${titleText}</span> <span style="font-size: 0.6em">entre ${startDateInput.value} et ${endDateInput.value}</span>`;
    //     }
        
    //     titleElement.innerHTML = titleText;
    // }

    // // Appeler updateTitleText initialement
    // updateTitleText();

    function generateNameCloud() {
        const newConfig = {
            type: typeSelect.value,
            startDate: parseInt(startDateInput.value),
            endDate: parseInt(endDateInput.value),
            scope: scopeSelect.value,
            // rootPersonId: scopeSelect.value !== 'all' ? rootPersonSelect.value : null
            rootPersonId: scopeSelect.value !== 'all' ? finalRootPersonSelect.value : null
        };

        // Mettre à jour le titre
        updateTitleText(titleElement, newConfig);

        // Nettoyer le conteneur
        nameCloudContainer.innerHTML = '';

        // Générer le nuage de mots
        processNamesCloudWithDate(newConfig, nameCloudContainer);
    }

    // Ajouter les écouteurs d'événements
    typeSelect.addEventListener('change', generateNameCloud);
    scopeSelect.addEventListener('change', generateNameCloud);
    startDateInput.addEventListener('change', generateNameCloud);
    endDateInput.addEventListener('change', generateNameCloud);
    showButton.addEventListener('click', generateNameCloud);

    // Assemblage du conteneur
    const leftContainer = document.createElement('div');
    leftContainer.style.display = 'flex';
    leftContainer.style.gap = '10px';
    leftContainer.appendChild(typeSelect);
    leftContainer.appendChild(scopeSelect);

    const dateContainer = document.createElement('div');
    dateContainer.style.display = 'flex';
    dateContainer.style.gap = '10px';
    dateContainer.appendChild(startDateContainer);
    dateContainer.appendChild(endDateContainer);

    const mainOptionsContainer = document.createElement('div');
    mainOptionsContainer.style.display = 'flex';
    mainOptionsContainer.style.gap = '10px';
    mainOptionsContainer.style.alignItems = 'flex-end';

    mainOptionsContainer.appendChild(leftContainer);
    mainOptionsContainer.appendChild(dateContainer);
    mainOptionsContainer.appendChild(showButton);

    // const bottomContainer = document.createElement('div');
    // bottomContainer.style.display = 'flex';
    // bottomContainer.style.justifyContent = 'space-between';
    // bottomContainer.style.alignItems = 'center';
    // bottomContainer.style.width = '100%';
    // bottomContainer.style.gap = '10px';

    const bottomContainer = document.createElement('div');
    bottomContainer.style.display = 'flex';
    bottomContainer.style.justifyContent = 'flex-start'; // Changé de 'space-between' à 'flex-start'
    bottomContainer.style.alignItems = 'center';
    bottomContainer.style.width = '100%';
    bottomContainer.style.gap = '10px'; 




    bottomContainer.appendChild(mainOptionsContainer);
    bottomContainer.appendChild(rootPersonContainer);

    optionsContainer.appendChild(bottomContainer);
    optionsContainer.appendChild(titleElement);

    container.appendChild(closeButton);
    container.appendChild(nameCloudContainer);
    container.appendChild(optionsContainer);
    modal.appendChild(container);
    document.body.appendChild(modal);



    // // Gestion du redimensionnement
    // function handleResize() {
    //     if (nameCloudContainer.children.length > 0) {
    //         generateNameCloud();
    //     }
    // }

    // window.addEventListener('resize', handleResize);

    // // Événement de fermeture
    // closeButton.addEventListener('click', () => {
    //     // Retirer l'écouteur de redimensionnement
    //     window.removeEventListener('resize', handleResize);
    //     document.body.removeChild(modal);
    // });



    // // Configuration des événements
    setupModalEvents(modal, closeButton, generateNameCloud);
    typeSelect.addEventListener('change', generateNameCloud);
    scopeSelect.addEventListener('change', generateNameCloud);
    showButton.addEventListener('click', generateNameCloud);



    // Générer initialement le nuage de mots
    generateNameCloud();


    // Configurer les écouteurs d'événements pour les changements de taille d'écran
    setupResizeListeners();


    // Définir le texte du titre
    updateTitleText(titleElement, config);



    return modal;
}

export const createNameCloudUI = {
    renderInContainer(nameData, config, containerElement) {
        if (containerElement) {
            // Utilisez createNameCloud de nameCloudRenderer.js
            // const NameCloudElement = createNameCloud(nameData, config);
            
            // // Utilisez ReactDOM pour rendre l'élément
            // const root = ReactDOM.createRoot(containerElement);
            // root.render(NameCloudElement);

            const root = ReactDOM.createRoot(containerElement);
            root.render(React.createElement(NameCloud, { nameData: nameData, config: config }));



        }
    },

    showModal(nameData, config) {
        showNameCloud(nameData, config);
    }
};

