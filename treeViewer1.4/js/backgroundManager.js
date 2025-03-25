// Mapping des images pour chaque période historique précise
const periodImages = {
    // Période antique
    'antiquite': {
        startYear: -800,
        endYear: 481,
        image: 'background_images/antiquite.jpg'
    },
    // Mérovingiens
    'merovingiens': {
        startYear: 481,
        endYear: 751,
        image: 'background_images/merovingiens.jpg'
    },
    // Carolingiens
    'carolingiens': {
        startYear: 751,
        endYear: 987,
        image: 'background_images/carolingiens.jpg'
    },
    // Capétiens
    'capetiens': {
        startYear: 987,
        endYear: 1328,
        image: 'background_images/capetiens.jpg'
    },
    // Valois
    'valois': {
        startYear: 1328,
        endYear: 1589,
        image: 'background_images/valois.jpg'
    },
    // Bourbons
    'bourbons': {
        startYear: 1589,
        endYear: 1792,
        image: 'background_images/bourbons.jpg'
    },
    // Révolution
    'revolution': {
        startYear: 1792,
        endYear: 1804,
        image: 'background_images/revolution.jpg'
    },
    // Empire
    'empire': {
        startYear: 1804,
        endYear: 1814,
        image: 'background_images/empire.jpg'
    },
    // Restauration
    'restauration': {
        startYear: 1814,
        endYear: 1848,
        image: 'background_images/restauration.jpg'
    },
    // Second Empire et République
    'republique': {
        startYear: 1848,
        endYear: 1900,
        image: 'background_images/republique.jpg'
    },
    // Période contemporaine
    'contemporain': {
        startYear: 1900,
        endYear: 2100,
        image: 'background_images/contemporain.jpg'
    }
};

function getImageForYear(year) {
    // Trouver la période correspondant à l'année
    for (const [period, data] of Object.entries(periodImages)) {
        if (year >= data.startYear && year <= (data.endYear || 2100)) {
            return data.image;
        }
    }
    // Image par défaut si aucune période ne correspond
    return periodImages.contemporain.image;
}

let currentImage = null;
let nextImage = null;


export function initBackgroundContainer() {
    // Créer le conteneur s'il n'existe pas
    if (!document.querySelector('.background-container')) {
        const container = document.createElement('div');
        container.className = 'background-container';
        document.body.insertBefore(container, document.body.firstChild);
        console.log("debug0, initBackgroundContainer")    

    }
}


export function updateBackgroundImage(year) {
    console.log("Année reçue:", year);
    const newImageSrc = getImageForYear(year);
    console.log("Image sélectionnée:", newImageSrc);
    
    const container = document.querySelector('.background-container');
    if (!container) {
        return;
    }

    // Créer l'image si elle n'existe pas
    let img = container.querySelector('.background-image');
    if (!img) {
        img = document.createElement('img');
        img.className = 'background-image';
        container.appendChild(img);
    }

    // Définir la source de l'image
    img.src = newImageSrc;
    
    // Forcer l'opacité
    img.style.opacity = '0.15';
    
}




// Fond avec branches d'arbre élégantes - COULEURS RENFORCÉES
function setupTreeBranchesBackground(svg) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const defs = svg.append("defs");
    
    // Nettoyer tout fond existant
    svg.selectAll(".background-element").remove();
    
    // Créer un groupe pour le fond
    const bgGroup = svg.append("g")
        .attr("class", "background-element")
        .attr("pointer-events", "none")
        .lower();
    
    // Fond de base avec gradient plus visible
    const bgGradient = defs.append("linearGradient")
        .attr("id", "branches-bg-gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%");
    
    bgGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#f5f5f5");
    
    bgGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#eaeaea");
    
    bgGroup.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "url(#branches-bg-gradient)")
        .attr("pointer-events", "none")
        .lower();
    
    // Fonction récursive pour dessiner des branches avec couleurs plus visibles
    function drawBranch(startX, startY, length, angle, width, depth) {
        if (depth <= 0 || length < 5) return;
        
        // Calculer le point final
        const endX = startX + Math.cos(angle) * length;
        const endY = startY + Math.sin(angle) * length;
        
        // Dessiner la branche - Couleur plus visible
        bgGroup.append("line")
            .attr("x1", startX)
            .attr("y1", startY)
            .attr("x2", endX)
            .attr("y2", endY)
            .attr("stroke", `rgba(150, 120, 90, ${0.15 + (depth * 0.03)})`) // Couleur brune plus visible
            .attr("stroke-width", width)
            .attr("stroke-linecap", "round");
        
        // Ajouter une feuille aléatoirement avec couleur plus visible
        if (Math.random() < 0.3 && depth < 5) {
            drawLeaf(endX, endY, length * 0.6, angle, depth);
        }
        
        // Calculer les angles et longueurs des sous-branches
        const newLength = length * (0.65 + Math.random() * 0.1);
        const newWidth = width * 0.7;
        
        // Angle de divergence
        const divergence = Math.PI / (4 + Math.random() * 4);
        
        // Récursion pour les branches enfants
        drawBranch(endX, endY, newLength, angle + divergence, newWidth, depth - 1);
        drawBranch(endX, endY, newLength * 0.8, angle - divergence * 1.2, newWidth * 0.8, depth - 1);
        
        // Occasionnellement ajouter une troisième branche
        if (Math.random() < 0.3 && depth > 2) {
            const thirdAngle = angle + (Math.random() < 0.5 ? 1 : -1) * divergence * 0.5;
            drawBranch(endX, endY, newLength * 0.7, thirdAngle, newWidth * 0.7, depth - 2);
        }
    }
    
    // Fonction pour dessiner une feuille avec couleur plus visible
    function drawLeaf(x, y, size, angle, depth) {
        // Rotation pour la feuille
        const leafAngle = angle + (Math.random() - 0.5) * Math.PI / 2;
        
        // Taille de la feuille basée sur la profondeur
        const leafSize = size * (0.3 + Math.random() * 0.2);
        
        // Forme de feuille simple - couleur plus visible
        const leaf = bgGroup.append("path")
            .attr("d", `M ${x} ${y} 
                      Q ${x + Math.cos(leafAngle) * leafSize * 0.5} ${y + Math.sin(leafAngle) * leafSize * 0.5}, 
                        ${x + Math.cos(leafAngle) * leafSize} ${y + Math.sin(leafAngle) * leafSize}
                      Q ${x + Math.cos(leafAngle + 0.5) * leafSize * 0.7} ${y + Math.sin(leafAngle + 0.5) * leafSize * 0.7},
                        ${x} ${y}`)
            .attr("fill", `rgba(100, 150, 100, ${0.15 + (Math.random() * 0.1)})`) // Vert plus visible
            .attr("stroke", `rgba(80, 120, 80, ${0.12})`) // Contour plus visible
            .attr("stroke-width", 0.5);
    }
    
    // Dessiner plusieurs systèmes de branches partant des coins et côtés
    
    // Branches du coin inférieur gauche
    drawBranch(0, height, height * 0.5, -Math.PI/4, 5, 6);
    drawBranch(0, height, height * 0.4, -Math.PI/3, 4, 6);
    
    // Branches du coin inférieur droit
    drawBranch(width, height, height * 0.5, -Math.PI*3/4, 5, 6);
    drawBranch(width, height, height * 0.4, -Math.PI*2/3, 4, 6);
    
    // Branches du bas
    drawBranch(width * 0.3, height, height * 0.4, -Math.PI/2, 4, 5);
    drawBranch(width * 0.7, height, height * 0.4, -Math.PI/2, 4, 5);
    
    // Branches du côté gauche
    drawBranch(0, height * 0.3, width * 0.3, 0, 3, 5);
    drawBranch(0, height * 0.7, width * 0.3, -Math.PI/6, 3, 5);
    
    // Branches du côté droit
    drawBranch(width, height * 0.3, width * 0.3, Math.PI, 3, 5);
    drawBranch(width, height * 0.7, width * 0.3, Math.PI + Math.PI/6, 3, 5);
    
    // Réduire le flou pour plus de netteté
    const filter = defs.append("filter")
        .attr("id", "branches-blur")
        .attr("x", "-10%")
        .attr("y", "-10%")
        .attr("width", "120%")
        .attr("height", "120%");
    
    filter.append("feGaussianBlur")
        .attr("in", "SourceGraphic")
        .attr("stdDeviation", "0.5"); // Flou réduit
    
    bgGroup.attr("filter", "url(#branches-blur)");
}

// Fond avec feuilles tombantes - COULEURS RENFORCÉES
function setupFallingLeavesBackground(svg) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const defs = svg.append("defs");
    
    // Nettoyer tout fond existant
    svg.selectAll(".background-element").remove();
    
    // Créer un groupe pour le fond
    const bgGroup = svg.append("g")
        .attr("class", "background-element")
        .attr("pointer-events", "none")
        .lower();
    
    // Fond de base avec gradient plus visible
    const bgGradient = defs.append("linearGradient")
        .attr("id", "leaves-bg-gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");
    
    bgGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#f5f5f5");
    
    bgGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#e8e8e8");
    
    bgGroup.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "url(#leaves-bg-gradient)")
        .attr("pointer-events", "none")
        .lower();
    
    // Fonction pour créer différentes formes de feuilles
    function createLeafPath(type, size) {
        switch (type) {
            case 0: // Feuille simple arrondie
                return `M 0,0 
                        Q ${size*0.5},${-size*0.5} ${size},0 
                        Q ${size*0.5},${size*0.5} 0,0`;
            case 1: // Feuille ovale
                return `M 0,0 
                        Q ${size*0.4},${-size*0.7} ${size},0 
                        Q ${size*0.4},${size*0.7} 0,0`;
            case 2: // Feuille pointue
                return `M 0,0 
                        L ${size*0.5},${-size*0.6} 
                        L ${size},0 
                        L ${size*0.5},${size*0.6} 
                        Z`;
            case 3: // Feuille de chêne simplifiée
                let path = `M 0,0 `;
                const numLobes = 4;
                for (let i = 0; i < numLobes; i++) {
                    const t = i / (numLobes - 1);
                    const x = size * t;
                    const y1 = -size * 0.3 * Math.sin(t * Math.PI);
                    const y2 = size * 0.3 * Math.sin(t * Math.PI);
                    
                    path += `Q ${x-size*0.1},${y1*1.5} ${x},${y1} `;
                }
                
                path += `L ${size},0 `;
                
                for (let i = numLobes - 1; i >= 0; i--) {
                    const t = i / (numLobes - 1);
                    const x = size * t;
                    const y2 = size * 0.3 * Math.sin(t * Math.PI);
                    
                    path += `Q ${x-size*0.1},${y2*1.5} ${x},${y2} `;
                }
                
                path += "Z";
                return path;
            default:
                return `M 0,0 Q ${size*0.5},${-size*0.5} ${size},0 Q ${size*0.5},${size*0.5} 0,0`;
        }
    }
    
    // Dessiner de nombreuses feuilles tombantes avec couleurs plus visibles
    const numLeaves = width * height / 15000; // Ajuster la densité selon la taille de l'écran
    
    for (let i = 0; i < numLeaves; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 30 + 10; // Taille variable
        const rotation = Math.random() * 360; // Rotation aléatoire
        const leafType = Math.floor(Math.random() * 4); // Différents types de feuilles
        
        // Couleurs plus visibles
        const colorTypes = [
            `rgba(90, 140, 90, ${0.12 + Math.random() * 0.08})`, // Vert
            `rgba(140, 120, 90, ${0.12 + Math.random() * 0.08})`, // Brun
            `rgba(140, 90, 50, ${0.12 + Math.random() * 0.08})`, // Orange-brun
            `rgba(120, 140, 60, ${0.12 + Math.random() * 0.08})`, // Vert-jaune
        ];
        
        const leafColor = colorTypes[Math.floor(Math.random() * colorTypes.length)];
        const leafPath = createLeafPath(leafType, size);
        
        bgGroup.append("path")
            .attr("d", leafPath)
            .attr("transform", `translate(${x},${y}) rotate(${rotation})`)
            .attr("fill", leafColor)
            .attr("stroke", `rgba(100, 100, 80, ${0.1})`)
            .attr("stroke-width", 0.5);
        
        // Ajouter une nervure centrale à certaines feuilles
        if (Math.random() < 0.7) {
            bgGroup.append("path")
                .attr("d", `M 0,0 L ${size},0`)
                .attr("transform", `translate(${x},${y}) rotate(${rotation})`)
                .attr("fill", "none")
                .attr("stroke", `rgba(100, 90, 80, ${0.15})`) // Nervure plus visible
                .attr("stroke-width", 0.7);
        }
    }
    
    // Réduire le flou pour plus de netteté
    const filter = defs.append("filter")
        .attr("id", "leaves-blur")
        .attr("x", "-10%")
        .attr("y", "-10%")
        .attr("width", "120%")
        .attr("height", "120%");
    
    filter.append("feGaussianBlur")
        .attr("in", "SourceGraphic")
        .attr("stdDeviation", "0.3"); // Flou réduit
    
    bgGroup.attr("filter", "url(#leaves-blur)");
}

