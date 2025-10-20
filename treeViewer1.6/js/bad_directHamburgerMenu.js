// directHamburgerMenu.js modifié - Script autonome pour le menu hamburger
// 
(function() {
  // Variables pour garder une référence aux éléments
  let hamburgerMenu, sideMenu, menuOverlay;
  let menuInitialized = false;
  
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
    createNavigationSection();
    createSearchSection();
    createDisplaySection();
    createAudioSection();
    createSettingsSection();
    
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
    
    menuInitialized = true;
    console.log("Menu hamburger initialisé avec succès");
  }
  
  // Fonction pour créer une section de menu
  function createSection(title) {
    const container = document.createElement('div');
    container.className = 'menu-section';
    
    const heading = document.createElement('h3');
    heading.textContent = title;
    container.appendChild(heading);
    
    const content = document.createElement('div');
    content.className = 'menu-section-content';
    container.appendChild(content);
    
    return { container, content };
  }

  // Créer la section Navigation
  function createNavigationSection() {
    const section = createSection('Navigation');
    
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
      button.appendChild(span);
      
      section.content.appendChild(button);
    });
    
    sideMenu.appendChild(section.container);
  }

  // Créer la section Recherche avec des placeholders pour les sélecteurs
  function createSearchSection() {
    const section = createSection('Recherche');
    section.content.style.flexDirection = 'column';
    
    // Créer un div pour contenir le sélecteur de recherche racine
    const rootSearchDiv = document.createElement('div');
    rootSearchDiv.id = 'menu-root-search-container';
    
    const rootSearchLabel = document.createElement('label');
    rootSearchLabel.textContent = 'Personne racine:';
    rootSearchDiv.appendChild(rootSearchLabel);
    
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
    
    // Champ de recherche dans l'arbre
    const searchDiv = document.createElement('div');
    searchDiv.id = 'menu-search-container';
    
    const searchLabel = document.createElement('label');
    searchLabel.textContent = 'Rechercher dans l\'arbre:';
    searchDiv.appendChild(searchLabel);
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.id = 'menu-search';
    searchInput.placeholder = '🔍nom';
    searchInput.setAttribute('oninput', 'searchTree(this.value)');
    searchInput.style.width = '100%';
    searchDiv.appendChild(searchInput);
    
    section.content.appendChild(searchDiv);
    
    sideMenu.appendChild(section.container);
  }

  // Créer la section Affichage avec des placeholders pour les sélecteurs personnalisés
  function createDisplaySection() {
    const section = createSection('Affichage');
    
    // Créer un div pour contenir le sélecteur de générations
    const genDiv = document.createElement('div');
    genDiv.id = 'menu-generations-container';
    
    const genLabel = document.createElement('label');
    genLabel.textContent = 'Générations:';
    genDiv.appendChild(genLabel);
    
    // Créer un placeholder pour le sélecteur personnalisé
    const genPlaceholder = document.createElement('div');
    genPlaceholder.id = 'menu-generations-placeholder';
    genPlaceholder.style.width = '100%';
    genPlaceholder.style.margin = '5px 0';
    genDiv.appendChild(genPlaceholder);
    
    section.content.appendChild(genDiv);
    
    // Créer un div pour contenir le sélecteur de mode d'arbre
    const modeDiv = document.createElement('div');
    modeDiv.id = 'menu-treeMode-container';
    
    const modeLabel = document.createElement('label');
    modeLabel.textContent = 'Mode d\'arbre:';
    modeDiv.appendChild(modeLabel);
    
    // Créer un placeholder pour le sélecteur personnalisé
    const modePlaceholder = document.createElement('div');
    modePlaceholder.id = 'menu-treeMode-placeholder';
    modePlaceholder.style.width = '100%';
    modePlaceholder.style.margin = '5px 0';
    modeDiv.appendChild(modePlaceholder);
    
    section.content.appendChild(modeDiv);
    
    sideMenu.appendChild(section.container);
  }

  // Créer la section Audio et Animation
  function createAudioSection() {
    const section = createSection('Audio et Animation');
    
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
        title: 'Pause/lecture animation', 
        text: '⏸️' 
      },
      { 
        onclick: 'processNamesCloudWithDate({ type: \"prenoms\", startDate: 1500, endDate: new Date().getFullYear(), scope: \"all\" })', 
        title: 'Nuage de noms', 
        text: '👥' 
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
    const section = createSection('Paramètres');
    
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

  // Fonction pour synchroniser les sélecteurs avec ceux de mainUI.js
  function syncCustomSelectors() {
    console.log("Synchronisation des sélecteurs personnalisés avec mainUI.js");
    
    try {
      // Import dynamique du module mainUI pour accéder aux fonctions
      const importPromise = import('./mainUI.js');
      
      importPromise.then(mainUI => {
        if (mainUI) {
          // Synchroniser les sélecteurs de génération
          const genPlaceholder = document.getElementById('menu-generations-placeholder');
          const originalGen = document.getElementById('generations');
          if (genPlaceholder && originalGen) {
            // Cloner le sélecteur original
            const clone = originalGen.cloneNode(true);
            clone.id = 'menu-generations';
            
            // Remplacer le placeholder par le clone
            genPlaceholder.parentNode.replaceChild(clone, genPlaceholder);
            
            // S'assurer que les événements du clone fonctionnent
            clone.addEventListener('change', function(e) {
              originalGen.value = this.value;
              const event = new Event('change', { bubbles: true });
              originalGen.dispatchEvent(event);
            });
          }
          
          // Synchroniser les sélecteurs de mode d'arbre
          const modePlaceholder = document.getElementById('menu-treeMode-placeholder');
          const originalMode = document.getElementById('treeMode');
          if (modePlaceholder && originalMode) {
            // Cloner le sélecteur original
            const clone = originalMode.cloneNode(true);
            clone.id = 'menu-treeMode';
            
            // Remplacer le placeholder par le clone
            modePlaceholder.parentNode.replaceChild(clone, modePlaceholder);
            
            // S'assurer que les événements du clone fonctionnent
            clone.addEventListener('change', function(e) {
              originalMode.value = this.value;
              const event = new Event('change', { bubbles: true });
              originalMode.dispatchEvent(event);
            });
          }
          
          // Synchroniser le champ de recherche racine
          const rootSearchPlaceholder = document.getElementById('menu-root-person-search-placeholder');
          const originalRootSearch = document.getElementById('root-person-search');
          if (rootSearchPlaceholder && originalRootSearch) {
            // Cloner le champ original
            const clone = originalRootSearch.cloneNode(true);
            clone.id = 'menu-root-person-search';
            
            // Remplacer le placeholder par le clone
            rootSearchPlaceholder.parentNode.replaceChild(clone, rootSearchPlaceholder);
            
            // S'assurer que les événements du clone fonctionnent
            clone.addEventListener('input', function(e) {
              originalRootSearch.value = this.value;
              const event = new Event('input', { bubbles: true });
              originalRootSearch.dispatchEvent(event);
            });
          }
          
          // Synchroniser le sélecteur de résultats
          const rootResultsPlaceholder = document.getElementById('menu-root-person-results-placeholder');
          const originalRootResults = document.getElementById('root-person-results');
          if (rootResultsPlaceholder && originalRootResults) {
            // Cloner le sélecteur original
            const clone = originalRootResults.cloneNode(true);
            clone.id = 'menu-root-person-results';
            
            // Remplacer le placeholder par le clone
            rootResultsPlaceholder.parentNode.replaceChild(clone, rootResultsPlaceholder);
            
            // S'assurer que les événements du clone fonctionnent
            clone.addEventListener('change', function(e) {
              originalRootResults.value = this.value;
              const event = new Event('change', { bubbles: true });
              originalRootResults.dispatchEvent(event);
            });
          }
          
          console.log("Synchronisation des sélecteurs réussie");
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
        top: 10px;
        left: 10px;
        z-index: 3000;
        width: 40px;
        height: 40px;
        background-color: #4CAF50;
        border-radius: 50%;
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
        left: -300px; /* Commence hors écran */
        width: 280px;
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
        padding: 8px;
        margin: 0;
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

  // Observer les changements des boutons originaux
  function setupButtonSync() {
    setTimeout(() => {
      // Synchroniser le bouton de son
      // const originalSpeechBtn = document.getElementById('speechToggleBtn');
      // const menuSpeechBtn = document.getElementById('menu-speechToggleBtn');
      
      // if (originalSpeechBtn && menuSpeechBtn) {
      //   // Observer les changements dans le bouton original
      //   const observer = new MutationObserver(function(mutations) {
      //     mutations.forEach(function(mutation) {
      //       if (mutation.type === 'childList' || mutation.type === 'attributes') {
      //         menuSpeechBtn.innerHTML = originalSpeechBtn.innerHTML;
      //       }
      //     });
      //   });
        
      //   observer.observe(originalSpeechBtn, { 
      //     childList: true,
      //     attributes: true,
      //     subtree: true
      //   });
      // }
      
      // Synchroniser le bouton de pause d'animation
      const originalPauseBtn = document.getElementById('animationPauseBtn');
      const menuPauseBtn = document.getElementById('menu-animationPauseBtn');
      
      if (originalPauseBtn && menuPauseBtn) {
        const observer = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' || mutation.type === 'attributes') {
              menuPauseBtn.innerHTML = originalPauseBtn.innerHTML;
            }
          });
        });
        
        observer.observe(originalPauseBtn, { 
          childList: true,
          attributes: true,
          subtree: true
        });
      }
    }, 1000); // Délai pour s'assurer que les éléments du DOM sont prêts
  }

  // Fonction pour afficher le menu
  function showHamburgerMenu() {
    console.log("Affichage du menu hamburger via directHamburgerMenu.js");
    
    if (!menuInitialized) {
      createMenuElements();
    }
    
    if (hamburgerMenu) {
      hamburgerMenu.style.display = 'flex';
    }
    
    // S'assurer que le menu latéral est configuré même s'il est fermé
    if (sideMenu) {
      sideMenu.style.display = 'block';
      // Synchroniser les sélecteurs lors de l'affichage
      syncCustomSelectors();
    }
    
    // Toaster un message
    if (typeof window.showToast === 'function') {
      // window.showToast('Menu principal disponible');
    }
  }

  // Fonction pour masquer le menu
  function hideHamburgerMenu() {
    console.log("Masquage du menu hamburger via directHamburgerMenu.js");
    
    if (hamburgerMenu) {
      hamburgerMenu.style.display = 'none';
    }
    
    if (sideMenu) {
      sideMenu.classList.remove('open');
    }
    
    if (menuOverlay) {
      menuOverlay.classList.remove('open');
    }
  }

  // Initialiser le menu au chargement
  let isInitialized = false;
  
  function initializeOnce() {
    if (!isInitialized) {
      console.log("Initialisation directHamburgerMenu.js");
      createMenuElements();
      isInitialized = true;
      
      // Attacher un écouteur d'événements pour détecter quand l'arbre est chargé
      document.addEventListener('gedcomLoaded', function() {
        console.log("Event gedcomLoaded détecté, préparation du menu hamburger");
        setTimeout(syncCustomSelectors, 1000); // Synchroniser après un délai pour s'assurer que tout est prêt
      });
    }
  }
  
  // Attendre que la page soit chargée
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeOnce);
  } else {
    initializeOnce();
  }
  
  // Exposer publiquement les fonctions
  window.showHamburgerMenu = showHamburgerMenu;
  window.hideHamburgerMenu = hideHamburgerMenu;
})();

