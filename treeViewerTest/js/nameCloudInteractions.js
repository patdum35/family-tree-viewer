import { state } from './main.js';
import { startAncestorAnimation } from './treeAnimation.js';
import { nameCloudState, extractSearchTextFromTitle, filterPeopleByText } from './nameCloud.js'
// import { nameCloudState, extractSearchTextFromTitle, filterPeopleByText } from './main.js';
// import { extractYear } from './nameCloudUtils.js';
import { extractYear } from './nameCloud.js';

import { removeAllStatsElements } from './nameCloudAverageAge.js';
// import { createDataForHeatMap, createHeatmapDataForPeople } from './geoHeatMapDataProcessor.js';
import { getCreateDataForHeatMap, getCreateHeatmapDataForPeople } from './main.js';
// import { createImprovedHeatmap, displayHeatMap } from './geoHeatMapUI.js';
import { getCreateImprovedHeatmap, getDisplayHeatMap } from './main.js';
import { createLocationIcon } from './nameCloudStatModal.js';
import { makeModalDraggableAndResizable, makeModalInteractive } from './resizableModalUtils.js';
import { resizeModal } from './nameCloudStatModal.js';
import { debounce, isModalVisible } from './eventHandlers.js';
import { getDisplayPersonDetails } from './main.js';
import { closeCloudName } from './nameCloudUI.js';

window.lastSelectedLocationId = null;
window.isIndividualMapMode = false;


/**
 * Fonction pour obtenir le titre traduit selon le type de configuration et la langue courante
 * @param {string} name - Le nom/prénom/métier/âge/lieu à afficher dans le titre
 * @param {number} count - Le nombre de personnes
 * @param {Object} config - La configuration avec le type de données
 * @returns {string} - Le titre traduit
 */
export function getPersonsListTitle(name, count, config) {
    const translations = {
      'fr': {
        'prenoms': `Personnes avec le prénom "${name}" (${count} pers.)`,
        'noms': `Personnes avec le nom "${name}" (${count} pers.)`,
        'professions': `Personnes avec la prof. "${name}" (${count} pers.)`,
        'duree_vie': `Personnes ayant vécu ${name} ans (${count} pers.)`,
        'age_procreation': `Personnes ayant eu un enfant à ${name} a. (${count} pers.)`,
        'age_marriage': `Personnes s'étant mariées à ${name} a. (${count} pers.)`,
        'age_first_child': `Personnes ayant eu leur 1ier enfant à ${name} a. (${count} pers.)`,
        'nombre_enfants': `Personnes ayant eu ${name} enfant(s) (${count} pers.)`,
        'lieux': `Personnes ayant un lien avec ${name} (${count} pers.)`,
        'default': `Personnes (${count})`,
        'placeOf' : 'Lieux de ',
        'noPlaceFor': 'pas de Lieux pour ',
        'seeInTree': 'Voir dans l\'arbre',
        'seeDetails': 'Voir la fiche',
        'animation': 'Animation'
      }, 
      'en': {
        'prenoms': `People with first name "${name}" (${count} people)`,
        'noms': `People with last name "${name}" (${count} people)`,
        'professions': `People with occupation "${name}" (${count} people)`,
        'duree_vie': `People who lived for ${name} years (${count} people)`,
        'age_procreation': `People who had a child at ${name} years old (${count} people)`,
        'age_marriage': `People who got married at ${name} years old (${count} people)`,
        'age_first_child': `People who had their first child at ${name} years old (${count} people)`,
        'nombre_enfants': `People who had ${name} child(ren) (${count} people)`,
        'lieux': `People connected to the place ${name} (${count} people)`,
        'default': `People (${count})`,
        'placeOf' : 'Places of ',
        'noPlaceFor' : 'No places for ', 
        'seeInTree': 'See in tree',
        'seeDetails': 'See details',
        'animation': 'Animation'     
      },
      'es': {
        'prenoms': `Personas con el nombre "${name}" (${count} pers.)`,
        'noms': `Personas con el apellido "${name}" (${count} pers.)`,
        'professions': `Personas con la profesión "${name}" (${count} pers.)`,
        'duree_vie': `Personas que vivieron ${name} años (${count} pers.)`,
        'age_procreation': `Personas que tuvieron un hijo a los ${name} años (${count} pers.)`,
        'age_marriage': `Personas que se casaron a los ${name} años (${count} pers.)`,
        'age_first_child': `Personas que tuvieron su primer hijo a los ${name} años (${count} pers.)`,
        'nombre_enfants': `Personas que tuvieron ${name} hijo(s) (${count} pers.)`,
        'lieux': `Personas relacionadas con el lugar ${name} (${count} pers.)`,
        'default': `Personas (${count})`,
        'placeOf' : 'Lugares de ',
        'noPlaceFor' : 'No hay lugares para ',
        'seeInTree': 'Ver en árbol',
        'seeDetails': 'Ver detalles',
        'animation': 'Animación'
      },
      'hu': {
        'prenoms': `Személyek "${name}" keresztnévvel (${count} személy)`,
        'noms': `Személyek "${name}" vezetéknévvel (${count} személy)`,
        'professions': `Személyek "${name}" foglalkozással (${count} személy)`,
        'duree_vie': `Személyek, akik ${name} évig éltek (${count} személy)`,
        'age_procreation': `Személyek, akik ${name} évesen gyermeket nemzettek (${count} személy)`,
        'age_marriage': `Személyek, akik ${name} évesen házasodtak (${count} személy)`,
        'age_first_child': `Személyek, akiknek ${name} évesen született az első gyermekük (${count} személy)`,
        'nombre_enfants': `Személyek, akiknek ${name} gyermekük volt (${count} személy)`,
        'lieux': `Személyek kapcsolódva a(z) ${name} helyhez (${count} személy)`,
        'default': `Személyek (${count})`,
        'placeOf' : 'Helyek: ',
        'noPlaceFor' : 'Nincsenek helyek ehhez: ', 
        'seeInTree': 'Megjelenítés a fában',
        'seeDetails': 'Adatlap megtekintése',
        'animation': 'Animáció'
      }
    };
  
    // Récupérer la langue actuelle
    const currentLang = window.CURRENT_LANGUAGE || 'fr';
    
    // Récupérer les traductions pour la langue actuelle ou fallback vers le français
    const langTranslations = translations[currentLang] || translations['fr'];
    
    // Retourner le titre pour le type de config ou le titre par défaut
    return langTranslations[config.type] || langTranslations['default'];
}

