import { state, loadData } from './main.js';
import { initSpeechSynthesis } from './treeAnimation.js';
import { makeModalDraggableAndResizable, makeModalInteractive } from './resizableModalUtils.js';
import { findPersonsBy } from './searchModalUI.js';
import { displayPersonDetails, readPersonSheet } from './modalWindow.js'





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
            testPhrase: "Bonjour, ceci est la voix sélectionnée."
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



            // NOUVELLE LOGIQUE : Sélectionner une voix par défaut si aucune n'est sélectionnée
            if (!selectedVoice) {
                const defaultVoice = findDefaultVoice(window.CURRENT_LANGUAGE || 'fr');
                if (defaultVoice) {
                    handleVoiceSelection(defaultVoice); // Utiliser handleVoiceSelection pour tout initialiser
                    console.log(`✅ Voix locale par défaut sélectionnée: ${defaultVoice.name}`);
                } else {
                    console.warn(`⚠️ Aucune voix locale par défaut trouvée pour la langue ${window.CURRENT_LANGUAGE}.`);
                    // Fallback ultime : prendre la première voix disponible
                    if (appState.voices.length > 0) {
                        handleVoiceSelection(appState.voices[0]);
                        console.warn(`⚠️ Aucune voix locale par défaut trouvée. Première voix disponible utilisée: ${appState.voices[0].name}`);
                    }
                }
            }




            if (appState.isUIOpen) {
                renderUI(); // Re-render si l'UI est déjà ouverte
            }
        }
        return true;
    }




    /**
     *  Recherche une voix locale correspondant à la langue
     */
    function findDefaultVoice(lang) {
        const langPrefix = lang.toLowerCase().split('-')[0];

        // 1. Chercher une voix LOCALE correspondant exactement à la langue de l'application
        let voice = appState.voices.find(v => v.lang.toLowerCase().startsWith(langPrefix) && v.localService);
        
        if (voice) return voice;

        // 2. Si aucune voix LOCALE n'est trouvée, chercher une voix RÉSEAU (si en ligne) dans la langue
        if (state.isOnLine) {
             voice = appState.voices.find(v => v.lang.toLowerCase().startsWith(langPrefix));
             if (voice) return voice;
        }

        // 3. Dernière chance : Chercher une voix LOCALE dans n'importe quelle langue
        voice = appState.voices.find(v => v.localService);
        if (voice) return voice;
        
        return null; // Rien trouvé
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









/*
 * Module de gestion de l'interface utilisateur (UI) pour la reconnaissance vocale (STT)
 * VERSION FINALE STABLE V12.2 (Ajout des champs éditables pour la correction manuelle).
 */

let localConfig = null;
const SpeechRecognitionUI = (function() {
    // --- 1. GESTION DES TRADUCTIONS (i18n) ---
    const i18n = {
        'fr': {
            btnRecord: 'Parlez',
            btnEraseRecord: 'Effacez <br>&Parlez',
            btnStopListening : "Arrêter l'écoute",

            statusRecording: '🎙️ Écoute en cours...',
            statusReady: 'Appuyez sur le micro pour parler.',
            readSheet: 'lire la fiche de',
            search: 'chercher',
            research: 'rechercher',            
            whenBorn: 'quand est ne',
            whenDead: 'quand est mort',
            whenDeadW: 'quand est morte',
            whenDied: 'quand est decede',
            whatAge : 'quel age a',
            whatAgePast : 'quel age avait',
            whereLive: 'ou habite',            
            whereLivePast: 'ou habitait',
            whatProfession: 'quelle est la profession de',
            whatProfessionPast: 'quelle était la profession de', 
            whatOccupation: 'quel est le metier de',
            whatOccupationPast: 'quel etait le metier de', 
            whoMarried: 'avec qui est marie',
            whoMarriedPast: 'avec qui etait marie',
            howManyChildren: "combien d'enfants a",
            howManyChildrenPast: "combien d'enfant a eu",
            whoIsFather: 'qui est le pere de',
            whoIsFatherPast: 'qui etait le pere de',
            whoIsMother: 'qui est la mere de',
            whoIsMotherPast: 'qui etait la mere de',
            whoAreSibling: 'qui sont les freres et sœurs de',
            whoAreSiblingPast: 'qui étaient les freres et sœurs de',           
            whatIsHistorical: 'quel est le contexte historique de',
            whatIsHistoricalPast: 'quel etait le contexte historique de',
            whatAreNotes : 'quelles sont les notes de',  
            whoAreYou : 'qui es-tu',
            whatIsYourName : 'quel est ton nom',
            whoCreatedYou : "qui t'a cree",            
            whatisTheUse : "a quoi sert tu", 
            whatisTheUseBis : "a quoi sert-tu", 


            go: 'go',
            enter: 'entrer',
            validate: 'valider',
            validateBis: 'valide',
            question: 'question',
            questions: 'questions',
            firstname: 'prenom',
            lastname: 'nom',
            place: 'lieu',
            occupation: 'metier',
            occupationBis: 'profession',
            date: 'date',

            letter: 'lettre',
            by: 'par',
            stop: 'stop',
            stopBis: 'stoppe',
            end: 'fin',
            year: 'annee',
            pause: 'pause',

    
        },
        'en': {
            btnRecord: 'Speak',
            btnEraseRecord: 'Erase <br>&Speak',
            btnStopListening: 'Stop listening', 
            statusRecording: '🎙️ Listening...',
            statusReady: 'Press the mic to speak.',
            readSheet: 'read the sheet of',
            search: 'search',
            research: 'rechercher',              
            whenBorn: 'when was born',
            whenDead: 'when died',
            whenDeadW: 'when died',
            whenDied: 'when passed away',
            whatAge: 'how old is',
            whatAgePast: 'how old was',
            whereLive: 'where lives',
            whereLivePast: 'where lived',
            whatProfession: 'what is the profession of',
            whatProfessionPast: 'what was the profession of',
            whatOccupation: 'what is the job of',
            whatOccupationPast: 'what was the job of',
            whoMarried: 'who is married to',
            whoMarriedPast: 'who was married to',
            howManyChildren: "how many children has",
            howManyChildrenPast: "how many childrenhad",
            whoIsFather: 'who is the father of',
            whoIsFatherPast: 'who was the father of',
            whoIsMother: 'who is the mother of',
            whoIsMotherPast: 'who was the mother of',
            whoAreSibling: 'who are the siblings of',
            whoAreSiblingPast: 'who were the siblings of',
            whatIsHistorical: 'what is the historical context of',
            whatIsHistoricalPast: 'what was the historical context of',
            whatAreNotes: 'what are the notes of',
            go: 'go',
            enter: 'enter',
            validate: 'validate',
            validateBis: 'validate',
            question: 'question',
            questions: 'questions',
            firstname: 'first name',
            lastname: 'last name',
            place: 'place',
            occupation: 'occupation',
            occupationBis: 'profession',
            date: 'date',
            letter: 'letter',
            by: 'by',
            stop: 'stop',
            stopBis: 'stop',
            end: 'end',
            year: 'year',
            pause: 'pause',

        },
        'es': {
            btnRecord: 'Habla',
            btnEraseRecord: 'Borra <br>&Habla',
            btnStopListening: 'Detener la escucha', 


            statusRecording: '🎙️ Escuchando...',
            statusReady: 'Pulsa el micro para hablar.',
            readSheet: 'lee la ficha de',
            search: 'buscar',
            research: 'investigar',
            whenBorn: 'cuando nacio',
            whenDead: 'cuando murio',
            whenDeadW: 'cuando murio',
            whenDied: 'cuando fallecio',
            whatAge: 'que edad tiene',
            whatAgePast: 'que edad tenia',
            whereLive: 'donde vive',
            whereLivePast: 'donde vivia',
            whatProfession: 'cual es la profesion de',
            whatProfessionPast: 'cual era la profesion de',
            whatOccupation: 'cual es el oficio de',
            whatOccupationPast: 'cual era el oficio de',
            whoMarried: 'con quien esta casado',
            whoMarriedPast: 'con quien estaba casado',
            howManyChildren: "cuantos hijos tiene",
            howManyChildrenPast: "cuantos hijos tuvo",
            whoIsFather: 'quien es el padre de',
            whoIsFatherPast: 'quien era el padre de',
            whoIsMother: 'quien es la madre de',
            whoIsMotherPast: 'quien era la madre de',
            whoAreSibling: 'quienes son los hermanos de',
            whoAreSiblingPast: 'quienes eran los hermanos de',
            whatIsHistorical: 'cual es el contexto historico de',
            whatIsHistoricalPast: 'cual era el contexto historico de',
            whatAreNotes: 'cuales son las notas de',
            go: 'ir',
            enter: 'entrar',
            validate: 'validar',
            validateBis: 'validar',
            question: 'pregunta',
            questions: 'preguntas',
            firstname: 'nombre',
            lastname: 'apellido',
            place: 'lugar',
            occupation: 'profesion',
            occupationBis: 'profesion',
            date: 'fecha',

            letter: 'letra',
            by: 'por',
            stop: 'alto',
            stopBis: 'alto',
            end: 'fin',
            year: 'ano',
            pause: 'pause',
        },
        'hu': {
            btnRecord: 'Beszeljen',
            btnEraseRecord: 'Töröld <br>&Beszélj',
            btnStopListening: 'Állítsd le a hallgatást',

            statusRecording: '🎙️ Figyel...',
            statusReady: 'Nyomja meg a mikrofont a beszedhez.',
            readSheet: 'olvasd a lapjat',
            search: 'kereses',
            research: 'kutatas',
            whenBorn: 'mikor szuletett',
            whenDead: 'mikor halt meg',
            whenDeadW: 'mikor halt meg',
            whenDied: 'mikor hunyt el',
            whatAge: 'hany eves',
            whatAgePast: 'hany eves volt',
            whereLive: 'hol el',
            whereLivePast: 'hol elt',
            whatProfession: 'mi a foglalkozasa',
            whatProfessionPast: 'mi volt a foglalkozasa',
            whatOccupation: 'mi a munkaja',
            whatOccupationPast: 'mi volt a munkaja',
            whoMarried: 'kivel hazas',
            whoMarriedPast: 'kivel volt hazas',
            howManyChildren: "hany gyermeke van",
            howManyChildrenPast: "hany gyermeke volt",
            whoIsFather: 'ki az apja',
            whoIsFatherPast: 'ki volt az apja',
            whoIsMother: 'ki az anyja',
            whoIsMotherPast: 'ki volt az anyja',
            whoAreSibling: 'kik a testverei',
            whoAreSiblingPast: 'kik voltak a testverei',
            whatIsHistorical: 'mi a tortenelmi hattere',
            whatIsHistoricalPast: 'mi volt a tortenelmi hattere',
            whatAreNotes: 'mik a jegyzetei',
            go: 'mehet',
            enter: 'beír',
            validate: 'jovahagy',
            validateBis: 'jovahagy',
            question: 'kerdes',
            questions: 'kérdések',
            firstname: 'keresztnev',
            lastname: 'vezeteknev',
            place: 'hely',
            occupation: 'foglalkozas',
            occupationBis: 'foglalkozas',
            date: 'datum',
            letter: 'betu',
            by: 'altal',
            stop: 'stop',
            stopBis: 'stop',
            end: 'vege',
            year: 'ev',
            pause: 'pause',

        }
    };

    // Rendre la fonction de traduction accessible au module STT
    function translate(key) {
        const lang = window.CURRENT_LANGUAGE || 'fr';
        return i18n[lang][key] || i18n['fr'][key]; // Fallback au français
    }

    // --- Variables d'État et d'API Globales ---
    // const translate = translate || ((key) => `[${key}]`); 
   
    let recognition = null;
    let isRecording = false;
    let cumulativeTranscript = ''; 
    let recognitionTimeout = null; 
    const PC_MAX_DURATION_MS = 20000; 

    // MAPPING DES LANGUES
    const langMap = { 'fr': 'fr-FR', 'en': 'en-US', 'es': 'es-ES', 'hu': 'hu-HU' };
    const targetLang = langMap[window.CURRENT_LANGUAGE || 'fr'] || 'fr-FR';

    // Liste des entités canoniques
    let entityKeys = []; //['commande', 'prenom', 'nom', 'lieux', 'profession'];
    let capturedEntities = entityKeys.reduce((acc, field) => {
        acc[field] = 'not detected';
        return acc;
    }, {});
    
    // --- Variables d'État du Mode Hybride ---
    let isSpellingMode = false;
    let pendingSpellingStart = false; 
    let targetSpellingField = null;
    let spellingGrammar = null; 

    const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
    const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];


    let entityTimeoutTimer = null;
    let currentEntity = null;
    const ENTITY_TIMEOUT_MS = 3000; // 2 secondes de timeout


    let mediaStream = null; // Stocke la référence au flux audio du microphone
    const ANTI_SILENCE_DELAY_MS = 2000; // Délai de prolongation du silence (2 secondes)

    let previousFullTranscript = null;
    let previousFullTranscriptOnResult = null;
    let previousFullTranscriptOnEnd = null;
    let previousTruncatedTranscript = null;
    let previousTruncatedTranscriptOnResult = null;
    let previousTruncatedTranscriptOnEnd = null;

    let isNewCommandToBeExecuted = true;
    let isNewCommandToBeExecuted2 = true;
    const LONG_PHRASE = 'parler dans le micro votre voix est analysée et des mots clé sont détectés';
    // Nombre de répétitions souhaitées
    const REPETITIONS = 20; 
    let SUPER_LONG_TEXT = 'parler dans le micro '; //LONG_PHRASE;


    const actionKeywords = ['whoAreYou', 'whatIsYourName', 'whoCreatedYou', 'whatisTheUse', 'whatisTheUseBis', 'search', 'research', 'readSheet', 'whenBorn', 'whenDead', 'whenDeadW', 'whenDied', 
    'whatAge', 'whatAgePast', 'whereLive', 'whereLivePast', 'whatProfession', 'whatOccupation', 'whatProfessionPast', 'whatOccupationPast', 
    'whoMarried', 'whoMarriedPast', 'howManyChildren', 'howManyChildrenPast', 'whoIsFather', 'whoIsFatherPast', 
    'whoIsMother','whoIsMotherPast','whoAreSibling','whoAreSiblingPast', 'whatIsHistorical','whatIsHistoricalPast', 'whatAreNotes'];

    // =========================================================
    // NOUVELLE FONCTION CLÉ : Synchronisation Clavier -> État
    // =========================================================

    /**
     * Met à jour l'entité capturée lorsque l'utilisateur tape au clavier dans le champ INPUT.
     * @param {string} fieldName - Le nom de l'entité à mettre à jour ('prénom', 'nom', etc.).
     * @param {string} newValue - La nouvelle valeur saisie.
     */
    function updateCapturedEntity(fieldName, newValue) {
        // SÉCURISER L'ENTRÉE contre l'erreur .toUpperCase()
        const nameToDisplay = (typeof fieldName === 'string') ? fieldName.toUpperCase() : 'UNKNOWN_FIELD';
        
        const valueToStore = newValue.trim() || 'not detected'; 
        
        // Mise à jour de l'état
        capturedEntities[fieldName] = valueToStore;
        
        // Utiliser la variable sécurisée dans le log (résout le TypeError)
        console.log(`[CLAVIER] ${nameToDisplay} mis à jour manuellement à: "${valueToStore}"`);

        // Rafraîchir l'interface (essentiel pour résoudre le problème du "double clic")
        updateEntityUI(); 
    }



    

    // // --- Fonctions d'Action Simples (Stubs) ---


    /**
     * Fonction appelée lorsque l'utilisateur valide la saisie ou ferme la fenêtre.
     */
    function handleValidationAndExit() {
        
        // 2. Appeler le getter du module
        const capturedData = SpeechRecognitionUI.getCapturedData();
        
        // 3. Stocker les données dans la variable globale de l'application
        console.log("--- DONNÉES FINALES CAPTURÉES ---");
       
        
        // Exemple d'utilisation :
        if (capturedData.prenom) {
            console.log(`Bonjour ${capturedData.prenom} !`);
        } else {
            console.log("Aucun prénom n'a été capturé.");
        }

        if (localConfig ==='start') {
            state.initialSpeechReconitionIsLaunched = true;
            loadData(null, capturedData);
        }



        // 4. Masquer l'interface
        SpeechRecognitionUI.hideUI();


    }

    // Assurez-vous d'appeler cette fonction lors de la fermeture de la modale.
    // Par exemple, en modifiant l'événement 'click' de votre bouton de fermeture :
    const closeButton = document.getElementById('close-stt-button');
    if (closeButton) {
        // Au lieu de la simple hideUI(), on ajoute la récupération des données
        closeButton.removeEventListener('click', SpeechRecognitionUI.hideUI); // Retirer l'ancien listener si présent
        closeButton.addEventListener('click', handleValidationAndExit);
    }


    function arreterEcouteAction() { 
        console.log("[ACTION] Arrêt de l'écoute demandé par l'utilisateur.");
        isRecording = false; 


        // Nettoyer le minuteur de l'entité
        if (entityTimeoutTimer) {
            clearTimeout(entityTimeoutTimer);
            entityTimeoutTimer = null;
        }
        
        currentEntity = null; // S'assurer que l'entité est désactivée



        if (recognition)  {
            recognition.stop();
            if (state.isMobile && window.speechSynthesis.speaking) {
                // window.speechSynthesis.cancel(); 
            }
        }
    }

    
    // =========================================================
    // Fonctions de Contrôle de la Bascule 
    // =========================================================

    function startSpellingCycle(targetField, config = null) {
        targetSpellingField = targetField;
        pendingSpellingStart = true; 
        // cumulativeTranscript = '';
        
        if (isRecording && recognition) {
            recognition.stop(); 
            if (state.isMobile && window.speechSynthesis.speaking) {
                // window.speechSynthesis.cancel(); 
            }            
            console.log(`[ACTION] Demande de bascule en Mode Épellation pour: ${targetField}`);
        } else {
            toggleSpeechRecognition(); 
        }
    }

    
    function stopSpellingCycle() {
        const finalValue = capturedEntities[targetSpellingField];
        
        isSpellingMode = false;
        targetSpellingField = null;
        pendingSpellingStart = false;

        recognition.continuous = !state.isMobile;
        recognition.grammars = new SpeechGrammarList(); 
        
        document.getElementById('stt-result-display').textContent = `✅ Épellation terminée. Valeur enregistrée: "${finalValue}"`;
        document.getElementById('stt-interim-display').textContent = '';
        updateEntityUI(); 
        
        console.log(`[LOG STT] Valeur finale de l'épellation enregistrée: ${finalValue}`);

        if (isRecording) {
            recognition.stop(); 
            if (state.isMobile && window.speechSynthesis.speaking) {
                // window.speechSynthesis.cancel(); 
            }
        }
    }



    /**
     * Génère des alternatives orthographiques basées sur des confusions phonétiques courantes.
     * Retourne une liste vide si aucune alternative n'est trouvée.
     * @param {string} word - Le mot transcrit (potentiellement erroné).
     * @returns {Array<string>} Une liste d'alternatives générées (ou une liste vide si aucune).
     */
    function generatePhoneticAlternatives(word) {
        
        const generatedAlternatives = new Set(); 
        const wordLower = word.toLowerCase();


        // =========================================================================
        // 0. NOUVELLE RÈGLE : Regrouper les mots (enlever les espaces et les traits d'union)
        // =========================================================================
        
        // Remplace les espaces (\s) et les tirets (-) par une chaîne vide
        const noSpacesAlternative = wordLower.replace(/[\s-]/g, '');

        if (noSpacesAlternative !== wordLower) {
            generatedAlternatives.add(noSpacesAlternative);
            console.log(`[Alternative Générée] Regroupement : "${word}" -> "${noSpacesAlternative}"`);
        }


        // =========================================================================
        // 1. Cas ciblé existant : [C]e[s][C] -> [C]e[C] (le cas de 'dumesnil' -> 'dumenil')
        // ===
        // Regex: (.*)([bcdfghjklmnpqrstvwxyz])(e|i)s([bcdfghjklmnpqrstvwxyz])(.*)
        const regexES = /(.*)([bcdfghjklmnpqrstvwxyz])(e|i)s([bcdfghjklmnpqrstvwxyz])(.*)/gi;

        wordLower.replace(regexES, (match, prefix, c1, vowel, c2, suffix) => {
            
            // Règle 1: Remplacer 'es' par 'e' (sans accent)
            if (vowel === 'e') {
                const alternative = `${prefix}${c1}e${c2}${suffix}`;
                if (alternative !== wordLower) {
                    generatedAlternatives.add(alternative);

                    const noSpacesAlternative = alternative.replace(/[\s-]/g, '');
                    if (noSpacesAlternative !== alternative) {
                        generatedAlternatives.add(noSpacesAlternative);
                        console.log(`[Alternative Générée] Regroupement : "${word}" -> "${noSpacesAlternative}"`);
                    }

                }
            }
            
            // Règle 2: Remplacer 'is' par 'i'
            else if (vowel === 'i') {
                const alternative = `${prefix}${c1}i${c2}${suffix}`;
                if (alternative !== wordLower) {
                    generatedAlternatives.add(alternative);

                    const noSpacesAlternative = alternative.replace(/[\s-]/g, '');
                    if (noSpacesAlternative !== alternative) {
                        generatedAlternatives.add(noSpacesAlternative);
                        console.log(`[Alternative Générée] Regroupement : "${word}" -> "${noSpacesAlternative}"`);
                    }

                }
            }
        });

        // --- LOGIQUE DE RETOUR MODIFIÉE ---
        // Retourne la liste des alternatives (ex: ['dumenil']) ou une liste vide si size = 0.
        return Array.from(generatedAlternatives);
    }


    /**
     * Réinitialise le minuteur de timeout de l'entité active.
     * Si le minuteur s'épuise, il désactive l'entité.
     */
    function resetEntityTimeout() {
        // S'assurer que l'entité active est définie avant de démarrer un minuteur
        if (!currentEntity) return;

        // 1. Annuler tout minuteur existant
        if (entityTimeoutTimer) {
            clearTimeout(entityTimeoutTimer);
        }

        // 2. Démarrer un nouveau minuteur
        entityTimeoutTimer = setTimeout(() => {
            console.log(`[TIMEOUT] Entité '${currentEntity}' désactivée après ${ENTITY_TIMEOUT_MS / 1000}s de silence.`);
            currentEntity = null; // Désactive l'entité en cours
            entityTimeoutTimer = null;
            cumulativeTranscript += ' pause ';
        }, ENTITY_TIMEOUT_MS);
    }


    //###################################################
    async function processFullTranscript(transcript, configIn = null, isOnResult = null) {

        let config = localConfig;
        let commandActionMap = null;

        if (config === 'start') {
            commandActionMap = {
                [translate('go')]: handleValidationAndExit,
                [translate('enter')]: handleValidationAndExit,
                [translate('end')]: handleValidationAndExit,
                [translate('stop')]: arreterEcouteAction 
            };
        } else if (config === 'full') {
            commandActionMap = {
                // [translate('stop')]: arreterEcouteAction 
            };
        }

        const commands = Object.keys(commandActionMap); 


        const detectedCommand = commands.find(cmd => transcript.includes(cmd));
        if (detectedCommand) {
            commandActionMap[detectedCommand]();
            return; 
        }

        const transcriptCleaned =  transcript.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // enlever les accents !!!

        let words = transcriptCleaned.split(/\s+/).filter(w => w.length > 0);
        if (words.length === 0) return;

        // =========================================================
        // NOUVEAU MODE : Détection de Séquence Spécifique (Action Prénom Nom GO)
        // =========================================================
        // const actionKeywords = ['chercher', 'quand est ne', 'quand est mort', 'quand est morte', 'quand est decede', 'quel age a', 'quel age avait', 'ou habite', 'ou habitait', 'quelle est la profession de', 'quel est le metier de', 'quelle etait la profession de', 'quel etait le metier de', 'avec qui est marie', 'avec qui était marie'];
        // const actionKeywords = ['whoAreYou', 'whatIsYourName', 'whoCreatedYou', 'whatisTheUse', 'search', 'research', 'readSheet', 'whenBorn', 'whenDead', 'whenDeadW', 'whenDied', 
        //     'whatAge', 'whatAgePast', 'whereLive', 'whereLivePast', 'whatProfession', 'whatOccupation', 'whatProfessionPast', 'whatOccupationPast', 
        //     'whoMarried', 'whoMarriedPast', 'howManyChildren', 'howManyChildrenPast', 'whoIsFather', 'whoIsFatherPast', 
        //     'whoIsMother','whoIsMotherPast','whoAreSibling','whoAreSiblingPast', 'whatIsHistorical','whatIsHistoricalPast', 'whatAreNotes'];

        const actionKeywordsWithoutFirstName = ['whoAreYou', 'whatIsYourName', 'whoCreatedYou', 'whatisTheUse']

        //'sex', 'birthDate', 'deathDate', 'occupation_n', 'residences_n', 'children', 'father', 'mother', 'siblings', 'spouse', 'historical','notes'

        const validationSignal = [translate('go'), translate('end'), translate('stop'), , translate('endBis'), translate('enter'), translate('validateBis'), translate('validate')];
        const validationSignal2 = [translate('pause'), translate('go'), translate('end'), translate('endBis'), translate('stop'), translate('enter'), translate('validateBis'), translate('validate')];

    //     const validationSignal = ['go', 'end', 'stop', 'enter', 'validateBis', 'validate'];
    //    const validationSignal2 = ['pause', 'go', 'end', 'stop', 'enter', 'validateBis', 'validate'];

        let fullTranscript = transcriptCleaned.trim(); // Version propre du transcript
        fullTranscript = fullTranscript.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // enlever les accents !!!

        isNewCommandToBeExecuted = true;
        
        if (isOnResult == 'onEnd' && previousFullTranscriptOnResult === fullTranscript ) { 
            console.log('\n\n ---- debug 1  : NE PAS EXCECUTER CETTE COMMANDE car c est UN ONEND dupliqué d un ONRESULT déjà excécuté');
            isNewCommandToBeExecuted = false;
        }
        
        // if (previousFullTranscript != fullTranscript) { 
        //     isNewCommandToBeExecuted = true;  console.log('\n\n ---- debug 1 isNewCommandToBeExecuted = true ', 'previousFullTranscript=', previousFullTranscript, ',fullTranscript=',fullTranscript,'--end');
        // }

        console.log('\n #####################   [LOG STT] Détection input : ', transcript , ',',previousFullTranscript, ',', fullTranscript, ',isNewCommandToBeExecuted =',isNewCommandToBeExecuted,',isOnresult=' ,isOnResult);

        if (isOnResult == 'onResult') { previousFullTranscriptOnResult = fullTranscript; }
        else { previousFullTranscriptOnEnd = fullTranscript; } 
        previousFullTranscript = fullTranscript;
        

        let detectedAction = null; // Variable pour stocker l'expression d'action qui correspond
        let truncatedTranscript = fullTranscript;
        let maxIndex = 0;
        // --- Boucle pour trouver la QUESTION et la validation ---
        for (const keyword of actionKeywords) {
            // Vérifie si la phrase commence par / ou contien /cette expression ET si elle est suivie d'un espace (pour éviter les faux positifs)
            const index = fullTranscript.lastIndexOf(translate(keyword)+ ' ');
            if (index !== -1) {
                let truncatedTranscriptCurrent = fullTranscript.substring(index);
                words = truncatedTranscriptCurrent.split(/\s+/).filter(w => w.length > 0);
                // tu as ton texte tronqué
                let detectedActionCurrent = keyword;

                console.log('\n\n\n @@@@@@@@@@@@@@@@@@   debug  detected key word @@@@@@@', detectedActionCurrent, index)

                maxIndex = Math.max(maxIndex, index)
                if(maxIndex === index) { 
                    detectedAction = detectedActionCurrent;
                    truncatedTranscript = truncatedTranscriptCurrent;
                }
            }
        }

        // 1. Enregistrer l'Action
        if (detectedAction) {
            if (detectedAction === 'whatisTheUseBis') {
                detectedAction = 'whatisTheUse';
            }
            capturedEntities[translate('question')] = translate(detectedAction);
        }


        console.log('\n\n\n ========================  debug  final detected key word ============', detectedAction, 'capturedEntities[translate(question)]',capturedEntities[translate('question')])

        isNewCommandToBeExecuted2 = true;
        if (detectedAction != null) {
            if (isOnResult == 'onEnd' && previousTruncatedTranscriptOnResult === truncatedTranscript ) { 
                console.log('\n\n ---- debug 2  : NE PAS EXCECUTER CETTE COMMANDE car c est UN ONEND dupliqué d un ONRESULT déjà excécuté');
                isNewCommandToBeExecuted2 = false;
            }
            if (isOnResult == 'onResult') { previousTruncatedTranscriptOnResult = truncatedTranscript; }
            else { previousTruncatedTranscriptOnEnd = truncatedTranscript; } 
            previousTruncatedTranscript = truncatedTranscript

        }
        
        let newCumulativeTranscript = ''
        // =========================================================
        // DEBUT DU MODE : question + .... + validationSignal
        // =========================================================
        // VÉRIFICATION GLOBALE : Est-ce qu'une action a été détectée ? Et y a-t-il un signal de validation ?
        if (isNewCommandToBeExecuted && isNewCommandToBeExecuted2 && config === 'full' && detectedAction && validationSignal.includes(words[words.length - 1])) {

            if (isRecording) {
                if (state.isMobile && window.speechSynthesis.speaking) {
                    // window.speechSynthesis.cancel(); 
                }
            }


            // // 1. Enregistrer l'Action
            // capturedEntities[translate('question')] = translate(detectedAction);

            // Détecte si l'action ne nécessite pas de prénom/nom
            const isActionWithoutFirstName = actionKeywordsWithoutFirstName.includes(detectedAction);

            console.log(`---------[LOG STT] Détection du mode structuré pour l'expression: "${translate(detectedAction).toUpperCase()}"`, previousFullTranscript, ',',fullTranscript, 'truncatedTranscript',truncatedTranscript,',isNewCommandToBeExecuted =',isNewCommandToBeExecuted, isNewCommandToBeExecuted2, ',capturedEntities=', capturedEntities, 'isActionWithoutFirstName', isActionWithoutFirstName, 'detectedAction=',detectedAction, 'actionKeywordsWithoutFirstName=' ,actionKeywordsWithoutFirstName);

            // 2. Extraire la partie NOM et PRÉNOM
            // Enlève l'expression d'action et le signal de validation.
            let entityPart = truncatedTranscript.substring(translate(detectedAction).length).trim(); 
            // let entityWords = entityPart.split(/\s+/).slice(0, -1); // Enlève le signal de validation (GO)
            let minSize = 100;
            let entityWords = [];
            let beforeKeywordFinal = null;
;           for (const keyword of validationSignal2) {
                // console.log('\n ------------  debug  entityPart=', entityPart , ',keyword=', keyword)
                // Vérifie si la phrase contient un keyword
                const index = entityPart.indexOf(keyword);
                if (index !== -1) {
                    const beforeKeyword = entityPart.substring(0, index).trim();
                    const afterKeyword = entityPart.substring(index + keyword.length).trim();
                    minSize = Math.min(minSize, beforeKeyword.length);
                    if (minSize === beforeKeyword.length) { beforeKeywordFinal = beforeKeyword; }
                    // console.log('\n ------------  debug  entityPart , keyword=', keyword, beforeKeyword, 'after=', afterKeyword)
                }
            }
            if (beforeKeywordFinal != null && beforeKeywordFinal != ' '  && beforeKeywordFinal != '') { entityWords = beforeKeywordFinal.split(/\s+/)}



            newCumulativeTranscript = translate(detectedAction) + ' ' + beforeKeywordFinal + ' ' + words[words.length - 1] ;// truncatedTranscript


            console.log('\n ------------  debug  final entityPart =',  entityWords, ',beforeKeywordFinal=',beforeKeywordFinal, ', newCumulativeTranscript=' ,newCumulativeTranscript)


            // let isFirstNameAvailable = false; let isLastNameAvailable = false; let isPlaceAvailable = false; let isOccupationAvailable = false; let isDateAvailable = false;
            let entityKeys = [ 'firstname','lastname','place','occupation','date'];
            let isEntityKeyAvailable = [];
            entityKeys.forEach(key => { isEntityKeyAvailable[key] = false; });

            console.log('\n ------------  debug isEntityKeyAvailable=' ,isEntityKeyAvailable)


            if (!isActionWithoutFirstName) {               
                console.log('\n\n --------- debug --- entityWords.length=', entityWords.length, ',isFirstNameAvailable, isLastNameAvailable, isPlaceAvailable, isOccupationAvailable,isDateAvailable=  ',isEntityKeyAvailable['firstname'], isEntityKeyAvailable['lastname'], isEntityKeyAvailable['place'], isEntityKeyAvailable['occupation'],isEntityKeyAvailable['date'], 'detectedAction=' ,detectedAction );

                if (entityWords.length >= 2) {
                    // Par convention, le premier mot après l'action est le PRÉNOM
                    capturedEntities[translate('firstname')] = entityWords[0]; 
                    isEntityKeyAvailable['firstname'] = true;
                    cumulativeTranscript += ' ' + translate('firstname') + ' ' +  capturedEntities[translate('firstname')] + ' pause ';
                    newCumulativeTranscript += ' ' + translate('firstname') + ' ' +  capturedEntities[translate('firstname')] + ' pause ';
                    
                    // Tous les mots restants sont considérés comme le NOM
                    capturedEntities[translate('lastname')] = entityWords.slice(1,4).join(' ');
                    isEntityKeyAvailable['lastname'] = true;
                    cumulativeTranscript += ' ' + translate('lastname') + ' ' +  capturedEntities[translate('lastname')] + ' pause ';
                    newCumulativeTranscript += ' ' + translate('lastname') + ' ' +  capturedEntities[translate('lastname')] + ' pause ';
                } else if (entityWords.length === 1) {
                    // S'il n'y a qu'un seul mot (ex: 'chercher Henri GO'), on le met en Nom par défaut ou on gère l'erreur
                    capturedEntities[translate('firstname')] = entityWords[0]; 
                    isEntityKeyAvailable['firstname'] = true; 
                    cumulativeTranscript += ' ' + translate('firstname') + ' ' +  capturedEntities[translate('firstname')] + ' pause ';
                    newCumulativeTranscript += ' ' + translate('firstname') + ' ' +  capturedEntities[translate('firstname')] + ' pause ';
                }
                
            }

            console.log('\n ------------  debug newCumulativeTranscript=' ,newCumulativeTranscript)


            // if (capturedEntities[translate('firstname')] && capturedEntities[translate('firstname')] != 'not detected' && capturedEntities[translate('firstname')] != null) {isFirstNameAvailable = true ;}
            // if (capturedEntities[translate('lastname')] && capturedEntities[translate('lastname')] != 'not detected' && capturedEntities[translate('lastname')] != null) {isLastNameAvailable = true ;}
            // if (capturedEntities[translate('place')] && capturedEntities[translate('place')] != 'not detected' && capturedEntities[translate('place')] != null) {isPlaceAvailable = true ;}
            // if (capturedEntities[translate('occupation')] && capturedEntities[translate('occupation')] != 'not detected' && capturedEntities[translate('occupation')] != null) {isOccupationAvailable = true ;}
            // if (capturedEntities[translate('date')] && capturedEntities[translate('date')] != 'not detected' && capturedEntities[translate('date')] != null) {isDateAvailable = true ;}

            entityKeys.forEach(key => {
                if (capturedEntities[translate(key)] && capturedEntities[translate(key)] != 'not detected' && capturedEntities[translate(key)] != null) {
                    isEntityKeyAvailable[key] = true ; 
                    newCumulativeTranscript += ' ' + translate(key) + ' ' + capturedEntities[translate(key)] + ' ';
                }
            });

            console.log('\n ------------  debug  final entityPart =',  entityWords,', newCumulativeTranscript=' ,newCumulativeTranscript)



            document.getElementById('stt-result-display').textContent = `✅ Mode structuré détecté. Action: ${detectedAction.toUpperCase()}, Prénom: ${capturedEntities[translate('firstname')]}, Nom: ${capturedEntities[translate('lastname')]}.`;
            updateEntityUI();



            // if (capturedEntities['action'] === 'chercher' && capturedEntities['prenom'] !== 'not detected' && capturedEntities['nom'] !== 'not detected') { 
            if (!isActionWithoutFirstName && isEntityKeyAvailable['firstname'] && isEntityKeyAvailable['lastname']) { 
                // isNewCommandToBeExecuted = false; isNewCommandToBeExecuted2 = false;
    
                const config = {
                    type: 'name', //state.treeMode,
                    startDate: -500,
                    endDate: 3000,
                    scope: 'all',
                    rootPersonId: state.rootPersonId, //state.rootPersonId//scopeSelect.value !== 'all' ? finalRootPersonSelect.value : null
                };

                // Effectuer la recherche avec filtrage par dates
                let res = null;
                let res2 = null;

                res = findPersonsBy('', config, '', null, capturedEntities[translate('firstname')], capturedEntities[translate('lastname')], true);

                console.log('\n\n\n ------------   debug0 : personne trouvée ??? ---------', res, res.results[0]);
                let lastAlternativeNameFound = null;
                let othernames = null;
                if (res.results.length === 0) {
                    // essayer avec un changement d'ortographe du nom, par exemple dumenil à la place de dumesnil
                    othernames = generatePhoneticAlternatives(capturedEntities[translate('lastname')]);
                    console.log('\n\n\n ------------   debug 1: autres noms possibles ??? ---------', othernames);
                    if (othernames.length > 0) {
                        othernames.forEach(name => { 
                            lastAlternativeNameFound = name;
                            res2 = findPersonsBy('', config, '', null, capturedEntities[translate('firstname')], name, true);
                            console.log('\n\n\n ------------   debug : personne trouvée ??? ---------', res2, res2.results[0]);
                            if (res2.results.length > 0 ) return;
                        });
                    }
                }
                if (res.results.length > 0 || (othernames && othernames.length > 0 && res2.results.length > 0 )) {
                    const name = (res.results.length > 0) ? capturedEntities[translate('lastname')] : lastAlternativeNameFound;
                    let textToTell = 'la personne ' + capturedEntities['prenom'] + ' ' + name + ' a été trouvée ! Voici sa fiche';
                    arreterEcouteAction();

                    let personId = (res.results.length > 0) ? res.results[0].id : res2.results[0].id;

                    if (detectedAction  === 'search' || detectedAction  === 'research' ) {
                        displayPersonDetails(personId);
                    }

                    await speakTextWithWaitToEnd('essai de parole', 0.0); // ppour débugger le son et éviter la 1iere saccade de son
                    if (!detectedAction.includes('search') && !detectedAction.includes('research')  ) { 
                        const quizzMessage = document.getElementById('quizz-message');
                        if (quizzMessage) { quizzMessage.remove(); }
                        await readPersonSheet(personId, detectedAction); 
                    } 
                    else { await speakTextWithWaitToEnd(textToTell, 1.0); }
                    // hideUI();
                    recognition.start();
                    if (state.isMobile) {
                        speakText(SUPER_LONG_TEXT, 0.6, 0.7);
                    }                    
                    if (!state.isMobile) {
                        clearTimeout(recognitionTimeout);
                        recognitionTimeout = setTimeout(() => {
                            if (isRecording) {
                                isRecording = false;
                                recognition.stop();
                            }
                        }, PC_MAX_DURATION_MS);
                    }

                    const overlay = document.getElementById('stt-only-overlay');

                    makeModalInteractive(overlay); 

                } else {
                    recognition.stop()

                    let textToTell = 'la personne ' + capturedEntities[translate('firstname')] + ' ' + capturedEntities[translate('lastname')] + ' n\'a pas été trouvée ! Ré-essayer';
                    console.log('\n\n\n ------------   debug : ', textToTell, cumulativeTranscript);
                    await speakTextWithWaitToEnd(textToTell);
                    // supprimer le dernier mot d'activatio 'GO', pour éviter de répeter plusieurs la phrase 
                    // words.pop(); 
 
                    console.log('\n\n\n ------------   debug words after fail: ',  cumulativeTranscript);

                    recognition.start();
                    if (state.isMobile) {
                        speakText(SUPER_LONG_TEXT, 0.6, 0.7);
                    }                    
                    if (!state.isMobile) {
                        clearTimeout(recognitionTimeout);
                        recognitionTimeout = setTimeout(() => {
                            if (isRecording) {
                                isRecording = false;
                                recognition.stop();
                            }
                        }, PC_MAX_DURATION_MS);
                    }


                }
            } else if ( (isNewCommandToBeExecuted && isNewCommandToBeExecuted2) && (detectedAction.includes('whoAreYou') || detectedAction.includes('whatIsYourName') || detectedAction.includes('whoCreatedYou') || detectedAction.includes( 'whatisTheUse') ) ) {
            // if (  (detectedAction.includes('whoAreYou') || detectedAction.includes('whatIsYourName') || detectedAction.includes('whoCreatedYou') || detectedAction.includes( 'whatisTheUse')) ) {
                console.log('\n\n\n ------------   debug  prononcer : ', detectedAction);
                // quans la commande a été exécutée on reset les conditions 
                isNewCommandToBeExecuted = false; isNewCommandToBeExecuted2 = false;

                // arreterEcouteAction();
                recognition.stop()
                
                await speakTextWithWaitToEnd('essai de parole', 0.0); // ppour débugger le son et éviter la 1iere saccade de son
                // await speakTextWithWaitToEnd(' ', 1); // ppour débugger le son et éviter la 1iere saccade de son
                if (detectedAction.includes('whoAreYou')) {
                    await speakTextWithWaitToEnd('je suis treeViewer, une appli pour visualiser les arbres généalogiques avec des animations', 1.0);      
                } else if (detectedAction.includes('whatIsYourName')) {
                    await speakTextWithWaitToEnd('je suis treeViewer, une appli pour visualiser les arbres généalogiques avec des animations', 1.0);     
                } else if (detectedAction.includes('whoCreatedYou')) {
                    await speakTextWithWaitToEnd('mon créateur est Patrick Duménil', 1.0);      
                } else if (detectedAction.includes('whatisTheUse')) {
                    // await speakTextWithWaitToEnd('je sers à visualiser les arbres généalogiques de type GEDCOM, de différentes manière, en mode arbre, roue, ou nuage, avec de la géolocalisation, des animation, de la synthèse vocale et reconnaissance vocale, et aussi des quizz', 1.0);      
                    speakTextWithWaitToEnd('je sers à visualiser les arbres généalogiques de type GEDCOM, de différentes manière, en mode arbre, roue, ou nuage, avec de la géolocalisation, des animation, de la synthèse vocale et reconnaissance vocale, et aussi des quizz');      
                }
                recognition.start();
                if (state.isMobile) {
                    speakText(SUPER_LONG_TEXT, 0.6, 0.7);
                }                
                if (!state.isMobile) {
                    clearTimeout(recognitionTimeout);
                    recognitionTimeout = setTimeout(() => {
                        if (isRecording) {
                            isRecording = false;
                            recognition.stop();
                        }
                    }, PC_MAX_DURATION_MS);
                }
            }

            cumulativeTranscript = newCumulativeTranscript;

            console.log ('\n\n\n\n\n\n ++++++++++++++++++++     Final texte === ', cumulativeTranscript,'+++++++++++++++++++++++++\n\n\n\n')



            if (isRecording) {
                if (state.isMobile) {
                    speakText(SUPER_LONG_TEXT, 0.6, 0.7);
                }
            }



            return; 
        }
        // =========================================================
        // FIN DU MODE QUESTION
        // =========================================================
     



        let newEntities = {};
        let entitiesKeysEnglish = {};
        words = transcriptCleaned.split(/\s+/).filter(w => w.length > 0);
        console.log('\n\n------------  debug timer ------', cumulativeTranscript, transcriptCleaned, words)

        
        let keywordMap;

        if (config === 'start') {
            keywordMap = {
                'pause' : 'pause', [translate('firstname')]: translate('firstname'), [translate('laststname')]: translate('lastname'), 'non': translate('lastname')
            };

            entityKeys = [translate('firstname'),translate('lastname'), 'pause'];
            entitiesKeysEnglish = ['pause', 'firstname','lastname'];
            capturedEntities = entityKeys.reduce((acc, field) => {
                acc[field] = 'not detected';
                return acc;
            }, {});
        } 
        else if (config === 'full') {
            keywordMap = {
                'pause' : 'pause', [ translate('question')] : translate('question'), [translate('questions')] : translate('question'),
                [translate('firstname')]: translate('firstname'), [translate('lastname')]: translate('lastname'), 'non': translate('lastname'), 
                [translate('place')]: translate('place'), [translate('occupation')]: translate('occupation'), [translate('occupationBis')]: translate('occupation'), [translate('date')] : translate('date'), [translate('year')]: translate('date'),
                [translate('go')] : 'pause', [translate('end')] : 'pause', [translate('stop')] :'pause', [translate('stopBis')] :'pause', [translate('enter')] :'pause',  [translate('validate')]:'pause',  [translate('validateBis')]:'pause'
            };
            entityKeys = ['pause', translate('firstname'),translate('lastname'), translate('place'), translate('occupation'), translate('date'), translate('question')];
            entitiesKeysEnglish = ['pause', 'firstname','lastname','place', 'occupation', 'date', 'question'];

        }
        
        currentEntity = null;
        let entitiesDetectedCount = 0;
        let entitiesWordCount = 0;
        
        entityKeys.forEach(key => newEntities[key] = []);


        for (let i = 0; i < words.length; i++) {
            const word = words[i];

            if (word === translate('letter') && words[i+1] === translate('by') && words[i+2] === translate('letter')) {
                
                let fieldToSpell = translate('enter'); 
                
                if (currentEntity) {
                    fieldToSpell = currentEntity;
                    newEntities[currentEntity] = []; 
                } else if (i > 0) {
                    const previousWord = words[i - 1];
                    if (keywordMap[previousWord]) {
                         fieldToSpell = keywordMap[previousWord];
                    }
                }
                
                console.log(`[ACTION] Déclenchement du Mode Épellation par 'lettre par lettre' pour le champ: ${fieldToSpell}`);
                startSpellingCycle(fieldToSpell, config); 
                return; 
            }
            
            else if (keywordMap[word]) {
                const fieldKey = keywordMap[word];
                
                if (fieldKey === 'pause') {
                    // Si 'pause' est détecté, on désactive l'entité en cours et on ne fait rien d'autre.
                    console.log("[ANALYSE] Détection du marqueur 'pause'. Arrêt de la capture d'entité.");
                    currentEntity = null;
                    // On s'assure de ne pas le traiter comme une entité normale
                    capturedEntities['pause'] = 'detected'; 
                } else {
                    currentEntity = keywordMap[word];
                    capturedEntities[currentEntity] = 'not detected'; 
                    newEntities[currentEntity] = []; 
                    entitiesWordCount = 0;
                    resetEntityTimeout(); // <<< DÉCLENCHEMENT N°1 : Démarre le minuteur
                }
                
            }
            else if (currentEntity) {
                newEntities[currentEntity].push(word);
                entitiesWordCount++;
                if (entitiesWordCount >= 4) { 
                    currentEntity = null;
                }
                resetEntityTimeout(); // <<< DÉCLENCHEMENT N°2 : Réinitialise le minuteur
            }
        }
        




        entitiesKeysEnglish.forEach(key => {
            if (newEntities[translate(key)].length > 0) {
                capturedEntities[translate(key)] = newEntities[translate(key)].join(' ');
                console.log('\n\n ---------------- debug capturedEntities -------- key', key, ',capturedEntities[translate(key)]=',capturedEntities[translate(key)])
                entitiesDetectedCount++;
                newCumulativeTranscript += ' ' + translate(key) + ' ' + capturedEntities[translate(key)] + ' ';
            }
        });

        cumulativeTranscript = newCumulativeTranscript;

        if (entitiesDetectedCount > 0) {
            document.getElementById('stt-result-display').textContent = `✅ ${entitiesDetectedCount} champs mis à jour. (Continuez ou faites une pause)`;
        } else {
            document.getElementById('stt-result-display').textContent = `🔍 Analyse en cours. Transcript: "${transcript}"`;
        }
        


        if (validationSignal.includes(words[words.length - 1]) ) {

            console.log('\n\n\n\n #######################-----------   debug validationSignal ----------###############' , words[words.length - 1], capturedEntities , capturedEntities[translate('firstname')],capturedEntities[translate('question')], newEntities,'\n\n\n\n')
        }



        console.log ('\n\n\n\n\n\n ++++++++++++++++++++     Final texte === ', cumulativeTranscript,'+++++++++++++++++++++++++\n\n\n\n')



        updateEntityUI();
    }

    
    // =========================================================
    // CŒUR 2 : Initialisation et Gestion des Sessions (INCHANGÉES)
    // =========================================================

    function initializeSpeechRecognition(config = null) {

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;

        if (!SpeechRecognition || !SpeechGrammarList) {
            console.error("Speech Recognition non supporté.");
            return;
        }
        
        if (recognition) return; 

        recognition = new SpeechRecognition();
        
        const exitSpellingCommand = ['terminer', 'fin', 'fini']; 
        const spellingWords = [...alphabet, ...digits, ...exitSpellingCommand].join(' | ');
        const spellingGrammarString = `#JSGF V1.0; grammar spelling; public <letter_or_digit> = ${spellingWords} ;`; 

        spellingGrammar = new SpeechGrammarList();
        spellingGrammar.addFromString(spellingGrammarString, 1);
        
        recognition.grammars = new SpeechGrammarList(); 
        
        recognition.lang = targetLang; 
        recognition.continuous = !state.isMobile; 
        recognition.interimResults = true; 

        recognition.onstart = () => {
            updateButtonUI(true); 
            const display = document.getElementById('stt-result-display');
            // Ensure the element displays line breaks from textContent
            if (display) display.style.whiteSpace = 'pre-line';
            
            if (isSpellingMode) {
                display.textContent = `✏️ Mode Épellation (Champ: ${targetSpellingField.toUpperCase()}): Dites une lettre, puis attendez la relance. Dites 'terminer'.`;
            } else {
                display.textContent = "🎤 Écoute en cours... Dites par exemple: \n prénom henri \nnom rousseau GO\nPour épeler un mot dites:\nprénom     lettre par lettre    h e n r i   terminer";
            }
        };


        recognition.onresult = (event) => {
            let interimTranscript = '';
            
            if (!state.isMobile) {
                clearTimeout(recognitionTimeout);
                recognitionTimeout = setTimeout(() => {
                    if (isRecording) {
                        console.log("⏰ PC : Coupure après 20s (limite atteinte).");
                        isRecording = false;
                        recognition.stop();
                    }
                }, PC_MAX_DURATION_MS);
            }
            
            const lastResultIndex = event.results.length - 1;
            const result = event.results[lastResultIndex];
            const transcriptSegment = result[0].transcript.trim().toLowerCase(); 

            if (result.isFinal) {
                
                if (isSpellingMode) {
                    
                    const recognizedSegment = transcriptSegment; 
                    
                    if (recognizedSegment === 'terminer' || recognizedSegment === 'fin' || recognizedSegment === 'fini') {
                        stopSpellingCycle(); 
                        return;
                    }
                    
                    let addedChars = '';
                    let errorDetected = false;
                    
                    for (let i = 0; i < recognizedSegment.length; i++) {
                        const detectedChar = recognizedSegment.charAt(i);
                        
                        if (alphabet.includes(detectedChar) || digits.includes(detectedChar)) {
                            addedChars += detectedChar;
                        } else {
                            errorDetected = true;
                            break; 
                        }
                    }


                    if (addedChars.length > 0) {
                        
                        let currentValue = capturedEntities[targetSpellingField] || '';
                        if (currentValue === 'not detected') currentValue = '';
                        
                        capturedEntities[targetSpellingField] = currentValue + addedChars; 
                        
                        document.getElementById('stt-result-display').textContent = `✅ Ajouté: "${addedChars.toUpperCase()}". Prochaine lettre?`;
                        document.getElementById('stt-interim-display').textContent = `(Reconnu: "${recognizedSegment}"). Valeur actuelle: ${capturedEntities[targetSpellingField]}`;
                        updateEntityUI();
                    } else if (errorDetected) {
                         document.getElementById('stt-result-display').textContent = `❌ Caractère non reconnu/valide. Veuillez réessayer.`;
                         document.getElementById('stt-interim-display').textContent = `(Reconnu: "${recognizedSegment}")`;
                    }
                    
                    return; 
                    
                } else {
                    if (transcriptSegment != '') // && transcriptSegment != ' ')
                    {
                        cumulativeTranscript += transcriptSegment + ' ';
                        console.log('\n\n ------------------   debug  call to processFullTranscript  from recognition.ONRESULT, result.isFinal : !isSpellingMode; cumulativeTranscript=', cumulativeTranscript, 'transcriptSegment=' ,transcriptSegment)
                        processFullTranscript(cumulativeTranscript.trim(), config, 'onResult');
                    }
                }
                ''
            } else {
                interimTranscript += transcriptSegment;
            }
            
            if (!isSpellingMode) {
                // document.getElementById('stt-interim-display').textContent = interimTranscript;
                document.getElementById('stt-result-display').textContent = cumulativeTranscript + interimTranscript;
            }
        };


       
        // recognition.onend = () => {
        //     clearTimeout(recognitionTimeout); 
            
        //     if (pendingSpellingStart) {
                
        //         pendingSpellingStart = false; 
        //         isSpellingMode = true;       

        //         recognition.continuous = false; 
        //         recognition.grammars = spellingGrammar; 
                
        //         try {
        //             recognition.start();
        //             console.log("[LOG STT] BASCULE RÉUSSIE: Mode Libre -> Mode Épellation Stricte 🔄");
        //         } catch(e) {
        //             console.error("Erreur au démarrage du mode épellation après bascule :", e.message);
        //             isRecording = false; 
        //             isSpellingMode = false;
        //             updateButtonUI(false);
        //         }
                
        //     } 
            
        //     else if (isRecording && isSpellingMode) { 
                
        //         try {
        //             recognition.start();
        //             console.log("[LOG STT] RELANCE: Mode Épellation relancé après capture/silence. 🔊");
        //         } catch(e) {
        //             console.log("[LOG STT] Tentative d'arrêt critique du mode épellation.");
        //             isRecording = false; 
        //             isSpellingMode = false; 
        //             updateButtonUI(false);
        //             document.getElementById('stt-result-display').textContent = `⚠️ Épellation interrompue par erreur critique. Redémarrez manuellement.`;
        //         }
                
        //     } 
            
        //     else if (isRecording && !isSpellingMode) { 
                
        //         if (cumulativeTranscript.trim().length > 0) {
        //             console.log('\n\n ------------------   debug  call to processFullTranscript  from recognition.ONEND, else if (isRecording && !isSpellingMode)', cumulativeTranscript )
        //             processFullTranscript(cumulativeTranscript.trim(), config, 'onEnd');
        //             // cumulativeTranscript = ''; 
        //         }

        //         if (state.isMobile) {
        //             setTimeout(() => {
        //                 if (isRecording) { 
        //                     try {
        //                         recognition.start();
        //                     } catch(e) {
        //                         console.warn("Erreur au redémarrage mobile :", e.message);
        //                         isRecording = false; updateButtonUI(false);
        //                     }
        //                 }
        //             }, 1500); 

        //         } else {
        //             isRecording = false;
        //             updateButtonUI(false);
        //             console.log("[LOG STT] Reconnaissance PC terminée (Silence/Timer).");
        //         }

        //     } else {
        //         updateButtonUI(false); 
        //         console.log("[LOG STT] Reconnaissance Vocale arrêtée volontairement/finale.");
        //     }
        // };







        recognition.onend = () => {
            // 🚨 CONSTANTE POUR LE DÉLAI ANTI-BRUIT
            const ANTI_NOISE_DELAY_MS = 500; // Augmenté à 150ms pour une meilleure stabilisation

            clearTimeout(recognitionTimeout); 
            
            if (pendingSpellingStart) {
                
                pendingSpellingStart = false; 
                isSpellingMode = true; 
                recognition.continuous = false; 
                recognition.grammars = spellingGrammar; 
                
                // 🚨 MODIFICATION : Application du délai anti-bruit (150ms)
                setTimeout(() => {
                    try {
                        recognition.start();
                        if (state.isMobile) {
                            speakText(SUPER_LONG_TEXT, 0.6, 0.7);
                        }                        
                        console.log("[LOG STT] BASCULE RÉUSSIE: Mode Libre -> Mode Épellation Stricte 🔄");
                    } catch(e) {
                        console.error("Erreur au démarrage du mode épellation après bascule :", e.message);
                        isRecording = false; 
                        isSpellingMode = false;
                        updateButtonUI(false);
                    }
                }, ANTI_NOISE_DELAY_MS);
                
            } 
            
            else if (isRecording && isSpellingMode) { 
                
                // 🚨 MODIFICATION : Application du délai anti-bruit (150ms)
                setTimeout(() => {
                    try {
                        recognition.start();
                        if (state.isMobile) {
                            speakText(SUPER_LONG_TEXT, 0.6, 0.7);
                        }                        
                        console.log("[LOG STT] RELANCE: Mode Épellation relancé après capture/silence. 🔊");
                    } catch(e) {
                        console.log("[LOG STT] Tentative d'arrêt critique du mode épellation.");
                        isRecording = false; 
                        isSpellingMode = false; 
                        updateButtonUI(false);
                        document.getElementById('stt-result-display').textContent = `⚠️ Épellation interrompue par erreur critique. Redémarrez manuellement.`;
                    }
                }, ANTI_NOISE_DELAY_MS); 
                
            } 
            
            else if (isRecording && !isSpellingMode) { 
                
                if (cumulativeTranscript.trim().length > 0) {
                    console.log('\n\n ------------------   debug  call to processFullTranscript  from recognition.ONEND, else if (isRecording && !isSpellingMode)', cumulativeTranscript )
                    processFullTranscript(cumulativeTranscript.trim(), config, 'onEnd');
                }

                if (state.isMobile) {
                    // 🚨 MODIFICATION : Standardisation du délai à 150ms (ou gardez 1500ms si c'est nécessaire pour le traitement métier!)
                    setTimeout(() => {
                        if (isRecording) { 
                            try {
                                recognition.start();
                                if (state.isMobile) {
                                    speakText(SUPER_LONG_TEXT, 0.6, 0.7);
                                }                                
                            } catch(e) {
                                console.warn("Erreur au redémarrage mobile :", e.message);
                                isRecording = false; updateButtonUI(false);
                            }
                        }
                    }, ANTI_NOISE_DELAY_MS); // Remplacé 1500ms par 150ms
                    
                } else {
                    isRecording = false;
                    updateButtonUI(false);
                    console.log("[LOG STT] Reconnaissance PC terminée (Silence/Timer).");
                }

            } else {
                updateButtonUI(false); 
                console.log("[LOG STT] Reconnaissance Vocale arrêtée volontairement/finale.");
            }
        };











        recognition.onerror = (event) => {
            document.getElementById('stt-result-display').textContent = `Erreur de reconnaissance: ${event.error}`;
            document.getElementById('stt-result-display').style.color = 'red';
            isRecording = false;
            isSpellingMode = false; 
            pendingSpellingStart = false; 
            updateButtonUI(false); 
            console.error("[LOG STT] Erreur STT:", event.error);
            
            // cumulativeTranscript = '';
        };
    }




    // function initializeSpeechRecognition(config = null) {

    //     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    //     const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;

    //     if (!SpeechRecognition || !SpeechGrammarList) {
    //         console.error("Speech Recognition non supporté.");
    //         return;
    //     }
        
    //     if (recognition) return; 

    //     recognition = new SpeechRecognition();
        
    //     const exitSpellingCommand = ['terminer', 'fin', 'fini']; 
    //     const spellingWords = [...alphabet, ...digits, ...exitSpellingCommand].join(' | ');
    //     const spellingGrammarString = `#JSGF V1.0; grammar spelling; public <letter_or_digit> = ${spellingWords} ;`; 

    //     spellingGrammar = new SpeechGrammarList();
    //     spellingGrammar.addFromString(spellingGrammarString, 1);
        
    //     recognition.grammars = new SpeechGrammarList(); 
        
    //     recognition.lang = targetLang; 
    //     recognition.continuous = !state.isMobile; 
    //     recognition.interimResults = true; 

    //     recognition.onstart = () => {
    //         updateButtonUI(true); 
    //         const display = document.getElementById('stt-result-display');
    //         // Ensure the element displays line breaks from textContent
    //         if (display) display.style.whiteSpace = 'pre-line';
    //         display.textContent = "🎤 Écoute en cours... Dites par exemple: \n prénom henri \nnom rousseau GO\nPour épeler un mot dites:\nprénom     lettre par lettre    h e n r i   terminer";
    //     };


    //     recognition.onresult = (event) => {
    //         let interimTranscript = '';
            
    //         if (!state.isMobile) {
    //             clearTimeout(recognitionTimeout);
    //             recognitionTimeout = setTimeout(() => {
    //                 if (isRecording) {
    //                     console.log("⏰ PC : Coupure après 20s (limite atteinte).");
    //                     isRecording = false;
    //                     recognition.stop();
    //                 }
    //             }, PC_MAX_DURATION_MS);
    //         }
            
    //         const lastResultIndex = event.results.length - 1;
    //         const result = event.results[lastResultIndex];
    //         const transcriptSegment = result[0].transcript.trim().toLowerCase(); 

    //         if (result.isFinal) {
                
    //             if (transcriptSegment != '') 
    //             {
    //                 cumulativeTranscript += transcriptSegment + ' ';
    //                 processFullTranscript(cumulativeTranscript.trim(), config, 'onResult');
    //             }
    //         } else {
    //             interimTranscript += transcriptSegment;
    //         }
            
    //         if (!isSpellingMode) {
    //             document.getElementById('stt-result-display').textContent = cumulativeTranscript + interimTranscript;
    //         }
    //     };


       
    //     recognition.onend = () => {
    //         clearTimeout(recognitionTimeout); 
            
    //         if (isRecording) { 
                
    //             if (cumulativeTranscript.trim().length > 0) {
    //                 processFullTranscript(cumulativeTranscript.trim(), config, 'onEnd');
    //             }

    //             if (state.isMobile) {
    //                 setTimeout(() => {
    //                     if (isRecording) { 
    //                         try {
    //                             recognition.start();
    //                         } catch(e) {
    //                             console.warn("Erreur au redémarrage mobile :", e.message);
    //                             isRecording = false; updateButtonUI(false);
    //                         }
    //                     }
    //                 }, 1500); 

    //             } else {
    //                 isRecording = false;
    //                 updateButtonUI(false);
    //                 console.log("[LOG STT] Reconnaissance PC terminée (Silence/Timer).");
    //             }

    //         } else {
    //             updateButtonUI(false); 
    //             console.log("[LOG STT] Reconnaissance Vocale arrêtée volontairement/finale.");
    //         }
    //     };




    //     recognition.onerror = (event) => {
    //         document.getElementById('stt-result-display').textContent = `Erreur de reconnaissance: ${event.error}`;
    //         document.getElementById('stt-result-display').style.color = 'red';
    //         isRecording = false;
    //         updateButtonUI(false); 
    //         console.error("[LOG STT] Erreur STT:", event.error);
    //     };
    // }




    
    // =========================================================
    // Fonctions UI et Démarrage 
    // =========================================================
    function createUIStructure() {
        const overlayId = 'stt-only-overlay';
        const existingOverlay = document.getElementById(overlayId);
        if (existingOverlay) return existingOverlay;
        
        const overlay = document.createElement('div');
        overlay.id = overlayId;
        
        // --- Configuration pour rendre l'overlay NON BLOQUANT ---
        overlay.style.cssText = `
            position: fixed; 
            top: 0; 
            left: 0; 
            width: 100%; 
            height: 100%;
            /* Suppression de la couleur bloquante */
            background-color: transparent; 
            display: none;
            justify-content: center; 
            align-items: center; 
            z-index: 10000;
            /* TRÈS IMPORTANT : Permet de cliquer à travers l'overlay vide */
            pointer-events: none; 
        `;

        const modal = document.createElement('div');
        modal.id = 'speechRecognitionModal';
        modal.style.cssText = `
            background-color: white; padding: 20px; border-radius: 12px; 
            max-width: 400px; width: 90%; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
            font-family: Arial, sans-serif;
            /* Réactiver les clics UNIQUEMENT sur la modale elle-même */
            pointer-events: auto; 
        `;
        
        // Structure HTML pour les champs INPUT ---
        modal.innerHTML = `
            <style>
                /* Styles pour le bouton de fermeture */
                #speechRecognitionModal .stt-close-button {
                    background: #c82333;
                    border: 2px solid white;
                    color: white;
                    font-size: 20px;
                    width: 35px;
                    height: 35px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: transform 0.3s, background 0.3s;
                    line-height: 1;
                    padding: 0;
                }
                #speechRecognitionModal .stt-close-button:hover {
                    background: #a82e38;
                    transform: scale(1.1) rotate(90deg);
                }
                /* Style de base pour les boutons de contrôle */
                .control-btn {
                    padding: 15px 10px; 
                    font-size: 1.1em; 
                    cursor: pointer; 
                    border: none; 
                    border-radius: 8px; 
                    display: flex; 
                    align-items: center; 
                    gap: 5px; 
                    flex-grow: 1; 
                    justify-content: center; 
                    height: 50px;
                }
            </style>

            <div id="speechRecognitionHeader" style="display: block; font-size: ~1.17em; font-weight: bold; border-radius: 12px 12px 0 0; margin-top: -20px; margin-left: -20px; margin-right: -20px; padding-top: 7px; padding-bottom: 7px; padding-left: 20px; padding-right: 20px; display: flex; justify-content: space-between; align-items: center; background-color: #6fb0f6ff;">
                Saisie Vocale (Langue : ${targetLang})
                <button id="close-stt-button" class="stt-close-button" style="cursor: pointer;" onmouseover="this.style.transform='scale(1.1) rotate(90deg)'; this.style.background='#a82e38';" onmouseout="this.style.transform=''; this.style.background='#c82333';">&times;</button>
            </div>

            <div id="stt-container" style="margin-top: 5px; padding: 10px; padding-top: 0px; border: 1px solid #ccc; border-radius: 6px; background-color: #f9f9f9;">
                <div style="display: block; margin-bottom: 1em; padding-top: 0px; margin-top: 5px; font-size: 0.9em; font-weight: bold;">Résultat de la Reconnaissance Vocale:</div>
                <div id="stt-result-display" style="margin-top: -5px; padding-top: 0px; min-height: 1.2em; color: #333; font-style: italic; white-space: pre-line;">
                    ${translate('statusReady')}
                </div>
                <span id="stt-interim-display" style="color: #888; font-style: italic;"></span>
            </div>


            <div id="stt-entity-panel" style="margin-top: 10px; padding: 10px; border: 1px solid #007bff; border-radius: 6px; background-color: #e6f7ff;">
                <p style="margin-top: 0; font-weight: bold; color: #007bff;">
                    ✨ accéssible par la voix (éditable)
                </p>
                <ul id="entity-list" style="list-style: none; padding: 0; margin: 0;">
                    </ul>
            </div>
            
            <div id="control-buttons-wrapper" style="display: flex; justify-content: space-between; gap: 10px; margin-top: 20px;">
                
                <button id="record-voice-button" class="control-btn" style="background-color: #007bff; color: white; flex-grow: 1;">
                    <span style="font-size: 1.2em;">🎙️</span> 
                    <span>${translate('btnRecord')}</span>
                </button>
                
                <button id="erase-and-record-voice-button" class="control-btn" style="background-color: #3bad77ff; color: white; flex-grow: 1; padding:0; margin:0;">
                    <span style="font-size: 1.2em; padding:0;  margin-left=-10px">🗑️🎙️</span> 
                    <span style="padding:0; margin-left=-10px;">${translate('btnEraseRecord')}</span>
                </button>

                <button id="stop-voice-button" class="control-btn" style="display: none; background-color: #dc3545; color: white; flex-grow: 1;">
                    <span style="font-size: 1.5em;">🔴</span> 
                    <span>${translate('btnStopListening')}</span>
                </button>
            </div>

            `;

        // --- AJOUT DES ÉVÉNEMENTS ---
        // Les deux boutons de démarrage appellent toggleSpeechRecognition avec leur mode respectif
        modal.querySelector('#record-voice-button').addEventListener('click', () => toggleSpeechRecognition('continue') );
        modal.querySelector('#erase-and-record-voice-button').addEventListener('click', () => toggleSpeechRecognition('erase') );

        // Le bouton d'arrêt appelle l'action d'arrêt
        modal.querySelector('#stop-voice-button').addEventListener('click', arreterEcouteAction ); 
        
        // Fermeture de la modale
        modal.querySelector('#close-stt-button').addEventListener('click', hideUI);
        
        // Fermeture en cliquant en dehors de la modale (dans l'overlay transparent)
        overlay.addEventListener('click', (e) => {
            if (e.target.id === overlayId) hideUI();
        });

        // Mise à jour de la liste des entités au démarrage
        updateEntityUI();

        overlay.appendChild(modal);
        document.body.appendChild(overlay);


        // Gestion du déplacement et du redimensionnement
        const content = document.getElementById('speechRecognitionModal');
        const header = document.getElementById('speechRecognitionHeader');
        
        makeModalDraggableAndResizable(content, header, false);
        makeModalInteractive(overlay); 

        return overlay;
    }

    function updateButtonUI(isListening) {
        
        // Récupérer les trois éléments de contrôle
        const recordBtn = document.getElementById('record-voice-button');
        const eraseBtn = document.getElementById('erase-and-record-voice-button');
        const stopBtn = document.getElementById('stop-voice-button');
        const wrapper = document.getElementById('control-buttons-wrapper'); // Le conteneur Flex
        
        const resultDisplay = document.getElementById('stt-result-display');
        
        if (!recordBtn || !eraseBtn || !stopBtn || !resultDisplay) return;

        if (isListening) {
            // MODE ÉCOUTE (Afficher seulement le bouton STOP)
            
            recordBtn.style.display = 'none';
            eraseBtn.style.display = 'none';
            
            stopBtn.style.display = 'flex'; // Afficher le bouton d'arrêt
            wrapper.style.justifyContent = 'center';

            resultDisplay.style.color = '#333';
        } else {
            // MODE PRÊT (Afficher les deux boutons START/ERASE)
            
            recordBtn.style.display = 'flex'; // Afficher les deux boutons de démarrage
            eraseBtn.style.display = 'flex';
            
            stopBtn.style.display = 'none'; // Cacher le bouton d'arrêt
            wrapper.style.justifyContent = 'space-between';

            resultDisplay.style.color = '#333';
            if (!resultDisplay.textContent.startsWith('Erreur') && !resultDisplay.textContent.startsWith('🔍') && !resultDisplay.textContent.startsWith('⚠️') && !resultDisplay.textContent.startsWith('✅')) {
                resultDisplay.textContent = translate('statusReady');
            }
        }
    }



    /**
     * Gère le clic sur un élément de la liste de suggestions personnalisée.
     * @param {Event} e - L'événement mousedown.
     * @param {HTMLElement} li - L'élément <li> sélectionné.
     * @param {HTMLElement} inputEl - L'élément <input> de l'action.
     * @param {HTMLElement} suggestionsList - L'élément <ul> de la liste.
     * @param {string} fieldName - Le nom du champ (translate('question')).
     */
    function handleSuggestionClick(e, li, inputEl, suggestionsList, fieldName) {
        e.preventDefault(); 
        e.stopPropagation();

        const selectedValue = li.textContent;
        inputEl.value = selectedValue;
        suggestionsList.style.display = 'none'; 

        // 1. Déclenchement de l'action
        console.log(`[ACTION] Déclenchement de l'action sélectionnée : "${selectedValue}"`);

        // if (typeof action === 'function') { 
            // action(selectedValue);

        // Mettre à jour l'entité et le transcript
        capturedEntities[translate('question')] = selectedValue;
        cumulativeTranscript += ' ' + selectedValue + ' go ';
        console.log('\n\n\n ----- debug  list ----- cumulativeTranscript before =', cumulativeTranscript, ',originalValue=' ,selectedValue)
        processFullTranscript(cumulativeTranscript, null, true)
        // } 
        
        // 2. Mise à jour de l'état et rafraîchissement de l'UI
        if (typeof updateCapturedEntity === 'function') {
            updateCapturedEntity(fieldName, selectedValue);
        }
    }















    // function updateEntityUI(config = null) {
        
    //     const listElement = document.getElementById('entity-list');
    //     if (!listElement) return;

    //     console.log("[UI LOG] Démarrage de updateEntityUI. Configuration:", config);

    //     if (config === 'start') {
    //         entityKeys = ['prénom', 'nom', 'entrez'];
    //         capturedEntities = entityKeys.reduce((acc, field) => {
    //             acc[field] = 'not detected';
    //             return acc;
    //         }, {});
    //     }

    //     listElement.innerHTML = ''; 
        
    //     const actionKeywords = ['whoAreYou', 'whatIsYourName', 'whoCreatedYou', 'whatisTheUse', 'search', 'research', 'readSheet', 'whenBorn', 'whenDead', 
    //         'whatAge', 'whereLive', 'whatProfession', 'whatOccupation', 'whoMarried', 'howManyChildren', 'whoIsFather', 'whoIsMother', 'whoAreSibling','whatIsHistorical', 'whatAreNotes'];

    //     // Suppression des anciennes datalist natives si elles existent pour éviter les conflits
    //     const DATALIST_ID = 'action-datalist'; 
    //     let oldDatalist = document.getElementById(DATALIST_ID);
    //     if (oldDatalist) {
    //         oldDatalist.remove();
    //         console.log("[UI LOG] Suppression de la datalist native.");
    //     }
        
    //     for (const field in capturedEntities) {
            
    //         const entityData = capturedEntities[field];
    //         const entityValue = (typeof entityData === 'object' && entityData !== null && 'value' in entityData) 
    //             ? entityData.value 
    //             : entityData;

    //         if (entityValue === 'not detected' || field === 'pause') {
    //             continue;
    //         }

    //         const listItem = document.createElement('li');
    //         listItem.style.cssText = 'padding: 5px 0; font-size: 0.9em; display: flex; align-items: center; justify-content: space-between;';
            
    //         const label = document.createElement('strong');
    //         label.textContent = `${field.charAt(0).toUpperCase() + field.slice(1)}:`; 
    //         label.style.width = '100px'; 
            
    //         let inputField; 
    //         const displayValue = entityValue.trim(); 
            
    //         if (field === translate('question')) {
                
    //             // 1. CRÉATION DU CONTENEUR (positionnement relatif pour la liste déroulante)
    //             const container = document.createElement('div');
    //             container.style.cssText = `
    //                 position: relative; 
    //                 flex-grow: 1;
    //                 margin-left: 10px;
    //             `;
                
    //             // 2. CRÉATION DE L'INPUT
    //             inputField = document.createElement('input');
    //             inputField.type = 'text';
    //             inputField.id = `input-${field}`; 
    //             inputField.value = displayValue;

    //             // 3. CRÉATION DE LA FLÈCHE (Look: Indicateur Visuel)
    //             const arrow = document.createElement('span');
    //             arrow.style.cssText = `
    //                 position: absolute;
    //                 right: 5px;
    //                 top: 50%;
    //                 transform: translateY(-50%);
    //                 pointer-events: none;
    //                 color: #555;
    //                 font-size: 0.8em;
    //                 height: 10px;
    //                 line-height: 10px;
    //             `;
    //             arrow.textContent = '▼';

    //             // 4. CRÉATION DE LA LISTE DE SUGGESTIONS (Look: Esthétique)
    //             // const suggestionsList = document.createElement('ul');
    //             // suggestionsList.style.cssText = `
    //             //     list-style-type: none;
    //             //     padding: 0;
    //             //     margin: 0;
    //             //     position: absolute;
    //             //     top: 100%; 
    //             //     left: 0;
    //             //     right: 0;
    //             //     z-index: 1000;
    //             //     max-height: 200px;
    //             //     overflow-y: auto;
    //             //     border: 1px solid #ccc;
    //             //     border-top: none;
    //             //     background-color: white;
    //             //     box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    //             //     display: none; 
    //             //     width: 100%;
    //             //     box-sizing: border-box; 
    //             // `;


    //             // 4. CRÉATION DE LA LISTE DE SUGGESTIONS (Look: Esthétique)
    //             const suggestionsList = document.createElement('ul');
    //             suggestionsList.style.cssText = `
    //                 list-style-type: none;
    //                 padding: 0;
    //                 margin: 0;
    //                 position: absolute;
    //                 top: auto;        /* 🚨 CHANGÉ : Positionnement automatique en haut */
    //                 bottom: 100%;     /* 🚨 CHANGÉ : Le bas de la liste est aligné avec le haut de l'input */
    //                 left: 0;
    //                 right: 0;
    //                 z-index: 1000;
    //                 max-height: 200px; 
    //                 overflow-y: auto;
    //                 border: 1px solid #ccc;
    //                 border-bottom: none; /* 🚨 OPTIMISATION : Enlève la bordure du bas pour la mettre en haut */
    //                 border-top: 1px solid #ccc; /* 🚨 AJOUT : Met la bordure en haut */
    //                 background-color: white;
    //                 box-shadow: 0 -4px 8px rgba(0, 0, 0, 0.2); /* 🚨 OPTIMISATION : Ombre vers le haut */
    //                 display: none; 
    //                 width: 100%;
    //                 box-sizing: border-box; 
    //             `;



    //             // --- NOUVELLE FONCTION : Remplir la liste (filtrage facultatif) ---
    //             const fillSuggestions = function(searchValue = '') {
    //                 suggestionsList.innerHTML = '';
    //                 const searchLower = searchValue.toLowerCase();
    //                 let resultsCount = 0;

    //                 actionKeywords.forEach(keyword => {
    //                     if (searchValue === '' || keyword.toLowerCase().includes(searchLower)) {
    //                         const li = document.createElement('li');
    //                         li.textContent = translate(keyword);
                            
    //                         // Look: Style de l'item et gestion du mobile
    //                         li.style.cssText = `
    //                             padding: 3px 12px; /* Réduit le padding vertical de 8px à 5px */
    //                             cursor: pointer;
    //                             font-size: 0.9em;
    //                             color: #333;
    //                             transition: background-color 0.1s ease;
    //                             min-height: 15px; /* Réduit la hauteur minimale de 35px à 25px */
    //                             line-height: 1.5;
    //                         `;
    //                         li.addEventListener('mouseenter', () => li.style.backgroundColor = '#f0f0f0');
    //                         li.addEventListener('mouseleave', () => li.style.backgroundColor = 'white');
    //                         li.addEventListener('mousedown', (e) => handleSuggestionClick(e, li, inputField, suggestionsList, field));
                            
    //                         suggestionsList.appendChild(li);
    //                         resultsCount++;
    //                     }
    //                 });
    //                 return resultsCount;
    //             };

    //             // GESTIONNAIRE 1 : FILTRAGE (INPUT)
    //             inputField.addEventListener('input', function(e) {
    //                 e.stopPropagation();
    //                 const count = fillSuggestions.call(this, this.value);
                    
    //                 suggestionsList.style.display = count > 0 ? 'block' : 'none';
    //                 console.log(`[LOG Saisie] Suggestions filtrées : ${count} résultats. Affichage: ${suggestionsList.style.display}`); 
    //                 updateCapturedEntity(field, this.value);
    //             });
                
    //             // GESTIONNAIRE 2 : AFFICHAGE AU CLIC (CORRECTION)
    //             inputField.addEventListener('click', function(e) {
    //                 e.stopPropagation();
                    
    //                 // Si la liste est cachée, on l'affiche avec toutes les options
    //                 if (suggestionsList.style.display === 'none') {
                        
    //                     const count = fillSuggestions.call(this, ''); // Remplir sans filtre
                        
    //                     if (count > 0) {
    //                         suggestionsList.style.display = 'block';
    //                         console.log("[LOG Clic] Liste affichée (forcée par clic)."); 
    //                     } else {
    //                         console.log("[LOG Clic] Liste VIDE, affichage impossible.");
    //                     }
    //                 } else {
    //                     // Sinon, on la cache
    //                     suggestionsList.style.display = 'none';
    //                     console.log("[LOG Clic] Liste masquée (Toggle).");
    //                 }
    //             });

    //             // GESTIONNAIRE 3 : MASQUAGE LORSQUE L'UTILISATEUR QUITTE LE CHAMP
    //             inputField.addEventListener('blur', function(e) {
    //                 setTimeout(() => {
    //                     suggestionsList.style.display = 'none';
    //                     console.log("[LOG Blur] Liste masquée (perte de focus).");
    //                 }, 150); 
    //             });


    //             // Construction du conteneur
    //             container.appendChild(inputField);
    //             container.appendChild(arrow); // Ajout de la flèche
    //             container.appendChild(suggestionsList);
    //             inputField = container; 
                
    //         } else {
    //             // BLOC DES AUTRES CHAMPS
    //             inputField = document.createElement('input');
    //             inputField.type = 'text';
    //             inputField.id = `input-${field}`; 
    //             inputField.value = displayValue;
    //         }

    //         // -------------------------------------------------------------
    //         // GESTIONNAIRES COMMUNS
    //         // -------------------------------------------------------------

    //         const targetInput = (field === translate('question')) ? inputField.querySelector('input') : inputField;
    //         targetInput.dataset.fieldName = field;

    //         if (field !== translate('question')) {
    //             targetInput.oninput = (e) => {
    //                 e.stopPropagation(); 
    //                 const nameFromData = e.target.dataset.fieldName; 
    //                 if (typeof nameFromData === 'string') {
    //                     updateCapturedEntity(nameFromData, e.target.value);
    //                 }
    //             };
    //         }
            
    //         const color = displayValue.length > 0 ? '#28a745' : '#999';
            
    //         // 🚨 STYLES INJECTÉS pour le véritable input (avec espace pour la flèche)
    //         targetInput.style.cssText = `
    //             flex-grow: 1; 
    //             padding: 5px 25px 5px 5px; 
    //             border: 1px solid ${color}; 
    //             border-radius: 4px;
    //             font-weight: bold;
    //             color: ${color}; 
    //             width: 100%; 
    //             box-sizing: border-box; 
    //         `;
            
    //         listItem.appendChild(label);
    //         listItem.appendChild(inputField); 
    //         listElement.appendChild(listItem);
    //     }
    // }









function updateEntityUI(config = null) {
    
    const listElement = document.getElementById('entity-list');
    if (!listElement) return;

    console.log("[UI LOG] Démarrage de updateEntityUI. Configuration:", config);

    // ... (Logique de réinitialisation des entités inchangée) ...
    if (config === 'start') {
        entityKeys = ['prénom', 'nom', 'entrez'];
        capturedEntities = entityKeys.reduce((acc, field) => {
            acc[field] = 'not detected';
            return acc;
        }, {});
    }

    listElement.innerHTML = ''; 
    
    const actionKeywords = ['whoAreYou', 'whatIsYourName', 'whoCreatedYou', 'whatisTheUse', 'search', 'research', 'readSheet', 'whenBorn', 'whenDead', 
        'whatAge', 'whereLive', 'whatProfession', 'whatOccupation', 'whoMarried', 'howManyChildren', 'whoIsFather', 'whoIsMother', 'whoAreSibling','whatIsHistorical', 'whatAreNotes'];

    const DATALIST_ID = 'action-datalist'; 
    let oldDatalist = document.getElementById(DATALIST_ID);
    if (oldDatalist) {
        oldDatalist.remove();
        console.log("[UI LOG] Suppression de la datalist native.");
    }
    
    for (const field in capturedEntities) {
        
        const entityData = capturedEntities[field];
        const entityValue = (typeof entityData === 'object' && entityData !== null && 'value' in entityData) 
            ? entityData.value 
            : entityData;

        if (entityValue === 'not detected' || field === 'pause') {
            continue;
        }

        const listItem = document.createElement('li');
        // 🚨 MODIFICATION MAJEURE : Ajout de position: relative pour aligner la liste/flèche
        listItem.style.cssText = 'padding: 5px 0; font-size: 0.9em; display: flex; align-items: center; justify-content: space-between; position: relative;'; 
        
        const label = document.createElement('strong');
        label.textContent = `${field.charAt(0).toUpperCase() + field.slice(1)}:`; 
        label.style.width = '100px'; 
        
        let inputField; 
        const displayValue = entityValue.trim(); 
        
        if (field === translate('question')) {
            
            // 1. CRÉATION DE L'INPUT (PAS DE CONTENEUR DIV)
            inputField = document.createElement('input');
            inputField.type = 'text';
            inputField.id = `input-${field}`; 
            inputField.value = displayValue;
            
            // 2. CRÉATION DE LA FLÈCHE (Look: Indicateur Visuel)
            const arrow = document.createElement('span');
            // 🚨 STYLES INJECTÉS : Positionnement absolu par rapport au LI
            arrow.style.cssText = `
                position: absolute;
                right: 5px;
                top: 50%;
                transform: translateY(-50%);
                pointer-events: none;
                color: #555;
                font-size: 0.8em;
                height: 10px;
                line-height: 10px;
                /* Positionnement par rapport à la bordure de l'input */
                right: 5px; 
            `;
            arrow.textContent = '▼';

            // 3. CRÉATION DE LA LISTE DE SUGGESTIONS (Look: Esthétique)
            const suggestionsList = document.createElement('ul');
            // 🚨 STYLES INJECTÉS : Positionnement absolu par rapport au LI
            suggestionsList.style.cssText = `
                list-style-type: none;
                padding: 0;
                margin: 0;
                position: absolute;
                top: auto;        
                bottom: 100%;     
                
                /* 🚨 ALIGNEMENT AVEC L'INPUT ET LE LABEL */
                left: 110px; /* Largeur du label (100px) + margin-left de l'input (10px) */
                right: 0;
                
                z-index: 1000;
                max-height: 200px; 
                overflow-y: auto;
                border: 1px solid #ccc;
                border-bottom: none; 
                border-top: 1px solid #ccc; 
                background-color: white;
                box-shadow: 0 -4px 8px rgba(0, 0, 0, 0.2); 
                display: none; 
                /* 🚨 LARGEUR DÉPEND MAINTENANT DE LEFT/RIGHT, elle sera alignée sur l'input */
                box-sizing: border-box; 
            `;

            // --- LOGIQUE DE GESTION DES ÉVÉNEMENTS (inchangée) ---

            const fillSuggestions = function(searchValue = '') {
                suggestionsList.innerHTML = '';
                const searchLower = searchValue.toLowerCase();
                let resultsCount = 0;

                actionKeywords.forEach(keyword => {
                    if (searchValue === '' || keyword.toLowerCase().includes(searchLower)) {
                        const li = document.createElement('li');
                        li.textContent = translate(keyword);
                        li.style.cssText = `
                            padding: 3px 12px; 
                            cursor: pointer;
                            font-size: 0.9em;
                            color: #333;
                            transition: background-color 0.1s ease;
                            min-height: 15px; 
                            line-height: 1.5;
                        `;
                        li.addEventListener('mouseenter', () => li.style.backgroundColor = '#f0f0f0');
                        li.addEventListener('mouseleave', () => li.style.backgroundColor = 'white');
                        li.addEventListener('mousedown', (e) => handleSuggestionClick(e, li, inputField, suggestionsList, field));
                        
                        suggestionsList.appendChild(li);
                        resultsCount++;
                    }
                });
                return resultsCount;
            };

            inputField.addEventListener('input', function(e) {
                e.stopPropagation();
                const count = fillSuggestions.call(this, this.value);
                suggestionsList.style.display = count > 0 ? 'block' : 'none';
                updateCapturedEntity(field, this.value);
            });
            
            inputField.addEventListener('click', function(e) {
                e.stopPropagation();
                if (suggestionsList.style.display === 'none') {
                    const count = fillSuggestions.call(this, ''); 
                    if (count > 0) {
                        suggestionsList.style.display = 'block';
                    }
                } else {
                    suggestionsList.style.display = 'none';
                }
            });

            inputField.addEventListener('blur', function(e) {
                setTimeout(() => {
                    suggestionsList.style.display = 'none';
                }, 150); 
            });

            // 🚨 ATTENTION : La flèche et la liste sont ajoutées au listItem, pas au inputField
            listItem.appendChild(arrow);
            listItem.appendChild(suggestionsList);
            
        } else {
            // BLOC DES AUTRES CHAMPS
            inputField = document.createElement('input');
            inputField.type = 'text';
            inputField.id = `input-${field}`; 
            inputField.value = displayValue;
        }

        // -------------------------------------------------------------
        // GESTIONNAIRES ET STYLES COMMUNS
        // -------------------------------------------------------------

        const targetInput = inputField; // targetInput est maintenant toujours inputField

        targetInput.dataset.fieldName = field;

        if (field !== translate('question')) {
            targetInput.oninput = (e) => {
                e.stopPropagation(); 
                const nameFromData = e.target.dataset.fieldName; 
                if (typeof nameFromData === 'string') {
                    updateCapturedEntity(nameFromData, e.target.value);
                }
            };
        }
        
        const color = displayValue.length > 0 ? '#28a745' : '#999';
        
        // 🚨 STYLES INJECTÉS pour le véritable input (Identiques pour tous les champs)
        targetInput.style.cssText = `
            flex-grow: 1; 
            padding: 5px 25px 5px 5px; /* Espace pour la flèche */
            border: 1px solid ${color}; 
            border-radius: 4px;
            font-weight: bold;
            color: ${color}; 
            /* 🚨 AJUSTEMENT CLÉ : Margin-left aligne le champ avec les autres */
            margin-left: 10px; 
            width: auto; /* La flexbox gère la largeur */
            box-sizing: border-box; 
        `;
        
        // Ajout au DOM
        listItem.appendChild(label);
        listItem.appendChild(inputField); 
        // Les autres éléments (flèche et liste) sont déjà attachés au listItem
        listElement.appendChild(listItem);
    }
}





    /**
     * Ouvre le microphone manuellement via getUserMedia et le maintient ouvert.
     * C'est l'étape CLÉ qui supprime les jingles.
     */
    function openMicrophoneStream() {
        // Si le flux est déjà ouvert, on ne fait rien
        if (mediaStream) return Promise.resolve(); 
        
        // Demande l'accès au microphone (audio: true)
        return navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                mediaStream = stream;
                // Optionnel: Connexion à un AudioContext si vous voulez vraiment garantir l'activité, 
                // mais souvent, juste l'ouverture du stream suffit.
                console.log("[MIC CONTROL] Flux microphone ouvert et maintenu.");
            })
            .catch(err => {
                console.error("[MIC CONTROL] Erreur à l'ouverture du microphone:", err.message);
                // Si l'ouverture échoue (ex: permission refusée), on laisse l'ancienne méthode continuer.
            });
    }

    /**
     * Ferme le microphone stream (à appeler uniquement lors de l'arrêt complet par l'utilisateur).
     */
    function closeMicrophoneStream() {
        if (mediaStream) {
            // Arrête toutes les pistes (tracks) du flux, fermant physiquement le micro.
            mediaStream.getTracks().forEach(track => track.stop());
            mediaStream = null;
            console.log("[MIC CONTROL] Flux microphone fermé.");
        }
    }



    function toggleSpeechRecognition(mode = 'continue') {

        let config = localConfig;
        initializeSpeechRecognition(config);

        if (isRecording) {
            isRecording = false; 
            isSpellingMode = false;
            pendingSpellingStart = false; 
            clearTimeout(recognitionTimeout); 
            recognition.stop();
            if (state.isMobile && window.speechSynthesis.speaking) {
                // window.speechSynthesis.cancel(); 
            }
        } else {


            if (mode === 'erase') {
                // Efface toutes les entités capturées (utile pour le bouton "Tout effacer & Écouter")
                // entityKeys.forEach(key => {
                //      capturedEntities = [];
                //      cumulativeTranscript = '';
                // });
                entityKeys.forEach(key => {
                    // Utilise la même logique que celle définie dans updateEntityUI pour vider
                    if (typeof capturedEntities[key] === 'object' && capturedEntities[key] !== null) {
                        capturedEntities[key].value = 'not detected';
                        capturedEntities[key].alternatives = [];
                    } else {
                        capturedEntities[key] = 'not detected';
                    }
                    cumulativeTranscript = '';
                });



                updateEntityUI(); // Met à jour l'UI pour montrer que les champs sont vides
            }

            recognition.lang = targetLang;
            isRecording = true; 
            isSpellingMode = false;
            pendingSpellingStart = false; 
            // cumulativeTranscript = '';
            
            recognition.continuous = !state.isMobile; 
            recognition.grammars = new SpeechGrammarList(); 
            
            document.getElementById('stt-result-display').textContent = '';
            // Définissez cette constante quelque part au début de votre fichier JS
            // const BARELY_AUDIBLE_SOUND = '.,.,.,.,.,.,.,.,.,.,.,.,.,.,.,.'; // 30 répétitions d'une virgule/point

            // Utilisation d'une boucle for pour garantir la compatibilité
            for (let i = 0; i < REPETITIONS; i++) {
                SUPER_LONG_TEXT += LONG_PHRASE;
            }

            try {

                // openMicrophoneStream();

                recognition.start();
                // if (state.isMobile) {
                if (true) {
                    speakText(SUPER_LONG_TEXT, 0.6, 0.7);
                }
                // speakText('phrase très très très longue phrase très très très longue  phrase très très très longue phrase très très très longue phrase très très très longue phrase très très très longue phrase très très très longue phrase très très très longue phrase très très très longue  phrase très très très longue phrase très très très longue phrase très très très longue phrase très très très longue phrase très très très longue phrase très très très longue phrase très très très longue  phrase très très très longue phrase très très très longue phrase très très très longue phrase très très très longue phrase très très très longue ',  0.5)
                // speakText(BARELY_AUDIBLE_SOUND, 0.9, 0.9);


                // speakText(SUPER_LONG_TEXT, 0.005, 0.7); // Juste un espace ou un son très court et discret
                // startTTSLoop();
                // speakContinuousLoop('aaaaaaaaaaaaaaa', 0.5, 1.0)


                
                if (!state.isMobile) {
                    clearTimeout(recognitionTimeout);
                    recognitionTimeout = setTimeout(() => {
                        if (isRecording) {
                            isRecording = false;
                            recognition.stop();
                        }
                    }, PC_MAX_DURATION_MS);
                }
                if (state.isMobile) {
                    // window.speechSynthesis.cancel(); 
                }

            } catch (e) {
                console.error("Erreur au démarrage de la reconnaissance:", e);
                document.getElementById('stt-result-display').textContent = "Erreur au démarrage. Veuillez vérifier les permissions.";
                document.getElementById('stt-result-display').style.color = 'red';

                initializeSpeechRecognition(config);
                recognition.start();
                if (state.isMobile) {
                    speakText(SUPER_LONG_TEXT, 0.6, 0.7);
                }

                isRecording = false; 
                updateButtonUI(false);
            }
        }
    }

    // --- Fonctions Publiques ---