// directHamburgerMenu.js - Utilisation directe des sélecteurs de mainUI.js
// (function() {
//   // Variables pour garder une référence aux éléments
//   let hamburgerMenu, sideMenu, menuOverlay;
  
//   // Créer les éléments du menu
//   function createMenuElements() {
//     // Injecter les styles nécessaires
//     injectStyles();
    
//     // Créer le bouton hamburger
//     hamburgerMenu = document.createElement('button');
//     hamburgerMenu.id = 'hamburger-menu';
//     hamburgerMenu.className = 'hamburger-menu';
//     hamburgerMenu.title = 'Menu principal';
//     hamburgerMenu.style.display = 'none'; // Caché par défaut
    
//     // Créer les trois barres du hamburger
//     for (let i = 0; i < 3; i++) {
//       const span = document.createElement('span');
//       hamburgerMenu.appendChild(span);
//     }
    
//     // Créer l'overlay
//     menuOverlay = document.createElement('div');
//     menuOverlay.id = 'menu-overlay';
//     menuOverlay.className = 'menu-overlay';
    
//     // Créer le menu latéral
//     sideMenu = document.createElement('div');
//     sideMenu.id = 'side-menu';
//     sideMenu.className = 'side-menu';
    
//     // Ajouter le titre du menu
//     const menuTitle = document.createElement('div');
//     menuTitle.className = 'menu-title';
//     menuTitle.textContent = 'Menu de l\'arbre';
//     sideMenu.appendChild(menuTitle);
    
