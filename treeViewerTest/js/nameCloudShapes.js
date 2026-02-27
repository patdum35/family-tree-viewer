import { nameCloudState } from './nameCloud.js'
// import { nameCloudState } from './main.js';

export function createShapePath(shape, width, height, scale = 1.0) {
    // Appeler la fonction appropriée selon la forme
    switch (shape) {
        case 'coeur':
            return createHeartPath(width, height, scale);
        case 'etoile':
            return createStarPath(width, height, scale);
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
        default:
            return computeRectangleLimits();
    }

}

let globalShapeMap= null;
let verylargeWordThreshold = 75;
let largeWordThreshold = 34;
let mediumWordThreshold = 24;
let standardThreshold = 17;
let padding_Local = 4;

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
    
    return pathString;
}

export function createHeartShapeMatrix() {

    // console.log(`Calcul de la shapeMap `);
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


// ================ FONCTION DE DEBUG  ================
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
    safetyOverlap = Math.max(1, 7 - padding_Local);
    if (word.size > verylargeWordThreshold) {safetyOverlap =  Math.max(1, 5 - padding_Local);}

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
    if (padding_Local >= 4)
    { 
        safetyMargin = word.size * Math.max(0.1, (4/padding_Local)*0.6); 
    }  // 0.6 //0.1; //Plus le nombre est grand et positif plus les mots sont ressérés
    else
    {
        if (padding_Local == 4)
            safetyMargin = word.size * 0.7;
        else if (padding_Local == 3)
            safetyMargin = word.size * 0.8;
        else if (padding_Local == 2)
            safetyMargin = word.size * 0.9;
        else if (padding_Local == 1)
            safetyMargin = word.size * 1.0;
    }
    

    // Marge minimale pour les petits mots en périphérie, maximale pour les gros mots au centre
    // safetyMargin = -20; //Math.max(1, word.size * 0.001 * (1 + sizeFactor + distanceFactor));

 
    // Si c'est un grand mot ET qu'il est proche du centre
    if (word.size >= verylargeWordThreshold ) {
        safetyMargin = word.size * 0.1 ; // Marge très négative pour les grands mots au centre
    } else if (word.size >= largeWordThreshold ) {
        if( padding_Local <= 2) {
            safetyMargin = word.size * 0.8 ; // Marge très négative pour les grands mots au centre
        }
    } else if (word.size >= mediumWordThreshold ) {
        if( padding_Local <= 2) {
            safetyMargin = safetyMargin + 0.01*word.size ; // Marge très négative pour les grands mots au centre
        } else {
            safetyMargin = safetyMargin + 0.03*word.size ; // Marge très négative pour les grands mots au centre
        }
        
    } else if (word.size >= standardThreshold ) {
        if( padding_Local <= 2) {
            safetyMargin = safetyMargin + 0.05*word.size ; // Marge très négative pour les grands mots au centre
        } else {
            safetyMargin = safetyMargin + 0.1*word.size ; // Marge très négative pour les grands mots au centre
        }

    } else {
        if( padding_Local <= 2) {
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

function computeWordsGroups(words, shape) {
    padding_Local = nameCloudState.paddingLocal;
    if ((nameCloudState.currentConfig.type === 'duree_vie') || (nameCloudState.currentConfig.type === 'age_marriage') || (nameCloudState.currentConfig.type === 'age_first_child')  || (nameCloudState.currentConfig.type === 'nombre_enfants')  ||(nameCloudState.currentConfig.type === 'age_procreation') )
    {
        padding_Local = nameCloudState.paddingLocal + 1;
    }
    
    
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
    const {largeWords, mediumWords, smallWords} = computeWordsGroups(words, shape);

    // Trier les mots par taille décroissante
    words.sort((a, b) => b.size - a.size);
    
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

}
