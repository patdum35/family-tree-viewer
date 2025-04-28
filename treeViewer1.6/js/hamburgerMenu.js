
import { state } from './main.js';
import { createCustomSelector, createOptionsFromLists } from './UIutils.js';

  // Variables pour garder une référence aux éléments
  let hamburgerMenu, sideMenu, menuOverlay;

  
  // Créer les éléments du menu
  function createMenuElements() {
    // Injecter les styles nécessaires
    injectStyles();
    
    // Créer le bouton hamburger
    hamburgerMenu = document.createElement('button');
    hamburgerMenu.id = 'hamburger-menu';
    hamburgerMenu.className = 'hamburger-menu';
    hamburgerMenu.title = 'Menu principal';
    hamburgerMenu.style.display = 'none'; // Caché par défaut
    
    // Créer les trois barres du hamburger
    for (let i = 0; i < 3; i++) {
      const span = document.createElement('span');
      hamburgerMenu.appendChild(span);
    }
    
    // Créer l'overlay
    menuOverlay = document.createElement('div');
    menuOverlay.id = 'menu-overlay';
    menuOverlay.className = 'menu-overlay';
    
    // Créer le menu latéral
    sideMenu = document.createElement('div');
    sideMenu.id = 'side-menu';
    sideMenu.className = 'side-menu';
    sideMenu.style.display = 'block'; // Modifié pour être visible initialement
    
    // Ajouter le titre du menu
    const menuTitle = document.createElement('div');
    menuTitle.className = 'menu-title';
    menuTitle.textContent = 'Menu de l\'arbre';
    sideMenu.appendChild(menuTitle);
    
    // Créer les sections du menu
    createDisplaySection();
    createRootSection();
    createModeSection();
    createNameCloudSection();
    createAudioSection();
    createSettingsSection();
    createSearchSection();
    
    // Ajouter les éléments au DOM
    document.body.appendChild(hamburgerMenu);
    document.body.appendChild(menuOverlay);
    document.body.appendChild(sideMenu);
    
    // Ajouter les gestionnaires d'événements
    hamburgerMenu.addEventListener('click', function(event) {
      event.preventDefault();
      event.stopPropagation();
      toggleMenu();
    });
    
    menuOverlay.addEventListener('click', function() {
      toggleMenu(false);
    });
    
    // Configurer la fermeture du menu sur mobile
    setupMobileMenuClosing();
    
    // Observer les changements de boutons
    setupButtonSync();
    
    state.menuHamburgerInitialized = true;
    console.log("Menu hamburger initialisé avec succès");
  }
  
