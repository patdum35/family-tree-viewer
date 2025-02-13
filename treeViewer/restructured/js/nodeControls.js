// ====================================
// Contrôles et interactions
// ====================================
import { findDescendants, findSiblings, findGenealogicalParent, buildDescendantTree  } from './treeOperations.js';
import { extractYear } from './utils.js';
import { drawTree, getZoom, getLastTransform  } from './treeRenderer.js';
import { state, displayGenealogicTree } from './main.js';
import { resetView } from './eventHandlers.js';

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

    
    // Mettre à jour le sélecteur root-person-results
    const rootPersonResults = document.getElementById('root-person-results');
    if (rootPersonResults) {
        rootPersonResults.innerHTML = '';
        const option = document.createElement('option');
        option.value = d.data.id;
        option.textContent = d.data.name.replace(/\//g, '').trim();
        rootPersonResults.appendChild(option);
    }

    event.stopPropagation();
    displayGenealogicTree(d.data.id, true); 

    
    if (state.treeModeReal != 'both')
    {
        const svg = d3.select("#tree-svg");
        const height = window.innerHeight;
        const zoom = getZoom();
        
        if (zoom) {
            let transform = d3.zoomIdentity;
            if (state.treeModeReal  === 'descendants') {
                transform = transform.translate(window.innerWidth - state.boxWidth * 2, height / 2);
            } else {
                transform = transform.translate(state.boxWidth, height / 2);
            }
            transform = transform.scale(0.8);

            svg.transition()
                .duration(750)
                .call(zoom.transform, transform);
        }
    }
    
}

/**
 * Gère les boutons de controle des noeuds descendants
 * @export
 */
