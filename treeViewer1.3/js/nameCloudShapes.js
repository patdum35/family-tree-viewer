import { nameCloudState } from './nameCloud.js'
import { computeFontScale } from './nameCloudRenderer.js'


export function createShapePath(shape, width, height, scale = 1.0) {
    // Appeler la fonction appropriée selon la forme
    switch (shape) {
        case 'coeur':
            return createHeartPath(width, height, scale);
        case 'etoile':
            return createStarPath(width, height, scale);
        case 'arabesque':
            return createArabesquePath(width, height, scale);
        case 'A':
            return createLetterAPath(width, height, scale);
        case 'M':
            return createLetterMPath(width, height, scale);
        case 'puzzle':
            return createPuzzlePath(width, height, scale);
        case 'nuage':
            return createCloudPath(width, height, scale);
        case 'arbre':
            return createTreePath(width, height, scale);
        case 'carte':
            return createCardPath(width, height, scale);
        case 'ampoule':
            return createBulbPath(width, height, scale);
        case 'cerveau':
            return createBrainPath(width, height, scale);
        case 'maison':
            return createHousePath(width, height, scale);
        case 'ballon':
            return createBalloonPath(width, height, scale);
        default:
            return createRectanglePath(scaledWidth, scaledHeight);
    }
}


export function createShapeMatrix() {
    // Appeler la fonction appropriée selon la forme
    switch (nameCloudState.cloudShape) {
        case 'coeur':
            return createHeartShapeMatrix();
        case 'etoile':
            return createStarShapeMatrix();
        case 'arabesque':
            return createArabesqueShapeMatrix();
        default:
            return createRectangleShapeMatrix();
    }
}


let minX, maxX, minY, maxY;
function computeShapeLimits()
{
    // Appeler la fonction appropriée selon la forme
    switch (nameCloudState.cloudShape) {
        case 'coeur':
            return computeHeartLimits();
        case 'etoile':
            return computeStarLimits();
        case 'arabesque':
            return computeArabesqueLimits();
        default:
            return computeRectangleLimits();
    }

}




let globalShapeMap= null;
let verylargeWordThreshold = 75;
let largeWordThreshold = 34;
let mediumWordThreshold = 24;
let standardThreshold = 17;

// ================ FORME DE CŒUR ================
export function createHeartPath(width, height, scale) {
    // const heartWidth = width * scale * 0.92;
    // const heartHeight = heartWidth ; //height * scale * 0.92;
    const heartZize = Math.min(width, height);
    const heartWidth = heartZize * scale * 0.8;
    const heartHeight = heartZize * scale * 0.8;
    

    const centerX = 0;
    const centerY = 0;
    
    const numPoints = 200;
    const angleStep = 2 * Math.PI / numPoints;
    
    const pathPoints = [];
    for (let i = 0; i < numPoints; i++) {
        const t = i * angleStep;
        
        // Équation paramétrique du cœur
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
        
        // Normaliser et centrer
        const posX = x * (heartWidth / 32) + centerX;
        const posY = y * (heartHeight / 32) + centerY;
        
        pathPoints.push([posX, posY]);
    }
    
    // Créer la chaîne de points pour le chemin SVG
    let pathString = `M ${pathPoints[0][0]},${pathPoints[0][1]}`;
    for (let i = 1; i < pathPoints.length; i++) {
        pathString += ` L ${pathPoints[i][0]},${pathPoints[i][1]}`;
    }
    pathString += ' Z'; // Fermer le chemin
    

    // // Calculer et stocker la shape maps si elle n'existe pas
    // if (scale === 1.0) { 
    //     globalShapeMap = createHeartShapeMatrix() 
    //     computeHeartLimits();
    //     console.log("DEBUG scale=", scale ,", minX, maxX, minY, maxY=  ", minX, maxX, minY, maxY, 0.6 , nameCloudState.paddingLocal, Math.max(0.1, (20 - nameCloudState.paddingLocal)/10))

    // }

    return pathString;
}

export function createHeartShapeMatrix() {

    console.log(`Calcul de la shapeMap `);
    const matrixSize = 100;
    const shapeMap = Array.from({ length: matrixSize }, () => 
        Array(matrixSize).fill(0)
    );

    // Générer les points du cœur
    const numPoints = 200;
    const angleStep = 2 * Math.PI / numPoints;
    
    // Fonction pour calculer un point du cœur
    const getHeartPoint = (t) => {
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
        return { x, y };
    };

    // Trouver les bornes pour normaliser précisément
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    const boundPoints = [];
    
    for (let i = 0; i < numPoints; i++) {
        const t = i * angleStep;
        const point = getHeartPoint(t);
        
        minX = Math.min(minX, point.x);
        maxX = Math.max(maxX, point.x);
        minY = Math.min(minY, point.y);
        maxY = Math.max(maxY, point.y);
        
        boundPoints.push(point);
    }

    // Remplir la matrice
    const mapWidth = matrixSize;
    const mapHeight = matrixSize;
    
    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
            // // Normaliser x et y pour correspondre à l'espace du cœur
            const nx = minX + (x / (mapWidth - 1)) * (maxX - minX);
            const ny = minY + (y / (mapHeight - 1)) * (maxY - minY);

            // Tester si le point est dans le cœur
            let inside = false;
            for (let i = 0, j = boundPoints.length - 1; i < boundPoints.length; j = i++) {
                const pi = boundPoints[i];
                const pj = boundPoints[j];
                
                if (((pi.y > ny) !== (pj.y > ny)) &&
                    (nx < (pj.x - pi.x) * (ny - pi.y) / (pj.y - pi.y) + pi.x)) {
                    inside = !inside;
                }
            }
            
            // Points du contour et l'intérieur
            if (inside) {
                shapeMap[y][x] = 1;
            }
        }
    }

    return shapeMap;
}


function computeHeartLimits()
{
   // Calculer les bornes du cœur
   const heartPoints = [];
   const numPoints = 200;
   const angleStep = 2 * Math.PI / numPoints;
   
   for (let i = 0; i < numPoints; i++) {
       const t = i * angleStep;
       const x = 16 * Math.pow(Math.sin(t), 3);
       const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
       heartPoints.push({ x, y });
   }
   
   minX = Math.min(...heartPoints.map(p => p.x));
   maxX = Math.max(...heartPoints.map(p => p.x));
   minY = Math.min(...heartPoints.map(p => p.y));
   maxY = Math.max(...heartPoints.map(p => p.y));

}

export function isPointInHeart(x, y, centerX, centerY, width, height, scaleFactor = 1.0) {

    // const heartWidth = width * 0.92 * scaleFactor;
    // const heartHeight = height * 0.92 * scaleFactor;

    const heartZize = Math.min(width, height);
    const heartWidth = heartZize * scaleFactor * 0.8;
    const heartHeight = heartZize * scaleFactor * 0.8;

        
    // Normaliser les coordonnées du point
    let nx, ny ;

    nx = (x - centerX) / (heartWidth / (32));
    ny = (y - centerY) / (heartHeight / 32);

    // Convertir en coordonnées de matrice
    const matrixSize = 100;
    const mx = Math.floor(
        ((nx - minX) / (maxX - minX)) * (matrixSize - 1)
    );
    const my = Math.floor(
        ((ny - minY) / (maxY - minY)) * (matrixSize - 1)
    );
    
    // Sélectionner la  shapeMap 
    const currentShapeMap = globalShapeMap;

    // Vérifier si les coordonnées sont dans la matrice
    if (currentShapeMap && mx >= 0 && mx < matrixSize && my >= 0 && my < matrixSize) {
        return currentShapeMap[my][mx] === 1;
    }

    return false;
}



// ================ FORME DE DEBUG  ================
export function debugShapeBoundaries(textGroup, shape, width, height) {
    console.log('DEBUG: Generating boundary visualization points for shape:', shape);

    const centerX = 0;
    const centerY = 0;
    
    const pointsPerZone = 6000;
    const debugPoints = [];
    
    const zones = [
        { zone: "50%", color: 'blue', minFactor: 0, maxFactor: 0.5 },
        { zone: "75%", color: 'green', minFactor: 0.5, maxFactor: 0.75 },
        { zone: "100%", color: 'red', minFactor: 0.75, maxFactor: 1.0 }
    ];
    
    zones.forEach(zoneInfo => {
        for (let i = 0; i < pointsPerZone; i++) {
            const angle = Math.random() * 2 * Math.PI;
            const maxDist = Math.max(width, height) / 2;
            
            const radiusFactor = zoneInfo.minFactor + 
                Math.random() * (zoneInfo.maxFactor - zoneInfo.minFactor);
            const radius = maxDist * radiusFactor;
            
            const scaleFactor = {
                "50%": 0.5,
                "75%": 0.75,
                "100%": 1.0
            }[zoneInfo.zone];

            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            const isInShape = isPointInZone(x, y, shape, zoneInfo.zone, centerX, centerY, width, height)
            
            if (isInShape) {
                debugPoints.push({ x, y, color: zoneInfo.color });
            }
        }
    });
    
    debugPoints.forEach(point => {
        textGroup.append('circle')
            .attr('cx', point.x)
            .attr('cy', point.y)
            .attr('r', 1.5)
            .attr('fill', point.color)
            .attr('opacity', 0.6);
    });
    
    console.log(`Added ${debugPoints.length} debug points to visualize heart boundaries`);
}




// ================ FORME DE RECTANGLE  ================
export function createRectangleShapeMatrix() {
    // console.log(`Calcul de la shapeMap `);
    const matrixSize = 100;
    const shapeMap = Array.from({ length: matrixSize }, () => 
        Array(matrixSize).fill(0)
    );
    // to do  
    return shapeMap;
}

function computeRectangleLimits()
{
    // to do  
}


