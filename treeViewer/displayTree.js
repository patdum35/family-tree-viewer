function displayPedigree(gedcomData, rootPersonId = null) {

    globalGedcomData = gedcomData;// Store the global GEDCOM data for later use

    // Si rootPersonId est fourni, l'utiliser
    const person = rootPersonId 
        ? gedcomData.individuals[rootPersonId] 
        : Object.values(gedcomData.individuals)
            .filter(p => p.birthDate && p.id)
            .sort((a, b) => new Date(b.birthDate) - new Date(a.birthDate))[0];



    const width = window.innerWidth;
    const height = window.innerHeight;
    var boxWidth = 150;
    if (typeof nombre_prenoms === 'string') {
        nombre_prenoms = parseInt(nombre_prenoms, 10);
    }

    if (nombre_prenoms === 1) {
        boxWidth = 90;
    }
    else if (nombre_prenoms === 2) {
        boxWidth = 120;
    }

    console.log("largeur case:", boxWidth);
    console.log("nombre_prenoms:", nombre_prenoms);
        
    const boxHeight = 40;

    // const youngest = Object.values(gedcomData.individuals)
    //     .filter(person => person.birthDate)
    //     .sort((a, b) => new Date(b.birthDate) - new Date(a.birthDate))[0];

    const treeData = buildAncestorTree(person.id, gedcomData);
    const root = d3.hierarchy(treeData);

    const tree = d3.tree()
        .nodeSize([boxHeight * 1.8, boxWidth * 1.3])
        .separation((a, b) => {
            if (a.data.isSibling || b.data.isSibling) {
                return 0.65;
            }
            if (a.depth === (nombre_generation-1) && b.depth === (nombre_generation-1) && a.parent !== b.parent) {
                return 0.7;
            }
            if (a.parent === b.parent) {
                const scale = Math.max(0.5, (nombre_generation - a.depth) / nombre_generation);
                return scale * (a.depth === b.depth ? 1.1 : 1.5);
            }
            return 1;
        });

    const svg = d3.select("#tree-svg")
        .attr("width", width)
        .attr("height", height);

    svg.selectAll("*").remove();

    const g = svg.append("g")
        .attr("transform", `translate(${boxWidth},${height/2})`);

    // Calculer les positions initiales
    const nodes = tree(root);

    // Ajuster la position verticale d'Emma
    const parents = root.children?.filter(n => !n.data.isSibling);
    if (parents && parents.length === 2) {
        // console.log("Position avant ajustement:", root.x);
        // console.log("Position parent 1:", parents[0].x);
        // console.log("Position parent 2:", parents[1].x);
        
        // Calculer le centre entre les deux parents
        const centerY = (parents[0].x + parents[1].x) / 2;
        
        // console.log("Nouvelle position calculée:", centerY);
        // Ajuster la position d'Emma
        root.x = centerY;
    }

    // Le reste du code pour dessiner les liens et les nœuds
    const link = g.selectAll(".link")
        .data(root.links())
        .join("path")
        .attr("class", d => {
            if (d.target.data.isSibling && d.source.data.generation < d.target.data.generation) {
                return "link hidden";
            }
            return (d.source.data.isSibling || d.target.data.isSibling) ? "link sibling-link" : "link";
        })
        .attr("d", d => {
            if (d.target.data.isSibling && d.source.data.generation < d.target.data.generation) {
                return "";
            }
            return `M${d.source.y},${d.source.x}
                    H${(d.source.y + d.target.y)/2}
                    V${d.target.x}
                    H${d.target.y}`;
        });

    const node = g.selectAll(".node")
        .data(root.descendants())
        .join("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.y},${d.x})`)
        // Add click event to each node
        .on("click", function(event, d) {
            displayPersonDetails(d.data.id);
        });

    node.append("rect")
        .attr("class", d => d.data.isSibling ? "person-box sibling" : "person-box")
        .attr("x", -boxWidth/2)
        .attr("y", -boxHeight/2)
        .attr("width", boxWidth)
        .attr("height", boxHeight)
        .attr("rx", 5);

    node.append("text")
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .each(function(d) {
        const text = d3.select(this);
        
        const match = d.data.name.match(/(.*?)\/(.*?)\//);
        if (match) {
            const firstNames = match[1].trim();
            const lastName = match[2].trim().toUpperCase();
            
            // Traiter les prénoms avec tirets et limiter à 3
            const prenomWords = firstNames.split(' ')
                .reduce((acc, word) => {
                    // Si le mot contient un tiret
                    if (word.includes('-')) {
                        // Séparer sur le tiret et formater chaque partie
                        const parts = word.split('-')
                            .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase());
                        acc.push(...parts);
                    } else {
                        // Mot normal
                        acc.push(word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
                    }
                    return acc;
                }, [])
                .slice(0, nombre_prenoms);  // Limiter à 3 prénoms après avoir séparé les prénoms composés
            
            const formattedFirstNames = prenomWords.join(' ');
            const maxWidth = boxWidth - 10;

            text.text(null);
            
            // Première ligne : tenter de mettre tous les prénoms
            const firstLine = text.append("tspan")
                .attr("x", 0)
                .attr("dy", "-0.2em");
            
            const prenomWidth = formattedFirstNames.length * 6;
            if (prenomWidth <= maxWidth) {
                // Les prénoms tiennent sur la première ligne
                firstLine.text(formattedFirstNames);
                // Deuxième ligne : seulement le nom
                text.append("tspan")
                    .attr("x", 0)
                    .attr("dy", "1.2em")
                    .attr("fill", "#0000CD")
                    .text(lastName);
            } else {
                // Les prénoms ne tiennent pas, on les coupe
                const midPoint = Math.floor(prenomWords.length / 2);
                const firstPart = prenomWords.slice(0, midPoint).join(' ');
                const secondPart = prenomWords.slice(midPoint).join(' ');
                
                firstLine.text(firstPart);
                
                // Deuxième ligne : reste des prénoms + nom
                const secondLine = text.append("tspan")
                    .attr("x", 0)
                    .attr("dy", "1.2em");
                
                if (secondPart) {
                    secondLine.text(secondPart + ' ');
                }
                
                text.append("tspan")
                    .attr("fill", "#0000CD")
                    .text(lastName);
            }
        } else {
            text.text(d.data.name);
        }
    });
    

    zoom = d3.zoom()
        .scaleExtent([0.1, 3])
        .on("zoom", ({transform}) => {
            g.attr("transform", transform);
        });

    svg.call(zoom);
    
    const initialTransform = d3.zoomIdentity
        .translate(boxWidth, height/2)
        .scale(0.8);
    svg.call(zoom.transform, initialTransform);
}

// Fonction pour mettre à jour le nombre de prénoms affichés
function updatePrenoms(value) {
    nombre_prenoms = value;
    loadData();
}

// Fonction pour mettre à jour le nombre de générations affichées
function updateGenerations(value) {
    nombre_generation = value;
    loadData();
}

function zoomIn() {
    const svg = d3.select("#tree-svg");
    const currentTransform = d3.zoomTransform(svg.node());
    svg.transition()
        .duration(750)
        .call(zoom.transform, 
            d3.zoomIdentity
                .translate(currentTransform.x, currentTransform.y)
                .scale(currentTransform.k * 1.2)
        );
}

function zoomOut() {
    const svg = d3.select("#tree-svg");
    const currentTransform = d3.zoomTransform(svg.node());
    svg.transition()
        .duration(750)
        .call(zoom.transform, 
            d3.zoomIdentity
                .translate(currentTransform.x, currentTransform.y)
                .scale(currentTransform.k / 1.2)
        );
}

function resetZoom() {
    // Revenir à l'affichage du plus jeune
    const youngest = Object.values(globalGedcomData.individuals)
        .filter(person => person.birthDate && person.id)
        .sort((a, b) => new Date(b.birthDate) - new Date(a.birthDate))[0];

    // Redessiner l'arbre avec le plus jeune comme point de départ
    displayPedigree(globalGedcomData);

    // Réinitialiser le zoom
    const svg = d3.select("#tree-svg");
    const width = window.innerWidth;
    const height = window.innerHeight;
    svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(1));
}

function wrapText(text, width) {
    text.each(function() {
        const text = d3.select(this);
        const words = text.text().split(/\s+/);
        const lines = [""];
        let line = 0;
        
        words.forEach(word => {
            const testLine = lines[line] + word + " ";
            if (testLine.length * 6 > width) {
                lines.push(word + " ");
                line++;
            } else {
                lines[line] = testLine;
            }
        });

        text.text(null);
        lines.forEach((l, i) => {
            text.append("tspan")
                .attr("x", 0)
                .attr("dy", i === 0 ? "-0.2em" : "1.2em")
                .text(l.trim());
        });
    });
}

function formatLastWord(text) {
    const words = text.split(' ');
    const lastName = words[words.length - 1];
    const formattedLastName = lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();
    words[words.length - 1] = formattedLastName;
    return words;
}

function setAsRootPerson(personId) {
    console.log("Définition de la personne comme racine :", personId);
    
    // Fermer la modale
    document.getElementById('person-details-modal').style.display = 'none';
    
    // Redessiner l'arbre avec cette personne comme point de départ
    displayPedigree(globalGedcomData, personId);
}

function searchTree(str) {
    console.log("Recherche :", str);
    
    // Réinitialiser tous les surlignages
    d3.selectAll('.person-box').classed('search-highlight', false);
    
    if (!str) {
        resetZoom();
        return;
    }
    
    const searchStr = str.toLowerCase();
    const matchedNodes = [];

    // Chercher les nœuds correspondants
    d3.selectAll('.node').each(function(d) {
        const name = d.data.name.toLowerCase().replace(/\//g, '');
        const matches = name.includes(searchStr);
        
        console.log(`Vérification du nœud: ${name}, Correspond: ${matches}`);
        
        if (matches) {
            matchedNodes.push({node: d, element: this});
            
            // Déboguer le surlignage
            const personBox = d3.select(this).select('.person-box');
            console.log('Élément person-box :', personBox.node());
            
            personBox.classed('search-highlight', true);
            console.log('Classe ajoutée, nouvelles classes :', personBox.attr('class'));
        }
    });

    console.log(`Nombre de nœuds correspondants : ${matchedNodes.length}`);

    if (matchedNodes.length > 0) {
        const firstMatch = matchedNodes[0];
        
        // Obtenir les informations de position
        const svg = d3.select("#tree-svg");
        const nodeElement = d3.select(firstMatch.element);
        
        console.log('Premier nœud correspondant :', firstMatch.node);
        console.log('Élément du nœud :', nodeElement.node());

        // Obtenir la transformation actuelle
        const currentTransform = d3.zoomTransform(svg.node());
        
        // Obtenir la position du nœud
        const nodeTransform = nodeElement.attr('transform');
        console.log('Transform du nœud :', nodeTransform);
        
        // Extraire les coordonnées
        const match = nodeTransform.match(/translate\(([^,]+),([^)]+)\)/);
        if (match) {
            const x = parseFloat(match[1]);
            const y = parseFloat(match[2]);
            
            console.log(`Position du nœud - x: ${x}, y: ${y}`);

            // Zoomer et centrer
            svg.transition()
                .duration(750)
                .call(zoom.transform, 
                    d3.zoomIdentity
                        .translate(window.innerWidth/2 - x, window.innerHeight/2 - y)
                        .scale(1)
                );
        }
    } else {
        resetZoom();
    }
}