//     // Créer des placeholders pour les sections
//     createMenuSections();
    
//     // Ajouter les éléments au DOM
//     document.body.appendChild(hamburgerMenu);
//     document.body.appendChild(menuOverlay);
//     document.body.appendChild(sideMenu);
    
//     // Ajouter les gestionnaires d'événements
//     hamburgerMenu.addEventListener('click', function(event) {
//       event.preventDefault();
//       event.stopPropagation();
//       toggleMenu();
//     });
    
//     menuOverlay.addEventListener('click', function() {
//       toggleMenu(false);
//     });
//   }

//   // Créer des placeholders pour les sections du menu
//   function createMenuSections() {
//     // Section Navigation
//     const navSection = createSection('Navigation');
//     navSection.id = 'menu-section-navigation';
//     sideMenu.appendChild(navSection);
    
//     // Section Recherche
//     const searchSection = createSection('Recherche');
//     searchSection.id = 'menu-section-search';
//     sideMenu.appendChild(searchSection);
    
//     // Section Audio et Animation
//     const audioSection = createSection('Audio et Animation');
//     audioSection.id = 'menu-section-audio';
//     sideMenu.appendChild(audioSection);
    
//     // Section Paramètres
//     const settingsSection = createSection('Paramètres');
//     settingsSection.id = 'menu-section-settings';
//     sideMenu.appendChild(settingsSection);
//   }
  
