import { importLinks } from './importState.js'; // import de treeAnimation, mainUI via importLinks pour éviter les erreurs de chargement circulaire
import { state, updateRadarButtonText, toggleTreeRadar, keepSilentAudioAlive, searchRootPersonId, redimensionnerPlayButtonSizeInDOM } from './main.js';
import { createCustomSelector, createOptionsFromLists } from './UIutils.js';
// import { closeCloudName } from './nameCloudUI.js';
import { getCloseCloudName, handleRootPersonChange } from './main.js';
import { debounce, updatePrenoms, searchTree, resetZoom, zoomIn, zoomOut } from './eventHandlers.js';
// import { showToastNew } from './debugLogUtils.js';
// import { documentation } from './documentation.js';
// import { toggleAnimationPause, resetAnimationState, startAncestorAnimation, findAncestorPath, findAllAncestorPaths  } from './treeAnimation.js';
import { makeModalDraggableAndResizable, makeModalInteractive } from './resizableModalUtils.js';
// import { openSearchModal } from './searchModalUI.js';
import { getOpenSearchModal } from './main.js';
// import { disableFortuneModeClean, disableFortuneModeWithLever } from './treeWheelAnimation.js';
import { getDisableFortuneModeClean, getDisableFortuneModeWithLever } from './main.js';
const getDocumentation = async () => {
  const { documentation } = await import('./documentation.js');
  documentation(); // On lance l'exécution directement ici
};
const getStatsModal = async () => {
  const { statsModal } = await import('./statsModalUI.js');
  statsModal();
};
const getDisplayHeatMap = async () => {
  const { displayHeatMap } = await import('./geoHeatMapUI.js');
  displayHeatMap();
};
const getShowToastNew = async () => {
    const { showToastNew } = await import('./debugLogUtils.js');
    return showToastNew;
};
const getProcessNamesCloudWithDate = async () => {
    const { processNamesCloudWithDate } = await import('./nameCloud.js');
    processNamesCloudWithDate({ type: 'prenoms', startDate: 1500, endDate: new Date().getFullYear(), scope: 'ancestors' });
};

window.searchTree = searchTree;

// Variables pour garder une référence aux éléments
let hamburgerMenu, sideMenu, menuOverlay;

// Fonction de traduction pour le menu hamburger
export function getMenuTranslation(key) {
  const translations = {
    'fr': {
      'menuTitle': 'Menu de l\'arbre',
      'menuprincipal': 'Menu principal',
      'treeMode': 'arbre',
      'generations': 'nb géné',
      'firstNames': 'prénoms',
      'searchPlaceholder': '🔍nom',
      'rootPersonLabel1': 'Sélectionner la racine',
      'rootPersonLabel': 'Sélectionner<br>la racine',
      'rootSearch': '🔍 personne racine',
      'soundToggle': 'Activer/désactiver le son',
      'animationPause': 'Pause animation',
      'animationPlay': 'lecture animation',
      'settings': 'Paramètres avancés',
      'section_buttonOnDisplay': 'Boutons sur l\'écran',
      'section_display': 'Affichage',
      'section_audio': 'Animation et audio',
      'section_root': 'Racine',
      'section_modes': 'Modes',
      'section_namecloud': 'nuage / radar / map / stats',
      'section_namecloud2': 'nuage / arbre / map / stats',
      'section_radar': 'radar',
      'section_settings': 'Fonds d\'écran & Paramètres',
      'section_search': 'Recherche dans l\'arbre',
      'zoomIn': 'Zoom avant',
      'createYourDemo': 'Créer Démo',
      'createYourOwnDemo': 'Créer votre propre démo',
      'customAnimationTitle': 'Animation Personnalisée',
      'ancestorMode': 'Mode Ancêtre',
      'cousinMode': 'Mode Cousin',
      'commonAncestor': 'Ancêtre Commun',
      'ancestor': 'Ancêtre',
      'cousin': 'Cousin',
      'startAnimation': "Lancer l'Animation",
      'noResults': 'Aucun résultat',
      'selectPerson': 'Sélectionnez une personne',
      'zoomOut': 'Zoom arrière',
      'resetView': 'Réinitialiser la vue',
      'fullscreen': 'Plein écran',
      'backgroundLabel': '',//'Fonds d\'écran',
      'nameCloudLabel': 'Nuage de mots',
      'backToLogin': 'Retour à l\'écran de connexion',
      'menuAvailable': 'Menu principal disponible',
      'fistNameUpdated': 'Nombre de prénoms mis à jour',
      'selectDemo': 'Sélectionner une démo',
      'selectDemoToDisplay': 'Sélectionner une démo à afficher',
      'nbFirstNameToDisplay': 'Nombre de prénoms à afficher',
      'yes': 'oui',
      'no': 'non',
      'title_nameCloud': 'Nuage de noms',
      'title_radar': 'Graphique radar',
      'title_heatmap': 'Carte de chaleur',
      'title_stats': 'Statistiques',
      'buttonOnDisplay': 'Afficher les boutons sur l\'écran',
      'noButtonOnDisplay': 'Ne pas afficher les boutons sur l\'écran',
      'tutoDocumention': 'Tutoriel / Documentation',
      'keepSilentAudio': 'audio constant sur HDMI',
      'animationNameLabel': 'Nom de l\'animation',
      'animationNamePlaceholder': 'Ma super démo',

    },
    'en': {
      'menuTitle': 'Tree Menu',
      'menuprincipal': 'Main menu',
      'treeMode': 'tree',
      'generations': 'gen nb',
      'firstNames': 'first names',
      'searchPlaceholder': '🔍name',
      'rootPersonLabel1': 'Select root person',
      'rootPersonLabel': 'Select<br>root person',
      'rootSearch': '🔍 search root person',
      'soundToggle': 'Toggle sound',
      'animationPause': 'Pause animation',
      'animationPlay': 'Play animation',
      'settings': 'Advanced settings',
      'section_buttonOnDisplay': 'Buttons on screen',
      'section_display': 'Display',
      'section_audio': 'Animation and audio',
      'section_root': 'Root',
      'section_modes': 'Modes',
      'section_namecloud': 'cloud / radar / map / stats',
      'section_namecloud2': 'cloud / tree / map / stats',
      'section_radar': 'radar chart',
      'section_settings': 'Backgrounds & Settings',
      'section_search': 'Tree search',
      'zoomIn': 'Zoom in',
      'createYourDemo': 'Create Demo',
      'createYourOwnDemo': 'Create your own demo',
      'customAnimationTitle': 'Custom Animation',
      'ancestorMode': 'Ancestor Mode',
      'cousinMode': 'Cousin Mode',
      'commonAncestor': 'Common Ancestor',
      'ancestor': 'Ancestor',
      'cousin': 'Cousin',
      'startAnimation': 'Start Animation',
      'noResults': 'No results',
      'selectPerson': 'Select a person',
      'zoomOut': 'Zoom out',
      'resetView': 'Reset view',
      'fullscreen': 'Fullscreen',
      'backgroundLabel': '', //'Backgrounds',
      'nameCloudLabel': 'Word cloud',
      'backToLogin': 'Back to login screen',
      'menuAvailable': 'Main menu available',
      'fistNameUpdated': 'First names updated',
      'selectDemo': 'Select demo',
      'selectDemoToDisplay': 'Select demo to display',
      'nbFirstNameToDisplay': 'Number of first names to display',
      'yes': 'yes',
      'no': 'no',
      'title_nameCloud': 'Name cloud',
      'title_radar': 'Radar chart',
      'title_heatmap': 'Heat map',
      'title_stats': 'Stats',
      'buttonOnDisplay': 'Show buttons on screen',
      'noButtonOnDisplay': 'Do not show buttons on screen',
      'tutoDocumention': 'Tutorial / Documentation',     
      'keepSilentAudio': 'constant audio on HDMI',
      'animationNameLabel': 'Animation name',
      'animationNamePlaceholder': 'My awesome demo',
    },
    'es': {
      'menuTitle': 'Menú del árbol',
      'menuprincipal': 'Menú principal',
      'treeMode': 'árbol',
      'generations': 'núm gen',
      'firstNames': 'nombres',
      'searchPlaceholder': '🔍nombre',
      'rootPersonLabel1': 'Seleccionar raíz',
      'rootPersonLabel': 'Seleccionar<br>raíz',
      'rootSearch': '🔍 buscar persona raíz',
      'soundToggle': 'Activar/desactivar sonido',
      'animationPause': 'Pausar animación',
      'animationPlay': 'Reproducir animación',
      'settings': 'Configuración avanzada',
      'section_buttonOnDisplay': 'Botones en pantalla',
      'section_display': 'Visualización',
      'section_audio': 'Animación y audio',
      'section_root': 'Raíz',
      'section_modes': 'Modos',
      'section_namecloud': 'nube / radar / mapa / stats',
      'section_namecloud2': 'nube / árbol / mapa / stats',
      'section_radar': 'gráfico de radar',
      'section_settings': 'Fondos de pantalla y configuración',
      'section_search': 'Búsqueda en el árbol',
      'zoomIn': 'Acercar',
      'createYourDemo': 'Crear Demo',
      'createYourOwnDemo': 'Crear tu propia demo',
      'customAnimationTitle': 'Animación Personalizada',
      'ancestorMode': 'Modo Ancestro',
      'cousinMode': 'Modo Primo',
      'commonAncestor': 'Ancestro Común',
      'ancestor': 'Ancestro',
      'cousin': 'Primo',
      'startAnimation': 'Iniciar Animación',
      'noResults': 'No hay resultados',
      'selectPerson': 'Seleccione una persona',
      'zoomOut': 'Alejar',
      'resetView': 'Restablecer vista',
      'fullscreen': 'Pantalla completa',
      'backgroundLabel': '', //'Fondo de pantalla',
      'nameCloudLabel': 'Nube de palabras',
      'backToLogin': 'Volver a la pantalla de inicio',
      'menuAvailable': 'Menú principal disponible',
      'fistNameUpdated': 'Nombres actualizados',
      'selectDemo': 'Seleccionar demo',
      'selectDemoToDisplay': 'Seleccionar demo para mostrar',
      'nbFirstNameToDisplay': 'Número de nombres para mostrar',
      'yes': 'sí',
      'no': 'no',
      'title_nameCloud': 'Nube de nombres',
      'title_radar': 'Gráfico de radar',
      'title_heatmap': 'Mapa de calor',
      'title_stats': 'Estadísticas',
      'buttonOnDisplay': 'Mostrar botones en pantalla',
      'noButtonOnDisplay': 'Desactivar botones en pantalla',
      'tutoDocumention': 'Tutorial / Documentación',
      'keepSilentAudio': 'audio constante en HDMI',   
      'animationNameLabel': 'Nombre de la animación',
      'animationNamePlaceholder': 'Mi súper demo',
    },
    'hu': {
      'menuTitle': 'Fa menü',
      'menuprincipal': 'Főmenü',
      'treeMode': 'fa',
      'generations': 'genSzám',
      'firstNames': 'keresz.',
      'searchPlaceholder': '🔍név',
      'rootPersonLabel1': 'Gyökér kiválasztása',
      'rootPersonLabel': 'Gyökér<br>kiválasztása', 
      'rootSearch': '🔍 gyökérszemély keresése',
      'soundToggle': 'Hang be/ki',
      'animationPause': 'Animáció szüneteltetése',
      'animationPlay': 'Animáció lejátszása',
      'settings': 'Speciális beállítások',
      'section_buttonOnDisplay': 'Gombok a képernyőn',
      'section_display': 'Megjelenítés',
      'section_audio': 'Animáció és hang',
      'section_root': 'Gyökér',
      'section_modes': 'Módok',
      'section_namecloud': 'Szófelhő / radar / térkép /stats',
      'section_namecloud2': 'Szófelhő / fa / térkép / stats',
      'section_radar': 'radardiagram',
      'section_settings': 'Hátterek és beállítások',
      'section_search': 'Fa keresés',
      'zoomIn': 'Nagyítás',
      'createYourDemo': 'Demó Létrehozása',
      'createYourOwnDemo': 'Saját demó létrehozása',
      'customAnimationTitle': 'Egyéni Animáció',
      'ancestorMode': 'Ős Mód',
      'cousinMode': 'Unokatestvér Mód',
      'commonAncestor': 'Közös Ős',
      'ancestor': 'Ős',
      'cousin': 'Unokatestvér',
      'startAnimation': 'Animáció Indítása',
      'noResults': 'Nincs találat',
      'selectPerson': 'Válasszon személyt',
      'zoomOut': 'Kicsinyítés',
      'resetView': 'Nézet visszaállítása',
      'fullscreen': 'Teljes képernyő',
      'backgroundLabel': '', //'Háttér',
      'nameCloudLabel': 'Szófelhő',
      'backToLogin': 'Vissza a bejelentkezési képernyőre',
      'menuAvailable': 'Főmenü elérhető',
      'fistNameUpdated': 'Keresztnevek frissítve',
      'selectDemo': 'Demó kiválasztása',
      'selectDemoToDisplay': 'Demó kiválasztása megjelenítéshez',
      'nbFirstNameToDisplay': 'Megjelenítendő keresztnevek száma',
      'yes': 'igen',
      'no': 'nem',
      'title_nameCloud': 'Névfelhő',
      'title_radar': 'Radar diagram',
      'title_heatmap': 'Hőtérkép',
      'title_stats': 'Statisztika',
      'buttonOnDisplay': 'Gombok megjelenítése a képernyőn',
      'noButtonOnDisplay': 'Gombok elrejtése a képernyőn',
      'tutoDocumention': 'Bemutató / Dokumentáció',
      'keepSilentAudio': 'állandó hang HDMI-n',
      'animationNameLabel': 'Animáció neve',
      'animationNamePlaceholder': 'Az én szuper demóm',
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
    
    console.log("\n- debug on resize : Menu hamburger redimensionné avec succès");
  }, 200);
}

