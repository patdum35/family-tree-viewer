// ====================================
// Rendu de l'arbre en éventail - Version 360° complète
// ====================================
import { state, displayGenealogicTree } from './main.js';
import { setupElegantBackground } from './backgroundManager.js';
import { generateRadarCache, createWinnerRedArrowIndicator } from './treeWheelAnimation.js';
import { testSpeechSynthesisHealth, selectVoice } from './treeAnimation.js';

let previousRootPersonId = null;
let previousNombreGeneration = null;
let lastTapTime = 0;
let tapTimeout = null;
let clickTimeout = null;  // Si cette variable existe déjà



function cleanupWheelTreeState() {
    // Réinitialisation des variables et états globaux
    if (state.WheelZoom) {
        const svg = d3.select("#tree-svg");
        svg.on(".zoom", null);  // Supprimer tous les gestionnaires
    }

    state.WheelZoom = null;
    window.initialWheelTransform = null;
    state.lastWheelTransform = null;
    
    // Annuler les animations et timeouts en cours
    state.currentAnimationTimeouts.forEach(clearTimeout);
    state.currentAnimationTimeouts = [];

    // Réinitialiser les drapeaux et états
    state.userHasInteracted = false;
    state.currentRadarAngle = 0;
}

/**
 * Initialise et dessine l'arbre en éventail complet 360°
 */
export async function drawWheelTree(isZoomRefresh = false, isAnimation = false) {

    if (!state.currentTree) {
        console.error('❌ Pas d\'arbre à dessiner');
        return;
    }

    if (state.isSpeechEnabled2)
    {
        state.isSpeechInGoodHealth = await testSpeechSynthesisHealth();
        if (state.isSpeechInGoodHealth) {
            // Chrome ou Edge est coopératif
            console.log("✅ La synthèse vocale est prête et fonctionne correctement.");
        } else {
            // Chrome est grognon il faut utiliser une méthode de secours
            console.log("⚠️ La synthèse vocale ne fonctionne pas correctement. Utilisation de la méthode de secours.");
            window.speechSynthesis.cancel();
        }


        selectVoice();

    }

    // DIAGNOSTIC SUPPLÉMENTAIRE
    console.log('🚨 ÉTAT COMPLET AVANT DRAWWheelTREE');
    console.log('state.WheelZoom existant:', !!state.WheelZoom);
    console.log('Propriétés du zoom existant:', state.WheelZoom ? Object.keys(state.WheelZoom) : 'N/A');
    
    // Si state.WheelZoom existe, essayez de le réinitialiser complètement
    if (state.WheelZoom) {
        const svg = d3.select("#tree-svg");
        svg.on(".zoom", null);  // Supprimer tous les gestionnaires de zoom
        state.WheelZoom = null;  // Forcer une réinitialisation complète
    }
    
    console.log('🌟 Début du rendu éventail 360°...');
    console.log('📊 Arbre reçu:', state.currentTree);
    
    console.log('🔍 DIAGNOSTIC DÉBUT drawWheelTree');
    console.log('🔍 isZoomRefresh:', isZoomRefresh);
    console.log('🔍 isAnimation:', isAnimation);
    
    const svg = setupWheelSVG();
    
    const initialD3Transform = d3.zoomTransform(svg.node());
    console.log('🔍 Zoom D3 initial:', {
        k: initialD3Transform.k,
        x: initialD3Transform.x,
        y: initialD3Transform.y
    });
    
    if (window.initialWheelTransform) {
        console.log('🔍 window.initialWheelTransform:', window.initialWheelTransform);
    }

    const mainGroup = createWheelMainGroup(svg);
    
    configureWheelMode();
    
    const generationsData = organizeByGenerations(state.currentTree);
    console.log('📊 Données par génération:', generationsData);
    
    createSVGFilters(svg);
    
    drawCenterPerson(mainGroup, state.currentTree);
    
    drawAllGenerations(mainGroup, generationsData);
    
    setupWheelZoom(svg, mainGroup);

    setupWheelResizeHandler();
    
    const afterD3Transform = d3.zoomTransform(svg.node());
    console.log('🔍 Zoom D3 APRÈS setupWheelZoom:', {
        k: afterD3Transform.k,
        x: afterD3Transform.x,
        y: afterD3Transform.y
    });

    if (isZoomRefresh) {
        resetWheelView();
        // state.isCacheValid = false;
    }
    
    if (state.initialTreeDisplay) {
        state.initialTreeDisplay = false;
        setTimeout(() => {
            setupElegantBackground(svg);
        }, 100);
    } else {
        setupElegantBackground(svg);
    }
    
    console.log('✅ Rendu éventail 360° terminé');

    if (!state.isCacheValid || !state.cachedRadarPNG || (previousRootPersonId != state.rootPersonId) || (previousNombreGeneration != state.nombre_generation)) {
        console.log(`🔄 Génération du cache PNG...`);
        setTimeout(() => {
            generateRadarCache();
        }, 500);
    } else {
        console.log(`✅ Cache PNG déjà disponible`);
    }

    previousRootPersonId = state.rootPersonId;
    previousNombreGeneration = state.nombre_generation;
}



