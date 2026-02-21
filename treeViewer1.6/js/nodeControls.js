// ====================================
// Contrôles et interactions
// ====================================
// import { findDescendants, findSiblings, findGenealogicalParent  } from './treeOperations.js';
import { extractYear } from './utils.js';
// import { drawTree, calculateLayout, getZoom, getLastTransform } from './treeRenderer.js';
import { state, displayGenealogicTree } from './main.js';
import { updateSelectorValue } from './UIutils.js';
import { getNodeScreenPosition, getAnimationMapPosition } from './treeAnimation.js'; 
import { importLinks } from './importState.js'; // import de treeOperations , treeRenderer via importLinks pour éviter les erreurs de chargement circulaire



/**
 * Ajoute les contrôles pour changer la racine
 * @param {Object} nodeGroups - Les groupes de nœuds
 */
// export function addRootChangeButton(nodeGroups) {
//     nodeGroups.append("text")
//         .attr("class", "root-text")
//         .attr("x", state.boxWidth/2 + 9)
//         .attr("y", -state.boxHeight/2 + 46)
//         .attr("text-anchor", "middle")
//         .style("cursor", "pointer")
//         .style("font-size", "16px")
//         .style("fill", "#6495ED")
//         .text("*")
//         .on("click", handleRootChange);
// }

