import { state } from './main.js';
import { drawTree } from './treeRenderer.js';



/**
 * Désactive ou active le fond d'écran en supprimant les éléments appropriés du DOM
 * @param {boolean} enable - true pour activer, false pour désactiver
 * @returns {boolean} - indique si l'opération a réussi
 */
export function enableBackground(enable = false) {
    console.log(`🔍 enableBackground appelé avec enable=${enable}`);

    
    // 1. Supprimer le conteneur principal .background-container
    const container = document.querySelector('.background-container');
    if (container) {
      console.log("🔍 Conteneur .background-container trouvé:", container);
      
      if (!enable) {
        container.remove();
        console.log("✅ Conteneur .background-container supprimé du DOM");
      } else {
        console.log("ℹ️ Conteneur .background-container conservé (activation demandée)");
      }
    } else {
      console.log("ℹ️ Aucun conteneur .background-container trouvé dans le DOM");
    }
    
    // 2. Supprimer les éléments .background-element dans les SVG
    const bgElements = document.querySelectorAll('.background-element');
    if (bgElements.length > 0) {
      console.log(`🔍 ${bgElements.length} éléments .background-element trouvés`);
      
      if (!enable) {
        bgElements.forEach(el => {
          el.remove();
          console.log("✅ Élément .background-element supprimé du DOM");
        });
      } else {
        console.log("ℹ️ Éléments .background-element conservés (activation demandée)");
      }
    } else {
      console.log("ℹ️ Aucun élément .background-element trouvé dans le DOM");
    }
    
    // 3. Vérification après suppression
    const containerAfter = document.querySelector('.background-container');
    const bgElementsAfter = document.querySelectorAll('.background-element');
    
    console.log("🔍 Après opération:");
    console.log(`   - Conteneur .background-container: ${containerAfter ? "existe encore" : "supprimé"}`);
    console.log(`   - Éléments .background-element: ${bgElementsAfter.length} restants`);
    
    if (!enable) {
      // Pour une désactivation, réussite = absence d'éléments
      const success = !containerAfter && bgElementsAfter.length === 0;
      console.log(`${success ? "✅" : "❌"} Désactivation ${success ? "réussie" : "incomplète"}`);
    //   state.backgroundEnabled = false;
      return success;
    } else {
      // Pour une activation, on ne fait rien pour l'instant
      console.log("ℹ️ Activation : aucune action effectuée, utiliser initBackgroundContainer");
      drawTree();
    //  state.backgroundEnabled = true;
      return true;
    }
  }



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
        // console.log("debug0, initBackgroundContainer")    

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
    
    // Récupérer les paramètres depuis le localStorage
    const settings = {
        opacity: parseFloat(localStorage.getItem('backgroundOpacity') || 0.15),
        patternVisibility: parseFloat(localStorage.getItem('patternVisibility') || 1.0),
        animation: localStorage.getItem('backgroundAnimation') === 'true',
        animationSpeed: parseFloat(localStorage.getItem('animationSpeed') || 1.0),
        customColor: localStorage.getItem('backgroundCustomColor') || '#3F51B5'
    };
    
    // Appliquer l'opacité globale au groupe
    bgGroup.style("opacity", settings.opacity);
    
    // Créer un gradient subtil pour le fond
    const gradientId = `branches-bg-gradient-${Date.now()}`;
    const bgGradient = defs.append("linearGradient")
        .attr("id", gradientId)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%");
    
    // Utiliser la couleur personnalisée pour le gradient
    const baseColor = d3.rgb(settings.customColor);
    const lighterColor = d3.rgb(baseColor).brighter(1.5);
    const darkerColor = d3.rgb(baseColor).darker(0.2);
    
    bgGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", lighterColor.toString());
    
    bgGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", darkerColor.toString());
    
    // Rectangle de fond
    bgGroup.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", `url(#${gradientId})`)
        .attr("pointer-events", "none")
        .lower();
    
    // Définition des couleurs pour les branches et les feuilles
    const branchColor = d3.rgb(settings.customColor).darker(0.5);
    
    // Les feuilles auront principalement des teintes vertes, indépendamment de la couleur personnalisée
    const leafColors = [
        d3.rgb(50, 150, 50), // Vert vif
        d3.rgb(70, 130, 40), // Vert olive
        d3.rgb(100, 160, 60), // Vert clair
        d3.rgb(30, 110, 30), // Vert foncé
        d3.rgb(120, 180, 80) // Vert-jaune
    ];
    
    // Fonction pour dessiner des branches
    function drawBranch(startX, startY, length, angle, width, depth, parentGroup) {
        if (depth <= 0 || length < 5) return;
        
        // Utiliser le groupe parent si fourni, sinon utiliser le groupe principal
        const branchGroup = parentGroup || bgGroup.append("g");
        
        // Ajuster la densité des branches selon le paramètre de détail
        if (!parentGroup && Math.random() > settings.patternVisibility && depth < 4) return;
        
        // Calculer le point final avec une légère variation pour plus de naturel
        const angleVariation = (Math.random() * 0.1 - 0.05);
        const finalAngle = angle + angleVariation;
        const endX = startX + Math.cos(finalAngle) * length;
        const endY = startY + Math.sin(finalAngle) * length;
        
        // Couleur de branche avec variation naturelle
        const branchRgb = d3.rgb(branchColor);
        branchRgb.opacity = 0.15 + (depth * 0.02);
        
        // Dessiner la branche
        const branch = branchGroup.append("line")
            .attr("x1", startX)
            .attr("y1", startY)
            .attr("x2", endX)
            .attr("y2", endY)
            .attr("stroke", branchRgb.toString())
            .attr("stroke-width", width * settings.patternVisibility)
            .attr("stroke-linecap", "round")
            .attr("stroke-linejoin", "round"); // Ajout pour mieux connecter les branches
        
        // Ajouter des feuilles avec plus de probabilité aux extrémités
        if (Math.random() < 0.4 * settings.patternVisibility && depth < 5) {
            drawLeaf(branchGroup, endX, endY, length * 0.6, finalAngle, depth);
        }
        
        // Animation si activée et si c'est une branche principale (pas de parent)
        if (settings.animation && !parentGroup && depth > 3) {
            // Uniquement animer les branches principales pour éviter les déconnexions
            branchGroup.style("transform-origin", `${startX}px ${startY}px`);
            
            const duration = (7 + Math.random() * 5) / settings.animationSpeed;
            const delay = Math.random() * 3;
            
            branchGroup.style("animation", `branchSway ${duration}s infinite alternate ease-in-out ${delay}s`);
        }
        
        // Paramètres pour les sous-branches
        const newLength = length * (0.65 + Math.random() * 0.1);
        const newWidth = width * 0.7;
        
        // Angle de divergence pour les sous-branches
        const divergence = Math.PI / (4 + Math.random() * 4);
        
        // Récursion pour les branches enfants - toujours dans le même groupe pour garder les connexions
        drawBranch(endX, endY, newLength, finalAngle + divergence, newWidth, depth - 1, branchGroup);
        drawBranch(endX, endY, newLength * 0.8, finalAngle - divergence * 1.2, newWidth * 0.8, depth - 1, branchGroup);
        
        // Occasionnellement ajouter une branche centrale pour une meilleure continuité
        if (Math.random() < 0.2 * settings.patternVisibility && depth > 2) {
            drawBranch(endX, endY, newLength * 0.9, finalAngle + angleVariation, newWidth * 0.9, depth - 1, branchGroup);
        }
        
        // Occasionnellement ajouter une branche latérale
        if (Math.random() < 0.3 * settings.patternVisibility && depth > 2) {
            const thirdAngle = finalAngle + (Math.random() < 0.5 ? 0.8 : -0.8) * divergence;
            drawBranch(endX, endY, newLength * 0.7, thirdAngle, newWidth * 0.7, depth - 2, branchGroup);
        }
        
        // Ajouter des branches de connexion aux jonctions pour éviter les "sauts" visuels
        if (depth > 1 && Math.random() < 0.3) {
            const junctionX = startX + Math.cos(finalAngle) * (length * 0.4);
            const junctionY = startY + Math.sin(finalAngle) * (length * 0.4);
            
            // Petite branche de connexion
            const connectAngle = finalAngle + Math.PI * (Math.random() * 0.5 + 0.5);
            const connectLength = length * (0.2 + Math.random() * 0.2);
            
            drawBranch(junctionX, junctionY, connectLength, connectAngle, width * 0.6, 2, branchGroup);
        }
    }
        
    // Fonction améliorée pour dessiner des feuilles plus vertes et qui tombent
    function drawLeaf(parentGroup, x, y, size, angle, depth) {
        // Taille de la feuille ajustée selon le niveau de détail
        const leafSize = size * (0.4 + Math.random() * 0.3) * settings.patternVisibility;
        
        // Choisir une couleur de feuille verte aléatoire
        const leafColor = leafColors[Math.floor(Math.random() * leafColors.length)];
        leafColor.opacity = 0.15 + (Math.random() * 0.1);
        
        // Angle légèrement varié pour un aspect plus naturel
        const leafAngle = angle + (Math.random() - 0.5) * Math.PI / 2;
        
        // Créer un groupe pour la feuille
        const leaf = parentGroup.append("path")
            .attr("d", `M ${x} ${y} 
                    Q ${x + Math.cos(leafAngle) * leafSize * 0.5} ${y + Math.sin(leafAngle) * leafSize * 0.5}, 
                      ${x + Math.cos(leafAngle) * leafSize} ${y + Math.sin(leafAngle) * leafSize}
                    Q ${x + Math.cos(leafAngle + 0.5) * leafSize * 0.7} ${y + Math.sin(leafAngle + 0.5) * leafSize * 0.7},
                      ${x} ${y}`)
            .attr("fill", leafColor.toString())
            .attr("stroke", d3.rgb(leafColor).darker(0.5).toString())
            .attr("stroke-width", 0.5);
        
        // Ajouter animation de chute si activée
        if (settings.animation) {
            // Animer soit la chute, soit un mouvement d'oscillation
            if (Math.random() < 0.3) {
                // Animation de feuille qui tombe
                const fallDuration = (8 + Math.random() * 7) / settings.animationSpeed;
                const fallDelay = Math.random() * 5;
                const fallDistance = 100 + Math.random() * 200;
                const swayAmount = 50 + Math.random() * 80;
                
                leaf.style("animation", `leafFall ${fallDuration}s infinite ease-in-out ${fallDelay}s`);
                leaf.style("--fall-distance", `${fallDistance}px`);
                leaf.style("--sway-amount", `${swayAmount}px`);
            } else {
                // Animation d'oscillation sur place
                const swayDuration = (5 + Math.random() * 4) / settings.animationSpeed;
                const swayDelay = Math.random() * 3;
                
                leaf.style("transform-origin", `${x}px ${y}px`);
                leaf.style("animation", `leafSway ${swayDuration}s infinite alternate ease-in-out ${swayDelay}s`);
            }
        }
    }
    
    // Créer des feuilles qui tombent supplémentaires (indépendantes des branches)
    function createFallingLeaves() {
        const numLeaves = Math.floor(20 * settings.patternVisibility);
        
        for (let i = 0; i < numLeaves; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height * 0.7; // Commencer dans la partie supérieure
            const size = 15 + Math.random() * 25;
            const angle = Math.random() * Math.PI * 2;
            
            // Choisir une couleur verte aléatoire
            const leafColor = leafColors[Math.floor(Math.random() * leafColors.length)];
            leafColor.opacity = 0.15 + (Math.random() * 0.1);
            
            // Créer la feuille
            const leaf = bgGroup.append("path")
                .attr("d", `M ${x} ${y} 
                        Q ${x + Math.cos(angle) * size * 0.5} ${y + Math.sin(angle) * size * 0.5}, 
                          ${x + Math.cos(angle) * size} ${y + Math.sin(angle) * size}
                        Q ${x + Math.cos(angle + 0.5) * size * 0.7} ${y + Math.sin(angle + 0.5) * size * 0.7},
                          ${x} ${y}`)
                .attr("fill", leafColor.toString())
                .attr("stroke", d3.rgb(leafColor).darker(0.5).toString())
                .attr("stroke-width", 0.5);
            
            // Ajouter l'animation de chute si activée
            if (settings.animation) {
                const fallDuration = (10 + Math.random() * 15) / settings.animationSpeed;
                const fallDelay = Math.random() * 10;
                const fallDistance = height - y + 100;
                const swayAmount = 100 + Math.random() * 150;
                
                leaf.style("animation", `leafFall ${fallDuration}s infinite ease-in-out ${fallDelay}s`);
                leaf.style("--fall-distance", `${fallDistance}px`);
                leaf.style("--sway-amount", `${swayAmount}px`);
            }
        }
    }
    
    // Créer une définition CSS pour les animations
    if (!document.getElementById('branch-animations-css')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'branch-animations-css';
        styleElement.textContent = `
            @keyframes branchSway {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(3deg); }
            }
            
            @keyframes leafSway {
                0% { transform: rotate(-5deg); }
                100% { transform: rotate(5deg); }
            }
            
            @keyframes leafFall {
                0% {
                    transform: translate(0, 0) rotate(0deg);
                }
                33% {
                    transform: translate(calc(var(--sway-amount) * 0.3), calc(var(--fall-distance) * 0.33)) rotate(120deg);
                }
                66% {
                    transform: translate(calc(var(--sway-amount) * -0.3), calc(var(--fall-distance) * 0.66)) rotate(240deg);
                }
                100% {
                    transform: translate(calc(var(--sway-amount) * 0.1), calc(var(--fall-distance))) rotate(360deg);
                }
            }
        `;
        document.head.appendChild(styleElement);
    }
    
    // Ajuster la densité des branches selon le paramètre de détail
    const branchCount = Math.ceil(6 * settings.patternVisibility);
    
    // Dessiner plusieurs systèmes de branches
    drawBranch(0, height, height * 0.5, -Math.PI/4, 5, 6);
    drawBranch(0, height, height * 0.4, -Math.PI/3, 4, 6);
    
    if (branchCount > 2) {
        drawBranch(width, height, height * 0.5, -Math.PI*3/4, 5, 6);
        drawBranch(width, height, height * 0.4, -Math.PI*2/3, 4, 6);
    }
    
    if (branchCount > 4) {
        drawBranch(width * 0.3, height, height * 0.4, -Math.PI/2, 4, 5);
        drawBranch(width * 0.7, height, height * 0.4, -Math.PI/2, 4, 5);
    }
    
    if (branchCount > 6) {
        drawBranch(0, height * 0.3, width * 0.3, 0, 3, 5);
        drawBranch(0, height * 0.7, width * 0.3, -Math.PI/6, 3, 5);
    }
    
    if (branchCount > 8) {
        drawBranch(width, height * 0.3, width * 0.3, Math.PI, 3, 5);
        drawBranch(width, height * 0.7, width * 0.3, Math.PI + Math.PI/6, 3, 5);
    }
    
    // Ajouter des feuilles qui tombent (indépendantes des branches)
    createFallingLeaves();
    
    // Appliquer un léger flou pour adoucir l'ensemble
    const filter = defs.append("filter")
        .attr("id", "branches-blur")
        .attr("x", "-10%")
        .attr("y", "-10%")
        .attr("width", "120%")
        .attr("height", "120%");
    
    filter.append("feGaussianBlur")
        .attr("in", "SourceGraphic")
        .attr("stdDeviation", 0.5 / settings.patternVisibility);
    
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
    
    // Récupérer les paramètres depuis le localStorage
    const settings = {
        opacity: parseFloat(localStorage.getItem('backgroundOpacity') || 0.15),
        patternVisibility: parseFloat(localStorage.getItem('patternVisibility') || 1.0),
        animation: localStorage.getItem('backgroundAnimation') === 'true',
        animationSpeed: parseFloat(localStorage.getItem('animationSpeed') || 1.0),
        customColor: localStorage.getItem('backgroundCustomColor') || '#3F51B5'
    };
    
    // Appliquer l'opacité globale au groupe
    bgGroup.style("opacity", settings.opacity);
    
    // Fond de base avec gradient personnalisé
    const gradientId = `leaves-bg-gradient-${Date.now()}`;
    const bgGradient = defs.append("linearGradient")
        .attr("id", gradientId)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");
    
    // Utiliser la couleur personnalisée pour le gradient
    const baseColor = d3.rgb(settings.customColor);
    const lighterColor = d3.rgb(baseColor).brighter(1.5);
    const darkerColor = d3.rgb(baseColor).darker(0.2);
    
    bgGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", lighterColor.toString());
    
    bgGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", darkerColor.toString());
    
    bgGroup.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", `url(#${gradientId})`)
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
    
    // Générer des couleurs de feuilles basées sur la couleur personnalisée
    function generateLeafColors() {
        const baseColor = d3.rgb(settings.customColor);
        
        // Favoriser les teintes vertes pour les feuilles
        const leafColors = [
            d3.rgb(50, 150, 50, 0.12), // Vert vif
            d3.rgb(70, 130, 40, 0.12), // Vert olive
            d3.rgb(100, 160, 60, 0.12), // Vert clair
            d3.rgb(30, 110, 30, 0.12), // Vert foncé
            d3.rgb(120, 180, 80, 0.12) // Vert-jaune
        ];
        
        // Ajouter quelques feuilles dérivées de la couleur personnalisée
        leafColors.push(d3.rgb(baseColor).brighter(0.5).copy({opacity: 0.12}));
        leafColors.push(d3.rgb(baseColor).darker(0.3).copy({opacity: 0.12}));
        
        return leafColors;
    }
    
    const leafColors = generateLeafColors();
    
    // Dessiner les feuilles statiques d'abord (celles qui ne tombent pas)
    const numStaticLeaves = Math.floor(width * height / 20000 * settings.patternVisibility);
    
    for (let i = 0; i < numStaticLeaves; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = (Math.random() * 30 + 10) * settings.patternVisibility;
        const rotation = Math.random() * 360;
        const leafType = Math.floor(Math.random() * 4);
        
        const leafColor = leafColors[Math.floor(Math.random() * leafColors.length)];
        
        // Créer la feuille statique
        const leafGroup = bgGroup.append("g");
        
        leafGroup.append("path")
            .attr("d", createLeafPath(leafType, size))
            .attr("transform", `translate(${x},${y}) rotate(${rotation})`)
            .attr("fill", leafColor.toString())
            .attr("stroke", `rgba(100, 100, 80, 0.1)`)
            .attr("stroke-width", 0.5);
        
        // Ajouter une nervure centrale à certaines feuilles
        if (Math.random() < 0.7) {
            leafGroup.append("path")
                .attr("d", `M 0,0 L ${size},0`)
                .attr("transform", `translate(${x},${y}) rotate(${rotation})`)
                .attr("fill", "none")
                .attr("stroke", `rgba(100, 90, 80, 0.15)`)
                .attr("stroke-width", 0.7);
        }
        
        // Ajouter seulement une légère oscillation si animation activée
        if (settings.animation) {
            // Créer une animation simple pour les feuilles statiques
            const dur = (5 + Math.random() * 5) / settings.animationSpeed;
            const delay = Math.random() * 5;
            
            // Ajouter une animation avec des attributs SVG natifs (pas de CSS)
            const anim = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
            anim.setAttribute("attributeName", "transform");
            anim.setAttribute("attributeType", "XML");
            anim.setAttribute("type", "rotate");
            anim.setAttribute("from", `0 ${x} ${y}`);
            anim.setAttribute("to", `10 ${x} ${y}`);
            anim.setAttribute("dur", `${dur}s`);
            anim.setAttribute("repeatCount", "indefinite");
            anim.setAttribute("begin", `${delay}s`);
            anim.setAttribute("additive", "sum");
            
            leafGroup.node().appendChild(anim);
        }
    }
    
    // Maintenant, créer les feuilles tombantes
    if (settings.animation) {
        const numFallingLeaves = Math.floor(width * height / 25000 * settings.patternVisibility);
        
        for (let i = 0; i < numFallingLeaves; i++) {
            // Répartir sur toute la largeur
            const x = Math.random() * width;
            // Démarrer à des hauteurs différentes au-dessus de l'écran
            const y = -100 - Math.random() * height;
            const size = (Math.random() * 30 + 10) * settings.patternVisibility;
            const rotation = Math.random() * 360;
            const leafType = Math.floor(Math.random() * 4);
            
            const leafColor = leafColors[Math.floor(Math.random() * leafColors.length)];
            
            // Créer le groupe de feuille
            const leafGroup = bgGroup.append("g")
                .attr("transform", `translate(${x},${y}) rotate(${rotation})`);
            
            // Dessiner la feuille
            leafGroup.append("path")
                .attr("d", createLeafPath(leafType, size))
                .attr("fill", leafColor.toString())
                .attr("stroke", `rgba(100, 100, 80, 0.1)`)
                .attr("stroke-width", 0.5);
            
            // Ajouter une nervure centrale
            if (Math.random() < 0.7) {
                leafGroup.append("path")
                    .attr("d", `M 0,0 L ${size},0`)
                    .attr("fill", "none")
                    .attr("stroke", `rgba(100, 90, 80, 0.15)`)
                    .attr("stroke-width", 0.7);
            }
            
            // Paramètres de l'animation
            const fallDuration = (10 + Math.random() * 15) / settings.animationSpeed;
            const delay = Math.random() * 15; // Délai varié
            
            // Distance de chute totale
            const fallDistance = height + 200;
            // Amplitude de l'oscillation latérale
            const swayAmount = 50 + Math.random() * 100;
            // Direction de l'oscillation aléatoire
            const swayDirection = Math.random() < 0.5 ? 1 : -1;
            
            // Points de contrôle pour le chemin de chute
            const cp1x = x + (swayAmount * swayDirection * 0.5);
            const cp1y = y + (fallDistance * 0.33);
            const cp2x = x + (swayAmount * swayDirection * -0.5);
            const cp2y = y + (fallDistance * 0.66);
            const endx = x;
            const endy = y + fallDistance;
            
            // Animation de chute avec courbe de Bézier
            const animId = `fall-anim-${i}`;
            
            // Créer un chemin caché pour l'animation
            const motionPath = defs.append("path")
                .attr("id", animId)
                .attr("d", `M ${x},${y} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${endx},${endy}`)
                .attr("fill", "none")
                .attr("stroke", "none");
            
            // Animation le long du chemin
            const motionAnim = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");
            motionAnim.setAttribute("dur", `${fallDuration}s`);
            motionAnim.setAttribute("begin", `${delay}s`);
            motionAnim.setAttribute("repeatCount", "indefinite");
            motionAnim.setAttribute("path", `M 0,0 C ${cp1x-x},${cp1y-y} ${cp2x-x},${cp2y-y} ${endx-x},${endy-y}`);
            
            // Animation de rotation
            const rotAnim = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
            rotAnim.setAttribute("attributeName", "transform");
            rotAnim.setAttribute("attributeType", "XML");
            rotAnim.setAttribute("type", "rotate");
            rotAnim.setAttribute("from", "0");
            rotAnim.setAttribute("to", "360");
            rotAnim.setAttribute("dur", `${fallDuration * 0.8}s`);
            rotAnim.setAttribute("repeatCount", "indefinite");
            rotAnim.setAttribute("additive", "sum");
            
            // Ajouter les animations au groupe de la feuille
            leafGroup.node().appendChild(motionAnim);
            leafGroup.node().appendChild(rotAnim);
        }
    }
    
    // Appliquer un léger flou
    const filter = defs.append("filter")
        .attr("id", "leaves-blur")
        .attr("x", "-10%")
        .attr("y", "-10%")
        .attr("width", "120%")
        .attr("height", "120%");
    
    filter.append("feGaussianBlur")
        .attr("in", "SourceGraphic")
        .attr("stdDeviation", 0.3 / settings.patternVisibility);
    
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
    
    // Récupérer les paramètres depuis le localStorage
    const settings = {
        opacity: parseFloat(localStorage.getItem('backgroundOpacity') || 0.15),
        patternVisibility: parseFloat(localStorage.getItem('patternVisibility') || 1.0),
        animation: localStorage.getItem('backgroundAnimation') === 'true',
        animationSpeed: parseFloat(localStorage.getItem('animationSpeed') || 1.0),
        customColor: localStorage.getItem('backgroundCustomColor') || '#3F51B5'
    };
    

    // =====================================================================
    // PARAMÈTRES DE TUNING - Version équilibrée pour de bonnes performances
    // =====================================================================
    const patternDetail = settings.patternVisibility; // Raccourci pour faciliter la lecture
    
    // Fonction pour ajuster les paramètres en fonction du niveau de détail
    function scaleWithDetail(min, max) {
        return min + (max - min) * patternDetail;
    }
    
    const TUNING = {
        // Nombre d'éléments - limité à 600 maximum pour de bonnes performances
        MAX_SVG_ELEMENTS: Math.round(200 + 400 * patternDetail),
        
        // Profondeur de récursion - valeurs modérées
        MAX_ITERATIONS: Math.round(scaleWithDetail(4, 6)),    // Maximum 6 est raisonnable
        MIN_ITERATIONS: Math.round(scaleWithDetail(3, 4)),    // Maximum 4 est suffisant
        
        // Probabilités de branches - valeurs équilibrées
        CENTER_BRANCH_PROBABILITY: scaleWithDetail(0.15, 0.35),  // Maximum 0.35 est raisonnable
        SIDE_BRANCH_PROBABILITY: scaleWithDetail(0.1, 0.3),    // Maximum 0.3 est raisonnable
        
        // Seuils pour la génération - valeurs équilibrées
        MAIN_BRANCH_THRESHOLD: scaleWithDetail(0.7, 0.85),    // Raisonnable pour limiter la récursion
        SIDE_BRANCH_THRESHOLD: scaleWithDetail(0.8, 0.9),     // Raisonnable pour limiter les branches
        
        // Probabilité de feuilles - valeurs équilibrées
        LEAF_PROBABILITY: scaleWithDetail(0.2, 0.4),          // Maximum 0.4 est suffisant
        
        // Nombre d'arbres - raisonnable même au maximum
        MAX_MAIN_TREES: Math.max(1, Math.round(scaleWithDetail(1, 3))),       // Maximum 3 arbres principaux
        MAX_SECONDARY_TREES: Math.round(scaleWithDetail(1, 4)),               // Maximum 4 arbres secondaires
        MAX_SPROUTS: Math.round(scaleWithDetail(2, 5)),                       // Maximum 5 pousses
        
        // Espacement - valeurs raisonnables
        TREE_SPACING: Math.round(scaleWithDetail(400, 300)),                  // Espacement minimum 300px
        SPROUT_SPACING: Math.round(scaleWithDetail(450, 350))                 // Espacement minimum 350px
    };
    
    // Log des paramètres générés en fonction du niveau de détail
    console.log(`Détail des motifs: ${patternDetail.toFixed(2)}`);
    console.log(`Paramètres de tuning:`, TUNING);
    // ====================================================================
        
    
    // Appliquer l'opacité globale au groupe
    bgGroup.style("opacity", settings.opacity);
    
    // Fond de base avec gradient subtil
    const gradientId = `growing-tree-bg-gradient-${Date.now()}`;
    const bgGradient = defs.append("linearGradient")
        .attr("id", gradientId)
        .attr("x1", "0%")
        .attr("y1", "100%")
        .attr("x2", "100%")
        .attr("y2", "0%");
    
    // Utiliser la couleur personnalisée pour le gradient
    const baseColor = d3.rgb(settings.customColor);
    const lighterColor = d3.rgb(baseColor).brighter(1.5);
    const darkerColor = d3.rgb(baseColor).darker(0.2);
    
    bgGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", lighterColor.toString());
    
    bgGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", darkerColor.toString());
    
    bgGroup.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", `url(#${gradientId})`)
        .attr("pointer-events", "none")
        .lower();
    
    // Définir les couleurs pour les branches et les feuilles
    const branchBaseColor = d3.rgb(settings.customColor).darker(0.5);
    
    // Palette de couleurs vertes pour les feuilles, indépendamment de la couleur personnalisée
    const leafColors = [
        d3.rgb(50, 150, 50), // Vert vif
        d3.rgb(70, 130, 40), // Vert olive
        d3.rgb(100, 160, 60), // Vert clair
        d3.rgb(30, 110, 30)  // Vert foncé
    ];
    
    // Fonction pour créer une variante naturelle de la couleur
    function naturalVariant(baseColor, variation) {
        const color = d3.rgb(baseColor);
        return d3.rgb(
            Math.max(0, Math.min(255, color.r + (Math.random() - 0.5) * variation)),
            Math.max(0, Math.min(255, color.g + (Math.random() - 0.5) * variation)),
            Math.max(0, Math.min(255, color.b + (Math.random() - 0.5) * variation))
        );
    }
    
    // OPTIMISATION: Limiter le nombre maximal d'éléments SVG
    let svgElementCount = 0;
    
    // Fonction pour dessiner un arbre généré procéduralement avec limites d'éléments
    function drawTree(startX, startY, trunkLength, trunkWidth, parentGroup) {
        // Tous les arbres sont maintenant verticaux
        const lean = 0;
        
        // Utiliser le groupe parent si fourni, sinon créer un nouveau groupe
        const treeGroup = parentGroup || bgGroup.append("g");
        
        // Définir la hauteur des itérations
        const iterations = Math.min(TUNING.MAX_ITERATIONS, 
                                  TUNING.MIN_ITERATIONS + Math.floor(Math.random() * 2)); 
        
        // Fonction récursive pour dessiner les branches avec limitation de nombre
        function branch(x, y, length, angle, width, depth, parent) {
            if (depth <= 0 || length < 2 || width < 0.2) return;
            if (svgElementCount >= TUNING.MAX_SVG_ELEMENTS) return;
            
            // Ajuster la densité des branches en fonction de patternVisibility
            if (!parent && Math.random() > settings.patternVisibility && depth < 4) return;
            
            // Calculer le point final avec une légère variation pour aspect naturel
            const lengthVariation = 1 + (Math.random() * 0.1 - 0.05);
            // Variation d'angle moins prononcée pour des arbres plus verticaux
            const angleVariation = (Math.random() * 0.05 - 0.025);
            const finalLength = length * lengthVariation;
            const finalAngle = angle + angleVariation;
            
            const endX = x + Math.cos(finalAngle) * finalLength;
            const endY = y + Math.sin(finalAngle) * finalLength;
            
            // Groupe pour cette branche et ses sous-branches
            const branchGroup = parent || treeGroup.append("g");
            
            // Couleur avec variation naturelle
            const branchColor = naturalVariant(branchBaseColor, 30);
            branchColor.opacity = 0.1 + (depth * 0.02);
            
            // Dessiner la branche
            const branchLine = branchGroup.append("line")
                .attr("x1", x)
                .attr("y1", y)
                .attr("x2", endX)
                .attr("y2", endY)
                .attr("stroke", branchColor.toString())
                .attr("stroke-width", width * settings.patternVisibility)
                .attr("stroke-linecap", "round");
            
            svgElementCount++;
            
            // Ajouter des feuilles avec plus de probabilité vers les extrémités
            if (Math.random() < TUNING.LEAF_PROBABILITY * settings.patternVisibility && depth < 3) {
                drawLeaf(branchGroup, endX, endY, length * 0.7, finalAngle, depth);
            }
            
            // Animation subtile pour les branches principales si activée
            if (settings.animation && !parent && depth > 3 && depth % 2 === 0) { // Animation réduite
                // Définir le point d'origine de la rotation
                const animId = `branch-anim-${Math.random().toString(36).substring(2, 9)}`;
                
                // Créer une animation SVG native
                const anim = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
                anim.setAttribute("attributeName", "transform");
                anim.setAttribute("attributeType", "XML");
                anim.setAttribute("type", "rotate");
                anim.setAttribute("from", `0 ${x} ${y}`);
                anim.setAttribute("to", `${2 * (Math.random() < 0.5 ? 1 : -1)} ${x} ${y}`);
                anim.setAttribute("dur", `${(7 + Math.random() * 5) / settings.animationSpeed}s`);
                anim.setAttribute("repeatCount", "indefinite");
                anim.setAttribute("additive", "sum");
                anim.setAttribute("begin", `${Math.random() * 3}s`);
                
                branchGroup.node().appendChild(anim);
            }
            
            // Paramètres pour les sous-branches
            const newLength = length * (0.65 + Math.random() * 0.1);
            const newWidth = width * 0.7;
            
            // Angle de divergence pour les sous-branches - plus modéré pour arbres verticaux
            const divergence = Math.PI / (6 + Math.random() * 4);
            
            // Récursion pour les branches enfants seulement si pas trop d'éléments
            if (svgElementCount < TUNING.MAX_SVG_ELEMENTS * TUNING.MAIN_BRANCH_THRESHOLD) {
                branch(endX, endY, newLength, finalAngle + divergence, newWidth, depth - 1, branchGroup);
                branch(endX, endY, newLength * 0.8, finalAngle - divergence, newWidth * 0.8, depth - 1, branchGroup);
            }
            
            // Branche centrale pour continuité
            if (Math.random() < TUNING.CENTER_BRANCH_PROBABILITY && depth > 2 && 
                svgElementCount < TUNING.MAX_SVG_ELEMENTS * 0.9) {
                branch(endX, endY, newLength * 0.9, finalAngle, newWidth * 0.9, depth - 1, branchGroup);
            }
            
            // Occasionnellement ajouter une branche latérale supplémentaire
            if (Math.random() < TUNING.SIDE_BRANCH_PROBABILITY * settings.patternVisibility && 
                depth > 2 && svgElementCount < TUNING.MAX_SVG_ELEMENTS * TUNING.SIDE_BRANCH_THRESHOLD) {
                const thirdAngle = finalAngle + (Math.random() < 0.5 ? 1 : -1) * divergence * 0.7;
                branch(endX, endY, newLength * 0.7, thirdAngle, newWidth * 0.7, depth - 2, branchGroup);
            }
        }
        
        // Fonction pour dessiner une feuille (optimisée)
        function drawLeaf(parentGroup, x, y, size, angle, depth) {
            if (svgElementCount >= TUNING.MAX_SVG_ELEMENTS) return;
            
            // Simplifier: un seul style de feuille
            const leafAngle = angle + (Math.random() - 0.5) * Math.PI / 3;
            const leafSize = size * (0.3 + Math.random() * 0.2) * settings.patternVisibility;
            
            // Choisir une couleur aléatoire dans la palette de verts
            const leafColor = naturalVariant(leafColors[Math.floor(Math.random() * leafColors.length)], 30);
            leafColor.opacity = 0.12 + (Math.random() * 0.08);
            
            const strokeColor = d3.rgb(leafColor).darker(0.3);
            strokeColor.opacity = 0.1;
            
            // Créer un groupe pour la feuille
            const leafGroup = parentGroup.append("g");
            svgElementCount++;
            
            // Corps de la feuille
            const leaf = leafGroup.append("path")
                .attr("d", `M ${x} ${y} 
                      Q ${x + Math.cos(leafAngle) * leafSize * 0.5} ${y + Math.sin(leafAngle) * leafSize * 0.5}, 
                        ${x + Math.cos(leafAngle) * leafSize} ${y + Math.sin(leafAngle) * leafSize}
                      Q ${x + Math.cos(leafAngle + 0.5) * leafSize * 0.7} ${y + Math.sin(leafAngle + 0.5) * leafSize * 0.7},
                        ${x} ${y}`)
                .attr("fill", leafColor.toString())
                .attr("stroke", strokeColor.toString())
                .attr("stroke-width", 0.5);
            svgElementCount++;
            
            // Animation subtile si activée - moins d'animations pour la performance
            if (settings.animation && Math.random() < 0.5) {
                const anim = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
                anim.setAttribute("attributeName", "transform");
                anim.setAttribute("attributeType", "XML");
                anim.setAttribute("type", "rotate");
                anim.setAttribute("from", `0 ${x} ${y}`);
                anim.setAttribute("to", `${5 * (Math.random() < 0.5 ? 1 : -1)} ${x} ${y}`);
                anim.setAttribute("dur", `${(4 + Math.random() * 3) / settings.animationSpeed}s`);
                anim.setAttribute("repeatCount", "indefinite");
                anim.setAttribute("additive", "sum");
                anim.setAttribute("begin", `${Math.random() * 2}s`);
                
                leafGroup.node().appendChild(anim);
            }
            
            return leafGroup;
        }
        
        // Démarrer l'arbre avec le tronc - angle exactement vertical (-Math.PI/2)
        branch(startX, startY, trunkLength, -Math.PI/2 + lean, trunkWidth, iterations);
        
        return treeGroup;
    }
    
    // Ajuster la densité des arbres selon patternVisibility
    const treeDensity = Math.max(0.5, settings.patternVisibility);
    
    // Déterminer le nombre d'arbres principaux en fonction de la taille d'écran
    const maxMainTrees = Math.min(Math.floor(width / 400) + 1, TUNING.MAX_MAIN_TREES);
    
    // Arbre principal au centre (toujours présent)
    drawTree(width * 0.5, height * 0.95, height * 0.2 * treeDensity, 6 * treeDensity);
    
    // Arbres secondaires (nombre réduit)
    if (maxMainTrees > 1) {
        // Arbre au coin inférieur gauche
        drawTree(width * 0.15, height * 0.93, height * 0.15 * treeDensity, 5 * treeDensity);
    }
    
    if (maxMainTrees > 2) {
        // Arbre au coin inférieur droit
        drawTree(width * 0.85, height * 0.93, height * 0.15 * treeDensity, 5 * treeDensity);
    }
    
    // Arbres plus petits répartis
    const numSmallerTrees = Math.min(Math.floor(width / TUNING.TREE_SPACING), TUNING.MAX_SECONDARY_TREES);
    if (svgElementCount < TUNING.MAX_SVG_ELEMENTS * 0.7) {
        for (let i = 0; i < numSmallerTrees; i++) {
            const x = 0.2 + (i+1) * (0.6 / (numSmallerTrees+1)); // Répartition plus espacée
            drawTree(width * x, height * 0.93, height * 0.1 * treeDensity, 3 * treeDensity);
        }
    }
    
    // Quelques petites pousses ou branches isolées
    const numSprouts = Math.min(Math.floor(width / TUNING.SPROUT_SPACING), TUNING.MAX_SPROUTS);
    if (svgElementCount < TUNING.MAX_SVG_ELEMENTS * 0.9) {
        for (let i = 0; i < numSprouts; i++) {
            const x = Math.random() * width * 0.7 + width * 0.15;
            const y = Math.random() * height * 0.15 + height * 0.8; // Plus près du bas de l'écran
            const size = height * (0.03 + Math.random() * 0.04) * treeDensity;
            
            // Angle toujours vertical
            drawTree(x, y, size, (1 + Math.random() * 1.5) * treeDensity);
        }
    }
    
    // Ajouter quelques fleurs/plantes au sol pour plus de détail
    if (settings.patternVisibility > 0.5 && svgElementCount < TUNING.MAX_SVG_ELEMENTS * 0.95) {
        const numFlowers = Math.min(Math.floor(width / 200), 8);
        
        for (let i = 0; i < numFlowers; i++) {
            const x = Math.random() * width;
            const y = height - Math.random() * 20;
            const size = 5 + Math.random() * 15;
            
            const flowerGroup = bgGroup.append("g");
            svgElementCount++;
            
            // Tige - toujours verticale
            flowerGroup.append("path")
                .attr("d", `M ${x} ${y} C ${x + 2} ${y - 10}, ${x - 2} ${y - 20}, ${x} ${y - 30 * treeDensity}`)
                .attr("fill", "none")
                .attr("stroke", d3.rgb(30, 100, 30, 0.15).toString())
                .attr("stroke-width", 1 * treeDensity);
            svgElementCount++;
            
            // Fleur/feuilles
            const petalColor = naturalVariant(leafColors[Math.floor(Math.random() * leafColors.length)], 30);
            petalColor.opacity = 0.12;
            
            // Quelques petites feuilles ou pétales - juste 2 au lieu de 3
            for (let j = 0; j < 2; j++) {
                const angle = Math.PI/2 + (j * Math.PI) - Math.PI/4;
                flowerGroup.append("path")
                    .attr("d", `M ${x} ${y - 30 * treeDensity} 
                               Q ${x + Math.cos(angle) * size * 0.7} ${(y - 30 * treeDensity) + Math.sin(angle) * size * 0.7}, 
                                 ${x + Math.cos(angle) * size} ${(y - 30 * treeDensity) + Math.sin(angle) * size}`)
                    .attr("fill", "none")
                    .attr("stroke", petalColor.toString())
                    .attr("stroke-width", 2 * treeDensity);
                svgElementCount++;
            }
            
            // Animation subtile si activée
            if (settings.animation && i % 2 === 0) { // Animer seulement la moitié des fleurs
                const anim = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
                anim.setAttribute("attributeName", "transform");
                anim.setAttribute("attributeType", "XML");
                anim.setAttribute("type", "rotate");
                anim.setAttribute("from", `0 ${x} ${y}`);
                anim.setAttribute("to", `${3 * (Math.random() < 0.5 ? 1 : -1)} ${x} ${y}`);
                anim.setAttribute("dur", `${(5 + Math.random() * 4) / settings.animationSpeed}s`);
                anim.setAttribute("repeatCount", "indefinite");
                anim.setAttribute("additive", "sum");
                
                flowerGroup.node().appendChild(anim);
            }
        }
    }
    
    // Appliquer un léger flou pour adoucir l'ensemble
    const filter = defs.append("filter")
        .attr("id", "growing-tree-blur")
        .attr("x", "-10%")
        .attr("y", "-10%")
        .attr("width", "120%")
        .attr("height", "120%");
    
    filter.append("feGaussianBlur")
        .attr("in", "SourceGraphic")
        .attr("stdDeviation", 0.5 / treeDensity);
    
    bgGroup.attr("filter", "url(#growing-tree-blur)");
    
    // console.log(`Éléments SVG générés pour le fond: ${svgElementCount} (max: ${TUNING.MAX_SVG_ELEMENTS})`);
}