// ================ FORME D'ÉTOILE ================
// Fonction pour générer le chemin SVG d'une étoile avec des branches plus larges
export function createStarPath(width, height, scale) {
    const starWidth = width * scale * 0.92;
    const starHeight = height * scale * 0.92;
    const centerX = 0;
    const centerY = 0;
    
    // Paramètres pour une étoile aux branches plus larges
    const numPoints = 16; // Plus de points pour des branches plus douces
    const maxRadius = Math.min(starWidth, starHeight) / 2;
    const outerRadius = maxRadius;
    const innerRadius = maxRadius * 0.55; // Rapport plus élevé pour des branches plus larges
    const midRadius = maxRadius * 0.75; // Rayon intermédiaire pour adoucir
    
    // Angle d'inclinaison (en radians)
    const rotation = Math.PI / 115;  // Environ 18 degrés d'inclinaison
    
    let pathPoints = [];
    
    // Créer une étoile à 5 branches avec des courbes plus douces
    for (let i = 0; i < 5; i++) {
        const baseAngle = (i * 2 * Math.PI / 5) + rotation;
        
        // Point externe (sommet de branche)
        const outerX = centerX + outerRadius * Math.cos(baseAngle);
        const outerY = centerY + outerRadius * Math.sin(baseAngle);
        pathPoints.push([outerX, outerY]);
        
        // Point intermédiaire droit
        const midAngle1 = baseAngle + Math.PI / 10;
        const midX1 = centerX + midRadius * Math.cos(midAngle1);
        const midY1 = centerY + midRadius * Math.sin(midAngle1);
        pathPoints.push([midX1, midY1]);
        
        // Point interne (creux)
        const innerAngle = baseAngle + Math.PI / 5;
        const innerX = centerX + innerRadius * Math.cos(innerAngle);
        const innerY = centerY + innerRadius * Math.sin(innerAngle);
        pathPoints.push([innerX, innerY]);
        
        // Point intermédiaire gauche
        const midAngle2 = baseAngle + Math.PI / 5 * 2 - Math.PI / 10;
        const midX2 = centerX + midRadius * Math.cos(midAngle2);
        const midY2 = centerY + midRadius * Math.sin(midAngle2);
        pathPoints.push([midX2, midY2]);
    }
    
    // Créer la chaîne de points pour le chemin SVG
    let pathString = `M ${pathPoints[0][0]},${pathPoints[0][1]}`;
    for (let i = 1; i < pathPoints.length; i++) {
        pathString += ` L ${pathPoints[i][0]},${pathPoints[i][1]}`;
    }
    pathString += ' Z'; // Fermer le chemin
    
    return pathString;
}

// Fonction pour créer la matrice de forme en étoile
export function createStarShapeMatrix() {
    // console.log(`Calcul de la shapeMap pour l'étoile`);
    const matrixSize = 100;
    const shapeMap = Array.from({ length: matrixSize }, () => 
        Array(matrixSize).fill(0)
    );

    // Générer les points de l'étoile
    const numPoints = 10; // 5 branches = 10 points (5 externes + 5 internes)
    
    // Fonction pour calculer un point de l'étoile
    const getStarPoint = (index) => {
        // Rayons externe et interne
        const outerRadius = 1.0;
        const innerRadius = 0.4; // Rapport entre rayons interne et externe
        
        // Alternance entre rayon externe et interne
        const radius = index % 2 === 0 ? outerRadius : innerRadius;
        
        // Angle calculé pour une répartition uniforme des points
        const points = numPoints / 2; // Nombre de branches
        const angle = (index * Math.PI / points) - Math.PI / 2; // -PI/2 pour commencer par le haut
        
        // Coordonnées du point
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        
        return { x, y };
    };

    // Collecter tous les points pour définir les limites
    const starPoints = [];
    for (let i = 0; i < numPoints; i++) {
        starPoints.push(getStarPoint(i));
    }

    // Trouver les bornes pour normaliser
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    
    starPoints.forEach(point => {
        minX = Math.min(minX, point.x);
        maxX = Math.max(maxX, point.x);
        minY = Math.min(minY, point.y);
        maxY = Math.max(maxY, point.y);
    });

    // Remplir la matrice
    for (let y = 0; y < matrixSize; y++) {
        for (let x = 0; x < matrixSize; x++) {
            // Normaliser x et y pour correspondre à l'espace de l'étoile
            const nx = minX + (x / (matrixSize - 1)) * (maxX - minX);
            const ny = minY + (y / (matrixSize - 1)) * (maxY - minY);

            // Vérifier si le point est dans l'étoile en utilisant la méthode ray casting
            let inside = isPointInPolygon(nx, ny, starPoints);
            
            if (inside) {
                shapeMap[y][x] = 1;
            }
        }
    }

    return shapeMap;
}

// Fonction pour calculer les limites de l'étoile
export function computeStarLimits() {
    const numPoints = 10;
    const starPoints = [];
    
    for (let i = 0; i < numPoints; i++) {
        // Rayons externe et interne
        const outerRadius = 1.0;
        const innerRadius = 0.4;
        
        // Alternance entre rayon externe et interne
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        
        // Angle calculé pour une répartition uniforme des points
        const points = numPoints / 2; // Nombre de branches
        const angle = (i * Math.PI / points) - Math.PI / 2;
        
        // Coordonnées du point
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        
        starPoints.push({ x, y });
    }
    
    // Calculer les limites
    minX = Math.min(...starPoints.map(p => p.x));
    maxX = Math.max(...starPoints.map(p => p.x));
    minY = Math.min(...starPoints.map(p => p.y));
    maxY = Math.max(...starPoints.map(p => p.y));
}

// Fonction corrigée pour vérifier si un point est dans l'étoile
export function isPointInStar(x, y, centerX, centerY, width, height, scaleFactor = 1.0) {
    // Adapter les dimensions
    const starWidth = width * 0.92 * scaleFactor;
    const starHeight = height * 0.92 * scaleFactor;
    const radius = Math.min(starWidth, starHeight) / 2;
    
    // Normaliser les coordonnées
    const nx = (x - centerX) / radius;
    const ny = (y - centerY) / radius;
    
    // Convertir en coordonnées polaires
    const r = Math.sqrt(nx*nx + ny*ny);
    let theta = Math.atan2(ny, nx);
    
    // Normaliser theta pour qu'il soit entre 0 et 2*PI
    if (theta < 0) theta += 2 * Math.PI;
    
    // Calculer l'angle normalisé dans un segment de l'étoile (1/5 de cercle)
    const segmentAngle = Math.PI * 2 / 5; // 5 branches
    const normalizedAngle = theta % segmentAngle;
    const angleRatio = normalizedAngle / segmentAngle;
    
    // Déterminer si on est sur une pointe ou dans un creux
    let currentRadius;
    if (angleRatio < 0.5) {
        // Interpolation linéaire entre le rayon externe et interne
        currentRadius = 1.0 - (1.0 - 0.4) * (angleRatio * 2);
    } else {
        // Interpolation linéaire entre le rayon interne et externe
        currentRadius = 0.4 + (1.0 - 0.4) * ((angleRatio - 0.5) * 2);
    }
    
    // Le point est à l'intérieur si son rayon est inférieur au rayon calculé
    return r <= currentRadius * scaleFactor;
}

// Fonction utilitaire pour vérifier si un point est dans un polygone (méthode ray casting)
function isPointInPolygon(x, y, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x, yi = polygon[i].y;
        const xj = polygon[j].x, yj = polygon[j].y;
        
        const intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}



// ================ FORME DE PORTE MAROCAINE ARABESQUE ================


// // Fonction pour générer le chemin SVG de la porte Type 1
// export function createArabesquePath(width, height, scale) {
//     const doorWidth = width * scale* 0.92;
//     const doorHeight = height *scale * 0.75; // Réduite pour éviter le débordement
//     const centerX = 0; //width / 2;
//     const centerY = 0; //height / 2;
    
//     // Paramètres ajustables
//     const baseWidth = doorWidth * 0.65;
//     const topLobeSize = 0.40;
//     const bottomLobeSize = 0.50;
//     const lobeOverlap = 0.15;
    
//     // Calculs des dimensions
//     const doorBottom = centerY + doorHeight/2 * 0.9;
//     const rectHeight = doorHeight * 0.6;
//     const arcStart = doorBottom - rectHeight;
    
//     // Paramètres des cercles
//     const topLobeRadius = (baseWidth/2) * (1 + topLobeSize * 0.5);
//     const bottomLobeRadius = (baseWidth/2) * (1 + bottomLobeSize * 0.5);
    
//     // Positions des centres des cercles
//     const topLobeY = arcStart - topLobeRadius * (1 - lobeOverlap) * 0.9;
//     const bottomLobeY = arcStart - bottomLobeRadius * lobeOverlap * 0.9;
    
//     // Points pour la base de la porte
//     const leftBase = centerX - baseWidth/2;
//     const rightBase = centerX + baseWidth/2;
    
//     // Calculer le point où l'arc rejoint le côté vertical
//     function calculateJoinY(circleCenterX, circleCenterY, radius, sideX) {
//         const dx = Math.abs(circleCenterX - sideX);
//         if (dx > radius) return arcStart;
//         const dy = Math.sqrt(Math.pow(radius, 2) - Math.pow(dx, 2));
//         return circleCenterY + dy;
//     }
    
//     const joinY1 = calculateJoinY(centerX, topLobeY, topLobeRadius, leftBase);
//     const joinY2 = calculateJoinY(centerX, bottomLobeY, bottomLobeRadius, leftBase);
//     const joinY = Math.max(joinY1, joinY2);
    
//     // Créer le chemin SVG
//     let pathString = `M ${leftBase},${doorBottom}`;
//     pathString += ` L ${leftBase},${joinY}`;
//     pathString += ` A ${bottomLobeRadius} ${bottomLobeRadius} 0 0 1 ${centerX},${bottomLobeY - bottomLobeRadius}`;
//     pathString += ` A ${bottomLobeRadius} ${bottomLobeRadius} 0 0 1 ${rightBase},${joinY}`;
//     pathString += ` L ${rightBase},${doorBottom}`;
//     pathString += ` Z`;
    
//     return pathString;
// }


// Fonction pour générer le chemin SVG d'une arabesque (porte marocaine)
export function createArabesquePath(width, height, scale) {
    const arabesqueWidth = width * scale * 0.92;
    const arabesqueHeight = height * scale * 0.92;
    const centerX = 0;
    const centerY = 0;

    // Dimensions et paramètres de la porte
    const baseWidth = arabesqueWidth * 0.65;
    const doorHeight = arabesqueHeight * 0.75;
    const arcHeight = doorHeight * 0.45;
    
    // Points clés
    const leftBase = centerX - baseWidth/2;
    const rightBase = centerX + baseWidth/2;
    const doorBottom = centerY + doorHeight/2 * 0.9;
    const arcStart = doorBottom - (doorHeight - arcHeight);
    
    // Calcul des rayons pour les arcs
    const arcWidth = baseWidth;
    const arcRadius = (arcWidth * arcWidth + arcHeight * arcHeight) / (2 * arcHeight);
    const arcCenterY = arcStart - arcRadius + arcHeight;
    
    // Créer le chemin SVG
    let pathString = `M ${leftBase},${doorBottom}`; // Point de départ en bas à gauche
    pathString += ` L ${leftBase},${arcStart}`; // Ligne verticale gauche
    
    // Grand arc formant le haut de la porte
    pathString += ` A ${arcRadius} ${arcRadius} 0 0 1 ${rightBase} ${arcStart}`;
    
    // Ligne verticale droite et ligne horizontale du bas
    pathString += ` L ${rightBase},${doorBottom}`;
    pathString += ` Z`; // Fermer le chemin
    
    return pathString;
}

