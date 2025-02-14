// ====================================
// Opérations sur l'arbre
// ====================================
import { state } from './main.js';

/**
 * Trouve tous les descendants d'une personne
 * @param {string} personId - ID de la personne
 * @param {Set} processed - Ensemble des IDs traités
 * @param {number} depth - Profondeur actuelle
 * @returns {Array} - Liste des descendants
 */
export function findDescendants(personId, processed = new Set(), depth = 0) {
    if (processed.has(personId)) return [];
    processed.add(personId);
    
    const person = state.gedcomData.individuals[personId];
    const descendants = [];

    if (person.spouseFamilies) {
        person.spouseFamilies.forEach(famId => {
            const family = state.gedcomData.families[famId];
            if (family && family.children) {
                family.children.forEach(childId => {
                    if (!processed.has(childId)) {
                        processChild(childId, depth, descendants, processed);
                    }
                });
            }
        });
    }
    
    return descendants;
}

/**
 * Traite un enfant et ses descendants
 * @private
 */
function processChild(childId, depth, descendants, processed) {
    const child = state.gedcomData.individuals[childId];
    descendants.push({
        id: childId,
        name: child.name,
        depth: depth + 1,
        type: 'child'
    });
    
    if (child.spouseFamilies) {
        child.spouseFamilies.forEach(childFamId => {
            const childFamily = state.gedcomData.families[childFamId];
            if (childFamily) {
                const spouseId = childFamily.husband === childId ? childFamily.wife : childFamily.husband;
                if (spouseId && !processed.has(spouseId)) {
                    const spouse = state.gedcomData.individuals[spouseId];
                    descendants.push({
                        id: spouseId,
                        name: spouse.name,
                        depth: depth + 1,
                        type: 'spouse'
                    });
                }
            }
        });
    }

    const childDescendants = findDescendants(childId, processed, depth + 1);
    descendants.push(...childDescendants);
}

/**
 * Recherche des frères et sœurs
 * @param {string} personId - ID de la personne
 * @param {Set} processed - Ensemble des IDs traités
 * @returns {Array} - Liste des frères et sœurs
 */
export function findSiblings(personId, processed = new Set()) {
    const siblings = [];
    const person = state.gedcomData.individuals[personId];
    
    person.families.forEach(famId => {
        const family = state.gedcomData.families[famId];
        if (family && family.children && family.children.includes(personId)) {
            family.children
                .filter(id => id !== personId && !processed.has(id))
                .forEach(siblingId => {
                    siblings.push(siblingId);
                });
        }
    });
    
    return siblings;
}



/**
 * Construit l'arbre des ancêtres
 * @param {string} personId - ID de la personne racine
 * @param {Set} processed - Ensemble des IDs traités
 * @param {number} generation - Génération actuelle
 * @param {Object} parentNode - Nœud parent
 * @param {number} maxGeneration - Nombre maximum de générations
 * @returns {Object} - L'arbre des ancêtres
 */
export function buildAncestorTree(personId, processed = new Set(), generation = 0, parentNode = null) {
    if (processed.has(personId) || generation >= state.nombre_generation) {
        return null;
    }
    
    const person = state.gedcomData.individuals[personId];
    const node = createBaseNode(person, personId, generation);
    
    const siblings = findSiblings(personId, processed, new Set());
    processed.add(personId);
    
    processSiblingsGenerationLevel(node, siblings, personId, person, processed, generation, parentNode);
    processFamiliesAsChild(node, person, processed, generation);
    
    return node;
}




/**
 * Construit l'arbre des descendants
 * @param {string} personId - ID de la personne racine
 * @param {Set} processed - Ensemble des IDs traités
 * @param {number} generation - Génération actuelle
 * @returns {Object} - L'arbre des descendants
 */
// export function buildDescendantTree(personId, processed = new Set(), generation = 0) {
//     if (processed.has(personId) || generation >= state.nombre_generation) {
//         return null;
//     }

//     const person = state.gedcomData.individuals[personId];
//     const node = {
//         id: personId,
//         name: person.name,
//         generation: generation,
//         children: [],
//         birthDate: person.birthDate,
//         deathDate: person.deathDate
//     };

