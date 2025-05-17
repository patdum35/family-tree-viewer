// ====================================
// Rendu de l'arbre
// ====================================
import { isNodeHidden } from './utils.js';
import { drawNodes } from './nodeRenderer.js';
import { state } from './main.js';
import { resetView } from './eventHandlers.js';
import { setupElegantBackground } from './backgroundManager.js';

let zoom;
let lastTransform = null;

/**
 * Initialise et dessine l'arbre
 */
export function drawTree(isZoomRefresh = false) {
    if (!state.currentTree) return;
    
    // Extraire l'arbre réel (ignorer le super-root)
    let treeToRender = state.currentTree;


    // Logique existante pour les modes descendants et ascendants
    const rootHierarchy = d3.hierarchy(treeToRender, node => node.children);   
    
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
        }
    });


    drawNodes(mainGroup, layoutResult, isZoomRefresh);

    drawLinks(mainGroup, layoutResult);
    
    if (state.treeModeReal  !== 'descendants' && state.treeModeReal  !== 'directDescendants') {
        adjustLevel0SiblingsPosition(mainGroup);
    }

    
    if (state.treeModeReal  === 'descendants' || state.treeModeReal  === 'directDescendants') {
        drawSpouseLinks(mainGroup, layoutResult);
    } else {
        drawSiblingLinks(mainGroup, layoutResult);
        drawLevel0SiblingLinks(mainGroup, layoutResult);
    }

    setupZoom(svg, mainGroup);

    // Détecter si nous avons une racine virtuelle masquée
    if (treeToRender.isVirtualRoot && treeToRender.children && treeToRender.children.length > 0) {
        let rootOffsetX = -state.boxWidth*1.1; // On décale l'affichage vers la gauche pour gagner la place de la virtual root masquée
        console.log( "\n\n   VIRTUAL ROOT detected offset = ", rootOffsetX, "  \n\n")
        resetViewVirtualRoot(svg, mainGroup, rootOffsetX);
    } 

    
    if (state.initialTreeDisplay) {
        // Premier affichage de l'arbre - appliquer le fond avec délai
        state.initialTreeDisplay = false; // Marquer que ce n'est plus l'affichage initial
        setTimeout(() => {
            setupElegantBackground(svg);
        }, 100); // délai de 300ms        
    } else {
        // Ce n'est pas le premier affichage - appliquer le fond immédiatement
        setupElegantBackground(svg);
    }
    
    
}
   