export function showPersonsList(name, people, config, searchTerm) {
    // console.log("- showPersonsList ", name, people)
    window.currentPeople = people;
    window.currentName = name;

    const type = config.type;
    this.name = config.type + '_' + config.scope + '_' + config.startDate + '_' + config.endDate + '_' + config.rootPersonId + '_' + (searchTerm)?searchTerm:null;
    
    console.log("-call to showPersonsList with ", type, config, searchTerm, ', this=', this, this.name);

    this.lastSelectedLocationIndex = null;
    const self = this; 
    
    if (!people || people.length === 0) return;
    
       
    let existingModal;
    const allModals = document.querySelectorAll('[id^="show-person-list-modal-"]');
    if (allModals) { existingModal = allModals[allModals.length - 1]; }

    let modalId; 
    // if (existingModal && (window.innerHeight < 800 || window.innerWidth < 800 ) ) { 

    modalId = `show-person-list-modal-${state.showPersonListModalCounter}`;
    state.showPersonListModalCounter++;  
    state.peopleList[state.showPersonListModalCounter] = people;  
    state.peopleListTitle[state.showPersonListModalCounter] = name;

    // Création du modal
    const modal = document.createElement('div');
    modal.id = modalId;
    // modal.className = 'frequency-stat-modal';
    modal.className = `show-person-list-modal`;

    modal.style.position = 'fixed';
    modal.style.left = '50%';

    let topLocal;
    let ratioHeight;
    if (window.innerHeight < 500) {
        ratioHeight = 80;
        topLocal = 70;
    } else {
        ratioHeight = 70;
        topLocal = 105;        
    }

    modal.style.top = topLocal + 'px'; 
    modal.style.transform = 'translateX(-50%)';
    modal.style.backgroundColor = 'white';
    modal.style.padding = '0px 4px';
    modal.style.borderRadius = '8px';
    modal.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
    modal.style.zIndex = state.topZindex;

    modal.style.maxWidth = '600px';
    modal.style.minWidth = state.minModalWidth + 'px';
    modal.style.width = '90%';

    modal.style.maxHeight = ratioHeight +'vh';
    modal.style.minHeight = state.minModalHeight + 'px';
    modal.style.overflow = 'auto';

    modal.style.display = "flex";           // Pour que l'ascenseur s'adapte automatiquement à la hauteur de la modal quand on resize
    modal.style.flexDirection = "column";   // Pour que l'ascenseur s'adapte automatiquement à la hauteur de la modal quand on resize
    
    
    // En-tête du modal
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.borderBottom = '1px solid #eee';
    // Nouvelles propriétés pour rendre l'en-tête sticky
    header.style.position = 'sticky';
    header.style.top = '0';
    header.style.backgroundColor = '#EBF8FF'; //'white';
    header.style.zIndex = '1101';
    header.style.paddingTop = '3px';
    header.style.paddingBottom = '5px';
    header.style.width = '100%';
    // header.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    // Ajuster la marge pour éviter le déplacement du contenu
    header.style.marginBottom = '0px';
    header.style.marginLeft = '-20px';  // Compenser le padding du modal
    header.style.marginRight = '-20px'; // Compenser le padding du modal
    header.style.paddingLeft = '20px';  // Restaurer le padding pour l'alignement
    header.style.paddingRight = '20px'; // Restaurer le padding pour l'alignement

    
    // Container pour titre + bouton de tri
    const titleContainer = document.createElement('div');
    titleContainer.style.display = 'flex';
    titleContainer.style.alignItems = 'center';
    titleContainer.style.gap = '5px 5px';
    titleContainer.style.marginLeft = '5px';

    const title = document.createElement('h2');


    title.textContent = getPersonsListTitle(name, people.length, config);

    // on ajoute un titre caché en français , qui était l'ancien titre avant le multilingue pour le filtrage de personnes dans showHeatmapAndAdjustLayout qui est resté en français
    const hiddenFormerFrenchTitle = config.type === 'prenoms' ? 
        `Personnes avec le prénom "${name}" (${people.length} personnes)` :
        config.type === 'noms' ?
            `Personnes avec le nom "${name}" (${people.length} personnes)` :
            config.type === 'professions' ? 
                `Personnes avec la profession "${name}" (${people.length} personnes)` :
                config.type === 'duree_vie' ? 
                    `Personnes ayant vécu ${name} ans (${people.length} personnes)` :
                    config.type === 'age_procreation' ?
                    `Personnes ayant eu un enfant à ${name} ans (${people.length} personnes)` : 
                        config.type === 'lieux' ?
                        `Personnes ayant un lien avec le lieu ${name}  (${people.length} personnes)`:
                        'Personnes';


    title.style.margin = '0';
    title.style.fontSize = nameCloudState.mobilePhone ? '11px' : '16px';


    const geoLocButton = document.createElement('button');
    geoLocButton.innerHTML = '🌍';
    geoLocButton.style.background = 'none';
    geoLocButton.style.border = '1px solid #ccc';
    geoLocButton.style.borderRadius = '4px';
    geoLocButton.style.padding = '2px 3px';
    geoLocButton.style.cursor = 'pointer';
    geoLocButton.style.fontSize = '16px';
    geoLocButton.style.minWidth = '32px';
    geoLocButton.style.minHeight = '32px';
    geoLocButton.title = 'geolocalisation';


    modal._nbElementInlist = people.length;



    function addElementToList(people, showPersonListModalIndex = null) {

        // Trier les personnes par date
        const peopleWithDates = people.map(person => {
            let date = '';
            let sortDate = 0;
            let symbolType = ''; // Pour stocker le type de symbole
            const individual = state.gedcomData.individuals[person.id];

            if (individual) {
                if (individual.birthDate) {
                    symbolType = 'birth';
                    // date = `<span class="date-symbol" style="font-size: 1.5em; vertical-align: middle;">👶</span> ${individual.birthDate}`; //🚼
                    date = '👶' + individual.birthDate;

                    sortDate = extractYear(individual.birthDate) || 0;
                } else if (individual.deathDate) {
                    symbolType = 'death';
                    // date = `<span class="date-symbol" style="font-size: 1.6em; vertical-align: middle;">✝️</span> ${individual.deathDate}`; //'✝'; ////☦🏴⚰️
                    date = '✝️' + individual.deathDate;
                    sortDate = extractYear(individual.deathDate) || 0;
                } else if (individual.spouseFamilies && individual.spouseFamilies.length > 0) {
                    for (const famId of individual.spouseFamilies) {
                        const family = state.gedcomData.families[famId];
                        if (family && family.marriageDate) {
                            symbolType = 'marriage';
                            // date = `<span class="date-symbol" style="font-size: 1.6em; vertical-align: middle;">💍</span> ${family.marriageDate}`; //🔗💞⚭
                            date = '💍' + family.marriageDate;
                            sortDate = extractYear(family.marriageDate) || 0;
                            break;
                        }
                    }
                }
                
                // Ajouter les informations de lieu
                individual.hasLocations = !!(
                    individual.birthPlace || 
                    individual.deathPlace || 
                    individual.residPlace1 || 
                    individual.residPlace2 || 
                    individual.residPlace3 ||
                    (individual.spouseFamilies && individual.spouseFamilies.some(famId => {
                        const family = state.gedcomData.families[famId];
                        return family && family.marriagePlace;
                    }))
                );
            }

            return {
                name: person.name,
                id: person.id,
                date: date,
                symbolType: symbolType,
                sortDate: sortDate,
                hasLocations: individual ? individual.hasLocations : false
            };
        }).sort((a, b) => b.sortDate - a.sortDate);

        peopleWithDates.forEach((person, index) => {

            const itemContainer = document.createElement('div');

            itemContainer.style.cssText = `
                display: flex; 
                align-items: stretch; 
                border-bottom: ${index < people.length - 1 ? '1px solid #eee' : 'none'};
                min-height: 30px;
            `;
            
            // Définir des styles alternatifs pour les lignes
            if (index % 2 === 0) {
                itemContainer.style.backgroundColor = '#f9f9f9';
            }
                        
            // Zone gauche (nom + occurrence) - cliquable
            const leftZone = document.createElement('div');
            leftZone.style.cssText = `
                flex: 1; 
                display: flex;
                align-items: center;
                justify-content: space-between;
                cursor: pointer; 
                transition: background-color 0.2s;
                padding: 8px 0px;
                /* padding-left: 8px; */
                /*  padding-top: 0; */
                height: 100%;
                background-color: ${index % 2 === 0 ? '#f9f9f9' : 'white'};
            `;

            // Texte de l'élément
            const itemName = document.createElement('div');
            itemName.textContent = person.name;
            itemName.style.flex = '1';
            itemName.style.marginLeft = '5px';
            if (nameCloudState.mobilePhone) {
                itemName.style.fontSize = '13px';
            }

            // Dates
            const itemDate = document.createElement('div');
            itemDate.textContent = person.date;
            itemDate.style.marginLeft = '10px';
            itemDate.style.marginRight = '20px';
            itemDate.style.color = 'darkblue';
            itemDate.style.setProperty("text-align", "left", "important");
            if (nameCloudState.mobilePhone) {
                itemDate.style.fontSize = '10px';
            }

            leftZone.appendChild(itemName);
            leftZone.appendChild(itemDate);



            // Zone droite (bouton) - séparée
            const rightZone = document.createElement('div');
            rightZone.style.cssText = `
                display: flex;
                align-items: center;
                transition: background-color 0.2s;
                background-color: ${index % 2 === 0 ? '#f9f9f9' : 'white'};                    
                height: 40;
            `;

            // Gestion des survols et clics
            leftZone.addEventListener('click', (event) => {
                // console.log('Clicked on person:', person.name, person.id);
                event.stopPropagation();
                showPersonActions(person, event);
            });

            leftZone.addEventListener('mouseenter', () => {
                leftZone.style.backgroundColor = index === -1 ? '#E1F0FF' : '#f0f0f0';
            });
            leftZone.addEventListener('mouseleave', () => {
                leftZone.style.backgroundColor = index === -1 ? '#EBF8FF' : (index % 2 === 0 ? '#f9f9f9' : 'white');
            });

            rightZone.addEventListener('mouseenter', () => {
                rightZone.style.backgroundColor = index === -1 ? '#E1F0FF' : '#f0f0f0';
            });
            rightZone.addEventListener('mouseleave', () => {
                rightZone.style.backgroundColor = index === -1 ? '#EBF8FF' : (index % 2 === 0 ? '#f9f9f9' : 'white');
            });

            if (person.hasLocations) {
                const localConfig = {};
                localConfig.type = 'name';
                localConfig.scope = 'all';   
                localConfig.startDate = null;                
                localConfig.endDate = null;
                // console.log('\n\n ------debug call to createLocationIcon from addElementToList, showPersonListModalIndex', showPersonListModalIndex,'\n\n');

                // const locationIcon = createLocationIcon(true, index, person.name, localConfig, searchTerm, self, showPersonListModalIndex);
                const locationIcon = createLocationIcon(true, index, person.name, localConfig, searchTerm, self, 1, null, null, null, null, showPersonListModalIndex);
                rightZone.appendChild(locationIcon);
            }

            itemContainer.appendChild(leftZone);
            itemContainer.appendChild(rightZone);

            itemContainer.style.cssText = 'display: flex; align-items: stretch; min-height: 30px; padding: 0;';

            list.appendChild(itemContainer);
        });
    }




    // Gestionnaire du bouton de geoLocalisation
    const showPersonListModalIndex = state.showPersonListModalCounter
    geoLocButton.onclick = () => {
        console.log('Clic bouton geoLocalisation');
        showHeatmapFromShowPersonList(showPersonListModalIndex);
    };
    // Initialiser l'affichage des boutons

    // Ajout au container
    titleContainer.appendChild(title);
    titleContainer.appendChild(geoLocButton);

    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '28px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.padding = '2px 10px';
    closeButton.style.marginRight = '10px';

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
    

    // Créer une liste pour les occurrences avec ascenseur personnalisé
    const list = document.createElement('div');
    list.style.maxHeight = '80vh';
    list.style.overflow = 'auto';
    list.style.fontSize = '14px';  // Taille de police réduite


    // Styles pour webkit (Chrome, Safari) POUR LE SCROLLBAR ***************************
    const style = document.createElement('style');
    style.textContent = `
        .show-person-list-modal div::-webkit-scrollbar {
            width: 20px !important;
        }
        .show-person-list-modal div::-webkit-scrollbar-track {
            background: #80f0f044; /* Couleur de fond du track  */
            border-radius: 6px;
        }
        .show-person-list-modal div::-webkit-scrollbar-thumb {
            background: #3182ce; /* Couleur du curseur  */
            border-radius: 6px;
            border: 2px solid #f0f0f0; /* Bordure du curseur */
            min-height: 50px;  /* Hauteur minimum du curseur  */
        }
        .show-person-list-modal div::-webkit-scrollbar-thumb:hover {
            background: #2c5aa0; /* Couleur au survol */
        }

        /* Bouton du haut */
        .show-person-list-modal div::-webkit-scrollbar-button:single-button:vertical:decrement {
            background: #3182ce;
            height: 20px;
            display: block;
            background-image: url("data:image/svg+xml;utf8,<svg fill='white' xmlns='http://www.w3.org/2000/svg' width='10' height='10'><polygon points='0,10 5,0 10,10'/></svg>");
            background-repeat: no-repeat;
            background-position: center;
            border-radius: 6px 6px 0 0;
        }

        /* Bouton du bas */
        .show-person-list-modal div::-webkit-scrollbar-button:single-button:vertical:increment {
            background: #3182ce;
            height: 20px;
            display: block;
            background-image: url("data:image/svg+xml;utf8,<svg fill='white' xmlns='http://www.w3.org/2000/svg' width='10' height='10'><polygon points='0,0 5,10 10,0'/></svg>");
            background-repeat: no-repeat;
            background-position: center;
            border-radius: 0 0 6px 6px;
        }
    `;
    document.head.appendChild(style);

    // FORCER l'application après le CSS tactile du resizableModalUtils.js dans la function makeModalDraggableAndResizable(modal, handle)
    // car le makeModalDraggableAndResizable rendait le scrollbar invisible
    setTimeout(() => {
        const forceStyle = document.createElement('style');
        forceStyle.textContent = `
            .show-person-list-modal div {
                scrollbar-width: unset !important;
            }
        `;
        document.head.appendChild(forceStyle);
    }, 0);


    list.style.border = '1px solid #eee';
    list.style.borderRadius = '4px';
    list.style.padding = '5px';
    

    // console.log('\n\n ------debug call to addElementToList from showPersonsList with showPersonListModalIndex=', showPersonListModalIndex,'\n\n');


    addElementToList(people, showPersonListModalIndex);

    console.log('\nStatistiques détaillées pour ', title.textContent )
    
    modal.appendChild(list);
    
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

    // overlay.onclick = () => {
    //     document.body.removeChild(modal);
    //     document.body.removeChild(overlay);
    // };
    

    // Ajouter un moyen de fermer la modale seulement avec le bouton de fermeture
    closeButton.onclick = () => {
        if (document.body.contains(modal)) document.body.removeChild(modal);
        if (document.body.contains(overlay)) document.body.removeChild(overlay);
    };

    // Ajout au DOM
    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    // Rendre la modale déplaçable et redimensionnable
    makeModalDraggableAndResizable(modal, header);

    // Ajuster la disposition pour le mode écran partagé si nécessaire
    adjustSplitScreenLayout(modal, true);

    makeModalInteractive(modal);

    window.addEventListener('resize',  debounce(() => {
        if(isModalVisible(modal.id)) {
            console.log('\n\n*** debug resize in showPersonsList in nameCloudInteractions for resizeModal \n\n');
            resizeModal(modal, true);
        }
    }, 150)); // Attend 150ms après le dernier resize

    resizeModal(modal, true)
}