//     processed.add(personId);

//     // Traiter tous les mariages de la personne
//     if (person.spouseFamilies) {
//         person.spouseFamilies.forEach(famId => {
//             const family = state.gedcomData.families[famId];
//             if (family && family.children) {
//                 // Ajouter le conjoint comme information
//                 const spouseId = family.husband === personId ? family.wife : family.husband;
//                 if (spouseId) {
//                     const spouse = state.gedcomData.individuals[spouseId];
//                     if (!node.spouses) node.spouses = [];
//                     node.spouses.push({
//                         id: spouseId,
//                         name: spouse.name,
//                         birthDate: spouse.birthDate,
//                         deathDate: spouse.deathDate
//                     });
//                 }

//                 // Traiter les enfants
//                 family.children.forEach(childId => {
//                     if (!processed.has(childId)) {
//                         const childNode = buildDescendantTree(childId, processed, generation + 1);
//                         if (childNode) {
//                             node.children.push(childNode);
//                         }
//                     }
//                 });
//             }
//         });
//     }

//     return node;
// }


/**
 * Construit l'arbre des descendants
 * @param {string} personId - ID de la personne racine
 * @param {Set} processed - Ensemble des IDs traités
 * @param {number} generation - Génération actuelle
 * @returns {Object} - L'arbre des descendants
 */
// export function buildDescendantTree(personId, processed = new Set(), generation = 0) {
//     // Vérifications initiales
//     if (!personId || !state.gedcomData || !state.gedcomData.individuals) {
//         console.log("Données manquantes:", { personId, gedcomData: !!state.gedcomData });
//         return null;
//     }

//     if (processed.has(personId) || generation >= state.nombre_generation) {
//         return null;
//     }

//     const person = state.gedcomData.individuals[personId];
//     if (!person) {
//         console.log("Personne non trouvée:", personId);
//         return null;
//     }

//     console.log("Construction arbre pour:", { 
//         id: personId, 
//         nom: person.name, 
//         generation: generation 
//     });

//     const node = {
//         id: personId,
//         name: person.name,
//         generation: generation,
//         children: [],
//         birthDate: person.birthDate,
//         deathDate: person.deathDate
//     };

//     processed.add(personId);

//     // Traiter tous les mariages de la personne
//     if (person.spouseFamilies) {
//         person.spouseFamilies.forEach(famId => {
//             const family = state.gedcomData.families[famId];
//             if (family && family.children) {
//                 // Ajouter le conjoint comme information
//                 const spouseId = family.husband === personId ? family.wife : family.husband;
//                 if (spouseId) {
//                     const spouse = state.gedcomData.individuals[spouseId];
//                     if (spouse) {
//                         if (!node.spouses) node.spouses = [];
//                         node.spouses.push({
//                             id: spouseId,
//                             name: spouse.name,
//                             birthDate: spouse.birthDate,
//                             deathDate: spouse.deathDate
//                         });
//                     }
//                 }

//                 // Traiter les enfants
//                 family.children.forEach(childId => {
//                     if (!processed.has(childId)) {
//                         const childNode = buildDescendantTree(childId, processed, generation + 1);
//                         if (childNode) {
//                             node.children.push(childNode);
//                         }
//                     }
//                 });
//             }
//         });
//     }

//     return node;
// }

/**
 * Construit l'arbre des descendants
 * @param {string} personId - ID de la personne racine
 * @param {Set} processed - Ensemble des IDs traités
 * @param {number} generation - Génération actuelle
 * @returns {Object} - L'arbre des descendants
 */
// export function buildDescendantTree(personId, processed = new Set(), generation = 0) {
//     if (processed.has(personId) || generation >= state.nombre_generation) {
//         return null;
//     }

//     const person = state.gedcomData.individuals[personId];
//     const node = {
//         id: personId,
//         name: person.name,
//         generation: generation,
//         children: [],
//         birthDate: person.birthDate,
//         deathDate: person.deathDate
//     };

//     processed.add(personId);