// Fonction pour créer la matrice de forme d'arabesque
export function createArabesqueShapeMatrix() {
    // console.log(`Calcul de la shapeMap pour l'arabesque`);
    const matrixSize = 100;
    const shapeMap = Array.from({ length: matrixSize }, () => 
        Array(matrixSize).fill(0)
    );

    // Paramètres de l'arabesque
    const baseWidthRatio = 0.65; // Largeur de la base par rapport à la largeur totale
    const doorHeightRatio = 0.75; // Hauteur de la porte par rapport à la hauteur totale
    const arcHeightRatio = 0.45; // Hauteur de l'arc par rapport à la hauteur de la porte
    
    // Dimensions normalisées (entre -1 et 1)
    const baseWidth = baseWidthRatio * 2; // *2 pour avoir une échelle entre -1 et 1
    const doorHeight = doorHeightRatio * 2;
    const arcHeight = arcHeightRatio * doorHeight;
    
    // Points clés normalisés
    const leftBase = -baseWidth/2;
    const rightBase = baseWidth/2;
    const doorBottom = doorHeight/2;
    const arcStart = doorBottom - (doorHeight - arcHeight);
    
    // Calcul du rayon de l'arc
    const arcWidth = baseWidth;
    const arcRadius = (arcWidth * arcWidth + arcHeight * arcHeight) / (2 * arcHeight);
    const arcCenterY = arcStart - arcRadius + arcHeight;
    
    // Trouver les bornes
    const minX = leftBase;
    const maxX = rightBase;
    const minY = -doorHeight/2; // Approximation du point le plus haut
    const maxY = doorBottom;
    
    // Remplir la matrice
    for (let y = 0; y < matrixSize; y++) {
        for (let x = 0; x < matrixSize; x++) {
            // Normaliser x et y pour correspondre à l'espace de l'arabesque
            const nx = minX + (x / (matrixSize - 1)) * (maxX - minX);
            const ny = minY + (y / (matrixSize - 1)) * (maxY - minY);
            
            // Vérifier si le point est dans l'arabesque
            const inside = isPointInArabesqueNormalized(nx, ny, leftBase, rightBase, doorBottom, arcStart, arcRadius, arcCenterY);
            
            if (inside) {
                shapeMap[y][x] = 1;
            }
        }
    }

    return shapeMap;
}

// Fonction pour calculer les limites de l'arabesque
export function computeArabesqueLimits() {
    // Paramètres de l'arabesque
    const baseWidthRatio = 0.65;
    const doorHeightRatio = 0.75;
    const arcHeightRatio = 0.45;
    
    // Dimensions normalisées
    const baseWidth = baseWidthRatio * 2;
    const doorHeight = doorHeightRatio * 2;
    const arcHeight = arcHeightRatio * doorHeight;
    
    // Calculer les limites
    minX = -baseWidth/2;
    maxX = baseWidth/2;
    maxY = doorHeight/2;
    
    // Calculer le point le plus haut de l'arc (approximation)
    const arcStart = maxY - (doorHeight - arcHeight);
    const arcWidth = baseWidth;
    const arcRadius = (arcWidth * arcWidth + arcHeight * arcHeight) / (2 * arcHeight);
    const arcCenterY = arcStart - arcRadius + arcHeight;
    minY = arcCenterY - arcRadius;
}

// Fonction pour vérifier si un point est à l'intérieur d'une arabesque
export function isPointInArabesque(x, y, centerX, centerY, width, height, scaleFactor = 1.0) {
    // Adapter les dimensions
    const arabesqueWidth = width * 0.92 * scaleFactor;
    const arabesqueHeight = height * 0.92 * scaleFactor;
    
    // Paramètres de l'arabesque
    const baseWidth = arabesqueWidth * 0.65;
    const doorHeight = arabesqueHeight * 0.75;
    const arcHeight = doorHeight * 0.45;
    
    // Points clés
    const leftBase = centerX - baseWidth/2;
    const rightBase = centerX + baseWidth/2;
    const doorBottom = centerY + doorHeight/2 * 0.9;
    const arcStart = doorBottom - (doorHeight - arcHeight);
    
    // Calcul du rayon de l'arc
    const arcWidth = baseWidth;
    const arcRadius = (arcWidth * arcWidth + arcHeight * arcHeight) / (2 * arcHeight);
    const arcCenterY = arcStart - arcRadius + arcHeight;

    // Vérifier si le point est dans la partie rectangulaire (en bas)
    if (y >= arcStart && y <= doorBottom && x >= leftBase && x <= rightBase) {
        return true;
    }
    
    // Vérifier si le point est dans la partie en arc (en haut)
    if (y < arcStart) {
        // Calculer la distance entre le point et le centre de l'arc
        const distanceToArcCenter = Math.sqrt(
            Math.pow(x - centerX, 2) + 
            Math.pow(y - arcCenterY, 2)
        );
        
        // Le point est dans l'arc si sa distance au centre est inférieure au rayon
        if (distanceToArcCenter <= arcRadius) {
            // Vérifier également que le point est au-dessus de arcStart
            // et à l'intérieur des limites horizontales extrapolées
            const horizontalExtension = baseWidth/2 * (arcStart - y) / arcHeight;
            if (x >= leftBase - horizontalExtension && x <= rightBase + horizontalExtension) {
                return true;
            }
        }
    }
    
    return false;
}

// Fonction utilitaire pour tester si un point est dans une arabesque avec coordonnées normalisées
function isPointInArabesqueNormalized(nx, ny, leftBase, rightBase, doorBottom, arcStart, arcRadius, arcCenterY) {
    // Test pour la partie rectangulaire
    if (ny >= arcStart && ny <= doorBottom && nx >= leftBase && nx <= rightBase) {
        return true;
    }
    
    // Test pour la partie en arc
    if (ny < arcStart) {
        // Centre de l'arc est à x=0
        const dx = nx - 0;
        const dy = ny - arcCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= arcRadius) {
            // Vérifier également que le point est entre les limites horizontales projetées
            const horizontalExtension = (rightBase - leftBase)/2 * (arcStart - ny) / (doorBottom - arcStart);
            return (nx >= leftBase - horizontalExtension && nx <= rightBase + horizontalExtension);
        }
    }
    
    return false;
}










// ================ FORME DE A ================
// Fonction pour générer le chemin SVG d'un A épais
export function createLetterAPath(width, height, scale) {
    const letterWidth = width * scale * 0.92;
    const letterHeight = height * scale * 0.92;
    const centerX = 0;
    const centerY = 0;
    
    // Paramètres du A
    const strokeWidth = letterWidth * 0.18; // Épaisseur des traits
    const topWidth = letterWidth * 0.3; // Largeur du sommet du A
    const baseWidth = letterWidth * 0.8; // Largeur de la base du A
    const barY = centerY + letterHeight * 0.1; // Position de la barre horizontale
    
    // Points clés
    const topX = centerX;
    const topY = centerY - letterHeight/2;
    const bottomLeftX = centerX - baseWidth/2;
    const bottomLeftY = centerY + letterHeight/2;
    const bottomRightX = centerX + baseWidth/2;
    const bottomRightY = centerY + letterHeight/2;
    
    // Calculer les points pour les traits épais
    const halfStroke = strokeWidth / 2;
    
    // Points pour le côté gauche externe
    const leftOuterTop = [topX - topWidth/2, topY];
    const leftOuterBottom = [bottomLeftX - halfStroke, bottomLeftY];
    
    // Points pour le côté gauche interne
    const leftInnerTop = [topX - topWidth/2 + strokeWidth, topY + strokeWidth];
    const leftInnerBottom = [bottomLeftX + halfStroke, bottomLeftY - strokeWidth];
    
    // Points pour le côté droit externe
    const rightOuterTop = [topX + topWidth/2, topY];
    const rightOuterBottom = [bottomRightX + halfStroke, bottomRightY];
    
    // Points pour le côté droit interne
    const rightInnerTop = [topX + topWidth/2 - strokeWidth, topY + strokeWidth];
    const rightInnerBottom = [bottomRightX - halfStroke, bottomRightY - strokeWidth];
    
    // Points pour la barre horizontale
    const barLeftOuter = [centerX - letterWidth/4 - halfStroke, barY - halfStroke];
    const barRightOuter = [centerX + letterWidth/4 + halfStroke, barY - halfStroke];
    const barLeftInner = [centerX - letterWidth/4 - halfStroke, barY + halfStroke];
    const barRightInner = [centerX + letterWidth/4 + halfStroke, barY + halfStroke];
    
    // Créer le chemin SVG
    let pathString = `M ${leftOuterTop[0]},${leftOuterTop[1]}`;
    
    // Contour externe du côté gauche
    pathString += ` L ${leftOuterBottom[0]},${leftOuterBottom[1]}`;
    
    // Bas du A (ligne vers la droite)
    pathString += ` L ${rightOuterBottom[0]},${rightOuterBottom[1]}`;
    
    // Contour externe du côté droit
    pathString += ` L ${rightOuterTop[0]},${rightOuterTop[1]}`;
    
    // Sommet du A
    pathString += ` L ${leftOuterTop[0]},${leftOuterTop[1]}`;
    
    // Contour interne (trou au milieu du A)
    pathString += ` M ${leftInnerTop[0]},${leftInnerTop[1]}`;
    pathString += ` L ${leftInnerBottom[0]},${leftInnerBottom[1]}`;
    pathString += ` L ${rightInnerBottom[0]},${rightInnerBottom[1]}`;
    pathString += ` L ${rightInnerTop[0]},${rightInnerTop[1]}`;
    pathString += ` L ${leftInnerTop[0]},${leftInnerTop[1]}`;
    
    // Barre horizontale
    pathString += ` M ${barLeftOuter[0]},${barLeftOuter[1]}`;
    pathString += ` L ${barRightOuter[0]},${barRightOuter[1]}`;
    pathString += ` L ${barRightInner[0]},${barRightInner[1]}`;
    pathString += ` L ${barLeftInner[0]},${barLeftInner[1]}`;
    pathString += ` L ${barLeftOuter[0]},${barLeftOuter[1]}`;
    
    return pathString;
}

