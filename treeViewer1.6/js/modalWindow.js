import { state, calcFontSize, displayGenealogicTree, updateRadarButtonText } from './main.js';
import { historicalFigures } from './historicalData.js';
import { extractYear } from './utils.js';
import { nameCloudState } from './nameCloud.js';
// import { nameCloudState } from './main.js';
import { collectPersonLocations, createLocationMap } from './mapUtils.js';
import { translateOccupation } from './occupations.js';
// import { cleanProfession} from './nameCloudUtils.js';
import { cleanProfession} from './nameCloud.js';
// import { disableFortuneModeWithLever, showQuizMessage, readPersonDetails } from './treeWheelAnimation.js';
import { getDisableFortuneModeWithLever, getShowQuizMessage, getReadPersonDetails } from './main.js';
import { updateTreeModeSelector, updateGenerationSelector } from './mainUI.js';
import { testSpeechSynthesisHealth, addTooltipTransparencyFix } from './treeAnimation.js';
import { makeModalDraggableAndResizable, makeModalInteractive } from './resizableModalUtils.js';
import { debounce, isModalVisible } from './eventHandlers.js';
import { selectVoice } from './voiceSelect.js';


/**
* Affiche une fenêtre modale détaillée pour une personne
* Version améliorée de afficherDetails() avec plus de fonctionnalités et un meilleur formatage
* 
* @param {string} personId - L'identifiant unique de la personne dans state.gedcomData
* 
* Affiche dans des sections distinctes :
* - Identité : Nom complet formaté
* - Naissance : Date et lieu (si disponibles)
* - Décès : Date et lieu (si disponibles)
* - Profession (si disponible)
* - Notes : Formatées avec paragraphes (si disponibles)
* - Sources : Avec liens cliquables pour les URLs (si disponibles)
* - Actions : Bouton pour définir la personne comme racine de l'arbre
* 
* Particularités :
* - Transforme automatiquement les URLs en liens cliquables dans les sources
* - N'affiche que les sections contenant des informations
* - Permet de définir la personne comme nouveau point de départ de l'arbre
* - Utilise un style moderne avec des sections distinctes et colorées
*/


/**
 * Système de traduction pour l'application généalogique
 * Prend en charge le français (fr), l'anglais (en), l'espagnol (es) et le hongrois (hu)
 */
