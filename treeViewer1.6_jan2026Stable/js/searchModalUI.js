import { createCustomSelector, createOptionsFromLists } from './UIutils.js';
import { state, displayGenealogicTree } from './main.js';
import { nameCloudState, getPersonsFromTree } from './nameCloud.js';
import { selectFoundPerson, debounce, isModalVisible } from './eventHandlers.js';
import { extractYear, findDateForPerson } from './nameCloudUtils.js';
import { createLocationIcon } from './nameCloudStatModal.js';
import { displayHeatMap } from './geoHeatMapUI.js';
import { makeModalDraggableAndResizable, makeModalInteractive, bringToFrontOfHamburgerButton } from './resizableModalUtils.js';
import { adjustSplitScreenLayout } from './nameCloudInteractions.js';
import { resizeModal } from './nameCloudStatModal.js';
import { fullResetAnimationState } from './treeAnimation.js';
import { disableFortuneModeWithLever, disableFortuneModeClean } from './treeWheelAnimation.js';

const searchModalTranslations = {
    fr: {
        title: "Recherche de la pers. racine",
        selectPersonTitle: "Sélection d'une personne",
        nameOption: "par Prénom/Nom",
        placeOption: "par Lieux", 
        occupationOption: "par Profession",
        // nameOptionShort: "par Nom/Pré.",
        nameOptionShort: "par Prénom/Nom",
        placeOptionShort: "par Lieux", 
        // occupationOptionShort: "par Profess.",
        occupationOptionShort: "par Profession",

        searchPlaceholder: "🔍Tapez votre recherche...",
        searchSurnamePlaceholder: "🔍prénom",
        searchNamePlaceholder: "🔍nom",        
        yearStartPlaceholder: "Année début",
        yearEndPlaceholder: "Année fin",
        searchButton: "Search",
        dateFilterLabel: "filtrage<br>par dates",
        helpName: "Recherche dans les prénoms et noms (de jeune fille pour les femmes)",
        helpPlace: "Recherche dans les lieux de naissance, décès, résidence",
        helpOccupation: "Recherche dans les professions, métiers, titres",
        noSearchTerm: "Veuillez saisir un terme de recherche",
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
        title: "Search for root person",
        selectPersonTitle: "Select a person",
        nameOption: "per First name/Name",
        placeOption: "per Places",
        occupationOption: "per Profession",
        nameOptionShort: "per First name/Name",
        placeOptionShort: "per Places",
        occupationOptionShort: "per Profession",
        searchPlaceholder: "🔍Type your search...",
        searchSurnamePlaceholder: "🔍first n.",
        searchNamePlaceholder: "🔍name",     
        yearStartPlaceholder: "Start year",
        yearEndPlaceholder: "End year", 
        searchButton: "Search",
        dateFilterLabel: "date<br>filtering",
        helpName: "Search in first names and names (maiden for women)",
        helpPlace: "Search in birth, death, residence places",
        helpOccupation: "Search in professions, jobs, titles",
        noSearchTerm: "Please enter a search term",
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
        title: "Búsqueda de la persona raíz",
        selectPersonTitle: "Selección de una persona",
        nameOption: "por Nombre/Apellido",
        placeOption: "por Lugares",
        occupationOption: "por Profesión",
        nameOptionShort: "por Nombre/Apellido",
        placeOptionShort: "por Lugares",
        occupationOptionShort: "por Profesión",
        searchPlaceholder: "🔍Escriba su búsqueda...",
        searchSurnamePlaceholder: "🔍nombre", 
        searchNamePlaceholder: "🔍apellido",
        yearStartPlaceholder: "Año inicio",
        yearEndPlaceholder: "Año fin",
        searchButton: "Ir",
        dateFilterLabel: "filtrado<br>por fechas",
        helpName: "Búsqueda en nombres y apellidos (de soltera para mujeres)",
        helpPlace: "Búsqueda en lugares de nacimiento, muerte, residencia",
        helpOccupation: "Búsqueda en profesiones, trabajos, títulos",
        noSearchTerm: "Por favor ingrese un término de búsqueda",
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
        title: "Gyökérszemély keresése",
        selectPersonTitle: "Személy kiválasztása",
        nameOption: "Keresztnév/Név szerint",
        placeOption: "Helyek szerint",
        occupationOption: "Foglalkozás szerint",
        nameOptionShort: "Keresztnév/Név szerint",
        placeOptionShort: "Helyek szerint",
        occupationOptionShort: "Foglalkozás szerint",
        searchPlaceholder: "🔍Írja be a keresést...",
        searchSurnamePlaceholder: "🔍keresztnév",
        searchNamePlaceholder: "🔍név",         
        yearStartPlaceholder: "Kezdő év",
        yearEndPlaceholder: "Befejező év",
        searchButton: "Indul",
        dateFilterLabel: "dátum<br>szűrés",
        helpName: "Keresés kereszt- és vezetéknevekben (nők esetén leánykori név)",
        helpPlace: "Keresés születési, halálozási, lakóhelyben",
        helpOccupation: "Keresés foglalkozásokban, munkákban, címekben",
        noSearchTerm: "Kérjük, adjon meg egy keresési kifejezést",
        noResults: "Nincs találat a következőre:",
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


/**
 * Fonction de recherche étendue avec filtrage par dates
 */
export function findPersonsBy(searchTerm, config, searchTermFull, originalName = null, searchFirstName = null, searchLastName = null , isFromSearchModal = false) {  
    
    if (!state.gedcomData || !state.gedcomData.individuals) {
        return [];
    }
    const searchType = config.type;
    const startYear = config.startDate;
    const endYear = config.endDate;
    const searchScope = config.scope;
    const rootPersonId = config.rootPersonId;

    const searchStr = searchTerm.toLowerCase();

    let searchStrFull = searchStr;
    if (searchTermFull) {searchStrFull = searchTermFull.toLowerCase();} 

    let searchStrFullFull = originalName;
    if (searchStrFullFull) {searchStrFullFull = searchStrFullFull.toLowerCase();} 

    if (searchFirstName) { searchFirstName = searchFirstName.toLowerCase();}
    if (searchLastName) { searchLastName = searchLastName.toLowerCase();}


    // console.log('-debug in findPersonsBy0 searchStr =', searchStr, config, ', searchStrFull=', searchStrFull,  ', searchStrFullFull=', searchStrFullFull, ', originalName=', originalName)

    let results = [];
    let resultsSurnameInLastname = [];
    let resultsLastnameInSurname = [];

    let personWithDate_counter = 0;
    let personWithOccupation_counter = 0;
    let personWithPlace_counter = 0;
    let foundPpersonWithDate_counter = 0;
    let foundPersonWithOccupation_counter = 0;
    let foundPersonWithPlace_counter = 0;

    let male_counter = 0;
    let foundMale_counter = 0;


    let personList;
    if (searchScope === 'all') {
        personList = Object.values(state.gedcomData.individuals);
    } else {
        personList = getPersonsFromTree(searchScope, rootPersonId);
    }
   
    let matchCounter = 0;
    let isMatched1 = false, isMatched2 = false, isMatched3 = false, isMatched4 = false, isMatched5 = false, isMatched6 = false, isMatched7 = false;
    let bestdate1 = null, bestdate2 = null, bestdate3 = null, bestdate4 = null, bestdate5 = null, bestdate6 = null, bestdate7 = null;
    let isMatchWithSurnameName = false;

    let initialSearchWithPassword = searchFirstName && searchLastName && searchFirstName != '' && searchLastName != '' && !isFromSearchModal;
    let searchFromSearchModal =  (searchFirstName || searchLastName) && (searchFirstName != '' || searchLastName != '') && isFromSearchModal;    

    // Object.values(state.gedcomData.individuals).forEach(person => {
    personList.forEach(person => {
        const matches = [];
        const matchesSurnameInLastname = [];
        const matchesLastnameInSurname = [];
        const birthYear = extractYear(person.birthDate);
        const deathYear = extractYear(person.deathDate);
        let marriageYear = null;
        let marriagePlace = null;
        let relevantDate = null; // Pour stocker la date pertinente si trouvée
        let isOccupation = false;
        let isPlace = false;
        let isMale = false;
        // Les personnes ne stockent généralement pas directement leur date de mariage
        // Il faut la récupérer via les familles où elles apparaissent comme conjoint
        if (person.spouseFamilies && person.spouseFamilies.length > 0) {
            // Pour chaque famille où la personne est un conjoint
            person.spouseFamilies.forEach(familyId => {
                const family = state.gedcomData.families[familyId];
                if (family && family.marriageDate) {
                    marriageYear = extractYear(family.marriageDate);
                    marriagePlace = family.marriagePlace; // On peut aussi récupérer le lieu de mariage
                }
            });
        }
        if (birthYear || deathYear || marriageYear) {
            personWithDate_counter++;
        } else {
            const dateInfo = findDateForPerson(person.id);
            if (dateInfo && dateInfo.year) {
                relevantDate = dateInfo.year;
                personWithDate_counter++;
            }
        }
        if (person.sex=='M') {
            male_counter++;
            isMale = true;
        } 

        if (person.occupationFull) {
            personWithOccupation_counter++;
            isOccupation = true;
        }
        if (person.birthPlace || person.deathPlace || person.residPlace1 || person.residPlace2 || person.residPlace3 || marriagePlace) {
            personWithPlace_counter++; 
            isPlace = true;
        }   


        // Filtrage par dates si spécifié
        if (startYear || endYear) {

            // Si on a une date de début et que la personne est née avant
            if (startYear && birthYear && (birthYear < startYear)) return;
            
            // Si on a une date de fin et que la personne est née après
            if (endYear && birthYear && (birthYear > endYear)) return;
            
            // filtrer aussi par date de décès
            if (startYear && deathYear && (deathYear < startYear)) return;
            if (endYear && deathYear && (deathYear > endYear)) return;

            // filtrer aussi par date de marriage
            if (startYear && marriageYear && (marriageYear < startYear)) return;
            if (endYear && marriageYear && (marriageYear > endYear)) return;

            // filtrer aussi par relevantDate
            if (startYear && relevantDate && (relevantDate < startYear)) return;
            if (endYear && relevantDate && (relevantDate > endYear)) return;            
        
        }

        let bestdate = null;
        bestdate = (birthYear)  ? birthYear : (marriageYear) ? marriageYear : (deathYear) ? deathYear : relevantDate;




       
        // Recherche par nom
        if (searchType === 'name' || (searchType === 'prenoms' || searchType === 'noms')) {

            let givn, surn, firstName, lastName ;
            if (person.givn) { givn=person.givn;} else {givn='';}
            if (person.surn) { surn=person.surn;} else {surn='';}
            let fullName;
            // fullName = person.name.toLowerCase().replace(/\//g, '') + ' ' + givn.toLowerCase().replace(/\//g, '') + ' ' + surn.toLowerCase().replace(/\//g, '');
            if (searchType === 'prénoms') {
                fullName = person.name.split('/')[0].toLowerCase().replace(/\//g, '')  + ' ' + surn.toLowerCase().replace(/\//g, '');
            } else if (searchType === 'noms') {
                fullName = person.name.split('/')[1].toLowerCase().replace(/\//g, '')  + ' ' + givn.toLowerCase().replace(/\//g, '');
            } else { // 'name'
                fullName = person.name.toLowerCase().replace(/\//g, '') + ' ' + givn.toLowerCase().replace(/\//g, '') + ' ' + surn.toLowerCase().replace(/\//g, '');
                firstName = person.name.split('/')[0].toLowerCase().replace(/\//g, '')  + ' ' + surn.toLowerCase().replace(/\//g, '');
                // lastName = person.name.split('/')[1].toLowerCase().replace(/\//g, '')  + ' ' + givn.toLowerCase().replace(/\//g, '');
                lastName = person.name.substring(name.indexOf('/') + 1).toLowerCase().replace(/\//g, '')  + ' ' + givn.toLowerCase().replace(/\//g, '');
            }


            // console.log('-debug in findPersonsBy fullName =', fullName, ', searchStr=', searchStr); 
            // if (fullName.includes(searchStrFullFull)) {
            //     console.log('-debug in findPersonsBy1 ', searchType, searchStr, searchStrFull , ', searchStrFullFull=', searchStrFullFull, ',fullInputName=', fullName, (fullName.trim() === searchStrFullFull));
            //     console.log('-debug in findPersonsBy2 ', fullName.trim()); // === searchStrFullFull.trim()) )
            // }
            if (searchType !== 'prenoms'  || searchStr === searchStrFull) {
                // if (searchType == 'noms' && searchStrFullFull && fullName.includes(searchStrFullFull)) {

                // cas de la recherche initiale avec password
                if ( searchType === 'name' && (initialSearchWithPassword || searchFromSearchModal) ) { 

                    if (searchFromSearchModal) {
                        isMatched1 = false, isMatched2 = false, isMatched3 = false, isMatched4 = false, isMatched5 = false, isMatched6 = false, isMatched7 = false;
                    }

                    let firstNameWithoutAccent = firstName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    let searchFirstNameWithoutAccent = searchFirstName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    let lastNameWithoutAccent = lastName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    let searchLastNameWithoutAccent = searchLastName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    let isMatched = false;
                    // console.log('\n\n - debug findBy', searchFirstName, searchLastName)



                    // 1- recherche prénom/nom avec accent et prénom commençant exactement sur le mot recherché
                    if (new RegExp(`^${searchFirstName}(\\b| |-)`, "i").test(firstName)
                        && lastName.includes(searchLastName) ) {
                        // console.log('\n\n-debug detected with accent :', person.name )
                        if (initialSearchWithPassword && (!isMatched1 || bestdate1 && (bestdate > bestdate1) ) ) {
                            results = [];
                        }
                        // console.log('\n\n debug name match1: ', searchTerm, config, searchTermFull, originalName, searchFirstName, searchLastName, isFromSearchModal, firstName, lastName, ', fullName=',fullName, 'searchStr=', searchStr,', searchStrFull=',searchStrFull )

                        matches.push({
                            type: 'name',
                            field: 'Nom',
                            value: person.name.replace(/\//g, '').trim()
                        });
                        matchCounter++; isMatched = true; isMatched1 = true; bestdate1 = bestdate; isMatchWithSurnameName = true;
                    } 
                    // 2- recherche prénom/nom sans accent et prénom commençant exactement sur le mot recherché
                    if (!isMatched && !isMatched1 && new RegExp(`^${searchFirstNameWithoutAccent}(\\b| |-)`, "i").test(firstNameWithoutAccent) 
                        && lastNameWithoutAccent.includes(searchLastNameWithoutAccent) ) {
                        // console.log('\n\n-debug detected without accent :', person.name )
                        if (initialSearchWithPassword && (!isMatched2 || bestdate2 && (bestdate > bestdate2) ) ) {
                            results = [];
                        }
                        // console.log('\n\n debug name match2: ', searchTerm, config, searchTermFull, originalName, searchFirstName, searchLastName, isFromSearchModal, firstName, lastName, ', fullName=',fullName, 'searchStr=', searchStr,', searchStrFull=',searchStrFull )

                        matches.push({
                            type: 'name',
                            field: 'Nom',
                            value: person.name.replace(/\//g, '').trim()
                        });
                        matchCounter++; isMatched = true; isMatched2 = true; bestdate2 = bestdate; isMatchWithSurnameName = true;
                    } 

                    // 3- recherche avec accent et prénom ne commencant par le mot recherché
                    if (!isMatched && !isMatched2 && new RegExp(`\\b${searchFirstName}(\\b| |-)`, "i").test(firstName) 
                        && lastName.includes(searchLastName) ) {
                        // console.log('\n\n-debug detected with accent :', person.name )
                        if (initialSearchWithPassword && (!isMatched3 || bestdate3 && (bestdate > bestdate3) ) ) {
                            results = [];
                        }
                        // console.log('\n\n debug name match3: ', searchTerm, config, searchTermFull, originalName, searchFirstName, searchLastName, isFromSearchModal, firstName, lastName, ', fullName=',fullName, 'searchStr=', searchStr,', searchStrFull=',searchStrFull )

                        matches.push({
                            type: 'name',
                            field: 'Nom',
                            value: person.name.replace(/\//g, '').trim()
                        });
                        matchCounter++; isMatched = true; isMatched3 = true; bestdate3 = bestdate; isMatchWithSurnameName = true;
                    } 

                    // 4- recherche sans accent et prénom ne commencant par le mot recherché
                    if (!isMatched && !isMatched3 && new RegExp(`\\b${searchFirstNameWithoutAccent}(\\b| |-)`, "i").test(firstNameWithoutAccent) 
                        && lastNameWithoutAccent.includes(searchLastNameWithoutAccent) ) {
                        // console.log('\n\n-debug detected without accent :', person.name )
                        if (initialSearchWithPassword && (!isMatched4 || bestdate4 && (bestdate > bestdate4) ) ) {
                            results = [];
                        }
                        // console.log('\n\n debug name match4: ', searchTerm, config, searchTermFull, originalName, searchFirstName, searchLastName, isFromSearchModal, firstName, lastName, ', fullName=',fullName, 'searchStr=', searchStr,', searchStrFull=',searchStrFull )

                        matches.push({
                            type: 'name',
                            field: 'Nom',
                            value: person.name.replace(/\//g, '').trim()
                        });
                        matchCounter++; isMatched = true; isMatched4 = true; bestdate4 = bestdate; isMatchWithSurnameName = true;
                    } 

                    // 5- recherche prénom/nom avec accent et prénom contenant le mot recherché
                    if (!isMatched && !isMatched4 && firstName.includes(searchFirstName) &&
                            lastName.includes(searchLastName) ) {
                        // console.log('\n\n-debug detected with accent et partiel:', person.name )
                        if (initialSearchWithPassword && (!isMatched5 || bestdate5 && (bestdate > bestdate5) ) ) {
                            results = [];
                        }
                        // console.log('\n\n debug name match5: ', searchTerm, config, searchTermFull, originalName, searchFirstName, searchLastName, isFromSearchModal, firstName, lastName, ', fullName=',fullName, 'searchStr=', searchStr,', searchStrFull=',searchStrFull )

                        matches.push({
                                type: 'name',
                                field: 'Nom',
                                value: person.name.replace(/\//g, '').trim()
                            });
                        matchCounter++; isMatched = true; isMatched5 = true; bestdate5 = bestdate; isMatchWithSurnameName = true;            
                    }


                    // 6- recherche prénom/nom sans accent et prénom contenant le prénom recherché et nom contenant le nom recherché
                    if (!isMatched && !isMatched5 &&  firstNameWithoutAccent.includes(searchFirstNameWithoutAccent) &&
                        lastNameWithoutAccent.includes(searchLastNameWithoutAccent) ) {
                        // console.log('\n\n-debug detected without accent et partiel:', person.name )
                        if (initialSearchWithPassword && (!isMatched6 || bestdate6 && (bestdate > bestdate6) ) ) {
                            results = [];
                        }
                        // console.log('\n\n debug name match6: ', searchTerm, config, searchTermFull, originalName, searchFirstName, searchLastName, isFromSearchModal, firstName, lastName, ', fullName=',fullName, 'searchStr=', searchStr,', searchStrFull=',searchStrFull )

                        matches.push({
                                type: 'name',
                                field: 'Nom',
                                value: person.name.replace(/\//g, '').trim()
                            });
                        matchCounter++; isMatched = true; isMatched6 = true; bestdate6 = bestdate; isMatchWithSurnameName = true;
                    }  
                    
                    
                    // 7- recheche avec inversion possible nom/prénom
                    if (!isMatched && !isMatched6 && !isMatchWithSurnameName && searchFromSearchModal) {
                       
                        if (searchFirstName !== '' && searchLastName === '')  {

                            if (lastName.includes(searchStr)) {
                                // console.log('\n\n debug name matche7 prénom dans nom: ', searchTerm, config, searchTermFull, originalName, searchFirstName, searchLastName, isFromSearchModal, firstName, lastName, ', fullName=',fullName, 'searchStr=', searchStr,', searchStrFull=',searchStrFull )
                                matchesSurnameInLastname.push({
                                    type: 'name',
                                    field: 'Nom',
                                    value: person.name.replace(/\//g, '').trim()
                                });
                                matchCounter++; isMatched = true; isMatched7 = true; bestdate7 = bestdate;

                                resultsSurnameInLastname.push({
                                    ...person,
                                    matches: matchesSurnameInLastname
                                });
                            } 

                        } else if (searchFirstName === '' && searchLastName != '') {
                            if (firstName.includes(searchStr)) {
                                // console.log('\n\n debug name matche7 nom dans prénom : ', searchTerm, config, searchTermFull, originalName, searchFirstName, searchLastName, isFromSearchModal, firstName, lastName, ', fullName=',fullName, 'searchStr=', searchStr,', searchStrFull=',searchStrFull )
                                matchesLastnameInSurname.push({
                                    type: 'name',
                                    field: 'Nom',
                                    value: person.name.replace(/\//g, '').trim()
                                });
                                matchCounter++; isMatched = true; isMatched7 = true; bestdate7 = bestdate;

                                resultsLastnameInSurname.push({
                                    ...person,
                                    matches: matchesLastnameInSurname
                                });

                            } 
                        }
                    }

                } else if (searchType == 'noms' && searchStrFullFull) {
                    if (fullName.trim() === searchStrFullFull) {
                        matches.push({
                                type: 'name',
                                field: 'Nom',
                                value: person.name.replace(/\//g, '').trim()
                            });
                    }
                } else if (fullName.includes(searchStr)) {
                        matches.push({
                            type: 'name',
                            field: 'Nom',
                            value: person.name.replace(/\//g, '').trim()
                        });
                }

            } else {
                if (fullName.includes(searchStr) && fullName.includes(searchStrFull) ) {
                        matches.push({
                            type: 'name',
                            field: 'Nom',
                            value: person.name.replace(/\//g, '').trim()
                        });
                }
            }

        }
        
        // Recherche par lieu
        else if (searchType === 'place' || (searchType === 'lieux')) {
            // Lieux de naissance
            let searchStrBis = searchStr.replace(' ','-')
            
            if (person.birthPlace && ( person.birthPlace.toLowerCase().includes(searchStr) || person.birthPlace.toLowerCase().includes(searchStrBis)) ) {
                matches.push({
                    type: 'place',
                    field: searchModalTranslations[window.CURRENT_LANGUAGE].birthPlace,
                    value: person.birthPlace
                });
            }
            
            // Lieux de décès
            if (person.deathPlace && ( person.deathPlace.toLowerCase().includes(searchStr) || person.deathPlace.toLowerCase().includes(searchStrBis)) ) {
                matches.push({
                    type: 'place',
                    field: searchModalTranslations[window.CURRENT_LANGUAGE].deathPlace,
                    value: person.deathPlace
                });
            }
            
            // Lieux de résidence
            if (person.residPlace1 && ( person.residPlace1.toLowerCase().includes(searchStr) || person.residPlace1.toLowerCase().includes(searchStrBis)) ) {
                matches.push({
                    type: 'place',
                    field: searchModalTranslations[window.CURRENT_LANGUAGE].residencePlace,
                    value: person.residPlace1
                });
            }
            if (person.residPlace2 && ( person.residPlace2.toLowerCase().includes(searchStr) || person.residPlace2.toLowerCase().includes(searchStrBis)) ) {
                matches.push({
                    type: 'place',
                    field: searchModalTranslations[window.CURRENT_LANGUAGE].residencePlace,
                    value: person.residPlace2
                });
            }            
            if (person.residPlace3 && ( person.residPlace3.toLowerCase().includes(searchStr) || person.residPlace3.toLowerCase().includes(searchStrBis)) ) {
                matches.push({
                    type: 'place',
                    field: searchModalTranslations[window.CURRENT_LANGUAGE].residencePlace,
                    value: person.residPlace3
                });
            }
            if (marriagePlace && ( marriagePlace.toLowerCase().includes(searchStr) || marriagePlace.toLowerCase().includes(searchStrBis)) ) {
                matches.push({
                    type: 'place',
                    field: searchModalTranslations[window.CURRENT_LANGUAGE].weddingPlace,
                    value: marriagePlace
                });
            }

        }
        
        // Recherche par profession
        else if (searchType === 'occupation' || (searchType === 'professions')) {
            if (person.occupationFull && person.occupationFull.toLowerCase().includes(searchStr)) {
                matches.push({
                    type: 'occupation',
                    field: searchModalTranslations[window.CURRENT_LANGUAGE].occupation,
                    value: person.occupationFull
                });
            }
            
        }

        else if (searchType === 'duree_vie') {
            if (birthYear && deathYear) {
                const age = deathYear - birthYear;
                if (age >= 0 && age <= 150) {
                    let isMatched = true;
                    if (searchStr && age !== Number(searchStr)) {isMatched = false; }
                    if (isMatched) { 
                        matches.push({
                            type: 'duree_vie',
                            field: searchModalTranslations[window.CURRENT_LANGUAGE].occupation,
                            value: age
                        });
                    }
                }
            }       
        
        } else if (searchType === 'age_procreation') {
            if (birthYear) {
                const parentBirthYear = birthYear;
                if (person.spouseFamilies) {
                    person.spouseFamilies.forEach(familyId => {
                        const family = state.gedcomData.families[familyId];
                        if (family && family.children) {
                            family.children.forEach(childId => {
                                const child = state.gedcomData.individuals[childId];
                                if (child && child.birthDate) {
                                    const childBirthYear = extractYear(child.birthDate);

                                    if (childBirthYear > parentBirthYear) {
                                        const ageAtChildBirth = childBirthYear - parentBirthYear;
                                        if (ageAtChildBirth >= 5 && ageAtChildBirth <= 100) {
                                            let isMatched = true;
                                            if (searchStr && ageAtChildBirth !== Number(searchStr)) {isMatched = false; }
                                            if (isMatched) { 
                                                matches.push({
                                                    type: 'age_procreation',
                                                    field: searchModalTranslations[window.CURRENT_LANGUAGE].occupation,
                                                    value: ageAtChildBirth
                                                });
                                            }

                                        }
                                    }
                                }
                            });
                        }
                    });
                }
            }
        } else if (searchType === 'age_first_child') {
            if (birthYear) {
                const parentBirthYear = birthYear;
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
                                                
                        if (ageAtFirstChild >= 10 && ageAtFirstChild <= 100) {
                            let isMatched = true;
                            if (searchStr && ageAtFirstChild !== Number(searchStr)) {isMatched = false; }
                            if (isMatched) {
                                matches.push({
                                    type: 'age_first_child',
                                    field: searchModalTranslations[window.CURRENT_LANGUAGE].occupation,
                                    value: ageAtFirstChild
                                });
                            }
                        }
                    }
                }
            }

        } else if (searchType === 'age_marriage') {
            // Les personnes ne stockent généralement pas directement leur date de mariage
            // Il faut la récupérer via les familles où elles apparaissent comme conjoint
            if (birthYear && person.spouseFamilies && person.spouseFamilies.length > 0) {
                const birthYear = extractYear(person.birthDate);
                
                // Pour chaque famille où la personne est un conjoint
                person.spouseFamilies.forEach(familyId => {
                    const family = state.gedcomData.families[familyId];
                    if (family && family.marriageDate) {
                        const marriageYear = extractYear(family.marriageDate);
                        // Vérifier que la naissance est après la naissance
                        if (marriageYear > birthYear) {
                            const ageAtMarriage = marriageYear - birthYear;
                            if (ageAtMarriage >= 10 && ageAtMarriage <= 100) {
                                let isMatched = true;
                                if (searchStr && ageAtMarriage !== Number(searchStr)) {isMatched = false; }
                                if (isMatched) {
                                    matches.push({
                                        type: 'age_marriage',
                                        field: searchModalTranslations[window.CURRENT_LANGUAGE].occupation,
                                        value: ageAtMarriage
                                    });
                                }
                            }
                        }
                    }
                });
            }

        } else if (searchType === 'nombre_enfants') {
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
                let isMatched = true;
                if (searchStr && totalChildren !== Number(searchStr)) {isMatched = false; }
                if (isMatched) {
                    matches.push({
                        type: 'nombre_enfants',
                        field: searchModalTranslations[window.CURRENT_LANGUAGE].occupation,
                        value: totalChildren
                    });
                }
            }
        }       


        if (matches.length > 0) {
            results.push({
                ...person,
                matches: matches
            });
            if (isOccupation) foundPersonWithOccupation_counter++;
            if (isPlace) foundPersonWithPlace_counter++;
            if (isMale) foundMale_counter++;   

        }
    });
    
    if (results.length === 0  && searchFromSearchModal && searchFirstName !== '' && searchLastName === '' && resultsSurnameInLastname.length > 0)  {
        results = resultsSurnameInLastname;  
    } else if (results.length === 0  && searchFromSearchModal && searchFirstName === '' && searchLastName != '' && resultsLastnameInSurname.length > 0)  {
        results = resultsLastnameInSurname; 
    }





    console.log("\n Recherche sur :", Object.keys(state.gedcomData.individuals).length, ' personnes. ', results.length, ' personnes trouvées.', ' withDate=',personWithDate_counter, ', withOccupation=',personWithOccupation_counter, ', withPlace=',personWithPlace_counter, ', homme=',male_counter,  ', FoundWithOccupation=',foundPersonWithOccupation_counter, ', foundWithPlace=',foundPersonWithPlace_counter, ', foundHomme=',foundMale_counter);

    return {results, personWithDate_counter, personWithOccupation_counter, personWithPlace_counter, male_counter, foundPersonWithOccupation_counter, foundPersonWithPlace_counter, foundMale_counter};
}



function moveDownSearchModal() {
    const searchModal = document.getElementById('search-modal') ;
    // console.log('\n\n **** debug FullScreen= ',!(!document.fullscreenElement),  ',!FullScreen',(!document.fullscreenElement), ', state.isMobile=', state.isMobile, ', state.isTouchDevice=', state.isTouchDevice, searchModal, ', searchModal=', (searchModal!==null), (searchModal) ? searchModal.style.display : null )
    if (state.isMobile && state.isTouchDevice && !(!document.fullscreenElement) && window.innerWidth < 400) {
    // if (true) {
        searchModal.style.top = '50px';
    } else {
        searchModal.style.top = '0px';        
    }
}

let currentSearchPurpose = 'root';
let currentSearchCallback = null;

/**
 * Crée et affiche la modale de recherche
 */
export function openSearchModal(firstName = null, lastName = null, purpose = 'root', onSelectCallback = null) {

    // console.log(`[DEBUG] openSearchModal: But='${purpose}', Callback fourni?`, !!onSelectCallback); // <-- AJOUTER


    currentSearchPurpose = purpose;
    currentSearchCallback = onSelectCallback;

    // console.log('\n\n -----------------   debug openSearchModal ---------------\n')
    let isCallFromInit = false;
    if (firstName && lastName && firstName != '' && lastName != '') {
        isCallFromInit = true;
    }

    if (!isCallFromInit) { 
        fullResetAnimationState();
        disableFortuneModeClean();
    }
    // disableFortuneModeWithLever();    
    // Vérifier si la modale existe déjà
    let existingModal = document.getElementById('search-modal');

    // console.log('- open setupSearchFieldModal openSearchModal', existingModal);

    const titleKey = purpose === 'root' ? 'title' : 'selectPersonTitle';
    const titleText = searchModalTranslations[window.CURRENT_LANGUAGE][titleKey];

    if (existingModal) {
        existingModal.style.display = 'flex';
        
        // Mettre à jour le titre
        const headerTitle = existingModal.querySelector('.searchModal-header h3');
        if (headerTitle) headerTitle.textContent = titleText;

        // Vider les champs à la réouverture
        document.getElementById('searchModal-search-input').value = '';
        if (!state.deviceInfo.hasTouchScreen ||  !(state.deviceInfo.inputType === 'tactile')) {
            // si mobile phone, ne pas mettre le focus sur l'input pour éviter de voir apparaitre le clavier tactile dès le début
            document.getElementById('searchModal-search-input').focus();
        }
        makeModalInteractive(existingModal); 
        const content = existingModal.querySelector('.searchModal-content'); 
        content._isVisible = true;        

        if (firstName && lastName && firstName != '' && lastName != '') {
            new performModalSearch(firstName, lastName);
            console.log('\n\n- open setupSearchFieldModal openSearchModal', window.currentSearchResults );
            
            // regarder si il existe plus qu'un résultat
            if (window.currentSearchResults.length < 2) { window.closeSearchModal();}
        }

        // verifier si le bouton hamburger se superpose à la modal searchModal
        // dans ce cas chnager le zIndex
        bringToFrontOfHamburgerButton();
        moveDownSearchModal();

        return;
    }


    // Créer la modale
    const modal = document.createElement('div');
    modal.id = 'search-modal';
    modal.className = 'search-modal';

    modal.innerHTML = `
        <div class="searchModal-content">
            <div class="searchModal-header">
                <h3>${titleText}</h3>
                <button class="searchModal-close" onclick="closeSearchModal()">&times;</button>
            </div>
            
            <div class="searchModal-body">

                <div class="search-input-section">
                    <input type="text" id="searchModal-search-input" placeholder="${searchModalTranslations[window.CURRENT_LANGUAGE].searchPlaceholder}">
                    <input type="text" id="searchModal-searchSurname-input" placeholder="${searchModalTranslations[window.CURRENT_LANGUAGE].searchSurnamePlaceholder}">
                    <input type="text" id="searchModal-searchName-input" placeholder="${searchModalTranslations[window.CURRENT_LANGUAGE].searchNamePlaceholder}">
                    <button id="searchModal-search-button"> ${searchModalTranslations[window.CURRENT_LANGUAGE].searchButton} </button>
                    <button id="searchModal-settings-button" >⚙️</button>
                </div>

                <div class="search-type-section">
                    <div id="searchModal-search-type-container"></div>
                </div>

                <div class="date-filter-section" style="display: none;">
                    <input type="number" id="date-start" placeholder="${searchModalTranslations[window.CURRENT_LANGUAGE].yearStartPlaceholder}" min="1000" max="2100">
                    <span>- </span>
                    <input type="number" id="date-end" placeholder="${searchModalTranslations[window.CURRENT_LANGUAGE].yearEndPlaceholder}" min="1000" max="2100">
                    <label>${searchModalTranslations[window.CURRENT_LANGUAGE].dateFilterLabel}</label>
                </div>
                
                <div class="search-help">
                    <div id="search-help-text">${searchModalTranslations[window.CURRENT_LANGUAGE].helpName}</div>
                </div>
                
                <div class="search-results" id="searchModal-search-results">
                    <!-- Les résultats apparaîtront ici -->
                </div>

            </div>
        </div>
    `;
    
    // Ajouter les styles CSS
    const styles = `
        <style>
        #search-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            /*background: rgba(0, 0, 0, 0.3);*/
            background: transparent !important;
            display: flex;
            justify-content: center;
            align-items: flex-start; 
            padding-top: 2px;
            z-index: 9000;
            pointer-events: none !important;
        }
               
        .searchModal-content {
            background: white;
            border-radius: 8px;
            width: 100%;
            max-width: 580px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            /* max-height: calc(100vh - 5px) !important; */  /* Utiliser presque toute la hauteur */
            max-height: 70vh !important; /* Utiliser presque toute la hauteur */
            min-height: 100px; /* sinon on ne pourra pas réduire */
            /* height: auto !important; */
            pointer-events: all !important;
            display: flex;
            flex-direction: column;   /* header en haut, liste qui s'adapte en bas */
        }
    
        .searchModal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 3px 30px;
            background: #ff9800;
            color: white;
            padding-top: 3px;
            padding-bottom: 3px;
            padding-left: 40px;            
            padding-right: 8px;
        }
        
        .searchModal-header h3 {
            margin: 0;
            font-size: 16px;
        }
        
        .searchModal-close {
            background: none;
            border: none;
            color: white;
            font-size: 30px;
            cursor: pointer;
            /* padding: 0; */
            padding = '2px 2px';
            width: 35px;
            height: 35px;
        }
        
        .searchModal-close:hover {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
        }
        
        .searchModal-body {
            padding: 7px;
            max-height: calc(100vh - 60px) !important; /* -10px Ajuster selon la hauteur du header */
            overflow-y: auto !important;
        }
        
        .search-type-section, .search-input-section, .date-filter-section {
            margin-bottom: 4px;
        }
        
        .search-type-section {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .search-type-section label {
            font-weight: bold;
            color: #333;
            white-space: nowrap;
            width: 120px; /* Même largeur que le bouton rechercher */
            text-align: center;
        }   

        #searchModal-search-input {
            width: 170px;
            padding: 4px;
            border: 2px solid #ff9800;
            border-radius: 4px;
            font-size: 14px;
            box-sizing: border-box;
        }      
        #searchModal-searchSurname-input {
            width: 80px;
            padding: 4px;
            border: 2px solid #ff9800;
            border-radius: 4px;
            font-size: 14px;
            box-sizing: border-box;
        }
        #searchModal-searchName-input {
            width: 80px;
            padding: 4px;
            border: 2px solid #ff9800;
            border-radius: 4px;
            font-size: 14px;
            box-sizing: border-box;
        }


        #searchModal-search-type{
            margin-left: -10px;
        } 

        .search-input-section {
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
            font-size: 14px;
        }
        
        #date-start, #date-end {
            padding: 4px;
            border: 2px solid #ff9800;
            border-radius: 4px;
            font-size: 14px;
            box-sizing: border-box;
        }

        #date-start {
            margin-left: 0px;
            width: 91px; /* 95px*/
            margin-right: -9px;
            }

        #date-end {
            margin-left: -8px;
            width: 70px; /* 82px */
        }
        
        #searchModal-search-button {
            padding: 4px 4px;
            background: #faad38ff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            height: 28px !important;
        }
        
        #searchModal-search-button:hover {
            background: #f57c00;
        }
        
        .search-help {
            background: #f5f5f5;
            padding: 8px;
            border-radius: 4px;
            margin-bottom: 4px;
            font-size: 11px;
            color: #666;
        }

        /* .search-results { */
        #searchModal-search-results {        
            overflow-y: auto;   /* active l’ascenseur si contenu trop grand */
            /* max-height: calc(100vh - 120px) !important; */  /* 275 Utiliser presque toute la hauteur mais pas trop il faut retirer la hauteur de toute l'entête*/
            /*height: auto !important; */
            flex: 1 1 auto;     /* occupe tout l’espace restant dans la modal */
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
            font-weight: normal;
            color: #333;
            margin-bottom: 3px;
            font-size: 14px;
        }
        
        .search-result-info {
            font-size: 11px;
            color: #666;
            /* color: darkblue;*/
        }
        
        .result-match {
            display: inline-block;
            background: transparent;   /* plus de fond plein */
            /*background: #ff9800; */
            background: rgba(206, 189, 162, 0.1);
            color: black;              /* texte noir */
            padding: 2px 6px;
            border-radius: 3px;
            margin-right: 8px;
            font-size: 11px;
        }


        /* Styles pour mobile en mode paysage  */
        @media screen and (max-height: 500px) {
            .searchModal-content {
                max-height: calc(100vh - 5px) !important;   /* Utiliser presque toute la hauteur */
            }
            .searchModal-body {
                max-height: calc(100vh - 60px) !important; /* Ajuster selon la hauteur du header */
            }
        }

        /* Styles pour mobile en mode portrait */
        @media screen and (max-width: 580px) {
            .searchModal-content {
                max-width: 97% !important;
            }   
        }


        /* Styles pour mobile en mode smartphone*/
        @media screen and (max-width: 400px) , screen and (max-height: 500px)  {

            .result-name {
                font-size: 13px;
            }
           
            .searchModal-header h3 {
                font-size: 16px !important; /* Réduire la taille du titre */
                margin: 0 !important;
            }
            
            .searchModal-body {
                padding: 5px 10px !important; /* Réduire de 20px à 10px */
                /* max-height: calc(100vh - 60px) !important; * //* Ajuster selon la hauteur du header */
            }           

            .search-type-section, 
            .search-input-section, 
            .date-filter-section {
                margin-bottom: 4px !important; /* Réduire de 15px à 8px */
            }
            
            .search-help {
                padding: 4px !important; /* Réduire de 8px à 5px */
                margin-bottom: 4px !important; /* Réduire de 15px à 8px */
                font-size: 12px !important;
            }

            .date-filter-section label {
                /* font-weight: bold; */
                font-size: 13px;
            }
        }
        </style>
    `;
 
    // Ajouter les styles au document
    if (!document.getElementById('searchModal-styles')) {
        const styleElement = document.createElement('div');
        styleElement.id = 'searchModal-styles';
        styleElement.innerHTML = styles;
        document.head.appendChild(styleElement);
    }

    // Styles pour webkit (Chrome, Safari) POUR LE SCROLLBAR ***************************
    const style = document.createElement('style');
    style.textContent = `
        .search-modal div::-webkit-scrollbar {
            width: 20px !important;
        }
        .search-modal div::-webkit-scrollbar-track {
            background: #f9efdfff; /* Couleur de fond du track  */
            border-radius: 6px;
        }
        .search-modal div::-webkit-scrollbar-thumb {
            background: #faad38ff;  /* Couleur du curseur  */
            border-radius: 6px;
            border: 2px solid #f0f0f0; /* Bordure du curseur */
            min-height: 50px;  /* Hauteur minimum du curseur  */
        }
        .search-modal div::-webkit-scrollbar-thumb:hover {
            background: #ff6a00ff; /* Couleur au survol */
        }

        /* Bouton du haut */
        .search-modal div::-webkit-scrollbar-button:single-button:vertical:decrement {
            background: #faad38ff; 
            height: 20px;
            display: block;
            background-image: url("data:image/svg+xml;utf8,<svg fill='white' xmlns='http://www.w3.org/2000/svg' width='10' height='10'><polygon points='0,10 5,0 10,10'/></svg>");
            background-repeat: no-repeat;
            background-position: center;
            border-radius: 6px 6px 0 0;
        }

        /* Bouton du bas */
        .search-modal div::-webkit-scrollbar-button:single-button:vertical:increment {
            background: #faad38ff; 
            height: 20px;
            display: block;
            background-image: url("data:image/svg+xml;utf8,<svg fill='white' xmlns='http://www.w3.org/2000/svg' width='10' height='10'><polygon points='0,0 5,10 10,0'/></svg>");
            background-repeat: no-repeat;
            background-position: center;
            border-radius: 0 0 6px 6px;
        }
    `;
    document.head.appendChild(style);


    const extraStyle = document.createElement('style');
    extraStyle.textContent = `
        #searchModal-settings-button {
            background: #f9efdfff;
            border: 1px solid #ccc;
            border-radius: 4px;
            cursor: pointer;
            font-size: 20px;
            padding: 0px 0px;
        }
        #searchModal-settings-button:hover {
            background: #e0e0e0;
        }
    `;
    document.head.appendChild(extraStyle);

    


    // FORCER l'application après le CSS tactile du resizableModalUtils.js dans la function makeModalDraggableAndResizable(modal, handle)
    // car le makeModalDraggableAndResizable rendait le scrollbar invisible
    setTimeout(() => {
        const forceStyle = document.createElement('style');
        forceStyle.textContent = `
            .search-modall div {
                scrollbar-width: unset !important;
            }
        `;
        document.head.appendChild(forceStyle);
    }, 0);

    
    // Ajouter la modale au document
    document.body.appendChild(modal);

    // Cibler le vrai conteneur draggable/redimensionnable
    const content = modal.querySelector('.searchModal-content'); 
    content._isVisible = true;
    const header = modal.querySelector('.searchModal-header');
    // Rendre la modale déplaçable et redimensionnable
    makeModalDraggableAndResizable(content, header, false);

    adjustSplitScreenLayout(content, true);

    // Configurer les événements
    setupModalEvents();

    makeModalInteractive(modal);   

    // Gestion du bouton ⚙️ pour afficher/masquer le filtre par date
    const settingsButton = modal.querySelector('#searchModal-settings-button');
    const dateSection = modal.querySelector('.date-filter-section');
    // dateSection.style.display = 'none';

    settingsButton.addEventListener('click', () => {
        const visible = dateSection.style.display !== 'none';
        dateSection.style.display = visible ? 'none' : 'flex';
    });

    window.addEventListener('resize',  debounce(() => {
        if(isModalVisible(modal.id)) {
            console.log('\n\n*** debug 2 resize in openSearchModal in searchModalUI for resizeModal \n\n');        
            resizeModal(content, true);
        }
    }, 150));

    resizeModal(content, true)    

    if (!state.deviceInfo.hasTouchScreen ||  !(state.deviceInfo.inputType === 'tactile')) {
        // si mobile phone, ne pas mettre le focus sur l'input pour éviter de voir apparaitre le clavier tactile dès le début
        //Donner le focus au champ de recherche
        setTimeout(() => {
            document.getElementById('searchModal-search-input').focus();
        }, 100);
    }


    if (firstName && lastName && firstName != '' && lastName != '') {
        new performModalSearch(firstName, lastName);
        console.log('\n\n- open setupSearchFieldModal openSearchModal', firstName, lastName, window.currentSearchResults );        
        // regarder si il existe plus qu'un résultat
        if (window.currentSearchResults.length < 2) { window.closeSearchModal();}
    }
    // verifier si le bouton hamburger se superpose à la modal searchModal
    // dans ce cas chnager le zIndex
    bringToFrontOfHamburgerButton();
  
    moveDownSearchModal();

}

/**
 * Configure les événements de la modale
 */
function setupModalEvents() {


    // Créer la liste d'options
    const typeValues = ['name', 'place', 'occupation'];
    const typeOptions = [   searchModalTranslations[window.CURRENT_LANGUAGE].nameOptionShort, 
                            searchModalTranslations[window.CURRENT_LANGUAGE].placeOptionShort, 
                            searchModalTranslations[window.CURRENT_LANGUAGE].occupationOptionShort ];  
    const typeOptionsExpanded = [   searchModalTranslations[window.CURRENT_LANGUAGE].nameOption, 
                            searchModalTranslations[window.CURRENT_LANGUAGE].placeOption, 
                            searchModalTranslations[window.CURRENT_LANGUAGE].occupationOption ];

    const options = createOptionsFromLists(typeOptions, typeOptionsExpanded, typeValues);
    
    
    // Créer le sélecteur personnalisé
    const customSelector = createCustomSelector({
        options: options,

        selectedValue: 'name',
        colors: {
            main: '#faad38ff',
            options: '#faad38ff',
            hover: '#f57c00',
            selected: '#e65100'
        },
        // dimensions: {
        //     width: '200px',
        //     height: '35px'
        // },

        isMobile: nameCloudState.mobilePhone,
        dimensions: {
            width: '170px',
            height: '28px',
            dropdownWidth: '170px',
            dropdownHeight: '240px' 
        },
        // Personnalisation des options
        customizeOptionElement: (optionElement, option) => {
            // Utiliser le label étendu dans le menu déroulant
            optionElement.textContent = option.expandedLabel;
        },
        onChange: (value) => {
            // Vider le champ et la liste
            document.getElementById('searchModal-search-input').value = '';
            document.getElementById('searchModal-search-results').innerHTML = '';
        }
    });

    // Ajouter l'ID pour la fonction moveSelector
    customSelector.id = 'searchModal-search-type';

    // L'insérer dans le conteneur
    document.getElementById('searchModal-search-type-container').appendChild(customSelector);


    const searchType = document.getElementById('searchModal-search-type');
    const searchInput = document.getElementById('searchModal-search-input');
    const searchInputSurname = document.getElementById('searchModal-searchSurname-input');
    const searchInputName = document.getElementById('searchModal-searchName-input');

    const searchButton = document.getElementById('searchModal-search-button');
    const helpText = document.getElementById('search-help-text');
    
    // Textes d'aide selon le type de recherche
    const helpTexts = {
        'name': searchModalTranslations[window.CURRENT_LANGUAGE].helpName,
        'place': searchModalTranslations[window.CURRENT_LANGUAGE].helpPlace,
        'occupation': searchModalTranslations[window.CURRENT_LANGUAGE].helpOccupation
    };
    

    searchInput.style.display = 'none';
    searchInputSurname.style.display = 'flex';            
    searchInputName.style.display = 'flex';

    
    // Changer le texte d'aide selon le type sélectionné
    searchType.addEventListener('change', function() {
        helpText.textContent = helpTexts[this.value];
        // Vider le champ de recherche quand on change de type
        if (searchType.value === 'name'){
            searchInputSurname.value = '';
            searchInputName.value = '';

            searchInput.style.display = 'none';
            searchInputSurname.style.display = 'flex';            
            searchInputName.style.display = 'flex';
            console.log('\n\n ********** debug name ', searchType.value )
        } else {
            searchInput.value = '';

            searchInput.style.display = 'flex';
            searchInputSurname.style.display = 'none';            
            searchInputName.style.display = 'none';
             console.log('\n\n ********** debug !name ', searchType.value )
        }


        // document.getElementById('searchModal-search-input').value = '';
        document.getElementById('searchModal-search-results').innerHTML = '';
    });

    
    // Recherche en appuyant sur Entrée dans le champ de recherche
    searchInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            // new performModalSearch();
            if (searchType.value === 'name') {
                new performModalSearch(searchInputSurname.value, searchInputName.value, true);
            } else {
                new performModalSearch();
            } 
        }
    });
    
    // Recherche en appuyant sur Entrée dans les champs de dates
    document.getElementById('date-start').addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            new performModalSearch();
        }
    });
    
    document.getElementById('date-end').addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            new performModalSearch();
        }
    });
    
    // Recherche en cliquant sur le bouton
    // searchButton.addEventListener('click', new performModalSearch);

    searchButton.addEventListener('click', () => { 
        if (searchType.value === 'name') {
            new performModalSearch(searchInputSurname.value, searchInputName.value, true);
        } else {
            new performModalSearch();
        } 
    });

    
    // // Fermer la modale en cliquant à l'extérieur
    // document.getElementById('search-modal').addEventListener('click', function(event) {
    //     if (event.target === this) {
    //         closeSearchModal();
    //     }
    // });



    function moveSelector() {
        const selector = document.getElementById('searchModal-search-type');
        const typeSection = document.querySelector('.search-type-section');
        const inputSection = document.querySelector('.search-input-section');
        const searchButton = document.getElementById('searchModal-search-button');
        
        if (typeSection && inputSection)  {
            if (window.innerHeight < 500) {
                // Hauteur faible (mode paysage) : déplacer le sélecteur
                inputSection.insertBefore(selector, searchButton);
                selector.style.marginLeft = '0px';
                typeSection.style.display = 'none';
            } else {
                // Hauteur normale (mode portrait) : remettre le sélecteur
                typeSection.appendChild(selector);
                selector.style.marginLeft = '-10px';
                typeSection.style.display = 'flex';
            }
        }
    }

    // Appliquer au chargement
    moveSelector();

    // Appliquer au redimensionnement
    window.addEventListener('resize', debounce(() => {
        const modal = document.getElementById('search-modal');
        if(isModalVisible(modal.id)) {
            console.log('\n\n*** debug resize in openSearchModal in searchModalUI for moveSelector \n\n');   
            moveSelector();
        }
    }, 150));


    // // Gestion spéciale pour les champs de dates en mode paysage mobile
    // const inputs = [document.getElementById('searchModal-search-input'), document.getElementById('date-start'), document.getElementById('date-end')];
    // const modal = document.getElementById('search-modal');

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


export async function showHeatmapFromSearch() {
    if (window.currentSearchResults && window.currentSearchResults.length > 0) {
        // closeSearchModal();
        // await displayHeatMap(null, window.currentSearchResults, false, null, null,(window.currentSearchResults.length ===1), window.currentSearchResults[0].name);
        await displayHeatMap(null, window.currentSearchResults, false, null, 'heatmap')

        // Ajuster la disposition pour le mode écran partagé
        const modal = document.getElementById('search-modal')
        const content = modal.querySelector('.searchModal-content'); 
        // console.log('- debug adjustSplitScreenLayout in showHeatmapFromSearch', modal, content, heatmapWrapper)
        if (content ) {
            adjustSplitScreenLayout(content, true);
            // console.log('- debug adjustSplitScreenLayout in showHeatmapFromSearch')
        }
        //window.currentSearchResults
    }
};


/**
 * Effectue la recherche dans la modale
 */
function performModalSearch(firstName = null, lastName = null, isFromSearchModal = false) {

    
    let searchTerm = document.getElementById('searchModal-search-input').value.trim();

    if(!isFromSearchModal) {
        if (firstName && lastName && firstName != '' && lastName != '') {
            searchTerm = firstName + ' ' + lastName;
        }
    } else {
        if ((firstName || lastName) && (firstName != '' || lastName != '')) {
            if (firstName && lastName && firstName != '' && lastName != '') {
                searchTerm = firstName + ' ' + lastName;
            } else if (firstName && firstName != '') {
                searchTerm = firstName;
            } else if (lastName && lastName != '') {
                searchTerm = lastName;
            } else { searchTerm = '';}
        }
        // console.log(`\n\n debug prénom nom, firstName=${firstName}, lastName=${lastName}, searchTerm=${searchTerm}, isFromSearchModal=${isFromSearchModal}`); 
    }



    this.name = 'performModalSearch';
    
    console.log("-call to performModalSearch with ", this.name);
    this.lastSelectedLocationIndex = null;
    let self = this; 



    const searchType = document.getElementById('searchModal-search-type').value;

    const startYear = document.getElementById('date-start').value;
    const endYear = document.getElementById('date-end').value;
    const resultsContainer = document.getElementById('searchModal-search-results');




    
    // if (!searchTerm) {
    //     resultsContainer.innerHTML = '<div style="text-align: center; color: #666; padding: 10px;">Veuillez saisir un terme de recherche</div>';
    //     return;
    // }
    
    // Convertir les années en nombres ou null
    const startYearNum = startYear ? parseInt(startYear) : null;
    const endYearNum = endYear ? parseInt(endYear) : null;
    


    const config = {
        type: searchType, //state.treeMode,
        startDate:  startYearNum,
        endDate: endYearNum,
        scope: 'all',
        rootPersonId: state.rootPersonId, //state.rootPersonId//scopeSelect.value !== 'all' ? finalRootPersonSelect.value : null
    };


    // Effectuer la recherche avec filtrage par dates
    const res = findPersonsBy(searchTerm, config, searchTerm, null, firstName, lastName, isFromSearchModal);
    const results = res.results;
    // Stocker les résultats pour la heatmap
    window.currentSearchResults = results;
    
    // Afficher les résultats
    if (results.length === 0) {
        const dateInfo = (startYearNum || endYearNum) ? 
            ` (période: ${startYearNum || '?'}-${endYearNum || '?'})` : '';
        resultsContainer.innerHTML = `<div style="text-align: center; color: #666; padding: 10px;">${searchModalTranslations[window.CURRENT_LANGUAGE].noResults} "${searchTerm}"${dateInfo}</div>`;
        return;
    }
    
    resultsContainer.innerHTML = ''; // reset

     if (results.length > 0) {

        // 👉 bloc d'instruction
        const instructionDiv = document.createElement('div');
        // Modifier instructionDiv pour flex + stretch
        instructionDiv.style.display = 'flex';
        instructionDiv.style.alignItems = 'stretch';
        instructionDiv.style.padding = '0px 5px';  
        instructionDiv.style.color = '#ff6600ff';
        instructionDiv.style.fontWeight = 'bold';
        instructionDiv.style.fontSize = '13px';
        instructionDiv.style.marginBottom = '5px';
        // instructionDiv.style.padding = '2px';
        instructionDiv.style.background = '#f9f9f9';
        instructionDiv.style.borderRadius = '3px';

        // Zone gauche (texte) - garde le style actuel
        const leftZone = document.createElement('div');
        leftZone.style.cssText = 'flex: 1; display: flex; align-items: center;';

        // 👉 bloc d'instruction
        const span = document.createElement('span');
        span.textContent = searchModalTranslations[window.CURRENT_LANGUAGE].clickMessage;
        span.style.fontSize = '11px';
        span.style.padding = '0px';
        span.style.marginTop = '0px';
        span.style.marginBottom = '0px';        
        leftZone.style.padding = '0px';
        leftZone.style.marginTop = '0px';
        leftZone.style.marginBottom = '0px'; 
        leftZone.appendChild(span);

        // Zone droite (bouton) - même style que les lignes
        const rightZone = document.createElement('div');
        rightZone.style.cssText = `
            display: flex;
            align-items: center;
            padding: 0px 0px;
            transition: background-color 0.2s;
            align-self: stretch;                    // ← AJOUT : force l'étirement vertical
        `;


        rightZone.addEventListener('mouseenter', () => rightZone.style.backgroundColor = 'rgba(0,123,255,0.1)');
        rightZone.addEventListener('mouseleave', () => rightZone.style.backgroundColor = 'transparent');

        const heatmapButton = document.createElement('button');
        heatmapButton.textContent = '🌍';
        heatmapButton.style.cssText = `
            background: transparent;
            color: inherit;
            border: none;
            cursor: pointer;
            fontSize: 18px;
            padding: 6px;
        `;

        heatmapButton.addEventListener('click', () => showHeatmapFromSearch());
        rightZone.appendChild(heatmapButton);

        instructionDiv.appendChild(leftZone);
        instructionDiv.appendChild(rightZone);

        // instructionDiv.style.cssText = 'display: flex; align-items: stretch; min-height: 30px; padding: 0;';

        resultsContainer.appendChild(instructionDiv);
    }

    results.forEach((person, index) => {
        const item = document.createElement('div');
        item.className = 'result-item';

       // Pour le type 'name', ne pas afficher le badge "Nom:"
        let matchInfo = '';
        if (searchType !== 'name') {
            matchInfo = person.matches.map(match => 
                `<span class="result-match" style="color:darkblue;background:#f2e3ccff;" ">${match.field}:<span style="color:black;"> ${match.value}</span></span>`
            ).join('');
        }

        // Ajouter les dates avec icônes
        const birthYear = extractYear(person.birthDate);
        const deathYear = extractYear(person.deathDate);
        let marriageYear = null;
        let relevantDate = null; // Pour stocker la date pertinente si trouvée
        // Les personnes ne stockent généralement pas directement leur date de mariage
        // Il faut la récupérer via les familles où elles apparaissent comme conjoint
        if (person.spouseFamilies && person.spouseFamilies.length > 0) {
            // Pour chaque famille où la personne est un conjoint
            person.spouseFamilies.forEach(familyId => {
                const family = state.gedcomData.families[familyId];
                if (family && family.marriageDate) {
                    marriageYear = extractYear(family.marriageDate);
                }
            });
        }
        if (!birthYear && !deathYear && !marriageYear) {
            const dateInfo0 = findDateForPerson(person.id);
            if (dateInfo0 && dateInfo0.year) {
                relevantDate = dateInfo0.year;
            }
        }

        let dateInfo = '';
        if (birthYear) {
            dateInfo = ` (👶${birthYear})`;
        } else if (deathYear) {
            dateInfo = ` (✝️${deathYear})`;
        } else if (marriageYear) {
            dateInfo = ` (💍${marriageYear})`;
        } else if (relevantDate) {
            dateInfo = ` (~${relevantDate})`;
        } 

        // Zone gauche pour le noms et les dates directement dans item
        const leftZone = document.createElement('div');

        if (! matchInfo) {
            leftZone.style.cssText = `
                flex: 1; 
                display: flex;
                align-items: center;
                cursor: pointer; 
                transition: background-color 0.2s;
                padding: 0 4px;
            `;
        } else {
            leftZone.style.cssText = `
                flex: 1; 
                display: flex;
                flex-direction: column;  // ← Ajout pour organiser nom + info verticalement
                justify-content: center;
                cursor: pointer; 
                transition: background-color 0.2s;
                padding: 0 4px;
                height: 100%;
            `;
        }

        // leftZone.addEventListener('click', () => {
        //     if (currentSearchPurpose === 'root') {
        //         selectPersonFromModal(person.id);
        //     } else {
        //         if (currentSearchCallback) currentSearchCallback(person);
        //         window.closeSearchModal();
        //     }
        // });



        // Dans searchModalUI.js, à l'intérieur de la fonction qui affiche les résultats
        leftZone.addEventListener('click', () => {
            // console.log(`[DEBUG] Clic sur la personne:`, person); // <-- AJOUTER
            // console.log(`[DEBUG] But actuel: '${currentSearchPurpose}'`); // <-- AJOUTER
            // console.log(`[DEBUG] Callback existe?`, !!currentSearchCallback); // <-- AJOUTER

            if (currentSearchPurpose === 'root') {
                selectPersonFromModal(person.id);
            } else {
                if (currentSearchCallback) {
                    // console.log("[DEBUG] Appel du callback..."); // <-- AJOUTER
                    currentSearchCallback(person);
                }
                window.closeSearchModal();
            }
        });






        leftZone.addEventListener('mouseenter', () => leftZone.style.backgroundColor = 'rgba(0,123,255,0.1)');
        leftZone.addEventListener('mouseleave', () => leftZone.style.backgroundColor = 'transparent');

        const nameDiv = document.createElement('div');
        nameDiv.className = 'result-name';
        if (matchInfo) {
            nameDiv.style.fontWeight = 'normal'; //= 'bold';
            nameDiv.style.fontSize = nameCloudState.mobilePhone ? '12px' : '14px';
            nameDiv.innerHTML =   `<b>${person.name.replace(/\//g, '').trim()}</b> ${dateInfo || ''}`;
        } else {
            nameDiv.style.fontWeight = 'normal'; 
            nameDiv.textContent = person.name.replace(/\//g, '').trim() + (dateInfo || '');           
        }


        leftZone.appendChild(nameDiv);

        // Zone droite pour le bouton 🌍directement dans item  
        const rightZone = document.createElement('div');
        rightZone.style.cssText = `
            display: flex;
            align-items: center;
            padding: 0 0px;
            transition: background-color 0.2s;
        `;
        rightZone.addEventListener('mouseenter', () => rightZone.style.backgroundColor = 'rgba(0,123,255,0.1)');
        rightZone.addEventListener('mouseleave', () => rightZone.style.backgroundColor = 'transparent'); 


        // 👉 ajouter l’icône 🌍
        const locationIcon = createLocationIcon(true, index, person.name, config, searchTerm, self);
        rightZone.appendChild(locationIcon);

        // Mettre item en flex pour contenir les 2 zones
        // Forcer item à avoir une hauteur minimum et supprimer tout padding
        item.style.cssText = 'display: flex; align-items: stretch; min-height: 30px; padding: 0;';
        
        if (matchInfo) {
            const infoDiv = document.createElement('div');
            infoDiv.className = 'search-result-info';
            infoDiv.innerHTML = matchInfo;
            // infoDiv.style
            leftZone.appendChild(infoDiv);
        } 

        item.appendChild(leftZone);
        item.appendChild(rightZone);
        resultsContainer.appendChild(item);
    });


    // Ajouter le texte d'instruction au-dessus de la liste
    if (results.length === 0) {
        heatmapButton.style.display = 'none';
    }

    // Mettre à jour le label avec le nombre de personnes trouvées
    const helpText = document.getElementById('search-help-text');
    if (helpText) {
        helpText.textContent = `${results.length} ${searchModalTranslations[window.CURRENT_LANGUAGE].person}${results.length > 1 ? 's' : ''} 
        ${searchModalTranslations[window.CURRENT_LANGUAGE].found}${results.length > 1 ? 's' : ''} 
        ${searchModalTranslations[window.CURRENT_LANGUAGE].over} ${Object.keys(state.gedcomData.individuals).length} 
        ${searchModalTranslations[window.CURRENT_LANGUAGE].pers} 
        (${searchModalTranslations[window.CURRENT_LANGUAGE].m}=${res.male_counter}, 
        ${searchModalTranslations[window.CURRENT_LANGUAGE].withPlace}=${res.personWithPlace_counter}, 
        ${searchModalTranslations[window.CURRENT_LANGUAGE].withOccupation}=${res.personWithOccupation_counter})`;
    }

    if (results.length > 0) {
        const heatmapWrapper = document.getElementById('namecloud-heatmap-wrapper');
        if (heatmapWrapper) { showHeatmapFromSearch(); }
    }


    const modal = document.getElementById('search-modal')

    const content = modal.querySelector('.searchModal-content'); 
    content._nbElementInlist = results.length;
    content._isVisible = true;    
    adjustSplitScreenLayout(content, true);


}

/**
 * Sélectionne une personne depuis la modale
 */
window.selectPersonFromModal = function(personId) {
    // Fermer la modale
    // state.rootPersonId = personId;
    const searchRoot = document.getElementById('statsModal-search-root');
    if (searchRoot) {
        searchRoot.value = '🔍'+state.gedcomData.individuals[personId].name.replace(/\//g, '');
    }
    closeSearchModal();
    const heatmapWrapper = document.getElementById('namecloud-heatmap-wrapper');

    if (heatmapWrapper && !state.isWordCloudEnabled) {
        heatmapWrapper.remove();
    }

    // if (!window.isFromStatsModal) { 
    if (true) { 
    
        // Utiliser la fonction existante selectFoundPerson ou displayGenealogicTree
        // if (typeof selectFoundPerson === 'function') {
        console.log('\n\n\n\n ###################   CALL displayGenealogicTree from modal ################# ');
        selectFoundPerson(personId);
        // } else {
        //     console.log('\n\n\n\n ###################   CALL displayGenealogicTree from modal ################# ');
        //     if (state.isRadarEnabled) {
        //         displayGenealogicTree(personId, false, false, false, 'WheelAncestors');
        //     } else {
        //         displayGenealogicTree(personId, true, false);
        //     }
        // }
    }

    window.isFromStatsModal = false;
};

/**
 * Ferme la modale de recherche
 */
window.closeSearchModal = function() {
    const modal = document.getElementById('search-modal');
    if (modal) {
        const content = modal.querySelector('.searchModal-content'); 
        if (content) {
            if (content._cleanupDraggable) content._cleanupDraggable();
        }
        modal.style.display = 'none';
        content._isVisible = false;
    }
};

/**
 * Modifier la fonction d'événement du champ de recherche existant
 */
export function setupSearchFieldModal(isFromStatsModal = false) {

    window.isFromStatsModal = isFromStatsModal;
    const searchField = document.getElementById('root-person-search');
    if (searchField) {
        console.log('- open setupSearchFieldModal');

        // Remplacer l'événement focus existant
        searchField.addEventListener('focus', function(event) {
            event.preventDefault();
            this.blur(); // Enlever le focus
            console.log('- launch openSearchModal in setupSearchFieldModal focus');
            openSearchModal();
        });
        
        // Empêcher la saisie directe
        searchField.addEventListener('keydown', function(event) {
            event.preventDefault();
            console.log('- launch openSearchModal in setupSearchFieldModal keydown');
            openSearchModal();
        });

        if (isFromStatsModal) { 
            openSearchModal();
        }
        
        // Ajouter un placeholder informatif
        searchField.placeholder = searchModalTranslations[window.CURRENT_LANGUAGE].rootPersonSearch;
        searchField.style.cursor = "pointer";
    }
}
