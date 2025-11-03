import { state, showToast} from './main.js';
import { nameCloudState, filterPeopleByText } from './nameCloud.js';
import { showPersonsList } from './nameCloudInteractions.js';
import { updateTitleText } from './nameCloudUI.js';
import { placeWordsInShape, generateConcentricShapes, debugShapeBoundaries  } from './nameCloudShapes.js';
import { addStatisticsLabel } from './nameCloudAverageAge.js';
import { debounce } from './eventHandlers.js';

let containerHorizontalOffset = 0;
let containerVerticalOffset = 0;

export function setupZoom(svg, width, height) {
    let touchStartPos = null;
    let touchStartTransform = null;

    const textGroup = svg.append('g')
        .attr('class', 'name-cloud-container')
        .attr('transform', `translate(${width / 2},${height / 2})`);
    
    const zoom = d3.zoom()
        .scaleExtent([0.5, 15])
        .translateExtent([[-width, -height], [2 * width, 2 * height]])

        .filter((event) => {
            // Bloquer le pan tactile avec un seul doigt
            if (event.type === 'touchstart' || event.type === 'touchmove') {
                return event.touches.length > 1; // Autorise seulement le pinch (2 doigts)
            }
            return true; // Autorise tout le reste (souris, molette)
        })
        .on('zoom', (event) => {
            textGroup.attr('transform', event.transform);
        });
    
    const initialTransform = d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(1);
    
    svg.call(zoom.transform, initialTransform);
    
    svg.call(zoom)
       .on('wheel', (event) => {
           event.preventDefault();
           // Autoriser le zoom avec la molette
           const currentTransform = d3.zoomTransform(svg.node());
           const newScale = currentTransform.k * Math.pow(1.1, -event.deltaY * 0.01);
           
           svg.transition()
               .duration(50)
               .call(zoom.scaleTo, newScale);
       }, { passive: false })
       .on('touchstart', (event) => {
           if (event.touches.length > 1) {
               event.preventDefault();
           }
       }, { passive: false })
       .on('touchmove', (event) => {
            if (event.touches.length > 1) {
               event.preventDefault();
           }
       }, { passive: false });

    // Retourner aussi la fonction applyZoom pour permettre un zoom programmé
    // const applyZoom = (scale) => {
    //     svg.transition()
    //         .duration(750)
    //         .call(zoom.scaleTo, scale);
    // }; 
    
    
    //✅ applyTranslate
    // const applyTranslate = ( shiftX = 0, shiftY = 0) => {
    //     // console.log('\n\n --------debug applyTranslate ', shiftX, shiftY)
    //     const transform = d3.zoomIdentity
    //         .translate(width / 2 + shiftX, height / 2 + shiftY)
        
    //     svg.transition()
    //         .duration(750)
    //         .call(zoom.transform, transform);
    // };    




    // ✅ Nouvelle version de applyZoom avec translation
    const applyZoom = (scale = 1, shiftX = 0, shiftY = 0) => {
        const transform = d3.zoomIdentity
            .translate(width / 2 + shiftX, height / 2 + shiftY)
            .scale(scale);
        
        svg.transition()
            .duration(750)
            .call(zoom.transform, transform);
    };    

    
    // Gestion du pan avec un seul doigt
    svg.on('touchstart.customPan', (event) => {
        if (event.touches.length === 1) {
            touchStartPos = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY
            };
            touchStartTransform = d3.zoomTransform(svg.node());
        }
    }, { passive: false });
    
    svg.on('touchmove.customPan', (event) => {
        if (event.touches.length === 1 && touchStartPos && touchStartTransform) {
            const dx = event.touches[0].clientX - touchStartPos.x;
            const dy = event.touches[0].clientY - touchStartPos.y;
            
            // 👇 AJOUTEZ CETTE CONDITION
            // Ne bloquer que si on a bougé d'au moins 5 pixels
            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                event.preventDefault();
                
                const newTransform = d3.zoomIdentity
                    .translate(touchStartTransform.x + dx, touchStartTransform.y + dy)
                    .scale(touchStartTransform.k);
                
                svg.call(zoom.transform, newTransform);
            }
            // 👆 FIN DE LA MODIFICATION
        }
    }, { passive: false });

    
    svg.on('touchend.customPan', () => {
        touchStartPos = null;
        touchStartTransform = null;
    });

    return { zoom, textGroup, applyZoom };
}