export const translations = {
    'fr': {
      // Interface modale
      'notes': 'Notes',
      'sources': 'Sources',
      'historicalContext': 'Contexte historique',
      'setAsRoot': 'Définir comme racine de l\'arbre',
      'quiz': 'Quiz',
      'readPersonDetails' : 'Lire la fiche',
      'atTimeOf': 'Au moment de ',
      
      // Modificateurs de dates GEDCOM
      'vers': 'vers',
      'avant': 'avant',
      'après': 'après',
      'entre': 'entre',
      'et': 'et',
      'de': 'de',
      'à': 'à',
      'estimé': 'estimé',
      'calculé': 'calculé',
      
      // Mois
      'janvier': 'janvier',
      'février': 'février',
      'mars': 'mars',
      'avril': 'avril',
      'mai': 'mai',
      'juin': 'juin',
      'juillet': 'juillet',
      'août': 'août',
      'septembre': 'septembre',
      'octobre': 'octobre',
      'novembre': 'novembre',
      'décembre': 'décembre'
    },
    'en': {
    // Interface modale
      'notes': 'Notes',
      'sources': 'Sources',
      'historicalContext': 'Historical Context',
      'setAsRoot': 'Set as tree root',
      'quiz': 'Quiz',
      'readPersonDetails' : 'Read details',
      'atTimeOf': 'At time of ',
      
      // Modificateurs de dates GEDCOM
      'vers': 'about',
      'avant': 'before',
      'après': 'after',
      'entre': 'between',
      'et': 'and',
      'de': 'from',
      'à': 'to',
      'estimé': 'estimated',
      'calculé': 'calculated',
      
      // Mois
      'janvier': 'January',
      'février': 'February',
      'mars': 'March',
      'avril': 'April',
      'mai': 'May',
      'juin': 'June',
      'juillet': 'July',
      'août': 'August',
      'septembre': 'September',
      'octobre': 'October',
      'novembre': 'November',
      'décembre': 'December'
    },
    'es': {
      // Interface modale
      'notes': 'Notas',
      'sources': 'Fuentes',
      'historicalContext': 'Contexto histórico',
      'setAsRoot': 'Establecer como raíz del árbol',
      'quiz': 'Cuestionario',
      'readPersonDetails' : 'Leer detalles',
      'atTimeOf': 'En el momento del ',
      
      // Modificateurs de dates GEDCOM
      'vers': 'aproximadamente',
      'avant': 'antes de',
      'après': 'después de',
      'entre': 'entre',
      'et': 'y',
      'de': 'desde',
      'à': 'hasta',
      'estimé': 'estimado',
      'calculé': 'calculado',
      
      // Mois
      'janvier': 'enero',
      'février': 'febrero',
      'mars': 'marzo',
      'avril': 'abril',
      'mai': 'mayo',
      'juin': 'junio',
      'juillet': 'julio',
      'août': 'agosto',
      'septembre': 'septiembre',
      'octobre': 'octubre',
      'novembre': 'noviembre',
      'décembre': 'diciembre'
    },
    'hu': {
      // Interface modale
      'notes': 'Jegyzetek',
      'sources': 'Források',
      'historicalContext': 'Történelmi környezet',
      'setAsRoot': 'Beállítás a fa gyökereként',
      'quiz': 'Kvíz',
      'readPersonDetails' : 'Részletek olvasása',
      'atTimeOf': 'abban az időben ',
      
      // Modificateurs de dates GEDCOM
      'vers': 'körül',
      'avant': 'előtt',
      'après': 'után',
      'entre': 'között',
      'et': 'és',
      'de': 'tól',
      'à': 'ig',
      'estimé': 'becsült',
      'calculé': 'számított',
      
      // Mois
      'janvier': 'január',
      'février': 'február',
      'mars': 'március',
      'avril': 'április',
      'mai': 'május',
      'juin': 'június',
      'juillet': 'július',
      'août': 'augusztus',
      'septembre': 'szeptember',
      'octobre': 'október',
      'novembre': 'november',
      'décembre': 'december'
    }
  };
  
  /**
   * Fonction pour obtenir une traduction
   * @param {string} key - Clé de traduction
   * @returns {string} - Texte traduit
   */
  export function translate(key) {
    // Récupérer la langue actuelle (avec français comme fallback)
    const currentLang = window.CURRENT_LANGUAGE || 'fr';
    
    // Retourner la traduction ou la clé elle-même si non trouvée
    return translations[currentLang]?.[key] || translations['fr'][key] || key;
  }
  
  /**
   * Formate une date GEDCOM selon la langue actuelle
   * @param {string} dateStr - Date au format GEDCOM
   * @returns {string} - Date formatée selon la langue actuelle
   */
  export function formatGedcomDate(dateStr) {

    // console.log("0- formatGedcomDate dateStr :", dateStr);
    if (!dateStr) return '';
    
    // Récupérer la langue actuelle
    const currentLang = window.CURRENT_LANGUAGE || 'fr';
    
    // Carte de conversion des préfixes GEDCOM selon la langue
    const prefixMap = {
      'ABT': translate('vers'),
      'ABOUT': translate('vers'),
      'BEF': translate('avant'),
      'BEFORE': translate('avant'),
      'AFT': translate('après'),
      'AFTER': translate('après'),
      'BET': translate('entre'),
      'BETWEEN': translate('entre'),
      'AND': translate('et'),
      'FROM': translate('de'),
      'TO': translate('à'),
      'EST': translate('estimé'),
      'ESTIMATED': translate('estimé'),
      'CAL': translate('calculé'),
      'CALCULATED': translate('calculé')
    };
    
    // Table de conversion des mois anglais vers la langue courante
    const monthsMap = {
      'JAN': translate('janvier'),
      'FEB': translate('février'),
      'MAR': translate('mars'),
      'APR': translate('avril'),
      'MAY': translate('mai'),
      'JUN': translate('juin'),
      'JUL': translate('juillet'),
      'AUG': translate('août'),
      'SEP': translate('septembre'),
      'OCT': translate('octobre'),
      'NOV': translate('novembre'),
      'DEC': translate('décembre')
    };
    
    // Remplacer les préfixes
    let formattedDate = dateStr;

    

    // Remplacer les mois en anglais par leurs équivalents traduits

    // Remplacer D'abord les mois (pour éviter d'écraser des lettres dans les préfixes comme "AFT" → "après")
    Object.entries(monthsMap).forEach(([englishMonth, translatedMonth]) => {
      const regExp = new RegExp(`\\b${englishMonth}\\b`, 'gi');
      formattedDate = formattedDate.replace(regExp, translatedMonth);
    });

    // console.log("1- formatGedcomDate dateStr :", formattedDate);



    // Ensuite traiter les préfixes
    Object.entries(prefixMap).forEach(([gedcomPrefix, translatedPrefix]) => {
      const regExp = new RegExp(`^${gedcomPrefix}\\s+`, 'i');
      formattedDate = formattedDate.replace(regExp, `${translatedPrefix} `);
    });

    // console.log("2- formatGedcomDate dateStr :", formattedDate);
    
    // Remplacer "AND" à l'intérieur de la chaîne (pour les périodes "BETWEEN x AND y")
    formattedDate = formattedDate.replace(/\sAND\s/i, ` ${translate('et')} `);

    // console.log("3- formatGedcomDate dateStr :", formattedDate);


    
    return formattedDate;
  }
  
  /**
   * Traite un lieu pour supprimer le nom du pays à la fin
   * @param {string} place - Le lieu à traiter
   * @returns {string} - Le lieu sans le pays à la fin
   */
  export function cleanupPlace(place) {
    if (!place) return '';
    
    // Récupérer la langue actuelle
    const currentLang = window.CURRENT_LANGUAGE || 'fr';
    
    // Pays à supprimer selon la langue
    const countryNames = {
      'fr': ['France', 'FRANCE', 'france'],
      'en': ['United States', 'USA', 'U.S.A.', 'United Kingdom', 'UK', 'U.K.'],
      'es': ['España', 'ESPAÑA', 'españa'],
      'hu': ['Magyarország', 'MAGYARORSZÁG', 'magyarország']
    };
    
    // Obtenir la liste des pays pour la langue actuelle
    const countries = countryNames[currentLang] || countryNames['fr'];
    
    // Créer un pattern pour supprimer tous les pays de la liste
    const pattern = new RegExp(`,\\s*(${countries.join('|')})$`, 'i');
    
    // Supprimer le pays à la fin
    return place.replace(pattern, '');
  }

