// ====================================
// Rendu des nœuds
// ====================================
import { importLinks } from './importState.js'; // import de nodeControls via importLinks pour éviter les erreurs de chargement circulaire
import { extractYear } from './utils.js';
import { state } from './main.js';
// import { addRootChangeButton, addDescendantsControls, addAncestorsControls } from './nodeControls.js';
import { getDisplayPersonDetails } from './main.js';




// Fonction utilitaire pour nettoyer l'ID
export function cleanIdForSelector(id) {
    // S'assurer que l'ID est une chaîne de caractères
    const strId = String(id);
    // Remplacer les caractères non autorisés (ici, tout sauf lettres, chiffres, tirets, underscores)
    // Le '@' sera remplacé.
    return strId.replace(/[^a-zA-Z0-9\-\_]/g, '_'); 
    // Par exemple: "@I1@" devient "_I1_"
}

/**
 * Dessine les nœuds de l'arbre
 * @param {Object} group - Le groupe SVG principal
 * @param {Object} root - La racine de l'arbre
 * @param {Object} treeLayout - La mise en page de l'arbre
 */
export function drawNodes(group, layout, isAnimation = false) {
    const nodeGroups = group.selectAll(".node")
        .data(layout.descendants())
        .join("g")
        // .filter(d => !d.data._isDescendantNode)
        // .filter(d => !d.data._isDescendantNode && !d.data.isDescendantContainer) // Ajout du filtre
        .filter(d => !d.data._isDescendantNode && 
            !d.data.isDescendantContainer && 
            !d.data.isVirtualRoot)  

        .attr("class", "node")
        .attr("id", d => `node-${cleanIdForSelector(d.data.id)}`)
        .attr("transform", d => `translate(${d.y},${d.x})`)
        .on("click", async function(event, d) {
            // Ajout de l'appel à displayPersonDetails lors du clic
            event.stopPropagation();
            const displayPersonDetails = await getDisplayPersonDetails();
            displayPersonDetails(d.data.id);
        });

    drawNodeBoxes(nodeGroups);
    drawNodeContent(nodeGroups);
    addControlButtons(nodeGroups);

    // Ajout des nœuds spouses pour la racine
    if (layout.data && layout.data.spouses && layout.data.spouses.length > 0) {
        const spouseNodes = group.selectAll(".node.spouse")
            .data(layout.data.spouses.map(spouse => {
                return {
                    data: { ...spouse, isSpouse: true },
                    depth: 0
                };
            }))
            .join("g")
            .attr("class", "node spouse")
            .attr("transform", (d, i) => {
                const initialSpacing = state.boxHeight * 1.2;
                const spacing = state.boxHeight * 1.2;
                return `translate(${layout.y},${layout.x + initialSpacing + spacing * i})`;
            })
            .on("click", async function(event, d) {
                // Ajout de l'appel à displayPersonDetails lors du clic
                event.stopPropagation();
                const displayPersonDetails = await getDisplayPersonDetails();
                displayPersonDetails(d.data.id);
            });
            
        // Même traitement pour les spouses
        drawNodeBoxes(spouseNodes);
        drawNodeContent(spouseNodes);
        addControlButtons(spouseNodes);
    }
}


/**
 * Dessine le nœud racine et ses spouses au centre
 * @private
 */
export function drawRootNode(mainGroup, rootData) {
    // Dessiner le nœud racine
    const rootGroup = mainGroup.append("g")
        .attr("class", "node")
        .attr("transform", "translate(0,0)");

    drawNodeBoxes(rootGroup.data([{data: rootData}]));
    drawNodeContent(rootGroup.data([{data: rootData}]));

    // Dessiner les spouses
    if (rootData.spouses && rootData.spouses.length > 0) {
        const spouseNodes = mainGroup.selectAll(".node.spouse.root-spouse")
            .data(rootData.spouses)
            .join("g")
            .attr("class", "node spouse root-spouse")
            .attr("transform", (d, i) => 
                `translate(0,${(i + 1) * state.boxHeight * 1.2})`);

        drawNodeBoxes(spouseNodes.data(rootData.spouses.map(d => ({data: d}))));
        drawNodeContent(spouseNodes.data(rootData.spouses.map(d => ({data: d}))));
    }
}

