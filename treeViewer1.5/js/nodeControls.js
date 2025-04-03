// ====================================
// Contrôles et interactions
// ====================================
import { findDescendants, findSiblings, findGenealogicalParent, buildDescendantTree  } from './treeOperations.js';
import { extractYear } from './utils.js';
import { drawTree, getZoom, getLastTransform  } from './treeRenderer.js';
import { state, displayGenealogicTree } from './main.js';
import { updateSelectorValue, selectorHasOption } from './UIutils.js';
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

    // Mettre à jour le sélecteur de personnes racines
    const displayName = d.data.name.replace(/\//g, '').trim();
    updateSelectorValue('root-person-results', d.data.id, displayName, { replaceOptions: true });
    

    event.stopPropagation();
    displayGenealogicTree(d.data.id, true); 

    
    if (state.treeModeReal != 'both')
    {
        const svg = d3.select("#tree-svg");
        const height = window.innerHeight;
        const zoom = getZoom();
        
        if (zoom) {
            let transform = d3.zoomIdentity;
            if (state.treeModeReal  === 'descendants' || state.treeModeReal === 'directDescendants') {
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
    if (state.treeModeReal  === 'descendants' || state.treeModeReal === 'directDescendants') {
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
    
    if (state.treeModeReal  === 'descendants' || state.treeModeReal === 'directDescendants') {
        handleDescendants(d)
    } else {
        // Mode ascendant : comportement original
        if ((d.depth === 0) || (d.data.isSibling)) {
            handleRootDescendants(d);
            //handleDescendantsOnLeft(d);
        } else {
            handleNonRootDescendants(d);
        }
    }
}



// function handleDescendantsOnLeft(d) {
//     const { targetNode, targetId } = findTargetNode(d);
//     const childrenIds = findChildrenIds(targetId);

//     if ((!targetNode.data.children || targetNode.data.children.length === 0) && childrenIds.length > 0) {
//         // Créer les nœuds pour les descendants (enfants généalogiques)
//         const descendants = [];
        
//         childrenIds.forEach(childId => {
//             const child = state.gedcomData.individuals[childId];
            
//             // Créer le nœud enfant avec les bons attributs
//             const childNode = {
//                 id: childId,
//                 name: child.name,
//                 // Inverser la génération pour qu'il apparaisse à gauche
//                 generation: targetNode.data.generation - 1,
//                 birthDate: child.birthDate,
//                 deathDate: child.deathDate,
//                 // Attributs pour identifier la relation
//                 isDescendant: true,
//                 parentId: targetId,
//                 // Propriété vide pour les enfants (peut être remplie plus tard)
//                 children: []
//             };
            
//             descendants.push(childNode);
            
//             // Ajouter le conjoint si nécessaire (même logique que pour l'enfant)
//             if (state.treeModeReal !== 'directAncestors' && child.spouseFamilies) {
//                 child.spouseFamilies.forEach(spouseFamId => {
//                     const spouseFamily = state.gedcomData.families[spouseFamId];
//                     const spouseId = spouseFamily.husband === childId ? spouseFamily.wife : spouseFamily.husband;
                    
//                     if (spouseId) {
//                         const spouse = state.gedcomData.individuals[spouseId];
//                         descendants.push({
//                             id: spouseId,
//                             name: spouse.name,
//                             generation: targetNode.data.generation - 1,
//                             birthDate: spouse.birthDate,
//                             deathDate: spouse.deathDate,
//                             isDescendant: true,
//                             isSpouse: true,
//                             spouseOf: childId,
//                             parentId: targetId,
//                             children: []
//                         });
//                     }
//                 });
//             }
//         });
        
//         // Ajouter ces descendants comme enfants du nœud cible
//         targetNode.data.children = descendants;
        
//         // Copier vers le spouse si nécessaire
//         if (d.data.isSpouse) {
//             d.data.children = [...targetNode.data.children];
//         }
//     } else {
//         // Cacher les descendants
//         targetNode.data._originalChildren = targetNode.data.children;
//         targetNode.data.children = [];
        
//         if (d.data.isSpouse) {
//             d.data._originalChildren = d.data.children;
//             d.data.children = [];
//         }
//     }
    
//     // Redessiner l'arbre avec la structure modifiée
//     drawTree();
    
//     // Ajuster la vue si nécessaire
//     handleTreeLeftShift();
// }




// function handleDescendantsOnLeft(d) {
//     // Logs sur le nœud cliqué
//     console.log("=== NŒUD CLIQUÉ ===");
//     console.log("Nœud d:", d);
//     console.log("Type de d:", typeof d);
//     console.log("Propriétés de d:", Object.keys(d));
//     console.log("d.data:", d.data);
//     console.log("d.data.id:", d.data.id);
//     console.log("d.data.name:", d.data.name);
//     console.log("d.data.generation:", d.data.generation);
    
//     const { targetNode, targetId } = findTargetNode(d);
    
//     console.log("targetNode:", targetNode);
//     console.log("targetId:", targetId);
//     console.log("targetNode.data:", targetNode.data);
//     console.log("targetNode.data.generation:", targetNode.data.generation);
    
//     const childrenIds = findChildrenIds(targetId);
//     console.log("IDs des descendants:", childrenIds);

//     if ((!targetNode.data.children || targetNode.data.children.length === 0) && childrenIds.length > 0) {
//         console.log("Création de descendants pour le nœud cible");
        
//         // Créer les nœuds pour les descendants (enfants généalogiques)
//         const descendants = [];
        
//         childrenIds.forEach(childId => {
//             const child = state.gedcomData.individuals[childId];
//             console.log("Descendant trouvé:", childId, child.name);
            
//             // Créer le nœud enfant avec les bons attributs
//             const childNode = {
//                 id: childId,
//                 name: child.name,
//                 // Inverser la génération pour qu'il apparaisse à gauche
//                 generation: targetNode.data.generation - 1,
//                 birthDate: child.birthDate,
//                 deathDate: child.deathDate,
//                 // Attributs pour identifier la relation
//                 isDescendant: true,
//                 parentId: targetId,
//                 // Propriété vide pour les enfants (peut être remplie plus tard)
//                 children: []
//             };
            
//             console.log("=== NŒUD DESCENDANT CRÉÉ ===");
//             console.log("childNode:", childNode);
//             console.log("childNode.id:", childNode.id);
//             console.log("childNode.name:", childNode.name);
//             console.log("childNode.generation:", childNode.generation);
//             console.log("childNode.isDescendant:", childNode.isDescendant);
//             console.log("childNode.parentId:", childNode.parentId);
            
//             descendants.push(childNode);
            
//             // Ajouter le conjoint si nécessaire (même logique que pour l'enfant)
//             if (state.treeModeReal !== 'directAncestors' && child.spouseFamilies) {
//                 child.spouseFamilies.forEach(spouseFamId => {
//                     const spouseFamily = state.gedcomData.families[spouseFamId];
//                     const spouseId = spouseFamily.husband === childId ? spouseFamily.wife : spouseFamily.husband;
                    
//                     if (spouseId) {
//                         const spouse = state.gedcomData.individuals[spouseId];
//                         console.log("Conjoint du descendant trouvé:", spouseId, spouse.name);
                        
//                         const spouseNode = {
//                             id: spouseId,
//                             name: spouse.name,
//                             generation: targetNode.data.generation - 1,
//                             birthDate: spouse.birthDate,
//                             deathDate: spouse.deathDate,
//                             isDescendant: true,
//                             isSpouse: true,
//                             spouseOf: childId,
//                             parentId: targetId,
//                             children: []
//                         };
                        
//                         console.log("=== NŒUD CONJOINT CRÉÉ ===");
//                         console.log("spouseNode:", spouseNode);
//                         console.log("spouseNode.generation:", spouseNode.generation);
//                         console.log("spouseNode.isDescendant:", spouseNode.isDescendant);
//                         console.log("spouseNode.isSpouse:", spouseNode.isSpouse);
                        
//                         descendants.push(spouseNode);
//                     }
//                 });
//             }
//         });
        
//         console.log("Nombre total de descendants créés:", descendants.length);
        
//         // Ajouter ces descendants comme enfants du nœud cible
//         console.log("Avant modification - targetNode.data.children:", targetNode.data.children);
//         targetNode.data.children = descendants;
//         console.log("Après modification - targetNode.data.children:", targetNode.data.children);
        
//         // Copier vers le spouse si nécessaire
//         if (d.data.isSpouse) {
//             console.log("Le nœud cliqué est un conjoint, on copie aussi les descendants");
//             d.data.children = [...targetNode.data.children];
//         }
//     } else {
//         // Cacher les descendants
//         console.log("Masquage des descendants existants");
//         targetNode.data._originalChildren = targetNode.data.children;
//         targetNode.data.children = [];
        
//         if (d.data.isSpouse) {
//             d.data._originalChildren = d.data.children;
//             d.data.children = [];
//         }
//     }
    
//     // Logging de la structure finale
//     console.log("=== STRUCTURE FINALE ===");
//     console.log("targetNode après modification:", targetNode);
//     console.log("targetNode.data après modification:", targetNode.data);
//     console.log("targetNode.data.children après modification:", targetNode.data.children);
    
//     // Redessiner l'arbre avec la structure modifiée
//     console.log("Appel de drawTree()");
//     drawTree();
    
//     // Ajuster la vue si nécessaire
//     console.log("Appel de handleTreeLeftShift()");
//     handleTreeLeftShift();
// }



// function handleDescendantsOnLeft(d) {
//     // Obtenir des informations sur le nœud cliqué
//     console.log("=== NŒUD CLIQUÉ ===");
//     console.log("Nœud d:", d);
//     console.log("d.data:", d.data);
//     console.log("d.data.id:", d.data.id);
//     console.log("d.data.name:", d.data.name);
//     console.log("d.data.generation:", d.data.generation);
    
//     const targetId = d.data.id;
//     const childrenIds = findChildrenIds(targetId);
    
//     console.log("IDs des descendants:", childrenIds);
    
//     if (childrenIds.length === 0) {
//         console.log("Pas de descendants trouvés");
//         return;
//     }
    
//     // Créer une copie de l'arbre actuel pour le manipuler
//     const originalTree = JSON.parse(JSON.stringify(state.currentTree));
    
//     // Fonction pour trouver un nœud et son parent dans l'arbre
//     function findNodeAndParent(tree, id, parent = null, path = []) {
//         if (tree.id === id) {
//             return { node: tree, parent, path };
//         }
        
//         if (tree.children) {
//             for (let i = 0; i < tree.children.length; i++) {
//                 const newPath = [...path, i];
//                 const result = findNodeAndParent(tree.children[i], id, tree, newPath);
//                 if (result.node) {
//                     return result;
//                 }
//             }
//         }
        
//         return { node: null, parent: null, path: [] };
//     }
    
//     // Trouver le nœud cliqué dans l'arbre
//     const { node: nodeInTree, parent: parentInTree, path } = findNodeAndParent(originalTree, targetId);
    
//     if (!nodeInTree) {
//         console.log("Nœud non trouvé dans l'arbre:", targetId);
//         return;
//     }
    
//     console.log("Nœud trouvé dans l'arbre:", nodeInTree.id, nodeInTree.name);
    
//     // Créer le nœud descendant
//     const childId = childrenIds[0]; // Prenons le premier descendant pour simplifier
//     const child = state.gedcomData.individuals[childId];
    
//     if (!child) {
//         console.log("Descendant non trouvé:", childId);
//         return;
//     }
    
//     console.log("Descendant généalogique:", child.id, child.name);
    
//     // Créer le nœud descendant avec le nœud cliqué comme enfant
//     const descendantNode = {
//         id: childId,
//         name: child.name,
//         generation: nodeInTree.generation - 1, // Génération inférieure pour apparaître à gauche
//         birthDate: child.birthDate,
//         deathDate: child.deathDate,
//         isDescendant: true,
//         // La clé: mettre le nœud original comme enfant
//         children: [nodeInTree]
//     };
    
//     console.log("Nœud descendant créé:", descendantNode);
    
//     // Créer une fonction pour modifier l'arbre à un chemin spécifique
//     function modifyTreeAtPath(tree, path, newNode) {
//         if (path.length === 0) {
//             // Chemin vide = racine
//             return newNode;
//         }
        
//         let current = tree;
//         let parent = null;
        
//         // Suivre le chemin jusqu'à l'avant-dernier niveau
//         for (let i = 0; i < path.length - 1; i++) {
//             parent = current;
//             current = current.children[path[i]];
//         }
        
//         // Remplacer le nœud au dernier niveau
//         if (parent) {
//             parent.children[path[path.length - 1]] = newNode;
//         } else {
//             // Si le nœud est à un niveau peu profond
//             tree.children[path[0]] = newNode;
//         }
        
//         return tree;
//     }
    
//     // Modifier l'arbre
//     let updatedTree;
    
//     if (path.length === 0) {
//         // Le nœud cliqué est la racine
//         updatedTree = descendantNode;
//     } else {
//         // Le nœud est ailleurs dans l'arbre
//         updatedTree = modifyTreeAtPath(originalTree, path, descendantNode);
//     }
    
//     console.log("Arbre mis à jour:", updatedTree);
    
//     // Mettre à jour l'arbre actuel
//     state.currentTree = updatedTree;
    
//     // Redessiner l'arbre
//     console.log("Redessiner l'arbre");
//     drawTree();
    
//     // Ajuster la vue si nécessaire
//     console.log("Ajuster la vue");
//     handleTreeLeftShift();
// }






// function handleDescendantsOnLeft(d) {
//     // Afficher la structure complète avant modification
//     console.log("=== STRUCTURE D3.JS AVANT MODIFICATION ===");
//     console.log("Arbre actuel:", JSON.parse(JSON.stringify(state.currentTree)));
    
//     // Afficher tous les nœuds D3 avant modification
//     console.log("Nœuds D3 avant modification:");
//     d3.selectAll(".node").each(function(node) {
//         console.log({
//             id: node.data.id,
//             name: node.data.name,
//             generation: node.data.generation,
//             x: node.x,
//             y: node.y,
//             depth: node.depth,
//             parent: node.parent ? node.parent.data.id : null,
//             children: node.children ? node.children.map(c => c.data.id) : []
//         });
//     });
    
//     // Informations sur le nœud cliqué
//     console.log("=== NŒUD CLIQUÉ ===");
//     console.log("Nœud d:", d);
//     console.log("d.data:", d.data);
//     console.log("d.data.id:", d.data.id);
//     console.log("d.data.name:", d.data.name);
//     console.log("d.data.generation:", d.data.generation);
    
//     const targetId = d.data.id;
//     const childrenIds = findChildrenIds(targetId);
    
//     console.log("IDs des descendants:", childrenIds);
    
//     if (childrenIds.length === 0) {
//         console.log("Pas de descendants trouvés");
//         return;
//     }
    
//     // Créer une copie de l'arbre actuel
//     const originalTree = JSON.parse(JSON.stringify(state.currentTree));
    
//     // Fonction pour trouver un nœud et son parent dans l'arbre
//     function findNodeAndParent(tree, id, parent = null, path = []) {
//         if (tree.id === id) {
//             return { node: tree, parent, path };
//         }
        
//         if (tree.children) {
//             for (let i = 0; i < tree.children.length; i++) {
//                 const newPath = [...path, i];
//                 const result = findNodeAndParent(tree.children[i], id, tree, newPath);
//                 if (result.node) {
//                     return result;
//                 }
//             }
//         }
        
//         return { node: null, parent: null, path: [] };
//     }
    
//     // Trouver le nœud cliqué dans l'arbre
//     const { node: nodeInTree, parent: parentInTree, path } = findNodeAndParent(originalTree, targetId);
    
//     if (!nodeInTree) {
//         console.log("Nœud non trouvé dans l'arbre:", targetId);
//         return;
//     }
    
//     console.log("Nœud trouvé dans l'arbre:", nodeInTree);
//     console.log("Chemin dans l'arbre:", path);
//     console.log("Parent dans l'arbre:", parentInTree);
    
//     // Créer le nœud descendant
//     const childId = childrenIds[0]; // Premier descendant
//     const child = state.gedcomData.individuals[childId];
    
//     if (!child) {
//         console.log("Descendant non trouvé:", childId);
//         return;
//     }
    
//     console.log("Descendant généalogique:", child);
    
//     // IMPORTANT: Créer une copie profonde du nœud à modifier
//     // pour éviter les références circulaires
//     const nodeCopy = JSON.parse(JSON.stringify(nodeInTree));
    
//     // Créer le nœud descendant avec une copie du nœud cliqué comme enfant
//     const descendantNode = {
//         id: childId,
//         name: child.name,
//         generation: nodeCopy.generation - 1,
//         birthDate: child.birthDate,
//         deathDate: child.deathDate,
//         isDescendant: true,
//         children: [nodeCopy]
//     };
    
//     console.log("Nœud descendant créé:", descendantNode);
    
//     // Fonction pour modifier l'arbre à un chemin spécifique
//     function modifyTreeAtPath(tree, path, newNode) {
//         // Créer une copie de l'arbre pour éviter les modifications de l'original
//         const treeCopy = JSON.parse(JSON.stringify(tree));
        
//         if (path.length === 0) {
//             // Chemin vide = racine
//             return newNode;
//         }
        
//         let current = treeCopy;
//         let parent = null;
        
//         // Suivre le chemin jusqu'à l'avant-dernier niveau
//         for (let i = 0; i < path.length - 1; i++) {
//             parent = current;
//             current = current.children[path[i]];
//         }
        
//         // Remplacer le nœud au dernier niveau
//         if (parent) {
//             parent.children[path[path.length - 1]] = newNode;
//         } else {
//             // Si le nœud est un enfant direct de la racine
//             treeCopy.children[path[0]] = newNode;
//         }
        
//         return treeCopy;
//     }
    
//     // Modifier l'arbre
//     let updatedTree;
    
//     if (path.length === 0) {
//         // Le nœud cliqué est la racine
//         updatedTree = descendantNode;
//     } else {
//         // Le nœud est ailleurs dans l'arbre
//         updatedTree = modifyTreeAtPath(originalTree, path, descendantNode);
//     }
    
//     console.log("=== ARBRE APRÈS MODIFICATION ===");
//     console.log("Arbre mis à jour:", updatedTree);
    
//     // Mettre à jour l'arbre actuel
//     state.currentTree = updatedTree;
    
//     // Redessiner l'arbre
//     console.log("Redessiner l'arbre");
//     drawTree();
    
//     // Afficher la structure après modification
//     console.log("=== STRUCTURE D3.JS APRÈS MODIFICATION ===");
//     console.log("Nœuds D3 après modification:");
//     d3.selectAll(".node").each(function(node) {
//         console.log({
//             id: node.data.id,
//             name: node.data.name,
//             generation: node.data.generation,
//             x: node.x,
//             y: node.y,
//             depth: node.depth,
//             parent: node.parent ? node.parent.data.id : null,
//             children: node.children ? node.children.map(c => c.data.id) : []
//         });
//     });
    
//     // Identifier Joël et Robin dans l'arbre final
//     console.log("=== VÉRIFICATION DE LA DUPLICATION ===");
//     const joelNodes = [];
//     const robinNodes = [];
    
//     d3.selectAll(".node").each(function(node) {
//         if (node.data.id === targetId) {
//             joelNodes.push({
//                 x: node.x,
//                 y: node.y,
//                 depth: node.depth,
//                 parent: node.parent ? node.parent.data.id : null
//             });
//         }
//         if (node.data.id === childId) {
//             robinNodes.push({
//                 x: node.x,
//                 y: node.y,
//                 depth: node.depth,
//                 parent: node.parent ? node.parent.data.id : null
//             });
//         }
//     });
    
//     console.log(`Nombre d'instances de Joël (${targetId}):`, joelNodes.length);
//     console.log("Positions de Joël:", joelNodes);
//     console.log(`Nombre d'instances de Robin (${childId}):`, robinNodes.length);
//     console.log("Positions de Robin:", robinNodes);
    
//     // Ajuster la vue si nécessaire
//     handleTreeLeftShift();
// }






// function handleDescendantsOnLeft(d) {
//     console.log("=== NŒUD CLIQUÉ ===");
//     console.log("Nœud d:", d);
//     console.log("d.data:", d.data);
    
//     const targetId = d.data.id;
//     const childrenIds = findChildrenIds(targetId);
    
//     if (childrenIds.length === 0) {
//         console.log("Pas de descendants trouvés");
//         return;
//     }
    
//     // Cloner l'arbre actuel
//     const currentTreeCopy = JSON.parse(JSON.stringify(state.currentTree));
    
//     // Trouver le chemin vers le nœud cliqué
//     function findNodePath(node, targetId, path = []) {
//         if (node.id === targetId) {
//             return path;
//         }
        
//         if (node.children) {
//             for (let i = 0; i < node.children.length; i++) {
//                 const newPath = [...path, { node, index: i }];
//                 const result = findNodePath(node.children[i], targetId, newPath);
//                 if (result) {
//                     return result;
//                 }
//             }
//         }
        
//         return null;
//     }
    
//     const nodePath = findNodePath(currentTreeCopy, targetId);
    
//     if (!nodePath) {
//         console.log("Nœud non trouvé dans l'arbre");
//         return;
//     }
    
//     // Le dernier élément du chemin contient le parent direct
//     const parentNodeInfo = nodePath.length > 0 ? nodePath[nodePath.length - 1] : null;
    
//     // Créer le nœud pour le descendant
//     const childId = childrenIds[0]; // Premier descendant
//     const child = state.gedcomData.individuals[childId];
    
//     if (!child) {
//         console.log("Descendant non trouvé");
//         return;
//     }
    
//     // Créer le nouveau nœud descendant
//     const descendantNode = {
//         id: childId,
//         name: child.name,
//         generation: d.data.generation - 1, // Pour qu'il apparaisse à gauche
//         birthDate: child.birthDate,
//         deathDate: child.deathDate,
//         isDescendant: true,
//         children: [] // Pas d'enfants par défaut
//     };
    
//     // Ne pas modifier l'arbre original, mais créer un nouvel état temporaire
//     // où le nœud cliqué affiche son descendant à gauche
    
//     // Option 1: Si le nœud a déjà des "parents temporaires", les montrer/cacher
//     if (d.data._temporaryLeftChildren) {
//         // Si des enfants temporaires sont déjà affichés, les cacher
//         d.data._hiddenLeftChildren = d.data._temporaryLeftChildren;
//         d.data._temporaryLeftChildren = null;
//     } else {
//         // Sinon, créer des enfants temporaires à gauche
//         d.data._temporaryLeftChildren = [descendantNode];
//     }
    
//     // Redessiner l'arbre en tenant compte des enfants temporaires à gauche
//     function customDrawTree() {
//         // Créer une copie de l'arbre actuel pour la manipulation
//         const treeCopy = JSON.parse(JSON.stringify(state.currentTree));
        
//         // Parcourir tous les nœuds pour trouver ceux avec des enfants temporaires
//         function processNode(node) {
//             if (node._temporaryLeftChildren && node._temporaryLeftChildren.length > 0) {
//                 // Ajouter des métadonnées pour indiquer que ces enfants doivent être placés à gauche
//                 node._temporaryLeftChildren.forEach(child => {
//                     child._displayLeft = true;
//                     // Si besoin, ajouter un lien vers le parent
//                     child._parentId = node.id;
//                 });
                
//                 // Ajouter ces enfants à la liste principale des enfants
//                 if (!node.children) {
//                     node.children = [];
//                 }
//                 node.children = [...node._temporaryLeftChildren, ...node.children];
//             }
            
//             // Récursivement traiter tous les enfants
//             if (node.children) {
//                 node.children.forEach(processNode);
//             }
//         }
        
//         // Traiter l'arbre à partir de la racine
//         processNode(treeCopy);
        
//         // Utiliser cet arbre modifié pour le rendu
//         const originalTree = state.currentTree;
//         state.currentTree = treeCopy;
        
//         // Appeler la fonction drawTree d'origine
//         drawTree();
        
//         // Restaurer l'arbre original après le rendu
//         state.currentTree = originalTree;
        
//         // Ajuster les positions des nœuds après le rendu
//         d3.selectAll(".node").each(function(node) {
//             if (node.data._displayLeft) {
//                 // Modifier la position du nœud pour qu'il apparaisse à gauche
//                 const parentNode = d3.selectAll(".node").filter(n => n.data.id === node.data._parentId).node();
//                 if (parentNode) {
//                     const parentRect = parentNode.getBoundingClientRect();
//                     const nodeRect = this.getBoundingClientRect();
                    
//                     // Calculer la nouvelle position (à gauche du parent)
//                     const offsetX = parentRect.left - nodeRect.right - 50; // 50px de marge
                    
//                     // Appliquer la transformation
//                     d3.select(this)
//                         .attr("transform", `translate(${node.x + offsetX},${node.y})`);
                    
//                     // Ajuster également les liens
//                     d3.selectAll(".link")
//                         .filter(link => link.target === node)
//                         .attr("d", d => {
//                             const path = d3.path();
//                             path.moveTo(d.source.y, d.source.x);
//                             path.lineTo(d.target.y + offsetX, d.target.x);
//                             return path.toString();
//                         });
//                 }
//             }
//         });
//     }
    
//     // Utiliser cette fonction personnalisée au lieu de drawTree
//     customDrawTree();
    
//     // Ajuster la vue si nécessaire
//     handleTreeLeftShift();
// }





// function handleDescendantsOnLeft(d) {
//     // Logs de la structure initiale
//     console.log("=== STRUCTURE D3.JS AVANT MODIFICATION ===");
//     console.log("Arbre actuel:", JSON.parse(JSON.stringify(state.currentTree)));
    
//     // Logs des nœuds actuels avec positions
//     console.log("Nœuds D3 avant modification avec positions:");
//     const nodesBeforeModification = [];
//     d3.selectAll(".node").each(function(node) {
//         const nodeInfo = {
//             id: node.data.id,
//             name: node.data.name,
//             generation: node.data.generation,
//             x: node.x,
//             y: node.y,
//             depth: node.depth,
//             parent: node.parent ? node.parent.data.id : null,
//             parentGeneration: node.parent ? node.parent.data.generation : null,
//             children: node.children ? node.children.map(c => c.data.id) : []
//         };
//         nodesBeforeModification.push(nodeInfo);
//     });
//     console.log(nodesBeforeModification);
    
//     // Logs du nœud cliqué
//     console.log("=== NŒUD CLIQUÉ ===");
//     console.log("Nœud d:", d);
//     console.log("d.data:", d.data);
//     console.log("d.data.id:", d.data.id);
//     console.log("d.data.name:", d.data.name);
//     console.log("d.data.generation:", d.data.generation);
//     console.log("d.depth:", d.depth);
//     console.log("d.parent:", d.parent ? d.parent.data.id : null);
//     console.log("d.x:", d.x, "d.y:", d.y);
    
//     const targetId = d.data.id;
//     const childrenIds = findChildrenIds(targetId);
    
//     console.log("IDs des descendants:", childrenIds);
    
//     if (childrenIds.length === 0) {
//         console.log("Pas de descendants trouvés");
//         return;
//     }
    
//     // Créer le nœud pour le descendant
//     const childId = childrenIds[0]; // Premier descendant
//     const child = state.gedcomData.individuals[childId];
    
//     if (!child) {
//         console.log("Descendant non trouvé");
//         return;
//     }
    
//     console.log("=== DESCENDANT TROUVÉ ===");
//     console.log("Descendant:", child);
    
//     // Toggle pour afficher/masquer les descendants
//     if (d.data._temporaryLeftChildren) {
//         console.log("Masquage des descendants temporaires");
//         d.data._hiddenLeftChildren = d.data._temporaryLeftChildren;
//         d.data._temporaryLeftChildren = null;
//     } else {
//         console.log("Création des descendants temporaires");
        
//         // Créer le nouveau nœud descendant
//         const descendantNode = {
//             id: childId,
//             name: child.name,
//             generation: d.data.generation - 1, // Génération inférieure pour qu'il apparaisse à gauche
//             birthDate: child.birthDate,
//             deathDate: child.deathDate,
//             isDescendant: true,
//             _displayLeft: true, // Indicateur pour positionner à gauche
//             _parentId: targetId, // Référence au parent
//             children: [] // Pas d'enfants par défaut
//         };
        
//         console.log("Nœud descendant créé:", descendantNode);
        
//         d.data._temporaryLeftChildren = [descendantNode];
//     }
    
//     // Redessiner l'arbre avec une fonction personnalisée
//     customDrawTree();
    
//     // Logs après modification
//     console.log("=== STRUCTURE D3.JS APRÈS MODIFICATION ===");
//     console.log("Nœuds D3 après modification avec positions:");
//     const nodesAfterModification = [];
//     d3.selectAll(".node").each(function(node) {
//         const nodeInfo = {
//             id: node.data.id,
//             name: node.data.name,
//             generation: node.data.generation,
//             x: node.x,
//             y: node.y,
//             depth: node.depth,
//             parent: node.parent ? node.parent.data.id : null,
//             parentGeneration: node.parent ? node.parent.data.generation : null,
//             children: node.children ? node.children.map(c => c.data.id) : [],
//             _displayLeft: node.data._displayLeft,
//             _parentId: node.data._parentId
//         };
//         nodesAfterModification.push(nodeInfo);
//     });
//     console.log(nodesAfterModification);
    
//     // Vérification spécifique de Joël et Robin
//     console.log("=== VÉRIFICATION DES POSITIONS ===");
//     const joelNodes = nodesAfterModification.filter(node => node.id === targetId);
//     const robinNodes = nodesAfterModification.filter(node => node.id === childId);
    
//     console.log(`Nombre d'instances de Joël (${targetId}):`, joelNodes.length);
//     console.log("Positions de Joël:", joelNodes);
//     console.log(`Nombre d'instances de Robin (${childId}):`, robinNodes.length);
//     console.log("Positions de Robin:", robinNodes);
    
//     // Ajuster la vue si nécessaire
//     handleTreeLeftShift();
// }

















// Fonction pour dessiner l'arbre avec la gestion des nœuds à gauche
// function customDrawTree() {
//     console.log("=== DÉBUT DU RENDU PERSONNALISÉ ===");
    
//     // Créer une copie de l'arbre actuel pour la manipulation
//     const treeCopy = JSON.parse(JSON.stringify(state.currentTree));
    
//     // Fonction pour traiter chaque nœud et ajouter les enfants temporaires
//     function processNode(node) {
//         // Appliquer les modifications pour les nœuds avec des enfants temporaires à gauche
//         if (node._temporaryLeftChildren && node._temporaryLeftChildren.length > 0) {
//             console.log(`Nœud ${node.id} avec enfants temporaires:`, node._temporaryLeftChildren);
            
//             // Ajouter ces enfants à la liste principale
//             if (!node.children) {
//                 node.children = [];
//             }
            
//             // Ajouter au début pour qu'ils apparaissent en premier (gauche)
//             node.children = [...node._temporaryLeftChildren, ...node.children];
//         }
        
//         // Traiter récursivement tous les enfants
//         if (node.children) {
//             node.children.forEach(processNode);
//         }
//     }
    
//     // Traiter l'arbre à partir de la racine
//     processNode(treeCopy);
    
//     console.log("Arbre modifié pour le rendu:", treeCopy);
    
//     // Sauvegarder l'arbre original
//     const originalTree = state.currentTree;
    
//     // Remplacer temporairement par l'arbre modifié
//     state.currentTree = treeCopy;
    
//     // Appeler la fonction drawTree d'origine
//     drawTree();
    
//     // Restaurer l'arbre original
//     state.currentTree = originalTree;
    
//     console.log("=== AJUSTEMENT DES POSITIONS ===");
    
//     // Ajuster manuellement les positions des nœuds à afficher à gauche
//     d3.selectAll(".node").each(function(node) {
//         if (node.data._displayLeft) {
//             console.log(`Ajustement du nœud ${node.data.id} marqué pour affichage à gauche`);
//             console.log("Position actuelle:", {x: node.x, y: node.y});
            
//             // Trouver le nœud parent
//             const parentNode = d3.selectAll(".node")
//                 .filter(n => n.data.id === node.data._parentId)
//                 .node();
            
//             if (parentNode) {
//                 const parentD3 = d3.select(parentNode).datum();
//                 console.log("Parent trouvé:", {
//                     id: parentD3.data.id,
//                     x: parentD3.x,
//                     y: parentD3.y
//                 });
                
//                 // Calculer la nouvelle position
//                 // Placer à gauche du parent avec un écart horizontal
//                 const newX = parentD3.x; // Même alignement vertical
//                 const newY = parentD3.y - 200; // 200px à gauche
                
//                 console.log("Nouvelle position calculée:", {x: newX, y: newY});
                
//                 // Appliquer la transformation
//                 d3.select(this).attr("transform", `translate(${newY},${newX})`);
                
//                 // Créer un lien personnalisé
//                 const svgContainer = d3.select("#tree-svg");
                
//                 // Supprimer l'ancien lien si existe
//                 d3.selectAll(`.custom-link-${node.data.id}`).remove();
                
//                 // Créer un nouveau lien
//                 svgContainer.append("path")
//                     .attr("class", `link custom-link-${node.data.id}`)
//                     .attr("d", () => {
//                         const path = d3.path();
//                         path.moveTo(parentD3.y, parentD3.x); // Départ: parent
//                         path.lineTo(newY, newX);            // Arrivée: nœud descendant
//                         return path.toString();
//                     })
//                     .style("fill", "none")
//                     .style("stroke", "#555")
//                     .style("stroke-width", 1.5);
//             } else {
//                 console.log("Parent non trouvé pour l'ajustement");
//             }
//         }
//     });
    
//     console.log("=== FIN DU RENDU PERSONNALISÉ ===");
// }





// function handleDescendantsOnLeft(d) {
//     // Logs de la structure initiale
//     console.log("=== STRUCTURE D3.JS AVANT MODIFICATION ===");
//     console.log("Arbre actuel:", JSON.parse(JSON.stringify(state.currentTree)));
    
//     // Logs des nœuds actuels avec positions
//     console.log("Nœuds D3 avant modification avec positions:");
//     const nodesBeforeModification = [];
//     d3.selectAll(".node").each(function(node) {
//         const nodeInfo = {
//             id: node.data.id,
//             name: node.data.name,
//             generation: node.data.generation,
//             x: node.x,
//             y: node.y,
//             depth: node.depth,
//             parent: node.parent ? node.parent.data.id : null,
//             parentGeneration: node.parent ? node.parent.data.generation : null,
//             children: node.children ? node.children.map(c => c.data.id) : []
//         };
//         nodesBeforeModification.push(nodeInfo);
//     });
//     console.log(nodesBeforeModification);
    
//     // Logs du nœud cliqué
//     console.log("=== NŒUD CLIQUÉ ===");
//     console.log("Nœud d:", d);
//     console.log("d.data:", d.data);
//     console.log("d.data.id:", d.data.id);
//     console.log("d.data.name:", d.data.name);
//     console.log("d.data.generation:", d.data.generation);
//     console.log("d.depth:", d.depth);
//     console.log("d.parent:", d.parent ? d.parent.data.id : null);
//     console.log("d.x:", d.x, "d.y:", d.y);
    
//     const targetId = d.data.id;
//     const childrenIds = findChildrenIds(targetId);
    
//     console.log("IDs des descendants:", childrenIds);
    
//     if (childrenIds.length === 0) {
//         console.log("Pas de descendants trouvés");
//         return;
//     }
    
//     // Créer le nœud pour le descendant
//     const childId = childrenIds[0]; // Premier descendant
//     const child = state.gedcomData.individuals[childId];
    
//     if (!child) {
//         console.log("Descendant non trouvé");
//         return;
//     }
    
//     console.log("=== DESCENDANT TROUVÉ ===");
//     console.log("Descendant:", child);
    
//     // Toggle pour afficher/masquer les descendants
//     if (d.data._temporaryLeftChildren) {
//         console.log("Masquage des descendants temporaires");
//         d.data._hiddenLeftChildren = d.data._temporaryLeftChildren;
//         d.data._temporaryLeftChildren = null;
//     } else {
//         console.log("Création des descendants temporaires");
        
//         // Créer le nouveau nœud descendant
//         const descendantNode = {
//             id: childId,
//             name: child.name,
//             generation: d.data.generation - 1, // Génération inférieure pour qu'il apparaisse à gauche
//             birthDate: child.birthDate,
//             deathDate: child.deathDate,
//             isDescendant: true,
//             _displayLeft: true, // Indicateur pour positionner à gauche
//             _parentId: targetId, // Référence au parent
//             children: [] // Pas d'enfants par défaut
//         };
        
//         console.log("Nœud descendant créé:", descendantNode);
        
//         d.data._temporaryLeftChildren = [descendantNode];
//     }
    
//     // Redessiner l'arbre avec une fonction personnalisée
//     customDrawTree(targetId, childId);
    
//     // Logs après modification
//     console.log("=== STRUCTURE D3.JS APRÈS MODIFICATION ===");
//     console.log("Nœuds D3 après modification avec positions:");
//     const nodesAfterModification = [];
//     d3.selectAll(".node").each(function(node) {
//         const nodeInfo = {
//             id: node.data.id,
//             name: node.data.name,
//             generation: node.data.generation,
//             x: node.x,
//             y: node.y,
//             depth: node.depth,
//             parent: node.parent ? node.parent.data.id : null,
//             parentGeneration: node.parent ? node.parent.data.generation : null,
//             children: node.children ? node.children.map(c => c.data.id) : [],
//             _displayLeft: node.data._displayLeft,
//             _parentId: node.data._parentId
//         };
//         nodesAfterModification.push(nodeInfo);
//     });
//     console.log(nodesAfterModification);
    
//     // Vérification spécifique de Joël et Robin
//     console.log("=== VÉRIFICATION DES POSITIONS ===");
//     const joelNodes = nodesAfterModification.filter(node => node.id === targetId);
//     const robinNodes = nodesAfterModification.filter(node => node.id === childId);
    
//     console.log(`Nombre d'instances de Joël (${targetId}):`, joelNodes.length);
//     console.log("Positions de Joël:", joelNodes);
//     console.log(`Nombre d'instances de Robin (${childId}):`, robinNodes.length);
//     console.log("Positions de Robin:", robinNodes);
    
//     // Ajuster la vue si nécessaire
//     handleTreeLeftShift();
// }

// // Fonction pour dessiner l'arbre avec la gestion des nœuds à gauche
// function customDrawTree(parentId, childId) {
//     console.log("=== DÉBUT DU RENDU PERSONNALISÉ ===");
    
//     // Créer une copie de l'arbre actuel pour la manipulation
//     const treeCopy = JSON.parse(JSON.stringify(state.currentTree));
    
//     // Fonction pour traiter chaque nœud et ajouter les enfants temporaires
//     function processNode(node) {
//         // Appliquer les modifications pour les nœuds avec des enfants temporaires à gauche
//         if (node._temporaryLeftChildren && node._temporaryLeftChildren.length > 0) {
//             console.log(`Nœud ${node.id} avec enfants temporaires:`, node._temporaryLeftChildren);
            
//             // Ajouter ces enfants à la liste principale
//             if (!node.children) {
//                 node.children = [];
//             }
            
//             // Ajouter au début pour qu'ils apparaissent en premier (gauche)
//             node.children = [...node._temporaryLeftChildren, ...node.children];
//         }
        
//         // Traiter récursivement tous les enfants
//         if (node.children) {
//             node.children.forEach(processNode);
//         }
//     }
    
//     // Traiter l'arbre à partir de la racine
//     processNode(treeCopy);
    
//     console.log("Arbre modifié pour le rendu:", treeCopy);
    
//     // Sauvegarder l'arbre original
//     const originalTree = state.currentTree;
    
//     // Remplacer temporairement par l'arbre modifié
//     state.currentTree = treeCopy;
    
//     // Appeler la fonction drawTree d'origine
//     drawTree();
    
//     // Restaurer l'arbre original
//     state.currentTree = originalTree;
    
//     console.log("=== AJUSTEMENT DES POSITIONS ===");
    
//     // Créer un identifiant unique pour le lien sans caractères spéciaux
//     const uniqueLinkId = `custom-link-${Date.now()}`;
    
//     // Ajuster manuellement les positions des nœuds à afficher à gauche
//     let childNode = null;
//     let parentNode = null;
    
//     d3.selectAll(".node").each(function(node) {
//         if (node.data.id === childId) {
//             childNode = {
//                 element: this,
//                 data: node
//             };
//         }
//         if (node.data.id === parentId) {
//             parentNode = {
//                 element: this,
//                 data: node
//             };
//         }
//     });
    
//     if (childNode && parentNode) {
//         console.log("Nœuds parent et enfant trouvés");
        
//         // Obtenir les positions actuelles
//         const parentX = parentNode.data.x;
//         const parentY = parentNode.data.y;
        
//         // Calculer la nouvelle position pour l'enfant (à gauche du parent)
//         const newX = parentX;
//         const newY = parentY - 200; // 200px à gauche
        
//         console.log("Position parent:", {x: parentX, y: parentY});
//         console.log("Nouvelle position enfant:", {x: newX, y: newY});
        
//         // Appliquer la transformation
//         d3.select(childNode.element).attr("transform", `translate(${newY},${newX})`);
        
//         // Créer un lien personnalisé
//         const svgContainer = d3.select("#tree-svg");
        
//         // Supprimer tout lien personnalisé existant
//         d3.selectAll(`.${uniqueLinkId}`).remove();
        
//         // Créer un nouveau lien
//         svgContainer.append("path")
//             .attr("class", `link ${uniqueLinkId}`)
//             .attr("d", () => {
//                 const path = d3.path();
//                 path.moveTo(parentY, parentX); // Départ: parent
//                 path.lineTo(newY, newX);       // Arrivée: nœud descendant
//                 return path.toString();
//             })
//             .style("fill", "none")
//             .style("stroke", "#555")
//             .style("stroke-width", 1.5);
            
//         console.log("Lien personnalisé créé");
//     } else {
//         console.log("Parent ou enfant non trouvé pour l'ajustement", {
//             parentFound: !!parentNode,
//             childFound: !!childNode
//         });
//     }
    
//     console.log("=== FIN DU RENDU PERSONNALISÉ ===");
// }








// function handleDescendantsOnLeft(d) {
//     // Logs de la structure initiale
//     console.log("=== STRUCTURE D3.JS AVANT MODIFICATION ===");
//     console.log("Arbre actuel:", JSON.parse(JSON.stringify(state.currentTree)));
    
//     // Logs détaillés des nœuds actuels avec relations parent-enfant
//     console.log("Nœuds D3 avant modification avec détails des relations:");
//     const nodesBeforeModification = [];
//     d3.selectAll(".node").each(function(node) {
//         console.log(node);
        
//         const nodeInfo = {
//             id: node.data.id,
//             name: node.data.name,
//             generation: node.data.generation,
//             x: node.x,
//             y: node.y,
//             depth: node.depth,
//             parent: node.parent ? node.parent.data.id : null,
//             parent_name: node.parent ? node.parent.data.name : null,
//             children: node.children ? node.children.map(c => ({id: c.data.id, name: c.data.name})) : []
//         };
//         nodesBeforeModification.push(nodeInfo);
//     });
//     console.table(nodesBeforeModification); // Utilisation de console.table pour une meilleure lisibilité
    
//     // Logs du nœud cliqué
//     console.log("=== NŒUD CLIQUÉ ===");
//     console.log("Nœud d:", d);
//     console.log("d.data:", d.data);
//     console.log("d.data.id:", d.data.id);
//     console.log("d.data.name:", d.data.name);
//     console.log("d.data.generation:", d.data.generation);
//     console.log("d.depth:", d.depth);
//     if (d.parent) {
//         console.log("d.parent.data.id:", d.parent.data.id);
//         console.log("d.parent.data.name:", d.parent.data.name);
//     } else {
//         console.log("d.parent: null");
//     }
//     console.log("d.x:", d.x, "d.y:", d.y);
    
//     const targetId = d.data.id;
//     const childrenIds = findChildrenIds(targetId);
    
//     console.log("IDs des descendants généalogiques:", childrenIds);
    
//     if (childrenIds.length === 0) {
//         console.log("Pas de descendants trouvés");
//         return;
//     }
    
//     // Créer le nœud pour le descendant
//     const childId = childrenIds[0]; // Premier descendant
//     const child = state.gedcomData.individuals[childId];
    
//     if (!child) {
//         console.log("Descendant non trouvé");
//         return;
//     }
    
//     console.log("=== DESCENDANT TROUVÉ ===");
//     console.log("Descendant:", child);
    
//     // Option 1: Créer une copie complète de l'arbre et modifier la structure
//     const treeCopy = JSON.parse(JSON.stringify(state.currentTree));
    
//     // Fonction pour trouver un nœud et son chemin dans l'arbre
//     function findNodeInTree(tree, id, path = []) {
//         if (tree.id === id) {
//             return { node: tree, path };
//         }
        
//         if (tree.children) {
//             for (let i = 0; i < tree.children.length; i++) {
//                 const result = findNodeInTree(tree.children[i], id, [...path, { parent: tree, index: i }]);
//                 if (result.node) {
//                     return result;
//                 }
//             }
//         }
        
//         return { node: null, path: [] };
//     }
    
//     // Trouver le nœud cliqué dans l'arbre
//     const { node: targetNode, path } = findNodeInTree(treeCopy, targetId);
    
//     if (!targetNode) {
//         console.log("Nœud cible non trouvé dans l'arbre");
//         return;
//     }
    
//     console.log("Nœud cible trouvé:", targetNode);
//     console.log("Chemin dans l'arbre:", path);
    
//     // Créer le nouveau nœud descendant
//     const descendantNode = {
//         id: childId,
//         name: child.name,
//         generation: targetNode.generation - 1, // Une génération au-dessus
//         birthDate: child.birthDate,
//         deathDate: child.deathDate,
//         // IMPORTANT: Le nœud cliqué (Joël) doit être un enfant de Robin
//         children: [targetNode]
//     };
    
//     console.log("Nœud descendant créé:", descendantNode);
    
//     // Remplacer le nœud cible par le descendant dans l'arbre
//     if (path.length > 0) {
//         const lastStep = path[path.length - 1];
//         const parentNode = lastStep.parent;
//         const index = lastStep.index;
        
//         // Retirer le nœud cible de son parent
//         parentNode.children[index] = descendantNode;
        
//         console.log("Nœud cible remplacé dans l'arbre");
//     } else {
//         // Le nœud cible est la racine
//         console.log("Le nœud cible est la racine - remplacement de l'arbre entier");
//         treeCopy = descendantNode;
//     }
    
//     // Sauvegarder l'arbre original
//     const originalTree = state.currentTree;
    
//     // Remplacer par l'arbre modifié
//     state.currentTree = treeCopy;
    
//     // Dessiner l'arbre
//     console.log("Dessin de l'arbre avec la nouvelle structure");
//     drawTree();
    
//     // Logs détaillés après modification
//     console.log("=== STRUCTURE D3.JS APRÈS MODIFICATION ===");
//     console.log("Nœuds D3 après modification avec détails des relations:");
//     const nodesAfterModification = [];
//     d3.selectAll(".node").each(function(node) {
//         const nodeInfo = {
//             id: node.data.id,
//             name: node.data.name,
//             generation: node.data.generation,
//             x: node.x,
//             y: node.y,
//             depth: node.depth,
//             parent: node.parent ? node.parent.data.id : null,
//             parent_name: node.parent ? node.parent.data.name : null,
//             children: node.children ? node.children.map(c => ({id: c.data.id, name: c.data.name})) : []
//         };
//         nodesAfterModification.push(nodeInfo);
//     });
//     console.table(nodesAfterModification);
    
//     // Vérification spécifique de Joël et Robin
//     console.log("=== VÉRIFICATION DES RELATIONS PARENT-ENFANT ===");
//     const joelNode = nodesAfterModification.find(n => n.id === targetId);
//     const robinNode = nodesAfterModification.find(n => n.id === childId);
    
//     console.log("Joël:", joelNode);
//     console.log("Robin:", robinNode);
//     console.log("Joël est-il enfant de Robin?", joelNode && joelNode.parent === childId);
//     console.log("Robin est-il parent?", robinNode && robinNode.children.some(c => c.id === targetId));
    
//     // Restaurer l'arbre original après le rendu si nécessaire
//     // state.currentTree = originalTree;
    
//     // Ajuster la vue si nécessaire
//     handleTreeLeftShift();
// }











// function handleDescendantsOnLeft(d) {
//     // Vérifier si le nœud a des descendants généalogiques
//     const nodeId = d.data.id;
//     const descendantsIds = findChildrenIds(nodeId);
    
//     if (descendantsIds.length === 0) {
//         console.log("Pas de descendants généalogiques trouvés");
//         return;
//     }
    
//     // Toggle pour afficher/masquer
//     if (!d.data._showingLeftDescendant) {
//         // Ajouter le descendant
//         const descendantId = descendantsIds[0]; // Premier descendant
//         const descendant = state.gedcomData.individuals[descendantId];
        
//         if (!descendant) return;
        
//         // Modifier la structure de l'arbre
//         modifyTreeStructure(d, descendantId, descendant);
//         d.data._showingLeftDescendant = true;
//     } else {
//         // Restaurer la structure originale
//         restoreTreeStructure(d);
//         d.data._showingLeftDescendant = false;
//     }
    
//     // Redessiner l'arbre
//     drawTree();
// }

// function modifyTreeStructure(node, descendantId, descendantData) {
//     // 1. Sauvegarder la structure originale
//     saveOriginalState(node);
    
//     // 2. Créer le nœud descendant
//     const descendantNode = {
//         id: descendantId,
//         name: descendantData.name,
//         generation: node.data.generation - 1, // Une génération au-dessus
//         birthDate: descendantData.birthDate || "",
//         deathDate: descendantData.deathDate || "",
//         isLeftDescendant: true
//     };
    
//     // 3. Trouver le nœud racine
//     const rootNode = findRootNode(state.currentTree);
    
//     // 4. Ajouter le descendant comme enfant direct de la racine
//     if (!rootNode.children) rootNode.children = [];
//     rootNode.children.push(descendantNode);
    
//     // 5. Ajouter une référence du nœud original vers le descendant
//     node.data.parentId = descendantId;
//     node.data._descendantId = descendantId;
// }

// function restoreTreeStructure(node) {
//     // 1. Récupérer l'ID du descendant
//     const descendantId = node.data._descendantId;
//     if (!descendantId) return;
    
//     // 2. Trouver le nœud racine
//     const rootNode = findRootNode(state.currentTree);
    
//     // 3. Supprimer le descendant des enfants de la racine
//     if (rootNode.children) {
//         const index = rootNode.children.findIndex(child => child.id === descendantId);
//         if (index !== -1) rootNode.children.splice(index, 1);
//     }
    
//     // 4. Restaurer l'état original du nœud
//     restoreOriginalState(node);
// }

// function saveOriginalState(node) {
//     // Sauvegarder l'état original du nœud
//     node.data._originalParentId = node.data.parentId;
//     node.data._originalState = JSON.parse(JSON.stringify(node.data));
// }

// function restoreOriginalState(node) {
//     // Restaurer les propriétés importantes
//     if (node.data._originalParentId !== undefined) {
//         node.data.parentId = node.data._originalParentId;
//     }
    
//     // Nettoyer les références temporaires
//     delete node.data._descendantId;
//     delete node.data._originalParentId;
//     delete node.data._originalState;
// }

// function findRootNode(tree) {
//     // Si l'arbre est déjà la racine
//     if (tree.generation === 0) return tree;
    
//     // Recherche récursive
//     function findRoot(node) {
//         if (node.generation === 0) return node;
        
//         if (node.children) {
//             for (const child of node.children) {
//                 const root = findRoot(child);
//                 if (root) return root;
//             }
//         }
        
//         return null;
//     }
    
//     return findRoot(tree);
// }





function handleDescendantsOnLeft(d) {
    // Logs de la structure initiale
    console.log("=== STRUCTURE DE L'ARBRE AVANT MODIFICATION ===");
    console.log("State.currentTree:", JSON.parse(JSON.stringify(state.currentTree)));
    
    // Logs des nœuds D3.js actuels
    console.log("Nœuds D3.js avant modification:");
    const nodesBeforeModification = [];
    d3.selectAll(".node").each(function(node) {
        const nodeInfo = {
            id: node.data.id,
            name: node.data.name,
            generation: node.data.generation,
            x: node.x,
            y: node.y,
            depth: node.depth,
            parent: node.parent ? node.parent.data.id : null,
            parent_name: node.parent ? node.parent.data.name : null,
            children: node.children ? node.children.map(c => ({id: c.data.id, name: c.data.name})) : []
        };
        nodesBeforeModification.push(nodeInfo);
    });
    console.table(nodesBeforeModification);
    
    // Vérifier si le nœud a des descendants généalogiques
    const nodeId = d.data.id;
    console.log("Nœud cliqué:", nodeId, d.data.name);
    console.log("Données complètes du nœud:", d.data);
    console.log("Parent du nœud:", d.parent ? d.parent.data.id : "aucun");
    
    const descendantsIds = findChildrenIds(nodeId);
    console.log("Descendants généalogiques trouvés:", descendantsIds);
    
    if (descendantsIds.length === 0) {
        console.log("Pas de descendants généalogiques trouvés");
        return;
    }
    
    // Toggle pour afficher/masquer
    if (!d.data._showingLeftDescendant) {
        // Ajouter le descendant
        const descendantId = descendantsIds[0]; // Premier descendant
        const descendant = state.gedcomData.individuals[descendantId];
        
        if (!descendant) {
            console.log("Descendant non trouvé dans gedcomData");
            return;
        }
        
        console.log("Descendant à ajouter:", descendantId, descendant.name);
        console.log("Données complètes du descendant:", descendant);
        
        // Modifier la structure de l'arbre
        modifyTreeStructure(d, descendantId, descendant);
        d.data._showingLeftDescendant = true;
    } else {
        // Restaurer la structure originale
        console.log("Restauration de la structure originale");
        restoreTreeStructure(d);
        d.data._showingLeftDescendant = false;
    }
    
    // Redessiner l'arbre
    console.log("Redessinage de l'arbre");
    drawTree();
    
    // Logs après modification
    console.log("=== STRUCTURE DE L'ARBRE APRÈS MODIFICATION ===");
    console.log("State.currentTree:", JSON.parse(JSON.stringify(state.currentTree)));
    
    // Logs des nœuds D3.js après modification
    console.log("Nœuds D3.js après modification:");
    const nodesAfterModification = [];
    d3.selectAll(".node").each(function(node) {
        const nodeInfo = {
            id: node.data.id,
            name: node.data.name,
            generation: node.data.generation,
            x: node.x,
            y: node.y,
            depth: node.depth,
            parent: node.parent ? node.parent.data.id : null,
            parent_name: node.parent ? node.parent.data.name : null,
            children: node.children ? node.children.map(c => ({id: c.data.id, name: c.data.name})) : []
        };
        nodesAfterModification.push(nodeInfo);
    });
    console.table(nodesAfterModification);
    
    // Vérification spécifique du nœud et de son descendant
    console.log("=== VÉRIFICATION DES RELATIONS APRÈS MODIFICATION ===");
    const originalNodeAfter = nodesAfterModification.find(n => n.id === nodeId);
    const descendantNodeAfter = nodesAfterModification.find(n => n.id === d.data._descendantId);
    
    console.log("Nœud original après:", originalNodeAfter);
    console.log("Nœud descendant après:", descendantNodeAfter);
    
    if (originalNodeAfter && descendantNodeAfter) {
        console.log("Le descendant est-il parent du nœud original?", originalNodeAfter.parent === descendantNodeAfter.id);
        console.log("Le nœud original est-il enfant du descendant?", 
            descendantNodeAfter.children.some(child => child.id === nodeId));
    }
}

// function modifyTreeStructure(node, descendantId, descendantData) {
//     // 1. Sauvegarder la structure originale
//     console.log("Sauvegarde de l'état original du nœud");
//     saveOriginalState(node);
    
//     // 2. Créer le nœud descendant
//     const descendantNode = {
//         id: descendantId,
//         name: descendantData.name,
//         generation: node.data.generation - 1, // Une génération au-dessus
//         birthDate: descendantData.birthDate || "",
//         deathDate: descendantData.deathDate || "",
//         isLeftDescendant: true
//     };
    
//     console.log("Nœud descendant créé:", descendantNode);
    
//     // 3. Trouver le nœud racine
//     const rootNode = findRootNode(state.currentTree);
//     console.log("Nœud racine trouvé:", rootNode ? rootNode.id : "non trouvé");
    
//     // 4. Ajouter le descendant comme enfant direct de la racine
//     if (!rootNode.children) rootNode.children = [];
//     rootNode.children.push(descendantNode);
//     console.log("Descendant ajouté aux enfants de la racine");
    
//     // 5. Ajouter une référence du nœud original vers le descendant
//     node.data.parentId = descendantId;
//     node.data._descendantId = descendantId;
//     console.log("Références ajoutées au nœud original:", {
//         parentId: node.data.parentId,
//         _descendantId: node.data._descendantId
//     });
// }

// function modifyTreeStructure(node, descendantId, descendantData) {
//     // 1. Sauvegarder la structure originale
//     console.log("Sauvegarde de l'état original du nœud");
//     saveOriginalState(node);
    
//     // 2. Créer le nœud descendant
//     const descendantNode = {
//         id: descendantId,
//         name: descendantData.name,
//         generation: node.data.generation - 1, // Une génération au-dessus
//         birthDate: descendantData.birthDate || "",
//         deathDate: descendantData.deathDate || "",
//         isLeftDescendant: true
//     };
    
//     console.log("Nœud descendant créé:", descendantNode);
    
//     // 3. Trouver le nœud racine
//     const rootNode = findRootNode(state.currentTree);
//     console.log("Nœud racine trouvé:", rootNode ? rootNode.id : "non trouvé");
    
//     // 4. Ajouter le descendant comme enfant direct de la racine
//     if (!rootNode.children) rootNode.children = [];
//     rootNode.children.push(descendantNode);
//     console.log("Descendant ajouté aux enfants de la racine");
    
//     // 5. Remplacer l'attribut parent du nœud cliqué par l'ID du descendant
//     if (node.parent) {
//         // Sauvegarder l'ID du parent original pour pouvoir le restaurer plus tard
//         node.data._originalParentId = node.parent.data.id;
        
//         // Modifier le parent pour pointer vers le descendant
//         node.parent = { 
//             data: { 
//                 id: descendantId, 
//                 name: descendantData.name 
//             } 
//         };
        
//         console.log("Parent du nœud modifié:", node.parent.data.id);
//     }
    
//     // 6. Ajouter une référence du nœud original vers le descendant
//     node.data._descendantId = descendantId;
//     console.log("Référence au descendant ajoutée:", node.data._descendantId);
// }

// function modifyTreeStructure(node, descendantId, descendantData) {
//     // 1. Sauvegarder la structure originale
//     console.log("Sauvegarde de l'état original du nœud");
//     saveOriginalState(node);
    
//     // 2. Créer le nœud descendant
//     const descendantNode = {
//         id: descendantId,
//         name: descendantData.name,
//         generation: node.data.generation - 1, // Une génération au-dessus
//         birthDate: descendantData.birthDate || "",
//         deathDate: descendantData.deathDate || "",
//         isLeftDescendant: true
//     };
    
//     console.log("Nœud descendant créé:", descendantNode);
    
//     // 3. Trouver le nœud racine
//     const rootNode = findRootNode(state.currentTree);
//     console.log("Nœud racine trouvé:", rootNode ? rootNode.id : "non trouvé");
    
//     // 4. Ajouter le descendant comme enfant direct de la racine
//     if (!rootNode.children) rootNode.children = [];
//     rootNode.children.push(descendantNode);
//     console.log("Descendant ajouté aux enfants de la racine");
    
//     // 5. NOUVEAU: Modifier l'attribut parentId dans les données brutes
//     function findNodeInRawData(tree, targetId) {
//         if (tree.id === targetId) {
//             return tree;
//         }
        
//         if (tree.children) {
//             for (let i = 0; i < tree.children.length; i++) {
//                 const found = findNodeInRawData(tree.children[i], targetId);
//                 if (found) return found;
//             }
//         }
        
//         return null;
//     }
    
//     // Trouver le nœud cliqué dans les données brutes
//     const nodeInRawData = findNodeInRawData(state.currentTree, node.data.id);
    
//     if (nodeInRawData) {
//         // Sauvegarder l'ancien parent ID
//         nodeInRawData._originalParentId = nodeInRawData.parentId;
        
//         // Modifier l'attribut parentId dans les données brutes
//         nodeInRawData.parentId = descendantId;
        
//         console.log("Parent ID modifié dans les données brutes de", 
//                    nodeInRawData._originalParentId, "à", nodeInRawData.parentId);
//     } else {
//         console.log("Nœud non trouvé dans les données brutes");
//     }
    
//     // 6. Également modifier l'attribut parent de l'objet D3 (au cas où)
//     if (node.parent) {
//         node.data._originalParentId = node.parent.data.id;
//         node.parent = { 
//             data: { 
//                 id: descendantId, 
//                 name: descendantData.name 
//             } 
//         };
//         console.log("Parent du nœud D3 modifié:", node.parent.data.id);
//     }
    
//     // 7. Ajouter une référence du nœud original vers le descendant
//     node.data._descendantId = descendantId;
//     console.log("Référence au descendant ajoutée:", node.data._descendantId);
// }


// function modifyTreeStructure(node, descendantId, descendantData) {
//     // Afficher l'état du nœud avant modification
//     console.log("État du nœud AVANT modification:", {
//         id: node.data.id,
//         name: node.data.name,
//         parentId: node.data.parentId,
//         parent: node.parent ? node.parent.data.id : "aucun"
//     });

//     // 1. Créer le nœud descendant
//     const descendantNode = {
//         id: descendantId,
//         name: descendantData.name,
//         generation: node.data.generation - 1,
//         birthDate: descendantData.birthDate || "",
//         deathDate: descendantData.deathDate || "",
//         isLeftDescendant: true
//     };
    
//     // 2. Trouver le nœud racine
//     const rootNode = findRootNode(state.currentTree);
    
//     // 3. Ajouter le descendant aux enfants de la racine
//     if (!rootNode.children) rootNode.children = [];
//     rootNode.children.push(descendantNode);
    
//     // 4. MODIFICATION CLÉ - Changer directement la propriété dans l'objet data
//     console.log("MODIFICATION du parentId de", node.data.id);

//     // Sauvegarder l'ancien parentId
//     node.data._originalParentId = node.data.parentId;
    
//     // Définir le nouveau parentId
//     node.data.parentId = descendantId;
    
//     console.log("État du nœud APRÈS modification:", {
//         id: node.data.id,
//         name: node.data.name,
//         parentId: node.data.parentId,  // Devrait être changé à descendantId
//         _originalParentId: node.data._originalParentId  // L'ancienne valeur
//     });
    
//     // 5. Sauvegarder l'ID du descendant pour la suppression
//     node.data._descendantId = descendantId;

//     // Forcer une mise à jour explicite des données
//     if (typeof node._dataUpdated === 'function') {
//         node._dataUpdated();
//     }
// }


// function modifyTreeStructure(node, descendantId, descendantData) {
//     // Afficher l'état du nœud avant modification
//     console.log("État du nœud AVANT modification:", {
//         id: node.data.id,
//         name: node.data.name,
//         parentId: node.data.parentId,
//         parent: node.parent ? node.parent.data.id : "aucun"
//     });

//     // 1. Créer le nœud descendant
//     const descendantNode = {
//         id: descendantId,
//         name: descendantData.name,
//         generation: node.data.generation - 1,
//         birthDate: descendantData.birthDate || "",
//         deathDate: descendantData.deathDate || "",
//         isLeftDescendant: true,
//         children: [] // Important: initialiser avec un tableau vide
//     };
    
//     // 2. Trouver le nœud racine
//     const rootNode = findRootNode(state.currentTree);
    
//     // 3. Ajouter le descendant aux enfants de la racine
//     if (!rootNode.children) rootNode.children = [];
//     rootNode.children.push(descendantNode);
    
//     // 4. MODIFICATION CLÉ: Trouver le parent actuel de Joël et retirer Joël de ses enfants
//     function findNodeAndParent(tree, targetId, parent = null) {
//         if (tree.id === targetId) {
//             return { node: tree, parent };
//         }
        
//         if (tree.children) {
//             for (let i = 0; i < tree.children.length; i++) {
//                 const result = findNodeAndParent(tree.children[i], targetId, tree);
//                 if (result.node) {
//                     result.index = i;
//                     return result;
//                 }
//             }
//         }
        
//         return { node: null, parent: null };
//     }
    
//     // Trouver Joël et son parent
//     const { node: nodeInTree, parent: parentInTree, index } = 
//         findNodeAndParent(state.currentTree, node.data.id);
    
//     if (nodeInTree && parentInTree) {
//         console.log("Nœud trouvé dans l'arbre avec parent:", parentInTree.id);
        
//         // Sauvegarder la référence au parent original pour la restauration
//         node.data._originalParent = {
//             id: parentInTree.id,
//             index: index
//         };
        
//         // Retirer Joël des enfants de son parent actuel
//         parentInTree.children.splice(index, 1);
//         console.log("Nœud retiré des enfants de:", parentInTree.id);
        
//         // 5. Ajouter Joël comme enfant du nouveau nœud descendant
//         const descendantInTree = rootNode.children.find(child => child.id === descendantId);
//         if (descendantInTree) {
//             if (!descendantInTree.children) descendantInTree.children = [];
//             descendantInTree.children.push(nodeInTree);
//             console.log("Nœud ajouté comme enfant de:", descendantId);
//         }
//     }
    
//     // 6. Mise à jour supplémentaire de parentId pour être complet
//     node.data.parentId = descendantId;
//     node.data._descendantId = descendantId;
    
//     console.log("État du nœud APRÈS modification:", {
//         id: node.data.id,
//         name: node.data.name,
//         parentId: node.data.parentId,
//         _originalParent: node.data._originalParent
//     });
// }

// function restoreTreeStructure(node) {
//     // 1. Récupérer l'ID du descendant
//     const descendantId = node.data._descendantId;
//     if (!descendantId) {
//         console.log("Pas de référence de descendant à supprimer");
//         return;
//     }
    
//     console.log("ID du descendant à supprimer:", descendantId);
    
//     // 2. Trouver le nœud racine
//     const rootNode = findRootNode(state.currentTree);
//     console.log("Nœud racine pour suppression:", rootNode ? rootNode.id : "non trouvé");
    
//     // 3. Supprimer le descendant des enfants de la racine
//     if (rootNode.children) {
//         const index = rootNode.children.findIndex(child => child.id === descendantId);
//         if (index !== -1) {
//             rootNode.children.splice(index, 1);
//             console.log("Descendant supprimé des enfants de la racine à l'index:", index);
//         } else {
//             console.log("Descendant non trouvé dans les enfants de la racine");
//         }
//     }
    
//     // 4. Restaurer l'état original du nœud
//     console.log("Restauration de l'état original du nœud");
//     restoreOriginalState(node);
// }

// function modifyTreeStructure(node, descendantId, descendantData) {
//     // Afficher l'état du nœud avant modification
//     console.log("État du nœud AVANT modification:", {
//         id: node.data.id,
//         name: node.data.name
//     });

//     // 1. Créer une copie des données du nœud original pour l'utiliser avec le descendant
//     const nodeCopy = JSON.parse(JSON.stringify(node.data));
    
//     // 2. Créer le nœud descendant
//     const descendantNode = {
//         id: descendantId,
//         name: descendantData.name,
//         generation: node.data.generation - 1,
//         birthDate: descendantData.birthDate || "",
//         deathDate: descendantData.deathDate || "",
//         isLeftDescendant: true,
//         children: [nodeCopy] // Ajouter la copie du nœud comme enfant
//     };
    
//     // 3. Trouver le nœud racine
//     const rootNode = findRootNode(state.currentTree);
    
//     // 4. Ajouter le descendant aux enfants de la racine
//     if (!rootNode.children) rootNode.children = [];
//     rootNode.children.push(descendantNode);
    
//     // 5. Sauvegarder une référence au descendant et à l'état original
//     node.data._descendantId = descendantId;
//     node.data._originalTree = JSON.parse(JSON.stringify(state.currentTree));
    
//     console.log("Descendant ajouté avec le nœud comme enfant");
//     console.log("État sauvegardé pour restauration ultérieure");
// }






function modifyTreeStructure(node, descendantId, descendantData) {
    // Afficher l'état du nœud avant modification
    console.log("État du nœud AVANT modification:", {
        id: node.data.id,
        name: node.data.name
    });

    // 1. Créer le nœud descendant avec une copie du nœud comme enfant
    const descendantNode = {
        id: descendantId,
        name: descendantData.name,
        generation: node.data.generation - 1,
        birthDate: descendantData.birthDate || "",
        deathDate: descendantData.deathDate || "",
        isLeftDescendant: true,
        children: [] // Pas d'enfants pour l'instant
    };
    
    // 2. Trouver le nœud cible et son parent dans l'arbre
    function findNodeAndParent(tree, targetId, parent = null) {
        if (tree.id === targetId) {
            return { node: tree, parent };
        }
        
        if (tree.children) {
            for (let i = 0; i < tree.children.length; i++) {
                const result = findNodeAndParent(tree.children[i], targetId, tree);
                if (result.node) {
                    result.index = i;
                    return result;
                }
            }
        }
        
        return { node: null, parent: null };
    }
    
    // Trouver Joël et son parent dans l'arbre
    const { node: nodeInTree, parent: parentInTree, index } = 
        findNodeAndParent(state.currentTree, node.data.id);
    
    if (nodeInTree && parentInTree) {
        console.log("Nœud trouvé dans l'arbre, parent:", parentInTree.id);
        
        // 3. Sauvegarder l'état original pour restauration
        node.data._originalParent = {
            id: parentInTree.id,
            index: index
        };
        
        // 4. Supprimer Joël des enfants de Léa
        const joelNode = parentInTree.children.splice(index, 1)[0];
        console.log("Nœud supprimé des enfants de:", parentInTree.id);
        
        // 5. Ajouter Joël comme enfant de Robin
        descendantNode.children.push(joelNode);
        console.log("Nœud ajouté comme enfant de:", descendantId);
    }
    
    // 6. Ajouter Robin comme enfant de la racine
    const rootNode = findRootNode(state.currentTree);
    if (!rootNode.children) rootNode.children = [];
    rootNode.children.push(descendantNode);
    
    // 7. Sauvegarder la référence au descendant
    node.data._descendantId = descendantId;
    
    console.log("État APRÈS modification");
}








function restoreTreeStructure(node) {
    // Si nous avons une copie de l'arbre original, l'utiliser
    if (node.data._originalTree) {
        console.log("Restauration de l'arbre à partir de la sauvegarde");
        state.currentTree = node.data._originalTree;
        delete node.data._originalTree;
        delete node.data._descendantId;
    } else {
        console.log("Pas de sauvegarde trouvée pour la restauration");
    }
}






function saveOriginalState(node) {
    // Sauvegarder l'état original du nœud
    node.data._originalParentId = node.data.parentId;
    node.data._originalState = JSON.parse(JSON.stringify(node.data));
    
    console.log("État original sauvegardé:", {
        _originalParentId: node.data._originalParentId,
        _originalState: node.data._originalState
    });
}

function restoreOriginalState(node) {
    // Restaurer les propriétés importantes
    console.log("État avant restauration:", {
        parentId: node.data.parentId,
        _originalParentId: node.data._originalParentId
    });
    
    if (node.data._originalParentId !== undefined) {
        node.data.parentId = node.data._originalParentId;
        console.log("ParentId restauré à:", node.data.parentId);
    }
    
    // Nettoyer les références temporaires
    delete node.data._descendantId;
    delete node.data._originalParentId;
    delete node.data._originalState;
    
    console.log("Références temporaires nettoyées");
}

function findRootNode(tree) {
    console.log("Recherche du nœud racine dans:", tree);
    
    // Si l'arbre est déjà la racine
    if (tree.generation === 0) {
        console.log("Arbre déjà au niveau racine");
        return tree;
    }
    
    // Recherche récursive
    function findRoot(node) {
        if (node.generation === 0) {
            console.log("Nœud racine trouvé:", node.id, node.name);
            return node;
        }
        
        if (node.children) {
            for (const child of node.children) {
                const root = findRoot(child);
                if (root) return root;
            }
        }
        
        return null;
    }
    
    const rootNode = findRoot(tree);
    console.log("Résultat de la recherche racine:", rootNode ? rootNode.id : "non trouvé");
    return rootNode;
}









export function handleDescendants(d)
{
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
            if (state.treeModeReal === 'descendants') {
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
}


/**
 * Ajuste la vue si des nœuds apparaissent trop à gauche
 */
// function handleTreeLeftShift() {
//     const svg = d3.select("#tree-svg");
//     const lastTransform = getLastTransform() || d3.zoomIdentity;
//     const zoom = getZoom();
    
//     // Trouver les nœuds du niveau le plus à gauche
//     const nodes = d3.selectAll(".node").nodes();
//     const leftmostNode = nodes.reduce((leftmost, node) => {
//         const rect = node.getBoundingClientRect();
//         if (!leftmost || rect.left < leftmost.left) {
//             return rect;
//         }
//         return leftmost;
//     }, null);

//     if (leftmostNode) {
//         const margin = 100;
        
//         if (leftmostNode.left < margin) {
//             const shiftAmount = state.boxWidth * 1.3;
            
//             if (zoom) {
//                 svg.transition()
//                     .duration(750)
//                     .call(zoom.transform, 
//                         lastTransform.translate(shiftAmount, 0)
//                     );
//             }
//         }
//     }
// }



// Dans nodeControls.js, modifiez handleTreeLeftShift() pour ajouter un petit délai en mode animation
function handleTreeLeftShift() {    
    // Utiliser setTimeout pour s'assurer que l'arbre est complètement rendu
    setTimeout(() => {
        applyTreeLeftShift();
    }, 100);
}

// Fonction auxiliaire qui contient la logique actuelle
function applyTreeLeftShift() {
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
        console.log("Position gauche:", leftmostNode.left, "Marge:", margin);
        
        if (leftmostNode.left < margin) {
            const shiftAmount = state.boxWidth * 1.3;
            console.log("Décalage vers la droite de:", shiftAmount);
            
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

        // Mettre à jour le sélecteur de générations
        updateSelectorValue('generations', newGenerations.toString());

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
    const displayName = newRootPerson.name.replace(/\//g, '').trim();
    
    // Mettre à jour le sélecteur de personnes racines
    updateSelectorValue('root-person-results', descendant.id, displayName, { replaceOptions: true });

    displayGenealogicTree(descendant.id);
}


/**
 * Ajoute les contrôles pour les ancêtres
 * @param {Object} nodeGroups - Les groupes de nœuds
 */
export function addAncestorsControls(nodeGroups) {
    if (state.treeModeReal  === 'descendants' || state.treeModeReal  === 'directDescendants'  ) return;
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
    updateSelectorValue('generations', value.toString());
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
    console.log("Clicked node data:", d.data);
    let newAncestorsAdded = false;

    if (d.data.isSibling) {
        const siblingsReference = d.parent.data.children.filter(child => 
            child.id == d.data.siblingReferenceId && child !== d.data
        );
        console.log("Before handling normal ancestors:", d.data.children);
        newAncestorsAdded = handleSiblingAncestors(siblingsReference);
    } else {
        console.log("Before handling normal ancestors:", d.data.children);
        newAncestorsAdded = handleNormalAncestors(d.data);
        console.log("After handling normal ancestors:", d.data.children);
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
// function buildNewAncestors(ddata) {
//     const person = state.gedcomData.individuals[ddata.id];
//     ddata.children = [];
   

//     // console.log("debug buildNewAncestors for this node :",ddata.id,ddata.name);

//     person.families.some(famId => {
//         const family = state.gedcomData.families[famId];
//         if (family) {
//             // Ajouter les parents directement
//             if (family.husband) {
//                 const father = state.gedcomData.individuals[family.husband];
//                 const familiesWithChildren = state.gedcomData.individuals[family.husband].families.filter(famId => {
//                     const family = state.gedcomData.families[famId];
//                     return family && family.children;
//                 });
//                 const genealogicalParentId = findGenealogicalParent(family.husband, familiesWithChildren);
//                 const fatherSiblings = findSiblings(family.husband);
//                 // console.log("debug buildNewAncestors fatherSiblings for this node :", family.husband,father.id, father.name, genealogicalParentId).
//                 addSiblingsToNode(fatherSiblings, ddata, family.husband, genealogicalParentId);
//                 addOtherSpouses(family.husband, family.wife, ddata);
//                 ddata.children.push({
//                     id: family.husband,
//                     name: father.name,
//                     generation: ddata.generation + 1,
//                     children: [],
//                     birthDate: father.birthDate,
//                     deathDate: father.deathDate,
//                     hasParents: true,
//                     genealogicalParentId: genealogicalParentId
//                 });


//             }

//             if (family.wife) {
//                 const mother = state.gedcomData.individuals[family.wife];
//                 const familiesWithChildren = state.gedcomData.individuals[family.wife].families.filter(famId => {
//                     const family = state.gedcomData.families[famId];
//                     return family && family.children;
//                 });
//                 const genealogicalParentId = findGenealogicalParent(family.wife, familiesWithChildren);
//                 const motherSiblings = findSiblings(family.wife);
//                 // console.log("debug buildNewAncestors motherSiblings for this node :", family.wife, motherSiblings);
//                 addSiblingsToNode(motherSiblings, ddata, family.wife, genealogicalParentId);
//                 addOtherSpouses(family.wife, family.husband, ddata);
//                 ddata.children.push({
//                     id: family.wife,
//                     name: mother.name,
//                     generation: ddata.generation + 1,
//                     children: [],
//                     birthDate: mother.birthDate,
//                     deathDate: mother.deathDate,
//                     hasParents: true,
//                     genealogicalParentId: genealogicalParentId
//                 });


//             }
//             return true;
//         }
//         return false;
//     });
// }


function buildNewAncestors(ddata) {
    const person = state.gedcomData.individuals[ddata.id];
    ddata.children = [];
   
    // IMPORTANT: Filtrer pour ne traiter que les familles où la personne est un enfant
    // et non un parent (conjoint)
    const familiesAsChild = person.families.filter(famId => {
        const family = state.gedcomData.families[famId];
        return family && 
               family.children && 
               family.children.includes(person.id) &&
               family.husband !== person.id && 
               family.wife !== person.id;
    });
    
    // Utiliser familiesAsChild au lieu de person.families
    familiesAsChild.forEach(famId => {
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
                if (state.treeModeReal === 'ancestors') {
                    const fatherSiblings = findSiblings(family.husband);
                    addSiblingsToNode(fatherSiblings, ddata, family.husband, genealogicalParentId);
                    addOtherSpouses(family.husband, family.wife, ddata);
                }
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

            // Faire de même pour la mère (wife)
            if (family.wife) {
                const mother = state.gedcomData.individuals[family.wife];
                const familiesWithChildren = state.gedcomData.individuals[family.wife].families.filter(famId => {
                    const family = state.gedcomData.families[famId];
                    return family && family.children;
                });
                const genealogicalParentId = findGenealogicalParent(family.wife, familiesWithChildren);
                if (state.treeModeReal === 'ancestors') {
                    const motherSiblings = findSiblings(family.wife);
                    // console.log("debug buildNewAncestors motherSiblings for this node :", family.wife, motherSiblings);
                    addSiblingsToNode(motherSiblings, ddata, family.wife, genealogicalParentId);
                    addOtherSpouses(family.wife, family.husband, ddata);
                }
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
        }
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