export function addRootChangeButton(nodeGroups) {
    
    let offset_x = 13;
    if (state.nombre_prenoms === 1) {
        offset_x = 10;
    }
    
    // Ajouter une zone de clic invisible plus grande
    nodeGroups.append("circle")
        .attr("cx", state.boxWidth/2 + offset_x)
        .attr("cy", -state.boxHeight/2 + 39)
        .attr("r", 20)  // Rayon de 20px pour une zone de clic généreuse
        .style("fill", "transparent")
        .style("cursor", "pointer")
        .on("click", handleRootChange);
    
    // Ajouter le texte visible par-dessus


    nodeGroups.append("text")
        .attr("x", state.boxWidth/2 + offset_x)
        .attr("y", -state.boxHeight/2 + 39)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")  // Centrage vertical parfait
        .style("cursor", "pointer")
        .style("font-size", "18px")  // Taille agrandie
        .style("font-weight", "bold")  // Optionnel : rendre plus visible
        .style("fill", " #FF8C00" ) // d => d.data.isSibling ? " #4CAF50" : " #6495ED")
        .style("pointer-events", "none")  // Laisser les clics passer au cercle invisible
        .text("✶")
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
    console.log('\n\n\n\n ###################   CALL displayGenealogicTree in handleRootChange  ################# ')

    displayGenealogicTree(d.data.id, true); 

    
    if (state.treeModeReal != 'both')
    {
        const svg = d3.select("#tree-svg");
        const height = window.innerHeight;
        const zoom = importLinks.treeRenderer.getZoom();
        
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
    if (state.treeModeReal === 'descendants' || state.treeModeReal === 'directDescendants') {
        // Code existant inchangé pour le mode descendant
        nodeGroups.append("text")
            .filter(d => {
                // Filtre existant inchangé
                if (d.data.isSibling) return false;
                const person = state.gedcomData.individuals[d.data.id];
                // Vérifier si la personne a des descendants
                return person.spouseFamilies && person.spouseFamilies.some(famId => {
                    const family = state.gedcomData.families[famId];
                    return family && family.children && family.children.length > 0;
                });
            })
            .attr("class", "toggle-text-left")
            .attr("x", -state.boxWidth/2 - 11)
            .attr("y", -state.boxHeight/2 + 18)
            .attr("text-anchor", "middle")
            .style("cursor", "pointer")
            .style("font-size", "28px")  // Taille agrandie
            .style("font-weight", "bold")  // Optionnel : rendre plus visible
            .style("fill", "#6495ED")
            .text(d => {
                // Texte existant inchangé
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
        // Mode ascendant : code original sans modification
        addSiblingDescendantsButton(nodeGroups);
        addInteractiveDescendantsButton(nodeGroups);
        
        // Ajout d'un diagnostic après que tous les boutons sont créés
        // Cette ligne ne modifie pas le comportement, elle affiche juste un message dans la console
        // console.log("Boutons descendants ajoutés en mode ascendant");
    }
}




// Fonction pour déterminer le symbole du bouton
function getDescendantsButtonSymbol(d) {
    // Si c'est un nœud descendant à gauche
    if (d.data.isLeftDescendant) {
        const person = state.gedcomData.individuals[d.data.id];
        const hasUnshownChildren = person && person.spouseFamilies && 
                                 (!d.data.children || d.data.children.length === 0) &&
                                 person.spouseFamilies.some(famId => {
                                     const family = state.gedcomData.families[famId];
                                     return family && family.children && family.children.length > 0;
                                 });
        
        return hasUnshownChildren ? "+" : "-";
    }
    
    // Pour les autres nœuds, logique existante
    // ...rest of your code...
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
        sex: person.sex,
        mainBranch: 40,
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
export async function handleDescendantsClick(event, d, isAnimation = false, nextNodeId) {
    event.stopPropagation();

    if (state.treeModeReal  === 'descendants' || state.treeModeReal === 'directDescendants') {
        handleDescendants(d)
    } else {
        // Mode ascendant : comportement original

        // isAnimation = true;  /// A SUPPRIMER APRÈS TESTS
        await handleDescendantsOnLeft(d, isAnimation, nextNodeId);
    }
}



/**
 * Gère l'affichage des descendants à gauche d'un nœud sibling
 * En restructurant l'arbre pour permettre des générations antérieures
 * @param {Object} d - Le nœud D3 cliqué
 */
async function handleDescendantsOnLeft(d, isAnimation = false, nextNodeId) {

    let clickedNodeInInitialScreenPos;
    clickedNodeInInitialScreenPos = getNodeScreenPosition(d);
    let [mapX, mapY, mapW, mapH] = [null, null, null, null];
    if (!isAnimation) {
        [mapX, mapY, mapW, mapH] = getAnimationMapPosition('namecloud-heatmap-wrapper');
    } else {
        [mapX, mapY, mapW, mapH] = getAnimationMapPosition('animation-map-container');
        if (state.treeShapeStyle === 'straight') { 
            mapH = mapH + 100; // ajustement pour animation  
        }  
    }


    const clickedNodeInInitialLayoutX = d.y;
    const clickedNodeInInitialLayoutY = d.x;

    state.lastTransform = importLinks.treeRenderer.getLastTransform() || d3.zoomIdentity;

    // Vérifier si le nœud a des descendants généalogiques
    const siblingId = d.data.id;
    let descendantGeneration = 0;
    let parentGeneration = 0;
    let descendantsInfo = null;
    
    // console.log("\n\n ____________Debug in handleDescendantsOnLeft Nœud sibling cliqué:", siblingId, d.data.name, isAnimation, nextNodeId);
    
    // Vérifier si nous affichons ou cachons les descendants
    if (!d.data._showingLeftDescendants) {
        // Trouver les descendants généalogiques
        descendantsInfo = findDescendantsForSibling(siblingId, isAnimation, nextNodeId);
        // console.log("\n\n ____________Debug in handleDescendantsOnLeft Nœud sibling cliqué:", siblingId, d.data.name, isAnimation, nextNodeId);
         
        if (descendantsInfo.childrenIds.length === 0) {
            // console.log("Pas de descendants généalogiques trouvés");
            return;
        }

        // for (let i = 0; i < descendantsInfo.childrenData.length; i++) {
        //     console.log("Descendants trouvés pour", siblingId, d.data.name , " : ", descendantsInfo.childrenData[i].id, descendantsInfo.childrenData[i].name);
        // }
        
        
        // Sauvegarder l'état actuel pour pouvoir revenir en arrière
        if (!state._originalTree) {
            state._originalTree = JSON.parse(JSON.stringify(state.currentTree));
            state._originalRootId = state.rootPersonId;
        }
        
        // Restructurer l'arbre complet
        if (isAnimation) {
            restructureTreeForDescendant(descendantsInfo.childrenData, siblingId, d.data.name);
        } else {
            [descendantGeneration, parentGeneration] = restructureTreeForDescendant(descendantsInfo.childrenData, siblingId, d.data.name);
        }
        // console.log("\n\n ------ debug ------- handleTreeShiftRight: descendantGeneration=", descendantGeneration, ', parentGeneration=',parentGeneration);
        
        // Marquer que les descendants sont affichés
        d.data._showingLeftDescendants = true;
    } else {
        // Restaurer l'arbre original
        if (state._originalTree) {
            state.currentTree = state._originalTree;
            state.rootPersonId = state._originalRootId;
            delete state._originalTree;
            delete state._originalRootId;
            d.data._showingLeftDescendants = false;
        }
    }

    // Mesure PRÉDICTIVE de la position du node cliqué et de ses descendants dans le d3 layout (pas encore dans l'écran)
    // const newLayoutRoot = calculateLayout(state.currentTree); 
    importLinks.treeRenderer.calculateLayout();

    if (!state.layoutResult) return; // Sécurité

    // Trouver le nœud cliqué dans le nouveau layout
    const clickedNodeInNewLayout = state.layoutResult.descendants().find(n => n.data.id === d.data.id);

    let minYnewDesc = 10000;
    let maxYnewDesc = 0;
    let middleYnewDesc = 0;
    let newDescNodeX = 0;

    // Trouver les nœuds des descendants du noeud cliqué dans le nouveau layout
    if (descendantsInfo.childrenIds) {
        descendantsInfo.childrenIds.forEach(id=> {
            let newDescNodeInNewLayout = state.layoutResult.descendants().find(n => n.data.id === id);
            newDescNodeX = newDescNodeInNewLayout ? newDescNodeInNewLayout.y : 0;
            let newDescNodeY = newDescNodeInNewLayout ? newDescNodeInNewLayout.x : 0;
            minYnewDesc = Math.min(newDescNodeY, minYnewDesc);
            maxYnewDesc = Math.max(newDescNodeY, maxYnewDesc);            
        });
        middleYnewDesc = (maxYnewDesc + minYnewDesc)/2;
    }

    const clickedNodeInNewLayoutX = clickedNodeInNewLayout ? clickedNodeInNewLayout.y : clickedNodeInInitialLayoutX;
    const clickedNodeInNewLayoutY = clickedNodeInNewLayout ? clickedNodeInNewLayout.x : clickedNodeInInitialLayoutY;


    let clickedNodePredictedInScreenX = clickedNodeInInitialScreenPos.x + (clickedNodeInNewLayoutX - clickedNodeInInitialLayoutX)*state.lastTransform.k;
    let clickedNodePredictedInScreenY = clickedNodeInInitialScreenPos.y + (clickedNodeInNewLayoutY - clickedNodeInInitialLayoutY)*state.lastTransform.k; 

    let descNodePredictedInScreenX = clickedNodePredictedInScreenX - (clickedNodeInNewLayoutX - newDescNodeX)*state.lastTransform.k;  
    let descNodePredictedInScreenY = clickedNodePredictedInScreenY - (clickedNodeInNewLayoutY - middleYnewDesc)*state.lastTransform.k; 
    let descNodePredictedInScreenMinY = clickedNodePredictedInScreenY - (clickedNodeInNewLayoutY - minYnewDesc)*state.lastTransform.k; 



    console.log("\n\n ------ debug handleDescendantsOnLeft ------- : avant décalage, nodeScreenPos=", clickedNodeInInitialScreenPos, 'predictedX=',clickedNodePredictedInScreenX , 'predictedY=',clickedNodePredictedInScreenY , 'predictedDESCX=',descNodePredictedInScreenX , 'predictedDESC_avgY=',descNodePredictedInScreenY , 'predictedDESC_MINY=', descNodePredictedInScreenMinY, d.data.name, 'clickedNodeInInitialLayoutX=', clickedNodeInInitialLayoutX, 'clickedNodeInInitialLayoutY=', clickedNodeInInitialLayoutY, 'lastTransform=' ,state.lastTransform, 'clickedNodeInNewLayoutY=',clickedNodeInNewLayoutY, clickedNodeInNewLayout.x, 'minYnewDesc=',minYnewDesc, 'maxYnewDesc=',maxYnewDesc, 'middleYnewDesc=',middleYnewDesc, 'nb_descd=',descendantsInfo.childrenIds.length, mapX, mapY, mapW, mapH);


    let shiftInScreenX = 0; 
    let shiftInScreenY = 0; 
    let marginX = state.boxWidth/2 + 35;
    let marginY = state.boxHeight/2 + 35;
    let marginYtop = state.boxHeight/2 + 35;
    let marginShiftX = marginX + state.boxWidth * 1.4 * state.lastTransform.k;

    if (window.innerWidth > 700) {
        marginX = marginX + 50;
        marginShiftX = marginShiftX + 50;
    }
    if (window.innerHeight > 700) {
        marginY = marginY + 50;
        marginYtop = marginYtop + 50;
    }

    if (state.isButtonOnDisplay) { marginYtop = marginYtop + 50; }

    let shiftLeftX = -state.boxWidth * 1.4 * state.lastTransform.k;


    let shiftX , shiftX2, shiftXSmall, shiftX2Small;
    // Calcul du Décalage en X et Y à annuler
    const dxLayoutShift = -(clickedNodeInNewLayoutX - clickedNodeInInitialLayoutX)*state.lastTransform.k; 
    let dyLayoutShift = -(clickedNodeInNewLayoutY - clickedNodeInInitialLayoutY)*state.lastTransform.k; 

    if (descNodePredictedInScreenMinY < marginYtop) {
        dyLayoutShift =  ( marginYtop - descNodePredictedInScreenMinY);
    }

    // quand le noeud cliqué complétement à gauche
    // dans ce cas le drawTree ajoute automatiquement la nouvelle génération N-1 à gauche et va se positionner au même endroit donc le node cliqué se déplace vers la droite
    // donc avant le drawtree il faut simuler le déplacement lent vers la droite du noeud cliqué avec shiftX et revenir très vite à gauche avec shiftX2 pour que le drawtree positionne l'arbre au bin endroit  
    shiftX = state.boxWidth * 1.4 * state.lastTransform.k + (dxLayoutShift + state.boxWidth * 1.4 * state.lastTransform.k);
    shiftX2 = -state.boxWidth * 1.4 * state.lastTransform.k;

    shiftXSmall = state.boxWidth * 0.4 * state.lastTransform.k 
    shiftX2Small = -state.boxWidth * 0.4 * state.lastTransform.k;

    if (descendantGeneration >= 0) {
        // dans ce cas le drawTree ne déplace pas l'arbre car on ajoute pas de nouvelle génération N-1. Donc le noeud cliqué reste au même endroit
        // dans ce cas on simule un petite mouvement vers la droite et on revient au point de départ
        shiftX = shiftXSmall;
        if (descNodePredictedInScreenX < marginX) { shiftX = shiftX - (descNodePredictedInScreenX - marginX);}
        shiftX2 = shiftX2Small;
        shiftLeftX = 0;
    }

    if (clickedNodeInInitialLayoutX === 0) { // uniquement pour corriger un problème d'init
        shiftX = shiftX + state.boxWidth * 1.4 * state.lastTransform.k;
        shiftX2 = shiftX2*2 - 30;
    }

   // pour éviter que les noeuds descendants du node cliqué sortent de l'écran
   //descNodePredictedInScreenX < marginX  ||
//    if ( descNodePredictedInScreenX > window.innerWidth - marginX || descNodePredictedInScreenY < marginY ||  descNodePredictedInScreenY > window.innerHeight - marginY - mapH) {
//         // if (descNodePredictedInScreenX < 0 ) { // ||  descNodePredictedInScreenX > window.innerWidth -10) {
//         //     shiftInScreenX = -descNodePredictedInScreenX + marginX;
//         // } else if (descNodePredictedInScreenX < marginX ) {
//         //     shiftInScreenX = marginX;
//         // } else 
//         if (descNodePredictedInScreenX > window.innerWidth - marginX ) {
//             shiftInScreenX = -(descNodePredictedInScreenX -(window.innerWidth - marginX));
//         } else if (descNodePredictedInScreenY < 0 ) { // ||  descNodePredictedInScreenX > window.innerWidth -10) {
//             shiftInScreenY = -descNodePredictedInScreenY + marginY;
//         } else if (descNodePredictedInScreenY < marginY ) {
//             shiftInScreenY = marginY;
//         } else if (descNodePredictedInScreenY > window.innerHeight - marginY ) {
//             shiftInScreenY = -(descNodePredictedInScreenY -(window.innerHeight - marginY));
//         }
//         console.log("\n\n ------ 0 debug in handleDescendantsOnLeft : Avoid out of screen  **************************** shiftInScreen=", shiftInScreenX, shiftInScreenY);
//         await handleTreeXYShift(shiftInScreenX, shiftInScreenY, 550);
//     }


    if (descNodePredictedInScreenX < marginShiftX  || ( clickedNodeInInitialScreenPos.x < marginShiftX && clickedNodeInInitialLayoutX === 0)) {
    // quand le noeud cliqué est à tout à gauche, et qu'il n'y a pas assez de place pour le noeud descendant, donner un effet de mouvement vers la droite avant de faire apparaitre le nouveau descendant à gauche
        console.log('\n\n ------  1 debug in handleDescendantsOnLeft  : slow shift right effect + fast shift Left   ------- slow shiftX=', shiftX , 'shiftY=', 0, 'then fast shiftX2=', shiftX2 , 'shiftY=', dyLayoutShift); 

        // décalage pour donner un effet de mouvement vers la droite avant de faire apparaitre le nouveau descendant à gauche
        await handleTreeXYShift(shiftX, 0, 450);
        // décalage vers la gauche et remmettre le nouveau descendant au même endoit que le précédent
        await handleTreeXYShift(shiftX2, dyLayoutShift, 0);

    } else if ( clickedNodeInInitialScreenPos.x >= marginShiftX && clickedNodeInInitialLayoutX === 0) {
    // quand il y a assez de place à gauche pour le noeud descendant, décaler l'arbre vers la gauche à la position attendue

        // décalage pour donner un effet de mouvement vers la droite avant de faire apparaitre le nouveau descendant à gauche
        console.log('\n\n ------ 2 debug in handleDescendantsOnLeft  : slow shift right effect  + fast BIG double shift Left------- slow shiftX=', shiftXSmall , 'shiftY=', 0, 'then fast BIG shiftX2=', shiftX2Small + shiftLeftX*2.5 , 'shiftY=', dyLayoutShift); 
        await handleTreeXYShift(shiftXSmall, 0, 450);
        // console.log('\n\n ------ debug in handleDescendantsOnLeft  : fast shiftX left ------- shiftX=', shiftLeftX , 'shiftY=', dyLayoutShift);
        await handleTreeXYShift(shiftX2Small + shiftLeftX*2.5, dyLayoutShift, 0);
        // await handleTreeXYShift(shiftLeftX*2.5, dyLayoutShift, 0);    
    
    } else if (descNodePredictedInScreenX >= marginShiftX) {
        // quand il y a assez de place à gauche pour le noeud descendant 
        let shiftLeftXInt;
        if (descendantGeneration < 0) {
            // si descendantGeneration < 0, dans ce cas le drawTree ajoute automatiquement la nouvelle génération N-1 à gauche et va se positionner au même endroit donc le node cliqué se déplace vers la droite
            // comme il y a assez de place à gauche pour le noeud descendant, il faut donc décaler l'arbre vers shiftLeftX   
            shiftLeftXInt = shiftLeftX;
        } else {
            // si descendantGeneration >=0, dans ce cas le drawTree n'ajoute pas de nouvelle génération N-1 et donc le drawTree ne va pas déplacer l'arbre
            // comme il y a assez de place à gauche pour le noeud descendant, il faut donc juste faire un petit effet de déplacement à droite et retour à gauche avec shiftXSmall et shiftX2Small  
            shiftLeftXInt = 0;
        }

        // décalage pour donner un effet de mouvement vers la droite avant de faire apparaitre le nouveau descendant à gauche
        console.log('\n\n ------ 3 debug in handleDescendantsOnLeft  : slow shift right effect  + fast BIG shift Left------- slow shiftX=', shiftXSmall , 'shiftY=', 0, 'then fast BIG shiftX2=', shiftXSmall + shiftLeftX , 'shiftY=', dyLayoutShift); 
        await handleTreeXYShift(shiftXSmall, 0, 450);
        // console.log('\n\n ------ debug in handleDescendantsOnLeft  : fast shiftX left ------- shiftX=', shiftLeftX , 'shiftY=', dyLayoutShift);
        await handleTreeXYShift(shiftX2Small + shiftLeftXInt, dyLayoutShift, 0);
    }


    // Redessiner l'arbre
    // drawTree(false, isAnimation);
    importLinks.treeRenderer.drawTree(false, isAnimation, true); 
    state.layoutResult = null;

    // rattrapage en Y  pour le cas (clickedNodeInInitialLayoutX === 0 && clickedNodeInInitialLayoutY === 0) : innexplicable ????
    if (clickedNodeInInitialLayoutX === 0) {
        await delay(10);
        const clickedNodeInFinalcreenPos = getNodeScreenPosition(d);
        if (Math.abs(clickedNodeInInitialScreenPos.y - clickedNodeInFinalcreenPos.y) > 5) {
            await handleTreeXYShift(0, clickedNodeInInitialScreenPos.y - clickedNodeInFinalcreenPos.y, 0);
            console.log('\n\n ------ 4 debug in handleDescendantsOnLeft  : after drawTree, additionnal fast shift Y  ------- shiftY=', clickedNodeInInitialScreenPos.y - clickedNodeInFinalcreenPos.y,'clickedNodeInFinalcreenPos.y=' ,clickedNodeInFinalcreenPos.y); 
        }
        if (Math.abs(clickedNodeInInitialScreenPos.y - clickedNodeInFinalcreenPos.y) > 5) {
            await delay(10);
            const clickedNodeInFinalcreenPos2 = getNodeScreenPosition(d);
            await handleTreeXYShift(0, clickedNodeInInitialScreenPos.y - clickedNodeInFinalcreenPos2.y, 0);
            console.log('\n\n ------ 5 debug in handleDescendantsOnLeft  : after drawTree, 2nd additionnal fast shift Y  ------- shiftY=', clickedNodeInInitialScreenPos.y - clickedNodeInFinalcreenPos.y,'clickedNodeInFinalcreenPos2.y=' ,clickedNodeInFinalcreenPos2.y); 
        }
    }
    await delay(10);
    const clickedNodeInFinalcreenPos = getNodeScreenPosition(d);
    const descNodeInFinalcreenPosX = clickedNodeInFinalcreenPos.x - (clickedNodeInNewLayoutX - newDescNodeX)*state.lastTransform.k; 
    const descNodeInFinalcreenPosY = clickedNodeInFinalcreenPos.y - (clickedNodeInNewLayoutY - minYnewDesc)*state.lastTransform.k; 
    console.log("\n\n ------ debug handleDescendantsOnLeft  ------- final after drawTree après décalage, clickedNodeInFinalcreenPos=", clickedNodeInFinalcreenPos, 'screenW=', window.innerWidth, 'screenH=', window.innerHeight, 'marginX=', marginX, 'marginX=',marginY , 'descNodeInFinalcreenPosX=',descNodeInFinalcreenPosX,'descNodeInFinalcreenPosY=', descNodeInFinalcreenPosY,d.data.name);



   // control final après drawTree pour être sûr que le noeud descendant ne sort pas de l'écran : si c'est le cas on le met au centre de l'écran
   //descNodePredictedInScreenX < marginX  ||
   shiftInScreenX = 0; shiftInScreenY = 0;
    if ( descNodeInFinalcreenPosX < marginX  || descNodeInFinalcreenPosX > window.innerWidth - marginX || descNodeInFinalcreenPosY < marginYtop ||  descNodeInFinalcreenPosY > window.innerHeight - marginY - mapH) {

        if (descNodeInFinalcreenPosX < marginX) {
            shiftInScreenX = marginX - descNodeInFinalcreenPosX; 
            console.log('\n\n ------ 6-1 debug '); 
       
        } else if ( descNodeInFinalcreenPosX > window.innerWidth - marginX ) {
            shiftInScreenX = window.innerWidth - marginX - descNodeInFinalcreenPosX; 
            console.log('\n\n ------ 6-2 debug '); 
        }

        if (descNodeInFinalcreenPosY < marginYtop) {
            shiftInScreenY = marginYtop - descNodeInFinalcreenPosY;
            console.log('\n\n ------ 6-3 debug '); 

        } else if (descNodeInFinalcreenPosY > window.innerHeight - marginY - mapH) {
            shiftInScreenY = window.innerHeight - marginY - mapH  - descNodeInFinalcreenPosY;
            console.log('\n\n ------ 6-3 debug ');       
        }
        // shiftInScreenY = window.innerHeight - marginY - mapH  - clickedNodeInFinalcreenPos.y;      
        console.log('\n\n ------ 6 debug in handleDescendantsOnLeft : Avoid out of screen  **************************** shiftInScreen=', shiftInScreenX, shiftInScreenY);
        await handleTreeXYShift(shiftInScreenX, shiftInScreenY, 250);
    }

}


/**
 * Attend un ou deux cycles de rendu du navigateur.
 * C'est le moyen le plus sûr de garantir que getBoundingClientRect() sera précis.
 * @param {number} frames - Nombre de frames à attendre (1 ou 2)
 * @returns {Promise<void>}
 */
function waitForRender(frames = 2) {
    return new Promise(resolve => {
        let count = 0;
        const step = () => {
            count++;
            if (count >= frames) {
                // On utilise setTimeout(0) en plus pour revenir à la fin de la file d'attente du navigateur
                setTimeout(resolve, 0); 
            } else {
                requestAnimationFrame(step);
            }
        };
        requestAnimationFrame(step);
    });
}



// Fonction utilitaire pour créer un délai bloquant
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}




// J'ai un problème avec mon code d'affichage d'un arbre généalogique de la gauche vers la droite ( descendants à gauche, ascendants à droite)
// Quand l'arbre est affiché, je peux cliquer sur un bouton d'un node à gauche pour faire apparaitre un nouveau descendant à sa gauche et ré-afficher l'arbre.
// Tout ça marche bien : un nouvel arbre avec un nouveau descendant à gauche est bien affiché et l'arbre est bien shifté vers la droite pour laisser apparaitre le nouveau node à gauche

// Quand je mesure la position  du node départ (le node cliqué) avec nodeScreenPos = getNodeScreenPosition(d), avant le restructureTreeForDescendant et le drawTree, la position affichée dans le console log est correcte et reflète bien la position du node avnat le click: OK

// MAIS , et c'est là mon problème, quand je re-mesure la position  du node départ (le node cliqué) avec nodeScreenPos = getNodeScreenPosition(d), après le drawTree(), la position affiché dans le console log est la même qu'avant, alors que visuellement le node a bien été déplacé. Pourquoi ?

// Reformule ma problématique  et trouve moi une solution



// //#################################################################################
// async function handleDescendantsOnLeft(d, isAnimation = false, nextNodeId) {
//     let nodeScreenPos = getNodeScreenPosition(d);
//     console.log("\n\n ------ debug handleDescendantsOnLeft ------- before handleTreeShiftRight: avant décalage, nodeScreenPos=", nodeScreenPos, d.data.name);
    
//     // Vérifier si le nœud a des descendants généalogiques
//     const siblingId = d.data.id;
//     let descendantGeneration = 0, parentGeneration = 0;
    
//     // Trouver les descendants généalogiques
//     const descendantsInfo = findDescendantsForSibling(siblingId, isAnimation, nextNodeId);
        
//     if (descendantsInfo.childrenIds.length === 0) {
//         // console.log("Pas de descendants généalogiques trouvés");
//         return;
//     }
   
//     // Sauvegarder l'état actuel pour pouvoir revenir en arrière
//     if (!state._originalTree) {
//         state._originalTree = JSON.parse(JSON.stringify(state.currentTree));
//         state._originalRootId = state.rootPersonId;
//     }
    
//     // Restructurer l'arbre complet
//     [descendantGeneration, parentGeneration] = restructureTreeForDescendant(descendantsInfo.childrenData, siblingId, d.data.name);

//     // Marquer que les descendants sont affichés
//     d.data._showingLeftDescendants = true;


//     // Redessiner l'arbre
//     drawTree(false, isAnimation);


//     nodeScreenPos = getNodeScreenPosition(d);
//     console.log("\n\n ------ debug handleDescendantsOnLeft  ------- after drawTree après décalage, nodeScreenPos=", nodeScreenPos, d.data.name);
// }



// /**
//  * Retourne la position X/Y réelle du centre du nœud à l'écran
//  * en utilisant getBoundingClientRect() sur l'élément SVG.
//  */
// function getNodeScreenPosition(node) {
//     // 1. Sélectionner l'élément DOM du nœud par son ID unique
//     // NOTE: L'ID doit correspondre à celui défini dans drawNodes
//     // 1. Appliquer la même fonction de nettoyage à l'ID
//     const cleanedId = cleanIdForSelector(node.data.id);
//     const selector = `#node-${cleanedId}`;
    
//     // 2. Sélectionner l'élément DOM du nœud par son ID nettoyé
//     const nodeElement = d3.select(selector).node();


//     if (!nodeElement) {
//         console.warn(`Élément de nœud SVG non trouvé pour ID: ${node.data.id}`);
//         // Fallback: si l'élément n'est pas dans le DOM, utilisez l'ancienne logique
//         const lastTransform = getLastTransform() || d3.zoomIdentity;
//         const screenX = lastTransform.applyX(node.y);
//         const screenY = lastTransform.applyY(node.x);
//         return { x: screenX, y: screenY };
//     }

//     // 2. Utiliser getBoundingClientRect() pour obtenir la position à l'écran
//     // Cette méthode prend en compte toutes les transformations (translate, zoom, etc.)
//     const rect = nodeElement.getBoundingClientRect();
    
//     // 3. Retourner le centre du nœud (si vous voulez la position du centre)
//     // Cela donne la position en pixels par rapport au coin supérieur gauche de la fenêtre
//     return {
//         // x = centre horizontal
//         x: rect.x + rect.width / 2, 
//         // y = centre vertical
//         y: rect.y + rect.height / 2 
//     };
// }


// import {drawNodeBoxes, drawNodeContent, addControlButtons} from './nodeRenderer.js';
// import {drawLinks} from './treeRenderer.js';
// let zoom;
// let lastTransform = null;

// /**
//  * Initialise et dessine l'arbre selon le mode sélectionné
//  */
// function drawTree(isZoomRefresh = false, isAnimation = false) {
//     if (!state.currentTree) return;
    

//     // Logique existante pour les modes descendants et ascendants
//     const rootHierarchy = d3.hierarchy(state.currentTree, node => node.children);   
    
//     // processSiblings(rootHierarchy);
//     // processSpouses(rootHierarchy);

//     const svg = setupSVG();
//     const mainGroup = createMainGroup(svg);
//     const treeLayout = createTreeLayout();
    
//     // Appliquer le layout une seule fois
//     const layoutResult = treeLayout(rootHierarchy);


//     drawNodes(mainGroup, layoutResult);
//     drawLinks(mainGroup, layoutResult);
    
//     // if (state.treeModeReal !== 'descendants' && state.treeModeReal !== 'directDescendants') {
//     //     adjustLevel0SiblingsPosition(mainGroup);
//     // }

//     // if (state.treeModeReal === 'descendants' || state.treeModeReal === 'directDescendants') {
//     //     drawSpouseLinks(mainGroup, layoutResult);
//     // } else {
//     //     drawSiblingLinks(mainGroup, layoutResult);
//     //     drawLevel0SiblingLinks(mainGroup, layoutResult);
//     // }

//     setupZoom(svg, mainGroup);
//     // setupZoom(svg, mainGroup, false);


// }


// /**
//  * Configure le SVG initial
//  * @private
//  */
// function setupSVG() {
//     const width = window.innerWidth;
//     const height = window.innerHeight;
    
//     const svg = d3.select("#tree-svg")
//         .attr("width", width)
//         .attr("height", height);
    
//     svg.selectAll("*").remove();
//     return svg;
// }

// /**
//  * Crée le groupe principal pour le contenu
//  * @private
//  */
// function createMainGroup(svg) {
//     return svg.append("g")
//         .attr("transform", `translate(${state.boxWidth},${window.innerHeight/2})`);
// }

// /**
//  * Crée la mise en page de l'arbre
//  * @private
//  */

// function createTreeLayout() {
//     let layout = d3.tree()
//         .nodeSize([state.boxHeight * 1.8, state.boxWidth * 1.4]);

//     // Inverser la direction pour le mode descendants
//     if (state.treeModeReal  === 'descendants' || state.treeModeReal  === 'directDescendants') {
//         layout.nodeSize([state.boxHeight * 1.4, -state.boxWidth * 1.4]);
//     }

//     layout.separation((a, b) => {
//         if (state.treeModeReal  === 'both') {
//         // Pour le mode both, on va gérer les descendants différemment
//         layout = d3.tree()
//             .nodeSize([state.boxHeight * 1.8, state.boxWidth * 1.4])
//             .separation((a, b) => {
//                 // Si l'un est un descendant et l'autre non
//                 const aIsDescendant = a.data.isDescendant;
//                 const bIsDescendant = b.data.isDescendant;
                
//                 if (aIsDescendant !== bIsDescendant) {
//                     return 3; // Grand espacement entre ascendants et descendants
//                 }
                
//                 // Si les deux sont du même côté, espacement normal
//                 return 1;
//             });

//         }

//         if (state.treeModeReal  === 'descendants' || state.treeModeReal  === 'directDescendants') {
//             // Pour les couples entrelacés (personne + spouse)
//             if (a.data.isSpouse || b.data.isSpouse) {
//                 return 0.8;  // Espacement réduit entre une personne et son spouse
//             }
//             // Entre différentes familles
//             if (a.parent === b.parent) {
//                 return 0.8;  // Espacement entre frères/soeurs
//             }
//             return 1.0;  // Espacement entre branches différentes
//         } else {
//             // Mode ascendant : garder la logique existante
//             if (a.data.isSibling || b.data.isSibling) {
//                 return 0.65;
//             }
//             if (a.depth === (state.nombre_generation-1) && b.depth === (state.nombre_generation-1) && a.parent !== b.parent) {
//                 return 0.7;
//             }
//             if (a.parent === b.parent) {
                
//                 // ATTENTION ce calcul n'est pas clair pour calculer l'écartement entre 2 parents. Il faudra revoir ça
                
//                 const scale = Math.max(0.60, (state.nombre_generation - a.depth) / state.nombre_generation);
//                 return scale * (a.depth === b.depth ? 1.1 : 1.5);
//             }
//             return 1;
//         }
//     });

//     return layout;
// }

// // Fonction utilitaire pour nettoyer l'ID
// function cleanIdForSelector(id) {
//     // S'assurer que l'ID est une chaîne de caractères
//     const strId = String(id);
//     // Remplacer les caractères non autorisés (ici, tout sauf lettres, chiffres, tirets, underscores)
//     // Le '@' sera remplacé.
//     return strId.replace(/[^a-zA-Z0-9\-\_]/g, '_'); 
//     // Par exemple: "@I1@" devient "_I1_"
// }

// /**
//  * Dessine les nœuds de l'arbre
//  * @param {Object} group - Le groupe SVG principal
//  * @param {Object} root - La racine de l'arbre
//  * @param {Object} treeLayout - La mise en page de l'arbre
//  */
// function drawNodes(group, layout, isAnimation = false) {

//     const nodeGroups = group.selectAll(".node")
//         .data(layout.descendants())
//         .join("g")
//         // .filter(d => !d.data._isDescendantNode)
//         // .filter(d => !d.data._isDescendantNode && !d.data.isDescendantContainer) // Ajout du filtre
//         .filter(d => !d.data._isDescendantNode && 
//             !d.data.isDescendantContainer && 
//             !d.data.isVirtualRoot)  

//         .attr("class", "node")
//         .attr("id", d => `node-${cleanIdForSelector(d.data.id)}`)
//         .attr("transform", d => `translate(${d.y},${d.x})`)


//     drawNodeBoxes(nodeGroups);
//     drawNodeContent(nodeGroups);
//     addControlButtons(nodeGroups);


// }

// /**
//  * Configure le zoom
//  * @private
//  */
// function setupZoom(svg, mainGroup, applyInitialTransform = true) {
//     zoom = d3.zoom()
//         .scaleExtent([0.1, 3])
//         .on("zoom", ({transform}) => {
//             lastTransform = transform;
//             mainGroup.attr("transform", transform);
//         });

//     svg.call(zoom);
    
//     const initialTransform = lastTransform || d3.zoomIdentity
//         .translate(state.boxWidth, window.innerHeight/2)
//         .scale(0.8);

//     // recalage de l'arbre avce zoom 0.8, au milieu en hauteur et à une case à gauche!
//     if (applyInitialTransform) { 
//         svg.call(zoom.transform, initialTransform);
//     }
// }
// //#################################################################################













/**
 * Trouve les descendants généalogiques d'un sibling
 * @param {string} siblingId - ID du sibling
 * @returns {Object} - Informations sur les descendants
 */
function findDescendantsForSibling(siblingId, isAnimation, nextNodeId) {
    const person = state.gedcomData.individuals[siblingId];
    let childrenIds = [];
    let childrenData = [];
    
    if (person && person.spouseFamilies) {
        person.spouseFamilies.forEach(famId => {
            const family = state.gedcomData.families[famId];
            if (family && family.children && family.children.length > 0) {
                // Récupérer les IDs et les données des enfants
                family.children.forEach(childId => {
                    const childPerson = state.gedcomData.individuals[childId];
                    if (childPerson) {
                      // Ne filtrer que si on est en mode animation: e, mode animation n'ajouter que si c'est le nextNodeId ou si nextNodeId n'est pas défini
                      if (!isAnimation || (isAnimation && (!nextNodeId || childId === nextNodeId))) { 
                            childrenIds.push(childId);
                            childrenData.push({
                                id: childId,
                                name: childPerson.name,
                                birthDate: childPerson.birthDate,
                                deathDate: childPerson.deathDate
                            });
                        }
                    }
                });
            }
        });
    }
    
    // console.log("\n\n\n *** DEBUG in findDescendantsForSibling   *** Descendants trouvés pour", siblingId, ":", childrenIds, childrenData, isAnimation, nextNodeId);
    return {
        childrenIds: childrenIds,
        childrenData: childrenData
    };
}


function removeNodeFromTreeIfNoChildren(tree, nodeIdToRemove) {
    if (!tree) return null;

    // Fonction pour vérifier si un nœud doit être supprimé
    const shouldRemoveNode = node => 
        node.id === nodeIdToRemove && 
        (!node.children || node.children.length === 0);

    // Filtrer les enfants directs
    if (tree.children) {
        tree.children = tree.children.filter(child => !shouldRemoveNode(child));
        // Appliquer récursivement aux enfants restants
        tree.children.forEach(child => removeNodeFromTreeIfNoChildren(child, nodeIdToRemove));
    }

    // Filtrer les siblings
    if (tree.siblings) {
        tree.siblings = tree.siblings.filter(sibling => !shouldRemoveNode(sibling));
        // Appliquer récursivement aux siblings restants
        tree.siblings.forEach(sibling => removeNodeFromTreeIfNoChildren(sibling, nodeIdToRemove));
    }

    return tree;
}


function findNodeAndPositionInTree(tree, nodeId) {
    if (!tree) return null;
    
    function searchInLevel(nodes) {
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].id === nodeId) {
                return {
                    node: nodes[i],
                    parentArray: nodes,
                    index: i
                };
            }
            
            // Recherche dans les children
            if (nodes[i].children) {
                const result = searchInLevel(nodes[i].children);
                if (result) return result;
            }
        }
        return null;
    }
    
    // Commencer par les children de la racine
    if (tree.children) {
        const result = searchInLevel(tree.children);
        if (result) return result;
    }
    
    return null;
}

