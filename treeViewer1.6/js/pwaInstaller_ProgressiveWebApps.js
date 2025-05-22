// // Gestionnaire d'installation PWA

// class PWAInstaller {
//     constructor() {
//         this.deferredPrompt = null;
//         this.installButton = null;
//         this.isInitialized = false;
        
//         // Initialiser quand le DOM est prêt
//         if (document.readyState === 'loading') {
//             document.addEventListener('DOMContentLoaded', () => this.init());
//         } else {
//             this.init();
//         }
//     }

//     init() {
//         if (this.isInitialized) return;
        
//         console.log('[PWA Installer] Initialisation...');
        
//         // Écouter l'événement d'installation
//         this.setupInstallPromptListener();
        
//         // Écouter l'événement d'installation réussie
//         this.setupInstallSuccessListener();
        
//         // Créer le bouton d'installation
//         this.createInstallButton();
        
//         // Vérifier si on peut déjà afficher le bouton
//         this.checkInstallAvailability();
        
//         this.isInitialized = true;
//         console.log('[PWA Installer] Initialisé avec succès');
//     }

//     setupInstallPromptListener() {
//         window.addEventListener('beforeinstallprompt', (e) => {
//             console.log('[PWA Installer] beforeinstallprompt déclenché');
            
//             // Empêcher l'affichage automatique
//             e.preventDefault();
            
//             // Stocker l'événement
//             this.deferredPrompt = e;
            
//             // Afficher le bouton
//             this.showInstallButton();
//         });
//     }

//     setupInstallSuccessListener() {
//         window.addEventListener('appinstalled', (evt) => {
//             console.log('[PWA Installer] Application installée avec succès');
//             this.hideInstallButton();
//             this.deferredPrompt = null;
//         });
//     }

//     createInstallButton() {
//         // Vérifier si le bouton existe déjà
//         if (this.installButton) return;

//         // Trouver le conteneur dans la modal gedcom
//         const modalContent = document.querySelector('#gedcom-modal div[style*="padding: 20px"]');
//         if (!modalContent) {
//             console.warn('[PWA Installer] Conteneur de modal non trouvé, tentative différée...');
//             // Réessayer plus tard
//             setTimeout(() => this.createInstallButton(), 1000);
//             return;
//         }

//         // Créer le bouton d'installation
//         this.installButton = document.createElement('button');
//         this.installButton.id = 'install-app-btn';
//         this.installButton.innerHTML = '📱 Installer l\'application';
//         this.installButton.style.cssText = `
//             background-color: #ff8c42; 
//             color: white; 
//             border: none; 
//             padding: 10px; 
//             width: 100%; 
//             max-width: 240px; 
//             border-radius: 4px; 
//             cursor: pointer; 
//             font-weight: bold; 
//             margin: 0 auto 10px auto;
//             display: none;
//             box-sizing: border-box;
//         `;
        
//         // Ajouter l'attribut pour la traduction
//         this.installButton.setAttribute('data-text-key', 'installerApp');
        
//         // Ajouter l'événement click
//         this.installButton.addEventListener('click', () => this.installApp());
        
//         // Insérer le bouton avant le bouton "Activer les logs"
//         const debugBtn = document.getElementById('activateDebugLogsBtn');
//         if (debugBtn) {
//             debugBtn.parentNode.insertBefore(this.installButton, debugBtn);
//         } else {
//             // Fallback : ajouter à la fin du conteneur
//             modalContent.appendChild(this.installButton);
//         }
        
//         console.log('[PWA Installer] Bouton d\'installation créé');
//     }

//     showInstallButton() {
//         if (this.installButton) {
//             this.installButton.style.display = 'block';
//             console.log('[PWA Installer] Bouton d\'installation affiché');
//         }
//     }

//     hideInstallButton() {
//         if (this.installButton) {
//             this.installButton.style.display = 'none';
//             console.log('[PWA Installer] Bouton d\'installation masqué');
//         }
//     }

//     async installApp() {
//         console.log('[PWA Installer] Tentative d\'installation...');
        
//         if (this.deferredPrompt) {
//             try {
//                 // Afficher la popup d'installation
//                 this.deferredPrompt.prompt();
                
//                 // Attendre le choix de l'utilisateur
//                 const choiceResult = await this.deferredPrompt.userChoice;
                
//                 if (choiceResult.outcome === 'accepted') {
//                     console.log('[PWA Installer] Installation acceptée par l\'utilisateur');
//                     this.hideInstallButton();
//                 } else {
//                     console.log('[PWA Installer] Installation refusée par l\'utilisateur');
//                 }
                
//                 this.deferredPrompt = null;
//             } catch (error) {
//                 console.error('[PWA Installer] Erreur lors de l\'installation:', error);
//                 this.showManualInstallInstructions();
//             }
//         } else {
//             // Pas d'événement beforeinstallprompt disponible
//             this.showManualInstallInstructions();
//         }
//     }

//     showManualInstallInstructions() {
//         const userAgent = navigator.userAgent.toLowerCase();
//         let instructions = 'Pour installer cette application :\n\n';
        
//         if (userAgent.includes('chrome') && userAgent.includes('mobile')) {
//             instructions += '1. Appuyez sur le menu du navigateur (⋮)\n' +
//                           '2. Sélectionnez "Ajouter à l\'écran d\'accueil"\n' +
//                           '3. Confirmez l\'installation';
//         } else if (userAgent.includes('safari') && userAgent.includes('mobile')) {
//             instructions += '1. Appuyez sur le bouton Partager\n' +
//                           '2. Sélectionnez "Sur l\'écran d\'accueil"\n' +
//                           '3. Confirmez l\'ajout';
//         } else if (userAgent.includes('edge')) {
//             instructions += '1. Appuyez sur le menu (⋯)\n' +
//                           '2. Sélectionnez "Applications"\n' +
//                           '3. Choisissez "Installer cette application"';
//         } else {
//             instructions += '1. Cherchez l\'option "Ajouter à l\'écran d\'accueil"\n' +
//                           '   ou "Installer l\'application" dans le menu\n' +
//                           '2. Confirmez l\'installation';
//         }
        
//         // Utiliser une modal plus jolie au lieu d'alert
//         this.showInstallModal(instructions);
//     }

//     showInstallModal(instructions) {
//         // Créer une modal temporaire pour les instructions
//         const modal = document.createElement('div');
//         modal.style.cssText = `
//             position: fixed;
//             top: 0;
//             left: 0;
//             width: 100%;
//             height: 100%;
//             background-color: rgba(0,0,0,0.5);
//             z-index: 2000;
//             display: flex;
//             justify-content: center;
//             align-items: center;
//         `;
        
//         const modalContent = document.createElement('div');
//         modalContent.style.cssText = `
//             background-color: white;
//             padding: 20px;
//             border-radius: 10px;
//             max-width: 90%;
//             width: 300px;
//             box-shadow: 0 4px 6px rgba(0,0,0,0.1);
//             text-align: center;
//         `;
        
//         modalContent.innerHTML = `
//             <h3 style="margin-top: 0; color: #ff8c42;">📱 Installation manuelle</h3>
//             <p style="white-space: pre-line; text-align: left; line-height: 1.4; margin: 15px 0;">${instructions}</p>
//             <button id="close-install-modal" style="
//                 background-color: #ff8c42;
//                 color: white;
//                 border: none;
//                 padding: 10px 20px;
//                 border-radius: 4px;
//                 cursor: pointer;
//                 font-weight: bold;
//                 margin-top: 10px;
//             ">Compris</button>
//         `;
        
//         modal.appendChild(modalContent);
//         document.body.appendChild(modal);
        
//         // Fermer la modal
//         const closeBtn = modal.querySelector('#close-install-modal');
//         const closeModal = () => {
//             document.body.removeChild(modal);
//         };
        
//         closeBtn.addEventListener('click', closeModal);
//         modal.addEventListener('click', (e) => {
//             if (e.target === modal) closeModal();
//         });
        
//         // Auto-fermeture après 10 secondes
//         setTimeout(closeModal, 10000);
//     }

//     isAppInstalled() {
//         // Vérifier si l'app est lancée en mode standalone
//         return window.matchMedia('(display-mode: standalone)').matches ||
//                window.navigator.standalone === true;
//     }

//     checkInstallAvailability() {
//         // Si l'app est déjà installée, pas besoin du bouton
//         if (this.isAppInstalled()) {
//             console.log('[PWA Installer] Application déjà installée');
//             return;
//         }

