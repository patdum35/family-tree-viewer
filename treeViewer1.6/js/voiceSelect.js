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



            go: 'go',
            enter: 'entrer',
            validate: 'valider',
            question: 'question',
            questions: 'questions',
            firstname: 'prenom',
            lastname: 'nom',
            place: 'lieu',
            occupation: 'profession',
            date: 'date',

            letter: 'lettre',
            by: 'par',
            stop: 'stop',
            end: 'fin',
            year: 'annee'

    
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
            question: 'question',
            questions: 'questions',
            firstname: 'first name',
            lastname: 'last name',
            place: 'place',
            occupation: 'occupation',
            date: 'date',
            letter: 'letter',
            by: 'by',
            stop: 'stop',
            end: 'end',
            year: 'year',

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
            question: 'pregunta',
            questions: 'preguntas',
            firstname: 'nombre',
            lastname: 'apellido',
            place: 'lugar',
            occupation: 'profesion',
            date: 'fecha',

            letter: 'letra',
            by: 'por',
            stop: 'alto',
            end: 'fin',
            year: 'ano',
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
            question: 'kerdes',
            questions: 'kérdések',
            firstname: 'keresztnev',
            lastname: 'vezeteknev',
            place: 'hely',
            occupation: 'foglalkozas',
            date: 'datum',
            letter: 'betu',
            by: 'altal',
            stop: 'stop',
            end: 'vege',
            year: 'ev'

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

    // =========================================================
    // NOUVELLE FONCTION CLÉ : Synchronisation Clavier -> État
    // =========================================================

    /**
     * Met à jour l'entité capturée lorsque l'utilisateur tape au clavier dans le champ INPUT.
     * @param {string} fieldName - Le nom de l'entité à mettre à jour ('prénom', 'nom', etc.).
     * @param {string} newValue - La nouvelle valeur saisie.
     */
    function updateCapturedEntity(fieldName, newValue) {
        
        // La nouvelle valeur est soit la saisie, soit 'not detected' si le champ est vide.
        const valueToStore = newValue.trim() || 'not detected'; 
        
        // 1. Mettre à jour la variable d'état globale
        capturedEntities[fieldName] = valueToStore;
        
        console.log(`[CLAVIER] ${fieldName.toUpperCase()} mis à jour manuellement à: "${valueToStore}"`);

        // Optionnel : s'assurer que si l'utilisateur vide le champ, l'état visuel est mis à jour
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
        if (recognition) recognition.stop();
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



    let previousFullTranscript = null;
    let previousTruncatedTranscript = null;
    let isNewCommandToBeExecuted = true;
    let isNewCommandToBeExecuted2 = true;


    //###################################################
    async function processFullTranscript(transcript) {

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
        const actionKeywords = ['whoAreYou', 'whatIsYourName', 'whoCreatedYou', 'whatisTheUse', 'search', 'research', 'readSheet', 'whenBorn', 'whenDead', 'whenDeadW', 'whenDied', 
            'whatAge', 'whatAgePast', 'whereLive', 'whereLivePast', 'whatProfession', 'whatOccupation', 'whatProfessionPast', 'whatOccupationPast', 
            'whoMarried', 'whoMarriedPast', 'howManyChildren', 'howManyChildrenPast', 'whoIsFather', 'whoIsFatherPast', 
            'whoIsMother','whoIsMotherPast','whoAreSibling','whoAreSiblingPast', 'whatIsHistorical','whatIsHistoricalPast', 'whatAreNotes'];

        //'sex', 'birthDate', 'deathDate', 'occupation_n', 'residences_n', 'children', 'father', 'mother', 'siblings', 'spouse', 'historical','notes'

        const validationSignal = [translate('go'), translate('end'), translate('stop'), translate('enter'),  translate('validate')];

        let fullTranscript = transcriptCleaned.trim(); // Version propre du transcript
        fullTranscript = fullTranscript.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // enlever les accents !!!

        if (previousFullTranscript != fullTranscript) { isNewCommandToBeExecuted = true;  console.log('\n\n ---- debug 1 isNewCommandToBeExecuted = true ');}
        console.log('[LOG STT] Détection input : ', transcript , ',',previousFullTranscript, ',', fullTranscript, ',isNewCommandToBeExecuted =',isNewCommandToBeExecuted, isNewCommandToBeExecuted2);

 
        previousFullTranscript = fullTranscript;
        
        let detectedAction = null; // Variable pour stocker l'expression d'action qui correspond
        // --- MODIFICATION CLÉ 2 : Boucle pour trouver l'expression correspondante ---
        let truncatedTranscript = fullTranscript;
        for (const keyword of actionKeywords) {
            // Vérifie si la phrase commence par / ou contien /cette expression ET si elle est suivie d'un espace (pour éviter les faux positifs)
            const index = fullTranscript.lastIndexOf(translate(keyword)+ ' ');
            if (index !== -1) {
                truncatedTranscript = fullTranscript.substring(index);
                words = truncatedTranscript.split(/\s+/).filter(w => w.length > 0);
                // tu as ton texte tronqué
                detectedAction = keyword;
                if (previousTruncatedTranscript != truncatedTranscript) { isNewCommandToBeExecuted2 = true; console.log('\n\n ---- debug 2 isNewCommandToBeExecuted = true ');}
                previousTruncatedTranscript = truncatedTranscript;
                break; // On a trouvé la meilleure correspondance, on arrête la boucle
            }
        }






        
        

        // VÉRIFICATION GLOBALE : Est-ce qu'une action a été détectée ? Et y a-t-il un signal de validation ?
        if (isNewCommandToBeExecuted && isNewCommandToBeExecuted2 && config === 'full' && detectedAction && validationSignal.includes(words[words.length - 1])) {
            console.log(`[LOG STT] Détection du mode structuré pour l'expression: "${translate(detectedAction).toUpperCase()}"`, previousFullTranscript, ',',fullTranscript, 'truncatedTranscript',truncatedTranscript,',isNewCommandToBeExecuted =',isNewCommandToBeExecuted, isNewCommandToBeExecuted2);
            isNewCommandToBeExecuted = false; isNewCommandToBeExecuted2 = false;

            // Arrêter le traitement ici
            // quans la commande a été exécutée on reset les conditions 
            previousFullTranscript = null;
            previousTruncatedTranscript = null;
            // cumulativeTranscript = '';            



            // 1. Enregistrer l'Action
            capturedEntities[translate('question')] = translate(detectedAction);
            
            // 2. Extraire la partie NOM et PRÉNOM
            // Enlève l'expression d'action et le signal de validation.
            let entityPart = truncatedTranscript.substring(translate(detectedAction).length).trim(); 
            let entityWords = entityPart.split(/\s+/).slice(0, -1); // Enlève le signal de validation (GO)
            let isFirstNameAvailable = false; let islastNameAvailable = false; let isPlaceAvailable = false; let isOccupationAvailable = false; let isDateAvailable = false;

            if (capturedEntities[translate('firstname')] != 'not detected') {isFirstNameAvailable = true ;}
            if (capturedEntities[translate('laststname')] != 'not detected') {islastNameAvailable = true ;}
            if (capturedEntities[translate('place')] != 'not detected') {isPlaceAvailable = true ;}
            if (capturedEntities[translate('occupation')] != 'not detected') {isOccupationAvailable = true ;}
            if (capturedEntities[translate('date')] != 'not detected') {isDateAvailable = true ;}
            
            if (entityWords.length >= 2) {
                // Par convention, le premier mot après l'action est le PRÉNOM
                if (!isFirstNameAvailable) { capturedEntities[translate('firstname')] = entityWords[0]; }
                
                // Tous les mots restants sont considérés comme le NOM
                if (!islastNameAvailable) { capturedEntities[translate('lastname')] = entityWords.slice(1).join(' '); }
            } else if (entityWords.length === 1) {
                 // S'il n'y a qu'un seul mot (ex: 'chercher Henri GO'), on le met en Nom par défaut ou on gère l'erreur
                 if (!isFirstNameAvailable) { capturedEntities[translate('firstname')] = entityWords[0]; }
                 if (!islastNameAvailable) { capturedEntities[translate('lastname')] = 'not detected'; }
            } else {
                 // Aucun nom/prénom détecté entre l'action et la validation.
                 if (!isFirstNameAvailable) { capturedEntities[translate('firstname')] = 'not detected'; }
                 if (!islastNameAvailable) { capturedEntities[translate('lastname')] = 'not detected'; }
            }
            
            // 3. Enregistrer Validation
            // capturedEntities['entrez'] = words[words.length - 1]; 

            document.getElementById('stt-result-display').textContent = `✅ Mode structuré détecté. Action: ${detectedAction.toUpperCase()}, Prénom: ${capturedEntities[translate('firstname')]}, Nom: ${capturedEntities[translate('lastname')]}.`;
            updateEntityUI();



            // if (capturedEntities['action'] === 'chercher' && capturedEntities['prenom'] !== 'not detected' && capturedEntities['nom'] !== 'not detected') { 
            if (capturedEntities[translate('firstname')] !== 'not detected' && capturedEntities[translate('lastname')] !== 'not detected') { 
    
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
                    // console.log('\n\n\n ------------   debug : ', textToTell);
                    // speakPersonName(textToTell, true, false);
                    // speakText(textToTell);
                    // await speakTextWithWaitToEnd(textToTell);
                    let personId = (res.results.length > 0) ? res.results[0].id : res2.results[0].id;
                    displayPersonDetails(personId);
                    await speakTextWithWaitToEnd('essai de parole', 0.0); // ppour débugger le son et éviter la 1iere saccade de son
                    if (!detectedAction.includes('search') && !detectedAction.includes('research')  ) { 
                        await readPersonSheet(personId, detectedAction); 
                    } 
                    else { await speakTextWithWaitToEnd(textToTell, 1.0); }
                    // hideUI();


                } else {
                    let textToTell = 'la personne ' + capturedEntities[translate('firstname')] + ' ' + capturedEntities[translate('lastname')] + ' n\'a pas été trouvée ! Ré-essayer';
                    console.log('\n\n\n ------------   debug : ', textToTell, cumulativeTranscript);
                    await speakTextWithWaitToEnd(textToTell);
                    // supprimer le dernier mot d'activatio 'GO', pour éviter de répeter plusieurs la phrase 
                    // words.pop(); 
 
                    console.log('\n\n\n ------------   debug words after pop: ',  cumulativeTranscript);
                }
            }

            if ( (isNewCommandToBeExecuted && isNewCommandToBeExecuted2) && (detectedAction.includes('whoAreYou') || detectedAction.includes('whatIsYourName') || detectedAction.includes('whoCreatedYou') || detectedAction.includes( 'whatisTheUse')) ) {
            // if (  (detectedAction.includes('whoAreYou') || detectedAction.includes('whatIsYourName') || detectedAction.includes('whoCreatedYou') || detectedAction.includes( 'whatisTheUse')) ) {
                console.log('\n\n\n ------------   debug  prononcer : ', detectedAction);
                // quans la commande a été exécutée on reset les conditions 
                isNewCommandToBeExecuted = false; isNewCommandToBeExecuted2 = false;
                
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
                    speakText('je sers à visualiser les arbres généalogiques de type GEDCOM, de différentes manière, en mode arbre, roue, ou nuage, avec de la géolocalisation, des animation, de la synthèse vocale et reconnaissance vocale, et aussi des quizz');      
                }
            }

            return; 
        }
        // =========================================================
        // FIN DU NOUVEAU MODE
        // =========================================================
     















        let newEntities = {};
        // const words = transcript.toLowerCase().split(/\s+/).filter(w => w.length > 0);



        words = transcriptCleaned.split(/\s+/).filter(w => w.length > 0);


        
        let keywordMap;
        //  = {
        //     'prénom': 'prenom', 'nom': 'nom', 'non': 'nom', 'lieu': 'lieux', 'lieux': 'lieux', 'profession': 'profession'
        // };
        if (config === 'start') {
            keywordMap = {
                [translate('firstname')]: translate('firstname'), [translate('laststname')]: translate('lastname'), 'non': translate('lastname')
            };

            entityKeys = [translate('firstname'),translate('lastname')];
            capturedEntities = entityKeys.reduce((acc, field) => {
                acc[field] = 'not detected';
                return acc;
            }, {});
        } 
        else if (config === 'full') {

                // 'quel est l\'âge de' : 'commande',
                // 'où habite' : 'commande',
                // 'recherche' : 'commande',
                // 'cherche' : 'commande',

            keywordMap = {
                [translate('question')] : translate('question'), [translate('questions')] : translate('question'),
                [translate('firstname')]: translate('firstname'), [translate('lastname')]: translate('lastname'), 'non': translate('lastname'), 
                [translate('place')]: translate('place'), [translate('occupation')]: translate('occupation'), [translate('date')] : translate('date'), [translate('year')]: translate('date')
            };
            // entityKeys = ['commande', 'prenom', 'nom', 'lieux', 'profession'];
            entityKeys = [translate('firstname'),translate('lastname'), translate('place'), translate('occupation'), translate('date'), translate('question')];
            // entityKeys = ['prenom', 'nom', 'action'];
            capturedEntities = entityKeys.reduce((acc, field) => {
                acc[field] = 'not detected';
                return acc;
            }, {});
        }
        
        let currentEntity = null;
        let entitiesDetectedCount = 0;
        
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
                currentEntity = keywordMap[word];
                
                capturedEntities[currentEntity] = 'not detected'; 
                newEntities[currentEntity] = []; 
                
            }
            else if (currentEntity) {
                newEntities[currentEntity].push(word);
            }
        }
        
        entityKeys.forEach(key => {
            if (newEntities[key].length > 0) {
                capturedEntities[key] = newEntities[key].join(' ');
                console.log('\n\n ---------------- debug capturedEntities --------', key)
                entitiesDetectedCount++;
            }
        });

        if (entitiesDetectedCount > 0) {
            document.getElementById('stt-result-display').textContent = `✅ ${entitiesDetectedCount} champs mis à jour. (Continuez ou faites une pause)`;
        } else {
            document.getElementById('stt-result-display').textContent = `🔍 Analyse en cours. Transcript: "${transcript}"`;
        }
        


        if (validationSignal.includes(words[words.length - 1]) ) {

            console.log('\n\n\n\n #######################-----------   debug validationSignal ----------###############' , words[words.length - 1], capturedEntities , capturedEntities[translate('firstname')],capturedEntities[translate('question')], newEntities,'\n\n\n\n')
        }





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
                        processFullTranscript(cumulativeTranscript.trim(), config);
                    }
                }
                
            } else {
                interimTranscript += transcriptSegment;
            }
            
            if (!isSpellingMode) {
                document.getElementById('stt-interim-display').textContent = interimTranscript;
                document.getElementById('stt-result-display').textContent = cumulativeTranscript + interimTranscript;
            }
        };


        recognition.onend = () => {
            clearTimeout(recognitionTimeout); 
            
            if (pendingSpellingStart) {
                
                pendingSpellingStart = false; 
                isSpellingMode = true;       

                recognition.continuous = false; 
                recognition.grammars = spellingGrammar; 
                
                try {
                    recognition.start();
                    console.log("[LOG STT] BASCULE RÉUSSIE: Mode Libre -> Mode Épellation Stricte 🔄");
                } catch(e) {
                    console.error("Erreur au démarrage du mode épellation après bascule :", e.message);
                    isRecording = false; 
                    isSpellingMode = false;
                    updateButtonUI(false);
                }
                
            } 
            
            else if (isRecording && isSpellingMode) { 
                
                try {
                    recognition.start();
                    console.log("[LOG STT] RELANCE: Mode Épellation relancé après capture/silence. 🔊");
                } catch(e) {
                    console.log("[LOG STT] Tentative d'arrêt critique du mode épellation.");
                    isRecording = false; 
                    isSpellingMode = false; 
                    updateButtonUI(false);
                    document.getElementById('stt-result-display').textContent = `⚠️ Épellation interrompue par erreur critique. Redémarrez manuellement.`;
                }
                
            } 
            
            else if (isRecording && !isSpellingMode) { 
                
                if (cumulativeTranscript.trim().length > 0) {
                    console.log('\n\n ------------------   debug  call to processFullTranscript  from recognition.ONEND, else if (isRecording && !isSpellingMode)', cumulativeTranscript )
                    processFullTranscript(cumulativeTranscript.trim(), config);
                    // cumulativeTranscript = ''; 
                }

                if (state.isMobile) {
                    setTimeout(() => {
                        if (isRecording) { 
                            try {
                                recognition.start();
                            } catch(e) {
                                console.warn("Erreur au redémarrage mobile :", e.message);
                                isRecording = false; updateButtonUI(false);
                            }
                        }
                    }, 1500); 

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
     * Met à jour la liste des entités capturées dans l'interface utilisateur.
     * Crée des champs INPUT éditables et applique la couleur (vert si détecté, gris si vide).
     * N'affiche que les champs ayant une valeur autre que 'not detected'.
     * @param {string | null} config - 'start' pour réinitialiser la liste à un sous-ensemble.
     */
    function updateEntityUI(config = null) {
        const listElement = document.getElementById('entity-list');
        if (!listElement) return;

        // Si la configuration de démarrage est demandée, réinitialiser les entités.
        if (config === 'start') {
            // (Assurez-vous que cette partie est cohérente avec votre logique processFullTranscript)
            entityKeys = ['prénom', 'nom', 'entrez'];
            capturedEntities = entityKeys.reduce((acc, field) => {
                acc[field] = 'not detected';
                return acc;
            }, {});
        }

        // Vider la liste existante
        listElement.innerHTML = ''; 
        
        for (const field in capturedEntities) {
            
            // Extrait la valeur réelle, gérant si l'entité est une chaîne ou un objet ({ value: 'x', alternatives: [...] })
            const entityData = capturedEntities[field];
            const entityValue = (typeof entityData === 'object' && entityData !== null && 'value' in entityData) 
                ? entityData.value 
                : entityData;

            // --- FILTRAGE : Si la valeur est 'not detected', on n'affiche pas le champ ---
            if (entityValue === 'not detected') {
                continue; // Passe au champ suivant.
            }
            // ---------------------------------------------------------------------------

            const value = entityValue; 
            const displayValue = value.trim(); // La valeur réelle du champ (vide si l'utilisateur l'a effacée)
            
            const listItem = document.createElement('li');
            listItem.style.cssText = 'padding: 5px 0; font-size: 0.9em; display: flex; align-items: center; justify-content: space-between;';
            
            // Création du label
            const label = document.createElement('strong');
            // Utilise la première lettre en majuscule pour l'affichage (ex: 'Prénom:')
            label.textContent = `${field.charAt(0).toUpperCase() + field.slice(1)}:`; 
            label.style.width = '100px'; 
            
            // Création du champ de saisie INPUT
            const inputField = document.createElement('input');
            inputField.type = 'text';
            inputField.id = `input-${field}`; 
            inputField.value = displayValue;
            
            // Appliquer la fonction de synchronisation au clavier
            inputField.oninput = (e) => updateCapturedEntity(field, e.target.value);
            
            // Déterminer la couleur : Vert si une valeur est présente, Gris si vide.
            // La couleur reste verte même si l'utilisateur a édité le champ (displayValue.length > 0)
            const isDetectedOrEdited = displayValue.length > 0;
            const color = isDetectedOrEdited ? '#28a745' : '#999';
            
            // Style de l'input
            inputField.style.cssText = `
                flex-grow: 1; 
                padding: 5px; 
                border: 1px solid ${color}; 
                border-radius: 4px;
                font-weight: bold;
                margin-left: 10px;
                color: ${color}; 
            `;
            
            listItem.appendChild(label);
            
            // --- GESTION OPTIONNELLE DES ALTERNATIVES (Non demandée, mais bonne pratique) ---
            // Vous pourriez ici ajouter la logique pour créer un <select> si entityData.alternatives est présent.
            
            listItem.appendChild(inputField); // Ajout du champ INPUT
            listElement.appendChild(listItem);
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
        } else {


            if (mode === 'erase') {
                // Efface toutes les entités capturées (utile pour le bouton "Tout effacer & Écouter")
                entityKeys.forEach(key => {
                     capturedEntities = [];
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

            try {
                recognition.start();

                if (!state.isMobile) {
                    clearTimeout(recognitionTimeout);
                    recognitionTimeout = setTimeout(() => {
                        if (isRecording) {
                            isRecording = false;
                            recognition.stop();
                        }
                    }, PC_MAX_DURATION_MS);
                }

                window.speechSynthesis.cancel(); 

            } catch (e) {
                console.error("Erreur au démarrage de la reconnaissance:", e);
                document.getElementById('stt-result-display').textContent = "Erreur au démarrage. Veuillez vérifier les permissions.";
                document.getElementById('stt-result-display').style.color = 'red';
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
export function speakText(text) {
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