// ====================================
// Rendu de l'arbre en éventail - Version 360° complète
// ====================================
import { state } from './main.js';
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
    if (!isAnimation && isZoomRefresh) {
        resetFanView();
    }
    
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
        .attr("height", height);
    
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
                `translate(${fanConfig.centerX}, ${fanConfig.centerY}) scale(${transform.k})`);
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
export function resetFanView() {
    const svg = d3.select("#tree-svg");
    if (fanZoom) {
        const resetTransform = d3.zoomIdentity.scale(0.7);
        svg.transition()
            .duration(750)
            .call(fanZoom.transform, resetTransform);
    }
}

/**
 * Change la personne racine
 */
function changeRootPerson(personId) {
    console.log(`🎯 Changement de racine vers: ${personId}`);
    if (typeof displayGenealogicTree === 'function') {
        displayGenealogicTree(personId, false, false, false, state.treeModeReal);
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
    
    if (state.currentTree && state.rootPersonId) {
        setTimeout(() => {
            if (typeof displayGenealogicTree === 'function') {
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
        
        // Debug détaillé des relations
        // if (generation === 0) {
        //     console.log(`➤ ${person.name} -> Gen:${generation}, Pos:${position} (RACINE)`);
        //     console.log(`   Père de ${person.name}: ${person.genealogicalFatherId}`);
        //     console.log(`   Mère de ${person.name}: ${person.genealogicalMotherId}`);
        // } else {
        //     console.log(`➤ ${person.name} -> Gen:${generation}, Pos:${position}`);
        // }
        
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
    
    // Debug des résultats avec relations claires
    // generations.forEach((people, gen) => {
    //     console.log(`Gen ${gen}:`);
    //     people.forEach(p => {
    //         if (gen === 0) {
    //             console.log(`  ${p.person.name} (RACINE, pos:${p.position})`);
    //         } else {
    //             console.log(`  ${p.person.name} (pos:${p.position})`);
    //         }
    //     });
    // });
    
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
    
    // Position 0 en bas (-90°), puis sens horaire
    // for (let i = 0; i < maxSegments; i++) {

    //     const startAngle = -Math.PI + (i * anglePerSegment);

    //     const endAngle = startAngle + anglePerSegment;
        
    //     const person = positionArray[i];
        
    //     if (person) {
    //         console.log(`🎯 ${person.name} pos:${i} -> ${(startAngle*180/Math.PI).toFixed(0)}° à ${(endAngle*180/Math.PI).toFixed(0)}°`);
    //         drawPersonSegment(mainGroup, person, innerRadius, outerRadius, startAngle, endAngle, generation);
    //     } else {
    //         console.log(`⚪ Vide pos:${i} -> ${(startAngle*180/Math.PI).toFixed(0)}° à ${(endAngle*180/Math.PI).toFixed(0)}°`);
    //         drawEmptySegment(mainGroup, innerRadius, outerRadius, startAngle, endAngle, generation);
    //     }
    // }

    people.forEach(personData => {
        const startAngle = -Math.PI + (personData.position * anglePerSegment);
        const endAngle = startAngle + anglePerSegment;
        drawPersonSegment(mainGroup, personData.person, innerRadius, outerRadius, startAngle, endAngle, generation);
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
    // lineSpacing: {
    //     0: 18,  // Centre - espacement très large
    //     1: 14,  // Gen 1 - espacement large
    //     2: 12,  // Gen 2 - espacement réduit
    //     3: 10,  // Gen 3 - espacement encore réduit
    //     4: 8,   // Gen 4+ - espacement minimal
    //     default: 8
    // },
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

function drawPersonSegment(mainGroup, person, innerRadius, outerRadius, startAngle, endAngle, generation) {
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
        .datum(person); 
    
    // Couleur selon la génération
    const fillColor = getGenerationColor(generation);
    
    // Segment principal avec données liées
    segmentGroup.append("path")
        .attr("d", arc)
        .attr("class", `person-box person-segment generation-${generation}`)
        .datum(person) // ← AJOUT : lier les données au path aussi
        .style("fill", fillColor)
        .style("stroke", "white")
        .style("stroke-width", "1")
        .style("filter", "url(#drop-shadow)")
        .style("cursor", "pointer")
        .on("click", function(event, d) { 
            event.stopPropagation();
            displayPersonDetails(d.id);
        })
        .on("dblclick", function(event, d) { 
            event.stopPropagation();
            changeRootPerson(d.id);
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

// Activer le mode Roue de la Fortune
// function enableFortuneMode() {
//     if (fortuneModeActive) return;
    
//     console.log("🎰 Activation du mode Roue de la Fortune...");
    
//     fortuneModeActive = true;
    
//     // 1. Sauvegarder et désactiver le zoom
//     const svg = d3.select("#tree-svg");
//     originalZoom = svg.on(".zoom");
//     svg.on(".zoom", null);
    
//     // 2. Forcer le centrage du radar
//     resetRadarToCenter();
    
//     // 3. Créer le levier de machine à sous
//     createSlotMachineHandle();
    
//     // 4. Créer l'indicateur de position (flèche)
//     createWinnerIndicator();
    
//     // 5. Afficher les instructions
//     showFortuneInstructions();
    
//     console.log("✅ Mode Fortune activé !");
// }

function enableFortuneMode() {
    if (fortuneModeActive) return;
    
    console.log("🎰 Activation du mode Roue de la Fortune...");
    
    fortuneModeActive = true;
    
    // 1. Sauvegarder et désactiver le zoom
    const svg = d3.select("#tree-svg");
    originalZoom = getFanZoom(); // Utiliser la fonction existante pour récupérer le zoom
    svg.on(".zoom", null);
    
    // 2. Sauvegarder le zoom initial avant toute modification
    const initialTransform = getLastFanTransform();
    
    // 3. Forcer le centrage du radar
    resetRadarToCenter(initialTransform);
    
    // 4. Créer le levier de machine à sous
    createSlotMachineHandle();
    
    // 5. Créer l'indicateur de position (flèche)
    createWinnerIndicator();
    
    // 6. Afficher les instructions
    showFortuneInstructions();
    
    console.log("✅ Mode Fortune activé !");
}

// Désactiver le mode Fortune
function disableFortuneMode() {
    if (!fortuneModeActive) return;
    
    console.log("🔄 Désactivation du mode Fortune...");
    
    fortuneModeActive = false;
    
    // Restaurer le zoom
    if (originalZoom) {
        d3.select("#tree-svg").on(".zoom", originalZoom);
    }
    
    // Supprimer les éléments de l'interface
    if (slotHandle && slotHandle.parentNode) {
        document.body.removeChild(slotHandle);
        slotHandle = null;
    }
    
    // Supprimer l'indicateur
    d3.select("#winner-indicator").remove();
    
    console.log("✅ Mode Fortune désactivé");
}

// Créer le levier de machine à sous
function createSlotMachineHandle() {
    slotHandle = document.createElement("div");
    slotHandle.id = "slot-machine-handle";
    slotHandle.style.cssText = `
        position: fixed;
        right: 30px;
        top: 50%;
        transform: translateY(-50%);
        width: 80px;
        height: 200px;
        background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 50%, #ffb3b3 100%);
        border-radius: 40px;
        box-shadow: 0 8px 20px rgba(0,0,0,0.3);
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: bold;
        color: white;
        text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        border: 4px solid #fff;
        transition: all 0.2s ease;
        z-index: 1000;
        user-select: none;
    `;
    
    slotHandle.innerHTML = `
        <div style="font-size: 30px; margin-bottom: 10px;">🎰</div>
        <div>TIRER</div>
        <div style="font-size: 10px; margin-top: 5px;">LE LEVIER</div>
    `;
    
    // Effets hover
    slotHandle.onmouseenter = () => {
        if (!isSpinning) {
            slotHandle.style.transform = "translateY(-50%) scale(1.1)";
            slotHandle.style.boxShadow = "0 12px 30px rgba(255, 107, 107, 0.4)";
        }
    };
    
    slotHandle.onmouseleave = () => {
        if (!isSpinning) {
            slotHandle.style.transform = "translateY(-50%) scale(1)";
            slotHandle.style.boxShadow = "0 8px 20px rgba(0,0,0,0.3)";
        }
    };
    
    // Action du levier
    slotHandle.onclick = () => {
        if (!isSpinning) {
            pullSlotHandle();
        }
    };
    
    document.body.appendChild(slotHandle);
    
    console.log("🎰 Levier créé !");
}

// Animation et action du levier
function pullSlotHandle() {
    if (isSpinning) return;
    
    console.log("🎯 Levier tiré !");
    
    // Animation du levier
    slotHandle.style.transform = "translateY(-40%) scale(0.95)";
    slotHandle.style.background = "linear-gradient(135deg, #ff4444 0%, #ff6666 50%, #ff8888 100%)";
    
    // Son du levier (si disponible)
    playSound('lever-pull');
    
    setTimeout(() => {
        slotHandle.style.transform = "translateY(-50%) scale(1)";
        slotHandle.style.background = "linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 50%, #ffb3b3 100%)";
        
        // Générer vitesse aléatoire pour variation
        const randomVelocity = 1.5 + Math.random() * 2; // Entre 1.5 et 3.5
        launchFortuneWheel(randomVelocity);
        
    }, 200);
}

// Créer l'indicateur de gagnant (flèche en haut)
function createWinnerIndicator() {
    const svg = d3.select("#tree-svg");
    
    // Supprimer l'ancien indicateur s'il existe
    svg.select("#winner-indicator").remove();
    
    // Créer le groupe pour l'indicateur
    const indicator = svg.append("g")
        .attr("id", "winner-indicator")
        .attr("transform", `translate(${window.innerWidth/2}, 50)`);
    
    // Flèche principale
    indicator.append("polygon")
        .attr("points", "0,30 -20,0 -8,0 -8,-15 8,-15 8,0 20,0")
        .attr("fill", "#ff4444")
        .attr("stroke", "white")
        .attr("stroke-width", "3")
        .attr("filter", "drop-shadow(0 4px 8px rgba(0,0,0,0.3))");
    
    // Texte "GAGNANT"
    indicator.append("text")
        .attr("x", 0)
        .attr("y", -25)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .attr("fill", "#ff4444")
        .attr("stroke", "white")
        .attr("stroke-width", "2")
        .text("GAGNANT");
    
    console.log("🏆 Indicateur de gagnant créé");
}

// Recentrer le radar chart
// function resetRadarToCenter() {
//     const radarGroup = d3.select("#tree-svg").selectAll("g").filter(function() {
//         return this.querySelector(".center-person-group") !== null;
//     });
    
//     if (!radarGroup.empty()) {
//         const centerX = window.innerWidth / 2;
//         const centerY = window.innerHeight / 2;
        
//         radarGroup.transition()
//             .duration(500)
//             .attr("transform", `translate(${centerX}, ${centerY}) scale(0.7)`);
        
//         console.log("🎯 Radar recentré");
//     }
// }

// Recentrer le radar chart (avec préservation du zoom initial)
function resetRadarToCenter(initialTransform) {
    const radarGroup = d3.select("#tree-svg").selectAll("g").filter(function() {
        return this.querySelector(".center-person-group") !== null;
    });
    
    if (!radarGroup.empty()) {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        // Utiliser la transformation initiale plutôt que de forcer un zoom fixe
        radarGroup.transition()
            .duration(500)
            .attr("transform", `translate(${centerX}, ${centerY}) scale(${initialTransform ? initialTransform.k : 0.7})`);
        
        console.log("🎯 Radar recentré");
    }
}

// Lancement de la roue avec randomisation avancée
function launchFortuneWheel(baseVelocity) {
    if (isSpinning) return;
    
    isSpinning = true;
    console.log(`🎡 Lancement avec vitesse de base: ${baseVelocity.toFixed(2)}`);
    
    // Désactiver le levier pendant la rotation
    slotHandle.style.opacity = "0.5";
    slotHandle.style.cursor = "not-allowed";
    
    // Calculs avec randomisation poussée
    const minSpins = 3 + Math.random() * 2; // Entre 3 et 5 tours minimum
    const velocityMultiplier = 1.5 + Math.random() * 1; // Variation de vitesse
    const finalSpins = minSpins + (baseVelocity * velocityMultiplier);
    const baseRotation = finalSpins * 360;
    
    // Randomisation de l'arrêt final
    const randomStops = [
        Math.random() * 90,      // 1er quart
        90 + Math.random() * 90, // 2ème quart  
        180 + Math.random() * 90, // 3ème quart
        270 + Math.random() * 90  // 4ème quart
    ];
    const randomStop = randomStops[Math.floor(Math.random() * 4)];
    
    // Micro-ajustements pour éviter les patterns
    const microAdjustment = (Math.random() - 0.5) * 30; // ±15°
    const finalRotation = baseRotation + randomStop + microAdjustment;
    
    // Durée avec variation
    const baseDuration = 4000 + Math.random() * 2000; // Entre 4 et 6 secondes
    const duration = Math.max(3000, baseDuration + (baseVelocity * 500));
    
    console.log(`🎯 Rotation finale: ${finalRotation.toFixed(1)}° en ${duration}ms`);
    console.log(`📊 Arrêt sur: ${(finalRotation % 360).toFixed(1)}°`);
    
    // Créer et lancer la roue
    createSpinningWheel(finalRotation, duration);
}

// Créer la roue tournante (reprise de la fonction précédente, optimisée)
function createSpinningWheel(finalRotation, duration) {
    console.log("🎨 Création de la roue tournante...");
    
    const originalSvg = d3.select("#tree-svg");
    
    // Masquer fond
    d3.selectAll('.background-element, .bubble-group').style('display', 'none');
    
    // Fond blanc temporaire
    const whiteRect = originalSvg.insert("rect", ":first-child")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("fill", "#FFFFFF");
    
    // Canvas et traitement
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const svgData = new XMLSerializer().serializeToString(originalSvg.node());
    const img = new Image();
    
    img.onload = function() {
        ctx.drawImage(img, 0, 0);
        
        // Traitement blanc → transparent
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            if (data[i] === 255 && data[i+1] === 255 && data[i+2] === 255) {
                data[i + 3] = 0;
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
        const transparentPng = canvas.toDataURL("image/png");
        
        // Nettoyage
        whiteRect.remove();
        d3.selectAll('.background-element, .bubble-group').style('display', null);
        
        // Animation
        animateFortuneWheel(transparentPng, finalRotation, duration);
    };
    
    const encodedSvgData = encodeURIComponent(svgData);
    img.src = "data:image/svg+xml;charset=utf-8," + encodedSvgData;
}

// Animation avec effets sonores
function animateFortuneWheel(transparentPng, finalRotation, duration) {
    console.log("🌪️ Animation de la roue...");
    
    // Masquer radar original
    const originalRadar = d3.select("#tree-svg").selectAll("g").filter(function() {
        return this.querySelector(".center-person-group") !== null;
    });
    originalRadar.style("opacity", 0);
    
    // Image rotative
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
    
    // Son de rotation
    playSound('wheel-spinning');
    
    // Animation avec décélération réaliste
    setTimeout(() => {
        spinningImg.style.transition = `transform ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
        spinningImg.style.transform = `rotate(${finalRotation}deg)`;
    }, 50);
    
    // Fin de l'animation
    setTimeout(() => {
        console.log("🎉 Roue arrêtée !");
        
        // Son d'arrêt
        playSound('wheel-stop');
        
        // Déterminer le gagnant
        const winner = detectWinner(finalRotation);
        
        // Nettoyer
        if (spinningImg.parentNode) {
            document.body.removeChild(spinningImg);
        }
        originalRadar.style("opacity", 1);
        
        // Réactiver le levier
        slotHandle.style.opacity = "1";
        slotHandle.style.cursor = "pointer";
        isSpinning = false;
        
        // Annoncer le résultat
        announceWinner(winner);
        
    }, duration + 100);
}

// Détection du gagnant basée sur l'angle
function detectWinner(finalAngle) {
    const normalizedAngle = (360 - (finalAngle % 360)) % 360; // Inverser car rotation horaire
    console.log(`🎯 Angle normalisé: ${normalizedAngle.toFixed(1)}°`);
    
    // TODO: Implémenter détection réelle basée sur les segments du radar
    // Pour l'instant, simulation
    const segments = ['Grand-père paternel', 'Grand-mère paternelle', 'Grand-père maternel', 'Grand-mère maternelle'];
    const segmentSize = 360 / segments.length;
    const winnerIndex = Math.floor(normalizedAngle / segmentSize);
    
    return {
        name: segments[winnerIndex] || "Personne inconnue",
        angle: normalizedAngle
    };
}

// Annonce du gagnant avec effets
function announceWinner(winner) {
    console.log(`🏆 GAGNANT: ${winner.name}`);
    
    // Animation de l'indicateur
    const indicator = d3.select("#winner-indicator");
    indicator.transition()
        .duration(500)
        .attr("transform", `translate(${window.innerWidth/2}, 30) scale(1.2)`)
        .transition()
        .duration(500)
        .attr("transform", `translate(${window.innerWidth/2}, 50) scale(1)`);
    
    // Message de victoire
    showWinnerMessage(winner);
    
    // Son de victoire
    playSound('winner');
}

// Message de victoire
function showWinnerMessage(winner) {
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
        <div>LA ROUE S'EST ARRÊTÉE SUR</div>
        <div style="font-size: 28px; margin: 15px 0; color: #fff700;">${winner.name}</div>
        <div style="font-size: 16px; opacity: 0.9;">Cliquez pour continuer</div>
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
        }, 300);
    };
}

// Instructions pour l'utilisateur
function showFortuneInstructions() {
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
    
    instructions.innerHTML = "🎰 Tirez le levier pour faire tourner la roue de la fortune !";
    
    // Ajouter l'animation CSS
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

// Fonction de son (placeholder)
function playSound(soundType) {
    // TODO: Implémenter les vrais sons
    console.log(`🔊 Son: ${soundType}`);
}

// Fonctions publiques
window.enableFortuneMode = enableFortuneMode;
window.disableFortuneMode = disableFortuneMode;

console.log("🎰 Système de roue de la fortune avec levier prêt !");
console.log("📝 Tapez: enableFortuneMode() pour activer");















function drawEmptySegment(mainGroup, innerRadius, outerRadius, startAngle, endAngle, generation) {
    const arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)
        .startAngle(startAngle)
        .endAngle(endAngle);
    
    mainGroup.append("path")
        .attr("d", arc)
        .attr("class", `empty-segment generation-${generation}`)
        .datum({ name: 'Segment vide', isEmpty: true }) // ← AJOUT : données pour les segments vides
        .style("fill", "#f5f5f5")
        .style("stroke", "white")
        .style("stroke-width", "1")
        .style("opacity", "0.3");
    
    console.log(`⚪ Segment vide créé avec données`);
}



function superFastRotation() {
    const group = d3.select("#tree-svg").selectAll("g").filter(function() {
        return this.querySelector(".center-person-group") !== null;
    });
    
    // Masquer TOUT le texte ET réduire les détails visuels
    d3.selectAll(".segment-text-group").style("opacity", 0);
    d3.selectAll("text").style("opacity", 0); // Tous les textes
    d3.selectAll("path").style("stroke-width", "0.5"); // Contours plus fins
    
    // Animation plus fluide avec requestAnimationFrame
    let startTime = null;
    let angle = 0;
    
    function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / 1000, 1); // 3 secondes
        
        angle = progress * 360;
        group.attr("transform", `translate(395, 400) rotate(${angle}) scale(0.7)`);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Restaurer tout à la fin
            d3.selectAll(".segment-text-group").style("opacity", 1);
            d3.selectAll("text").style("opacity", 1);
            d3.selectAll("path").style("stroke-width", "1");
            group.attr("transform", "translate(395, 400) rotate(0) scale(0.7)");
            console.log("✅ Rotation fluide terminée !");
        }
    }
    
    requestAnimationFrame(animate);
}
// Rendez la fonction accessible globalement
window.superFastRotation = superFastRotation; 

// Fonction pour afficher les images de debug
function showDebugImg(pngDataUrl, title, rightPos) {
    const img = document.createElement("img");
    img.src = pngDataUrl;
    img.style.position = "fixed";
    img.style.top = "10px";
    img.style.right = rightPos;
    img.style.width = "300px";
    img.style.height = "200px";
    img.style.border = "3px solid red";
    img.style.zIndex = "9999";
    img.style.objectFit = "contain";
    
    if (title.includes("transparent")) {
        img.style.background = "repeating-conic-gradient(#ddd 0% 25%, white 0% 50%) 50% / 20px 20px";
    } else {
        img.style.background = "white";
    }
    
    const titleDiv = document.createElement("div");
    titleDiv.textContent = title;
    titleDiv.style.position = "fixed";
    titleDiv.style.top = "220px";
    titleDiv.style.right = rightPos;
    titleDiv.style.background = "black";
    titleDiv.style.color = "white";
    titleDiv.style.padding = "5px";
    titleDiv.style.fontSize = "12px";
    titleDiv.style.zIndex = "9999";
    
    document.body.appendChild(img);
    document.body.appendChild(titleDiv);
    
    setTimeout(() => {
        if (img.parentNode) document.body.removeChild(img);
        if (titleDiv.parentNode) document.body.removeChild(titleDiv);
    }, 12000);
}

function spinRadarWhite() {
    console.log("🎡 Rotation avec fond blanc...");
    
    const originalSvg = d3.select("#tree-svg");
    
    // Masquer fond
    d3.selectAll('.background-element, .bubble-group').style('display', 'none');
    
    // Fond BLANC (ultra discret)
    const whiteRect = originalSvg.insert("rect", ":first-child")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("fill", "#FFFFFF"); // BLANC PUR
    
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Canvas blanc
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const svgData = new XMLSerializer().serializeToString(originalSvg.node());
    const img = new Image();
    
    img.onload = function() {
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Détecter BLANC PUR (rouge=255, vert=255, bleu=255)
        for (let i = 0; i < data.length; i += 4) {
            if (data[i] === 255 && data[i+1] === 255 && data[i+2] === 255) {
                data[i + 3] = 0; // Transparent
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
        const transparentPng = canvas.toDataURL("image/png");
        
        // Nettoyage
        whiteRect.remove();
        d3.selectAll('.background-element, .bubble-group').style('display', null);
        
        // Rotation
        spinTransparentPng(transparentPng);
        
        console.log("✅ Rotation blanche terminée !");
    };
    
    const encodedSvgData = encodeURIComponent(svgData);
    img.src = "data:image/svg+xml;charset=utf-8," + encodedSvgData;
}

window.spinRadarWhite = spinRadarWhite;