// Fond avec arbre qui pousse dans le coin - COULEURS RENFORCÉES
function setupGrowingTreeBackground(svg) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const defs = svg.append("defs");
    
    // Nettoyer tout fond existant
    svg.selectAll(".background-element").remove();
    
    // Créer un groupe pour le fond
    const bgGroup = svg.append("g")
        .attr("class", "background-element")
        .attr("pointer-events", "none")
        .lower();
    
    // Fond de base avec gradient subtil mais plus visible 
    const bgGradient = defs.append("linearGradient")
        .attr("id", "growing-tree-bg-gradient")
        .attr("x1", "0%")
        .attr("y1", "100%")
        .attr("x2", "100%")
        .attr("y2", "0%");
    
    bgGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#f5f5f5");
    
    bgGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#e8e8e8");
    
    bgGroup.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "url(#growing-tree-bg-gradient)")
        .attr("pointer-events", "none")
        .lower();
    
    // Fonction pour créer un arbre généré procéduralement avec couleurs plus visibles
    function drawTree(startX, startY, trunkLength, trunkWidth, lean, iterations) {
        const branchGroup = bgGroup.append("g");
        
        // Fonction récursive pour dessiner les branches
        function branch(x, y, length, angle, width, depth) {
            if (depth <= 0 || length < 2 || width < 0.2) return;
            
            // Calculer le point final
            const endX = x + Math.cos(angle) * length;
            const endY = y + Math.sin(angle) * length;
            
            // Dessiner la branche avec couleur plus visible
            branchGroup.append("line")
                .attr("x1", x)
                .attr("y1", y)
                .attr("x2", endX)
                .attr("y2", endY)
                .attr("stroke", `rgba(120, 100, 80, ${0.15 + (depth / iterations) * 0.1})`) // Brun plus visible
                .attr("stroke-width", width)
                .attr("stroke-linecap", "round");
            
            // Probabilité d'ajouter une feuille qui augmente vers les extrémités
            if (depth < iterations * 0.6 && Math.random() < (1 - depth / iterations) * 0.8) {
                const leafSize = length * (0.7 + Math.random() * 0.6);
                const leafAngle = angle + (Math.random() - 0.5) * 0.5;
                
                // Couleurs de feuilles plus visibles
                const leafColors = [
                    `rgba(80, 140, 80, ${0.15 + Math.random() * 0.1})`, // Vert foncé
                    `rgba(100, 150, 100, ${0.15 + Math.random() * 0.1})`, // Vert moyen
                    `rgba(120, 160, 80, ${0.15 + Math.random() * 0.1})`, // Vert-jaune
                ];
                const leafColor = leafColors[Math.floor(Math.random() * leafColors.length)];
                
                branchGroup.append("path")
                    .attr("d", `M ${endX} ${endY} 
                              Q ${endX + Math.cos(leafAngle) * leafSize * 0.5} ${endY + Math.sin(leafAngle) * leafSize * 0.5}, 
                                ${endX + Math.cos(leafAngle) * leafSize} ${endY + Math.sin(leafAngle) * leafSize}
                              Q ${endX + Math.cos(leafAngle + 0.5) * leafSize * 0.6} ${endY + Math.sin(leafAngle + 0.5) * leafSize * 0.6},
                                ${endX} ${endY}`)
                    .attr("fill", leafColor)
                    .attr("stroke", `rgba(80, 120, 80, ${0.1})`)
                    .attr("stroke-width", 0.5);
            }
            
            // Réduction de longueur et largeur pour les branches suivantes
            const branchLengthFactor = 0.65 + Math.random() * 0.2;
            const branchWidthFactor = 0.6 + Math.random() * 0.2;
            
            // Variations d'angle pour les branches enfants
            const angleVariation = Math.PI / 6 + Math.random() * (Math.PI / 4);
            
            // Récursion pour les branches enfants
            const newDepth = depth - 1;
            const newLength = length * branchLengthFactor;
            const newWidth = width * branchWidthFactor;
            
            // Branches à droite
            branch(endX, endY, newLength, angle - angleVariation, newWidth, newDepth);
            
            // Branches à gauche
            branch(endX, endY, newLength, angle + angleVariation, newWidth, newDepth);
            
            // Parfois continuer presque tout droit (tronc principal)
            if (Math.random() < 0.3 + (depth / iterations) * 0.4) {
                const smallVariation = (Math.random() - 0.5) * 0.2;
                branch(endX, endY, newLength * 1.2, angle + smallVariation, newWidth * 1.1, newDepth);
            }
        }
        
        // Démarrer l'arbre avec le tronc
        branch(startX, startY, trunkLength, -Math.PI/2 + lean, trunkWidth, iterations);
        
        return branchGroup;
    }
    
    // Dessiner un grand arbre qui part du coin inférieur gauche
    const mainTree = drawTree(width * 0.1, height * 0.9, height * 0.15, 5, -Math.PI/15, 9);
    
    // Dessiner un arbre plus petit dans le coin inférieur droit
    const smallTree = drawTree(width * 0.9, height * 0.95, height * 0.1, 3, Math.PI/12, 7);
    
    // Dessiner quelques petites pousses ou branches isolées
    for (let i = 0; i < 5; i++) {
        const x = Math.random() * width * 0.8 + width * 0.1;
        const y = Math.random() * height * 0.3 + height * 0.7;
        const size = height * (0.03 + Math.random() * 0.07);
        const angle = -Math.PI/2 + (Math.random() - 0.5) * 0.5;
        
        drawTree(x, y, size, 1 + Math.random() * 2, angle, 4 + Math.floor(Math.random() * 3));
    }
    
    // Réduire le flou pour plus de netteté
    const filter = defs.append("filter")
        .attr("id", "growing-tree-blur")
        .attr("x", "-10%")
        .attr("y", "-10%")
        .attr("width", "120%")
        .attr("height", "120%");
    
    filter.append("feGaussianBlur")
        .attr("in", "SourceGraphic")
        .attr("stdDeviation", "0.5"); // Flou réduit
    
    bgGroup.attr("filter", "url(#growing-tree-blur)");
}


// Fond avec motifs divers pour arbre généalogique 
// Simple fond dégradé amélioré avec couleurs visibles
function setupSimpleBackground(svg) {
    // Supprimer l'ancien fond s'il existe
    svg.select("#background-gradient").remove();
    
    // Créer un dégradé
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
        .attr("id", "background-gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%");
        
    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#e8f0f8"); // Bleu très pâle
        
    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#d5e0e8"); // Bleu-gris pâle
    
    // Appliquer le dégradé comme fond
    svg.append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("fill", "url(#background-gradient)")
        .attr("pointer-events", "none") // Pour que les clics passent à travers
        .lower(); // Mettre en arrière-plan
    
    // Ajouter quelques formes décoratives subtiles mais visibles
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Groupe pour éléments décoratifs
    const decorGroup = svg.append("g")
        .attr("pointer-events", "none")
        .lower();
    
    // Ajouter quelques cercles décoratifs
    for (let i = 0; i < 10; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 100 + 50;
        
        decorGroup.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", size)
            .attr("fill", "none")
            .attr("stroke", `rgba(150, 170, 200, 0.15)`) // Bleu plus visible
            .attr("stroke-width", 1.5);
    }
    
    // Ajouter quelques lignes décoratives
    for (let i = 0; i < 15; i++) {
        const x1 = Math.random() * width;
        const y1 = Math.random() * height;
        const x2 = x1 + (Math.random() - 0.5) * 200;
        const y2 = y1 + (Math.random() - 0.5) * 200;
        
        decorGroup.append("line")
            .attr("x1", x1)
            .attr("y1", y1)
            .attr("x2", x2)
            .attr("y2", y2)
            .attr("stroke", `rgba(140, 160, 190, 0.12)`) // Bleu plus visible
            .attr("stroke-width", Math.random() * 1 + 0.5);
    }
}



