import { createCustomSelector } from './UIutils.js';
import { state, displayGenealogicTree, displayHeatMap } from './main.js';
import { nameCloudState, getPersonsFromTree } from './nameCloud.js';
import { selectFoundPerson } from './eventHandlers.js';
import { extractYear, findDateForPerson } from './nameCloudUtils.js';
import { createLocationIcon } from './nameCloudStatModal.js';



const searchModalTranslations = {
    fr: {
        title: "Recherche de la pers. racine",
        nameOption: "par Nom/Prénom",
        placeOption: "par Lieux", 
        occupationOption: "par Profession",
        searchPlaceholder: "🔍Tapez votre recherche...",
        yearStartPlaceholder: "Année début",
        yearEndPlaceholder: "Année fin",
        searchButton: "Search",
        dateFilterLabel: "filtrage<br>par dates",
        helpName: "Recherche dans les noms et prénoms",
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
        nameOption: "per Name/First name",
        placeOption: "per Places",
        occupationOption: "per Profession",
        searchPlaceholder: "🔍Type your search...",
        yearStartPlaceholder: "Start year",
        yearEndPlaceholder: "End year", 
        searchButton: "Search",
        dateFilterLabel: "date<br>filtering",
        helpName: "Search in names and first names",
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
        nameOption: "por Nombre/Apellido",
        placeOption: "por Lugares",
        occupationOption: "por Profesión",
        searchPlaceholder: "🔍Escriba su búsqueda...",
        yearStartPlaceholder: "Año inicio",
        yearEndPlaceholder: "Año fin",
        searchButton: "Ir",
        dateFilterLabel: "filtrado<br>por fechas",
        helpName: "Búsqueda en nombres y apellidos",
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
        nameOption: "Név/Keresztnév szerint",
        placeOption: "Helyek szerint",
        occupationOption: "Foglalkozás szerint",
        searchPlaceholder: "🔍Írja be a keresést...",
        yearStartPlaceholder: "Kezdő év",
        yearEndPlaceholder: "Befejező év",
        searchButton: "Indul",
        dateFilterLabel: "dátum<br>szűrés",
        helpName: "Keresés nevekben és keresztnevekben",
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
export function findPersonsBy(searchTerm, config, searchTermFull, originalName = null ) {  
    

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


    // console.log('-debug in findPersonsBy0 searchStr =', searchStr, config, ', searchStrFull=', searchStrFull,  ', searchStrFullFull=', searchStrFullFull, ', originalName=', originalName)



    const results = [];
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
   

    // Object.values(state.gedcomData.individuals).forEach(person => {
    personList.forEach(person => {
        const matches = [];
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

       
        // Recherche par nom
        if (searchType === 'name' || (searchType === 'prenoms' || searchType === 'noms')) {

            let givn, surn;
            if (person.givn) { givn=person.givn;} else {givn='';}
            if (person.surn) { surn=person.surn;} else {surn='';}
            let fullName;
            // fullName = person.name.toLowerCase().replace(/\//g, '') + ' ' + givn.toLowerCase().replace(/\//g, '') + ' ' + surn.toLowerCase().replace(/\//g, '');
            if (searchType === 'prénoms') {
                fullName = person.name.split('/')[0].toLowerCase().replace(/\//g, '')  + ' ' + surn.toLowerCase().replace(/\//g, '');
            } else if (searchType === 'noms') {
                fullName = person.name.split('/')[1].toLowerCase().replace(/\//g, '')  + ' ' + givn.toLowerCase().replace(/\//g, '');
            } else {
                fullName = person.name.toLowerCase().replace(/\//g, '') + ' ' + givn.toLowerCase().replace(/\//g, '') + ' ' + surn.toLowerCase().replace(/\//g, '');
            }


            // console.log('-debug in findPersonsBy fullName =', fullName, ', searchStr=', searchStr); 
            // if (fullName.includes(searchStrFullFull)) {
            //     console.log('-debug in findPersonsBy1 ', searchType, searchStr, searchStrFull , ', searchStrFullFull=', searchStrFullFull, ',fullInputName=', fullName, (fullName.trim() === searchStrFullFull));
            //     console.log('-debug in findPersonsBy2 ', fullName.trim()); // === searchStrFullFull.trim()) )
            // }
            if (searchType !== 'prenoms'  || searchStr === searchStrFull) {
                // if (searchType == 'noms' && searchStrFullFull && fullName.includes(searchStrFullFull)) {
                if (searchType == 'noms' && searchStrFullFull) {
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
                // else if (searchType == 'noms' && searchStrFullFull && fullName.includes(searchStrFullFull)) {
                //         matches.push({
                //             type: 'name',
                //             field: 'Nom',
                //             value: person.name.replace(/\//g, '').trim()
                //         });
                // }
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

    console.log("\n Recherche sur :", Object.keys(state.gedcomData.individuals).length, ' personnes. ', results.length, ' personnes trouvées.', ' withDate=',personWithDate_counter, ', withOccupation=',personWithOccupation_counter, ', withPlace=',personWithPlace_counter, ', homme=',male_counter,  ', FoundWithOccupation=',foundPersonWithOccupation_counter, ', foundWithPlace=',foundPersonWithPlace_counter, ', foundHomme=',foundMale_counter);

    return {results, personWithDate_counter, personWithOccupation_counter, personWithPlace_counter, male_counter, foundPersonWithOccupation_counter, foundPersonWithPlace_counter, foundMale_counter};
}


/**
 * Crée et affiche la modale de recherche
 */
function openSearchModal() {

    // Vérifier si la modale existe déjà
    let existingModal = document.getElementById('search-modal');

    // console.log('- open setupSearchFieldModal openSearchModal', existingModal);

    if (existingModal) {
        existingModal.style.display = 'flex';
        // Vider les champs à la réouverture
        document.getElementById('search-modal-search-input').value = '';
        // document.getElementById('date-start').value = '';
        // document.getElementById('date-end').value = '';
        document.getElementById('search-modal-search-input').focus();
        return;
    }


    // Créer la modale
    const modal = document.createElement('div');
    modal.id = 'search-modal';
    modal.innerHTML = `
        <div class="search-modal-overlay">
            <div class="search-modal-content">
                <div class="search-modal-header">
                    <h3>${searchModalTranslations[window.CURRENT_LANGUAGE].title}</h3>
                    <button class="search-modal-close" onclick="closeSearchModal()">&times;</button>
                </div>
                
                <div class="search-modal-body">

                    <div class="search-type-section">
                        <div id="search-modal-search-type-container"></div>
                    </div>

                    <div class="search-input-section">
                        <input type="text" id="search-modal-search-input" placeholder="${searchModalTranslations[window.CURRENT_LANGUAGE].searchPlaceholder}">
                        <button id="search-modal-search-button"> ${searchModalTranslations[window.CURRENT_LANGUAGE].searchButton} </button>
                    </div>

                    <div class="date-filter-section">
                        <input type="number" id="date-start" placeholder="${searchModalTranslations[window.CURRENT_LANGUAGE].yearStartPlaceholder}" min="1000" max="2100">
                        <span>- </span>
                        <input type="number" id="date-end" placeholder="${searchModalTranslations[window.CURRENT_LANGUAGE].yearEndPlaceholder}" min="1000" max="2100">
                        <label>${searchModalTranslations[window.CURRENT_LANGUAGE].dateFilterLabel}</label>
                    </div>
                    
                    <div class="search-help">
                        <div id="search-help-text">${searchModalTranslations[window.CURRENT_LANGUAGE].helpName}</div>
                    </div>
                    
                    <div class="search-results" id="search-modal-search-results">
                        <!-- Les résultats apparaîtront ici -->
                    </div>

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
            background: rgba(0, 0, 0, 0.3);
            display: flex;
            justify-content: center;
            align-items: flex-start; 
            padding-top: 2px;
            z-index: 9000;
        }
        
        .search-modal-overlay {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: flex-start;  
            padding-top: 2px;
        }
        
        .search-modal-content {
            background: white;
            border-radius: 8px;
            width: 90%;
            max-width: 600px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            max-height: calc(100vh - 5px) !important; /* Utiliser presque toute la hauteur */
            height: auto !important;

        }
        
        .search-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 3px 20px;
            background: #ff9800;
            color: white;
        }
        
        .search-modal-header h3 {
            margin: 0;
            font-size: 18px;
        }
        
        .search-modal-close {
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
        }
        
        .search-modal-close:hover {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
        }
        
        .search-modal-body {
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

        #search-modal-search-input {
            width: 200px;
            padding: 4px;
            border: 2px solid #ff9800;
            border-radius: 4px;
            font-size: 14px;
            box-sizing: border-box;
        }      



        #search-modal-search-type{
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
            font-size: 15px;
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
            width: 95px;
        }

        #date-end {
            margin-left: -2px;
            width: 82px;
        }

        
        #search-modal-search-button {
            padding: 4px 4px;
            background: #ff9800;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            height: 28px !important;
        }
        
        #search-modal-search-button:hover {
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

        
        .search-results {
            overflow-y: auto;
            max-height: calc(100vh - 120px) !important; /* 275 Utiliser presque toute la hauteur mais pas trop il faut retirer la hauteur de toute l'entête*/
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
            font-weight: normal;
            color: #333;
            margin-bottom: 3px;
            font-size: 14px;
        }
        
        .result-info {
            font-size: 11px;
            color: #666;
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



        /* Styles pour mobile en mode portrait */
        @media screen and (max-width: 400px)  {
            .result-name {
                font-size: 13px;
            }


        /* Styles pour mobile en mode paysage */
        @media screen and (max-height: 500px)  {

            .search-modal-header {
                padding: 3px 20px;
            }
            


            .search-modal-header h3 {
                font-size: 16px !important; /* Réduire la taille du titre */
                margin: 0 !important;
            }
            
            .search-modal-body {
                padding: 5px 10px !important; /* Réduire de 20px à 10px */
                max-height: calc(100vh - 60px) !important; /* Ajuster selon la hauteur du header */
            }

            .search-modal-content {
                width: 100% !important; /* Utiliser plus de largeur */
                max-width: 700px !important; /* Augmenter la largeur max */
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

            .search-results {
                overflow-y: auto;
                max-height: calc(100vh - 150px) !important; /* Utiliser presque toute la hauteur mais pas trop il faut retirer la hauteur de toute l'entête*/
                height: auto !important;
            }





            /* Réorganisation en mode paysage mobile */

            .search-type-section {
                display: none !important; /* Cacher la ligne originale du sélecteur */
            }
            
            .search-input-section {
                display: flex !important;
                gap: 5px !important;
                align-items: center !important;
            }

            #search-modal-search-input {
                order: 2;
                width: 200px !important;
                margin-left: 0px !important;

            }
            
            #search-modal-search-type {
                order: 1;
                width: 200px !important;
                position: relative !important;
                margin-left: 5px !important;
            }
            
            #search-modal-search-button {
                order: 3;
                width: 70px !important;
                height: 28px !important;
                font-size: 13px !important;
            }
        }

        </style>
    `;
    
    // Ajouter les styles au document
    if (!document.getElementById('search-modal-styles')) {
        const styleElement = document.createElement('div');
        styleElement.id = 'search-modal-styles';
        styleElement.innerHTML = styles;
        document.head.appendChild(styleElement);
    }
    
    // Ajouter la modale au document
    document.body.appendChild(modal);

    // Configurer les événements
    setupModalEvents();
    
    // Donner le focus au champ de recherche
    setTimeout(() => {
        document.getElementById('search-modal-search-input').focus();
    }, 100);

}

/**
 * Configure les événements de la modale
 */
function setupModalEvents() {

    // Créer le sélecteur personnalisé
    const customSelector = createCustomSelector({
        options: [
            { value: 'name', label: searchModalTranslations[window.CURRENT_LANGUAGE].nameOption },
            { value: 'place', label: searchModalTranslations[window.CURRENT_LANGUAGE].placeOption },
            { value: 'occupation', label: searchModalTranslations[window.CURRENT_LANGUAGE].occupationOption }
        ],

        selectedValue: 'name',
        colors: {
            main: '#ff9800',
            options: '#ff9800',
            hover: '#f57c00',
            selected: '#e65100'
        },
        // dimensions: {
        //     width: '200px',
        //     height: '35px'
        // },

        isMobile: nameCloudState.mobilePhone,
        dimensions: {
            width: '200px',
            height: '28px',
            dropdownWidth: '200px',
            dropdownHeight: '240px' 
        },
        onChange: (value) => {
            // Vider le champ et la liste
            document.getElementById('search-modal-search-input').value = '';
            document.getElementById('search-modal-search-results').innerHTML = '';
        }
    });

    // Ajouter l'ID pour la fonction moveSelector
    customSelector.id = 'search-modal-search-type';

    // L'insérer dans le conteneur
    document.getElementById('search-modal-search-type-container').appendChild(customSelector);


    const searchType = document.getElementById('search-modal-search-type');
    const searchInput = document.getElementById('search-modal-search-input');
    const searchButton = document.getElementById('search-modal-search-button');
    const helpText = document.getElementById('search-help-text');
    
    // Textes d'aide selon le type de recherche
    const helpTexts = {
        'name': searchModalTranslations[window.CURRENT_LANGUAGE].helpName,
        'place': searchModalTranslations[window.CURRENT_LANGUAGE].helpPlace,
        'occupation': searchModalTranslations[window.CURRENT_LANGUAGE].helpOccupation
    };
    
    // Changer le texte d'aide selon le type sélectionné
    searchType.addEventListener('change', function() {
        helpText.textContent = helpTexts[this.value];
        // Vider le champ de recherche quand on change de type
        document.getElementById('search-modal-search-input').value = '';
        document.getElementById('search-modal-search-results').innerHTML = '';
    });

    
    // Recherche en appuyant sur Entrée dans le champ de recherche
    searchInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            new performModalSearch();
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

    searchButton.addEventListener('click', () => { new performModalSearch(); });

    
    // Fermer la modale en cliquant à l'extérieur
    document.getElementById('search-modal').addEventListener('click', function(event) {
        if (event.target === this) {
            closeSearchModal();
        }
    });



    function moveSelector() {
        const selector = document.getElementById('search-modal-search-type');
        const typeSection = document.querySelector('.search-type-section');
        const inputSection = document.querySelector('.search-input-section');
        const searchButton = document.getElementById('search-modal-search-button');
        
        if (window.innerHeight < 500) {
            // Hauteur faible (mode paysage) : déplacer le sélecteur
            inputSection.insertBefore(selector, searchButton);
            typeSection.style.display = 'none';
        } else {
            // Hauteur normale (mode portrait) : remettre le sélecteur
            typeSection.appendChild(selector);
            typeSection.style.display = 'flex';
        }
    }

    // Appliquer au chargement
    moveSelector();

    // Appliquer au redimensionnement
    window.addEventListener('resize', () => {
        moveSelector();
    });



    // Gestion spéciale pour les champs de dates en mode paysage mobile
    const inputs = [document.getElementById('search-modal-search-input'), document.getElementById('date-start'), document.getElementById('date-end')];
    const modal = document.getElementById('search-modal');

    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            // Détection mobile paysage
            if (window.innerHeight <= 600) {
                modal.style.paddingTop = '5px';
                modal.style.alignItems = 'flex-start';
                
                // Faire défiler vers le haut
                setTimeout(() => {
                    this.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                    });
                }, 300);
            }
        });
        
        input.addEventListener('blur', function() {
            // Restaurer la position normale après un délai
            setTimeout(() => {
                if (window.innerHeight < 500) {
                    modal.style.paddingTop = '5px';
                }
            }, 300);
        });
    });

    
}


window.showHeatmapFromSearch = function() {
    if (window.currentSearchResults && window.currentSearchResults.length > 0) {
        // Fermer la modale de recherche
        // closeSearchModal();
        displayHeatMap(window.currentSearchResults, null, null,(personList.results.length ===1), personList.results[0].name);
    }
};


/**
 * Effectue la recherche dans la modale
 */
function performModalSearch() {

    this.name = 'performModalSearch';
    
    console.log("-call to performModalSearch with ", this.name);
    this.lastSelectedLocationIndex = null;
    const self = this; 


    const searchType = document.getElementById('search-modal-search-type').value;
    const searchTerm = document.getElementById('search-modal-search-input').value.trim();
    const startYear = document.getElementById('date-start').value;
    const endYear = document.getElementById('date-end').value;
    const resultsContainer = document.getElementById('search-modal-search-results');
    
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
    const res = findPersonsBy(searchTerm, config, searchTerm);
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
                `<span class="result-match" style="color:darkblue;">${match.field}:<span style="color:black;"> ${match.value}</span></span>`

            //    `<span class="result-match" style="color:red;"><b>' + state.gedcomData.individuals[state.rootPersonId].name.replace(/\//g, '') + '</b></span>`


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

        leftZone.addEventListener('click', () => selectPersonFromModal(person.id));
        leftZone.addEventListener('mouseenter', () => leftZone.style.backgroundColor = 'rgba(0,123,255,0.1)');
        leftZone.addEventListener('mouseleave', () => leftZone.style.backgroundColor = 'transparent');

        const nameDiv = document.createElement('div');
        nameDiv.className = 'result-name';
        if (matchInfo) {
            // nameDiv.style.fontWeight = 'bold';
            nameDiv.style.fontSize = nameCloudState.mobilePhone ? '12px' : '14px';
            nameDiv.innerHTML =   `<b>${person.name.replace(/\//g, '').trim()}</b> ${dateInfo || ''}`;
        } else {
            nameDiv.style.fontWeight = 'normal'; 
            nameDiv.textContent = person.name.replace(/\//g, '').trim() + (dateInfo || '');           
        }
        // nameDiv.textContent = person.name.replace(/\//g, '').trim() + (dateInfo || '');
        // nameDiv.innerHTML =   `<b>${person.name.replace(/\//g, '').trim()}</b> ${dateInfo || ''}`;

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
        const locationIcon = createLocationIcon(index, person.name, config, searchTerm, self);
        rightZone.appendChild(locationIcon);

        // Mettre item en flex pour contenir les 2 zones
        // Forcer item à avoir une hauteur minimum et supprimer tout padding
        item.style.cssText = 'display: flex; align-items: stretch; min-height: 30px; padding: 0;';
        
        if (matchInfo) {
            const infoDiv = document.createElement('div');
            infoDiv.className = 'result-info';
            infoDiv.innerHTML = matchInfo;
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
}

/**
 * Sélectionne une personne depuis la modale
 */
window.selectPersonFromModal = function(personId) {
    // Fermer la modale
    // state.rootPersonId = personId;
    const searchRoot = document.getElementById('stats-modal-search-root');
    if (searchRoot) {
        searchRoot.value = '🔍'+state.gedcomData.individuals[personId].name.replace(/\//g, '');
    }
    closeSearchModal();

    // if (!window.isFromStatsModal) { 
    if (true) { 
    
        // Utiliser la fonction existante selectFoundPerson ou displayGenealogicTree
        if (typeof selectFoundPerson === 'function') {
            selectFoundPerson(personId);
        } else {
            console.log('\n\n\n\n ###################   CALL displayGenealogicTree from modal ################# ');
            if (state.isRadarEnabled) {
                displayGenealogicTree(personId, false, false, false, 'WheelAncestors');
            } else {
                displayGenealogicTree(personId, true, false);
            }
        }
    }

    window.isFromStatsModal = false;
};

/**
 * Ferme la modale de recherche
 */
window.closeSearchModal = function() {
    const modal = document.getElementById('search-modal');
    if (modal) {
        modal.style.display = 'none';
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
            openSearchModal();
        });
        
        // Empêcher la saisie directe
        searchField.addEventListener('keydown', function(event) {
            event.preventDefault();
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
