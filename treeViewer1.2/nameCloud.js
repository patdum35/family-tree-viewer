// Ajout dans la section des imports
import { buildAncestorTree, buildDescendantTree } from './treeOperations.js';
import { state } from './main.js';


// Structure des stats
const stats = {
    totalPersons: 0,
    directDates: {
        birth: 0,
        death: 0,
        marriage: 0,
        people: new Set() // Pour compter les personnes uniques avec dates directes
    },
    ancestorDates: [], // {id, name, depth, type, year}
    descendantDates: [], // {id, name, depth, type, year}
    noDates: [], // {id, name}
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
        `Liste des personnes avec le prénom "${name}" (${people.length} occurrences)` :
        `Liste des personnes avec le nom "${name}" (${people.length} occurrences)`;
    title.style.marginBottom = '10px';
    title.style.borderBottom = '1px solid #eee';
    title.style.paddingBottom = '5px';
    title.style.fontSize = '16px';

    // Bouton de fermeture
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.position = 'absolute';
    closeBtn.style.right = '10px';
    closeBtn.style.top = '10px';
    closeBtn.style.border = 'none';
    closeBtn.style.background = 'none';
    closeBtn.style.fontSize = '20px';
    closeBtn.style.cursor = 'pointer';
    // closeBtn.onclick = () => document.body.removeChild(modal);
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
                date = `Naissance: ${individual.birthDate}`;  // Raccourci pour Naissance
                sortDate = extractYear(individual.birthDate) || 0;
            } else if (individual.deathDate) {
                date = `Décès: ${individual.deathDate}`;  // Raccourci pour Décès
                sortDate = extractYear(individual.deathDate) || 0;
            } else if (individual.spouseFamilies && individual.spouseFamilies.length > 0) {
                // Chercher une date de mariage dans les familles où la personne est époux/épouse
                for (const famId of individual.spouseFamilies) {
                    const family = state.gedcomData.families[famId];
                    if (family && family.marriageDate) {
                        date = `Mariage: ${family.marriageDate}`;
                        sortDate = extractYear(family.marriageDate) || 0;
                        break; // On prend le premier mariage trouvé
                    }
                }
            }
        }

        return {
            name: person.name,
            date: date,
            sortDate: sortDate
        };
    }).sort((a, b) => a.sortDate - b.sortDate);

    peopleWithDates.forEach((person, index) => {
        const personDiv = document.createElement('div');
        personDiv.style.padding = '3px 5px';  // Padding réduit
        personDiv.style.backgroundColor = index % 2 === 0 ? '#f9f9f9' : 'white';
        personDiv.style.display = 'flex';
        personDiv.style.justifyContent = 'space-between';
        personDiv.style.alignItems = 'center';
        personDiv.style.lineHeight = '1.2';  // Hauteur de ligne réduite

        const nameSpan = document.createElement('span');
        nameSpan.textContent = person.name;
        nameSpan.style.marginRight = '10px';

        const dateSpan = document.createElement('span');
        dateSpan.textContent = person.date;
        dateSpan.style.color = '#666';
        dateSpan.style.whiteSpace = 'nowrap';  // Éviter le retour à la ligne des dates

        personDiv.appendChild(nameSpan);
        personDiv.appendChild(dateSpan);
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



// const NameCloud = ({ nameData , config }) => {
//     React.useEffect(() => {
//         if (!nameData || nameData.length === 0) return;

//         d3.select('#name-cloud-svg').selectAll('*').remove();

//         const width = 800;
//         const height = 600;

//         const svg = d3.select('#name-cloud-svg')
//             .attr('width', width)
//             .attr('height', height);

//         // Fond
//         svg.append('rect')
//             .attr('width', width)
//             .attr('height', height)
//             .attr('fill', '#f7fafc');

//         // Échelle pour la taille des polices
//         const fontScale = d3.scaleLog()
//             .domain([1, d3.max(nameData, d => d.size)])
//             .range([10, 45])
//             .clamp(true);

//         // Palette de couleurs vives
//         const colorPalette = [
//             '#1E88E5', // bleu vif
//             '#E53935', // rouge vif
//             '#43A047', // vert vif
//             '#FB8C00', // orange vif
//             '#8E24AA', // violet vif
//             '#00ACC1', // cyan vif
//             '#FFB300', // jaune vif
//             '#3949AB', // indigo vif
//             '#00897B', // turquoise vif
//             '#7CB342'  // vert lime vif
//         ];

//         const color = d3.scaleOrdinal(colorPalette);

//         const layout = d3.layout.cloud()
//             .size([width - 20, height - 20])
//             .words(nameData.map(d => ({
//                 text: d.text,
//                 size: fontScale(d.size),
//                 originalSize: d.size
//             })))
//             .padding(1)
//             .rotate(0)
//             .fontSize(d => d.size)
//             .spiral('rectangular')
//             .random(() => 0.5)
//             .canvas(function() {
//                 const canvas = document.createElement('canvas');
//                 canvas.setAttribute('willReadFrequently', 'true');
//                 return canvas;
//             })
//             .on('end', words => {
//                 draw(words);
//             });

//         function draw(words) {
//             const background = svg.append('g');
//             const textGroup = svg.append('g')
//                 .attr('transform', `translate(${width/2},${height/2})`);
        
//             background.append('rect')
//                 .attr('width', width)
//                 .attr('height', height)
//                 .attr('fill', '#f7fafc');
        
//             // Trier les mots par taille (les plus grands en premier)
//             const sortedWords = words.sort((a, b) => b.size - a.size);
            
//             const texts = textGroup.selectAll('text')
//                 .data(sortedWords)
//                 .join('text')
//                 .attr('class', 'name-text')
//                 .style('font-size', d => `${d.size}px`)
//                 .style('font-family', 'Arial')
//                 .style('font-weight', 'bold')
//                 .style('fill', (d, i) => color(i % colorPalette.length))
//                 .attr('transform', d => `translate(${d.x},${d.y})`)
//                 .attr('text-anchor', 'middle')
//                 .attr('dominant-baseline', 'middle')
//                 .style('cursor', 'pointer')
//                 .text(d => d.text);
        
//             // D'abord définir la fonction de calcul des dimensions
//             const getClickDimensions = (d) => {
//                 const clickWidth = d.size > 30 ? d.width/4 : d.width/2;
//                 const clickHeight = d.size > 30 ? d.height/8 : (d.size > 15 ? d.height/4: d.height/2);
//                 return {
//                     width: clickWidth,
//                     height: clickHeight,
//                 };
//             };            
        
//             // Ajouter des zones de clic transparentes
//             const clickAreas = textGroup.selectAll('rect.click-area')
//                 .data(sortedWords)
//                 .join('rect')
//                 .attr('class', 'click-area')
//                 .attr('x', d => d.x - getClickDimensions(d).width/2)
//                 .attr('y', d => d.y - getClickDimensions(d).height/2)
//                 .attr('width', d => getClickDimensions(d).width)
//                 .attr('height', d => getClickDimensions(d).height)
//                 .style('fill', 'transparent')
//                 .style('cursor', 'pointer');
        
//             const textProperties = new Map();
//             texts.each(function(d) {
//                 textProperties.set(d.text, {
//                     fill: color(words.indexOf(d) % colorPalette.length),
//                     size: d.size
//                 });
//             });
        
//             let activeTemp = null;
        
//             function handleClick(d) {
//                 if (!state.gedcomData) return;
                
//                 const persons = getPersonsFromTree(config.scope, config.rootPersonId);

//                 const people = Object.values(state.gedcomData.individuals)
//                     .filter(p => {
//                         const firstName = p.name.split('/')[0].trim();
                
//                         const nameMatches = config.type === 'prenoms' 
//                             ? firstName.split(' ').some(name => 
//                                 name.toLowerCase() === d.text.toLowerCase() || 
//                                 name.toLowerCase().startsWith(d.text.toLowerCase() + ' ')
//                             )
//                             : (p.name.split('/')[1] && p.name.split('/')[1].toLowerCase().trim() === d.text.toLowerCase());
        
//                         // Si mode descendants, s'assurer que la personne est dans l'arbre des descendants
//                         const isInDescendantTree = config.scope !== 'descendants' || 
//                             persons.some(descendant => descendant.id === p.id);

//                         return nameMatches && isInDescendantTree && hasDateInRange(p, config);

//                     })
//                     .map(p => ({
//                         name: p.name.replace(/\//g, ''),
//                         id: p.id
//                     }));
                
//                 showPersonsList(d.text, people, config);
//             }
        
//             function createTempText(originalElement, d, props) {
//                 if (activeTemp) {
//                     activeTemp.remove();
//                     d3.selectAll('.name-text').style('opacity', 1);
//                 }
        
//                 d3.select(originalElement).style('opacity', 0);
                
//                 const tempGroup = svg.append('g')
//                     .attr('transform', `translate(${width/2},${height/2})`);
                    
//                 const tempText = tempGroup.append('text')
//                     .attr('class', 'temp-text')
//                     .style('font-size', `${props.size * 1.2}px`)
//                     .style('font-family', 'Arial')
//                     .style('font-weight', 'bold')
//                     .style('fill', '#e53e3e')
//                     .attr('transform', d3.select(originalElement).attr('transform'))
//                     .attr('text-anchor', 'middle')
//                     .attr('dominant-baseline', 'middle')
//                     .style('cursor', 'pointer')
//                     .text(d.text);
        
//                 tempText
//                     .on('click', () => handleClick(d))
//                     .on('mouseout', () => {
//                         tempGroup.remove();
//                         d3.select(originalElement).style('opacity', 1);
//                         activeTemp = null;
//                     });
        
//                 activeTemp = tempGroup;
//                 return tempGroup;
//             }
        
//             // Gérer les événements sur les zones de clic
//             clickAreas
//                 .on('mouseover', function(event, d) {
//                     const props = textProperties.get(d.text);
//                     if (!props) return;
//                     const correspondingText = texts.filter(function(t) { 
//                         return t.text === d.text; 
//                     }).node();
//                     createTempText(correspondingText, d, props);
//                 })
//                 .on('click', function(event, d) {
//                     handleClick(d);
//                 });
        
//             texts.append('title')
//                 .text(d => `${d.text}: ${d.originalSize} occurrences`);
//         }



//         layout.start();

//     }, [nameData]);

//     return React.createElement('div', { className: 'bg-white p-4 rounded-lg shadow-lg' },
//         React.createElement('h2', { className: 'text-xl font-bold mb-4' }, 
//             config.type === 'prenoms' 
//                 ? `Nuage des Prénoms entre ${config.startDate} et ${config.endDate}`
//                 : `Nuage des Noms de famille entre ${config.startDate} et ${config.endDate}`
//         ),
//         React.createElement('div', { className: 'relative w-full h-96' },
//             React.createElement('svg', {
//                 id: 'name-cloud-svg',
//                 className: 'w-full h-full',
//                 style: { backgroundColor: '#f7fafc' }
//             })
//         )
//     );
// };

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

const createFontScale = (nameData) => {
    return d3.scaleLog()
        .domain([1, d3.max(nameData, d => d.size)])
        .range([10, 45])
        .clamp(true);
};

const setupZoom = (svg, textGroup) => {
    const zoom = d3.zoom()
        .scaleExtent([0.5, 5])
        .on('zoom', (event) => {
            // Vérifier que textGroup existe avant de le transformer
            if (textGroup && textGroup.current) {
                textGroup.current.attr('transform', event.transform);
            }
        });

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

    return zoom;
};

const NameCloud = ({ nameData, config }) => {
    const textGroupRef = React.useRef(null);

    React.useEffect(() => {
        if (!nameData || nameData.length === 0) return;

        d3.select('#name-cloud-svg').selectAll('*').remove();

        const width = 800;
        const height = 600;

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

        const textGroup = svg.append('g')
            .attr('transform', `translate(${width/2},${height/2})`);
        
        // Stocker la référence pour le zoom
        textGroupRef.current = textGroup;

        // Configurer le zoom
        setupZoom(svg, textGroupRef);

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
            .padding(1)
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
                drawNameCloud(svg, textGroup, words, color, config);
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
        React.createElement('h2', { className: 'text-xl font-bold mb-4' }, 
            config.type === 'prenoms' 
                ? `Nuage des Prénoms entre ${config.startDate} et ${config.endDate}`
                : `Nuage des Noms de famille entre ${config.startDate} et ${config.endDate}`
        ),
        React.createElement('div', { 
            className: 'relative w-full h-96',
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
                const firstName = p.name.split('/')[0].trim();
        
                const nameMatches = config.type === 'prenoms' 
                    ? firstName.split(' ').some(name => 
                        name.toLowerCase() === d.text.toLowerCase() || 
                        name.toLowerCase().startsWith(d.text.toLowerCase() + ' ')
                    )
                    : (p.name.split('/')[1] && p.name.split('/')[1].toLowerCase().trim() === d.text.toLowerCase());

                // Si mode descendants, s'assurer que la personne est dans l'arbre des descendants
                const isInDescendantTree = config.scope !== 'descendants' || 
                    persons.some(descendant => descendant.id === p.id);

                return nameMatches && isInDescendantTree && hasDateInRange(p, config);
            })
            .map(p => ({
                name: p.name.replace(/\//g, ''),
                id: p.id
            }));
        
        showPersonsList(d.text, people, config);
    }

    function createTempText(originalElement, d, props) {
        if (activeTemp) {
            activeTemp.remove();
            d3.selectAll('.name-text').style('opacity', 1);
        }

        d3.select(originalElement).style('opacity', 0);
        
        const tempGroup = svg.append('g')
            .attr('transform', `translate(${svg.attr('width')/2},${svg.attr('height')/2})`);
            
        const tempText = tempGroup.append('text')
            .attr('class', 'temp-text')
            .style('font-size', `${props.size * 1.2}px`)
            .style('font-family', 'Arial')
            .style('font-weight', 'bold')
            .style('fill', '#e53e3e')
            .attr('transform', d3.select(originalElement).attr('transform'))
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .style('cursor', 'pointer')
            .text(d.text);

        tempText
            .on('click', () => handleClick(d))
            .on('mouseout', () => {
                tempGroup.remove();
                d3.select(originalElement).style('opacity', 1);
                activeTemp = null;
            });

        activeTemp = tempGroup;
        return tempGroup;
    }

    // Gérer les événements sur les zones de clic
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



export default NameCloud;


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
               numYear !== 0 && 
               numYear >= Math.min(config.startDate, config.endDate) && 
               numYear <= Math.max(config.startDate, config.endDate);
    };

    // Vérifier dates directes
    if (person.birthDate && isValidYear(extractYear(person.birthDate))) {
        stats.directDates.birth++;
        stats.directDates.people.add(person.id);
        return true;
    }
    if (person.deathDate && isValidYear(extractYear(person.deathDate))) {
        stats.directDates.death++;
        stats.directDates.people.add(person.id);
        return true;
    }

    // Vérifier mariages
    if (person.spouseFamilies) {
        for (const famId of person.spouseFamilies) {
            const family = state.gedcomData.families[famId];
            if (family && family.marriageDate && isValidYear(extractYear(family.marriageDate))) {
                stats.directDates.marriage++;
                stats.directDates.people.add(person.id);
                return true;
            }
        }
    }

    // Chercher dans les ancêtres/descendants si pas de date directe
    const dateInfo = findDateForPerson(person.id);
    if (dateInfo && isValidYear(dateInfo.year)) {
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



function showNameCloud(nameData, config) {  
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

    const container = document.createElement('div');
    container.style.width = '90%';
    container.style.height = '90%';
    container.style.backgroundColor = 'white';
    container.style.borderRadius = '10px';
    container.style.padding = '20px';
    container.style.position = 'relative';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';

    // Conteneur pour les options
    const optionsContainer = document.createElement('div');
    optionsContainer.style.display = 'flex';
    optionsContainer.style.marginBottom = '15px';
    optionsContainer.style.alignItems = 'center';
    optionsContainer.style.gap = '10px';

    // Type d'affichage (prénoms/noms)
    const typeSelect = document.createElement('select');
    typeSelect.style.padding = '5px';
    typeSelect.innerHTML = `
        <option value="prenoms">Prénoms</option>
        <option value="noms">Noms de famille</option>
    `;
    typeSelect.value = config.type;

    // Sélection de la portée
    const scopeSelect = document.createElement('select');
    scopeSelect.style.padding = '5px';
    scopeSelect.innerHTML = `
        <option value="all">Fichier entier</option>
        <option value="ancestors">Ascendance</option>
        <option value="descendants">Descendance</option>
    `;
    scopeSelect.value = config.scope || 'all';

    // Sélecteur de personne racine
    const rootPersonSelect = document.createElement('select');
    rootPersonSelect.style.padding = '5px';
    rootPersonSelect.style.width = '100%';
    rootPersonSelect.style.display = 'none'; // Cacher initialement

    // Remplir le sélecteur des personnes racines
    const rootPersons = Object.values(state.gedcomData.individuals);
    rootPersons.sort((a, b) => a.name.localeCompare(b.name));
    rootPersons.forEach(person => {
        const option = document.createElement('option');
        option.value = person.id;
        option.textContent = person.name.replace(/\//g, '').trim();
        rootPersonSelect.appendChild(option);
    });

    // Conteneur pour la recherche de personne racine
    const rootPersonSearchContainer = document.createElement('div');
    rootPersonSearchContainer.style.display = 'flex';
    rootPersonSearchContainer.style.alignItems = 'center';
    rootPersonSearchContainer.style.gap = '5px';

    const rootPersonSearchInput = document.createElement('input');
    rootPersonSearchInput.type = 'text';
    rootPersonSearchInput.placeholder = 'Rechercher une personne racine';
    rootPersonSearchInput.style.padding = '5px';
    rootPersonSearchInput.style.flexGrow = '1';

    const rootPersonSearchButton = document.createElement('button');
    rootPersonSearchButton.textContent = '🔍';
    rootPersonSearchButton.style.padding = '5px 10px';

    const rootPersonResultsSelect = document.createElement('select');
    rootPersonResultsSelect.style.display = 'none';
    rootPersonResultsSelect.style.width = '100%';
    rootPersonResultsSelect.style.marginTop = '5px';

    // Dates
    const startDateContainer = document.createElement('div');
    startDateContainer.style.display = 'flex';
    startDateContainer.style.alignItems = 'center';
    startDateContainer.style.gap = '5px';
    
    const startDateLabel = document.createElement('div');
    startDateLabel.innerHTML = 'année<br>début';
    startDateLabel.style.marginRight = '5px';
    startDateLabel.style.fontSize = '12px';
    startDateLabel.style.lineHeight = '1.1';
    startDateLabel.style.textAlign = 'center';

    const startDateInput = document.createElement('input');
    startDateInput.type = 'number';
    startDateInput.style.width = '100px';
    startDateInput.style.padding = '5px';
    startDateInput.value = config.startDate;

    const endDateContainer = document.createElement('div');
    endDateContainer.style.display = 'flex';
    endDateContainer.style.alignItems = 'center';
    endDateContainer.style.gap = '5px';
    
    const endDateLabel = document.createElement('div');
    endDateLabel.innerHTML = 'année<br>fin';
    endDateLabel.style.marginRight = '5px';
    endDateLabel.style.fontSize = '12px';
    endDateLabel.style.lineHeight = '1.1';
    endDateLabel.style.textAlign = 'center';

    const endDateInput = document.createElement('input');
    endDateInput.type = 'number';
    endDateInput.style.width = '100px';
    endDateInput.style.padding = '5px';
    endDateInput.value = config.endDate;

    // Bouton Afficher
    const showButton = document.createElement('button');
    showButton.textContent = 'Afficher';
    showButton.style.padding = '5px 10px';
    showButton.style.backgroundColor = '#4CAF50';
    showButton.style.color = 'white';
    showButton.style.border = 'none';
    showButton.style.borderRadius = '4px';
    showButton.style.marginLeft = '10px';

    // Bouton Fermer
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '24px';
    closeButton.style.cursor = 'pointer';

    // Conteneur pour le nuage de noms
    const nameCloudContainer = document.createElement('div');
    nameCloudContainer.style.flexGrow = '1';
    nameCloudContainer.style.overflow = 'auto';

    // Fonction de recherche de personne racine
    function searchRootPerson() {
        const searchStr = rootPersonSearchInput.value.toLowerCase();
        rootPersonResultsSelect.innerHTML = '<option value="">Sélectionner</option>';
        rootPersonResultsSelect.style.display = 'none';

        if (!searchStr) return;

        const matchedPersons = Object.values(state.gedcomData.individuals)
            .filter(person => {
                const fullName = person.name.toLowerCase().replace(/\//g, '');
                return fullName.includes(searchStr);
            });

        if (matchedPersons.length > 0) {
            matchedPersons.forEach(person => {
                const option = document.createElement('option');
                option.value = person.id;
                option.textContent = person.name.replace(/\//g, '').trim();
                rootPersonResultsSelect.appendChild(option);
            });
            
            rootPersonResultsSelect.style.display = 'block';
            rootPersonResultsSelect.style.animation = 'findResults 1s infinite';
            rootPersonResultsSelect.style.backgroundColor = 'yellow';
        } else {
            alert('Aucune personne trouvée');
        }
    }

    // Événement de recherche
    rootPersonSearchButton.addEventListener('click', searchRootPerson);
    rootPersonSearchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            searchRootPerson();
        }
    });

    // Événement de sélection
    rootPersonResultsSelect.addEventListener('change', () => {
        const selectedPersonId = rootPersonResultsSelect.value;
        if (selectedPersonId) {
            rootPersonResultsSelect.style.animation = 'none';
            rootPersonResultsSelect.style.backgroundColor = 'orange';
            rootPersonSelect.value = selectedPersonId;
        }
    });

    // Conteneur pour la sélection de la personne racine
    const rootPersonContainer = document.createElement('div');
    rootPersonContainer.style.display = 'flex';
    rootPersonContainer.style.flexDirection = 'column';

    const rootPersonLabel = document.createElement('label');
    rootPersonLabel.textContent = 'Personne racine :';

    const rootPersonSearchWrapper = document.createElement('div');
    rootPersonSearchWrapper.style.display = 'flex';
    rootPersonSearchWrapper.style.gap = '5px';
    rootPersonSearchWrapper.appendChild(rootPersonSearchInput);
    rootPersonSearchWrapper.appendChild(rootPersonSearchButton);

    rootPersonContainer.appendChild(rootPersonLabel);
    rootPersonContainer.appendChild(rootPersonSearchWrapper);
    rootPersonContainer.appendChild(rootPersonResultsSelect);
    rootPersonContainer.appendChild(rootPersonSelect);

    // Gestion de la visibilité de la sélection de personne racine
    function updateRootPersonVisibility() {
        const isRootPersonNeeded = ['ancestors', 'descendants'].includes(scopeSelect.value);
        rootPersonContainer.style.display = isRootPersonNeeded ? 'flex' : 'none';
        rootPersonSelect.style.display = isRootPersonNeeded ? 'block' : 'none';
    }
    scopeSelect.addEventListener('change', updateRootPersonVisibility);
    updateRootPersonVisibility();

    // Assembler les conteneurs de dates
    startDateContainer.appendChild(startDateLabel);
    startDateContainer.appendChild(startDateInput);
    endDateContainer.appendChild(endDateLabel);
    endDateContainer.appendChild(endDateInput);

    // Ajouter les éléments à optionsContainer
    optionsContainer.appendChild(typeSelect);
    optionsContainer.appendChild(scopeSelect);
    optionsContainer.appendChild(rootPersonContainer);
    optionsContainer.appendChild(startDateContainer);
    optionsContainer.appendChild(endDateContainer);
    optionsContainer.appendChild(showButton);

    // Ajouter les éléments au container principal
    container.appendChild(closeButton);
    container.appendChild(optionsContainer);
    container.appendChild(nameCloudContainer);
    modal.appendChild(container);
    document.body.appendChild(modal);

    // Fonction pour générer le nuage de noms
    function generateNameCloud() {
        const newConfig = {
            type: typeSelect.value,
            startDate: parseInt(startDateInput.value),
            endDate: parseInt(endDateInput.value),
            scope: scopeSelect.value,
            rootPersonId: scopeSelect.value !== 'all' ? rootPersonSelect.value : null
        };

        // Effacer le contenu précédent
        nameCloudContainer.innerHTML = '';

        // Générer les données du nuage de noms
        processNamesCloudWithDate(newConfig, nameCloudContainer);
    }

    // Événements
    typeSelect.addEventListener('change', generateNameCloud);
    scopeSelect.addEventListener('change', generateNameCloud);
    showButton.addEventListener('click', generateNameCloud);

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

    // Générer le nuage de noms initial
    generateNameCloud();
}



// Fonction principale de traitement
function processNamesCloudWithDate(config, containerElement = null) {
    resetStats();
    const nameFrequency = {};
    
    // Récupérer les personnes selon le mode choisi
    const persons = getPersonsFromTree(config.scope, config.rootPersonId);
    
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
        } else {
            const familyName = person.name.split('/')[1];

            if (familyName && hasDate) {
                stats.inPeriod++;
                const cleanedName = cleanFamilyName(familyName);
                const formattedName = formatFamilyName(cleanedName);
                if (formattedName && isValidFamilyName(formattedName)) {
                    nameFrequency[formattedName] = (nameFrequency[formattedName] || 0) + 1;
                }
            }
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
}


// Exports
export { processNamesCloudWithDate };
// Aussi rendre disponible globalement
window.processNamesCloudWithDate = processNamesCloudWithDate;