/**
 * Dessine le contenu des nœuds (nom, dates)
 * @param {Object} nodeGroups - Les groupes de nœuds
 */
export function drawNodeContent(nodeGroups) {
    nodeGroups.append("text")
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .each(function(d) {
            // Skip le nœud container des descendants
            if (d.data.isDescendantContainer) return;

            const text = d3.select(this);
            const match = d.data.name?.match(/(.*?)\/(.*?)\//);

            if (!match) {
                console.log("Nom de famille non trouvé pour", d.data.name, ":", d.data.id, d.data.name2, d.data.title, d.data.title2);
            }
            
            if (match) {
                drawPersonDetails(text, match, d.data, state.boxWidth);
            }
        });
}
/**
 * Dessine les détails d'une personne
 * @private
 */
function drawPersonDetails(text, match, data) {
    const [_, firstNames, lastName] = match;
    const formattedFirstNames = formatFirstNames(firstNames);
    const formattedLastNames = formatlastNames(lastName);

    // Prénom(s)
    text.append("tspan")
        .attr("x", 0)
        .attr("dy", "-0.7em")
        .text(formattedFirstNames);
    
    // Nom de famille
    text.append("tspan")
        .attr("x", 0)
        .attr("dy", "1.2em")
        .attr("fill", "#0000CD")
        // .text(lastName.trim().toUpperCase());
        .text(formattedLastNames.trim().toUpperCase());

    // Dates
    drawDates(text, data);
}

/**
 * Formate les prénoms
 * @private
 */
function formatFirstNames(firstNames) {
    return firstNames.trim()
        .split(' ')
        .reduce((acc, word) => {
            if (word.includes('-')) {
                const parts = word.split('-')
                    .map(part => capitalizeFirstLetter(part));
                acc.push(...parts);
            } else {
                acc.push(capitalizeFirstLetter(word));
            }
            return acc;
        }, [])
        .slice(0, state.nombre_prenoms)
        .join(' ')
        .slice(0, state.nombre_lettersInPrenoms); // Garder seulement le nombre de lettres spécifié
}


/**
 * Formate les noms
 * @private
 */
function formatlastNames(lastNames) {
    return lastNames.trim()
        .split('(')[0] // Séparer par le caractère '(' et prendre la première partie
        .replace(')', '') // Enlever le caractère ')' s'il existe
        .split(',')[0] // Séparer par la virgule et prendre la première partie
        .split(' ') // Séparer par les espaces
        // .slice(0, state.nombre_lettersInNames) // Garder seulement le nombre de mots spécifié
        .join(' ') // Rejoindre les mots avec des espaces
        .slice(0, state.nombre_lettersInNames); // Garder seulement le nombre de lettres spécifié

        
}

/**
 * Capitalise la première lettre
 * @private
 */
function capitalizeFirstLetter(word) {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

/**
 * Dessine les dates
 * @private
 */
function drawDates(text, data) {
    // if no birth or death dates, we look for marriage date
    let marriageYear = false;
    if (!data.birthDate && !data.deathDate)
    {
        const person = state.gedcomData.individuals[data.id];
        if (person.spouseFamilies && person.spouseFamilies.length > 0) {
            // Pour chaque famille où la personne est un conjoint
            
            person.spouseFamilies.forEach(familyId => {
                const family = state.gedcomData.families[familyId];
                if (family && family.marriageDate) {
                    marriageYear = extractYear(family.marriageDate);
                }
            });
        }
    }

    if (!data.birthDate && !data.deathDate && !marriageYear) return;
    
    const birthYear = data.birthDate ? extractYear(data.birthDate) : '?';
    const deathYear = data.deathDate ? extractYear(data.deathDate) : '?';
    
    
    let dateText = birthYear;

    if (!data.birthDate && !data.deathDate && marriageYear) {
        dateText = `💍 ${marriageYear}`;
    }


    if (parseInt(birthYear) <= 1930 || deathYear !== '?') {
        dateText += ` - ${deathYear}`;
    }
    
    text.append("tspan")
        .attr("x", 0)
        .attr("dy", "1.2em")
        .attr("fill", "#006400")
        .text(dateText);
}

/**
 * Ajoute les boutons de contrôle aux nœuds
 * @private
 */

export function addControlButtons(nodeGroups) {
    importLinks.nodeControls.addRootChangeButton(nodeGroups);
    importLinks.nodeControls.addDescendantsControls(nodeGroups);
    importLinks.nodeControls.addAncestorsControls(nodeGroups);
}


/**
 *  * Dessine les rectangles des nœuds
 */
export function drawNodeBoxes(nodeGroups) {
    // Votre code d'ombre existant (gardez-le tel quel)
    const defs = d3.select("svg").append("defs");
    
    const filter = defs.append("filter")
        .attr("id", "drop-shadow")
        .attr("height", "125%");
    
    filter.append("feGaussianBlur")
        .attr("in", "SourceAlpha")
        .attr("stdDeviation", 2)
        .attr("result", "blur");
        
    filter.append("feOffset")
        .attr("in", "blur")
        .attr("dx", 2)
        .attr("dy", 2)
        .attr("result", "offsetBlur");
        
    filter.append("feComponentTransfer")
        .append("feFuncA")
        .attr("type", "linear")
        .attr("slope", "0.5");
        
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "offsetBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // NOUVELLE PARTIE : Choisir le style
    if (state.nodeStyle === 'diamond') {
        drawDiamond(nodeGroups);
    } else if (state.nodeStyle === 'galaxy') {
        drawGalaxy(nodeGroups);
    } else if (state.nodeStyle === 'bubble') {
        drawBubble(nodeGroups);
    } else if (state.nodeStyle === 'hextech') {
        drawHextech(nodeGroups);
    } else if (state.nodeStyle === 'heraldic') {
        drawHeraldic(nodeGroups);
    } else {
        // Votre code rectangles existant (inchangé)
        drawClassic(nodeGroups);
    }
}



/**
 * Votre style rectangles avec couleurs pastels
 */
function drawClassic(nodeGroups) {
    nodeGroups.append("rect")
        .attr("class", d => {
            if (!d.data) return "person-box";
            const classes = ["person-box"];
            if (d.data.isSpouse) classes.push("spouse");
            else if (d.data.isSibling) classes.push("sibling");
            else if (d.data.duplicate) classes.push("duplicate");
            else if (state.rootPersonId && d.data.id === state.rootPersonId) classes.push("root");
            else classes.push("normal");
            return classes.join(" ");
        })
        .attr("x", -state.boxWidth/2)
        .attr("y", -state.boxHeight/2)
        .attr("width", state.boxWidth)
        .attr("height", state.boxHeight)
        .attr("rx", 3)
        .style("fill", d => {
            // Couleurs pastels selon le type et le sexe
            if (d.data.isSibling) {
                return "#E8F5E8"; // Vert pastel pour siblings
            } else if (d.data.sex === 'F') {
                return "#FFE4E6"; // Rose pastel pour femmes
            } else if (d.data.sex === 'M') {
                return "#E3F2FD"; // Bleu pastel pour hommes
            } else {
                return "#F5F5F5"; // Gris clair pour non défini
            }
        })
        .style("stroke", d => {
            // Bordures légèrement plus foncées
            if (d.data.isSibling) return "#81C784";
            else if (d.data.sex === 'F') return "#F8BBD9";
            else if (d.data.sex === 'M') return "#90CAF9";
            else return "#E0E0E0";
        })
        .style("stroke-width", 1)
        .style("filter", "url(#drop-shadow)");
        if (state.addLeaves) {
            addLeavesAroundRectangle(nodeGroups);
        }
 }



/**
 * Ajoute des petites feuilles autour d'un rectangle
 */
function addLeavesAroundRectangle(nodeGroups) {
    nodeGroups.each(function(d) {
        const group = d3.select(this);
        const numLeaves = 4 + Math.floor(Math.random() * 3); // 4-6 feuilles
        
        for(let i = 0; i < numLeaves; i++) {
            addRandomLeaf(group);
        }
    });
}


/**
 * Ajoute une feuille de chêne réaliste avec nervures
 */
function addRandomLeaf(group) {
    const side = Math.floor(Math.random() * 4);
    let x, y, rotation;
    
    switch(side) {
        case 0: // Haut
            x = (Math.random() - 0.5) * state.boxWidth;
            y = -state.boxHeight/2;
            rotation = Math.random() * 60 - 30;
            break;
        case 1: // Droite  
            x = state.boxWidth/2;
            y = (Math.random() - 0.5) * state.boxHeight;
            rotation = 90 + Math.random() * 60 - 30;
            break;
        case 2: // Bas
            x = (Math.random() - 0.5) * state.boxWidth;
            y = state.boxHeight/2;
            rotation = 180 + Math.random() * 60 - 30;
            break;
        case 3: // Gauche
            x = -state.boxWidth/2;
            y = (Math.random() - 0.5) * state.boxHeight;
            rotation = 270 + Math.random() * 60 - 30;
            break;
    }
    
    // Contour de la feuille de chêne
    group.append("path")
        .attr("class", "leaf-decoration")
        .attr("d", "M0,-8 Q3,-7 4,-5 Q6,-3 4,-1 Q5,1 3,3 Q1,5 0,8 Q-1,5 -3,3 Q-5,1 -4,-1 Q-6,-3 -4,-5 Q-3,-7 0,-8 Z")
        .attr("transform", `translate(${x},${y}) rotate(${rotation})`)
        .style("fill", "#81C784")
        .style("stroke", "#4CAF50") 
        .style("stroke-width", 0.5)
        .style("pointer-events", "none");
        
    // Nervure centrale
    group.append("path")
        .attr("class", "leaf-vein-main")
        .attr("d", "M0,-8 L0,8")
        .attr("transform", `translate(${x},${y}) rotate(${rotation})`)
        .style("stroke", "#2E7D32")
        .style("stroke-width", 0.8)
        .style("fill", "none")
        .style("pointer-events", "none");
        
    // Nervures secondaires (4 de chaque côté)
    group.append("path")
        .attr("class", "leaf-vein-secondary")
        .attr("d", "M0,-6 L2,-4 M0,-3 L3,-1 M0,0 L3,2 M0,3 L2,5 M0,-6 L-2,-4 M0,-3 L-3,-1 M0,0 L-3,2 M0,3 L-2,5")
        .attr("transform", `translate(${x},${y}) rotate(${rotation})`)
        .style("stroke", "#388E3C")
        .style("stroke-width", 0.3)
        .style("fill", "none")
        .style("pointer-events", "none");
}


// /**
//  * NOUVEAU : Style blasons
//  */
function drawHeraldic(nodeGroups) {
    // Créer des dégradés plus subtils
    createImprovedHeraldcGradients();
    
    nodeGroups.append("path")
        .attr("class", d => {
            if (!d.data) return "person-box heraldic";
            const classes = ["person-box", "heraldic"];
            if (d.data.isSpouse) classes.push("spouse");
            else if (d.data.isSibling) classes.push("sibling");
            else if (d.data.duplicate) classes.push("duplicate");
            else if (state.rootPersonId && d.data.id === state.rootPersonId) classes.push("root");
            else classes.push("normal");
            return classes.join(" ");
        })
        .attr("d", () => {
            // Forme de blason plus élégante
            const w = state.boxWidth;
            const h = state.boxHeight;
            const halfW = w / 2;
            const halfH = h / 2;
            
            return `M ${-halfW} ${-halfH}
                    L ${halfW} ${-halfH}
                    L ${halfW} ${halfH * 0.1}
                    L ${halfW * 0.85} ${halfH * 0.5}
                    Q ${halfW * 0.6} ${halfH * 0.85} 0 ${halfH}
                    Q ${-halfW * 0.6} ${halfH * 0.85} ${-halfW * 0.85} ${halfH * 0.5}
                    L ${-halfW} ${halfH * 0.1}
                    Z`;
        })
        .style("fill", d => {
            // if (d.data.sex === 'F') return "url(#heraldic-female-subtle)";
            // if (d.data.sex === 'M') return "url(#heraldic-male-subtle)";
            // return "url(#heraldic-neutral-subtle)";
            // Couleur spéciale pour les siblings (vert)
            if (d.data.isSibling) return "url(#heraldic-sibling-green)";
            
            // Couleurs normales selon le sexe
            if (d.data.sex === 'F') return "url(#heraldic-female-subtle)";
            if (d.data.sex === 'M') return "url(#heraldic-male-subtle)";
            return "url(#heraldic-neutral-subtle)";
        })
        .style("stroke", "#8B7355") // Brun doré discret
        .style("stroke-width", 1.5)
        .style("filter", "url(#drop-shadow)");
}

// Nouvelle fonction pour des couleurs subtiles
function createImprovedHeraldcGradients() {
    const defs = d3.select("svg defs");
    
    // Supprimer les anciens
    defs.selectAll("#heraldic-male-subtle, #heraldic-female-subtle, #heraldic-neutral-subtle").remove();
    
    // Masculin : bleu pâle vers beige très clair
    const maleGrad = defs.append("linearGradient")
        .attr("id", "heraldic-male-subtle")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "0%").attr("y2", "100%");
    // maleGrad.append("stop").attr("offset", "0%").attr("stop-color", "#E6F3FF"); // Bleu très pâle
    // maleGrad.append("stop").attr("offset", "100%").attr("stop-color", "#F5F5DC"); // Beige clair
    
    // Féminin : rose très pâle vers blanc cassé
    const femaleGrad = defs.append("linearGradient")
        .attr("id", "heraldic-female-subtle")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "0%").attr("y2", "100%");
    // femaleGrad.append("stop").attr("offset", "0%").attr("stop-color", "#FFF0F5"); // Rose très pâle
    // femaleGrad.append("stop").attr("offset", "100%").attr("stop-color", "#FAFAFA"); // Blanc cassé
    
    // Neutre : gris perle
    const neutralGrad = defs.append("linearGradient")
        .attr("id", "heraldic-neutral-subtle")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "0%").attr("y2", "100%");
    // neutralGrad.append("stop").attr("offset", "0%").attr("stop-color", "#F8F8FF"); // Blanc fantôme
    // neutralGrad.append("stop").attr("offset", "100%").attr("stop-color", "#E6E6FA"); // Lavande pâle

    // Siblings : vert professionnel
    const siblingGrad = defs.append("linearGradient")
        .attr("id", "heraldic-sibling-green")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "0%").attr("y2", "100%");
    siblingGrad.append("stop").attr("offset", "0%").attr("stop-color", "#E8F5E8"); // Vert très pâle
    siblingGrad.append("stop").attr("offset", "100%").attr("stop-color", "#D4EDDA"); // Vert menthe


    // Masculin : bleu plus visible
    maleGrad.append("stop").attr("offset", "0%").attr("stop-color", "#D6E8FF"); // Au lieu de #E6F3FF
    maleGrad.append("stop").attr("offset", "100%").attr("stop-color", "#F0E68C"); // Au lieu de #F5F5DC

    // Féminin : rose plus visible  
    femaleGrad.append("stop").attr("offset", "0%").attr("stop-color", "#FFE4E6"); // Au lieu de #FFF0F5
    femaleGrad.append("stop").attr("offset", "100%").attr("stop-color", "#F0F0F0"); // Au lieu de #FAFAFA

    // Neutre : gris plus visible
    neutralGrad.append("stop").attr("offset", "0%").attr("stop-color", "#F0F0FF"); // Au lieu de #F8F8FF
    neutralGrad.append("stop").attr("offset", "100%").attr("stop-color", "#E0E0F0"); // Au lieu de #E6E6FA
}