function drawNameCloud(svg, textGroup, words, color, config) {
    const sortedWords = words.sort((a, b) => b.size - a.size);
    
    // Fonction pour obtenir la rotation d'un mot
    function getWordRotation(d) {
        if (!nameCloudState.wordRotation) return 0;
        
        // Angles aléatoires entre -20 et +20 degrés
        return Math.floor(Math.random() * 41) - 20;
    }


    // D'abord, créez les textes avec une rotation initiale
    const texts = textGroup.selectAll('text')
        .data(sortedWords)
        .join('text')
        .attr('class', 'name-text')
        .style('font-size', d => `${d.size}px`)
        .style('font-family', nameCloudState.fontFamily)
        .style('font-weight', 'bold')
        .style('fill', (d, i) => color(i % color.range().length))
        .attr('transform', d => `translate(${d.x},${d.y}) rotate(${getWordRotation(d)})`)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('cursor', 'pointer')
        .text(d => d.text);



    // Apply animation based on the selected movement type
    if (nameCloudState.wordMovement === 'simple') {
        animateWords(texts);
    } else if (nameCloudState.wordMovement === 'bounce') {
        animateWordsWithBounce(texts);
    } else if (nameCloudState.wordMovement === 'float') {
        animateWordsFloating(texts);
    } else if (nameCloudState.movingRotation) {
        // Original rotation animation
        animateRotation(texts);
    }


    // // Si l'animation est activée, démarrer l'animation de rotation
    // if (nameCloudState.movingRotation) {
    //     animateRotation(texts);
    // }

    // Fonction pour animer la rotation des mots
    function animateRotation(textElements) {
        texts.transition()
            .duration(2000) // Durée de l'animation en millisecondes
            .attr('transform', d => {
                const angle = Math.floor(Math.random() * 31) - 15; // Rotation aléatoire
                return `translate(${d.x},${d.y}) rotate(${angle})`;
            })
            .on('end', function() {
                // Animation continue (facultatif)
                setInterval(() => {
                    d3.select(this)
                        .transition()
                        .duration(2000)
                        .attr('transform', d => {
                            const newAngle = Math.floor(Math.random() * 31) - 15;
                            return `translate(${d.x},${d.y}) rotate(${newAngle})`;
                        });
                }, 3000); // Intervalle entre les animations
            });
    }


    const getClickDimensions = (d) => {
        const clickWidth = d.size > 30 ? d.width/4 : d.width/2;
        const clickHeight = d.size > 30 ? d.height/8 : (d.size > 15 ? d.height/4: d.height/2);
        return {
            width: clickWidth,
            height: clickHeight,
        };
    };            

    const clickAreas = textGroup.selectAll('rect.click-area')
        .data(sortedWords)
        .join('rect')
        .attr('class', 'click-area')
        .attr('x', d => d.x - getClickDimensions(d).width/2)
        .attr('y', d => d.y - getClickDimensions(d).height/2)
        .attr('width', d => getClickDimensions(d).width)
        .attr('height', d => getClickDimensions(d).height)
        .style('fill', 'transparent')
        .style('cursor', 'pointer');

    const textProperties = new Map();
    texts.each(function(d) {
        textProperties.set(d.text, {
            fill: color(words.indexOf(d) % color.range().length),
            size: d.size
        });
    });

    let activeTemp = null;




    /**
     * Version modifiée de handleClick utilisant la fonction factoriséé
     * À remplacer dans nameCloudRenderer.js
     */
    function handleClick(d) {
        if (!state.gedcomData) return;
        
        // Utiliser la fonction factoriséé
        const people = filterPeopleByText(d.text, config);

        // Afficher la liste des personnes
        new showPersonsList(d.text, people, config);
    }


    function createTempText(originalElement, d, props) {
        // Détecter si on est en mode zoomé
        const currentTransform = d3.zoomTransform(svg.node());
        const isZoomed = currentTransform.k !== 1;

        if (activeTemp) {
            activeTemp.remove();
            d3.selectAll('.name-text').style('opacity', 1);
        }

        let tempGroup, tempText;

        d3.select(originalElement).style('opacity', 0);

        if (isZoomed) {
            // Récupérer les coordonnées de l'élément original
            const originalTransform = d3.select(originalElement).attr('transform');
            const coords = originalTransform.match(/translate\(([^,]+),([^)]+)\)/);

            if (!coords) return null;

            const x = parseFloat(coords[1]);
            const y = parseFloat(coords[2]);

            // Utiliser les coordonnées transformées par le zoom
            const transformedX = currentTransform.x + x * currentTransform.k;
            const transformedY = currentTransform.y + y * currentTransform.k;

            tempGroup = svg.append('g')
                .attr('transform', `translate(${transformedX}, ${transformedY}) scale(${currentTransform.k})`);

            tempText = tempGroup.append('text')
                .attr('class', 'temp-text')
                .style('font-size', `${props.size * 1.2}px`)
                .style('font-family', nameCloudState.fontFamily) // Utiliser la police personnalisée
                .style('font-weight', 'bold')
                .style('fill', '#e53e3e')
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .style('cursor', 'pointer')
                .text(d.text);

            d3.select(originalElement)
                .style('font-size', `${props.size * 1.2}px`)
                .style('fill', '#e53e3e');
        } else {
            // Mode non-zoomé
            d3.select(originalElement).style('opacity', 0);

            // Récupérer les coordonnées exactes du mot original
            const originalTransform = d3.select(originalElement).attr('transform');
            const coords = originalTransform.match(/translate\(([^,]+),([^)]+)\)/);
            
            if (coords) {
                // Si on peut extraire les coordonnées, les utiliser directement
                const x = parseFloat(coords[1]);
                const y = parseFloat(coords[2]);
                
                tempGroup = svg.append('g')
                    .attr('transform', `translate(${svg.attr('width') / 2 }, ${svg.attr('height') / 2 })`);
                    
                tempText = tempGroup.append('text')
                    .attr('class', 'temp-text')
                    .style('font-size', `${props.size * 1.2}px`)
                    .style('font-family', nameCloudState.fontFamily) // Utiliser la police personnalisée
                    .style('font-weight', 'bold')
                    .style('fill', '#e53e3e')
                    .attr('transform', `translate(${x}, ${y})`) // Utiliser les coordonnées exactes
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'middle')
                    .style('cursor', 'pointer')
                    .text(d.text);
            } else {
                // Fallback: utiliser la transformation originale
                tempGroup = svg.append('g')
                    .attr('transform', `translate(${svg.attr('width') / 2 }, ${svg.attr('height') / 2 })`);
                    
                tempText = tempGroup.append('text')
                    .attr('class', 'temp-text')
                    .style('font-size', `${props.size * 1.2}px`)
                    .style('font-family', nameCloudState.fontFamily) // Utiliser la police personnalisée
                    .style('font-weight', 'bold')
                    .style('fill', '#e53e3e')
                    .attr('transform', originalTransform)
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'middle')
                    .style('cursor', 'pointer')
                    .text(d.text);
            }
        }

        tempText
            .on('click', () => handleClick(d))
            .on('mouseout', () => {
                tempGroup.remove();
                d3.select(originalElement).style('opacity', 1);
                if (isZoomed) {
                    d3.select(originalElement)
                        .style('font-size', `${props.size}px`)
                        .style('fill', props.fill);
                }
                activeTemp = null;
            });

        activeTemp = tempGroup;
        return tempGroup;
    }






    clickAreas
        .on('mouseover', function(event, d) {
            const props = textProperties.get(d.text);
            if (!props) return;
            const correspondingText = texts.filter(function(t) { 
                return t.text === d.text; 
            }).node();
            createTempText(correspondingText, d, props);
        })
        .on('click', function(event, d) {
            handleClick(d);
        });
    
    texts.append('title')
        .text(d => `${d.text}: ${d.originalSize} occurrences`);



    // afficher la moyenne
    addStatisticsLabel(svg, textGroup, config);

}

