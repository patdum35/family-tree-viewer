
import { state, showToast } from './main.js';
import { buildAncestorTree, buildDescendantTree } from './treeOperations.js';
import { centerCloudNameContainer } from './nameCloudRenderer.js';
import { createNameCloudUI } from './nameCloudUI.js';
import { hasDateInRange, isValidSurName, extractYear, cleanSurName, cleanFamilyName, formatFamilyName, isValidFamilyName , cleanProfession, cleanLocation, capitalizeName  } from './nameCloudUtils.js';

export const nameCloudState = {
    mobilePhone: false,
    totalWords: 0,
    placedWords: 0,
    maxCount: 5,
    minCount: 1,
    SVG_width: 1920,
    SVG_height: 1080,
    currentConfig: null,
    currentNameData: null,
    minFontSize: 10,
    maxFontSize: 45,
    appliedMinFontSize: 10,
    appliedMaxFontSize: 45,
    cloudShape: 'coeur',
    padding: 4,
    paddingLocal: 4,
    fontFamily: 'Arial',
    isShapeBorder: false,
    isThreeZones: true,
    wordRotation: false,
    wordMovement: 'simple',   // Can be 'none', 'simple', 'bounce', or 'float'
    movingRotation: false,
    autoShapeScale: 1,
    autoZoomScale: 1,
    heatmapPosition: {
        top: 60,
        left: 20,
        width: null,  // null signifie utiliser les valeurs par défaut
        height: null
    },
    statsModalPosition: {
        top: null,
        left: null
    },
    statsButtonPosition: {
        top: null,
        left: null
    },
    isHeatmapVisible: false,
    heatmapWrapper: null,
}

export function processNamesCloudWithDate(config, containerElement = null) {

    // Réinitialiser les positions seulement à la première initialisation
    if (!nameCloudState.initialized) {
        nameCloudState.heatmapPosition = {
            top: 60,
            left: 20,
            width: null,
            height: null
        };
        nameCloudState.statsModalPosition = {
            top: null,
            left: null
        };
        nameCloudState.statsButtonPosition = {
            top: null,
            left: null
        };
        nameCloudState.initialized = true;
    }


    // Logique principale de traitement des données
    const nameData = processNamesData(config);

    // Dimensions de l'écran
    nameCloudState.SVG_width = window.innerWidth;
    nameCloudState.SVG_height = window.innerHeight;

    nameCloudState.mobilePhone = false;
    if (Math.min(window.innerWidth, window.innerHeight) < 400 ) nameCloudState.mobilePhone = 1;
    else if (Math.min(window.innerWidth, window.innerHeight) < 600 ) nameCloudState.mobilePhone = 2;

    // for mobile phone
    if (nameCloudState.mobilePhone) 
        { nameCloudState.SVG_width = window.innerWidth + 50; nameCloudState.SVG_height = window.innerHeight + 50; }


    // Afficher le nuage
    if (containerElement) {
        createNameCloudUI.renderInContainer(nameData, config, containerElement);
    } else {
        createNameCloudUI.showModal(nameData, config);
    }

    centerCloudNameContainer();

    nameCloudState.currentNameData = nameData; // Sauvegarder les données du nuage
    // Conserver les données pour réutilisation
    nameCloudState.currentConfig = { ...config };

    const message = "nombre de mots  = "  + nameData.length;
    showToast(message, 3000)

    const cloudMapRefreshEvent = new CustomEvent('cloudMapRefreshed', {
        detail: {
            config: config,
            timestamp: Date.now(),
            totalWords: nameCloudState.totalWords,
            placedWords: nameCloudState.placedWords
        }
    });
    document.dispatchEvent(cloudMapRefreshEvent);

}

export function processNamesData(config) {
    const nameFrequency = {};
    const stats = initializeStats();

    const persons = getPersonsFromTree(config.scope, config.rootPersonId);
    
    persons.forEach(person => {
        processPersonData(person, config, nameFrequency, stats, { doNotClean: false});
    });

    // updateStats(stats, nameFrequency);

    // return convertToNameData(nameFrequency);
    
    const averageLifespan = updateStats(stats, nameFrequency);

    const result = convertToNameData(nameFrequency);
    
    // Ajouter la moyenne à l'objet retourné
    result.averageLifespan = averageLifespan;
    
    return result;

}

