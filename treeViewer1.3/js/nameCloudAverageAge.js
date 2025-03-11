import { state, showToast } from './main.js';
import { nameCloudState, getPersonsFromTree } from './nameCloud.js';
import { showPersonsList } from './nameCloudInteractions.js'
import { hasDateInRange, cleanProfession, cleanLocation,  } from './nameCloudUtils.js';


function initializeDistributionChart(data, container) {
    // S'assurer que d3 est disponible
    if (!window.d3) {
        console.error("D3.js n'est pas chargé");
        return;
    }
    
    // Vider le conteneur
    d3.select(container).html("");
    
    // Dimensions du graphique avec marges réduites
    const margin = {top: 20, right: 15, bottom: 30, left: 30}; // Marges réduites
    const width = container.clientWidth - margin.left - margin.right;
    const height = container.clientHeight - margin.top - margin.bottom;
    
    // Créer le SVG
    const svg = d3.select(container).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Si pas de données
    if (data.length === 0) {
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height / 2)
            .attr("text-anchor", "middle")
            .text("Aucune donnée disponible");
        return;
    }
    
    // Échelles X et Y
    const x = d3.scaleBand()
        .domain(data.map(d => d.age))
        .range([0, width])
        .padding(0.1);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count)])
        .nice()
        .range([height, 0]);
    
    // Barres
    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.age))
        .attr("y", d => y(d.count))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.count))
        .attr("fill", "#4299e1")
        .attr("rx", 2);
    
    // Vérifier si les données ont une propriété average (à partir de data, pas nameData)
    const averageLifespan = data.averageLifespan;
    if (averageLifespan) {
        const avgAge = parseFloat(averageLifespan);
        const avgX = x(Math.round(avgAge)) + x.bandwidth() / 2;
        
        // Ligne verticale pour la moyenne
        svg.append("line")
            .attr("x1", avgX)
            .attr("x2", avgX)
            .attr("y1", height)
            .attr("y2", 0)
            .attr("stroke", "#e53e3e")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,5");
        
        // Étiquette pour la moyenne plus compacte
        svg.append("text")
            .attr("x", avgX)
            .attr("y", 0)
            .attr("text-anchor", "middle")
            .attr("font-size", "11px") // Taille réduite
            .attr("fill", "#e53e3e")
            .text(`Moy: ${avgAge}a`); // Texte plus court
    }
    
    // Axes avec moins de graduations
    const tickFrequency = Math.ceil(data.length / 10); // Réduire le nombre de graduations
    
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickValues(x.domain().filter((_, i) => i % tickFrequency === 0)));
    
    svg.append("g")
        .call(d3.axisLeft(y).ticks(5)); // Réduire le nombre de graduations
    
    // Étiquettes des axes plus compactes
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 5)
        .attr("font-size", "10px") // Taille réduite
        .text("Âge");
    
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 12)
        .attr("x", -height / 2)
        .attr("font-size", "10px") // Taille réduite
        .text("Nombre");
}

// Modifications simples pour la fonction addStatItem pour éviter le retour à la ligne
function addStatItem(grid, label, value, color = 'inherit') {
    const labelDiv = document.createElement('div');
    labelDiv.textContent = label + ':';
    labelDiv.style.fontWeight = 'normal';
    labelDiv.style.whiteSpace = 'nowrap'; // Empêcher le retour à la ligne
    labelDiv.style.overflow = 'hidden'; // Masquer le texte qui déborde
    labelDiv.style.textOverflow = 'ellipsis'; // Afficher des points de suspension si nécessaire
    
    const valueDiv = document.createElement('div');
    valueDiv.textContent = value;
    valueDiv.style.fontWeight = 'bold';
    valueDiv.style.color = color;
    valueDiv.style.whiteSpace = 'nowrap'; // Empêcher le retour à la ligne
    valueDiv.style.overflow = 'hidden'; // Masquer le texte qui déborde
    valueDiv.style.textOverflow = 'ellipsis'; // Afficher des points de suspension si nécessaire
    
    grid.appendChild(labelDiv);
    grid.appendChild(valueDiv);
}


// Fonction pour calculer la médiane
function calculateMedian(nameData) {
    const ages = [];
    
    // Extraire tous les âges avec leur fréquence
    nameData.forEach(item => {
        const age = parseInt(item.text);
        const count = item.size;
        
        // Ajouter l'âge 'count' fois
        for (let i = 0; i < count; i++) {
            ages.push(age);
        }
    });
    
    // Trier les âges
    ages.sort((a, b) => a - b);
    
    // Calculer la médiane
    const middle = Math.floor(ages.length / 2);
    
    if (ages.length % 2 === 0) {
        // Si le nombre d'éléments est pair, la médiane est la moyenne des deux éléments du milieu
        return ((ages[middle - 1] + ages[middle]) / 2).toFixed(1) + ' ans';
    } else {
        // Si le nombre d'éléments est impair, la médiane est l'élément du milieu
        return ages[middle] + ' ans';
    }
}

// Fonction pour calculer le mode (âge le plus fréquent)
function calculateMode(nameData) {
    if (!nameData || nameData.length === 0) return 'N/A';
    
    // Trouver l'âge avec la plus grande fréquence
    const modeItem = nameData.reduce((prev, current) => {
        return (prev.size > current.size) ? prev : current;
    });
    
    return modeItem.text + ' ans';
}

