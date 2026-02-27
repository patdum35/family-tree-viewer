import { state } from './main.js';
import { nameCloudState } from './nameCloud.js';
// import { nameCloudState } from './main.js';
import { statsConfig, findPeopleWithName, ensureStatsExist } from './nameCloudAverageAge.js';
import { showPersonsList, adjustSplitScreenLayout } from './nameCloudInteractions.js';
import { makeModalDraggableAndResizable, makeModalInteractive } from './resizableModalUtils.js';
// import { findPersonsBy } from './searchModalUI.js';
import { getFindPersonsBy} from './main.js';
// import { displayHeatMap } from './geoHeatMapUI.js';
import { getDisplayHeatMap } from './main.js';
import { debounce, isModalVisible } from './eventHandlers.js';


/**
 * Fonction de traduction spécifique pour nameCloudStatModal.js
 */
function getStatTranslation(key) {
    const translations = {
      'fr': {
        // Titres et labels généraux
        'noDataAvailable': 'Aucune donnée disponible',
        'between': 'entre',
        'and': 'et',
        'close': '×',
        
        // Labels pour les statistiques
        'average': 'Moyenne',
        'median': 'Médiane',
        'minimum': 'Minimum',
        'maximum': 'Maximum',
        'sampleSize': 'Échantillon',
        'people': 'pers.',
        'mostFrequentAge': 'Age le plus fréquent',
        'mostFrequentChildCount': 'nb enfant le plus fréquent',
        'years': ' ans',
        'year': ' an',
        'yearsShort': 'a',
        'child': ' enf.',
        
        // Abréviations
        'male': 'H',
        'female': 'F',
        
        // Textes pour les graphiques
        'age': 'Âge',
        'count': 'Nombre',
        'men': 'Hommes',
        'women': 'Femmes',
        'avg': 'Moy',
        
        // Textes pour les fréquences
        'total': 'Total',
        'differentItems': 'différents',
        
        // Types d'éléments (singuliers et pluriels)
        'firstnamesSingular': 'prénom',
        'firstnamesPlural': 'prénoms',
        'lastnamesSingular': 'nom de famille',
        'lastnamesPlural': 'noms de famille',
        'professionsSingular': 'métier',
        'professionsPlural': 'métiers',
        'placesSingular': 'lieu',
        'placesPlural': 'lieux',
        'elementsSingular': 'élément',
        'elementsPlural': 'éléments',
        'beforeJC': 'av.JC',
        'today': "aujourd."
      },
      'en': {
        // Titres et labels généraux
        'noDataAvailable': 'No data available',
        'between': 'between',
        'and': 'and',
        'close': '×',
        
        // Labels pour les statistiques
        'average': 'Average',
        'median': 'Median',
        'minimum': 'Minimum',
        'maximum': 'Maximum',
        'sampleSize': 'Sample size',
        'people': 'people',
        'mostFrequentAge': 'Most frequent age',
        'mostFrequentChildCount': 'Most frequent child count',
        'years': ' yrs',
        'year': ' year',
        'yearsShort': 'y',
        'child': ' child.',
        
        // Abréviations
        'male': 'M',
        'female': 'F',
        
        // Textes pour les graphiques
        'age': 'Age',
        'count': 'Count',
        'men': 'Men',
        'women': 'Women',
        'avg': 'Avg',
        
        // Textes pour les fréquences
        'total': 'Total',
        'differentItems': 'different',
        
        // Types d'éléments (singuliers et pluriels)
        'firstnamesSingular': 'first name',
        'firstnamesPlural': 'first names',
        'lastnamesSingular': 'last name',
        'lastnamesPlural': 'last names',
        'professionsSingular': 'occupation',
        'professionsPlural': 'occupations',
        'placesSingular': 'place',
        'placesPlural': 'places',
        'elementsSingular': 'element',
        'elementsPlural': 'elements',
        'beforeJC': 'BC',
        'today': 'today'
      },
      'es': {
        // Titres et labels généraux
        'noDataAvailable': 'Datos no disponibles',
        'between': 'entre',
        'and': 'y',
        'close': '×',
        
        // Labels pour les statistiques
        'average': 'Promedio',
        'median': 'Mediana',
        'minimum': 'Mínimo',
        'maximum': 'Máximo',
        'sampleSize': 'Muestra',
        'people': 'pers.',
        'mostFrequentAge': 'Edad más frecuente',
        'mostFrequentChildCount': 'Número de hijos más frecuente',
        'years': ' años',
        'year': ' año',
        'yearsShort': 'a',
        'child': ' hij.',
        
        // Abréviations
        'male': 'H',
        'female': 'M',
        
        // Textes pour les graphiques
        'age': 'Edad',
        'count': 'Cantidad',
        'men': 'Hombres',
        'women': 'Mujeres',
        'avg': 'Prom',
        
        // Textes pour les fréquences
        'total': 'Total',
        'differentItems': 'diferentes',
        
        // Types d'éléments (singuliers et pluriels)
        'firstnamesSingular': 'nombre',
        'firstnamesPlural': 'nombres',
        'lastnamesSingular': 'apellido',
        'lastnamesPlural': 'apellidos',
        'professionsSingular': 'profesión',
        'professionsPlural': 'profesiones',
        'placesSingular': 'lugar',
        'placesPlural': 'lugares',
        'elementsSingular': 'elemento',
        'elementsPlural': 'elementos',
        'beforeJC': 'a.C.',
        'today': 'hoy',
      },
      'hu': {
        // Titres et labels généraux
        'noDataAvailable': 'Nincs elérhető adat',
        'between': 'között',
        'and': 'és',
        'close': '×',
        
        // Labels pour les statistiques
        'average': 'Átlag',
        'median': 'Medián',
        'minimum': 'Minimum',
        'maximum': 'Maximum',
        'sampleSize': 'Mintanagyság',
        'people': 'személy',
        'mostFrequentAge': 'Leggyakoribb életkor',
        'mostFrequentChildCount': 'Leggyakoribb gyermekszám',
        'years': ' év',
        'year': ' év',
        'yearsShort': 'é',
        'child': ' gyerm.',
        
        // Abréviations
        'male': 'F',
        'female': 'N',
        
        // Textes pour les graphiques
        'age': 'Életkor',
        'count': 'Darabszám',
        'men': 'Férfiak',
        'women': 'Nők',
        'avg': 'Átl',
        
        // Textes pour les fréquences
        'total': 'Összesen',
        'differentItems': 'különböző',
        
        // Types d'éléments (singuliers et pluriels)
        'firstnamesSingular': 'keresztnév',
        'firstnamesPlural': 'keresztnevek',
        'lastnamesSingular': 'vezetéknév',
        'lastnamesPlural': 'vezetéknevek',
        'professionsSingular': 'foglalkozás',
        'professionsPlural': 'foglalkozások',
        'placesSingular': 'hely',
        'placesPlural': 'helyek',
        'elementsSingular': 'elem',
        'elementsPlural': 'elemek',
        'beforeJC': 'ie.',
        'today': 'ma'        
      }
    };
  
    // Récupérer la langue actuelle
    const currentLang = window.CURRENT_LANGUAGE || 'fr';
    
    // Retourner la traduction ou le fallback en français
    return translations[currentLang]?.[key] || translations['fr'][key];
  }



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
    // let units = ' ans';
    let units = getStatTranslation('years'); 
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
    // let units = ' ans';
    let units = getStatTranslation('years'); 
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