//     // Si la personne a des conjoints, on les ajoute comme des siblings spéciaux
//     if (person.spouseFamilies) {
//         node.siblings = [];
//         person.spouseFamilies.forEach(famId => {
//             const family = state.gedcomData.families[famId];
//             if (family) {
//                 const spouseId = family.husband === personId ? family.wife : family.husband;
//                 if (spouseId && !processed.has(spouseId)) {
//                     const spouse = state.gedcomData.individuals[spouseId];
//                     if (spouse) {
//                         node.siblings.push({
//                             id: spouseId,
//                             name: spouse.name,
//                             generation: generation,
//                             isSpouse: true,  // Flag spécial pour les spouses
//                             children: [],
//                             birthDate: spouse.birthDate,
//                             deathDate: spouse.deathDate,
//                             siblingReferenceId: personId  // Référence vers le conjoint
//                         });
//                     }
//                 }
//             }

//             // Traiter les enfants de cette famille
//             if (family && family.children) {
//                 family.children.forEach(childId => {
//                     if (!processed.has(childId)) {
//                         const childNode = buildDescendantTree(childId, processed, generation + 1);
//                         if (childNode) {
//                             node.children.push(childNode);
//                         }
//                     }
//                 });
//             }
//         });
//     }

//     return node;
// }

/**
 * Construit l'arbre des descendants
 * @param {string} personId - ID de la personne racine
 * @param {Set} processed - Ensemble des IDs traités
 * @param {number} generation - Génération actuelle
 * @returns {Object} - L'arbre des descendants
 */
// export function buildDescendantTree(personId, processed = new Set(), generation = 0) {
//     if (processed.has(personId) || generation >= state.nombre_generation) {
//         return null;
//     }

//     const person = state.gedcomData.individuals[personId];
//     const node = {
//         id: personId,
//         name: person.name,
//         generation: generation,
//         children: [],
//         birthDate: person.birthDate,
//         deathDate: person.deathDate
//     };

//     processed.add(personId);



//     // Traiter d'abord la spouse de la racine
//     if (generation === 0 && person.spouseFamilies) {
//         const rootSpouses = [];
//         person.spouseFamilies.forEach(famId => {
//             const family = state.gedcomData.families[famId];
//             if (family) {
//                 const spouseId = family.husband === personId ? family.wife : family.husband;
//                 if (spouseId && !processed.has(spouseId)) {
//                     const spouse = state.gedcomData.individuals[spouseId];
//                     if (spouse) {
//                         processed.add(spouseId);
//                         rootSpouses.push({
//                             id: spouseId,
//                             name: spouse.name,
//                             generation: generation,
//                             isSpouse: true,
//                             spouseOf: personId,
//                             children: [],
//                             birthDate: spouse.birthDate,
//                             deathDate: spouse.deathDate
//                         });
//                     }
//                 }
//             }
//         });
//         // Ajouter les spouses de la racine en premier
//         node.children.push(...rootSpouses);
//     }

//     // Collecter les enfants et leurs spouses
//     if (person.spouseFamilies) {
//         const childrenWithSpouses = [];

//         person.spouseFamilies.forEach(famId => {
//             const family = state.gedcomData.families[famId];
//             if (family) {
//                 // Traiter les enfants de cette famille
//                 if (family.children) {
//                     family.children.forEach(childId => {
//                         if (!processed.has(childId)) {
//                             const childNode = buildDescendantTree(childId, processed, generation + 1);
//                             if (childNode) {
//                                 // Chercher le spouse de cet enfant
//                                 let spouseNode = null;
//                                 const childPerson = state.gedcomData.individuals[childId];
//                                 if (childPerson.spouseFamilies) {
//                                     const spouseFam = state.gedcomData.families[childPerson.spouseFamilies[0]];
//                                     if (spouseFam) {
//                                         const spouseId = spouseFam.husband === childId ? spouseFam.wife : spouseFam.husband;
//                                         if (spouseId && !processed.has(spouseId)) {
//                                             const spouse = state.gedcomData.individuals[spouseId];
//                                             if (spouse) {
//                                                 processed.add(spouseId);
//                                                 spouseNode = {
//                                                     id: spouseId,
//                                                     name: spouse.name,
//                                                     generation: generation + 1,
//                                                     isSpouse: true,
//                                                     spouseOf: childId,
//                                                     children: [],
//                                                     birthDate: spouse.birthDate,
//                                                     deathDate: spouse.deathDate
//                                                 };
//                                             }
//                                         }
//                                     }
//                                 }
                                