// Fonction pour préparer les données pour un histogramme
function prepareHistogramData(nameData) {
    // Convertir les données du nuage en format pour l'histogramme
    return nameData.map(item => ({
        age: parseInt(item.text),
        count: item.size
    })).sort((a, b) => a.age - b.age);
}


/**
 * Ajoute l'étiquette d'âge moyen (durée de vie ou procréation)
 * @param {Object} svg - L'élément SVG
 * @param {Object} textGroup - Le groupe de texte
 * @param {Object} config - La configuration
 */
export function addAverageLabel(svg, textGroup, config) {
    // Ne rien faire si ce n'est pas un nuage d'âge ou si la moyenne n'est pas disponible
    if (!['duree_vie', 'age_procreation'].includes(config.type) || 
        !nameCloudState.currentNameData || 
        !nameCloudState.currentNameData.averageLifespan) {
        return;
    }
    
    // Récupérer la configuration pour ce type
    const cfg = statsConfig[config.type];
    
    // Supprimer l'ancienne étiquette si elle existe
    svg.selectAll(`.${cfg.containerClass}`).remove();
    
    // Récupérer la moyenne et l'arrondir
    const average = parseFloat(nameCloudState.currentNameData.averageLifespan).toFixed(1);

    // Calculer la position
    const labelWidth = 140;
    const labelHeight = 60;
    const xPos = parseInt(svg.attr('width')) - labelWidth - 30; // 30px de marge
    const yPos = 110; // position fixe en haut

    // Stocker les coordonnées
    statsPositionsMap[config.type] = {
        x: xPos,
        y: yPos,
        width: labelWidth,
        height: labelHeight
    };
    
    // Créer un élément pour afficher la moyenne
    const averageContainer = svg.append('g')
        .attr('class', cfg.containerClass)
        .attr('id', cfg.labelId)
        .attr('transform', `translate(${xPos}, ${yPos})`);
    
    // Fond semi-transparent
    averageContainer.append('rect')
        .attr('width', labelWidth)
        .attr('height', labelHeight)
        .attr('fill', 'rgba(255, 255, 255, 0.8)')
        .attr('rx', 5)
        .attr('stroke', '#ccc')
        .attr('stroke-width', 1);
    
    // Titre
    averageContainer.append('text')
        .attr('x', labelWidth / 2)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .style('font-family', 'Arial, sans-serif')
        .style('font-size', '12px')
        .text(cfg.labelText);
    
    // Valeur de la moyenne
    averageContainer.append('text')
        .attr('x', labelWidth / 2)
        .attr('y', 45)
        .attr('text-anchor', 'middle')
        .style('font-family', 'Arial, sans-serif')
        .style('font-size', '22px')
        .style('font-weight', 'bold')
        .style('fill', '#e53e3e')
        .text(`${average} ans`);
        
    // Repositionner le bouton si nécessaire
    setTimeout(() => forceRepositionButton(config.type), 50);
}

/**
 * Crée un modal avec les statistiques détaillées
 * @param {Object} nameData - Les données à afficher
 * @param {string} type - Le type de statistiques
 */
