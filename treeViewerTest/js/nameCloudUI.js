// nameCloudUI.js est importé dynamiquement dans main.js si on clique sur le bouton loadDataButton "Entrez"
// donc pas de problème de lightHouse score au démarrage
import { state, showAndRestoreTreeButtons, displayGenealogicTree, updateRadarButtonText, redimensionnerRootSelectorSizeInDOM } from './main.js';
import { NameCloud } from './nameCloudRenderer.js';
import { nameCloudState } from './nameCloud.js';
// import { nameCloudState } from './main.js';
// import { createSettingsModal } from './nameCloudSettings.js';
import { getCreateSettingsModal } from './main.js';
import { createDateInput } from './dateUI.js';
import { createCustomSelector, createOptionsFromLists } from './UIutils.js';
import { ensureStatsExist, updateStatsButtons, removeAllStatsElements } from './nameCloudAverageAge.js';
// import { createImprovedHeatmap  } from './geoHeatMapUI.js';
import { getCreateImprovedHeatmap  } from './main.js';
// import { createDataForHeatMap, refreshHeatmap  } from './geoHeatMapDataProcessor.js';
import { getCreateDataForHeatMap, getRefreshHeatmap  } from './main.js';
import { showHamburgerButtonForcefully, resetHamburgerButtonPosition } from './hamburgerMenu.js';
import { buttonsOnDisplay } from './mainUI.js';
import { enableBackground } from './backgroundManager.js';
// import { enableFortuneMode } from './treeWheelAnimation.js';
import { getEnableFortuneMode } from './main.js';
import { closeAllModals, debounce } from './eventHandlers.js';
import { fullResetAnimationState } from './treeAnimation.js';
import { processNamesCloudWithDate } from './nameCloud.js';

