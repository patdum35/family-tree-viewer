// ====================================
// Rendu de l'arbre
// ====================================
import { isNodeHidden } from './utils.js';
import { drawNodes } from './nodeRenderer.js';
import { state } from './main.js';
import { resetView } from './eventHandlers.js';
import { setupElegantBackground } from './backgroundManager.js';
import { drawWheelTree, resetWheelView } from './treeWheelRenderer.js';
import { displayHeatMap } from './geoHeatMapUI.js';

let zoom;
let lastTransform = null;

/**
 * Initialise et dessine l'arbre selon le mode sélectionné
 */
export function drawTree(isZoomRefresh = false, isAnimation = false) {
    if (!state.currentTree) return;
    
    // Modes éventail
    if (isWheelMode(state.treeModeReal)) {
        drawWheelTree(isZoomRefresh, isAnimation);
        return;
    }
    
    // Mode both : on crée deux arbres distincts
    if (state.treeModeReal === 'both') {
        drawBothModeTree(isZoomRefresh);
        return;
    }

    // Logique existante pour les modes descendants et ascendants
    const rootHierarchy = d3.hierarchy(state.currentTree, node => node.children);   
    
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
                node.originalX = node.x;
            });
        }
    });

    // Deuxième passe : ajustement des positions
    Object.entries(nodesByLevel).forEach(([depth, levelNodes]) => {
        if (depth > 0) {
            const metrics = levelMetrics[depth];
            let offset = 0;
            // Logique d'ajustement commentée - à développer si nécessaire
        }
    });

    drawNodes(mainGroup, layoutResult, isZoomRefresh);
    drawLinks(mainGroup, layoutResult);
    
    if (state.treeModeReal !== 'descendants' && state.treeModeReal !== 'directDescendants') {
        adjustLevel0SiblingsPosition(mainGroup);
    }

    if (state.treeModeReal === 'descendants' || state.treeModeReal === 'directDescendants') {
        drawSpouseLinks(mainGroup, layoutResult);
    } else {
        drawSiblingLinks(mainGroup, layoutResult);
        drawLevel0SiblingLinks(mainGroup, layoutResult);
    }

    setupZoom(svg, mainGroup);


    // Vérifier si une heatmap est déjà affichée
    if (document.getElementById('namecloud-heatmap-wrapper')) {
        console.log('-debug call to displayHeatMap from drawTree');//, document.getElementById('namecloud-heatmap-wrapper'));
        displayHeatMap(null, false);
    }


    // Gestion des racines virtuelles
    if (!isAnimation) {
        if (state.currentTree.isVirtualRoot && state.currentTree.children && state.currentTree.children.length > 0) {
            let rootOffsetX = -state.boxWidth * 1.1;
            resetViewVirtualRoot(svg, mainGroup, rootOffsetX);
        } 
    }

    // Gestion du fond
    if (state.initialTreeDisplay) {
        state.initialTreeDisplay = false;
        setTimeout(() => {
            setupElegantBackground(svg);
        }, 100);        
    } else {
        setupElegantBackground(svg);
    }  
}

/**
 * Vérifie si le mode est un mode éventail
 */
function isWheelMode(mode) {
    return ['WheelAncestors', 'WheelDescendants'].includes(mode);
}

/**
 * Réinitialise la vue selon le mode
 */
export function resetTreeView() {
    if (isWheelMode(state.treeModeReal)) {
        resetWheelView();
    } else {
        resetView();
    }
}

/**
 * Anime la transition entre les modes
 */
function animateTreeModeTransition(fromMode, toMode) {
    const svg = d3.select("#tree-svg");
    
    // Fade out
    svg.transition()
        .duration(300)
        .style("opacity", 0)
        .on("end", () => {
            // Redessiner avec le nouveau mode
            drawTree(false, true);
            
            // Fade in
            svg.transition()
                .duration(300)
                .style("opacity", 1);
        });
}