export function createStatsModal(nameData, type = 'duree_vie') {
    if (!nameData || !nameData.stats) return;
    
    // Vérifier que le type est valide
    if (!['duree_vie', 'age_procreation'].includes(type)) {
        console.error(`Type de statistiques invalide: ${type}`);
        return;
    }
    
    // Récupérer la configuration pour ce type
    const cfg = statsConfig[type];
    
    // Préparation des données pour le graphique
    const histogramData = prepareHistogramData(nameData);
    histogramData.averageLifespan = nameData.averageLifespan;
    
    // Création du modal
    const modal = document.createElement('div');
    modal.className = `${cfg.buttonClass}-modal`;
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.backgroundColor = 'white';
    modal.style.padding = '20px';
    modal.style.borderRadius = '8px';
    modal.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
    modal.style.zIndex = '1100';
    modal.style.maxWidth = '600px';
    modal.style.width = '90%';
    modal.style.maxHeight = '80vh';
    modal.style.overflow = 'auto';
    
    // En-tête du modal
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '15px';
    header.style.borderBottom = '1px solid #eee';
    header.style.paddingBottom = '10px';
    
    const title = document.createElement('h2');
    // Ajouter l'intervalle de temps au titre
    if (nameCloudState.currentConfig && nameCloudState.currentConfig.startDate && nameCloudState.currentConfig.endDate) {
        title.textContent = `${cfg.modalTitle} entre ${nameCloudState.currentConfig.startDate} et ${nameCloudState.currentConfig.endDate}`;
    } else {
        title.textContent = cfg.title;
    }
    title.style.margin = '0';
    title.style.fontSize = '16px';
    
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '24px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.padding = '0 5px';
    closeButton.onclick = () => {
        document.body.removeChild(modal);
        document.body.removeChild(overlay);
    };
    
    header.appendChild(title);
    header.appendChild(closeButton);
    modal.appendChild(header);
    
    // Corps avec statistiques
    const stats = nameData.stats;
    const statsContainer = document.createElement('div');
    statsContainer.style.marginBottom = '20px';
    
    // Vérifier si nous sommes sur un écran de faible hauteur
    const isLowHeight = window.innerHeight < 400;
    
    if (isLowHeight) {
        // Version compacte pour les écrans de faible hauteur
        // Créer deux lignes de statistiques
        
        // Première ligne: moyenne, médiane, min, max
        const row1 = document.createElement('div');
        row1.style.display = 'flex';
        row1.style.justifyContent = 'space-between';
        row1.style.marginBottom = '8px';
        row1.style.flexWrap = 'nowrap';
        
        // Formatage des statistiques sur la première ligne
        const average = document.createElement('div');
        average.innerHTML = `<span style="font-size:12px">Moyenne:</span> <span style="color:#3949AB;font-weight:bold">${stats.average}ans</span>`;
        average.style.whiteSpace = 'nowrap';
        average.style.marginRight = '10px';
        
        const median = document.createElement('div');
        median.innerHTML = `<span style="font-size:12px">Médiane:</span> <span style="font-weight:bold">${calculateMedian(nameData).replace(' ans', 'a')}</span>`;
        median.style.whiteSpace = 'nowrap';
        median.style.marginRight = '10px';
        
        const min = document.createElement('div');
        min.innerHTML = `<span style="font-size:12px">Min:</span> <span style="font-weight:bold">${stats.min}a</span>`;
        min.style.whiteSpace = 'nowrap';
        min.style.marginRight = '10px';
        
        const max = document.createElement('div');
        max.innerHTML = `<span style="font-size:12px">Max:</span> <span style="font-weight:bold">${stats.max}a</span>`;
        max.style.whiteSpace = 'nowrap';
        
        row1.appendChild(average);
        row1.appendChild(median);
        row1.appendChild(min);
        row1.appendChild(max);
        
        // Deuxième ligne: nombre de personnes et mode
        const row2 = document.createElement('div');
        row2.style.display = 'flex';
        row2.style.justifyContent = 'space-between';
        row2.style.flexWrap = 'nowrap';
        
        const count = document.createElement('div');
        count.innerHTML = `<span style="font-size:12px">Échantillon:</span> <span style="font-weight:bold">${stats.count} pers.</span>`;
        count.style.whiteSpace = 'nowrap';
        count.style.marginRight = '10px';
        
        const mode = document.createElement('div');
        mode.innerHTML = `<span style="font-size:12px">Age plus fréquent</span> <span style="font-weight:bold">${calculateMode(nameData).replace(' ans', 'a')}</span>`;
        mode.style.whiteSpace = 'nowrap';
        
        row2.appendChild(count);
        row2.appendChild(mode);
        
        statsContainer.appendChild(row1);
        statsContainer.appendChild(row2);
    } else {
        // Version standard pour les écrans normaux
        const grid = document.createElement('div');
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = '70% 30%'; // Plus d'espace pour la colonne des valeurs
        grid.style.gap = '8px'; // Espacement réduit
        grid.style.marginBottom = '15px';
        
        // Ajout des statistiques principales
        addStatItem(grid, `${cfg.modalStatsPrefix}moyenne`, `${stats.average} ans`, '#3949AB');
        addStatItem(grid, `${cfg.modalStatsPrefix}médiane`, calculateMedian(nameData), '#3949AB');
        addStatItem(grid, 'Minimum', `${stats.min} ans`);
        addStatItem(grid, 'Maximum', `${stats.max} ans`);
        addStatItem(grid, 'Nombre de personnes', stats.count);
        addStatItem(grid, 'Age le plus fréquent', calculateMode(nameData));
        
        statsContainer.appendChild(grid);
    }

    // Ajout d'un graphique de distribution
    const chartContainer = document.createElement('div');
    chartContainer.style.height = isLowHeight ? '180px' : '240px'; // Hauteur réduite pour écran bas
    chartContainer.style.marginTop = '-5px';
    chartContainer.id = cfg.chartId;
    
    statsContainer.appendChild(chartContainer);
    modal.appendChild(statsContainer);
    
    // Création d'un overlay pour l'arrière-plan
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '1050';
    overlay.onclick = () => {
        document.body.removeChild(modal);
        document.body.removeChild(overlay);
    };
    
    // Ajout au DOM
    document.body.appendChild(overlay);
    document.body.appendChild(modal);
    
    // Initialiser le graphique avec D3.js
    setTimeout(() => {
        initializeDistributionChart(histogramData, chartContainer);
    }, 100);
}

/**
 * Vérifie si les statistiques existent, sinon les calcule
 * @param {Object} nameData - Les données à vérifier
 * @returns {Object} - Les données avec statistiques
 */
export function ensureStatsExist(nameData) {
    if (!nameData || !nameData.stats) {
        const ages = nameData
            .filter(d => !isNaN(parseInt(d.text)))
            .map(d => ({
                age: parseInt(d.text),
                count: d.size
            }));
                
        if (ages.length > 0) {
            const totalCount = ages.reduce((sum, item) => sum + item.count, 0);
            const minAge = Math.min(...ages.map(d => d.age));
            const maxAge = Math.max(...ages.map(d => d.age));
            
            nameData.stats = {
                average: nameData.averageLifespan || 0,
                count: totalCount,
                min: minAge,
                max: maxAge
            };
        }
    }
    
    return nameData;
}


