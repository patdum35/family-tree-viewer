// ====================================
// Animation de l'arbre
// ====================================
import { state, showMap  } from './main.js';
import { handleAncestorsClick, handleDescendants } from './nodeControls.js';
import { getZoom, getLastTransform, drawTree } from './treeRenderer.js';
import { buildDescendantTree } from './treeOperations.js';
// import { geocodeLocation } from './modalWindow.js';
import { geocodeLocation } from './geoLocalisation.js';
import { initBackgroundContainer, updateBackgroundImage } from './backgroundManager.js';
import { extractYear } from './utils.js';
import { initAnimationMap as initMap, updateAnimationMapMarkers, collectPersonLocations, locationSymbols} from './mapUtils.js';

let animationTimeouts = [];
let optimalSpeechRate = 0.9;
let animationMap = null;
let animationMarker = null;

export function setTargetAncestorId(newId) {
    state.targetAncestorId = newId;
}

export function getTargetAncestorId() {
    return state.targetAncestorId;
}

function initAnimationMap() {
    // Utiliser la fonction centralisée
    animationMap = initMap('animation-map', {
        center: [46.2276, 2.2137], // Centre de la France
        zoom: 5,
        zoomControl: false,
        attributionControl: false
    });
    
    // Initialiser la liste des marqueurs
    window.animationMapMarkers = [];

    return animationMap;
}

async function updateAnimationMapLocations(locations, locationSymbols) {
    // Nettoyer les marqueurs existants
    if (window.animationMapMarkers) {
        window.animationMapMarkers.forEach(marker => animationMap.removeLayer(marker));
    }
    window.animationMapMarkers = [];

    // Filtrer les lieux non vides
    const validLocations = locations.filter(loc => loc.place && loc.place.trim() !== '');

    if (validLocations.length === 0) {
        console.log('Aucune localisation valide trouvée');
        return;
    }

    // Utiliser la fonction centralisée pour mettre à jour les marqueurs
    window.animationMapMarkers = await updateAnimationMapMarkers(animationMap, validLocations, {
        enhanced: true,  // Utiliser les marqueurs améliorés avec cercle // i false :Utiliser les marqueurs simples
        fitToMarkers: true,
        duration: 1.5
    });
}



/**
 * Trouve le chemin entre une personne et son ancêtre
 * @private
 */