export const NameCloud = ({ nameData, config }) => {
    React.useEffect(() => {
        if (!nameData || nameData.length === 0) return;

        const svgElement = document.getElementById('name-cloud-svg');
        if (!svgElement) return;
        
        // Initialiser le SVG et lancer le layout
        const layout = initializeCloudAndLayout(
            svgElement,
            nameData,
            config,
            nameCloudState.SVG_width,
            nameCloudState.SVG_height
        );   
        layout.start();
        console.log( "in NameCloud after initializeCloudAndLayout", config,", words=", nameCloudState.totalWords, ", placed=", nameCloudState.placedWords, ", minFont=", nameCloudState.appliedMinFontSize , "maxFont", nameCloudState.appliedMaxFontSize , ", ShapeScale=", nameCloudState.autoShapeScale.toFixed(1), ", ZoomScale=", nameCloudState.autoZoomScale.toFixed(1)  )


    }, [nameData]);

    return React.createElement('div', { 
        className: 'bg-white p-4 rounded-lg shadow-lg',
        style: { 
            touchAction: 'pan-x pan-y pinch-zoom',
            userSelect: 'none'
        }
    },
        React.createElement('div', { 
            className: 'relative w-full ',
            style: { 
                touchAction: 'pan-x pan-y pinch-zoom',
                userSelect: 'none'
            }
        },
            React.createElement('svg', {
                id: 'name-cloud-svg',
                className: 'w-full h-full',
                style: { 
                    backgroundColor: '#f7fafc',
                    touchAction: 'pan-x pan-y pinch-zoom',
                    userSelect: 'none'
                }
            })
        )
    );
}