// Fonction pour obtenir les traductions selon la langue actuelle
export function getTranslation(key) {
    const translations = {
      'fr': {
        'titlePrenoms': 'Prénoms',
        'titleNoms': 'Noms',
        'titleMetiers': 'Métiers',
        'titleLieux': 'Lieux',
        'titleDureeVie': 'Durées de vie',
        'titleAgeProcreation': 'Ages de procré.',
        'titleAgeMariage': 'Ages de mariage', 
        'titleAgePremierEnfant': 'Ages au 1er enfant',
        'titleNombreEnfants': 'Nombres d\'enfants',
        'entre': 'entre',
        'et': 'et',
        'motPlaces': 'mots placés',
        'début': 'début',
        'fin': 'fin',

        'optionPrenom': 'Prénom',
        'optionNom': 'Nom',
        'optionMetier': 'Métier',
        'optionLieux': 'Lieux',
        'optionVie': 'Vie',
        'optionProcreat': 'Procréat',
        'option1erEnf': '1er Enf.',
        'optionMariage': 'Mariage',
        'optionNbEnf': 'Nb Enf.',


        'optionTout': 'Tout',
        'optionAscDir': 'Asc dir.',
        'optionAscend': 'Ascend',
        'optionDescDir': 'Desc dir',
        'optionDescend': 'Descend',

        'optionGlobal': 'Statistiques Globales', 
        'optionPerCentury': 'Statistiques par siècle', 

        'expandedOptionPrenoms': 'Prénoms',
        'expandedOptionNoms': 'Noms de famille',
        'expandedOptionMetiers': 'Métiers',
        'expandedOptionLieux': 'Lieux',
        'expandedOptionVie': 'Durée de Vie',
        'expandedOptionProcreat': 'Ages de procréation',
        'expandedOption1erEnf': 'Age au 1er enfant',
        'expandedOptionMariage': 'Age de Mariage',
        'expandedOptionNbEnf': 'Nombre d\'enfants',
        'expandedOptionTout': 'Tout le fichier',
        'expandedOptionAscDir': 'Ascendants directs       de la racine',
        'expandedOptionAscend': 'Ascendants + fratrie     de la racine',
        'expandedOptionDescDir': 'Descendants directs     de la racine',
        'expandedOptionDescend': 'Descend. + conjoints     de la racine',

        'expandedOptionGlobal': 'Statistiques Globales', 
        'expandedOptionPerCentury': 'Statistiques par siècle', 

        'labelPersonneRacine': 'Personne racine',
        'searchPlaceholder': 'search racine',
        'searchButtonText': '🔍',
        'selectDefaultOption': '...    select',
        'alertNoPerson': 'Aucune personne trouvée',
        'titleSettings': 'Paramètres',
        'titleMap': 'Afficher la heatmap',
        'buttonValidate': 'Valider',
        'loadingHeatmap': 'Génération de la heatmap...',
        'noGeoData': 'Aucune donnée géographique disponible pour les personnes sélectionnées.',
        'errorHeatmap': 'Erreur lors de la génération de la heatmap',
        'heatmapTitleTous': 'Tous',
        'heatmapTitleAscend': 'Ancêtres',
        'heatmapTitleDescend': 'Descendants',
        'mapGeneration': 'Génération de la heatmap...'
      },
      'en': {
        'titlePrenoms': 'First Names',
        'titleNoms': 'Last Names',
        'titleMetiers': 'Occupations',
        'titleLieux': 'Places',
        'titleDureeVie': 'Lifespans',
        'titleAgeProcreation': 'Ages of procreation',
        'titleAgeMariage': 'Ages at marriage',
        'titleAgePremierEnfant': 'Ages at first child',
        'titleNombreEnfants': 'Number of children',
        'entre': 'between',
        'et': 'and',
        'motPlaces': 'words placed',
        'début': 'start',
        'fin': 'end',

        'optionPrenom': 'FirstNam',
        'optionNom': 'Name',
        'optionMetier': 'Occup.',
        'optionLieux': 'Places',
        'optionVie': 'Life',
        'optionProcreat': 'Procreat.',
        'option1erEnf': '1stChild',
        'optionMariage': 'Marriage',
        'optionNbEnf': 'NbChild',

        'optionTout': 'All',
        'optionAscDir': 'dir. Anc',
        'optionAscend': 'Ancest.',
        'optionDescDir': 'dir Desc',
        'optionDescend': 'Descend',

        'optionGlobal': 'Global Statistics',
        'optionPerCentury': 'Statistics by Century',

        'expandedOptionPrenoms': 'First Names',
        'expandedOptionNoms': 'Last Names',
        'expandedOptionMetiers': 'Occupations',
        'expandedOptionLieux': 'Places',
        'expandedOptionVie': 'Lifespan',
        'expandedOptionProcreat': 'Ages of procreation',
        'expandedOption1erEnf': 'Age at first child',
        'expandedOptionMariage': 'Age at marriage',
        'expandedOptionNbEnf': 'Number of children',
        'expandedOptionTout': 'All file',
        'expandedOptionAscDir': 'Direct ancestors         of root',
        'expandedOptionAscend': 'Ancestors + siblings     of root',
        'expandedOptionDescDir': 'Direct descendants       of root',
        'expandedOptionDescend': 'Descendts. + spouses       of root',

        'expandedOptionGlobal': 'Global Statistics',
        'expandedOptionPerCentury': 'Statistics by Century',

        'labelPersonneRacine': 'Root person',
        'searchPlaceholder': 'search root',
        'searchButtonText': '🔍',
        'selectDefaultOption': '...    select',
        'alertNoPerson': 'No person found',
        'titleSettings': 'Settings',
        'titleMap': 'Show heatmap',
        'buttonValidate': 'Validate',
        'loadingHeatmap': 'Generating heatmap...',
        'noGeoData': 'No geographic data available for selected people.',
        'errorHeatmap': 'Error generating heatmap',
        'heatmapTitleTous': 'All',
        'heatmapTitleAscend': 'Ancestors',
        'heatmapTitleDescend': 'Descendants',
        'mapGeneration': 'Generating heatmap...'
      },
      'es': {
        'titlePrenoms': 'Nombres',
        'titleNoms': 'Apellidos',
        'titleMetiers': 'Profesiones',
        'titleLieux': 'Lugares',
        'titleDureeVie': 'Duración de vida',
        'titleAgeProcreation': 'Edades de procreación',
        'titleAgeMariage': 'Edades de matrimonio',
        'titleAgePremierEnfant': 'Edades del primer hijo',
        'titleNombreEnfants': 'Número de hijos',
        'entre': 'entre',
        'et': 'y',
        'motPlaces': 'palabras colocadas',
        'début': 'inicio',
        'fin': 'fin',

        'optionPrenom': 'Nombre',
        'optionNom': 'Apellido',
        'optionMetier': 'Profesión',
        'optionLieux': 'Lugares',
        'optionVie': 'Vida',
        'optionProcreat': 'Procreac.',
        'option1erEnf': '1erHijo',

        'optionMariage': 'Matrimonio',
        'optionNbEnf': 'NºHijos',
        'optionTout': 'Todo',
        'optionAscDir': 'Asc. dir',
        'optionAscend': 'Ascend.',
        'optionDescDir': 'Desc dir',
        'optionDescend': 'Descend',

        'optionGlobal': 'Estadísticas Globales',
        'optionPerCentury': 'Estadísticas por Siglo',

        'expandedOptionPrenoms': 'Nombres',
        'expandedOptionNoms': 'Apellidos',
        'expandedOptionMetiers': 'Profesiones',
        'expandedOptionLieux': 'Lugares',
        'expandedOptionVie': 'Duración de vida',
        'expandedOptionProcreat': 'Edades de procreació',
        'expandedOption1erEnf':   'Edad del primer hijo',
        'expandedOptionMariage': 'Edad de matrimonio',
        'expandedOptionNbEnf': 'Número de hijos',
        'expandedOptionTout': 'Todo el archivo',

        'expandedOptionAscDir': 'Ascendient. directos        de la raíz',
        'expandedOptionAscend': 'Ascend. + hermanos       de la raíz',
        'expandedOptionDescDir': 'Descendient. directos       de la raíz',
        'expandedOptionDescend': 'Descend. + cónyuges       de la raíz',



        'expandedOptionGlobal': 'Estadísticas Globales',
        'expandedOptionPerCentury': 'Estadísticas por Siglo',

        'labelPersonneRacine': 'Persona raíz',
        'searchPlaceholder': 'buscar raíz',
        'searchButtonText': '🔍',
        'selectDefaultOption': '...    seleccionar',
        'alertNoPerson': 'No se encontró ninguna persona',
        'titleSettings': 'Configuración',
        'titleMap': 'Mostrar mapa de calor',
        'buttonValidate': 'Validar',
        'loadingHeatmap': 'Generando mapa de calor...',
        'noGeoData': 'No hay datos geográficos disponibles para las personas seleccionadas.',
        'errorHeatmap': 'Error al generar el mapa de calor',
        'heatmapTitleTous': 'Todos',
        'heatmapTitleAscend': 'Ascendientes',
        'heatmapTitleDescend': 'Descendientes',
        'mapGeneration': 'Generando mapa de calor...'
      },
      'hu': {
        'titlePrenoms': 'Keresztnevek',
        'titleNoms': 'Vezetéknevek',
        'titleMetiers': 'Foglalkozások',
        'titleLieux': 'Helyek',
        'titleDureeVie': 'Élettartamok',
        'titleAgeProcreation': 'Szaporodási életkorok',
        'titleAgeMariage': 'Házasságkötési életkorok',
        'titleAgePremierEnfant': 'Első gyermek életkorok',
        'titleNombreEnfants': 'Gyermekek száma',
        'entre': 'között',
        'et': 'és',
        'motPlaces': 'szó elhelyezve',
        'début': 'kezdet',
        'fin': 'vég',

        'optionPrenom': 'Keresztnév',
        'optionNom': 'Név',
        'optionMetier': 'Foglalk.',
        'optionLieux': 'Helyek',
        'optionVie': 'Élet',
        'optionProcreat': 'Szapor.',
        'option1erEnf': '1.Gyerm.',
        'optionMariage': 'Házasság',
        'optionNbEnf': 'Gyerm.sz',

        'optionTout': 'Mind',
        'optionAscDir': 'Közv. ős',
        'optionAscend': 'Ősök',
        'optionDescDir': 'Közv ut',
        'optionDescend': 'Utód.',

        'optionGlobal': 'Globális statisztikák',
        'optionPerCentury': 'Statisztikák évszázadonként',

        'expandedOptionPrenoms': 'Keresztnevek',
        'expandedOptionNoms': 'Vezetéknevek',
        'expandedOptionMetiers': 'Foglalkozások',
        'expandedOptionLieux': 'Helyek',
        'expandedOptionVie': 'Élettartam',
        'expandedOptionProcreat': 'Szaporodási életkor.',
        'expandedOption1erEnf':   'Első gyermek életkora',
        'expandedOptionMariage':  'Házasságkötési életk.',
        'expandedOptionNbEnf': 'Gyermekek száma',
        'expandedOptionTout': 'Teljes fájl',
     
        'expandedOptionAscDir': 'Közvetlen ősei             a gyökérnek',
        'expandedOptionAscend': 'Ősök + testvérek           a gyökérnek',
        'expandedOptionDescDir': 'Közvetlen utódai           a gyökérnek',
        'expandedOptionDescend': 'Utódok + házastársak       a gyökérnek',

        'expandedOptionGlobal':     'Globális statisztikák',
        'expandedOptionPerCentury': 'Századi statisztikák',

        'labelPersonneRacine': 'Gyökérszemély',
        'searchPlaceholder': 'gyökér keresése',
        'searchButtonText': '🔍',
        'selectDefaultOption': '...    választ',
        'alertNoPerson': 'Nem található személy',
        'titleSettings': 'Beállítások',
        'titleMap': 'Hőtérkép mutatása',
        'buttonValidate': 'Megerősít',
        'loadingHeatmap': 'Hőtérkép generálása...',
        'noGeoData': 'Nincs földrajzi adat a kiválasztott személyekhez.',
        'errorHeatmap': 'Hiba a hőtérkép generálásánál',
        'heatmapTitleTous': 'Mind',
        'heatmapTitleAscend': 'Ősök',
        'heatmapTitleDescend': 'Utódok',
        'mapGeneration': 'Hőtérkép generálása...'
      }
    };
  
    // Récupérer la langue actuelle
    const currentLang = window.CURRENT_LANGUAGE || 'fr';
    
    // Retourner la traduction ou le fallback en français
    return translations[currentLang]?.[key] || translations['fr'][key];
}

function createModalContainer() {
    const modal = document.createElement('div');
    modal.className = 'nameCloud-modal-container';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';
    modal.style.padding = '0';
    modal.style.margin = '0';
    modal.style.overflow = 'hidden';

    return modal;
}

function createMainContainer() {
    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    let scale;
    if(state.isSamsungBrowser) { scale = 1;}
    else { scale = 1/state.browserScaleFactor;}
    container.style.borderRadius = 10*scale+'px';
    container.style.padding = '0';
    container.style.position = 'relative';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.overflow = 'hidden';

    // --- Créer le toast permanent dans le DOM ---
    const loaderSpinnerOverlay = document.createElement('div');
    loaderSpinnerOverlay.id = 'loaderSpinnerOverlay';
    // toast.textContent = 'Chargement...';
    // Object.assign(toast.style, {
    //     position: 'fixed',
    //     top: '100px',
    //     left: '100px',
    //     background: 'orange',
    //     color: 'white',
    //     padding: '10px 15px',
    //     borderRadius: '5px',
    //     fontWeight: 'bold',
    //     zIndex: 10000,
    //     display: 'block',        // invisible par défaut
    //     //   display: 'block',
    //     boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
    //     visibility: 'hidden',
    // });

    Object.assign(loaderSpinnerOverlay.style, {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10000,
        display: 'block',
        visibility: 'hidden',   // invisible par défaut
    });

    // contenu du loader
    loaderSpinnerOverlay.innerHTML = `
        <div style="font-size: 64px; color: #3b82f6; animation: spin 1s linear infinite;">⟳</div>
        <style>
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        </style>
    `;
    document.body.appendChild(loaderSpinnerOverlay);
    
    return container;
}

