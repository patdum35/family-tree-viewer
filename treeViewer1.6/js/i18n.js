
// Créer un objet global immédiatement disponible
window.i18n = {
  // Langue actuelle
  currentLanguage: 'fr',
  
  // Dictionnaire complet avec toutes les clés
  translations: {
    'fr': {
      // Page password-form
      'motDePasse': 'Mot de passe',
      'visualiserArbre': 'Visualiser l\'arbre',
      
      // Modal GEDCOM
      'chargerGedcom': 'Charger un fichier GEDCOM',
      'afficherArbre': 'Afficher l\'arbre',
      'viderCache': 'Vider le cache',
      'activerLogs': 'Activer les logs de debug',
      
      // Contrôles de l'arbre
      'rootPersonSearch': '🔍racine',
      'nbreGene': 'nbre<br>géné',
      'choisirFichier': 'Choisir un fichier',
      'aucunFichier': 'Aucun fichier choisi',

    },
    'en': {
      // Page password-form
      'motDePasse': 'Password',
      'visualiserArbre': 'View family tree',
      
      // Modal GEDCOM
      'chargerGedcom': 'Load GEDCOM file',
      'afficherArbre': 'Show tree',
      'viderCache': 'Clear cache',
      'activerLogs': 'Enable debug logs',
      
      // Contrôles de l'arbre
      'rootPersonSearch': '🔍root',
      'nbreGene': 'gene.<br>count',
      'choisirFichier': 'Choose file',
      'aucunFichier': 'No file chosen',

    },
    'es': {
      // Page password-form
      'motDePasse': 'Contraseña',
      'visualiserArbre': 'Ver árbol genealógico',
      
      // Modal GEDCOM
      'chargerGedcom': 'Cargar archivo GEDCOM',
      'afficherArbre': 'Mostrar árbol',
      'viderCache': 'Limpiar caché',
      'activerLogs': 'Activar logs de depuración',
      
      // Contrôles de l'arbre
      'rootPersonSearch': '🔍raíz',
      'nbreGene': 'núm.<br>gene.',
      'choisirFichier': 'Seleccionar archivo',
      'aucunFichier': 'Ningún archivo seleccionado',

    },
    'hu': {
      // Page password-form
      'motDePasse': 'Jelszó',
      'visualiserArbre': 'Családfa megtekintése',
      
      // Modal GEDCOM
      'chargerGedcom': 'GEDCOM fájl betöltése',
      'afficherArbre': 'Fa megjelenítése',
      'viderCache': 'Gyorsítótár törlése',
      'activerLogs': 'Hibakeresési naplók engedélyezése',
      'choisirFichier': 'Fájl kiválasztása',
      'aucunFichier': 'Nincs kiválasztott fájl',
      
      // Contrôles de l'arbre
      'rootPersonSearch': '🔍gyökér',
      'nbreGene': 'gene.<br>szám'
    }
  },
  









  // Fonction de changement de langue
  changeLanguage: function(lang) {
    console.log("Changement de langue vers: " + lang);
    
    if (this.translations[lang]) {
      this.currentLanguage = lang;
      this.updateUI();
      
      // Mise à jour visuelle du sélecteur de langue
      document.querySelectorAll('.lang-flag').forEach(function(flag) {
        if (flag.getAttribute('data-lang') === lang) {
          flag.classList.add('active');
        } else {
          flag.classList.remove('active');
        }
      });


      // Mettre à jour les tooltip et toasts si la fonction de mainUI existe
      if (typeof window.applyTextDefinitions === 'function' && window.texts) {
        // Mettre à jour l'objet texts de mainUI avec les traductions actuelles
        updateMainUITexts();
        
        // Appliquer les traductions mises à jour
        window.applyTextDefinitions();
      }





      
      // Sauvegarder la préférence
      localStorage.setItem('preferredLanguage', lang);
      
      // Créer variable globale
      window.CURRENT_LANGUAGE = lang;
    }
  },
  
  // Fonction pour mettre à jour l'interface
  updateUI: function() {
    console.log("Mise à jour de l'interface en: " + this.currentLanguage);
    
    // Gérer les éléments avec data-text-key
    document.querySelectorAll('[data-text-key]').forEach(element => {
      const key = element.getAttribute('data-text-key');
      
      // Vérifier si la clé existe dans le dictionnaire
      if (this.translations[this.currentLanguage] && 
          this.translations[this.currentLanguage][key]) {
        
        // Traiter différemment selon le type d'élément
        if (element.tagName === 'INPUT') {
          console.log("Mise à jour du placeholder pour: " + key);
          element.placeholder = this.translations[this.currentLanguage][key];
        } else if (key === 'nbreGene') {
          // Cas spécial pour les éléments avec HTML (comme <br>)
          element.innerHTML = this.translations[this.currentLanguage][key];
        } else {
          console.log("Mise à jour du texte pour: " + key);
          element.textContent = this.translations[this.currentLanguage][key];
        }


        // Ajouter ceci pour mettre à jour les attributs title et data-action
        if (element.hasAttribute('title')) {
          element.setAttribute('title', this.translations[this.currentLanguage][key]);
        }
        if (element.hasAttribute('data-action')) {
          element.setAttribute('data-action', this.translations[this.currentLanguage][key]);
        }
      }
    });



  },
  
  // Obtenir la langue actuelle
  getCurrentLanguage: function() {
    return this.currentLanguage;
  },
  
  // Obtenir une traduction
  getText: function(key) {
    if (this.translations[this.currentLanguage] && 
        this.translations[this.currentLanguage][key]) {
      return this.translations[this.currentLanguage][key];
    }
    
    // Fallback au français
    if (this.translations['fr'] && this.translations['fr'][key]) {
      return this.translations['fr'][key];
    }
    
    return key;
  },
  
  // Initialiser
  init: function() {
    // Charger la langue préférée
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && this.translations[savedLang]) {
      this.currentLanguage = savedLang;
    }
    
    // Initialiser la variable globale
    window.CURRENT_LANGUAGE = this.currentLanguage;
    
    console.log("Initialisation avec la langue: " + this.currentLanguage);
    this.updateUI();
    
    // Mettre à jour l'apparence des drapeaux
    const currentLang = this.currentLanguage;
    document.querySelectorAll('.lang-flag').forEach(function(flag) {
      if (flag.getAttribute('data-lang') === currentLang) {
        flag.classList.add('active');
      } else {
        flag.classList.remove('active');
      }
    });

    // Mettre à jour les textes de mainUI si disponible
    if (window.texts && typeof window.applyTextDefinitions === 'function') {
      updateMainUITexts();
      window.applyTextDefinitions();
    }
  }
};