// Fond parchemin amélioré avec plus de texture et couleurs visibles
function setupParchmentBackground(svg) {
    const defs = svg.append("defs");
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Fond de base avec couleur parchemin visible
    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#f3ead8") // Couleur parchemin plus visible
        .attr("pointer-events", "none")
        .lower();
    
    // Créer un motif de papier ancien
    const pattern = defs.append("pattern")
        .attr("id", "parchment-pattern")
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", 400)
        .attr("height", 400);
    
    // Grandes variations de couleur
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * 400;
        const y = Math.random() * 400;
        const r = Math.random() * 40 + 10;
        
        pattern.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", r)
            .attr("fill", i % 2 === 0 ? "#e0d0b0" : "#d8c8a8") // Couleurs plus visibles
            .attr("opacity", Math.random() * 0.25 + 0.15); // Opacité plus élevée
    }
    
    // Petites taches pour simuler les fibres du papier
    for (let i = 0; i < 1000; i++) {
        const x = Math.random() * 400;
        const y = Math.random() * 400;
        
        pattern.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", Math.random() * 2)
            .attr("fill", "#c0b090") // Couleur plus visible
            .attr("opacity", Math.random() * 0.3 + 0.1); // Opacité plus élevée
    }
    
    // Ajouter quelques lignes pour simuler des plis
    for (let i = 0; i < 8; i++) {
        const x1 = Math.random() * 400;
        const y1 = Math.random() * 400;
        const x2 = Math.random() * 400;
        const y2 = Math.random() * 400;
        
        pattern.append("line")
            .attr("x1", x1)
            .attr("y1", y1)
            .attr("x2", x2)
            .attr("y2", y2)
            .attr("stroke", "#c8b898") // Couleur plus visible
            .attr("stroke-width", 1.5)
            .attr("opacity", 0.4); // Opacité plus élevée
    }
    
    // Appliquer le motif
    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "url(#parchment-pattern)")
        .attr("pointer-events", "none")
        .lower();
    
    // Ajouter quelques taches de vieillissement
    const stainGroup = svg.append("g")
        .attr("pointer-events", "none")
        .lower();
    
    for (let i = 0; i < 12; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 60 + 20;
        
        stainGroup.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", size)
            .attr("fill", `rgba(180, 160, 120, ${Math.random() * 0.2 + 0.1})`) // Taches plus visibles
            .attr("stroke", "none");
    }
    
    // Vignette subtile autour des bords
    const vignetteGradient = defs.append("radialGradient")
        .attr("id", "vignette-gradient")
        .attr("cx", "50%")
        .attr("cy", "50%")
        .attr("r", "50%")
        .attr("fx", "50%")
        .attr("fy", "50%");
        
    vignetteGradient.append("stop")
        .attr("offset", "70%")
        .attr("stop-color", "#00000000");
        
    vignetteGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#00000044"); // Vignette plus visible
        
    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "url(#vignette-gradient)")
        .attr("pointer-events", "none")
        .lower();
}

// Fond de grille amélioré avec couleurs visibles
function setupGridBackground(svg) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const defs = svg.append("defs");
    
    // Fond de base
    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#f0f0f5") // Fond légèrement bleuté
        .attr("pointer-events", "none")
        .lower();
    
    // Créer un motif de grille plus élégant et visible
    const pattern = defs.append("pattern")
        .attr("id", "grid-pattern")
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", 50)
        .attr("height", 50);
    
    // Lignes horizontales et verticales plus visibles
    pattern.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 50)
        .attr("y2", 0)
        .attr("stroke", "#c8d0e0") // Bleu-gris plus visible
        .attr("stroke-width", 1);
    
    pattern.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", 50)
        .attr("stroke", "#c8d0e0") // Bleu-gris plus visible
        .attr("stroke-width", 1);
    
    // Petit point aux intersections
    pattern.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", 1.5)
        .attr("fill", "#a8b8d0"); // Bleu plus visible
    
    // Appliquer le motif
    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "url(#grid-pattern)")
        .attr("pointer-events", "none")
        .lower();
    
    // Ajouter quelques rectangles décoratifs
    const decorGroup = svg.append("g")
        .attr("pointer-events", "none")
        .lower();
    
    for (let i = 0; i < 8; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 150 + 50;
        
        decorGroup.append("rect")
            .attr("x", x - size/2)
            .attr("y", y - size/2)
            .attr("width", size)
            .attr("height", size)
            .attr("transform", `rotate(${Math.random() * 45}, ${x}, ${y})`)
            .attr("fill", "none")
            .attr("stroke", `rgba(120, 140, 180, 0.15)`) // Bleu plus visible
            .attr("stroke-width", 1.5);
    }
}