//   // Créer une section de menu
//   function createSection(title) {
//     const section = document.createElement('div');
//     section.className = 'menu-section';
    
//     const heading = document.createElement('h3');
//     heading.textContent = title;
//     section.appendChild(heading);
    
//     const content = document.createElement('div');
//     content.className = 'menu-section-content';
//     section.appendChild(content);
    
//     return section;
//   }

//   // Remplir le menu avec les contrôles existants de la page
//   function populateMenuWithControls() {
//     // Importer directement le module mainUI.js
//     import('./mainUI.js')
//       .then(moduleMainUI => {
//         console.log("Module mainUI.js importé avec succès");
        
//         // Remplir les sections avec les contrôles appropriés
//         populateNavigationSection();
//         populateSearchSection(moduleMainUI);
//         populateAudioSection();
//         populateSettingsSection();
//       })
//       .catch(error => {
//         console.error("Erreur lors de l'import de mainUI.js:", error);
//       });
//   }

//   // Peupler la section navigation avec des boutons simples
//   function populateNavigationSection() {
//     const navSection = document.getElementById('menu-section-navigation');
//     if (!navSection) return;
    
//     const navContent = navSection.querySelector('.menu-section-content');
//     navContent.innerHTML = '';
    
//     const buttons = [
//       { onclick: 'zoomIn()', title: 'Zoom avant', text: '➕' },
//       { onclick: 'zoomOut()', title: 'Zoom arrière', text: '➖' },
//       { onclick: 'resetZoom()', title: 'Réinitialiser la vue', text: '🏠' },
//       { onclick: 'toggleFullScreen()', title: 'Plein écran', text: '⛶' }
//     ];
    