function drawBothModeTree(isZoomRefresh = false) {
    const rootPerson = state.currentTree;
    const descendants = rootPerson.descendants || [];
    const ancestors = rootPerson.ancestors || [];

    const svg = setupSVG();
    
    // Création et application du layout pour l'arbre descendant
    const descendantsHierarchy = d3.hierarchy({
        id: rootPerson.id,
        name: rootPerson.name,
        children: descendants
    });
    
    
    

    const descendantsTreeLayout = d3.tree()
        .nodeSize([state.boxHeight * 1.4, -state.boxWidth * 1.4])
        .separation((a, b) => {
            if (a.data.isSpouse || b.data.isSpouse) {
                return 0.8;
            }
            if (a.parent === b.parent) {
                return 0.8;
            }
            return 1.0;
        });


    const descendantsResult = descendantsTreeLayout(descendantsHierarchy);
    
    // Trouver la position la plus à droite de l'arbre descendant
    const rightmostDescendantX = d3.max(descendantsResult.descendants(), d => d.y);
    
    // Créer le groupe principal en tenant compte de cette position
    const mainGroup = svg.append("g")
        .attr("transform", `translate(${-rightmostDescendantX + state.boxWidth * 2}, ${window.innerHeight/2})`);


    // Création et application du layout pour l'arbre ascendant
    const ancestorsHierarchy = d3.hierarchy({
        id: rootPerson.id,
        name: rootPerson.name,
        children: ancestors
    });
    const ancestorsTreeLayout = d3.tree()
        .nodeSize([state.boxHeight * 1.4, state.boxWidth * 1.3])
        .separation((a, b) => {
            if (a.data.isSibling || b.data.isSibling) {
                return 0.8;
            }
            if (a.depth === (state.nombre_generation-1) && b.depth === (state.nombre_generation-1) && a.parent !== b.parent) {
                return 0.8;
            }
            if (a.parent === b.parent) {
                const scale = Math.max(0.5, (state.nombre_generation - a.depth) / state.nombre_generation);
                return scale * (a.depth === b.depth ? 1.7 : 1.5);  // le 1ier chiffre permet de régler l'espacement entre les noeud
            }
            return 1;
        });



    // Positionner l'arbre ascendant juste après l'arbre descendant
    const ancestorsResult = ancestorsTreeLayout(ancestorsHierarchy);
    // Appliquer un offset négatif aux positions y de l'arbre ascendant
    ancestorsResult.descendants().forEach(node => {
        if (state.nombre_prenoms === 1)
        {
            node.y -= 120*2.8 // Ajuster la valeur 2.8 selon le rapprochement souhaité
        }        
        else if (state.nombre_prenoms === 2)
        {
            node.y -= 120*3.1
        }
        else if (state.nombre_prenoms === 3)
        {
            node.y -= 120*3.3
        }
        else
        {
            node.y -= 120*3.4
        }
    });

    // Fonction personnalisée de création de liens
    function createCustomLinkPath(d) {
        return `M${d.source.y},${d.source.x}
                H${(d.source.y + d.target.y)/2}
                V${d.target.x}
                H${d.target.y}`;
    }

    // Groupe pour les descendants
    const descendantsGroup = mainGroup.append("g")
        .attr("transform", "translate(-150, 0)");

    // Dessiner les liens des descendants
    descendantsGroup.selectAll(".link")
        .data(descendantsResult.links())
        .enter().append("path")
        .attr("class", "link")
        .attr("d", createCustomLinkPath);

    // Dessiner les descendants
    const descendantsLayoutData = {
        descendants: () => descendantsResult.descendants().filter(d => d.depth > 0),
        data: {
            ...rootPerson,
            spouses: [] // Supprimer les spouses
        },
        x: 0,
        y: -150
    };

    // Dessiner les descendants
    drawNodes(descendantsGroup, descendantsLayoutData);

    // Groupe pour les ancêtres
    const ancestorsGroup = mainGroup.append("g")
        .attr("transform", "translate(150, 0)");

    // Dessiner les liens des ancêtres
    ancestorsGroup.selectAll(".link")
        .data(ancestorsResult.links()) // Filtrer le niveau 0
        .enter().append("path")
        .attr("class", "link")
        .attr("d", createCustomLinkPath);

    // Préparer les données de layout pour les ancêtres
    const ancestorsLayoutData = {
        descendants: () => ancestorsResult.descendants().filter(d => d.depth > 0),
        data: {
            ...rootPerson,
            spouses: [] // Supprimer les spouses
        },
        x: 0,
        y: 150
    };

    // Dessiner les ancêtres
    drawNodes(ancestorsGroup, ancestorsLayoutData);

    // Configuration du zoom
    setupZoom(svg, mainGroup);
    const zoom = getZoom();

    if (isZoomRefresh) {
        const leftmostPositionX = d3.min(descendantsResult.descendants(), d => d.y);
        resetZoomBoth(mainGroup, svg, -leftmostPositionX + 150, window.innerHeight/2 );
    }

    if (state.initialTreeDisplay) {
        state.initialTreeDisplay = false;
        setTimeout(() => {
            setupElegantBackground(svg);
        }, 100);        
    } else {
        setupElegantBackground(svg);
    }

}