// Nouvelle fonction pour mettre à jour les styles sans recréer le menu
function updateMenuStyles() {
  const height = window.innerHeight*state.browserScaleCorrection;
  
  // Adapter les sections
  document.querySelectorAll('.menu-section').forEach((section, index) => {
    // Réinitialiser d'abord les styles
    // section.style.margin = '';
    // section.style.padding = '';
    
    // // Appliquer les styles appropriés selon la taille d'écran
    // if (height < 400) {
    //   section.style.margin = '2px 0';
    //   section.style.padding = '3px';
    // } else if (height < 800) {
    //   section.style.margin = '3px 0';
    //   section.style.padding = '5px';
    // }

    section.style.margin = 2/state.browserScaleCorrection+'px 0';
    section.style.padding = 3/state.browserScaleCorrection+'px';

    
    // Adapter les titres des sections
    const heading = section.querySelector('h3');
    if (heading) {
      heading.style.fontSize = '';
      heading.style.marginTop = '';
      heading.style.marginBottom = '';
      heading.style.display = '';
      heading.setAttribute('role', 'fontSizeChangeHamburger');
      
      // Masquer certains titres sur petits écrans
      // const title = heading.textContent;
      const title = heading.infoName;

      if (height < 400 && (
          title === 'section_audio' || 
          title === 'section_root' || 
          title === 'section_modes' || 
          title === 'section_display' || 
          title === 'section_namecloud' ||
          title === 'section_settings'
        )) {
        heading.style.display = 'none';
      } else if (height < 400) {
        heading.style.fontSize = 13/state.browserScaleCorrection+'px';
        heading.style.marginTop = '0';
        heading.style.marginBottom = '0px';
      } else if (height < 800) {
        heading.style.fontSize = 13/state.browserScaleCorrection+'px';
        heading.style.marginTop = '0';
        heading.style.marginBottom = 5/state.browserScaleCorrection+'px';;
      } else  {
        heading.style.fontSize = 13/state.browserScaleCorrection+'px';
        heading.style.marginTop = '0';
        heading.style.marginBottom = 5/state.browserScaleCorrection+'px';
      }
      heading.style.marginLeft = '0px';
      heading.style.paddingLeft = '0px';
      
    }
    
    // Adapter le contenu des sections
    const content = section.querySelector('.menu-section-content');
    if (content) {
      // content.style.gap = '';
      
      // if (height < 400) {
      //   content.style.gap = '3px';
      // } else if (height < 800) {
      //   content.style.gap = '5px';
      // }

      content.style.gap = 3/state.browserScaleCorrection+'px';
    }
  });
  


//////////////////////////////
  // Adapter les boutons et les spans
  document.querySelectorAll('.side-menu button span').forEach(span => {
    span.style.fontSize = '20px ! important';
    
    // if (height < 400) {
    //   span.style.fontSize = '20px ! important';
    // } else if (height < 800) {
    //   span.style.fontSize = '20px ! important';
    // } else {
    //   span.style.fontSize = '20px ! important';      
    // }
  });
////////////////////////////////

  
  // Adapter les labels
  document.querySelectorAll('.menu-section-content label').forEach(label => {
    label.style.fontSize = '12px';
    label.style.marginBottom = 2/state.browserScaleCorrection+'px';
    
    if (height < 400) {
      label.style.fontSize = '11px';
      label.style.marginBottom = 1/state.browserScaleCorrection+'px';
    } else if (height < 800) {
      label.style.fontSize = '12px';
      label.style.marginBottom = 2/state.browserScaleCorrection+'px';
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
      // let settingsBtn = document.getElementById('menu-settingsBtn');
      // if (settingsBtn) {
      //     // Vérifier si le label existe déjà
      //     let labelExists = false;
      //     let parent = settingsBtn.parentElement;
          
      //     // Vérifier si le parent est un SPAN (label)
      //     if (parent.tagName === 'SPAN' && parent.childNodes[0].nodeType === Node.TEXT_NODE) {
      //         labelExists = true;
      //     }
          
      //     // Créer le label s'il n'existe pas
      //     if (!labelExists) {
      //         const section = settingsBtn.closest('.menu-section-content');
      //         if (section) {
      //           section.removeChild(settingsBtn);
                
      //           const labelContainer = document.createElement('span');
      //           labelContainer.textContent = getMenuTranslation('backgroundLabel'); //'Fond d\'écran';
      //           labelContainer.style.fontSize = '11px';
      //           labelContainer.appendChild(settingsBtn);
      //           section.appendChild(labelContainer);
                
      //           // Ajuster la taille et l'espacement
      //           settingsBtn.style.marginRight = '10px';
      //           const span = settingsBtn.querySelector('span');
      //           if (span) span.style.fontSize = '28px';
      //         }
      //     }
      // }


      // settingsBtn = document.getElementById('menu-nameCloudBtn');
      // if (settingsBtn) {
      //     // Vérifier si le label existe déjà
      //     let labelExists = false;
      //     let parent = settingsBtn.parentElement;
          
      //     // Vérifier si le parent est un SPAN (label)
      //     if (parent.tagName === 'SPAN' && parent.childNodes[0].nodeType === Node.TEXT_NODE) {
      //         labelExists = true;
      //     }
          
      //     // Créer le label s'il n'existe pas
      //     if (!labelExists) {
      //         const section = settingsBtn.closest('.menu-section-content');
      //         if (section) {
      //           section.removeChild(settingsBtn);
                
      //           const labelContainer = document.createElement('span');
      //           labelContainer.textContent = " ";//"Nuage de mots";
      //           labelContainer.style.fontSize = '11px';
      //           labelContainer.appendChild(settingsBtn);
      //           section.appendChild(labelContainer);
                
      //           // Ajuster la taille et l'espacement
      //           settingsBtn.style.marginRight = '10px';
      //           const span = settingsBtn.querySelector('span');
      //           if (span) span.style.fontSize = '18px';
      //         }
      //     }
      // }
    
      
      // Ajuster les boutons d'affichage
      // document.querySelectorAll('.menu-section h3').forEach(heading => {
      //     if (heading.textContent === 'Affichage') {
      //         const section = heading.closest('.menu-section');
      //         if (section) {
      //           const buttons = section.querySelectorAll('button');
      //           buttons.forEach(button => {
      //               button.style.marginRight = '8px';
      //               const span = button.querySelector('span');
      //               if (span) span.style.fontSize = '20px';
      //           });
      //         }
      //     }
      // });




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
  const height = window.innerHeight*state.browserScaleCorrection;
  const container = document.getElementById('audio-controls-container');
  
  if (container) {
    // container.style.gap = '';
    // container.style.marginTop = '';
    
    // if (height < 400) {
    //   container.style.gap = '2px';
    //   container.style.marginTop = '2px';
    // } else if (height < 800) {
    //   container.style.gap = '3px';
    //   container.style.marginTop = '3px';
    // }
    container.style.gap = 2/state.browserScaleCorrection+'px';
    container.style.marginTop = 2/state.browserScaleCorrection+'px';


  }
}

function updateRootSectionStyles() {
  const height = window.innerHeight*state.browserScaleCorrection;
  const rootSearchPlaceholder = document.getElementById('menu-root-person-search-placeholder');
  const rootResultsPlaceholder = document.getElementById('menu-root-person-results-placeholder');
  
  if (rootSearchPlaceholder) {
    rootSearchPlaceholder.style.margin = '';
    
    if (height < 400) {
      rootSearchPlaceholder.style.margin = 2/state.browserScaleCorrection+'px 0';
    } else if (height < 800) {
      rootSearchPlaceholder.style.margin = 3/state.browserScaleCorrection+'px 0';
    } else {
      rootSearchPlaceholder.style.margin = 5/state.browserScaleCorrection+'px 0';
    }
  }
  
  if (rootResultsPlaceholder) {
    rootResultsPlaceholder.style.margin = '';
    
    if (height < 400) {
      rootResultsPlaceholder.style.margin = 2/state.browserScaleCorrection+'px 0';
    } else if (height < 800) {
      rootResultsPlaceholder.style.margin = 3/state.browserScaleCorrection+'px 0';
    } else {
      rootResultsPlaceholder.style.margin = 5/state.browserScaleCorrection+'px 0';
    }
  }
}

function updateModeSectionStyles() {
  const height = window.innerHeight*state.browserScaleCorrection;
  const modePlaceholder = document.getElementById('menu-treeMode-placeholder');
  const genPlaceholder = document.getElementById('menu-generations-placeholder');
  const prenomsPlaceholder = document.getElementById('menu-prenoms-placeholder');
  
  if (modePlaceholder) {
    modePlaceholder.style.margin = '';
    
    if (height < 400) {
      modePlaceholder.style.margin = 2/state.browserScaleCorrection+'px 0';
    } else if (height < 800) {
      modePlaceholder.style.margin = 3/state.browserScaleCorrection+'px 0';
    } else {
      modePlaceholder.style.margin = 5/state.browserScaleCorrection+'px 0';
    }
  }
  
  if (genPlaceholder) {
    genPlaceholder.style.margin = '';
    const genDiv = document.getElementById('menu-generations-container');
    
    if (genDiv) {
      genDiv.style.marginLeft = '';
      
      if (height < 400) {
        genPlaceholder.style.margin = 1/state.browserScaleCorrection+'px 0';
        genDiv.style.marginLeft = 5/state.browserScaleCorrection+'px';
      } else if (height < 800) {
        genPlaceholder.style.margin = 2/state.browserScaleCorrection+'px 0';
        genDiv.style.marginLeft = 8/state.browserScaleCorrection+'px';
      } else {
        genPlaceholder.style.margin = 2/state.browserScaleCorrection+'px 0';
        genDiv.style.marginLeft = 10/state.browserScaleCorrection+'px';
      }
    }
  }
  
  if (prenomsPlaceholder) {
    prenomsPlaceholder.style.margin = '';
    const prenomsDiv = document.getElementById('menu-prenoms-container');
    
    if (prenomsDiv) {
      prenomsDiv.style.marginLeft = '';
      
      if (height < 400) {
        prenomsPlaceholder.style.margin = 2/state.browserScaleCorrection+'px 0';
        prenomsDiv.style.marginLeft = 5/state.browserScaleCorrection+'px';
      } else if (height < 800) {
        prenomsPlaceholder.style.margin = 3/state.browserScaleCorrection+'px 0';
        prenomsDiv.style.marginLeft = 8/state.browserScaleCorrection+'px';
      } else {
        prenomsPlaceholder.style.margin = 5/state.browserScaleCorrection+'px 0';
        prenomsDiv.style.marginLeft = 10/state.browserScaleCorrection+'px';
      }
    }
  }
}

function updateSearchSectionStyles() {
  const height = window.innerHeight*state.browserScaleCorrection;
  const searchInput = document.getElementById('menu-search');
  
  if (searchInput) {
    searchInput.style.fontSize = '';
    searchInput.style.padding = '';
    
    // Adapter uniquement pour les petits écrans
    if (height < 400) {
      searchInput.style.fontSize = 11/state.browserScaleFactor+ 'px';
      searchInput.style.padding = 2/11+'em';
    } else if (height < 800) {
      searchInput.style.fontSize = 12/state.browserScaleFactor+ 'px';
      searchInput.style.padding = 3/12+'em';
    } else {
      searchInput.style.fontSize = 13/state.browserScaleFactor+ 'px';
      searchInput.style.padding = 3/13+'em';
    }
  }
}

// Fonction pour vérifier la hauteur de l'écran et appliquer les classes correspondantes
function updateHeightClass() {
  const height = window.innerHeight*state.browserScaleCorrection;
  document.documentElement.classList.remove('small-screen', 'medium-screen');
  
  const demoSelector = document.getElementById('menu-demo-selector')
  if (height < 400) { // mode paysage
    document.documentElement.classList.add('small-screen');
    if (demoSelector) {
      demoSelector.setDropdownMaxHeight(170/state.browserScaleCorrection+'px');
      // console.log('\n\n\n ----------------  debug  demo selector height ----------', demoSelector )
    }
  } else if (height < 800) { //mode portrait
    document.documentElement.classList.add('medium-screen');
    if (demoSelector) {
      demoSelector.setDropdownMaxHeight(300/state.browserScaleCorrection+'px');
      // console.log('\n\n\n ----------------  debug  demo selector height ----------', demoSelector )
    }
  } else {
    document.documentElement.classList.add('medium-screen');
    if (demoSelector) {
      demoSelector.setDropdownMaxHeight(300/state.browserScaleCorrection+'px');
      // console.log('\n\n\n ----------------  debug  demo selector height ----------', demoSelector )
    }
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
    window.addEventListener('resize', debounce(() => {
        // console.log('\n\n*** debug resize in createMenuElements in hamburger.js, isOpen=', isOpen, ' \n\n');
        // updateHeightClass();
    }, 150)); // Attend 150ms après le dernier resize
    
    // Créer le bouton hamburger
    hamburgerMenu = document.createElement('button');
    hamburgerMenu.id = 'hamburger-menu';
    hamburgerMenu.className = 'hamburger-menu';
    hamburgerMenu.title = getMenuTranslation('menuprincipal'); //'Menu principal';
    hamburgerMenu.style.display = 'none'; // Caché par défaut
    hamburgerMenu.dataset.role = 'fontSizeChangeChromeHamburger';
    
    // Créer les trois barres du hamburger
    for (let i = 0; i < 3; i++) {
      const span = document.createElement('span');
      hamburgerMenu.appendChild(span);
      span.dataset.role = 'fontSizeChangeChromeHamburger';
    }
    
    // Créer l'overlay
    menuOverlay = document.createElement('div');
    menuOverlay.id = 'menu-overlay';
    menuOverlay.className = 'menu-overlay';
    
    // Créer le menu latéral
    sideMenu = document.createElement('div');
    sideMenu.id = 'side-menu';
    sideMenu.className = 'side-menu';
    sideMenu.dataset.role = 'fontSizeChangeChromeHamburger';
    sideMenu.style.fontSize = '10px';
    if (window.outerWidth < 400  || window.outerHeight< 400) {
      sideMenu.style.padding = '4em 1em 1em 1em';
    } else {
      sideMenu.style.padding = '5em 1em 1em 1em';
    }


       // sideMenu.style.display = 'block'; // Modifié pour être visible initialement
    
    // Ajouter le titre du menu
    // const menuTitle = document.createElement('div');
    // menuTitle.className = 'menu-title';
    // menuTitle.dataset.role = 'buttonHamburger';
    // menuTitle.style.fontSize = '14px';
    // menuTitle.style.left = '3.3em';
    // menuTitle.style.top = '0.8em';
    
    // // menuTitle.textContent = 'Menu de l\'arbre';
    // menuTitle.textContent = window.CURRENT_LANGUAGE === 'hu' ? 'Fa menü' : 
    //                         window.CURRENT_LANGUAGE === 'en' ? 'Tree Menu' :
    //                         window.CURRENT_LANGUAGE === 'es' ? 'Menú del árbol' : 
    //                         'Menu de l\'arbre';




    // Ajouter le titre du menu
    const menuTitle = document.createElement('div');
    menuTitle.className = 'menu-title';
    menuTitle.dataset.role = 'fontSizeChangeChromeHamburger';
    menuTitle.style.fontSize = '14px';
    menuTitle.style.left = '3.3em';
    menuTitle.style.top = '0.8em';

    const titleSpan = document.createElement('div');
    titleSpan.style.fontSize = '14px';
    titleSpan.dataset.role = "fontSizeChangeHamburger";

    // menuTitle.textContent = 'Menu de l\'arbre';
    titleSpan.textContent = window.CURRENT_LANGUAGE === 'hu' ? 'Fa menü' : 
                            window.CURRENT_LANGUAGE === 'en' ? 'Tree Menu' :
                            window.CURRENT_LANGUAGE === 'es' ? 'Menú del árbol' : 
                            'Menu de l\'arbre';



    menuTitle.appendChild(titleSpan);



                            

    sideMenu.appendChild(menuTitle);
    
    // Créer les sections du menu
    createButtonsOnDisplaySection();
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


    updateMenuStyles();


    
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
function createSection(titleIn, index = 0) {

  const title = getMenuTranslation(titleIn);
  const container = document.createElement('div');
  container.className = 'menu-section';
  container.infoName = titleIn;

  // Appliquer une couleur de fond pâle différente selon l'index
  const colorIndex = index % sectionBackgroundColors.length;
  container.style.backgroundColor = sectionBackgroundColors[colorIndex];
  container.style.borderRadius = '5px'; // Coins légèrement arrondis
  
  // On ne modifie les marges que pour les petits écrans
  const height = window.innerHeight*state.browserScaleCorrection;
  if (height < 400) {
    container.style.margin = 2/state.browserScaleCorrection+'px 0';
    container.style.padding = '0px';
  } else if (height < 800) {
    container.style.margin = 2/state.browserScaleCorrection+'px 0';
    container.style.padding = '0px';
  } else {
    container.style.margin = 2/state.browserScaleCorrection+'px 0';
    container.style.padding = '0px';    
  }
  
  const heading = document.createElement('h3');
  heading.textContent = title;
  heading.infoName = titleIn;
  heading.id = `menu-section-heading-${titleIn}`;
  heading.setAttribute('role', 'fontSizeChangeHamburger');

  // En mode petit écran, masquer certains titres spécifiques
  if (height < 400 && (
      titleIn === 'section_audio' || 
      titleIn === 'section_root' || 
      titleIn === 'section_modes' || 
      titleIn === 'section_display' ||
      titleIn === 'section_namecloud' ||
      titleIn === 'section_settings'
  )) {
    heading.style.display = 'none'; // Masquer complètement le titre
    // Option alternative : heading.style.height = '0';
    // Option alternative : heading.style.fontSize = '0';
  } else if (height < 400) {
    // Pour les autres titres en petit écran
    heading.style.fontSize = '14px';
    heading.style.marginTop = '0';
    heading.style.marginBottom = 3/state.browserScaleCorrection+'px';
  } else if (height < 800) {
    heading.style.fontSize = '14px';
    heading.style.marginTop = '0';
    heading.style.marginBottom = 3/state.browserScaleCorrection+'px';
  } else {
    heading.style.fontSize = '14px';
    heading.style.marginTop = '0';
    heading.style.marginBottom = 3/state.browserScaleCorrection+'px';
  }

  
  heading.style.paddingLeft = '0px';
  heading.style.marginLeft = '0px';

  container.appendChild(heading);
  
  const content = document.createElement('div');
  content.className = 'menu-section-content';
  
  // Ajuster l'espacement du contenu uniquement pour les petits écrans
  content.style.gap = '0px';
  if (height < 400) {
    content.style.gap = '0px';
  } else if (height < 800) {
    content.style.gap = '0px';
  }
  
  container.appendChild(content);

  return { container, content };
}


export async function showLoader()  {
    const message1 = " INIT  " ;
    const showToastNew = await getShowToastNew();
    showToastNew(message1, 'info', 5000)
}

// Créer la section Navigation
function createButtonsOnDisplaySection() {
  const height = window.innerHeight*state.browserScaleCorrection;
  // const section = createSection('Affichage', 3);  // Index 3
  const section = createSection('section_buttonOnDisplay', 3);


  section.content.classList.add('compact-menu');
  document.head.insertAdjacentHTML('beforeend', '<style>.compact-menu{gap:0 14px !important}</style>');
  
  const buttons = [
    { onclick: () => {importLinks.mainUI.buttonsOnDisplay(true); toggleMenu(false);}, title: getMenuTranslation('buttonOnDisplay'), text: '👆' },
    { onclick: () => {importLinks.mainUI.buttonsOnDisplay(false); toggleMenu(false);}, title: getMenuTranslation('noButtonOnDisplay'), text: '🚫' },
    { onclick: async ()=> { await getDocumentation(); toggleMenu(false);}, title: getMenuTranslation('tutoDocumention'), text: '💡' },
  ];
 
  buttons.forEach(buttonData => {
    const button = document.createElement('button');
    // button.setAttribute('onclick', buttonData.onclick);
    button.addEventListener('click', buttonData.onclick);   
    button.title = buttonData.title;
    
    const span = document.createElement('span');
    span.dataset.role = "buttonHamburger"; 
    span.textContent = buttonData.text;

    span.style.fontSize = '25px';

    // // Adapter uniquement pour les petits écrans
    if (height < 400) {
      // span.style.fontSize = '14px';
      button.style.padding = '0px';
      button.style.marginRight = 1/state.browserScaleCorrection+'px';
    } else if (height < 800) {
      // span.style.fontSize = '14px';
      button.style.padding = '0px';
      button.style.marginRight = 1/state.browserScaleCorrection+'px';
    } else {
      // span.style.fontSize = '14px';
      button.style.padding = '0px';
      button.style.marginRight = 1/state.browserScaleCorrection+'px';     
    }
    // Pour les grands écrans, on conserve le style original
    
    button.appendChild(span);
    // Créer un conteneur pour le label + bouton
    const container = document.createElement('span');
    container.dataset.role = "buttonHamburger"; 
    if (buttonData.text === '👆') { container.textContent = getMenuTranslation('yes'); }
    else if (buttonData.text === '🚫'){ container.textContent = getMenuTranslation('no');}
    else { 
      button.style.marginLeft = -8/state.browserScaleCorrection+'px';
      button.style.marginRight = '0px'; 
      container.textContent = 'doc';
      container.style.backgroundColor = 'lightGreen';
      // container.style.marginTop= '-15px';
      container.style.paddingLeft= 4/state.browserScaleCorrection+'px';
      container.style.maxheight = 20/state.browserScaleCorrection+'px';
      container.style.borderRadius = 6/state.browserScaleCorrection+'px';  
      
   

      span.style.display = 'inline-block';
      // Applique l’animation target 
      span.style.animation = 'lightbulb-glow 3s ease-in-out infinite';
      // span.style.transition = 'transform 0.2se';      

      // Animation subtile au survol
      button.addEventListener('mouseover', () => {
          button.style.animation = 'sound-animate  3s ease-in-out infinite';
      });
      
      button.addEventListener('mouseout', () => {
          button.style.animation = 'none';
      });



      // Création de la balise <style> pour l'animation CSS
      const style = document.createElement('style');
      style.textContent += `
        @keyframes lightbulb-glow {
          0%, 100% {
            text-shadow: 0 0 2px rgba(255, 255, 150, 0.2);
            filter: brightness(1);
          }
          50% {
            text-shadow: 0 0 15px rgba(255, 255, 120, 0.8);
            filter: brightness(1.6);
          }
        }
      `;
      document.head.appendChild(style);


        // #helpBtn {
        //   background: transparent;
        //   border: none;
        //   cursor: pointer;
        //   font-size: 20px;
        //   animation: lightbulb-glow 2s ease-in-out infinite;
        //   transition: transform 0.2s;
        // }
        // #helpBtn:hover {
        //   transform: scale(1.1);
        // }






    }

    container.style.fontSize = '11px';
    container.appendChild(button);
    section.content.appendChild(container);
    // section.content.appendChild(button);
  });
  
  sideMenu.appendChild(section.container);
}

// Créer la section Audio et Animation
function createAudioSection() {
  const height = window.innerHeight*state.browserScaleCorrection;
  // const section = createSection('Animation et audio', 0);  // Index 4
  const section = createSection('section_audio', 0);
  
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
    audioControlsContainer.style.gap = 2/state.browserScaleCorrection+'px';
    audioControlsContainer.style.marginTop = 2/state.browserScaleCorrection+'px';
  } else if (height < 800) {
    audioControlsContainer.style.gap = 3/state.browserScaleCorrection+'px';
    audioControlsContainer.style.marginTop = 3/state.browserScaleCorrection+'px';
  } else {
    audioControlsContainer.style.gap = 5/state.browserScaleCorrection+'px';
    audioControlsContainer.style.marginTop = 5/state.browserScaleCorrection+'px';
  }
  
  // Créer un placeholder pour le sélecteur de démo
  const demoPlaceholder = document.createElement('div');
  demoPlaceholder.id = 'menu-demo-selector-placeholder';
  demoPlaceholder.style.flex = '0 0 auto';
  
  // Adapter uniquement pour les petits écrans
  if (height < 400) {
    demoPlaceholder.style.marginRight = 2/state.browserScaleCorrection+'px';
  } else if (height < 800) {
    demoPlaceholder.style.marginRight = 3/state.browserScaleCorrection+'px';
  } else {
    demoPlaceholder.style.marginRight = 5/state.browserScaleCorrection+'px';
  }
  
  audioControlsContainer.appendChild(demoPlaceholder);
  

  // Définir les boutons
  const buttons = [
    { 
      id: 'menu-speechToggleBtn',
      onclick: toggleSpeech2, 
      title: getMenuTranslation('soundToggle'), //'Activer/désactiver le son', 
      text: '🗣️', //'🔇' 
      style: 'filter: brightness(2) contrast(0.7) saturate(2);'
    },
    // { 
    //   id: 'menu-animationPauseBtn',
    //   onclick:  () => {
    //     if (state.isWordCloudEnabled) { 
    //       state.isRadarEnabled = true;
    //       toggleTreeRadarFromHamburger();
    //     }
    //     toggleAnimationPause(); toggleMenu(false);
    //   }, 
    //   title: getMenuTranslation('animationPause'), //'Pause animation', 
    //   // text: '⏸️', 
    //   text: '⏸', //'⏸', 
    // },
    { 
      id: 'menu-animationPlayBtn',
      onclick:  () => {
        if (state.isWordCloudEnabled) { 
          state.isRadarEnabled = true;
          toggleTreeRadarFromHamburger();
        }
        importLinks.treeAnimation.toggleAnimationPause(); toggleMenu(false);
        setTimeout(() => {
          const menuPauseBtn = document.getElementById('menu-animationPauseBtn');
          if (menuPauseBtn) {
            menuPlayBtn.style.setProperty('visibility', 'visible', 'important'); 
          }
        }, 1000); 

      },  
      title: getMenuTranslation('animationPlay'), //'lecture animation', 
      // text: '▶️', 
      text: '▶', 
    }
  ];
  
  // Créer les boutons et les ajouter au conteneur
  buttons.forEach(buttonData => {
    const button = document.createElement('button');
    // button.setAttribute('onclick', buttonData.onclick);
    button.addEventListener('click', buttonData.onclick);   
    if (buttonData.id) button.id = buttonData.id;
    button.title = buttonData.title;
    
    const span = document.createElement('span');
    span.textContent = buttonData.text;

    
    // Adapter uniquement pour les petits écrans

    // span.style.fontSize = '25px'; // Valeur originale


    if (buttonData.style && buttonData.text === '🗣️') {
      span.style.cssText = buttonData.style; // Appliquer le style au span
      span.style.fontSize = '25px'; // Valeur originale
      span.id = 'menu-speechToggleBtnSpan';
      span.dataset.role = "buttonHamburger"; 
    }

    if (buttonData.text === '▶' || buttonData.text === '⏸') {
      // if (buttonData.text === '⏸') {
      //   span.innerHTML = `
      //       <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" focusable="false" style="vertical-align:middle">
      //         <rect x="6" y="5" width="4" height="14" fill="currentColor"></rect>
      //         <rect x="14" y="5" width="4" height="14" fill="currentColor"></rect>
      //       </svg>`;

      // } 
      span.id = 'menu-playPauseToggleBtnSpan';
      // span.dataset.role = "fontSizeChangeChromeHamburger"; 
      // ajoute ta classe CSS (très important)
      button.classList.add('play-btn');
      // maintenant, crée le span pour l’icône
      // span.classList.add('icon');  // indispensable pour appliquer ton .play-btn .icon
    }



    
    button.appendChild(span);
    
    // Styles pour les boutons sans bordure
    button.style.border = 'none';
    button.style.backgroundColor = 'transparent';
    
    // Adapter uniquement pour les petits écrans
    if (height < 400) {
      button.style.padding = 2/state.browserScaleCorrection+'px';
    } else if (height < 800) {
      button.style.padding = 3/state.browserScaleCorrection+'px';
    } else {
      button.style.padding = 4/state.browserScaleCorrection+'px';
    }
    
    button.style.margin = '0';
    button.style.borderRadius = 4/state.browserScaleCorrection+'px';
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

// Créer la section Root avec des placeholders pour les sélecteurs
function createRootSection() {
  const height = window.innerHeight*state.browserScaleCorrection;
  // const section = createSection('Racine', 1);  // Index 1
  const section = createSection('section_root', 1);
  section.content.style.flexDirection = 'column';
  
  // Créer un div pour contenir le sélecteur de recherche racine
  const rootSearchDiv = document.createElement('div');
  rootSearchDiv.id = 'menu-root-search-container';
  rootSearchDiv.dataset.role = 'fontSizeChangeChomeHamburger';
  
  // Adapter uniquement pour les petits écrans
  if (height < 400) {
    rootSearchDiv.style.marginBottom = 2/state.browserScaleCorrection+'px';
  } else if (height < 800) {
    rootSearchDiv.style.marginBottom = 3/state.browserScaleCorrection+'px';
  }
  // Pour les grands écrans, on conserve le style original
        
  // Ajouter un espace pour le champ de texte (sera remplacé)
  const rootSearchPlaceholder = document.createElement('div');
  rootSearchPlaceholder.id = 'menu-root-person-search-placeholder';
  rootSearchPlaceholder.dataset.role = 'fontSizeChangeChomeHamburger';
  rootSearchPlaceholder.style.width = '100%';
  rootSearchPlaceholder.style.width = '100%';
  rootSearchPlaceholder.style.backgroundColor = '#F6CC7F';
  rootSearchPlaceholder.title = getMenuTranslation('rootPersonLabel1'); //'Champ de recherche de la personne racine';
  
  // Adapter uniquement pour les petits écrans
  if (height < 400) {
    rootSearchPlaceholder.style.margin = 3/state.browserScaleCorrection+'px 0';
  } else if (height < 800) {
    rootSearchPlaceholder.style.margin = 3/state.browserScaleCorrection+'px 0';
  } else {
    rootSearchPlaceholder.style.margin = 5/state.browserScaleCorrection+'px 0';
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
    rootResultsPlaceholder.style.margin = 2/state.browserScaleCorrection+'px 0';
  } else if (height < 800) {
    rootResultsPlaceholder.style.margin = 3/state.browserScaleCorrection+'px 0';
  } else {
    rootResultsPlaceholder.style.margin = 5/state.browserScaleCorrection+'px 0';
  }
  
  rootResultsDiv.appendChild(rootResultsPlaceholder);
  section.content.appendChild(rootResultsDiv);
      
  sideMenu.appendChild(section.container);
}

// Créer la section Affichage avec des placeholders pour les sélecteurs personnalisés
function createModeSection() {
  const height = window.innerHeight*state.browserScaleCorrection;
  // const section = createSection('Modes', 3);  // Index 3
  const section = createSection('section_modes', 3);
  
  // Créer un div pour contenir le sélecteur de mode d'arbre
  const modeDiv = document.createElement('div');
  modeDiv.id = 'menu-treeMode-container';
  
  const modeLabel = document.createElement('label');
  // modeLabel.textContent = 'arbre';
  modeLabel.textContent = getMenuTranslation('treeMode');
  modeLabel.setAttribute('role', 'fontSizeChangeHamburger');
  modeLabel.style.color = '#000';
  
  // Adapter uniquement pour les petits écrans
  if (height < 400) {
    modeLabel.style.fontSize = '11px';
    modeLabel.style.marginBottom = 1/state.browserScaleCorrection+'px';
  } else if (height < 800) {
    modeLabel.style.fontSize = '12px';
    modeLabel.style.marginBottom = 2/state.browserScaleCorrection+'px';
  } else {
    modeLabel.style.fontSize = '12px';
    modeLabel.style.marginBottom = 2/state.browserScaleCorrection+'px';
  }

  // Pour les grands écrans, on conserve le style original
  
  modeDiv.appendChild(modeLabel);
  
  // Créer un placeholder pour le sélecteur personnalisé
  const modePlaceholder = document.createElement('div');
  modePlaceholder.id = 'menu-treeMode-placeholder';
  modePlaceholder.style.width = '100%';
  
  // Adapter uniquement pour les petits écrans
  if (height < 400) {
    modePlaceholder.style.margin = 2/state.browserScaleCorrection+'px 0';
  } else if (height < 800) {
    modePlaceholder.style.margin = 3/state.browserScaleCorrection+'px 0';
  } else {
    modePlaceholder.style.margin = 5/state.browserScaleCorrection+'px 0';
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
  genLabel.setAttribute('role', 'fontSizeChangeHamburger');
  genLabel.style.color = '#000';
  
  // Adapter uniquement pour les petits écrans
  if (height < 400) {
    genLabel.style.fontSize = '11px';
    genLabel.style.marginBottom = 1/state.browserScaleCorrection+'px';
  } else if (height < 800) {
    genLabel.style.fontSize = '12px';
    genLabel.style.marginBottom = 2/state.browserScaleCorrection+'px';
  } else {
    genLabel.style.fontSize = '12px';
    genLabel.style.marginBottom = 2/state.browserScaleCorrection+'px';
  }
  // Pour les grands écrans, on conserve le style original
  
  genDiv.appendChild(genLabel);
  
  // Créer un placeholder pour le sélecteur personnalisé
  const genPlaceholder = document.createElement('div');
  genPlaceholder.id = 'menu-generations-placeholder';
  genPlaceholder.style.width = '100%';
  
  // Adapter uniquement pour les petits écrans
  if (height < 400) {
    genPlaceholder.style.margin = 1/state.browserScaleCorrection+'px 0';
    genDiv.style.marginLeft = 5/state.browserScaleCorrection+'px';
  } else if (height < 800) {
    genPlaceholder.style.margin =  2/state.browserScaleCorrection+'px 0';
    genDiv.style.marginLeft = 8/state.browserScaleCorrection+'px';
  } else {
    genPlaceholder.style.margin =  2/state.browserScaleCorrection+'px 0';
    genDiv.style.marginLeft = 10/state.browserScaleCorrection+'px';
  }
  
  genDiv.appendChild(genPlaceholder);
  section.content.appendChild(genDiv);
  
  // Créer un div pour contenir le sélecteur du nombre de prénoms
  const prenomsDiv = document.createElement('div');
  prenomsDiv.id = 'menu-prenoms-container';

  const prenomsLabel = document.createElement('label');
  // prenomsLabel.textContent = 'prénoms';
  prenomsLabel.textContent = getMenuTranslation('firstNames');
  prenomsLabel.setAttribute('role', 'fontSizeChangeHamburger');
  prenomsLabel.style.color = '#000';
  
  // Adapter uniquement pour les petits écrans
  if (height < 400) {
    prenomsLabel.style.fontSize = '11px';
    prenomsLabel.style.marginBottom = 1/state.browserScaleCorrection+'px';
  } else if (height < 800) {
    prenomsLabel.style.fontSize = '12px';
    prenomsLabel.style.marginBottom = 2/state.browserScaleCorrection+'px';
  } else {
    prenomsLabel.style.fontSize = '12px';
    prenomsLabel.style.marginBottom = 2/state.browserScaleCorrection+'px';
  }
  // Pour les grands écrans, on conserve le style original
  
  prenomsDiv.appendChild(prenomsLabel);

  // Créer un placeholder pour le sélecteur personnalisé
  const prenomsPlaceholder = document.createElement('div');
  prenomsPlaceholder.id = 'menu-prenoms-placeholder';
  prenomsPlaceholder.style.width = '100%';
  
  // Adapter uniquement pour les petits écrans
  if (height < 400) {
    prenomsPlaceholder.style.margin = 2/state.browserScaleCorrection+'px 0';
    prenomsDiv.style.marginLeft = 5/state.browserScaleCorrection+'px';
  } else if (height < 800) {
    prenomsPlaceholder.style.margin = 3/state.browserScaleCorrection+'px 0';
    prenomsDiv.style.marginLeft = 8/state.browserScaleCorrection+'px';
  } else {
    prenomsPlaceholder.style.margin = 5/state.browserScaleCorrection+'px 0';
    prenomsDiv.style.marginLeft = 10/state.browserScaleCorrection+'px';
  }
  
  prenomsDiv.appendChild(prenomsPlaceholder);
  section.content.appendChild(prenomsDiv);
  
  sideMenu.appendChild(section.container);
}

// Créer la section Name Cloud
async function createNameCloudSection() {
  const closeCloudName = getCloseCloudName();

  const height = window.innerHeight*state.browserScaleCorrection;
  // const section = createSection('Nuage de mots', 0);
  const section = createSection('section_namecloud', 0);
   
  function enableRadarAndDisplay() {
      state.isRadarEnabled = true;
      updateRadarButtonText();
      displayGenealogicTree(null, false, false, false, 'WheelAncestors');
  }
  window.enableRadarAndDisplay = enableRadarAndDisplay;



  const buttons = [
    { 
      id: 'menu-nameCloudBtn',
      onclick: async () => {
        if (state.isWordCloudEnabled) { closeCloudName(); }
        await getProcessNamesCloudWithDate(); 
        toggleMenu(false);
      },
      title: getMenuTranslation('title_nameCloud'), //'Nuage de noms', 
      text: '💖' //🔠💗' 
    },
    { 
      id: 'menu-nameTreeRadarBtn',
      onclick:  () => { toggleTreeRadarFromHamburger(); toggleMenu(false); },
      title: getMenuTranslation('title_radar'), //'Nuage de noms', 
      text: '🎯' 
    },
    { 
      id: 'menu-heatMapBtn',
      onclick: async () => {await getDisplayHeatMap(); toggleMenu(false);},
      title: getMenuTranslation('title_heatmap'), //'heatMap', 
      text: '🌍',

    },
    { 
      id: 'menu-statsBtn',
      onclick:  async () => {await getStatsModal(); toggleMenu(false);},
      title: getMenuTranslation('title_stats'), //'stats', 
      text: '📊' 
    }    
  ];

  section.content.classList.add('compact-menu');
  document.head.insertAdjacentHTML('beforeend', '<style>.compact-menu{ display:flex !important; gap:0 25px !important; margin-right: 0px, padding-right: 0px}</style>');

  // section.content.style.cssText += 'gap:0 !important; display:flex !important;';
  // section.content.style.cssText += 'gap:0 30px !important; display:flex !important;';
  // section.content.classList.add('compact-menu');

  // document.head.insertAdjacentHTML('beforeend', '<style>.compact-menu{gap:0 30px !important}</style>');


  buttons.forEach(buttonData => {
    const button = document.createElement('button');
    // button.setAttribute('onclick', buttonData.onclick);
    button.addEventListener('click', buttonData.onclick);   
    if (buttonData.id) button.id = buttonData.id;
    button.title = buttonData.title;
 

    // Si c'est le bouton STATS, réduire le texte
    // if (buttonData.id === 'menu-statsBtn') {
    if (false) {
        button.textContent = buttonData.text; // on met directement le texte dans le bouton
        button.style.fontSize = '11px'; //(window.innerWidth < 800 || window.innerHeight < 400) ?  '10px' : '12px';
        button.style.backgroundColor = '#438aee';
        button.style.color = '#fff';
        button.style.border = '2px solid #438aee';
        button.style.borderRadius = '6px';
        button.style.padding = '0px 2px';
        button.style.paddingRight = '0px';
        button.style.cursor = 'pointer';
        button.style.transition = 'background 0.2s, color 0.2s, border-color 0.2s';
        button.style.height = '23px'; //(window.innerWidth < 800 || window.innerHeight < 400) ? '21px' : '25px';
        button.style.marginTop = '5px'; //(window.innerWidth < 800 || window.innerHeight < 400) ? '5px' : '8px' ;
        button.style.marginRight = '0px';

        button.addEventListener('mouseenter', () => {
            button.style.backgroundColor = '#2762a6';
            button.style.color = '#ffd700';
            button.style.borderColor = '#ffd700';
        });
        button.addEventListener('mouseleave', () => {
            button.style.backgroundColor = '#438aee';
            button.style.color = '#fff';
            button.style.borderColor = '#438aee';
        });
        section.content.appendChild(button);
    } else {
      const span = document.createElement('span');
      span.textContent = buttonData.text;
      span.dataset.role = "buttonHamburger"; 
      span.style.fontSize = '23px';
      button.style.padding = '0px';
      button.style.margin = '0px';
      button.appendChild(span);
      // button.style.fontSize = '16px ! important';
      section.content.appendChild(button);
    }

  });

  window.nameCloudSection = section;
  // console.log('\n\n *** debug window.nameCloudSection in createNameCloudSection', window.nameCloudSection, ', section=', section, section.container, window.nameCloudSection.container.querySelector('h3').textContent , '\n\n');

  sideMenu.appendChild(section.container);
}

// Créer la section Navigation
function createDisplaySection() {
  const height = window.innerHeight*state.browserScaleCorrection;
  // const section = createSection('Affichage', 3);  // Index 3
  const section = createSection('section_display', 3);


  section.content.classList.add('compact-menu');
  document.head.insertAdjacentHTML('beforeend', '<style>.compact-menu{gap:0 10px !important}</style>');
  

  const buttons = [
    { onclick: () => {zoomIn();}, title: getMenuTranslation('zoomIn'), text: '➕' },
    { onclick: () => {zoomOut();}, title: getMenuTranslation('zoomOut'), text: '➖' },
    { onclick: () => {resetZoom(); toggleMenu(false);}, title: getMenuTranslation('resetView'), text: '🏠' },
    // { onclick: () => {toggleFullScreen();}, title: getMenuTranslation('fullscreen'), text: '⛶' },
    { onclick: () => {keepSilentAudioAlive();}, title: getMenuTranslation('keepSilentAudio'), text: '🔌📺' }
    
  ];
  
  buttons.forEach(buttonData => {
    const button = document.createElement('button');
    // button.setAttribute('onclick', buttonData.onclick);
    button.addEventListener('click', buttonData.onclick);  
    button.title = buttonData.title;
    
    const span = document.createElement('span');
    span.textContent = buttonData.text;
    span.dataset.role = "buttonHamburger"; 
    
    // // Adapter uniquement pour les petits écrans
    if (height < 400) {
      span.style.fontSize = '23px', //'25px';
      button.style.padding = '0px';
      button.style.marginRight = 2/state.browserScaleCorrection+'px';
    } else if (height < 800) {
      span.style.fontSize = '23px', //'25px';
      button.style.padding = '0px';
      button.style.marginRight = 2/state.browserScaleCorrection+'px';
    } else {
      span.style.fontSize = '23px', //'25px';
      button.style.padding = '0px';
      button.style.marginRight = 2/state.browserScaleCorrection+'px';     
    }

    if (buttonData.text === '➕' || buttonData.text === '➖' ) { 
      span.style.fontSize = '16px';
    }

    // Pour les grands écrans, on conserve le style original
    
    button.appendChild(span);
    section.content.appendChild(button);
  });
  
  sideMenu.appendChild(section.container);
}

// Créer la section Paramètres
function createSettingsSection() {
  const height = window.innerHeight*state.browserScaleCorrection;
  // const section = createSection('Fonds d\'écran', 1);
  const section = createSection('section_settings', 1);
  
  const buttons = [
    { 
      id: 'menu-settingsBtn',
      onclick: () => {openSettingsModal(); toggleMenu(false);}, 
      title: getMenuTranslation('settings'), //'Paramètres avancés', 
      text: '⚙️' 
    },
    { 
      onclick: () => {returnToLogin()}, 
      title: getMenuTranslation('backToLogin'), //'Retour à l\'écran de connexion', 
      text: '🔙' 
    }
  ];
  
  buttons.forEach(buttonData => {
    const button = document.createElement('button');
    // button.setAttribute('onclick', buttonData.onclick);
    button.addEventListener('click', buttonData.onclick);   
    if (buttonData.id) button.id = buttonData.id;
    button.title = buttonData.title;
    
    const span = document.createElement('span');
    span.textContent = buttonData.text;
    span.dataset.role = "buttonHamburger"; 
    
    // Adapter uniquement pour les petits écrans
    if (height < 400) {
      span.style.fontSize = '25px';
      button.style.padding = 1/state.browserScaleCorrection+'px';  
      button.style.marginRight = 10/state.browserScaleCorrection+'px';  
    } else if (height < 800) {
      span.style.fontSize = '25px';
      button.style.padding = 2/state.browserScaleCorrection+'px';  
    } else {
      span.style.fontSize = '25px';
      button.style.padding = 2/state.browserScaleCorrection+'px';  
    }
    if (buttonData.text === '⚙️') { span.style.fontSize = '28px'; }
    // Pour les grands écrans, on conserve le style original
    
    button.appendChild(span);
    // section.content.appendChild(button);
    // // À ajouter juste après la création du bouton ⚙️ et avant de l'ajouter au conteneur
      if (buttonData.text === '⚙️' && height < 400) {
          // Créer un conteneur pour le label + bouton
          const container = document.createElement('span');
          container.textContent = getMenuTranslation('backgroundLabel');
          container.style.fontSize = '13px';
          container.appendChild(button);
          section.content.appendChild(container);
          // section.content.appendChild(button);
      } else {
          section.content.appendChild(button);
      }
      
  });
  
  
  sideMenu.appendChild(section.container);
}

// Créer la section Recherche a
function createSearchSection() {
  const height = window.innerHeight*state.browserScaleCorrection;
  // const section = createSection('Recherche dans l\'arbre', 2);  // Index 2
  const section = createSection('section_search', 2);
  
  section.content.style.flexDirection = 'column';
    
  // Champ de recherche dans l'arbre
  const searchDiv = document.createElement('div');
  searchDiv.id = 'menu-search-container';
  
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.id = 'menu-search';
  searchInput.setAttribute('role', 'fontSizeChangeHamburger');

  // searchInput.placeholder = '🔍nom';
  searchInput.placeholder = getMenuTranslation('searchPlaceholder');
  searchInput.setAttribute('oninput', 'searchTree(this.value)');
  searchInput.style.width = 120/13+'em'; //60%
  searchInput.style.color = '#000';
  searchInput.style.border = 2/14 +'em solid #3f3d3d';
  searchInput.style.borderRadius = 4/14 +'em';
  
  // Adapter uniquement pour les petits écrans
  if (height < 400) {
    searchInput.style.fontSize = '11px';
    searchInput.style.padding = 2/11+'em';
  } else if (height < 800) {
    searchInput.style.fontSize = '12px';
    searchInput.style.padding = 3/12+'em';
  } else {
    searchInput.style.fontSize = '13px'; // Valeur originale
    searchInput.style.padding = 3/13+'em';
  }
  
  searchDiv.appendChild(searchInput);
  section.content.appendChild(searchDiv);
  
  sideMenu.appendChild(section.container);
}

export async function toggleTreeRadarFromHamburger() {
  if (state.isWordCloudEnabled) { 
    const closeCloudName = await getCloseCloudName();
    closeCloudName(); 
  }
  else { toggleTreeRadar(); }
}


// Fonction pour créer un sélecteur de démo
function createDemoSelector() {
  const height = window.innerHeight*state.browserScaleCorrection;

  // Trouver le sélecteur existant ou le placeholder
  let existingSelector = document.getElementById('menu-demo-selector');
  let demoPlaceholder = document.getElementById('menu-demo-selector-placeholder');
  
  let parentNode;
  let referenceNode;

  if (existingSelector) {
      parentNode = existingSelector.parentNode;
      referenceNode = existingSelector;
  } else if (demoPlaceholder) {
      parentNode = demoPlaceholder.parentNode;
      referenceNode = demoPlaceholder;
  } else {
      // console.error("Placeholder pour le sélecteur de démo non trouvé");
      return;
  }

  
  // Définir les options en fonction de l'état
  let typeOptions = [];
  let typeOptionsExpanded = [];
  let typeValues = [];

  // 1. Ajouter l'option pour créer une démo personnalisée EN PREMIER
  typeOptions.push(getMenuTranslation('createYourDemo'));
  typeOptionsExpanded.push(getMenuTranslation('createYourOwnDemo'));
  typeValues.push('createYourDemo');

  // 2. Ajouter les démos personnalisées du localStorage
  try {
      const customDemos = JSON.parse(localStorage.getItem('customDemos') || '[]');
      customDemos.forEach(demo => {
          // On utilise le nom pour l'affichage court et long
          typeOptions.push(demo.name.length > 10 ? demo.name.substring(0, 10) + '...' : demo.name);
          typeOptionsExpanded.push(demo.name);
          typeValues.push(demo.id);
      });
  } catch (e) {
      console.error("Erreur lecture customDemos", e);
  }

  // 3. Ajouter les démos standard
  let stdTypeOptions = ['démo1', 'démo2'];
  let stdTypeOptionsExpanded = [];
  let stdTypeValues = ['demo1', 'demo2'];
  
  // Adapter les textes en fonction de l'état
  if (state.treeOwner === 2) {
    stdTypeOptionsExpanded = ['Clou du spectacle', 'Spain'];
  } else if (state.treeOwner === 3) {
    stdTypeOptionsExpanded = ['Capet', 'Capet'];
  } else if (state.treeOwner === 4) {
      stdTypeOptions = ['démo1', 'démo2', 'démo3', 'démo4', 'démo5', 'démo6', 'démo7'];
      stdTypeValues = ['demo1', 'demo2', 'demo3', 'demo4', 'demo5', 'demo6', 'demo7'];
      if (window.CURRENT_LANGUAGE === 'fr') {
        // stdTypeOptionsExpanded = ['On descend tous de lui', 'Francs', 'Capet', 'miossec', 'gourcuff', 'grall', 'bargavel', 'leclerc', 'leduff', 'squiban', 'hamon' ];
        stdTypeOptionsExpanded = ['chanteur breton', "l'affaire", 'Espace', 'Victor', 'le grand blond', "le plus ancien", "la plus ancienne"];
      } else if (window.CURRENT_LANGUAGE === 'en') {
        stdTypeOptionsExpanded = ['breton singer', "the case", 'Space', 'Victor', 'the tall blond', "the oldest", "she's old"];
      } else if (window.CURRENT_LANGUAGE === 'es') {
        stdTypeOptionsExpanded = ['cantante bretón', "el caso", 'Espacio', 'Victor', 'el rubio alto', "el más antiguo", "la más antigua"];
      } else if (window.CURRENT_LANGUAGE === 'hu') {
        stdTypeOptionsExpanded = ['breton énekes', "az ügy" ,'Űr', 'Victor', 'a magas szőke', "a legrégebbi", "a legidősebb"];
      }
  } else if (state.treeOwner === 5) {
      stdTypeOptions = ['démo1', 'démo2'];
      stdTypeValues = ['demo1', 'demo2'];
      if (window.CURRENT_LANGUAGE === 'fr') {
        stdTypeOptionsExpanded = ['On descend tous de lui', 'Capet'];
      } else if (window.CURRENT_LANGUAGE === 'en') {
        stdTypeOptionsExpanded = ['Our ancestor to all', 'Capet'];
      } else if (window.CURRENT_LANGUAGE === 'es') {
        stdTypeOptionsExpanded = ['Nuestro antepasado de todos', 'Capet' ];
      } else if (window.CURRENT_LANGUAGE === 'hu') {
        stdTypeOptionsExpanded = ['Mindenki ősünk', 'Capet'];
      }
  } else if (state.treeOwner === 6) {
      stdTypeOptions = ['démo1', 'démo2', 'démo3', 'démo4', 'démo5', 'démo6', 'démo7', 'démo8', 'démo9', 'démo10', 'démo11'];
      stdTypeValues = ['demo1', 'demo2', 'demo3', 'demo4', 'demo5', 'demo6', 'demo7', 'demo8', 'demo9', 'demo10', 'demo11'];
      if (window.CURRENT_LANGUAGE === 'fr') {
        // stdTypeOptionsExpanded = ['On descend tous de lui', 'Francs', 'Capet', 'miossec', 'gourcuff', 'grall', 'bargavel', 'leclerc', 'leduff', 'squiban', 'hamon' ];
        stdTypeOptionsExpanded = ['On descend tous de lui', 'Francs', 'Capet', 'chanteur breton', 'footballeur', 'écrivain', 'journaliste','super marché', 'brioche', 'compositeur', 'politicien' ];
      } else if (window.CURRENT_LANGUAGE === 'en') {
        stdTypeOptionsExpanded = ['Our ancestor to all', 'Franks', 'Capet', 'breton singer', 'footballer', 'writer', 'journalist','supermarket', 'brioche', 'composer', 'politician' ];
      } else if (window.CURRENT_LANGUAGE === 'es') {
        stdTypeOptionsExpanded = ['Nuestro antepasado de todos', 'Francs', 'Capet', 'cantante bretón', 'futbolista', 'escritor', 'periodista','supermercado', 'brioche', 'compositor', 'político' ];
      } else if (window.CURRENT_LANGUAGE === 'hu') {
        stdTypeOptionsExpanded = ['Mindenki ősünk', 'Franks', 'Capet', 'breton énekes', 'labdarúgó', 'író', 'irodalom','szupermarket', 'briós', 'zeneszerző', 'politikus' ];
      }
  } else {
      stdTypeOptions = ['démo1', 'démo2', 'démo3', 'démo4', 'démo5', 'démo6', 'démo7', 'démo8', 'démo9', 'démo10', 'démo11', 'démo12', 'démo13', 'démo14', 'démo15', 'démo16'];
      stdTypeValues = ['demo1', 'demo2', 'demo3', 'demo4', 'demo5', 'demo6', 'demo7', 'demo8', 'demo9', 'demo10', 'demo11', 'demo12', 'demo13', 'demo14', 'demo15', 'demo16'];
      if (window.CURRENT_LANGUAGE === 'fr') {
        stdTypeOptionsExpanded = ['Costaud la Planche', 'On descend tous de lui', 'comme un ouragan', 'Espace', 'Arabe du futur', 'Loup du Canada', "c'est normal", 'les bronzés', 'avant JC', 'Francs', 'Capet', 'ptit gars du wav', 'maillot jaune', 'Valerie', 'Victor', 'le grand blond'];
      } else if (window.CURRENT_LANGUAGE === 'en') {
        stdTypeOptionsExpanded = ['Lalatte castle', 'Our ancestor to all', 'Like a hurricane', 'Space', 'The Arab of the future', 'Wolf of Canada', "it's normal", 'les bronzed', 'before JC', 'Franks', 'Capet', 'ptit gars du wav', 'yellow jersey', 'Valerie', 'Victor', 'the tall blond'];
      } else if (window.CURRENT_LANGUAGE === 'es') {
        stdTypeOptionsExpanded = ['El castillo de Lalatte', 'Nuestro antepasado de todos', 'Como un huracán', 'Espacio', 'El árabe del futuro', 'Lobo de Canadá', 'es normal', 'los bronceados', 'antes de JC', 'Francs', 'Capet', 'ptit gars du wav', 'maillot jaune', 'Valerie', 'Victor', 'el rubio alto'];
      } else if (window.CURRENT_LANGUAGE === 'hu') {
        stdTypeOptionsExpanded = ['Lalatte kastély', 'Mindenki ősünk', 'Mint egy hurrikán', 'Űr', 'A jövő arabja', 'Kanada farkasa', 'ez normális', 'a lebarnultakat', 'JC előtt', 'Franks', 'Capet', 'ptit gars du wav', 'sárga mez', 'Valerie', 'Victor', 'a magas szőke'];
      }
  }

  // Fusionner les listes
  typeOptions = typeOptions.concat(stdTypeOptions);
  typeOptionsExpanded = typeOptionsExpanded.concat(stdTypeOptionsExpanded);
  typeValues = typeValues.concat(stdTypeValues);
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
        width: '60px', // Valeur originale
        height: '30px', // '25px' Valeur originale
        dropdownWidth: '190px', // Valeur originale
        // dropdownHeight: '100px' // Valeur originale
        dropdownMaxHeight: '300px' // Valeur originale
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
      selectorSettings.dimensions.width = '60px'; //'45px';
      selectorSettings.dimensions.height = '30px'; //'20px';
      selectorSettings.dimensions.dropdownWidth = '180px';
      // selectorSettings.dimensions.dropdownHeight = '50px';
      selectorSettings.dimensions.dropdownMaxHeight = '170px';
      selectorSettings.padding.display.x = 3;
      selectorSettings.arrow.size = 5; //4;
      selectorSettings.arrow.offset.x = -5; //-4;
    } else if (height < 800) {
      selectorSettings.dimensions.width = '60px'; //'45px';
      selectorSettings.dimensions.height = '30px'; //'22px';
      selectorSettings.dimensions.dropdownWidth = '180px';
      // selectorSettings.dimensions.dropdownHeight = '240px';
      selectorSettings.dimensions.dropdownMaxHeight = '300px';
      selectorSettings.padding.display.x = 3;
      selectorSettings.arrow.size = 5;
      selectorSettings.arrow.offset.x = -5; //-4;
    }
    
    // Configurer le sélecteur personnalisé directement avec la fonction importée
    const customSelector = createCustomSelector({
      options: options,
      selectedValue: 'demo1',
      // colors: {
      //   main: ' #ff9800',

      //   options: ' #ff9800',
      //   hover: ' #f57c00',
      //   selected: ' #e65100'
      // },
      colors: {
        main: ' #4387fcff',
        options: '#4387fcff',
        hover: ' #1760ddff',
        selected: ' #1149a9ff',
      },

      
      dimensions: selectorSettings.dimensions,
      padding: selectorSettings.padding,
      arrow: selectorSettings.arrow,
      customizeOptionElement: (optionElement, option) => {
        optionElement.textContent = option.expandedLabel;
        optionElement.style.textAlign = 'center';
        
        if (window.innerHeight*state.browserScaleCorrection < 400) {
          optionElement.style.padding = '10px 8px'; //'6px 8px';
          // optionElement.style.fontSize = '13px'; //'12px';
        } else if (window.innerHeight*state.browserScaleCorrection < 800) {
          optionElement.style.padding = '10px 8px'; //'7px 8px';
          // optionElement.style.fontSize = '13px';
        } else {  
          // Valeurs originales pour les grands écrans
          optionElement.style.padding = '10px 8px';
          // optionElement.style.fontSize = '13px';
        }
      },
      onChange: async (value) => {
        // Créer un événement pour simuler le clic sur l'option de menu correspondante
        if (value === 'createYourDemo') {
          openCustomAnimationModal();
          toggleMenu(false);
          return;
        }

        state.ancestorPathIndex = null;

        // Gérer les démos personnalisées
        if (value.startsWith('custom_demo_')) {
             console.log("🔍 Tentative de chargement démo:", value);
             const customDemos = JSON.parse(localStorage.getItem('customDemos') || '[]');
             const demo = customDemos.find(d => d.id === value);
             
             console.log("🔍 Démo trouvée:", demo);

             if (demo) {
                 // 1. Réinitialiser l'état d'animation (CRUCIAL pour recalculer le chemin)
                 importLinks.treeAnimation.resetAnimationState();

                 // 2. Gérer les modes conflictuels (Radar/Nuage)
                 if (state.isRadarEnabled) {
                    console.log("🔄 Désactivation Radar pour démo");
                    const disableFortuneModeClean = await getDisableFortuneModeClean();
                    const disableFortuneModeWithLever = await getDisableFortuneModeWithLever();
                    disableFortuneModeClean();
                    disableFortuneModeWithLever();
                    toggleTreeRadar();
                 }
        
                 if (state.isWordCloudEnabled) {
                    const closeCloudName = await getCloseCloudName(); 
                    console.log("🔄 Fermeture Nuage pour démo");
                    closeCloudName(); 
                 }

                //  state.targetAncestorId = demo.ancestorId;
                //  state.targetCousinId = demo.cousinId;


                state.targetAncestorId  = null;
                state.targetCousinId  = null;

                if (demo.ancestorName && demo.ancestorName !== '') {
                  state.targetAncestorId = searchRootPersonId(demo.ancestorName.replace(/\//g, '')).id;
                }

                if (demo.cousinName && demo.cousinName !== '') {
                  state.targetCousinId = searchRootPersonId(demo.cousinName.replace(/\//g, '')).id;
                }

                if (demo.ancestorPathIndex && demo.ancestorPathIndex !== '') {
                  state.ancestorPathIndex = demo.ancestorPathIndex;
                } else {
                  state.ancestorPathIndex = null;
                }


                 // Configuration pour l'animation
                 state.isAnimationLaunched = true;
                 state.nombre_generation = 2;
                 
                 const genSelect = document.getElementById('generations');
                 if (genSelect) genSelect.value = '2';
                 
                //  const animationPauseBtn = document.getElementById('animationPauseBtn');
                 const animationPauseBtnSpan = document.getElementById('animationPauseBtnSpan');
                //  if (animationPauseBtn && animationPauseBtn.querySelector('span')) {
                 if (animationPauseBtnSpan) {
                    // animationPauseBtn.querySelector('span').innerHTML = '<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" focusable="false" style="vertical-align:middle"><rect x="6" y="5" width="4" height="14" fill="currentColor"></rect><rect x="14" y="5" width="4" height="14" fill="currentColor"></rect></svg>';
                    animationPauseBtnSpan.innerHTML = '<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" focusable="false" style="vertical-align:middle"><rect x="6" y="5" width="4" height="14" fill="currentColor"></rect><rect x="14" y="5" width="4" height="14" fill="currentColor"></rect></svg>';
                 }

                redimensionnerPlayButtonSizeInDOM();


// function setAnimationButtonStyle(scaleFactor) {
//     const btn = document.getElementById('animationPauseBtn');
//     if (!btn) return;

//     // 1. Appliquer l'échelle au bouton (CSS)
//     btn.style.setProperty('--scale', scaleFactor);

//     // 2. Calculer la taille de l'icône (80% de la hauteur de base proportionnelle)
//     // Origine : bouton 30px -> icône ~14-16px. 
//     // On garde le ratio 0.8 pour le look "aéré".
//     const iconSize = 16 * scaleFactor * 0.8;

//     const span = btn.querySelector('span');
//     if (span) {
//         // SVG Pause avec proportions d'origine (viewBox 24)
//         span.innerHTML = `
//             <svg viewBox="0 0 24 24" 
//                  width="${iconSize}px" 
//                  height="${iconSize}px" 
//                  fill="currentColor" 
//                  style="vertical-align:middle">
//                 <rect x="6" y="5" width="4" height="14"></rect>
//                 <rect x="14" y="5" width="4" height="14"></rect>
//             </svg>`;
//     }
// }

// // Utilisation :
// setAnimationButtonStyle(state.browserScaleFactor);




                 const treeModeReal = state.treeModeReal;
                //  state.treeModeBackup = state.treeMode;
                 let isCousin = false;

                 if (state.targetCousinId && state.targetCousinId !== '') {
                    state.treeMode = 'directAncestors';
                    isCousin = true;
                 }

                displayGenealogicTree(null, true, false, true);

                state.treeModeReal = treeModeReal;               

                console.log("🚀 Lancement de l'animation dans 500ms...");
                setTimeout(() => { 
                  importLinks.treeAnimation.startAncestorAnimation(isCousin);
                }, 500);
                toggleMenu(false);
                return;
             } else {
                 console.error("❌ Démo introuvable dans le stockage!");
             }
        }

        const fakeEvent = {
          target: { value: value }
        };
        
        try {
          handleRootPersonChange(fakeEvent);

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
            backgroundColor: '#4387fcff',// , 'rgba(255, 152, 0, 0.85)', 
            color: 'white',
            boxSizing: 'border-box',
            fontWeight: 'bold'
          });
          
          // Ajustements uniquement pour les petits écrans
          if (window.innerHeight*state.browserScaleCorrection < 400) {
            // displayElement.style.fontSize = '12px';
            displayElement.style.padding = '2px 3px';
          } else if (window.innerHeight*state.browserScaleCorrection < 800) {
            // displayElement.style.fontSize = '12px';
            displayElement.style.padding = '2px 3px';
          } else {
            // displayElement.style.fontSize = '12px';
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
    parentNode.replaceChild(customSelector, referenceNode);
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
        handleRootPersonChange(fakeEvent);
      } catch (error) {
        console.error("Erreur lors du lancement de la démo:", error);
      }
    });
    
    // Remplacer le placeholder par le sélecteur de secours
    parentNode.replaceChild(fallbackSelector, referenceNode);
    console.log("Sélecteur de démo de secours créé");
  }
}

// Fonction pour créer un sélecteur de nombre de prénoms
function createPrenomsSelector() {
  const height = window.innerHeight*state.browserScaleCorrection;
  
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
        if (typeof updatePrenoms === 'function') {
          updatePrenoms(value);
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
          if (window.innerHeight*state.browserScaleCorrection < 400) {
            // displayElement.style.fontSize = '10px';
            displayElement.style.padding = '1px 2px';
          } else if (window.innerHeight*state.browserScaleCorrection < 800) {
            // displayElement.style.fontSize = '11px';
            displayElement.style.padding = '2px 3px';
          } else {
            // displayElement.style.fontSize = '11px';
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
      if (typeof updatePrenoms === 'function') {
        updatePrenoms(this.value);
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
    const height = window.innerHeight*state.browserScaleCorrection;
    
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
    function handleSelectorClick(originalSelector, e, width = null) {

        e.stopPropagation();
        
        // Fermer le menu hamburger
        toggleMenu(false);
        
        // Fermer tous les menus déroulants
        closeAllDropdowns();
        
        // Délai pour s'assurer que le menu est fermé
        setTimeout(() => {
            const displayElement = originalSelector.querySelector('div.custom-select-display');

            if (displayElement) {
              // console.log("\n\n  debug  0 Clicked on menu-generations: displayElement.offsetWidth= ", displayElement.offsetWidth);
              if (width) { displayElement.style.minWidth = width + 'px'; }
              displayElement.click();
            } else {
              // console.log("\n\n  debug  0 Clicked on menu-generations: originalSelector.offsetWidth= ", originalSelector.offsetWidth);
              if (width) { originalSelector.style.minWidth = width + 'px'; }
              originalSelector.click();
            }
        }, 300);
    }
    
    try {
        const importPromise = import('./mainUI.js');
        // const importPromise = importLinks.mainUI;
        
        importPromise.then(mainUI => {
            if (mainUI) {
                // // Synchroniser les sélecteurs de génération
                const originalGen = document.getElementById('generations');
                originalGen.style.visibility = 'visible';

                const existingGenClone = document.getElementById('menu-generations');
                const genPlaceholder = document.getElementById('menu-generations-placeholder');

                if (originalGen && (genPlaceholder || existingGenClone)) {
                  const clone = originalGen.cloneNode(true);
                  clone.id = 'menu-generations';
                  
                  if (existingGenClone) {
                    existingGenClone.parentNode.replaceChild(clone, existingGenClone);
                  } else {
                    genPlaceholder.parentNode.replaceChild(clone, genPlaceholder);
                  }

                  clone.addEventListener('click', (e) => {
                    const currentGen = document.getElementById('generations');
                    if (!currentGen) return;
                    // Rendre visible avant le handler
                    currentGen.style.visibility = 'visible';

                    // Rendre visible avant le handler
                    currentGen.style.display = 'inline-flex';
                    // Appeler le handler
                    handleSelectorClick(currentGen, e, currentGen.offsetWidth);
                  });
                }

                if (originalGen && !state.isButtonOnDisplay) {originalGen.style.visibility = 'hidden';}


                // Synchroniser les sélecteurs de mode d'arbre
                const originalMode = document.getElementById('treeMode');
                originalMode.style.visibility = 'visible';

                const existingModeClone = document.getElementById('menu-treeMode');
                const modePlaceholder = document.getElementById('menu-treeMode-placeholder');

                if (originalMode && (modePlaceholder || existingModeClone)) {
                  const clone = originalMode.cloneNode(true);
                  clone.id = 'menu-treeMode';
                  
                  // modePlaceholder.parentNode.replaceChild(clone, modePlaceholder);
                  if (existingModeClone) {
                    existingModeClone.parentNode.replaceChild(clone, existingModeClone);
                  } else {
                    modePlaceholder.parentNode.replaceChild(clone, modePlaceholder);
                  }
                  
                  clone.addEventListener('click', (e) => {
                    const currentTreeMode = document.getElementById('treeMode');
                    if (!currentTreeMode) return;
                    console.log("\n\n  debug  Clicked on menu-generations: currentTreeMode.offsetWidth= ", currentTreeMode.offsetWidth);
                    // Rendre visible avant le handler
                    currentTreeMode.style.visibility = 'visible';

                    // Rendre visible avant le handler
                    currentTreeMode.style.display = 'inline-flex';
                    // Appeler le handler
                    handleSelectorClick(currentTreeMode, e, currentTreeMode.offsetWidth);
                  });
                }
                if (originalMode && !state.isButtonOnDisplay) {originalMode.style.visibility = 'hidden';}
    
                
                
                
                // Synchronisation du sélecteur de personne racine
                const rootResultsPlaceholder = document.getElementById('menu-root-person-results-placeholder');
                const originalRootResults = document.getElementById('root-person-results');

                const rootResultPersonLink = document.getElementById('menu-root-person-results-clone');
    


                if (rootResultsPlaceholder && originalRootResults) {

                    // console.log('\n\n  ********* debug ROOT', rootResultsPlaceholder, originalRootResults)

                    // Conteneur principal
                    const rootPersonContainer = document.createElement('div');
                    rootPersonContainer.id = 'menu-root-person-results-container'; // Ajouter un ID
                    rootPersonContainer.style.display = 'flex';
                    rootPersonContainer.style.alignItems = 'center';
                    
                    // Adapter uniquement pour les petits écrans
                    let scale = 1;
                    if(!state.isSamsungBrowser) { scale = 1/state.browserScaleFactor; }
                    if (height < 400) {
                        rootPersonContainer.style.gap = 5*scale + 'px';
                    } else if (height < 800) {
                        rootPersonContainer.style.gap = 8*scale + 'px';
                    } else {
                        rootPersonContainer.style.gap = 10*scale + 'px';
                    }
                    // rootPersonContainer.style.width = '200px'; // Valeur originale
                    // rootPersonContainer.style.maxWidth = '200px'; // Valeur originale  
                    
                    
                    // Label à gauche
                    const rootPersonLabel = document.createElement('label');
                    // rootPersonLabel.textContent = 'Sélect. personne racine';
                    // rootPersonLabel.textContent = getMenuTranslation('rootPersonLabel');
                    rootPersonLabel.innerHTML = getMenuTranslation('rootPersonLabel');
                    rootPersonLabel.dataset.role = 'fontSizeChangeHamburger';

                    rootPersonLabel.style.color = '#000';
                    rootPersonLabel.style.lineHeight = '1.2';
                    rootPersonLabel.style.textAlign = 'right';
                    rootPersonLabel.style.flexShrink = '0';
                    
                    // Adapter uniquement pour les petits écrans
                    if (height < 400) {
                        rootPersonLabel.style.fontSize = '10px';
                        // rootPersonLabel.style.width = 60/10 +'em';
                    } else if (height < 800) {
                        rootPersonLabel.style.fontSize = '12px';
                        // rootPersonLabel.style.width = 60/12+'em';
                    } else if (height < 1200) {
                        rootPersonLabel.style.fontSize = '14px';
                        // rootPersonLabel.style.width = 60/14+'em'; // Valeur originale                        
                    } else {
                        rootPersonLabel.style.fontSize = '14px'; // Valeur originale
                        // rootPersonLabel.style.width = 60/14+'em'; // Valeur originale
                    }
                    rootPersonLabel.style.marginRight = 10/14+'em';
                    rootPersonLabel.style.width = 'fit-content';

    
                    // Bouton/div style sélecteur personnalisé
                    const rootPersonLink = document.createElement('div');
                    rootPersonLink.id = 'menu-root-person-results-clone';
                    rootPersonLink.dataset.role = 'fontSizeChangeHamburger';
                    
                    // Copier le style du sélecteur original
                    rootPersonLink.style.cursor = 'pointer';
                    rootPersonLink.style.border = 'none';
                    rootPersonLink.style.borderRadius = 4/14+'em';
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
                        rootPersonLink.style.fontSize = state.initialHamburgerFontSize + 'px'; //11px
                        // rootPersonLink.style.padding = 1/11+'em ' + 3/11+'em';
                        // rootPersonLink.style.height = 22/11+'em';
                        // rootPersonLink.style.minWidth = 80/11+'em';
                        // rootPersonLink.style.maxWidth = 80/11+'em';
                      } else if (height < 800) {
                        rootPersonLink.style.fontSize = state.initialHamburgerFontSize + 'px'; //12px                  
                        // rootPersonLink.style.padding = 1/12+'em ' + 4/12+'em';
                        // rootPersonLink.style.height = 24/12+'em';
                        // rootPersonLink.style.minWidth = 80/12+'em';
                        // rootPersonLink.style.maxWidth = 80/12+'em';
                      } else {
                        rootPersonLink.style.fontSize = state.initialHamburgerFontSize + 'px'; //14px                     
                        // rootPersonLink.style.padding = 1/14+'em ' + 4/14+'em';
                        // rootPersonLink.style.height = 25/14+'em';
                        // rootPersonLink.style.minWidth = 80/14+'em';
                        // rootPersonLink.style.maxWidth = 80/14+'em';
                      }
                    // rootPersonLink.style.paddingRight = 8/14 + 'em';
                    rootPersonLink.style.width = 'fit-content';
                    rootPersonLink.style.whiteSpace = 'nowrap';
                    rootPersonLink.style.display = 'block';
                    rootPersonLink.style.paddingLeft = 3/state.initialHamburgerFontSize +'em';
                    rootPersonLink.style.paddingRight = 3/state.initialHamburgerFontSize +'em';
                    rootPersonLink.style.paddingTop = 3/state.initialHamburgerFontSize +'em';
                    rootPersonLink.style.paddingBottom = 2/state.initialHamburgerFontSize +'em';                        
                    // Texte du bouton (nom de la personne racine)
                    const displayElement = originalRootResults.querySelector('div[style*="border"] span');
                    const currentText = displayElement ? displayElement.textContent.trim() : 'Sélectionner';
                    rootPersonLink.textContent = currentText;
                    rootPersonLink.addEventListener('click', function(e) {
                        e.stopPropagation();
                        
                        // Récupérer explicitement le sélecteur de root person
                        const originalRootResults = document.getElementById('root-person-results');                                       
                        const displayElement = originalRootResults.querySelector('div[style*="border"]');

                        originalRootResults.style.visibility = 'visible';

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
                                        let offset = 5;
                                        if (!state.isSamsungBrowser) { offset = offset/state.browserScaleFactor;}

                                        optionsContainerAfterClick.style.top = `${rect.bottom + offset}px`;
                                        
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
                } else if (originalRootResults && rootResultPersonLink) {
                    // console.log('\n\n  ********* debug ROOT no rootResultsPlaceholder', rootResultsPlaceholder, originalRootResults, rootResultPersonLink)
                    // Texte du bouton (nom de la personne racine)
                    const displayElement = originalRootResults.querySelector('div[style*="border"] span');
                    const currentText = displayElement ? displayElement.textContent.trim() : 'Sélectionner';
                    rootResultPersonLink.textContent = currentText;
                }

                if (originalRootResults && !state.isButtonOnDisplay) {originalRootResults.style.visibility = 'hidden';}
    
                // Synchronisation du champ de recherche de personne racine
                const rootSearchPlaceholder = document.getElementById('menu-root-person-search-placeholder');
                const originalRootSearch = document.getElementById('root-person-search');
    
                if (rootSearchPlaceholder && originalRootSearch) {
                    const rootSearchLink = document.createElement('div');
                    rootSearchLink.id = 'menu-root-person-search-clone';
                    // rootSearchLink.textContent = '🔍 personne racine';
                    rootSearchLink.textContent = getMenuTranslation('rootSearch');
                    rootSearchLink.dataset.role = 'fontSizeChangeChromeHamburger';
                    rootSearchLink.style.cursor = 'pointer';
                    // rootSearchLink.style.backgroundColor = 'white';
                    rootSearchLink.style.backgroundColor = '#F6CC7F';
                    rootSearchLink.style.textAlign = 'left';

                    rootSearchLink.style.border = 1/14 + 'em solid #333';
                    rootSearchLink.style.borderRadius = 4/14 + 'em';
                    rootSearchLink.style.display = 'flex';
                    rootSearchLink.style.alignItems = 'center';

                   
                    // Adapter uniquement pour les petits écrans
                    let fontSize;
                    if (height < 400) {
                        fontSize = state.initialHamburgerFontSize + 'px'; //11px
                        rootSearchLink.style.padding = 2/11 + 'em ' + 3/11 + 'em';
                        rootSearchLink.style.margin = 2/11 + 'em 0';
                    } else if (height < 800) {
                        fontSize = state.initialHamburgerFontSize + 'px'; //12px
                        rootSearchLink.style.padding =  2/12 + 'em ' + 3/12 + 'em';
                        rootSearchLink.style.margin = 2/12 + 'em 0';
                    } else {
                        fontSize = state.initialHamburgerFontSize + 'px'; // Valeur originale
                        rootSearchLink.style.padding = 3/14 + 'em ' + 4/14 + 'em'; // Valeur originale
                        rootSearchLink.style.margin =  3/14 + 'em 0'; // Valeur originale
                    }
                    // rootSearchLink.style.maxWidth = 150/12 + 'em'; // Valeur originale
                    rootSearchLink.style.paddingRight = 8/14 + 'em';
                    rootSearchLink.style.width = 'fit-content';
                    rootSearchLink.style.whiteSpace = 'nowrap';
                    rootSearchLink.style.display = 'block';
                    rootSearchLink.style.fontSize = fontSize;


                    rootSearchLink.addEventListener('click', function(e) {
                        originalRootSearch.style.visibility = 'visible';
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
        font-size: 10px;
        width: 3em;
        height: 3em;
        }
        
        .small-screen .hamburger-menu span {
        font-size: 10px;
        width: 1.8em;
        height: 0.2em;
        margin: 0.1em 0;
        }
        
        .small-screen .side-menu {
        /* width: 220px; */
        /* padding: 40px 5px 10px; */
        }
        
        /* .small-screen .menu-title {
         top: 10px; 
         left: 40px; 
         font-size: 14px; 
        } */
        
        .small-screen .menu-section {
        margin-bottom: 6px;
        padding: 4px;
        }
        
        .small-screen .menu-section h3 {
        margin-bottom: 4px;
        font-size: 14px;
        }
        
        .small-screen .menu-section-content {
        gap: 3px;
        }
        
        .small-screen .side-menu button span {
        font-size: 20px;
        }
        
        .small-screen .menu-section-content label {
        margin-bottom: 2px;
        font-size: 11px;
        }
        
        /* Styles pour les écrans moyens uniquement */
        .medium-screen .hamburger-menu {
        font-size: 10px;
        width: 3.5em;
        height: 3.5em;
        }
        
        .medium-screen .hamburger-menu span {
        font-size: 10px;
        width: 2.2em;
        height: 0.25em;
        margin: 0.15em 0;
        }
        
        .medium-screen .side-menu {
        /* width: 220px; */
        /* padding: 50px 8px 15px; */
        }

        /* .medium-screen .menu-title {
         top: 12px; 
         left: 50px;
         font-size: 16px;
        } */
        
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
        font-size: 20px;
        }
        
        .medium-screen .menu-section-content label {
        margin-bottom: 3px;
        font-size: 12px;
        }
        
        /* Style pour le bouton hamburger - Styles de base inchangés */
        .hamburger-menu {
        font-size: 10px;
        position: fixed;
        top: 0.5em;   
        left: 0.5em; 
        z-index: 3000;
        width: 4em;
        height: 4em;
        background-color: #4CAF50;
        border-radius: 0.8em;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        box-shadow: 0 0.2em 0.5em rgba(0,0,0,0.3);
        border: none;
        }
    
        .hamburger-menu span {
        font-size: 10px;
        display: block;
        width: 2.4em;
        height: 0.3em;
        margin: 0.2em 0;
        background-color: white;
        border-radius: 0.3em;
        transition: all 0.3s ease;
        }
    
        /* Menu latéral - Style de base inchangé */
        .side-menu {
        position: fixed;
        top: 0;
        // left: -250px;

        /* On utilise transform au lieu de left */
        transform: translateX(-100%); 
        /*transition: transform 0.3s ease;*/ /* Transition plus fluide (GPU-accelerated) */

        /* width: 220px; */
        height: 100vh;
        background-color: white;
        box-shadow: 2px 0 5px rgba(0,0,0,0.2);
        z-index: 2900;
        transition: left 0.3s ease;
        overflow-y: auto;
        overflow-x: hidden;
        /* padding: 60px 10px 20px; */ 
        display: flex;              /* IMPORTANT */
        flex-direction: column;     /* header + body */
        box-sizing: border-box;
        visibility: hidden;
        }
    
        .side-menu.open {
        // left: 0;
        transform: translateX(0);
        visibility: visible;
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
        font-size: 14px;
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
        padding: 0px;
        margin: 0;
        border: none;
        background-color: transparent;
        border-radius: 4px;
        }
    
        .side-menu button:hover {
        background-color: rgba(0,0,0,0.05);
        }


        .side-menu button span {
        font-size: 20px;
        /*display: block;*/
        }
    
        .side-menu select, .side-menu input {
        min-width: auto;
        max-width: 100%;
        }
    
        /* Style pour le titre du menu - Style de base inchangé */
        .menu-title {
        position: absolute;
        /* top: 15px; */
        /* left: 60px; */
        /* font-size: 18px; */
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

      resizeHamburger();
      
      sideMenu.classList.add('open');
      menuOverlay.classList.add('open');

      resetHamburgerButtonPosition();

    } else {
      sideMenu.classList.remove('open');
      menuOverlay.classList.remove('open');
      
      if (state.isWordCloudEnabled ) {
        offsetHamburgerButtonDown();
      }
    }
}
  
// Configurer la fermeture automatique sur mobile
function setupMobileMenuClosing() {
    document.querySelectorAll('#side-menu button, #side-menu select').forEach(element => {
      element.addEventListener('click', function() {
        // Sur mobile, fermer le menu après la sélection
        if (window.innerWidth*state.browserScaleCorrection < 768) {
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
        const originalPauseBtn = document.getElementById('animationPauseBtn');
        const menuPlayBtn = document.getElementById('menu-animationPlayBtn');

        if (originalPauseBtn && menuPlayBtn) {
            const syncStylesAndContent = () => {
                // 1. Synchronise le contenu (l'icône)
                menuPlayBtn.innerHTML = originalPauseBtn.innerHTML;

                // 2. Récupère tout le style de l'original
                menuPlayBtn.style.cssText = originalPauseBtn.style.cssText;

                // 3. FORCE la visibilité à visible (écrase ce qui vient d'être copié)
                menuPlayBtn.style.visibility = 'visible';
                
                // Optionnel : si l'original utilise display:none, forcez aussi le display
                if (menuPlayBtn.style.display === 'none') {
                    menuPlayBtn.style.display = 'flex'; // ou 'block' selon votre CSS
                }
            };

            const pauseObserver = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList' || mutation.type === 'attributes') {
                        syncStylesAndContent();
                    }
                });
            });

            pauseObserver.observe(originalPauseBtn, { 
                childList: true,
                attributes: true, 
                subtree: true,
                attributeFilter: ['style', 'class']
            });
            
            // Synchronisation initiale
            syncStylesAndContent();
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
     console.log("Affichage du menu hamburger via hamburgerMenu.js");
     
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
            //  originalRootResults.style.visibility = 'visible';

            console.log("\n\n debug ! Mise à jour du nom de la personne racine dans le menu hamburger\n\n");

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
        //  window.showToast(getMenuTranslation('menuAvailable'))
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
 * Fonction pour décaler le bouton hamburger de 20px vers le bas
 * Approche minimaliste pour éviter les conflits
 */
export function offsetHamburgerButtonDown() {
  console.log("Tentative de décalage du bouton hamburger vers le bas");
  
  // Récupérer l'élément bouton
  const hamburgerButton = document.getElementById('hamburger-menu');
  
  if (!hamburgerButton) {
    console.error("Le bouton hamburger n'existe pas dans le DOM");
    return;
  }
  
  // Appliquer UNIQUEMENT le décalage, sans toucher aux autres propriétés
  if (state.isSamsungBrowser) {
    hamburgerButton.style.setProperty('margin-top', '50px', 'important');
  } else { 
    hamburgerButton.style.setProperty('margin-top', 50/state.browserScaleFactor + 'px', 'important');
  }
  
  console.log("Décalage de 20px vers le bas appliqué au bouton hamburger");
}

/**
 * Fonction pour remettre le bouton hamburger à sa position initiale
 */
export function resetHamburgerButtonPosition() {
  console.log("Remise à zéro de la position du bouton hamburger");
  
  // Récupérer l'élément bouton
  const hamburgerButton = document.getElementById('hamburger-menu');
  
  if (!hamburgerButton) {
    console.error("Le bouton hamburger n'existe pas dans le DOM");
    return;
  }
  
  // Remettre le margin-top à zéro
  hamburgerButton.style.setProperty('margin-top', '0px', 'important');
  
  console.log("Position initiale restaurée pour le bouton hamburger");
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
    console.log("Initialisation HamburgerMenu.js");
    createMenuElements();
    state.isHamburgerMenuInitialized = true;
    
    // Attacher un écouteur d'événements pour détecter quand l'arbre est chargé
    document.addEventListener('gedcomLoaded', function() {
    console.log("Event gedcomLoaded détecté, préparation du menu hamburger");
    updateHeightClass(); // Mettre à jour les classes de hauteur
    setTimeout(syncCustomSelectors, 1000); // Synchroniser après un délai pour s'assurer que tout est prêt
    });

    // Ajouter un écouteur pour les changements de taille de fenêtre
    window.addEventListener('resize', debounce(function() {
      // Ajuster les sélecteurs si le menu est ouvert
      if (sideMenu && sideMenu.classList.contains('open')) {
        console.log('\n\n*** debug resize in initializeHamburgerOnce in hammburger.js for updateHeightClass \n\n')
        updateHeightClass();
        setTimeout(syncCustomSelectors, 300);
      }

    }, 150));

    document.addEventListener('change', function(event) {
      // Vérifier si l'événement provient du sélecteur de personne racine
      if (event.target && event.target.id === 'root-person-results') {
          // Petit délai pour s'assurer que l'interface s'est mise à jour
          setTimeout(updateRootPersonNameInMenu, 100);
      }
    });
  }
}





export function openCustomAnimationModal() {
    let modal = document.getElementById('custom-animation-modal');
    if (modal) {
        modal.style.display = 'flex';
        return;
    }

    modal = document.createElement('div');
    modal.id = 'custom-animation-modal';
    
    // Style wrapper to be non-blocking for background but centering content
    Object.assign(modal.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        zIndex: '9000',
        pointerEvents: 'none', // Let clicks pass through outside
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingTop: '80px'
    });

    let selectedAncestor = null;
    let selectedCousin = null;

    const modalContent = document.createElement('div');
    modalContent.className = 'custom-animation-content';
    // Apply styles similar to searchModal-content
    Object.assign(modalContent.style, {
        backgroundColor: 'white',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '400px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        pointerEvents: 'all', // Re-enable clicks
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        maxHeight: '80vh',
        border: '1px solid #ccc'
    });

    // Header
    const header = document.createElement('div');
    header.className = 'custom-animation-header';
    Object.assign(header.style, {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 15px',
        backgroundColor: '#4387fc', // Blue like the menu item
        color: 'white',
        cursor: 'move',
        borderBottom: '1px solid #eee'
    });

    const title = document.createElement('h3');
    title.textContent = getMenuTranslation('customAnimationTitle');
    title.style.margin = '0';
    title.style.fontSize = '16px';

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    Object.assign(closeBtn.style, {
        background: 'none',
        border: 'none',
        color: 'white',
        fontSize: '24px',
        cursor: 'pointer',
        padding: '0',
        width: '30px',
        height: '30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    });
    
    function closeModal() {
        modal.style.display = 'none';
    }
    
    closeBtn.onclick = closeModal;

    header.appendChild(title);
    header.appendChild(closeBtn);

    // Body
    const body = document.createElement('div');
    body.className = 'custom-animation-body';
    Object.assign(body.style, {
        padding: '15px',
        overflowY: 'auto'
    });

    body.innerHTML = `
        <div class="animation-name-container" style="margin-bottom: 15px;">
            <label style="display:block; margin-bottom:5px; font-weight:bold; font-size:14px;">${getMenuTranslation('animationNameLabel')}:</label>
            <input type="text" id="animation-name" placeholder="${getMenuTranslation('animationNamePlaceholder')}" style="width:100%; padding:8px; box-sizing:border-box; border:1px solid #ccc; border-radius:4px;">
        </div>
        <div class="animation-mode-toggle" style="margin-bottom: 15px;">
            <label>
                <input type="checkbox" id="cousin-mode-toggle">
                ${getMenuTranslation('cousinMode')}
            </label>
        </div>
        <div id="ancestor-search-container"></div>
        <div id="cousin-search-container" style="display: none;"></div>
        <div class="modal-buttons" style="margin-top: 20px; text-align: right;">
            <button id="start-custom-animation" class="modal-btn confirm" style="
                background-color: #4CAF50; 
                color: white; 
                border: none; 
                padding: 8px 16px; 
                border-radius: 4px; 
                cursor: pointer; 
                font-weight: bold;">
                ${getMenuTranslation('startAnimation')}
            </button>
        </div>
    `;

    modalContent.appendChild(header);
    modalContent.appendChild(body);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    const ancestorContainer = body.querySelector('#ancestor-search-container');
    const cousinContainer = body.querySelector('#cousin-search-container');
    const cousinToggle = body.querySelector('#cousin-mode-toggle');
    const startButton = body.querySelector('#start-custom-animation');

    const ancestorSearch = createSearchInput('ancestor', (person) => {
        selectedAncestor = person;
    });
    ancestorContainer.appendChild(ancestorSearch.container);

    const cousinSearch = createSearchInput('cousin', (person) => {
        selectedCousin = person;
    });
    cousinContainer.appendChild(cousinSearch.container);

    cousinToggle.addEventListener('change', () => {
        const isCousinMode = cousinToggle.checked;
        cousinContainer.style.display = isCousinMode ? 'block' : 'none';
        ancestorSearch.label.textContent = isCousinMode ? getMenuTranslation('commonAncestor') + ':' : getMenuTranslation('ancestor') + ':';
    });

    startButton.addEventListener('click', async () => {
        if (!selectedAncestor) {
            alert(getMenuTranslation('selectPerson'));
            return;
        }

        // Sauvegarder la démo personnalisée
        const nameInput = document.getElementById('animation-name');
        let name = nameInput.value.trim();
        
        // Charger les démos existantes
        let customDemos = JSON.parse(localStorage.getItem('customDemos') || '[]');
        
        if (!name) {
            name = `myDemo ${customDemos.length + 1}`;
        }
        
        const allPaths = importLinks.treeAnimation.findAllAncestorPaths(state.rootPersonId, selectedAncestor.id);
        let selectedPathIndex;
        if (allPaths.length > 0) {

          let cousinPath = null;
          let cousinDescendantPath = null;

          if (cousinToggle.checked && selectedCousin && selectedCousin.id !== '') {
            [cousinPath, cousinDescendantPath] = importLinks.treeAnimation.findAncestorPath(selectedCousin.id, selectedAncestor.id);
            
            if (cousinPath && cousinPath.length > 0) {  
              console.log("\n\n Chemin cousin trouvé:", cousinPath);
              // console.log("\n\n Chemin cousin trouvé descendant:", cousinDescendantPath);
            } else {
              console.log("\n\n Chemin cousin NON TROUVE");
              // Message à l'utilisateur
              alert("Aucun lien de parenté n'a été trouvé entre ce cousin et cet ancêtre. Veuillez saisir un nouveau nom de cousin ou d'ancêtre.");
              return; // On arrête l'exécution ici pour permettre à l'utilisateur de modifier ses choix
            }
          }


          const result = await showPathSelectionModal(allPaths, cousinPath);
          if (result) {
              const { path, index } = result; // On extrait les deux valeurs
              console.log(`Utilisateur a choisi le chemin n°${index + 1}`);
              // console.log("Données du chemin :", path);
              selectedPathIndex = index; 
          } else {
              console.log("Sélection annulée");
              return;
          }

        } 
 
 
        const newDemo = {
            id: `custom_demo_${Date.now()}`,
            name: name,
            ancestorId: selectedAncestor.id,
            cousinId: cousinToggle.checked && selectedCousin ? selectedCousin.id : null,
            ancestorName: selectedAncestor.name,
            cousinName: cousinToggle.checked && selectedCousin ? selectedCousin.name : null,
            ancestorPathIndex: selectedPathIndex
        };
        
        customDemos.push(newDemo);
        localStorage.setItem('customDemos', JSON.stringify(customDemos));

        // Mettre à jour le sélecteur
        createDemoSelector();

        state.targetAncestorId = selectedAncestor.id;
        state.targetCousinId = cousinToggle.checked && selectedCousin ? selectedCousin.id : null;
        state.ancestorPathIndex = selectedPathIndex;

        // Configuration pour l'animation
        state.isAnimationLaunched = true;
        state.nombre_generation = 2;
        
        const genSelect = document.getElementById('generations');
        if (genSelect) genSelect.value = '2';
        
        const animationPauseBtn = document.getElementById('animationPauseBtn');
        if (animationPauseBtn && animationPauseBtn.querySelector('span')) {
          animationPauseBtn.querySelector('span').innerHTML = '<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" focusable="false" style="vertical-align:middle"><rect x="6" y="5" width="4" height="14" fill="currentColor"></rect><rect x="14" y="5" width="4" height="14" fill="currentColor"></rect></svg>';
        }

        const treeModeReal = state.treeModeReal;
        // state.treeModeBackup = state.treeMode;
        let isCousin = false;
        if (state.targetCousinId && state.targetCousinId !== '') {
          state.treeMode = 'directAncestors';
          isCousin = true;
        }

        displayGenealogicTree(null, true, false, true);

        state.treeModeReal = treeModeReal; 

        
        setTimeout(() => { 
          importLinks.treeAnimation.startAncestorAnimation(isCousin);
        }, 500);

        closeModal();
    });

    // Make draggable/resizable
    makeModalDraggableAndResizable(modalContent, header);
    makeModalInteractive(modal);

 
    function createSearchInput(type, onSelect) {
        const container = document.createElement('div');
        container.className = 'search-input-container';
        container.style.marginBottom = '15px';
        container.style.position = 'relative';

        const label = document.createElement('label');
        label.textContent = getMenuTranslation(type) + ':';
        label.style.display = 'block';
        label.style.marginBottom = '5px';
        label.style.fontWeight = 'bold';
        label.style.fontSize = '14px';

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = getMenuTranslation('searchPlaceholder');
        Object.assign(input.style, {
            width: '100%',
            padding: '8px',
            boxSizing: 'border-box',
            border: '1px solid #ccc',
            borderRadius: '4px'
        });

        const handleOpenModal = async (e) => {
            e.preventDefault();
            input.blur();

            console.log(`\n\n--------[DEBUG] handleOpenModal: Ouverture pour le type '${type}'\n\n`);
     
            const openSearchModal = await getOpenSearchModal();
            openSearchModal(null, null, 'select', (person) => {
                // input.value = person.name.replace(/\//g, '');
                // onSelect(person);
                console.log(`[DEBUG] handleOpenModal: Callback reçu pour '${type}' avec la personne:`, person);
                if (person && person.name) {
                    input.value = person.name.replace(/\//g, '');
                    onSelect(person);
                } else {
                    console.error(`\n\n ----[DEBUG] handleOpenModal: L'objet 'person' reçu est invalide.\n\n`);
                }
            });
        };

        input.addEventListener('click', handleOpenModal);
        input.addEventListener('focus', handleOpenModal);

        container.appendChild(label);
        container.appendChild(input);

        return { container, label };
    }
}



/**
 * Affiche une modale avec sélection de chemin.
 * Nom extrait entre slashes et coloration différentielle alternée (Bleu/Vert).
 * Inclut un chemin cousin optionnel non sélectionnable à la fin.
 */
async function showPathSelectionModal(paths, cousinPath = null) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.id = 'path-selection-overlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.7); z-index: 10000;
            display: flex; justify-content: center; align-items: center;
            font-family: sans-serif;
        `;

        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white; padding: 20px; border-radius: 8px;
            max-width: 95%; width: 800px; max-height: 85vh;
            display: flex; flex-direction: column; box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        `;

        const title = document.createElement('h3');
        title.textContent = `Choisir un chemin (${paths.length} trouvés)`;
        title.style.margin = '0 0 15px 0';

        const pathList = document.createElement('div');
        pathList.style.overflowY = 'auto';
        pathList.style.flexGrow = '1';

        // Fonction utilitaire pour générer le contenu d'un chemin (noms + flèches)
        const renderPathContent = (ancestorIds, prevPathIds, diffColor, container) => {
            ancestorIds.forEach((id, stepIdx) => {
                const individual = state.gedcomData.individuals[id];
                const fullName = individual.name || "";
                
                // Formatage : Prénom + NOM entre slashes
                const firstName = fullName.replace(/\//g, '').split(' ')[0];
                const match = fullName.match(/\/([^/]+)\//);
                const lastName = match ? match[1].trim() : "";
                const nameToDisplay = (firstName + ' ' + lastName).trim();

                const span = document.createElement('span');
                span.textContent = nameToDisplay;

                // Coloration différentielle si id différent du chemin précédent
                if (prevPathIds && id !== prevPathIds[stepIdx]) {
                    span.style.color = diffColor;
                } else {
                    span.style.color = '#333';
                }

                container.appendChild(span);

                if (stepIdx < ancestorIds.length - 1) {
                    const arrow = document.createElement('span');
                    arrow.textContent = ' → ';
                    arrow.style.color = '#ccc';
                    container.appendChild(arrow);
                }
            });
        };

        // --- Affichage des chemins sélectionnables ---
        paths.forEach((path, pathIdx) => {
            const pathItem = document.createElement('div');
            pathItem.style.cssText = `
                padding: 10px; border: 1px solid #eee; border-radius: 5px;
                margin-bottom: 8px; cursor: pointer; background: #fff;
            `;

            let diffColor = 'black';
            if (pathIdx > 0) {
                diffColor = (pathIdx % 2 === 1) ? '#0055ff' : '#28a745'; 
            }

            const container = document.createElement('div');
            container.style.fontSize = '11px';

            const prevPathIds = pathIdx > 0 ? paths[pathIdx - 1].ancestorPath : null;
            renderPathContent(path.ancestorPath, prevPathIds, diffColor, container);

            pathItem.innerHTML = `<div style="font-size: 11px; color: #999; margin-bottom: 3px;">Chemin ${pathIdx + 1}</div>`;
            pathItem.appendChild(container);

            pathItem.onmouseover = () => pathItem.style.backgroundColor = '#f8f9fa';
            pathItem.onmouseout = () => pathItem.style.backgroundColor = '#fff';
            pathItem.onclick = () => {
                document.body.removeChild(overlay);
                resolve({ path: path, index: pathIdx });
            };

            pathList.appendChild(pathItem);
        });

        // --- Affichage du chemin COUSIN (si présent, non sélectionnable) ---
        if (cousinPath) {
            const cousinItem = document.createElement('div');
            cousinItem.style.cssText = `
                padding: 10px; border: 1px dashed #ccc; border-radius: 5px;
                margin-top: 15px; background: #fdfdfd; cursor: default;
                opacity: 0.8;
            `;

            const container = document.createElement('div');
            container.style.fontSize = '11px';

            // On le compare éventuellement au dernier chemin de la liste pour la couleur
            const lastPathIds = paths.length > 0 ? paths[paths.length - 1].ancestorPath : null;
            renderPathContent(cousinPath, lastPathIds, '#666', container);

            cousinItem.innerHTML = `<div style="font-size: 11px; color: #bc8f8f; font-weight: bold; margin-bottom: 3px;">Chemin Cousin (Info)</div>`;
            cousinItem.appendChild(container);
            pathList.appendChild(cousinItem);
        }

        modal.appendChild(title);
        modal.appendChild(pathList);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        overlay.onclick = (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
                resolve(null);
            }
        };
    });
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