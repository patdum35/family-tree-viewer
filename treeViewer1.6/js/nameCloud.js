
import { state, showToast, trackPageView, hideAndCleanupTreeButtons, updateRadarButtonText } from './main.js';
import { buildAncestorTree, buildDescendantTree } from './treeOperations.js';
import { centerCloudNameContainer } from './nameCloudRenderer.js';
import { createNameCloudUI } from './nameCloudUI.js';
import { hasDateInRange, isValidSurName, extractYear, cleanSurName, cleanFamilyName, formatFamilyName, isValidFamilyName , cleanProfessionForNameCloud, cleanLocation, capitalizeName  } from './nameCloudUtils.js';
import { hideHamburgerButtonForcefully, offsetHamburgerButtonDown, resetHamburgerButtonPosition } from './hamburgerMenu.js';
import { enableBackground } from './backgroundManager.js';
import { loadSettingsFromLocalStorage } from './nameCloudSettings.js';
import { translateOccupation } from './occupations.js'; 
import { disableFortuneModeWithLever, disableFortuneModeClean } from './treeWheelAnimation.js';
import { closeAllModals, debounce } from './eventHandlers.js';
import { fullResetAnimationState } from './treeAnimation.js';

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
    cloudShape: 'rectangle',
    padding: 4,
    paddingLocal: 4,
    fontFamily: 'Arial',
    isShapeBorder: false,
    isThreeZones: true,
    wordRotation: false,
    wordMovement: 'none', //'simple',   // Can be 'none', 'simple', 'bounce', or 'float'
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
    statsConfig: null,
    
    animationStyle: "none",
}

let resizeTimeout;

export function processNamesCloudWithDate(config, containerElement = null, isCallFromCloudName = false) {onclick
    const isForceTreeRadarButton = true;  
    if (!isCallFromCloudName) {
        nameCloudState.isButtonOnDisplayBeforeCloud = state.isButtonOnDisplay;
    }
    console.log("\n\n\n\ ########################   Debug  start nuage: state.isButtonOnDisplay",state.isButtonOnDisplay , nameCloudState.isButtonOnDisplayBeforeCloud, ', isCallFromCloudName=',isCallFromCloudName, config, nameCloudState.currentConfig, " ###########################\n\n\n");
    buttonsOnDisplay(true);

    if (!config) {
        config = nameCloudState.currentConfig;
    }

    const isCloseHeatMapWrapper = !isCallFromCloudName;
    closeAllModals(true, isCloseHeatMapWrapper);
    fullResetAnimationState();

    if(!isCallFromCloudName) {
        state.previousMode = (state.isRadarEnabled) ? 'radar' : 'tree';
        // console.log('\n\n debug state.previousMode = (state.isRadarEnabled) ? radar : tree;', ', previousMode=', state.previousMode, ', isRadarEnabled=',state.isRadarEnabled )
    }

    updateRadarButtonText(isForceTreeRadarButton);

    state.isRadarEnabled = false;

    // console.log('\n debug 🔄 Désactivation du mode Fortune... disableFortuneModeClean')
    disableFortuneModeClean();
    // console.log('\n debug 🔄 Désactivation du mode Fortune... disableFortuneModeWithLever')    
    disableFortuneModeWithLever();

    hideAndCleanupTreeButtons();
    
    trackPageView('wordCloud');

    state.isWordCloudEnabled = true; // Activer le nuage de mots
    
    // Pour désactiver le fond d'écran
    enableBackground(false);

    // Appeler la fonction au chargement du module
    loadSettingsFromLocalStorage();

    // Masquer le menu hamburger
    console.log("Masquer le menu hamburger");
    // hideHamburgerButtonForcefully();
    offsetHamburgerButtonDown();
   
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

    // if (config.scope != 'all'  && !config.rootPersonId) {
    //     config.rootPersonId = state.rootPersonId;
    //     console.log('\n\n\n -***** - debug  processNamesCloudWithDate: config ', config, state.rootPersonId, '\n\n\n')
    // }


    // Logique principale de traitement des données
    const nameData = processNamesData(config);


    // console.log("\n\n Données traitées pour le nuage de noms:", nameData);

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

    // const textsArray = nameData.map(item => item.text);

    // console.log("\n\n\n\ ########################   Debug  nuage:", textsArray, " ###########################\n\n\n");

    // // Sauvegarder dans un fichier
    // async function saveToFile(data) {
    //     try {
    //         const handle = await window.showSaveFilePicker({
    //             suggestedName: 'nuage_noms.txt',
    //             types: [{
    //                 description: 'Fichier texte',
    //                 accept: {'text/plain': ['.txt']},
    //             }],
    //         });
            
    //         const writable = await handle.createWritable();
    //         // Formater les données sous forme de tableau littéral
    //         const formattedData = `[${data.map(text => `"${text}"`).join(', ')}]`;
    //         await writable.write(formattedData);
    //         await writable.close();
            
    //         console.log("✅ Fichier sauvegardé avec succès");
    //     } catch (err) {
    //         console.error("❌ Erreur lors de la sauvegarde:", err);
    //     }
    // }

    // // Appeler la fonction de sauvegarde
    // saveToFile(textsArray);

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


    window.addEventListener('resize',() => { 
        if (!state.isWordCloudEnabled) return;
        if (!containerElement) return;
        // requestAnimationFrame(() => {
            buttonsOnDisplay(false);
        // });



        // Dimensions de l'écran
        nameCloudState.SVG_width = window.innerWidth;
        nameCloudState.SVG_height = window.innerHeight;
        nameCloudState.mobilePhone = false;
        if (Math.min(window.innerWidth, window.innerHeight) < 400 ) nameCloudState.mobilePhone = 1;
        else if (Math.min(window.innerWidth, window.innerHeight) < 600 ) nameCloudState.mobilePhone = 2;

        // for mobile phone
        if (nameCloudState.mobilePhone) 
            { nameCloudState.SVG_width = window.innerWidth + 50; nameCloudState.SVG_height = window.innerHeight + 50; }

        // Redimensionner le SVG existant immédiatement (évite les bandes grises)
        const svg = containerElement.querySelector('svg');
        if (svg) {
            svg.setAttribute('width', window.innerWidth);
            svg.setAttribute('height', window.innerHeight);
        }

        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {

            requestAnimationFrame(() => {
                buttonsOnDisplay(false);
            });
            requestAnimationFrame(() => {
                console.log('\n\n*** debug resize in processNamesCloudWithDate ################ \n\n')
                createNameCloudUI.renderInContainer(nameData, config, containerElement); 
            });    
        }, 200);

        setTimeout(() => {
            requestAnimationFrame(() => {
                const searchRootOverlay = document.getElementById('resultsTreeOverlay');
                const isRootPersonNeeded = ['ancestors', 'directAncestors', 'descendants', 'directDescendants'].includes(nameCloudState.scopeSelect.value);
                // console.log('\n\n***** debug buttonsOnDisplay nameCloudState.scopeSelect.value', nameCloudState.scopeSelect.value, ', searchRootOverlay=',searchRootOverlay, isRootPersonNeeded)
                buttonsOnDisplay(true);
                searchRootOverlay.style.display = isRootPersonNeeded ? 'flex' : 'none';
            });
        }, 200);

    });
}

