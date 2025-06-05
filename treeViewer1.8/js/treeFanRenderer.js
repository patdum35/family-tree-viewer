// ====================================
// Rendu de l'arbre en éventail - Version 360° complète
// ====================================
import { state, displayGenealogicTree } from './main.js';
import { setupElegantBackground } from './backgroundManager.js';


let fanZoom;
let lastFanTransform = null;
let fanConfig = {
    innerRadius: 80,
    generationWidth: 80,
    centerX: 0,
    centerY: 0,
    totalAngle: 2 * Math.PI, // 360° complet
    startAngle: -Math.PI / 2, // Commencer en haut
    maxGenerations: 4,
    limitMaxGenerations: 26 
};
let lastWinner = null;

let leverStartTime = 0;

let cachedRadarPNG = null;
let isCacheValid = false;

// let state.currentRadarAngle = 0; //  angle de départ du radar
let previousRootPersonId = null;
let previousNombreGeneration = null;

let currentAnimationTimeouts = [];
let allWinnerSegments = []; // Mémoriser tous les segments gagnants

/**
 * Initialise et dessine l'arbre en éventail complet 360°
 */
export function drawFanTree(isZoomRefresh = false, isAnimation = false) {
    if (!state.currentTree) {
        console.error('❌ Pas d\'arbre à dessiner');
        return;
    }
    

    console.log('🌟 Début du rendu éventail 360°...');
    console.log('📊 Arbre reçu:', state.currentTree);
    
    const svg = setupFanSVG();
    const mainGroup = createFanMainGroup(svg);
    
    // Configuration selon le mode
    configureFanMode();
    
    // Organiser les données par génération avec logique positionnelle
    const generationsData = organizeByGenerations(state.currentTree);
    console.log('📊 Données par génération:', generationsData);
    
    // Créer les filtres et defs
    createSVGFilters(svg);
    
    // Dessiner le centre
    drawCenterPerson(mainGroup, state.currentTree);
    
    // Dessiner chaque génération
    drawAllGenerations(mainGroup, generationsData);
    
    // Configuration du zoom
    setupFanZoom(svg, mainGroup);
    
    // Gestion de l'affichage initial
    // if (!isAnimation && isZoomRefresh) {
    // if (!isZoomRefresh) {
    //     resetFanView();
    // }

    resetFanView();
    
    // Fond élégant
    if (state.initialTreeDisplay) {
        state.initialTreeDisplay = false;
        setTimeout(() => {
            setupElegantBackground(svg);
        }, 100);
    } else {
        setupElegantBackground(svg);
    }
    
    console.log('✅ Rendu éventail 360° terminé');

    // Générer le cache PNG seulement s'il n'existe pas
    if (!isCacheValid || !cachedRadarPNG || (previousRootPersonId != state.rootPersonId) || (previousNombreGeneration != state.nombre_generation)) {
        console.log(`🔄 \n\nGénération du cache PNG...`);
        setTimeout(() => {
            generateRadarCache();
        }, 500);
    } else {
        console.log(`✅ \n\nCache PNG déjà disponible`);
    }

    previousRootPersonId = state.rootPersonId;
    previousNombreGeneration = state.nombre_generation;
    
    console.log('\n\n ******* DEBUG : ', state.rootPersonId, state.nombre_generation)
}



// AJOUTER cette nouvelle fonction dans treeFanRenderer.js
async function generateRadarCache() {
    try {
        console.log('🎯 Génération du cache PNG...');
        const startTime = performance.now();
        
        const originalSvg = d3.select("#tree-svg");
        if (originalSvg.empty()) {
            console.warn('⚠️ SVG non trouvé pour cache');
            return;
        }

        // Masquer le fond d'écran pour avoir un fond blanc
        d3.selectAll('.background-element, .bubble-group').style('display', 'none');
             
        // Canvas
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Sérialisation SVG
        const serializeStart = performance.now();
        const svgData = new XMLSerializer().serializeToString(originalSvg.node());
        const serializeEnd = performance.now();
        console.log(`⏱️ Sérialisation SVG cache: ${(serializeEnd - serializeStart).toFixed(1)}ms`);
        
        const img = new Image();
        
        img.onload = function() {
            console.log(`📏 Taille PNG en cache: ${canvas.width}×${canvas.height} = ${canvas.width * canvas.height} pixels`);
            console.log(`📏 Données à traiter: ${canvas.width * canvas.height * 4} bytes`);
            const imageLoadEnd = performance.now();
            console.log(`⏱️ Chargement image SVG en cache: ${(imageLoadEnd - serializeEnd).toFixed(1)}ms`);
                        
            const drawStart = performance.now();
            ctx.drawImage(img, 0, 0);
            const drawEnd = performance.now();
            console.log(`⏱️ Dessin sur canvas cache: ${(drawEnd - drawStart).toFixed(1)}ms`);
            
            // Traitement pixels pour transparence
            const pixelStart = performance.now();
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            // remettre le fond d'écran 
            d3.selectAll('.background-element, .bubble-group').style('display', null);

            const pixelgetImageData = performance.now();
            console.log(`⏱️ Traitement ctx.getImageData: ${(pixelgetImageData - pixelStart).toFixed(1)}ms`); 
            

            const data = imageData.data;
            
            // Remplacer blanc par transparent
            for (let i = 0; i < data.length; i += 4) {
                if (data[i] === 255 && data[i+1] === 255 && data[i+2] === 255) {
                    data[i + 3] = 0;
                }
            }
            
            ctx.putImageData(imageData, 0, 0);
            const pixelEnd = performance.now();
            console.log(`⏱️ Traitement pixels cache: ${(pixelEnd - pixelStart).toFixed(1)}ms`);
            
            cachedRadarPNG = canvas.toDataURL("image/png");
            isCacheValid = true;
            
            const totalEnd = performance.now();
            console.log(`✅ Cache PNG généré en: ${(totalEnd - startTime).toFixed(1)}ms`);
        };
        
        const encodedSvgData = encodeURIComponent(svgData);
        img.src = "data:image/svg+xml;charset=utf-8," + encodedSvgData;
        
    } catch (error) {
        console.error('❌ Erreur génération cache:', error);
        isCacheValid = false;
        // Nettoyer en cas d'erreur
        d3.selectAll('.background-element, .bubble-group').style('display', null);
    }
}

/**
 * Configure le mode éventail
 */
function configureFanMode() {
    // Toujours 360° complet pour le mode ancêtres
    fanConfig.totalAngle = 2 * Math.PI;
    fanConfig.startAngle = -Math.PI / 2;
}

/**
 * Configure le SVG initial
 */
function setupFanSVG() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    fanConfig.centerX = width / 2;
    fanConfig.centerY = height / 2;
    
    const svg = d3.select("#tree-svg")
        .attr("width", width)
        .attr("height", height)
        .style("touch-action", "pan-x pan-y pinch-zoom");
    
    svg.selectAll("*").remove();
    return svg;
}

/**
 * Crée le groupe principal pour l'éventail
 */
function createFanMainGroup(svg) {
    return svg.append("g")
        .attr("transform", `translate(${fanConfig.centerX}, ${fanConfig.centerY})`);
}

/**
 * Crée les filtres SVG nécessaires
 */
function createSVGFilters(svg) {
    let defs = svg.select('defs');
    if (defs.empty()) {
        defs = svg.append('defs');
    }
    
    // Filtre d'ombre
    if (defs.select('#drop-shadow').empty()) {
        const filter = defs.append('filter')
            .attr('id', 'drop-shadow')
            .attr('height', '125%')
            .attr('width', '125%');
        
        filter.append('feGaussianBlur')
            .attr('in', 'SourceAlpha')
            .attr('stdDeviation', 2)
            .attr('result', 'blur');
        
        filter.append('feOffset')
            .attr('in', 'blur')
            .attr('dx', 2)
            .attr('dy', 2)
            .attr('result', 'offsetBlur');
        
        filter.append('feComponentTransfer')
            .append('feFuncA')
            .attr('type', 'linear')
            .attr('slope', '0.5');
        
        const feMerge = filter.append('feMerge');
        feMerge.append('feMergeNode').attr('in', 'offsetBlur');
        feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
    }
}

/**
 * Configure le zoom pour l'éventail
 */
function setupFanZoom(svg, mainGroup) {
    // Calculer un zoom optimal basé sur le nombre de générations et la taille de la fenêtre
    const calculateOptimalZoom = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Rayon total du radar
        const totalRadius = fanConfig.innerRadius + (fanConfig.maxGenerations * fanConfig.generationWidth);   

        // Calcul du zoom pour que le radar tienne dans la fenêtre
        // On laisse une marge de 10% de chaque côté
        const widthZoom = (width * 0.8) / (2 * totalRadius);
        const heightZoom = (height * 0.8) / (2 * totalRadius);
        
        // Prendre le zoom le plus petit pour s'assurer que tout rentre
        const optimalZoom = Math.min(widthZoom, heightZoom);
        
        // Limiter entre 0.1 et 1 pour éviter des zooms trop extrêmes
        return Math.max(0.1, Math.min(optimalZoom, 1));
    };

    fanZoom = d3.zoom()
        .scaleExtent([0.1, 3]) // Garder une liberté de zoom
        .on("zoom", ({transform}) => {
            // Toujours centrer, mais autoriser le zoom
            lastFanTransform = transform;
            mainGroup.attr("transform", 
                // `translate(${fanConfig.centerX}, ${fanConfig.centerY}) scale(${transform.k})`);
                `translate(${transform.x}, ${transform.y}) scale(${transform.k})`);
        });
    
    svg.call(fanZoom);
    
    // Transformation initiale optimale
    const initialZoom = calculateOptimalZoom();
    const initialTransform = d3.zoomIdentity
        .translate(fanConfig.centerX, fanConfig.centerY)
        .scale(initialZoom);
    
    svg.call(fanZoom.transform, initialTransform);
}

/**
 * Réinitialise la vue de l'éventail
 */
// export function resetFanView() {
//     const svg = d3.select("#tree-svg");
//     if (fanZoom) {
//         const resetTransform = d3.zoomIdentity.scale(0.7);
//         svg.transition()
//             .duration(750)
//             .call(fanZoom.transform, resetTransform);
//     }
// }