/**
 * Réinitialise le niveau de zoom et la position de l'arbre
 * à leurs valeurs par défaut selon le mode d'affichage
 * Utilise une transition animée pour un retour fluide à la vue initiale
 * @export
 */
export function resetZoomBoth(mainGroup,svg, x, y) {
    setupZoom(svg, mainGroup);
    const zoom = getZoom();
    const newTransform = d3.zoomIdentity.translate(x, y).scale(0.8);

    svg.transition()
        .duration(750)
        .call(zoom.transform, newTransform);
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

    // Collecter tous les siblings niveau 0 avec leur index original
    const level0Siblings = [];
    mainGroup.selectAll(".node")
        .filter(d => d.depth === 0 && d.data.isSibling)
        .each(function(d, i) {
            const node = d3.select(this);
            const currentTransform = node.attr("transform");
            if (!currentTransform) return;
            
            const transformMatch = currentTransform.match(/translate\((.*?),(.*?)\)/);
            if (!transformMatch) return;
            
            const currentY = parseFloat(transformMatch[2]);
            // Ajouter l'index original pour préserver l'ordre
            level0Siblings.push({node, d, currentY, originalIndex: i});
        });

    if (level0Siblings.length === 0) {
        return;
    }

    // Trier les siblings selon leur index original
    level0Siblings.sort((a, b) => b.originalIndex - a.originalIndex);

    // Répartir les siblings au-dessus de la racine
    const spacing = state.boxHeight * 1.2;
    const initialSpacing = state.boxHeight * 1.2;

    level0Siblings.forEach((sibling, index) => {
        const node = sibling.node;
        const currentTransform = node.attr("transform");
        const currentX = parseFloat(currentTransform.match(/translate\((.*?),(.*?)\)/)[1]);
        
        // Les positions Y seront maintenant dans l'ordre naturel
        const newY = rootY - (initialSpacing + spacing * index);
        
        node.attr("transform", `translate(${currentX},${newY})`);
        // console.log(`Positionnement de ${sibling.d.data.name} (index ${sibling.originalIndex}) à Y=${newY}`);
    });
}

/**
 * Dessine les liens en pointillé vert pour les siblings de niveau 0
 * @private
 */
