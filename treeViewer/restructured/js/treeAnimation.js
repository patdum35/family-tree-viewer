// ====================================
// Animation de l'arbre
// ====================================
import { state  } from './main.js';
import { handleAncestorsClick } from './nodeControls.js';
import { getZoom, getLastTransform, drawTree } from './treeRenderer.js';
import { buildDescendantTree } from './treeOperations.js';

// ID en dur pour test
const TARGET_ANCESTOR_ID = "@I741@"; 
// "@I5@" ; OK
// "@I1328@"; Bad // À remplacer par l'ID réel de l'ancêtre cible
 
/**
 * Trouve le chemin entre une personne et son ancêtre
 * @private
 */

// function findAncestorPath(startId, targetAncestorId) {
//     function findPathRecursive(currentId, path = []) {
//         // Ajouter des logs pour déboguer
//         console.log("Recherche à partir de:", currentId);
//         console.log("Chemin actuel:", path);

//         if (currentId === targetAncestorId) {
//             console.log("Cible trouvée !");
//             return [...path, currentId];
//         }

//         const person = state.gedcomData.individuals[currentId];
//         if (!person || !person.families) {
//             console.log("Personne non trouvée ou sans famille:", currentId);
//             return null;
//         }

//         // Pour chaque famille où la personne est enfant
//         for (const famId of person.families) {
//             const family = state.gedcomData.families[famId];
//             console.log("Vérification famille:", famId);
            
//             if (!family || !family.children || !family.children.includes(currentId)) {
//                 console.log("Famille invalide ou personne non enfant");
//                 continue;
//             }

//             // Vérifier le père puis la mère
//             if (family.husband) {
//                 console.log("Essai avec le père:", family.husband);
//                 const newPath = findPathRecursive(family.husband, [...path, currentId]);
//                 if (newPath) return newPath;
//             }
//             if (family.wife) {
//                 console.log("Essai avec la mère:", family.wife);
//                 const newPath = findPathRecursive(family.wife, [...path, currentId]);
//                 if (newPath) return newPath;
//             }
//         }
//         return null;
//     }

//     const path = findPathRecursive(startId);
//     if (!path) {
//         console.log("Aucun chemin trouvé vers:", targetAncestorId);
//     }
//     return path || [];
// }



function findAncestorPath(startId, targetAncestorId) {
    console.log("Recherche du chemin de", startId, "vers", targetAncestorId);
    
    // Sauvegarder et modifier temporairement nombre_generation
    const savedGen = state.nombre_generation;
    state.nombre_generation = 100;  // Valeur temporaire élevée
    
    // Construire l'arbre des descendants depuis l'ancêtre cible
    const descendantTree = buildDescendantTree(targetAncestorId);
    console.log("Arbre des descendants construit:", descendantTree);
    
    // Restaurer nombre_generation
    state.nombre_generation = savedGen;
    
    // Fonction pour trouver un nœud et son chemin dans l'arbre
    function findNodeAndPath(node, targetId, currentPath = []) {
        console.log("Exploration du nœud:", node.id, "à la recherche de", targetId);
        console.log("Chemin actuel:", currentPath);
        
        if (node.id === targetId) {
            console.log("Nœud cible trouvé!");
            return [...currentPath, node.id];
        }
        
        if (node.children) {
            console.log("Exploration des enfants de", node.id, ":", 
                       node.children.map(c => c.id));
            
            for (const child of node.children) {
                const path = findNodeAndPath(child, targetId, [...currentPath, node.id]);
                if (path) {
                    console.log("Chemin trouvé via enfant", child.id);
                    return path;
                }
            }
        }
        
        console.log("Pas de chemin trouvé via", node.id);
        return null;
    }
    
    // Trouver le chemin depuis l'ancêtre jusqu'à la racine actuelle
    const path = findNodeAndPath(descendantTree, startId);
    console.log("Chemin trouvé (avant inversion):", path);
    
    // Inverser le chemin pour aller de la racine vers l'ancêtre
    const finalPath = path ? path.reverse() : [];
    console.log("Chemin final:", finalPath);
    
    return finalPath;
}


/**
 * Trouve un nœud dans l'arbre D3 actuel
 * @private
 */
function findNodeInTree(nodeId) {
    let foundNode = null;
    d3.selectAll('.node').each(function(d) {
        if (d.data.id === nodeId) {
            foundNode = d;
        }
    });
    return foundNode;
}

/**
 * Lance l'animation d'expansion vers l'ancêtre
 * @export
 */

let animationTimeouts = [];


export function stopAnimation() {
    // Arrêter la synthèse vocale
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }

    // Annuler l'animation
    if (animationController) {
        animationController.cancel();
    }

    // Réinitialiser les timeouts
    animationTimeouts.forEach(timeout => clearTimeout(timeout));
    animationTimeouts = [];
}


let optimalSpeechRate = 0.9;