//                                 // Ajouter l'enfant et son spouse comme une paire
//                                 childrenWithSpouses.push({
//                                     child: childNode,
//                                     spouse: spouseNode
//                                 });
//                             }
//                         }
//                     });
//                 }
//             }
//         });

//         // Maintenant, entrelacer les enfants et leurs spouses
//         childrenWithSpouses.forEach(pair => {
//             node.children.push(pair.child);
//             if (pair.spouse) {
//                 node.children.push(pair.spouse);
//             }
//         });
//     }

//     return node;
// }


export function buildDescendantTree(personId, processed = new Set(), generation = 0) {
    if (processed.has(personId) || generation >= state.nombre_generation) {
        return null;
    }

    const person = state.gedcomData.individuals[personId];
    const node = {
        id: personId,
        name: person.name,
        generation: generation,
        children: [],
        siblings: [],  // Pour stocker les spouses de la racine
        birthDate: person.birthDate,
        deathDate: person.deathDate
    };

    processed.add(personId);

    // Traiter la spouse de la racine comme un sibling spécial
    if (generation === 0 && person.spouseFamilies) {
        person.spouseFamilies.forEach(famId => {
            const family = state.gedcomData.families[famId];
            if (family) {
                const spouseId = family.husband === personId ? family.wife : family.husband;
                if (spouseId && !processed.has(spouseId)) {
                    const spouse = state.gedcomData.individuals[spouseId];
                    if (spouse) {
                        processed.add(spouseId);
                        node.siblings.push({
                            id: spouseId,
                            name: spouse.name,
                            generation: generation,
                            isSpouse: true,
                            spouseOf: personId,
                            siblingReferenceId: personId,
                            children: [],
                            birthDate: spouse.birthDate,
                            deathDate: spouse.deathDate
                        });
                    }
                }
            }
        });
    }

    // Collecter les enfants et leurs spouses
    if (person.spouseFamilies) {
        const childrenWithSpouses = [];

        person.spouseFamilies.forEach(famId => {
            const family = state.gedcomData.families[famId];
            if (family && family.children) {
                family.children.forEach(childId => {
                    if (!processed.has(childId)) {
                        const childNode = buildDescendantTree(childId, processed, generation + 1);
                        if (childNode) {
                            // Chercher le spouse de cet enfant
                            let spouseNode = null;
                            const childPerson = state.gedcomData.individuals[childId];
                            if (childPerson.spouseFamilies) {
                                const spouseFam = state.gedcomData.families[childPerson.spouseFamilies[0]];
                                if (spouseFam) {
                                    const spouseId = spouseFam.husband === childId ? spouseFam.wife : spouseFam.husband;
                                    if (spouseId && !processed.has(spouseId)) {
                                        const spouse = state.gedcomData.individuals[spouseId];
                                        if (spouse) {
                                            processed.add(spouseId);
                                            spouseNode = {
                                                id: spouseId,
                                                name: spouse.name,
                                                generation: generation + 1,
                                                isSpouse: true,
                                                spouseOf: childId,
                                                children: [],
                                                birthDate: spouse.birthDate,
                                                deathDate: spouse.deathDate
                                            };
                                        }
                                    }
                                }
                            }
                            
                            // Ajouter l'enfant et son spouse comme une paire
                            childrenWithSpouses.push({
                                child: childNode,
                                spouse: spouseNode
                            });
                        }
                    }
                });
            }
        });

        // Entrelacer les enfants et leurs spouses
        childrenWithSpouses.forEach(pair => {
            node.children.push(pair.child);
            if (pair.spouse) {
                node.children.push(pair.spouse);
            }
        });
    }

    return node;
}


/**
 * Crée le nœud de base pour une personne
 * @private
 */
