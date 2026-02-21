// ====================================
// Opérations sur l'arbre
// ====================================
import { importLinks } from './importState.js'; // import de  nodeControls via importLinks pour éviter les erreurs de chargement circulaire
import { state } from './main.js';
// import { findClosestDescendant  } from './nodeControls.js';
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
    
    if (state.treeModeReal === 'ancestors') {
        const siblings = findSiblings(personId, processed, new Set());
        processed.add(personId);   
        processSiblingsGenerationLevel(node, siblings, personId, person, processed, generation, parentNode);
    }
    processFamiliesAsChild(node, person, processed, generation);
    
    return node;
}




export function buildDescendantTree(personId, processed = new Set(), generation = 0, duplicatesInfo = null) {
    // Au premier appel, initialiser duplicatesInfo
    if (!duplicatesInfo) {
        duplicatesInfo = findInterBranchMarriages(personId);
    }

    if (processed.has(personId) && !duplicatesInfo.has(personId)) {
        return null;
    }

    if (generation >= state.nombre_generation) {
        return null;
    }

    const person = state.gedcomData.individuals[personId];
    if (!person) return null;

    // Créer le nœud pour la personne courante
    const node = {
        id: personId,
        name: person.name,
        generation: generation,
        children: [],
        birthDate: person.birthDate,
        deathDate: person.deathDate,
        sex: person.sex,
        duplicate: processed.has(personId), // Marquer comme duplicate si déjà traité
        mainBranch: 1,
    };

    processed.add(personId);

    // Traiter les conjoints de la racine de manière spéciale
    if (generation === 0 && person.spouseFamilies) {
        node.spouses = [];
        person.spouseFamilies.forEach(famId => {
            const family = state.gedcomData.families[famId];
            if (family) {
                const spouseId = family.husband === personId ? family.wife : family.husband;
                if (spouseId) {
                    const spouse = state.gedcomData.individuals[spouseId];
                    if (spouse) {
                        node.spouses.push({
                            id: spouseId,
                            name: spouse.name,
                            birthDate: spouse.birthDate,
                            deathDate: spouse.deathDate,
                            sex: spouse.sex,
                            mainBranch: 120,
                        });
                    }
                }
            }
        });
    }

    // Collecter les enfants et leurs conjoints
    if (person.spouseFamilies) {
        const childrenWithSpouses = [];

        person.spouseFamilies.forEach(famId => {
            const family = state.gedcomData.families[famId];
            if (family && family.children) {
                family.children.forEach(childId => {
                    const childNode = buildDescendantTree(childId, processed, generation + 1, duplicatesInfo);
                    
                    if (childNode) {
                        const childPerson = state.gedcomData.individuals[childId];
                        let spouseNode = null;

                        if (state.treeModeReal === 'descendants') {
                            if (childPerson.spouseFamilies) {
                                const spouseFam = state.gedcomData.families[childPerson.spouseFamilies[0]];
                                if (spouseFam) {
                                    const spouseId = spouseFam.husband === childId ? spouseFam.wife : spouseFam.husband;
                                    if (spouseId) {
                                        const spouse = state.gedcomData.individuals[spouseId];
                                        if (spouse) {
                                            spouseNode = {
                                                id: spouseId,
                                                name: spouse.name,
                                                generation: generation + 1,
                                                isSpouse: true,
                                                spouseOf: childId,
                                                children: [],
                                                birthDate: spouse.birthDate,
                                                deathDate: spouse.deathDate,
                                                sex: spouse.sex,
                                                duplicate: processed.has(spouseId),
                                                mainBranch: 70,
                                            };
                                        }
                                    }
                                }
                            }
                        }

                        childrenWithSpouses.push({
                            child: childNode,
                            spouse: spouseNode
                        });
                    }
                });
            }
        });

        // Entrelacer les enfants et leurs conjoints
        childrenWithSpouses.forEach(pair => {
            node.children.push(pair.child);
            if (pair.spouse) {
                node.children.push(pair.spouse);
            }
        });
    }

    return node;
}