export function addDescendantsControls(nodeGroups) {
    if (state.treeModeReal  === 'descendants') {
        nodeGroups.append("text")
            .filter(d => {
                if (d.data.isSibling) return false;
                const person = state.gedcomData.individuals[d.data.id];
                // Vérifier si la personne a des descendants
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
            .text(d => {
                // Pour les spouses, même symbole que leur conjoint
                if (d.data.isSpouse && d.parent) {
                    const siblings = d.parent.children;
                    const spouseIndex = siblings.indexOf(d);
                    if (spouseIndex > 0) {
                        const partner = siblings[spouseIndex - 1];
                        if (partner.data.children && partner.data.children.length > 0) return "-";
                        if (!partner.data.children || partner.data.children.length === 0) return "+";
                    }
                }

                // Pour le niveau le plus à droite
                if (d.y >= d3.max(d3.selectAll(".node").data(), n => n.y)) {
                    return "+";
                }
                
                // Pour les autres niveaux
                return d.data.children && d.data.children.length > 0 ? "-" : "+";
            })
            .on("click", handleDescendantsClick);
    } else {
        // Mode ascendant : code original
        addSiblingDescendantsButton(nodeGroups);
        addInteractiveDescendantsButton(nodeGroups);
    }
}


/**
 * Trouve le nœud cible (le nœud lui-même ou son conjoint s'il s'agit d'un spouse)
 * @param {Object} node - Le nœud cliqué
 * @returns {Object} - Le nœud cible et son ID
 */
function findTargetNode(node) {
    let targetNode = node;
    let targetId = node.data.id;

    if (node.data.isSpouse && node.parent) {
        const siblings = node.parent.children;
        const spouseIndex = siblings.indexOf(node);
        if (spouseIndex > 0) {
            targetNode = siblings[spouseIndex - 1];
            targetId = targetNode.data.id;
        }
    }

    return { targetNode, targetId };
}

/**
 * Trouve les IDs des enfants dans le GEDCOM pour une personne donnée
 * @param {string} personId - ID de la personne
 * @returns {string[]} - Liste des IDs des enfants
 */
function findChildrenIds(personId) {
    const person = state.gedcomData.individuals[personId];
    let childrenIds = [];

    if (person.spouseFamilies) {
        person.spouseFamilies.forEach(famId => {
            const family = state.gedcomData.families[famId];
            if (family && family.children) {
                childrenIds = childrenIds.concat(family.children);
            }
        });
    }

    return childrenIds;
}

/**
 * Crée un nœud pour un enfant ou un spouse dans l'arbre
 * @param {string} personId - ID de la personne
 * @param {number} generation - Niveau de génération
 * @param {Object} options - Options supplémentaires (isSpouse, spouseOf)
 * @returns {Object} - Le nœud créé
 */
function createPersonNode(personId, generation, options = {}) {
    const person = state.gedcomData.individuals[personId];
    return {
        id: personId,
        name: person.name,
        generation: generation,
        children: [],
        birthDate: person.birthDate,
        deathDate: person.deathDate,
        ...(options.isSpouse && { 
            isSpouse: true,
            spouseOf: options.spouseOf 
        })
    };
}

/**
 * Gère le clic sur le bouton des descendants
 * En mode ascendant : change la racine pour les nœuds racine/siblings, cache/montre les descendants pour les autres
 * En mode descendant : cache/montre les descendants directs et leurs spouses
 * @param {Event} event - L'événement de clic
 * @param {Object} d - Les données du nœud cliqué
 */
function handleDescendantsClick(event, d) {
    event.stopPropagation();
    
    if (state.treeModeReal  === 'descendants') {
        const { targetNode, targetId } = findTargetNode(d);
        const childrenIds = findChildrenIds(targetId);

        if ((!targetNode.data.children || targetNode.data.children.length === 0) && childrenIds.length > 0) {
            // Créer les nœuds pour les enfants et leurs spouses
            const childrenWithSpouses = [];
            
            childrenIds.forEach(childId => {
                // Ajouter l'enfant
                const childNode = createPersonNode(childId, targetNode.data.generation + 1);
                childrenWithSpouses.push(childNode);

                // Ajouter les spouses de l'enfant
                const child = state.gedcomData.individuals[childId];
                if (child.spouseFamilies) {
                    child.spouseFamilies.forEach(spouseFamId => {
                        const spouseFamily = state.gedcomData.families[spouseFamId];
                        const spouseId = spouseFamily.husband === childId ? spouseFamily.wife : spouseFamily.husband;
                        if (spouseId) {
                            const spouseNode = createPersonNode(spouseId, targetNode.data.generation + 1, {
                                isSpouse: true,
                                spouseOf: childId
                            });
                            childrenWithSpouses.push(spouseNode);
                        }
                    });
                }
            });

            // Assigner les enfants au nœud cible
            targetNode.data.children = childrenWithSpouses;
            
            // Copier vers le spouse si nécessaire
            if (d.data.isSpouse) {
                d.data.children = [...targetNode.data.children];
            }
        } else {
            // Cacher les descendants
            targetNode.data._originalChildren = targetNode.data.children;
            targetNode.data.children = [];
            
            if (d.data.isSpouse) {
                d.data._originalChildren = d.data.children;
                d.data.children = [];
            }
        }

        drawTree();

        // fonction pour ajuster la vue si nécessaire
        handleTreeLeftShift();

    } else {
        // Mode ascendant : comportement original
        if ((d.depth === 0) || (d.data.isSibling)) {
            handleRootDescendants(d);
        } else {
            handleNonRootDescendants(d);
        }
    }
}


/**
 * Ajuste la vue si des nœuds apparaissent trop à gauche
 */
function handleTreeLeftShift() {
    const svg = d3.select("#tree-svg");
    const lastTransform = getLastTransform() || d3.zoomIdentity;
    const zoom = getZoom();
    
    // Trouver les nœuds du niveau le plus à gauche
    const nodes = d3.selectAll(".node").nodes();
    const leftmostNode = nodes.reduce((leftmost, node) => {
        const rect = node.getBoundingClientRect();
        if (!leftmost || rect.left < leftmost.left) {
            return rect;
        }
        return leftmost;
    }, null);

    if (leftmostNode) {
        const margin = 100;
        
        if (leftmostNode.left < margin) {
            const shiftAmount = state.boxWidth * 1.3;
            
            if (zoom) {
                svg.transition()
                    .duration(750)
                    .call(zoom.transform, 
                        lastTransform.translate(shiftAmount, 0)
                    );
            }
        }
    }
}


/**
* Ajoute un bouton "+"  vert à gauche des siblings ayant des descendants.
 * @private
 */
function addSiblingDescendantsButton(nodeGroups) {
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
        // .on("click", event => event.stopPropagation());
        // .on("click", handleRootChange);
        .on("click", handleDescendantsClick);
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
 * Gère les descendants de la racine
 * @private
 */
function handleRootDescendants(d) {     
    const descendants = findDescendants(d.data.id);     
    const closestDescendant = findClosestDescendant(descendants, d.data.id);
    
    if (closestDescendant) {
        // S'assurer que nombre_generation est un nombre
        if (typeof state.nombre_generation === 'string') {
            state.nombre_generation = parseInt(state.nombre_generation, 10);
        }
        
        // Incrémenter avec vérification
        const newGenerations = Math.min(state.nombre_generation + 1, 101); // Maximum de 101
        

        state.nombre_generation = newGenerations;

        // Mettre à jour le sélecteur avec vérifications
        const generationsSelect = document.getElementById('generations');
        if (generationsSelect) {
            // Vérifier que la valeur existe dans le sélecteur
            const optionExists = Array.from(generationsSelect.options)
                .some(option => parseInt(option.value) === newGenerations);
            
            if (optionExists) {
                generationsSelect.value = newGenerations.toString();
            }
        }

        updateRootToClosestDescendant(closestDescendant);     

        // Recentrer l'arbre comme à l'initialisation
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

    drawTree(); //state.currentTree); //, state.gedcomData);
}


/**
 * Trouve le descendant le plus proche, avec le même nom, ou le nom de l'épou(x)(se) , ou le plus agé
 * @private
 */
export function findClosestDescendant(descendants, parentId) {
    if (!descendants || !parentId || descendants.length === 0) {
        return null;
    }

    const parentPerson = state.gedcomData.individuals[parentId];
    if (!parentPerson) {
        return null;
    }

    // Obtenir le nom de famille de la personne A
    const parentNameMatch = parentPerson.name ? parentPerson.name.match(/\/(.+?)\//) : null;
    const parentFamilyName = parentNameMatch ? parentNameMatch[1].trim().toUpperCase() : '';

    // Obtenir le nom de famille du conjoint B
    let spouseFamilyName = '';
    if (parentPerson.spouseFamilies) {
        for (const famId of parentPerson.spouseFamilies) {
            const family = state.gedcomData.families[famId];
            if (family) {
                const spouseId = family.husband === parentId ? family.wife : family.husband;
                if (spouseId) {
                    const spouse = state.gedcomData.individuals[spouseId];
                    if (spouse && spouse.name) {
                        const spouseNameMatch = spouse.name.match(/\/(.+?)\//);
                        if (spouseNameMatch) {
                            spouseFamilyName = spouseNameMatch[1].trim().toUpperCase();
                            break;
                        }
                    }
                }
            }
        }
    }

    // Filtrer les descendants ayant l'un des deux noms de famille
    const validDescendants = descendants.filter(desc => {
        const person = state.gedcomData.individuals[desc.id];
        if (!person || !person.name) {
            return false;
        }

        const descNameMatch = person.name.match(/\/(.+?)\//);
        const descFamilyName = descNameMatch ? descNameMatch[1].trim().toUpperCase() : '';

        const isValidName = descFamilyName === parentFamilyName || 
                           descFamilyName === spouseFamilyName;

        return isValidName && person.birthDate;
    });

    // Parmi les descendants valides, prendre le plus âgé
    if (validDescendants.length === 0) {
        const fallbackPerson = descendants[0];
        return fallbackPerson;
    }

    const result = validDescendants.sort((a, b) => {
        const yearA = safeParseYear(state.gedcomData.individuals[a.id].birthDate) || 9999;
        const yearB = safeParseYear(state.gedcomData.individuals[b.id].birthDate) || 9999;
        return yearA - yearB;  // Tri croissant par année de naissance
    })[0];

    return result;
}

function safeParseYear(dateStr) {
    if (!dateStr) return null;
    const year = parseInt(extractYear(dateStr));
    return isNaN(year) ? null : year;
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
    if (state.treeModeReal  === 'descendants') return;
    nodeGroups.append("text")
        .filter(function(d) {
            d.ShowAncestorsButton = shouldShowAncestorsButton(d);
            return d.ShowAncestorsButton;
        })
        .attr("class", "toggle-text")
        .attr("x", state.boxWidth/2 + 9)
        .attr("y", -state.boxHeight/2 + 15)
        .attr("text-anchor", "middle")
        .style("cursor", "pointer")
        .style("font-size", "20px")
        .style("fill", d => d.data.isSibling ? "#4CAF50" : "#6495ED")
        .text(function(d) {
            // if (d.depth < 3 )
            // {
            //         console.log(" DEBUG addAncestorsControls:", d.data.id, d.data.name, d.data.genealogicalParentId, "depth:", d.depth, ", hasRealParents=", d.ShowAncestorsButton, "hasVisibleParent=", hasVisibleGenealogicalParents(d)); 
            // };
            return d.ShowAncestorsButton && hasVisibleGenealogicalParents(d) ? "-" : "+" 
        } )
        .on("click", handleAncestorsClick);
}


/**
 * Vérifie si le bouton des ancêtres doit être affiché
 * @private
 */
function shouldShowAncestorsButton(d) {

    // Pour tous les niveaux, vérifier la présence réelle de parents
    // le bouton "+/-" doit être affiché si le noeud à des parents généalogiques  (génération suivante) présents dans le gedcom
    const person = state.gedcomData.individuals[d.data.id];
    const hasRealParents = person.families.some(famId => {
        const family = state.gedcomData.families[famId];
        return family && family.children && family.children.includes(person.id) &&
               (family.husband || family.wife);
    });
    return (hasRealParents);
}


/**
 * Vérifie si le noeud à des parents généalogiques (génération suivante) affichés dans l'arbre d3
 * @private
 */
function hasVisibleGenealogicalParents(d) {
    const person = state.gedcomData.individuals[d.data.id];
    // Récupérer l'arbre hiérarchique complet
    const rootHierarchy = d3.hierarchy(state.currentTree);

    // Trouver les parents généalogiques dans la génération suivante
    const hasVisibleParent = rootHierarchy.descendants().some(node => 
        node.depth === d.depth + 1 &&  // Génération suivante
        node.data.id === d.data.genealogicalParentId //&&  // Correspond au parent généalogique
    );
    return (hasVisibleParent);
}


/**
 * Met à jour le compteur de générations et incrémente sa valeur
 * Limite le nombre maximum de générations à 101
 */
function updateGenerationCount() {
    if (typeof state.nombre_generation === 'string') {
        state.nombre_generation = parseInt(state.nombre_generation, 10);
    }
    const newGenerations = Math.min(state.nombre_generation + 1, 101);
    state.nombre_generation = newGenerations;

    updateGenerationSelector(newGenerations);
}

/**
 * Met à jour le sélecteur de générations dans l'interface
 * @param {number} value - Nouvelle valeur pour le nombre de générations
 */
function updateGenerationSelector(value) {
    const generationsSelect = document.getElementById('generations');
    if (generationsSelect) {
        const optionExists = Array.from(generationsSelect.options)
            .some(option => parseInt(option.value) === value);
        if (optionExists) {
            generationsSelect.value = value.toString();
        }
    }
}

/**
 * Gère le décalage horizontal de l'arbre si les nœuds sont trop proches du bord droit
 * Applique une transition animée si nécessaire
 */
function handleTreeShift() {
    const svg = d3.select("#tree-svg");
    const lastTransform = getLastTransform() || d3.zoomIdentity;
    const zoom = getZoom();
    const screenWidth = window.innerWidth;
    
    // Trouver les nœuds du niveau le plus profond
    const nodes = d3.selectAll(".node").nodes();
    const rightmostNode = nodes.reduce((rightmost, node) => {
        const rect = node.getBoundingClientRect();
        if (!rightmost || rect.right > rightmost.right) {
            return rect;
        }
        return rightmost;
    }, null);

    if (rightmostNode) {
        const margin = 100;
        // console.log("Position droite:", rightmostNode.right, "Écran:", screenWidth - margin);

        if (rightmostNode.right > (screenWidth - margin)) {
            const shiftAmount = state.boxWidth * 1.3;
            
            if (zoom) {
                svg.transition()
                    .duration(750)
                    .call(zoom.transform, 
                        lastTransform.translate(-shiftAmount, 0)
                    );
            }
        }
    }
}

/**
 * Gère l'ajout ou la suppression des ancêtres pour un nœud sibling
 * @param {Array} siblingsReference - Référence au nœud sibling
 * @returns {boolean} - Indique si de nouveaux ancêtres ont été ajoutés
 */
function handleSiblingAncestors(siblingsReference) {
    let newAncestorsAdded = false;

    if (siblingsReference[0].children?.length) {
        siblingsReference[0]._hiddenChildren = siblingsReference[0].children;
        siblingsReference[0].children = [];
    } else {
        if (siblingsReference[0]._hiddenChildren) {
            restoreHiddenChildren(siblingsReference[0]);
            newAncestorsAdded = true;
        } else {
            buildNewAncestors(siblingsReference[0]);
            updateGenerationCount();
            newAncestorsAdded = true;
        }
    }

    return newAncestorsAdded;
}

/**
 * Gère l'ajout ou la suppression des ancêtres pour un nœud normal
 * @param {Object} node - Le nœud à traiter
 * @returns {boolean} - Indique si de nouveaux ancêtres ont été ajoutés
 */
function handleNormalAncestors(node) {
    let newAncestorsAdded = false;

    if (node.children?.length) {
        node._hiddenChildren = node.children;
        node.children = [];
    } else {
        if (node._hiddenChildren) {
            restoreHiddenChildren(node);
            newAncestorsAdded = true;
        } else {
            buildNewAncestors(node);
            updateGenerationCount();
            newAncestorsAdded = true;
        }
    }

    return newAncestorsAdded;
}

/**
 * Fonction principale de gestion du clic sur le bouton des ancêtres
 * Gère l'ajout/suppression des ancêtres et le décalage de l'arbre si nécessaire
 * @param {Event} event - L'événement de clic
 * @param {Object} d - Les données du nœud cliqué
 */
export function handleAncestorsClick(event, d) {
    event.stopPropagation();
    let newAncestorsAdded = false;

    if (d.data.isSibling) {
        const siblingsReference = d.parent.data.children.filter(child => 
            child.id == d.data.siblingReferenceId && child !== d.data
        );
        newAncestorsAdded = handleSiblingAncestors(siblingsReference);
    } else {
        newAncestorsAdded = handleNormalAncestors(d.data);
    }

    drawTree();

    if (newAncestorsAdded) {
        handleTreeShift();
    }
}



/**
 * Restaure les enfants cachés
 * @private
 */
function restoreHiddenChildren(ddata) {
    ddata.children = ddata._hiddenChildren;
    ddata._hiddenChildren = null;
}

/**
 * Construit de nouveaux ancêtres
 * @private
 */
function buildNewAncestors(ddata) {
    const person = state.gedcomData.individuals[ddata.id];
    ddata.children = [];
   

    // console.log("debug buildNewAncestors for this node :",ddata.id,ddata.name);

    person.families.some(famId => {
        const family = state.gedcomData.families[famId];
        if (family) {
            // Ajouter les parents directement
            if (family.husband) {
                const father = state.gedcomData.individuals[family.husband];
                const familiesWithChildren = state.gedcomData.individuals[family.husband].families.filter(famId => {
                    const family = state.gedcomData.families[famId];
                    return family && family.children;
                });
                const genealogicalParentId = findGenealogicalParent(family.husband, familiesWithChildren);
                const fatherSiblings = findSiblings(family.husband);
                // console.log("debug buildNewAncestors fatherSiblings for this node :", family.husband,father.id, father.name, genealogicalParentId).
                addSiblingsToNode(fatherSiblings, ddata, family.husband, genealogicalParentId);
                addOtherSpouses(family.husband, family.wife, ddata);
                ddata.children.push({
                    id: family.husband,
                    name: father.name,
                    generation: ddata.generation + 1,
                    children: [],
                    birthDate: father.birthDate,
                    deathDate: father.deathDate,
                    hasParents: true,
                    genealogicalParentId: genealogicalParentId
                });


            }

            if (family.wife) {
                const mother = state.gedcomData.individuals[family.wife];
                const familiesWithChildren = state.gedcomData.individuals[family.wife].families.filter(famId => {
                    const family = state.gedcomData.families[famId];
                    return family && family.children;
                });
                const genealogicalParentId = findGenealogicalParent(family.wife, familiesWithChildren);
                const motherSiblings = findSiblings(family.wife);
                // console.log("debug buildNewAncestors motherSiblings for this node :", family.wife, motherSiblings);
                addSiblingsToNode(motherSiblings, ddata, family.wife, genealogicalParentId);
                addOtherSpouses(family.wife, family.husband, ddata);
                ddata.children.push({
                    id: family.wife,
                    name: mother.name,
                    generation: ddata.generation + 1,
                    children: [],
                    birthDate: mother.birthDate,
                    deathDate: mother.deathDate,
                    hasParents: true,
                    genealogicalParentId: genealogicalParentId
                });


            }
            return true;
        }
        return false;
    });
}


// Fonction utilitaire pour ajouter les siblings à un nœud
function addSiblingsToNode(siblings, node, parentId, genealogicalParentId) {


    // console.log("debug addSiblingsToNode for a sibling node =",node.id,node.name, ", genealogicalParentId=", genealogicalParentId, state.gedcomData.individuals[genealogicalParentId],  ", parentId =", parentId, state.gedcomData.individuals[parentId].name);


    siblings.forEach(siblingId => {
        const sibling = state.gedcomData.individuals[siblingId];
        node.children.push({
            id: siblingId,
            name: sibling.name,
            generation: node.generation + 1,
            isSibling: true,
            children: [],
            birthDate: sibling.birthDate,
            deathDate: sibling.deathDate,
            genealogicalParentId: genealogicalParentId,
            siblingReferenceId: parentId
        });
    });
}

// Fonction utilitaire pour ajouter les autres conjoints
function addOtherSpouses(personId, excludeSpouseId, node) {
    const person = state.gedcomData.individuals[personId];
    if (person.spouseFamilies) {
        person.spouseFamilies.forEach(spouseFamId => {
            const spouseFamily = state.gedcomData.families[spouseFamId];
            const spouseId = spouseFamily.husband === personId ? spouseFamily.wife : spouseFamily.husband;
            if (spouseId && spouseId !== excludeSpouseId) {
                const spouse = state.gedcomData.individuals[spouseId];
                node.children.push({
                    id: spouseId,
                    name: spouse.name,
                    generation: node.generation + 1,
                    isSpouse: true,
                    children: [],
                    birthDate: spouse.birthDate,
                    deathDate: spouse.deathDate
                });
            }
        });
    }
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