function removeSpinningImage() {
    const spinningImg = document.getElementById("fortune-wheel-spinning-img");
    if (spinningImg && spinningImg.parentNode) {
        document.body.removeChild(spinningImg);
        console.log('🗑️ Image PNG supprimée depuis un autre fichier');
    }
}

// Fonction de gestion du redimensionnement pour le radar généalogique
let resizeHandlerSetup = false; // Flag pour éviter les multiples gestionnaires

function setupWheelResizeHandler() {
    // Éviter de créer plusieurs gestionnaires
    if (resizeHandlerSetup) {
        console.log('✅ Gestionnaire de redimensionnement déjà configuré');
        return;
    }
    
    let resizeTimeout;
    
    const handleResize = () => {
        // Vérifier qu'on est bien en mode wheel
        if (!state.currentTree || !state.rootPersonId) {
            return;
        }
        
        console.log('🔄 Redimensionnement détecté - Reconstruction du radar');
        
        // Sauvegarder l'état d'interaction de l'utilisateur
        const hadUserInteraction = state.userHasInteracted;
        
        // Nettoyer complètement l'état du wheel
        cleanupWheelTreeState();
        
        // Invalider le cache
        state.isCacheValid = false;
        state.cachedRadarPNG = null;
        
        // Utiliser la fonction displayGenealogicTree pour reconstruire proprement
        setTimeout(() => {
            if (typeof displayGenealogicTree === 'function') {
                console.log('🔄 Reconstruction via displayGenealogicTree');
                displayGenealogicTree(state.rootPersonId, false, false, false, 'WheelAncestors');

                createWinnerRedArrowIndicator();

                state.leverEnabled = true;
                state.isSpinning = false;

                removeSpinningImage();
               
                // Restaurer l'état d'interaction après reconstruction
                setTimeout(() => {
                    if (hadUserInteraction) {
                        state.userHasInteracted = true;
                    }
                }, 200);
            }
        }, 100);
        
        console.log('✅ Redimensionnement en cours:', {
            width: window.innerWidth, 
            height: window.innerHeight
        });
    };
    
    // Gestionnaire avec debounce pour éviter trop d'appels
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResize, 200);
    });
    
    resizeHandlerSetup = true;
    console.log('✅ Gestionnaire de redimensionnement configuré pour le radar');
}


/**
 * Configure le mode éventail
 */
function configureWheelMode() {
    // Toujours 360° complet pour le mode ancêtres
    state.WheelConfig.totalAngle = 2 * Math.PI;
    state.WheelConfig.startAngle = -Math.PI / 2;
}

/**
 * Configure le SVG initial
 */
function setupWheelSVG() {
    cleanupWheelTreeState();

    const width = window.innerWidth;
    const height = window.innerHeight;
    
    const svg = d3.select("#tree-svg");
    svg.selectAll("*").remove();  // Nettoyer le SVG
    
    state.WheelConfig.centerX = width / 2;
    state.WheelConfig.centerY = height / 2;
    
    svg.attr("width", width)
       .attr("height", height)
       .style("touch-action", "pan-x pan-y pinch-zoom");
    
    return svg;
}


/**
 * Crée le groupe principal pour l'éventail
 */