function createCloseButton() {
    const closeButton = document.createElement('button');
    // closeButton.innerHTML = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '0.6em';
    closeButton.style.right = '0.6em';
    closeButton.style.background =  '#f44336'; //'rgba(255, 255, 255, 0.7)';    
    closeButton.style.color = 'white'; //'rgba(255, 255, 255, 0.7)';
    closeButton.style.border = 'none'; //'1px solid #ccc';
    closeButton.style.borderRadius = '50%';
    closeButton.style.width = '3.2em';
    closeButton.style.height = '3.2em';
    closeButton.style.fontSize = '10px';
    closeButton.style.fontWeight= 'bold';
    closeButton.style.cursor = 'pointer';
    closeButton.style.display = 'flex';
    closeButton.style.justifyContent = 'center';
    closeButton.style.alignItems = 'center';
    closeButton.style.zIndex = '1001';
    closeButton.style.boxShadow = '0 0.2em 0.5em rgba(0,0,0,0.3)'; //'0 2px 4px rgba(0,0,0,0.2)';
    closeButton.dataset.role = 'fontSizeChangeChromeCloudName';
    
    const closeButtonSpan = document.createElement('span');
    closeButtonSpan.innerHTML = '×';
    closeButtonSpan.dataset.role = 'fontSizeChangeCloudName';
    closeButtonSpan.style.fontSize = '24px';
    closeButton.appendChild(closeButtonSpan);
    
    return closeButton;
}


function createNameCloudContainer() {
    const nameCloudContainer = document.createElement('div');
    nameCloudContainer.style.flexGrow = '1';
    nameCloudContainer.style.overflow = 'hidden';
    nameCloudContainer.style.margin = '0';
    nameCloudContainer.style.padding = '0';
    nameCloudContainer.style.position = 'relative';
    if (state.isSamsungBrowser) { nameCloudContainer.style.marginTop = '-20px'; }
    else { nameCloudContainer.style.marginTop = -20/state.browserScaleFactor+'px';}
    nameCloudContainer.id = 'name-Cloud-Container';
    return nameCloudContainer;
}

export function createTypeSelect(type, isForStatsModal = false, width = 60, 
    colors = {
        main: ' #4361ee',    // Bleu pour le sélecteur
        options: ' #38b000', // Vert pour les options
        hover: ' #2e9800',   // Vert légèrement plus foncé au survol
        selected: ' #1a4d00' // Vert beaucoup plus foncé pour l'option sélectionnée
    }
) {
    // Définir les options et les valeurs correspondantes
    // const typeOptions = ['Prénom', 'Nom', 'Métier', 'Lieux', 'Vie', 'Procréat', '1er Enf.', 'Mariage',  'Nb Enf.']; 
    // const typeOptionsExpanded = ['Prénoms', 'Noms de famille', 'Métiers', 'Lieux', 'Durée de Vie', 'Ages de procréation', 'Age au 1er enfant', 'Age de Mariage', 'Nombre d\'enfants'];   
    // Définir les options et les valeurs correspondantes
    
    const typeOptionsExpanded = [
        getTranslation('expandedOptionPrenoms'), 
        getTranslation('expandedOptionNoms'), 
        getTranslation('expandedOptionMetiers'), 
        getTranslation('expandedOptionLieux'), 
        getTranslation('expandedOptionVie'), 
        getTranslation('expandedOptionProcreat'), 
        getTranslation('expandedOption1erEnf'), 
        getTranslation('expandedOptionMariage'), 
        getTranslation('expandedOptionNbEnf')
    ]; 
    
    let typeOptions;
    let dropdownWidth = 170;
    let padding_x = 1;
    if (isForStatsModal) {
        typeOptions = typeOptionsExpanded;
        dropdownWidth = width;
        padding_x = 15;
    } else {
        typeOptions = [
            getTranslation('optionPrenom'), 
            getTranslation('optionNom'), 
            getTranslation('optionMetier'), 
            getTranslation('optionLieux'), 
            getTranslation('optionVie'), 
            getTranslation('optionProcreat'), 
            getTranslation('option1erEnf'), 
            getTranslation('optionMariage'), 
            getTranslation('optionNbEnf')
        ]; 
    }

    const typeValues = ['prenoms', 'noms', 'professions', 'lieux', 'duree_vie', 'age_procreation', 'age_first_child', 'age_marriage', 'nombre_enfants'];
    
    
    // Créer la liste d'options
    const options = createOptionsFromLists(typeOptions, typeOptionsExpanded, typeValues);
    
    // Couleurs pour le sélecteur personnalisé
    // const colors = {
    //     main: ' #4361ee',    // Bleu pour le sélecteur
    //     options: ' #38b000', // Vert pour les options
    //     hover: ' #2e9800',   // Vert légèrement plus foncé au survol
    //     selected: ' #1a4d00' // Vert beaucoup plus foncé pour l'option sélectionnée
    // };
    
    // Utiliser le sélecteur personnalisé avec une configuration très précise
    return createCustomSelector({
        options: options,
        selectedValue: type,
        colors: colors,
        isMobile: nameCloudState.mobilePhone,
        dimensions: {
            width: width + 'px',
            height: '25px',
            dropdownWidth: dropdownWidth+'px',
            // Hauteur fixe au lieu d'une hauteur maximale
            // Calculée en fonction du nombre d'options et de leur hauteur
            // dropdownFixedHeight: `${(options.length) * 50}px` // 38px par option (padding 10px haut+bas + texte)
            dropdownMaxHeight: '345px'

        },
        
        // Padding très réduit pour maximiser la compacité
        padding: {
            display: { x: padding_x, y: 1 },    // Padding minimal pour le sélecteur
            options: { x: 1, y: 1 },     // Padding pour les options
            displayPosition : 'center'
        },
        

        arrow: {
            position: 'top-right',
            size: 5.5,
            offset: { x: -5, y: 1} // Décale 5px vers la gauche et 2px vers le bas
        },

        // Personnalisation des options
        customizeOptionElement: (optionElement, option) => {
            // Utiliser le label étendu dans le menu déroulant
            optionElement.textContent = option.expandedLabel;
            
            // Centrer le texte
            optionElement.style.textAlign = 'center';
            
            // Padding spécifique
            optionElement.style.padding = '6px 4px';
        },
        
    });
}