function resetBrowserZoom() {
    // // Méthode 1 : Scroll vers le haut pour forcer le reset
    // window.scrollTo(0, 0);
    
    // Méthode 2 : Manipulation du viewport temporaire
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
        const original = viewport.getAttribute('content');
        
        // Force le reset en modifiant temporairement le viewport
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        
        // Remettre l'original après 100ms
        setTimeout(() => {
            viewport.setAttribute('content', original || 'width=device-width, initial-scale=1.0, user-scalable=yes');
        }, 100);
    }
    
    // // Méthode 3 : Force refresh du layout
    // document.body.style.transform = 'scale(1.001)';
    // setTimeout(() => {
    //     document.body.style.transform = '';
    // }, 50);
}


export function resetFanView() {

    // // Forcer le zoom navigateur à 1
    // if (window.visualViewport) {
    //     // Méthode moderne
    //     document.documentElement.style.transform = 'scale(1)';
    //     document.documentElement.style.transformOrigin = '0 0';
    // } else {
    //     // Fallback : viewport meta refresh
    //     let viewport = document.querySelector('meta[name="viewport"]');
    //     if (viewport) {
    //         const content = viewport.getAttribute('content');
    //         viewport.setAttribute('content', content + ', initial-scale=1.0');
    //         // Force refresh
    //         setTimeout(() => {
    //             viewport.setAttribute('content', content);
    //         }, 100);
    //     }
    // }

    resetBrowserZoom();

    // zoom du d3.js
    const svg = d3.select("#tree-svg");
    if (fanZoom) {
        // Calculer le zoom optimal et centrer
        const width = window.innerWidth;
        const height = window.innerHeight;
        const totalRadius = fanConfig.innerRadius + (fanConfig.maxGenerations * fanConfig.generationWidth);
        const optimalZoom = Math.min((width * 0.8) / (2 * totalRadius), (height * 0.8) / (2 * totalRadius));
        const finalZoom = Math.max(0.1, Math.min(optimalZoom, 1));
        
        const resetTransform = d3.zoomIdentity
            .translate(fanConfig.centerX, fanConfig.centerY)
            .scale(finalZoom);
            
        svg.transition()
            .duration(750)
            .call(fanZoom.transform, resetTransform);
    }
}


/**
 * Change la personne racine
 */
// function changeRootPerson(personId) {
//     console.log(`🎯 Changement de racine vers: ${personId}`);
//     if (typeof displayGenealogicTree === 'function') {
//         console.log('\n\n\n\n #######   CALL displayGenealogicTree in changeRootPerson ### ')
//         displayGenealogicTree(personId, false, false, false, state.treeModeReal);
//         setupFanZoom();
//     }
// }

function changeRootPerson(personId) {
    console.log(`🎯 Changement de racine vers: ${personId}`);
    
    // Vérifier que fanZoom existe avant d'appeler displayGenealogicTree
    if (!fanZoom) {
        console.warn('⚠️ fanZoom pas encore initialisé, on attend...');
        setTimeout(() => changeRootPerson(personId), 100);
        return;
    }
    
    if (typeof window.displayGenealogicTree === 'function') {
        window.displayGenealogicTree(personId, false, false, false, state.treeModeReal);
    } else {
        console.error('❌ displayGenealogicTree non trouvée');
    }
}

/**
 * Affiche les détails d'une personne
 */
function displayPersonDetails(personId) {
    if (typeof window.displayPersonDetails === 'function') {
        window.displayPersonDetails(personId);
    }
    console.log(`Affichage des détails pour: ${personId}`);
}

/**
 * Modifie le nombre maximum de générations
 */
export function setMaxGenerations(max) {
    fanConfig.maxGenerations = Math.min(max, fanConfig.limitMaxGenerations);
    console.log(`📊 Générations max mises à jour: ${max}`);

    // Invalider le cache
    isCacheValid = false;
    cachedRadarPNG = null;
    
    if (state.currentTree && state.rootPersonId) {
        setTimeout(() => {
            if (typeof displayGenealogicTree === 'function') {
                console.log('\n\n\n\n ###################   CALL displayGenealogicTree in setMaxGenerations  ################# ')
                displayGenealogicTree(state.rootPersonId, false, false, false, 'fanAncestors');
            }
        }, 100);
    }
}

/**
 * Modifie le nombre maximum de générations
 */
export function setMaxGenerationsInit(max) {
    fanConfig.maxGenerations = Math.min(max, fanConfig.limitMaxGenerations);
    console.log(`📊 Générations max mises à jour: ${max}`);
}

function getGenerationColor(generation) {
    const colors = [
        '#e3f2fd', // gen 1 - bleu très clair
        '#bbdefb', // gen 2 - bleu clair
        '#90caf9', // gen 3 - bleu moyen
        '#64b5f6', // gen 4 - bleu
        '#42a5f5', // gen 5 - bleu foncé
        '#2196f3', // gen 6 - bleu plus foncé
        '#1976d2', // gen 7 - bleu très foncé
        '#1565c0'  // gen 8 - bleu foncé final
    ];
    return colors[Math.min(generation - 1, colors.length - 1)] || '#e3f2fd';
}

/**
 * Organisation par génération avec positionnement généalogique CORRECT
 * Convention: segment 0 en bas, sens horaire, père toujours à gauche de la mère
 */
function organizeByGenerations(rootTree) {
    console.log('📋 Organisation par génération GÉNÉALOGIQUE...');
    // console.log('🌟 Arbre racine:', rootTree);
    
    const generations = new Map();
    
    function traverse(person, generation, position = 0) {
        if (!person || generation > fanConfig.maxGenerations) return;
        
        if (!generations.has(generation)) {
            generations.set(generation, []);
        }
        
        // Ajouter la personne avec sa position calculée
        generations.get(generation).push({
            person: person,
            generation: generation,
            position: position
        });
        
        
        // Continuer avec les enfants (qui sont en fait les parents dans l'arbre ascendant)
        if (person.children && generation < fanConfig.maxGenerations) {
            
            // IMPORTANT: Dans l'arbre ascendant, person.children contient les PARENTS de person
            // Il faut les trier: père en position 0, mère en position 1
            
            let fatherPerson = null;
            let motherPerson = null;
            
            // Identifier père et mère parmi les "children" (parents)
            for (const child of person.children) {
                if (child.id === person.genealogicalFatherId) {
                    fatherPerson = child;
                    // console.log(`   └─ Père identifié: ${child.name} (${child.id})`);
                } else if (child.id === person.genealogicalMotherId) {
                    motherPerson = child;
                    // console.log(`   └─ Mère identifiée: ${child.name} (${child.id})`);
                }
            }
            
            // Placer dans l'ordre: père d'abord (position paire), mère ensuite (position impaire)
            if (fatherPerson) {
                const fatherPosition = position * 2;
                traverse(fatherPerson, generation + 1, fatherPosition);
            }
            if (motherPerson) {
                const motherPosition = position * 2 + 1;
                traverse(motherPerson, generation + 1, motherPosition);
            }
        }
    }
    
    traverse(rootTree, 0, 0);
        
    return generations;
}

/**
 * Dessine une génération avec positionnement généalogique correct
 * Convention : position 0 en bas (-90°), sens horaire
 * le 0° en angle est en haut du cercle
 */
function drawGeneration(mainGroup, people, generation) {
    // console.log(`🎨 Dessin génération ${generation} avec ${people.length} personnes`);

    const innerRadius = fanConfig.innerRadius + ((generation - 1) * fanConfig.generationWidth);
    const outerRadius = innerRadius + fanConfig.generationWidth - 5;

    const maxSegments = Math.pow(2, generation);
    const anglePerSegment = (2 * Math.PI) / maxSegments;
    
    const positionArray = new Array(maxSegments).fill(null);
    
    people.forEach(personData => {
        if (personData.position < maxSegments) {
            positionArray[personData.position] = personData.person;
        }
    });
    
    people.forEach(personData => {
        const startAngle = -Math.PI + (personData.position * anglePerSegment);
        const endAngle = startAngle + anglePerSegment;
        drawPersonSegment(mainGroup, personData.person, innerRadius, outerRadius, startAngle, endAngle, generation, personData.position);
    });
}

/**
 * Dessine le texte d'un segment avec le même style que l'arbre normal
 */