export async function showHeatmapFromShowPersonList(showPersonListModalCounter) {
    
    // console.log('\n\n--- debug showHeatmapFromShowPersonList for people list modal counter=', showPersonListModalCounter);//, state.peopleList);

    let heatmapData;
    async function runCreateHeatmapDataForPeople() {
        const createHeatmapDataForPeople = await getCreateHeatmapDataForPeople();
        heatmapData = await createHeatmapDataForPeople(state.peopleList[showPersonListModalCounter]);
        // console.log(heatmapData);
    }
    // if (window.currentSearchResults && window.currentSearchResults.length > 0) {
    runCreateHeatmapDataForPeople().then(async () => {
        if (heatmapData ) {
            // Fermer la modale de recherche
            // closeSearchModal();

            // Ajouter un titre à la carte
            const confLocal = {};
            confLocal.type = 'placeOf';
            const title =  getPersonsListTitle(state.peopleListTitle[showPersonListModalCounter], 0 , confLocal) + ' ' + state.peopleListTitle[showPersonListModalCounter];
            console.log('-debug call to displayHeatMap from showHeatmapFromShowPersonList');
            const displayHeatMap = await getDisplayHeatMap();
            displayHeatMap(null, heatmapData, true, null, title, null, null, showPersonListModalCounter).then(() => {
                const allModals = document.querySelectorAll('[id^="show-person-list-modal-"]');
                let modal;
                if (allModals) { modal = allModals[allModals.length - 1]; }
                // Ajuster la disposition pour le mode écran partagé si nécessaire
                adjustSplitScreenLayout(modal, true);
            });
        } 
    })
}

