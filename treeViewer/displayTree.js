function displayPedigree(gedcomData, rootPersonId = null) {

    globalGedcomData = gedcomData;// Store the global GEDCOM data for later use

    // Utiliser l'ID racine global si aucun ID n'est passé
    const personId = rootPersonId || globalRootPersonId;
    // Si rootPersonId est fourni, l'utiliser
    const person = personId 
        ? gedcomData.individuals[personId] 
        : Object.values(gedcomData.individuals)
            .filter(p => p.birthDate && p.id)
            .sort((a, b) => new Date(b.birthDate) - new Date(a.birthDate))[0];

    console.log("Personne utilisée pour l'arbre :", person);

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

    const boxHeight = 50;

    const treeData = buildAncestorTree(person.id, gedcomData);
    currentTree = treeData;  // Sauvegarder l'arbre

    drawTree();



    // // Nouvelle fonction pour dessiner l'arbre sans le reconstruire
        function drawTree() {
            const root = d3.hierarchy(currentTree);
            
            // // Le reste du code de displayPedigree à partir de la création de l'arbre d3
            // const tree = d3.tree()
            //     .nodeSize([boxHeight * 1.8, boxWidth * 1.3])
            //     .separation(/* votre code de séparation */);

            // const svg = d3.select("#tree-svg")
            //     .attr("width", width)
            //     .attr("height", height);

            // svg.selectAll("*").remove();
            // const root = d3.hierarchy(treeData);

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
                // .attr("transform", d => `translate(${d.y},${d.x})`);
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


            //Le texte pour les noms 
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
                                if (word.includes('-')) {
                                    const parts = word.split('-')
                                        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase());
                                    acc.push(...parts);
                                } else {
                                    acc.push(word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
                                }
                                return acc;
                            }, [])
                            .slice(0, nombre_prenoms);
                        
                        const formattedFirstNames = prenomWords.join(' ');
                        const maxWidth = boxWidth - 10;
                
                        text.text(null);
                        
                        // Première ligne : prénoms
                        const firstLine = text.append("tspan")
                            .attr("x", 0)
                            .attr("dy", "-0.7em")
                            .text(formattedFirstNames);
                        
                        // Deuxième ligne : nom
                        text.append("tspan")
                            .attr("x", 0)
                            .attr("dy", "1.2em")
                            .attr("fill", "#0000CD")
                            .text(lastName);
                        
                        // Troisième ligne : dates
                        if (d.data.birthDate || d.data.deathDate) {
                            const birthParts = d.data.birthDate ? d.data.birthDate.split(' ') : [];
                            const deathParts = d.data.deathDate ? d.data.deathDate.split(' ') : [];
                            
                            const birthYear = birthParts.length > 0 ? birthParts[birthParts.length - 1] : '?';
                            const deathYear = deathParts.length > 0 ? deathParts[deathParts.length - 1] : '?';
                            
                            // Nouvelle logique pour les personnes nées après 1930
                            let dateText = birthYear; // Toujours afficher l'année de naissance
                            
                            if (parseInt(birthYear) > 1930) {
                                // Si pas de date de décès, ne rien ajouter
                                if (deathYear !== '?') {
                                    dateText += ` - ${deathYear}`;
                                }
                            } else {
                                // Logique originale pour les personnes nées avant 1930
                                dateText = `${birthYear} - ${deathYear}`;
                            }
                            
                            text.append("tspan")
                                .attr("x", 0)
                                .attr("dy", "1.2em")
                                .attr("fill", "#006400")  // Vert foncé
                                .text(dateText);
                        }
                    }
                });


            node.append("text")
                // .filter(d => {
                //     // Montrer "-" seulement si la personne a des ascendants visibles
                //     return d.data.children && d.data.children.length;
                // })
                .filter(d => {
                    // Une case doit avoir un symbole si :
                    // 1. Elle a des ascendants visibles actuellement (->"-")
                    if (d.data.children && d.data.children.length) {
                        return true;
                    }
                    
                    // 2. Elle est sur la dernière génération visible (->"+")
                    // OU elle a été créée avec des parents possibles (->"+")
                    if (d.depth === nombre_generation - 1 || d.data.hasParents) {
                        const person = gedcomData.individuals[d.data.id];
                        const hasParents = person.families.some(famId => {
                            const family = gedcomData.families[famId];
                            return family && (family.husband || family.wife);
                        });
                        return hasParents;
                    }
            
                    // 3. Elle avait des ascendants qui ont été cachés (->"+")
                    if (d.data._hiddenChildren && d.data._hiddenChildren.length) {
                        return true;
                    }
            
                    return false;
                })
                .attr("class", "toggle-text")
                .attr("x", boxWidth/2 + 9)
                .attr("y", -boxHeight/2 + 15)
                .attr("text-anchor", "middle")
                .style("cursor", "pointer")
                .style("font-size", "20px")
                .style("fill", "#6495ED")
                .text(d => {
                    // Si la case a des enfants visibles -> "-"
                    if (d.data.children && d.data.children.length) {
                        return "-";
                    }
                    // Sinon -> "+"
                    return "+";
                })



                .on("click", function(event, d) {
                    event.stopPropagation();
                    
                    if (d.data.children && d.data.children.length) {
                        // Cas du "-" : cacher les ascendants
                        d.data._hiddenChildren = d.data.children;
                        d.data.children = [];
                    } else {
                        // Cas du "+" : 
                        if (d.data._hiddenChildren) {
                            // Si on avait caché des ascendants, les restaurer
                            d.data.children = d.data._hiddenChildren;
                            d.data._hiddenChildren = null;
                        } else {
                            // Sinon, construire les nouveaux ascendants
                            const person = gedcomData.individuals[d.data.id];
                            // Chercher les parents dans les familles
                            person.families.some(famId => {
                                const family = gedcomData.families[famId];
                                if (family) {
                                    d.data.children = [];
                                    // if (family.husband) {
                                    //     d.data.children.push({
                                    //         id: family.husband,
                                    //         name: gedcomData.individuals[family.husband].name,
                                    //         generation: d.data.generation + 1,
                                    //         children: []
                                    //     });
                                    // }
                                    // if (family.wife) {
                                    //     d.data.children.push({
                                    //         id: family.wife,
                                    //         name: gedcomData.individuals[family.wife].name,
                                    //         generation: d.data.generation + 1,
                                    //         children: []
                                    //     });
                                    // }

                                    if (family.husband) {
                                        // Vérifier si le père a des parents
                                        const father = gedcomData.individuals[family.husband];
                                        const fatherHasParents = father.families.some(fId => {
                                            const fam = gedcomData.families[fId];
                                            return fam && (fam.husband || fam.wife);
                                        });
                                        d.data.children.push({
                                            id: family.husband,
                                            name: father.name,
                                            generation: d.data.generation + 1,
                                            children: [],
                                            hasParents: fatherHasParents  // Marquer si a des parents
                                        });
                                    }
                                    if (family.wife) {
                                        // Vérifier si la mère a des parents
                                        const mother = gedcomData.individuals[family.wife];
                                        const motherHasParents = mother.families.some(fId => {
                                            const fam = gedcomData.families[fId];
                                            return fam && (fam.husband || fam.wife);
                                        });
                                        d.data.children.push({
                                            id: family.wife,
                                            name: mother.name,
                                            generation: d.data.generation + 1,
                                            children: [],
                                            hasParents: motherHasParents  // Marquer si a des parents
                                        });
                                    }

                                    return true;  // On s'arrête à la première famille trouvée
                                }
                                return false;
                            });
                        }
                    }
        
                    // Redessiner l'arbre
                    drawTree();
                });



            // Symbole * pour changer la racine
            node.append("text")
                .attr("class", "root-text")
                .attr("x", boxWidth/2 + 9)  // Un peu plus à droite que le +/-
                .attr("y", -boxHeight/2 + 46)
                .attr("text-anchor", "middle")
                .style("cursor", "pointer")
                .style("font-size", "16px")
                .style("fill", "#6495ED")
                .text("*")
                .on("click", function(event, d) {
                    event.stopPropagation();
                    displayPedigree(globalGedcomData, d.data.id);
                });

            zoom = d3.zoom()
                .scaleExtent([0.1, 3])
                .on("zoom", ({transform}) => {
                    lastTransform = transform;  // Sauvegarder la transformation courante
                    g.attr("transform", transform);
                });

            svg.call(zoom);
            
             // Utiliser la dernière transformation si elle existe
            const initialTransform = lastTransform || d3.zoomIdentity
                .translate(boxWidth, height/2)
                .scale(0.8);
            svg.call(zoom.transform, initialTransform);
        }
}


