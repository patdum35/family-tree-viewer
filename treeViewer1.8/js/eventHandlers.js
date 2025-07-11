// ====================================
// Gestionnaires d'événements
// ====================================
import { getZoom, getLastTransform } from './treeRenderer.js';
import { state, displayGenealogicTree, hideMap } from './main.js';
import { replaceRootPersonSelector, updateSelectorDisplayText } from './mainUI.js';
import { setupElegantBackground } from './backgroundManager.js';
import { findPersonsByName } from './utils.js';
import { hideHamburgerMenu, resizeHamburger } from './hamburgerMenu.js';
import { animationState, stopAnimation, initializeAnimationMapPosition, updateAnimationMapSize} from './treeAnimation.js';
import { repositionAudioPlayerOnResize } from './audioPlayer.js'
import { getCachedResourceUrl } from './photoPlayer.js';
import { drawWheelTree, setMaxGenerations, resetWheelView, removeSpinningImage } from './treeWheelRenderer.js'
import { disableFortuneModeWithLever } from './treeWheelAnimation.js'
import { enableBackground } from './backgroundManager.js';
import { calculateFullTreeDimensions } from './exportManager.js';


/**
 * Initialise les gestionnaires d'événements globaux
 */
export function initializeEventHandlers() {
    window.addEventListener('resize', handleWindowResize);
    window.addEventListener('click', handleModalClick);
    
    document.getElementById("root-person-search")
        .addEventListener("keydown", handleSearchKeydown);
    
    document.getElementById('root-person-results')
        .addEventListener('change', selectRootPerson);

    initializeHeatmapHandlers();
}

export function initializeHeatmapHandlers() {
    const completeButton = document.querySelector('[data-heatmap="complete"]');
    const ancestorsButton = document.querySelector('[data-heatmap="ancestors"]');
    const descendantsButton = document.querySelector('[data-heatmap="descendants"]');

    completeButton?.addEventListener('click', () => createAncestorsHeatMap({ type: 'all' }));
    ancestorsButton?.addEventListener('click', () => createAncestorsHeatMap({ type: 'ancestors' }));
    descendantsButton?.addEventListener('click', () => createAncestorsHeatMap({ type: 'descendants' }));
}

/**
 * Gère le redimensionnement de la fenêtre
 */
export function handleWindowResize() {
    d3.select("#tree-svg")
        .attr("width", window.innerWidth)
        .attr("height", window.innerHeight);
        
    const svg = d3.select("#tree-svg");
    setupElegantBackground(svg);
    initializeAnimationMapPosition();
    updateAnimationMapSize();
    resizeHamburger();
    repositionAudioPlayerOnResize();


    // state.lastVerticalPosition = state.lastVerticalPosition - 300;

    state.screenResizeHasOccured = true;
    state.previousWindowInnerWidth = state.lastWindowInnerWidth;
    state.previousWindowInnerHeight = state.lastWindowInnerHeight;
    state.lastWindowInnerWidth = window.innerWidth;
    state.lastWindowInnerHeight = window.innerHeight;
    console.log("\n\n\n ##### Redimensionnement de la fenêtre, sizes = ", state.lastWindowInnerWidth, state.lastWindowInnerHeight, "previous : ", state.previousWindowInnerWidth, state.previousWindowInnerHeight, state.screenResizeHasOccured, '########\n\n\n');

    // if (state.lastWindowInnerHeight - state.previousWindowInnerHeight > 0  ) { state.lastVerticalPosition = state.lastVerticalPosition + 100};
    // if (state.lastWindowInnerHeight - state.previousWindowInnerHeight < 0 ) { state.lastVerticalPosition = state.lastVerticalPosition - 100};

    // if (state.lastWindowInnerWidth - state.previousWindowInnerWidth > 0  ) { 
    //     let  lastHorizontalPositionLocal  = state.lastHorizontalPosition;
    //     state.lastHorizontalPosition = Math.max(0, state.lastHorizontalPosition + state.lastWindowInnerWidth - state.previousWindowInnerWidth); 
    //     console.log("\n\n\n ##### Repositionnement arbre = ", lastHorizontalPositionLocal, state.lastHorizontalPosition,  '########\n\n\n');

    // };
    // if (state.lastWindowInnerWidth - state.previousWindowInnerWidth < 0  ) { 
    //     let  lastHorizontalPositionLocal  = state.lastHorizontalPosition;
    //     state.lastHorizontalPosition = Math.max(0, state.lastHorizontalPosition + state.lastWindowInnerWidth - state.previousWindowInnerWidth); 
    //     console.log("\n\n\n ##### Repositionnement arbre = ", lastHorizontalPositionLocal, state.lastHorizontalPosition,  '########\n\n\n');
    //  };





    /* */

    // if (state.isRadarEnabled) {  resetWheelView() } ;// drawWheelTree(true, false); }


}

