import { state, showToast } from './main.js';
import { nameCloudState, getPersonsFromTree } from './nameCloud.js';
// import { nameCloudState, getPersonsFromTree } from './main.js';
// import { hasDateInRange, cleanProfession, cleanLocation, cleanProfessionForNameCloud, extractYear  } from './nameCloudUtils.js';
import { hasDateInRange, cleanProfession, cleanLocation, cleanProfessionForNameCloud, extractYear  } from './nameCloud.js';

import { createStatsModal, createFrequencyStatsModal }  from './nameCloudStatModal.js';
import { showCenturyStatsModal }  from './nameCloudCenturyModal.js';
import { debounce, isModalVisible } from './eventHandlers.js';


/**
 * Fonction de traduction spécifique pour nameCloudAverageAge.js
 * Cette fonction utilise window.CURRENT_LANGUAGE pour déterminer la langue
 */
function getCloudTranslation(key) {
    const translations = {
      'fr': {
        // Titres pour les labels et boutons
        'statsButtonText': 'Statistiques détaillées',
        'centuryStatsButtonText': 'Stat. par siècles',
        
        // Textes pour les statistiques de fréquence
        'mostFreqFirstName': 'Prénom le plus fréquent',
        'mostFreqLastName': 'Nom le plus fréquent',
        'mostFreqJob': 'Métier le plus fréquent',
        'mostFreqPlace': 'Lieu le plus fréquent',
        'occurrences': 'occurrences',
        
        // Textes pour les statistiques d'âge
        'avgLifespan': 'Durée de vie moyenne',
        'avgProcreationAge': 'Âge moy. de procré.',
        'avgMarriageAge': 'Âge moy. de mariage',
        'avgFirstChildAge': 'Âge moy. au 1er enfant',
        'avgChildrenCount': 'Nb. moyen d\'enfants',
        'years': 'ans',
        'male': 'H',
        'female': 'F',
        
        // Titres modaux
        'firstnamesTitle': 'prénoms',
        'lastnamesTitle': 'Noms',
        'jobsTitle': 'Métiers',
        'placesTitle': 'Lieux',
        'lifespanTitle': 'Durée de vie',
        'procreationAgeTitle': 'Âge de procréat.',
        'marriageAgeTitle': 'Âge de mariage',
        'firstChildAgeTitle': 'Âge au 1er enfant',
        'childrenCountTitle': 'Nbre d\'enfants',
        
        // Articles pour les modaux
        'ofFirstnames': 'des',
        'ofLastnames': 'des',
        'ofJobs': 'des',
        'ofPlaces': 'des',
        'ofChildrenCount': 'du',
        
        // Préfixes pour les stats
        'lifespanPrefix': 'Durée de vie ',
        'procreationAgePrefix': 'Âge de procréation ',
        'marriageAgePrefix': 'Âge de mariage ',
        'firstChildAgePrefix': 'Âge au 1er enfant ',
        'childrenCountPrefix': 'Nombre d\'enfants '
      },
      'en': {
        // Titres pour les labels et boutons
        'statsButtonText': 'Detailed Statistics',
        'centuryStatsButtonText': 'Stats by Century',
        
        // Textes pour les statistiques de fréquence
        'mostFreqFirstName': 'Most frequent first name',
        'mostFreqLastName': 'Most frequent last name',
        'mostFreqJob': 'Most frequent occupation',
        'mostFreqPlace': 'Most frequent place',
        'occurrences': 'occurrences',
        
        // Textes pour les statistiques d'âge
        'avgLifespan': 'Average lifespan',
        'avgProcreationAge': 'Avg. procreation age',
        'avgMarriageAge': 'Avg. marriage age',
        'avgFirstChildAge': 'Avg. age at 1st child',
        'avgChildrenCount': 'Avg. number of children',
        'years': 'yrs',
        'male': 'M',
        'female': 'F',
        
        // Titres modaux
        'firstnamesTitle': 'First Names',
        'lastnamesTitle': 'Last Names',
        'jobsTitle': 'Occupations',
        'placesTitle': 'Places',
        'lifespanTitle': 'Lifespan',
        'procreationAgeTitle': 'Procreation Age',
        'marriageAgeTitle': 'Marriage Age',
        'firstChildAgeTitle': 'Age at 1st Child',
        'childrenCountTitle': 'Children Count',
        
        // Articles pour les modaux
        'ofFirstnames': 'of',
        'ofLastnames': 'of',
        'ofJobs': 'of',
        'ofPlaces': 'of',
        'ofChildrenCount': 'of',
        
        // Préfixes pour les stats
        'lifespanPrefix': 'Lifespan ',
        'procreationAgePrefix': 'Procreation age ',
        'marriageAgePrefix': 'Marriage age ',
        'firstChildAgePrefix': 'Age at first child ',
        'childrenCountPrefix': 'Number of children '
      },
      'es': {
        // Titres pour les labels et boutons
        'statsButtonText': 'Estadísticas detalladas',
        'centuryStatsButtonText': 'Estad. por siglo',
        
        // Textes pour les statistiques de fréquence
        'mostFreqFirstName': 'Nombre más frecuente',
        'mostFreqLastName': 'Apellido más frecuente',
        'mostFreqJob': 'Profesión más frecuente',
        'mostFreqPlace': 'Lugar más frecuente',
        'occurrences': 'apariciones',
        
        // Textes pour les statistiques d'âge
        'avgLifespan': 'Duración de vida media',
        'avgProcreationAge': 'Edad media de procreación',
        'avgMarriageAge': 'Edad media de matrimonio',
        'avgFirstChildAge': 'Edad media al 1er hijo',
        'avgChildrenCount': 'N° medio de hijos',
        'years': 'añ.',
        'male': 'H',
        'female': 'M',
        
        // Titres modaux
        'firstnamesTitle': 'Nombres',
        'lastnamesTitle': 'Apellidos',
        'jobsTitle': 'Profesiones',
        'placesTitle': 'Lugares',
        'lifespanTitle': 'Duración de vida',
        'procreationAgeTitle': 'Edad de procreación',
        'marriageAgeTitle': 'Edad de matrimonio',
        'firstChildAgeTitle': 'Edad al 1er hijo',
        'childrenCountTitle': 'Número de hijos',
        
        // Articles pour les modaux
        'ofFirstnames': 'de',
        'ofLastnames': 'de',
        'ofJobs': 'de',
        'ofPlaces': 'de',
        'ofChildrenCount': 'del',
        
        // Préfixes pour les stats
        'lifespanPrefix': 'Duración de vida ',
        'procreationAgePrefix': 'Edad de procreación ',
        'marriageAgePrefix': 'Edad de matrimonio ',
        'firstChildAgePrefix': 'Edad al primer hijo ',
        'childrenCountPrefix': 'Número de hijos '
      },
      'hu': {
        // Titres pour les labels et boutons
        'statsButtonText': 'Részletes statisztikák',
        'centuryStatsButtonText': 'Évszázados stat.',
        
        // Textes pour les statistiques de fréquence
        'mostFreqFirstName': 'Leggyakoribb keresztnév',
        'mostFreqLastName': 'Leggyakoribb vezetéknév',
        'mostFreqJob': 'Leggyakoribb foglalkozás',
        'mostFreqPlace': 'Leggyakoribb hely',
        'occurrences': 'előfordulás',
        
        // Textes pour les statistiques d'âge
        'avgLifespan': 'Átlagos élettartam',
        'avgProcreationAge': 'Átl. szaporodási életkor',
        'avgMarriageAge': 'Átl. házasságkötési kor',
        'avgFirstChildAge': 'Átl. kor az 1. gyereknél',
        'avgChildrenCount': 'Átl. gyerekszám',
        'years': 'év',
        'male': 'F',
        'female': 'N',
        
        // Titres modaux
        'firstnamesTitle': 'Keresztnevek',
        'lastnamesTitle': 'Vezetéknevek',
        'jobsTitle': 'Foglalkozások',
        'placesTitle': 'Helyek',
        'lifespanTitle': 'Élettartam',
        'procreationAgeTitle': 'Szaporodási kor',
        'marriageAgeTitle': 'Házasságkötési kor',
        'firstChildAgeTitle': 'Kor az 1. gyereknél',
        'childrenCountTitle': 'Gyerekek száma',
        
        // Articles pour les modaux
        'ofFirstnames': '',
        'ofLastnames': '',
        'ofJobs': '',
        'ofPlaces': '',
        'ofChildrenCount': '',
        
        // Préfixes pour les stats
        'lifespanPrefix': 'Élettartam ',
        'procreationAgePrefix': 'Szaporodási életkor ',
        'marriageAgePrefix': 'Házasságkötési életkor ',
        'firstChildAgePrefix': 'Első gyermek életkora ',
        'childrenCountPrefix': 'Gyermekek száma '
      }
    };
  
    // Récupérer la langue actuelle
    const currentLang = window.CURRENT_LANGUAGE || 'fr';
    
    // Retourner la traduction ou le fallback en français
    return translations[currentLang]?.[key] || translations['fr'][key];
  }