//     buttons.forEach(btnData => {
//       const button = document.createElement('button');
//       button.setAttribute('onclick', btnData.onclick);
//       button.title = btnData.title;
//       button.textContent = btnData.text;
//       button.className = 'menu-button';
//       navContent.appendChild(button);
//     });
//   }

//   // Peupler la section recherche avec les sélecteurs
//   function populateSearchSection(moduleMainUI) {
//     const searchSection = document.getElementById('menu-section-search');
//     if (!searchSection) return;
    
//     const searchContent = searchSection.querySelector('.menu-section-content');
//     searchContent.innerHTML = '';
    
//     // Créer un conteneur pour le sélecteur de générations
//     const genDiv = document.createElement('div');
//     genDiv.className = 'control-container';
//     genDiv.innerHTML = '<label>Nombre de générations:</label>';
//     searchContent.appendChild(genDiv);
    
//     // Créer un conteneur pour le sélecteur de mode d'arbre
//     const modeDiv = document.createElement('div');
//     modeDiv.className = 'control-container';
//     modeDiv.innerHTML = '<label>Mode d\'arbre:</label>';
//     searchContent.appendChild(modeDiv);
    
//     // Créer un conteneur pour le champ de recherche
//     const searchDiv = document.createElement('div');
//     searchDiv.className = 'control-container';
//     searchDiv.innerHTML = '<label>Rechercher:</label>';
//     searchContent.appendChild(searchDiv);
    
//     // Créer un conteneur pour le sélecteur de racine
//     const rootDiv = document.createElement('div');
//     rootDiv.className = 'control-container';
//     rootDiv.innerHTML = '<label>Personne racine:</label>';
//     searchContent.appendChild(rootDiv);
    
//     // Utiliser le module mainUI pour créer les sélecteurs personnalisés
//     if (moduleMainUI && typeof moduleMainUI.initializeCustomSelectors === 'function') {
//       // Utiliser setTimeout pour s'assurer que l'UI est prête
//       setTimeout(() => {
//         // Maintenant, déplacer les sélecteurs existants dans le menu
//         moveControlToMenu('generations', genDiv);
//         moveControlToMenu('treeMode', modeDiv);
//         moveControlToMenu('search', searchDiv);
//         moveControlToMenu('root-person-results', rootDiv);
//       }, 500);
//     } else {
//       console.warn("Fonction initializeCustomSelectors non disponible");
//     }
//   }

//   // Fonction pour déplacer un contrôle existant dans le menu
//   function moveControlToMenu(controlId, container) {
//     const control = document.getElementById(controlId);
    
//     if (!control) {
//       console.warn(`Contrôle ${controlId} non trouvé`);
//       return;
//     }
    
//     // Si c'est un sélecteur personnalisé (div contenant d'autres éléments)
//     if (control.tagName === 'DIV' && control.querySelector('div')) {
//       // Cloner le contrôle
//       const clone = control.cloneNode(true);
//       clone.id = 'menu-' + controlId;
      
//       // Ajouter le clone dans le menu
//       container.appendChild(clone);
      
//       // Synchroniser les événements
//       const displayElement = clone.querySelector('div');
//       if (displayElement) {
//         displayElement.addEventListener('click', function() {
//           // Simuler un clic sur l'original
//           const originalDisplay = control.querySelector('div');
//           if (originalDisplay) {
//             originalDisplay.click();
//           }
//         });
//       }
//     } else if (control.tagName === 'INPUT' || control.tagName === 'SELECT') {
//       // Pour les contrôles standards, créer un clone
//       const clone = control.cloneNode(true);
//       clone.id = 'menu-' + controlId;
      
