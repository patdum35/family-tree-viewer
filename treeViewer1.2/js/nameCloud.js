// Ajout dans la section des imports
import { buildAncestorTree, buildDescendantTree } from './treeOperations.js';
import { state, displayPersonDetails, showToast } from './main.js';
import { startAncestorAnimation } from './treeAnimation.js';


let SVG_width = 1920; //1200;
let SVG_height = 1080; //800;
let nameCloudContainer;
let titleElement;
let totalWords;
let placedWords;
let mobilePhone;

// Variable globale pour stocker les données actuelles du nuage
let currentNameData = null;
let currentConfig = null;

// Structure des stats
const stats = {
    totalPersons: 0,
    directDates: {
        birth: 0,
        death: 0,
        marriage: 0,
        people: new Set() // Pour compter les personnes uniques avec dates directes
    },
    ancestorDates: [],
    descendantDates: [],
    noDates: [],
    inPeriod: 0,
    uniqueNames: 0
};

// Reset des stats
function resetStats() {
    stats.totalPersons = 0;
    stats.directDates = {
        birth: 0,
        death: 0,
        marriage: 0,
        people: new Set()
    };
    stats.ancestorDates = [];
    stats.descendantDates = [];
    stats.noDates = [];
    stats.inPeriod = 0;
    stats.uniqueNames = 0;
}