//         // Sur certains navigateurs, l'événement beforeinstallprompt ne se déclenche pas
//         // Dans ce cas, on affiche le bouton avec des instructions manuelles après un délai
//         setTimeout(() => {
//             if (!this.deferredPrompt && this.installButton && !this.isAppInstalled()) {
//                 this.installButton.style.display = 'block';
//                 this.installButton.innerHTML = '📱 Installer (manuel)';
//                 console.log('[PWA Installer] Bouton manuel affiché (pas d\'événement beforeinstallprompt)');
//             }
//         }, 3000);
//     }

//     // Méthode publique pour afficher les instructions manuelles (utile pour debug/test)
//     showManualInstructions() {
//         this.showManualInstallInstructions();
//     }

//     // Méthode publique pour vérifier l'état
//     getStatus() {
//         return {
//             isInitialized: this.isInitialized,
//             hasPrompt: !!this.deferredPrompt,
//             isInstalled: this.isAppInstalled(),
//             buttonVisible: this.installButton ? this.installButton.style.display !== 'none' : false
//         };
//     }
// }

// // Créer une instance globale
// window.pwaInstaller = new PWAInstaller();

// // Exposer quelques méthodes utiles pour le debug
// window.forceInstallPrompt = () => window.pwaInstaller.forceShowInstallButton();
// window.getPWAStatus = () => window.pwaInstaller.getStatus();
// window.showInstallInstructions = () => window.pwaInstaller.showManualInstructions();

// // Méthode publique pour forcer l'affichage (utile pour le debug)
// PWAInstaller.prototype.forceShowInstallButton = function() {
//     if (!this.installButton) {
//         this.createInstallButton();
//     }
    
//     if (this.installButton) {
//         this.installButton.style.display = 'block';
//         console.log('[PWA Installer] Bouton d\'installation forcé');
//     }
// };

// // Export pour les modules (optionnel)
// if (typeof module !== 'undefined' && module.exports) {
//     module.exports = PWAInstaller;
// }


























// // js/pwaInstaller.js
// // Gestionnaire d'installation PWA

// class PWAInstaller {
//     constructor() {
//         this.deferredPrompt = null;
//         this.installButton = null;
//         this.isInitialized = false;
        
//         // Initialiser quand le DOM est prêt
//         if (document.readyState === 'loading') {
//             document.addEventListener('DOMContentLoaded', () => this.init());
//         } else {
//             this.init();
//         }
//     }

//     init() {
//         if (this.isInitialized) return;
        
//         console.log('[PWA Installer] Initialisation...');
        
//         // Écouter l'événement d'installation
//         this.setupInstallPromptListener();
        
//         // Écouter l'événement d'installation réussie
//         this.setupInstallSuccessListener();
        
//         // Créer le bouton d'installation
//         this.createInstallButton();
        
//         // Vérifier si on peut déjà afficher le bouton
//         this.checkInstallAvailability();
        
//         this.isInitialized = true;
//         console.log('[PWA Installer] Initialisé avec succès');
//     }

//     setupInstallPromptListener() {
//         window.addEventListener('beforeinstallprompt', (e) => {
//             console.log('[PWA Installer] beforeinstallprompt déclenché');
            
//             // Empêcher l'affichage automatique
//             e.preventDefault();
            
//             // Stocker l'événement
//             this.deferredPrompt = e;
            
//             // Afficher le bouton
//             this.showInstallButton();
//         });
//     }

//     setupInstallSuccessListener() {
//         window.addEventListener('appinstalled', (evt) => {
//             console.log('[PWA Installer] Application installée avec succès');
//             this.updateButtonForInstalledState();
//             this.deferredPrompt = null;
//         });
//     }

//     createInstallButton() {
//         // Vérifier si le bouton existe déjà
//         if (this.installButton) return;

//         // Trouver le conteneur dans la modal gedcom
//         const modalContent = document.querySelector('#gedcom-modal div[style*="padding: 20px"]');
//         if (!modalContent) {
//             console.warn('[PWA Installer] Conteneur de modal non trouvé, tentative différée...');
//             // Réessayer plus tard
//             setTimeout(() => this.createInstallButton(), 1000);
//             return;
//         }

//         // Créer le bouton d'installation
//         this.installButton = document.createElement('button');
//         this.installButton.id = 'install-app-btn';
//         this.updateButtonContent();
//         this.installButton.style.cssText = `
//             background-color: #ff8c42; 
//             color: white; 
//             border: none; 
//             padding: 10px; 
//             width: 100%; 
//             max-width: 240px; 
//             border-radius: 4px; 
//             cursor: pointer; 
//             font-weight: bold; 
//             margin: 0 auto 10px auto;
//             display: none;
//             box-sizing: border-box;
//         `;
        
//         // Ajouter l'événement click
//         this.installButton.addEventListener('click', () => {
//             if (this.isAppInstalled()) {
//                 this.uninstallApp();
//             } else {
//                 this.installApp();
//             }
//         });
        
//         // Insérer le bouton avant le bouton "Activer les logs"
//         const debugBtn = document.getElementById('activateDebugLogsBtn');
//         if (debugBtn) {
//             debugBtn.parentNode.insertBefore(this.installButton, debugBtn);
//         } else {
//             // Fallback : ajouter à la fin du conteneur
//             modalContent.appendChild(this.installButton);
//         }
        
//         console.log('[PWA Installer] Bouton d\'installation/désinstallation créé');
//     }

//     updateButtonContent() {
//         if (!this.installButton) return;
        
//         if (this.isAppInstalled()) {
//             this.installButton.innerHTML = '📱 Désinstaller l\'application';
//             this.installButton.setAttribute('data-text-key', 'desinstallerApp');
//         } else {
//             this.installButton.innerHTML = '📱 Installer l\'application';
//             this.installButton.setAttribute('data-text-key', 'installerApp');
//         }
//     }

//     updateButtonForInstalledState() {
//         this.updateButtonContent();
//         if (this.installButton) {
//             this.installButton.style.display = 'block';
//         }
//     }

//     showInstallButton() {
//         if (this.installButton) {
//             this.installButton.style.display = 'block';
//             this.updateButtonContent();
//             console.log('[PWA Installer] Bouton d\'installation affiché');
//         }
//     }

//     hideInstallButton() {
//         if (this.installButton) {
//             this.installButton.style.display = 'none';
//             console.log('[PWA Installer] Bouton d\'installation masqué');
//         }
//     }

//     async installApp() {
//         console.log('[PWA Installer] Tentative d\'installation...');
        
//         if (this.deferredPrompt) {
//             try {
//                 // Afficher la popup d'installation
//                 this.deferredPrompt.prompt();
                
//                 // Attendre le choix de l'utilisateur
//                 const choiceResult = await this.deferredPrompt.userChoice;
                
//                 if (choiceResult.outcome === 'accepted') {
//                     console.log('[PWA Installer] Installation acceptée par l\'utilisateur');
//                     // Le bouton sera mis à jour par l'événement 'appinstalled'
//                 } else {
//                     console.log('[PWA Installer] Installation refusée par l\'utilisateur');
//                 }
                
//                 this.deferredPrompt = null;
//             } catch (error) {
//                 console.error('[PWA Installer] Erreur lors de l\'installation:', error);
//                 this.showManualInstallInstructions();
//             }
//         } else {
//             // Pas d'événement beforeinstallprompt disponible
//             this.showManualInstallInstructions();
//         }
//     }

//     async uninstallApp() {
//         console.log('[PWA Installer] Tentative de désinstallation...');
        
//         // Instructions de désinstallation
//         const userAgent = navigator.userAgent.toLowerCase();
//         let instructions = 'Pour désinstaller cette application :\n\n';
        
//         if (userAgent.includes('chrome') && userAgent.includes('mobile')) {
//             instructions += '1. Maintenez appuyé sur l\'icône de l\'app\n' +
//                           '2. Sélectionnez "Désinstaller" ou glissez vers "Supprimer"\n' +
//                           '3. Confirmez la suppression';
//         } else if (userAgent.includes('safari') && userAgent.includes('mobile')) {
//             instructions += '1. Maintenez appuyé sur l\'icône de l\'app\n' +
//                           '2. Appuyez sur le "X" qui apparaît\n' +
//                           '3. Confirmez la suppression';
//         } else {
//             instructions += '1. Maintenez appuyé sur l\'icône de l\'application\n' +
//                           '2. Sélectionnez "Désinstaller" ou "Supprimer"\n' +
//                           '3. Confirmez la suppression\n\n' +
//                           'Ou allez dans les paramètres du navigateur :\n' +
//                           '• Applications installées\n' +
//                           '• Trouvez cette app et désinstallez-la';
//         }
        