/**
 * Affiche la heatmap et ajuste le layout pour l'écran partagé
 * @param {HTMLElement} modal - La modale de liste de personnes
 * @param {Object} config - La configuration actuelle
 * @returns {Promise<HTMLElement|null>} - Le wrapper de heatmap ou null en cas d'erreur
 */
async function showHeatmapAndAdjustLayout(modal, config, hiddenFormerFrenchTitle) {
    // Afficher un indicateur de chargement
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
    loadingIndicator.innerHTML = '<p>Génération de la heatmap...</p><progress style="width: 100%;"></progress>';
    document.body.appendChild(loadingIndicator);
    
    try {
        // Extraire le titre pour obtenir le texte de recherche
        const titleElement = modal.querySelector('h2');
        // const searchText1 = extractSearchTextFromTitle(titleElement);

        // Créer un élément h2 pour mettre l'ancien titre en français car le extractSearchTextFromTitle travaille sur le français alors que le titleElement = modal.querySelector('h2'); est en multilingue
        const h2Element = document.createElement('h2');
        h2Element.textContent = hiddenFormerFrenchTitle;
        const searchText = extractSearchTextFromTitle(h2Element);

        
        let heatmapData;
        const createDataForHeatMap = await getCreateDataForHeatMap();
        
        if (searchText) {
            // Utiliser les personnes déjà filtrées que nous avons dans la liste
            const filteredPeople = filterPeopleByText(searchText, config);
            
            if (filteredPeople && filteredPeople.length > 0) {
                console.log(`Création de la heatmap pour ${filteredPeople.length} personnes filtrées avec "${searchText}"`);
                
                // Utiliser la fonction qui crée des données de heatmap à partir de personnes spécifiques
                // Cette fonction existe déjà dans geoHeatMapDataProcessor.js sous le nom de updateHeatmapIfVisible
                const createHeatmapDataForPeople = await getCreateHeatmapDataForPeople();
                heatmapData = await createHeatmapDataForPeople(filteredPeople);
            } else {
                console.warn("Aucune personne filtrée trouvée pour", searchText);
                heatmapData = await createDataForHeatMap(config);
            }
        } else {
            // Fallback vers la méthode standard
            heatmapData = await createDataForHeatMap(config);
        }
        
        // Supprimer l'indicateur de chargement
        document.body.removeChild(loadingIndicator);
        
        if (!heatmapData || heatmapData.length === 0) {
            console.error("Aucune donnée géographique disponible");
            alert("Aucune donnée géographique disponible.");
            return null;
        }
        
        // Créer un titre pour la heatmap
        let heatmapTitle = "Heatmap";
        if (titleElement) {
            // Extraire un titre plus propre de l'élément de titre
            const titleText = titleElement.textContent;
            // const match = titleText.match(/^(Personnes.+?)\s*\(\d+\s*personnes\)$/);
            const patterns = {
                'fr': /^(Personnes.+?)\s*\(\d+\s*personnes\)$/,
                'en': /^(People.+?)\s*\(\d+\s*people\)$/,
                'es': /^(Personas.+?)\s*\(\d+\s*personas\)$/,
                'hu': /^(Személyek.+?)\s*\(\d+\s*személy\)$/
            };
            const currentLang = window.CURRENT_LANGUAGE || 'fr';
            const pattern = patterns[currentLang] || patterns['fr'];
            
            const match = titleText.match(pattern);
            if (match && match[1]) {
                heatmapTitle = `Heatmap - ${match[1]}`;
            } else {
                heatmapTitle = `Heatmap - ${titleText}`;
            }
        }
        
        // Utiliser la fonction existante pour créer la heatmap
        const createImprovedHeatmap = await getCreateImprovedHeatmap();
        createImprovedHeatmap(heatmapData, heatmapTitle);
        
        // Récupérer la référence à la heatmap nouvellement créée
        const heatmapWrapper = document.getElementById('namecloud-heatmap-wrapper');
        if (!heatmapWrapper) {
            console.error("La heatmap n'a pas été créée correctement");
            return null;
        }
        
        // Ajuster la disposition pour le mode écran partagé si nécessaire
        adjustSplitScreenLayout(modal);
        
        return heatmapWrapper;
    } catch (error) {
        console.error("Erreur lors de la création de la heatmap:", error);
        if (document.body.contains(loadingIndicator)) {
            document.body.removeChild(loadingIndicator);
        }
        alert("Erreur lors de la création de la carte: " + error.message);
        return null;
    }
}