function createColorPalette() {
    return [
        '#1E88E5', // bleu vif
        '#E53935', // rouge vif
        '#43A047', // vert vif
        '#FB8C00', // orange vif
        '#8E24AA', // violet vif
        '#00ACC1', // cyan vif
        '#FFB300', // jaune vif
        '#3949AB', // indigo vif
        '#00897B', // turquoise vif
        '#7CB342'  // vert lime vif
    ];
}

export function computeFontScale(nameData) {
    const wordCount = nameData.length;
    nameCloudState.maxCount = d3.max(nameData, d => d.size) || 1;
    nameCloudState.minCount = d3.min(nameData, d => d.size) || 1;
    const maxCount=  nameCloudState.maxCount;
    const minCount=  nameCloudState.minCount;

    // Récupérer explicitement les valeurs avec fallback
    let minFontSize = nameCloudState.minFontSize || 10;
    let maxFontSize = nameCloudState.maxFontSize || 45;


    let scale;
    nameCloudState.paddingLocal = nameCloudState.padding;
    
    if (maxCount<=3) {
        minFontSize= minFontSize*3;
        if (nameCloudState.mobilePhone) {
            minFontSize = parseInt(minFontSize/2);
            maxFontSize = parseInt(maxFontSize/2);
        }
        scale = d3.scaleLinear()
            .domain([minCount, maxCount])
            .range([minFontSize, maxFontSize]);
        // console.log("Font choice: mobile, linear ", nameCloudState.mobilePhone, "wordCount=", wordCount, ", maxCount=", maxCount, ", minCount=" ,minCount,   ", minFontSize=",minFontSize, ", maxFontSize=", maxFontSize); // ", scale=", scale) ;//, scale.clamp(true))
    } else {
        if (nameCloudState.mobilePhone) {

            if ((nameCloudState.cloudShape != 'rectangular') && (nameCloudState.cloudShape != 'ellipse')) {
                nameCloudState.paddingLocal = Math.max(1, nameCloudState.padding -1);
            }
        }


        if ((nameCloudState.cloudShape != 'rectangle') && (nameCloudState.cloudShape != 'ellipse')) {
            // pour un écran de 1080 ligne on veut scalefactor = 1;
            // pour un mobile avec width = 360 on veut un scaleFactor = 0.5;
            // y = A * x + B
            const scaleFactorA =  1/1440;
            const scaleFactorB = 180/720;
            const scalefactor = scaleFactorA * Math.min(window.innerWidth, window.innerHeight) + scaleFactorB;
            minFontSize = parseInt(minFontSize*scalefactor-1);
            maxFontSize = parseInt(maxFontSize*scalefactor-1);


            //  console.log('\n\n -debug before modif ******* minFontSize=', minFontSize, ', maxFontSize=', maxFontSize,  ', ameCloudState.minFontSize=', nameCloudState.minFontSize, nameCloudState.maxFontSize)

        }


        // console.log("Font choice: log , screen", Math.min(window.innerWidth, window.innerHeight), ", mobile=",nameCloudState.mobilePhone, "wordCount=", wordCount, ", maxCount=", maxCount, ", minCount=" ,minCount,   ", minFontSize=", minFontSize, ", maxFontSize=", maxFontSize); // ", scale=", scale) ;//, scale.clamp(true))
    }
    nameCloudState.appliedMinFontSize = minFontSize;
    nameCloudState.appliedMaxFontSize = maxFontSize;

    return {minFontSize, maxFontSize} ;
}