/**
     * Récupère les données des entités capturées (Voix ou Clavier).
     * Nettoie les valeurs "not detected" ou vides.
     * @returns {Object} Un objet contenant les paires clé/valeur des entités.
     */
    function getCapturedData() {
        const finalData = {};
        
        for (const field in capturedEntities) {
            const value = capturedEntities[field].trim();
            
            // On ne retourne que les champs qui contiennent une valeur valide
            if (value && value !== 'not detected') {
                finalData[field] = value;
            }
        }
        
        return finalData;
    }



    function showUI(config = null) {

        const overlay = createUIStructure();
        // if (!recognition) 
        cumulativeTranscript = ''
        initializeSpeechRecognition(config); 
        
        document.getElementById('stt-result-display').textContent = translate('statusReady');
        document.getElementById('stt-result-display').style.color = '#333';
        document.getElementById('stt-interim-display').textContent = '';

        overlay.style.display = 'flex';

        updateEntityUI(config);

        toggleSpeechRecognition(); 

    }

    function hideUI() {
        const overlay = document.getElementById('stt-only-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
        if (isRecording && recognition) {
            isRecording = false;
            recognition.stop(); 
            if (state.isMobile && window.speechSynthesis.speaking) {
                // window.speechSynthesis.cancel(); 
            }
        }
        
        capturedEntities = entityKeys.reduce((acc, field) => {
            acc[field] = 'not detected';
            return acc;
        }, {});
    }


    return {
        showUI: showUI,
        hideUI: hideUI,
        processTranscript: processFullTranscript, 
        getCapturedData: getCapturedData
    };

})();