function drawSegmentText(group, person, innerRadius, outerRadius, startAngle, endAngle, generation) {
    const midAngle = -Math.PI/2 + (startAngle + endAngle) / 2;
    const textRadius = (innerRadius + outerRadius) / 2;
    const textX = Math.cos(midAngle) * textRadius;
    const textY = Math.sin(midAngle) * textRadius;
    
    // Calculer la rotation du texte pour qu'il soit toujours lisible
    let rotation = (midAngle * 180 / Math.PI);
    if (rotation > -270 && rotation < -90) {
        rotation += 180;
    }
    while (rotation > 360) rotation -= 360;
    while (rotation < 0) rotation += 360;
    
    const textGroup = group.append("g")
        .attr("class", "segment-text-group")
        .attr("transform", `translate(${textX}, ${textY}) rotate(${rotation})`);
    
    // Utiliser la même logique que l'arbre normal
    const match = person.name?.match(/(.*?)\/(.*?)\//);
    if (match) {
        drawFanPersonDetails(textGroup, match, person, generation);
    } else {
        // Nom simple sans format GEDCOM
        textGroup.append("text")
            .attr("x", 0)
            .attr("y", 0)
            .attr("text-anchor", "middle")
            .style("font-size", `${Math.max(10, 16 - generation * 2)}px`)
            .style("font-weight", "bold")
            .style("fill", "#1a1a1a")
            .style("stroke", "white")
            .style("stroke-width", "1px")
            .style("paint-order", "stroke fill")
            .text(person.name.substring(0, 12));
    }
}

/**
 * Formate les noms (réutilise la logique de nodeRenderer.js)
 */
function formatLastNames(lastNames) {
    return lastNames.trim()
        .split('(')[0]
        .replace(')', '')
        .split(',')[0]
        .split(' ')
        .join(' ')
        .slice(0, 12); // Max 12 caractères pour l'éventail
}

/**
 * Capitalise la première lettre
 */
function capitalizeFirstLetter(word) {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

/**
 * Formate les dates pour l'éventail (même logique que nodeRenderer.js)
 */
function formatFanDates(person) {
    if (!person.birthDate && !person.deathDate) return '';
    
    const extractYear = (dateStr) => {
        if (!dateStr) return null;
        const match = dateStr.match(/(\d{4})/);
        return match ? match[1] : null;
    };
    
    const birthYear = person.birthDate ? extractYear(person.birthDate) : '?';
    const deathYear = person.deathDate ? extractYear(person.deathDate) : '?';
    
    let dateText = birthYear;
    if (parseInt(birthYear) <= 1930 || deathYear !== '?') {
        dateText += ` - ${deathYear}`;
    }
    
    return dateText;
}

/**
 * Configuration des paramètres d'affichage par génération
 */
const FAN_TEXT_CONFIG = {
    // Espacement entre les lignes par génération
    lineSpacingFactor: 1.2,
    
    // Taille de police de base par génération
    baseFontSize: {
        0: 16,  // Centre
        1: 14,  // Gen 1
        2: 12,  // Gen 2
        3: 10,  // Gen 3
        4: 8,   // Gen 4+
        default: 8
    },
    
    // Réduction de police si texte trop long
    fontReduction: {
        threshold: 8,    // Seuil de nombre de lettres
        reductionFactor: 0.8  // Facteur de réduction (80% de la taille)
    },
    
    // Nombre maximum de prénoms par génération
    maxFirstNames: {
        0: 2,   // Centre
        1: 2,   // Gen 1
        2: 2,   // Gen 2
        3: 2,   // Gen 3
        4: 1,   // Gen 4+
        default: 1
    }
};

/**
 * Calcule la taille de police adaptée selon la longueur du texte
 */
function calculateAdaptiveFontSize(text, baseSize) {
    const config = FAN_TEXT_CONFIG.fontReduction;
    if (text.length > config.threshold) {
        return Math.round(baseSize * config.reductionFactor);
    }
    return baseSize;
}

/**
 * Formate les prénoms pour l'éventail (adapté par génération)
 */
function formatFirstNamesForFan(firstNames, generation) {
    const config = FAN_TEXT_CONFIG;
    const maxNames = config.maxFirstNames[generation] || config.maxFirstNames.default;
    
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
        .slice(0, maxNames)
        .join(' ')
        .slice(0, 20); // Limite globale de caractères
}

/**
 * Dessine les détails d'une personne dans l'éventail avec centrage correct
 */
function drawFanPersonDetails(textGroup, match, person, generation) {
    const [_, firstNames, lastName] = match;
    const formattedFirstNames = formatFirstNamesForFan(firstNames, generation);
    const formattedLastName = formatLastNames(lastName);
    
    // Récupérer les paramètres pour cette génération
    const config = FAN_TEXT_CONFIG;
    const baseSize = config.baseFontSize[generation] || config.baseFontSize.default;
    // const lineSpacing = config.lineSpacing[generation] || config.lineSpacing.default;
    const lineSpacing = baseSize * config.lineSpacingFactor;
    const maxNames = config.maxFirstNames[generation] || config.maxFirstNames.default;
    
    // Préparer les éléments à dessiner
    const firstNamesList = formattedFirstNames.split(' ').slice(0, maxNames);
    const hasDate = generation <= 3 && formatFanDates(person);
    
    // Calculer la hauteur totale
    const totalLines = firstNamesList.length + 1 + (hasDate ? 1 : 0); // prénoms + nom + date éventuelle
    const totalHeight = (totalLines - 1) * lineSpacing;
    
    // Position de départ (pour centrer le nom au milieu)
    // const startY = -(totalHeight / 2) + (firstNamesList.length * lineSpacing);
    // const startY = -((firstNamesList.length - 1) * lineSpacing / 2);// - lineSpacing;
    let startY;
    if (firstNamesList.length === 1) {
        startY = -lineSpacing*0.3;
    } else {
        startY = -lineSpacing*0.3; //-((firstNamesList.length - 1) * lineSpacing / 2);// - lineSpacing;  
    }
    
    // Dessiner les prénoms (au-dessus du nom)
    firstNamesList.forEach((firstName, index) => {
        const fontSize = calculateAdaptiveFontSize(firstName, baseSize);
        const y = startY - lineSpacing * (firstNamesList.length - index);
        
        textGroup.append("text")
            .attr("x", 0)
            .attr("y", y)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .style("font-size", `${fontSize}px`)
            .style("font-weight", "bold")
            .style("fill", "#1a1a1a")
            .style("stroke", "white")
            .style("stroke-width", "1px")
            .style("paint-order", "stroke fill")
            .text(firstName);
    });
    
    // Dessiner le nom (centré au milieu)
    const nameFontSize = calculateAdaptiveFontSize(formattedLastName, baseSize);
    textGroup.append("text")
        .attr("x", 0)
        .attr("y", 0) // Centré au milieu
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-size", `${nameFontSize}px`)
        .style("font-weight", "bold")
        .style("fill", "#0000CD")
        .style("stroke", "white")
        .style("stroke-width", "1px")
        .style("paint-order", "stroke fill")
        .text(formattedLastName.toUpperCase());
    
    // Dessiner la date (sous le nom)
    if (hasDate) {
        const dateText = formatFanDates(person);
        const dateFontSize = Math.max(6, nameFontSize - 2);
        
        textGroup.append("text")
            .attr("x", 0)
            .attr("y", lineSpacing)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .style("font-size", `${dateFontSize}px`)
            .style("font-weight", "normal")
            .style("fill", "#006400")
            .style("stroke", "white")
            .style("stroke-width", "0.8px")
            .style("paint-order", "stroke fill")
            .text(dateText);
    }
}

/**
 * Améliore le rendu du centre avec centrage correct du nom
 */
function drawCenterPersonText(group, person) {
    const textGroup = group.append("g").attr("class", "center-text-group");
    
    if (!person.name) return;
    
    const match = person.name?.match(/(.*?)\/(.*?)\//);
    if (match) {
        const [_, firstNames, lastName] = match;
        const formattedFirstNames = formatFirstNamesForFan(firstNames, 0);
        const formattedLastName = formatLastNames(lastName);
        
        const config = FAN_TEXT_CONFIG;
        const baseSize = config.baseFontSize[0];
        // const lineSpacing = config.lineSpacing[0];
        const lineSpacing = baseSize * config.lineSpacingFactor;
        
        // Préparer les éléments
        const firstNamesList = formattedFirstNames.split(' ').slice(0, 2);
        const hasDate = formatFanDates(person);
        
        // Calculer positions pour centrer le nom
        const totalLines = firstNamesList.length + 1 + (hasDate ? 1 : 0);
        const totalHeight = (totalLines - 1) * lineSpacing;
        // const startY = -(totalHeight / 2) + (firstNamesList.length * lineSpacing);
        // const startY = -((firstNamesList.length - 1) * lineSpacing / 2);// - lineSpacing;
        let startY;
        if (firstNamesList.length === 1) {
            startY = -lineSpacing*0.3;
        } else {
            startY = -lineSpacing*0.3; //-((firstNamesList.length - 1) * lineSpacing / 2);// - lineSpacing;  
        }
        
        // Dessiner les prénoms
        firstNamesList.forEach((firstName, index) => {
            const fontSize = calculateAdaptiveFontSize(firstName, baseSize);
            const y = startY - lineSpacing * (firstNamesList.length - index);
            
            textGroup.append("text")
                .attr("x", 0)
                .attr("y", y)
                .attr("text-anchor", "middle")
                .style("font-size", `${fontSize}px`)
                .style("font-weight", "bold")
                .style("fill", "white")
                .style("stroke", "rgba(0,0,0,0.5)")
                .style("stroke-width", "1px")
                .style("paint-order", "stroke fill")
                .text(firstName);
        });
        
        // Nom de famille (centré)
        const nameFontSize = calculateAdaptiveFontSize(formattedLastName, baseSize - 2);
        textGroup.append("text")
            .attr("x", 0)
            .attr("y", 0) // Centré
            .attr("text-anchor", "middle")
            .style("font-size", `${nameFontSize}px`)
            .style("font-weight", "bold")
            .style("fill", "#e6f3ff")
            .style("stroke", "rgba(0,0,0,0.5)")
            .style("stroke-width", "1px")
            .style("paint-order", "stroke fill")
            .text(formattedLastName.toUpperCase());
        
        // Date (sous le nom)
        if (hasDate) {
            const dateText = formatFanDates(person);
            textGroup.append("text")
                .attr("x", 0)
                .attr("y", lineSpacing)
                .attr("text-anchor", "middle")
                .style("font-size", `${Math.max(8, nameFontSize - 2)}px`)
                .style("fill", "#b3d9ff")
                .style("stroke", "rgba(0,0,0,0.3)")
                .style("stroke-width", "0.8px")
                .style("paint-order", "stroke fill")
                .text(dateText);
        }
    }
}

function drawAllGenerations(mainGroup, generationsData) {
    console.log('🎨 Début du dessin des générations...');
    
    // Debug de la structure reçue
    console.log('📊 Données reçues:', generationsData);
    generationsData.forEach((people, gen) => {
        console.log(`  Gen ${gen}: ${people.length} personnes`);
    });
    
    generationsData.forEach((people, generation) => {
        if (generation > 0 && generation <= fanConfig.maxGenerations) {
            console.log(`🖊️ Génération ${generation}: ${people.length} personnes`);
            drawGeneration(mainGroup, people, generation);
        }
    });

}

function drawPersonSegment(mainGroup, person, innerRadius, outerRadius, startAngle, endAngle, generation, position) {
    if (!person || !person.name) {
        console.warn('⚠️ Personne invalide pour segment:', person);
        return;
    }
    
    const arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)
        .startAngle(startAngle)
        .endAngle(endAngle);
    
    const segmentGroup = mainGroup.append("g")
        .attr("class", `person-segment-group gen-${generation}`)
        .attr("data-segment-position", position)
        .datum(person); 
    
    // Couleur selon la génération
    const fillColor = getGenerationColor(generation);
    
    // Segment principal avec données liées
    let clickTimeout = null;
    segmentGroup.append("path")
        .attr("d", arc)
        .attr("class", `person-box person-segment generation-${generation}`)
        .datum(person) // ← AJOUT : lier les données au path aussi
        .style("fill", fillColor)
        .style("stroke", "white")
        .style("stroke-width", "1")
        .style("filter", "url(#drop-shadow)")
        .style("cursor", "pointer")
        .style("touch-action", "manipulation")
        // .on("click", function(event, d) { 
        //     event.stopPropagation();
        //     displayPersonDetails(d.id);
        // })
        // .on("dblclick", function(event, d) { 
        //     event.stopPropagation();
        //     changeRootPerson(d.id);
        // });
        // .on("click", function(event, d) { 
        //     event.stopPropagation();
            
        //     // Délai pour distinguer click simple du double-click
        //     setTimeout(() => {
        //         if (!this._doubleClicked) {
        //             displayPersonDetails(d.id);
        //         }
        //         this._doubleClicked = false;
        //     }, 300);
        // })
        // .on("dblclick", function(event, d) { 
        //     event.stopPropagation();
        //     this._doubleClicked = true;
        //     changeRootPerson(d.id);
        // })
        // .on("touchend", function(event, d) {
        //     event.stopPropagation();
        //     event.preventDefault();
            
        //     const now = Date.now();
        //     const timeDiff = now - (this._lastTap || 0);
            
        //     if (timeDiff < 400 && timeDiff > 0) {
        //         // Double-tap détecté
        //         changeRootPerson(d.id);
        //     } else {
        //         // Premier tap
        //         setTimeout(() => {
        //             displayPersonDetails(d.id);
        //         }, 400);
        //     }
            
        //     this._lastTap = now;
        // });



        .on("click", function(event, d) { 
            event.stopPropagation();
            
            // Annuler le timeout précédent s'il existe
            if (clickTimeout) {
                clearTimeout(clickTimeout);
            }
            
            // Attendre 300ms pour voir s'il y a un double-click
            clickTimeout = setTimeout(() => {
                displayPersonDetails(d.id);
                clickTimeout = null;
            }, 300);
        })
        .on("dblclick", function(event, d) { 
            event.stopPropagation();
            
            // Annuler le click simple en cours
            if (clickTimeout) {
                clearTimeout(clickTimeout);
                clickTimeout = null;
            }
            
            // Exécuter immédiatement le changement de racine
            changeRootPerson(d.id);
        })
        .on("touchend", function(event, d) {
            event.stopPropagation();
            event.preventDefault();
            
            const now = Date.now();
            const timeDiff = now - (this._lastTap || 0);
            
            if (timeDiff < 400 && timeDiff > 0) {
                // Double-tap : annuler le click simple
                if (clickTimeout) {
                    clearTimeout(clickTimeout);
                    clickTimeout = null;
                }
                changeRootPerson(d.id);
            } else {
                // Premier tap : attendre avant d'exécuter
                if (clickTimeout) {
                    clearTimeout(clickTimeout);
                }
                clickTimeout = setTimeout(() => {
                    displayPersonDetails(d.id);
                    clickTimeout = null;
                }, 400);
            }
            
            this._lastTap = now;
        });
    
    // Texte de la personne
    drawSegmentText(segmentGroup, person, innerRadius, outerRadius, startAngle, endAngle, generation);
    
    // console.log(`✅ Segment créé pour ${person.name} avec données liées`);
}

function drawCenterPerson(mainGroup, person) {
    console.log('🎯 Dessin personne centrale:', person.name);
    
    const centerGroup = mainGroup.append("g")
        .attr("class", "center-person-group")
        .datum(person); // ← AJOUT : lier les données
    
    // Cercle principal avec données liées
    centerGroup.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", fanConfig.innerRadius)
        .attr("class", "person-box root center-person")
        .datum(person) // ← AJOUT : lier les données
        .style("fill", "#ff6b6b")
        .style("stroke", "white")
        .style("stroke-width", "4")
        .style("filter", "url(#drop-shadow)")
        .style("cursor", "pointer")
        .on("click", function(event, d) { // ← CORRECTION
            event.stopPropagation();
            displayPersonDetails(d.id);
        });
    
    // Contenu textuel
    drawCenterPersonText(centerGroup, person);
    
    // console.log(`✅ Centre créé pour ${person.name} avec données liées`);
}

window.drawSegmentText = drawSegmentText;

/**
 * Exports pour les autres modules
 */
export const getFanZoom = () => fanZoom;
export const getLastFanTransform = () => lastFanTransform;
export const getFanConfig = () => ({ ...fanConfig });


// Variables globales pour le mode fortune
let fortuneModeActive = false;
let slotHandle = null;
let isSpinning = false;
let originalZoom = null;

// fonction d'animation pour réactiver le levier
function createSpinningWheelWithLever(finalRotation, duration) {
    console.log("📸 Utilisation cache PNG...");
    const overallStart = performance.now();
    
    try {
        // Utiliser le cache si disponible
        if (isCacheValid && cachedRadarPNG) {
            console.log(`⚡ Cache utilisé instantanément !`);

            // NOUVEAU : Récupérer l'angle actuel du radar avant animation
            const originalRadar = d3.select("#tree-svg").selectAll("g").filter(function() {
                return this.querySelector(".center-person-group") !== null;
            });
            
            const currentTransform = originalRadar.attr("transform") || "";
            const rotateMatch = currentTransform.match(/rotate\(([-\d.]+)\)/);
            const currentAngle = rotateMatch ? parseFloat(rotateMatch[1]) : 0;
            
            console.log(`📐 Animation partira de l'angle: ${currentAngle.toFixed(1)}°`);
            
            animateFortuneWheelWithLever(cachedRadarPNG, finalRotation, duration);
            return;
        }      
    } catch (error) {
        console.error("❌ Erreur animation:", error);
    }
}



// Fonction de lancement
function launchFortuneWheelWithLever(baseVelocity) {
    if (isSpinning) return;
    
    isSpinning = true;
    leverStartTime = performance.now();
    console.log(`🎡 Lancement avec levier réaliste - vitesse: ${baseVelocity.toFixed(2)}`);
    
    if (window.leverControls) {
        window.leverControls.disable();
    }
    
    // Calculs avec randomisation (identique)
    const minSpins = 3 + Math.random() * 2;
    const velocityMultiplier = 1.5 + Math.random() * 1;
    const finalSpins = minSpins + (baseVelocity * velocityMultiplier);
    const baseRotation = finalSpins * 360;
    
    const randomStops = [
        Math.random() * 90,
        90 + Math.random() * 90,
        180 + Math.random() * 90,
        270 + Math.random() * 90
    ];
    const randomStop = randomStops[Math.floor(Math.random() * 4)];
    
    const microAdjustment = (Math.random() - 0.5) * 30;
    const finalRotation = baseRotation + randomStop + microAdjustment;
    
    const baseDuration = 4000 + Math.random() * 2000;
    const duration = Math.max(3000, baseDuration + (baseVelocity * 500));
    
    console.log(`🎯 Rotation finale: ${finalRotation.toFixed(1)}° en ${duration}ms`);
    
    createSpinningWheelWithLever(finalRotation, duration);
}

// fonction d'animation
function animateFortuneWheelWithLever(transparentPng, finalRotation, duration) {
    console.log("🌪️ Animation avec levier réaliste...");
    
    const originalRadar = d3.select("#tree-svg").selectAll("g").filter(function() {
        return this.querySelector(".center-person-group") !== null;
    });
    originalRadar.style("opacity", 0);
    
    const spinningImg = document.createElement("img");
    spinningImg.src = transparentPng;
    spinningImg.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        transform-origin: center;
        z-index: 999;
        pointer-events: none;
    `;
    
    document.body.appendChild(spinningImg);
    
    playSound('wheel-spinning');
    
    // rotation  de l'image png
    const timeoutId1 = setTimeout(() => {
        spinningImg.style.transition = `transform ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
        // spinningImg.style.transform = `rotate(${finalRotation}deg)`;
        // NOUVEAU : Récupérer l'angle actuel du radar
        const currentTransform = originalRadar.attr("transform") || "";
        const rotateMatch = currentTransform.match(/rotate\(([-\d.]+)\)/);
        const radarAngle = rotateMatch ? parseFloat(rotateMatch[1]) : 0;
        
        // Faire tourner le PNG depuis l'angle du radar
        const totalRotation = radarAngle + finalRotation;
        spinningImg.style.transform = `rotate(${totalRotation}deg)`;
    }, 50);
    currentAnimationTimeouts.push(timeoutId1);
    

    const timeoutId2 = setTimeout(() => {
        console.log("🎉 Roue arrêtée - Réactivation du levier !");

        playSound('wheel-stop');
        // const winner = detectWinner(finalRotation);

        if (spinningImg.parentNode) {
            document.body.removeChild(spinningImg);
        }

        // Récupérer le zoom ET l'angle actuel du radar
        const currentTransformAttr = originalRadar.attr("transform");
        let currentScale = 0.7;
        // let state.currentRadarAngle = 0; //  angle de départ du radar
        
        if (currentTransformAttr) {
            const scaleMatch = currentTransformAttr.match(/scale\(([\d.]+)\)/);
            if (scaleMatch) {
                currentScale = parseFloat(scaleMatch[1]);
            }
            
            // extraire l'angle actuel du radar
            const rotateMatch = currentTransformAttr.match(/rotate\(([-\d.]+)\)/);
            if (rotateMatch) {
                state.currentRadarAngle = parseFloat(rotateMatch[1]);
            }
        }
        
        console.log(`📊 Angle radar avant rotation: ${state.currentRadarAngle.toFixed(1)}°`);
        console.log(`📊 Rotation PNG ajoutée: ${finalRotation.toFixed(1)}°`);
        
        //  Angle final = angle de départ + rotation du PNG
        const finalAngleTotal = state.currentRadarAngle + finalRotation;
        const finalAngleNormalized = finalAngleTotal % 360;
        
        console.log(`📊 Angle final total: ${finalAngleTotal.toFixed(1)}°`);

        const startTime = performance.now();
        const winner = detectWinner(finalAngleTotal); // Utiliser l'angle total
        console.log(`detectWinner en : ${(performance.now()-startTime).toFixed(1)}ms`);
        
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        // Afficher le radar avec l'angle total
        const startTime2 = performance.now(); 
        originalRadar.attr("transform", `translate(${centerX}, ${centerY}) rotate(${finalAngleNormalized}) scale(${currentScale})`)
                .style("opacity", 1);

        console.log(`🔄 Radar ré-affiché avec nouvel angle: ${finalAngleNormalized.toFixed(1)}° en ${(performance.now()-startTime2).toFixed(1)}ms`);


        const startTime3 = performance.now(); 
        // Corriger uniquement l'inversion tête en bas des textes
        d3.selectAll(".segment-text-group").each(function() {
            const currentTransform = d3.select(this).attr("transform");
            
            if (currentTransform) {
                const rotateMatch = currentTransform.match(/rotate\(([-\d.]+)\)/);
                if (rotateMatch) {
                    const currentTextAngle = parseFloat(rotateMatch[1]);
                    const finalTextAngle = (currentTextAngle + finalAngleNormalized) % 360;
                    
                    if (finalTextAngle > 90 && finalTextAngle < 270) {
                        const flippedAngle = currentTextAngle + 180;
                        const newTransform = currentTransform.replace(/rotate\([-\d.]+\)/, `rotate(${flippedAngle})`);
                        d3.select(this).attr("transform", newTransform);
                    }
                }
            }
        });

        // Corriger aussi le texte du centre
        d3.selectAll(".center-text-group").each(function() {
            if (finalAngleNormalized > 90 && finalAngleNormalized < 270) {
                d3.select(this).attr("transform", "rotate(180)");
            } else {
                d3.select(this).attr("transform", "rotate(0)");
            }
        });

        // Réactiver le nouveau levier
        if (window.leverControls) {
            window.leverControls.enable();
        }
        isSpinning = false;

        console.log(`🔄 correction inverson texte en ${(performance.now()-startTime3).toFixed(1)}ms`);

        highlightWinnerSegment(winner.segment, winner.generation);
        
        const startTime4 = performance.now(); 
        // announceWinnerML(winner);
        const timeoutId3 = setTimeout(() => {
            announceWinnerML(winner);
        }, 5000); // RETARD de 2 secondes au lieu d'immédiat
        currentAnimationTimeouts.push(timeoutId3);


       console.log(`🔄 announceWinnerML en ${(performance.now()-startTime4).toFixed(1)}ms`);

        const timeoutId4 = setTimeout(() => {
            hideWinnerText();
        // }, 3000);
        }, 8000); // Ajuster en conséquence
        currentAnimationTimeouts.push(timeoutId4);

    }, duration + 100);
    currentAnimationTimeouts.push(timeoutId2);

}