// Utilisation pour insérer la spouse
function insertSpouseAfterPartner(tree, partnerId, spouse) {
    const nodeInfo = findNodeAndPositionInTree(tree, partnerId);
    if (nodeInfo) {
        // Insérer la spouse juste après son conjoint
        nodeInfo.parentArray.splice(nodeInfo.index + 1, 0, {
            ...spouse,
            isSpouse: true,
            spouseOf: partnerId
        });
    }
}




function findNodePositionInSiblingsList(tree, nodeId) {
    // console.log("\n=== RECHERCHE POSITION DANS GEN N ===");
    // console.log("Recherche du nœud:", nodeId, state.gedcomData.individuals[nodeId]?.name);
    
    // Chercher récursivement le conteneur qui contient la gen N
    function findContainerWithNode(node) {
        if (!node) return null;
        
        // Vérifier si les children de ce nœud contiennent notre nodeId
        if (node.children?.some(n => n.id === nodeId || (n.siblingReferenceId && n.id === nodeId))) {
            // console.log("Container trouvé dans:", {
            //     containerName: node.name,
            //     containerGen: node.generation,
            //     children: node.children.map(c => ({
            //         name: c.name,
            //         id: c.id,
            //         gen: c.generation
            //     }))
            // });
            return node;
        }
        
        // Chercher dans les children
        for (const child of node.children || []) {
            const foundContainer = findContainerWithNode(child);
            if (foundContainer) return foundContainer;
        }
        
        return null;
    }

    // Chercher le conteneur dans tout l'arbre
    let genNContainer = findContainerWithNode(tree);

    if (!genNContainer) {
        // console.log("❌ Pas de container trouvé pour:", state.gedcomData.individuals[nodeId]?.name);
        return -1;
    }

    // Lister les noeuds de la gen N pour debug
    // console.log("Noeuds trouvés dans le container:");
    // genNContainer.children.forEach((node, idx) => {
    //     console.log(`${idx}. ${node.name} (id: ${node.id}, gen: ${node.generation})`);
    // });

    // Trouver la position du noeud
    const position = genNContainer.children.findIndex(node => node.id === nodeId);
    
    // console.log(`Position finale pour ${state.gedcomData.individuals[nodeId]?.name}: ${position}`);
    return position;
}


function findInsertionPointForDescendant(tree, descendantNode) {
    // console.log("\n=== RECHERCHE POINT D'INSERTION ===");
    // console.log("Descendant à insérer:", {
    //     name: descendantNode.name,
    //     generation: descendantNode.generation,
    //     parentId: descendantNode.genealogicalParentId,
    //     parent: state.gedcomData.individuals[descendantNode.genealogicalParentId]?.name
    // });

    // 1. Trouver toutes les branches contenant des gen 1
    let possibleBranches = tree.children.filter(branch => 
        branch.children?.some(n => n.generation === descendantNode.generation)
    );

    // console.log("Branches possibles:", possibleBranches.map(b => ({
    //     name: b.name,
    //     children: b.children.map(c => c.name)
    // })));

    // 2. Choisir la branche appropriée (celle qui contient déjà des descendants du même parent)
    let targetBranch = possibleBranches.find(branch => 
        branch.children?.some(n => n.genealogicalParentId === descendantNode.genealogicalParentId)
    );

    // Si aucune branche ne contient de descendants du même parent, prendre la première
    if (!targetBranch) {
        targetBranch = possibleBranches[0];
    }

    if (!targetBranch) {
        // console.log("❌ Pas de branche trouvée avec la génération", descendantNode.generation);
        return 0;
    }

    // console.log("✅ Branche cible choisie:", {
    //     name: targetBranch.name,
    //     children: targetBranch.children.map(c => c.name)
    // });

    // Comparer les positions des parents dans gen N 
    const existingDescendants = targetBranch.children;
    const newParentPos = findNodePositionInSiblingsList(tree, descendantNode.genealogicalParentId);

    for (let i = 0; i < existingDescendants.length; i++) {
        const existingParentPos = findNodePositionInSiblingsList(tree, existingDescendants[i].genealogicalParentId);
        // console.log("Comparaison positions:", {
        //     newParent: state.gedcomData.individuals[descendantNode.genealogicalParentId]?.name,
        //     newPos: newParentPos,
        //     existingParent: state.gedcomData.individuals[existingDescendants[i].genealogicalParentId]?.name, 
        //     existingPos: existingParentPos
        // });

        if (newParentPos < existingParentPos) {
            // console.log(`=> Insertion à la position ${i} dans la branche ${targetBranch.name}`);
            return i;
        }
    }
    // console.log(`=> Insertion à la fin de la branche ${targetBranch.name}`);
    return existingDescendants.length;

}






function nodeExistsInTree(tree, nodeId) {
    if (!tree) return false;
    
    // Fonction récursive pour chercher dans toute la structure
    function searchInSubtree(node) {
        if (!node) return false;
        
        // Vérifier le nœud actuel
        if (node.id === nodeId) return true;
        
        // Vérifier dans les children
        if (node.children) {
            for (const child of node.children) {
                if (searchInSubtree(child)) return true;
            }
        }
        
        // Vérifier dans les siblings
        if (node.siblings) {
            for (const sibling of node.siblings) {
                if (searchInSubtree(sibling)) return true;
            }
        }
        
        return false;
    }
    
    return searchInSubtree(tree);
}



function removeNodesFromTree(originalTree, descendantNode) {
    // console.log("Suppression des nœuds doublons entre originalTree et descendantNode");
    
    // Récupérer tous les IDs présents dans descendantNode
    function collectIds(node, ids = new Set()) {
        if (!node) return ids;
        
        ids.add(node.id);
        
        // Parcourir les children
        if (node.children) {
            node.children.forEach(child => collectIds(child, ids));
        }
        
        // Parcourir les siblings
        if (node.siblings) {
            node.siblings.forEach(sibling => collectIds(sibling, ids));
        }
        
        return ids;
    }
    
    // IDs à supprimer
    const idsToRemove = collectIds(descendantNode);
    // console.log("IDs à supprimer:", Array.from(idsToRemove));
    // console.log("IDs à supprimer:", Array.from(idsToRemove).map(id => ({
    //     id: id,
    //     name: state.gedcomData.individuals[id]?.name || 'inconnu'
    // })));

    // Fonction récursive pour filtrer l'arbre
    function filterTree(node) {
        if (!node) return null;
        
        // Filtrer les children
        if (node.children) {
            node.children = node.children.filter(child => !idsToRemove.has(child.id));
            node.children.forEach(filterTree);
        }
        
        // Filtrer les siblings
        if (node.siblings) {
            node.siblings = node.siblings.filter(sibling => !idsToRemove.has(sibling.id));
            node.siblings.forEach(filterTree);
        }
        
        return node;
    }

    // Filtrer l'arbre original
    return filterTree(originalTree);
}




/**
 * Convertit n'importe quel arbre en arbre avec virtual root
 * @param {Object} inputTree - L'arbre d'entrée à convertir
 * @returns {Object} - L'arbre converti avec virtual root
 */