// Étendre la configuration pour inclure tous les types
const statsConfig = {
    'duree_vie': {
        labelId: 'average-age-label',
        buttonId: 'average-age-stats-button',
        buttonClass: 'average-age-stats-button',
        containerClass: 'average-container',
        title: 'Durée de vie moyenne',
        modalTitle: 'Stats durée de vie',
        labelText: 'Durée de vie moyenne',
        modalStatsPrefix: 'Durée de vie ',
        chartId: 'average-age-chart-container',
        type: 'age'
    },
    'age_procreation': {
        labelId: 'procreation-age-label',
        buttonId: 'procreation-age-stats-button',
        buttonClass: 'procreation-age-stats-button',
        containerClass: 'procreation-average-container',
        title: 'Âge moyen de procréation',
        modalTitle: 'Stats âge de procréation',
        labelText: 'Âge moyen de procréation',
        modalStatsPrefix: 'Âge de procréation ',
        chartId: 'procreation-age-chart-container',
        type: 'age'
    },
    'prenoms': {
        labelId: 'firstname-frequency-label',
        buttonId: 'firstname-frequency-button',
        buttonClass: 'firstname-frequency-button',
        containerClass: 'firstname-frequency-container',
        title: 'Prénom le plus fréquent',
        modalTitle: 'Stats des prénoms',
        labelText: 'Prénom le plus fréquent',
        type: 'frequency'
    },
    'noms': {
        labelId: 'lastname-frequency-label',
        buttonId: 'lastname-frequency-button',
        buttonClass: 'lastname-frequency-button',
        containerClass: 'lastname-frequency-container',
        title: 'Nom le plus fréquent',
        modalTitle: 'Stats des noms',
        labelText: 'Nom le plus fréquent',
        type: 'frequency'
    },
    'professions': {
        labelId: 'profession-frequency-label',
        buttonId: 'profession-frequency-button',
        buttonClass: 'profession-frequency-button',
        containerClass: 'profession-frequency-container',
        title: 'Métier le plus fréquent',
        modalTitle: 'Stats des métiers',
        labelText: 'Métier le plus fréquent',
        type: 'frequency'
    },
    'lieux': {
        labelId: 'location-frequency-label',
        buttonId: 'location-frequency-button',
        buttonClass: 'location-frequency-button',
        containerClass: 'location-frequency-container',
        title: 'Lieu le plus fréquent',
        modalTitle: 'Stats des lieux',
        labelText: 'Lieu le plus fréquent',
        type: 'frequency'
    }
};

// Variables globales pour stocker les positions
const statsPositionsMap = {
    'duree_vie': {
        x: 0,
        y: 0,
        width: 140,
        height: 60
    },
    'age_procreation': {
        x: 0,
        y: 0,
        width: 140,
        height: 60
    },
    'prenoms': {
        x: 0,
        y: 0,
        width: 140,
        height: 60
    },
    'noms': {
        x: 0,
        y: 0,
        width: 140,
        height: 60
    },
    'professions': {
        x: 0,
        y: 0,
        width: 140,
        height: 60
    },
    'lieux': {
        x: 0,
        y: 0,
        width: 140,
        height: 60
    }
};

// Map des écouteurs d'événement pour le redimensionnement
const resizeListenersMap = {};

/**
 * Trouve l'élément le plus fréquent dans les données
 * @param {Array} nameData - Les données du nuage
 * @returns {Object} - L'élément le plus fréquent avec son nombre d'occurrences
 */
function findMostFrequent(nameData) {
    if (!nameData || nameData.length === 0) {
        return { text: 'N/A', size: 0 };
    }
    
    return nameData.reduce((prev, current) => {
        return (prev.size > current.size) ? prev : current;
    });
}

/**
 * Ajoute l'étiquette (moyenne d'âge ou élément le plus fréquent)
 * @param {Object} svg - L'élément SVG
 * @param {Object} textGroup - Le groupe de texte
 * @param {Object} config - La configuration
 */
export function addStatsLabel(svg, textGroup, config) {
    // Ne rien faire si le type n'est pas supporté
    if (!statsConfig[config.type]) {
        return;
    }
    
    // Récupérer la configuration pour ce type
    const cfg = statsConfig[config.type];
    
    // Supprimer l'ancienne étiquette si elle existe
    svg.selectAll(`.${cfg.containerClass}`).remove();
    
    // Variables pour le texte à afficher
    let valueText = '';
    let subtitleText = '';
    
    if (cfg.type === 'age') {
        // Pour les types d'âge (durée de vie, procréation)
        if (!nameCloudState.currentNameData || !nameCloudState.currentNameData.averageLifespan) {
            return;
        }
        
        valueText = `${parseFloat(nameCloudState.currentNameData.averageLifespan).toFixed(1)} ans`;
    } else {
        // Pour les types de fréquence (noms, prénoms, métiers, lieux)
        if (!nameCloudState.currentNameData || nameCloudState.currentNameData.length === 0) {
            return;
        }
        
        const mostFrequent = findMostFrequent(nameCloudState.currentNameData);
        valueText = mostFrequent.text;
        subtitleText = `(${mostFrequent.size} occurrences)`;
    }

    // Calculer la position
    const labelWidth = 140;
    const labelHeight = 60;
    const xPos = parseInt(svg.attr('width')) - labelWidth - 30; // 30px de marge
    const yPos = 110; // position fixe en haut

    // Stocker les coordonnées
    statsPositionsMap[config.type] = {
        x: xPos,
        y: yPos,
        width: labelWidth,
        height: labelHeight
    };
    

    // Créer un élément pour afficher l'information
    const container = svg.append('g')
        .attr('class', cfg.containerClass)
        .attr('id', cfg.labelId)
        .attr('transform', `translate(${xPos}, ${yPos})`);
        
    // Ajouter une classe pour indiquer qu'on peut déplacer l'élément
    container.style('cursor', 'move');
    
    // Fond semi-transparent
    container.append('rect')
        .attr('width', labelWidth)
        .attr('height', labelHeight)
        .attr('fill', 'rgba(255, 255, 255, 0.8)')
        .attr('rx', 5)
        .attr('stroke', '#ccc')
        .attr('stroke-width', 1);
    

    
    // Titre
    container.append('text')
        .attr('x', labelWidth / 2)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .style('font-family', 'Arial, sans-serif')
        .style('font-size', '12px')
        .text(cfg.labelText);
    
    // Valeur principale
    container.append('text')
        .attr('x', labelWidth / 2)
        .attr('y', 40)
        .attr('text-anchor', 'middle')
        .style('font-family', 'Arial, sans-serif')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .style('fill', '#e53e3e')
        .text(valueText);
    


    
    // Ajouter la fonctionnalité de glisser-déposer
    makeDraggable(container, config.type);
    


    // Sous-titre (pour les fréquences)
    if (subtitleText) {
        container.append('text')
            .attr('x', labelWidth / 2)
            .attr('y', 55)
            .attr('text-anchor', 'middle')
            .style('font-family', 'Arial, sans-serif')
            .style('font-size', '12px')
            .text(subtitleText);
    }
        
    // Repositionner le bouton si nécessaire
    setTimeout(() => forceRepositionButton(config.type), 50);
}

