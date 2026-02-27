// ====================================
// Gestionnaires d'événements
// ====================================
// import { getZoom, getLastTransform } from './treeRenderer.js';
import { importLinks } from './importState.js'; // import de treeRenderer, treeAnimation, mainUI, utils via importLinks pour éviter les erreurs de chargement circulaire

import { state, displayGenealogicTree, hideMap, positionFormContainer, toggleFullScreen, getCachedImageURL, redimensionnerPlayButtonSizeInDOM } from './main.js';
// import { setupElegantBackground, enableBackground } from './backgroundManager.js';
import { getSetupElegantBackground, getEnableBackground } from './main.js';
// import { findPersonsByName } from './utils.js';
// import { hideHamburgerMenu, resizeHamburger } from './hamburgerMenu.js';
import { getHideHamburgerMenu, getResizeHamburger } from './main.js';
// import { animationState, stopAnimation, initializeAnimationMapPosition, updateAnimationMapSize} from './treeAnimation.js';
// import { repositionAudioPlayerOnResize } from './audioPlayer.js'
import { getRepositionAudioPlayerOnResize, getGenerateNameCloudExport } from './main.js'
// import { setMaxGenerations, removeSpinningImage } from './treeWheelRenderer.js'
import { getSetMaxGenerations, getRemoveSpinningImage } from './main.js'
// import { disableFortuneModeWithLever, disableFortuneModeClean } from './treeWheelAnimation.js'
import { getDisableFortuneModeWithLever, getDisableFortuneModeClean } from './main.js'
// import { calculateFullTreeDimensions } from './exportManager.js';
// import { generateNameCloudExport } from './nameCloudUI.js';
// import { refreshHeatmap } from './geoHeatMapDataProcessor.js';
import { getRefreshHeatmap } from './main.js';
// import { closeVoiceCommand } from './voiceSelect.js';
const getCalculateFullTreeDimensions = async () => {
    const { calculateFullTreeDimensions } = await import('./exportManager.js');
    return calculateFullTreeDimensions;
};
const isProduction = window.location.pathname.includes('/obfusc/');
const BACKGROUND_IMAGES_PATH = isProduction ? '../background_images/' : 'background_images/';

/** function to reduce to call with 'resize' events*  */
export function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout); // Annule le timer précédent
        timeout = setTimeout(() => func(...args), wait); // Nouveau timer
    };
}

/** function to verify if a modal is visible *  */
export function isModalVisible(modalId) {
    const modal = document.getElementById(modalId);
    return modal && modal.style.display !== 'none'; // && modal.offsetParent !== null;
}

/**
 * Initialise les gestionnaires d'événements globaux
 */
export function initializeEventHandlers() {

    window.addEventListener('resize', debounce(async () => {
        if (!state.isWordCloudEnabled) {
            const resizeHamburger = await getResizeHamburger();
            resizeHamburger();
            handleWindowResize();
        }
    }, 150)); // Attend 150ms après le dernier resize

    document.getElementById("root-person-search")
        .addEventListener("keydown", handleSearchKeydown);
    
    document.getElementById('root-person-results')
        .addEventListener('change', selectRootPerson);

    // initializeHeatmapHandlers();
}

// export function initializeHeatmapHandlers() {
    
//     const completeButton = document.querySelector('[data-heatmap="complete"]');
//     const ancestorsButton = document.querySelector('[data-heatmap="ancestors"]');
//     const descendantsButton = document.querySelector('[data-heatmap="descendants"]');

//     completeButton?.addEventListener('click', () => createAncestorsHeatMap({ type: 'all' }));
//     ancestorsButton?.addEventListener('click', () => createAncestorsHeatMap({ type: 'ancestors' }));
//     descendantsButton?.addEventListener('click', () => createAncestorsHeatMap({ type: 'descendants' }));
// }

/**
 * Gère le redimensionnement de la fenêtre
 */