/**
 * Style Diamants cristallins - BLUFFANT !
 */
function drawDiamond(nodeGroups) {
    createDiamondGradients();
    
    nodeGroups.append("path")
        .attr("class", "person-box diamond")
        .attr("d", () => {
            const w = state.boxWidth * 0.8;
            const h = state.boxHeight * 0.8;
            return `M 0 ${-h/2}
                    L ${w/3} ${-h/4}
                    L ${w/2} 0
                    L ${w/3} ${h/4}
                    L 0 ${h/2}
                    L ${-w/3} ${h/4}
                    L ${-w/2} 0
                    L ${-w/3} ${-h/4}
                    Z`;
        })
        .style("fill", d => {
            const hue = (d.depth * 60) % 360;
            return `url(#diamond-gradient-${Math.floor(hue/60)})`;
        })
        .style("stroke", "#fff")
        .style("stroke-width", 2)
        .style("filter", "url(#diamond-glow)");
        
    // Reflets cristallins
    nodeGroups.append("path")
        .attr("d", () => {
            const w = state.boxWidth * 0.6;
            const h = state.boxHeight * 0.6;
            return `M ${-w/4} ${-h/3} L ${w/6} ${-h/4} L ${w/4} ${h/6} L ${-w/6} ${h/4} Z`;
        })
        .style("fill", "rgba(255,255,255,0.4)")
        .style("pointer-events", "none");
}

