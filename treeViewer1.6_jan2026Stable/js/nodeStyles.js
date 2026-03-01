// ====================================
// Styles de nœuds alternatifs pour arbre généalogique
// ====================================

// Import du state depuis main.js (à adapter selon votre structure)
// Supposons que state est disponible globalement ou importé
let state;

// Fonction pour initialiser la référence au state
export function initializeState(stateRef) {
    state = stateRef;
}

/**
 * Configuration des styles de nœuds disponibles
 */
export const NODE_STYLES = {
    CLASSIC: 'classic',           // Rectangles actuels
    HERALDIC: 'heraldic',         // Blasons
    SILHOUETTES: 'silhouettes',   // Silhouettes humaines
    ORGANIC: 'organic'            // Feuilles/fruits
};

/**
 * Initialise tous les filtres et dégradés nécessaires pour les styles de nœuds
 * FONCTION CORRIGÉE - était manquante dans la première version
 */
export function initializeNodeStyleFilters() {
    // Vérifier si les defs existent déjà
    let defs = d3.select("svg defs");
    if (defs.empty()) {
        defs = d3.select("svg").append("defs");
    }
    
    // Créer tous les filtres et dégradés
    createHeraldcGradients();
    createSilhouetteFilters();
    createOrganicFilters();
    createDropShadowFilter();
}

/**
 * Crée le filtre d'ombre portée de base
 */
function createDropShadowFilter() {
    const defs = d3.select("svg defs");
    
    // Supprimer l'ancien filtre s'il existe
    defs.select("#drop-shadow").remove();
    
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
}
/**
 * Dessine les nœuds selon le style configuré
 * @param {Object} nodeGroups - Les groupes de nœuds D3
 * @param {string} style - Style à appliquer (NODE_STYLES)
 * @param {Object} personData - Données de la personne (optionnel)
 */
export function drawStyledNodeBoxes(nodeGroups, style = NODE_STYLES.CLASSIC, personData = null) {
    // Supprimer les anciens éléments graphiques mais garder le texte
    nodeGroups.selectAll("rect, path, circle").remove();
    
    // S'assurer que state est disponible (fallback)
    if (!state) {
        state = {
            boxWidth: 120,
            boxHeight: 60
        };
    }
    
    switch (style) {
        case NODE_STYLES.HERALDIC:
            drawHeraldic(nodeGroups);
            break;
        case NODE_STYLES.SILHOUETTES:
            drawSilhouettes(nodeGroups);
            break;
        case NODE_STYLES.ORGANIC:
            drawOrganic(nodeGroups);
            break;
        default:
            drawClassic(nodeGroups);
    }
}

/**
 * Style classique (rectangles)
 */
function drawClassic(nodeGroups) {
    nodeGroups.append("rect")
        .attr("class", d => getNodeClass(d))
        .attr("x", -state.boxWidth/2)
        .attr("y", -state.boxHeight/2)
        .attr("width", state.boxWidth)
        .attr("height", state.boxHeight)
        .attr("rx", 3)
        .style("filter", "url(#drop-shadow)");
}

/**
 * Style blasons héraldiques
 */
function drawHeraldic(nodeGroups) {
    // Créer des dégradés pour les blasons
    createHeraldcGradients();
    
    nodeGroups.append("path")
        .attr("class", d => getNodeClass(d) + " heraldic")
        .attr("d", createHeraldcPath)
        .style("filter", "url(#drop-shadow)")
        .style("fill", d => getHeraldcColor(d));
        
    // Ajouter une bordure dorée
    nodeGroups.append("path")
        .attr("class", "heraldic-border")
        .attr("d", createHeraldcPath)
        .style("fill", "none")
        .style("stroke", "#DAA520")
        .style("stroke-width", 2);
}

/**
 * Style silhouettes humaines
 */