export function processNamesData(config, searchTerm = null, isFromStatsModal = false) {
    const nameFrequency = {};
    const originalName = {};
    const stats = initializeStats();

    const persons = getPersonsFromTree(config.scope, config.rootPersonId);


    console.log('\n debug processNamesData  ', config, searchTerm)

    
    counter_marchand = 0;
    nameFrequencyFirstWord = [];
    persons.forEach(person => {
        processPersonData(person, config, nameFrequency, stats, { doNotClean: false}, originalName, searchTerm);
    });
   
    const averages = updateStats(stats, nameFrequency);


    // console.log('-debug in processNamesData before convertToNameData , nameFrequency =', nameFrequency)

    const result = convertToNameData(nameFrequency, originalName);

    // console.log('-debug in processNamesData after convertToNameData , nameFrequency =', nameFrequency, ' , result= ', result)    
    
    // Ajouter la moyenne à l'objet retourné
    result.averageData = averages.average;
    result.maleAverageData = averages.male;
    result.femaleAverageData = averages.female;

    return result;

}


let counter_marchand = 0;
let nameFrequencyFirstWord = [];

export function processPersonData(person, config, nameFrequency, stats, options = {}, originalName = {}, searchTerm = null) {

    const { inRange, date } = hasDateInRange(person, config, stats);
    const hasDate = inRange; // Pour compatibilité avec le code existant
    let searchStr = null;
    let isMatched = true;
    if (searchTerm) { 
        searchStr = searchTerm.toLowerCase();
        isMatched = false;
    }


    // console.log('\n debug processPersonData  ', config, searchStr)

    const currentLang = window.CURRENT_LANGUAGE || 'fr';

    if (config.type === 'prenoms') {
        const firstName = person.name.split('/')[0].trim();
        const firstNames = firstName
            .split(/[ ,]+/) // Split sur l'espace ou la virgule
            .map(name => cleanSurName(name))
            .filter(name => isValidSurName(name))
            .map(name => capitalizeName(name));
        
        if (firstName.toLowerCase().includes(searchStr)) {
            isMatched = true;
        }

        if (hasDate && isMatched) {
            stats.inPeriod++;
            firstNames.forEach(name => {
                if (name) {
                    nameFrequency[name] = (nameFrequency[name] || 0) + 1;
                    originalName[name] = person.name.split('/')[0].trim();
                }
            });
        }
    } else if (config.type === 'noms') {
        const familyName = person.name.split('/')[1];
        if (familyName.toLowerCase().includes(searchStr)) {
            isMatched = true;
            // console.log('-debug in processPersonData', person.name)
        }
        if (familyName && hasDate && isMatched ) {
            stats.inPeriod++;
            const cleanedName = cleanFamilyName(familyName);
            const formattedName = formatFamilyName(cleanedName);
            // console.log('-debug in processPersonData cleanedName', cleanedName, ', formattedName=', formattedName, ', isValidFamilyName=', isValidFamilyName(formattedName))
            if (formattedName && isValidFamilyName(formattedName)) {
                nameFrequency[formattedName] = (nameFrequency[formattedName] || 0) + 1;
                originalName[formattedName] = person.name.split('/')[1];
            }
        }
    } else if (config.type === 'professions') {
        if (person.occupationFull && person.occupationFull.toLowerCase().includes(searchStr)) {
            isMatched = true;
        }
        if ((person.occupationFull) && hasDate && isMatched) {
            // console.log('debug ', searchStr, person.name, person.occupationFull )
            stats.inPeriod++;
            const cleanedProfessions = cleanProfessionForNameCloud(person.occupationFull);

            let shortProfDetected = [];
            let previousNameFrequencyFirstWord = null;
            if (nameFrequencyFirstWord) {
                previousNameFrequencyFirstWord = nameFrequencyFirstWord; 
            }

            cleanedProfessions.forEach(prof => {
                if (prof) {
                    // Si la langue courante est le français, pas besoin de traduire
                    // if (currentLang === 'fr') {
                    if (true) { // Finalement je supprime la traduction des métiers : c'est trop compliqué
                        const shortProfs =  prof.split(/[ \-]/);  //  séparer sur espace, tiret 
                        const profLength = prof.split(/[ \-]/).length

                        if (profLength > 1) { 
                            nameFrequency[prof] = (nameFrequency[prof] || 0) + 1;
                        } else if  (profLength === 1 &&  !(nameFrequency[prof] && shortProfDetected[prof]) ) {
                                nameFrequency[prof] = (nameFrequency[prof] || 0) + 1;
                        }
                
                        if (profLength > 1) {
                            for (let i = 0; i < profLength - 1; i++) {  // sortir avant le dernier élément
                                const shortProf = shortProfs[i];
                                if ( !nameFrequency[shortProf] && !shortProfDetected[shortProf]) {
                                    nameFrequencyFirstWord[shortProf] = (nameFrequencyFirstWord[shortProf]|| 0)  + 1;
                                } else if ( nameFrequency[shortProf] && !shortProfDetected[shortProf]) {
                                    nameFrequency[shortProf] = (nameFrequency[shortProf] || 0) + 1;
                                    shortProfDetected[shortProf] = true;
                                } 
                            }
                        }

                        if (profLength === 1 && previousNameFrequencyFirstWord[prof]) {
                                nameFrequency[prof] = nameFrequency[prof]  + previousNameFrequencyFirstWord[prof];                                
                                delete nameFrequencyFirstWord[prof];
                                delete previousNameFrequencyFirstWord[prof];
                        }

                        originalName[prof] = prof;

                        // if (prof.includes('roi')) {
                        //     counter_marchand++;
                        //     console.log('debug processPersonData prof=', prof, 'prof[0]=', shortProfs[0], person.name, person.occupationFull, cleanedProfessions, ', counter=', counter_marchand, ', final=','roi','=', nameFrequency['roi'], 'final', prof,'=' , nameFrequency[prof], 'start', shortProfs[0], '=', nameFrequencyFirstWord[shortProfs[0]], shortProfs[0], shortProfs[1], shortProfs[2], shortProfs[3], shortProfs[4])
                        // }

                    } else {
                        // Traduire la profession vers la langue courante
                        const translatedProfession = translateOccupation(prof, currentLang);
                        nameFrequency[translatedProfession] = (nameFrequency[translatedProfession] || 0) + 1;
                        originalName[translatedProfession] = prof;
                    }

                }
            });
        }
    } else if (config.type === 'lieux') {
        const allLocations = [];
       
        if (hasDate) {

            // Les personnes ne stockent généralement pas directement leur lieu de mariage
            // Il faut la récupérer via les familles où elles apparaissent comme conjoint
            if (person.spouseFamilies && person.spouseFamilies.length > 0) {
                // Pour chaque famille où la personne est un conjoint
                person.spouseFamilies.forEach(familyId => {
                    const family = state.gedcomData.families[familyId];
                    if (family && family.marriagePlace) {
                        person.marriagePlace = family.marriagePlace; // On peut aussi récupérer le lieu de mariage
                    }
                });
            }


            const potentialLocations = [
                person.birthPlace, 
                person.deathPlace, 
                person.marriagePlace, 
                person.residPlace1, 
                person.residPlace2, 
                person.residPlace3
            ];
            
            let searchStrBis = '';
            if (searchStr)  { searchStrBis = searchStr.replace(' ','-'); }
            potentialLocations.forEach(location => {
                // const cleanedLocation = cleanLocation(location);
                const cleanedLocation = options.doNotClean ? location : cleanLocation(location);
                if (cleanedLocation) {
                    if (cleanedLocation.toLowerCase().includes(searchStr) || cleanedLocation.toLowerCase().includes(searchStrBis) ) {
                        isMatched = true;
                    }
                }
                if (cleanedLocation && isMatched ) {
                    allLocations.push(cleanedLocation);
                }

            });
        }
        
        allLocations.forEach(location => {
            nameFrequency[location] = (nameFrequency[location] || 0) + 1;
            originalName[location] = location;
        });
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
                    
                    // Initialiser l'objet avec compteurs par sexe s'il n'existe pas
                    if (!nameFrequency[ageStr]) {
                        nameFrequency[ageStr] = {
                            count: 0,
                            males: 0,
                            females: 0
                        };
                    } else if (typeof nameFrequency[ageStr] === 'number') {
                        // Convertir l'ancien format (simple nombre) en objet avec compteurs par sexe
                        nameFrequency[ageStr] = {
                            count: nameFrequency[ageStr],
                            males: 0,
                            females: 0
                        };
                    }
                    
                    // Incrémenter le compteur total
                    nameFrequency[ageStr].count++;
                    
                    // Incrémenter le compteur par sexe
                    if (person.sex === 'M') {
                        nameFrequency[ageStr].males++;
                    } else if (person.sex === 'F') {
                        nameFrequency[ageStr].females++;
                    } else {
                        // Si le sexe n'est pas spécifié, répartir équitablement
                        nameFrequency[ageStr].males += 0.5;
                        nameFrequency[ageStr].females += 0.5;
                    }
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
                                        // Initialiser l'objet avec compteurs par sexe s'il n'existe pas
                                        if (!nameFrequency[ageStr]) {
                                            nameFrequency[ageStr] = {
                                                count: 0,
                                                males: 0,
                                                females: 0
                                            };
                                        } else if (typeof nameFrequency[ageStr] === 'number') {
                                            // Convertir l'ancien format (simple nombre) en objet avec compteurs par sexe
                                            nameFrequency[ageStr] = {
                                                count: nameFrequency[ageStr],
                                                males: 0,
                                                females: 0
                                            };
                                        }
                                        
                                        // Incrémenter le compteur total
                                        nameFrequency[ageStr].count++;
                                        
                                        // Incrémenter le compteur par sexe
                                        if (person.sex === 'M') {
                                            nameFrequency[ageStr].males++;
                                        } else if (person.sex === 'F') {
                                            nameFrequency[ageStr].females++;
                                        } else {
                                            // Si le sexe n'est pas spécifié, répartir équitablement
                                            nameFrequency[ageStr].males += 0.5;
                                            nameFrequency[ageStr].females += 0.5;
                                        }
                                        // nameFrequency[ageStr] = (nameFrequency[ageStr] || 0) + 1;
                                    }
                                }
                            }
                        });
                    }
                });
            }
        }
    } else if (config.type === 'age_first_child') {
        if (person.birthDate) {
            const parentBirthYear = extractYear(person.birthDate);
            
            if (person.spouseFamilies) {
                // Construire un tableau de tous les enfants avec leur année de naissance
                const children = [];
                person.spouseFamilies.forEach(familyId => {
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
                                        name: child.name
                                    });
                                }
                            }
                        });
                    }
                });
                
                // Trier les enfants par année de naissance
                children.sort((a, b) => a.birthYear - b.birthYear);
                
                // Si au moins un enfant est trouvé
                if (children.length > 0) {
                    const firstChild = children[0];
                    const ageAtFirstChild = firstChild.birthYear - parentBirthYear;
                    
                    const startYear = Math.min(config.startDate, config.endDate);
                    const endYear = Math.max(config.startDate, config.endDate);
                    
                    if ((parentBirthYear <= endYear) && (parentBirthYear >= startYear) && ageAtFirstChild >= 10 && ageAtFirstChild <= 100) {
                        stats.inPeriod++;
                        const ageStr = ageAtFirstChild.toString();
                        
                        // Initialiser l'objet avec compteurs par sexe s'il n'existe pas
                        if (!nameFrequency[ageStr]) {
                            nameFrequency[ageStr] = {
                                count: 0,
                                males: 0,
                                females: 0
                            };
                        } else if (typeof nameFrequency[ageStr] === 'number') {
                            // Convertir l'ancien format (simple nombre) en objet avec compteurs par sexe
                            nameFrequency[ageStr] = {
                                count: nameFrequency[ageStr],
                                males: 0,
                                females: 0
                            };
                        }
                        
                        // Incrémenter le compteur total
                        nameFrequency[ageStr].count++;
                        
                        // Incrémenter le compteur par sexe
                        if (person.sex === 'M') {
                            nameFrequency[ageStr].males++;
                        } else if (person.sex === 'F') {
                            nameFrequency[ageStr].females++;
                        } else {
                            // Si le sexe n'est pas spécifié, répartir équitablement
                            nameFrequency[ageStr].males += 0.5;
                            nameFrequency[ageStr].females += 0.5;
                        }

                    }
                }
            }
        }

    } else if (config.type === 'age_marriage') {
        // Les personnes ne stockent généralement pas directement leur date de mariage
        // Il faut la récupérer via les familles où elles apparaissent comme conjoint
        if (person.birthDate && person.spouseFamilies && person.spouseFamilies.length > 0) {
            const birthYear = extractYear(person.birthDate);
            
            // Pour chaque famille où la personne est un conjoint
            person.spouseFamilies.forEach(familyId => {
                const family = state.gedcomData.families[familyId];
                if (family && family.marriageDate) {
                    const marriageYear = extractYear(family.marriageDate);
                    
                    const startYear = Math.min(config.startDate, config.endDate);
                    const endYear = Math.max(config.startDate, config.endDate);
                    
                    // Vérifier que la naissance est dans la période et que le mariage est après la naissance
                    if (birthYear <= endYear && birthYear >= startYear && marriageYear > birthYear) {
                        const ageAtMarriage = marriageYear - birthYear;
                        if (ageAtMarriage >= 10 && ageAtMarriage <= 100) {
                            stats.inPeriod++;
                            const ageStr = ageAtMarriage.toString();
                            
                            // Initialiser l'objet avec compteurs par sexe s'il n'existe pas
                            if (!nameFrequency[ageStr]) {
                                nameFrequency[ageStr] = {
                                    count: 0,
                                    males: 0,
                                    females: 0
                                };
                            } else if (typeof nameFrequency[ageStr] === 'number') {
                                // Convertir l'ancien format (simple nombre) en objet avec compteurs par sexe
                                nameFrequency[ageStr] = {
                                    count: nameFrequency[ageStr],
                                    males: 0,
                                    females: 0
                                };
                            }
                            
                            // Incrémenter le compteur total
                            nameFrequency[ageStr].count++;
                            
                            // Incrémenter le compteur par sexe
                            if (person.sex === 'M') {
                                nameFrequency[ageStr].males++;
                            } else if (person.sex === 'F') {
                                nameFrequency[ageStr].females++;
                            } else {
                                // Si le sexe n'est pas spécifié, répartir équitablement
                                nameFrequency[ageStr].males += 0.5;
                                nameFrequency[ageStr].females += 0.5;
                            }
                        }
                    }
                }
            });
        }

    } else if (config.type === 'nombre_enfants') {
        if (hasDate) {
            let totalChildren = 0;
            
            if (person.spouseFamilies) {
                person.spouseFamilies.forEach(familyId => {
                    const family = state.gedcomData.families[familyId];
                    if (family && family.children) {
                        totalChildren += family.children.length;
                    }
                });
            }
            
            if (totalChildren > 0) {
                stats.inPeriod++;
                const countStr = totalChildren.toString();
                
                // Initialiser l'objet avec compteurs par sexe s'il n'existe pas
                if (!nameFrequency[countStr]) {
                    nameFrequency[countStr] = {
                        count: 0,
                        males: 0,
                        females: 0
                    };
                } else if (typeof nameFrequency[countStr] === 'number') {
                    // Convertir l'ancien format (simple nombre) en objet avec compteurs par sexe
                    nameFrequency[countStr] = {
                        count: nameFrequency[countStr],
                        males: 0,
                        females: 0
                    };
                }
                
                // Incrémenter le compteur total
                nameFrequency[countStr].count++;
                
                // Incrémenter le compteur par sexe
                if (person.sex === 'M') {
                    nameFrequency[countStr].males++;
                } else if (person.sex === 'F') {
                    nameFrequency[countStr].females++;
                } else {
                    // Si le sexe n'est pas spécifié, répartir équitablement
                    nameFrequency[countStr].males += 0.5;
                    nameFrequency[countStr].females += 0.5;
                }
            }
        }
    } 

    // Retourner la date pertinente pour une utilisation éventuelle
    return date;
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
    };
}