// tableau de couleurs très pâles pour les sections
  const sectionBackgroundColors = [
    '#f9f9ff', // Bleu très pâle
    '#f9fff9', // Vert très pâle
    '#fff9f9', // Rouge très pâle
    '#fffaf0', // Jaune très pâle
    '#faf0ff'  // Violet très pâle
  ];

  // Fonction pour créer une section de menu
  function createSection(title, index = 0) {
    const container = document.createElement('div');
    container.className = 'menu-section';

    // Appliquer une couleur de fond pâle différente selon l'index
    const colorIndex = index % sectionBackgroundColors.length;
    container.style.backgroundColor = sectionBackgroundColors[colorIndex];
    container.style.borderRadius = '5px'; // Coins légèrement arrondis
    container.style.margin = '5px 0';     // Marge entre les sections
    
    const heading = document.createElement('h3');
    heading.textContent = title;
    container.appendChild(heading);
    
    const content = document.createElement('div');
    content.className = 'menu-section-content';
    container.appendChild(content);
    
    return { container, content };
  }

  // Créer la section Navigation
  function createDisplaySection() {
    const section = createSection('Affichage', 0);  // Index 0
    
    const buttons = [
      { onclick: 'zoomIn()', title: 'Zoom avant', text: '➕' },
      { onclick: 'zoomOut()', title: 'Zoom arrière', text: '➖' },
      { onclick: 'resetZoom()', title: 'Réinitialiser la vue', text: '🏠' },
      { onclick: 'toggleFullScreen()', title: 'Plein écran', text: '⛶' }
    ];
    
    buttons.forEach(buttonData => {
      const button = document.createElement('button');
      button.setAttribute('onclick', buttonData.onclick);
      button.title = buttonData.title;
      
      const span = document.createElement('span');
      span.textContent = buttonData.text;
      // span.style.fontSize = '20px'; // Taille encore plus grande pour les symboles
      button.appendChild(span);
      
      section.content.appendChild(button);
    });
    
    sideMenu.appendChild(section.container);
  }

  // Créer la section Root avec des placeholders pour les sélecteurs
  function createRootSection() {
    const section = createSection('Racine', 1);  // Index 1
    section.content.style.flexDirection = 'column';
    
    // Créer un div pour contenir le sélecteur de recherche racine
    const rootSearchDiv = document.createElement('div');
    rootSearchDiv.id = 'menu-root-search-container';
       
    // Ajouter un espace pour le champ de texte (sera remplacé)
    const rootSearchPlaceholder = document.createElement('div');
    rootSearchPlaceholder.id = 'menu-root-person-search-placeholder';
    rootSearchPlaceholder.style.width = '100%';
    rootSearchPlaceholder.style.margin = '5px 0';
    rootSearchDiv.appendChild(rootSearchPlaceholder);
    
    section.content.appendChild(rootSearchDiv);
    
    // Créer un div pour contenir le sélecteur de résultats
    const rootResultsDiv = document.createElement('div');
    rootResultsDiv.id = 'menu-root-results-container';
    
    // Créer un placeholder pour le sélecteur personnalisé
    const rootResultsPlaceholder = document.createElement('div');
    rootResultsPlaceholder.id = 'menu-root-person-results-placeholder';
    rootResultsPlaceholder.style.width = '100%';
    rootResultsPlaceholder.style.margin = '5px 0';
    rootResultsDiv.appendChild(rootResultsPlaceholder);
    
    section.content.appendChild(rootResultsDiv);
        
    sideMenu.appendChild(section.container);
  }

  // Créer la section Recherche a
  function createSearchSection() {
    const section = createSection('Recherche dans l\'arbre', 2);  // Index 2
    section.content.style.flexDirection = 'column';
     
    // Champ de recherche dans l'arbre
    const searchDiv = document.createElement('div');
    searchDiv.id = 'menu-search-container';
    
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.id = 'menu-search';
    searchInput.placeholder = '🔍nom';
    searchInput.setAttribute('oninput', 'searchTree(this.value)');
    searchInput.style.width = '60%';
    searchInput.style.color = '#000';
    searchInput.style.fontSize = '13px'; // Police plus petite
    searchDiv.appendChild(searchInput);
    
    section.content.appendChild(searchDiv);
    
    sideMenu.appendChild(section.container);
  }

  // Créer la section Affichage avec des placeholders pour les sélecteurs personnalisés
  function createModeSection() {
    const section = createSection('Modes', 3);  // Index 3
    
  
      // Créer un div pour contenir le sélecteur de mode d'arbre
      const modeDiv = document.createElement('div');
      modeDiv.id = 'menu-treeMode-container';
      
      const modeLabel = document.createElement('label');
      modeLabel.textContent = 'arbre';
      modeLabel.style.color = '#000';
      modeDiv.appendChild(modeLabel);
      
      // Créer un placeholder pour le sélecteur personnalisé
      const modePlaceholder = document.createElement('div');
      modePlaceholder.id = 'menu-treeMode-placeholder';
      modePlaceholder.style.width = '100%';
      modePlaceholder.style.margin = '5px 0';
  
      modeDiv.style.marginLeft = '-2px';
      modeDiv.appendChild(modePlaceholder);
  
      section.content.appendChild(modeDiv);
  
  
    // Créer un div pour contenir le sélecteur de générations
    const genDiv = document.createElement('div');
    genDiv.id = 'menu-generations-container';
    
    const genLabel = document.createElement('label');
    genLabel.textContent = 'nb géné';
    genLabel.style.color = '#000';
    genDiv.appendChild(genLabel);
    
    // Créer un placeholder pour le sélecteur personnalisé
    const genPlaceholder = document.createElement('div');
    genPlaceholder.id = 'menu-generations-placeholder';
    genPlaceholder.style.width = '100%';
    genPlaceholder.style.margin = '2px 0';
    genDiv.style.marginLeft = '10px';
    genDiv.appendChild(genPlaceholder);
    
    section.content.appendChild(genDiv);
    
    // Créer un div pour contenir le sélecteur du nombre de prénoms
    const prenomsDiv = document.createElement('div');
    prenomsDiv.id = 'menu-prenoms-container';

    const prenomsLabel = document.createElement('label');
    prenomsLabel.textContent = 'prénoms';
    prenomsLabel.style.color = '#000';
    prenomsDiv.appendChild(prenomsLabel);

    // Créer un placeholder pour le sélecteur personnalisé
    const prenomsPlaceholder = document.createElement('div');
    prenomsPlaceholder.id = 'menu-prenoms-placeholder';
    prenomsPlaceholder.style.width = '100%';
    prenomsPlaceholder.style.margin = '5px 0';
    prenomsDiv.style.marginLeft = '10px';
    prenomsDiv.appendChild(prenomsPlaceholder);

    section.content.appendChild(prenomsDiv);
    
    sideMenu.appendChild(section.container);
  }

  // Créer la section Audio et Animation
  function createAudioSection() {
    const section = createSection('Animation et audio', 4);  // Index 4
    
    // Créer un conteneur flex unique pour tous les éléments
    const audioControlsContainer = document.createElement('div');
    audioControlsContainer.id = 'audio-controls-container'; // Ajout d'un ID pour le retrouver facilement
    audioControlsContainer.style.display = 'flex';
    audioControlsContainer.style.flexDirection = 'row';
    audioControlsContainer.style.alignItems = 'center';
    audioControlsContainer.style.justifyContent = 'space-between';
    audioControlsContainer.style.width = '100%';
    audioControlsContainer.style.gap = '5px';
    audioControlsContainer.style.marginTop = '5px';
    
    // Créer un placeholder pour le sélecteur de démo
    const demoPlaceholder = document.createElement('div');
    demoPlaceholder.id = 'menu-demo-selector-placeholder';
    demoPlaceholder.style.flex = '0 0 auto';
    demoPlaceholder.style.marginRight = '5px';
    audioControlsContainer.appendChild(demoPlaceholder);
    
    // Définir les boutons
    const buttons = [
      { 
        id: 'menu-speechToggleBtn',
        onclick: 'toggleSpeech()', 
        title: 'Activer/désactiver le son', 
        text: '🔇' 
      },
      { 
        id: 'menu-animationPauseBtn',
        onclick: 'toggleAnimationPause()', 
        title: 'Pause animation', 
        text: '⏸️' 
      },
      { 
        id: 'menu-animationPlayBtn',
        onclick: 'toggleAnimationPause()',  
        title: 'lecture animation', 
        text: '▶️' 
      }
    ];
    
    // Créer les boutons et les ajouter au conteneur
    buttons.forEach(buttonData => {
      const button = document.createElement('button');
      button.setAttribute('onclick', buttonData.onclick);
      if (buttonData.id) button.id = buttonData.id;
      button.title = buttonData.title;
      
      const span = document.createElement('span');
      span.textContent = buttonData.text;
      span.style.fontSize = '22px';
      button.appendChild(span);
      
      // Styles pour les boutons sans bordure
      button.style.border = 'none';
      button.style.backgroundColor = 'transparent';
      button.style.padding = '4px';
      button.style.margin = '0';
      button.style.borderRadius = '4px';
      button.style.flex = '0 0 auto';
      
      audioControlsContainer.appendChild(button);
    });
    
    // Ajouter le conteneur à la section
    section.content.appendChild(audioControlsContainer);
    sideMenu.appendChild(section.container);
    
    // Initialiser le sélecteur de démo avec un délai pour s'assurer que tout est chargé
    // setTimeout(createDemoSelector, 100);
    // setTimeout(() => {
    //   const demoPlaceholder = document.getElementById('menu-demo-selector-placeholder');
    //   if (demoPlaceholder) {
    //     createDemoSelector();
    //   } else {
    //     console.log("Placeholder de démo pas encore disponible, nouvelle tentative...");
    //     // Réessayer après un délai plus long
    //     setTimeout(createDemoSelector, 300);
    //   }
    // }, 200);


    // Initialiser le sélecteur de démo - MAIS NE LE RÉCRÉONS PAS si déjà présent
    if (!document.getElementById('menu-demo-selector')) {
      // Attendre que le DOM soit complètement construit
      setTimeout(() => {
        createDemoSelector();
      }, 100);
    }


  }


  // Créer la section Name Cloud
  function createNameCloudSection() {
    const section = createSection('Nuage de mots', 0);
    
    const buttons = [
      { 
        onclick: 'processNamesCloudWithDate({ type: \"prenoms\", startDate: 1500, endDate: new Date().getFullYear(), scope: \"all\" })', 
        title: 'Nuage de noms', 
        text: '💖🔠💗' // '👥'
      }
    ];
    
    buttons.forEach(buttonData => {
      const button = document.createElement('button');
      button.setAttribute('onclick', buttonData.onclick);
      if (buttonData.id) button.id = buttonData.id;
      button.title = buttonData.title;
      
      const span = document.createElement('span');
      span.textContent = buttonData.text;
      button.appendChild(span);
      
      section.content.appendChild(button);
    });
    
    sideMenu.appendChild(section.container);
  }

  // Créer la section Paramètres
  function createSettingsSection() {
    const section = createSection('Fonds d\'écran', 1);
    
    const buttons = [
      { 
        id: 'menu-settingsBtn',
        onclick: 'openSettingsModal()', 
        title: 'Paramètres avancés', 
        text: '⚙️' 
      },
      { 
        onclick: 'returnToLogin()', 
        title: 'Retour à l\'écran de connexion', 
        text: '🔙' 
      }
    ];
    
    buttons.forEach(buttonData => {
      const button = document.createElement('button');
      button.setAttribute('onclick', buttonData.onclick);
      if (buttonData.id) button.id = buttonData.id;
      button.title = buttonData.title;
      
      const span = document.createElement('span');
      span.textContent = buttonData.text;
      button.appendChild(span);
      
      section.content.appendChild(button);
    });
    
    sideMenu.appendChild(section.container);
  }

  