/**
 * Style Galaxie
 */
function drawGalaxy(nodeGroups) {
    createGalaxyGradients();
    
    nodeGroups.append("circle")
        .attr("class", "person-box galaxy")
        .attr("r", Math.min(state.boxWidth, state.boxHeight) / 2.5)
        .style("fill", d => `url(#galaxy-${d.data.sex === 'F' ? 'pink' : d.data.sex === 'M' ? 'blue' : 'purple'})`)
        .style("filter", "url(#galaxy-glow)");
        
    // Particules scintillantes
    for(let i = 0; i < 8; i++) {
        const angle = (i * 45) * Math.PI / 180;
        const distance = state.boxWidth * 0.4;
        nodeGroups.append("circle")
            .attr("cx", Math.cos(angle) * distance)
            .attr("cy", Math.sin(angle) * distance)
            .attr("r", 2)
            .style("fill", "#fff")
            .style("opacity", Math.random() * 0.8 + 0.2)
            .style("pointer-events", "none");
    }
}

/**
 * Style Bulles aquatiques
 */
function drawBubble(nodeGroups) {
    createBubbleGradients();
    
    const bubbleSize = Math.min(state.boxWidth, state.boxHeight) / 2.2;
    
    nodeGroups.append("circle")
        .attr("class", "person-box bubble")
        .attr("r", bubbleSize)
        .style("fill", d => `url(#bubble-${d.data.sex === 'F' ? 'pink' : d.data.sex === 'M' ? 'blue' : 'green'})`)
        .style("stroke", "rgba(255,255,255,0.3)")
        .style("stroke-width", 1)
        .style("filter", "url(#bubble-glow)");
        
    // Reflet de bulle
    nodeGroups.append("ellipse")
        .attr("cx", -bubbleSize * 0.3)
        .attr("cy", -bubbleSize * 0.3)
        .attr("rx", bubbleSize * 0.2)
        .attr("ry", bubbleSize * 0.4)
        .style("fill", "rgba(255,255,255,0.6)")
        .style("pointer-events", "none");
}