export function buildDescendantTreeWithDuplicates(personId, allowDuplicates = false, processed = new Set(), generation = 0, duplicatesInfo = null) {
    // Au premier appel, initialiser duplicatesInfo
    if (!duplicatesInfo) {
        duplicatesInfo = findInterBranchMarriages(personId);
    }

    if (!allowDuplicates && processed.has(personId) && !duplicatesInfo.has(personId)) {
        return null;
    }

    if (generation >= state.nombre_generation) {
        return null;
    }

    const person = state.gedcomData.individuals[personId];
    if (!person) return null;

    // Créer le nœud pour la personne courante
    const node = {
        id: personId,
        name: person.name,
        generation: generation,
        children: [],
        birthDate: person.birthDate,
        deathDate: person.deathDate,
        sex: person.sex,
        duplicate: processed.has(personId), // Marquer comme duplicate si déjà traité
        mainBranch: 1,
    };

    processed.add(personId);

    // Traiter les conjoints de la racine de manière spéciale
    if (generation === 0 && person.spouseFamilies) {
        node.spouses = [];
        person.spouseFamilies.forEach(famId => {
            const family = state.gedcomData.families[famId];
            if (family) {
                const spouseId = family.husband === personId ? family.wife : family.husband;
                if (spouseId) {
                    const spouse = state.gedcomData.individuals[spouseId];
                    if (spouse) {
                        node.spouses.push({
                            id: spouseId,
                            name: spouse.name,
                            birthDate: spouse.birthDate,
                            deathDate: spouse.deathDate,
                            sex: spouse.sex,
                            mainBranch: 120,
                        });
                    }
                }
            }
        });
    }

    // Collecter les enfants et leurs conjoints
    if (person.spouseFamilies) {
        const childrenWithSpouses = [];

        person.spouseFamilies.forEach(famId => {
            const family = state.gedcomData.families[famId];
            if (family && family.children) {
                family.children.forEach(childId => {
                    const childNode = buildDescendantTreeWithDuplicates(childId, allowDuplicates, processed, generation + 1, duplicatesInfo);
                    
                    if (childNode) {
                        const childPerson = state.gedcomData.individuals[childId];
                        let spouseNode = null;

                        if (state.treeModeReal === 'descendants') {
                            if (childPerson.spouseFamilies) {
                                const spouseFam = state.gedcomData.families[childPerson.spouseFamilies[0]];
                                if (spouseFam) {
                                    const spouseId = spouseFam.husband === childId ? spouseFam.wife : spouseFam.husband;
                                    if (spouseId) {
                                        const spouse = state.gedcomData.individuals[spouseId];
                                        if (spouse) {
                                            spouseNode = {
                                                id: spouseId,
                                                name: spouse.name,
                                                generation: generation + 1,
                                                isSpouse: true,
                                                spouseOf: childId,
                                                children: [],
                                                birthDate: spouse.birthDate,
                                                deathDate: spouse.deathDate,
                                                sex: spouse.sex,
                                                duplicate: processed.has(spouseId),
                                                mainBranch: 70,
                                            };
                                        }
                                    }
                                }
                            }
                        }

                        childrenWithSpouses.push({
                            child: childNode,
                            spouse: spouseNode
                        });
                    }
                });
            }
        });

        // Entrelacer les enfants et leurs conjoints
        childrenWithSpouses.forEach(pair => {
            node.children.push(pair.child);
            if (pair.spouse) {
                node.children.push(pair.spouse);
            }
        });
    }

    return node;
}












