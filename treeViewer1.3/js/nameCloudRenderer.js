import { state, showToast} from './main.js';
import { nameCloudState, getPersonsFromTree } from './nameCloud.js';
import { hasDateInRange, extractYear,  cleanProfession, cleanLocation,  } from './nameCloudUtils.js';
import { showPersonsList } from './nameCloudInteractions.js'
import { updateTitleText } from './nameCloudUI.js'
import { placeWordsInShape, generateConcentricShapes, debugShapeBoundaries  } from './nameCloudShapes.js'

let containerHorizontalOffset = 0;
let containerVerticalOffset = 0;

function setupZoom(svg, width, height) {
    const textGroup = svg.append('g')
        .attr('class', 'name-cloud-container')
        .attr('transform', `translate(${width / 2},${height / 2})`);
    
    const zoom = d3.zoom()
        .scaleExtent([0.5, 5])
        .translateExtent([[-width, -height], [2 * width, 2 * height]])
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
    
    return { zoom, textGroup };
}

let resizeTimer;
let isResizing = false;

export function setupResizeListeners() {
    ['orientationchange', 'resize'].forEach(event => {
        window.addEventListener(event, function() {
            // Annuler tout timer précédent
            clearTimeout(resizeTimer);
            
            // Première étape: centrage rapide immédiat (sans écran noir)
            handleQuickResize();
            
            // Montrer un indicateur de chargement si ce n'est pas déjà fait
            if (!isResizing) {
                isResizing = true;
                if (typeof showToast === 'function') {
                    showToast("Optimisation en cours...", 2000);
                }
            }
            
            // Deuxième étape: planifier le redimensionnement complet après un court délai
            resizeTimer = setTimeout(() => {
                // Utiliser requestAnimationFrame pour s'assurer que le navigateur est prêt
                requestAnimationFrame(() => {
                    handleCompleteResize();
                    isResizing = false;
                });
            }, 300); // Délai avant le redimensionnement complet
        });
    });
}

// Fonction pour un simple repositionnement (ultra rapide)
function handleQuickResize() {
    const svgElement = document.getElementById('name-cloud-svg');
    if (!svgElement) return;
    
    // Centrer le conteneur
    centerCloudNameContainer();
    
    // Mettre à jour le titre si disponible
    const titleElement = document.getElementById('name-cloud-title');
    if (titleElement) {
        updateTitleText(titleElement, nameCloudState.currentConfig);
    }
    
    console.log("Ajustement rapide effectué");
}