export async function handleWindowResize() {
    const closeButton = document.getElementById('close-tree-button');
    if (!state.isSamsungBrowser) { state.innerWidth = window.innerWidth*state.browserScaleFactor; }
    else { state.innerWidth = window.innerWidth;}

    if (state.isButtonOnDisplay) {
        if (state.innerWidth < 400) {
            if (state.isMobile) { closeButton.style.setProperty('top', '4.2em', 'important');}
            else { closeButton.style.setProperty('top', '4.8em', 'important');}
            closeButton.style.setProperty('right', '1em', 'important');
        } else {
            closeButton.style.setProperty('top', '1em', 'important');
            closeButton.style.setProperty('right', '1em', 'important'); 
        }
    } else {
        closeButton.style.setProperty('top', '1em', 'important');
        closeButton.style.setProperty('right', '1em', 'important');        
    }

    if (typeof d3 !== 'undefined') {

        d3.select("#tree-svg")
            .attr("width", window.innerWidth)
            .attr("height", window.innerHeight);
            
        const svg = d3.select("#tree-svg");
        const setupElegantBackground = await getSetupElegantBackground();
        setupElegantBackground(svg);
        importLinks.treeAnimation.initializeAnimationMapPosition();
        importLinks.treeAnimation.updateAnimationMapSize();
        // resizeHamburger();
        const repositionAudioPlayerOnResize = await getRepositionAudioPlayerOnResize();
        repositionAudioPlayerOnResize();

        state.screenResizeHasOccured = true;
        state.previousWindowInnerWidth = state.lastWindowInnerWidth;
        state.previousWindowInnerHeight = state.lastWindowInnerHeight;
        state.lastWindowInnerWidth = window.innerWidth;
        state.lastWindowInnerHeight = window.innerHeight;
        console.log("\n\n\n *** debug on resize :  Redimensionnement de la fenêtre ARBRE , sizes = ", state.lastWindowInnerWidth, state.lastWindowInnerHeight, "previous : ", state.previousWindowInnerWidth, state.previousWindowInnerHeight, state.screenResizeHasOccured,  '########\n\n\n');
    }
}

/**
 * Gère les clics sur la modale
 */
// export function handleModalClick(event) {
//     const modal = document.getElementById('person-details-modal');
//     if (event.target === modal) {
//         modal.style.display = 'none';
//     }
// }

/**
 * Gère les touches du clavier pour la recherche
 */
export function handleSearchKeydown(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        searchRootPerson(event);
    }
}

/**
  * Affiche les résultats de recherche
  * @private
  */