function update(g, source, root, tree, boxWidth, boxHeight) {
    const duration = 750;

    // Recalculer l'arbre
    const nodes = tree(root).descendants();
    const links = tree(root).links();

    // Mettre à jour les nœuds
    const node = g.selectAll(".node")
        .data(nodes, d => d.data.id);

    // Entrée des nouveaux nœuds
    const nodeEnter = node.enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${source.y},${source.x})`);

    // Ajouter les rectangles et textes comme avant
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
                    if (word.includes('-')) {
                        const parts = word.split('-')
                            .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase());
                        acc.push(...parts);
                    } else {
                        acc.push(word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
                    }
                    return acc;
                }, [])
                .slice(0, nombre_prenoms);
            
            const formattedFirstNames = prenomWords.join(' ');
            const maxWidth = boxWidth - 10;
    
            text.text(null);
            
            // Première ligne : prénoms
            const firstLine = text.append("tspan")
                .attr("x", 0)
                .attr("dy", "-0.7em")
                .text(formattedFirstNames);
            
            // Deuxième ligne : nom
            text.append("tspan")
                .attr("x", 0)
                .attr("dy", "1.2em")
                .attr("fill", "#0000CD")
                .text(lastName);
            
            // Troisième ligne : dates
            if (d.data.birthDate || d.data.deathDate) {
                const birthParts = d.data.birthDate ? d.data.birthDate.split(' ') : [];
                const deathParts = d.data.deathDate ? d.data.deathDate.split(' ') : [];
                
                const birthYear = birthParts.length > 0 ? birthParts[birthParts.length - 1] : '?';
                const deathYear = deathParts.length > 0 ? deathParts[deathParts.length - 1] : '?';
                
                // Nouvelle logique pour les personnes nées après 1930
                let dateText = birthYear; // Toujours afficher l'année de naissance
                
                if (parseInt(birthYear) > 1930) {
                    // Si pas de date de décès, ne rien ajouter
                    if (deathYear !== '?') {
                        dateText += ` - ${deathYear}`;
                    }
                } else {
                    // Logique originale pour les personnes nées avant 1930
                    dateText = `${birthYear} - ${deathYear}`;
                }
                
                text.append("tspan")
                    .attr("x", 0)
                    .attr("dy", "1.2em")
                    .attr("fill", "#006400")  // Vert foncé
                    .text(dateText);
            }
        }
    });


    // Mettre à jour les positions des nœuds existants
    node.merge(nodeEnter)
        .transition()
        .duration(duration)
        .attr("transform", d => `translate(${d.y},${d.x})`);

    // Supprimer les nœuds sortants
    node.exit()
        .transition()
        .duration(duration)
        .attr("transform", d => `translate(${source.y},${source.x})`)
        .remove();

    // Mettre à jour les liens
    const link = g.selectAll(".link")
        .data(links, d => d.target.data.id);

    // Ajouter les nouveaux liens
    link.enter()
        .append("path")
        .attr("class", d => {
            if (d.target.data.isSibling && d.source.data.generation < d.target.data.generation) {
                return "link hidden";
            }
            return (d.source.data.isSibling || d.target.data.isSibling) ? "link sibling-link" : "link";
        })
        .attr("d", d => {
            const o = {x: source.x, y: source.y};
            return `M${o.y},${o.x}H${o.y}V${o.x}H${o.y}`;
        });

    // Mettre à jour les liens existants
    link.transition()
        .duration(duration)
        .attr("d", d => `M${d.source.y},${d.source.x}
                       H${(d.source.y + d.target.y)/2}
                       V${d.target.x}
                       H${d.target.y}`);

    // Supprimer les liens sortants
    link.exit()
        .transition()
        .duration(duration)
        .attr("d", d => {
            const o = {x: source.x, y: source.y};
            return `M${o.y},${o.x}H${o.y}V${o.x}H${o.y}`;
        })
        .remove();
}


/* Fonction pour mettre à jour le nombre de prénoms affichés*/
function updatePrenoms(value) {
    nombre_prenoms = value;
    displayPedigree(globalGedcomData, globalRootPersonId);
}

// Fonction pour mettre à jour le nombre de générations affichées
function updateGenerations(value) {
    nombre_generation = value;
    displayPedigree(globalGedcomData, globalRootPersonId);
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

    // Revenir au plus jeune, en réinitialisant globalRootPersonId
    globalRootPersonId = null;

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
    // Réinitialiser tous les surlignages
    d3.selectAll('.person-box').classed('search-highlight', false);
    
    if (!str) {
        // Ne pas réinitialiser si un rootPersonId est défini
        if (!globalRootPersonId) {
            resetZoom();
        }
        return;
    }
    
    const searchStr = str.toLowerCase();
    const matchedNodes = [];

    // Rechercher les nœuds correspondants
    d3.selectAll('.node').each(function(d) {
        const name = d.data.name.toLowerCase().replace(/\//g, '');
        const matches = name.includes(searchStr);
        
        if (matches) {
            matchedNodes.push({node: d, element: this});
            
            const personBox = d3.select(this).select('.person-box');
            personBox.classed('search-highlight', true);
        }
    });

    if (matchedNodes.length > 0) {
        const firstMatch = matchedNodes[0];
        
        const svg = d3.select("#tree-svg");
        const nodeElement = d3.select(firstMatch.element);

        const currentTransform = d3.zoomTransform(svg.node());
        
        const nodeTransform = nodeElement.attr('transform');
        
        const match = nodeTransform.match(/translate\(([^,]+),([^)]+)\)/);
        if (match) {
            const x = parseFloat(match[1]);
            const y = parseFloat(match[2]);

            svg.transition()
                .duration(750)
                .call(zoom.transform, 
                    d3.zoomIdentity
                        .translate(window.innerWidth/2 - x, window.innerHeight/2 - y)
                        .scale(1)
                );
        }
    }
}