function updateStats(stats, nameFrequency) {
    // Log sécurisé qui vérifie si currentConfig existe
    // console.log("Type actuel:", nameCloudState.currentConfig ? nameCloudState.currentConfig.type : "non défini");
    // console.log("Détail des fréquences:", Object.keys(nameFrequency).length);
    
    // Compter manuellement le total pour vérification
    let totalManual = 0;
    for (const key in nameFrequency) {
        if (typeof nameFrequency[key] === 'object' && nameFrequency[key] !== null) {
        totalManual += nameFrequency[key].count || 0;
        } else {
        totalManual += nameFrequency[key] || 0;
        }
    }
    // console.log("Total manuel:", totalManual);






    


    // Mettre à jour le nombre de noms uniques
    stats.uniqueNames = Object.keys(nameFrequency).length;

    // Variables pour les calculs
    let totalSum = 0;
    let totalCount = 0;
    let maleSum = 0;
    let maleCount = 0;
    let femaleSum = 0;
    let femaleCount = 0;
    
    // Vérifier si nameFrequency utilise le nouveau format (avec males/females)
    const useGenderStats = Object.values(nameFrequency).some(value => 
        typeof value === 'object' && 'count' in value);
    
    if (useGenderStats) {
        // Nouveau format avec genre
        Object.entries(nameFrequency).forEach(([age, data]) => {
            const ageNum = parseInt(age, 10);
            if (!isNaN(ageNum)) {
                // Total
                totalSum += ageNum * data.count;
                totalCount += data.count;
                
                // Hommes
                maleSum += ageNum * data.males;
                maleCount += data.males;
                
                // Femmes
                femaleSum += ageNum * data.females;
                femaleCount += data.females;
            }
        });
        
        // Calculer le nombre total de personnes
        stats.total = totalCount;
    } else {
        // Ancien format (pour rétrocompatibilité)
        Object.entries(nameFrequency).forEach(([age, count]) => {
            const ageNum = parseInt(age, 10);
            if (!isNaN(ageNum)) {
                totalSum += ageNum * count;
                totalCount += count;
            }
        });
        
        // Calculer le nombre total de personnes
        stats.total = Object.values(nameFrequency).reduce((sum, count) => 
            sum + (typeof count === 'number' ? count : 0), 0);
    }

    // Calculer les moyennes
    const average = totalCount > 0 ? (totalSum / totalCount).toFixed(1) : 0;
    const maleAverage = maleCount > 0 ? (maleSum / maleCount).toFixed(1) : 0;
    const femaleAverage = femaleCount > 0 ? (femaleSum / femaleCount).toFixed(1) : 0;

    // Ajouter ce log pour le diagnostic
    if (nameCloudState.currentConfig && nameCloudState.currentConfig.type) {
        console.log(`Statistiques GLOBALES pour ${nameCloudState.currentConfig.type}:`, 
            "totalCount=", totalCount, 
            "totalSum=", totalSum, 
            "moyenne=", average,
            "plage de dates:", nameCloudState.currentConfig.startDate, "à", nameCloudState.currentConfig.endDate);
    }

    // Affichage des statistiques
    console.log(`\n personnes dans le nuage : ${stats.total}` + 
                `, noms uniques : ${stats.uniqueNames}` + 
                `, Personnes dans la période : ${stats.inPeriod}` +
                (average ? `, Moyenne : ${average} ans` : '') +
                (maleAverage ? `, Hommes : ${maleAverage} ans` : '') +
                (femaleAverage ? `, Femmes : ${femaleAverage} ans` : ''));
    
    // Renvoyer un objet avec toutes les moyennes
    return {
        average: average,
        male: maleAverage,
        female: femaleAverage
    };
}

