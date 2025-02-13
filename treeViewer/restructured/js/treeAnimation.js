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

// export function startAncestorAnimation() {
//     // Nettoyer les timeouts existants
//     animationTimeouts.forEach(timeout => clearTimeout(timeout));
//     animationTimeouts = [];

//     const path = findAncestorPath(state.rootPersonId, TARGET_ANCESTOR_ID);
//     console.log("Chemin vers l'ancêtre:", path);
    
//     let lastNode = null;
    

//     path.forEach((nodeId, index) => {

//         const timeout = setTimeout(() => {
//             console.log("Animation étape:", nodeId);
//             const node = findNodeInTree(nodeId);
//             if (node) {
//                 console.log("Nœud trouvé:", node);
//                 // Simuler le clic avec construction de l'arbre
//                 if (!node.data.children || node.data.children.length === 0) {
//                     const event = new Event('click');
//                     handleAncestorsClick(event, node);
//                     drawTree();  // Forcer le redessinage
//                 }
                
//                 const zoom = getZoom();
//                 if (zoom) {
//                     const svg = d3.select("#tree-svg");
//                     const lastTransform = getLastTransform() || d3.zoomIdentity;
//                     // Ne décaler que si le nœud est trop proche du bord droit
//                     if (node.y > window.innerWidth - 200) {  // marge de 200px
//                         svg.transition()
//                             .duration(750)
//                             .call(zoom.transform, 
//                                 lastTransform.translate(-state.boxWidth * 1.3 -12, 0)
//                             );
//                     }
//                 }

//                 lastNode = node;
//             }
//         }, index * 1500);
//         animationTimeouts.push(timeout);
//     });
// }

export function stopAnimation() {
    animationTimeouts.forEach(timeout => clearTimeout(timeout));
    animationTimeouts = [];
}



// Dans treeAnimation.js, ajoutez cette fonction
// function speakPersonName(personName) {
//     // Vérifier si la synthèse vocale est disponible
//     if ('speechSynthesis' in window) {
//         // Créer un nouvel objet SpeechSynthesisUtterance
//         const utterance = new SpeechSynthesisUtterance(personName);
        
//         // Configurer des paramètres optionnels
//         utterance.lang = 'fr-FR'; // Langue française
//         utterance.rate = 0.8; // Vitesse de lecture (0.1 à 10)
//         utterance.pitch = 1; // Tonalité (0 à 2)
        
//         // Lire le texte
//         window.speechSynthesis.speak(utterance);
//     } else {
//         console.log('La synthèse vocale n\'est pas supportée');
//     }
// }
// function speakPersonName(personName) {
//     // Vérification des capacités de synthèse vocale
//     if (!('speechSynthesis' in window)) {
//         console.error('La synthèse vocale n\'est pas supportée dans ce navigateur');
//         return;
//     }

//     // Debug : vérifier les voix disponibles
//     const voices = window.speechSynthesis.getVoices();
//     console.log('Voix disponibles :', voices);

//     // Sélectionner une voix française
//     const frenchVoice = voices.find(voice => 
//         voice.lang.startsWith('fr-') || 
//         voice.name.toLowerCase().includes('french')
//     );

//     // Créer l'utterance
//     const utterance = new SpeechSynthesisUtterance(personName);
    
//     // Configuration de l'utterance
//     utterance.lang = 'fr-FR';
//     utterance.rate = 0.8;
//     utterance.pitch = 1;

//     // Utiliser une voix française si disponible
//     if (frenchVoice) {
//         utterance.voice = frenchVoice;
//     }

//     // Ajout d'écouteurs d'événements pour le débogage
//     utterance.onstart = () => {
//         console.log('Début de la lecture vocale');
//     };

//     utterance.onend = () => {
//         console.log('Fin de la lecture vocale');
//     };

//     utterance.onerror = (event) => {
//         console.error('Erreur de synthèse vocale:', event);
//     };

//     // Tenter de parler
//     try {
//         window.speechSynthesis.speak(utterance);
//     } catch (error) {
//         console.error('Erreur lors de l\'appel à speechSynthesis.speak():', error);
//     }
// }


function speakPersonName(personName) {
    return new Promise((resolve, reject) => {
        if (!('speechSynthesis' in window)) {
            console.error('La synthèse vocale n\'est pas supportée');
            resolve(); // Résoudre pour ne pas bloquer l'animation
            return;
        }

        const utterance = new SpeechSynthesisUtterance(personName);
        
        // Configuration pour une lecture plus rapide
        utterance.lang = 'fr-FR';
        utterance.rate = 1.3; // Légèrement accéléré
        utterance.pitch = 1;

        // Trouver une voix française
        const voices = window.speechSynthesis.getVoices();
        const frenchVoice = voices.find(voice => 
            voice.lang.startsWith('fr-') || 
            voice.name.toLowerCase().includes('french')
        );

        if (frenchVoice) {
            utterance.voice = frenchVoice;
        }

        utterance.onend = () => resolve();
        utterance.onerror = (error) => {
            console.error('Erreur de synthèse vocale:', error);
            resolve(); // Résoudre quand même pour ne pas bloquer
        };

        window.speechSynthesis.speak(utterance);
    });
}


export function startAncestorAnimation() {

    // Vérification préalable des voix
    if ('speechSynthesis' in window) {
        // Dans certains navigateurs, les voix sont chargées de manière asynchrone
        window.speechSynthesis.onvoiceschanged = () => {
            const voices = window.speechSynthesis.getVoices();
            console.log('Voix chargées:', voices);
        };
    }


    // Nettoyer les timeouts existants
    animationTimeouts.forEach(timeout => clearTimeout(timeout));
    animationTimeouts = [];

    const path = findAncestorPath(state.rootPersonId, TARGET_ANCESTOR_ID);
    console.log("Chemin vers l'ancêtre:", path);
    
    let lastNode = null;

    path.forEach((nodeId, index) => {
        const timeout = setTimeout(() => {
            console.log("Animation étape:", nodeId);
            const node = findNodeInTree(nodeId);
            if (node) {
                console.log("Nœud trouvé:", node);
                
                // Ajouter l'appel à la synthèse vocale
                const personName = node.data.name.replace(/\//g, '').trim();
                console.log('Tentative de lecture vocale pour:', personName);
                speakPersonName(personName);

                // Simuler le clic avec construction de l'arbre
                if (!node.data.children || node.data.children.length === 0) {
                    const event = new Event('click');
                    handleAncestorsClick(event, node);
                    drawTree();  // Forcer le redessinage
                }
                
                const zoom = getZoom();
                if (zoom) {
                    const svg = d3.select("#tree-svg");
                    const lastTransform = getLastTransform() || d3.zoomIdentity;
                    // Ne décaler que si le nœud est trop proche du bord droit
                    if (node.y > window.innerWidth - 200) {  // marge de 200px
                        svg.transition()
                            .duration(750)
                            .call(zoom.transform, 
                                lastTransform.translate(-state.boxWidth * 1.3 -12, 0)
                            );
                    }
                }

                lastNode = node;
            }
        }, index * 1500);
        animationTimeouts.push(timeout);
    });
}