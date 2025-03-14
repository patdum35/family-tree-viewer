import { state, showToast } from './main.js';
import { nameCloudState, getPersonsFromTree } from './nameCloud.js';
import { showPersonsList } from './nameCloudInteractions.js'
import { hasDateInRange, cleanProfession, cleanLocation,  } from './nameCloudUtils.js';


export function removeAllStatsElements() {
    // Supprimer toutes les stats modals HTML
    document.querySelectorAll('.html-stats-label').forEach(element => {
        element.remove();
    });
    
    // Supprimer tous les boutons de statistiques
    Object.values(statsConfig).forEach(config => {
        const button = document.getElementById(config.buttonId);
        if (button) {
            button.remove();
        }
    });
}


function initializeDistributionChart(data, container) {
    // S'assurer que d3 est disponible
    if (!window.d3) {
        console.error("D3.js n'est pas chargé");
        return;
    }
    
    // Vider le conteneur
    d3.select(container).html("");
    
    // Dimensions du graphique
    const margin = {top: 20, right: 15, bottom: 30, left: 30};
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
    
    // Trouver l'âge min et max dans les données pour définir l'échelle
    const minAge = d3.min(data, d => d.age);
    const maxAge = d3.max(data, d => d.age);
    
    // Créer une échelle qui inclut tous les âges possibles (pas seulement ceux présents)
    // Pour garantir un espacement uniforme même avec des "trous"
    const allPossibleAges = [];
    for (let age = minAge; age <= maxAge; age++) {
        allPossibleAges.push(age);
    }
    
    // Échelle X - utiliser une échelle linéaire au lieu de scaleBand pour un espacement uniforme
    const x = d3.scaleLinear()
        .domain([minAge - 0.5, maxAge + 0.5]) // Élargir légèrement le domaine
        .range([0, width]);
    
    // Largeur de barre constante (indépendante du nombre de données)
    const barWidth = Math.min(20, width / (maxAge - minAge + 5)); // Limite la largeur max
    
    // Déterminer le maximum pour l'échelle Y
    const yMax = d3.max(data, d => Math.max(d.males || 0, d.females || 0));
    
    const y = d3.scaleLinear()
        .domain([0, yMax])
        .nice()
        .range([height, 0]);
    
    // Créer des groupes pour chaque âge présent dans les données
    const ageGroups = svg.selectAll(".age-group")
        .data(data)
        .enter().append("g")
        .attr("class", "age-group")
        .attr("transform", d => `translate(${x(d.age) - barWidth/2}, 0)`);
    
    // Barres pour les hommes (bleu)
    ageGroups.append("rect")
        .attr("class", "bar-male")
        .attr("x", 0)
        .attr("y", d => y(d.males || 0))
        .attr("width", barWidth / 2)
        .attr("height", d => height - y(d.males || 0))
        .attr("fill", "#4299e1")
        .attr("rx", 2);
    
    // Barres pour les femmes (rose)
    ageGroups.append("rect")
        .attr("class", "bar-female")
        .attr("x", barWidth / 2)
        .attr("y", d => y(d.females || 0))
        .attr("width", barWidth / 2)
        .attr("height", d => height - y(d.females || 0))
        .attr("fill", "#F687B3")
        .attr("rx", 2);
    
    // Légende
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 80}, 10)`);
    
    // Légende pour hommes
    legend.append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", "#4299e1")
        .attr("rx", 2);
    
    legend.append("text")
        .attr("x", 16)
        .attr("y", 9)
        .attr("font-size", "10px")
        .text("Hommes");
    
    // Légende pour femmes
    legend.append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", "#F687B3")
        .attr("y", 16)
        .attr("rx", 2);
    
    legend.append("text")
        .attr("x", 16)
        .attr("y", 25)
        .attr("font-size", "10px")
        .text("Femmes");
    
    // Ajouter les moyennes
    // Moyenne générale
    if (data.averageData) {
        const avgAge = parseFloat(data.averageData);
        const avgX = x(avgAge);
        
        svg.append("line")
            .attr("x1", avgX)
            .attr("x2", avgX)
            .attr("y1", height)
            .attr("y2", 0)
            .attr("stroke", "#e53e3e")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,5");
        
        svg.append("text")
            .attr("x", avgX)
            .attr("y", 10)
            .attr("text-anchor", "middle")
            .attr("font-size", "11px")
            .attr("fill", "#e53e3e")
            .text(`Moy: ${avgAge}a`);
    }
    
    // Moyenne pour les hommes
    if (data.maleAverageData) {
        const maleAvg = parseFloat(data.maleAverageData);
        const maleX = x(maleAvg);
        
        svg.append("line")
            .attr("x1", maleX)
            .attr("x2", maleX)
            .attr("y1", height)
            .attr("y2", height / 2)
            .attr("stroke", "#2b6cb0")
            .attr("stroke-width", 1.5)
            .attr("stroke-dasharray", "3,3");
        
        svg.append("text")
            .attr("x", maleX)
            .attr("y", height / 2 - 5)
            .attr("text-anchor", "middle")
            .attr("font-size", "9px")
            .attr("fill", "#2b6cb0")
            .text(`H: ${maleAvg}`);
    }
    
    // Moyenne pour les femmes
    if (data.femaleAverageData) {
        const femaleAvg = parseFloat(data.femaleAverageData);
        const femaleX = x(femaleAvg);
        
        svg.append("line")
            .attr("x1", femaleX)
            .attr("x2", femaleX)
            .attr("y1", height)
            .attr("y2", height / 2)
            .attr("stroke", "#d53f8c")
            .attr("stroke-width", 1.5)
            .attr("stroke-dasharray", "3,3");
        
        svg.append("text")
            .attr("x", femaleX)
            .attr("y", height / 2 - 20)
            .attr("text-anchor", "middle")
            .attr("font-size", "9px")
            .attr("fill", "#d53f8c")
            .text(`F: ${femaleAvg}`);
    }
    
    // Générer des étiquettes d'axe X avec un espacement adapté à la taille de l'écran et au type de données
    const tickValues = [];
    let tickStep = 5; // Espacement par défaut de 5 ans

    // Si écran petit ET type = durée de vie, utiliser un espacement de 10 ans
    if (window.innerWidth < 420 && (nameCloudState.currentConfig && nameCloudState.currentConfig.type === 'duree_vie')) {
        tickStep = 10;
    }

    // Commencer par un multiple de tickStep supérieur ou égal à minAge
    let start = Math.ceil(minAge / tickStep) * tickStep;
    // Aller jusqu'à un multiple de tickStep inférieur ou égal à maxAge
    for (let age = start; age <= maxAge; age += tickStep) {
        tickValues.push(age);
    }
    
    // Axe X avec étiquettes tous les 5 ans
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickValues(tickValues).tickFormat(d3.format('d')));
    
    // Axe Y
    svg.append("g")
        .call(d3.axisLeft(y).ticks(5));
    
    // Étiquettes des axes
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 5)
        .attr("font-size", "10px")
        .text("Âge");
    
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 12)
        .attr("x", -height / 2)
        .attr("font-size", "10px")
        .text("Nombre");
}


function addStatItem(grid, label, value, color = 'inherit') {
    const labelDiv = document.createElement('div');
    labelDiv.textContent = label + ':';
    labelDiv.style.fontWeight = 'normal';
    labelDiv.style.whiteSpace = 'nowrap';
    labelDiv.style.overflow = 'hidden';
    labelDiv.style.textOverflow = 'ellipsis';
    labelDiv.style.fontSize = '14px'; // Ajout de cette ligne pour réduire la taille du texte
    
    const valueDiv = document.createElement('div');
    valueDiv.innerHTML = value; // On garde innerHTML ici pour les valeurs qui contiennent du HTML
    valueDiv.style.fontWeight = 'bold';
    valueDiv.style.color = color;
    valueDiv.style.whiteSpace = 'nowrap';
    valueDiv.style.overflow = 'hidden';
    valueDiv.style.textOverflow = 'ellipsis';
    
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


// Fonction pour calculer la médiane par sexe
function calculateMedianBySex(nameData, sex) {
    const ages = [];
    
    // Extraire tous les âges avec leur fréquence pour le sexe spécifié
    nameData.forEach(item => {
        const age = parseInt(item.text);
        const count = sex === 'M' ? (item.males || 0) : (item.females || 0);
        
        // Ajouter l'âge 'count' fois
        for (let i = 0; i < count; i++) {
            ages.push(age);
        }
    });
    
    // Si pas de données pour ce sexe
    if (ages.length === 0) {
        return 'N/A';
    }
    
    // Trier les âges
    ages.sort((a, b) => a - b);
    
    // Calculer la médiane
    const middle = Math.floor(ages.length / 2);
    
    if (ages.length % 2 === 0) {
        // Si le nombre d'éléments est pair, la médiane est la moyenne des deux éléments du milieu
        return ((ages[middle - 1] + ages[middle]) / 2).toFixed(1);
    } else {
        // Si le nombre d'éléments est impair, la médiane est l'élément du milieu
        return ages[middle].toString();
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


function prepareHistogramData(nameData) {
    
    // Créer un tableau d'objets contenant les deux distributions
    const histogramData = [];
    
    // Parcourir les données et extraire les informations par âge et par sexe
    nameData.forEach(item => {
        const age = parseInt(item.text);
        
        if (!isNaN(age)) {
            // Vérifier si l'âge existe déjà dans l'histogramme
            let entry = histogramData.find(d => d.age === age);
            
            if (!entry) {
                entry = {
                    age: age,
                    count: 0,
                    males: 0,
                    females: 0
                };
                histogramData.push(entry);
            }
            
            // Si nous avons des compteurs séparés par sexe, les utiliser
            if (item.males !== undefined && item.females !== undefined) {
                entry.males += item.males;
                entry.females += item.females;
                entry.count = entry.males + entry.females;
            } else {
                // Sinon, distribuer le total équitablement (par défaut)
                entry.males += Math.floor(item.size / 2);
                entry.females += Math.ceil(item.size / 2);
                entry.count += item.size;
            }
        }
    });
    
    // Trier par âge
    const sortedData = histogramData.sort((a, b) => a.age - b.age);
    
    return sortedData;
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
    
    // S'assurer que les stats existent
    nameData = ensureStatsExist(nameData);

    if (!nameData.stats) {
        console.error("Impossible de calculer les statistiques");
        return;
    }

    // Préparation des données pour le graphique
    const histogramData = prepareHistogramData(nameData);
    histogramData.averageData = nameData.averageData;
    histogramData.maleAverageData = nameData.maleAverageData;
    histogramData.femaleAverageData = nameData.femaleAverageData;
    

    // Calculer le nombre total d'hommes et de femmes
    let maleCount = 0;
    let femaleCount = 0;

    nameData.forEach(item => {
        if (item.males) maleCount += item.males;
        if (item.females) femaleCount += item.females;
    });

    // Arrondir les nombres pour éviter les décimales
    maleCount = Math.round(maleCount);
    femaleCount = Math.round(femaleCount);

    // Vérifier que la somme correspond au total
    const totalCount = maleCount + femaleCount;
    if (totalCount !== nameData.stats.count && nameData.stats.count) {
        // Ajuster pour s'assurer que la somme est correcte
        const diff = nameData.stats.count - totalCount;
        if (diff !== 0) {
            // Ajouter la différence au plus grand groupe
            if (maleCount >= femaleCount) {
                maleCount += diff;
            } else {
                femaleCount += diff;
            }
        }
    }
  
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
        average.innerHTML = `<span style="font-size:12px">Moyenne:</span> <span style="color:#3949AB;font-weight:bold">${nameData.stats.average}ans</span> <span style="font-size:12px">(<span style="color:#4299e1;font-weight:bold">H:${nameData.maleAverageData || 'N/A'}</span> / <span style="color:#F687B3;font-weight:bold">F:${nameData.femaleAverageData || 'N/A'}</span>)</span>`;
        average.style.whiteSpace = 'nowrap';
        average.style.marginRight = '10px';

        const median = document.createElement('div');
        const maleMedian = calculateMedianBySex(nameData, 'M');
        const femaleMedian = calculateMedianBySex(nameData, 'F');
        median.innerHTML = `<span style="font-size:12px">Médiane:</span> <span style="font-weight:bold">${calculateMedian(nameData).replace(' ans', 'a')}</span> <span style="font-size:12px">(<span style="color:#4299e1;font-weight:bold">H:${maleMedian}</span> / <span style="color:#F687B3;font-weight:bold">F:${femaleMedian}</span>)</span>`;
        median.style.whiteSpace = 'nowrap';
        median.style.marginRight = '10px';


        
        const min = document.createElement('div');
        min.innerHTML = `<span style="font-size:12px">Min:</span> <span style="font-weight:bold">${nameData.stats.min}a</span>`;
        min.style.whiteSpace = 'nowrap';
        min.style.marginRight = '10px';
        
        const max = document.createElement('div');
        max.innerHTML = `<span style="font-size:12px">Max:</span> <span style="font-weight:bold">${nameData.stats.max}a</span>`;
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
        // Modification ici pour inclure les compteurs par sexe avec couleurs
        count.innerHTML = `<span style="font-size:12px">Échantillon:</span> <span style="font-weight:bold">${nameData.stats.count} pers. </span> <span style="font-size:14px">(<span style="color:#4299e1">H:${maleCount}</span> / <span style="color:#F687B3">F:${femaleCount}</span>)</span>`;
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
        grid.style.gridTemplateColumns = '47% 53%'; // Plus d'espace pour la colonne des valeurs
        grid.style.gap = '8px'; // Espacement réduit
        grid.style.marginBottom = '15px';
        
        // Ajout des statistiques principales
        addStatItem(grid, `Moyenne`, `${nameData.stats.average} ans <span style="font-size:12px">(<span style="color:#4299e1">H: ${nameData.maleAverageData || 'N/A'}</span> / <span style="color:#F687B3">F: ${nameData.femaleAverageData || 'N/A'}</span>)</span>`, '#3949AB');

        const maleMedian = calculateMedianBySex(nameData, 'M');
        const femaleMedian = calculateMedianBySex(nameData, 'F');
        addStatItem(grid, `Médiane`, `${calculateMedian(nameData)} <span style="font-size:12px">(<span style="color:#4299e1">H: ${maleMedian}</span> / <span style="color:#F687B3">F: ${femaleMedian}</span>)</span>`, '#3949AB');

        addStatItem(grid, 'Minimum', `${stats.min} ans`);
        addStatItem(grid, 'Maximum', `${stats.max} ans`);
        
        // Modification ici pour inclure les compteurs par sexe
        addStatItem(grid, 'Nombre de personnes', `${nameData.stats.count} <span style="font-size:14px">(<span style="color:#4299e1">H:${maleCount}</span> / <span style="color:#F687B3">F:${femaleCount}</span>)</span>`);
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
                average: nameData.averageData || 0,
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
        title: 'Âge moy. de procréation',
        modalTitle: 'Âge de procréation',
        labelText: 'Âge moy. de procréation',
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

// // Variables globales pour stocker la position de la StatsModal
let globalStatsPosition = {
    x: 0,
    y: 0,
    width: 140,
    height: 60,
    userModified: false
};

let globalResizeListener = null;

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
    let genderText = '';
    
    if (cfg.type === 'age') {
        // Pour les types d'âge (durée de vie, procréation)
        if (!nameCloudState.currentNameData || !nameCloudState.currentNameData.averageData) {
            return;
        }
        
        valueText = `${parseFloat(nameCloudState.currentNameData.averageData).toFixed(1)} ans`;

        // Ajouter les moyennes par sexe si disponibles
        if (nameCloudState.currentNameData.maleAverageData && 
            nameCloudState.currentNameData.femaleAverageData) {
            genderText = `H: ${nameCloudState.currentNameData.maleAverageData} ans / F: ${nameCloudState.currentNameData.femaleAverageData} ans`;
        }

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
    // const labelHeight = genderText ? 75 : 60; // Augmenter la hauteur si on a le texte de genre
    
    const xPos = window.innerWidth - 165;// parseInt(svg.attr('width')) - 140 - 30;
    const yPos = 85; // position fixe en haut

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
    
    // Ajouter les moyennes par sexe
    if (genderText) {
        container.append('text')
            .attr('x', labelWidth / 2)
            .attr('y', 60)
            .attr('text-anchor', 'middle')
            .style('font-family', 'Arial, sans-serif')
            .style('font-size', '12px')
            .text(genderText);
    }

    
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
    
    
    // Supprimer TOUS les boutons de statistiques (pour tous les types)
    Object.values(statsConfig).forEach(config => {
        const buttons = document.getElementsByClassName(config.buttonClass);
        Array.from(buttons).forEach(button => button.remove());
    });
    
    // Supprimer l'écouteur global de redimensionnement s'il existe
    if (globalResizeListener) {
        window.removeEventListener('resize', globalResizeListener);
        globalResizeListener = null;
    }
    
    // Créer le bouton avec un ID fixe
    const button = document.createElement('button');
    button.textContent = 'Statistiques détaillées';
    button.id = cfg.buttonId;
    button.className = cfg.buttonClass;
    button.style.position = 'absolute';
    
    // Fixer la largeur du bouton à la même que l'étiquette
    button.style.width = `${globalStatsPosition.width}px`;
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
        const buttonX = globalStatsPosition.x;
        const buttonY = globalStatsPosition.y + globalStatsPosition.height;
        
        button.style.left = `${buttonX}px`;
        button.style.top = `${buttonY}px`;
    }
}


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


export function addStatisticsLabel(svg, textGroup, config) {
    // Ne rien faire si le type n'est pas supporté
    if (!statsConfig[config.type]) {
        return;
    }
    
    // Récupérer la configuration pour ce type
    const cfg = statsConfig[config.type];
    
    // Supprimer TOUTES les étiquettes HTML existantes
    document.querySelectorAll('.html-stats-label').forEach(element => {
        element.remove();
    });
    

    // Supprimer l'ancienne étiquette SVG si elle existe
    svg.selectAll(`.${cfg.containerClass}`).remove();
    
    // Supprimer aussi l'élément HTML existant s'il existe
    const existingHTMLLabel = document.getElementById(`html-${cfg.labelId}`);
    if (existingHTMLLabel) {
        existingHTMLLabel.remove();
    }
    
    // Variables pour le texte à afficher
    let valueText = '';
    let subtitleText = '';
    let genderText = '';
    
    if (cfg.type === 'age') {
        // Pour les types d'âge
        if (!nameCloudState.currentNameData || !nameCloudState.currentNameData.averageData) {
            return;
        }
        valueText = `${parseFloat(nameCloudState.currentNameData.averageData).toFixed(1)} ans`;
        
        // Ajouter les moyennes par sexe si disponibles
        if (nameCloudState.currentNameData.maleAverageData && 
            nameCloudState.currentNameData.femaleAverageData) {
            genderText = `H: ${nameCloudState.currentNameData.maleAverageData} ans / F: ${nameCloudState.currentNameData.femaleAverageData} ans`;
        }
    } else {
        // Pour les types de fréquence
        if (!nameCloudState.currentNameData || nameCloudState.currentNameData.length === 0) {
            return;
        }
        const mostFrequent = findMostFrequent(nameCloudState.currentNameData);
        valueText = mostFrequent.text;
        subtitleText = `(${mostFrequent.size} occurrences)`;
    }

    // Position initiale ou récupérée
    let initialX, initialY;
    
    // Utiliser la position globale sauvegardée si elle existe et a été modifiée par l'utilisateur
    if (globalStatsPosition.userModified && globalStatsPosition.x !== 0) {
        initialX = globalStatsPosition.x;
        initialY = globalStatsPosition.y;
    } else {
        // Position par défaut basée sur la position du SVG
        initialX = window.innerWidth - 165; // 170px depuis le bord droit
        initialY = 85;  // 110px depuis le haut
    }

    // Créer un élément HTML pour les statistiques
    const container = document.createElement('div');
    container.id = `html-${cfg.labelId}`;
    container.className = `html-stats-label ${cfg.containerClass}`;
    container.style.position = 'absolute';
    container.style.left = `${initialX}px`;
    container.style.top = `${initialY}px`;
    container.style.width = '140px';
    container.style.height = '60px';


    container.style.padding = '5px';
    container.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    container.style.border = '1px solid #ccc';
    container.style.borderRadius = '5px';
    container.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    container.style.zIndex = '1000';
    container.style.cursor = 'move';
    container.style.fontFamily = 'Arial, sans-serif';
    
    // Ajouter le titre
    const title = document.createElement('div');
    title.textContent = cfg.labelText;
    title.style.fontSize = '12px';
    title.style.textAlign = 'center';
    title.style.marginBottom = '5px';
    container.appendChild(title);
    
    // Ajouter la valeur principale
    const value = document.createElement('div');
    value.textContent = valueText;
    value.style.fontSize = '16px';
    value.style.fontWeight = 'bold';
    value.style.color = '#e53e3e';
    value.style.textAlign = 'center';
    container.appendChild(value);

    // Ajouter les moyennes par sexe
    if (genderText) {
        const gender = document.createElement('div');
        gender.textContent = genderText;
        gender.style.fontSize = '12px';
        gender.style.textAlign = 'center';
        gender.style.marginTop = '2px';
        container.appendChild(gender);
    }

    
    // Ajouter le sous-titre si nécessaire
    if (subtitleText) {
        const subtitle = document.createElement('div');
        subtitle.textContent = subtitleText;
        subtitle.style.fontSize = '12px';
        subtitle.style.textAlign = 'center';
        subtitle.style.marginTop = '2px';
        container.appendChild(subtitle);
    }
    
    // Ajouter au document
    document.body.appendChild(container);
    
    
    // Rendre l'élément déplaçablef
    makeElementDraggable(container, config.type);
    
    // Repositionner le bouton associé
    setTimeout(() => forceRepositionButton(config.type), 50);

    // Mise à jour de globalStatsPosition pour tenir compte de la nouvelle hauteur
    // globalStatsPosition.height = genderText ? 75 : 60; 

    // Ajouter un événement de redimensionnement
    if (globalResizeListener) {
        window.removeEventListener('resize', globalResizeListener);
    }
    
    // Créer un nouvel écouteur de redimensionnement
    globalResizeListener = function() {
        // Récupérer tous les éléments HTML de statistiques
        const statsLabels = document.querySelectorAll('.html-stats-label');
        
        // Si aucun élément n'existe, ne rien faire
        if (statsLabels.length === 0) return;
        
        // Lors du redimensionnement, si la position n'a pas été modifiée manuellement,
        // repositionner selon les nouvelles dimensions
        if (!globalStatsPosition.userModified) {
            const newX = window.innerWidth - 165;// parseInt(svg.attr('width')) - 140 - 30;
            const newY = 85;
            
            // Mettre à jour la position de tous les éléments
            statsLabels.forEach(element => {
                element.style.left = `${newX}px`;
                element.style.top = `${newY}px`;
            });
            
            // Mettre à jour la position globale
            globalStatsPosition.x = newX;
            globalStatsPosition.y = newY;
            
            // Repositionner tous les boutons
            Object.keys(statsConfig).forEach(type => {
                const button = document.getElementById(statsConfig[type].buttonId);
                if (button) forceRepositionButton(type);
            });
        }
    };
    
    // Ajouter le nouvel écouteur
    window.addEventListener('resize', globalResizeListener);

    
}

// Fonction pour rendre un élément HTML déplaçable
function makeElementDraggable(element, type) {
    let isDragging = false;
    let startX, startY;
    let initialLeft, initialTop;
    
    // Gestionnaire mousedown (PC)
    element.addEventListener('mousedown', function(e) {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialLeft = parseInt(element.style.left) || 0;
        initialTop = parseInt(element.style.top) || 0;
        e.preventDefault();
    });
    
    // Gestionnaire touchstart (Mobile)
    element.addEventListener('touchstart', function(e) {
        isDragging = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        initialLeft = parseInt(element.style.left) || 0;
        initialTop = parseInt(element.style.top) || 0;
    }, { passive: true });
    
    // Gestionnaire mousemove (PC)
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        
        const newLeft = initialLeft + (e.clientX - startX);
        const newTop = initialTop + (e.clientY - startY);
        
        element.style.left = `${newLeft}px`;
        element.style.top = `${newTop}px`;
        
        // Mettre à jour la position globale
        globalStatsPosition.x = newLeft;
        globalStatsPosition.y = newTop;
        
        // Repositionner les boutons
        Object.keys(statsConfig).forEach(type => {
            const button = document.getElementById(statsConfig[type].buttonId);
            if (button) forceRepositionButton(type);
        });
    });
    
    // Gestionnaire touchmove (Mobile)
    document.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        
        e.preventDefault(); // Empêcher le scroll
        
        const newLeft = initialLeft + (e.touches[0].clientX - startX);
        const newTop = initialTop + (e.touches[0].clientY - startY);
        
        element.style.left = `${newLeft}px`;
        element.style.top = `${newTop}px`;
        
        // Mettre à jour la position globale
        globalStatsPosition.x = newLeft;
        globalStatsPosition.y = newTop;
        
        // Repositionner les boutons
        Object.keys(statsConfig).forEach(type => {
            const button = document.getElementById(statsConfig[type].buttonId);
            if (button) forceRepositionButton(type);
        });
    }, { passive: false });
    
    // Gestionnaires pour la fin du déplacement
    document.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            // Marquer comme modifié par l'utilisateur
            globalStatsPosition.userModified = true;
        }
    });
    
    document.addEventListener('touchend', function() {
        if (isDragging) {
            isDragging = false;
            // Marquer comme modifié par l'utilisateur
            globalStatsPosition.userModified = true;
        }
    });
    
    document.addEventListener('touchcancel', function() {
        isDragging = false;
    });
}

// Modifiez également forceRepositionButton pour utiliser le nouvel élément HTML
function forceRepositionButton(type) {
    const cfg = statsConfig[type];
    const button = document.getElementById(cfg.buttonId);
    
    if (!button) return;
    
    // Essayer d'abord de trouver l'élément HTML correspondant
    const labelElement = document.getElementById(`html-${cfg.labelId}`);
    
    if (labelElement) {
        // Obtenir la position exacte de l'étiquette
        const labelRect = labelElement.getBoundingClientRect();
        
        // Positionner le bouton directement sous l'étiquette
        button.style.left = `${labelRect.left}px`;
        button.style.top = `${labelRect.bottom + 2}px`; // +2px pour un petit espace
        button.style.width = `${labelRect.width}px`;
    } else {
        // Fallback si aucun élément n'est trouvé
        const buttonX = globalStatsPosition.x;
        const buttonY = globalStatsPosition.y + globalStatsPosition.height;
        
        button.style.left = `${buttonX}px`;
        button.style.top = `${buttonY}px`;
    }
}

