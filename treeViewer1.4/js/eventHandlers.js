// ====================================
// Gestionnaires d'événements
// ====================================
import { getZoom } from './treeRenderer.js';
import { state, displayGenealogicTree, hideMap } from './main.js';
import { stopAnimation } from './treeAnimation.js';
import { replaceRootPersonSelector, updateSelectorDisplayText } from './mainUI.js';





/**
 * Initialise les gestionnaires d'événements globaux
 */
export function initializeEventHandlers() {
    window.addEventListener('resize', handleWindowResize);
    window.addEventListener('click', handleModalClick);
    
    document.getElementById("root-person-search")
        .addEventListener("keydown", handleSearchKeydown);
    
    document.getElementById('root-person-results')
        .addEventListener('change', selectRootPerson);

    initializeHeatmapHandlers();
}


export function initializeHeatmapHandlers() {
    const completeButton = document.querySelector('[data-heatmap="complete"]');
    const ancestorsButton = document.querySelector('[data-heatmap="ancestors"]');
    const descendantsButton = document.querySelector('[data-heatmap="descendants"]');

    completeButton?.addEventListener('click', () => createAncestorsHeatMap({ type: 'all' }));
    ancestorsButton?.addEventListener('click', () => createAncestorsHeatMap({ type: 'ancestors' }));
    descendantsButton?.addEventListener('click', () => createAncestorsHeatMap({ type: 'descendants' }));
}




/**
 * Gère le redimensionnement de la fenêtre
 */
export function handleWindowResize() {
    d3.select("#tree-svg")
        .attr("width", window.innerWidth)
        .attr("height", window.innerHeight);
}

/**
 * Gère les clics sur la modale
 */