//         this.showUninstallModal(instructions);
//     }

//     showManualInstallInstructions() {
//         const userAgent = navigator.userAgent.toLowerCase();
//         let instructions = 'Pour installer cette application :\n\n';
        
//         if (userAgent.includes('chrome') && userAgent.includes('mobile')) {
//             instructions += '1. Appuyez sur le menu du navigateur (⋮)\n' +
//                           '2. Sélectionnez "Ajouter à l\'écran d\'accueil"\n' +
//                           '3. Confirmez l\'installation';
//         } else if (userAgent.includes('safari') && userAgent.includes('mobile')) {
//             instructions += '1. Appuyez sur le bouton Partager\n' +
//                           '2. Sélectionnez "Sur l\'écran d\'accueil"\n' +
//                           '3. Confirmez l\'ajout';
//         } else if (userAgent.includes('edge')) {
//             instructions += '1. Appuyez sur le menu (⋯)\n' +
//                           '2. Sélectionnez "Applications"\n' +
//                           '3. Choisissez "Installer cette application"';
//         } else {
//             instructions += '1. Cherchez l\'option "Ajouter à l\'écran d\'accueil"\n' +
//                           '   ou "Installer l\'application" dans le menu\n' +
//                           '2. Confirmez l\'installation';
//         }
        
//         // Utiliser une modal plus jolie au lieu d'alert
//         this.showInstallModal(instructions);
//     }

//     showInstallModal(instructions) {
//         // Créer une modal temporaire pour les instructions
//         const modal = document.createElement('div');
//         modal.style.cssText = `
//             position: fixed;
//             top: 0;
//             left: 0;
//             width: 100%;
//             height: 100%;
//             background-color: rgba(0,0,0,0.5);
//             z-index: 2000;
//             display: flex;
//             justify-content: center;
//             align-items: center;
//         `;
        
//         const modalContent = document.createElement('div');
//         modalContent.style.cssText = `
//             background-color: white;
//             padding: 20px;
//             border-radius: 10px;
//             max-width: 90%;
//             width: 300px;
//             box-shadow: 0 4px 6px rgba(0,0,0,0.1);
//             text-align: center;
//         `;
        
//         modalContent.innerHTML = `
//             <h3 style="margin-top: 0; color: #ff8c42;">📱 Installation manuelle</h3>
//             <p style="white-space: pre-line; text-align: left; line-height: 1.4; margin: 15px 0;">${instructions}</p>
//             <button id="close-install-modal" style="
//                 background-color: #ff8c42;
//                 color: white;
//                 border: none;
//                 padding: 10px 20px;
//                 border-radius: 4px;
//                 cursor: pointer;
//                 font-weight: bold;
//                 margin-top: 10px;
//             ">Compris</button>
//         `;
        
//         modal.appendChild(modalContent);
//         document.body.appendChild(modal);
        
//         // Fermer la modal
//         const closeBtn = modal.querySelector('#close-install-modal');
//         const closeModal = () => {
//             document.body.removeChild(modal);
//         };
        
//         closeBtn.addEventListener('click', closeModal);
//         modal.addEventListener('click', (e) => {
//             if (e.target === modal) closeModal();
//         });
        
//         // Auto-fermeture après 10 secondes
//         setTimeout(closeModal, 10000);
//     }

//     showUninstallModal(instructions) {
//         // Créer une modal pour les instructions de désinstallation
//         const modal = document.createElement('div');
//         modal.style.cssText = `
//             position: fixed;
//             top: 0;
//             left: 0;
//             width: 100%;
//             height: 100%;
//             background-color: rgba(0,0,0,0.5);
//             z-index: 2000;
//             display: flex;
//             justify-content: center;
//             align-items: center;
//         `;
        
//         const modalContent = document.createElement('div');
//         modalContent.style.cssText = `
//             background-color: white;
//             padding: 20px;
//             border-radius: 10px;
//             max-width: 90%;
//             width: 300px;
//             box-shadow: 0 4px 6px rgba(0,0,0,0.1);
//             text-align: center;
//         `;
        
//         modalContent.innerHTML = `
//             <h3 style="margin-top: 0; color: #ff4444;">🗑️ Désinstallation</h3>
//             <p style="white-space: pre-line; text-align: left; line-height: 1.4; margin: 15px 0;">${instructions}</p>
//             <button id="close-uninstall-modal" style="
//                 background-color: #ff4444;
//                 color: white;
//                 border: none;
//                 padding: 10px 20px;
//                 border-radius: 4px;
//                 cursor: pointer;
//                 font-weight: bold;
//                 margin-top: 10px;
//             ">Compris</button>
//         `;
        
//         modal.appendChild(modalContent);
//         document.body.appendChild(modal);
        
//         // Fermer la modal
//         const closeBtn = modal.querySelector('#close-uninstall-modal');
//         const closeModal = () => {
//             document.body.removeChild(modal);
//             // Après fermeture, remettre le bouton en mode installation si pas installé
//             setTimeout(() => {
//                 if (!this.isAppInstalled()) {
//                     this.updateButtonContent();
//                 }
//             }, 1000);
//         };
        
//         closeBtn.addEventListener('click', closeModal);
//         modal.addEventListener('click', (e) => {
//             if (e.target === modal) closeModal();
//         });
        
//         // Auto-fermeture après 15 secondes
//         setTimeout(closeModal, 15000);
//     }

//     isAppInstalled() {
//         // Vérifier si l'app est lancée en mode standalone
//         return window.matchMedia('(display-mode: standalone)').matches ||
//                window.navigator.standalone === true;
//     }

//     checkInstallAvailability() {
//         // Mettre à jour le contenu du bouton selon l'état
//         this.updateButtonContent();
        
//         // Toujours afficher le bouton
//         if (this.installButton) {
//             this.installButton.style.display = 'block';
//         }
        
//         // Si l'app est déjà installée, on a le bouton de désinstallation
//         if (this.isAppInstalled()) {
//             console.log('[PWA Installer] Application déjà installée - bouton de désinstallation disponible');
//             return;
//         }

//         // Si pas installée, attendre un peu pour voir si l'événement se déclenche
//         setTimeout(() => {
//             if (!this.deferredPrompt && this.installButton && !this.isAppInstalled()) {
//                 this.installButton.innerHTML = '📱 Installer (manuel)';
//                 console.log('[PWA Installer] Bouton manuel affiché (pas d\'événement beforeinstallprompt)');
//             }
//         }, 3000);
//     }

//     // Méthode publique pour afficher les instructions manuelles (utile pour debug/test)
//     showManualInstructions() {
//         this.showManualInstallInstructions();
//     }

//     // Méthode publique pour forcer l'affichage (utile pour le debug)
//     forceShowInstallButton() {
//         if (!this.installButton) {
//             this.createInstallButton();
//         }
        
//         if (this.installButton) {
//             this.installButton.style.display = 'block';
//             this.updateButtonContent();
//             console.log('[PWA Installer] Bouton d\'installation forcé');
//         }
//     }

//     // Méthode publique pour vérifier l'état
//     getStatus() {
//         return {
//             isInitialized: this.isInitialized,
//             hasPrompt: !!this.deferredPrompt,
//             isInstalled: this.isAppInstalled(),
//             buttonVisible: this.installButton ? this.installButton.style.display !== 'none' : false
//         };
//     }
// }

// // Créer une instance globale
// window.pwaInstaller = new PWAInstaller();

// // Exposer quelques méthodes utiles pour le debug
// window.forceInstallPrompt = () => window.pwaInstaller.forceShowInstallButton();
// window.getPWAStatus = () => window.pwaInstaller.getStatus();
// window.showInstallInstructions = () => window.pwaInstaller.showManualInstructions();

// // Export pour les modules (optionnel)
// if (typeof module !== 'undefined' && module.exports) {
//     module.exports = PWAInstaller;
// }


























// // js/pwaInstaller.js
// // Gestionnaire d'installation PWA

// class PWAInstaller {
//     constructor() {
//         this.deferredPrompt = null;
//         this.installButton = null;
//         this.isInitialized = false;
        
//         // Initialiser quand le DOM est prêt
//         if (document.readyState === 'loading') {
//             document.addEventListener('DOMContentLoaded', () => this.init());
//         } else {
//             this.init();
//         }
//     }

//     init() {
//         if (this.isInitialized) return;
        