// /**
//  * Initialise le moteur de synthèse vocale pour éliminer le "glitch" ou délai initial.
//  * À appeler une seule fois au chargement de l'application.
//  */
// export function initializeSpeechEngine() {
//     // 1. Annuler la parole précédente au cas où
//     window.speechSynthesis.cancel(); 

//     // 2. Créer une Utterance silencieuse
//     const utterance = new SpeechSynthesisUtterance(' '); // Un seul espace

//     // 3. Tenter de trouver une voix française par défaut pour le warm-up
//     const voices = window.speechSynthesis.getVoices();
//     const frenchVoice = voices.find(v => v.lang.startsWith('fr') || v.default);
    
//     if (frenchVoice) {
//         utterance.voice = frenchVoice;
//         utterance.lang = frenchVoice.lang;
//     }

//     // 4. Lancer la parole et l'annuler immédiatement
//     try {
//         window.speechSynthesis.speak(utterance);
//         // Annuler immédiatement après le démarrage de la queue. 
//         // Laisse le temps au moteur de s'initialiser sans prononcer le son.
//         window.speechSynthesis.cancel();
//         console.log("Moteur de synthèse vocale initialisé (Warm-up effectué).");
//     } catch (error) {
//         console.warn("Échec de l'initialisation du moteur de parole (probablement non supporté ou non autorisé).", error);
//     }
// }