function convertToVirtualRootTree(inputTree) {
    // console.log("\n=== CONVERSION EN VIRTUAL ROOT ===");
    // console.log("⭐ Structure avant conversion:", JSON.stringify(inputTree, null, 2));

    if (inputTree.isVirtualRoot) {
        // console.log("Arbre déjà en virtual root");
        return inputTree;
    }

    // Créer la structure virtual root de base
    let virtualRootTree = {
        id: 'super_root',
        name: '',
        generation: -1,
        isVirtualRoot: true,
        children: [],
        mainBranch: 0,
    };

    // Ajouter d'abord les siblings triés par date de naissance
    if (inputTree.siblings) {
        // console.log("Ajout des siblings triés par date de naissance");
        let siblings = Array.isArray(inputTree.siblings) ? 
            inputTree.siblings : [inputTree.siblings];

        // Trier les siblings
        siblings.sort((a, b) => {
            const yearA = a.birthDate ? parseInt(extractYear(a.birthDate)) : 9999;
            const yearB = b.birthDate ? parseInt(extractYear(b.birthDate)) : 9999;
            return yearA - yearB; // Du plus âgé au plus jeune
        });

        // Séparer les siblings avec et sans date de naissance
        const siblingsWithDate = siblings.filter(s => s.birthDate);
        const siblingsWithoutDate = siblings.filter(s => !s.birthDate);

        // Ajouter d'abord les siblings avec date, puis ceux sans date
        [...siblingsWithDate, ...siblingsWithoutDate].forEach(sibling => {
            virtualRootTree.children.push({
                ...sibling,
                generation: inputTree.generation,
                isSibling: true,
                mainBranch: 50,
            });
        });
    }

    // Copier la racine avec sa génération originale
    let rootNode = { ...inputTree };
    delete rootNode.siblings;
    delete rootNode.spouses;
    virtualRootTree.children.push(rootNode);

    // Ajouter les spouses après la racine
    if (inputTree.spouses) {
        // console.log("Ajout des spouses après la racine");
        let spouses = Array.isArray(inputTree.spouses) ? 
            inputTree.spouses : [inputTree.spouses];
        
        spouses.forEach(spouse => {
            virtualRootTree.children.push({
                ...spouse,
                generation: rootNode.generation,
                isSpouse: true,
                spouseOf: rootNode.id,
                mainBranch: 1,
            });
        });
    }

    // console.log("⭐ Structure après conversion:", JSON.stringify(virtualRootTree, null, 2));
    return virtualRootTree;
}


