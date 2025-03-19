import { nameCloudState } from './nameCloud.js';
import { statsConfig, findPeopleWithName, ensureStatsExist } from './nameCloudAverageAge.js';
import { showPersonsList } from './nameCloudInteractions.js';
import { makeModalDraggableAndResizable } from './resizableModalUtils.js';

function calculateMedian(nameData) {
    const ages = [];
    
    nameData.forEach(item => {
        const age = parseInt(item.text);
        const count = item.size;
        
        for (let i = 0; i < count; i++) {
            ages.push(age);
        }
    });
    
    ages.sort((a, b) => a - b);
    
    const middle = Math.floor(ages.length / 2);
    let units = ' ans';
    if (nameCloudState.currentConfig.type === 'nombre_enfants') { units = ''; }
    
    if (ages.length % 2 === 0) {
        return ((ages[middle - 1] + ages[middle]) / 2).toFixed(1) + units;
    } else {
        return ages[middle] + units;
    }
}

function calculateMedianBySex(nameData, sex) {
    const ages = [];
    
    nameData.forEach(item => {
        const age = parseInt(item.text);
        const count = sex === 'M' ? (item.males || 0) : (item.females || 0);
        
        for (let i = 0; i < count; i++) {
            ages.push(age);
        }
    });
    
    if (ages.length === 0) {
        return 'N/A';
    }
    
    ages.sort((a, b) => a - b);
    
    const middle = Math.floor(ages.length / 2);
    
    if (ages.length % 2 === 0) {
        return ((ages[middle - 1] + ages[middle]) / 2).toFixed(1);
    } else {
        return ages[middle].toString();
    }
}

function calculateMode(nameData) {
    if (!nameData || nameData.length === 0) return 'N/A';
    
    const modeItem = nameData.reduce((prev, current) => {
        return (prev.size > current.size) ? prev : current;
    });
    let units = ' ans';
    if (nameCloudState.currentConfig.type === 'nombre_enfants') { units = ''; }
    
    return modeItem.text + units;
}

function prepareHistogramData(nameData) {
    const histogramData = [];
    
    nameData.forEach(item => {
        const age = parseInt(item.text);
        
        if (!isNaN(age)) {
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
            
            if (item.males !== undefined && item.females !== undefined) {
                entry.males += item.males;
                entry.females += item.females;
                entry.count = entry.males + entry.females;
            } else {
                entry.males += Math.floor(item.size / 2);
                entry.females += Math.ceil(item.size / 2);
                entry.count += item.size;
            }
        }
    });
    
    return histogramData.sort((a, b) => a.age - b.age);
}