/**
 * Style Hexagones technologiques
 */
function drawHextech(nodeGroups) {
    createHextechGradients();
    
    const size = Math.min(state.boxWidth, state.boxHeight) / 2.5;
    const hexPath = `M ${size} 0 
                     L ${size/2} ${size * 0.866} 
                     L ${-size/2} ${size * 0.866} 
                     L ${-size} 0 
                     L ${-size/2} ${-size * 0.866} 
                     L ${size/2} ${-size * 0.866} 
                     Z`;
    
    nodeGroups.append("path")
        .attr("class", "person-box hextech")
        .attr("d", hexPath)
        .style("fill", d => `url(#hextech-${d.data.sex === 'F' ? 'magenta' : d.data.sex === 'M' ? 'cyan' : 'yellow'})`)
        .style("stroke", "#00ffff")
        .style("stroke-width", 2)
        .style("filter", "url(#hextech-glow)");
        
    // Circuits internes
    nodeGroups.append("path")
        .attr("d", `M 0 ${-size*0.6} L 0 ${size*0.6} M ${-size*0.5} 0 L ${size*0.5} 0`)
        .style("stroke", "rgba(0,255,255,0.6)")
        .style("stroke-width", 1)
        .style("fill", "none")
        .style("pointer-events", "none");
}