let prevTop = 0;
let prevLeft = 0;
/********************************** */  
export function displayPersonDetails(personId) {

    const person = state.gedcomData.individuals[personId];
    if (!person) return;

    window.displayedLocationNames = new Set();
    addTooltipTransparencyFix();

    console.log("- displayPersonDetails ", personId, person.name)
    
    state.showPersonListModalCounter++;   
    
    const existingModal = document.getElementById('person-fullDetails-modal');
    if (existingModal) {
        const style = window.getComputedStyle(existingModal);
        prevTop = parseInt(style.top, 10);
        prevLeft = parseInt(style.left, 10);
        document.body.removeChild(existingModal); 
    } else {
        prevTop = 0;
        prevLeft = 0;
    }

    // Création du modal
    const modal = document.createElement('div');

    modal.id = 'person-fullDetails-modal';
    window.personDetailsModal = modal;

    modal.className = `person-fullDetails-modal`;

    modal.style.position = 'fixed';

    modal.style.backgroundColor = 'white';
    modal.style.padding = '0px '+4*state.scaleChrome+'px';    
    modal.style.borderRadius = 8*state.scaleChrome+'px';
    modal.style.boxShadow = '0 '+4*state.scaleChrome+'px ' +20*state.scaleChrome+'px rgba(0, 0, 0, 0.2)';
    modal.style.zIndex = state.topZindex;

    modal.style.minWidth = state.minModalWidth*state.scaleChrome + 'px';
    modal.style.maxWidth = (state.innerWidth-30)*state.scaleChrome + 'px';


    modal.style.minHeight = state.minModalHeight*state.scaleChrome + 'px';
    modal.style.overflow = 'auto';

    modal.style.display = "flex";           // Pour que l'ascenseur s'adapte automatiquement à la hauteur de la modal quand on resize
    modal.style.flexDirection = "column";   // Pour que l'ascenseur s'adapte automatiquement à la hauteur de la modal quand on resize 
    
    // En-tête du modal
    const header = document.createElement('div');

    // const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.borderBottom = 1*state.scaleChrome+'px solid #eee';
    // Nouvelles propriétés pour rendre l'en-tête sticky
    header.style.position = 'sticky';
    header.style.top = '0';
    header.style.backgroundColor = '#EBF8FF'; //'white';
    header.style.zIndex = '1101';
    header.style.paddingTop = 3*state.scaleChrome+'px';
    header.style.paddingBottom = '0px';
    header.style.width = '100%';

    // Ajuster la marge pour éviter le déplacement du contenu
    header.style.marginBottom = '0px';
    header.style.marginLeft = -20*state.scaleChrome+'px';  // Compenser le padding du modal
    header.style.marginRight = -20*state.scaleChrome+'px'; // Compenser le padding du modal
    header.style.paddingLeft = 20*state.scaleChrome+'px';  // Restaurer le padding pour l'alignement
    header.style.paddingRight = 20*state.scaleChrome +'px'; // Restaurer le padding pour l'alignement

    // Container pour titre
    const titleContainer = document.createElement('div');

    titleContainer.style.display = 'flex';
    titleContainer.style.alignItems = 'center';
    titleContainer.style.gap = 5*state.scaleChrome+'px 0px';
    titleContainer.style.marginLeft = 5*state.scaleChrome +'px';

    const title = document.createElement('h2');
    title.id = 'person-fullDetails-modal-title';
    // Set the name in the modal header (with reduced size)
    title.textContent = person.name.replace(/\//g, '');
    title.style.margin = '0';
    title.style.fontSize = nameCloudState.mobilePhone ? calcFontSize(13)+'px' : calcFontSize(18)+'px';

    titleContainer.appendChild(title);

    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = calcFontSize(28)+'px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.padding = 2*state.scaleChrome+'px '+10*state.scaleChrome+'px';
    closeButton.style.marginRight = 10*state.scaleChrome+'px';

    // style hover via JS
    closeButton.addEventListener('mouseenter', () => {
        closeButton.style.background = 'rgba(128, 128, 128, 0.5)';
        closeButton.style.borderRadius = '50%';
    });
    closeButton.addEventListener('mouseleave', () => {
        closeButton.style.background = 'none';
        closeButton.style.borderRadius = '0';
    });

    closeButton.onclick = () => {
        document.body.removeChild(modal);
        document.body.removeChild(overlay);
    };

    header.appendChild(titleContainer);
    header.appendChild(closeButton);

    modal.appendChild(header);

    const innerContent = document.createElement('div');
    innerContent.id = 'person-details-content';


    const sectionStyle = `
    <style>
    /* Style unifié pour le modal */
        .details-section {
            margin-bottom: ${6*state.scaleChrome}px;
            padding: ${6*state.scaleChrome}px;
            border-radius: ${6*state.scaleChrome}px;
            font-size: ${nameCloudState && nameCloudState.mobilePhone ? `${calcFontSize(11)}px` : `${calcFontSize(13)}px`};
            background-color: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(${3*state.scaleChrome}px);
        }
        .details-icon {
            font-size: ${nameCloudState && nameCloudState.mobilePhone ? '1.2em' : '1.6em'};
            /*vertical-align: middle;*/
            margin-right: ${4*state.scaleChrome}px;
            margin-top: ${-8*state.scaleChrome}px;
            padding-top: 0px;
        }
        .details-value {
            display: inline-block;
        }

        .details-section.gedcomID { background-color: #E8F5E9; 
            padding: ${1*state.scaleChrome}px ${6*state.scaleChrome}px !important;     /* Padding réduit */
            margin: ${3*state.scaleChrome}px !important;            /* réduit les marges */
            margin-top: ${-5*state.scaleChrome}px !important;
            margin-bottom: ${4*state.scaleChrome}px !important;
        }
        .details-section.occupation { background-color:  #F8BBD0;
            padding: ${1*state.scaleChrome}px ${6*state.scaleChrome}px !important;     /* Padding réduit */
            margin: ${3*state.scaleChrome}px !important;            /* réduit les marges */

        }
        .details-section.birth { background-color: #E3F2FD;
            padding: ${1*state.scaleChrome}px ${6*state.scaleChrome}px !important;     /* Padding réduit */
            margin: ${1*state.scaleChrome}px !important;            /* réduit les marges */        
        }
        .details-section.death { background-color: #EFEBE9; 
            padding: ${1*state.scaleChrome}px ${6*state.scaleChrome}px !important;     /* Padding réduit */
            margin: ${3*state.scaleChrome}px !important;            /* réduit les marges */        
        }
        .details-section.marriage { background-color: #F8BBD0; 
            padding: ${1*state.scaleChrome}px ${6*state.scaleChrome}px !important;     /* Padding réduit */
            margin: ${3*state.scaleChrome}px !important;            /* réduit les marges */        
        }
        .details-section.residence { background-color: #E8F5E9; 
            padding: ${1*state.scaleChrome}px ${6*state.scaleChrome}px !important;     /* Padding réduit */
            margin: ${3*state.scaleChrome}px !important;            /* réduit les marges */
        }
        .details-section.notes { background-color: #FFF8E1;
            padding: ${1*state.scaleChrome}px ${6*state.scaleChrome}px !important;     /* Padding réduit */
            margin: ${3*state.scaleChrome}px !important;            /* réduit les marges */        
        }
        .details-section.sources { background-color: #F3E5F5; 
            padding: 1px ${6*state.scaleChrome}px !important;     /* Padding réduit */
            margin: 3px !important;            /* réduit les marges */
            font-size: ${calcFontSize(13)}px; 
        }
        .details-section.context { background-color: #E0F2F1; 
            padding: ${1*state.scaleChrome}px ${6*state.scaleChrome}px !important;     /* Padding réduit */
            margin: ${3*state.scaleChrome}px !important;            /* réduit les marges */
        }
        .details-section.actions { background-color: #ECEFF1; text-align: center; }

        .action-btn {
            color: white;
            border: none;
            padding: ${4*state.scaleChrome}px ${8*state.scaleChrome}px;
            border-radius: ${4*state.scaleChrome}px;
            cursor: pointer;
            font-size: ${calcFontSize(11)}px;
            margin: ${2*state.scaleChrome}px ${2*state.scaleChrome}px 0 0;
            flex: 1;
            min-width: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .btn-blue { background-color: #4361ee; flex: 2.3; }
        .btn-orange { background-color: #ff8500; flex: 0.4; }
        .btn-purple { background-color: #8e44ad; }

        .details-section.actions {
            min-height: 0 !important;
            height: auto !important;
            padding: ${2*state.scaleChrome}px !important;
            margin-bottom: ${2*state.scaleChrome}px !important;
            margin-top: 0px !important;
            gap: ${2*state.scaleChrome}px !important;
            display: flex;
            align-items: center; /* centre verticalement */
        }

        .sources-link {
            color: #3f51b5;
            text-decoration: underline;
            font-size: 80%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            display: inline-block;
            max-width: 100%;
        }
        
        /* Ajustements spécifiques pour les petits écrans */
        @media (max-height: 400px) {
            #multi-location-map {
                height: ${200*state.scaleChrome}px !important; /* Réduire la hauteur de la carte */
            }
        }
    </style>
    `;

    // Nettoyer l'ID en retirant les @ s'ils existent
    const cleanId = personId.replace(/@/g, '');



    // Préparer le contenu HTML
    let detailsHTML = sectionStyle;

    if (true) {
        // Ajouter 3 boutons: 1 pour définir comme racine de l'arbre, 1 pour le quiz, 1 pour lire la fiche
        detailsHTML += `
        <div class="details-section actions">
            <button onclick="setAsRootPerson('${personId}')" class="action-btn btn-blue">
                ${translate('setAsRoot')}
            </button>
            <button onclick="startQuiz('${personId}')" class="action-btn btn-orange">
                ${translate('quiz')}
            </button>
            <button onclick="readPersonSheet('${personId}')" class="action-btn btn-purple">
                🗣️${translate('readPersonDetails')}
            </button>
        </div>
        `;

        // Identifiant GEDCOM
        detailsHTML += `
            <div class="details-section gedcomID">
                <small>ID GEDCOM: ${cleanId}</small>
            </div>
        `;

        // Profession (si existante)
        if (person.occupationFull) {
            const cleanedProfessions = cleanProfession(person.occupationFull);

            cleanedProfessions.forEach(prof => {
                if (prof) {
                    // console.log("Profession à traduire :", prof);
                    detailsHTML += `
                    <div class="details-section occupation">
                        <span class="details-icon">💼</span>
                        <span class="details-value">${translateOccupation(prof, window.CURRENT_LANGUAGE || 'fr')}</span>
                    </div>
                `;
                }
            });
        }

        // Naissance (si date ou lieu existants)
        if (person.birthDate || person.birthPlace) {
            detailsHTML += `
                <div class="details-section birth">
                    <span class="details-icon">👶</span>
                    ${person.birthDate ? `<span class="details-value">${formatGedcomDate(person.birthDate)}</span>` : ''}
                    ${person.birthDate && person.birthPlace ? '<br>' : ''}
                    ${person.birthPlace ? `<span class="details-value">${cleanupPlace(person.birthPlace)}</span>` : ''}
                </div>
            `;
        }

        // Mariage (si date ou lieu existants)
        if (person.spouseFamilies && person.spouseFamilies.length > 0) {
            const marriageFamily = state.gedcomData.families[person.spouseFamilies[0]];
            if (marriageFamily && (marriageFamily.marriageDate || marriageFamily.marriagePlace)) {
                detailsHTML += `
                    <div class="details-section marriage">
                        <span class="details-icon">💍</span>
                        ${marriageFamily.marriageDate ? `<span class="details-value">${formatGedcomDate(marriageFamily.marriageDate)}</span>` : ''}
                        ${marriageFamily.marriageDate && marriageFamily.marriagePlace ? '<br>' : ''}
                        ${marriageFamily.marriagePlace ? `<span class="details-value">${cleanupPlace(marriageFamily.marriagePlace)}</span>` : ''}
                    </div>
                `;
            }
        }

        // Décès (si date ou lieu existants)
        if (person.deathDate || person.deathPlace) {
            detailsHTML += `
                <div class="details-section death">
                    <span class="details-icon">✝️</span>
                    ${person.deathDate ? `<span class="details-value">${formatGedcomDate(person.deathDate)}</span>` : ''}
                    ${person.deathDate && person.deathPlace ? '<br>' : ''}
                    ${person.deathPlace ? `<span class="details-value">${cleanupPlace(person.deathPlace)}</span>` : ''}
                </div>
            `;
        }

        // Résidences (regroupées dans une seule section)
        const residences = [];
        if (person.residPlace1 || person.residDate1) residences.push({ place: person.residPlace1, date: person.residDate1 });
        if (person.residPlace2 || person.residDate2) residences.push({ place: person.residPlace2, date: person.residDate2 });
        if (person.residPlace3 || person.residDate3) residences.push({ place: person.residPlace3, date: person.residDate3 });

        if (residences.length > 0) {
            detailsHTML += `<div class="details-section residence"><span class="details-icon">🏠</span>`;
            residences.forEach((residence, index) => {
                if (residence.date || residence.place) {
                    detailsHTML += `
                        ${index > 0 ? `<hr style="border-top: ${1*state.scaleChrome}px dashed #aaa; margin: ${2*state.scaleChrome}px 0;">` : ''}
                        ${residence.date ? `<span class="details-value">${formatGedcomDate(residence.date)}</span>` : ''}
                        ${residence.date && residence.place ? '<br>' : ''}
                        ${residence.place ? `<span class="details-value">${cleanupPlace(residence.place)}</span>` : ''}
                    `;
                }
            });
            detailsHTML += `</div>`;
        }

        // Notes (si disponibles)
        if ((person.notes && person.notes.length > 0) || person.givn || person.surn ) {
            
            let validNotes;
            if (person.notes && person.notes.length > 0) {
                validNotes = person.notes
                    .map(noteRef => {
                        const note = state.gedcomData.notes[noteRef];
                        return note && note.text && note.text.trim() !== '' ? note.text.trim() : null;
                    })
                    .filter(note => note !== null);
            } else {
                validNotes = [''];
            }

            let noteTextInit = '';
            if (person.givn && person.givn !='') {
                noteTextInit = person.givn; 
            }
            if (person.surn && person.surn !='') {
                noteTextInit = noteTextInit + ' ' + person.surn ; 
            }
            if ((person.givn && person.givn !='') || (person.surn && person.surn !='')) {
                noteTextInit = noteTextInit + ', '; 
            }

        
            if (validNotes.length > 0) {
                detailsHTML += `
                    <div class="details-section notes">
                        <small>
                            ${validNotes.map((noteText, idx) => 
                                idx === 0 
                                    ? `${noteTextInit}${noteText}. ` // Ajoute ton texte à la première note
                                    : `${noteText}. `
                            ).join('')}
                        </small>
                    </div>
                `;
            }
        }

        // Sources (si disponibles, format compact)
        if (person.sources && person.sources.length > 0) {
            const validSources = person.sources
                .map(sourceRef => {
                    const source = state.gedcomData.sources[sourceRef];
                    return source && source.text && source.text.trim() !== '' ? source.text.trim() : null;
                })
                .filter(source => source !== null);

            if (validSources.length > 0) {
                detailsHTML += `
                    <div class="details-section sources">
                        <span class="details-label">${translate('sources')} :</span>
                        ${validSources.map(sourceText => `<div class="sources-link">${extractAndLinkUrls(sourceText)}</div>`).join('')}
                    </div>
                `;
            }
        }

        // Contexte historique (format condensé)
        const historicalContext = findContextualHistoricalFigures(personId);
        if (historicalContext) {
            let contextHTML = '<div class="details-section context">';
            // contextHTML += '<small>Contexte historique :</small><br>';
            contextHTML += `<small>${translate('historicalContext')} :</small><br>`;
            
            // Fonction pour formater chaque contexte de manière compacte avec emoji
            const formatContext = (context, eventEmoji) => {
                if (!context) return '';
                
                let result = '';
                if (context.governmentType || (context.rulers && context.rulers.length > 0)) {
                    result += `<small><b>${translate('atTimeOf')} ${eventEmoji}:</b> `;
                    
                    // Ajouter les dirigeants
                    if (context.rulers && context.rulers.length > 0) {
                        const rulerNames = context.rulers.map(ruler => 
                            `${ruler.name} (${ruler.type})`
                        ).join(', ');
                        result += rulerNames;
                    }
                    
                    // Ajouter le type de gouvernement
                    if (context.governmentType) {
                        if (context.rulers && context.rulers.length > 0) result += ' - ';
                        result += context.governmentType.type;
                    }
                    
                    result += '</small><br>';
                }
                return result;
            };
            
            // Ajouter chaque contexte avec emoji correspondant
            contextHTML += formatContext(historicalContext.birthContext, '👶');
            contextHTML += formatContext(historicalContext.marriageContext, '💍');
            contextHTML += formatContext(historicalContext.deathContext, '✝️');
            
            contextHTML += '</div>';
            
            if (contextHTML.includes('<b>')) { // Vérifier qu'il y a du contenu
                detailsHTML += contextHTML;
            }
        }
    }

    innerContent.innerHTML = detailsHTML;

    // Créer la carte avec un petit délai pour assurer que le DOM est prêt
    setTimeout(() => {
        displayEnhancedLocationMap(personId);
        requestAnimationFrame(() => {
            modal.style.height = 'auto';
        });
    }, 150);


    modal.appendChild(innerContent);

    // Styles pour webkit (Chrome, Safari) POUR LE SCROLLBAR ***************************
    const style = document.createElement('style');
    style.textContent = `
        .person-fullDetails-modal div::-webkit-scrollbar {
            width: ${20*state.scaleChrome}px !important;
        }
        .person-fullDetails-modal div::-webkit-scrollbar-track {
            background: #80f0f044; /* Couleur de fond du track  */
            border-radius: ${6*state.scaleChrome}px;
        }
        .person-fullDetails-modal div::-webkit-scrollbar-thumb {
            background: #3182ce; /* Couleur du curseur  */
            border-radius: ${6*state.scaleChrome}px;
            border: ${2*state.scaleChrome}px solid #f0f0f0; /* Bordure du curseur */
            min-height: ${50*state.scaleChrome}px;  /* Hauteur minimum du curseur  */
        }
        .person-fullDetails-modal div::-webkit-scrollbar-thumb:hover {
            background: #2c5aa0; /* Couleur au survol */
        }

        /* Bouton du haut */
        .person-fullDetails-modal div::-webkit-scrollbar-button:single-button:vertical:decrement {
            background: #3182ce;
            height: ${20*state.scaleChrome}px;
            display: block;
            background-image: url("data:image/svg+xml;utf8,<svg fill='white' xmlns='http://www.w3.org/2000/svg' width='10' height='10'><polygon points='0,10 5,0 10,10'/></svg>");
            background-repeat: no-repeat;
            background-position: center;
            border-radius: ${6*state.scaleChrome}px ${6*state.scaleChrome}px 0 0;
        }

        /* Bouton du bas */
        .person-fullDetails-modal div::-webkit-scrollbar-button:single-button:vertical:increment {
            background: #3182ce;
            height: ${20*state.scaleChrome}px;
            display: block;
            background-image: url("data:image/svg+xml;utf8,<svg fill='white' xmlns='http://www.w3.org/2000/svg' width='10' height='10'><polygon points='0,0 5,10 10,0'/></svg>");
            background-repeat: no-repeat;
            background-position: center;
            border-radius: 0 0 ${6*state.scaleChrome}px ${6*state.scaleChrome}px;
        }
    `;
    document.head.appendChild(style);

    // FORCER l'application après le CSS tactile du resizableModalUtils.js dans la function makeModalDraggableAndResizable(modal, handle)
    // car le makeModalDraggableAndResizable rendait le scrollbar invisible
    setTimeout(() => {
        const forceStyle = document.createElement('style');
        forceStyle.textContent = `
            .person-fullDetails-modal div {
                scrollbar-width: unset !important;
            }
        `;
        document.head.appendChild(forceStyle);
    }, 0);

    // Création d'un overlay pour l'arrière-plan
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'transparent'; // Arrière-plan transparent
    overlay.style.zIndex = '1049'; // Juste sous la modale
    overlay.style.pointerEvents = 'none'; // Laisser passer les clics vers l'arrière-plan

    // Ajouter un moyen de fermer la modale seulement avec le bouton de fermeture
    closeButton.onclick = () => {
        if (document.body.contains(modal)) document.body.removeChild(modal);
        if (document.body.contains(overlay)) document.body.removeChild(overlay);
    };

    // Ajout au DOM
    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    // Header fixe
    header.style.flex = '0 0 auto';

    // Mettre le scroll SUR innerContent (meilleur et plus sûr)
    innerContent.style.flex = '1 1 auto';
    innerContent.style.minHeight = '0';        // <<< CRUCIAL pour permettre le scroll dans un flex child
    innerContent.style.overflowY = 'auto';
    innerContent.style.overflowX = 'hidden';
    innerContent.style.paddingRight = '0';

    // Si le resizable/drag util réécrit tout, forcer avec !important
    innerContent.style.setProperty('overflow-y', 'auto', 'important');

    window.addEventListener('resize', debounce(() => {
        if(isModalVisible(modal.id)) {
            console.log('\n\n*** debug resize ou resize in displayPersonDetails in modalWindow.js  for adjustModalOnResize', modal.id, modal.style.display, modal.offsetParent, '\n\n');        
            adjustModalOnResize(modal, innerContent);
        }
    }, 150)); // Attend 150ms après le dernier resize

    let topLocal = 40;


    let innerContentHeight = innerContent.offsetHeight + 60;
    if (collectPersonLocations(person, state.gedcomData.families).length > 0) {
        innerContentHeight = innerContentHeight + ((state.innerHeight < 400) ? 180 : 200) ;
    }
    console.log('\n\n -debug innerContent.offsetHeight ', innerContentHeight);


    let scaleChrome = state.scaleChrome;
    if (state.scaleChrome < 0.95) {scaleChrome = scaleChrome * 1.3;}

    if (prevTop === 0 && prevLeft === 0) {
        modal.style.top = topLocal*state.scaleChrome + 'px'; 
        modal.style.left = '50%';
        modal.style.transform = 'translateX(-50%)';
        // modal.style.maxWidth = '440px';
        modal.style.maxWidth = 440*state.scaleChrome +'px'; 
        modal.style.maxHeight = (innerContentHeight + 35)*scaleChrome +'px';
        // modal.style.width = Math.min(440, window.innerWidth - 35) + 'px';
        modal.style.width = Math.min(440*state.scaleChrome , (state.innerWidth - 35)*state.scaleChrome) + 'px';

        // innerContent.style.maxWidth = 440  +'px';
        innerContent.style.maxWidth = 440*state.scaleChrome  +'px';
        
        innerContent.style.maxHeight = (state.innerHeight - 80)*scaleChrome +'px'; // ratioHeight +'vh';
    } else {
        modal.style.top = prevTop*state.scaleChrome +'px';
        modal.style.left = prevLeft*state.scaleChrome +'px';
        // modal.style.maxWidth = '440px';
        modal.style.maxWidth = 440*state.scaleChrome +'px'; 
        modal.style.maxHeight = (innerContentHeight + 35)*scaleChrome +'px';        
        // modal.style.width = Math.min(440, window.innerWidth - prevLeft - 17) + 'px';
        modal.style.width = Math.min(440*state.scaleChrome , (state.innerWidth - 17)*state.scaleChrome) + 'px';

        // innerContent.style.maxWidth = Math.min(440, window.innerWidth - prevLeft) +'px';
        innerContent.style.maxWidth = Math.min(440*state.scaleChrome , (state.innerWidth - prevLeft)*state.scaleChrome) +'px';
        innerContent.style.maxHeight = Math.min((state.innerHeight - 80)*scaleChrome , (state.innerHeight - 40 - prevTop)*scaleChrome) +'px'; // ratioHeight +'vh';
    } 

    // Rendre la modale déplaçable et redimensionnable
    makeModalDraggableAndResizable(modal, header);

    makeModalInteractive(modal);

}

function adjustModalOnResize(modal, innerContent) {
    setTimeout(() => {
        const styleNew = window.getComputedStyle(modal);
        prevTop = parseInt(styleNew.top, 10);
        prevLeft = parseInt(styleNew.left, 10);

        console.log("\n\n\n - adjustModalOnResize HxW, Top x Left=", window.innerHeight, window.innerWidth, prevTop, prevLeft, state.innerHeight, state.innerWidth)
        // prevTop = Math.min(window.innerHeight - 150, prevTop );
        // prevLeft = Math.min(window.innerWidth - 150, prevLeft );
        // if (state.innerWidth < 400) { prevLeft = 10;} // forcer à gauche si trop petit

        prevTop = Math.min((state.innerHeight - 150), prevTop );
        prevLeft = Math.min((state.innerWidth - 150), prevLeft );
        if (state.innerWidth < 400) { prevLeft = 10;} // forcer à gauche si trop petit


        modal.style.top = prevTop*scaleChrome +'px';
        modal.style.left = prevLeft*scaleChrome +'px';
        // modal.style.width = Math.min(440, window.innerWidth - prevLeft -17) + 'px';

        // innerContent.style.maxWidth = Math.min(440, window.innerWidth - prevLeft -10 ) +'px';
        // innerContent.style.maxHeight = Math.min(window.innerHeight -80 , window.innerHeight - 40 - prevTop) +'px'; // ratioHeight +'vh';



        modal.style.width = Math.min(440*state.scaleChrome , (state.innerWidth - 17)*state.scaleChrome) + 'px';

        innerContent.style.maxWidth = Math.min(440*state.scaleChrome , (state.innerWidth - prevLeft - 10)*state.scaleChrome) +'px';
        innerContent.style.maxHeight = Math.min((state.innerHeight - 80)*scaleChrome , (state.innerHeight - 40 - prevTop)*scaleChrome) +'px'; // ratioHeight +'vh';

        console.log("\n\n\n - adjustModalOnResize HxW after , Top x Left=", window.innerHeight, window.innerWidth, prevTop, prevLeft, state.innerHeight, state.innerWidth)



    }, 200); // Augmenter le délai à 300ms pour plus de sécurité
}

async function startQuiz(personId)
{
    const personData = state.gedcomData.individuals[personId];
    const person = [];
    person.id = personData.id;
    person.name = personData.name;
    person.sex = personData.sex;

    if (!state.isVoiceSelected && state.isSpeechEnabled2)
    {
        state.isSpeechInGoodHealth = await testSpeechSynthesisHealth();
        if (state.isSpeechInGoodHealth) {
            // Chrome ou Edge est coopératif
            console.log("✅ La synthèse vocale est prête et fonctionne correctement.");
        } else {
            // Chrome est grognon il faut utiliser une méthode de secours
            console.log("⚠️ La synthèse vocale ne fonctionne pas correctement. Utilisation de la méthode de secours.");
            if (state.isSpeechSynthesisAvailable) {
                window.speechSynthesis.cancel();
            }
        }
        if (state.isSpeechSynthesisAvailable) {
            selectVoice();
            state.isVoiceSelected = true;
        } else {
            state.isVoiceSelected = false;
        }
    }
    const showQuizMessage = await getShowQuizMessage();
    showQuizMessage(person);
}
window.startQuiz = startQuiz; 


export async function readPersonSheet(personId, detectedAction = null) {

    const personData = state.gedcomData.individuals[personId];
    const person = [];
    person.id = personData.id;
    person.name = personData.name;
    person.sex = personData.sex;

    if (!state.isVoiceSelected && state.isSpeechEnabled2)
    {
        state.isSpeechInGoodHealth = await testSpeechSynthesisHealth();
        if (state.isSpeechInGoodHealth) {
            // Chrome ou Edge est coopératif
            console.log("✅ La synthèse vocale est prête et fonctionne correctement.");
        } else {
            // Chrome est grognon il faut utiliser une méthode de secours
            console.log("⚠️ La synthèse vocale ne fonctionne pas correctement. Utilisation de la méthode de secours.");
            if (state.isSpeechSynthesisAvailable) {
                window.speechSynthesis.cancel();
            }
        }
        if (state.isSpeechSynthesisAvailable) {
            // selectVoice();
            state.isVoiceSelected = true;
        } else {
            state.isVoiceSelected = false;
        }
    }
    const readPersonDetails = await getReadPersonDetails();
    await readPersonDetails(person, detectedAction);  
}
window.readPersonSheet = readPersonSheet; 
   

/**
* Transforme les URLs en liens cliquables
* @private
*/
function extractAndLinkUrls(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
        return `<a href="${url}" target="_blank" style="color: #3f51b5; text-decoration: underline; font-size: 90%;">${url}</a>`;
    });
}