export function processPersonData(person, config, nameFrequency, stats, options = {}) {
    const hasDate = hasDateInRange(person, config, stats);
    
    if (config.type === 'prenoms') {
        const firstName = person.name.split('/')[0].trim();
        const firstNames = firstName
            .split(/[ ,]+/) // Split sur l'espace ou la virgule
            .map(name => cleanSurName(name))
            .filter(name => isValidSurName(name))
            .map(name => capitalizeName(name));
        
        if (hasDate) {
            stats.inPeriod++;
            firstNames.forEach(name => {
                if (name) {
                    nameFrequency[name] = (nameFrequency[name] || 0) + 1;
                }
            });
        }
    } else if (config.type === 'noms') {
        const familyName = person.name.split('/')[1];

        if (familyName && hasDate) {
            stats.inPeriod++;
            const cleanedName = cleanFamilyName(familyName);
            const formattedName = formatFamilyName(cleanedName);
            if (formattedName && isValidFamilyName(formattedName)) {
                nameFrequency[formattedName] = (nameFrequency[formattedName] || 0) + 1;
            }
        }
    } else if (config.type === 'professions') {
        if (person.occupation && hasDate) {
            stats.inPeriod++;
            const cleanedProfessions = cleanProfession(person.occupation);
            
            cleanedProfessions.forEach(prof => {
                if (prof) {
                    nameFrequency[prof] = (nameFrequency[prof] || 0) + 1;
                }
            });
        }
    } else if (config.type === 'duree_vie') {
        if (person.birthDate && person.deathDate) {
            const birthYear = extractYear(person.birthDate);
            const deathYear = extractYear(person.deathDate);
            
            const startYear = Math.min(config.startDate, config.endDate);
            const endYear = Math.max(config.startDate, config.endDate);
            
            if (birthYear <= endYear && birthYear >= startYear) {
                const age = deathYear - birthYear;
                if (age >= 0 && age <= 150) {
                    stats.inPeriod++;
                    const ageStr = age.toString();
                    nameFrequency[ageStr] = (nameFrequency[ageStr] || 0) + 1;
                    stats.lifespanSum += age;
                    stats.lifespanCount++;
                }
            }
        }
    } else if (config.type === 'age_procreation') {
        if (person.birthDate) {
            const parentBirthYear = extractYear(person.birthDate);
            
            if (person.spouseFamilies) {
                person.spouseFamilies.forEach(familyId => {
                    const family = state.gedcomData.families[familyId];
                    if (family && family.children) {
                        family.children.forEach(childId => {
                            const child = state.gedcomData.individuals[childId];
                            if (child && child.birthDate) {
                                const childBirthYear = extractYear(child.birthDate);
                                
                                const startYear = Math.min(config.startDate, config.endDate);
                                const endYear = Math.max(config.startDate, config.endDate);

                                if ((childBirthYear > parentBirthYear) && (parentBirthYear <= endYear) && (parentBirthYear >= startYear)) {
                                    const ageAtChildBirth = childBirthYear - parentBirthYear;
                                    if (ageAtChildBirth >= 5 && ageAtChildBirth <= 100) {
                                        stats.inPeriod++;
                                        const ageStr = ageAtChildBirth.toString();
                                        nameFrequency[ageStr] = (nameFrequency[ageStr] || 0) + 1;
                                    }
                                }
                            }
                        });
                    }
                });
            }
        }
    } else if (config.type === 'lieux') {
        const allLocations = [];
        
        if (hasDate) {
            const potentialLocations = [
                person.birthPlace, 
                person.deathPlace, 
                person.marriagePlace, 
                person.residPlace1, 
                person.residPlace2, 
                person.residPlace3
            ];
            
            potentialLocations.forEach(location => {
                // const cleanedLocation = cleanLocation(location);
                const cleanedLocation = options.doNotClean ? location : cleanLocation(location);
                if (cleanedLocation) {
                    allLocations.push(cleanedLocation);
                }
            });
        }
        
        allLocations.forEach(location => {
            nameFrequency[location] = (nameFrequency[location] || 0) + 1;
        });
    }
}