// Fonction pour créer la matrice de forme de lettre A
export function createLetterAShapeMatrix() {
    console.log(`Calcul de la shapeMap pour la lettre A`);
    const matrixSize = 100;
    const shapeMap = Array.from({ length: matrixSize }, () => 
        Array(matrixSize).fill(0)
    );

    // Paramètres du A normalisés
    const strokeWidth = 0.18;
    const topWidth = 0.3;
    const baseWidth = 0.8;
    const barY = 0.1;
    
    // Calculer les limites
    const minX = -baseWidth/2 - strokeWidth/2;
    const maxX = baseWidth/2 + strokeWidth/2;
    const minY = -1;
    const maxY = 1;
    
    // Remplir la matrice
    for (let y = 0; y < matrixSize; y++) {
        for (let x = 0; x < matrixSize; x++) {
            // Normaliser x et y pour correspondre à l'espace de la lettre
            const nx = minX + (x / (matrixSize - 1)) * (maxX - minX);
            const ny = minY + (y / (matrixSize - 1)) * (maxY - minY);
            
            // Vérifier si le point est dans la lettre A
            const inside = isPointInLetterANormalized(nx, ny, strokeWidth, topWidth, baseWidth, barY);
            
            if (inside) {
                shapeMap[y][x] = 1;
            }
        }
    }

    return shapeMap;
}

// Fonction pour calculer les limites de la lettre A
export function computeLetterALimits() {
    // Paramètres du A normalisés
    const strokeWidth = 0.18;
    const baseWidth = 0.8;
    
    // Calculer les limites
    minX = -baseWidth/2 - strokeWidth/2;
    maxX = baseWidth/2 + strokeWidth/2;
    minY = -1;
    maxY = 1;
}

// Fonction pour vérifier si un point est à l'intérieur de la lettre A
export function isPointInLetterA(x, y, centerX, centerY, width, height, scaleFactor = 1.0) {
    // Adapter les dimensions
    const letterWidth = width * 0.92 * scaleFactor;
    const letterHeight = height * 0.92 * scaleFactor;
    
    // Normaliser les coordonnées par rapport au centre et à l'échelle
    const nx = (x - centerX) / (letterWidth/2);
    const ny = (y - centerY) / (letterHeight/2);
    
    // Paramètres du A
    const strokeWidth = 0.18;
    const topWidth = 0.3;
    const baseWidth = 0.8;
    const barY = 0.1;
    
    // Utiliser la fonction normalisée
    return isPointInLetterANormalized(nx, ny, strokeWidth, topWidth, baseWidth, barY);
}

// Fonction utilitaire pour vérifier si un point est dans un A avec coordonnées normalisées
function isPointInLetterANormalized(nx, ny, strokeWidth, topWidth, baseWidth, barY) {
    // Points clés
    const topY = -1;
    const bottomY = 1;
    
    // Vérifier si le point est dans la zone de la lettre A
    
    // 1. Calculer la projection linéaire du point sur les côtés du A
    
    // a. Côté gauche
    const leftSlope = (topWidth/2) / (1 - topY);
    const leftX = -baseWidth/2 + leftSlope * (ny - bottomY);
    
    // b. Côté droit
    const rightSlope = -(topWidth/2) / (1 - topY);
    const rightX = baseWidth/2 + rightSlope * (ny - bottomY);
    
    // 2. Vérifier si le point est dans le contour extérieur
    const inOuterContour = (nx >= leftX - strokeWidth/2) && (nx <= rightX + strokeWidth/2) && (ny >= topY - strokeWidth/2) && (ny <= bottomY);
    
    // 3. Vérifier si le point est dans le contour intérieur (trou)
    const inInnerContour = (nx >= leftX + strokeWidth/2) && (nx <= rightX - strokeWidth/2) && (ny >= topY + strokeWidth) && (ny <= bottomY - strokeWidth);
    
    // 4. Vérifier si le point est dans la barre horizontale
    const inHorizontalBar = (nx >= -baseWidth/4) && (nx <= baseWidth/4) && (ny >= barY - strokeWidth/2) && (ny <= barY + strokeWidth/2);
    
    // Le point est dans la lettre s'il est dans le contour extérieur mais pas dans le contour intérieur,
    // ou s'il est dans la barre horizontale
    return (inOuterContour && !inInnerContour) || inHorizontalBar;
}






// ================ FORME DE M ================
// Fonction pour générer le chemin SVG d'un M épais
export function createLetterMPath(width, height, scale) {
    const letterWidth = width * scale * 0.92;
    const letterHeight = height * scale * 0.92;
    const centerX = 0;
    const centerY = 0;
    
    // Paramètres du M
    const strokeWidth = letterWidth * 0.15; // Épaisseur des traits
    const halfWidth = letterWidth / 2;
    const halfHeight = letterHeight / 2;
    
    // Points clés
    const topLeftX = centerX - halfWidth;
    const topLeftY = centerY - halfHeight;
    const topRightX = centerX + halfWidth;
    const topRightY = centerY - halfHeight;
    const bottomLeftX = centerX - halfWidth;
    const bottomLeftY = centerY + halfHeight;
    const bottomRightX = centerX + halfWidth;
    const bottomRightY = centerY + halfHeight;
    const midTopX = centerX;
    const midTopY = centerY - halfHeight + letterHeight * 0.3;
    
    // Points pour les traits externes
    const halfStroke = strokeWidth / 2;
    
    // Créer le chemin SVG
    let pathString = '';
    
    // Trait vertical gauche externe
    pathString += `M ${topLeftX - halfStroke},${topLeftY - halfStroke}`;
    pathString += ` L ${topLeftX - halfStroke},${bottomLeftY}`;
    pathString += ` L ${topLeftX + strokeWidth},${bottomLeftY}`;
    pathString += ` L ${topLeftX + strokeWidth},${topLeftY + strokeWidth}`;
    pathString += ` L ${topLeftX - halfStroke},${topLeftY - halfStroke}`;
    
    // Trait diagonal gauche externe
    pathString += ` M ${topLeftX + strokeWidth},${topLeftY + strokeWidth}`;
    pathString += ` L ${midTopX - halfStroke},${midTopY}`;
    pathString += ` L ${midTopX},${midTopY + strokeWidth}`;
    pathString += ` L ${topLeftX + strokeWidth * 2},${topLeftY + strokeWidth * 2}`;
    pathString += ` L ${topLeftX + strokeWidth},${topLeftY + strokeWidth}`;
    
    // Trait diagonal droit externe
    pathString += ` M ${midTopX},${midTopY + strokeWidth}`;
    pathString += ` L ${midTopX + halfStroke},${midTopY}`;
    pathString += ` L ${topRightX - strokeWidth},${topRightY + strokeWidth}`;
    pathString += ` L ${topRightX - strokeWidth * 2},${topRightY + strokeWidth * 2}`;
    pathString += ` L ${midTopX},${midTopY + strokeWidth}`;
    
    // Trait vertical droit externe
    pathString += ` M ${topRightX + halfStroke},${topRightY - halfStroke}`;
    pathString += ` L ${topRightX - strokeWidth},${topRightY + strokeWidth}`;
    pathString += ` L ${topRightX - strokeWidth},${bottomRightY}`;
    pathString += ` L ${topRightX + halfStroke},${bottomRightY}`;
    pathString += ` L ${topRightX + halfStroke},${topRightY - halfStroke}`;
    
    return pathString;
}

// Fonction pour créer la matrice de forme de lettre M
export function createLetterMShapeMatrix() {
    console.log(`Calcul de la shapeMap pour la lettre M`);
    const matrixSize = 100;
    const shapeMap = Array.from({ length: matrixSize }, () => 
        Array(matrixSize).fill(0)
    );

    // Paramètres du M normalisés
    const strokeWidth = 0.15;
    
    // Calculer les limites
    const minX = -1 - strokeWidth/2;
    const maxX = 1 + strokeWidth/2;
    const minY = -1 - strokeWidth/2;
    const maxY = 1;
    
    // Remplir la matrice
    for (let y = 0; y < matrixSize; y++) {
        for (let x = 0; x < matrixSize; x++) {
            // Normaliser x et y pour correspondre à l'espace de la lettre
            const nx = minX + (x / (matrixSize - 1)) * (maxX - minX);
            const ny = minY + (y / (matrixSize - 1)) * (maxY - minY);
            
            // Vérifier si le point est dans la lettre M
            const inside = isPointInLetterMNormalized(nx, ny, strokeWidth);
            
            if (inside) {
                shapeMap[y][x] = 1;
            }
        }
    }

    return shapeMap;
}

// Fonction pour calculer les limites de la lettre M
export function computeLetterMLimits() {
    // Paramètres du M normalisés
    const strokeWidth = 0.15;
    
    // Calculer les limites
    minX = -1 - strokeWidth/2;
    maxX = 1 + strokeWidth/2;
    minY = -1 - strokeWidth/2;
    maxY = 1;
}

// Fonction pour vérifier si un point est à l'intérieur de la lettre M
export function isPointInLetterM(x, y, centerX, centerY, width, height, scaleFactor = 1.0) {
    // Adapter les dimensions
    const letterWidth = width * 0.92 * scaleFactor;
    const letterHeight = height * 0.92 * scaleFactor;
    
    // Normaliser les coordonnées par rapport au centre et à l'échelle
    const nx = (x - centerX) / (letterWidth/2);
    const ny = (y - centerY) / (letterHeight/2);
    
    // Paramètre du M
    const strokeWidth = 0.15;
    
    // Utiliser la fonction normalisée
    return isPointInLetterMNormalized(nx, ny, strokeWidth);
}

// Fonction utilitaire pour vérifier si un point est dans un M avec coordonnées normalisées
function isPointInLetterMNormalized(nx, ny, strokeWidth) {
    // Points clés
    const topLeftX = -1;
    const topLeftY = -1;
    const topRightX = 1;
    const topRightY = -1;
    const bottomLeftX = -1;
    const bottomLeftY = 1;
    const bottomRightX = 1;
    const bottomRightY = 1;
    const midTopX = 0;
    const midTopY = -1 + 0.3 * 2; // 30% vers le bas
    
    // Vérifier si le point est dans la zone de la lettre M
    
    // 1. Trait vertical gauche
    const inLeftVertical = (nx >= topLeftX - strokeWidth/2) && (nx <= topLeftX + strokeWidth) && 
                           (ny >= topLeftY - strokeWidth/2) && (ny <= bottomLeftY);
    
    // 2. Trait vertical droit
    const inRightVertical = (nx >= topRightX - strokeWidth) && (nx <= topRightX + strokeWidth/2) && 
                            (ny >= topRightY - strokeWidth/2) && (ny <= bottomRightY);
    
    // 3. Diagonale gauche (du haut gauche vers le milieu)
    // Équation de la droite: y = mx + b
    // où m = (midTopY - topLeftY) / (midTopX - (topLeftX + strokeWidth))
    //     b = topLeftY - m * (topLeftX + strokeWidth)
    const mLeft = (midTopY - topLeftY) / (midTopX - (topLeftX + strokeWidth));
    const bLeft = topLeftY - mLeft * (topLeftX + strokeWidth);
    
    // Distance perpendiculaire du point à la droite
    const distToLeftDiag = Math.abs(ny - (mLeft * nx + bLeft)) / Math.sqrt(1 + mLeft * mLeft);
    const onLeftDiagonal = distToLeftDiag <= strokeWidth/2;
    
    // 4. Diagonale droite (du milieu vers le haut droit)
    const mRight = (topRightY - midTopY) / ((topRightX - strokeWidth) - midTopX);
    const bRight = midTopY - mRight * midTopX;
    
    // Distance perpendiculaire du point à la droite
    const distToRightDiag = Math.abs(ny - (mRight * nx + bRight)) / Math.sqrt(1 + mRight * mRight);
    const onRightDiagonal = distToRightDiag <= strokeWidth/2;
    
    // Vérifier les projections pour limiter les diagonales
    const projOnLeftDiag = (nx >= topLeftX + strokeWidth) && (nx <= midTopX) && 
                          (ny >= topLeftY + strokeWidth) && (ny <= midTopY);
    
    const projOnRightDiag = (nx >= midTopX) && (nx <= topRightX - strokeWidth) && 
                           (ny >= midTopY) && (ny <= topRightY + strokeWidth);
    
    return inLeftVertical || inRightVertical || 
           (onLeftDiagonal && projOnLeftDiag) || 
           (onRightDiagonal && projOnRightDiag);
}