// Recentrer le radar chart (avec préservation du zoom initial)
function resetRadarToCenter() {
    const radarGroup = d3.select("#tree-svg").selectAll("g").filter(function() {
        return this.querySelector(".center-person-group") !== null;
    });
    
    if (!radarGroup.empty()) {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        // Récupérer le zoom actuel au lieu de forcer 0.7
        const svg = d3.select("#tree-svg");
        const currentTransform = d3.zoomTransform(svg.node());
        const currentScale = currentTransform ? currentTransform.k : 0.7;
        
        console.log(`🎯 resetRadarToCenter - zoom préservé: ${currentScale}`);
        
        radarGroup.transition()
            .duration(500)
            .attr("transform", `translate(${centerX}, ${centerY}) scale(${currentScale})`);
        
        console.log("🎯 Radar recentré avec zoom préservé");
    }
}




function highlightWinnerSegment(segmentIndex, generation) {
    // Reset de l'ancien gagnant
    if (lastWinner && lastWinner.clonedSegment) {
        lastWinner.clonedSegment.remove();
    }
    
    if (generation === 0) {
        const centerElement = d3.select(".center-person-group circle");
        centerElement
            .style("fill", " #ff0000")
            .style("stroke", " #ffffff")
            .style("stroke-width", "4");

        // Mémoriser le centre
        allWinnerSegments.push({
            generation: generation,
            segment: segmentIndex,
            element: centerElement.node()
        });

        lastWinner = { segment: segmentIndex, generation: generation, element: centerElement.node() };
        
    } else {
        const targetElement = d3.select(`.person-segment-group.gen-${generation}[data-segment-position="${segmentIndex}"]`);
        
        if (!targetElement.empty()) {
            // 1. ROUGE à sa place
            targetElement.select("path")
                .style("fill", " #ff0000")
                .style("stroke", " #ffffff")
                .style("stroke-width", "3");

            // Mémoriser ce segment gagnant
            allWinnerSegments.push({
                generation: generation,
                segment: segmentIndex,
                element: targetElement.node()
            });
            
            const timeoutId = setTimeout(() => {
                // 2. MESURER le segment rouge
                const targetRect = targetElement.node().getBoundingClientRect();
                const startX = targetRect.left + targetRect.width / 2;
                const startY = targetRect.top + targetRect.height / 2;
                const startSize = Math.max(targetRect.width, targetRect.height);
                
                console.log(`📍 SEGMENT ROUGE:`);
                console.log(`   Position: (${startX.toFixed(1)}, ${startY.toFixed(1)})`);
                console.log(`   Taille: ${startSize.toFixed(1)}px`);
                
                // 3. CALCULER LE ZOOM
                const targetScreenSize = Math.min(window.innerWidth, window.innerHeight) / 3;
                const zoomFactor = targetScreenSize / startSize;
                
                console.log(`🎯 ZOOM: ${zoomFactor.toFixed(2)}x (${targetScreenSize.toFixed(1)}px)`);
                
                // 4. CRÉER le clone rouge
                const radarGroup = d3.select("#tree-svg").selectAll("g").filter(function() {
                    return this.querySelector(".center-person-group") !== null;
                });
                const radarTransform = radarGroup.attr("transform") || "";
                
                // Décomposer les transformations
                const translateMatch = radarTransform.match(/translate\(([-\d.]+),\s*([-\d.]+)\)/);
                const rotateMatch = radarTransform.match(/rotate\(([-\d.]+)\)/);
                const scaleMatch = radarTransform.match(/scale\(([\d.]+)\)/);
                
                const translateX = translateMatch ? parseFloat(translateMatch[1]) : 0;
                const translateY = translateMatch ? parseFloat(translateMatch[2]) : 0;
                const rotate = rotateMatch ? parseFloat(rotateMatch[1]) : 0;
                const currentScale = scaleMatch ? parseFloat(scaleMatch[1]) : 1;
                
                console.log(`🔧 Transform: translate(${translateX}, ${translateY}) rotate(${rotate.toFixed(1)}°) scale(${currentScale.toFixed(3)})`);
                
                const clonedSvg = d3.select("body").append("svg")
                    .style("position", "fixed")
                    .style("top", "0")
                    .style("left", "0")
                    .style("width", "100vw")
                    .style("height", "100vh")
                    .style("pointer-events", "none")
                    .style("z-index", "9999");
                
                const clonedSegment = clonedSvg.append("g");
                clonedSegment.node().innerHTML = targetElement.node().innerHTML;
                clonedSegment.attr("transform", radarTransform);
                
                // Couleur rouge
                clonedSegment.select("path")
                    .style("fill", " #ff0000")
                    .style("stroke", " #ffffff")
                    .style("stroke-width", "3");
                
                // Vérifier superposition
                const initialRect = clonedSegment.node().getBoundingClientRect();
                const initialX = initialRect.left + initialRect.width / 2;
                const initialY = initialRect.top + initialRect.height / 2;
                
                console.log(`📍 CLONE INITIAL: (${initialX.toFixed(1)}, ${initialY.toFixed(1)})`);
                console.log(`📊 Superposition: ${Math.abs(initialX - startX).toFixed(1)}px, ${Math.abs(initialY - startY).toFixed(1)}px`);
                
                // 5. CALCUL INVISIBLE de la correction
                const tempClone = clonedSvg.append("g");
                tempClone.node().innerHTML = targetElement.node().innerHTML;
                tempClone.attr("transform", radarTransform);
                tempClone.style("opacity", "0");
                
                const newScale = currentScale * zoomFactor;
                const tempScaleTransform = radarTransform.replace(/scale\([\d.]+\)/, `scale(${newScale})`);
                tempClone.attr("transform", tempScaleTransform);
                
                const tempRect = tempClone.node().getBoundingClientRect();
                const tempX = tempRect.left + tempRect.width / 2;
                const tempY = tempRect.top + tempRect.height / 2;
                
                const predictedDeltaX = tempX - initialX;
                const predictedDeltaY = tempY - initialY;
                
                console.log(`📐 Déplacement prédit: (${predictedDeltaX.toFixed(1)}, ${predictedDeltaY.toFixed(1)})`);
                
                tempClone.remove();
                
                // Correction
                const correctedTranslateX = translateX - predictedDeltaX;
                const correctedTranslateY = translateY - predictedDeltaY;
                const correctedTransform = `translate(${correctedTranslateX}, ${correctedTranslateY}) rotate(${rotate}) scale(${newScale})`;
                
                console.log(`🔧 Transform corrigé: ${correctedTransform}`);
                
                // 6. ANIMATION de grossissement
                clonedSegment
                    .transition()
                    .duration(3000)
                    .ease(d3.easeQuadOut)
                    .attr("transform", correctedTransform)
                    .on("end", function() {
                        const finalRect = clonedSegment.node().getBoundingClientRect();
                        const finalX = finalRect.left + finalRect.width / 2;
                        const finalY = finalRect.top + finalRect.height / 2;
                        const finalSize = Math.max(finalRect.width, finalRect.height);
                        
                        console.log(`🎯 RÉSULTAT FINAL:`);
                        console.log(`   Position: (${finalX.toFixed(1)}, ${finalY.toFixed(1)})`);
                        console.log(`   Taille: ${finalSize.toFixed(1)}px`);
                        console.log(`   Déplacement: ${Math.abs(finalX - startX).toFixed(1)}px, ${Math.abs(finalY - startY).toFixed(1)}px`);
                        console.log(`   Zoom: ${(finalSize / startSize).toFixed(2)}x`);
                        
                        // 7. AJOUTER TEXTE HORIZONTAL LISIBLE par-dessus
                        console.log(`📝 AJOUT TEXTE HORIZONTAL:`);
                        
                        // Récupérer les données de la personne
                        const personData = targetElement.datum();
                        console.log(`   Personne: ${personData.name}`);
                        
                        // Créer un div pour le texte horizontal
                        const textOverlay = document.createElement("div");
                        textOverlay.style.cssText = `
                            position: fixed;
                            left: ${finalX - 120}px;
                            top: ${finalY - 15}px;
                            width: 240px;
                            height: 30px;
                            z-index: 10000;
                            pointer-events: none;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            background: rgba(255, 255, 255, 0.95);
                            border: 2px solid #0000ff;
                            border-radius: 6px;
                            font-family: Arial, sans-serif;
                            font-size: 14px;
                            font-weight: bold;
                            color: #000;
                            text-align: center;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
                        `;
                        
                        // Extraire et formater le nom
                        let displayName = personData.name || "Nom inconnu";
                        if (displayName.includes('/')) {
                            const match = displayName.match(/(.*?)\/(.*?)\//);
                            if (match) {
                                const prenom = match[1].trim();
                                const nom = match[2].trim();
                                displayName = `${prenom} ${nom.toUpperCase()}`;
                            }
                        }
                        
                        textOverlay.textContent = displayName;
                        document.body.appendChild(textOverlay);
                        
                        console.log(`   Texte créé: "${displayName}"`);
                        console.log(`   Position texte: (${finalX - 120}, ${finalY - 15})`);
                        
                        // Animation d'apparition du texte
                        textOverlay.style.opacity = "0";
                        textOverlay.style.transform = "scale(0.8)";
                        
                        setTimeout(() => {
                            textOverlay.style.transition = "all 0.5s ease";
                            textOverlay.style.opacity = "1";
                            textOverlay.style.transform = "scale(1)";
                        }, 200);
                        
                        if (Math.abs(finalX - startX) < 10 && Math.abs(finalY - startY) < 10) {
                            console.log(`✅ GROSSISSEMENT + TEXTE RÉUSSIS !`);
                        }
                        
                        // Stocker pour nettoyage
                        // lastWinner.textOverlay = textOverlay;
                        if (lastWinner) {
                            lastWinner.textOverlay = textOverlay;
                        }
                    });
                
                lastWinner = { 
                    segment: segmentIndex, 
                    generation: generation, 
                    element: targetElement.node(),
                    clonedSegment: clonedSvg.node()
                };
                
            }, 1500);
            currentAnimationTimeouts.push(timeoutId);
        }
    }


}


function resetLastWinnerHighlightAsync() {
    if (!lastWinner) return;
    
    // Déférer à la prochaine frame pour ne pas bloquer
    requestAnimationFrame(() => {
        if (lastWinner.generation === 0) {
            d3.select(".center-person-group circle")
                .style("fill", " #ff6b6b")
                .style("stroke", "white")
                .style("stroke-width", "4");
        } else {
            const originalColor = getGenerationColor(lastWinner.generation);
            const targetElement = d3.select(`.person-segment-group.gen-${lastWinner.generation}[data-segment-position="${lastWinner.segment}"]`);
            
            if (!targetElement.empty()) {
                targetElement.select("path")
                    .style("fill", originalColor)
                    .style("stroke", "white")
                    .style("stroke-width", "1");
            }
        }
        
        // Supprimer le segment rouge cloné
        if (lastWinner.clonedSegment) {
            try {
                lastWinner.clonedSegment.remove();
                console.log('🗑️ Segment rouge cloné supprimé');
            } catch (error) {
                console.warn('⚠️ Erreur suppression segment cloné:', error);
            }
        }
        
        // Supprimer le texte horizontal
        if (lastWinner.textOverlay) {
            try {
                if (lastWinner.textOverlay.parentNode) {
                    lastWinner.textOverlay.remove();
                    console.log('🗑️ Texte horizontal supprimé');
                }
            } catch (error) {
                console.warn('⚠️ Erreur suppression texte:', error);
            }
        }
        
        lastWinner = null;
    });
}




// Détection du gagnant basée sur l'angle avec tirage aléatoire entre les géneration
function detectWinner(finalAngle) {
    const normalizedAngle = (360 - ((finalAngle + 180) % 360)) % 360;
    
    console.log(`🎯 Angle final: ${finalAngle.toFixed(1)}°`);
    console.log(`📐 Angle normalisé: ${normalizedAngle.toFixed(1)}°`);
    
    // NOUVEAU : Collecter tous les segments sous la flèche
    const candidateSegments = [];
    
    // Parcourir toutes les générations (sauf le centre)
    for (let gen = 1; gen <= fanConfig.maxGenerations; gen++) {
        const segmentsInGen = Math.pow(2, gen);
        const anglePerSegment = 360 / segmentsInGen;
        const targetSegment = Math.floor(normalizedAngle / anglePerSegment);
        
        console.log(`🔍 Test Gen ${gen}: cherche segment ${targetSegment}`);
        
        const targetElement = d3.select(`.person-segment-group.gen-${gen}[data-segment-position="${targetSegment}"]`);
        
        if (!targetElement.empty()) {
            const person = targetElement.datum();
            if (person && person.name) {
                console.log(`✅ Candidat Gen ${gen}, segment ${targetSegment}: ${person.name}`);
                
                candidateSegments.push({
                    name: person.name,
                    segment: targetSegment,
                    generation: gen,
                    angle: normalizedAngle,
                    element: targetElement.node()
                });
            }
        }
    }
    
    // NOUVEAU : Tirage aléatoire ou fallback centre
    if (candidateSegments.length > 0) {
        const randomIndex = Math.floor(Math.random() * candidateSegments.length);
        const winner = candidateSegments[randomIndex];
        
        console.log(`🎲 Tirage aléatoire: ${winner.name} (Gen ${winner.generation}) parmi ${candidateSegments.length} candidats`);
        return winner;
        
    } else {
        // Fallback : personne centrale
        console.log(`🎯 Aucun segment trouvé, fallback sur le centre`);
        const centerPerson = d3.select(".center-person-group").datum();
        
        return {
            name: centerPerson.name || 'Personne centrale',
            segment: 0,
            generation: 0,
            angle: normalizedAngle
        };
    }
}

// Système de sons pour la roue de la fortune
class FortuneWheelSounds {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.volume = 0.7;
        this.initSounds();
    }
    
    // Initialiser tous les sons
    initSounds() {
        console.log("🔊 Initialisation du système de sons...");
        
        // Sons générés par Web Audio API (pas besoin de fichiers externes)
        this.createLeverPullSound();
        this.createLeverSpringSound();
        this.createWheelSpinningSound();
        this.createWheelStopSound();
        this.createWinnerSound();
        this.createClickSound();
        
        console.log("✅ Système de sons initialisé !");
    }
    
    // Son de tirage du levier (mécanique)
    createLeverPullSound() {
        this.sounds['lever-pull'] = () => {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Son mécanique avec bruit blanc filtré
            const duration = 0.3;
            const sampleRate = audioContext.sampleRate;
            const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
            const data = buffer.getChannelData(0);
            
            // Générer bruit blanc avec enveloppe
            for (let i = 0; i < data.length; i++) {
                const t = i / sampleRate;
                const envelope = Math.exp(-t * 8); // Décroissance rapide
                const noise = (Math.random() * 2 - 1) * envelope;
                
                // Filtrage pour son métallique
                const frequency = 800 + Math.sin(t * 50) * 200;
                const metallic = Math.sin(t * frequency * 2 * Math.PI) * 0.3;
                
                data[i] = (noise * 0.7 + metallic) * this.volume;
            }
            
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.start();
        };
    }
    
    // Son de ressort (retour du levier)
    createLeverSpringSound() {
        this.sounds['lever-spring'] = () => {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            const duration = 0.4;
            const sampleRate = audioContext.sampleRate;
            const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
            const data = buffer.getChannelData(0);
            
            for (let i = 0; i < data.length; i++) {
                const t = i / sampleRate;
                const envelope = Math.exp(-t * 6);
                
                // Oscillation amortie (ressort)
                const springFreq = 400 + Math.exp(-t * 4) * 200;
                const spring = Math.sin(t * springFreq * 2 * Math.PI) * envelope;
                
                // Ajout d'harmoniques
                const harmonic = Math.sin(t * springFreq * 4 * Math.PI) * envelope * 0.3;
                
                data[i] = (spring + harmonic) * this.volume * 0.8;
            }
            
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.start();
        };
    }
    
    // Son de rotation de la roue (continu)
    createWheelSpinningSound() {
        this.sounds['wheel-spinning'] = () => {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Oscillateur pour le son continu
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            const filter = audioContext.createBiquadFilter();
            
            // Configuration
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(80, audioContext.currentTime);
            
            // Filtre passe-bas pour le réalisme
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, audioContext.currentTime);
            filter.Q.setValueAtTime(5, audioContext.currentTime);
            
            // Enveloppe de volume
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.6, audioContext.currentTime + 0.1);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.4, audioContext.currentTime + 2);
            
            // Modulation de fréquence pour effet de rotation
            const lfo = audioContext.createOscillator();
            const lfoGain = audioContext.createGain();
            lfo.frequency.setValueAtTime(3, audioContext.currentTime);
            lfoGain.gain.setValueAtTime(20, audioContext.currentTime);
            
            // Connexions
            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            lfo.connect(lfoGain);
            lfoGain.connect(oscillator.frequency);
            
            // Démarrage
            oscillator.start();
            lfo.start();
            
            // Arrêt automatique après 8 secondes max
            setTimeout(() => {
                try {
                    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
                    setTimeout(() => {
                        oscillator.stop();
                        lfo.stop();
                    }, 500);
                } catch (e) {
                    // L'oscillateur est peut-être déjà arrêté
                }
            }, 8000);
            
            // Stocker pour arrêt manuel
            this.currentSpinSound = { oscillator, lfo, gainNode, audioContext };
        };
    }
    
    // Arrêter le son de rotation
    stopWheelSpinning() {
        if (this.currentSpinSound) {
            try {
                const { oscillator, lfo, gainNode, audioContext } = this.currentSpinSound;
                gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
                setTimeout(() => {
                    oscillator.stop();
                    lfo.stop();
                }, 300);
            } catch (e) {
                // Déjà arrêté
            }
            this.currentSpinSound = null;
        }
    }
    
    // Son d'arrêt de la roue
    createWheelStopSound() {
        this.sounds['wheel-stop'] = () => {
            // D'abord arrêter le son de rotation
            this.stopWheelSpinning();
            
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            const duration = 0.8;
            const sampleRate = audioContext.sampleRate;
            const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
            const data = buffer.getChannelData(0);
            
            for (let i = 0; i < data.length; i++) {
                const t = i / sampleRate;
                const envelope = Math.exp(-t * 3);
                
                // Son de frottement/arrêt
                const friction = Math.sin(t * 150 * 2 * Math.PI) * envelope;
                const thud = Math.sin(t * 60 * 2 * Math.PI) * Math.exp(-t * 10) * 2;
                
                data[i] = (friction * 0.4 + thud * 0.6) * this.volume;
            }
            
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.start();
        };
    }
    
    // Son de victoire
    createWinnerSound() {
        this.sounds['winner'] = () => {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Mélodie de victoire simple
            const notes = [523.25, 659.25, 783.99, 1046.50]; // Do, Mi, Sol, Do aigu
            const noteDuration = 0.3;
            
            notes.forEach((frequency, index) => {
                setTimeout(() => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.type = 'triangle';
                    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
                    
                    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                    gainNode.gain.linearRampToValueAtTime(this.volume * 0.7, audioContext.currentTime + 0.05);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + noteDuration);
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.start();
                    oscillator.stop(audioContext.currentTime + noteDuration);
                }, index * 200);
            });
        };
    }
    
    // Son de clic
    createClickSound() {
        this.sounds['click'] = () => {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            const duration = 0.1;
            const sampleRate = audioContext.sampleRate;
            const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
            const data = buffer.getChannelData(0);
            
            for (let i = 0; i < data.length; i++) {
                const t = i / sampleRate;
                const envelope = Math.exp(-t * 50);
                const click = Math.sin(t * 1200 * 2 * Math.PI) * envelope;
                data[i] = click * this.volume * 0.5;
            }
            
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.start();
        };
    }
    
    // Jouer un son
    play(soundName) {
        if (!this.enabled) {
            console.log(`🔇 Son désactivé: ${soundName}`);
            return;
        }
        
        if (this.sounds[soundName]) {
            console.log(`🔊 Lecture: ${soundName}`);
            try {
                this.sounds[soundName]();
            } catch (error) {
                console.warn(`⚠️ Erreur son ${soundName}:`, error);
            }
        } else {
            console.warn(`⚠️ Son non trouvé: ${soundName}`);
        }
    }
    
    // Contrôles du volume
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        console.log(`🔊 Volume: ${(this.volume * 100).toFixed(0)}%`);
    }
    
    // Activer/désactiver les sons
    toggle() {
        this.enabled = !this.enabled;
        console.log(`🔊 Sons: ${this.enabled ? 'ACTIVÉS' : 'DÉSACTIVÉS'}`);
        return this.enabled;
    }
    
    // Tester tous les sons
    testAll() {
        console.log("🎵 Test de tous les sons...");
        const soundNames = ['click', 'lever-pull', 'lever-spring', 'wheel-spinning', 'wheel-stop', 'winner'];
        
        soundNames.forEach((sound, index) => {
            setTimeout(() => {
                this.play(sound);
            }, index * 1000);
        });
    }
}

