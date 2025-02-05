// ====================================
// Contrôles et interactions
// ====================================
import { findDescendants } from './treeOperations.js';
import { extractYear } from './utils.js';
import { drawTree, getZoom } from './treeRenderer.js';
import { state, displayGenealogicTree } from './main.js';

/**
 * Ajoute les contrôles pour changer la racine
 * @param {Object} nodeGroups - Les groupes de nœuds
 */
export function addRootChangeButton(nodeGroups) {
    nodeGroups.append("text")
        .attr("class", "root-text")
        .attr("x", state.boxWidth/2 + 9)
        .attr("y", -state.boxHeight/2 + 46)
        .attr("text-anchor", "middle")
        .style("cursor", "pointer")
        .style("font-size", "16px")
        .style("fill", "#6495ED")
        .text("*")
        .on("click", handleRootChange);
}

/**
 * Gère le changement de racine
 * @private
 */
export function handleRootChange(event, d) {
    if (!event || !d) return;
    
    event.stopPropagation();
    displayGenealogicTree(d.data.id); 

    const svg = d3.select("#tree-svg");
    const height = window.innerHeight;
    const zoom = getZoom();
    
    if (zoom) {
        svg.transition()
            .duration(750)
            .call(zoom.transform, 
                d3.zoomIdentity
                    .translate(state.boxWidth, height / 2)
                    .scale(0.8)
            );
    }
}



/**
 * Gère les descendants des nœuds non-racine
 * @private
 */
function handleNonRootDescendants(d) {
    const personId = d.data.id;
    const descendants = findDescendants(personId, new Set());

    // Créer la hiérarchie d3
    const root = d3.hierarchy(state.currentTree);
    
    if (!d.data._hiddenDescendants) {
        // Cacher les descendants
        d.data._hiddenDescendants = descendants;
        
        // Marquer les descendants pour les cacher
        const descendantIds = new Set(descendants.map(desc => desc.id));
        
        root.each(node => {
            if (descendantIds.has(node.data.id)) {
                node.data._isDescendantNode = true;
                node.data._isDescendantLink = true;
            }
        });
    } else {
        // Restaurer les descendants
        root.each(node => {
            delete node.data._isDescendantNode;
            delete node.data._isDescendantLink;
        });

        // Conserver EXACTEMENT les mêmes enfants qu'avant
        const existingChildren = d.data.children;
        d.data.children = existingChildren;
        d.data._hiddenDescendants = null;
    }

    drawTree(state.currentTree, state.gedcomData);
}

/**
 * Ajoute le bouton de contrôle des descendants
 * @param {Object} nodeGroups - Les groupes de nœuds
 */
export function addDescendantsControls(nodeGroups) {
    // Bouton statique pour les siblings
    addStaticDescendantsButton(nodeGroups);
    
    // Bouton interactif pour les autres nœuds
    addInteractiveDescendantsButton(nodeGroups);
}

/**
* Ajoute un bouton "+" statique vert à gauche des siblings ayant des descendants.
* Ce bouton est purement indicatif et n'a pas d'action associée.
* À ne pas confondre avec addInteractiveDescendantsButton qui gère les boutons interactifs
* pour les nœuds standards.
 * 
 * @private
 */
function addStaticDescendantsButton(nodeGroups) {
    nodeGroups.append("text")
        .filter(d => {
            if (!d.data.isSibling) return false;
            const person = state.gedcomData.individuals[d.data.id];
            return person && person.spouseFamilies && person.spouseFamilies.some(famId => {
                const family = state.gedcomData.families[famId];
                return family && family.children && family.children.length > 0;
            });
        })
        .attr("class", "toggle-text-left")
        .attr("x", -state.boxWidth/2 - 9)
        .attr("y", -state.boxHeight/2 + 15)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("fill", "#4CAF50")
        .text("+")
        .on("click", event => event.stopPropagation());
}



/**
 * Ajoute un bouton interactif pour les descendants des autres nœuds
 * @private
 */
function addInteractiveDescendantsButton(nodeGroups) {
    nodeGroups.append("text")
        .filter(d => {
            if (d.data.isSibling) return false;
            const person = state.gedcomData.individuals[d.data.id];
            return person.spouseFamilies && person.spouseFamilies.some(famId => {
                const family = state.gedcomData.families[famId];
                return family && family.children && family.children.length > 0;
            });
        })
        .attr("class", "toggle-text-left")
        .attr("x", -state.boxWidth/2 - 9)
        .attr("y", -state.boxHeight/2 + 15)
        .attr("text-anchor", "middle")
        .style("cursor", "pointer")
        .style("font-size", "20px")
        .style("fill", "#6495ED")
        .text(d => getDescendantsButtonText(d))
        .on("click", handleDescendantsClick);
}


/**
 * Obtient le texte du bouton des descendants
 * @private
 */