// Fonctions pour créer les dégradés et effets
function createDiamondGradients() {
    const defs = d3.select("svg defs");
    if (defs.select("#diamond-gradient-0").node()) return;
    
    for(let i = 0; i < 6; i++) {
        const grad = defs.append("radialGradient").attr("id", `diamond-gradient-${i}`);
        const hue = i * 60;
        grad.append("stop").attr("offset", "0%").attr("stop-color", `hsl(${hue}, 80%, 90%)`);
        grad.append("stop").attr("offset", "50%").attr("stop-color", `hsl(${hue}, 60%, 70%)`);
        grad.append("stop").attr("offset", "100%").attr("stop-color", `hsl(${hue}, 40%, 50%)`);
    }
    
    const filter = defs.append("filter").attr("id", "diamond-glow");
    filter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "coloredBlur");
    const merge = filter.append("feMerge");
    merge.append("feMergeNode").attr("in", "coloredBlur");
    merge.append("feMergeNode").attr("in", "SourceGraphic");
}

function createGalaxyGradients() {
    const defs = d3.select("svg defs");
    if (defs.select("#galaxy-pink").node()) return;
    
    const colors = {pink: "#ff1493", blue: "#4169e1", purple: "#8a2be2"};
    Object.entries(colors).forEach(([name, color]) => {
        const grad = defs.append("radialGradient").attr("id", `galaxy-${name}`);
        grad.append("stop").attr("offset", "0%").attr("stop-color", "#000");
        grad.append("stop").attr("offset", "70%").attr("stop-color", color);
        grad.append("stop").attr("offset", "100%").attr("stop-color", "#000");
    });
    
    const filter = defs.append("filter").attr("id", "galaxy-glow");
    filter.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "glow");
    const merge = filter.append("feMerge");
    merge.append("feMergeNode").attr("in", "glow");
    merge.append("feMergeNode").attr("in", "SourceGraphic");
}