// Fond avec motifs divers pour arbre généalogique 
// Simple fond dégradé amélioré avec tous les paramètres de l'interface utilisateur
function setupSimpleBackground(svg) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Récupérer TOUS les paramètres depuis le localStorage
    const settings = {
        opacity: parseFloat(localStorage.getItem('backgroundOpacity') || 0.15),
        patternVisibility: parseFloat(localStorage.getItem('patternVisibility') || 1.0),
        animation: localStorage.getItem('backgroundAnimation') === 'true',
        animationSpeed: parseFloat(localStorage.getItem('animationSpeed') || 1.0),
        customColor: localStorage.getItem('backgroundCustomColor') || '#3F51B5'
    };
    
    // Paramètres liés au niveau de détail
    const patternDetail = settings.patternVisibility;
    
    function scaleWithDetail(min, max) {
        return min + (max - min) * patternDetail;
    }
    
    const TUNING = {
        // Nombre d'éléments décoratifs
        NUM_CIRCLES: Math.round(scaleWithDetail(3, 12)),
        NUM_LINES: Math.round(scaleWithDetail(5, 15)),
        
        // Taille des éléments
        CIRCLE_SIZE_MIN: scaleWithDetail(30, 50),
        CIRCLE_SIZE_MAX: scaleWithDetail(50, 100),
        
        // Opacité des éléments - déjà géré par le paramètre global d'opacité
        CIRCLE_OPACITY_MIN: 0.7,
        CIRCLE_OPACITY_MAX: 1.0,
        LINE_OPACITY_MIN: 0.6,
        LINE_OPACITY_MAX: 0.9,
        
        // Épaisseur des lignes
        LINE_WIDTH_MIN: scaleWithDetail(0.5, 1),
        LINE_WIDTH_MAX: scaleWithDetail(1, 1.5)
    };
    
    // Supprimer l'ancien fond s'il existe
    svg.selectAll(".background-element").remove();
    
    // Créer un groupe pour le fond
    const bgGroup = svg.append("g")
        .attr("class", "background-element")
        .attr("pointer-events", "none")
        .attr("opacity", settings.opacity) // Utilise l'opacité globale
        .lower();
    
    // Créer un dégradé avec un ID unique basé sur la couleur et le timestamp
    // Cela force le navigateur à créer un nouveau gradient au lieu de réutiliser l'ancien
    const gradientId = `background-gradient-${settings.customColor.replace('#', '')}-${Date.now()}`;
    const defs = svg.append("defs");
    
    // Utiliser la couleur personnalisée pour le gradient
    const baseColor = d3.rgb(settings.customColor);
    const lighterColor = d3.rgb(baseColor).brighter(1.5);
    const darkerColor = d3.rgb(baseColor).darker(0.2);
    
    const gradient = defs.append("linearGradient")
        .attr("id", gradientId)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%");
        
    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", lighterColor.toString());
        
    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", darkerColor.toString());
    
    // Appliquer le dégradé comme fond avec l'ID unique
    bgGroup.append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("fill", `url(#${gradientId})`)
        .attr("pointer-events", "none");
    
    // Ajouter des cercles décoratifs
    const circles = [];
    for (let i = 0; i < TUNING.NUM_CIRCLES; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = TUNING.CIRCLE_SIZE_MIN + Math.random() * (TUNING.CIRCLE_SIZE_MAX - TUNING.CIRCLE_SIZE_MIN);
        const opacity = TUNING.CIRCLE_OPACITY_MIN + Math.random() * (TUNING.CIRCLE_OPACITY_MAX - TUNING.CIRCLE_OPACITY_MIN);
        
        const circle = bgGroup.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", size)
            .attr("fill", "none")
            .attr("stroke", baseColor.toString())
            .attr("stroke-width", 1.5)
            .attr("stroke-opacity", opacity);
        
        circles.push({ element: circle, x, y, size });
    }
    
    // Ajouter quelques lignes décoratives
    const lines = [];
    for (let i = 0; i < TUNING.NUM_LINES; i++) {
        const x1 = Math.random() * width;
        const y1 = Math.random() * height;
        const x2 = x1 + (Math.random() - 0.5) * 200;
        const y2 = y1 + (Math.random() - 0.5) * 200;
        const opacity = TUNING.LINE_OPACITY_MIN + Math.random() * (TUNING.LINE_OPACITY_MAX - TUNING.LINE_OPACITY_MIN);
        const lineWidth = TUNING.LINE_WIDTH_MIN + Math.random() * (TUNING.LINE_WIDTH_MAX - TUNING.LINE_WIDTH_MIN);
        
        const line = bgGroup.append("line")
            .attr("x1", x1)
            .attr("y1", y1)
            .attr("x2", x2)
            .attr("y2", y2)
            .attr("stroke", baseColor.toString())
            .attr("stroke-opacity", opacity)
            .attr("stroke-width", lineWidth);
        
        lines.push({ element: line, x1, y1, x2, y2 });
    }
    
    // Ajouter des animations si activées
    if (settings.animation) {
        // Animations pour les cercles - pulsation douce
        circles.forEach((circle, i) => {
            const delay = i * 0.2; // Décalage pour éviter que tout pulse en même temps
            const duration = (5 + Math.random() * 5) / settings.animationSpeed;
            
            // Animation de pulsation
            const anim = document.createElementNS("http://www.w3.org/2000/svg", "animate");
            anim.setAttribute("attributeName", "r");
            anim.setAttribute("values", `${circle.size};${circle.size * 1.2};${circle.size}`);
            anim.setAttribute("dur", `${duration}s`);
            anim.setAttribute("repeatCount", "indefinite");
            anim.setAttribute("begin", `${delay}s`);
            
            circle.element.node().appendChild(anim);
        });
        
        // Animations pour les lignes - oscillation légère
        lines.forEach((line, i) => {
            const delay = i * 0.1;
            const duration = (4 + Math.random() * 4) / settings.animationSpeed;
            
            // Pour la simplicité, on ne fait qu'une légère translation
            const dx = 5 + Math.random() * 10;
            const dy = 5 + Math.random() * 10;
            
            const anim = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
            anim.setAttribute("attributeName", "transform");
            anim.setAttribute("type", "translate");
            anim.setAttribute("values", `0,0;${dx},${dy};0,0`);
            anim.setAttribute("dur", `${duration}s`);
            anim.setAttribute("repeatCount", "indefinite");
            anim.setAttribute("begin", `${delay}s`);
            
            line.element.node().appendChild(anim);
        });
    }
    
    console.log(`Fond simple généré avec tous les paramètres GUI:`);
    console.log(`- Niveau de détail: ${patternDetail.toFixed(2)}`);
    console.log(`- Opacité: ${settings.opacity.toFixed(2)}`);
    console.log(`- Animation: ${settings.animation ? 'activée' : 'désactivée'}`);
    console.log(`- Vitesse d'animation: ${settings.animationSpeed.toFixed(2)}`);
    console.log(`- Couleur personnalisée: ${settings.customColor} (Gradient ID: ${gradientId})`);
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
// function setupPaperTextureBackground(svg) {
//     const width = window.innerWidth;
//     const height = window.innerHeight;
//     const defs = svg.append("defs");
    
//     // Nettoyer tout fond existant
//     svg.selectAll(".background-element").remove();
    
//     // Créer un groupe pour le fond
//     const bgGroup = svg.append("g")
//         .attr("class", "background-element")
//         .attr("pointer-events", "none")
//         .lower();
    
//     // Fond de base avec gradient subtil mais visible
//     const bgGradient = defs.append("linearGradient")
//         .attr("id", "paper-bg-gradient")
//         .attr("x1", "0%")
//         .attr("y1", "0%")
//         .attr("x2", "100%")
//         .attr("y2", "100%");
        
//     bgGradient.append("stop")
//         .attr("offset", "0%")
//         .attr("stop-color", "#f7f7f7");
        
//     bgGradient.append("stop")
//         .attr("offset", "100%")
//         .attr("stop-color", "#efefef");
    
//     bgGroup.append("rect")
//         .attr("width", width)
//         .attr("height", height)
//         .attr("fill", "url(#paper-bg-gradient)");
    
//     // Créer une texture de papier visible
//     const noisePattern = defs.append("pattern")
//         .attr("id", "noise-pattern")
//         .attr("patternUnits", "userSpaceOnUse")
//         .attr("width", 200)
//         .attr("height", 200);
    
//     // Fond du motif
//     noisePattern.append("rect")
//         .attr("width", 200)
//         .attr("height", 200)
//         .attr("fill", "transparent");
    
//     // Créer une texture plus visible
//     for (let i = 0; i < 5000; i++) {
//         const x = Math.random() * 200;
//         const y = Math.random() * 200;
//         const size = Math.random() * 1.2 + 0.3;
//         const opacity = Math.random() * 0.1 + 0.04; // Opacité plus élevée
        
//         noisePattern.append("circle")
//             .attr("cx", x)
//             .attr("cy", y)
//             .attr("r", size)
//             .attr("fill", i % 5 === 0 ? "#aaaaaa" : "#707070") // Couleurs plus visibles
//             .attr("opacity", opacity);
//     }
    
//     // Ajouter quelques lignes/fibres de papier
//     for (let i = 0; i < 50; i++) {
//         const x1 = Math.random() * 200;
//         const y1 = Math.random() * 200;
//         const length = Math.random() * 30 + 10;
//         const angle = Math.random() * Math.PI * 2;
//         const x2 = x1 + Math.cos(angle) * length;
//         const y2 = y1 + Math.sin(angle) * length;
        
//         noisePattern.append("line")
//             .attr("x1", x1)
//             .attr("y1", y1)
//             .attr("x2", x2)
//             .attr("y2", y2)
//             .attr("stroke", "#bbbbbb") // Couleur plus visible
//             .attr("stroke-width", 0.7)
//             .attr("opacity", 0.4); // Opacité plus élevée
//     }
    
//     // Appliquer le motif de texture
//     bgGroup.append("rect")
//         .attr("width", width)
//         .attr("height", height)
//         .attr("fill", "url(#noise-pattern)")
//         .attr("pointer-events", "none");
    
//     // Ajouter quelques taches de papier plus grandes
//     for (let i = 0; i < 20; i++) {
//         const x = Math.random() * width;
//         const y = Math.random() * height;
//         const size = Math.random() * 40 + 20;
        
//         bgGroup.append("circle")
//             .attr("cx", x)
//             .attr("cy", y)
//             .attr("r", size)
//             .attr("fill", "#e8e8e8")
//             .attr("opacity", Math.random() * 0.2 + 0.1);
//     }
    
//     // Ajouter une vignette légère
//     const vignetteGradient = defs.append("radialGradient")
//         .attr("id", "paper-vignette")
//         .attr("cx", "50%")
//         .attr("cy", "50%")
//         .attr("r", "70%")
//         .attr("fx", "50%")
//         .attr("fy", "50%");
        
//     vignetteGradient.append("stop")
//         .attr("offset", "0%")
//         .attr("stop-color", "#00000000");
        
//     vignetteGradient.append("stop")
//         .attr("offset", "100%")
//         .attr("stop-color", "#00000033"); // Plus visible
        
//     bgGroup.append("rect")
//         .attr("width", width)
//         .attr("height", height)
//         .attr("fill", "url(#paper-vignette)")
//         .attr("pointer-events", "none");
// }

// Texture papier améliorée avec tous les paramètres de l'interface utilisateur
function setupPaperTextureBackground(svg) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const defs = svg.append("defs");
    
    // Récupérer tous les paramètres
    const opacity = parseFloat(localStorage.getItem('backgroundOpacity') || 0.15);
    const patternVisibility = parseFloat(localStorage.getItem('patternVisibility') || 1.0);
    const animation = localStorage.getItem('backgroundAnimation') === 'true';
    const animationSpeed = parseFloat(localStorage.getItem('animationSpeed') || 1.0);
    const customColor = localStorage.getItem('backgroundCustomColor') || '#3F51B5';
    
    console.log("PARAMÈTRES TEXTURE PAPIER:", {
        opacity,
        patternVisibility,
        animation: animation ? "ACTIVÉ" : "DÉSACTIVÉ",
        animationSpeed,
        customColor
    });
    
    // Nettoyer tout fond existant
    svg.selectAll(".background-element").remove();
    
    // Créer un groupe pour le fond
    const bgGroup = svg.append("g")
        .attr("class", "background-element")
        .attr("pointer-events", "none")
        .style("opacity", opacity)
        .lower();
    
    // Créer des couleurs basées sur la couleur personnalisée
    const baseColor = d3.rgb(customColor);
    
    // Couleur de fond légèrement influencée par la couleur personnalisée
    const paperBaseColor = d3.rgb(
        Math.min(255, 240 + (baseColor.r - 240) * 0.3),
        Math.min(255, 240 + (baseColor.g - 240) * 0.3),
        Math.min(255, 240 + (baseColor.b - 240) * 0.3)
    );
    
    // Couleur plus foncée pour les textures
    const textureDarkColor = d3.rgb(
        Math.max(0, baseColor.r * 0.3 + 80),
        Math.max(0, baseColor.g * 0.3 + 80),
        Math.max(0, baseColor.b * 0.3 + 80)
    );
    
    // Couleur pour les fibres
    const fiberColor = d3.rgb(
        Math.max(0, baseColor.r * 0.4 + 100),
        Math.max(0, baseColor.g * 0.4 + 100),
        Math.max(0, baseColor.b * 0.4 + 100)
    );
    
    // Fond de base avec gradient subtil
    const gradientId = `paper-bg-gradient-${Date.now()}`;
    const bgGradient = defs.append("linearGradient")
        .attr("id", gradientId)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%");
        
    bgGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", d3.rgb(paperBaseColor).brighter(0.05).toString());
        
    bgGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", d3.rgb(paperBaseColor).darker(0.05).toString());
    
    bgGroup.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", `url(#${gradientId})`);
    
    // Créer un pattern pour la texture de bruit (adapté au niveau de détail)
    const noisePatternId = `noise-pattern-${Date.now()}`;
    const noisePattern = defs.append("pattern")
        .attr("id", noisePatternId)
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", 200)
        .attr("height", 200);
    
    // Fond du motif
    noisePattern.append("rect")
        .attr("width", 200)
        .attr("height", 200)
        .attr("fill", "transparent");
    
    // Nombre de points basé sur le niveau de détail
    const numNoisePoints = Math.floor(2000 + 3000 * patternVisibility);
    
    // Créer la texture de bruit
    for (let i = 0; i < numNoisePoints; i++) {
        const x = Math.random() * 200;
        const y = Math.random() * 200;
        const size = Math.random() * 1.2 + 0.3;
        const opacity = Math.random() * 0.1 + 0.04;
        
        noisePattern.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", size)
            .attr("fill", i % 5 === 0 ? textureDarkColor.toString() : fiberColor.toString())
            .attr("opacity", opacity);
    }
    
    // Ajouter quelques lignes/fibres de papier (basé sur le niveau de détail)
    const numFibers = Math.floor(20 + 50 * patternVisibility);
    const fibers = [];
    
    for (let i = 0; i < numFibers; i++) {
        const x1 = Math.random() * 200;
        const y1 = Math.random() * 200;
        const length = Math.random() * 30 + 10;
        const angle = Math.random() * Math.PI * 2;
        const x2 = x1 + Math.cos(angle) * length;
        const y2 = y1 + Math.sin(angle) * length;
        
        const fiber = noisePattern.append("line")
            .attr("x1", x1)
            .attr("y1", y1)
            .attr("x2", x2)
            .attr("y2", y2)
            .attr("stroke", fiberColor.toString())
            .attr("stroke-width", 0.7)
            .attr("opacity", 0.4);
        
        fibers.push({ element: fiber, x1, y1, x2, y2 });
    }
    
    // Appliquer le motif de texture
    bgGroup.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", `url(#${noisePatternId})`)
        .attr("pointer-events", "none");
    
    // Ajouter quelques taches de papier plus grandes (basé sur le niveau de détail)
    const numStains = Math.floor(10 + 20 * patternVisibility);
    const stains = [];
    
    for (let i = 0; i < numStains; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 40 + 20;
        
        const stain = bgGroup.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", size)
            .attr("fill", paperBaseColor.brighter(0.1).toString())
            .attr("opacity", Math.random() * 0.2 + 0.1);
        
        stains.push({ element: stain, x, y, size });
    }
    
    // Ajouter une vignette légère
    const vignetteId = `paper-vignette-${Date.now()}`;
    const vignetteGradient = defs.append("radialGradient")
        .attr("id", vignetteId)
        .attr("cx", "50%")
        .attr("cy", "50%")
        .attr("r", "70%")
        .attr("fx", "50%")
        .attr("fy", "50%");
        
    vignetteGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "rgba(0, 0, 0, 0)");
        
    vignetteGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "rgba(0, 0, 0, 0.33)");
        
    bgGroup.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", `url(#${vignetteId})`)
        .attr("pointer-events", "none");
    
    // Ajouter des animations si activées
    if (animation) {
        console.log("ANIMATIONS DE TEXTURE PAPIER ACTIVÉES");
        
        // Animation pour les taches
        stains.forEach((stain, i) => {
            if (i % 2 === 0) { // Animer une partie des taches
                const delay = i * 0.2;
                const duration = (10 + Math.random() * 8) / animationSpeed;
                
                // Animation subtile d'opacité
                const opacityAnim = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                opacityAnim.setAttribute("attributeName", "opacity");
                const baseOpacity = parseFloat(stain.element.attr("opacity"));
                opacityAnim.setAttribute("values", `${baseOpacity};${baseOpacity * 1.5};${baseOpacity}`);
                opacityAnim.setAttribute("dur", `${duration}s`);
                opacityAnim.setAttribute("repeatCount", "indefinite");
                opacityAnim.setAttribute("begin", `${delay}s`);
                
                stain.element.node().appendChild(opacityAnim);
            }
        });
        
        // Animation globale très subtile pour le fond entier
        // Simule le léger mouvement du papier
        if (patternVisibility > 0.5) { // Animation plus complexe seulement si détail élevé
            const bgAnimation = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
            bgAnimation.setAttribute("attributeName", "transform");
            bgAnimation.setAttribute("type", "skewX");
            bgAnimation.setAttribute("values", "0;0.15;0;-0.15;0");
            bgAnimation.setAttribute("dur", `${20 / animationSpeed}s`);
            bgAnimation.setAttribute("repeatCount", "indefinite");
            bgAnimation.setAttribute("additive", "sum");
            
            bgGroup.node().appendChild(bgAnimation);
        }
    }
    
    console.log("Génération de la texture papier terminée.");
}

// Fond avec lignes courbes élégantes et couleurs visibles
// function setupCurvedLinesBackground(svg) {
//     const width = window.innerWidth;
//     const height = window.innerHeight;
//     const defs = svg.append("defs");
    