function initializeStats() {
    return {
        totalPersons: 0,
        directDates: {
            birth: 0,
            death: 0,
            marriage: 0,
            people: new Set()
        },
        ancestorDates: [],
        descendantDates: [],
        noDates: [],
        inPeriod: 0,
        uniqueNames: 0,
        total: 0,
        lifespanSum: 0,
        lifespanCount: 0
    };
}

function updateStats(stats, nameFrequency) {
    // Mettre à jour le nombre de noms uniques
    stats.uniqueNames = Object.keys(nameFrequency).length;

    // Calculer le nombre total de personnes avec des occurrences
    stats.total = Object.values(nameFrequency).reduce((sum, count) => sum + count, 0);

    // // Affichage des statistiques (optionnel, vous pouvez le commenter si non nécessaire)
    // console.log(`\n personnes dans le nuage : ${stats.total}`+`, noms uniques : ${stats.uniqueNames}` + `, Personnes dans la période : ${stats.inPeriod}`);
    
    // Vous pouvez ajouter d'autres logs ou traitements si nécessaire
    // Calculer la moyenne pondérée des durées de vie
    let weightedSum = 0;
    let totalCount = 0;
    
    if (nameFrequency && Object.keys(nameFrequency).length > 0) {
        // Calculer la moyenne pondérée pour 'duree_vie'
        Object.entries(nameFrequency).forEach(([age, count]) => {
            // Vérifier que l'âge est un nombre valide
            const ageNum = parseInt(age, 10);
            if (!isNaN(ageNum)) {
                weightedSum += ageNum * count;
                totalCount += count;
            }
        });
    }

    // Ajouter la moyenne à stats
    stats.averageLifespan = totalCount > 0 ? (weightedSum / totalCount).toFixed(1) : 0;

    // Affichage des statistiques
    console.log(`\n personnes dans le nuage : ${stats.total}` + 
                `, noms uniques : ${stats.uniqueNames}` + 
                `, Personnes dans la période : ${stats.inPeriod}` +
                (stats.averageLifespan ? `, Durée de vie moyenne : ${stats.averageLifespan} ans` : ''));
    
    return stats.averageLifespan;

}

function convertToNameData(nameFrequency) {
    return Object.entries(nameFrequency)
        .map(([text, size]) => ({ text, size }))
        .sort((a, b) => b.size - a.size);
}

export function getPersonsFromTree(mode, rootPersonId = null) {
    // Sauvegarder la valeur initiale des générations
    const initialGenerations = state.nombre_generation;
    
    try {
        // Forcer le nombre de générations à 100 pour explorer tout l'arbre
        state.nombre_generation = 100;
        
        const persons = [];
        const processedIds = new Set();

        function addPersonAndDescendants(personId, depth = 0) {
            if (processedIds.has(personId) || depth > state.nombre_generation) return;
            processedIds.add(personId);

            const person = state.gedcomData.individuals[personId];
            if (person) persons.push(person);

            if (mode === 'descendants') {
                // Utiliser buildDescendantTree pour trouver les descendants
                const tree = buildDescendantTree(personId, new Set(), depth);
                if (tree && tree.children) {
                    tree.children.forEach(child => {
                        // Filtrer uniquement les vrais descendants (pas les conjoints)
                        if (child.id && !child.isSpouse) {
                            addPersonAndDescendants(child.id, depth + 1);
                        }
                    });
                }
            } else if (mode === 'ancestors') {
                // Utiliser buildAncestorTree pour trouver les ancêtres
                const tree = buildAncestorTree(personId, new Set(), depth);
                if (tree && tree.children) {
                    tree.children.forEach(parent => {
                        if (parent.id) addPersonAndDescendants(parent.id, depth + 1);
                    });
                }
            }
        }

        if (mode === 'all') {
            // Utiliser tous les individus du fichier
            return Object.values(state.gedcomData.individuals);
        } else if (rootPersonId) {
            addPersonAndDescendants(rootPersonId);
        }

        return persons;
    } finally {
        // Toujours rétablir le nombre de générations initial
        state.nombre_generation = initialGenerations;
    }
}

/**
 * Fonction génériques de filtrage des personnes selon un texte
 * À placer avant handleClick dans nameCloudRenderer.js
 * 
 * @param {string} text - Le texte à rechercher
 * @param {Object} config - La configuration actuelle
 * @returns {Array} - Liste des personnes filtrées
 */