export function createScopeSelect(type, isForStatsModal = false, width = 60, 
    colors = {
        main: ' #4361ee',    // Bleu pour le sélecteur
        options: ' #38b000', // Vert pour les options
        hover: ' #2e9800',   // Vert légèrement plus foncé au survol
        selected: ' #1a4d00' // Vert beaucoup plus foncé pour l'option sélectionnée
    }
) {
    // Définir les options et les valeurs correspondantes
    // Définir les options et les valeurs correspondantes
    // const typeOptions = ['Tout', 'Asc dir.','Ascend', 'Desc dir',  'Descend']; 
    // const typeOptionsExpanded = ['Tout le fichier', 'Ascendants directs de la racine', 'Ascendants + fratrie de la racine', 'Desccendants directs de la racine' , 'Desccendants + conjoints de la racine'];       
    const typeOptionsExpanded = [
        getTranslation('expandedOptionTout'), 
        getTranslation('expandedOptionAscDir'), 
        getTranslation('expandedOptionAscend'), 
        getTranslation('expandedOptionDescDir'), 
        getTranslation('expandedOptionDescend')
    ];

    let typeOptions;
    let dropdownWidth = 170;
    let padding_x = 1;
    if (isForStatsModal) {
        // typeOptions = typeOptionsExpanded;
        // typeOptions.forEach(option => {option = option.substring(0, 10)});
        typeOptions = [];
        typeOptionsExpanded.forEach((option, index) => {
            typeOptions[index] = option.substring(0, 23);
        });


        dropdownWidth = width;
        padding_x = 15;
    } else {
        typeOptions = [
            getTranslation('optionTout'), 
            getTranslation('optionAscDir'),
            getTranslation('optionAscend'), 
            getTranslation('optionDescDir'),  
            getTranslation('optionDescend')
        ]; 
    }

    // const typeOptions = [
    //     getTranslation('optionTout'), 
    //     getTranslation('optionAscDir'),
    //     getTranslation('optionAscend'), 
    //     getTranslation('optionDescDir'),  
    //     getTranslation('optionDescend')
    // ]; 
    


    
    
    const typeValues = ['all', 'directAncestors', 'ancestors', 'directDescendants', 'descendants'];
    
    // Créer la liste d'options
    const options = createOptionsFromLists(typeOptions, typeOptionsExpanded, typeValues);
    
    // // Couleurs pour le sélecteur personnalisé
    // const colors = {
    //     main: ' #4CAF50',    // Vert pour le sélecteur principal
    //     options: ' #4361ee', // Bleu pour les options
    //     hover: ' #2341ce', //#4CAF50',   // Vert au survol
    //     selected: ' #1a237e' // Bleu foncé pour l'option sélectionnée
    // };
    
    // Utiliser la fonction générique
    return createCustomSelector({
        options: options,
        selectedValue: type,
        colors: colors,
        isMobile: nameCloudState.mobilePhone,
        dimensions: {
            // width: '60px',
            width: width + 'px',
            height: '25px',
            dropdownWidth: '280px',
        },
        // Padding très réduit pour maximiser la compacité
        padding: {
            display: { x: padding_x, y: 1 },    // Padding minimal pour le sélecteur
            options: { x: 8, y: 10 },    // Padding pour les options
            displayPosition : 'center'
        },
        arrow: {
            position: 'top-right',
            size: 5.5,
            offset: { x: -5, y: 1 } // Décale 5px vers la gauche et 2px vers le bas
        },
        
        // Personnalisation des options
        customizeOptionElement: (optionElement, option) => {
            // Utiliser le label étendu dans le menu déroulant
            optionElement.textContent = option.expandedLabel;
            
            // Centrer le texte
            optionElement.style.textAlign = 'center';
            
            // Padding spécifique
            optionElement.style.padding = '10px 8px';
        },

    });
}

export function createStatsTypeSelect(type, isForStatsModal = false, width = 60, 
    colors = {
        main: ' #4361ee',    // Bleu pour le sélecteur
        options: ' #38b000', // Vert pour les options
        hover: ' #2e9800',   // Vert légèrement plus foncé au survol
        selected: ' #1a4d00' // Vert beaucoup plus foncé pour l'option sélectionnée
    }
) {
    // Définir les options et les valeurs correspondantes    
    const typeOptionsExpanded = [
        getTranslation('expandedOptionGlobal'), 
        getTranslation('expandedOptionPerCentury'), 
    ];

    let typeOptions;
    let dropdownWidth = 170;
    let padding_x = 1;
    if (isForStatsModal) {
        typeOptions = [];
        typeOptionsExpanded.forEach((option, index) => {
            typeOptions[index] = option.substring(0, 23);
        });


        dropdownWidth = width;
        padding_x = 15;
    } else {
        typeOptions = [
            getTranslation('optionGlobal'), 
            getTranslation('optionPerCentury'),
        ]; 
    }    
    
    const typeValues = ['global', 'perCentury'];
    
    // Créer la liste d'options
    const options = createOptionsFromLists(typeOptions, typeOptionsExpanded, typeValues);
    
    
    // Utiliser la fonction générique
    return createCustomSelector({
        options: options,
        selectedValue: type,
        colors: colors,
        isMobile: nameCloudState.mobilePhone,
        dimensions: {
            // width: '60px',
            width: width + 'px',
            height: '25px',
            dropdownWidth: width + 'px',
        },
        // Padding très réduit pour maximiser la compacité
        padding: {
            display: { x: padding_x, y: 1 },    // Padding minimal pour le sélecteur
            options: { x: 8, y: 10 },    // Padding pour les options
            displayPosition : 'center'
        },
        arrow: {
            position: 'top-right',
            size: 5.5,
            offset: { x: -5, y: 1 } // Décale 5px vers la gauche et 2px vers le bas
        },
        
        // Personnalisation des options
        customizeOptionElement: (optionElement, option) => {
            // Utiliser le label étendu dans le menu déroulant
            optionElement.textContent = option.expandedLabel;
            
            // Centrer le texte
            optionElement.style.textAlign = 'center';
            
            // Padding spécifique
            optionElement.style.padding = '10px 8px';
        },

    });
}

function createSettingsButton() {
    const settingsButton = document.createElement('button');
    // settingsButton.innerHTML = '⚙️';
    
    // Style de base
    settingsButton.style.backgroundColor = 'transparent';
    settingsButton.style.border = 'none';
    settingsButton.style.padding = '0';
    settingsButton.style.width = '2.8em';
    settingsButton.style.height = '2.8em';
    settingsButton.style.fontSize = '10px';
    settingsButton.style.cursor = 'pointer';
    settingsButton.style.display = 'flex';
    settingsButton.style.justifyContent = 'center';
    settingsButton.style.alignItems = 'center';
    // settingsButton.title = 'Paramètres';
    settingsButton.title = getTranslation('titleSettings');
    settingsButton.dataset.role = 'fontSizeChangeChromeCloudName';


    const settingsButtonSpan = document.createElement('span');
    settingsButtonSpan.innerHTML = '⚙️';
    settingsButtonSpan.style.fontSize = '20px';
    settingsButtonSpan.dataset.role = 'fontSizeChangeCloudName';
    settingsButton.appendChild(settingsButtonSpan);

    
    // Animation subtile au survol
    settingsButton.addEventListener('mouseover', () => {
        settingsButton.style.animation = 'gear-spin 2s linear infinite';
    });
    
    settingsButton.addEventListener('mouseout', () => {
        settingsButton.style.animation = 'none';
    });
    
    // Ajouter l'animation CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes gear-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    return settingsButton;
}

export async function closeCloudName() {
    // Supprimer toutes les stats modals avant de fermer la CloudMap

    const modal = document.querySelector('[class^="nameCloud-modal-container"]');

    removeAllStatsElements(); 
    if (modal) {document.body.removeChild(modal);}
    resetHamburgerButtonPosition();
    showHamburgerButtonForcefully();


    showAndRestoreTreeButtons();

    fullResetAnimationState();

    setTimeout(() => {
        closeAllModals();
    }, 200);





    state.isWordCloudEnabled = false; // le nuage de mots est désactivé

    //  quand on quitte la page remettre le root selector dans la page initiale...
    let searchRootOverlay = document.getElementById('resultsTreeOverlay');
    if (searchRootOverlay) { searchRootOverlay.remove(); }
    if (nameCloudState.originalNextSiblingResults) {
        nameCloudState.originalParentResults.insertBefore(nameCloudState.resultsSelectTree, nameCloudState.originalNextSiblingResults);
    } else {
        nameCloudState.originalParentResults.appendChild(nameCloudState.resultsSelectTree);
    }

    if (nameCloudState.originalNextSiblingSearch) {
        nameCloudState.originalParentSearch.insertBefore(nameCloudState.searchInputTree, nameCloudState.originalNextSiblingSearch);
    } else {
        nameCloudState.originalParentSearch.appendChild(nameCloudState.searchInputTree);
    }

    // Restaurer les styles inline originaux
    nameCloudState.searchInputTree.style.cssText = nameCloudState.originalInlineStyleSearchCss;

    state.isRadarEnabled = (state.previousMode === 'radar') ? true : false;

    updateRadarButtonText();

    if (state.isRadarEnabled) {
        const enableFortuneMode = await getEnableFortuneMode();
        enableFortuneMode();
        displayGenealogicTree(null, false, false,  false, 'WheelAncestors');
    } 

    buttonsOnDisplay(nameCloudState.isButtonOnDisplayBeforeCloud); 


    if (state.backgroundEnabled) {
        setTimeout(() => {
            // Pour ré-activer le fond d'écran
            console.log("\n\n re-activation du fond d'écran depuis setupModalEvents dans nameCloudUI.js \n\n");
            enableBackground(true, true);
        }, 200);
    }


}