//         console.log('[PWA Installer] Initialisation...');
        
//         // Écouter l'événement d'installation
//         this.setupInstallPromptListener();
        
//         // Écouter l'événement d'installation réussie
//         this.setupInstallSuccessListener();
        
//         // Créer le bouton d'installation
//         this.createInstallButton();
        
//         // Vérifier si on peut déjà afficher le bouton
//         this.checkInstallAvailability();
        
//         this.isInitialized = true;
//         console.log('[PWA Installer] Initialisé avec succès');
//     }

//     setupInstallPromptListener() {
//         window.addEventListener('beforeinstallprompt', (e) => {
//             console.log('[PWA Installer] beforeinstallprompt déclenché');
            
//             // Empêcher l'affichage automatique
//             e.preventDefault();
            
//             // Stocker l'événement
//             this.deferredPrompt = e;
            
//             // Afficher le bouton
//             this.showInstallButton();
//         });
//     }

//     setupInstallSuccessListener() {
//         window.addEventListener('appinstalled', (evt) => {
//             console.log('[PWA Installer] Application installée avec succès');
//             // Marquer comme installée dans le localStorage
//             localStorage.setItem('pwa-installed', 'true');
//             this.updateButtonForInstalledState();
//             this.deferredPrompt = null;
//         });
//     }

//     createInstallButton() {
//         // Vérifier si le bouton existe déjà
//         if (this.installButton) return;

//         // Trouver le conteneur dans la modal gedcom
//         const modalContent = document.querySelector('#gedcom-modal div[style*="padding: 20px"]');
//         if (!modalContent) {
//             console.warn('[PWA Installer] Conteneur de modal non trouvé, tentative différée...');
//             // Réessayer plus tard
//             setTimeout(() => this.createInstallButton(), 1000);
//             return;
//         }

//         // Créer le bouton d'installation
//         this.installButton = document.createElement('button');
//         this.installButton.id = 'install-app-btn';
//         this.updateButtonContent();
//         this.installButton.style.cssText = `
//             background-color: #ff8c42; 
//             color: white; 
//             border: none; 
//             padding: 10px; 
//             width: 100%; 
//             max-width: 240px; 
//             border-radius: 4px; 
//             cursor: pointer; 
//             font-weight: bold; 
//             margin: 0 auto 10px auto;
//             display: none;
//             box-sizing: border-box;
//         `;
        
//         // Ajouter l'événement click
//         this.installButton.addEventListener('click', () => {
//             if (this.isAppInstalled()) {
//                 this.uninstallApp();
//             } else {
//                 this.installApp();
//             }
//         });
        
//         // Insérer le bouton avant le bouton "Activer les logs"
//         const debugBtn = document.getElementById('activateDebugLogsBtn');
//         if (debugBtn) {
//             debugBtn.parentNode.insertBefore(this.installButton, debugBtn);
//         } else {
//             // Fallback : ajouter à la fin du conteneur
//             modalContent.appendChild(this.installButton);
//         }
        
//         console.log('[PWA Installer] Bouton d\'installation/désinstallation créé');
//     }

//     updateButtonContent() {
//         if (!this.installButton) return;
        
//         if (this.isAppInstalled()) {
//             this.installButton.innerHTML = '📱 Désinstaller l\'application';
//             this.installButton.setAttribute('data-text-key', 'desinstallerApp');
//         } else {
//             this.installButton.innerHTML = '📱 Installer l\'application';
//             this.installButton.setAttribute('data-text-key', 'installerApp');
//         }
//     }

//     updateButtonForInstalledState() {
//         this.updateButtonContent();
//         if (this.installButton) {
//             this.installButton.style.display = 'block';
//         }
//     }

//     showInstallButton() {
//         if (this.installButton) {
//             this.installButton.style.display = 'block';
//             this.updateButtonContent();
//             console.log('[PWA Installer] Bouton d\'installation affiché');
//         }
//     }

//     hideInstallButton() {
//         if (this.installButton) {
//             this.installButton.style.display = 'none';
//             console.log('[PWA Installer] Bouton d\'installation masqué');
//         }
//     }

//     async installApp() {
//         console.log('[PWA Installer] Tentative d\'installation...');
        
//         if (this.deferredPrompt) {
//             try {
//                 // Afficher la popup d'installation
//                 this.deferredPrompt.prompt();
                
//                 // Attendre le choix de l'utilisateur
//                 const choiceResult = await this.deferredPrompt.userChoice;
                
//                 if (choiceResult.outcome === 'accepted') {
//                     console.log('[PWA Installer] Installation acceptée par l\'utilisateur');
//                     // Marquer comme installée
//                     localStorage.setItem('pwa-installed', 'true');
//                     // Le bouton sera mis à jour par l'événement 'appinstalled' ou ici
//                     setTimeout(() => this.updateButtonForInstalledState(), 1000);
//                 } else {
//                     console.log('[PWA Installer] Installation refusée par l\'utilisateur');
//                 }
                
//                 this.deferredPrompt = null;
//             } catch (error) {
//                 console.error('[PWA Installer] Erreur lors de l\'installation:', error);
//                 this.showManualInstallInstructions();
//             }
//         } else {
//             // Pas d'événement beforeinstallprompt disponible
//             this.showManualInstallInstructions();
//         }
//     }

//     async uninstallApp() {
//         console.log('[PWA Installer] Tentative de désinstallation...');
        
//         // Instructions de désinstallation
//         const userAgent = navigator.userAgent.toLowerCase();
//         let instructions = 'Pour désinstaller cette application :\n\n';
        
//         if (userAgent.includes('chrome') && userAgent.includes('mobile')) {
//             instructions += '1. Maintenez appuyé sur l\'icône de l\'app\n' +
//                           '2. Sélectionnez "Désinstaller" ou glissez vers "Supprimer"\n' +
//                           '3. Confirmez la suppression';
//         } else if (userAgent.includes('safari') && userAgent.includes('mobile')) {
//             instructions += '1. Maintenez appuyé sur l\'icône de l\'app\n' +
//                           '2. Appuyez sur le "X" qui apparaît\n' +
//                           '3. Confirmez la suppression';
//         } else {
//             instructions += '1. Maintenez appuyé sur l\'icône de l\'application\n' +
//                           '2. Sélectionnez "Désinstaller" ou "Supprimer"\n' +
//                           '3. Confirmez la suppression\n\n' +
//                           'Ou allez dans les paramètres du navigateur :\n' +
//                           '• Applications installées\n' +
//                           '• Trouvez cette app et désinstallez-la';
//         }
        
//         this.showUninstallModal(instructions);
//     }

//     showManualInstallInstructions() {
//         const userAgent = navigator.userAgent.toLowerCase();
//         let instructions = 'Pour installer cette application :\n\n';
        
//         if (userAgent.includes('chrome') && userAgent.includes('mobile')) {
//             instructions += '1. Appuyez sur le menu du navigateur (⋮)\n' +
//                           '2. Sélectionnez "Ajouter à l\'écran d\'accueil"\n' +
//                           '3. Confirmez l\'installation';
//         } else if (userAgent.includes('safari') && userAgent.includes('mobile')) {
//             instructions += '1. Appuyez sur le bouton Partager\n' +
//                           '2. Sélectionnez "Sur l\'écran d\'accueil"\n' +
//                           '3. Confirmez l\'ajout';
//         } else if (userAgent.includes('edge')) {
//             instructions += '1. Appuyez sur le menu (⋯)\n' +
//                           '2. Sélectionnez "Applications"\n' +
//                           '3. Choisissez "Installer cette application"';
//         } else {
//             instructions += '1. Cherchez l\'option "Ajouter à l\'écran d\'accueil"\n' +
//                           '   ou "Installer l\'application" dans le menu\n' +
//                           '2. Confirmez l\'installation';
//         }
        
//         // Utiliser une modal plus jolie au lieu d'alert
//         this.showInstallModal(instructions);
//     }

//     showInstallModal(instructions) {
//         // Créer une modal temporaire pour les instructions
//         const modal = document.createElement('div');
//         modal.style.cssText = `
//             position: fixed;
//             top: 0;
//             left: 0;
//             width: 100%;
//             height: 100%;
//             background-color: rgba(0,0,0,0.5);
//             z-index: 2000;
//             display: flex;
//             justify-content: center;
//             align-items: center;
//         `;
        