// Variables globales pour stocker la position de la StatsModal
let globalStatsPosition = {
    x: 0,
    y: 0,
    width: 140,
    height: 60,
    userModified: false
};

let globalResizeListener = null;

export const statsConfig = {
    'prenoms': {
        labelId: 'firstname-frequency-label',
        buttonId: 'firstname-frequency-button',
        buttonClass: 'firstname-frequency-button',
        containerClass: 'firstname-frequency-container',
        title: getCloudTranslation('mostFreqFirstName'),
        modalTitle: getCloudTranslation('firstnamesTitle'),
        modalArticle: getCloudTranslation('ofFirstnames'),
        labelText: getCloudTranslation('mostFreqFirstName'),
        type: 'frequency'
    },
    'noms': {
        labelId: 'lastname-frequency-label',
        buttonId: 'lastname-frequency-button',
        buttonClass: 'lastname-frequency-button',
        containerClass: 'lastname-frequency-container',
        title: getCloudTranslation('mostFreqLastName'),
        modalTitle: getCloudTranslation('lastnamesTitle'),
        modalArticle: getCloudTranslation('ofLastnames'),
        labelText: getCloudTranslation('mostFreqLastName'),
        type: 'frequency'
    },
    'professions': {
        labelId: 'profession-frequency-label',
        buttonId: 'profession-frequency-button',
        buttonClass: 'profession-frequency-button',
        containerClass: 'profession-frequency-container',
        title: getCloudTranslation('mostFreqJob'),
        modalTitle: getCloudTranslation('jobsTitle'),
        modalArticle: getCloudTranslation('ofJobs'),
        labelText: getCloudTranslation('mostFreqJob'),
        type: 'frequency'
    },
    'lieux': {
        labelId: 'location-frequency-label',
        buttonId: 'location-frequency-button',
        buttonClass: 'location-frequency-button',
        containerClass: 'location-frequency-container',
        title: getCloudTranslation('mostFreqPlace'),
        modalTitle: getCloudTranslation('placesTitle'),
        modalArticle: getCloudTranslation('ofPlaces'),
        labelText: getCloudTranslation('mostFreqPlace'),
        type: 'frequency'
    },
    'duree_vie': {
        labelId: 'average-age-label',
        buttonId: 'average-age-stats-button',
        buttonClass: 'average-age-stats-button',
        containerClass: 'average-container',
        title: getCloudTranslation('avgLifespan'),
        modalTitle: getCloudTranslation('lifespanTitle'),
        modalArticle: '',
        labelText: getCloudTranslation('avgLifespan'),
        modalStatsPrefix: getCloudTranslation('lifespanPrefix'),
        chartId: 'average-age-chart-container',
        type: 'age'
    },
    'age_procreation': {
        labelId: 'procreation-age-label',
        buttonId: 'procreation-age-stats-button',
        buttonClass: 'procreation-age-stats-button',
        containerClass: 'procreation-average-container',
        title: getCloudTranslation('avgProcreationAge'),
        modalTitle: getCloudTranslation('procreationAgeTitle'),
        modalArticle: '',
        labelText: getCloudTranslation('avgProcreationAge'),
        modalStatsPrefix: getCloudTranslation('procreationAgePrefix'),
        chartId: 'procreation-age-chart-container',
        type: 'age'
    },
    'age_marriage': {
        labelId: 'marriage-age-label',
        buttonId: 'marriage-age-stats-button',
        buttonClass: 'marriage-age-stats-button',
        containerClass: 'marriage-average-container',
        title: getCloudTranslation('avgMarriageAge'),
        modalTitle: getCloudTranslation('marriageAgeTitle'),
        modalArticle: '',
        labelText: getCloudTranslation('avgMarriageAge'),
        modalStatsPrefix: getCloudTranslation('marriageAgePrefix'),
        chartId: 'marriage-age-chart-container',
        type: 'age'
    },
    'age_first_child': {
        labelId: 'first-child-age-label',
        buttonId: 'first-child-age-stats-button',
        buttonClass: 'first-child-age-stats-button',
        containerClass: 'first-child-average-container',
        title: getCloudTranslation('avgFirstChildAge'),
        modalTitle: getCloudTranslation('firstChildAgeTitle'),
        modalArticle: '',
        labelText: getCloudTranslation('avgFirstChildAge'),
        modalStatsPrefix: getCloudTranslation('firstChildAgePrefix'),
        chartId: 'first-child-age-chart-container',
        type: 'age'
    },
    'nombre_enfants': {
        labelId: 'children-count-label',
        buttonId: 'children-count-stats-button',
        buttonClass: 'children-count-stats-button',
        containerClass: 'children-count-container',
        title: getCloudTranslation('avgChildrenCount'),
        modalTitle: getCloudTranslation('childrenCountTitle'),
        modalArticle: getCloudTranslation('ofChildrenCount'),
        labelText: getCloudTranslation('avgChildrenCount'),
        modalStatsPrefix: getCloudTranslation('childrenCountPrefix'),
        chartId: 'children-count-chart-container',
        type: 'age'  // Utiliser le même type 'age' pour profiter des mêmes graphiques de distribution
    }
};