// Initialiser le système de sons
// const fortuneSounds = new FortuneWheelSounds();

const soundsInitStart = performance.now();
console.log('🔊 Début initialisation FortuneWheelSounds...');

const fortuneSounds = new FortuneWheelSounds();


const soundsInitEnd = performance.now();
console.log(`🔊 FortuneWheelSounds initialisé en: ${(soundsInitEnd - soundsInitStart).toFixed(1)}ms`);


//  fonction playSound
function playSound(soundName) {
    if (state.isSpeechEnabled === false) {
        console.log(`🔇 Son désactivé par state.isSpeechEnabled: ${soundName}`);
        return;
    }
    fortuneSounds.play(soundName);
}



// fonctions pour utiliser les traductions

// Système multilingue ultra-simple
function getFortuneText(textType) {
    const lang = window.CURRENT_LANGUAGE || 'fr';
    
    const texts = {
        leverText: {
            fr: "TIREZ",
            en: "PULL", 
            es: "TIRAR",
            hu: "HÚZD"
        },
        leverPulling: {
            fr: "TIRAGE...",
            en: "PULLING...",
            es: "TIRANDO...",
            hu: "HÚZÁS..."
        },
        leverRotating: {
            fr: "ROTATION...",
            en: "SPINNING...",
            es: "GIRANDO...",
            hu: "PÖRGETÉS..."
        },
        winnerIndicator: {
            fr: "GAGNANT",
            en: "WINNER",
            es: "GANADOR", 
            hu: "NYERTES"
        },
        winnerTitle: {
            fr: "LA ROUE S'EST ARRÊTÉE SUR",
            en: "THE WHEEL STOPPED ON",
            es: "LA RUEDA SE DETUVO EN",
            hu: "A KERÉK MEGÁLLT"
        },
        winnerContinue: {
            fr: "Cliquez pour continuer",
            en: "Click to continue",
            es: "Haz clic para continuar",
            hu: "Kattints a folytatáshoz"
        },
        fortuneInstructions: {
            fr: "🎰 Tirez le levier pour faire tourner la roue de la fortune !",
            en: "🎰 Pull the lever to spin the fortune wheel!",
            es: "🎰 ¡Tira de la palanca para hacer girar la rueda de la fortuna!",
            hu: "🎰 Húzd meg a kart a szerencsekerék forgatásához!"
        },
        fortuneModeActive: {
            fr: "fortuneModeActive",
            en: "fortuneModeActive",
            es: "fortuneModeActive",
            hu: "fortuneModeActive"
        }
    };

    // AJOUT : Vérification de sécurité
    if (!texts[textType]) {
        console.warn(`🌍 Texte manquant: ${textType}`);
        return textType; // Retourner la clé si pas trouvé
    }
    
    return texts[textType][lang] || texts[textType]['fr'];
}