function addStatItem(grid, label, value, color = 'inherit') {
    const labelDiv = document.createElement('div');
    labelDiv.textContent = label + ':';
    labelDiv.style.fontWeight = 'normal';
    labelDiv.style.whiteSpace = 'nowrap';
    labelDiv.style.overflow = 'hidden';
    labelDiv.style.textOverflow = 'ellipsis';
    labelDiv.style.fontSize = '14px';
    
    const valueDiv = document.createElement('div');
    valueDiv.innerHTML = value;
    valueDiv.style.fontWeight = 'bold';
    valueDiv.style.color = color;
    valueDiv.style.whiteSpace = 'nowrap';
    valueDiv.style.overflow = 'hidden';
    valueDiv.style.textOverflow = 'ellipsis';
    
    grid.appendChild(labelDiv);
    grid.appendChild(valueDiv);
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

/**
 * Crée un modal avec les statistiques détaillées
 * @param {Object} nameData - Les données à afficher
 * @param {string} type - Le type de statistiques
 */
export function createStatsModal(nameData, type = 'duree_vie') {
    if (!nameData || !nameData.stats) return;


    nameCloudState.statsConfig = statsConfig;
    
    // Vérifier que le type est valide
    if (!['duree_vie', 'age_procreation', 'age_marriage', 'age_first_child', 'nombre_enfants'].includes(type)) {
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
    let units = 'ans'; 
    let unitsShort = 'a';
    if (nameCloudState.currentConfig.type === 'nombre_enfants') { units = ''; unitsShort = '' }
    
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
        average.innerHTML = `<span style="font-size:12px">Moyenne:</span> <span style="color:#3949AB;font-weight:bold">${nameData.stats.average}${units}</span> <span style="font-size:12px">(<span style="color:#4299e1;font-weight:bold">H:${nameData.maleAverageData || 'N/A'}</span> / <span style="color:#F687B3;font-weight:bold">F:${nameData.femaleAverageData || 'N/A'}</span>)</span>`;
        average.style.whiteSpace = 'nowrap';
        average.style.marginRight = '10px';

        const median = document.createElement('div');
        const maleMedian = calculateMedianBySex(nameData, 'M');
        const femaleMedian = calculateMedianBySex(nameData, 'F');

        median.innerHTML = `<span style="font-size:12px">Médiane:</span> <span style="font-weight:bold">${calculateMedian(nameData).replace(units, unitsShort)}</span> <span style="font-size:12px">(<span style="color:#4299e1;font-weight:bold">H:${maleMedian}</span> / <span style="color:#F687B3;font-weight:bold">F:${femaleMedian}</span>)</span>`;
        median.style.whiteSpace = 'nowrap';
        median.style.marginRight = '10px';


        
        const min = document.createElement('div');
        min.innerHTML = `<span style="font-size:12px">Min:</span> <span style="font-weight:bold">${nameData.stats.min}${unitsShort}</span>`;
        min.style.whiteSpace = 'nowrap';
        min.style.marginRight = '10px';
        
        const max = document.createElement('div');
        max.innerHTML = `<span style="font-size:12px">Max:</span> <span style="font-weight:bold">${nameData.stats.max}${unitsShort}</span>`;
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
        mode.innerHTML = `<span style="font-size:12px">Age plus fréquent</span> <span style="font-weight:bold">${calculateMode(nameData).replace(units, unitsShort)}</span>`;
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
        addStatItem(grid, `Moyenne`, `${nameData.stats.average} ${units} <span style="font-size:12px">(<span style="color:#4299e1">H: ${nameData.maleAverageData || 'N/A'}</span> / <span style="color:#F687B3">F: ${nameData.femaleAverageData || 'N/A'}</span>)</span>`, '#3949AB');

        const maleMedian = calculateMedianBySex(nameData, 'M');
        const femaleMedian = calculateMedianBySex(nameData, 'F');
        addStatItem(grid, `Médiane`, `${calculateMedian(nameData)} <span style="font-size:12px">(<span style="color:#4299e1">H: ${maleMedian}</span> / <span style="color:#F687B3">F: ${femaleMedian}</span>)</span>`, '#3949AB');

        addStatItem(grid, 'Minimum', `${stats.min} ${units}`);
        addStatItem(grid, 'Maximum', `${stats.max} ${units}`);
        
        // Modification ici pour inclure les compteurs par sexe
        addStatItem(grid, 'Nombre de personnes', `${nameData.stats.count} <span style="font-size:14px">(<span style="color:#4299e1">H:${maleCount}</span> / <span style="color:#F687B3">F:${femaleCount}</span>)</span>`);
        if (nameCloudState.currentConfig.type === 'nombre_enfants') { 
            addStatItem(grid, 'nb enfant le plus fréquent', calculateMode(nameData));
        } else { 
            addStatItem(grid, 'Age le plus fréquent', calculateMode(nameData));
        }
        

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
    // overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    // overlay.style.zIndex = '1050';
    overlay.style.backgroundColor = 'transparent'; // Arrière-plan transparent
    overlay.style.zIndex = '1049'; // Juste sous la modale
    overlay.style.pointerEvents = 'none'; // Laisser passer les clics vers l'arrière-plan
    // overlay.onclick = () => {
    //     document.body.removeChild(modal);
    //     document.body.removeChild(overlay);
    // };
    

    // Ajouter un moyen de fermer la modale seulement avec le bouton de fermeture
    closeButton.onclick = () => {
        if (document.body.contains(modal)) document.body.removeChild(modal);
        if (document.body.contains(overlay)) document.body.removeChild(overlay);
    };



    // Ajout au DOM
    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    // Rendre la modale déplaçable et redimensionnable
    makeModalDraggableAndResizable(modal, header);
    
    
    // Initialiser le graphique avec D3.js
    setTimeout(() => {
        initializeDistributionChart(histogramData, chartContainer);
    }, 100);
}

export function createFrequencyStatsModal(nameData, type) {
    if (!nameData || nameData.length === 0) return;
    
    // Récupérer la configuration pour ce type
    const cfg = statsConfig[type];
    
    // Trier les données par fréquence décroissante
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
            showPersonsList(
                item.text, 
                findPeopleWithName(item.text, currentConfig), 
                currentConfig
            );
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
    // overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    // overlay.style.zIndex = '1050';
    overlay.style.backgroundColor = 'transparent'; // Arrière-plan transparent
    overlay.style.zIndex = '1049'; // Juste sous la modale
    overlay.style.pointerEvents = 'none'; // Laisser passer les clics vers l'arrière-plan

    // overlay.onclick = () => {
    //     document.body.removeChild(modal);
    //     document.body.removeChild(overlay);
    // };
    

    // Ajouter un moyen de fermer la modale seulement avec le bouton de fermeture
    closeButton.onclick = () => {
        if (document.body.contains(modal)) document.body.removeChild(modal);
        if (document.body.contains(overlay)) document.body.removeChild(overlay);
    };


    // Ajout au DOM
    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    // Rendre la modale déplaçable et redimensionnable
    makeModalDraggableAndResizable(modal, header);
}

// Fonction auxiliaire pour obtenir le libellé pour un type
function getTypeLabel(type, form = 'plural') {
    switch (type) {
        case 'prenoms':
            return form === 'plural' ? 'prénoms' : 'prénom';
        case 'noms':
            return form === 'plural' ? 'noms de famille' : 'nom de famille';
        case 'professions':
            return form === 'plural' ? 'métiers' : 'métier';
        case 'lieux':
            return form === 'plural' ? 'lieux' : 'lieu';
        default:
            return form === 'plural' ? 'éléments' : 'élément';
    }
}