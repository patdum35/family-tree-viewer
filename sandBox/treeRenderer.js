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

// let zoom;
// let lastTransform = null;







/**
 * Calcule uniquement le layout D3 sans mettre à jour le DOM.
 * @returns {Object} Le résultat du layout D3 (rootHierarchy avec les coordonnées d.x et d.y mises à jour).
 */
export function calculateLayout() {
    if (!state.currentTree) return null;
    
    // 1. Appliquer les données et la hiérarchie
    const rootHierarchy = d3.hierarchy(state.currentTree, node => node.children); 

    processSiblings(rootHierarchy);
    processSpouses(rootHierarchy);
    
    // 2. Réinitialiser et appliquer le layout D3
    const treeLayout = createTreeLayout(); // Réutilise votre fonction
    
    // 3. Calculer les nouvelles coordonnées D3 (d.y, d.x)
    // const layoutResult = treeLayout(rootHierarchy);
    state.layoutResult = treeLayout(rootHierarchy);
    
    // Retourner le résultat avec les coordonnées mises à jour
    // return layoutResult;
}




/**
 * Initialise et dessine l'arbre selon le mode sélectionné
 */
export function drawTree(isZoomRefresh = false, isAnimation = false, isPrecalculatedLayout = false) {
    if (!state.currentTree) return;

    console.log("⭐ Structure finale:", JSON.stringify(state.currentTree, null, 2));
    console.log("Arbre restructuré :", state.currentTree);
    
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
    // const rootHierarchy = d3.hierarchy(state.currentTree, node => node.children);   
    // processSiblings(rootHierarchy);
    // processSpouses(rootHierarchy);
    // const treeLayout = createTreeLayout();
    // // Appliquer le layout une seule fois
    // const layoutResult = treeLayout(rootHierarchy);

    // const layoutResult = calculateLayout();

    // Si le layout est fourni, on l'utilise directement.
    let layoutResult = null;
    if (!isPrecalculatedLayout) {
        calculateLayout();
    }
    layoutResult = state.layoutResult;
    // const layoutResult = precalculatedLayout || calculateLayout(); 
    if (!layoutResult) return;


    const svg = setupSVG();
    const mainGroup = createMainGroup(svg);

    // // Grouper les nœuds par niveau
    // const nodesByLevel = {};
    // layoutResult.descendants().forEach(node => {
    //     nodesByLevel[node.depth] = nodesByLevel[node.depth] || [];
    //     nodesByLevel[node.depth].push(node);
    // });

    // // Structure pour mémoriser les infos par niveau
    // const levelMetrics = {};

    // // Première passe : collecte des métriques
    // Object.entries(nodesByLevel).forEach(([depth, levelNodes]) => {
    //     if (depth > 0) {
    //         const positions = levelNodes.map(node => node.x);
    //         levelMetrics[depth] = {
    //             count: levelNodes.length,
    //             minPos: Math.min(...positions),
    //             maxPos: Math.max(...positions),
    //             avgPos: d3.mean(positions)
    //         };

    //         levelNodes.forEach(node => {
    //             node.originalX = node.x;
    //         });
    //     }
    // });

    // // Deuxième passe : ajustement des positions
    // Object.entries(nodesByLevel).forEach(([depth, levelNodes]) => {
    //     if (depth > 0) {
    //         const metrics = levelMetrics[depth];
    //         let offset = 0;
    //         // Logique d'ajustement commentée - à développer si nécessaire
    //     }
    // });









    if (state.treeShapeStyle === 'straight') {

        // if (false) {

        // // ----------------------------------------------------------------------
        // // 🛑 CODE D'AJUSTEMENT VERTICAL (node.x) FINAL & ROBUSTE 🛑
        // // ----------------------------------------------------------------------

        // const nodes = layoutResult.descendants();

        // // Constantes de contrôle
        // const SEPARATION_ENTRE_BRANCHES = 190; // Grand écart entre la Branche 1 et la Branche 2 (Ajustez ce nombre)
        // const RAPPROCHEMENT_FRERES = 60;       // ESPACE MINIMAL entre deux frères/soeurs adjacents (Ajustez ce nombre)

        // let yReference = null;
        // const branch1Counters = {}; // Compteur { depth: index } pour la Branche 1
        // const branch2Counters = {}; // Compteur { depth: index } pour la Branche 2

        // // Étape 1 : Trouver la position verticale (node.x) de référence
        // yReference = nodes.find(n => n.data.mainBranch === 1)?.x || 0;


        // // Étape 2 : Compter et Écraser (mettre à jour) la position node.x
        // nodes.forEach(node => {
        //     const branch = node.data.mainBranch;
        //     const depth = node.depth;
            
        //     // Si c'est la Branche 1
        //     if (branch === 1) {
        //         // Initialiser ou incrémenter l'index pour cette génération (depth)
        //         branch1Counters[depth] = (branch1Counters[depth] || 0) + 1;
        //         const index = branch1Counters[depth];
                
        //         // Nouvelle position X : Y de référence + (Index DANS LA GÉNÉRATION * Ecart minimal)
        //         node.x = yReference + (index * RAPPROCHEMENT_FRERES); 
                
        //     } 
        //     // Si c'est la Branche 2
        //     else if (branch === 2) {
        //         // Initialiser ou incrémenter l'index pour cette génération (depth)
        //         branch2Counters[depth] = (branch2Counters[depth] || 0) + 1;
        //         const index = branch2Counters[depth];
                
        //         // Nouvelle position X : Y de référence + GRANDE SÉPARATION + (Index DANS LA GÉNÉRATION * Ecart minimal)
        //         node.x = yReference + SEPARATION_ENTRE_BRANCHES + (index * RAPPROCHEMENT_FRERES);
        //     }
        // });

        // // ----------------------------------------------------------------------
        // // 🛑 FIN DU CODE CORRIGÉ 🛑
        // // ----------------------------------------------------------------------


        // }

//         if (true) {


//     // ----------------------------------------------------------------------
//     // 🛑 CODE D'AJUSTEMENT VERTICAL (node.x) AVEC SWAP PAR ASCENDANCE 🛑
//     // ----------------------------------------------------------------------

//     const nodes = layoutResult.descendants();

//     // Constantes de contrôle
//     const SEPARATION_ENTRE_BRANCHES = 190; // Grand écart entre la Branche 1 et la Branche 2 (Ajustez ce nombre)
//     const RAPPROCHEMENT_FRERES = 60;       // ESPACE MINIMAL entre deux frères/soeurs adjacents (Ajustez ce nombre)

//     let yReference = null;
//     const branch1Counters = {}; // Compteur { depth: index } pour la Branche 1
//     const branch2Counters = {}; // Compteur { depth: index } pour la Branche 2

//     // Étape 1 : Calculer la position verticale (node.x) basée sur l'Index par Génération
//     yReference = nodes.find(n => n.data.mainBranch === 1)?.x || 0;

//     nodes.forEach(node => {
//         const branch = node.data.mainBranch;
//         const depth = node.depth;
        
//         if (branch === 1) {
//             branch1Counters[depth] = (branch1Counters[depth] || 0) + 1;
//             const index = branch1Counters[depth];
//             // Attribution de la position X brute (position par défaut de la branche 1)
//             node.x = yReference + (index * RAPPROCHEMENT_FRERES); 
            
//         } else if (branch === 2) {
//             branch2Counters[depth] = (branch2Counters[depth] || 0) + 1;
//             const index = branch2Counters[depth];
//             // Attribution de la position X brute (position par défaut de la branche 2)
//             node.x = yReference + SEPARATION_ENTRE_BRANCHES + (index * RAPPROCHEMENT_FRERES);
//         }
//     });


//     // Étape 2 : Appliquer la Règle de Swap uniquement pour la Branche 1
//     const couplesToSwap = {};

//     // Regroupement des nœuds de la Branche 1 par leur 'enfant' D3 (node.parent)
//     nodes.forEach(node => {
//         if (node.data.mainBranch !== 1) return;
//         const childId = node.parent?.data.id || 'root'; 
//         couplesToSwap[childId] = couplesToSwap[childId] || [];
//         couplesToSwap[childId].push(node);
//     });

//     Object.values(couplesToSwap).forEach(coupleNodes => {
        
//         // On ne traite que les couples (2 nœuds)
//         if (coupleNodes.length !== 2) return; 

//         const [nodeA, nodeB] = coupleNodes; 

//         // Les IDs des parents du couple (grands-parents généalogiques)
//         const grandFatherId = nodeA.parent.data.genealogicalFatherId;
//         const grandMotherId = nodeA.parent.data.genealogicalMotherId;
        
//         // Identifier le Parent Principal (celui qui est l'enfant de la lignée)
//         const aIsPrincipal = (grandFatherId && nodeA.data.id === grandFatherId) || 
//                             (grandMotherId && nodeA.data.id === grandMotherId);
        
//         const bIsPrincipal = (grandFatherId && nodeB.data.id === grandFatherId) || 
//                             (grandMotherId && nodeB.data.id === grandMotherId);
        
//         // Logique de SWAP :
//         // Par défaut, le nœud avec le node.x le plus petit est "en haut".
//         // Si A doit être principal (en haut) MAIS que son node.x est plus grand que celui de B, on swap.
//         // Si B doit être principal (en haut) MAIS que son node.x est plus grand que celui de A, on swap.
        
//         if (aIsPrincipal && nodeA.x > nodeB.x) {
//             // A est le principal, mais B est actuellement en haut (nodeB.x < nodeA.x). On swap les positions.
//             const tempX = nodeA.x;
//             nodeA.x = nodeB.x;
//             nodeB.x = tempX;
            
//         } else if (bIsPrincipal && nodeB.x > nodeA.x) {
//             // B est le principal, mais A est actuellement en haut (nodeA.x < nodeB.x). On swap les positions.
//             const tempX = nodeB.x;
//             nodeB.x = nodeA.x;
//             nodeA.x = tempX;
//         }
//         // Si la condition n'est pas remplie, ou si l'ordre est déjà bon, on ne fait rien.
//     });



// // ... (Étape 1 inchangée)

// // // Étape 2 : Appliquer la Règle de Swap uniquement pour la Branche 1
// // const couplesToSwap = {};

// // // Regroupement des nœuds de la Branche 1 par leur 'enfant' D3 (node.parent)
// // nodes.forEach(node => {
// //     if (node.data.mainBranch !== 1) return;
// //     const childId = node.parent?.data.id || 'root'; 
// //     couplesToSwap[childId] = couplesToSwap[childId] || [];
// //     couplesToSwap[childId].push(node);
// // });

// // Object.values(couplesToSwap).forEach(coupleNodes => {
    
// //     // On ne traite que les couples (2 nœuds)
// //     if (coupleNodes.length !== 2) return; 

// //     const [nodeA, nodeB] = coupleNodes; 
    
// //     // --- NOUVELLE LOGIQUE SIMPLE DE DÉTECTION DU PRIORITAIRE (comme vous l'avez demandé) ---
    
// //     // Si l'un des IDs de parents généalogiques (genealogicalFatherId ou MotherId)
// //     // est défini, l'individu est prioritaire. Ces propriétés sont sur nodeA.data et nodeB.data.
    
// //     const aHasParents = nodeA.data.genealogicalFatherId || nodeA.data.genealogicalMotherId;
// //     const bHasParents = nodeB.data.genealogicalFatherId || nodeB.data.genealogicalMotherId;
    
// //     // Le nœud A est prioritaire s'il a des parents ET que B n'en a pas.
// //     const aIsPrincipal = aHasParents && !bHasParents; 
// //     // Le nœud B est prioritaire s'il a des parents ET que A n'en a pas.
// //     const bIsPrincipal = bHasParents && !aHasParents; 
    
// //     // --- EXÉCUTION DU SWAP ---
    
// //     // Le nœud prioritaire doit avoir le node.x le plus petit (être en haut).
    
// //     if (aIsPrincipal && nodeA.x > nodeB.x) {
// //         // A est prioritaire, mais B est en haut. SWAP!
// //         const tempX = nodeA.x;
// //         nodeA.x = nodeB.x;
// //         nodeB.x = tempX;
        
// //     } else if (bIsPrincipal && nodeB.x > nodeA.x) {
// //         // B est prioritaire, mais A est en haut. SWAP!
// //         const tempX = nodeB.x;
// //         nodeB.x = nodeA.x;
// //         nodeA.x = tempX;
// //     }
// //     // Si les deux ont ou n'ont pas de parents, l'ordre de l'étape 1 est conservé.
// // });
// // ----------------------------------------------------------------------
// // 🛑 FIN DE LA MODIFICATION DE L'É TAPE 2 🛑
// // ----------------------------------------------------------------------










//     // ----------------------------------------------------------------------
//     // 🛑 FIN DU CODE MODIFIÉ 🛑
//     // ----------------------------------------------------------------------



//         }



//         if(true) {
// // ----------------------------------------------------------------------
//     // 🛑 NOUVEAUTÉ : CRÉATION ET AFFICHAGE DE LA STRUCTURE PAR GÉNÉRATION 🛑
//     // ----------------------------------------------------------------------
    
//     const nodes = layoutResult.descendants();
//     const nodesByGeneration = {};

//     // 1. Parser les nœuds pour les regrouper par 'depth' (Génération)
//     // On ignore les nœuds virtuels
//     nodes.filter(d => !d.data.isVirtualRoot).forEach(node => {
//         const depth = node.depth; // La profondeur D3 est la génération
        
//         nodesByGeneration[depth] = nodesByGeneration[depth] || [];
        
//         // Stocker une version simplifiée pour la log (ID, Nom, Position X/Y, Parents)
//         nodesByGeneration[depth].push({
//             id: node.data.id,
//             name: node.data.name,
//             x_d3: node.x, // Position verticale initiale (avant correction)
//             y_d3: node.y, // Position horizontale initiale
//             genealogicalFatherId: node.data.genealogicalFatherId,
//             genealogicalMotherId: node.data.genealogicalMotherId,
//             mainBranch: node.data.mainBranch,
//         });
//     });

//     // 2. Afficher la structure dans la console
//     console.log("-------------------------------------------------------");
//     console.log("📊 STRUCTURE INTERNE PAR GÉNÉRATION (Depth D3) 📊");
//     console.log("-------------------------------------------------------");
    
//     Object.keys(nodesByGeneration).sort((a, b) => a - b).forEach(depth => {
//         console.log(`\n### GÉNÉRATION ${depth} (Depth ${depth}) : ${nodesByGeneration[depth].length} personnes`);
//         nodesByGeneration[depth].forEach(person => {
//             console.log(
//                 `  -> ID: ${person.id} | Nom: ${person.name || 'N/A'} | X (Vert. Init.): ${person.x_d3.toFixed(1)} | Y (Horiz. Init.): ${person.y_d3.toFixed(1)} | Branch: ${person.mainBranch} | PèreG: ${person.genealogicalFatherId || 'N/A'} | MèreG: ${person.genealogicalMotherId || 'N/A'}`
//             );
//         });
//     });
//     console.log("-------------------------------------------------------");

//     // ----------------------------------------------------------------------
//     // 🛑 FIN DU BLOC DE LOGS 🛑
//     // ----------------------------------------------------------------------

//         }



        if (true) {

// ... après const layoutResult = treeLayout(rootHierarchy);

// ----------------------------------------------------------------------
// 🛑 CODE D'AJUSTEMENT VERTICAL (node.x) FINAL & ROBUSTE AVEC SWAP 🛑
// ----------------------------------------------------------------------

const nodes = layoutResult.descendants();





const rootNode = nodes.find(n => n.depth === 0 ); 

if (rootNode) {
    console.log("--- DIAGNOSTIC RACINE 0 ---");
    console.log(`Racine D3 trouvée (Depth 1): ${rootNode.data.name} (ID: ${rootNode.data.id})`);
    
    // Tentative d'accès direct aux données stockées par D3
    const spousesArray = rootNode.data.spouses;
    
    if (spousesArray && Array.isArray(spousesArray)) {
        console.log(`STATUT SPOUSES: Trouvé ! Longueur: ${spousesArray.length}`);
        if (spousesArray.length > 0) {
            console.log(`Détails du premier conjoint: ID: ${spousesArray[0].id}, Nom: ${spousesArray[0].name}`);
        }
    } else {
        console.error("STATUT SPOUSES: NON TROUVÉ. La propriété 'spouses' n'est pas présente dans rootNode.data.");
        // Si elle n'est pas là, c'est que la transformation des données d'entrée vers l'arbre D3 l'a supprimée.
    }
    console.log("-------------------------");
} else {
    console.error("ERREUR CRITIQUE: Nœud racine (Depth 1) non trouvé.");
}





// 1. Trouver le nœud racine (Depth 1, le premier individu affiché)
// const rootNode = nodes.find(n => n.depth === 1 && !n.data.isVirtualRoot);
const rootData = rootNode ? rootNode.data : null;

if (rootData && rootData.spouses && rootData.spouses.length > 0) {
    const spouseData = rootData.spouses[0]; 
    
    // 2. Créer un "faux" nœud D3 pour l'épouse, en répliquant la structure nécessaire.
    const spouseNode = {
        data: {
            ...spouseData, 
            isSpouse: true,
            spouseOf: rootData.id,
            // Assurer que la génération et la branche sont cohérentes
            mainBranch: rootNode.data.mainBranch,
            generation: rootData.generation, 
        },
        parent: rootNode.parent, // Parent est la super_root (Depth 0)
        depth: rootNode.depth,   // La Depth est la même que la racine (Depth 1)
        // 3. Lui donner une position initiale légèrement décalée pour qu'elle soit triée
        // (La position sera recalculée à l'Étape 1)
        x: rootNode.x + 1, // Décalage initial
        y: rootNode.y,   
    };
    
    // 4. Ajouter le nœud de l'épouse à la liste principale des nœuds D3
    if (!nodes.some(n => n.data.id === spouseNode.data.id)) {
        nodes.push(spouseNode);
        console.log(`[CORRECTION D3] Succès : Ajout manuel de l'épouse ${spouseData.name} (ID: ${spouseData.id}) à la GÉNÉRATION ${spouseNode.data.generation}.`);
    }
}





// --- ÉTAPE A : CRÉATION DE LA MAP ET DES LOGS (Basés sur 'generation') ---
const idToNodeMap = new Map();
const nodesByGeneration = {};

nodes.filter(d => !d.data.isVirtualRoot).forEach(node => {
    idToNodeMap.set(node.data.id, node); // Map pour recherche rapide (Étape 2)
    
    // UTILISATION DE node.data.generation (comme demandé)
    const generation = node.data.generation; 
    
    // S'assurer que le nœud n'est pas la racine virtuelle D3
    if (generation === undefined || generation < 0) return;

    nodesByGeneration[generation] = nodesByGeneration[generation] || [];
    nodesByGeneration[generation].push({
        id: node.data.id,
        name: node.data.name,
        // x est la position verticale initiale avant le swap
        x_d3: node.x,
        y_d3: node.y,
        genealogicalFatherId: node.data.genealogicalFatherId,
        genealogicalMotherId: node.data.genealogicalMotherId,
        mainBranch: node.data.mainBranch,
    });
});

console.log("-------------------------------------------------------");
console.log("📊 STRUCTURE INTERNE PAR GÉNÉRATION (Paramètre 'generation') 📊");
console.log("-------------------------------------------------------");
// Tri par ordre numérique des générations
Object.keys(nodesByGeneration).sort((a, b) => parseInt(a) - parseInt(b)).forEach(genKey => {
    const generation = nodesByGeneration[genKey];
    console.log(`\n### GÉNÉRATION ${genKey} : ${generation.length} personnes`);
    generation.forEach(person => {
        console.log(
            `  -> ID: ${person.id} | Nom: ${person.name || 'N/A'} | X (Vert. Init.): ${person.x_d3.toFixed(1)} | Y (Horiz. Init.): ${person.y_d3.toFixed(1)} | Branch: ${person.mainBranch} | PèreG: ${person.genealogicalFatherId || 'N/A'} | MèreG: ${person.genealogicalMotherId || 'N/A'}`
        );
    });
});
console.log("-------------------------------------------------------");
// --- FIN ÉTAPE A ---



// Constantes de contrôle
const SEPARATION_ENTRE_BRANCHES = 190;
const RAPPROCHEMENT_FRERES = 60; 

let yReference = null;
const branch1Counters = {};
const branch2Counters = {};
const siblingCounters = {}; // NOUVEAU : Compteur pour les frères et sœurs

// Étape 1 : Calculer la position verticale (node.x) basée sur l'Index par Génération
yReference = nodes.find(n => n.data.mainBranch === 1)?.x || 0;

nodes.forEach(node => {
    const branch = node.data.mainBranch;
    const depth = node.depth; 
    
    // Déterminer si le nœud est un sibling
    const isSibling = !!node.data.isSibling; 
    
    if (branch === 1) {
        if (!isSibling) {
            // 1. Nœuds du Couple (A et B) : Ils prennent les premières positions (index 1 et 2)
            branch1Counters[depth] = (branch1Counters[depth] || 0) + 1;
            const index = branch1Counters[depth];
            node.x = yReference + (index * RAPPROCHEMENT_FRERES); 
            
        } else {
            // 2. Nœuds SIBLING (Frères et Sœurs de A ou B) : Ils prennent les positions suivantes (index 3, 4, ...)
            const baseIndex = 2; // Position de départ juste après le couple (index 1 et 2)
            
            siblingCounters[depth] = (siblingCounters[depth] || 0) + 1;
            const siblingIndex = siblingCounters[depth];
            
            // Position = Référence + Décalage de la Branche 2 + (Index du sibling * RAPPROCHEMENT_FRERES)
            // Cela aligne les siblings verticalement avec la Branche 2.
            node.x = yReference + SEPARATION_ENTRE_BRANCHES + (siblingIndex * RAPPROCHEMENT_FRERES);
        }
        

    } else if (branch === 2) {
        
        // NOUVEAUTÉ : Vérifier si ce nœud est un conjoint de quelqu'un dans la Branche 1 (un Sibling).
        const isSpouse = !!node.data.isSpouse; 
        
        if (isSpouse) {
             // 1. C'est un conjoint de Sibling (ex: Jean Benard).
             // On aligne sa position sur l'index de son Sibling (qui vient d'être compté dans la B1).
             
             const correspondingSiblingIndex = siblingCounters[depth] || 0; 
             
             if (correspondingSiblingIndex > 0) {
                 // S'il y a un Sibling correspondant (index > 0), nous le positionnons juste en dessous.
                 // Le Sibling (B1) est à : Y_Ref + Sep + (SiblingIndex * Rappro)
                 
                 // Pour qu'il soit juste en dessous, nous ajoutons RAPPROCHEMENT_FRERES à la position du Sibling.
                 // Position du Sibling + RAPPROCHEMENT_FRERES
                 node.x = yReference + SEPARATION_ENTRE_BRANCHES + (correspondingSiblingIndex * RAPPROCHEMENT_FRERES) + RAPPROCHEMENT_FRERES;
                 
                 // On n'incrémente PAS branch2Counters car cette personne est gérée par le flux Sibling/Spouse.
                 
             } else {
                 // Si c'est un conjoint (isSpouse) mais qu'il n'y a pas de Sibling correspondant (index 0),
                 // il est probablement un conjoint de la racine de la B2. On le gère par le compteur normal.
                 branch2Counters[depth] = (branch2Counters[depth] || 0) + 1;
                 const index = branch2Counters[depth];
                 node.x = yReference + SEPARATION_ENTRE_BRANCHES + (index * RAPPROCHEMENT_FRERES);
             }
             
        } else {
            // 2. Nœuds normaux de la Branche 2 (Ascendants)
            branch2Counters[depth] = (branch2Counters[depth] || 0) + 1;
            const index = branch2Counters[depth];
            node.x = yReference + SEPARATION_ENTRE_BRANCHES + (index * RAPPROCHEMENT_FRERES);
        }
    }

});




// Étape 2 : Appliquer la Règle de Swap (LOGIQUE FIABLE, utilise la Map créée en Étape A)
const couplesToSwap = {};

// Regroupement des nœuds de la Branche 1 par leur 'enfant' D3 (node.parent)
nodes.forEach(node => {
    if (node.data.mainBranch !== 1) return;
    const childId = node.parent?.data.id || 'root'; 
    couplesToSwap[childId] = couplesToSwap[childId] || [];
    couplesToSwap[childId].push(node);
});


Object.values(couplesToSwap).forEach(coupleNodes => {
    
    // On ne traite que les couples (2 nœuds)
    if (coupleNodes.length !== 2) return; 

    const [nodeA, nodeB] = coupleNodes; 
    
    // --- DÉTECTION DU PRIORITAIRE ---
    
    // Vérification : Les parents généalogiques de A sont-ils affichés dans l'arbre ?
    const aParentsAreDisplayed = 
        (nodeA.data.genealogicalFatherId && idToNodeMap.has(nodeA.data.genealogicalFatherId)) ||
        (nodeA.data.genealogicalMotherId && idToNodeMap.has(nodeA.data.genealogicalMotherId));

    // Vérification : Les parents généalogiques de B sont-ils affichés dans l'arbre ?
    const bParentsAreDisplayed = 
        (nodeB.data.genealogicalFatherId && idToNodeMap.has(nodeB.data.genealogicalFatherId)) ||
        (nodeB.data.genealogicalMotherId && idToNodeMap.has(nodeB.data.genealogicalMotherId));
    
    
    // Règle de Priorité : Si l'un des deux a ses parents affichés ET que l'autre ne les a pas,
    // c'est lui le principal (et il doit être en haut, donc avoir le X le plus petit).
    const aIsPrincipal = aParentsAreDisplayed && !bParentsAreDisplayed; 
    const bIsPrincipal = bParentsAreDisplayed && !aParentsAreDisplayed; 
    
    
    // --- EXÉCUTION DU SWAP ---
    
    // Le nœud prioritaire doit avoir le node.x le plus petit (être en haut).
    
    if (aIsPrincipal && nodeA.x > nodeB.x) {
        // A est prioritaire (doit être en haut), mais B est en haut. SWAP!
        console.log(`[SWAP] A=${nodeA.data.name} (PèreG/MèreG présents) vs B=${nodeB.data.name}. Swapping X: ${nodeA.x.toFixed(1)} <-> ${nodeB.x.toFixed(1)}`);
        const tempX = nodeA.x;
        nodeA.x = nodeB.x;
        nodeB.x = tempX;
        
    } else if (bIsPrincipal && nodeB.x > nodeA.x) {
        // B est prioritaire (doit être en haut), mais A est en haut. SWAP!
        console.log(`[SWAP] A=${nodeA.data.name} vs B=${nodeB.data.name} (PèreG/MèreG présents). Swapping X: ${nodeA.x.toFixed(1)} <-> ${nodeB.x.toFixed(1)}`);
        const tempX = nodeB.x;
        nodeB.x = nodeA.x;
        nodeA.x = tempX;
    }
});



        }














    }



    drawNodes(mainGroup, layoutResult);
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

    // setupZoom(svg, mainGroup);
    setupZoom(svg, mainGroup, false, true);

    // Vérifier si une heatmap est déjà affichée
    if (document.getElementById('namecloud-heatmap-wrapper')) {
        console.log('-debug call to displayHeatMap from drawTree');//, document.getElementById('namecloud-heatmap-wrapper'));
        displayHeatMap(null, false);
    }

    // // Gestion des racines virtuelles
    // if (!isAnimation) {
    //     if (state.currentTree.isVirtualRoot && state.currentTree.children && state.currentTree.children.length > 0) {
    //         let rootOffsetX = -state.boxWidth * 1.1;
    //         // resetViewVirtualRoot(svg, mainGroup, rootOffsetX);
    //     } 
    // }

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

        // // Mode ascendant
        // if (state.treeModeReal !== 'descendants' && state.treeModeReal !== 'directDescendants') {

        //     const aBranch = a.data.mainBranch;
        //     const bBranch = b.data.mainBranch;

        //     // 1. 🛑 RÈGLE DE SÉPARATION INTER-BRANCHES (ESPACE GRAND)
        //     // S'assurer que la séparation entre les branches 1 et 2 est grande.
        //     if (aBranch && bBranch && aBranch !== bBranch) {
        //         return 2.5; // Augmenté à 5.0 pour garantir l'écart visuel.
        //     }

        //     // --- RÈGLES DE RAPPROCHEMENT INTRA-BRANCHE (ESPACE MINIMAL) ---
        //     // Si les deux nœuds sont dans la MÊME branche, on veut les coller au maximum.
        //     if (aBranch === bBranch && aBranch !== undefined) {
                
        //         // Rapprochement très fort pour les conjoints et frères/sœurs (siblings/spouses).
        //         // Ces nœuds sont ceux qui doivent être visuellement collés ensemble.
        //         if (a.data.isSpouse || b.data.isSpouse || a.data.isSibling || b.data.isSibling) {
        //             return 0.7; // Très petit espacement.
        //         }

        //         // Rapprochement général pour les nœuds de la même branche (Parents/Enfants/etc.)
        //         // Cela inclut les relations directes de parenté (a.parent === b.parent)
        //         // et les liens consécutifs dans la lignée principale.
        //         return 0.7; 
        //     }

        //     // Règle par défaut pour le mode ascendant (si les branches ne sont pas marquées ou autres cas non-couverts)
        //     return 0.7; 

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
        .attr("id", "main-tree-group")
        .attr("transform", `translate(${state.boxWidth},${window.innerHeight/2})`);
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
                data: { ...sibling, isSibling: true, mainBranch: 1 },
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
                                mainBranch: 1,
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
function setupZoom(svg, mainGroup, applyInitialTransform = true, applyNormalTransform = false) {
    state.zoom = d3.zoom()
        .scaleExtent([0.1, 3])
        .on("zoom", ({transform}) => {
            state.lastTransform = transform;
            mainGroup.attr("transform", transform);
        });

    svg.call(state.zoom);
    
    const initialTransform = state.lastTransform || d3.zoomIdentity
        .translate(state.boxWidth, window.innerHeight/2)
        .scale(0.8);

    const normalTransform = state.lastTransform || d3.zoomIdentity
        .scale(0.8);


    // recalage de l'arbre avec zoom 0.8, au milieu en hauteur et à une case à gauche!
    if (applyInitialTransform) { 
        // console.log('\n\n\n ---- debug in setupZoom , apply initialTransfrom = ', initialTransform)

        svg.call(state.zoom.transform, initialTransform);
    } else if (applyNormalTransform) { 
        // console.log('\n\n\n ---- debug in setupZoom , apply normalTransfrom = ', normalTransform)

        svg.call(state.zoom.transform, normalTransform);
    }
}





/**
 * Effectue un reset radical du comportement de zoom en détruisant
 * et recréant l'objet d3.zoom complet.
 */
export function hardResetZoom() {
    console.warn("!!!! HARD RESET DU ZOOM D3.JS DÉCLENCHÉ (Ciblage par ID) !!!!");

    // 1. Cibler les éléments nécessaires par ID
    const svg = d3.select("#tree-svg");
    // On cible le groupe principal par son nouvel ID
    const mainGroup = d3.select("#main-tree-group"); 
    
    // Si l'un des sélecteurs échoue, on arrête.
    if (svg.empty() || mainGroup.empty()) {
        console.error("Échec du ciblage SVG ou Main Group. Impossible de faire le Hard Reset.");
        return;
    }

    const zoom = getZoom(); 

    // 2. Désarmer le zoom existant de l'élément SVG
    if (zoom) {
        // Retire tous les listeners liés à l'ancienne instance zoom
        svg.call(zoom.on('zoom', null).on('start', null).on('end', null));
    }

    // 3. Nettoyer les transformations résiduelles
    mainGroup.attr("transform", null); // Supprimer l'ancienne transformation résiduelle
    // Note : state.lastTransform est réinitialisée par setupZoom lors de l'appel final.

    // 4. Recréer et réappliquer une nouvelle instance de zoom
    // Note : setupZoom doit pouvoir accéder aux variables 'state' qu'il manipule.
    // Il faut probablement lui passer l'instance d3 pour la cohérence.
    setupZoom(svg, mainGroup, true, false); 
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
export const getZoom = () => state.zoom;
export const getLastTransform = () => state.lastTransform;


/**
 * Met à jour la variable globale 'lastTransform' avec une nouvelle transformation D3.
 * @param {d3.ZoomTransform} newTransform - La nouvelle valeur de transformation (e.g., d3.zoomTransform).
 */
export const setLastTransform = (newTransform) => {
    // La variable 'lastTransform' doit être déclarée avec 'let' 
    // ou 'var' pour être modifiable.
    state.lastTransform = newTransform;
};


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

/**
 * Dessine les liens entre les nœuds AVEC branches et feuilles
 * @private
 */
export function drawLinks(group, layout) {
    if (!layout || typeof layout.links !== 'function') {
        console.error("Layout invalide dans drawLinks");
        return;
    }   
    
    // 1. Obtenir les liens standard générés par D3
    const standardLinks = layout.links();

    // 2. Générer manuellement les liens descendants→siblings
    const customLinks = [];
    if (state.treeModeReal === 'ancestors' || state.treeModeReal === 'directAncestors') {
        layout.descendants().forEach(descendantNode => {
            if (descendantNode.data && descendantNode.data.appearedOnLeftClick && descendantNode.data.genealogicalParentId) {
                
                // Trouver le nœud du 1er parent 
                let parent = layout.descendants().find(node => 
                    node.data && node.data.id === descendantNode.data.genealogicalFatherId
                );
                
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

    // 4. Créer un groupe pour chaque lien (lien principal + branches + feuilles)
    const linkGroups = group.selectAll(".link-group")
        .data(allLinks)
        .join("g")
        .attr("class", "link-group");

    // 5. Dessiner le lien principal dans chaque groupe
    linkGroups.append("path")
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

    // 6. Ajouter branches et feuilles à chaque lien visible
    if (state.addLeaves) {
        linkGroups.each(function(d) {
            const linkElement = d3.select(this).select("path");
            const isVisible = !linkElement.classed("hidden");
            if (isVisible && d && d.source && d.target) {
                addBranchesToLinkGroup(d3.select(this), d);
            }
        });
    }
}

/**
 * Ajoute des branches avec feuilles de chêne à un groupe de lien
 */
function addBranchesToLinkGroup(linkGroup, d) {
    if (!d || !d.source || !d.target) return;
    
    // Calculer les coordonnées du lien en forme de L
    let startX, startY, midX, midY, endX, endY;
    
    if (state.treeModeReal === 'descendants' || state.treeModeReal === 'directDescendants') {
        // Mode descendant
        startX = d.source.y - (state.boxWidth/2);
        startY = d.source.x;
        midX = (d.source.y + d.target.y)/2;
        midY = d.source.x;
        endX = d.target.y + (state.boxWidth/2);
        endY = d.target.x;
    } else {
        // Mode ascendant
        startX = d.source.y + (state.boxWidth/2);
        startY = d.source.x;
        midX = (d.source.y + d.target.y)/2;
        midY = d.source.x;
        endX = d.target.y - (state.boxWidth/2);
        endY = d.target.x;
    }
    
    // Ajouter 2-3 branches sur le segment horizontal (si assez long)
    const horizontalLength = Math.abs(midX - startX);
    if (horizontalLength > 50) {
        const numBranches = 2 + Math.floor(Math.random() * 2); // 2 ou 3 branches
        for(let i = 0; i < numBranches; i++) {
            const pos = 0.2 + (i / Math.max(1, numBranches - 1)) * 0.6; // Répartir entre 20% et 80%
            const branchX = startX + (midX - startX) * pos;
            const branchY = startY;
            
            // Ajouter une branche aléatoirement en haut OU en bas
            const side = Math.random() > 0.5 ? 1 : -1; // +1 = en bas, -1 = en haut
            addSingleBranch(linkGroup, branchX, branchY, 90 * side); // angle vertical ±90°
        }
    }
    
    // Ajouter 2-4 branches sur le segment vertical (des deux côtés)
    const verticalLength = Math.abs(endY - midY);
    if (verticalLength > 40) {
        const numVerticalBranches = 2 + Math.floor(Math.random() * 3); // 2 à 4 branches
        for(let i = 0; i < numVerticalBranches; i++) {
            const pos = 0.2 + (i / Math.max(1, numVerticalBranches - 1)) * 0.6;
            const branchX = midX;
            const branchY = midY + (endY - midY) * pos;
            
            // Alterner côtés : gauche, droite, gauche, droite...
            const side = (i % 2 === 0) ? -1 : 1; // -1 = gauche, +1 = droite
            const baseAngle = side * 90; // ±90° pour horizontal
            const variation = (Math.random() - 0.5) * 60; // ±30° de variation
            
            addSingleBranch(linkGroup, branchX, branchY, baseAngle + variation);
        }
    }
}

/**
 * Ajoute une seule branche avec feuille de chêne
 */
function addSingleBranch(group, x, y, baseAngle) {
    // Longueur variable de la branche (6 à 20px)
    const branchLength = 6 + Math.random() * 14;
    
    // Angle avec variation aléatoire
    const angle = baseAngle + (Math.random() - 0.5) * 40; // ±20° de variation
    
    const branchEndX = x + Math.cos(angle * Math.PI / 180) * branchLength;
    const branchEndY = y + Math.sin(angle * Math.PI / 180) * branchLength;
    
    // Créer la mini-branche
    group.append("path")
        .attr("class", "mini-branch")
        .attr("d", `M${x},${y} L${branchEndX},${branchEndY}`)
        .style("stroke", "#8D6E63") // Marron pour la branche
        .style("stroke-width", 1.2)
        .style("pointer-events", "none");
    
    // Ajouter la feuille de chêne au bout de la branche
    addOakLeaf(group, branchEndX, branchEndY, angle);
}

/**
 * Ajoute une feuille de chêne réaliste avec nervures
 */
function addOakLeaf(group, x, y, branchAngle) {
    const leafAngle = branchAngle + (Math.random() - 0.5) * 40; // Légère variation d'angle
    const scale = 0.6 + Math.random() * 0.5; // Taille variable (60% à 110%)
    
    // Contour de la feuille de chêne
    group.append("path")
        .attr("class", "leaf-decoration")
        .attr("d", "M0,-8 Q3,-7 4,-5 Q6,-3 4,-1 Q5,1 3,3 Q1,5 0,8 Q-1,5 -3,3 Q-5,1 -4,-1 Q-6,-3 -4,-5 Q-3,-7 0,-8 Z")
        .attr("transform", `translate(${x},${y}) rotate(${leafAngle}) scale(${scale})`)
        .style("fill", "#81C784")
        .style("stroke", "#4CAF50") 
        .style("stroke-width", 0.5)
        .style("pointer-events", "none");
        
    // Nervure centrale
    group.append("path")
        .attr("class", "leaf-vein-main")
        .attr("d", "M0,-8 L0,8")
        .attr("transform", `translate(${x},${y}) rotate(${leafAngle}) scale(${scale})`)
        .style("stroke", "#2E7D32")
        .style("stroke-width", 0.6)
        .style("fill", "none")
        .style("pointer-events", "none");
        
    // Nervures secondaires
    group.append("path")
        .attr("class", "leaf-vein-secondary")
        .attr("d", "M0,-6 L2,-4 M0,-3 L3,-1 M0,0 L3,2 M0,3 L2,5 M0,-6 L-2,-4 M0,-3 L-3,-1 M0,0 L-3,2 M0,3 L-2,5")
        .attr("transform", `translate(${x},${y}) rotate(${leafAngle}) scale(${scale})`)
        .style("stroke", "#388E3C")
        .style("stroke-width", 0.25)
        .style("fill", "none")
        .style("pointer-events", "none");
}