//Fonction utilitaire pour trouver les mariages entre branches
function findInterBranchMarriages(rootId) {
    const duplicatesSet = new Set();
    const allDescendants = new Map(); // Map<personId, branchId>
    
    // Trouver tous les descendants et leur branche d'origine
    function mapDescendants(personId, branchId, processed = new Set()) {
        if (processed.has(personId)) return;
        processed.add(personId);

        const person = state.gedcomData.individuals[personId];
        if (!person) return;

        // Enregistrer dans quelle branche cette personne apparaît
        if (!allDescendants.has(personId)) {
            allDescendants.set(personId, branchId);
        }

        // Parcourir les enfants
        if (person.spouseFamilies) {
            person.spouseFamilies.forEach(famId => {
                const family = state.gedcomData.families[famId];
                if (family && family.children) {
                    family.children.forEach(childId => {
                        mapDescendants(childId, branchId, processed);
                    });
                }
            });
        }
    }

    // Commencer le mapping avec la racine
    const rootPerson = state.gedcomData.individuals[rootId];
    if (rootPerson && rootPerson.spouseFamilies) {
        // Cartographier chaque branche principale
        rootPerson.spouseFamilies.forEach(famId => {
            const family = state.gedcomData.families[famId];
            if (family && family.children) {
                family.children.forEach((childId, index) => {
                    mapDescendants(childId, index, new Set());
                });
            }
        });
    }

    // Maintenant chercher les mariages entre branches
    allDescendants.forEach((branchId, personId) => {
        const person = state.gedcomData.individuals[personId];
        if (person && person.spouseFamilies) {
            person.spouseFamilies.forEach(famId => {
                const family = state.gedcomData.families[famId];
                if (family) {
                    const spouseId = family.husband === personId ? family.wife : family.husband;
                    if (spouseId && allDescendants.has(spouseId)) {
                        const spouseBranchId = allDescendants.get(spouseId);
                        if (spouseBranchId !== branchId) {
                            // Mariage entre branches trouvé !
                            duplicatesSet.add(personId);
                            duplicatesSet.add(spouseId);
                        }
                    }
                }
            });
        }
    });

    return duplicatesSet;
}


export function buildCombinedTree(personId) {
    // Find closest descendant first
    const descendants = findDescendants(personId);
    const closestDescendant = importLinks.nodeControls.findClosestDescendant(descendants, personId);
    const targetId = closestDescendant ? closestDescendant.id : personId;

    // Si pas de descendant proche, retourner un arbre d'ascendants
    if (!closestDescendant) {
        state.treeModeReal = 'ancestors';
        return buildAncestorTree(personId, new Set(), 0);
    }

    state.treeModeReal = 'both';
    // Build both trees
    const descendantsTree = buildDescendantTree(personId, new Set(), 0);
    const ancestorsTree = buildAncestorTree(targetId, new Set(), 0);
    
    const rootPerson = state.gedcomData.individuals[personId];
    
    return {
        id: personId,
        name: rootPerson.name,
        birthDate: rootPerson.birthDate,
        deathDate: rootPerson.deathDate,
        sex: rootPerson.sex,
        descendants: descendantsTree ? descendantsTree.children : [],
        ancestors: ancestorsTree ? ancestorsTree.children : [],
        spouses: rootPerson.spouseFamilies ? 
            rootPerson.spouseFamilies.map(famId => {
                const family = state.gedcomData.families[famId];
                if (!family) return null; // Vérifier si la famille existe
                
                const spouseId = family.husband === personId ? family.wife : family.husband;
                // Vérifier si le spouseId existe
                if (!spouseId) return null;
                
                const spouse = state.gedcomData.individuals[spouseId];
                // Vérifier si le spouse existe dans les données
                if (!spouse) return null;
                
                return {
                    id: spouseId,
                    name: spouse.name,
                    birthDate: spouse.birthDate,
                    deathDate: spouse.deathDate,
                    sex:spouse.sex,
                    mainBranch: 150,
                };
            }).filter(spouse => spouse !== null) : [] // Filtrer les valeurs null
    };
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
    // const genealogicalParentId = findGenealogicalParent(personId, familiesWithChildren);
    // return {
    //     id: personId,
    //     name: person.name,
    //     generation: generation,
    //     children: [],
    //     siblings: [],
    //     birthDate: person.birthDate,
    //     deathDate: person.deathDate,
    //     collapsed: false,
    //     _originalChildren: [],
    //     genealogicalParentId: genealogicalParentId
    // };
    const genealogicalParents = findGenealogicalParent(personId, familiesWithChildren);
    return {
        id: personId,
        name: person.name,
        generation: generation,
        children: [],
        siblings: [],
        birthDate: person.birthDate,
        deathDate: person.deathDate,
        sex: person.sex,
        collapsed: false,
        _originalChildren: [],
        // Garder l'attribut original pour compatibilité
        genealogicalParentId: genealogicalParents.original,
        // Ajouter les nouveaux attributs
        genealogicalFatherId: genealogicalParents.father,
        genealogicalMotherId: genealogicalParents.mother,
        mainBranch: 1,
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
        const genealogicalParents  = findGenealogicalParent(siblingId, familiesWithChildren);
        
        return {
            id: siblingId,
            name: siblingPerson.name,
            generation: 0,
            isSibling: true,
            children: [],
            birthDate: siblingPerson.birthDate,
            deathDate: siblingPerson.deathDate,
            sex: siblingPerson.sex,
            collapsed: false,
            _originalChildren: [],
            genealogicalParentId: genealogicalParents.original,
            genealogicalFatherId: genealogicalParents.father,
            genealogicalMotherId: genealogicalParents.mother,
            siblingReferenceId: personId,
            mainBranch: 1,
        };
    });
}

