// // Gestionnaire d'installation PWA

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
            max-width: 300px; 
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
        const isChrome = userAgent.includes('chrome') && !userAgent.includes('edg');
        const isEdge = userAgent.includes('edg');
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
        // const closeModal = () => {
        //     document.body.removeChild(modal);
        // };
        // NOUVEAU CODE :
        let modalClosed = false;
        const closeModal = () => {
            if (modalClosed) return;
            modalClosed = true;
            
            try {
                if (modal.parentNode) {
                    document.body.removeChild(modal);
                }
            } catch (error) {
                console.warn('Erreur lors de la fermeture de la modal:', error);
            }
        };
        
        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        
        // Auto-fermeture après 10 secondes
        setTimeout(closeModal, 10000);
    }

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

    // isAppInstalled() {
    //     // Vérifier si l'app est lancée en mode standalone
    //     return window.matchMedia('(display-mode: standalone)').matches ||
    //            window.navigator.standalone === true;
    // }

    isAppInstalled() {
        // Méthode standard
        const standardCheck = window.matchMedia('(display-mode: standalone)').matches ||
                            window.navigator.standalone === true;
        
        // Mode VS Code : Si pas de beforeinstallprompt + localhost = probablement installé
        const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1';
        const vsCodeCheck = isLocalhost && !this.deferredPrompt;
        
        return standardCheck || vsCodeCheck;
        // "Si on est en localhost ET qu'il n'y a pas d'événement d'installation, c'est que l'app est déjà installée."
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