// Fonction pour générer le chemin SVG d'un puzzle
export function createPuzzlePath(width, height, scale) {
    const puzzleWidth = width * scale * 0.92;
    const puzzleHeight = height * scale * 0.92;
    const centerX = 0;
    const centerY = 0;
    
    // Paramètres du puzzle
    const baseWidth = puzzleWidth * 0.8;
    const baseHeight = puzzleHeight * 0.8;
    const tabSize = Math.min(baseWidth, baseHeight) * 0.2;
    
    // Points de base du rectangle
    const left = centerX - baseWidth/2;
    const right = centerX + baseWidth/2;
    const top = centerY - baseHeight/2;
    const bottom = centerY + baseHeight/2;
    
    // Créer le chemin SVG
    let pathString = `M ${left},${top + tabSize}`;
    
    // Côté supérieur avec languette
    pathString += ` Q ${left},${top} ${left + tabSize/2},${top}`;
    pathString += ` Q ${left + tabSize},${top - tabSize} ${left + tabSize*2},${top}`;
    pathString += ` Q ${left + tabSize*3},${top} ${left + tabSize*3},${top + tabSize/2}`;
    
    // Reste du côté supérieur
    pathString += ` L ${right - tabSize*3},${top + tabSize/2}`;
    
    // Côté droit avec languette
    pathString += ` Q ${right - tabSize*3},${top} ${right - tabSize*2},${top}`;
    pathString += ` Q ${right - tabSize},${top - tabSize} ${right},${top}`;
    pathString += ` Q ${right + tabSize},${top} ${right},${top + tabSize}`;
    
    // Reste du côté droit
    pathString += ` L ${right},${bottom - tabSize}`;
    
    // Côté inférieur avec languette
    pathString += ` Q ${right},${bottom} ${right - tabSize/2},${bottom}`;
    pathString += ` Q ${right - tabSize},${bottom + tabSize} ${right - tabSize*2},${bottom}`;
    pathString += ` Q ${right - tabSize*3},${bottom} ${right - tabSize*3},${bottom - tabSize/2}`;
    
    // Reste du côté inférieur
    pathString += ` L ${left + tabSize*3},${bottom - tabSize/2}`;
    
    // Côté gauche avec languette
    pathString += ` Q ${left + tabSize*3},${bottom} ${left + tabSize*2},${bottom}`;
    pathString += ` Q ${left + tabSize},${bottom + tabSize} ${left},${bottom}`;
    pathString += ` Q ${left - tabSize},${bottom} ${left},${bottom - tabSize}`;
    
    // Fermer le chemin
    pathString += ` L ${left},${top + tabSize}`;
    pathString += ` Z`;
    
    return pathString;
}




// Fonction pour générer le chemin SVG d'un nuage
export function createCloudPath(width, height, scale) {
    const cloudWidth = width * scale * 0.92;
    const cloudHeight = height * scale * 0.92;
    const centerX = 0;
    const centerY = 0;
    
    // Paramètres du nuage
    const baseWidth = cloudWidth * 0.8;
    const baseHeight = cloudHeight * 0.7;
    const numBubbles = 8; // Nombre de bulles pour le contour du nuage
    
    // Rayons des bulles
    const bubbleRadii = [
        baseWidth * 0.25, // Haut gauche
        baseWidth * 0.2,  // Haut
        baseWidth * 0.3,  // Haut droit
        baseWidth * 0.25, // Droit
        baseWidth * 0.28, // Bas droit
        baseWidth * 0.2,  // Bas
        baseWidth * 0.25, // Bas gauche
        baseWidth * 0.2   // Gauche
    ];
    
    // Positions des centres des bulles
    const bubbleCenters = [
        [centerX - baseWidth * 0.25, centerY - baseHeight * 0.3],  // Haut gauche
        [centerX, centerY - baseHeight * 0.4],                     // Haut
        [centerX + baseWidth * 0.3, centerY - baseHeight * 0.25],  // Haut droit
        [centerX + baseWidth * 0.4, centerY],                      // Droit
        [centerX + baseWidth * 0.25, centerY + baseHeight * 0.3],  // Bas droit
        [centerX, centerY + baseHeight * 0.35],                    // Bas
        [centerX - baseWidth * 0.3, centerY + baseHeight * 0.25],  // Bas gauche
        [centerX - baseWidth * 0.35, centerY]                      // Gauche
    ];
    
    // Créer le chemin SVG en construisant un chemin à partir des arcs de cercle
    let pathString = `M ${bubbleCenters[0][0]},${bubbleCenters[0][1] - bubbleRadii[0]}`;
    
    for (let i = 0; i < numBubbles; i++) {
        const nextIdx = (i + 1) % numBubbles;
        
        // Calculer les points d'intersection entre les bulles actuelles et suivantes
        // Pour simplifier, nous allons utiliser un point intermédiaire
        const currentX = bubbleCenters[i][0];
        const currentY = bubbleCenters[i][1];
        const nextX = bubbleCenters[nextIdx][0];
        const nextY = bubbleCenters[nextIdx][1];
        
        // Arc de cercle pour la bulle actuelle
        pathString += ` A ${bubbleRadii[i]} ${bubbleRadii[i]} 0 0 1 ${(currentX + nextX) / 2} ${(currentY + nextY) / 2}`;
    }
    
    pathString += ' Z';
    
    return pathString;
}



// Fonction pour générer le chemin SVG d'une silhouette d'arbre
export function createTreePath(width, height, scale) {
    const treeWidth = width * scale * 0.92;
    const treeHeight = height * scale * 0.92;
    const centerX = 0;
    const centerY = 0;
    
    // Paramètres de l'arbre
    const trunkWidth = treeWidth * 0.2;
    const trunkHeight = treeHeight * 0.3;
    const foliageWidth = treeWidth * 0.8;
    const foliageHeight = treeHeight * 0.7;
    
    // Points clés
    const trunkLeft = centerX - trunkWidth / 2;
    const trunkRight = centerX + trunkWidth / 2;
    const trunkBottom = centerY + treeHeight / 2;
    const trunkTop = trunkBottom - trunkHeight;
    
    const foliageBottom = trunkTop;
    const foliageTop = foliageBottom - foliageHeight;
    
    // Créer le chemin SVG
    let pathString = '';
    
    // Tronc
    pathString += `M ${trunkLeft},${trunkBottom}`;
    pathString += ` L ${trunkLeft},${trunkTop}`;
    pathString += ` L ${trunkRight},${trunkTop}`;
    pathString += ` L ${trunkRight},${trunkBottom}`;
    pathString += ` Z`;
    
    // Créer un sapin avec 3 niveaux de branches
    const level1Bottom = foliageBottom;
    const level1Top = foliageBottom - foliageHeight * 0.4;
    const level1Width = foliageWidth;
    
    const level2Bottom = level1Top;
    const level2Top = level1Top - foliageHeight * 0.35;
    const level2Width = foliageWidth * 0.75;
    
    const level3Bottom = level2Top;
    const level3Top = foliageTop;
    const level3Width = foliageWidth * 0.5;
    
    // Niveau 1 (bas)
    pathString += ` M ${centerX - level1Width/2},${level1Bottom}`;
    pathString += ` L ${centerX},${level1Top}`;
    pathString += ` L ${centerX + level1Width/2},${level1Bottom}`;
    pathString += ` Z`;
    
    // Niveau 2 (milieu)
    pathString += ` M ${centerX - level2Width/2},${level2Bottom}`;
    pathString += ` L ${centerX},${level2Top}`;
    pathString += ` L ${centerX + level2Width/2},${level2Bottom}`;
    pathString += ` Z`;
    
    // Niveau 3 (haut)
    pathString += ` M ${centerX - level3Width/2},${level3Bottom}`;
    pathString += ` L ${centerX},${level3Top}`;
    pathString += ` L ${centerX + level3Width/2},${level3Bottom}`;
    pathString += ` Z`;
    
    return pathString;
}



// Fonction pour générer le chemin SVG d'une carte (carte à jouer)
export function createCardPath(width, height, scale) {
    const cardWidth = width * scale * 0.92;
    const cardHeight = height * scale * 0.92;
    const centerX = 0;
    const centerY = 0;
    
    // Paramètres de la carte
    const cornerRadius = Math.min(cardWidth, cardHeight) * 0.1;
    
    // Points clés
    const left = centerX - cardWidth/2;
    const right = centerX + cardWidth/2;
    const top = centerY - cardHeight/2;
    const bottom = centerY + cardHeight/2;
    
    // Créer le chemin SVG avec des coins arrondis
    let pathString = '';
    
    // Commencer en haut à gauche après le coin arrondi
    pathString += `M ${left + cornerRadius},${top}`;
    
    // Bord supérieur
    pathString += ` L ${right - cornerRadius},${top}`;
    
    // Coin supérieur droit
    pathString += ` Q ${right},${top} ${right},${top + cornerRadius}`;
    
    // Bord droit
    pathString += ` L ${right},${bottom - cornerRadius}`;
    
    // Coin inférieur droit
    pathString += ` Q ${right},${bottom} ${right - cornerRadius},${bottom}`;
    
    // Bord inférieur
    pathString += ` L ${left + cornerRadius},${bottom}`;
    
    // Coin inférieur gauche
    pathString += ` Q ${left},${bottom} ${left},${bottom - cornerRadius}`;
    
    // Bord gauche
    pathString += ` L ${left},${top + cornerRadius}`;
    
    // Coin supérieur gauche
    pathString += ` Q ${left},${top} ${left + cornerRadius},${top}`;
    
    // Fermer le chemin
    pathString += ` Z`;
    
    return pathString;
}