//     // Nettoyer tout fond existant
//     svg.selectAll(".background-element").remove();
    
//     // Créer un groupe pour le fond
//     const bgGroup = svg.append("g")
//         .attr("class", "background-element")
//         .attr("pointer-events", "none")
//         .lower();
    
//     // Fond de base avec gradient doux mais visible
//     const bgGradient = defs.append("linearGradient")
//         .attr("id", "bg-curved-gradient")
//         .attr("x1", "0%")
//         .attr("y1", "0%")
//         .attr("x2", "100%")
//         .attr("y2", "100%");
    
//     bgGradient.append("stop")
//         .attr("offset", "0%")
//         .attr("stop-color", "#f5f5f8"); // Légèrement bleuté
    
//     bgGradient.append("stop")
//         .attr("offset", "100%")
//         .attr("stop-color", "#ebebf0"); // Légèrement bleuté
    
//     bgGroup.append("rect")
//         .attr("width", width)
//         .attr("height", height)
//         .attr("fill", "url(#bg-curved-gradient)");
    
//     // Générer plusieurs courbes élégantes avec opacité visible
//     const curves = [];
//     const numCurves = 8;
    
//     // Créer une courbe de Bézier complexe
//     function createComplexCurve(startX, startY, width, height, complexity) {
//         let path = `M ${startX} ${startY}`;
        
//         for (let i = 0; i < complexity; i++) {
//             const cp1x = startX + Math.random() * width;
//             const cp1y = startY + Math.random() * height;
//             const cp2x = startX + Math.random() * width;
//             const cp2y = startY + Math.random() * height;
//             const x = startX + (i + 1) * (width / complexity);
//             const y = startY + Math.random() * height;
            
//             path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`;
//         }
        
//         return path;
//     }
    
//     // Créer des courbes élégantes traversant l'écran avec couleurs plus visibles
//     for (let i = 0; i < numCurves; i++) {
//         const startY = (height / (numCurves + 1)) * (i + 1);
//         const curveHeight = height * 0.4;
        
//         curves.push({
//             path: createComplexCurve(0, startY, width, curveHeight, 4),
//             color: `rgba(160, 160, 190, ${0.2 + (i * 0.04)})`, // Bleu plus visible
//             strokeWidth: 1.5 + Math.random() * 2
//         });
//     }
    
//     // Ajouter quelques courbes verticales pour créer une grille organique
//     for (let i = 0; i < numCurves / 2; i++) {
//         const startX = (width / ((numCurves / 2) + 1)) * (i + 1);
//         const curveWidth = width * 0.2;
        
//         curves.push({
//             path: createComplexCurve(startX, 0, curveWidth, height, 4)
//                 .replace(/M (\d+) (\d+)/g, `M ${startX} 0`)
//                 .replace(/C/g, " C")
//                 .replace(/,/g, ", "),
//             color: `rgba(140, 160, 190, ${0.15 + (i * 0.04)})`, // Bleu plus visible
//             strokeWidth: 1.5 + Math.random() * 1.5
//         });
//     }
    
//     // Dessiner les courbes
//     curves.forEach(curve => {
//         bgGroup.append("path")
//             .attr("d", curve.path)
//             .attr("fill", "none")
//             .attr("stroke", curve.color)
//             .attr("stroke-width", curve.strokeWidth)
//             .attr("stroke-linecap", "round");
//     });
    
//     // Ajouter quelques petits cercles décoratifs aux intersections - plus visibles
//     for (let i = 0; i < 40; i++) {
//         const x = Math.random() * width;
//         const y = Math.random() * height;
        
//         bgGroup.append("circle")
//             .attr("cx", x)
//             .attr("cy", y)
//             .attr("r", Math.random() * 4 + 2) // Plus grand
//             .attr("fill", `rgba(130, 150, 190, ${Math.random() * 0.2 + 0.1})`); // Plus visible
//     }
// }

// Fond avec lignes courbes élégantes avec tous les paramètres utilisateur
function setupCurvedLinesBackground(svg) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const defs = svg.append("defs");
    
    // Récupérer tous les paramètres
    const opacity = parseFloat(localStorage.getItem('backgroundOpacity') || 0.15);
    const patternVisibility = parseFloat(localStorage.getItem('patternVisibility') || 1.0);
    const animation = localStorage.getItem('backgroundAnimation') === 'true';
    const animationSpeed = parseFloat(localStorage.getItem('animationSpeed') || 1.0);
    const customColor = localStorage.getItem('backgroundCustomColor') || '#3F51B5';
    
    console.log("PARAMÈTRES LIGNES COURBES:", {
        opacity,
        patternVisibility,
        animation: animation ? "ACTIVÉ" : "DÉSACTIVÉ",
        animationSpeed,
        customColor
    });
    
    // Nettoyer tout fond existant
    svg.selectAll(".background-element").remove();
    
    // Créer un groupe pour le fond
    const bgGroup = svg.append("g")
        .attr("class", "background-element")
        .attr("pointer-events", "none")
        .style("opacity", opacity)
        .lower();
    
    // Fond de base avec gradient doux influencé par la couleur personnalisée
    const baseColor = d3.rgb(customColor);
    
    // Couleurs pour le gradient de fond
    const bgColorLight = d3.rgb(
        Math.min(255, 245 + (baseColor.r - 245) * 0.1),
        Math.min(255, 245 + (baseColor.g - 245) * 0.1),
        Math.min(255, 248 + (baseColor.b - 248) * 0.1)
    );
    
    const bgColorDark = d3.rgb(
        Math.min(255, 235 + (baseColor.r - 235) * 0.1),
        Math.min(255, 235 + (baseColor.g - 235) * 0.1),
        Math.min(255, 240 + (baseColor.b - 240) * 0.1)
    );
    
    const gradientId = `bg-curved-gradient-${Date.now()}`;
    const bgGradient = defs.append("linearGradient")
        .attr("id", gradientId)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%");
    
    bgGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", bgColorLight.toString());
    
    bgGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", bgColorDark.toString());
    
    bgGroup.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", `url(#${gradientId})`);
    
    // Génération de la couleur de base pour les courbes, influencée par la couleur personnalisée
    const curveColorBase = d3.rgb(
        Math.max(0, Math.min(255, baseColor.r * 0.5 + 80)),
        Math.max(0, Math.min(255, baseColor.g * 0.5 + 80)),
        Math.max(0, Math.min(255, baseColor.b * 0.7 + 60))
    );
    
    // Générer plusieurs courbes élégantes avec opacité adaptée au niveau de détail
    const curves = [];
    
    // Nombre de courbes basé sur le niveau de détail
    const numCurves = Math.max(4, Math.round(8 * patternVisibility));
    
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
    
    // Créer des courbes élégantes traversant l'écran
    // Opacité et épaisseur basées sur le niveau de détail
    for (let i = 0; i < numCurves; i++) {
        const startY = (height / (numCurves + 1)) * (i + 1);
        const curveHeight = height * 0.4;
        
        // Variation de couleur subtile
        const curveColor = d3.rgb(
            Math.max(0, Math.min(255, curveColorBase.r + (Math.random() * 40 - 20))),
            Math.max(0, Math.min(255, curveColorBase.g + (Math.random() * 40 - 20))),
            Math.max(0, Math.min(255, curveColorBase.b + (Math.random() * 40 - 20)))
        );
        
        // Complexité basée sur le niveau de détail
        const complexity = Math.max(3, Math.round(3 + patternVisibility * 3));
        
        curves.push({
            path: createComplexCurve(0, startY, width, curveHeight, complexity),
            color: `rgba(${Math.round(curveColor.r)}, ${Math.round(curveColor.g)}, ${Math.round(curveColor.b)}, ${0.1 + 0.1 * patternVisibility})`,
            strokeWidth: 1.5 + Math.random() * 2 * patternVisibility
        });
    }
    
    // Ajouter quelques courbes verticales pour créer une grille organique
    // Nombre basé sur le niveau de détail
    const numVerticalCurves = Math.max(2, Math.round(numCurves / 2 * patternVisibility));
    
    for (let i = 0; i < numVerticalCurves; i++) {
        const startX = (width / (numVerticalCurves + 1)) * (i + 1);
        const curveWidth = width * 0.2;
        
        // Variation de couleur subtile
        const curveColor = d3.rgb(
            Math.max(0, Math.min(255, curveColorBase.r + (Math.random() * 40 - 20))),
            Math.max(0, Math.min(255, curveColorBase.g + (Math.random() * 40 - 20))),
            Math.max(0, Math.min(255, curveColorBase.b + (Math.random() * 40 - 20)))
        );
        
        // Complexité basée sur le niveau de détail
        const complexity = Math.max(3, Math.round(3 + patternVisibility * 3));
        
        const verticalPath = createComplexCurve(startX, 0, curveWidth, height, complexity)
            .replace(/M (\d+) (\d+)/g, `M ${startX} 0`)
            .replace(/C/g, " C")
            .replace(/,/g, ", ");
        
        curves.push({
            path: verticalPath,
            color: `rgba(${Math.round(curveColor.r)}, ${Math.round(curveColor.g)}, ${Math.round(curveColor.b)}, ${0.1 + 0.05 * patternVisibility})`,
            strokeWidth: 1.5 + Math.random() * 1.5 * patternVisibility
        });
    }
    
    // Dessiner les courbes et stocker les références pour l'animation
    const curveElements = [];
    
    curves.forEach(curve => {
        const curvePath = bgGroup.append("path")
            .attr("d", curve.path)
            .attr("fill", "none")
            .attr("stroke", curve.color)
            .attr("stroke-width", curve.strokeWidth)
            .attr("stroke-linecap", "round");
        
        curveElements.push({
            element: curvePath,
            originalPath: curve.path
        });
    });
    
    // Ajouter quelques petits cercles décoratifs aux intersections
    // Nombre basé sur le niveau de détail
    const numCircles = Math.max(20, Math.round(40 * patternVisibility));
    const circleElements = [];
    
    for (let i = 0; i < numCircles; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 4 + 2 + 2 * patternVisibility;
        
        // Variation de couleur subtile
        const circleColor = d3.rgb(
            Math.max(0, Math.min(255, curveColorBase.r + (Math.random() * 40 - 20))),
            Math.max(0, Math.min(255, curveColorBase.g + (Math.random() * 40 - 20))),
            Math.max(0, Math.min(255, curveColorBase.b + (Math.random() * 40 - 20)))
        );
        
        const circle = bgGroup.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", size)
            .attr("fill", `rgba(${Math.round(circleColor.r)}, ${Math.round(circleColor.g)}, ${Math.round(circleColor.b)}, ${Math.random() * 0.2 + 0.1})`);
        
        circleElements.push({
            element: circle,
            x: x,
            y: y,
            r: size
        });
    }
    
    // Ajouter des animations si activées
    if (animation) {
        // Animation pour les courbes - ondulation subtile
        curveElements.forEach((curve, i) => {
            if (i % 2 === 0) { // Animer seulement certaines courbes
                const delay = i * 0.1;
                const duration = (20 + Math.random() * 10) / animationSpeed;
                
                // Animation pour déformer légèrement la courbe
                // Pour simplicité, on utilise une transformation globale
                const transformAnim = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
                transformAnim.setAttribute("attributeName", "transform");
                transformAnim.setAttribute("type", "translate");
                transformAnim.setAttribute("values", `0,0; ${5 * patternVisibility},0; 0,0; ${-5 * patternVisibility},0; 0,0`);
                transformAnim.setAttribute("dur", `${duration}s`);
                transformAnim.setAttribute("repeatCount", "indefinite");
                transformAnim.setAttribute("begin", `${delay}s`);
                
                curve.element.node().appendChild(transformAnim);
            }
        });
        
        // Animation pour les cercles - pulsation et léger mouvement
        circleElements.forEach((circle, i) => {
            const delay = i * 0.05;
            const duration = (5 + Math.random() * 5) / animationSpeed;
            
            // Animation de taille (pulsation)
            const pulseAnim = document.createElementNS("http://www.w3.org/2000/svg", "animate");
            pulseAnim.setAttribute("attributeName", "r");
            pulseAnim.setAttribute("values", `${circle.r};${circle.r * (1 + 0.3 * patternVisibility)};${circle.r}`);
            pulseAnim.setAttribute("dur", `${duration}s`);
            pulseAnim.setAttribute("repeatCount", "indefinite");
            pulseAnim.setAttribute("begin", `${delay}s`);
            
            circle.element.node().appendChild(pulseAnim);
            
            // Animation de position (léger mouvement)
            if (i % 3 === 0) {
                const moveX = Math.random() * 10 * patternVisibility;
                const moveY = Math.random() * 10 * patternVisibility;
                
                const moveAnimX = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                moveAnimX.setAttribute("attributeName", "cx");
                moveAnimX.setAttribute("values", `${circle.x};${circle.x + moveX};${circle.x - moveX};${circle.x}`);
                moveAnimX.setAttribute("dur", `${duration * 1.5}s`);
                moveAnimX.setAttribute("repeatCount", "indefinite");
                moveAnimX.setAttribute("begin", `${delay * 1.2}s`);
                
                const moveAnimY = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                moveAnimY.setAttribute("attributeName", "cy");
                moveAnimY.setAttribute("values", `${circle.y};${circle.y + moveY};${circle.y - moveY};${circle.y}`);
                moveAnimY.setAttribute("dur", `${duration * 1.8}s`);
                moveAnimY.setAttribute("repeatCount", "indefinite");
                moveAnimY.setAttribute("begin", `${delay * 0.8}s`);
                
                circle.element.node().appendChild(moveAnimX);
                circle.element.node().appendChild(moveAnimY);
            }
        });
    }
    
    console.log("Génération du fond lignes courbes terminée.");
}

// Fond avec motif inspiré des anneaux des arbres - adapté à tous les paramètres
function setupTreeRingsBackground(svg) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const defs = svg.append("defs");
    
    // Récupérer tous les paramètres
    const opacity = parseFloat(localStorage.getItem('backgroundOpacity') || 0.15);
    const patternVisibility = parseFloat(localStorage.getItem('patternVisibility') || 1.0);
    const animation = localStorage.getItem('backgroundAnimation') === 'true';
    const animationSpeed = parseFloat(localStorage.getItem('animationSpeed') || 1.0);
    const customColor = localStorage.getItem('backgroundCustomColor') || '#3F51B5';
    
    console.log("PARAMÈTRES ANNEAUX D'ARBRE:", {
        opacity,
        patternVisibility,
        animation: animation ? "ACTIVÉ" : "DÉSACTIVÉ",
        animationSpeed,
        customColor
    });
    
    // Nettoyer tout fond existant
    svg.selectAll(".background-element").remove();
    
    // Créer un groupe pour le fond
    const bgGroup = svg.append("g")
        .attr("class", "background-element")
        .attr("pointer-events", "none")
        .style("opacity", opacity)
        .lower();
    
    // Adapter les couleurs à la couleur personnalisée
    const baseColor = d3.rgb(customColor);
    
    // Créer une couleur de fond légèrement teintée
    const bgColor = d3.rgb(
        Math.min(255, 245 + (baseColor.r - 245) * 0.2),
        Math.min(255, 242 + (baseColor.g - 242) * 0.2),
        Math.min(255, 235 + (baseColor.b - 235) * 0.2)
    );
    
    // Créer une couleur pour les anneaux
    const ringColor = d3.rgb(
        Math.max(0, baseColor.r * 0.5 + 100),
        Math.max(0, baseColor.g * 0.5 + 96),
        Math.max(0, baseColor.b * 0.5 + 92)
    );
    
    // Fond de base avec une couleur légèrement beige
    bgGroup.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", bgColor.toString());
    
    // Nombre de centres d'anneaux basé sur le niveau de détail
    const numCenters = Math.floor(2 + patternVisibility * 3);
    
    // Créer plusieurs centres d'anneaux
    const centers = [];
    
    // Positionner les centres en dehors de l'écran pour n'avoir que des portions d'anneaux visibles
    centers.push({ 
        x: -width * 0.2, 
        y: height * 0.7, 
        maxRadius: width * 0.8, 
        color: ringColor,
        element: null
    });
    
    centers.push({ 
        x: width * 1.1, 
        y: height * 0.4, 
        maxRadius: width * 0.6, 
        color: d3.rgb(ringColor).darker(0.1),
        element: null
    });
    
    centers.push({ 
        x: width * 0.4, 
        y: -height * 0.2, 
        maxRadius: width * 0.7, 
        color: d3.rgb(ringColor).brighter(0.1),
        element: null
    });
    
    // Ajouter des centres supplémentaires si le niveau de détail est élevé
    if (numCenters > 3) {
        centers.push({ 
            x: width * 1.2, 
            y: height * 1.1, 
            maxRadius: width * 0.7, 
            color: d3.rgb(ringColor).darker(0.2),
            element: null
        });
    }
    
    if (numCenters > 4) {
        centers.push({ 
            x: -width * 0.1, 
            y: -height * 0.3, 
            maxRadius: width * 0.9, 
            color: d3.rgb(ringColor).brighter(0.2),
            element: null
        });
    }
    
    // Créer des groupes pour chaque centre d'anneaux
    const centerGroups = centers.map((center, index) => {
        const group = bgGroup.append("g")
            .attr("class", `tree-ring-center-${index}`);
        center.element = group;
        return group;
    });
    
    // Générer les anneaux pour chaque centre
    centers.forEach((center, centerIndex) => {
        // Nombre d'anneaux variable selon le centre et le niveau de détail
        const numRings = Math.floor(30 + Math.random() * 20 + patternVisibility * 40);
        
        // Grouper les anneaux pour les animations
        const ringsGroup = center.element;
        
        // Variation aléatoire de l'épaisseur et des espaces pour un effet naturel
        let currentRadius = 10;
        const rings = [];
        
        for (let i = 0; i < numRings; i++) {
            // Épaisseur et espace influencés par le niveau de détail
            const ringWidth = Math.random() * 3 * patternVisibility + 0.8;
            const gapWidth = Math.random() * 2 * patternVisibility + 0.5;
            
            if (currentRadius > center.maxRadius) break;
            
            // Opacité variée pour plus de naturel
            const ringOpacity = 0.15 + (Math.random() * 0.15 * patternVisibility);
            
            const ring = ringsGroup.append("circle")
                .attr("cx", center.x)
                .attr("cy", center.y)
                .attr("r", currentRadius)
                .attr("fill", "none")
                .attr("stroke", center.color.toString())
                .attr("stroke-width", ringWidth)
                .attr("stroke-opacity", ringOpacity);
            
            rings.push({
                element: ring,
                radius: currentRadius,
                width: ringWidth
            });
            
            currentRadius += ringWidth + gapWidth;
        }
        
        // Ajouter des lignes radiales pour simuler les fissures - plus visibles
        // Nombre basé sur le niveau de détail
        const numLines = Math.floor(Math.random() * 5 + 3 + patternVisibility * 7);
        const radialLines = [];
        
        for (let i = 0; i < numLines; i++) {
            const angle = Math.random() * Math.PI * 2;
            const endX = center.x + Math.cos(angle) * center.maxRadius;
            const endY = center.y + Math.sin(angle) * center.maxRadius;
            
            const line = ringsGroup.append("line")
                .attr("x1", center.x)
                .attr("y1", center.y)
                .attr("x2", endX)
                .attr("y2", endY)
                .attr("stroke", center.color.toString())
                .attr("stroke-width", Math.random() * 2 * patternVisibility + 0.5)
                .attr("stroke-opacity", 0.25);
            
            radialLines.push({
                element: line,
                angle: angle
            });
        }
        
        // Ajouter des animations si activées
        if (animation) {
            // Pulsation très subtile des anneaux
            const pulseAnimation = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
            pulseAnimation.setAttribute("attributeName", "transform");
            pulseAnimation.setAttribute("type", "scale");
            pulseAnimation.setAttribute("from", "1 1");
            pulseAnimation.setAttribute("to", `${1 + 0.005 * patternVisibility} ${1 + 0.005 * patternVisibility}`);
            pulseAnimation.setAttribute("dur", `${(15 + centerIndex * 5) / animationSpeed}s`);
            pulseAnimation.setAttribute("repeatCount", "indefinite");
            pulseAnimation.setAttribute("additive", "sum");
            
            // Légère rotation des anneaux
            const rotateAnimation = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
            rotateAnimation.setAttribute("attributeName", "transform");
            rotateAnimation.setAttribute("type", "rotate");
            rotateAnimation.setAttribute("from", `0 ${center.x} ${center.y}`);
            rotateAnimation.setAttribute("to", `${0.5 * patternVisibility} ${center.x} ${center.y}`);
            rotateAnimation.setAttribute("dur", `${(30 + centerIndex * 8) / animationSpeed}s`);
            rotateAnimation.setAttribute("repeatCount", "indefinite");
            rotateAnimation.setAttribute("additive", "sum");
            
            ringsGroup.node().appendChild(pulseAnimation);
            ringsGroup.node().appendChild(rotateAnimation);
            
            // Animation d'opacité pour quelques anneaux individuels
            rings.forEach((ring, i) => {
                if (i % 10 === 0) { // Animer seulement quelques anneaux
                    const opacityAnim = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                    opacityAnim.setAttribute("attributeName", "stroke-opacity");
                    const baseOpacity = parseFloat(ring.element.attr("stroke-opacity"));
                    opacityAnim.setAttribute("values", `${baseOpacity};${baseOpacity * 1.5};${baseOpacity}`);
                    opacityAnim.setAttribute("dur", `${(10 + Math.random() * 15) / animationSpeed}s`);
                    opacityAnim.setAttribute("repeatCount", "indefinite");
                    opacityAnim.setAttribute("begin", `${i * 0.2}s`);
                    
                    ring.element.node().appendChild(opacityAnim);
                }
            });
        }
    });
    
    console.log("Génération du fond anneaux d'arbre terminée.");
}

// Fonction fractal améliorée avec tous les paramètres utilisateur
function setupFractalBackground(svg) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const defs = svg.append("defs");
    
    // Récupérer tous les paramètres
    const opacity = parseFloat(localStorage.getItem('backgroundOpacity') || 0.15);
    const patternVisibility = parseFloat(localStorage.getItem('patternVisibility') || 1.0);
    const animation = localStorage.getItem('backgroundAnimation') === 'true';
    const animationSpeed = parseFloat(localStorage.getItem('animationSpeed') || 1.0);
    const customColor = localStorage.getItem('backgroundCustomColor') || '#3F51B5';
    
    console.log("PARAMÈTRES FOND FRACTAL:", {
        opacity,
        patternVisibility,
        animation: animation ? "ACTIVÉ" : "DÉSACTIVÉ",
        animationSpeed,
        customColor
    });
    
    // Nettoyer tout fond existant
    svg.selectAll(".background-element").remove();
    
    // Créer un groupe pour le fond
    const bgGroup = svg.append("g")
        .attr("class", "background-element")
        .attr("pointer-events", "none")
        .style("opacity", opacity)
        .lower();
    
    // Fond de base avec gradient très léger
    const gradientId = `fractal-bg-gradient-${Date.now()}`;
    const bgGradient = defs.append("linearGradient")
        .attr("id", gradientId)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%");
    
    // Teinte légère basée sur la couleur personnalisée
    const baseColor = d3.rgb(customColor);
    
    // Fond très clair basé sur la couleur personnalisée
    const bgColorLight = d3.rgb(
        Math.min(255, baseColor.r * 0.1 + 240),
        Math.min(255, baseColor.g * 0.1 + 240),
        Math.min(255, baseColor.b * 0.1 + 240)
    );
    
    const bgColorDark = d3.rgb(
        Math.min(255, baseColor.r * 0.1 + 235),
        Math.min(255, baseColor.g * 0.1 + 235),
        Math.min(255, baseColor.b * 0.1 + 235)
    );
    
    bgGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", bgColorLight.toString());
    
    bgGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", bgColorDark.toString());
    
    bgGroup.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", `url(#${gradientId})`);
    
    // Palette de couleurs basée sur la couleur personnalisée
    const colorPalette = [
        d3.rgb(baseColor.r * 0.4 + 60, baseColor.g * 0.4 + 60, baseColor.b * 0.8 + 40),   // Teinte principale 1
        d3.rgb(baseColor.r * 0.3 + 40, baseColor.g * 0.5 + 80, baseColor.b * 0.4 + 60),   // Teinte principale 2
        d3.rgb(baseColor.r * 0.6 + 40, baseColor.g * 0.3 + 40, baseColor.b * 0.5 + 50)    // Teinte principale 3
    ];
    
    // Fonction pour dessiner un arbre fractal coloré
    function drawFractalTree(x, y, size, angle, depth, colorIndex) {
        if (depth === 0 || size < 2) return;
        
        // Choisir la couleur avec une opacité basée sur la profondeur
        let opacity = 0.25 - (depth * 0.025);
        if (opacity < 0.07) opacity = 0.07;
        
        const colorIdx = (colorIndex + depth) % colorPalette.length;
        const strokeColor = colorPalette[colorIdx].toString();
        
        // Calculer la nouvelle position
        const newX = x + Math.cos(angle) * size * (0.95 + Math.random() * 0.1);
        const newY = y + Math.sin(angle) * size * (0.95 + Math.random() * 0.1);
        
        // Dessiner une ligne
        const line = bgGroup.append("line")
            .attr("x1", x)
            .attr("y1", y)
            .attr("x2", newX)
            .attr("y2", newY)
            .attr("stroke", strokeColor)
            .attr("stroke-opacity", opacity)
            .attr("stroke-width", Math.max(1.2, depth * 0.8 * patternVisibility)); // Ajustement de la largeur selon le détail
        
        // Angle de branchement ajusté par le niveau de détail
        // Plus de détail = branches plus écartées
        const splitAngle = Math.PI * (0.18 + patternVisibility * 0.05);
        
        // Récursion avec des branches plus naturelles
        const nextSize = size * (0.65 + Math.random() * 0.15);
        
        // Animation de "croissance" si activée
        if (animation) {
            const growAnim = document.createElementNS("http://www.w3.org/2000/svg", "animate");
            growAnim.setAttribute("attributeName", "stroke-dashoffset");
            const length = Math.sqrt(Math.pow(newX - x, 2) + Math.pow(newY - y, 2));
            
            // Configurer le dash pour l'animation
            line.attr("stroke-dasharray", length);
            line.attr("stroke-dashoffset", length);
            
            growAnim.setAttribute("from", length);
            growAnim.setAttribute("to", 0);
            growAnim.setAttribute("dur", `${Math.max(0.5, depth * 0.5) / animationSpeed}s`);
            growAnim.setAttribute("fill", "freeze");
            
            // Retard proportionnel à la profondeur pour l'effet de croissance
            const delay = (6 - depth) * (0.5 / animationSpeed);
            growAnim.setAttribute("begin", `${delay}s`);
            
            line.node().appendChild(growAnim);
        }
        
        // Gauche
        drawFractalTree(
            newX, 
            newY, 
            nextSize * (0.9 + Math.random() * 0.2), 
            angle - splitAngle + (Math.random() * 0.1 - 0.05), 
            depth - 1,
            colorIndex
        );
        
        // Droite
        drawFractalTree(
            newX, 
            newY, 
            nextSize * (0.9 + Math.random() * 0.2), 
            angle + splitAngle + (Math.random() * 0.1 - 0.05), 
            depth - 1,
            colorIndex
        );
        
        // Parfois ajouter une branche centrale pour plus de densité
        // Probabilité ajustée selon le niveau de détail
        if (Math.random() < 0.4 * patternVisibility && depth > 3) {
            const centerAngle = angle + (Math.random() * 0.3 - 0.15);
            drawFractalTree(
                newX, 
                newY, 
                nextSize * 0.8, 
                centerAngle, 
                depth - 2,
                colorIndex
            );
        }
        
        // Ajouter des "feuilles" ou terminaisons décoratives aux extrémités
        if (depth === 1 && Math.random() < 0.5 * patternVisibility) {
            // Couleur plus vive pour les feuilles
            const leafColor = colorPalette[(colorIndex + 1) % colorPalette.length].toString();
            
            // Petit cercle décoratif au bout des branches
            bgGroup.append("circle")
                .attr("cx", newX)
                .attr("cy", newY)
                .attr("r", 1.5 + Math.random() * patternVisibility)
                .attr("fill", leafColor)
                .attr("fill-opacity", opacity * 1.3);
        }
    }
    
    // Ajuster les paramètres en fonction du niveau de détail
    // Profondeur et nombre d'arbres
    const maxDepth = 4 + Math.round(patternVisibility * 2); // 4-6 selon le niveau de détail
    
    // 1. Arbres en bas
    const numTreesBottom = Math.max(2, Math.floor(width / 250) + Math.floor(patternVisibility * 3));
    const baseSize = 100 + 40 * patternVisibility;
    
    for (let i = 0; i < numTreesBottom; i++) {
        // Position X répartie en bas de l'écran
        const startX = width * (i + 0.5) / numTreesBottom + (Math.random() * 40 - 20);
        const startY = height * 0.98 - (Math.random() * height * 0.05);
        
        // Profondeur variable pour un effet plus naturel
        const treeDepth = maxDepth - Math.floor(Math.random() * 2);
        
        // Légère variation d'angle - toujours vers le haut
        const baseAngle = -Math.PI/2 + (Math.random() * 0.12 - 0.06);
        
        // Palette de couleur aléatoire
        const colorIndex = Math.floor(Math.random() * colorPalette.length);
        
        // Taille variable
        const treeSize = baseSize * (0.8 + Math.random() * 0.4);
        
        drawFractalTree(startX, startY, treeSize, baseAngle, treeDepth, colorIndex);
    }
    
    // 2. Arbres sur les côtés - nombre ajusté par le niveau de détail
    const numSideTrees = Math.max(1, Math.floor(height / 300) + Math.floor(patternVisibility * 2));
    
    // Côté gauche - orientation vers la droite
    if (patternVisibility > 0.3) { // Ne dessiner ces arbres que si le niveau de détail est suffisant
        for (let i = 0; i < numSideTrees; i++) {
            const startX = width * 0.02 + (Math.random() * width * 0.03);
            const startY = height * (i + 1) / (numSideTrees + 1) + (Math.random() * 50 - 25);
            
            const treeDepth = maxDepth - 1 - Math.floor(Math.random() * 1);
            const baseAngle = 0 + (Math.random() * 0.4 - 0.2);
            const colorIndex = Math.floor(Math.random() * colorPalette.length);
            const treeSize = baseSize * (0.6 + Math.random() * 0.3);
            
            drawFractalTree(startX, startY, treeSize, baseAngle, treeDepth, colorIndex);
        }
    }
    
    // Côté droit - orientation vers la gauche
    if (patternVisibility > 0.3) { // Ne dessiner ces arbres que si le niveau de détail est suffisant
        for (let i = 0; i < numSideTrees; i++) {
            const startX = width * 0.98 - (Math.random() * width * 0.03);
            const startY = height * (i + 0.5) / (numSideTrees + 1) + (Math.random() * 50 - 25);
            
            const treeDepth = maxDepth - 1 - Math.floor(Math.random() * 1);
            const baseAngle = Math.PI + (Math.random() * 0.4 - 0.2);
            const colorIndex = Math.floor(Math.random() * colorPalette.length);
            const treeSize = baseSize * (0.6 + Math.random() * 0.3);
            
            drawFractalTree(startX, startY, treeSize, baseAngle, treeDepth, colorIndex);
        }
    }
    
    // 3. Arbres éparpillés dans le fond - densité ajustée par le niveau de détail
    const numBackgroundTrees = Math.max(2, Math.floor((width * height) / 200000) + Math.floor(patternVisibility * 4));
    
    if (patternVisibility > 0.5) { // Ne dessiner ces arbres que si le niveau de détail est élevé
        for (let i = 0; i < numBackgroundTrees; i++) {
            // Position aléatoire, distribution plus équilibrée
            const startX = width * 0.15 + Math.random() * width * 0.7;
            const startY = height * 0.1 + Math.random() * height * 0.6;
            
            const treeDepth = maxDepth - 2; // Profondeur réduite pour le fond
            const baseAngle = Math.random() * Math.PI * 2;
            const colorIndex = Math.floor(Math.random() * colorPalette.length);
            const treeSize = baseSize * (0.35 + Math.random() * 0.25);
            
            drawFractalTree(startX, startY, treeSize, baseAngle, treeDepth, colorIndex);
        }
    }
    
    console.log("Génération du fond fractal terminée.");
}