//       // Si c'est un input, synchroniser la valeur
//       if (clone.tagName === 'INPUT') {
//         clone.addEventListener('input', function() {
//           control.value = this.value;
//           // Déclencher un événement input sur l'original
//           const event = new Event('input', { bubbles: true });
//           control.dispatchEvent(event);
//         });
//       } else if (clone.tagName === 'SELECT') {
//         // Si c'est un select, synchroniser la sélection
//         clone.addEventListener('change', function() {
//           control.value = this.value;
//           // Déclencher un événement change sur l'original
//           const event = new Event('change', { bubbles: true });
//           control.dispatchEvent(event);
//         });
//       }
      
//       container.appendChild(clone);
//     }
//   }

//   // Peupler la section audio et animation
//   function populateAudioSection() {
//     const audioSection = document.getElementById('menu-section-audio');
//     if (!audioSection) return;
    
//     const audioContent = audioSection.querySelector('.menu-section-content');
//     audioContent.innerHTML = '';
    
//     const buttons = [
//       { 
//         id: 'menu-speechToggleBtn',
//         originalId: 'speechToggleBtn',
//         onclick: 'toggleSpeech()', 
//         title: 'Activer/désactiver le son', 
//         text: '🔇' 
//       },
//       { 
//         id: 'menu-animationPauseBtn',
//         originalId: 'animationPauseBtn',
//         onclick: 'toggleAnimationPause()', 
//         title: 'Pause/lecture animation', 
//         text: '⏸️' 
//       },
//       { 
//         onclick: 'processNamesCloudWithDate({ type: "prenoms", startDate: 1500, endDate: new Date().getFullYear(), scope: "all" })', 
//         title: 'Nuage de noms', 
//         text: '👥' 
//       }
//     ];
    
//     buttons.forEach(btnData => {
//       // Vérifier si un bouton original existe
//       let button;
      
//       if (btnData.originalId) {
//         const originalBtn = document.getElementById(btnData.originalId);
//         if (originalBtn) {
//           // Cloner le bouton original
//           button = originalBtn.cloneNode(true);
//           button.id = btnData.id;
          
//           // Ajouter un événement pour synchroniser avec l'original
//           button.addEventListener('click', function() {
//             originalBtn.click();
//           });
//         } else {
//           // Fallback: créer un nouveau bouton
//           button = document.createElement('button');
//           button.textContent = btnData.text;
//           button.setAttribute('onclick', btnData.onclick);
//         }
//       } else {
//         // Créer un nouveau bouton
//         button = document.createElement('button');
//         button.textContent = btnData.text;
//         button.setAttribute('onclick', btnData.onclick);
//       }
      
//       button.title = btnData.title;
//       button.className = 'menu-button';
//       audioContent.appendChild(button);
//     });
//   }

//   // Peupler la section paramètres
//   function populateSettingsSection() {
//     const settingsSection = document.getElementById('menu-section-settings');
//     if (!settingsSection) return;
    
//     const settingsContent = settingsSection.querySelector('.menu-section-content');
//     settingsContent.innerHTML = '';
    
//     const buttons = [
//       { 
//         onclick: 'openSettingsModal()', 
//         title: 'Paramètres avancés', 
//         text: '⚙️' 
//       },
//       { 
//         onclick: 'returnToLogin()', 
//         title: 'Retour à l\'écran de connexion', 
//         text: '🔙' 
//       }
//     ];
    
//     buttons.forEach(btnData => {
//       const button = document.createElement('button');
//       button.setAttribute('onclick', btnData.onclick);
//       button.title = btnData.title;
//       button.textContent = btnData.text;
//       button.className = 'menu-button';
//       settingsContent.appendChild(button);
//     });
//   }