// Fonction pour créer un sélecteur de démo
function createDemoSelector() {
  

  // Vérifier si le sélecteur existe déjà
  if (document.getElementById('menu-demo-selector')) {
    console.log("Le sélecteur de démo existe déjà");
    return; // Ne pas recréer s'il existe déjà
  }

  // Vérifier si le placeholder existe
  let demoPlaceholder = document.getElementById('menu-demo-selector-placeholder');
  if (!demoPlaceholder) {
    console.error("Placeholder pour le sélecteur de démo non trouvé");
    return;
  }
  
  // Définir les options en fonction de l'état
  let typeOptions = ['démo1', 'démo2'];
  let typeOptionsExpanded = [];
  let typeValues = ['demo1', 'demo2'];
  
  // Adapter les textes en fonction de l'état
  if (state.treeOwner === 2) {
    typeOptionsExpanded = ['Clou du spectacle', 'Spain'];
  } else {
    typeOptions = ['démo1', 'démo2', 'démo3', 'démo4', 'démo5', 'démo6', 'démo7', 'démo8', 'démo9', 'démo10'];
    typeValues = ['demo1', 'demo2', 'demo3', 'demo4', 'demo5', 'demo6', 'demo7', 'demo8', 'demo9', 'demo10'];
    typeOptionsExpanded = ['Costaud la Planche', 'On descend tous de lui', 'comme un ouragan', 'Espace', 'Arabe du futur', 'Loup du Canada', "c'est normal", 'avant JC', 'Francs', 'Capet'];
  }
  

  try {
    // Créer la liste d'options
    const options = [];
    for (let i = 0; i < typeOptions.length; i++) {
      options.push({
        value: typeValues[i],
        label: typeOptions[i],
        expandedLabel: typeOptionsExpanded[i]
      });
    }
    
    // Configurer le sélecteur personnalisé directement avec la fonction importée
    const customSelector = createCustomSelector({
      options: options,
      selectedValue: 'demo1',
      colors: {
        main: ' #ff9800',
        options: ' #ff9800',
        hover: ' #f57c00',
        selected: ' #e65100'
      },
      dimensions: {
        width: '50px',
        height: '25px',
        dropdownWidth: '190px'
      },
      padding: {
        display: { x: 4, y: 1 },
        options: { x: 8, y: 10 }
      },
      arrow: {
        position: 'top-right',
        size: 5.5,
        offset: { x: -5, y: 1}
      },
      customizeOptionElement: (optionElement, option) => {
        optionElement.textContent = option.expandedLabel;
        optionElement.style.textAlign = 'center';
        optionElement.style.padding = '10px 8px';
      },
      onChange: (value) => {
        // Créer un événement pour simuler le clic sur l'option de menu correspondante
        const fakeEvent = {
          target: { value: value }
        };
        
        try {
          window.handleRootPersonChange(fakeEvent);

          // Fermer le menu hamburger après la sélection
          setTimeout(() => {
            if (typeof toggleMenu === 'function') {
              toggleMenu(false);
            }
          }, 100); // Petit délai pour s'assurer que l'action est terminée avant de fermer
        } catch (error) {
          console.error("Erreur lors du lancement de la démo:", error);
        }
      },
      onCreated: (selector) => {
        const displayElement = selector.querySelector('div[style*="border"]');
        if (displayElement) {
          Object.assign(displayElement.style, {
            border: 'none',
            backgroundColor: 'rgba(255, 152, 0, 0.85)',
            color: 'white',
            boxSizing: 'border-box',
            fontWeight: 'bold'
          });
        }
        
        Object.assign(selector.style, {
          border: 'none',
          backgroundColor: 'transparent',
          boxShadow: 'none',
          outline: 'none'
        });
        
        selector.offsetHeight;
      }
    });
    
    // Ajout d'un titre et attributs pour le tooltip
    customSelector.id = 'menu-demo-selector';
    customSelector.setAttribute('data-text-key', 'demoSelector');
    customSelector.setAttribute('data-action', 'Sélectionner une démo à afficher');
    customSelector.setAttribute('title', 'Sélectionner une démo');
    
    // Remplacer le placeholder par le sélecteur personnalisé
    demoPlaceholder.parentNode.replaceChild(customSelector, demoPlaceholder);
    console.log("Sélecteur de démo créé avec succès");
  } catch (error) {
    console.error("Erreur lors de la création du sélecteur de démo:", error);
    
    // En cas d'erreur, créer un bouton simple comme fallback
    const fallbackSelector = document.createElement('select');
    fallbackSelector.id = 'menu-demo-selector';
    fallbackSelector.style.width = '100%';
    
    // Ajouter les options
    typeValues.forEach((value, index) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = typeOptionsExpanded[index];
      fallbackSelector.appendChild(option);
    });
    
    // Ajouter le gestionnaire d'événements
    fallbackSelector.addEventListener('change', function() {
      const fakeEvent = {
        target: { value: this.value }
      };
      try {
        window.handleRootPersonChange(fakeEvent);
      } catch (error) {
        console.error("Erreur lors du lancement de la démo:", error);
      }
    });
    
    // Remplacer le placeholder par le sélecteur de secours
    demoPlaceholder.parentNode.replaceChild(fallbackSelector, demoPlaceholder);
    console.log("Sélecteur de démo de secours créé");
  }
}