function createFontScale(nameData) {
    
    const { minFontSize, maxFontSize } = computeFontScale(nameData) ;
    
    const maxCount=  nameCloudState.maxCount;
    const minCount=  nameCloudState.minCount;

    let scale;
    if (maxCount<=3) {
        scale = d3.scaleLinear()
            .domain([minCount, maxCount])
            .range([minFontSize, maxFontSize]);
    } else {
        scale = d3.scaleLog()
        .domain([1, d3.max(nameData, d => d.size)])
        .range([minFontSize, maxFontSize]);
    }
    return scale.clamp(true);
}

export function centerCloudNameContainer() {         

    const nameCloudContainer = document.getElementById('name-Cloud-Container');
    containerHorizontalOffset = (window.innerWidth - nameCloudState.SVG_width)/2;
    containerVerticalOffset = (window.innerHeight - nameCloudState.SVG_height)/2;
    if (nameCloudContainer) {
        nameCloudContainer.style.marginLeft = containerHorizontalOffset + 'px';
        nameCloudContainer.style.marginTop = containerVerticalOffset + 'px';
    }
}

// Fonction commune pour initialiser le SVG et créer le nuage de mots
function initializeCloudAndLayout(svgElement, nameData, config, width, height) {
    const loaderSpinnerOverlay = document.getElementById('loaderSpinnerOverlay');
    if (loaderSpinnerOverlay) { loaderSpinnerOverlay.style.visibility= 'visible'; }

    // Nettoyer le SVG existant
    d3.select(svgElement).selectAll('*').remove();
    
    // Initialiser le SVG avec les dimensions
    const svg = d3.select(svgElement)
        .attr('width', width)
        .attr('height', height);
        
    // Rectangle de fond transparent
    svg.append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'transparent')
        .style('touch-action', 'pan-x pan-y pinch-zoom')
        .lower();
        
    // Configurer le zoom et créer le textGroup
    const { zoom, textGroup, applyZoom } = setupZoom(svg, width, height);

    // Activer les événements de zoom
    svg.call(zoom)
       .on('wheel', (event) => event.preventDefault(), { passive: false })
       .on('touchstart', (event) => {
           if (event.touches.length > 1) {
               event.preventDefault();
           }
       }, { passive: false })
       .on('touchmove', (event) => {
           if (event.touches.length > 1) {
               event.preventDefault();
           }
       }, { passive: false });

    // Préparer les échelles et couleurs
    const fontScale = createFontScale(nameData);
    const colorPalette = createColorPalette();
    const color = d3.scaleOrdinal(colorPalette);
    let autoShapeScale = 1; // Échelle par défaut pour les formes
    let autoZoomScale = 1; // Échelle par défaut    
    
    // Calculer le padding approprié
    let padding = 1;
    if ((nameCloudState.cloudShape === 'rectangle') || (nameCloudState.cloudShape === 'ellipse')) {
        padding = nameCloudState.mobilePhone ? nameCloudState.padding/8 : nameCloudState.padding/4;
    }

    // Créer les données pour le layout
    const wordData = nameData.map(d => ({
        text: d.text,
        size: fontScale(d.size),
        originalSize: d.size
    }));

    // Initialiser le layout
    const layout = d3.layout.cloud()
        .size([width - 20, height - 20])
        .words(wordData)
        .padding(padding)
        .rotate(0)
        .fontSize(d => d.size)
        .spiral(nameCloudState.cloudShape === 'rectangle' ? 'rectangular' : 'archimedean')
        .spiral('rectangular')
        .random(() => 0.5)
        .canvas(function() {
            const canvas = document.createElement('canvas');
            canvas.setAttribute('willReadFrequently', 'true');
            return canvas;
        })
        .on('end', words => {
            let placedWords;

            // Mettre à jour les statistiques
            nameCloudState.totalWords = nameData.length;
            const totalWords = nameCloudState.totalWords;   
            
            let bboxWidth, bboxHeight, centerX, centerY;
            let bbox;
            
            if ((nameCloudState.cloudShape != 'rectangle') && (nameCloudState.cloudShape != 'ellipse')) {
                // Utiliser la disposition en forme personnalisée

                // Ajuster l'échelle de la forme selon le nombre de mots
                if (totalWords > 250 ) {
                    autoShapeScale = Math.min(3, Math.max(0.1,(1/800 )*totalWords + 0.45 )) ; // + 0.25 );
                } else {
                    autoShapeScale = Math.min(3, Math.max(0.1,(1/500 )*totalWords + 0.21 )) ; // + 0.25 );                    
                }
                if (( nameCloudState.maxCount<=3 ) && ( totalWords > 12)) { 
                    autoShapeScale = Math.min(3, Math.max(0.1,(1/115 )*totalWords + 0.25  ))
                }
                nameCloudState.autoShapeScale = autoShapeScale;

                placedWords = placeWordsInShape(words, nameCloudState.cloudShape, width*autoShapeScale, height*autoShapeScale);
            } else {
                // Utiliser la disposition d'origine
                placedWords = words;
                
            }


            // Calculer la boîte englobante de tous les mots pour le centrage
            bbox = words.reduce((acc, word) => {
                if (!acc) return { 
                    minX: word.x - word.width/2, 
                    maxX: word.x + word.width/2, 
                    minY: word.y - word.height/2, 
                    maxY: word.y + word.height/2 
                };
                
                return {
                    minX: Math.min(acc.minX, word.x - word.width/2),
                    maxX: Math.max(acc.maxX, word.x + word.width/2),
                    minY: Math.min(acc.minY, word.y - word.height/2),
                    maxY: Math.max(acc.maxY, word.y + word.height/2)
                };
            }, null);

            if (bbox) {
                bboxWidth = bbox.maxX - bbox.minX;
                bboxHeight = bbox.maxY - bbox.minY;
                centerX = width / 2 - (bbox.minX + bboxWidth/2);
                centerY = height / 2 - (bbox.minY + bboxHeight/2);

                // Ajuster la transformation du groupe de texte pour centrer
                textGroup.attr('transform', `translate(${centerX}, ${centerY})`);
            }


            // Ajouter les formes concentriques si activé
            if ((nameCloudState.isShapeBorder) && (nameCloudState.cloudShape != 'rectangle') && (nameCloudState.cloudShape != 'ellipse')) {
                generateConcentricShapes(textGroup, nameCloudState.cloudShape, width*autoShapeScale, height*autoShapeScale);
            }

            // console.log('\n\n -debug before modif ******* minFontSize=',nameCloudState.appliedMinFontSize, ', maxFontSize=', nameCloudState.appliedMaxFontSize, ', SVG_width=',  width, ', SVG_height=', height, ', bbox=', bbox, ', W=',bboxWidth,', H=', bboxHeight, ', centerX=',(bbox.minX + bboxWidth/2), ', centerY=',(bbox.minY + bboxHeight/2),  ', zoomW=',window.innerWidth/Math.max(1,bboxWidth), ', zoomH=',window.innerHeight/Math.max(1,bboxHeight) )

            // Dessiner le nuage avec les mots positionnés
            drawNameCloud(svg, textGroup, placedWords, color, config);

            
            // Mettre à jour les statistiques
            nameCloudState.placedWords = placedWords.length;

            // Mettre à jour le titre avec les statistiques
            const titleElement = document.getElementById('name-cloud-title');
            if (titleElement) {
                updateTitleText(titleElement, config);
            }

            // Appliquer un zoom automatique 
            setTimeout(() => {
                
                // Appliquer le zoom avec une transition fluide
                autoZoomScale =  Math.min((window.innerWidth-10)/Math.max(1,bboxWidth), (window.innerHeight-55)/Math.max(1,bboxHeight)); //, bboxHeight ;

                nameCloudState.autoZoomScale = autoZoomScale;

                applyZoom(autoZoomScale, -(bbox.minX + bboxWidth/2), 23);

            }, 100); // Léger délai pour assurer que le rendu est terminé



            // ajustement de la position du nuage si nécessaire ors d'un resize
            setTimeout(() => {
                requestAnimationFrame(() => {
                    const { d3Transform, groupRect, attrTransform } =  diagnoseCloudPosition(svg, textGroup );
                    const deltaX = window.innerWidth - 1.5*groupRect.x - groupRect.width;
                    const deltaY = window.innerHeight - 1.5*groupRect.y - groupRect.height;
                    const shiftX = (window.innerWidth - groupRect.width)/2;
                    const shiftY = (window.innerHeight - groupRect.height)/2;

                    if ((groupRect.x + groupRect.width  < window.innerWidth + 10) && (Math.abs(deltaX) < 50) 
                        && (groupRect.y + groupRect.height  < window.innerHeight + 10) && (Math.abs(deltaY) < 50) ) {
                        // console.log('bien placé  : W=', window.innerWidth, 'x H=', window.innerHeight, groupRect,', X:', groupRect.x, 'Y:', groupRect.y, ', deltaX=', deltaX,', deltaY=', deltaY);     
                    } else {
                        // console.log('applyZoom : W=', window.innerWidth, 'x H=', window.innerHeight, groupRect,', x:', groupRect.x, 'Y:', groupRect.y, ', deltaX=', deltaX,', deltaY=', deltaY, ',shiftX=', shiftX, ',shiftY=', shiftY);
                        applyZoom(autoZoomScale, -Math.round(groupRect.x) + shiftX, -Math.round(groupRect.y) + shiftY + 38);
                    }
                });
            }, 600); // Léger délai pour assurer que le rendu est terminé



            setTimeout(() => {
                // Retirer le spinner
                const loaderSpinnerOverlay = document.getElementById('loaderSpinnerOverlay');
                if (loaderSpinnerOverlay) { loaderSpinnerOverlay.style.visibility= 'hidden'; }

            }, 600); // Léger délai pour assurer que le rendu est terminé
            
        });

    return layout;
}