//         const modalContent = document.createElement('div');
//         modalContent.style.cssText = `
//             background-color: white;
//             padding: 20px;
//             border-radius: 10px;
//             max-width: 90%;
//             width: 300px;
//             box-shadow: 0 4px 6px rgba(0,0,0,0.1);
//             text-align: center;
//         `;
        
//         modalContent.innerHTML = `
//             <h3 style="margin-top: 0; color: #ff8c42;">📱 Installation manuelle</h3>
//             <p style="white-space: pre-line; text-align: left; line-height: 1.4; margin: 15px 0;">${instructions}</p>
//             <button id="close-install-modal" style="
//                 background-color: #ff8c42;
//                 color: white;
//                 border: none;
//                 padding: 10px 20px;
//                 border-radius: 4px;
//                 cursor: pointer;
//                 font-weight: bold;
//                 margin-top: 10px;
//             ">Compris</button>
//         `;
        
//         modal.appendChild(modalContent);
//         document.body.appendChild(modal);
        
//         // Fermer la modal
//         const closeBtn = modal.querySelector('#close-install-modal');
//         const closeModal = () => {
//             document.body.removeChild(modal);
//         };
        
//         closeBtn.addEventListener('click', closeModal);
//         modal.addEventListener('click', (e) => {
//             if (e.target === modal) closeModal();
//         });
        
//         // Auto-fermeture après 10 secondes
//         setTimeout(closeModal, 10000);
//     }

//     showUninstallModal(instructions) {
//         // Créer une modal pour les instructions de désinstallation
//         const modal = document.createElement('div');
//         modal.style.cssText = `
//             position: fixed;
//             top: 0;
//             left: 0;
//             width: 100%;
//             height: 100%;
//             background-color: rgba(0,0,0,0.5);
//             z-index: 2000;
//             display: flex;
//             justify-content: center;
//             align-items: center;
//         `;
        
//         const modalContent = document.createElement('div');
//         modalContent.style.cssText = `
//             background-color: white;
//             padding: 20px;
//             border-radius: 10px;
//             max-width: 90%;
//             width: 300px;
//             box-shadow: 0 4px 6px rgba(0,0,0,0.1);
//             text-align: center;
//         `;
        
//         modalContent.innerHTML = `
//             <h3 style="margin-top: 0; color: #ff4444;">🗑️ Désinstallation</h3>
//             <p style="white-space: pre-line; text-align: left; line-height: 1.4; margin: 15px 0;">${instructions}</p>
//             <button id="close-uninstall-modal" style="
//                 background-color: #ff4444;
//                 color: white;
//                 border: none;
//                 padding: 10px 20px;
//                 border-radius: 4px;
//                 cursor: pointer;
//                 font-weight: bold;
//                 margin-top: 10px;
//             ">Compris</button>
//         `;
        
//         modal.appendChild(modalContent);
//         document.body.appendChild(modal);
        
//         // Fermer la modal
//         const closeBtn = modal.querySelector('#close-uninstall-modal');
//         const closeModal = () => {
//             document.body.removeChild(modal);
//             // Après fermeture, remettre le bouton en mode installation si pas installé
//             setTimeout(() => {
//                 if (!this.isAppInstalled()) {
//                     this.updateButtonContent();
//                 }
//             }, 1000);
//         };
        
//         closeBtn.addEventListener('click', closeModal);
//         modal.addEventListener('click', (e) => {
//             if (e.target === modal) closeModal();
//         });
        
//         // Auto-fermeture après 15 secondes
//         setTimeout(closeModal, 15000);
//     }

//     // Méthode pour forcer la réinitialisation (pour debug)
//     resetInstallState() {
//         localStorage.removeItem('pwa-installed');
//         this.deferredPrompt = null;
//         this.updateButtonContent();
//         console.log('[PWA Installer] État d\'installation réinitialisé');
        
//         // Forcer la réapparition du bouton d'installation
//         if (this.installButton) {
//             this.installButton.style.display = 'block';
//             this.installButton.innerHTML = '📱 Installer l\'application';
//         }
//     }

//     isAppInstalled() {
//         // Sur PC, difficile de détecter si l'app est installée
//         // On se base sur le mode d'affichage ET on garde un état en localStorage
//         const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
//                            window.navigator.standalone === true;
        
//         // Vérifier aussi si on a un flag en localStorage
//         const wasInstalled = localStorage.getItem('pwa-installed') === 'true';
        
//         console.log('[PWA Installer] Détection installation - Standalone:', isStandalone, 'LocalStorage:', wasInstalled);
        
//         return isStandalone || wasInstalled;
//     }

//     checkInstallAvailability() {
//         // Mettre à jour le contenu du bouton selon l'état
//         this.updateButtonContent();
        
//         // Toujours afficher le bouton
//         if (this.installButton) {
//             this.installButton.style.display = 'block';
//         }
        
//         // Si l'app est déjà installée, on a le bouton de désinstallation
//         if (this.isAppInstalled()) {
//             console.log('[PWA Installer] Application déjà installée - bouton de désinstallation disponible');
//             return;
//         }

//         // Si pas installée, attendre un peu pour voir si l'événement se déclenche
//         setTimeout(() => {
//             if (!this.deferredPrompt && this.installButton && !this.isAppInstalled()) {
//                 this.installButton.innerHTML = '📱 Installer (manuel)';
//                 console.log('[PWA Installer] Bouton manuel affiché (pas d\'événement beforeinstallprompt)');
//             }
//         }, 3000);
//     }

//     // Méthode publique pour afficher les instructions manuelles (utile pour debug/test)
//     showManualInstructions() {
//         this.showManualInstallInstructions();
//     }

//     // Méthode publique pour forcer l'affichage (utile pour le debug)
//     forceShowInstallButton() {
//         if (!this.installButton) {
//             this.createInstallButton();
//         }
        
//         if (this.installButton) {
//             this.installButton.style.display = 'block';
//             this.updateButtonContent();
//             console.log('[PWA Installer] Bouton d\'installation forcé');
//         }
//     }

//     // Méthode publique pour vérifier l'état
//     getStatus() {
//         return {
//             isInitialized: this.isInitialized,
//             hasPrompt: !!this.deferredPrompt,
//             isInstalled: this.isAppInstalled(),
//             buttonVisible: this.installButton ? this.installButton.style.display !== 'none' : false
//         };
//     }
// }

// // Créer une instance globale
// window.pwaInstaller = new PWAInstaller();

// // Exposer quelques méthodes utiles pour le debug
// window.forceInstallPrompt = () => window.pwaInstaller.forceShowInstallButton();
// window.getPWAStatus = () => window.pwaInstaller.getStatus();
// window.showInstallInstructions = () => window.pwaInstaller.showManualInstructions();
// window.resetPWAState = () => window.pwaInstaller.resetInstallState();

// // Export pour les modules (optionnel)
// if (typeof module !== 'undefined' && module.exports) {
//     module.exports = PWAInstaller;
// }



























// // js/pwaInstaller.js
// // Version ultra-simple : UN SEUL bouton qui gère tout

// class PWAInstaller {
//     constructor() {
//         this.deferredPrompt = null;
//         this.installButton = null;
        
//         // Initialiser quand le DOM est prêt
//         if (document.readyState === 'loading') {
//             document.addEventListener('DOMContentLoaded', () => this.init());
//         } else {
//             this.init();
//         }
//     }

//     init() {
//         console.log('[PWA Installer] Initialisation ultra-simple...');
        
//         // Écouter l'événement d'installation
//         window.addEventListener('beforeinstallprompt', (e) => {
//             console.log('[PWA Installer] Installation PWA possible');
//             e.preventDefault();
//             this.deferredPrompt = e;
//             this.updateButton();
//         });
        
//         // Écouter l'installation réussie
//         window.addEventListener('appinstalled', (evt) => {
//             console.log('[PWA Installer] App installée');
//             this.deferredPrompt = null;
//             this.updateButton();
//         });
        
//         // Créer le bouton
//         this.createButton();
//     }

//     createButton() {
//         // Trouver le conteneur dans la modal gedcom
//         const modalContent = document.querySelector('#gedcom-modal div[style*="padding: 20px"]');
//         if (!modalContent) {
//             console.warn('[PWA Installer] Conteneur de modal non trouvé, tentative différée...');
//             setTimeout(() => this.createButton(), 1000);
//             return;
//         }

