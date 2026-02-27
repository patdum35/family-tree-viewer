// backgroundManager.js est importé dynamiquement dans main.js si on clique sur le bouton loadDataButton "Entrez"
// donc pas de problème de lightHouse score au démarrage
import { state } from './main.js';
import { drawTree } from './treeRenderer.js';

const isProduction = window.location.pathname.includes('/obfusc/');
const BACKGROUND_IMAGES_PATH = isProduction ? '../background_images/' : 'background_images/';

/**
 * Désactive ou active le fond d'écran en supprimant les éléments appropriés du DOM
 * @param {boolean} enable - true pour activer, false pour désactiver
 * @returns {boolean} - indique si l'opération a réussi
 */
export function enableBackground(enable = false, isfromNameCloud = false) {
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
      if (isfromNameCloud) {
        drawTree();
      }
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
        image: `${BACKGROUND_IMAGES_PATH}antiquite.jpg`
    },
    // Mérovingiens
    'merovingiens': {
        startYear: 481,
        endYear: 751,
        image: `${BACKGROUND_IMAGES_PATH}merovingiens.jpg`
    },
    // Carolingiens
    'carolingiens': {
        startYear: 751,
        endYear: 987,
        image: `${BACKGROUND_IMAGES_PATH}carolingiens.jpg`
    },
    // Capétiens
    'capetiens': {
        startYear: 987,
        endYear: 1328,
        image: `${BACKGROUND_IMAGES_PATH}capetiens.jpg`
    },
    // Valois
    'valois': {
        startYear: 1328,
        endYear: 1589,
        image: `${BACKGROUND_IMAGES_PATH}valois.jpg`
    },
    // Bourbons
    'bourbons': {
        startYear: 1589,
        endYear: 1792,
        image: `${BACKGROUND_IMAGES_PATH}bourbons.jpg`
    },
    // Révolution
    'revolution': {
        startYear: 1792,
        endYear: 1804,
        image: `${BACKGROUND_IMAGES_PATH}revolution.jpg`
    },
    // Empire
    'empire': {
        startYear: 1804,
        endYear: 1814,
        image: `${BACKGROUND_IMAGES_PATH}empire.jpg`
    },
    // Restauration
    'restauration': {
        startYear: 1814,
        endYear: 1848,
        image: `${BACKGROUND_IMAGES_PATH}restauration.jpg`
    },
    // Second Empire et République
    'republique': {
        startYear: 1848,
        endYear: 1900,
        image: `${BACKGROUND_IMAGES_PATH}republique.jpg`
    },
    // Période contemporaine
    'contemporain': {
        startYear: 1900,
        endYear: 2100,
        image: `${BACKGROUND_IMAGES_PATH}contemporain.jpg`
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

// // Pas mal : Fond avec branches logiques - VERSION CORRIGÉE
// function setupTreeBranchesBackground(svg, customDimensions = null, forExport = false) {

//     /**
//      * Branches LONGUES avec couleurs discrètes et espacement naturel des feuilles
//      */
//     function drawLongCanopyBranch(group, startX, startY, direction, minLength, settings, leafColors, mainBranchColor, smallBranchColor, sizeMultiplier, forExport) {
//         // Longueur garantie + extension aléatoire
//         const mainBranchLength = minLength + Math.random() * 200 * sizeMultiplier;
//         const mainBranchWidth = (2 + Math.random() * 2) * sizeMultiplier; // Un peu plus fin
        
//         // BRANCHE PRINCIPALE VERTE DISCRÈTE
//         const endX = startX + Math.cos(direction) * mainBranchLength;
//         const endY = startY + Math.sin(direction) * mainBranchLength;
        
//         // Dessiner branche principale en vert discret
//         group.append("line")
//             .attr("class", "background-branch")
//             .attr("x1", startX)
//             .attr("y1", startY)
//             .attr("x2", endX)
//             .attr("y2", endY)
//             .attr("stroke", `rgba(${mainBranchColor.r}, ${mainBranchColor.g}, ${mainBranchColor.b}, 0.5)`) // Plus discret
//             .attr("stroke-width", mainBranchWidth)
//             .attr("stroke-linecap", "round");
        
//         // Grille d'occupation pour éviter chevauchement des feuilles
//         const leafGrid = new Set();
//         const gridSize = 40; // Taille de cellule pour éviter chevauchement
        
//         // PETITES BRANCHES avec espacement naturel
//         const nombrePetitesBranches = 10 + Math.floor(Math.random() * 12); // 10-21 branches
        
//         for (let i = 0; i < nombrePetitesBranches; i++) {
//             // Répartition sur TOUTE la longueur (15% à 85%)
//             const position = 0.15 + (i / nombrePetitesBranches) * 0.7;
//             const branchX = startX + (endX - startX) * position;
//             const branchY = startY + (endY - startY) * position;
            
//             // Direction perpendiculaire avec variation PLUS NATURELLE
//             const basePerpendicular = direction + Math.PI/2;
//             const side = Math.random() < 0.5 ? 1 : -1;
//             const branchDirection = basePerpendicular * side + (Math.random() - 0.5) * Math.PI/6; // ±30° variation
            
//             const branchLength = (40 + Math.random() * 80) * sizeMultiplier;
//             const branchWidth = (1 + Math.random() * 1) * sizeMultiplier; // Plus discret
            
//             // Bout de la petite branche
//             const smallEndX = branchX + Math.cos(branchDirection) * branchLength;
//             const smallEndY = branchY + Math.sin(branchDirection) * branchLength;
            
//             // Dessiner petite branche PLUS DISCRÈTE
//             group.append("line")
//                 .attr("class", "background-branch")
//                 .attr("x1", branchX)
//                 .attr("y1", branchY)
//                 .attr("x2", smallEndX)
//                 .attr("y2", smallEndY)
//                 .attr("stroke", `rgba(${smallBranchColor.r}, ${smallBranchColor.g}, ${smallBranchColor.b}, 0.4)`) // Plus discret
//                 .attr("stroke-width", branchWidth)
//                 .attr("stroke-linecap", "round");
            
//             // FEUILLES avec ESPACEMENT NATUREL (éviter chevauchement)
//             const nombreFeuilles = 3 + Math.floor(Math.random() * 4); // 3-6 feuilles (moins pour éviter surcharge)
            
//             for (let j = 0; j < nombreFeuilles; j++) {
//                 const leafAngle = branchDirection + (Math.random() - 0.5) * Math.PI/3; // Variation plus naturelle
//                 const leafSize = (10 + Math.random() * 20) * sizeMultiplier; // Un peu plus petites
//                 const leafColor = leafColors[Math.floor(Math.random() * leafColors.length)];
                
//                 // Position avec ÉVITEMENT DE CHEVAUCHEMENT
//                 let leafX, leafY, attempts = 0;
//                 let validPosition = false;
                
//                 do {
//                     leafX = smallEndX + (Math.random() - 0.5) * 25;
//                     leafY = smallEndY + (Math.random() - 0.5) * 25;
                    
//                     // Vérifier la grille d'occupation
//                     const gridX = Math.floor(leafX / gridSize);
//                     const gridY = Math.floor(leafY / gridSize);
//                     const gridKey = `${gridX},${gridY}`;
                    
//                     if (!leafGrid.has(gridKey)) {
//                         leafGrid.add(gridKey);
//                         validPosition = true;
//                     } else {
//                         attempts++;
//                     }
//                 } while (!validPosition && attempts < 5); // Max 5 tentatives
                
//                 // Dessiner la feuille seulement si position valide
//                 if (validPosition) {
//                     drawCanopyLeaf(group, leafX, leafY, leafSize, leafAngle, leafColor, settings, forExport);
//                 }
//             }
//         }
        
//         // Feuilles au bout de la branche principale (avec espacement)
//         const endLeaves = 4 + Math.floor(Math.random() * 6); // Moins de feuilles
//         for (let k = 0; k < endLeaves; k++) {
//             const leafAngle = direction + (Math.random() - 0.5) * Math.PI/3;
//             const leafSize = (12 + Math.random() * 25) * sizeMultiplier;
//             const leafColor = leafColors[Math.floor(Math.random() * leafColors.length)];
            
//             // Position avec espacement
//             let leafX, leafY, attempts = 0;
//             let validPosition = false;
            
//             do {
//                 leafX = endX + (Math.random() - 0.5) * 40;
//                 leafY = endY + (Math.random() - 0.5) * 40;
                
//                 const gridX = Math.floor(leafX / gridSize);
//                 const gridY = Math.floor(leafY / gridSize);
//                 const gridKey = `${gridX},${gridY}`;
                
//                 if (!leafGrid.has(gridKey)) {
//                     leafGrid.add(gridKey);
//                     validPosition = true;
//                 } else {
//                     attempts++;
//                 }
//             } while (!validPosition && attempts < 5);
            
//             if (validPosition) {
//                 drawCanopyLeaf(group, leafX, leafY, leafSize, leafAngle, leafColor, settings, forExport);
//             }
//         }
//     }

//     /**
//      * Système de branches de remplissage avec espacement naturel
//      */
//     function drawCanopyBranchSystem(group, startX, startY, initialDirection, settings, leafColors, mainBranchColor, smallBranchColor, sizeMultiplier, forExport, width, height, offsetX, offsetY) {
//         // Longueur plus modérée pour les branches de remplissage
//         const mainBranchLength = (100 + Math.random() * 250) * sizeMultiplier;
//         const mainBranchWidth = (1.5 + Math.random() * 1.5) * sizeMultiplier; // Plus discret
        
//         // BRANCHE PRINCIPALE
//         const endX = startX + Math.cos(initialDirection) * mainBranchLength;
//         const endY = startY + Math.sin(initialDirection) * mainBranchLength;
        
//         // Dessiner branche principale verte discrète
//         group.append("line")
//             .attr("class", "background-branch")
//             .attr("x1", startX)
//             .attr("y1", startY)
//             .attr("x2", endX)
//             .attr("y2", endY)
//             .attr("stroke", `rgba(${mainBranchColor.r}, ${mainBranchColor.g}, ${mainBranchColor.b}, 0.4)`) // Plus discret
//             .attr("stroke-width", mainBranchWidth)
//             .attr("stroke-linecap", "round");
        
//         // Grille d'espacement pour les feuilles
//         const leafGrid = new Set();
//         const gridSize = 35;
        
//         // Petites branches plus naturelles
//         const nombrePetitesBranches = 4 + Math.floor(Math.random() * 6); // Moins de branches pour éviter surcharge
        
//         for (let i = 0; i < nombrePetitesBranches; i++) {
//             const position = 0.3 + (i / nombrePetitesBranches) * 0.6;
//             const branchX = startX + (endX - startX) * position;
//             const branchY = startY + (endY - startY) * position;
            
//             // Direction plus naturelle
//             const basePerpendicular = initialDirection + Math.PI/2;
//             const side = Math.random() < 0.5 ? 1 : -1;
//             const branchDirection = basePerpendicular * side + (Math.random() - 0.5) * Math.PI/4;
            
//             const branchLength = (30 + Math.random() * 60) * sizeMultiplier;
//             const branchWidth = (0.8 + Math.random() * 0.8) * sizeMultiplier; // Plus discret
            
//             const smallEndX = branchX + Math.cos(branchDirection) * branchLength;
//             const smallEndY = branchY + Math.sin(branchDirection) * branchLength;
            
//             // Dessiner petite branche discrète
//             group.append("line")
//                 .attr("class", "background-branch")
//                 .attr("x1", branchX)
//                 .attr("y1", branchY)
//                 .attr("x2", smallEndX)
//                 .attr("y2", smallEndY)
//                 .attr("stroke", `rgba(${smallBranchColor.r}, ${smallBranchColor.g}, ${smallBranchColor.b}, 0.3)`) // Très discret
//                 .attr("stroke-width", branchWidth)
//                 .attr("stroke-linecap", "round");
            
//             // Feuilles avec espacement
//             const nombreFeuilles = 2 + Math.floor(Math.random() * 3); // 2-4 feuilles seulement
            
//             for (let j = 0; j < nombreFeuilles; j++) {
//                 const leafAngle = branchDirection + (Math.random() - 0.5) * Math.PI/4;
//                 const leafSize = (8 + Math.random() * 15) * sizeMultiplier; // Plus petites
//                 const leafColor = leafColors[Math.floor(Math.random() * leafColors.length)];
                
//                 // Position avec évitement de chevauchement
//                 let leafX, leafY, attempts = 0;
//                 let validPosition = false;
                
//                 do {
//                     leafX = smallEndX + (Math.random() - 0.5) * 20;
//                     leafY = smallEndY + (Math.random() - 0.5) * 20;
                    
//                     const gridX = Math.floor(leafX / gridSize);
//                     const gridY = Math.floor(leafY / gridSize);
//                     const gridKey = `${gridX},${gridY}`;
                    
//                     if (!leafGrid.has(gridKey)) {
//                         leafGrid.add(gridKey);
//                         validPosition = true;
//                     } else {
//                         attempts++;
//                     }
//                 } while (!validPosition && attempts < 3);
                
//                 if (validPosition) {
//                     drawCanopyLeaf(group, leafX, leafY, leafSize, leafAngle, leafColor, settings, forExport);
//                 }
//             }
//         }
//     }


//     /**
//      * Dessine une feuille de canopée
//      */
//     function drawCanopyLeaf(group, x, y, size, angle, leafColor, settings, forExport) {
//         const angleRad = angle;
        
//         // Forme de feuille naturelle
//         const leaf = group.append("path")
//             .attr("class", "background-leaf")
//             .attr("d", `M ${x} ${y} 
//                     Q ${x + Math.cos(angleRad) * size * 0.5} ${y + Math.sin(angleRad) * size * 0.5}, 
//                         ${x + Math.cos(angleRad) * size} ${y + Math.sin(angleRad) * size}
//                     Q ${x + Math.cos(angleRad + 0.5) * size * 0.7} ${y + Math.sin(angleRad + 0.5) * size * 0.7},
//                         ${x} ${y}`)
//             .attr("fill", leafColor.toString())
//             .attr("stroke", d3.rgb(leafColor).darker(0.5).toString())
//             .attr("stroke-width", "0.5");
        
//         // Animation si activée
//         if (settings.animation && !forExport && Math.random() < 0.3) {
//             const swayDuration = (4 + Math.random() * 3) / settings.animationSpeed;
//             const delay = Math.random() * 2;
            
//             leaf.style("transform-origin", `${x}px ${y}px`);
//             leaf.style("animation", `leafSway ${swayDuration}s infinite alternate ease-in-out ${delay}s`);
//         }
//     }

//     // Utiliser les dimensions personnalisées ou celles de l'écran
//     const width = customDimensions ? customDimensions.width : window.innerWidth;
//     const height = customDimensions ? customDimensions.height : window.innerHeight;
//     const offsetX = customDimensions ? customDimensions.minX : 0;
//     const offsetY = customDimensions ? customDimensions.minY : 0;

//     // Calculer la densité adaptative pour l'export
//     let densityMultiplier = 1;
//     let sizeMultiplier = 1;

//     if (forExport) {
//         const baseArea = 1920 * 1080;
//         const currentArea = width * height;
//         const areaRatio = currentArea / baseArea;
        
//         densityMultiplier = Math.sqrt(areaRatio) * 0.8;
//         sizeMultiplier = Math.min(3, Math.max(1.5, areaRatio * 0.1));
        
//         console.log(`📊 Export branches - Densité: x${densityMultiplier.toFixed(2)}, Taille: x${sizeMultiplier.toFixed(2)}`);
//     }

//     console.log(`🌿 Setup branches logiques: ${width}x${height} (offset: ${offsetX}, ${offsetY}) - Export: ${forExport}`);
    
//     const defs = svg.append("defs");
    
//     // Nettoyer tout fond existant
//     svg.selectAll(".background-element").remove();
    
//     // Créer un groupe pour le fond
//     const bgGroup = svg.append("g")
//         .attr("class", "background-element")
//         .attr("pointer-events", "none")
//         .lower();
    
//     // Récupérer les paramètres
//     const settings = {
//         opacity: parseFloat(localStorage.getItem('backgroundOpacity') || 0.15),
//         patternVisibility: parseFloat(localStorage.getItem('patternVisibility') || 1.0),
//         animation: forExport ? false : localStorage.getItem('backgroundAnimation') === 'true',
//         animationSpeed: parseFloat(localStorage.getItem('animationSpeed') || 1.0),
//         customColor: localStorage.getItem('backgroundCustomColor') || '#3F51B5'
//     };
    
//     // Appliquer l'opacité globale
//     bgGroup.style("opacity", settings.opacity);
    
//     // Gradient de fond
//     const gradientId = `branches-bg-gradient-${Date.now()}`;
//     const bgGradient = defs.append("linearGradient")
//         .attr("id", gradientId)
//         .attr("x1", "0%")
//         .attr("y1", "0%")
//         .attr("x2", "100%")
//         .attr("y2", "100%");
    
//     const baseColor = d3.rgb(settings.customColor);
//     const lighterColor = d3.rgb(baseColor).brighter(1.5);
//     const darkerColor = d3.rgb(baseColor).darker(0.2);
    
//     bgGradient.append("stop")
//         .attr("offset", "0%")
//         .attr("stop-color", lighterColor.toString());
    
//     bgGradient.append("stop")
//         .attr("offset", "100%")
//         .attr("stop-color", darkerColor.toString());
    
//     // Rectangle de fond
//     bgGroup.append("rect")
//         .attr("x", offsetX)
//         .attr("y", offsetY)
//         .attr("width", width)
//         .attr("height", height)
//         .attr("fill", `url(#${gradientId})`)
//         .attr("pointer-events", "none")
//         .lower();
    
//     // Couleurs DISCRÈTES pour branches et feuilles
//     const mainBranchColor = d3.rgb(89, 125, 65); // Vert discret au lieu de marron
//     const smallBranchColor = d3.rgb(109, 140, 85); // Vert clair discret
//     const leafColors = [
//         d3.rgb(50, 150, 50),   // Vert vif
//         d3.rgb(70, 130, 40),   // Vert olive
//         d3.rgb(100, 160, 60),  // Vert clair
//         d3.rgb(30, 110, 30),   // Vert foncé
//         d3.rgb(120, 180, 80)   // Vert-jaune
//     ];
    
//     // EFFET CANOPÉE AMÉLIORÉ - Couverture garantie du centre
//     const nombreBranchesPrincipales = Math.ceil(24 * settings.patternVisibility * densityMultiplier);
//     const nombreBranchesRemplissage = Math.ceil(12 * settings.patternVisibility * densityMultiplier);
    
//     console.log(`🌿 Canopée améliorée: ${nombreBranchesPrincipales} principales + ${nombreBranchesRemplissage} remplissage`);
    
//     // PARTIE 1 : BRANCHES PRINCIPALES - distribution déterministe
//     const branchesParBord = Math.ceil(nombreBranchesPrincipales / 4);
    
//     for (let bord = 0; bord < 4; bord++) {
//         for (let i = 0; i < branchesParBord; i++) {
//             let startX, startY, direction, minLength;
            
//             // Position DÉTERMINISTE sur chaque bord
//             const position = (i + 1) / (branchesParBord + 1); // Répartition équidistante
//             const variation = 0.05; // Très petite variation pour naturel
//             const pos = position + (Math.random() - 0.5) * variation;
            
//             switch (bord) {
//                 case 0: // Bord gauche
//                     startX = offsetX;
//                     startY = offsetY + pos * height;
//                     // Direction vers le centre-droit avec variation
//                     direction = -Math.PI/4 + Math.PI/2 + (Math.random() - 0.5) * Math.PI/3;
//                     minLength = width * 0.6; // Au moins 60% de largeur
//                     break;
//                 case 1: // Bord haut  
//                     startX = offsetX + pos * width;
//                     startY = offsetY;
//                     // Direction vers le centre-bas avec variation
//                     direction = Math.PI/2 + (Math.random() - 0.5) * Math.PI/3;
//                     minLength = height * 0.6; // Au moins 60% de hauteur
//                     break;
//                 case 2: // Bord droit
//                     startX = offsetX + width;
//                     startY = offsetY + pos * height;
//                     // Direction vers le centre-gauche avec variation
//                     direction = Math.PI - Math.PI/4 + (Math.random() - 0.5) * Math.PI/3;
//                     minLength = width * 0.6; // Au moins 60% de largeur
//                     break;
//                 case 3: // Bord bas
//                     startX = offsetX + pos * width;
//                     startY = offsetY + height;
//                     // Direction vers le centre-haut avec variation
//                     direction = -Math.PI/2 + (Math.random() - 0.5) * Math.PI/3;
//                     minLength = height * 0.6; // Au moins 60% de hauteur
//                     break;
//             }
            
//             // Créer branche principale longue
//             const branchGroup = bgGroup.append("g")
//                 .attr("class", "branch-system main-branch");
            
//             drawLongCanopyBranch(branchGroup, startX, startY, direction, minLength, settings, leafColors, mainBranchColor, smallBranchColor, sizeMultiplier, forExport);
            
//             // Animation
//             if (settings.animation && !forExport) {
//                 const duration = (6 + Math.random() * 4) / settings.animationSpeed;
//                 const delay = Math.random() * 3;
                
//                 branchGroup.style("transform-origin", `${startX}px ${startY}px`);
//                 branchGroup.style("animation", `branchSway ${duration}s infinite alternate ease-in-out ${delay}s`);
//             }
//         }
//     }
    
//     // PARTIE 2 : BRANCHES DE REMPLISSAGE POUR LE CENTRE
//     for (let i = 0; i < nombreBranchesRemplissage; i++) {
//         // Positions dans la zone centrale (30-70% de l'image)
//         const centerX = offsetX + width * (0.3 + Math.random() * 0.4);
//         const centerY = offsetY + height * (0.3 + Math.random() * 0.4);
        
//         // Direction aléatoire
//         const direction = Math.random() * Math.PI * 2;
//         const length = (100 + Math.random() * 200) * sizeMultiplier;
        
//         // Créer branche de remplissage
//         const fillBranchGroup = bgGroup.append("g")
//             .attr("class", "branch-system fill-branch");
        
//         drawCanopyBranchSystem(fillBranchGroup, centerX, centerY, direction, settings, leafColors, mainBranchColor, smallBranchColor, sizeMultiplier, forExport, width, height, offsetX, offsetY);
        
//         // Animation
//         if (settings.animation && !forExport) {
//             const duration = (5 + Math.random() * 3) / settings.animationSpeed;
//             const delay = Math.random() * 4;
            
//             fillBranchGroup.style("transform-origin", `${centerX}px ${centerY}px`);
//             fillBranchGroup.style("animation", `branchSway ${duration}s infinite alternate ease-in-out ${delay}s`);
//         }
//     }
    
//     // CSS animations
//     if (!forExport && !document.getElementById('branch-animations-css')) {
//         const styleElement = document.createElement('style');
//         styleElement.id = 'branch-animations-css';
//         styleElement.textContent = `
//             @keyframes branchSway {
//                 0% { transform: rotate(0deg); }
//                 100% { transform: rotate(1deg); }
//             }
            
//             @keyframes leafSway {
//                 0% { transform: rotate(-3deg); }
//                 100% { transform: rotate(3deg); }
//             }
//         `;
//         document.head.appendChild(styleElement);
//     }
// }








// // Très bien : Fond avec branches logiques - VERSION CORRIGÉE
// function setupTreeBranchesBackground(svg, customDimensions = null, forExport = false) {


//     /**
//      * Branches avec NIVEAUX HIÉRARCHIQUES comme un vrai arbre
//      */
//     function drawLongCanopyBranch(group, startX, startY, direction, minLength, settings, leafColors, sizeMultiplier, forExport) {
//         // Longueur garantie + extension aléatoire
//         const mainBranchLength = minLength + Math.random() * 200 * sizeMultiplier;
//         const mainBranchWidth = (3 + Math.random() * 3) * sizeMultiplier;
        
//         // TRONC PRINCIPAL - vert discret
//         const endX = startX + Math.cos(direction) * mainBranchLength;
//         const endY = startY + Math.sin(direction) * mainBranchLength;
        
//         // Dessiner tronc principal en vert discret
//         group.append("line")
//             .attr("class", "background-branch")
//             .attr("x1", startX)
//             .attr("y1", startY)
//             .attr("x2", endX)
//             .attr("y2", endY)
//             // .attr("stroke", "rgba(89, 125, 65, 0.4)") // Vert discret pour tronc
//             .attr("stroke", "rgba(139, 115, 85, 0.6)") // marrondiscret pour tronc
            
//             .attr("stroke-width", mainBranchWidth)
//             .attr("stroke-linecap", "round");
        
//         // NIVEAU 1 : Branches principales (grosses)
//         const nombreBranchesPrincipales = 8 + Math.floor(Math.random() * 8); // 8-15 branches principales
        
//         for (let i = 0; i < nombreBranchesPrincipales; i++) {
//             // Position le long du tronc (20% à 80%)
//             const position = 0.2 + (i / nombreBranchesPrincipales) * 0.6;
//             const branchX = startX + (endX - startX) * position;
//             const branchY = startY + (endY - startY) * position;
            
//             // Direction perpendiculaire avec variation
//             const branchDirection = direction + (Math.random() < 0.5 ? 1 : -1) * (Math.PI/2 + (Math.random() - 0.5) * Math.PI/4);
//             const branchLength = (60 + Math.random() * 120) * sizeMultiplier; // Branches moyennes
//             const branchWidth = (2 + Math.random() * 2) * sizeMultiplier;
            
//             // Bout de la branche principale
//             const branch1EndX = branchX + Math.cos(branchDirection) * branchLength;
//             const branch1EndY = branchY + Math.sin(branchDirection) * branchLength;
            
//             // Dessiner branche principale (NIVEAU 1)
//             group.append("line")
//                 .attr("class", "background-branch")
//                 .attr("x1", branchX)
//                 .attr("y1", branchY)
//                 .attr("x2", branch1EndX)
//                 .attr("y2", branch1EndY)
//                 .attr("stroke", "rgba(139, 115, 85, 0.6)") // Marron comme avant
//                 .attr("stroke-width", branchWidth)
//                 .attr("stroke-linecap", "round");
            
//             // QUELQUES FEUILLES sur branche principale (NIVEAU 1)
//             if (Math.random() < 0.4) { // 40% de chance d'avoir des feuilles sur niveau 1
//                 const nombreFeuillesNiv1 = 1 + Math.floor(Math.random() * 3); // 1-3 feuilles
//                 for (let f = 0; f < nombreFeuillesNiv1; f++) {
//                     const leafAngle = branchDirection + (Math.random() - 0.5) * Math.PI/3;
//                     const leafSize = (12 + Math.random() * 18) * sizeMultiplier;
//                     const leafColor = leafColors[Math.floor(Math.random() * leafColors.length)];
                    
//                     const leafX = branch1EndX + (Math.random() - 0.5) * 15;
//                     const leafY = branch1EndY + (Math.random() - 0.5) * 15;
                    
//                     drawCanopyLeaf(group, leafX, leafY, leafSize, leafAngle, leafColor, settings, forExport);
//                 }
//             }
            
//             // NIVEAU 2 : Sous-branches (plus petites)
//             const nombreSousBranches = 3 + Math.floor(Math.random() * 5); // 3-7 sous-branches
            
//             for (let j = 0; j < nombreSousBranches; j++) {
//                 // Position le long de la branche principale (30% à 90%)
//                 const subPosition = 0.3 + (j / nombreSousBranches) * 0.6;
//                 const subBranchX = branchX + (branch1EndX - branchX) * subPosition;
//                 const subBranchY = branchY + (branch1EndY - branchY) * subPosition;
                
//                 // Direction avec plus de variation pour naturel
//                 const subBranchDirection = branchDirection + (Math.random() - 0.5) * Math.PI/2;
//                 const subBranchLength = (30 + Math.random() * 60) * sizeMultiplier; // Plus petites
//                 const subBranchWidth = (1 + Math.random() * 1.5) * sizeMultiplier;
                
//                 // Bout de la sous-branche
//                 const branch2EndX = subBranchX + Math.cos(subBranchDirection) * subBranchLength;
//                 const branch2EndY = subBranchY + Math.sin(subBranchDirection) * subBranchLength;
                
//                 // Dessiner sous-branche (NIVEAU 2)
//                 group.append("line")
//                     .attr("class", "background-branch")
//                     .attr("x1", subBranchX)
//                     .attr("y1", subBranchY)
//                     .attr("x2", branch2EndX)
//                     .attr("y2", branch2EndY)
//                     .attr("stroke", "rgba(89, 125, 65, 0.7)") // Vert comme avant
//                     .attr("stroke-width", subBranchWidth)
//                     .attr("stroke-linecap", "round");
                
//                 // FEUILLES sur sous-branches (NIVEAU 2) - PLUS DE FEUILLES ICI
//                 const nombreFeuillesNiv2 = 3 + Math.floor(Math.random() * 5); // 3-7 feuilles
                
//                 for (let k = 0; k < nombreFeuillesNiv2; k++) {
//                     const leafAngle = subBranchDirection + (Math.random() - 0.5) * Math.PI/2;
//                     const leafSize = (10 + Math.random() * 20) * sizeMultiplier;
//                     const leafColor = leafColors[Math.floor(Math.random() * leafColors.length)];
                    
//                     const leafX = branch2EndX + (Math.random() - 0.5) * 20;
//                     const leafY = branch2EndY + (Math.random() - 0.5) * 20;
                    
//                     drawCanopyLeaf(group, leafX, leafY, leafSize, leafAngle, leafColor, settings, forExport);
//                 }
                
//                 // NIVEAU 3 : Rameaux (optionnel pour plus de complexité)
//                 if (Math.random() < 0.6) { // 60% de chance d'avoir niveau 3
//                     const nombreRameaux = 1 + Math.floor(Math.random() * 3); // 1-3 rameaux
                    
//                     for (let r = 0; r < nombreRameaux; r++) {
//                         const rameauPosition = 0.5 + Math.random() * 0.4; // Plutôt vers le bout
//                         const rameauX = subBranchX + (branch2EndX - subBranchX) * rameauPosition;
//                         const rameauY = subBranchY + (branch2EndY - subBranchY) * rameauPosition;
                        
//                         const rameauDirection = subBranchDirection + (Math.random() - 0.5) * Math.PI/3;
//                         const rameauLength = (15 + Math.random() * 30) * sizeMultiplier; // Très petites
//                         const rameauWidth = (0.5 + Math.random() * 1) * sizeMultiplier;
                        
//                         const rameauEndX = rameauX + Math.cos(rameauDirection) * rameauLength;
//                         const rameauEndY = rameauY + Math.sin(rameauDirection) * rameauLength;
                        
//                         // Dessiner rameau (NIVEAU 3)
//                         group.append("line")
//                             .attr("class", "background-branch")
//                             .attr("x1", rameauX)
//                             .attr("y1", rameauY)
//                             .attr("x2", rameauEndX)
//                             .attr("y2", rameauEndY)
//                             .attr("stroke", "rgba(89, 125, 65, 0.5)") // Vert fin
//                             .attr("stroke-width", rameauWidth)
//                             .attr("stroke-linecap", "round");
                        
//                         // FEUILLES sur rameaux (NIVEAU 3)
//                         const nombreFeuillesNiv3 = 1 + Math.floor(Math.random() * 3); // 1-3 feuilles
                        
//                         for (let l = 0; l < nombreFeuillesNiv3; l++) {
//                             const leafAngle = rameauDirection + (Math.random() - 0.5) * Math.PI/4;
//                             const leafSize = (8 + Math.random() * 15) * sizeMultiplier; // Plus petites
//                             const leafColor = leafColors[Math.floor(Math.random() * leafColors.length)];
                            
//                             const leafX = rameauEndX + (Math.random() - 0.5) * 10;
//                             const leafY = rameauEndY + (Math.random() - 0.5) * 10;
                            
//                             drawCanopyLeaf(group, leafX, leafY, leafSize, leafAngle, leafColor, settings, forExport);
//                         }
//                     }
//                 }
//             }
//         }
        
//         // Feuilles au bout du tronc principal
//         const endLeaves = 4 + Math.floor(Math.random() * 6);
//         for (let e = 0; e < endLeaves; e++) {
//             const leafAngle = direction + (Math.random() - 0.5) * Math.PI/3;
//             const leafSize = (15 + Math.random() * 25) * sizeMultiplier;
//             const leafColor = leafColors[Math.floor(Math.random() * leafColors.length)];
            
//             const leafX = endX + (Math.random() - 0.5) * 25;
//             const leafY = endY + (Math.random() - 0.5) * 25;
            
//             drawCanopyLeaf(group, leafX, leafY, leafSize, leafAngle, leafColor, settings, forExport);
//         }
//     }

//     /**
//      * Système de branches de remplissage avec espacement naturel
//      */
//     function drawCanopyBranchSystem(group, startX, startY, initialDirection, settings, leafColors, mainBranchColor, smallBranchColor, sizeMultiplier, forExport, width, height, offsetX, offsetY) {
//         // Longueur plus modérée pour les branches de remplissage
//         const mainBranchLength = (100 + Math.random() * 250) * sizeMultiplier;
//         const mainBranchWidth = (1.5 + Math.random() * 1.5) * sizeMultiplier; // Plus discret
        
//         // BRANCHE PRINCIPALE
//         const endX = startX + Math.cos(initialDirection) * mainBranchLength;
//         const endY = startY + Math.sin(initialDirection) * mainBranchLength;
        
//         // Dessiner branche principale verte discrète
//         group.append("line")
//             .attr("class", "background-branch")
//             .attr("x1", startX)
//             .attr("y1", startY)
//             .attr("x2", endX)
//             .attr("y2", endY)
//             .attr("stroke", `rgba(${mainBranchColor.r}, ${mainBranchColor.g}, ${mainBranchColor.b}, 0.4)`) // Plus discret
//             .attr("stroke-width", mainBranchWidth)
//             .attr("stroke-linecap", "round");
        
//         // Grille d'espacement pour les feuilles
//         const leafGrid = new Set();
//         const gridSize = 35;
        
//         // Petites branches plus naturelles
//         const nombrePetitesBranches = 4 + Math.floor(Math.random() * 6); // Moins de branches pour éviter surcharge
        
//         for (let i = 0; i < nombrePetitesBranches; i++) {
//             const position = 0.3 + (i / nombrePetitesBranches) * 0.6;
//             const branchX = startX + (endX - startX) * position;
//             const branchY = startY + (endY - startY) * position;
            
//             // Direction plus naturelle
//             const basePerpendicular = initialDirection + Math.PI/2;
//             const side = Math.random() < 0.5 ? 1 : -1;
//             const branchDirection = basePerpendicular * side + (Math.random() - 0.5) * Math.PI/4;
            
//             const branchLength = (30 + Math.random() * 60) * sizeMultiplier;
//             const branchWidth = (0.8 + Math.random() * 0.8) * sizeMultiplier; // Plus discret
            
//             const smallEndX = branchX + Math.cos(branchDirection) * branchLength;
//             const smallEndY = branchY + Math.sin(branchDirection) * branchLength;
            
//             // Dessiner petite branche discrète
//             group.append("line")
//                 .attr("class", "background-branch")
//                 .attr("x1", branchX)
//                 .attr("y1", branchY)
//                 .attr("x2", smallEndX)
//                 .attr("y2", smallEndY)
//                 .attr("stroke", `rgba(${smallBranchColor.r}, ${smallBranchColor.g}, ${smallBranchColor.b}, 0.3)`) // Très discret
//                 .attr("stroke-width", branchWidth)
//                 .attr("stroke-linecap", "round");
            
//             // Feuilles avec espacement
//             const nombreFeuilles = 2 + Math.floor(Math.random() * 3); // 2-4 feuilles seulement
            
//             for (let j = 0; j < nombreFeuilles; j++) {
//                 const leafAngle = branchDirection + (Math.random() - 0.5) * Math.PI/4;
//                 const leafSize = (8 + Math.random() * 15) * sizeMultiplier; // Plus petites
//                 const leafColor = leafColors[Math.floor(Math.random() * leafColors.length)];
                
//                 // Position avec évitement de chevauchement
//                 let leafX, leafY, attempts = 0;
//                 let validPosition = false;
                
//                 do {
//                     leafX = smallEndX + (Math.random() - 0.5) * 20;
//                     leafY = smallEndY + (Math.random() - 0.5) * 20;
                    
//                     const gridX = Math.floor(leafX / gridSize);
//                     const gridY = Math.floor(leafY / gridSize);
//                     const gridKey = `${gridX},${gridY}`;
                    
//                     if (!leafGrid.has(gridKey)) {
//                         leafGrid.add(gridKey);
//                         validPosition = true;
//                     } else {
//                         attempts++;
//                     }
//                 } while (!validPosition && attempts < 3);
                
//                 if (validPosition) {
//                     drawCanopyLeaf(group, leafX, leafY, leafSize, leafAngle, leafColor, settings, forExport);
//                 }
//             }
//         }
//     }

//     /**
//      * Dessine une feuille de canopée
//      */
//     function drawCanopyLeaf(group, x, y, size, angle, leafColor, settings, forExport) {
//         const angleRad = angle;
        
//         // Forme de feuille naturelle
//         const leaf = group.append("path")
//             .attr("class", "background-leaf")
//             .attr("d", `M ${x} ${y} 
//                     Q ${x + Math.cos(angleRad) * size * 0.5} ${y + Math.sin(angleRad) * size * 0.5}, 
//                         ${x + Math.cos(angleRad) * size} ${y + Math.sin(angleRad) * size}
//                     Q ${x + Math.cos(angleRad + 0.5) * size * 0.7} ${y + Math.sin(angleRad + 0.5) * size * 0.7},
//                         ${x} ${y}`)
//             .attr("fill", leafColor.toString())
//             .attr("stroke", d3.rgb(leafColor).darker(0.5).toString())
//             .attr("stroke-width", "0.5");
        
//         // Animation si activée
//         if (settings.animation && !forExport && Math.random() < 0.3) {
//             const swayDuration = (4 + Math.random() * 3) / settings.animationSpeed;
//             const delay = Math.random() * 2;
            
//             leaf.style("transform-origin", `${x}px ${y}px`);
//             leaf.style("animation", `leafSway ${swayDuration}s infinite alternate ease-in-out ${delay}s`);
//         }
//     }


//     // Utiliser les dimensions personnalisées ou celles de l'écran
//     const width = customDimensions ? customDimensions.width : window.innerWidth;
//     const height = customDimensions ? customDimensions.height : window.innerHeight;
//     const offsetX = customDimensions ? customDimensions.minX : 0;
//     const offsetY = customDimensions ? customDimensions.minY : 0;

//     // Calculer la densité adaptative pour l'export
//     let densityMultiplier = 1;
//     let sizeMultiplier = 1;

//     if (forExport) {
//         const baseArea = 1920 * 1080;
//         const currentArea = width * height;
//         const areaRatio = currentArea / baseArea;
        
//         densityMultiplier = Math.sqrt(areaRatio) * 0.8;
//         sizeMultiplier = Math.min(3, Math.max(1.5, areaRatio * 0.1));
        
//         console.log(`📊 Export branches - Densité: x${densityMultiplier.toFixed(2)}, Taille: x${sizeMultiplier.toFixed(2)}`);
//     }

//     console.log(`🌿 Setup branches logiques: ${width}x${height} (offset: ${offsetX}, ${offsetY}) - Export: ${forExport}`);
    
//     const defs = svg.append("defs");
    
//     // Nettoyer tout fond existant
//     svg.selectAll(".background-element").remove();
    
//     // Créer un groupe pour le fond
//     const bgGroup = svg.append("g")
//         .attr("class", "background-element")
//         .attr("pointer-events", "none")
//         .lower();
    
//     // Récupérer les paramètres
//     const settings = {
//         opacity: parseFloat(localStorage.getItem('backgroundOpacity') || 0.15),
//         patternVisibility: parseFloat(localStorage.getItem('patternVisibility') || 1.0),
//         animation: forExport ? false : localStorage.getItem('backgroundAnimation') === 'true',
//         animationSpeed: parseFloat(localStorage.getItem('animationSpeed') || 1.0),
//         customColor: localStorage.getItem('backgroundCustomColor') || '#3F51B5'
//     };
    
//     // Appliquer l'opacité globale
//     bgGroup.style("opacity", settings.opacity);
    
//     // Gradient de fond
//     const gradientId = `branches-bg-gradient-${Date.now()}`;
//     const bgGradient = defs.append("linearGradient")
//         .attr("id", gradientId)
//         .attr("x1", "0%")
//         .attr("y1", "0%")
//         .attr("x2", "100%")
//         .attr("y2", "100%");
    
//     const baseColor = d3.rgb(settings.customColor);
//     const lighterColor = d3.rgb(baseColor).brighter(1.5);
//     const darkerColor = d3.rgb(baseColor).darker(0.2);
    
//     bgGradient.append("stop")
//         .attr("offset", "0%")
//         .attr("stop-color", lighterColor.toString());
    
//     bgGradient.append("stop")
//         .attr("offset", "100%")
//         .attr("stop-color", darkerColor.toString());
    
//     // Rectangle de fond
//     bgGroup.append("rect")
//         .attr("x", offsetX)
//         .attr("y", offsetY)
//         .attr("width", width)
//         .attr("height", height)
//         .attr("fill", `url(#${gradientId})`)
//         .attr("pointer-events", "none")
//         .lower();
    
//     // Couleurs pour branches et feuilles
//     const leafColors = [
//         d3.rgb(50, 150, 50),   // Vert vif
//         d3.rgb(70, 130, 40),   // Vert olive
//         d3.rgb(100, 160, 60),  // Vert clair
//         d3.rgb(30, 110, 30),   // Vert foncé
//         d3.rgb(120, 180, 80)   // Vert-jaune
//     ];
    
//     // EFFET CANOPÉE AMÉLIORÉ - Couverture garantie du centre
//     const nombreBranchesPrincipales = Math.ceil(24 * settings.patternVisibility * densityMultiplier);
//     const nombreBranchesRemplissage = Math.ceil(12 * settings.patternVisibility * densityMultiplier);
    
//     console.log(`🌿 Canopée améliorée: ${nombreBranchesPrincipales} principales + ${nombreBranchesRemplissage} remplissage`);
    
//     // PARTIE 1 : BRANCHES PRINCIPALES - distribution déterministe
//     const branchesParBord = Math.ceil(nombreBranchesPrincipales / 4);
    
//     for (let bord = 0; bord < 4; bord++) {
//         for (let i = 0; i < branchesParBord; i++) {
//             let startX, startY, direction, minLength;
            
//             // Position DÉTERMINISTE sur chaque bord
//             const position = (i + 1) / (branchesParBord + 1); // Répartition équidistante
//             const variation = 0.05; // Très petite variation pour naturel
//             const pos = position + (Math.random() - 0.5) * variation;
            
//             switch (bord) {
//                 case 0: // Bord gauche
//                     startX = offsetX;
//                     startY = offsetY + pos * height;
//                     // Direction vers le centre-droit avec variation
//                     direction = -Math.PI/4 + Math.PI/2 + (Math.random() - 0.5) * Math.PI/3;
//                     minLength = width * 0.6; // Au moins 60% de largeur
//                     break;
//                 case 1: // Bord haut  
//                     startX = offsetX + pos * width;
//                     startY = offsetY;
//                     // Direction vers le centre-bas avec variation
//                     direction = Math.PI/2 + (Math.random() - 0.5) * Math.PI/3;
//                     minLength = height * 0.6; // Au moins 60% de hauteur
//                     break;
//                 case 2: // Bord droit
//                     startX = offsetX + width;
//                     startY = offsetY + pos * height;
//                     // Direction vers le centre-gauche avec variation
//                     direction = Math.PI - Math.PI/4 + (Math.random() - 0.5) * Math.PI/3;
//                     minLength = width * 0.6; // Au moins 60% de largeur
//                     break;
//                 case 3: // Bord bas
//                     startX = offsetX + pos * width;
//                     startY = offsetY + height;
//                     // Direction vers le centre-haut avec variation
//                     direction = -Math.PI/2 + (Math.random() - 0.5) * Math.PI/3;
//                     minLength = height * 0.6; // Au moins 60% de hauteur
//                     break;
//             }
            
//             // Créer branche principale longue
//             const branchGroup = bgGroup.append("g")
//                 .attr("class", "branch-system main-branch");
            
//             drawLongCanopyBranch(branchGroup, startX, startY, direction, minLength, settings, leafColors, sizeMultiplier, forExport);
            
//             // Animation
//             if (settings.animation && !forExport) {
//                 const duration = (6 + Math.random() * 4) / settings.animationSpeed;
//                 const delay = Math.random() * 3;
                
//                 branchGroup.style("transform-origin", `${startX}px ${startY}px`);
//                 branchGroup.style("animation", `branchSway ${duration}s infinite alternate ease-in-out ${delay}s`);
//             }
//         }
//     }
    
//     // PARTIE 2 : BRANCHES DE REMPLISSAGE POUR LE CENTRE
//     for (let i = 0; i < nombreBranchesRemplissage; i++) {
//         // Positions dans la zone centrale (30-70% de l'image)
//         const centerX = offsetX + width * (0.3 + Math.random() * 0.4);
//         const centerY = offsetY + height * (0.3 + Math.random() * 0.4);
        
//         // Direction aléatoire
//         const direction = Math.random() * Math.PI * 2;
//         const length = (100 + Math.random() * 200) * sizeMultiplier;
        
//         // Créer branche de remplissage
//         const fillBranchGroup = bgGroup.append("g")
//             .attr("class", "branch-system fill-branch");
        
//         drawCanopyBranchSystem(fillBranchGroup, centerX, centerY, direction, settings, leafColors, sizeMultiplier, forExport, width, height, offsetX, offsetY);
        
//         // Animation
//         if (settings.animation && !forExport) {
//             const duration = (5 + Math.random() * 3) / settings.animationSpeed;
//             const delay = Math.random() * 4;
            
//             fillBranchGroup.style("transform-origin", `${centerX}px ${centerY}px`);
//             fillBranchGroup.style("animation", `branchSway ${duration}s infinite alternate ease-in-out ${delay}s`);
//         }
//     }
    
//     // CSS animations
//     if (!forExport && !document.getElementById('branch-animations-css')) {
//         const styleElement = document.createElement('style');
//         styleElement.id = 'branch-animations-css';
//         styleElement.textContent = `
//             @keyframes branchSway {
//                 0% { transform: rotate(0deg); }
//                 100% { transform: rotate(1deg); }
//             }
            
//             @keyframes leafSway {
//                 0% { transform: rotate(-3deg); }
//                 100% { transform: rotate(3deg); }
//             }
//         `;
//         document.head.appendChild(styleElement);
//     }
// }





// // Très bien : Fond avec branches logiques - VERSION CORRIGÉE
async function setupTreeBranchesBackground(svg, customDimensions = null, forExport = false) {


    /**
     * Branches avec NIVEAUX HIÉRARCHIQUES comme un vrai arbre
     */
    function drawLongCanopyBranch(group, startX, startY, direction, minLength, settings, leafColors, sizeMultiplier, forExport) {
        // Longueur garantie + extension aléatoire
        const mainBranchLength = minLength + Math.random() * 200 * sizeMultiplier;
        const mainBranchWidth = (3 + Math.random() * 3) * sizeMultiplier;
        
        // TRONC PRINCIPAL - vert discret
        const endX = startX + Math.cos(direction) * mainBranchLength;
        const endY = startY + Math.sin(direction) * mainBranchLength;
        
        // Dessiner tronc principal en vert discret
        group.append("line")
            .attr("class", "background-branch")
            .attr("x1", startX)
            .attr("y1", startY)
            .attr("x2", endX)
            .attr("y2", endY)
            // .attr("stroke", "rgba(89, 125, 65, 0.4)") // Vert discret pour tronc
            .attr("stroke", "rgba(139, 115, 85, 0.6)") // marrondiscret pour tronc
            
            .attr("stroke-width", mainBranchWidth)
            .attr("stroke-linecap", "round");
        
        // NIVEAU 1 : Branches principales (grosses)
        const nombreBranchesPrincipales = 8 + Math.floor(Math.random() * 8); // 8-15 branches principales
        
        for (let i = 0; i < nombreBranchesPrincipales; i++) {
            // Position le long du tronc (20% à 80%)
            const position = 0.2 + (i / nombreBranchesPrincipales) * 0.6;
            const branchX = startX + (endX - startX) * position;
            const branchY = startY + (endY - startY) * position;
            
            // Direction perpendiculaire avec variation
            const branchDirection = direction + (Math.random() < 0.5 ? 1 : -1) * (Math.PI/2 + (Math.random() - 0.5) * Math.PI/4);
            const branchLength = (60 + Math.random() * 120) * sizeMultiplier; // Branches moyennes
            const branchWidth = (2 + Math.random() * 2) * sizeMultiplier;
            
            // Bout de la branche principale
            const branch1EndX = branchX + Math.cos(branchDirection) * branchLength;
            const branch1EndY = branchY + Math.sin(branchDirection) * branchLength;
            
            // Dessiner branche principale (NIVEAU 1)
            group.append("line")
                .attr("class", "background-branch")
                .attr("x1", branchX)
                .attr("y1", branchY)
                .attr("x2", branch1EndX)
                .attr("y2", branch1EndY)
                .attr("stroke", "rgba(139, 115, 85, 0.6)") // Marron comme avant
                .attr("stroke-width", branchWidth)
                .attr("stroke-linecap", "round");
            
            // QUELQUES FEUILLES sur branche principale (NIVEAU 1)
            if (Math.random() < 0.4) { // 40% de chance d'avoir des feuilles sur niveau 1
                const nombreFeuillesNiv1 = 1 + Math.floor(Math.random() * 3); // 1-3 feuilles
                for (let f = 0; f < nombreFeuillesNiv1; f++) {
                    const leafAngle = branchDirection + (Math.random() - 0.5) * Math.PI/3;
                    const leafSize = (12 + Math.random() * 18) * sizeMultiplier;
                    const leafColor = leafColors[Math.floor(Math.random() * leafColors.length)];
                    
                    const leafX = branch1EndX + (Math.random() - 0.5) * 15;
                    const leafY = branch1EndY + (Math.random() - 0.5) * 15;
                    
                    drawCanopyLeaf(group, leafX, leafY, leafSize, leafAngle, leafColor, settings, forExport);
                }
            }
            
            // NIVEAU 2 : Sous-branches (plus petites)
            const nombreSousBranches = 3 + Math.floor(Math.random() * 5); // 3-7 sous-branches
            
            for (let j = 0; j < nombreSousBranches; j++) {
                // Position le long de la branche principale (30% à 90%)
                const subPosition = 0.3 + (j / nombreSousBranches) * 0.6;
                const subBranchX = branchX + (branch1EndX - branchX) * subPosition;
                const subBranchY = branchY + (branch1EndY - branchY) * subPosition;
                
                // Direction avec plus de variation pour naturel
                const subBranchDirection = branchDirection + (Math.random() - 0.5) * Math.PI/2;
                const subBranchLength = (30 + Math.random() * 60) * sizeMultiplier; // Plus petites
                const subBranchWidth = (1 + Math.random() * 1.5) * sizeMultiplier;
                
                // Bout de la sous-branche
                const branch2EndX = subBranchX + Math.cos(subBranchDirection) * subBranchLength;
                const branch2EndY = subBranchY + Math.sin(subBranchDirection) * subBranchLength;
                
                // Dessiner sous-branche (NIVEAU 2)
                group.append("line")
                    .attr("class", "background-branch")
                    .attr("x1", subBranchX)
                    .attr("y1", subBranchY)
                    .attr("x2", branch2EndX)
                    .attr("y2", branch2EndY)
                    .attr("stroke", "rgba(89, 125, 65, 0.7)") // Vert comme avant
                    .attr("stroke-width", subBranchWidth)
                    .attr("stroke-linecap", "round");
                
                // FEUILLES sur sous-branches (NIVEAU 2) - PLUS DE FEUILLES ICI
                const nombreFeuillesNiv2 = 3 + Math.floor(Math.random() * 5); // 3-7 feuilles
                
                for (let k = 0; k < nombreFeuillesNiv2; k++) {
                    const leafAngle = subBranchDirection + (Math.random() - 0.5) * Math.PI/2;
                    const leafSize = (10 + Math.random() * 20) * sizeMultiplier;
                    const leafColor = leafColors[Math.floor(Math.random() * leafColors.length)];
                    
                    const leafX = branch2EndX + (Math.random() - 0.5) * 20;
                    const leafY = branch2EndY + (Math.random() - 0.5) * 20;
                    
                    drawCanopyLeaf(group, leafX, leafY, leafSize, leafAngle, leafColor, settings, forExport);
                }
                
                // NIVEAU 3 : Rameaux (optionnel pour plus de complexité)
                if (Math.random() < 0.6) { // 60% de chance d'avoir niveau 3
                    const nombreRameaux = 1 + Math.floor(Math.random() * 3); // 1-3 rameaux
                    
                    for (let r = 0; r < nombreRameaux; r++) {
                        const rameauPosition = 0.5 + Math.random() * 0.4; // Plutôt vers le bout
                        const rameauX = subBranchX + (branch2EndX - subBranchX) * rameauPosition;
                        const rameauY = subBranchY + (branch2EndY - subBranchY) * rameauPosition;
                        
                        const rameauDirection = subBranchDirection + (Math.random() - 0.5) * Math.PI/3;
                        const rameauLength = (15 + Math.random() * 30) * sizeMultiplier; // Très petites
                        const rameauWidth = (0.5 + Math.random() * 1) * sizeMultiplier;
                        
                        const rameauEndX = rameauX + Math.cos(rameauDirection) * rameauLength;
                        const rameauEndY = rameauY + Math.sin(rameauDirection) * rameauLength;
                        
                        // Dessiner rameau (NIVEAU 3)
                        group.append("line")
                            .attr("class", "background-branch")
                            .attr("x1", rameauX)
                            .attr("y1", rameauY)
                            .attr("x2", rameauEndX)
                            .attr("y2", rameauEndY)
                            .attr("stroke", "rgba(89, 125, 65, 0.5)") // Vert fin
                            .attr("stroke-width", rameauWidth)
                            .attr("stroke-linecap", "round");
                        
                        // FEUILLES sur rameaux (NIVEAU 3)
                        const nombreFeuillesNiv3 = 1 + Math.floor(Math.random() * 3); // 1-3 feuilles
                        
                        for (let l = 0; l < nombreFeuillesNiv3; l++) {
                            const leafAngle = rameauDirection + (Math.random() - 0.5) * Math.PI/4;
                            const leafSize = (8 + Math.random() * 15) * sizeMultiplier; // Plus petites
                            const leafColor = leafColors[Math.floor(Math.random() * leafColors.length)];
                            
                            const leafX = rameauEndX + (Math.random() - 0.5) * 10;
                            const leafY = rameauEndY + (Math.random() - 0.5) * 10;
                            
                            drawCanopyLeaf(group, leafX, leafY, leafSize, leafAngle, leafColor, settings, forExport);
                        }
                    }
                }
            }
        }
        
        // Feuilles au bout du tronc principal
        const endLeaves = 4 + Math.floor(Math.random() * 6);
        for (let e = 0; e < endLeaves; e++) {
            const leafAngle = direction + (Math.random() - 0.5) * Math.PI/3;
            const leafSize = (15 + Math.random() * 25) * sizeMultiplier;
            const leafColor = leafColors[Math.floor(Math.random() * leafColors.length)];
            
            const leafX = endX + (Math.random() - 0.5) * 25;
            const leafY = endY + (Math.random() - 0.5) * 25;
            
            drawCanopyLeaf(group, leafX, leafY, leafSize, leafAngle, leafColor, settings, forExport);
        }
    }

    /**
     * Système de branches de remplissage avec espacement naturel
     */
    function drawCanopyBranchSystem(group, startX, startY, initialDirection, settings, leafColors, mainBranchColor, smallBranchColor, sizeMultiplier, forExport, width, height, offsetX, offsetY) {
        // Longueur plus modérée pour les branches de remplissage
        const mainBranchLength = (100 + Math.random() * 250) * sizeMultiplier;
        const mainBranchWidth = (1.5 + Math.random() * 1.5) * sizeMultiplier; // Plus discret
        
        // BRANCHE PRINCIPALE
        const endX = startX + Math.cos(initialDirection) * mainBranchLength;
        const endY = startY + Math.sin(initialDirection) * mainBranchLength;
        
        // Dessiner branche principale verte discrète
        group.append("line")
            .attr("class", "background-branch")
            .attr("x1", startX)
            .attr("y1", startY)
            .attr("x2", endX)
            .attr("y2", endY)
            .attr("stroke", `rgba(${mainBranchColor.r}, ${mainBranchColor.g}, ${mainBranchColor.b}, 0.4)`) // Plus discret
            .attr("stroke-width", mainBranchWidth)
            .attr("stroke-linecap", "round");
        
        // Grille d'espacement pour les feuilles
        const leafGrid = new Set();
        const gridSize = 35;
        
        // Petites branches plus naturelles
        const nombrePetitesBranches = 4 + Math.floor(Math.random() * 6); // Moins de branches pour éviter surcharge
        
        for (let i = 0; i < nombrePetitesBranches; i++) {
            const position = 0.3 + (i / nombrePetitesBranches) * 0.6;
            const branchX = startX + (endX - startX) * position;
            const branchY = startY + (endY - startY) * position;
            
            // Direction plus naturelle
            const basePerpendicular = initialDirection + Math.PI/2;
            const side = Math.random() < 0.5 ? 1 : -1;
            const branchDirection = basePerpendicular * side + (Math.random() - 0.5) * Math.PI/4;
            
            const branchLength = (30 + Math.random() * 60) * sizeMultiplier;
            const branchWidth = (0.8 + Math.random() * 0.8) * sizeMultiplier; // Plus discret
            
            const smallEndX = branchX + Math.cos(branchDirection) * branchLength;
            const smallEndY = branchY + Math.sin(branchDirection) * branchLength;
            
            // Dessiner petite branche discrète
            group.append("line")
                .attr("class", "background-branch")
                .attr("x1", branchX)
                .attr("y1", branchY)
                .attr("x2", smallEndX)
                .attr("y2", smallEndY)
                .attr("stroke", `rgba(${smallBranchColor.r}, ${smallBranchColor.g}, ${smallBranchColor.b}, 0.3)`) // Très discret
                .attr("stroke-width", branchWidth)
                .attr("stroke-linecap", "round");
            
            // Feuilles avec espacement
            const nombreFeuilles = 2 + Math.floor(Math.random() * 3); // 2-4 feuilles seulement
            
            for (let j = 0; j < nombreFeuilles; j++) {
                const leafAngle = branchDirection + (Math.random() - 0.5) * Math.PI/4;
                const leafSize = (8 + Math.random() * 15) * sizeMultiplier; // Plus petites
                const leafColor = leafColors[Math.floor(Math.random() * leafColors.length)];
                
                // Position avec évitement de chevauchement
                let leafX, leafY, attempts = 0;
                let validPosition = false;
                
                do {
                    leafX = smallEndX + (Math.random() - 0.5) * 20;
                    leafY = smallEndY + (Math.random() - 0.5) * 20;
                    
                    const gridX = Math.floor(leafX / gridSize);
                    const gridY = Math.floor(leafY / gridSize);
                    const gridKey = `${gridX},${gridY}`;
                    
                    if (!leafGrid.has(gridKey)) {
                        leafGrid.add(gridKey);
                        validPosition = true;
                    } else {
                        attempts++;
                    }
                } while (!validPosition && attempts < 3);
                
                if (validPosition) {
                    drawCanopyLeaf(group, leafX, leafY, leafSize, leafAngle, leafColor, settings, forExport);
                }
            }
        }
    }

    /**
     * Dessine une feuille de canopée
     */
    function drawCanopyLeaf(group, x, y, size, angle, leafColor, settings, forExport) {
        const angleRad = angle;
        
        // Forme de feuille naturelle
        const leaf = group.append("path")
            .attr("class", "background-leaf")
            .attr("d", `M ${x} ${y} 
                    Q ${x + Math.cos(angleRad) * size * 0.5} ${y + Math.sin(angleRad) * size * 0.5}, 
                        ${x + Math.cos(angleRad) * size} ${y + Math.sin(angleRad) * size}
                    Q ${x + Math.cos(angleRad + 0.5) * size * 0.7} ${y + Math.sin(angleRad + 0.5) * size * 0.7},
                        ${x} ${y}`)
            .attr("fill", leafColor.toString())
            .attr("stroke", d3.rgb(leafColor).darker(0.5).toString())
            .attr("stroke-width", "0.5");
        
        // Animation si activée
        if (settings.animation && !forExport && Math.random() < 0.3) {
            const swayDuration = (4 + Math.random() * 3) / settings.animationSpeed;
            const delay = Math.random() * 2;
            
            leaf.style("transform-origin", `${x}px ${y}px`);
            leaf.style("animation", `leafSway ${swayDuration}s infinite alternate ease-in-out ${delay}s`);
        }
    }


    /**
     * Gestionnaire de densité simple pour les passes d'optimisation
     */
    class DensityChecker {
        constructor(width, height, cellSize = 60) {
            this.width = width;
            this.height = height;
            this.cellSize = cellSize;
            this.cols = Math.ceil(width / cellSize);
            this.rows = Math.ceil(height / cellSize);
            this.grid = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        }

        // Compter les feuilles dans une zone
        countLeavesInRadius(centerX, centerY, radius, bgGroup) {
            let count = 0;
            const elements = bgGroup.selectAll('.background-leaf').nodes();
            
            elements.forEach(leaf => {
                const leafData = leaf.getAttribute('d');
                if (leafData) {
                    // Extraire les coordonnées x,y du path
                    const match = leafData.match(/M\s*([\d.-]+)\s*([\d.-]+)/);
                    if (match) {
                        const leafX = parseFloat(match[1]);
                        const leafY = parseFloat(match[2]);
                        const distance = Math.sqrt((leafX - centerX) ** 2 + (leafY - centerY) ** 2);
                        if (distance <= radius) {
                            count++;
                        }
                    }
                }
            });
            return count;
        }
    }

    /**
     * PASSE 2 : Suppression des branches dans les zones trop denses
     */
    function secondPass(bgGroup, width, height) {
        console.log("🔍 PASSE 2: Détection et suppression des zones trop denses...");
        
        const densityChecker = new DensityChecker(width, height);
        
        // Analyser toutes les branches existantes
        const allBranches = bgGroup.selectAll('.branch-system').nodes();
        let branchesRemoved = 0;

        allBranches.forEach(branchElement => {
            // Récupérer la position de la branche (première ligne de la branche)
            const firstLine = d3.select(branchElement).select('line');
            if (!firstLine.empty()) {
                const x1 = parseFloat(firstLine.attr('x1'));
                const y1 = parseFloat(firstLine.attr('y1'));
                
                // Compter les feuilles dans un rayon de 80px autour de cette branche
                const localDensity = densityChecker.countLeavesInRadius(x1, y1, 80, bgGroup);
                
                // Si trop de feuilles (> 25), supprimer cette branche
                if (localDensity > 25) {
                    d3.select(branchElement).remove();
                    branchesRemoved++;
                }
            }
        });

        console.log(`❌ Supprimé ${branchesRemoved} branches dans les zones trop denses`);
        return branchesRemoved;
    }

    // /**
    //  * PASSE 3 : Ajout de petites branches dans les zones vides
    //  */
    // function thirdPass(bgGroup, width, height, offsetX, offsetY, settings, leafColors, sizeMultiplier, forExport, drawCanopyBranchSystem) {
    //     console.log("🌱 PASSE 3: Détection des zones vides et ajout de petites branches...");
        
    //     const densityChecker = new DensityChecker(width, height);
        
    //     // Diviser l'écran en zones pour vérifier la couverture
    //     const zoneSize = Math.min(width, height) / 4; // Zones de 1/4 de la taille de l'écran
    //     const zonesX = Math.ceil(width / zoneSize);
    //     const zonesY = Math.ceil(height / zoneSize);

    //     let zonesAdded = 0;

    //     // Couleurs pour les nouvelles branches (reprendre les couleurs existantes)
    //     const mainBranchColor = {r: 89, g: 125, b: 65};
    //     const smallBranchColor = {r: 89, g: 125, b: 65};

    //     for (let zx = 0; zx < zonesX; zx++) {
    //         for (let zy = 0; zy < zonesY; zy++) {
    //             const zoneCenterX = offsetX + (zx + 0.5) * zoneSize;
    //             const zoneCenterY = offsetY + (zy + 0.5) * zoneSize;
                
    //             // Vérifier si cette zone est dans les limites
    //             if (zoneCenterX < offsetX + width && zoneCenterY < offsetY + height) {
                    
    //                 // Compter les feuilles dans cette zone
    //                 const zoneRadius = zoneSize * 0.4; // 40% de la zone
    //                 const leafCount = densityChecker.countLeavesInRadius(zoneCenterX, zoneCenterY, zoneRadius, bgGroup);
                    
    //                 // Si moins de 8 feuilles, c'est une zone vide
    //                 if (leafCount < 8) {
                        
    //                     // Ajouter 1-2 petites branches dans cette zone
    //                     const numberOfSmallBranches = 1 + Math.floor(Math.random() * 2);
                        
    //                     for (let i = 0; i < numberOfSmallBranches; i++) {
    //                         // Position aléatoire dans la zone
    //                         const branchX = zoneCenterX + (Math.random() - 0.5) * zoneSize * 0.6;
    //                         const branchY = zoneCenterY + (Math.random() - 0.5) * zoneSize * 0.6;
                            
    //                         // Direction aléatoire
    //                         const direction = Math.random() * Math.PI * 2;
                            
    //                         // Créer groupe pour cette petite branche
    //                         const smallBranchGroup = bgGroup.append("g")
    //                             .attr("class", "branch-system fill-branch-small");
                            
    //                         // RÉUTILISER LA FONCTION EXISTANTE drawCanopyBranchSystem
    //                         // avec des paramètres adaptés pour une petite branche
    //                         const smallSizeMultiplier = sizeMultiplier * 0.6; // 60% de la taille normale
                            
    //                         drawCanopyBranchSystem(
    //                             smallBranchGroup, 
    //                             branchX, 
    //                             branchY, 
    //                             direction, 
    //                             settings, 
    //                             leafColors, 
    //                             mainBranchColor, 
    //                             smallBranchColor, 
    //                             smallSizeMultiplier, 
    //                             forExport, 
    //                             width, 
    //                             height, 
    //                             offsetX, 
    //                             offsetY
    //                         );
                            
    //                         // Animation pour les nouvelles branches
    //                         if (settings.animation && !forExport) {
    //                             const duration = (5 + Math.random() * 3) / settings.animationSpeed;
    //                             const delay = Math.random() * 2;
                                
    //                             smallBranchGroup.style("transform-origin", `${branchX}px ${branchY}px`);
    //                             smallBranchGroup.style("animation", `branchSway ${duration}s infinite alternate ease-in-out ${delay}s`);
    //                         }
    //                     }
                        
    //                     zonesAdded++;
    //                 }
    //             }
    //         }
    //     }

    //     console.log(`✅ Ajouté ${zonesAdded} zones de petites branches dans les zones vides`);
    //     return zonesAdded;
    // }


    // PASSE 3 AMÉLIORÉE - Détection et ajout dans les zones vides

    /**
     * Détecteur de densité amélioré avec logs détaillés
     */
    class ImprovedDensityChecker {
        constructor(width, height) {
            this.width = width;
            this.height = height;
        }

        // Compter TOUTES les feuilles dans un rayon donné avec logs détaillés
        countLeavesInRadius(centerX, centerY, radius, bgGroup, debug = false) {
            let count = 0;
            const elements = bgGroup.selectAll('.background-leaf').nodes();
            
            if (debug) {
                console.log(`🔍 Vérification zone (${centerX.toFixed(0)}, ${centerY.toFixed(0)}) rayon ${radius}px`);
                console.log(`📊 Total feuilles dans bgGroup: ${elements.length}`);
            }
            
            const foundLeaves = [];
            
            elements.forEach((leaf, index) => {
                const leafData = leaf.getAttribute('d');
                if (leafData) {
                    // Plusieurs patterns pour extraire les coordonnées selon le format du path
                    let match = leafData.match(/M\s*([\d.-]+)[,\s]+([\d.-]+)/);
                    if (!match) {
                        // Essayer d'autres formats
                        match = leafData.match(/M\s*([\d.-]+)\s+([\d.-]+)/);
                    }
                    
                    if (match) {
                        const leafX = parseFloat(match[1]);
                        const leafY = parseFloat(match[2]);
                        const distance = Math.sqrt((leafX - centerX) ** 2 + (leafY - centerY) ** 2);
                        
                        if (distance <= radius) {
                            count++;
                            if (debug && count <= 5) { // Montrer les 5 premières
                                foundLeaves.push({x: leafX, y: leafY, dist: distance.toFixed(1)});
                            }
                        }
                    }
                }
            });
            
            if (debug) {
                console.log(`✅ Feuilles trouvées: ${count}`);
                if (foundLeaves.length > 0) {
                    console.log(`📍 Exemples:`, foundLeaves);
                }
            }
            
            return count;
        }

        // Analyser TOUTE la grille pour voir la répartition
        analyzeFullGrid(bgGroup, cellSize = 100) {
            console.log(`🗺️  ANALYSE COMPLÈTE DE LA GRILLE (cellules de ${cellSize}px)`);
            
            const cols = Math.ceil(this.width / cellSize);
            const rows = Math.ceil(this.height / cellSize);
            
            const densityMap = [];
            
            for (let row = 0; row < rows; row++) {
                const rowData = [];
                for (let col = 0; col < cols; col++) {
                    const centerX = (col + 0.5) * cellSize;
                    const centerY = (row + 0.5) * cellSize;
                    
                    const count = this.countLeavesInRadius(centerX, centerY, cellSize * 0.7, bgGroup);
                    rowData.push(count);
                }
                densityMap.push(rowData);
            }
            
            // Afficher la carte de densité
            console.log("📊 CARTE DE DENSITÉ (nombre de feuilles par zone):");
            densityMap.forEach((row, rowIndex) => {
                const rowStr = row.map(count => {
                    if (count === 0) return "  .";
                    if (count < 5) return `  ${count}`;
                    if (count < 10) return ` ${count}`;
                    return `${count}`;
                }).join(" ");
                console.log(`Ligne ${rowIndex}: [${rowStr}]`);
            });
            
            return densityMap;
        }
    }

    /**
     * PASSE 3 AMÉLIORÉE : Ajout de petites branches dans les zones vides
     */
    function thirdPass(bgGroup, width, height, offsetX, offsetY, settings, leafColors, sizeMultiplier, forExport, drawCanopyBranchSystem) {
        console.log("🌱 PASSE 3 AMÉLIORÉE: Analyse détaillée et ajout dans les zones vides...");
        console.log(`📐 Dimensions: ${width}x${height}, offset: (${offsetX}, ${offsetY})`);
        
        const densityChecker = new ImprovedDensityChecker(width, height);
        
        // 1. ANALYSE GLOBALE FIRST
        const densityMap = densityChecker.analyzeFullGrid(bgGroup, 80);
        
        // 2. ZONES PRIORITAIRES - Se concentrer sur les bords et coins
        const priorityZones = [
            // Coins
            { name: "Coin haut-gauche", x: offsetX + width * 0.1, y: offsetY + height * 0.1, size: Math.min(width, height) * 0.25 },
            { name: "Coin haut-droite", x: offsetX + width * 0.9, y: offsetY + height * 0.1, size: Math.min(width, height) * 0.25 },
            { name: "Coin bas-gauche", x: offsetX + width * 0.1, y: offsetY + height * 0.9, size: Math.min(width, height) * 0.25 },
            { name: "Coin bas-droite", x: offsetX + width * 0.9, y: offsetY + height * 0.9, size: Math.min(width, height) * 0.25 },
            
            // Bords
            { name: "Bord gauche", x: offsetX + width * 0.05, y: offsetY + height * 0.5, size: Math.min(width, height) * 0.2 },
            { name: "Bord droit", x: offsetX + width * 0.95, y: offsetY + height * 0.5, size: Math.min(width, height) * 0.2 },
            { name: "Bord haut", x: offsetX + width * 0.5, y: offsetY + height * 0.05, size: Math.min(width, height) * 0.2 },
            { name: "Bord bas", x: offsetX + width * 0.5, y: offsetY + height * 0.95, size: Math.min(width, height) * 0.2 },
        ];

        let zonesAdded = 0;
        const mainBranchColor = {r: 89, g: 125, b: 65};
        const smallBranchColor = {r: 89, g: 125, b: 65};

        // 3. ANALYSER CHAQUE ZONE PRIORITAIRE
        priorityZones.forEach(zone => {
            console.log(`\n🎯 Test zone: ${zone.name}`);
            
            const leafCount = densityChecker.countLeavesInRadius(zone.x, zone.y, zone.size, bgGroup, true);
            
            // Seuil adapté à la taille de la zone
            const expectedLeaves = Math.floor((zone.size / 30) ** 2); // Densité attendue
            const threshold = Math.max(3, expectedLeaves * 0.3); // Au moins 30% de la densité attendue
            
            console.log(`📊 Feuilles: ${leafCount}, Seuil: ${threshold}, Attendu: ${expectedLeaves}`);
            
            if (leafCount < threshold) {
                console.log(`🟢 Zone vide détectée ! Ajout de branches...`);
                
                // Ajouter 1-2 branches dans cette zone
                const numberOfBranches = 1 + Math.floor(Math.random() * 2);
                
                for (let i = 0; i < numberOfBranches; i++) {
                    // Position dans la zone avec un peu de randomisation
                    const branchX = zone.x + (Math.random() - 0.5) * zone.size * 0.4;
                    const branchY = zone.y + (Math.random() - 0.5) * zone.size * 0.4;
                    
                    // S'assurer que c'est dans les limites
                    const finalX = Math.max(offsetX + 20, Math.min(offsetX + width - 20, branchX));
                    const finalY = Math.max(offsetY + 20, Math.min(offsetY + height - 20, branchY));
                    
                    const direction = Math.random() * Math.PI * 2;
                    
                    console.log(`  🌿 Ajout branche ${i+1} en (${finalX.toFixed(0)}, ${finalY.toFixed(0)})`);
                    
                    // Créer groupe pour cette branche
                    const smallBranchGroup = bgGroup.append("g")
                        .attr("class", "branch-system fill-branch-zone");
                    
                    // Utiliser la fonction existante avec une taille adaptée
                    const adaptedSizeMultiplier = sizeMultiplier * 0.8; // 80% de la taille normale
                    
                    drawCanopyBranchSystem(
                        smallBranchGroup, 
                        finalX, 
                        finalY, 
                        direction, 
                        settings, 
                        leafColors, 
                        mainBranchColor, 
                        smallBranchColor, 
                        adaptedSizeMultiplier, 
                        forExport, 
                        width, 
                        height, 
                        offsetX, 
                        offsetY
                    );
                    
                    // Animation
                    if (settings.animation && !forExport) {
                        const duration = (5 + Math.random() * 3) / settings.animationSpeed;
                        const delay = Math.random() * 2;
                        
                        smallBranchGroup.style("transform-origin", `${finalX}px ${finalY}px`);
                        smallBranchGroup.style("animation", `branchSway ${duration}s infinite alternate ease-in-out ${delay}s`);
                    }
                }
                
                zonesAdded++;
            } else {
                console.log(`🔴 Zone suffisamment fournie`);
            }
        });

        console.log(`\n✅ PASSE 3 terminée: ${zonesAdded} zones remplies sur ${priorityZones.length} testées`);
        return zonesAdded;
    }


    // Utiliser les dimensions personnalisées ou celles de l'écran
    const width = customDimensions ? customDimensions.width : window.innerWidth;
    const height = customDimensions ? customDimensions.height : window.innerHeight;
    const offsetX = customDimensions ? customDimensions.minX : 0;
    const offsetY = customDimensions ? customDimensions.minY : 0;

    // Calculer la densité adaptative pour l'export
    let densityMultiplier = 1;
    let sizeMultiplier = 1;

    if (forExport) {
        const baseArea = 1920 * 1080;
        const currentArea = width * height;
        const areaRatio = currentArea / baseArea;
        
        densityMultiplier = Math.sqrt(areaRatio) * 0.8;
        sizeMultiplier = Math.min(3, Math.max(1.5, areaRatio * 0.1));
        
        console.log(`📊 Export branches - Densité: x${densityMultiplier.toFixed(2)}, Taille: x${sizeMultiplier.toFixed(2)}`);
    }

    console.log(`🌿 Setup branches logiques: ${width}x${height} (offset: ${offsetX}, ${offsetY}) - Export: ${forExport}`);
    
    const defs = svg.append("defs");
    
    // Nettoyer tout fond existant
    svg.selectAll(".background-element").remove();
    
    // Créer un groupe pour le fond
    const bgGroup = svg.append("g")
        .attr("class", "background-element")
        .attr("pointer-events", "none")
        .lower();
    
    // Récupérer les paramètres
    const settings = {
        opacity: parseFloat(localStorage.getItem('backgroundOpacity') || 0.15),
        patternVisibility: parseFloat(localStorage.getItem('patternVisibility') || 1.0),
        animation: forExport ? false : localStorage.getItem('backgroundAnimation') === 'true',
        animationSpeed: parseFloat(localStorage.getItem('animationSpeed') || 1.0),
        customColor: localStorage.getItem('backgroundCustomColor') || '#3F51B5'
    };
    
    // Appliquer l'opacité globale
    bgGroup.style("opacity", settings.opacity);
    
    // Gradient de fond
    const gradientId = `branches-bg-gradient-${Date.now()}`;
    const bgGradient = defs.append("linearGradient")
        .attr("id", gradientId)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%");
    
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
        .attr("x", offsetX)
        .attr("y", offsetY)
        .attr("width", width)
        .attr("height", height)
        .attr("fill", `url(#${gradientId})`)
        .attr("pointer-events", "none")
        .lower();
    
    // Couleurs pour branches et feuilles
    const leafColors = [
        d3.rgb(50, 150, 50),   // Vert vif
        d3.rgb(70, 130, 40),   // Vert olive
        d3.rgb(100, 160, 60),  // Vert clair
        d3.rgb(30, 110, 30),   // Vert foncé
        d3.rgb(120, 180, 80)   // Vert-jaune
    ];
    
    // EFFET CANOPÉE AMÉLIORÉ - Couverture garantie du centre
    const nombreBranchesPrincipales = Math.ceil(24 * settings.patternVisibility * densityMultiplier);
    const nombreBranchesRemplissage = Math.ceil(12 * settings.patternVisibility * densityMultiplier);
    
    console.log(`🌿 Canopée améliorée: ${nombreBranchesPrincipales} principales + ${nombreBranchesRemplissage} remplissage`);
    
    // PARTIE 1 : BRANCHES PRINCIPALES - distribution déterministe
    const branchesParBord = Math.ceil(nombreBranchesPrincipales / 4);
    
    for (let bord = 0; bord < 4; bord++) {
        for (let i = 0; i < branchesParBord; i++) {
            let startX, startY, direction, minLength;
            
            // Position DÉTERMINISTE sur chaque bord
            const position = (i + 1) / (branchesParBord + 1); // Répartition équidistante
            const variation = 0.05; // Très petite variation pour naturel
            const pos = position + (Math.random() - 0.5) * variation;
            
            switch (bord) {
                case 0: // Bord gauche
                    startX = offsetX;
                    startY = offsetY + pos * height;
                    // Direction vers le centre-droit avec variation
                    direction = -Math.PI/4 + Math.PI/2 + (Math.random() - 0.5) * Math.PI/3;
                    minLength = width * 0.6; // Au moins 60% de largeur
                    break;
                case 1: // Bord haut  
                    startX = offsetX + pos * width;
                    startY = offsetY;
                    // Direction vers le centre-bas avec variation
                    direction = Math.PI/2 + (Math.random() - 0.5) * Math.PI/3;
                    minLength = height * 0.6; // Au moins 60% de hauteur
                    break;
                case 2: // Bord droit
                    startX = offsetX + width;
                    startY = offsetY + pos * height;
                    // Direction vers le centre-gauche avec variation
                    direction = Math.PI - Math.PI/4 + (Math.random() - 0.5) * Math.PI/3;
                    minLength = width * 0.6; // Au moins 60% de largeur
                    break;
                case 3: // Bord bas
                    startX = offsetX + pos * width;
                    startY = offsetY + height;
                    // Direction vers le centre-haut avec variation
                    direction = -Math.PI/2 + (Math.random() - 0.5) * Math.PI/3;
                    minLength = height * 0.6; // Au moins 60% de hauteur
                    break;
            }
            
            // Créer branche principale longue
            const branchGroup = bgGroup.append("g")
                .attr("class", "branch-system main-branch");
            
            drawLongCanopyBranch(branchGroup, startX, startY, direction, minLength, settings, leafColors, sizeMultiplier, forExport);
            
            // Animation
            if (settings.animation && !forExport) {
                const duration = (6 + Math.random() * 4) / settings.animationSpeed;
                const delay = Math.random() * 3;
                
                branchGroup.style("transform-origin", `${startX}px ${startY}px`);
                branchGroup.style("animation", `branchSway ${duration}s infinite alternate ease-in-out ${delay}s`);
            }
        }
    }
    
    // // PARTIE 2 : BRANCHES DE REMPLISSAGE POUR LE CENTRE
    // for (let i = 0; i < nombreBranchesRemplissage; i++) {
    //     // Positions dans la zone centrale (30-70% de l'image)
    //     const centerX = offsetX + width * (0.3 + Math.random() * 0.4);
    //     const centerY = offsetY + height * (0.3 + Math.random() * 0.4);
        
    //     // Direction aléatoire
    //     const direction = Math.random() * Math.PI * 2;
    //     const length = (100 + Math.random() * 200) * sizeMultiplier;
        
    //     // Créer branche de remplissage
    //     const fillBranchGroup = bgGroup.append("g")
    //         .attr("class", "branch-system fill-branch");
        
    //     drawCanopyBranchSystem(fillBranchGroup, centerX, centerY, direction, settings, leafColors, sizeMultiplier, forExport, width, height, offsetX, offsetY);
        
    //     // Animation
    //     if (settings.animation && !forExport) {
    //         const duration = (5 + Math.random() * 3) / settings.animationSpeed;
    //         const delay = Math.random() * 4;
            
    //         fillBranchGroup.style("transform-origin", `${centerX}px ${centerY}px`);
    //         fillBranchGroup.style("animation", `branchSway ${duration}s infinite alternate ease-in-out ${delay}s`);
    //     }
    // }





    // // PASSE 2 : Supprimer les zones trop denses
    // const branchesRemoved = secondPass(bgGroup, width, height);

    // PASSE 3 : Ajouter des petites branches dans les zones vides
    // const zonesAdded = thirdPass(bgGroup, width, height, offsetX, offsetY, settings, leafColors, sizeMultiplier, forExport, drawCanopyBranchSystem);

    // console.log(`🎯 Optimisation terminée: -${branchesRemoved} branches denses, +${zonesAdded} zones remplies`);



    
    // CSS animations
    if (!forExport && !document.getElementById('branch-animations-css')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'branch-animations-css';
        styleElement.textContent = `
            @keyframes branchSway {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(1deg); }
            }
            
            @keyframes leafSway {
                0% { transform: rotate(-3deg); }
                100% { transform: rotate(3deg); }
            }
        `;
        document.head.appendChild(styleElement);
    }

        console.log("Génération du setupTreeBranchesBackground terminée.");
}

// Fond avec feuilles tombantes adaptée pour l'export PNG grand format
async function setupFallingLeavesBackground(svg, customDimensions = null, forExport = false) {
    // Utiliser les dimensions personnalisées ou celles de l'écran
    const width = customDimensions ? customDimensions.width : window.innerWidth;
    const height = customDimensions ? customDimensions.height : window.innerHeight;
    const offsetX = customDimensions ? customDimensions.minX : 0;
    const offsetY = customDimensions ? customDimensions.minY : 0;
    
    const defs = svg.append("defs");
    
    // Calculer la densité adaptative pour l'export
    let densityMultiplier = 1;
    let sizeMultiplier = 1;

    if (forExport) {
        const baseArea = 1920 * 1080;
        const currentArea = width * height;
        const areaRatio = currentArea / baseArea;
        
        densityMultiplier = Math.sqrt(areaRatio) * 0.9;
        sizeMultiplier = Math.min(2.2, Math.max(1.1, areaRatio * 0.08));
        
        console.log(`📊 Export Falling Leaves - Densité: x${densityMultiplier.toFixed(2)}, Taille: x${sizeMultiplier.toFixed(2)}`);
    }
    
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
        animation: forExport ? false : localStorage.getItem('backgroundAnimation') === 'true',
        animationSpeed: parseFloat(localStorage.getItem('animationSpeed') || 1.0),
        customColor: localStorage.getItem('backgroundCustomColor') || '#3F51B5'
    };
    
    console.log(`🍃 Falling Leaves: ${width}x${height} (offset: ${offsetX}, ${offsetY}) - Export: ${forExport}`);
    
    // Appliquer l'opacité globale au groupe
    bgGroup.style("opacity", settings.opacity);
    
    // Fond de base avec gradient personnalisé AVEC OFFSET
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
    
    // Rectangle de fond AVEC OFFSET
    bgGroup.append("rect")
        .attr("x", offsetX)
        .attr("y", offsetY)
        .attr("width", width)
        .attr("height", height)
        .attr("fill", `url(#${gradientId})`)
        .attr("pointer-events", "none")
        .lower();
    
    // Fonction pour créer différentes formes de feuilles AVEC TAILLE ADAPTATIVE
    function createLeafPath(type, size) {
        const adaptedSize = size * sizeMultiplier;
        
        switch (type) {
            case 0: // Feuille simple arrondie
                return `M 0,0 
                        Q ${adaptedSize*0.5},${-adaptedSize*0.5} ${adaptedSize},0 
                        Q ${adaptedSize*0.5},${adaptedSize*0.5} 0,0`;
            case 1: // Feuille ovale
                return `M 0,0 
                        Q ${adaptedSize*0.4},${-adaptedSize*0.7} ${adaptedSize},0 
                        Q ${adaptedSize*0.4},${adaptedSize*0.7} 0,0`;
            case 2: // Feuille pointue
                return `M 0,0 
                        L ${adaptedSize*0.5},${-adaptedSize*0.6} 
                        L ${adaptedSize},0 
                        L ${adaptedSize*0.5},${adaptedSize*0.6} 
                        Z`;
            case 3: // Feuille de chêne simplifiée
                let path = `M 0,0 `;
                const numLobes = 4;
                for (let i = 0; i < numLobes; i++) {
                    const t = i / (numLobes - 1);
                    const x = adaptedSize * t;
                    const y1 = -adaptedSize * 0.3 * Math.sin(t * Math.PI);
                    
                    path += `Q ${x-adaptedSize*0.1},${y1*1.5} ${x},${y1} `;
                }
                
                path += `L ${adaptedSize},0 `;
                
                for (let i = numLobes - 1; i >= 0; i--) {
                    const t = i / (numLobes - 1);
                    const x = adaptedSize * t;
                    const y2 = adaptedSize * 0.3 * Math.sin(t * Math.PI);
                    
                    path += `Q ${x-adaptedSize*0.1},${y2*1.5} ${x},${y2} `;
                }
                
                path += "Z";
                return path;
            default:
                return `M 0,0 Q ${adaptedSize*0.5},${-adaptedSize*0.5} ${adaptedSize},0 Q ${adaptedSize*0.5},${adaptedSize*0.5} 0,0`;
        }
    }
    
    // Générer des couleurs de feuilles basées sur la couleur personnalisée
    function generateLeafColors() {
        const baseColor = d3.rgb(settings.customColor);
        
        // Favoriser les teintes vertes pour les feuilles
        const leafColors = [
            d3.rgb(50, 150, 50, 0.12),
            d3.rgb(70, 130, 40, 0.12),
            d3.rgb(100, 160, 60, 0.12),
            d3.rgb(30, 110, 30, 0.12),
            d3.rgb(120, 180, 80, 0.12)
        ];
        
        // Ajouter quelques feuilles dérivées de la couleur personnalisée
        leafColors.push(d3.rgb(baseColor).brighter(0.5).copy({opacity: 0.12}));
        leafColors.push(d3.rgb(baseColor).darker(0.3).copy({opacity: 0.12}));
        
        return leafColors;
    }
    
    const leafColors = generateLeafColors();
    
    // Dessiner les feuilles statiques AVEC DENSITÉ ET TAILLE ADAPTATIVES
    const baseStaticLeaves = Math.floor(width * height / 20000 * settings.patternVisibility);
    const numStaticLeaves = Math.floor(baseStaticLeaves * densityMultiplier);
    
    console.log(`🍂 ${numStaticLeaves} feuilles statiques`);
    
    for (let i = 0; i < numStaticLeaves; i++) {
        // Position AVEC OFFSET
        const x = offsetX + Math.random() * width;
        const y = offsetY + Math.random() * height;
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
            .attr("stroke-width", 0.5 * sizeMultiplier);
        
        // Ajouter une nervure centrale AVEC TAILLE ADAPTATIVE
        if (Math.random() < 0.7) {
            leafGroup.append("path")
                .attr("d", `M 0,0 L ${size * sizeMultiplier},0`)
                .attr("transform", `translate(${x},${y}) rotate(${rotation})`)
                .attr("fill", "transparent")
                .attr("stroke", `rgba(100, 90, 80, 0.15)`)
                .attr("stroke-width", 0.7 * sizeMultiplier);
        }
        
        // Animation légère (désactivée pour export)
        if (settings.animation) {
            const dur = (5 + Math.random() * 5) / settings.animationSpeed;
            const delay = Math.random() * 5;
            
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
    
    // Créer les feuilles tombantes (désactivées pour export)
    if (settings.animation) {
        const baseFallingLeaves = Math.floor(width * height / 25000 * settings.patternVisibility);
        const numFallingLeaves = Math.floor(baseFallingLeaves * densityMultiplier);
        
        console.log(`🍃 ${numFallingLeaves} feuilles tombantes`);
        
        for (let i = 0; i < numFallingLeaves; i++) {
            // Position AVEC OFFSET
            const x = offsetX + Math.random() * width;
            const y = offsetY - 100 - Math.random() * height;
            const size = (Math.random() * 30 + 10) * settings.patternVisibility;
            const rotation = Math.random() * 360;
            const leafType = Math.floor(Math.random() * 4);
            
            const leafColor = leafColors[Math.floor(Math.random() * leafColors.length)];
            
            // Créer le groupe de feuille
            const leafGroup = bgGroup.append("g")
                .attr("transform", `translate(${x},${y}) rotate(${rotation})`);
            
            // Dessiner la feuille AVEC TAILLE ADAPTATIVE
            leafGroup.append("path")
                .attr("d", createLeafPath(leafType, size))
                .attr("fill", leafColor.toString())
                .attr("stroke", `rgba(100, 100, 80, 0.1)`)
                .attr("stroke-width", 0.5 * sizeMultiplier);
            
            // Ajouter une nervure centrale AVEC TAILLE ADAPTATIVE
            if (Math.random() < 0.7) {
                leafGroup.append("path")
                    .attr("d", `M 0,0 L ${size * sizeMultiplier},0`)
                    .attr("fill", "transparent")
                    .attr("stroke", `rgba(100, 90, 80, 0.15)`)
                    .attr("stroke-width", 0.7 * sizeMultiplier);
            }
            
            // Paramètres de l'animation AVEC ADAPTATION
            const fallDuration = (10 + Math.random() * 15) / settings.animationSpeed;
            const delay = Math.random() * 15;
            
            // Distance de chute adaptée
            const fallDistance = height + 200 * sizeMultiplier;
            const swayAmount = (50 + Math.random() * 100) * sizeMultiplier;
            const swayDirection = Math.random() < 0.5 ? 1 : -1;
            
            // Points de contrôle pour le chemin de chute AVEC ADAPTATION
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
                .attr("fill", "transparent")
                .attr("stroke", "transparent");
            
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
    
    // Appliquer un léger flou AVEC ADAPTATION
    const filter = defs.append("filter")
        .attr("id", "leaves-blur")
        .attr("x", "-10%")
        .attr("y", "-10%")
        .attr("width", "120%")
        .attr("height", "120%");
    
    filter.append("feGaussianBlur")
        .attr("in", "SourceGraphic")
        .attr("stdDeviation", (0.3 / settings.patternVisibility) * sizeMultiplier);
    
    bgGroup.attr("filter", "url(#leaves-blur)");
    
    console.log("✅ Génération du fond feuilles tombantes terminée.");
}

// Fond avec arbre qui pousse dans le coin adaptée pour l'export PNG grand format
async function setupGrowingTreeBackground(svg, customDimensions = null, forExport = false) {
    // Utiliser les dimensions personnalisées ou celles de l'écran
    const width = customDimensions ? customDimensions.width : window.innerWidth;
    const height = customDimensions ? customDimensions.height : window.innerHeight;
    const offsetX = customDimensions ? customDimensions.minX : 0;
    const offsetY = customDimensions ? customDimensions.minY : 0;
    
    const defs = svg.append("defs");
    
    // Calculer la densité adaptative pour l'export - CORRECTION POUR FORMATS ALLONGÉS
    let densityMultiplier = 1;
    let sizeMultiplier = 1;

    if (forExport) {
        const baseArea = 1920 * 1080;
        const currentArea = width * height;
        const areaRatio = currentArea / baseArea;
        
        // Correction pour les formats très allongés
        const aspectRatio = Math.max(width / height, height / width);
        const aspectCorrection = Math.min(1.5, Math.max(0.7, 2 - aspectRatio * 0.3));
        
        densityMultiplier = Math.sqrt(areaRatio) * 0.85 * aspectCorrection;
        
        // Limiter sizeMultiplier pour éviter des éléments trop grands
        const maxDimension = Math.max(width, height);
        const baseDimension = Math.max(1920, 1080);
        const dimensionRatio = maxDimension / baseDimension;
        sizeMultiplier = Math.min(2, Math.max(1, Math.sqrt(dimensionRatio) * 0.8));
        
        console.log(`📊 Export Growing Tree - Format: ${width}x${height}`);
        console.log(`📊 Aspect: ${aspectRatio.toFixed(2)}, Correction: x${aspectCorrection.toFixed(2)}`);
        console.log(`📊 Densité: x${densityMultiplier.toFixed(2)}, Taille: x${sizeMultiplier.toFixed(2)}`);
    }
    
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
        animation: forExport ? false : localStorage.getItem('backgroundAnimation') === 'true',
        animationSpeed: parseFloat(localStorage.getItem('animationSpeed') || 1.0),
        customColor: localStorage.getItem('backgroundCustomColor') || '#3F51B5'
    };
    
    console.log(`🌳 Growing Tree: ${width}x${height} (offset: ${offsetX}, ${offsetY}) - Export: ${forExport}`);

    // PARAMÈTRES DE TUNING adaptés à l'export
    const patternDetail = settings.patternVisibility;
    
    function scaleWithDetail(min, max) {
        return min + (max - min) * patternDetail;
    }
    
    const TUNING = {
        // Nombre d'éléments adapté à la densité - AUGMENTÉ pour grands formats
        MAX_SVG_ELEMENTS: Math.round((400 + 800 * patternDetail) * densityMultiplier),
        
        // Profondeur de récursion adaptée - LIMITÉE pour éviter explosion
        MAX_ITERATIONS: Math.min(8, Math.round(scaleWithDetail(5, 7) * Math.min(densityMultiplier, 1.5))),
        MIN_ITERATIONS: Math.min(6, Math.round(scaleWithDetail(4, 5) * Math.min(densityMultiplier, 1.3))),
        
        // Probabilités de branches - AUGMENTÉES pour compenser
        CENTER_BRANCH_PROBABILITY: Math.min(0.5, scaleWithDetail(0.2, 0.45)),
        SIDE_BRANCH_PROBABILITY: Math.min(0.4, scaleWithDetail(0.15, 0.35)),
        
        // Seuils pour la génération - ASSOUPLIS
        MAIN_BRANCH_THRESHOLD: scaleWithDetail(0.6, 0.8),
        SIDE_BRANCH_THRESHOLD: scaleWithDetail(0.7, 0.85),
        
        // Probabilité de feuilles - AUGMENTÉE significativement
        LEAF_PROBABILITY: Math.min(0.7, scaleWithDetail(0.3, 0.6) * densityMultiplier),
        
        // Nombre d'arbres adapté à la densité - AUGMENTÉ
        MAX_MAIN_TREES: Math.max(2, Math.round(scaleWithDetail(2, 5) * densityMultiplier)),
        MAX_SECONDARY_TREES: Math.max(3, Math.round(scaleWithDetail(2, 6) * densityMultiplier)),
        MAX_SPROUTS: Math.max(4, Math.round(scaleWithDetail(3, 8) * densityMultiplier)),
        
        // Espacement adapté à la taille - CORRECTION pour formats allongés
        TREE_SPACING: Math.max(200, Math.round(scaleWithDetail(300, 200) * Math.min(sizeMultiplier, 1.5))),
        SPROUT_SPACING: Math.max(180, Math.round(scaleWithDetail(280, 180) * Math.min(sizeMultiplier, 1.5)))
    };
    
    console.log(`🎯 Paramètres: ${TUNING.MAX_SVG_ELEMENTS} éléments max, ${TUNING.MAX_MAIN_TREES} arbres principaux`);
        
    // Appliquer l'opacité globale au groupe
    bgGroup.style("opacity", settings.opacity);
    
    // Fond de base avec gradient subtil AVEC OFFSET
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
    
    // Rectangle de fond AVEC OFFSET
    bgGroup.append("rect")
        .attr("x", offsetX)
        .attr("y", offsetY)
        .attr("width", width)
        .attr("height", height)
        .attr("fill", `url(#${gradientId})`)
        .attr("pointer-events", "none")
        .lower();
    
    // Définir les couleurs pour les branches et les feuilles
    const branchBaseColor = d3.rgb(settings.customColor).darker(0.5);
    
    // Palette de couleurs vertes pour les feuilles
    const leafColors = [
        d3.rgb(50, 150, 50),
        d3.rgb(70, 130, 40),
        d3.rgb(100, 160, 60),
        d3.rgb(30, 110, 30)
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
    
    // Fonction pour dessiner un arbre AVEC OFFSET ET TAILLE ADAPTATIVE
    function drawTreeLocal(startX, startY, trunkLength, trunkWidth, parentGroup) {
        const lean = 0;
        
        // Adapter les positions avec offset
        const actualX = offsetX + startX;
        const actualY = offsetY + startY;
        
        // Adapter les tailles
        const adaptedTrunkLength = trunkLength * sizeMultiplier;
        const adaptedTrunkWidth = trunkWidth * sizeMultiplier;
        
        const treeGroup = parentGroup || bgGroup.append("g");
        
        const iterations = Math.min(TUNING.MAX_ITERATIONS, 
                                  TUNING.MIN_ITERATIONS + Math.floor(Math.random() * 2)); 
        
        // Fonction récursive pour dessiner les branches
        function branch(x, y, length, angle, width, depth, parent) {
            if (depth <= 0 || length < 2 * sizeMultiplier || width < 0.2 * sizeMultiplier) return;
            if (svgElementCount >= TUNING.MAX_SVG_ELEMENTS) return;
            
            // CORRECTION: Réduire la dépendance à patternVisibility pour les grands formats
            const visibilityThreshold = forExport ? Math.max(0.3, settings.patternVisibility * 0.7) : settings.patternVisibility;
            if (!parent && Math.random() > visibilityThreshold && depth < 4) return;
            
            // Calculer le point final avec adaptation de taille
            const lengthVariation = 1 + (Math.random() * 0.1 - 0.05);
            const angleVariation = (Math.random() * 0.05 - 0.025);
            const finalLength = length * lengthVariation;
            const finalAngle = angle + angleVariation;
            
            const endX = x + Math.cos(finalAngle) * finalLength;
            const endY = y + Math.sin(finalAngle) * finalLength;
            
            const branchGroup = parent || treeGroup.append("g");
            
            // Couleur avec variation naturelle
            const branchColor = naturalVariant(branchBaseColor, 30);
            branchColor.opacity = 0.1 + (depth * 0.02);
            
            // Dessiner la branche AVEC TAILLE ADAPTATIVE LIMITÉE
            const branchLine = branchGroup.append("line")
                .attr("x1", x)
                .attr("y1", y)
                .attr("x2", endX)
                .attr("y2", endY)
                .attr("stroke", branchColor.toString())
                .attr("stroke-width", Math.min(width * settings.patternVisibility, 15 * sizeMultiplier))
                .attr("stroke-linecap", "round");
            
            svgElementCount++;
            
            // Ajouter des feuilles AVEC TAILLE ADAPTATIVE - PROBABILITÉ AUGMENTÉE
            const leafProbability = forExport ? 
                Math.min(0.8, TUNING.LEAF_PROBABILITY * 1.5) : 
                TUNING.LEAF_PROBABILITY;
                
            if (Math.random() < leafProbability * settings.patternVisibility && depth < 4) {
                drawLeaf(branchGroup, endX, endY, length * 0.7, finalAngle, depth);
            }
            
            // Animation subtile pour les branches principales (désactivée pour export)
            if (settings.animation && !parent && depth > 3 && depth % 2 === 0) {
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
            
            // Paramètres pour les sous-branches AVEC ADAPTATION
            const newLength = length * (0.65 + Math.random() * 0.1);
            const newWidth = width * 0.7;
            
            const divergence = Math.PI / (6 + Math.random() * 4);
            
            // Récursion pour les branches enfants
            if (svgElementCount < TUNING.MAX_SVG_ELEMENTS * TUNING.MAIN_BRANCH_THRESHOLD) {
                branch(endX, endY, newLength, finalAngle + divergence, newWidth, depth - 1, branchGroup);
                branch(endX, endY, newLength * 0.8, finalAngle - divergence, newWidth * 0.8, depth - 1, branchGroup);
            }
            
            // Branche centrale pour continuité
            if (Math.random() < TUNING.CENTER_BRANCH_PROBABILITY && depth > 2 && 
                svgElementCount < TUNING.MAX_SVG_ELEMENTS * 0.9) {
                branch(endX, endY, newLength * 0.9, finalAngle, newWidth * 0.9, depth - 1, branchGroup);
            }
            
            // Branche latérale supplémentaire
            if (Math.random() < TUNING.SIDE_BRANCH_PROBABILITY * settings.patternVisibility && 
                depth > 2 && svgElementCount < TUNING.MAX_SVG_ELEMENTS * TUNING.SIDE_BRANCH_THRESHOLD) {
                const thirdAngle = finalAngle + (Math.random() < 0.5 ? 1 : -1) * divergence * 0.7;
                branch(endX, endY, newLength * 0.7, thirdAngle, newWidth * 0.7, depth - 2, branchGroup);
            }
        }
        
        // Fonction pour dessiner une feuille AVEC TAILLE ADAPTATIVE LIMITÉE
        function drawLeaf(parentGroup, x, y, size, angle, depth) {
            if (svgElementCount >= TUNING.MAX_SVG_ELEMENTS) return;
            
            const leafAngle = angle + (Math.random() - 0.5) * Math.PI / 3;
            // CORRECTION: Limiter la taille des feuilles pour les grands formats
            const baseLeafSize = size * (0.3 + Math.random() * 0.2) * settings.patternVisibility;
            const leafSize = Math.min(baseLeafSize * sizeMultiplier, 50); // Max 50px
            
            const leafColor = naturalVariant(leafColors[Math.floor(Math.random() * leafColors.length)], 30);
            leafColor.opacity = 0.12 + (Math.random() * 0.08);
            
            const strokeColor = d3.rgb(leafColor).darker(0.3);
            strokeColor.opacity = 0.1;
            
            const leafGroup = parentGroup.append("g");
            svgElementCount++;
            
            // Corps de la feuille AVEC TAILLE LIMITÉE
            const leaf = leafGroup.append("path")
                .attr("d", `M ${x} ${y} 
                      Q ${x + Math.cos(leafAngle) * leafSize * 0.5} ${y + Math.sin(leafAngle) * leafSize * 0.5}, 
                        ${x + Math.cos(leafAngle) * leafSize} ${y + Math.sin(leafAngle) * leafSize}
                      Q ${x + Math.cos(leafAngle + 0.5) * leafSize * 0.7} ${y + Math.sin(leafAngle + 0.5) * leafSize * 0.7},
                        ${x} ${y}`)
                .attr("fill", leafColor.toString())
                .attr("stroke", strokeColor.toString())
                .attr("stroke-width", Math.min(0.5 * sizeMultiplier, 2)); // Max 2px
            svgElementCount++;
            
            // Animation subtile (désactivée pour export)
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
        
        // Démarrer l'arbre avec le tronc
        branch(actualX, actualY, adaptedTrunkLength, -Math.PI/2 + lean, adaptedTrunkWidth, iterations);
        
        return treeGroup;
    }
    
    // Ajuster la densité des arbres
    const treeDensity = Math.max(0.5, settings.patternVisibility);
    
    // Déterminer le nombre d'arbres principaux AVEC ADAPTATION
    const maxMainTrees = Math.min(Math.floor(width / (400 * sizeMultiplier)) + 1, TUNING.MAX_MAIN_TREES);
    
    // Arbre principal au centre AVEC TAILLE ADAPTATIVE
    drawTreeLocal(width * 0.5, height * 0.95, height * 0.2 * treeDensity, 6 * treeDensity);
    
    // Arbres secondaires
    if (maxMainTrees > 1) {
        drawTreeLocal(width * 0.15, height * 0.93, height * 0.15 * treeDensity, 5 * treeDensity);
    }
    
    if (maxMainTrees > 2) {
        drawTreeLocal(width * 0.85, height * 0.93, height * 0.15 * treeDensity, 5 * treeDensity);
    }
    
    // Arbres plus petits répartis AVEC ESPACEMENT ADAPTATIF
    const numSmallerTrees = Math.min(Math.floor(width / TUNING.TREE_SPACING), TUNING.MAX_SECONDARY_TREES);
    if (svgElementCount < TUNING.MAX_SVG_ELEMENTS * 0.7) {
        for (let i = 0; i < numSmallerTrees; i++) {
            const x = 0.2 + (i+1) * (0.6 / (numSmallerTrees+1));
            drawTreeLocal(width * x, height * 0.93, height * 0.1 * treeDensity, 3 * treeDensity);
        }
    }
    
    // Petites pousses AVEC ESPACEMENT ADAPTATIF
    const numSprouts = Math.min(Math.floor(width / TUNING.SPROUT_SPACING), TUNING.MAX_SPROUTS);
    if (svgElementCount < TUNING.MAX_SVG_ELEMENTS * 0.9) {
        for (let i = 0; i < numSprouts; i++) {
            const x = Math.random() * width * 0.7 + width * 0.15;
            const y = Math.random() * height * 0.15 + height * 0.8;
            const size = height * (0.03 + Math.random() * 0.04) * treeDensity;
            
            drawTreeLocal(x, y, size, (1 + Math.random() * 1.5) * treeDensity);
        }
    }
    
    // Fleurs/plantes au sol AVEC TAILLE ADAPTATIVE
    if (settings.patternVisibility > 0.5 && svgElementCount < TUNING.MAX_SVG_ELEMENTS * 0.95) {
        const numFlowers = Math.min(Math.floor(width / (200 * sizeMultiplier)), 8);
        
        for (let i = 0; i < numFlowers; i++) {
            // Position AVEC OFFSET
            const x = offsetX + Math.random() * width;
            const y = offsetY + height - Math.random() * 20 * sizeMultiplier;
            const size = (5 + Math.random() * 15) * sizeMultiplier;
            
            const flowerGroup = bgGroup.append("g");
            svgElementCount++;
            
            // Tige AVEC TAILLE ADAPTATIVE
            flowerGroup.append("path")
                .attr("d", `M ${x} ${y} C ${x + 2 * sizeMultiplier} ${y - 10 * sizeMultiplier}, ${x - 2 * sizeMultiplier} ${y - 20 * sizeMultiplier}, ${x} ${y - 30 * treeDensity * sizeMultiplier}`)
                .attr("fill", "transparent")
                .attr("stroke", d3.rgb(30, 100, 30, 0.15).toString())
                .attr("stroke-width", 1 * treeDensity * sizeMultiplier);
            svgElementCount++;
            
            // Fleur/feuilles AVEC TAILLE ADAPTATIVE
            const petalColor = naturalVariant(leafColors[Math.floor(Math.random() * leafColors.length)], 30);
            petalColor.opacity = 0.12;
            
            for (let j = 0; j < 2; j++) {
                const angle = Math.PI/2 + (j * Math.PI) - Math.PI/4;
                flowerGroup.append("path")
                    .attr("d", `M ${x} ${y - 30 * treeDensity * sizeMultiplier} 
                               Q ${x + Math.cos(angle) * size * 0.7} ${(y - 30 * treeDensity * sizeMultiplier) + Math.sin(angle) * size * 0.7}, 
                                 ${x + Math.cos(angle) * size} ${(y - 30 * treeDensity * sizeMultiplier) + Math.sin(angle) * size}`)
                    .attr("fill", "transparent")
                    .attr("stroke", petalColor.toString())
                    .attr("stroke-width", 2 * treeDensity * sizeMultiplier);
                svgElementCount++;
            }
            
            // Animation subtile (désactivée pour export)
            if (settings.animation && i % 2 === 0) {
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
    
    // Appliquer un léger flou pour adoucir l'ensemble AVEC ADAPTATION
    const filter = defs.append("filter")
        .attr("id", "growing-tree-blur")
        .attr("x", "-10%")
        .attr("y", "-10%")
        .attr("width", "120%")
        .attr("height", "120%");
    
    filter.append("feGaussianBlur")
        .attr("in", "SourceGraphic")
        .attr("stdDeviation", (0.5 / treeDensity) * sizeMultiplier);
    
    bgGroup.attr("filter", "url(#growing-tree-blur)");
    
    console.log(`✅ Éléments SVG générés: ${svgElementCount} (max: ${TUNING.MAX_SVG_ELEMENTS})`);
}

// Fond avec motifs divers pour arbre généalogique adapté pour l'export PNG grand format
async function setupSimpleBackground(svg, customDimensions = null, forExport = false) {
    // Utiliser les dimensions personnalisées ou celles de l'écran
    const width = customDimensions ? customDimensions.width : window.innerWidth;
    const height = customDimensions ? customDimensions.height : window.innerHeight;
    const offsetX = customDimensions ? customDimensions.minX : 0;
    const offsetY = customDimensions ? customDimensions.minY : 0;
    
    // Calculer la densité adaptative pour l'export
    let densityMultiplier = 1;
    let sizeMultiplier = 1;

    if (forExport) {
        const baseArea = 1920 * 1080;
        const currentArea = width * height;
        const areaRatio = currentArea / baseArea;
        
        densityMultiplier = Math.sqrt(areaRatio) * 0.85;
        sizeMultiplier = Math.min(2.5, Math.max(1.1, areaRatio * 0.09));
        
        console.log(`📊 Export Simple Background - Densité: x${densityMultiplier.toFixed(2)}, Taille: x${sizeMultiplier.toFixed(2)}`);
    }
    
    // Récupérer TOUS les paramètres depuis le localStorage
    const settings = {
        opacity: parseFloat(localStorage.getItem('backgroundOpacity') || 0.15),
        patternVisibility: parseFloat(localStorage.getItem('patternVisibility') || 1.0),
        animation: forExport ? false : localStorage.getItem('backgroundAnimation') === 'true',
        animationSpeed: parseFloat(localStorage.getItem('animationSpeed') || 1.0),
        customColor: localStorage.getItem('backgroundCustomColor') || '#3F51B5'
    };
    
    console.log(`🎨 Simple Background: ${width}x${height} (offset: ${offsetX}, ${offsetY}) - Export: ${forExport}`);
    
    // Paramètres liés au niveau de détail
    const patternDetail = settings.patternVisibility;
    
    function scaleWithDetail(min, max) {
        return min + (max - min) * patternDetail;
    }
    
    // Paramètres adaptés à la densité d'export
    const TUNING = {
        // Nombre d'éléments décoratifs AVEC densité adaptative
        NUM_CIRCLES: Math.round(scaleWithDetail(3, 12) * densityMultiplier),
        NUM_LINES: Math.round(scaleWithDetail(5, 15) * densityMultiplier),
        
        // Taille des éléments AVEC taille adaptative
        CIRCLE_SIZE_MIN: scaleWithDetail(30, 50) * sizeMultiplier,
        CIRCLE_SIZE_MAX: scaleWithDetail(50, 100) * sizeMultiplier,
        
        // Opacité des éléments - déjà géré par le paramètre global d'opacité
        CIRCLE_OPACITY_MIN: 0.7,
        CIRCLE_OPACITY_MAX: 1.0,
        LINE_OPACITY_MIN: 0.6,
        LINE_OPACITY_MAX: 0.9,
        
        // Épaisseur des lignes AVEC taille adaptative
        LINE_WIDTH_MIN: scaleWithDetail(0.5, 1) * sizeMultiplier,
        LINE_WIDTH_MAX: scaleWithDetail(1, 1.5) * sizeMultiplier
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
    
    // Appliquer le dégradé comme fond AVEC OFFSET
    bgGroup.append("rect")
        .attr("x", offsetX)
        .attr("y", offsetY)
        .attr("width", width)
        .attr("height", height)
        .attr("fill", `url(#${gradientId})`)
        .attr("pointer-events", "none");
    
    // Ajouter des cercles décoratifs AVEC OFFSET ET TAILLE ADAPTATIVE
    const circles = [];
    
    console.log(`⭕ ${TUNING.NUM_CIRCLES} cercles décoratifs`);
    
    for (let i = 0; i < TUNING.NUM_CIRCLES; i++) {
        const x = offsetX + Math.random() * width;
        const y = offsetY + Math.random() * height;
        const size = TUNING.CIRCLE_SIZE_MIN + Math.random() * (TUNING.CIRCLE_SIZE_MAX - TUNING.CIRCLE_SIZE_MIN);
        const opacity = TUNING.CIRCLE_OPACITY_MIN + Math.random() * (TUNING.CIRCLE_OPACITY_MAX - TUNING.CIRCLE_OPACITY_MIN);
        
        const circle = bgGroup.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", size)
            .attr("fill", "none")
            .attr("stroke", baseColor.toString())
            .attr("stroke-width", 1.5 * sizeMultiplier)
            .attr("stroke-opacity", opacity);
        
        circles.push({ element: circle, x, y, size });
    }
    
    // Ajouter quelques lignes décoratives AVEC OFFSET ET TAILLE ADAPTATIVE
    const lines = [];
    
    console.log(`📏 ${TUNING.NUM_LINES} lignes décoratives`);
    
    for (let i = 0; i < TUNING.NUM_LINES; i++) {
        const x1 = offsetX + Math.random() * width;
        const y1 = offsetY + Math.random() * height;
        const x2 = x1 + (Math.random() - 0.5) * 200 * sizeMultiplier;
        const y2 = y1 + (Math.random() - 0.5) * 200 * sizeMultiplier;
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
    
    // Ajouter des animations si activées (désactivées pour export)
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
            const dx = (5 + Math.random() * 10) * settings.patternVisibility;
            const dy = (5 + Math.random() * 10) * settings.patternVisibility;
            
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
    
    console.log(`✅ Fond simple généré avec tous les paramètres:`);
    console.log(`- Niveau de détail: ${patternDetail.toFixed(2)}`);
    console.log(`- Opacité: ${settings.opacity.toFixed(2)}`);
    console.log(`- Animation: ${settings.animation ? 'activée' : 'désactivée'}`);
    console.log(`- Vitesse d'animation: ${settings.animationSpeed.toFixed(2)}`);
    console.log(`- Couleur personnalisée: ${settings.customColor} (Gradient ID: ${gradientId})`);
}

// Texture papier améliorée avec couleurs visibles
async function setupPaperTextureBackground(svg, customDimensions = null, forExport = false) {
    // Utiliser les dimensions personnalisées ou celles de l'écran
    const width = customDimensions ? customDimensions.width : window.innerWidth;
    const height = customDimensions ? customDimensions.height : window.innerHeight;
    const offsetX = customDimensions ? customDimensions.minX : 0;
    const offsetY = customDimensions ? customDimensions.minY : 0;
    
    const defs = svg.append("defs");
    
    // Calculer la densité adaptative pour l'export
    let densityMultiplier = 1;
    let sizeMultiplier = 1;
    let patternSizeMultiplier = 1;

    if (forExport) {
        const baseArea = 1920 * 1080;
        const currentArea = width * height;
        const areaRatio = currentArea / baseArea;
        
        densityMultiplier = Math.sqrt(areaRatio) * 0.8;
        sizeMultiplier = Math.min(3, Math.max(1.2, areaRatio * 0.1));
        patternSizeMultiplier = Math.min(2, Math.max(1, Math.sqrt(areaRatio) * 0.5));
        
        console.log(`📊 Export texture papier - Densité: x${densityMultiplier.toFixed(2)}, Taille: x${sizeMultiplier.toFixed(2)}, Pattern: x${patternSizeMultiplier.toFixed(2)}`);
    }
    
    // Récupérer tous les paramètres
    const opacity = parseFloat(localStorage.getItem('backgroundOpacity') || 0.15);
    const patternVisibility = parseFloat(localStorage.getItem('patternVisibility') || 1.0);
    const animation = forExport ? false : localStorage.getItem('backgroundAnimation') === 'true';
    const animationSpeed = parseFloat(localStorage.getItem('animationSpeed') || 1.0);
    const customColor = localStorage.getItem('backgroundCustomColor') || '#3F51B5';
    
    console.log(`🎨 Texture papier: ${width}x${height} (offset: ${offsetX}, ${offsetY}) - Export: ${forExport}`);
    
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
    
    // Fond de base avec gradient subtil - AVEC OFFSET
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
    
    // Rectangle de fond AVEC OFFSET
    bgGroup.append("rect")
        .attr("x", offsetX)
        .attr("y", offsetY)
        .attr("width", width)
        .attr("height", height)
        .attr("fill", `url(#${gradientId})`);
    
    // Créer un pattern pour la texture de bruit - TAILLE ADAPTATIVE
    const noisePatternId = `noise-pattern-${Date.now()}`;
    const patternSize = Math.floor(200 * patternSizeMultiplier);
    const noisePattern = defs.append("pattern")
        .attr("id", noisePatternId)
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", patternSize)
        .attr("height", patternSize);
    
    // Fond du motif
    noisePattern.append("rect")
        .attr("width", patternSize)
        .attr("height", patternSize)
        .attr("fill", "transparent");
    
    // Nombre de points basé sur le niveau de détail ET densité adaptative
    const numNoisePoints = Math.floor((2000 + 3000 * patternVisibility) * densityMultiplier);
    
    // Créer la texture de bruit AVEC TAILLE ADAPTATIVE
    for (let i = 0; i < numNoisePoints; i++) {
        const x = Math.random() * patternSize;
        const y = Math.random() * patternSize;
        const size = (Math.random() * 1.2 + 0.3) * sizeMultiplier;
        const opacity = Math.random() * 0.1 + 0.04;
        
        noisePattern.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", size)
            .attr("fill", i % 5 === 0 ? textureDarkColor.toString() : fiberColor.toString())
            .attr("opacity", opacity);
    }
    
    // Ajouter quelques lignes/fibres de papier AVEC TAILLE ADAPTATIVE
    const numFibers = Math.floor((20 + 50 * patternVisibility) * densityMultiplier);
    const fibers = [];
    
    for (let i = 0; i < numFibers; i++) {
        const x1 = Math.random() * patternSize;
        const y1 = Math.random() * patternSize;
        const length = (Math.random() * 30 + 10) * sizeMultiplier;
        const angle = Math.random() * Math.PI * 2;
        const x2 = x1 + Math.cos(angle) * length;
        const y2 = y1 + Math.sin(angle) * length;
        
        const fiber = noisePattern.append("line")
            .attr("x1", x1)
            .attr("y1", y1)
            .attr("x2", x2)
            .attr("y2", y2)
            .attr("stroke", fiberColor.toString())
            .attr("stroke-width", 0.7 * sizeMultiplier)
            .attr("opacity", 0.4);
        
        fibers.push({ element: fiber, x1, y1, x2, y2 });
    }
    
    // Appliquer le motif de texture AVEC OFFSET
    bgGroup.append("rect")
        .attr("x", offsetX)
        .attr("y", offsetY)
        .attr("width", width)
        .attr("height", height)
        .attr("fill", `url(#${noisePatternId})`)
        .attr("pointer-events", "none");
    
    // Ajouter quelques taches de papier plus grandes AVEC OFFSET ET TAILLE ADAPTATIVE
    const numStains = Math.floor((10 + 20 * patternVisibility) * densityMultiplier);
    const stains = [];
    
    for (let i = 0; i < numStains; i++) {
        const x = offsetX + Math.random() * width;
        const y = offsetY + Math.random() * height;
        const size = (Math.random() * 40 + 20) * sizeMultiplier;
        
        const stain = bgGroup.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", size)
            .attr("fill", paperBaseColor.brighter(0.1).toString())
            .attr("opacity", Math.random() * 0.2 + 0.1);
        
        stains.push({ element: stain, x, y, size });
    }
    
    // Ajouter une vignette légère AVEC OFFSET
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
        .attr("x", offsetX)
        .attr("y", offsetY)
        .attr("width", width)
        .attr("height", height)
        .attr("fill", `url(#${vignetteId})`)
        .attr("pointer-events", "none");
    
    // Ajouter des animations si activées (désactivées pour export)
    if (animation) {
        console.log("ANIMATIONS DE TEXTURE PAPIER ACTIVÉES");
        
        // Animation pour les taches
        stains.forEach((stain, i) => {
            if (i % 2 === 0) {
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
        if (patternVisibility > 0.5) {
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
    
    console.log("✅ Génération de la texture papier terminée.");
}

// Fond avec lignes courbes élégantes adaptée pour l'export PNG grand format
async function setupCurvedLinesBackground(svg, customDimensions = null, forExport = false) {
    // Utiliser les dimensions personnalisées ou celles de l'écran
    const width = customDimensions ? customDimensions.width : window.innerWidth;
    const height = customDimensions ? customDimensions.height : window.innerHeight;
    const offsetX = customDimensions ? customDimensions.minX : 0;
    const offsetY = customDimensions ? customDimensions.minY : 0;
    
    const defs = svg.append("defs");
    
    // Calculer la densité adaptative pour l'export
    let densityMultiplier = 1;
    let sizeMultiplier = 1;

    if (forExport) {
        const baseArea = 1920 * 1080;
        const currentArea = width * height;
        const areaRatio = currentArea / baseArea;
        
        densityMultiplier = Math.sqrt(areaRatio) * 0.85;
        sizeMultiplier = Math.min(2.5, Math.max(1.1, areaRatio * 0.09));
        
        console.log(`📊 Export Curved Lines - Densité: x${densityMultiplier.toFixed(2)}, Taille: x${sizeMultiplier.toFixed(2)}`);
    }
    
    // Récupérer tous les paramètres
    const opacity = parseFloat(localStorage.getItem('backgroundOpacity') || 0.15);
    const patternVisibility = parseFloat(localStorage.getItem('patternVisibility') || 1.0);
    const animation = forExport ? false : localStorage.getItem('backgroundAnimation') === 'true';
    const animationSpeed = parseFloat(localStorage.getItem('animationSpeed') || 1.0);
    const customColor = localStorage.getItem('backgroundCustomColor') || '#3F51B5';
    
    console.log(`🌊 Curved Lines: ${width}x${height} (offset: ${offsetX}, ${offsetY}) - Export: ${forExport}`);
    
    // Nettoyer tout fond existant
    svg.selectAll(".background-element").remove();
    
    // Créer un groupe pour le fond
    const bgGroup = svg.append("g")
        .attr("class", "background-element")
        .attr("pointer-events", "none")
        .style("opacity", opacity)
        .lower();
    
    // Fond de base avec gradient doux influencé par la couleur personnalisée AVEC OFFSET
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
    
    // Rectangle de fond AVEC OFFSET
    bgGroup.append("rect")
        .attr("x", offsetX)
        .attr("y", offsetY)
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
    
    // Nombre de courbes basé sur le niveau de détail ET la densité d'export
    const baseNumCurves = Math.max(4, Math.round(8 * patternVisibility));
    const numCurves = Math.floor(baseNumCurves * densityMultiplier);
    
    // Créer une courbe de Bézier complexe AVEC OFFSET ET TAILLE ADAPTATIVE
    function createComplexCurve(startX, startY, curveWidth, curveHeight, complexity) {
        const adaptedStartX = offsetX + startX;
        const adaptedStartY = offsetY + startY;
        const adaptedWidth = curveWidth * sizeMultiplier;
        const adaptedHeight = curveHeight * sizeMultiplier;
        
        let path = `M ${adaptedStartX} ${adaptedStartY}`;
        
        for (let i = 0; i < complexity; i++) {
            const cp1x = adaptedStartX + Math.random() * adaptedWidth;
            const cp1y = adaptedStartY + Math.random() * adaptedHeight;
            const cp2x = adaptedStartX + Math.random() * adaptedWidth;
            const cp2y = adaptedStartY + Math.random() * adaptedHeight;
            const x = adaptedStartX + (i + 1) * (adaptedWidth / complexity);
            const y = adaptedStartY + Math.random() * adaptedHeight;
            
            path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`;
        }
        
        return path;
    }
    
    // Créer des courbes élégantes traversant l'écran
    // Opacité et épaisseur basées sur le niveau de détail
    console.log(`🌊 ${numCurves} courbes horizontales`);
    
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
            strokeWidth: (1.5 + Math.random() * 2 * patternVisibility) * sizeMultiplier
        });
    }
    
    // Ajouter quelques courbes verticales pour créer une grille organique
    // Nombre basé sur le niveau de détail ET la densité d'export
    const baseNumVerticalCurves = Math.max(2, Math.round(numCurves / 2 * patternVisibility));
    const numVerticalCurves = Math.floor(baseNumVerticalCurves * densityMultiplier);
    
    console.log(`📏 ${numVerticalCurves} courbes verticales`);
    
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
        
        // Créer la courbe verticale AVEC OFFSET ET TAILLE ADAPTATIVE
        const adaptedStartX = offsetX + startX;
        const adaptedWidth = curveWidth * sizeMultiplier;
        
        let verticalPath = `M ${adaptedStartX} ${offsetY}`;
        
        for (let j = 0; j < complexity; j++) {
            const cp1x = adaptedStartX + Math.random() * adaptedWidth;
            const cp1y = offsetY + (j + 0.5) * (height / complexity);
            const cp2x = adaptedStartX + Math.random() * adaptedWidth;
            const cp2y = offsetY + (j + 0.5) * (height / complexity);
            const x = adaptedStartX + Math.random() * adaptedWidth;
            const y = offsetY + (j + 1) * (height / complexity);
            
            verticalPath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`;
        }
        
        curves.push({
            path: verticalPath,
            color: `rgba(${Math.round(curveColor.r)}, ${Math.round(curveColor.g)}, ${Math.round(curveColor.b)}, ${0.1 + 0.05 * patternVisibility})`,
            strokeWidth: (1.5 + Math.random() * 1.5 * patternVisibility) * sizeMultiplier
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
    // Nombre basé sur le niveau de détail ET la densité d'export
    const baseNumCircles = Math.max(20, Math.round(40 * patternVisibility));
    const numCircles = Math.floor(baseNumCircles * densityMultiplier);
    const circleElements = [];
    
    console.log(`⭕ ${numCircles} cercles décoratifs`);
    
    for (let i = 0; i < numCircles; i++) {
        const x = offsetX + Math.random() * width;
        const y = offsetY + Math.random() * height;
        const size = (Math.random() * 4 + 2 + 2 * patternVisibility) * sizeMultiplier;
        
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
    
    // Ajouter des animations si activées (désactivées pour export)
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
    
    console.log("✅ Génération du fond lignes courbes terminée.");
}

// Fond avec motif inspiré des anneaux des arbres adaptée pour l'export PNG grand format
async function setupTreeRingsBackground(svg, customDimensions = null, forExport = false) {
    // Utiliser les dimensions personnalisées ou celles de l'écran
    const width = customDimensions ? customDimensions.width : window.innerWidth;
    const height = customDimensions ? customDimensions.height : window.innerHeight;
    const offsetX = customDimensions ? customDimensions.minX : 0;
    const offsetY = customDimensions ? customDimensions.minY : 0;
    
    const defs = svg.append("defs");
    
    // Calculer la densité adaptative pour l'export
    let densityMultiplier = 1;
    let sizeMultiplier = 1;

    if (forExport) {
        const baseArea = 1920 * 1080;
        const currentArea = width * height;
        const areaRatio = currentArea / baseArea;
        
        densityMultiplier = Math.sqrt(areaRatio) * 0.9;
        sizeMultiplier = Math.min(2.2, Math.max(1.1, areaRatio * 0.09));
        
        console.log(`📊 Export Tree Rings - Densité: x${densityMultiplier.toFixed(2)}, Taille: x${sizeMultiplier.toFixed(2)}`);
    }
    
    // Récupérer tous les paramètres
    const opacity = parseFloat(localStorage.getItem('backgroundOpacity') || 0.15);
    const patternVisibility = parseFloat(localStorage.getItem('patternVisibility') || 1.0);
    const animation = forExport ? false : localStorage.getItem('backgroundAnimation') === 'true';
    const animationSpeed = parseFloat(localStorage.getItem('animationSpeed') || 1.0);
    const customColor = localStorage.getItem('backgroundCustomColor') || '#3F51B5';
    
    console.log(`🌳 Tree Rings: ${width}x${height} (offset: ${offsetX}, ${offsetY}) - Export: ${forExport}`);
    
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
    
    // Fond de base avec offset
    bgGroup.append("rect")
        .attr("x", offsetX)
        .attr("y", offsetY)
        .attr("width", width)
        .attr("height", height)
        .attr("fill", bgColor.toString());
    
    // Nombre de centres d'anneaux basé sur le niveau de détail ET la densité
    const numCenters = Math.floor((2 + patternVisibility * 3) * densityMultiplier);
    
    console.log(`🎯 ${numCenters} centres d'anneaux`);
    
    // Créer plusieurs centres d'anneaux AVEC OFFSET ET TAILLE ADAPTATIVE
    const centers = [];
    
    // Centres de base repositionnés avec offset
    centers.push({ 
        x: offsetX - width * 0.2, 
        y: offsetY + height * 0.7, 
        maxRadius: width * 0.8 * sizeMultiplier, 
        color: ringColor,
        element: null
    });
    
    centers.push({ 
        x: offsetX + width * 1.1, 
        y: offsetY + height * 0.4, 
        maxRadius: width * 0.6 * sizeMultiplier, 
        color: d3.rgb(ringColor).darker(0.1),
        element: null
    });
    
    centers.push({ 
        x: offsetX + width * 0.4, 
        y: offsetY - height * 0.2, 
        maxRadius: width * 0.7 * sizeMultiplier, 
        color: d3.rgb(ringColor).brighter(0.1),
        element: null
    });
    
    // Centres supplémentaires avec offset
    if (numCenters > 3) {
        centers.push({ 
            x: offsetX + width * 1.2, 
            y: offsetY + height * 1.1, 
            maxRadius: width * 0.7 * sizeMultiplier, 
            color: d3.rgb(ringColor).darker(0.2),
            element: null
        });
    }
    
    if (numCenters > 4) {
        centers.push({ 
            x: offsetX - width * 0.1, 
            y: offsetY - height * 0.3, 
            maxRadius: width * 0.9 * sizeMultiplier, 
            color: d3.rgb(ringColor).brighter(0.2),
            element: null
        });
    }
    
    // Centres additionnels pour grands formats
    if (numCenters > 5) {
        centers.push({ 
            x: offsetX + width * 0.8, 
            y: offsetY + height * 1.3, 
            maxRadius: width * 0.6 * sizeMultiplier, 
            color: d3.rgb(ringColor).darker(0.15),
            element: null
        });
    }
    
    if (numCenters > 6) {
        centers.push({ 
            x: offsetX - width * 0.3, 
            y: offsetY + height * 0.1, 
            maxRadius: width * 0.8 * sizeMultiplier, 
            color: d3.rgb(ringColor).brighter(0.15),
            element: null
        });
    }
    
    // Limiter aux centres demandés
    centers.splice(numCenters);
    
    // Créer des groupes pour chaque centre d'anneaux
    const centerGroups = centers.map((center, index) => {
        const group = bgGroup.append("g")
            .attr("class", `tree-ring-center-${index}`);
        center.element = group;
        return group;
    });
    
    // Générer les anneaux pour chaque centre
    centers.forEach((center, centerIndex) => {
        // Nombre d'anneaux adapté à la densité et à la taille
        const baseNumRings = Math.floor(30 + Math.random() * 20 + patternVisibility * 40);
        const numRings = Math.floor(baseNumRings * densityMultiplier);
        
        console.log(`🌊 Centre ${centerIndex}: ${numRings} anneaux`);
        
        // Grouper les anneaux pour les animations
        const ringsGroup = center.element;
        
        // Variation aléatoire de l'épaisseur et des espaces AVEC TAILLE ADAPTATIVE
        let currentRadius = 10 * sizeMultiplier;
        const rings = [];
        
        for (let i = 0; i < numRings; i++) {
            // Épaisseur et espace influencés par le niveau de détail ET la taille
            const ringWidth = (Math.random() * 3 * patternVisibility + 0.8) * sizeMultiplier;
            const gapWidth = (Math.random() * 2 * patternVisibility + 0.5) * sizeMultiplier;
            
            if (currentRadius > center.maxRadius) break;
            
            // Opacité variée pour plus de naturel
            const ringOpacity = 0.15 + (Math.random() * 0.15 * patternVisibility);
            
            const ring = ringsGroup.append("circle")
                .attr("cx", center.x)
                .attr("cy", center.y)
                .attr("r", currentRadius)
                .attr("fill", "transparent")
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
        
        // Ajouter des lignes radiales pour simuler les fissures AVEC TAILLE ADAPTATIVE
        const baseNumLines = Math.floor(Math.random() * 5 + 3 + patternVisibility * 7);
        const numLines = Math.floor(baseNumLines * densityMultiplier);
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
                .attr("stroke-width", (Math.random() * 2 * patternVisibility + 0.5) * sizeMultiplier)
                .attr("stroke-opacity", 0.25);
            
            radialLines.push({
                element: line,
                angle: angle
            });
        }
        
        // Ajouter des animations si activées (désactivées pour export)
        if (animation) {
            console.log(`🎬 Animation centre ${centerIndex}`);
            
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
    
    console.log("✅ Génération du fond anneaux d'arbre terminée.");
}

// Fonction fractal améliorée avec tous les paramètres utilisateur
// function setupFractalBackground(svg) {
//     const width = window.innerWidth;
//     const height = window.innerHeight;
//     const defs = svg.append("defs");
    
//     // Récupérer tous les paramètres
//     const opacity = parseFloat(localStorage.getItem('backgroundOpacity') || 0.15);
//     const patternVisibility = parseFloat(localStorage.getItem('patternVisibility') || 1.0);
//     const animation = localStorage.getItem('backgroundAnimation') === 'true';
//     const animationSpeed = parseFloat(localStorage.getItem('animationSpeed') || 1.0);
//     const customColor = localStorage.getItem('backgroundCustomColor') || '#3F51B5';
    
//     console.log("PARAMÈTRES FOND FRACTAL:", {
//         opacity,
//         patternVisibility,
//         animation: animation ? "ACTIVÉ" : "DÉSACTIVÉ",
//         animationSpeed,
//         customColor
//     });
    
//     // Nettoyer tout fond existant
//     svg.selectAll(".background-element").remove();
    
//     // Créer un groupe pour le fond
//     const bgGroup = svg.append("g")
//         .attr("class", "background-element")
//         .attr("pointer-events", "none")
//         .style("opacity", opacity)
//         .lower();
    
//     // Fond de base avec gradient très léger
//     const gradientId = `fractal-bg-gradient-${Date.now()}`;
//     const bgGradient = defs.append("linearGradient")
//         .attr("id", gradientId)
//         .attr("x1", "0%")
//         .attr("y1", "0%")
//         .attr("x2", "100%")
//         .attr("y2", "100%");
    
//     // Teinte légère basée sur la couleur personnalisée
//     const baseColor = d3.rgb(customColor);
    
//     // Fond très clair basé sur la couleur personnalisée
//     const bgColorLight = d3.rgb(
//         Math.min(255, baseColor.r * 0.1 + 240),
//         Math.min(255, baseColor.g * 0.1 + 240),
//         Math.min(255, baseColor.b * 0.1 + 240)
//     );
    
//     const bgColorDark = d3.rgb(
//         Math.min(255, baseColor.r * 0.1 + 235),
//         Math.min(255, baseColor.g * 0.1 + 235),
//         Math.min(255, baseColor.b * 0.1 + 235)
//     );
    
//     bgGradient.append("stop")
//         .attr("offset", "0%")
//         .attr("stop-color", bgColorLight.toString());
    
//     bgGradient.append("stop")
//         .attr("offset", "100%")
//         .attr("stop-color", bgColorDark.toString());
    
//     bgGroup.append("rect")
//         .attr("width", width)
//         .attr("height", height)
//         .attr("fill", `url(#${gradientId})`);
    
//     // Palette de couleurs basée sur la couleur personnalisée
//     const colorPalette = [
//         d3.rgb(baseColor.r * 0.4 + 60, baseColor.g * 0.4 + 60, baseColor.b * 0.8 + 40),   // Teinte principale 1
//         d3.rgb(baseColor.r * 0.3 + 40, baseColor.g * 0.5 + 80, baseColor.b * 0.4 + 60),   // Teinte principale 2
//         d3.rgb(baseColor.r * 0.6 + 40, baseColor.g * 0.3 + 40, baseColor.b * 0.5 + 50)    // Teinte principale 3
//     ];
    
//     // Fonction pour dessiner un arbre fractal coloré
//     function drawFractalTree(x, y, size, angle, depth, colorIndex) {
//         if (depth === 0 || size < 2) return;
        
//         // Choisir la couleur avec une opacité basée sur la profondeur
//         let opacity = 0.25 - (depth * 0.025);
//         if (opacity < 0.07) opacity = 0.07;
        
//         const colorIdx = (colorIndex + depth) % colorPalette.length;
//         const strokeColor = colorPalette[colorIdx].toString();
        
//         // Calculer la nouvelle position
//         const newX = x + Math.cos(angle) * size * (0.95 + Math.random() * 0.1);
//         const newY = y + Math.sin(angle) * size * (0.95 + Math.random() * 0.1);
        
//         // Dessiner une ligne
//         const line = bgGroup.append("line")
//             .attr("x1", x)
//             .attr("y1", y)
//             .attr("x2", newX)
//             .attr("y2", newY)
//             .attr("stroke", strokeColor)
//             .attr("stroke-opacity", opacity)
//             .attr("stroke-width", Math.max(1.2, depth * 0.8 * patternVisibility)); // Ajustement de la largeur selon le détail
        
//         // Angle de branchement ajusté par le niveau de détail
//         // Plus de détail = branches plus écartées
//         const splitAngle = Math.PI * (0.18 + patternVisibility * 0.05);
        
//         // Récursion avec des branches plus naturelles
//         const nextSize = size * (0.65 + Math.random() * 0.15);
        
//         // Animation de "croissance" si activée
//         if (animation) {
//             const growAnim = document.createElementNS("http://www.w3.org/2000/svg", "animate");
//             growAnim.setAttribute("attributeName", "stroke-dashoffset");
//             const length = Math.sqrt(Math.pow(newX - x, 2) + Math.pow(newY - y, 2));
            
//             // Configurer le dash pour l'animation
//             line.attr("stroke-dasharray", length);
//             line.attr("stroke-dashoffset", length);
            
//             growAnim.setAttribute("from", length);
//             growAnim.setAttribute("to", 0);
//             growAnim.setAttribute("dur", `${Math.max(0.5, depth * 0.5) / animationSpeed}s`);
//             growAnim.setAttribute("fill", "freeze");
            
//             // Retard proportionnel à la profondeur pour l'effet de croissance
//             const delay = (6 - depth) * (0.5 / animationSpeed);
//             growAnim.setAttribute("begin", `${delay}s`);
            
//             line.node().appendChild(growAnim);
//         }
        
//         // Gauche
//         drawFractalTree(
//             newX, 
//             newY, 
//             nextSize * (0.9 + Math.random() * 0.2), 
//             angle - splitAngle + (Math.random() * 0.1 - 0.05), 
//             depth - 1,
//             colorIndex
//         );
        
//         // Droite
//         drawFractalTree(
//             newX, 
//             newY, 
//             nextSize * (0.9 + Math.random() * 0.2), 
//             angle + splitAngle + (Math.random() * 0.1 - 0.05), 
//             depth - 1,
//             colorIndex
//         );
        
//         // Parfois ajouter une branche centrale pour plus de densité
//         // Probabilité ajustée selon le niveau de détail
//         if (Math.random() < 0.4 * patternVisibility && depth > 3) {
//             const centerAngle = angle + (Math.random() * 0.3 - 0.15);
//             drawFractalTree(
//                 newX, 
//                 newY, 
//                 nextSize * 0.8, 
//                 centerAngle, 
//                 depth - 2,
//                 colorIndex
//             );
//         }
        
//         // Ajouter des "feuilles" ou terminaisons décoratives aux extrémités
//         if (depth === 1 && Math.random() < 0.5 * patternVisibility) {
//             // Couleur plus vive pour les feuilles
//             const leafColor = colorPalette[(colorIndex + 1) % colorPalette.length].toString();
            
//             // Petit cercle décoratif au bout des branches
//             bgGroup.append("circle")
//                 .attr("cx", newX)
//                 .attr("cy", newY)
//                 .attr("r", 1.5 + Math.random() * patternVisibility)
//                 .attr("fill", leafColor)
//                 .attr("fill-opacity", opacity * 1.3);
//         }
//     }
    
//     // Ajuster les paramètres en fonction du niveau de détail
//     // Profondeur et nombre d'arbres
//     const maxDepth = 4 + Math.round(patternVisibility * 2); // 4-6 selon le niveau de détail
    
//     // 1. Arbres en bas
//     const numTreesBottom = Math.max(2, Math.floor(width / 250) + Math.floor(patternVisibility * 3));
//     const baseSize = 100 + 40 * patternVisibility;
    
//     for (let i = 0; i < numTreesBottom; i++) {
//         // Position X répartie en bas de l'écran
//         const startX = width * (i + 0.5) / numTreesBottom + (Math.random() * 40 - 20);
//         const startY = height * 0.98 - (Math.random() * height * 0.05);
        
//         // Profondeur variable pour un effet plus naturel
//         const treeDepth = maxDepth - Math.floor(Math.random() * 2);
        
//         // Légère variation d'angle - toujours vers le haut
//         const baseAngle = -Math.PI/2 + (Math.random() * 0.12 - 0.06);
        
//         // Palette de couleur aléatoire
//         const colorIndex = Math.floor(Math.random() * colorPalette.length);
        
//         // Taille variable
//         const treeSize = baseSize * (0.8 + Math.random() * 0.4);
        
//         drawFractalTree(startX, startY, treeSize, baseAngle, treeDepth, colorIndex);
//     }
    
//     // 2. Arbres sur les côtés - nombre ajusté par le niveau de détail
//     const numSideTrees = Math.max(1, Math.floor(height / 300) + Math.floor(patternVisibility * 2));
    
//     // Côté gauche - orientation vers la droite
//     if (patternVisibility > 0.3) { // Ne dessiner ces arbres que si le niveau de détail est suffisant
//         for (let i = 0; i < numSideTrees; i++) {
//             const startX = width * 0.02 + (Math.random() * width * 0.03);
//             const startY = height * (i + 1) / (numSideTrees + 1) + (Math.random() * 50 - 25);
            
//             const treeDepth = maxDepth - 1 - Math.floor(Math.random() * 1);
//             const baseAngle = 0 + (Math.random() * 0.4 - 0.2);
//             const colorIndex = Math.floor(Math.random() * colorPalette.length);
//             const treeSize = baseSize * (0.6 + Math.random() * 0.3);
            
//             drawFractalTree(startX, startY, treeSize, baseAngle, treeDepth, colorIndex);
//         }
//     }
    
//     // Côté droit - orientation vers la gauche
//     if (patternVisibility > 0.3) { // Ne dessiner ces arbres que si le niveau de détail est suffisant
//         for (let i = 0; i < numSideTrees; i++) {
//             const startX = width * 0.98 - (Math.random() * width * 0.03);
//             const startY = height * (i + 0.5) / (numSideTrees + 1) + (Math.random() * 50 - 25);
            
//             const treeDepth = maxDepth - 1 - Math.floor(Math.random() * 1);
//             const baseAngle = Math.PI + (Math.random() * 0.4 - 0.2);
//             const colorIndex = Math.floor(Math.random() * colorPalette.length);
//             const treeSize = baseSize * (0.6 + Math.random() * 0.3);
            
//             drawFractalTree(startX, startY, treeSize, baseAngle, treeDepth, colorIndex);
//         }
//     }
    
//     // 3. Arbres éparpillés dans le fond - densité ajustée par le niveau de détail
//     const numBackgroundTrees = Math.max(2, Math.floor((width * height) / 200000) + Math.floor(patternVisibility * 4));
    
//     if (patternVisibility > 0.5) { // Ne dessiner ces arbres que si le niveau de détail est élevé
//         for (let i = 0; i < numBackgroundTrees; i++) {
//             // Position aléatoire, distribution plus équilibrée
//             const startX = width * 0.15 + Math.random() * width * 0.7;
//             const startY = height * 0.1 + Math.random() * height * 0.6;
            
//             const treeDepth = maxDepth - 2; // Profondeur réduite pour le fond
//             const baseAngle = Math.random() * Math.PI * 2;
//             const colorIndex = Math.floor(Math.random() * colorPalette.length);
//             const treeSize = baseSize * (0.35 + Math.random() * 0.25);
            
//             drawFractalTree(startX, startY, treeSize, baseAngle, treeDepth, colorIndex);
//         }
//     }
    
//     console.log("Génération du fond fractal terminée.");
// }

// Fonction fractal adaptée pour l'export PNG avec fond coloré amélioré
async function setupFractalBackground(svg, customDimensions = null, forExport = false) {
    // Utiliser les dimensions personnalisées ou celles de l'écran
    const width = customDimensions ? customDimensions.width : window.innerWidth;
    const height = customDimensions ? customDimensions.height : window.innerHeight;
    const offsetX = customDimensions ? customDimensions.minX : 0;
    const offsetY = customDimensions ? customDimensions.minY : 0;
    
    const defs = svg.append("defs");
    
    // Calculer la densité adaptative pour l'export
    let densityMultiplier = 1;
    let sizeMultiplier = 1;

    if (forExport) {
        const baseArea = 1920 * 1080;
        const currentArea = width * height;
        const areaRatio = currentArea / baseArea;
        
        densityMultiplier = Math.sqrt(areaRatio) * 0.9;
        sizeMultiplier = Math.min(2.5, Math.max(1.3, areaRatio * 0.12));
        
        console.log(`📊 Export fractals - Densité: x${densityMultiplier.toFixed(2)}, Taille: x${sizeMultiplier.toFixed(2)}`);
    }
    
    // Récupérer tous les paramètres
    const opacity = parseFloat(localStorage.getItem('backgroundOpacity') || 0.15);
    const patternVisibility = parseFloat(localStorage.getItem('patternVisibility') || 1.0);
    const animation = forExport ? false : localStorage.getItem('backgroundAnimation') === 'true';
    const animationSpeed = parseFloat(localStorage.getItem('animationSpeed') || 1.0);
    const customColor = localStorage.getItem('backgroundCustomColor') || '#3F51B5';
    
    console.log(`🌿 Fractals: ${width}x${height} (offset: ${offsetX}, ${offsetY}) - Export: ${forExport}`);
    
    // Nettoyer tout fond existant
    svg.selectAll(".background-element").remove();
    
    // Créer un groupe pour le fond
    const bgGroup = svg.append("g")
        .attr("class", "background-element")
        .attr("pointer-events", "none")
        .style("opacity", opacity)
        .lower();
    
    // FOND COLORÉ AMÉLIORÉ - Influence plus forte de la couleur personnalisée
    const gradientId = `fractal-bg-gradient-${Date.now()}`;
    const bgGradient = defs.append("linearGradient")
        .attr("id", gradientId)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%");
    
    // Teinte BEAUCOUP plus prononcée basée sur la couleur personnalisée
    const baseColor = d3.rgb(customColor);
    
    // Fond avec influence de 30% de la couleur personnalisée (au lieu de 10%)
    const bgColorLight = d3.rgb(
        Math.min(255, baseColor.r * 0.3 + 200),
        Math.min(255, baseColor.g * 0.3 + 200),
        Math.min(255, baseColor.b * 0.3 + 200)
    );
    
    const bgColorDark = d3.rgb(
        Math.min(255, baseColor.r * 0.4 + 180),
        Math.min(255, baseColor.g * 0.4 + 180),
        Math.min(255, baseColor.b * 0.4 + 180)
    );
    
    // Ajouter une couleur intermédiaire pour plus de richesse
    const bgColorMid = d3.rgb(
        Math.min(255, baseColor.r * 0.35 + 190),
        Math.min(255, baseColor.g * 0.35 + 190),
        Math.min(255, baseColor.b * 0.35 + 190)
    );
    
    bgGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", bgColorLight.toString());
    
    bgGradient.append("stop")
        .attr("offset", "50%")
        .attr("stop-color", bgColorMid.toString());
    
    bgGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", bgColorDark.toString());
    
    // Rectangle de fond AVEC OFFSET
    bgGroup.append("rect")
        .attr("x", offsetX)
        .attr("y", offsetY)
        .attr("width", width)
        .attr("height", height)
        .attr("fill", `url(#${gradientId})`);
    
    // Palette de couleurs basée sur la couleur personnalisée - Plus contrastée
    const colorPalette = [
        d3.rgb(baseColor.r * 0.7 + 60, baseColor.g * 0.7 + 60, baseColor.b * 0.9 + 40),   // Teinte principale 1
        d3.rgb(baseColor.r * 0.6 + 40, baseColor.g * 0.8 + 80, baseColor.b * 0.7 + 60),   // Teinte principale 2
        d3.rgb(baseColor.r * 0.9 + 40, baseColor.g * 0.6 + 40, baseColor.b * 0.8 + 50),   // Teinte principale 3
        d3.rgb(baseColor.r * 0.5 + 80, baseColor.g * 0.9 + 30, baseColor.b * 0.6 + 70)    // Teinte principale 4
    ];
    
    // Fonction pour dessiner un arbre fractal coloré AVEC OFFSET
    function drawFractalTree(x, y, size, angle, depth, colorIndex) {
        if (depth === 0 || size < 2) return;
        
        // Choisir la couleur avec une opacité basée sur la profondeur
        let opacity = 0.25 - (depth * 0.025);
        if (opacity < 0.07) opacity = 0.07;
        
        const colorIdx = (colorIndex + depth) % colorPalette.length;
        const strokeColor = colorPalette[colorIdx].toString();
        
        // Calculer la nouvelle position AVEC OFFSET
        const newX = x + Math.cos(angle) * size * (0.95 + Math.random() * 0.1);
        const newY = y + Math.sin(angle) * size * (0.95 + Math.random() * 0.1);
        
        // Dessiner une ligne avec taille adaptative
        const line = bgGroup.append("line")
            .attr("x1", x)
            .attr("y1", y)
            .attr("x2", newX)
            .attr("y2", newY)
            .attr("stroke", strokeColor)
            .attr("stroke-opacity", opacity)
            .attr("stroke-width", Math.max(1.2, depth * 0.8 * patternVisibility) * sizeMultiplier);
        
        // Angle de branchement ajusté par le niveau de détail
        const splitAngle = Math.PI * (0.18 + patternVisibility * 0.05);
        
        // Récursion avec des branches plus naturelles
        const nextSize = size * (0.65 + Math.random() * 0.15);
        
        // Animation de "croissance" si activée
        if (animation) {
            const growAnim = document.createElementNS("http://www.w3.org/2000/svg", "animate");
            growAnim.setAttribute("attributeName", "stroke-dashoffset");
            const length = Math.sqrt(Math.pow(newX - x, 2) + Math.pow(newY - y, 2));
            
            line.attr("stroke-dasharray", length);
            line.attr("stroke-dashoffset", length);
            
            growAnim.setAttribute("from", length);
            growAnim.setAttribute("to", 0);
            growAnim.setAttribute("dur", `${Math.max(0.5, depth * 0.5) / animationSpeed}s`);
            growAnim.setAttribute("fill", "freeze");
            
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
            const leafColor = colorPalette[(colorIndex + 1) % colorPalette.length].toString();
            
            // Petit cercle décoratif au bout des branches - TAILLE ADAPTATIVE
            bgGroup.append("circle")
                .attr("cx", newX)
                .attr("cy", newY)
                .attr("r", (1.5 + Math.random() * patternVisibility) * sizeMultiplier)
                .attr("fill", leafColor)
                .attr("fill-opacity", opacity * 1.3);
        }
    }
    
    // Ajuster les paramètres en fonction du niveau de détail ET de l'export
    const maxDepth = 4 + Math.round(patternVisibility * 2);
    
    // 1. Arbres en bas - AVEC OFFSET ET DENSITÉ ADAPTATIVE
    const numTreesBottom = Math.max(2, Math.floor(width / 250) + Math.floor(patternVisibility * 3)) * densityMultiplier;
    const baseSize = (100 + 40 * patternVisibility) * sizeMultiplier;
    
    for (let i = 0; i < numTreesBottom; i++) {
        // Position X répartie en bas de l'écran AVEC OFFSET
        const startX = offsetX + width * (i + 0.5) / numTreesBottom + (Math.random() * 40 - 20);
        const startY = offsetY + height * 0.98 - (Math.random() * height * 0.05);
        
        const treeDepth = maxDepth - Math.floor(Math.random() * 2);
        const baseAngle = -Math.PI/2 + (Math.random() * 0.12 - 0.06);
        const colorIndex = Math.floor(Math.random() * colorPalette.length);
        const treeSize = baseSize * (0.8 + Math.random() * 0.4);
        
        drawFractalTree(startX, startY, treeSize, baseAngle, treeDepth, colorIndex);
    }
    
    // 2. Arbres sur les côtés - AVEC OFFSET ET DENSITÉ ADAPTATIVE
    const numSideTrees = Math.max(1, Math.floor(height / 300) + Math.floor(patternVisibility * 2)) * densityMultiplier;
    
    // Côté gauche - orientation vers la droite
    if (patternVisibility > 0.3) {
        for (let i = 0; i < numSideTrees; i++) {
            const startX = offsetX + width * 0.02 + (Math.random() * width * 0.03);
            const startY = offsetY + height * (i + 1) / (numSideTrees + 1) + (Math.random() * 50 - 25);
            
            const treeDepth = maxDepth - 1 - Math.floor(Math.random() * 1);
            const baseAngle = 0 + (Math.random() * 0.4 - 0.2);
            const colorIndex = Math.floor(Math.random() * colorPalette.length);
            const treeSize = baseSize * (0.6 + Math.random() * 0.3);
            
            drawFractalTree(startX, startY, treeSize, baseAngle, treeDepth, colorIndex);
        }
    }
    
    // Côté droit - orientation vers la gauche
    if (patternVisibility > 0.3) {
        for (let i = 0; i < numSideTrees; i++) {
            const startX = offsetX + width * 0.98 - (Math.random() * width * 0.03);
            const startY = offsetY + height * (i + 0.5) / (numSideTrees + 1) + (Math.random() * 50 - 25);
            
            const treeDepth = maxDepth - 1 - Math.floor(Math.random() * 1);
            const baseAngle = Math.PI + (Math.random() * 0.4 - 0.2);
            const colorIndex = Math.floor(Math.random() * colorPalette.length);
            const treeSize = baseSize * (0.6 + Math.random() * 0.3);
            
            drawFractalTree(startX, startY, treeSize, baseAngle, treeDepth, colorIndex);
        }
    }
    
    // 3. Arbres éparpillés dans le fond - AVEC OFFSET ET DENSITÉ ADAPTATIVE
    const numBackgroundTrees = Math.max(2, Math.floor((width * height) / 200000) + Math.floor(patternVisibility * 4)) * densityMultiplier;
    
    if (patternVisibility > 0.5) {
        for (let i = 0; i < numBackgroundTrees; i++) {
            // Position aléatoire AVEC OFFSET
            const startX = offsetX + width * 0.15 + Math.random() * width * 0.7;
            const startY = offsetY + height * 0.1 + Math.random() * height * 0.6;
            
            const treeDepth = maxDepth - 2;
            const baseAngle = Math.random() * Math.PI * 2;
            const colorIndex = Math.floor(Math.random() * colorPalette.length);
            const treeSize = baseSize * (0.35 + Math.random() * 0.25);
            
            drawFractalTree(startX, startY, treeSize, baseAngle, treeDepth, colorIndex);
        }
    }
    
    console.log("✅ Génération du fond fractal terminée.");
}

// Fond avec motifs organiques et élégants adaptée pour l'export PNG grand format
async function setupOrganicPatternBackground(svg, customDimensions = null, forExport = false) {
    // Utiliser les dimensions personnalisées ou celles de l'écran
    const width = customDimensions ? customDimensions.width : window.innerWidth;
    const height = customDimensions ? customDimensions.height : window.innerHeight;
    const offsetX = customDimensions ? customDimensions.minX : 0;
    const offsetY = customDimensions ? customDimensions.minY : 0;
    
    const defs = svg.append("defs");
    
    // Calculer la densité adaptative pour l'export
    let densityMultiplier = 1;
    let sizeMultiplier = 1;

    if (forExport) {
        const baseArea = 1920 * 1080;
        const currentArea = width * height;
        const areaRatio = currentArea / baseArea;
        
        densityMultiplier = Math.sqrt(areaRatio) * 0.85;
        sizeMultiplier = Math.min(2.5, Math.max(1.1, areaRatio * 0.09));
        
        console.log(`📊 Export Organic Pattern - Densité: x${densityMultiplier.toFixed(2)}, Taille: x${sizeMultiplier.toFixed(2)}`);
    }
    
    // Récupérer tous les paramètres
    const opacity = parseFloat(localStorage.getItem('backgroundOpacity') || 0.15);
    const patternVisibility = parseFloat(localStorage.getItem('patternVisibility') || 1.0);
    const animation = forExport ? false : localStorage.getItem('backgroundAnimation') === 'true';
    const animationSpeed = parseFloat(localStorage.getItem('animationSpeed') || 1.0);
    const customColor = localStorage.getItem('backgroundCustomColor') || '#3F51B5';
    
    console.log(`🌿 Organic Pattern: ${width}x${height} (offset: ${offsetX}, ${offsetY}) - Export: ${forExport}`);
    
    // Nettoyer tout fond existant
    svg.selectAll(".background-element").remove();
    
    // Créer un groupe pour le fond
    const bgGroup = svg.append("g")
        .attr("class", "background-element")
        .attr("pointer-events", "none")
        .style("opacity", opacity)
        .lower();
    
    // Fond de base avec gradient doux AVEC OFFSET
    const gradientId = `organic-bg-gradient-${Date.now()}`;
    const bgGradient = defs.append("linearGradient")
        .attr("id", gradientId)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%");
    
    // Teinte basée sur la couleur personnalisée
    const baseColor = d3.rgb(customColor);
    
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
    
    // Rectangle de fond AVEC OFFSET
    bgGroup.append("rect")
        .attr("x", offsetX)
        .attr("y", offsetY)
        .attr("width", width)
        .attr("height", height)
        .attr("fill", `url(#${gradientId})`);
    
    // Palette de couleurs végétales basée sur la couleur personnalisée
    const colors = [
        d3.rgb(Math.min(255, baseColor.r * 0.3 + 60), Math.min(255, baseColor.g * 0.5 + 70), Math.min(255, baseColor.b * 0.3 + 40), 0.15),
        d3.rgb(Math.min(255, baseColor.r * 0.2 + 40), Math.min(255, baseColor.g * 0.6 + 80), Math.min(255, baseColor.b * 0.2 + 30), 0.12),
        d3.rgb(Math.min(255, baseColor.r * 0.4 + 50), Math.min(255, baseColor.g * 0.4 + 60), Math.min(255, baseColor.b * 0.4 + 50), 0.12),
        d3.rgb(Math.min(255, baseColor.r * 0.3 + 70), Math.min(255, baseColor.g * 0.3 + 90), Math.min(255, baseColor.b * 0.3 + 60), 0.12)
    ];
    
    // 1. Créer des formes de feuilles AVEC TAILLE ADAPTATIVE
    function drawLeaf(x, y, size, angle, type) {
        const adaptedSize = size * sizeMultiplier;
        const adaptedX = offsetX + x;
        const adaptedY = offsetY + y;
        
        if (type === 0) {
            // Feuille simple ovale AVEC TAILLE ADAPTATIVE
            const leaf = bgGroup.append("path")
                .attr("d", `M ${adaptedX} ${adaptedY} 
                           Q ${adaptedX + Math.cos(angle) * adaptedSize * 0.5} ${adaptedY + Math.sin(angle) * adaptedSize * 0.5}, 
                             ${adaptedX + Math.cos(angle) * adaptedSize} ${adaptedY + Math.sin(angle) * adaptedSize}
                           Q ${adaptedX + Math.cos(angle + 0.5) * adaptedSize * 0.7} ${adaptedY + Math.sin(angle + 0.5) * adaptedSize * 0.7},
                             ${adaptedX} ${adaptedY}`)
                .attr("fill", colors[Math.floor(Math.random() * colors.length)].toString())
                .attr("stroke", "rgba(70, 100, 70, 0.08)")
                .attr("stroke-width", 0.5 * sizeMultiplier);
                
            // Nervure centrale AVEC TAILLE ADAPTATIVE
            bgGroup.append("path")
                .attr("d", `M ${adaptedX} ${adaptedY} L ${adaptedX + Math.cos(angle) * adaptedSize}  ${adaptedY + Math.sin(angle) * adaptedSize}`)
                .attr("fill", "transparent")
                .attr("stroke", "rgba(70, 100, 70, 0.1)")
                .attr("stroke-width", 0.7 * sizeMultiplier);
            
            // Animation (désactivée pour export)
            if (animation) {
                const anim = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
                anim.setAttribute("attributeName", "transform");
                anim.setAttribute("type", "rotate");
                anim.setAttribute("from", `0 ${adaptedX} ${adaptedY}`);
                anim.setAttribute("to", `${(Math.random() < 0.5 ? 3 : -3) * patternVisibility} ${adaptedX} ${adaptedY}`);
                anim.setAttribute("dur", `${(5 + Math.random() * 4) / animationSpeed}s`);
                anim.setAttribute("repeatCount", "indefinite");
                anim.setAttribute("additive", "sum");
                
                leaf.node().appendChild(anim);
            }
        } 
        else if (type === 1) {
            // Feuille composée AVEC TAILLE ADAPTATIVE
            const mainStem = bgGroup.append("path")
                .attr("d", `M ${adaptedX} ${adaptedY} L ${adaptedX + Math.cos(angle) * adaptedSize} ${adaptedY + Math.sin(angle) * adaptedSize}`)
                .attr("fill", "transparent")
                .attr("stroke", "rgba(70, 100, 70, 0.15)")
                .attr("stroke-width", 0.8 * sizeMultiplier);
            
            const folioleGroup = bgGroup.append("g");
            
            // Folioles AVEC TAILLE ADAPTATIVE
            const numFolioles = Math.floor(adaptedSize / (15 * sizeMultiplier)) + 3;
            const folioleSize = adaptedSize * 0.2;
            
            for (let i = 1; i < numFolioles; i++) {
                const stemPos = i / numFolioles;
                const posX = adaptedX + Math.cos(angle) * adaptedSize * stemPos;
                const posY = adaptedY + Math.sin(angle) * adaptedSize * stemPos;
                
                // Foliole gauche
                folioleGroup.append("path")
                    .attr("d", `M ${posX} ${posY} 
                               Q ${posX + Math.cos(angle + Math.PI/2) * folioleSize * 0.5} ${posY + Math.sin(angle + Math.PI/2) * folioleSize * 0.5}, 
                                 ${posX + Math.cos(angle + Math.PI/2) * folioleSize} ${posY + Math.sin(angle + Math.PI/2) * folioleSize}`)
                    .attr("fill", "transparent")
                    .attr("stroke", colors[Math.floor(Math.random() * colors.length)].toString())
                    .attr("stroke-width", 0.8 * sizeMultiplier);
                
                // Foliole droite
                folioleGroup.append("path")
                    .attr("d", `M ${posX} ${posY} 
                               Q ${posX + Math.cos(angle - Math.PI/2) * folioleSize * 0.5} ${posY + Math.sin(angle - Math.PI/2) * folioleSize * 0.5}, 
                                 ${posX + Math.cos(angle - Math.PI/2) * folioleSize} ${posY + Math.sin(angle - Math.PI/2) * folioleSize}`)
                    .attr("fill", "transparent")
                    .attr("stroke", colors[Math.floor(Math.random() * colors.length)].toString())
                    .attr("stroke-width", 0.8 * sizeMultiplier);
            }
            
            // Animation (désactivée pour export)
            if (animation) {
                const anim = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
                anim.setAttribute("attributeName", "transform");
                anim.setAttribute("type", "rotate");
                anim.setAttribute("from", `0 ${adaptedX} ${adaptedY}`);
                anim.setAttribute("to", `${(Math.random() < 0.5 ? 2 : -2) * patternVisibility} ${adaptedX} ${adaptedY}`);
                anim.setAttribute("dur", `${(6 + Math.random() * 4) / animationSpeed}s`);
                anim.setAttribute("repeatCount", "indefinite");
                anim.setAttribute("additive", "sum");
                
                folioleGroup.node().appendChild(anim);
            }
        }
        else if (type === 2) {
            // Feuille complexe (selon le niveau de détail)
            if (patternVisibility > 0.4) {
                const leafGroup = bgGroup.append("g");
                const leafColor = colors[Math.floor(Math.random() * colors.length)];
                
                // Forme principale AVEC TAILLE ADAPTATIVE
                const leaf = leafGroup.append("path")
                    .attr("d", `M ${adaptedX} ${adaptedY} 
                          C ${adaptedX + Math.cos(angle - 0.4) * adaptedSize * 0.5} ${adaptedY + Math.sin(angle - 0.4) * adaptedSize * 0.5},
                            ${adaptedX + Math.cos(angle - 0.2) * adaptedSize * 0.8} ${adaptedY + Math.sin(angle - 0.2) * adaptedSize * 0.8},
                            ${adaptedX + Math.cos(angle) * adaptedSize} ${adaptedY + Math.sin(angle) * adaptedSize}
                          C ${adaptedX + Math.cos(angle + 0.2) * adaptedSize * 0.8} ${adaptedY + Math.sin(angle + 0.2) * adaptedSize * 0.8},
                            ${adaptedX + Math.cos(angle + 0.4) * adaptedSize * 0.5} ${adaptedY + Math.sin(angle + 0.4) * adaptedSize * 0.5},
                            ${adaptedX} ${adaptedY}`)
                    .attr("fill", leafColor.toString())
                    .attr("stroke", "rgba(70, 100, 70, 0.08)")
                    .attr("stroke-width", 0.5 * sizeMultiplier);
                
                // Nervure centrale AVEC TAILLE ADAPTATIVE
                leafGroup.append("path")
                    .attr("d", `M ${adaptedX} ${adaptedY} L ${adaptedX + Math.cos(angle) * adaptedSize * 0.95} ${adaptedY + Math.sin(angle) * adaptedSize * 0.95}`)
                    .attr("fill", "transparent")
                    .attr("stroke", "rgba(70, 100, 70, 0.1)")
                    .attr("stroke-width", 0.7 * sizeMultiplier);
                
                // Animation (désactivée pour export)
                if (animation) {
                    const anim = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
                    anim.setAttribute("attributeName", "transform");
                    anim.setAttribute("type", "rotate");
                    anim.setAttribute("from", `0 ${adaptedX} ${adaptedY}`);
                    anim.setAttribute("to", `${(Math.random() < 0.5 ? 3 : -3) * patternVisibility} ${adaptedX} ${adaptedY}`);
                    anim.setAttribute("dur", `${(5 + Math.random() * 4) / animationSpeed}s`);
                    anim.setAttribute("repeatCount", "indefinite");
                    anim.setAttribute("additive", "sum");
                    
                    leafGroup.node().appendChild(anim);
                }
            } else {
                // Fallback vers type simple
                drawLeaf(x, y, size, angle, 0);
            }
        }
    }
    
    // 2. Créer des petites structures végétales AVEC TAILLE ADAPTATIVE
    function drawFlower(x, y, size) {
        const adaptedSize = size * sizeMultiplier;
        const adaptedX = offsetX + x;
        const adaptedY = offsetY + y;
        
        const numPetals = 5 + Math.floor(Math.random() * 3);
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        const flowerGroup = bgGroup.append("g");
        
        // Centre de la fleur AVEC TAILLE ADAPTATIVE
        flowerGroup.append("circle")
            .attr("cx", adaptedX)
            .attr("cy", adaptedY)
            .attr("r", adaptedSize * 0.2)
            .attr("fill", "rgba(180, 180, 140, 0.15)");
        
        // Pétales AVEC TAILLE ADAPTATIVE
        for (let i = 0; i < numPetals; i++) {
            const angle = (i / numPetals) * Math.PI * 2;
            const petalX = adaptedX + Math.cos(angle) * adaptedSize * 0.5;
            const petalY = adaptedY + Math.sin(angle) * adaptedSize * 0.5;
            
            flowerGroup.append("circle")
                .attr("cx", petalX)
                .attr("cy", petalY)
                .attr("r", adaptedSize * 0.3)
                .attr("fill", color.toString());
        }
        
        // Animation (désactivée pour export)
        if (animation) {
            const anim = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
            anim.setAttribute("attributeName", "transform");
            anim.setAttribute("type", "rotate");
            anim.setAttribute("from", `0 ${adaptedX} ${adaptedY}`);
            anim.setAttribute("to", `${(Math.random() < 0.5 ? 360 : -360)}`);
            anim.setAttribute("dur", `${(30 + Math.random() * 20) / animationSpeed}s`);
            anim.setAttribute("repeatCount", "indefinite");
            
            flowerGroup.node().appendChild(anim);
        }
    }
    
    // 3. Créer des tiges et branches fines AVEC TAILLE ADAPTATIVE
    function drawStem(x, y, length, angle) {
        const adaptedLength = length * sizeMultiplier;
        
        let currentX = offsetX + x;
        let currentY = offsetY + y;
        
        const stemGroup = bgGroup.append("g");
        
        let pathData = `M ${currentX} ${currentY}`;
        
        const numSegments = Math.floor(adaptedLength / (20 * sizeMultiplier)) + 2;
        const segmentLength = adaptedLength / numSegments;
        
        for (let i = 1; i <= numSegments; i++) {
            angle += (Math.random() - 0.5) * 0.2;
            
            currentX += Math.cos(angle) * segmentLength;
            currentY += Math.sin(angle) * segmentLength;
            
            pathData += ` L ${currentX} ${currentY}`;
            
            // Éléments sur la tige AVEC ADAPTATION
            const elementThreshold = 0.3 * patternVisibility;
            if (Math.random() < elementThreshold && i > 1) {
                if (Math.random() < 0.7) {
                    // Petite feuille SANS offset (déjà appliqué dans drawLeaf)
                    const leafSize = (10 + Math.random() * 15);
                    const leafAngle = angle + (Math.random() < 0.5 ? Math.PI/2 : -Math.PI/2);
                    drawLeaf(currentX - offsetX, currentY - offsetY, leafSize, leafAngle, Math.floor(Math.random() * 3));
                } else {
                    // Petite fleur
                    if (patternVisibility > 0.5) {
                        const flowerSize = (8 + Math.random() * 10);
                        drawFlower(currentX - offsetX, currentY - offsetY, flowerSize);
                    }
                }
            }
        }
        
        // Dessiner la tige AVEC TAILLE ADAPTATIVE
        const stem = stemGroup.append("path")
            .attr("d", pathData)
            .attr("fill", "transparent")
            .attr("stroke", "rgba(100, 120, 90, 0.15)")
            .attr("stroke-width", 1.2 * sizeMultiplier)
            .attr("stroke-linecap", "round");
        
        // Animation (désactivée pour export)
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
    
    // Disposer les éléments végétaux AVEC DENSITÉ ADAPTATIVE
    
    // 1. Grandes feuilles éparses
    const baseLargeLeaves = Math.floor((width * height) / 100000 * patternVisibility) + 5;
    const numLargeLeaves = Math.floor(baseLargeLeaves * densityMultiplier);
    
    console.log(`🍃 ${numLargeLeaves} grandes feuilles`);
    
    for (let i = 0; i < numLargeLeaves; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = 40 + Math.random() * 60;
        const angle = Math.random() * Math.PI * 2;
        const leafType = Math.floor(Math.random() * 3);
        
        drawLeaf(x, y, size, angle, leafType);
    }
    
    // 2. Tiges avec petites feuilles et fleurs
    const baseStems = Math.floor((width * height) / 70000 * patternVisibility) + 8;
    const numStems = Math.floor(baseStems * densityMultiplier);
    
    console.log(`🌱 ${numStems} tiges`);
    
    for (let i = 0; i < numStems; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const length = 80 + Math.random() * 120;
        const angle = Math.random() * Math.PI * 2;
        
        drawStem(x, y, length, angle);
    }
    
    // 3. Fleurs isolées
    if (patternVisibility > 0.3) {
        const baseFlowers = Math.floor((width * height) / 120000 * patternVisibility) + 5;
        const numFlowers = Math.floor(baseFlowers * densityMultiplier);
        
        console.log(`🌸 ${numFlowers} fleurs`);
        
        for (let i = 0; i < numFlowers; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = 15 + Math.random() * 20;
            
            drawFlower(x, y, size);
        }
    }
    
    // 4. Motif texturé
    if (patternVisibility > 0.4) {
        const baseTexture = Math.floor((width * height) / 1000 * patternVisibility);
        const textureDensity = Math.floor(baseTexture * densityMultiplier);
        
        console.log(`✨ ${textureDensity} éléments de texture`);
        
        for (let i = 0; i < textureDensity; i++) {
            const x = offsetX + Math.random() * width;
            const y = offsetY + Math.random() * height;
            const length = (Math.random() * 10 + 3) * sizeMultiplier;
            const angle = Math.random() * Math.PI;
            
            bgGroup.append("line")
                .attr("x1", x)
                .attr("y1", y)
                .attr("x2", x + Math.cos(angle) * length)
                .attr("y2", y + Math.sin(angle) * length)
                .attr("stroke", "rgba(140, 160, 130, 0.05)")
                .attr("stroke-width", 0.5 * sizeMultiplier);
        }
    }
    
    console.log("✅ Génération du motif organique terminée.");
}

// Fond avec motifs géométriques Art Déco adaptée pour l'export PNG grand format
async function setupArtDecoBackground(svg, customDimensions = null, forExport = false) {
    // Utiliser les dimensions personnalisées ou celles de l'écran
    const width = customDimensions ? customDimensions.width : window.innerWidth;
    const height = customDimensions ? customDimensions.height : window.innerHeight;
    const offsetX = customDimensions ? customDimensions.minX : 0;
    const offsetY = customDimensions ? customDimensions.minY : 0;
    
    const defs = svg.append("defs");
    
    // Calculer la densité adaptative pour l'export
    let densityMultiplier = 1;
    let sizeMultiplier = 1;

    if (forExport) {
        const baseArea = 1920 * 1080;
        const currentArea = width * height;
        const areaRatio = currentArea / baseArea;
        
        densityMultiplier = Math.sqrt(areaRatio) * 0.8;
        sizeMultiplier = Math.min(2.5, Math.max(1.3, areaRatio * 0.1));
        
        console.log(`📊 Export Art Déco - Densité: x${densityMultiplier.toFixed(2)}, Taille: x${sizeMultiplier.toFixed(2)}`);
    }
    
    // Récupérer tous les paramètres
    const opacity = parseFloat(localStorage.getItem('backgroundOpacity') || 0.15);
    const patternVisibility = parseFloat(localStorage.getItem('patternVisibility') || 1.0);
    const animation = forExport ? false : localStorage.getItem('backgroundAnimation') === 'true';
    const animationSpeed = parseFloat(localStorage.getItem('animationSpeed') || 1.0);
    const customColor = localStorage.getItem('backgroundCustomColor') || '#3F51B5';
    
    console.log(`🎨 Art Déco: ${width}x${height} (offset: ${offsetX}, ${offsetY}) - Export: ${forExport}`);
    
    // Nettoyer tout fond existant
    svg.selectAll(".background-element").remove();
    
    // Créer un groupe pour le fond
    const bgGroup = svg.append("g")
        .attr("class", "background-element")
        .attr("pointer-events", "none")
        .style("opacity", opacity)
        .lower();
    
    // Fond de base ivoire très clair, légèrement teinté par la couleur personnalisée AVEC OFFSET
    const baseColor = d3.rgb(customColor);
    
    const bgColor = d3.rgb(
        Math.min(255, 245 + (baseColor.r - 245) * 0.1),
        Math.min(255, 245 + (baseColor.g - 245) * 0.1),
        Math.min(255, 240 + (baseColor.b - 240) * 0.1)
    );
    
    bgGroup.append("rect")
        .attr("x", offsetX)
        .attr("y", offsetY)
        .attr("width", width)
        .attr("height", height)
        .attr("fill", bgColor.toString())
        .attr("pointer-events", "none")
        .lower();
    
    // Définir des couleurs Art Déco basées sur la couleur personnalisée
    const colors = [
        d3.rgb(Math.min(255, baseColor.r * 0.8 + 40), Math.min(255, baseColor.g * 0.8 + 40), Math.min(255, baseColor.b * 0.8 + 60), 0.25),
        d3.rgb(Math.min(255, baseColor.r * 0.8 + 30), Math.min(255, baseColor.g * 0.8 + 30), Math.min(255, baseColor.b * 0.8 + 50), 0.2),
        d3.rgb(Math.min(255, baseColor.r * 0.8 + 50), Math.min(255, baseColor.g * 0.8 + 40), Math.min(255, baseColor.b * 0.8 + 30), 0.2),
        d3.rgb(Math.min(255, baseColor.r * 0.8 + 40), Math.min(255, baseColor.g * 0.8 + 50), Math.min(255, baseColor.b * 0.8 + 40), 0.2)
    ];
    
    // Adapter la taille de la grille au niveau de détail ET à la taille
    const baseGridSize = Math.max(100, 150 - patternVisibility * 50);
    const gridSize = baseGridSize * sizeMultiplier;
    const numRows = Math.ceil(height / gridSize) + 1;
    const numCols = Math.ceil(width / gridSize) + 1;
    
    console.log(`📐 Grille: ${numCols}x${numRows}, taille cellule: ${gridSize.toFixed(0)}px`);
    
    // Tableau pour stocker les formes animables
    const animatableShapes = [];
    
    // Créer une grille de formes Art Déco AVEC OFFSET
    for (let row = -1; row < numRows; row++) {
        for (let col = -1; col < numCols; col++) {
            const centerX = offsetX + col * gridSize;
            const centerY = offsetY + row * gridSize;
            
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
                    case 0: // Cercles concentriques AVEC TAILLE ADAPTATIVE
                        const circles = [];
                        const numCircles = Math.max(1, Math.round(3 * patternVisibility));
                        
                        for (let i = numCircles; i > 0; i--) {
                            const circle = shapeGroup.append("circle")
                                .attr("cx", 0)
                                .attr("cy", 0)
                                .attr("r", (gridSize / 3) * i * 0.7)
                                .attr("fill", "transparent")
                                .attr("stroke", color.toString())
                                .attr("stroke-width", 2 * sizeMultiplier);
                            
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
                    
                    case 1: // Motif en éventail AVEC TAILLE ADAPTATIVE
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
                                .attr("stroke-width", 2 * sizeMultiplier);
                            
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
                    
                    case 2: // Losanges emboîtés AVEC TAILLE ADAPTATIVE
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
                                .attr("fill", "transparent")
                                .attr("stroke", color.toString())
                                .attr("stroke-width", 2 * sizeMultiplier);
                            
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
                    
                    case 3: // Motif chevron AVEC TAILLE ADAPTATIVE
                        const chevrons = [];
                        const numChevrons = Math.max(1, Math.round(3 * patternVisibility));
                        
                        for (let i = 0; i < numChevrons; i++) {
                            const size = gridSize * 0.3 * (i + 1);
                            
                            const chevronUp = shapeGroup.append("path")
                                .attr("d", `M ${-size} ${0} L ${0} ${-size} L ${size} ${0}`)
                                .attr("fill", "transparent")
                                .attr("stroke", color.toString())
                                .attr("stroke-width", 2 * sizeMultiplier);
                            
                            const chevronDown = shapeGroup.append("path")
                                .attr("d", `M ${-size} ${0} L ${0} ${size} L ${size} ${0}`)
                                .attr("fill", "transparent")
                                .attr("stroke", color.toString())
                                .attr("stroke-width", 2 * sizeMultiplier);
                            
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
                        
                    case 4: // Octogones concentriques AVEC TAILLE ADAPTATIVE
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
                                .attr("fill", "transparent")
                                .attr("stroke", color.toString())
                                .attr("stroke-width", 2 * sizeMultiplier);
                            
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
    
    // Superposer quelques grandes formes géométriques AVEC TAILLE ADAPTATIVE
    const numLargeShapes = Math.max(2, Math.round(5 * patternVisibility * densityMultiplier));
    
    for (let i = 0; i < numLargeShapes; i++) {
        // Position AVEC OFFSET
        const x = offsetX + Math.random() * width;
        const y = offsetY + Math.random() * height;
        const size = (Math.random() * 300 + 200) * sizeMultiplier;
        
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
            .attr("fill", "transparent")
            .attr("stroke", largeShapeColor.toString())
            .attr("stroke-width", 2.5 * sizeMultiplier);
        
        if (animation) {
            animatableShapes.push({
                type: "largeShape",
                elements: [largeShape],
                centerX: x,
                centerY: y
            });
        }
    }
    
    // Ajouter des animations si activées (désactivées pour export)
    if (animation) {
        console.log("🎬 Activation des animations Art Déco...");
        
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
                    
                    shape.elements[0].node().parentNode.appendChild(rotateAnim);
                    break;
                    
                case "chevrons":
                    // Déplacement vertical avec taille adaptée
                    for (let i = 0; i < shape.elements.length; i += 2) {
                        const moveY = 5 * patternVisibility * sizeMultiplier;
                        const moveAnim = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                        moveAnim.setAttribute("attributeName", "d");
                        
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
    
    console.log("✅ Génération du fond Art Déco terminée.");
}

// Fond inspiré de Jackson Pollock adaptée pour l'export PNG grand format
async function setupPollockBackground(svg, customDimensions = null, forExport = false) {
    // Utiliser les dimensions personnalisées ou celles de l'écran
    const width = customDimensions ? customDimensions.width : window.innerWidth;
    const height = customDimensions ? customDimensions.height : window.innerHeight;
    const offsetX = customDimensions ? customDimensions.minX : 0;
    const offsetY = customDimensions ? customDimensions.minY : 0;
    
    const defs = svg.append("defs");
    
    // Calculer la densité adaptative pour l'export
    let densityMultiplier = 1;
    let sizeMultiplier = 1;

    if (forExport) {
        const baseArea = 1920 * 1080;
        const currentArea = width * height;
        const areaRatio = currentArea / baseArea;
        
        densityMultiplier = Math.sqrt(areaRatio) * 0.85;
        sizeMultiplier = Math.min(2.2, Math.max(1.4, areaRatio * 0.15));
        
        console.log(`📊 Export Pollock - Densité: x${densityMultiplier.toFixed(2)}, Taille: x${sizeMultiplier.toFixed(2)}`);
    }
    
    // Récupérer tous les paramètres
    const opacity = parseFloat(localStorage.getItem('backgroundOpacity') || 0.15);
    const patternVisibility = parseFloat(localStorage.getItem('patternVisibility') || 1.0);
    const animation = forExport ? false : localStorage.getItem('backgroundAnimation') === 'true';
    const animationSpeed = parseFloat(localStorage.getItem('animationSpeed') || 1.0);
    const customColor = localStorage.getItem('backgroundCustomColor') || '#3F51B5';
    
    console.log(`🎨 Pollock: ${width}x${height} (offset: ${offsetX}, ${offsetY}) - Export: ${forExport}`);
    
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
    
    // Rectangle de fond AVEC OFFSET
    bgGroup.append("rect")
        .attr("x", offsetX)
        .attr("y", offsetY)
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
    
    // Créer l'effet dripping - lignes fines AVEC DENSITÉ ADAPTATIVE
    const numLines = Math.floor((width / (20 - 5 * patternVisibility)) * densityMultiplier);
    const drippingLines = [];
    
    for (let i = 0; i < numLines; i++) {
        // Point de départ aléatoire AVEC OFFSET
        const startX = offsetX + Math.random() * width;
        const startY = offsetY + Math.random() * height;
        
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
            const distance = (Math.random() * 50 + 10 + 20 * patternVisibility) * sizeMultiplier;
            
            currentX += Math.cos(angle) * distance;
            currentY += Math.sin(angle) * distance;
            
            // Ajouter au chemin
            pathData += ` L ${currentX} ${currentY}`;
            points.push({x: currentX, y: currentY});
        }
        
        // Dessiner le trait avec épaisseur variable ADAPTATIVE
        const color = colors[Math.floor(Math.random() * colors.length)];
        const thickness = (Math.random() * 2 + 0.5 + patternVisibility) * sizeMultiplier;
        
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
    
    // Créer l'effet dripping - éclaboussures AVEC DENSITÉ ADAPTATIVE
    const numSplatters = Math.floor((width / (80 - 20 * patternVisibility)) * densityMultiplier);
    const splatters = [];
    
    for (let i = 0; i < numSplatters; i++) {
        // Position AVEC OFFSET
        const x = offsetX + Math.random() * width;
        const y = offsetY + Math.random() * height;
        const size = (Math.random() * 30 + 5 + 10 * patternVisibility) * sizeMultiplier;
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
            const dropSize = (Math.random() * (size * 0.4) + (size * 0.1)) * sizeMultiplier;
            
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
        
        // Ajouter un cercle central AVEC TAILLE ADAPTATIVE
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
    
    // Ajouter des animations si activées (désactivées pour export)
    if (animation) {
        // Animation pour les lignes de dripping
        drippingLines.forEach((line, index) => {
            if (index % 3 === 0) {
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
            if (index % 2 === 0) {
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
    
    console.log("✅ Génération du fond Pollock terminée.");
}

// Fond inspiré de Wassily Kandinsky adaptée pour l'export PNG grand format
async function setupKandinskyBackground(svg, customDimensions = null, forExport = false) {
    // Utiliser les dimensions personnalisées ou celles de l'écran
    const width = customDimensions ? customDimensions.width : window.innerWidth;
    const height = customDimensions ? customDimensions.height : window.innerHeight;
    const offsetX = customDimensions ? customDimensions.minX : 0;
    const offsetY = customDimensions ? customDimensions.minY : 0;
    
    const defs = svg.append("defs");
    
    // Calculer la densité adaptative pour l'export
    let densityMultiplier = 1;
    let sizeMultiplier = 1;

    if (forExport) {
        const baseArea = 1920 * 1080;
        const currentArea = width * height;
        const areaRatio = currentArea / baseArea;
        
        densityMultiplier = Math.sqrt(areaRatio) * 0.8;
        sizeMultiplier = Math.min(2.5, Math.max(1.3, areaRatio * 0.12));
        
        console.log(`📊 Export Kandinsky - Densité: x${densityMultiplier.toFixed(2)}, Taille: x${sizeMultiplier.toFixed(2)}`);
    }
    
    // Récupérer tous les paramètres
    const opacity = parseFloat(localStorage.getItem('backgroundOpacity') || 0.15);
    const patternVisibility = parseFloat(localStorage.getItem('patternVisibility') || 1.0);
    const animation = forExport ? false : localStorage.getItem('backgroundAnimation') === 'true';
    const animationSpeed = parseFloat(localStorage.getItem('animationSpeed') || 1.0);
    const customColor = localStorage.getItem('backgroundCustomColor') || '#3F51B5';
    
    console.log(`🎨 Kandinsky: ${width}x${height} (offset: ${offsetX}, ${offsetY}) - Export: ${forExport}`);
    
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
    
    // Rectangle de fond AVEC OFFSET
    bgGroup.append("rect")
        .attr("x", offsetX)
        .attr("y", offsetY)
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
    
    // 1. Ajouter des cercles, cœur du style Kandinsky - AVEC DENSITÉ ADAPTATIVE
    const numCircles = Math.floor((width / 120) + Math.floor(patternVisibility * 10)) * densityMultiplier;
    
    for (let i = 0; i < numCircles; i++) {
        // Position AVEC OFFSET
        const x = offsetX + Math.random() * width;
        const y = offsetY + Math.random() * height;
        const size = (Math.random() * 80 + 20 + 40 * patternVisibility) * sizeMultiplier;
        
        // Groupe pour les éléments de ce cercle
        const circleGroup = bgGroup.append("g");
        
        // Cercle principal AVEC TAILLE ADAPTATIVE
        const mainCircle = circleGroup.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", size)
            .attr("fill", "none")
            .attr("stroke", colors[Math.floor(Math.random() * colors.length)])
            .attr("stroke-width", (Math.random() * 2 + 1 + patternVisibility) * sizeMultiplier);
        
        // Parfois ajouter des cercles concentriques (selon le niveau de détail)
        if (Math.random() < 0.5 * patternVisibility) {
            const innerCircle = circleGroup.append("circle")
                .attr("cx", x)
                .attr("cy", y)
                .attr("r", size * 0.7)
                .attr("fill", "none")
                .attr("stroke", colors[Math.floor(Math.random() * colors.length)])
                .attr("stroke-width", (Math.random() * 1.5 + 0.5 + 0.5 * patternVisibility) * sizeMultiplier);
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
    
    // 2. Ajouter des lignes droites traversant l'espace - AVEC DENSITÉ ADAPTATIVE
    const numLines = Math.floor((width / 150) + Math.floor(patternVisibility * 12)) * densityMultiplier;
    
    for (let i = 0; i < numLines; i++) {
        // Lignes traversant tout l'écran AVEC OFFSET
        const y = offsetY + Math.random() * height;
        
        const line = bgGroup.append("line")
            .attr("x1", offsetX)
            .attr("y1", y)
            .attr("x2", offsetX + width)
            .attr("y2", y + (Math.random() * height * 0.4 - height * 0.2))
            .attr("stroke", colors[Math.floor(Math.random() * colors.length)])
            .attr("stroke-width", (Math.random() * 1.5 + 0.5 + patternVisibility) * sizeMultiplier);
        
        animatableShapes.push({
            type: "line",
            element: line,
            y1: y
        });
    }
    
    // 3. Ajouter quelques grilles et formes géométriques - AVEC DENSITÉ ADAPTATIVE
    const numShapes = Math.floor((width / 250) + Math.floor(patternVisibility * 5)) * densityMultiplier;
    
    for (let i = 0; i < numShapes; i++) {
        // Position AVEC OFFSET
        const x = offsetX + Math.random() * width;
        const y = offsetY + Math.random() * height;
        const size = (Math.random() * 100 + 30 + 30 * patternVisibility) * sizeMultiplier;
        
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
                    .attr("stroke-width", (Math.random() * 1.5 + 0.8 + 0.5 * patternVisibility) * sizeMultiplier);
                
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
                    .attr("stroke-width", (Math.random() * 1.5 + 0.8 + 0.5 * patternVisibility) * sizeMultiplier);
                
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
                        .attr("stroke-width", (Math.random() * 1 + 0.5 + 0.3 * patternVisibility) * sizeMultiplier);
                    
                    shapeGroup.append("line")
                        .attr("x1", x - size/2 + j * cellSize)
                        .attr("y1", y - size/2)
                        .attr("x2", x - size/2 + j * cellSize)
                        .attr("y2", y + size/2)
                        .attr("stroke", color)
                        .attr("stroke-width", (Math.random() * 1 + 0.5 + 0.3 * patternVisibility) * sizeMultiplier);
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
                    .attr("stroke-width", (Math.random() * 1.5 + 0.8 + 0.5 * patternVisibility) * sizeMultiplier);
                
                animatableShapes.push({
                    type: "star",
                    element: shapeGroup,
                    cx: x,
                    cy: y
                });
                break;
        }
    }
    
    // Ajouter des animations si activées (désactivées pour export)
    if (animation) {
        animatableShapes.forEach((shape, i) => {
            // Animation différente selon le type de forme
            const delay = i * 0.1;
            
            switch (shape.type) {
                case "circle":
                    // Pulsation lente
                    if (i % 3 === 0) {
                        const scaleAnim = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
                        scaleAnim.setAttribute("attributeName", "transform");
                        scaleAnim.setAttribute("type", "scale");
                        scaleAnim.setAttribute("from", "1 1");
                        scaleAnim.setAttribute("to", `${1 + 0.1 * patternVisibility} ${1 + 0.1 * patternVisibility}`);
                        scaleAnim.setAttribute("dur", `${(10 + Math.random() * 10) / animationSpeed}s`);
                        scaleAnim.setAttribute("repeatCount", "indefinite");
                        scaleAnim.setAttribute("additive", "sum");
                        
                        shape.element.attr("transform-origin", `${shape.x}px ${shape.y}px`);
                        shape.element.node().appendChild(scaleAnim);
                    }
                    break;
                
                case "line":
                    // Mouvement vertical subtil
                    if (i % 4 === 0) {
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
                    if (i % 2 === 0) {
                        const rotateAnim = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
                        rotateAnim.setAttribute("attributeName", "transform");
                        rotateAnim.setAttribute("type", "rotate");
                        rotateAnim.setAttribute("from", `0 ${shape.cx} ${shape.cy}`);
                        rotateAnim.setAttribute("to", `${(Math.random() < 0.5 ? 360 : -360)} ${shape.cx} ${shape.cy}`);
                        rotateAnim.setAttribute("dur", `${(40 + Math.random() * 20) / animationSpeed}s`);
                        rotateAnim.setAttribute("repeatCount", "indefinite");
                        
                        shape.element.node().appendChild(rotateAnim);
                    }
                    break;
            }
        });
    }
    
    console.log("✅ Génération du fond Kandinsky terminée.");
}

// Fond inspiré de Joan Miró adaptée pour l'export PNG grand format
async function setupMiroBackground(svg, customDimensions = null, forExport = false) {
    // Utiliser les dimensions personnalisées ou celles de l'écran
    const width = customDimensions ? customDimensions.width : window.innerWidth;
    const height = customDimensions ? customDimensions.height : window.innerHeight;
    const offsetX = customDimensions ? customDimensions.minX : 0;
    const offsetY = customDimensions ? customDimensions.minY : 0;
    
    const defs = svg.append("defs");
    
    // Calculer la densité adaptative pour l'export
    let densityMultiplier = 1;
    let sizeMultiplier = 1;

    if (forExport) {
        const baseArea = 1920 * 1080;
        const currentArea = width * height;
        const areaRatio = currentArea / baseArea;
        
        densityMultiplier = Math.sqrt(areaRatio) * 0.75;
        sizeMultiplier = Math.min(2.8, Math.max(1.2, areaRatio * 0.14));
        
        console.log(`📊 Export Miró - Densité: x${densityMultiplier.toFixed(2)}, Taille: x${sizeMultiplier.toFixed(2)}`);
    }
    
    // Récupérer tous les paramètres
    const opacity = parseFloat(localStorage.getItem('backgroundOpacity') || 0.15);
    const patternVisibility = parseFloat(localStorage.getItem('patternVisibility') || 1.0);
    const animation = forExport ? false : localStorage.getItem('backgroundAnimation') === 'true';
    const animationSpeed = parseFloat(localStorage.getItem('animationSpeed') || 1.0);
    const customColor = localStorage.getItem('backgroundCustomColor') || '#3F51B5';
    
    console.log(`🎨 Miró: ${width}x${height} (offset: ${offsetX}, ${offsetY}) - Export: ${forExport}`);
    
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
    
    // Rectangle de fond AVEC OFFSET
    bgGroup.append("rect")
        .attr("x", offsetX)
        .attr("y", offsetY)
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
    
    // 1. Formes organiques aléatoires - caractéristiques de Miró AVEC DENSITÉ ADAPTATIVE
    const numOrganic = Math.floor((width / 150) + Math.floor(patternVisibility * 8)) * densityMultiplier;
    
    for (let i = 0; i < numOrganic; i++) {
        // Position AVEC OFFSET
        const x = offsetX + Math.random() * width;
        const y = offsetY + Math.random() * height;
        const size = (Math.random() * 60 + 20 + 30 * patternVisibility) * sizeMultiplier;
        
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
            // Contour avec une autre couleur AVEC ÉPAISSEUR ADAPTATIVE
            const shape = shapeGroup.append("path")
                .attr("d", pathData)
                .attr("fill", "none")
                .attr("stroke", color)
                .attr("stroke-width", (Math.random() * 2 + 1 + patternVisibility) * sizeMultiplier);
                
            animatableShapes.push({
                type: "outlineShape",
                element: shape,
                center: {x, y},
                pathData: pathData
            });
        }
    }
    
    // 2. Lignes fines - élément signature de Miró AVEC DENSITÉ ADAPTATIVE
    const numLines = Math.floor((width / 90) + Math.floor(patternVisibility * 12)) * densityMultiplier;
    
    for (let i = 0; i < numLines; i++) {
        // Position AVEC OFFSET
        const x1 = offsetX + Math.random() * width;
        const y1 = offsetY + Math.random() * height;
        const length = (Math.random() * 150 + 50 + 50 * patternVisibility) * sizeMultiplier;
        const angle = Math.random() * Math.PI * 2;
        
        // Calculer le point final avec une légère courbure
        const x2 = x1 + Math.cos(angle) * length;
        const y2 = y1 + Math.sin(angle) * length;
        
        // Point de contrôle pour la courbe - plus varié avec niveau de détail élevé
        const variation = (25 + 25 * patternVisibility) * sizeMultiplier;
        const cpx = (x1 + x2) / 2 + (Math.random() * variation - variation/2);
        const cpy = (y1 + y2) / 2 + (Math.random() * variation - variation/2);
        
        // Dessiner une ligne courbe fine AVEC ÉPAISSEUR ADAPTATIVE
        const line = bgGroup.append("path")
            .attr("d", `M ${x1} ${y1} Q ${cpx} ${cpy}, ${x2} ${y2}`)
            .attr("fill", "none")
            .attr("stroke", colors[Math.floor(Math.random() * colors.length)])
            .attr("stroke-width", (Math.random() * 1.2 + 0.6 + 0.4 * patternVisibility) * sizeMultiplier);
        
        animatableShapes.push({
            type: "line",
            element: line,
            points: {x1, y1, cpx, cpy, x2, y2}
        });
    }
    
    // 3. Étoiles et formes solaires - motifs emblématiques de Miró AVEC DENSITÉ ADAPTATIVE
    const numSolars = Math.floor((width / 280) + Math.floor(patternVisibility * 5)) * densityMultiplier;
    
    for (let i = 0; i < numSolars; i++) {
        // Position AVEC OFFSET
        const x = offsetX + Math.random() * width;
        const y = offsetY + Math.random() * height;
        const size = (Math.random() * 40 + 15 + 20 * patternVisibility) * sizeMultiplier;
        
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
                    
                    // Dessiner une ligne simple pour chaque rayon AVEC ÉPAISSEUR ADAPTATIVE
                    shapeGroup.append("line")
                        .attr("x1", x)
                        .attr("y1", y)
                        .attr("x2", x1)
                        .attr("y2", y1)
                        .attr("stroke", colors[4]) // Noir pour les lignes
                        .attr("stroke-width", (Math.random() * 1.5 + 0.7 + 0.3 * patternVisibility) * sizeMultiplier);
                }
                
                // Cercle central AVEC TAILLE ADAPTATIVE
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
                // Disque central AVEC TAILLE ADAPTATIVE
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
                    
                    // Rayons AVEC ÉPAISSEUR ADAPTATIVE
                    shapeGroup.append("line")
                        .attr("x1", x1)
                        .attr("y1", y1)
                        .attr("x2", x2)
                        .attr("y2", y2)
                        .attr("stroke", colors[4]) // Noir
                        .attr("stroke-width", (Math.random() * 1.2 + 0.6 + 0.3 * patternVisibility) * sizeMultiplier);
                }
                
                animatableShapes.push({
                    type: "sun",
                    element: shapeGroup,
                    center: {x, y}
                });
                break;
                
            case 2: // Points avec cercles concentriques
                // Point central AVEC TAILLE ADAPTATIVE
                shapeGroup.append("circle")
                    .attr("cx", x)
                    .attr("cy", y)
                    .attr("r", (Math.random() * 5 + 2 + patternVisibility) * sizeMultiplier)
                    .attr("fill", colors[Math.floor(Math.random() * colors.length)]);
                
                // Cercles concentriques - nombre basé sur le niveau de détail
                const numRings = Math.floor(Math.random() * 2) + 1 + Math.floor(patternVisibility * 2);
                for (let j = 0; j < numRings; j++) {
                    const ringRadius = size * (0.3 + j * 0.3);
                    
                    // Cercles AVEC ÉPAISSEUR ADAPTATIVE
                    shapeGroup.append("circle")
                        .attr("cx", x)
                        .attr("cy", y)
                        .attr("r", ringRadius)
                        .attr("fill", "none")
                        .attr("stroke", colors[Math.floor(Math.random() * colors.length)])
                        .attr("stroke-width", (Math.random() * 1.5 + 0.5 + 0.3 * patternVisibility) * sizeMultiplier);
                }
                
                animatableShapes.push({
                    type: "concentricCircles",
                    element: shapeGroup,
                    center: {x, y}
                });
                break;
        }
    }
    
    // Ajouter des animations si activées (désactivées pour export)
    if (animation) {
        animatableShapes.forEach((shape, index) => {
            const delay = index * 0.05;
            const duration = (10 + Math.random() * 10) / animationSpeed;
            
            switch (shape.type) {
                case "filledShape":
                case "outlineShape":
                    // Animation subtile de déformation
                    if (index % 4 === 0) {
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
                    if (index % 3 === 0) {
                        const points = shape.points;
                        const originalCPY = points.cpy;
                        const variation = 5 * patternVisibility;
                        
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
                    if (index % 2 === 0) {
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
                    if (index % 2 === 0) {
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
    
    console.log("✅ Génération du fond Miró terminée.");
}

// Fond inspiré de Piet Mondrian avec algorithme récursif corrigé + export PNG
async function setupMondrianBackground(svg, customDimensions = null, forExport = false) {
    // Utiliser les dimensions personnalisées ou celles de l'écran
    const width = customDimensions ? customDimensions.width : window.innerWidth;
    const height = customDimensions ? customDimensions.height : window.innerHeight;
    const offsetX = customDimensions ? customDimensions.minX : 0;
    const offsetY = customDimensions ? customDimensions.minY : 0;
    
    const defs = svg.append("defs");
    
    // Calculer la densité adaptative pour l'export
    let densityMultiplier = 1;
    let sizeMultiplier = 1;

    if (forExport) {
        const baseArea = 1920 * 1080;
        const currentArea = width * height;
        const areaRatio = currentArea / baseArea;
        
        densityMultiplier = Math.sqrt(areaRatio) * 0.85;
        sizeMultiplier = Math.min(2, Math.max(1.2, areaRatio * 0.08));
        
        console.log(`📊 Export Mondrian - Densité: x${densityMultiplier.toFixed(2)}, Taille: x${sizeMultiplier.toFixed(2)}`);
    }
    
    // Récupérer tous les paramètres
    const opacity = parseFloat(localStorage.getItem('backgroundOpacity') || 0.15);
    const patternVisibility = parseFloat(localStorage.getItem('patternVisibility') || 1.0);
    const animation = forExport ? false : localStorage.getItem('backgroundAnimation') === 'true';
    const animationSpeed = parseFloat(localStorage.getItem('animationSpeed') || 1.0);
    const customColor = localStorage.getItem('backgroundCustomColor') || '#3F51B5';
    
    console.log(`🎨 Mondrian: ${width}x${height} (offset: ${offsetX}, ${offsetY}) - Export: ${forExport}`);
    
    // Nettoyer tout fond existant
    svg.selectAll(".background-element").remove();
    
    // Créer un groupe pour le fond
    const bgGroup = svg.append("g")
        .attr("class", "background-element")
        .attr("pointer-events", "none")
        .style("opacity", opacity)
        .lower();
    
    // Fond de base blanc avec offset
    bgGroup.append("rect")
        .attr("x", offsetX)
        .attr("y", offsetY)
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#f5f5f5");
    
    // Préparer les couleurs primaires Mondrian avec influence de la couleur personnalisée
    const baseColor = d3.rgb(customColor);
    
    const redColor = d3.rgb(
        Math.min(255, 230 + baseColor.r * 0.1),
        Math.max(0, baseColor.g * 0.1),
        Math.max(0, baseColor.b * 0.1)
    );
    
    const blueColor = d3.rgb(
        Math.max(0, baseColor.r * 0.1),
        Math.max(0, baseColor.g * 0.2),
        Math.min(255, 200 + baseColor.b * 0.2)
    );
    
    const yellowColor = d3.rgb(
        Math.min(255, 240 + baseColor.r * 0.06),
        Math.min(255, 220 + baseColor.g * 0.06),
        Math.max(0, baseColor.b * 0.05)
    );
    
    const whiteColor = d3.rgb(255, 255, 255);
    const blackColor = d3.rgb(0, 0, 0);
    
    // Couleurs avec opacité plus forte pour qu'elles ressortent bien
    const colors = [
        redColor.toString().replace(')', ', 0.75)').replace('rgb', 'rgba'),
        blueColor.toString().replace(')', ', 0.75)').replace('rgb', 'rgba'),
        yellowColor.toString().replace(')', ', 0.75)').replace('rgb', 'rgba'),
        whiteColor.toString().replace(')', ', 0.75)').replace('rgb', 'rgba')
    ];
    
    // ALGORITHME RÉCURSIF AMÉLIORÉ avec contrôle des ratios
    const rectangles = [];
    const animatableRectangles = [];
    
    // Commencer avec un grand rectangle couvrant toute la zone AVEC OFFSET
    const initialRect = {
        x: offsetX,
        y: offsetY,
        width: width,
        height: height,
        filled: false
    };
    
    // Liste de rectangles à diviser
    const rectsToDivide = [initialRect];
    
    // Le nombre de divisions est influencé par le niveau de détail ET la densité
    const numDivisions = Math.floor((10 + patternVisibility * 20) * densityMultiplier);
    
    console.log(`🔄 ${numDivisions} divisions à effectuer`);
    
    // Diviser récursivement avec contrôle des ratios
    for (let i = 0; i < numDivisions && rectsToDivide.length > 0; i++) {
        // Choisir aléatoirement un rectangle non divisé
        const randomIndex = Math.floor(Math.random() * rectsToDivide.length);
        const rect = rectsToDivide.splice(randomIndex, 1)[0];
        
        // CONTRÔLE DU RATIO - Éviter les rectangles trop longs/étroits
        const ratio = rect.width / rect.height;
        const minSize = 60 * sizeMultiplier; // Taille minimum adaptée
        
        // Décider de la direction de division selon le ratio
        let shouldDivideHorizontally;
        
        if (ratio > 3.0) {
            // Trop large -> forcer division verticale
            shouldDivideHorizontally = true;
        } else if (ratio < 0.33) {
            // Trop haut -> forcer division horizontale  
            shouldDivideHorizontally = false;
        } else {
            // Ratio acceptable -> décision aléatoire
            shouldDivideHorizontally = Math.random() < 0.5;
        }
        
        // Vérifier que la division est possible
        const canDivideHorizontally = rect.width > minSize * 2;
        const canDivideVertically = rect.height > minSize * 2;
        
        if (shouldDivideHorizontally && canDivideHorizontally) {
            // Division verticale (ligne verticale)
            // Position de la division plus équilibrée
            const divideAt = rect.width * (0.35 + Math.random() * 0.3); // 35-65% au lieu de 30-70%
            
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
        else if (!shouldDivideHorizontally && canDivideVertically) {
            // Division horizontale (ligne horizontale)
            // Position de la division plus équilibrée
            const divideAt = rect.height * (0.35 + Math.random() * 0.3); // 35-65% au lieu de 30-70%
            
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
    
    console.log(`📦 ${rectangles.length} éléments générés (rectangles + lignes)`);
    
    // Sélectionner quelques rectangles pour être colorés
    // Augmenter le pourcentage pour avoir plus de couleurs
    const coloredRectCount = Math.floor(rectangles.length * (0.15 + patternVisibility * 0.15)); // 15-30% colorés
    
    // Exclure les lignes de division
    const fillableRects = rectangles.filter(r => !r.isLine);
    
    // Mélanger pour une sélection aléatoire
    const shuffled = [...fillableRects].sort(() => 0.5 - Math.random());
    
    // Sélectionner et marquer les rectangles à colorer
    for (let i = 0; i < coloredRectCount && i < shuffled.length; i++) {
        shuffled[i].filled = true;
        // Favoriser les couleurs primaires (rouge, bleu, jaune) par rapport au blanc
        const colorIndex = Math.random() < 0.8 ? Math.floor(Math.random() * 3) : 3; // 80% couleurs primaires, 20% blanc
        shuffled[i].fillColor = colors[colorIndex];
    }
    
    console.log(`🎨 ${coloredRectCount} rectangles colorés sur ${fillableRects.length} rectangles`);
    
    // Dessiner les rectangles et les lignes
    rectangles.forEach(rect => {
        if (rect.isLine) {
            // Dessiner une ligne de division
            const lineWidth = (2 + patternVisibility * 3) * sizeMultiplier;
            
            bgGroup.append("line")
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
                .attr("stroke-width", (2 + patternVisibility * 3) * sizeMultiplier);
            
            // Si le rectangle est coloré, l'ajouter à la liste des éléments animables
            if (rect.filled) {
                animatableRectangles.push({
                    element: rectElement,
                    rect: rect
                });
            }
        }
    });
    
    // Ajouter des animations si activées (désactivées pour export)
    if (animation) {
        console.log("🎬 Activation des animations Mondrian...");
        
        animatableRectangles.forEach((animRect, i) => {
            const delay = i * 0.1;
            const duration = (15 + Math.random() * 10) / animationSpeed;
            
            // Animation de couleur - transition lente entre différentes couleurs primaires
            if (i % 3 === 0) {
                const colorAnim = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                colorAnim.setAttribute("attributeName", "fill");
                colorAnim.setAttribute("values", `${animRect.rect.fillColor};${colors[(colors.indexOf(animRect.rect.fillColor) + 1) % colors.length]};${animRect.rect.fillColor}`);
                colorAnim.setAttribute("dur", `${duration}s`);
                colorAnim.setAttribute("repeatCount", "indefinite");
                colorAnim.setAttribute("begin", `${delay}s`);
                
                animRect.element.node().appendChild(colorAnim);
            }
            
            // Animation de léger déplacement - très subtile
            if (i % 4 === 0 && patternVisibility > 0.5) {
                const moveDistance = 2 * patternVisibility * sizeMultiplier;
                
                const moveAnim = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
                moveAnim.setAttribute("attributeName", "transform");
                moveAnim.setAttribute("type", "translate");
                moveAnim.setAttribute("values", `0,0; ${moveDistance},0; 0,0; ${-moveDistance},0; 0,0`);
                moveAnim.setAttribute("dur", `${duration * 1.5}s`);
                moveAnim.setAttribute("repeatCount", "indefinite");
                moveAnim.setAttribute("begin", `${delay}s`);
                
                animRect.element.node().appendChild(moveAnim);
            }
        });
    }
    
    console.log("✅ Génération du fond Mondrian terminée.");
}

async function setupParchmentBackgroundFixed(svg, customDimensions = null, forExport = false) {
    // Utiliser dimensions personnalisées ou écran
    const width = customDimensions ? customDimensions.width : window.innerWidth;
    const height = customDimensions ? customDimensions.height : window.innerHeight;
    const offsetX = customDimensions ? customDimensions.minX : 0;
    const offsetY = customDimensions ? customDimensions.minY : 0;

    let densityMultiplier = 1;
    let sizeMultiplier = 1;

    if (forExport) {
        const baseArea = 1920 * 1080;
        const currentArea = width * height;
        const areaRatio = currentArea / baseArea;
        
        // Pour parchemin : adapter la densité et taille des éléments
        densityMultiplier = Math.sqrt(areaRatio) * 0.8;
        sizeMultiplier = Math.min(3, Math.max(1.2, areaRatio * 0.1));
    }


    const defs = svg.append("defs");
    
    // Récupérer tous les paramètres et les afficher immédiatement
    const opacity = parseFloat(localStorage.getItem('backgroundOpacity') || 0.15);
    const patternVisibility = parseFloat(localStorage.getItem('patternVisibility') || 1.0);
    const animation = forExport ? false : localStorage.getItem('backgroundAnimation') === 'true';
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
        .attr("x", offsetX)
        .attr("y", offsetY)
        .attr("width", width)
        .attr("height", height)
        .attr("fill", parchmentBase.toString());
    
    // 1. Grandes variations de couleur - taches plus larges
    const numLargeVariations = Math.floor((30 + 50 * patternVisibility) * densityMultiplier);
    const largeVariations = [];
    
    for (let i = 0; i < numLargeVariations; i++) {
        const x = offsetX + Math.random() * width;
        const y = offsetY + Math.random() * height;
        const r = (Math.random() * 100 + 30) * sizeMultiplier;
        
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
    const numSmallVariations = Math.floor((500 + 2500 * patternVisibility) * densityMultiplier);
    
    for (let i = 0; i < numSmallVariations; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = Math.random() * 2 * sizeMultiplier;
        
        bgGroup.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", r)
            .attr("fill", parchmentDark.toString())
            .attr("opacity", Math.random() * 0.3 + 0.1);
    }
    
    // 3. Ajouter quelques lignes pour simuler des plis
    const numFolds = Math.floor((3 + 7 * patternVisibility)* densityMultiplier);
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
            .attr("stroke-width", 1.5 * sizeMultiplier)
            .attr("opacity", 0.4);
        
        folds.push({ element, x1, y1, x2, y2 });
    }
    
    // 4. Ajouter quelques taches de vieillissement
    const numStains = Math.floor((5 + 10 * patternVisibility)* densityMultiplier);
    const stains = [];
    
    for (let i = 0; i < numStains; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 60 + 20 * sizeMultiplier;
        
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
        .attr("x", offsetX)
        .attr("y", offsetY)
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
async function setupGridBackgroundFixed(svg, customDimensions = null, forExport = false) {
    // Utiliser les dimensions personnalisées ou celles de l'écran
    const width = customDimensions ? customDimensions.width : window.innerWidth;
    const height = customDimensions ? customDimensions.height : window.innerHeight;
    const offsetX = customDimensions ? customDimensions.minX : 0;
    const offsetY = customDimensions ? customDimensions.minY : 0;

    console.log(`🎨 Setup background: ${width}x${height} (offset: ${offsetX}, ${offsetY})`);

    const defs = svg.select("defs").empty() ? svg.append("defs") : svg.select("defs");

    // Nettoyer tout fond existant
    svg.selectAll(".background-element").remove();

    // Créer un groupe pour le fond
    const bgGroup = svg.append("g")
        .attr("class", "background-element")
        .attr("pointer-events", "none")
        .lower();

    // Fond de base légèrement bleuté
    bgGroup.append("rect")
        .attr("x", offsetX)
        .attr("y", offsetY)
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#f0f0f5");

    // Taille de la grille
    const gridSize = 50;

    // Dessiner les lignes horizontales
    for (let y = Math.floor(offsetY / gridSize) * gridSize; y <= offsetY + height; y += gridSize) {
        bgGroup.append("line")
            .attr("x1", offsetX)
            .attr("y1", y)
            .attr("x2", offsetX + width)
            .attr("y2", y)
            .attr("stroke", "#c8d0e0")
            .attr("stroke-width", 1);
    }

    // Dessiner les lignes verticales
    for (let x = Math.floor(offsetX / gridSize) * gridSize; x <= offsetX + width; x += gridSize) {
        bgGroup.append("line")
            .attr("x1", x)
            .attr("y1", offsetY)
            .attr("x2", x)
            .attr("y2", offsetY + height)
            .attr("stroke", "#c8d0e0")
            .attr("stroke-width", 1);
    }

    // Ajouter un point aux intersections
    for (let x = Math.floor(offsetX / gridSize) * gridSize; x <= offsetX + width; x += gridSize) {
        for (let y = Math.floor(offsetY / gridSize) * gridSize; y <= offsetY + height; y += gridSize) {
            bgGroup.append("circle")
                .attr("cx", x)
                .attr("cy", y)
                .attr("r", 1.5)
                .attr("fill", "#a8b8d0");
        }
    }

}

// Fond avec bulles transparentes et brillantes avec tous les paramètres utilisateur
async function setupBubblesBackground(svg, customDimensions = null, forExport = false) {
    // Utiliser les dimensions personnalisées ou celles de l'écran
    const width = customDimensions ? customDimensions.width : window.innerWidth;
    const height = customDimensions ? customDimensions.height : window.innerHeight;
    const offsetX = customDimensions ? customDimensions.minX : 0;
    const offsetY = customDimensions ? customDimensions.minY : 0;
    console.log(`🎨 Setup background: ${width}x${height} (offset: ${offsetX}, ${offsetY}) - Export: ${forExport}`);

    const defs = svg.append("defs");
    
    // Récupérer tous les paramètres
    const opacity = parseFloat(localStorage.getItem('backgroundOpacity') || 0.15);
    const patternVisibility = parseFloat(localStorage.getItem('patternVisibility') || 1.0);
    const animation = localStorage.getItem('backgroundAnimation') === 'true';
    const animationSpeed = parseFloat(localStorage.getItem('animationSpeed') || 1.0);
    const customColor = localStorage.getItem('backgroundCustomColor') || '#3F51B5';
    
    console.log("PARAMÈTRES BULLES de setupBubblesBackground :", {
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
        .attr("x", offsetX)
        .attr("y", offsetY)
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
        const x = offsetX + Math.random() * width;
        const y = offsetY + Math.random() * height;
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
                const ampX = Math.min(Math.min(width, window.innerWidth) * 0.05, bubble.r * 2) * patternVisibility;
                const ampY = Math.min(Math.min(height, window.innerHeight) * 0.05, bubble.r * 2) * patternVisibility;
                
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
                const floatHeight = Math.min(Math.min(50, Math.min(width, height) * 0.05), bubble.r) * patternVisibility;
                
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
async function setupPoppingBubblesBackground(svg) {
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
export async function setupElegantBackground(svg, customDimensions = null, forExport = false) {

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
                await setupPollockBackground(svg, customDimensions, forExport);
                break;
            case 'kandinsky':
                await setupKandinskyBackground(svg, customDimensions, forExport);
                break;
            case 'miro':
                await setupMiroBackground(svg, customDimensions, forExport);
                break;
            case 'mondrian':
                await setupMondrianBackground(svg, customDimensions, forExport);
                break;
            case 'treeBranches':
                await setupTreeBranchesBackground(svg, customDimensions, forExport);
                break;
            case 'fallingLeaves':
                await setupFallingLeavesBackground(svg, customDimensions, forExport);
                break;
            case 'growingTree':
                await setupGrowingTreeBackground(svg, customDimensions, forExport);
                break;
            case 'simpleBackground':
                await setupSimpleBackground(svg, customDimensions, forExport);
                break;
            case 'parchment':
                await setupParchmentBackgroundFixed(svg, customDimensions, forExport);
                break;
            case 'grid':
                await setupGridBackgroundFixed(svg, customDimensions, forExport);
                break;
            case 'paperTexture':
                await setupPaperTextureBackground(svg, customDimensions, forExport);
                break;
            case 'curvedLines':
                await setupCurvedLinesBackground(svg, customDimensions, forExport);
                break;
            case 'treeRings':
                await setupTreeRingsBackground(svg, customDimensions, forExport);
                break;
            case 'fractal':
                await setupFractalBackground(svg, customDimensions, forExport);
                break;
            case 'organicPattern':
                await setupOrganicPatternBackground(svg, customDimensions, forExport);
                break;
            case 'artDeco':
                await setupArtDecoBackground(svg, customDimensions, forExport);
                break;
            case 'bubbles':
                await setupBubblesBackground(svg, customDimensions, forExport);
                break;
            case 'poppingBubbles':
                if (forExport) { await setupBubblesBackground(svg, customDimensions, forExport);}
                else {await setupPoppingBubblesBackground(svg);}
                break;
            case 'customImage':
                const imagePath = localStorage.getItem('customImagePath');
                await setupCustomImageBackground(svg, imagePath, customDimensions, forExport);
                break;
            case 'none':
                enableBackground(false);
                // Ne rien faire, pas de fond
                break;
            default:
                // Fallback sur un fond par défaut
                // setupPoppingBubblesBackground(svg);
                await setupGrowingTreeBackground(svg);
            }
        } else {
            // Comportement par défaut si aucune préférence n'est sauvegardée
            await setupTreeBranchesBackground(svg);
        }
    }
}

export async function setupCustomImageBackground(svg, imagePath, customDimensions = null, forExport = false) {
    console.log("Configuration du fond avec une image personnalisée:", imagePath);
    const width = customDimensions ? customDimensions.width : window.innerWidth;
    const height = customDimensions ? customDimensions.height : window.innerHeight;
    const offsetX = customDimensions ? customDimensions.minX : 0;
    const offsetY = customDimensions ? customDimensions.minY : 0;
    console.log(`🎨 Setup image background: ${width}x${height} (offset: ${offsetX}, ${offsetY}) - Export: ${forExport}`);
    
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
    // let container = document.querySelector('.background-container');
    // if (!container) {
    //     container = document.createElement('div');
    //     container.className = 'background-container';
    //     document.body.insertBefore(container, document.body.firstChild);
    // } else {
    //     // Vider le conteneur existant
    //     container.innerHTML = '';
    // }


    // // Remplacer la section du conteneur par :
    let container;
    if (forExport) {
        // Pour l'export, utiliser directement le SVG
        container = svg.node();
    } else {
        // Pour l'affichage normal, utiliser le conteneur DOM
        container = document.querySelector('.background-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'background-container';
            document.body.insertBefore(container, document.body.firstChild);
        } else {
            container.innerHTML = '';
        }
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
    if (animation && !forExport) {
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
    if (animation && !forExport) {
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
    









    // // Créer un élément SVG qui contiendra l'image
    // const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    // svgElement.setAttribute("width", "100%");
    // svgElement.setAttribute("height", "100%");
    // svgElement.style.display = "block";
    
    // // Créer l'élément image dans le SVG
    // const imgElement = document.createElementNS("http://www.w3.org/2000/svg", "image");
    // imgElement.setAttribute("href", imagePath);
    // imgElement.setAttribute("width", "100%");
    // imgElement.setAttribute("height", "100%");
    // imgElement.setAttribute("preserveAspectRatio", "xMidYMid slice");
    // imgElement.style.opacity = opacity;
    // imgElement.setAttribute("filter", `url(#${filterId})`);
    
    // // Gestionnaire d'événements pour l'image chargée
    // imgElement.onload = function() {
    //     console.log("Image chargée avec succès:", imagePath);
    // };
    
    // // Gestionnaire d'événements pour les erreurs de chargement
    // imgElement.onerror = function() {
    //     console.error(`Impossible de charger l'image: ${imagePath}`);
    //     imgElement.style.display = 'none';
        
    //     // Afficher un message à l'utilisateur
    //     if (window.showToast) {
    //         window.showToast(`Erreur: Impossible de charger l'image ${imagePath}`, 3000);
    //     }
    // };
    
    // // Ajouter l'image au SVG, le SVG au conteneur d'image, et le conteneur d'image au conteneur principal
    // svgElement.appendChild(imgElement);
    // imgContainer.appendChild(svgElement);
    // container.appendChild(imgContainer);


    if (forExport) {
        // Pour l'export, créer directement dans le SVG
        const defs = svg.select("defs").empty() ? svg.append("defs") : svg.select("defs");
        
        // Créer le filtre directement dans le SVG
        const filterId = `image-color-filter-${Date.now()}`;
        const filter = defs.append("filter").attr("id", filterId);
        
        const rgb = hexToRgb(customColor);
        filter.append("feColorMatrix")
            .attr("type", "matrix")
            .attr("values", `
                ${0.7 + 0.3 * rgb.r} ${0.3 * rgb.g} ${0.3 * rgb.b} 0 0
                ${0.3 * rgb.r} ${0.7 + 0.3 * rgb.g} ${0.3 * rgb.b} 0 0
                ${0.3 * rgb.r} ${0.3 * rgb.g} ${0.7 + 0.3 * rgb.b} 0 0
                0 0 0 1 0
            `);
        
        filter.append("feGaussianBlur")
            .attr("stdDeviation", "0.5");
        
        // Créer l'image dans le SVG avec les dimensions personnalisées
        bgGroup.append("image")
            .attr("href", imagePath)
            .attr("x", offsetX)
            .attr("y", offsetY)
            .attr("width", width)
            .attr("height", height)
            .attr("preserveAspectRatio", "xMidYMid slice")
            .style("opacity", opacity)
            .attr("filter", `url(#${filterId})`);
        
        // SOLUTION SIMPLE : Retourner true directement
        // L'image se chargera automatiquement dans le SVG
        return true;
            
    } else {


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

        return true;
    }









    
    console.log("Image ajoutée au conteneur de fond d'écran avec:", {
        opacité: opacity,
        couleur: customColor,
        animation: animation ? "activée" : "désactivée",
        vitesseAnimation: animationSpeed
    });
    
    return true; // Indiquer que l'opération a réussi
}