export function removeAllStatsElements() {
    // Supprimer toutes les stats modals HTML
    document.querySelectorAll('.html-stats-label').forEach(element => {
        element.remove();
    });

    // Supprimer les 2 boutons de statistiques
    const button = document.getElementById('unique-statsButton');
    if (button) {
        button.remove();
    }
    const centuryButton = document.getElementById('unique-century-stats-button');
    if (centuryButton) {
        centuryButton.remove();
    }
}

/**
 * Vérifie si les statistiques existent, sinon les calcule
 * @param {Object} nameData - Les données à vérifier
 * @returns {Object} - Les données avec statistiques
 */
export function ensureStatsExist(nameData) {
    if (!nameData || !nameData.stats) {
        const ages = nameData
            .filter(d => !isNaN(parseInt(d.text)))
            .map(d => ({
                age: parseInt(d.text),
                count: d.size
            }));
                
        if (ages.length > 0) {
            const totalCount = ages.reduce((sum, item) => sum + item.count, 0);
            const minAge = Math.min(...ages.map(d => d.age));
            const maxAge = Math.max(...ages.map(d => d.age));
            
            nameData.stats = {
                average: nameData.averageData || 0,
                count: totalCount,
                min: minAge,
                max: maxAge
            };
        }
    }
    
    return nameData;
}

/**
 * Trouve l'élément le plus fréquent dans les données
 * @param {Array} nameData - Les données du nuage
 * @returns {Object} - L'élément le plus fréquent avec son nombre d'occurrences
 */
function findMostFrequent(nameData) {
    if (!nameData || nameData.length === 0) {
        return { text: 'N/A', size: 0 };
    }
    
    return nameData.reduce((prev, current) => {
        return (prev.size > current.size) ? prev : current;
    });
}

/**
 * Ajoute le bouton des statistiques détaillées
 * @param {HTMLElement} container - Le conteneur parent
 * @param {Object} nameData - Les données à afficher
 * @param {string} type - Le type de statistiques
 */