// Fond avec motifs organiques et élégants - avec tous les paramètres utilisateur
function setupOrganicPatternBackground(svg) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const defs = svg.append("defs");
    
    // Récupérer tous les paramètres
    const opacity = parseFloat(localStorage.getItem('backgroundOpacity') || 0.15);
    const patternVisibility = parseFloat(localStorage.getItem('patternVisibility') || 1.0);
    const animation = localStorage.getItem('backgroundAnimation') === 'true';
    const animationSpeed = parseFloat(localStorage.getItem('animationSpeed') || 1.0);
    const customColor = localStorage.getItem('backgroundCustomColor') || '#3F51B5';
    
    console.log("PARAMÈTRES MOTIF ORGANIQUE:", {
        opacity,
        patternVisibility,
        animation: animation ? "ACTIVÉ" : "DÉSACTIVÉ",
        animationSpeed,
        customColor
    });
    
    // Nettoyer tout fond existant
    svg.selectAll(".background-element").remove();
    
    // Créer un groupe pour le fond
    const bgGroup = svg.append("g")
        .attr("class", "background-element")
        .attr("pointer-events", "none")
        .style("opacity", opacity)
        .lower();
    
    // Fond de base avec gradient doux
    const gradientId = `organic-bg-gradient-${Date.now()}`;
    const bgGradient = defs.append("linearGradient")
        .attr("id", gradientId)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%");
    
    // Teinte basée sur la couleur personnalisée, mais très claire
    const baseColor = d3.rgb(customColor);
    
    // Couleurs pour le gradient de fond
    const bgColorLight = d3.rgb(
        Math.min(255, baseColor.r * 0.1 + 240),
        Math.min(255, baseColor.g * 0.1 + 245),
        Math.min(255, baseColor.b * 0.1 + 240)
    );
    
    const bgColorDark = d3.rgb(
        Math.min(255, baseColor.r * 0.1 + 235),
        Math.min(255, baseColor.g * 0.1 + 240),
        Math.min(255, baseColor.b * 0.1 + 235)
    );
    
    bgGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", bgColorLight.toString());
    
    bgGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", bgColorDark.toString());
    
    bgGroup.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", `url(#${gradientId})`);
    
    // Palette de couleurs végétales basée sur la couleur personnalisée
    const colors = [
        d3.rgb(Math.min(255, baseColor.r * 0.3 + 60), Math.min(255, baseColor.g * 0.5 + 70), Math.min(255, baseColor.b * 0.3 + 40), 0.15),  // Teinte 1
        d3.rgb(Math.min(255, baseColor.r * 0.2 + 40), Math.min(255, baseColor.g * 0.6 + 80), Math.min(255, baseColor.b * 0.2 + 30), 0.12),  // Teinte 2
        d3.rgb(Math.min(255, baseColor.r * 0.4 + 50), Math.min(255, baseColor.g * 0.4 + 60), Math.min(255, baseColor.b * 0.4 + 50), 0.12),  // Teinte 3
        d3.rgb(Math.min(255, baseColor.r * 0.3 + 70), Math.min(255, baseColor.g * 0.3 + 90), Math.min(255, baseColor.b * 0.3 + 60), 0.12)   // Teinte 4
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
                .attr("fill", colors[Math.floor(Math.random() * colors.length)].toString())
                .attr("stroke", "rgba(70, 100, 70, 0.08)")
                .attr("stroke-width", 0.5);
                
            // Ajouter une nervure centrale
            bgGroup.append("path")
                .attr("d", `M ${x} ${y} L ${x + Math.cos(angle) * size}  ${y + Math.sin(angle) * size}`)
                .attr("fill", "none")
                .attr("stroke", "rgba(70, 100, 70, 0.1)")
                .attr("stroke-width", 0.7);
            
            // Ajouter une animation si activée
            if (animation) {
                const anim = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
                anim.setAttribute("attributeName", "transform");
                anim.setAttribute("type", "rotate");
                anim.setAttribute("from", `0 ${x} ${y}`);
                anim.setAttribute("to", `${(Math.random() < 0.5 ? 3 : -3) * patternVisibility} ${x} ${y}`);
                anim.setAttribute("dur", `${(5 + Math.random() * 4) / animationSpeed}s`);
                anim.setAttribute("repeatCount", "indefinite");
                anim.setAttribute("additive", "sum");
                
                leaf.node().appendChild(anim);
            }
        } 
        else if (type === 1) {
            // Feuille composée (comme une feuille de fougère)
            const mainStem = bgGroup.append("path")
                .attr("d", `M ${x} ${y} L ${x + Math.cos(angle) * size} ${y + Math.sin(angle) * size}`)
                .attr("fill", "none")
                .attr("stroke", "rgba(70, 100, 70, 0.15)")
                .attr("stroke-width", 0.8);
            
            // Groupe pour faciliter l'animation
            const folioleGroup = bgGroup.append("g");
            
            // Ajouter des folioles de chaque côté
            const numFolioles = Math.floor(size / 15) + 3;
            const folioleSize = size * 0.2;
            
            for (let i = 1; i < numFolioles; i++) {
                const stemPos = i / numFolioles;
                const posX = x + Math.cos(angle) * size * stemPos;
                const posY = y + Math.sin(angle) * size * stemPos;
                
                // Foliole gauche
                folioleGroup.append("path")
                    .attr("d", `M ${posX} ${posY} 
                               Q ${posX + Math.cos(angle + Math.PI/2) * folioleSize * 0.5} ${posY + Math.sin(angle + Math.PI/2) * folioleSize * 0.5}, 
                                 ${posX + Math.cos(angle + Math.PI/2) * folioleSize} ${posY + Math.sin(angle + Math.PI/2) * folioleSize}`)
                    .attr("fill", "none")
                    .attr("stroke", colors[Math.floor(Math.random() * colors.length)].toString())
                    .attr("stroke-width", 0.8);
                
                // Foliole droite
                folioleGroup.append("path")
                    .attr("d", `M ${posX} ${posY} 
                               Q ${posX + Math.cos(angle - Math.PI/2) * folioleSize * 0.5} ${posY + Math.sin(angle - Math.PI/2) * folioleSize * 0.5}, 
                                 ${posX + Math.cos(angle - Math.PI/2) * folioleSize} ${posY + Math.sin(angle - Math.PI/2) * folioleSize}`)
                    .attr("fill", "none")
                    .attr("stroke", colors[Math.floor(Math.random() * colors.length)].toString())
                    .attr("stroke-width", 0.8);
            }
            
            // Ajouter une animation si activée
            if (animation) {
                const anim = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
                anim.setAttribute("attributeName", "transform");
                anim.setAttribute("type", "rotate");
                anim.setAttribute("from", `0 ${x} ${y}`);
                anim.setAttribute("to", `${(Math.random() < 0.5 ? 2 : -2) * patternVisibility} ${x} ${y}`);
                anim.setAttribute("dur", `${(6 + Math.random() * 4) / animationSpeed}s`);
                anim.setAttribute("repeatCount", "indefinite");
                anim.setAttribute("additive", "sum");
                
                folioleGroup.node().appendChild(anim);
            }
        }
        else if (type === 2) {
            // Type supplémentaire de feuille 
            // (selon le niveau de détail)
            if (patternVisibility > 0.4) {
                // Feuille plus complexe avec plusieurs lobes
                const leafGroup = bgGroup.append("g");
                
                // Centre de la feuille
                const leafColor = colors[Math.floor(Math.random() * colors.length)];
                
                // Forme principale
                const leaf = leafGroup.append("path")
                    .attr("d", `M ${x} ${y} 
                          C ${x + Math.cos(angle - 0.4) * size * 0.5} ${y + Math.sin(angle - 0.4) * size * 0.5},
                            ${x + Math.cos(angle - 0.2) * size * 0.8} ${y + Math.sin(angle - 0.2) * size * 0.8},
                            ${x + Math.cos(angle) * size} ${y + Math.sin(angle) * size}
                          C ${x + Math.cos(angle + 0.2) * size * 0.8} ${y + Math.sin(angle + 0.2) * size * 0.8},
                            ${x + Math.cos(angle + 0.4) * size * 0.5} ${y + Math.sin(angle + 0.4) * size * 0.5},
                            ${x} ${y}`)
                    .attr("fill", leafColor.toString())
                    .attr("stroke", "rgba(70, 100, 70, 0.08)")
                    .attr("stroke-width", 0.5);
                
                // Nervure centrale
                leafGroup.append("path")
                    .attr("d", `M ${x} ${y} L ${x + Math.cos(angle) * size * 0.95} ${y + Math.sin(angle) * size * 0.95}`)
                    .attr("fill", "none")
                    .attr("stroke", "rgba(70, 100, 70, 0.1)")
                    .attr("stroke-width", 0.7);
                
                // Animation si activée
                if (animation) {
                    const anim = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
                    anim.setAttribute("attributeName", "transform");
                    anim.setAttribute("type", "rotate");
                    anim.setAttribute("from", `0 ${x} ${y}`);
                    anim.setAttribute("to", `${(Math.random() < 0.5 ? 3 : -3) * patternVisibility} ${x} ${y}`);
                    anim.setAttribute("dur", `${(5 + Math.random() * 4) / animationSpeed}s`);
                    anim.setAttribute("repeatCount", "indefinite");
                    anim.setAttribute("additive", "sum");
                    
                    leafGroup.node().appendChild(anim);
                }
            } else {
                // Si niveau de détail faible, dessiner un type plus simple
                drawLeaf(x, y, size, angle, 0);
            }
        }
    }
    
    // 2. Créer des petites structures végétales (fleurs, bourgeons)
    function drawFlower(x, y, size) {
        const numPetals = 5 + Math.floor(Math.random() * 3);
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Groupe pour faciliter l'animation
        const flowerGroup = bgGroup.append("g");
        
        // Centre de la fleur
        flowerGroup.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", size * 0.2)
            .attr("fill", "rgba(180, 180, 140, 0.15)");
        
        // Pétales
        for (let i = 0; i < numPetals; i++) {
            const angle = (i / numPetals) * Math.PI * 2;
            const petalX = x + Math.cos(angle) * size * 0.5;
            const petalY = y + Math.sin(angle) * size * 0.5;
            
            flowerGroup.append("circle")
                .attr("cx", petalX)
                .attr("cy", petalY)
                .attr("r", size * 0.3)
                .attr("fill", color.toString());
        }
        
        // Animation si activée
        if (animation) {
            const anim = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
            anim.setAttribute("attributeName", "transform");
            anim.setAttribute("type", "rotate");
            anim.setAttribute("from", `0 ${x} ${y}`);
            anim.setAttribute("to", `${(Math.random() < 0.5 ? 360 : -360)}`);
            anim.setAttribute("dur", `${(30 + Math.random() * 20) / animationSpeed}s`);
            anim.setAttribute("repeatCount", "indefinite");
            
            flowerGroup.node().appendChild(anim);
        }
    }
    
    // 3. Créer des tiges et branches fines
    function drawStem(x, y, length, angle) {
        // Point de départ
        let currentX = x;
        let currentY = y;
        
        // Groupe pour les éléments de la tige
        const stemGroup = bgGroup.append("g");
        
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
            
            // Parfois ajouter une petite feuille ou fleur (selon le niveau de détail)
            const elementThreshold = 0.3 * patternVisibility;
            if (Math.random() < elementThreshold && i > 1) {
                if (Math.random() < 0.7) {
                    // Petite feuille
                    const leafSize = 10 + Math.random() * 15;
                    const leafAngle = angle + (Math.random() < 0.5 ? Math.PI/2 : -Math.PI/2);
                    drawLeaf(currentX, currentY, leafSize, leafAngle, Math.floor(Math.random() * 3));
                } else {
                    // Petite fleur (seulement si niveau de détail suffisant)
                    if (patternVisibility > 0.5) {
                        const flowerSize = 8 + Math.random() * 10;
                        drawFlower(currentX, currentY, flowerSize);
                    }
                }
            }
        }
        
        // Dessiner la tige
        const stem = stemGroup.append("path")
            .attr("d", pathData)
            .attr("fill", "none")
            .attr("stroke", "rgba(100, 120, 90, 0.15)")
            .attr("stroke-width", 1.2)
            .attr("stroke-linecap", "round");
        
        // Animation si activée
        if (animation) {
            const anim = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
            anim.setAttribute("attributeName", "transform");
            anim.setAttribute("type", "skewX");
            anim.setAttribute("values", `0;${patternVisibility * 2};0;${-patternVisibility * 2};0`);
            anim.setAttribute("dur", `${(12 + Math.random() * 8) / animationSpeed}s`);
            anim.setAttribute("repeatCount", "indefinite");
            
            stemGroup.node().appendChild(anim);
        }
    }
    
    // Disposer les éléments végétaux dans l'espace
    
    // 1. Grandes feuilles éparses (densité liée au niveau de détail)
    const numLargeLeaves = Math.floor((width * height) / 100000 * patternVisibility) + 5;
    
    for (let i = 0; i < numLargeLeaves; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = 40 + Math.random() * 60;
        const angle = Math.random() * Math.PI * 2;
        const leafType = Math.floor(Math.random() * 3);
        
        drawLeaf(x, y, size, angle, leafType);
    }
    
    // 2. Tiges avec petites feuilles et fleurs (densité liée au niveau de détail)
    const numStems = Math.floor((width * height) / 70000 * patternVisibility) + 8;
    
    for (let i = 0; i < numStems; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const length = 80 + Math.random() * 120;
        const angle = Math.random() * Math.PI * 2;
        
        drawStem(x, y, length, angle);
    }
    
    // 3. Quelques fleurs isolées (seulement si niveau de détail suffisant)
    if (patternVisibility > 0.3) {
        const numFlowers = Math.floor((width * height) / 120000 * patternVisibility) + 5;
        
        for (let i = 0; i < numFlowers; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = 15 + Math.random() * 20;
            
            drawFlower(x, y, size);
        }
    }
    
    // 4. Ajouter un léger motif texturé pour simuler du papier
    if (patternVisibility > 0.4) {
        const textureDensity = Math.floor((width * height) / 1000 * patternVisibility);
        
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
    
    console.log("Génération du motif organique terminée.");
}

// Fond avec motifs géométriques Art Déco modernes et élégants - couleurs visibles
// function setupArtDecoBackground(svg) {
//     const width = window.innerWidth;
//     const height = window.innerHeight;
//     const defs = svg.append("defs");
    
//     // Nettoyer tout fond existant
//     svg.selectAll(".background-element").remove();
    
//     // Créer un groupe pour le fond
//     const bgGroup = svg.append("g")
//         .attr("class", "background-element")
//         .attr("pointer-events", "none")
//         .lower();
    
//     // Fond de base ivoire très clair
//     bgGroup.append("rect")
//         .attr("width", width)
//         .attr("height", height)
//         .attr("fill", "#f5f5f0") // Ivoire légèrement visible
//         .attr("pointer-events", "none")
//         .lower();
    
//     // Définir des couleurs Art Déco visibles mais élégantes
//     const colors = [
//         "rgba(200, 200, 220, 0.25)", // Bleu-gris pâle
//         "rgba(190, 190, 210, 0.2)", // Bleu-violet pâle
//         "rgba(210, 200, 190, 0.2)", // Beige pâle
//         "rgba(200, 210, 200, 0.2)"  // Vert pâle
//     ];
    
//     // Créer une grille de formes Art Déco
//     const gridSize = 150;
//     const numRows = Math.ceil(height / gridSize) + 1;
//     const numCols = Math.ceil(width / gridSize) + 1;
    
//     for (let row = -1; row < numRows; row++) {
//         for (let col = -1; col < numCols; col++) {
//             const centerX = col * gridSize;
//             const centerY = row * gridSize;
            
//             // Choisir aléatoirement une forme et une couleur
//             const shapeType = Math.floor(Math.random() * 5);
//             const color = colors[Math.floor(Math.random() * colors.length)];
            
//             switch (shapeType) {
//                 case 0: // Cercles concentriques
//                     for (let i = 3; i > 0; i--) {
//                         bgGroup.append("circle")
//                             .attr("cx", centerX)
//                             .attr("cy", centerY)
//                             .attr("r", (gridSize / 3) * i * 0.7)
//                             .attr("fill", "none")
//                             .attr("stroke", color)
//                             .attr("stroke-width", 2); // Plus épais
//                     }
//                     break;
                
//                 case 1: // Motif en éventail
//                     const fanGroup = bgGroup.append("g")
//                         .attr("transform", `translate(${centerX}, ${centerY})`);
                    
//                     const numRays = 12;
//                     const rayLength = gridSize * 0.6;
                    
//                     for (let i = 0; i < numRays; i++) {
//                         const angle = (i * Math.PI * 2) / numRays;
//                         const x2 = Math.cos(angle) * rayLength;
//                         const y2 = Math.sin(angle) * rayLength;
                        
//                         fanGroup.append("line")
//                             .attr("x1", 0)
//                             .attr("y1", 0)
//                             .attr("x2", x2)
//                             .attr("y2", y2)
//                             .attr("stroke", color)
//                             .attr("stroke-width", 2); // Plus épais
//                     }
//                     break;
                
//                 case 2: // Losanges emboîtés
//                     for (let i = 3; i > 0; i--) {
//                         const size = (gridSize / 3) * i * 0.7;
                        
//                         bgGroup.append("rect")
//                             .attr("x", centerX - size)
//                             .attr("y", centerY - size)
//                             .attr("width", size * 2)
//                             .attr("height", size * 2)
//                             .attr("transform", `rotate(45, ${centerX}, ${centerY})`)
//                             .attr("fill", "none")
//                             .attr("stroke", color)
//                             .attr("stroke-width", 2); // Plus épais
//                     }
//                     break;
                
//                 case 3: // Motif chevron
//                     const chevronGroup = bgGroup.append("g")
//                         .attr("transform", `translate(${centerX}, ${centerY})`);
                    
//                     for (let i = 0; i < 3; i++) {
//                         const size = gridSize * 0.3 * (i + 1);
                        
//                         chevronGroup.append("path")
//                             .attr("d", `M ${-size} ${0} L ${0} ${-size} L ${size} ${0}`)
//                             .attr("fill", "none")
//                             .attr("stroke", color)
//                             .attr("stroke-width", 2); // Plus épais
                        
//                         chevronGroup.append("path")
//                             .attr("d", `M ${-size} ${0} L ${0} ${size} L ${size} ${0}`)
//                             .attr("fill", "none")
//                             .attr("stroke", color)
//                             .attr("stroke-width", 2); // Plus épais
//                     }
//                     break;
                    
//                 case 4: // Octogones concentriques
//                     function createOctagon(cx, cy, radius) {
//                         const points = [];
//                         for (let i = 0; i < 8; i++) {
//                             const angle = i * Math.PI / 4;
//                             points.push([
//                                 cx + radius * Math.cos(angle),
//                                 cy + radius * Math.sin(angle)
//                             ]);
//                         }
                        
//                         return points.map((p, i) => 
//                             (i === 0 ? "M" : "L") + p[0] + "," + p[1]
//                         ).join(" ") + "Z";
//                     }
                    
//                     for (let i = 3; i > 0; i--) {
//                         bgGroup.append("path")
//                             .attr("d", createOctagon(centerX, centerY, (gridSize / 3) * i * 0.6))
//                             .attr("fill", "none")
//                             .attr("stroke", color)
//                             .attr("stroke-width", 2); // Plus épais
//                     }
//                     break;
//             }
//         }
//     }
    
//     // Superposer quelques grandes formes géométriques plus visibles
//     for (let i = 0; i < 5; i++) {
//         const x = Math.random() * width;
//         const y = Math.random() * height;
//         const size = Math.random() * 300 + 200;
        
//         bgGroup.append("rect")
//             .attr("x", x - size / 2)
//             .attr("y", y - size / 2)
//             .attr("width", size)
//             .attr("height", size)
//             .attr("transform", `rotate(${Math.random() * 45}, ${x}, ${y})`)
//             .attr("fill", "none")
//             .attr("stroke", "rgba(170, 170, 190, 0.2)") // Couleur plus visible
//             .attr("stroke-width", 2.5); // Plus épais
//     }
    
//     // Ne pas appliquer de flou pour une meilleure visibilité
// }



// Fond avec motifs géométriques Art Déco modernes et élégants avec tous les paramètres utilisateur
function setupArtDecoBackground(svg) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const defs = svg.append("defs");
    
    // Récupérer tous les paramètres
    const opacity = parseFloat(localStorage.getItem('backgroundOpacity') || 0.15);
    const patternVisibility = parseFloat(localStorage.getItem('patternVisibility') || 1.0);
    const animation = localStorage.getItem('backgroundAnimation') === 'true';
    const animationSpeed = parseFloat(localStorage.getItem('animationSpeed') || 1.0);
    const customColor = localStorage.getItem('backgroundCustomColor') || '#3F51B5';
    
    console.log("PARAMÈTRES ART DÉCO:", {
        opacity,
        patternVisibility,
        animation: animation ? "ACTIVÉ" : "DÉSACTIVÉ",
        animationSpeed,
        customColor
    });
    
    // Nettoyer tout fond existant
    svg.selectAll(".background-element").remove();
    
    // Créer un groupe pour le fond
    const bgGroup = svg.append("g")
        .attr("class", "background-element")
        .attr("pointer-events", "none")
        .style("opacity", opacity)
        .lower();
    
    // Fond de base ivoire très clair, légèrement teinté par la couleur personnalisée
    const baseColor = d3.rgb(customColor);
    
    const bgColor = d3.rgb(
        Math.min(255, 245 + (baseColor.r - 245) * 0.1),
        Math.min(255, 245 + (baseColor.g - 245) * 0.1),
        Math.min(255, 240 + (baseColor.b - 240) * 0.1)
    );
    
    bgGroup.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", bgColor.toString())
        .attr("pointer-events", "none")
        .lower();
    
    // Définir des couleurs Art Déco basées sur la couleur personnalisée
    const colors = [
        d3.rgb(Math.min(255, baseColor.r * 0.8 + 40), Math.min(255, baseColor.g * 0.8 + 40), Math.min(255, baseColor.b * 0.8 + 60), 0.25), // Teinte principale 1
        d3.rgb(Math.min(255, baseColor.r * 0.8 + 30), Math.min(255, baseColor.g * 0.8 + 30), Math.min(255, baseColor.b * 0.8 + 50), 0.2),  // Teinte principale 2
        d3.rgb(Math.min(255, baseColor.r * 0.8 + 50), Math.min(255, baseColor.g * 0.8 + 40), Math.min(255, baseColor.b * 0.8 + 30), 0.2),  // Teinte principale 3
        d3.rgb(Math.min(255, baseColor.r * 0.8 + 40), Math.min(255, baseColor.g * 0.8 + 50), Math.min(255, baseColor.b * 0.8 + 40), 0.2)   // Teinte principale 4
    ];
    
    // Adapter la taille de la grille au niveau de détail
    const gridSize = Math.max(100, 150 - patternVisibility * 50);
    const numRows = Math.ceil(height / gridSize) + 1;
    const numCols = Math.ceil(width / gridSize) + 1;
    
    // Tableau pour stocker les formes animables
    const animatableShapes = [];
    
    // Créer une grille de formes Art Déco
    for (let row = -1; row < numRows; row++) {
        for (let col = -1; col < numCols; col++) {
            const centerX = col * gridSize;
            const centerY = row * gridSize;
            
            // Choisir aléatoirement une forme et une couleur
            const shapeType = Math.floor(Math.random() * 5);
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            // Groupe pour l'élément
            const shapeGroup = bgGroup.append("g")
                .attr("transform", `translate(${centerX}, ${centerY})`);
            
            // Visibilité conditionnelle basée sur le niveau de détail
            const shapeVisibility = Math.random();
            if (shapeVisibility > (1 - patternVisibility * 0.8)) {
                switch (shapeType) {
                    case 0: // Cercles concentriques
                        const circles = [];
                        const numCircles = Math.max(1, Math.round(3 * patternVisibility));
                        
                        for (let i = numCircles; i > 0; i--) {
                            const circle = shapeGroup.append("circle")
                                .attr("cx", 0)
                                .attr("cy", 0)
                                .attr("r", (gridSize / 3) * i * 0.7)
                                .attr("fill", "none")
                                .attr("stroke", color.toString())
                                .attr("stroke-width", 2);
                            
                            circles.push(circle);
                        }
                        
                        if (animation) {
                            animatableShapes.push({
                                type: "circles",
                                elements: circles,
                                centerX,
                                centerY
                            });
                        }
                        break;
                    
                    case 1: // Motif en éventail
                        const rays = [];
                        const numRays = Math.max(4, Math.round(12 * patternVisibility));
                        const rayLength = gridSize * 0.6;
                        
                        for (let i = 0; i < numRays; i++) {
                            const angle = (i * Math.PI * 2) / numRays;
                            const x2 = Math.cos(angle) * rayLength;
                            const y2 = Math.sin(angle) * rayLength;
                            
                            const ray = shapeGroup.append("line")
                                .attr("x1", 0)
                                .attr("y1", 0)
                                .attr("x2", x2)
                                .attr("y2", y2)
                                .attr("stroke", color.toString())
                                .attr("stroke-width", 2);
                            
                            rays.push(ray);
                        }
                        
                        if (animation) {
                            animatableShapes.push({
                                type: "fan",
                                elements: rays,
                                centerX,
                                centerY
                            });
                        }
                        break;
                    
                    case 2: // Losanges emboîtés
                        const diamonds = [];
                        const numDiamonds = Math.max(1, Math.round(3 * patternVisibility));
                        
                        for (let i = numDiamonds; i > 0; i--) {
                            const size = (gridSize / 3) * i * 0.7;
                            
                            const diamond = shapeGroup.append("rect")
                                .attr("x", -size)
                                .attr("y", -size)
                                .attr("width", size * 2)
                                .attr("height", size * 2)
                                .attr("transform", "rotate(45)")
                                .attr("fill", "none")
                                .attr("stroke", color.toString())
                                .attr("stroke-width", 2);
                            
                            diamonds.push(diamond);
                        }
                        
                        if (animation) {
                            animatableShapes.push({
                                type: "diamonds",
                                elements: diamonds,
                                centerX,
                                centerY
                            });
                        }
                        break;
                    
                    case 3: // Motif chevron
                        const chevrons = [];
                        const numChevrons = Math.max(1, Math.round(3 * patternVisibility));
                        
                        for (let i = 0; i < numChevrons; i++) {
                            const size = gridSize * 0.3 * (i + 1);
                            
                            const chevronUp = shapeGroup.append("path")
                                .attr("d", `M ${-size} ${0} L ${0} ${-size} L ${size} ${0}`)
                                .attr("fill", "none")
                                .attr("stroke", color.toString())
                                .attr("stroke-width", 2);
                            
                            const chevronDown = shapeGroup.append("path")
                                .attr("d", `M ${-size} ${0} L ${0} ${size} L ${size} ${0}`)
                                .attr("fill", "none")
                                .attr("stroke", color.toString())
                                .attr("stroke-width", 2);
                            
                            chevrons.push(chevronUp);
                            chevrons.push(chevronDown);
                        }
                        
                        if (animation) {
                            animatableShapes.push({
                                type: "chevrons",
                                elements: chevrons,
                                centerX,
                                centerY
                            });
                        }
                        break;
                        
                    case 4: // Octogones concentriques
                        function createOctagon(radius) {
                            const points = [];
                            for (let i = 0; i < 8; i++) {
                                const angle = i * Math.PI / 4;
                                points.push([
                                    radius * Math.cos(angle),
                                    radius * Math.sin(angle)
                                ]);
                            }
                            
                            return points.map((p, i) => 
                                (i === 0 ? "M" : "L") + p[0] + "," + p[1]
                            ).join(" ") + "Z";
                        }
                        
                        const octagons = [];
                        const numOctagons = Math.max(1, Math.round(3 * patternVisibility));
                        
                        for (let i = numOctagons; i > 0; i--) {
                            const octagon = shapeGroup.append("path")
                                .attr("d", createOctagon((gridSize / 3) * i * 0.6))
                                .attr("fill", "none")
                                .attr("stroke", color.toString())
                                .attr("stroke-width", 2);
                            
                            octagons.push(octagon);
                        }
                        
                        if (animation) {
                            animatableShapes.push({
                                type: "octagons",
                                elements: octagons,
                                centerX,
                                centerY
                            });
                        }
                        break;
                }
            }
        }
    }
    
    // Superposer quelques grandes formes géométriques plus visibles
    // Nombre basé sur le niveau de détail
    const numLargeShapes = Math.max(2, Math.round(5 * patternVisibility));
    
    for (let i = 0; i < numLargeShapes; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 300 + 200;
        
        // Utiliser une couleur plus visible
        const largeShapeColor = d3.rgb(
            Math.min(255, baseColor.r * 0.9 + 30),
            Math.min(255, baseColor.g * 0.9 + 30),
            Math.min(255, baseColor.b * 0.9 + 40),
            0.2
        );
        
        const largeShape = bgGroup.append("rect")
            .attr("x", x - size / 2)
            .attr("y", y - size / 2)
            .attr("width", size)
            .attr("height", size)
            .attr("transform", `rotate(${Math.random() * 45}, ${x}, ${y})`)
            .attr("fill", "none")
            .attr("stroke", largeShapeColor.toString())
            .attr("stroke-width", 2.5);
        
        if (animation) {
            animatableShapes.push({
                type: "largeShape",
                elements: [largeShape],
                centerX: x,
                centerY: y
            });
        }
    }
    
    // Ajouter des animations si activées
    if (animation) {
        animatableShapes.forEach((shape, index) => {
            const delay = index * 0.2;
            const duration = (10 + Math.random() * 15) / animationSpeed;
            
            switch (shape.type) {
                case "circles":
                case "diamonds":
                case "octagons":
                    // Pulsation lente
                    const scaleAnim = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
                    scaleAnim.setAttribute("attributeName", "transform");
                    scaleAnim.setAttribute("type", "scale");
                    scaleAnim.setAttribute("from", "1 1");
                    scaleAnim.setAttribute("to", `${1 + 0.1 * patternVisibility} ${1 + 0.1 * patternVisibility}`);
                    scaleAnim.setAttribute("dur", `${duration}s`);
                    scaleAnim.setAttribute("repeatCount", "indefinite");
                    scaleAnim.setAttribute("additive", "sum");
                    scaleAnim.setAttribute("begin", `${delay}s`);
                    
                    // Appliquer l'animation au premier élément (groupe)
                    shape.elements[0].node().parentNode.appendChild(scaleAnim);
                    break;
                    
                case "fan":
                    // Rotation lente
                    const rotateAnim = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
                    rotateAnim.setAttribute("attributeName", "transform");
                    rotateAnim.setAttribute("type", "rotate");
                    rotateAnim.setAttribute("from", "0");
                    rotateAnim.setAttribute("to", `${360 * (Math.random() < 0.5 ? 1 : -1)}`);
                    rotateAnim.setAttribute("dur", `${duration * 3}s`);
                    rotateAnim.setAttribute("repeatCount", "indefinite");
                    
                    // Appliquer l'animation au groupe
                    shape.elements[0].node().parentNode.appendChild(rotateAnim);
                    break;
                    
                case "chevrons":
                    // Déplacement vertical
                    for (let i = 0; i < shape.elements.length; i += 2) {
                        const moveY = 5 * patternVisibility;
                        const moveAnim = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                        moveAnim.setAttribute("attributeName", "d");
                        
                        // Calculer les chemins pour l'animation
                        const size = parseInt(shape.elements[i].attr("d").match(/M -(\d+)/)[1]);
                        
                        const pathUp = `M ${-size} ${0} L ${0} ${-size} L ${size} ${0}`;
                        const pathUpMoved = `M ${-size} ${-moveY} L ${0} ${-size-moveY} L ${size} ${-moveY}`;
                        
                        moveAnim.setAttribute("values", `${pathUp};${pathUpMoved};${pathUp}`);
                        moveAnim.setAttribute("dur", `${duration}s`);
                        moveAnim.setAttribute("repeatCount", "indefinite");
                        moveAnim.setAttribute("begin", `${delay}s`);
                        
                        shape.elements[i].node().appendChild(moveAnim);
                        
                        // Animation similaire pour le chevron du bas
                        const pathDown = `M ${-size} ${0} L ${0} ${size} L ${size} ${0}`;
                        const pathDownMoved = `M ${-size} ${moveY} L ${0} ${size+moveY} L ${size} ${moveY}`;
                        
                        const moveAnimDown = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                        moveAnimDown.setAttribute("attributeName", "d");
                        moveAnimDown.setAttribute("values", `${pathDown};${pathDownMoved};${pathDown}`);
                        moveAnimDown.setAttribute("dur", `${duration}s`);
                        moveAnimDown.setAttribute("repeatCount", "indefinite");
                        moveAnimDown.setAttribute("begin", `${delay}s`);
                        
                        shape.elements[i+1].node().appendChild(moveAnimDown);
                    }
                    break;
                    
                case "largeShape":
                    // Rotation très lente
                    const largShapeAnim = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
                    largShapeAnim.setAttribute("attributeName", "transform");
                    largShapeAnim.setAttribute("type", "rotate");
                    
                    // Extraire l'angle actuel
                    const currentRotation = parseInt(shape.elements[0].attr("transform").match(/rotate\(([^,]+)/)[1]) || 0;
                    const newRotation = currentRotation + 45;
                    
                    largShapeAnim.setAttribute("from", `${currentRotation} ${shape.centerX} ${shape.centerY}`);
                    largShapeAnim.setAttribute("to", `${newRotation} ${shape.centerX} ${shape.centerY}`);
                    largShapeAnim.setAttribute("dur", `${duration * 5}s`);
                    largShapeAnim.setAttribute("repeatCount", "indefinite");
                    
                    shape.elements[0].node().appendChild(largShapeAnim);
                    break;
            }
        });
    }
    
    console.log("Génération du fond Art Déco terminée.");
}