function displaySearchResults(matchedPersons, resultsSelect) {
    if (resultsSelect.tagName === 'SELECT') {
        // Sélecteur standard
        matchedPersons.forEach(person => {
            const option = document.createElement('option');
            option.value = person.id;
            option.textContent = person.name.replace(/\//g, '').trim();
            resultsSelect.appendChild(option);
        });
    } else {
        // Sélecteur personnalisé - utiliser sa méthode spécifique de mise à jour
        // Cette partie dépend de la façon dont votre sélecteur personnalisé gère les options
        // Exemple simplifié:
        const options = matchedPersons.map(person => ({
            value: person.id,
            label: person.name.replace(/\//g, '').trim()
        }));
        
        // Si vous avez une méthode pour mettre à jour les options
        if (typeof resultsSelect.updateOptions === 'function') {
            resultsSelect.updateOptions(options);
        } else {
            // Sinon, essayez de recréer un nouveau sélecteur avec ces options
            // import('./mainUI.js').then(module => {
            //     if (typeof module.replaceRootPersonSelector === 'function') {
            //         module.replaceRootPersonSelector(options);
            //     }
            // });
            importLinks.mainUI.replaceRootPersonSelector(options);
        }
    }
    
    resultsSelect.style.display = 'block';
    resultsSelect.style.animation = 'findResults 1s infinite';
    resultsSelect.style.backgroundColor = 'yellow';
}

/**
 * Sélectionne une nouvelle personne racine
 */
export function selectRootPerson() {
    const resultsSelect = document.getElementById('root-person-results');
    const selectedPersonId = resultsSelect.value;

    if (resultsSelect && !state.isButtonOnDisplay) {resultsSelect.style.visibility = 'hidden';}

    if (selectedPersonId) {
        // Désactiver le clignotement
        if (typeof resultsSelect.setBlinking === 'function') {
            resultsSelect.setBlinking(false);
        } else {
            resultsSelect.style.animation = 'none';
            // resultsSelect.style.backgroundColor = 'orange';
        }

        state.rootPersonId = selectedPersonId;
        console.log('\n\n\n\n ###################   CALL displayGenealogicTree in selectRootPerson ################# ')
        if (resultsSelect && !state.isButtonOnDisplay) {resultsSelect.style.visibility = 'hidden';}

        displayGenealogicTree(selectedPersonId, true);

        if (resultsSelect && !state.isButtonOnDisplay) {resultsSelect.style.visibility = 'hidden';}  

        resultsSelect.style.display = 'block';
    }
}

//  fonction searchRootPerson pour utiliser findPersonsByName :
export function searchRootPerson(event) {
    const searchInput = document.getElementById('root-person-search');
    const resultsSelect = document.getElementById('root-person-results');
    const searchStr = searchInput.value.toLowerCase();

    if (!searchStr) return;

    // Utiliser la nouvelle fonction findPersonsByName
    const matchedPersons = findPersonsByName(searchStr);

    if (matchedPersons.length > 0) {
        // Convertir les personnes trouvées au format d'options pour le sélecteur personnalisé
        const options = matchedPersons.map(person => ({
            value: person.id,
            label: person.name.replace(/\//g, '').trim()
        }));
        
        // Ajouter l'option "Select" en première position
        options.unshift({
            value: "",
            label: "Select"
        });
        
        // Si nous avons un sélecteur personnalisé, utiliser replaceRootPersonSelector
        // import('./mainUI.js').then(module => {
        //     if (typeof module.replaceRootPersonSelector === 'function') {
        //         const newSelector = module.replaceRootPersonSelector(options);
        //         if (newSelector) {
        //             // Forcer l'affichage de "Select" comme texte affiché
        //             module.updateSelectorDisplayText(newSelector, "Select");
                    
        //             if (typeof newSelector.setBlinking === 'function') {
        //                 newSelector.setBlinking(true);
        //             }
        //         }
        //     }
        // });
        const newSelector = importLinks.mainUI.replaceRootPersonSelector(options);
        if (newSelector) {
            // Forcer l'affichage de "Select" comme texte affiché
            importLinks.mainUI.updateSelectorDisplayText(newSelector, "Select");
            
            if (typeof newSelector.setBlinking === 'function') {
                newSelector.setBlinking(true);
            }
        }


    } else {
        alert('Aucune personne trouvée');
    }
}

// Fonction améliorée pour la sélection d'une personne trouvée
export async function selectFoundPerson(personId) {
    if (!personId) return;
    
    const resultsSelect = document.getElementById('root-person-results');
    
    // Désactiver le clignotement s'il existe
    if (resultsSelect) {
        if (typeof resultsSelect.setBlinking === 'function') {
            resultsSelect.setBlinking(false);
        } else {
            resultsSelect.style.animation = 'none';
            // resultsSelect.style.backgroundColor = 'orange';
        }
    }
    
    if (resultsSelect && !state.isButtonOnDisplay) {resultsSelect.style.visibility = 'hidden';}
    
    // Afficher la personne comme racine
    console.log('\n\n\n\n ###################   CALL displayGenealogicTree in searchRootPerson ################# ')
    // displayGenealogicTree(personId, true);
    // if (state.isRadarEnabled) {
    //     displayGenealogicTree(personId, false, false,  false, 'WheelAncestors');
    // } else {
    //     displayGenealogicTree(personId, true, false);
    // }

    if (state.isRadarEnabled) {
        displayGenealogicTree(personId, false, false,  false, 'WheelAncestors');
    } else if (state.isWordCloudEnabled) {
        state.rootPersonId = personId;
        state.rootPerson = state.gedcomData.individuals[personId];
        const generateNameCloudExport = await getGenerateNameCloudExport();
        generateNameCloudExport();
        // Vérifier si une heatmap est déjà affichée
        if (document.getElementById('namecloud-heatmap-wrapper')) {
            // Si oui, la rafraîchir plutôt que d'en créer une nouvelle
            const refreshHeatmap = await getRefreshHeatmap();
            refreshHeatmap();
        }
    } else {
        displayGenealogicTree(personId, true, false);
    }


    
    // Attendre que l'arbre soit affiché et que l'historique soit mis à jour
    setTimeout(() => {
        // Forcer une recréation complète du sélecteur en mode historique
        // plutôt que d'essayer de mettre à jour celui existant
        // import('./mainUI.js').then(module => {
        //     if (typeof module.replaceRootPersonSelector === 'function') {
        //         // Recréer le sélecteur avec l'historique mis à jour
        //         const newSelector = module.replaceRootPersonSelector();
                
        //         // S'assurer que la personne sélectionnée est choisie comme valeur courante
        //         if (newSelector) {
        //             // Rechercher la personne dans l'historique mis à jour
        //             const rootHistory = JSON.parse(localStorage.getItem('rootPersonHistory') || '[]');
        //             const selectedPerson = rootHistory.find(entry => entry.id === personId);
                    
        //             if (selectedPerson) {
        //                 // Définir la valeur sélectionnée
        //                 newSelector.value = personId;
                        
        //                 // Mettre à jour l'affichage avec le nom tronqué
        //                 module.updateSelectorDisplayText(newSelector, selectedPerson.name);
        //             }
        //         }
        //     }
        // });


        // Recréer le sélecteur avec l'historique mis à jour
        const newSelector = importLinks.mainUI.replaceRootPersonSelector();
        
        // S'assurer que la personne sélectionnée est choisie comme valeur courante
        if (newSelector) {
            // Rechercher la personne dans l'historique mis à jour
            const rootHistory = JSON.parse(localStorage.getItem('rootPersonHistory') || '[]');
            const selectedPerson = rootHistory.find(entry => entry.id === personId);
            
            if (selectedPerson) {
                // Définir la valeur sélectionnée
                newSelector.value = personId;
                
                // Mettre à jour l'affichage avec le nom tronqué
                importLinks.mainUI.updateSelectorDisplayText(newSelector, selectedPerson.name);
            }
        }


    }, 200); // Augmenter le délai pour s'assurer que tout est bien synchronisé
}

/**
 * Gère les mises à jour du nombre de prénoms
 */
export function updatePrenoms(value) {
    state.nombre_prenoms = parseInt(value);
    localStorage.setItem('nombre_prenoms', value);
    displayGenealogicTree(null, false, false);
}

/**
 * Gère les mises à jour du nombre de mots dans les noms
 */
export function updateLettersInNames(value) {
    state.nombre_lettersInNames = parseInt(value)-1;
    displayGenealogicTree(null, false, false);
}

/**
 * Gère les mises à jour du nombre de générations
 */
export async function updateGenerations(value) {
    state.nombre_generation = parseInt(value);
    if (state.isRadarEnabled) {
        const setMaxGenerations = await getSetMaxGenerations();
        setMaxGenerations(state.nombre_generation);
    } else {
        displayGenealogicTree(null, true, false);
    }
}

/**
 * Gère le zoom avant
 */
export function zoomIn() {
    const svg = d3.select("#tree-svg");
    const zoom = importLinks.treeRenderer.getZoom();
    if (zoom) {
        svg.transition()
            .duration(750)
            .call(zoom.scaleBy, 1.2);
    }
}

/**
 * Gère le zoom arrière
 */
export function zoomOut() {
    const svg = d3.select("#tree-svg");
    const zoom = importLinks.treeRenderer.getZoom();
    if (zoom) {
        svg.transition()
            .duration(750)
            .call(zoom.scaleBy, 0.8);
    }
}

/**
 * Réinitialise la vue de l'arbre à sa position par défaut selon le mode
 * En mode ascendant : arbre aligné à gauche
 * En mode descendant : arbre aligné à droite
 * @export
 */
export function resetView() {
    const svg = d3.select("#tree-svg");
    const height = window.innerHeight;
    const zoom = importLinks.treeRenderer.getZoom();

    state.isAnimationLaunched = false;
    
    if (zoom) {
        let transform = d3.zoomIdentity;
        if (state.treeMode === 'descendants' || state.treeMode === 'directDescendants') {
            // Pour les descendants, commencer du côté droit
            transform = transform.translate(window.innerWidth - state.boxWidth * 2, height / 2);
        } else {
            // Pour les ascendants, commencer du côté gauche
            // transform = transform.translate(state.boxWidth, height / 2);
            transform = transform.translate(state.boxWidth/2 + 8, height / 2);

        }
        transform = transform.scale(0.8);

        svg.transition()
            .duration(750)
            .call(zoom.transform, transform);
    }
}

export async function resetViewZoomBeforeExport() {
    const svg = d3.select("#tree-svg");
    const height = window.innerHeight;
    const zoom = importLinks.treeRenderer.getZoom();

    state.isAnimationLaunched = false;
    
    if (zoom) {

        // Récupérer la transformation actuelle
        const currentTransform = importLinks.treeRenderer.getLastTransform() || d3.zoomIdentity;
        
        // Extraire le scale et la position Y actuels
        state.currentScale = currentTransform.k;
        state.currentX = currentTransform.x;
        state.currentY = currentTransform.y;



        let transform = d3.zoomIdentity;
        if (state.treeMode === 'descendants' || state.treeMode === 'directDescendants') {
            // Pour les descendants, commencer du côté droit
            transform = transform.translate(window.innerWidth - state.boxWidth * 2, height / 2);
        } else {
            // Pour les ascendants, commencer du côté gauche
            transform = transform.translate(state.boxWidth, height / 2);
        }
        transform = transform.scale(0.97);

        // enableBackground(false);
        if (state.backgroundEnabled) {
            const svgForExport = document.querySelector('#tree-svg');
            const calculateFullTreeDimensions = await getCalculateFullTreeDimensions();
            const fullDimensions = calculateFullTreeDimensions(svgForExport);
            console.log( "new dimension pour the background with png export", fullDimensions)
            const setupElegantBackground = await getSetupElegantBackground();
            setupElegantBackground(svg, fullDimensions, true);
        }

        svg.transition()
            .duration(750)
            .call(zoom.transform, transform);
    }
}

export async function resetViewZoomAfterExport() {
    const svg = d3.select("#tree-svg");
    const height = window.innerHeight;
    const zoom = importLinks.treeRenderer.getZoom();

    state.isAnimationLaunched = false;
    
    if (zoom) {

        // Récupérer la transformation actuelle
        let transform = d3.zoomIdentity;
        transform = transform.translate(state.currentX, state.currentY).scale(state.currentScale);

        if (state.backgroundEnabled) {
            const enableBackground = await getEnableBackground();
            enableBackground(true);
        }

        svg.transition()
            .duration(750)
            .call(zoom.transform, transform);
    }
}

/**
 * Réinitialise le niveau de zoom et la position de l'arbre
 * à leurs valeurs par défaut selon le mode d'affichage
 * Utilise une transition animée pour un retour fluide à la vue initiale
 * @export
 */
export function resetZoom() {
    // Arrêter l'animation en cours, si présente
    importLinks.treeAnimation.stopAnimation();
    
    // Réinitialiser la vue
    resetView();
    
    // Masquer la carte
    hideMap();
    
    // Supprimer l'image de fond
    const loginBackground = document.querySelector('.login-background');
    if (loginBackground) {
        loginBackground.remove();
    }
    
    // // Supprimer également tout autre conteneur de fond d'écran existant
    // const existingBackgroundContainer = document.querySelector('.background-container');
    // if (existingBackgroundContainer) {
    //     existingBackgroundContainer.remove();
    // }
    
    // S'assurer que le body a la classe indiquant qu'on est en mode arbre
    document.body.classList.add('tree-view');
}

/**
 * Recherche dans l'arbre
 */
export function searchTree(str) {
    d3.selectAll('.person-box').classed('search-highlight', false);
    
    if (!str) {
        if (!state.rootPersonId) {
            resetZoom();
        }
        return;
    }
    
    const searchStr = str.toLowerCase();
    const matchedNodes = findMatchingNodes(searchStr);
    
    if (matchedNodes.length > 0) {
        highlightAndZoomToNode(matchedNodes[0]);
    }
}

/**
 * Trouve les nœuds correspondant à la recherche
 * @private
 */
function findMatchingNodes(searchStr) {
    const matchedNodes = [];
    
    d3.selectAll('.node').each(function(d) {
        const name = d.data.name.toLowerCase().replace(/\//g, '');
        if (name.includes(searchStr)) {
            matchedNodes.push({node: d, element: this});
            d3.select(this).select('.person-box').classed('search-highlight', true);
        }
    });
    
    return matchedNodes;
}

/**
 * Met en surbrillance et zoome sur un nœud
 * @private
 */
function highlightAndZoomToNode(matchedNode) {
    const svg = d3.select("#tree-svg");
    const nodeElement = d3.select(matchedNode.element);
    const nodeTransform = nodeElement.attr('transform');
    
    const transformMatch = nodeTransform.match(/translate\(([^,]+),([^)]+)\)/);
    if (transformMatch) {
        const x = parseFloat(transformMatch[1]);
        const y = parseFloat(transformMatch[2]);

        svg.transition()
            .duration(750)
            .call(importLinks.treeRenderer.getZoom().transform, 
                d3.zoomIdentity
                    .translate(window.innerWidth/2 - x, window.innerHeight/2 - y)
                    .scale(1)
            );
    }
}

export async function closeAllModals(isCloseAnimationmap = true, isCloseHeatMapWrapper = true) {
    // on récupère toutes les modales ouvertes
    const modals = document.querySelectorAll('[id="search-modal"], [class*="searchModal-content"], [id="stats-modal"], [id*="show-person-list-modal"], [id*="frequency-stat-modal"], [id*="graph-stats-modal"], [id*="century-stats-modal"], [id*="person-fullDetails-modal"], [id*="stt-only-overlay"]');
    const voiceSelectModule = await import('./voiceSelect.js');
    const closeVoiceCommand = voiceSelectModule.closeVoiceCommand;
    closeVoiceCommand();
    if (state.isMobile && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel(); 
    } 
    // const modals = document.querySelectorAll('div[id*="stats-modal"], div[id*="search-modal"], div[id*="show-person-list-modal"], div[id*="frequency-stat-modal"], div[id*="graph-stats-modal"], div[id*="century-stats-modal"], div[id*="person-details-modal"]'); 

   //[class*="searchModal-content"]


    let modal;
    let content;
    modal = document.querySelector('[id="search-modal"]');
    if (modal) {
        content = modal.querySelector('.searchModal-content');
        if (content) {
            if (content._cleanupDraggable) {
                content._cleanupDraggable();
            }
        }
    }

    modal = document.querySelector('[id="stats-modal"]');
    if (modal) {
        content = modal.querySelector('.statsModal-content');
        if (content) {
            if (content._cleanupDraggable) {
                content._cleanupDraggable();
            }
        }
    }



    const modals_freq = document.querySelectorAll('[id*="frequency-stat-modal"]');
    // content = modal.querySelector('.statsModal-content');
    modals_freq.forEach(modal => {
        if (modal) {
            if (modal._cleanupDraggable) {
                modal._cleanupDraggable();
            }
        }
    });


    if (isCloseHeatMapWrapper) {
        const heatMapWrapper = document.getElementById('namecloud-heatmap-wrapper');
        if (heatMapWrapper) {
            heatMapWrapper.remove();
            console.log('-debug closeAllModals remove heatMapWrapper', document.getElementById('namecloud-heatmap-wrapper'));

        }
    }

    if (isCloseAnimationmap) {
        const wrapper = document.getElementById('animation-map-container');
        if (wrapper) {
            wrapper.style.display = "none";
        }
    }



    // on les supprime du DOM
    modals.forEach(modal => {

        if (modal.className.includes('searchModal-content')) {
            modal._isVisible = false
            // modal.style.display = "none";
        }
        else {

            if (modal.dataset.dynamic === "true") {
                // créées par JS → on peut les supprimer

                if (modal._cleanupDraggable) {
                    modal._cleanupDraggable();
                }
                modal.remove();
            } else {
                // cas des modals crée dans les html : on ne peut pas les détruire !!!
                if (modal._cleanupDraggable) {
                    modal._cleanupDraggable();
                }
                // définies dans le HTML → on les cache
                modal.style.display = "none";
            }

        }
    });

    state.frequencyStatsModalCounter = 0;
    state.showPersonListModalCounter = 0;
    state.graphStatsModalCounter = 0;
    state.centuryStatsModalCounter = 0; 
}

export async function returnToLogin() {
    // Masquer l'arbre
    document.getElementById('tree-container').style.display = 'none';


    // remettre l'écran d'accueil en mode scroll vertical avec une taille d'écran plus grande pour autoriser le swipe vers le haut et faire disparaitre le bandeau du browser
    document.body.style.height = `${window.innerHeight + window.innerHeight*0.2}px`; // on met 120% de hauteur d'écran !
    document.body.style.overflow = '';
    
    // Masquer le menu hamburger
    const hideHamburgerMenu = await getHideHamburgerMenu();
    hideHamburgerMenu();
    
    // Afficher le formulaire de mot de passe
    document.getElementById('password-form').style.display = 'flex';
    
    // Réafficher le bouton des paramètres de la page d'accueil
    const settingsButton = document.getElementById('load-gedcom-button');
    if (settingsButton) {
        settingsButton.style.display = 'block';
    }


    const helpButton = document.getElementById('help-button');
    if (helpButton) {
        helpButton.style.display = 'block';
    }
    
    // Réinitialiser le champ de mot de passe
    // document.getElementById('password').value = '';
    
    // Réinitialiser rootPersonId dans l'objet state
    state.rootPersonId = null;
    state.rootPerson = null;
    // Réinitialiser d'autres propriétés si nécessaire
    state.isAnimationLaunched = false;
    state.isFullResetAnimationRequested = true;
    importLinks.treeAnimation.stopAnimation();

    importLinks.treeAnimation.animationState.isPaused = true;
    const animationPauseBtn = document.getElementById('animationPauseBtn');
    // Mettre à jour le bouton
    // animationPauseBtn.querySelector('span').textContent = '▶️';
    animationPauseBtn.querySelector('span').textContent = '▶';
    redimensionnerPlayButtonSizeInDOM();

    // Masquer la carte
    hideMap();

    state.isRadarEnabled = false;
    const  disableFortuneModeWithLever = await getDisableFortuneModeWithLever();
    disableFortuneModeWithLever();
    state.isRadarEnabled = false;
    state.treeMode = 'ancestors';
    state.treeModeReal = 'ancestors';
    const removeSpinningImage = await getRemoveSpinningImage();
    removeSpinningImage();

    const  disableFortuneModeClean = await getDisableFortuneModeClean();
    disableFortuneModeClean();

    // Supprimer également tout autre conteneur de fond d'écran existant
    const existingBackgroundContainer = document.querySelector('.background-container');
    if (existingBackgroundContainer) {
        existingBackgroundContainer.remove();
    }

    closeAllModals();

    // updateRadarButtonText();
    
    // Restaurer le fond d'écran de connexion s'il a été supprimé
    const loginBackground = document.querySelector('.login-background');
    if (!loginBackground) {
        const newLoginBackground = document.createElement('div');
        newLoginBackground.className = 'login-background';
        const backgroundImage = document.createElement('img');
        backgroundImage.className = 'login-background-image';
        backgroundImage.alt = 'Fond d\'écran';
        newLoginBackground.appendChild(backgroundImage);
        document.body.insertBefore(newLoginBackground, document.body.firstChild);

        // Utilisation du cache pour l'image Low Quality initiale
        (async () => {
            try {
                const lowResPath = `${BACKGROUND_IMAGES_PATH}tree-log-lowQuality.jpg`;
                backgroundImage.src = await getCachedImageURL(lowResPath);
            } catch (error) {
                console.error("Erreur lors du chargement de l'image de fond:", error);
                backgroundImage.src = `${BACKGROUND_IMAGES_PATH}tree-log-lowQuality.jpg`;
            }
        })();
    }

    // Quitter le mode plein écran si actif
    toggleFullScreen('exitfullScreenRequired');


    state.isTreeEnabled = false;
    state.isWordCloudEnabled = false;
    
    positionFormContainer();

    const secretTargetArea = document.getElementById('secret-trigger-area');
    secretTargetArea.style.display = '';

    // Mise à jour de l'image créée dynamiquement vers la HD
    if (window.innerWidth > 512 || window.innerHeight > 512) {
        setTimeout(async () => {
            const imgElement = document.querySelector('.login-background-image');
            if (imgElement) {
                let targetPath = (window.innerWidth > 800 || window.innerHeight > 800) 
                    // ? 'background_images/tree-log.jpg' 
                    ? `${BACKGROUND_IMAGES_PATH}tree-log.webp` 
                    : `${BACKGROUND_IMAGES_PATH}tree-log-mediumQuality.jpg`;
                
                imgElement.src = await getCachedImageURL(targetPath);
            }
        }, 50);
    }

}

window.returnToLogin = returnToLogin;

// Fonction pour masquer le fond d'écran de connexion
export function hideLoginBackground() {
    const loginBackground = document.querySelector('.login-background');
    if (loginBackground) {
        // loginBackground.style.display = 'none';
        loginBackground.remove(); // Au lieu de juste le masquer, on le supprime du DOM
    }
}

// window.hideLoginBackground = hideLoginBackground;