function setupModalEvents(modal, closeButton, generateNameCloud) {
    // Événement pour le bouton Fermer
    closeButton.addEventListener('click', () => {
        closeCloudName(modal);

    });

    // Événement pour la touche Échap
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeCloudName(modal);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

// Fonction pour mettre à jour le texte du titre
export function updateTitleText(element, cfg) {
    let titleText = '';
    
    if (cfg.type === 'prenoms') {
        titleText = `${nameCloudState.totalWords} ${getTranslation('titlePrenoms')}`;
    } else if (cfg.type === 'noms') {
        titleText = `${nameCloudState.totalWords} ${getTranslation('titleNoms')}`;
    } else if (cfg.type === 'professions') {
        titleText = `${nameCloudState.totalWords} ${getTranslation('titleMetiers')}`;
    } else if (cfg.type === 'lieux'){
        titleText = `${nameCloudState.totalWords} ${getTranslation('titleLieux')}`; //  ${getTranslation('entre')} ${cfg.startDate} ${getTranslation('et')} ${cfg.endDate}
    } else if (cfg.type === 'duree_vie') {
        titleText = `${nameCloudState.totalWords} ${getTranslation('titleDureeVie')}`;
    } else if (cfg.type === 'age_procreation') {
        titleText = `${nameCloudState.totalWords} ${getTranslation('titleAgeProcreation')}`;
    } else if (cfg.type === 'age_marriage') {
        titleText = `${nameCloudState.totalWords} ${getTranslation('titleAgeMariage')}`;
    } else if (cfg.type === 'age_first_child') {
        titleText = `${nameCloudState.totalWords} ${getTranslation('titleAgePremierEnfant')}`;
    } else if (cfg.type === 'nombre_enfants') {
        titleText = `${nameCloudState.totalWords} ${getTranslation('titleNombreEnfants')}`;
    }

    if (!nameCloudState.mobilePhone || state.innerWidth > 800) 
        titleText = titleText + ` ${getTranslation('entre')} ${cfg.startDate} ${getTranslation('et')} ${cfg.endDate}`;
    else
        titleText = ` <span style="font-size: 0.7em">` + titleText + `</span> <span style="font-size: 0.6em">${getTranslation('entre')} ${cfg.startDate} ${getTranslation('et')} ${cfg.endDate}</span>`;

    if (nameCloudState.placedWords < nameCloudState.totalWords) {
        if (!nameCloudState.mobilePhone || state.innerWidth > 800)
            titleText = titleText + ` <span style="font-size: 0.6em; color: red">(${nameCloudState.placedWords} ${getTranslation('motPlaces')})</span>`;
        else
            titleText = titleText + ` <span style="font-size: 0.5em; color: red">(${nameCloudState.placedWords} ${getTranslation('motPlaces')})</span>`;
    } 

    
    if ((state.innerWidth > 700)) {
        if (state.isSamsungBrowser) {
            element.style.marginTop = '-30px';
            element.style.marginLeft = '375px';
        } else {
            element.style.marginTop = -30/state.browserScaleFactor +'px';
            element.style.marginLeft = 375/state.browserScaleFactor +'px';
        }


        element.style.textAlign = 'left';
    } else {
        element.style.marginTop = '0px';
        element.style.marginLeft = '0px';
        element.style.textAlign = 'center';        
    }

    element.innerHTML = titleText;
}

export function generateNameCloudExport() {
    // console.log('\n\n **** debug generateNameCloudNew', nameCloudState.typeSelect.value, nameCloudState.scopeSelect.value )
        const newConfig = {
            type: nameCloudState.typeSelect.value,
            startDate: parseInt(nameCloudState.startDateInput.value),
            endDate: parseInt(nameCloudState.endDateInput.value),
            scope: nameCloudState.scopeSelect.value,
            // rootPersonId: scopeSelect.value !== 'all' ? rootPersonSelect.value : null
            rootPersonId: nameCloudState.scopeSelect.value !== 'all' ? state.rootPersonId : null
        };

        // Mettre à jour le titre
        updateTitleText(nameCloudState.titleElement, newConfig);

        // Nettoyer le conteneur
        nameCloudState.nameCloudContainer.innerHTML = '';

        // Générer le nuage de mots
        const isCallFromCloudName = true;
        processNamesCloudWithDate(newConfig, nameCloudState.nameCloudContainer, isCallFromCloudName);

        setTimeout(() => {
            // Tous les types supportés
            const supportedTypes = ['duree_vie', 'age_procreation', 'age_marriage', 'age_first_child', 'nombre_enfants', 'prenoms', 'noms', 'professions', 'lieux'];

            if (supportedTypes.includes(newConfig.type) && nameCloudState.currentNameData) {
                // Préparer les données statistiques si nécessaire pour les types d'âge
                if (['duree_vie', 'age_procreation', 'age_marriage', 'age_first_child', 'nombre_enfants'].includes(newConfig.type)) {
                    ensureStatsExist(nameCloudState.currentNameData);
                }
                // Ajouter le bouton des statistiques détaillées avec le type approprié
                updateStatsButtons(nameCloudState.container, nameCloudState.currentNameData, newConfig.type, newConfig);
            }  
        }, 0);               
}

// Ajuste la direction selon la largeur de l’écran
export function updateOverlayLayout() {
    if (!state.isWordCloudEnabled) return;


    console.log('\n\n\n\n -------------   DEBUG updateOverlayLayout -------- \n\n\n\n')


    let searchRootOverlay = document.getElementById('resultsTreeOverlay');
    let scale;
    if(state.isSamsungBrowser) { scale = 1;}
    else { scale = 1/state.browserScaleFactor;}

    if(state.innerWidth > 420) {
        searchRootOverlay.style.top = 20*scale +'px';
        searchRootOverlay.style.flexDirection = 'row';
        searchRootOverlay.style.gap = 10*scale +'px';
        nameCloudState.searchInputTree.style.maxHeight = 26*scale +'px';
        // ordre sans déplacer les éléments
        nameCloudState.searchInputTree.style.order = 0; // search à gauche
        nameCloudState.resultsSelectTree.style.order = 1; // results à droite
    } else {
        searchRootOverlay.style.top = -3*scale +'px';
        searchRootOverlay.style.flexDirection = 'column';
        searchRootOverlay.style.gap = '0px';
        nameCloudState.searchInputTree.style.maxHeight = 20*scale +'px';
        nameCloudState.searchInputTree.style.marginLeft = -7*scale +'px';
        nameCloudState.searchInputTree.style.marginTop = 1*scale +'px';
        nameCloudState.searchInputTree.style.minWidth = 68*scale +'px';
        // ordre sans déplacer les éléments
        nameCloudState.resultsSelectTree.style.order = 0; // results en haut
        nameCloudState.searchInputTree.style.order = 1; // search en bas
    }

    if (!state.isSamsungBrowser) {
        setTimeout(() => {
            nameCloudState.searchInputTree.style.setProperty('margin-right', 7*scale +'px', 'important');
        }, 150);    
    }



    
    // setTimeout(() => {
    //     // redimensionnerSelectorSizeInDOMnameCloud();

    //     const selector = document.getElementById('root-person-results');
    //     // nameCloudState.resultsSelectTree
    //     selector.style.setProperty('--custom-font-size-display', 2);
    //     selector.style.setProperty('--custom-font-size-options', 2);

    //     // nameCloudState.resultsSelectTree.style.setProperty('--custom-font-size-display', 2);
    //     // nameCloudState.resultsSelectTree.style.setProperty('--custom-font-size-options', 2);

    // }, 1000);    


}

async function showNameCloud(nameData, config) {
    config.scope ='ancestors';

    const modal = createModalContainer();
    const container = createMainContainer();
    const closeButton = createCloseButton();
    const nameCloudContainer = createNameCloudContainer();
    let scale;
    if(state.isSamsungBrowser) { scale = 1;}
    else { scale = 1/state.browserScaleFactor;}

    const optionsContainer = document.createElement('div');
    optionsContainer.style.display = 'flex';
    optionsContainer.style.flexDirection = 'column';
    optionsContainer.style.alignItems = 'center';
    optionsContainer.style.padding = 2*scale +'px';
    optionsContainer.style.backgroundColor = 'transparent';
    optionsContainer.style.position = 'absolute';
    optionsContainer.style.top = '0';
    optionsContainer.style.left = '0';
    optionsContainer.style.right = '0';
    optionsContainer.style.zIndex = '10';

    const typeSelect = createTypeSelect(config.type);
    typeSelect.id = 'nameCloudTypeSelect';
    // typeSelect.dataset.role = 'fontSizeChangeChromeCloudName';
    // typeSelect.style.fontSize = '10px' 
    typeSelect.style.marginTop = 20*scale +'px'; //'2em';
    const scopeSelect = createScopeSelect(config.scope);
    scopeSelect.id = 'nameCloudScopeSelect';
    // scopeSelect.dataset.role = 'fontSizeChangeChromeCloudName';
    // scopeSelect.style.fontSize = '10px' 
    scopeSelect.style.marginTop = 20*scale +'px'; //'2em';

    const { container: startDateContainer, input: startDateInput } = createDateInput(getTranslation('début'), config.startDate || 1500, (value) => {
        // Support de callback en option pour réagir directement aux changements
        // sans attendre l'événement 'change'
        console.log('Start date changed to:', value);
    });
    const { container: endDateContainer, input: endDateInput } = createDateInput(getTranslation('fin'), config.endDate || new Date().getFullYear(), (value) => {
        console.log('End date changed to:', value);
    });

    const showButton = document.createElement('button');
    // showButton.innerHTML = '✓';
    showButton.style.padding = '0';
    showButton.style.backgroundColor = '#4CAF50';
    showButton.style.color = 'white';
    showButton.style.border = 'none';
    showButton.style.borderRadius = '50%';
    showButton.style.width = '2.3em';
    showButton.style.height = '2.3em';
    showButton.style.position = 'relative';
    showButton.style.marginLeft = '0px';
    showButton.style.transform = 'translateY(-2px)';
    showButton.style.fontSize = '10px';
    showButton.style.cursor = 'pointer';
    showButton.style.display = 'flex';
    showButton.style.justifyContent = 'center';
    showButton.style.alignItems = 'center';
    showButton.style.boxShadow = '0 0.2em 0.4em rgba(0,0,0,0.2)';
    showButton.title = getTranslation('buttonValidate');
    showButton.dataset.role = 'fontSizeChangeChromeCloudName';

    const showButtonSpan = document.createElement('span');
    showButtonSpan.innerHTML = '✓';
    showButtonSpan.style.fontSize = '16px';
    showButtonSpan.dataset.role = 'fontSizeChangeCloudName';
    showButton.appendChild(showButtonSpan);


    // nameCloudState.searchInputTree = document.getElementById('root-person-search');
    nameCloudState.searchInputTree = document.getElementById('root-person-search-div');
    // Sauvegarder la position d'origine
    nameCloudState.originalParentSearch = nameCloudState.searchInputTree.parentNode;
    nameCloudState.originalNextSiblingSearch = nameCloudState.searchInputTree.nextSibling;
    // Sauvegarde ses dimensions et styles actuels
    const computed = getComputedStyle(nameCloudState.searchInputTree);
    nameCloudState.originalStyleSearch = {
        width: computed.width,
        height: computed.height,
        fontSize: computed.fontSize,
        // si tu veux scale ou autre
        transform: computed.transform
    };

    nameCloudState.originalInlineStyleSearchCss = nameCloudState.searchInputTree.style.cssText;

    nameCloudState.resultsSelectTree = document.getElementById('root-person-results');
    // Sauvegarder la position d'origine
    nameCloudState.originalParentResults = nameCloudState.resultsSelectTree.parentNode;
    nameCloudState.originalNextSiblingResults = nameCloudState.resultsSelectTree.nextSibling;

    // Crée un conteneur searchRootOverlay pour le sélecteur resultsSelectTree 
    let searchRootOverlay = document.getElementById('resultsTreeOverlay');
    if (!searchRootOverlay) {
        searchRootOverlay = document.createElement('div');
        searchRootOverlay.id = 'resultsTreeOverlay';
        searchRootOverlay.style.position = 'fixed';
        searchRootOverlay.style.fontSize = '10px';
        searchRootOverlay.style.left = '23.5em';
        searchRootOverlay.style.zIndex = '1100';
        searchRootOverlay.style.pointerEvents = 'auto'; // <-- cliquable
        searchRootOverlay.style.display = 'flex ';
        searchRootOverlay.style.alignItems = 'center '; // petit espace entre les éléments
        searchRootOverlay.style.gap = '2em!important';
        searchRootOverlay.dataset.role = 'fontSizeChangeChromeCloudName';
        document.body.appendChild(searchRootOverlay);
        // Mets les sélecteurs dans l'overlay
        searchRootOverlay.appendChild(nameCloudState.searchInputTree);
        searchRootOverlay.appendChild(nameCloudState.resultsSelectTree);
    }

    // // Ajuste la direction selon la largeur de l’écran
    // function updateOverlayLayout() {
    //     if (!state.isWordCloudEnabled) return;
    //     if(window.innerWidth > 420) {
    //         searchRootOverlay.style.top = '20px';
    //         searchRootOverlay.style.flexDirection = 'row';
    //         searchRootOverlay.style.gap = '10px';
    //         nameCloudState.searchInputTree.style.maxHeight = '26px';
    //         // ordre sans déplacer les éléments
    //         nameCloudState.searchInputTree.style.order = 0; // search à gauche
    //         nameCloudState.resultsSelectTree.style.order = 1; // results à droite
    //     } else {
    //         searchRootOverlay.style.top = '-3px';
    //         searchRootOverlay.style.flexDirection = 'column';
    //         searchRootOverlay.style.gap = '0px';
    //         nameCloudState.searchInputTree.style.maxHeight = '20px';
    //         nameCloudState.searchInputTree.style.marginLeft = '-7px';
    //         nameCloudState.searchInputTree.style.marginTop = '1px';
    //         nameCloudState.searchInputTree.style.minWidth = '68px';
    //         // ordre sans déplacer les éléments
    //         nameCloudState.resultsSelectTree.style.order = 0; // results en haut
    //         nameCloudState.searchInputTree.style.order = 1; // search en bas
    //     }
    // }

    // Appel initial + écoute du redimensionnement
    updateOverlayLayout();
    // window.addEventListener('resize', debounce(() => {
    //     if (state.isWordCloudEnabled) {
    //         console.log('\n\n*** debug resize in showNameCloud in nameCloudUI for updateOverlayLayout \n\n');
    //         updateOverlayLayout();
    //     }
    // }, 150));



    // console.log('\n\n\n *******  -debug in showNameCloud', nameCloudState.searchInputTree, nameCloudState.resultsSelectTree, nameCloudState.originalStyleSearch, nameCloudState.originalInlineStyleSearchCss )

    function updateRootPersonVisibility() {
        const isRootPersonNeeded = ['ancestors', 'directAncestors', 'descendants', 'directDescendants'].includes(scopeSelect.value);
        searchRootOverlay.style.display = isRootPersonNeeded ? 'flex' : 'none';

    }
    scopeSelect.addEventListener('change', updateRootPersonVisibility);
    updateRootPersonVisibility();

    // Titre
    const titleElement = document.createElement('div');
    titleElement.style.fontSize = '22px';
    titleElement.style.fontWeight = 'bold';
    titleElement.id = 'name-cloud-title';
    titleElement.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
    titleElement.style.padding = '0.2em 1em';
    titleElement.style.borderRadius = '0.4em';
    titleElement.style.marginTop = '0.2em'; //'5px';
    titleElement.style.textAlign = 'center';
    titleElement.style.position = 'relative';
    titleElement.style.boxShadow = '0 0.1em 0.3em rgba(0,0,0,0.1)';
    titleElement.style.zIndex = '15'; // Z-index plus élevé pour superposer sur le sélecteur
    if ((state.innerWidth > 700)) {
            titleElement.style.marginTop = '-3em';
            titleElement.style.marginLeft = '37.5em';
            titleElement.style.textAlign = 'left';
    }
    titleElement.dataset.role = 'fontSizeChangeCloudName';

    // Définir le texte du titre
    nameCloudState.totalWords = nameData.length;

    updateTitleText(titleElement, config);
    
    // function generateNameCloud() {
    //     // console.log('\n\n **** debug generateNameCloud', typeSelect.value, nameCloudState.scopeSelect.value )
    //     console.log('\n\n **** debug generateNameCloud', typeSelect.value, scopeSelect.value ,' root=' , state.rootPersonId)

        
    // }






    //*********************************************************************************************************** */
    function generateNameCloud(nameData = null, isNameDataIn = false) {

        // console.log('\n\n **** debug generateNameCloud', typeSelect.value, nameCloudState.scopeSelect.value )
        console.log('\n\n **** debug generateNameCloud', typeSelect.value, scopeSelect.value ,' root=' , state.rootPersonId)

        const newConfig = {
            type: typeSelect.value,
            startDate: parseInt(startDateInput.value),
            endDate: parseInt(endDateInput.value),
            scope: scopeSelect.value,
            rootPersonId: scopeSelect.value !== 'all' ? state.rootPersonId: null
        };

        // Mettre à jour le titre
        updateTitleText(titleElement, newConfig);

        // Nettoyer le conteneur
        // nameCloudContainer.innerHTML = '';

        


            // const nameCloudContainer = document.getElementById('name-Cloud-Container');
            // 1. Afficher le spinner par-dessus l'ancien nuage (net et visible)
            // const loader2 = document.createElement('div');
            // loader2.id = 'word-cloud-loader2';
            // loader2.style.cssText = `
            //     position: fixed;
            //     top: 30%;
            //     left: 30%;
            //     font-size: 64px;
            //     z-index: 1000;
            //     color: #f63b54ff;
            // `;
            // loader2.innerHTML = `
            //     <div >⟳</div>
            // `;
            // // containerElement.style.position = 'relative';
            // nameCloudContainer.appendChild(loader2);



        // Générer le nuage de mots
        const isCallFromCloudName = true;
        processNamesCloudWithDate(newConfig, nameCloudContainer, isCallFromCloudName, nameData, isNameDataIn);

        setTimeout(() => {
            // Tous les types supportés
            const supportedTypes = ['duree_vie', 'age_procreation', 'age_marriage', 'age_first_child', 'nombre_enfants', 'prenoms', 'noms', 'professions', 'lieux'];

            if (supportedTypes.includes(newConfig.type) && nameCloudState.currentNameData) {
                // Préparer les données statistiques si nécessaire pour les types d'âge
                if (['duree_vie', 'age_procreation', 'age_marriage', 'age_first_child', 'nombre_enfants'].includes(newConfig.type)) {
                    ensureStatsExist(nameCloudState.currentNameData);
                }
                
                // Ajouter le bouton des statistiques détaillées avec le type approprié
                updateStatsButtons(container, nameCloudState.currentNameData, newConfig.type, newConfig);
            }
        }, 0); 


        // redimensionnerRootSelectorSizeInDOM();
        
    }

    // Ajouter les écouteurs d'événements
    typeSelect.addEventListener('change', generateNameCloud);
    scopeSelect.addEventListener('change', generateNameCloud);
    startDateInput.addEventListener('change', generateNameCloud);
    endDateInput.addEventListener('change', generateNameCloud);
    showButton.addEventListener('click', generateNameCloud);

    nameCloudState.typeSelect = typeSelect; 
    nameCloudState.scopeSelect = scopeSelect; 
    nameCloudState.startDateInput = startDateInput; 
    nameCloudState.endDateInput = endDateInput;     
    nameCloudState.titleElement = titleElement; 
    nameCloudState.nameCloudContainer= nameCloudContainer; 
    nameCloudState.container = container;


    // Ajout du bouton de paramètres
    const settingsButton = createSettingsButton();
    const createSettingsModal = await getCreateSettingsModal();
    settingsButton.addEventListener('click', () => {
        const settingsModal = createSettingsModal((settings) => {
            // Callback lorsque les paramètres sont sauvegardés
            generateNameCloud();
        });
        document.body.appendChild(settingsModal);
    });


    // Assemblage du conteneur
    const leftContainer = document.createElement('div');
    leftContainer.style.display = 'flex';
    leftContainer.style.gap = 2*scale +'px';
    leftContainer.appendChild(typeSelect);
    leftContainer.appendChild(scopeSelect);


    // Placer le bouton paramètres juste sous le typeSelect dans optionsContainer
    // Notez que settingsButton sera positionné en tant qu'élément indépendant
    settingsButton.style.position = 'absolute';
    if (nameCloudState.mobilePhone) 
        settingsButton.style.top = -4*scale +'px'; // Ajustez selon la hauteur de votre typeSelect
    else
        settingsButton.style.top = -3*scale +'px'; // Ajustez selon la hauteur de votre typeSelect
    settingsButton.style.left = 16*scale +'px'; // Ajustez selon le positionnement souhaité

    // Ajoutez le bouton à optionsContainer
    optionsContainer.appendChild(settingsButton);


    // À ajouter après la création du bouton de paramètres dans showNameCloud
    // Création du bouton de carte
    const mapButton = createMapButton();

    mapButton.addEventListener('click', async () => {
        // Récupérer les paramètres actuels de filtrage
        const currentConfig = {
            type: typeSelect.value,
            startDate: parseInt(startDateInput.value),
            endDate: parseInt(endDateInput.value),
            scope: scopeSelect.value,
            rootPersonId: scopeSelect.value !== 'all' ? state.rootPersonId : null
        };
        const refreshHeatmap = await getRefreshHeatmap();
    
        // Vérifier si une heatmap est déjà affichée
        if (document.getElementById('namecloud-heatmap-wrapper')) {
            // Si oui, la rafraîchir plutôt que d'en créer une nouvelle
            refreshHeatmap();
            return;
        }
        
        // Création d'un indicateur de chargement
        const loadingIndicator = document.createElement('div');
        loadingIndicator.style.position = 'fixed';
        loadingIndicator.style.top = '50%';
        loadingIndicator.style.left = '50%';
        loadingIndicator.style.transform = 'translate(-50%, -50%)';
        loadingIndicator.style.backgroundColor = 'white';
        loadingIndicator.style.padding = 20*scale +'px'
        loadingIndicator.style.borderRadius = 8*scale +'px'
        loadingIndicator.style.boxShadow = '0 '+2*scale +'px '+10*scale +'px rgba(0,0,0,0.2)';
        loadingIndicator.style.zIndex = '9999';
        // loadingIndicator.innerHTML = '<p>Génération de la heatmap...</p><progress style="width: 100%;"></progress>';
        loadingIndicator.innerHTML = `<p>${getTranslation('mapGeneration')}</p><progress style="width: 100%;"></progress>`;

        document.body.appendChild(loadingIndicator);
        
        try {

            // Générer les données pour la heatmap
            const createDataForHeatMap = await getCreateDataForHeatMap();
            const heatmapData = await createDataForHeatMap(currentConfig);
            
            // Supprimer l'indicateur de chargement
            document.body.removeChild(loadingIndicator);
            
            // Créer la heatmap interactive
            if (heatmapData && heatmapData.length > 0) {
                // Créer un titre pour la heatmap basé sur la configuration
                let heatmapTitle;
                if (state.innerWidth < 300) { 
                    heatmapTitle = `${currentConfig.scope === 'all' ? getTranslation('heatmapTitleTous') : 
                        (currentConfig.scope === 'ancestors' || currentConfig.scope === 'directAncestors') ? getTranslation('heatmapTitleAscend') : getTranslation('heatmapTitleDescend')} 
                        (${currentConfig.startDate}-${currentConfig.endDate})`;
                } else {
                    heatmapTitle = `Heatmap - ${currentConfig.scope === 'all' ? getTranslation('heatmapTitleTous') : 
                        (currentConfig.scope === 'ancestors' || currentConfig.scope === 'directAncestors') ? getTranslation('heatmapTitleAscend') : getTranslation('heatmapTitleDescend')} 
                        (${currentConfig.startDate}-${currentConfig.endDate})`;                    
                }
                
                // Utiliser la fonction pour créer la heatmap
                const createImprovedHeatmap = await getCreateImprovedHeatmap();
                createImprovedHeatmap(heatmapData, heatmapTitle);
                
                // Ajouter les écouteurs d'événements aux contrôles
                typeSelect.addEventListener('change', refreshHeatmap);
                scopeSelect.addEventListener('change', refreshHeatmap);
                startDateInput.addEventListener('change', refreshHeatmap);
                endDateInput.addEventListener('change', refreshHeatmap);











/////////// MODIF à Faire
                // if (finalRootPersonSelect) {
                    // finalRootPersonSelect.addEventListener('change', refreshHeatmap);
                    // state.rootPersonId.addEventListener('change', refreshHeatmap);
                // }

/////////////////////////












                
                // Le bouton OK
                const showButton = document.querySelector('button[title="Valider"]');
                if (showButton) {
                    showButton.addEventListener('click', refreshHeatmap);
                }
            } else {
                // alert('Aucune donnée géographique disponible pour les personnes sélectionnées.');
                alert(getTranslation('noGeoData'));
            }
        } catch (error) {
            console.error('Erreur lors de la génération de la heatmap:', error);
            if (document.body.contains(loadingIndicator)) {
                document.body.removeChild(loadingIndicator);
            }
            // alert(`Erreur lors de la génération de la heatmap: ${error.message}`);
            alert(`${getTranslation('errorHeatmap')}: ${error.message}`);
        }
    });


    // Positionnement du bouton carte
    mapButton.style.position = 'absolute';
    if (nameCloudState.mobilePhone) 
        mapButton.style.top = -5*scale +'px';
    else
        mapButton.style.top = -4*scale +'px';
    mapButton.style.left = 78*scale +'px'; // Positionner à droite du bouton de paramètres

    // Ajout du bouton à optionsContainer
    optionsContainer.appendChild(mapButton);


    const dateContainer = document.createElement('div');
    dateContainer.style.display = 'flex';
    dateContainer.style.gap = 3*scale +'px';
    dateContainer.appendChild(startDateContainer);
    dateContainer.appendChild(endDateContainer);

    const mainOptionsContainer = document.createElement('div');
    mainOptionsContainer.style.display = 'flex';
    mainOptionsContainer.style.gap = 3*scale +'px';
    mainOptionsContainer.style.alignItems = 'flex-end';

    mainOptionsContainer.appendChild(leftContainer);
    mainOptionsContainer.appendChild(dateContainer);
    mainOptionsContainer.appendChild(showButton);

    const bottomContainer = document.createElement('div');
    bottomContainer.style.display = 'flex';
    bottomContainer.style.justifyContent = 'flex-start'; // Changé de 'space-between' à 'flex-start'
    bottomContainer.style.alignItems = 'center';
    bottomContainer.style.width = '100%';
    bottomContainer.style.gap = 10*scale +'px'; 

    bottomContainer.appendChild(mainOptionsContainer);

    optionsContainer.appendChild(bottomContainer);
    optionsContainer.appendChild(titleElement);

    container.appendChild(closeButton);
    container.appendChild(nameCloudContainer);
    container.appendChild(optionsContainer);
    modal.appendChild(container);
    document.body.appendChild(modal);

    // STOCKER LE MODAL GLOBALEMENT
    state.currentNameCloudModal = modal;


    // Configuration des événements
    setupModalEvents(modal, closeButton, generateNameCloud);
    typeSelect.addEventListener('change', generateNameCloud);
    scopeSelect.addEventListener('change', generateNameCloud);
    showButton.addEventListener('click', generateNameCloud);


    // Générer initialement le nuage de mots
    generateNameCloud(nameData, true);

    // Définir le texte du titre
    updateTitleText(titleElement, config);

    return modal;
}

export const createNameCloudUI = {
    renderInContainer(nameData, config, containerElement) {
        if (containerElement) {
            // Utilisez ReactDOM pour rendre l'élément
            const root = ReactDOM.createRoot(containerElement);
            root.render(React.createElement(NameCloud, { nameData: nameData, config: config }));
        }
    },

    showModal(nameData, config) {
        showNameCloud(nameData, config);
    }
};

function createMapButton() {
    const mapButton = document.createElement('button');
    // mapButton.innerHTML = '🌍'; //'🗺️';
    
    // Style de base similaire au bouton de paramètres existant
    mapButton.style.backgroundColor = 'transparent';
    mapButton.style.border = 'none';
    mapButton.style.padding = '0';
    mapButton.style.width = '2.8em';
    mapButton.style.height = '2.8em';
    mapButton.style.fontSize = '10px';
    mapButton.style.cursor = 'pointer';
    mapButton.style.display = 'flex';
    mapButton.style.justifyContent = 'center';
    mapButton.style.alignItems = 'center';
    // mapButton.title = 'Afficher la heatmap';
    mapButton.title = getTranslation('titleMap');
    mapButton.style.marginTop = '0.2em';
    mapButton.dataset.role = 'fontSizeChangeChromeCloudName';
    const mapButtonSpan = document.createElement('span');
    mapButtonSpan.innerHTML = '🌍';
    mapButtonSpan.style.fontSize = '20px';
    mapButtonSpan.dataset.role = 'fontSizeChangeCloudName';
    mapButton.appendChild(mapButtonSpan);

    
    // Effet de survol avec légère animation
    mapButton.addEventListener('mouseover', () => {
        mapButton.style.transform = 'scale(1.1)';
        mapButton.style.transition = 'transform 0.2s';
    });
    
    mapButton.addEventListener('mouseout', () => {
        mapButton.style.transform = 'scale(1)';
    });
    
    return mapButton;
}