//   // Injecter les styles CSS
//   function injectStyles() {
//     const styleElement = document.createElement('style');
//     styleElement.id = 'hamburger-menu-styles';
    
//     styleElement.textContent = `
//       /* Style pour le bouton hamburger */
//       .hamburger-menu {
//         position: fixed;
//         top: 10px;
//         left: 10px;
//         z-index: 3000;
//         width: 40px;
//         height: 40px;
//         background-color: #4CAF50;
//         border-radius: 50%;
//         display: flex;
//         flex-direction: column;
//         justify-content: center;
//         align-items: center;
//         cursor: pointer;
//         box-shadow: 0 2px 5px rgba(0,0,0,0.3);
//         border: none;
//       }

//       .hamburger-menu span {
//         display: block;
//         width: 24px;
//         height: 3px;
//         margin: 2px 0;
//         background-color: white;
//         border-radius: 3px;
//         transition: all 0.3s ease;
//       }

//       /* Menu latéral */
//       .side-menu {
//         position: fixed;
//         top: 0;
//         left: -300px; /* Commence hors écran */
//         width: 280px;
//         height: 100%;
//         background-color: white;
//         box-shadow: 2px 0 5px rgba(0,0,0,0.2);
//         z-index: 2900;
//         transition: left 0.3s ease;
//         overflow-y: auto;
//         padding: 60px 10px 20px;
//       }

//       .side-menu.open {
//         left: 0; /* Affiché à l'écran */
//       }

//       /* Overlay pour fermer le menu en cliquant ailleurs */
//       .menu-overlay {
//         position: fixed;
//         top: 0;
//         left: 0;
//         width: 100%;
//         height: 100%;
//         background-color: rgba(0,0,0,0.5);
//         z-index: 2800;
//         display: none;
//       }

//       .menu-overlay.open {
//         display: block;
//       }

//       /* Styles pour les sections du menu */
//       .menu-section {
//         margin-bottom: 15px;
//         padding: 10px;
//         border-bottom: 1px solid #eee;
//       }

//       .menu-section h3 {
//         margin-top: 0;
//         margin-bottom: 10px;
//         font-size: 16px;
//         color: #333;
//       }

//       .menu-section-content {
//         display: flex;
//         flex-wrap: wrap;
//         gap: 8px;
//       }

//       /* Conteneurs de contrôles */
//       .control-container {
//         width: 100%;
//         margin-bottom: 10px;
//       }

//       .control-container label {
//         display: block;
//         margin-bottom: 5px;
//         font-size: 14px;
//         color: #555;
//       }

//       /* Boutons du menu */
//       .menu-button {
//         padding: 8px 12px;
//         background-color: #f0f0f0;
//         border: none;
//         border-radius: 4px;
//         cursor: pointer;
//       }

//       .menu-button:hover {
//         background-color: #e0e0e0;
//       }

//       /* Style pour le titre du menu */
//       .menu-title {
//         position: absolute;
//         top: 15px;
//         left: 60px;
//         font-size: 18px;
//         font-weight: bold;
//         color: #4CAF50;
//       }
      
//       /* S'assurer que le bouton hamburger est visible quand l'arbre est affiché */
//       body.tree-view .hamburger-menu,
//       #tree-container:not([style*="display: none"]) ~ .hamburger-menu {
//         display: flex !important;
//         z-index: 3000;
//       }
//     `;
    
//     // Ajouter la feuille de style si elle n'existe pas déjà
//     if (!document.getElementById('hamburger-menu-styles')) {
//       document.head.appendChild(styleElement);
//     }
//   }

//   // Basculer l'affichage du menu
//   function toggleMenu(open) {
//     if (!sideMenu || !menuOverlay) {
//       console.warn("Éléments du menu non disponibles pour toggleMenu");
//       return;
//     }
    
//     const isOpen = typeof open !== 'undefined' ? open : !sideMenu.classList.contains('open');
    