export function addStatsButton(container, nameData, type, newConfig) {
    if (!container || !nameData) return;
    
    // Vérifier que le type est valide
    if (!statsConfig[type]) {
        console.error(`Type de statistiques invalide: ${type}`);
        return;
    }
    
    // Récupérer la configuration pour ce type
    const cfg = statsConfig[type];
    

    // Créer le bouton avec un ID fixe
    let button = document.getElementById('unique-statsButton'); 
    if (!button) {
        button = document.createElement('button');

        // Supprimer l'écouteur global de redimensionnement s'il existe
        if (globalResizeListener) {
            window.removeEventListener('resize', globalResizeListener);
            globalResizeListener = null;
        }


        // button.textContent = 'Statistiques détaillées';
        button.textContent = getCloudTranslation('statsButtonText');
        button.id = 'unique-statsButton'; 
        button.className = 'unique-statsButton';
        button.style.position = 'absolute';
        
        // Fixer la largeur du bouton à la même que l'étiquette
        button.style.width = `${globalStatsPosition.width*state.scaleChrome}px`;
        button.style.whiteSpace = 'nowrap';
        button.style.overflow = 'hidden';
        button.style.textOverflow = 'ellipsis';
        
        // Positionner directement le bouton - via getBoundingClientRect
        positionButtonRelativeToLabel(button, type);
        
        // Styles du bouton
        button.style.padding = 6*state.scaleChrome+'px '+ 8*state.scaleChrome+'px';
        button.style.height = 30*state.scaleChrome+'px';
        button.style.backgroundColor = '#4299e1';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = 4*state.scaleChrome+'px';
        button.style.cursor = 'pointer';
        button.style.fontFamily = 'Arial, sans-serif';
        button.style.fontSize = 14*state.scaleTextFontSize+'px';
        button.style.zIndex = '1000';
        button.style.boxShadow = '0 '+2*state.scaleChrome+ 'px' + 4*state.scaleChrome+'px rgba(0,0,0,0.2)';
        
        // Centrer le texte
        button.style.textAlign = 'center';
        button.style.display = 'flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';

        if (state.innerWidth < 400 || window.innerHeight < 400) {
            button.style.fontSize = 12*state.scaleTextFontSize+'px';
            button.style.height = 22*state.scaleChrome+'px';
        }
        
        // Effets de survol
        button.onmouseover = () => {
            button.style.backgroundColor = '#3182ce';
            button.style.boxShadow = '0 '+4*state.scaleChrome+'px '+ 6*state.scaleChrome+'px rgba(0,0,0,0.3)';
        };
        
        button.onmouseout = () => {
            button.style.backgroundColor = '#4299e1';
            button.style.boxShadow = '0 '+2*state.scaleChrome+'px '+ 4*state.scaleChrome+'px rgba(0,0,0,0.2)';
        };       

        container.appendChild(button);
    }
    
    button.onclick = () => {
        if (cfg.type === 'age') {
            createStatsModal(nameData, type);
        } else {
            new createFrequencyStatsModal(nameData, type, newConfig, null);
        }
    };    

    
    return button;
}

/**
 * Positionne le bouton par rapport à l'étiquette
 * @param {HTMLElement} button - Le bouton à positionner
 * @param {string} type - Le type de statistiques
 */
function positionButtonRelativeToLabel(button, type) {
    // Récupérer la configuration pour ce type
    const cfg = statsConfig[type];
    
    // Trouver la position réelle de l'étiquette dans le DOM
    const labelContainer = document.getElementById(cfg.labelId);
    
    if (labelContainer) {
        // Obtenir la position exacte de l'étiquette
        const labelRect = labelContainer.getBoundingClientRect();
        
        // Positionner le bouton directement sous l'étiquette
        button.style.left = `${labelRect.left}px`;
        button.style.top = `${labelRect.bottom}px`;
        button.style.width = `${labelRect.width}px`;
    } else {
        // Fallback à l'ancienne méthode si l'élément n'est pas trouvé
        const buttonX = globalStatsPosition.x;
        const buttonY = globalStatsPosition.y + globalStatsPosition.height*state.scaleChrome;
        
        button.style.left = `${buttonX}px`;
        button.style.top = `${buttonY}px`;
    }
}

/**
 * Trouve les personnes ayant un nom/prénom/métier/lieu spécifique
 * @param {string} name - Le nom à rechercher
 * @param {Object} config - La configuration
 * @returns {Array} - Liste des personnes correspondantes
 */
