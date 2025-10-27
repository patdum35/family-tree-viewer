// helpHamburgerMenu.js - Menu hamburger d'aide pour l'interface de l'arbre généalogique
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
    hamburgerMenu.id = 'help-hamburger-menu';
    hamburgerMenu.className = 'help-hamburger-menu';
    hamburgerMenu.title = 'Aide';
    hamburgerMenu.style.display = 'none'; // Caché par défaut
    
    // Ajouter l'icône d'aide dans le bouton
    const helpIcon = document.createElement('span');
    helpIcon.textContent = '?';
    helpIcon.className = 'help-icon';
    hamburgerMenu.appendChild(helpIcon);
    
    // Créer l'overlay
    menuOverlay = document.createElement('div');
    menuOverlay.id = 'help-menu-overlay';
    menuOverlay.className = 'help-menu-overlay';
    
    // Créer le menu latéral
    sideMenu = document.createElement('div');
    sideMenu.id = 'help-side-menu';
    sideMenu.className = 'help-side-menu';
    
    // Ajouter le titre du menu
    const menuTitle = document.createElement('div');
    menuTitle.className = 'help-menu-title';
    menuTitle.textContent = 'Guide d\'utilisation';
    sideMenu.appendChild(menuTitle);
    
    // Créer les sections d'aide
    createNavigationHelpSection();
    createSearchHelpSection();
    createDisplayHelpSection();
    createAudioHelpSection();
    createSettingsHelpSection();
    
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
    
    menuInitialized = true;
    console.log("Menu d'aide initialisé avec succès");
  }
  
  // Fonction pour créer une section d'aide
  function createHelpSection(title) {
    const container = document.createElement('div');
    container.className = 'help-section';
    
    const heading = document.createElement('h3');
    heading.textContent = title;
    container.appendChild(heading);
    
    const content = document.createElement('div');
    content.className = 'help-section-content';
    container.appendChild(content);
    
    return { container, content };
  }

  // Créer la section d'aide sur la navigation
  function createNavigationHelpSection() {
    const section = createHelpSection('Navigation dans l\'arbre');
    
    section.content.innerHTML = `
      <div class="help-item">
        <div class="help-icon-box">➕</div>
        <div class="help-text">
          <strong>Zoom avant</strong>
          <p>Agrandit l'arbre pour voir plus de détails.</p>
        </div>
      </div>
      <div class="help-item">
        <div class="help-icon-box">➖</div>
        <div class="help-text">
          <strong>Zoom arrière</strong>
          <p>Réduit l'arbre pour voir plus d'ensemble.</p>
        </div>
      </div>
      <div class="help-item">
        <div class="help-icon-box">🏠</div>
        <div class="help-text">
          <strong>Réinitialiser la vue</strong>
          <p>Recentre l'arbre sur la personne racine.</p>
        </div>
      </div>
      <div class="help-item">
        <div class="help-icon-box">⛶</div>
        <div class="help-text">
          <strong>Plein écran</strong>
          <p>Active ou désactive le mode plein écran.</p>
        </div>
      </div>
    `;
    
    sideMenu.appendChild(section.container);
  }

  // Créer la section d'aide sur la recherche
  function createSearchHelpSection() {
    const section = createHelpSection('Recherche de personnes');
    
    section.content.innerHTML = `
      <div class="help-item">
        <div class="help-icon-box">🔍</div>
        <div class="help-text">
          <strong>Recherche de personnes</strong>
          <p>Saisissez un nom ou un prénom dans le champ "🔍nom" pour rechercher une personne dans l'arbre affiché.</p>
        </div>
      </div>
      <div class="help-item">
        <div class="help-icon-box">🌳</div>
        <div class="help-text">
          <strong>Sélection de la racine</strong>
          <p>Pour changer la personne racine de l'arbre:</p>
          <ol>
            <li>Tapez un nom dans le champ "🔍racine"</li>
            <li>Sélectionnez une personne dans la liste déroulante</li>
          </ol>
        </div>
      </div>
    `;
    
    sideMenu.appendChild(section.container);
  }

  // Créer la section d'aide sur l'affichage
  function createDisplayHelpSection() {
    const section = createHelpSection('Options d\'affichage');
    
    section.content.innerHTML = `
      <div class="help-item">
        <div class="help-icon-box">🔢</div>
        <div class="help-text">
          <strong>Nombre de générations</strong>
          <p>Sélectionnez le nombre de générations à afficher dans l'arbre (de 2 à 101).</p>
        </div>
      </div>
      <div class="help-item">
        <div class="help-icon-box">⬆️</div>
        <div class="help-text">
          <strong>Mode d'arbre</strong>
          <p>Choisissez le type d'arbre à afficher:</p>
          <ul>
            <li><strong>Asc.</strong> - Affiche les ancêtres de la personne racine</li>
            <li><strong>Desc.</strong> - Affiche les descendants de la personne racine</li>
            <li><strong>A+D</strong> - Affiche à la fois les ancêtres et les descendants</li>
          </ul>
        </div>
      </div>
    `;
    
    sideMenu.appendChild(section.container);
  }

  // Créer la section d'aide sur l'audio et l'animation
  function createAudioHelpSection() {
    const section = createHelpSection('Audio et Animation');
    
    section.content.innerHTML = `
      <div class="help-item">
        <div class="help-icon-box">🗣️</div>
        <div class="help-text">
          <strong>Son</strong>
          <p>Active ou désactive le son pendant l'animation.</p>
        </div>
      </div>
      <div class="help-item">
        <!-- <div class="help-icon-box">⏸</div> -->
        <div class=""play-btn"><span class="icon">&#x23F8;</span></div>
        <div class="help-text">
          <strong>Pause/Lecture</strong>
          <p>Met en pause ou reprend l'animation en cours.</p>
        </div>
      </div>
      <div class="help-item">
        <div class="help-icon-box">👥</div>
        <div class="help-text">
          <strong>Nuage de noms</strong>
          <p>Affiche une visualisation en nuage des prénoms, noms, métiers, durée de vie, etc.</p>
        </div>
      </div>
    `;

    
    sideMenu.appendChild(section.container);
  }

  // Créer la section d'aide sur les paramètres
  function createSettingsHelpSection() {
    const section = createHelpSection('Paramètres et autres options');
    
    section.content.innerHTML = `
      <div class="help-item">
        <div class="help-icon-box">⚙️</div>
        <div class="help-text">
          <strong>Paramètres avancés</strong>
          <p>Ouvre le menu des paramètres pour configurer:</p>
          <ul>
            <li>L'ID de l'ancêtre cible pour l'animation</li>
            <li>Le nombre de prénoms à afficher (de 1 à 4)</li>
            <li>Les options de géocodage local</li>
          </ul>
        </div>
      </div>
      <div class="help-item">
        <div class="help-icon-box">🔙</div>
        <div class="help-text">
          <strong>Retour à l'écran de connexion</strong>
          <p>Quitte l'affichage de l'arbre et retourne à l'écran d'accueil.</p>
        </div>
      </div>
    `;
    
    sideMenu.appendChild(section.container);
  }

  // Injecter les styles CSS
  function injectStyles() {
    const styleElement = document.createElement('style');
    styleElement.id = 'help-hamburger-menu-styles';
    
    styleElement.textContent = `
      /* Style pour le bouton hamburger d'aide */
      .help-hamburger-menu {
        position: fixed;
        top: 10px;
        right: 10px; /* Positionné à droite au lieu de gauche */
        z-index: 3000;
        width: 40px;
        height: 40px;
        background-color: #2196F3; /* Bleu au lieu de vert */
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        border: none;
      }

      .help-icon {
        color: white;
        font-size: 24px;
        font-weight: bold;
      }

      /* Menu latéral */
      .help-side-menu {
        position: fixed;
        top: 0;
        right: -350px; /* Commence hors écran à droite */
        width: 330px;
        height: 100%;
        background-color: white;
        box-shadow: -2px 0 5px rgba(0,0,0,0.2);
        z-index: 2900;
        transition: right 0.3s ease;
        overflow-y: auto;
        padding: 60px 15px 20px;
      }

      .help-side-menu.open {
        right: 0; /* Affiché à l'écran */
      }

      /* Overlay pour fermer le menu en cliquant ailleurs */
      .help-menu-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
        z-index: 2800;
        display: none;
      }

      .help-menu-overlay.open {
        display: block;
      }

      /* Styles pour les sections d'aide */
      .help-section {
        margin-bottom: 20px;
        padding: 10px;
        border-bottom: 1px solid #e0e0e0;
      }

      .help-section h3 {
        margin-top: 0;
        margin-bottom: 15px;
        font-size: 18px;
        color: #2196F3;
        border-left: 4px solid #2196F3;
        padding-left: 10px;
      }

      .help-section-content {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }

      /* Style pour les éléments d'aide */
      .help-item {
        display: flex;
        gap: 12px;
        align-items: flex-start;
      }

      .help-icon-box {
        min-width: 36px;
        height: 36px;
        background-color: #f0f8ff;
        border-radius: 6px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 18px;
      }

      .help-text {
        flex: 1;
      }

      .help-text strong {
        display: block;
        margin-bottom: 5px;
        color: #333;
      }

      .help-text p, .help-text ul, .help-text ol {
        margin: 0;
        color: #666;
        font-size: 14px;
      }

      .help-text ul, .help-text ol {
        padding-left: 20px;
        margin-top: 5px;
      }

      /* Style pour le titre du menu */
      .help-menu-title {
        position: absolute;
        top: 15px;
        left: 20px;
        font-size: 20px;
        font-weight: bold;
        color: #2196F3;
      }
      
      /* S'assurer que le bouton hamburgera d'aide est visible quand l'arbre est affiché */
      #tree-container:not([style*="display: none"]) ~ .help-hamburger-menu {
        display: flex !important;
      }
      
      /* Support des appareils mobiles */
      @media screen and (max-width: 768px) {
        .help-side-menu {
          width: 85%;
          right: -90%;
        }
        
        .help-item {
          flex-direction: column;
          gap: 5px;
        }
        
        .help-icon-box {
          margin-bottom: 5px;
        }
      }
    `;
    
    // Ajouter la feuille de style si elle n'existe pas déjà
    if (!document.getElementById('help-hamburger-menu-styles')) {
      document.head.appendChild(styleElement);
    }
  }

  // Basculer l'affichage du menu
  function toggleMenu(open) {
    if (!sideMenu || !menuOverlay) {
      console.warn("Éléments du menu d'aide non disponibles pour toggleMenu");
      return;
    }
    
    const isOpen = typeof open !== 'undefined' ? open : !sideMenu.classList.contains('open');
    
    if (isOpen) {
      sideMenu.classList.add('open');
      menuOverlay.classList.add('open');
    } else {
      sideMenu.classList.remove('open');
      menuOverlay.classList.remove('open');
    }
  }

  // Fonction pour afficher le menu d'aide
  function showHelpMenu() {
    console.log("Affichage du menu d'aide");
    
    if (!menuInitialized) {
      createMenuElements();
    }
    
    if (hamburgerMenu) {
      hamburgerMenu.style.display = 'flex';
    }
  }

  // Fonction pour masquer le menu d'aide
  function hideHelpMenu() {
    console.log("Masquage du menu d'aide");
    
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

  // Observer le conteneur de l'arbre pour afficher/masquer le menu d'aide
  function observeTreeContainer() {
    const treeContainer = document.getElementById('tree-container');
    
    if (treeContainer) {
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            if (treeContainer.style.display === 'block') {
              console.log("Arbre visible, affichage du menu d'aide");
              showHelpMenu();
            } else {
              console.log("Arbre invisible, masquage du menu d'aide");
              hideHelpMenu();
            }
          }
        });
      });
      
      observer.observe(treeContainer, { attributes: true });
      
      // Vérifier l'état initial
      if (treeContainer.style.display === 'block') {
        console.log("Arbre déjà visible, affichage du menu d'aide");
        showHelpMenu();
      }
    }
  }

  // Initialisation au chargement de la page
  function init() {
    if (!menuInitialized) {
      createMenuElements();
      observeTreeContainer();
      
      // Écouter l'événement gedcomLoaded
      document.addEventListener('gedcomLoaded', function() {
        console.log("Événement gedcomLoaded détecté, affichage du menu d'aide");
        showHelpMenu();
      });
      
      // Intercepter loadData
      const originalLoadData = window.loadData;
      if (typeof originalLoadData === 'function') {
        window.loadData = async function() {
          await originalLoadData.apply(this, arguments);
          console.log("Données chargées, affichage du menu d'aide");
          showHelpMenu();
        };
      }
    }
  }

  // Lancer l'initialisation quand le DOM est prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Exposer les fonctions au contexte global
  window.showHelpMenu = showHelpMenu;
  window.hideHelpMenu = hideHelpMenu;
})();