// Fonction createRealisticSlotHandle modifiée pour être multilingue
function createRealisticSlotHandleML() {
    const leverContainer = document.createElement("div");
    leverContainer.id = "lever-container";
    leverContainer.style.cssText = `
        position: fixed;
        right: 30px;
        top: 80px;
        width: 100px;
        height: 200px;
        z-index: 1000;
    `;
    
    const leverPivot = document.createElement("div");
    leverPivot.style.cssText = `
        position: absolute;
        bottom: 40px;
        left: 50%;
        transform: translateX(-50%);
        width: 25px;
        height: 25px;
        background: radial-gradient(circle, #888, #555);
        border-radius: 50%;
        border: 2px solid #333;
        box-shadow: 0 3px 6px rgba(0,0,0,0.3);
    `;
    
    const leverArm = document.createElement("div");
    leverArm.id = "lever-arm";
    leverArm.style.cssText = `
        position: absolute;
        bottom: 52px;
        left: 50%;
        transform-origin: center bottom;
        transform: translateX(-50%) rotate(-15deg);
        width: 10px;
        height: 120px;
        background: linear-gradient(90deg, #888, #aaa, #888);
        border-radius: 5px;
        transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        box-shadow: 2px 0 6px rgba(0,0,0,0.3);
    `;
    
    const leverHandle = document.createElement("div");
    leverHandle.id = "lever-handle";
    leverHandle.style.cssText = `
        position: absolute;
        top: -15px;
        left: 50%;
        transform: translateX(-50%);
        width: 50px;
        height: 70px;
        background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 50%, #ffb3b3 100%);
        border-radius: 15px;
        box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
        border: 2px solid #fff;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        user-select: none;
        touch-action: manipulation;
    `;
    
    leverHandle.innerHTML = "🎰";
    
    const leverText = document.createElement("div");
    leverText.style.cssText = `
        position: absolute;
        top: -30px;
        left: 50%;
        transform: translateX(-50%);
        color: #fff;
        font-weight: bold;
        font-size: 12px;
        text-align: center;
        text-shadow: 0 2px 4px rgba(0,0,0,0.7);
        background: rgba(0,0,0,0.7);
        padding: 6px 10px;
        border-radius: 12px;
        white-space: nowrap;
    `;
    
    // UTILISER LA TRADUCTION
    leverText.textContent = getFortuneText('leverText');
    
    leverContainer.appendChild(leverPivot);
    leverContainer.appendChild(leverArm);
    leverArm.appendChild(leverHandle);
    leverContainer.appendChild(leverText);
    
    let leverEnabled = true;
    
    function pullLever() {
        const pullStart = performance.now();
        console.log("🎯 DÉBUT pullLever()");

        if (!leverEnabled || isSpinning) {
            console.log(getFortuneText('leverDisabled'));
            return;
        }

        // closeWinnerMessage();

        // RESET complet de toutes les animations et fenêtres en cours
        // RESET avec nettoyage des segments mémorisés uniquement
        currentAnimationTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
        currentAnimationTimeouts = [];
        d3.selectAll("*").interrupt();

        // Nettoyer UNIQUEMENT les segments gagnants mémorisés
        allWinnerSegments.forEach(winner => {
            if (winner.generation === 0) {
                d3.select(".center-person-group circle")
                    .style("fill", "#ff6b6b")
                    .style("stroke", "white")
                    .style("stroke-width", "4");
            } else {
                const originalColor = getGenerationColor(winner.generation);
                const targetElement = d3.select(`.person-segment-group.gen-${winner.generation}[data-segment-position="${winner.segment}"]`);
                
                if (!targetElement.empty()) {
                    targetElement.select("path")
                        .style("fill", originalColor)
                        .style("stroke", "white")
                        .style("stroke-width", "1");
                }
            }
        });

        // Vider la liste des segments gagnants
        allWinnerSegments = [];

        // Supprimer éléments clonés
        d3.selectAll("svg[style*='z-index: 9999']").remove();
        d3.selectAll("div[style*='z-index: 10000']").remove();
        lastWinner = null;

        // Autres nettoyages
        if (typeof closeWinnerMessage === 'function') {
            closeWinnerMessage();
        }
        hideWinnerText();
        
        leverEnabled = false;
        console.log("🎯", getFortuneText('leverPulling'));

        resetBrowserZoom();

        resetFanView();

        const showWinnerStart = performance.now();
        showWinnerText(); // Afficher "GAGNANT" pendant la rotation
        console.log(`🎯 showWinnerText(): ${(performance.now() - showWinnerStart).toFixed(1)}ms`);
    
        
        if (navigator.vibrate) {
            navigator.vibrate([50, 30, 100]);
        }
        
        leverArm.style.transform = "translateX(-50%) rotate(75deg)";
        leverHandle.style.background = "linear-gradient(135deg, #ff4444 0%, #ff6666 50%, #ff8888 100%)";
        leverText.textContent = getFortuneText('leverPulling'); // TRADUCTION
        
        playSound('lever-pull');
        
        const timeoutId6 = setTimeout(() => {
            const timeoutStart = performance.now();
            console.log(`🎯 setTimeout déclenché après: ${(timeoutStart - pullStart).toFixed(1)}ms`);

            const resetStart = performance.now();
            resetLastWinnerHighlightAsync();
            console.log(`🎯 resetLastWinnerHighlightAsync(): ${(performance.now() - resetStart).toFixed(1)}ms`);


            leverArm.style.transform = "translateX(-50%) rotate(-15deg)";
            leverHandle.style.background = "linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 50%, #ffb3b3 100%)";
            
            playSound('lever-spring');
            
            if (navigator.vibrate) {
                navigator.vibrate(30);
            }
            
            const randomVelocity = 1.5 + Math.random() * 2;

            const launchStart = performance.now();
            launchFortuneWheelWithLever(randomVelocity);

            console.log(`🎯 launchFortuneWheelWithLever(): ${(performance.now() - launchStart).toFixed(1)}ms`);

            
        }, 400);
        currentAnimationTimeouts.push(timeoutId6);
        console.log(`🎯 FIN pullLever(): ${(performance.now() - pullStart).toFixed(1)}ms`);
        
        const timeoutId7 = setTimeout(() => {
            leverEnabled = true;
            leverText.textContent = getFortuneText('leverText'); // TRADUCTION
        }, 1000);
        currentAnimationTimeouts.push(timeoutId7);

        console.log(`🎯 FIN pullLever() après traduction: ${(performance.now() - pullStart).toFixed(1)}ms`);
    }
    
    function disableLever() {
        leverEnabled = false;
        leverHandle.style.opacity = "0.6";
        leverHandle.style.cursor = "not-allowed";
        leverText.textContent = getFortuneText('leverRotating'); // TRADUCTION
    }
    
    function enableLever() {
        leverEnabled = true;
        leverHandle.style.opacity = "1";
        leverHandle.style.cursor = "pointer";
        leverText.textContent = getFortuneText('leverText'); // TRADUCTION
    }
    
    leverHandle.addEventListener('click', pullLever);
    leverHandle.addEventListener('touchend', (e) => {
        e.preventDefault();
        pullLever();
    });
    
    leverHandle.addEventListener('mouseenter', () => {
        if (leverEnabled) {
            leverHandle.style.transform = "translateX(-50%) scale(1.05)";
            leverHandle.style.boxShadow = "0 6px 18px rgba(255, 107, 107, 0.6)";
        }
    });
    
    leverHandle.addEventListener('mouseleave', () => {
        if (leverEnabled) {
            leverHandle.style.transform = "translateX(-50%) scale(1)";
            leverHandle.style.boxShadow = "0 4px 12px rgba(255, 107, 107, 0.4)";
        }
    });
    
    document.body.appendChild(leverContainer);
    
    window.leverControls = {
        disable: disableLever,
        enable: enableLever,
        container: leverContainer
    };
    
    console.log("🎰 Levier multilingue créé !");
    
    return leverContainer;
}