function restructureTreeForDescendant(descendantData_all, parentSiblingId, parentName)  {


    // Convertir l'arbre en virtual root dès le début
    state.currentTree = convertToVirtualRootTree(state.currentTree);
    
      
    // Vérifier si les descendants sont déjà présents dans l'arbre
    let allDescendantsExist = true;
    let existingDescendants = [];
    
    // console.log("\n=== VÉRIFICATION DES DESCENDANTS EXISTANTS ===");
    for (let i = 0; i < descendantData_all.length; i++) {
        const descendant = descendantData_all[i];
        // console.log("Vérification du descendant:", descendant.id, descendant.name);
        
        const exists = nodeExistsInTree(state.currentTree, descendant.id);
        if (exists) {
            // console.log(`⚠️ Le descendant ${descendant.name} existe déjà dans l'arbre`);
            existingDescendants.push(descendant);
        } else {
            // console.log(`✅ Le descendant ${descendant.name} peut être ajouté`);
            allDescendantsExist = false;
        }
    }

    // Si tous les descendants existent déjà, ne rien faire
    if (allDescendantsExist) {
        // console.log("❌ Tous les descendants existent déjà dans l'arbre - Annulation de la restructuration");


        // ATTENTION   : dans ce cas il faut mettre à jour les lien du descendant et du parent pour être sur que la liaison apparait  : cas de Raould GOYON et Mathilde GOUYON 
        // A FAIRE 


        return;
    }

    // Filtrer les descendants pour ne garder que ceux qui n'existent pas déjà
    descendantData_all = descendantData_all.filter(d => !existingDescendants.some(ed => ed.id === d.id));
    // let descendantData = descendantData_all[0];

    // console.log("=== DÉBUT RESTRUCTURATION ===");
    // for (let i = 0; i < descendantData_all.length; i++) {
    //     console.log("Restructuration avec descendant:", descendantData_all[i].id, descendantData_all[i].name, " parent:", parentSiblingId, parentName);
    // }





    
    let offset_generation = 0;
    let isInputTreeVirtualRoot = false;

    if (state.currentTree.isVirtualRoot) 
    {
        offset_generation = state.currentTree.generation + 1;
        isInputTreeVirtualRoot = true;
    }
   
    let originalTree = JSON.parse(JSON.stringify(state.currentTree));
    // console.log("⭐ Structure avant l'insertion :", JSON.stringify(state.currentTree, null, 2));


    // Trouver le sibling parent dans l'arbre : fonctionne aussi avec virtual root
    let parentSiblingNode = findNodeInTree(originalTree, parentSiblingId);

    if (!parentSiblingNode) {
        // console.error("Parent sibling non trouvé dans l'arbre");
        // Vérifier si le parentSiblingNode est dans les spouses
        const isInSpouses = function(tree, parentSiblingId) {
            if (!tree.spouses) return false;

            if (Array.isArray(tree.spouses)) {
                return tree.spouses.some(spouse => spouse.id === parentSiblingId);
            } else {
                // Si spouses est un objet unique
                return tree.spouses.id === parentSiblingId;
            }
        };

        // En virtual root il n'a pas d'attribut spouse au niveau -1
        if (isInSpouses(originalTree, parentSiblingId)) {
            // console.log("Le parentSiblingId est un spouse, donc on remplace le parentSiblingId par la racine de l'arbre ");
            // console.log(originalTree.id, originalTree)
            parentSiblingId = originalTree.id;
            parentSiblingNode = findNodeInTree(originalTree, parentSiblingId);
            if (!parentSiblingNode) {
                // console.error("Parent sibling non trouvé dans l'arbre");
                return;
            }
        } else {
            // console.log("Le parentSiblingId n'est pas un spouse");
            return;
        }
    }



    // Déterminer la génération du descendant : marche aussi en virtual root
    const parentGeneration = parentSiblingNode.generation;
    const descendantGeneration = parentGeneration - 1; // Génération plus jeune
    const targetGenerationToAnchorTheDescendant = parentGeneration - 2; // Génération plus jeune

    // console.log("Génération du parent sibling:", parentGeneration);
    // console.log("Génération assignée au descendant:", descendantGeneration);
    // console.log("Génération à laquelle rattacher le descendant:", targetGenerationToAnchorTheDescendant);
    
   
    
    // rechercher si les enfants ont des spouses : fonctionne aussi en virtual root
    let childSpouseNodes = [];

    for (let i = 0; i < descendantData_all.length; i++) {
        const child = state.gedcomData.individuals[descendantData_all[i].id];
        if (child.spouseFamilies) {
            childSpouseNodes[i] = [];
            child.spouseFamilies.forEach(spouseFamId => {
                const spouseFamily = state.gedcomData.families[spouseFamId];
                const childSpouseId = spouseFamily.husband === descendantData_all[i].id ? 
                    spouseFamily.wife : spouseFamily.husband;
                
                if (childSpouseId) {
                    const spouse = state.gedcomData.individuals[childSpouseId];
                    childSpouseNodes[i].push({
                        id: childSpouseId,
                        name: spouse.name,
                        birthDate: spouse.birthDate || "",
                        deathDate: spouse.deathDate || "",
                        generation: 0,
                        isSpouse: true,
                        spouseOf: descendantData_all[0].id,
                        mainBranch: 2,
                    });
                }
            });
        }
    }


    // rechercher si le parentSiblingId a une ou des spouses : fonctionne aussi en virtual root
    const parent = state.gedcomData.individuals[parentSiblingId];

    let parentSpousesNodes;

    if (parent.spouseFamilies) {
        parentSpousesNodes = [];
        parent.spouseFamilies.forEach(spouseFamId => {
            const spouseFamily = state.gedcomData.families[spouseFamId];
            const parentSpouseId = spouseFamily.husband === parentSiblingId ? 
                spouseFamily.wife : spouseFamily.husband;
            
            if (parentSpouseId) {
                const spouse = state.gedcomData.individuals[parentSpouseId];
                parentSpousesNodes.push({
                    id: parentSpouseId,
                    name: spouse.name,
                    birthDate: spouse.birthDate || "",
                    deathDate: spouse.deathDate || "",
                    generation: 1,
                    isSpouse: true,
                    spouseOf: parentSiblingId,
                    mainBranch: 4,
                });
            }
        });
    }
    

    // ###############################################################################################################
    // Cas ou il y a une seule racine : pas besoin de virtual root, on décale tout pour insérer un descendant devant
    // on peut passer par là en virtual root
    if (parentGeneration === 0 ){
        offset_generation = state.currentTree.generation + 1;

        updateGenerationCount();
        console.log("⭐ Cas spécial: le parent du descendant est la racine (gen 0) : 1 seule racine");

        // rechercher les 2 parents du descendantData_all[0]
        const person = state.gedcomData.individuals[descendantData_all[0].id];
        const familiesWithChildren = person.families.filter(famId => {
            const family = state.gedcomData.families[famId];
            return family && family.children;
        });

        const genealogicalParents  = importLinks.treeOperations.findGenealogicalParent(descendantData_all[0].id, familiesWithChildren);
       

        let newTree = [];

        // demarrer le nouvel arbre en commencant par les nouveaux descendant 
        for (let i = 0; i < (descendantData_all.length); i++) {

            // rechercher les 2 parents du descendantData_all[i]
            const person = state.gedcomData.individuals[descendantData_all[i].id];
            const familiesWithChildren = person.families.filter(famId => {
                const family = state.gedcomData.families[famId];
                return family && family.children;
            });

            const genealogicalParents  = importLinks.treeOperations.findGenealogicalParent(descendantData_all[i].id, familiesWithChildren);
            
            
            const descendantNode = {
                id: descendantData_all[i].id,
                name: descendantData_all[i].name,
                generation: 0, // Même niveau que l'ancienne racine
                birthDate: descendantData_all[i].birthDate || "",
                deathDate: descendantData_all[i].deathDate || "",
                // sex: descendantData_all[i].sex,
                sex: person.sex,
                genealogicalParentId: genealogicalParents.original,
                genealogicalFatherId: genealogicalParents.father,
                genealogicalMotherId: genealogicalParents.mother,
                // siblingReferenceId: descendantData_all[0].id,
                appearedOnLeftClick: true,
                // isLeftDescendant: true,
                children: [],
                mainBranch: 2,
            };
           

            newTree.push(descendantNode);
            if (childSpouseNodes[i]) { 
                // newTree.push(...childSpouseNodes[i]) ; 

                let spouse;
                let index = 0;
                childSpouseNodes[i].forEach(spouseFamId => {
                    spouse = state.gedcomData.individuals[childSpouseNodes[i][index].id];
                    childSpouseNodes[i][index].sex = spouse.sex; 
                    childSpouseNodes[i][index].mainBranch = 2; 
                    index++;   
                });
                newTree.push(...childSpouseNodes[i]) ; 
            }            
        }





        // si le parent du descendant est la racine (gen0), il faut incrémenter les générations de tous l'arbre, 
        // et il faut insérer le descendant en niveau 0
        // Incrémenter toutes les générations de l'arbre existant
        incrementAllGenerations(originalTree);


        originalTree = originalTree.children;


        newTree[0].children.push(...originalTree);


        //si il y a des spouses du parentSiblingId, il faut les ajouter si elles ne sont pas déjà là
        if (parentSpousesNodes.length > 0) {
            const parentIndex = newTree[0].children.findIndex(child => child.id === parentSiblingId);
            
            // Vérifier quelles spouses n'existent pas déjà
            const newSpouses = parentSpousesNodes.filter(spouse => {
                // Vérifier si cette spouse existe déjà dans newTree[0].children
                return !newTree[0].children.some(child => child.id === spouse.id);
            });
        
            // console.log("Spouses à ajouter:", {
            //     total: parentSpousesNodes.length,
            //     nouvelles: newSpouses.length,
            //     déjàPresentes: parentSpousesNodes.length - newSpouses.length
            // });
        
            // N'ajouter que les nouvelles spouses
            if (newSpouses.length > 0 && parentIndex !== -1) {
                if (Array.isArray(newSpouses)) {
                    newTree[0].children.splice(parentIndex + 1, 0, ...newSpouses);
                    // console.log(`${newSpouses.length} nouvelles spouses ajoutées après ${state.gedcomData.individuals[parentSiblingId].name}`);
                } else {
                    newTree[0].children.splice(parentIndex + 1, 0, newSpouses);
                    // console.log(`1 nouvelle spouse ajoutée après ${state.gedcomData.individuals[parentSiblingId].name}`);
                }
            }
        }


        // Créer la structure virtual root de base
        state.currentTree = {
            id: 'super_root',
            name: '',
            generation: -1,
            isVirtualRoot: true,
            children: Array.isArray(newTree) ? [...newTree] : [newTree],
            mainBranch: 0,
        };

    }
    
    
    // ###############################################################################################################
    // Cas ou le parent n'est pas en niveau 0, donc déjà une racine, et on veut en ajouter une autre: donc il faut un virtual root
    // on peut passer par là en virtual root
    else if (descendantGeneration < 1 ) {

        console.log("⭐ Cas spécial: descendantGeneration < 1 :  out virtual root , gen=", descendantGeneration, "racine gen", originalTree.generation, ", input virtual root ?", originalTree.isVirtualRoot );
        if (descendantGeneration - offset_generation < 0)
        {
            updateGenerationCount();
        }

        let newTree;
        newTree = originalTree;
      

        let currentInsertionState = {
            descendantCount: 0,
            spouseCount: 0
        };



        let parentNode;
        // Créer et insérer les nœuds des descendants un par un
        for (let i = 0; i < descendantData_all.length; i++) {
            const person = state.gedcomData.individuals[descendantData_all[i].id];
            const familiesWithChildren = person.families.filter(famId => {
                const family = state.gedcomData.families[famId];
                return family && family.children;
            });

            const genealogicalParents  = importLinks.treeOperations.findGenealogicalParent(descendantData_all[i].id, familiesWithChildren);

            const descendantData = descendantData_all[i];
            const descendantNode = {
                id: descendantData.id,
                name: descendantData.name,
                generation: 0, // Les descendants seront à la génération 0
                birthDate: descendantData.birthDate || "",
                deathDate: descendantData.deathDate || "",
                // sex:descendantData.sex,
                sex:person.sex,
                genealogicalParentId: genealogicalParents.original,
                genealogicalFatherId: genealogicalParents.father,
                genealogicalMotherId: genealogicalParents.mother,
                children: [],
                appearedOnLeftClick : true,
                mainBranch: 2,
            };
            if (i === 0) {

                descendantNode.children = [];
                let isSibling = false;
                //on insére d'abord le noeud du parentSiblingId
                for (let j = 0; j < originalTree.children.length; j++) {
                    // this is the node of the parentSiblingId
                    if (originalTree.children[j].id === parentSiblingId)  {
                        originalTree.children[j].isLeftDescendant = true; 
                        isSibling = originalTree.children[j].isSibling;
                        // descendantNode.children.push(originalTree.children[j]);
                    }
                }
                // recherche du 2ième parent qui n'est pas dans la liste
                parentNode = findGeneologicalParents(descendantNode.id).filter(parent => parent.id !== parentSiblingId);
                parentNode[0].generation = descendantNode.generation + 1;
                parentNode[0].children = [];
                parentNode[0].isLeftDescendant = true;
                if (isSibling)  { parentNode[0].isSiblingSpouse = true;}
                parentNode[0].isSpouse = true;
                parentNode[0].spouseOf = parentSiblingId;
                parentNode[0].mainBranch = 8;      


                // vérifier si le 2 ième parent existe déjà dans l'arbre
                let isndParentInStructure = false
                isndParentInStructure = originalTree.children.some(branch => 
                    branch.children?.some(node => node.id === parentNode[0].id)
                );

                
                if (!isndParentInStructure) { 
                    // Recherche et insertion du 2ème parent
                    // console.log(`Tentative Insertion du 2ème parent ${parentNode[0].name} après ${state.gedcomData.individuals[parentSiblingId].name}`);              

                    let parentBranchIndex = -1;
                    let parentIndexInBranch = -1;
                    let targetChildren = null;

                    for (let i = 0; i < newTree.children.length; i++) {
                        const branch = newTree.children[i];
                        // let index = -1;
                        if (branch.children) {
                            const index = branch.children.findIndex(node => node.id === parentSiblingId);
                            if (index !== -1) {
                                parentBranchIndex = i;
                                parentIndexInBranch = index;
                                targetChildren = branch.children;
                                break;
                            }
                        }
                    }

                    // Insérer après le parent dans la branche trouvée
                    if (parentIndexInBranch !== -1 && parentNode.length > 0 && targetChildren) {
                        targetChildren.splice(parentIndexInBranch + 1, 0, parentNode[0]);
                        // console.log(`Insertion du 2ème parent ${parentNode[0].name} après ${state.gedcomData.individuals[parentSiblingId].name}`);
                    }

                } else {
                    // console.log(`2ème parent already in structure ${parentNode[0].name} après ${state.gedcomData.individuals[parentSiblingId].name}`);              
                }


            }
            else
            {
                descendantNode.children = [];
            }


            // Insérer le descendant au début des enfants
            // console.log("Ajout du descendant à la racine virtuelle", descendantData.name);
                         
            // Trouver où insérer la nouvelle branche
            // let parentsAnalysis = analyzeGenEnfantVsGenParents(newTree,[descendantNode], 0, 1); //gen enfant =0, gen Parent = 1
            let parentsAnalysis = analyzeGenEnfantVsGenParentsNew(newTree,[descendantNode], 0, 1); //gen enfant =0, gen Parent = 1

            let {parentsMap, insertionPoints, spouseToParentMap} = parentsAnalysis; // On récupère aussi spouseToParentMap

            // Trouver le bon ID de parent
            let parentId = descendantNode.genealogicalParentId;
            let parentInfo = parentsMap.get(parentId);

            // Si on ne trouve pas le parent et que c'est un spouse, chercher le parent principal
            if (!parentInfo && spouseToParentMap && spouseToParentMap.has(parentId)) {
                parentId = spouseToParentMap.get(parentId);
                parentInfo = parentsMap.get(parentId);
                // console.log("Parent trouvé via spouseToParentMap:", {
                //     originalId: descendantNode.genealogicalParentId,
                //     spouseName: state.gedcomData.individuals[descendantNode.genealogicalParentId]?.name,
                //     parentId: parentId,
                //     parentName: state.gedcomData.individuals[parentId]?.name
                // });
            }

            if (!parentInfo) {
                // console.log("---- parentInfo n'existe pas ----------", {
                //     tentativeParentId: parentId,
                //     parentName: state.gedcomData.individuals[parentId]?.name
                // });
            }
            
            if (parentInfo) {

                // console.log( "---- parentInfo existe ----------", insertionPoints, insertionPoints.length)

                // Si on a des points d'insertion calculés
                if (insertionPoints && insertionPoints.length > 0) {
                    let insertPosition = insertionPoints[0].insertAfter;

                    // const spouseOffset = countPreviousParentSpouses(tree, parentId);
    
                    // Ajuster la position en fonction de la dernière insertion
                    // const offset = lastInsertionState.descendantCount + lastInsertionState.spouseCount;
                    // const offset =  lastInsertionState.spouseCount;
                    // insertPosition += offset;
                    
                    // console.log("Insertion avec offset:", {
                    //     basePosition: insertionPoints[0].insertAfter,
                    //     offset: 0,
                    //     finalPosition: insertPosition,
                    // });


                    // console.log("Insertion de", descendantNode.name, "en position", insertPosition);
                    newTree.children.splice(insertPosition, 0, descendantNode);



                    // // Cumuler pour cette insertion
                    // currentInsertionState.descendantCount++;
                    // if (childSpouseNodes[i]) {
                    //     currentInsertionState.spouseCount += childSpouseNodes[i].length;
                    // }


                    // if (childSpouseNodes[i]) { newTree.children.push(...childSpouseNodes[i]) ; }
                    // Insérer les spouses s'il y en a
                    if (childSpouseNodes[i]) {
                        // Trouver l'index actuel du descendant qu'on vient d'insérer
                        const descendantIndex = newTree.children.findIndex(node => node.id === descendantNode.id);
                        if (descendantIndex !== -1) {
                            // Insérer les spouses juste après
                            newTree.children.splice(descendantIndex + 1, 0, ...childSpouseNodes[i]);
                            // console.log(`Ajout de ${childSpouseNodes[i].length} spouse(s) après ${descendantNode.name}`);
                        }
                    }


                    // Après l'insertion
                    // console.log("État des branches APRÈS insertion:", newTree.children.map(c => ({
                    //     nom: c.name,
                    //     position: newTree.children.indexOf(c),
                    //     parentId: c.genealogicalParentId,
                    //     parentName: state.gedcomData.individuals[c.genealogicalParentId]?.name
                    // })));



                } else {
                    // Si pas de point d'insertion trouvé, ajouter après le dernier enfant du même parent
                    let insertPosition = parentInfo.children.length > 0 
                        ? Math.max(...parentInfo.children.map(c => c.position)) + 1 
                        : 0;
                    // console.log("Insertion par défaut à la position:", insertPosition, "pour", descendantNode.name);
                    newTree.children.splice(insertPosition, 0, descendantNode);

                    // if (childSpouseNodes[i]) {newTree.children.splice(insertPosition + 1, 0, ...childSpouseNodes[i]); }
                    // Insérer les spouses s'il y en a
                    if (childSpouseNodes[i]) {
                        const descendantIndex = newTree.children.findIndex(node => node.id === descendantNode.id);
                        if (descendantIndex !== -1) {
                            newTree.children.splice(descendantIndex + 1, 0, ...childSpouseNodes[i]);
                            // console.log(`Ajout de ${childSpouseNodes[i].length} spouse(s) après ${descendantNode.name}`);
                        }
                    }

                }
            }   

            else {
                // Si pas de parent trouvé, ajouter à la fin
                newTree.children.push(descendantNode);
            }
        } // end for loop

        // lastInsertionState = {...currentInsertionState};


        state.currentTree = newTree;
    } 
    
    

    // ###############################################################################################################
    // cas ou on ajoute des branches descendante mais pas encore besoin de virtual root car descendantGeneration >=1
    // mais après on peut passer par là aussi en virtual root
    else if (descendantGeneration >= 1) {
        console.log("⭐ Cas spécial: descendantGeneration >= 1, gen=", descendantGeneration, "racine gen", originalTree.generation, ", input virtual root ?", originalTree.isVirtualRoot );
        let descendantNodes = [];

        let descendantNode0;

        for (let i = 0; i < descendantData_all.length; i++) {
            // console.log("insertion du  descendant:", descendantData_all[i].id, descendantData_all[i].name, " parent:", parentSiblingId, parentName );

            let spouseForSex;
            const person = state.gedcomData.individuals[descendantData_all[i].id];
            const familiesWithChildren = person.families.filter(famId => {
                const family = state.gedcomData.families[famId];
                return family && family.children;
            });
    
            const genealogicalParents  = importLinks.treeOperations.findGenealogicalParent(descendantData_all[i].id, familiesWithChildren);


            // Créer le nouveau nœud pour le descendant
            let descendantNode = {
                id: descendantData_all[i].id,
                name: descendantData_all[i].name,
                generation: descendantGeneration,
                birthDate: descendantData_all[i].birthDate || "",
                deathDate: descendantData_all[i].deathDate || "",
                // sex: descendantData_all[i].sex,
                sex:person.sex,
                genealogicalParentId: genealogicalParents.original,
                genealogicalFatherId: genealogicalParents.father,
                genealogicalMotherId: genealogicalParents.mother, 
                isLeftDescendant: true, 
                children: [],
                appearedOnLeftClick : true,
                mainBranch: 2,
            };
        

            // rechercher si le noeud descendant existe déjà dans l'arbre
            let descendantInfo = findNodeAndPositionInTree(originalTree, descendantData_all[i].id);
            if (descendantInfo) {
                // Modifier directement dans le tableau parent
                if (!descendantInfo.parentArray[descendantInfo.index].children) {
                    descendantInfo.parentArray[descendantInfo.index].children = [];
                }

                if (!descendantInfo.parentArray[descendantInfo.index].genealogicalParentId) {
                    descendantInfo.parentArray[descendantInfo.index].genealogicalParentId = descendantNode.genealogicalParentId;
                }
                if (!descendantInfo.parentArray[descendantInfo.index].genealogicalFatherId) {
                    descendantInfo.parentArray[descendantInfo.index].genealogicalFatherId = descendantNode.genealogicalFatherId;
                }
                if (!descendantInfo.parentArray[descendantInfo.index].genealogicalMotherId) { 
                    descendantInfo.parentArray[descendantInfo.index].genealogicalMotherId = descendantNode.genealogicalMotherId;
                }

                descendantInfo.parentArray[descendantInfo.index].appearedOnLeftClick = true;

                // console.log(`\n\n#######  ATTENTION ############# Ce descendant existe déjà  ${descendantData_all[i].name}   sexe: ${state.gedcomData.individuals[parentSiblingId].sex} \n\n`);
            }


            // ajouter les spouses du parent
            let parentInfo;
            if (i===0) {
                parentInfo = findNodeAndPositionInTree(originalTree, parentSiblingId);
                if (parentInfo) {
                    // Modifier directement dans le tableau parent
                    parentInfo.parentArray[parentInfo.index].isLeftDescendant = true;
                    // console.log(`Flag isLeftDescendant mis à true pour ${parentInfo.node.name}`);
                }
                if (parentSpousesNodes.length > 0) {
                    parentSpousesNodes.forEach(spouse => {
                        // Vérifier si le spouse existe déjà dans la structure
                        spouseForSex = state.gedcomData.individuals[spouse.id];
                        spouse.sex = spouseForSex.sex;
                        spouse.isLeftDescendant = true;   
                        spouse.generation = parentInfo.parentArray[parentInfo.index].generation;  
                        spouse.mainBranch = 2; 
                        if (parentInfo.parentArray[parentInfo.index].isSibling) { spouse.isSiblingSpouse = true; }
                        const spouseExists = findNodeInTree(originalTree, spouse.id);
                        if (!spouseExists) {
                            insertSpouseAfterPartner(originalTree, parentSiblingId, spouse);
                        }
                    });
    
                }
            }
            

            // Trouver où insérer le descendant dans l'arbre
            // Vérifier si le nœud existe déjà dans toute la structure, sinon on ne l'insère pas
            const nodeExists = nodeExistsInTree(originalTree, descendantNode.id);
            if (!nodeExists) {
                // if ((descendantGeneration === 1) && ((originalTree.generation === 0) || (originalTree.generation === 1 ) && (isInputTreeVirtualRoot) )){
                
                let targetBranchIndex;

                // 1. Trouver toutes les branches gen 1
                let possibleBranches = originalTree.children.filter(branch => 
                    branch.children?.some(n => n.generation === descendantNode.generation)
                );
        
                // console.log("Branches possibles trouvées:", possibleBranches.map(b => b.name));
        
                // 2. Choisir la bonne branche (celle avec des descendants du même parent)
                targetBranchIndex = originalTree.children.findIndex(branch => 
                    branch.children?.some(n => n.genealogicalParentId === descendantNode.genealogicalParentId)
                );
        
                // Si pas trouvé, prendre la première branche avec gen 1
                if (targetBranchIndex === -1) {
                    targetBranchIndex = originalTree.children.findIndex(branch => 
                        branch.children?.some(n => n.generation === descendantNode.generation)
                    );
                }
                

                let parentsAnalysis = analyzeGenEnfantVsGenParentsNew(originalTree, [descendantNode], descendantGeneration, descendantGeneration+1); //gen enfant=1, gen Parent = 2
                let {parentsMap, insertionPoints, spouseToParentMap} = parentsAnalysis; // On récupère aussi spouseToParentMap
                // const insertIndex = findInsertionPointForDescendant(originalTree, descendantNode);
                let insertIndex = 0;
                // Si on a des points d'insertion calculés
                if (insertionPoints && insertionPoints.length > 0) {
                    insertIndex = insertionPoints[0].insertAfter;
                }
                
                
                if (descendantGeneration === 1 ) {
                    // Ajouter le descendant comme enfant direct de la racine
                    // en position 0 pour qu'il apparaisse à gauche
                    if (!originalTree.children) {
                        originalTree.children = [];
                    }

                    // Supprimer les doublons de l'arbre original
                    if (i===0) {originalTree = removeNodesFromTree(originalTree, descendantNode0);}
                    
                    originalTree.children[targetBranchIndex].children.splice(insertIndex, 0, descendantNode);

                    //insérer les spouses du descendant
                    if  (childSpouseNodes[i] )
                    {
                        for (let j = 0; j < childSpouseNodes[i].length; j++) {
                            spouseForSex = state.gedcomData.individuals[childSpouseNodes[i][j].id];
                            childSpouseNodes[i][j].sex = spouseForSex.sex;
                            childSpouseNodes[i][j].generation = 1;
                            childSpouseNodes[i][j].mainBranch = 2;
                        }
                        originalTree.children[targetBranchIndex].children.splice(insertIndex+1, 0, ...childSpouseNodes[i]);
                    }

                }  else if (descendantGeneration > 1 ){
                    // console.log("Cas descendant gen", descendantGeneration, "racine gen", originalTree.generation, originalTree.isVirtualRoot, originalTree);

                    const parentAnchorNode = findParentNodeInTreeByGeneration(originalTree, targetGenerationToAnchorTheDescendant);
                    // console.log("Parent Anchor :", parentAnchorNode );
                    if (!parentAnchorNode.children) {
                        parentAnchorNode.children = [];
                    }
                    // Supprimer les doublons de l'arbre original
                    if (i===0) {originalTree = removeNodesFromTree(originalTree, descendantNode0);}

                    // parentAnchorNode.children.unshift(descendantNode);

                    // parentAnchorNode.children.push(descendantNode);
                    parentAnchorNode.children.splice(insertIndex, 0, descendantNode);


                    // à modifier pour insérer exactement ou il faut, car le findParentNodeInTreeByGeneration trouve seulement le node de rattachement la la gen N-1

                    //insérer les spouses du descendant
                    if  (childSpouseNodes[i] ) {
                        // Trouver l'index où on vient d'insérer le descendant
                        const descendantIndex = parentAnchorNode.children.findIndex(node => node.id === descendantNode.id);
                        if (descendantIndex !== -1) {
                            // Insérer les spouses juste après le descendant
                            for (let j = 0; j < childSpouseNodes[i].length; j++) {
                                spouseForSex = state.gedcomData.individuals[childSpouseNodes[i][j].id];
                                childSpouseNodes[i][j].sex = spouseForSex.sex;
                                childSpouseNodes[i][j].generation = descendantGeneration;
                                childSpouseNodes[i][j].mainBranch = 2;
                            }
                            parentAnchorNode.children.splice(descendantIndex + 1, 0, ...childSpouseNodes[i]);
                            // console.log(`Ajout de ${childSpouseNodes[i].length} spouse(s) après ${descendantNode.name}`);
                        }

                    }
                }
            }
        }






        state.currentTree = originalTree;   
    }   
    
    
    return [descendantGeneration, parentGeneration];

    // console.log("⭐ Structure finale:", JSON.stringify(state.currentTree, null, 2));
    // console.log("Arbre restructuré avec descendant:", state.currentTree);
}