// Fond inspiré de Jackson Pollock (dripping) avec tous les paramètres utilisateur
function setupPollockBackground(svg) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const defs = svg.append("defs");
    
    // Récupérer tous les paramètres
    const opacity = parseFloat(localStorage.getItem('backgroundOpacity') || 0.15);
    const patternVisibility = parseFloat(localStorage.getItem('patternVisibility') || 1.0);
    const animation = localStorage.getItem('backgroundAnimation') === 'true';
    const animationSpeed = parseFloat(localStorage.getItem('animationSpeed') || 1.0);
    const customColor = localStorage.getItem('backgroundCustomColor') || '#3F51B5';
    
    console.log("PARAMÈTRES POLLOCK:", {
        opacity,
        patternVisibility,
        animation: animation ? "ACTIVÉ" : "DÉSACTIVÉ",
        animationSpeed,
        customColor
    });
    
    // Nettoyer tout fond existant
    svg.selectAll(".background-element").remove();
    
    // Créer un groupe pour le fond
    const bgGroup = svg.append("g")
        .attr("class", "background-element")
        .attr("pointer-events", "none")
        .style("opacity", opacity)
        .lower();
    
    // Fond de base blanc cassé, très légèrement teinté par la couleur personnalisée
    const baseColor = d3.rgb(customColor);
    
    const bgColor = d3.rgb(
        Math.min(255, 245 + (baseColor.r - 245) * 0.05),
        Math.min(255, 245 + (baseColor.g - 245) * 0.05),
        Math.min(255, 240 + (baseColor.b - 240) * 0.05)
    );
    
    bgGroup.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", bgColor.toString());
    
    // Palettes de couleurs inspirées de Pollock, influencées par la couleur personnalisée
    const colors = [
        `rgba(0, 0, 0, 0.1)`,      // Noir
        `rgba(${Math.round(baseColor.r * 0.5 + 75)}, ${Math.round(baseColor.g * 0.2 + 60)}, ${Math.round(baseColor.b * 0.1 + 10)}, 0.08)`,  // Brun influencé
        `rgba(${Math.round(baseColor.r * 0.7 + 50)}, ${Math.round(baseColor.g * 0.1 + 10)}, ${Math.round(baseColor.b * 0.1 + 10)}, 0.08)`,  // Rouge influencé
        `rgba(${Math.round(baseColor.r * 0.2 + 10)}, ${Math.round(baseColor.g * 0.3 + 40)}, ${Math.round(baseColor.b * 0.7 + 50)}, 0.08)`,  // Bleu influencé
        `rgba(${Math.round(baseColor.r * 0.8 + 40)}, ${Math.round(baseColor.g * 0.7 + 50)}, ${Math.round(baseColor.b * 0.1 + 10)}, 0.08)`   // Jaune influencé
    ];
    
    // Créer l'effet dripping - lignes fines
    // Nombre basé sur le niveau de détail
    const numLines = Math.floor(width / (20 - 5 * patternVisibility));
    const drippingLines = [];
    
    for (let i = 0; i < numLines; i++) {
        // Point de départ aléatoire
        const startX = Math.random() * width;
        const startY = Math.random() * height;
        
        // Longueur et nombre de segments basés sur le niveau de détail
        const segments = 5 + Math.floor(Math.random() * 10 + 5 * patternVisibility);
        let currentX = startX;
        let currentY = startY;
        
        // Créer un chemin avec plusieurs segments pour simuler une éclaboussure
        let pathData = `M ${startX} ${startY}`;
        const points = [{x: startX, y: startY}];
        
        for (let j = 0; j < segments; j++) {
            // Calculer le prochain point avec une déviation plus prononcée si détail élevé
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 50 + 10 + 20 * patternVisibility;
            
            currentX += Math.cos(angle) * distance;
            currentY += Math.sin(angle) * distance;
            
            // Ajouter au chemin
            pathData += ` L ${currentX} ${currentY}`;
            points.push({x: currentX, y: currentY});
        }
        
        // Dessiner le trait avec épaisseur variable
        const color = colors[Math.floor(Math.random() * colors.length)];
        const thickness = Math.random() * 2 + 0.5 + patternVisibility;
        
        const line = bgGroup.append("path")
            .attr("d", pathData)
            .attr("fill", "none")
            .attr("stroke", color)
            .attr("stroke-width", thickness)
            .attr("stroke-linecap", "round")
            .attr("stroke-linejoin", "round");
        
        drippingLines.push({
            element: line,
            points: points,
            pathData: pathData
        });
    }
    
    // Créer l'effet dripping - éclaboussures
    // Nombre basé sur le niveau de détail
    const numSplatters = Math.floor(width / (80 - 20 * patternVisibility));
    const splatters = [];
    
    for (let i = 0; i < numSplatters; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 30 + 5 + 10 * patternVisibility;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Forme irrégulière pour l'éclaboussure
        const splatter = bgGroup.append("g");
        
        // Créer plusieurs cercles pour former une éclaboussure
        // Nombre basé sur le niveau de détail
        const numDrops = Math.floor(Math.random() * 5 + 3 + 5 * patternVisibility);
        const drops = [];
        
        for (let j = 0; j < numDrops; j++) {
            const dropAngle = Math.random() * Math.PI * 2;
            const dropDistance = Math.random() * (size * 0.8);
            const dropX = Math.cos(dropAngle) * dropDistance;
            const dropY = Math.sin(dropAngle) * dropDistance;
            const dropSize = Math.random() * (size * 0.4) + (size * 0.1);
            
            const drop = splatter.append("circle")
                .attr("cx", x + dropX)
                .attr("cy", y + dropY)
                .attr("r", dropSize)
                .attr("fill", color);
            
            drops.push({
                element: drop,
                cx: x + dropX,
                cy: y + dropY,
                r: dropSize
            });
        }
        
        // Ajouter un cercle central
        const centralDrop = splatter.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", size * 0.5)
            .attr("fill", color);
        
        drops.push({
            element: centralDrop,
            cx: x,
            cy: y,
            r: size * 0.5
        });
        
        splatters.push({
            element: splatter,
            drops: drops,
            x: x,
            y: y
        });
    }
    
    // Ajouter des animations si activées
    if (animation) {
        // Animation pour les lignes de dripping
        drippingLines.forEach((line, index) => {
            if (index % 3 === 0) { // Animer une partie des lignes seulement
                const delay = index * 0.05;
                const duration = (8 + Math.random() * 7) / animationSpeed;
                
                // Animation de "flux" (dash-offset)
                const totalLength = line.element.node().getTotalLength();
                
                line.element
                    .attr("stroke-dasharray", totalLength)
                    .attr("stroke-dashoffset", totalLength);
                
                const dashAnim = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                dashAnim.setAttribute("attributeName", "stroke-dashoffset");
                dashAnim.setAttribute("from", totalLength);
                dashAnim.setAttribute("to", -totalLength);
                dashAnim.setAttribute("dur", `${duration}s`);
                dashAnim.setAttribute("repeatCount", "indefinite");
                dashAnim.setAttribute("begin", `${delay}s`);
                
                line.element.node().appendChild(dashAnim);
            }
        });
        
        // Animation pour les éclaboussures - pulsation subtile
        splatters.forEach((splatter, index) => {
            if (index % 2 === 0) { // Animer une partie des éclaboussures seulement
                const delay = index * 0.1;
                const duration = (5 + Math.random() * 5) / animationSpeed;
                
                splatter.drops.forEach((drop, i) => {
                    // Variation de taille
                    const scaleAnim = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                    scaleAnim.setAttribute("attributeName", "r");
                    scaleAnim.setAttribute("values", `${drop.r};${drop.r * (1 + 0.2 * patternVisibility)};${drop.r}`);
                    scaleAnim.setAttribute("dur", `${duration + i * 0.2}s`);
                    scaleAnim.setAttribute("repeatCount", "indefinite");
                    scaleAnim.setAttribute("begin", `${delay + i * 0.1}s`);
                    
                    drop.element.node().appendChild(scaleAnim);
                });
            }
        });
    }
    
    console.log("Génération du fond Pollock terminée.");
}

// Fond inspiré de Wassily Kandinsky avec tous les paramètres utilisateur
function setupKandinskyBackground(svg) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const defs = svg.append("defs");
    
    // Récupérer tous les paramètres
    const opacity = parseFloat(localStorage.getItem('backgroundOpacity') || 0.15);
    const patternVisibility = parseFloat(localStorage.getItem('patternVisibility') || 1.0);
    const animation = localStorage.getItem('backgroundAnimation') === 'true';
    const animationSpeed = parseFloat(localStorage.getItem('animationSpeed') || 1.0);
    const customColor = localStorage.getItem('backgroundCustomColor') || '#3F51B5';
    
    console.log("PARAMÈTRES KANDINSKY:", {
        opacity,
        patternVisibility,
        animation: animation ? "ACTIVÉ" : "DÉSACTIVÉ",
        animationSpeed,
        customColor
    });
    
    // Nettoyer tout fond existant
    svg.selectAll(".background-element").remove();
    
    // Créer un groupe pour le fond
    const bgGroup = svg.append("g")
        .attr("class", "background-element")
        .attr("pointer-events", "none")
        .style("opacity", opacity)
        .lower();
    
    // Fond de base ivoire très clair, très légèrement teinté
    const baseColor = d3.rgb(customColor);
    
    const bgColor = d3.rgb(
        Math.min(255, 250 + (baseColor.r - 250) * 0.05),
        Math.min(255, 250 + (baseColor.g - 250) * 0.05),
        Math.min(255, 247 + (baseColor.b - 247) * 0.05)
    );
    
    bgGroup.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", bgColor.toString());
    
    // Palettes de couleurs inspirées de Kandinsky, influencées par la couleur personnalisée
    const blue = d3.rgb(
        Math.min(255, baseColor.r * 0.2 + 20),
        Math.min(255, baseColor.g * 0.2 + 40),
        Math.min(255, baseColor.b * 0.8 + 50)
    );
    
    const red = d3.rgb(
        Math.min(255, baseColor.r * 0.8 + 50),
        Math.min(255, baseColor.g * 0.1 + 20),
        Math.min(255, baseColor.b * 0.1 + 20)
    );
    
    const yellow = d3.rgb(
        Math.min(255, baseColor.r * 0.8 + 50),
        Math.min(255, baseColor.g * 0.8 + 50),
        Math.min(255, baseColor.b * 0.1 + 10)
    );
    
    const green = d3.rgb(
        Math.min(255, baseColor.r * 0.1 + 20),
        Math.min(255, baseColor.g * 0.8 + 30),
        Math.min(255, baseColor.b * 0.1 + 20)
    );
    
    const black = d3.rgb(40, 40, 40);
    
    const colors = [
        blue.toString().replace(')', ', 0.15)').replace('rgb', 'rgba'),
        red.toString().replace(')', ', 0.15)').replace('rgb', 'rgba'),
        yellow.toString().replace(')', ', 0.15)').replace('rgb', 'rgba'),
        green.toString().replace(')', ', 0.15)').replace('rgb', 'rgba'),
        black.toString().replace(')', ', 0.15)').replace('rgb', 'rgba')
    ];
    
    // Stocker les formes pour l'animation
    const animatableShapes = [];
    
    // 1. Ajouter des cercles, cœur du style Kandinsky
    // Nombre basé sur le niveau de détail
    const numCircles = Math.floor(width / 120) + Math.floor(patternVisibility * 10);
    
    for (let i = 0; i < numCircles; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 80 + 20 + 40 * patternVisibility;
        
        // Groupe pour les éléments de ce cercle
        const circleGroup = bgGroup.append("g");
        
        // Cercle principal
        const mainCircle = circleGroup.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", size)
            .attr("fill", "none")
            .attr("stroke", colors[Math.floor(Math.random() * colors.length)])
            .attr("stroke-width", Math.random() * 2 + 1 + patternVisibility);
        
        // Parfois ajouter des cercles concentriques (selon le niveau de détail)
        if (Math.random() < 0.5 * patternVisibility) {
            const innerCircle = circleGroup.append("circle")
                .attr("cx", x)
                .attr("cy", y)
                .attr("r", size * 0.7)
                .attr("fill", "none")
                .attr("stroke", colors[Math.floor(Math.random() * colors.length)])
                .attr("stroke-width", Math.random() * 1.5 + 0.5 + 0.5 * patternVisibility);
        }
        
        // Parfois ajouter un petit cercle coloré au centre (selon le niveau de détail)
        if (Math.random() < 0.4 * patternVisibility) {
            const centerDot = circleGroup.append("circle")
                .attr("cx", x)
                .attr("cy", y)
                .attr("r", size * 0.2)
                .attr("fill", colors[Math.floor(Math.random() * colors.length)]);
        }
        
        animatableShapes.push({
            type: "circle",
            element: circleGroup,
            x: x,
            y: y,
            r: size
        });
    }
    
    // 2. Ajouter des lignes droites traversant l'espace
    // Nombre basé sur le niveau de détail
    const numLines = Math.floor(width / 150) + Math.floor(patternVisibility * 12);
    
    for (let i = 0; i < numLines; i++) {
        // Lignes traversant tout l'écran
        const y = Math.random() * height;
        
        const line = bgGroup.append("line")
            .attr("x1", 0)
            .attr("y1", y)
            .attr("x2", width)
            .attr("y2", y + (Math.random() * height * 0.4 - height * 0.2))
            .attr("stroke", colors[Math.floor(Math.random() * colors.length)])
            .attr("stroke-width", Math.random() * 1.5 + 0.5 + patternVisibility);
        
        animatableShapes.push({
            type: "line",
            element: line,
            y1: y
        });
    }
    
    // 3. Ajouter quelques grilles et formes géométriques
    // Nombre basé sur le niveau de détail
    const numShapes = Math.floor(width / 250) + Math.floor(patternVisibility * 5);
    
    for (let i = 0; i < numShapes; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 100 + 30 + 30 * patternVisibility;
        
        // Choisir une forme aléatoire
        const shapeType = Math.floor(Math.random() * 4);
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Groupe pour la forme
        const shapeGroup = bgGroup.append("g");
        
        switch (shapeType) {
            case 0: // Triangle
                const x1 = x;
                const y1 = y - size * 0.866;
                const x2 = x - size * 0.5;
                const y2 = y + size * 0.433;
                const x3 = x + size * 0.5;
                const y3 = y + size * 0.433;
                
                const triangle = shapeGroup.append("path")
                    .attr("d", `M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} Z`)
                    .attr("fill", "none")
                    .attr("stroke", color)
                    .attr("stroke-width", Math.random() * 1.5 + 0.8 + 0.5 * patternVisibility);
                
                animatableShapes.push({
                    type: "triangle",
                    element: shapeGroup,
                    cx: x,
                    cy: y
                });
                break;
                
            case 1: // Carré/Rectangle
                const rect = shapeGroup.append("rect")
                    .attr("x", x - size/2)
                    .attr("y", y - size/2)
                    .attr("width", size)
                    .attr("height", size)
                    .attr("fill", "none")
                    .attr("stroke", color)
                    .attr("stroke-width", Math.random() * 1.5 + 0.8 + 0.5 * patternVisibility);
                
                animatableShapes.push({
                    type: "rect",
                    element: shapeGroup,
                    cx: x,
                    cy: y
                });
                break;
                
            case 2: // Grille
                // Niveau de complexité basé sur le niveau de détail
                const gridSize = 4 + Math.floor(patternVisibility * 3);
                const cellSize = size / gridSize;
                
                for (let j = 0; j < gridSize; j++) {
                    shapeGroup.append("line")
                        .attr("x1", x - size/2)
                        .attr("y1", y - size/2 + j * cellSize)
                        .attr("x2", x + size/2)
                        .attr("y2", y - size/2 + j * cellSize)
                        .attr("stroke", color)
                        .attr("stroke-width", Math.random() * 1 + 0.5 + 0.3 * patternVisibility);
                    
                    shapeGroup.append("line")
                        .attr("x1", x - size/2 + j * cellSize)
                        .attr("y1", y - size/2)
                        .attr("x2", x - size/2 + j * cellSize)
                        .attr("y2", y + size/2)
                        .attr("stroke", color)
                        .attr("stroke-width", Math.random() * 1 + 0.5 + 0.3 * patternVisibility);
                }
                
                animatableShapes.push({
                    type: "grid",
                    element: shapeGroup,
                    cx: x,
                    cy: y
                });
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
                
                const star = shapeGroup.append("path")
                    .attr("d", starPoints + ' Z')
                    .attr("fill", "none")
                    .attr("stroke", color)
                    .attr("stroke-width", Math.random() * 1.5 + 0.8 + 0.5 * patternVisibility);
                
                animatableShapes.push({
                    type: "star",
                    element: shapeGroup,
                    cx: x,
                    cy: y
                });
                break;
        }
    }
    
    // Ajouter des animations si activées
    if (animation) {
        animatableShapes.forEach((shape, i) => {
            // Animation différente selon le type de forme
            const delay = i * 0.1; // Décalage pour éviter que tout bouge en même temps
            
            switch (shape.type) {
                case "circle":
                    // Pulsation lente
                    if (i % 3 === 0) { // Animer seulement certains cercles
                        const scaleAnim = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
                        scaleAnim.setAttribute("attributeName", "transform");
                        scaleAnim.setAttribute("type", "scale");
                        scaleAnim.setAttribute("from", "1 1");
                        scaleAnim.setAttribute("to", `${1 + 0.1 * patternVisibility} ${1 + 0.1 * patternVisibility}`);
                        scaleAnim.setAttribute("dur", `${(10 + Math.random() * 10) / animationSpeed}s`);
                        scaleAnim.setAttribute("repeatCount", "indefinite");
                        scaleAnim.setAttribute("additive", "sum");
                        
                        // Appliquer la transformation relative au centre du cercle
                        shape.element.attr("transform-origin", `${shape.x}px ${shape.y}px`);
                        shape.element.node().appendChild(scaleAnim);
                    }
                    break;
                
                case "line":
                    // Mouvement vertical subtil
                    if (i % 4 === 0) { // Animer seulement certaines lignes
                        const translateAnim = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                        translateAnim.setAttribute("attributeName", "y1");
                        translateAnim.setAttribute("values", `${shape.y1};${shape.y1 + 10 * patternVisibility};${shape.y1}`);
                        translateAnim.setAttribute("dur", `${(15 + Math.random() * 10) / animationSpeed}s`);
                        translateAnim.setAttribute("repeatCount", "indefinite");
                        
                        shape.element.node().appendChild(translateAnim);
                        
                        // Animation similaire pour y2
                        const translateAnim2 = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                        translateAnim2.setAttribute("attributeName", "y2");
                        translateAnim2.setAttribute("values", `${parseFloat(shape.element.attr("y2"))};${parseFloat(shape.element.attr("y2")) + 10 * patternVisibility};${parseFloat(shape.element.attr("y2"))}`);
                        translateAnim2.setAttribute("dur", `${(15 + Math.random() * 10) / animationSpeed}s`);
                        translateAnim2.setAttribute("repeatCount", "indefinite");
                        
                        shape.element.node().appendChild(translateAnim2);
                    }
                    break;
                
                case "triangle":
                case "rect":
                case "grid":
                case "star":
                    // Rotation très lente
                    if (i % 2 === 0) { // Animer seulement certaines formes
                        const rotateAnim = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
                        rotateAnim.setAttribute("attributeName", "transform");
                        rotateAnim.setAttribute("type", "rotate");
                        rotateAnim.setAttribute("from", `0 ${shape.cx} ${shape.cy}`);
                        rotateAnim.setAttribute("to", `${(Math.random() < 0.5 ? 360 : -360)}`);
                        rotateAnim.setAttribute("dur", `${(40 + Math.random() * 20) / animationSpeed}s`);
                        rotateAnim.setAttribute("repeatCount", "indefinite");
                        
                        shape.element.node().appendChild(rotateAnim);
                    }
                    break;
            }
        });
    }
    
    console.log("Génération du fond Kandinsky terminée.");
}

