// ====================================
// Rendu de l'arbre en éventail - Version 360° complète
// ====================================
import { state, updateRadarButtonText } from './main.js';
import { needsReset, resetWheelView, getGenerationColor, calculateOptimalZoom } from './treeWheelRenderer.js';
// import { historicalFigures } from './historicalData.js';
import { formatGedcomDate, findContextualHistoricalFigures } from './modalWindow.js';
import { translateOccupation } from './occupations.js';
import { cleanProfession, cleanLocation} from './nameCloudUtils.js';
import { speakPersonName} from './treeAnimation.js';
import { updateTreeModeSelector } from './mainUI.js';




let leverStartTime = 0;
let lastWinner = null;

// let state.currentAnimationTimeouts = [];
let allWinnerSegments = []; // Mémoriser tous les segments gagnants

// // Variable globale en haut du fichier
let isRepairingZoom = false;


export async function generateRadarCache() {
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
            
            state.cachedRadarPNG = canvas.toDataURL("image/png");
            state.isCacheValid = true;
            
            const totalEnd = performance.now();
            console.log(`✅ Cache PNG généré en: ${(totalEnd - startTime).toFixed(1)}ms`);
        };
        
        const encodedSvgData = encodeURIComponent(svgData);
        img.src = "data:image/svg+xml;charset=utf-8," + encodedSvgData;
        
    } catch (error) {
        console.error('❌ Erreur génération cache:', error);
        state.isCacheValid = false;
        // Nettoyer en cas d'erreur
        d3.selectAll('.background-element, .bubble-group').style('display', null);
    }
}

// Variables globales pour le mode fortune
let fortuneModeActive = false;
let slotHandle = null;
// let state.isSpinning = false;
let originalZoom = null;

// fonction d'animation pour réactiver le levier
function createSpinningWheelWithLever(finalRotation, duration) {
    console.log("📸 Utilisation cache PNG...");
    const overallStart = performance.now();
    
    try {
        // Utiliser le cache si disponible
        if (state.isCacheValid && state.cachedRadarPNG) {
            console.log(`⚡ Cache utilisé instantanément !`);

            // NOUVEAU : Récupérer l'angle actuel du radar avant animation
            const originalRadar = d3.select("#tree-svg").selectAll("g").filter(function() {
                return this.querySelector(".center-person-group") !== null;
            });
            
            const currentTransform = originalRadar.attr("transform") || "";
            const rotateMatch = currentTransform.match(/rotate\(([-\d.]+)\)/);
            const currentAngle = rotateMatch ? parseFloat(rotateMatch[1]) : 0;
            
            console.log(`📐 Animation partira de l'angle: ${currentAngle.toFixed(1)}°`);
            
            animateFortuneWheelWithLever(state.cachedRadarPNG, finalRotation, duration);
            return;
        }      
    } catch (error) {
        console.error("❌ Erreur animation:", error);
    }
}

// Fonction de lancement
function launchFortuneWheelWithLever(baseVelocity) {
    if (state.isSpinning) return;
    
    // NEUTRALISATION COMPLÈTE DES ZOOMS
    const svg = d3.select("#tree-svg");
    
    // Calculer le zoom optimal
    const optimalZoom = calculateOptimalZoom();
    
    // RÉINITIALISATION AGRESSIVE DU ZOOM
    const initialTransform = d3.zoomIdentity
        .translate(state.WheelConfig.centerX, state.WheelConfig.centerY)
        .scale(optimalZoom);
    
    // Supprimer TOUS les gestionnaires de zoom
    svg.on(".zoom", null);
    
    // Forcer le zoom optimal
    svg.call(state.WheelZoom.transform, initialTransform);
    
    // Recréer le zoom avec filtrage strict
    state.WheelZoom = d3.zoom()
        .scaleExtent([optimalZoom, optimalZoom])  // Verrouiller le zoom
        .filter(event => {
            // Bloquer TOUS les événements de zoom
            console.log('🚫 Zoom bloqué:', event.type);
            return false;
        })
        .on("zoom", () => {
            // Ne rien faire
        });
    
    svg.call(state.WheelZoom);
    
    state.isSpinning = true;
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

function animateFortuneWheelWithLever(transparentPng, finalRotation, duration) {
    console.log("🌪️ Animation avec levier réaliste...");

    console.log('🔍 DEBUG window.initialWheelTransform:', window.initialWheelTransform, 
        'k=', window.initialWheelTransform ? window.initialWheelTransform.k : 'N/A', 
        ' x=', window.initialWheelTransform ? window.initialWheelTransform.x : 'N/A', 
        ' y=', window.initialWheelTransform ? window.initialWheelTransform.y : 'N/A'
    );
    
    const originalRadar = d3.select("#tree-svg").selectAll("g").filter(function() {
        return this.querySelector(".center-person-group") !== null;
    });
    originalRadar.style("opacity", 0);
    
    const spinningImg = document.createElement("img");
    spinningImg.id = "fortune-wheel-spinning-img"; // ⭐ Ajouter un ID
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
    
    const timeoutId1 = setTimeout(() => {
        spinningImg.style.transition = `transform ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
        
        const currentTransform = originalRadar.attr("transform") || "";
        const rotateMatch = currentTransform.match(/rotate\(([-\d.]+)\)/);
        const radarAngle = rotateMatch ? parseFloat(rotateMatch[1]) : 0;
        
        const totalRotation = radarAngle + finalRotation;
        spinningImg.style.transform = `rotate(${totalRotation}deg)`;
    }, 50);

    const timeoutId2 = setTimeout(() => {
        console.log("🎉 Roue arrêtée - Réactivation du levier !");

        // RESTAURER le zoom normal à la fin de l'animation
        const svg = d3.select("#tree-svg");

        // Récupérer le groupe principal
        const mainGroup = svg.selectAll("g").filter(function() {
            return this.querySelector(".center-person-group") !== null;
        });
        
        // Recréer le zoom avec les paramètres par défaut
        state.WheelZoom = d3.zoom()
            .scaleExtent([0.1, 3])  // Retrouver la plage de zoom normale
            .on("zoom", ({transform}) => {
                mainGroup.attr("transform", 
                    `translate(${transform.x}, ${transform.y}) scale(${transform.k})`);
                
                state.userHasInteracted = true;
                state.lastWheelTransform = transform;
            });
        
        svg.call(state.WheelZoom);

        playSound('wheel-stop');

        if (spinningImg.parentNode) {
            document.body.removeChild(spinningImg);
        }

        const currentTransformAttr = originalRadar.attr("transform");
        
        let currentScale = window.initialWheelTransform ? window.initialWheelTransform.k : 0.7;
        
        if (currentTransformAttr) {
            const scaleMatch = currentTransformAttr.match(/scale\(([\d.]+)\)/);
            if (scaleMatch) {
                currentScale = parseFloat(scaleMatch[1]);
            }
        }
        
        state.currentRadarAngle = 0;
        
        if (currentTransformAttr) {
            const rotateMatch = currentTransformAttr.match(/rotate\(([-\d.]+)\)/);
            if (rotateMatch) {
                state.currentRadarAngle = parseFloat(rotateMatch[1]);
            }
        }
        
        console.log(`📊 Angle radar avant rotation: ${state.currentRadarAngle.toFixed(1)}°`);
        console.log(`📊 Rotation PNG ajoutée: ${finalRotation.toFixed(1)}°`);
        
        const finalAngleTotal = state.currentRadarAngle + finalRotation;
        const finalAngleNormalized = finalAngleTotal % 360;
        
        console.log(`📊 Angle final total: ${finalAngleTotal.toFixed(1)}°`);

        const startTime = performance.now();
        const winner = detectWinner(finalAngleTotal);
        console.log(`detectWinner en : ${(performance.now()-startTime).toFixed(1)}ms  `);
        
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        console.log('🔍 scale actuel:', currentScale);
        console.log('🔍 centerX/Y actuels:', centerX, centerY);
        console.log('🔍 initialWheelTransform:', window.initialWheelTransform);

        originalRadar.attr("transform", 
            `translate(${centerX}, ${centerY}) rotate(${finalAngleNormalized}) scale(${currentScale})`)
            .style("opacity", 1);

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

        d3.selectAll(".center-text-group").each(function() {
            if (finalAngleNormalized > 90 && finalAngleNormalized < 270) {
                d3.select(this).attr("transform", "rotate(180)");
            } else {
                d3.select(this).attr("transform", "rotate(0)");
            }
        });

        if (window.leverControls) {
            window.leverControls.enable();
        }
        state.isSpinning = false;

        highlightWinnerSegment(winner.segment, winner.generation, winner.sex);


        // resetLastWinnerHighlightAsync();


        
        
        const timeoutId3 = setTimeout(() => {
            announceWinner(winner);
        }, 2500);
        state.currentAnimationTimeouts.push(timeoutId3);

        const timeoutId4 = setTimeout(() => {
            hideWinnerText();
        }, 800);
        state.currentAnimationTimeouts.push(timeoutId4);

    }, duration + 100);
    
    state.currentAnimationTimeouts.push(timeoutId1);
    state.currentAnimationTimeouts.push(timeoutId2);
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


function highlightWinnerSegment(segmentIndex, generation, sex) {
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
            segment: segmentIndex,
            generation: generation,
            sex: sex,
            element: centerElement.node()
        });

        lastWinner = { segment: segmentIndex, generation: generation, sex: sex, element: centerElement.node() };
        
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
                segment: segmentIndex,
                generation: generation,
                sex: sex,
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
                const personData = targetElement.datum();
                clonedSegment
                    .transition()
                    .duration(1500)
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

                        console.log(`   Personne: ${personData.name}`);
                        
                        // // Créer un div pour le texte horizontal
                        // const textOverlay = document.createElement("div");
                        // textOverlay.style.cssText = `
                        //     position: fixed;
                        //     left: ${finalX - 120}px;
                        //     top: ${finalY - 15}px;
                        //     width: 240px;
                        //     height: 30px;
                        //     z-index: 10000;
                        //     pointer-events: none;
                        //     display: flex;
                        //     align-items: center;
                        //     justify-content: center;
                        //     background: rgba(255, 255, 255, 0.95);
                        //     border: 2px solid #0000ff;
                        //     border-radius: 6px;
                        //     font-family: Arial, sans-serif;
                        //     font-size: 14px;
                        //     font-weight: bold;
                        //     color: #000;
                        //     text-align: center;
                        //     box-shadow: 0 2px 8px rgba(0,0,0,0.4);
                        // `;
                        
                        // // Extraire et formater le nom
                        // let displayName = personData.name || "Nom inconnu";
                        // if (displayName.includes('/')) {
                        //     const match = displayName.match(/(.*?)\/(.*?)\//);
                        //     if (match) {
                        //         const prenom = match[1].trim();
                        //         const nom = match[2].trim();
                        //         displayName = `${prenom} ${nom.toUpperCase()}`;
                        //     }
                        // }
                        
                        // textOverlay.textContent = displayName;
                        // document.body.appendChild(textOverlay);
                        
                        // console.log(`   Texte créé: "${displayName}"`);
                        // console.log(`   Position texte: (${finalX - 120}, ${finalY - 15})`);
                        
                        // // Animation d'apparition du texte
                        // textOverlay.style.opacity = "0";
                        // textOverlay.style.transform = "scale(0.8)";
                        
                        // setTimeout(() => {
                        //     textOverlay.style.transition = "all 0.5s ease";
                        //     textOverlay.style.opacity = "1";
                        //     textOverlay.style.transform = "scale(1)";
                        // }, 200);
                        
                        if (Math.abs(finalX - startX) < 10 && Math.abs(finalY - startY) < 10) {
                            console.log(`✅ GROSSISSEMENT + TEXTE RÉUSSIS !`);
                        }
                        
                        // Stocker pour nettoyage
                        // lastWinner.textOverlay = textOverlay;
                        if (lastWinner) {
                            lastWinner.textOverlay = '';//textOverlay;
                        }
                    });
                
                lastWinner = { 
                    segment: segmentIndex, 
                    generation: generation, 
                    sex: sex,
                    element: targetElement.node(),
                    clonedSegment: clonedSvg.node()
                };

                console.log(`✅ Segment gagnant mis en évidence: Gen ${generation}, Segment ${segmentIndex}, sex ${sex} personData.name:${personData.name} personData.id:${personData.id} personData.sex:${personData.sex} element:${targetElement.node()}`);
                
            }, 750);
            state.currentAnimationTimeouts.push(timeoutId);
        }
    }
}


