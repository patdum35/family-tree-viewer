
// Créer un objet global immédiatement disponible
window.i18n = {
  // Langue actuelle
  currentLanguage: 'fr',
  
  // Dictionnaire complet avec toutes les clés
  translations: {
    'fr': {
      // Page password-form
      'motDePasse': 'Mot de passe 🔒',
      'visualiserArbre': 'Entrez', 
      'startTitle': 'explore tes origines...',
      'inputFormFirstName': 'prénom',
      'inputFormLastName': 'nom',
      'inputFormLastNameComment': 'nom (jeune fille)',
      
      // Modal GEDCOM
      'AdvancedUserMenu': 'Menu utilisateur avancé',
      'afficherArbre': 'Afficher l\'arbre',
      // 'viderCache': 'Vider le cache',
      'SWUpdate': '🆕📦 Mise à jour du logiciel',
      'activerLogs': '🐞 Activer les logs de debug',
      
      // Contrôles de l'arbre
      'rootPersonSearch': '🔍racine',
      'nbreGene': 'nbre<br>géné',
      'choisirFichier': 'Choisir un fichier',
      'fichierGedcom': 'optionnel: votre fichier GEDCOM',
      'aucunFichier': 'Aucun fichier choisi',
      'installerApp': '📱 Installer l\'application',
      'parametresDefaut': '🔄 Paramètres par défaut',
      'desinstallerApp': '🗑️ Désinstaller l\'application',
      'desinstallationInstructions': 'Pour désinstaller cette application :',
      'chromePCDesinstall': 'CHROME PC :\n\n1. Tapez "chrome://apps/" dans la barre d\'adresse\n2. Appuyez sur Entrée\n3. Trouvez "TreeViewer" ou "Genealogic Tree Viewer"\n4. Clic droit sur l\'application\n5. Sélectionnez "Supprimer de Chrome"\n ou\n1. appuyez sur le menu du navigateur (⋮) et chercher désinstaller \n\n✅ L\'application et son raccourci seront supprimés',
      'edgePCDesinstall': 'EDGE PC :\n\n1. Tapez "edge://apps/" dans la barre d\'adresse\n2. Appuyez sur Entrée\n3. Trouvez votre application\n4. Cliquez sur les 3 points (...)\n5. Sélectionnez "Désinstaller"\n\n✅ L\'application sera supprimée',
      'chromeMobileDesinstall': 'CHROME MOBILE :\n1. Maintenez appuyé sur l\'icône de l\'app\n2. Sélectionnez "Désinstaller" ou glissez vers "Supprimer"\n3. Confirmez la suppression',
      'safariMobileDesinstall': 'SAFARI MOBILE :\n1. Maintenez appuyé sur l\'icône de l\'app\n2. Appuyez sur le "X" qui apparaît\n3. Confirmez la suppression',
      'genericDesinstall': 'Cherchez dans les paramètres de votre navigateur la section "Applications" pour désinstaller',
      'desinstallationTitle': '🗑️ Désinstallation',
      'compris': 'Compris',
      'confirmResetSettings': 'Êtes-vous sûr de vouloir remettre tous les paramètres par défaut ?',
      'resetWillDo': 'Cela va',
      'deletePrefs': 'Supprimer vos préférences sauvegardées',
      'resetLang': 'Remettre la langue par défaut',
      'clearCustomSettings': 'Effacer les paramètres personnalisés',
      'cacheWillBeKept': 'Le cache des fichiers sera conservé',
      'resetSuccess': 'Paramètres remis par défaut avec succès !',
      'pageWillReload': 'La page va se recharger',
      'resetError': 'Erreur lors de la réinitialisation des paramètres.',
      'SWUpdate': '🆕📦 Mise à jour du logiciel',
      'parametresDefaut': '🔄 Paramètres par défaut',
      // 'noServerDetected': '⚠️ ATTENTION ⚠️\n\nAucun serveur n\'a été détecté. La mise à jour du logiciel est impossible.\n\nCette opération nécessite VS Code avec Live Server ou tablette Apple.',
      'noServerDetected': '⚠️ ATTENTION ⚠️\n\nAucun serveur local n\'a été détecté. La mise à jour du logiciel est impossible.\n\nPour le développement, veuillez utiliser VS Code avec Live Server.',
      'noServerDetected2': '⚠️ ATTENTION ⚠️\n\nPas de connexion Internet détectée.\n\nLa mise à jour nécessite une connexion pour télécharger les nouvelles ressources depuis GitHub.',
      'noServerDetected3': '⚠️ ATTENTION ⚠️\n\nLa mise à jour du logiciel n\'est pas possible dans cet environnement.',
      'iosInstallTitle': 'Installer l\'application',
      'iosInstallInstruction': 'Appuyez sur <span class="share-icon">📤</span> puis "Ajouter à l\'écran d\'accueil"',
      'iosDetailsBtn': 'Détails',
      'iosModalTitle': '📱 Installation sur iOS',
      'iosStepsTitle': '📋 Étapes détaillées :',
      'iosCloseBtn': 'Compris !',
      'iosStep1': '<strong>Ouvrez Safari</strong> (l\'installation ne fonctionne que dans Safari)',
      'iosStep2': '<strong>Appuyez sur l\'icône Partager</strong> 📤 en bas de l\'écran',
      'iosStep3': '<strong>Faites défiler</strong> et trouvez "Ajouter à l\'écran d\'accueil" ➕',
      'iosStep4': '<strong>Personnalisez le nom</strong> si souhaité',
      'iosStep5': '<strong>Appuyez sur "Ajouter"</strong> ✅',
      'puzzleMessage': 'optionnel:\nglissez la pièce vers le haut pour cacher la barre du navigateur !',
      'bravoPuzzleMessage': '🎉 Bravo ! La barre du navigateur est cachée',
      'higherPuzzleMessage': 'Glissez plus haut pour cacher la barre',
      'fullScreenLabel': 'plein écran',
      'normalScreenLabel': 'navigateur',
      'hideBrowserBarLabel': 'masquer la barre\ndu navigateur',
      'showBrowserBarLabel': 'garder\nla barre',
      'finalizeInstall': '⏳ Finalisation de l\'installation de l\'application...',
      'appFinalized' : '✅ **Installation finalisée !**',
      'newVersionAvailable': 'Une nouvelle version est disponible !',
      'updateNow': 'Mettre à jour',
      'waitForInstall': 'Veuillez attendre quelques secondes que l\'installation soit installée. Vous pouvez cliquer sur le bouton ci-dessous pour tenter le lancement.',
      'openApp'  : 'Ouvrir l\'application',
      'tryLaunching' : 'Tentative de lancement...',
      'launchFailed' :'❌ Lancement échoué. L\'application n\'est pas encore prête',
      'tryAgain' : 'Veuillez patienter quelques secondes de plus (finalisation ...) et **cliquer à nouveau**.',
      'ReOpen' : 'Réessayer d\'ouvrir l\'application',
      'appReady' : 'L\'application est prête ! Cliquez sur le bouton "Ouvrir" ci-dessous.',



    },
    'en': {
      // Page password-form
      'motDePasse': 'Password 🔒',
      'visualiserArbre': 'Enter', //'View family tree',
      'startTitle': 'explore your origins...',
      'inputFormFirstName': 'first name',
      'inputFormLastName': 'last name',
      'inputFormLastNameComment': 'last name (maiden)',      
      // Modal GEDCOM
      'AdvancedUserMenu': 'Advanced user menu',
      'afficherArbre': 'Show tree',
      // 'viderCache': 'Clear cache',
      'SWUpdate': '🆕📦 SW update',
      'activerLogs': '🐞 Enable debug logs',
      
      // Contrôles de l'arbre
      'rootPersonSearch': '🔍root',
      'nbreGene': 'gene.<br>count',
      'choisirFichier': 'Choose file',
      'fichierGedcom': 'optional: your GEDCOM file',
      'aucunFichier': 'No file chosen',
      'installerApp': '📱 Install App',
      'parametresDefaut': '🔄 Default Settings',
      'desinstallerApp': '🗑️ Uninstall Application',
      'desinstallationInstructions': 'To uninstall this application:',
      'chromePCDesinstall': 'CHROME PC:\n\n1. Type "chrome://apps/" in the address bar\n2. Press Enter\n3. Find "TreeViewer" or "Genealogic Tree Viewer"\n4. Right-click on the application\n5. Select "Remove from Chrome"\n or\n1. press the browser menu (⋮) and look for uninstall\n✅ The application and its shortcut will be removed',
      'edgePCDesinstall': 'EDGE PC:\n\n1. Type "edge://apps/" in the address bar\n2. Press Enter\n3. Find your application\n4. Click on the 3 dots (...)\n5. Select "Uninstall"\n\n✅ The application will be removed',
      'chromeMobileDesinstall': 'CHROME MOBILE:\n1. Long press on the app icon\n2. Select "Uninstall" or drag to "Remove"\n3. Confirm deletion',
      'safariMobileDesinstall': 'SAFARI MOBILE:\n1. Long press on the app icon\n2. Tap the "X" that appears\n3. Confirm deletion',
      'genericDesinstall': 'Look in your browser settings for the "Applications" section to uninstall',
      'desinstallationTitle': '🗑️ Uninstallation',
      'compris': 'Got it',
      'confirmResetSettings': 'Are you sure you want to reset all settings to default?',
      'resetWillDo': 'This will',
      'deletePrefs': 'Delete your saved preferences',
      'resetLang': 'Reset language to default',
      'clearCustomSettings': 'Clear custom settings',
      'cacheWillBeKept': 'File cache will be preserved',
      'resetSuccess': 'Settings reset successfully!',
      'pageWillReload': 'The page will reload',
      'resetError': 'Error while resetting settings.',
      'SWUpdate': '🆕📦 Software Update',
      'parametresDefaut': '🔄 Default Settings',
      'noServerDetected': '⚠️ WARNING ⚠️\n\nNo server detected. Software update is not possible.\n\nFor development purpose, this operation requires VS Code with Live Server.',
      'noServerDetected2': '⚠️ WARNING ⚠️\n\nNo Internet connection detected.\n\nThe update requires a connection to download new resources from GitHub.',
      'noServerDetected3': '⚠️ WARNING ⚠️\n\nSoftware update is not possible in this environment.',
      'iosInstallTitle': 'Install the app',
      'iosInstallInstruction': 'Tap <span class="share-icon">📤</span> then "Add to Home Screen"',
      'iosDetailsBtn': 'Details',
      'iosModalTitle': '📱 iOS Installation',
      'iosStepsTitle': '📋 Detailed steps:',
      'iosCloseBtn': 'Got it!',
      'iosStep1': '<strong>Open Safari</strong> (installation only works in Safari)',
      'iosStep2': '<strong>Tap the Share icon</strong> 📤 at the bottom of the screen',
      'iosStep3': '<strong>Scroll down</strong> and find "Add to Home Screen" ➕',
      'iosStep4': '<strong>Customize the name</strong> if desired',
      'iosStep5': '<strong>Tap "Add"</strong> ✅',
      'puzzleMessage': 'optional:\nSlide the piece up to hide the browser bar!',
      'bravoPuzzleMessage': '🎉 Well done! The browser bar is now hidden',
      'higherPuzzleMessage': 'Slide higher to hide the bar',
      'fullScreenLabel': 'full screen',
      'normalScreenLabel': 'browser',
      'hideBrowserBarLabel': 'hide \nbrowser bar',
      'showBrowserBarLabel': 'keep \nbrowser bar',
      'finalizeInstall': '⏳ Finalizing app installation...',
      'appFinalized' : '✅ **Installation finalized!**',
      'newVersionAvailable': 'A new version is available!',
      'updateNow': 'Update',
      'waitForInstall': 'Please wait a few seconds for the installation to finish. You may click the button below to attempt launching.',
      'openApp' : 'Open the app',
      'tryLaunching' : 'Attempting launch...',
      'launchFailed' :'❌ Launch failed. The app is not yet ready',
      'tryAgain' : 'Please wait a few more seconds (finalizing...) and **click again**.',
      'ReOpen' : 'Try opening the app again',
      'appReady' : 'The app is ready! Click the "Open" button below.',

    },
    'es': {
      // Page password-form
      'motDePasse': 'Contraseña 🔒',
      'visualiserArbre': 'Entrar', //'Ver árbol genealógico',
      'startTitle': 'explora tus orígenes...',
      'inputFormFirstName': 'nombre',
      'inputFormLastName': 'apellido',
      'inputFormLastNameComment': 'apellido (de soltera)',

      // Modal GEDCOM
      'AdvancedUserMenu': 'Menú de usuario avanzado',
      'afficherArbre': 'Mostrar árbol',
      // 'viderCache': 'Limpiar caché',
      'SWUpdate': 'Mantenimiento de software',
      'activerLogs': '🐞 Activar logs de depuración',
      
      // Contrôles de l'arbre
      'rootPersonSearch': '🔍raíz',
      'nbreGene': 'núm.<br>gene.',
      'choisirFichier': 'Seleccionar archivo',
      'fichierGedcom': 'opcional: Archivo GEDCOM',
      'aucunFichier': 'Ningún archivo seleccionado',
      'installerApp': '📱 Instalar App',
      'parametresDefaut': '🔄 Configuración predeterminada',
      'desinstallerApp': '🗑️ Desinstalar Aplicación',
      'desinstallationInstructions': 'Para desinstalar esta aplicación:',
      'chromePCDesinstall': 'CHROME PC:\n\n1. Escriba "chrome://apps/" en la barra de direcciones\n2. Presione Enter\n3. Busque "TreeViewer" o "Genealogic Tree Viewer"\n4. Clic derecho en la aplicación\n5. Seleccione "Eliminar de Chrome"\n o\n1. presione el menú del navegador (⋮) y busque desinstalar \n✅ La aplicación y su acceso directo serán eliminados',
      'edgePCDesinstall': 'EDGE PC:\n\n1. Escriba "edge://apps/" en la barra de direcciones\n2. Presione Enter\n3. Busque su aplicación\n4. Haga clic en los 3 puntos (...)\n5. Seleccione "Desinstalar"\n\n✅ La aplicación será eliminada',
      'chromeMobileDesinstall': 'CHROME MÓVIL:\n1. Mantenga presionado el icono de la app\n2. Seleccione "Desinstalar" o arrastre a "Eliminar"\n3. Confirme la eliminación',
      'safariMobileDesinstall': 'SAFARI MÓVIL:\n1. Mantenga presionado el icono de la app\n2. Toque la "X" que aparece\n3. Confirme la eliminación',
      'genericDesinstall': 'Busque en la configuración de su navegador la sección "Aplicaciones" para desinstalar',
      'desinstallationTitle': '🗑️ Desinstalación',
      'compris': 'Entendido',
      'confirmResetSettings': '¿Está seguro de que desea restablecer todos los ajustes por defecto?',
      'resetWillDo': 'Esto va a',
      'deletePrefs': 'Eliminar sus preferencias guardadas',
      'resetLang': 'Restablecer idioma por defecto',
      'clearCustomSettings': 'Borrar configuraciones personalizadas',
      'cacheWillBeKept': 'La caché de archivos se conservará',
      'resetSuccess': '¡Configuración restablecida con éxito!',
      'pageWillReload': 'La página se recargará',
      'resetError': 'Error al restablecer la configuración.',
      'SWUpdate': 'Actualización de Software',
      'parametresDefaut': '🔄 Configuración Predeterminada',
      'noServerDetected': '⚠️ ADVERTENCIA ⚠️\n\nNo se detectó ningún servidor. La actualización del software no es posible.\n\nPara desarrollo, esta operación requiere VS Code con Live Server.',
      'noServerDetected2': '⚠️ ADVERTENCIA ⚠️\n\nNo se detectó conexión a Internet.\n\nLa actualización requiere una conexión para descargar nuevos recursos desde GitHub.',
      'noServerDetected3': '⚠️ ADVERTENCIA ⚠️\n\nLa actualización del software no es posible en este entorno.',
      'iosInstallTitle': 'Instalar la aplicación',
      'iosInstallInstruction': 'Toca <span class="share-icon">📤</span> luego "Añadir a pantalla de inicio"',
      'iosDetailsBtn': 'Detalles',
      'iosModalTitle': '📱 Instalación en iOS',
      'iosStepsTitle': '📋 Pasos detallados:',
      'iosCloseBtn': '¡Entendido!',
      'iosStep1': '<strong>Abre Safari</strong> (la instalación solo funciona en Safari)',
      'iosStep2': '<strong>Toca el icono Compartir</strong> 📤 en la parte inferior de la pantalla',
      'iosStep3': '<strong>Desplázate hacia abajo</strong> y encuentra "Añadir a pantalla de inicio" ➕',
      'iosStep4': '<strong>Personaliza el nombre</strong> si lo deseas',
      'iosStep5': '<strong>Toca "Añadir"</strong> ✅',
      'puzzleMessage': 'opcional:\nDesliza la pieza hacia arriba para ocultar la barra del navegador!',
      'bravoPuzzleMessage': '🎉 ¡Enhorabuena! La barra del navegador está oculta',
      'higherPuzzleMessage': 'Desliza más arriba para ocultar la barra',
      'fullScreenLabel': 'pantalla completa',
      'normalScreenLabel': 'navegador',
      'hideBrowserBarLabel': 'ocultar la barra\n del navegador',
      'showBrowserBarLabel': 'mantener \nla barra',      
      'finalizeInstall': '⏳ Finalizando la instalación de la aplicación...',
      'appFinalized' : '✅ **¡Instalación finalizada!**',
      'newVersionAvailable': '¡Una nueva versión está disponible!',
      'updateNow': 'Actualizar',
      'waitForInstall': 'Espere unos segundos a que finalice la instalación. Puede hacer clic en el botón de abajo para intentar iniciarla.',
      'openApp' : 'Abrir la aplicación',
      'tryLaunching' : 'Intentando iniciar...',
      'launchFailed' :'❌ Error al iniciar. La aplicación aún no está lista',
      'tryAgain' : 'Espere unos segundos más (finalizando...) y **vuelva a hacer clic**.',
      'ReOpen' : 'Intentar abrir la aplicación de nuevo',
      'appReady' : '¡La aplicación está lista! Haga clic en el botón "Abrir" a continuación.',

    },
    'hu': {
      // Page password-form
      'motDePasse': 'Jelszó 🔒',
      'visualiserArbre': 'Belépés', //'Családfa megtekintése',
      'startTitle': 'fedezd fel az eredeted...',
      'inputFormFirstName': 'keresztnév',
      'inputFormLastName': 'vezetéknév',
      'inputFormLastNameComment': 'vezetéknév (leánykori)',  

      // Modal GEDCOM
      'AdvancedUserMenu': 'Haladó felhasználói menü',
      'afficherArbre': 'Fa megjelenítése',
      // 'viderCache': 'Gyorsítótár törlése',
      'SWUpdate': 'Szoftverfrissítés',
      'activerLogs': '🐞 Hibakeresési naplók engedélyezése',
      'choisirFichier': 'Fájl kiválasztása',
      'fichierGedcom': 'opcionális: GEDCOM fájl',
      'aucunFichier': 'Nincs kiválasztott fájl',
      
      // Contrôles de l'arbre
      'rootPersonSearch': '🔍gyökér',
      'nbreGene': 'gene.<br>szám',
      'installerApp': '📱 Alkalmazás telepítése',
      'parametresDefaut': '🔄 Alapértelmezett beállítások',
      'desinstallerApp': '🗑️ Alkalmazás eltávolítása',
      'desinstallationInstructions': 'Az alkalmazás eltávolításához:',
      'chromePCDesinstall': 'CHROME PC:\n\n1. Írja be a "chrome://apps/" címet a címsorba\n2. Nyomja meg az Enter billentyűt\n3. Keresse meg a "TreeViewer" vagy "Genealogic Tree Viewer" alkalmazást\n4. Kattintson jobb gombbal az alkalmazásra\n5. Válassza az "Eltávolítás a Chrome-ból" lehetőséget\n vagy\n1. nyomja meg a böngésző menüt (⋮), és keresse meg a törlést \n✅ Az alkalmazás és a parancsikonja el lesz távolítva',
      'edgePCDesinstall': 'EDGE PC:\n\n1. Írja be az "edge://apps/" címet a címsorba\n2. Nyomja meg az Enter billentyűt\n3. Keresse meg az alkalmazást\n4. Kattintson a 3 pontra (...)\n5. Válassza az "Eltávolítás" lehetőséget\n\n✅ Az alkalmazás el lesz távolítva',
      'chromeMobileDesinstall': 'CHROME MOBIL:\n1. Tartsa nyomva az alkalmazás ikonját\n2. Válassza az "Eltávolítás" lehetőséget\n3. Erősítse meg a törlést',
      'safariMobileDesinstall': 'SAFARI MOBIL:\n1. Tartsa nyomva az alkalmazás ikonját\n2. Érintse meg a megjelenő "X"-et\n3. Erősítse meg a törlést',
      'genericDesinstall': 'Keresse meg a böngésző beállításaiban az "Alkalmazások" részt az eltávolításhoz',
      'desinstallationTitle': '🗑️ Eltávolítás',
      'compris': 'Értem',
      'confirmResetSettings': 'Biztosan vissza akarja állítani az összes beállítást az alapértelmezettre?',
      'resetWillDo': 'Ez fogja',
      'deletePrefs': 'Törli a mentett beállításait',
      'resetLang': 'Alapértelmezett nyelvre állítja',
      'clearCustomSettings': 'Törli az egyéni beállításokat',
      'cacheWillBeKept': 'A fájl gyorsítótár megmarad',
      'resetSuccess': 'Beállítások sikeresen visszaállítva!',
      'pageWillReload': 'Az oldal újra fog töltődni',
      'resetError': 'Hiba a beállítások visszaállításakor.',
      'SWUpdate': 'Szoftver Frissítés',
      'parametresDefaut': '🔄 Alapértelmezett Beállítások',
      'noServerDetected': '⚠️ FIGYELEM ⚠️\n\nNem észlelhető szerver. A szoftverfrissítés nem lehetséges.\n\nEhhez a művelethez VS Code szükséges Live Server kiegészítővel.',
      'noServerDetected2': '⚠️ FIGYELEM ⚠️\n\nNincs internetkapcsolat.\n\nA frissítéshez kapcsolat szükséges az új erőforrások GitHub-ról történő letöltéséhez.',
      'noServerDetected3': '⚠️ FIGYELEM ⚠️\n\nA szoftverfrissítés nem lehetséges ebben a környezetben.',
      'iosInstallTitle': 'Alkalmazás telepítése',
      'iosInstallInstruction': 'Érintse meg a <span class="share-icon">📤</span> majd "Hozzáadás a kezdőképernyőhöz"',
      'iosDetailsBtn': 'Részletek',
      'iosModalTitle': '📱 iOS telepítés',
      'iosStepsTitle': '📋 Részletes lépések:',
      'iosCloseBtn': 'Értem!',
      'iosStep1': '<strong>Nyissa meg a Safarit</strong> (a telepítés csak Safariban működik)',
      'iosStep2': '<strong>Érintse meg a Megosztás ikont</strong> 📤 a képernyő alján',
      'iosStep3': '<strong>Görgessen le</strong> és keresse meg a "Hozzáadás a kezdőképernyőhöz" ➕',
      'iosStep4': '<strong>Személyre szabhatja a nevet</strong> ha szeretné',
      'iosStep5': '<strong>Érintse meg a "Hozzáadás" gombot</strong> ✅',
      'puzzleMessage': 'opcionális:\nHúzd feljebb a darabot a böngészősáv elrejtéséhez!',
      'bravoPuzzleMessage': '🎉 Szuper! A böngészősáv el van rejtve',
      'higherPuzzleMessage': 'Húzd feljebb a darabot a sáv elrejtéséhez',
      'fullScreenLabel': 'teljes képernyő',
      'normalScreenLabel': 'böngésző',
      'hideBrowserBarLabel': 'böngészősáv \nelrejtése',
      'showBrowserBarLabel': 'böngészősáv \nmegtartása',
      'finalizeInstall': '⏳ Alkalmazás telepítésének véglegesítése...',
      'appFinalized' : '✅ **Telepítés befejezve!**',
      'newVersionAvailable': 'Új verzió érhető el!',
      'updateNow': 'Frissítés',
      'waitForInstall': 'Várjon néhány másodpercet a telepítés befejezéséig. Az indításhoz kattintson az alábbi gombra.',
      'openApp' : 'Alkalmazás megnyitása',
      'tryLaunching' : 'Indítási kísérlet folyamatban...',
      'launchFailed' :'❌ Indítás sikertelen. Az alkalmazás még nem áll készen',
      'tryAgain' : 'Várjon még néhány másodpercet (véglegesítés...) és **kattintson újra**.',
      'ReOpen' : 'Újrapróbálkozás az alkalmazás megnyitásával',
      'appReady' : 'Az alkalmazás készen áll! Kattintson az alábbi "Megnyitás" gombra.',

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

      sessionStorage.setItem('restartVoiceSelect', '1');
      // window.location.reload();
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
          // console.log("Mise à jour du placeholder pour: " + key);
          element.placeholder = this.translations[this.currentLanguage][key];
        } else if (key === 'nbreGene') {
          // Cas spécial pour les éléments avec HTML (comme <br>)
          element.innerHTML = this.translations[this.currentLanguage][key];
        } else {
          // console.log("Mise à jour du texte pour: " + key);
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
  getMultilingueText: function(key) {
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
    'openSettingsModal', 'toggleFullScreen', 'processNamesCloudWithDate', 'radar',
    'rootPersonSearch', 'rootPersonResults', 'updateGenerations', 'treeMode',
    'treeModeAncestors', 'treeModeDescendants', 'treeModeBoth', 'search', 'prenoms', 
    'puzzleMessage'
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