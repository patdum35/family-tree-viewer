import { state } from './main.js';
import { initSpeechSynthesis } from './treeAnimation.js';

/**
 * Module de gestion de l'interface utilisateur (UI) pour la sélection de voix
 * avec gestion de la connexion, priorisation linguistique et multilinguisme.
 */
const VoiceSelectorUI = (function() {
    let selectedVoice = null;
    const testPhrase = "Ceci est un test de la voix sélectionnée.";
    const appState = {
        isUIOpen: false,
        voices: [],
        status: 'Chargement des voix...'
    };
    
    // --- 1. GESTION DES TRADUCTIONS (i18n) ---
    const i18n = {
        'fr': {
            title: "Choisir une Voix",
            statusLoading: "Chargement des voix...",
            statusNoSupport: "⚠️ Votre navigateur ne supporte pas la synthèse vocale.",
            statusOffline: "Mode Hors-Ligne. Seules les voix locales sont affichées.",
            sectionLocal: "Voix Locales - ",
            sectionNetwork: "Voix Réseau (Nécessite connexion) - ",
            sectionCurrentLang: "Langue Actuelle",
            sectionOtherLangs: "Autres Langues",
            btnTest: "Tester la Voix",
            btnTestDisabled: "Sélectionnez une voix",
            voiceTypeLocal: "(Locale)",
            voiceTypeNetwork: "(Réseau)",
            testPhrase: "Bonjour, ceci est la voix sélectionnée.",
            btnRecord: "Enregistrer la Voix",
            statusRecording: "🎙️ Écoute en cours...",
            statusReady: "Appuyez sur le micro pour parler.",
        },
        'en': {
            title: "Select a Voice",
            statusLoading: "Loading voices...",
            statusNoSupport: "⚠️ Your browser does not support speech synthesis.",
            statusOffline: "Offline Mode. Only local voices are shown.",
            sectionLocal: "Local Voices - ",
            sectionNetwork: "Network Voices (Requires connection) - ",
            sectionCurrentLang: "Current Language",
            sectionOtherLangs: "Other Languages",
            btnTest: "Test Voice",
            btnTestDisabled: "Select a voice",
            voiceTypeLocal: "(Local)",
            voiceTypeNetwork: "(Network)",
            testPhrase: "Hello, this is the selected voice.",
            btnRecord: "Record Voice",
            statusRecording: "🎙️ Listening...",
            statusReady: "Press the mic to speak."
        },
        'es': {
            title: "Elegir una Voz",
            statusLoading: "Cargando voces...",
            statusNoSupport: "⚠️ Su navegador no soporta la síntesis de voz.",
            statusOffline: "Modo Desconectado. Solo se muestran las voces locales.",
            sectionLocal: "Voces Locales - ",
            sectionNetwork: "Voces de Red (Requiere conexión) - ",
            sectionCurrentLang: "Idioma Actual",
            sectionOtherLangs: "Otros Idiomas",
            btnTest: "Probar Voz",
            btnTestDisabled: "Selecciona una voz",
            voiceTypeLocal: "(Local)",
            voiceTypeNetwork: "(Red)",
            testPhrase: "Hola, esta es la voz seleccionada."
        },
        'hu': {
            title: "Válasszon Hangot",
            statusLoading: "Hangok betöltése...",
            statusNoSupport: "⚠️ A böngészője nem támogatja a beszédszintézist.",
            statusOffline: "Offline mód. Csak a helyi hangok láthatók.",
            sectionLocal: "Helyi Hangok - ",
            sectionNetwork: "Hálózati Hangok (Kapcsolat szükséges) - ",
            sectionCurrentLang: "Aktuális Nyelv",
            sectionOtherLangs: "Más Nyelvek",
            btnTest: "Hang Tesztelése",
            btnTestDisabled: "Válasszon egy hangot",
            voiceTypeLocal: "(Helyi)",
            voiceTypeNetwork: "(Hálózati)",
            testPhrase: "Helló, ez a kiválasztott hang."
        }
    };

    // Rendre la fonction de traduction accessible au module STT
    function translate(key) {
        const lang = window.CURRENT_LANGUAGE || 'fr';
        return i18n[lang][key] || i18n['fr'][key]; // Fallback au français
    }
    window.translate = translate; // EXPORTÉE POUR ÊTRE UTILISÉE PAR SPEECHRECOGNITIONUI
    
    /**
     * 2. FILTRAGE ET TRI DES VOIX
     */
    function filterAndSortVoices() {
        const currentLangShort = window.CURRENT_LANGUAGE || 'fr';
        
        let availableVoices = [...appState.voices];

        // 1. NON-CONNECTÉ : Filtrer pour ne garder QUE les voix locales
        if (state.isOnLine === false) {
            availableVoices = availableVoices.filter(voice => voice.localService);
            appState.status = translate('statusOffline');
        } else {
            appState.status = `${translate('sectionLocal') + translate('sectionNetwork')} (${availableVoices.length})`;
        }

        // --- Tri par Local/Réseau (2) ---
        const localVoices = availableVoices.filter(voice => voice.localService);
        const networkVoices = availableVoices.filter(voice => !voice.localService);

        // --- Tri par Langue (3) ---
        const getVoiceSections = (voices) => {
            const currentLangVoices = voices.filter(voice => voice.lang.startsWith(currentLangShort));
            const otherLangVoices = voices.filter(voice => !voice.lang.startsWith(currentLangShort));
            
            // Regrouper les autres langues pour les séparateurs (4)
            const groupedOtherLangs = otherLangVoices.reduce((acc, voice) => {
                const langCode = voice.lang.split('-')[0];
                if (!acc[langCode]) {
                    acc[langCode] = [];
                }
                acc[langCode].push(voice);
                return acc;
            }, {});

            return { currentLangVoices, groupedOtherLangs };
        };

        const local = getVoiceSections(localVoices);
        const network = getVoiceSections(networkVoices);

        return { local, network };
    }


    /**
     * 3. GESTION DE L'INTERFACE UTILISATEUR (UI)
     */
    // Crée la structure HTML de l'overlay et de la fenêtre de sélection
    function createUIStructure() {
        const overlayId = 'voice-selector-overlay';
        let overlay = document.getElementById(overlayId);

        if (overlay) {
            // Mise à jour des textes i18n si déjà créé
            document.getElementById('voice-selector-modal-title').textContent = translate('title');
            return overlay;
        }

        // Styles de base (minimaux pour compatibilité mobile/PC)
        const styles = {
            overlay: 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7); display: none; z-index: 10000; justify-content: center; align-items: center; overflow-y: auto;',
            modal: 'background: white; padding: 0; border-radius: 12px; max-width: 90%; width: 450px; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3); position: relative; margin: 20px 0; max-height: 90vh; display: flex; flex-direction: column;',
            voiceList: 'flex-grow: 1; overflow-y: auto; margin: 15px 20px; padding-right: 5px; max-height: 60vh;', // Espace maximisé
        };

        // --- Création de l'Overlay ---
        overlay = document.createElement('div');
        overlay.id = overlayId;
        overlay.style.cssText = styles.overlay;
        overlay.addEventListener('click', (e) => { if (e.target.id === overlayId) { hideUI(); } });

        // --- Création de la Modale ---
        const modal = document.createElement('div');
        modal.id = 'voice-selector-modal';
        modal.style.cssText = styles.modal;
        
        // --- NOUVEAU BANDEAU D'EN-TÊTE ---
        const header = document.createElement('div');
        header.style.cssText = `
            background-color: #D6E9F7; /* Bleu pastel */
            padding: 10px 15px; /* Réduction du padding */
            border-top-left-radius: 12px;
            border-top-right-radius: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        
        const titleElement = document.createElement('h2');
        titleElement.id = 'voice-selector-modal-title';
        titleElement.textContent = translate('title');
        titleElement.style.cssText = 'margin: 0; font-size: 1.2em; color: #333;'; // Réduction de la taille du titre
        header.appendChild(titleElement);
        
        // --- BOUTON DE FERMETURE AMÉLIORÉ ---
        const closeButton = document.createElement('button');
        closeButton.id = 'close-voice-ui';
        closeButton.innerHTML = '&times;';
        closeButton.style.cssText = `
            width: 30px; 
            height: 30px;
            line-height: 1; /* Assure que le X est bien centré */
            background-color: #dc3545; /* Rouge pour le fond */
            color: white; /* Blanc pour le X */
            border: none;
            border-radius: 50%; /* Rond */
            font-size: 1.5em; /* Agrandir le X */
            cursor: pointer;
            padding: 0; /* Suppression du padding par défaut */
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            transition: background-color 0.2s;
        `;
        closeButton.addEventListener('click', hideUI);
        header.appendChild(closeButton);

        modal.appendChild(header);
        
        
        // --- Zone de Statut et de Liste ---
        const contentContainer = document.createElement('div');
        contentContainer.style.cssText = 'padding: 0 20px 20px 20px;';
        
        contentContainer.innerHTML = `
            <p id="voice-status-display" style="font-size: 0.9em; color: #666; margin: 10px 0;">${translate('statusLoading')}</p>
            <div id="voice-list-options" style="${styles.voiceList.replace('margin: 15px 20px;', 'margin: 0 0 15px 0; padding-right: 5px;')}">
            </div>

            <div style="display: flex; gap: 10px; margin-top: 15px;">
                <button id="test-selected-voice" disabled style="padding: 12px; background-color: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1em; flex-grow: 1;">
                    ${translate('btnTestDisabled')}
                </button>
            </div>
        `;
        // NOTE : Les éléments stt-container et record-voice-button ont été retirés
        
        modal.appendChild(contentContainer);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Association des événements
        document.getElementById('test-selected-voice').addEventListener('click', testVoice);
        // NOTE : L'événement d'enregistrement a été retiré

    }


    // Met à jour le contenu de l'UI (liste des voix)
    function renderUI() {
        const listContainer = document.getElementById('voice-list-options');
        const statusDisplay = document.getElementById('voice-status-display');
        const testButton = document.getElementById('test-selected-voice');
        const voiceStyles = document.getElementById('voice-selector-modal').querySelector('#voice-list-options').style.cssText;
        
        if (!listContainer || !statusDisplay) return;

        // Mise à jour des textes multilingues
        document.getElementById('voice-selector-modal-title').textContent = translate('title');
        testButton.textContent = selectedVoice ? translate('btnTest') : translate('btnTestDisabled');

        listContainer.innerHTML = ''; // Nettoyer
        statusDisplay.textContent = appState.status;
        testButton.disabled = !selectedVoice;

        
        const sortedVoices = filterAndSortVoices();
        
        // On utilise selectedVoice qui est initialisé par loadVoices
        const currentlySelectedVoiceURI = state.selectedVoice ? state.selectedVoice.voiceURI : null;

        /**
         * Fonction utilitaire pour ajouter un séparateur dans la liste (4)
         */
        function addSeparator(title, subtitle = '', type = '', langCode = '') {
            const sep = document.createElement('div');
            sep.style.cssText = 'margin: 15px 0 5px 0; padding-top: 5px; border-top: 2px solid #ccc; font-weight: bold; color: #333;';
            
            // --- LOGIQUE DE COULEUR AJOUTÉE ---
            let color = '#333';
            let borderColor = '#ccc';
            
            if (type === 'local') {
                color = '#007bff'; // Bleu pour Local
                borderColor = '#007bff';
            } else if (type === 'network') {
                color = '#dc3545'; // Rouge pour Réseau
                borderColor = '#dc3545';
            }

            if (langCode === (window.CURRENT_LANGUAGE || 'fr')) {
                color = '#28a745'; // Vert pour la langue actuelle
                borderColor = '#28a745';
            }
            
            // Appliquer les styles
            sep.style.borderTopColor = borderColor;
            
            // Contenu du séparateur
            sep.innerHTML = `
                <span style="font-weight: bold; font-size: 1.1em; margin-right: 10px; color: ${color};">${title}</span>
                <small style="font-weight: normal; color: #6c757d;">${subtitle}</small>
            `;
            // --- FIN LOGIQUE DE COULEUR ---
            
            listContainer.appendChild(sep);
        }

        /**
         * Fonction utilitaire pour insérer les options de voix
         */
        function insertVoiceOptions(voices, type) {
            voices.forEach(voice => {
                const button = document.createElement('button');
                button.className = 'voice-option';
                
                const isSelected = selectedVoice && selectedVoice.voiceURI === voice.voiceURI;
                
                // Styles de base du bouton
                button.style.cssText = 'display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 10px; margin-bottom: 8px; border-radius: 6px; background-color: #f8f9fa; border: 1px solid #dee2e6; cursor: pointer; transition: background-color 0.2s, border-color 0.2s; text-align: left; font-size: 0.95em;';

                // Style de sélection
                if (isSelected) {
                    button.style.borderColor = '#28a745';
                    button.style.backgroundColor = '#d4edda';
                }

                const voiceTypeLabel = voice.localService ? translate('voiceTypeLocal') : translate('voiceTypeNetwork');

                button.innerHTML = `
                    <span>
                        <strong>${voice.name}</strong> 
                        <small style="color: #6c757d;">${voiceTypeLabel}</small>
                    </span>
                    <span style="font-size: 0.8em; color: #495057;">${voice.lang}</span>
                `;

                button.addEventListener('click', () => {
                    handleVoiceSelection(voice);
                });

                listContainer.appendChild(button);
            });
        }
        
        // ------------------ VOIX LOCALES ------------------
        if (sortedVoices.local.currentLangVoices.length > 0 || Object.keys(sortedVoices.local.groupedOtherLangs).length > 0) {
            
            // Changement ici : on passe le type 'local' et la langue actuelle
            addSeparator(translate('sectionLocal') + translate('sectionCurrentLang'), '', 'local', window.CURRENT_LANGUAGE);
            insertVoiceOptions(sortedVoices.local.currentLangVoices, 'local');
            
            for (const langCode in sortedVoices.local.groupedOtherLangs) {
                // Changement ici : on passe le type 'local' et la langue secondaire
                addSeparator(translate('sectionLocal') + langCode.toUpperCase(), translate('sectionOtherLangs'), 'local', langCode);
                insertVoiceOptions(sortedVoices.local.groupedOtherLangs[langCode], 'local');
            }
        }
        
        // ------------------ VOIX RÉSEAU (si connecté) ------------------
        if (state.isOnLine && (sortedVoices.network.currentLangVoices.length > 0 || Object.keys(sortedVoices.network.groupedOtherLangs).length > 0)) {
            
            // Changement ici : on passe le type 'network' et la langue actuelle
            addSeparator(translate('sectionNetwork') + translate('sectionCurrentLang'), '', 'network', window.CURRENT_LANGUAGE);
            insertVoiceOptions(sortedVoices.network.currentLangVoices, 'network');

             for (const langCode in sortedVoices.network.groupedOtherLangs) {
                // Changement ici : on passe le type 'network' et la langue secondaire
                addSeparator(translate('sectionNetwork') + langCode.toUpperCase(), translate('sectionOtherLangs'), 'network', langCode);
                insertVoiceOptions(sortedVoices.network.groupedOtherLangs[langCode], 'network');
            }
        }

    }

    // Logique de sélection d'une voix
    function handleVoiceSelection(voice) {
        selectedVoice = voice;
        
        // Désélectionner/Resélectionner visuellement (méthode simple)
        document.querySelectorAll('#voice-list-options .voice-option').forEach(btn => {
            btn.style.borderColor = '#dee2e6';
            btn.style.backgroundColor = '#f8f9fa';
        });

        const allButtons = document.querySelectorAll('#voice-list-options .voice-option');
        for (const btn of allButtons) {
            // Une recherche un peu plus robuste que sur l'innerHTML
            if (btn.querySelector('strong').textContent.includes(voice.name.split('(')[0].trim())) {
                btn.style.borderColor = '#28a745';
                btn.style.backgroundColor = '#d4edda';
                break;
            }
        }
        
        const testButton = document.getElementById('test-selected-voice');
        testButton.disabled = false;
        testButton.textContent = translate('btnTest');

        console.log("Voix sélectionnée:", selectedVoice.name);
        state.selectedVoice = selectedVoice;

        // Initialiser la synthèse vocale si ce n'est pas déjà fait
        initSpeechSynthesis(state.selectedVoice);

        state.speechSynthesisInitialized = true;
        state.frenchVoice = state.selectedVoice;

        localStorage.setItem('selectedVoice', selectedVoice.name);
    }

    /**
     * Fonction pour trouver la voix par son nom et l'initialiser comme sélectionnée.
     */
    function setInitialVoiceByName(voiceName) {
        if (!voiceName) return;

        // Tenter de trouver la voix dans la liste actuelle
        const foundVoice = appState.voices.find(voice => voice.name === voiceName);

        if (foundVoice) {
            selectedVoice = foundVoice;
            console.log(`✅ Voix persistante chargée: ${selectedVoice.name}`);

            state.selectedVoice = selectedVoice;

            // Initialiser la synthèse vocale si ce n'est pas déjà fait
            initSpeechSynthesis(state.selectedVoice);

            state.speechSynthesisInitialized = true;
            state.frenchVoice = state.selectedVoice;

        } else {
            console.warn(`⚠️ Voix persistante "${voiceName}" non trouvée. Utilisation de la voix par défaut.`);
        }
    }


    /**
     * 4. FONCTIONS PUBLIQUES (API)
     */
    function loadVoices() {
        if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
            appState.status = translate('statusNoSupport');
            return false;
        }

        appState.voices = window.speechSynthesis.getVoices();
        
        if (appState.voices.length > 0) {
            // Mise à jour du statut général après le chargement pour affichage initial
            if (state.isOnLine === false) {
                 appState.status = translate('statusOffline');
            } else {
                 appState.status = `${translate('sectionLocal') + translate('sectionNetwork')} (${appState.voices.length} voix totales)`;
            }

            // === ÉTAPE IMPORTANTE : INITIALISATION ===
            // 1. Récupérer le nom de la voix sauvegardée
            const storedVoiceName = localStorage.getItem('selectedVoice');

            // 2. Initialiser la voix sélectionnée avec ce nom
            setInitialVoiceByName(storedVoiceName); 
            // ===============================================

            if (appState.isUIOpen) {
                renderUI(); // Re-render si l'UI est déjà ouverte
            }
        }
        return true;
    }

    function showUI() {
        if (!loadVoices()) {
             alert(appState.status);
             return;
        }

        const overlay = createUIStructure();
        appState.isUIOpen = true;
        overlay.style.display = 'flex';
        renderUI();
    }

    function hideUI() {
        const overlay = document.getElementById('voice-selector-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
        appState.isUIOpen = false;
        window.speechSynthesis.cancel(); 
    }

    function testVoice() {
        if (!selectedVoice) return;
        
        window.speechSynthesis.cancel(); 

        const utterance = new SpeechSynthesisUtterance(translate('testPhrase'));
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
        
        window.speechSynthesis.speak(utterance);
    }

    function getSelectedVoice() {
        return selectedVoice;
    }


    // Écouter l'événement 'voiceschanged' pour s'assurer que les voix sont chargées
    if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
        if (window.speechSynthesis.getVoices().length > 0) {
            loadVoices();
        }
    }

    // --- Créer l'UI dès l'initialisation du module (une seule fois) ---
    createUIStructure();


    return {
        showUI: showUI,
        getSelectedVoice: getSelectedVoice,
        loadVoices: loadVoices
    };

})();













/**
 * Module de gestion de l'interface utilisateur (UI) pour la reconnaissance vocale (STT)
 */
const SpeechRecognitionUI = (function() {
    
    // NOTE : Utilisation de la fonction translate exportée depuis VoiceSelectorUI
    const translate = window.translate; 
    
    // --- Variables d'État et d'API (extraites de VoiceSelectorUI) ---
    let recognition = null;
    let isRecording = false;
    let cumulativeTranscript = ''; // Texte accumulé en mode continu
    
    // MAPPING DES LANGUES pour STT (plus fiable en format complet, tiré de l'original)
    const langMap = {
        'fr': 'fr-FR',
        'en': 'en-US',
        'es': 'es-ES',
        'hu': 'hu-HU'
    };
    const currentLang = window.CURRENT_LANGUAGE || 'fr';
    const targetLang = langMap[currentLang] || currentLang;
    
    // --- Fonctions d'Initialisation et de Structure ---

    function createUIStructure() {
        const overlayId = 'stt-only-overlay';
        const existingOverlay = document.getElementById(overlayId);
        if (existingOverlay) return existingOverlay;
        
        // --- Styles de base pour la modale ---
        const overlay = document.createElement('div');
        overlay.id = overlayId;
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background-color: rgba(0, 0, 0, 0.7); display: none;
            justify-content: center; align-items: center; z-index: 10000;
        `;

        const modal = document.createElement('div');
        modal.style.cssText = `
            background-color: white; padding: 20px; border-radius: 12px;
            max-width: 400px; width: 90%; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
            font-family: Arial, sans-serif;
        `;
        
        // --- Contenu HTML de la modale ---
        modal.innerHTML = `
            <h3 style="margin-top: 0; display: flex; justify-content: space-between; align-items: center;">
                Saisie Vocale (Langue : ${targetLang})
                <button id="close-stt-button" style="background: none; border: none; font-size: 1.5em; cursor: pointer; color: #dc3545; padding: 0;">&times;</button>
            </h3>
            
            <div id="stt-container" style="margin-top: 10px; padding: 10px; border: 1px solid #ccc; border-radius: 6px; background-color: #f9f9f9;">
                <p style="margin-bottom: 5px; font-size: 0.9em; font-weight: bold;">Résultat de la Reconnaissance Vocale:</p>
                <div id="stt-result-display" style="min-height: 1.2em; color: #333; font-style: italic;">
                    ${translate('statusReady')}
                </div>
                <span id="stt-interim-display" style="color: #888; font-style: italic;"></span>
            </div>

            <div style="display: flex; justify-content: center; margin-top: 20px;">
                <button id="record-voice-button" style="padding: 15px 30px; font-size: 1.2em; cursor: pointer; border: none; border-radius: 8px; background-color: #007bff; color: white; display: flex; align-items: center; gap: 10px; flex-grow: 1; justify-content: center;">
                    <span id="record-icon" style="font-size: 1.5em;">🎙️</span> 
                    <span id="record-text">${translate('btnRecord')}</span>
                </button>
            </div>
        `;

        // 1. Attachement des Événements
        modal.querySelector('#record-voice-button').addEventListener('click', toggleSpeechRecognition);
        modal.querySelector('#close-stt-button').addEventListener('click', hideUI);
        overlay.addEventListener('click', (e) => {
            if (e.target.id === overlayId) hideUI();
        });

        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        return overlay;
    }

    // --- Fonctions de Reconnaissance Vocale (tirées de l'original) ---
    






    // --- Fonctions d'Action Simples (À intégrer ou à importer) ---
    function ouvrirSelectionAction() {
        console.log("ACTION: Ouverture de la modale de sélection de voix.");
        // VoiceSelectorUI.showUI(); // Fonction réelle
    }

    function voixSuivanteAction() {
        console.log("ACTION: Passage à la voix TTS suivante (non implémenté ici).");
        // Logique pour itérer sur state.voices et appeler initSpeechSynthesis(nouvelleVoix)
    }

    function arreterLectureAction() {
        console.log("ACTION: Arrêt de la lecture TTS en cours.");
        window.speechSynthesis.cancel(); 
    }

    // --- Dictionnaire de Mots-Clés et Actions (Le Cœur du système) ---
    const commandActionMap = {
        'ouvrir la sélection': ouvrirSelectionAction,
        'passer à la voix suivante': voixSuivanteAction,
        'arrêter la lecture': arreterLectureAction
        // Ajoutez ici d'autres commandes
    };







    /**
     * Logique à intégrer dans la fonction initializeSpeechRecognition()
     * de votre module speechRecognitionUI.js
     */
    function initializeSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.error("Speech Recognition non supporté.");
            return;
        }
        
        // Si déjà initialisé, on arrête
        if (recognition) return; 

        recognition = new SpeechRecognition();
        
        // Réinitialisation des variables si elles ne sont pas gérées par la portée du module
        cumulativeTranscript = ''; 
        isRecording = false;
        
        // --- 1. Dictionnaire de Grammaire (Votre code) ---
        const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
        const commands = Object.keys(commandActionMap); // Utiliser les clés du dictionnaire comme commandes
        
        // Création de la grammaire JSGF
        const grammar = '#JSGF V1.0; grammar commands; public <command> = ' + commands.join(' | ') + ' ;';
        
        const speechRecognitionList = new SpeechGrammarList();
        speechRecognitionList.addFromString(grammar, 1); // Poids (priorité) de 1

        // Ajout de la grammaire à l'objet recognition
        recognition.grammars = speechRecognitionList;
        // ----------------------------------------------------

        // --- 2. Configuration et onresult ---
        recognition.lang = targetLang; 
        recognition.continuous = true; 
        recognition.interimResults = true; 
        
        // recognition.onresult = (event) => {
        //     let interimTranscript = '';
            
        //     for (let i = event.resultIndex; i < event.results.length; i++) {
        //         const result = event.results[i];
        //         const transcriptSegment = result[0].transcript.trim().toLowerCase(); 

        //         if (result.isFinal) {
        //             // Le segment est final : on l'ajoute à la transcription complète
        //             cumulativeTranscript += transcriptSegment + ' '; 
                    
        //             // === LOGIQUE DE DÉTECTION DE COMMANDE ===
        //             // Vérifier si la transcription correspond à une commande exacte
        //             const detectedCommand = commands.find(cmd => transcriptSegment.includes(cmd));
                    
        //             if (detectedCommand) {
        //                 console.log(`Commande Détectée: "${detectedCommand}"`);
        //                 // Exécuter l'action associée
        //                 commandActionMap[detectedCommand](); 
                        
        //                 // Optionnel : Arrêter l'écoute après une commande pour éviter les interférences
        //                 // recognition.stop();
                        
        //                 // Vider le transcript pour ne pas afficher la commande dans le résultat
        //                 cumulativeTranscript = '';
                        
        //             } else {
        //                 // Si ce n'est pas une commande, c'est du texte normal
        //                 console.log("Texte normal reconnu:", transcriptSegment);
        //             }
        //             // =========================================

        //         } else {
        //             interimTranscript += transcriptSegment;
        //         }
        //     }

        //     // Mise à jour de l'affichage UI
        //     document.getElementById('stt-result-display').textContent = cumulativeTranscript;
        //     document.getElementById('stt-interim-display').textContent = interimTranscript; 
        // };


        recognition.onstart = () => {
            // Redéfinit la langue (pour la robustesse Android)
            recognition.lang = targetLang; 
            // Mise à jour de l'UI au moment où l'écoute commence réellement
            updateButtonUI(true); // <-- APPEL POUR CHANGER LE TEXTE ET LA COULEUR
        };


        recognition.onresult = (event) => {
            let interimTranscript = '';
            
            // --- NOUVEAU : Démarrer la boucle à l'index où le dernier résultat final a été trouvé ---
            // Sur PC, event.resultIndex est souvent mis à jour automatiquement.
            // Sur Mobile/Android, cela garantit de ne pas retraiter les anciens résultats finaux.
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                const transcriptSegment = result[0].transcript.trim().toLowerCase(); 

                if (result.isFinal) {
                    
                    // Si c'est une commande, ne pas l'ajouter au transcript
                    const isCommand = commands.find(cmd => transcriptSegment.includes(cmd));
                    
                    if (isCommand) {
                        // Exécuter l'action et potentiellement arrêter l'écoute
                        commandActionMap[isCommand](); 
                        
                    } else {
                        // Ajouter uniquement si ce n'est PAS une commande
                        cumulativeTranscript += transcriptSegment + ' '; 
                    }
                    
                } else {
                    // C'est un résultat en cours
                    interimTranscript += transcriptSegment;
                }
            }

            // Afficher le texte accumulé (final)
            document.getElementById('stt-result-display').textContent = cumulativeTranscript;
            
            // Afficher le texte provisoire (intermédiaire)
            document.getElementById('stt-interim-display').textContent = interimTranscript; 


            // Note : Le texte final est maintenant dans cumulativeTranscript
            // Si vous lancez speakText ou la traduction, utilisez cumulativeTranscript
            if (event.results[event.results.length - 1].isFinal) {
                // Lancer la lecture ou la traduction UNIQUEMENT ici si vous voulez lire la phrase entière
                speakText(cumulativeTranscript);
            }


        };



        // // Événement lorsque la reconnaissance s'arrête
        // recognition.onend = () => {
        //     isRecording = false;
        //     document.getElementById('record-icon').textContent = '🎙️';
        //     document.getElementById('stt-result-display').style.color = '#333';
        //     document.getElementById('record-text').textContent = translate('btnRecord');
        //     document.getElementById('record-voice-button').style.backgroundColor = '#007bff';
        //     console.log("Reconnaissance Vocale arrêtée.");
        // };

        

       // Événement lorsque la reconnaissance s'arrête
        // recognition.onend = () => {
            
        //     // Si l'utilisateur n'a PAS cliqué sur 'Arrêter l'écoute', on redémarre
        //     if (isRecording) {
        //         console.log("⚠️ Redémarrage automatique de la reconnaissance (limite mobile atteinte).");
        //         // On redémarre l'écoute immédiatement
        //         try {
        //             recognition.start();
        //         } catch(e) {
        //             // Empêche les erreurs si on essaie de démarrer pendant une phase d'arrêt
        //             console.warn("Erreur au redémarrage :", e.message);
        //         }
                
        //     } else {
        //         // C'est un arrêt volontaire par l'utilisateur (toggleSpeechRecognition)
        //         console.log("Reconnaissance Vocale arrêtée volontairement.");
        //         // Réinitialisation de l'UI
        //         document.getElementById('record-icon').textContent = '🎙️';
        //         document.getElementById('record-text').textContent = translate('btnRecord');
        //         document.getElementById('record-voice-button').style.backgroundColor = '#007bff';
        //     }
            
        //     // Note : On ne met plus isRecording à false ici pour ne pas casser le redémarrage.
        //     // Il sera mis à false seulement dans toggleSpeechRecognition.
        // };


        recognition.onend = () => {
            // Si l'utilisateur n'a PAS cliqué sur 'Arrêter l'écoute' (isRecording est toujours true), on redémarre
            if (isRecording) { 
                console.log("⚠️ Redémarrage automatique de la reconnaissance (limite mobile atteinte).");
                try {
                    recognition.start();
                } catch(e) {
                    console.warn("Erreur au redémarrage :", e.message);
                }
            } else {
                // Arrêt volontaire
                updateButtonUI(false); // <-- MISE À JOUR VISUELLE POUR L'ARRÊT
                console.log("Reconnaissance Vocale arrêtée volontairement.");
            }
        };






        // Événement en cas d'erreur
        recognition.onerror = (event) => {
            document.getElementById('stt-result-display').textContent = `Erreur de reconnaissance: ${event.error}`;
            document.getElementById('stt-result-display').style.color = 'red';
            isRecording = false;
            document.getElementById('record-icon').textContent = '🎙️';
            document.getElementById('record-text').textContent = translate('btnRecord');
            document.getElementById('record-voice-button').style.backgroundColor = '#007bff';

            updateButtonUI(false); // <-- MISE À JOUR VISUELLE EN CAS D'ERREUR
            console.error("Erreur STT:", event.error);
        };
    }










    // function initializeSpeechRecognition() {
    //     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    //     if (SpeechRecognition) {
    //         recognition = new SpeechRecognition();
            
    //         // Appliquer la langue au moment de l'initialisation
    //         recognition.lang = targetLang; 
            
    //         // Paramètres de base
    //         recognition.continuous = true; 
    //         recognition.interimResults = true; 

    //         // --- NOUVEAU : WORKAROUND DANS ONSTART ---
    //         recognition.onstart = () => {
    //             // Redéfinit la langue pour forcer le moteur Android à la prendre en compte
    //             recognition.lang = targetLang; 
    //             document.getElementById('record-text').textContent = 'Arrêter l\'écoute';
    //         };
    //         // ----------------------------------------

    //         recognition.onresult = (event) => {
    //             let interimTranscript = '';
                
    //             // Parcourir tous les résultats
    //             for (let i = event.resultIndex; i < event.results.length; i++) {
    //                 const result = event.results[i];
    //                 const transcriptSegment = result[0].transcript; 

    //                 if (result.isFinal) {
    //                     // Le segment est final : on l'ajoute à la transcription complète
    //                     cumulativeTranscript += transcriptSegment + ' '; // Ajout d'un espace pour la lisibilité
    //                 } else {
    //                     // C'est un résultat en cours
    //                     interimTranscript += transcriptSegment;
    //                 }
    //             }

    //             // Afficher le texte accumulé (final)
    //             document.getElementById('stt-result-display').textContent = cumulativeTranscript;
                
    //             // Afficher le texte provisoire (intermédiaire)
    //             document.getElementById('stt-interim-display').textContent = interimTranscript; 


    //             // Note : Le texte final est maintenant dans cumulativeTranscript
    //             // Si vous lancez speakText ou la traduction, utilisez cumulativeTranscript
    //             if (event.results[event.results.length - 1].isFinal) {
    //                 // Lancer la lecture ou la traduction UNIQUEMENT ici si vous voulez lire la phrase entière
    //                 speakText(cumulativeTranscript);
    //             }


    //         };

            
    //         // Événement lorsque la reconnaissance s'arrête
    //         recognition.onend = () => {
    //             isRecording = false;
    //             document.getElementById('record-icon').textContent = '🎙️';
    //             document.getElementById('stt-result-display').style.color = '#333';
    //             document.getElementById('record-text').textContent = translate('btnRecord');
    //             document.getElementById('record-voice-button').style.backgroundColor = '#007bff';
    //             console.log("Reconnaissance Vocale arrêtée.");
    //         };
            
    //         // Événement en cas d'erreur
    //         recognition.onerror = (event) => {
    //             document.getElementById('stt-result-display').textContent = `Erreur de reconnaissance: ${event.error}`;
    //             document.getElementById('stt-result-display').style.color = 'red';
    //             isRecording = false;
    //             document.getElementById('record-icon').textContent = '🎙️';
    //             document.getElementById('record-text').textContent = translate('btnRecord');
    //             document.getElementById('record-voice-button').style.backgroundColor = '#007bff';
    //             console.error("Erreur STT:", event.error);
    //         };

    //     } else {
    //         console.error("Speech Recognition non supporté par ce navigateur.");
    //         // Désactiver le bouton si non supporté
    //         const recordButton = document.getElementById('record-voice-button');
    //         if (recordButton) recordButton.disabled = true;
    //     }
    // }
    