/**
 * Ajuste la disposition en mode écran partagé pour la modale et la heatmap
 * @param {HTMLElement} modal - La modale de liste de personnes
 * @param {HTMLElement} heatmapWrapper - Le wrapper de la heatmap
 */
export function adjustSplitScreenLayout(modal, isFromSearchModal = false) {
    const heatmapWrapper = document.getElementById('namecloud-heatmap-wrapper');
    const allModals1 = document.querySelectorAll('[id^="frequency-stat-modal-"]');
    const allModals2 = document.querySelectorAll('[id^="show-person-list-modal-"]');
    const allModals3 = document.querySelectorAll('[id^="graph-stats-modal-"]');
    const allModals4 = document.querySelectorAll('[id^="century-stats-modal-"]');    
    const searchModalContent = document.querySelector('[class^="searchModal-content"]');


    function countVisible(modals) {
        return modals ? Array.from(modals).filter(m => getComputedStyle(m).display !== "none").length : 0;
    }

    const modalsLength = 
        countVisible(allModals1) +
        countVisible(allModals2) +
        countVisible(allModals3) +
        countVisible(allModals4) +
        ((searchModalContent && searchModalContent._isVisible) ? 1 : 0);

    // console.log("- Before Ajustement de la disposition en mode écran partagé, modalsLength=", searchModal,  searchModalContent, searchModal.offsetParent, searchModalContent.offsetParent,  (searchModal.offsetParent !== null), searchModal._isVisible);

    if (modalsLength > 1 || heatmapWrapper ) {

        console.log("- Ajustement de la disposition en mode écran partagé, modalsLength=", modalsLength, (searchModalContent) ? searchModalContent._isVisible : false);
        
        modal.setAttribute('data-splitscreen-mode', 'true');
        const isLandscape = window.innerWidth > window.innerHeight;
        
        // Sauvegarder le style original pour restauration ultérieure
        const originalHeatmapStyle = {
            top: (heatmapWrapper) ? heatmapWrapper.style.top : '60px',
            left: (heatmapWrapper) ? heatmapWrapper.style.left : '20px',
            width: (heatmapWrapper) ? heatmapWrapper.style.width : 'calc(100% - 40px)',
            height: (heatmapWrapper) ? heatmapWrapper.style.height : 'calc(100% - 100px)'
        };
        
        modal.dataset.originalHeatmapStyle = JSON.stringify(originalHeatmapStyle);
        
        const zIndexRef = modal.style.zIndex;
        let maxComputedHeight;
        let offsetTop = 35; //5;
        let offsetTopInit = offsetTop;
        let localHeight;
        let splitWidth = window.innerWidth ;
        let splitHeight = window.innerHeight - offsetTopInit;
        let splitHeightFull = window.innerHeight ;
        let commonWidth = Math.min(600, splitWidth - 10);  
        let widthToBeApplied = commonWidth;

        if (heatmapWrapper) { 
            if (isLandscape){
                splitWidth = window.innerWidth/2; 
                commonWidth = Math.min(400, splitWidth - 10);
            } else {
                splitHeight = window.innerHeight/2 - offsetTopInit;
                splitHeightFull = window.innerHeight/2;
            } 
        } 

        let headerHeight = 40.8 + 2.2;
        if (splitWidth < 439) { headerHeight = 63.2 + 10;}
        else if (splitWidth < 520) { headerHeight = 49.6 + 10;}


        let headerHeightSearchModal = 36 + 4 + 28 + 4 + 28 + 4 + 35.2 + 4 + 40 + 4 + 30.4 + 4;
        if (window.innerHeight < 500) { headerHeightSearchModal = headerHeightSearchModal - 32 - 10;}

        let firstLeft = 0;

        if (isLandscape && heatmapWrapper) {
            firstLeft = (splitWidth - commonWidth - 8); 
        } else { 
            firstLeft = (splitWidth - commonWidth)/2; 
        }

        function moveModal(modalItem) {
            modalItem.style.position = 'fixed';
            modalItem.style.left = firstLeft + 'px';
            widthToBeApplied = commonWidth;

            if (!heatmapWrapper) { 
                modalItem.style.left = firstLeft + 'px';
            }

            if (modalItem._nbElementInlist) {
                if (modalItem.className.includes('searchModal-content')) {
                    maxComputedHeight = headerHeightSearchModal + modalItem._nbElementInlist*35 + 5;
                    widthToBeApplied = commonWidth + 7;
                } else {
                    maxComputedHeight = headerHeight + modalItem._nbElementInlist*32.8 + 22 + 5;
                }
            } else {
                maxComputedHeight = modalItem.offsetHeight;
            }
            if (modalItem.id.includes('graph-stats-modal-')) { widthToBeApplied = commonWidth + 3; }
            if (modalItem.id.includes('century-stats-modal')) { widthToBeApplied = commonWidth - 12; }



            localHeight = Math.min( maxComputedHeight , (splitHeight/ modalsLength));

            // console.log('\n - debug moveModal: modalItem.id, = ', modalItem, ', _nbElementInlist=', modalItem._nbElementInlist,'maxComputedHeight= ', maxComputedHeight, ', modalsLength=', modalsLength, ', localHeight=', localHeight, ', Left=',modalItem.style.left, 'commonWidth=', commonWidth )


            if (heatmapWrapper && modalsLength === 1 ) {
                // pour centrer la modal en hauteur quand elle est seule
                if (isLandscape) { offsetTop = Math.max( offsetTopInit, (splitHeight - modalItem.offsetHeight)/2); }
                else { offsetTop = Math.max( offsetTopInit, (splitHeight - localHeight)/2); }

                // console.log(' - debug if (heatmapWrapper && modalsLength === 1 && ) offsetTop =', offsetTop, ', splitHeight=',splitHeight, ', offsetHeight=', modalItem.offsetHeight, 'localHeight=', localHeight, ', firstLeft=',firstLeft)
            }


            if (localHeight > (headerHeight + 33 + 22) ) {               
                if (maxComputedHeight < (splitHeight/ modalsLength) - 20 ) {
                    modalItem.style.height = 'auto';
                } else {
                    modalItem.style.height = `${localHeight}px` ; //'auto';
                }
                modalItem.style.top = `${offsetTop}px`;
                offsetTop = offsetTop + modalItem.offsetHeight; //localHeight;
                modalItem.style.width = `${widthToBeApplied}px`;
                modalItem.style.zIndex = zIndexRef;
                // console.log(' - debug ', modalItem.id,  ',  commonWidth =', commonWidth + 'px,  Height=', localHeight + 'px, offsetTop=',  offsetTop +'px, firstLeft=', firstLeft + 'px');
            }

            makeModalInteractive(modalItem);
        }

        if(isLandscape) {
            // Mode paysage : heatmap à gauche, liste à droite
            if (heatmapWrapper) {
                heatmapWrapper.style.top = '2px';
                heatmapWrapper.style.left = splitWidth + 'px'; //'0';
                heatmapWrapper.style.width = '50%';
                heatmapWrapper.style.height = '99%'; 
            }
        } else {
            // Mode portrait : heatmap en haut, liste en bas
            const mapHeight = '49%'; 
            if (heatmapWrapper) {
                // Ajuster la heatmap
                heatmapWrapper.style.width = '100%';
                heatmapWrapper.style.height = mapHeight;
                heatmapWrapper.style.left = '0';
                heatmapWrapper.style.top = splitHeightFull + 3 + 'px'; //'1%'; 
            }
        }        
        if (modal) {
            // console.log('\n - debug adjustSplitScreenLayout: modal.id., allModals1, allModals2, modalsLength = ', modal.id, allModals1, allModals2, modalsLength, ', allModals2.length=', allModals2.length)
            if (modalsLength > 1 || heatmapWrapper ) {
                if (allModals1) {
                    allModals1.forEach(modalItem => {
                        if (getComputedStyle(modalItem).display !== "none") { moveModal(modalItem); }
                        if (modalItem.id.includes('frequency-stat-modal-') && (allModals3) ) { 
                            const idNum = modalItem.id.replace("frequency-stat-modal-", "");
                            const graphModalItem = document.querySelector(`[id="graph-stats-modal-${idNum}"]`);
                            // console.log('   -> also move associated graph modal for ', modalItem.id, idNum, graphModalItem);
                            if (graphModalItem) { 
                                moveModal(graphModalItem);
                                graphModalItem.isAlreadyDisplayed = true;
                            }
                        }
                    }); 
                }
                if (allModals2) {
                    allModals2.forEach(modalItem => {
                        if (getComputedStyle(modalItem).display !== "none") { moveModal(modalItem); }
                    }); 
                }
                if (allModals3) {
                    allModals3.forEach(modalItem => {
                        if (!modalItem.isAlreadyDisplayed && (getComputedStyle(modalItem).display !== "none")) { moveModal(modalItem);}
                    }); 
                }
                if (allModals4) {
                    allModals4.forEach(modalItem => {
                        if (getComputedStyle(modalItem).display !== "none") { moveModal(modalItem); }
                    }); 
                }
                if (searchModalContent && (searchModalContent._isVisible)) {
                    moveModal(searchModalContent);
                }
            }
        }         

        // Attendre que le DOM soit complètement mis à jour avant d'invalider la taille
        setTimeout(() => {
            if (heatmapWrapper && heatmapWrapper.map) {
                // Vérifier que la carte a des dimensions non nulles
                const mapContainer = heatmapWrapper.querySelector('#ancestors-heatmap');
                if (mapContainer && mapContainer.offsetWidth > 0 && mapContainer.offsetHeight > 0) {
                    try {
                        // Forcer un recalcul du style avant d'invalider la taille
                        void mapContainer.offsetHeight;
                        // Désactiver l'animation pendant l'invalidation
                        heatmapWrapper.map.invalidateSize({
                            animate: false,
                            pan: false
                        });
                        console.log("Carte redimensionnée avec succès");
                    } catch (error) {
                        console.error("Erreur lors de l'invalidation de la taille de la carte:", error);
                    }
                } else {
                    console.warn("Le conteneur de carte a des dimensions nulles, invalidation ignorée");
                }
            }
        }, 300); // Augmenter le délai à 300ms pour plus de sécurité
    }
}