function createWheelMainGroup(svg) {
    return svg.append("g")
        .attr("transform", `translate(${state.WheelConfig.centerX}, ${state.WheelConfig.centerY})`);
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
function setupWheelZoom(svg, mainGroup) {
    // Calculer un zoom optimal basé sur le nombre de générations et la taille de la fenêtre
    let isUpdatingTransform = false; // Flag pour éviter la boucle

    console.log('🚀 DÉBUT setupWheelZoom');
    

    const calculateOptimalZoom = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Rayon total du radar
        const totalRadius = state.WheelConfig.innerRadius + (state.WheelConfig.maxGenerations * state.WheelConfig.generationWidth);   

        // Calcul du zoom pour que le radar tienne dans la fenêtre
        // On laisse une marge de 10% de chaque côté
        const widthZoom = (width * 0.8) / (2 * totalRadius);
        const heightZoom = (height * 0.8) / (2 * totalRadius);
        
        // Prendre le zoom le plus petit pour s'assurer que tout rentre
        const optimalZoom = Math.min(widthZoom, heightZoom);
        
        // Limiter entre 0.1 et 1 pour éviter des zooms trop extrêmes
        return Math.max(0.1, Math.min(optimalZoom, 1));
    };


    state.WheelZoom = d3.zoom()
    .scaleExtent([0.1, 3])
    .on("zoom", ({transform}) => {
        // BLOQUER la boucle infinie
        if (isUpdatingTransform) {
            console.log('🚫 Boucle de zoom bloquée');
            return;
        }
        
        console.log('🔍 ZOOM LÉGITIME:', transform);
        
        isUpdatingTransform = true; // Bloquer les suivants
        
        state.userHasInteracted = true;
        state.lastWheelTransform = transform;
        mainGroup.attr("transform", 
            `translate(${transform.x}, ${transform.y}) scale(${transform.k})`);
        
        // Remettre le flag après un délai
        setTimeout(() => {
            isUpdatingTransform = false;
        }, 50);
    });

    
    svg.call(state.WheelZoom);
    
    // Transformation initiale optimale
    const initialZoom = calculateOptimalZoom();
    console.log('🔍 Zoom optimal calculé:', initialZoom);
    console.log('🔍 Nombre générations:', state.WheelConfig.maxGenerations);

    const initialTransform = d3.zoomIdentity
        .translate(state.WheelConfig.centerX, state.WheelConfig.centerY)
        .scale(initialZoom);
    console.log('🔍 Transform à appliquer:', initialTransform);


    // CAPTURER le vrai zoom AVANT que D3.js fasse ses ajustements
    window.initialWheelTransform = {
        k: initialZoom,
        x: state.WheelConfig.centerX,
        y: state.WheelConfig.centerY
    };
    console.log('VRAI Transform initial capturé:', window.initialWheelTransform);

    // État AVANT application
    const beforeTransform = d3.zoomTransform(svg.node());
    console.log('🔍 Transform AVANT application:', beforeTransform);
    
    svg.call(state.WheelZoom.transform, initialTransform);


    // État APRÈS application
    const afterTransform = d3.zoomTransform(svg.node());
    console.log('🔍 Transform APRÈS application:', afterTransform);


    setTimeout(() => {
        state.userHasInteracted = false; // Reset après stabilisation
    }, 1000);
}

export function needsReset() {
    console.log('Utilisateur a interagi:', state.userHasInteracted);
    return state.userHasInteracted;
}


/**
 * Réinitialise la vue de l'éventail
 */
export function resetWheelView() {
    // zoom du d3.js
    const svg = d3.select("#tree-svg");
    if (state.WheelZoom && window.initialWheelTransform) {
        console.log('🔄 Reset vers transform initial exact:', window.initialWheelTransform);
        
        // Utiliser le transform initial EXACT
        svg.transition()
            .duration(750)
            .call(state.WheelZoom.transform, window.initialWheelTransform);
            
        state.currentRadarAngle = 0;
        state.userHasInteracted = false;
    } else {
        console.warn('⚠️ Pas de transform initial sauvegardé');
    }  
}


/**
 * Change la personne racine
 */