// Compter les spouses des descendants du parent précédent
function countPreviousParentSpouses(tree, currentParentId) {
    let spouseCount = 0;
    let previousParentFound = false;
    
    // Parcourir les branches gen 1 pour trouver le parent précédent
    tree.children.forEach(branch => {
        if (branch.children) {
            branch.children.forEach(node => {
                if (node.generation === 1) {
                    // Si on trouve le parent actuel, on arrête
                    if (node.id === currentParentId) {
                        previousParentFound = false;
                        return;
                    }
                    
                    // Pour le parent précédent
                    if (previousParentFound) {
                        // Compter les spouses de ses descendants en gen 0
                        tree.children.forEach(descendantBranch => {
                            if (descendantBranch.generation === 0 && 
                                descendantBranch.genealogicalParentId === node.id) {
                                // Compter les spouses qui suivent ce descendant
                                let nextIndex = tree.children.indexOf(descendantBranch) + 1;
                                while (nextIndex < tree.children.length && 
                                       tree.children[nextIndex].isSpouse && 
                                       tree.children[nextIndex].spouseOf === descendantBranch.id) {
                                    spouseCount++;
                                    nextIndex++;
                                }
                            }
                        });
                    }
                    previousParentFound = true;
                }
            });
        }
    });

    // console.log(`Nombre de spouses trouvés pour les descendants du parent précédent: ${spouseCount}`);
    return spouseCount;
}




// Fonction auxiliaire pour trouver les positions des parent en gen N et des enfants en gen N-1
function analyzeGenEnfantVsGenParents(tree, newDescendant, genEnfant, genParent) {

    // console.log("\n=== analyzeGenEnfantVsGenParents : ANALYSE DES PARENTS GEN ", genParent , " ===");
    // console.log("⭐ Structure tree:", JSON.stringify(tree, null, 2));
    // console.log(" @@@@@ DEBUG @@@@ newDescendant =", newDescendant[0])

    let parentsMap = new Map();
    let spouseToParentMap = new Map();

    // 1. Analyse des parents en gen parent
    tree.children.forEach((branch, branchIndex) => {
        // console.log(" - branch=", branchIndex);
        branch.children?.forEach((node, nodeIndex) => {
            // console.log(" - node=", nodeIndex, node);
            if ((node.generation === genParent) || (node.isSpouse && node.spouseOf)) {
                // console.log(`Node trouvé:`, {
                //     name: node.name,
                //     id: node.id,
                //     isSpouse: node.isSpouse,
                //     spouseOf: node.spouseOf,
                //     generation: node.generation,
                //     position: nodeIndex
                // });

                parentsMap.set(node.id, {
                    branchIndex: branchIndex,
                    positionInBranch: nodeIndex,
                    children: [],
                    isSpouse: node.isSpouse,
                    spouseOf: node.spouseOf
                });

                if (node.isSpouse && node.spouseOf) {
                    spouseToParentMap.set(node.id, node.spouseOf);
                }
            }
        });
    });

    // 2. Analyse des enfants existants en gen enfant
    // console.log("\nMAP DES ENFANTS EXISTANTS (GEN enfant):");
    let lastPositionByParent = new Map();
    tree.children.forEach((branch, branchIndex) => {
        if (branch.generation === genEnfant) {
            let parentId = branch.genealogicalParentId;
            
            if (spouseToParentMap.has(parentId)) {
                parentId = spouseToParentMap.get(parentId);
            }
            
            // console.log(`Enfant existant: ${branch.name}`, {
            //     position: branchIndex,
            //     parentId: parentId,
            //     parentName: state.gedcomData.individuals[parentId]?.name,
            //     isSpouse: branch.isSpouse,
            //     spouseOf: branch.spouseOf
            // });

            let parentEntry = parentsMap.get(parentId);
            if (parentEntry) {
                parentEntry.children.push({
                    branch: branch,
                    position: branchIndex
                });
                if (!branch.isSpouse) {
                    lastPositionByParent.set(parentId, branchIndex);
                }
            }
        }
    });

    // 3. Déterminer les positions d'insertion
    let insertionPoints = [];



    let parentId = newDescendant[0].genealogicalParentId;
    if (spouseToParentMap.has(parentId)) {
        parentId = spouseToParentMap.get(parentId);
    }


    const parentInfo = parentsMap.get(parentId);
    if (parentInfo) {
        let lastSiblingPosition = -1;
        let previousParentLastChild = -1;
        let spouseoffset = 0;


        // Trouver le dernier sibling et considérer ses spouses, et les spouses des autres de la même generation
        // boucle sur toutes les branches : tous les descendants en generation enfant
        tree.children.forEach((branch, index) => {
            // console.log("--------- DEBUG ---- branch index= ", index, "name=" , branch.name, "-------- descendant", newDescendant[0].name, "parentId=", parentId, ",  index ", index, ", spouse ?", branch.isSpouse,  "branch.genealogicalParentId=" ,branch.genealogicalParentId,",  parentInfo.positionInBranch=" , parentInfo.positionInBranch,)
            // console.log("--------- debug ----------- descendant", newDescendant[0].name, "parentId=", parentId, ",  index ", index, ", spouse ?", branch.isSpouse,  "branch.genealogicalParentId=" ,branch.genealogicalParentId,",  parentInfo.positionInBranch="  ,parentInfo.positionInBranch, " parentsMap.get(branch.genealogicalParentId)=", parentsMap.get(branch.genealogicalParentId), ", branch ", branch )

            let genealogicalParentId;
            let genealogicalMotherId;
            if (branch.genealogicalParentId) {
                genealogicalParentId = branch.genealogicalParentId;
                genealogicalMotherId = branch.genealogicalMotherId;
            }
            if (branch.isSpouse) {
                if (branch.spouseOf)
                {
                    let descendant = findNodeInTree(tree, branch.spouseOf)
                    // console.log(' -------------- debug  SPOUSE of descendant ---------- ', branch.name,  descendant.genealogicalParentId, parentInfo.positionInBranch, "fatherId branch=", parentsMap.get(descendant.genealogicalParentId)?.positionInBranch, "motherId branch=", parentsMap.get(descendant.genealogicalMotherId)?.positionInBranch,", descendant.name=" , descendant.name, descendant )
                    genealogicalParentId = descendant.genealogicalParentId;
                    genealogicalMotherId = descendant.genealogicalMotherId;
                }
            }            
            if (genealogicalParentId === parentId || genealogicalMotherId === parentId) {
                // il s'agit d'un sibling (ou spouse de sibling) déjà inséré du descendant courant                  
                lastSiblingPosition = index;
                // donc on pourra insérer ce descendant juste en dessous de ce sibling : (index)
                // le spouse de ce sibling est déjà inséré
                // console.log(' -------------- debug  descendant same parent  ----- index=', index, 
                //     ',----- ', branch.name,  genealogicalParentId, parentInfo.positionInBranch, "fatherId branch=", parentsMap.get(genealogicalParentId)?.positionInBranch, "motherId branch=", parentsMap.get(genealogicalMotherId)?.positionInBranch, ", lastSiblingPosition=", lastSiblingPosition )
            } else if (genealogicalParentId &&  parentInfo.positionInBranch > parentsMap.get(genealogicalParentId)?.positionInBranch) {
                // il s'agit d'un descendant d'un autre parent que celui du descendant courant . Et ce parent se trouve avant le parent du descendant courant
                previousParentLastChild = index;
                // donc on pourra insérer ce descendant juste en dessous de ce descendant : (index )
                // console.log(' -------------- debug  descendant  from parent branch < parent branch of this  ------ index=', index, 
                //     ',----- ', branch.name,  branch.genealogicalParentId, parentInfo.positionInBranch, "fatherId branch=", parentsMap.get(genealogicalParentId)?.positionInBranch, "motherId branch=", parentsMap.get(genealogicalMotherId)?.positionInBranch, ", previousParentLastChild=", previousParentLastChild )
            }
            
        });

        
        // si on n'a pas vu de sibling de ce descendant, ni d'autres descendants des autres parents : lastSiblingPosition = -1 et previousParentLastChild = -1
        // donc dans cas insertPosition = 0 et on insère en tête des branches/
        // sinon on insère juste après le sibling ou l'autre descendant trouvé en prenant en compte les spouses
        let insertPosition = lastSiblingPosition !== -1 ? 
            lastSiblingPosition + 1 : 
            previousParentLastChild + 1;


        // console.log("--------- debug ----------- descendant", newDescendant[0].name, "parentId=", parentId, ",  insertPosition ", insertPosition)


        insertionPoints.push({
            descendant: newDescendant[0],
            insertAfter: insertPosition,
            reason: lastSiblingPosition !== -1 ? 
                `Après frère/sœur ${tree.children[lastSiblingPosition].name}` :
                `Après les enfants du parent précédent`
        });
    }

    return { parentsMap, insertionPoints, spouseToParentMap };
}



function analyzeGenEnfantVsGenParentsNew(tree, newDescendant, genEnfant, genParent) {

    // console.log(`\n=== analyzeGenEnfantVsGenParentsNew : ANALYSE DES PARENTS GEN ${genParent} et ENFANTS GEN ${genEnfant} ===`);
    // console.log("⭐ Structure tree:", JSON.stringify(tree, null, 2));
    // console.log(" @@@@@ DEBUG @@@@ newDescendant =", newDescendant[0])

    let parentsMap = new Map();
    let spouseToParentMap = new Map();
    let branchPositions = new Map(); // Pour stocker la position des branches de génération N-1
    let parentIndex = 0;
    
    // Fonction récursive pour trouver les nœuds de génération spécifique
    function findNodesInTree(node, branchIndex, nodeIndex = -1, currentDepth = 0, isInBranch = false) {
        // Traiter le nœud actuel
        if (isInBranch) {
            // Si ce nœud est de la génération parent ou un conjoint
            if (node.generation === genParent) {
                parentsMap.set(node.id, {
                    branchIndex: branchIndex,
                    positionInBranch: nodeIndex,
                    displayIndex: parentIndex++,
                    // children: [],
                    isSpouse: node.isSpouse,
                    spouseOf: node.spouseOf,
                    name: node.name,  // Ajout du nom
                    mainBranch: 14,
                });
    
                if (node.isSpouse && node.spouseOf) {
                    spouseToParentMap.set(node.id, node.spouseOf);
                }
            }
        }
    
        // Traiter ce nœud s'il est de génération N-1 (enfant)
        if (node.generation === genEnfant) {
            // Si c'est une branche principale
            if (!isInBranch) {
                branchPositions.set(node.id, branchIndex);
            }
        }
    
        // Parcourir récursivement les enfants
        if (node.children && node.children.length > 0) {
            node.children.forEach((child, index) => {
                findNodesInTree(child, branchIndex, index, currentDepth + 1, true);
            });
        }
    }
    
    // 1. Analyse des parents en gen N et stockage des positions des branches
    tree.children.forEach((branch, branchIndex) => {
        
        // Si cette branche est de génération N-1, enregistrer sa position
        if (branch.generation === genEnfant) {
            branchPositions.set(branch.id, branchIndex);
        }
        
        // Analyser les nœuds de cette branche
        if (branch.children) {
            branch.children.forEach((node, nodeIndex) => {
                findNodesInTree(node, branchIndex, nodeIndex, 0, true);
            });
        } else {
            findNodesInTree(branch, branchIndex, -1, 0, false);
        }
    });
    
    // Log pour vérifier la map des parents
    // console.log("\nRÉSULTAT - PARENT en génération ", genParent ,":");
    parentsMap.forEach((info, id) => {
        const personName = info.name || "Nom inconnu";
        const spouseStatus = info.isSpouse ? `(conjoint de ${info.spouseOf})` : "";
        // console.log(`Parent ID: ${id}, Nom: ${personName}  Branche: ${info.branchIndex}, Position: ${info.positionInBranch} displayIndex: ${info.displayIndex} ${spouseStatus} `);
    });
    
    // console.log("\nAssociations conjoint → parent principal:");
    spouseToParentMap.forEach((parentId, spouseId) => {
        const spouseInfo = parentsMap.get(spouseId);
        const parentInfo = parentsMap.get(parentId);
        // console.log(`Conjoint ${spouseId} (${spouseInfo?.name || "Nom inconnu"}) → Parent ${parentId} (${parentInfo?.name || "Nom inconnu"})`);
    });






    // 2. Analyse des enfants existants en gen N-1
    // console.log(`\nMAP DES ENFANTS EXISTANTS (GEN ${genEnfant}):`);
    let lastPositionByParent = new Map();
    let childrenByParent = new Map(); // Nouvelle map pour stocker les enfants par parent
    let globalPositionIndex = 0; 

    // Fonction récursive pour analyser les enfants
    function analyzeChildren(node, branchIndex) {
        if (!node) return;
        
        // Si c'est un nœud de la génération N-1
        if (node.generation === genEnfant) {
            // Informations de base du nœud
            const nodeInfo = {
                id: node.id,
                name: node.name,
                generation: node.generation,
                branchIndex: branchIndex,
                position: globalPositionIndex++,
                isSpouse: !!node.isSpouse,
                spouseOf: node.spouseOf || null,
                sex: node.sex,
                genealogicalParentId: node.genealogicalParentId,
                genealogicalMotherId: node.genealogicalMotherId,
                genealogicalFatherId: node.genealogicalFatherId,
                mainBranch: 15,
            };
            
            // Pour les nœuds non-spouses ou spouses avec un parentId défini
            if (node.genealogicalParentId) {
                // Ajouter l'enfant à la liste des enfants de son parent
                if (!childrenByParent.has(node.genealogicalParentId)) {
                    childrenByParent.set(node.genealogicalParentId, []);
                }
                
                childrenByParent.get(node.genealogicalParentId).push(nodeInfo);
                lastPositionByParent.set(node.genealogicalParentId, branchIndex);
            } 
            // Pour les spouses sans parentId défini
            else if (node.isSpouse && node.spouseOf) {
                // Trouver le conjoint principal dans l'arbre
                const mainSpouse = findNodeInTree(tree, node.spouseOf);
                if (mainSpouse && mainSpouse.genealogicalParentId) {
                    const parentId = mainSpouse.genealogicalParentId;
                    const motherId = mainSpouse.genealogicalMotherId;
                    
                    // Ajouter à la liste des enfants du même parent que son conjoint
                    if (!childrenByParent.has(parentId)) {
                        childrenByParent.set(parentId, []);
                    }
                    
                    // Mettre à jour les informations avec le parentId du conjoint principal
                    // ATENTION IL FAUDRA MODIFIER 9A si LES SPOUSE ou une vrai faimme ???
                    nodeInfo.genealogicalParentId = parentId;
                    nodeInfo.genealogicalMotherId = motherId;
                    nodeInfo.genealogicalFatherId = parentId;
                    nodeInfo.mainBranch = 16;
                    childrenByParent.get(parentId).push(nodeInfo);
                }
            }
            
            // Traiter les spouses de ce nœud
            if (node.spouses) {
                const spouses = Array.isArray(node.spouses) ? node.spouses : [node.spouses];

                spouses.forEach((spouse, spouseIndex) => {
                    // Créer les infos pour le spouse
                    const spouseInfo = {
                        id: spouse.id,
                        name: spouse.name,
                        generation: node.generation,
                        // branchIndex: branchIndex + spouseIndex + 1,
                        branchIndex: branchIndex,
                        position: globalPositionIndex++,
                        isSpouse: true,
                        spouseOf: node.id,
                        sex: spouse.sex,
                        // Utiliser le même parent que le nœud principal
                        genealogicalParentId: node.genealogicalParentId,
                        genealogicalMotherId: node.genealogicalMotherId,
                        genealogicalFatherId: node.genealogicalFatherId,
                        mainBranch: 17,
                    };
                    
                    // Ajouter le spouse au même parent que le nœud principal
                    if (node.genealogicalParentId) {
                        if (!childrenByParent.has(node.genealogicalParentId)) {
                            childrenByParent.set(node.genealogicalParentId, []);
                        }
                        childrenByParent.get(node.genealogicalParentId).push(spouseInfo);
                    }
                });
            }
        }
        
        // Analyser récursivement les enfants
        if (node.children && node.children.length > 0) {
            node.children.forEach((child, index) => {
                analyzeChildren(child, branchIndex);
            });
        }
    }

    // Analyser les enfants dans chaque branche
    tree.children.forEach((branch, branchIndex) => {
        analyzeChildren(branch, branchIndex);
    });

    // Log pour vérifier la map des enfants par parent
    // console.log("\nRÉSULTAT - ENFANTS PAR PARENT:");
    childrenByParent.forEach((children, parentId) => {
        const parentInfo = parentsMap.get(parentId);
        const parentName = parentInfo ? parentInfo.name : "Nom inconnu";
        // console.log(`Parent ${parentId} (${parentName}): ${children.length} enfant(s)/conjoint(s)`);
        children.forEach(child => {
            const spouseInfo = child.isSpouse ? ` (conjoint de ${child.spouseOf})` : "";
            // console.log(`  - ${child.name} (gen ${child.generation}, branche ${child.branchIndex},  genealogicalMotherId ${child.genealogicalMotherId})${spouseInfo}`);
        });
    });









    // 3. Déterminer les positions d'insertion
    let insertionPoints = [];

    let parentId = newDescendant[0].genealogicalParentId;
    // Si le parent est un conjoint, utiliser l'ID du parent principal
    if (spouseToParentMap.has(parentId)) {
        parentId = spouseToParentMap.get(parentId);
    }

    const parentInfo = parentsMap.get(parentId);
    if (parentInfo) {
        // console.log(`Analyse du placement pour le descendant ${newDescendant[0].name} (parent: ${parentId})`);
        
        // Position d'insertion par défaut (au début)
        let insertPosition = 0;
        let lastSiblingBranch = -1;
        let lastSiblingPosition = -1;
        let previousParentLastChild = -1;
        

        // Parcourir la map des enfants par parent
        childrenByParent.forEach((children, currentParentId) => {
            const currentParentInfo = parentsMap.get(currentParentId);
            
            // Pour chaque enfant, vérifier si c'est un frère/sœur ou un enfant d'un parent antérieur
            children.forEach(child => {
                // console.log(`Examen de l'enfant: ${child.name}, genealogicalParentId: ${child.genealogicalParentId}, genealogicalMotherId: ${child.genealogicalMotherId}`);
                
                // Vérifier si cet enfant a le même père ou la même mère que notre descendant
                if (child.genealogicalParentId === parentId || child.genealogicalMotherId === parentId) {
                    let childPosition = child.position; 
                    
                    if (childPosition > lastSiblingPosition) {
                        lastSiblingPosition = childPosition;
                        lastSiblingBranch = child.branchIndex;
                        // console.log(`  Frère/sœur trouvé(e): ${child.name} à la position ${childPosition}`);
                    }
                }
                // Si l'enfant a un parent antérieur dans l'arbre
                else if (child.genealogicalParentId && 
                        parentsMap.get(child.genealogicalParentId) &&  
                        parentInfo.displayIndex > parentsMap.get(child.genealogicalParentId).displayIndex) {
                    if (child.position > previousParentLastChild) { 
                        previousParentLastChild = child.position;
                        // console.log(`  Enfant d'un parent antérieur: ${child.name} à la position ${child.position}`);
                    }
                }
            });
        });




        
        // Détermination de la position d'insertion finale
        insertPosition = lastSiblingPosition !== -1 ? 
            lastSiblingPosition + 1 : 
            previousParentLastChild + 1;
        
        // console.log(`Position d'insertion finale pour ${newDescendant[0].name}: ${insertPosition}`);
        
        insertionPoints.push({
            descendant: newDescendant[0],
            insertAfter: insertPosition,
            branchIndex: lastSiblingBranch !== -1 ? lastSiblingBranch : previousParentLastChild + 1,
            reason: lastSiblingPosition !== -1 ? 
                `Après frère/sœur à la position ${lastSiblingPosition}` :
                `Après les enfants du parent précédent à la position ${previousParentLastChild}`
        });
    }

    return { parentsMap, insertionPoints, spouseToParentMap, childrenByParent };


}