// Fonction pour générer le chemin SVG d'une ampoule
export function createBulbPath(width, height, scale) {
    const bulbWidth = width * scale * 0.92;
    const bulbHeight = height * scale * 0.92;
    const centerX = 0;
    const centerY = 0;
    
    // Paramètres de l'ampoule
    const glassRadius = Math.min(bulbWidth, bulbHeight) * 0.45;
    const baseWidth = glassRadius * 1.2;
    const baseHeight = bulbHeight * 0.25;
    const capWidth = baseWidth * 0.8;
    const capHeight = baseHeight * 0.3;
    
    // Points clés
    const glassCenter = [centerX, centerY - baseHeight/2];
    const baseTop = centerY;
    const baseBottom = centerY + baseHeight;
    const capTop = baseBottom;
    const capBottom = capTop + capHeight;
    
    // Créer le chemin SVG
    let pathString = '';
    
    // Partie en verre (cercle)
    pathString += `M ${glassCenter[0] - glassRadius},${glassCenter[1]}`;
    pathString += ` A ${glassRadius} ${glassRadius} 0 0 1 ${glassCenter[0] + glassRadius} ${glassCenter[1]}`;
    pathString += ` A ${glassRadius} ${glassRadius} 0 0 1 ${glassCenter[0] - glassRadius} ${glassCenter[1]}`;
    
    // Connection entre le verre et la base
    pathString += ` M ${centerX - baseWidth/3},${glassCenter[1]}`;
    pathString += ` L ${centerX - baseWidth/2},${baseTop}`;
    pathString += ` L ${centerX + baseWidth/2},${baseTop}`;
    pathString += ` L ${centerX + baseWidth/3},${glassCenter[1]}`;
    
    // Base
    pathString += ` M ${centerX - baseWidth/2},${baseTop}`;
    pathString += ` L ${centerX - baseWidth/2},${baseBottom}`;
    pathString += ` L ${centerX + baseWidth/2},${baseBottom}`;
    pathString += ` L ${centerX + baseWidth/2},${baseTop}`;
    
    // Vis (cap)
    pathString += ` M ${centerX - capWidth/2},${capTop}`;
    pathString += ` L ${centerX - capWidth/2},${capBottom}`;
    pathString += ` L ${centerX + capWidth/2},${capBottom}`;
    pathString += ` L ${centerX + capWidth/2},${capTop}`;
    
    return pathString;
}



// Fonction pour générer le chemin SVG d'un cerveau stylisé
export function createBrainPath(width, height, scale) {
    const brainWidth = width * scale * 0.92;
    const brainHeight = height * scale * 0.92;
    const centerX = 0;
    const centerY = 0;
    
    // Paramètres du cerveau
    const baseWidth = brainWidth * 0.8;
    const baseHeight = brainHeight * 0.7;
    const lobeSeparation = baseWidth * 0.05;
    
    // Créer le chemin SVG
    let pathString = '';
    
    // Base du cerveau (forme ovale)
    pathString += `M ${centerX - baseWidth/2},${centerY}`;
    pathString += ` Q ${centerX - baseWidth/2},${centerY - baseHeight/2} ${centerX},${centerY - baseHeight/2}`;
    pathString += ` Q ${centerX + baseWidth/2},${centerY - baseHeight/2} ${centerX + baseWidth/2},${centerY}`;
    pathString += ` Q ${centerX + baseWidth/2},${centerY + baseHeight/2} ${centerX},${centerY + baseHeight/2}`;
    pathString += ` Q ${centerX - baseWidth/2},${centerY + baseHeight/2} ${centerX - baseWidth/2},${centerY}`;
    
    // Séparation centrale
    pathString += ` M ${centerX},${centerY - baseHeight/2}`;
    pathString += ` L ${centerX},${centerY + baseHeight/2}`;
    
    // Circonvolutions gauche
    const leftX = centerX - lobeSeparation/2;
    const leftWidth = baseWidth/2 - lobeSeparation/2;
    
    // 6 circonvolutions sur l'hémisphère gauche
    for (let i = 0; i < 6; i++) {
        const y = centerY - baseHeight/2 + (i+1) * baseHeight/7;
        const startX = leftX - leftWidth * 0.9;
        const controlX = leftX - leftWidth * 0.1;
        
        pathString += ` M ${startX},${y}`;
        pathString += ` C ${controlX},${y - baseHeight/20} ${controlX},${y + baseHeight/20} ${startX},${y}`;
    }
    
    // Circonvolutions droite
    const rightX = centerX + lobeSeparation/2;
    const rightWidth = baseWidth/2 - lobeSeparation/2;
    
    // 6 circonvolutions sur l'hémisphère droit
    for (let i = 0; i < 6; i++) {
        const y = centerY - baseHeight/2 + (i+1) * baseHeight/7;
        const startX = rightX + rightWidth * 0.9;
        const controlX = rightX + rightWidth * 0.1;
        
        pathString += ` M ${startX},${y}`;
        pathString += ` C ${controlX},${y - baseHeight/20} ${controlX},${y + baseHeight/20} ${startX},${y}`;
    }
    
    return pathString;
}



// Fonction pour générer le chemin SVG d'une maison
export function createHousePath(width, height, scale) {
    const houseWidth = width * scale * 0.92;
    const houseHeight = height * scale * 0.92;
    const centerX = 0;
    const centerY = 0;
    
    // Paramètres de la maison
    const baseWidth = houseWidth * 0.8;
    const baseHeight = houseHeight * 0.6;
    const roofHeight = houseHeight * 0.4;
    
    // Points clés
    const baseLeft = centerX - baseWidth/2;
    const baseRight = centerX + baseWidth/2;
    const baseBottom = centerY + houseHeight/2;
    const baseTop = baseBottom - baseHeight;
    const roofTop = baseTop - roofHeight;
    
    // Créer le chemin SVG
    let pathString = '';
    
    // Base (rectangle)
    pathString += `M ${baseLeft},${baseBottom}`;
    pathString += ` L ${baseLeft},${baseTop}`;
    pathString += ` L ${baseRight},${baseTop}`;
    pathString += ` L ${baseRight},${baseBottom}`;
    pathString += ` Z`;
    
    // Toit (triangle)
    pathString += ` M ${baseLeft},${baseTop}`;
    pathString += ` L ${centerX},${roofTop}`;
    pathString += ` L ${baseRight},${baseTop}`;
    pathString += ` Z`;
    
    // Porte
    const doorWidth = baseWidth * 0.2;
    const doorHeight = baseHeight * 0.6;
    const doorLeft = centerX - doorWidth/2;
    const doorRight = centerX + doorWidth/2;
    const doorBottom = baseBottom;
    const doorTop = doorBottom - doorHeight;
    
    pathString += ` M ${doorLeft},${doorBottom}`;
    pathString += ` L ${doorLeft},${doorTop}`;
    pathString += ` L ${doorRight},${doorTop}`;
    pathString += ` L ${doorRight},${doorBottom}`;
    pathString += ` Z`;
    
    // Fenêtres
    const windowSize = baseWidth * 0.15;
    const windowOffset = baseWidth * 0.25;
    
    // Fenêtre gauche
    const leftWindowLeft = baseLeft + windowOffset;
    const leftWindowRight = leftWindowLeft + windowSize;
    const windowBottom = baseTop + baseHeight * 0.3;
    const windowTop = windowBottom - windowSize;
    
    pathString += ` M ${leftWindowLeft},${windowBottom}`;
    pathString += ` L ${leftWindowLeft},${windowTop}`;
    pathString += ` L ${leftWindowRight},${windowTop}`;
    pathString += ` L ${leftWindowRight},${windowBottom}`;
    pathString += ` Z`;
    
    // Fenêtre droite
    const rightWindowRight = baseRight - windowOffset;
    const rightWindowLeft = rightWindowRight - windowSize;
    
    pathString += ` M ${rightWindowLeft},${windowBottom}`;
    pathString += ` L ${rightWindowLeft},${windowTop}`;
    pathString += ` L ${rightWindowRight},${windowTop}`;
    pathString += ` L ${rightWindowRight},${windowBottom}`;
    pathString += ` Z`;
    
    return pathString;
}



// Fonction pour générer le chemin SVG d'un ballon (montgolfière)
export function createBalloonPath(width, height, scale) {
    const balloonWidth = width * scale * 0.92;
    const balloonHeight = height * scale * 0.92;
    const centerX = 0;
    const centerY = 0;
    
    // Paramètres du ballon
    const ballRadius = Math.min(balloonWidth, balloonHeight) * 0.45;
    const basketWidth = ballRadius * 0.6;
    const basketHeight = balloonHeight * 0.15;
    const ropeLength = balloonHeight * 0.2;
    
    // Points clés
    const ballCenter = [centerX, centerY - ropeLength/2];
    const basketTop = centerY + ropeLength/2;
    const basketBottom = basketTop + basketHeight;
    
    // Créer le chemin SVG
    let pathString = '';
    
    // Ballon (cercle)
    pathString += `M ${ballCenter[0] - ballRadius},${ballCenter[1]}`;
    pathString += ` A ${ballRadius} ${ballRadius} 0 0 1 ${ballCenter[0] + ballRadius} ${ballCenter[1]}`;
    pathString += ` A ${ballRadius} ${ballRadius} 0 0 1 ${ballCenter[0] - ballRadius} ${ballCenter[1]}`;
    
    // Panier
    const basketLeft = centerX - basketWidth/2;
    const basketRight = centerX + basketWidth/2;
    
    pathString += ` M ${basketLeft},${basketTop}`;
    pathString += ` L ${basketLeft},${basketBottom}`;
    pathString += ` L ${basketRight},${basketBottom}`;
    pathString += ` L ${basketRight},${basketTop}`;
    pathString += ` Z`;
    
    // Cordes (4 cordes)
    const ropeOffsets = [-basketWidth/3, basketWidth/3];
    
    for (let i = 0; i < ropeOffsets.length; i++) {
        const ropeBottomX = centerX + ropeOffsets[i];
        const ropeTopX = ballCenter[0] + ropeOffsets[i] * 0.8;
        const ropeTopY = ballCenter[1] + ballRadius * 0.8;
        
        pathString += ` M ${ropeBottomX},${basketTop}`;
        pathString += ` L ${ropeTopX},${ropeTopY}`;
    }
    
    return pathString;
}





// ================ FONCTIONS GÉNÉRIQUES DE DÉTECTION ================