// Fond inspiré de Joan Miró avec tous les paramètres utilisateur
function setupMiroBackground(svg) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const defs = svg.append("defs");
    
    // Récupérer tous les paramètres
    const opacity = parseFloat(localStorage.getItem('backgroundOpacity') || 0.15);
    const patternVisibility = parseFloat(localStorage.getItem('patternVisibility') || 1.0);
    const animation = localStorage.getItem('backgroundAnimation') === 'true';
    const animationSpeed = parseFloat(localStorage.getItem('animationSpeed') || 1.0);
    const customColor = localStorage.getItem('backgroundCustomColor') || '#3F51B5';
    
    console.log("PARAMÈTRES MIRÓ:", {
        opacity,
        patternVisibility,
        animation: animation ? "ACTIVÉ" : "DÉSACTIVÉ",
        animationSpeed,
        customColor
    });
    
    // Nettoyer tout fond existant
    svg.selectAll(".background-element").remove();
    
    // Créer un groupe pour le fond
    const bgGroup = svg.append("g")
        .attr("class", "background-element")
        .attr("pointer-events", "none")
        .style("opacity", opacity)
        .lower();
    
    // Fond de base blanc chaud très clair, très légèrement teinté
    const baseColor = d3.rgb(customColor);
    
    const bgColor = d3.rgb(
        Math.min(255, 253 + (baseColor.r - 253) * 0.05),
        Math.min(255, 252 + (baseColor.g - 252) * 0.05),
        Math.min(255, 247 + (baseColor.b - 247) * 0.05)
    );
    
    bgGroup.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", bgColor.toString())
        .attr("pointer-events", "none")
        .lower();
    
    // Palettes de couleurs inspirées de Miró, influencées par la couleur personnalisée
    const red = d3.rgb(
        Math.min(255, baseColor.r * 0.4 + 150),
        Math.min(255, baseColor.g * 0.1 + 25),
        Math.min(255, baseColor.b * 0.1 + 20)
    );
    
    const blue = d3.rgb(
        Math.min(255, baseColor.r * 0.1 + 10),
        Math.min(255, baseColor.g * 0.2 + 40),
        Math.min(255, baseColor.b * 0.7 + 70)
    );
    
    const yellow = d3.rgb(
        Math.min(255, baseColor.r * 0.5 + 125),
        Math.min(255, baseColor.g * 0.5 + 110),
        Math.min(255, baseColor.b * 0.1 + 10)
    );
    
    const green = d3.rgb(
        Math.min(255, baseColor.r * 0.1 + 20),
        Math.min(255, baseColor.g * 0.5 + 90),
        Math.min(255, baseColor.b * 0.1 + 20)
    );
    
    const black = d3.rgb(30, 30, 30);
    
    const colors = [
        red.toString().replace(')', ', 0.12)').replace('rgb', 'rgba'),
        blue.toString().replace(')', ', 0.12)').replace('rgb', 'rgba'),
        yellow.toString().replace(')', ', 0.12)').replace('rgb', 'rgba'),
        green.toString().replace(')', ', 0.12)').replace('rgb', 'rgba'),
        black.toString().replace(')', ', 0.15)').replace('rgb', 'rgba')
    ];
    
    // Stocker les formes pour l'animation
    const animatableShapes = [];
    
    // 1. Formes organiques aléatoires - caractéristiques de Miró
    // Nombre basé sur le niveau de détail
    const numOrganic = Math.floor(width / 150) + Math.floor(patternVisibility * 8);
    
    for (let i = 0; i < numOrganic; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 60 + 20 + 30 * patternVisibility;
        
        // Forme amoeba (blobby)
        const numPoints = Math.floor(Math.random() * 5) + 6;
        let pathData = '';
        
        for (let j = 0; j < numPoints; j++) {
            const angle = (j / numPoints) * Math.PI * 2;
            // Rayon plus varié avec niveau de détail élevé
            const radius = size * (0.7 + Math.random() * (0.3 + 0.3 * patternVisibility));
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            
            pathData += (j === 0 ? 'M ' : ' L ') + px + ' ' + py;
        }
        
        // Fermer le chemin
        pathData += ' Z';
        
        // Choisir entre une forme pleine ou juste un contour
        const fillOrStroke = Math.random();
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        const shapeGroup = bgGroup.append("g");
        
        if (fillOrStroke < 0.5) {
            // Forme pleine avec une couleur
            const shape = shapeGroup.append("path")
                .attr("d", pathData)
                .attr("fill", color)
                .attr("stroke", "none");
                
            animatableShapes.push({
                type: "filledShape",
                element: shape,
                center: {x, y},
                pathData: pathData
            });
        } else {
            // Contour avec une autre couleur
            const shape = shapeGroup.append("path")
                .attr("d", pathData)
                .attr("fill", "none")
                .attr("stroke", color)
                .attr("stroke-width", Math.random() * 2 + 1 + patternVisibility);
                
            animatableShapes.push({
                type: "outlineShape",
                element: shape,
                center: {x, y},
                pathData: pathData
            });
        }
    }
    
    // 2. Lignes fines - élément signature de Miró
    // Nombre basé sur le niveau de détail
    const numLines = Math.floor(width / 90) + Math.floor(patternVisibility * 12);
    
    for (let i = 0; i < numLines; i++) {
        const x1 = Math.random() * width;
        const y1 = Math.random() * height;
        const length = Math.random() * 150 + 50 + 50 * patternVisibility;
        const angle = Math.random() * Math.PI * 2;
        
        // Calculer le point final avec une légère courbure
        const x2 = x1 + Math.cos(angle) * length;
        const y2 = y1 + Math.sin(angle) * length;
        
        // Point de contrôle pour la courbe - plus varié avec niveau de détail élevé
        const variation = 25 + 25 * patternVisibility;
        const cpx = (x1 + x2) / 2 + (Math.random() * variation - variation/2);
        const cpy = (y1 + y2) / 2 + (Math.random() * variation - variation/2);
        
        // Dessiner une ligne courbe fine
        const line = bgGroup.append("path")
            .attr("d", `M ${x1} ${y1} Q ${cpx} ${cpy}, ${x2} ${y2}`)
            .attr("fill", "none")
            .attr("stroke", colors[Math.floor(Math.random() * colors.length)])
            .attr("stroke-width", Math.random() * 1.2 + 0.6 + 0.4 * patternVisibility);
        
        animatableShapes.push({
            type: "line",
            element: line,
            points: {x1, y1, cpx, cpy, x2, y2}
        });
    }
    
    // 3. Étoiles et formes solaires - motifs emblématiques de Miró
    // Nombre basé sur le niveau de détail
    const numSolars = Math.floor(width / 280) + Math.floor(patternVisibility * 5);
    
    for (let i = 0; i < numSolars; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 40 + 15 + 20 * patternVisibility;
        
        // Type de forme
        const shapeType = Math.floor(Math.random() * 3);
        const shapeGroup = bgGroup.append("g");
        
        switch (shapeType) {
            case 0: // Étoile simplifiée
                const numRays = Math.floor(Math.random() * 5) + 4;
                
                for (let j = 0; j < numRays; j++) {
                    const angle = (j / numRays) * Math.PI * 2;
                    const outer = size;
                    
                    // Point externe
                    const x1 = x + Math.cos(angle) * outer;
                    const y1 = y + Math.sin(angle) * outer;
                    
                    // Dessiner une ligne simple pour chaque rayon
                    shapeGroup.append("line")
                        .attr("x1", x)
                        .attr("y1", y)
                        .attr("x2", x1)
                        .attr("y2", y1)
                        .attr("stroke", colors[4]) // Noir pour les lignes
                        .attr("stroke-width", Math.random() * 1.5 + 0.7 + 0.3 * patternVisibility);
                }
                
                // Cercle central
                shapeGroup.append("circle")
                    .attr("cx", x)
                    .attr("cy", y)
                    .attr("r", size * 0.2)
                    .attr("fill", colors[Math.floor(Math.random() * 3)]); // Rouge, bleu ou jaune
                
                animatableShapes.push({
                    type: "star",
                    element: shapeGroup,
                    center: {x, y}
                });
                break;
                
            case 1: // Forme soleil
                // Disque central
                shapeGroup.append("circle")
                    .attr("cx", x)
                    .attr("cy", y)
                    .attr("r", size * 0.5)
                    .attr("fill", colors[2]); // Jaune
                
                // Rayons - nombre basé sur le niveau de détail
                const numSunRays = Math.floor(Math.random() * 4) + 6 + Math.floor(patternVisibility * 3);
                for (let j = 0; j < numSunRays; j++) {
                    const angle = (j / numSunRays) * Math.PI * 2;
                    const x1 = x + Math.cos(angle) * size * 0.6;
                    const y1 = y + Math.sin(angle) * size * 0.6;
                    const x2 = x + Math.cos(angle) * size;
                    const y2 = y + Math.sin(angle) * size;
                    
                    shapeGroup.append("line")
                        .attr("x1", x1)
                        .attr("y1", y1)
                        .attr("x2", x2)
                        .attr("y2", y2)
                        .attr("stroke", colors[4]) // Noir
                        .attr("stroke-width", Math.random() * 1.2 + 0.6 + 0.3 * patternVisibility);
                }
                
                animatableShapes.push({
                    type: "sun",
                    element: shapeGroup,
                    center: {x, y}
                });
                break;
                
            case 2: // Points avec cercles concentriques
                // Point central
                shapeGroup.append("circle")
                    .attr("cx", x)
                    .attr("cy", y)
                    .attr("r", Math.random() * 5 + 2 + patternVisibility)
                    .attr("fill", colors[Math.floor(Math.random() * colors.length)]);
                
                // Cercles concentriques - nombre basé sur le niveau de détail
                const numRings = Math.floor(Math.random() * 2) + 1 + Math.floor(patternVisibility * 2);
                for (let j = 0; j < numRings; j++) {
                    const ringRadius = size * (0.3 + j * 0.3);
                    
                    shapeGroup.append("circle")
                        .attr("cx", x)
                        .attr("cy", y)
                        .attr("r", ringRadius)
                        .attr("fill", "none")
                        .attr("stroke", colors[Math.floor(Math.random() * colors.length)])
                        .attr("stroke-width", Math.random() * 1.5 + 0.5 + 0.3 * patternVisibility);
                }
                
                animatableShapes.push({
                    type: "concentricCircles",
                    element: shapeGroup,
                    center: {x, y}
                });
                break;
        }
    }
    
    // Ajouter des animations si activées
    if (animation) {
        animatableShapes.forEach((shape, index) => {
            const delay = index * 0.05; // Décalage pour éviter que tout bouge en même temps
            const duration = (10 + Math.random() * 10) / animationSpeed;
            
            switch (shape.type) {
                case "filledShape":
                case "outlineShape":
                    // Animation subtile de déformation
                    if (index % 4 === 0) { // Animer seulement certaines formes
                        // Créer une transformation au centre de la forme
                        const scaleAnim = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
                        scaleAnim.setAttribute("attributeName", "transform");
                        scaleAnim.setAttribute("type", "scale");
                        scaleAnim.setAttribute("from", "1 1");
                        scaleAnim.setAttribute("to", `${1 + 0.05 * patternVisibility} ${1 - 0.05 * patternVisibility}`);
                        scaleAnim.setAttribute("dur", `${duration}s`);
                        scaleAnim.setAttribute("repeatCount", "indefinite");
                        scaleAnim.setAttribute("additive", "sum");
                        
                        shape.element.attr("transform-origin", `${shape.center.x}px ${shape.center.y}px`);
                        shape.element.node().appendChild(scaleAnim);
                    }
                    break;
                    
                case "line":
                    // Animation subtile d'ondulation
                    if (index % 3 === 0) { // Animer seulement certaines lignes
                        const points = shape.points;
                        const originalCPY = points.cpy;
                        const variation = 5 * patternVisibility;
                        
                        // Animation du point de contrôle vertical
                        const lineAnim = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                        lineAnim.setAttribute("attributeName", "d");
                        lineAnim.setAttribute("values", 
                            `M ${points.x1} ${points.y1} Q ${points.cpx} ${originalCPY - variation}, ${points.x2} ${points.y2};` +
                            `M ${points.x1} ${points.y1} Q ${points.cpx} ${originalCPY + variation}, ${points.x2} ${points.y2};` +
                            `M ${points.x1} ${points.y1} Q ${points.cpx} ${originalCPY - variation}, ${points.x2} ${points.y2}`
                        );
                        lineAnim.setAttribute("dur", `${duration * 1.5}s`);
                        lineAnim.setAttribute("repeatCount", "indefinite");
                        
                        shape.element.node().appendChild(lineAnim);
                    }
                    break;
                    
                case "star":
                case "sun":
                    // Rotation très lente
                    if (index % 2 === 0) { // Animer seulement certaines étoiles/soleils
                        const rotateAnim = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
                        rotateAnim.setAttribute("attributeName", "transform");
                        rotateAnim.setAttribute("type", "rotate");
                        rotateAnim.setAttribute("from", `0 ${shape.center.x} ${shape.center.y}`);
                        rotateAnim.setAttribute("to", `360 ${shape.center.x} ${shape.center.y}`);
                        rotateAnim.setAttribute("dur", `${(30 + Math.random() * 30) / animationSpeed}s`);
                        rotateAnim.setAttribute("repeatCount", "indefinite");
                        
                        shape.element.node().appendChild(rotateAnim);
                    }
                    break;
                    
                case "concentricCircles":
                    // Pulsation subtile
                    if (index % 2 === 0) { // Animer seulement certains cercles
                        const pulseAnim = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
                        pulseAnim.setAttribute("attributeName", "transform");
                        pulseAnim.setAttribute("type", "scale");
                        pulseAnim.setAttribute("from", "1 1");
                        pulseAnim.setAttribute("to", `${1 + 0.1 * patternVisibility} ${1 + 0.1 * patternVisibility}`);
                        pulseAnim.setAttribute("dur", `${duration * 2}s`);
                        pulseAnim.setAttribute("repeatCount", "indefinite");
                        pulseAnim.setAttribute("additive", "sum");
                        
                        shape.element.attr("transform-origin", `${shape.center.x}px ${shape.center.y}px`);
                        shape.element.node().appendChild(pulseAnim);
                    }
                    break;
            }
        });
    }
    
    console.log("Génération du fond Miró terminée.");
}

// Fond inspiré de Piet Mondrian avec tous les paramètres utilisateur
function setupMondrianBackground(svg) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const defs = svg.append("defs");
    
    // Récupérer tous les paramètres
    const opacity = parseFloat(localStorage.getItem('backgroundOpacity') || 0.15);
    const patternVisibility = parseFloat(localStorage.getItem('patternVisibility') || 1.0);
    const animation = localStorage.getItem('backgroundAnimation') === 'true';
    const animationSpeed = parseFloat(localStorage.getItem('animationSpeed') || 1.0);
    const customColor = localStorage.getItem('backgroundCustomColor') || '#3F51B5';
    
    console.log("PARAMÈTRES MONDRIAN:", {
        opacity,
        patternVisibility,
        animation: animation ? "ACTIVÉ" : "DÉSACTIVÉ",
        animationSpeed,
        customColor
    });
    
    // Nettoyer tout fond existant
    svg.selectAll(".background-element").remove();
    
    // Créer un groupe pour le fond
    const bgGroup = svg.append("g")
        .attr("class", "background-element")
        .attr("pointer-events", "none")
        .style("opacity", opacity)
        .lower();
    
    // Fond de base blanc, caractéristique de Mondrian
    bgGroup.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#f5f5f5");
    
    // Préparer les couleurs primaires caractéristiques de Mondrian
    // Influencées par la couleur personnalisée de façon subtile
    const baseColor = d3.rgb(customColor);
    
    // Rouge Mondrian - légèrement influencé par la couleur personnalisée
    const redColor = d3.rgb(
        Math.min(255, 230 + baseColor.r * 0.1),
        Math.max(0, baseColor.g * 0.1),
        Math.max(0, baseColor.b * 0.1)
    );
    
    // Bleu Mondrian - légèrement influencé par la couleur personnalisée
    const blueColor = d3.rgb(
        Math.max(0, baseColor.r * 0.1),
        Math.max(0, baseColor.g * 0.2),
        Math.min(255, 200 + baseColor.b * 0.2)
    );
    
    // Jaune Mondrian - légèrement influencé par la couleur personnalisée
    const yellowColor = d3.rgb(
        Math.min(255, 240 + baseColor.r * 0.06),
        Math.min(255, 220 + baseColor.g * 0.06),
        Math.max(0, baseColor.b * 0.05)
    );
    
    // Blanc et noir - pour les zones neutres et les lignes
    const whiteColor = d3.rgb(255, 255, 255);
    const blackColor = d3.rgb(0, 0, 0);
    
    // Convertir en rgba pour pouvoir ajuster l'opacité
    // Opacité plus forte pour les couleurs primaires pour qu'elles ressortent bien
    const colors = [
        redColor.toString().replace(')', ', 0.75)').replace('rgb', 'rgba'),
        blueColor.toString().replace(')', ', 0.75)').replace('rgb', 'rgba'),
        yellowColor.toString().replace(')', ', 0.75)').replace('rgb', 'rgba'),
        whiteColor.toString().replace(')', ', 0.75)').replace('rgb', 'rgba')
    ];
    
    // Créer la grille Mondrian
    // L'algorithme divise récursivement la toile en rectangles
    // qui seront colorés selon les règles stylistiques de Mondrian
    
    // Structure pour stocker les rectangles
    const rectangles = [];
    const animatableRectangles = [];
    
    // Commencer avec un grand rectangle couvrant toute la zone
    const initialRect = {
        x: 0,
        y: 0,
        width: width,
        height: height,
        filled: false
    };
    
    // Liste de rectangles à diviser
    const rectsToDivide = [initialRect];
    
    // Le nombre de divisions est influencé par le niveau de détail
    const numDivisions = Math.floor(10 + patternVisibility * 20);
    
    // Diviser récursivement
    for (let i = 0; i < numDivisions && rectsToDivide.length > 0; i++) {
        // Choisir aléatoirement un rectangle non divisé
        const randomIndex = Math.floor(Math.random() * rectsToDivide.length);
        const rect = rectsToDivide.splice(randomIndex, 1)[0];
        
        // Diviser horizontalement ou verticalement
        const divideHorizontally = Math.random() < 0.5;
        
        if (divideHorizontally && rect.width > 100) {
            // Position de la division, légèrement décalée du centre
            const divideAt = rect.width * (0.3 + Math.random() * 0.4);
            
            // Créer deux nouveaux rectangles
            const leftRect = {
                x: rect.x,
                y: rect.y,
                width: divideAt,
                height: rect.height,
                filled: false
            };
            
            const rightRect = {
                x: rect.x + divideAt,
                y: rect.y,
                width: rect.width - divideAt,
                height: rect.height,
                filled: false
            };
            
            // Ajouter les nouveaux rectangles à la liste
            rectsToDivide.push(leftRect, rightRect);
            rectangles.push(leftRect, rightRect);
            
            // Stocker la ligne de division
            rectangles.push({
                isLine: true,
                x1: rect.x + divideAt,
                y1: rect.y,
                x2: rect.x + divideAt,
                y2: rect.y + rect.height
            });
        } 
        else if (!divideHorizontally && rect.height > 100) {
            // Position de la division, légèrement décalée du centre
            const divideAt = rect.height * (0.3 + Math.random() * 0.4);
            
            // Créer deux nouveaux rectangles
            const topRect = {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: divideAt,
                filled: false
            };
            
            const bottomRect = {
                x: rect.x,
                y: rect.y + divideAt,
                width: rect.width,
                height: rect.height - divideAt,
                filled: false
            };
            
            // Ajouter les nouveaux rectangles à la liste
            rectsToDivide.push(topRect, bottomRect);
            rectangles.push(topRect, bottomRect);
            
            // Stocker la ligne de division
            rectangles.push({
                isLine: true,
                x1: rect.x,
                y1: rect.y + divideAt,
                x2: rect.x + rect.width,
                y2: rect.y + divideAt
            });
        } 
        else {
            // Si le rectangle ne peut plus être divisé, le conserver tel quel
            rectangles.push(rect);
        }
    }
    
    // Ajouter les rectangles restants qui n'ont pas été divisés
    rectangles.push(...rectsToDivide);
    
    // Sélectionner quelques rectangles pour être colorés (caractéristique de Mondrian)
    // Le pourcentage de rectangles colorés dépend du niveau de détail
    const coloredRectCount = Math.floor(rectangles.length * 0.15 * patternVisibility);
    
    // Exclure les lignes de division
    const fillableRects = rectangles.filter(r => !r.isLine);
    
    // Mélanger pour une sélection aléatoire
    const shuffled = [...fillableRects].sort(() => 0.5 - Math.random());
    
    // Sélectionner et marquer les rectangles à colorer
    for (let i = 0; i < coloredRectCount && i < shuffled.length; i++) {
        shuffled[i].filled = true;
        // Sélectionner aléatoirement une couleur pour chaque rectangle
        shuffled[i].fillColor = colors[Math.floor(Math.random() * colors.length)];
    }
    
    // Dessiner les rectangles et les lignes
    rectangles.forEach(rect => {
        if (rect.isLine) {
            // Dessiner une ligne de division
            // Épaisseur basée sur le niveau de détail
            const lineWidth = 2 + patternVisibility * 3;
            
            const line = bgGroup.append("line")
                .attr("x1", rect.x1)
                .attr("y1", rect.y1)
                .attr("x2", rect.x2)
                .attr("y2", rect.y2)
                .attr("stroke", blackColor.toString())
                .attr("stroke-width", lineWidth);
        } 
        else {
            // Dessiner un rectangle
            const rectElement = bgGroup.append("rect")
                .attr("x", rect.x)
                .attr("y", rect.y)
                .attr("width", rect.width)
                .attr("height", rect.height)
                .attr("fill", rect.filled ? rect.fillColor : whiteColor.toString())
                .attr("stroke", blackColor.toString())
                .attr("stroke-width", 2 + patternVisibility * 3);
            
            // Si le rectangle est coloré, l'ajouter à la liste des éléments animables
            if (rect.filled) {
                animatableRectangles.push({
                    element: rectElement,
                    rect: rect
                });
            }
        }
    });
    
    // Ajouter des animations si activées
    if (animation) {
        animatableRectangles.forEach((animRect, i) => {
            const delay = i * 0.1;
            const duration = (15 + Math.random() * 10) / animationSpeed;
            
            // Animation de couleur - transition lente entre différentes couleurs primaires
            if (i % 3 === 0) { // Animer seulement certains rectangles
                const colorAnim = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                colorAnim.setAttribute("attributeName", "fill");
                colorAnim.setAttribute("values", `${animRect.rect.fillColor};${colors[(colors.indexOf(animRect.rect.fillColor) + 1) % colors.length]};${animRect.rect.fillColor}`);
                colorAnim.setAttribute("dur", `${duration}s`);
                colorAnim.setAttribute("repeatCount", "indefinite");
                colorAnim.setAttribute("begin", `${delay}s`);
                
                animRect.element.node().appendChild(colorAnim);
            }
            
            // Animation de léger déplacement - très subtile pour ne pas compromettre le style
            if (i % 4 === 0 && patternVisibility > 0.5) {
                const moveAnim = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
                moveAnim.setAttribute("attributeName", "transform");
                moveAnim.setAttribute("type", "translate");
                moveAnim.setAttribute("values", `0,0; ${2 * patternVisibility},0; 0,0; ${-2 * patternVisibility},0; 0,0`);
                moveAnim.setAttribute("dur", `${duration * 1.5}s`);
                moveAnim.setAttribute("repeatCount", "indefinite");
                moveAnim.setAttribute("begin", `${delay}s`);
                
                animRect.element.node().appendChild(moveAnim);
            }
        });
    }
    
    console.log("Génération du fond Mondrian terminée.");
}

// Fonction pour créer un parchemin amélioré avec couleur et animation renforcées
function setupParchmentBackgroundFixed(svg) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const defs = svg.append("defs");
    
    // Récupérer tous les paramètres et les afficher immédiatement
    const opacity = parseFloat(localStorage.getItem('backgroundOpacity') || 0.15);
    const patternVisibility = parseFloat(localStorage.getItem('patternVisibility') || 1.0);
    const animation = localStorage.getItem('backgroundAnimation') === 'true';
    const animationSpeed = parseFloat(localStorage.getItem('animationSpeed') || 1.0);
    const customColor = localStorage.getItem('backgroundCustomColor') || '#3F51B5';
    
    console.log("PARAMÈTRES PARCHEMIN RÉCUPÉRÉS:", {
        opacity,
        patternVisibility,
        animation: animation ? "ACTIVÉ" : "DÉSACTIVÉ",
        animationSpeed,
        customColor
    });
    
    // Nettoyer tout fond existant
    svg.selectAll(".background-element").remove();
    
    // Créer un groupe pour le fond
    const bgGroup = svg.append("g")
        .attr("class", "background-element")
        .attr("pointer-events", "none")
        .style("opacity", opacity)
        .lower();
    
    // RENFORCER L'INFLUENCE DE LA COULEUR PERSONNALISÉE
    // Créer une couleur parchemin influencée plus fortement par la couleur personnalisée
    const baseColor = d3.rgb(customColor);
    
    // Augmenter l'influence de la couleur personnalisée (de 20% à 40%)
    const parchmentBase = d3.rgb(
        Math.min(255, baseColor.r * 0.4 + 180),
        Math.min(255, baseColor.g * 0.4 + 160),
        Math.min(255, baseColor.b * 0.4 + 120)
    );
    
    // Variations de couleur plus prononcées
    const parchmentLight = d3.rgb(
        Math.min(255, parchmentBase.r + 25),
        Math.min(255, parchmentBase.g + 25),
        Math.min(255, parchmentBase.b + 25)
    );
    
    const parchmentDark = d3.rgb(
        Math.max(0, parchmentBase.r - 30),
        Math.max(0, parchmentBase.g - 30),
        Math.max(0, parchmentBase.b - 30)
    );
    
    const parchmentStain = d3.rgb(
        Math.max(0, parchmentBase.r - 40),
        Math.max(0, parchmentBase.g - 35),
        Math.max(0, parchmentBase.b - 20)
    );
    
    // Afficher les couleurs dérivées pour débogage
    console.log("COULEURS DÉRIVÉES:", {
        baseColor: baseColor.toString(),
        parchmentBase: parchmentBase.toString(),
        parchmentLight: parchmentLight.toString(),
        parchmentDark: parchmentDark.toString(),
        parchmentStain: parchmentStain.toString()
    });
    
    // Fond de base avec couleur parchemin
    bgGroup.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", parchmentBase.toString());
    
    // 1. Grandes variations de couleur - taches plus larges
    const numLargeVariations = Math.floor(30 + 50 * patternVisibility);
    const largeVariations = [];
    
    for (let i = 0; i < numLargeVariations; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = Math.random() * 100 + 30;
        
        const colorToUse = i % 2 === 0 ? parchmentLight : parchmentDark;
        
        const element = bgGroup.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", r)
            .attr("fill", colorToUse.toString())
            .attr("opacity", Math.random() * 0.3 + 0.15);
        
        largeVariations.push({ element, x, y, r });
    }
    
    // 2. Petites taches pour simuler les fibres du papier
    const numSmallVariations = Math.floor(500 + 2500 * patternVisibility);
    
    for (let i = 0; i < numSmallVariations; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = Math.random() * 2;
        
        bgGroup.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", r)
            .attr("fill", parchmentDark.toString())
            .attr("opacity", Math.random() * 0.3 + 0.1);
    }
    
    // 3. Ajouter quelques lignes pour simuler des plis
    const numFolds = Math.floor(3 + 7 * patternVisibility);
    const folds = [];
    
    for (let i = 0; i < numFolds; i++) {
        const x1 = Math.random() * width;
        const y1 = Math.random() * height;
        const angle = Math.random() * Math.PI;
        const length = Math.random() * Math.min(width, height) * 0.8;
        const x2 = x1 + Math.cos(angle) * length;
        const y2 = y1 + Math.sin(angle) * length;
        
        const element = bgGroup.append("line")
            .attr("x1", x1)
            .attr("y1", y1)
            .attr("x2", x2)
            .attr("y2", y2)
            .attr("stroke", parchmentDark.toString())
            .attr("stroke-width", 1.5)
            .attr("opacity", 0.4);
        
        folds.push({ element, x1, y1, x2, y2 });
    }
    
    // 4. Ajouter quelques taches de vieillissement
    const numStains = Math.floor(5 + 10 * patternVisibility);
    const stains = [];
    
    for (let i = 0; i < numStains; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 60 + 20;
        
        const element = bgGroup.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", size)
            .attr("fill", parchmentStain.toString())
            .attr("opacity", Math.random() * 0.2 + 0.1);
        
        stains.push({ element, x, y, size });
    }
    
    // 5. Appliquer une vignette autour des bords pour un effet vintage
    const vignetteId = `parchment-vignette-${Date.now()}`;
    const vignetteGradient = defs.append("radialGradient")
        .attr("id", vignetteId)
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
        .attr("fill", `url(#${vignetteId})`);
    
    // RENFORCER LES ANIMATIONS
    if (animation) {
        console.log("ANIMATIONS ACTIVÉES avec vitesse:", animationSpeed);
        
        // Animation plus visible pour plus de variations
        largeVariations.forEach((variation, i) => {
            // Animer plus d'éléments (50% au lieu de 33%)
            if (i % 2 === 0) {
                const delay = i * 0.1;
                const duration = (8 + Math.random() * 7) / animationSpeed;
                
                // Animation de pulsation plus prononcée
                const anim = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                anim.setAttribute("attributeName", "r");
                anim.setAttribute("values", `${variation.r};${variation.r * 1.2};${variation.r}`); // Amplitude augmentée
                anim.setAttribute("dur", `${duration}s`);
                anim.setAttribute("repeatCount", "indefinite");
                anim.setAttribute("begin", `${delay}s`);
                
                variation.element.node().appendChild(anim);
                
                // Ajouter aussi une légère animation d'opacité
                const opacityAnim = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                opacityAnim.setAttribute("attributeName", "opacity");
                const baseOpacity = parseFloat(variation.element.attr("opacity"));
                opacityAnim.setAttribute("values", `${baseOpacity};${baseOpacity * 1.3};${baseOpacity}`);
                opacityAnim.setAttribute("dur", `${duration * 1.5}s`); // Durée légèrement différente pour un effet plus naturel
                opacityAnim.setAttribute("repeatCount", "indefinite");
                opacityAnim.setAttribute("begin", `${delay * 1.2}s`);
                
                variation.element.node().appendChild(opacityAnim);
            }
        });
        
        // Animation pour les plis
        folds.forEach((fold, i) => {
            if (i % 2 === 0) {
                const delay = i * 0.3;
                const duration = (12 + Math.random() * 8) / animationSpeed;
                
                // Animation d'opacité pour les plis
                const anim = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                anim.setAttribute("attributeName", "opacity");
                anim.setAttribute("values", "0.4;0.6;0.4");
                anim.setAttribute("dur", `${duration}s`);
                anim.setAttribute("repeatCount", "indefinite");
                anim.setAttribute("begin", `${delay}s`);
                
                fold.element.node().appendChild(anim);
            }
        });
        
        // Animation plus visible pour les taches
        stains.forEach((stain, i) => {
            const delay = i * 0.5;
            const duration = (15 + Math.random() * 10) / animationSpeed;
            
            // Animation d'opacité plus prononcée
            const anim = document.createElementNS("http://www.w3.org/2000/svg", "animate");
            anim.setAttribute("attributeName", "opacity");
            const baseOpacity = parseFloat(stain.element.attr("opacity")) || 0.1;
            anim.setAttribute("values", `${baseOpacity};${baseOpacity * 2};${baseOpacity}`); // Contraste augmenté
            anim.setAttribute("dur", `${duration}s`);
            anim.setAttribute("repeatCount", "indefinite");
            anim.setAttribute("begin", `${delay}s`);
            
            stain.element.node().appendChild(anim);
            
            // Ajouter aussi une très légère animation de taille
            const sizeAnim = document.createElementNS("http://www.w3.org/2000/svg", "animate");
            sizeAnim.setAttribute("attributeName", "r");
            sizeAnim.setAttribute("values", `${stain.size};${stain.size * 1.1};${stain.size}`);
            sizeAnim.setAttribute("dur", `${duration * 1.3}s`);
            sizeAnim.setAttribute("repeatCount", "indefinite");
            sizeAnim.setAttribute("begin", `${delay * 1.5}s`);
            
            stain.element.node().appendChild(sizeAnim);
        });
    } else {
        console.log("ANIMATIONS DÉSACTIVÉES");
    }
    
    console.log("Génération du fond parchemin terminée.");
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

