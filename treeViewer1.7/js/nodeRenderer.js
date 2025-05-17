// ====================================
// Rendu des nœuds
// ====================================
import { extractYear } from './utils.js';
import { state } from './main.js';
import { addRootChangeButton, addDescendantsControls, addAncestorsControls } from './nodeControls.js';


/**
 * Dessine les nœuds de l'arbre
 * @param {Object} group - Le groupe SVG principal
 * @param {Object} root - La racine de l'arbre
 * @param {Object} treeLayout - La mise en page de l'arbre
 */
export function drawNodes(group, layout) {
    // const nodes = treeLayout(root);

    const nodeGroups = group.selectAll(".node")
        .data(layout.descendants())
        .join("g")
        // .filter(d => !d.data._isDescendantNode)
        // .filter(d => !d.data._isDescendantNode && !d.data.isDescendantContainer) // Ajout du filtre
        .filter(d => !d.data._isDescendantNode && 
            !d.data.isDescendantContainer && 
            !d.data.isVirtualRoot)  

        .attr("class", "node")
        .attr("transform", d => `translate(${d.y},${d.x})`)
        .on("click", function(event, d) {
            // Ajout de l'appel à displayPersonDetails lors du clic
            event.stopPropagation();
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
            .on("click", function(event, d) {
                // Ajout de l'appel à displayPersonDetails lors du clic
                event.stopPropagation();
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
 * Dessine les rectangles des nœuds
 * @private
 */
export function drawNodeBoxes(nodeGroups) {
    // Définir un filtre pour l'ombre portée
    const defs = d3.select("svg").append("defs");
    
    // Créer un filtre pour l'ombre
    const filter = defs.append("filter")
        .attr("id", "drop-shadow")
        .attr("height", "125%"); // Légèrement réduit
    
    // Ajouter les composants du filtre
    filter.append("feGaussianBlur")
        .attr("in", "SourceAlpha")
        .attr("stdDeviation", 2) // Ombre plus fine
        .attr("result", "blur");
        
    filter.append("feOffset")
        .attr("in", "blur")
        .attr("dx", 2) // Décalage horizontal plus petit
        .attr("dy", 2) // Décalage vertical plus petit
        .attr("result", "offsetBlur");
        
    // Contrôler l'opacité de l'ombre
    filter.append("feComponentTransfer")
        .append("feFuncA")
        .attr("type", "linear")
        .attr("slope", "0.5"); // Opacité à 50%
        
    // Fusionner l'original avec l'ombre
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode")
        .attr("in", "offsetBlur");
    feMerge.append("feMergeNode")
        .attr("in", "SourceGraphic");
    
    // Ajouter les rectangles avec effet d'ombre
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
        .attr("rx", 3) // Coins arrondis
        .style("filter", "url(#drop-shadow)") // Appliquer l'ombre
        // Ne pas définir stroke et stroke-width ici pour préserver les styles CSS des classes
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
    if (!data.birthDate && !data.deathDate) return;
    
    const birthYear = data.birthDate ? extractYear(data.birthDate) : '?';
    const deathYear = data.deathDate ? extractYear(data.deathDate) : '?';
    
    let dateText = birthYear;
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

function addControlButtons(nodeGroups) {
    addRootChangeButton(nodeGroups);
    addDescendantsControls(nodeGroups);
    addAncestorsControls(nodeGroups);
}

// Les fonctions pour les boutons de contrôle sont implémentées
// dans le fichier nodeControls.js