//     if (isOpen) {
//       // Peupler le menu avant de l'ouvrir
//       populateMenuWithControls();
      
//       sideMenu.classList.add('open');
//       menuOverlay.classList.add('open');
//     } else {
//       sideMenu.classList.remove('open');
//       menuOverlay.classList.remove('open');
//     }
//   }

//   // Fonction pour afficher le menu hamburger
//   function showHamburgerMenu() {
//     console.log("Affichage du menu hamburger");
    
//     // S'assurer que les éléments du menu sont créés
//     if (!document.getElementById('hamburger-menu')) {
//       createMenuElements();
//     }
    
//     // Afficher le bouton hamburger
//     const hamburgerMenu = document.getElementById('hamburger-menu');
//     if (hamburgerMenu) {
//       hamburgerMenu.style.display = 'flex';
//     }
//   }

//   // Fonction pour masquer le menu hamburger
//   function hideHamburgerMenu() {
//     console.log("Masquage du menu hamburger");
    
//     // Masquer le bouton hamburger
//     const hamburgerMenu = document.getElementById('hamburger-menu');
//     if (hamburgerMenu) {
//       hamburgerMenu.style.display = 'none';
//     }
    
//     // Fermer le menu s'il est ouvert
//     toggleMenu(false);
//   }

//   // Fonction pour ajouter des écouteurs d'événements pour détecter l'affichage de l'arbre
//   function setupTreeVisibilityDetection() {
//     // Observer les changements dans l'affichage du conteneur de l'arbre
//     const treeContainer = document.getElementById('tree-container');
//     if (treeContainer) {
//       const observer = new MutationObserver(function(mutations) {
//         mutations.forEach(function(mutation) {
//           if (mutation.type === 'attributes' && 
//               mutation.attributeName === 'style' && 
//               treeContainer.style.display === 'block') {
//             console.log("Arbre détecté comme visible, affichage du menu hamburger");
//             showHamburgerMenu();
//           }
//         });
//       });
      
//       observer.observe(treeContainer, { attributes: true });
//     }
    
//     // Détecter l'événement gedcomLoaded
//     document.addEventListener('gedcomLoaded', function() {
//       console.log("Événement gedcomLoaded détecté, affichage du menu hamburger");
//       showHamburgerMenu();
//     });
    
//     // Réagir au chargement de l'arbre
//     const originalLoadData = window.loadData;
//     if (typeof originalLoadData === 'function') {
//       window.loadData = async function() {
//         await originalLoadData.apply(this, arguments);
//         console.log("Fonction loadData exécutée, affichage du menu hamburger");
//         showHamburgerMenu();
//       };
//     }
//   }

//   // Initialisation
//   document.addEventListener('DOMContentLoaded', function() {
//     console.log("DOMContentLoaded, initialisation du menu hamburger");
//     createMenuElements();
//     setupTreeVisibilityDetection();
    
//     // Vérifier si l'arbre est déjà visible
//     const treeContainer = document.getElementById('tree-container');
//     if (treeContainer && treeContainer.style.display === 'block') {
//       console.log("Arbre déjà visible, affichage du menu hamburger");
//       showHamburgerMenu();
//     }
//   });

//   // Si le DOM est déjà chargé, initialiser immédiatement
//   if (document.readyState !== 'loading') {
//     console.log("DOM déjà chargé, initialisation du menu hamburger");
//     createMenuElements();
//     setupTreeVisibilityDetection();
    
//     // Vérifier si l'arbre est déjà visible
//     const treeContainer = document.getElementById('tree-container');
//     if (treeContainer && treeContainer.style.display === 'block') {
//       console.log("Arbre déjà visible, affichage du menu hamburger");
//       showHamburgerMenu();
//     }
//   }
  
//   // Exposer les fonctions au contexte global
//   window.showHamburgerMenu = showHamburgerMenu;
//   window.hideHamburgerMenu = hideHamburgerMenu;
// })();