function diagnoseCloudPosition(svg, textGroup) {
  if (!svg || !textGroup || !textGroup.node()) {
    console.warn('SVG ou textGroup introuvable.');
    return null;
  }

  const t = d3.zoomTransform(svg.node()); // {x, y, k}
   // vrais pixels écran via getBoundingClientRect (ce que voit l'utilisateur)
  const groupRect = textGroup.node().getBoundingClientRect();
  
  // extra debug : transform attr éventuellement appliquée directement sur textGroup
  const attrTransform = textGroup.attr('transform');

  return {
    d3Transform: t,
    groupRect,
    attrTransform
  };
}

// // This function handles both rotation and position animation for words
function animateWordsWithBounce(textElements) {
    // Define the animation properties
    const movementRadius = 15;   // How far words can move from their original position
    const rotationRange = 20;    // Maximum rotation in degrees (+ or -)
    const animDuration = 2500;   // Duration of each animation cycle in ms
    const bounceStrength = 1.2;  // How much "bounce" effect to add (1.0 = no bounce)
    
    // Store original positions for each text element
    textElements.each(function(d) {
        d.originalX = d.x;
        d.originalY = d.y;
        
        // Give each word its own random timing offset
        d.timeOffset = Math.random() * 2000;
    });
    
    // Set up a continuous animation using requestAnimationFrame
    function animate() {
        const currentTime = Date.now();
        
        textElements.attr('transform', function(d) {
            // Adjust time by word's offset for more varied movement
            const adjustedTime = (currentTime + d.timeOffset) / animDuration;
            
            // Create smooth, sinusoidal movement
            const dx = Math.sin(adjustedTime * Math.PI) * movementRadius * Math.cos(adjustedTime * 0.5);
            const dy = Math.cos(adjustedTime * Math.PI) * movementRadius * Math.sin(adjustedTime * 0.7);
            
            // Add a small "bounce" effect
            const bounce = Math.abs(Math.sin(adjustedTime * bounceStrength * Math.PI)) * 2;
            
            // Create rotation that changes with time but is somewhat tied to position
            const angle = Math.sin(adjustedTime * 0.8) * rotationRange;
            
            return `translate(${d.originalX + dx * bounce},${d.originalY + dy * bounce}) rotate(${angle})`;
        });
        
        requestAnimationFrame(animate);
    }
    
    // Start the animation
    animate();
}

