// statsModal.js est importé dynamiquement dans appInitializer.js si on clique sur le bouton stats  📊
// donc pas de problème de lightHouse score au démarrage

import { state, calcFontSize } from './main.js';
import { nameCloudState , processNamesData} from './nameCloud.js';
// import { nameCloudState, processNamesData } from './main.js';
import { createTypeSelect, createScopeSelect, createStatsTypeSelect } from './nameCloudUI.js';
import { createFrequencyStatsModal, createStatsModal } from './nameCloudStatModal.js';
import { showCenturyStatsModal }  from './nameCloudCenturyModal.js';
import { ensureStatsExist } from './nameCloudAverageAge.js';
// import { setupSearchFieldModal, findPersonsBy } from './searchModalUI.js';
import { getSetupSearchFieldModal, getFindPersonsBy } from './main.js';
import { makeModalDraggableAndResizable, makeModalInteractive } from './resizableModalUtils.js';
import { closeAllModals, debounce, isModalVisible } from './eventHandlers.js';
import { fullResetAnimationState } from './treeAnimation.js';
// import { disableFortuneModeClean } from './treeWheelAnimation.js';
import { getDisableFortuneModeClean } from './main.js';


let lang = window.CURRENT_LANGUAGE;

const translations = {
    fr: {
        title: "Statistiques avancées",
        nameOption: "par Nom/Prénom",
        placeOption: "par Lieux", 
        occupationOption: "par Profession",
        
        searchPlaceholder: "🔍Tapez un mot de filtrage...",
        yearStartPlaceholder: "Année début",
        yearEndPlaceholder: "Année fin",
        searchButton: "GO",
        categoryLabel: "Catégorie",
        perimeterLabel: "Périmètre",
        statsTypeLabel: "Type de stats",
        dateFilterLabel: "filtrage<br>par dates",

        helpGlobal: "Statistiques globales",
        helpPerCentury: "Statistiques par siècle",

        helpSurname: " sur les prénoms",
        helpName: " sur les noms de famille",
        helpPlace: " sur les lieux de naissance, décès, mariage, résidence",
        helpOccupation: " sur les métiers, professions, titres",
        helpLifeSpan: " sur l'espérance de vie",
        helpProcreationAge: " sur l'age de procréation",
        helpFirstChildAge: " sur l'age au premier enfant",
        helpMarriageAge: " sur l'age de marriage",
        helpNbChildren: " sur le nombre d'enfant",
        noSearchTerm: "Veuillez saisir un terme de recherche",

        helpOption : "Optionnel avec ⚙️: ",
        helpFiltering : "Affiner les statistiques en filtrant avec un mot, les dates, et un périmètre",
        helpSelect: "Sélection actuelle: ",
        helpSelect1: "Stats sur ",
        helpSelect2: ", Mot de filtrage: ",
        helpSelect3: ", de ",
        helpSelect4: " à ",
        helpSelect5: ", Périmètre: ",
        helpSelect6: " de la racine: ",
        helpGO: "Appuyer sur GO pour lancer les Stats ",
        none : 'aucun',
        beforeJC : 'av. JC',
        today : 'aujourd\'hui',

        noResults: "Aucun résultat pour",
        rootPersonSearch: '🔍racine',
        person:'personne',
        found:'trouvée',
        withPlace: 'lieux',
        withOccupation: 'métiers',
        over: 'sur', 
        pers: 'pers.',
        m:'H',
        birthPlace: 'Lieu de naissance',
        deathPlace: 'Lieu de décès',
        residencePlace: 'Résidence',
        weddingPlace: 'Lieu de mariage',
        occupation: 'Profession',
        // clickMessage: "Cliquer sur une pers. dans la liste comme nouvelle racine de l\'arbre, ou cliquer 🌍 pour afficher la carte de chaleur",
        clickMessage: "Choisissez une nouvelle personne racine dans la liste ou cliquez 🌍 pour la carte de chaleur",
    },
    en: {
        title: "Advanced statistics",
        nameOption: "by Name/First name",
        placeOption: "by Places",
        occupationOption: "by Profession",
        searchPlaceholder: "🔍Type your search...",
        yearStartPlaceholder: "Start year",
        yearEndPlaceholder: "End year", 
        searchButton: "GO",
        categoryLabel: "Category",
        perimeterLabel: "Perimeter",
        statsTypeLabel: "Type of Stats",
        dateFilterLabel: "date<br>filtering",
        helpGlobal: "Global Statistics",
        helpPerCentury: "Statistics by Century",
        helpSurname: " on given names",
        helpName: " on surnames",
        helpPlace: " on places of birth, death, marriage, residence",
        helpOccupation: " on occupations, trades, titles",
        helpLifeSpan: " on life expectancy",
        helpProcreationAge: " on age at procreation",
        helpFirstChildAge: " on age at first child",
        helpMarriageAge: " on age at marriage",
        helpNbChildren: " on number of children",
        noSearchTerm: "Please enter a search term",
        helpOption : "Optional with ⚙️: ",
        helpFiltering : "Refine statistics by filtering with a word, dates, and a scope",
        helpSelect: "Current selection: ",
        helpSelect1: "Stats on ",
        helpSelect2: ", Filter word: ",
        helpSelect3: ", from ",
        helpSelect4: " to ",
        helpSelect5: ", Scope: ",
        helpSelect6: " from the root: ",
        helpGO: "Press GO to launch Stats ",
        none: 'none',
        beforeJC: 'b. Chr.',
        today: 'today',

        noResults: "No results for",
        rootPersonSearch: '🔍root',
        person: 'person',
        found: 'found',
        withPlace: 'with places',
        withOccupation: 'with occupations',
        over: 'over',
        pers: 'pers.',
        m: 'M',
        birthPlace: 'Birth place',
        deathPlace: 'Death place',
        residencePlace: 'Residence',
        weddingPlace: 'Wedding place',
        occupation: 'Occupation',
        // clickMessage: "Click on a person in the list to set as new tree root, or click 🌍 to show heatmap",
        clickMessage: "Choose a new root person in the list or click 🌍 for the heatmap",
    },
    es: {
        title: "Estadísticas avanzadas",
        nameOption: "por Nombre/Apellido",
        placeOption: "por Lugares",
        occupationOption: "por Profesión",
        searchPlaceholder: "🔍Escriba su búsqueda...",
        yearStartPlaceholder: "Año inicio",
        yearEndPlaceholder: "Año fin",
        searchButton: "GO",
        categoryLabel: "Categoría",
        perimeterLabel: "Perímetro",
        statsTypeLabel: "Tipo de estadísticas",
        dateFilterLabel: "filtrado<br>por fechas",
        helpGlobal: "Estadísticas globales",
        helpPerCentury: "Estadísticas por siglo",
        helpSurname: " sobre nombres de pila",
        helpName: " sobre apellidos",
        helpPlace: " sobre lugares de nacimiento, fallecimiento, matrimonio, residencia",
        helpOccupation: " sobre profesiones, oficios, títulos",
        helpLifeSpan: " sobre la esperanza de vida",
        helpProcreationAge: " sobre la edad de procreación",
        helpFirstChildAge: " sobre la edad al primer hijo",
        helpMarriageAge: " sobre la edad al matrimonio",
        helpNbChildren: " sobre el número de hijos",
        noSearchTerm: "Por favor ingrese un término de búsqueda",
        helpOption : "Opcional con ⚙️: ",
        helpFiltering : "Refinar las estadísticas filtrando con una palabra, fechas y un perímetro",
        helpSelect: "Selección actual: ",
        helpSelect1: "Estadísticas sobre ",
        helpSelect2: ", Palabra de filtro: ",
        helpSelect3: ", de ",
        helpSelect4: " a ",
        helpSelect5: ", Perímetro: ",
        helpSelect6: " desde la raíz: ",
        helpGO: "Pulse GO para lanzar las estadísticas ",
        none: 'ninguno',
        beforeJC: 'a. Chr.',
        today: 'hoy',


        noResults: "Sin resultados para",
        rootPersonSearch: '🔍raíz',
        person: 'persona',
        found: 'encontrada',
        withPlace: 'con lugares',
        withOccupation: 'con profesiones',
        over: 'de',
        pers: 'pers.',
        m: 'H',
        birthPlace: 'Lugar de nacimiento',
        deathPlace: 'Lugar de muerte',
        residencePlace: 'Residencia',
        weddingPlace: 'Lugar de boda',
        occupation: 'Profesión',
        // clickMessage: "Elige una persona como raíz o pulsa 🌍 para ver el mapa de calor",
        clickMessage: "Elige una persona raíz o pulsa 🌍 para el mapa de calor",
    },
    hu: {
        title: "Speciális statisztikák",
        nameOption: "Név/Keresztnév szerint",
        placeOption: "Helyek szerint",
        occupationOption: "Foglalkozás szerint",
        searchPlaceholder: "🔍Írja be a keresést...",
        yearStartPlaceholder: "Kezdő év",
        yearEndPlaceholder: "Befejező év",
        searchButton: "GO",
        categoryLabel: "Kategória",
        perimeterLabel: "Hatókör",
        statsTypeLabel: "Statisztika típusa",
        dateFilterLabel: "dátum<br>szűrés",
        helpGlobal: "Globális statisztikák",
        helpPerCentury: "Statisztikák évszázadonként",
        helpSurname: "Statisztikák a keresztnevekről",
        helpName: " a vezetéknevekről",
        helpPlace: " a születési, halálozási, házassági és lakóhelyi helyekről",
        helpOccupation: " a foglalkozásokról, mesterségekről, címekről",
        helpLifeSpan: " a várható élettartamról",
        helpProcreationAge: " a nemzés koráról",
        helpFirstChildAge: " az első gyermek születési koráról",
        helpMarriageAge: " a házasságkötés koráról",
        helpNbChildren: " a gyermekek számáról",
        noSearchTerm: "Kérjük, adjon meg egy keresési kifejezést",
        noResults: "Nincs találat a következőre:",
        helpOption : "Opcionális a ⚙️-gal: ",
        helpFiltering : "Statisztikák pontosítása szóval, dátumokkal és hatókörrel",
        helpSelect: "Jelenlegi kiválasztás: ",
        helpSelect1: "Statisztika erről: ",
        helpSelect2: ", Szűrőszó: ",
        helpSelect3: ", ettől: ",
        helpSelect4: " eddig: ",
        helpSelect5: ", Hatókör: ",
        helpSelect6: " a gyökértől: ",
        helpGO: "Nyomd meg a GO-t a statisztikák indításához ",
        none: 'nincs',
        beforeJC: 'i. előtt',
        today: 'ma',
        
        rootPersonSearch: '🔍gyökér',
        person: 'személy',
        found: 'találat',
        withPlace: 'helyekkel',
        withOccupation: 'foglalkozással',
        over: 'közül',
        pers: 'fő',
        m: 'F',
        birthPlace: 'Születési hely',
        deathPlace: 'Halálozási hely',
        residencePlace: 'Lakóhely',
        weddingPlace: 'Házasság helye',
        occupation: 'Foglalkozás',
        clickMessage: "Válasszon gyökérszemélyt vagy kattintson 🌍 a hőtérképhez",
    }
};