export function findPeopleWithName(name, config, originalName, searchStreamFull) {

    // console.log("findPeopleWithName called  with name:", name, searchStreamFull);

    if (!state.gedcomData) return [];
    if (!originalName) { originalName = name;}
    
    const persons = getPersonsFromTree(config.scope, config.rootPersonId);

    const people = Object.values(state.gedcomData.individuals)
        .filter(p => {
            let matches = false;
            
            if (config.type === 'prenoms') {
                const firstName = p.name.split('/')[0].trim();
                if (searchStreamFull && name.toLowerCase() !== searchStreamFull.toLowerCase()) {
                    // pour gérer le cas de recharches de prénoms à plusieurs mots
                    matches = firstName.toLowerCase().includes(name.toLowerCase()) && firstName.toLowerCase().includes(searchStreamFull.toLowerCase());
                } else {
                    matches = firstName.toLowerCase().includes(name.toLowerCase());
                }
            } else if (config.type === 'noms') {
                matches = (p.name.split('/')[1] && p.name.split('/')[1].toLowerCase().trim() === originalName.toLowerCase());
                // matches = (p.name.split('/')[1] && p.name.split('/')[1].toLowerCase().trim().includes(originalName.toLowerCase()));
            } else if (config.type === 'professions') {
                const cleanedProfessions = cleanProfessionForNameCloud(p.occupationFull);
                const regex = new RegExp(`(^|[ ,.;:(){}\\[\\]\\-_'"])\\s*${originalName.toLowerCase()}\\s*($|[ ,.;:(){}\\[\\]\\-_'"])`, 'i');

                matches = cleanedProfessions.some(prof => regex.test(prof));


                if (matches) {
                    cleanedProfessions.forEach(prof => {
                        if (prof.includes(originalName.toLowerCase()) && (originalName.split(' ').length === 1) && (prof.split(' ').length > 1) && prof.split(' ')[prof.split(' ').length-1].includes(originalName.toLowerCase()) ) {
                            matches = false;
                            console.log('\n\n matches is cancelled, search=',originalName, 'in ', prof , p.name, ', ' , originalName.split(' ').length, prof.split(' ').length, prof.split(' ')[0].includes(originalName.toLowerCase()))
                        }
                    });
                }

                // if (p.occupationFull.toLowerCase().includes('roi')) {
                //     console.log('\n\n debug in findPeopleWithName Average, search=', originalName, ', in' , p.name, p.occupationFull, ', cleanedProfessions=', cleanedProfessions, matches)
                // }

            } else if (config.type === 'lieux') {
                const personLocations = [
                    p.birthPlace, 
                    p.deathPlace, 
                    p.marriagePlace, 
                    p.residPlace1, 
                    p.residPlace2, 
                    p.residPlace3
                ];
                
                matches = personLocations.some(location => {
                    const cleanedLocation = cleanLocation(location);
                    return cleanedLocation === name;
                });
            } else if (config.type === 'duree_vie') {
                // Calcul de la durée de vie
                if (p.birthDate && p.deathDate) {
                    const birthYear = extractYear(p.birthDate);
                    const deathYear = extractYear(p.deathDate);                    
                    const age = deathYear - birthYear;
                    matches = age.toString() === name;
                }
            } else if (config.type === 'age_procreation') {
                if (p.birthDate) {
                    const parentBirthYear = extractYear(p.birthDate);
                    // Pour chaque mariage
                    if (p.spouseFamilies) {
                        p.spouseFamilies.forEach(familyId => {
                            const family = state.gedcomData.families[familyId];
                            if (family && family.children) {
                                family.children.forEach(childId => {
                                    const child = state.gedcomData.individuals[childId];
                                    if (child && child.birthDate) {
                                        const childBirthYear = extractYear(child.birthDate);
                                        if (childBirthYear > parentBirthYear) {
                                            const ageAtChildBirth = childBirthYear - parentBirthYear;
                                            if (ageAtChildBirth.toString() === name) {
                                                matches = true;
                                            }
                                        }
                                    }
                                });
                            }
                        });
                    }
                }
            } else if (config.type === 'age_first_child') {
                if (p.birthDate) {
                    const parentBirthYear = extractYear(p.birthDate);
                    // Construire un tableau de tous les enfants avec leur année de naissance
                    const children = [];
                    if (p.spouseFamilies) {
                        p.spouseFamilies.forEach(familyId => {
                            const family = state.gedcomData.families[familyId];
                            if (family && family.children) {
                                family.children.forEach(childId => {
                                    const child = state.gedcomData.individuals[childId];
                                    if (child && child.birthDate) {
                                        const childBirthYear = extractYear(child.birthDate);
                                        if (childBirthYear > parentBirthYear) {
                                            children.push({
                                                id: childId,
                                                birthYear: childBirthYear,
                                                name: child.name,
                                                birthDate: child.birthDate
                                            });
                                        }
                                    }
                                });
                            }
                        });
                    }
                    
                    // Trier les enfants par année de naissance
                    children.sort((a, b) => a.birthYear - b.birthYear);
                    
                    // Si au moins un enfant est trouvé
                    if (children.length > 0) {
                        const firstChild = children[0];
                        const ageAtFirstChild = firstChild.birthYear - parentBirthYear;
                        if (ageAtFirstChild.toString() === name) {
                            matches = true;
                            // console.log('debug in findPeopleWithName', p.name, name, ageAtFirstChild )
                        }
                    }
                }


            } else if (config.type === 'age_marriage') {
                // Vérifier l'âge de mariage de la personne
                if (p.birthDate && p.spouseFamilies) {
                    const birthYear = extractYear(p.birthDate);
                    p.spouseFamilies.forEach(familyId => {
                        const family = state.gedcomData.families[familyId];
                        if (family && family.marriageDate) {
                            const marriageYear = extractYear(family.marriageDate);
                            if (marriageYear > birthYear) {
                                const ageAtMarriage = marriageYear - birthYear;
                                if (ageAtMarriage.toString() === name) {
                                    matches = true;
                                }
                            }
                        }
                    });
                }


            } else if (config.type === 'nombre_enfants') {
                let totalChildren = 0;
                if (p.spouseFamilies) {
                    p.spouseFamilies.forEach(familyId => {
                        const family = state.gedcomData.families[familyId];
                        if (family && family.children) {
                            totalChildren += family.children.length;
                        }
                    });
                }
                matches = totalChildren.toString() === name;

            } 


            // Vérifier si la personne est dans l'arbre approprié selon le scope
            const isInTree = 
                config.scope === 'all' || 
                ((config.scope === 'descendants' || config.scope === 'directDescendants') && persons.some(descendant => descendant.id === p.id)) ||
                ((config.scope === 'ancestors' || config.scope === 'directAncestors') && persons.some(ancestor => ancestor.id === p.id));

            return matches && isInTree && hasDateInRange(p, config).inRange;
        })
        .map(p => ({
            name: p.name.replace(/\//g, ''),
            id: p.id,
            occupation: p.occupationFull || 'Non spécifiée'
        }));

    return people;
}

export function addStatisticsLabel(svg, textGroup, config) {
    // Ne rien faire si le type n'est pas supporté
    if (!statsConfig[config.type]) {
        return;
    }
    
    // Récupérer la configuration pour ce type
    const cfg = statsConfig[config.type];
    
    // Supprimer TOUTES les étiquettes HTML existantes
    document.querySelectorAll('.html-stats-label').forEach(element => {
        element.remove();
    });
    

    // Supprimer l'ancienne étiquette SVG si elle existe
    svg.selectAll(`.${cfg.containerClass}`).remove();
    
    // Supprimer aussi l'élément HTML existant s'il existe
    const existingHTMLLabel = document.getElementById(`html-${cfg.labelId}`);
    if (existingHTMLLabel) {
        existingHTMLLabel.remove();
    }
    
    // Variables pour le texte à afficher
    let valueText = '';
    let subtitleText = '';
    let genderText = '';
    let units = ` ${getCloudTranslation('years')}`; //' ans';
    if (nameCloudState.currentConfig.type === 'nombre_enfants') { units = ''; }
    
    if (cfg.type === 'age') {
        // Pour les types d'âge
        if (!nameCloudState.currentNameData || !nameCloudState.currentNameData.averageData) {
            return;
        }
        valueText = `${parseFloat(nameCloudState.currentNameData.averageData).toFixed(1)}${units}`;
        
        // Ajouter les moyennes par sexe si disponibles
        if (nameCloudState.currentNameData.maleAverageData && 
            nameCloudState.currentNameData.femaleAverageData) {
            // genderText = `H: ${nameCloudState.currentNameData.maleAverageData}${units} / F: ${nameCloudState.currentNameData.femaleAverageData}${units}`;
            genderText = `${getCloudTranslation('male')}: ${nameCloudState.currentNameData.maleAverageData}${units} / ${getCloudTranslation('female')}: ${nameCloudState.currentNameData.femaleAverageData}${units}`;

        }
    } else {
        // Pour les types de fréquence
        if (!nameCloudState.currentNameData || nameCloudState.currentNameData.length === 0) {
            return;
        }
        const mostFrequent = findMostFrequent(nameCloudState.currentNameData);
        valueText = mostFrequent.text;
        subtitleText = `(${mostFrequent.size} ${getCloudTranslation('occurrences')})`;
    }

    // Position initiale ou récupérée
    let initialX, initialY;
    
    // Utiliser la position globale sauvegardée si elle existe et a été modifiée par l'utilisateur
    if (globalStatsPosition.userModified && globalStatsPosition.x !== 0) {
        initialX = globalStatsPosition.x;
        initialY = globalStatsPosition.y;
    } else {
        // Position par défaut basée sur la position du SVG
        if (state.innerWidth < 400 || window.innerHeight < 400) {
            initialX = (state.innerWidth - 140)*state.scaleChrome; //*state.scaleChrome; // 170px depuis le bord droit
        } else {
            initialX = (state.innerWidth - 165)*state.scaleChrome; //*state.scaleChrome; // 170px depuis le bord droit
        }

        initialY = 85*state.scaleChrome;  // 110px depuis le haut
    }


    // console.log('\n\n\n ---- DEBUG addStatisticsLabel W=', state.innerWidth, 'H=',window.innerHeight, initialX)



    // Créer un élément HTML pour les statistiques
    const container = document.createElement('div');
    container.id = `html-${cfg.labelId}`;
    container.className = `html-stats-label ${cfg.containerClass}`;
    container.style.position = 'absolute';
    container.style.left = `${initialX}px`;
    container.style.top = `${initialY}px`;
    container.style.width = 140*state.scaleChrome+'px';
    container.style.height = 60*state.scaleChrome+'px';


    container.style.padding = 5*state.scaleChrome+'px';
    container.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    container.style.border = 1*state.scaleChrome+ 'px solid #ccc';
    container.style.borderRadius = 5*state.scaleChrome+'px';
    container.style.boxShadow = '0 '+2*state.scaleChrome+ 'px' + 4*state.scaleChrome+'px rgba(0,0,0,0.1)';
    container.style.zIndex = '1000';
    container.style.cursor = 'move';
    container.style.fontFamily = 'Arial, sans-serif';
    
    // Ajouter le titre
    const title = document.createElement('div');
    title.textContent = cfg.labelText;
    title.style.fontSize = 12*state.scaleTextFontSize+'px';
    title.style.textAlign = 'center';
    title.style.marginBottom = 5*state.scaleChrome+'px';
    container.appendChild(title);
    
    // Ajouter la valeur principale
    const value = document.createElement('div');
    value.textContent = valueText;
    value.style.fontSize = 16*state.scaleTextFontSize+'px';
    value.style.fontWeight = 'bold';
    value.style.color = '#e53e3e';
    value.style.textAlign = 'center';
    container.appendChild(value);

    // Ajouter les moyennes par sexe
    let gender;
    if (genderText) {
        gender = document.createElement('div');
        gender.textContent = genderText;
        gender.style.fontSize = 12*state.scaleTextFontSize+'px';
        gender.style.textAlign = 'center';
        gender.style.marginTop = 2*state.scaleChrome+'px';
        container.appendChild(gender);
    }

    
    // Ajouter le sous-titre si nécessaire
    let subtitle;
    if (subtitleText) {
        subtitle = document.createElement('div');
        subtitle.textContent = subtitleText;
        subtitle.style.fontSize = 12*state.scaleTextFontSize+'px';
        subtitle.style.textAlign = 'center';
        subtitle.style.marginTop = 2*state.scaleChrome+'px';
        container.appendChild(subtitle);
    }


    if (state.innerWidth < 400 || window.innerHeight < 400) {
        container.style.width = 125*state.scaleChrome+'px';
        container.style.height = 45*state.scaleChrome+'px';
        container.style.padding = 1*state.scaleChrome+'px';
        title.style.fontSize = 11*state.scaleTextFontSize+'px';
        // title.style.marginBottom = '1px';
        title.style.margin = 1*state.scaleChrome+'px';
        title.style.padding = '0px'
        value.style.fontSize = 13*state.scaleTextFontSize+'px';
        value.style.marginTop= '0px';
        value.style.marginBottom = -3*state.scaleChrome+'px';
        if (genderText) {
            gender.style.fontSize = 10*state.scaleTextFontSize+'px';
        }
        if (subtitleText) {
            subtitle.style.fontSize = 10*state.scaleTextFontSize+'px';
        }
    }


    // Ajouter au document
    document.body.appendChild(container);
    
    
    // Rendre l'élément déplaçablef
    makeElementDraggable(container, config.type);
    
    // Repositionner le bouton associé
    setTimeout(() => forceRepositionButton(config.type), 50);

    // Mise à jour de globalStatsPosition pour tenir compte de la nouvelle hauteur
    // globalStatsPosition.height = genderText ? 75 : 60; 

    // // Ajouter un événement de redimensionnement
    // if (globalResizeListener) {
    //     window.removeEventListener('resize', globalResizeListener);
    // }
    
    // Créer un nouvel écouteur de redimensionnement
    globalResizeListener = function() {
        // Récupérer tous les éléments HTML de statistiques
        const statsLabels = document.querySelectorAll('.html-stats-label');
        
        // Si aucun élément n'existe, ne rien faire
        if (statsLabels.length === 0) return;
        
        // Lors du redimensionnement, si la position n'a pas été modifiée manuellement,
        // repositionner selon les nouvelles dimensions
        if (!globalStatsPosition.userModified) {
            const newX = state.innerWidth - 165*state.scaleChrome;// parseInt(svg.attr('width')) - 140 - 30;
            const newY = 85*state.scaleChrome;
            
            // Mettre à jour la position de tous les éléments
            statsLabels.forEach(element => {
                element.style.left = `${newX}px`;
                element.style.top = `${newY}px`;
            });
            
            // Mettre à jour la position globale
            globalStatsPosition.x = newX;
            globalStatsPosition.y = newY;
            
            // Repositionner le bouton
            const button = document.getElementById('unique-statsButton');
            if (button) forceRepositionButton(type);
        }
    };
    
    // Ajouter le nouvel écouteur
    window.addEventListener('resize', debounce(() => {
        if(state.isWordCloudEnabled && isModalVisible(container.id)) {
            // console.log('\n\n*** debug resize in addStatisticsLabel in nameCloudAverage for globalResizeListener \n\n');
            // globalResizeListener();
        }
    }, 150)); // Attend 150ms après le dernier resize

    
}

// Fonction pour rendre un élément HTML déplaçable
function makeElementDraggable(element, type) {
    let isDragging = false;
    let startX, startY;
    let initialLeft, initialTop;
    
    // Gestionnaire mousedown (PC)
    element.addEventListener('mousedown', function(e) {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialLeft = parseInt(element.style.left) || 0;
        initialTop = parseInt(element.style.top) || 0;
        e.preventDefault();
    });
    
    // Gestionnaire touchstart (Mobile)
    element.addEventListener('touchstart', function(e) {
        isDragging = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        initialLeft = parseInt(element.style.left) || 0;
        initialTop = parseInt(element.style.top) || 0;
    }, { passive: true });
    
    // Gestionnaire mousemove (PC)
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        
        const newLeft = initialLeft + (e.clientX - startX);
        const newTop = initialTop + (e.clientY - startY);
        
        element.style.left = `${newLeft}px`;
        element.style.top = `${newTop}px`;
        
        // Mettre à jour la position globale
        globalStatsPosition.x = newLeft;
        globalStatsPosition.y = newTop;
        
        // Repositionner les boutons
        // D'abord le bouton principal
        const button = document.getElementById('unique-statsButton');
        if (button) forceRepositionButton(type);
        // Puis le bouton de statistiques par siècle
        const centuryButton = document.getElementById('unique-century-stats-button');
        if (centuryButton) {
            if (button) {
                const rect = button.getBoundingClientRect();
                centuryButton.style.left = `${rect.left}px`;
                centuryButton.style.top = `${rect.bottom + 5*state.scaleChrome}px`;
            }
        }

    });
    
    // Gestionnaire touchmove (Mobile)
    document.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        
        e.preventDefault(); // Empêcher le scroll
        
        const newLeft = initialLeft + (e.touches[0].clientX - startX);
        const newTop = initialTop + (e.touches[0].clientY - startY);
        
        element.style.left = `${newLeft}px`;
        element.style.top = `${newTop}px`;
        
        // Mettre à jour la position globale
        globalStatsPosition.x = newLeft;
        globalStatsPosition.y = newTop;
        
        // Repositionner les boutons
        const button = document.getElementById('unique-statsButton');
        if (button) forceRepositionButton(type);
        
        const centuryButton = document.getElementById('unique-century-stats-button');
        if (centuryButton) {
            if (button) {
                const rect = button.getBoundingClientRect();
                centuryButton.style.left = `${rect.left}px`;
                centuryButton.style.top = `${rect.bottom + 5*state.scaleChrome}px`;
            }
        }
    }, { passive: false });
    
    // Gestionnaires pour la fin du déplacement
    document.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            // Marquer comme modifié par l'utilisateur
            globalStatsPosition.userModified = true;
        }
    });
    
    document.addEventListener('touchend', function() {
        if (isDragging) {
            isDragging = false;
            // Marquer comme modifié par l'utilisateur
            globalStatsPosition.userModified = true;
        }
    });
    
    document.addEventListener('touchcancel', function() {
        isDragging = false;
    });
}

