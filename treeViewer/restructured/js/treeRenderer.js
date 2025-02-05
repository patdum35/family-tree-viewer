// ====================================
// Rendu de l'arbre
// ====================================
import { isNodeHidden } from './utils.js';
import { drawNodeContent } from './nodeRenderer.js';
import { drawNodes } from './nodeRenderer.js';
import { state } from './main.js';

let zoom;
let lastTransform = null;

/**
 * Initialise et dessine l'arbre
 */
export function drawTree() {
    if (!state.currentTree) return;

    const rootHierarchy = d3.hierarchy(state.currentTree);
    processSiblings(rootHierarchy);
    processSpouses(rootHierarchy);

    const svg = setupSVG();
    const treeLayout = createTreeLayout();
    const mainGroup = createMainGroup(svg);
    
    // 1. Première passe : calcul et dessin normal
    treeLayout(rootHierarchy);
    drawLinks(mainGroup, rootHierarchy, treeLayout);
    drawSiblingLinks(mainGroup, rootHierarchy);
    drawNodes(mainGroup, rootHierarchy, treeLayout);

    // 2. Seconde passe : ajustement de la position verticale des siblings niveau 0
    adjustLevel0SiblingsPosition(mainGroup);
    // adjustRootSpousesPosition(mainGroup);

    // 3. Troisième passe : dessin des liens pour les siblings niveau 0
    drawLevel0SiblingLinks(mainGroup, rootHierarchy);

    setupZoom(svg, mainGroup);
}


/**
 * Ajuste la position des siblings de niveau 0 pour les rapprocher de la racine
 * @private
 */
function adjustLevel0SiblingsPosition(mainGroup) {

    // Trouver la position y de la racine
    const rootNode = mainGroup.select(".node").filter(d => d.depth === 0 && !d.data.isSibling);
    if (!rootNode.node()) {  // Vérifier si le nœud existe
        // console.log("Nœud racine non trouvé, ajustement des siblings impossible");
        return;
    }
    const rootTransform = rootNode.attr("transform");
    if (!rootTransform) {
        // console.log("Transform de la racine non trouvé");
        return;
    }
    // console.log("Transform racine:", rootTransform);

    const match = rootTransform.match(/translate\((.*?),(.*?)\)/);
    if (!match) {
        // console.log("Format de transform invalide");
        return;
    }    

    const rootY = parseFloat(match[2]);
    console.log("Position Y racine:", rootY);

    // Collecter tous les siblings niveau 0
    const level0Siblings = [];
    mainGroup.selectAll(".node")
        .filter(d => d.depth === 0 && d.data.isSibling)
        .each(function(d) {
            const node = d3.select(this);
            const currentTransform = node.attr("transform");
            if (!currentTransform) return;  // Skip si pas de transform
            
            const transformMatch = currentTransform.match(/translate\((.*?),(.*?)\)/);
            if (!transformMatch) return;  // Skip si format invalide
            
            const currentY = parseFloat(transformMatch[2]);
            level0Siblings.push({node, d, currentY});
        });

    if (level0Siblings.length === 0) {
        // console.log("Aucun sibling niveau 0 trouvé");
        return;
    }

    // Trier les siblings par leur position Y actuelle
    level0Siblings.sort((a, b) => a.currentY - b.currentY);

    // Répartir les siblings au-dessus de la racine avec un espacement constant
    const spacing = state.boxHeight * 1.2; // Espacement entre les siblings
    const initialSpacing = state.boxHeight * 1.2; // Espacement initial plus grand entre la racine et le premier sibling

    level0Siblings.forEach((sibling, index) => {
        const node = sibling.node;
        const currentTransform = node.attr("transform");
        const currentX = parseFloat(currentTransform.match(/translate\((.*?),(.*?)\)/)[1]);
        
        // Calculer la nouvelle position Y avec espacement
        const newY = rootY - (initialSpacing + spacing * index);
        
        // Appliquer la nouvelle position
        node.attr("transform", `translate(${currentX},${newY})`);
        // console.log(`Nouvelle transform pour ${sibling.d.data.name}: translate(${currentX},${newY})`);
    });
}




// /**
//  * Ajuste la position des Spouse de niveau 0 pour les rapprocher de la racine
//  * @private
//  */
// function adjustRootSpousesPosition(mainGroup) {
//     // Trouver la position y de la racine
//     const rootNode = mainGroup.select(".node").filter(d => d.depth === 0 && !d.data.isSibling);
//     if (!rootNode.node()) return;

//     const rootTransform = rootNode.attr("transform");
//     const match = rootTransform.match(/translate\((.*?),(.*?)\)/);
//     if (!match) return;

//     const rootX = parseFloat(match[1]);
//     const rootY = parseFloat(match[2]);

//     // Répartir les conjoints sous la racine
//     const spacing = state.boxHeight * 0.65;
//     const initialSpacing = state.boxHeight * 1.2;