/**
 * Ferme la fenêtre modale des détails
 */
export function closePersonDetails() {
    const modal = document.getElementById('person-fullDetails-modal');

    // Nettoyer les observateurs et le conteneur de poignées
    if (modal._modalObserver) {
        modal._modalObserver.disconnect();
        delete modal._modalObserver;
    }
    
    // Nettoyer le conteneur de poignées spécifique à la modale
    if (modal._handleContainer) {
        if (document.body.contains(modal._handleContainer)) {
            document.body.removeChild(modal._handleContainer);
        }
        delete modal._handleContainer;
    }

    // Nettoyer TOUS les conteneurs de poignées par sécurité
    const allHandleContainers = document.querySelectorAll('#resize-handles-container');
    allHandleContainers.forEach(container => {
        if (document.body.contains(container)) {
            document.body.removeChild(container);
        }
    });

    // Nettoyer également toutes les poignées individuelles qui pourraient rester
    const allHandles = document.querySelectorAll('.resize-handle');
    allHandles.forEach(handle => {
        if (handle.parentNode) {
            handle.parentNode.removeChild(handle);
        }
    });

    // Supprimer l'écouteur d'événement resize
    window.removeEventListener('resize', adjustModalOnResize);

    modal.style.display = 'none';
}

/**
 * Ferme la fenêtre modale classique
 */