/**
 * Ajoute le bouton des statistiques détaillées
 * @param {HTMLElement} container - Le conteneur parent
 * @param {Object} nameData - Les données à afficher
 * @param {string} type - Le type de statistiques
 */
export function addStatsButton(container, nameData, type) {
    if (!container || !nameData) return;
    
    // Vérifier que le type est valide
    if (!statsConfig[type]) {
        console.error(`Type de statistiques invalide: ${type}`);
        return;
    }
    
    // Récupérer la configuration pour ce type
    const cfg = statsConfig[type];
    
    // Vérifier que nous avons des coordonnées valides
    const statsPositions = statsPositionsMap[type];
    if (!statsPositions || statsPositions.x === 0) {
        console.log(`Coordonnées invalides pour le bouton de ${type}, report...`);
        setTimeout(() => addStatsButton(container, nameData, type), 300);
        return;
    }
    
    // Supprimer TOUS les boutons de statistiques (pour tous les types)
    Object.values(statsConfig).forEach(config => {
        const buttons = document.getElementsByClassName(config.buttonClass);
        Array.from(buttons).forEach(button => button.remove());
    });
    
    // Supprimer tous les écouteurs d'événement de redimensionnement
    Object.entries(resizeListenersMap).forEach(([listenerType, listener]) => {
        if (listener) {
            window.removeEventListener('resize', listener);
            resizeListenersMap[listenerType] = null;
        }
    });
    
    // Créer le bouton avec un ID fixe
    const button = document.createElement('button');
    button.textContent = 'Statistiques détaillées';
    button.id = cfg.buttonId;
    button.className = cfg.buttonClass;
    button.style.position = 'absolute';
    
    // Fixer la largeur du bouton à la même que l'étiquette
    button.style.width = `${statsPositions.width}px`;
    button.style.whiteSpace = 'nowrap';
    button.style.overflow = 'hidden';
    button.style.textOverflow = 'ellipsis';
    
    // Positionner directement le bouton - via getBoundingClientRect
    positionButtonRelativeToLabel(button, type);
    
    // Styles du bouton
    button.style.padding = '6px 8px';
    button.style.height = '30px';
    button.style.backgroundColor = '#4299e1';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    button.style.fontFamily = 'Arial, sans-serif';
    button.style.fontSize = '14px';
    button.style.zIndex = '1000';
    button.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    
    // Centrer le texte
    button.style.textAlign = 'center';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    
    button.onclick = () => {
        if (cfg.type === 'age') {
            createStatsModal(nameData, type);
        } else {
            createFrequencyStatsModal(nameData, type);
        }
    };
    
    // Effets de survol
    button.onmouseover = () => {
        button.style.backgroundColor = '#3182ce';
        button.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';
    };
    
    button.onmouseout = () => {
        button.style.backgroundColor = '#4299e1';
        button.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    };
    
    container.appendChild(button);
    
    // Ajouter un écouteur d'événement pour le redimensionnement
    resizeListenersMap[type] = function() {
        setTimeout(() => forceRepositionButton(type), 100);
    };
    
    window.addEventListener('resize', resizeListenersMap[type]);
    
    return button;
}

/**
 * Positionne le bouton par rapport à l'étiquette
 * @param {HTMLElement} button - Le bouton à positionner
 * @param {string} type - Le type de statistiques
 */
function positionButtonRelativeToLabel(button, type) {
    // Récupérer la configuration pour ce type
    const cfg = statsConfig[type];
    
    // Trouver la position réelle de l'étiquette dans le DOM
    const labelContainer = document.getElementById(cfg.labelId);
    
    if (labelContainer) {
        // Obtenir la position exacte de l'étiquette
        const labelRect = labelContainer.getBoundingClientRect();
        
        // Positionner le bouton directement sous l'étiquette
        button.style.left = `${labelRect.left}px`;
        button.style.top = `${labelRect.bottom}px`;
        button.style.width = `${labelRect.width}px`;
    } else {
        // Fallback à l'ancienne méthode si l'élément n'est pas trouvé
        const statsPositions = statsPositionsMap[type];
        const buttonX = statsPositions.x;
        const buttonY = statsPositions.y + statsPositions.height + 10;
        
        button.style.left = `${buttonX}px`;
        button.style.top = `${buttonY}px`;
    }
}