//     rootNode.datum().spouses?.forEach((spouse, index) => {
//         // Créer le nœud pour le conjoint
//         const spouseGroup = mainGroup.append("g")
//             .attr("class", "node spouse")
//             .attr("transform", `translate(${rootX},${rootY + initialSpacing + spacing * index})`);

//         // Préparer les données comme pour un nœud normal
//         const spouseData = {
//             data: spouse,
//             depth: 0
//         };
//         spouseGroup.datum(spouseData);

//             // Rectangle rouge pour le conjoint
//         spouseGroup.append("rect")
//             .attr("class", "person-box spouse")
//             .attr("x", -state.boxWidth/2)
//             .attr("y", -state.boxHeight/2)
//             .attr("width", state.boxWidth)
//             .attr("height", state.boxHeight)
//             .attr("rx", 5)
//             .style("fill", "white")

//         drawNodeContent(spouseGroup, spouse);

//         // Réutiliser les fonctions de nodeControls
//         addRootChangeButton(spouseGroup);
        
//         // Boutons statiques pour descendants/ascendants
//         if (shouldShowDescendantsButton(spouseData)) {
//             addStaticDescendantsButton(spouseGroup);
//         }
//         if (shouldShowAncestorsButton(spouseData)) {
//             addStaticAncestorsButton(spouseGroup);
//         }

//         // Click handler pour détails
//         spouseGroup.on("click", () => displayPersonDetails(spouse.id));


//     });
// }

/**
 * Dessine les liens en pointillé vert pour les siblings de niveau 0
 * @private
 */
function drawLevel0SiblingLinks(mainGroup, rootHierarchy) {
    mainGroup.selectAll(".node")
        .filter(d => d.depth === 0 && d.data.isSibling)
        .each(function(d) {
            const siblingNode = d3.select(this);
            const genealogicalParentId = d.data.genealogicalParentId;
            
            // Ajoutons des logs pour vérifier
            // console.log("Recherche du père:", genealogicalParentId);
            
            // Modifié ici : utiliser datum() pour accéder aux données du nœud
            const fatherNode = mainGroup.selectAll(".node")
                .filter(function(n) {
                    // console.log("Nœud vérifié:", n.data.id);
                    return n.data.id === genealogicalParentId;
                });

            if (!fatherNode.node()) {
                // console.log(`Parent ${genealogicalParentId} non trouvé pour le sibling ${d.data.name}`);
                return;
            }

            // Récupérer les positions
            const siblingTransform = siblingNode.attr("transform");
            const fatherTransform = fatherNode.attr("transform");
            const siblingMatch = siblingTransform.match(/translate\((.*?),(.*?)\)/);
            const fatherMatch = fatherTransform.match(/translate\((.*?),(.*?)\)/);
            
            if (!siblingMatch || !fatherMatch) return;

            const siblingX = parseFloat(siblingMatch[1]);
            const siblingY = parseFloat(siblingMatch[2]);
            const fatherX = parseFloat(fatherMatch[1]);
            const fatherY = parseFloat(fatherMatch[2]);

            mainGroup.append("path")
                .attr("class", "link sibling-link")
                .attr("d", `M${siblingX  + (state.boxWidth/2)},${siblingY}
                            H${(siblingX   + fatherX)/2}
                            V${fatherY}
                            H${fatherX -state.boxWidth/2}`);

        });
}



/**
 * Configure le SVG initial
 * @private
 */
function setupSVG() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    const svg = d3.select("#tree-svg")
        .attr("width", width)
        .attr("height", height);
    
    svg.selectAll("*").remove();
    return svg;
}

/**
 * Crée la mise en page de l'arbre
 * @private
 */
function createTreeLayout() {
    return d3.tree()
        .nodeSize([state.boxHeight * 1.8, state.boxWidth * 1.3])
        .separation((a, b) => {
            if (a.data.isSibling || b.data.isSibling) return 0.65;
            if (a.depth === (state.nombre_generation-1) && b.depth === (state.nombre_generation-1) && a.parent !== b.parent) {
                return 0.7;
            }
            if (a.parent === b.parent) {
                const scale = Math.max(0.5, (state.nombre_generation - a.depth) / state.nombre_generation);
                return scale * (a.depth === b.depth ? 1.1 : 1.5);
            }
            return 1;
        });
}

/**
 * Crée le groupe principal pour le contenu
 * @private
 */
function createMainGroup(svg) {
    return svg.append("g")
        .attr("transform", `translate(${state.boxWidth},${window.innerHeight/2})`);
}

/**
 * Dessine les liens entre les nœuds
 * @private
 */
function drawLinks(group, root, treeLayout) {
    const nodes = treeLayout(root);
    
    group.selectAll(".link")
        .data(root.links())
        .join("path")
        .attr("class", d => {
            if (!d.source?.data || !d.target?.data) return "link hidden";
            if (d.source.data._isDescendantLink) return "link hidden";
            if (d.target.data.isSibling) return "link hidden";
            return "link";
        })
        .attr("d", createLinkPath);
}