export function closeModal() {
    document.getElementById('myModal').style.display = "none";
}

/**
 * Définit une personne comme racine de l'arbre
 */
export async function setAsRootPerson(personId) {
    console.log("Définition de la personne comme racine :", personId);
    
    // Fermer la modale
    document.getElementById('person-fullDetails-modal').style.display = 'none';
    
    // Redessiner l'arbre avec cette personne comme point de départ
    console.log('\n\n\n\n ###################   CALL displayGenealogicTree in setAsRootPerson  ################# ')

    if (state.isRadarEnabled) {
            // Basculer l'état du tree/radar
            state.isRadarEnabled = !state.isRadarEnabled;  
            updateRadarButtonText(); 
            state.treeModeReal = 'ancestors';
            state.treeMode = 'ancestors';
            updateTreeModeSelector(state.treeMode);
            state.nombre_generation = 4; // Réinitialiser à 4 générations
            updateGenerationSelector(state.nombre_generation)
            const disableFortuneModeWithLever = await getDisableFortuneModeWithLever();
            disableFortuneModeWithLever();
            // displayGenealogicTree(winner.id, false, false, false, 'Ancestors');
    }

    displayGenealogicTree(personId, true);

}

export function findContextualHistoricalFigures(personId) {
    const person = state.gedcomData.individuals[personId];
    
    if (!person) return null;

    const context = {
        birthContext: null,
        marriageContext: null,
        deathContext: null
    };

    // Contexte à la naissance
    if (person.birthDate) {
        const birthYear = extractYear(person.birthDate);
        if (birthYear) {
            context.birthContext = historicalFigures.findRulersForYear(birthYear);
        }
    }

    // Contexte au mariage
    if (person.spouseFamilies && person.spouseFamilies.length > 0) {
        const marriageYears = person.spouseFamilies
            .map(familyId => {
                const family = state.gedcomData.families[familyId];
                return family && family.marriageDate ? extractYear(family.marriageDate) : null;
            })
            .filter(year => year !== null);

        if (marriageYears.length > 0) {
            // Prendre la première année de mariage
            context.marriageContext = historicalFigures.findRulersForYear(marriageYears[0]);
        }
    }

    // Contexte au décès
    if (person.deathDate) {
        const deathYear = extractYear(person.deathDate);
        if (deathYear) {
            context.deathContext = historicalFigures.findRulersForYear(deathYear);
        }
    }

    return context;
}