// /**
//  * Force le repositionnement du bouton
//  * @param {string} type - Le type de statistiques
//  */
// function forceRepositionButton(type) {
//     const cfg = statsConfig[type];
//     const button = document.getElementById(cfg.buttonId);
//     if (button) {
//         positionButtonRelativeToLabel(button, type);
//     }
// }

/**
 * Crée un modal avec les statistiques de fréquence (nom, prénom, métier, lieu)
 * @param {Array} nameData - Les données du nuage
 * @param {string} type - Le type de statistiques
 */
function createFrequencyStatsModal(nameData, type) {
    if (!nameData || nameData.length === 0) return;
    
    // Récupérer la configuration pour ce type
    const cfg = statsConfig[type];
    
    // Trier les données par fréquence décroissante (elles sont déjà triées, mais par précaution)
    const sortedData = [...nameData].sort((a, b) => b.size - a.size);
    
    // Création du modal
    const modal = document.createElement('div');
    modal.className = `${cfg.buttonClass}-modal`;
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.backgroundColor = 'white';
    modal.style.padding = '20px';
    modal.style.borderRadius = '8px';
    modal.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
    modal.style.zIndex = '1100';
    modal.style.maxWidth = '600px';
    modal.style.width = '90%';
    modal.style.maxHeight = '80vh';
    modal.style.overflow = 'auto';
    
    // En-tête du modal
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '15px';
    header.style.borderBottom = '1px solid #eee';
    header.style.paddingBottom = '10px';
    
    const title = document.createElement('h2');
    // Ajouter l'intervalle de temps au titre
    if (nameCloudState.currentConfig && nameCloudState.currentConfig.startDate && nameCloudState.currentConfig.endDate) {
        title.textContent = `${cfg.modalTitle} entre ${nameCloudState.currentConfig.startDate} et ${nameCloudState.currentConfig.endDate}`;
    } else {
        title.textContent = cfg.title;
    }
    title.style.margin = '0';
    title.style.fontSize = '16px';
    
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '24px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.padding = '0 5px';
    closeButton.onclick = () => {
        document.body.removeChild(modal);
        document.body.removeChild(overlay);
    };
    
    header.appendChild(title);
    header.appendChild(closeButton);
    modal.appendChild(header);
    
    // Créer une liste pour les occurrences
    const list = document.createElement('div');
    list.style.maxHeight = '60vh';
    list.style.overflow = 'auto';
    list.style.border = '1px solid #eee';
    list.style.borderRadius = '4px';
    list.style.padding = '5px';
    
    // Ajouter chaque élément à la liste
    sortedData.forEach((item, index) => {
        const itemContainer = document.createElement('div');
        itemContainer.style.display = 'flex';
        itemContainer.style.justifyContent = 'space-between';
        itemContainer.style.alignItems = 'center';
        itemContainer.style.padding = '8px 10px';
        itemContainer.style.borderBottom = index < sortedData.length - 1 ? '1px solid #eee' : 'none';
        itemContainer.style.cursor = 'pointer';
        
        // Définir des styles alternatifs pour les lignes
        if (index % 2 === 0) {
            itemContainer.style.backgroundColor = '#f9f9f9';
        }
        
        // Appliquer un style spécial pour le premier élément (le plus fréquent)
        if (index === 0) {
            itemContainer.style.backgroundColor = '#EBF8FF';
            itemContainer.style.fontWeight = 'bold';
        }
        
        // Texte de l'élément
        const itemText = document.createElement('div');
        itemText.textContent = item.text;
        itemText.style.flex = '1';
        
        // Nombre d'occurrences
        const itemCount = document.createElement('div');
        itemCount.textContent = item.size;
        itemCount.style.marginLeft = '10px';
        itemCount.style.fontWeight = 'bold';
        itemCount.style.color = '#3182ce';
        
        itemContainer.appendChild(itemText);
        itemContainer.appendChild(itemCount);
        
        // Ajouter un effet de survol
        itemContainer.onmouseover = () => {
            itemContainer.style.backgroundColor = index === 0 ? '#E1F0FF' : '#f0f0f0';
        };
        
        itemContainer.onmouseout = () => {
            itemContainer.style.backgroundColor = index === 0 ? '#EBF8FF' : (index % 2 === 0 ? '#f9f9f9' : 'white');
        };
        
        // Ajouter un gestionnaire de clic pour afficher les personnes
        itemContainer.onclick = () => {
            document.body.removeChild(modal);
            document.body.removeChild(overlay);
            
            // Trouver les personnes ayant ce nom/prénom/métier/lieu
            const currentConfig = nameCloudState.currentConfig || { type };
            showPersonsList(item.text, findPeopleWithName(item.text, currentConfig), currentConfig);
        };
        
        list.appendChild(itemContainer);
    });
    
    modal.appendChild(list);
    
    // Informations complémentaires
    const infoContainer = document.createElement('div');
    infoContainer.style.marginTop = '15px';
    infoContainer.style.fontSize = '14px';
    infoContainer.style.color = '#666';
    infoContainer.textContent = `Total: ${sortedData.length} ${getTypeLabel(type)} différents`;
    
    modal.appendChild(infoContainer);
    
    // Création d'un overlay pour l'arrière-plan
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '1050';
    overlay.onclick = () => {
        document.body.removeChild(modal);
        document.body.removeChild(overlay);
    };
    
    // Ajout au DOM
    document.body.appendChild(overlay);
    document.body.appendChild(modal);
}