// Fond avec bulles transparentes et brillantes avec tous les paramètres utilisateur
function setupBubblesBackground(svg) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const defs = svg.append("defs");
    
    // Récupérer tous les paramètres
    const opacity = parseFloat(localStorage.getItem('backgroundOpacity') || 0.15);
    const patternVisibility = parseFloat(localStorage.getItem('patternVisibility') || 1.0);
    const animation = localStorage.getItem('backgroundAnimation') === 'true';
    const animationSpeed = parseFloat(localStorage.getItem('animationSpeed') || 1.0);
    const customColor = localStorage.getItem('backgroundCustomColor') || '#3F51B5';
    
    console.log("PARAMÈTRES BULLES:", {
        opacity,
        patternVisibility,
        animation: animation ? "ACTIVÉ" : "DÉSACTIVÉ",
        animationSpeed,
        customColor
    });
    
    // Nettoyer tout fond existant
    svg.selectAll(".background-element").remove();
    
    // Créer un groupe pour le fond
    const bgGroup = svg.append("g")
        .attr("class", "background-element")
        .attr("pointer-events", "none")
        .style("opacity", opacity)
        .lower();
    
    // Fond de base avec gradient subtil
    const baseColor = d3.rgb(customColor);
    
    // Créer un dégradé radial du centre vers l'extérieur
    const gradientId = `bubbles-bg-gradient-${Date.now()}`;
    const bgGradient = defs.append("radialGradient")
        .attr("id", gradientId)
        .attr("cx", "50%")
        .attr("cy", "50%")
        .attr("r", "70%")
        .attr("fx", "50%")
        .attr("fy", "50%");
    
    // Couleur centrale légèrement plus claire
    const centerColor = d3.rgb(
        Math.min(255, baseColor.r * 0.2 + 220),
        Math.min(255, baseColor.g * 0.2 + 220),
        Math.min(255, baseColor.b * 0.2 + 230)
    );
    
    // Couleur extérieure légèrement plus foncée
    const outerColor = d3.rgb(
        Math.min(255, baseColor.r * 0.2 + 210),
        Math.min(255, baseColor.g * 0.2 + 210),
        Math.min(255, baseColor.b * 0.2 + 220)
    );
    
    bgGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", centerColor.toString());
    
    bgGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", outerColor.toString());
    
    bgGroup.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", `url(#${gradientId})`);
    
    // Créer un filtre de flou pour adoucir les ombres
    const blurFilter = defs.append("filter")
        .attr("id", "soft-blur")
        .attr("x", "-50%")
        .attr("y", "-50%")
        .attr("width", "200%")
        .attr("height", "200%");
        
    blurFilter.append("feGaussianBlur")
        .attr("in", "SourceGraphic")
        .attr("stdDeviation", "1");
        
    // Définir un gradient pour les bulles (semi-transparent)
    const bubbleGradientId = `bubble-gradient-${Date.now()}`;
    const bubbleGradient = defs.append("radialGradient")
        .attr("id", bubbleGradientId)
        .attr("cx", "35%")
        .attr("cy", "35%")
        .attr("r", "60%")
        .attr("fx", "35%")
        .attr("fy", "35%");
    
    // Créer un effet semi-transparent avec dégradé pour aspect 3D
    bubbleGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", `rgba(255, 255, 255, 0.85)`);
    
    bubbleGradient.append("stop")
        .attr("offset", "25%")
        .attr("stop-color", `rgba(245, 245, 255, 0.75)`);
    
    bubbleGradient.append("stop")
        .attr("offset", "70%")
        .attr("stop-color", `rgba(230, 230, 255, 0.65)`);
    
    bubbleGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", `rgba(220, 220, 255, 0.6)`);
    
    // Créer les bulles en ordre de profondeur pour une superposition correcte
    // 1. Générer toutes les bulles d'abord
    const bubbleData = [];
    const numBubbles = Math.floor(20 + patternVisibility * 80);
    
    for (let i = 0; i < numBubbles; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * Math.random() * 100 + 10 + patternVisibility * 40;
        
        // Attribuer un z-index pour la profondeur (les petites bulles en arrière-plan)
        // Les grandes bulles auront tendance à être au premier plan
        const zIndex = size * (0.8 + Math.random() * 0.4); // Un peu de hasard mais favorise les grandes bulles
        
        bubbleData.push({
            x: x,
            y: y,
            r: size,
            zIndex: zIndex
        });
    }
    
    // 2. Trier les bulles par z-index (profondeur) - d'abord les plus petites (arrière-plan)
    bubbleData.sort((a, b) => a.zIndex - b.zIndex);
    
    // 3. Dessiner les bulles dans l'ordre de profondeur
    const bubbles = [];
    
    bubbleData.forEach((data, i) => {
        // Couleur du contour légèrement teintée de la couleur personnalisée
        const strokeColorBase = d3.rgb(
            Math.min(255, baseColor.r * 0.5 + 100),
            Math.min(255, baseColor.g * 0.5 + 100),
            Math.min(255, baseColor.b * 0.5 + 120)
        );
        
        // Couleur de base pour la bulle, légèrement teintée de la couleur personnalisée
        const bubbleBaseColor = d3.rgb(
            Math.min(255, 220 + baseColor.r * 0.1),
            Math.min(255, 220 + baseColor.g * 0.1),
            Math.min(255, 230 + baseColor.b * 0.1)
        );
        
        // Créer un gradient unique pour chaque bulle
        const uniqueBubbleGradientId = `bubble-gradient-${i}-${Date.now()}`;
        const uniqueBubbleGradient = defs.append("radialGradient")
            .attr("id", uniqueBubbleGradientId)
            .attr("cx", "35%")
            .attr("cy", "35%")
            .attr("r", "60%")
            .attr("fx", "35%")
            .attr("fy", "35%");
        
        uniqueBubbleGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", `rgba(255, 255, 255, 0.9)`);
        
        uniqueBubbleGradient.append("stop")
            .attr("offset", "40%")
            .attr("stop-color", `rgba(${bubbleBaseColor.r}, ${bubbleBaseColor.g}, ${bubbleBaseColor.b}, 0.8)`);
        
        uniqueBubbleGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", `rgba(${Math.max(200, bubbleBaseColor.r - 20)}, ${Math.max(200, bubbleBaseColor.g - 20)}, ${Math.max(220, bubbleBaseColor.b - 10)}, 0.7)`);
        
        // Gradient d'ombre plus doux et intégré
        const bubbleShadowGradientId = `bubble-shadow-${i}-${Date.now()}`;
        const bubbleShadowGradient = defs.append("radialGradient")
            .attr("id", bubbleShadowGradientId)
            .attr("cx", "50%")
            .attr("cy", "50%")
            .attr("r", "70%")
            .attr("fx", "50%")
            .attr("fy", "50%");
            
        bubbleShadowGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", `rgba(0, 0, 0, 0)`);
            
        bubbleShadowGradient.append("stop")
            .attr("offset", "75%")
            .attr("stop-color", `rgba(0, 0, 0, 0.03)`);
            
        bubbleShadowGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", `rgba(0, 0, 0, 0.08)`);
        
        // Créer la bulle avec le gradient et un contour très léger
        const bubble = bgGroup.append("circle")
            .attr("cx", data.x)
            .attr("cy", data.y)
            .attr("r", data.r)
            .attr("fill", `url(#${uniqueBubbleGradientId})`)
            .attr("stroke", `rgba(${strokeColorBase.r}, ${strokeColorBase.g}, ${strokeColorBase.b}, 0.25)`)
            .attr("stroke-width", 0.5);
        
        // Ajouter un petit reflet pour l'effet de brillance (opaque)
        const highlightSize = data.r * 0.15;
        const highlightX = data.x - data.r * 0.15;
        const highlightY = data.y - data.r * 0.15;
        
        // Effet d'ombre plus subtil et mieux intégré
        const shadow = bgGroup.append("circle")
            .attr("cx", data.x + data.r * 0.03)
            .attr("cy", data.y + data.r * 0.03)
            .attr("r", data.r)
            .attr("fill", `url(#${bubbleShadowGradientId})`)
            .attr("stroke", "none")
            .attr("filter", "blur(1px)");
            
        // Reflet plus naturel avec effet de flou pour l'intégrer à la bulle
        const highlight = bgGroup.append("circle")
            .attr("cx", highlightX)
            .attr("cy", highlightY)
            .attr("r", highlightSize)
            .attr("fill", "rgba(255, 255, 255, 0.6)")
            .attr("filter", "url(#soft-blur)")
            .attr("stroke", "none");
        
        // Stocker les informations pour l'animation
        bubbles.push({
            mainElement: bubble,
            shadowElement: shadow,
            highlightElement: highlight,
            x: data.x,
            y: data.y,
            r: data.r,
            shadowX: data.x + data.r * 0.03,
            shadowY: data.y + data.r * 0.03,
            shadowR: data.r,
            highlightX: highlightX,
            highlightY: highlightY,
            highlightR: highlightSize
        });
    });
    
    // Ajouter des animations si activées
    if (animation) {
        bubbles.forEach((bubble, i) => {
            // Délai pour éviter que toutes les bulles ne bougent en même temps
            const delay = i * 0.02;
            // Durée variable selon la taille (les grandes bulles bougent plus lentement)
            const sizeFactor = Math.max(0.5, Math.min(2, bubble.r / 50));
            const duration = (10 + sizeFactor * 5) / animationSpeed;
            
            // Animation de mouvement flottant
            // Pour les bulles plus grandes, mouvement plus complexe
            if (bubble.r > 30 && i % 3 === 0) {
                // Amplitudes proportionnelles à la taille mais limitées
                const ampX = Math.min(width * 0.05, bubble.r * 2) * patternVisibility;
                const ampY = Math.min(height * 0.05, bubble.r * 2) * patternVisibility;
                
                // Animation de la bulle principale
                const mainAnimX = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                mainAnimX.setAttribute("attributeName", "cx");
                mainAnimX.setAttribute("values", `${bubble.x};${bubble.x + ampX};${bubble.x};${bubble.x - ampX};${bubble.x}`);
                mainAnimX.setAttribute("dur", `${duration}s`);
                mainAnimX.setAttribute("repeatCount", "indefinite");
                mainAnimX.setAttribute("begin", `${delay}s`);
                
                const mainAnimY = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                mainAnimY.setAttribute("attributeName", "cy");
                mainAnimY.setAttribute("values", `${bubble.y};${bubble.y - ampY};${bubble.y};${bubble.y + ampY};${bubble.y}`);
                mainAnimY.setAttribute("dur", `${duration * 1.3}s`);
                mainAnimY.setAttribute("repeatCount", "indefinite");
                mainAnimY.setAttribute("begin", `${delay * 1.1}s`);
                
                bubble.mainElement.node().appendChild(mainAnimX);
                bubble.mainElement.node().appendChild(mainAnimY);
                
                // Animation de l'ombre (doit suivre la bulle)
                const shadowAnimX = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                shadowAnimX.setAttribute("attributeName", "cx");
                shadowAnimX.setAttribute("values", `${bubble.shadowX};${bubble.shadowX + ampX};${bubble.shadowX};${bubble.shadowX - ampX};${bubble.shadowX}`);
                shadowAnimX.setAttribute("dur", `${duration}s`);
                shadowAnimX.setAttribute("repeatCount", "indefinite");
                shadowAnimX.setAttribute("begin", `${delay}s`);
                
                const shadowAnimY = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                shadowAnimY.setAttribute("attributeName", "cy");
                shadowAnimY.setAttribute("values", `${bubble.shadowY};${bubble.shadowY - ampY};${bubble.shadowY};${bubble.shadowY + ampY};${bubble.shadowY}`);
                shadowAnimY.setAttribute("dur", `${duration * 1.3}s`);
                shadowAnimY.setAttribute("repeatCount", "indefinite");
                shadowAnimY.setAttribute("begin", `${delay * 1.1}s`);
                
                bubble.shadowElement.node().appendChild(shadowAnimX);
                bubble.shadowElement.node().appendChild(shadowAnimY);
                
                // Animation du reflet (doit suivre la bulle)
                const highlightAnimX = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                highlightAnimX.setAttribute("attributeName", "cx");
                highlightAnimX.setAttribute("values", `${bubble.highlightX};${bubble.highlightX + ampX};${bubble.highlightX};${bubble.highlightX - ampX};${bubble.highlightX}`);
                highlightAnimX.setAttribute("dur", `${duration}s`);
                highlightAnimX.setAttribute("repeatCount", "indefinite");
                highlightAnimX.setAttribute("begin", `${delay}s`);
                
                const highlightAnimY = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                highlightAnimY.setAttribute("attributeName", "cy");
                highlightAnimY.setAttribute("values", `${bubble.highlightY};${bubble.highlightY - ampY};${bubble.highlightY};${bubble.highlightY + ampY};${bubble.highlightY}`);
                highlightAnimY.setAttribute("dur", `${duration * 1.3}s`);
                highlightAnimY.setAttribute("repeatCount", "indefinite");
                highlightAnimY.setAttribute("begin", `${delay * 1.1}s`);
                
                bubble.highlightElement.node().appendChild(highlightAnimX);
                bubble.highlightElement.node().appendChild(highlightAnimY);
            }
            // Pour les bulles moyennes, flottement vertical plus simple
            else if (bubble.r > 15 && i % 2 === 0) {
                const floatHeight = Math.min(50, bubble.r) * patternVisibility;
                
                const mainAnimY = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                mainAnimY.setAttribute("attributeName", "cy");
                mainAnimY.setAttribute("values", `${bubble.y};${bubble.y - floatHeight};${bubble.y};${bubble.y + floatHeight/3};${bubble.y}`);
                mainAnimY.setAttribute("dur", `${duration * 1.5}s`);
                mainAnimY.setAttribute("repeatCount", "indefinite");
                mainAnimY.setAttribute("begin", `${delay}s`);
                
                bubble.mainElement.node().appendChild(mainAnimY);
                
                const shadowAnimY = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                shadowAnimY.setAttribute("attributeName", "cy");
                shadowAnimY.setAttribute("values", `${bubble.shadowY};${bubble.shadowY - floatHeight};${bubble.shadowY};${bubble.shadowY + floatHeight/3};${bubble.shadowY}`);
                shadowAnimY.setAttribute("dur", `${duration * 1.5}s`);
                shadowAnimY.setAttribute("repeatCount", "indefinite");
                shadowAnimY.setAttribute("begin", `${delay}s`);
                
                bubble.shadowElement.node().appendChild(shadowAnimY);
                
                const highlightAnimY = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                highlightAnimY.setAttribute("attributeName", "cy");
                highlightAnimY.setAttribute("values", `${bubble.highlightY};${bubble.highlightY - floatHeight};${bubble.highlightY};${bubble.highlightY + floatHeight/3};${bubble.highlightY}`);
                highlightAnimY.setAttribute("dur", `${duration * 1.5}s`);
                highlightAnimY.setAttribute("repeatCount", "indefinite");
                highlightAnimY.setAttribute("begin", `${delay}s`);
                
                bubble.highlightElement.node().appendChild(highlightAnimY);
            }
            
            // Légère pulsation pour certaines bulles
            if (i % 3 === 0) {
                const pulseAmp = Math.min(0.15, 5 / bubble.r) * patternVisibility;
                
                const mainAnimR = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                mainAnimR.setAttribute("attributeName", "r");
                mainAnimR.setAttribute("values", `${bubble.r};${bubble.r * (1 + pulseAmp)};${bubble.r};${bubble.r * (1 - pulseAmp/2)};${bubble.r}`);
                mainAnimR.setAttribute("dur", `${duration * 2}s`);
                mainAnimR.setAttribute("repeatCount", "indefinite");
                mainAnimR.setAttribute("begin", `${delay * 2}s`);
                
                bubble.mainElement.node().appendChild(mainAnimR);
                
                const shadowAnimR = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                shadowAnimR.setAttribute("attributeName", "r");
                shadowAnimR.setAttribute("values", `${bubble.shadowR};${bubble.shadowR * (1 + pulseAmp)};${bubble.shadowR};${bubble.shadowR * (1 - pulseAmp/2)};${bubble.shadowR}`);
                shadowAnimR.setAttribute("dur", `${duration * 2}s`);
                shadowAnimR.setAttribute("repeatCount", "indefinite");
                shadowAnimR.setAttribute("begin", `${delay * 2}s`);
                
                bubble.shadowElement.node().appendChild(shadowAnimR);
                
                const highlightAnimR = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                highlightAnimR.setAttribute("attributeName", "r");
                highlightAnimR.setAttribute("values", `${bubble.highlightR};${bubble.highlightR * (1 + pulseAmp)};${bubble.highlightR};${bubble.highlightR * (1 - pulseAmp/2)};${bubble.highlightR}`);
                highlightAnimR.setAttribute("dur", `${duration * 2}s`);
                highlightAnimR.setAttribute("repeatCount", "indefinite");
                highlightAnimR.setAttribute("begin", `${delay * 2}s`);
                
                bubble.highlightElement.node().appendChild(highlightAnimR);
            }
        });
    }
    
    console.log("Génération du fond bulles opaques terminée.");
}