function simplifyName(fullName) {
    // Séparer le nom entre les barres obliques
    const nameParts = fullName.split('/');
    
    // Traiter les prénoms
    const firstNames = nameParts[0].trim().split(' ');
    const firstFirstName = firstNames[0]; // Garder uniquement le premier prénom
    
    // Traiter le nom de famille
    const lastName = nameParts[1] ? nameParts[1].trim().toUpperCase() : '';
    
    // Combiner le premier prénom et le nom de famille
    return `${firstFirstName} ${lastName}`.trim();
}


function speakPersonName(personName) {
    return new Promise((resolve, reject) => {
        if (!('speechSynthesis' in window)) {
            resolve();
            return;
        }

        // Paramètres initiaux
        const targetDuration = 1500; // 1 seconde pour lire le nom
        const maxRate = 5; // Vitesse maximale
        const minRate = 1.0; // Vitesse minimale

        // Simplifier le nom avant lecture
        const simplifiedName = simplifyName(personName);

        function measureSpeechDuration(rate) {
            return new Promise((innerResolve) => {
                const utterance = new SpeechSynthesisUtterance(simplifiedName);
                utterance.rate = rate;
                utterance.lang = 'fr-FR';

                const startTime = Date.now();

                utterance.onend = () => {
                    const duration = Date.now() - startTime;
                    
                    // Log du temps de lecture
                    // console.log(`Nom original: ${personName}`);
                    console.log(`Nom simplifié: ${simplifiedName} , Vitesse: ${rate}, Durée: ${duration}ms`);

                    innerResolve({ 
                        rate: rate, 
                        duration: duration 
                    });
                };

                utterance.onerror = () => {
                    innerResolve({ 
                        rate: rate, 
                        duration: Infinity 
                    });
                };

                // Sélectionner une voix française si possible
                const voices = window.speechSynthesis.getVoices();
                const frenchVoice = voices.find(voice => 
                    voice.lang.startsWith('fr-') || 
                    voice.name.toLowerCase().includes('french')
                );

                if (frenchVoice) {
                    utterance.voice = frenchVoice;
                }

                window.speechSynthesis.speak(utterance);
            });
        }

        // Lecture avec la vitesse mémorisée ou par défaut
        async function adaptiveSpeech() {
            const result = await measureSpeechDuration(optimalSpeechRate);

            // Ajuster la vitesse globale avec une approche plus symétrique
            if (result.duration > targetDuration + 200) {
                // Si trop lent, augmenter progressivement
                optimalSpeechRate = Math.min(optimalSpeechRate + 0.2, maxRate);
            } else if (result.duration < targetDuration - 200) {
                // Si trop rapide, diminuer progressivement
                optimalSpeechRate = Math.max(optimalSpeechRate - 0.2, minRate);
            }

            resolve();
        }

        // Lancer la lecture adaptative
        adaptiveSpeech();
    });
}

let animationController = null;


function getNodeScreenPosition(node) {
    // Récupérer tous les nœuds actuellement dans l'arbre
    const allNodes = d3.selectAll(".node").nodes();
    
    // Trouver le nœud le plus à droite
    const rightmostNodePosition = allNodes.reduce((max, nodeEl) => {
        const transform = nodeEl.getAttribute('transform');
        const match = transform.match(/translate\((.*?),(.*?)\)/);
        if (match) {
            const x = parseFloat(match[1]);
            return Math.max(max, x);
        }
        return max;
    }, 0);

    console.log('Position du nœud le plus à droite:', rightmostNodePosition);
    console.log('Largeur de l\'écran:', window.innerWidth);

    return {
        x: rightmostNodePosition,
        y: node.x  // Conserver la position verticale originale
    };
}