function resetLastWinnerHighlightAsync() {
    if (!lastWinner ) return;
        

    // Déférer à la prochaine frame pour ne pas bloquer
    requestAnimationFrame(() => {
        if (lastWinner.generation === 0) {
            d3.select(".center-person-group circle")
                .style("fill", " #ff6b6b")
                .style("stroke", "white")
                .style("stroke-width", "4");
        } else {
            const originalColor = getGenerationColor(lastWinner.generation, lastWinner.sex);
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
    for (let gen = 1; gen <= state.WheelConfig.maxGenerations; gen++) {
        const segmentsInGen = Math.pow(2, gen);
        const anglePerSegment = 360 / segmentsInGen;
        const targetSegment = Math.floor(normalizedAngle / anglePerSegment);
        
        console.log(`🔍 Test Gen ${gen}: cherche segment ${targetSegment}`);
        
        const targetElement = d3.select(`.person-segment-group.gen-${gen}[data-segment-position="${targetSegment}"]`);
        
        if (!targetElement.empty()) {
            const person = targetElement.datum();
            const personData = state.gedcomData.individuals[person.id];
            if (person && person.name) {
                console.log(`✅ Candidat Gen ${gen}, segment ${targetSegment}: ${person.name} : ${person.id}`);
                candidateSegments.push({
                    name: person.name,
                    id: person.id,
                    sex: personData.sex,
                    segment: targetSegment,
                    generation: gen,
                    angle: normalizedAngle,
                    element: targetElement.node()
                });
            }
        }
    }
    
    // Tirage aléatoire ou fallback centre
    if (candidateSegments.length > 0) {
        const randomIndex = Math.floor(Math.random() * candidateSegments.length);
        const winner = candidateSegments[randomIndex];
        
        console.log(`🎲 Tirage aléatoire: ${winner.name} (Gen ${winner.generation}) parmi ${candidateSegments.length} candidats`);
        return winner;
        
    } else {
        // Fallback : personne centrale
        console.log(`🎯 Aucun segment trouvé, fallback sur le centre`);
        const centerPerson = d3.select(".center-person-group").datum();
        const personData = state.gedcomData.individuals[centerPerson.id];
        
        return {
            name: centerPerson.name || 'Personne centrale',
            id: centerPerson.id,
            sex: personData.sex,
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
        this.currentTickInterval = null; // Pour le tic-tac continu
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
        this.createTickSound();
        this.createTickingLoopSound();
        this.createTimerExpiredSound();
        
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

    // Son de tic-tac d'horloge/timer
    createTickSound() {
        this.sounds['tick'] = () => {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            const duration = 0.1;
            const sampleRate = audioContext.sampleRate;
            const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
            const data = buffer.getChannelData(0);
            
            for (let i = 0; i < data.length; i++) {
                const t = i / sampleRate;
                const envelope = Math.exp(-t * 30); // Décroissance rapide
                
                // Son métallique d'horloge
                const tick = Math.sin(t * 2000 * 2 * Math.PI) * envelope * 0.7;
                const click = Math.sin(t * 4000 * 2 * Math.PI) * envelope * 0.3;
                
                data[i] = (tick + click) * this.volume * 0.6;
            }
            
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.start();
        };
    }

    // Créer un son de tic-tac continu (2 tics par cycle)
    createTickingLoopSound() {
        this.sounds['ticking-loop'] = () => {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Créer un buffer de 2 secondes avec 2 tics
            const duration = 2; // 2 secondes = 1 tic par seconde
            const sampleRate = audioContext.sampleRate;
            const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
            const data = buffer.getChannelData(0);
            
            // // Premier tic à 0.1s
            // const tick1Start = Math.floor(0.1 * sampleRate);
            // const tick1End = Math.floor(0.2 * sampleRate);
            
            // // Deuxième tic à 1.1s  
            // const tick2Start = Math.floor(1.1 * sampleRate);
            // const tick2End = Math.floor(1.2 * sampleRate);

            // Premier tic à 0.2s
            const tick1Start = Math.floor(0.2 * sampleRate);
            const tick1End = Math.floor(0.25 * sampleRate);

            // Deuxième tic à 1.2s (bien séparé du premier)
            const tick2Start = Math.floor(1.2 * sampleRate);
            const tick2End = Math.floor(1.25 * sampleRate);


            console.log(`🎵 Création tic-tac: tick1 [${tick1Start}-${tick1End}], tick2 [${tick2Start}-${tick2End}]`);
            
            // Générer les tics
            for (let i = tick1Start; i < tick1End; i++) {
                const t = (i - tick1Start) / (tick1End - tick1Start);
                const envelope = Math.exp(-t * 30);
                // data[i] = Math.sin(t * 2000 * 2 * Math.PI) * envelope * this.volume * 0.6;
                // Son métallique d'horloge
                const tick = Math.sin(t * 2000 * 2 * Math.PI) * envelope * 0.7;
                const click = Math.sin(t * 4000 * 2 * Math.PI) * envelope * 0.3;
                data[i] = (tick + click) * this.volume * 0.6;
    
    
            }
            
            for (let i = tick2Start; i < tick2End; i++) {
                const t = (i - tick2Start) / (tick2End - tick2Start);
                const envelope = Math.exp(-t * 30);
                // data[i] = Math.sin(t * 2000 * 2 * Math.PI) * envelope * this.volume * 0.6;
                const tick = Math.sin(t * 2000 * 2 * Math.PI) * envelope * 0.7;
                const click = Math.sin(t * 4000 * 2 * Math.PI) * envelope * 0.3;
                data[i] = (tick + click) * this.volume * 0.6;
            }
            
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.loop = true; // BOUCLE INFINIE !
            source.connect(audioContext.destination);
            source.start();
            
            return source; // Pour pouvoir l'arrêter
        };
    }

    // // Son de timer écoulé (alarme)
    createTimerExpiredSound() {
        this.sounds['timer-expired'] = () => {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Séquence d'alarme avec oscillations
            const beepCount = 3;
            const beepDuration = 0.4;
            const pauseDuration = 0.2;
            
            for (let i = 0; i < beepCount; i++) {
                setTimeout(() => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    const filter = audioContext.createBiquadFilter();
                    
                    // Configuration de l'oscillateur
                    oscillator.type = 'square';
                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                    
                    // Filtre pour adoucir le son carré
                    filter.type = 'lowpass';
                    filter.frequency.setValueAtTime(1200, audioContext.currentTime);
                    
                    // Enveloppe d'amplitude avec vibrato
                    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                    gainNode.gain.linearRampToValueAtTime(this.volume * 0.8, audioContext.currentTime + 0.05);
                    gainNode.gain.linearRampToValueAtTime(this.volume * 0.6, audioContext.currentTime + beepDuration * 0.7);
                    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + beepDuration);
                    
                    // Modulation de fréquence pour effet d'urgence
                    const lfo = audioContext.createOscillator();
                    const lfoGain = audioContext.createGain();
                    lfo.frequency.setValueAtTime(8, audioContext.currentTime);
                    lfoGain.gain.setValueAtTime(100, audioContext.currentTime);
                    
                    // Connexions
                    oscillator.connect(filter);
                    filter.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    lfo.connect(lfoGain);
                    lfoGain.connect(oscillator.frequency);
                    
                    // Démarrage
                    oscillator.start();
                    lfo.start();
                    
                    // Arrêt
                    setTimeout(() => {
                        oscillator.stop();
                        lfo.stop();
                    }, beepDuration * 1000);
                    
                }, i * (beepDuration + pauseDuration) * 1000);
            }
        };
    }

    // Démarrer le tic-tac continu du timer
    // startTicking(interval = 1000) {
    //     this.stopTicking(); // Arrêter le précédent s'il existe
        
    //     console.log("⏰ Démarrage du tic-tac");
    //     this.currentTickInterval = setInterval(() => {
    //         this.play('tick');
    //     }, interval);
    // }

    // Démarrer le tic-tac continu du timer - version mobile-friendly
    // startTicking(interval = 1000) {
    //     this.stopTicking(); // Arrêter le précédent s'il existe
        
    //     console.log("⏰ Démarrage du tic-tac");
        
    //     const startTime = Date.now();
    //     let tickCount = 0;
        
    //     this.currentTickInterval = setInterval(() => {
    //         // Calculer le temps écoulé réel
    //         const elapsed = Date.now() - startTime;
    //         const expectedTicks = Math.floor(elapsed / interval);
            
    //         // Rattraper les ticks manqués (max 2 pour éviter le spam)
    //         const missedTicks = Math.min(2, expectedTicks - tickCount);
            
    //         for (let i = 0; i <= missedTicks; i++) {
    //             this.play('tick');
    //         }
            
    //         tickCount = expectedTicks + 1;
            
    //         // Log pour debug mobile
    //         // if (missedTicks > 0) {
    //         //     console.log(`⚠️ Mobile: rattrapé ${missedTicks} tick(s)`);
    //         // }
    //     }, interval);
    // }

    // // Démarrer le tic-tac continu du timer - version Web Worker
    // startTicking(interval = 1000) {
    //     this.stopTicking(); // Arrêter le précédent s'il existe
        
    //     console.log("⏰ Démarrage du tic-tac (Web Worker)");
        
    //     // Créer un Web Worker inline pour éviter les fichiers séparés
    //     const workerCode = `
    //         let timerId;
    //         onmessage = function(e) {
    //             if (e.data.action === 'start') {
    //                 timerId = setInterval(() => {
    //                     postMessage('tick');
    //                 }, e.data.interval);
    //             } else if (e.data.action === 'stop') {
    //                 clearInterval(timerId);
    //             }
    //         }
    //     `;
        
    //     const blob = new Blob([workerCode], { type: 'application/javascript' });
    //     this.timerWorker = new Worker(URL.createObjectURL(blob));
        
    //     this.timerWorker.onmessage = () => {
    //         this.play('tick');
    //     };
        
    //     this.timerWorker.postMessage({ action: 'start', interval: interval });
    // }

    // // Arrêter le tic-tac
    // stopTicking() {
    //     if (this.timerWorker) {
    //         this.timerWorker.postMessage({ action: 'stop' });
    //         this.timerWorker.terminate();
    //         this.timerWorker = null;
    //         console.log("⏰ Arrêt du tic-tac (Web Worker)");
    //     }
    // }




    startTicking(interval = 1000) {
        this.stopTicking();
        console.log("⏰ Démarrage tic-tac audio en boucle");
        this.currentTickingSource = this.sounds['ticking-loop']();
    }

    stopTicking() {
        if (this.currentTickingSource) {
            this.currentTickingSource.stop();
            this.currentTickingSource = null;
            console.log("⏰ Arrêt tic-tac audio");
        }
    }


    // // Arrêter le tic-tac
    // stopTicking() {
    //     if (this.currentTickInterval) {
    //         clearInterval(this.currentTickInterval);
    //         this.currentTickInterval = null;
    //         console.log("⏰ Arrêt du tic-tac");
    //     }
    // }
    
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
        const soundNames = ['click', 'lever-pull', 'lever-spring', 'wheel-spinning', 'wheel-stop', 'winner', 'tick', 'timer-expired'];
        
        soundNames.forEach((sound, index) => {
            setTimeout(() => {
                if (sound === 'tick') {
                    // Démo du tic-tac continu pendant 3 secondes
                    this.startTicking(500);
                    setTimeout(() => this.stopTicking(), 3000);
                } else {
                    this.play(sound);
                }
            }, index * 1000);
        });
    }

    // Pour activer le tic-tac lancer :
    // const sounds = new FortuneWheelSounds();
    // sounds.play('tick');
    // sounds.startTicking(1000);
    // sounds.stopTicking();
    
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
            fr: "LA ROUE S'EST ARRÊTÉE SUR?",
            en: "THE WHEEL STOPPED ON?",
            es: "LA RUEDA SE DETUVO EN?",
            hu: "A KERÉK MEGÁLLT?"
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
        },
        showWinner: {
            fr: "Nom du gagnant?",
            en: "winner's name?",
            es: "ganador nombre?",
            hu: "nyertes neve?",
        },
        quiz: {
            fr: "quiz",
            en: "quiz",
            es: "cuestionario", 
            hu: "kvíz"
        },
        showInTree: {
            "fr": "Voir le gagnant dans l'arbre",
            "en": "Show winner in tree", 
            "es": "Ver ganador en árbol",
            "hu": "Nyertes mutatása a fán"
        },
        centerWinner: {
            "fr": "Gagnant au centre de la roue",
            "en": "Winner at center of wheel",
            "es": "Ganador al centro de la rueda", 
            "hu": "Nyertes a kerék közepén"
        },
        winnerContinue: {
            fr: "Continuer",
            en: "Continue",
            es: "Continuar",
            hu: "Folytatás"
        },
        closeQuiz: {
            fr: "fermer",
            en: "close",
            es: "cerrar",
            hu: "bezár"
        },
        quizTitle: {
            "fr": "Qui suis-je ?",
            "en": "Who am I?",
            "es": "¿Quién soy?",
            "hu": "Ki vagyok?"
        },
        quizSubtitle: {
            "fr": "un indice ?",
            "en": "A clue?",
            "es": "¿Una pista?",
            "hu": "Egy nyom?"
        },
        clickNextClue: {
            "fr": "Cliquez sur 'Indice suivant'",
            "en": "Click 'Next clue'",
            "es": "Haz clic en 'Siguiente pista'",
            "hu": "Kattints a 'Következő nyom'-ra"
        },
        enterName: {
            "fr": "Tapez le nom de la personne",
            "en": "Enter the person's name",
            "es": "Escriba el nombre de la persona",
            "hu": "Írd be a személy nevét"
        },
        checkAnswer: {
            "fr": "Vérifier",
            "en": "Check",
            "es": "Verificar",
            "hu": "Ellenőrizés"
        },
        nextClue: {
            "fr": "Indice suivant",
            "en": "Next clue",
            "es": "Siguiente pista",
            "hu": "Következő nyom"
        },
        showSolution: {
            "fr": "Solution",
            "en": "Solution", 
            "es": "Solución",
            "hu": "Megoldás"
        },
        closeQuiz: {
            "fr": "Fermer",
            "en": "Close",
            "es": "Cerrar",
            "hu": "bezárása"
        },
        clue: {
            "fr": "Indice",
            "en": "Clue",
            "es": "Pista",
            "hu": "Nyom"
        },
        correctGuess: {
            "fr": "Félicitations ! Vous avez trouvé !",
            "en": "Congratulations! You found it!",
            "es": "¡Felicidades! ¡Lo encontraste!",
            "hu": "Gratulálok! Megtaláltad!"
        },
        wrongGuess: {
            "fr": "Pas tout à fait ! La bonne réponse était :",
            "en": "Not quite! The correct answer was:",
            "es": "¡No del todo! La respuesta correcta era:",
            "hu": "Nem egészen! A helyes válasz:"
        },
        solutionRevealed: {
            "fr": "La solution était :",
            "en": "The solution was:",
            "es": "La solución era:",
            "hu": "A megoldás:"
        },
        clueNaissance: {
            "fr": "Je suis né(e)",
            "en": "I was born",
            "es": "Nací",
            "hu": "Születtem"
        },
        clueDeces: {
            "fr": "Je suis décédé(e)",
            "en": "I died",
            "es": "Morí",
            "hu": "Meghaltam"
        },
        clueLieu: {
            "fr": "à",
            "en": "in",
            "es": "en",
            "hu": "helyen:"
        },
        clueLe: {
            "fr": "le",
            "en": "on",
            "es": "el",
            "hu": ""
        },
        clueEn: {
            "fr": "en",
            "en": "in",
            "es": "en",
            "hu": "-ban/-ben"
        },
        clueMetier: {
            "fr": "J'ai exercé le métier de",
            "en": "I worked as",
            "es": "Trabajé como",
            "hu": "A foglalkozásom"
        },
        clueMariage: {
            "fr": "Je me suis marié(e) avec",
            "en": "I married",
            "es": "Me casé con",
            "hu": "Feleségül vettem / Férjhez mentem"
        },
        clueResidence: {
            "fr": "J'ai habité à",
            "en": "I lived in",
            "es": "Viví en",
            "hu": "Laktam"
        },
        clueEnfants: {
            "fr": "J'ai eu",
            "en": "I had",
            "es": "Tuve",
            "hu": "volt"
        },
        enfants: {
            "fr": "enfant(s)",
            "en": "child(ren)",
            "es": "hijo(s)",
            "hu": "gyermekem"
        },
        cluePrenomsEnfants: {
            "fr": "Les prénoms de mes enfants sont :",
            "en": "My children's names are:",
            "es": "Los nombres de mis hijos son:",
            "hu": "A gyermekeim nevei:"
        },
        cluePere: {
            "fr": "Le prénom de mon père est",
            "en": "My father's name is",
            "es": "El nombre de mi padre es",
            "hu": "Apám neve"
        },
        clueMere: {
            "fr": "Le prénom de ma mère est",
            "en": "My mother's name is",
            "es": "El nombre de mi madre es",
            "hu": "Anyám neve"
        },
        cluePrenom: {
            "fr": "Mon prénom est",
            "en": "My first name is",
            "es": "Mi nombre es",
            "hu": "A keresztnevem"
        },
        clueContexte: {
            "fr": "je suis né(e) à l'époque de",
            "en": "I was born in the time of",
            "es": "nací en la época de",
            "hu": "abban az időben születtem, amikor"
        },
        clueSexMale: {
            "fr": "Je suis un homme",
            "en": "I am a man", 
            "es": "Soy un hombre",
            "hu": "Férfi vagyok"
        },
        clueSexFemale: {
            "fr": "Je suis une femme",
            "en": "I am a woman",
            "es": "Soy una mujer", 
            "hu": "Nő vagyok"
        },
        Iam:{
            "fr": " ;  je suis, je suis ?",
            "en": " ;  I am, I am ?",
            "es": " ;  soy, soy ?",
            "hu": " ; vagyok, vagyok ?"
        },
        wrongAnswer: {
            "fr": "❌ Réponse incorrecte, essayez encore !",
            "en": "❌ Wrong answer, try again!",
            "es": "❌ Respuesta incorrecta, ¡inténtalo de nuevo!",
            "hu": "❌ Rossz válasz, próbáld újra!"
        },
        clueSiblingsMixed: {
            "fr": "j'ai",
            "en": "I have",
            "es": "tengo",
            "hu": "van"
        },
        clueSiblingsOnly: {
            "fr": "j'ai",
            "en": "I have", 
            "es": "tengo",
            "hu": "van"
        },
        clueSiblingsGeneral: {
            "fr": "j'ai",
            "en": "I have",
            "es": "tengo", 
            "hu": "van"
        },
        cluePrenomsFreresSoeurs: {
            "fr": "Les prénoms de mes frères et sœurs sont :",
            "en": "The first names of my siblings are:",
            "es": "Los nombres de mis hermanos y hermanas son:",
            "hu": "A testvéreim keresztnevei:"
        },
        freres: {
            "fr": "frères",
            "en": "brothers",
            "es": "hermanos", 
            "hu": "fiútestvér"
        },
        frere: {
            "fr": "frère",
            "en": "brother",
            "es": "hermano",
            "hu": "fiútestvér"
        },
        soeurs: {
            "fr": "sœurs",
            "en": "sisters",
            "es": "hermanas",
            "hu": "lánytestvér"
        },
        soeur: {
            "fr": "sœur", 
            "en": "sister",
            "es": "hermana",
            "hu": "lánytestvér"
        },
        freressoeurs: {
            "fr": "frères et sœurs",
            "en": "siblings",
            "es": "hermanos y hermanas",
            "hu": "testvér"
        },
        freresoeur: {
            "fr": "frère ou sœur",
            "en": "sibling", 
            "es": "hermano o hermana",
            "hu": "testvér"
        },
        et: {
            "fr": "et",
            "en": "and",
            "es": "y",
            "hu": "és"
        },
        uneSoeur: {
            "fr": "une sœur",
            "en": "one sister",
            "es": "una hermana", 
            "hu": "egy lánytestvér"
        },
    };

    // AJOUT : Vérification de sécurité
    if (!texts[textType]) {
        console.warn(`🌍 Texte manquant: ${textType}`);
        return textType; // Retourner la clé si pas trouvé
    }
    
    return texts[textType][lang] || texts[textType]['fr'];
    // return ("coucou");
}