export function handleModalClick(event) {
    const modal = document.getElementById('person-details-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

/**
 * Gère les touches du clavier pour la recherche
 */
export function handleSearchKeydown(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        searchRootPerson(event);
    }
}

// /**
//  * Recherche d'une personne racine
//  */
// export function searchRootPerson(event) {
//     const searchInput = document.getElementById('root-person-search');
//     const resultsSelect = document.getElementById('root-person-results');
//     const searchStr = searchInput.value.toLowerCase();

//     resultsSelect.innerHTML = '<option value="">Select</option>';
//     resultsSelect.style.display = 'none';

//     if (!searchStr) return;

//     const matchedPersons = Object.values(state.gedcomData.individuals)
//         .filter(person => {
//             const fullName = person.name.toLowerCase().replace(/\//g, '');
//             return fullName.includes(searchStr);
//         });

//     if (matchedPersons.length > 0) {
//         displaySearchResults(matchedPersons, resultsSelect);
//     } else {
//         alert('Aucune personne trouvée');
//     }
// }

// /**
//  * Affiche les résultats de recherche
//  * @private
//  */
// function displaySearchResults(matchedPersons, resultsSelect) {
//     matchedPersons.forEach(person => {
//         const option = document.createElement('option');
//         option.value = person.id;
//         option.textContent = person.name.replace(/\//g, '').trim();
//         resultsSelect.appendChild(option);
//     });
    
//     resultsSelect.style.display = 'block';
//     resultsSelect.style.animation = 'findResults 1s infinite';
//     resultsSelect.style.backgroundColor = 'yellow';
// }




// export function searchRootPerson(event) {
//     const searchInput = document.getElementById('root-person-search');
//     const resultsSelect = document.getElementById('root-person-results');
//     const searchStr = searchInput.value.toLowerCase();

//     if (!resultsSelect) {
//         console.warn("Sélecteur root-person-results non trouvé");
//         return;
//     }

//     // Vider le sélecteur, en fonction de son type
//     if (resultsSelect.tagName === 'SELECT') {
//         resultsSelect.innerHTML = '<option value="">Select</option>';
//     } else {
//         // Sélecteur personnalisé
//         if (resultsSelect.innerHTML !== undefined) {
//             resultsSelect.innerHTML = '';
//         } else {
//             // Méthode alternative pour vider un sélecteur personnalisé
//             const displayElement = resultsSelect.querySelector('div span');
//             if (displayElement) {
//                 displayElement.textContent = '';
//             }
//         }
//     }

//     resultsSelect.style.display = 'none';

//     if (!searchStr) return;

//     const matchedPersons = Object.values(state.gedcomData.individuals)
//         .filter(person => {
//             const fullName = person.name.toLowerCase().replace(/\//g, '');
//             return fullName.includes(searchStr);
//         });

//     if (matchedPersons.length > 0) {
//         displaySearchResults(matchedPersons, resultsSelect);
//     } else {
//         alert('Aucune personne trouvée');
//     }
// }

// Modifiez aussi displaySearchResults pour qu'elle soit compatible
function displaySearchResults(matchedPersons, resultsSelect) {
    if (resultsSelect.tagName === 'SELECT') {
        // Sélecteur standard
        matchedPersons.forEach(person => {
            const option = document.createElement('option');
            option.value = person.id;
            option.textContent = person.name.replace(/\//g, '').trim();
            resultsSelect.appendChild(option);
        });
    } else {
        // Sélecteur personnalisé - utiliser sa méthode spécifique de mise à jour
        // Cette partie dépend de la façon dont votre sélecteur personnalisé gère les options
        // Exemple simplifié:
        const options = matchedPersons.map(person => ({
            value: person.id,
            label: person.name.replace(/\//g, '').trim()
        }));
        
        // Si vous avez une méthode pour mettre à jour les options
        if (typeof resultsSelect.updateOptions === 'function') {
            resultsSelect.updateOptions(options);
        } else {
            // Sinon, essayez de recréer un nouveau sélecteur avec ces options
            import('./mainUI.js').then(module => {
                if (typeof module.replaceRootPersonSelector === 'function') {
                    module.replaceRootPersonSelector(options);
                }
            });
        }
    }
    
    resultsSelect.style.display = 'block';
    resultsSelect.style.animation = 'findResults 1s infinite';
    resultsSelect.style.backgroundColor = 'yellow';
}

// export function searchRootPerson(event) {
//     const searchInput = document.getElementById('root-person-search');
//     const resultsSelect = document.getElementById('root-person-results');
//     const searchStr = searchInput.value.toLowerCase();

//     if (!searchStr) return;

//     const matchedPersons = Object.values(state.gedcomData.individuals)
//         .filter(person => {
//             const fullName = person.name.toLowerCase().replace(/\//g, '');
//             return fullName.includes(searchStr);
//         });

//     if (matchedPersons.length > 0) {
//         // Convertir les personnes trouvées au format d'options pour le sélecteur personnalisé
//         const options = matchedPersons.map(person => ({
//             value: person.id,
//             label: person.name.replace(/\//g, '').trim()
//         }));
        
//         // Si nous avons un sélecteur personnalisé, utiliser sa méthode updateOptions
//         if (resultsSelect && typeof resultsSelect.updateOptions === 'function') {
//             resultsSelect.updateOptions(options);
//             resultsSelect.style.display = 'block';
//             resultsSelect.style.animation = 'findResults 1s infinite';
//             resultsSelect.style.backgroundColor = 'yellow';
//         } else {
//             // Fallback pour le sélecteur standard
//             import('./mainUI.js').then(module => {
//                 if (typeof module.replaceRootPersonSelector === 'function') {
//                     // Créer un nouveau sélecteur avec ces options
//                     module.replaceRootPersonSelector(options);
                    
//                     // Afficher le sélecteur
//                     const newSelector = document.getElementById('root-person-results');
//                     if (newSelector) {
//                         newSelector.style.display = 'block';
//                         newSelector.style.animation = 'findResults 1s infinite';
//                         newSelector.style.backgroundColor = 'yellow';
//                     }
//                 }
//             });
//         }
//     } else {
//         alert('Aucune personne trouvée');
//     }
// }

// /**
//  * Sélectionne une nouvelle personne racine
//  */
// export function selectRootPerson() {
//     const resultsSelect = document.getElementById('root-person-results');
//     const selectedPersonId = resultsSelect.value;

//     if (selectedPersonId) {
//         resultsSelect.style.animation = 'none';
//         resultsSelect.style.backgroundColor = 'orange';

//         state.rootPersonId = selectedPersonId;
//         displayGenealogicTree(selectedPersonId, true);
        
//         resultsSelect.style.display = 'block';
//     }
// }



// export function selectFoundPerson(personId) {
//     if (!personId) return;
    
//     // Afficher la personne comme racine
//     displayGenealogicTree(personId, true);
    
//     // Masquer la liste des résultats
//     const resultsSelect = document.getElementById('root-person-results');
//     if (resultsSelect) {
//         // Réinitialiser le sélecteur avec l'historique complet
//         replaceRootPersonSelector();
//     }
// }















/**
 * Recherche d'une personne racine
 */
// export function searchRootPerson(event) {
//     const searchInput = document.getElementById('root-person-search');
//     const resultsSelect = document.getElementById('root-person-results');
//     const searchStr = searchInput.value.toLowerCase();

//     if (!searchStr) return;

//     const matchedPersons = Object.values(state.gedcomData.individuals)
//         .filter(person => {
//             const fullName = person.name.toLowerCase().replace(/\//g, '');
//             return fullName.includes(searchStr);
//         });

//     if (matchedPersons.length > 0) {
//         // Convertir les personnes trouvées au format d'options pour le sélecteur personnalisé
//         const options = matchedPersons.map(person => ({
//             value: person.id,
//             label: person.name.replace(/\//g, '').trim()
//         }));
        
//         // Si nous avons un sélecteur personnalisé, utiliser sa méthode updateOptions
//         if (resultsSelect) {
//             // Effacer le contenu actuel
//             if (typeof resultsSelect.innerHTML === 'string') {
//                 resultsSelect.innerHTML = '';
//             }
            
//             // Mettre à jour avec les nouveaux résultats
//             if (typeof resultsSelect.updateOptions === 'function') {
//                 resultsSelect.updateOptions(options);
//             } else {
//                 // Fallback pour le sélecteur standard
//                 options.forEach(option => {
//                     const optElement = document.createElement('option');
//                     optElement.value = option.value;
//                     optElement.textContent = option.label;
//                     resultsSelect.appendChild(optElement);
//                 });
//             }
            
//             // Activer le clignotement
//             if (typeof resultsSelect.setBlinking === 'function') {
//                 resultsSelect.setBlinking(true, 'yellow');
//             } else {
//                 resultsSelect.style.display = 'block';
//                 resultsSelect.style.animation = 'findResults 1s infinite';
//                 resultsSelect.style.backgroundColor = 'yellow';
//             }
//         } else {
//             // Cas où le sélecteur n'existe pas encore, créer un nouveau
//             import('./mainUI.js').then(module => {
//                 if (typeof module.replaceRootPersonSelector === 'function') {
//                     const newSelector = module.replaceRootPersonSelector(options);
//                     if (newSelector) {
//                         if (typeof newSelector.setBlinking === 'function') {
//                             newSelector.setBlinking(true, 'yellow');
//                         } else {
//                             newSelector.style.display = 'block';
//                             newSelector.style.animation = 'findResults 1s infinite';
//                             newSelector.style.backgroundColor = 'yellow';
//                         }
//                     }
//                 }
//             });
//         }
//     } else {
//         alert('Aucune personne trouvée');
//     }
// }
/**
 * Recherche d'une personne racine
 */
// export function searchRootPerson(event) {
//     const searchInput = document.getElementById('root-person-search');
//     const resultsSelect = document.getElementById('root-person-results');
//     const searchStr = searchInput.value.toLowerCase();

//     if (!searchStr) return;

//     const matchedPersons = Object.values(state.gedcomData.individuals)
//         .filter(person => {
//             const fullName = person.name.toLowerCase().replace(/\//g, '');
//             return fullName.includes(searchStr);
//         });

//     if (matchedPersons.length > 0) {
//         // Convertir les personnes trouvées au format d'options pour le sélecteur personnalisé
//         const options = matchedPersons.map(person => ({
//             value: person.id,
//             label: person.name.replace(/\//g, '').trim()
//         }));
        
//         // Ajouter l'option "Select" en première position
//         options.unshift({
//             value: "",
//             label: "Select"
//         });
        
//         // Si nous avons un sélecteur personnalisé, utiliser sa méthode updateOptions
//         if (resultsSelect) {
//             // Effacer le contenu actuel
//             if (typeof resultsSelect.innerHTML === 'string') {
//                 resultsSelect.innerHTML = '';
//             }
            
//             // Mettre à jour avec les nouveaux résultats
//             if (typeof resultsSelect.updateOptions === 'function') {
//                 resultsSelect.updateOptions(options);
                
//                 // Forcer l'affichage de "Select" comme texte affiché
//                 const displayElement = resultsSelect.querySelector('div span');
//                 if (displayElement) {
//                     displayElement.textContent = "Select";
//                 }
//             } else {
//                 // Fallback pour le sélecteur standard
//                 const selectOption = document.createElement('option');
//                 selectOption.value = "";
//                 selectOption.textContent = "Select";
//                 resultsSelect.appendChild(selectOption);
                
//                 options.slice(1).forEach(option => { // Ignorer le premier ("Select") qu'on vient d'ajouter
//                     const optElement = document.createElement('option');
//                     optElement.value = option.value;
//                     optElement.textContent = option.label;
//                     resultsSelect.appendChild(optElement);
//                 });
                
//                 // Définir "Select" comme option sélectionnée
//                 resultsSelect.value = "";
//             }
            
//             // Activer le clignotement
//             if (typeof resultsSelect.setBlinking === 'function') {
//                 resultsSelect.setBlinking(true, 'yellow');
//             } else {
//                 resultsSelect.style.display = 'block';
//                 resultsSelect.style.animation = 'findResults 1s infinite';
//                 resultsSelect.style.backgroundColor = 'yellow';
//             }
//         } else {
//             // Cas où le sélecteur n'existe pas encore, créer un nouveau
//             import('./mainUI.js').then(module => {
//                 if (typeof module.replaceRootPersonSelector === 'function') {
//                     const newSelector = module.replaceRootPersonSelector(options);
//                     if (newSelector) {
//                         // Forcer l'affichage de "Select" comme texte affiché
//                         const displayElement = newSelector.querySelector('div span');
//                         if (displayElement) {
//                             displayElement.textContent = "Select";
//                         }
                        
//                         if (typeof newSelector.setBlinking === 'function') {
//                             newSelector.setBlinking(true, 'yellow');
//                         } else {
//                             newSelector.style.display = 'block';
//                             newSelector.style.animation = 'findResults 1s infinite';
//                             newSelector.style.backgroundColor = 'yellow';
//                         }
//                     }
//                 }
//             });
//         }
//     } else {
//         alert('Aucune personne trouvée');
//     }
// }



/**
 * Recherche d'une personne racine
 */
// export function searchRootPerson(event) {
//     const searchInput = document.getElementById('root-person-search');
//     const resultsSelect = document.getElementById('root-person-results');
//     const searchStr = searchInput.value.toLowerCase();

//     if (!searchStr) return;

//     const matchedPersons = Object.values(state.gedcomData.individuals)
//         .filter(person => {
//             const fullName = person.name.toLowerCase().replace(/\//g, '');
//             return fullName.includes(searchStr);
//         });

//     if (matchedPersons.length > 0) {
//         // Convertir les personnes trouvées au format d'options pour le sélecteur personnalisé
//         const options = matchedPersons.map(person => ({
//             value: person.id,
//             label: person.name.replace(/\//g, '').trim()
//         }));
        
//         // Ajouter l'option "Select" en première position avec un style spécial
//         options.unshift({
//             value: "",
//             label: "Select"
//         });
        
//         // Si nous avons un sélecteur personnalisé, utiliser sa méthode updateOptions
//         if (resultsSelect) {
//             // Effacer le contenu actuel
//             if (typeof resultsSelect.innerHTML === 'string') {
//                 resultsSelect.innerHTML = '';
//             }
            
//             // Mettre à jour avec les nouveaux résultats
//             if (typeof resultsSelect.updateOptions === 'function') {
//                 resultsSelect.updateOptions(options);
                
//                 // Forcer l'affichage de "Select" comme texte affiché
//                 const displayElement = resultsSelect.querySelector('div span');
//                 if (displayElement) {
//                     displayElement.textContent = "Select";
//                 }
//             } else {
//                 // Fallback pour le sélecteur standard
//                 const selectOption = document.createElement('option');
//                 selectOption.value = "";
//                 selectOption.textContent = "Select";
//                 selectOption.selected = true;
//                 resultsSelect.appendChild(selectOption);
                
//                 options.slice(1).forEach(option => { // Ignorer le premier ("Select") qu'on vient d'ajouter
//                     const optElement = document.createElement('option');
//                     optElement.value = option.value;
//                     optElement.textContent = option.label;
//                     resultsSelect.appendChild(optElement);
//                 });
//             }
            
//             // Activer le clignotement
//             if (typeof resultsSelect.setBlinking === 'function') {
//                 resultsSelect.setBlinking(true); // Utiliser l'orange vif défini dans la méthode
//             } else {
//                 resultsSelect.style.display = 'block';
//                 // Créer une animation de clignotement directement
//                 const orangeVif = '#FF5722';
//                 resultsSelect.style.animation = 'none'; // Réinitialiser toute animation existante
//                 resultsSelect.style.backgroundColor = orangeVif;
                
//                 // On utilise setTimeout pour forcer un recalcul du style et appliquer l'animation
//                 setTimeout(() => {
//                     // Appliquer l'animation directement si elle n'existe pas déjà
//                     if (!document.getElementById('blink-keyframes-fallback')) {
//                         const styleElement = document.createElement('style');
//                         styleElement.id = 'blink-keyframes-fallback';
//                         styleElement.textContent = `
//                             @keyframes blink-fallback {
//                                 0% { background-color: #FF5722; }
//                                 50% { background-color: rgba(255, 87, 34, 0.5); }
//                                 100% { background-color: #FF5722; }
//                             }
//                         `;
//                         document.head.appendChild(styleElement);
//                     }
//                     resultsSelect.style.animation = 'blink-fallback 0.7s infinite';
//                 }, 10);
//             }
//         } else {
//             // Cas où le sélecteur n'existe pas encore, créer un nouveau
//             import('./mainUI.js').then(module => {
//                 if (typeof module.replaceRootPersonSelector === 'function') {
//                     const newSelector = module.replaceRootPersonSelector(options);
//                     if (newSelector) {
//                         // Forcer l'affichage de "Select" comme texte affiché
//                         const displayElement = newSelector.querySelector('div span');
//                         if (displayElement) {
//                             displayElement.textContent = "Select";
//                         }
                        
//                         if (typeof newSelector.setBlinking === 'function') {
//                             newSelector.setBlinking(true);
//                         }
//                     }
//                 }
//             });
//         }
//     } else {
//         alert('Aucune personne trouvée');
//     }
// }


/**
 * Sélectionne une nouvelle personne racine
 */
export function selectRootPerson() {
    const resultsSelect = document.getElementById('root-person-results');
    const selectedPersonId = resultsSelect.value;

    if (selectedPersonId) {
        // Désactiver le clignotement
        if (typeof resultsSelect.setBlinking === 'function') {
            resultsSelect.setBlinking(false);
        } else {
            resultsSelect.style.animation = 'none';
            resultsSelect.style.backgroundColor = 'orange';
        }

        state.rootPersonId = selectedPersonId;
        displayGenealogicTree(selectedPersonId, true);
        
        resultsSelect.style.display = 'block';
    }
}

/**
 * Fonction appelée lorsqu'une personne est sélectionnée dans la liste des résultats de recherche
 */
// export function selectFoundPerson(personId) {
//     if (!personId) return;
    
//     const resultsSelect = document.getElementById('root-person-results');
    
//     // Désactiver le clignotement s'il existe
//     if (resultsSelect) {
//         if (typeof resultsSelect.setBlinking === 'function') {
//             resultsSelect.setBlinking(false);
//         } else {
//             resultsSelect.style.animation = 'none';
//             resultsSelect.style.backgroundColor = 'orange';
//         }
//     }
    
//     // Afficher la personne comme racine
//     displayGenealogicTree(personId, true);
// }


/**
 * Fonction appelée lorsqu'une personne est sélectionnée dans la liste des résultats de recherche
 */
// export function selectFoundPerson(personId) {
//     if (!personId) return;
    
//     const resultsSelect = document.getElementById('root-person-results');
    
//     // Désactiver le clignotement s'il existe
//     if (resultsSelect) {
//         if (typeof resultsSelect.setBlinking === 'function') {
//             resultsSelect.setBlinking(false);
//         } else {
//             resultsSelect.style.animation = 'none';
//             resultsSelect.style.backgroundColor = 'orange';
//         }
//     }
    
//     // Afficher la personne comme racine
//     displayGenealogicTree(personId, true);
    
//     // IMPORTANT: Après avoir affiché l'arbre avec la nouvelle personne racine,
//     // réinitialiser le sélecteur pour afficher l'historique
//     setTimeout(() => {
//         // Récupération de l'historique des racines depuis le localStorage
//         // qui doit maintenant inclure la personne sélectionnée
//         let rootHistory = JSON.parse(localStorage.getItem('rootPersonHistory') || '[]');
        
//         // Création des options pour l'historique
//         const options = rootHistory.map(entry => ({
//             value: entry.id,
//             label: entry.name
//         }));
        
//         // Ajouter l'option "Clear History"
//         options.push({ value: 'clear-history', label: '--- Clear History ---' });
        
//         // Ajouter les options pour les démos
//         options.push({ value: 'demo1', label: '--- Demo1 ---' });
//         options.push({ value: 'demo2', label: '--- Demo2 ---' });
        
//         // Mettre à jour le sélecteur avec ces options
//         if (resultsSelect && typeof resultsSelect.updateOptions === 'function') {
//             // Définir la personne sélectionnée comme valeur actuelle
//             resultsSelect.value = personId;
            
//             // Mettre à jour les options
//             resultsSelect.updateOptions(options);
            
//             // Mettre à jour l'affichage si possible
//             const selectedPerson = rootHistory.find(entry => entry.id === personId);
//             if (selectedPerson) {
//                 const displayElement = resultsSelect.querySelector('div span');
//                 if (displayElement) {
//                     displayElement.textContent = selectedPerson.name;
//                 }
//             }
//         } else {
//             // Si le sélecteur personnalisé n'est pas disponible, on essaie de le recréer
//             import('./mainUI.js').then(module => {
//                 if (typeof module.replaceRootPersonSelector === 'function') {
//                     module.replaceRootPersonSelector();
//                 }
//             });
//         }
//     }, 100);
// }







// ====================================
// 2. Modifications dans eventHandlers.js
// ====================================

// Fonction améliorée pour la recherche
export function searchRootPerson(event) {
    const searchInput = document.getElementById('root-person-search');
    const resultsSelect = document.getElementById('root-person-results');
    const searchStr = searchInput.value.toLowerCase();

    if (!searchStr) return;

    const matchedPersons = Object.values(state.gedcomData.individuals)
        .filter(person => {
            const fullName = person.name.toLowerCase().replace(/\//g, '');
            return fullName.includes(searchStr);
        });

    if (matchedPersons.length > 0) {
        // Convertir les personnes trouvées au format d'options pour le sélecteur personnalisé
        const options = matchedPersons.map(person => ({
            value: person.id,
            label: person.name.replace(/\//g, '').trim()
        }));
        
        // Ajouter l'option "Select" en première position avec un style spécial
        options.unshift({
            value: "",
            label: "Select"
        });
        
        // Si nous avons un sélecteur personnalisé, utiliser replaceRootPersonSelector
        // pour garantir une transition propre vers le mode recherche
        import('./mainUI.js').then(module => {
            if (typeof module.replaceRootPersonSelector === 'function') {
                const newSelector = module.replaceRootPersonSelector(options);
                if (newSelector) {
                    // Forcer l'affichage de "Select" comme texte affiché avec troncature
                    module.updateSelectorDisplayText(newSelector, "Select");
                    
                    if (typeof newSelector.setBlinking === 'function') {
                        newSelector.setBlinking(true);
                    }
                }
            }
        });
    } else {
        alert('Aucune personne trouvée');
    }
}

// Fonction améliorée pour la sélection d'une personne trouvée
export function selectFoundPerson(personId) {
    if (!personId) return;
    
    const resultsSelect = document.getElementById('root-person-results');
    
    // Désactiver le clignotement s'il existe
    if (resultsSelect) {
        if (typeof resultsSelect.setBlinking === 'function') {
            resultsSelect.setBlinking(false);
        } else {
            resultsSelect.style.animation = 'none';
            resultsSelect.style.backgroundColor = 'orange';
        }
    }
    
    // Afficher la personne comme racine
    displayGenealogicTree(personId, true);
    
    // Attendre que l'arbre soit affiché et que l'historique soit mis à jour
    setTimeout(() => {
        // Forcer une recréation complète du sélecteur en mode historique
        // plutôt que d'essayer de mettre à jour celui existant
        import('./mainUI.js').then(module => {
            if (typeof module.replaceRootPersonSelector === 'function') {
                // Recréer le sélecteur avec l'historique mis à jour
                const newSelector = module.replaceRootPersonSelector();
                
                // S'assurer que la personne sélectionnée est choisie comme valeur courante
                if (newSelector) {
                    // Rechercher la personne dans l'historique mis à jour
                    const rootHistory = JSON.parse(localStorage.getItem('rootPersonHistory') || '[]');
                    const selectedPerson = rootHistory.find(entry => entry.id === personId);
                    
                    if (selectedPerson) {
                        // Définir la valeur sélectionnée
                        newSelector.value = personId;
                        
                        // Mettre à jour l'affichage avec le nom tronqué
                        module.updateSelectorDisplayText(newSelector, selectedPerson.name);
                    }
                }
            }
        });
    }, 200); // Augmenter le délai pour s'assurer que tout est bien synchronisé
}








/**
 * Gère les mises à jour du nombre de prénoms
 */
export function updatePrenoms(value) {
    state.nombre_prenoms = parseInt(value);
    displayGenealogicTree(null, false, false);
}

/**
 * Gère les mises à jour du nombre de mots dans les noms
 */
export function updateLettersInNames(value) {
    state.nombre_lettersInNames = parseInt(value)-1;
    displayGenealogicTree(null, false, false);
}


/**
 * Gère les mises à jour du nombre de générations
 */
export function updateGenerations(value) {
    state.nombre_generation = parseInt(value);
    displayGenealogicTree(null, true, false);
}

// export function updateGenerations(value) {
//     if (value === state.nombre_generation) return; // Éviter le redessinage si même valeur
//     state.nombre_generation = parseInt(value);
//     displayGenealogicTree(null, false);
// }



/**
 * Gère le zoom avant
 */
export function zoomIn() {
    const svg = d3.select("#tree-svg");
    const zoom = getZoom();
    if (zoom) {
        svg.transition()
            .duration(750)
            .call(zoom.scaleBy, 1.2);
    }
}


/**
 * Gère le zoom arrière
 */
export function zoomOut() {
    const svg = d3.select("#tree-svg");
    const zoom = getZoom();
    if (zoom) {
        svg.transition()
            .duration(750)
            .call(zoom.scaleBy, 0.8);
    }
}


/**
 * Réinitialise la vue de l'arbre à sa position par défaut selon le mode
 * En mode ascendant : arbre aligné à gauche
 * En mode descendant : arbre aligné à droite
 * @export
 */
export function resetView() {
    const svg = d3.select("#tree-svg");
    const height = window.innerHeight;
    const zoom = getZoom();
    
    if (zoom) {
        let transform = d3.zoomIdentity;
        if (state.treeMode === 'descendants') {
            // Pour les descendants, commencer du côté droit
            transform = transform.translate(window.innerWidth - state.boxWidth * 2, height / 2);
        } else {
            // Pour les ascendants, commencer du côté gauche
            transform = transform.translate(state.boxWidth, height / 2);
        }
        transform = transform.scale(0.8);

        svg.transition()
            .duration(750)
            .call(zoom.transform, transform);
    }
}

/**
 * Réinitialise le niveau de zoom et la position de l'arbre
 * à leurs valeurs par défaut selon le mode d'affichage
 * Utilise une transition animée pour un retour fluide à la vue initiale
 * @export
 */
// export function resetZoom() {
//     stopAnimation();
//     resetView();
//     hideMap();
// }

export function resetZoom() {
    // Arrêter l'animation en cours, si présente
    stopAnimation();
    
    // Réinitialiser la vue
    resetView();
    
    // Masquer la carte
    hideMap();
    
    // Supprimer l'image de fond
    const loginBackground = document.querySelector('.login-background');
    if (loginBackground) {
        loginBackground.remove();
    }
    
    // Supprimer également tout autre conteneur de fond d'écran existant
    const existingBackgroundContainer = document.querySelector('.background-container');
    if (existingBackgroundContainer) {
        existingBackgroundContainer.remove();
    }
    
    // S'assurer que le body a la classe indiquant qu'on est en mode arbre
    document.body.classList.add('tree-view');
}

/**
 * Recherche dans l'arbre
 */
export function searchTree(str) {
    d3.selectAll('.person-box').classed('search-highlight', false);
    
    if (!str) {
        if (!state.rootPersonId) {
            resetZoom();
        }
        return;
    }
    
    const searchStr = str.toLowerCase();
    const matchedNodes = findMatchingNodes(searchStr);
    
    if (matchedNodes.length > 0) {
        highlightAndZoomToNode(matchedNodes[0]);
    }
}

/**
 * Trouve les nœuds correspondant à la recherche
 * @private
 */
function findMatchingNodes(searchStr) {
    const matchedNodes = [];
    
    d3.selectAll('.node').each(function(d) {
        const name = d.data.name.toLowerCase().replace(/\//g, '');
        if (name.includes(searchStr)) {
            matchedNodes.push({node: d, element: this});
            d3.select(this).select('.person-box').classed('search-highlight', true);
        }
    });
    
    return matchedNodes;
}

/**
 * Met en surbrillance et zoome sur un nœud
 * @private
 */
function highlightAndZoomToNode(matchedNode) {
    const svg = d3.select("#tree-svg");
    const nodeElement = d3.select(matchedNode.element);
    const nodeTransform = nodeElement.attr('transform');
    
    const transformMatch = nodeTransform.match(/translate\(([^,]+),([^)]+)\)/);
    if (transformMatch) {
        const x = parseFloat(transformMatch[1]);
        const y = parseFloat(transformMatch[2]);

        svg.transition()
            .duration(750)
            .call(getZoom().transform, 
                d3.zoomIdentity
                    .translate(window.innerWidth/2 - x, window.innerHeight/2 - y)
                    .scale(1)
            );
    }
}