/**
 * Trouve les personnes ayant un nom/prénom/métier/lieu spécifique
 * @param {string} name - Le nom à rechercher
 * @param {Object} config - La configuration
 * @returns {Array} - Liste des personnes correspondantes
 */
function findPeopleWithName(name, config) {
    if (!state.gedcomData) return [];
    
    const persons = getPersonsFromTree(config.scope, config.rootPersonId);
    
    const people = Object.values(state.gedcomData.individuals)
        .filter(p => {
            let matches = false;
            
            if (config.type === 'prenoms') {
                const firstName = p.name.split('/')[0].trim();
                matches = firstName.split(' ').some(n => 
                    n.toLowerCase() === name.toLowerCase() || 
                    n.toLowerCase().startsWith(name.toLowerCase() + ' ')
                );
            } else if (config.type === 'noms') {
                matches = (p.name.split('/')[1] && p.name.split('/')[1].toLowerCase().trim() === name.toLowerCase());
            } else if (config.type === 'professions') {
                const cleanedProfessions = cleanProfession(p.occupation);
                matches = cleanedProfessions.includes(name.toLowerCase());
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
                    return cleanedLocation === name;
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
            occupation: p.occupation || 'Non spécifiée'
        }));
    
    return people;
}

/**
 * Obtient un libellé pour le type de statistiques
 * @param {string} type - Le type de statistiques
 * @returns {string} - Le libellé correspondant
 */
function getTypeLabel(type) {
    switch (type) {
        case 'prenoms': return 'prénoms';
        case 'noms': return 'noms de famille';
        case 'professions': return 'métiers';
        case 'lieux': return 'lieux';
        default: return 'éléments';
    }
}

// Fonction principale qui remplace l'ancienne addAverageLabel
export function addStatisticsLabel(svg, textGroup, config) {
    // Vérifie si le type est supporté
    if (statsConfig[config.type]) {
        addStatsLabel(svg, textGroup, config);
    }
}




/**
 * Rend un élément SVG déplaçable avec la souris
 * @param {Object} element - L'élément SVG à rendre déplaçable
 * @param {string} type - Le type de statistiques
 */
// function makeDraggable(element, type) {
//     // Variables pour stocker la position initiale et le décalage
//     let startX, startY, offsetX, offsetY;
    
//     // Gestionnaire pour le début du déplacement
//     const dragStart = function(event) {
//         // Récupérer les coordonnées actuelles
//         const transform = d3.select(this).attr('transform');
//         const translate = /translate\(([^,]+),([^)]+)\)/.exec(transform);
        
//         if (translate) {
//             // Position actuelle de l'élément
//             const currentX = parseFloat(translate[1]);
//             const currentY = parseFloat(translate[2]);
            
//             // Position initiale de la souris
//             startX = event.sourceEvent.clientX;
//             startY = event.sourceEvent.clientY;
            
//             // Calculer le décalage
//             offsetX = currentX - startX;
//             offsetY = currentY - startY;
//         }
//     };
    
//     // Gestionnaire pour le déplacement en cours
//     const dragged = function(event) {
//         // Calculer la nouvelle position
//         const newX = event.sourceEvent.clientX + offsetX;
//         const newY = event.sourceEvent.clientY + offsetY;
        
//         // Mettre à jour la position de l'élément
//         d3.select(this).attr('transform', `translate(${newX}, ${newY})`);
        
//         // Mettre à jour les coordonnées stockées
//         statsPositionsMap[type] = {
//             ...statsPositionsMap[type],
//             x: newX,
//             y: newY
//         };
        
//         // Repositionner le bouton associé
//         setTimeout(() => forceRepositionButton(type), 10);
//     };
    
//     // Gestionnaire pour la fin du déplacement
//     const dragEnd = function(event) {
//         // Mettre à jour les coordonnées finales
//         const transform = d3.select(this).attr('transform');
//         const translate = /translate\(([^,]+),([^)]+)\)/.exec(transform);
        
//         if (translate) {
//             const finalX = parseFloat(translate[1]);
//             const finalY = parseFloat(translate[2]);
            
//             // Mettre à jour les coordonnées stockées
//             statsPositionsMap[type] = {
//                 ...statsPositionsMap[type],
//                 x: finalX,
//                 y: finalY
//             };
            
//             // Repositionner le bouton associé
//             setTimeout(() => forceRepositionButton(type), 10);
//         }
//     };
    
//     // Appliquer les gestionnaires de déplacement à l'élément
//     element.call(
//         d3.drag()
//             .on('start', dragStart)
//             .on('drag', dragged)
//             .on('end', dragEnd)
//     );
// }