export function showPersonActions(person, event) {
    console.log('Showing actions for:', person.name, person.id);

    // Supprimer tout menu contextuel existant
    const existingMenu = document.getElementById('person-actions-menu');
    if (existingMenu) {
        existingMenu.remove();
    }

    const actionsMenu = document.createElement('div');
    actionsMenu.id = 'person-actions-menu';
    actionsMenu.style.position = 'fixed';
    actionsMenu.style.left = `${event.clientX}px`;
    actionsMenu.style.top = `${event.clientY}px`;
    actionsMenu.style.backgroundColor = 'white';
    actionsMenu.style.border = '1px solid #ccc';
    actionsMenu.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    actionsMenu.style.zIndex = '10000';



    const confLocal1 = {}; const confLocal2 = {}; const confLocal3 = {};
    confLocal1.type = 'seeInTree'; confLocal2.type = 'seeDetails'; confLocal3.type = 'animation';
        const actions = [
        { text: getPersonsListTitle('', 0, confLocal1), action: () => { closeCloudName(); showInTree(person.id)} },
        { text: getPersonsListTitle('', 0, confLocal2), action: () => showPersonDetails(person.id) },
        { text: getPersonsListTitle('', 0, confLocal3), action: () => { closeCloudName();startAnimation(person.id)} }
    ];

    actions.forEach(action => {
        const actionButton = document.createElement('button');
        actionButton.textContent = action.text;
        actionButton.style.display = 'block';
        actionButton.style.width = '100%';
        actionButton.style.padding = '5px 10px';
        actionButton.style.border = 'none';
        actionButton.style.backgroundColor = 'transparent';
        actionButton.style.textAlign = 'left';
        actionButton.style.cursor = 'pointer';

        actionButton.addEventListener('mouseenter', () => {
            actionButton.style.backgroundColor = '#f0f0f0';
        });

        actionButton.addEventListener('mouseleave', () => {
            actionButton.style.backgroundColor = 'transparent';
        });

        actionButton.addEventListener('click', (e) => {
            e.stopPropagation();
            actionsMenu.remove();
            action.action();
        });

        actionsMenu.appendChild(actionButton);
    });

    document.body.appendChild(actionsMenu);

    // Fermer le menu si on clique ailleurs
    document.addEventListener('click', function closeMenu(e) {
        const menu = document.getElementById('person-actions-menu');
        if (menu && !menu.contains(e.target)) {
            if (menu.parentNode) {
                menu.parentNode.removeChild(menu);
            }
            document.removeEventListener('click', closeMenu);
        }
    });
}