// Fonction pour mettre à jour l'objet texts de mainUI avec les traductions actuelles
function updateMainUITexts() {
  // S'assurer que l'objet texts existe
  if (!window.texts) {
    window.texts = {};
  }

  // Liste des clés utilisées dans mainUI.texts
  const mainUIKeys = [
    'zoomIn', 'zoomOut', 'resetZoom', 'toggleSpeech', 'toggleAnimationPause',
    'openSettingsModal', 'toggleFullScreen', 'processNamesCloudWithDate',
    'rootPersonSearch', 'rootPersonResults', 'updateGenerations', 'treeMode',
    'treeModeAncestors', 'treeModeDescendants', 'treeModeBoth', 'search', 'prenoms'
  ];

  // Mettre à jour l'objet texts avec les traductions actuelles
  mainUIKeys.forEach(key => {
    if (window.i18n.translations[window.i18n.currentLanguage] && 
        window.i18n.translations[window.i18n.currentLanguage][key]) {
      window.texts[key] = window.i18n.translations[window.i18n.currentLanguage][key];
    }
  });
}











// Initialiser quand la page est chargée
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM chargé, initialisation du système de langue");
  window.i18n.init();
});

// Surcharger la fonction openGedcomModal pour mettre à jour les traductions
// Attention, cette partie doit être exécutée APRÈS que openGedcomModal est définie
document.addEventListener('DOMContentLoaded', function() {
  if (typeof window.openGedcomModal === 'function') {
    const originalOpenGedcomModal = window.openGedcomModal;
    window.openGedcomModal = function() {
      // Appeler la fonction originale
      originalOpenGedcomModal();
      
      // Mettre à jour les traductions après un court délai
      setTimeout(function() {
        if (window.i18n) {
          window.i18n.updateUI();
        }
      }, 100);
    };
  } else {
    console.warn("La fonction openGedcomModal n'est pas encore définie");
  }
});

// Créer la variable globale directement
window.CURRENT_LANGUAGE = localStorage.getItem('preferredLanguage') || 'fr';