function findDateForPerson(personId) {
    const person = state.gedcomData.individuals[personId];
    if (!person) return null;

    // Vérifier les dates directes
    if (person.birthDate) {
        stats.directDates.birth++;
        stats.total++;
        return { year: extractYear(person.birthDate), type: 'birth' };
    }
    if (person.deathDate) {
        stats.directDates.death++;
        stats.total++;
        return { year: extractYear(person.deathDate), type: 'death' };
    }

    // Vérifier les dates de mariage
    if (person.spouseFamilies) {
        for (const famId of person.spouseFamilies) {
            const family = state.gedcomData.families[famId];
            if (family && family.marriageDate) {
                stats.directDates.marriage++;
                stats.total++;
                return { year: extractYear(family.marriageDate), type: 'marriage' };
            }
        }
    }

    // Liste pour stocker les dates trouvées
    let dates = [];
    let dateFound = false;

    // Fonction pour remonter aux ancêtres
    function checkAncestors(currentId, depth = 0, visited = new Set()) {
        if (dateFound) return;
        
        if (depth > 20 || !currentId || visited.has(currentId)) return;
        
        visited.add(currentId);
        const current = state.gedcomData.individuals[currentId];
        if (!current) return;

        // Vérifier les dates
        if (current.birthDate) {
            dates.push({ 
                year: extractYear(current.birthDate), 
                type: 'ancestor_birth', 
                depth,
                name: current.name.replace(/\//g, '')
            });
            dateFound = true;
            return;
        }
        if (current.deathDate) {
            dates.push({ 
                year: extractYear(current.deathDate), 
                type: 'ancestor_death', 
                depth,
                name: current.name.replace(/\//g, '')
            });
            dateFound = true;
            return;
        }

        // Vérifier mariages
        if (current.spouseFamilies) {
            for (const famId of current.spouseFamilies) {
                const family = state.gedcomData.families[famId];
                if (family && family.marriageDate) {
                    dates.push({ 
                        year: extractYear(family.marriageDate), 
                        type: 'ancestor_marriage', 
                        depth,
                        name: current.name.replace(/\//g, '')
                    });
                    dateFound = true;
                    return;
                }
            }
        }

        // Remonter aux parents
        if (!dateFound && current.families && current.families.length > 0) {
            const parentFamily = state.gedcomData.families[current.families[0]];
            if (parentFamily) {
                if (parentFamily.husband) {
                    checkAncestors(parentFamily.husband, depth + 1, visited);
                }
                if (!dateFound && parentFamily.wife) {
                    checkAncestors(parentFamily.wife, depth + 1, visited);
                }
            }
        }
    }

    // Fonction pour descendre aux descendants
    function checkDescendants(currentId, depth = 0, visited = new Set()) {
        if (dateFound) return;
        
        if (depth > 20 || !currentId || visited.has(currentId)) return;

        visited.add(currentId);
        const current = state.gedcomData.individuals[currentId];
        if (!current) return;

        // Vérifier les dates
        if (current.birthDate) {
            dates.push({ 
                year: extractYear(current.birthDate), 
                type: 'descendant_birth', 
                depth,
                name: current.name.replace(/\//g, '')
            });
            dateFound = true;
            return;
        }
        if (current.deathDate) {
            dates.push({ 
                year: extractYear(current.deathDate), 
                type: 'descendant_death', 
                depth,
                name: current.name.replace(/\//g, '')
            });
            dateFound = true;
            return;
        }

        if (!dateFound && current.spouseFamilies) {
            for (const famId of current.spouseFamilies) {
                const family = state.gedcomData.families[famId];
                if (family) {
                    if (family.marriageDate) {
                        dates.push({ 
                            year: extractYear(family.marriageDate), 
                            type: 'descendant_marriage', 
                            depth,
                            name: current.name.replace(/\//g, '')
                        });
                        dateFound = true;
                        return;
                    }
                    if (!dateFound && family.children) {
                        for (const childId of family.children) {
                            if (!dateFound) {
                                checkDescendants(childId, depth + 1, visited);
                            }
                        }
                    }
                }
            }
        }
    }

    checkAncestors(personId, 0, new Set());

    if (!dateFound) {
        checkDescendants(personId, 0, new Set());
    }

    if (dates.length > 0) {
        dates.sort((a, b) => a.depth - b.depth);
        const foundDate = dates[0];
        
        // Ajouter aux statistiques
        if (foundDate.type.startsWith('ancestor_')) {
            stats.ancestorDates.push({ 
                name: foundDate.name,
                depth: foundDate.depth, 
                type: foundDate.type.replace('ancestor_', ''),
                year: foundDate.year
            });
        } else if (foundDate.type.startsWith('descendant_')) {
            stats.descendantDates.push({ 
                name: foundDate.name,
                depth: foundDate.depth, 
                type: foundDate.type.replace('descendant_', ''),
                year: foundDate.year
            });
        }
        stats.total++;
        
        return foundDate;
    }
    
    return null;
}

// Fonction pour afficher les statistiques
// Fonction d'affichage des stats modifiée pour plus de clarté
function displayDateStats() {
    console.log('\n===== STATISTIQUES GLOBALES =====');
    console.log(`\nNombre total de personnes dans le GEDCOM : ${stats.totalPersons}`);

    // Dates directes
    const Ndirect = stats.directDates.people.size;
    console.log(`\nPersonnes avec dates directes (Ndirect = ${Ndirect}) :`);
    console.log(`- Par naissance : ${stats.directDates.birth}`);
    console.log(`- Par décès : ${stats.directDates.death}`);
    console.log(`- Par mariage : ${stats.directDates.marriage}`);

    // Dates via ancêtres
    const Nancestor = stats.ancestorDates.length;
    console.log(`\nPersonnes avec dates via ancêtres (Nancestor = ${Nancestor}) :`);
    if (Nancestor > 0) {
        console.log('Liste des personnes (avec nombre d\'itérations utilisées) :');
        stats.ancestorDates.forEach(d => {
            console.log(`- ${d.name} (${d.type}, ${d.year}) : ${d.depth} itération${d.depth > 1 ? 's' : ''}`);
        });

        // Résumé par profondeur
        console.log('\nRésumé par nombre d\'itérations :');
        const byDepth = stats.ancestorDates.reduce((acc, date) => {
            acc[date.depth] = (acc[date.depth] || 0) + 1;
            return acc;
        }, {});
        Object.entries(byDepth)
            .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
            .forEach(([depth, count]) => {
                console.log(`  ${count} personne${count > 1 ? 's' : ''} trouvée${count > 1 ? 's' : ''} en ${depth} itération${depth > 1 ? 's' : ''}`);
            });
    }

    // Dates via descendants
    const Ndescend = stats.descendantDates.length;
    console.log(`\nPersonnes avec dates via descendants (Ndescend = ${Ndescend}) :`);
    if (Ndescend > 0) {
        console.log('Liste des personnes (avec nombre d\'itérations utilisées) :');
        stats.descendantDates.forEach(d => {
            console.log(`- ${d.name} (${d.type}, ${d.year}) : ${d.depth} itération${d.depth > 1 ? 's' : ''}`);
        });

        // Résumé par profondeur
        console.log('\nRésumé par nombre d\'itérations :');
        const byDepth = stats.descendantDates.reduce((acc, date) => {
            acc[date.depth] = (acc[date.depth] || 0) + 1;
            return acc;
        }, {});
        Object.entries(byDepth)
            .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
            .forEach(([depth, count]) => {
                console.log(`  ${count} personne${count > 1 ? 's' : ''} trouvée${count > 1 ? 's' : ''} en ${depth} itération${depth > 1 ? 's' : ''}`);
            });
    }

    // Personnes sans date
    const Nnodate = stats.noDates.length;
    console.log(`\nPersonnes sans date trouvée (Nnodate = ${Nnodate}) :`);
    if (Nnodate > 0) {
        stats.noDates.sort((a, b) => a.name.localeCompare(b.name))
            .forEach(p => console.log(`- ${p.name}`));
    }

    // Vérification du total
    console.log('\nVérification des totaux :');
    console.log(`Ntotal = ${stats.totalPersons}`);
    console.log(`Ndirect + Nancestor + Ndescend + Nnodate = ${Ndirect} + ${Nancestor} + ${Ndescend} + ${Nnodate} = ${Ndirect + Nancestor + Ndescend + Nnodate}`);

    // Stats de la période
    console.log(`\nStatistiques pour la période sélectionnée :`);
    console.log(`- Nombre de personnes dans la période : ${stats.inPeriod}`);
    console.log(`- Nombre de noms uniques retenus : ${stats.uniqueNames}`);

    console.log('\n========================================');
}


function showPersonsList(name, people, config) {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '2000';

    const content = document.createElement('div');
    content.style.backgroundColor = 'white';
    content.style.padding = '20px';
    content.style.borderRadius = '10px';
    content.style.width = '80%';
    content.style.maxWidth = '800px';
    content.style.maxHeight = '80vh';
    content.style.overflowY = 'auto';
    content.style.position = 'relative';

    // Titre
    const title = document.createElement('h2');
    title.textContent = config.type === 'prenoms' ? 
        `Liste des personnes avec le prénom "${name}" (${people.length} personnes)` :
        config.type === 'noms' ?
            `Liste des personnes avec le nom "${name}" (${people.length} personnes)` :
            config.type === 'professions' ? 
                `Liste des personnes avec la profession "${name}" (${people.length} personnes)` :
                config.type === 'duree_vie' ? 
                    `Liste des personnes ayant vécu ${name} ans (${people.length} personnes)` :
                    config.type === 'age_procreation' ?
                    `Liste des personnes ayant eu un enfant à ${name} ans (${people.length} personnes)` : 
                        config.type === 'lieux' ?
                        `Liste des personnes ayant un lien avec le lieu ${name}  (${people.length} personnes)`:
                        'Liste des personnes';

    title.style.marginBottom = '10px';
    title.style.borderBottom = '1px solid #eee';
    title.style.paddingBottom = '5px';
    title.style.fontSize = '16px';

    // Bouton de fermeture
    const closeBtn = document.createElement('button');
    closeBtn.id = 'person-list-close-button';  // Ajout d'un ID unique
    closeBtn.innerHTML = '×';
    closeBtn.style.position = 'absolute';
    closeBtn.style.right = '10px';
    closeBtn.style.top = '10px';
    closeBtn.style.border = 'none';
    closeBtn.style.background = 'none';
    closeBtn.style.fontSize = '20px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = () => {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    };

    // Liste des personnes
    const list = document.createElement('div');
    list.style.display = 'grid';
    list.style.gap = '2px';  // Espacement réduit
    list.style.fontSize = '14px';  // Taille de police réduite

    // Trier les personnes par date
    const peopleWithDates = people.map(person => {
        let date = '';
        let sortDate = 0;
        const individual = state.gedcomData.individuals[person.id];

        if (individual) {
            if (individual.birthDate) {
                date = `Naissance: ${individual.birthDate}`;
                sortDate = extractYear(individual.birthDate) || 0;
            } else if (individual.deathDate) {
                date = `Décès: ${individual.deathDate}`;
                sortDate = extractYear(individual.deathDate) || 0;
            } else if (individual.spouseFamilies && individual.spouseFamilies.length > 0) {
                for (const famId of individual.spouseFamilies) {
                    const family = state.gedcomData.families[famId];
                    if (family && family.marriageDate) {
                        date = `Mariage: ${family.marriageDate}`;
                        sortDate = extractYear(family.marriageDate) || 0;
                        break;
                    }
                }
            }
        }

        return {
            name: person.name,
            id: person.id,  // Assurez-vous d'inclure l'ID ici
            date: date,
            sortDate: sortDate
        };
    }).sort((a, b) => b.sortDate - a.sortDate);


    peopleWithDates.forEach((person, index) => {
        const personDiv = document.createElement('div');
        personDiv.style.padding = '3px 5px';
        personDiv.style.backgroundColor = index % 2 === 0 ? '#f9f9f9' : 'white';
        personDiv.style.display = 'flex';
        personDiv.style.justifyContent = 'space-between';
        personDiv.style.alignItems = 'center';
        personDiv.style.lineHeight = '1.2';
        personDiv.style.cursor = 'pointer';

        const nameSpan = document.createElement('span');
        nameSpan.textContent = person.name;
        nameSpan.style.marginRight = '10px';

        const dateSpan = document.createElement('span');
        dateSpan.textContent = person.date;
        dateSpan.style.color = '#666';
        dateSpan.style.whiteSpace = 'nowrap';

        personDiv.appendChild(nameSpan);
        personDiv.appendChild(dateSpan);

        personDiv.addEventListener('click', (event) => {
            console.log('Clicked on person:', person.name, person.id); // Log pour vérifier le clic et l'ID

            event.stopPropagation();
            showPersonActions(person, event);
        });

        list.appendChild(personDiv);
    });



    content.appendChild(closeBtn);
    content.appendChild(title);
    content.appendChild(list);
    modal.appendChild(content);
    document.body.appendChild(modal);


    // Gestion de la touche Échap
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);

}

function showPersonActions(person, event) {
    console.log('Showing actions for:', person.name, person.id); // Log pour vérifier l'appel de la fonction

    // Supprimer tout menu contextuel existant
    const existingMenu = document.getElementById('person-actions-menu');
    if (existingMenu) {
        existingMenu.remove();
    }

    const actionsMenu = document.createElement('div');
    actionsMenu.id = 'person-actions-menu';
    actionsMenu.style.position = 'fixed'; // Changé de 'absolute' à 'fixed'
    actionsMenu.style.left = `${event.clientX}px`;
    actionsMenu.style.top = `${event.clientY}px`;
    actionsMenu.style.backgroundColor = 'white';
    actionsMenu.style.border = '1px solid #ccc';
    actionsMenu.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    actionsMenu.style.zIndex = '10000'; // Augmenté pour s'assurer qu'il est au-dessus des autres éléments

    const actions = [
        { text: "Voir dans l'arbre", action: () => showInTree(person.id) },
        { text: "Voir la fiche", action: () => showPersonDetails(person.id) },
        { text: "Animation", action: () => startAnimation(person.id) }
    ];

    actions.forEach(action => {
        const actionButton = document.createElement('button');
        actionButton.textContent = action.text;
        actionButton.style.display = 'block';
        actionButton.style.width = '100%';
        actionButton.style.padding = '5px 10px';
        actionButton.style.border = 'none';
        actionButton.style.backgroundColor = 'transparent';
        actionButton.style.textAlign = 'left';
        actionButton.style.cursor = 'pointer';

        actionButton.addEventListener('mouseenter', () => {
            actionButton.style.backgroundColor = '#f0f0f0';
        });

        actionButton.addEventListener('mouseleave', () => {
            actionButton.style.backgroundColor = 'transparent';
        });


        actionButton.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Fermer le menu contextuel
            actionsMenu.remove();

            // Simuler un clic sur le bouton de fermeture de la modale de liste
            const closeButton = document.getElementById('person-list-close-button');
            if (closeButton) {
                closeButton.click();
            } else {
                console.log("Bouton de fermeture de la liste non trouvé");
            }

            // Exécuter l'action après un court délai
            setTimeout(() => {
                action.action();
            }, 100);
        });


        actionsMenu.appendChild(actionButton);
    });

    document.body.appendChild(actionsMenu);

    // Fermer le menu si on clique ailleurs
    document.addEventListener('click', function closeMenu(e) {
        const menu = document.getElementById('person-actions-menu');
        if (menu && !menu.contains(e.target)) {
            if (menu.parentNode) {
                menu.parentNode.removeChild(menu);
            }
            document.removeEventListener('click', closeMenu);
        }
    });
}

function showInTree(personId) {
    // Appeler la fonction pour afficher l'arbre en mode ascendant avec cette personne comme racine
    state.rootPersonId = personId;
    state.treeMode = 'ancestors';
    console.log('Showing in tree:', personId); // Log pour vérifier l'appel de la fonction
    drawTree();
}

function showPersonDetails(personId) {
    // Appeler la fonction pour afficher la fenêtre modale des détails
    console.log('Showing details for:', personId); // Log pour vérifier l'appel de la fonction


    displayPersonDetails(personId);

    const modal = document.querySelector('.modal-container');
    if (modal) {
        modal.remove();
    }

}

function startAnimation(personId) {
    // Appeler la fonction pour lancer l'animation avec cette personne comme racine
    state.rootPersonId = personId;
    console.log('Starting animation with:', personId); // Log pour vérifier l'appel de la fonction
    startAncestorAnimation();
    // Fermez la fenêtre modale si elle est encore ouverte
    const modal = document.querySelector('.modal-container');
    if (modal) {
        modal.remove();
    }

}

const createColorPalette = () => [
    '#1E88E5', // bleu vif
    '#E53935', // rouge vif
    '#43A047', // vert vif
    '#FB8C00', // orange vif
    '#8E24AA', // violet vif
    '#00ACC1', // cyan vif
    '#FFB300', // jaune vif
    '#3949AB', // indigo vif
    '#00897B', // turquoise vif
    '#7CB342'  // vert lime vif
];

// const createFontScale = (nameData) => {
//     return d3.scaleLog()
//         .domain([1, d3.max(nameData, d => d.size)])
//         .range([10, 45])
//         .clamp(true);
// };



const createFontScale = (nameData) => {
    // Obtenir les statistiques des données
    const wordCount = nameData.length;
    const maxCount = d3.max(nameData, d => d.size) || 1;
    const minCount = d3.min(nameData, d => d.size) || 1;
    
    // Déterminer le type d'échelle à utiliser en fonction de la distribution
    let scale;
    
    // Si toutes les valeurs sont identiques ou presque, utiliser une échelle linéaire
    // if (maxCount <= 2 || maxCount - minCount <= 2) {
    if(wordCount < 70) {
        // Pour les collections avec peu de variation, définir des tailles plus uniformes
        // const minFontSize = wordCount < 20 ? 22 : 14;
        // const maxFontSize = wordCount < 20 ? 38 : 30;

        const minFontSize = ((wordCount < 20) && !mobilePhone) ? 62 : wordCount < 60 ? 20 : 14;
        const maxFontSize = ((wordCount < 20) && !mobilePhone) ? 88 :  wordCount < 60 ? 48 : 30;
        

        scale = d3.scaleLinear()
            .domain([minCount, maxCount])
            .range([minFontSize, maxFontSize]);

        // console.log("debug font linear ", minFontSize, maxFontSize, scale, scale.clamp(true))
    } else {
        // Pour les collections avec plus de variation, ajuster l'échelle logarithmique
        // const sizeFactor = Math.min(SVG_width / 800, SVG_height / 600);
        // const minFontSize = Math.max(16, 10 * sizeFactor); // Augmenter la taille minimale
        // const maxFontSize = Math.min(70, 45 * sizeFactor * (wordCount < 20 ? 1.5 : 1));
        
        // scale = d3.scalePow()
        //     .exponent(0.5) // Utiliser une échelle de puissance avec exposant 0.5 (racine carrée)
        //     .domain([minCount, maxCount])
        //     .range([minFontSize, maxFontSize]);
       
        if (!mobilePhone) {
            scale = d3.scaleLog()
                .domain([1, d3.max(nameData, d => d.size)])
                .range([10, 45])
        } else {
            scale = d3.scaleLog()
                .domain([1, d3.max(nameData, d => d.size)])
                .range([5, 22])
        }

        
        // console.log("debug font log ", minFontSize, maxFontSize, scale, scale.clamp(true))
    }
    


    return scale.clamp(true);
};







// Variable globale pour les offsets
let horizontalOffset = 0;
let verticalOffset = 0;

let containerHorizontalOffset = 0;
let containerVerticalOffset = 0;




let resizeTimer;
let isResizing = false;

function setupResizeListeners() {
    ['orientationchange', 'resize'].forEach(event => {
        window.addEventListener(event, function() {
            // Annuler tout timer précédent
            clearTimeout(resizeTimer);
            
            // Première étape: centrage rapide immédiat (sans écran noir)
            handleQuickResize();
            
            // Montrer un indicateur de chargement si ce n'est pas déjà fait
            if (!isResizing) {
                isResizing = true;
                if (typeof showToast === 'function') {
                    showToast("Optimisation en cours...", 2000);
                }
            }
            
            // Deuxième étape: planifier le redimensionnement complet après un court délai
            resizeTimer = setTimeout(() => {
                // Utiliser requestAnimationFrame pour s'assurer que le navigateur est prêt
                requestAnimationFrame(() => {
                    handleCompleteResize();
                    isResizing = false;
                });
            }, 300); // Délai avant le redimensionnement complet
        });
    });
}

// Fonction pour un simple repositionnement (ultra rapide)
function handleQuickResize() {
    const svgElement = document.getElementById('name-cloud-svg');
    if (!svgElement) return;
    
    // Centrer le conteneur
    centerCloudNameContainer();
    
    // Mettre à jour le titre si disponible
    if (titleElement) {
        updateTitleText(titleElement, currentConfig);
    }
    
    console.log("Ajustement rapide effectué");
}

// Fonction pour un relayout complet (plus lent mais meilleur résultat)
function handleCompleteResize() {
    const svgElement = document.getElementById('name-cloud-svg');
    const modalContainer = document.querySelector('.modal-container');
    
    if (!svgElement || !modalContainer || !currentNameData || !currentConfig) {
        // handleQuickResize();
        return;
    }
    
    // Obtenir les dimensions actuelles et les nouvelles
    const oldWidth = SVG_width;
    const oldHeight = SVG_height;
    
    // Adapter les dimensions du SVG
    const newScreenW = window.innerWidth;
    const newScreenH = window.innerHeight;

    // Déterminer les nouvelles dimensions du SVG
    let newWidth = SVG_width;
    let newHeight = SVG_height;
    
    // Logique pour déterminer les dimensions
    newWidth = newScreenW;
    newHeight = newScreenH;

    // for mobile phone
    mobilePhone = false;
    if (Math.min(window.innerWidth, window.innerHeight) < 400 ) mobilePhone = 1;
    else if (Math.min(window.innerWidth, window.innerHeight) < 600 ) mobilePhone = 2;

    if (mobilePhone)
        { newWidth = newScreenW + 50; newHeight = newScreenH + 50; }


   // Mettre à jour les variables globales pour cohérence
    SVG_width = newWidth;
    SVG_height = newHeight;


    // Nettoyer le SVG existant
    d3.select('#name-cloud-svg').selectAll('*').remove();
    
    // Recréer le SVG avec les nouvelles dimensions
    const svg = d3.select('#name-cloud-svg')
        .attr('width', SVG_width)
        .attr('height', SVG_height);
        
    // Rectangle de fond
    svg.append('rect')
        .attr('width', SVG_width)
        .attr('height', SVG_height)
        .attr('fill', 'transparent')
        .style('touch-action', 'pan-x pan-y pinch-zoom')
        .lower();
        
    // Configurer le zoom et créer le nouveau textGroup
    const { zoom, textGroup } = setupZoom(svg, SVG_width, SVG_height);
    
    // Recalculer les échelles pour les nouvelles dimensions
    const fontScale = createFontScale(currentNameData);
    const colorPalette = createColorPalette();
    const color = d3.scaleOrdinal(colorPalette);
    
    // Relancer uniquement le layout pour repositionner les mots
    const layout = d3.layout.cloud()
        .size([SVG_width - 20, SVG_height - 20])
        .words(currentNameData.map(d => ({
            text: d.text,
            size: fontScale(d.size),
            originalSize: d.size
        })))
        // .padding(1)
        .padding(mobilePhone ? 0.5 : 1) // Réduire le padding sur mobile
        .rotate(0)
        .fontSize(d => d.size)
        .spiral('rectangular')
        .random(() => 0.5)
        .canvas(function() {
            const canvas = document.createElement('canvas');
            canvas.setAttribute('willReadFrequently', 'true');
            return canvas;
        })
        .on('end', words => {
            // Redessiner le nuage avec les mots repositionnés
            drawNameCloud(svg, textGroup, words, color, currentConfig);
        });
        
    layout.start();
    
    // Ajuster les offsets pour le centrage
    centerCloudNameContainer();
    if (titleElement) {
        // Mettre à jour le titre avec les statistiques
        updateTitleText(titleElement, currentConfig);
    }

}



















const setupZoom = (svg, width, height) => {
    // Dimensions de l'écran
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    
    // Dimensions de la map (SVG)
    const mapW = width;
    const mapH = height;
    
    // console.log("setupZoom DEBUG screen size =", screenW, 'x', screenH, ", map size = ", mapW, "x", mapH, " offsets =", containerHorizontalOffset, containerVerticalOffset, horizontalOffset, verticalOffset);
    
    const textGroup = svg.append('g')
        .attr('class', 'name-cloud-container') // Ajouter une classe pour faciliter la sélection
        .attr('transform', `translate(${width / 2 },${height / 2 })`);
    
    const zoom = d3.zoom()
        .scaleExtent([0.5, 5])
        .translateExtent([[-width, -height], [2 * width, 2 * height]])
        .on('zoom', (event) => {
            textGroup.attr('transform', event.transform);
        });
    
    // Initialiser la transformation de zoom pour éviter le déplacement brusque
    const initialTransform = d3.zoomIdentity
        .translate(width / 2 , height / 2 )
        .scale(1);
    
    svg.call(zoom.transform, initialTransform);
    
    // Appliquer le zoom et ajouter les événements
    svg.call(zoom)
       .on('wheel', (event) => event.preventDefault(), { passive: false })
       .on('touchstart', (event) => {
           if (event.touches.length > 1) {
               event.preventDefault();
           }
       }, { passive: false })
       .on('touchmove', (event) => {
           if (event.touches.length > 1) {
               event.preventDefault();
           }
       }, { passive: false });
    
    return { zoom, textGroup };
};



const NameCloud = ({ nameData, config }) => {
    React.useEffect(() => {
        if (!nameData || nameData.length === 0) return;

        d3.select('#name-cloud-svg').selectAll('*').remove();

        const width = SVG_width;
        const height = SVG_height;

        const svg = d3.select('#name-cloud-svg')
            .attr('width', width)
            .attr('height', height);

        // Rectangle de fond transparent
        svg.append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'transparent')
            .style('touch-action', 'pan-x pan-y pinch-zoom')
            .lower();

        // Configurer le zoom et créer le textGroup
        const { zoom, textGroup } = setupZoom(svg, width, height);

        // Activer les événements de zoom
        svg.call(zoom)
           .on('wheel', (event) => event.preventDefault(), { passive: false })
           .on('touchstart', (event) => {
               if (event.touches.length > 1) {
                   event.preventDefault();
               }
           }, { passive: false })
           .on('touchmove', (event) => {
               if (event.touches.length > 1) {
                   event.preventDefault();
               }
           }, { passive: false });

        const fontScale = createFontScale(nameData);
        const colorPalette = createColorPalette();
        const color = d3.scaleOrdinal(colorPalette);

        const layout = d3.layout.cloud()
            .size([width - 20, height - 20])
            .words(nameData.map(d => ({
                text: d.text,
                size: fontScale(d.size),
                originalSize: d.size
            })))
            // .padding(1)
            .padding(mobilePhone ? 0.5 : 1) // Réduire le padding sur mobile
            .rotate(0)
            .fontSize(d => d.size)
            .spiral('rectangular')
            .random(() => 0.5)
            .canvas(function() {
                const canvas = document.createElement('canvas');
                canvas.setAttribute('willReadFrequently', 'true');
                return canvas;
            })
            .on('end', words => {

                totalWords = nameData.length;
                placedWords = words.length;
                const percentPlaced = Math.round((placedWords / totalWords) * 100);
                
                console.log(`Mots placés: ${placedWords}/${totalWords} (${percentPlaced}%)`);
                


                // Calculer la boîte englobante de tous les mots
                const bbox = words.reduce((acc, word) => {
                    if (!acc) return { 
                        minX: word.x - word.width/2, 
                        maxX: word.x + word.width/2, 
                        minY: word.y - word.height/2, 
                        maxY: word.y + word.height/2 
                    };
                    
                    return {
                        minX: Math.min(acc.minX, word.x - word.width/2),
                        maxX: Math.max(acc.maxX, word.x + word.width/2),
                        minY: Math.min(acc.minY, word.y - word.height/2),
                        maxY: Math.max(acc.maxY, word.y + word.height/2)
                    };
                }, null);

                if (bbox) {
                    const bboxWidth = bbox.maxX - bbox.minX;
                    const bboxHeight = bbox.maxY - bbox.minY;
                    // const centerX = width / 2 - (bbox.minX + bboxWidth/2);
                    // const centerY = height / 2 - (bbox.minY + bboxHeight/2);
                    const centerX = width / 2 - (bbox.minX + bboxWidth/2) + horizontalOffset;
                    const centerY = height / 2 - (bbox.minY + bboxHeight/2) + verticalOffset;

                    // Ajuster la transformation du groupe de texte pour centrer
                    textGroup.attr('transform', `translate(${centerX}, ${centerY})`);
                }



                drawNameCloud(svg, textGroup, words, color, config);

                // Mettre à jour le titre avec les statistiques de placement
                const titleElement = document.getElementById('name-cloud-title');
                if (titleElement) {
                    // Mettre à jour le titre avec les statistiques
                    updateTitleText(titleElement, config);
                }



            });

        layout.start();

    }, [nameData]);

    return React.createElement('div', { 
        className: 'bg-white p-4 rounded-lg shadow-lg',
        style: { 
            touchAction: 'pan-x pan-y pinch-zoom',
            userSelect: 'none'
        }
    },
        React.createElement('div', { 
            className: 'relative w-full ',
            style: { 
                touchAction: 'pan-x pan-y pinch-zoom',
                userSelect: 'none'
            }
        },
            React.createElement('svg', {
                id: 'name-cloud-svg',
                className: 'w-full h-full',
                style: { 
                    backgroundColor: '#f7fafc',
                    touchAction: 'pan-x pan-y pinch-zoom',
                    userSelect: 'none'
                }
            })

        )
    );
};

export default NameCloud;


function drawNameCloud(svg, textGroup, words, color, config) {
    // Trier les mots par taille (les plus grands en premier)
    const sortedWords = words.sort((a, b) => b.size - a.size);
    
    const texts = textGroup.selectAll('text')
        .data(sortedWords)
        .join('text')
        .attr('class', 'name-text')
        .style('font-size', d => `${d.size}px`)
        .style('font-family', 'Arial')
        .style('font-weight', 'bold')
        .style('fill', (d, i) => color(i % color.range().length))
        .attr('transform', d => `translate(${d.x},${d.y})`)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('cursor', 'pointer')
        .text(d => d.text);

    // D'abord définir la fonction de calcul des dimensions
    const getClickDimensions = (d) => {
        const clickWidth = d.size > 30 ? d.width/4 : d.width/2;
        const clickHeight = d.size > 30 ? d.height/8 : (d.size > 15 ? d.height/4: d.height/2);
        return {
            width: clickWidth,
            height: clickHeight,
        };
    };            

    // Ajouter des zones de clic transparentes
    const clickAreas = textGroup.selectAll('rect.click-area')
        .data(sortedWords)
        .join('rect')
        .attr('class', 'click-area')
        .attr('x', d => d.x - getClickDimensions(d).width/2)
        .attr('y', d => d.y - getClickDimensions(d).height/2)
        .attr('width', d => getClickDimensions(d).width)
        .attr('height', d => getClickDimensions(d).height)
        .style('fill', 'transparent')
        .style('cursor', 'pointer');

    const textProperties = new Map();
    texts.each(function(d) {
        textProperties.set(d.text, {
            fill: color(words.indexOf(d) % color.range().length),
            size: d.size
        });
    });

    let activeTemp = null;


    function handleClick(d) {
        if (!state.gedcomData) return;
        
        const persons = getPersonsFromTree(config.scope, config.rootPersonId);
    
        const people = Object.values(state.gedcomData.individuals)
            .filter(p => {
                let matches = false;
                
                if (config.type === 'prenoms') {
                    const firstName = p.name.split('/')[0].trim();
                    matches = firstName.split(' ').some(name => 
                        name.toLowerCase() === d.text.toLowerCase() || 
                        name.toLowerCase().startsWith(d.text.toLowerCase() + ' ')
                    );
                } else if (config.type === 'noms') {
                    matches = (p.name.split('/')[1] && p.name.split('/')[1].toLowerCase().trim() === d.text.toLowerCase());
                } else if (config.type === 'professions') {
                    const cleanedProfessions = cleanProfession(p.occupation);
                    matches = cleanedProfessions.includes(d.text.toLowerCase());
                } else if (config.type === 'age_procreation') {
                    if (p.birthDate) {
                        const parentBirthYear = extractYear(p.birthDate);
                        
                        // Pour chaque mariage
                        if (p.spouseFamilies) {
                            p.spouseFamilies.forEach(familyId => {
                                const family = state.gedcomData.families[familyId];
                                if (family && family.children) {
                                    family.children.forEach(childId => {
                                        const child = state.gedcomData.individuals[childId];
                                        if (child && child.birthDate) {
                                            const childBirthYear = extractYear(child.birthDate);
                                            if (childBirthYear > parentBirthYear) {
                                                const ageAtChildBirth = childBirthYear - parentBirthYear;
                                                if (ageAtChildBirth.toString() === d.text) {
                                                    matches = true;
                                                    p.date = `Parent né(e) en ${p.birthDate}, enfant: ${child.name.replace(/\//g, '')} né(e) en ${child.birthDate}`;
                                                }
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    }
                } else if (config.type === 'duree_vie') {
                    // Calcul de la durée de vie
                    if (p.birthDate && p.deathDate) {
                        const birthYear = extractYear(p.birthDate);
                        const deathYear = extractYear(p.deathDate);
                        
                        // Vérifier que la personne a vécu pendant la période sélectionnée
                        const startYear = Math.min(config.startDate, config.endDate);
                        const endYear = Math.max(config.startDate, config.endDate);
                        
                        if (birthYear <= endYear && deathYear >= startYear) {
                            const age = deathYear - birthYear;
                            matches = age.toString() === d.text;
                        }
                    }
                } else if (config.type === 'lieux') {
                    const personLocations = [
                        p.birthPlace, 
                        p.deathPlace, 
                        p.marriagePlace, 
                        p.residPlace1, 
                        p.residPlace2, 
                        p.residPlace3
                    ];
                    
                    matches = personLocations.some(location => {
                        const cleanedLocation = cleanLocation(location);
                        return cleanedLocation === d.text;
                    });
                }   

                // Vérifier si la personne est dans l'arbre approprié selon le scope
                const isInTree = 
                    config.scope === 'all' || 
                    (config.scope === 'descendants' && persons.some(descendant => descendant.id === p.id)) ||
                    (config.scope === 'ancestors' && persons.some(ancestor => ancestor.id === p.id));

                return matches && isInTree && hasDateInRange(p, config);



            })
            .map(p => ({
                name: p.name.replace(/\//g, ''),
                id: p.id,
                occupation: p.occupation || 'Non spécifiée' // Utiliser 'Non spécifiée' si l'occupation n'est pas définie
            }));
        
        showPersonsList(d.text, people, config);
    }


function createTempText(originalElement, d, props) {
    // Détecter si on est en mode zoomé
    const currentTransform = d3.zoomTransform(svg.node());
    const isZoomed = currentTransform.k !== 1;

    if (activeTemp) {
        activeTemp.remove();
        d3.selectAll('.name-text').style('opacity', 1);
    }

    let tempGroup, tempText;

    if (isZoomed) {
        // Récupérer les coordonnées de l'élément original
        const originalTransform = d3.select(originalElement).attr('transform');
        const coords = originalTransform.match(/translate\(([^,]+),([^)]+)\)/);

        if (!coords) return null;

        const x = parseFloat(coords[1]);
        const y = parseFloat(coords[2]);

        // Utiliser les coordonnées transformées par le zoom
        const transformedX = currentTransform.x + x * currentTransform.k;
        const transformedY = currentTransform.y + y * currentTransform.k;

        tempGroup = svg.append('g')
            .attr('transform', `translate(${transformedX}, ${transformedY}) scale(${currentTransform.k})`);

        tempText = tempGroup.append('text')
            .attr('class', 'temp-text')
            .style('font-size', `${props.size * 1.2}px`)
            .style('font-family', 'Arial')
            .style('font-weight', 'bold')
            .style('fill', '#e53e3e')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .style('cursor', 'pointer')
            .text(d.text);

        d3.select(originalElement)
            .style('font-size', `${props.size * 1.2}px`)
            .style('fill', '#e53e3e');
    } else {
        // Mode non-zoomé
        d3.select(originalElement).style('opacity', 0);

        // Récupérer les coordonnées exactes du mot original
        const originalTransform = d3.select(originalElement).attr('transform');
        const coords = originalTransform.match(/translate\(([^,]+),([^)]+)\)/);
        
        if (coords) {
            // Si on peut extraire les coordonnées, les utiliser directement
            const x = parseFloat(coords[1]);
            const y = parseFloat(coords[2]);
            
            tempGroup = svg.append('g')
                .attr('transform', `translate(${svg.attr('width') / 2 + horizontalOffset}, ${svg.attr('height') / 2 + verticalOffset})`);
                
            tempText = tempGroup.append('text')
                .attr('class', 'temp-text')
                .style('font-size', `${props.size * 1.2}px`)
                .style('font-family', 'Arial')
                .style('font-weight', 'bold')
                .style('fill', '#e53e3e')
                .attr('transform', `translate(${x}, ${y})`) // Utiliser les coordonnées exactes
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .style('cursor', 'pointer')
                .text(d.text);
        } else {
            // Fallback: utiliser la transformation originale
            tempGroup = svg.append('g')
                .attr('transform', `translate(${svg.attr('width') / 2 + horizontalOffset}, ${svg.attr('height') / 2 + verticalOffset})`);
                
            tempText = tempGroup.append('text')
                .attr('class', 'temp-text')
                .style('font-size', `${props.size * 1.2}px`)
                .style('font-family', 'Arial')
                .style('font-weight', 'bold')
                .style('fill', '#e53e3e')
                .attr('transform', originalTransform)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .style('cursor', 'pointer')
                .text(d.text);
        }
    }

    tempText
        .on('click', () => handleClick(d))
        .on('mouseout', () => {
            tempGroup.remove();
            d3.select(originalElement).style('opacity', 1);
            if (isZoomed) {
                d3.select(originalElement)
                    .style('font-size', `${props.size}px`)
                    .style('fill', props.fill);
            }
            activeTemp = null;
        });

    activeTemp = tempGroup;
    return tempGroup;
}





clickAreas
    .on('mouseover', function(event, d) {
        const props = textProperties.get(d.text);
        if (!props) return;
        const correspondingText = texts.filter(function(t) { 
            return t.text === d.text; 
        }).node();
        createTempText(correspondingText, d, props);
    })
    .on('click', function(event, d) {
        handleClick(d);
    });




    
    texts.append('title')
        .text(d => `${d.text}: ${d.originalSize} occurrences`);
}


function extractYear(dateString) {
    if (!dateString) return '0';
    // console.log('in extractYear, dateString', dateString);

    // Test spécifique pour les entiers seuls (1, 12, 123, 1234, -50, etc.)
    if (/^-?\d+$/.test(dateString)) {
        return parseInt(dateString);
    }
    
    const parts = dateString.split(' ');
    
    // Chercher un nombre à 4 chiffres, sans restriction
    const yearMatch = dateString.match(/\b(\d{4})\b/);
    
    if (yearMatch) {
        const year = parseInt(yearMatch[1]);
        return year;
    }
    
    // Fallback sur la méthode originale si pas de match
    const year = parts[parts.length - 1];
    return parseInt(year) || '0';
}

function hasDateInRange(person, config) {
    const isValidYear = (year) => {
        const numYear = typeof year === 'string' ? parseInt(year) : year;
        return !isNaN(numYear) && 
               numYear !== 0;
    };

    const isYearIntarget = (year) => {
        const numYear = typeof year === 'string' ? parseInt(year) : year;
        return !isNaN(numYear) && 
               numYear !== 0 && 
               numYear >= Math.min(config.startDate, config.endDate) && 
               numYear <= Math.max(config.startDate, config.endDate);
    };



    // Vérifier dates directes
    if (person.birthDate && isYearIntarget(extractYear(person.birthDate))) {
        stats.directDates.birth++;
        stats.directDates.people.add(person.id);
        return true;
    }
    if (person.deathDate && isYearIntarget(extractYear(person.deathDate))) {
        stats.directDates.death++;
        stats.directDates.people.add(person.id);
        if (person.birthDate && isValidYear(extractYear(person.birthDate)))
            return false;
        else
            return true;
    }

    // Vérifier mariages
    if (person.spouseFamilies) {
        for (const famId of person.spouseFamilies) {
            const family = state.gedcomData.families[famId];
            if (family && family.marriageDate && isYearIntarget(extractYear(family.marriageDate))) {
                stats.directDates.marriage++;
                stats.directDates.people.add(person.id);
                return true;
            }
        }
    }

    // Chercher dans les ancêtres/descendants si pas de date directe
    const dateInfo = findDateForPerson(person.id);
    if (dateInfo && isYearIntarget(dateInfo.year)) {
        return true;
    }

    // Si aucune date trouvée, ajouter aux stats noDates
    stats.noDates.push({
        id: person.id,
        name: person.name.replace(/\//g, '')
    });

    return false;
}

const excludedSurNames = new Set([
    'XXX', 'N.', '1er', 'I', 'II', 'III', 'IV', 'V', 'VI', 
    'le', 'Le', 'LA', 'La', "La",'LE', 'au', 'Au', 'ou', 'Ou','de', 'De', 'Ne', 'Nn', 'ou',"D'" ,"d'", 'St', 'ou', 'Ép', 'Sa',
    'Ho', 'Femme', 'Nc', 'Ap', 'Dit', 'Dite', 'Ker', 'Sap', 
    'Anonyme', 'Inconnu', 'Inconnue', 'duménil', 'Duménil', 'Dumenil', 
    'Main', "Sans", "Nom", 'nom', 'Dieppois', 'Blanc', 'Prophetesse', 'Mer', 'Grand', 'grand', 'Saint', 'saint', 'Confesseur',
    'i', 'Ii', 'iII', 'Ier', '1er', '1ère'
]);

// Fonction de nettoyage d'un prénom
function cleanSurName(name) {
    // Supprimer les caractères spéciaux et nettoyer les espaces
    return name
        .replace(/[(),\.]/g, '') // Supprimer parenthèses, virgules, points
        .replace(/\s+/g, ' ')    // Normaliser les espaces
        .trim();                 // Supprimer les espaces début/fin
}

// Fonction pour vérifier si un prénom est valide
function isValidSurName(name) {
    // Le prénom doit :
    // - Ne pas être dans la liste d'exclusion
    // - Avoir au moins 2 caractères
    // - Ne pas contenir que des chiffres romains
    // - Ne pas être composé uniquement de chiffres
    // - Ne pas être composé uniquement de caractères spéciaux
    return !excludedSurNames.has(name) &&
            name.length >= 2 &&
            !/^[IVXLCDM]+$/i.test(name) &&
            !/^\d+$/.test(name) &&
            /[a-zA-Z]/.test(name);
}

// Liste des mots à exclure pour les noms de famille
const excludedFamilyNames = new Set([
    '? Xx?', '? ? XX?', 'Nc'
]);

// Fonction de nettoyage d'un nom de famille
function cleanFamilyName(name) {
    return name
        .replace(/[(),\.]/g, '') // Supprimer parenthèses, virgules, points
        .replace(/\s+/g, ' ')    // Normaliser les espaces
        .trim();                 // Supprimer les espaces début/fin
}

// Fonction pour vérifier si un nom de famille est valide
function isValidFamilyName(name) {
    return !excludedFamilyNames.has(name) &&
           name.length >= 2 &&
           !/^[IVXLCDM]+$/i.test(name) &&
           !/^\d+$/.test(name) &&
           /[a-zA-Z]/.test(name);
}

function cleanProfession(profession) {
    if (!profession) return [];
    
    // Diviser la chaîne par les virgules et nettoyer chaque partie
    const professions = profession.split(',')
        // .map(p => p.trim().toLowerCase().replace(/[^a-zà-ÿ\s-]/gi, '').replace(/\s+/g, ' '))
        .map(p => p.trim().toLowerCase().replace(/[^a-zà-ÿ\s'-]/gi, '').replace(/\s+/g, ' '))
        .filter(p => p.length > 0); // Filtrer les chaînes vides
    
    // Retourner jusqu'à trois professions uniques
    return [...new Set(professions)].slice(0, 10);
}

// Liste des lieux à exclure
const excludedLocations = new Set([
    '?', 
    'inconnu', 
    'unknown', 
    'nc', 
    'n.c', 
    'non communiqué', 
    'non spécifié',
    'non renseigné'
]);
// fonction de nettoyage des lieux
function cleanLocation(location) {
    if (!location) return '';
    
    // Convertir en minuscules et supprimer les espaces supplémentaires
    location = location.toLowerCase().trim();
    
    // Supprimer les guillemets
    location = location.replace(/"/g, '');

    // Vérifier si le lieu est dans la liste d'exclusion
    if (excludedLocations.has(location)) return '';
    
    // Supprimer les parenthèses et les chiffres
    location = location.replace(/\(.*?\)/g, '').replace(/\d+/g, '');
    
    // Prendre la partie avant la virgule
    location = location.split(',')[0];
    
    // Diviser en mots et garder les 3 premiers
    const words = location.trim().split(/\s+/)
        .slice(0, 4)
        .filter(word => !excludedLocations.has(word));
    
    // Capitaliser le premier mot
    if (words.length > 0) {
        words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    }
    
    return words.join(' ').trim();
}

// Fonction pour capitaliser un prénom
function capitalizeName(name) {
    return name
        .split('-')  // Gérer les prénoms composés avec tiret
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join('-');
}

function formatFamilyName(familyName) {
    // Vérifier si le nom est vide ou non défini
    if (!familyName) return '';

    // Diviser le nom en mots
    const words = familyName.trim()
        .split(' ')
        .slice(0, 3)  // Limiter à 3 mots
        .map(word => {
            // Mettre le mot en minuscules
            const lowercaseWord = word.toLowerCase();
            // Mettre la première lettre en majuscule
            return lowercaseWord.charAt(0).toUpperCase() + lowercaseWord.slice(1);
        });

    // Rejoindre les mots
    return words.join(' ');
}

function getPersonsFromTree(mode, rootPersonId = null) {
    // Sauvegarder la valeur initiale des générations
    const initialGenerations = state.nombre_generation;
    
    try {
        // Forcer le nombre de générations à 100 pour explorer tout l'arbre
        state.nombre_generation = 100;
        
        const persons = [];
        const processedIds = new Set();

        function addPersonAndDescendants(personId, depth = 0) {
            if (processedIds.has(personId) || depth > state.nombre_generation) return;
            processedIds.add(personId);

            const person = state.gedcomData.individuals[personId];
            if (person) persons.push(person);

            if (mode === 'descendants') {
                // Utiliser buildDescendantTree pour trouver les descendants
                const tree = buildDescendantTree(personId, new Set(), depth);
                if (tree && tree.children) {
                    tree.children.forEach(child => {
                        // Filtrer uniquement les vrais descendants (pas les conjoints)
                        if (child.id && !child.isSpouse) {
                            addPersonAndDescendants(child.id, depth + 1);
                        }
                    });
                }
            } else if (mode === 'ancestors') {
                // Utiliser buildAncestorTree pour trouver les ancêtres
                const tree = buildAncestorTree(personId, new Set(), depth);
                if (tree && tree.children) {
                    tree.children.forEach(parent => {
                        if (parent.id) addPersonAndDescendants(parent.id, depth + 1);
                    });
                }
            }
        }

        if (mode === 'all') {
            // Utiliser tous les individus du fichier
            return Object.values(state.gedcomData.individuals);
        } else if (rootPersonId) {
            addPersonAndDescendants(rootPersonId);
        }

        return persons;
    } finally {
        // Toujours rétablir le nombre de générations initial
        state.nombre_generation = initialGenerations;
    }
}

function createDateInput(label, defaultValue, width = '55px') {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    
    const labelElement = document.createElement('div');
    labelElement.innerHTML = label;
    labelElement.style.fontSize = '12px';
    labelElement.style.marginBottom = '3px';

    const input = document.createElement('input');
    input.type = 'number';
    input.style.width = '57px'; //width;
    input.style.padding = '0px';
    input.style.height = '25px'; // Ajouter une hauteur fixe
    input.value = defaultValue;
    input.step = '100'; // Définit l'incrément à 100

    // Gérer l'incrément/décrément manuel
    input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            const currentValue = parseInt(input.value) || 0;
            const newValue = e.key === 'ArrowUp' ? currentValue + 100 : currentValue - 100;
            input.value = newValue;
        }
    });

    container.appendChild(labelElement);
    container.appendChild(input);

    return { container, input };
}

function createRootPersonSelect() {
    const rootPersonSelect = document.createElement('select');
    rootPersonSelect.style.padding = '5px';
    rootPersonSelect.style.width = '100%';
    rootPersonSelect.style.display = 'none';

    const rootPersons = Object.values(state.gedcomData.individuals);
    rootPersons.sort((a, b) => a.name.localeCompare(b.name));
    rootPersons.forEach(person => {
        const option = document.createElement('option');
        option.value = person.id;
        option.textContent = person.name.replace(/\//g, '').trim();
        rootPersonSelect.appendChild(option);
    });

    // Initialiser avec la personne racine actuelle si elle existe
    if (state.rootPersonId) {
        rootPersonSelect.value = state.rootPersonId;
    }

    return rootPersonSelect;
}

function createRootPersonSearchContainer(rootPersonSelect, generateNameCloud) {
    const container = document.createElement('div');
    container.style.display = 'none'; // Caché par défaut
    container.style.position = 'relative';
    container.style.marginLeft = '-10px';
    container.style.display = 'flex';
    container.style.width = 'auto'; // Ajuster la largeur automatiquement
    container.style.alignSelf = 'flex-start'; // Aligner à gauche
    container.style.zIndex = '10'; // S'assurer qu'il ne recouvre pas le bouton de fermeture
    container.style.flexDirection = 'column';
    container.style.alignItems = 'flex-start';

    const label = document.createElement('label');
    label.textContent = 'Personne racine';
    label.style.fontSize = '12px';
    label.style.marginBottom = '3px';

    const searchWrapper = document.createElement('div');
    searchWrapper.style.display = 'flex';
    searchWrapper.style.gap = '5px';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Rechercher racine';
    searchInput.style.padding = '3px';
    searchInput.style.width = '120px';

    const searchButton = document.createElement('button');
    searchButton.textContent = '🔍';
    searchButton.style.padding = '3px 5px';

    const resultsSelect = document.createElement('select');
    resultsSelect.style.display = 'none';
    resultsSelect.style.position = 'absolute';
    resultsSelect.style.top = '100%';
    resultsSelect.style.left = '0';
    resultsSelect.style.width = '100%';
    resultsSelect.style.zIndex = '1000';

    searchWrapper.appendChild(searchInput);
    searchWrapper.appendChild(searchButton);

    container.appendChild(label);
    container.appendChild(searchWrapper);
    container.appendChild(resultsSelect);
    container.appendChild(rootPersonSelect);

    function normalizeString(str) {
        return str.toLowerCase()
            .replace(/[éèêë]/g, 'e')
            .replace(/[àâä]/g, 'a')
            .replace(/[îï]/g, 'i')
            .replace(/[ôö]/g, 'o')
            .replace(/[ûüù]/g, 'u')
            .replace(/ç/g, 'c');
    }
    

    function searchRootPerson() {
        const searchStr = normalizeString(searchInput.value);
        
        // Réinitialiser le sélecteur
        resultsSelect.innerHTML = '<option value="">Select</option>';
        resultsSelect.style.display = 'none';
        
        // Appliquer un style plus moderne au sélecteur
        resultsSelect.style.textAlign = 'left';
        resultsSelect.style.backgroundColor = '#4361ee'; // Bleu vif
        resultsSelect.style.color = 'white';
        resultsSelect.style.border = '1px solid #3f51b5';
        resultsSelect.style.borderRadius = '4px';
        resultsSelect.style.appearance = 'none'; // Supprime la flèche native
        resultsSelect.style.padding = '5px';
        resultsSelect.style.paddingLeft = '15px'; // Espace pour la flèche à gauche
        resultsSelect.style.cursor = 'pointer';
        resultsSelect.style.fontSize = '14px';
        resultsSelect.style.fontWeight = 'bold';
        resultsSelect.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
        
        // // Ajouter la flèche blanche à gauche
        // resultsSelect.style.backgroundImage = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'6\' height=\'6\' fill=\'white\'><polygon points=\'0,3 6,0 6,6\'/></svg>")';
        // resultsSelect.style.backgroundRepeat = 'no-repeat';
        // resultsSelect.style.backgroundPosition = 'left 5px center';

        // Ajouter la flèche blanche en haut à droite
        resultsSelect.style.backgroundImage = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'8\' height=\'8\' fill=\'white\'><polygon points=\'0,0 3,0 1.5,2\'/></svg>")';
        resultsSelect.style.backgroundRepeat = 'no-repeat';
        resultsSelect.style.backgroundPosition = 'top 0px left 5px'; // Positionner en haut à droite
        resultsSelect.style.paddingLeft = '0px'; // Espace pour la flèche






        // Style pour les options
        const selectId = `results-select-${Date.now()}`;
        resultsSelect.id = selectId;
        
        const style = document.createElement('style');
        style.textContent = `
            #${selectId} option {
                text-align: left;
                padding-left: 10px;
                background-color: #38b000; /* Vert pour les options */
                color: white;
            }
        `;
        document.head.appendChild(style);
    
        if (!searchStr) return;
    
        // Reste du code de recherche...
        const matchedPersons = Object.values(state.gedcomData.individuals)
            .filter(person => {
                const fullName = normalizeString(person.name.replace(/\//g, ''));
                return fullName.includes(searchStr);
            });
    
        if (matchedPersons.length > 0) {
            matchedPersons.forEach(person => {
                const option = document.createElement('option');
                option.value = person.id;
                option.textContent = person.name.replace(/\//g, '').trim();
                resultsSelect.appendChild(option);
            });
            
            resultsSelect.style.display = 'block';
            
            // Changer la couleur de base en orange vif
            resultsSelect.style.backgroundColor = '#FF6D00'; // Orange pétant
            resultsSelect.style.border = '1px solid #E65100'; // Orange foncé pour la bordure
            
            // Ajouter l'animation clignotante avec un contraste plus fort
            const animationId = `blink-animation-${Date.now()}`;
            const animationStyle = document.createElement('style');
            animationStyle.textContent = `
                @keyframes ${animationId} {
                    0% { background-color: #FF6D00; } /* Orange vif */
                    50% { background-color: #FFAB40; } /* Orange clair */
                    100% { background-color: #FF6D00; } /* Orange vif */
                }
                
                #${selectId}.blinking {
                    animation: ${animationId} 0.7s infinite;
                }
            `;
            document.head.appendChild(animationStyle);
            
            // Appliquer la classe d'animation
            resultsSelect.classList.add('blinking');
            
            // Conserver les événements de survol
            resultsSelect.addEventListener('mouseover', () => {
                resultsSelect.classList.remove('blinking');
                resultsSelect.style.backgroundColor = '#E65100'; // Orange foncé au survol
            });
            
            resultsSelect.addEventListener('mouseout', () => {
                resultsSelect.style.backgroundColor = '#FF6D00'; // Retour à l'orange vif
                resultsSelect.classList.add('blinking');
            });
        } else {
            alert('Aucune personne trouvée');
        }

    }




    searchButton.addEventListener('click', searchRootPerson);
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            searchRootPerson();
        }
    });

    resultsSelect.addEventListener('change', () => {
        const selectedPersonId = resultsSelect.value;
        if (selectedPersonId) {
            resultsSelect.style.animation = 'none';
            resultsSelect.style.backgroundColor = 'orange';
            rootPersonSelect.value = selectedPersonId;
            generateNameCloud();
        }
    });

    searchWrapper.appendChild(searchInput);
    searchWrapper.appendChild(searchButton);

    container.appendChild(label);
    container.appendChild(searchWrapper);
    container.appendChild(resultsSelect);
    container.appendChild(rootPersonSelect);

    return { container, rootPersonSelect };
}

function createTypeSelect(config) {
    // Créer le sélecteur
    const typeSelect = document.createElement('select');
    typeSelect.style.padding = '0px';
    typeSelect.style.minWidth = '10px';
    typeSelect.style.backgroundColor = '#4361ee';
    typeSelect.style.color = 'white';
    typeSelect.style.border = '1px solid #3f51b5';
    typeSelect.style.borderRadius = '3px';
    typeSelect.style.appearance = 'none'; // Supprime la flèche native
    typeSelect.style.cursor = 'pointer';
    typeSelect.style.fontSize = '14px';
    typeSelect.style.fontWeight = 'bold';
    typeSelect.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
    
    // Ajouter la flèche blanche en haut à droite
    typeSelect.style.backgroundImage = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'8\' height=\'8\' fill=\'white\'><polygon points=\'0,0 3,0 1.5,2\'/></svg>")';

    typeSelect.style.backgroundRepeat = 'no-repeat';
    typeSelect.style.backgroundPosition = 'top 0px right -13px'; // Positionner en haut à droite
    typeSelect.style.paddingRight = '0px'; // Espace pour la flèche
    
    // Options du sélecteur
    typeSelect.innerHTML = `
        <option value="prenoms">Prénom</option>
        <option value="noms">Nom</option>
        <option value="professions">Métier</option>
        <option value="duree_vie">Vie</option>
        <option value="age_procreation">Procréat</option>
        <option value="lieux">Lieux</option>                    
    `;
    typeSelect.value = config.type;
    
    // Événements de survol
    typeSelect.addEventListener('mouseover', () => {
        typeSelect.style.backgroundColor = '#3a56e8';
    });
    typeSelect.addEventListener('mouseout', () => {
        typeSelect.style.backgroundColor = '#4361ee';
    });
    
    // Style pour les options
    const style = document.createElement('style');
    style.textContent = `
        #type-select-${Date.now()} option {
            background-color: #38b000;
            color: white;
        }
    `;
    document.head.appendChild(style);
    typeSelect.id = `type-select-${Date.now()}`;
    
    return typeSelect;
}




function createScopeSelect(config) {
    const scopeSelect = document.createElement('select');
    scopeSelect.style.padding = '0px';
    scopeSelect.style.minWidth = '10px';
    scopeSelect.style.backgroundColor = '#38b000'; // Vert
    scopeSelect.style.color = 'white';
    scopeSelect.style.border = '1px solid #2d8600';
    scopeSelect.style.borderRadius = '3px';
    scopeSelect.style.appearance = 'none'; // Supprime la flèche native
    scopeSelect.style.cursor = 'pointer';
    scopeSelect.style.fontSize = '14px';
    scopeSelect.style.fontWeight = 'bold';
    scopeSelect.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
    
    // Ajouter la flèche blanche en haut à droite
    scopeSelect.style.backgroundImage = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'8\' height=\'8\' fill=\'white\'><polygon points=\'0,0 3,0 1.5,2\'/></svg>")';
    scopeSelect.style.backgroundRepeat = 'no-repeat';
    scopeSelect.style.backgroundPosition = 'top 0px right -13px'; // Positionner en haut à droite
    scopeSelect.style.paddingRight = '0px'; // Espace pour la flèche




    scopeSelect.innerHTML = `
        <option value="all">Tout</option>
        <option value="ancestors">Ascend</option>
        <option value="descendants">Descend</option>
    `;
    scopeSelect.value = config.scope || 'all';
    
    // Événements de survol
    scopeSelect.addEventListener('mouseover', () => {
        scopeSelect.style.backgroundColor = '#2e9800'; // Version légèrement plus foncée au survol
    });
    scopeSelect.addEventListener('mouseout', () => {
        scopeSelect.style.backgroundColor = '#38b000'; // Retour à la couleur normale
    });
    
    return scopeSelect;
}












function createModalContainer() {
    const modal = document.createElement('div');
    modal.className = 'modal-container';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';
    modal.style.padding = '0'; // Ajouter cette ligne
    modal.style.margin = '0';  // Ajouter cette ligne
    modal.style.overflow = 'hidden'; // Ajouter cette ligne

    return modal;
}

function createMainContainer() {
    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    container.style.borderRadius = '10px';
    container.style.padding = '0'; // Réduire à 0 pour maximiser l'espace
    container.style.position = 'relative';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.overflow = 'hidden';
    
    return container;
}


function createCloseButton() {
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '1px';  // Modifié de 10px à 5px pour le déplacer vers le haut
    closeButton.style.right = '1px'; // Modifié de 10px à 5px pour le déplacer vers la droite
    closeButton.style.background = 'rgba(255, 255, 255, 0.7)'; // Fond semi-transparent
    closeButton.style.border = '1px solid #ccc';
    closeButton.style.borderRadius = '50%'; // Forme ronde
    closeButton.style.width = '30px';
    closeButton.style.height = '30px';
    closeButton.style.fontSize = '24px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.display = 'flex';
    closeButton.style.justifyContent = 'center';
    closeButton.style.alignItems = 'center';
    closeButton.style.zIndex = '1001'; // Valeur plus élevée que celle du conteneur des options
    closeButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)'; // Ombre légère pour mieux ressortir
    
    return closeButton;
}



function createNameCloudContainer() {
    const nameCloudContainer = document.createElement('div');
    nameCloudContainer.style.flexGrow = '1';
    nameCloudContainer.style.overflow = 'hidden';
    nameCloudContainer.style.margin = '0';
    nameCloudContainer.style.padding = '0';
    nameCloudContainer.style.position = 'relative'; // Pour qu'il puisse contenir des éléments positionnés
    nameCloudContainer.style.marginTop = '-20px';
    return nameCloudContainer;
}

function setupModalEvents(modal, closeButton, generateNameCloud) {
    // Événement pour le bouton Fermer
    closeButton.addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    // Événement pour la touche Échap
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            document.body.removeChild(modal);
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}


// Fonction pour mettre à jour le texte du titre
function updateTitleText(element, cfg) {
    let titleText = '';
    if (cfg.type === 'prenoms') {
        titleText = `${totalWords} Prénoms`;
    } else if (cfg.type === 'noms') {
        titleText = `${totalWords} Noms`;
    } else if (cfg.type === 'professions') {
        titleText = `${totalWords} Métiers`;
    } else if (cfg.type === 'duree_vie') {
        titleText = `${totalWords} Durées de vie `;
    } else if (cfg.type === 'age_procreation') {
        titleText = `${totalWords} Ages de procréation`;
    } else {
        titleText = `${totalWords} Lieux entre ${cfg.startDate} et ${cfg.endDate}`;
    }
    
    if (!mobilePhone || window.innerWidth > 600) 
        titleText = titleText + ` entre ${cfg.startDate} et ${cfg.endDate}`;
    else
        // titleText = titleText + ` <span style="font-size: 0.8em">entre ${cfg.startDate} et ${cfg.endDate}</span>`;
        titleText = ` <span style="font-size: 0.7em">` + titleText + `</span> <span style="font-size: 0.6em">entre ${cfg.startDate} et ${cfg.endDate}</span>`;


    if (placedWords < totalWords) {
        if (!mobilePhone || window.innerWidth > 600)
            titleText = titleText + ` <span style="font-size: 0.6em; color: red">(${placedWords} mots placés)</span>`;
        else
            titleText = titleText + ` <span style="font-size: 0.5em; color: red">(${placedWords} mots placés)</span>`;
        // element.innerHTML = titleText; // Utiliser innerHTML au lieu de textContent
    } 
    // else {
    //     element.textContent = titleText;
    // }

    element.innerHTML = titleText;

    // element.textContent = titleText;
}


function showNameCloud(nameData, config) {
    // Créer les éléments principaux
    const modal = createModalContainer();
    const container = createMainContainer();
    const closeButton = createCloseButton();
    // const nameCloudContainer = createNameCloudContainer();
    nameCloudContainer = createNameCloudContainer();

    // Créer le conteneur des options
    const optionsContainer = document.createElement('div');

    optionsContainer.style.display = 'flex';
    optionsContainer.style.flexDirection = 'column';
    optionsContainer.style.alignItems = 'center';
    optionsContainer.style.padding = '5px';
    optionsContainer.style.backgroundColor = 'transparent';
    optionsContainer.style.position = 'absolute';
    optionsContainer.style.top = '0';
    optionsContainer.style.left = '0';
    optionsContainer.style.right = '0';
    optionsContainer.style.zIndex = '10';

    // Créer les éléments de configuration
    const typeSelect = createTypeSelect(config);
    typeSelect.style.padding = '1px 3px';
    typeSelect.style.verticalAlign = 'top';
    typeSelect.style.marginLeft = '0px';

    const scopeSelect = createScopeSelect(config);
    scopeSelect.style.marginLeft = '-5px';    
    const rootPersonSelect = createRootPersonSelect();

    const { container: startDateContainer, input: startDateInput } = createDateInput('début', config.startDate, '45px');
    const { container: endDateContainer, input: endDateInput } = createDateInput('fin', config.endDate, '45px');


    const showButton = document.createElement('button');
    showButton.innerHTML = '✓'; // Coche pour indiquer "valider"
    showButton.style.padding = '0';
    showButton.style.backgroundColor = '#4CAF50'; // Vert
    showButton.style.color = 'white';
    showButton.style.border = 'none';
    showButton.style.borderRadius = '50%'; // Forme ronde
    showButton.style.width = '23px';
    showButton.style.height = '23px';
    showButton.style.position = 'relative';
    showButton.style.marginLeft = '-8px';
    // showButton.style.marginTop = '-13px';
    showButton.style.transform = 'translateY(-4px)';
    showButton.style.fontSize = '16px';
    showButton.style.cursor = 'pointer';
    showButton.style.display = 'flex';
    showButton.style.justifyContent = 'center';
    showButton.style.alignItems = 'center';
    showButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    showButton.title = 'Valider'; // Infobulle qui apparaît au survol



    // Conteneur pour la personne racine avec recherche
    const { container: rootPersonContainer, rootPersonSelect: finalRootPersonSelect } = 
        createRootPersonSearchContainer(rootPersonSelect, generateNameCloud);
    
    rootPersonContainer.style.marginLeft = '-7px';
    rootPersonContainer.style.marginTop = '3px';

    // Gestion de la visibilité de la sélection de personne racine
    function updateRootPersonVisibility() {
        const isRootPersonNeeded = ['ancestors', 'descendants'].includes(scopeSelect.value);
        rootPersonContainer.style.display = isRootPersonNeeded ? 'flex' : 'none';
    }
    scopeSelect.addEventListener('change', updateRootPersonVisibility);
    updateRootPersonVisibility();

    // Création du layout pour les boutons
    const leftContainer = document.createElement('div');
    leftContainer.style.display = 'flex';
    leftContainer.style.gap = '10px';
    leftContainer.appendChild(typeSelect);
    leftContainer.appendChild(scopeSelect);

    const dateContainer = document.createElement('div');
    dateContainer.style.display = 'flex';
    dateContainer.style.gap = '10px';
    dateContainer.appendChild(startDateContainer);
    dateContainer.appendChild(endDateContainer);

    const mainOptionsContainer = document.createElement('div');
    mainOptionsContainer.style.display = 'flex';
    mainOptionsContainer.style.gap = '10px';
    mainOptionsContainer.style.alignItems = 'flex-end';

    mainOptionsContainer.appendChild(leftContainer);
    mainOptionsContainer.appendChild(dateContainer);
    mainOptionsContainer.appendChild(showButton);

    // Création du conteneur pour les boutons du bas
    const bottomContainer = document.createElement('div');
    bottomContainer.style.display = 'flex';
    bottomContainer.style.justifyContent = 'space-between';
    bottomContainer.style.alignItems = 'center';
    bottomContainer.style.width = '100%';
    bottomContainer.style.gap = '10px';

    // Ajouter les boutons au conteneur du bas
    bottomContainer.appendChild(mainOptionsContainer);
    bottomContainer.appendChild(rootPersonContainer);

    // Créer le titre
    titleElement = document.createElement('div');
    titleElement.style.fontSize = '22px';
    titleElement.style.fontWeight = 'bold';
    titleElement.id = 'name-cloud-title';
    titleElement.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
    titleElement.style.padding = '2px 10px';
    titleElement.style.borderRadius = '4px';
    titleElement.style.marginTop = '5px';
    titleElement.style.textAlign = 'center';
    titleElement.style.position = 'relative'; // Position relative
    // Ajouter une ombre légère pour améliorer la lisibilité
    titleElement.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
    // titleElement.style.left = horizontalOffset + 'px'; // Utiliser le même offset que la carte

    // // Définir le texte du titre
    updateTitleText(titleElement, config);

    // Ajouter les éléments au conteneur des options
    optionsContainer.appendChild(bottomContainer);
    optionsContainer.appendChild(titleElement);

    // Assemblage final
    container.appendChild(closeButton);
    container.appendChild(nameCloudContainer);
    container.appendChild(optionsContainer);
    modal.appendChild(container);
    document.body.appendChild(modal);

   
    // Fonction pour générer le nuage de noms
    function generateNameCloud() {
        const newConfig = {
            type: typeSelect.value,
            startDate: parseInt(startDateInput.value),
            endDate: parseInt(endDateInput.value),
            scope: scopeSelect.value,
            rootPersonId: scopeSelect.value !== 'all' ? finalRootPersonSelect.value : null
        };

        // Mettre à jour le titre
        updateTitleText(titleElement, newConfig);

        // Effacer le contenu précédent
        nameCloudContainer.innerHTML = '';

        // Générer les données du nuage de noms
        processNamesCloudWithDate(newConfig, nameCloudContainer);
    }

    // Configuration des événements
    setupModalEvents(modal, closeButton, generateNameCloud);
    typeSelect.addEventListener('change', generateNameCloud);
    scopeSelect.addEventListener('change', generateNameCloud);
    showButton.addEventListener('click', generateNameCloud);

    // Générer le nuage de noms initial
    generateNameCloud();


    // Configurer les écouteurs d'événements pour les changements de taille d'écran
    setupResizeListeners();


    // Définir le texte du titre
    updateTitleText(titleElement, config);

    return modal;
}


function centerCloudNameContainer() {         
    containerHorizontalOffset = (window.innerWidth - SVG_width)/2;
    containerVerticalOffset = (window.innerHeight - SVG_height)/2;
    if (nameCloudContainer) {
        nameCloudContainer.style.marginLeft = containerHorizontalOffset + 'px';
        nameCloudContainer.style.marginTop = containerVerticalOffset + 'px';
    }
    // console.log( "\n******* centerCloudNameContainer with offX", containerHorizontalOffset, ", offY=", containerVerticalOffset, ", center map with offX=", horizontalOffset," offY=" , verticalOffset, ", screen W=",window.innerWidth , " H=",window.innerHeight, "SVG w=", SVG_width, "h=",SVG_height)
}


function processNamesCloudWithDate(config, containerElement = null) {
    resetStats();
    const nameFrequency = {};

    // Dimensions de l'écran
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    // if (screenW >= 1900) SVG_width = 1920; else if (screenW >= 1200) SVG_width = 1200; else SVG_width = 800;
    // if (screenH >= 1000) SVG_height = 1080; else if (screenH >= 800) SVG_width = 1200;  else SVG_height = 600;
    
    SVG_width = window.innerWidth;
    SVG_height = window.innerHeight;


    mobilePhone = false;
    if (Math.min(window.innerWidth, window.innerHeight) < 400 ) mobilePhone = 1;
    else if (Math.min(window.innerWidth, window.innerHeight) < 600 ) mobilePhone = 2;

    // for mobile phone
    // if (((screenW >= 700) || (screenH >= 700)) && ((screenW < 700) || (screenH < 700))   )
    if (mobilePhone) 
        { SVG_width = screenW + 50; SVG_height = screenH + 50; }


    let message = "screen = " + window.innerWidth + " x "  + window.innerHeight +", map= " + SVG_width + " x " + SVG_height;
    console.log(message);
    showToast(message, 3000)

    


    // Récupérer les personnes selon le mode choisi
    const persons = getPersonsFromTree(config.scope, config.rootPersonId);
    

    showToast("Recalcul en cours...", 1000);

    // Compter le nombre total de personnes
    stats.totalPersons = persons.length;

    persons.forEach(person => {
        const hasDate = hasDateInRange(person, config);
        
        if (config.type === 'prenoms') {
            const firstName = person.name.split('/')[0].trim();
            const firstNames = firstName
                .split(' ')
                .map(name => cleanSurName(name))
                .filter(name => isValidSurName(name))
                .map(name => capitalizeName(name));
            
            if (hasDate) {
                stats.inPeriod++;
                firstNames.forEach(name => {
                    if (name) {
                        nameFrequency[name] = (nameFrequency[name] || 0) + 1;
                    }
                });
            }
        } else if (config.type === 'noms') {
            const familyName = person.name.split('/')[1];

            if (familyName && hasDate) {
                stats.inPeriod++;
                const cleanedName = cleanFamilyName(familyName);
                const formattedName = formatFamilyName(cleanedName);
                if (formattedName && isValidFamilyName(formattedName)) {
                    nameFrequency[formattedName] = (nameFrequency[formattedName] || 0) + 1;
                }
            }
        } else if (config.type === 'professions') {
            if (person.occupation && hasDate) {
                stats.inPeriod++;
                const cleanedProfessions = cleanProfession(person.occupation);
                // if (cleanedProfessions) {
                //     nameFrequency[cleanedProfessions] = (nameFrequency[cleanedProfessions] || 0) + 1;
                // }

                cleanedProfessions.forEach(prof => {
                    if (prof) {
                        nameFrequency[prof] = (nameFrequency[prof] || 0) + 1;
                    }
                });

            }
        } else if (config.type === 'duree_vie') {
            if (person.birthDate && person.deathDate) {
                const birthYear = extractYear(person.birthDate);
                const deathYear = extractYear(person.deathDate);
                
                // Vérifier que la personne a vécu pendant la période sélectionnée
                const startYear = Math.min(config.startDate, config.endDate);
                const endYear = Math.max(config.startDate, config.endDate);
                
                // La personne doit avoir été vivante pendant la période
                // (née avant la fin de la période ET morte après le début de la période)
                // if (birthYear <= endYear && deathYear >= startYear) {
                if (birthYear <= endYear && birthYear >= startYear) {
                    const age = deathYear - birthYear;
                    if (age >= 0 && age <= 150) {
                        stats.inPeriod++;
                        const ageStr = age.toString();
                        nameFrequency[ageStr] = (nameFrequency[ageStr] || 0) + 1;
                    }
                }
            }
        } else if (config.type === 'age_procreation') {
            if (person.birthDate) {
                const parentBirthYear = extractYear(person.birthDate);
                
                // Pour chaque mariage
                if (person.spouseFamilies) {
                    person.spouseFamilies.forEach(familyId => {
                        const family = state.gedcomData.families[familyId];
                        if (family && family.children) {
                            // Pour chaque enfant
                            family.children.forEach(childId => {
                                const child = state.gedcomData.individuals[childId];
                                if (child && child.birthDate) {
                                    const childBirthYear = extractYear(child.birthDate);
                                    
                                    // Vérifier que la personne a vécu pendant la période sélectionnée
                                    const startYear = Math.min(config.startDate, config.endDate);
                                    const endYear = Math.max(config.startDate, config.endDate);

                                    // if (childBirthYear > parentBirthYear) {
                                    if ((childBirthYear > parentBirthYear) && (parentBirthYear <= endYear) && (parentBirthYear >= startYear)) {
                                        const ageAtChildBirth = childBirthYear - parentBirthYear;
                                        // Filtre des âges raisonnables (12-70 ans)
                                        if (ageAtChildBirth >= 5 && ageAtChildBirth <= 100) {
                                            stats.inPeriod++;
                                            const ageStr = ageAtChildBirth.toString();
                                            nameFrequency[ageStr] = (nameFrequency[ageStr] || 0) + 1;
                                        }
                                    }
                                }
                            });
                        }
                    });
                }
            }
        } else if (config.type === 'lieux') {
            const allLocations = [];
            
            // Collecter tous les lieux possibles
            if (hasDate) {
                const potentialLocations = [
                    person.birthPlace, 
                    person.deathPlace, 
                    person.marriagePlace, 
                    person.residPlace1, 
                    person.residPlace2, 
                    person.residPlace3
                ];
                
                potentialLocations.forEach(location => {
                    const cleanedLocation = cleanLocation(location);
                    if (cleanedLocation) {
                        allLocations.push(cleanedLocation);
                    }
                });
            }
            
            // Compter les occurrences de lieux
            allLocations.forEach(location => {
                nameFrequency[location] = (nameFrequency[location] || 0) + 1;
            });
        }
    });


    
    // Mettre à jour le nombre de noms uniques
    stats.uniqueNames = Object.keys(nameFrequency).length;

    // Convertir pour d3-cloud
    const nameData = Object.entries(nameFrequency)
        .map(([text, size]) => ({ text, size }))
        .sort((a, b) => b.size - a.size);

    // Afficher les statistiques
    // displayDateStats();

    // Afficher le nuage
    if (containerElement) {
        const root = ReactDOM.createRoot(containerElement);
        root.render(React.createElement(NameCloud, { nameData: nameData, config: config }));
    } else {
        showNameCloud(nameData, config);
    }

    centerCloudNameContainer();

    currentNameData = nameData; // Sauvegarder les données du nuage
    // Conserver les données pour réutilisation
    currentConfig = { ...config };


    message = "nombre de mots  = " + stats.uniqueNames;
    console.log(message);
    // showToast(message, 3000)

    showToast(message, 10000);

    
}

// Exports
export { processNamesCloudWithDate };
// Aussi rendre disponible globalement
window.processNamesCloudWithDate = processNamesCloudWithDate;