function drawLevel0SiblingLinks(mainGroup, rootHierarchy) {
    
    const nodes = mainGroup.selectAll(".node");
    nodes.filter(d => d.depth === 0 && d.data.isSibling)
        .each(function(d) {
            const siblingNode = d3.select(this);
            const genealogicalParentId = d.data.genealogicalParentId;
            
            const fatherNode = mainGroup.selectAll(".node")
                .filter(function(n) {
                    return n.data.id === genealogicalParentId;
                });
 
            if (!fatherNode.node()) { return; }
 
            // Récupérer les positions
            const siblingTransform = siblingNode.attr("transform");
            const fatherTransform = fatherNode.attr("transform");
            const siblingMatch = siblingTransform.match(/translate\((.*?),(.*?)\)/);
            const fatherMatch = fatherTransform.match(/translate\((.*?),(.*?)\)/);
            
            if (!siblingMatch || !fatherMatch) { return;}
 
            const siblingX = parseFloat(siblingMatch[1]);
            const siblingY = parseFloat(siblingMatch[2]);
            const fatherX = parseFloat(fatherMatch[1]);
            const fatherY = parseFloat(fatherMatch[2]);
 
            mainGroup.append("path")
                .attr("class", "link sibling-link")
                .attr("d", `M${siblingX  + (state.boxWidth/2)},${siblingY}
                           H${(siblingX   + fatherX)/2}
                           V${fatherY}
                           H${fatherX  - state.boxWidth/2}`)
                .style("stroke", getSiblingLinkColor)
                .style("stroke-width", getLinkWidth);    
                           
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
    let layout = d3.tree()
        .nodeSize([state.boxHeight * 1.8, state.boxWidth * 1.4]);

    // Inverser la direction pour le mode descendants
    if (state.treeModeReal  === 'descendants' || state.treeModeReal  === 'directDescendants') {
        layout.nodeSize([state.boxHeight * 1.4, -state.boxWidth * 1.4]);
    }

    layout.separation((a, b) => {
        if (state.treeModeReal  === 'both') {
        // Pour le mode both, on va gérer les descendants différemment
        layout = d3.tree()
            .nodeSize([state.boxHeight * 1.8, state.boxWidth * 1.4])
            .separation((a, b) => {
                // Si l'un est un descendant et l'autre non
                const aIsDescendant = a.data.isDescendant;
                const bIsDescendant = b.data.isDescendant;
                
                if (aIsDescendant !== bIsDescendant) {
                    return 3; // Grand espacement entre ascendants et descendants
                }
                
                // Si les deux sont du même côté, espacement normal
                return 1;
            });

        }

        if (state.treeModeReal  === 'descendants' || state.treeModeReal  === 'directDescendants') {
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
                
                // ATTENTION ce calcul n'est pas clair pour calculer l'écartement entre 2 parents. Il faudra revoir ça
                
                const scale = Math.max(0.60, (state.nombre_generation - a.depth) / state.nombre_generation);
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
 * Dessine les liens entre les nœuds en tenant compte des deux parents généalogiques
 * @private
 */
function drawLinks(group, layout) {
    if (!layout || typeof layout.links !== 'function') {
        console.error("Layout invalide dans drawLinks");
        return;
    }   
    
    
    // 1. Obtenir les liens standard générés par D3
    const standardLinks  = layout.links();



    // 2. Générer manuellement les liens descendants→siblings
    const customLinks = [];
    if (state.treeModeReal === 'ancestors' || state.treeModeReal === 'directAncestors') {
        layout.descendants().forEach(descendantNode => {

            // console.log(descendantNode.data.name)
            if (descendantNode.data && descendantNode.data.appearedOnLeftClick && descendantNode.data.genealogicalParentId) {
                
                // Trouver le nœud du 1er parent 
                let parent = layout.descendants().find(node => 
                    node.data && node.data.id === descendantNode.data.genealogicalFatherId
                );
    
                // console.log('parent1=', parent)
                
                if (parent) {
                    customLinks.push({
                        source: descendantNode,
                        target: parent
                    });
                }
    
                // Trouver le nœud du parent spouse
                parent = layout.descendants().find(node => 
                    node.data &&  node.data.id === descendantNode.data.genealogicalMotherId
                );
    
                // console.log('parent2=', parent)
                
                if (parent) {
                    customLinks.push({
                        source: descendantNode,
                        target: parent
                    });
                }
            }
        });
    
    }

    // 3. Combiner les deux ensembles de liens
    const allLinks = [...standardLinks, ...customLinks];

    
    // Afficher les liens avec les règles actuelles, mais avec une vérification plus stricte
    group.selectAll(".link")
        .data(allLinks)
        .join("path")
        .attr("class", d => {
            // Vérifications de base
            if (!d || !d.source || !d.target) return "link hidden";
            if (!d.source.data || !d.target.data) return "link hidden";
             // Conditions existantes
            if (d.source.data._isDescendantLink) return "link hidden";
            if ((state.treeModeReal === 'descendants' || state.treeModeReal === 'directDescendants') && d.target.data.isSpouse)  {
                return "link hidden";
            }
            if ((state.treeModeReal === 'descendants' || state.treeModeReal === 'directDescendants') && (d.target.data.isSibling)) {
                 return "link hidden";
            }
            if ((state.treeModeReal === 'descendants' || state.treeModeReal === 'directDescendants')){
                return "link";
            }
            
            // Lien normal parent → enfant
            const isNormalParentChildLink = (d.source.data.genealogicalFatherId === d.target.data.id) || 
                                           (d.source.data.genealogicalMotherId === d.target.data.id);
            
            // Lien descendant → sibling
            const isLeftDescendant = !!d.target.data.isLeftDescendant;
            const isCorrectFather = d.target.data.id === d.source.data.genealogicalFatherId;
            const isCorrectMother = d.target.data.id === d.source.data.genealogicalMotherId;

            const isDescendantSiblingLink = isLeftDescendant && (isCorrectFather || isCorrectMother);
            
           
            // Afficher les liens normaux ou descendant→sibling
            if (isNormalParentChildLink || isDescendantSiblingLink) {
                return "link";
            } else {
                return "link hidden";
            }
        })
        .attr("d", createLinkPath)
        .style("stroke", getLinkColor)
        .style("stroke-width", getLinkWidth)
        .style("fill", "none");
}

/**
 * Trouve les parents d'une personne dans les données GEDCOM
 * @param {string} personId - ID de la personne
 * @returns {Object} - Informations sur les parents
 */
function findParentsInGEDCOM(personId) {
    if (!personId || !state.gedcomData || !state.gedcomData.individuals) {
        return { father: null, mother: null };
    }
    
    const person = state.gedcomData.individuals[personId];
    if (!person || !person.families) {
        return { father: null, mother: null };
    }
    
    const parents = { father: null, mother: null };
    
    // Parcourir les familles où la personne est un enfant
    person.families.forEach(famId => {
        const family = state.gedcomData.families[famId];
        if (family && family.children && family.children.includes(personId)) {
            if (family.husband) {
                const father = state.gedcomData.individuals[family.husband];
                parents.father = {
                    id: family.husband,
                    name: father ? father.name : "Inconnu"
                };
            }
            if (family.wife) {
                const mother = state.gedcomData.individuals[family.wife];
                parents.mother = {
                    id: family.wife,
                    name: mother ? mother.name : "Inconnue"
                };
            }
        }
    });
    
    return parents;
}





/**
 * Dessine les liens entre les spouses et leurs enfants en mode descendants
 * @param {Object} group - Le groupe SVG
 * @param {Object} layout - Le layout de l'arbre
 */
function drawSpouseLinks(group, layout) {
    if (state.treeModeReal  !== 'descendants' && state.treeModeReal  !== 'directDescendants') return;

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
        .attr("d", createLinkPath)
        .style("stroke", getLinkColor)    
        .style("stroke-width", getLinkWidth);
}


/**
 * Crée le chemin pour un lien
 * @private
 */
function createLinkPath(d) {
    if (!d || !d.source || !d.target || !d.source.data || !d.target.data) return "";
    
    const sourceData = d.source.data;
    const targetData = d.target.data;
    
    if (sourceData._isDescendantLink) return "";
    
    // Vérifier s'il s'agit d'un lien descendant→sibling
    // const isDescendantToSibling = sourceData.isLeftDescendant && 
    //                            targetData.isSibling && 
    //                            targetData.id === sourceData.genealogicalParentId;
    
    // Vérifier s'il s'agit d'un lien descendant→sibling
    const isDescendantToSibling = targetData.isLeftDescendant && 
                               targetData.isSibling && 
                               targetData.id === sourceData.genealogicalParentId;


    // Log sécurisé pour les liens descendant→sibling
    if (targetData.isLeftDescendant && targetData.isSibling) {
        // console.log(`Création du chemin pour ${sourceData.id || 'unknown'} → ${targetData.id || 'unknown'}`);
        // console.log(`  isDescendantToSibling: ${isDescendantToSibling}`);
    }
    
    if (isDescendantToSibling) {
        // Chemin spécial pour descendant→sibling (gauche→droite)
        return `M${d.source.y + (state.boxWidth/2)},${d.source.x}
                H${(d.source.y + d.target.y)/2}
                V${d.target.x}
                H${d.target.y - (state.boxWidth/2)}`;
    } else if (state.treeModeReal === 'descendants' || state.treeModeReal === 'directDescendants') {
        // Mode descendant (droite→gauche)
        return `M${d.source.y - (state.boxWidth/2)},${d.source.x}
                H${(d.source.y + d.target.y)/2}
                V${d.target.x}
                H${d.target.y + (state.boxWidth/2)}`;
    } else {
        // Mode ascendant normal (gauche→droite)
        return `M${d.source.y + (state.boxWidth/2)},${d.source.x}
                H${(d.source.y + d.target.y)/2}
                V${d.target.x}
                H${d.target.y - (state.boxWidth/2)}`;
    }
}



/**
 * Crée le chemin pour un lien
 * @private
 */
function createSiblingLinkPath(d) {
    if (!d.source?.data || !d.target?.data) return "";
    if (d.source.data._isDescendantLink) return "";
    if (d.target.data.isSibling && d.source.data.generation < d.target.data.generation) return "";

    return `M${d.source.y - (state.boxWidth/2)},${d.source.x}
            H${(d.source.y + d.target.y)/2}
            V${d.target.x}
            H${d.target.y + state.boxWidth/2}`;
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
                                deathDate: spouse.deathDate,
                                sex: spouse.sex,
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
            
            return createSiblingLinkPath(d);
        })
        .style("stroke", getSiblingLinkColor)
        .style("stroke-width", getLinkWidth);
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



function resetViewVirtualRoot(svg, mainGroup, offsetX = 0) {
    if (state.treeMode != 'descendants' && state.treeMode != 'directDescendants') {
        const zoom = getZoom();
        
        if (zoom) {
            // Récupérer la transformation actuelle
            const currentTransform = getLastTransform() || d3.zoomIdentity;
            
            // Extraire le scale et la position Y actuels
            const currentScale = currentTransform.k;
            const currentY = currentTransform.y;
            
            // Créer une nouvelle transformation qui conserve le scale et la position Y actuels
            // mais qui modifie la position X
            const newTransform = d3.zoomIdentity
                .translate(state.boxWidth + offsetX, currentY)
                .scale(currentScale);
            
            // Appliquer la nouvelle transformation
            svg.transition()
                .duration(0)
                .call(zoom.transform, newTransform);
        }
    }
}




// Export des variables et fonctions nécessaires pour d'autres modules
export const getZoom = () => zoom;
export const getLastTransform = () => lastTransform;





/**
 * Retourne la couleur selon le style
 */
function getLinkColor(d) {
    const [thickness, color] = state.linkStyle.split('-');
    
    switch(color) {
        case 'dark':
            return "#333333";
        case 'light': 
            return "#CCCCCC";
        case 'colored':
            // Différencier selon le type de lien
            if (!d.source || !d.target) return "#666666";
            
            // Liens vers spouses : bleu
            if (d.target.data && d.target.data.isSpouse) {
                return "#4169E1"; // Bleu
            }
            
            // Liens vers siblings : orange
            if (d.target.data && d.target.data.isSibling) {
                return "#FF8C00"; // Orange
            }
            
            // Liens parents-enfants normaux : vert
            return "#228B22"; // Vert
            
        default:
            return "#666666";
    }
}

/**
 * Retourne l'épaisseur selon le style
 */
function getLinkWidth(d) {
    const [thickness] = state.linkStyle.split('-');
    
    switch(thickness) {
        case 'thin':
            return "1px";
        case 'normal':
            return "2px"; 
        case 'thick':
            return "4px";
        case 'veryThick':
            return "6px";
        default:
            return "2px";
    }
}

/**
 * Couleur spéciale pour les liens siblings (vert plus ou moins foncé)
 */
function getSiblingLinkColor() {
    const [thickness, color] = state.linkStyle.split('-');
    
    switch(color) {
        case 'dark':
            return "#2E7D32";  // Vert foncé
        case 'light': 
            return "#81C784";  // Vert clair
        case 'colored':
            return "#4CAF50";  // Vert original
        default:
            return "#4CAF50";  // Vert par défaut
    }
}