/**
 * Prononce le texte donné en utilisant la voix sélectionnée par l'utilisateur.
 * Intègre l'annulation des paroles précédentes pour éviter les conflits.
 * * @param {string} text - Le texte à prononcer.
 */
export function speakText(text, volume = 1.0, rate = 1.0) {
    if (!text) return;

    // 1. Annule toujours toute parole en cours pour éviter la file d'attente (glitch secondaire)
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }
    
    // Assurez-vous que VoiceSelectorUI est disponible et contient la bonne méthode
    // J'utilise ici un placeholder pour la fonction getSelectedVoice
    const voiceToUse = VoiceSelectorUI.getSelectedVoice(); 
    
    if (!voiceToUse) {
        console.warn("Pas de voix sélectionnée pour speakText. Utilisation de la voix par défaut du système.");
        // Le navigateur utilisera la voix par défaut si utterance.voice n'est pas défini.
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (voiceToUse) {
        utterance.voice = voiceToUse;
        utterance.lang = voiceToUse.lang;
        utterance.volume = volume;
        utterance.rate = rate;
        
        // Optionnel : ajouter des logs de débogage des événements
        // utterance.onstart = () => console.log('Parole démarrée');
        // utterance.onend = () => console.log('Parole terminée');
    } else {
        // Optionnel : Tentative de forcer la langue si aucune voix n'est sélectionnée
        utterance.lang = window.CURRENT_LANGUAGE || 'fr-FR'; 
    }

    try {
        window.speechSynthesis.speak(utterance);
    } catch (error) {
        console.error("Erreur lors de l'appel à speechSynthesis.speak :", error);
    }
}