function initializeDistributionChart(data, container, type) {
    // S'assurer que d3 est disponible
    if (!window.d3) {
        console.error("D3.js n'est pas chargé");
        return;
    }
    
    // Vider le conteneur
    d3.select(container).html("");
    
    // Dimensions du graphique
    const margin = {top: 5, right: 0, bottom: 30, left: (type === 'nombre_enfants') ? 35 : 30};
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
        // .text("Hommes");
        .text(getStatTranslation('men'));
    
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
        // .text("Femmes");
        .text(getStatTranslation('women'));
    
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
    
    // svg.append("g")
    //     .call(d3.axisLeft(y)
    //         .ticks(5)
    //         .tickFormat(d => d < 1 ? d3.format(".1f")(d) : d3.format("d")(d))
    //     );

    // Étiquettes des axes
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 5)
        .attr("font-size", "10px")
        .text( (type==='nombre_enfants') ? getStatTranslation('child') : getStatTranslation('age') );
    
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 12)
        .attr("x", -height / 2)
        .attr("font-size", "10px")
        .text( (type==='nombre_enfants') ? getStatTranslation('people') : getStatTranslation('year'));
}

/********************************************************************************** */
/********************************************************************************** */
/**
 * Crée un modal avec les statistiques détaillées
 * @param {Object} nameData - Les données à afficher
 * @param {string} type - Le type de statistiques
 */