function drawSilhouettes(nodeGroups) {
    createSilhouetteFilters();
    
    nodeGroups.append("path")
        .attr("class", d => getNodeClass(d) + " silhouette")
        .attr("d", d => createSilhouettePath(d))
        .style("filter", "url(#silhouette-glow)")
        .style("fill", d => getSilhouetteColor(d));
        
    // Ajouter un cercle de base
    nodeGroups.append("circle")
        .attr("class", "silhouette-base")
        .attr("r", state.boxWidth/2 + 5)
        .style("fill", "none")
        .style("stroke", "#333")
        .style("stroke-width", 1)
        .style("opacity", 0.3);
}

/**
 * Style organique (feuilles/fruits)
 */
function drawOrganic(nodeGroups) {
    createOrganicFilters();
    
    nodeGroups.append("path")
        .attr("class", d => getNodeClass(d) + " organic")
        .attr("d", d => createOrganicPath(d))
        .style("filter", "url(#organic-shadow)")
        .style("fill", d => getOrganicColor(d));
        
    // Ajouter des détails organiques (nervures, texture)
    nodeGroups.append("path")
        .attr("class", "organic-details")
        .attr("d", createOrganicDetails)
        .style("stroke", d => getOrganicDetailColor(d))
        .style("stroke-width", 1)
        .style("fill", "none")
        .style("opacity", 0.6);
}

/**
 * Crée le path pour un blason
 */
function createHeraldcPath() {
    const w = state.boxWidth;
    const h = state.boxHeight;
    const halfW = w / 2;
    const halfH = h / 2;
    
    return `M ${-halfW} ${-halfH}
            L ${halfW} ${-halfH}
            L ${halfW} ${halfH * 0.6}
            Q ${halfW} ${halfH} 0 ${halfH}
            Q ${-halfW} ${halfH} ${-halfW} ${halfH * 0.6}
            Z`;
}

/**
 * Crée le path pour une silhouette
 */
function createSilhouettePath(d) {
    const isMan = !d.data.gender || d.data.gender === 'M';
    const scale = Math.min(state.boxWidth, state.boxHeight) / 100;
    
    if (isMan) {
        return createManSilhouette(scale);
    } else {
        return createWomanSilhouette(scale);
    }
}

/**
 * Silhouette masculine
 */
function createManSilhouette(scale) {
    return `M ${-20 * scale} ${-35 * scale}
            C ${-25 * scale} ${-40 * scale} ${-25 * scale} ${-45 * scale} ${-20 * scale} ${-50 * scale}
            C ${-15 * scale} ${-55 * scale} ${15 * scale} ${-55 * scale} ${20 * scale} ${-50 * scale}
            C ${25 * scale} ${-45 * scale} ${25 * scale} ${-40 * scale} ${20 * scale} ${-35 * scale}
            L ${20 * scale} ${-10 * scale}
            L ${30 * scale} ${-5 * scale}
            L ${35 * scale} ${20 * scale}
            L ${25 * scale} ${50 * scale}
            L ${10 * scale} ${50 * scale}
            L ${10 * scale} ${35 * scale}
            L ${-10 * scale} ${35 * scale}
            L ${-10 * scale} ${50 * scale}
            L ${-25 * scale} ${50 * scale}
            L ${-35 * scale} ${20 * scale}
            L ${-30 * scale} ${-5 * scale}
            Z`;
}

/**
 * Silhouette féminine
 */
function createWomanSilhouette(scale) {
    return `M ${-20 * scale} ${-35 * scale}
            C ${-25 * scale} ${-40 * scale} ${-25 * scale} ${-45 * scale} ${-20 * scale} ${-50 * scale}
            C ${-15 * scale} ${-55 * scale} ${15 * scale} ${-55 * scale} ${20 * scale} ${-50 * scale}
            C ${25 * scale} ${-45 * scale} ${25 * scale} ${-40 * scale} ${20 * scale} ${-35 * scale}
            L ${20 * scale} ${-10 * scale}
            L ${35 * scale} ${10 * scale}
            L ${30 * scale} ${25 * scale}
            L ${25 * scale} ${50 * scale}
            L ${10 * scale} ${50 * scale}
            L ${10 * scale} ${35 * scale}
            L ${-10 * scale} ${35 * scale}
            L ${-10 * scale} ${50 * scale}
            L ${-25 * scale} ${50 * scale}
            L ${-30 * scale} ${25 * scale}
            L ${-35 * scale} ${10 * scale}
            Z`;
}

