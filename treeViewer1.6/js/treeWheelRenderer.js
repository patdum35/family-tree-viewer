// ====================================
// Rendu de l'arbre en éventail - Version 360° complète
// ====================================
import { state, displayGenealogicTree, trackPageView } from './main.js';
import { setupElegantBackground } from './backgroundManager.js';
import { generateRadarCache, createWinnerRedArrowIndicator } from './treeWheelAnimation.js';
import { testSpeechSynthesisHealth, selectVoice } from './treeAnimation.js';
import { buildAncestorTree, buildDescendantTree } from './treeOperations.js';
import { extractYear } from './utils.js';

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

    trackPageView('wheelTree');

    if (!state.currentTree) {
        console.error('❌ Pas d\'arbre à dessiner');
        return;
    }

    // console.log('🌳 Structure de l\'arbre descendant:');
    // console.log(JSON.stringify(state.currentTree, null, 2));

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
        state.isVoiceSelected = true;
    }

    // DIAGNOSTIC SUPPLÉMENTAIRE
    console.log('🚨 ÉTAT COMPLET AVANT DRAWWheelTREE');
    // console.log('state.WheelZoom existant:', !!state.WheelZoom);
    // console.log('Propriétés du zoom existant:', state.WheelZoom ? Object.keys(state.WheelZoom) : 'N/A');
    
    // Si state.WheelZoom existe, essayez de le réinitialiser complètement
    if (state.WheelZoom) {
        const svg = d3.select("#tree-svg");
        svg.on(".zoom", null);  // Supprimer tous les gestionnaires de zoom
        state.WheelZoom = null;  // Forcer une réinitialisation complète
    }
    
    // console.log('🌟 Début du rendu éventail 360°...');
    // console.log('📊 Arbre reçu:', state.currentTree);
    
    // console.log('🔍 DIAGNOSTIC DÉBUT drawWheelTree');
    // console.log('🔍 isZoomRefresh:', isZoomRefresh);
    // console.log('🔍 isAnimation:', isAnimation);
    
    const svg = setupWheelSVG();
    
    const initialD3Transform = d3.zoomTransform(svg.node());
    // console.log('🔍 Zoom D3 initial:', {
    //     k: initialD3Transform.k,
    //     x: initialD3Transform.x,
    //     y: initialD3Transform.y
    // });
    
    if (window.initialWheelTransform) {
        console.log('🔍 window.initialWheelTransform:', window.initialWheelTransform);
    }

    const mainGroup = createWheelMainGroup(svg);
    
    configureWheelMode();
    
    const generationsData = organizeByGenerations(state.currentTree);
   
    createSVGFilters(svg);
    
    drawCenterPerson(mainGroup, state.currentTree);
    
    drawAllGenerations(mainGroup, generationsData);
    
    setupWheelZoom(svg, mainGroup);

    setupWheelResizeHandler();
    
    const afterD3Transform = d3.zoomTransform(svg.node());
    // console.log('🔍 Zoom D3 APRÈS setupWheelZoom:', {
    //     k: afterD3Transform.k,
    //     x: afterD3Transform.x,
    //     y: afterD3Transform.y
    // });

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



export function removeSpinningImage() {
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
        if (state.isRadarEnabled) {
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
                    // displayGenealogicTree(state.rootPersonId, false, false, false, 'WheelAncestors');
                    // state.currentTree = buildAncestorTree(state.rootPersonId);
                    drawWheelTree(false, false);

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
        }
    }
    

        
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


export const calculateOptimalZoom = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Rayon total du radar
    // const totalRadius = state.WheelConfig.innerRadius + (state.WheelConfig.maxGenerations * state.WheelConfig.generationWidth);   


    // NOUVEAU : calculer le rayon total avec les largeurs variables
    let totalRadius = state.WheelConfig.innerRadius;
    for (let gen = 1; gen <= state.WheelConfig.maxGenerations; gen++) {
        totalRadius += calculateGenerationWidth(gen);
    }


    // Calcul du zoom pour que le radar tienne dans la fenêtre
    // On laisse une marge de 10% de chaque côté
    let widthZoom = (width * 0.8) / (2 * totalRadius);
    let heightZoom = (height * 0.8) / (2 * totalRadius);

    if (state.WheelConfig.maxGenerations > 10) {
        widthZoom = widthZoom * 1.2;
        heightZoom = heightZoom * 1.2;
    } else if (state.WheelConfig.maxGenerations > 5 ) {
        widthZoom = widthZoom * 1.1;
        heightZoom = heightZoom * 1.1;
    }
    // if ((state.WheelConfig.maxGenerations > 2  && state.WheelConfig.maxGenerations < 6)  && (window.innerHeight < 400  || window.innerWidth < 400)) {
    //     widthZoom = widthZoom * 1.4;
    //     heightZoom = heightZoom * 1.4;
    // }

    if (window.innerHeight < 400  || window.innerWidth < 400) {

        if (state.WheelConfig.maxGenerations > 2  && state.WheelConfig.maxGenerations < 6) {
            widthZoom = widthZoom * 1.4;
            heightZoom = heightZoom * 1.4;
        } else {
            widthZoom = widthZoom * 1.1;
            heightZoom = heightZoom * 1.1;            
        }


    }


    
    // Prendre le zoom le plus petit pour s'assurer que tout rentre
    const optimalZoom = Math.min(widthZoom, heightZoom);
    
    // Limiter entre 0.1 et 1 pour éviter des zooms trop extrêmes
    return Math.max(0.1, Math.min(optimalZoom, 1));
};



/**
 * Configure le zoom pour l'éventail
 */