/**
 * Prononce un texte en utilisant la voix sélectionnée et attend la fin de la prononciation.
 * @param {string} text - Le texte à prononcer.
 * @returns {Promise<void>} Une promesse qui se résout lorsque la prononciation est terminée.
 */
export function speakTextWithWaitToEnd(text, volume = 1.0) {
    return new Promise((resolve, reject) => { // La fonction retourne une Promesse
        
        const voiceToUse = VoiceSelectorUI.getSelectedVoice();
        const utterance = new SpeechSynthesisUtterance(text);
        
        // --- GESTION DES ÉVÉNEMENTS POUR LA PROMESSE ---
        
        // 1. Événement de FIN : Résout la promesse
        utterance.onend = () => {
            console.log("Prononciation terminée pour :", text);
            resolve(); // La prononciation est finie, on résout la Promesse.
        };

        // 2. Événement d'ERREUR : Rejette la promesse
        utterance.onerror = (event) => {
            console.error("Erreur de prononciation:", event.error);
            // On utilise la fonction reject() pour indiquer l'échec.
            reject(new Error(`Erreur de synthèse vocale: ${event.error}`)); 

            //////////////// 

            //  ATTENTION ICI trouver un moyen de DEPLANTER la SYNTHESE VOCALE !!!!!!!!!

            /////////




        };
        
        // ------------------------------------------------
        
        if (voiceToUse) {
            utterance.voice = voiceToUse;
            utterance.lang = voiceToUse.lang;
            utterance.volume = volume;
            window.speechSynthesis.speak(utterance);
        } else {
            const warning = "Pas de voix sélectionnée pour speakText. Résolution immédiate.";
            console.warn(warning);
            // Si l'on ne parle pas, on résout immédiatement la Promesse.
            resolve(); 
        }
    });
}









