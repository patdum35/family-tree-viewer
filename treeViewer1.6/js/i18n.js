
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
      // 'viderCache': 'Vider le cache',
      'SWUpdate': 'Mise à jour du logiciel',
      'activerLogs': 'Activer les logs de debug',
      
      // Contrôles de l'arbre
      'rootPersonSearch': '🔍racine',
      'nbreGene': 'nbre<br>géné',
      'choisirFichier': 'Choisir un fichier',
      'aucunFichier': 'Aucun fichier choisi',
      'installerApp': '📱 Installer l\'application',
      'parametresDefaut': '🔄 Paramètres par défaut',
      'desinstallerApp': '🗑️ Désinstaller l\'application',
      'desinstallationInstructions': 'Pour désinstaller cette application :',
      'chromePCDesinstall': 'CHROME PC :\n\n1. Tapez "chrome://apps/" dans la barre d\'adresse\n2. Appuyez sur Entrée\n3. Trouvez "TreeViewer" ou "Genealogic Tree Viewer"\n4. Clic droit sur l\'application\n5. Sélectionnez "Supprimer de Chrome"\n\n✅ L\'application et son raccourci seront supprimés',
      'edgePCDesinstall': 'EDGE PC :\n\n1. Tapez "edge://apps/" dans la barre d\'adresse\n2. Appuyez sur Entrée\n3. Trouvez votre application\n4. Cliquez sur les 3 points (...)\n5. Sélectionnez "Désinstaller"\n\n✅ L\'application sera supprimée',
      'chromeMobileDesinstall': 'CHROME MOBILE :\n1. Maintenez appuyé sur l\'icône de l\'app\n2. Sélectionnez "Désinstaller" ou glissez vers "Supprimer"\n3. Confirmez la suppression',
      'safariMobileDesinstall': 'SAFARI MOBILE :\n1. Maintenez appuyé sur l\'icône de l\'app\n2. Appuyez sur le "X" qui apparaît\n3. Confirmez la suppression',
      'genericDesinstall': 'Cherchez dans les paramètres de votre navigateur la section "Applications" pour désinstaller',
      'desinstallationTitle': '🗑️ Désinstallation',
      'compris': 'Compris',     
    },
    'en': {
      // Page password-form
      'motDePasse': 'Password',
      'visualiserArbre': 'View family tree',
      
      // Modal GEDCOM
      'chargerGedcom': 'Load GEDCOM file',
      'afficherArbre': 'Show tree',
      // 'viderCache': 'Clear cache',
      'SWUpdate': 'SW update',
      'activerLogs': 'Enable debug logs',
      
      // Contrôles de l'arbre
      'rootPersonSearch': '🔍root',
      'nbreGene': 'gene.<br>count',
      'choisirFichier': 'Choose file',
      'aucunFichier': 'No file chosen',
      'installerApp': '📱 Install App',
      'parametresDefaut': '🔄 Default Settings',
      'desinstallerApp': '🗑️ Uninstall Application',
      'desinstallationInstructions': 'To uninstall this application:',
      'chromePCDesinstall': 'CHROME PC:\n\n1. Type "chrome://apps/" in the address bar\n2. Press Enter\n3. Find "TreeViewer" or "Genealogic Tree Viewer"\n4. Right-click on the application\n5. Select "Remove from Chrome"\n\n✅ The application and its shortcut will be removed',
      'edgePCDesinstall': 'EDGE PC:\n\n1. Type "edge://apps/" in the address bar\n2. Press Enter\n3. Find your application\n4. Click on the 3 dots (...)\n5. Select "Uninstall"\n\n✅ The application will be removed',
      'chromeMobileDesinstall': 'CHROME MOBILE:\n1. Long press on the app icon\n2. Select "Uninstall" or drag to "Remove"\n3. Confirm deletion',
      'safariMobileDesinstall': 'SAFARI MOBILE:\n1. Long press on the app icon\n2. Tap the "X" that appears\n3. Confirm deletion',
      'genericDesinstall': 'Look in your browser settings for the "Applications" section to uninstall',
      'desinstallationTitle': '🗑️ Uninstallation',
      'compris': 'Got it',

    },
    'es': {
      // Page password-form
      'motDePasse': 'Contraseña',
      'visualiserArbre': 'Ver árbol genealógico',
      
      // Modal GEDCOM
      'chargerGedcom': 'Cargar archivo GEDCOM',
      'afficherArbre': 'Mostrar árbol',
      // 'viderCache': 'Limpiar caché',
      'SWUpdate': 'Mantenimiento de software',
      'activerLogs': 'Activar logs de depuración',
      
      // Contrôles de l'arbre
      'rootPersonSearch': '🔍raíz',
      'nbreGene': 'núm.<br>gene.',
      'choisirFichier': 'Seleccionar archivo',
      'aucunFichier': 'Ningún archivo seleccionado',
      'installerApp': '📱 Instalar App',
      'parametresDefaut': '🔄 Configuración predeterminada',
      'desinstallerApp': '🗑️ Desinstalar Aplicación',
      'desinstallationInstructions': 'Para desinstalar esta aplicación:',
      'chromePCDesinstall': 'CHROME PC:\n\n1. Escriba "chrome://apps/" en la barra de direcciones\n2. Presione Enter\n3. Busque "TreeViewer" o "Genealogic Tree Viewer"\n4. Clic derecho en la aplicación\n5. Seleccione "Eliminar de Chrome"\n\n✅ La aplicación y su acceso directo serán eliminados',
      'edgePCDesinstall': 'EDGE PC:\n\n1. Escriba "edge://apps/" en la barra de direcciones\n2. Presione Enter\n3. Busque su aplicación\n4. Haga clic en los 3 puntos (...)\n5. Seleccione "Desinstalar"\n\n✅ La aplicación será eliminada',
      'chromeMobileDesinstall': 'CHROME MÓVIL:\n1. Mantenga presionado el icono de la app\n2. Seleccione "Desinstalar" o arrastre a "Eliminar"\n3. Confirme la eliminación',
      'safariMobileDesinstall': 'SAFARI MÓVIL:\n1. Mantenga presionado el icono de la app\n2. Toque la "X" que aparece\n3. Confirme la eliminación',
      'genericDesinstall': 'Busque en la configuración de su navegador la sección "Aplicaciones" para desinstalar',
      'desinstallationTitle': '🗑️ Desinstalación',
      'compris': 'Entendido',

    },
    'hu': {
      // Page password-form
      'motDePasse': 'Jelszó',
      'visualiserArbre': 'Családfa megtekintése',
      
      // Modal GEDCOM
      'chargerGedcom': 'GEDCOM fájl betöltése',
      'afficherArbre': 'Fa megjelenítése',
      // 'viderCache': 'Gyorsítótár törlése',
      'SWUpdate': 'Szoftverfrissítés',
      'activerLogs': 'Hibakeresési naplók engedélyezése',
      'choisirFichier': 'Fájl kiválasztása',
      'aucunFichier': 'Nincs kiválasztott fájl',
      
      // Contrôles de l'arbre
      'rootPersonSearch': '🔍gyökér',
      'nbreGene': 'gene.<br>szám',
      'installerApp': '📱 Alkalmazás telepítése',
      'parametresDefaut': '🔄 Alapértelmezett beállítások',
      'desinstallerApp': '🗑️ Alkalmazás eltávolítása',
      'desinstallationInstructions': 'Az alkalmazás eltávolításához:',
      'chromePCDesinstall': 'CHROME PC:\n\n1. Írja be a "chrome://apps/" címet a címsorba\n2. Nyomja meg az Enter billentyűt\n3. Keresse meg a "TreeViewer" vagy "Genealogic Tree Viewer" alkalmazást\n4. Kattintson jobb gombbal az alkalmazásra\n5. Válassza az "Eltávolítás a Chrome-ból" lehetőséget\n\n✅ Az alkalmazás és a parancsikonja el lesz távolítva',
      'edgePCDesinstall': 'EDGE PC:\n\n1. Írja be az "edge://apps/" címet a címsorba\n2. Nyomja meg az Enter billentyűt\n3. Keresse meg az alkalmazást\n4. Kattintson a 3 pontra (...)\n5. Válassza az "Eltávolítás" lehetőséget\n\n✅ Az alkalmazás el lesz távolítva',
      'chromeMobileDesinstall': 'CHROME MOBIL:\n1. Tartsa nyomva az alkalmazás ikonját\n2. Válassza az "Eltávolítás" lehetőséget\n3. Erősítse meg a törlést',
      'safariMobileDesinstall': 'SAFARI MOBIL:\n1. Tartsa nyomva az alkalmazás ikonját\n2. Érintse meg a megjelenő "X"-et\n3. Erősítse meg a törlést',
      'genericDesinstall': 'Keresse meg a böngésző beállításaiban az "Alkalmazások" részt az eltávolításhoz',
      'desinstallationTitle': '🗑️ Eltávolítás',
      'compris': 'Értem',
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


      window.location.reload();
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