export function addCenturyStatsButton(container, type, newConfig) {
    // Récupérer la configuration pour le type actuel
    const cfg = statsConfig[type];
    if (!cfg) return;
    
    // Vérifier si le bouton statistiques détaillées existe
    const detailedStatsButton = document.getElementById('unique-statsButton');
    if (!detailedStatsButton) return;
        
    // Créer le bouton des statistiques par siècle
    let button = document.getElementById('unique-century-stats-button');
    if (!button) {
        button = document.createElement('button');
        // button.textContent = 'Stat. par siècles';
        button.textContent = getCloudTranslation('centuryStatsButtonText');
        button.id = 'unique-century-stats-button';
        button.className = 'unique-century-stats-button';
        
        // Appliquer les styles du bouton de statistiques détaillées
        button.style.position = 'absolute';
        button.style.padding = 6*state.scaleChrome+'px '+ 8*state.scaleChrome+'px';
        button.style.height = 30*state.scaleChrome+'px'
        button.style.backgroundColor = '#7B68EE'; // Couleur violette pour distinguer du bouton principal
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = 4*state.scaleChrome+'px';
        button.style.cursor = 'pointer';
        button.style.fontFamily = 'Arial, sans-serif';
        button.style.fontSize = 14*state.scaleTextFontSize+'px';
        button.style.zIndex = '1000';
        button.style.boxShadow = '0 '+2*state.scaleChrome+ 'px' + 4*state.scaleChrome+'px rgba(0,0,0,0.2)';
        button.style.textAlign = 'center';
        button.style.display = 'flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        button.style.width = detailedStatsButton.offsetWidth + 'px';
        
        // Positionner le bouton sous le bouton des statistiques détaillées
        const detailedStatsRect = detailedStatsButton.getBoundingClientRect();
        button.style.left = `${detailedStatsRect.left}px`;
        button.style.top = `${detailedStatsRect.bottom + 5*state.scaleChrome}px`; // 5px de marge
        
        // Ajouter l'événement de clic pour ouvrir le modal des statistiques par siècle
        nameCloudState.currentConfig = { ...newConfig };
        
        // Effets de survol
        button.onmouseover = () => {
            button.style.backgroundColor = '#6A5ACD';
            button.style.boxShadow = '0 '+4*state.scaleChrome+'px '+ 6*state.scaleChrome+'px rgba(0,0,0,0.3)';
        };
        
        button.onmouseout = () => {
            button.style.backgroundColor = '#7B68EE';
            button.style.boxShadow = '0 '+2*state.scaleChrome+'px '+ 4*state.scaleChrome+'px rgba(0,0,0,0.2)';
        };

        if (state.innerWidth < 400 || window.innerHeight < 400) {
            button.style.fontSize = 12*state.scaleTextFontSize+'px';
            button.style.height = 22*state.scaleChrome+'px';
        }
  
        container.appendChild(button);
        
        // Assurer que le bouton de statistiques par siècle se déplace avec le bouton principal
        // Observateur de mutation pour surveiller les changements de position du bouton principal
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
                    // Repositionner le bouton de statistiques par siècle
                    const rect = detailedStatsButton.getBoundingClientRect();
                    button.style.left = `${rect.left}px`;
                    button.style.top = `${rect.bottom + 5*state.scaleChrome}px`;
                }
            });
        });
        
        // Observer les attributs 'style' et 'class' du bouton principal
        observer.observe(detailedStatsButton, { attributes: true });
    }
    button.onclick = () => {
        // console.log('\n\n **** debug  call to showCenturyStatsModal, newConfig', newConfig, nameCloudState.currentConfig)
        showCenturyStatsModal(type);
    };
    return button;
}