let ttsLoopInterval = null; // Variable pour stocker l'ID de l'intervalle

// /**
//  * Fonction centrale pour générer la parole TTS
//  * @param {string} text Le texte à lire (un simple espace pour la discrétion)
//  * @param {number} volume Le volume (entre 0.0 et 1.0)
//  * @param {number} rate La vitesse (entre 0.1 et 10.0)
//  */
// function speakText(text, volume, rate) {
//     if ('speechSynthesis' in window) {
//         window.speechSynthesis.cancel(); // Annule tout ce qui est en cours
        
//         const utterance = new SpeechSynthesisUtterance(text);
//         utterance.volume = volume;
//         utterance.rate = rate;
        
//         // La langue est importante pour que le moteur sache comment interpréter l'espace
//         utterance.lang = 'fr-FR'; // Assurez-vous que la langue est correcte

//         window.speechSynthesis.speak(utterance);
//     }
// }

/**
 * Démarre la boucle de synthèse vocale pour maintenir le focus audio.
 * Utilise des paramètres audibles pour le test PC.
 */
function startTTSLoop(isMobileTest = false) {
    // Nettoie l'ancien intervalle
    if (ttsLoopInterval !== null) {
        clearInterval(ttsLoopInterval);
    }
    
    // 🚨 PARAMÈTRES POUR LE TEST D'AUDIBILITÉ SUR PC
    let volumeToUse = 0.5; // 50% du volume pour le test PC
    let intervalDuration = 2000; // Relance toutes les 2 secondes

    if (isMobileTest) {
        // Paramètres réels pour l'inaudibilité en mobile
        volumeToUse = 0.01; 
        intervalDuration = 2000; 
    }
    
    // Fonction qui relance une parole TTS très courte
    const playSilentSound = () => {
        // Un simple espace est utilisé
        speakText('oooooooooooooooooooooooooooooooooooooooo', volumeToUse, 1.0); 
    };

    // 1. Lance la première fois immédiatement
    playSilentSound();
    
    // 2. Relance la parole de manière continue
    ttsLoopInterval = setInterval(playSilentSound, intervalDuration); 
    console.log(`[TTS LOOP] Boucle de parole de fond démarrée. Volume: ${volumeToUse}`);
}



