
import { state, showToast } from './main.js';
import { buildAncestorTree, buildDescendantTree } from './treeOperations.js';
import { centerCloudNameContainer } from './nameCloudRenderer.js';
// import { state, displayPersonDetails, showToast } from './main.js';
// import { startAncestorAnimation } from './treeAnimation.js';

import { createNameCloudUI } from './nameCloudUI.js';
import { hasDateInRange, isValidSurName, extractYear, cleanSurName, cleanFamilyName, formatFamilyName, isValidFamilyName , cleanProfession, cleanLocation, capitalizeName  } from './nameCloudUtils.js';


export const nameCloudState = {
    mobilePhone: false,
    totalWords: 0,
    placedWords: 0,
    SVG_width: 1920,
    SVG_height: 1080,
    currentConfig: null,
    currentNameData: null,
};


export function processNamesCloudWithDate(config, containerElement = null) {
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
    console.log(message);
    showToast(message, 3000)
}

export function processNamesData(config) {
    const nameFrequency = {};
    const stats = initializeStats();

    const persons = getPersonsFromTree(config.scope, config.rootPersonId);
    
    persons.forEach(person => {
        processPersonData(person, config, nameFrequency, stats);
    });

    updateStats(stats, nameFrequency);

    return convertToNameData(nameFrequency);
}

function processPersonData(person, config, nameFrequency, stats) {
    const hasDate = hasDateInRange(person, config, stats);
    
    if (config.type === 'prenoms') {
        const firstName = person.name.split('/')[0].trim();
        const firstNames = firstName
            .split(' ')
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
                const cleanedLocation = cleanLocation(location);
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
        total: 0  // Ajoutez cette ligne
    };
}

function updateStats(stats, nameFrequency) {
    // Mettre à jour le nombre de noms uniques
    stats.uniqueNames = Object.keys(nameFrequency).length;

    // Calculer le nombre total de personnes avec des occurrences
    stats.total = Object.values(nameFrequency).reduce((sum, count) => sum + count, 0);

    // Affichage des statistiques (optionnel, vous pouvez le commenter si non nécessaire)
    console.log('\n===== STATISTIQUES GLOBALES =====');
    console.log(`\nNombre total de personnes dans le nuage : ${stats.total}`);
    console.log(`Nombre de noms uniques : ${stats.uniqueNames}`);
    console.log(`Personnes dans la période : ${stats.inPeriod}`);
    
    // Vous pouvez ajouter d'autres logs ou traitements si nécessaire
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