// Fonction createRealisticSlotHandle 
function createRealisticSlotHandle() {
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
    
    // let state.leverEnabled = true;
    
    function pullLever() {
        const pullStart = performance.now();
        console.log("🎯 DÉBUT pullLever()");

        if (!state.leverEnabled || state.isSpinning) {
            console.log(getFortuneText('leverDisabled'));
            return;
        }



        console.log('Reset nécessaire:', needsReset());
    
        if (needsReset()) {
            resetWheelView();
            state.userHasInteracted = false;
        }

        // closeWinnerMessage();

        // RESET complet de toutes les animations et fenêtres en cours avec nettoyage des segments mémorisés uniquement
        state.currentAnimationTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
        state.currentAnimationTimeouts = [];
        d3.selectAll("*").interrupt();

        // Nettoyer UNIQUEMENT les segments gagnants mémorisés
        allWinnerSegments.forEach(winner => {
            if (winner.generation === 0) {
                d3.select(".center-person-group circle")
                    .style("fill", "#ff6b6b")
                    .style("stroke", "white")
                    .style("stroke-width", "4");
            }
            else {
                console.log(`🎯 DEBUG ----- Nettoyage du segment gagnant: génération ${winner.generation}, segment ${winner.segment},  name ${winner.name},  sex ${winner.sex}`);

                const originalColor = getGenerationColor(winner.generation, winner.sex);
                const targetElement = d3.select(`.person-segment-group.gen-${winner.generation}[data-segment-position="${winner.segment}"]`);
                
                if (!targetElement.empty()) {
                    targetElement.select("path")
                        .style("fill", originalColor)
                        // .style("fill", " #FFFFFF")
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

        state.leverEnabled = false;
        console.log("🎯", getFortuneText('leverPulling'));

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
        state.currentAnimationTimeouts.push(timeoutId6);
        console.log(`🎯 FIN pullLever(): ${(performance.now() - pullStart).toFixed(1)}ms`);
        
        const timeoutId7 = setTimeout(() => {
            state.leverEnabled = true;
            leverText.textContent = getFortuneText('leverText'); // TRADUCTION
        }, 1000);
        state.currentAnimationTimeouts.push(timeoutId7);

        console.log(`🎯 FIN pullLever() après traduction: ${(performance.now() - pullStart).toFixed(1)}ms`);
    }
    
    function disableLever() {
        state.leverEnabled = false;
        leverHandle.style.opacity = "0.6";
        leverHandle.style.cursor = "not-allowed";
        leverText.textContent = getFortuneText('leverRotating'); // TRADUCTION
    }
    
    function enableLever() {
        state.leverEnabled = true;
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
        if (state.leverEnabled) {
            leverHandle.style.transform = "translateX(-50%) scale(1.05)";
            leverHandle.style.boxShadow = "0 6px 18px rgba(255, 107, 107, 0.6)";
        }
    });
    
    leverHandle.addEventListener('mouseleave', () => {
        if (state.leverEnabled) {
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
    
    console.log("🎰 Levier créé !");
    
    return leverContainer;
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


// Fonction showWinnerMessage modifiée avec 3 boutons
// function showWinnerMessage(winner) {
//     const message = document.createElement("div");
//     message.style.cssText = `
//         position: fixed;
//         top: 50%;
//         left: 50%;
//         transform: translate(-50%, -50%) scale(0);
//         background: linear-gradient(135deg, #ff6b6b, #ffd93d);
//         color: white;
//         padding: 30px;
//         border-radius: 20px;
//         font-size: 24px;
//         font-weight: bold;
//         text-align: center;
//         box-shadow: 0 20px 40px rgba(0,0,0,0.3);
//         z-index: 9999;
//         transition: transform 0.5s ease;
//         min-width: 300px;
//         max-width: 95vw;
//         width: auto;
//         @media (max-width: 600px) {
//             font-size: 16px !important;
//             padding: 20px !important;
//             min-width: 280px !important;
//         }
//         @media (max-width: 400px) {
//             font-size: 14px !important;
//             padding: 15px !important;
//             min-width: 250px !important;
//         }
//     `;
//         // min-width: 400px;
//         // max-width: 90vw;
    
//     message.innerHTML = `
//         <div style="font-size: 50px;">🎉</div>
//         <div style="margin-bottom: 20px;">${getFortuneText('winnerTitle')}</div>
        
//         <!-- Zone pour afficher le nom du gagnant (cachée au début) -->
//         <div id="winnerNameDisplay" style="
//             font-size: 28px; 
//             margin: 15px 0; 
//             color: #fff700;
//             display: none;
//             opacity: 0;
//             transition: opacity 0.3s ease;
//         ">${winner.name}</div>
        
//         <!-- Conteneur des boutons -->
//         <div style="display: flex; flex-direction: column; gap: 15px; margin-top: 25px;">
//             <button id="showWinnerBtn" style="
//                 background: rgba(255, 255, 255, 0.2);
//                 border: 2px solid white;
//                 color: white;
//                 padding: 12px 20px;
//                 border-radius: 10px;
//                 font-size: 16px;
//                 font-weight: bold;
//                 cursor: pointer;
//                 transition: all 0.3s ease;
//                 backdrop-filter: blur(10px);
//             " onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
//                onmouseout="this.style.background='rgba(255,255,255,0.2)'">
//                 🏆 ${getFortuneText('showWinner')}
//             </button>
            
//             <button id="quizBtn" style="
//                 background: rgba(255, 255, 255, 0.2);
//                 border: 2px solid white;
//                 color: white;
//                 padding: 12px 20px;
//                 border-radius: 10px;
//                 font-size: 16px;
//                 font-weight: bold;
//                 cursor: pointer;
//                 transition: all 0.3s ease;
//                 backdrop-filter: blur(10px);
//             " onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
//                onmouseout="this.style.background='rgba(255,255,255,0.2)'">
//                 🧠 ${getFortuneText('quiz')}
//             </button>
            
//             <button id="continueBtn" style="
//                 background: rgba(255, 255, 255, 0.2);
//                 border: 2px solid white;
//                 color: white;
//                 padding: 12px 20px;
//                 border-radius: 10px;
//                 font-size: 16px;
//                 font-weight: bold;
//                 cursor: pointer;
//                 transition: all 0.3s ease;
//                 backdrop-filter: blur(10px);
//             " onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
//                onmouseout="this.style.background='rgba(255,255,255,0.2)'">
//                 ➡️ ${getFortuneText('winnerContinue')}
//             </button>
//         </div>
//     `;
    
//     document.body.appendChild(message);
    
//     // Animation d'apparition
//     setTimeout(() => {
//         message.style.transform = "translate(-50%, -50%) scale(1)";
//     }, 100);
    
//     // Gestion des clics sur les boutons
//     const showWinnerBtn = message.querySelector('#showWinnerBtn');
//     const quizBtn = message.querySelector('#quizBtn');
//     const continueBtn = message.querySelector('#continueBtn');
//     const winnerNameDisplay = message.querySelector('#winnerNameDisplay');
    
//     // Bouton 1 : Afficher le gagnant
//     showWinnerBtn.onclick = (e) => {
//         e.stopPropagation();
//         winnerNameDisplay.style.display = 'block';
//         setTimeout(() => {
//             winnerNameDisplay.style.opacity = '1';
//         }, 10);
        
//         // Désactiver le bouton après utilisation
//         showWinnerBtn.style.opacity = '0.5';
//         showWinnerBtn.style.cursor = 'not-allowed';
//         showWinnerBtn.onclick = null;

//         resetLastWinnerHighlightAsync();
        
//         // Jouer un son si disponible
//         if (typeof fortuneSounds !== 'undefined') {
//             fortuneSounds.play('winner');
//         }
//         speakClue(winner.name.replace(/\//g, ''));
//     };
    
//     // Bouton 2 : Quiz sur le gagnant
//     quizBtn.onclick = (e) => {
//         e.stopPropagation();
//         closeWinnerMessage(message);
//         showQuizMessage(winner);
//         resetLastWinnerHighlightAsync();
//     };
    
//     // Bouton 3 : Continuer (fermer)
//     continueBtn.onclick = (e) => {
//         e.stopPropagation();
//         closeWinnerMessage(message);
//         resetLastWinnerHighlightAsync();
//     };
// }


// Fonction showWinnerMessage modifiée avec 5 boutons
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
        min-width: 300px;
        max-width: 95vw;
        width: auto;
        @media (max-width: 600px) {
            font-size: 16px !important;
            padding: 20px !important;
            min-width: 280px !important;
        }
        @media (max-width: 400px) {
            font-size: 14px !important;
            padding: 15px !important;
            min-width: 250px !important;
        }
    `;
    
    message.innerHTML = `
        <div style="font-size: 50px;">🎉</div>
        <div style="margin-bottom: 20px;">${getFortuneText('winnerTitle')}</div>
        
        <!-- Zone pour afficher le nom du gagnant (cachée au début) -->
        <div id="winnerNameDisplay" style="
            font-size: 28px; 
            margin: 15px 0; 
            color: #fff700;
            display: none;
            opacity: 0;
            transition: opacity 0.3s ease;
        ">${winner.name}</div>
        
        <!-- Conteneur des boutons -->
        <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 25px;">
            <button id="showWinnerBtn" style="
                background: rgba(255, 255, 255, 0.2);
                border: 2px solid white;
                color: white;
                padding: 10px 18px;
                border-radius: 10px;
                font-size: 15px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
            " onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
               onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                🏆 ${getFortuneText('showWinner')}
            </button>
            
            <button id="quizBtn" style="
                background: rgba(255, 255, 255, 0.2);
                border: 2px solid white;
                color: white;
                padding: 10px 18px;
                border-radius: 10px;
                font-size: 15px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
            " onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
               onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                🧠 ${getFortuneText('quiz')}
            </button>

            <!-- NOUVEAU : Bouton voir dans l'arbre -->
            <button id="showInTreeBtn" style="
                background: rgba(255, 255, 255, 0.2);
                border: 2px solid white;
                color: white;
                padding: 10px 18px;
                border-radius: 10px;
                font-size: 15px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
            " onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
               onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                🌳 ${getFortuneText('showInTree')}
            </button>

            <!-- NOUVEAU : Bouton mettre au centre -->
            <button id="centerWinnerBtn" style="
                background: rgba(255, 255, 255, 0.2);
                border: 2px solid white;
                color: white;
                padding: 10px 18px;
                border-radius: 10px;
                font-size: 15px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
            " onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
               onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                🎯 ${getFortuneText('centerWinner')}
            </button>
            
            <button id="continueBtn" style="
                background: rgba(255, 255, 255, 0.2);
                border: 2px solid white;
                color: white;
                padding: 10px 18px;
                border-radius: 10px;
                font-size: 15px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
            " onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
               onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                ➡️ ${getFortuneText('winnerContinue')}
            </button>
        </div>
    `;
    
    document.body.appendChild(message);
    
    // Animation d'apparition
    setTimeout(() => {
        message.style.transform = "translate(-50%, -50%) scale(1)";
    }, 100);
    
    // Gestion des clics sur les boutons
    const showWinnerBtn = message.querySelector('#showWinnerBtn');
    const quizBtn = message.querySelector('#quizBtn');
    const showInTreeBtn = message.querySelector('#showInTreeBtn');
    const centerWinnerBtn = message.querySelector('#centerWinnerBtn');
    const continueBtn = message.querySelector('#continueBtn');
    const winnerNameDisplay = message.querySelector('#winnerNameDisplay');
    
    // Bouton 1 : Afficher le gagnant
    showWinnerBtn.onclick = (e) => {
        e.stopPropagation();
        winnerNameDisplay.style.display = 'block';
        setTimeout(() => {
            winnerNameDisplay.style.opacity = '1';
        }, 10);
        
        showWinnerBtn.style.opacity = '0.5';
        showWinnerBtn.style.cursor = 'not-allowed';
        showWinnerBtn.onclick = null;

        resetLastWinnerHighlightAsync();
        
        if (typeof fortuneSounds !== 'undefined') {
            fortuneSounds.play('winner');
        }
        speakClue(winner.name.replace(/\//g, ''));
    };
    
    // Bouton 2 : Quiz sur le gagnant
    quizBtn.onclick = (e) => {
        e.stopPropagation();
        closeWinnerMessage(message);
        showQuizMessage(winner);
        resetLastWinnerHighlightAsync();
    };

    // Bouton 3 : Voir dans l'arbre
    showInTreeBtn.onclick = (e) => {
        e.stopPropagation();
        closeWinnerMessage(message);
        
        // Passer en mode arbre et centrer sur le gagnant
        if (typeof displayGenealogicTree === 'function') {
            // Basculer l'état du tree/radar
            state.isRadarEnabled = !state.isRadarEnabled;  
            updateRadarButtonText(); 
            state.treeModeReal = 'ancestors';
            state.treeMode = 'ancestors';
            updateTreeModeSelector(state.treeMode);
            displayGenealogicTree(winner.id, false, false, false, 'Ancestors');
        }
        resetLastWinnerHighlightAsync();
    };

    // Bouton 4 : Mettre au centre de la roue
    centerWinnerBtn.onclick = (e) => {
        e.stopPropagation();
        closeWinnerMessage(message);
        
        // Rester en mode roue mais changer la racine
        if (typeof displayGenealogicTree === 'function') {
            displayGenealogicTree(winner.id, false, false, false, 'WheelAncestors');
        }
        resetLastWinnerHighlightAsync();
    };
    
    // Bouton 5 : Continuer (fermer)
    continueBtn.onclick = (e) => {
        e.stopPropagation();
        closeWinnerMessage(message);
        resetLastWinnerHighlightAsync();
    };
}




function cleanClueForSpeech(clueText, personSex = null) {
    let cleaned = clueText;
    
    // Supprimer (e) si c'est un homme, garder si c'est une femme
    if (personSex === 'M') {
        cleaned = cleaned.replace(/\(e\)/g, '');
    } else if (personSex === 'F') {
        cleaned = cleaned.replace(/\(e\)/g, 'e');
    }

    // Gestion des pluriels
    const hasOne = cleaned.includes(' 1 ');
    
    if (hasOne) {
        // Singulier : supprimer les marqueurs de pluriel
        cleaned = cleaned.replace(/\(s\)/g, '');
        cleaned = cleaned.replace(/\(ren\)/g, '');
    } else {
        // Pluriel : remplacer par les vraies terminaisons
        cleaned = cleaned.replace(/\(s\)/g, 's');
        cleaned = cleaned.replace(/\(ren\)/g, 'ren');
    }
    
    return cleaned
        .replace(/\s+/g, ' ')
        .trim();
}

// Fonction pour afficher le quiz progressif
function showQuizMessage(winner) {
    const quizMessage = document.createElement("div");
    quizMessage.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        background: linear-gradient(135deg, #4ecdc4, #44a08d);
        color: white;
        padding: 15px;
        border-radius: 20px;
        font-size: 18px;
        font-weight: bold;
        text-align: center;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        z-index: 10000;
        transition: transform 0.5s ease;
        min-width: 280px;
        max-width: 95vw;
        max-height: 85vh;
        overflow-y: auto;
        @media (max-width: 600px) {
            font-size: 16px !important;
            padding: 20px !important;
            min-width: 280px !important;
        }
        @media (max-width: 400px) {
            font-size: 14px !important;
            padding: 15px !important;
            min-width: 250px !important;
        }
    `;
        // min-width: 500px;
        // max-width: 90vw;
        // max-height: 80vh;
    
    // Préparer les indices dans l'ordre spécifié
    const clues = prepareProgressiveClues(winner);
    console.log("Indices préparés pour", winner.name, ":", clues);
    
    quizMessage.innerHTML = `
        <div style="font-size: 32px; margin: 5px 0;">🧠</div>
        <div style="margin-bottom: 15px; font-size: 18px;">${getFortuneText('quizTitle')} ${getFortuneText('quizSubtitle')}</div>

        <!-- Boutons de contrôle en haut -->
        <div style="display: flex; justify-content: center; gap: 6px; margin-bottom: 15px;">
            <button id="next-clue-btn" style="
                background: rgba(255, 255, 255, 0.2);
                border: 2px solid white;
                color: white;
                padding: 8px 6px;
                border-radius: 8px;
                font-size: 13px;
                cursor: pointer;
                transition: all 0.3s ease;
                white-space: nowrap;
                flex: 1;
                max-width: 110px;
            ">${getFortuneText('nextClue')}</button>
            
            <button id="show-solution-btn" style="
                background: rgba(255, 165, 0, 0.3);
                border: 2px solid white;
                color: white;
                padding: 8px 6px;
                border-radius: 8px;
                font-size: 13px;
                cursor: pointer;
                transition: all 0.3s ease;
                white-space: nowrap;
                flex: 1;
                max-width: 80px;
            ">${getFortuneText('showSolution')}</button>
            

            <button id="close-quiz-btn" style="
                background: rgba(255, 0, 0, 0.3);
                border: 2px solid white;
                color: white;
                padding: 0;
                border-radius: 8px;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.3s ease;
                width: 40px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
            ">❌</button>
        </div>

        <!-- Zone des indices -->
        <div id="clues-container" style="
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 15px;
            margin: 0 0 15px 0;
            text-align: left;
            min-height: 120px;
            max-height: 250px;
            overflow-y: auto;
        ">
            <div style="text-align: center; color: rgba(255,255,255,0.7); font-size: 14px;">
                ${getFortuneText('clickNextClue')}
            </div>
        </div>

















        
        <!-- Zone de saisie de réponse -->
        <div style="margin: 15px 0; display: flex; gap: 8px; align-items: center; flex-wrap: wrap; justify-content: center;">
            <input type="text" id="answer-input" placeholder="${getFortuneText('enterName')}" style="
                flex: 1;
                min-width: 140px;
                max-width: 200px;
                padding: 8px;
                border: none;
                border-radius: 5px;
                font-size: 14px;
                text-align: center;
            ">
            <button id="check-answer-btn" style="
                background: rgba(255, 255, 255, 0.3);
                border: 2px solid white;
                color: white;
                padding: 8px 6px;
                border-radius: 6px;
                font-size: 13px;
                cursor: pointer;
                white-space: nowrap;
            ">${getFortuneText('checkAnswer')}</button>
        </div>
        
        
        <!-- Zone de résultat -->
        <div id="result-container" style="margin-top: 20px; display: none;"></div>
    `;
    
    document.body.appendChild(quizMessage);
    
    // Animation d'apparition
    setTimeout(() => {
        quizMessage.style.transform = "translate(-50%, -50%) scale(1)";
    }, 100);
    
    // État du quiz
    let currentClueIndex = -1;
    let gameFinished = false;
    
    // Éléments DOM
    const cluesContainer = quizMessage.querySelector('#clues-container');
    const answerInput = quizMessage.querySelector('#answer-input');
    const checkAnswerBtn = quizMessage.querySelector('#check-answer-btn');
    const nextClueBtn = quizMessage.querySelector('#next-clue-btn');
    const showSolutionBtn = quizMessage.querySelector('#show-solution-btn');
    const closeQuizBtn = quizMessage.querySelector('#close-quiz-btn');
    const resultContainer = quizMessage.querySelector('#result-container');
    
    // Fonction pour afficher l'indice suivant
    function showNextClue() {
        console.log("showNextClue appelée - currentClueIndex:", currentClueIndex, "clues.length:", clues.length, "gameFinished:", gameFinished);

        if (currentClueIndex < clues.length - 1 && !gameFinished) {
            currentClueIndex++;
            const clue = clues[currentClueIndex];
            
            const clueDiv = document.createElement('div');
            clueDiv.style.cssText = `
                background: rgba(255, 255, 255, 0.15);
                padding: 10px;
                margin: 5px 0;
                border-radius: 5px;
                border-left: 4px solid white;
                animation: slideIn 0.5s ease;
            `;
            clueDiv.innerHTML = `<strong>${getFortuneText('clue')} ${currentClueIndex + 1}:</strong> ${clue}`;

            const displayClue = cleanClueForSpeech(clue, winner.sex);
            clueDiv.innerHTML = `<strong>${getFortuneText('clue')} ${currentClueIndex + 1}:</strong> ${displayClue}`;
            
            // Remplacer le contenu de placeholder s'il existe
            if (cluesContainer.children.length === 1 && 
                cluesContainer.firstChild.textContent.includes(getFortuneText('clickNextClue'))) {
                cluesContainer.innerHTML = '';
            }
            
            cluesContainer.appendChild(clueDiv);
            cluesContainer.scrollTop = cluesContainer.scrollHeight;

            // lecture vocale de l'indice
            const cleanedClue = cleanClueForSpeech(clue, winner.sex) + getFortuneText('Iam');
            console.log('🧹 Indice nettoyé:', cleanedClue);
            speakClue(cleanedClue);


            
            // Jouer un son si disponible
            if (typeof fortuneSounds !== 'undefined') {
                // fortuneSounds.stopTicking();
                // fortuneSounds.play('tick');
                fortuneSounds.startTicking(800);
            }


            
            // Désactiver le bouton si plus d'indices
            if (currentClueIndex >= clues.length - 1) {
                nextClueBtn.style.opacity = '0.5';
                nextClueBtn.style.cursor = 'not-allowed';
                nextClueBtn.disabled = true;
            }
        }
    }
    
    // Fonction pour vérifier la réponse
    function checkAnswer() {
        if (gameFinished) return;
        
        const userAnswer = answerInput.value.trim().toLowerCase();
        const correctAnswer = winner.name.replace(/\//g, '').toLowerCase();
        
        // Vérification flexible (nom complet ou prénom)
        const isCorrect = userAnswer === correctAnswer || 
                        correctAnswer.includes(userAnswer) ||
                        userAnswer.includes(correctAnswer.split(' ')[0]); // Premier prénom
        
        if (isCorrect) {
            // gameFinished = true;
            showResult(true, winner.name.replace(/\//g, ''));
            if (typeof fortuneSounds !== 'undefined') {
                fortuneSounds.play('winner');
            }
        } else {
            // Réponse fausse : afficher message temporaire et vider le champ
            showTemporaryMessage(getFortuneText('wrongAnswer'));
            speakClue(getFortuneText('wrongAnswer'));
            

            answerInput.value = '';
            if (typeof fortuneSounds !== 'undefined') {
                fortuneSounds.play('click');
            }
        }
    }


    function showTemporaryMessage(message) {
        const tempMsg = document.createElement('div');
        tempMsg.style.cssText = `
            background: rgba(255, 0, 0, 0.2);
            color: white;
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
            text-align: center;
            animation: fadeIn 0.3s ease;
        `;
        tempMsg.textContent = message;
        
        // Insérer avant la zone de saisie
        const answerInput = document.querySelector('#answer-input');
        answerInput.parentNode.insertBefore(tempMsg, answerInput);
        
        // Supprimer après 3 secondes
        setTimeout(() => {
            if (tempMsg.parentNode) {
                tempMsg.parentNode.removeChild(tempMsg);
            }
        }, 3000);
    }

    
    // Fonction pour afficher la solution
    function showSolution() {
        // gameFinished = true;
        // Jouer un son si disponible
        if (typeof fortuneSounds !== 'undefined') {
            fortuneSounds.play('winner');
        }
        showResult('solution', winner.name.replace(/\//g, ''));
        speakClue(winner.name.replace(/\//g, ''));
        fortuneSounds.stopTicking();
    }
    
    // Fonction pour afficher le résultat
    function showResult(type, correctName) {
        let resultHTML = '';
        let bgColor = '';
        
        switch(type) {
            case true:
                resultHTML = `
                    <div style="font-size: 24px;">🎉</div>
                    <div>${getFortuneText('correctGuess')}</div>
                    <div style="font-size: 20px; margin: 10px 0; color: #fff700;">${correctName}</div>
                `;
                bgColor = 'rgba(0, 255, 0, 0.2)';
                break;
            case false:
                resultHTML = `
                    <div style="font-size: 24px;">😔</div>
                    <div>${getFortuneText('wrongGuess')}</div>
                    <div style="font-size: 20px; margin: 10px 0; color: #fff700;">${correctName}</div>
                `;
                bgColor = 'rgba(255, 0, 0, 0.2)';
                break;
            case 'solution':
                resultHTML = `
                    <div style="font-size: 24px;">💡</div>
                    <div>${getFortuneText('solutionRevealed')}</div>
                    <div style="font-size: 20px; margin: 10px 0; color: #fff700;">${correctName}</div>
                `;
                bgColor = 'rgba(255, 165, 0, 0.2)';
                break;
        }
        
        resultContainer.style.cssText = `
            background: ${bgColor};
            border-radius: 10px;
            padding: 20px;
            margin-top: 20px;
            display: block;
            animation: fadeIn 0.5s ease;
        `;
        resultContainer.innerHTML = resultHTML;
        
        // Garder nextClueBtn actif
        answerInput.disabled = true;
        checkAnswerBtn.disabled = true;
        showSolutionBtn.disabled = true;
        
        [checkAnswerBtn, showSolutionBtn].forEach(btn => {
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
        });
        

    }
    
    // Gestionnaires d'événements
    nextClueBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Clic sur indice suivant, index actuel:", currentClueIndex);
        showNextClue();
    };

    checkAnswerBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        checkAnswer();
    };

    showSolutionBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        showSolution();
    };
    
    // Permettre validation avec Entrée
    answerInput.onkeypress = (e) => {
        if (e.key === 'Enter' && !gameFinished) {
            checkAnswer();
        }
    };
    
    // Fermer le quiz
    closeQuizBtn.onclick = () => {
        quizMessage.style.transform = "translate(-50%, -50%) scale(0)";
        setTimeout(() => {
            if (quizMessage.parentNode) {
                document.body.removeChild(quizMessage);
            }
            hideWinnerText();
            resetLastWinnerHighlightAsync();
            fortuneSounds.stopTicking();
        }, 300);
    };
    
    // Focus sur le champ de saisie
    // setTimeout(() => answerInput.focus(), 500);
    // Empêcher le focus automatique sur mobile
    answerInput.setAttribute('readonly', true);

    // Activer l'input seulement quand l'utilisateur veut taper
    answerInput.onclick = () => {
        answerInput.removeAttribute('readonly');
        answerInput.focus();
    };
}


function formatDateForClue(dateString) {
    if (!dateString) return '';
    
    const formatted = formatGedcomDate(dateString);
    const parts = dateString.trim().split(' ').filter(part => part.length > 0);
    
    if (parts.length === 1) {
        // Seulement l'année
        return ` ${getFortuneText('clueEn')} ${formatted}`;
    } else if (parts.length === 2) {
        // Mois et année  
        return ` ${getFortuneText('clueEn')} ${formatted}`;
    } else {
        // Jour complet
        return ` ${getFortuneText('clueLe')} ${formatted}`;
    }
}



export function speakClue(clueText) {
    console.log('🔊 Lecture de phrase complète:', clueText);
    return speakPersonName(clueText, true);
}


// // Test massif avec boucles pour détecter les patterns de blocage
// async function testSpeechMassively(rounds = 5, testsPerRound = 20) {
//     window.stopSpeechTest = false; // Flag d'arrêt
//     console.log(`🚀 DÉBUT TEST MASSIF: ${rounds} rounds de ${testsPerRound} tests`);
//     console.log(`🛑 Pour arrêter: tapez stopSpeechTest() dans la console`);

//     const testPhrases = [
//         "Je suis né en 1965",
//         "J'ai habité à Paris", 
//         "Mon métier était ingénieur",
//         "Je me suis marié avec Marie",
//         "J'ai eu 3 enfants",
//         "Mon père s'appelait Pierre",
//         "Ma mère s'appelait Jeanne",
//         "Je suis décédé en 2020",
//         "I was born in London",
//         "My name is John"
//     ];
    
//     let globalSuccess = 0;
//     let globalBlocked = 0;
//     let globalTotal = 0;
    
//     for (let round = 1; round <= rounds; round++) {
//         if (window.stopSpeechTest) {
//             console.log(`🛑 TEST ARRÊTÉ par l'utilisateur au round ${round}`);
//             break;
//         }
//         console.log(`\n🔄 ===== ROUND ${round}/${rounds} =====`);
        
//         let roundSuccess = 0;
//         let roundBlocked = 0;
        
//         for (let test = 1; test <= testsPerRound; test++) {
//             if (window.stopSpeechTest) {
//                 console.log(`🛑 TEST ARRÊTÉ par l'utilisateur à R${round}-T${test}`);
//                 break;
//             }
//             const phrase = testPhrases[(test - 1) % testPhrases.length];
//             globalTotal++;
            
//             console.log(`📝 R${round}-T${test}: "${phrase}"`);
            
//             const startTime = Date.now();
//             const maxTime = Math.max(3000, phrase.length * 100);
            
//             try {
//                 await Promise.race([
//                     speakClue(phrase),
//                     new Promise((_, reject) => setTimeout(() => reject('TIMEOUT'), maxTime))
//                 ]);
                
//                 const duration = Date.now() - startTime;
//                 if (duration < maxTime * 0.9) {
//                     roundSuccess++;
//                     globalSuccess++;
//                     console.log(`✅ OK (${duration}ms)`);
//                 } else {
//                     roundBlocked++;
//                     globalBlocked++;
//                     console.log(`⚠️ LENT (${duration}ms) = probablement bloqué`);
//                 }
//             } catch (e) {
//                 roundBlocked++;
//                 globalBlocked++;
//                 console.log(`❌ TIMEOUT/ERROR`);
//             }
            
//             // Micro-pause entre tests
//             await new Promise(resolve => setTimeout(resolve, 200));
//         }
        
//         const roundPercent = (roundSuccess / testsPerRound * 100).toFixed(1);
//         console.log(`📊 ROUND ${round}: ${roundSuccess}/${testsPerRound} succès (${roundPercent}%)`);
        
//         // Pause plus longue entre rounds
//         if (round < rounds) {
//             console.log(`⏸️ Pause 2s avant round ${round + 1}...`);
//             await new Promise(resolve => setTimeout(resolve, 2000));
//         }
//     }
    
//     const finalPercent = (globalSuccess / globalTotal * 100).toFixed(1);
    
//     console.log(`\n🏁 ===== RÉSULTATS GLOBAUX =====`);
//     console.log(`📈 Succès: ${globalSuccess}/${globalTotal} (${finalPercent}%)`);
//     console.log(`📉 Bloqués: ${globalBlocked}/${globalTotal} (${(100 - finalPercent).toFixed(1)}%)`);
    
//     if (finalPercent >= 90) {
//         console.log('🎉 EXCELLENTE FIABILITÉ !');
//     } else if (finalPercent >= 70) {
//         console.log('👍 FIABILITÉ CORRECTE');
//     } else if (finalPercent >= 50) {
//         console.log('⚠️ FIABILITÉ MOYENNE');
//     } else {
//         console.log('💀 FIABILITÉ CATASTROPHIQUE !');
//     }
    
//     return { success: globalSuccess, blocked: globalBlocked, total: globalTotal, percent: finalPercent };
// }

// // Usage: testSpeechMassively() ou testSpeechMassively(10, 30) pour 300 tests
// window.testSpeechMassively = testSpeechMassively;



// // Fonction pour arrêter le test
// function stopSpeechTest() {
//     window.stopSpeechTest = true;
//     window.speechSynthesis.cancel(); // Arrêter aussi la synthèse en cours
//     console.log('🛑 ARRÊT DU TEST DEMANDÉ...');
// }
// window.stopSpeechTest = stopSpeechTest;




// Fonction pour préparer les indices progressifs
function prepareProgressiveClues(person) {
    const clues = [];
    console.log("prepareProgressiveClues - person:", person);
    console.log("person.id:", person.id);
    console.log("state.gedcomData.individuals[person.id]:", state.gedcomData.individuals[person.id]);
    
    const personData = state.gedcomData.individuals[person.id];
    
    if (!personData) {
        console.log("❌ PersonData introuvable pour", person.id);
        return clues;
    }
    console.log("✅ PersonData trouvée:", personData);

    // 1. Premier indice : sexe
    if (personData.sex) {
        const sexClue = personData.sex === 'M' 
            ? getFortuneText('clueSexMale') 
            : getFortuneText('clueSexFemale');
        clues.push(sexClue);
    }
    
    // 2. Date et lieu de naissance
    if (personData.birthDate) {
        let clue = `${getFortuneText('clueNaissance')} ${formatDateForClue(personData.birthDate)}`;
        if (personData.birthPlace) {
            clue += ` ${getFortuneText('clueLieu')} ${cleanLocation(personData.birthPlace)}`;
        }
        clues.push(clue);
    }
    
    // 3. Date et lieu de décès
    if (personData.deathDate) {
        let clue = `${getFortuneText('clueDeces')} ${formatDateForClue(personData.deathDate)}`;
        if (personData.deathPlace) {
            clue += ` ${getFortuneText('clueLieu')} ${cleanLocation(personData.deathPlace)}`;
        }
        clues.push(clue);
    }
    
    // 4. Métier
    if (personData.occupation) {
        const cleanedProfessions = cleanProfession(personData.occupation);
        cleanedProfessions.forEach(prof => {
            if (prof) {
                const translatedProf = translateOccupation(prof, window.CURRENT_LANGUAGE || 'fr');
                clues.push(`${getFortuneText('clueMetier')} ${translatedProf}`);
            }
        });
    }
    
    // 5. Lieu de résidence
    const residences = [
        { place: personData.residPlace1, date: personData.residDate1 },
        { place: personData.residPlace2, date: personData.residDate2 },
        { place: personData.residPlace3, date: personData.residDate3 }
    ].filter(r => r.place);
    
    if (residences.length > 0) {
        residences.forEach(residence => {
            clues.push(`${getFortuneText('clueResidence')} ${cleanLocation(residence.place)}`);
        });
    }
    
    // 6. Enfants
    if (personData.spouseFamilies && personData.spouseFamilies.length > 0) {
        const family = state.gedcomData.families[personData.spouseFamilies[0]];
        if (family && family.children && family.children.length > 0) {
            clues.push(`${getFortuneText('clueEnfants')} ${family.children.length} ${getFortuneText('enfants')}`);
            
            // Prénoms des enfants
            const childNames = family.children
                .map(childId => {
                    const child = state.gedcomData.individuals[childId];
                    return child ? child.name.replace(/\//g, '').split(' ')[0] : null;
                })
                .filter(name => name)
                .join(', ');
            
            if (childNames) {
                clues.push(`${getFortuneText('cluePrenomsEnfants')} ${childNames}`);
            }
        }
    }
    

    // 7. Père - chercher dans les familles où la personne est enfant
    const parentFamilies = personData.families ? personData.families.filter(famId => {
        const family = state.gedcomData.families[famId];
        return family && family.children && family.children.includes(person.id);
    }) : [];

    if (parentFamilies.length > 0) {
        const family = state.gedcomData.families[parentFamilies[0]];
        if (family && family.husband) {
            const father = state.gedcomData.individuals[family.husband];
            if (father) {
                const fatherFirstName = father.name.replace(/\//g, '').split(' ')[0];
                clues.push(`${getFortuneText('cluePere')} ${fatherFirstName}`);
            }
        }
    }

    // 8. Mère - même logique
    if (parentFamilies.length > 0) {
        const family = state.gedcomData.families[parentFamilies[0]];
        if (family && family.wife) {
            const mother = state.gedcomData.individuals[family.wife];
            if (mother) {
                const motherFirstName = mother.name.replace(/\//g, '').split(' ')[0];
                clues.push(`${getFortuneText('clueMere')} ${motherFirstName}`);
            }
        }
    }



    // 9. Frères et sœurs
    if (parentFamilies.length > 0) {
        const family = state.gedcomData.families[parentFamilies[0]];
        if (family && family.children && family.children.length > 1) {
            // Récupérer tous les enfants sauf la personne actuelle
            const siblings = family.children
                .filter(childId => childId !== person.id)
                .map(siblingId => {
                    const sibling = state.gedcomData.individuals[siblingId];
                    return sibling ? {
                        id: siblingId,
                        name: sibling.name.replace(/\//g, ''),
                        firstName: sibling.name.replace(/\//g, '').split(' ')[0],
                        sex: sibling.sex
                    } : null;
                })
                .filter(sibling => sibling);

            if (siblings.length > 0) {
                // Indice sur le nombre de frères et sœurs
                const siblingsCount = siblings.length;
                const brothersCount = siblings.filter(s => s.sex === 'M').length;
                const sistersCount = siblings.filter(s => s.sex === 'F').length;
                
                let siblingClue = '';
                if (brothersCount > 0 && sistersCount > 0) {
                    // Frères ET sœurs
                    if (brothersCount > 1 && sistersCount === 1 ) {
                        siblingClue = `${getFortuneText('clueSiblingsMixed')} ${brothersCount} ${getFortuneText('freres')} ${getFortuneText('et')} ${getFortuneText('uneSoeur')}`;
                    } else if (brothersCount === 1 && sistersCount > 1) {
                        siblingClue = `${getFortuneText('clueSiblingsMixed')} ${brothersCount} ${getFortuneText('frere')} ${getFortuneText('et')} ${sistersCount} ${getFortuneText('soeurs')}`;
                    } else if (brothersCount === 1 && sistersCount === 1 ) {
                        siblingClue = `${getFortuneText('clueSiblingsMixed')} ${brothersCount} ${getFortuneText('frere')} ${getFortuneText('et')} ${getFortuneText('uneSoeur')}`;
                    } else if (brothersCount > 1 && sistersCount > 1 ) {
                        siblingClue = `${getFortuneText('clueSiblingsMixed')} ${brothersCount} ${getFortuneText('freres')} ${getFortuneText('et')} ${sistersCount} ${getFortuneText('soeurs')}`;
                    }
                } else if (brothersCount > 0) {
                    // Que des frères
                    siblingClue = `${getFortuneText('clueSiblingsOnly')} ${brothersCount} ${getFortuneText(brothersCount > 1 ? 'freres' : 'frere')}`;
                } else if (sistersCount > 0) {
                    // Que des sœurs
                    if (sistersCount === 1 ) {
                        siblingClue = `${getFortuneText('clueSiblingsOnly')} ${getFortuneText('uneSoeur')}`;
                    } else {
                        siblingClue = `${getFortuneText('clueSiblingsOnly')} ${sistersCount} ${getFortuneText('soeurs')}`;
                    }
                } else {
                    // Fallback général
                    siblingClue = `${getFortuneText('clueSiblingsGeneral')} ${siblingsCount} ${getFortuneText(siblingsCount > 1 ? 'freressoeurs' : 'freresoeur')}`;
                }
                
                clues.push(siblingClue);
                
                // Prénoms des frères et sœurs (si pas trop nombreux)
                if (siblings.length <= 5) {
                    const siblingNames = siblings
                        .map(s => s.firstName)
                        .filter(name => name)
                        .join(', ');
                    
                    if (siblingNames) {
                        clues.push(`${getFortuneText('cluePrenomsFreresSoeurs')} ${siblingNames}`);
                    }
                }
            }
        }
    }


    // 10. Mariage (conjoint, date, lieu)
    if (personData.spouseFamilies && personData.spouseFamilies.length > 0) {
        const family = state.gedcomData.families[personData.spouseFamilies[0]];
        if (family) {
            // Trouver le conjoint
            const spouseId = family.husband === person.id ? family.wife : family.husband;
            if (spouseId) {
                const spouse = state.gedcomData.individuals[spouseId];
                if (spouse) {
                    let clue = `${getFortuneText('clueMariage')} ${spouse.name.replace(/\//g, '')}`;
                    if (family.marriageDate) {
                        clue += `${formatDateForClue(family.marriageDate)}`;
                    }
                    if (family.marriagePlace) {
                        clue += ` ${getFortuneText('clueLieu')} ${cleanLocation(family.marriagePlace)}`;
                    }
                    clues.push(clue);
                }
            }
        }
    }
    
    // 11. Prénom (avant-dernier indice)
    const fullName = personData.name.replace(/\//g, '');
    const firstName = fullName.split(' ')[0];
    if (firstName && firstName !== fullName) {
        clues.push(`${getFortuneText('cluePrenom')} ${firstName}`);
    }
    
    // 12. Contexte historique
    const historicalContext = findContextualHistoricalFigures(person.id);
    if (historicalContext) {
        const contexts = [historicalContext.birthContext, historicalContext.marriageContext, historicalContext.deathContext]
            .filter(ctx => ctx && (ctx.governmentType || (ctx.rulers && ctx.rulers.length > 0)));
        
        if (contexts.length > 0) {
            const context = contexts[0];
            let contextClue = getFortuneText('clueContexte');
            
            if (context.rulers && context.rulers.length > 0) {
                contextClue += ` ${context.rulers[0].name}`;
            } else if (context.governmentType) {
                contextClue += ` ${context.governmentType.type}`;
            }
            
            clues.push(contextClue);
        }
    }
    
    return clues;
}

// Fonction Instructions pour l'utilisateur  
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

function removeWinnerRedArrowIndicator() {
    d3.select("#winner-indicator").remove();
    d3.select("#winner-indicator-fixed").remove();
    console.log('🗑️ Flèche rouge supprimée');
}

// Fonction pour calculer les dimensions responsives
function getResponsiveDimensions() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const screenSize = Math.min(screenWidth, screenHeight);
    
    // Calcul des échelles basées sur la taille d'écran
    // Base de référence : 1024px = échelle 1.0
    const baseSize = 1024;
    const scale = Math.max(0.6, Math.min(2.0, screenSize / baseSize));
    
    // Dimensions de la flèche (ajustées selon l'échelle)
    const arrowScale = scale;
    const arrowWidth = Math.round(40 * arrowScale);        // Base: 40px
    const arrowHeight = Math.round(45 * arrowScale);       // Base: 45px
    const arrowStrokeWidth = Math.max(2, Math.round(3 * arrowScale));
    
    // Position de la flèche (plus bas dans l'écran)
    const arrowTopOffset = Math.max(80, Math.round(120 * scale));
    
    // Taille du texte (avec limites min/max)
    const baseFontSize = 16;
    const fontSize = Math.max(12, Math.min(24, Math.round(baseFontSize * scale)));
    const textStrokeWidth = Math.max(2, Math.round(3 * scale));
    
    // Position du texte par rapport à la flèche
    const textOffsetY = Math.round(5 * scale);
    
    console.log(`📱 Écran: ${screenWidth}x${screenHeight}, Échelle: ${scale.toFixed(2)}`);
    console.log(`🎯 Flèche: ${arrowWidth}x${arrowHeight}px, Police: ${fontSize}px`);
    
    return {
        scale,
        arrow: {
            width: arrowWidth,
            height: arrowHeight,
            strokeWidth: arrowStrokeWidth,
            topOffset: arrowTopOffset
        },
        text: {
            fontSize,
            strokeWidth: textStrokeWidth,
            offsetY: textOffsetY
        }
    };
}

// Version améliorée de createWinnerRedArrowIndicator
export function createWinnerRedArrowIndicator() {
    // Supprimer l'ancienne
    d3.select("#winner-indicator-fixed").remove();
    
    // Calculer les dimensions responsives
    const dimensions = getResponsiveDimensions();
    
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
        .attr("transform", `translate(${window.innerWidth/2}, ${dimensions.arrow.topOffset})`);
    
    // Flèche adaptative avec tige plus longue
    const arrowHalfWidth = dimensions.arrow.width / 2;
    const arrowHalfHeight = dimensions.arrow.height / 2;
    const arrowTipHeight = Math.round(dimensions.arrow.height * 0.8); // Réduire la pointe pour allonger la tige
    const arrowShaftWidth = Math.round(dimensions.arrow.width * 0.35); // Tige légèrement plus fine
    const arrowShaftHalfWidth = arrowShaftWidth / 2;
    
    // Points de la flèche (forme proportionnelle)
    const arrowPoints = [
        `0,${arrowTipHeight}`,                                    // Pointe
        `-${arrowHalfWidth},${arrowTipHeight - arrowHalfHeight}`, // Gauche
        `-${arrowShaftHalfWidth},${arrowTipHeight - arrowHalfHeight}`, // Gauche shaft
        `-${arrowShaftHalfWidth},0`,                             // Haut gauche shaft
        `${arrowShaftHalfWidth},0`,                              // Haut droit shaft
        `${arrowShaftHalfWidth},${arrowTipHeight - arrowHalfHeight}`, // Droit shaft
        `${arrowHalfWidth},${arrowTipHeight - arrowHalfHeight}`   // Droite
    ].join(' ');
    
    indicator.append("polygon")
        .attr("points", arrowPoints)
        .attr("fill", "#ff4444")
        .attr("stroke", "white")
        .attr("stroke-width", dimensions.arrow.strokeWidth)
        .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.3))"); // Ombre pour meilleure visibilité
    
    console.log(`🏆 Indicateur FIXE adaptatif créé - Flèche: ${dimensions.arrow.width}x${dimensions.arrow.height}px`);
    
    // Stocker les dimensions pour showWinnerText
    window.winnerIndicatorDimensions = dimensions;
}

// Fonction pour afficher le texte "GAGNANT" pendant la rotation
function showWinnerText() {
    const indicator = d3.select("#winner-indicator-fixed g");
    
    // Supprimer l'ancien texte s'il existe
    indicator.select("text").remove();
    
    // Utiliser les dimensions calculées ou les recalculer si nécessaire
    const dimensions = window.winnerIndicatorDimensions || getResponsiveDimensions();
    
    // Position du texte (sous la flèche)
    const textY = dimensions.arrow.height + dimensions.text.offsetY;
    
    // Ajouter le texte avec taille adaptative
    indicator.append("text")
        .attr("x", 0)
        .attr("y", textY)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "hanging") // Meilleur alignement
        .attr("font-size", `${dimensions.text.fontSize}px`)
        .attr("font-weight", "bold")
        .attr("font-family", "Arial, sans-serif") // Police système
        .attr("fill", "#ffffff")
        .attr("stroke", "#000000")
        .attr("stroke-width", dimensions.text.strokeWidth)
        .attr("paint-order", "stroke fill")
        .style("text-shadow", `2px 2px 4px rgba(0,0,0,0.8)`)
        .style("filter", "drop-shadow(0 1px 2px rgba(0,0,0,0.5))") // Ombre supplémentaire
        .text(getFortuneText('winnerIndicator'));
    
    console.log(`📝 Texte gagnant adaptatif - Taille: ${dimensions.text.fontSize}px, Position Y: ${textY}px`);
}

// Fonction pour masquer le texte
function hideWinnerText() {
    d3.select("#winner-indicator-fixed g text").remove();
}

// fonction d'activation
export function enableFortuneMode() {
    if (fortuneModeActive) return;
    
    console.log(getFortuneText('fortuneModeActive'));
    
    fortuneModeActive = true;
    
    const svg = d3.select("#tree-svg");
    originalZoom = svg.on(".zoom");


    //#######################    ATTENTION : à enlever peut-être #########
    // svg.on(".zoom", null);
    //####################################################################
    
    resetRadarToCenter();
    createRealisticSlotHandle(); 
    createWinnerRedArrowIndicator(); 
    showFortuneInstructions(); 
    
    console.log("✅", getFortuneText('fortuneModeActive'));
}

// fonction de désactivation
export function disableFortuneModeWithLever() {

    // BLOQUER si réparation en cours
    if (isRepairingZoom) {
        console.log('🚫 Désactivation bloquée - réparation en cours');
        return;
    }

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

function announceWinner(winner) {
    console.log(`🏆 ${getFortuneText('winnerIndicator')}: ${winner.name}`);
    
    const indicator = d3.select("#winner-indicator");
    indicator.transition()
        .duration(500)
        .attr("transform", `translate(${window.innerWidth/2}, 30) scale(1.2)`)
        .transition()
        .duration(500)
        .attr("transform", `translate(${window.innerWidth/2}, 50) scale(1)`);
    
    showWinnerMessage(winner); 
    
    playSound('winner');
}