//         // Créer LE bouton unique
//         this.installButton = document.createElement('button');
//         this.installButton.id = 'pwa-action-btn';
//         this.updateButton();
//         this.installButton.style.cssText = `
//             background-color: #ff8c42; 
//             color: white; 
//             border: none; 
//             padding: 10px; 
//             width: 100%; 
//             max-width: 240px; 
//             border-radius: 4px; 
//             cursor: pointer; 
//             font-weight: bold; 
//             margin: 0 auto 10px auto;
//             display: block;
//             box-sizing: border-box;
//         `;
//         this.installButton.addEventListener('click', () => this.handleClick());

//         // Insérer le bouton avant le bouton "Activer les logs"
//         const debugBtn = document.getElementById('activateDebugLogsBtn');
//         if (debugBtn) {
//             debugBtn.parentNode.insertBefore(this.installButton, debugBtn);
//         } else {
//             modalContent.appendChild(this.installButton);
//         }
        
//         console.log('[PWA Installer] Bouton unique créé');
//     }

//     updateButton() {
//         if (!this.installButton) return;
        
//         if (this.isAppInstalled()) {
//             // App installée : proposer de la lancer
//             this.installButton.innerHTML = '🚀 Lancer l\'application';
//             this.installButton.style.backgroundColor = '#4CAF50';
//             this.installButton.setAttribute('data-text-key', 'lancerApp');
//         } else if (this.deferredPrompt) {
//             // Installation possible
//             this.installButton.innerHTML = '📱 Installer l\'application';
//             this.installButton.style.backgroundColor = '#ff8c42';
//             this.installButton.setAttribute('data-text-key', 'installerApp');
//         } else {
//             // Pas d'installation auto possible
//             this.installButton.innerHTML = '💡 Aide installation';
//             this.installButton.style.backgroundColor = '#2196F3';
//             this.installButton.setAttribute('data-text-key', 'aideInstallation');
//         }
//     }

//     handleClick() {
//         if (this.isAppInstalled()) {
//             // App installée : essayer de la lancer
//             this.launchApp();
//         } else if (this.deferredPrompt) {
//             // Installation automatique possible
//             this.installApp();
//         } else {
//             // Donner de l'aide pour l'installation
//             this.showInstallHelp();
//         }
//     }

//     async installApp() {
//         console.log('[PWA Installer] Installation automatique...');
        
//         try {
//             this.deferredPrompt.prompt();
//             const choiceResult = await this.deferredPrompt.userChoice;
            
//             if (choiceResult.outcome === 'accepted') {
//                 console.log('[PWA Installer] Installation acceptée');
//                 this.showToast('✅ Application installée avec succès !', '#4CAF50');
//             } else {
//                 console.log('[PWA Installer] Installation refusée');
//                 this.showToast('❌ Installation annulée', '#ff9800');
//             }
            
//             this.deferredPrompt = null;
//             this.updateButton();
//         } catch (error) {
//             console.error('[PWA Installer] Erreur installation:', error);
//             this.showInstallHelp();
//         }
//     }

//     launchApp() {
//         // Essayer de détecter l'URL de l'app installée
//         const appUrl = window.location.origin + window.location.pathname;
        
//         // Ouvrir dans un nouvel onglet pour simuler le lancement
//         const newWindow = window.open(appUrl, '_blank');
        
//         if (newWindow) {
//             this.showToast('🚀 Application lancée dans un nouvel onglet', '#4CAF50');
            
//             // Proposer des alternatives
//             setTimeout(() => {
//                 this.showModal('🚀 Lancement de l\'application', 
//                     'L\'application s\'est ouverte dans un nouvel onglet.\n\n' +
//                     '💡 Pour la retrouver facilement :\n\n' +
//                     '• Cherchez l\'icône sur votre bureau\n' +
//                     '• Ou dans le menu Démarrer (Windows)\n' +
//                     '• Ou dans le dock/Launchpad (Mac)\n' +
//                     '• Ou tapez "TreeViewer" dans la recherche système\n\n' +
//                     '❓ Si vous ne trouvez pas l\'application, elle n\'est peut-être pas installée correctement.');
//             }, 2000);
//         } else {
//             this.showModal('🤔 Application installée ?', 
//                 'Je ne peux pas lancer l\'application automatiquement.\n\n' +
//                 '✅ Si elle est installée, cherchez :\n' +
//                 '• L\'icône sur votre bureau\n' +
//                 '• Dans le menu Démarrer\n' +
//                 '• En tapant "TreeViewer" dans la recherche\n\n' +
//                 '❓ Si vous ne la trouvez pas, utilisez le bouton "Aide installation" pour réinstaller.');
//         }
//     }

//     showInstallHelp() {
//         const isChrome = navigator.userAgent.includes('Chrome') && !navigator.userAgent.includes('Edge');
//         const isEdge = navigator.userAgent.includes('Edge');
//         const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
//         let title = '💡 Comment installer l\'application';
//         let instructions = '';
        
//         if (isMobile) {
//             if (navigator.userAgent.includes('Chrome')) {
//                 instructions = 'CHROME MOBILE :\n\n' +
//                               '1. Appuyez sur le menu (⋮) en haut à droite\n' +
//                               '2. Cherchez "Ajouter à l\'écran d\'accueil"\n' +
//                               '3. Confirmez l\'installation\n\n' +
//                               '✅ L\'icône apparaîtra sur votre écran d\'accueil !';
//             } else if (navigator.userAgent.includes('Safari')) {
//                 instructions = 'SAFARI MOBILE :\n\n' +
//                               '1. Appuyez sur le bouton Partager 📤\n' +
//                               '2. Faites défiler et appuyez sur "Sur l\'écran d\'accueil"\n' +
//                               '3. Confirmez l\'ajout\n\n' +
//                               '✅ L\'icône apparaîtra sur votre écran d\'accueil !';
//             } else {
//                 instructions = 'MOBILE :\n\n' +
//                               'Cherchez dans le menu de votre navigateur :\n' +
//                               '• "Ajouter à l\'écran d\'accueil"\n' +
//                               '• "Installer l\'application"\n' +
//                               '• "Créer un raccourci"\n\n' +
//                               '✅ L\'icône apparaîtra sur votre écran d\'accueil !';
//             }
//         } else {
//             if (isChrome) {
//                 instructions = 'CHROME PC :\n\n' +
//                               '🔍 Regardez dans la barre d\'adresse :\n' +
//                               '• Une icône "Installer" ⊕ peut apparaître\n' +
//                               '• Cliquez dessus si vous la voyez\n\n' +
//                               '📋 OU dans le menu Chrome :\n' +
//                               '• Menu (⋮) → "Installer TreeViewer"\n' +
//                               '• Menu (⋮) → Plus d\'outils → Applications\n\n' +
//                               '✅ Un raccourci apparaîtra sur votre bureau !';
//             } else if (isEdge) {
//                 instructions = 'EDGE PC :\n\n' +
//                               '🔍 Regardez dans la barre d\'adresse :\n' +
//                               '• Une icône "Installer" peut apparaître\n' +
//                               '• Cliquez dessus si vous la voyez\n\n' +
//                               '📋 OU dans le menu Edge :\n' +
//                               '• Menu (⋯) → Applications\n' +
//                               '• "Installer ce site en tant qu\'application"\n\n' +
//                               '✅ Un raccourci apparaîtra sur votre bureau !';
//             } else {
//                 instructions = 'NAVIGATEUR PC :\n\n' +
//                               'Cherchez dans votre navigateur :\n' +
//                               '• Une icône "Installer" dans la barre d\'adresse\n' +
//                               '• Menu → "Installer cette application"\n' +
//                               '• Menu → "Applications"\n\n' +
//                               '📝 Si rien n\'apparaît, votre navigateur ne supporte\n' +
//                               'peut-être pas l\'installation d\'applications web.';
//             }
//         }
        
//         this.showModal(title, instructions);
//     }

//     isAppInstalled() {
//         // Détection simple basée sur le mode d'affichage
//         return window.matchMedia('(display-mode: standalone)').matches ||
//                window.navigator.standalone === true;
//     }

//     showModal(title, content) {
//         const modal = document.createElement('div');
//         modal.style.cssText = `
//             position: fixed;
//             top: 0;
//             left: 0;
//             width: 100%;
//             height: 100%;
//             background-color: rgba(0,0,0,0.5);
//             z-index: 2000;
//             display: flex;
//             justify-content: center;
//             align-items: center;
//         `;
        
//         const modalContent = document.createElement('div');
//         modalContent.style.cssText = `
//             background-color: white;
//             padding: 20px;
//             border-radius: 10px;
//             max-width: 90%;
//             max-height: 80%;
//             width: 400px;
//             box-shadow: 0 4px 6px rgba(0,0,0,0.1);
//             text-align: center;
//             overflow-y: auto;
//         `;
        