function setupWheelZoom(svg, mainGroup) {
    // Calculer un zoom optimal basé sur le nombre de générations et la taille de la fenêtre
    let isUpdatingTransform = false; // Flag pour éviter la boucle

    console.log('🚀 DÉBUT setupWheelZoom');
    
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
    // console.log('🔍 Zoom optimal calculé:', initialZoom);
    // console.log('🔍 Nombre générations:', state.WheelConfig.maxGenerations);

    const initialTransform = d3.zoomIdentity
        .translate(state.WheelConfig.centerX, state.WheelConfig.centerY)
        .scale(initialZoom);
    // console.log('🔍 Transform à appliquer:', initialTransform);


    // CAPTURER le vrai zoom AVANT que D3.js fasse ses ajustements
    window.initialWheelTransform = {
        k: initialZoom,
        x: state.WheelConfig.centerX,
        y: state.WheelConfig.centerY
    };
    // console.log('VRAI Transform initial capturé:', window.initialWheelTransform);

    // État AVANT application
    const beforeTransform = d3.zoomTransform(svg.node());
    // console.log('🔍 Transform AVANT application:', beforeTransform);
    
    svg.call(state.WheelZoom.transform, initialTransform);


    // État APRÈS application
    const afterTransform = d3.zoomTransform(svg.node());
    // console.log('🔍 Transform APRÈS application:', afterTransform);


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
    displayGenealogicTree(personId, false, false, false, state.treeModeReal);
    // state.currentTree = buildAncestorTree(state.rootPersonId);
    // drawWheelTree(true, false);
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
                // displayGenealogicTree(state.rootPersonId, false, false, false, 'WheelAncestors');
                if (state.treeModeReal_backup  === 'directAncestors') {
                    state.currentTree = buildAncestorTree(state.rootPersonId);
                } else { 
                    state.currentTree = buildDescendantTree(state.rootPersonId);
                }
                
                drawWheelTree(false, false);
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



// export function getGenerationColor(generation, sex = 'M') {
//     // palette homme / nuances de bleu
//     const maleColors = [
//         '#e6f3ff', // gen 1 - bleu très clair
//         '#c1e1ff', // gen 2 - légèrement plus saturé
//         '#9bceff', // gen 3 - bleu ciel doux
//         '#72b8ff', // gen 4 - bleu ciel vibrant
//         '#4da2ff', // gen 5 - bleu franc
//         '#2b8fff', // gen 6 - bleu électrique
//         '#0a7cff', // gen 7 - bleu profond
//         '#005ce6'  // gen 8 - bleu nuit
//     ];
    
//     // palette femme / nuances de rose/rouge
//     // const femaleColors = [
//     //     '#ffe6f3', // gen 1 - rose très clair
//     //     '#ffc1e1', // gen 2 - rose clair
//     //     '#ff9bce', // gen 3 - rose doux
//     //     '#ff72b8', // gen 4 - rose vibrant
//     //     '#ff4da2', // gen 5 - rose franc
//     //     '#ff2b8f', // gen 6 - rose électrique
//     //     '#ff0a7c', // gen 7 - rose profond
//     //     '#e6005c'  // gen 8 - rose nuit
//     // ];

//     // palette femme / nuances de vert
//     const femaleColors = [
//         '#f0fff0', // gen 1 - vert menthe très clair
//         '#e0ffe0', // gen 2 - vert pastel
//         '#c8ffc8', // gen 3 - vert clair
//         '#90ee90', // gen 4 - vert clair vibrant
//         '#7dd87d', // gen 5 - vert moyen
//         '#5cb85c', // gen 6 - vert franc
//         '#4a934a', // gen 7 - vert foncé
//         '#2d5a2d'  // gen 8 - vert très foncé
//     ];
        
//     const colors = sex === 'F' ? femaleColors : maleColors;
//     return colors[Math.min(generation - 1, colors.length - 1)] || colors[0];
// }



export function getGenerationColor(generation, sex = 'M') {
    
    // palette homme / nuances de bleu
    const maleColorsV0 = [
        '#e6f3ff', // gen 1 - bleu très clair
        '#c1e1ff', // gen 2 - légèrement plus saturé
        '#9bceff', // gen 3 - bleu ciel doux
        '#72b8ff', // gen 4 - bleu ciel vibrant
        '#4da2ff', // gen 5 - bleu franc
        '#2b8fff', // gen 6 - bleu électrique
        '#0a7cff', // gen 7 - bleu profond
        '#005ce6'  // gen 8 - bleu nuit
    ];

    const femaleColorsV0 = [
        '#e6f3ff', // gen 1 - bleu très clair
        '#c1e1ff', // gen 2 - légèrement plus saturé
        '#9bceff', // gen 3 - bleu ciel doux
        '#72b8ff', // gen 4 - bleu ciel vibrant
        '#4da2ff', // gen 5 - bleu franc
        '#2b8fff', // gen 6 - bleu électrique
        '#0a7cff', // gen 7 - bleu profond
        '#005ce6'  // gen 8 - bleu nuit
    ];



    // PALETTE HARMONIEUSE - OPTION 1 : Bleu/Rose doux
    // const maleColorsV1 = [
    //     '#f0f8ff', // gen 1 - bleu alice très clair
    //     '#e6f3ff', // gen 2 - bleu ciel très clair  
    //     '#ccebff', // gen 3 - bleu ciel clair
    //     '#99d6ff', // gen 4 - bleu ciel
    //     '#66c2ff', // gen 5 - bleu moyen
    //     '#3399ff', // gen 6 - bleu franc
    //     '#0080ff', // gen 7 - bleu vif
    //     '#0066cc'  // gen 8 - bleu profond
    // ];
    const maleColorsV1 = [
        '#e6f3ff', // gen 1 - bleu très clair
        '#c1e1ff', // gen 2 - légèrement plus saturé
        '#9bceff', // gen 3 - bleu ciel doux
        '#72b8ff', // gen 4 - bleu ciel vibrant
        '#4da2ff', // gen 5 - bleu franc
        '#2b8fff', // gen 6 - bleu électrique
        '#0a7cff', // gen 7 - bleu profond
        '#005ce6'  // gen 8 - bleu nuit
    ];



    
    // const femaleColorsV1 = [
    //     '#fff0f8', // gen 1 - rose alice très clair
    //     '#ffe6f3', // gen 2 - rose très clair
    //     '#ffcceb', // gen 3 - rose clair
    //     '#ff99d6', // gen 4 - rose
    //     '#ff66c2', // gen 5 - rose moyen
    //     '#ff3399', // gen 6 - rose franc
    //     '#ff0080', // gen 7 - rose vif
    //     '#cc0066'  // gen 8 - rose profond
    // ];
    const femaleColorsV1 = [
        '#ffe6f3', // gen 1 - rose alice très clair
        '#ffe6f3', // gen 2 - rose alice très clair
        '#ffe6f3', // gen 3 - rose alice très clair
        '#ffe6f3', // gen 4 - rose alice très clair
        '#ffe6f3', // gen 5 - rose alice très clair
        '#ffe6f3', // gen 6 - rose alice très clair
        '#ffe6f3', // gen 7 - rose alice très clair
        '#ffe6f3', // gen 8 - rose alice très clairsssss
    ];

    // PALETTE HARMONIEUSE - OPTION 2 : Bleu/Corail élégant
    const maleColorsV2 = [
        '#f8fcff', // gen 1 - bleu glacé
        '#e8f4ff', // gen 2 - bleu très clair
        '#d1e7ff', // gen 3 - bleu poudré
        '#a8ccff', // gen 4 - bleu doux
        '#7fb3ff', // gen 5 - bleu moyen
        '#5599ff', // gen 6 - bleu saturé
        '#2b7fff', // gen 7 - bleu intense
        '#0066ff'  // gen 8 - bleu électrique
    ];
    
    const femaleColorsV2 = [
        '#fff8f5', // gen 1 - corail glacé
        '#fff0e8', // gen 2 - corail très clair
        '#ffe4d1', // gen 3 - corail poudré
        '#ffcca8', // gen 4 - corail doux
        '#ffb37f', // gen 5 - corail moyen
        '#ff9955', // gen 6 - corail saturé
        '#ff7f2b', // gen 7 - corail intense
        '#ff6600'  // gen 8 - orange corail
    ];

    // PALETTE HARMONIEUSE - OPTION 3 : Bleu marine/Rose antique
    const maleColorsV3 = [
        '#f5f8ff', // gen 1 - bleu porcelaine
        '#ebf2ff', // gen 2 - bleu pâle
        '#d6e5ff', // gen 3 - bleu lavande
        '#b3ccff', // gen 4 - bleu pervenche
        '#8fb3ff', // gen 5 - bleu bleuet
        '#6699ff', // gen 6 - bleu roi
        '#4080ff', // gen 7 - bleu marine clair
        '#1a66ff'  // gen 8 - bleu marine
    ];
    
    const femaleColorsV3 = [
        '#fff5f8', // gen 1 - rose porcelaine
        '#ffebf2', // gen 2 - rose pâle
        '#ffd6e5', // gen 3 - rose antique
        '#ffb3cc', // gen 4 - rose poudré
        '#ff8fb3', // gen 5 - rose tendre
        '#ff6699', // gen 6 - rose vif
        '#ff4080', // gen 7 - rose fuchsia
        '#ff1a66'  // gen 8 - rose intense
    ];

    // SÉLECTION DE LA PALETTE (changez le numéro pour tester)
    const paletteVersion = state.radarStyle; // Changez ça pour tester : 1, 2 ou 3
   
    let maleColors, femaleColors;
    
    switch(paletteVersion) {
        case 0:
            maleColors = maleColorsV0;
            femaleColors = femaleColorsV0;
            break;
        case 1:
            maleColors = maleColorsV1;
            femaleColors = femaleColorsV1;
            break;
        case 2:
            maleColors = maleColorsV2;
            femaleColors = femaleColorsV2;
            break;
        case 3:
            maleColors = maleColorsV3;
            femaleColors = femaleColorsV3;
            break;
        default:
            maleColors = maleColorsV1;
            femaleColors = femaleColorsV1;
    }
    

    // NOUVEAU : fond blanc semi-transparent pour gen 9+
    if (generation > 8) {

        if (sex = 'M') { 
            return "rgba(193, 225, 255, 0.5)"; // Bleu légèrement plus saturé        
        } else {
            return "rgba(255, 230, 243, 0.5)"; // rose alice très clair       
        }
        // return "rgba(255, 255, 255, 0.5)"; // Blanc semi-transparent
    }


    const colors = sex === 'F' ? femaleColors : maleColors;
    return colors[Math.min(generation - 1, colors.length - 1)] || colors[0];
}

/*
DESCRIPTION DES PALETTES :

OPTION 1 - Bleu/Rose classique :
- Harmonie parfaite, très lisible
- Distinction claire homme/femme
- Couleurs douces et professionnelles

OPTION 2 - Bleu/Corail moderne :
- Plus contemporain et chaleureux
- Corail plus original que le rose
- Excellent contraste visuel

OPTION 3 - Bleu marine/Rose antique :
- Plus sophistiqué et élégant
- Couleurs plus saturées
- Look plus premium

Pour tester une palette, changez juste le numéro dans "paletteVersion = 1"
*/

// calcul des couleurs de texte adaptatives
function getAdaptiveTextColors(generation, sex = 'M') {
    if (generation <= 2 || (sex === 'F' && state.radarStyle === 1 )) {
        // Générations claires (0-4) : texte foncé avec contour blanc

        if (generation > 8) { 
            return {
                firstName: { fill: "#000000", stroke: "none", strokeWidth: "0", fontWeight: "normal" },
                lastName: { fill: "#000000", stroke: "none", strokeWidth: "0", fontWeight: "normal" },
                date: { fill: "#000000", stroke: "none", strokeWidth: "0", fontWeight: "normal" }
            };
       }



        return {
            firstName: { fill: "#1a1a1a", stroke: "white", strokeWidth: "1.5px", fontWeight: "bold" },
            lastName: { fill: "#0d47a1", stroke: "white", strokeWidth: "1.5px", fontWeight: "bold" },
            date: { fill: "#8B4513", stroke: "white", strokeWidth: "1.2px", fontWeight: "normal" }
        };
    } else if (generation <= 4) {
        // Générations claires (0-4) : texte foncé avec contour blanc
        return {
            firstName: { fill: "#1a1a1a", stroke: "white", strokeWidth: "0.5px", fontWeight: "bold" },
            lastName: { fill: "#0d47a1", stroke: "white", strokeWidth: "0.5px", fontWeight: "bold" },
            date: { fill: "#8B4513", stroke: "none", strokeWidth: "0", fontWeight: "normal" }
        };
    } else if (generation <= 8){
        // Générations foncées (5-8) : texte blanc sans contour
        return {
            firstName: { fill: "#ffffff", stroke: "none", strokeWidth: "0", fontWeight: "500"  },
            lastName: { fill: "#e3f2fd", stroke: "none", strokeWidth: "0", fontWeight: "600"  },
            date: { fill: "#ffeb3b", stroke: "none", strokeWidth: "0", fontWeight: "400"  }  // Jaune pour les dates
        };
    // } else if (generation <= 12){
    //     // Générations foncées 
    //     return {
    //         firstName: { fill: "#ffffff", stroke: "none", strokeWidth: "0", fontWeight: "200"  },
    //         lastName: { fill: "#e3f2fd", stroke: "none", strokeWidth: "0", fontWeight: "200"  },
    //         date: { fill: "#ffeb3b", stroke: "none", strokeWidth: "0", fontWeight: "100"  }  // Jaune pour les dates
    //     };
    } else {
        // Générations foncées 
        // return {
        //     firstName: { fill: "#ffffff", stroke: "none", strokeWidth: "0", fontWeight: "50"  },
        //     lastName: { fill: "#e3f2fd", stroke: "none", strokeWidth: "0", fontWeight: "50"  },
        //     date: { fill: "#ffeb3b", stroke: "none", strokeWidth: "0", fontWeight: "50"  }  // Jaune pour les dates
        // };

    // NOUVEAU : style minimaliste pour gen 9+
        return {
            firstName: { fill: "#000000", stroke: "none", strokeWidth: "0", fontWeight: "normal" },
            lastName: { fill: "#000000", stroke: "none", strokeWidth: "0", fontWeight: "normal" },
            date: { fill: "#000000", stroke: "none", strokeWidth: "0", fontWeight: "normal" }
        };
    }
}


// Fonction pour calculer l'épaisseur du contour des segments et le style selon la génération
function getSegmentStyle(generation) {
    if (generation <= 6) {
        return { 
            stroke: "white", 
            width: generation <= 4 ? "2" : "1",
            filter: "url(#drop-shadow)"
        };
    } else if (generation <= 8) {
        return { 
            stroke: "#f0f0f0", 
            width: "0.5",
            filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.2))"  // Ombre légère
        };
    } else {
        // return { 
        //     stroke: "none", 
        //     width: "0",
        //     filter: "none"                        // Segments nets sans ombre
        // };

        return { 
            stroke: "rgba(200,200,200,0.3)",  // Ligne très discrète
            width: "0.1",                     // Ligne la plus fine possible
            filter: "none"                    // Aucun effet
        };

    }
}