// Fonction pour créer un sélecteur de nombre de prénoms
function createPrenomsSelector() {
  // Vérifier si le placeholder existe
  const prenomsPlaceholder = document.getElementById('menu-prenoms-placeholder');
  if (!prenomsPlaceholder) {
    console.error("Placeholder pour le sélecteur de prénoms non trouvé");
    return;
  }
  
  // Récupérer la valeur actuelle du nombre de prénoms
  const currentValue = localStorage.getItem('nombre_prenoms') || '2';
  
  // Créer des options pour le sélecteur
  const options = [];
  for (let i = 1; i <= 4; i++) {
    options.push({
      value: i.toString(),
      label: i.toString()
    });
  }
  
  try {
    // Configurer le sélecteur personnalisé
    const customSelector = createCustomSelector({
      options: options,
      selectedValue: currentValue,
      colors: {
        main: ' #8e44ad', // Violet pour le sélecteur (différent des autres)
        options: ' #8e44ad', // Violet pour les options
        hover: ' #9b59b6', // Violet plus clair au survol
        selected: ' #6c3483' // Violet plus foncé pour l'option sélectionnée
      },
      dimensions: {
        width: '35px',
        height: '25px',
        dropdownWidth: '45px',
        dropdownHeight: '150px'
      },
      padding: {
        display: { x: 8, y: 1 },
        options: { x: 1, y: 2 }
      },
      arrow: {
        position: 'top-right',
        size: 5.5,
        offset: { x: -5, y: 1 }
      },
      onChange: (value) => {
        // Mettre à jour le nombre de prénoms
        if (typeof window.updatePrenoms === 'function') {
          window.updatePrenoms(value);
        } else {
          // Méthode alternative si la fonction n'est pas disponible
          localStorage.setItem('nombre_prenoms', value);
          
          // Essayer de montrer un feedback
          if (typeof window.showFeedback === 'function') {
            window.showFeedback('Nombre de prénoms mis à jour', 'success');
          } else if (typeof window.showToast === 'function') {
            window.showToast('Nombre de prénoms mis à jour');
          }
        }
        
        // Fermer le menu hamburger après la sélection
        setTimeout(() => {
          if (typeof toggleMenu === 'function') {
            toggleMenu(false);
          }
        }, 100); // Petit délai pour s'assurer que l'action est terminée avant de fermer
      },
      onCreated: (selector) => {
        // Enlever les bordures blanches et appliquer le style voulu immédiatement
        const displayElement = selector.querySelector('div[style*="border"]');
        if (displayElement) {
          Object.assign(displayElement.style, {
            border: 'none',
            backgroundColor: 'rgba(142, 68, 173, 0.85)', // Violet semi-transparent
            color: 'white',
            boxSizing: 'border-box',
            fontWeight: 'bold'
          });
        }
        
        Object.assign(selector.style, {
          border: 'none',
          backgroundColor: 'transparent',
          boxShadow: 'none',
          outline: 'none'
        });
        
        selector.offsetHeight;
      }
    });
    
    // Ajout d'un titre et attributs pour le tooltip
    customSelector.id = 'menu-prenoms-selector';
    customSelector.setAttribute('data-text-key', 'prenoms');
    customSelector.setAttribute('data-action', 'nombre de prénoms entre 1 et 4, pour optimiser la largueur des cases de l\'arbre');
    customSelector.setAttribute('title', 'Nombre de prénoms à afficher');
    
    // Remplacer le placeholder par le sélecteur personnalisé
    prenomsPlaceholder.parentNode.replaceChild(customSelector, prenomsPlaceholder);
    console.log("Sélecteur de prénoms créé avec succès");
  } catch (error) {
    console.error("Erreur lors de la création du sélecteur de prénoms:", error);
    
    // En cas d'erreur, créer un sélecteur simple comme fallback
    const fallbackSelector = document.createElement('select');
    fallbackSelector.id = 'menu-prenoms-selector';
    fallbackSelector.style.width = '100%';
    
    // Ajouter les options
    for (let i = 1; i <= 4; i++) {
      const option = document.createElement('option');
      option.value = i.toString();
      option.textContent = i.toString();
      if (i.toString() === currentValue) {
        option.selected = true;
      }
      fallbackSelector.appendChild(option);
    }
    
    // Ajouter le gestionnaire d'événements
    fallbackSelector.addEventListener('change', function() {
      if (typeof window.updatePrenoms === 'function') {
        window.updatePrenoms(this.value);
      } else {
        localStorage.setItem('nombre_prenoms', this.value);
      }
    });
    
    // Remplacer le placeholder par le sélecteur de secours
    prenomsPlaceholder.parentNode.replaceChild(fallbackSelector, prenomsPlaceholder);
    console.log("Sélecteur de prénoms de secours créé");
  }
}