function convertToNameData(nameFrequency, originalName) {
    return Object.entries(nameFrequency)
        .map(([text, value]) => {
            // Vérifier si la valeur est un objet avec des compteurs par sexe
            if (typeof value === 'object' && value !== null && 'count' in value) {
                return {
                    text,
                    size: value.count,
                    males: value.males || 0,
                    females: value.females || 0,
                    originalName: originalName[text]
                };
            } else {
                // Ancien format (simple nombre)
                return {
                    text,
                    size: value,
                    males: 0,
                    females: 0,
                    originalName: originalName[text]                   
                };
            }
        })
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

            state.treeModeReal = mode;
            if (mode === 'descendants' || mode === 'directDescendants') {
                // Utiliser buildDescendantTree pour trouver les descendants
                const tree = buildDescendantTree(personId, new Set(), depth);
                if (tree && tree.children) {
                    tree.children.forEach(child => {
                        // // Filtrer uniquement les vrais descendants (pas les conjoints)
                        // if (child.id && !child.isSpouse) {

                        //     addPersonAndDescendants(child.id, depth + 1);

                        // }
                        if (child.id ) addPersonAndDescendants(child.id, depth + 1);
                    });
                }
            } else if (mode === 'ancestors' || mode === 'directAncestors') {
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

    console.log("filterPeopleByText called  with name:", text, "and ", config);
    
    const persons = getPersonsFromTree(config.scope, config.rootPersonId);
    const currentLang = window.CURRENT_LANGUAGE || 'fr';

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
                const cleanedProfessions = cleanProfessionForNameCloud(p.occupationFull);

                // if (currentLang === 'fr') {
                if (true) { // Finalement je supprime la traduction des métiers : c'est trop compliqué
                    // En français, on utilise directement le texte
                    const regex = new RegExp(`(^|[ ,.;:(){}\\[\\]\\-_'"])\\s*${text.toLowerCase()}\\s*($|[ ,.;:(){}\\[\\]\\-_'"])`, 'i');
                    matches = cleanedProfessions.some(prof => regex.test(prof));


                    if (matches) {
                        cleanedProfessions.forEach(prof => {
                            if (prof.includes(text.toLowerCase()) && (text.split(' ').length === 1) && (prof.split(' ').length > 1) && prof.split(' ')[prof.split(' ').length-1].includes(text.toLowerCase()) ) {
                                matches = false;
                                console.log('\n\n matches is cancelled, search=',text, 'in ', prof , p.name, ', ' , text.split(' ').length, prof.split(' ').length, prof.split(' ')[0].includes(text.toLowerCase()))
                            }
                        });
                    }

                    // if (p.occupationFull.includes('du roi')) {
                    // if (p.occupationFull.toLowerCase().includes('journalier')) {                        
                    //     console.log('\n\n debug in filterPeopleByText, search=', text, ', in' , p.name, p.occupationFull, ', cleanedProfessions=', cleanedProfessions, matches)
                    // }

                } else {
                    // Pour les autres langues, il faut chercher la profession originale
                    // dont la traduction correspond au texte
                    matches = cleanedProfessions.some(prof => {
                        const translatedProf = translateOccupation(prof, currentLang);
                        return translatedProf.toLowerCase() === text.toLowerCase();
                    });
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
                                if (ageAtMarriage.toString() === text) {
                                    matches = true;
                                    // Ajouter des informations supplémentaires pour l'affichage
                                    const spouse = family.husbandId === p.id ? 
                                        (family.wifeId ? state.gedcomData.individuals[family.wifeId] : null) : 
                                        (family.husbandId ? state.gedcomData.individuals[family.husbandId] : null);
                                    
                                    p.date = `Né(e) en ${p.birthDate}, marié(e) en ${family.marriageDate}`;
                                    if (spouse) {
                                        p.date += ` avec ${spouse.name.replace(/\//g, '')}`;
                                    }
                                }
                            }
                        }
                    });
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
                        if (ageAtFirstChild.toString() === text) {
                            matches = true;
                            p.date = `Parent né(e) en ${p.birthDate}, premier enfant: ${firstChild.name.replace(/\//g, '')} né(e) en ${firstChild.birthDate}`;
                        }
                    }
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
                
                matches = totalChildren.toString() === text;
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