export function createStatsModal(nameData, type = 'duree_vie', frequencyStatsModalCounter = null ) {
    console.log("-  createStatsModal =", type)

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
  
    let modalId; 
    if (frequencyStatsModalCounter) {
        modalId = `graph-stats-modal-${frequencyStatsModalCounter}`;
    } else {
        modalId = `graph-stats-modal-${state.graphStatsModalCounter}`;
    }

    // Création du modal
    const modal = document.createElement('div');
    modal.id = modalId;
    modal.graphStatsModalCounter =  state.graphStatsModalCounter;

    state.graphStatsModalCounter++; 


    modal.className = `${cfg.buttonClass}-modal`;
    modal.style.position = 'fixed';
    modal.style.left = '50%';

    let topLocal;
    let ratioHeight;
    if (window.innerHeight < 500) {
        ratioHeight = 80;
        topLocal = 70;
    } else {
        ratioHeight = 70;
        topLocal = 105;        
    }

    modal.style.top = topLocal + 'px'; 
    modal.style.transform = 'translateX(-50%)';
    modal.style.backgroundColor = 'white';
    modal.style.padding = '0px 20px';
    modal.style.borderRadius = '8px';
    modal.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
    modal.style.zIndex = state.topZindex;

    modal.style.justifyContent = 'center';
    modal.style.alignIitems =  'flex-start';

    modal.style.maxWidth = '568px';
    modal.style.minWidth = state.minModalWidth + 'px';    
    modal.style.width = '90%';

    modal.style.maxHeight = '95vh';
    modal.style.minHeight = state.minModalHeight + 'px';
    modal.style.overflow = 'auto';
    
    modal.style.display = "flex";           // Pour que l'ascenseur s'adapte automatiquement à la hauteur de la modal quand on resize
    modal.style.flexDirection = "column";   // Pour que l'ascenseur s'adapte automatiquement à la hauteur de la modal quand on resize

    // En-tête du modal
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '15px';
    header.style.borderBottom = '1px solid #eee';
    header.style.paddingBottom = '10px';
    // Nouvelles propriétés pour rendre l'en-tête sticky
    header.style.position = 'sticky';
    header.style.top = '0';
    header.style.backgroundColor = colorPerType(type);
    header.style.zIndex = '1101';
    header.style.paddingTop = '3px';
    header.style.paddingBottom = '5px';
    header.style.width = '100%';
    header.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    // Ajuster la marge pour éviter le déplacement du contenu
    header.style.marginBottom = '5px';
    header.style.marginLeft = '-20px';  // Compenser le padding du modal
    header.style.marginRight = '-20px'; // Compenser le padding du modal
    header.style.paddingLeft = '20px';  // Restaurer le padding pour l'alignement
    header.style.paddingRight = '20px'; // Restaurer le padding pour l'alignement

    const title = document.createElement('h2');
    // Ajouter l'intervalle de temps au titre
    if (nameCloudState.currentConfig && nameCloudState.currentConfig.startDate && nameCloudState.currentConfig.endDate) {
        let startDate = nameCloudState.currentConfig.startDate
        if (nameCloudState.currentConfig.startDate === -6000) {
            startDate = getStatTranslation('beforeJC')
        }
        let endDate = nameCloudState.currentConfig.endDate
        if (nameCloudState.currentConfig.endDate === 3000) {
            endDate = getStatTranslation('today')
        }
        title.textContent = `${cfg.modalTitle} ${getStatTranslation('between')} ${startDate} ${getStatTranslation('and')} ${endDate}`;
    } else {
        title.textContent = cfg.title;
    }
    title.style.margin = '0';
    title.style.fontSize = nameCloudState.mobilePhone ? '12px' : '16px';
    
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '28px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.padding = '2 10px';
    closeButton.style.marginRight = '10px';
    closeButton.addEventListener('mouseenter', () => {
        closeButton.style.background = 'rgba(128, 128, 128, 0.5)';
        closeButton.style.borderRadius = '50%';
    });
    closeButton.addEventListener('mouseleave', () => {
        closeButton.style.background = 'none';
        closeButton.style.borderRadius = '0';
    });

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
    statsContainer.style.marginBottom = '3px';
    
    // Vérifier si nous sommes sur un écran de faible hauteur
    const isLowHeight = window.innerHeight < 400;
    // let units = 'ans'; 
    // let unitsShort = 'a';
    let units = getStatTranslation('years'); 
    let unitsShort = getStatTranslation('yearsShort');

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
        average.innerHTML = `<span style="font-size:12px">${getStatTranslation('average')}:</span> <span style="color:#3949AB;font-weight:bold">${nameData.stats.average}${units}</span> <span style="font-size:12px">(<span style="color:#4299e1;font-weight:bold">H:${nameData.maleAverageData || 'N/A'}</span> / <span style="color:#F687B3;font-weight:bold">F:${nameData.femaleAverageData || 'N/A'}</span>)</span>`;
        average.style.whiteSpace = 'nowrap';
        average.style.marginRight = '10px';

        const median = document.createElement('div');
        const maleMedian = calculateMedianBySex(nameData, 'M');
        const femaleMedian = calculateMedianBySex(nameData, 'F');

        median.innerHTML = `<span style="font-size:12px">${getStatTranslation('median')}:</span> <span style="font-weight:bold"> ${calculateMedian(nameData).replace(units, unitsShort)}</span> <span style="font-size:12px">(<span style="color:#4299e1;font-weight:bold">H:${maleMedian}</span> / <span style="color:#F687B3;font-weight:bold">F:${femaleMedian}</span>)</span>`;
        median.style.whiteSpace = 'nowrap';
        median.style.marginRight = '10px';


        
        const min = document.createElement('div');
        min.innerHTML = `<span style="font-size:12px">${getStatTranslation('minimum')}:</span> <span style="font-weight:bold">${nameData.stats.min}${unitsShort}</span>`;
        min.style.whiteSpace = 'nowrap';
        min.style.marginRight = '10px';
        
        const max = document.createElement('div');
        max.innerHTML = `<span style="font-size:12px">${getStatTranslation('maximum')}:</span> <span style="font-weight:bold">${nameData.stats.max}${unitsShort}</span>`;
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
        count.innerHTML = `<span style="font-size:12px">${getStatTranslation('sampleSize')}:</span> <span style="font-weight:bold">${nameData.stats.count} pers. </span> <span style="font-size:14px">(<span style="color:#4299e1">H:${maleCount}</span> / <span style="color:#F687B3">F:${femaleCount}</span>)</span>`;
        count.style.whiteSpace = 'nowrap';
        count.style.marginRight = '10px';


        
        const mode = document.createElement('div');
        mode.innerHTML = `<span style="font-size:12px">${getStatTranslation('mostFrequentAge')}</span> <span style="font-weight:bold"> ${calculateMode(nameData).replace(units, unitsShort)}</span>`;
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
        grid.style.gap = '4px'; // Espacement réduit
        grid.style.marginBottom = '10px';
        grid.style.fontSize = '12px';
        
        // Ajout des statistiques principales
        // addStatItem(grid, `Moyenne`, `${nameData.stats.average} ${units} <span style="font-size:12px">(<span style="color:#4299e1">H: ${nameData.maleAverageData || 'N/A'}</span> / <span style="color:#F687B3">F: ${nameData.femaleAverageData || 'N/A'}</span>)</span>`, '#3949AB');
        addStatItem(grid, `${getStatTranslation('average')}`, `${nameData.stats.average} ${units} <span style="font-size:12px">(<span style="color:#4299e1">${getStatTranslation('male')}: ${nameData.maleAverageData || 'N/A'}</span> / <span style="color:#F687B3">${getStatTranslation('female')}: ${nameData.femaleAverageData || 'N/A'}</span>)</span>`, '#3949AB');


        const maleMedian = calculateMedianBySex(nameData, 'M');
        const femaleMedian = calculateMedianBySex(nameData, 'F');

        addStatItem(grid, `${getStatTranslation('median')}`, `${calculateMedian(nameData)} <span style="font-size:12px">(<span style="color:#4299e1">${getStatTranslation('male')}: ${maleMedian}</span> / <span style="color:#F687B3">${getStatTranslation('female')}: ${femaleMedian}</span>)</span>`, '#3949AB');

        addStatItem(grid, getStatTranslation('minimum'), `${stats.min} ${units}`);
        addStatItem(grid, getStatTranslation('maximum'), `${stats.max} ${units}`);
        
        // Modification ici pour inclure les compteurs par sexe
        addStatItem(grid, getStatTranslation('sampleSize'), `${nameData.stats.count} <span style="font-size:14px">(<span style="color:#4299e1">${getStatTranslation('male')}:${maleCount}</span> / <span style="color:#F687B3">${getStatTranslation('female')}:${femaleCount}</span>)</span>`);
        
        if (nameCloudState.currentConfig.type === 'nombre_enfants') { 
            addStatItem(grid, getStatTranslation('mostFrequentChildCount'), calculateMode(nameData));
        } else { 
            addStatItem(grid, getStatTranslation('mostFrequentAge'), calculateMode(nameData));
        }
        
        statsContainer.appendChild(grid);
    }

    
    // Ajout d'un graphique de distribution
    const chartContainer = document.createElement('div');
    chartContainer.style.height = isLowHeight ? '180px' : '240px'; // Hauteur réduite pour écran bas
    // chartContainer.style.maxWidth = '550px';     
    chartContainer.style.marginTop = '-5px';
    chartContainer.style.padding = '0px 0px';
    chartContainer.style.marginLeft = '-10px';
    chartContainer.style.marginRight = '-5px';
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
    
    makeModalInteractive(modal);  
    
    window.addEventListener('resize', debounce(() => {
        if(isModalVisible(modal.id)) {
            console.log('\n\n*** debug 1 resize in createStatsModal in nameCloudStatModal for resizeModal \n\n');
            resizeModal(modal, true);
        }
    }, 150));   

    resizeModal(modal, true);

    // Initialiser le graphique avec D3.js
    setTimeout(() => {
        initializeDistributionChart(histogramData, chartContainer, type);
    }, 100);   
}