function makeDraggable(element, type) {
    // Variables pour stocker la position initiale et le décalage
    let startX, startY, offsetX, offsetY;
    
    // Gestionnaire pour le début du déplacement (souris)
    const dragStart = function(event) {
        // Récupérer les coordonnées actuelles
        const transform = d3.select(this).attr('transform');
        const translate = /translate\(([^,]+),([^)]+)\)/.exec(transform);
        
        if (translate) {
            // Position actuelle de l'élément
            const currentX = parseFloat(translate[1]);
            const currentY = parseFloat(translate[2]);
            
            // Position initiale de la souris
            startX = event.sourceEvent.clientX;
            startY = event.sourceEvent.clientY;
            
            // Calculer le décalage
            offsetX = currentX - startX;
            offsetY = currentY - startY;
        }
    };
    
    // Gestionnaire pour le déplacement en cours (souris)
    const dragged = function(event) {
        // Calculer la nouvelle position
        const newX = event.sourceEvent.clientX + offsetX;
        const newY = event.sourceEvent.clientY + offsetY;
        
        // Mettre à jour la position de l'élément
        d3.select(this).attr('transform', `translate(${newX}, ${newY})`);
        
        // Mettre à jour les coordonnées stockées
        statsPositionsMap[type] = {
            ...statsPositionsMap[type],
            x: newX,
            y: newY
        };
        
        // Repositionner le bouton associé
        setTimeout(() => forceRepositionButton(type), 10);
    };
    
    // Gestionnaire pour la fin du déplacement (souris)
    const dragEnd = function(event) {
        // Mettre à jour les coordonnées finales
        const transform = d3.select(this).attr('transform');
        const translate = /translate\(([^,]+),([^)]+)\)/.exec(transform);
        
        if (translate) {
            const finalX = parseFloat(translate[1]);
            const finalY = parseFloat(translate[2]);
            
            // Mettre à jour les coordonnées stockées
            statsPositionsMap[type] = {
                ...statsPositionsMap[type],
                x: finalX,
                y: finalY
            };
            
            // Repositionner le bouton associé
            setTimeout(() => forceRepositionButton(type), 10);
        }
    };
    
    // Appliquer les gestionnaires de déplacement à l'élément (souris)
    element.call(
        d3.drag()
            .on('start', dragStart)
            .on('drag', dragged)
            .on('end', dragEnd)
    );
    
    // Ajouter la gestion des événements tactiles pour les appareils mobiles
    element.on('touchstart', function(event) {
        // Empêcher le scroll de la page
        event.preventDefault();
        
        const transform = d3.select(this).attr('transform');
        const translate = /translate\(([^,]+),([^)]+)\)/.exec(transform);
        
        if (translate && event.touches && event.touches[0]) {
            // Position actuelle de l'élément
            const currentX = parseFloat(translate[1]);
            const currentY = parseFloat(translate[2]);
            
            // Position initiale du toucher
            startX = event.touches[0].clientX;
            startY = event.touches[0].clientY;
            
            // Calculer le décalage
            offsetX = currentX - startX;
            offsetY = currentY - startY;
        }
    });
    
    element.on('touchmove', function(event) {
        // Empêcher le scroll de la page
        event.preventDefault();
        
        if (event.touches && event.touches[0]) {
            // Calculer la nouvelle position
            const newX = event.touches[0].clientX + offsetX;
            const newY = event.touches[0].clientY + offsetY;
            
            // Mettre à jour la position de l'élément
            d3.select(this).attr('transform', `translate(${newX}, ${newY})`);
            
            // Mettre à jour les coordonnées stockées
            statsPositionsMap[type] = {
                ...statsPositionsMap[type],
                x: newX,
                y: newY
            };
            
            // Repositionner le bouton associé
            setTimeout(() => forceRepositionButton(type), 10);
        }
    });
    
    element.on('touchend', function(event) {
        // Empêcher le scroll de la page
        event.preventDefault();
        
        const transform = d3.select(this).attr('transform');
        const translate = /translate\(([^,]+),([^)]+)\)/.exec(transform);
        
        if (translate) {
            const finalX = parseFloat(translate[1]);
            const finalY = parseFloat(translate[2]);
            
            // Mettre à jour les coordonnées stockées
            statsPositionsMap[type] = {
                ...statsPositionsMap[type],
                x: finalX,
                y: finalY
            };
            
            // Repositionner le bouton associé
            setTimeout(() => forceRepositionButton(type), 10);
        }
    });
}

/**
 * Force le repositionnement du bouton
 * @param {string} type - Le type de statistiques
 */
function forceRepositionButton(type) {
    const cfg = statsConfig[type];
    const button = document.getElementById(cfg.buttonId);
    
    if (!button) return;
    
    // Essayer d'abord de trouver l'élément SVG correspondant
    const labelElement = document.getElementById(cfg.labelId);
    
    if (labelElement) {
        // Obtenir la position exacte de l'étiquette via getBoundingClientRect
        const labelRect = labelElement.getBoundingClientRect();
        
        // Positionner le bouton directement sous l'étiquette
        button.style.left = `${labelRect.left}px`;
        button.style.top = `${labelRect.bottom + 2}px`; // +2px pour un petit espace
        button.style.width = `${labelRect.width}px`;
        
        // Mettre à jour les coordonnées stockées
        statsPositionsMap[type] = {
            ...statsPositionsMap[type],
            x: labelRect.left,
            y: labelRect.top,
            width: labelRect.width,
            height: labelRect.height
        };
    } else {
        // Fallback à l'ancienne méthode si l'élément n'est pas trouvé
        const statsPositions = statsPositionsMap[type];
        if (!statsPositions) return;
        
        const buttonX = statsPositions.x;
        const buttonY = statsPositions.y + statsPositions.height;
        
        button.style.left = `${buttonX}px`;
        button.style.top = `${buttonY}px`;
    }
    
    // Ajouter un log pour déboguer
    // console.log(`Bouton ${cfg.buttonId} repositionné à L:${button.style.left}, T:${button.style.top}`);
}