export function filterPeopleByText(text, config) {
    if (!state.gedcomData) return [];
    
    const persons = getPersonsFromTree(config.scope, config.rootPersonId);

    return Object.values(state.gedcomData.individuals)
        .filter(p => {
            let matches = false;
            
            if (config.type === 'prenoms') {
                const firstName = p.name.split('/')[0].trim();
                matches = firstName.split(' ').some(name => 
                    name.toLowerCase() === text.toLowerCase() || 
                    name.toLowerCase().startsWith(text.toLowerCase() + ' ')
                );
            } else if (config.type === 'noms') {
                matches = (p.name.split('/')[1] && p.name.split('/')[1].toLowerCase().trim() === text.toLowerCase());
            } else if (config.type === 'professions') {
                const cleanedProfessions = cleanProfession(p.occupation);
                matches = cleanedProfessions.includes(text.toLowerCase());
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
                                            if (ageAtChildBirth.toString() === text) {
                                                matches = true;
                                                p.date = `Parent né(e) en ${p.birthDate}, enfant: ${child.name.replace(/\//g, '')} né(e) en ${child.birthDate}`;
                                            }
                                        }
                                    }
                                });
                            }
                        });
                    }
                }
            } else if (config.type === 'duree_vie') {
                // Calcul de la durée de vie
                if (p.birthDate && p.deathDate) {
                    const birthYear = extractYear(p.birthDate);
                    const deathYear = extractYear(p.deathDate);
                    
                    // Vérifier que la personne a vécu pendant la période sélectionnée
                    const startYear = Math.min(config.startDate, config.endDate);
                    const endYear = Math.max(config.startDate, config.endDate);
                    
                    if (birthYear <= endYear && deathYear >= startYear) {
                        const age = deathYear - birthYear;
                        matches = age.toString() === text;
                    }
                }
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
                    return cleanedLocation === text;
                });
            }   

            // Vérifier si la personne est dans l'arbre approprié selon le scope
            const isInTree = 
                config.scope === 'all' || 
                (config.scope === 'descendants' && persons.some(descendant => descendant.id === p.id)) ||
                (config.scope === 'ancestors' && persons.some(ancestor => ancestor.id === p.id));

            return matches && isInTree && hasDateInRange(p, config);
        })
        .map(p => ({
            name: p.name.replace(/\//g, ''),
            id: p.id,
            occupation: p.occupation || 'Non spécifiée'
        }));
}

/**
 * Fonction pour extraire le texte de recherche du titre d'une liste
 * À placer dans geoHeatMapInteractions.js
 */
export function extractSearchTextFromTitle(titleElement) {
    if (!titleElement) return null;
    
    const titleText = titleElement.textContent;
    let searchText = null;
    
    // Pattern pour prénom/nom: "Personnes avec le prénom/nom "X" (Y personnes)"
    let match = titleText.match(/avec le (?:prénom|nom) "([^"]+)"/);
    if (match && match[1]) {
        searchText = match[1];
    }
    
    // Pattern pour métier: "Personnes avec la profession "X" (Y personnes)"
    if (!searchText) {
        match = titleText.match(/avec la profession "([^"]+)"/);
        if (match && match[1]) {
            searchText = match[1];
        }
    }
    
    // Pattern pour durée de vie: "Personnes ayant vécu X ans (Y personnes)"
    if (!searchText) {
        match = titleText.match(/ayant vécu (\d+) ans/);
        if (match && match[1]) {
            searchText = match[1];
        }
    }
    
    // Pattern pour âge de procréation: "Personnes ayant eu un enfant à X ans (Y personnes)"
    if (!searchText) {
        match = titleText.match(/ayant eu un enfant à (\d+) ans/);
        if (match && match[1]) {
            searchText = match[1];
        }
    }
    
    // Pattern pour lieux: "Personnes ayant un lien avec le lieu X (Y personnes)"
    if (!searchText) {
        match = titleText.match(/ayant un lien avec le lieu ([^(]+)/);
        if (match && match[1]) {
            searchText = match[1].trim();
        }
    }
    
    return searchText;
}