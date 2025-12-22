import { state, loadData } from './main.js';
import { initSpeechSynthesis, testRealConnectivity } from './treeAnimation.js';
import { makeModalDraggableAndResizable, makeModalInteractive } from './resizableModalUtils.js';
import { findPersonsBy, openSearchModal } from './searchModalUI.js';
import { displayPersonDetails, readPersonSheet } from './modalWindow.js'
import { debounce } from './eventHandlers.js';
import { debugLog } from './debugLogUtils.js';



export function selectVoice() {

    let voice_language = 'fr-FR';
    let voice_language2 = 'fr_FR';
    let voice_language_short = 'fr-';
    let voice_language_short2 = 'fr_';
    if (window.CURRENT_LANGUAGE == "fr") {
        voice_language = 'fr-FR';
        voice_language_short = 'fr-';
        voice_language2 = 'fr_FR';
        voice_language_short2 = 'fr_';
    } else if (window.CURRENT_LANGUAGE == "en") {
        voice_language = 'en-US';
        voice_language_short = 'en-'; 
        voice_language2 = 'en_US';
        voice_language_short2 = 'en_'; 
    } else if (window.CURRENT_LANGUAGE == "es") { 
        voice_language = 'es-ES';
        voice_language_short = 'es-';
        voice_language2 = 'es_ES';
        voice_language_short2 = 'es_';
    } else if (window.CURRENT_LANGUAGE == "hu") {  
        voice_language = 'hu-HU';
        voice_language_short = 'hu-';
        voice_language2 = 'hu_HU';
        voice_language_short2 = 'hu_';
    } 

    // Sélectionner une voix française si possible
    let voices = window.speechSynthesis.getVoices();
    let localVoice = null;
    
    let frenchVoices = voices.filter(voice => 
        (voice.lang.startsWith(voice_language) || voice.lang.startsWith(voice_language2)) && 
        !voice.name.includes('ulti') &&  // Évite Multi/multilingue
        !voice.voiceURI.includes('eloquence')  // Évite les voix pourries sur IOS
    );

    console.log('\n\n -----------  debug in selectVoice state.isOnLine= ', state.isOnLine, ',langPrefix=', voice_language2, voices, '\n ----- frenchVoices=',frenchVoices, ',window.CURRENT_LANGUAGE=',window.CURRENT_LANGUAGE);

        
    // Chercher la première voix contenant 'compact'
    const compactVoice = frenchVoices.find(voice => voice.voiceURI.toLowerCase().includes('compact'));

    if (compactVoice) {
        // Si on trouve une voix 'compact', la mettre en première position
        frenchVoices = [
            compactVoice,
            ...frenchVoices.filter(voice => voice !== compactVoice)
        ];
    }


    let localVoices = voices.filter(voice => voice.localService);

    if (localVoices.length != 0) {
        console.log("Voix locales disponibles:", localVoices, localVoices.map(v => v.name));
        localVoice = localVoices[0];
    } 

    // console.log("Voix françaises France disponibles:", frenchVoices, frenchVoices.map(v => v.name));

    if (frenchVoices.length === 0) {
        frenchVoices = voices.filter(voice => 
            // voice.lang.startsWith('fr-') || 
            ((voice.lang.startsWith(voice_language_short) || voice.lang.startsWith(voice_language_short2)) && !voice.voiceURI.includes('eloquence')) || 
            (voice.name.toLowerCase().includes('french') && !voice.voiceURI.includes('eloquence'))
        );
        // console.log("Voix françaises autres disponibles:", frenchVoices.map(v => v.name));
    } 
    if (frenchVoices.length === 0) {
        frenchVoices = voices.filter(voice => 
            voice.lang.startsWith('en-') && !voice.voiceURI.includes('eloquence') );

        if (frenchVoices.length === 0) {
            frenchVoices = voices.filter(voice =>
                voice.localService);
            }
        // console.log("Voix anglaise ou locales disponibles:", frenchVoices.map(v => v.name));
    }

    
    console.log("✅ or ⚠️ Connexion Internet ?", state.isOnLine);
    
    
    if (!state.isOnLine) {
        frenchVoices = voices.filter(voice =>
            // voice.lang.startsWith('fr-') && voice.localService);
            (voice.lang.startsWith(voice_language_short) || voice.lang.startsWith(voice_language_short2)) && !voice.voiceURI.includes('eloquence') && voice.localService);
        console.log("Voix disponibles locales fr-:", frenchVoices);
        if (frenchVoices.length === 0) {
            frenchVoices = voices.filter(voice =>
                (voice.lang.startsWith('en-') || voice.lang.startsWith('en_')) &&!voice.voiceURI.includes('eloquence') && voice.localService);
            console.log("Voix disponibles locales en-:", frenchVoices);
        }
        if (frenchVoices.length === 0) {
            frenchVoices = voices.filter(voice =>
                voice.localService);
            console.log("Voix disponibles locales:", frenchVoices);
        }   

        // console.log("Voix françaises ou autres locales disponibles hors lignes :", frenchVoices.map(v => v.name));
    }


    if (frenchVoices.length != 0) {
        console.log("Voix  disponibles:", frenchVoices.map(v => v.name));
    }


    
    // Choisir la meilleure voix française  
    // Si en ligne, préférer les voix de haute qualité (généralement Google ou Microsoft)
    if (state.isOnLine) {
        // Chercher d'abord les voix Google ou Microsoft qui sont généralement de meilleure qualité
        state.frenchVoice = frenchVoices.find(voice => 
            voice.name.includes('Google') || 
            voice.name.includes('Microsoft')
        );


        // state.frenchVoice = frenchVoices[3];
        
        if (state.frenchVoice) {
            console.log("✅ Utilisation de la voix réseau haute qualité:", state.frenchVoice.name, ', localService=', state.frenchVoice.localService);
        } else if (frenchVoices.length != 0) {
            // Sélectionner la première voix française disponible
            state.frenchVoice = frenchVoices[0];
            console.log("ℹ️ Utilisation de la voix  ?:", state.frenchVoice.name, ', localService=', state.frenchVoice.localService);
        }

    } else {
        if (frenchVoices.length != 0) {
            // Sélectionner la première voix française disponible
            state.frenchVoice = frenchVoices[0];
            console.log("ℹ️ Utilisation de la voix locale:", state.frenchVoice.name, ', localService=', state.frenchVoice.localService);
        } else {
            console.log("⚠️ Aucune voix disponible hors ligne ");
        }
    }


    if (state.frenchVoice) {
        console.log("Voix  sélectionnée:", state.frenchVoice);
        debugLog(`Version 1.6, Voix sélectionnée:, ${state.frenchVoice.name}, localService=, ${state.frenchVoice.localService}`);
    }

}



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

        
        /**
         * Calcule une hauteur max sécurisée pour la liste des voix.
         */
        function calculateVoiceListMaxHeight(isSliders = null) {
            let percentage = 60;
            const maxAbsolute = 350;
            const calculatedHeight = window.innerHeight * 0.9 - 200;
            let  finalHeight = calculatedHeight; //Math.min(calculatedHeight, maxAbsolute);
            if (isSliders && isSliders === 'withSliders') { finalHeight = calculatedHeight - 100;}
            return `${finalHeight}px`;
        }



        // Fonction dédiée au recalcul et à l'application de la hauteur par défaut
        function updateDefaultMaxHeight() {
            // 1. Recalculer la valeur de base (variable let)
            let MAX_HEIGHT_DEFAULT = calculateVoiceListMaxHeight();
            
            // 2. Appliquer la nouvelle hauteur SEULEMENT si les sliders sont cachés (mode par défaut actif)
            // Vérifie si la modal est visible et si les sliders sont cachés.
            if (overlay.style.display === 'flex' && ttsPanel.style.display === 'none') {
                voiceList.style.maxHeight = MAX_HEIGHT_DEFAULT; 
            }
        }


        // --- NOUVEAU : Récupération des valeurs stockées (ou par défaut) ---
        const storedVolume = getTtsSetting('voice_volume', '1.0');
        const storedRate   = getTtsSetting('voice_rate', '1.0');
        const storedPitch  = getTtsSetting('voice_pitch', '1.0');


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
            voiceListDefault: `overflow-y: auto; padding-right: 5px; max-height: ${calculateVoiceListMaxHeight()};`, 
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
        
        // --- Styles CSS intégrés pour les sliders et l'animation ---
        const internalStyles = document.createElement('style');
        internalStyles.textContent = `
            /* Animation pour l'engrenage */
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            /* Styles pour le bouton ⚙️/↩️ */
            #toggle-tts-controls {
                background-color: transparent !important; 
                color: #333; 
                border: none; 
                padding: 5px; 
                border-radius: 6px; 
                font-weight: bold;
                font-size: 1.5em; 
                line-height: 1;
                width: 30px; 
                height: 30px; 
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                animation: spin 10s linear infinite; 
            }

            /* --- STYLES SLIDERS ULTRA-COMPACTS (Inchangés) --- */
            .tts-slider-group {
                margin-bottom: 3px; 
                padding: 1px 0; 
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .tts-slider-group label {
                font-weight: normal; 
                font-size: 0.85em;
                margin: 0;
                padding: 0;
                width: 100px;
                flex-shrink: 0;
                text-align: left;
            }

            .tts-slider-container {
                flex-grow: 1;
            }
            
            .tts-slider-group input[type="range"] {
                width: 100%;
                cursor: pointer;
                height: 18px; 
                margin: 0;
                padding: 0;
            }
            
            .tts-slider-value {
                width: 35px;
                text-align: right;
                font-size: 0.9em;
                color: #333;
                flex-shrink: 0;
            }
            /* --- FIN STYLES SLIDERS ULTRA-COMPACTS --- */
        `;
        modal.appendChild(internalStyles);
        
        
        // --- NOUVEAU BANDEAU D'EN-TÊTE ---
        const headerElement = document.createElement('div');
        headerElement.id = 'voice-modal-header'; 
        headerElement.style.cssText = `
            background-color: #D6E9F7; 
            padding: 10px 15px; 
            border-top-left-radius: 12px;
            border-top-right-radius: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        
        const titleElement = document.createElement('h2');
        titleElement.id = 'voice-selector-modal-title';
        titleElement.textContent = translate('title');
        titleElement.style.cssText = 'margin: 0; font-size: 1.2em; color: #333;'; 
        
        const actionButtons = document.createElement('div');
        actionButtons.style.cssText = 'display: flex; align-items: center; gap: 10px;';

        const toggleTtsButton = document.createElement('button');
        toggleTtsButton.id = 'toggle-tts-controls';
        toggleTtsButton.innerHTML = '⚙️';
        
        const closeButton = document.createElement('button');
        closeButton.id = 'close-voice-ui';
        closeButton.innerHTML = '&times;';
        closeButton.style.cssText = `
            width: 30px; 
            height: 30px;
            line-height: 1; 
            background-color: #dc3545; 
            color: white; 
            border: none;
            border-radius: 50%; 
            font-size: 1.5em; 
            cursor: pointer;
            padding: 0; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            transition: background-color 0.2s;
        `;
        closeButton.addEventListener('click', hideUI);
        
        actionButtons.appendChild(toggleTtsButton);
        actionButtons.appendChild(closeButton);

        headerElement.appendChild(titleElement);
        headerElement.appendChild(actionButtons);

        modal.appendChild(headerElement);
        
        
        // --- PANNEAU DE CONTRÔLE TTS (sliders) ---
        const ttsPanel = document.createElement('div');
        ttsPanel.id = 'tts-controls-panel';
        ttsPanel.style.cssText = `
            margin: 10px 20px 0 20px; 
            padding: 8px;
            border: 1px solid #3bad77ff; 
            border-radius: 6px; 
            background-color: #e6fff1; 
            display: none; 
        `;
        ttsPanel.innerHTML = `
            <div class="tts-slider-group">
                <label for="tts-volume">vol (0 à 1):</label>
                <div class="tts-slider-container">
                    <input type="range" id="tts-volume" min="0.0" max="1.0" step="0.1" value="${storedVolume}">
                </div>
                <span id="tts-volume-value" class="tts-slider-value">${storedVolume}</span>
            </div>
            <div class="tts-slider-group">
                <label for="tts-rate">rate (0.1 à 1.8):</label>
                <div class="tts-slider-container">
                    <input type="range" id="tts-rate" min="0.1" max="1.8" step="0.1" value="${storedRate}">
                </div>
                <span id="tts-rate-value" class="tts-slider-value">${storedRate}</span>
            </div>
            <div class="tts-slider-group">
                <label for="tts-pitch">pitch (0 à 2):</label>
                <div class="tts-slider-container">
                    <input type="range" id="tts-pitch" min="0.0" max="2.0" step="0.1" value="${storedPitch}">
                </div>
                <span id="tts-pitch-value" class="tts-slider-value">${storedPitch}</span>
            </div>
        `;
        modal.appendChild(ttsPanel);
        
        // --- Zone de Statut et de Liste ---
        const contentContainer = document.createElement('div');
        contentContainer.id = 'voice-content-container'; 
        contentContainer.style.cssText = 'padding: 0 20px 20px 20px;';
        
        contentContainer.innerHTML = `
            <p id="voice-status-display" style="font-size: 0.9em; color: #666; margin: 10px 0;">${translate('statusLoading')}</p>
            
            <div id="voice-list-options" style="${styles.voiceListDefault}"> 
            </div>

            <div id="voice-list-footer" style="display: flex; gap: 10px; margin-top: 15px;">
                <button id="test-selected-voice" disabled style="padding: 12px; background-color: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1em; flex-grow: 1;">
                    ${translate('btnTestDisabled')}
                </button>
            </div>
        `;
        
        modal.appendChild(contentContainer);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // ------------------------------------
        // --- GESTION DES ÉVÉNEMENTS JAVASCRIPT ---
        // ------------------------------------
        
        const voiceList = document.getElementById('voice-list-options');
        
        // 1. Gestion du basculement des sliders TTS (⚙️ / ↩️)
        toggleTtsButton.addEventListener('click', () => {
            const isHidden = ttsPanel.style.display === 'none';
            
            if (isHidden) {
                // Afficher les sliders -> Réduire la hauteur de la liste
                ttsPanel.style.display = 'block';
                toggleTtsButton.innerHTML = '↩️';
                toggleTtsButton.style.animation = 'none'; 
                
                // Logique simple pour réduire la liste
                voiceList.style.maxHeight = calculateVoiceListMaxHeight('withSliders');

            } else {
                // Cacher les sliders -> Rétablir la hauteur de la liste
                ttsPanel.style.display = 'none';
                toggleTtsButton.innerHTML = '⚙️';
                toggleTtsButton.style.animation = 'spin 10s linear infinite'; 
                
                // Logique simple pour rétablir la liste
                voiceList.style.maxHeight = calculateVoiceListMaxHeight();
            }
        });

        // 2. Gestion des Sliders (mise à jour des valeurs affichées)
        function updateTtsValueDisplay(e) {
            const valueId = `${e.target.id}-value`;
            const valueSpan = modal.querySelector(`#${valueId}`);
            if (valueSpan) {
                valueSpan.textContent = e.target.value;
            }
        }

        modal.querySelector('#tts-volume').addEventListener('input', updateTtsValueDisplay);
        modal.querySelector('#tts-rate').addEventListener('input', updateTtsValueDisplay);
        modal.querySelector('#tts-pitch').addEventListener('input', updateTtsValueDisplay);

        // Association des événements (restant)
        document.getElementById('test-selected-voice').addEventListener('click', testVoice);
        
        //Gestionnaire d'événement 'resize'
        window.addEventListener('resize',debounce(() => {
            updateDefaultMaxHeight();
        }, 150)); // Attend 150ms après le dernier resize


        return overlay;
    }

    
    
    /**
     * Récupère les valeurs actuelles des sliders TTS dans la modale.
     * @returns {object|null} Un objet contenant {volume, rate, pitch} ou null si les éléments ne sont pas trouvés.
     */
    function getTtsParameters() {
        // Tente de récupérer les éléments des sliders par leur ID
        const volumeSlider = document.getElementById('tts-volume');
        const rateSlider = document.getElementById('tts-rate');
        const pitchSlider = document.getElementById('tts-pitch');

        if (!volumeSlider || !rateSlider || !pitchSlider) {
            console.warn("Les sliders TTS n'ont pas été trouvés dans le DOM.");
            return null; // Retourne null si la modale n'est pas encore créée ou les IDs ont changé
        }

        // Récupère les valeurs et les convertit en nombres flottants
        const volume = parseFloat(volumeSlider.value);
        const rate = parseFloat(rateSlider.value);
        const pitch = parseFloat(pitchSlider.value);

        localStorage.setItem('voice_volume', volume);
        localStorage.setItem('voice_rate', rate);
        localStorage.setItem('voice_pitch', pitch);
        state.voice_volume = volume;
        state.voice_rate = rate;
        state.voice_pitch = pitch;

        return {
            volume: volume,
            rate: rate,
            pitch: pitch
        };
    }

    /**
     * Récupère une valeur TTS stockée dans localStorage ou retourne une valeur par défaut.
     * @param {string} key La clé dans localStorage (ex: 'ttsVolume').
     * @param {string} defaultValue La valeur par défaut si non trouvée.
     * @returns {string} La valeur stockée ou par défaut.
     */
    function getTtsSetting(key, defaultValue) {
        const storedValue = localStorage.getItem(key);
        // console.log('\n\n\n ----------------  debug getTtsSetting ----- key=', key, defaultValue ,'storedValue=', storedValue)
        // Vérifie si la valeur existe et est valide (non null/undefined/NaN)
        if (storedValue !== null && storedValue !== undefined && !isNaN(parseFloat(storedValue))) {
            return storedValue;
        }
        return defaultValue;
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

        console.log("Voix sélectionnée dans handleVoiceSelection:", selectedVoice.name);
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
            console.log(`✅ Voix persistante chargée pour le nom ${voiceName},  voix trouvée : ${selectedVoice.name}`);

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

        console.log('\n\n ---- debug3 : in loadVoices ---\n\n')



        appState.voices = window.speechSynthesis.getVoices();
        console.log('\n\n ---- debug4 : in loadVoices --- appState.voices=',appState.voices, '\n\n')

        
        if (appState.voices.length > 0) {
            // Mise à jour du statut général après le chargement pour affichage initial

 
      console.log('\n\n ---- debug4c : in loadVoices --- appState.voices=',localStorage.getItem('selectedVoice'), '\n\n')

       console.log('\n\n ---- debug4D : in loadVoices --- appState.voices=', translate('statusOffline'),'\n\n')

       console.log('\n\n ---- debug4b : in loadVoices --- appState.voices=',state.isOnLine, '\n\n')

            if (state.isOnLine === false) {
                 appState.status = translate('statusOffline');
            } else {
                 appState.status = `${translate('sectionLocal') + translate('sectionNetwork')} (${appState.voices.length} voix totales)`;
            }

            // === ÉTAPE IMPORTANTE : INITIALISATION ===
            // 1. Récupérer le nom de la voix sauvegardée
            const storedVoiceName = localStorage.getItem('selectedVoice');


            console.log('\n\n ---- debug5 : in loadVoices --- storedVoiceName=',storedVoiceName, '\n\n')


            // 2. Initialiser la voix sélectionnée avec ce nom
            setInitialVoiceByName(storedVoiceName); 
            // console.log('\n\n ------------  debug in loadVoices at init with  storedVoiceName localstorage = ', storedVoiceName, 'window.CURRENT_LANGUAGE=',window.CURRENT_LANGUAGE,', selectedVoice=' ,selectedVoice, ',restartVoiceSelect=' ,sessionStorage.getItem('restartVoiceSelect'),'------------\n\n');

            // ===============================================

            if (sessionStorage.getItem('restartVoiceSelect')) {
                // console.log('\n\n ------------  debug in loadVoices restartVoiceSelect,  detected = ', sessionStorage.getItem('restartVoiceSelect') );
                selectedVoice = false;
                sessionStorage.removeItem('restartVoiceSelect');
            }


            // NOUVELLE LOGIQUE : Sélectionner une voix par défaut si aucune n'est sélectionnée
            if (!selectedVoice) {
                // const defaultVoice = findDefaultVoice(window.CURRENT_LANGUAGE || 'fr');
                // if (defaultVoice) {
                //     handleVoiceSelection(defaultVoice); // Utiliser handleVoiceSelection pour tout initialiser
                //     console.log(`✅ Voix locale par défaut sélectionnée: ${defaultVoice.name}`);
                // } else {
                //     console.warn(`⚠️ Aucune voix locale par défaut trouvée pour la langue ${window.CURRENT_LANGUAGE}.`);
                //     // Fallback ultime : prendre la première voix disponible
                //     if (appState.voices.length > 0) {
                //         handleVoiceSelection(appState.voices[0]);
                //         console.warn(`⚠️ Aucune voix locale par défaut trouvée. Première voix disponible utilisée: ${appState.voices[0].name}`);
                //     }
                // }
                 console.log('\n\n ---- debug6 : in loadVoices   call to findDefaultVoice--- storedVoiceName=',storedVoiceName, '\n\n')


                findDefaultVoice(window.CURRENT_LANGUAGE || 'fr').then(defaultVoice => {
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
                });


            }




            if (appState.isUIOpen) {
                renderUI(); // Re-render si l'UI est déjà ouverte
            }
        }
        return true;
    }



    function waitUntilTestRealConnectivityDone() {
    const start = performance.now();

    return new Promise(resolve => {
        const i = setInterval(() => {
        if (state.isEndTestRealConnectivity) {
            clearInterval(i);
            const duration = performance.now() - start;
            resolve(duration); // en millisecondes
        }
        }, 50);
    });
    }



    /**
     *  Recherche une voix locale correspondant à la langue
     */
    async function findDefaultVoice(lang) {
        const langPrefix = lang.toLowerCase().split('-')[0];

        await waitUntilTestRealConnectivityDone();

        // 1. Voix locale dans la langue
        let voice = null;


        selectVoice();
        voice = state.frenchVoice;


        console.log('\n\n -----------  debug in findDefaultVoice state.isOnLine= ', state.isOnLine, ',langPrefix=', langPrefix, 'state.frenchVoice=',state.frenchVoice);

        if (voice) return voice;

        // 2. Voix réseau si en ligne
        if (state.isOnLine) {
            voice = appState.voices.find(
                v => v.lang.toLowerCase().startsWith(langPrefix)
            );
            if (voice) return voice;
        }

        // 3. Dernière chance : locale quelconque
        voice = appState.voices.find(v => v.localService);
        if (voice) return voice;

        return null;
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

        const params = getTtsParameters();

        const utterance = new SpeechSynthesisUtterance(translate('testPhrase'));
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
        utterance.volume = params.volume;
        utterance.rate = params.rate;
        utterance.pitch = params.pitch;
        
        window.speechSynthesis.speak(utterance);
    }

    function getSelectedVoice() {
        return selectedVoice;
    }


    // Écouter l'événement 'voiceschanged' pour s'assurer que les voix sont chargées
    console.log('\n\n ---- debug0 : lancement de loadVoices à la création de VoiceSelectorUI --- window.speechSynthesis=', window.speechSynthesis,'\n\n')
    if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
        console.log('\n\n ---- debug1 : lancement de loadVoices à la création de VoiceSelectorUI --- window.speechSynthesis=', window.speechSynthesis, 'window.speechSynthesis.onvoiceschanged=', window.speechSynthesis.onvoiceschanged, 'getVoices()=',window.speechSynthesis.getVoices(),'\n\n');


        if (window.speechSynthesis.getVoices().length > 0) {
            console.log('\n\n ---- debug2 : lancement de loadVoices à la création de VoiceSelectorUI ---\n\n')
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
            btnEraseRecord: 'Effacez <br>& Parlez',
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
            whatIsYourNameBis : 'comment t\'appelles-tu',
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
            non: 'non',
            place: 'lieu',
            occupation: 'metier',
            occupationBis: 'profession',
            date: 'date',

            letter: 'lettre',
            letter2: 'l\etre',
            letter3: 'etre',
            letter4: 'letre',

            by: 'par',
            stop: 'stop',
            stopBis: 'stoppe',
            end: 'fin',
            year: 'annee',
            pause: 'pause',

            erase: "effacer",
            cancel: "annuler",
            remove: "supprimer",
            back: "retour",
            speelingEnded: "Épellation terminée. Valeur enregistrée:",
            structuredModeDetected: "Mode structuré détecté. Question:",
            spellingMode : "Mode Épellation (Champ",
            spellingMode2: "Dites une ou plusieurs lettres, puis attendez la relance. Ou dites 'lettre A lettre B, ... \nDites annuler pour effacer la dernière lettre si erreur.  \nDites 'valider' pour terminer l'épellation.)",
            spellingStopped: "Épellation interrompue par erreur critique. Redémarrez manuellement",
            listeningInProgressStart: "Écoute en cours... Dites par exemple: \n- prénom Hugues valider \n- nom Capet valider \n- valider : pour entrer \nPour épeler un mot dites:\n- nom  lettre par lettre  c a p e t   valider",
            listeningInProgress: "Écoute en cours... Dites par exemple: \n- qui es tu valider , ou \n- quel age a Hugues Capet valider  , ou \n- prénom Hugues valider nom Capet valider question quel age a valider . \n- Pour épeler un mot dites:\nnom  lettre par lettre  c a p e t   valider",
            removed : "supprimé",
            nothingToRemove: "Rien à effacer",
            added: "Ajouté",
            nextLetter: "Prochaine lettre",
            recognized: "Reconnu",
            notRecognized: "Caractère non reconnu/valide. Veuillez réessayer",
            currentValue: "Valeur actuelle",
            recognitionError: "Erreur de reconnaissance vocale. Veuillez réessayer",
            errorStartingRecognition: "Erreur de démarrage de la reconnaissance vocale. Vérifiez les permissions du micro.",
            thePerson: "la personne",
            hasBeenFound: " a été trouvée ! Voici sa fiche",
            hasNotBeenFound : " n'a pas été trouvée ! Ré-essayer",
            iAmTreeViewer : "je suis 'Explore tes Origines', une appli pour visualiser les arbres généalogiques avec des animations",
            myCreator: "mon créateur est",
            iAmUseFor: "je sers à visualiser les arbres généalogiques de type GEDCOM, de différentes manière, en mode arbre, roue, ou nuage, avec de la géolocalisation, des animation, de la synthèse vocale et reconnaissance vocale, et aussi des quizz",

            speechRecognitionResult: "Résultat de la Reconnaissance Vocale:", 
            accessByVoice: "accéssible par la voix (éditable)", 
            speechRecognitionTitle: "Saisie Vocale ",
            possibleQuestions:"Liste des questions possibles à prononcer",

        },
        'en': {
            btnRecord: 'Speak',
            btnEraseRecord: 'Erase <br>& Speak',
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


            whoAreYou : 'who are you',
            whatIsYourName : 'what is your name',
            whatIsYourNameBis : 'what is your name',
            whoCreatedYou : 'who created you',
            whatisTheUse : 'what are you used for',
            whatisTheUseBis : 'what are you used for',

            go: 'go',
            enter: 'enter',
            validate: 'validate',
            validateBis: 'validate',
            question: 'question',
            questions: 'questions',
            firstname: 'first name',
            lastname: 'last name',
            non: 'non',
            place: 'place',
            occupation: 'occupation',
            occupationBis: 'profession',
            date: 'date',
            letter: 'letter',
            letter2: 'later',
            letter3: 'little',
            letter4: 'liter',

            by: 'by',
            stop: 'stop',
            stopBis: 'stop',
            end: 'end',
            year: 'year',
            pause: 'pause',

            erase: "erase",
            cancel: "cancel",
            remove: "remove",
            back: "back",

            speelingEnded: "Spelling finished. Value saved:",
            structuredModeDetected: "Structured mode detected. Question:",
            spellingMode: "Spelling Mode (Field",
            spellingMode2: "Say one or more letters, then wait for the prompt. Or say 'letter A letter B, ...'\nSay 'cancel' to remove the last letter if there is a mistake.\nSay 'validate' to finish spelling.)",

            spellingStopped: "Spelling interrupted due to a critical error. Please restart manually",
            listeningInProgressStart: "Listening in progress... For example say:\n- first name John validate \n- last name Barre validate \n- validate   : to enter \nTo spell a word say:\nlast name letter by letter b a r r e  validate",
            listeningInProgress: "Listening in progress... For example say:\n- who are you validate , or\n- how old is John Barre validate  , or \n- first name John validate last name Barre validate question how old is validate .\nTo spell a word say:\nlast name letter by letter b a r r e  validate",

            removed: "removed",
            nothingToRemove: "Nothing to remove",
            added: "Added",
            nextLetter: "Next letter",
            recognized: "Recognized",
            notRecognized: "Character not recognized/valid. Please try again",
            currentValue: "Current value",
            recognitionError: "Voice recognition error. Please try again",
            errorStartingRecognition: "Error starting voice recognition. Check microphone permissions.",

            thePerson: "the person",
            hasBeenFound: " has been found! Here is their record",
            hasNotBeenFound: " has not been found! Please try again",
            iAmTreeViewer: "I am 'Explore Your Origins', an app to visualize family trees with animations",
            myCreator: "my creator is",
            iAmUseFor: "I am used to visualize GEDCOM family trees in different ways: tree, wheel, or cloud views, with geolocation, animations, text-to-speech and speech recognition, and also quizzes",

            speechRecognitionResult: "Speech Recognition Result:",
            accessByVoice: "voice-accessible (editable)",
            speechRecognitionTitle: "Voice Input ",
            possibleQuestions: "List of possible questions to speak",

        },
        'es': {
            btnRecord: 'Habla',
            btnEraseRecord: 'Borra <br>& Habla',
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

            whoAreYou : 'quien eres',
            whatIsYourName : 'como te llamas',
            whatIsYourNameBis : 'como te llamas',
            whoCreatedYou : 'quien te creo',
            whatisTheUse : 'para que sirves',
            whatisTheUseBis : 'para que sirves',

            go: 'ir',
            enter: 'entrar',
            validate: 'validar',
            validateBis: 'validar',
            question: 'pregunta',
            questions: 'preguntas',
            firstname: 'nombre',
            lastname: 'apellido',
            non: 'non',
            place: 'lugar',
            occupation: 'profesion',
            occupationBis: 'profesion',
            date: 'fecha',

            letter: 'letra',
            letter2: 'letra',
            letter3: 'letra',
            letter4: 'letra',

            by: 'por',
            stop: 'alto',
            stopBis: 'alto',
            end: 'fin',
            year: 'ano',
            pause: 'pause',

            erase: "borrar",
            cancel: "cancelar",
            remove: "eliminar",
            back: "volver",
            speelingEnded: "Deletreo finalizado. Valor guardado:",
            structuredModeDetected: "Modo estructurado detectado. Pregunta:",
            spellingMode: "Modo Deletreo (Campo",
            spellingMode2: "Diga una o varias letras y luego espere la reactivación. O diga 'letra A letra B, ...'\nDiga 'cancelar' para borrar la última letra en caso de error.\nDiga 'validar' para finalizar el deletreo.)",

            spellingStopped: "Deletreo interrumpido por un error crítico. Reinicie manualmente",
            listeningInProgressStart: "Escuchando... Por ejemplo diga:\n- nombre Hugues validar \n- apellido Capet validar \n-  validar : entrar .\nPara deletrear una palabra diga:\napellido letra por letra c a p e t validar",
            listeningInProgress: "Escuchando... Por ejemplo diga:\n- quien eres validar , O\n- qué edad tiene Hugues Capet validar , O \n- nombre Hugues validar apellido Capet validar pregunta qué edad tiene validar .\nPara deletrear una palabra diga:\napellido letra por letra c a p e t validar",
            removed: "eliminado",
            nothingToRemove: "Nada que borrar",
            added: "Añadido",
            nextLetter: "Siguiente letra",
            recognized: "Reconocido",
            notRecognized: "Carácter no reconocido/válido. Inténtelo de nuevo",
            currentValue: "Valor actual",
            recognitionError: "Error de reconocimiento de voz. Inténtelo de nuevo",
            errorStartingRecognition: "Error al iniciar el reconocimiento de voz. Verifique los permisos del micrófono.",
            thePerson: "la persona",
            hasBeenFound: " ha sido encontrada. ¡Aquí está su ficha!",
            hasNotBeenFound: " no ha sido encontrada. Inténtelo de nuevo",
            iAmTreeViewer: "Soy 'Explora tus Orígenes', una aplicación para visualizar árboles genealógicos con animaciones",
            myCreator: "mi creador es",
            iAmUseFor: "Sirvo para visualizar árboles genealógicos GEDCOM de diferentes maneras: modo árbol, rueda o nube, con geolocalización, animaciones, síntesis de voz, reconocimiento de voz y también cuestionarios",

            speechRecognitionResult: "Resultado del reconocimiento de voz:",
            accessByVoice: "accesible por voz (editable)",
            speechRecognitionTitle: "Entrada por voz ",
            possibleQuestions: "Lista de posibles preguntas para pronunciar",
        },
        'hu': {
            btnRecord: 'Beszeljen',
            btnEraseRecord: 'Töröld <br>& Beszélj',
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

            whoAreYou : 'ki vagy',
            whatIsYourName : 'mi a neved',
            whatIsYourNameBis : 'mi a neved',
            whoCreatedYou : 'ki hozott letre',
            whatisTheUse : 'mire valo',
            whatisTheUseBis : 'mire valo',

            go: 'mehet',
            enter: 'beír',
            validate: 'jovahagy',
            validateBis: 'jovahagy',
            question: 'kerdes',
            questions: 'kérdések',
            firstname: 'keresztnev',
            lastname: 'vezeteknev',
            non: 'non',
            place: 'hely',
            occupation: 'foglalkozas',
            occupationBis: 'foglalkozas',
            date: 'datum',
            letter: 'betu',
            letter2: 'betu',
            letter3: 'betu',
            letter4: 'betu',

            by: 'altal',
            stop: 'stop',
            stopBis: 'stop',
            end: 'vege',
            year: 'ev',
            pause: 'pause',

            erase: "törlés",
            cancel: "mégse",
            remove: "eltávolítás",
            back: "vissza",
            speelingEnded: "Betűzés befejezve. Érték mentve:",
            structuredModeDetected: "Strukturált mód észlelve. Kérdés:",
            spellingMode: "Betűzési mód (Mező",
            spellingMode2: "Mondjon egy vagy több betűt, majd várjon az újraindításra. Vagy mondja: 'A betű B betű, ...'\nMondja azt, hogy 'mégse' az utolsó betű törléséhez hiba esetén.\nMondja azt, hogy 'mehet' a betűzés befejezéséhez.)",

            spellingStopped: "A betűzés kritikus hiba miatt megszakadt. Indítsa újra manuálisan",
            listeningInProgressStart: "Figyelés folyamatban... Például mondja:\n- ki vagy mehet , vagy\n- hány éves Hugues Capet mehet  , Vagy \n- keresztnév Hugues mehet vezetéknév Capet mehet kérdés hány éves mehet .\nEgy szó betűzéséhez mondja:\nvezetéknév betűről betűre c a p e t mehet",
            listeningInProgress: "Figyelés folyamatban... Például mondja:\n- keresztnév Hugues mehet \n- vezetéknév Capet mehet \n- mehet : beír \nEgy szó betűzéséhez mondja:\nvezetéknév betűről betűre c a p e t mehet",
            removed: "eltávolítva",
            nothingToRemove: "Nincs mit törölni",
            added: "Hozzáadva",
            nextLetter: "Következő betű",
            recognized: "Felismerve",
            notRecognized: "Nem felismert/érvénytelen karakter. Próbálja újra",
            currentValue: "Aktuális érték",
            recognitionError: "Hangalapú felismerési hiba. Próbálja újra",
            errorStartingRecognition: "Hiba a hangfelismerés indításakor. Ellenőrizze a mikrofon jogosultságait.",
            thePerson: "a személy",
            hasBeenFound: " meg lett találva! Íme az adatlapja",
            hasNotBeenFound: " nem lett megtalálva! Próbálja újra",
            iAmTreeViewer: "Én vagyok az 'Fedezd fel az eredeteidet', egy alkalmazás családfák animált megjelenítésére",
            myCreator: "az alkotóm",
            iAmUseFor: "Arra szolgálok, hogy GEDCOM típusú családfákat jelenítsek meg különböző módokon: fa, kerék vagy felhő nézetben, geolokációval, animációkkal, beszédszintézissel, beszédfelismeréssel és kvízekkel",

            speechRecognitionResult: "Beszédfelismerés eredménye:",
            accessByVoice: "hanggal elérhető (szerkeszthető)",
            speechRecognitionTitle: "Hangbevitel ",
            possibleQuestions: "Kiejthető lehetséges kérdések listája",

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
    // let entityKeys = []; //['commande', 'prenom', 'nom', 'lieux', 'profession'];

    let entityKeys = [ 'firstname','lastname','place','occupation','date', 'question'];
    let capturedEntities = entityKeys.reduce((acc, field) => {
        acc[translate(field)] = 'not detected';
        return acc;
    }, {});
    capturedEntities[translate('firstname')] = '';
    capturedEntities[translate('lastname')] = '';
    capturedEntities[translate('question')] = translate('whenBorn');




    let capturedEntitiesEnglish = [];
    
    // --- Variables d'État du Mode Hybride ---
    let isSpellingMode = false;
    let pendingSpellingStart = false; 
    let targetSpellingField = null;
    let targetSpellingFieldEnglish = null;
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
    let previousNewCumulativeTranscript = null;

    let isNewCommandToBeExecuted = true;
    let isNewCommandToBeExecuted2 = true;
    // const LONG_PHRASE = 'parler dans le micro par dessus cette voix, votre voix est analysée et des mots clé sont détectés ';
    let LONG_PHRASE = null;
    if (window.CURRENT_LANGUAGE === 'fr') {
        LONG_PHRASE = 'parler dans le micro par dessus cette voix.  votre voix est analysée et des mots clé sont détectés.  cette voix de fond sonore sert à garder le micro ouvert,  pour éviter les arrêts et bip sonores intempestifs, vous pouvez la couper en cliquant sur la roue et mettre le volume à zéro ';
    } else if (window.CURRENT_LANGUAGE === 'en') {
        LONG_PHRASE = 'speak into the microphone over this voice, your voice is analyzed and keywords are detected this background voice is used to keep the microphone open to avoid unwanted stops and beeping sounds you can turn it off by clicking the gear and setting the volume to zero';
    } else if (window.CURRENT_LANGUAGE === 'es') {
        LONG_PHRASE = 'habla en el micrófono sobre esta voz, tu voz es analizada y se detectan palabras clave esta voz de fondo sirve para mantener el micrófono abierto y evitar cortes y pitidos no deseados puedes desactivarla haciendo clic en la rueda y poniendo el volumen a cero';
    } else if (window.CURRENT_LANGUAGE === 'hu') {
        LONG_PHRASE = 'beszélj a mikrofonba ezen a hangon keresztül, a hangodat elemzi a rendszer és kulcsszavakat észlel ez a háttérhang arra szolgál, hogy a mikrofon nyitva maradjon és elkerülje a nem kívánt megszakításokat és sípoló hangokat kikapcsolhatod a fogaskerékre kattintva és a hangerőt nullára állítva';
    }

    // Nombre de répétitions souhaitées
    const REPETITIONS = 1; //20; 
    let SUPER_LONG_TEXT = LONG_PHRASE;
    for (let i = 0; i < REPETITIONS; i++) {
        SUPER_LONG_TEXT += LONG_PHRASE;
    }

    let stopSpeechRecognition = false;

    let isRecognitionActive = false; 

    const actionKeywords = ['whoAreYou', 'whatIsYourName', 'whatIsYourNameBis', 'whoCreatedYou', 'whatisTheUse', 'whatisTheUseBis', 'search', 'research', 'readSheet', 'whenBorn', 'whenDead', 'whenDeadW', 'whenDied', 
    'whatAge', 'whatAgePast', 'whereLive', 'whereLivePast', 'whatProfession', 'whatOccupation', 'whatProfessionPast', 'whatOccupationPast', 
    'whoMarried', 'whoMarriedPast', 'howManyChildren', 'howManyChildrenPast', 'whoIsFather', 'whoIsFatherPast', 
    'whoIsMother','whoIsMotherPast','whoAreSibling','whoAreSiblingPast', 'whatIsHistorical','whatIsHistoricalPast', 'whatAreNotes'];


    const actionKeywordsWithName = ['search', 'research', 'readSheet', 'whenBorn', 'whenDead', 'whenDeadW', 'whenDied', 
    'whatAge', 'whatAgePast', 'whereLive', 'whereLivePast', 'whatProfession', 'whatOccupation', 'whatProfessionPast', 'whatOccupationPast', 
    'whoMarried', 'whoMarriedPast', 'howManyChildren', 'howManyChildrenPast', 'whoIsFather', 'whoIsFatherPast', 
    'whoIsMother','whoIsMotherPast','whoAreSibling','whoAreSiblingPast', 'whatIsHistorical','whatIsHistoricalPast', 'whatAreNotes'];



    const actionKeywordsWithoutFirstName = ['whoAreYou', 'whatIsYourName', 'whatIsYourNameBis','whoCreatedYou', 'whatisTheUse']


    const validationSignal = [translate('go'), translate('end'), translate('stop'), , translate('endBis'), translate('enter'), translate('validateBis'), translate('validate')];
    const validationSignal2 = [translate('pause'), translate('go'), translate('end'), translate('endBis'), translate('stop'), translate('enter'), translate('validateBis'), translate('validate')];
    const correctionWords = [translate('erase'), translate('cancel'), translate('remove'), translate('back')]
    const letterTriggers = [translate('letter'), translate('letter2'), translate('letter3'), translate('letter4')];

    let isSpellingHasCompleted = false;

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

        cumulativeTranscript = cumulativeTranscript.replaceAll(capturedEntities[fieldName], valueToStore);
        capturedEntities[fieldName] = valueToStore;

        // Utiliser la variable sécurisée dans le log (résout le TypeError)
        // console.log(`[CLAVIER] after ${nameToDisplay} mis à jour manuellement à: "${valueToStore}"`, fieldName, capturedEntities[fieldName], cumulativeTranscript);

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
        console.log("--- handleValidationAndExit : DONNÉES FINALES CAPTURÉES ---", capturedData);
       
         
        // Exemple d'utilisation :
        if (capturedData.firstname) {
            console.log(`Bonjour ${capturedData.firstname} !`);
        } else {
            console.log("Aucun prénom n'a été capturé.");
        }

        if (localConfig ==='start') {
            state.initialSpeechReconitionIsLaunched = true;
            loadData(null, capturedData);
        }

        window.speechSynthesis.cancel(); 

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
        window.speechSynthesis.cancel(); 
        window.speechSynthesis.cancel(); 

        if (recognition)  {
            recognition.stop();
            // if (state.isMobile && window.speechSynthesis.speaking) {

            window.speechSynthesis.cancel(); 

        }
    }

    
    // =========================================================
    // Fonctions de Contrôle de la Bascule 
    // =========================================================

    function startSpellingCycle(targetField, targetFieldEnglish, config = null) {
        targetSpellingField = targetField;
        targetSpellingFieldEnglish = targetFieldEnglish;
        pendingSpellingStart = true; 
        // cumulativeTranscript = '';       
        if (isRecording && recognition) {
            recognition.stop(); 
            if (state.isMobile) {
                window.speechSynthesis.cancel(); 
            }            
            console.log(`[ACTION] Demande de bascule en Mode Épellation pour: ${targetField}`);
            
        } else {
            toggleSpeechRecognition(); 

            // if (state.isMobile) {
            //     window.speechSynthesis.cancel(); 
            // } 
        }

    }

    
    function stopSpellingCycle() {
        const finalValue = capturedEntities[targetSpellingField];
        // cumulativeTranscript =  cumulativeTranscript + ' ' + targetSpellingField + ' ' + capturedEntities[targetSpellingField] + ' pause ';
        // cumulativeTranscript = cumulativeTranscript.replaceAll(translate('letter'), '');
        cumulativeTranscript = ' ';

        
        isSpellingMode = false;
        targetSpellingField = null;
        targetSpellingFieldEnglish = null;
        pendingSpellingStart = false;

        recognition.continuous = !state.isMobile;
        recognition.grammars = new SpeechGrammarList(); 
        
        document.getElementById('stt-result-display').textContent = `✅ ${translate('speelingEnded')} "${finalValue}"`;
        document.getElementById('stt-interim-display').textContent = '';
        updateEntityUI(); 
        
        console.log(`[LOG STT] Valeur finale de l'épellation enregistrée: ${finalValue}`);



        // initializeSpeechRecognition();
        // if (isRecording) {
            // recognition.start(); 

        // }


        if (isRecording) {
            recognition.stop(); 
            if (state.isMobile) {
                window.speechSynthesis.cancel(); 
            }
        }

        isSpellingHasCompleted = true;




    }






    //###################################################
    async function processFullTranscript(transcript, configIn = null, isOnResult = null) {
        
        console.log('\n\n\n HHHHHHHHHHHHHHHHHHHHHHHHHH   debug processFullTranscript HHHHHHHHHHHHHHHHHHHHH \n -transcript= ', transcript, '\n -previousNewCumulativeTranscript=', previousNewCumulativeTranscript, '\n\n\n')
        
        if (previousNewCumulativeTranscript === transcript) {
            // rien de nouveu, on sort
            return;
        }

        let config = localConfig;

        const transcriptCleaned =  transcript.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // enlever les accents !!!

        let words = transcriptCleaned.split(/\s+/).filter(w => w.length > 0);
        if (words.length === 0) return;

        // =========================================================
        // NOUVEAU MODE : Détection de Séquence Spécifique (Action Prénom Nom GO)
        // =========================================================

        let fullTranscript = transcriptCleaned.trim(); // Version propre du transcript
        fullTranscript = fullTranscript.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // enlever les accents !!!


        isNewCommandToBeExecuted = true;
        
        if (isOnResult == 'onEnd' && previousFullTranscriptOnResult === fullTranscript ) { 
            console.log('\n\n ---- debug 1  : NE PAS EXCECUTER CETTE COMMANDE car c est UN ONEND dupliqué d un ONRESULT déjà excécuté');
            isNewCommandToBeExecuted = false;
        }
        

        console.log('\n #####################   [LOG STT] Détection input : ', transcript , ',',previousFullTranscript, ',', fullTranscript, ',isNewCommandToBeExecuted =',isNewCommandToBeExecuted,',isOnresult=' ,isOnResult);

        if (isOnResult == 'onResult') { previousFullTranscriptOnResult = fullTranscript; }
        else { previousFullTranscriptOnEnd = fullTranscript; } 
        previousFullTranscript = fullTranscript;
        

        
        
        
        // 1 -  ##########"  Détecter si il y a une question dans le transcript"
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




        // 1 -  ##########"  Détecter si il y a une ou des keys  dans le transcript"
        let isKeyDetected = false;
        let isSpellDetected = false;
        let KeyDetectedTab = [];

        const entityList = ['firstname','lastname', 'non','place','occupation','date','question'];


        
        // entityList.forEach( key=> {
        //     const index = fullTranscript.lastIndexOf(translate(key)+ ' ');
        //     const truncatedTranscriptForKey = fullTranscript.substring(index);
        //     const wordsKey = truncatedTranscriptForKey.split(/\s+/).filter(w => w.length > 0);
        //     const isPauseKeyDetected = truncatedTranscriptForKey.lastIndexOf('pause'+ ' ');

        //     // console.log('\n\n\n\n\n @@@@@@@@@@@@@@@@@@   debug  detected word @@@@@@@ key', key, 'truncatedTranscriptForKey=',truncatedTranscriptForKey, index, wordsKey, wordsKey.length, validationSignal.includes(wordsKey[wordsKey.length - 1]), isPauseKeyDetected, '\n\n\n')

        //     let localKey = key;
        //     if(key === 'non') { localKey = 'lastname';}

        //     // let wordsKeyMinLength = 7;

        //     // si un keyWord est détecté et un validation word à la fin du transcript
        //     if (!isKeyDetected && index !== -1  && validationSignal.includes(wordsKey[wordsKey.length - 1]) && !validationSignal.includes(wordsKey[wordsKey.length - 2]) && wordsKey.length < 7 && isPauseKeyDetected === -1 ) {
        //         capturedEntities[translate(localKey)] = truncatedTranscriptForKey.replace(translate(key), '').split(/\s+/).slice(1, -1).join(' ');; // enlever le 1ier et le dernier mot 

        //         cumulativeTranscript = ' ';
        //         // if (entityList.includes(wordsKey[wordsKey.length - 1])) {
        //         //     cumulativeTranscript = ' ' + wordsKey[wordsKey.length - 1] + ' ';
        //         // }
        //         previousNewCumulativeTranscript = cumulativeTranscript;

        //         updateEntityUI();
        //         isKeyDetected = true;
        //         KeyDetectedTab[localKey] = true;
              

        //     } else {
        //        KeyDetectedTab[key] = false; 
        //     }

        //     // console.log('\n\n\n\n\n @@@@@@@@@@@@@@@@@@   debug  detected key=', key, ' @@@@@@@ : ', wordsKey[0], wordsKey[1], wordsKey[2], wordsKey[3], wordsKey[4], window.CURRENT_LANGUAGE,'\n\n\n')
           
        //     let wordIndex = 1;
        //     if (window.CURRENT_LANGUAGE === 'en' && ( key === 'firstname' || key ==='lastname') ) {
        //         wordIndex = 2;
        //     }
            
            
        //     // si un keyWord est détecté et la séquence 'lettre par lettre' est détectée
        //     if ( !isSpellDetected && index !== -1 &&  letterTriggers.includes(wordsKey[wordIndex]) && wordsKey[wordIndex+1] === translate('by') && letterTriggers.includes(wordsKey[wordIndex+2]) ){                              

        //         console.log(`[ACTION] Déclenchement du Mode Épellation par 'lettre par lettre' pour le champ:${translate(localKey)}`);
        //         capturedEntities[translate(localKey)] = '';
        //         updateEntityUI();

        //         startSpellingCycle(translate(localKey), localKey, config); 
        //         isSpellDetected = true;
        //         return; 
        //     }
        // })






        let isOneKeyIsDetected = false;
        let KeyDetectedArray = [];
        const entityListAndValidation = ['firstname','lastname', 'non','place','occupation','date', 'question','pause', 'go', 'end','endBis','stop','enter','validateBis','validate'];
        const ValidationList = ['pause', 'go', 'end','endBis','stop','enter','validateBis','validate'];
        
        entityListAndValidation.forEach( key=> {
            let index = -1;
            if (ValidationList.includes(key)) { index = fullTranscript.lastIndexOf(translate(key)); } 
            else { index = fullTranscript.lastIndexOf(translate(key)+ ' '); }
            // console.log('\n\n\n\n\n @@@@@@@@@@@@@@@@@@   debug  detected word @@@@@@@ key', key, 'truncatedTranscriptForKey=',truncatedTranscriptForKey, index, wordsKey, wordsKey.length, validationSignal.includes(wordsKey[wordsKey.length - 1]), isPauseKeyDetected, '\n\n\n')
            // si un keyWord est détecté et un validation word à la fin du transcript
            if (index!== -1) {
                if (key === 'lastname' && KeyDetectedArray.find(item => item.id === 'firstname') && index === KeyDetectedArray.find(item => item.id === 'firstname').index +3){ /*skip*/;}
                else { KeyDetectedArray.push({ id: key, index: index }); isOneKeyIsDetected = true; }
            }
        })

        console.log('KeyDetectedArray=', KeyDetectedArray);

        // tri de l'index le plus petit au plus grand
        KeyDetectedArray.sort((a, b) => a.index - b.index);

        entityList.forEach( key=> {
            // console.log('\n\n\n\n\n @@@@@@@@@@@@@@@@@@   debug  detected word @@@@@@@ key', key, 'truncatedTranscriptForKey=',truncatedTranscriptForKey, index, wordsKey, wordsKey.length, validationSignal.includes(wordsKey[wordsKey.length - 1]), isPauseKeyDetected, '\n\n\n')
            let localKey = key;
            if(key === 'non') { localKey = 'lastname';}
            // si un keyWord est détecté et un validation word à la fin du transcript

            let localKeyItem = KeyDetectedArray.find(item => item.id === key);
            if ( localKeyItem && localKeyItem.index !== -1 ) {
                let itemFound = false;
                KeyDetectedArray.forEach( item => {
                    if (!itemFound && item.index !== -1 && item.index > localKeyItem.index ) {
                        itemFound = true;
                        const truncatedTranscriptForKey = fullTranscript.substring(localKeyItem.index, item.index);
                        cumulativeTranscript = cumulativeTranscript.replace(truncatedTranscriptForKey, '');
                        capturedEntities[translate(localKey)] = truncatedTranscriptForKey.replace(translate(key), '').trim(); // enlever le 1ier et le dernier mot 
                        let testValue = truncatedTranscriptForKey.replace(translate(key), '').trim();
                        testValue = "'" + testValue + "'";
                        console.log('\n\n\n\n\n @@@@@@@@@@@@@@@@@@   debug  key', localKey, 'key2=',item.id,'testValue=',testValue,'index1=', localKeyItem.index, 'index2=', item.index,'\n\n\n')
                    }
                });
            }
        })

        if (isOneKeyIsDetected) {
            updateEntityUI();
        }












        // console.log('\n\n\n\n\n @@@@@@@@@@@@@@@@@@   debug  launch load  @@@@@@@ key',KeyDetectedTab['firstname'], KeyDetectedTab['lastname'], 'firstname=',capturedEntities[translate('firstname')], 'lastname=',capturedEntities[translate('lastname')] , words,   transcript, 'cumulativeTranscript=', cumulativeTranscript,'\n\n\n')

        if (config === 'start') { 
            
            // si double validate
            if (validationSignal.includes(words[words.length - 1]) && validationSignal.includes(words[words.length - 2]) ) {
                if ((capturedEntities[translate('lastname')]!= undefined && capturedEntities[translate('lastname')]!= 'not detected' && capturedEntities[translate('lastname')]!= '') 
                || (capturedEntities[translate('firstname')]!= undefined && capturedEntities[translate('firstname')]!= 'not detected' && capturedEntities[translate('firstname')]!= '')) {

                    capturedEntitiesEnglish['firstname'] = capturedEntities[translate('firstname')];
                    capturedEntitiesEnglish['lastname'] = capturedEntities[translate('lastname')];       
                    arreterEcouteAction();
                    stopSpeechRecognition = true;         
                    handleValidationAndExit();
                    return;
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
            // if (isOnResult == 'onEnd' && previousTruncatedTranscriptOnResult === truncatedTranscript ) { 
            if (previousTruncatedTranscriptOnResult === truncatedTranscript ) { 
                console.log('\n\n ---- debug 2  : NE PAS EXCECUTER CETTE COMMANDE car c est UN ONEND dupliqué d un ONRESULT déjà excécuté');
                isNewCommandToBeExecuted2 = false;
            }
            if (isOnResult == 'onResult') { previousTruncatedTranscriptOnResult = truncatedTranscript; }
            else { previousTruncatedTranscriptOnEnd = truncatedTranscript; } 
            previousTruncatedTranscript = truncatedTranscript
        }

        async function launchSearchPeopleAction(detectedAction) {
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

            let alternativeName = capturedEntities[translate('lastname')];
            if (capturedEntities[translate('lastname')] === 'dumesnil' || capturedEntities[translate('lastname')] === 'du mesnil' ) {
                capturedEntities[translate('lastname')] = 'dumenil';
            }


            res = findPersonsBy('', config, '', null, capturedEntities[translate('firstname')], capturedEntities[translate('lastname')], false);


            console.log('\n\n\n ------------   debug0 : personne trouvée ??? ---------', res, res.results[0]);
            let lastAlternativeNameFound = null;
            let othernames = null;
            if (res.results.length === 0) {
                // essayer avec un changement d'ortographe du nom, par exemple dumenil à la place de dumesnil
                othernames = generatePhoneticAlternatives(alternativeName);
                othernames.push(alternativeName);

                if (othernames.length > 0) {
                    othernames.forEach(name => { 
                        lastAlternativeNameFound = name;
                        res2 = findPersonsBy('', config, '', null, capturedEntities[translate('firstname')], name, false);
                        console.log('\n\n\n ------------   debug : personne trouvée ??? ---------', res2, res2.results[0]);
                        if (res2.results.length > 0 ) return;
                    });
                }
            }
            // si la personne a été trouvé on lance l'action
            if (res.results.length > 0 || (othernames && othernames.length > 0 && res2.results.length > 0 )) {
                const name = (res.results.length > 0) ? capturedEntities[translate('lastname')] : lastAlternativeNameFound;
                let textToTell = translate('thePerson') + ' ' + capturedEntities[translate('firstname')] + ' ' + name + ' ' + translate('hasBeenFound');
                arreterEcouteAction();
                stopSpeechRecognition = true;
                if (state.isMobile ) {
                    window.speechSynthesis.cancel(); 
                }

                let personId = (res.results.length > 0) ? res.results[0].id : res2.results[0].id;

                if (detectedAction  === 'search' || detectedAction  === 'research' ) {
                    displayPersonDetails(personId);
                }

                await speakTextWithWaitToEnd('essai', '0.0'); // ppour débugger le son et éviter la 1iere saccade de son

                // si on n'a la question 'search' ou 'research' , donc une autre action on lance la lecteur de la fiche ou d'un items de la fiche
                if (!detectedAction.includes('search') && !detectedAction.includes('research')  ) { 
                    const quizzMessage = document.getElementById('quizz-message');
                    if (quizzMessage) { quizzMessage.remove(); }
                    await readPersonSheet(personId, detectedAction); 
                } 
                
                // si on a la question 'search' ou 'research' on affiche seulement la fiche
                else { await speakTextWithWaitToEnd(textToTell); }


                // hideUI();
                if (!isRecognitionActive) { recognition.start(); }
                if (state.isMobile && !isSpellingMode) {
                    setTimeout(() => {
                        stopSpeechRecognition = false;
                        speakTextfromSliderParams(SUPER_LONG_TEXT);
                    }, 2000);
                }                    
                if (!state.isMobile) {
                    clearTimeout(recognitionTimeout);
                    recognitionTimeout = setTimeout(() => {
                        if (isRecording) {
                            isRecording = false;
                            recognition.stop();
                            window.speechSynthesis.cancel(); 
                            window.speechSynthesis.cancel(); 
                        }
                    }, PC_MAX_DURATION_MS);
                }

                const overlay = document.getElementById('stt-only-overlay');

                makeModalInteractive(overlay); 

            } 
            
            // si la personne n'a pas été trouvée on lance juste un message          
            else {
                // recognition.stop();
                arreterEcouteAction();
                stopSpeechRecognition = true;
                if (state.isMobile) {
                    window.speechSynthesis.cancel(); 
                }                    

                let textToTell = translate('thePerson') + ' ' + capturedEntities[translate('firstname')] + ' ' + capturedEntities[translate('lastname')] + ' ' + translate('hasNotBeenFound');
                console.log('\n\n\n ------------   debug : ', textToTell, cumulativeTranscript);
                await speakTextWithWaitToEnd(textToTell);

                console.log('\n\n\n ------------   debug words after fail: ',  cumulativeTranscript);

                if (!isRecognitionActive) { recognition.start(); }
                if (state.isMobile && !isSpellingMode) {
                    setTimeout(() => {
                        stopSpeechRecognition = false;
                        speakTextfromSliderParams(SUPER_LONG_TEXT);
                    }, 2000);
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
        }

        async function launchSimpleAction(detectedAction) {
            // if (  (detectedAction.includes('whoAreYou') || detectedAction.includes('whatIsYourName') || detectedAction.includes('whoCreatedYou') || detectedAction.includes( 'whatisTheUse')) ) {
            console.log('\n\n\n ------------   debug  prononcer : ', detectedAction);
            // quans la commande a été exécutée on reset les conditions 
            isNewCommandToBeExecuted = false; isNewCommandToBeExecuted2 = false;

            arreterEcouteAction();
            // recognition.stop()
            stopSpeechRecognition = true;
            window.speechSynthesis.cancel(); 
            
            await speakTextWithWaitToEnd('essai', '0.0'); // ppour débugger le son et éviter la 1iere saccade de son
            // await speakTextWithWaitToEnd(' ', 1); // ppour débugger le son et éviter la 1iere saccade de son
            if (detectedAction.includes('whoAreYou') || detectedAction.includes('whatIsYourName') || detectedAction.includes('whatIsYourNameBis')) {
                await speakTextWithWaitToEnd(translate('iAmTreeViewer'));         
            } else if (detectedAction.includes('whoCreatedYou')) {
                await speakTextWithWaitToEnd(translate('myCreator') + ' Patrick Duménil');      
            } else if (detectedAction.includes('whatisTheUse')) {
                // await speakTextWithWaitToEnd('je sers à visualiser les arbres généalogiques de type GEDCOM, de différentes manière, en mode arbre, roue, ou nuage, avec de la géolocalisation, des animation, de la synthèse vocale et reconnaissance vocale, et aussi des quizz', 1.0);      
                await speakTextWithWaitToEnd(translate('iAmUseFor'));      
            }
            if (!isRecognitionActive) { recognition.start(); }
            if (state.isMobile && !isSpellingMode) {
                setTimeout(() => {
                    stopSpeechRecognition = false;
                    speakTextfromSliderParams(SUPER_LONG_TEXT);
                }, 2000);
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
        
        let newCumulativeTranscript = ''
        // =========================================================
        // DEBUT DU MODE : question + .... + validationSignal
        // =========================================================
        // VÉRIFICATION GLOBALE : Est-ce qu'une action a été détectée ? Et y a-t-il un signal de validation ?
        
        // si on a une clé 'Question'  et une clé de validation sur le dernier mot : exemple 'qui es tu go' ou 'quel age a xx yy go'
        
        
        if ( config === 'full' && detectedAction && validationSignal.includes(words[words.length - 1])) {

            if (state.isMobile ) {
                window.speechSynthesis.cancel(); 
            }

            // 1. Enregistrer l'Action
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
                    minSize = Math.min(minSize, beforeKeyword.length);
                    if (minSize === beforeKeyword.length) { beforeKeywordFinal = beforeKeyword; }
                    // console.log('\n ------------  debug  entityPart , keyword=', keyword, beforeKeyword, 'after=', afterKeyword)
                }
            }
            if (beforeKeywordFinal != null && beforeKeywordFinal != ' '  && beforeKeywordFinal != '') { entityWords = beforeKeywordFinal.split(/\s+/)}

            // console.log('\n ------------  debug  final entityPart =',  entityWords, ',beforeKeywordFinal=',beforeKeywordFinal, ', newCumulativeTranscript=' ,newCumulativeTranscript)


            let isEntityKeyAvailable = [];
            entityKeys.forEach(key => { isEntityKeyAvailable[key] = false; });

            // console.log('\n ------------  debug isEntityKeyAvailable=' ,isEntityKeyAvailable)

            if (!isActionWithoutFirstName) {               
                // console.log('\n\n --------- debug --- entityWords.length=', entityWords.length, ',isFirstNameAvailable, isLastNameAvailable, isPlaceAvailable, isOccupationAvailable,isDateAvailable=  ',isEntityKeyAvailable['firstname'], isEntityKeyAvailable['lastname'], isEntityKeyAvailable['place'], isEntityKeyAvailable['occupation'],isEntityKeyAvailable['date'], 'detectedAction=' ,detectedAction );

                if (entityWords.length >= 2) {
                    // Par convention, le premier mot après l'action est le PRÉNOM
                    if (!KeyDetectedTab['firstname']) { capturedEntities[translate('firstname')] = entityWords[0]; }
                    isEntityKeyAvailable['firstname'] = true;
                    
                    // Tous les mots restants sont considérés comme le NOM
                    if (!KeyDetectedTab['lastname']) {capturedEntities[translate('lastname')] = entityWords.slice(1,4).join(' ');}
                    isEntityKeyAvailable['lastname'] = true;
                } else if (entityWords.length === 1) {
                    // S'il n'y a qu'un seul mot (ex: 'chercher Henri GO'), on le met en Nom par défaut ou on gère l'erreur
                    if (!KeyDetectedTab['firstname']) { capturedEntities[translate('firstname')] = entityWords[0]; }
                    isEntityKeyAvailable['firstname'] = true; 
                }
            }

            // console.log('\n ------------  debug newCumulativeTranscript=' ,newCumulativeTranscript)

            entityKeys.forEach(key => {
                if (capturedEntities[translate(key)] && capturedEntities[translate(key)] != 'not detected' && capturedEntities[translate(key)] != null && capturedEntities[translate(key)] != '' ) {
                    isEntityKeyAvailable[key] = true ; 
                }
            });

            // console.log('\n ------------  debug  final entityPart =',  entityWords,', newCumulativeTranscript=' ,newCumulativeTranscript)

            document.getElementById('stt-result-display').textContent = `✅ ${translate('structuredModeDetected')} ${detectedAction.toUpperCase()}, ${translate('firstname')}: ${capturedEntities[translate('firstname')]}, ${translate('lastname')}: ${capturedEntities[translate('lastname')]}.`;
            updateEntityUI();

            if (!isActionWithoutFirstName && isEntityKeyAvailable['firstname'] && isEntityKeyAvailable['lastname']) { 
                await launchSearchPeopleAction(detectedAction);
            } else if ( (detectedAction.includes('whoAreYou') || detectedAction.includes('whatIsYourName') || detectedAction.includes('whatIsYourNameBis') || detectedAction.includes('whoCreatedYou') || detectedAction.includes( 'whatisTheUse') ) ) {
                await launchSimpleAction(detectedAction);
            }

            console.log ('\n\n\n\n\n\n ++++++++++++++++++++     Final texte === ', cumulativeTranscript,'+++++++++++++++++++++++++\n\n\n\n')

            cumulativeTranscript = ' ';
            previousNewCumulativeTranscript = cumulativeTranscript;

           return; 
        }

        // si on a une clé question dans le capturedEntities et une clé de validation sur le dernier mot,  (mais pas de clé 'Question' dans le texte) : exemple texte= ' go' et capturedEntities[translate('question')] ='quel age a '
        else if ( (capturedEntities[translate('question')] != 'not detected') && (capturedEntities[translate('question')] != undefined) && validationSignal.includes(words[words.length - 1])) {
            console.log(`---------[LOG STT] Détection du mode avec question  l'expression: "${capturedEntities[translate('question')]}"`);//, previousFullTranscript, ',',fullTranscript, 'truncatedTranscript',truncatedTranscript,',isNewCommandToBeExecuted =',isNewCommandToBeExecuted, isNewCommandToBeExecuted2, ',capturedEntities=', capturedEntities, 'isActionWithoutFirstName', isActionWithoutFirstName, 'detectedAction=',detectedAction, 'actionKeywordsWithoutFirstName=' ,actionKeywordsWithoutFirstName);

            let isDetectedQuestion = false;
            let detectedQuestion = null;
            if (capturedEntities[translate('firstname')] != 'not detected' && capturedEntities[translate('lastname')] != 'not detected' &&capturedEntities[translate('firstname')] != '' && capturedEntities[translate('lastname')] != '') {

                actionKeywordsWithName.forEach(key => {
                    // console.log('\n\n\n -------------   debug detected action -------------- = ',key, translate(key), capturedEntities[translate('question')] )
                    if (translate(key).includes(capturedEntities[translate('question')]) ) {
                        console.log('\n\n\n -------------   debug detected action with firstname-------------- = ',capturedEntities[translate('question')] , 'validationSignal=', words[words.length - 1])
                        isDetectedQuestion = true;
                        detectedQuestion = key;
                    }
                });
                if(isDetectedQuestion) { await launchSearchPeopleAction(detectedQuestion);}
            }

            if (!isDetectedQuestion) {
                actionKeywordsWithoutFirstName.forEach(key => {
                    // console.log('\n\n\n -------------   debug detected action -------------- = ',key, translate(key), capturedEntities[translate('question')] )
                    if (translate(key).includes(capturedEntities[translate('question')]) ) {
                        console.log('\n\n\n -------------   debug detected action without name-------------- = ',capturedEntities[translate('question')] , 'validationSignal=', words[words.length - 1])
                        isDetectedQuestion = true;
                        detectedQuestion = key;
                    }
                });
                if(isDetectedQuestion) {await launchSimpleAction(detectedQuestion);}
            }

            console.log ('\n\n\n\n\n\n ++++++++++++++++++++     Final texte  with only validate === ', cumulativeTranscript,'+++++++++++++++++++++++++\n\n\n\n')

            cumulativeTranscript = ' ';
            previousNewCumulativeTranscript = cumulativeTranscript;


            return;
        } 
        // =========================================================
        // FIN DU MODE QUESTION
        // =========================================================


        console.log ('\n\n\n\n\n\n ++++++++++++++++++++      texte  libre === ', cumulativeTranscript,'+++++++++++++++++++++++++\n\n\n\n')
        if (cumulativeTranscript.length > 10) {
            cumulativeTranscript = ' ' + cumulativeTranscript.trim().split(/\s+/).slice(-10).join(' ') + ' ';
        }
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
            isRecognitionActive = true;
            updateButtonUI(true); 
            const display = document.getElementById('stt-result-display');
            // Ensure the element displays line breaks from textContent
            if (display) display.style.whiteSpace = 'pre-line';
            
            if (isSpellingMode) {
                display.textContent = `✏️ ${translate('spellingMode')} : ${translate(targetSpellingFieldEnglish).toUpperCase()}):  ${translate('spellingMode2')}.`;
            } else {
                if (localConfig === 'start') { display.textContent = `🎤 ${translate('listeningInProgressStart')}`; }
                else { display.textContent = `🎤 ${translate('listeningInProgress')}`; }
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
                    

                    // if (state.isMobile) {
                    //     window.speechSynthesis.cancel(); 
                    // } 

                    const recognizedSegment = transcriptSegment.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase(); 
                    
                    // if (recognizedSegment === 'terminer' || recognizedSegment === 'fin' || recognizedSegment === 'fini') {
                    if (validationSignal.includes(recognizedSegment) ) {
                        stopSpellingCycle(); 
                        return;
                    }

                    
                    // 1. Nettoyage de base
                    let raw = transcriptSegment.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
                    
                    console.log(`[DEBUG RAW] Reçu: "${raw}"`);

                    // 2. GESTION DES CORRECTIONS (Prioritaire)
                    // On vérifie si l'utilisateur veut supprimer la dernière lettre
                    //const correctionWords = ["effacer", "annuler", "supprimer", "retour"];
                    if (correctionWords.some(word => raw.includes(word))) {
                        let currentValue = capturedEntities[targetSpellingField] || '';
                        
                        if (currentValue.length > 0 && currentValue !== 'not detected') {
                            const lastChar = currentValue.slice(-1);
                            capturedEntities[targetSpellingField] = currentValue.slice(0, -1); // On enlève la dernière lettre
                            
                            console.log(`[CORRECTION] "${lastChar.toUpperCase()}" supprimé. Reste: "${capturedEntities[targetSpellingField]}"`);
                            document.getElementById('stt-result-display').textContent = `🗑️ ${translate('removed')}: "${lastChar.toUpperCase()}".`;
                            updateEntityUI();
                        } else {
                            document.getElementById('stt-result-display').textContent = `⚠️ ${translate('nothingToRemove')}.`;
                        }
                        return; // On s'arrête là pour ce cycle
                    }

                    // 3. TRAITEMENT DE L'ÉPELLATION (comme vu précédemment)
                    // const letterTriggers = ['lettre', "l'etre", 'etre'];
                    let processedChar = "";
                    let triggerFound = false;

                    for (let trigger of letterTriggers) {
                        if (raw.startsWith(trigger)) {
                            let remainder = raw.replace(trigger, "").trim();
                            if (remainder.length > 0) {
                                processedChar = remainder.charAt(0);
                                triggerFound = true;
                                break;
                            }
                        }
                    }


                    // 4. VALIDATION ET AJOUT
                    if (processedChar && (alphabet.includes(processedChar) || digits.includes(processedChar))) {
                        let currentValue = capturedEntities[targetSpellingField] || '';
                        if (currentValue === 'not detected') currentValue = '';
                        
                        capturedEntities[targetSpellingField] = currentValue + processedChar;
                        
                        console.log(`✅ AJOUTÉ: "${processedChar.toUpperCase()}" | Total: ${capturedEntities[targetSpellingField]}`);
                        document.getElementById('stt-result-display').textContent = `✅ ${translate('added')}: "${processedChar.toUpperCase()}"`;
                        updateEntityUI();
                    } else {
                        // mode lettre par lettre sans mot de trigger
                        let addedChars = '';
                        let errorDetected = false;
                        
                        for (let i = 0; i < recognizedSegment.length; i++) {
                            const detectedChar = recognizedSegment.charAt(i);
                            
                            if (alphabet.includes(detectedChar) || digits.includes(detectedChar)) {
                                addedChars += detectedChar;
                            } else if ( detectedChar === ' ') { }
                            else {
                                errorDetected = true;
                                break; 
                            }
                        }


                        if (addedChars.length > 0) {
                            
                            let currentValue = capturedEntities[targetSpellingField] || '';
                            if (currentValue === 'not detected') currentValue = '';
                            
                            capturedEntities[targetSpellingField] = currentValue + addedChars; 
                            
                            document.getElementById('stt-result-display').textContent = `✅ ${translate('added')}: "${addedChars.toUpperCase()}". ${translate('nextLetter')}?`;
                            document.getElementById('stt-interim-display').textContent = `(${translate('recognized')}: "${recognizedSegment}"). ${translate('currentValue')}: ${capturedEntities[targetSpellingField]}`;
                            console.log('\n\n ---- debug spelling mode ------  Reconnu:', recognizedSegment, '. Valeur actuelle:', capturedEntities[targetSpellingField]);
                            updateEntityUI();
                        } else if (errorDetected) {
                             document.getElementById('stt-result-display').textContent = `❌ ${translate('notRecognized')}.`;
                             document.getElementById('stt-interim-display').textContent = `(${translate('recognized')}: "${recognizedSegment}")`;
                        }

                    }
                    
                    return; 
                    
                } 
                else {
                    if (transcriptSegment != '') // && transcriptSegment != ' ')
                    {
                        cumulativeTranscript += transcriptSegment + ' ';
                        console.log('\n\n ------------------   debug  call to processFullTranscript  from recognition.ONRESULT, result.isFinal : !isSpellingMode; cumulativeTranscript=', cumulativeTranscript, 'transcriptSegment=' ,transcriptSegment)
                        processFullTranscript(cumulativeTranscript.trim(), config, 'onResult');
                    }
                }
            } else {
                interimTranscript += transcriptSegment;
            }
            
            if (!isSpellingMode) {
                // document.getElementById('stt-interim-display').textContent = interimTranscript
                if (cumulativeTranscript.length > 10) {
                    cumulativeTranscript = ' ' + cumulativeTranscript.trim().split(/\s+/).slice(-10).join(' ') + ' ';
                }
                if (interimTranscript.length > 10) {
                    interimTranscript = ' ' + interimTranscript.trim().split(/\s+/).slice(-10).join(' ') + ' ';
                    cumulativeTranscript = '';

                }
                document.getElementById('stt-result-display').textContent = cumulativeTranscript + interimTranscript;

            }
            console.log ('\n\n\n\n\n\n ++++++++++++++++++++     texte in progress ===',`'${cumulativeTranscript + interimTranscript}'` ,'config=' , config,'localConfig=' ,localConfig,'+++++++++++++++++++++++++\n\n\n\n')


            if (cumulativeTranscript + interimTranscript === '' || cumulativeTranscript + interimTranscript === ' ') {
                if (localConfig === 'start') { document.getElementById('stt-result-display').textContent = `🎤 ${translate('listeningInProgressStart')}`; }
                else { document.getElementById('stt-result-display').textContent = `🎤 ${translate('listeningInProgress')}`; }
            }


        };



        recognition.onend = (event ) => {
            isRecognitionActive = false;
            // 🚨 CONSTANTE POUR LE DÉLAI ANTI-BRUIT
            const ANTI_NOISE_DELAY_MS = 500; // Augmenté à 150ms pour une meilleure stabilisation

            clearTimeout(recognitionTimeout); 
            
            if (pendingSpellingStart) {
                capturedEntities[targetSpellingField] = '';
                pendingSpellingStart = false; 
                isSpellingMode = true; 
                recognition.continuous = false; 
                recognition.grammars = spellingGrammar; 
                
                // 🚨 MODIFICATION : Application du délai anti-bruit (150ms)
                setTimeout(() => {
                    try {

                        if (!isRecognitionActive) { recognition.start(); }
                        if (state.isMobile && !stopSpeechRecognition && !isSpellingMode) {
                            speakTextfromSliderParams(SUPER_LONG_TEXT);
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
                        if (!isRecognitionActive) { recognition.start(); }
                        if (state.isMobile && !stopSpeechRecognition && !isSpellingMode) {
                            speakTextfromSliderParams(SUPER_LONG_TEXT);
                        }                        
                        console.log("[LOG STT] RELANCE: Mode Épellation relancé après capture/silence. 🔊");
                    } catch(e) {
                        console.log("[LOG STT] Tentative d'arrêt critique du mode épellation.");
                        isRecording = false; 
                        isSpellingMode = false; 
                        updateButtonUI(false);
                        document.getElementById('stt-result-display').textContent = `⚠️ ${translate('spellingStopped')}.`;
                    }
                }, ANTI_NOISE_DELAY_MS); 
                
            } 
            
            else if (isRecording && !isSpellingMode) { 
                
                if (cumulativeTranscript.trim().length > 0) {
                    console.log('\n\n ------------------  debug call to processFullTranscript from recognition.ONEND, else if (isRecording && !isSpellingMode)', cumulativeTranscript )
                    processFullTranscript(cumulativeTranscript.trim(), config, 'onEnd');
                }

                if (state.isMobile) {
                    // 🚨 MODIFICATION : Standardisation du délai à 150ms (ou gardez 1500ms si c'est nécessaire pour le traitement métier!)
                    setTimeout(() => {
                        if (isRecording) { 
                            try {
                                if (!isRecognitionActive) { recognition.start(); }
                                if (state.isMobile && !stopSpeechRecognition && !isSpellingMode) {
                                    speakTextfromSliderParams(SUPER_LONG_TEXT);
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
                    if (isSpellingHasCompleted) {
                        console.log("\n[LOG STT] tentative de relance ???.");
                        toggleSpeechRecognition(); 
                    }

                }

            } else {
                updateButtonUI(false); 
                console.log("[LOG STT] Reconnaissance Vocale arrêtée volontairement/finale.");
            }
        };











        recognition.onerror = (event) => {
            document.getElementById('stt-result-display').textContent = `${translate('recognitionError')}: ${event.error}`;
            document.getElementById('stt-result-display').style.color = 'red';
            if (event.error != 'no-speech' ) {
                isRecording = false;
                isSpellingMode = false; 
                pendingSpellingStart = false; 
                updateButtonUI(false); 
            } else {
                isRecording = false;
                isSpellingMode = false; 
                pendingSpellingStart = false; 
                updateButtonUI(false);
                toggleSpeechRecognition('continue', 'restart'); 
                console.error("[LOG STT] Erreur STT bis bis:", event.error);                
            }
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
    
        if (existingOverlay) {
            // Si l'overlay existe déjà, on récupère la modale à l'intérieur
            const existingModal = existingOverlay.querySelector('#speechRecognitionModal');
            if (existingModal && typeof existingModal.resetPositionAndSize === 'function') {
                // On réinitialise la position et la taille avant de l'afficher
                existingModal.resetPositionAndSize();
            }
            return existingOverlay;
        }

        const overlay = document.createElement('div');
        overlay.id = overlayId;


        // --- NOUVEAU : Récupération des valeurs stockées (ou par défaut) ---
        const storedVolume = '0.002'; //getTtsSetting('voice_volume', '1.0');
        const storedRate   = '0.7'; //getTtsSetting('voice_rate', '1.0');
        const storedPitch  = '1.0'; //getTtsSetting('voice_pitch', '1.0');


        
        // --- Configuration pour rendre l'overlay NON BLOQUANT ---
        overlay.style.cssText = `
            position: fixed; 
            top: 0; 
            left: 0; 
            width: 100%; 
            height: 100%;
            background-color: transparent; 
            display: none;
            justify-content: center; 
            align-items: center; 
            z-index: 10000;
            pointer-events: none; 
        `;

        const modal = document.createElement('div');
        modal.id = 'speechRecognitionModal';
        modal.style.cssText = `
            background-color: white; padding: 20px; border-radius: 12px; 
            max-width: 400px; width: 90%; 
            /* CORRECTION CRITIQUE POUR MOBILE / ÉCRAN BASSE HAUTEUR */
            max-height: 90vh; 
            overflow-y: auto; 
            /* Fin CORRECTION */
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
            font-family: Arial, sans-serif;
            pointer-events: auto; 
        `;
        
        // Structure HTML pour les champs INPUT ---
        modal.innerHTML = `
            <style>
                /* --- DÉFINITION DE L'ANIMATION DE ROTATION --- */
                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
                /* --- FIN DÉFINITION --- */
            
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
                    padding: 10px; 
                    font-size: 1em; 
                    cursor: pointer; 
                    border: none; 
                    border-radius: 8px; 
                    display: flex; 
                    align-items: center; 
                    gap: 5px; 
                    flex-grow: 1; 
                    justify-content: center; 
                    height: 40px; 
                }
                /* Style pour les Sliders TTS compacts */
                .tts-slider-group {
                    margin-bottom: 5px; 
                    padding: 3px 0;
                }
                .tts-slider-group label {
                    display: flex;
                    justify-content: space-between;
                    font-weight: normal; 
                    font-size: 0.9em; 
                    margin-bottom: 2px;
                    align-items: center;
                }
                .tts-slider-group input[type="range"] {
                    width: 100%;
                    cursor: pointer;
                    height: 18px; 
                }
                /* Nouveaux styles pour le bouton ⚙️/↩️ (Point 2) */
                #toggle-tts-controls {
                    background-color: transparent !important; 
                    color: white; 
                    border: none; 
                    padding: 5px; 
                    border-radius: 6px; 
                    font-weight: bold;
                    font-size: 1.8em; 
                    line-height: 1;
                    width: 35px; 
                    height: 35px; 
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    
                    /* APPLICATION DE L'ANIMATION LENTE */
                    animation: spin 10s linear infinite; 
                }
                /* Masquer par défaut (Point 3) */
                #toggle-tts-controls-wrapper {
                    display: none; 
                }
            </style>

            <div id="speechRecognitionHeader" style="
                position: sticky; top: -20px; 
                font-size: ~1.17em; font-weight: bold; border-radius: 12px 12px 0 0; 
                margin-top: -20px; margin-left: -20px; margin-right: -20px; 
                padding-top: 7px; padding-bottom: 7px; padding-left: 20px; padding-right: 20px; 
                display: flex; justify-content: space-between; align-items: center; 
                background-color: #cc9eddff; 
                z-index: 10; 
            ">
                <span>${translate('speechRecognitionTitle')}(Langue : ${targetLang})</span>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div id="toggle-tts-controls-wrapper">
                        <button id="toggle-tts-controls" style="cursor: pointer;">
                            ⚙️ </button>
                    </div>
                    <button id="close-stt-button" class="stt-close-button" style="cursor: pointer;" onmouseover="this.style.transform='scale(1.1) rotate(90deg)'; this.style.background='#a82e38';" onmouseout="this.style.transform=''; this.style.background='#c82333';">&times;</button>
                </div>
            </div>
            
            <div id="modal-content-scroll" style="margin-top: 5px; padding-top: 0px; margin-left: -20px; margin-right: -20px; padding-left: 20px; padding-right: 20px;">
            
                <div id="tts-controls-panel" style="margin-top: 10px; padding: 5px; border: 1px solid #3bad77ff; border-radius: 6px; background-color: #e6fff1; display: none;">

                    <div class="tts-slider-group">
                        <label for="backgroundVoice-volume">vol (0 à 0.03):</label>
                        <div class="tts-slider-container">
                            <input type="range" id="backgroundVoice-volume" min="0.0" max="0.03" step="0.001" value="${storedVolume}">
                        </div>
                        <span id="backgroundVoice-volume-value" class="tts-slider-value">${storedVolume}</span>
                    </div>
                    <div class="tts-slider-group">
                        <label for="backgroundVoice-rate">rate (0.5 à 2.0):</label>
                        <div class="tts-slider-container">
                            <input type="range" id="backgroundVoice-rate" min="0.5" max="2.0" step="0.1" value="${storedRate}">
                        </div>
                        <span id="backgroundVoice-rate-value" class="tts-slider-value">${storedRate}</span>
                    </div>
                    <div class="tts-slider-group">
                        <label for="backgroundVoice-pitch">pitch (0 à 2):</label>
                        <div class="tts-slider-container">
                            <input type="range" id="backgroundVoice-pitch" min="0.0" max="2.0" step="0.1" value="${storedPitch}">
                        </div>
                        <span id="backgroundVoice-pitch-value" class="tts-slider-value">${storedPitch}</span>
                    </div>

                </div>
                
                <div id="stt-container" style="margin-top: 5px; padding: 10px; padding-top: 0px; border: 1px solid #ccc; border-radius: 6px; background-color: #f9f9f9;">
                    <div style="display: block; margin-bottom: 1em; padding-top: 0px; margin-top: 5px; font-size: 0.9em; font-weight: bold;">${translate('speechRecognitionResult')}</div>
                    <div id="stt-result-display" style="margin-top: -5px; padding-top: 0px; min-height: 1.2em; color: #333; font-style: italic; white-space: pre-line;">
                        ${translate('statusReady')}
                    </div>
                    <span id="stt-interim-display" style="color: #888; font-style: italic;"></span>
                </div>


                <div id="stt-entity-panel" style="margin-top: 10px; padding: 10px; border: 1px solid #007bff; border-radius: 6px; background-color: #e6f7ff;">
                    <p style="margin-top: 0; font-weight: bold; color: #007bff;">
                        ✨ ${translate('accessByVoice')} 
                    </p>
                    <ul id="entity-list" style="list-style: none; padding: 0; margin: 0;">
                        </ul>
                </div>
                
                <div id="control-buttons-wrapper" style="display: flex; justify-content: space-between; gap: 10px; margin-top: 20px; margin-bottom: 10px;">
                    
                    <button id="record-voice-button" class="control-btn" style="background-color: #007bff; color: white; flex-grow: 1;">
                        <span style="font-size: 1.2em;">🎙️</span> 
                        <span>${translate('btnRecord')}</span>
                    </button>
                    
                    <button id="erase-and-record-voice-button" class="control-btn" style="background-color: #3bad77ff; color: white; flex-grow: 1;">
                        <span style="font-size: 1.2em; padding:0; margin-left=-10px">🗑️🎙️</span> 
                        <span style="padding:0; margin-left=-10px;">${translate('btnEraseRecord')}</span>
                    </button>

                    <button id="stop-voice-button" class="control-btn" style="display: none; background-color: #dc3545; color: white; flex-grow: 1;">
                        <span style="font-size: 1.5em;">🔴</span> 
                        <span>${translate('btnStopListening')}</span>
                    </button>
                </div>
            </div> `;

        // --- AJOUT DES ÉVÉNEMENTS JAVASCRIPT ---
        
        // 3. Affichage conditionnel du bouton ⚙️/↩️ (Point 3)
        // NOTE: 'state' doit être défini dans votre contexte global.
        const toggleTtsButtonWrapper = modal.querySelector('#toggle-tts-controls-wrapper');
        if (typeof state !== 'undefined' && state.isMobile) {
            toggleTtsButtonWrapper.style.display = 'block';
        }

        // 1. Gestion du basculement des contrôles TTS (avec les nouveaux emojis)
        const ttsPanel = modal.querySelector('#tts-controls-panel');
        const toggleTtsButton = modal.querySelector('#toggle-tts-controls');
        
        toggleTtsButton.addEventListener('click', () => {
            const isHidden = ttsPanel.style.display === 'none';
            ttsPanel.style.display = isHidden ? 'block' : 'none';
            
            // Remplacement de l'emoji et gestion de l'animation
            if (isHidden) {
                toggleTtsButton.innerHTML = '↩️';
                // Arrête la rotation lorsque les contrôles sont visibles
                toggleTtsButton.style.animation = 'none'; 
            } else {
                toggleTtsButton.innerHTML = '⚙️';
                // Redémarre la rotation lorsque les contrôles sont masqués
                toggleTtsButton.style.animation = 'spin 10s linear infinite'; 
            }
        });




        // 2. Gestion des Sliders (mise à jour des valeurs affichées)
        function updateTtsValueDisplay(e) {
            const valueId = `${e.target.id}-value`;
            const valueSpan = modal.querySelector(`#${valueId}`);
            if (valueSpan) {
                valueSpan.textContent = e.target.value;
            }
        }



        // Fonction gestionnaire des changements de paramètres TTS
        // Cette fonction arrête/redémarre la STT pour libérer la ressource audio, comme demandé.
        function handleTtsParameterChange(e) {

            // // 1. Annuler la TTS en cours (pour être sûr)

            window.speechSynthesis.cancel();
            window.speechSynthesis.cancel();


            // Mise à jour de l'affichage de la valeur (même si elle est déjà faite dans le code précédent)
            const valueId = `${e.target.id}-value`;
            const valueSpan = modal.querySelector(`#${valueId}`);
            if (valueSpan) {
                valueSpan.textContent = e.target.value;
            }

            if (state.isMobile && !isSpellingMode) {
                speakTextfromSliderParams(SUPER_LONG_TEXT);
            }


            
            // // 2. Arrêter l'écoute STT
            // arreterEcouteAction(); // Assurez-vous que cette fonction arrête l'écoute
            
            // // 3. Redémarrer l'écoute immédiatement après l'arrêt (pour reprendre la dictée)
            // // Redémarrer en mode 'continue' après un très court délai (pour s'assurer que l'arrêt est effectif)
            // setTimeout(() => {
            //     // Tente de relancer la reconnaissance vocale
            //     toggleSpeechRecognition('continue'); 
            // }, 50); // 50ms pour relâcher les ressources



            
        }

        // 2. Gestion des Sliders (Appel de la nouvelle fonction)
        modal.querySelector('#backgroundVoice-volume').addEventListener('input', handleTtsParameterChange);
        modal.querySelector('#backgroundVoice-rate').addEventListener('input', handleTtsParameterChange);
        modal.querySelector('#backgroundVoice-pitch').addEventListener('input', handleTtsParameterChange);


        // Événements STT
        modal.querySelector('#record-voice-button').addEventListener('click', () => toggleSpeechRecognition('continue') );
        modal.querySelector('#erase-and-record-voice-button').addEventListener('click', () => toggleSpeechRecognition('erase') );


        modal.querySelector('#stop-voice-button').addEventListener('click', arreterEcouteAction ); 
        
        // Fermeture
        modal.querySelector('#close-stt-button').addEventListener('click', hideUI);
        overlay.addEventListener('click', (e) => {
            if (e.target.id === overlayId) hideUI();
        });

        // Initialisation
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


    /**
     * Récupère les valeurs actuelles des sliders TTS dans la modale.
     * @returns {object|null} Un objet contenant {volume, rate, pitch} ou null si les éléments ne sont pas trouvés.
     */
    function getTtsParameters() {
        // Tente de récupérer les éléments des sliders par leur ID
        const volumeSlider = document.getElementById('backgroundVoice-volume');
        const rateSlider = document.getElementById('backgroundVoice-rate');
        const pitchSlider = document.getElementById('backgroundVoice-pitch');

        if (!volumeSlider || !rateSlider || !pitchSlider) {
            console.warn("Les sliders TTS n'ont pas été trouvés dans le DOM.");
            return null; // Retourne null si la modale n'est pas encore créée ou les IDs ont changé
        }

        // Récupère les valeurs et les convertit en nombres flottants
        const volume = parseFloat(volumeSlider.value);
        const rate = parseFloat(rateSlider.value);
        const pitch = parseFloat(pitchSlider.value);

        return {
            volume: volume,
            rate: rate,
            pitch: pitch
        };
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

        window.speechSynthesis.cancel(); 
        window.speechSynthesis.cancel(); 

        processFullTranscript(cumulativeTranscript, null, true)
        // } 
        
        // 2. Mise à jour de l'état et rafraîchissement de l'UI
        if (typeof updateCapturedEntity === 'function') {
            updateCapturedEntity(fieldName, selectedValue);
        }
    }




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
            capturedEntities[translate('firstname')] = '';
            capturedEntities[translate('lastname')] = '';
        }

        listElement.innerHTML = ''; 
        
        const actionKeywords = ['whoAreYou', 'whatIsYourName', 'whatIsYourNameBis', 'whoCreatedYou', 'whatisTheUse', 'search', 'research', 'readSheet', 'whenBorn', 'whenDead', 
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
                                min-height: 28px; 
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

        if (localConfig !== 'start') {
            // --- AJOUT DU LABEL SOUS LA LISTE ---
            const footerLabel = document.createElement('div');
            footerLabel.textContent = translate('possibleQuestions');
            footerLabel.style.cssText = `
                margin-top: 0px;
                margin-left : 40px;
                font-size: 0.85em;
                font-style: italic;
                color: #666;
                text-align: center;
                width: 100%;
            `;
            listElement.appendChild(footerLabel);
        }


    }



    function toggleSpeechRecognition(mode = 'continue', restart = '') {

        let config = localConfig;

        window.speechSynthesis.cancel(); 

        initializeSpeechRecognition(config);


        if (isRecording) {
            isRecording = false; 
            isSpellingMode = false;
            pendingSpellingStart = false; 
            clearTimeout(recognitionTimeout); 
            recognition.stop();
            window.speechSynthesis.cancel(); 
            window.speechSynthesis.cancel(); 

        } else {

            if(localConfig && localConfig === 'start') {
                console.log('\n\n\n ----- debug start showUI --------', document.getElementById('input-form-firstName').value, document.getElementById('input-form-lastName').value )
                if (document.getElementById('input-form-firstName').value != '') {
                    capturedEntities[translate('firstname')] = document.getElementById('input-form-firstName').value;
                    // console.log('\n\n\n ----- debug start showUI --------', document.getElementById('input-form-firstName').value )

                }
                if (document.getElementById('input-form-lastName').value != '') {
                    capturedEntities[translate('lastname')] = document.getElementById('input-form-lastName').value;
                    // console.log('\n\n\n ----- debug start showUI --------',  document.getElementById('input-form-lastName').value )
                }
                updateEntityUI();
                document.getElementById('stt-result-display').textContent = `🎤 ${translate('listeningInProgressStart')}`;
            } else {
                document.getElementById('stt-result-display').textContent = `🎤 ${translate('listeningInProgress')}`;

            }

            if (mode === 'erase') {
                // Efface toutes les entités capturées (utile pour le bouton "Tout effacer & Écouter")
                // entityKeys.forEach(key => {
                //      capturedEntities = [];
                //      cumulativeTranscript = '';
                // });
                entityKeys.forEach(key => {
                    // Utilise la même logique que celle définie dans updateEntityUI pour vider
                    if (typeof capturedEntities[translate(key)] === 'object' && capturedEntities[translate(key)] !== null) {
                        capturedEntities[translate(key)].value = 'not detected';
                        capturedEntities[translate(key)].alternatives = [];
                    } else {
                        capturedEntities[translate(key)] = 'not detected';
                    }
                    cumulativeTranscript = '';
                });

                capturedEntities[translate('firstname')] = '';
                capturedEntities[translate('lastname')] = '';
                if (localConfig != 'start') {
                    capturedEntities[translate('question')] = translate('whenBorn');
                }

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


            try {

                if (restart != 'restart') {
                    if (!isRecognitionActive) { recognition.start(); }
                } else {

                    clearTimeout(recognitionTimeout); 
                    recognition.stop();


                    setTimeout(() => {
                        if (!isRecognitionActive) { recognition.start(); }
                    }, 2000);

                }
                if (state.isMobile && !stopSpeechRecognition && !isSpellingMode) {
                // if (true) {
                    speakTextfromSliderParams(SUPER_LONG_TEXT);
                    // chanter();
                    // chanterFluide();
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
                if (state.isMobile) {
                    // window.speechSynthesis.cancel(); 
                }

            } catch (e) {
                console.error("Erreur au démarrage de la reconnaissance:", e);
                document.getElementById('stt-result-display').textContent = `${translate('errorStartingRecognition')}`;
                document.getElementById('stt-result-display').style.color = 'red';

                initializeSpeechRecognition(config);
                if (!isRecognitionActive) { recognition.start(); }
                if (state.isMobile) {
                    // speakText(SUPER_LONG_TEXT, 0.008, 0.7);
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
        
        for (const field in capturedEntitiesEnglish) {
            const value = capturedEntitiesEnglish[field].trim();
            
            // On ne retourne que les champs qui contiennent une valeur valide
            if (value && value !== 'not detected') {
                finalData[field] = value;
            }
        // console.log("--- getCapturedData DONNÉES FINALES CAPTURÉES ---", field, value);

        }
        return finalData;
    }



    function showUI(config = null) {


       
        ////////////////   A SUPPRIMER APRÈS TESTS  ///////////////////
        // state.isMobile = true;
        ////////////////   A SUPPRIMER APRÈS TESTS  ///////////////////


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

        arreterEcouteAction(); 

        if (overlay) {
            overlay.style.display = 'none';
        }
        if (isRecording && recognition) {
            isRecording = false;
            recognition.stop(); 

            window.speechSynthesis.cancel(); 

        }
        
        capturedEntities = entityKeys.reduce((acc, field) => {
            acc[field] = 'not detected';
            return acc;
        }, {});

        capturedEntities[translate('firstname')] = '';
        capturedEntities[translate('lastname')] = '';
        capturedEntities[translate('question')] = translate('whenBorn');




        window.speechSynthesis.cancel(); 


    }


    return {
        showUI: showUI,
        hideUI: hideUI,
        processTranscript: processFullTranscript, 
        getCapturedData: getCapturedData,
        getTtsParameters: getTtsParameters,
    };

})();





/**
 * Prononce le texte donné en utilisant la voix sélectionnée par l'utilisateur.
 * Intègre l'annulation des paroles précédentes pour éviter les conflits.
 * * @param {string} text - Le texte à prononcer.
 */
export function speakText(text, volume = 1.0, rate = 1.0, pitch = 1.0 ) {
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
        utterance.pitch = pitch;
        
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
 * Prononce le texte donné en utilisant la voix sélectionnée par l'utilisateur.
 * Intègre l'annulation des paroles précédentes pour éviter les conflits.
 * * @param {string} text - Le texte à prononcer.
 */
export function speakTextfromSliderParams(text) {
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
    
    const params = SpeechRecognitionUI.getTtsParameters();

    if (voiceToUse) {
        utterance.voice = voiceToUse;
        utterance.lang = voiceToUse.lang;
        utterance.volume = params.volume;
        utterance.rate = params.rate;
        utterance.pitch = params.pitch;
        
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
 * Génère des alternatives orthographiques basées sur des confusions phonétiques courantes.
 * Retourne une liste vide si aucune alternative n'est trouvée.
 * @param {string} word - Le mot transcrit (potentiellement erroné).
 * @returns {Array<string>} Une liste d'alternatives générées (ou une liste vide si aucune).
 */
export function generatePhoneticAlternatives(word) {
    
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
 * Prononce un texte en utilisant la voix sélectionnée et attend la fin de la prononciation.
 * @param {string} text - Le texte à prononcer.
 * @returns {Promise<void>} Une promesse qui se résout lorsque la prononciation est terminée.
 */
export function speakTextWithWaitToEnd(text, volume = null) {
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
        

        const params = SpeechRecognitionUI.getTtsParameters();



        console.log('\n\n -- voix speakTextWithWaitToEnd , params=', params, state.voice_volume, state.voice_rate, state.voice_pitch)


        if (voiceToUse) {
            utterance.voice = voiceToUse;
            utterance.lang = voiceToUse.lang;
            if (volume) { utterance.volume = volume; }
            else { utterance.volume = state.voice_volume;}
            utterance.rate = state.voice_rate;
            utterance.pitch = state.voice_pitch;



            window.speechSynthesis.speak(utterance);
        } else {
            const warning = "Pas de voix sélectionnée pour speakText. Résolution immédiate.";
            console.warn(warning);
            // Si l'on ne parle pas, on résout immédiatement la Promesse.
            resolve(); 
        }
    });
}





function chanter() {
    // On annule toute parole en cours
    window.speechSynthesis.cancel();

    // Découpage de la phrase pour créer du rythme et de la mélodie
    // text: le morceau à dire
    // pitch: la hauteur (0 = très grave, 1 = normal, 2 = très aigu)
    // rate: la vitesse (0.5 = lent, 1 = normal, 2 = rapide)

    // ASTUCE : On écrit les syllabes comme des vrais mots (homophones)
    // pour empêcher le navigateur d'épeler les lettres.
    // pitch : 0 (grave) à 2 (aigu)
    // rate : 0.5 (lent/note longue) à 2 (rapide/note courte)
    
    const partition = [
        // "Parler" -> Par - lé
        { text: "Par",     pitch: 0.8, rate: 0.9 }, 
        { text: "lé",      pitch: 1.1, rate: 0.9 }, // "lé" pour éviter L-E-R
        
        // "dans le micro"
        { text: "dans le", pitch: 1.0, rate: 1.3 }, // Rapide
        { text: "mi",      pitch: 1.3, rate: 1.0 }, 
        { text: "croc",    pitch: 0.7, rate: 0.6 }, // "croc" (mot valide) + note basse/longue
        
        // "par dessus cette voix"
        { text: "par",     pitch: 1.0, rate: 1.2 },
        { text: "de",      pitch: 1.2, rate: 1.2 },
        { text: "su",      pitch: 1.4, rate: 1.2 }, // "su" passe mieux que "ssus"
        { text: "cette",   pitch: 1.2, rate: 1.2 },
        { text: "voix",    pitch: 0.5, rate: 0.6 }, // Note très grave de fin de mesure

        // "votre voix est analysée"
        { text: "votre",   pitch: 1.0, rate: 1.1 },
        { text: "voix",    pitch: 1.0, rate: 1.1 },
        { text: "est",     pitch: 1.2, rate: 1.1 },
        { text: "a",       pitch: 1.3, rate: 1.3 },
        { text: "na",      pitch: 1.4, rate: 1.3 },
        { text: "li",      pitch: 1.6, rate: 1.3 }, // "li" au lieu de "ly"
        { text: "zé",      pitch: 1.8, rate: 0.7 }, // "zé" note haute et tenue
        
        // "et des mots clé sont détectés"
        { text: "et des",  pitch: 1.0, rate: 1.4 },
        { text: "mots",    pitch: 1.2, rate: 1.4 },
        { text: "clé",     pitch: 1.5, rate: 0.5 }, // Note tenue (Mise en valeur)
        { text: "sont",    pitch: 1.0, rate: 1.1 },
        { text: "dé",      pitch: 0.9, rate: 1.1 },
        { text: "tèque",   pitch: 0.7, rate: 1.1 }, // "tèque" pour bien prononcer le son K
        { text: "thé",     pitch: 0.4, rate: 0.5 }  // "thé" pour le son TÉ final + note grave
    ];


    let index = 0;

    function jouerNote() {


        const note = partition[index];
        const utterance = new SpeechSynthesisUtterance(note.text);
        
        // Réglages voix
        utterance.lang = 'fr-FR';
        utterance.pitch = note.pitch;
        utterance.rate = note.rate;
        utterance.volume = 1;

        // Sélection de la meilleure voix française disponible
        // On privilégie "Google français" qui est plus flexible sur le pitch
        const voices = window.speechSynthesis.getVoices();
        const bestVoice = voices.find(v => v.name.includes('Google') && v.lang.includes('fr')) 
                        || voices.find(v => v.lang === 'fr-FR');
        if (bestVoice) utterance.voice = bestVoice;

        // Affichage Karaoké

        // Enchaînement
        utterance.onend = function() {
            index++;
            jouerNote();
        };
        
        // Gestion d'erreur (si le navigateur bloque)
        utterance.onerror = function() {
            console.log("Erreur sur : " + note.text);
            index++;
            jouerNote();
        };

        window.speechSynthesis.speak(utterance);
    }


    jouerNote();

}



function chanterFluide() {
    window.speechSynthesis.cancel();
    
    const partition = [
        { text: "Par", pitch: 0.8, rate: 0.9, duree: 250 },
        { text: "lé", pitch: 1.1, rate: 0.9, duree: 250 },
        { text: "dansle", pitch: 1.0, rate: 1.3, duree: 300 }, // "dans le" collé
        { text: "mi", pitch: 1.3, rate: 1.0, duree: 150 },
        { text: "croc", pitch: 0.7, rate: 0.6, duree: 400 },
        { text: "par", pitch: 1.0, rate: 1.2, duree: 150 },
        { text: "dessu", pitch: 1.2, rate: 1.2, duree: 250 }, // "de"+"su" collés
        { text: "cette", pitch: 1.2, rate: 1.2, duree: 250 },
        { text: "voix", pitch: 0.5, rate: 0.6, duree: 400 },
        { text: "votre", pitch: 1.0, rate: 1.1, duree: 250 },
        { text: "voix", pitch: 1.0, rate: 1.1, duree: 250 },
        { text: "est", pitch: 1.2, rate: 1.1, duree: 150 },
        { text: "analy", pitch: 1.4, rate: 1.3, duree: 350 }, // "a"+"na"+"li" collés
        { text: "zée", pitch: 1.8, rate: 0.7, duree: 500 }, // "zé" allongé
        { text: "etdes", pitch: 1.0, rate: 1.4, duree: 200 }, // "et des" collés
        { text: "mots", pitch: 1.2, rate: 1.4, duree: 200 },
        { text: "clé", pitch: 1.5, rate: 0.5, duree: 600 },
        { text: "sont", pitch: 1.0, rate: 1.1, duree: 200 },
        { text: "détécté", pitch: 0.8, rate: 0.9, duree: 600 } // "dé"+"tèque"+"thé" collés
    ];
    
    const voix = window.speechSynthesis.getVoices().find(v => v.lang.includes('fr'));
    let index = 0;
    
    function jouerNote() {
        if (index >= partition.length) return;
        
        const note = partition[index];
        const utterance = new SpeechSynthesisUtterance(note.text);
        
        utterance.lang = 'fr-FR';
        utterance.pitch = note.pitch;
        utterance.rate = note.rate;
        utterance.volume = 0.2;
        if (voix) utterance.voice = voix;
        
        window.speechSynthesis.speak(utterance);
        index++;
        
        // TIMING ULTRA-RAPPROCHÉ : 30ms seulement entre les syllabes
        setTimeout(jouerNote, 30);
    }
    
    // Démarrer avec un petit délai pour initialisation
    setTimeout(jouerNote, 50);
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

export function closeVoiceCommand(config = null) {
    localConfig = config;
    SpeechRecognitionUI.hideUI();
}