function changeRootPerson(personId) {
    console.log(`🎯 Changement de racine vers: ${personId}`);
    
    // Vérifier que state.WheelZoom existe avant d'appeler displayGenealogicTree
    if (!state.WheelZoom) {
        console.warn('⚠️ state.WheelZoom pas encore initialisé, on attend...');
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

    state.WheelConfig.maxGenerations = Math.min(max, state.WheelConfig.limitMaxGenerations);
    console.log(`📊 Générations max mises à jour: ${max}`);
    console.log(`🔍 Recalcul zoom pour ${max} générations`);

    state.WheelConfig.maxGenerations = Math.min(max, state.WheelConfig.limitMaxGenerations);
    console.log(`📊 Générations max mises à jour: ${max}`);

    // Invalider le cache
    state.isCacheValid = false;
    state.cachedRadarPNG = null;
   
    if (state.currentTree && state.rootPersonId) {
        setTimeout(() => {
            if (typeof displayGenealogicTree === 'function') {
                console.log('\n\n\n\n ###################   CALL displayGenealogicTree in setMaxGenerations  ################# ')
                displayGenealogicTree(state.rootPersonId, false, false, false, 'WheelAncestors');
            }
        }, 100);
    }
}

/**
 * Modifie le nombre maximum de générations
 */
export function setMaxGenerationsInit(max) {
    state.WheelConfig.maxGenerations = Math.min(max, state.WheelConfig.limitMaxGenerations);
    console.log(`📊 Générations max mises à jour: ${max}`);
}

export function getGenerationColor(generation) {
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
        if (!person || generation > state.WheelConfig.maxGenerations) return;
        
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
        if (person.children && generation < state.WheelConfig.maxGenerations) {
            
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

    const innerRadius = state.WheelConfig.innerRadius + ((generation - 1) * state.WheelConfig.generationWidth);
    const outerRadius = innerRadius + state.WheelConfig.generationWidth - 5;

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
        drawWheelPersonDetails(textGroup, match, person, generation);
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
function formatWheelDates(person) {
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
const Wheel_TEXT_CONFIG = {
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
    const config = Wheel_TEXT_CONFIG.fontReduction;
    if (text.length > config.threshold) {
        return Math.round(baseSize * config.reductionFactor);
    }
    return baseSize;
}

/**
 * Formate les prénoms pour l'éventail (adapté par génération)
 */
function formatFirstNamesForWheel(firstNames, generation) {
    const config = Wheel_TEXT_CONFIG;
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
function drawWheelPersonDetails(textGroup, match, person, generation) {
    const [_, firstNames, lastName] = match;
    const formattedFirstNames = formatFirstNamesForWheel(firstNames, generation);
    const formattedLastName = formatLastNames(lastName);
    
    // Récupérer les paramètres pour cette génération
    const config = Wheel_TEXT_CONFIG;
    const baseSize = config.baseFontSize[generation] || config.baseFontSize.default;
    // const lineSpacing = config.lineSpacing[generation] || config.lineSpacing.default;
    const lineSpacing = baseSize * config.lineSpacingFactor;
    const maxNames = config.maxFirstNames[generation] || config.maxFirstNames.default;
    
    // Préparer les éléments à dessiner
    const firstNamesList = formattedFirstNames.split(' ').slice(0, maxNames);
    const hasDate = generation <= 3 && formatWheelDates(person);
    
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
        const dateText = formatWheelDates(person);
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
        const formattedFirstNames = formatFirstNamesForWheel(firstNames, 0);
        const formattedLastName = formatLastNames(lastName);
        
        const config = Wheel_TEXT_CONFIG;
        const baseSize = config.baseFontSize[0];
        // const lineSpacing = config.lineSpacing[0];
        const lineSpacing = baseSize * config.lineSpacingFactor;
        
        // Préparer les éléments
        const firstNamesList = formattedFirstNames.split(' ').slice(0, 2);
        const hasDate = formatWheelDates(person);
        
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
            const dateText = formatWheelDates(person);
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
        if (generation > 0 && generation <= state.WheelConfig.maxGenerations) {
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
    // let clickTimeout = null;
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
            event.preventDefault();
            
            // Annuler le click simple en cours
            if (clickTimeout) {
                clearTimeout(clickTimeout);
                clickTimeout = null;
            }
            
            // Exécuter immédiatement le changement de racine
            changeRootPerson(d.id);
        })
        .on("touchend", function(event, d) {
            // Bloquer les comportements par défaut
            if (event.cancelable) {
                event.preventDefault();
            }
            
            // Ne rien faire si c'était un zoom ou un glissement
            if (this._isZooming) {
                console.log('🚫 Interaction zoom/glissement bloquée');
                this._isZooming = false;
                this._startTouch = null;
                return;
            }
            
            const now = Date.now();
            const timeSinceLastTap = now - lastTapTime;
            
            // Double tap détecté rapidement (moins de 300ms)
            if (timeSinceLastTap < 300) {
                // Annuler le timeout de simple tap s'il existe
                if (tapTimeout) {
                    clearTimeout(tapTimeout);
                    tapTimeout = null;
                }
                
                const svg = d3.select("#tree-svg");
                
                // FORCER LE ZOOM AVANT TOUT
                const calculateOptimalZoom = () => {
                    const width = window.innerWidth;
                    const height = window.innerHeight;
                    
                    const totalRadius = state.WheelConfig.innerRadius + (state.WheelConfig.maxGenerations * state.WheelConfig.generationWidth);   

                    const widthZoom = (width * 0.8) / (2 * totalRadius);
                    const heightZoom = (height * 0.8) / (2 * totalRadius);
                    
                    const optimalZoom = Math.min(widthZoom, heightZoom);
                    
                    return Math.max(0.1, Math.min(optimalZoom, 1));
                };

                const optimalZoom = calculateOptimalZoom();
                
                // FORCER LE ZOOM AVANT LE CHANGEMENT DE RACINE
                const initialTransform = d3.zoomIdentity
                    .translate(state.WheelConfig.centerX, state.WheelConfig.centerY)
                    .scale(optimalZoom);
                
                svg.call(state.WheelZoom.transform, initialTransform);
                
                console.log('🔍 Zoom FORCÉ avant changement de racine:', {
                    k: optimalZoom,
                    x: state.WheelConfig.centerX,
                    y: state.WheelConfig.centerY
                });

                // Léger délai pour s'assurer que le zoom est appliqué
                setTimeout(() => {
                    // Changer la personne racine
                    console.log('🔄 Double tap détecté - Changement de racine');
                    changeRootPerson(d.id);
                }, 50);
                
                // Réinitialiser le dernier tap
                lastTapTime = 0;
            } else {
                // Simple tap potentiel (inchangé)
                tapTimeout = setTimeout(() => {
                    const svg = d3.select("#tree-svg");
                    const currentTransform = d3.zoomTransform(svg.node());
                    
                    console.log('🔍 Transform avant modal:', {
                        k: currentTransform.k,
                        x: currentTransform.x,
                        y: currentTransform.y
                    });

                    // Stocker le transform actuel
                    window.lastTransformBeforeModal = currentTransform;

                    displayPersonDetails(d.id);
                    tapTimeout = null;
                }, 250);
                
                // Mettre à jour le temps du dernier tap
                lastTapTime = now;
            }
        })
        .on("touchstart", function(event, d) {
            // Bloquer TOUS les comportements par défaut
            if (event.cancelable) {
                event.preventDefault();
            }
            
            // Détecter multi-touch (zoom)
            if (event.touches && event.touches.length > 1) {
                this._isZooming = true;
                console.log('🔍 Zoom multi-touch détecté');
                return;
            }
            
            // Stocker la position initiale du toucher
            this._startTouch = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY,
                time: Date.now()
            };
            
            this._isZooming = false;
        })
        .on("touchmove", function(event, d) {
            // Détecter un déplacement significatif
            if (this._startTouch) {
                const touch = event.touches[0];
                const deltaX = Math.abs(touch.clientX - this._startTouch.x);
                const deltaY = Math.abs(touch.clientY - this._startTouch.y);
                
                // Si déplacement > 10px, considérer comme un glissement
                if (deltaX > 10 || deltaY > 10) {
                    this._isZooming = true;
                    console.log('🔍 Glissement détecté');
                    
                    // Annuler le timeout de tap s'il existe
                    if (tapTimeout) {
                        clearTimeout(tapTimeout);
                        tapTimeout = null;
                    }
                }
            }
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
        .attr("r", state.WheelConfig.innerRadius)
        .attr("class", "person-box root center-person")
        .datum(person) // ← AJOUT : lier les données
        .style("fill", "#ff6b6b")
        .style("stroke", "white")
        .style("stroke-width", "4")
        .style("filter", "url(#drop-shadow)")
        .style("cursor", "pointer")
        .on("click", function(event, d) { 
            event.stopPropagation();
            displayPersonDetails(d.id);
        });
    
    // Contenu textuel
    drawCenterPersonText(centerGroup, person);
    
    // console.log(`✅ Centre créé pour ${person.name} avec données liées`);
}

window.drawSegmentText = drawSegmentText;