function organizeByGenerations(rootTree) {
    // console.log('📋 Organisation par génération...');
    
    // Détection du mode et appel de la fonction appropriée
    // if (state.treeModeReal === 'ancestors') {
    console.log('\n\n DEBUG : state.treeModeReal_backup ', state.treeModeReal_backup)
    if (state.treeModeReal_backup  === 'directAncestors') {
    // if (true) {
        return organizeByGenerationsAscendant(rootTree);
    } else {
        return organizeByGenerationsDescendant(rootTree);
    }
}

/**
 * Organisation par génération avec positionnement généalogique CORRECT
 * Convention: segment 0 en bas, sens horaire, père toujours à gauche de la mère
 */
function organizeByGenerationsAscendant(rootTree) {
    console.log('📋 Organisation par génération GÉNÉALOGIQUE...');
    // console.log('🌟 Arbre racine:', rootTree);
    
    const generations = new Map();
    
    function traverse(person, generation, position = 0) {
        if (!person || generation > state.WheelConfig.maxGenerations) return;
        
        if (!generations.has(generation)) {
            generations.set(generation, []);
        }
        
        // Ajouter la sex à personne 
        const fullPersonData = state.gedcomData.individuals[person.id];
        person.sex = fullPersonData.sex;

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

// Nouvelle fonction descendante
function organizeByGenerationsDescendant(rootTree) {
    console.log('📋 Organisation DESCENDANTE - algorithme custom...');
    
    // ÉTAPE 1 : Calculer le poids (nombre de feuilles) pour chaque personne
    function calculateLeafCount(person) {
        if (!person.children || person.children.length === 0) {
            person.leafCount = 1; // Feuille = 1
            return 1;
        }
        
        person.leafCount = person.children.reduce((sum, child) => {
            return sum + calculateLeafCount(child);
        }, 0);
        
        return person.leafCount;
    }
    
    calculateLeafCount(rootTree);
    // console.log(`🔢 Nombre total de feuilles: ${rootTree.leafCount}`);
    
    // ÉTAPE 2 : Répartir les angles selon les proportions
    function assignAngles(person, startAngle, endAngle, generation) {
        person.startAngle = startAngle;
        person.endAngle = endAngle;
        person.generation = generation;
        
        // console.log(`📐 ${person.name}: gen ${generation}, ${person.leafCount} feuilles, angles ${startAngle.toFixed(1)}° → ${endAngle.toFixed(1)}°`);
        
        if (person.children && person.children.length > 0) {
            let currentAngle = startAngle;
            const totalAngleSpan = endAngle - startAngle;
            
            person.children.forEach(child => {
                // Proportion de l'espace pour cet enfant
                const proportion = child.leafCount / person.leafCount;
                const childAngleSpan = totalAngleSpan * proportion;
                const childEndAngle = currentAngle + childAngleSpan;
                
                assignAngles(child, currentAngle, childEndAngle, generation + 1);
                currentAngle = childEndAngle;
            });
        }
    }
    
    // Répartir sur le cercle complet (0° à 360°)
    assignAngles(rootTree, 0, 360, 0);
    
    // ÉTAPE 3 : Organiser par génération
    const generations = new Map();
    
    function collectByGeneration(person) {
        const generation = person.generation;
        
        if (generation <= state.WheelConfig.maxGenerations) {
            if (!generations.has(generation)) {
                generations.set(generation, []);
            }
            
            // Ajouter le sexe
            const fullPersonData = state.gedcomData.individuals[person.id];
            person.sex = fullPersonData ? fullPersonData.sex : 'M';
            
            // Convertir les degrés en radians pour d3
            // const startAngleRad = (person.startAngle * Math.PI) / 180;
            // const endAngleRad = (person.endAngle * Math.PI) / 180;
            
            const startAngleRad = (person.startAngle * Math.PI) / 180 - Math.PI/2;
            const endAngleRad = (person.endAngle * Math.PI) / 180 - Math.PI/2;

            generations.get(generation).push({
                person: person,
                generation: generation,
                startAngle: startAngleRad,
                endAngle: endAngleRad,
                position: generations.get(generation).length
            });
        }
        
        if (person.children) {
            person.children.forEach(child => collectByGeneration(child));
        }
    }
    
    collectByGeneration(rootTree);
    
    console.log('🚨 Générations organisées:', generations);
    return generations;
}


/**
 * Dessine une génération avec positionnement généalogique correct
 * Convention : position 0 en bas (-90°), sens horaire
 * le 0° en angle est en haut du cercle
 */
function drawGeneration(mainGroup, people, generation) {
    console.log(`🎨 Dessin génération ${generation} avec ${people.length} personnes`);

    const innerRadius = calculateInnerRadius(generation);
    const generationWidth = calculateGenerationWidth(generation);
    let spacing;
    if (generation <= 4) {
        spacing = 2;    // Espacement normal pour gen 1-4
    } else if (generation <= 8) {
        spacing = 1;    // Espacement réduit pour gen 5-8
    } else if (generation <= 12) {
        spacing = 0.5;    // Espacement minimal pour gen 9-12
    } else {
        spacing = 0.1;  // Espacement ultra-minimal pour gen 13+
    }
    
    const outerRadius = innerRadius + generationWidth - spacing;

    if (state.treeModeReal_backup === 'directAncestors') {
        // MODE ASCENDANT : positions binaires (0, 1, 2, 3...)
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
            drawPersonSegment(mainGroup, personData.person, innerRadius, outerRadius, 
                             startAngle, endAngle, generation, personData.position);
        });
        
    } else {       
        // MODE DESCENDANT avec angles pré-calculés
        people.forEach((personData, index) => {
            // NOUVEAU : Calculer nos propres rayons au lieu d'utiliser d3.partition
            const innerRadius = calculateInnerRadius(generation);
            const generationWidth = calculateGenerationWidth(generation);
            const outerRadius = innerRadius + generationWidth - spacing;
            
            // Utiliser les angles calculés par notre algorithme
            const startAngle = personData.startAngle - Math.PI/2; // Ajuster pour commencer en haut
            const endAngle = personData.endAngle - Math.PI/2;
            
            // console.log(`🚨 Segment ${personData.person.name}: r=${innerRadius}-${outerRadius}, a=${startAngle}-${endAngle}`);
            
            drawPersonSegment(mainGroup, personData.person, innerRadius, outerRadius, 
                            startAngle, endAngle, generation, index);
        });


    }
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
        .attr("transform", `translate(${textX}, ${textY}) rotate(${rotation})`)
        .style("pointer-events", "none"); // pour éviter que le texte intercepte les clics sur le segment
    
    // Utiliser la même logique que l'arbre normal
    const match = person.name?.match(/(.*?)\/(.*?)\//);
    if (match) {
        // drawWheelPersonDetails(textGroup, match, person, generation);
        drawWheelPersonDetails(textGroup, match, person, generation, startAngle, endAngle);

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
        2: 14,  // Gen 2
        3: 14,  // Gen 3
        4: 14,  // Gen 4+
        5: 14,
        6: 12,
        7: 12,
        8: 9,   // Gen 8+
        9: 8,
        10: 5,
        11: 2,
        12: 2, // 1
        13: 1, // 0.5
        14: 1, // 0.5
        14: 1, // 0.5
        default: 0.5 //1
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
function calculateAdaptiveFontSize(text, baseSize, generation, isLastName = false) {
    const config = Wheel_TEXT_CONFIG;
    
    let adjustedSize = baseSize;
    let transformedText = text;

    if (isLastName) {
        // Pour les noms de famille, on les met en majuscules
        transformedText = text.toUpperCase();
    }
    
    // Si encore trop long après transformation, alors réduire la police
    if (isLastName && (transformedText.length > config.fontReduction.threshold) && (transformedText.length < config.fontReduction.threshold  + 3))  {
         adjustedSize = Math.round(baseSize * config.fontReduction.reductionFactor);
    }
    // Pour les noms de famille, essayer minuscules d'abord
    else if (isLastName && (text.length >= config.fontReduction.threshold + 3)  ) {
        // Transformer en "Première lettre + minuscules"
        transformedText = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
        
        // Si encore trop long après transformation, alors réduire la police
        if (transformedText.length > config.fontReduction.threshold +  3) {
            adjustedSize = Math.round(baseSize * config.fontReduction.reductionFactor);
        }
    } else if (!isLastName && text.length > config.fontReduction.threshold) {
        // Pour les prénoms : réduction de police classique
        adjustedSize = Math.round(baseSize * config.fontReduction.reductionFactor);
        if (generation > 7)
        {
            adjustedSize = Math.round(baseSize * config.fontReduction.reductionFactor*0.6);            
        }

    }
    if (isLastName && generation >= 9) {
        transformedText = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }
    
    return {
        fontSize: Math.max(0.1, adjustedSize),
        text: transformedText
    };

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
 * Calcule l'espace disponible dans un segment descendant
 */
function calculateDescendantSegmentSpace(startAngle, endAngle, generation) {

    // console.log( ' debug calculateDescendantSegmentSpace')
    // Largeur angulaire du segment
    const angleSpan = endAngle - startAngle;
    
    // Rayon moyen pour ce segment
    const innerRadius = calculateInnerRadius(generation);
    const generationWidth = calculateGenerationWidth(generation);
    const midRadius = innerRadius + (generationWidth / 2);
    
    // Largeur approximative du segment (arc = angle × rayon)
    const segmentWidth = angleSpan * midRadius;
    
    return {
        angleSpan: angleSpan,
        angleDegrees: (angleSpan * 180) / Math.PI,
        segmentWidth: segmentWidth
    };
}


/**
 * Dessine les détails d'une personne dans l'éventail avec centrage correct
 */
function drawWheelPersonDetails(textGroup, match, person, generation, startAngle = null, endAngle = null) {
    const [_, firstNames, lastName] = match;
    
    // console.log( ' debug drawWheelPersonDetails ',state.treeModeReal_backup, startAngle, endAngle)


    // MODE DESCENDANT : adapter selon l'espace disponible
    if (state.treeModeReal_backup  != 'directAncestors' && startAngle !== null && endAngle !== null) {
        const space = calculateDescendantSegmentSpace(startAngle, endAngle, generation);
        
        // UN SEUL prénom, adapté selon l'espace
        let formattedFirstName = '';

        if (firstNames) {
            const firstWord = firstNames.trim().split(' ')[0];
            formattedFirstName= firstWord;
        }
        
        // Nom adapté selon l'espace
        let formattedLastName = formatLastNames(lastName);
        
        // Taille de police adaptée
        let baseFontSize;
        if (space.segmentWidth > 80) baseFontSize = 14;
        else if (space.segmentWidth > 50) baseFontSize = 12;
        else if (space.segmentWidth > 30) baseFontSize = 10;
        else baseFontSize = 8;
        
        // RENDU ADAPTATIF POUR MODE DESCENDANT
        const lineSpacing = baseFontSize * 1.2;
        const textColors = getAdaptiveTextColors(generation, person.sex);

        let firstNameY = 0;
        if (space.segmentWidth <= 80) {
            // Si espace réduit : décaler le prenom vers le bas, vers le nom
            firstNameY = -lineSpacing * 0.6;
        } else {
            firstNameY = -lineSpacing * 1;
        }


        // Prénom (s'il y en a un)
        if (formattedFirstName) {
            textGroup.append("text")
                .attr("x", 0)
                .attr("y", firstNameY)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .style("font-size", `${baseFontSize}px`)
                .style("font-weight", "bold")
                .style("fill", textColors.firstName.fill)
                .style("stroke", textColors.firstName.stroke)
                .style("stroke-width", textColors.firstName.strokeWidth)
                .style("paint-order", "stroke fill")
                .text(formattedFirstName);
        }
        
        // Nom de famille
        let nameY = 0;
        if (formattedFirstName) {
            // Si prénom présent : nom légèrement en dessous
            nameY = lineSpacing * 0.3;
        } else if (space.segmentWidth <= 80) {
            // Si pas de date et espace réduit : décaler le nom vers le bas
            nameY = lineSpacing * 0.4;
        }
        
        textGroup.append("text")
            .attr("x", 0)
            .attr("y", nameY)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .style("font-size", `${baseFontSize}px`)
            .style("font-weight", "bold")
            .style("fill", textColors.lastName.fill)
            .style("stroke", textColors.lastName.stroke)
            .style("stroke-width", textColors.lastName.strokeWidth)
            .style("paint-order", "stroke fill")
            .text(formattedLastName.toUpperCase());
        
        // Date (seulement si assez d'espace)
        // if (space.segmentWidth > 80 && generation <= 6) {
        if (true) {
            const dateText = formatWheelDates(person);
            if (dateText) {
                textGroup.append("text")
                    .attr("x", 0)
                    .attr("y", lineSpacing)
                    .attr("text-anchor", "middle")
                    .attr("dominant-baseline", "middle")
                    .style("font-size", `${Math.max(8, baseFontSize - 2)}px`)
                    .style("font-weight", "normal")
                    .style("fill", textColors.date.fill)
                    .style("stroke", textColors.date.stroke)
                    .style("stroke-width", textColors.date.strokeWidth)
                    .style("paint-order", "stroke fill")
                    .text(dateText);
            }
        }


        
    } else {
        // MODE ASCENDANT : code existant inchangé

        const formattedFirstNames = formatFirstNamesForWheel(firstNames, generation);
        const formattedLastName = formatLastNames(lastName);
        
        // Récupérer les paramètres pour cette génération
        const config = Wheel_TEXT_CONFIG;
        const baseSize = config.baseFontSize[generation] || config.baseFontSize.default;
        const lineSpacing = baseSize * (generation <= 4 ? config.lineSpacingFactor : config.lineSpacingFactor*0.8); // Plus serré pour les petites générations

        const maxNames = config.maxFirstNames[generation] || config.maxFirstNames.default;
        
        // Préparer les éléments à dessiner
        const firstNamesList = formattedFirstNames.split(' ').slice(0, maxNames);
        const hasDate = generation <= 6 && formatWheelDates(person);
        
        // Calculer la hauteur totale
        const totalLines = firstNamesList.length + 1 + (hasDate ? 1 : 0); // prénoms + nom + date éventuelle
        const totalHeight = (totalLines - 1) * lineSpacing;
        
        // Position de départ (pour centrer le nom au milieu)
        let startY;
        if (firstNamesList.length === 1) {
            startY = -lineSpacing*0.3;
        } else {
            startY = -lineSpacing*0.3; //-((firstNamesList.length - 1) * lineSpacing / 2);// - lineSpacing;  
        }
        


        const textColors = getAdaptiveTextColors(generation, person.sex);

        // Dessiner les prénoms SEULEMENT pour gen ≤ 6
        if (generation <= 7) {
            // Dessiner les prénoms (au-dessus du nom)
            firstNamesList.forEach((firstName, index) => {
                const firstNameResult = calculateAdaptiveFontSize(firstName, baseSize, generation, false);
                let y = startY - lineSpacing * (firstNamesList.length - index);

                if ( generation === 7) { y = y + 8; }
                
                textGroup.append("text")
                    .attr("x", 0)
                    .attr("y", y)
                    .attr("text-anchor", "middle")
                    .attr("dominant-baseline", "middle")
                    .style("font-size", `${firstNameResult.fontSize}px`)
                    .style("font-weight", "bold")
                    .style("fill", textColors.firstName.fill)
                    .style("stroke", textColors.firstName.stroke)
                    .style("stroke-width", textColors.firstName.strokeWidth)
                    .style("font-weight", textColors.firstName.fontWeight)

                    .style("paint-order", "stroke fill")
                    .text(firstName);
            });
        }    



        
        // Dessiner le nom (centré au milieu)
        // Pour centrer le nom quand pas de prénom (gen > 6)
        let nameY = generation > 6 ? 0 : 0; // Reste à 0 car déjà centré

        if (generation === 7) { nameY = 9; }

        
        // NOUVEAU : Pour les générations > 7, prénom + nom sur même ligne
        if (generation > 7) {
                const nbLettersToKeep = generation === 8 ? 5 : generation === 9 ?  6 : generation < 11 ? 8 : 20;
                let shortFirstName = firstNamesList[0] ? firstNamesList[0].substring(0, nbLettersToKeep) : '';
                if (firstNamesList[0].length > shortFirstName.length) { shortFirstName = shortFirstName + '.';}
                const nameResult = calculateAdaptiveFontSize(formattedLastName, baseSize, generation, true);
                let firstNameSize = Math.max(0.1, nameResult.fontSize * 0.7);
                if (generation >= 10)  {
                    firstNameSize = Math.max(0.1, nameResult.fontSize);
                } else {
                    firstNameSize = Math.max(0.1, nameResult.fontSize * 0.7);
                }
                
                // Créer un élément text unique centré
                const textElement = textGroup.append("text")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("text-anchor", "middle")
                    .attr("dominant-baseline", "middle")
                    .style("fill", textColors.lastName.fill)
                    .style("stroke", textColors.lastName.stroke)
                    .style("stroke-width", textColors.lastName.strokeWidth)
                    .style("font-weight", textColors.lastName.fontWeight)
                    .style("paint-order", "stroke fill");
                
                // Ajouter le prénom avec sa propre police
                if (shortFirstName) {
                    textElement.append("tspan")
                        .style("font-size", `${firstNameSize}px`)
                        .style("font-weight", "normal")
                        .text(shortFirstName + " ");
                }
                
                // Ajouter le nom avec sa police
                textElement.append("tspan")
                    .style("font-size", `${nameResult.fontSize}px`)
                    .style("font-weight", "bold")
                    .text(nameResult.text);


        } else {
            const nameResult = calculateAdaptiveFontSize(formattedLastName, baseSize, generation, true);
            textGroup.append("text")
                .attr("x", 0)
                .attr("y", nameY) // Position du nom
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .style("font-size", `${nameResult.fontSize}px`)
                .style("font-weight", "bold")
                .style("fill", textColors.lastName.fill)
                .style("stroke", textColors.lastName.stroke)
                .style("stroke-width", textColors.lastName.strokeWidth)
                .style("font-weight", textColors.lastName.fontWeight)
                .style("paint-order", "stroke fill")
                // .text(formattedLastName.toUpperCase());
                .text(nameResult.text);
            
            // Dessiner la date (sous le nom)
            if (hasDate) {
                const dateText = formatWheelDates(person);
                const baseDateSize = (config.baseFontSize[generation] || config.baseFontSize.default);
                const dateFontSize = Math.max(12, baseDateSize - 2);
                
                textGroup.append("text")
                    .attr("x", 0)
                    .attr("y", lineSpacing)
                    .attr("text-anchor", "middle")
                    .attr("dominant-baseline", "middle")
                    .style("font-size", `${dateFontSize}px`)
                    .style("font-weight", "normal")
                    .style("fill", textColors.date.fill)
                    .style("stroke", textColors.date.stroke)
                    .style("stroke-width", textColors.date.strokeWidth)
                    .style("font-weight", textColors.date.fontWeight)
                    .style("paint-order", "stroke fill")
                    .text(dateText);
            }

        }




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
        let startY;
        if (firstNamesList.length === 1) {
            startY = -lineSpacing*0.3;
        } else {
            startY = -lineSpacing*0.3; 
        }
        
        // Dessiner les prénoms
        firstNamesList.forEach((firstName, index) => {

            const firstNameResult = calculateAdaptiveFontSize(firstName, baseSize, 0, false);
            const y = startY - lineSpacing * (firstNamesList.length - index);
            
            textGroup.append("text")
                .attr("x", 0)
                .attr("y", y)
                .attr("text-anchor", "middle")
                .style("font-size", `${firstNameResult.fontSize}px`)
                .style("font-weight", "bold")
                .style("fill", "white")
                .style("stroke", "rgba(0,0,0,0.5)")
                .style("stroke-width", "1px")
                .style("paint-order", "stroke fill")
                .text(firstName);
        });
        
        // Nom de famille (centré)
        const nameResult = calculateAdaptiveFontSize(formattedLastName, baseSize -2 , 0, true);
        textGroup.append("text")
            .attr("x", 0)
            .attr("y", 0) // Centré
            .attr("text-anchor", "middle")
            .style("font-size", `${nameResult.fontSize}px`)
            .style("font-weight", "bold")
            .style("fill", "#e6f3ff")
            .style("stroke", "rgba(0,0,0,0.5)")
            .style("stroke-width", "1px")
            .style("paint-order", "stroke fill")
            // .text(formattedLastName.toUpperCase());
            .text(nameResult.text);
        
        // Date (sous le nom)
        if (hasDate) {
            const dateText = formatWheelDates(person);
            const baseDateSize = (config.baseFontSize[0] || config.baseFontSize.default) - 2;
            const dateFontSize = Math.max(14, baseDateSize-2);            
            textGroup.append("text")
                .attr("x", 0)
                .attr("y", lineSpacing)
                .attr("text-anchor", "middle")
                .style("font-size", `${dateFontSize}px`)
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
    // console.log('📊 Données reçues:', generationsData);
    // generationsData.forEach((people, gen) => {
    //     console.log(`  Gen ${gen}: ${people.length} personnes }`);
    // });
    
    generationsData.forEach((people, generation) => {
        if (generation > 0 && generation <= state.WheelConfig.maxGenerations) {
            // console.log(`🖊️ Génération ${generation}: ${people.length} personnes`);
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
    
    // // Couleur selon la génération
    const fillColor = getGenerationColor(generation, person.sex);
   
    // Segment principal avec données liées
    // let clickTimeout = null;

    const segmentStyle = getSegmentStyle(generation);

    segmentGroup.append("path")
        .attr("d", arc)
        .attr("class", `person-box person-segment generation-${generation}`)
        .datum(person) // ← AJOUT : lier les données au path aussi
        .style("fill", fillColor)
        .style("stroke", segmentStyle.stroke)
        .style("stroke-width", segmentStyle.width)
        .style("filter", segmentStyle.filter)
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
        .on("mouseover", function () {
            d3.select(this).style("filter", "drop-shadow(0px 0px 4px rgba(0,0,0,0.4))");
        })
        .on("mouseout", function () {
            d3.select(this).style("filter", "url(#drop-shadow)");
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
                    
                    // console.log('🔍 Transform avant modal:', {
                    //     k: currentTransform.k,
                    //     x: currentTransform.x,
                    //     y: currentTransform.y
                    // });

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
    // console.log('🎯 Dessin personne centrale:', person.name);
    
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
}
window.drawSegmentText = drawSegmentText;

/**
 * Calcule la largeur d'un anneau selon sa génération
 * Les générations proches du centre sont plus épaisses
 */
function calculateGenerationWidth(generation) {
    const baseWidth = state.WheelConfig.generationWidth;
    
    if (generation <= 8) {
        return baseWidth; // Largeur complète pour gen 1-2
    } else if (generation <= 10) {
        return baseWidth * 0.7; // 80% pour gen 9-10
    } else if (generation <= 16) {
        return baseWidth * 0.15; // 60% pour gen 5-6
    } else if (generation <= 20) {
        return baseWidth * 0.07; // 40% pour gen 7-8
    } else {
        return baseWidth * 0.05; // 30% pour gen 9+
    }
}

/**
 * Calcule le rayon intérieur pour une génération donnée
 */
function calculateInnerRadius(generation) {
    let radius = state.WheelConfig.innerRadius;
    
    for (let gen = 1; gen < generation; gen++) {
        radius += calculateGenerationWidth(gen);
    }
    
    return radius;
}
