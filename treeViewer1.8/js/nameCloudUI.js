import { state } from './main.js';
import { NameCloud, setupResizeListeners } from './nameCloudRenderer.js';
import { nameCloudState } from './nameCloud.js';
import { createSettingsModal } from './nameCloudSettings.js';
import { createDateInput } from './dateUI.js';
import { createCustomSelector, createOptionsFromLists } from './UIutils.js';
import { ensureStatsExist, addStatsButton, updateStatsButtons, removeAllStatsElements } from './nameCloudAverageAge.js';
import { createImprovedHeatmap  } from './geoHeatMapUI.js';
import { createDataForHeatMap, refreshHeatmap  } from './geoHeatMapDataProcessor.js';
import { attachFilterListeners  } from './geoHeatMapInteractions.js';
import { showHamburgerButtonForcefully } from './hamburgerMenu.js';
import { enableBackground } from './backgroundManager.js';
import { enableFortuneModeML } from './treeFanRenderer.js';



// Fonction pour obtenir les traductions selon la langue actuelle
function getTranslation(key) {
    const translations = {
      'fr': {
        'titlePrenoms': 'Prénoms',
        'titleNoms': 'Noms',
        'titleMetiers': 'Métiers',
        'titleLieux': 'Lieux',
        'titleDureeVie': 'Durées de vie',
        'titleAgeProcreation': 'Ages de procréation',
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
        'expandedOptionAscDir': 'Ascendants directs de la racine',
        'expandedOptionAscend': 'Ascendants + fratrie de la racine',
        'expandedOptionDescDir': 'Descendants directs de la racine',
        'expandedOptionDescend': 'Descendants + conjoints de la racine',
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
        'expandedOptionAscDir': 'Direct ancestors of root',
        'expandedOptionAscend': 'Ancestors + siblings of root',
        'expandedOptionDescDir': 'Direct descendants of root',
        'expandedOptionDescend': 'Descendants + spouses of root',
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

        'expandedOptionPrenoms': 'Nombres',
        'expandedOptionNoms': 'Apellidos',
        'expandedOptionMetiers': 'Profesiones',
        'expandedOptionLieux': 'Lugares',
        'expandedOptionVie': 'Duración de vida',
        'expandedOptionProcreat': 'Edades de procreación',
        'expandedOption1erEnf': 'Edad del primer hijo',
        'expandedOptionMariage': 'Edad de matrimonio',
        'expandedOptionNbEnf': 'Número de hijos',
        'expandedOptionTout': 'Todo el archivo',
        'expandedOptionAscDir': 'Ascendientes directos de la raíz',
        'expandedOptionAscend': 'Ascendientes + hermanos de la raíz',
        'expandedOptionDescDir': 'Descendientes directos de la raíz',
        'expandedOptionDescend': 'Descendientes + cónyuges de la raíz',
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

        'expandedOptionPrenoms': 'Keresztnevek',
        'expandedOptionNoms': 'Vezetéknevek',
        'expandedOptionMetiers': 'Foglalkozások',
        'expandedOptionLieux': 'Helyek',
        'expandedOptionVie': 'Élettartam',
        'expandedOptionProcreat': 'Szaporodási életkorok',
        'expandedOption1erEnf': 'Első gyermek életkora',
        'expandedOptionMariage': 'Házasságkötési életkor',
        'expandedOptionNbEnf': 'Gyermekek száma',
        'expandedOptionTout': 'Teljes fájl',
        'expandedOptionAscDir': 'Gyökér közvetlen ősei',
        'expandedOptionAscend': 'Gyökér ősei + testvérek',
        'expandedOptionDescDir': 'Gyökér közvetlen utódai',
        'expandedOptionDescend': 'Gyökér utódai + házastársak',
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
    modal.className = 'modal-container';
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
    container.style.borderRadius = '10px';
    container.style.padding = '0';
    container.style.position = 'relative';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.overflow = 'hidden';
    
    return container;
}

function createCloseButton() {
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '1px';
    closeButton.style.right = '1px';
    closeButton.style.background = 'rgba(255, 255, 255, 0.7)';
    closeButton.style.border = '1px solid #ccc';
    closeButton.style.borderRadius = '50%';
    closeButton.style.width = '30px';
    closeButton.style.height = '30px';
    closeButton.style.fontSize = '24px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.display = 'flex';
    closeButton.style.justifyContent = 'center';
    closeButton.style.alignItems = 'center';
    closeButton.style.zIndex = '1001';
    closeButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    
    return closeButton;
}

function createNameCloudContainer() {
    const nameCloudContainer = document.createElement('div');
    nameCloudContainer.style.flexGrow = '1';
    nameCloudContainer.style.overflow = 'hidden';
    nameCloudContainer.style.margin = '0';
    nameCloudContainer.style.padding = '0';
    nameCloudContainer.style.position = 'relative';
    nameCloudContainer.style.marginTop = '-20px';
    nameCloudContainer.id = 'name-Cloud-Container';
    return nameCloudContainer;
}

function createStandardTypeSelect(config) {
    const typeSelect = document.createElement('select');
    typeSelect.style.padding = '0px';
    typeSelect.style.minWidth = '10px';
    typeSelect.style.backgroundColor = '#4361ee';
    typeSelect.style.color = 'white';
    typeSelect.style.border = '1px solid #3f51b5';
    typeSelect.style.borderRadius = '3px';
    typeSelect.style.appearance = 'none';
    typeSelect.style.cursor = 'pointer';
    typeSelect.style.fontSize = '14px';
    typeSelect.style.fontWeight = 'bold';
    typeSelect.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
    
    typeSelect.style.backgroundImage = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'8\' height=\'8\' fill=\'white\'><polygon points=\'0,0 3,0 1.5,2\'/></svg>")';
    typeSelect.style.backgroundRepeat = 'no-repeat';
    typeSelect.style.backgroundPosition = 'top 0px right -13px';
    typeSelect.style.paddingRight = '0px';
    
    typeSelect.innerHTML = `
        <option value="prenoms">Prénom</option>
        <option value="noms">Nom</option>
        <option value="professions">Métier</option>
        <option value="duree_vie">Vie</option>
        <option value="age_procreation">Procréat</option>
        <option value="lieux">Lieux</option>                    
    `;
    typeSelect.value = config.type;
    
    typeSelect.addEventListener('mouseover', () => {
        typeSelect.style.backgroundColor = '#3a56e8';
    });
    typeSelect.addEventListener('mouseout', () => {
        typeSelect.style.backgroundColor = '#4361ee';
    });

    // Générer un ID unique pour ce sélecteur
    const selectId = `type-select-${Date.now()}`;
    typeSelect.id = selectId;
    
    // Style pour les options, incluant l'état au survol
    const style = document.createElement('style');
    style.textContent = `
        #${selectId} option {
            background-color: #38b000;
            color: white;
        }
        
        #${selectId} option:hover {
            background-color: #2e9800 !important;
            color: white !important;
        }
        
        #${selectId} option:checked {
            background-color: #38b000;
            color: white;
        }
    `;
    document.head.appendChild(style);

    return typeSelect;
}

function createTypeSelect(config) {
    // Définir les options et les valeurs correspondantes
    // const typeOptions = ['Prénom', 'Nom', 'Métier', 'Lieux', 'Vie', 'Procréat', '1er Enf.', 'Mariage',  'Nb Enf.']; 
    // const typeOptionsExpanded = ['Prénoms', 'Noms de famille', 'Métiers', 'Lieux', 'Durée de Vie', 'Ages de procréation', 'Age au 1er enfant', 'Age de Mariage', 'Nombre d\'enfants'];   
    // Définir les options et les valeurs correspondantes
    const typeOptions = [
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
    const typeValues = ['prenoms', 'noms', 'professions', 'lieux', 'duree_vie', 'age_procreation', 'age_first_child', 'age_marriage', 'nombre_enfants'];
    
    
    // Créer la liste d'options
    const options = createOptionsFromLists(typeOptions, typeOptionsExpanded, typeValues);
    
    // Couleurs pour le sélecteur personnalisé
    const colors = {
        main: ' #4361ee',    // Bleu pour le sélecteur
        options: ' #38b000', // Vert pour les options
        hover: ' #2e9800',   // Vert légèrement plus foncé au survol
        selected: ' #1a4d00' // Vert beaucoup plus foncé pour l'option sélectionnée
    };
    
    // Utiliser le sélecteur personnalisé avec une configuration très précise
    return createCustomSelector({
        options: options,
        selectedValue: config.type,
        colors: colors,
        isMobile: nameCloudState.mobilePhone,
        dimensions: {
            width: '60px',
            height: '25px',
            dropdownWidth: '170px',
            // Hauteur fixe au lieu d'une hauteur maximale
            // Calculée en fonction du nombre d'options et de leur hauteur
            // dropdownFixedHeight: `${(options.length) * 50}px` // 38px par option (padding 10px haut+bas + texte)
            dropdownMaxHeight: '345px'

        },
        
        // Padding très réduit pour maximiser la compacité
        padding: {
            display: { x: 1, y: 1 },    // Padding minimal pour le sélecteur
            options: { x: 1, y: 1 }     // Padding pour les options
        },
        
        // Configuration précise de la flèche comme dans l'original
        // arrow: {
        //     position: 'top',        // Position en haut
        //     visible: true,
        //     size: 6,                // Taille en pixels
        //     offset: { x: 0, y: 0 }  // Décalage en pixels
        // },
        

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

function createScopeSelect(config) {
    // Définir les options et les valeurs correspondantes
    // Définir les options et les valeurs correspondantes
    // const typeOptions = ['Tout', 'Asc dir.','Ascend', 'Desc dir',  'Descend']; 
    // const typeOptionsExpanded = ['Tout le fichier', 'Ascendants directs de la racine', 'Ascendants + fratrie de la racine', 'Desccendants directs de la racine' , 'Desccendants + conjoints de la racine'];       
    const typeOptions = [
        getTranslation('optionTout'), 
        getTranslation('optionAscDir'),
        getTranslation('optionAscend'), 
        getTranslation('optionDescDir'),  
        getTranslation('optionDescend')
    ]; 
    
    const typeOptionsExpanded = [
        getTranslation('expandedOptionTout'), 
        getTranslation('expandedOptionAscDir'), 
        getTranslation('expandedOptionAscend'), 
        getTranslation('expandedOptionDescDir'), 
        getTranslation('expandedOptionDescend')
    ];

    
    
    const typeValues = ['all', 'directAncestors', 'ancestors', 'directDescendants', 'descendants'];
    
    // Créer la liste d'options
    const options = createOptionsFromLists(typeOptions, typeOptionsExpanded, typeValues);
    
    // Couleurs pour le sélecteur personnalisé
    const colors = {
        main: ' #4CAF50',    // Vert pour le sélecteur principal
        options: ' #4361ee', // Bleu pour les options
        hover: ' #2341ce', //#4CAF50',   // Vert au survol
        selected: ' #1a237e' // Bleu foncé pour l'option sélectionnée
    };
    
    // Utiliser la fonction générique
    return createCustomSelector({
        options: options,
        selectedValue: config.type,
        colors: colors,
        isMobile: nameCloudState.mobilePhone,
        dimensions: {
            width: '60px',
            height: '25px',
            dropdownWidth: '280px',
        },
        // Padding très réduit pour maximiser la compacité
        padding: {
            display: { x: 1, y: 1 },    // Padding minimal pour le sélecteur
            options: { x: 8, y: 10 }     // Padding pour les options
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

function createRootPersonSelect() {
    const rootPersonSelect = document.createElement('select');
    rootPersonSelect.style.padding = '5px';
    rootPersonSelect.style.width = '100%';
    rootPersonSelect.style.display = 'none';
    rootPersonSelect.style.marginTop = '-30px';

    const rootPersons = Object.values(state.gedcomData.individuals);
    rootPersons.sort((a, b) => a.name.localeCompare(b.name));
    rootPersons.forEach(person => {
        const option = document.createElement('option');
        option.value = person.id;
        option.textContent = person.name.replace(/\//g, '').trim();
        rootPersonSelect.appendChild(option);
    });

    if (state.rootPersonId) {
        rootPersonSelect.value = state.rootPersonId;
    }

    return rootPersonSelect;
}

function createRootPersonSearchContainer(rootPersonSelect, generateNameCloud) {
    const container = document.createElement('div');
    container.style.display = 'none'; // Caché par défaut
    container.style.position = 'relative';
    container.style.marginLeft = '5px'; // Changé de -7px à 5px pour le coller à gauche du bouton OK
    container.style.display = 'flex';
    container.style.width = 'auto';
    container.style.alignSelf = 'flex-start';
    container.style.zIndex = '10';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'flex-start'; // S'assure que tout est aligné à gauche

    const label = document.createElement('label');
    // label.textContent = 'Personne racine';
    label.textContent = getTranslation('labelPersonneRacine');
    label.style.fontSize = '12px';
    label.style.marginBottom = '2px';
    label.style.textAlign = 'left'; // Assurez-vous que le texte est aligné à gauche

    const searchWrapper = document.createElement('div');
    searchWrapper.style.display = 'flex';
    searchWrapper.style.gap = '5px';
    searchWrapper.style.width = '100%'; // Assure que le wrapper prend toute la largeur disponible
    searchWrapper.style.height = '25px'; // Hauteur réduite
    searchWrapper.style.position = 'relative'; // Ajout de position relative pour le positionnement du résultat

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    // searchInput.placeholder = 'search racine';
    searchInput.placeholder = getTranslation('searchPlaceholder');
    searchInput.style.padding = '2px 3px'; // Padding réduit
    searchInput.style.width = '79px';
    searchInput.style.height = '17px'; // Hauteur réduite
    searchInput.style.marginTop= '2px'
    
    const searchButton = document.createElement('button');
    // searchButton.textContent = '🔍';
    searchButton.textContent = getTranslation('searchButtonText');
    searchButton.style.padding = '0px 0px'; // Padding réduit
    searchButton.style.height = '24px'; // Hauteur réduite
    searchButton.style.marginLeft = '-3px';
    searchButton.style.marginTop= '3px'

    const resultsSelect = document.createElement('select');
    resultsSelect.style.display = 'none';
    resultsSelect.style.position = 'absolute';
    resultsSelect.style.bottom = 'calc(100% - 2px)'; // '100%'; // Changé de 'top: 100%' à 'bottom: 100%' pour afficher au-dessus
    resultsSelect.style.left = '0';
    resultsSelect.style.width = '100%';
    resultsSelect.style.zIndex = '1000';
    // resultsSelect.style.marginBottom = '0px'; // Ajout d'une marge en bas pour l'espacement
    resultsSelect.style.height = '22px'; // Hauteur réduite
    // resultsSelect.style.marginTop= '4px';

    function normalizeString(str) {
        return str.toLowerCase()
            .replace(/[éèêë]/g, 'e')
            .replace(/[àâä]/g, 'a')
            .replace(/[îï]/g, 'i')
            .replace(/[ôö]/g, 'o')
            .replace(/[ûüù]/g, 'u')
            .replace(/ç/g, 'c');
    }

    function searchRootPerson() {
        const searchStr = normalizeString(searchInput.value);
        
        // resultsSelect.innerHTML = '<option value="">...    select</option>';
        resultsSelect.innerHTML = `<option value="">${getTranslation('selectDefaultOption')}</option>`;

        resultsSelect.style.display = 'none';
        
        resultsSelect.style.textAlign = 'left';
        resultsSelect.style.backgroundColor = '#4361ee';
        resultsSelect.style.color = 'white';
        resultsSelect.style.border = '1px solid #3f51b5';
        resultsSelect.style.borderRadius = '4px';
        resultsSelect.style.appearance = 'none';
        resultsSelect.style.cursor = 'pointer';
        resultsSelect.style.fontSize = '14px';
        resultsSelect.style.fontWeight = 'bold';
        resultsSelect.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';

        // Réduire l'espacement interne du texte
        const selectId = `results-select-${Date.now()}`;
        resultsSelect.id = selectId;
        const optionStyle = document.createElement('style');
        optionStyle.textContent = `
            #${selectId} option {
                padding: 0px 0px !important;
            }
        `;
        document.head.appendChild(optionStyle);


        resultsSelect.style.backgroundImage = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'8\' height=\'8\' fill=\'white\'><polygon points=\'0,0 3,0 1.5,2\'/></svg>")';
        resultsSelect.style.backgroundRepeat = 'no-repeat';
        resultsSelect.style.backgroundPosition = 'top 0px left 5px';
        resultsSelect.style.paddingLeft = '0px';

        if (!searchStr) return;
    
        const matchedPersons = Object.values(state.gedcomData.individuals)
            .filter(person => {
                const fullName = normalizeString(person.name.replace(/\//g, ''));
                return fullName.includes(searchStr);
            });
    
        if (matchedPersons.length > 0) {
            matchedPersons.forEach(person => {
                const option = document.createElement('option');
                option.value = person.id;
                option.textContent = person.name.replace(/\//g, '').trim();
                resultsSelect.appendChild(option);
            });
            
            resultsSelect.style.display = 'block';
            
            resultsSelect.style.backgroundColor = '#FF6D00';
            resultsSelect.style.border = '1px solid #E65100';
            
            // Ajout d'une animation de clignotement pour le sélecteur orange
            resultsSelect.style.animation = 'blink 1s infinite';
            const blinkStyle = document.createElement('style');
            blinkStyle.textContent = `
                @keyframes blink {
                    0% { opacity: 1; }
                    50% { opacity: 0.7; }
                    100% { opacity: 1; }
                }
            `;
            document.head.appendChild(blinkStyle);
        } else {
            // alert('Aucune personne trouvée');
            alert(getTranslation('alertNoPerson'));
        }
    }

    searchButton.addEventListener('click', searchRootPerson);
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            searchRootPerson();
        }
    });


    resultsSelect.addEventListener('change', () => {
        const selectedPersonId = resultsSelect.value;
        if (selectedPersonId) {
            resultsSelect.style.animation = 'none';
            resultsSelect.style.backgroundColor = 'orange';
            rootPersonSelect.value = selectedPersonId;
            
            // Générer le nuage
            generateNameCloud();
            
            // Rafraîchir la heatmap si elle est visible
            if (typeof refreshHeatmap === 'function' && 
                document.getElementById('namecloud-heatmap-wrapper')) {
                console.log("Rafraîchissement de la heatmap suite à la sélection d'une nouvelle personne racine");
                setTimeout(refreshHeatmap, 100); // Petit délai pour permettre à generateNameCloud de terminer
            }
        }
    });

    searchWrapper.appendChild(searchInput);
    searchWrapper.appendChild(searchButton);
    searchWrapper.appendChild(resultsSelect); // Ajout du résultat dans le searchWrapper pour le positionnement

    container.appendChild(label);
    container.appendChild(searchWrapper);
    container.appendChild(rootPersonSelect);

    return {
        container: container,
        rootPersonSelect: rootPersonSelect
    };
}

function createSettingsButton() {
    const settingsButton = document.createElement('button');
    settingsButton.innerHTML = '⚙️';
    
    // Style de base
    settingsButton.style.backgroundColor = 'transparent';
    settingsButton.style.border = 'none';
    settingsButton.style.padding = '0';
    settingsButton.style.width = '28px';
    settingsButton.style.height = '28px';
    settingsButton.style.fontSize = '20px';
    settingsButton.style.cursor = 'pointer';
    settingsButton.style.display = 'flex';
    settingsButton.style.justifyContent = 'center';
    settingsButton.style.alignItems = 'center';
    // settingsButton.title = 'Paramètres';
    settingsButton.title = getTranslation('titleSettings');
    
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

function setupModalEvents(modal, closeButton, generateNameCloud) {
    // Événement pour le bouton Fermer
    closeButton.addEventListener('click', () => {
        // Supprimer toutes les stats modals avant de fermer la CloudMap
        removeAllStatsElements(); 
        document.body.removeChild(modal);
        showHamburgerButtonForcefully();

        // Pour désactiver le fond d'écran
        console.log("\n\n re-Désactivation du fond d'écran depuis setupModalEvents dans nameCloudUI.js \n\n");
        enableBackground(true);
        state.backgroundEnabled = true;
        if (state.isRadarEnabled) {
            enableFortuneModeML();
        }

    });

    // Événement pour la touche Échap
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            removeAllStatsElements(); 
            document.body.removeChild(modal);
            document.removeEventListener('keydown', handleEscape);
            showHamburgerButtonForcefully();
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
        titleText = `${nameCloudState.totalWords} ${getTranslation('titleLieux')} ${getTranslation('entre')} ${cfg.startDate} ${getTranslation('et')} ${cfg.endDate}`;
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

    if (!nameCloudState.mobilePhone || window.innerWidth > 800) 
        titleText = titleText + ` ${getTranslation('entre')} ${cfg.startDate} ${getTranslation('et')} ${cfg.endDate}`;
    else
        titleText = ` <span style="font-size: 0.7em">` + titleText + `</span> <span style="font-size: 0.6em">${getTranslation('entre')} ${cfg.startDate} ${getTranslation('et')} ${cfg.endDate}</span>`;

    if (nameCloudState.placedWords < nameCloudState.totalWords) {
        if (!nameCloudState.mobilePhone || window.innerWidth > 800)
            titleText = titleText + ` <span style="font-size: 0.6em; color: red">(${nameCloudState.placedWords} ${getTranslation('motPlaces')})</span>`;
        else
            titleText = titleText + ` <span style="font-size: 0.5em; color: red">(${nameCloudState.placedWords} ${getTranslation('motPlaces')})</span>`;
    } 

    if ((window.innerWidth > 700)) {
        element.style.marginTop = '-30px';
        element.style.marginLeft = '375px';
        element.style.textAlign = 'left';
    } else {
        element.style.marginTop = '0px';
        element.style.marginLeft = '0px';
        element.style.textAlign = 'center';        
    }

    element.innerHTML = titleText;
}



function showNameCloud(nameData, config) {
    const modal = createModalContainer();
    const container = createMainContainer();
    const closeButton = createCloseButton();
    const nameCloudContainer = createNameCloudContainer();

    const optionsContainer = document.createElement('div');
    optionsContainer.style.display = 'flex';
    optionsContainer.style.flexDirection = 'column';
    optionsContainer.style.alignItems = 'center';
    optionsContainer.style.padding = '2px';
    optionsContainer.style.backgroundColor = 'transparent';
    optionsContainer.style.position = 'absolute';
    optionsContainer.style.top = '0';
    optionsContainer.style.left = '0';
    optionsContainer.style.right = '0';
    optionsContainer.style.zIndex = '10';

    const typeSelect = createTypeSelect(config);
    // typeSelect.style.zIndex = 99999;
    typeSelect.style.marginTop = '20px';
    const scopeSelect = createScopeSelect(config);
    scopeSelect.style.marginTop = '20px';
    const rootPersonSelect = createRootPersonSelect();


    // Modification ici pour utiliser config.startDate et config.endDate
    // const { container: startDateContainer, input: startDateInput } = createDateInput('début', config.startDate || 1500);
    // const { container: endDateContainer, input: endDateInput } = createDateInput('fin', config.endDate || new Date().getFullYear());


    const { container: startDateContainer, input: startDateInput } = createDateInput(getTranslation('début'), config.startDate || 1500, (value) => {
        // Support de callback en option pour réagir directement aux changements
        // sans attendre l'événement 'change'
        console.log('Start date changed to:', value);
    });
    const { container: endDateContainer, input: endDateInput } = createDateInput(getTranslation('fin'), config.endDate || new Date().getFullYear(), (value) => {
        console.log('End date changed to:', value);
    });


    const showButton = document.createElement('button');
    showButton.innerHTML = '✓';
    showButton.style.padding = '0';
    showButton.style.backgroundColor = '#4CAF50';
    showButton.style.color = 'white';
    showButton.style.border = 'none';
    showButton.style.borderRadius = '50%';
    showButton.style.width = '23px';
    showButton.style.height = '23px';
    showButton.style.position = 'relative';
    showButton.style.marginLeft = '0px';
    showButton.style.transform = 'translateY(-2px)';
    showButton.style.fontSize = '16px';
    showButton.style.cursor = 'pointer';
    showButton.style.display = 'flex';
    showButton.style.justifyContent = 'center';
    showButton.style.alignItems = 'center';
    showButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    // showButton.title = 'Valider';
    showButton.title = getTranslation('buttonValidate');


    const { container: rootPersonContainer, rootPersonSelect: finalRootPersonSelect } = 
    createRootPersonSearchContainer(rootPersonSelect, () => {
        generateNameCloud();
    });


    rootPersonContainer.style.marginLeft = '-7px';
    rootPersonContainer.style.marginTop = '3px';

    function updateRootPersonVisibility() {
        const isRootPersonNeeded = ['ancestors', 'directAncestors', 'descendants', 'directDescendants'].includes(scopeSelect.value);
        rootPersonContainer.style.display = isRootPersonNeeded ? 'flex' : 'none';
    }
    scopeSelect.addEventListener('change', updateRootPersonVisibility);
    updateRootPersonVisibility();

    // Titre
    const titleElement = document.createElement('div');
    titleElement.style.fontSize = '22px';
    titleElement.style.fontWeight = 'bold';
    titleElement.id = 'name-cloud-title';
    titleElement.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
    titleElement.style.padding = '2px 10px';
    titleElement.style.borderRadius = '4px';
    titleElement.style.marginTop = '2px'; //'5px';
    titleElement.style.textAlign = 'center';
    titleElement.style.position = 'relative';
    titleElement.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
    titleElement.style.zIndex = '15'; // Z-index plus élevé pour superposer sur le sélecteur
    // if ((window.innerWidth > 700) && (window.innerWidth < 1600)) {
    if ((window.innerWidth > 700)) {
            titleElement.style.marginTop = '-30px';
            titleElement.style.marginLeft = '375px';
            titleElement.style.textAlign = 'left';
    }


    // Définir le texte du titre
    nameCloudState.totalWords = nameData.length;

    updateTitleText(titleElement, config);
    
    function generateNameCloud() {
        const newConfig = {
            type: typeSelect.value,
            startDate: parseInt(startDateInput.value),
            endDate: parseInt(endDateInput.value),
            scope: scopeSelect.value,
            // rootPersonId: scopeSelect.value !== 'all' ? rootPersonSelect.value : null
            rootPersonId: scopeSelect.value !== 'all' ? finalRootPersonSelect.value : null
        };

        // Mettre à jour le titre
        updateTitleText(titleElement, newConfig);

        // Nettoyer le conteneur
        nameCloudContainer.innerHTML = '';

        // Générer le nuage de mots
        processNamesCloudWithDate(newConfig, nameCloudContainer);


        // Tous les types supportés
        const supportedTypes = ['duree_vie', 'age_procreation', 'age_marriage', 'age_first_child', 'nombre_enfants', 'prenoms', 'noms', 'professions', 'lieux'];

        if (supportedTypes.includes(newConfig.type) && nameCloudState.currentNameData) {
            // Préparer les données statistiques si nécessaire pour les types d'âge
            if (['duree_vie', 'age_procreation', 'age_marriage', 'age_first_child', 'nombre_enfants'].includes(newConfig.type)) {
                ensureStatsExist(nameCloudState.currentNameData);
            }
            
            // Ajouter le bouton des statistiques détaillées avec le type approprié
            // addStatsButton(container, nameCloudState.currentNameData, newConfig.type);
            updateStatsButtons(container, nameCloudState.currentNameData, newConfig.type);
        }

        
    }


    // Ajouter les écouteurs d'événements
    typeSelect.addEventListener('change', generateNameCloud);
    scopeSelect.addEventListener('change', generateNameCloud);
    startDateInput.addEventListener('change', generateNameCloud);
    endDateInput.addEventListener('change', generateNameCloud);
    showButton.addEventListener('click', generateNameCloud);


    // Ajout du bouton de paramètres
    const settingsButton = createSettingsButton();
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
    leftContainer.style.gap = '2px';
    leftContainer.appendChild(typeSelect);
    leftContainer.appendChild(scopeSelect);


    // Placer le bouton paramètres juste sous le typeSelect dans optionsContainer
    // Notez que settingsButton sera positionné en tant qu'élément indépendant
    settingsButton.style.position = 'absolute';
    if (nameCloudState.mobilePhone) 
        settingsButton.style.top = '-4px'; // Ajustez selon la hauteur de votre typeSelect
    else
        settingsButton.style.top = '-3px'; // Ajustez selon la hauteur de votre typeSelect
    settingsButton.style.left = '16px'; // Ajustez selon le positionnement souhaité

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
            rootPersonId: scopeSelect.value !== 'all' ? finalRootPersonSelect.value : null
        };
    
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
        loadingIndicator.style.padding = '20px';
        loadingIndicator.style.borderRadius = '8px';
        loadingIndicator.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        loadingIndicator.style.zIndex = '9999';
        // loadingIndicator.innerHTML = '<p>Génération de la heatmap...</p><progress style="width: 100%;"></progress>';
        loadingIndicator.innerHTML = `<p>${getTranslation('mapGeneration')}</p><progress style="width: 100%;"></progress>`;

        document.body.appendChild(loadingIndicator);
        
        try {

            // Générer les données pour la heatmap
            const heatmapData = await createDataForHeatMap(currentConfig);
            
            // Supprimer l'indicateur de chargement
            document.body.removeChild(loadingIndicator);
            
            // Créer la heatmap interactive
            if (heatmapData && heatmapData.length > 0) {
                // Créer un titre pour la heatmap basé sur la configuration
                let heatmapTitle;
                // if (window.innerWidth < 300) { 
                //     heatmapTitle = `${currentConfig.scope === 'all' ? 'Tous' : 
                //         (currentConfig.scope === 'ancestors' || currentConfig.scope === 'directAncestors') ? 'Ascend.' : 'Descend.'} 
                //         (${currentConfig.startDate}-${currentConfig.endDate})`;
                // } else {
                //     heatmapTitle = `Heatmap - ${currentConfig.scope === 'all' ? 'Tous' : 
                //         (currentConfig.scope === 'ancestors' || currentConfig.scope === 'directAncestors') ? 'Ancêtres' : 'Descendants'} 
                //         (${currentConfig.startDate}-${currentConfig.endDate})`;                    
                // }
                if (window.innerWidth < 300) { 
                    heatmapTitle = `${currentConfig.scope === 'all' ? getTranslation('heatmapTitleTous') : 
                        (currentConfig.scope === 'ancestors' || currentConfig.scope === 'directAncestors') ? getTranslation('heatmapTitleAscend') : getTranslation('heatmapTitleDescend')} 
                        (${currentConfig.startDate}-${currentConfig.endDate})`;
                } else {
                    heatmapTitle = `Heatmap - ${currentConfig.scope === 'all' ? getTranslation('heatmapTitleTous') : 
                        (currentConfig.scope === 'ancestors' || currentConfig.scope === 'directAncestors') ? getTranslation('heatmapTitleAscend') : getTranslation('heatmapTitleDescend')} 
                        (${currentConfig.startDate}-${currentConfig.endDate})`;                    
                }
                
                // Utiliser la fonction pour créer la heatmap
                createImprovedHeatmap(heatmapData, heatmapTitle);
                
                // Attacher les écouteurs pour le rafraîchissement
                // attachFilterListeners();
                
                // Ajouter les écouteurs d'événements aux contrôles
                typeSelect.addEventListener('change', refreshHeatmap);
                scopeSelect.addEventListener('change', refreshHeatmap);
                startDateInput.addEventListener('change', refreshHeatmap);
                endDateInput.addEventListener('change', refreshHeatmap);
                if (finalRootPersonSelect) {
                    finalRootPersonSelect.addEventListener('change', refreshHeatmap);
                }
                
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
        mapButton.style.top = '-5px';
    else
        mapButton.style.top = '-4px';
    mapButton.style.left = '78px'; // Positionner à droite du bouton de paramètres

    // Ajout du bouton à optionsContainer
    optionsContainer.appendChild(mapButton);










    

    const dateContainer = document.createElement('div');
    dateContainer.style.display = 'flex';
    dateContainer.style.gap = '3px';
    dateContainer.appendChild(startDateContainer);
    dateContainer.appendChild(endDateContainer);

    const mainOptionsContainer = document.createElement('div');
    mainOptionsContainer.style.display = 'flex';
    mainOptionsContainer.style.gap = '3px';
    mainOptionsContainer.style.alignItems = 'flex-end';

    mainOptionsContainer.appendChild(leftContainer);
    mainOptionsContainer.appendChild(dateContainer);
    mainOptionsContainer.appendChild(showButton);



    const bottomContainer = document.createElement('div');
    bottomContainer.style.display = 'flex';
    bottomContainer.style.justifyContent = 'flex-start'; // Changé de 'space-between' à 'flex-start'
    bottomContainer.style.alignItems = 'center';
    bottomContainer.style.width = '100%';
    bottomContainer.style.gap = '10px'; 

    bottomContainer.appendChild(mainOptionsContainer);
    bottomContainer.appendChild(rootPersonContainer);

    optionsContainer.appendChild(bottomContainer);
    optionsContainer.appendChild(titleElement);

    container.appendChild(closeButton);
    container.appendChild(nameCloudContainer);
    container.appendChild(optionsContainer);
    modal.appendChild(container);
    document.body.appendChild(modal);



    // Configuration des événements
    setupModalEvents(modal, closeButton, generateNameCloud);
    typeSelect.addEventListener('change', generateNameCloud);
    scopeSelect.addEventListener('change', generateNameCloud);
    showButton.addEventListener('click', generateNameCloud);


    // Générer initialement le nuage de mots
    generateNameCloud();


    // Configurer les écouteurs d'événements pour les changements de taille d'écran
    setupResizeListeners();


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


// Fonction à ajouter dans nameCloudUI.js
function createMapButton() {
    const mapButton = document.createElement('button');
    mapButton.innerHTML = '🌍'; //'🗺️';
    
    // Style de base similaire au bouton de paramètres existant
    mapButton.style.backgroundColor = 'transparent';
    mapButton.style.border = 'none';
    mapButton.style.padding = '0';
    mapButton.style.width = '28px';
    mapButton.style.height = '28px';
    mapButton.style.fontSize = '20px';
    mapButton.style.cursor = 'pointer';
    mapButton.style.display = 'flex';
    mapButton.style.justifyContent = 'center';
    mapButton.style.alignItems = 'center';
    // mapButton.title = 'Afficher la heatmap';
    mapButton.title = getTranslation('titleMap');
    mapButton.style.marginTop = '2px';
    
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