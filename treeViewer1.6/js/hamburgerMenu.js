
import { state } from './main.js';
import { createCustomSelector, createOptionsFromLists } from './UIutils.js';

  // Variables pour garder une référence aux éléments
  let hamburgerMenu, sideMenu, menuOverlay;

  // Fonction de traduction pour le menu hamburger
  function getMenuTranslation(key) {
    const translations = {
      'fr': {
        'menuTitle': 'Menu de l\'arbre',
        'menuprincipal': 'Menu principal',
        'treeMode': 'arbre',
        'generations': 'nb géné',
        'firstNames': 'prénoms',
        'searchPlaceholder': '🔍nom',
        'rootPersonLabel': 'Sélect. personne racine',
        'rootSearch': '🔍 personne racine',
        'soundToggle': 'Activer/désactiver le son',
        'animationPause': 'Pause animation',
        'animationPlay': 'lecture animation',
        'settings': 'Paramètres avancés',
        'section_display': 'Affichage',
        'section_audio': 'Animation et audio',
        'section_root': 'Racine',
        'section_modes': 'Modes',
        'section_namecloud': 'Nuage de mots',
        'section_settings': 'Fonds d\'écran',
        'section_search': 'Recherche dans l\'arbre',
        'zoomIn': 'Zoom avant',
        'zoomOut': 'Zoom arrière',
        'resetView': 'Réinitialiser la vue',
        'fullscreen': 'Plein écran',
        'backgroundLabel': 'Fond d\'écran',
        'nameCloudLabel': 'Nuage de mots',
        'backToLogin': 'Retour à l\'écran de connexion',
        'menuAvailable': 'Menu principal disponible',
        'fistNameUpdated': 'Nombre de prénoms mis à jour',
        'selectDemo': 'Sélectionner une démo',
        'selectDemoToDisplay': 'Sélectionner une démo à afficher',
        'nbFirstNameToDisplay': 'Nombre de prénoms à afficher'


      },
      'en': {
        'menuTitle': 'Tree Menu',
        'menuprincipal': 'Main menu',
        'treeMode': 'tree',
        'generations': 'gen nb',
        'firstNames': 'first names',
        'searchPlaceholder': '🔍name',
        'rootPersonLabel': 'Select root person',
        'rootSearch': '🔍 search root person',
        'soundToggle': 'Toggle sound',
        'animationPause': 'Pause animation',
        'animationPlay': 'Play animation',
        'settings': 'Advanced settings',
        'section_display': 'Display',
        'section_audio': 'Animation and audio',
        'section_root': 'Root',
        'section_modes': 'Modes',
        'section_namecloud': 'Word cloud',
        'section_settings': 'Backgrounds',
        'section_search': 'Tree search',
        'zoomIn': 'Zoom in',
        'zoomOut': 'Zoom out',
        'resetView': 'Reset view',
        'fullscreen': 'Fullscreen',
        'backgroundLabel': 'Background',
        'nameCloudLabel': 'Word cloud',
        'backToLogin': 'Back to login screen',
        'menuAvailable': 'Main menu available',
        'fistNameUpdated': 'First names updated',
        'selectDemo': 'Select demo',
        'selectDemoToDisplay': 'Select demo to display',
        'nbFirstNameToDisplay': 'Number of first names to display'
      },
      'es': {
        'menuTitle': 'Menú del árbol',
        'menuprincipal': 'Menú principal',
        'treeMode': 'árbol',
        'generations': 'núm gen',
        'firstNames': 'nombres',
        'searchPlaceholder': '🔍nombre',
        'rootPersonLabel': 'Selec. persona raíz',
        'rootSearch': '🔍 buscar persona raíz',
        'soundToggle': 'Activar/desactivar sonido',
        'animationPause': 'Pausar animación',
        'animationPlay': 'Reproducir animación',
        'settings': 'Configuración avanzada',
        'section_display': 'Visualización',
        'section_audio': 'Animación y audio',
        'section_root': 'Raíz',
        'section_modes': 'Modos',
        'section_namecloud': 'Nube de palabras',
        'section_settings': 'Fondos de pantalla',
        'section_search': 'Búsqueda en el árbol',
        'zoomIn': 'Acercar',
        'zoomOut': 'Alejar',
        'resetView': 'Restablecer vista',
        'fullscreen': 'Pantalla completa',
        'backgroundLabel': 'Fondo de pantalla',
        'nameCloudLabel': 'Nube de palabras',
        'backToLogin': 'Volver a la pantalla de inicio',
        'menuAvailable': 'Menú principal disponible',
        'fistNameUpdated': 'Nombres actualizados',
        'selectDemo': 'Seleccionar demo',
        'selectDemoToDisplay': 'Seleccionar demo para mostrar',
        'nbFirstNameToDisplay': 'Número de nombres para mostrar'
      },
      'hu': {
        'menuTitle': 'Fa menü',
        'menuprincipal': 'Főmenü',
        'treeMode': 'fa',
        'generations': 'genSzám',
        'firstNames': 'keresz.',
        'searchPlaceholder': '🔍név',
        'rootPersonLabel': 'Gyökér személy kivála.', //sztása',
        'rootSearch': '🔍 gyökérszemély keresése',
        'soundToggle': 'Hang be/ki',
        'animationPause': 'Animáció szüneteltetése',
        'animationPlay': 'Animáció lejátszása',
        'settings': 'Speciális beállítások',
        'section_display': 'Megjelenítés',
        'section_audio': 'Animáció és hang',
        'section_root': 'Gyökér',
        'section_modes': 'Módok',
        'section_namecloud': 'Szófelhő',
        'section_settings': 'Hátterek',
        'section_search': 'Fa keresés',
        'zoomIn': 'Nagyítás',
        'zoomOut': 'Kicsinyítés',
        'resetView': 'Nézet visszaállítása',
        'fullscreen': 'Teljes képernyő',
        'backgroundLabel': 'Háttér',
        'nameCloudLabel': 'Szófelhő',
        'backToLogin': 'Vissza a bejelentkezési képernyőre',
        'menuAvailable': 'Főmenü elérhető',
        'fistNameUpdated': 'Keresztnevek frissítve',
        'selectDemo': 'Demó kiválasztása',
        'selectDemoToDisplay': 'Demó kiválasztása megjelenítéshez',
        'nbFirstNameToDisplay': 'Megjelenítendő keresztnevek száma'
      }
    };

    // Obtenir la langue actuelle depuis CURRENT_LANGUAGE ou l'attribut lang du document
    const currentLang = window.CURRENT_LANGUAGE || 'fr';
    
    // Retourner la traduction ou le fallback en français
    return translations[currentLang]?.[key] || translations['fr'][key];
  }

  export function resizeHamburger() {
    // Mettre à jour la classe de hauteur
    updateHeightClass();
    
    // Si le menu n'est pas initialisé, rien à faire
    if (!state.menuHamburgerInitialized) {
      return;
    }
    
    // Référencer les éléments du menu
    const sideMenu = document.getElementById('side-menu');
    const hamburgerMenu = document.getElementById('hamburger-menu');
    
    // Masquer le menu s'il est ouvert
    if (sideMenu && sideMenu.classList.contains('open')) {
      toggleMenu(false);
    }
    
    // Attendre que le toggle soit terminé
    setTimeout(() => {
      // Mettre à jour les styles en fonction de la nouvelle hauteur
      updateMenuStyles();
      
      // Synchroniser les sélecteurs si nécessaire
      syncCustomSelectors();
      
      console.log("Menu hamburger redimensionné avec succès");
    }, 200);
  }
  
  // Nouvelle fonction pour mettre à jour les styles sans recréer le menu
  function updateMenuStyles() {
    const height = window.innerHeight;
    
    // Adapter les sections
    document.querySelectorAll('.menu-section').forEach((section, index) => {
      // Réinitialiser d'abord les styles
      section.style.margin = '';
      section.style.padding = '';
      
      // Appliquer les styles appropriés selon la taille d'écran
      if (height < 400) {
        section.style.margin = '2px 0';
        section.style.padding = '3px';
      } else if (height < 800) {
        section.style.margin = '3px 0';
        section.style.padding = '5px';
      }
      
      // Adapter les titres des sections
      const heading = section.querySelector('h3');
      if (heading) {
        heading.style.fontSize = '';
        heading.style.marginTop = '';
        heading.style.marginBottom = '';
        heading.style.display = '';
        
        // Masquer certains titres sur petits écrans
        const title = heading.textContent;
        if (height < 400 && (
            title === 'Animation et audio' || 
            title === 'Racine' || 
            title === 'Modes' || 
            title === 'Nuage de mots' || 
            title === 'Fonds d\'écran' ||
            title === 'Affichage'
        )) {
          heading.style.display = 'none';
        } else if (height < 400) {
          heading.style.fontSize = '12px';
          heading.style.marginTop = '0';
          heading.style.marginBottom = '3px';
        } else if (height < 800) {
          heading.style.fontSize = '14px';
          heading.style.marginTop = '0';
          heading.style.marginBottom = '5px';
        }
      }
      
      // Adapter le contenu des sections
      const content = section.querySelector('.menu-section-content');
      if (content) {
        content.style.gap = '';
        
        if (height < 400) {
          content.style.gap = '3px';
        } else if (height < 800) {
          content.style.gap = '5px';
        }
      }
    });
    
    // Adapter les boutons et les spans
    document.querySelectorAll('.side-menu button span').forEach(span => {
      span.style.fontSize = '';
      
      if (height < 400) {
        span.style.fontSize = '16px';
      } else if (height < 800) {
        span.style.fontSize = '18px';
      }
    });
    
    // Adapter les labels
    document.querySelectorAll('.menu-section-content label').forEach(label => {
      label.style.fontSize = '';
      label.style.marginBottom = '';
      
      if (height < 400) {
        label.style.fontSize = '11px';
        label.style.marginBottom = '1px';
      } else if (height < 800) {
        label.style.fontSize = '12px';
        label.style.marginBottom = '2px';
      }
    });
    
    // Mise à jour des éléments spécifiques pour chaque section
    updateAudioSectionStyles();
    updateRootSectionStyles();
    updateModeSectionStyles();
    updateSearchSectionStyles();


    // Gérer  spécifiquement les labels à côté des boutons dans les sections de paramètres et affichage
    if (height < 400) {
        // Gestion du label pour le bouton paramètres
        let settingsBtn = document.getElementById('menu-settingsBtn');
        if (settingsBtn) {
            // Vérifier si le label existe déjà
            let labelExists = false;
            let parent = settingsBtn.parentElement;
            
            // Vérifier si le parent est un SPAN (label)
            if (parent.tagName === 'SPAN' && parent.childNodes[0].nodeType === Node.TEXT_NODE) {
                labelExists = true;
            }
            
            // Créer le label s'il n'existe pas
            if (!labelExists) {
                const section = settingsBtn.closest('.menu-section-content');
                if (section) {
                  section.removeChild(settingsBtn);
                  
                  const labelContainer = document.createElement('span');
                  labelContainer.textContent = 'Fond d\'écran';
                  labelContainer.style.fontSize = '11px';
                  labelContainer.appendChild(settingsBtn);
                  section.appendChild(labelContainer);
                  
                  // Ajuster la taille et l'espacement
                  settingsBtn.style.marginRight = '10px';
                  const span = settingsBtn.querySelector('span');
                  if (span) span.style.fontSize = '18px';
                }
            }
        }


        settingsBtn = document.getElementById('menu-nameCloudBtn');
        if (settingsBtn) {
            // Vérifier si le label existe déjà
            let labelExists = false;
            let parent = settingsBtn.parentElement;
            
            // Vérifier si le parent est un SPAN (label)
            if (parent.tagName === 'SPAN' && parent.childNodes[0].nodeType === Node.TEXT_NODE) {
                labelExists = true;
            }
            
            // Créer le label s'il n'existe pas
            if (!labelExists) {
                const section = settingsBtn.closest('.menu-section-content');
                if (section) {
                  section.removeChild(settingsBtn);
                  
                  const labelContainer = document.createElement('span');
                  labelContainer.textContent = "Nuage de mots";
                  labelContainer.style.fontSize = '11px';
                  labelContainer.appendChild(settingsBtn);
                  section.appendChild(labelContainer);
                  
                  // Ajuster la taille et l'espacement
                  settingsBtn.style.marginRight = '10px';
                  const span = settingsBtn.querySelector('span');
                  if (span) span.style.fontSize = '18px';
                }
            }
        }
        
        // Ajuster les boutons d'affichage
        document.querySelectorAll('.menu-section h3').forEach(heading => {
            if (heading.textContent === 'Affichage') {
                const section = heading.closest('.menu-section');
                if (section) {
                  const buttons = section.querySelectorAll('button');
                  buttons.forEach(button => {
                      button.style.marginRight = '8px';
                      const span = button.querySelector('span');
                      if (span) span.style.fontSize = '20px';
                  });
                }
            }
        });




    } else {
        // Si l'écran est plus grand, retirer les labels
        document.querySelectorAll('.menu-section-content > span').forEach(span => {
            if (span.childNodes[0].nodeType === Node.TEXT_NODE && (span.textContent.startsWith('Fond d\'écran') || span.textContent.startsWith('Nuage de mots'))) {
                const section = span.parentElement;
                const button = span.querySelector('button');
                if (section && button) {
                section.removeChild(span);
                section.appendChild(button);
                }
            }
        });
    }






  }
  


  // Fonctions auxiliaires pour mettre à jour les styles spécifiques
  function updateAudioSectionStyles() {
    const height = window.innerHeight;
    const container = document.getElementById('audio-controls-container');
    
    if (container) {
      container.style.gap = '';
      container.style.marginTop = '';
      
      if (height < 400) {
        container.style.gap = '2px';
        container.style.marginTop = '2px';
      } else if (height < 800) {
        container.style.gap = '3px';
        container.style.marginTop = '3px';
      }
    }
  }
  
  function updateRootSectionStyles() {
    const height = window.innerHeight;
    const rootSearchPlaceholder = document.getElementById('menu-root-person-search-placeholder');
    const rootResultsPlaceholder = document.getElementById('menu-root-person-results-placeholder');
    
    if (rootSearchPlaceholder) {
      rootSearchPlaceholder.style.margin = '';
      
      if (height < 400) {
        rootSearchPlaceholder.style.margin = '2px 0';
      } else if (height < 800) {
        rootSearchPlaceholder.style.margin = '3px 0';
      } else {
        rootSearchPlaceholder.style.margin = '5px 0';
      }
    }
    
    if (rootResultsPlaceholder) {
      rootResultsPlaceholder.style.margin = '';
      
      if (height < 400) {
        rootResultsPlaceholder.style.margin = '2px 0';
      } else if (height < 800) {
        rootResultsPlaceholder.style.margin = '3px 0';
      } else {
        rootResultsPlaceholder.style.margin = '5px 0';
      }
    }
  }
  
  function updateModeSectionStyles() {
    const height = window.innerHeight;
    const modePlaceholder = document.getElementById('menu-treeMode-placeholder');
    const genPlaceholder = document.getElementById('menu-generations-placeholder');
    const prenomsPlaceholder = document.getElementById('menu-prenoms-placeholder');
    
    if (modePlaceholder) {
      modePlaceholder.style.margin = '';
      
      if (height < 400) {
        modePlaceholder.style.margin = '2px 0';
      } else if (height < 800) {
        modePlaceholder.style.margin = '3px 0';
      } else {
        modePlaceholder.style.margin = '5px 0';
      }
    }
    
    if (genPlaceholder) {
      genPlaceholder.style.margin = '';
      const genDiv = document.getElementById('menu-generations-container');
      
      if (genDiv) {
        genDiv.style.marginLeft = '';
        
        if (height < 400) {
          genPlaceholder.style.margin = '1px 0';
          genDiv.style.marginLeft = '5px';
        } else if (height < 800) {
          genPlaceholder.style.margin = '2px 0';
          genDiv.style.marginLeft = '8px';
        } else {
          genPlaceholder.style.margin = '2px 0';
          genDiv.style.marginLeft = '10px';
        }
      }
    }
    
    if (prenomsPlaceholder) {
      prenomsPlaceholder.style.margin = '';
      const prenomsDiv = document.getElementById('menu-prenoms-container');
      
      if (prenomsDiv) {
        prenomsDiv.style.marginLeft = '';
        
        if (height < 400) {
          prenomsPlaceholder.style.margin = '2px 0';
          prenomsDiv.style.marginLeft = '5px';
        } else if (height < 800) {
          prenomsPlaceholder.style.margin = '3px 0';
          prenomsDiv.style.marginLeft = '8px';
        } else {
          prenomsPlaceholder.style.margin = '5px 0';
          prenomsDiv.style.marginLeft = '10px';
        }
      }
    }
  }
  
  function updateSearchSectionStyles() {
    const height = window.innerHeight;
    const searchInput = document.getElementById('menu-search');
    
    if (searchInput) {
      searchInput.style.fontSize = '';
      searchInput.style.padding = '';
      
      if (height < 400) {
        searchInput.style.fontSize = '11px';
        searchInput.style.padding = '2px';
      } else if (height < 800) {
        searchInput.style.fontSize = '12px';
        searchInput.style.padding = '3px';
      } else {
        searchInput.style.fontSize = '13px';
      }
    }
  }
  

  



  // Fonction pour vérifier la hauteur de l'écran et appliquer les classes correspondantes
  function updateHeightClass() {
    const height = window.innerHeight;
    document.documentElement.classList.remove('small-screen', 'medium-screen');
    
    if (height < 400) {
      document.documentElement.classList.add('small-screen');
    } else if (height < 800) {
      document.documentElement.classList.add('medium-screen');
    }
    // Pas de classe pour les grands écrans pour préserver le layout original
  }


 // Créer les éléments du menu
 function createMenuElements() {
      // Injecter les styles nécessaires
      injectStyles();
      
      // Mettre à jour la classe de hauteur initiale
      updateHeightClass();
      
      // Ajouter un écouteur d'événement pour les changements de taille
      window.addEventListener('resize', updateHeightClass);
      
      // Créer le bouton hamburger
      hamburgerMenu = document.createElement('button');
      hamburgerMenu.id = 'hamburger-menu';
      hamburgerMenu.className = 'hamburger-menu';
      hamburgerMenu.title = getMenuTranslation('menuprincipal'); //'Menu principal';
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
      // menuTitle.textContent = 'Menu de l\'arbre';
      menuTitle.textContent = window.CURRENT_LANGUAGE === 'hu' ? 'Fa menü' : 
                              window.CURRENT_LANGUAGE === 'en' ? 'Tree Menu' :
                              window.CURRENT_LANGUAGE === 'es' ? 'Menú del árbol' : 
                              'Menu de l\'arbre';

      sideMenu.appendChild(menuTitle);
      
      // Créer les sections du menu
      createAudioSection(); // 0
      createRootSection();  //1
      createModeSection();  //3
      createNameCloudSection(); //0
      createDisplaySection();  //0
      createSettingsSection(); //1
      createSearchSection(); //2
      
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
// const sectionBackgroundColors = [
//     '#f9f9ff', // Bleu très pâle
//     '#f9fff9', // Vert très pâle
//     '#fff9f9', // Rouge très pâle
//     '#fffaf0', // Jaune très pâle
//     '#faf0ff'  // Violet très pâle
// ];

const sectionBackgroundColors = [
  '#f0f0ff', // Bleu pâle
  '#f0fff0', // Vert pâle
  '#fff0f0', // Rouge pâle
  '#fff5e6', // Jaune pâle
  '#f5e6ff'  // Violet pâle
];



  // Fonction pour créer une section de menu
function createSection(title, index = 0) {
    const container = document.createElement('div');
    container.className = 'menu-section';
  
    // Appliquer une couleur de fond pâle différente selon l'index
    const colorIndex = index % sectionBackgroundColors.length;
    container.style.backgroundColor = sectionBackgroundColors[colorIndex];
    container.style.borderRadius = '5px'; // Coins légèrement arrondis
    
    // On ne modifie les marges que pour les petits écrans
    const height = window.innerHeight;
    if (height < 400) {
      container.style.margin = '2px 0';
      container.style.padding = '3px';
    } else if (height < 800) {
      container.style.margin = '3px 0';
      container.style.padding = '5px';
    }
    
    const heading = document.createElement('h3');
    heading.textContent = title;
    
    // En mode petit écran, masquer certains titres spécifiques
    if (height < 400 && (
        title === 'Animation et audio' || 
        title === 'Racine' || 
        title === 'Modes' || 
        title === 'Affichage' || // || 
        title === 'Nuage de mots' ||
        title === 'Fonds d\'écran'
    )) {
      heading.style.display = 'none'; // Masquer complètement le titre
      // Option alternative : heading.style.height = '0';
      // Option alternative : heading.style.fontSize = '0';
    } else if (height < 400) {
      // Pour les autres titres en petit écran
      heading.style.fontSize = '12px';
      heading.style.marginTop = '0';
      heading.style.marginBottom = '3px';
    } else if (height < 800) {
      heading.style.fontSize = '14px';
      heading.style.marginTop = '0';
      heading.style.marginBottom = '5px';
    }
    
    container.appendChild(heading);
    
    const content = document.createElement('div');
    content.className = 'menu-section-content';
    
    // Ajuster l'espacement du contenu uniquement pour les petits écrans
    if (height < 400) {
      content.style.gap = '3px';
    } else if (height < 800) {
      content.style.gap = '5px';
    }
    
    container.appendChild(content);
    
    return { container, content };
  }

  // Créer la section Navigation
  function createDisplaySection() {
    const height = window.innerHeight;
    // const section = createSection('Affichage', 3);  // Index 3
    const section = createSection(getMenuTranslation('section_display'), 3);
    
    // const buttons = [
    //   { onclick: 'zoomIn()', title: 'Zoom avant', text: '➕' },
    //   { onclick: 'zoomOut()', title: 'Zoom arrière', text: '➖' },
    //   { onclick: 'resetZoom()', title: 'Réinitialiser la vue', text: '🏠' },
    //   { onclick: 'toggleFullScreen()', title: 'Plein écran', text: '⛶' }
    // ];
    const buttons = [
      { onclick: 'zoomIn()', title: getMenuTranslation('zoomIn'), text: '➕' },
      { onclick: 'zoomOut()', title: getMenuTranslation('zoomOut'), text: '➖' },
      { onclick: 'resetZoom()', title: getMenuTranslation('resetView'), text: '🏠' },
      { onclick: 'toggleFullScreen()', title: getMenuTranslation('fullscreen'), text: '⛶' }
    ];
    
    buttons.forEach(buttonData => {
      const button = document.createElement('button');
      button.setAttribute('onclick', buttonData.onclick);
      button.title = buttonData.title;
      
      const span = document.createElement('span');
      span.textContent = buttonData.text;
      
      // Adapter uniquement pour les petits écrans
      if (height < 400) {
        span.style.fontSize = '20px';
        button.style.padding = '1px';
        button.style.marginRight = '8px';
      } else if (height < 800) {
        span.style.fontSize = '20px';
        button.style.padding = '2px';
      }
      // Pour les grands écrans, on conserve le style original
      
      button.appendChild(span);
      section.content.appendChild(button);
    });
    
    sideMenu.appendChild(section.container);
  }

  // Créer la section Root avec des placeholders pour les sélecteurs
  function createRootSection() {
    const height = window.innerHeight;
    // const section = createSection('Racine', 1);  // Index 1
    const section = createSection(getMenuTranslation('section_root'), 1);
    section.content.style.flexDirection = 'column';
    
    // Créer un div pour contenir le sélecteur de recherche racine
    const rootSearchDiv = document.createElement('div');
    rootSearchDiv.id = 'menu-root-search-container';
    
    // Adapter uniquement pour les petits écrans
    if (height < 400) {
      rootSearchDiv.style.marginBottom = '2px';
    } else if (height < 800) {
      rootSearchDiv.style.marginBottom = '3px';
    }
    // Pour les grands écrans, on conserve le style original
         
    // Ajouter un espace pour le champ de texte (sera remplacé)
    const rootSearchPlaceholder = document.createElement('div');
    rootSearchPlaceholder.id = 'menu-root-person-search-placeholder';
    rootSearchPlaceholder.style.width = '100%';
    
    // Adapter uniquement pour les petits écrans
    if (height < 400) {
      rootSearchPlaceholder.style.margin = '2px 0';
    } else if (height < 800) {
      rootSearchPlaceholder.style.margin = '3px 0';
    } else {
      rootSearchPlaceholder.style.margin = '5px 0'; // Valeur originale
    }
    
    rootSearchDiv.appendChild(rootSearchPlaceholder);
    section.content.appendChild(rootSearchDiv);
    
    // Créer un div pour contenir le sélecteur de résultats
    const rootResultsDiv = document.createElement('div');
    rootResultsDiv.id = 'menu-root-results-container';
    
    // Créer un placeholder pour le sélecteur personnalisé
    const rootResultsPlaceholder = document.createElement('div');
    rootResultsPlaceholder.id = 'menu-root-person-results-placeholder';
    rootResultsPlaceholder.style.width = '100%';
    
    // Adapter uniquement pour les petits écrans
    if (height < 400) {
      rootResultsPlaceholder.style.margin = '2px 0';
    } else if (height < 800) {
      rootResultsPlaceholder.style.margin = '3px 0';
    } else {
      rootResultsPlaceholder.style.margin = '5px 0'; // Valeur originale
    }
    
    rootResultsDiv.appendChild(rootResultsPlaceholder);
    section.content.appendChild(rootResultsDiv);
        
    sideMenu.appendChild(section.container);
  }

  // Créer la section Recherche a
  function createSearchSection() {
    const height = window.innerHeight;
    // const section = createSection('Recherche dans l\'arbre', 2);  // Index 2
    const section = createSection(getMenuTranslation('section_search'), 2);
    
    section.content.style.flexDirection = 'column';
     
    // Champ de recherche dans l'arbre
    const searchDiv = document.createElement('div');
    searchDiv.id = 'menu-search-container';
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.id = 'menu-search';
    // searchInput.placeholder = '🔍nom';
    searchInput.placeholder = getMenuTranslation('searchPlaceholder');
    searchInput.setAttribute('oninput', 'searchTree(this.value)');
    searchInput.style.width = '60%';
    searchInput.style.color = '#000';
    
    // Adapter uniquement pour les petits écrans
    if (height < 400) {
      searchInput.style.fontSize = '11px';
      searchInput.style.padding = '2px';
    } else if (height < 800) {
      searchInput.style.fontSize = '12px';
      searchInput.style.padding = '3px';
    } else {
      searchInput.style.fontSize = '13px'; // Valeur originale
    }
    
    searchDiv.appendChild(searchInput);
    section.content.appendChild(searchDiv);
    
    sideMenu.appendChild(section.container);
  }

  // Créer la section Affichage avec des placeholders pour les sélecteurs personnalisés
  function createModeSection() {
    const height = window.innerHeight;
    // const section = createSection('Modes', 3);  // Index 3
    const section = createSection(getMenuTranslation('section_modes'), 3);
    
    // Créer un div pour contenir le sélecteur de mode d'arbre
    const modeDiv = document.createElement('div');
    modeDiv.id = 'menu-treeMode-container';
    
    const modeLabel = document.createElement('label');
    // modeLabel.textContent = 'arbre';
    modeLabel.textContent = getMenuTranslation('treeMode');
    modeLabel.style.color = '#000';
    
    // Adapter uniquement pour les petits écrans
    if (height < 400) {
      modeLabel.style.fontSize = '11px';
      modeLabel.style.marginBottom = '1px';
    } else if (height < 800) {
      modeLabel.style.fontSize = '12px';
      modeLabel.style.marginBottom = '2px';
    }
    // Pour les grands écrans, on conserve le style original
    
    modeDiv.appendChild(modeLabel);
    
    // Créer un placeholder pour le sélecteur personnalisé
    const modePlaceholder = document.createElement('div');
    modePlaceholder.id = 'menu-treeMode-placeholder';
    modePlaceholder.style.width = '100%';
    
    // Adapter uniquement pour les petits écrans
    if (height < 400) {
      modePlaceholder.style.margin = '2px 0';
    } else if (height < 800) {
      modePlaceholder.style.margin = '3px 0';
    } else {
      modePlaceholder.style.margin = '5px 0'; // Valeur originale
    }
  
    modeDiv.style.marginLeft = '-2px'; // Conserver la valeur originale pour tous les écrans
    modeDiv.appendChild(modePlaceholder);
    section.content.appendChild(modeDiv);
  
    // Créer un div pour contenir le sélecteur de générations
    const genDiv = document.createElement('div');
    genDiv.id = 'menu-generations-container';
    
    const genLabel = document.createElement('label');
    // genLabel.textContent = 'nb géné';
    genLabel.textContent = getMenuTranslation('generations');
    genLabel.style.color = '#000';
    
    // Adapter uniquement pour les petits écrans
    if (height < 400) {
      genLabel.style.fontSize = '11px';
      genLabel.style.marginBottom = '1px';
    } else if (height < 800) {
      genLabel.style.fontSize = '12px';
      genLabel.style.marginBottom = '2px';
    }
    // Pour les grands écrans, on conserve le style original
    
    genDiv.appendChild(genLabel);
    
    // Créer un placeholder pour le sélecteur personnalisé
    const genPlaceholder = document.createElement('div');
    genPlaceholder.id = 'menu-generations-placeholder';
    genPlaceholder.style.width = '100%';
    
    // Adapter uniquement pour les petits écrans
    if (height < 400) {
      genPlaceholder.style.margin = '1px 0';
      genDiv.style.marginLeft = '5px';
    } else if (height < 800) {
      genPlaceholder.style.margin = '2px 0';
      genDiv.style.marginLeft = '8px';
    } else {
      genPlaceholder.style.margin = '2px 0'; // Valeur originale
      genDiv.style.marginLeft = '10px'; // Valeur originale
    }
    
    genDiv.appendChild(genPlaceholder);
    section.content.appendChild(genDiv);
    
    // Créer un div pour contenir le sélecteur du nombre de prénoms
    const prenomsDiv = document.createElement('div');
    prenomsDiv.id = 'menu-prenoms-container';
  
    const prenomsLabel = document.createElement('label');
    // prenomsLabel.textContent = 'prénoms';
    prenomsLabel.textContent = getMenuTranslation('firstNames');
    prenomsLabel.style.color = '#000';
    
    // Adapter uniquement pour les petits écrans
    if (height < 400) {
      prenomsLabel.style.fontSize = '11px';
      prenomsLabel.style.marginBottom = '1px';
    } else if (height < 800) {
      prenomsLabel.style.fontSize = '12px';
      prenomsLabel.style.marginBottom = '2px';
    }
    // Pour les grands écrans, on conserve le style original
    
    prenomsDiv.appendChild(prenomsLabel);
  
    // Créer un placeholder pour le sélecteur personnalisé
    const prenomsPlaceholder = document.createElement('div');
    prenomsPlaceholder.id = 'menu-prenoms-placeholder';
    prenomsPlaceholder.style.width = '100%';
    
    // Adapter uniquement pour les petits écrans
    if (height < 400) {
      prenomsPlaceholder.style.margin = '2px 0';
      prenomsDiv.style.marginLeft = '5px';
    } else if (height < 800) {
      prenomsPlaceholder.style.margin = '3px 0';
      prenomsDiv.style.marginLeft = '8px';
    } else {
      prenomsPlaceholder.style.margin = '5px 0'; // Valeur originale
      prenomsDiv.style.marginLeft = '10px'; // Valeur originale
    }
    
    prenomsDiv.appendChild(prenomsPlaceholder);
    section.content.appendChild(prenomsDiv);
    
    sideMenu.appendChild(section.container);
  }

  // Créer la section Audio et Animation
  function createAudioSection() {
    const height = window.innerHeight;
    // const section = createSection('Animation et audio', 0);  // Index 4
    const section = createSection(getMenuTranslation('section_audio'), 0);
    
    // Créer un conteneur flex unique pour tous les éléments
    const audioControlsContainer = document.createElement('div');
    audioControlsContainer.id = 'audio-controls-container'; // Ajout d'un ID pour le retrouver facilement
    audioControlsContainer.style.display = 'flex';
    audioControlsContainer.style.flexDirection = 'row';
    audioControlsContainer.style.alignItems = 'center';
    audioControlsContainer.style.justifyContent = 'space-between';
    audioControlsContainer.style.width = '100%';
    
    // Adapter uniquement pour les petits écrans
    if (height < 400) {
      audioControlsContainer.style.gap = '2px';
      audioControlsContainer.style.marginTop = '2px';
    } else if (height < 800) {
      audioControlsContainer.style.gap = '3px';
      audioControlsContainer.style.marginTop = '3px';
    } else {
      audioControlsContainer.style.gap = '5px'; // Valeur originale
      audioControlsContainer.style.marginTop = '5px'; // Valeur originale
    }
    
    // Créer un placeholder pour le sélecteur de démo
    const demoPlaceholder = document.createElement('div');
    demoPlaceholder.id = 'menu-demo-selector-placeholder';
    demoPlaceholder.style.flex = '0 0 auto';
    
    // Adapter uniquement pour les petits écrans
    if (height < 400) {
      demoPlaceholder.style.marginRight = '2px';
    } else if (height < 800) {
      demoPlaceholder.style.marginRight = '3px';
    } else {
      demoPlaceholder.style.marginRight = '5px'; // Valeur originale
    }
    
    audioControlsContainer.appendChild(demoPlaceholder);
    
    // Définir les boutons
    const buttons = [
      { 
        id: 'menu-speechToggleBtn',
        onclick: 'toggleSpeech2()', 
        title: getMenuTranslation('soundToggle'), //'Activer/désactiver le son', 
        text: '🔇' 
      },
      { 
        id: 'menu-animationPauseBtn',
        onclick: 'toggleAnimationPause()', 
        title: getMenuTranslation('animationPause'), //'Pause animation', 
        text: '⏸️' 
      },
      { 
        id: 'menu-animationPlayBtn',
        onclick: 'toggleAnimationPause()',  
        title: getMenuTranslation('animationPlay'), //'lecture animation', 
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
      
      // Adapter uniquement pour les petits écrans
      if (height < 400) {
        span.style.fontSize = '22px';
      } else if (height < 800) {
        span.style.fontSize = '22px';
      } else {
        span.style.fontSize = '22px'; // Valeur originale
      }
      
      button.appendChild(span);
      
      // Styles pour les boutons sans bordure
      button.style.border = 'none';
      button.style.backgroundColor = 'transparent';
      
      // Adapter uniquement pour les petits écrans
      if (height < 400) {
        button.style.padding = '2px';
      } else if (height < 800) {
        button.style.padding = '3px';
      } else {
        button.style.padding = '4px'; // Valeur originale
      }
      
      button.style.margin = '0';
      button.style.borderRadius = '4px';
      button.style.flex = '0 0 auto';
      
      audioControlsContainer.appendChild(button);
    });
    
    // Ajouter le conteneur à la section
    section.content.appendChild(audioControlsContainer);
    sideMenu.appendChild(section.container);
    
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
    const height = window.innerHeight;
    // const section = createSection('Nuage de mots', 0);
    const section = createSection(getMenuTranslation('section_namecloud'), 0);
    
    const buttons = [
      { 
        id: 'menu-nameCloudBtn',
        onclick: 'processNamesCloudWithDate({ type: \"prenoms\", startDate: 1500, endDate: new Date().getFullYear(), scope: \"all\" })', 
        title: getMenuTranslation('section_namecloud'), //'Nuage de noms', 
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
      
      // Adapter uniquement pour les petits écrans
      if (height < 400) {
        span.style.fontSize = '16px';
        button.style.padding = '1px';
      } else if (height < 800) {
        span.style.fontSize = '16px';
        button.style.padding = '2px';
      }
      // Pour les grands écrans, on conserve le style original
      
      button.appendChild(span);
      if (height < 400) {
        // Créer un conteneur pour le label + bouton
        const container = document.createElement('span');
        // container.textContent = "Nuage de mots";
        container.textContent = getMenuTranslation('nameCloudLabel');
        container.style.fontSize = '13px';
        container.appendChild(button);
        section.content.appendChild(container);
      } else {
            section.content.appendChild(button);
      }
    //   section.content.appendChild(button);
    });
    
    sideMenu.appendChild(section.container);
  }

  // Créer la section Paramètres
  function createSettingsSection() {
    const height = window.innerHeight;
    // const section = createSection('Fonds d\'écran', 1);
    const section = createSection(getMenuTranslation('section_settings'), 1);
    
    const buttons = [
      { 
        id: 'menu-settingsBtn',
        onclick: 'openSettingsModal()', 
        title: getMenuTranslation('settings'), //'Paramètres avancés', 
        text: '⚙️' 
      },
      { 
        onclick: 'returnToLogin()', 
        title: getMenuTranslation('backToLogin'), //'Retour à l\'écran de connexion', 
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
      
      // Adapter uniquement pour les petits écrans
      if (height < 400) {
        span.style.fontSize = '20px';
        button.style.padding = '1px';
        button.style.marginRight = '10px';
      } else if (height < 800) {
        span.style.fontSize = '20px';
        button.style.padding = '2px';
      }
      // Pour les grands écrans, on conserve le style original
      
      button.appendChild(span);
    //   section.content.appendChild(button);
      // À ajouter juste après la création du bouton ⚙️ et avant de l'ajouter au conteneur
        if (buttonData.text === '⚙️' && height < 400) {
            // Créer un conteneur pour le label + bouton
            const container = document.createElement('span');
            // container.textContent = 'Fond d\'écran';
            container.textContent = getMenuTranslation('backgroundLabel');
            container.style.fontSize = '13px';
            container.appendChild(button);
            section.content.appendChild(container);
        } else {
            section.content.appendChild(button);
        }
    });
    
    sideMenu.appendChild(section.container);
  }
  

// Fonction pour créer un sélecteur de démo
function createDemoSelector() {
    const height = window.innerHeight;
  
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
      typeOptions = ['démo1', 'démo2', 'démo3', 'démo4', 'démo5', 'démo6', 'démo7', 'démo8', 'démo9', 'démo10', 'démo11'];
      typeValues = ['demo1', 'demo2', 'demo3', 'demo4', 'demo5', 'demo6', 'demo7', 'demo8', 'demo9', 'demo10', 'demo11'];
      if (window.CURRENT_LANGUAGE === 'fr') {
        typeOptionsExpanded = ['Costaud la Planche', 'On descend tous de lui', 'comme un ouragan', 'Espace', 'Arabe du futur', 'Loup du Canada', "c'est normal", 'les bronzés', 'avant JC', 'Francs', 'Capet'];
      } else if (window.CURRENT_LANGUAGE === 'en') {
        typeOptionsExpanded = ['Lalatte castle', 'Our ancestor to all', 'Like a hurricane', 'Space', 'The Arab of the future', 'Wolf of Canada', "it's normal", 'les bronzed', 'before JC', 'Franks', 'Capet'];
      } else if (window.CURRENT_LANGUAGE === 'es') {
        typeOptionsExpanded = ['El castillo de Lalatte', '', 'Nuestro antepasado de todos', 'Como un huracán', 'Espacio', 'El árabe del futuro', 'Lobo de Canadá', 'es normal', 'los bronceados', 'antes de JC', 'Francs', 'Capet'];
      } else if (window.CURRENT_LANGUAGE === 'hu') {
        typeOptionsExpanded = ['Lalatte kastély', 'Mindenki ősünk', 'Mint egy hurrikán', 'Űr', 'A jövő arabja', 'Kanada farkasa', 'ez normális', 'a lebarnultakat', 'JC előtt', 'Franks', 'Capet'];
      }
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
      
      // Configurer les dimensions du sélecteur selon la hauteur de l'écran
      // On ne change les valeurs que pour les petits écrans
      let selectorSettings = {
        dimensions: {
          width: '50px', // Valeur originale
          height: '25px', // Valeur originale
          dropdownWidth: '190px', // Valeur originale
          dropdownHeight: '100px' // Valeur originale
        },
        padding: {
          display: { x: 4, y: 1 }, // Valeurs originales
          options: { x: 1, y: 2 } // Valeurs originales
        },
        arrow: {
          position: 'top-right',
          size: 5.5, // Valeur originale
          offset: { x: -5, y: 1} // Valeurs originales
        }
      };
      
      // Modifier seulement pour les petits écrans
      if (height < 400) {
        selectorSettings.dimensions.width = '45px';
        selectorSettings.dimensions.height = '20px';
        selectorSettings.dimensions.dropdownWidth = '180px';
        selectorSettings.dimensions.dropdownHeight = '160px';
        selectorSettings.padding.display.x = 3;
        selectorSettings.arrow.size = 4;
        selectorSettings.arrow.offset.x = -4;
      } else if (height < 800) {
        selectorSettings.dimensions.width = '45px';
        selectorSettings.dimensions.height = '22px';
        selectorSettings.dimensions.dropdownWidth = '180px';
        selectorSettings.dimensions.dropdownHeight = '240px';
        selectorSettings.padding.display.x = 3;
        selectorSettings.arrow.size = 5;
        selectorSettings.arrow.offset.x = -4;
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
        dimensions: selectorSettings.dimensions,
        padding: selectorSettings.padding,
        arrow: selectorSettings.arrow,
        customizeOptionElement: (optionElement, option) => {
          optionElement.textContent = option.expandedLabel;
          optionElement.style.textAlign = 'center';
          
          if (window.innerHeight < 400) {
            optionElement.style.padding = '6px 8px';
            optionElement.style.fontSize = '12px';
          } else if (window.innerHeight < 800) {
            optionElement.style.padding = '7px 8px';
            optionElement.style.fontSize = '13px';
          } else {  
            // Valeurs originales pour les grands écrans
            optionElement.style.padding = '10px 8px';
          }
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
            // Style de base pour tous les écrans
            Object.assign(displayElement.style, {
              border: 'none',
              backgroundColor: 'rgba(255, 152, 0, 0.85)',
              color: 'white',
              boxSizing: 'border-box',
              fontWeight: 'bold'
            });
            
            // Ajustements uniquement pour les petits écrans
            if (window.innerHeight < 400) {
              displayElement.style.fontSize = '12px';
              displayElement.style.padding = '2px 3px';
            } else if (window.innerHeight < 800) {
              displayElement.style.fontSize = '12px';
              displayElement.style.padding = '2px 3px';
            }
            // Pour les grands écrans, on garde le style original (pas de surcharge)
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
      customSelector.setAttribute('data-action', getMenuTranslation('selectDemoToDisplay')); //'Sélectionner une démo à afficher');
      customSelector.setAttribute('title', getMenuTranslation('selectDemo')); //'Sélectionner une démo');
      
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
    const height = window.innerHeight;
    
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
    
    // Configurer les paramètres du sélecteur avec les valeurs originales par défaut
    let selectorSettings = {
      dimensions: {
        width: '35px', // Valeur originale
        height: '25px', // Valeur originale
        dropdownWidth: '45px', // Valeur originale
        dropdownHeight: '150px' // Valeur originale
      },
      padding: {
        display: { x: 8, y: 1 }, // Valeurs originales
        options: { x: 1, y: 2 } // Valeurs originales
      },
      arrow: {
        position: 'top-right',
        size: 5.5, // Valeur originale
        offset: { x: -5, y: 1 } // Valeurs originales
      }
    };
    
    
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
        dimensions: selectorSettings.dimensions,
        padding: selectorSettings.padding,
        arrow: selectorSettings.arrow,
        onChange: (value) => {
          // Mettre à jour le nombre de prénoms
          if (typeof window.updatePrenoms === 'function') {
            window.updatePrenoms(value);
          } else {
            // Méthode alternative si la fonction n'est pas disponible
            localStorage.setItem('nombre_prenoms', value);
            
            // Essayer de montrer un feedback
            if (typeof window.showFeedback === 'function') {
              window.showFeedback(getMenuTranslation(fistNameUpdated), 'success'); //, 'Nombre de prénoms mis à jour', 'success');
            } else if (typeof window.showToast === 'function') {
              window.showToast(getMenuTranslation(fistNameUpdated)); //'Nombre de prénoms mis à jour');
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
            // Style de base pour tous les écrans
            Object.assign(displayElement.style, {
              border: 'none',
              backgroundColor: 'rgba(142, 68, 173, 0.85)', // Violet semi-transparent
              color: 'white',
              boxSizing: 'border-box',
              fontWeight: 'bold'
            });
            
            // Adapter uniquement pour les petits écrans
            if (window.innerHeight < 400) {
              displayElement.style.fontSize = '10px';
              displayElement.style.padding = '1px 2px';
            } else if (window.innerHeight < 800) {
              displayElement.style.fontSize = '11px';
              displayElement.style.padding = '2px 3px';
            }
            // Pour les grands écrans, on garde le style original (pas de surcharge)
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
      customSelector.setAttribute('title', getMenuTranslation('nbFirstNameToDisplay')); //'Nombre de prénoms à afficher');
      
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
    
    // Mettre à jour la classe de hauteur au cas où
    updateHeightClass();
    const height = window.innerHeight;
    
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
                    
                    // Adapter uniquement pour les petits écrans
                    if (height < 400) {
                        rootPersonContainer.style.gap = '5px';
                    } else if (height < 800) {
                        rootPersonContainer.style.gap = '8px';
                    } else {
                        rootPersonContainer.style.gap = '10px'; // Valeur originale
                    }
    
                    // Label à gauche
                    const rootPersonLabel = document.createElement('label');
                    // rootPersonLabel.textContent = 'Sélect. personne racine';
                    rootPersonLabel.textContent = getMenuTranslation('rootPersonLabel');
                    rootPersonLabel.style.color = '#000';
                    rootPersonLabel.style.lineHeight = '1.2';
                    rootPersonLabel.style.textAlign = 'right';
                    rootPersonLabel.style.flexShrink = '0';
                    
                    // Adapter uniquement pour les petits écrans
                    if (height < 400) {
                        rootPersonLabel.style.fontSize = '10px';
                        rootPersonLabel.style.width = '45px';
                    } else if (height < 800) {
                        rootPersonLabel.style.fontSize = '12px';
                        rootPersonLabel.style.width = '50px';
                    } else {
                        rootPersonLabel.style.fontSize = '14px'; // Valeur originale
                        rootPersonLabel.style.width = '60px'; // Valeur originale
                    }
    
                    // Bouton/div style sélecteur personnalisé
                    const rootPersonLink = document.createElement('div');
                    
                    // Copier le style du sélecteur original
                    rootPersonLink.style.cursor = 'pointer';
                    rootPersonLink.style.border = 'none';
                    rootPersonLink.style.borderRadius = '4px';
                    rootPersonLink.style.backgroundColor = 'rgba(255, 152, 0, 0.85)';
                    rootPersonLink.style.color = 'white';
                    rootPersonLink.style.fontWeight = 'bold';
                    rootPersonLink.style.display = 'flex';
                    rootPersonLink.style.justifyContent = 'space-between';
                    rootPersonLink.style.alignItems = 'center';
                    rootPersonLink.style.boxSizing = 'border-box';
                    rootPersonLink.style.position = 'relative';
                    rootPersonLink.style.zIndex = '99900';
                    
                    // Adapter uniquement pour les petits écrans
                    if (height < 400) {
                        rootPersonLink.style.fontSize = '11px';
                        rootPersonLink.style.padding = '1px 3px';
                        rootPersonLink.style.height = '20px';
                        rootPersonLink.style.minWidth = '70px';
                    } else if (height < 800) {
                        rootPersonLink.style.fontSize = '12px';
                        rootPersonLink.style.padding = '1px 4px';
                        rootPersonLink.style.height = '22px';
                        rootPersonLink.style.minWidth = '75px';
                    } else {
                        rootPersonLink.style.fontSize = '14px'; // Valeur originale
                        rootPersonLink.style.padding = '1px 4px'; // Valeur originale
                        rootPersonLink.style.height = '25px'; // Valeur originale
                        rootPersonLink.style.minWidth = '80px'; // Valeur originale
                    }
    
                    // Texte du bouton (nom de la personne racine)
                    const displayElement = originalRootResults.querySelector('div[style*="border"] span');
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
                    // rootSearchLink.textContent = '🔍 personne racine';
                    rootSearchLink.textContent = getMenuTranslation('rootSearch');
                    rootSearchLink.style.cursor = 'pointer';
                    rootSearchLink.style.backgroundColor = 'white';
                    rootSearchLink.style.textAlign = 'left';
                    rootSearchLink.style.border = '1px solid #333';
                    rootSearchLink.style.borderRadius = '4px';
                    rootSearchLink.style.display = 'flex';
                    rootSearchLink.style.alignItems = 'center';
                    
                    // Adapter uniquement pour les petits écrans
                    if (height < 400) {
                        rootSearchLink.style.fontSize = '11px';
                        rootSearchLink.style.padding = '2px 3px';
                        rootSearchLink.style.margin = '2px 0';
                    } else if (height < 800) {
                        rootSearchLink.style.fontSize = '12px';
                        rootSearchLink.style.padding = '2px 3px';
                        rootSearchLink.style.margin = '2px 0';
                    } else {
                        rootSearchLink.style.fontSize = '14px'; // Valeur originale
                        rootSearchLink.style.padding = '3px 4px'; // Valeur originale
                        rootSearchLink.style.margin = '3px 0'; // Valeur originale
                    }
                    
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
    
                // Pour le sélecteur de démo, vérifier s'il existe déjà
                const existingDemoSelector = document.getElementById('menu-demo-selector');
                if (!existingDemoSelector) {
                    // Seulement s'il n'existe pas encore
                    createDemoSelector();
                }
                
                // Créer le sélecteur de prénoms s'il n'existe pas encore
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
        /* Styles pour les petits écrans uniquement */
        .small-screen .hamburger-menu {
        width: 30px;
        height: 30px;
        }
        
        .small-screen .hamburger-menu span {
        width: 18px;
        height: 2px;
        margin: 1px 0;
        }
        
        .small-screen .side-menu {
        width: 180px;
        padding: 40px 5px 10px;
        }
        
        .small-screen .menu-title {
        top: 10px;
        left: 40px;
        font-size: 14px;
        }
        
        .small-screen .menu-section {
        margin-bottom: 6px;
        padding: 4px;
        }
        
        .small-screen .menu-section h3 {
        margin-bottom: 4px;
        font-size: 12px;
        }
        
        .small-screen .menu-section-content {
        gap: 3px;
        }
        
        .small-screen .side-menu button span {
        font-size: 16px;
        }
        
        .small-screen .menu-section-content label {
        margin-bottom: 2px;
        font-size: 11px;
        }
        
        /* Styles pour les écrans moyens uniquement */
        .medium-screen .hamburger-menu {
        width: 35px;
        height: 35px;
        }
        
        .medium-screen .hamburger-menu span {
        width: 20px;
        height: 2.5px;
        margin: 1.5px 0;
        }
        
        .medium-screen .side-menu {
        width: 190px;
        padding: 50px 8px 15px;
        }
        
        .medium-screen .menu-title {
        top: 12px;
        left: 50px;
        font-size: 16px;
        }
        
        .medium-screen .menu-section {
        margin-bottom: 10px;
        padding: 6px;
        }
        
        .medium-screen .menu-section h3 {
        margin-bottom: 6px;
        font-size: 14px;
        }
        
        .medium-screen .menu-section-content {
        gap: 5px;
        }
        
        .medium-screen .side-menu button span {
        font-size: 22px;
        }
        
        .medium-screen .menu-section-content label {
        margin-bottom: 3px;
        font-size: 12px;
        }
        
        /* Style pour le bouton hamburger - Styles de base inchangés */
        .hamburger-menu {
        position: fixed;
        top: 5px;   
        left: 5px; 
        z-index: 3000;
        width: 40px;
        height: 40px;
        background-color: #4CAF50;
        border-radius: 8px;
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
    
        /* Menu latéral - Style de base inchangé */
        .side-menu {
        position: fixed;
        top: 0;
        left: -250px;
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
        left: 0;
        }
    
        /* Overlay - Style de base inchangé */
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
    
        /* Styles pour les sections du menu - Style de base inchangé */
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
    
        /* Adaptations pour les contrôles - Style de base inchangé */
        .side-menu button {
        min-width: auto;
        padding: 2px;
        margin: 0;
        border: none;
        background-color: transparent;
        border-radius: 4px;
        }
    
        .side-menu button:hover {
        background-color: rgba(0,0,0,0.05);
        }
    
        .side-menu button span {
        font-size: 28px;
        display: block;
        }
    
        .side-menu select, .side-menu input {
        min-width: auto;
        max-width: 100%;
        }
    
        /* Style pour le titre du menu - Style de base inchangé */
        .menu-title {
        position: absolute;
        top: 15px;
        left: 60px;
        font-size: 18px;
        font-weight: bold;
        color: #4CAF50;
        }
        
        /* Styles pour les labels - Style de base inchangé */
        .menu-section-content label {
        display: block;
        width: 100%;
        margin-bottom: 5px;
        font-size: 14px;
        color: #555;
        }
        
        /* S'assurer que le bouton hamburger est visible - Style de base inchangé */
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
    
    // Mettre à jour la classe de hauteur avant d'ouvrir le menu
    updateHeightClass();
    
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
        // const originalSpeechBtn = document.getElementById('speechToggleBtn');
        // const menuSpeechBtn = document.getElementById('menu-speechToggleBtn');
        
        // if (originalSpeechBtn && menuSpeechBtn) {
        //     const speechObserver = new MutationObserver(function(mutations) {
        //         mutations.forEach(function(mutation) {
        //             if (mutation.type === 'childList' || mutation.type === 'attributes') {
        //                 menuSpeechBtn.innerHTML = originalSpeechBtn.innerHTML;
        //             }
        //         });
        //     });
            
        //     speechObserver.observe(originalSpeechBtn, { 
        //         childList: true,
        //         attributes: true,
        //         subtree: true
        //     });
        // }
        
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
     
     // Mettre à jour la classe de hauteur
     updateHeightClass();
     
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
        //  window.showToast('Menu principal disponible');
         window.showToast(getMenuTranslation('menuAvailable'))
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
    updateHeightClass(); // Mettre à jour les classes de hauteur
    setTimeout(syncCustomSelectors, 1000); // Synchroniser après un délai pour s'assurer que tout est prêt
    });

    // Ajouter un écouteur pour les changements de taille de fenêtre
    window.addEventListener('resize', function() {
    updateHeightClass();
    // Ajuster les sélecteurs si le menu est ouvert
    if (sideMenu && sideMenu.classList.contains('open')) {
        setTimeout(syncCustomSelectors, 300);
    }
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
  