// Fonction pour vérifier si un point est dans une zone particulière
export function isPointInZone(x, y, shape, zone, centerX, centerY, width, height) {
    // Zone définit le facteur d'échelle: 0.5 pour 50%, 0.75 pour 75%, 1.0 pour 100%
    let scale;
    if (zone === "50%") {
        scale = 0.5;
    } else if (zone === "75%") {
        scale = 0.75;
    } else {
        scale = 1.0;
    }
    
    // Utiliser la fonction appropriée selon la forme
    switch (shape) {
        case 'coeur':
            return isPointInHeart(x, y, centerX, centerY, width, height, scale);
        case 'etoile':
            return isPointInStar(x, y, centerX, centerY, width, height, scale);
        case 'arabesque':
            return isPointInArabesque(x, y, centerX, centerY, width, height, scale);
        default:
            // Rectangle simple
            return Math.abs(x - centerX) <= width * 0.46 * scale && 
                   Math.abs(y - centerY) <= height * 0.46 * scale;
    }
}

// Fonction pour vérifier si un mot est dans une zone ou dans une couronne
export function isWordInZone(word, outerZone, innerZone, shape, centerX, centerY, width, height) {
    // Obtenir les dimensions du mot
    const wordDim = getWordDimensions(word);

    let safetyOverlap;
    safetyOverlap = Math.max(1, 7 - nameCloudState.paddingLocal);
    if (word.size > verylargeWordThreshold) {safetyOverlap =  Math.max(1, 5 - nameCloudState.paddingLocal);}

    const halfWidth = wordDim.width / safetyOverlap;   // plus le dividende est grand , plus les mots sont superposés
    const halfHeight = wordDim.height / safetyOverlap;
    
    // Points à vérifier (centre et extrémités)
    const pointsToCheck = [
        { x: word.x, y: word.y }, // Centre
        { x: word.x - halfWidth, y: word.y }, // Gauche
        { x: word.x + halfWidth, y: word.y }, // Droite
        { x: word.x, y: word.y - halfHeight }, // Haut
        { x: word.x, y: word.y + halfHeight }  // Bas
    ];
    
    // Si innerZone est null, nous vérifions si le mot est dans la zone délimitée par outerZone
    if (innerZone === null) {
        // Tous les points doivent être dans la zone extérieure
        return pointsToCheck.every(point => 
            isPointInZone(point.x, point.y, shape, outerZone, centerX, centerY, width, height));
    }
    
    // Sinon, nous vérifions si le mot est dans la couronne entre outerZone et innerZone
    // Le mot doit être dans la zone extérieure mais pas entièrement dans la zone intérieure
    const inOuter = pointsToCheck.every(point => 
        isPointInZone(point.x, point.y, shape, outerZone, centerX, centerY, width, height));
    const allInInner = pointsToCheck.every(point => 
        isPointInZone(point.x, point.y, shape, innerZone, centerX, centerY, width, height));
    
    return inOuter && !allInInner;
}

// Fonction utilitaire pour calculer les dimensions d'un mot
export function getWordDimensions(word) {
    const widthFactor = 0.6;
    const heightFactor = 1.2;
    
    return {
        width: word.size * word.text.length * widthFactor,
        height: word.size * heightFactor
    };
}

// Fonction pour vérifier les collisions entre mots
export function checkCollision(word, x, y, placedWords) {
    const wordDim = getWordDimensions(word);
    let safetyMargin;
    if (nameCloudState.paddingLocal >= 4)
    { 
        safetyMargin = word.size * Math.max(0.1, (4/nameCloudState.paddingLocal)*0.6); 
    }  // 0.6 //0.1; //Plus le nombre est grand et positif plus les mots sont ressérés
    else
    {
        if (nameCloudState.paddingLocal == 3)
            safetyMargin = word.size * 0.7;
        else if (nameCloudState.paddingLocal == 3)
            safetyMargin = word.size * 0.8;
        else if (nameCloudState.paddingLocal == 2)
            safetyMargin = word.size * 0.9;
        else if (nameCloudState.paddingLocal == 1)
            safetyMargin = word.size * 1.0;
    }
    

    // Marge minimale pour les petits mots en périphérie, maximale pour les gros mots au centre
    // safetyMargin = -20; //Math.max(1, word.size * 0.001 * (1 + sizeFactor + distanceFactor));

 
    // Si c'est un grand mot ET qu'il est proche du centre
    if (word.size >= verylargeWordThreshold ) {
        safetyMargin = word.size * 0.1 ; // Marge très négative pour les grands mots au centre
    } else if (word.size >= largeWordThreshold ) {
        if( nameCloudState.paddingLocal <= 2) {
            safetyMargin = word.size * 0.8 ; // Marge très négative pour les grands mots au centre
        }
    } else if (word.size >= mediumWordThreshold ) {
        if( nameCloudState.paddingLocal <= 2) {
            safetyMargin = safetyMargin + 0.01*word.size ; // Marge très négative pour les grands mots au centre
        } else {
            safetyMargin = safetyMargin + 0.03*word.size ; // Marge très négative pour les grands mots au centre
        }
        
    } else if (word.size >= standardThreshold ) {
        if( nameCloudState.paddingLocal <= 2) {
            safetyMargin = safetyMargin + 0.05*word.size ; // Marge très négative pour les grands mots au centre
        } else {
            safetyMargin = safetyMargin + 0.1*word.size ; // Marge très négative pour les grands mots au centre
        }

    } else {
        if( nameCloudState.paddingLocal <= 2) {
            safetyMargin = safetyMargin + 0.01*word.size ; // Ou autre valeur qui fonctionnait pour vous
        } else {
            safetyMargin = safetyMargin + 0.2*word.size ; // Marge très négative pour les grands mots au centre
        }            
    }





    for (const placed of placedWords) {
        const placedDim = getWordDimensions(placed);
        
        const dx = Math.abs(x - placed.x);
        const dy = Math.abs(y - placed.y);
        
        if (dx < (wordDim.width + placedDim.width) / 2 - safetyMargin && 
            dy < (wordDim.height + placedDim.height) / 2 - safetyMargin) {
            return true;
        }
    }
    
    return false;
}



// export function computeAutoShapeScale(words, shape) {
//     largeWordThreshold = (nameCloudState.maxFontSize - nameCloudState.minFontSize) * 0.7 + nameCloudState.minFontSize;  // 34.5
//     mediumWordThreshold = (nameCloudState.maxFontSize - nameCloudState.minFontSize) * 0.4 + nameCloudState.minFontSize;  // 24
//     standardThreshold = (nameCloudState.maxFontSize - nameCloudState.minFontSize) * 0.2 + nameCloudState.minFontSize; // 17
//     // Trier les mots par taille décroissante
//     words.sort((a, b) => b.size - a.size);
//     // Séparer les mots en trois catégories
//     const largeWords = words.filter(word => word.size >= largeWordThreshold);
//     const mediumWords = words.filter(word => word.size < largeWordThreshold && word.size >= mediumWordThreshold);
//     const smallWords = words.filter(word => word.size < mediumWordThreshold);
//     const surface_estimation = largeWords.length * nameCloudState.maxFontSize + mediumWords.length * (nameCloudState.maxFontSize - nameCloudState.minFontSize)/2 + smallWords.length * nameCloudState.minFontSize; 
//     const autoShapeScale = 1;
//     return { autoShapeScale, surface_estimation }
// }


function computeWordsGroups(words, shape) {
    largeWordThreshold = (nameCloudState.maxFontSize - nameCloudState.minFontSize) * 0.7 + nameCloudState.minFontSize;  // 34.5
    mediumWordThreshold = (nameCloudState.maxFontSize - nameCloudState.minFontSize) * 0.4 + nameCloudState.minFontSize;  // 24
    standardThreshold = (nameCloudState.maxFontSize - nameCloudState.minFontSize) * 0.2 + nameCloudState.minFontSize; // 17
    // Trier les mots par taille décroissante
    words.sort((a, b) => b.size - a.size);
    // Séparer les mots en trois catégories
    const largeWords = words.filter(word => word.size >= largeWordThreshold);
    const mediumWords = words.filter(word => word.size < largeWordThreshold && word.size >= mediumWordThreshold);
    const smallWords = words.filter(word => word.size < mediumWordThreshold);
    // const surface_estimation = largeWords.length * nameCloudState.maxFontSize + mediumWords.length * (nameCloudState.maxFontSize - nameCloudState.minFontSize)/2 + smallWords.length * nameCloudState.minFontSize; 
    // const autoShapeScale = 1;
    return { largeWords, mediumWords, smallWords }
}