function syncCustomSelectors() {
  console.log("Synchronisation des sélecteurs personnalisés avec mainUI.js");
  
  // Fonction globale pour fermer tous les menus déroulants
  function closeAllDropdowns() {
      const dropdowns = document.querySelectorAll('body > div[style*="position: fixed"][style*="z-index: 999999"]');
      dropdowns.forEach(dropdown => {
          if (dropdown) {
              dropdown.style.display = 'none';
          }
      });
  }

  // Fonction générique pour gérer l'ouverture d'un sélecteur
  function handleSelectorClick(originalSelector, e) {
      e.stopPropagation();
      
      // Fermer le menu hamburger
      toggleMenu(false);
      
      // Fermer tous les menus déroulants
      closeAllDropdowns();
      
      // Délai pour s'assurer que le menu est fermé
      setTimeout(() => {
          const displayElement = originalSelector.querySelector('div.custom-select-display');
          if (displayElement) {
              displayElement.click();
          } else {
              originalSelector.click();
          }
      }, 300);
  }

  try {
      const importPromise = import('./mainUI.js');
      
      importPromise.then(mainUI => {
          if (mainUI) {
              // Synchroniser les sélecteurs de génération
              const genPlaceholder = document.getElementById('menu-generations-placeholder');
              const originalGen = document.getElementById('generations');
              if (genPlaceholder && originalGen) {
                  const clone = originalGen.cloneNode(true);
                  clone.id = 'menu-generations';
                  
                  genPlaceholder.parentNode.replaceChild(clone, genPlaceholder);
                  
                  clone.addEventListener('click', (e) => handleSelectorClick(originalGen, e));
              }
              
              // Synchroniser les sélecteurs de mode d'arbre
              const modePlaceholder = document.getElementById('menu-treeMode-placeholder');
              const originalMode = document.getElementById('treeMode');
              if (modePlaceholder && originalMode) {
                  const clone = originalMode.cloneNode(true);
                  clone.id = 'menu-treeMode';
                  
                  modePlaceholder.parentNode.replaceChild(clone, modePlaceholder);
                  
                  clone.addEventListener('click', (e) => handleSelectorClick(originalMode, e));
              }

              // Synchronisation du sélecteur de personne racine
              const rootResultsPlaceholder = document.getElementById('menu-root-person-results-placeholder');
              const originalRootResults = document.getElementById('root-person-results');

              if (rootResultsPlaceholder && originalRootResults) {
                  // Conteneur principal
                  const rootPersonContainer = document.createElement('div');
                  rootPersonContainer.id = 'menu-root-person-results-container'; // Ajouter un ID
                  rootPersonContainer.style.display = 'flex';
                  rootPersonContainer.style.alignItems = 'center';
                  rootPersonContainer.style.gap = '10px';

                  // Label à gauche
                  const rootPersonLabel = document.createElement('label');
                  rootPersonLabel.textContent = 'Sélect. personne racine';
                  rootPersonLabel.style.fontSize = '14px';
                  rootPersonLabel.style.color = '#000';
                  rootPersonLabel.style.lineHeight = '1.2';
                  rootPersonLabel.style.textAlign = 'right';
                  rootPersonLabel.style.flexShrink = '0';
                  rootPersonLabel.style.width = '60px'; // Largeur fixe pour le label

                  // Bouton/div style sélecteur personnalisé
                  const rootPersonLink = document.createElement('div');
                  
                  // Copier le style du sélecteur original
                  rootPersonLink.style.cursor = 'pointer';
                  rootPersonLink.style.padding = '1px 4px';
                  rootPersonLink.style.border = 'none';
                  rootPersonLink.style.borderRadius = '4px';
                  rootPersonLink.style.backgroundColor = 'rgba(255, 152, 0, 0.85)';
                  rootPersonLink.style.color = 'white';
                  rootPersonLink.style.fontSize = '14px';
                  rootPersonLink.style.fontWeight = 'bold';
                  rootPersonLink.style.display = 'flex';
                  rootPersonLink.style.justifyContent = 'space-between';
                  rootPersonLink.style.alignItems = 'center';
                  rootPersonLink.style.height = '25px';
                  rootPersonLink.style.minWidth = '80px';        // Largeur minimale 
                  rootPersonLink.style.boxSizing = 'border-box';
                  rootPersonLink.style.position = 'relative';
                  rootPersonLink.style.zIndex = '99900';

                  // Texte du bouton (nom de la personne racine)
                  const displayElement = originalRootResults.querySelector('div[style*="border"] span');
                  // rootPersonLink.textContent = displayElement ? displayElement.textContent : 'Sélectionner';

                  const currentText = displayElement ? displayElement.textContent.trim() : 'Sélectionner';
                  rootPersonLink.textContent = currentText;
                  rootPersonLink.addEventListener('click', function(e) {
                      e.stopPropagation();
                      
                      // Récupérer explicitement le sélecteur de root person
                      const originalRootResults = document.getElementById('root-person-results');                                       
                      const displayElement = originalRootResults.querySelector('div[style*="border"]');
                      
                      if (displayElement) {
                          const span = displayElement.querySelector('span');
                          const currentText = span ? (span.getAttribute('data-full-text') || span.textContent) : 'Sélectionner';
                          rootPersonLink.textContent = currentText;
                      }
                      
                      // Fermer le menu hamburger
                      toggleMenu(false);
                      
                      // Fermer TOUS les menus déroulants avec une logique plus stricte
                      const dropdowns = document.querySelectorAll('body > div[style*="position: fixed"][style*="z-index: 999999"]');
                      dropdowns.forEach(dropdown => {
                          // Stratégie de fermeture plus agressive
                          dropdown.style.display = 'none';
                          dropdown.removeAttribute('data-root-person');
                      });
                      
                      // Délai pour s'assurer que le menu est fermé
                      setTimeout(() => {
                          const displayElement = originalRootResults.querySelector('div[style*="border"]');
                          
                          if (displayElement) {
                              const clickEvent = new MouseEvent('click', {
                                  view: window,
                                  bubbles: true,
                                  cancelable: true
                              });
                              displayElement.dispatchEvent(clickEvent);
                              
                              // Après un court délai, repositionner
                              setTimeout(() => {
                                  // Sélectionner UNIQUEMENT le dernier dropdown créé
                                  const dropdowns = document.querySelectorAll('body > div[style*="position: fixed"][style*="z-index: 999999"]');
                                  const optionsContainerAfterClick = dropdowns[dropdowns.length - 1];
                                  
                                  if (optionsContainerAfterClick) {
                                      // Fermer tous les autres dropdowns
                                      dropdowns.forEach(dropdown => {
                                          if (dropdown !== optionsContainerAfterClick) {
                                              dropdown.style.display = 'none';
                                          }
                                      });
                                      
                                      // Marquer ce dropdown comme étant celui de la personne racine
                                      optionsContainerAfterClick.setAttribute('data-root-person', 'true');
                                      
                                      // Utiliser le rectangle du sélecteur original
                                      const displayElement = originalRootResults.querySelector('div[style*="border"]');
                                      const rect = displayElement.getBoundingClientRect();
                                      
                                      optionsContainerAfterClick.style.display = 'block';
                                      optionsContainerAfterClick.style.top = `${rect.bottom + 5}px`;
                                      
                                      if (optionsContainerAfterClick.offsetWidth > rect.width) {
                                          optionsContainerAfterClick.style.left = `${rect.right - optionsContainerAfterClick.offsetWidth}px`;
                                      } else {
                                          optionsContainerAfterClick.style.left = `${rect.left}px`;
                                      }
                                      
                                      optionsContainerAfterClick.style.zIndex = '9999';
                                  }
                              }, 100);
                          }
                      }, 300);
                  });

                  // Ajouter le label et le bouton au conteneur
                  rootPersonContainer.appendChild(rootPersonLabel);
                  rootPersonContainer.appendChild(rootPersonLink);

                  // Remplacer le placeholder par le nouveau conteneur
                  rootResultsPlaceholder.parentNode.replaceChild(rootPersonContainer, rootResultsPlaceholder);
              }




















              // Synchronisation du champ de recherche de personne racine
              const rootSearchPlaceholder = document.getElementById('menu-root-person-search-placeholder');
              const originalRootSearch = document.getElementById('root-person-search');

              if (rootSearchPlaceholder && originalRootSearch) {
                  const rootSearchLink = document.createElement('div');
                  rootSearchLink.textContent = '🔍 personne racine';
                  rootSearchLink.style.cursor = 'pointer';
                  rootSearchLink.style.padding = '3px 3px';
                  rootSearchLink.style.backgroundColor = 'white';
                  rootSearchLink.style.textAlign = 'left';
                  rootSearchLink.style.border = '1px solid #333';
                  rootSearchLink.style.borderRadius = '4px';
                  rootSearchLink.style.fontSize = '14px';
                  rootSearchLink.style.display = 'flex';
                  rootSearchLink.style.alignItems = 'center';
                  rootSearchLink.style.margin = '3px 0';

                  
                  rootSearchLink.addEventListener('click', function(e) {
                      e.stopPropagation();
                      
                      // Fermer le menu hamburger
                      toggleMenu(false);
                      
                      // Délai court pour s'assurer que le menu est fermé
                      setTimeout(() => {
                          // Donner le focus à la zone de recherche de la page
                          originalRootSearch.focus();
                          originalRootSearch.select(); // Optionnel : sélectionner tout le texte
                      }, 300);
                  });
                  
                  // Remplacer le placeholder par le lien
                  rootSearchPlaceholder.parentNode.replaceChild(rootSearchLink, rootSearchPlaceholder);
              }

              // createDemoSelector();
              // Pour le sélecteur de démo, vérifier s'il existe déjà
              const existingDemoSelector = document.getElementById('menu-demo-selector');
              if (!existingDemoSelector) {
                // Seulement s'il n'existe pas encore
                createDemoSelector();
              }
              

              // createPrenomsSelector();
              setTimeout(() => {
                const prenomsPlaceholder = document.getElementById('menu-prenoms-placeholder');
                if (prenomsPlaceholder) {
                  createPrenomsSelector();
                } else {
                  console.log("Placeholder de prénoms pas encore disponible");
                }
              }, 200);








              console.log("Synchronisation des sélecteurs réussie avec nouveaux gestionnaires d'événements");
          }
      }).catch(error => {
          console.error("Erreur lors de l'import de mainUI.js:", error);
      });
  } catch (error) {
      console.error("Erreur lors de la synchronisation des sélecteurs:", error);
  }
}











  // Injecter les styles CSS
  function injectStyles() {
    const styleElement = document.createElement('style');
    styleElement.id = 'hamburger-menu-styles';
    
    styleElement.textContent = `
     
      /* Style pour le bouton hamburger */
      .hamburger-menu {
        position: fixed;
        top: 5px;   
        left: 5px; 
        z-index: 3000;
        width: 40px;
        height: 40px;
        background-color: #4CAF50;
        border-radius: 8px;  /* Changé de 50% (rond) à 8px pour un look plus carré */
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        border: none;
      }

      .hamburger-menu span {
        display: block;
        width: 24px;
        height: 3px;
        margin: 2px 0;
        background-color: white;
        border-radius: 3px;
        transition: all 0.3s ease;
      }

      /* Menu latéral */
      .side-menu {
        position: fixed;
        top: 0;
        left: -250px; /* Commence hors écran */
        width: 210px;
        height: 100%;
        background-color: white;
        box-shadow: 2px 0 5px rgba(0,0,0,0.2);
        z-index: 2900;
        transition: left 0.3s ease;
        overflow-y: auto;
        padding: 60px 10px 20px;
      }

      .side-menu.open {
        left: 0; /* Affiché à l'écran */
      }

      /* Overlay pour fermer le menu en cliquant ailleurs */
      .menu-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
        z-index: 2800;
        display: none;
      }

      .menu-overlay.open {
        display: block;
      }

      /* Styles pour les sections du menu */
      .menu-section {
        margin-bottom: 15px;
        padding: 10px;
        border-bottom: 1px solid #eee;
      }

      .menu-section h3 {
        margin-top: 0;
        margin-bottom: 10px;
        font-size: 16px;
        color: #333;
      }

      .menu-section-content {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      /* Adaptations pour les contrôles dans le menu */
      .side-menu button {
        min-width: auto;
        padding: 2px; /* Padding réduit */
        margin: 0;
        border: none; /* Suppression de la bordure */
        background-color: transparent; /* Fond transparent */
        border-radius: 4px; /* Coins arrondis légers */
      }

      .side-menu button:hover {
        background-color: rgba(0,0,0,0.05); /* Léger fond au survol */
      }

      .side-menu button span {
        font-size: 28px; /* Symboles plus grands */
        display: block;
      }

      .side-menu select, .side-menu input {
        min-width: auto;
        max-width: 100%;
      }

      /* Style pour le titre du menu */
      .menu-title {
        position: absolute;
        top: 15px;
        left: 60px;
        font-size: 18px;
        font-weight: bold;
        color: #4CAF50;
      }
      
      /* Styles pour les labels des contrôles */
      .menu-section-content label {
        display: block;
        width: 100%;
        margin-bottom: 5px;
        font-size: 14px;
        color: #555;
      }
      
      /* S'assurer que le bouton hamburger est visible quand l'arbre est affiché */
      body.tree-view .hamburger-menu,
      #tree-container:not([style*="display: none"]) ~ .hamburger-menu {
        display: flex !important;
        z-index: 3000;
      }
    `;
    
    // Ajouter la feuille de style si elle n'existe pas déjà
    if (!document.getElementById('hamburger-menu-styles')) {
      document.head.appendChild(styleElement);
    }
  }

  // Basculer l'affichage du menu
  function toggleMenu(open) {
    if (!sideMenu || !menuOverlay) {
      console.warn("Éléments du menu non disponibles pour toggleMenu");
      return;
    }
    
    const isOpen = typeof open !== 'undefined' ? open : !sideMenu.classList.contains('open');
    
    if (isOpen) {
      // Synchroniser les sélecteurs avant d'ouvrir le menu
      syncCustomSelectors();
      
      sideMenu.classList.add('open');
      menuOverlay.classList.add('open');
    } else {
      sideMenu.classList.remove('open');
      menuOverlay.classList.remove('open');
    }
  }

  // Configurer la fermeture automatique sur mobile
  function setupMobileMenuClosing() {
    document.querySelectorAll('#side-menu button, #side-menu select').forEach(element => {
      element.addEventListener('click', function() {
        // Sur mobile, fermer le menu après la sélection
        if (window.innerWidth < 768) {
          // Petit délai pour permettre à l'action de se terminer
          setTimeout(() => {
            toggleMenu(false);
          }, 300);
        }
      });
    });
  }


  function setupButtonSync() {
    setTimeout(() => {
        // Synchronisation existante pour les boutons de son et pause
        const originalSpeechBtn = document.getElementById('speechToggleBtn');
        const menuSpeechBtn = document.getElementById('menu-speechToggleBtn');
        
        if (originalSpeechBtn && menuSpeechBtn) {
            const speechObserver = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList' || mutation.type === 'attributes') {
                        menuSpeechBtn.innerHTML = originalSpeechBtn.innerHTML;
                    }
                });
            });
            
            speechObserver.observe(originalSpeechBtn, { 
                childList: true,
                attributes: true,
                subtree: true
            });
        }
        
        const originalPauseBtn = document.getElementById('animationPauseBtn');
        const menuPauseBtn = document.getElementById('menu-animationPauseBtn');
        const menuPlayBtn = document.getElementById('menu-animationPlayBtn');
        
        if (originalPauseBtn && menuPauseBtn) {
            const pauseObserver = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList' || mutation.type === 'attributes') {
                        menuPlayBtn.innerHTML = menuPauseBtn.innerHTML;
                        menuPauseBtn.innerHTML = originalPauseBtn.innerHTML;
                    }
                });
            });
            
            pauseObserver.observe(originalPauseBtn, { 
                childList: true,
                attributes: true,
                subtree: true
            });
        }

        // Observation et synchronisation des sélecteurs
        const selectorsToSync = [
            { original: 'generations', menu: 'menu-generations' },
            { original: 'treeMode', menu: 'menu-treeMode' }
        ];

        selectorsToSync.forEach(({ original, menu }) => {
            const originalSelector = document.getElementById(original);
            const menuSelector = document.getElementById(menu);

            if (originalSelector && menuSelector) {
                const selectorObserver = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                        if (mutation.type === 'childList' || mutation.type === 'attributes') {
                            menuSelector.innerHTML = originalSelector.innerHTML;
                            menuSelector.value = originalSelector.value;
                        }
                    });
                });
                
                selectorObserver.observe(originalSelector, { 
                    childList: true,
                    subtree: true,
                    characterData: true,
                    attributes: true
                });
            }
        });

        // Synchronisation spéciale pour rootPersonResults
        const originalRootPersonResults = document.getElementById('root-person-results');
        const menuRootPersonResults = document.getElementById('menu-root-person-results');

        if (originalRootPersonResults && menuRootPersonResults) {
            // Fonction de synchronisation du contenu
            function syncRootPersonResults() {
                try {
                    // Vérifier si la méthode updateOptions existe
                    if (typeof menuRootPersonResults.updateOptions === 'function') {
                        // Extraire les options de l'original
                        const options = Array.from(originalRootPersonResults.options).map(option => ({
                            value: option.value,
                            label: option.textContent
                        }));

                        // Mettre à jour les options du menu hamburger
                        menuRootPersonResults.updateOptions(options);

                        // Conserver la valeur sélectionnée
                        const selectedValue = originalRootPersonResults.value;
                        menuRootPersonResults.value = selectedValue;

                        console.log('Root person selector synchronized');
                    }
                } catch (error) {
                    console.error('Error synchronizing root person selector:', error);
                }
            }

            // Observateur de mutations
            const rootPersonObserver = new MutationObserver(syncRootPersonResults);
            
            rootPersonObserver.observe(originalRootPersonResults, { 
                childList: true,
                subtree: true,
                characterData: true,
                attributes: true
            });

            // Synchronisation initiale
            syncRootPersonResults();

            // Écouter les événements de changement
            originalRootPersonResults.addEventListener('change', syncRootPersonResults);
        }
    }, 1000);
}

  // Fonction pour afficher le menu
  export function showHamburgerMenu() {
    console.log("Affichage du menu hamburger via directHamburgerMenu.js");
    
    if (!state.menuHamburgerInitialized) {
        createMenuElements();
    }
    
    if (hamburgerMenu) {
        hamburgerMenu.style.display = 'flex';
    }
    
    // S'assurer que le menu latéral est configuré même s'il est fermé
    if (sideMenu) {
        sideMenu.style.display = 'block';
        
        // NOUVEAU : Mettre à jour le nom de la personne racine
        const originalRootResults = document.getElementById('root-person-results');
        const rootPersonLink = document.getElementById('menu-root-person-results-container');
        
        if (originalRootResults && rootPersonLink) {

            const displayElement = originalRootResults.querySelector('div[style*="border"]');
            if (displayElement) {
                const span = displayElement.querySelector('span');
                const currentText = span ? (span.getAttribute('data-full-text') || span.textContent) : 'Sélectionner';
                
                const rootPersonLinkText = rootPersonLink.querySelector('div');
                if (rootPersonLinkText) {
                    rootPersonLinkText.textContent = currentText;
                }
            }
        }
        
        // Synchroniser les sélecteurs lors de l'affichage
        syncCustomSelectors();
    }
    
    // Toaster un message
    if (typeof window.showToast === 'function') {
        window.showToast('Menu principal disponible');
    }
  }


  // Fonction pour masquer le menu
  export function hideHamburgerMenu() {
    console.log("Masquage du menu hamburger");
    
    // Forcer la suppression du menu hamburger
    const hamburgerElement = document.getElementById('hamburger-menu');
    if (hamburgerElement) {
      hamburgerElement.style.display = 'none';
      hamburgerElement.remove(); // Supprime complètement l'élément du DOM
    }
    
    // Faire de même pour le side-menu et l'overlay
    const sideMenuElement = document.getElementById('side-menu');
    if (sideMenuElement) {
      sideMenuElement.classList.remove('open');
      sideMenuElement.remove();
    }
    
    const menuOverlayElement = document.getElementById('menu-overlay');
    if (menuOverlayElement) {
      menuOverlayElement.classList.remove('open');
      menuOverlayElement.remove();
    }
    state.isHamburgerMenuInitialized = false;
    state.menuHamburgerInitialized = false; // Réinitialiser l'état du menu hamburger
  }

 /**
   * Fonction améliorée pour cacher le bouton hamburger
   * Utilise plusieurs méthodes pour s'assurer que le bouton est caché
   */
  export function hideHamburgerButtonForcefully() {
    console.log("Tentative de masquage forcé du bouton hamburger");
    
    // Récupérer l'élément bouton
    const hamburgerButton = document.getElementById('hamburger-menu');
    
    if (!hamburgerButton) {
      console.error("Le bouton hamburger n'existe pas dans le DOM");
      return;
    }
    
    // Appliquer plusieurs méthodes de masquage avec priorité maximale
    hamburgerButton.style.setProperty('display', 'none', 'important');
    hamburgerButton.style.setProperty('visibility', 'hidden', 'important');
    hamburgerButton.style.setProperty('opacity', '0', 'important');
    hamburgerButton.style.setProperty('position', 'absolute', 'important');
    hamburgerButton.style.setProperty('left', '-9999px', 'important');
    
    // Vérifier si une règle CSS dans le body force l'affichage
    document.body.classList.forEach(cls => {
      if (cls === 'tree-view') {
        console.log("La classe tree-view est présente sur body, elle peut forcer l'affichage");
      }
    });
    
    console.log("Masquage forcé appliqué au bouton hamburger");
  }

  /**
   * Fonction pour réafficher le bouton hamburger après masquage forcé
   */
  export function showHamburgerButtonForcefully() {
    console.log("Tentative d'affichage forcé du bouton hamburger");
    
    // Récupérer l'élément bouton
    const hamburgerButton = document.getElementById('hamburger-menu');
    
    if (!hamburgerButton) {
      console.error("Le bouton hamburger n'existe pas dans le DOM");
      return;
    }
    
    // Réinitialiser les propriétés
    hamburgerButton.style.removeProperty('display');
    hamburgerButton.style.removeProperty('visibility');
    hamburgerButton.style.removeProperty('opacity');
    hamburgerButton.style.removeProperty('position');
    hamburgerButton.style.removeProperty('left');
    
    // Appliquer l'affichage avec priorité
    hamburgerButton.style.setProperty('display', 'flex', 'important');
    hamburgerButton.style.setProperty('visibility', 'visible', 'important');
    hamburgerButton.style.setProperty('opacity', '1', 'important');
    
    console.log("Affichage forcé appliqué au bouton hamburger");
  }

  // Initialiser le menu au chargement
  
  export function initializeHamburgerOnce() {
    if (!state.isHamburgerMenuInitialized) {
      console.log("Initialisation directHamburgerMenu.js");
      createMenuElements();
      state.isHamburgerMenuInitialized = true;
      
      // Attacher un écouteur d'événements pour détecter quand l'arbre est chargé
      document.addEventListener('gedcomLoaded', function() {
        console.log("Event gedcomLoaded détecté, préparation du menu hamburger");
        setTimeout(syncCustomSelectors, 1000); // Synchroniser après un délai pour s'assurer que tout est prêt
      });



      document.addEventListener('change', function(event) {
        // Vérifier si l'événement provient du sélecteur de personne racine
        if (event.target && event.target.id === 'root-person-results') {
          // Petit délai pour s'assurer que l'interface s'est mise à jour
          setTimeout(updateRootPersonNameInMenu, 100);
        }
      });



    }
  }


  export function updateRootPersonNameInMenu() {
    const rootPersonLink = document.querySelector('#menu-root-person-results-container div');
    const originalRootResults = document.getElementById('root-person-results');
    
    if (rootPersonLink && originalRootResults) {
      const displayElement = originalRootResults.querySelector('div[style*="border"] span');
      if (displayElement) {
        const currentText = displayElement.getAttribute('data-full-text') || displayElement.textContent.trim();
        rootPersonLink.textContent = currentText;
        console.log("Menu hamburger: Mise à jour du nom de la personne racine vers", currentText);
      }
    }
  }
  