/**
 * Crée le path pour une forme organique
 */
function createOrganicPath(d) {
    const isLeaf = d.depth % 2 === 0; // Alterner feuilles et fruits
    
    if (isLeaf) {
        return createLeafPath();
    } else {
        return createFruitPath();
    }
}

/**
 * Path de feuille
 */
function createLeafPath() {
    const w = state.boxWidth * 0.8;
    const h = state.boxHeight * 0.9;
    
    return `M 0 ${-h/2}
            Q ${w/3} ${-h/3} ${w/2} 0
            Q ${w/3} ${h/3} 0 ${h/2}
            Q ${-w/3} ${h/3} ${-w/2} 0
            Q ${-w/3} ${-h/3} 0 ${-h/2}
            Z`;
}

/**
 * Path de fruit
 */
function createFruitPath() {
    const r = Math.min(state.boxWidth, state.boxHeight) / 2.2;
    
    return `M 0 ${-r}
            C ${r*0.8} ${-r*0.8} ${r*0.8} ${r*0.8} 0 ${r}
            C ${-r*0.8} ${r*0.8} ${-r*0.8} ${-r*0.8} 0 ${-r}
            Z`;
}

/**
 * Détails organiques (nervures, etc.)
 */
function createOrganicDetails(d) {
    if (d.depth % 2 === 0) {
        // Nervures de feuille
        return `M 0 ${-state.boxHeight/2.5}
                L 0 ${state.boxHeight/2.5}
                M ${-state.boxWidth/4} ${-state.boxHeight/4}
                Q 0 0 ${-state.boxWidth/3} ${state.boxHeight/4}
                M ${state.boxWidth/4} ${-state.boxHeight/4}
                Q 0 0 ${state.boxWidth/3} ${state.boxHeight/4}`;
    } else {
        // Texture de fruit
        return `M 0 ${-state.boxHeight/3}
                C ${state.boxWidth/4} ${-state.boxHeight/4} ${state.boxWidth/4} ${state.boxHeight/4} 0 ${state.boxHeight/3}`;
    }
}

/**
 * Couleurs pour les blasons
 */
function getHeraldcColor(d) {
    if (d.data.gender === 'F') return "url(#heraldic-female)";
    if (d.data.gender === 'M') return "url(#heraldic-male)";
    return "url(#heraldic-neutral)";
}

/**
 * Couleurs pour les silhouettes
 */
function getSilhouetteColor(d) {
    if (d.data.gender === 'F') return "#FF69B4";
    if (d.data.gender === 'M') return "#4169E1";
    return "#808080";
}

/**
 * Couleurs pour les formes organiques
 */
function getOrganicColor(d) {
    if (d.depth % 2 === 0) {
        // Feuilles - différentes nuances de vert selon la génération
        const greenShades = ["#228B22", "#32CD32", "#90EE90", "#98FB98"];
        return greenShades[d.depth % greenShades.length];
    } else {
        // Fruits - couleurs chaudes
        const fruitColors = ["#FF6347", "#FF8C00", "#FFD700", "#FF1493"];
        return fruitColors[d.depth % fruitColors.length];
    }
}

/**
 * Couleurs des détails organiques
 */
function getOrganicDetailColor(d) {
    if (d.depth % 2 === 0) {
        return "#006400"; // Vert foncé pour nervures
    } else {
        return "#8B0000"; // Rouge foncé pour texture fruit
    }
}

/**
 * Crée les dégradés pour les blasons
 */