/**
 * Fonction pour collecter et traiter les données par siècle
 * @param {string} type - Type de données à analyser (prénoms, noms, durée de vie, etc.)
 * @returns {Object} - Statistiques organisées par siècle
 */
export function collectCenturyData(type) {
    // Structure pour stocker les statistiques par siècle
    const centuryStats = {};
    
    // Initialiser tous les siècles possibles de -500 à 2100 (27 siècles)
    for (let century = -500; century <= 2100; century += 100) {
        centuryStats[century] = {
            count: 0,
            sum: 0,
            average: 0,
            males: { count: 0, sum: 0, average: 0 },
            females: { count: 0, sum: 0, average: 0 },
            items: [], // Pour stocker les détails (utile pour les versions futures avec types non numériques)
            frequencies: {}, // Pour stocker les fréquences des valeurs non numériques
            sortedFrequencies: [], // Pour stocker les fréquences triées
            originalNames: {}, // Pour stocker les fréquences triées
            top3: [] // Pour stocker le top 3 des éléments les plus fréquents
        };
    }
    
    // Compteurs pour diagnostic
    let totalProcessed = 0;
    let totalIncluded = 0;
    let noDatesCount = 0;
    let outsideRangeCount = 0;

    // Vérifier si le type est numérique ou non
    const numericTypes = ['duree_vie', 'age_procreation', 'age_marriage', 'age_first_child', 'nombre_enfants'];
    const isNumericType = numericTypes.includes(type);
    
    // Obtenir les personnes selon le scope actuel
    const currentScope = nameCloudState.currentConfig ? nameCloudState.currentConfig.scope : 'all';

    const rootPersonId = nameCloudState.currentConfig ? nameCloudState.currentConfig.rootPersonId : null;
    
    // Utiliser la fonction getPersonsFromTree pour respecter le scope
    const persons = getPersonsFromTree(currentScope, rootPersonId);
    
    // console.log('\n\n ***** debug 1rst call to collectCenturyData', nameCloudState.currentConfig,', currentScope=', currentScope, ', rootPersonId=', rootPersonId, persons)

    // console.log(`collectCenturyData : Traitement de ${persons.length} personnes pour ${type}`);
    
    // Pour stocker les personnes déjà traitées par siècle (éviter les doublons)
    const processedPersonsByCentury = {};
    
    // Traiter chaque personne une seule fois
    persons.forEach(person => {
        totalProcessed++;
        
        // Accumulateur temporaire pour cette personne
        const personFrequency = {};
        const originalName = {};
        // Utiliser processPersonData avec une plage de dates très large pour récupérer tous les résultats potentiels
        // La fonction retourne maintenant la date pertinente
        const date = processPersonData(person, {
            type: type,
            startDate: -3000,  // Date très ancienne
            endDate: 3000      // Date très future
        }, personFrequency, { }, { inPeriod: 0 }, originalName); // Stats fictifs, on ne veut pas incrémenter les vrais stats
 


        // console.log('\n\n personFrequency from processPersonData in collectCenturyData', personFrequency, 'originalName=', originalName)        


        // Si aucune date pertinente n'a été trouvée, ignorer cette personne
        if (date === null) {
            noDatesCount++;
            return;
        }
        
        // Si aucune donnée n'a été collectée pour cette personne, passer à la suivante
        if (Object.keys(personFrequency).length === 0) {
            return;
        }
        
        // Déterminer le siècle basé sur la date pertinente retournée
        const century = Math.floor(date / 100) * 100;
        
        // Vérifier si le siècle est dans notre plage
        if (century < -500 || century > 2100) {
            outsideRangeCount++;
            return;
        }
        
        // Éviter de traiter plusieurs fois la même personne pour le même siècle
        processedPersonsByCentury[century] = processedPersonsByCentury[century] || new Set();
        if (processedPersonsByCentury[century].has(person.id)) {
            return;
        }
        processedPersonsByCentury[century].add(person.id);
        
        totalIncluded++;
        
        // Traiter les données selon le type (numérique ou non)
        if (isNumericType) {
            // Pour les types numériques (âges, etc.)
            Object.entries(personFrequency).forEach(([ageStr, data]) => {
                const age = parseInt(ageStr, 10);
                if (!isNaN(age)) {
                    if (typeof data === 'object' && data.count !== undefined) {
                        // Mettre à jour les statistiques totales
                        centuryStats[century].count += data.count;
                        centuryStats[century].sum += age * data.count;
                        
                        // Mettre à jour les statistiques par sexe
                        centuryStats[century].males.count += data.males || 0;
                        centuryStats[century].males.sum += age * (data.males || 0);
                        
                        centuryStats[century].females.count += data.females || 0;
                        centuryStats[century].females.sum += age * (data.females || 0);
                        
                        // Ajouter aux items pour référence future
                        centuryStats[century].items.push({
                            id: person.id,
                            name: person.name,
                            value: age,
                            sex: person.sex,
                            count: data.count
                        });
                    } else if (typeof data === 'number') {
                        // Si c'est juste un nombre (ancien format)
                        centuryStats[century].count += data;
                        centuryStats[century].sum += age * data;
                        
                        // Ajouter aux items
                        centuryStats[century].items.push({
                            id: person.id,
                            name: person.name,
                            value: age,
                            count: data
                        });
                    }
                }
            });
        } else {
            // Pour les types non numériques (prénoms, noms, etc.)
            Object.entries(personFrequency).forEach(([text, count]) => {
                // Incrémenter le compteur total pour ce siècle
                centuryStats[century].count += count;
                
                // Incrémenter la fréquence pour ce texte
                if (!centuryStats[century].frequencies[text]) {
                    centuryStats[century].frequencies[text] = 0;
                }

                centuryStats[century].frequencies[text] += count;
                // console.log('\n debug  in Object.entries(personFrequency).forEach(([text, count]) ', text, originalName)
                centuryStats[century].originalNames[text] = originalName[text];
                
                // Ajouter aux items
                centuryStats[century].items.push({
                    id: person.id,
                    name: person.name,
                    value: text,
                    count: count
                });
            });
        }
    });



    // console.log('\n\n centuryStats in collectCenturyData',centuryStats )


    
    // Calculer les moyennes pour chaque siècle
    for (const century in centuryStats) {
        if (centuryStats[century].count > 0) {
            centuryStats[century].average = centuryStats[century].sum / centuryStats[century].count;
        }
        
        if (centuryStats[century].males.count > 0) {
            centuryStats[century].males.average = centuryStats[century].males.sum / centuryStats[century].males.count;
        }
        
        if (centuryStats[century].females.count > 0) {
            centuryStats[century].females.average = centuryStats[century].females.sum / centuryStats[century].females.count;
        }
        
        // Trier les fréquences par ordre décroissant pour chaque siècle (pour les types non numériques)
        if (!isNumericType) {
            if (Object.keys(centuryStats[century].frequencies).length > 0) {
                // Convertir l'objet de fréquences en tableau pour pouvoir le trier
                const sortedFreq = Object.entries(centuryStats[century].frequencies)
                    .map(([text, count]) => ({ text, count, originalName: centuryStats[century].originalNames[text] }))
                    .sort((a, b) => b.count - a.count);
                
                // Stocker le tableau trié
                centuryStats[century].sortedFrequencies = sortedFreq;
                
                // Conserver les 3 premiers pour le top 3
                centuryStats[century].top3 = sortedFreq.slice(0, 3);
            }
        }
    }
    
    // Logs de diagnostic pour comprendre les différences entre les moyennes
    console.log(`Statistiques PAR SIÈCLE pour ${type}, traitement:`, 
        "traitées=", totalProcessed, 
        "incluses=", totalIncluded,
        "sans dates=", noDatesCount,
        "hors plage=", outsideRangeCount);
    
    // Log spécifique pour l'âge de mariage pour diagnostiquer la différence de moyennes
    if (type === 'age_marriage') {
        console.log("Détail des siècles pour l'âge de mariage:");
        let totalCenturyCount = 0;
        let totalCenturySum = 0;
        
        for (const century in centuryStats) {
            if (centuryStats[century].count > 0) {
                console.log(`Siècle ${century}: ${centuryStats[century].count} occurrences, moyenne=${centuryStats[century].average.toFixed(1)}`);
                totalCenturyCount += centuryStats[century].count;
                totalCenturySum += centuryStats[century].sum;
            }
        }
        
        console.log(`Total calculé: ${totalCenturyCount} occurrences, moyenne=${(totalCenturySum/totalCenturyCount).toFixed(1)}`);
    }
    
    return centuryStats;
}



