// ====================================
// Animation de l'arbre
// ====================================
import { state  } from './main.js';
import { handleAncestorsClick } from './nodeControls.js';
import { getZoom, getLastTransform, drawTree } from './treeRenderer.js';
import { buildDescendantTree } from './treeOperations.js';
import { geocodeLocation } from './modalWindow.js';

// ID en dur pour test
const TARGET_ANCESTOR_ID = "@I1336@"
//"@I748@"
//"@I741@"; 
// "@I5@" ; OK
// "@I1328@"; Bad // À remplacer par l'ID réel de l'ancêtre cible
 


let animationTimeouts = [];
let optimalSpeechRate = 0.9;
let animationMap = null;
let animationMarker = null;

function initAnimationMap() {
    // Initialiser la carte
    const mapContainer = document.getElementById('animation-map');
    if (!mapContainer) return null;

    animationMap = L.map('animation-map', {
        center: [46.2276, 2.2137], // Centre de la France
        zoom: 5,
        zoomControl: false,
        attributionControl: false
    });

    // Ajouter la couche de tuiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(animationMap);

    return animationMap;
}

function updateMapLocation(location) {
    if (!animationMap) {
        animationMap = initAnimationMap();
    }

    // Géocoder la localisation
    geocodeLocation(location).then(coords => {
        if (coords) {
            // Supprimer le marqueur précédent s'il existe
            if (animationMarker) {
                animationMap.removeLayer(animationMarker);
            }

            // Créer un nouveau marqueur avec une animation
            animationMarker = L.marker([coords.lat, coords.lon], {
                icon: L.icon({
                    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41]
                })
            }).addTo(animationMap);

            // Animation de zoom et de centrage
            animationMap.flyTo([coords.lat, coords.lon], 8, {
                animate: true,
                duration: 1.5 // Durée de l'animation en secondes
            });
        }
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

    // Restaurer nombre_generation
    state.nombre_generation = savedGen;
    
    // Fonction pour trouver un nœud et son chemin dans l'arbre
    function findNodeAndPath(node, targetId, currentPath = []) {
        
        if (node.id === targetId) {
            return [...currentPath, node.id];
        }
        
        if (node.children) {
            for (const child of node.children) {
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
    
    // Inverser le chemin pour aller de la racine vers l'ancêtre
    const finalPath = path ? path.reverse() : [];
    
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
    currentIndex: 0,   // L'index du nœud actuel
    isPaused: false
};

export function startAncestorAnimation() {

    // if (state.isAnimationPaused) return;

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
        animationState.path = findAncestorPath(state.rootPersonId, TARGET_ANCESTOR_ID);
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

            // const path = findAncestorPath(state.rootPersonId, TARGET_ANCESTOR_ID);
            // console.log("Chemin vers l'ancêtre:", path);
            
            // for (const nodeId of path) {
            // for (const [index, nodeId] of path.entries()) {

            //     // Vérifier si l'animation a été annulée
            //     if (animationController.isCancelled) {
            //         // console.log('Animation annulée');
            //         break;
            //     }

            // Reprendre à partir de l'index actuel
            for (let i = animationState.currentIndex; i < animationState.path.length; i++) {
                // Vérifier si l'animation a été annulée ou mise en pause
                if (animationController.isCancelled || animationState.isPaused) {
                    animationState.currentIndex = i;
                    break;
                }

                const nodeId = animationState.path[i];
                const node = findNodeInTree(nodeId);

                if (node) {


                    // Chercher un lieu à afficher
                    const person = state.gedcomData.individuals[node.data.id];
                    const locationToDisplay = person.birthPlace || 
                        (person.spouseFamilies && 
                         person.spouseFamilies.length > 0 && 
                         state.gedcomData.families[person.spouseFamilies[0]].marriagePlace) || 
                        person.deathPlace;

                    // Mettre à jour la carte si un lieu est trouvé
                    if (locationToDisplay) {
                        updateMapLocation(locationToDisplay);
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
                        handleAncestorsClick(event, node);
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


    // Supprimer le marqueur et réinitialiser la carte
    if (animationMarker) {
        animationMap.removeLayer(animationMarker);
        animationMarker = null;
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