// Fond avec bulles semi-transparentes qui éclatent - avec option d'animation configurable
function setupPoppingBubblesBackground(svg) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const defs = svg.append("defs");
    
    const scaleFactor = Math.min(width, height) / 1000; // Ajustement selon la taille d'écran

    // Récupérer tous les paramètres
    const opacity = parseFloat(localStorage.getItem('backgroundOpacity') || 0.15);
    const patternVisibility = parseFloat(localStorage.getItem('patternVisibility') || 1.0);
    const animation = localStorage.getItem('backgroundAnimation') === 'true';
    const animationSpeed = parseFloat(localStorage.getItem('animationSpeed') || 1.0);
    const customColor = localStorage.getItem('backgroundCustomColor') || '#3F51B5';
    
    // console.log("PARAMÈTRES BULLES:", {
    //     opacity,
    //     patternVisibility,
    //     animation: animation ? "ACTIVÉ" : "DÉSACTIVÉ",
    //     animationSpeed,
    //     customColor
    // });
    
    // Nettoyer tout fond existant
    svg.selectAll(".background-element").remove();
    
    // Créer un groupe pour le fond
    const bgGroup = svg.append("g")
        .attr("class", "background-element")
        .style("opacity", opacity)
        .attr("pointer-events", "all")
        .lower();
        
    // Fond de base avec gradient subtil
    const baseColor = d3.rgb(customColor);
    
    // Créer un dégradé radial du centre vers l'extérieur
    const gradientId = `bubbles-bg-gradient-${Date.now()}`;
    const bgGradient = defs.append("radialGradient")
        .attr("id", gradientId)
        .attr("cx", "50%")
        .attr("cy", "50%")
        .attr("r", "70%")
        .attr("fx", "50%")
        .attr("fy", "50%");
    
    // Couleur centrale légèrement plus claire
    const centerColor = d3.rgb(
        Math.min(255, baseColor.r * 0.2 + 220),
        Math.min(255, baseColor.g * 0.2 + 220),
        Math.min(255, baseColor.b * 0.2 + 230)
    );
    
    // Couleur extérieure légèrement plus foncée
    const outerColor = d3.rgb(
        Math.min(255, baseColor.r * 0.2 + 210),
        Math.min(255, baseColor.g * 0.2 + 210),
        Math.min(255, baseColor.b * 0.2 + 220)
    );
    
    bgGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", centerColor.toString());
    
    bgGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", outerColor.toString());
    
    bgGroup.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", `url(#${gradientId})`)
        .attr("pointer-events", "none");
    
    // Créer un filtre de flou pour adoucir les ombres
    const blurFilter = defs.append("filter")
        .attr("id", "soft-blur")
        .attr("x", "-50%")
        .attr("y", "-50%")
        .attr("width", "200%")
        .attr("height", "200%");
        
    blurFilter.append("feGaussianBlur")
        .attr("in", "SourceGraphic")
        .attr("stdDeviation", "1");
        
    // Tableau pour stocker toutes les informations des bulles
    const bubbles = [];
    
    // Fonction pour éclater une bulle
    function popBubble(bubble) {
        if (bubble.popped) return;
        
        bubble.popped = true;
        
        // Créer des fragments d'éclatement (petites bulles qui s'éloignent)
        // Ajuster le nombre de fragments selon si l'animation est activée
        const numFragments = animation ? 
            Math.floor(5 + Math.random() * 8) : 
            Math.floor(3 + Math.random() * 4);
        
        const fragments = [];
        
        for (let i = 0; i < numFragments; i++) {
            const angle = (i / numFragments) * Math.PI * 2;
            const distance = bubble.r * 0.8;
            
            // Position initiale autour de la bulle
            const fragX = bubble.x + Math.cos(angle) * (bubble.r * 0.5);
            const fragY = bubble.y + Math.sin(angle) * (bubble.r * 0.5);
            
            // Taille du fragment (plus petit que la bulle)
            const fragSize = bubble.r * (0.1 + Math.random() * 0.2);
            
            // Créer un fragment d'éclatement
            const fragment = bubble.group.append("circle")
                .attr("cx", fragX)
                .attr("cy", fragY)
                .attr("r", fragSize)
                .attr("fill", "rgba(255, 255, 255, 0.8)")
                .attr("stroke", "rgba(200, 200, 255, 0.5)")
                .attr("stroke-width", 0.5);
                
            fragments.push({
                element: fragment,
                x: fragX,
                y: fragY,
                targetX: fragX + Math.cos(angle) * distance * (1 + Math.random()),
                targetY: fragY + Math.sin(angle) * distance * (1 + Math.random()),
                size: fragSize,
                angle: angle
            });
        }
        
        // Animation d'éclatement de la bulle principale
        bubble.mainElement
            .transition()
            .duration(150)
            .attr("r", bubble.r * 1.2)
            .style("opacity", 0)
            .remove();
            
        bubble.shadowElement
            .transition()
            .duration(100)
            .style("opacity", 0)
            .remove();
            
        bubble.highlightElement
            .transition()
            .duration(100)
            .style("opacity", 0)
            .remove();
        
        // Animation des fragments - durée ajustée selon le paramètre animation
        fragments.forEach(fragment => {
            fragment.element
                .transition()
                .duration(animation ? 
                    (500 + Math.random() * 500) : 
                    (300 + Math.random() * 200))
                .attr("cx", fragment.targetX)
                .attr("cy", fragment.targetY)
                .attr("r", 0)
                .style("opacity", 0)
                .remove();
        });
        
        // Créer un effet de gouttelette au centre (trace d'eau résiduelle)
        const waterDrop = bubble.group.append("circle")
            .attr("cx", bubble.x)
            .attr("cy", bubble.y)
            .attr("r", bubble.r * 0.5)
            .attr("fill", "rgba(220, 240, 255, 0.3)")
            .attr("stroke", "rgba(200, 230, 255, 0.2)")
            .attr("stroke-width", 0.3);
            
        waterDrop.transition()
            .duration(animation ? 1000 : 500)
            .attr("r", bubble.r * 0.05)
            .style("opacity", 0)
            .remove();
            
        // Créer une nouvelle bulle après un délai pour remplacer celle éclatée
        setTimeout(() => {
            // Supprimer la référence de la bulle éclatée du tableau
            const index = bubbles.indexOf(bubble);
            if (index > -1) {
                bubbles.splice(index, 1);
            }
            
            // Si des animations sont activées, créer une nouvelle bulle pour remplacer celle-ci
            if (animation) {
                createBubbleWithAnimation();
            } else {
                createStaticBubble();
            }
        }, animation ? (2000 + Math.random() * 3000) : 1000);
    }
    
    // Fonction pour créer une bulle avec animations (mode animation=true)
    function createBubbleWithAnimation() {
        const x = Math.random() * width;
        const y = height + 50; // Commencer en-dessous de l'écran
        const size = Math.random() * Math.random() * 100 * scaleFactor + 10 * scaleFactor + patternVisibility * 40 * scaleFactor;
        const lifespan = Math.random() * 20000 + 5000;
        
        // Couleur du contour
        const strokeColorBase = d3.rgb(
            Math.min(255, baseColor.r * 0.5 + 100),
            Math.min(255, baseColor.g * 0.5 + 100),
            Math.min(255, baseColor.b * 0.5 + 120)
        );
        
        // Couleur de base pour la bulle
        const bubbleBaseColor = d3.rgb(
            Math.min(255, 220 + baseColor.r * 0.1),
            Math.min(255, 220 + baseColor.g * 0.1),
            Math.min(255, 230 + baseColor.b * 0.1)
        );
        
        // Créer un gradient unique pour la nouvelle bulle
        const uniqueBubbleGradientId = `bubble-gradient-new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const uniqueBubbleGradient = defs.append("radialGradient")
            .attr("id", uniqueBubbleGradientId)
            .attr("cx", "35%")
            .attr("cy", "35%")
            .attr("r", "60%")
            .attr("fx", "35%")
            .attr("fy", "35%");
        
        uniqueBubbleGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", `rgba(255, 255, 255, 0.9)`);
        
        uniqueBubbleGradient.append("stop")
            .attr("offset", "40%")
            .attr("stop-color", `rgba(${bubbleBaseColor.r}, ${bubbleBaseColor.g}, ${bubbleBaseColor.b}, 0.8)`);
        
        uniqueBubbleGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", `rgba(${Math.max(200, bubbleBaseColor.r - 20)}, ${Math.max(200, bubbleBaseColor.g - 20)}, ${Math.max(220, bubbleBaseColor.b - 10)}, 0.7)`);
        
        // Gradient d'ombre
        const bubbleShadowGradientId = `bubble-shadow-new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const bubbleShadowGradient = defs.append("radialGradient")
            .attr("id", bubbleShadowGradientId)
            .attr("cx", "50%")
            .attr("cy", "50%")
            .attr("r", "70%")
            .attr("fx", "50%")
            .attr("fy", "50%");
            
        bubbleShadowGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", `rgba(0, 0, 0, 0)`);
            
        bubbleShadowGradient.append("stop")
            .attr("offset", "75%")
            .attr("stop-color", `rgba(0, 0, 0, 0.03)`);
            
        bubbleShadowGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", `rgba(0, 0, 0, 0.08)`);
            
        // Créer un groupe pour la bulle
        const bubbleGroup = bgGroup.append("g")
            .attr("class", "bubble-group");
        
        // Effet d'ombre
        const shadow = bubbleGroup.append("circle")
            .attr("cx", x + size * 0.03)
            .attr("cy", y + size * 0.03)
            .attr("r", size)
            .attr("fill", `url(#${bubbleShadowGradientId})`)
            .attr("stroke", "none")
            .attr("filter", "blur(1px)")
            .style("opacity", 0);
            
        // Bulle principale
        const bubble = bubbleGroup.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", size)
            .attr("fill", `url(#${uniqueBubbleGradientId})`)
            .attr("stroke", `rgba(${strokeColorBase.r}, ${strokeColorBase.g}, ${strokeColorBase.b}, 0.25)`)
            .attr("stroke-width", 0.5)
            .style("opacity", 0);
            
        // Position du reflet
        const highlightSize = size * 0.15;
        const highlightX = x - size * 0.15;
        const highlightY = y - size * 0.15;
        
        // Reflet
        const highlight = bubbleGroup.append("circle")
            .attr("cx", highlightX)
            .attr("cy", highlightY)
            .attr("r", highlightSize)
            .attr("fill", "rgba(255, 255, 255, 0.6)")
            .attr("filter", "url(#soft-blur)")
            .attr("stroke", "none")
            .style("opacity", 0);
        
        // Position finale (dans l'écran)
        const finalY = Math.random() * (height - 100) + 50;
            
        // Animation d'apparition de la bulle
        shadow.transition()
            .duration(2000)
            .attr("cy", finalY + size * 0.03)
            .style("opacity", 1);
            
        bubble.transition()
            .duration(2000)
            .attr("cy", finalY)
            .style("opacity", 1);
            
        highlight.transition()
            .duration(2000)
            .attr("cy", finalY - size * 0.15)
            .style("opacity", 1);
            
        // Ajouter au tableau des bulles
        const newBubble = {
            group: bubbleGroup,
            mainElement: bubble,
            shadowElement: shadow,
            highlightElement: highlight,
            x: x,
            y: finalY,
            r: size,
            shadowX: x + size * 0.03,
            shadowY: finalY + size * 0.03,
            shadowR: size,
            highlightX: highlightX,
            highlightY: finalY - size * 0.15,
            highlightR: highlightSize,
            birthTime: Date.now(),
            lifespan: lifespan,
            popped: false
        };
        
        bubbles.push(newBubble);
        
        // Ajouter des événements pour faire éclater la bulle
        bubble.on("mouseover", () => {
            if (!newBubble.popped) popBubble(newBubble);
        });
        
        bubble.on("click", () => {
            if (!newBubble.popped) popBubble(newBubble);
        });
        
        // Ajouter des animations flottantes
        const delay = Math.random() * 0.5;
        const sizeFactor = Math.max(0.5, Math.min(2, size / 50));
        const duration = (10 + sizeFactor * 5) / animationSpeed;
        
        // Animation de flottement vertical
        const floatHeight = Math.min(50, size) * patternVisibility;
        
        const mainAnimY = document.createElementNS("http://www.w3.org/2000/svg", "animate");
        mainAnimY.setAttribute("attributeName", "cy");
        mainAnimY.setAttribute("values", `${finalY};${finalY - floatHeight};${finalY};${finalY + floatHeight/3};${finalY}`);
        mainAnimY.setAttribute("dur", `${duration * 1.5}s`);
        mainAnimY.setAttribute("repeatCount", "indefinite");
        mainAnimY.setAttribute("begin", `${delay}s`);
        
        bubble.node().appendChild(mainAnimY);
        
        const shadowAnimY = document.createElementNS("http://www.w3.org/2000/svg", "animate");
        shadowAnimY.setAttribute("attributeName", "cy");
        shadowAnimY.setAttribute("values", `${finalY + size * 0.03};${finalY + size * 0.03 - floatHeight};${finalY + size * 0.03};${finalY + size * 0.03 + floatHeight/3};${finalY + size * 0.03}`);
        shadowAnimY.setAttribute("dur", `${duration * 1.5}s`);
        shadowAnimY.setAttribute("repeatCount", "indefinite");
        shadowAnimY.setAttribute("begin", `${delay}s`);
        
        shadow.node().appendChild(shadowAnimY);
        
        const highlightAnimY = document.createElementNS("http://www.w3.org/2000/svg", "animate");
        highlightAnimY.setAttribute("attributeName", "cy");
        highlightAnimY.setAttribute("values", `${finalY - size * 0.15};${finalY - size * 0.15 - floatHeight};${finalY - size * 0.15};${finalY - size * 0.15 + floatHeight/3};${finalY - size * 0.15}`);
        highlightAnimY.setAttribute("dur", `${duration * 1.5}s`);
        highlightAnimY.setAttribute("repeatCount", "indefinite");
        highlightAnimY.setAttribute("begin", `${delay}s`);
        
        highlight.node().appendChild(highlightAnimY);
        
        return newBubble;
    }
    
    // Fonction pour créer une bulle statique (mode animation=false)
    function createStaticBubble() {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * Math.random() * 100 * scaleFactor + 10 * scaleFactor + patternVisibility * 40 * scaleFactor;
        
        // Couleur du contour
        const strokeColorBase = d3.rgb(
            Math.min(255, baseColor.r * 0.5 + 100),
            Math.min(255, baseColor.g * 0.5 + 100),
            Math.min(255, baseColor.b * 0.5 + 120)
        );
        
        // Couleur de base pour la bulle
        const bubbleBaseColor = d3.rgb(
            Math.min(255, 220 + baseColor.r * 0.1),
            Math.min(255, 220 + baseColor.g * 0.1),
            Math.min(255, 230 + baseColor.b * 0.1)
        );
        
        // Créer un gradient unique pour la bulle
        const uniqueBubbleGradientId = `bubble-gradient-static-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const uniqueBubbleGradient = defs.append("radialGradient")
            .attr("id", uniqueBubbleGradientId)
            .attr("cx", "35%")
            .attr("cy", "35%")
            .attr("r", "60%")
            .attr("fx", "35%")
            .attr("fy", "35%");
        
        uniqueBubbleGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", `rgba(255, 255, 255, 0.9)`);
        
        uniqueBubbleGradient.append("stop")
            .attr("offset", "40%")
            .attr("stop-color", `rgba(${bubbleBaseColor.r}, ${bubbleBaseColor.g}, ${bubbleBaseColor.b}, 0.8)`);
        
        uniqueBubbleGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", `rgba(${Math.max(200, bubbleBaseColor.r - 20)}, ${Math.max(200, bubbleBaseColor.g - 20)}, ${Math.max(220, bubbleBaseColor.b - 10)}, 0.7)`);
        
        // Gradient d'ombre
        const bubbleShadowGradientId = `bubble-shadow-static-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const bubbleShadowGradient = defs.append("radialGradient")
            .attr("id", bubbleShadowGradientId)
            .attr("cx", "50%")
            .attr("cy", "50%")
            .attr("r", "70%")
            .attr("fx", "50%")
            .attr("fy", "50%");
            
        bubbleShadowGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", `rgba(0, 0, 0, 0)`);
            
        bubbleShadowGradient.append("stop")
            .attr("offset", "75%")
            .attr("stop-color", `rgba(0, 0, 0, 0.03)`);
            
        bubbleShadowGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", `rgba(0, 0, 0, 0.08)`);
            
        // Créer un groupe pour la bulle
        const bubbleGroup = bgGroup.append("g")
            .attr("class", "bubble-group");
        
        // Effet d'ombre
        const shadow = bubbleGroup.append("circle")
            .attr("cx", x + size * 0.03)
            .attr("cy", y + size * 0.03)
            .attr("r", size)
            .attr("fill", `url(#${bubbleShadowGradientId})`)
            .attr("stroke", "none")
            .attr("filter", "blur(1px)");
            
        // Bulle principale
        const bubble = bubbleGroup.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", size)
            .attr("fill", `url(#${uniqueBubbleGradientId})`)
            .attr("stroke", `rgba(${strokeColorBase.r}, ${strokeColorBase.g}, ${strokeColorBase.b}, 0.25)`)
            .attr("stroke-width", 0.5);
            
        // Position du reflet
        const highlightSize = size * 0.15;
        const highlightX = x - size * 0.15;
        const highlightY = y - size * 0.15;
        
        // Reflet
        const highlight = bubbleGroup.append("circle")
            .attr("cx", highlightX)
            .attr("cy", highlightY)
            .attr("r", highlightSize)
            .attr("fill", "rgba(255, 255, 255, 0.6)")
            .attr("filter", "url(#soft-blur)")
            .attr("stroke", "none");
        
        // Ajouter au tableau des bulles
        const newBubble = {
            group: bubbleGroup,
            mainElement: bubble,
            shadowElement: shadow,
            highlightElement: highlight,
            x: x,
            y: y,
            r: size,
            shadowX: x + size * 0.03,
            shadowY: y + size * 0.03,
            shadowR: size,
            highlightX: highlightX,
            highlightY: highlightY,
            highlightR: highlightSize,
            popped: false
        };
        
        bubbles.push(newBubble);
        
        // Ajouter des événements pour faire éclater la bulle
        bubble.on("mouseover", () => {
            if (!newBubble.popped) popBubble(newBubble);
        });
        
        bubble.on("click", () => {
            if (!newBubble.popped) popBubble(newBubble);
        });
        
        return newBubble;
    }
    
    // Générer les bulles selon le mode (avec ou sans animation)
    if (animation) {
        // Mode animation - générer les bulles en ordre de profondeur pour superposition correcte
        
        // 1. Générer toutes les données des bulles
        const bubbleData = [];
        const numBubbles = Math.floor(20 + patternVisibility * 80);
        
        for (let i = 0; i < numBubbles; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * Math.random() * 100 * scaleFactor + 10 * scaleFactor + patternVisibility * 40 * scaleFactor;
            
            // Z-index pour la profondeur (les petites bulles en arrière-plan)
            const zIndex = size * (0.8 + Math.random() * 0.4);
            
            bubbleData.push({
                x: x,
                y: y,
                r: size,
                zIndex: zIndex,
                lifespan: Math.random() * 20000 + 5000,
                birthTime: Date.now() + Math.random() * 10000
            });
        }
        
        // 2. Trier les bulles par z-index (profondeur) - d'abord les plus petites
        bubbleData.sort((a, b) => a.zIndex - b.zIndex);
        
        // 3. Dessiner les bulles dans l'ordre de profondeur
        bubbleData.forEach((data, i) => {
            // Couleur du contour
            const strokeColorBase = d3.rgb(
                Math.min(255, baseColor.r * 0.5 + 100),
                Math.min(255, baseColor.g * 0.5 + 100),
                Math.min(255, baseColor.b * 0.5 + 120)
            );
            
            // Couleur de base pour la bulle
            const bubbleBaseColor = d3.rgb(
                Math.min(255, 220 + baseColor.r * 0.1),
                Math.min(255, 220 + baseColor.g * 0.1),
                Math.min(255, 230 + baseColor.b * 0.1)
            );
            
            // Gradient unique
            const uniqueBubbleGradientId = `bubble-gradient-${i}-${Date.now()}`;
            const uniqueBubbleGradient = defs.append("radialGradient")
                .attr("id", uniqueBubbleGradientId)
                .attr("cx", "35%")
                .attr("cy", "35%")
                .attr("r", "60%")
                .attr("fx", "35%")
                .attr("fy", "35%");
            
            uniqueBubbleGradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", `rgba(255, 255, 255, 0.9)`);
            
            uniqueBubbleGradient.append("stop")
                .attr("offset", "40%")
                .attr("stop-color", `rgba(${bubbleBaseColor.r}, ${bubbleBaseColor.g}, ${bubbleBaseColor.b}, 0.8)`);
            
            uniqueBubbleGradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", `rgba(${Math.max(200, bubbleBaseColor.r - 20)}, ${Math.max(200, bubbleBaseColor.g - 20)}, ${Math.max(220, bubbleBaseColor.b - 10)}, 0.7)`);
            
            // Gradient d'ombre
            const bubbleShadowGradientId = `bubble-shadow-${i}-${Date.now()}`;
            const bubbleShadowGradient = defs.append("radialGradient")
                .attr("id", bubbleShadowGradientId)
                .attr("cx", "50%")
                .attr("cy", "50%")
                .attr("r", "70%")
                .attr("fx", "50%")
                .attr("fy", "50%");
                
            bubbleShadowGradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", `rgba(0, 0, 0, 0)`);
                
            bubbleShadowGradient.append("stop")
                .attr("offset", "75%")
                .attr("stop-color", `rgba(0, 0, 0, 0.03)`);
                
            bubbleShadowGradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", `rgba(0, 0, 0, 0.08)`);
            
            // Créer un groupe pour la bulle
            const bubbleGroup = bgGroup.append("g")
                .attr("class", "bubble-group");
            
            // Effet d'ombre
            const shadow = bubbleGroup.append("circle")
                .attr("cx", data.x + data.r * 0.03)
                .attr("cy", data.y + data.r * 0.03)
                .attr("r", data.r)
                .attr("fill", `url(#${bubbleShadowGradientId})`)
                .attr("stroke", "none")
                .attr("filter", "blur(1px)");
                
            // Bulle principale
            const bubble = bubbleGroup.append("circle")
                .attr("cx", data.x)
                .attr("cy", data.y)
                .attr("r", data.r)
                .attr("fill", `url(#${uniqueBubbleGradientId})`)
                .attr("stroke", `rgba(${strokeColorBase.r}, ${strokeColorBase.g}, ${strokeColorBase.b}, 0.25)`)
                .attr("stroke-width", 0.5);
            
            // Position du reflet
            const highlightSize = data.r * 0.15;
            const highlightX = data.x - data.r * 0.15;
            const highlightY = data.y - data.r * 0.15;
            
            // Reflet
            const highlight = bubbleGroup.append("circle")
                .attr("cx", highlightX)
                .attr("cy", highlightY)
                .attr("r", highlightSize)
                .attr("fill", "rgba(255, 255, 255, 0.6)")
                .attr("filter", "url(#soft-blur)")
                .attr("stroke", "none");
            
            // Stocker les informations pour l'animation et l'éclatement
            const thisBubble = {
                group: bubbleGroup,
                mainElement: bubble,
                shadowElement: shadow,
                highlightElement: highlight,
                x: data.x,
                y: data.y,
                r: data.r,
                shadowX: data.x + data.r * 0.03,
                shadowY: data.y + data.r * 0.03,
                shadowR: data.r,
                highlightX: highlightX,
                highlightY: highlightY,
                highlightR: highlightSize,
                birthTime: data.birthTime,
                lifespan: data.lifespan,
                popped: false
            };
            
            bubbles.push(thisBubble);
            
            // Ajouter des événements pour faire éclater la bulle
            bubble.on("mouseover", () => {
                if (!thisBubble.popped) popBubble(thisBubble);
            });
            
            bubble.on("click", () => {
                if (!thisBubble.popped) popBubble(thisBubble);
            });
        });
        
        // Ajouter des animations si activées
        bubbles.forEach((bubble, i) => {
            // Délai pour éviter que toutes les bulles ne bougent en même temps
            const delay = i * 0.02;
            // Durée variable selon la taille (les grandes bulles bougent plus lentement)
            const sizeFactor = Math.max(0.5, Math.min(2, bubble.r / 50));
            const duration = (10 + sizeFactor * 5) / animationSpeed;
            
            // Animation de mouvement flottant
            // Pour les bulles plus grandes, mouvement plus complexe
            if (bubble.r > 30 && i % 3 === 0) {
                // Amplitudes proportionnelles à la taille mais limitées
                const ampX = Math.min(width * 0.05, bubble.r * 2) * patternVisibility;
                const ampY = Math.min(height * 0.05, bubble.r * 2) * patternVisibility;
                
                // Animation de la bulle principale
                const mainAnimX = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                mainAnimX.setAttribute("attributeName", "cx");
                mainAnimX.setAttribute("values", `${bubble.x};${bubble.x + ampX};${bubble.x};${bubble.x - ampX};${bubble.x}`);
                mainAnimX.setAttribute("dur", `${duration}s`);
                mainAnimX.setAttribute("repeatCount", "indefinite");
                mainAnimX.setAttribute("begin", `${delay}s`);
                
                const mainAnimY = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                mainAnimY.setAttribute("attributeName", "cy");
                mainAnimY.setAttribute("values", `${bubble.y};${bubble.y - ampY};${bubble.y};${bubble.y + ampY};${bubble.y}`);
                mainAnimY.setAttribute("dur", `${duration * 1.3}s`);
                mainAnimY.setAttribute("repeatCount", "indefinite");
                mainAnimY.setAttribute("begin", `${delay * 1.1}s`);
                
                bubble.mainElement.node().appendChild(mainAnimX);
                bubble.mainElement.node().appendChild(mainAnimY);
                
                // Animation de l'ombre (doit suivre la bulle)
                const shadowAnimX = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                shadowAnimX.setAttribute("attributeName", "cx");
                shadowAnimX.setAttribute("values", `${bubble.shadowX};${bubble.shadowX + ampX};${bubble.shadowX};${bubble.shadowX - ampX};${bubble.shadowX}`);
                shadowAnimX.setAttribute("dur", `${duration}s`);
                shadowAnimX.setAttribute("repeatCount", "indefinite");
                shadowAnimX.setAttribute("begin", `${delay}s`);
                
                const shadowAnimY = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                shadowAnimY.setAttribute("attributeName", "cy");
                shadowAnimY.setAttribute("values", `${bubble.shadowY};${bubble.shadowY - ampY};${bubble.shadowY};${bubble.shadowY + ampY};${bubble.shadowY}`);
                shadowAnimY.setAttribute("dur", `${duration * 1.3}s`);
                shadowAnimY.setAttribute("repeatCount", "indefinite");
                shadowAnimY.setAttribute("begin", `${delay * 1.1}s`);
                
                bubble.shadowElement.node().appendChild(shadowAnimX);
                bubble.shadowElement.node().appendChild(shadowAnimY);
                
                // Animation du reflet (doit suivre la bulle)
                const highlightAnimX = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                highlightAnimX.setAttribute("attributeName", "cx");
                highlightAnimX.setAttribute("values", `${bubble.highlightX};${bubble.highlightX + ampX};${bubble.highlightX};${bubble.highlightX - ampX};${bubble.highlightX}`);
                highlightAnimX.setAttribute("dur", `${duration}s`);
                highlightAnimX.setAttribute("repeatCount", "indefinite");
                highlightAnimX.setAttribute("begin", `${delay}s`);
                
                const highlightAnimY = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                highlightAnimY.setAttribute("attributeName", "cy");
                highlightAnimY.setAttribute("values", `${bubble.highlightY};${bubble.highlightY - ampY};${bubble.highlightY};${bubble.highlightY + ampY};${bubble.highlightY}`);
                highlightAnimY.setAttribute("dur", `${duration * 1.3}s`);
                highlightAnimY.setAttribute("repeatCount", "indefinite");
                highlightAnimY.setAttribute("begin", `${delay * 1.1}s`);
                
                bubble.highlightElement.node().appendChild(highlightAnimX);
                bubble.highlightElement.node().appendChild(highlightAnimY);
            }
            // Pour les bulles moyennes, flottement vertical plus simple
            else if (bubble.r > 15 && i % 2 === 0) {
                const floatHeight = Math.min(50, bubble.r) * patternVisibility;
                
                const mainAnimY = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                mainAnimY.setAttribute("attributeName", "cy");
                mainAnimY.setAttribute("values", `${bubble.y};${bubble.y - floatHeight};${bubble.y};${bubble.y + floatHeight/3};${bubble.y}`);
                mainAnimY.setAttribute("dur", `${duration * 1.5}s`);
                mainAnimY.setAttribute("repeatCount", "indefinite");
                mainAnimY.setAttribute("begin", `${delay}s`);
                
                bubble.mainElement.node().appendChild(mainAnimY);
                
                const shadowAnimY = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                shadowAnimY.setAttribute("attributeName", "cy");
                shadowAnimY.setAttribute("values", `${bubble.shadowY};${bubble.shadowY - floatHeight};${bubble.shadowY};${bubble.shadowY + floatHeight/3};${bubble.shadowY}`);
                shadowAnimY.setAttribute("dur", `${duration * 1.5}s`);
                shadowAnimY.setAttribute("repeatCount", "indefinite");
                shadowAnimY.setAttribute("begin", `${delay}s`);
                
                bubble.shadowElement.node().appendChild(shadowAnimY);
                
                const highlightAnimY = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                highlightAnimY.setAttribute("attributeName", "cy");
                highlightAnimY.setAttribute("values", `${bubble.highlightY};${bubble.highlightY - floatHeight};${bubble.highlightY};${bubble.highlightY + floatHeight/3};${bubble.highlightY}`);
                highlightAnimY.setAttribute("dur", `${duration * 1.5}s`);
                highlightAnimY.setAttribute("repeatCount", "indefinite");
                highlightAnimY.setAttribute("begin", `${delay}s`);
                
                bubble.highlightElement.node().appendChild(highlightAnimY);
            }
            
            // Légère pulsation pour certaines bulles
            if (i % 3 === 0) {
                const pulseAmp = Math.min(0.15, 5 / bubble.r) * patternVisibility;
                
                const mainAnimR = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                mainAnimR.setAttribute("attributeName", "r");
                mainAnimR.setAttribute("values", `${bubble.r};${bubble.r * (1 + pulseAmp)};${bubble.r};${bubble.r * (1 - pulseAmp/2)};${bubble.r}`);
                mainAnimR.setAttribute("dur", `${duration * 2}s`);
                mainAnimR.setAttribute("repeatCount", "indefinite");
                mainAnimR.setAttribute("begin", `${delay * 2}s`);
                
                bubble.mainElement.node().appendChild(mainAnimR);
                
                const shadowAnimR = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                shadowAnimR.setAttribute("attributeName", "r");
                shadowAnimR.setAttribute("values", `${bubble.shadowR};${bubble.shadowR * (1 + pulseAmp)};${bubble.shadowR};${bubble.shadowR * (1 - pulseAmp/2)};${bubble.shadowR}`);
                shadowAnimR.setAttribute("dur", `${duration * 2}s`);
                shadowAnimR.setAttribute("repeatCount", "indefinite");
                shadowAnimR.setAttribute("begin", `${delay * 2}s`);
                
                bubble.shadowElement.node().appendChild(shadowAnimR);
                
                const highlightAnimR = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                highlightAnimR.setAttribute("attributeName", "r");
                highlightAnimR.setAttribute("values", `${bubble.highlightR};${bubble.highlightR * (1 + pulseAmp)};${bubble.highlightR};${bubble.highlightR * (1 - pulseAmp/2)};${bubble.highlightR}`);
                highlightAnimR.setAttribute("dur", `${duration * 2}s`);
                highlightAnimR.setAttribute("repeatCount", "indefinite");
                highlightAnimR.setAttribute("begin", `${delay * 2}s`);
                
                bubble.highlightElement.node().appendChild(highlightAnimR);
            }
        });
        
        // Système d'éclatement automatique des bulles selon leur durée de vie
        const checkInterval = setInterval(() => {
            const now = Date.now();
            
            // Vérifier chaque bulle
            for (let i = bubbles.length - 1; i >= 0; i--) {
                const bubble = bubbles[i];
                
                // Si la bulle n'a pas encore éclaté et a dépassé sa durée de vie
                if (!bubble.popped && now > bubble.birthTime + bubble.lifespan) {
                    // Faire éclater la bulle
                    popBubble(bubble);
                }
            }
            
            // Si toutes les bulles ont éclaté, arrêter l'intervalle
            if (bubbles.length === 0) {
                clearInterval(checkInterval);
            }
        }, 1000); // Vérifier toutes les secondes
    }
    else {
        // Mode sans animation - générer des bulles statiques plus simples
        const numBubbles = Math.floor(10 + patternVisibility * 40); // Moins de bulles en mode statique
        
        for (let i = 0; i < numBubbles; i++) {
            createStaticBubble();
        }
    }
    
    // Pour les écrans tactiles, permettre l'éclatement au toucher
    svg.on("touchstart", function(event) {
        // Obtenir les coordonnées du toucher
        const touch = event.touches[0];
        const touchX = touch.clientX;
        const touchY = touch.clientY;
        
        // Vérifier si le toucher est sur une bulle
        for (let i = bubbles.length - 1; i >= 0; i--) {
            const bubble = bubbles[i];
            
            // Calculer la distance entre le toucher et le centre de la bulle
            const distance = Math.sqrt(Math.pow(touchX - bubble.x, 2) + Math.pow(touchY - bubble.y, 2));
            
            // Si le toucher est à l'intérieur de la bulle et que la bulle n'a pas encore éclaté
            if (distance <= bubble.r && !bubble.popped) {
                popBubble(bubble);
                break; // Ne faire éclater qu'une seule bulle par toucher
            }
        }
    });
    
    // console.log(`Génération du fond bulles terminée avec ${bubbles.length} bulles. Animation: ${animation ? "ACTIVÉE" : "DÉSACTIVÉE"}`);
}

 
// Mettre à jour la fonction setupElegantBackground pour inclure les nouveaux fonds
export function setupElegantBackground(svg) {

    // console.log("#### Configuration du fond élégant... appel de  setupElegantBackground ######### : state.backgroundEnabled =", state.backgroundEnable );

    if (state.backgroundEnabled) {  
        
        // console.log("\n\n #### Configuration du fond élégant... #########\n\n");
        if ((localStorage.getItem('preferredBackground') === null) || 
        (localStorage.getItem('backgroundOpacity') === null) ||
        (localStorage.getItem('patternVisibility') === null) ||
        (localStorage.getItem('backgroundCustomColor') === null) ||
        (localStorage.getItem('backgroundAnimation') === null) ||
        (localStorage.getItem('animationSpeed') === null))
        { 
            localStorage.setItem('preferredBackground', 'poppingBubbles'); 
            localStorage.setItem('backgroundOpacity', 1.0);
            localStorage.setItem('patternVisibility', 1.0);
            localStorage.setItem('backgroundAnimation',false);
            localStorage.setItem('animationSpeed', 2.0);
            localStorage.setItem('backgroundCustomColor', '#B5D9A7');
        }
        
        


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
            case 'mondrian':
                setupMondrianBackground(svg);
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
                setupParchmentBackgroundFixed(svg);
                break;
            case 'grid':
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
            case 'bubbles':
                setupBubblesBackground(svg);
                break;
            case 'poppingBubbles':
                setupPoppingBubblesBackground(svg);
                break;
            case 'customImage':
                const imagePath = localStorage.getItem('customImagePath');
                setupCustomImageBackground(svg, imagePath);
                break;
            case 'none':
                enableBackground(false);
                // Ne rien faire, pas de fond
                break;
            default:
                // Fallback sur un fond par défaut
                // setupPoppingBubblesBackground(svg);
                setupGrowingTreeBackground(svg);
            }
        } else {
            // Comportement par défaut si aucune préférence n'est sauvegardée
            setupTreeBranchesBackground(svg);
        }
    }
}




// // Ajoutez ce code pour monitorer juste après la définition
// import { monitorFunction } from './performanceMonitor.js';
// window._originalSetupElegantBackground = setupElegantBackground;
// window._monitoringStopFunction = monitorFunction(window, '_originalSetupElegantBackground', 1000);
// setupElegantBackground = window._originalSetupElegantBackground;



export function setupCustomImageBackground(svg, imagePath) {
    console.log("Configuration du fond avec une image personnalisée:", imagePath);
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Récupérer les paramètres depuis le localStorage
    const opacity = parseFloat(localStorage.getItem('backgroundOpacity') || 0.15);
    const customColor = localStorage.getItem('backgroundCustomColor') || '#B5D9A7';
    const animation = localStorage.getItem('backgroundAnimation') === 'true';
    const animationSpeed = parseFloat(localStorage.getItem('animationSpeed') || 1.0);
    
    console.log("Paramètres de l'image de fond:", {
        opacity,
        customColor,
        animation,
        animationSpeed
    });
    
    // Nettoyer tout fond existant dans le SVG
    svg.selectAll(".background-element").remove();
    
    // Supprimer les anciennes feuilles de style d'animation si elles existent
    const oldStyleSheet = document.getElementById('background-animation-styles');
    if (oldStyleSheet) {
        oldStyleSheet.remove();
    }
    
    // Créer un groupe pour le fond dans le SVG
    const bgGroup = svg.append("g")
        .attr("class", "background-element")
        .attr("pointer-events", "none")
        .lower();
    
    // Trouver ou créer le conteneur de fond
    let container = document.querySelector('.background-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'background-container';
        document.body.insertBefore(container, document.body.firstChild);
    } else {
        // Vider le conteneur existant
        container.innerHTML = '';
    }
    
    // Générer des chemins aléatoires pour les animations
    const generateRandomPath = () => {
        // Créer un ensemble de 6 à 10 points de contrôle aléatoires pour le chemin
        const numPoints = Math.floor(Math.random() * 5) + 6; // Entre 6 et 10 points
        const points = [];
        
        for (let i = 0; i < numPoints; i++) {
            // Générer des positions relatives pour les déplacements
            // Limiter les déplacements pour éviter de trop s'éloigner du centre
            const x = (Math.random() * 4) - 2; // Entre -2% et 2%
            const y = (Math.random() * 4) - 2; // Entre -2% et 2%
            
            // Générer un niveau de zoom entre 1.1 et 1.2
            const zoom = 1.1 + (Math.random() * 0.1);
            
            points.push({ x, y, zoom });
        }
        
        // S'assurer que le premier et le dernier point sont identiques pour une boucle fluide
        points.push({ ...points[0] });
        
        return points;
    };
    
    // Créer une feuille de style pour les animations
    if (animation) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'background-animation-styles';
        
        // Calculer la durée de l'animation inverse à la vitesse
        const animationDuration = 30 / animationSpeed;
        
        // Générer un chemin aléatoire pour l'animation avancée
        const randomPath = generateRandomPath();
        
        // Construire les keyframes pour l'animation du chemin aléatoire
        let randomPathKeyframes = "";
        const pathLength = randomPath.length - 1; // -1 car le dernier point est une copie du premier
        
        randomPath.forEach((point, index) => {
            const percentage = Math.floor((index / pathLength) * 100);
            randomPathKeyframes += `
                ${percentage}% { 
                    transform: scale(${point.zoom.toFixed(2)}) translate(${point.x.toFixed(2)}%, ${point.y.toFixed(2)}%);
                }
            `;
        });
        
        // Différentes animations pour l'image de fond, avec un zoom initial de 1.1 pour éviter les bords blancs
        styleSheet.textContent = `
            @keyframes backgroundPan {
                0% { transform: scale(1.1) translate(0, 0); }
                25% { transform: scale(1.1) translate(1%, 1%); }
                50% { transform: scale(1.1) translate(0, 2%); }
                75% { transform: scale(1.1) translate(-1%, 1%); }
                100% { transform: scale(1.1) translate(0, 0); }
            }
            
            @keyframes backgroundZoom {
                0% { transform: scale(1.1); }
                50% { transform: scale(1.15); }
                100% { transform: scale(1.1); }
            }
            
            @keyframes backgroundFloatVertical {
                0% { transform: scale(1.1) translateY(0); }
                50% { transform: scale(1.1) translateY(-1%); }
                100% { transform: scale(1.1) translateY(0); }
            }
            
            @keyframes backgroundRandomPath {
                ${randomPathKeyframes}
            }
            
            .background-image-container.animated {
                animation: backgroundPan ${animationDuration}s infinite ease-in-out;
                transform-origin: center center;
            }
            
            .background-image-container.animated-zoom {
                animation: backgroundZoom ${animationDuration * 1.5}s infinite ease-in-out;
                transform-origin: center center;
            }
            
            .background-image-container.animated-float {
                animation: backgroundFloatVertical ${animationDuration / 2}s infinite ease-in-out;
                transform-origin: center center;
            }
            
            .background-image-container.animated-random {
                animation: backgroundRandomPath ${animationDuration * 2}s infinite ease-in-out;
                transform-origin: center center;
            }
        `;
        
        document.head.appendChild(styleSheet);
    }
    
    // Définir le defs pour les filtres et effets
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    
    // Créer un filtre SVG pour appliquer une teinte de couleur
    const filterId = `image-color-filter-${Date.now()}`;
    const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
    filter.setAttribute("id", filterId);
    
    // Créer un filtre de saturation pour pouvoir ajuster la couleur
    const colorMatrix = document.createElementNS("http://www.w3.org/2000/svg", "feColorMatrix");
    colorMatrix.setAttribute("type", "matrix");
    
    // Convertir la couleur HEX en RGB
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255
        } : { r: 0.7, g: 0.85, b: 0.65 }; // Valeur par défaut similaire à #B5D9A7
    };
    
    const rgb = hexToRgb(customColor);
    
    // Créer une matrice qui mélange la couleur originale avec la couleur personnalisée
    // Cette matrice est un compromis qui préserve certaines caractéristiques de l'image
    // tout en lui donnant une teinte de la couleur personnalisée
    colorMatrix.setAttribute("values", `
        ${0.7 + 0.3 * rgb.r} ${0.3 * rgb.g} ${0.3 * rgb.b} 0 0
        ${0.3 * rgb.r} ${0.7 + 0.3 * rgb.g} ${0.3 * rgb.b} 0 0
        ${0.3 * rgb.r} ${0.3 * rgb.g} ${0.7 + 0.3 * rgb.b} 0 0
        0 0 0 1 0
    `);
    
    filter.appendChild(colorMatrix);
    
    // Ajouter une légère fusion gaussienne pour adoucir l'image
    const gaussianBlur = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
    gaussianBlur.setAttribute("stdDeviation", "0.5");
    gaussianBlur.setAttribute("result", "blur");
    filter.appendChild(gaussianBlur);
    
    // Ajouter les définitions au SVG
    defs.appendChild(filter);
    container.appendChild(defs);
    
    // Créer un conteneur pour l'image qui permettra les animations
    const imgContainer = document.createElement('div');
    imgContainer.className = 'background-image-container';
    imgContainer.style.position = "fixed";
    imgContainer.style.top = "0";
    imgContainer.style.left = "0";
    imgContainer.style.width = "100%";
    imgContainer.style.height = "100%";
    imgContainer.style.overflow = "hidden";
    imgContainer.style.zIndex = "-1";
    
    // Si l'animation est activée, ajouter la classe appropriée et le zoom initial
    if (animation) {
        // Ajouter l'animation de chemin aléatoire à la liste des animations disponibles
        const animationTypes = ['animated', 'animated-zoom', 'animated-float', 'animated-random'];
        
        // Favoriser légèrement l'animation de chemin aléatoire (40% de chance)
        let selectedAnimation;
        const randomValue = Math.random();
        if (randomValue < 0.4) {
            selectedAnimation = 'animated-random';
        } else {
            // Sélectionner parmi les autres types d'animation
            const otherAnimations = animationTypes.filter(type => type !== 'animated-random');
            const randomIndex = Math.floor(Math.random() * otherAnimations.length);
            selectedAnimation = otherAnimations[randomIndex];
        }
        
        imgContainer.classList.add(selectedAnimation);
        console.log("Animation sélectionnée:", selectedAnimation);
    }
    
    // Créer un élément SVG qui contiendra l'image
    const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgElement.setAttribute("width", "100%");
    svgElement.setAttribute("height", "100%");
    svgElement.style.display = "block";
    
    // Créer l'élément image dans le SVG
    const imgElement = document.createElementNS("http://www.w3.org/2000/svg", "image");
    imgElement.setAttribute("href", imagePath);
    imgElement.setAttribute("width", "100%");
    imgElement.setAttribute("height", "100%");
    imgElement.setAttribute("preserveAspectRatio", "xMidYMid slice");
    imgElement.style.opacity = opacity;
    imgElement.setAttribute("filter", `url(#${filterId})`);
    
    // Gestionnaire d'événements pour l'image chargée
    imgElement.onload = function() {
        console.log("Image chargée avec succès:", imagePath);
    };
    
    // Gestionnaire d'événements pour les erreurs de chargement
    imgElement.onerror = function() {
        console.error(`Impossible de charger l'image: ${imagePath}`);
        imgElement.style.display = 'none';
        
        // Afficher un message à l'utilisateur
        if (window.showToast) {
            window.showToast(`Erreur: Impossible de charger l'image ${imagePath}`, 3000);
        }
    };
    
    // Ajouter l'image au SVG, le SVG au conteneur d'image, et le conteneur d'image au conteneur principal
    svgElement.appendChild(imgElement);
    imgContainer.appendChild(svgElement);
    container.appendChild(imgContainer);
    
    console.log("Image ajoutée au conteneur de fond d'écran avec:", {
        opacité: opacity,
        couleur: customColor,
        animation: animation ? "activée" : "désactivée",
        vitesseAnimation: animationSpeed
    });
    
    return true; // Indiquer que l'opération a réussi
}