function createHeraldcGradients() {
    const defs = d3.select("svg defs");
    
    // Supprimer les anciens dégradés s'ils existent
    defs.selectAll("#heraldic-male, #heraldic-female, #heraldic-neutral").remove();
    
    // Dégradé masculin (bleu et or)
    const maleGradient = defs.append("linearGradient")
        .attr("id", "heraldic-male")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "0%").attr("y2", "100%");
    
    maleGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#4169E1")
        .attr("stop-opacity", 1);
        
    maleGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#DAA520")
        .attr("stop-opacity", 1);
    
    // Dégradé féminin (rose et argent)
    const femaleGradient = defs.append("linearGradient")
        .attr("id", "heraldic-female")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "0%").attr("y2", "100%");
    
    femaleGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#FF69B4")
        .attr("stop-opacity", 1);
        
    femaleGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#C0C0C0")
        .attr("stop-opacity", 1);
        
    // Dégradé neutre
    const neutralGradient = defs.append("linearGradient")
        .attr("id", "heraldic-neutral")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "0%").attr("y2", "100%");
    
    neutralGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#708090")
        .attr("stop-opacity", 1);
        
    neutralGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#2F4F4F")
        .attr("stop-opacity", 1);
}

/**
 * Crée les filtres pour les silhouettes
 */
function createSilhouetteFilters() {
    const defs = d3.select("svg defs");
    
    // Supprimer l'ancien filtre s'il existe
    defs.select("#silhouette-glow").remove();
    
    const filter = defs.append("filter")
        .attr("id", "silhouette-glow")
        .attr("height", "130%");
    
    filter.append("feGaussianBlur")
        .attr("stdDeviation", "3")
        .attr("result", "coloredBlur");
        
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");
}

/**
 * Crée les filtres pour les formes organiques
 */
function createOrganicFilters() {
    const defs = d3.select("svg defs");
    
    // Supprimer l'ancien filtre s'il existe
    defs.select("#organic-shadow").remove();
    
    const filter = defs.append("filter")
        .attr("id", "organic-shadow")
        .attr("height", "125%");
    
    // Utiliser feDropShadow si disponible, sinon fallback
    if (filter.append("feDropShadow").attr("dx", "2").attr("dy", "2").attr("stdDeviation", "2").attr("flood-color", "#333").attr("flood-opacity", "0.3").node()) {
        // feDropShadow est supporté
    } else {
        // Fallback avec feGaussianBlur + feOffset
        filter.selectAll("*").remove();
        
        filter.append("feGaussianBlur")
            .attr("in", "SourceAlpha")
            .attr("stdDeviation", 2)
            .attr("result", "blur");
            
        filter.append("feOffset")
            .attr("in", "blur")
            .attr("dx", 2)
            .attr("dy", 2)
            .attr("result", "offsetBlur");
            
        filter.append("feFlood")
            .attr("flood-color", "#333")
            .attr("flood-opacity", "0.3")
            .attr("result", "offsetColor");
            
        filter.append("feComposite")
            .attr("in", "offsetColor")
            .attr("in2", "offsetBlur")
            .attr("operator", "in")
            .attr("result", "offsetColorBlur");
            
        const feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode").attr("in", "offsetColorBlur");
        feMerge.append("feMergeNode").attr("in", "SourceGraphic");
    }
}

/**
 * Retourne la classe CSS appropriée pour un nœud
 */
function getNodeClass(d) {
    if (!d.data) return "person-box";
    const classes = ["person-box"];
    if (d.data.isSpouse) classes.push("spouse");
    else if (d.data.isSibling) classes.push("sibling");
    else if (d.data.duplicate) classes.push("duplicate");
    else if (state.rootPersonId && d.data.id === state.rootPersonId) classes.push("root");
    else classes.push("normal");
    return classes.join(" ");
}

// CSS pour les nouveaux styles
export const STYLED_NODES_CSS = `
.node.heraldic path {
    transition: all 0.3s ease;
}

.node.heraldic:hover path {
    transform: scale(1.05);
}

.heraldic-border {
    pointer-events: none;
}

.node.silhouette path {
    transition: all 0.3s ease;
}

.node.silhouette:hover path {
    transform: scale(1.1);
}

.silhouette-base {
    pointer-events: none;
}

.node.organic path {
    transition: all 0.3s ease;
}

.node.organic:hover path {
    transform: scale(1.05) rotate(2deg);
}

.organic-details {
    pointer-events: none;
}
`;