/**
 * Gère les clics sur la modale
 */
export function handleModalClick(event) {
    const modal = document.getElementById('person-details-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

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
            import('./mainUI.js').then(module => {
                if (typeof module.replaceRootPersonSelector === 'function') {
                    module.replaceRootPersonSelector(options);
                }
            });
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

    if (selectedPersonId) {
        // Désactiver le clignotement
        if (typeof resultsSelect.setBlinking === 'function') {
            resultsSelect.setBlinking(false);
        } else {
            resultsSelect.style.animation = 'none';
            resultsSelect.style.backgroundColor = 'orange';
        }

        state.rootPersonId = selectedPersonId;
        console.log('\n\n\n\n ###################   CALL displayGenealogicTree in selectRootPerson ################# ')
        displayGenealogicTree(selectedPersonId, true);
        
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
        import('./mainUI.js').then(module => {
            if (typeof module.replaceRootPersonSelector === 'function') {
                const newSelector = module.replaceRootPersonSelector(options);
                if (newSelector) {
                    // Forcer l'affichage de "Select" comme texte affiché
                    module.updateSelectorDisplayText(newSelector, "Select");
                    
                    if (typeof newSelector.setBlinking === 'function') {
                        newSelector.setBlinking(true);
                    }
                }
            }
        });
    } else {
        alert('Aucune personne trouvée');
    }
}

// Fonction améliorée pour la sélection d'une personne trouvée
export function selectFoundPerson(personId) {
    if (!personId) return;
    
    const resultsSelect = document.getElementById('root-person-results');
    
    // Désactiver le clignotement s'il existe
    if (resultsSelect) {
        if (typeof resultsSelect.setBlinking === 'function') {
            resultsSelect.setBlinking(false);
        } else {
            resultsSelect.style.animation = 'none';
            resultsSelect.style.backgroundColor = 'orange';
        }
    }
    
    // Afficher la personne comme racine
    console.log('\n\n\n\n ###################   CALL displayGenealogicTree in searchRootPerson ################# ')
    // displayGenealogicTree(personId, true);
    if (state.isRadarEnabled) {
        displayGenealogicTree(personId, false, false,  false, 'WheelAncestors');
    } else {
        displayGenealogicTree(personId, true, false);
    }

    
    // Attendre que l'arbre soit affiché et que l'historique soit mis à jour
    setTimeout(() => {
        // Forcer une recréation complète du sélecteur en mode historique
        // plutôt que d'essayer de mettre à jour celui existant
        import('./mainUI.js').then(module => {
            if (typeof module.replaceRootPersonSelector === 'function') {
                // Recréer le sélecteur avec l'historique mis à jour
                const newSelector = module.replaceRootPersonSelector();
                
                // S'assurer que la personne sélectionnée est choisie comme valeur courante
                if (newSelector) {
                    // Rechercher la personne dans l'historique mis à jour
                    const rootHistory = JSON.parse(localStorage.getItem('rootPersonHistory') || '[]');
                    const selectedPerson = rootHistory.find(entry => entry.id === personId);
                    
                    if (selectedPerson) {
                        // Définir la valeur sélectionnée
                        newSelector.value = personId;
                        
                        // Mettre à jour l'affichage avec le nom tronqué
                        module.updateSelectorDisplayText(newSelector, selectedPerson.name);
                    }
                }
            }
        });
    }, 200); // Augmenter le délai pour s'assurer que tout est bien synchronisé
}


/**
 * Gère les mises à jour du nombre de prénoms
 */
export function updatePrenoms(value) {
    state.nombre_prenoms = parseInt(value);
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
export function updateGenerations(value) {
    state.nombre_generation = parseInt(value);
    if (state.isRadarEnabled) {
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
    const zoom = getZoom();
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
    const zoom = getZoom();
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
    const zoom = getZoom();

    state.isAnimationLaunched = false;
    
    if (zoom) {
        let transform = d3.zoomIdentity;
        if (state.treeMode === 'descendants' || state.treeMode === 'directDescendants') {
            // Pour les descendants, commencer du côté droit
            transform = transform.translate(window.innerWidth - state.boxWidth * 2, height / 2);
        } else {
            // Pour les ascendants, commencer du côté gauche
            transform = transform.translate(state.boxWidth, height / 2);
        }
        transform = transform.scale(0.8);

        svg.transition()
            .duration(750)
            .call(zoom.transform, transform);
    }
}


export function resetViewZoomBeforeExport() {
    const svg = d3.select("#tree-svg");
    const height = window.innerHeight;
    const zoom = getZoom();

    state.isAnimationLaunched = false;
    
    if (zoom) {

        // Récupérer la transformation actuelle
        const currentTransform = getLastTransform() || d3.zoomIdentity;
        
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
            const fullDimensions = calculateFullTreeDimensions(svgForExport);
            console.log( "new dimension pour the background with png export", fullDimensions)
            setupElegantBackground(svg, fullDimensions, true);
        }

        svg.transition()
            .duration(750)
            .call(zoom.transform, transform);
    }
}



export function resetViewZoomAfterExport() {
    const svg = d3.select("#tree-svg");
    const height = window.innerHeight;
    const zoom = getZoom();

    state.isAnimationLaunched = false;
    
    if (zoom) {

        // Récupérer la transformation actuelle
        let transform = d3.zoomIdentity;
        transform = transform.translate(state.currentX, state.currentY).scale(state.currentScale);

        if (state.backgroundEnabled) {
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
    stopAnimation();
    
    // Réinitialiser la vue
    resetView();
    
    // Masquer la carte
    hideMap();
    
    // Supprimer l'image de fond
    const loginBackground = document.querySelector('.login-background');
    if (loginBackground) {
        loginBackground.remove();
    }
    
    // Supprimer également tout autre conteneur de fond d'écran existant
    const existingBackgroundContainer = document.querySelector('.background-container');
    if (existingBackgroundContainer) {
        existingBackgroundContainer.remove();
    }
    
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
            .call(getZoom().transform, 
                d3.zoomIdentity
                    .translate(window.innerWidth/2 - x, window.innerHeight/2 - y)
                    .scale(1)
            );
    }
}


export async function returnToLogin() {
    // Masquer l'arbre
    document.getElementById('tree-container').style.display = 'none';


    
    
    // Masquer le menu hamburger
    hideHamburgerMenu();
    
    // Afficher le formulaire de mot de passe
    document.getElementById('password-form').style.display = 'flex';
    
    // Réafficher le bouton des paramètres de la page d'accueil
    const settingsButton = document.getElementById('load-gedcom-button');
    if (settingsButton) {
        settingsButton.style.display = 'block';
    }
    
    // Réinitialiser le champ de mot de passe
    document.getElementById('password').value = '';
    
    // Réinitialiser rootPersonId dans l'objet state
    state.rootPersonId = null;
    state.rootPerson = null;
    // Réinitialiser d'autres propriétés si nécessaire
    state.isAnimationLaunched = false;
    stopAnimation();

    animationState.isPaused = true;
    const animationPauseBtn = document.getElementById('animationPauseBtn');
    // Mettre à jour le bouton
    animationPauseBtn.querySelector('span').textContent = '▶️';

    // Masquer la carte
    hideMap();

    state.isRadarEnabled = false;
    disableFortuneModeWithLever();
    state.isRadarEnabled = false;
    state.treeMode = 'ancestors';
    state.treeModeReal = 'ancestors';
    removeSpinningImage();

    // updateRadarButtonText();
    
    // Restaurer le fond d'écran de connexion s'il a été supprimé
    const loginBackground = document.querySelector('.login-background');
    if (!loginBackground) {
        const newLoginBackground = document.createElement('div');
        newLoginBackground.className = 'login-background';
        const backgroundImage = document.createElement('img');
        // backgroundImage.src = 'background_images/fort_lalatte.jpg';
        backgroundImage.className = 'login-background-image';
        backgroundImage.alt = 'Fond d\'écran';
        newLoginBackground.appendChild(backgroundImage);
        document.body.insertBefore(newLoginBackground, document.body.firstChild);


        // Utiliser getCachedResourceUrl pour obtenir l'URL de l'image (si disponible)
        try {
            // const imagePath = 'background_images/fort_lalatte.jpx';
            const imagePath = 'background_images/lichen-red.jpg';
            backgroundImage.src = await getCachedResourceUrl(imagePath);
        } catch (error) {
            console.error("Erreur lors du chargement de l'image de fond:", error);
            // Fallback en cas d'erreur
            // backgroundImage.src = 'background_images/fort_lalatte.jpg';
            backgroundImage.src = 'background_images/lichen-red.jpg';
        }
    }
    
    // Quitter le mode plein écran si actif
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.error(err));
    }
}

window.returnToLogin = returnToLogin;

export function toggleFullScreen() {
    if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) { // Firefox
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) { // Chrome, Safari and Opera
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) { // IE/Edge
            document.documentElement.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

window.toggleFullScreen = toggleFullScreen;

// Fonction pour masquer le fond d'écran de connexion
export function hideLoginBackground() {
    const loginBackground = document.querySelector('.login-background');
    if (loginBackground) {
        // loginBackground.style.display = 'none';
        loginBackground.remove(); // Au lieu de juste le masquer, on le supprime du DOM
    }
}

// window.hideLoginBackground = hideLoginBackground;