function findParentPositionInGen1(tree, parentId) {
    let position = { branche: -1, index: -1 };
    
    tree.children.forEach((branch, branchIndex) => {
        if (branch.children) {
            const index = branch.children.findIndex(node => 
                node.generation === 1 && node.id === parentId
            );
            if (index !== -1) {
                position = { branche: branchIndex, index: index };
            }
        }
    });

    return position;
}





function findGeneologicalParents(personId) {
    const person = state.gedcomData.individuals[personId];
    let parents = [];
    
    if (person && person.families) {
        // Filtrer les familles où la personne est un enfant
        const familiesAsChild = person.families.filter(famId => {
            const family = state.gedcomData.families[famId];
            return family && 
                   family.children && 
                   family.children.includes(personId);
        });

        familiesAsChild.forEach(famId => {
            const family = state.gedcomData.families[famId];
            if (family) {
                if (family.husband) {
                    const father = state.gedcomData.individuals[family.husband];
                    parents.push({
                        id: family.husband,
                        name: father.name,
                        generation: 1, // génération du père
                        birthDate: father.birthDate || "",
                        deathDate: father.deathDate || "",
                        type: 'father',
                        mainBranch: 20,
                    });
                }
                if (family.wife) {
                    const mother = state.gedcomData.individuals[family.wife];
                    parents.push({
                        id: family.wife,
                        name: mother.name,
                        generation: 1, // génération de la mère
                        birthDate: mother.birthDate || "",
                        deathDate: mother.deathDate || "",
                        type: 'mother',
                        mainBranch: 21,
                    });
                }
            }
        });
    }
    
    return parents;
}



// Fonction auxiliaire pour incrémenter toutes les générations
function incrementAllGenerations(node) {
    if (!node) return;
    
    // Incrémenter la génération du nœud actuel
    node.generation++;
    
    // Récursivement incrémenter les générations des enfants
    if (node.children) {
        node.children.forEach(child => incrementAllGenerations(child));
    }
    
    // Traiter également les siblings s'ils existent
    if (node.siblings) {
        node.siblings.forEach(sibling => incrementAllGenerations(sibling));
    }
}


/**
 * Trouve un nœud dans l'arbre par son ID
 * @param {Object} tree - L'arbre à parcourir
 * @param {string} nodeId - ID du nœud à trouver
 * @returns {Object|null} - Le nœud trouvé ou null
 */
function findNodeInTree(tree, nodeId) {
    if (!tree || !nodeId) return null;
    
    if (tree.id === nodeId) {
        return tree;
    }
    
    // Chercher dans les enfants
    if (tree.children) {
        for (const child of tree.children) {
            const result = findNodeInTree(child, nodeId);
            if (result) {
                return result;
            }
        }
    }
    
    // Chercher aussi dans les siblings au niveau racine
    if (tree.siblings) {
        for (const sibling of tree.siblings) {
            if (sibling.id === nodeId) {
                return sibling;
            }
            
            // Chercher aussi dans les enfants des siblings
            if (sibling.children) {
                for (const child of sibling.children) {
                    const result = findNodeInTree(child, nodeId);
                    if (result) {
                        return result;
                    }
                }
            }
        }
    }
    
    return null;
}


/**
 * Trouve un nœud dans l'arbre par son ID
 * @param {Object} tree - L'arbre à parcourir
 * @param {string} generation - gen du neaoud à trouver
 * @returns {Object|null} - Le nœud trouvé ou null
 */
function findParentNodeInTreeByGeneration(tree, generation) {
    if (!tree || !generation) return null;
    
    if (tree.generation === generation) {
        return tree;
    }
    
    // Chercher dans les enfants
    if (tree.children) {
        for (const child of tree.children) {
            const result = findParentNodeInTreeByGeneration(child, generation);
            if (result) {
                return result;
            }
        }
    }
    
    // Chercher aussi dans les siblings au niveau racine
    if (tree.siblings) {
        for (const sibling of tree.siblings) {
            if (sibling.generation === generation) {
                return sibling;
            }
            
            // Chercher aussi dans les enfants des siblings
            if (sibling.children) {
                for (const child of sibling.children) {
                    const result = findParentNodeInTreeByGeneration(child, generation);
                    if (result) {
                        return result;
                    }
                }
            }
        }
    }
    
    return null;
}



function findRootNode(tree) {
    // console.log("Recherche du nœud racine dans:", tree);
    
    // Si l'arbre est déjà la racine
    if (tree.generation === 0) {
        // console.log("Arbre déjà au niveau racine");
        return tree;
    }
    
    // Recherche récursive
    function findRoot(node) {
        if (node.generation === 0) {
            // console.log("Nœud racine trouvé:", node.id, node.name);
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
    // console.log("Résultat de la recherche racine:", rootNode ? rootNode.id : "non trouvé");
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
                                spouseOf: childId,
                                mainBranch: 22,
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
            d.data.mainBranch = 23;
        }
    }

    importLinks.treeRenderer.drawTree();

    // fonction pour ajuster la vue si nécessaire
    handleTreeLeftShift();
}


/**
 * Ajuste la vue si des nœuds apparaissent trop à gauche
 */
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
    state.lastTransform = importLinks.treeRenderer.getLastTransform() || d3.zoomIdentity;
    const zoom = importLinks.treeRenderer.getZoom();
    
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
        // console.log("Position gauche:", leftmostNode.left, "Marge:", margin);
        
        if (leftmostNode.left < margin) {
            const shiftAmount = state.boxWidth * 1.3;
            // console.log("Décalage vers la droite de:", shiftAmount);
            
            if (zoom) {
                svg.transition()
                    .duration(750)
                    .call(zoom.transform, 
                        state.lastTransform.translate(shiftAmount, 0)
                    );
            }
        }
    }
}


/**
* Ajoute un bouton "+"  vert à gauche des siblings ayant des descendants.
 * @private
 */
// function addSiblingDescendantsButton(nodeGroups) {
//     nodeGroups.append("text")
//         .filter(d => {
//             if (!d.data.isSibling) return false;
//             const person = state.gedcomData.individuals[d.data.id];
//             return person && person.spouseFamilies && person.spouseFamilies.some(famId => {
//                 const family = state.gedcomData.families[famId];
//                 return family && family.children && family.children.length > 0;
//             });
//         })
//         .attr("class", "toggle-text-left")
//         .attr("x", -state.boxWidth/2 - 9)
//         .attr("y", -state.boxHeight/2 + 15)
//         .attr("text-anchor", "middle")
//         .style("font-size", "20px")
//         .style("fill", "#4CAF50")
//         .text("+")
//         // .on("click", event => event.stopPropagation());
//         // .on("click", handleRootChange);
//         .on("click", handleDescendantsClick);
// }



/**
 * Ajoute un bouton "+"  vert à gauche des siblings ayant des descendants.
 * @private
 */
// function addSiblingDescendantsButton(nodeGroups) {
//     nodeGroups.append("text")
//         .filter(d => {
//             if (!d.data.isSibling) return false;
            
//             const person = state.gedcomData.individuals[d.data.id];
//             if (!person) return false;
            
//             // Vérifier si la personne a des enfants généalogiques dans le GEDCOM
//             const hasGenealogicalChildren = person.spouseFamilies && person.spouseFamilies.some(famId => {
//                 const family = state.gedcomData.families[famId];
//                 return family && family.children && family.children.length > 0;
//             });
            
//             if (!hasGenealogicalChildren) return false;
            
//             // Utiliser la fonction existante pour trouver les descendants
//             const descendantsInfo = findDescendantsForSibling(d.data.id, false, null);
            
//             // Vérifier si ces descendants existent déjà dans l'arbre
//             const hasVisibleDescendants = descendantsInfo.childrenIds.some(childId => 
//                 nodeExistsInTree(state.currentTree, childId)
//             );
            
//             // Afficher le bouton "+" seulement s'il n'y a pas de descendants déjà visibles
//             return !hasVisibleDescendants;
//         })
//         .attr("class", "toggle-text-left")
//         .attr("x", -state.boxWidth/2 - 9)
//         .attr("y", -state.boxHeight/2 + 15)
//         .attr("text-anchor", "middle")
//         .style("font-size", "20px")
//         .style("fill", "#4CAF50")  // Vert pour les siblings
//         .text("+")  // Toujours "+" car on n'affiche que quand il n'y a pas de descendants visibles
//         .on("click", handleDescendantsClick);
// }

function addSiblingDescendantsButton(nodeGroups) {
    // Créer un groupe pour chaque bouton
    const buttonGroups = nodeGroups.append("g")
        .filter(function(d) {
            if (!d.data.isSibling) return false;
            
            const person = state.gedcomData.individuals[d.data.id];
            if (!person) return false;
            
            // Vérifier si la personne a des enfants généalogiques dans le GEDCOM
            const hasGenealogicalChildren = person.spouseFamilies && person.spouseFamilies.some(famId => {
                const family = state.gedcomData.families[famId];
                return family && family.children && family.children.length > 0;
            });
            
            if (!hasGenealogicalChildren) return false;
            
            // Utiliser la fonction existante pour trouver les descendants
            const descendantsInfo = findDescendantsForSibling(d.data.id, false, null);
            
            // Vérifier si ces descendants existent déjà dans l'arbre
            const hasVisibleDescendants = descendantsInfo.childrenIds.some(childId => 
                nodeExistsInTree(state.currentTree, childId)
            );
            
            // Afficher le bouton "+" seulement s'il n'y a pas de descendants déjà visibles
            return !hasVisibleDescendants;
        })
        .attr("class", "siblingDescendants-button-group");

    // Ajouter une zone de clic invisible plus grande
    buttonGroups.append("circle")
        .attr("cx", -state.boxWidth/2 - 9)
        .attr("cy", -state.boxHeight/2 + 10)
        .attr("r", 20)  // Rayon de 20px pour une zone de clic généreuse
        .style("fill", "transparent")
        .style("cursor", "pointer")
        .on("click", handleDescendantsClick);

    buttonGroups.append("text")
        .attr("class", "toggle-text-left")
        .attr("x", -state.boxWidth/2 - 9)
        .attr("y", -state.boxHeight/2 + 10)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")  // Centrage vertical parfait
        .style("cursor", "pointer")
        .style("font-size", "28px")
        .style("font-weight", "bold")  // Optionnel : rendre plus visible
        // .style("fill", "#6495ED")
        .style("fill", d => d.data.isSibling ? "#4CAF50" : "#6495ED")
        .style("pointer-events", "none")  // Laisser les clics passer au cercle invisible
        .text("+")

}


/**
 * Ajoute un bouton interactif pour les descendants des autres nœuds
 * @private
 */
// function addInteractiveDescendantsButton(nodeGroups) {
//     nodeGroups.append("text")
//         .filter(d => {
//             if (d.data.isSibling) return false;
//             const person = state.gedcomData.individuals[d.data.id];
//             if (person) {
//                 return person.spouseFamilies && person.spouseFamilies.some(famId => {
//                     const family = state.gedcomData.families[famId];
//                     return family && family.children && family.children.length > 0;
//                 });
//             }
//             else return false;
//         })
//         .attr("class", "toggle-text-left")
//         .attr("x", -state.boxWidth/2 - 9)
//         .attr("y", -state.boxHeight/2 + 15)
//         .attr("text-anchor", "middle")
//         .style("cursor", "pointer")
//         .style("font-size", "20px")
//         .style("fill", "#6495ED")
//         // .text(d => getDescendantsButtonText(d))
//         .text(d => {
//             // Pour les nœuds descendants à gauche avec des enfants dans GEDCOM mais pas affichés
//             if (d.data.isLeftDescendant) {
//                 const person = state.gedcomData.individuals[d.data.id];
//                 const hasChildrenInGedcom = person.spouseFamilies && person.spouseFamilies.some(famId => {
//                     const family = state.gedcomData.families[famId];
//                     return family && family.children && family.children.length > 0;
//                 });
                
//                 // Si le nœud a des enfants dans GEDCOM mais pas affichés dans l'arbre
//                 if (hasChildrenInGedcom && (!d.data.children || d.data.children.length === 0)) {
//                     return "+";
//                 }
//                 // return hasChildrenInGedcom ? "+" : "-"; // "+" si des enfants peuvent être affichés

//             }
            
            
//             // Pour les autres nœuds, logique existante
//             return getDescendantsButtonText(d);
//         })
//         .on("click", handleDescendantsClick);
// }



/**
 * Ajoute un bouton interactif pour les descendants des autres nœuds
 * @private
 */