//         modalContent.innerHTML = `
//             <h3 style="margin-top: 0; color: #333;">${title}</h3>
//             <p style="white-space: pre-line; text-align: left; line-height: 1.4; margin: 15px 0; font-size: 14px;">${content}</p>
//             <button id="close-modal" style="
//                 background-color: #4CAF50;
//                 color: white;
//                 border: none;
//                 padding: 10px 20px;
//                 border-radius: 4px;
//                 cursor: pointer;
//                 font-weight: bold;
//                 margin-top: 10px;
//             ">Compris</button>
//         `;
        
//         modal.appendChild(modalContent);
//         document.body.appendChild(modal);
        
//         const closeBtn = modal.querySelector('#close-modal');
//         const closeModal = () => document.body.removeChild(modal);
        
//         closeBtn.addEventListener('click', closeModal);
//         modal.addEventListener('click', (e) => {
//             if (e.target === modal) closeModal();
//         });
        
//         setTimeout(closeModal, 30000);
//     }

//     showToast(message, color = '#4CAF50') {
//         const toast = document.createElement('div');
//         toast.style.cssText = `
//             position: fixed;
//             top: 20px;
//             right: 20px;
//             background-color: ${color};
//             color: white;
//             padding: 15px;
//             border-radius: 5px;
//             z-index: 3000;
//             font-weight: bold;
//             max-width: 300px;
//         `;
//         toast.textContent = message;
        
//         document.body.appendChild(toast);
//         setTimeout(() => document.body.removeChild(toast), 4000);
//     }
// }

// // Créer une instance globale
// window.pwaInstaller = new PWAInstaller();

// // Fonction globale pour debug
// window.testPWA = () => {
//     console.log('PWA Status:', {
//         deferredPrompt: !!window.pwaInstaller.deferredPrompt,
//         isInstalled: window.pwaInstaller.isAppInstalled(),
//         userAgent: navigator.userAgent
//     });
// };




















// js/pwaInstaller.js
// Gestionnaire d'installation PWA

class PWAInstaller {
    constructor() {
        this.deferredPrompt = null;
        this.installButton = null;
        this.isInitialized = false;
        
        // Initialiser quand le DOM est prêt
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        if (this.isInitialized) return;
        
        console.log('[PWA Installer] Initialisation...');
        
        // Écouter l'événement d'installation
        this.setupInstallPromptListener();
        
        // Écouter l'événement d'installation réussie
        this.setupInstallSuccessListener();
        
        // Créer le bouton d'installation
        this.createInstallButton();
        
        // Vérifier si on peut déjà afficher le bouton
        this.checkInstallAvailability();
        
        this.isInitialized = true;
        console.log('[PWA Installer] Initialisé avec succès');
    }