// DANS speechRecognitionUI.js (Nouveau bloc à insérer)

// --- Fonction utilitaire de mise à jour de l'UI du bouton ---
function updateButtonUI(isListening) {
    const button = document.getElementById('record-voice-button');
    const icon = document.getElementById('record-icon');
    const text = document.getElementById('record-text');
    const resultDisplay = document.getElementById('stt-result-display');
    
    if (!button || !icon || !text || !resultDisplay) return;

    if (isListening) {
        button.style.backgroundColor = '#dc3545'; // Rouge
        icon.textContent = '🔴'; 
        text.textContent = "Arrêter l'écoute"; // <-- NOUVEAU TEXTE
        resultDisplay.textContent = translate('statusRecording');
        resultDisplay.style.color = '#dc3545';
    } else {
        button.style.backgroundColor = '#007bff'; // Bleu
        icon.textContent = '🎙️'; 
        text.textContent = translate('btnRecord');
        resultDisplay.textContent = translate('statusReady');
        resultDisplay.style.color = '#333';
    }
}







    // Fonction appelée par le clic sur le bouton 'Micro'
    function toggleSpeechRecognition() {
        if (!recognition) {
            initializeSpeechRecognition();
            if (!recognition) return; // Si non supporté après initialisation
        }

        if (isRecording) {
            // Arrêter l'enregistrement
            // Arrêt volontaire
            isRecording = false; // <-- ESSENTIEL : C'est le drapeau pour le onend
            recognition.stop();
        } else {
            
            // Étape 1 : Définir la langue avant de commencer
            recognition.lang = targetLang;
            isRecording = true; // <-- ESSENTIEL : Lève le drapeau pour autoriser le redémarrage
            cumulativeTranscript = '';
            document.getElementById('stt-result-display').textContent = '';

            // Démarrer l'enregistrement
            try {
                recognition.start();
                // document.getElementById('record-icon').textContent = '🔴'; // Icône d'enregistrement
                // document.getElementById('stt-result-display').textContent = translate('statusRecording');
                // document.getElementById('stt-result-display').style.color = '#dc3545';
                // document.getElementById('record-voice-button').style.backgroundColor = '#dc3545';
                // console.log("Reconnaissance Vocale démarrée...");

                // Annuler la parole TTS en cours si on commence l'enregistrement
                window.speechSynthesis.cancel(); 

            } catch (e) {
                console.error("Erreur au démarrage de la reconnaissance:", e);
                document.getElementById('stt-result-display').textContent = "Erreur au démarrage. Veuillez vérifier les permissions.";
                document.getElementById('stt-result-display').style.color = 'red';
                isRecording = false; // Échec du démarrage
                updateButtonUI(false);

            }
        }
    }

    // --- Fonctions Publiques ---

    function showUI() {
        const overlay = createUIStructure();
        // S'assurer que la reconnaissance est initialisée avant l'affichage
        if (!recognition) initializeSpeechRecognition(); 
        
        // Réinitialiser le statut affiché
        document.getElementById('stt-result-display').textContent = translate('statusReady');
        document.getElementById('stt-result-display').style.color = '#333';

        overlay.style.display = 'flex';
    }

    function hideUI() {
        const overlay = document.getElementById('stt-only-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
        // S'assurer que l'enregistrement est coupé lors de la fermeture
        if (isRecording && recognition) {
            recognition.stop(); 
        }
    }

    // Création de l'UI au chargement du module
    createUIStructure();

    return {
        showUI: showUI,
        hideUI: hideUI,
        getTranscript: () => cumulativeTranscript // Utile pour récupérer le texte final
    };

})();















export function speakText(text) {
    const voiceToUse = VoiceSelectorUI.getSelectedVoice();
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (voiceToUse) {
        utterance.voice = voiceToUse;
        utterance.lang = voiceToUse.lang;
        window.speechSynthesis.speak(utterance);
    } else {
        console.warn("Pas de voix sélectionnée pour speakText.");
    }
}



export function voiceModal() {
    VoiceSelectorUI.showUI();
}

export function loadVoices() {
    VoiceSelectorUI.loadVoices()
}


export function voiceCommand() {
    SpeechRecognitionUI.showUI();
}