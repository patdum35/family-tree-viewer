// Fonction pour affconstruire l'arbre à partir des données GEDCOM
function findSiblings(personId, gedcomData, processed) {
    const siblings = [];
    const person = gedcomData.individuals[personId];
    
    // console.log(`[findSiblings] Recherche des frères/sœurs pour ${person.name}`);
    
    // Parcourir toutes les familles où la personne est un enfant
    person.families.forEach(famId => {
        const family = gedcomData.families[famId];
        if (family && family.children && family.children.includes(personId)) {
            // console.log(`[findSiblings] Famille trouvée ${famId} avec ${family.children.length} enfants`);
            // Ajouter tous les frères et sœurs non traités
            family.children
                .filter(id => id !== personId && !processed.has(id))
                .forEach(siblingId => {
                    const sibling = gedcomData.individuals[siblingId];
                    // console.log(`[findSiblings] Frère/Sœur trouvé(e): ${sibling.name} (non traité)`);
                    siblings.push(siblingId);
                });
        }
    });
    
    // console.log(`[findSiblings] Total frères/sœurs trouvés: ${siblings.length}`);
    return siblings;
}

function buildAncestorTree(personId, gedcomData, processed = new Set(), generation = 0, parentNode = null) {
    if (processed.has(personId) || generation >= nombre_generation) {
        // console.log(`[buildAncestorTree] Arrêt pour ${personId}: processed=${processed.has(personId)}, generation=${generation}`);
        return null;
    }

    const person = gedcomData.individuals[personId];
    // console.log(`[buildAncestorTree] Début traitement: ${person.name} (Generation: ${generation})`);

    // Créer le nœud pour la personne actuelle
    const node = {
        id: personId,
        name: person.name,
        generation: generation,
        children: []
    };

    // Trouver tous les frères et sœurs avant de marquer comme traité
    const siblings = findSiblings(personId, gedcomData, processed);
    // console.log(`[buildAncestorTree] ${siblings.length} frères/sœurs trouvés pour ${person.name}`);
    
    // Marquer la personne comme traitée après avoir trouvé les frères et sœurs
    processed.add(personId);
    // console.log(`[buildAncestorTree] ${person.name} marqué comme traité`);

    // Si nous avons un nœud parent et des frères et sœurs
    if (parentNode && generation < (nombre_generation-1)) {
        siblings.forEach(siblingId => {
            const siblingPerson = gedcomData.individuals[siblingId];
            // console.log(`[buildAncestorTree] Ajout frère/sœur ${siblingPerson.name} à génération ${generation}`);
            const sibling = {
                id: siblingId,
                name: siblingPerson.name,
                generation: generation,
                isSibling: true,
                children: []
            };
            // Ajouter le frère/sœur au même niveau que le nœud courant
            parentNode.children.push(sibling);
            processed.add(siblingId);
        });
    }

    // Traiter les familles pour les parents
    const familiesAsChild = person.families.filter(famId => {
        const family = gedcomData.families[famId];
        return family && family.children && family.children.includes(personId);
    });
    
    // console.log(`[buildAncestorTree] ${familiesAsChild.length} familles comme enfant pour ${person.name}`);

    // Traiter les parents après les frères et sœurs
    familiesAsChild.forEach(famId => {
        const family = gedcomData.families[famId];
        if (family) {
            if (family.husband && !processed.has(family.husband)) {
                const father = buildAncestorTree(family.husband, gedcomData, processed, generation + 1, node);
                if (father) node.children.push(father);
            }
            if (family.wife && !processed.has(family.wife)) {
                const mother = buildAncestorTree(family.wife, gedcomData, processed, generation + 1, node);
                if (mother) node.children.push(mother);
            }
        }
    });

    return node;
}