// This function adds a floating motion that resembles words floating in water or air
function animateWordsFloating(textElements) {
    // Define the animation properties
    const horizontalRange = 8;  // How far words can move horizontally
    const verticalRange = 5;    // How far words can move vertically (typically less than horizontal)
    const rotationRange = 10;   // Maximum rotation in degrees (+ or -)
    const speedFactor = 0.0005; // Controls overall animation speed (smaller = slower)
    
    // Store original positions and assign unique parameters to each word
    textElements.each(function(d, i) {
        d.originalX = d.x;
        d.originalY = d.y;
        
        // Unique parameters for varied movement
        d.phaseX = Math.random() * Math.PI * 2;
        d.phaseY = Math.random() * Math.PI * 2;
        d.phaseR = Math.random() * Math.PI * 2;
        
        // Different frequencies create more natural, less uniform motion
        d.freqX = 0.5 + Math.random() * 0.5;
        d.freqY = 0.5 + Math.random() * 0.5;
        d.freqR = 0.3 + Math.random() * 0.5;
        
        // Amplitude scaled by word size (optional - makes smaller words move more)
        const sizeFactor = Math.max(0.5, 1 - (d.size / 50)); // Adjust divisor based on your font size range
        d.ampX = horizontalRange * sizeFactor;
        d.ampY = verticalRange * sizeFactor;
        d.ampR = rotationRange;
    });
    
    // Animation function
    function animate() {
        const t = Date.now() * speedFactor;
        
        textElements.attr('transform', function(d) {
            // Calculate smooth sinusoidal motion with unique parameters per word
            const dx = d.ampX * Math.sin(t * d.freqX + d.phaseX);
            const dy = d.ampY * Math.sin(t * d.freqY + d.phaseY);
            const angle = d.ampR * Math.sin(t * d.freqR + d.phaseR);
            
            return `translate(${d.originalX + dx},${d.originalY + dy}) rotate(${angle})`;
        });
        
        // Continue animation
        requestAnimationFrame(animate);
    }
    
    // Start animation
    animate();
}