export function createLocationIcon(isfromSearch = true, index, text, newConfig, searchTerm, self, nbPeople = 1, originalName = null, currentConfig, filter_string, filter_string2, showPersonListModalIndex = null) {

    const locationIcon = document.createElement('span');
    locationIcon.className = 'location-icon';
    locationIcon.innerHTML = '🌍';
    locationIcon.style.fontSize = nameCloudState.mobilePhone ? '14px' : '16px';
    locationIcon.style.cursor = 'pointer';
    locationIcon.style.marginLeft = '5px';
    locationIcon.style.opacity = '0.7';
    locationIcon.style.borderRadius = '50%';
    locationIcon.style.padding = '2px';
    locationIcon.style.transition = 'all 0.2s ease';
    locationIcon.title = 'Afficher les lieux de cette personne sur la carte';
    
    // Si cette personne est déjà sélectionnée, mettre en évidence l'icône
    // if (lastSelectedLocationId === person.id && isIndividualMapMode) {
    if (self.lastSelectedLocationIndex === index) {
        locationIcon.style.color = '#ffffff';
        locationIcon.style.backgroundColor = '#4361ee';
        locationIcon.style.opacity = '1';
    }
    
    // Effet de survol
    locationIcon.addEventListener('mouseover', () => {
        locationIcon.style.opacity = '1';
    });
    
    locationIcon.addEventListener('mouseout', () => {
        // if (lastSelectedLocationId !== person.id || !isIndividualMapMode) {
        if (self.lastSelectedLocationIndex !== index) {
            locationIcon.style.opacity = '0.7';
        }
    });
    
    
    // Gestionnaire de clic pour l'icône de localisation
    locationIcon.addEventListener('click', async (e) => {
        e.stopPropagation(); // Empêcher la propagation au div parent
        
        // La heatmap est déjà visible, comportement habituel
        // if (self.lastSelectedLocationIndex === index) {
        if (false) {
            const heatmapWrapper = document.getElementById('namecloud-heatmap-wrapper');
            if (heatmapWrapper) {
                heatmapWrapper.remove(); // supprime du DOM
            }
            self.lastSelectedLocationIndex = null;
            // Réinitialiser le style de l'icône
            locationIcon.style.color = '';
            locationIcon.style.backgroundColor = '';
            locationIcon.style.opacity = '0.7';
        } else {
            // Afficher les lieux de cette personne
            // Attendre un peu que la carte soit complètement initialisée
            setTimeout(async () => {
                // Créer une carte avec les lieux de cette personne
                // Trouver les personnes ayant ce nom/prénom/métier/lieu
                let filter_string = text.replace(/\//g, '');   

                if (newConfig.type === 'place'  || newConfig.type === 'occupation' ) {
                    newConfig.type = 'name'
                }

                // console.log('-debug findPersonsBy filter_string=',  filter_string, 'searchTerm = ', searchTerm, ', originalName= ', originalName)
                const findPersonsBy = await getFindPersonsBy();
                const personList = findPersonsBy(filter_string, newConfig, searchTerm, originalName ); 
                if (personList.results && personList.results.length > 0) {

                    let foundPeople = null;
                    if (nbPeople === 1 && !isfromSearch) { 
                        // console.log('-debug  in createLocationIcon before findPeopleWithName with (nbPeople === 1)', filter_string, currentConfig, originalName, filter_string2)
                        foundPeople = findPeopleWithName(filter_string, currentConfig, originalName, filter_string2);
                    }

                    // console.log('-debug displayHeatMap true =', personList.results, personList.results.length, filter_string, ', firstItemInList= ', (foundPeople && foundPeople.length > 0) ?  foundPeople[0].name : null )

                    const displayHeatMap = await getDisplayHeatMap();
                    // console.log('\n\n ------debug call to displayHeatMap from createLocationIcon, showPersonListModalIndex', showPersonListModalIndex,'\n\n');
                    displayHeatMap(null, personList.results, false, newConfig, filter_string, (nbPeople === 1), (foundPeople && foundPeople.length > 0) ?  foundPeople[0].name : null, showPersonListModalIndex).then(() => {
                        let content;
                        const modal = document.getElementById('search-modal')
                        const isVisible = modal && getComputedStyle(modal).display !== 'none' && getComputedStyle(modal).visibility !== 'hidden';
                        if (isVisible) { 
                            content = modal.querySelector('.searchModal-content'); 
                        } 
                        else {                           
                            const allModals1 = document.querySelectorAll('[id^="frequency-stat-modal-"]');
                            const isVisible = (allModals1) && allModals1[allModals1.length - 1] && getComputedStyle(allModals1[allModals1.length - 1]).display !== 'none' && getComputedStyle(allModals1[allModals1.length - 1]).visibility !== 'hidden';
                            if (isVisible) { content = allModals1[allModals1.length - 1]; } 
                            else {
                                const allModals2 = document.querySelectorAll('[id^="show-person-list-modal-"]');
                                const isVisible = (allModals2) && allModals2[allModals2.length - 1] && getComputedStyle(allModals2[allModals2.length - 1]).display !== 'none' && getComputedStyle(allModals2[allModals2.length - 1]).visibility !== 'hidden';
                                if (isVisible) { content = allModals2[allModals2.length - 1]; }
                            }
                        }
                        if (content ) {
                            adjustSplitScreenLayout(content, true);
                        } 
                    });

                } 
                // else {
                //     console.log('-debug displayHeatMap false = ', personList.results , filter_string)
                // }  
                
                // Mettre à jour les variables de suivi
                self.lastSelectedLocationIndex = index;
            
                // Mettre en évidence cette icône
                locationIcon.style.color = '#ffffff';
                locationIcon.style.backgroundColor = '#4361ee';
                locationIcon.style.opacity = '1';
            }, 300);
            
            // Mettre à jour l'apparence des icônes
            document.querySelectorAll('.location-icon').forEach(icon => {
                icon.style.color = '';
                icon.style.backgroundColor = '';
                icon.style.opacity = '0.7';
            });
            
            // Mettre en évidence cette icône
            locationIcon.style.color = '#ffffff';
            locationIcon.style.backgroundColor = '#4361ee';
            locationIcon.style.opacity = '1';
        }
    });
    return locationIcon;
}



function destroyAllFrequencyStatModals() {
  const selector = '[id^="frequency-stat-modal-"]';
  const modals = Array.from(document.querySelectorAll(selector));
  modals.forEach(modal => {
    try {
      // casser l'identité et enlever les styles inline
      modal.removeAttribute('id');
      modal.removeAttribute('style');
      modal.removeAttribute('data-dynamic');

      // remplacer par un commentaire (empêche la "restauration" magique)
      const placeholder = document.createComment('frequency-stat-modal removed');
      if (modal.parentNode) modal.parentNode.replaceChild(placeholder, modal);
      else modal.remove();
    } catch (e) { /* safe */ }
  });
}


export function resizeModal(modal, isFromSearchModal = false) {
    const heatmapWrapper = document.getElementById('namecloud-heatmap-wrapper');
    const allModals1 = document.querySelectorAll('[id^="frequency-stat-modal-"]');
    const allModals2 = document.querySelectorAll('[id^="show-person-list-modal-"]');
    const allModals3 = document.querySelectorAll('[id^="graph-stats-modal-"]');
    const allModals4 = document.querySelectorAll('[id^="century-stats-modal-"]');    
    const searchModalContent = document.querySelector('[class^="searchModal-content"]');

    function countVisible(modals) {
        return modals ? Array.from(modals).filter(m => getComputedStyle(m).display !== "none").length : 0;
    }

    const allModalsLength = 
        countVisible(allModals1) +
        countVisible(allModals2) +
        countVisible(allModals3) +
        countVisible(allModals4) +
        ((searchModalContent && searchModalContent._isVisible) ? 1 : 0);


    // marge gauche actuelle en pixels
    const left = modal.offsetLeft; 
    const top = modal.offsetTop; 
    // valeur originale CSS
    const maxHeightCss = modal.style.maxHeight; // ex: "95vh" ou "90%"
 
    // convertit en pixels pour comparer
    let maxHeightPx;
    if (maxHeightCss.endsWith('vh')) {
        const vh = parseFloat(maxHeightCss);
        maxHeightPx = window.innerHeight * vh / 100;
    } else if (maxHeightCss.endsWith('%')) {
        const pct = parseFloat(maxHeightCss);
        maxHeightPx = modal.parentElement.clientHeight * pct / 100;
    } else {
        maxHeightPx = parseFloat(maxHeightCss); // déjà en px
    }

    // largeur dispo = viewport - marge gauche - petite marge de sécurité (20px)
    // largeur finale = minimum entre dispo et 600px
    const width = Math.min(window.innerWidth - 20, 600);
    const newLeft = (window.innerWidth - width)/2;

    const height= Math.min(window.innerHeight - top - 20, maxHeightPx);
    const newTop = top; //(window.innerHeight - height)/2;


    // console.log('\n -debug resizeModal modal= ', modal, ',  modal._nbElementInlist= ', modal._nbElementInlist, allModalsLength, ', width=', width, ', newLeft=', newLeft)

    if(!heatmapWrapper && allModalsLength === 1 ) {
        modal.style.width = width + 'px';
        modal.style.left = newLeft + 'px';
        // modal.style.height = height + 'px';
        // modal.style.top = newTop + 'px';

    } else {
        adjustSplitScreenLayout(modal, true);
    }

}

export function colorPerType(type) {
   const colorPerTypesValues = 
   {'prenoms': '#E6F9EC', // Vert pastel
    'noms': '#FDECF3', // Rose poudré
    'professions': '#F5EAE3', // Marron clair doux
    'lieux': '#F9E0E8', // Vieux rose pastel
    'duree_vie': '#D6F5E3', // Vert menthe
    'age_procreation': '#FFEDE5', // Orange pêche clair
    'age_first_child': '#F0E6FA', // Violet lavande
    'age_marriage': '#EDE3DC', // Taupe pastel
    'nombre_enfants': '#E8DFF5', // Violet lilas
    'spare': '#E5F3FF'}; // Bleu ciel un peu plus chaud
    return(colorPerTypesValues[type]);
}


/********************************************************************************** */
/********************************************************************************** */
export function createFrequencyStatsModal(nameData, type, newConfig, searchTerm) {

    this.name = newConfig.type + '_' + newConfig.scope + '_' + newConfig.startDate + '_' + newConfig.endDate + '_' + newConfig.rootPersonId + '_' + (searchTerm)?searchTerm:null;
    
    console.log("-call to createFrequencyStatsModal with ", type, newConfig, searchTerm, ', this=', this, this.name);
    console.log("- debug call to createFrequencyStatsModal with ");
    

    // window.lastSelectedLocationIndex = null;
    this.lastSelectedLocationIndex = null;
    const self = this; 
    
    if (!nameData || nameData.length === 0) return;
    
    // Récupérer la configuration pour ce type
    const cfg = statsConfig[type];

   
    // Trier les données par fréquence décroissante
    const sortedData = [...nameData].sort((a, b) => b.size - a.size);        
    
    if (state.frequencyStatsModalCounter === 0) { // a l'init pour être sûr de bien détruite toutes les modals de l'ancienne session après sortie avec le bouton "X"
        destroyAllFrequencyStatModals();
    }

    let modalId; 
    modalId = `frequency-stat-modal-${state.frequencyStatsModalCounter}`;
    state.frequencyStatsModalCounter++; 

    // Création du modal
    const modal = document.createElement('div');
    modal.id = modalId;
    // modal.className = 'frequency-stat-modal';
    modal.className = `${cfg.buttonClass}-modal`;

    // console.log('\n\n - debug `${cfg.buttonClass}-modal` =', `${cfg.buttonClass}-modal`)


    modal.style.position = 'fixed';
    modal.style.left = '50%';

    let topLocal;
    let ratioHeight;
    if (window.innerHeight < 500) {
        ratioHeight = 80;
        topLocal = 70;
    } else {
        ratioHeight = 70;
        topLocal = 105;        
    }

    modal.style.top = topLocal + 'px'; 
    modal.style.transform = 'translateX(-50%)';
    modal.style.backgroundColor = 'white';
    modal.style.padding = '0px 4px';
    modal.style.borderRadius = '8px';
    modal.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
    modal.style.zIndex = state.topZindex;

    modal.style.justifyContent = 'center';
    modal.style.alignIitems =  'flex-start'; 

    // modal.style.maxWidth = '90%';
    modal.style.maxWidth = '600px';
    modal.style.minWidth = state.minModalWidth + 'px';
    modal.style.width = '90%';

    modal.style.maxHeight = ratioHeight +'vh';
    modal.style.minHeight = state.minModalHeight + 'px';
    modal.style.overflow = 'auto';

    modal.style.display = "flex";           // Pour que l'ascenseur s'adapte automatiquement à la hauteur de la modal quand on resize
    modal.style.flexDirection = "column";   // Pour que l'ascenseur s'adapte automatiquement à la hauteur de la modal quand on resize
    
    // En-tête du modal
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '15px';
    header.style.borderBottom = '1px solid #eee';
    header.style.paddingBottom = '10px';
    // Nouvelles propriétés pour rendre l'en-tête sticky
    header.style.position = 'sticky';
    header.style.top = '0';
    header.style.backgroundColor = colorPerType(type); 
    header.style.zIndex = '1101';
    header.style.paddingTop = '3px';
    header.style.paddingBottom = '5px';
    header.style.width = '100%';
    header.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    // Ajuster la marge pour éviter le déplacement du contenu
    header.style.marginBottom = '2px';
    header.style.marginLeft = '-20px';  // Compenser le padding du modal
    header.style.marginRight = '-20px'; // Compenser le padding du modal
    header.style.paddingLeft = '20px';  // Restaurer le padding pour l'alignement
    header.style.paddingRight = '20px'; // Restaurer le padding pour l'alignement

    
    // Container pour titre + bouton de tri
    const titleContainer = document.createElement('div');
    titleContainer.style.display = 'flex';
    titleContainer.style.alignItems = 'center';
    titleContainer.style.gap = '5px 5px';
    titleContainer.style.marginLeft = '5px';

    const title = document.createElement('h2');
    // Ajouter l'intervalle de temps au titre
    if (nameCloudState.currentConfig && nameCloudState.currentConfig.startDate && nameCloudState.currentConfig.endDate) {
        let startDate = nameCloudState.currentConfig.startDate
        if (nameCloudState.currentConfig.startDate === -6000) {
            startDate = getStatTranslation('beforeJC')
        }
        let endDate = nameCloudState.currentConfig.endDate
        if (nameCloudState.currentConfig.endDate === 3000) {
            endDate = getStatTranslation('today')
        }
        title.textContent = `${cfg.modalTitle} ${getStatTranslation('between')} ${startDate} ${getStatTranslation('and')} ${endDate}`;

    } else {
        title.textContent = cfg.title;
    }
    title.style.margin = '0';
    title.style.fontSize = nameCloudState.mobilePhone ? '12px' : '16px';


    // Bouton de tri alphabétique
    const sortButton = document.createElement('button');
    sortButton.innerHTML = '🔤';
    sortButton.style.background = 'none';
    sortButton.style.border = '1px solid #ccc';
    sortButton.style.borderRadius = '4px';
    sortButton.style.padding = '2px 3px';
    sortButton.style.cursor = 'pointer';
    sortButton.style.fontSize = '16px';
    sortButton.style.minWidth = '32px';
    sortButton.style.minHeight = '32px';
    sortButton.title = 'Trier par ordre alphabétique';

    // Bouton d'inversion
    const reverseButton = document.createElement('button');
    reverseButton.innerHTML = '🔄';
    reverseButton.style.background = 'none';
    reverseButton.style.border = '1px solid #ccc';
    reverseButton.style.borderRadius = '4px';
    reverseButton.style.padding = '2px 3px';
    reverseButton.style.cursor = 'pointer';
    reverseButton.style.fontSize = '16px';
    reverseButton.style.minWidth = '32px';
    reverseButton.style.minHeight = '32px';
    reverseButton.title = 'Inverser l\'ordre';

    // Variables pour suivre l'état du tri
    let isAlphabeticalSort = false;
    let isReversed = false;


    const geoLocButton = document.createElement('button');
    geoLocButton.innerHTML = '🌍';
    geoLocButton.style.background = 'none';
    geoLocButton.style.border = '1px solid #ccc';
    geoLocButton.style.borderRadius = '4px';
    geoLocButton.style.padding = '2px 3px';
    geoLocButton.style.cursor = 'pointer';
    geoLocButton.style.fontSize = '16px';
    geoLocButton.style.minWidth = '32px';
    geoLocButton.style.minHeight = '32px';
    geoLocButton.title = 'geolocalisation';



    // Fonction pour mettre à jour l'affichage des boutons
    function updateButtonStyles() {
        // Bouton alphabétique
        if (isAlphabeticalSort) {
            sortButton.style.backgroundColor = '#3182ce';
            sortButton.style.color = 'white';
            sortButton.style.borderColor = '#3182ce';
            sortButton.title = 'Trier par fréquence';
        } else {
            sortButton.style.backgroundColor = 'transparent';
            sortButton.style.color = 'black';
            sortButton.style.borderColor = '#ccc';
            sortButton.title = 'Trier par ordre alphabétique';
        }
        
        // Bouton d'inversion
        if (isReversed) {
            reverseButton.style.backgroundColor = '#e53e3e';
            reverseButton.style.color = 'white';
            reverseButton.style.borderColor = '#e53e3e';
            reverseButton.title = isAlphabeticalSort ? 'Ordre alphabétique normal (A→Z)' : 'Plus fréquent en premier';
        } else {
            reverseButton.style.backgroundColor = 'transparent';
            reverseButton.style.color = 'black';
            reverseButton.style.borderColor = '#ccc';
            reverseButton.title = isAlphabeticalSort ? 'Ordre alphabétique inverse (Z→A)' : 'Moins fréquent en premier';
        }
    }

    // Fonction pour retrier et afficher
    function sortAndDisplayList() {
        let dataToSort;
        
        if (isAlphabeticalSort) {
            // Tri alphabétique
            dataToSort = [...nameData].sort((a, b) => {
                const comparison = a.text.localeCompare(b.text);
                return isReversed ? -comparison : comparison;
            });
            console.log('Tri alphabétique', isReversed ? 'inverse (Z→A)' : 'normal (A→Z)');
        } else {
            // Tri par fréquence
            dataToSort = [...nameData].sort((a, b) => {
                const comparison = b.size - a.size;
                return isReversed ? -comparison : comparison;
            });
            console.log('Tri par fréquence', isReversed ? '(moins fréquent en premier)' : '(plus fréquent en premier)');
        }
        
        console.log('Données triées:', dataToSort.slice(0, 5));
        
        // Vider et reconstruire la liste
        list.innerHTML = '';

        
        // Ajouter chaque élément à la liste

        matchedCounter = 0;
        addElementToList(dataToSort);

        
        console.log('Liste reconstruite avec', dataToSort.length, 'éléments');
    }
    
   
    function addElementToList(sortedData) {
        sortedData.forEach((item, index) => {
            let isMatched = (!searchTerm);
            if (searchTerm) {
                if (type ==='prenoms' && searchStrs && searchStrs.length > 1) {
                    isMatched = (isMatched || item.originalName.toLowerCase().includes(searchTerm.toLowerCase()) );  
                } else if (type === 'lieux' && searchStrs && searchStrs.length > 1) {
                    isMatched = (isMatched || item.text.toLowerCase().includes(searchTerm.toLowerCase()) || item.text.toLowerCase().includes(searchStrBis));
                } else {
                    isMatched = (isMatched || item.text.toLowerCase().includes(searchTerm.toLowerCase())); 
                }
            }
        
            if (isMatched) { 
                matchedCounter++; 
                const itemContainer = document.createElement('div');

                itemContainer.style.cssText = `
                    display: flex; 
                    align-items: stretch; 
                    border-bottom: ${index < sortedData.length - 1 ? '1px solid #eee' : 'none'};
                    min-height: 30px;
                `;
                
                // Définir des styles alternatifs pour les lignes
                if (index % 2 === 0) {
                    itemContainer.style.backgroundColor = '#f9f9f9';
                }
                
                // // Appliquer un style spécial pour le premier élément (le plus fréquent)
                // if (index === 0) {
                //     itemContainer.style.backgroundColor = '#EBF8FF';
                //     itemContainer.style.fontWeight = 'bold';
                // }
                
                // Zone gauche (nom + occurrence) - cliquable
                const leftZone = document.createElement('div');
                leftZone.style.cssText = `
                    flex: 1; 
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    cursor: pointer; 
                    transition: background-color 0.2s;
                    padding: 8px 0px;
                    /* padding-left: 8px; */
                   /*  padding-top: 0; */
                    height: 100%;
                    background-color: ${index % 2 === 0 ? '#f9f9f9' : 'white'};
                `;

                // Texte de l'élément
                const itemText = document.createElement('div');
                if (item.text > 1) {
                    itemText.textContent = item.text + suffix;
                } else {
                    itemText.textContent = item.text + suffix0;                
                }
                itemText.style.flex = '1';
                itemText.style.marginLeft = '5px';
                if (nameCloudState.mobilePhone) {
                    itemText.style.fontSize = '13px';
                }

                // Nombre d'occurrences
                const itemCount = document.createElement('div');
                itemCount.textContent = item.size;
                itemCount.style.marginLeft = '10px';
                itemCount.style.marginRight = '20px';
                itemCount.style.fontWeight = 'bold';
                itemCount.style.color = '#3182ce';
                itemCount.style.setProperty("text-align", "left", "important");
                if (nameCloudState.mobilePhone) {
                    itemCount.style.fontSize = '13px';
                }
                leftZone.appendChild(itemText);
                leftZone.appendChild(itemCount);


                // Zone droite (bouton) - séparée
                const rightZone = document.createElement('div');
                rightZone.style.cssText = `
                    display: flex;
                    align-items: center;
                    transition: background-color 0.2s;
                    background-color: ${index % 2 === 0 ? '#f9f9f9' : 'white'};                    
                    height: 40;
                `;

                // Gestion des survols et clics

                // Trouver les personnes ayant ce nom/prénom/métier/lieu
                const currentConfig = nameCloudState.currentConfig || { type };
                let filter_string = item.text;
                let filter_string2 = searchTerm;
                // const peopleList = findPeopleWithName(filter_string, currentConfig, item.originalName, filter_string2);
                leftZone.onclick = () => {
                    // document.body.removeChild(modal);
                    // document.body.removeChild(overlay);
                    // console.log ('debug findPeopleWithName filter_string= ', filter_string, ', originalName=', item.originalName, filter_string2, findPeopleWithName(filter_string, currentConfig, item.originalName, filter_string2),)
                    new showPersonsList(
                        item.text, 
                        findPeopleWithName(filter_string, currentConfig, item.originalName, filter_string2), 
                        currentConfig,
                    );

                };

                leftZone.addEventListener('mouseenter', () => {
                    leftZone.style.backgroundColor = index === -1 ? '#E1F0FF' : '#f0f0f0';
                });
                leftZone.addEventListener('mouseleave', () => {
                    leftZone.style.backgroundColor = index === -1 ? '#EBF8FF' : (index % 2 === 0 ? '#f9f9f9' : 'white');
                });

                rightZone.addEventListener('mouseenter', () => {
                    rightZone.style.backgroundColor = index === -1 ? '#E1F0FF' : '#f0f0f0';
                });
                rightZone.addEventListener('mouseleave', () => {
                    rightZone.style.backgroundColor = index === -1 ? '#EBF8FF' : (index % 2 === 0 ? '#f9f9f9' : 'white');
                });


                const locationIcon = createLocationIcon(false, index, item.text, newConfig, searchTerm, self, item.size, item.originalName, currentConfig, filter_string, filter_string2) ;//, (peopleList && peopleList.length > 0) ? peopleList[0]: null);
                rightZone.appendChild(locationIcon);

                itemContainer.appendChild(leftZone);
                itemContainer.appendChild(rightZone);

                itemContainer.style.cssText = 'display: flex; align-items: stretch; min-height: 30px; padding: 0;';

                list.appendChild(itemContainer);
            }
        });
    }



    // Gestionnaire du bouton alphabétique
    sortButton.onclick = () => {
        console.log('Clic bouton alphabétique');
        isAlphabeticalSort = !isAlphabeticalSort;
        updateButtonStyles();
        sortAndDisplayList();
    };

    // Gestionnaire du bouton d'inversion
    reverseButton.onclick = () => {
        console.log('Clic bouton inversion');
        isReversed = !isReversed;
        updateButtonStyles();
        sortAndDisplayList();
    };

    
    // Gestionnaire du bouton de geoLocalisation
    geoLocButton.onclick = () => {
        console.log('Clic bouton geoLocalisation showHeatmapFromStats');
        showHeatmapFromStats();
    };
    // Initialiser l'affichage des boutons
    updateButtonStyles();

    // Ajout au container
    titleContainer.appendChild(title);
    titleContainer.appendChild(sortButton);
    titleContainer.appendChild(reverseButton);
    titleContainer.appendChild(geoLocButton);


    const closeButton = document.createElement('button');
    closeButton.textContent = getStatTranslation('close');
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '28px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.padding = '2px 10px';
    closeButton.style.marginRight = '10px';
    // closeButton.style.padding = '10px 20px'; // élargit le bouton
    // closeButton.style.width = '100px';       // largeur fixe si tu veux

    // style hover via JS
    closeButton.addEventListener('mouseenter', () => {
        closeButton.style.background = 'rgba(128, 128, 128, 0.5)';
        closeButton.style.borderRadius = '50%';
    });
    closeButton.addEventListener('mouseleave', () => {
        closeButton.style.background = 'none';
        closeButton.style.borderRadius = '0';
    });

    closeButton.onclick = () => {
        document.body.removeChild(modal);
        document.body.removeChild(overlay);
    };

    header.appendChild(titleContainer);
    header.appendChild(closeButton);
    modal.appendChild(header);
    

    // Créer une liste pour les occurrences avec ascenseur personnalisé
    const list = document.createElement('div');
    list.style.maxHeight = '80vh';
    list.style.overflow = 'auto';
    list.style.fontSize = '14px';  // Taille de police réduite


    // Styles pour webkit (Chrome, Safari) POUR LE SCROLLBAR ***************************
    const style = document.createElement('style');
    style.textContent = `
        .${cfg.buttonClass}-modal div::-webkit-scrollbar {
            width: 20px !important;
        }
        .${cfg.buttonClass}-modal div::-webkit-scrollbar-track {
            background: #80f0f044; /* Couleur de fond du track  */
            border-radius: 6px;
        }
        .${cfg.buttonClass}-modal div::-webkit-scrollbar-thumb {
            background: #3182ce; /* Couleur du curseur  */
            border-radius: 6px;
            border: 2px solid #f0f0f0; /* Bordure du curseur */
            min-height: 30px;  /* Hauteur minimum du curseur  */
        }
        .${cfg.buttonClass}-modal div::-webkit-scrollbar-thumb:hover {
            background: #2c5aa0; /* Couleur au survol */
        }

        /* Bouton du haut */
        .${cfg.buttonClass}-modal div::-webkit-scrollbar-button:single-button:vertical:decrement {
            background: #3182ce;
            height: 20px;
            display: block;
            background-image: url("data:image/svg+xml;utf8,<svg fill='white' xmlns='http://www.w3.org/2000/svg' width='10' height='10'><polygon points='0,10 5,0 10,10'/></svg>");
            background-repeat: no-repeat;
            background-position: center;
            border-radius: 6px 6px 0 0;
        }

        /* Bouton du bas */
        .${cfg.buttonClass}-modal div::-webkit-scrollbar-button:single-button:vertical:increment {
            background: #3182ce;
            height: 20px;
            display: block;
            background-image: url("data:image/svg+xml;utf8,<svg fill='white' xmlns='http://www.w3.org/2000/svg' width='10' height='10'><polygon points='0,0 5,10 10,0'/></svg>");
            background-repeat: no-repeat;
            background-position: center;
            border-radius: 0 0 6px 6px;
        }
    `;
    document.head.appendChild(style);

    // FORCER l'application après le CSS tactile du resizableModalUtils.js dans la function makeModalDraggableAndResizable(modal, handle)
    // car le makeModalDraggableAndResizable rendait le scrollbar invisible
    setTimeout(() => {
        const forceStyle = document.createElement('style');
        forceStyle.textContent = `
            .${cfg.buttonClass}-modal div {
                scrollbar-width: unset !important;
            }
        `;
        document.head.appendChild(forceStyle);
    }, 0);


    list.style.border = '1px solid #eee';
    list.style.borderRadius = '4px';
    list.style.padding = '0px 0px';
    
    // Ajouter chaque élément à la liste
    let searchStrs = null;
    let searchStrBis = null;
    if (searchTerm) {
        searchStrs = searchTerm.toLowerCase().split(' ');
        searchStrBis = searchTerm.replace(' ','-').toLowerCase();
    } 


    let suffix = '';
    let suffix0 = '';
    if ( type.includes('duree') || type.includes('age') ) { 
        suffix = getStatTranslation('years');
        suffix0 = getStatTranslation('year');        
    } else if ( type.includes('nombre') ) { 
        suffix = getStatTranslation('child');
        suffix0 = getStatTranslation('child');
    }

    let matchedCounter = 0;
    addElementToList(sortedData);

    modal._nbElementInlist = matchedCounter;

    console.log('\nStatistiques détaillées pour ', title.textContent )
    
    modal.appendChild(list);
    
    // Informations complémentaires
    const infoContainer = document.createElement('div');
    infoContainer.style.marginTop = '3px';
    infoContainer.style.marginBottom = '0px';
    infoContainer.style.paddingBottom = '0px';
    infoContainer.style.fontSize = '14px';
    infoContainer.style.color = '#666';
    infoContainer.style.marginLeft = '5px';
    // infoContainer.textContent = `Total: ${sortedData.length} ${getTypeLabel(type)} différents`;
    infoContainer.textContent = `${getStatTranslation('total')}: ${matchedCounter} ${getTypeLabel(type)} ${getStatTranslation('differentItems')}`;


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


    if (sortedData.length > 0) {
        const heatmapWrapper = document.getElementById('namecloud-heatmap-wrapper');
        if (heatmapWrapper) { showHeatmapFromStats(); }        
    }


    adjustSplitScreenLayout(modal, true);

    makeModalInteractive(modal);

    window.addEventListener('resize', debounce(() => {
        if(isModalVisible(modal.id)) {
            console.log('\n\n*** debug 2 resize in createFrequencyStatsModal in nameCloudStatModal for resizeModal \n\n');
            resizeModal(modal, true);
        }
    }, 150));

    resizeModal(modal, true);
    
}

export async function showHeatmapFromStats() {
    // console.log('-debug before call to displayHeatMap from showHeatmapFromStats: nameCloudState.currentConfig =', nameCloudState.currentConfig );
    // Effectuer la recherche avec filtrage par dates
    const findPersonsBy = await getFindPersonsBy();
    const personList = findPersonsBy('', nameCloudState.currentConfig ); 
    // if (personList.results && personList.results.length > 0) {
//    console.log('-debug in to displayHeatMap from showHeatmapFromStats: nameCloudState.currentConfig =', personList.results );


    if (personList.results && personList.results.length > 0) {
        // Fermer la modale de recherche
        // closeSearchModal();
        console.log('-debug call to displayHeatMap from showHeatmapFromStats');
        const displayHeatMap = await getDisplayHeatMap();
        displayHeatMap(null, personList.results, false, null, 'Tous').then(() => {
            const allModals = document.querySelectorAll('[id^="frequency-stat-modal-"]');
            let modal;
            if (allModals) { modal = allModals[allModals.length - 1]; }
            // const modal = document.getElementById('frequency-stat-modal')
            if (modal ) {
                adjustSplitScreenLayout(modal, true);
            }
        });
    } 
}

function getTypeLabel(type, form = 'plural') {
    const typeMapping = {
        'prenoms': form === 'plural' ? 'firstnamesPlural' : 'firstnamesSingular',
        'noms': form === 'plural' ? 'lastnamesPlural' : 'lastnamesSingular',
        'professions': form === 'plural' ? 'professionsPlural' : 'professionsSingular',
        'lieux': form === 'plural' ? 'placesPlural' : 'placesSingular',
        'default': form === 'plural' ? 'elementsPlural' : 'elementsSingular'
    };
    
    const key = typeMapping[type] || typeMapping['default'];
    return getStatTranslation(key);
}