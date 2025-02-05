// ====================================
// Gestionnaires d'événements
// ====================================
import { drawTree } from './treeRenderer.js';
import { getZoom } from './treeRenderer.js';
import { state, displayGenealogicTree } from './main.js';
import { findYoungestPerson } from './utils.js';

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
}

/**
 * Gère le redimensionnement de la fenêtre
 */
export function handleWindowResize() {
    d3.select("#tree-svg")
        .attr("width", window.innerWidth)
        .attr("height", window.innerHeight);
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
 * Recherche d'une personne racine
 */
export function searchRootPerson(event) {
    const searchInput = document.getElementById('root-person-search');
    const resultsSelect = document.getElementById('root-person-results');
    const searchStr = searchInput.value.toLowerCase();

    resultsSelect.innerHTML = '<option value="">Select</option>';
    resultsSelect.style.display = 'none';

    if (!searchStr) return;

    const matchedPersons = Object.values(state.gedcomData.individuals)
        .filter(person => {
            const fullName = person.name.toLowerCase().replace(/\//g, '');
            return fullName.includes(searchStr);
        });

    if (matchedPersons.length > 0) {
        displaySearchResults(matchedPersons, resultsSelect);
    } else {
        alert('Aucune personne trouvée');
    }
}

/**
 * Affiche les résultats de recherche
 * @private
 */
function displaySearchResults(matchedPersons, resultsSelect) {
    matchedPersons.forEach(person => {
        const option = document.createElement('option');
        option.value = person.id;
        option.textContent = person.name.replace(/\//g, '').trim();
        resultsSelect.appendChild(option);
    });
    
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
        resultsSelect.style.animation = 'none';
        resultsSelect.style.backgroundColor = 'orange';

        state.rootPersonId = selectedPersonId;
        displayGenealogicTree(selectedPersonId);
        
        resultsSelect.style.display = 'block';
    }
}

/**
 * Gère les mises à jour du nombre de prénoms
 */
export function updatePrenoms(value) {
    state.nombre_prenoms = value;
    displayGenealogicTree();
}

/**
 * Gère les mises à jour du nombre de générations
 */
export function updateGenerations(value) {
    state.nombre_generation = value;
    displayGenealogicTree();
}

/**
 * Gère le zoom avant
 */
export function zoomIn() {
    const svg = d3.select("#tree-svg");
    const currentTransform = d3.zoomTransform(svg.node());
    svg.transition()
        .duration(750)
        .call(getZoom().transform, 
            d3.zoomIdentity
                .translate(currentTransform.x, currentTransform.y)
                .scale(currentTransform.k * 1.2)
        );
}

/**
 * Gère le zoom arrière
 */
export function zoomOut() {
    const svg = d3.select("#tree-svg");
    const currentTransform = d3.zoomTransform(svg.node());
    svg.transition()
        .duration(750)
        .call(getZoom().transform, 
            d3.zoomIdentity
                .translate(currentTransform.x, currentTransform.y)
                .scale(currentTransform.k / 1.2)
        );
}

/**
 * Réinitialise le zoom et retourne à la personne la plus jeune
 */
export function resetZoom() {
    state.rootPersonId = null;
    const youngest = findYoungestPerson();
    
    const rootPersonResults = document.getElementById('root-person-results');
    rootPersonResults.innerHTML = '';

    const option = document.createElement('option');
    option.value = youngest.id;
    option.textContent = youngest.name.replace(/\//g, '').trim();
    rootPersonResults.appendChild(option);

    rootPersonResults.style.display = 'block';
    rootPersonResults.addEventListener('change', function() {
        const selectedPersonId = this.value;
        displayGenealogicTree(selectedPersonId);
    });
        
    displayGenealogicTree();

    const svg = d3.select("#tree-svg");
    const width = window.innerWidth;
    const height = window.innerHeight;
    svg.transition()
        .duration(750)
        .call(getZoom().transform, d3.zoomIdentity.translate(state.boxWidth, height / 2).scale(0.8));
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