export async function showPersonDetails(personId) {
    console.log('Showing details for:', personId);

    if (typeof removeAllStatsElements === 'function') {
        removeAllStatsElements();
    }

    
    const displayPersonDetails = await getDisplayPersonDetails();
    displayPersonDetails(personId);

    const modal = document.querySelector('.modal-container');
    if (modal) {
        modal.remove();
    }
}

export function startAnimation(personId) {
    state.rootPersonId = personId;
    console.log('Starting animation with:', personId);

    if (typeof removeAllStatsElements === 'function') {
        removeAllStatsElements();
    }

    startAncestorAnimation();

    const modal = document.querySelector('.modal-container');
    if (modal) {
        modal.remove();
    }
}

export function showInTree(personId) {
    state.rootPersonId = personId;
    state.treeMode = 'ancestors';
    console.log('Showing in tree:', personId);
    

    if (typeof removeAllStatsElements === 'function') {
        removeAllStatsElements();
    }

    // Vous devrez importer ou définir cette fonction
    import('./treeRenderer.js').then(module => {
        module.drawTree();
    });

    const modal = document.querySelector('.modal-container');
    if (modal) {
        modal.remove();
    }
}

(function initializeGlobalListeners() {
    document.addEventListener('cloudMapRefreshed', (event) => {
        // console.log('CloudMap rafraîchie', event.detail);
        
        const refreshListEvent = new CustomEvent('refreshPersonList', {
            detail: {
                config: event.detail.config,
                timestamp: Date.now()
            }
        });
        document.dispatchEvent(refreshListEvent);
    });
})();