// Mettre à jour forceRepositionButton pour inclure le positionnement du bouton de statistiques par siècle
function forceRepositionButton(type) {
    const cfg = statsConfig[type];
    const button = document.getElementById('unique-statsButton');


    // console.log('\n\n\n ------- DEBUG forceRepositionButton \n\n\n');

    if (!button) return;
    
    // Essayer d'abord de trouver l'élément HTML correspondant
    const labelElement = document.getElementById(`html-${cfg.labelId}`);
    
    if (labelElement) {
        // Obtenir la position exacte de l'étiquette
        const labelRect = labelElement.getBoundingClientRect();
        
        // Positionner le bouton directement sous l'étiquette
        button.style.left = `${labelRect.left}px`;
        button.style.top = `${labelRect.bottom + 2*state.scaleChrome}px`; // +2px pour un petit espace
        button.style.width = `${labelRect.width}px`;
        if (state.innerWidth < 400 || window.innerHeight < 400) {
            button.style.fontSize = 12*state.scaleTextFontSize+'px';
            button.style.height = 22*state.scaleChrome+'px';
        } else {
            button.style.fontSize = 14*state.scaleTextFontSize+'px';
            button.style.height = 30*state.scaleChrome+'px';                 
        }
        
        // Repositionner également le bouton de statistiques par siècle
        const centuryButton = document.getElementById('unique-century-stats-button');
        if (centuryButton) {
            // Obtenir la position exacte du bouton principal
            const buttonRect = button.getBoundingClientRect();
            centuryButton.style.left = `${buttonRect.left}px`;
            centuryButton.style.top = `${buttonRect.bottom + 5*state.scaleChrome}px`;
            centuryButton.style.width = `${buttonRect.width}px`;
            if (state.innerWidth < 400 || window.innerHeight < 400) {
                centuryButton.style.fontSize = 12*state.scaleTextFontSize+'px';
                centuryButton.style.height = 22*state.scaleChrome+'px';
            } else {
                centuryButton.style.fontSize = 14*state.scaleTextFontSize+'px';
                centuryButton.style.height = 30*state.scaleChrome+'px';                   
            }
        }
    } else {
        // Fallback si aucun élément n'est trouvé
        const buttonX = globalStatsPosition.x;
        const buttonY = globalStatsPosition.y + globalStatsPosition.height*state.scaleChrome;
        
        button.style.left = `${buttonX}px`;
        button.style.top = `${buttonY}px`;
        if (state.innerWidth < 400 || window.innerHeight < 400) {
            button.style.fontSize = 12*state.scaleTextFontSize+'px';
            button.style.height = 22*state.scaleChrome+'px';
        } else {
            button.style.fontSize = 14*state.scaleTextFontSize+'px';
            button.style.height = 30*state.scaleChrome+'px';                   
        }

        // Repositionner également le bouton de statistiques par siècle
        const centuryButton = document.getElementById('unique-century-stats-button');
        if (centuryButton) {
            centuryButton.style.left = `${buttonX}px`;
            centuryButton.style.top = `${buttonY + button.offsetHeight + 5*state.scaleChrome}px`;
            centuryButton.style.width = `${button.offsetWidth}px`;
            if (state.innerWidth < 400 || window.innerHeight < 400) {
                centuryButton.style.fontSize = 12*state.scaleTextFontSize+'px';
                centuryButton.style.height = 22*state.scaleChrome+'px';
            } else {
                centuryButton.style.fontSize = 14*state.scaleTextFontSize+'px';
                centuryButton.style.height = 30*state.scaleChrome+'px';                   
            }
        }
    }
}

// Fonction auxiliaire pour mettre à jour la fonction updateStatsButtons
export function updateStatsButtons(container, nameData, type, newConfig) {
   

    // console.log('\n\n\n ------- DEBUG updateStatsButtons \n\n\n');

    // D'abord ajouter le bouton des statistiques détaillées
    addStatsButton(container, nameData, type, newConfig);
    
    // Puis ajouter le bouton des statistiques par siècle avec un petit délai
    // pour permettre au premier bouton d'être positionné correctement
    setTimeout(() => {
        addCenturyStatsButton(container, type, newConfig);
    }, 50);
}