function findAncestorPath(startId, targetAncestorId) {
    // console.log("Recherche du chemin de", startId, "vers", targetAncestorId);
    
    // Sauvegarder et modifier temporairement nombre_generation
    const savedGen = state.nombre_generation;
    state.nombre_generation = 100;  // Valeur temporaire élevée
    
    // Construire l'arbre des descendants depuis l'ancêtre cible
    const descendantTree = buildDescendantTree(targetAncestorId);
    // console.log("Arbre des descendants depuis l'ancêtre:", descendantTree);

    // Restaurer nombre_generation
    state.nombre_generation = savedGen;
    
    // Fonction pour trouver un nœud et son chemin dans l'arbre
    function findNodeAndPath(node, targetId, currentPath = []) {
        
        if (node.id === targetId) {
            const finalPath = [...currentPath, node.id];
            return finalPath;
        }
        
        if (node.children) {
            for (const child of node.children) {
                // Si le noeud est un spouse, on vérifie si on a déjà trouvé un chemin par l'autre branche
                if (child.isSpouse) {
                    continue;
                }
                const path = findNodeAndPath(child, targetId, [...currentPath, node.id]);
                if (path) {
                    return path;
                }
            }
        }
        return null;
    }
    
    // Trouver le chemin depuis l'ancêtre jusqu'à la racine actuelle
    const path = findNodeAndPath(descendantTree, startId);
    const descendPath = [...path]; // Crée une copie du tableau

    // Inverser le chemin pour aller de la racine vers l'ancêtre
    const finalPath = path ? path.reverse() : [];
   
    return [finalPath, descendPath];
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
function simplifyName(fullName) {
    // Séparer le nom entre les barres obliques
    const nameParts = fullName.split('/');
    
    // Traiter les prénoms
    const firstNames = nameParts[0].trim().split(' ');
    let firstFirstName = firstNames[0]; // Garder uniquement le premier prénom
    
    // Traiter le nom de famille
    let lastName = nameParts[1] ? nameParts[1].trim() : '';
    
    // Convertir le nom de famille en format Titre (première lettre majuscule, reste en minuscule)
    if (lastName.length > 0) {
        lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();
    }
    
    // Même traitement pour le prénom si nécessaire
    firstFirstName = firstFirstName.charAt(0).toUpperCase() + firstFirstName.slice(1).toLowerCase();
    
    // Combiner le premier prénom et le nom de famille
    return `${firstFirstName} ${lastName}`;
}


function speakPersonName(personName) {
    return new Promise((resolve, reject) => {

        // Vérifier si le son est activé
        if (!state.isSpeechEnabled) {
            resolve();
            return;
        }

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

let animationState = {
    path: [],          // Le chemin complet de l'animation
    descendpath: [],   // Le chemin complet descendant
    currentIndex: 0,   // L'index du nœud actuel
    isPaused: false
};

export function startAncestorAnimation() {

    showMap();
    resetMap();
    initBackgroundContainer(); // Initialiser le conteneur de fond

    state.lastHorizontalPosition = 0;
    state.lastVerticalPosition = 0;
    let firstTimeShift = true;
    let offsetX = 0;
    let offsetY = 0;    
    
    // Créer un contrôleur pour pouvoir annuler l'animation
    animationController = {
        isCancelled: false,
        cancel: function() {
            this.isCancelled = true;
        }
    };

    // Réinitialiser ou initialiser l'état si ce n'est pas déjà fait
    if (animationState.path.length === 0) {
        [animationState.path, animationState.descendpath] = findAncestorPath(state.rootPersonId, state.targetAncestorId);
        // console.log("Chemin trouvé:", animationState.path);
        // console.log("Chemin trouvé descendant:", animationState.descendpath);
        
        if (state.treeModeReal === 'descendants' || state.treeModeReal === 'directDescendants' ) {
            animationState.path = animationState.descendpath;
        }


        animationState.currentIndex = 0;
        animationState.isPaused = false;
    }

    // Initialiser la carte au début de l'animation
    initAnimationMap();


    return new Promise(async (resolve, reject) => {
        try {
            // Nettoyer les timeouts existants
            animationTimeouts.forEach(timeout => clearTimeout(timeout));
            animationTimeouts = [];

            // Reprendre à partir de l'index actuel
            for (let i = animationState.currentIndex; i < animationState.path.length; i++) {
                // Vérifier si l'animation a été annulée ou mise en pause
                if (animationController.isCancelled || animationState.isPaused) {
                    animationState.currentIndex = i;
                    break;
                }

                const nodeId = animationState.path[i];
                const node = findNodeInTree(nodeId);
                // console.log("Noeud trouvé ? :",i,  nodeId, node);

                if (node) {

                    // Chercher un lieu à afficher
                    const person = state.gedcomData.individuals[node.data.id];
                    // Mettre à jour l'image de fond en fonction de la date de naissance de la personne
                    if (person && person.birthDate) {
                        const year = extractYear(person.birthDate);
                        if (year) {
                            updateBackgroundImage(year);
                        }
                    }

                    // Utiliser la fonction centralisée pour collecter les lieux
                    const validLocations = collectPersonLocations(person, state.gedcomData.families);


                    // Mettre à jour la carte
                    if (validLocations.length > 0) {
                        // updateAnimationMapLocations(validLocations, locationSymbols);
                        updateAnimationMapLocations(validLocations);
                    }


                    // Créer une promesse qui simule la lecture vocale si le son est coupé
                    const voicePromise = state.isSpeechEnabled 
                        ? speakPersonName(node.data.name)
                        : new Promise(resolve => setTimeout(resolve, 1500));
                    
                    // Attendre la lecture ou le délai
                    await voicePromise;
                    
                    // Actions sur le nœud
                    if (!node.data.children || node.data.children.length === 0) {
                        const event = new Event('click');
                        if (state.treeModeReal === 'descendants' || state.treeModeReal === 'directDescendants' ) {
                            // handleNonRootDescendants(event, node);
                            console.log("debug handleDescendants", node);
                            handleDescendants(node);
                        } else {
                            handleAncestorsClick(event, node);
                        }


                        drawTree();
                    }

                    const zoom = getZoom();
                    if (zoom) {
                        const svg = d3.select("#tree-svg");
                        const lastTransform = getLastTransform() || d3.zoomIdentity;
                        
                        // si le noeud le plus plus à droite est trop près du bord droit on décale vers la gauche
                        if(((node.y > window.innerWidth - 300) || (node.x > window.innerHeight - 400)) && ( ((node.y - state.lastHorizontalPosition) > (state.boxWidth*0.2) ) || ((node.x - state.lastVerticalPosition) > (state.boxHeight*0.2) )) ) {
                            if (firstTimeShift) {
                                offsetX = (node.y - state.lastHorizontalPosition)
                                offsetY = (node.x - state.lastVerticalPosition)
                            }
                            firstTimeShift = false;
                            const horizontalShift = (node.y - state.lastHorizontalPosition) - offsetX  + (state.boxWidth*2) ;
                            const verticalShift = (node.x - state.lastVerticalPosition) - offsetY + (state.boxHeight)*2 ;

                            svg.transition()
                                .duration(750)
                                .call(zoom.transform, 
                                    lastTransform.translate(-horizontalShift, -verticalShift)
                                );

                            state.lastHorizontalPosition = state.lastHorizontalPosition + horizontalShift;
                            state.lastVerticalPosition = state.lastVerticalPosition + verticalShift;
                        }
                    }
                } 
            }
            // Réinitialiser l'état si l'animation est terminée
            if (animationState.currentIndex >= animationState.path.length) {
                animationState.path = [];
                animationState.currentIndex = 0;
            }
            
            resolve(); // Résoudre la promesse une fois terminé
        } catch (error) {
            console.error('Erreur dans l\'animation:', error);
            reject(error); // Rejeter en cas d'erreur
        }
    });
}

export function toggleAnimationPause() {
    const animationPauseBtn = document.getElementById('animationPauseBtn');
    
    // Basculer l'état de pause
    animationState.isPaused = !animationState.isPaused;
    
    // Mettre à jour le bouton
    animationPauseBtn.querySelector('span').textContent = animationState.isPaused ? '▶️' : '⏸️';
    
    if (animationState.isPaused) {
        // Mettre en pause
        stopAnimation();
    } else {
        // Reprendre l'animation
        startAncestorAnimation();
    }
}

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

export function resetMap() {
    // Supprimer le marqueur et réinitialiser la carte
    if (window.animationMapMarkers) {
        window.animationMapMarkers.forEach(marker => {
            if (animationMap) animationMap.removeLayer(marker);
        });
        window.animationMapMarkers = [];
    }
    
    if (animationMap) {
        animationMap.remove();
        animationMap = null;
    }
}




export function resetAnimationState() {
    animationState = {
        path: [],
        currentIndex: 0,
        isPaused: false
    };

    // Réinitialiser le contrôleur d'animation
    if (animationController) {
        animationController.isCancelled = true;
    }

    // Arrêter toute animation en cours
    stopAnimation();

}