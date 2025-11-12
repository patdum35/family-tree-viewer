// // Gestionnaire d'installation PWA

class PWAInstaller {
    constructor() {
        this.deferredPrompt = null;
        this.installButton = null;
        this.isInitialized = false;
        this.isInstallationAccepted = localStorage.getItem('pwaAccepted') === 'true';    

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

            // console.log("PWA installée sur Android, tentative de transition...");
            // this.handlePostInstallTransition();

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


    // handlePostInstallTransition() {
    //     // 1. Démarrez un court délai (par sécurité, pour laisser le temps au système)
    //     setTimeout(() => {
    //         // 2. Tentez une redirection simple vers la même page
    //         // Cette action peut parfois inciter le système d'exploitation Android
    //         // à intercepter l'URL et à la basculer vers l'application PWA installée.
    //         window.location.href = window.location.href; 
            
    //         // 3. Afficher une instruction après un court délai (au cas où la redirection échoue)
    //         setTimeout(() => {
    //             // Si l'utilisateur est toujours là, donnez-lui l'instruction finale.
    //             if (!window.matchMedia('(display-mode: standalone)').matches) {
    //                 alert("L'application est installée ! Si vous voyez toujours cet onglet, veuillez le fermer et lancer l'application depuis son icône d'accueil.");
    //             }
    //         }, 3000); // Délai pour l'instruction
            
    //     }, 500); // Délai initial de 0.5s
    // }


    // handlePostInstallTransition() {
    //     // 1. Détecter si l'utilisateur est toujours dans un onglet de navigateur (pas en mode PWA standalone)
    //     const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;

    //     // Si nous sommes dans le navigateur, nous avons besoin du bouton de transition.
    //     if (!isInStandaloneMode) {
            
    //         // Vérifier si le conteneur a déjà été ajouté pour éviter les duplications
    //         if (document.getElementById('pwa-transition-container')) {
    //             // Si le conteneur existe déjà, on arrête
    //             return; 
    //         }

    //         // 2. Créer l'élément conteneur
    //         const container = document.createElement('div');
    //         container.id = 'pwa-transition-container';
    //         // Styles pour rendre le message clair et visible
    //         container.style.cssText = `
    //             position: fixed; 
    //             top: 0; 
    //             left: 0; 
    //             width: 100%; 
    //             padding: 15px; 
    //             background-color: #1890ff; 
    //             color: white; 
    //             text-align: center; 
    //             z-index: 9999;
    //             box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    //         `;

    //         // 3. Ajouter les instructions et le bouton
    //         container.innerHTML = `
    //             <p style="margin: 0 0 10px 0; font-weight: bold;">✅ Installation réussie !</p>
    //             <p style="margin: 0 0 15px 0;">Veuillez cliquer sur ce bouton pour basculer dans l'application installée.</p>
    //             <button id="open-app-link" style="padding: 10px 25px; background-color: white; color: #1890ff; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">
    //                 Ouvrir l'application
    //             </button>
    //         `;

    //         // 4. Ajouter le conteneur au corps du document
    //         document.body.prepend(container); 

    //         // 5. Attacher l'événement au bouton
    //         document.getElementById('open-app-link').addEventListener('click', () => {
    //             // Tenter d'ouvrir un nouvel onglet avec l'URL actuelle.
    //             // Ce clic initié par l'utilisateur a de meilleures chances d'être intercepté 
    //             // par Android pour lancer la PWA au lieu d'un nouvel onglet de navigateur.
    //             window.open(window.location.href, '_blank');
                
    //             // Masquer le message après le clic
    //             container.style.display = 'none';

    //             // Optionnel : Ajouter un message si l'utilisateur est toujours là
    //             setTimeout(() => {
    //                 if (!window.matchMedia('(display-mode: standalone)').matches) {
    //                     console.log("Le lancement n'a pas basculé. L'utilisateur doit relancer l'application manuellement.");
    //                 }
    //             }, 3000); 
    //         });
    //     }
    // }



    // handlePostInstallTransition() {
    //     // Le délai typique pour la finalisation d'installation sur Android.
    //     const INSTALLATION_SAFETY_DELAY_MS = 5000; 
        
    //     const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;

    //     if (!isInStandaloneMode) {
            
    //         // S'assurer de n'ajouter le conteneur qu'une seule fois
    //         if (document.getElementById('pwa-transition-container')) {
    //             return; 
    //         }

    //         const container = document.createElement('div');
    //         container.id = 'pwa-transition-container';
    //         // Styles de base...
    //         container.style.cssText = `
    //             position: fixed; 
    //             top: 0; 
    //             left: 0; 
    //             width: 100%; 
    //             padding: 15px; 
    //             background-color: #ff9900; /* Couleur d'alerte/attente */
    //             color: white; 
    //             text-align: center; 
    //             z-index: 9999;
    //             box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    //         `;

    //         // Contenu initial : État d'attente
    //         container.innerHTML = `
    //             <p style="margin: 0 0 10px 0; font-weight: bold;">⏳ Finalisation de l'installation...</p>
    //             <div id="pwa-spinner" style="border: 4px solid rgba(255, 255, 255, 0.3); border-top: 4px solid white; border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite; margin: 0 auto 10px;"></div>
    //             <p style="margin: 0;">Veuillez patienter quelques instants.</p>
    //         `;
    //         document.body.prepend(container);

    //         // Ajouter les règles CSS pour l'animation de la roue (spinner)
    //         // Note: Vous devrez ajouter cette règle CSS dans votre feuille de style principale ou dans une balise <style>
    //         if (!document.querySelector('style[data-spinner]')) {
    //             const style = document.createElement('style');
    //             style.setAttribute('data-spinner', true);
    //             style.textContent = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
    //             document.head.appendChild(style);
    //         }

    //         // 2. Définir le délai avant d'activer le bouton
    //         setTimeout(() => {
    //             // Changement d'état : Installation Prête
    //             container.style.backgroundColor = '#4CAF50'; // Nouvelle couleur (Succès/Prêt)

    //             // Nouveau contenu : Bouton cliquable
    //             container.innerHTML = `
    //                 <p style="margin: 0 0 10px 0; font-weight: bold;">✅ Installation prête !</p>
    //                 <p style="margin: 0 0 15px 0;">Cliquez sur ce bouton pour basculer dans l'application installée.</p>
    //                 <button id="open-app-link" style="padding: 10px 25px; background-color: white; color: #4CAF50; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">
    //                     Ouvrir l'application
    //                 </button>
    //             `;

    //             // 3. Attacher l'événement au bouton
    //             document.getElementById('open-app-link').addEventListener('click', () => {
    //                 window.open(window.location.href, '_blank');
    //                 container.style.display = 'none';
    //             });

    //         }, INSTALLATION_SAFETY_DELAY_MS);
    //     }
    // }







    //  handlePostInstallTransition() {

    //     // Constante de vérification si l'utilisateur est en mode PWA standalone
    //     const isRunningAsStandalone = () => 
    //         (window.matchMedia('(display-mode: standalone)').matches);

    //     // Si l'utilisateur est déjà dans l'application, on arrête
    //     if (isRunningAsStandalone() || document.getElementById('pwa-transition-container')) {
    //         return; 
    //     }

    //     const container = document.createElement('div');
    //     container.id = 'pwa-transition-container';
    //     // Initialisation du style (bleu, actif)
    //     container.style.cssText = `
    //         position: fixed; 
    //         top: 0; 
    //         left: 0; 
    //         width: 100%; 
    //         padding: 15px; 
    //         background-color: #1890ff; 
    //         color: white; 
    //         text-align: center; 
    //         z-index: 9999;
    //         box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    //     `;

    //     // Contenu initial : Bouton Prêt à l'action
    //     container.innerHTML = `
    //         <p style="margin: 0 0 10px 0; font-weight: bold;">✅ Installation terminée !</p>
    //         <p style="margin: 0 0 15px 0;">Cliquez sur ce bouton pour basculer dans l'application.</p>
    //         <button id="open-app-link" style="padding: 10px 25px; background-color: white; color: #1890ff; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">
    //             Ouvrir l'application
    //         </button>
    //     `;

    //     document.body.prepend(container); 

    //     // --- Logique du Clic avec Fallback ---
    //     document.getElementById('open-app-link').addEventListener('click', () => {
    //         const button = document.getElementById('open-app-link');
    //         const initialText = button.textContent;

    //         // 1. Désactiver le bouton pendant la tentative pour éviter un double clic
    //         button.textContent = "Tentative de lancement...";
    //         button.disabled = true;

    //         // 2. Tenter le lancement (ouvre un nouvel onglet, que l'OS devrait intercepter)
    //         window.open(window.location.href, '_blank');
            
    //         // 3. Vérification après un court délai (1.5 seconde)
    //         // L'utilisateur DOIT avoir quitté l'onglet si le lancement a réussi.
    //         setTimeout(() => {
    //             // Si l'utilisateur est TOUJOURS dans l'onglet du navigateur (pas en mode standalone)
    //             if (!isRunningAsStandalone()) {
    //                 // Échec du lancement (l'app n'est probablement pas encore prête)
                    
    //                 // Mettre à jour le message pour le mode "Attente/Réessayer"
    //                 container.style.backgroundColor = '#ff9900'; // Couleur d'alerte (Orange)
    //                 container.innerHTML = `
    //                     <p style="margin: 0 0 10px 0; font-weight: bold;">⏳ Application non trouvée.</p>
    //                     <p style="margin: 0 0 15px 0;">Veuillez patienter quelques secondes de plus (finalisation Android) et **cliquer à nouveau**.</p>
    //                     <button id="open-app-link-retry" style="padding: 10px 25px; background-color: white; color: #ff9900; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">
    //                         Réessayer d'ouvrir l'application
    //                     </button>
    //                 `;
                    
    //                 // Rattacher l'événement de clic pour le bouton de réessai
    //                 document.getElementById('open-app-link-retry').addEventListener('click', (e) => {
    //                     // Simplement relancer la fonction de clic principale
    //                     handlePostInstallTransition(); 
    //                     e.target.removeEventListener('click', arguments.callee); // Nettoyage de l'ancien listener
    //                 });
                    
    //             } else {
    //                 // Le lancement a réussi (l'utilisateur est dans l'application)
    //                 // Cela ne s'exécutera pas car l'utilisateur ne sera plus sur cette page.
    //                 // Mais par sécurité, si l'on suppose un cas improbable :
    //                 container.style.display = 'none';
    //             }
    //         }, 1500); // 1.5 secondes pour vérifier
    //     });
    // }








    // // NOUVELLE FONCTION OU MISE À JOUR DE CELLE EXISTANTE
    // handlePostInstallTransition(initialAttempt = false) {
        
    //     // 1. Constantes
    //     const isRunningAsStandalone = () => (window.matchMedia('(display-mode: standalone)').matches);
    //     const containerId = 'pwa-transition-container';
    //     let container = document.getElementById(containerId);

    //     // Si l'utilisateur est déjà dans l'application, on masque le conteneur et on arrête
    //     if (isRunningAsStandalone()) {
    //          if (container) container.style.display = 'none';
    //          return; 
    //     }

    //     // 2. Création/Mise à jour du conteneur
    //     if (!container) {
    //         container = document.createElement('div');
    //         container.id = containerId;
    //         document.body.prepend(container); 
    //         // Ajouter les règles CSS pour l'animation de la roue (à faire une seule fois)
    //         if (!document.querySelector('style[data-spinner]')) {
    //              const style = document.createElement('style');
    //              style.setAttribute('data-spinner', true);
    //              style.textContent = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
    //              document.head.appendChild(style);
    //         }
    //     }
        
    //     // 3. Affichage initial (mode "Attente/Prêt à cliquer")
    //     container.style.cssText = `
    //         position: fixed; 
    //         top: 0; left: 0; width: 100%; padding: 15px; 
    //         background-color: #ff9900; /* Orange : Attente active */
    //         color: white; text-align: center; z-index: 9999;
    //         box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    //     `;
        
    //     // Contenu initial : État d'attente (avec bouton actif)
    //     container.innerHTML = `
    //         <p style="margin: 0 0 10px 0; font-weight: bold;">⏳ Finalisation de l'installation...</p>
    //         <div id="pwa-spinner" style="border: 4px solid rgba(255, 255, 255, 0.3); border-top: 4px solid white; border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite; margin: 0 auto 10px;"></div>
    //         <p style="margin: 0 0 15px 0;">Vous pouvez tenter d'ouvrir l'application maintenant ou attendre 5 secondes.</p>
    //         <button id="open-app-link-action" style="padding: 10px 25px; background-color: white; color: #ff9900; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">
    //             Ouvrir l'application (TENTER)
    //         </button>
    //     `;

    //     // 4. Logique du Clic (Réessayer/Tenter)
    //     document.getElementById('open-app-link-action').addEventListener('click', () => {
    //         const button = document.getElementById('open-app-link-action');
    //         button.textContent = "Tentative de lancement...";
    //         button.disabled = true;

    //         // Tenter le lancement
    //         window.open(window.location.href, '_blank');
            
    //         // Vérification après 1.5 seconde
    //         setTimeout(() => {
    //             // Si toujours là : Échec (l'app n'est pas prête)
    //             if (!isRunningAsStandalone()) {
                    
    //                 container.style.backgroundColor = '#d32f2f'; // Rouge : Échec de la tentative
    //                 container.innerHTML = `
    //                     <p style="margin: 0 0 10px 0; font-weight: bold;">❌ Lancement échoué.</p>
    //                     <p style="margin: 0 0 15px 0;">Veuillez patienter quelques secondes (finalisation Android) et **cliquer à nouveau**.</p>
    //                     <button id="open-app-link-action" style="padding: 10px 25px; background-color: white; color: #d32f2f; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">
    //                         Réessayer d'ouvrir l'application
    //                     </button>
    //                 `;
    //                 // Rattacher l'événement de clic au nouveau bouton
    //                 // On utilise le même ID car l'ancien élément a été remplacé
    //                 document.getElementById('open-app-link-action').addEventListener('click', () => {
    //                     this.handlePostInstallTransition(true);
    //                 });
                    
    //             } else {
    //                 // Lancement réussi (le code ne s'exécutera pas car la page est partie)
    //                 container.style.display = 'none';
    //             }
    //         }, 1500); 
    //     }, { once: true }); // Exécuter le listener une seule fois

    //     // 5. Mettre à jour en mode "Prêt" après un délai de sécurité (au cas où l'utilisateur n'ait pas cliqué)
    //     setTimeout(() => {
    //         if (!isRunningAsStandalone() && document.getElementById(containerId)) {
    //             // Si toujours dans le navigateur après 5 secondes, passer au mode "Prêt" (vert)
    //             container.style.backgroundColor = '#4CAF50';
    //             const button = document.getElementById('open-app-link-action');
    //             if (button && button.disabled) { // Si le bouton est encore désactivé (échec du premier clic)
    //                  button.textContent = "Ouvrir l'application (PRÊT)";
    //                  button.style.color = '#4CAF50';
    //                  button.disabled = false;
    //             }
                
    //             // Mettre à jour le message d'attente
    //             container.querySelector('p:first-child').innerHTML = `✅ **Installation finalisée !**`;
    //             if(container.querySelector('#pwa-spinner')) container.querySelector('#pwa-spinner').remove();

    //         }
    //     }, 5000); // Délai de sécurité de 5 secondes
    // }



    // NOUVELLE FONCTION OU MISE À JOUR DE CELLE EXISTANTE
    handlePostInstallTransition(initialAttempt = false) {
        
        // 1. Constantes
        // const isRunningAsStandalone = () => (window.matchMedia('(display-mode: standalone)').matches);
        const containerId = 'pwa-transition-container';
        let container = document.getElementById(containerId);

        // Si l'utilisateur est déjà dans l'application, on masque le conteneur et on arrête
        // if (isRunningAsStandalone()) {
        if (this.isAppInstalled() || document.getElementById(containerId)) {
            if (container) container.style.display = 'none';
            return; 
        }

        // 2. Création/Mise à jour du conteneur
        if (!container) {
            container = document.createElement('div');
            container.id = containerId;
            document.body.prepend(container); 
            // Ajouter les règles CSS pour l'animation de la roue (à faire une seule fois)
            if (!document.querySelector('style[data-spinner]')) {
                const style = document.createElement('style');
                style.setAttribute('data-spinner', true);
                style.textContent = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
                document.head.appendChild(style);
            }
        }
        
        // 3. Affichage initial (mode "Attente/Prêt à cliquer")
        container.style.cssText = `
            position: fixed; 
            top: 0; left: 0; width: 100%; padding: 15px; 
            background-color: #ff9900; /* Orange : Attente active */
            color: white; text-align: center; z-index: 9999;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        
        // Contenu initial : État d'attente (avec bouton actif et bouton de fermeture)
        container.innerHTML = `
            <button id="close-pwa-msg" style="position: absolute; top: 5px; right: 15px; background: none; border: none; color: white; font-size: 24px; cursor: pointer; line-height: 1;">&times;</button>
            
            <p style="margin: 0 0 10px 0; font-weight: bold;">⏳ Finalisation de l'installation de l'application...</p>
            <div id="pwa-spinner" style="border: 4px solid rgba(255, 255, 255, 0.3); border-top: 4px solid white; border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite; margin: 0 auto 10px;"></div>
            <p style="margin: 0 0 15px 0;">Veuillez attendre quelques secondes que l'installation soit terminée. Vous pouvez cliquer sur le bouton ci-dessous pour tenter le lancement.</p>
            
            <div>
                <button id="open-app-link-action" style="padding: 10px 25px; background-color: white; color: #ff9900; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; margin-right: 15px;">
                    Ouvrir l'application (TENTER)
                </button>
                <button id="hide-pwa-msg" style="padding: 10px 25px; background-color: transparent; color: white; border: 1px solid white; border-radius: 4px; font-weight: bold; cursor: pointer;">
                    Fermer ce message
                </button>
            </div>
        `;

        // 4. Logique du Clic (Réessayer/Tenter)
        document.getElementById('open-app-link-action').addEventListener('click', () => {
            const button = document.getElementById('open-app-link-action');
            
            // --- NOUVEAU : Récupérer le bouton de fermeture avant qu'il ne soit remplacé ---
            const closeButton = document.getElementById('hide-pwa-msg');
            if (closeButton) closeButton.style.display = 'none'; // Cacher le bouton de fermeture pendant la tentative

            button.textContent = "Tentative de lancement...";
            button.disabled = true;

            // Tenter le lancement
            window.open(window.location.href, '_blank');
            
            // Vérification après 1.5 seconde
            setTimeout(() => {
                // Si toujours là : Échec (l'app n'est pas prête)
                if (!isRunningAsStandalone()) {
                    
                    container.style.backgroundColor = '#d32f2f'; // Rouge : Échec de la tentative
                    container.innerHTML = `
                        <button id="close-pwa-msg" style="position: absolute; top: 5px; right: 15px; background: none; border: none; color: white; font-size: 24px; cursor: pointer; line-height: 1;">&times;</button>
                        
                        <p style="margin: 0 0 10px 0; font-weight: bold;">❌ Lancement échoué. L'application n'est pas encore prête.</p>
                        <p style="margin: 0 0 15px 0;">Veuillez patienter quelques secondes de plus (finalisation Android) et **cliquer à nouveau**.</p>
                        
                        <div>
                            <button id="open-app-link-action" style="padding: 10px 25px; background-color: white; color: #d32f2f; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; margin-right: 15px;">
                                Réessayer d'ouvrir l'application
                            </button>
                            <button id="hide-pwa-msg" style="padding: 10px 25px; background-color: transparent; color: white; border: 1px solid white; border-radius: 4px; font-weight: bold; cursor: pointer;">
                                Fermer ce message
                            </button>
                        </div>
                    `;
                    // Rattacher les événements de clic
                    document.getElementById('open-app-link-action').addEventListener('click', () => {
                        this.handlePostInstallTransition(true);
                    });
                    document.getElementById('hide-pwa-msg').addEventListener('click', () => {
                        container.remove();
                    });
                    document.getElementById('close-pwa-msg').addEventListener('click', () => {
                        container.remove();
                    });
                    
                } else {
                    // Lancement réussi (le code ne s'exécutera pas car la page est partie)
                    container.style.display = 'none';
                }
            }, 1500); 
        }, { once: true }); // Exécuter le listener une seule fois

        // 5. Mettre à jour en mode "Prêt" après un délai de sécurité (au cas où l'utilisateur n'ait pas cliqué)
        setTimeout(() => {
            if (!isRunningAsStandalone() && document.getElementById(containerId)) {
                // Si toujours dans le navigateur après 5 secondes, passer au mode "Prêt" (vert)
                container.style.backgroundColor = '#4CAF50';
                
                // Mettre à jour le message d'attente
                container.querySelector('p:first-child').innerHTML = `✅ **Installation finalisée !**`;
                container.querySelector('p:nth-child(3)').innerHTML = `L'application est prête ! Cliquez sur le bouton "Ouvrir" ci-dessous.`;
                if(container.querySelector('#pwa-spinner')) container.querySelector('#pwa-spinner').remove();

                // Mettre à jour les boutons (vert)
                const openButton = document.getElementById('open-app-link-action');
                const closeButton = document.getElementById('hide-pwa-msg');

                if (openButton) { 
                    openButton.textContent = "Ouvrir l'application (PRÊT)";
                    openButton.style.color = '#4CAF50';
                    openButton.disabled = false;
                }
                if (closeButton) {
                    closeButton.style.color = 'white';
                    closeButton.style.borderColor = 'white';
                }
            }
        }, 7000); // Délai de sécurité de 5 secondes

        // 6. Rattacher les événements de fermeture (pour l'état initial)
        document.getElementById('hide-pwa-msg').addEventListener('click', () => {
            container.remove();
        });
        document.getElementById('close-pwa-msg').addEventListener('click', () => {
            container.remove();
        });
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
                    // >>> DÉCLENCHEMENT DÉCALÉ ET CONTRÔLÉ <<<
                    // Maintenant, on est sûr que l'utilisateur a accepté.
                    // Mémoriser le statut : L'installation a eu lieu  ou a été lancée.
                    localStorage.setItem('pwaAccepted', 'true');
                    this.isInstallationAccepted = true;

                    this.handlePostInstallTransition(true);
                } else {
                    console.log('[PWA Installer] Installation refusée par l\'utilisateur');
                }
                
                this.deferredPrompt = null;
            } catch (error) {
                console.error('[PWA Installer] Erreur lors de l\'installation:', error);
                // this.showManualInstallInstructions();
                // Si une erreur survient APRÈS l'acceptation, nous assumons que l'installation a eu lieu.
                if (this.isInstallationAccepted) {
                    this.handlePostInstallTransition(); // Relancer la transition au lieu des instructions manuelles
                } else {
                    this.showManualInstallInstructions();
                }

            }
        } else {
            // Pas d'événement beforeinstallprompt disponible
            this.showManualInstallInstructions();

            // >>> NOUVELLE LOGIQUE POUR LE RE-CLIC SUR LE BOUTON D'INSTALLATION <<<
            // Si deferredPrompt est null, l'installation a soit été acceptée, soit elle n'est plus disponible.
            
            if (this.isInstallationAccepted) {
                console.log('[PWA Installer] Installation déjà acceptée. Relancement de la transition...');
                // Si l'utilisateur clique à nouveau, on relance la transition (le message orange/vert)
                this.handlePostInstallTransition(); 
            } else {
                // Pas d'événement disponible ET jamais accepté => Afficher les instructions manuelles
                this.showManualInstallInstructions();
            }


        }
    }




    // async uninstallApp() {
    //     console.log('[PWA Installer] Tentative de désinstallation...');
        
    //     // Instructions de désinstallation
    //     const userAgent = navigator.userAgent.toLowerCase();
    //     let instructions = 'Pour désinstaller cette application :\n\n';
        
    //     if (userAgent.includes('chrome') && userAgent.includes('mobile')) {
    //         instructions += '1. Maintenez appuyé sur l\'icône de l\'app\n' +
    //                       '2. Sélectionnez "Désinstaller" ou glissez vers "Supprimer"\n' +
    //                       '3. Confirmez la suppression';
    //     } else if (userAgent.includes('safari') && userAgent.includes('mobile')) {
    //         instructions += '1. Maintenez appuyé sur l\'icône de l\'app\n' +
    //                       '2. Appuyez sur le "X" qui apparaît\n' +
    //                       '3. Confirmez la suppression';
    //     } else {
    //         instructions += '1. Maintenez appuyé sur l\'icône de l\'application\n' +
    //                       '2. Sélectionnez "Désinstaller" ou "Supprimer"\n' +
    //                       '3. Confirmez la suppression\n\n' +
    //                       'Ou allez dans les paramètres du navigateur :\n' +
    //                       '• Applications installées\n' +
    //                       '• Trouvez cette app et désinstallez-la';
    //     }
        
    //     this.showUninstallModal(instructions);

    // }

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