// Fonction principale pour placer les mots dans une forme
export function placeWordsInShape(words, shape, width, height) {
    const placedWords = [];
    const totalWords = words.length;
    
    // Coordonnées du centre
    const centerX = 0; // Dans le contexte du textGroup
    const centerY = 0;
    
    // Définir des seuils de taille pour catégoriser les mots  
    // let maxFontSize, minFontSize;

    // minFontSize = nameCloudState.minFontSize;
    //  maxFontSize = nameCloudState.maxFontSize;
    // if(totalWords < 70) {
    //     minFontSize = ((totalWords < 20) && !nameCloudState.mobilePhone) ? minFontSize*6 + 2 : totalWords < 60 ? minFontSize*2 : minFontSize + 4;
    //     maxFontSize = ((totalWords < 20) && !nameCloudState.mobilePhone) ? Math.max(1,maxFontSize*2 -2) :  totalWords < 60 ? maxFontSize +3 : parseInt(maxFontSize*2/3);

    // } else {
    //     if (nameCloudState.mobilePhone) {
    //         minFontSize = parseInt(minFontSize/2);
    //         maxFontSize = parseInt(maxFontSize/2);
    //     }
    // }


    // let { minFontSize, maxFontSize } = computeFontScale(words) ;


    // largeWordThreshold = (maxFontSize - minFontSize) * 0.7 + minFontSize;  // 34.5
    // mediumWordThreshold = (maxFontSize - minFontSize) * 0.4 + minFontSize;  // 24
    // standardThreshold = (maxFontSize - minFontSize) * 0.2 + minFontSize; // 17

    const {largeWords, mediumWords, smallWords} = computeWordsGroups(words, shape);

    // Trier les mots par taille décroissante
    words.sort((a, b) => b.size - a.size);
    
    
    // console.log(`in placeWordsInShape, Tentative de placement de ${words.length} mots dans la zone centrale`, "map=" , width, height , "fonts=", nameCloudState.maxFontSize, nameCloudState.minFontSize );

    // Séparer les mots en trois catégories
    // const largeWords = words.filter(word => word.size >= largeWordThreshold);
    // const mediumWords = words.filter(word => word.size < largeWordThreshold && word.size >= mediumWordThreshold);
    // const smallWords = words.filter(word => word.size < mediumWordThreshold);
    
 

    let zoneCenter1, zoneCenter2, zoneMedium1, zoneMedium2 , zoneExternal1, zoneExternal2, zoneFull1, zoneFull2;
    if (!nameCloudState.isThreeZones) 
    {
        zoneCenter1 =  "100%"; zoneCenter2 =  null;
        zoneMedium1 = "100%"; zoneMedium2 = null;
        zoneExternal1 = "100%"; zoneExternal2 = null;
        zoneFull1 = "100%"; zoneFull2 = null;
    }
    else
    {
        zoneCenter1 =  "50%"; zoneCenter2 =  null;
        zoneMedium1 = "75%"; zoneMedium2 = "50%";
        zoneExternal1 = "100%"; zoneExternal2 = "75%";
        zoneFull1 = "100%"; zoneFull2 = null;
    }

    // console.log(`in placeWordsInShape, Tentative de placement de ${words.length} mots dans la zone centrale`, "map=" , width, height , "fonts=", nameCloudState.maxFontSize, nameCloudState.minFontSize,'largeWordThreshold=', largeWordThreshold, ", large=",largeWords.length , mediumWords.length, smallWords.length);



    // 1. Placement des grands mots dans la zone centrale (50%)
    function placeWordsInCentralZone(wordsToPlace) {
        // console.log(`Tentative de placement de ${wordsToPlace.length} mots dans la zone centrale`, "map=" , width, height , "fonts=", nameCloudState.maxFontSize, nameCloudState.minFontSize );
        let placed = 0;
        
        for (const word of wordsToPlace) {
            if (placedWords.some(p => p.text === word.text)) continue;
            
            let wordPlaced = false;
            const maxAttempts = 200;
            
            let attempt, x, y; 
            for (attempt = 0; attempt < maxAttempts && !wordPlaced; attempt++) {
                const angle = attempt * 0.1;
                const radius = (attempt / maxAttempts) * width * 0.25;
                
                x = centerX + radius * Math.cos(angle);
                y = centerY + radius * Math.sin(angle);
                
                
                if (isWordInZone({ ...word, x, y }, zoneCenter1, zoneCenter2, shape, centerX, centerY, width, height)) {
                    if (!checkCollision(word, x, y, placedWords)) {
                        word.x = x;
                        word.y = y;
                        placedWords.push(word);
                        wordPlaced = true;
                        placed++;
                    }
                }
                if (wordPlaced) break;
            }
            // console.log('essai big ', word.text, " attemp=", attempt,",x=", parseInt(x),"y=" , parseInt(y), "size=" , word.size)

        }
        
        // console.log(`${placed} mots placés dans la zone centrale`);
        return placed;
    }
    
    // 2 & 3. Placement des mots moyens
    function placeMediumWords(wordsToPlace) {
        // console.log(`Tentative de placement de ${wordsToPlace.length} mots moyens`);
        let placed = 0;
        
        for (const word of wordsToPlace) {
            if (placedWords.some(p => p.text === word.text)) continue;
            
            let wordPlaced = false;
            const maxAttempts = 300;
            
            // Essayer d'abord dans la zone centrale
            for (let attempt = 0; attempt < maxAttempts / 2 && !wordPlaced; attempt++) {
                const angle = attempt * 0.15;
                const radius = (attempt / maxAttempts) * width * 0.4;
                
                const x = centerX + radius * Math.cos(angle);
                const y = centerY + radius * Math.sin(angle);
                
                if (isWordInZone({ ...word, x, y }, zoneCenter1, zoneCenter2, shape, centerX, centerY, width, height)) {
                    if (!checkCollision(word, x, y, placedWords)) {
                        word.x = x;
                        word.y = y;
                        placedWords.push(word);
                        wordPlaced = true;
                        placed++;
                    }
                }
            }
            
            // Si pas placé, essayer dans la zone intermédiaire
            if (!wordPlaced && nameCloudState.isThreeZones ) {
                for (let attempt = 0; attempt < maxAttempts / 2 && !wordPlaced; attempt++) {
                    const angle = attempt * 0.12;
                    const radius = width * 0.25 + (attempt / maxAttempts) * width * 0.25;
                    
                    const x = centerX + radius * Math.cos(angle);
                    const y = centerY + radius * Math.sin(angle);
                    
                    if (isWordInZone({ ...word, x, y }, zoneMedium1, zoneMedium2, shape, centerX, centerY, width, height)) {
                        if (!checkCollision(word, x, y, placedWords)) {
                            word.x = x;
                            word.y = y;
                            placedWords.push(word);
                            wordPlaced = true;
                            placed++;
                        }
                    }
                }
            }
        }

        // console.log(`${placed} mots moyens placés`);
        return placed;
    }
    
    // 4, 5 & 6. Placement des petits mots
    function placeSmallWords(wordsToPlace) {
        // console.log(`Tentative de placement de ${wordsToPlace.length} petits mots`);
        let placed = 0;
        
        for (const word of wordsToPlace) {
            if (placedWords.some(p => p.text === word.text)) continue;
            
            let wordPlaced = false;
            const maxAttempts = 400;
            
            // Zone centrale (50%)
            for (let attempt = 0; attempt < maxAttempts / 3 && !wordPlaced; attempt++) {
                const angle = attempt * 0.2;
                const radius = (attempt / maxAttempts) * width * 0.6;
                
                const x = centerX + radius * Math.cos(angle);
                const y = centerY + radius * Math.sin(angle);
                
                if (isWordInZone({ ...word, x, y }, zoneCenter1, zoneCenter2, shape, centerX, centerY, width, height)) {
                    if (!checkCollision(word, x, y, placedWords)) {
                        word.x = x;
                        word.y = y;
                        placedWords.push(word);
                        wordPlaced = true;
                        placed++;
                    }
                }
            }
            
            // Zone intermédiaire (75% - 50%)
            if (!wordPlaced && nameCloudState.isThreeZones ) {
                for (let attempt = 0; attempt < maxAttempts / 3 && !wordPlaced; attempt++) {
                    const angle = attempt * 0.15;
                    const radius = width * 0.15 + (attempt / maxAttempts) * width * 0.55;
                    
                    const x = centerX + radius * Math.cos(angle);
                    const y = centerY + radius * Math.sin(angle);
                    
                    if (isWordInZone({ ...word, x, y }, zoneMedium1, zoneMedium2, shape, centerX, centerY, width, height)) {
                        if (!checkCollision(word, x, y, placedWords)) {
                            word.x = x;
                            word.y = y;
                            placedWords.push(word);
                            wordPlaced = true;
                            placed++;
                        }
                    }
                }
            }
            
            // Zone extérieure (100% - 75%)
            if (!wordPlaced && nameCloudState.isThreeZones ) {
                for (let attempt = 0; attempt < maxAttempts && !wordPlaced; attempt++) {
                    // const angle = attempt * 0.1;
                    // const radius = width * 0.5 + (attempt / maxAttempts) * width * 0.25;
                    const angle = attempt * 0.1;
                    const radius = width * 0.15 + (attempt / maxAttempts) * width * 0.55;
                    

                    const x = centerX + radius * Math.cos(angle);
                    const y = centerY + radius * Math.sin(angle);
                    
                    if (isWordInZone({ ...word, x, y }, zoneExternal1, zoneExternal2, shape, centerX, centerY, width, height)) {
                        if (!checkCollision(word, x, y, placedWords)) {
                            word.x = x;
                            word.y = y;
                            placedWords.push(word);
                            wordPlaced = true;
                            placed++;
                        }
                    }
                }
            }
        }
        
        // console.log(`${placed} petits mots placés`);
        return placed;
    }
    
    // Exécuter l'algorithme de placement

// Calculer et stocker la shape maps si elle n'existe pas
    globalShapeMap = createShapeMatrix() 
    computeShapeLimits();
    // console.log("DEBUG scale=", scale ,", minX, maxX, minY, maxY=  ", minX, maxX, minY, maxY, 0.6 , nameCloudState.paddingLocal, Math.max(0.1, (20 - nameCloudState.paddingLocal)/10))


    placeWordsInCentralZone(largeWords);
    placeMediumWords(mediumWords);
    placeSmallWords(smallWords);
    
    // // Essayer de placer les mots restants
    const remainingWords = words.filter(word => !placedWords.some(p => p.text === word.text));
    
    if (remainingWords.length > 0) {
        // console.log(`Il reste ${remainingWords.length} mots à placer`);
        
        for (const word of remainingWords) {
            let wordPlaced = false;
            const maxAttempts = 500;
            
            for (let attempt = 0; attempt < maxAttempts && !wordPlaced; attempt++) {
                const angle = Math.random() * 2 * Math.PI;
                const radius = Math.random() * width * 0.45;
                
                const x = centerX + radius * Math.cos(angle);
                const y = centerY + radius * Math.sin(angle);
                
                if (isWordInZone({ ...word, x, y }, zoneFull1, zoneFull2, shape, centerX, centerY, width, height)) {
                    if (!checkCollision(word, x, y, placedWords)) {
                        word.x = x;
                        word.y = y;
                        placedWords.push(word);
                        wordPlaced = true;
                    }
                }
            }
        }
    }
    
    // console.log(`Total mots placés: ${placedWords.length}/${totalWords} (${Math.round(placedWords.length/totalWords*100)}%)`);
    return placedWords;
}




// ================ FONCTIONS DE VISUALISATION ================
// Fonction pour générer les formes concentriques
export function generateConcentricShapes(textGroup, shape, width, height) {
    // Générer les chemins pour les différentes tailles
    const pathString100 = createShapePath(shape, width, height, 1.0);
    // Ajouter les formes au textGroup
    textGroup.append('path')
        .attr('class', 'shape-path-100')
        .attr('d', pathString100)
        .attr('stroke', 'red')
        .attr('fill', 'none')
        .attr('stroke-width', 1)
        .lower();

    // if (nameCloudState.isThreeZones)
    // {
    //     const pathString75 = createShapePath(shape, width, height, 0.75);
    //     const pathString50 = createShapePath(shape, width, height, 0.5);
            
    //     textGroup.append('path')
    //         .attr('class', 'shape-path-75')
    //         .attr('d', pathString75)
    //         .attr('stroke', 'green')
    //         .attr('fill', 'none')
    //         .attr('stroke-width', 1)
    //         .lower();
            
    //     textGroup.append('path')
    //         .attr('class', 'shape-path-50')
    //         .attr('d', pathString50)
    //         .attr('stroke', 'blue')
    //         .attr('fill', 'none')
    //         .attr('stroke-width', 1)
    //         .lower();
    // }
}