let isLoopActive = false; // Drapeau global pour contrôler l'arrêt

/**
 * Lit la chaîne de manière continue en utilisant l'événement onend.
 * @param {string} text La chaîne à lire continuellement (ex: 'oooooooooo')
 * @param {number} volume Le volume (0.0 à 1.0)
 * @param {number} rate La vitesse (0.1 à 10.0)
 */
function speakContinuousLoop(text, volume, rate) {
    if (!('speechSynthesis' in window)) {
        console.error("La synthèse vocale n'est pas supportée dans ce navigateur.");
        return;
    }
    
    // Annule toute parole en cours pour s'assurer que nous commençons à neuf
    // window.speechSynthesis.cancel();
    
    isLoopActive = true;
    
    // Crée l'objet utterance qui servira de modèle pour la boucle
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = volume;
    utterance.rate = rate;
    utterance.lang = 'fr-FR'; // Assurez-vous que la langue est correcte

    // 🔑 CLÉ : Définition de l'événement de fin de parole
    utterance.onend = () => {
        if (isLoopActive) {
            // Relance immédiatement la lecture de la même utterance
            window.speechSynthesis.speak(utterance); 
        }
    };

    utterance.onerror = (event) => {
        console.error("Erreur de parole :", event);
        isLoopActive = false;
    };

    // Lance la lecture initiale pour démarrer la boucle
    window.speechSynthesis.speak(utterance);
    console.log("Boucle de parole continue démarrée.");
}



/**
 * Arrête la boucle de parole de fond et annule la synthèse en cours.
 */
function stopTTSLoop() {
    if (ttsLoopInterval !== null) {
        clearInterval(ttsLoopInterval);
        ttsLoopInterval = null;
    }
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); 
    }
    console.log("[TTS LOOP] Boucle de parole de fond arrêtée.");
}
















export function voiceModal() {
    VoiceSelectorUI.showUI();
}

export function loadVoices() {
    VoiceSelectorUI.loadVoices()
}


export function voiceCommand(config = null) {
    localConfig = config;
    SpeechRecognitionUI.showUI(config);
}