/**
 * Crée le chemin pour un lien
 * @private
 */
function createLinkPath(d) {
    if (!d.source?.data || !d.target?.data) return "";
    if (d.source.data._isDescendantLink) return "";
    if (d.target.data.isSibling && d.source.data.generation < d.target.data.generation) return "";

    return `M${d.source.y},${d.source.x}
            H${(d.source.y + d.target.y)/2}
            V${d.target.x}
            H${d.target.y}`;
}



/**
 * Traite les siblings en les ajoutant comme enfants spéciaux
 * @private
 * @param {Object} root - L'arbre hiérarchique D3
 */
function processSiblings(root) {
    root.each(node => {
        if (node.depth === 0 && node.data.siblings && node.data.siblings.length > 0) {
            // Créer les siblings comme des nœuds séparés avec un depth de 0
            const siblings = node.data.siblings.map(sibling => ({
                data: { ...sibling, isSibling: true },
                depth: 0,  // Placer au-dessus de la racine
                height: 0,
                x: node.x - (state.boxHeight * 1.8), // Position au-dessus de la racine
                y: node.y
            }));
    
            // Ajouter les siblings au début des enfants de la racine
            node.children = [
                ...siblings,
                ...(node.children || [])
            ];
        }
    });
}


/**
 * Traite les Spouses en les ajoutant comme enfants spéciaux
 * @private
 * @param {Object} root - L'arbre hiérarchique D3
 */
// Dans treeRenderer.js
function processSpouses(root) {
    root.each(node => {
        if (node.depth === 0) {
            const person = state.gedcomData.individuals[node.data.id];
            if (person && person.spouseFamilies) {
                // Initialiser spouses comme tableau vide s'il n'existe pas
                node.data.spouses = [];
                
                person.spouseFamilies.forEach(famId => {
                    const family = state.gedcomData.families[famId];
                    if (family) {
                        const spouseId = family.husband === node.data.id ? family.wife : family.husband;
                        if (spouseId) {
                            const spouse = state.gedcomData.individuals[spouseId];
                            node.data.spouses.push({
                                id: spouseId,
                                name: spouse.name,
                                birthDate: spouse.birthDate,
                                deathDate: spouse.deathDate
                            });
                        }
                    }
                });
            }
        }
    });
}

/**
 * Dessine les liens des siblings
 * @private
 */
function drawSiblingLinks(group, root) {
    const siblingLinks = collectSiblingLinks(root);
    
    group.selectAll(".sibling-link")
        .data(siblingLinks)
        .join("path")
        .attr("class", "link sibling-link")
        .attr("d", d => {
            if (d.source.data._isDescendantNode || d.target.data._isDescendantNode) return "";
            if (isNodeHidden(d.source) || isNodeHidden(d.target)) return "";
            
            return createLinkPath(d);
        });
}



/**
 * Collecte les liens des siblings
 * @private
 */
function collectSiblingLinks(root) {
    const siblingLinks = [];
    const links = root.links();
    
    links.forEach(link => {
        if (!link?.source?.data || !link?.target?.data) return;
        
        const targetData = link.target.data;
        const sourceData = link.source.data;
        
        if (targetData.isSibling && sourceData.id && targetData.genealogicalParentId &&
            targetData.genealogicalParentId !== sourceData.id) {
            
            findAndAddSiblingLink(root, link, targetData, siblingLinks);
        }
    });
    
    return siblingLinks;
}


/**
 * Trouve et ajoute un lien sibling
 * @private
 */
function findAndAddSiblingLink(root, link, targetData, siblingLinks) {
    root.each(potentialParent => {
        if (potentialParent.data && 
            potentialParent.data.id === targetData.genealogicalParentId) {
            
            if (typeof potentialParent.x === 'number' && 
                typeof potentialParent.y === 'number' &&
                typeof link.target.x === 'number' &&
                typeof link.target.y === 'number') {
                
                siblingLinks.push({
                    source: potentialParent,
                    target: link.target,
                    coordinates: {
                        sourceX: potentialParent.x,
                        sourceY: potentialParent.y,
                        targetX: link.target.x,
                        targetY: link.target.y
                    }
                });
            }
        }
    });
}


/**
 * Configure le zoom
 * @private
 */
function setupZoom(svg, mainGroup) {
    zoom = d3.zoom()
        .scaleExtent([0.1, 3])
        .on("zoom", ({transform}) => {
            lastTransform = transform;
            mainGroup.attr("transform", transform);
        });

    svg.call(zoom);
    
    const initialTransform = lastTransform || d3.zoomIdentity
        .translate(state.boxWidth, window.innerHeight/2)
        .scale(0.8);
    svg.call(zoom.transform, initialTransform);
}

// Export des variables et fonctions nécessaires pour d'autres modules
export const getZoom = () => zoom;
export const getLastTransform = () => lastTransform;