// Fonction showWinnerMessage multilingue
function showWinnerMessageML(winner) {
    const message = document.createElement("div");
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        background: linear-gradient(135deg, #ff6b6b, #ffd93d);
        color: white;
        padding: 30px;
        border-radius: 20px;
        font-size: 24px;
        font-weight: bold;
        text-align: center;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        z-index: 9999;
        transition: transform 0.5s ease;
    `;
    
    message.innerHTML = `
        <div style="font-size: 50px;">🎉</div>
        <div>${getFortuneText('winnerTitle')}</div>
        <div style="font-size: 28px; margin: 15px 0; color: #fff700;">${winner.name}</div>
        <div style="font-size: 16px; opacity: 0.9;">${getFortuneText('winnerContinue')}</div>
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.style.transform = "translate(-50%, -50%) scale(1)";
    }, 100);
    
    message.onclick = () => {
        message.style.transform = "translate(-50%, -50%) scale(0)";
        setTimeout(() => {
            if (message.parentNode) {
                document.body.removeChild(message);
            }
            hideWinnerText();
            resetLastWinnerHighlightAsync();

        }, 300);
    };
}

// Fonction pour fermer le message gagnant
function closeWinnerMessage() {
    // Chercher le message gagnant actuel
    const winnerMessages = document.querySelectorAll('div[style*="position: fixed"][style*="transform: translate(-50%, -50%)"]');
    
    winnerMessages.forEach(message => {
        // Vérifier que c'est bien un message gagnant (contient les emojis ou textes typiques)
        if (message.innerHTML.includes('🎉') || 
            message.innerHTML.includes(getFortuneText('winnerTitle')) ||
            message.innerHTML.includes('GAGNANT') ||
            message.innerHTML.includes('WINNER')) {
            
            console.log('🗑️ Fermeture du message gagnant');
            
            // Animation de fermeture
            message.style.transition = 'transform 0.3s ease';
            message.style.transform = 'translate(-50%, -50%) scale(0)';
            
            // Suppression après l'animation
            setTimeout(() => {
                if (message.parentNode) {
                    document.body.removeChild(message);
                    console.log('✅ Message gagnant supprimé');
                }
            }, 300);
        }
    });
}