// Texture papier améliorée avec couleurs visibles
function setupPaperTextureBackground(svg) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const defs = svg.append("defs");
    
    // Nettoyer tout fond existant
    svg.selectAll(".background-element").remove();
    
    // Créer un groupe pour le fond
    const bgGroup = svg.append("g")
        .attr("class", "background-element")
        .attr("pointer-events", "none")
        .lower();
    
    // Fond de base avec gradient subtil mais visible
    const bgGradient = defs.append("linearGradient")
        .attr("id", "paper-bg-gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%");
        
    bgGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#f7f7f7");
        
    bgGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#efefef");
    
    bgGroup.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "url(#paper-bg-gradient)");
    
    // Créer une texture de papier visible
    const noisePattern = defs.append("pattern")
        .attr("id", "noise-pattern")
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", 200)
        .attr("height", 200);
    
    // Fond du motif
    noisePattern.append("rect")
        .attr("width", 200)
        .attr("height", 200)
        .attr("fill", "transparent");
    
    // Créer une texture plus visible
    for (let i = 0; i < 5000; i++) {
        const x = Math.random() * 200;
        const y = Math.random() * 200;
        const size = Math.random() * 1.2 + 0.3;
        const opacity = Math.random() * 0.1 + 0.04; // Opacité plus élevée
        
        noisePattern.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", size)
            .attr("fill", i % 5 === 0 ? "#aaaaaa" : "#707070") // Couleurs plus visibles
            .attr("opacity", opacity);
    }
    
    // Ajouter quelques lignes/fibres de papier
    for (let i = 0; i < 50; i++) {
        const x1 = Math.random() * 200;
        const y1 = Math.random() * 200;
        const length = Math.random() * 30 + 10;
        const angle = Math.random() * Math.PI * 2;
        const x2 = x1 + Math.cos(angle) * length;
        const y2 = y1 + Math.sin(angle) * length;
        
        noisePattern.append("line")
            .attr("x1", x1)
            .attr("y1", y1)
            .attr("x2", x2)
            .attr("y2", y2)
            .attr("stroke", "#bbbbbb") // Couleur plus visible
            .attr("stroke-width", 0.7)
            .attr("opacity", 0.4); // Opacité plus élevée
    }
    
    // Appliquer le motif de texture
    bgGroup.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "url(#noise-pattern)")
        .attr("pointer-events", "none");
    
    // Ajouter quelques taches de papier plus grandes
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 40 + 20;
        
        bgGroup.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", size)
            .attr("fill", "#e8e8e8")
            .attr("opacity", Math.random() * 0.2 + 0.1);
    }
    
    // Ajouter une vignette légère
    const vignetteGradient = defs.append("radialGradient")
        .attr("id", "paper-vignette")
        .attr("cx", "50%")
        .attr("cy", "50%")
        .attr("r", "70%")
        .attr("fx", "50%")
        .attr("fy", "50%");
        
    vignetteGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#00000000");
        
    vignetteGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#00000033"); // Plus visible
        
    bgGroup.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "url(#paper-vignette)")
        .attr("pointer-events", "none");
}
// Fond avec lignes courbes élégantes et couleurs visibles
function setupCurvedLinesBackground(svg) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const defs = svg.append("defs");
    
    // Nettoyer tout fond existant
    svg.selectAll(".background-element").remove();
    
    // Créer un groupe pour le fond
    const bgGroup = svg.append("g")
        .attr("class", "background-element")
        .attr("pointer-events", "none")
        .lower();
    
    // Fond de base avec gradient doux mais visible
    const bgGradient = defs.append("linearGradient")
        .attr("id", "bg-curved-gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%");
    
    bgGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#f5f5f8"); // Légèrement bleuté
    
    bgGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#ebebf0"); // Légèrement bleuté
    
    bgGroup.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "url(#bg-curved-gradient)");
    
    // Générer plusieurs courbes élégantes avec opacité visible
    const curves = [];
    const numCurves = 8;
    
    // Créer une courbe de Bézier complexe
    function createComplexCurve(startX, startY, width, height, complexity) {
        let path = `M ${startX} ${startY}`;
        
        for (let i = 0; i < complexity; i++) {
            const cp1x = startX + Math.random() * width;
            const cp1y = startY + Math.random() * height;
            const cp2x = startX + Math.random() * width;
            const cp2y = startY + Math.random() * height;
            const x = startX + (i + 1) * (width / complexity);
            const y = startY + Math.random() * height;
            
            path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`;
        }
        
        return path;
    }
    
    // Créer des courbes élégantes traversant l'écran avec couleurs plus visibles
    for (let i = 0; i < numCurves; i++) {
        const startY = (height / (numCurves + 1)) * (i + 1);
        const curveHeight = height * 0.4;
        
        curves.push({
            path: createComplexCurve(0, startY, width, curveHeight, 4),
            color: `rgba(160, 160, 190, ${0.2 + (i * 0.04)})`, // Bleu plus visible
            strokeWidth: 1.5 + Math.random() * 2
        });
    }
    
    // Ajouter quelques courbes verticales pour créer une grille organique
    for (let i = 0; i < numCurves / 2; i++) {
        const startX = (width / ((numCurves / 2) + 1)) * (i + 1);
        const curveWidth = width * 0.2;
        
        curves.push({
            path: createComplexCurve(startX, 0, curveWidth, height, 4)
                .replace(/M (\d+) (\d+)/g, `M ${startX} 0`)
                .replace(/C/g, " C")
                .replace(/,/g, ", "),
            color: `rgba(140, 160, 190, ${0.15 + (i * 0.04)})`, // Bleu plus visible
            strokeWidth: 1.5 + Math.random() * 1.5
        });
    }
    
    // Dessiner les courbes
    curves.forEach(curve => {
        bgGroup.append("path")
            .attr("d", curve.path)
            .attr("fill", "none")
            .attr("stroke", curve.color)
            .attr("stroke-width", curve.strokeWidth)
            .attr("stroke-linecap", "round");
    });
    
    // Ajouter quelques petits cercles décoratifs aux intersections - plus visibles
    for (let i = 0; i < 40; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        
        bgGroup.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", Math.random() * 4 + 2) // Plus grand
            .attr("fill", `rgba(130, 150, 190, ${Math.random() * 0.2 + 0.1})`); // Plus visible
    }
}

// Fond avec motif inspiré des anneaux des arbres - couleurs visibles
function setupTreeRingsBackground(svg) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const defs = svg.append("defs");
    
    // Nettoyer tout fond existant
    svg.selectAll(".background-element").remove();
    
    // Créer un groupe pour le fond
    const bgGroup = svg.append("g")
        .attr("class", "background-element")
        .attr("pointer-events", "none")
        .lower();
    
    // Fond de base avec une couleur légèrement beige
    bgGroup.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#f5f2eb"); // Beige très pâle
    
    // Créer plusieurs centres d'anneaux
    const centers = [];
    const numCenters = 3;
    
    // Positionner les centres en dehors de l'écran pour n'avoir que des portions d'anneaux visibles
    centers.push({ x: -width * 0.2, y: height * 0.7, maxRadius: width * 0.8, color: "#e0d8c8" }); // Plus visible
    centers.push({ x: width * 1.1, y: height * 0.4, maxRadius: width * 0.6, color: "#d8d0c0" }); // Plus visible
    centers.push({ x: width * 0.4, y: -height * 0.2, maxRadius: width * 0.7, color: "#d0c8b8" }); // Plus visible
    
    // Générer les anneaux pour chaque centre avec opacité plus élevée
    centers.forEach(center => {
        // Nombre d'anneaux variable selon le centre
        const numRings = Math.floor(Math.random() * 30) + 40;
        
        // Variation aléatoire de l'épaisseur et des espaces pour un effet naturel
        let currentRadius = 10;
        
        for (let i = 0; i < numRings; i++) {
            const ringWidth = Math.random() * 4 + 2; // Plus épais
            const gapWidth = Math.random() * 2 + 1;
            
            if (currentRadius > center.maxRadius) break;
            
            bgGroup.append("circle")
                .attr("cx", center.x)
                .attr("cy", center.y)
                .attr("r", currentRadius)
                .attr("fill", "none")
                .attr("stroke", center.color)
                .attr("stroke-width", ringWidth)
                .attr("stroke-opacity", 0.15 + (Math.random() * 0.15)); // Plus visible
            
            currentRadius += ringWidth + gapWidth;
        }
    });
    
    // Ajouter quelques lignes radiales pour simuler les fissures - plus visibles
    centers.forEach(center => {
        const numLines = Math.floor(Math.random() * 10) + 5;
        
        for (let i = 0; i < numLines; i++) {
            const angle = Math.random() * Math.PI * 2;
            const endX = center.x + Math.cos(angle) * center.maxRadius;
            const endY = center.y + Math.sin(angle) * center.maxRadius;
            
            bgGroup.append("line")
                .attr("x1", center.x)
                .attr("y1", center.y)
                .attr("x2", endX)
                .attr("y2", endY)
                .attr("stroke", center.color)
                .attr("stroke-width", Math.random() * 2 + 1) // Plus épais
                .attr("stroke-opacity", 0.25); // Plus visible
        }
    });
    
    // Ne pas appliquer de flou pour une meilleure visibilité
}

// Fonction fractal améliorée avec couleurs et plus de visibilité
function setupFractalBackground(svg) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const defs = svg.append("defs");
    
    // Nettoyer tout fond existant
    svg.selectAll(".background-element").remove();
    
    // Créer un groupe pour le fond
    const bgGroup = svg.append("g")
        .attr("class", "background-element")
        .attr("pointer-events", "none")
        .lower();
    
    // Fond de base avec gradient très léger
    const bgGradient = defs.append("linearGradient")
        .attr("id", "fractal-bg-gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%");
    
    bgGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#f6f6f6");
    
    bgGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#f0f0f0");
    
    bgGroup.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "url(#fractal-bg-gradient)");
    
    // Palette de couleurs plus variée et visible
    const colorPalettes = [
        // Palette bleu-vert (teintes froides)
        [
            "rgba(100, 150, 200, opacity)", // Bleu clair
            "rgba(70, 130, 180, opacity)",  // Bleu acier
            "rgba(95, 158, 160, opacity)"   // Bleu-vert
        ],
        // Palette verte-olive (teintes nature)
        [
            "rgba(120, 160, 90, opacity)",  // Vert clair
            "rgba(85, 130, 70, opacity)",   // Vert forêt
            "rgba(110, 140, 60, opacity)"   // Olive
        ],
        // Palette violet-bleu (teintes douces)
        [
            "rgba(150, 130, 190, opacity)", // Lavande
            "rgba(130, 150, 200, opacity)", // Bleu-violet
            "rgba(140, 140, 170, opacity)"  // Mauve
        ],
        // Palette terre (teintes chaudes)
        [
            "rgba(190, 150, 100, opacity)", // Ocre
            "rgba(170, 130, 90, opacity)",  // Brun clair
            "rgba(150, 120, 100, opacity)"  // Taupe
        ]
    ];
    
    // Fonction pour dessiner un arbre fractal coloré et plus visible
    function drawFractalTree(x, y, size, angle, depth, paletteIndex) {
        if (depth === 0 || size < 2) return;
        
        // Palette sélectionnée
        const palette = colorPalettes[paletteIndex];
        
        // Variation de couleur progressive mais plus visible
        let opacity = 0.25 - (depth * 0.025);
        if (opacity < 0.07) opacity = 0.07;
        
        // Sélection de couleur dans la palette avec variation selon la profondeur
        const colorIndex = (depth % 3);
        let strokeColor = palette[colorIndex].replace("opacity", opacity.toString());
        
        // Calculer la nouvelle position avec variation naturelle
        const newX = x + Math.cos(angle) * size * (0.95 + Math.random() * 0.1);
        const newY = y + Math.sin(angle) * size * (0.95 + Math.random() * 0.1);
        
        // Dessiner une ligne avec couleur visible
        bgGroup.append("line")
            .attr("x1", x)
            .attr("y1", y)
            .attr("x2", newX)
            .attr("y2", newY)
            .attr("stroke", strokeColor)
            .attr("stroke-width", Math.max(1.2, depth * 0.8)); // Lignes plus épaisses
        
        // Angle plus naturel avec légère variation
        const splitAngle = Math.PI * (0.18 + Math.random() * 0.04);
        
        // Récursion avec des branches plus naturelles
        const nextSize = size * (0.65 + Math.random() * 0.15);
        
        // Gauche
        drawFractalTree(
            newX, 
            newY, 
            nextSize * (0.9 + Math.random() * 0.2), 
            angle - splitAngle + (Math.random() * 0.1 - 0.05), 
            depth - 1,
            paletteIndex
        );
        
        // Droite
        drawFractalTree(
            newX, 
            newY, 
            nextSize * (0.9 + Math.random() * 0.2), 
            angle + splitAngle + (Math.random() * 0.1 - 0.05), 
            depth - 1,
            paletteIndex
        );
        
        // Parfois ajouter une branche centrale pour plus de densité
        if (Math.random() < 0.4 && depth > 3) {
            const centerAngle = angle + (Math.random() * 0.3 - 0.15);
            drawFractalTree(
                newX, 
                newY, 
                nextSize * 0.8, 
                centerAngle, 
                depth - 2,
                paletteIndex
            );
        }
        
        // Ajouter des "feuilles" ou terminaisons décoratives aux extrémités
        if (depth === 1 && Math.random() < 0.5) {
            // Couleur plus vive pour les feuilles
            let leafOpacity = opacity * 1.3;
            let leafColor = palette[(colorIndex + 1) % 3].replace("opacity", leafOpacity.toString());
            
            // Petit cercle décoratif au bout des branches
            bgGroup.append("circle")
                .attr("cx", newX)
                .attr("cy", newY)
                .attr("r", 1.5 + Math.random() * 1)
                .attr("fill", leafColor);
        }
    }
    
    // Créer une distribution d'arbres avec différentes palettes de couleurs
    
    // 1. Arbres en bas - plus colorés et visibles
    const numTreesBottom = Math.floor(width / 200) + 4;
    const baseSize = 120;
    
    for (let i = 0; i < numTreesBottom; i++) {
        // Position X répartie en bas de l'écran
        const startX = width * (i + 0.5) / numTreesBottom + (Math.random() * 40 - 20);
        const startY = height * 0.98 - (Math.random() * height * 0.05);
        
        // Profondeur variable pour un effet plus naturel
        const treeDepth = 5 + Math.floor(Math.random() * 3);
        
        // Légère variation d'angle - toujours vers le haut
        const baseAngle = -Math.PI/2 + (Math.random() * 0.12 - 0.06);
        
        // Palette de couleur aléatoire
        const paletteIndex = Math.floor(Math.random() * colorPalettes.length);
        
        // Taille variable
        const treeSize = baseSize * (0.8 + Math.random() * 0.4);
        
        drawFractalTree(startX, startY, treeSize, baseAngle, treeDepth, paletteIndex);
    }
    
    // 2. Arbres sur les côtés - teintes différentes
    const numSideTrees = Math.floor(height / 250) + 3; // Un peu plus d'arbres
    
    // Côté gauche - orientation vers la droite
    for (let i = 0; i < numSideTrees; i++) {
        const startX = width * 0.02 + (Math.random() * width * 0.03);
        const startY = height * (i + 1) / (numSideTrees + 1) + (Math.random() * 50 - 25);
        
        const treeDepth = 4 + Math.floor(Math.random() * 3);
        const baseAngle = 0 + (Math.random() * 0.4 - 0.2); // Vers la droite avec variation
        const paletteIndex = Math.floor(Math.random() * colorPalettes.length);
        const treeSize = baseSize * (0.6 + Math.random() * 0.3);
        
        drawFractalTree(startX, startY, treeSize, baseAngle, treeDepth, paletteIndex);
    }
    
    // Côté droit - orientation vers la gauche
    for (let i = 0; i < numSideTrees; i++) {
        const startX = width * 0.98 - (Math.random() * width * 0.03);
        const startY = height * (i + 0.5) / (numSideTrees + 1) + (Math.random() * 50 - 25);
        
        const treeDepth = 4 + Math.floor(Math.random() * 3);
        const baseAngle = Math.PI + (Math.random() * 0.4 - 0.2); // Vers la gauche avec variation
        const paletteIndex = Math.floor(Math.random() * colorPalettes.length);
        const treeSize = baseSize * (0.6 + Math.random() * 0.3);
        
        drawFractalTree(startX, startY, treeSize, baseAngle, treeDepth, paletteIndex);
    }
    
    // 3. Arbres éparpillés dans le fond - plus visibles mais toujours discrets
    const numBackgroundTrees = Math.floor((width * height) / 120000) + 3; // Plus d'arbres de fond
    
    for (let i = 0; i < numBackgroundTrees; i++) {
        // Position aléatoire, distribution plus équilibrée
        const startX = width * 0.15 + Math.random() * width * 0.7;
        const startY = height * 0.1 + Math.random() * height * 0.6; // Répartition plus large
        
        // Profondeur légèrement augmentée pour plus de visibilité
        const treeDepth = 3 + Math.floor(Math.random() * 3);
        
        // Angle aléatoire pour orientation diverse
        const baseAngle = Math.random() * Math.PI * 2;
        
        // Palette aléatoire
        const paletteIndex = Math.floor(Math.random() * colorPalettes.length);
        
        // Taille légèrement augmentée
        const treeSize = baseSize * (0.35 + Math.random() * 0.25);
        
        // Créer l'arbre de fond avec opacité augmentée
        drawFractalTree(startX, startY, treeSize, baseAngle, treeDepth, paletteIndex);
    }

    // Ajouter un groupe de lignes géométriques très fines en arrière-plan pour plus de texture
    for (let i = 0; i < 20; i++) {
        const x1 = Math.random() * width;
        const y1 = Math.random() * height;
        const length = Math.random() * 100 + 50;
        const angle = Math.random() * Math.PI * 2;
        const x2 = x1 + Math.cos(angle) * length;
        const y2 = y1 + Math.sin(angle) * length;
        
        // Sélection de palette aléatoire et couleur
        const paletteIndex = Math.floor(Math.random() * colorPalettes.length);
        const colorIndex = Math.floor(Math.random() * 3);
        const lineColor = colorPalettes[paletteIndex][colorIndex].replace("opacity", "0.07");
        
        bgGroup.append("line")
            .attr("x1", x1)
            .attr("y1", y1)
            .attr("x2", x2)
            .attr("y2", y2)
            .attr("stroke", lineColor)
            .attr("stroke-width", 0.7);
    }
}
// Fond avec motifs organiques et élégants - couleurs visibles
function setupOrganicPatternBackground(svg) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const defs = svg.append("defs");
    
    // Nettoyer tout fond existant
    svg.selectAll(".background-element").remove();
    
    // Créer un groupe pour le fond
    const bgGroup = svg.append("g")
        .attr("class", "background-element")
        .attr("pointer-events", "none")
        .lower();
    
    // Fond de base avec gradient doux
    const bgGradient = defs.append("linearGradient")
        .attr("id", "organic-bg-gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%");
    
    bgGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#f8f9f6"); // Blanc avec teinte vert très légère
    
    bgGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#f0f4f0"); // Blanc cassé avec teinte vert très légère
    
    bgGroup.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "url(#organic-bg-gradient)");
    
    // Palette de couleurs végétales
    const colors = [
        "rgba(90, 140, 90, 0.15)",   // Vert feuille
        "rgba(120, 160, 80, 0.12)",  // Vert clair
        "rgba(70, 120, 70, 0.12)",   // Vert foncé
        "rgba(150, 170, 120, 0.12)", // Vert-gris
        "rgba(180, 200, 150, 0.12)"  // Vert pâle
    ];
    
    // 1. Créer des formes de feuilles
    function drawLeaf(x, y, size, angle, type) {
        // Type de feuille
        if (type === 0) {
            // Feuille simple ovale
            const leaf = bgGroup.append("path")
                .attr("d", `M ${x} ${y} 
                           Q ${x + Math.cos(angle) * size * 0.5} ${y + Math.sin(angle) * size * 0.5}, 
                             ${x + Math.cos(angle) * size} ${y + Math.sin(angle) * size}
                           Q ${x + Math.cos(angle + 0.5) * size * 0.7} ${y + Math.sin(angle + 0.5) * size * 0.7},
                             ${x} ${y}`)
                .attr("fill", colors[Math.floor(Math.random() * colors.length)])
                .attr("stroke", "rgba(70, 100, 70, 0.08)")
                .attr("stroke-width", 0.5);
                
            // Ajouter une nervure centrale
            bgGroup.append("path")
                .attr("d", `M ${x} ${y} L ${x + Math.cos(angle) * size}  ${y + Math.sin(angle) * size}`)
                .attr("fill", "none")
                .attr("stroke", "rgba(70, 100, 70, 0.1)")
                .attr("stroke-width", 0.7);
        } 
        else if (type === 1) {
            // Feuille composée (comme une feuille de fougère)
            const mainStem = bgGroup.append("path")
                .attr("d", `M ${x} ${y} L ${x + Math.cos(angle) * size} ${y + Math.sin(angle) * size}`)
                .attr("fill", "none")
                .attr("stroke", "rgba(70, 100, 70, 0.15)")
                .attr("stroke-width", 0.8);
            
            // Ajouter des folioles de chaque côté
            const numFolioles = Math.floor(size / 15) + 3;
            const folioleSize = size * 0.2;
            
            for (let i = 1; i < numFolioles; i++) {
                const stemPos = i / numFolioles;
                const posX = x + Math.cos(angle) * size * stemPos;
                const posY = y + Math.sin(angle) * size * stemPos;
                
                // Foliole gauche
                bgGroup.append("path")
                    .attr("d", `M ${posX} ${posY} 
                               Q ${posX + Math.cos(angle + Math.PI/2) * folioleSize * 0.5} ${posY + Math.sin(angle + Math.PI/2) * folioleSize * 0.5}, 
                                 ${posX + Math.cos(angle + Math.PI/2) * folioleSize} ${posY + Math.sin(angle + Math.PI/2) * folioleSize}`)
                    .attr("fill", "none")
                    .attr("stroke", colors[Math.floor(Math.random() * colors.length)])
                    .attr("stroke-width", 0.8);
                
                // Foliole droite
                bgGroup.append("path")
                    .attr("d", `M ${posX} ${posY} 
                               Q ${posX + Math.cos(angle - Math.PI/2) * folioleSize * 0.5} ${posY + Math.sin(angle - Math.PI/2) * folioleSize * 0.5}, 
                                 ${posX + Math.cos(angle - Math.PI/2) * folioleSize} ${posY + Math.sin(angle - Math.PI/2) * folioleSize}`)
                    .attr("fill", "none")
                    .attr("stroke", colors[Math.floor(Math.random() * colors.length)])
                    .attr("stroke-width", 0.8);
            }
        }
        else if (type === 2) {
            // Feuille palmée (comme un érable)
            const centerX = x;
            const centerY = y;
            const numLobes = 5;
            
            // Créer le contour de la feuille
            let leafPath = `M ${centerX} ${centerY}`;
            
            for (let i = 0; i < numLobes; i++) {
                const lobeAngle = angle + (i * Math.PI * 2 / numLobes);
                const lobeSize = size * (0.7 + Math.random() * 0.3);
                
                // Point extérieur du lobe
                const tipX = centerX + Math.cos(lobeAngle) * lobeSize;
                const tipY = centerY + Math.sin(lobeAngle) * lobeSize;
                
                // Points de contrôle pour créer la forme du lobe
                const cp1X = centerX + Math.cos(lobeAngle - 0.2) * lobeSize * 0.5;
                const cp1Y = centerY + Math.sin(lobeAngle - 0.2) * lobeSize * 0.5;
                const cp2X = tipX + Math.cos(lobeAngle + Math.PI/2) * lobeSize * 0.3;
                const cp2Y = tipY + Math.sin(lobeAngle + Math.PI/2) * lobeSize * 0.3;
                const cp3X = tipX + Math.cos(lobeAngle - Math.PI/2) * lobeSize * 0.3;
                const cp3Y = tipY + Math.sin(lobeAngle - Math.PI/2) * lobeSize * 0.3;
                const cp4X = centerX + Math.cos(lobeAngle + 0.2) * lobeSize * 0.5;
                const cp4Y = centerY + Math.sin(lobeAngle + 0.2) * lobeSize * 0.5;
                
                // Ajouter ce lobe au chemin
                leafPath += ` C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${tipX} ${tipY}`;
                leafPath += ` C ${cp3X} ${cp3Y}, ${cp4X} ${cp4Y}, ${centerX} ${centerY}`;
            }
            
            // Fermer le chemin
            leafPath += " Z";
            
            // Dessiner la feuille
            bgGroup.append("path")
                .attr("d", leafPath)
                .attr("fill", colors[Math.floor(Math.random() * colors.length)])
                .attr("stroke", "rgba(70, 100, 70, 0.1)")
                .attr("stroke-width", 0.5);
                
            // Ajouter des nervures
            for (let i = 0; i < numLobes; i++) {
                const lobeAngle = angle + (i * Math.PI * 2 / numLobes);
                const lobeSize = size * (0.7 + Math.random() * 0.3);
                
                bgGroup.append("path")
                    .attr("d", `M ${centerX} ${centerY} L ${centerX + Math.cos(lobeAngle) * lobeSize} ${centerY + Math.sin(lobeAngle) * lobeSize}`)
                    .attr("fill", "none")
                    .attr("stroke", "rgba(70, 100, 70, 0.1)")
                    .attr("stroke-width", 0.5);
            }
        }
        else if (type === 3) {
            // Feuille en forme de goutte (comme un tilleul)
            const heartSize = size * 0.8;
            
            bgGroup.append("path")
                .attr("d", `M ${x} ${y} 
                           Q ${x + Math.cos(angle - Math.PI/4) * heartSize}, ${y + Math.sin(angle - Math.PI/4) * heartSize}, 
                             ${x + Math.cos(angle) * heartSize} ${y + Math.sin(angle) * heartSize}
                           Q ${x + Math.cos(angle + Math.PI/4) * heartSize}, ${y + Math.sin(angle + Math.PI/4) * heartSize},
                             ${x} ${y}`)
                .attr("fill", colors[Math.floor(Math.random() * colors.length)])
                .attr("stroke", "rgba(70, 100, 70, 0.1)")
                .attr("stroke-width", 0.5);
                
            // Ajouter une nervure centrale
            bgGroup.append("path")
                .attr("d", `M ${x} ${y} L ${x + Math.cos(angle) * heartSize} ${y + Math.sin(angle) * heartSize}`)
                .attr("fill", "none")
                .attr("stroke", "rgba(70, 100, 70, 0.12)")
                .attr("stroke-width", 0.7);
                
            // Ajouter quelques nervures secondaires
            for (let i = 1; i <= 3; i++) {
                const nervePos = i / 4;
                const posX = x + Math.cos(angle) * heartSize * nervePos;
                const posY = y + Math.sin(angle) * heartSize * nervePos;
                const nerveLength = heartSize * (0.3 - nervePos * 0.1);
                
                // Nervure gauche
                bgGroup.append("path")
                    .attr("d", `M ${posX} ${posY} 
                               Q ${posX + Math.cos(angle + Math.PI/3) * nerveLength * 0.5} ${posY + Math.sin(angle + Math.PI/3) * nerveLength * 0.5},
                                 ${posX + Math.cos(angle + Math.PI/3) * nerveLength} ${posY + Math.sin(angle + Math.PI/3) * nerveLength}`)
                    .attr("fill", "none")
                    .attr("stroke", "rgba(70, 100, 70, 0.08)")
                    .attr("stroke-width", 0.5);
                
                // Nervure droite
                bgGroup.append("path")
                    .attr("d", `M ${posX} ${posY} 
                               Q ${posX + Math.cos(angle - Math.PI/3) * nerveLength * 0.5} ${posY + Math.sin(angle - Math.PI/3) * nerveLength * 0.5},
                                 ${posX + Math.cos(angle - Math.PI/3) * nerveLength} ${posY + Math.sin(angle - Math.PI/3) * nerveLength}`)
                    .attr("fill", "none")
                    .attr("stroke", "rgba(70, 100, 70, 0.08)")
                    .attr("stroke-width", 0.5);
            }
        }
    }
    
    // 2. Créer des petites structures végétales (fleurs, bourgeons)
    function drawFlower(x, y, size) {
        const numPetals = 5 + Math.floor(Math.random() * 3);
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Centre de la fleur
        bgGroup.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", size * 0.2)
            .attr("fill", "rgba(180, 180, 140, 0.15)");
        
        // Pétales
        for (let i = 0; i < numPetals; i++) {
            const angle = (i / numPetals) * Math.PI * 2;
            const petalX = x + Math.cos(angle) * size * 0.5;
            const petalY = y + Math.sin(angle) * size * 0.5;
            
            bgGroup.append("circle")
                .attr("cx", petalX)
                .attr("cy", petalY)
                .attr("r", size * 0.3)
                .attr("fill", color);
        }
    }
    
    // 3. Créer des tiges et branches fines
    function drawStem(x, y, length, angle) {
        // Point de départ
        let currentX = x;
        let currentY = y;
        
        // Créer la tige avec plusieurs segments pour une légère courbure
        let pathData = `M ${currentX} ${currentY}`;
        
        const numSegments = Math.floor(length / 20) + 2;
        const segmentLength = length / numSegments;
        
        for (let i = 1; i <= numSegments; i++) {
            // Légère variation d'angle pour courber naturellement
            angle += (Math.random() - 0.5) * 0.2;
            
            // Calculer le nouveau point
            currentX += Math.cos(angle) * segmentLength;
            currentY += Math.sin(angle) * segmentLength;
            
            // Ajouter au chemin
            pathData += ` L ${currentX} ${currentY}`;
            
            // Parfois ajouter une petite feuille ou fleur
            if (Math.random() < 0.3 && i > 1) {
                if (Math.random() < 0.7) {
                    // Petite feuille
                    const leafSize = 10 + Math.random() * 15;
                    const leafAngle = angle + (Math.random() < 0.5 ? Math.PI/2 : -Math.PI/2);
                    drawLeaf(currentX, currentY, leafSize, leafAngle, Math.floor(Math.random() * 4));
                } else {
                    // Petite fleur
                    const flowerSize = 8 + Math.random() * 10;
                    drawFlower(currentX, currentY, flowerSize);
                }
            }
        }
        
        // Dessiner la tige
        bgGroup.append("path")
            .attr("d", pathData)
            .attr("fill", "none")
            .attr("stroke", "rgba(100, 120, 90, 0.15)")
            .attr("stroke-width", 1.2)
            .attr("stroke-linecap", "round");
    }
    
    // Disposer les éléments végétaux dans l'espace
    
    // 1. Grandes feuilles éparses
    const numLargeLeaves = Math.floor((width * height) / 70000) + 5;
    
    for (let i = 0; i < numLargeLeaves; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = 40 + Math.random() * 60;
        const angle = Math.random() * Math.PI * 2;
        const leafType = Math.floor(Math.random() * 4);
        
        drawLeaf(x, y, size, angle, leafType);
    }
    
    // 2. Tiges avec petites feuilles et fleurs
    const numStems = Math.floor((width * height) / 50000) + 8;
    
    for (let i = 0; i < numStems; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const length = 80 + Math.random() * 120;
        const angle = Math.random() * Math.PI * 2;
        
        drawStem(x, y, length, angle);
    }
    
    // 3. Quelques fleurs isolées
    const numFlowers = Math.floor((width * height) / 100000) + 5;
    
    for (let i = 0; i < numFlowers; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = 15 + Math.random() * 20;
        
        drawFlower(x, y, size);
    }
    
    // 4. Ajouter un léger motif texturé pour simuler du papier avec des fibres végétales
    const textureDensity = Math.floor((width * height) / 500);
    
    for (let i = 0; i < textureDensity; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const length = Math.random() * 10 + 3;
        const angle = Math.random() * Math.PI;
        
        bgGroup.append("line")
            .attr("x1", x)
            .attr("y1", y)
            .attr("x2", x + Math.cos(angle) * length)
            .attr("y2", y + Math.sin(angle) * length)
            .attr("stroke", "rgba(140, 160, 130, 0.05)")
            .attr("stroke-width", 0.5);
    }
}

// Fond avec motifs géométriques Art Déco modernes et élégants - couleurs visibles
function setupArtDecoBackground(svg) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const defs = svg.append("defs");
    
    // Nettoyer tout fond existant
    svg.selectAll(".background-element").remove();
    
    // Créer un groupe pour le fond
    const bgGroup = svg.append("g")
        .attr("class", "background-element")
        .attr("pointer-events", "none")
        .lower();
    
    // Fond de base ivoire très clair
    bgGroup.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#f5f5f0") // Ivoire légèrement visible
        .attr("pointer-events", "none")
        .lower();
    
    // Définir des couleurs Art Déco visibles mais élégantes
    const colors = [
        "rgba(200, 200, 220, 0.25)", // Bleu-gris pâle
        "rgba(190, 190, 210, 0.2)", // Bleu-violet pâle
        "rgba(210, 200, 190, 0.2)", // Beige pâle
        "rgba(200, 210, 200, 0.2)"  // Vert pâle
    ];
    
    // Créer une grille de formes Art Déco
    const gridSize = 150;
    const numRows = Math.ceil(height / gridSize) + 1;
    const numCols = Math.ceil(width / gridSize) + 1;
    
    for (let row = -1; row < numRows; row++) {
        for (let col = -1; col < numCols; col++) {
            const centerX = col * gridSize;
            const centerY = row * gridSize;
            
            // Choisir aléatoirement une forme et une couleur
            const shapeType = Math.floor(Math.random() * 5);
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            switch (shapeType) {
                case 0: // Cercles concentriques
                    for (let i = 3; i > 0; i--) {
                        bgGroup.append("circle")
                            .attr("cx", centerX)
                            .attr("cy", centerY)
                            .attr("r", (gridSize / 3) * i * 0.7)
                            .attr("fill", "none")
                            .attr("stroke", color)
                            .attr("stroke-width", 2); // Plus épais
                    }
                    break;
                
                case 1: // Motif en éventail
                    const fanGroup = bgGroup.append("g")
                        .attr("transform", `translate(${centerX}, ${centerY})`);
                    
                    const numRays = 12;
                    const rayLength = gridSize * 0.6;
                    
                    for (let i = 0; i < numRays; i++) {
                        const angle = (i * Math.PI * 2) / numRays;
                        const x2 = Math.cos(angle) * rayLength;
                        const y2 = Math.sin(angle) * rayLength;
                        
                        fanGroup.append("line")
                            .attr("x1", 0)
                            .attr("y1", 0)
                            .attr("x2", x2)
                            .attr("y2", y2)
                            .attr("stroke", color)
                            .attr("stroke-width", 2); // Plus épais
                    }
                    break;
                
                case 2: // Losanges emboîtés
                    for (let i = 3; i > 0; i--) {
                        const size = (gridSize / 3) * i * 0.7;
                        
                        bgGroup.append("rect")
                            .attr("x", centerX - size)
                            .attr("y", centerY - size)
                            .attr("width", size * 2)
                            .attr("height", size * 2)
                            .attr("transform", `rotate(45, ${centerX}, ${centerY})`)
                            .attr("fill", "none")
                            .attr("stroke", color)
                            .attr("stroke-width", 2); // Plus épais
                    }
                    break;
                
                case 3: // Motif chevron
                    const chevronGroup = bgGroup.append("g")
                        .attr("transform", `translate(${centerX}, ${centerY})`);
                    
                    for (let i = 0; i < 3; i++) {
                        const size = gridSize * 0.3 * (i + 1);
                        
                        chevronGroup.append("path")
                            .attr("d", `M ${-size} ${0} L ${0} ${-size} L ${size} ${0}`)
                            .attr("fill", "none")
                            .attr("stroke", color)
                            .attr("stroke-width", 2); // Plus épais
                        
                        chevronGroup.append("path")
                            .attr("d", `M ${-size} ${0} L ${0} ${size} L ${size} ${0}`)
                            .attr("fill", "none")
                            .attr("stroke", color)
                            .attr("stroke-width", 2); // Plus épais
                    }
                    break;
                    
                case 4: // Octogones concentriques
                    function createOctagon(cx, cy, radius) {
                        const points = [];
                        for (let i = 0; i < 8; i++) {
                            const angle = i * Math.PI / 4;
                            points.push([
                                cx + radius * Math.cos(angle),
                                cy + radius * Math.sin(angle)
                            ]);
                        }
                        
                        return points.map((p, i) => 
                            (i === 0 ? "M" : "L") + p[0] + "," + p[1]
                        ).join(" ") + "Z";
                    }
                    
                    for (let i = 3; i > 0; i--) {
                        bgGroup.append("path")
                            .attr("d", createOctagon(centerX, centerY, (gridSize / 3) * i * 0.6))
                            .attr("fill", "none")
                            .attr("stroke", color)
                            .attr("stroke-width", 2); // Plus épais
                    }
                    break;
            }
        }
    }
    
    // Superposer quelques grandes formes géométriques plus visibles
    for (let i = 0; i < 5; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 300 + 200;
        
        bgGroup.append("rect")
            .attr("x", x - size / 2)
            .attr("y", y - size / 2)
            .attr("width", size)
            .attr("height", size)
            .attr("transform", `rotate(${Math.random() * 45}, ${x}, ${y})`)
            .attr("fill", "none")
            .attr("stroke", "rgba(170, 170, 190, 0.2)") // Couleur plus visible
            .attr("stroke-width", 2.5); // Plus épais
    }
    
    // Ne pas appliquer de flou pour une meilleure visibilité
}

// Fond inspiré de Jackson Pollock (dripping)
function setupPollockBackground(svg) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const defs = svg.append("defs");
    
    // Nettoyer tout fond existant
    svg.selectAll(".background-element").remove();
    
    // Créer un groupe pour le fond
    const bgGroup = svg.append("g")
        .attr("class", "background-element")
        .attr("pointer-events", "none")
        .lower();
    
    // Fond de base blanc cassé
    bgGroup.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#f5f5f0");
    
    // Palettes de couleurs inspirées de Pollock
    const colors = [
        "rgba(0, 0, 0, 0.1)",      // Noir
        "rgba(150, 80, 20, 0.08)",  // Brun
        "rgba(180, 30, 20, 0.08)",  // Rouge
        "rgba(50, 90, 160, 0.08)",  // Bleu
        "rgba(210, 180, 50, 0.08)"  // Jaune
    ];
    
    // Créer l'effet dripping - lignes fines
    for (let i = 0; i < Math.floor(width / 15); i++) {
        // Point de départ aléatoire
        const startX = Math.random() * width;
        const startY = Math.random() * height;
        
        // Créer un chemin avec plusieurs segments pour simuler une éclaboussure
        let pathData = `M ${startX} ${startY}`;
        
        // Longueur variable du trait
        const segments = 5 + Math.floor(Math.random() * 15);
        let currentX = startX;
        let currentY = startY;
        
        for (let j = 0; j < segments; j++) {
            // Calculer le prochain point avec une légère déviation
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 50 + 10;
            
            currentX += Math.cos(angle) * distance;
            currentY += Math.sin(angle) * distance;
            
            // Ajouter au chemin
            pathData += ` L ${currentX} ${currentY}`;
        }
        
        // Dessiner le trait avec épaisseur variable
        const color = colors[Math.floor(Math.random() * colors.length)];
        const thickness = Math.random() * 2 + 0.5;
        
        bgGroup.append("path")
            .attr("d", pathData)
            .attr("fill", "none")
            .attr("stroke", color)
            .attr("stroke-width", thickness)
            .attr("stroke-linecap", "round")
            .attr("stroke-linejoin", "round");
    }
    
    // Créer l'effet dripping - éclaboussures
    for (let i = 0; i < Math.floor(width / 60); i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 30 + 5;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Forme irrégulière pour l'éclaboussure
        const splatter = bgGroup.append("g")
            .attr("transform", `translate(${x}, ${y})`);
        
        // Créer plusieurs cercles pour former une éclaboussure
        const numDrops = Math.floor(Math.random() * 8) + 3;
        for (let j = 0; j < numDrops; j++) {
            const dropAngle = Math.random() * Math.PI * 2;
            const dropDistance = Math.random() * (size * 0.8);
            const dropX = Math.cos(dropAngle) * dropDistance;
            const dropY = Math.sin(dropAngle) * dropDistance;
            const dropSize = Math.random() * (size * 0.4) + (size * 0.1);
            
            splatter.append("circle")
                .attr("cx", dropX)
                .attr("cy", dropY)
                .attr("r", dropSize)
                .attr("fill", color);
        }
        
        // Ajouter un cercle central
        splatter.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", size * 0.5)
            .attr("fill", color);
    }
}

// Fond inspiré de Wassily Kandinsky (formes géométriques colorées)
function setupKandinskyBackground(svg) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const defs = svg.append("defs");
    
    // Nettoyer tout fond existant
    svg.selectAll(".background-element").remove();
    
    // Créer un groupe pour le fond
    const bgGroup = svg.append("g")
        .attr("class", "background-element")
        .attr("pointer-events", "none")
        .lower();
    
    // Fond de base ivoire très clair
    bgGroup.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#fafaf7");
    
    // Palettes de couleurs inspirées de Kandinsky (couleurs primaires + noir)
    const colors = [
        "rgba(30, 60, 110, 0.1)",   // Bleu
        "rgba(190, 30, 45, 0.1)",   // Rouge
        "rgba(250, 200, 10, 0.1)",  // Jaune
        "rgba(30, 110, 40, 0.1)",   // Vert
        "rgba(40, 40, 40, 0.15)"    // Noir
    ];
    
    // 1. Ajouter des cercles, cœur du style Kandinsky
    for (let i = 0; i < Math.floor(width / 100) + 5; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 80 + 20;
        
        // Cercle principal
        bgGroup.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", size)
            .attr("fill", "none")
            .attr("stroke", colors[Math.floor(Math.random() * colors.length)])
            .attr("stroke-width", Math.random() * 2 + 1);
        
        // Parfois ajouter des cercles concentriques
        if (Math.random() < 0.5) {
            bgGroup.append("circle")
                .attr("cx", x)
                .attr("cy", y)
                .attr("r", size * 0.7)
                .attr("fill", "none")
                .attr("stroke", colors[Math.floor(Math.random() * colors.length)])
                .attr("stroke-width", Math.random() * 1.5 + 0.5);
        }
        
        // Parfois ajouter un petit cercle coloré au centre
        if (Math.random() < 0.4) {
            bgGroup.append("circle")
                .attr("cx", x)
                .attr("cy", y)
                .attr("r", size * 0.2)
                .attr("fill", colors[Math.floor(Math.random() * colors.length)]);
        }
    }
    
    // 2. Ajouter des lignes droites traversant l'espace
    for (let i = 0; i < Math.floor(width / 120) + 8; i++) {
        // Lignes traversant tout l'écran
        const y = Math.random() * height;
        
        bgGroup.append("line")
            .attr("x1", 0)
            .attr("y1", y)
            .attr("x2", width)
            .attr("y2", y + (Math.random() * height * 0.4 - height * 0.2))
            .attr("stroke", colors[Math.floor(Math.random() * colors.length)])
            .attr("stroke-width", Math.random() * 1.5 + 0.5);
    }
    
    // 3. Ajouter quelques grilles et formes géométriques
    for (let i = 0; i < Math.floor(width / 200) + 3; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 100 + 30;
        
        // Choisir une forme aléatoire
        const shapeType = Math.floor(Math.random() * 4);
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        switch (shapeType) {
            case 0: // Triangle
                const x1 = x;
                const y1 = y - size * 0.866;
                const x2 = x - size * 0.5;
                const y2 = y + size * 0.433;
                const x3 = x + size * 0.5;
                const y3 = y + size * 0.433;
                
                bgGroup.append("path")
                    .attr("d", `M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} Z`)
                    .attr("fill", "none")
                    .attr("stroke", color)
                    .attr("stroke-width", Math.random() * 1.5 + 0.8);
                break;
                
            case 1: // Carré/Rectangle
                bgGroup.append("rect")
                    .attr("x", x - size/2)
                    .attr("y", y - size/2)
                    .attr("width", size)
                    .attr("height", size)
                    .attr("fill", "none")
                    .attr("stroke", color)
                    .attr("stroke-width", Math.random() * 1.5 + 0.8);
                break;
                
            case 2: // Grille
                const gridSize = 4;
                const cellSize = size / gridSize;
                
                for (let j = 0; j < gridSize; j++) {
                    bgGroup.append("line")
                        .attr("x1", x - size/2)
                        .attr("y1", y - size/2 + j * cellSize)
                        .attr("x2", x + size/2)
                        .attr("y2", y - size/2 + j * cellSize)
                        .attr("stroke", color)
                        .attr("stroke-width", Math.random() * 1 + 0.5);
                    
                    bgGroup.append("line")
                        .attr("x1", x - size/2 + j * cellSize)
                        .attr("y1", y - size/2)
                        .attr("x2", x - size/2 + j * cellSize)
                        .attr("y2", y + size/2)
                        .attr("stroke", color)
                        .attr("stroke-width", Math.random() * 1 + 0.5);
                }
                break;
                
            case 3: // Étoile
                let starPoints = '';
                const numPoints = 5;
                const outerRadius = size / 2;
                const innerRadius = size / 4;
                
                for (let j = 0; j < numPoints * 2; j++) {
                    const angle = (Math.PI * j) / numPoints;
                    const radius = j % 2 === 0 ? outerRadius : innerRadius;
                    const px = x + Math.cos(angle) * radius;
                    const py = y + Math.sin(angle) * radius;
                    
                    starPoints += (j === 0 ? 'M ' : ' L ') + px + ' ' + py;
                }
                
                bgGroup.append("path")
                    .attr("d", starPoints + ' Z')
                    .attr("fill", "none")
                    .attr("stroke", color)
                    .attr("stroke-width", Math.random() * 1.5 + 0.8);
                break;
        }
    }
}

// Fond inspiré de Joan Miró (formes organiques et colorées)
function setupMiroBackground(svg) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const defs = svg.append("defs");
    
    // Nettoyer tout fond existant
    svg.selectAll(".background-element").remove();
    
    // Créer un groupe pour le fond
    const bgGroup = svg.append("g")
        .attr("class", "background-element")
        .attr("pointer-events", "none")
        .lower();
    
    // Fond de base blanc chaud très clair
    bgGroup.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#fffdf7");
    
    // Palettes de couleurs inspirées de Miró
    const colors = [
        "rgba(240, 30, 40, 0.12)",  // Rouge
        "rgba(20, 60, 120, 0.12)",   // Bleu
        "rgba(250, 220, 10, 0.12)",  // Jaune
        "rgba(40, 180, 30, 0.12)",   // Vert
        "rgba(30, 30, 30, 0.15)"     // Noir
    ];
    
    // 1. Formes organiques aléatoires - caractéristiques de Miró
    for (let i = 0; i < Math.floor(width / 120) + 6; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 60 + 20;
        
        // Forme amoeba (blobby)
        const numPoints = Math.floor(Math.random() * 5) + 6;
        let pathData = '';
        
        for (let j = 0; j < numPoints; j++) {
            const angle = (j / numPoints) * Math.PI * 2;
            const radius = size * (0.7 + Math.random() * 0.6);
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            
            pathData += (j === 0 ? 'M ' : ' L ') + px + ' ' + py;
        }
        
        // Fermer le chemin
        pathData += ' Z';
        
        // Choisir entre une forme pleine ou juste un contour
        const fillOrStroke = Math.random();
        
        if (fillOrStroke < 0.5) {
            // Forme pleine avec une couleur
            bgGroup.append("path")
                .attr("d", pathData)
                .attr("fill", colors[Math.floor(Math.random() * colors.length)])
                .attr("stroke", "none");
        } else {
            // Contour avec une autre couleur
            bgGroup.append("path")
                .attr("d", pathData)
                .attr("fill", "none")
                .attr("stroke", colors[Math.floor(Math.random() * colors.length)])
                .attr("stroke-width", Math.random() * 2 + 1);
        }
    }
    
    // 2. Lignes fines - élément signature de Miró
    for (let i = 0; i < Math.floor(width / 60) + 10; i++) {
        const x1 = Math.random() * width;
        const y1 = Math.random() * height;
        const length = Math.random() * 150 + 50;
        const angle = Math.random() * Math.PI * 2;
        
        // Calculer le point final avec une légère courbure
        const x2 = x1 + Math.cos(angle) * length;
        const y2 = y1 + Math.sin(angle) * length;
        
        // Point de contrôle pour la courbe
        const cpx = (x1 + x2) / 2 + (Math.random() * 50 - 25);
        const cpy = (y1 + y2) / 2 + (Math.random() * 50 - 25);
        
        // Dessiner une ligne courbe fine
        bgGroup.append("path")
            .attr("d", `M ${x1} ${y1} Q ${cpx} ${cpy}, ${x2} ${y2}`)
            .attr("fill", "none")
            .attr("stroke", colors[Math.floor(Math.random() * colors.length)])
            .attr("stroke-width", Math.random() * 1.2 + 0.6);
    }
    
    // 3. Étoiles et formes solaires - motifs emblématiques de Miró
    for (let i = 0; i < Math.floor(width / 220) + 3; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 40 + 15;
        
        // Type de forme
        const shapeType = Math.floor(Math.random() * 3);
        
        switch (shapeType) {
            case 0: // Étoile simplifiée
                let starPoints = '';
                const numRays = Math.floor(Math.random() * 5) + 4;
                
                for (let j = 0; j < numRays; j++) {
                    const angle = (j / numRays) * Math.PI * 2;
                    const inner = size * 0.4;
                    const outer = size;
                    
                    // Point externe
                    const x1 = x + Math.cos(angle) * outer;
                    const y1 = y + Math.sin(angle) * outer;
                    
                    // Dessiner une ligne simple pour chaque rayon
                    bgGroup.append("line")
                        .attr("x1", x)
                        .attr("y1", y)
                        .attr("x2", x1)
                        .attr("y2", y1)
                        .attr("stroke", colors[4]) // Noir pour les lignes
                        .attr("stroke-width", Math.random() * 1.5 + 0.7);
                }
                
                // Cercle central
                bgGroup.append("circle")
                    .attr("cx", x)
                    .attr("cy", y)
                    .attr("r", size * 0.2)
                    .attr("fill", colors[Math.floor(Math.random() * 3)]); // Rouge, bleu ou jaune
                break;
                
            case 1: // Forme soleil
                // Disque central
                bgGroup.append("circle")
                    .attr("cx", x)
                    .attr("cy", y)
                    .attr("r", size * 0.5)
                    .attr("fill", colors[2]); // Jaune
                
                // Rayons
                const numSunRays = Math.floor(Math.random() * 6) + 6;
                for (let j = 0; j < numSunRays; j++) {
                    const angle = (j / numSunRays) * Math.PI * 2;
                    const x1 = x + Math.cos(angle) * size * 0.6;
                    const y1 = y + Math.sin(angle) * size * 0.6;
                    const x2 = x + Math.cos(angle) * size;
                    const y2 = y + Math.sin(angle) * size;
                    
                    bgGroup.append("line")
                        .attr("x1", x1)
                        .attr("y1", y1)
                        .attr("x2", x2)
                        .attr("y2", y2)
                        .attr("stroke", colors[4]) // Noir
                        .attr("stroke-width", Math.random() * 1.2 + 0.6);
                }
                break;
                
            case 2: // Points avec cercles concentriques
                // Point central
                bgGroup.append("circle")
                    .attr("cx", x)
                    .attr("cy", y)
                    .attr("r", Math.random() * 5 + 2)
                    .attr("fill", colors[Math.floor(Math.random() * colors.length)]);
                
                // Cercles concentriques
                const numRings = Math.floor(Math.random() * 3) + 1;
                for (let j = 0; j < numRings; j++) {
                    const ringRadius = size * (0.3 + j * 0.3);
                    
                    bgGroup.append("circle")
                        .attr("cx", x)
                        .attr("cy", y)
                        .attr("r", ringRadius)
                        .attr("fill", "none")
                        .attr("stroke", colors[Math.floor(Math.random() * colors.length)])
                        .attr("stroke-width", Math.random() * 1.5 + 0.5);
                }
                break;
        }
    }
}

// Fonction pour créer un parchemin amélioré qui fonctionne
function setupParchmentBackgroundFixed(svg) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const defs = svg.append("defs");
    
    // Nettoyer tout fond existant
    svg.selectAll(".background-element").remove();
    
    // Créer un groupe pour le fond
    const bgGroup = svg.append("g")
        .attr("class", "background-element")
        .attr("pointer-events", "none")
        .lower();
    
    // Fond de base avec couleur parchemin
    bgGroup.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#f3ead8");
    
    // Créer la texture du parchemin
    // 1. Grandes variations de couleur - taches plus larges
    for (let i = 0; i < 80; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = Math.random() * 100 + 30;
        
        bgGroup.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", r)
            .attr("fill", i % 2 === 0 ? "#e0d0b0" : "#d8c8a8")
            .attr("opacity", Math.random() * 0.3 + 0.15);
    }
    
    // 2. Petites taches pour simuler les fibres du papier
    for (let i = 0; i < 3000; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = Math.random() * 2;
        
        bgGroup.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", r)
            .attr("fill", "#c0b090")
            .attr("opacity", Math.random() * 0.3 + 0.1);
    }
    
    // 3. Ajouter quelques lignes pour simuler des plis
    for (let i = 0; i < 10; i++) {
        const x1 = Math.random() * width;
        const y1 = Math.random() * height;
        const angle = Math.random() * Math.PI;
        const length = Math.random() * Math.min(width, height) * 0.8;
        const x2 = x1 + Math.cos(angle) * length;
        const y2 = y1 + Math.sin(angle) * length;
        
        bgGroup.append("line")
            .attr("x1", x1)
            .attr("y1", y1)
            .attr("x2", x2)
            .attr("y2", y2)
            .attr("stroke", "#c8b898")
            .attr("stroke-width", 1.5)
            .attr("opacity", 0.4);
    }
    
    // 4. Ajouter quelques taches de vieillissement
    for (let i = 0; i < 15; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 60 + 20;
        
        bgGroup.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", size)
            .attr("fill", `rgba(180, 160, 120, ${Math.random() * 0.2 + 0.1})`)
            .attr("stroke", "none");
    }
    
    // 5. Appliquer une vignette autour des bords pour un effet vintage
    const vignetteGradient = defs.append("radialGradient")
        .attr("id", "parchment-vignette")
        .attr("cx", "50%")
        .attr("cy", "50%")
        .attr("r", "70%")
        .attr("fx", "50%")
        .attr("fy", "50%");
        
    vignetteGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "rgba(0, 0, 0, 0)");
        
    vignetteGradient.append("stop")
        .attr("offset", "85%")
        .attr("stop-color", "rgba(0, 0, 0, 0)");
        
    vignetteGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "rgba(0, 0, 0, 0.25)");
        
    bgGroup.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "url(#parchment-vignette)");
}

// Fonction pour créer une grille améliorée qui fonctionne
function setupGridBackgroundFixed(svg) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const defs = svg.append("defs");
    
    // Nettoyer tout fond existant
    svg.selectAll(".background-element").remove();
    
    // Créer un groupe pour le fond
    const bgGroup = svg.append("g")
        .attr("class", "background-element")
        .attr("pointer-events", "none")
        .lower();
    
    // Fond de base légèrement bleuté
    bgGroup.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#f0f0f5");
    
    // Taille de la grille
    const gridSize = 50;
    
    // Dessiner les lignes horizontales
    for (let y = 0; y <= height; y += gridSize) {
        bgGroup.append("line")
            .attr("x1", 0)
            .attr("y1", y)
            .attr("x2", width)
            .attr("y2", y)
            .attr("stroke", "#c8d0e0")
            .attr("stroke-width", 1);
    }
    
    // Dessiner les lignes verticales
    for (let x = 0; x <= width; x += gridSize) {
        bgGroup.append("line")
            .attr("x1", x)
            .attr("y1", 0)
            .attr("x2", x)
            .attr("y2", height)
            .attr("stroke", "#c8d0e0")
            .attr("stroke-width", 1);
    }
    
    // Ajouter un point aux intersections
    for (let x = 0; x <= width; x += gridSize) {
        for (let y = 0; y <= height; y += gridSize) {
            bgGroup.append("circle")
                .attr("cx", x)
                .attr("cy", y)
                .attr("r", 1.5)
                .attr("fill", "#a8b8d0");
        }
    }
    
    // Ajouter quelques rectangles décoratifs
    for (let i = 0; i < 8; i++) {
        const x = Math.floor(Math.random() * (width / gridSize)) * gridSize;
        const y = Math.floor(Math.random() * (height / gridSize)) * gridSize;
        const w = Math.floor(Math.random() * 3 + 1) * gridSize;
        const h = Math.floor(Math.random() * 3 + 1) * gridSize;
        
        bgGroup.append("rect")
            .attr("x", x)
            .attr("y", y)
            .attr("width", w)
            .attr("height", h)
            .attr("fill", "none")
            .attr("stroke", "rgba(120, 140, 180, 0.2)")
            .attr("stroke-width", 1.5);
    }
}

// Mettre à jour la fonction setupElegantBackground pour inclure les nouveaux fonds
export function setupElegantBackground(svg) {
  // Vérifier si une préférence est sauvegardée
  const savedBackground = localStorage.getItem('preferredBackground');
  
  if (savedBackground) {
    // Appliquer le fond sauvegardé
    switch (savedBackground) {
      case 'pollock':
        setupPollockBackground(svg);
        break;
      case 'kandinsky':
        setupKandinskyBackground(svg);
        break;
      case 'miro':
        setupMiroBackground(svg);
        break;
      case 'treeBranches':
        setupTreeBranchesBackground(svg);
        break;
      case 'fallingLeaves':
        setupFallingLeavesBackground(svg);
        break;
      case 'growingTree':
        setupGrowingTreeBackground(svg);
        break;
      case 'simpleBackground':
        setupSimpleBackground(svg);
        break;
      case 'parchment':
        // Utiliser la version fixée
        setupParchmentBackgroundFixed(svg);
        break;
      case 'grid':
        // Utiliser la version fixée
        setupGridBackgroundFixed(svg);
        break;
      case 'paperTexture':
        setupPaperTextureBackground(svg);
        break;
      case 'curvedLines':
        setupCurvedLinesBackground(svg);
        break;
      case 'treeRings':
        setupTreeRingsBackground(svg);
        break;
      case 'fractal':
        setupFractalBackground(svg);
        break;
      case 'organicPattern':
        setupOrganicPatternBackground(svg);
        break;
      case 'artDeco':
        setupArtDecoBackground(svg);
        break;
      case 'none':
        // Ne rien faire, pas de fond
        break;
      default:
        // Fallback sur un fond par défaut
        setupTreeBranchesBackground(svg);
    }
  } else {
    // Comportement par défaut si aucune préférence n'est sauvegardée
    setupTreeBranchesBackground(svg);
  }
}



// Fonction pour configurer un fond avec une image personnalisée
function setupCustomImageBackground(svg, imagePath) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const defs = svg.append("defs");
    
    // Nettoyer tout fond existant
    svg.selectAll(".background-element").remove();
    
    // Créer un groupe pour le fond
    const bgGroup = svg.append("g")
        .attr("class", "background-element")
        .attr("pointer-events", "none")
        .lower();
    
    // Ajouter une image de fond
    const image = document.createElement('img');
    image.onload = function() {
        // Créer un motif avec l'image
        const pattern = defs.append("pattern")
            .attr("id", "custom-bg-image")
            .attr("patternUnits", "userSpaceOnUse")
            .attr("width", width)
            .attr("height", height)
            .attr("preserveAspectRatio", "xMidYMid slice");
        
        pattern.append("image")
            .attr("xlink:href", imagePath)
            .attr("width", width)
            .attr("height", height)
            .attr("preserveAspectRatio", "xMidYMid slice");
        
        // Dessiner le rectangle avec le motif d'image
        bgGroup.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "url(#custom-bg-image)")
            .attr("opacity", 0.15); // Opacité réduite pour ne pas masquer l'arbre
    };
    
    // Gérer les erreurs de chargement
    image.onerror = function() {
        console.error(`Impossible de charger l'image: ${imagePath}`);
        // Afficher un rectangle blanc en cas d'erreur
        bgGroup.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "#ffffff");
    };
    
    // Démarrer le chargement de l'image
    image.src = imagePath;
}

// Exporter la fonction
export { setupCustomImageBackground };


// Ne pas oublier d'ajouter ces fonctions à l'export
export {
    setupTreeBranchesBackground, 
    setupFallingLeavesBackground, 
    setupGrowingTreeBackground,
    setupSimpleBackground,
    setupParchmentBackgroundFixed,
    setupGridBackgroundFixed,
    setupPaperTextureBackground,
    setupCurvedLinesBackground,
    setupTreeRingsBackground,
    setupFractalBackground,
    setupOrganicPatternBackground,
    setupArtDecoBackground,
    setupPollockBackground,
    setupKandinskyBackground,
    setupMiroBackground
};