// /**
//  * Trouve le parent généalogique
//  * @private
//  */
// export function findGenealogicalParent(siblingId, familiesWithChildren) {
//     return familiesWithChildren.reduce((foundParent, famId) => {
//         const family = state.gedcomData.families[famId];
//         if (family.children.includes(siblingId)) {
//             return family.husband || family.wife;
//         }
//         return foundParent;
//     }, null);
// }

/**
 * Trouve les parents généalogiques
 * @private
 */
export function findGenealogicalParent(siblingId, familiesWithChildren) {
    // Version originale qui retourne un seul parent (pour compatibilité)
    const originalParent = familiesWithChildren.reduce((foundParent, famId) => {
        const family = state.gedcomData.families[famId];
        if (family.children.includes(siblingId)) {
            return family.husband || family.wife;
        }
        return foundParent;
    }, null);
    
    // Nouvelle version qui retourne les deux parents
    const parents = {
        father: null,
        mother: null,
        // Garder l'original pour compatibilité avec le code existant
        original: originalParent
    };
    
    familiesWithChildren.forEach(famId => {
        const family = state.gedcomData.families[famId];
        if (family && family.children && family.children.includes(siblingId)) {
            if (family.husband) {
                parents.father = family.husband;
            }
            if (family.wife) {
                parents.mother = family.wife;
            }
        }
    });
    
    return parents;
}



/**
 * Traite les siblings aux niveaux non-racine
 * @private
 */
function processSiblingsAtNonRoot(siblings, personId, familiesWithChildren, parentNode, generation) {
    siblings.forEach(siblingId => {
        const siblingPerson = state.gedcomData.individuals[siblingId];
        const genealogicalParents = findGenealogicalParent(siblingId, familiesWithChildren);

        // console.log("debug findGenealogicalParent processSiblingsAtNonRoot :", siblingId, siblingPerson, familiesWithChildren, personId, parentNode, generation, genealogicalParentId);

        parentNode.children.push({
            id: siblingId,
            name: siblingPerson.name,
            generation: generation,
            isSibling: true,
            children: [],
            birthDate: siblingPerson.birthDate,
            deathDate: siblingPerson.deathDate,
            sex: siblingPerson.sex,
            collapsed: false,
            _originalChildren: [],
            genealogicalParentId: genealogicalParents.original,
            genealogicalFatherId: genealogicalParents.father,
            genealogicalMotherId: genealogicalParents.mother,
            siblingReferenceId: personId,
            mainBranch: 1,
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