function createBubbleGradients() {
    const defs = d3.select("svg defs");
    if (defs.select("#bubble-pink").node()) return;
    
    const colors = {pink: "#ffb6c1", blue: "#87ceeb", green: "#98fb98"};
    Object.entries(colors).forEach(([name, color]) => {
        const grad = defs.append("radialGradient").attr("id", `bubble-${name}`);
        grad.append("stop").attr("offset", "0%").attr("stop-color", color).attr("stop-opacity", "0.3");
        grad.append("stop").attr("offset", "70%").attr("stop-color", color).attr("stop-opacity", "0.7");
        grad.append("stop").attr("offset", "100%").attr("stop-color", color).attr("stop-opacity", "0.9");
    });
    
    const filter = defs.append("filter").attr("id", "bubble-glow");
    filter.append("feGaussianBlur").attr("stdDeviation", "2").attr("result", "glow");
}

function createHextechGradients() {
    const defs = d3.select("svg defs");
    if (defs.select("#hextech-cyan").node()) return;
    
    const colors = {magenta: "#ff00ff", cyan: "#00ffff", yellow: "#ffff00"};
    Object.entries(colors).forEach(([name, color]) => {
        const grad = defs.append("linearGradient").attr("id", `hextech-${name}`);
        grad.append("stop").attr("offset", "0%").attr("stop-color", "#000");
        grad.append("stop").attr("offset", "50%").attr("stop-color", color).attr("stop-opacity", "0.8");
        grad.append("stop").attr("offset", "100%").attr("stop-color", "#000");
    });
    
    const filter = defs.append("filter").attr("id", "hextech-glow");
    filter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "glow");
    const merge = filter.append("feMerge");
    merge.append("feMergeNode").attr("in", "glow");
    merge.append("feMergeNode").attr("in", "SourceGraphic");
}