// Version corrigée de la fonction animateWords
function animateWords(textElements) {
    // Nettoyer les animations précédentes
    cleanupAnimations();
    
    // Définir les propriétés d'animation
    const movementRadius = 10; // Distance maximale de déplacement
    const rotationRange = 15;  // Rotation maximale en degrés (+ ou -)
    const animDuration = 3000; // Durée de chaque cycle d'animation en ms
    
    // Stocker les positions d'origine pour chaque élément
    textElements.each(function(d) {
        d.originalX = d.x;
        d.originalY = d.y;
        d.timeOffset = Math.random() * 2000; // Ajouter un décalage pour des mouvements variés
    });
    
    // Utiliser requestAnimationFrame au lieu des transitions D3 pour éviter l'accumulation
    function animate() {
        const currentTime = Date.now();
        
        textElements.attr('transform', function(d) {
            // Créer un temps ajusté pour chaque mot pour un mouvement plus naturel
            const t = (currentTime + d.timeOffset) / animDuration;
            
            // Utiliser des fonctions sinusoïdales pour un mouvement plus fluide
            const dx = Math.sin(t * Math.PI) * movementRadius * 0.7;
            const dy = Math.cos(t * Math.PI * 1.3) * movementRadius * 0.5;
            const angle = Math.sin(t * Math.PI * 0.8) * rotationRange;
            
            return `translate(${d.originalX + dx},${d.originalY + dy}) rotate(${angle})`;
        });
        
        // Continuer l'animation
        nameCloudState.animationFrameId = requestAnimationFrame(animate);
    }
    
    // Démarrer l'animation
    animate();
}

// Remplacez aussi complètement la fonction cleanupAnimations pour être sûr
function cleanupAnimations() {
    // Annuler tout requestAnimationFrame en cours
    if (nameCloudState.animationFrameId) {
        cancelAnimationFrame(nameCloudState.animationFrameId);
        nameCloudState.animationFrameId = null;
    }
    
    // Arrêter toutes les transitions D3 en cours
    try {
        if (d3 && d3.selectAll) {
            d3.selectAll('.name-text').interrupt();
        }
    } catch (error) {
        console.log("Erreur lors du nettoyage des animations:", error);
    }
}