function moveDownStatsModal() {
    const statsModal = document.getElementById('stats-modal') ;
    // console.log('\n\n **** debug FullScreen= ',!(!document.fullscreenElement),  ',!FullScreen',(!document.fullscreenElement), ', state.isMobile=', state.isMobile, ', state.isTouchDevice=', state.isTouchDevice, statsModal, ', statsModal=', (statsModal!==null), (statsModal) ? statsModal.style.display : null )
    if (state.isMobile && state.isTouchDevice && !(!document.fullscreenElement) && window.innerWidth < 400) {
    // if (true) {
        statsModal.style.top = '50px';
    } else {
        statsModal.style.top = '0px';        
    }

}

/**
 * Crée et affiche la modale de recherche
 */
async function openStatsModal() {

    fullResetAnimationState();
    const disableFortuneModeClean = await getDisableFortuneModeClean();
    disableFortuneModeClean();


    // Vérifier si la modale existe déjà
    let existingModal = document.getElementById('stats-modal');
    if (existingModal) {
        existingModal.style.display = 'flex';
        // Vider les champs à la réouverture
        document.getElementById('statsModal-search-input').value = '';


        if (!state.deviceInfo.hasTouchScreen ||  !(state.deviceInfo.inputType === 'tactile')) {
            // si mobile phone, ne pas mettre le focus sur l'input pour éviter de voir apparaitre le clavier tactile dès le début
            document.getElementById('statsModal-search-input').focus();
        }

        const searchRoot = document.getElementById('statsModal-search-root');
        searchRoot.value = '🔍'+state.gedcomData.individuals[state.rootPersonId].name.replace(/\//g, '');
        makeModalInteractive(existingModal);  
        moveDownStatsModal();
        return;
    }

    // Créer la modale
    const modal = document.createElement('div');
    modal.id = 'stats-modal';
    modal.innerHTML = `
        <div class="statsModal-content">
            <div class="statsModal-header">
                <h3>${translations[lang].title}</h3>
                <button class="statsModal-close" onclick="closeStatsModal()">&times;</button>
            </div>
            
            <div class="statsModal-body">

                <div class="stats-type-section">
                    <div id="statsModal-search-type-container"></div>
                    <label id = "statsModal-search-type-label">${translations[lang].categoryLabel}</label>
                </div>

                <div class="stats-input-section">
                    <input type="text" id="statsModal-search-input" placeholder="${translations[lang].searchPlaceholder}" style="display: none;">
                    <button id="statsModal-search-button"> ${translations[lang].searchButton} </button>
                    <button id="statsModal-settings-button" >⚙️</button>
                    </div>

                <div class="date-filter-section" style="display: none;">
                    <input type="number" id="stats-date-start" placeholder="${translations[lang].yearStartPlaceholder}" min="1000" max="2100">
                    <span><label id="stats-date-label0">-</label></span>
                    <input type="number" id="stats-date-end" placeholder="${translations[lang].yearEndPlaceholder}" min="1000" max="2100">
                    <label id="stats-date-label">${translations[lang].dateFilterLabel}</label>
                </div>

                <div class="stats-searchRoot-section" style="display: none;">
                    <div id="statsModal-search-scope-container"></div>
                    <input type="text" id="statsModal-search-root" placeholder="">
                    <label id="stats-perimeter-label" >${translations[lang].perimeterLabel}</label>
                </div>

                <div class="stats-statsType-section" style="display: none;">
                    <div id="statsModal-statsType-container"></div>
                    <label id="stats-type-label" >${translations[lang].statsTypeLabel}</label>
                </div>

                <div class="stats-help">
                    <div id="stats-help-text">${translations[lang].helpName}</div>
                </div>
                
                <div class="stats-results" id="statsModal-search-results">
                    <!-- Les résultats apparaîtront ici -->
                </div>

            </div>
        </div>
    `;
    
    // Ajouter les styles CSS
    const styles = `
        <style>
        #stats-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            /* background: rgba(0, 0, 0, 0.3); */
            background: transparent !important;
            display: flex;
            justify-content: center;
            align-items: flex-start; 
            padding-top: 2px;
            z-index: 1099;
            pointer-events: none !important; 
        }
           
        .statsModal-content {
            background: white;
            border-radius: 8px;
            width: 90%;
            max-width: 600px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            max-height: calc(100vh - 5px) !important; /* Utiliser presque toute la hauteur */
            height: auto !important;
            pointer-events: all !important;
        }

        .statsModal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 3px;
            padding-bottom: 3px;
            padding-left: 40px;            
            padding-right: 8px;
            background: #438aee;
            color: white;
        }
        
        .statsModal-header h3 {
            margin: 0;
            font-size: ${calcFontSize(18)}px;
        }
        
        .statsModal-close {
            background: none;
            border: none;
            color: white;
            font-size: ${calcFontSize(30)}px;
            cursor: pointer;
            /* padding: 0; */
            padding = '2px 10px';
            width: 35px;
            height: 35px;
        }
        
        .statsModal-close:hover {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
        }
        
        .statsModal-body {
            padding: 7px;
            max-height: calc(100vh - 100px) !important; /* Ajuster selon la hauteur du header */
            overflow-y: auto !important;
        }

        .stats-type-section, .stats-input-section, .date-filter-section, .stats-searchRoot-section {
            margin-bottom: 4px;
        }
        
        .stats-type-section {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .stats-type-section label {
            font-weight: bold;
            color: #333;
            white-space: nowrap;
            font-size: ${calcFontSize(15)}px;
            margin-left: 1px;
        }   

        #statsModal-search-input {
            width: 180px;
            padding: 4px;
            border: 2px solid #ff9800;
            border-radius: 4px;
            font-size: ${calcFontSize(14)}px;
            box-sizing: border-box;
        }      

        #statsModal-search-type{
            margin-left: -10px;
        } 

        .stats-input-section {
            display: flex;
            gap: 10px;
        }
        
        .date-filter-section {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .date-filter-section label {
            font-weight: bold;
            color: #333;
            white-space: nowrap;
            font-size: ${calcFontSize(15)}px;
        }
        .stats-searchRoot-section label {
            font-weight: bold;
            color: #333;
            white-space: nowrap;
            font-size: ${calcFontSize(15)}px;
            margin-left: 6px;
        }

        .stats-statsType-section label {
            font-weight: bold;
            color: #333;
            white-space: nowrap;
            font-size: ${calcFontSize(15)}px;
            margin-left: 6px;
        }

        #stats-date-start, #stats-date-end {
            padding: 4px;
            border: 2px solid #ff9800;
            border-radius: 4px;
            font-size: ${calcFontSize(14)}px;
            box-sizing: border-box;
        }

        #stats-date-start {
            margin-left: 0px;
            margin-right: -4px;
            width: 91px;
        }

        #stats-date-end {
            margin-left: -6px;
            width: 74px;
        }

        #statsModal-search-button {
            font-size: ${calcFontSize(14)}px;
            padding: 4px 4px;
            background: #438aee;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            height: 28px !important;
            width: 50px !important;
        }
        
        #statsModal-search-button:hover {
            background: #f57c00;
        }
        
        .stats-help {
            background: #f5f5f5ff;
            padding: 8px 4px;
            border-radius: 4px;
            margin-bottom: 4px;
            font-size: ${calcFontSize(15)}px; !important
            color: #000;
        }


        .stats-results {
            overflow-y: auto;
            max-height: calc(100vh - 5px) !important; /* Utiliser presque toute la hauteur */
            height: auto !important;
        }
        
        .result-item {
            padding: 8px 10px;
            margin: 4px 0;
            background: rgba(255, 152, 0, 0.1);
            border-left: 3px solid #ff9800;
            border-radius: 3px;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        
        .result-item:hover {
            background: rgba(255, 152, 0, 0.2);
        }
        
        .result-name {
            font-weight: bold;
            color: #333;
            margin-bottom: 3px;
            font-size: ${calcFontSize(14)}px;
        }
        
        .result-info {
            font-size: ${calcFontSize(11)}px;
            color: #666;
        }
        
        .result-match {
            display: inline-block;
            background: #ff9800;
            color: white;
            padding: 2px 6px;
            border-radius: 3px;
            margin-right: 8px;
            font-size: ${calcFontSize(11)}px;
        }

        .stats-searchRoot-section {
            display: flex !important;
            gap: 5px !important;
            align-items: center !important;
        }
        #statsModal-search-root {
            background: #f9c77cff;
            width: 100px;

            padding: 2px;
            border: 2px solid #db8401ff;
            border-radius: 4px;
            font-size: ${calcFontSize(14)}px;
            box-sizing: border-box;


        }

        .stats-statsType-section {
            display: flex !important;
            gap: 5px !important;
            align-items: center !important;
        }



        /* Styles pour mobile en mode paysage */
        @media screen and (max-height: 500px)  {
            
            .statsModal-header h3 {
                font-size: ${calcFontSize(16)}px !important; /* Réduire la taille du titre */
                margin: 0 !important;
            }
            
            .statsModal-body {
                padding: 5px 10px !important; /* Réduire de 20px à 10px */
                max-height: calc(100vh - 60px) !important; /* Ajuster selon la hauteur du header */
            }

            .statsModal-content {
                width: 100% !important; /* Utiliser plus de largeur */
                max-width: 700px !important; /* Augmenter la largeur max */
            }            

            .stats-type-section, 
            .stats-input-section, 
            .date-filter-section {
                margin-bottom: 4px !important; /* Réduire de 15px à 8px */
            }
            
            .stats-help {
                padding: 6px 4px !important; /* Réduire de 8px à 5px */
                margin-bottom: 4px !important; /* Réduire de 15px à 8px */
                font-size: ${calcFontSize(14)}px !important;
            }



            /* Réorganisation en mode paysage mobile */

            .stats-type-section {
                display: none !important; /* Cacher la ligne originale du sélecteur */
            }
            
            .stats-input-section {
                display: flex !important;
                gap: 5px !important;
                align-items: center !important;
            }
            
            #statsModal-search-type {
                order: 1;
                width: 180px !important;
                position: relative !important;
                margin-left: 0px !important;
            }
            
            #statsModal-search-button {
                order: 2;
                width: 50px !important;
                height: 28px !important;
                font-size: ${calcFontSize(13)}px !important;
            }

            #statsModal-settings-button {
                order: 3;
            }

            #statsModal-search-input {
                order: 4;
                width: 180px !important;
                margin-left: 0px !important;
            }

            #statsModal-search-type-label {
                order: 5;
                font-weight: bold;
                color: #333;
                white-space: nowrap;
                font-size: ${calcFontSize(15)}px;
                margin-left: 1px;
            }
        }
        </style>
    `;
    

    // Ajouter les styles au document
    if (!document.getElementById('statsModal-styles')) {
        const styleElement = document.createElement('div');
        styleElement.id = 'statsModal-styles';
        styleElement.innerHTML = styles;
        document.head.appendChild(styleElement);
    }
    
    const extraStyle = document.createElement('style');
    extraStyle.textContent = `
        #statsModal-settings-button {
            background: #f9efdfff;
            border: 1px solid #ccc;
            border-radius: 4px;
            cursor: pointer;
            font-size: ${calcFontSize(20)}px;
            padding: 0px 0px;
        }
        #statsModal-settings-button:hover {
            background: #e0e0e0;
        }
    `;
    document.head.appendChild(extraStyle);

    // Ajouter la modale au document
    document.body.appendChild(modal);

    // Cibler le vrai conteneur draggable/redimensionnable
    const content = modal.querySelector('.statsModal-content');
    const header = modal.querySelector('.statsModal-header');
    // Rendre la modale déplaçable et redimensionnable
    makeModalDraggableAndResizable(content, header, false);

    // Configurer les événements
    setupModalEvents();

    makeModalInteractive(modal);     
    
    moveDownStatsModal();
   
    if (!state.deviceInfo.hasTouchScreen ||  !(state.deviceInfo.inputType === 'tactile')) {
        // si mobile phone, ne pas mettre le focus sur l'input pour éviter de voir apparaitre le clavier tactile dès le début
        //Donner le focus au champ de recherche
        setTimeout(() => {
            document.getElementById('statsModal-search-input').focus();
        }, 100);
    }

    updatehelpText();
}


function updatehelpText() {
    // Textes d'aide selon le type de recherche

    const helpTextsStatsType = {
        'global': translations[lang].helpGlobal,
        'perCentury':translations[lang].helpPerCentury
    };

    const helpTextsCategory = {
        'noms': translations[lang].helpName,
        'prenoms': translations[lang].helpSurname,
        'lieux': translations[lang].helpPlace,
        'professions': translations[lang].helpOccupation,
        'duree_vie' : translations[lang].helpLifeSpan,
        'age_procreation' : translations[lang].helpProcreationAge,
        'age_first_child' : translations[lang].helpFirstChildAge,
        'age_marriage' : translations[lang].helpMarriageAge,
        'nombre_enfants' : translations[lang].helpNbChildren
    };
    
    // Changer le texte d'aide selon le type sélectionné
    const helpText = document.getElementById('stats-help-text');
    const searchTypeSelect = document.querySelector('#statsModal-search-type select');
    const selectedTypeOption = searchTypeSelect.options[searchTypeSelect.selectedIndex];
    const searchTerm = document.getElementById('statsModal-search-input').value.trim();
    const searchType = document.getElementById('statsModal-search-type');
    const searchScope = document.getElementById('statsModal-search-scope');
    const searchScopeSelect = document.querySelector('#statsModal-search-scope select');
    const selectedScopeOption = searchScopeSelect.options[searchScopeSelect.selectedIndex];
    const statsType = document.getElementById('statsModal-StatsType');   
    const startYear = document.getElementById('stats-date-start').value;
    const endYear = document.getElementById('stats-date-end').value;
    let textEnd = '';
    if (searchScope.value != 'all') {
        textEnd = translations[lang].helpSelect6 + ' <span style="color:red;"><b>' + state.gedcomData.individuals[state.rootPersonId].name.replace(/\//g, '') + '</b></span>'
    }
    let searchTermText = translations[lang].none; //'none';
    if (searchTerm) { searchTermText = searchTerm ; }
    let startYearText = translations[lang].beforeJC; //'av. JC';
    if (startYear) { startYearText = startYear; }
    let endYearText = translations[lang].today; // "aujourd'hui";
    if (endYear) { endYearText = endYear; }

    helpText.innerHTML = 
        helpTextsStatsType[statsType.value] +
        helpTextsCategory[searchType.value] + '<br>' +
        '<span style="color:blue;">' + 
        '<br><b>' + translations[lang].helpOption + '</b>' +
        translations[lang].helpFiltering + '</span>' + '<br>' +
        '<br><b>' + translations[lang].helpSelect + '</b>' +
        translations[lang].helpSelect1 + ' <span style="color:red;"><b>' + selectedTypeOption.text + '</b></span>' +
        translations[lang].helpSelect2 + ' <span style="color:red;"><b>' + searchTermText + '</b></span>' +
        translations[lang].helpSelect3 + ' <span style="color:red;"><b>' + startYearText + '</b></span>' +
        translations[lang].helpSelect4 + ' <span style="color:red;"><b>' + endYearText + '</b></span>' +
        translations[lang].helpSelect5 + ' <span style="color:red;"><b>' + selectedScopeOption.text + '</b></span>' + textEnd +
        '<span style="color:blue;">' + '<br><br><b>' + translations[lang].helpGO  +'</b></span>';          

    // Vider le champ de recherche quand on change de type
    document.getElementById('statsModal-search-input').value = '';
    document.getElementById('statsModal-search-results').innerHTML = '';
}

/**
 * Configure les événements de la modale
 */
function setupModalEvents() {
    const colors = {
            main: '#ff9800',
            options: '#ff9800',
            hover: '#f57c00',
            selected: '#e65100'
        }

    const customSelector = createTypeSelect('noms', true, 180,1); //, colors);
    const customScopeSelector = createScopeSelect('all', true,  180,1); //, colors);
    const customStatsTypeSelector = createStatsTypeSelect('all', true, 180,1); // colors);
    //  const typeValues = ['all', 'directAncestors', 'ancestors', 'directDescendants', 'descendants'];

    // Ajouter l'ID pour la fonction moveSelector
    customSelector.id = 'statsModal-search-type';
    customScopeSelector.id = 'statsModal-search-scope';
    customStatsTypeSelector.id = 'statsModal-StatsType';

    // L'insérer dans le conteneur
    document.getElementById('statsModal-search-type-container').appendChild(customSelector);
    document.getElementById('statsModal-search-scope-container').appendChild(customScopeSelector);
    document.getElementById('statsModal-statsType-container').appendChild(customStatsTypeSelector);

    const searchType = document.getElementById('statsModal-search-type');
    const searchScope = document.getElementById('statsModal-search-scope');  
    const statsType = document.getElementById('statsModal-StatsType');   
    const searchInput = document.getElementById('statsModal-search-input');
    const searchButton = document.getElementById('statsModal-search-button');
    const startYear = document.getElementById('stats-date-start');
    const endYear = document.getElementById('stats-date-end');
    const dateLabel = document.getElementById('stats-date-label');
    const dateLabel0 = document.getElementById('stats-date-label0');

    const modal =document.getElementById('stats-modal'); 
    // Gestion du bouton ⚙️ pour afficher/masquer le filtre par date
    const settingsButton = modal.querySelector('#statsModal-settings-button');
    const dateSection = modal.querySelector('.date-filter-section');
    const searchRootSection = modal.querySelector('.stats-searchRoot-section');
    const statsTypeSection = modal.querySelector('.stats-statsType-section');
    const statsHelp = modal.querySelector('.stats-help');

    dateSection.style.display = 'none';
    searchInput.style.display = 'none';        
     
    statsTypeSection.style.visibility  = 'hidden';
    searchRootSection.style.visibility = 'hidden';   
    const searchRoot = document.getElementById('statsModal-search-root');

    statsHelp.style.marginTop = '-50px';

    settingsButton.addEventListener('click', () => {
        const visible = dateSection.style.display !== 'none';
        dateSection.style.display = visible ? 'none' : 'flex';
        searchInput.style.display = visible ? 'none' : 'flex';        

        statsTypeSection.style.visibility = visible ? 'hidden' : 'visible';        
        searchRootSection.style.visibility = visible ? 'hidden' : 'visible';   

        if (visible) { searchRoot.style.display =  'none'; }
        else if (searchScope.value != 'all') {
            searchRoot.value = '🔍'+state.gedcomData.individuals[state.rootPersonId].name.replace(/\//g, '');
            searchRoot.style.display =  'flex';
        } else {
            searchRoot.style.display =  'none';
        }
        if (!visible) {statsHelp.style.marginTop = '5px';}
        else  {statsHelp.style.marginTop = '-50px';}
    });

    
    // Changer le texte d'aide selon le type sélectionné

    searchType.addEventListener('change', function() {
        updatehelpText();
    });


    // Changer le texte d'aide selon le type sélectionné
    searchScope.addEventListener('change', function() {
        if (searchScope.value != 'all') {
            searchRoot.style.display =  'flex';
            searchRoot.value = '🔍'+state.gedcomData.individuals[state.rootPersonId].name.replace(/\//g, '');

        } else {
            searchRoot.style.display =  'none';
        }
        updatehelpText();
    });


    // Changer le texte d'aide selon le type sélectionné
    statsType.addEventListener('change', function() {

        if (statsType.value === 'perCentury') {
            searchInput.style.display = 'none';
            startYear.style.display = 'none';
            endYear.style.display = 'none';
            dateLabel.style.display = 'none';
            dateLabel0.style.display = 'none';
        } else {
            searchInput.style.display = 'flex';
            startYear.style.display = 'flex';
            endYear.style.display = 'flex';
            dateLabel.style.display = 'flex';
            dateLabel0.style.display = 'flex';
        }
        updatehelpText();
    });


    // Recherche en appuyant sur Entrée dans le champ de recherche
    searchRoot.addEventListener('focus', function(event) {
        const setupSearchFieldModal = getSetupSearchFieldModal();
        setupSearchFieldModal(true);

        setTimeout(() => {
            searchRoot.value = '🔍'+state.gedcomData.individuals[state.rootPersonId].name.replace(/\//g, '');
        }, 200);

        updatehelpText();
    });



    // Recherche en appuyant sur Entrée dans le champ de recherche
    searchInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            performModalSearch();
        }
    });
    
    // Recherche en appuyant sur Entrée dans les champs de dates
    document.getElementById('stats-date-start').addEventListener('keyup', function(event) {
        updatehelpText();
        if (event.key === 'Enter') {
            updatehelpText();
            performModalSearch();
        }
    });
    
    document.getElementById('stats-date-end').addEventListener('keyup', function(event) {
        updatehelpText();
        if (event.key === 'Enter') {
            updatehelpText();
            performModalSearch();
        }
    });
    
    // Recherche en cliquant sur le bouton
    searchButton.addEventListener('click', performModalSearch);
    
    // // Fermer la modale en cliquant à l'extérieur
    // document.getElementById('stats-modal').addEventListener('click', function(event) {
    //     if (event.target === this) {
    //         closeStatsModal();
    //     }
    // });



    function moveSelector() {
        const selector = document.getElementById('statsModal-search-type');
        const selectorLabel = document.getElementById('statsModal-search-type-label');
        const typeSection = document.querySelector('.stats-type-section');
        const inputSection = document.querySelector('.stats-input-section');
        
        if (typeSection && inputSection)  {
        // voir la réorganisation dans le css avec des numéros d'ordre pour la /* Réorganisation en mode paysage mobile */
            if (window.innerHeight < 500) {
                // Hauteur faible (mode paysage) : déplacer le sélecteur
                inputSection.appendChild(selector);
                inputSection.appendChild(selectorLabel);
                typeSection.style.display = 'none';
            } else {
                // Hauteur normale (mode portrait) : remettre le sélecteur
                typeSection.appendChild(selector);
                typeSection.appendChild(selectorLabel);
                typeSection.style.display = 'flex';
            }
        }

    }

    // Appliquer au chargement
    moveSelector();

    // Appliquer au redimensionnement
    window.addEventListener('resize', debounce(() => {
        if(isModalVisible(modal.id)) {
            console.log('\n\n*** debug resize in openStatModal in statsModalUI for moveSelector \n\n'); 
            moveSelector();
        }
    }, 150));



    // // Gestion spéciale pour les champs de dates en mode paysage mobile
    // const inputs = [document.getElementById('statsModal-search-input'), document.getElementById('stats-date-start'), document.getElementById('stats-date-end')];
    // const modal = document.getElementById('stats-modal');

    // inputs.forEach(input => {
    //     input.addEventListener('focus', function() {
    //         // Détection mobile paysage
    //         if (window.innerHeight <= 600) {
    //             modal.style.paddingTop = '5px';
    //             modal.style.alignItems = 'flex-start';
                
    //             // Faire défiler vers le haut
    //             setTimeout(() => {
    //                 this.scrollIntoView({ 
    //                     behavior: 'smooth', 
    //                     block: 'start' 
    //                 });
    //             }, 300);
    //         }
    //     });
        
    //     input.addEventListener('blur', function() {
    //         // Restaurer la position normale après un délai
    //         setTimeout(() => {
    //             if (window.innerHeight < 500) {
    //                 modal.style.paddingTop = '5px';
    //             }
    //         }, 300);
    //     });
    // });

    
}

/**
 * Effectue la recherche dans la modale
 */
async function performModalSearch() {
    const searchType = document.getElementById('statsModal-search-type').value;
    const searchScope = document.getElementById('statsModal-search-scope').value;
    const statsType = document.getElementById('statsModal-StatsType').value;   
    const searchTerm = document.getElementById('statsModal-search-input').value.trim();
    const startYear = document.getElementById('stats-date-start').value;
    const endYear = document.getElementById('stats-date-end').value;
    const resultsContainer = document.getElementById('statsModal-search-results');
    
    
    // Convertir les années en nombres ou null
    const startYearNum = startYear ? parseInt(startYear) : null;
    const endYearNum = endYear ? parseInt(endYear) : null;
    
    // Effectuer la recherche avec filtrage par dates

    let res = null;
    let results;

    const config = {
        type: searchType, //state.treeMode,
        startDate: (startYearNum) ? startYearNum : -6000,
        endDate: (endYearNum) ? endYearNum : 3000,
        scope: searchScope,
        rootPersonId:  state.rootPersonId, //state.rootPersonId//scopeSelect.value !== 'all' ? finalRootPersonSelect.value : null
    };

    const nameData = processNamesData(config, searchTerm, true);

    const findPersonsBy = await getFindPersonsBy();
    const personList = findPersonsBy(searchTerm, config, searchTerm);
    // Stocker les résultats pour la heatmap
    window.currentSearchResults = personList.results;

    if (nameData.length >0) {

        nameCloudState.currentNameData = nameData; // Sauvegarder les données du nuage
        nameCloudState.currentConfig = { ...config };

        if (statsType === 'global') {
            if (searchType === 'noms' || searchType === 'prenoms' || searchType === 'lieux' || searchType === 'professions' ) {
                new createFrequencyStatsModal(nameData, searchType, nameCloudState.currentConfig, searchTerm);
                results = [];
            } else if (searchType === 'duree_vie' || searchType === 'age_procreation' || searchType === 'age_first_child' || searchType === 'age_marriage' || searchType === 'nombre_enfants' ) {
                ensureStatsExist(nameData);
                new createFrequencyStatsModal(nameData, searchType, nameCloudState.currentConfig, searchTerm);
                createStatsModal(nameData, searchType, state.frequencyStatsModalCounter -1);
                results = [];
            } 
        } else {
            showCenturyStatsModal(searchType);
        }




    } else {
        console.log(' - no nameData found after processNamesData with searchTerm=', searchTerm);
        let resultsHTML = '';
        resultsContainer.innerHTML = resultsHTML;
        const dateInfo = (startYearNum || endYearNum) ? 
            ` (période: ${startYearNum || '?'}-${endYearNum || '?'})` : '';
        resultsContainer.innerHTML = `<div style="text-align: center; color: #666; padding: 10px;">${translations[lang].noResults} "${searchTerm}"${dateInfo}</div>`;
    }

}


/**
 * Ferme la modale de recherche
 */
window.closeStatsModal = function() {
    const modal = document.getElementById('stats-modal');
    if (modal) {
        const content = modal.querySelector('.statsModal-content'); 
        if (content) {
            if (content._cleanupDraggable) content._cleanupDraggable();
        }

        modal.style.display = 'none';
    }
    closeAllModals();
};

/**
 * Modifier la fonction d'événement du champ de recherche existant
 */
export function statsModal() {
        openStatsModal();       
}