export function startAncestorAnimation() {
    // Créer un contrôleur pour pouvoir annuler l'animation
    animationController = {
        isCancelled: false,
        cancel: function() {
            this.isCancelled = true;
        }
    };
    return new Promise(async (resolve, reject) => {
        try {
            // Nettoyer les timeouts existants
            animationTimeouts.forEach(timeout => clearTimeout(timeout));
            animationTimeouts = [];

            const path = findAncestorPath(state.rootPersonId, TARGET_ANCESTOR_ID);
            console.log("Chemin vers l'ancêtre:", path);
            
            // Utiliser une boucle for...of pour permettre l'await
            for (const nodeId of path) {

                // Vérifier si l'animation a été annulée
                if (animationController.isCancelled) {
                    console.log('Animation annulée');
                    break;
                }

                const node = findNodeInTree(nodeId);
                if (node) {
                    // console.log("Nœud trouvé:", nodeId);
                    
                    // Lancer simultanément la voix et l'animation
                    await speakPersonName(node.data.name);
                    
                    // Actions sur le nœud
                    if (!node.data.children || node.data.children.length === 0) {
                        const event = new Event('click');
                        handleAncestorsClick(event, node);
                        drawTree();
                    }


                    // const zoom = getZoom();
                    // if (zoom) {
                    //     const svg = d3.select("#tree-svg");
                    //     const lastTransform = getLastTransform() || d3.zoomIdentity;
                    //     // Ne décaler que si le nœud est trop proche du bord droit
                    //     if (node.y > window.innerWidth - 200) {  // marge de 200px
                    //         svg.transition()
                    //             .duration(750)
                    //             .call(zoom.transform, 
                    //                 lastTransform.translate(-state.boxWidth * 1.3 -12, 0)
                    //             );
                    //     }
                    // }

                    // Dans startAncestorAnimation()
                    // const zoom = getZoom();
                    // if (zoom) {
                    //     const svg = d3.select("#tree-svg");
                    //     const lastTransform = getLastTransform() || d3.zoomIdentity;
                        
                    //     // Calculer la position du nœud
                    //     const nodeScreenPosition = getNodeScreenPosition(node);
                        
                    //     console.log('Détails de position du nœud:', {
                    //         nodeY: node.y,
                    //         windowWidth: window.innerWidth,
                    //         screenX: nodeScreenPosition.x,
                    //         screenY: nodeScreenPosition.y,
                    //         nodeWidth: state.boxWidth,
                    //         translateAmount: -state.boxWidth * 1.3 - 12
                    //     });

                    //     // Ajuster le décalage en fonction de la largeur d'écran
                    //     const screenMargin = window.innerWidth < 600 ? 100 : 200;
                    //     const horizontalShift = -state.boxWidth * 2; // Augmenter le décalage
                    //     const verticalShift = window.innerHeight / 2 - nodeScreenPosition.y;

                    //     if (nodeScreenPosition.x > window.innerWidth - screenMargin) {
                    //         svg.transition()
                    //             .duration(750)
                    //             .call(zoom.transform, 
                    //                 lastTransform
                    //                     .translate(horizontalShift, verticalShift)
                    //             );
                    //     }
                    // }



                    // const zoom = getZoom();
                    // if (zoom) {
                    //     const svg = d3.select("#tree-svg");
                    //     const lastTransform = getLastTransform() || d3.zoomIdentity;
                        
                    //     // Calculer la position du nœud
                    //     const nodeScreenPosition = getNodeScreenPosition(node);
                        
                    //     console.log('Détails de position du nœud:', {
                    //         nodeY: node.y,
                    //         windowWidth: window.innerWidth,
                    //         rightmostX: nodeScreenPosition.x,
                    //         nodeWidth: state.boxWidth
                    //     });
                    
                    //     // Ajuster le décalage en fonction de la largeur d'écran
                    //     const screenMargin = window.innerWidth < 600 ? 100 : 200;
                        
                    //     // Calculer un décalage dynamique basé sur la position actuelle
                    //     const horizontalShift = Math.max(
                    //         window.innerWidth - nodeScreenPosition.x - state.boxWidth, 
                    //         window.innerWidth / 2
                    //     );
                        
                    //     const verticalShift = window.innerHeight / 2 - nodeScreenPosition.y;
                    
                    //     if (nodeScreenPosition.x > window.innerWidth - screenMargin) {
                    //         svg.transition()
                    //             .duration(750)
                    //             .call(zoom.transform, 
                    //                 lastTransform
                    //                     .translate(-horizontalShift, verticalShift)
                    //             );
                    //     }
                    // }

                    const zoom = getZoom();
                    if (zoom) {
                        const svg = d3.select("#tree-svg");
                        const lastTransform = getLastTransform() || d3.zoomIdentity;
                        
                        // Calculer la position du nœud
                        const nodeScreenPosition = getNodeScreenPosition(node);

                        // Calculer un décalage fixe et significatif
                        const horizontalShift = Math.min(
                            window.innerWidth / 2,  // Décalage vers la gauche
                            state.boxWidth * 1.5 - 12      // Ou 3 fois la largeur d'une boîte
                        );
                        
                        const verticalShift = window.innerHeight / 2 - nodeScreenPosition.y;

                        // Toujours décaler si le nœud est proche du bord droit
                        if (node.y > window.innerWidth - 200) {
                            svg.transition()
                                .duration(750)
                                .call(zoom.transform, 
                                    lastTransform.translate(-horizontalShift, verticalShift)
                                );
                        }
                    }




                    // Fonction utilitaire pour obtenir la position à l'écran d'un nœud
                    function getNodeScreenPosition(node) {
                        const svg = d3.select("#tree-svg");
                        const svgRect = svg.node().getBoundingClientRect();
                        const transform = getLastTransform() || d3.zoomIdentity;

                        // Calculer la position transformée
                        const x = transform.x + node.y * transform.k;
                        const y = transform.y + node.x * transform.k;

                        return { x, y };
}


                    // Attendre un court instant entre chaque nœud
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
            
            resolve(); // Résoudre la promesse une fois terminé
        } catch (error) {
            console.error('Erreur dans l\'animation:', error);
            reject(error); // Rejeter en cas d'erreur
        }
    });
}