function displayEnhancedLocationMap(personId) {
    const person = state.gedcomData.individuals[personId];
    if (!person) return;

    // Collecter les lieux avec la fonction centralisée
    const locations = collectPersonLocations(person, state.gedcomData.families);

    // Créer la carte si des lieux sont disponibles
    if (locations.length > 0) {
        createEnhancedLocationMap(locations);
    }
}

function createEnhancedLocationMap(locations) {
    // Créer un conteneur pour la carte
    const mapContainer = document.createElement('div');
    mapContainer.id = 'multi-location-map';
    
    // Ajuster la hauteur selon la taille d'écran
    // const mapHeight = window.innerHeight < 400 ? '200px' : '260px';
    const mapHeight = state.innerHeight < 400 ? 180*state.scaleChrome +'px' : 200*state.scaleChrome +'px';
    mapContainer.style.height = mapHeight;
    
    mapContainer.style.width = '100%';
    mapContainer.style.borderRadius = 6*state.scaleChrome+'px';
    mapContainer.style.overflow = 'hidden';
    mapContainer.style.boxShadow = '0 '+1*state.scaleChrome+'px '+3*state.scaleChrome+'px rgba(0,0,0,0.12)';
    mapContainer.style.marginBottom = 8*state.scaleChrome+'px';
    
    // Ajouter une classe pour identifier les cartes sur petits écrans
    if (state.innerHeight < 400) {
        mapContainer.classList.add('small-screen-map');
    }

    // Ajouter le conteneur à la modale
    const detailsContent = document.getElementById('person-details-content');

    const actionsSection = detailsContent.querySelector('.details-section.actions');
    if (actionsSection && actionsSection.nextSibling) {
        detailsContent.insertBefore(mapContainer, actionsSection.nextSibling);
    } else if (actionsSection) {
        detailsContent.appendChild(mapContainer);
    } else {
        detailsContent.appendChild(mapContainer); // fallback si la section n'existe pas
    }

    // // Utiliser la fonction centralisée pour créer la carte
    createLocationMap('multi-location-map', locations, {
        maxZoom: 9,
        zoomControl: false,
        attribution: false,
        useLocalTiles: true 
    });
}