    setupInstallPromptListener() {
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('[PWA Installer] beforeinstallprompt déclenché');
            
            // Empêcher l'affichage automatique
            e.preventDefault();
            
            // Stocker l'événement
            this.deferredPrompt = e;
            
            // Afficher le bouton
            this.showInstallButton();
        });
    }

    setupInstallSuccessListener() {
        window.addEventListener('appinstalled', (evt) => {
            console.log('[PWA Installer] Application installée avec succès');
            this.updateButtonForInstalledState();
            this.deferredPrompt = null;
        });
    }

    createInstallButton() {
        // Vérifier si le bouton existe déjà
        if (this.installButton) return;

        // Trouver le conteneur dans la modal gedcom
        const modalContent = document.querySelector('#gedcom-modal div[style*="padding: 20px"]');
        if (!modalContent) {
            console.warn('[PWA Installer] Conteneur de modal non trouvé, tentative différée...');
            // Réessayer plus tard
            setTimeout(() => this.createInstallButton(), 1000);
            return;
        }

        // Créer le bouton d'installation
        this.installButton = document.createElement('button');
        this.installButton.id = 'install-app-btn';
        this.updateButtonContent();
        this.installButton.style.cssText = `
            background-color: #ff8c42; 
            color: white; 
            border: none; 
            padding: 10px; 
            width: 100%; 
            max-width: 240px; 
            border-radius: 4px; 
            cursor: pointer; 
            font-weight: bold; 
            margin: 0 auto 10px auto;
            display: none;
            box-sizing: border-box;
        `;
        
        // Ajouter l'événement click
        this.installButton.addEventListener('click', () => {
            if (this.isAppInstalled()) {
                this.uninstallApp();
            } else {
                this.installApp();
            }
        });
        
        // Insérer le bouton avant le bouton "Activer les logs"
        const debugBtn = document.getElementById('activateDebugLogsBtn');
        if (debugBtn) {
            debugBtn.parentNode.insertBefore(this.installButton, debugBtn);
        } else {
            // Fallback : ajouter à la fin du conteneur
            modalContent.appendChild(this.installButton);
        }
        
        console.log('[PWA Installer] Bouton d\'installation/désinstallation créé');
    }

    updateButtonContent() {
        if (!this.installButton) return;
        
        if (this.isAppInstalled()) {
            this.installButton.innerHTML = '📱 Désinstaller l\'application';
            this.installButton.setAttribute('data-text-key', 'desinstallerApp');
        } else {
            this.installButton.innerHTML = '📱 Installer l\'application';
            this.installButton.setAttribute('data-text-key', 'installerApp');
        }
    }

    updateButtonForInstalledState() {
        this.updateButtonContent();
        if (this.installButton) {
            this.installButton.style.display = 'block';
        }
    }

    showInstallButton() {
        if (this.installButton) {
            this.installButton.style.display = 'block';
            this.updateButtonContent();
            console.log('[PWA Installer] Bouton d\'installation affiché');
        }
    }

    hideInstallButton() {
        if (this.installButton) {
            this.installButton.style.display = 'none';
            console.log('[PWA Installer] Bouton d\'installation masqué');
        }
    }

    async installApp() {
        console.log('[PWA Installer] Tentative d\'installation...');
        
        if (this.deferredPrompt) {
            try {
                // Afficher la popup d'installation
                this.deferredPrompt.prompt();
                
                // Attendre le choix de l'utilisateur
                const choiceResult = await this.deferredPrompt.userChoice;
                
                if (choiceResult.outcome === 'accepted') {
                    console.log('[PWA Installer] Installation acceptée par l\'utilisateur');
                    // Le bouton sera mis à jour par l'événement 'appinstalled'
                } else {
                    console.log('[PWA Installer] Installation refusée par l\'utilisateur');
                }
                
                this.deferredPrompt = null;
            } catch (error) {
                console.error('[PWA Installer] Erreur lors de l\'installation:', error);
                this.showManualInstallInstructions();
            }
        } else {
            // Pas d'événement beforeinstallprompt disponible
            this.showManualInstallInstructions();
        }
    }

    async uninstallApp() {
        console.log('[PWA Installer] Tentative de désinstallation...');
        
        // Instructions de désinstallation
        const userAgent = navigator.userAgent.toLowerCase();
        let instructions = 'Pour désinstaller cette application :\n\n';
        
        if (userAgent.includes('chrome') && userAgent.includes('mobile')) {
            instructions += '1. Maintenez appuyé sur l\'icône de l\'app\n' +
                          '2. Sélectionnez "Désinstaller" ou glissez vers "Supprimer"\n' +
                          '3. Confirmez la suppression';
        } else if (userAgent.includes('safari') && userAgent.includes('mobile')) {
            instructions += '1. Maintenez appuyé sur l\'icône de l\'app\n' +
                          '2. Appuyez sur le "X" qui apparaît\n' +
                          '3. Confirmez la suppression';
        } else {
            instructions += '1. Maintenez appuyé sur l\'icône de l\'application\n' +
                          '2. Sélectionnez "Désinstaller" ou "Supprimer"\n' +
                          '3. Confirmez la suppression\n\n' +
                          'Ou allez dans les paramètres du navigateur :\n' +
                          '• Applications installées\n' +
                          '• Trouvez cette app et désinstallez-la';
        }
        
        this.showUninstallModal(instructions);
    }

    async uninstallApp() {
        console.log('[PWA Installer] Tentative de désinstallation...');
        
        // Obtenir les traductions selon la langue actuelle
        const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'fr';
        const getText = (key) => window.i18n ? window.i18n.getText(key) : key;
        
        // Détection du navigateur et de la plateforme
        const userAgent = navigator.userAgent.toLowerCase();
        const isChrome = userAgent.includes('chrome') && !userAgent.includes('edge');
        const isEdge = userAgent.includes('edge');
        const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
        
        let instructions = getText('desinstallationInstructions') + '\n\n';
        
        if (isMobile) {
            // Instructions mobiles
            if (userAgent.includes('chrome')) {
                instructions += getText('chromeMobileDesinstall');
            } else if (userAgent.includes('safari')) {
                instructions += getText('safariMobileDesinstall');
            } else {
                instructions += getText('genericDesinstall');
            }
        } else {
            // Instructions PC
            if (isChrome) {
                instructions += getText('chromePCDesinstall');
            } else if (isEdge) {
                instructions += getText('edgePCDesinstall');
            } else {
                instructions += getText('genericDesinstall');
            }
        }
        
        this.showUninstallModal(instructions);
    }


    showManualInstallInstructions() {
        const userAgent = navigator.userAgent.toLowerCase();
        let instructions = 'Pour installer cette application :\n\n';
        
        if (userAgent.includes('chrome') && userAgent.includes('mobile')) {
            instructions += '1. Appuyez sur le menu du navigateur (⋮)\n' +
                          '2. Sélectionnez "Ajouter à l\'écran d\'accueil"\n' +
                          '3. Confirmez l\'installation';
        } else if (userAgent.includes('safari') && userAgent.includes('mobile')) {
            instructions += '1. Appuyez sur le bouton Partager\n' +
                          '2. Sélectionnez "Sur l\'écran d\'accueil"\n' +
                          '3. Confirmez l\'ajout';
        } else if (userAgent.includes('edge')) {
            instructions += '1. Appuyez sur le menu (⋯)\n' +
                          '2. Sélectionnez "Applications"\n' +
                          '3. Choisissez "Installer cette application"';
        } else {
            instructions += '1. Cherchez l\'option "Ajouter à l\'écran d\'accueil"\n' +
                          '   ou "Installer l\'application" dans le menu\n' +
                          '2. Confirmez l\'installation';
        }
        
        // Utiliser une modal plus jolie au lieu d'alert
        this.showInstallModal(instructions);
    }

    showInstallModal(instructions) {
        // Créer une modal temporaire pour les instructions
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
            z-index: 2000;
            display: flex;
            justify-content: center;
            align-items: center;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            max-width: 90%;
            width: 300px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            text-align: center;
        `;
        
        modalContent.innerHTML = `
            <h3 style="margin-top: 0; color: #ff8c42;">📱 Installation manuelle</h3>
            <p style="white-space: pre-line; text-align: left; line-height: 1.4; margin: 15px 0;">${instructions}</p>
            <button id="close-install-modal" style="
                background-color: #ff8c42;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
                margin-top: 10px;
            ">Compris</button>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Fermer la modal
        const closeBtn = modal.querySelector('#close-install-modal');
        const closeModal = () => {
            document.body.removeChild(modal);
        };
        
        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        
        // Auto-fermeture après 10 secondes
        setTimeout(closeModal, 10000);
    }

    // showUninstallModal(instructions) {
    //     // Créer une modal pour les instructions de désinstallation
    //     const modal = document.createElement('div');
    //     modal.style.cssText = `
    //         position: fixed;
    //         top: 0;
    //         left: 0;
    //         width: 100%;
    //         height: 100%;
    //         background-color: rgba(0,0,0,0.5);
    //         z-index: 2000;
    //         display: flex;
    //         justify-content: center;
    //         align-items: center;
    //     `;
        
    //     const modalContent = document.createElement('div');
    //     modalContent.style.cssText = `
    //         background-color: white;
    //         padding: 20px;
    //         border-radius: 10px;
    //         max-width: 90%;
    //         width: 300px;
    //         box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    //         text-align: center;
    //     `;
        
    //     modalContent.innerHTML = `
    //         <h3 style="margin-top: 0; color: #ff4444;">🗑️ Désinstallation</h3>
    //         <p style="white-space: pre-line; text-align: left; line-height: 1.4; margin: 15px 0;">${instructions}</p>
    //         <button id="close-uninstall-modal" style="
    //             background-color: #ff4444;
    //             color: white;
    //             border: none;
    //             padding: 10px 20px;
    //             border-radius: 4px;
    //             cursor: pointer;
    //             font-weight: bold;
    //             margin-top: 10px;
    //         ">Compris</button>
    //     `;
        
    //     modal.appendChild(modalContent);
    //     document.body.appendChild(modal);
        
    //     // Fermer la modal
    //     const closeBtn = modal.querySelector('#close-uninstall-modal');
    //     const closeModal = () => {
    //         document.body.removeChild(modal);
    //         // Après fermeture, remettre le bouton en mode installation si pas installé
    //         setTimeout(() => {
    //             if (!this.isAppInstalled()) {
    //                 this.updateButtonContent();
    //             }
    //         }, 1000);
    //     };
        
    //     closeBtn.addEventListener('click', closeModal);
    //     modal.addEventListener('click', (e) => {
    //         if (e.target === modal) closeModal();
    //     });
        
    //     // Auto-fermeture après 15 secondes
    //     setTimeout(closeModal, 15000);
    // }

    showUninstallModal(instructions) {
        const getText = (key) => window.i18n ? window.i18n.getText(key) : key;
        
        // Créer une modal pour les instructions de désinstallation
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
            z-index: 2000;
            display: flex;
            justify-content: center;
            align-items: center;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            max-width: 90%;
            width: 300px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            text-align: center;
        `;
        
        modalContent.innerHTML = `
            <h3 style="margin-top: 0; color: #ff4444;">${getText('desinstallationTitle')}</h3>
            <p style="white-space: pre-line; text-align: left; line-height: 1.4; margin: 15px 0;">${instructions}</p>
            <button id="close-uninstall-modal" style="
                background-color: #ff4444;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
                margin-top: 10px;
            ">${getText('compris')}</button>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Fermer la modal
        const closeBtn = modal.querySelector('#close-uninstall-modal');
        const closeModal = () => {
            document.body.removeChild(modal);
            // Après fermeture, remettre le bouton en mode installation si pas installé
            setTimeout(() => {
                if (!this.isAppInstalled()) {
                    this.updateButtonContent();
                }
            }, 1000);
        };
        
        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        
        // Auto-fermeture après 15 secondes
        setTimeout(closeModal, 15000);
    }

    isAppInstalled() {
        // Vérifier si l'app est lancée en mode standalone
        return window.matchMedia('(display-mode: standalone)').matches ||
               window.navigator.standalone === true;
    }

    checkInstallAvailability() {
        // Mettre à jour le contenu du bouton selon l'état
        this.updateButtonContent();
        
        // Toujours afficher le bouton
        if (this.installButton) {
            this.installButton.style.display = 'block';
        }
        
        // Si l'app est déjà installée, on a le bouton de désinstallation
        if (this.isAppInstalled()) {
            console.log('[PWA Installer] Application déjà installée - bouton de désinstallation disponible');
            return;
        }

        // Si pas installée, attendre un peu pour voir si l'événement se déclenche
        setTimeout(() => {
            if (!this.deferredPrompt && this.installButton && !this.isAppInstalled()) {
                this.installButton.innerHTML = '📱 Installer (manuel)';
                console.log('[PWA Installer] Bouton manuel affiché (pas d\'événement beforeinstallprompt)');
            }
        }, 3000);
    }

    // Méthode publique pour afficher les instructions manuelles (utile pour debug/test)
    showManualInstructions() {
        this.showManualInstallInstructions();
    }

    // Méthode publique pour forcer l'affichage (utile pour le debug)
    forceShowInstallButton() {
        if (!this.installButton) {
            this.createInstallButton();
        }
        
        if (this.installButton) {
            this.installButton.style.display = 'block';
            this.updateButtonContent();
            console.log('[PWA Installer] Bouton d\'installation forcé');
        }
    }

    // Méthode publique pour vérifier l'état
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            hasPrompt: !!this.deferredPrompt,
            isInstalled: this.isAppInstalled(),
            buttonVisible: this.installButton ? this.installButton.style.display !== 'none' : false
        };
    }
}

// Créer une instance globale
window.pwaInstaller = new PWAInstaller();

// Exposer quelques méthodes utiles pour le debug
window.forceInstallPrompt = () => window.pwaInstaller.forceShowInstallButton();
window.getPWAStatus = () => window.pwaInstaller.getStatus();
window.showInstallInstructions = () => window.pwaInstaller.showManualInstructions();

// Export pour les modules (optionnel)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PWAInstaller;
}