function getDescendantsButtonText(d) {
    if (d.depth === 0) {
        const person = state.gedcomData.individuals[d.data.id];
        const hasDescendants = person.spouseFamilies?.some(famId => {
            const family = state.gedcomData.families[famId];
            return family?.children?.length > 0;
        });
        return (hasDescendants && !d.data._rootHiddenDescendants) ? "+" : 
               (hasDescendants && d.data._rootHiddenDescendants) ? "-" : "";
    }
    return d.data._hiddenDescendants ? "+" : "-";
}

/**
 * Gère le clic sur le bouton des descendants
 * @private
 */
function handleDescendantsClick(event, d) {
    event.stopPropagation();
    
    if (d.depth === 0) {
        handleRootDescendants(d);
    } else {
        handleNonRootDescendants(d);
    }
}

/**
 * Gère les descendants de la racine
 * @private
 */
function handleRootDescendants(d) {
    const descendants = findDescendants(d.data.id);
    const closestDescendant = findClosestDescendant(descendants, d.data.id);
    
    if (closestDescendant) {
        updateRootToClosestDescendant(closestDescendant);
    }
}

/**
 * Trouve le descendant le plus proche
 * @private
 */
function findClosestDescendant(descendants, parentId) {
    return descendants
        .filter(desc => {
            const person = state.gedcomData.individuals[desc.id];
            return person.birthDate;
        })
        .sort((a, b) => {
            const yearA = parseInt(extractYear(state.gedcomData.individuals[a.id].birthDate));
            const yearB = parseInt(extractYear(state.gedcomData.individuals[b.id].birthDate));
            const parentYear = parseInt(extractYear(state.gedcomData.individuals[parentId].birthDate));
            return Math.abs(yearA - parentYear) - Math.abs(yearB - parentYear);
        })[0];
}

/**
 * Met à jour la racine avec le descendant le plus proche
 * @private
 */
function updateRootToClosestDescendant(descendant) {
    const newRootPerson = state.gedcomData.individuals[descendant.id];
    
    const rootPersonResults = document.getElementById('root-person-results');
    rootPersonResults.innerHTML = '';

    const option = document.createElement('option');
    option.value = descendant.id;
    option.textContent = newRootPerson.name.replace(/\//g, '').trim();
    rootPersonResults.appendChild(option);

    displayGenealogicTree(descendant.id);
}

/**
 * Ajoute les contrôles pour les ancêtres
 * @param {Object} nodeGroups - Les groupes de nœuds
 */
export function addAncestorsControls(nodeGroups) {
    nodeGroups.append("text")
        .filter(shouldShowAncestorsButton)
        .attr("class", "toggle-text")
        .attr("x", state.boxWidth/2 + 9)
        .attr("y", -state.boxHeight/2 + 15)
        .attr("text-anchor", "middle")
        .style("cursor", "pointer")
        .style("font-size", "20px")
        .style("fill", d => d.data.isSibling ? "#4CAF50" : "#6495ED")
        .text(d => d.data.children?.length ? "-" : "+")
        .on("click", handleAncestorsClick);
}

/**
 * Vérifie si le bouton des ancêtres doit être affiché
 * @private
 */
function shouldShowAncestorsButton(d) {
    if (d.data.children?.length) return true;
    if (d.depth === (state.nombre_generation-1) || d.data.hasParents) {
        const person = state.gedcomData.individuals[d.data.id];
        return person.families.some(famId => {
            const family = state.gedcomData.families[famId];
            return family && (family.husband || family.wife);
        });
    }
    return d.data._hiddenChildren?.length;
}

/**
 * Gère le clic sur le bouton des ancêtres
 * @private
 */
function handleAncestorsClick(event, d) {
    event.stopPropagation();
    
    if (d.data.children?.length) {
        d.data._hiddenChildren = d.data.children;
        d.data.children = [];
    } else {
        if (d.data._hiddenChildren) {
            restoreHiddenChildren(d);
        } else {
            buildNewAncestors(d);
        }
    }
    
    drawTree();
}

/**
 * Restaure les enfants cachés
 * @private
 */
function restoreHiddenChildren(d) {
    d.data.children = d.data._hiddenChildren;
    d.data._hiddenChildren = null;
}

/**
 * Construit de nouveaux ancêtres
 * @private
 */
function buildNewAncestors(d) {
    const person = state.gedcomData.individuals[d.data.id];
    person.families.some(famId => {
        const family = state.gedcomData.families[famId];
        if (family) {
            d.data.children = [];
            addParentToChildren(family.husband, 'father', d);
            addParentToChildren(family.wife, 'mother', d);
            return true;
        }
        return false;
    });
}

/**
 * Ajoute un parent aux enfants
 * @private
 */
function addParentToChildren(parentId, parentType, d) {
    if (!parentId) return;
    
    const parent = state.gedcomData.individuals[parentId];
    const parentHasParents = parent.families.some(fId => {
        const fam = state.gedcomData.families[fId];
        return fam && (fam.husband || fam.wife);
    });
    
    d.data.children.push({
        id: parentId,
        name: parent.name,
        generation: d.data.generation + 1,
        children: [],
        birthDate: parent.birthDate,
        deathDate: parent.deathDate,
        hasParents: parentHasParents
    });
}

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