function createBaseNode(person, personId, generation) {
    const familiesWithChildren = person.families.filter(famId => {
        const family = state.gedcomData.families[famId];
        return family && family.children;
    });
    const genealogicalParentId = findGenealogicalParent(personId, familiesWithChildren);
    return {
        id: personId,
        name: person.name,
        generation: generation,
        children: [],
        siblings: [],
        birthDate: person.birthDate,
        deathDate: person.deathDate,
        collapsed: false,
        _originalChildren: [],
        genealogicalParentId: genealogicalParentId
    };
}

/**
 * Traite le niveau de génération pour les siblings
 * @private
 */
function processSiblingsGenerationLevel(node, siblings, personId, person, processed, generation, parentNode) {
    const familiesWithChildren = person.families.filter(famId => {
        const family = state.gedcomData.families[famId];
        return family && family.children;
    });

    if (generation === 0) {
        processSiblingsAtRoot(node, personId, siblings, familiesWithChildren);
    } else if (parentNode) {
        processSiblingsAtNonRoot(siblings, personId, familiesWithChildren, parentNode, generation);
    }
}

/**
 * Traite les siblings au niveau racine
 * @private
 */
function processSiblingsAtRoot(node, personId, siblings, familiesWithChildren) {
    node.siblings = siblings.map(siblingId => {
        const siblingPerson = state.gedcomData.individuals[siblingId];
        const genealogicalParentId = findGenealogicalParent(siblingId, familiesWithChildren);
        
        return {
            id: siblingId,
            name: siblingPerson.name,
            generation: 0,
            isSibling: true,
            children: [],
            birthDate: siblingPerson.birthDate,
            deathDate: siblingPerson.deathDate,
            collapsed: false,
            _originalChildren: [],
            genealogicalParentId: genealogicalParentId,
            siblingReferenceId: personId
        };
    });
}

/**
 * Trouve le parent généalogique
 * @private
 */
export function findGenealogicalParent(siblingId, familiesWithChildren) {
    return familiesWithChildren.reduce((foundParent, famId) => {
        const family = state.gedcomData.families[famId];
        if (family.children.includes(siblingId)) {
            return family.husband || family.wife;
        }
        return foundParent;
    }, null);
}

/**
 * Traite les siblings aux niveaux non-racine
 * @private
 */
function processSiblingsAtNonRoot(siblings, personId, familiesWithChildren, parentNode, generation) {
    siblings.forEach(siblingId => {
        const siblingPerson = state.gedcomData.individuals[siblingId];
        const genealogicalParentId = findGenealogicalParent(siblingId, familiesWithChildren);

        // console.log("debug findGenealogicalParent processSiblingsAtNonRoot :", siblingId, siblingPerson, familiesWithChildren, personId, parentNode, generation, genealogicalParentId);

        parentNode.children.push({
            id: siblingId,
            name: siblingPerson.name,
            generation: generation,
            isSibling: true,
            children: [],
            birthDate: siblingPerson.birthDate,
            deathDate: siblingPerson.deathDate,
            collapsed: false,
            _originalChildren: [],
            genealogicalParentId: genealogicalParentId,
            siblingReferenceId: personId
        });
    });
}

/**
 * Traite les familles où la personne est un enfant
 * @private
 */
function processFamiliesAsChild(node, person, processed, generation) {
    const familiesAsChild = person.families.filter(famId => {
        const family = state.gedcomData.families[famId];
        return family && family.children && family.children.includes(person.id);
    });

    familiesAsChild.forEach(famId => {
        const family = state.gedcomData.families[famId];
        if (family) {
            processParents(family, node, processed, generation);
        }
    });
}

/**
 * Traite les parents d'une personne
 * @private
 */
export function processParents(family, node, processed, generation) {
    if (family.husband && !processed.has(family.husband)) {
        const father = buildAncestorTree(family.husband, processed, generation + 1, node);
        if (father) node.children.push(father);
    }
    if (family.wife && !processed.has(family.wife)) {
        const mother = buildAncestorTree(family.wife, processed, generation + 1, node);
        if (mother) node.children.push(mother);
    }
}