// Fonction pour un relayout complet (plus lent mais meilleur résultat)
function handleCompleteResize() {
    const svgElement = document.getElementById('name-cloud-svg');
    const modalContainer = document.querySelector('.modal-container');
    
    if (!svgElement || !modalContainer || !nameCloudState.currentNameData || !nameCloudState.currentConfig) {
        return;
    }
    
    // Adapter les dimensions du SVG
    const newScreenW = window.innerWidth;
    const newScreenH = window.innerHeight;

    // Déterminer les nouvelles dimensions du SVG
    let newWidth = newScreenW;
    let newHeight = newScreenH;

    // Mettre à jour la détection de mobile
    nameCloudState.mobilePhone = false;
    if (Math.min(window.innerWidth, window.innerHeight) < 400) nameCloudState.mobilePhone = 1;
    else if (Math.min(window.innerWidth, window.innerHeight) < 600) nameCloudState.mobilePhone = 2;

    if (nameCloudState.mobilePhone) { 
        newWidth = newScreenW + 50; 
        newHeight = newScreenH + 50; 
    }

    // Mettre à jour les variables globales
    nameCloudState.SVG_width = newWidth;
    nameCloudState.SVG_height = newHeight;

    // Initialiser le SVG et lancer le layout
    const layout = initializeCloudAndLayout(
        svgElement,
        nameCloudState.currentNameData,
        nameCloudState.currentConfig,
        nameCloudState.SVG_width,
        nameCloudState.SVG_height
    );
    
    layout.start();
    
    // Ajuster les offsets pour le centrage
    centerCloudNameContainer();
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


    // Si l'animation est activée, démarrer l'animation de rotation
    if (nameCloudState.movingRotation) {
        animateRotation(texts);
    }

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



    function handleClick(d) {
        if (!state.gedcomData) return;
        
        const persons = getPersonsFromTree(config.scope, config.rootPersonId);
    
        const people = Object.values(state.gedcomData.individuals)
            .filter(p => {
                let matches = false;
                
                if (config.type === 'prenoms') {
                    const firstName = p.name.split('/')[0].trim();
                    matches = firstName.split(' ').some(name => 
                        name.toLowerCase() === d.text.toLowerCase() || 
                        name.toLowerCase().startsWith(d.text.toLowerCase() + ' ')
                    );
                } else if (config.type === 'noms') {
                    matches = (p.name.split('/')[1] && p.name.split('/')[1].toLowerCase().trim() === d.text.toLowerCase());
                } else if (config.type === 'professions') {
                    const cleanedProfessions = cleanProfession(p.occupation);
                    matches = cleanedProfessions.includes(d.text.toLowerCase());
                } else if (config.type === 'age_procreation') {
                    if (p.birthDate) {
                        const parentBirthYear = extractYear(p.birthDate);
                        
                        // Pour chaque mariage
                        if (p.spouseFamilies) {
                            p.spouseFamilies.forEach(familyId => {
                                const family = state.gedcomData.families[familyId];
                                if (family && family.children) {
                                    family.children.forEach(childId => {
                                        const child = state.gedcomData.individuals[childId];
                                        if (child && child.birthDate) {
                                            const childBirthYear = extractYear(child.birthDate);
                                            if (childBirthYear > parentBirthYear) {
                                                const ageAtChildBirth = childBirthYear - parentBirthYear;
                                                if (ageAtChildBirth.toString() === d.text) {
                                                    matches = true;
                                                    p.date = `Parent né(e) en ${p.birthDate}, enfant: ${child.name.replace(/\//g, '')} né(e) en ${child.birthDate}`;
                                                }
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    }
                } else if (config.type === 'duree_vie') {
                    // Calcul de la durée de vie
                    if (p.birthDate && p.deathDate) {
                        const birthYear = extractYear(p.birthDate);
                        const deathYear = extractYear(p.deathDate);
                        
                        // Vérifier que la personne a vécu pendant la période sélectionnée
                        const startYear = Math.min(config.startDate, config.endDate);
                        const endYear = Math.max(config.startDate, config.endDate);
                        
                        if (birthYear <= endYear && deathYear >= startYear) {
                            const age = deathYear - birthYear;
                            matches = age.toString() === d.text;
                        }
                    }
                } else if (config.type === 'lieux') {
                    const personLocations = [
                        p.birthPlace, 
                        p.deathPlace, 
                        p.marriagePlace, 
                        p.residPlace1, 
                        p.residPlace2, 
                        p.residPlace3
                    ];
                    
                    matches = personLocations.some(location => {
                        const cleanedLocation = cleanLocation(location);
                        return cleanedLocation === d.text;
                    });
                }   

                // Vérifier si la personne est dans l'arbre approprié selon le scope
                const isInTree = 
                    config.scope === 'all' || 
                    (config.scope === 'descendants' && persons.some(descendant => descendant.id === p.id)) ||
                    (config.scope === 'ancestors' && persons.some(ancestor => ancestor.id === p.id));

                return matches && isInTree && hasDateInRange(p, config);



            })
            .map(p => ({
                name: p.name.replace(/\//g, ''),
                id: p.id,
                occupation: p.occupation || 'Non spécifiée' // Utiliser 'Non spécifiée' si l'occupation n'est pas définie
            }));
        
        showPersonsList(d.text, people, config);
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

function createFontScale(nameData) {
    const wordCount = nameData.length;
    const maxCount = d3.max(nameData, d => d.size) || 1;
    const minCount = d3.min(nameData, d => d.size) || 1;

    // Récupérer explicitement les valeurs avec fallback
    let minFontSize = nameCloudState.minFontSize || 10;
    let maxFontSize = nameCloudState.maxFontSize || 45;


    let scale;
    
    if(wordCount < 70) {
        minFontSize = ((wordCount < 20) && !nameCloudState.mobilePhone) ? minFontSize*6 + 2 : wordCount < 60 ? minFontSize*2 : minFontSize + 4;
        maxFontSize = ((wordCount < 20) && !nameCloudState.mobilePhone) ? Math.max(1,maxFontSize*2 -2) :  wordCount < 60 ? maxFontSize +3 : parseInt(maxFontSize*2/3);
        
        scale = d3.scaleLinear()
            .domain([minCount, maxCount])
            .range([minFontSize, maxFontSize]);
        console.log("Font choice: mobile, linear ", nameCloudState.mobilePhone, "wordCount=", wordCount, ", maxCount=", maxCount, ", minCount=" ,minCount,   ", minFontSize=",minFontSize, ", maxFontSize=", maxFontSize); // ", scale=", scale) ;//, scale.clamp(true))

    } else {
        if (nameCloudState.mobilePhone) {
            minFontSize = parseInt(minFontSize/2);
            maxFontSize = parseInt(maxFontSize/2);
        }
        scale = d3.scaleLog()
        .domain([1, d3.max(nameData, d => d.size)])
        .range([minFontSize, maxFontSize]);
        console.log("Font choice: PC, log ", nameCloudState.mobilePhone, "wordCount=", wordCount, ", maxCount=", maxCount, ", minCount=" ,minCount,   ", minFontSize=", minFontSize, ", maxFontSize=", maxFontSize); // ", scale=", scale) ;//, scale.clamp(true))
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
    const { zoom, textGroup } = setupZoom(svg, width, height);

    // Ajouter les formes concentriques si activé
    if ((nameCloudState.isShapeBorder) && (nameCloudState.cloudShape != 'rectangle') && (nameCloudState.cloudShape != 'ellipse')) {
        generateConcentricShapes(textGroup, nameCloudState.cloudShape, width, height);
    }

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
        .random(() => 0.5)
        .canvas(function() {
            const canvas = document.createElement('canvas');
            canvas.setAttribute('willReadFrequently', 'true');
            return canvas;
        })
        .on('end', words => {
            let placedWords;
            
            if ((nameCloudState.cloudShape != 'rectangle') && (nameCloudState.cloudShape != 'ellipse')) {
                // Utiliser la disposition en forme personnalisée
                placedWords = placeWordsInShape(words, nameCloudState.cloudShape, width*2/3, height*2/3);
            } else {
                // Utiliser la disposition d'origine
                placedWords = words;
                
                // Calculer la boîte englobante de tous les mots pour le centrage
                const bbox = words.reduce((acc, word) => {
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
                    const bboxWidth = bbox.maxX - bbox.minX;
                    const bboxHeight = bbox.maxY - bbox.minY;
                    const centerX = width / 2 - (bbox.minX + bboxWidth/2);
                    const centerY = height / 2 - (bbox.minY + bboxHeight/2);

                    // Ajuster la transformation du groupe de texte pour centrer
                    textGroup.attr('transform', `translate(${centerX}, ${centerY})`);
                }
            }

            // Mettre à jour les statistiques
            nameCloudState.totalWords = nameData.length;
            nameCloudState.placedWords = placedWords.length;
            
            // Dessiner le nuage avec les mots positionnés
            drawNameCloud(svg, textGroup, placedWords, color, config);
            
            // Mettre à jour le titre avec les statistiques
            const titleElement = document.getElementById('name-cloud-title');
            if (titleElement) {
                updateTitleText(titleElement, config);
            }
        });
    
    return layout;
}