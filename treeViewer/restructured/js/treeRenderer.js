// ====================================
// Rendu de l'arbre
// ====================================
import { isNodeHidden } from './utils.js';
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
    const mainGroup = createMainGroup(svg);
    const treeLayout = createTreeLayout();
    
    // Appliquer le layout une seule fois
    const layoutResult = treeLayout(rootHierarchy);

    // Grouper les nœuds par niveau
    const nodesByLevel = {};
    layoutResult.descendants().forEach(node => {
        nodesByLevel[node.depth] = nodesByLevel[node.depth] || [];
        nodesByLevel[node.depth].push(node);
    });


    // Structure pour mémoriser les infos par niveau
    const levelMetrics = {};

    // Première passe : collecte des métriques
    Object.entries(nodesByLevel).forEach(([depth, levelNodes]) => {
        if (depth > 0) {
            const positions = levelNodes.map(node => node.x);
            levelMetrics[depth] = {
                count: levelNodes.length,
                minPos: Math.min(...positions),
                maxPos: Math.max(...positions),
                avgPos: d3.mean(positions)
            };

            levelNodes.forEach(node => {
                // Garder les positions originales pour la deuxième passe
                node.originalX = node.x;
            });
        }
    });


    // Deuxième passe : ajustement des positions
    Object.entries(nodesByLevel).forEach(([depth, levelNodes]) => {
        if (depth > 0) {
            const metrics = levelMetrics[depth];
            let offset = 0;
            // if (metrics.minPos > 0) { offset = - metrics.minPos -state.boxHeight }
            // offset = -(metrics.maxPos - metrics.minPos)/2- metrics.minPos; // -state.boxHeight 
            // levelNodes.forEach(node => {
            //     // TODO: Utiliser metrics pour ajuster node.x
            //     // Pour l'instant, on garde le même comportement
            //     // const deviation = node.originalX - metrics.avgPos;
            //     // node.x = metrics.avgPos + (deviation * 0.5);

            //     node.x = node.x + offset

            // });
        }
    });



    // Dessiner les liens selon le mode
    drawLinks(mainGroup, layoutResult);
    if (state.treeMode === 'descendants') {
        drawSpouseLinks(mainGroup, layoutResult);
    } else {
        drawSiblingLinks(mainGroup, layoutResult);
        drawLevel0SiblingLinks(mainGroup, layoutResult);
    }

    drawNodes(mainGroup, layoutResult);
    if (state.treeMode !== 'descendants') {
        adjustLevel0SiblingsPosition(mainGroup);
    }

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
    // console.log("Position Y racine:", rootY);

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
    const layout = d3.tree()
        .nodeSize([state.boxHeight * 1.8, state.boxWidth * 1.3]);

    // Inverser la direction pour le mode descendants
    if (state.treeMode === 'descendants') {
        layout.nodeSize([state.boxHeight * 1.4, -state.boxWidth * 1.3]);
    }

    layout.separation((a, b) => {
        if (state.treeMode === 'descendants') {
            // Pour les couples entrelacés (personne + spouse)
            if (a.data.isSpouse || b.data.isSpouse) {
                return 0.8;  // Espacement réduit entre une personne et son spouse
            }
            // Entre différentes familles
            if (a.parent === b.parent) {
                return 0.8;  // Espacement entre frères/soeurs
            }
            return 1.0;  // Espacement entre branches différentes
        } else {
            // Mode ascendant : garder la logique existante
            if (a.data.isSibling || b.data.isSibling) {
                return 0.65;
            }
            if (a.depth === (state.nombre_generation-1) && b.depth === (state.nombre_generation-1) && a.parent !== b.parent) {
                return 0.7;
            }
            if (a.parent === b.parent) {
                const scale = Math.max(0.5, (state.nombre_generation - a.depth) / state.nombre_generation);
                return scale * (a.depth === b.depth ? 1.1 : 1.5);
            }
            return 1;
        }
    });

    return layout;
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
function drawLinks(group, layout) {
    group.selectAll(".link")
        .data(layout.links())
        .join("path")
        .attr("class", d => {
            if (!d.source?.data || !d.target?.data) return "link hidden";
            if (d.source.data._isDescendantLink) return "link hidden";
            if (state.treeMode === 'descendants' && d.target.data.isSpouse) return "link hidden";
            if (d.target.data.isSibling) return "link hidden";
            return "link";
        })
        .attr("d", createLinkPath);
}

/**
 * Dessine les liens entre les spouses et leurs enfants en mode descendants
 * @param {Object} group - Le groupe SVG
 * @param {Object} layout - Le layout de l'arbre
 */
function drawSpouseLinks(group, layout) {
    if (state.treeMode !== 'descendants') return;

    // Collecter tous les liens spouse-enfants
    const spouseLinks = [];
    layout.descendants().forEach(node => {
        if (node.data.isSpouse) {
            const spouseId = node.data.id;
            const parent = node.parent;
            
            if (parent && parent.children) {
                const spouseIndex = parent.children.indexOf(node);
                if (spouseIndex > 0) {
                    const partner = parent.children[spouseIndex - 1];
                    
                    // Trouver la famille commune
                    const familyId = state.gedcomData.individuals[spouseId].spouseFamilies.find(famId => {
                        const fam = state.gedcomData.families[famId];
                        return fam.husband === spouseId ? 
                               fam.wife === partner.data.id : 
                               fam.husband === partner.data.id;
                    });

                    if (familyId) {
                        const family = state.gedcomData.families[familyId];
                        if (family && family.children) {
                            // Trouver les nœuds enfants
                            const childNodes = layout.descendants().filter(n => 
                                family.children.includes(n.data.id) && !n.data.isSpouse
                            );
                            
                            // Créer les liens
                            childNodes.forEach(child => {
                                spouseLinks.push({
                                    source: node,
                                    target: child
                                });
                            });
                        }
                    }
                }
            }
        }
    });

    // Dessiner les liens
    group.selectAll(".spouse-child-link")
        .data(spouseLinks)
        .join("path")
        .attr("class", "link spouse-link")
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