function addInteractiveDescendantsButton(nodeGroups) {
    // Créer un groupe pour chaque bouton
    const buttonGroups = nodeGroups.append("g")
        .filter(function(d) {
            if (d.data.isSibling) return false;
            
            const person = state.gedcomData.individuals[d.data.id];
            if (!person) return false;
            
            // Vérifier si la personne a des enfants généalogiques dans le GEDCOM
            const hasGenealogicalChildren = person.spouseFamilies && person.spouseFamilies.some(famId => {
                const family = state.gedcomData.families[famId];
                return family && family.children && family.children.length > 0;
            });
            
            if (!hasGenealogicalChildren) return false;
            
            // Utiliser la fonction existante pour trouver les descendants
            const descendantsInfo = findDescendantsForSibling(d.data.id, false, null);
            
            // Vérifier si ces descendants existent déjà dans l'arbre
            const hasVisibleDescendants = descendantsInfo.childrenIds.some(childId => 
                nodeExistsInTree(state.currentTree, childId)
            );
            
            // Afficher le bouton "+" seulement s'il n'y a pas de descendants déjà visibles
            return !hasVisibleDescendants;
        })
        .attr("class", "descendants-button-group");

    // Ajouter une zone de clic invisible plus grande
    buttonGroups.append("circle")
        .attr("cx", -state.boxWidth/2 - 9)
        .attr("cy", -state.boxHeight/2 + 10)
        .attr("r", 20)  // Rayon de 20px pour une zone de clic généreuse
        .style("fill", "transparent")
        .style("cursor", "pointer")
        .on("click", handleDescendantsClick);

    buttonGroups.append("text")
        .attr("class", "toggle-text-left")
        .attr("x", -state.boxWidth/2 - 9)
        .attr("y", -state.boxHeight/2 + 10)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")  // Centrage vertical parfait
        .style("cursor", "pointer")
        .style("font-size", "28px")
        .style("font-weight", "bold")  // Optionnel : rendre plus visible
        // .style("fill", "#6495ED")
        .style("fill", d => d.data.isSibling ? "#4CAF50" : "#6495ED")
        .style("pointer-events", "none")  // Laisser les clics passer au cercle invisible
        .text("+")

}


/**
 * Obtient le texte du bouton des descendants
 * @private
 */
function getDescendantsButtonText(d) {
    // if (d.depth === 0) {
    if (true) {
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
    const descendants = importLinks.treeOperations.findDescendants(d.data.id);     
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
        const zoom = importLinks.treeRenderer.getZoom();
        
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
    const descendants = importLinks.treeOperations.findDescendants(personId, new Set());

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

    importLinks.treeRenderer.drawTree(); //state.currentTree); //, state.gedcomData);
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
    console.log('\n\n\n\n ###################   CALL displayGenealogicTree in updateRootToClosestDescendant  ################# ')

    displayGenealogicTree(descendant.id);
}


/**
 * Ajoute les contrôles pour les ancêtres
 * @param {Object} nodeGroups - Les groupes de nœuds
 */
// export function addAncestorsControls(nodeGroups) {
//     if (state.treeModeReal  === 'descendants' || state.treeModeReal  === 'directDescendants'  ) return;
//     nodeGroups.append("text")
//         .filter(function(d) {
//             d.ShowAncestorsButton = shouldShowAncestorsButton(d);
//             return d.ShowAncestorsButton;
//         })
//         .attr("class", "toggle-text")
//         .attr("x", state.boxWidth/2 + 9)
//         .attr("y", -state.boxHeight/2 + 15)
//         .attr("text-anchor", "middle")
//         .style("cursor", "pointer")
//         .style("font-size", "20px")
//         .style("fill", d => d.data.isSibling ? "#4CAF50" : "#6495ED")
//         .text(function(d) {
//             // if (d.depth < 3 )
//             // {
//             //         console.log(" DEBUG addAncestorsControls:", d.data.id, d.data.name, d.data.genealogicalParentId, "depth:", d.depth, ", hasRealParents=", d.ShowAncestorsButton, "hasVisibleParent=", hasVisibleGenealogicalParents(d)); 
//             // };
//             return d.ShowAncestorsButton && hasVisibleGenealogicalParents(d) ? "-" : "+" 
//         } )
//         .on("click", handleAncestorsClick);
// }
// Version alternative avec zone de clic séparée (plus robuste)
export function addAncestorsControls(nodeGroups) {
    if (state.treeModeReal === 'descendants' || state.treeModeReal === 'directDescendants') return;
    
    // Créer un groupe pour chaque bouton
    const buttonGroups = nodeGroups.append("g")
        .filter(function(d) {
            d.ShowAncestorsButton = shouldShowAncestorsButton(d);
            return d.ShowAncestorsButton;
        })
        .attr("class", "ancestors-button-group");

        
    let offset_x = 13;
    if (state.nombre_prenoms === 1) {
        offset_x = 10;
    }

    // Ajouter une zone de clic invisible plus grande
    buttonGroups.append("circle")
        .attr("cx", state.boxWidth/2 + offset_x)
        .attr("cy", -state.boxHeight/2 + 10)
        .attr("r", 20)  // Rayon de 20px pour une zone de clic généreuse
        .style("fill", "transparent")
        .style("cursor", "pointer")
        .on("click", handleAncestorsClick);
    
    // Ajouter le texte visible par-dessus
    buttonGroups.append("text")
        .attr("x", state.boxWidth/2 + offset_x)
        .attr("y", -state.boxHeight/2 + 10)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")  // Centrage vertical parfait
        .style("cursor", "pointer")
        .style("font-size", "28px")  // Taille agrandie
        .style("font-weight", "bold")  // Optionnel : rendre plus visible
        .style("fill", d => d.data.isSibling ? "#4CAF50" : "#6495ED")
        .style("pointer-events", "none")  // Laisser les clics passer au cercle invisible
        .text(function(d) {
            return d.ShowAncestorsButton && hasVisibleGenealogicalParents(d) ? "-" : "+" 
        });
}


/**
 * Vérifie si le bouton des ancêtres doit être affiché
 * @private
 */
function shouldShowAncestorsButton(d) {

    // Pour tous les niveaux, vérifier la présence réelle de parents
    // le bouton "+/-" doit être affiché si le noeud à des parents généalogiques  (génération suivante) présents dans le gedcom
    const person = state.gedcomData.individuals[d.data.id];
    if (person) {
        const hasRealParents = person.families.some(famId => {
            const family = state.gedcomData.families[famId];
            return family && family.children && family.children.includes(person.id) &&
                (family.husband || family.wife);
        });
        return (hasRealParents);
    }
    else return false;
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
 * Extrait les coordonnées X et Y de l'attribut transform d'un élément SVG.
 * @param {Element} node - L'élément DOM (<g class="node">)
 * @returns {{x: number, y: number}|null} Les coordonnées.
 */
function getCoordsFromTransform(node) {
    const transformAttr = node.getAttribute('transform');
    if (!transformAttr) return null;

    // RegEx pour capturer les valeurs X et Y dans translate(X,Y)
    const match = transformAttr.match(/translate\(([^,]+),([^)]+)\)/);
    
    if (match && match.length === 3) {
        // match[1] est X, match[2] est Y
        const x = parseFloat(match[1]);
        const y = parseFloat(match[2]);
        if (!isNaN(x) && !isNaN(y)) {
            return { x, y, node: node }; // Retourne aussi l'élément DOM original
        }
    }
    return null;
}


/**
 * Trouve le nœud DOM le plus haut parmi les plus à droite en lisant l'attribut 'transform'.
 * (Méthode de lecture du DOM optimisée, car elle évite getBoundingClientRect).
 */
function findTopMostRightMostNode() {
    // console.log("--- Début du diagnostic (Lecture de l'attribut transform) ---");
    
    // 1. Sélectionner tous les éléments DOM et mapper leurs coordonnées
    const nodes = d3.selectAll(".node").nodes();
    const nodeCoords = nodes.map(node => getCoordsFromTransform(node)).filter(c => c !== null);

    // console.log(`LOG 1 : ${nodes.length} nœuds DOM trouvés. ${nodeCoords.length} nœuds avec coordonnées valides.`);

    if (nodeCoords.length === 0) {
        console.error("LOG 1 : Aucun nœud avec un attribut transform valide n'a été trouvé.");
        return null;
    }

    // 2. Déterminer la coordonnée X maximale (le plus à droite)
    const max_x = nodeCoords.reduce((max, coords) => Math.max(max, coords.x), -Infinity);
    // console.log(`LOG 2 : Coordonnée X maximale (le plus à droite) trouvée : ${max_x}`);

    // Utilisation d'une petite tolérance pour les problèmes de virgule flottante
    const epsilon = 1e-6; 

    // 3. Filtrer les nœuds à cette coordonnée X maximale
    const rightmostNodes = nodeCoords.filter(coords => Math.abs(coords.x - max_x) < epsilon);
    
    // console.log(`LOG 3 : ${rightmostNodes.length} nœuds trouvés sur la ligne la plus à droite (avec tolérance ${epsilon}).`);

    if (rightmostNodes.length === 0) {
        console.error("LOG 3 : Filtration échouée.");
        return null;
    }

    // 4. Parmi ces nœuds, trouver celui avec la coordonnée Y minimale (le plus haut)
    const topmostRightNodeCoords = rightmostNodes.reduce((topmost, coords) => {
        if (!topmost || coords.y < topmost.y) {
            return coords;
        }
        return topmost;
    }, null);

    // 5. Retourner l'élément DOM original
    if (topmostRightNodeCoords) {
        // console.log("LOG 4 : Nœud final trouvé (x, y) :", topmostRightNodeCoords.x, topmostRightNodeCoords.y, topmostRightNodeCoords.node);
        // Vous retournez l'élément DOM <g> correspondant
        return topmostRightNodeCoords.node; 
    }
    
    return null;
}


/**
 * Gère le décalage horizontal de l'arbre si les nœuds sont trop proches du bord droit
 * Applique une transition animée si nécessaire
 */
function handleTreeShift(direction = 'left') {
    const svg = d3.select("#tree-svg");
    const lastTransform = importLinks.treeRenderer.getLastTransform() || d3.zoomIdentity;
    const zoom = importLinks.treeRenderer.getZoom();
    
    // Trouver les nœuds du niveau le plus profond
    const nodes = d3.selectAll(".node").nodes();

    const topMostRightMostNode = findTopMostRightMostNode(nodes);
    if (topMostRightMostNode) {
        const rect = topMostRightMostNode.getBoundingClientRect();
        const marginRight = 60;
        const marginTop = 20;

        let shiftAmountX = 0;
        let shiftAmountY = 0;
        if (rect.right > (window.innerWidth - marginRight) || rect.top <  marginTop  || rect.bottom > (window.innerHeight - marginTop) ) {
            if ( rect.right > (window.innerWidth - marginRight) ) {
                shiftAmountX = state.boxWidth * 1.4;
            }

            if (rect.top <  marginTop ) {
                shiftAmountY = state.boxHeight* 1.4;                
            }

            if (rect.bottom > (window.innerHeight - marginTop)) {
                shiftAmountY = -state.boxHeight* 1.4;                 
            }
            
            if (zoom) {
                svg.transition()
                    .duration(750)
                    .call(zoom.transform, 
                        lastTransform.translate(-shiftAmountX, shiftAmountY)
                    );
            }
        }
        // console.log("\n\n ------ DEBUG findTopMostRightMostNode Position droite:", topMostRightMostNode,-shiftAmountX, shiftAmountY );
    }
}


/**
 * Gère le décalage horizontal de l'arbre si les nœuds sont trop proches du bord droit
 * Applique une transition animée si nécessaire
 */
async function handleTreeXYShift(shiftAmountX = 0, shiftAmountY = 0, duration = 750) {
    const svg = d3.select("#tree-svg");
    const lastTransform = importLinks.treeRenderer.getLastTransform() || d3.zoomIdentity;
    const zoom = importLinks.treeRenderer.getZoom();
    const screenWidth = window.innerWidth;
    
 
    // const shiftAmount =state.boxWidth * 1.3 ;
    
    if (zoom) {
        // console.log("\n\n ------ debug ------- Shifting tree to the right by:", shiftAmount);
        const transition =  svg.transition()
            .duration(duration)
            .ease(d3.easeCubicInOut) // Type d'animation (facultatif mais recommandé)
            .call(zoom.transform, 
                lastTransform.translate(shiftAmountX, shiftAmountY)
            );
        await transition.end();
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
        node.mainBranch = 24;
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
export function handleAncestorsClick(event, d, isFromAnimation = false) {
    event.stopPropagation();
    // console.log("Clicked node data:", d.data);
    let newAncestorsAdded = false;

    if (d.data.isSibling) {
        const siblingsReference = d.parent.data.children.filter(child => 
            child.id == d.data.siblingReferenceId && child !== d.data
        );
        // console.log("Before handling normal ancestors:", d.data.children);
        newAncestorsAdded = handleSiblingAncestors(siblingsReference);
    } else {
        // console.log("Before handling normal ancestors:", d.data.children);
        newAncestorsAdded = handleNormalAncestors(d.data);
        // console.log("After handling normal ancestors:", d.data.children);
    }

    importLinks.treeRenderer.drawTree(false, isFromAnimation);

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
                const genealogicalParents = importLinks.treeOperations.findGenealogicalParent(family.husband, familiesWithChildren);
                if (state.treeModeReal === 'ancestors') {
                    const fatherSiblings = importLinks.treeOperations.findSiblings(family.husband);
                    addSiblingsToNode(fatherSiblings, ddata, family.husband, genealogicalParents);
                    addOtherSpouses(family.husband, family.wife, ddata);
                }
                ddata.children.push({
                    id: family.husband,
                    name: father.name,
                    generation: ddata.generation + 1,
                    children: [],
                    birthDate: father.birthDate,
                    deathDate: father.deathDate,
                    sex: father.sex,
                    hasParents: true,
                    genealogicalParentId: genealogicalParents.original,
                    genealogicalFatherId: genealogicalParents.father,
                    genealogicalMotherId: genealogicalParents.mother,
                    mainBranch: 1, 
                });
            }

            // Faire de même pour la mère (wife)
            if (family.wife) {
                const mother = state.gedcomData.individuals[family.wife];
                const familiesWithChildren = state.gedcomData.individuals[family.wife].families.filter(famId => {
                    const family = state.gedcomData.families[famId];
                    return family && family.children;
                });
                const genealogicalParents = importLinks.treeOperations.findGenealogicalParent(family.wife, familiesWithChildren);
                if (state.treeModeReal === 'ancestors') {
                    const motherSiblings = importLinks.treeOperations.findSiblings(family.wife);
                    // console.log("debug buildNewAncestors motherSiblings for this node :", family.wife, motherSiblings);
                    addSiblingsToNode(motherSiblings, ddata, family.wife, genealogicalParents);
                    addOtherSpouses(family.wife, family.husband, ddata);
                }
                ddata.children.push({
                    id: family.wife,
                    name: mother.name,
                    generation: ddata.generation + 1,
                    children: [],
                    birthDate: mother.birthDate,
                    deathDate: mother.deathDate,
                    sex: mother.sex,
                    hasParents: true,
                    genealogicalParentId: genealogicalParents.original,
                    genealogicalFatherId: genealogicalParents.father,
                    genealogicalMotherId: genealogicalParents.mother,
                    mainBranch: 1,
                });
            }
        }
    });
}

// Fonction utilitaire pour ajouter les siblings à un nœud
function addSiblingsToNode(siblings, node, parentId, genealogicalParents) {


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
            sex: sibling.sex,
            genealogicalParentId: genealogicalParents.original,
            genealogicalFatherId: genealogicalParents.father,
            genealogicalMotherId: genealogicalParents.mother,
            siblingReferenceId: parentId,
            mainBranch: 1,
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
                    deathDate: spouse.deathDate,
                    sex: spouse.sex,
                    mainBranch: 31,
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