// Export pour utilisation dans d'autres modules
window.closeWinnerMessage = closeWinnerMessage;

// Fonction Instructions pour l'utilisateur  multilingue
function showFortuneInstructionsML() {
    const instructions = document.createElement("div");
    instructions.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 15px 25px;
        border-radius: 25px;
        font-size: 16px;
        z-index: 1000;
        animation: fadeInOut 4s ease;
    `;
    
    instructions.innerHTML = getFortuneText('fortuneInstructions');
    
    const style = document.createElement("style");
    style.textContent = `
        @keyframes fadeInOut {
            0%, 100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
            15%, 85% { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(instructions);
    
    setTimeout(() => {
        if (instructions.parentNode) {
            document.body.removeChild(instructions);
        }
    }, 4000);
}

function createWinnerRedArrowIndicatorML() {
    // Supprimer l'ancienne
    d3.select("#winner-indicator-fixed").remove();
    
    // SVG séparé pour la flèche fixe
    const fixedSvg = d3.select("body").append("svg")
        .attr("id", "winner-indicator-fixed")
        .style("position", "fixed")
        .style("top", "0")
        .style("left", "0")
        .style("width", "100vw")
        .style("height", "100vh")
        .style("pointer-events", "none")
        .style("z-index", "1001");
    
    const indicator = fixedSvg.append("g")
        .attr("transform", `translate(${window.innerWidth/2}, 70)`); // DESCENDU de 50 à 70px
    
    // Flèche descendue de 30px supplémentaires
    indicator.append("polygon")
        .attr("points", "0,60 -20,30 -8,30 -8,15 8,15 8,30 20,30") // +30px sur tous les Y
        .attr("fill", " #ff4444")
        .attr("stroke", "white")
        .attr("stroke-width", "3");
    
    // PAS DE TEXTE au début - sera ajouté dynamiquement
    
    console.log("🏆 Indicateur FIXE créé (sans texte)");
}

function removeWinnerRedArrowIndicator() {
    d3.select("#winner-indicator").remove();
    d3.select("#winner-indicator-fixed").remove();
    console.log('🗑️ Flèche rouge supprimée');
}

// Fonction pour afficher le texte "GAGNANT" pendant la rotation
function showWinnerText() {
    const indicator = d3.select("#winner-indicator-fixed g");
    
    // Supprimer l'ancien texte s'il existe
    indicator.select("text").remove();
    
    // Ajouter le texte avec meilleure visibilité
    indicator.append("text")
        .attr("x", 0)
        .attr("y", 5) // Plus bas que la flèche
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .attr("fill", "#ffffff") // Blanc pur
        .attr("stroke", "#000000") // Contour noir
        .attr("stroke-width", "3")
        .attr("paint-order", "stroke fill") // Contour en arrière-plan
        .style("text-shadow", "2px 2px 4px rgba(0,0,0,0.8)") // Ombre supplémentaire
        .text(getFortuneText('winnerIndicator'));
}

// Fonction pour masquer le texte
function hideWinnerText() {
    d3.select("#winner-indicator-fixed g text").remove();
}

// fonction d'activation
export function enableFortuneModeML() {
    if (fortuneModeActive) return;
    
    console.log(getFortuneText('fortuneModeActive'));
    
    fortuneModeActive = true;
    
    const svg = d3.select("#tree-svg");
    originalZoom = svg.on(".zoom");
    // svg.on(".zoom", null);
    
    resetRadarToCenter();
    createRealisticSlotHandleML(); // Version multilingue
    createWinnerRedArrowIndicatorML(); // Version multilingue
    showFortuneInstructionsML(); // Version multilingue
    
    console.log("✅", getFortuneText('fortuneModeActive'));
}

// fonction de désactivation
export function disableFortuneModeWithLever() {
    if (!fortuneModeActive) return;
    
    console.log("🔄 Désactivation du mode Fortune...");
    
    fortuneModeActive = false;
    
    if (originalZoom) {
        d3.select("#tree-svg").on(".zoom", originalZoom);
    }
    
    // Supprimer le levier réaliste
    if (window.leverControls && window.leverControls.container) {
        if (window.leverControls.container.parentNode) {
            document.body.removeChild(window.leverControls.container);
        }
        window.leverControls = null;
    }
    
    d3.select("#winner-indicator").remove();

    closeWinnerMessage();
    hideWinnerText();
    resetLastWinnerHighlightAsync();
    removeWinnerRedArrowIndicator();
    
    console.log("✅ Mode Fortune désactivé");
}

function announceWinnerML(winner) {
    console.log(`🏆 ${getFortuneText('winnerIndicator')}: ${winner.name}`);
    
    const indicator = d3.select("#winner-indicator");
    indicator.transition()
        .duration(500)
        .attr("transform", `translate(${window.innerWidth/2}, 30) scale(1.2)`)
        .transition()
        .duration(500)
        .attr("transform", `translate(${window.innerWidth/2}, 50) scale(1)`);
    
    showWinnerMessageML(winner); // Version multilingue
    
    playSound('winner');
}
