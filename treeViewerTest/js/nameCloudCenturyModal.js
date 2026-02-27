import { state } from './main.js';
import { nameCloudState, collectCenturyData } from './nameCloud.js';
// import { nameCloudState, collectCenturyData } from './main.js';
import { statsConfig, findPeopleWithName } from './nameCloudAverageAge.js';
import { showPersonsList } from './nameCloudInteractions.js';
import { makeModalDraggableAndResizable, makeModalInteractive } from './resizableModalUtils.js';
import { resizeModal } from './nameCloudStatModal.js';
import { debounce, isModalVisible } from './eventHandlers.js';



/**
 * Fonction de traduction spécifique pour nameCloudCenturyModal.js
 * Cette fonction utilise window.CURRENT_LANGUAGE pour déterminer la langue
 */
function getCenturyTranslation(key) {
    const translations = {
      'fr': {
        // Textes généraux
        'loadingStats': 'Calcul des statistiques par siècle...',
        'noDataAvailable': 'Aucune donnée disponible pour les statistiques par siècle',
        'globalStats': 'Statistiques globales',
        'period': 'Période',
        'from': 'du',
        'to': 'au',
        'centuryStats': 'Évolution',
        'hideDetails': 'Masquer les détails',
        'clickBarForList': 'Cliquez sur une barre pour la liste complète par siècle',
        'of': 'des',
        'perCentury': 'par siècle',
        'Evolution': 'Évolution',
        
        // Textes pour les tableaux
        'century': 'Siècle',
        'count': 'Nbre',
        'avg': 'Moy.',
        'maleAvg': 'Moy. H',
        'femaleAvg': 'Moy. F',
        'total': 'TOTAL',
        
        // Textes pour les types d'éléments (singuliers et pluriels)
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
        
        // Textes pour les légendes du graphique
        'rank': 'Rang',
        'number': 'nbre',
        'percentage': '%',
        'noDataForCentury': 'Aucune donnée disponible pour ce siècle.',
        'mostFrequent': 'plus fréquent',
        '1stMostFrequent': '1er',
        '2ndMostFrequent': '2e',
        '3rdMostFrequent': '3e',
        
        // Textes pour les statistiques des personnes
        'totalOccurrences': 'Total d\'occurrences',
        'totalPersonsWithBirthDeath': 'Total de personnes ayant une date de naissance et de décés',
        'totalPersonsWithBirthChild': 'Total de personnes ayant une date de naissance et un enfant avec une date de naissance',
        'totalPersonsWithMarriage': 'Total de personnes ayant une date de mariage',
        'totalPersonsWithFirstChild': 'Total de personnes ayant une date de naissance et un 1ier enfant avec une date de naissance',
        'totalPersonsWithChildren': 'Total de personnes ayant au moins 1 enfant',
        
        // Titres des axes et légendes
        'lifespanAxisTitle': 'Durée de vie moyenne (années)',
        'procreationAgeAxisTitle': 'Âge moyen de procréation (années)',
        'marriageAgeAxisTitle': 'Âge moyen au mariage (années)',
        'firstChildAgeAxisTitle': 'Âge moyen au premier enfant (années)',
        'childrenCountAxisTitle': 'Nombre moyen d\'enfants',
        'defaultAxisTitle': 'Valeur moyenne',
        'generalAverage': 'Moyenne générale',
        'men': 'Hommes',
        'women': 'Femmes',
        'bc': 'av JC',
        'mostFrequent2': 'les plus fréquents par siècle'
      },
      'en': {
        // Textes généraux
        'loadingStats': 'Calculating statistics by century...',
        'noDataAvailable': 'No data available for statistics by century',
        'globalStats': 'Global statistics',
        'period': 'Period',
        'from': 'from',
        'to': 'to',
        'centuryStats': 'Evolution',
        'hideDetails': 'Hide details',
        'clickBarForList': 'Click on a bar for the complete list by century',
        'of': 'of',
        'perCentury': 'per century',
        'Evolution': 'Evolution',
        
        // Textes pour les tableaux
        'century': 'Century',
        'count': 'Count',
        'avg': 'Avg.',
        'maleAvg': 'Male Avg',
        'femaleAvg': 'Fem. Avg',
        'total': 'TOTAL',
        
        // Textes pour les types d'éléments (singuliers et pluriels)
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
        
        // Textes pour les légendes du graphique
        'rank': 'Rank',
        'number': 'count',
        'percentage': '%',
        'noDataForCentury': 'No data available for this century.',
        'mostFrequent': 'most frequent',
        '1stMostFrequent': '1st',
        '2ndMostFrequent': '2nd',
        '3rdMostFrequent': '3rd',
        
        // Textes pour les statistiques des personnes
        'totalOccurrences': 'Total occurrences',
        'totalPersonsWithBirthDeath': 'Total people with birth and death dates',
        'totalPersonsWithBirthChild': 'Total people with birth date and a child with birth date',
        'totalPersonsWithMarriage': 'Total people with marriage date',
        'totalPersonsWithFirstChild': 'Total people with birth date and a 1st child with birth date',
        'totalPersonsWithChildren': 'Total people with at least 1 child',
        
        // Titres des axes et légendes
        'lifespanAxisTitle': 'Average lifespan (years)',
        'procreationAgeAxisTitle': 'Average procreation age (years)',
        'marriageAgeAxisTitle': 'Average marriage age (years)',
        'firstChildAgeAxisTitle': 'Average age at first child (years)',
        'childrenCountAxisTitle': 'Average number of children',
        'defaultAxisTitle': 'Average value',
        'generalAverage': 'General average',
        'men': 'Men',
        'women': 'Women',
        'bc': 'BC',
        'mostFrequent2': 'most frequent by century'
      },
      'es': {
        // Textes généraux
        'loadingStats': 'Calculando estadísticas por siglo...',
        'noDataAvailable': 'No hay datos disponibles para estadísticas por siglo',
        'globalStats': 'Estadísticas globales',
        'period': 'Período',
        'from': 'del',
        'to': 'al',
        'centuryStats': 'Evolución',
        'hideDetails': 'Ocultar detalles',
        'clickBarForList': 'Haga clic en una barra para la lista completa por siglo',
        'of': 'de',
        'perCentury': 'por siglo',
        'Evolution': 'Evolución',
        
        // Textes pour les tableaux
        'century': 'Siglo',
        'count': 'Cant.',
        'avg': 'Prom.',
        'maleAvg': 'Prom. H',
        'femaleAvg': 'Prom. M',
        'total': 'TOTAL',
        
        // Textes pour les types d'éléments (singuliers et pluriels)
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
        
        // Textes pour les légendes du graphique
        'rank': 'Rango',
        'number': 'cant.',
        'percentage': '%',
        'noDataForCentury': 'No hay datos disponibles para este siglo.',
        'mostFrequent': 'más frecuente',
        '1stMostFrequent': '1º',
        '2ndMostFrequent': '2º',
        '3rdMostFrequent': '3º',
        
        // Textes pour les statistiques des personnes
        'totalOccurrences': 'Total de apariciones',
        'totalPersonsWithBirthDeath': 'Total de personas con fecha de nacimiento y defunción',
        'totalPersonsWithBirthChild': 'Total de personas con fecha de nacimiento y un hijo con fecha de nacimiento',
        'totalPersonsWithMarriage': 'Total de personas con fecha de matrimonio',
        'totalPersonsWithFirstChild': 'Total de personas con fecha de nacimiento y un primer hijo con fecha de nacimiento',
        'totalPersonsWithChildren': 'Total de personas con al menos 1 hijo',
        
        // Titres des axes et légendes
        'lifespanAxisTitle': 'Duración de vida media (años)',
        'procreationAgeAxisTitle': 'Edad media de procreación (años)',
        'marriageAgeAxisTitle': 'Edad media al matrimonio (años)',
        'firstChildAgeAxisTitle': 'Edad media al primer hijo (años)',
        'childrenCountAxisTitle': 'Número medio de hijos',
        'defaultAxisTitle': 'Valor medio',
        'generalAverage': 'Promedio general',
        'men': 'Hombres',
        'women': 'Mujeres',
        'bc': 'a.C.',
        'mostFrequent2': 'los más frecuentes por siglo'
      },
      'hu': {
        // Textes généraux
        'loadingStats': 'Évszázados statisztikák számítása...',
        'noDataAvailable': 'Nincs elérhető adat az évszázados statisztikákhoz',
        'globalStats': 'Globális statisztikák',
        'period': 'Időszak',
        'from': 'ettől',
        'to': 'eddig',
        'centuryStats': 'Fejlődés',
        'hideDetails': 'Részletek elrejtése',
        'clickBarForList': 'Kattintson egy sávra a teljes évszázados listához',
        'of': 'a',
        'perCentury': 'évszázadonként',
        'Evolution': 'Fejlődés',
        
        // Textes pour les tableaux
        'century': 'Évszázad',
        'count': 'Szám',
        'avg': 'Átl.',
        'maleAvg': 'Férfi átl.',
        'femaleAvg': 'Női átl.',
        'total': 'ÖSSZESEN',
        
        // Textes pour les types d'éléments (singuliers et pluriels)
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
        
        // Textes pour les légendes du graphique
        'rank': 'Rang',
        'number': 'szám',
        'percentage': '%',
        'noDataForCentury': 'Nincs elérhető adat erre az évszázadra.',
        'mostFrequent': 'leggyakoribb',
        '1stMostFrequent': '1.',
        '2ndMostFrequent': '2.',
        '3rdMostFrequent': '3.',
        
        // Textes pour les statistiques des personnes
        'totalOccurrences': 'Összes előfordulás',
        'totalPersonsWithBirthDeath': 'Összes személy születési és halálozási dátummal',
        'totalPersonsWithBirthChild': 'Összes személy születési dátummal és egy gyermek születési dátummal',
        'totalPersonsWithMarriage': 'Összes személy házassági dátummal',
        'totalPersonsWithFirstChild': 'Összes személy születési dátummal és egy első gyermek születési dátummal',
        'totalPersonsWithChildren': 'Összes személy legalább 1 gyermekkel',
        
        // Titres des axes et légendes
        'lifespanAxisTitle': 'Átlagos élettartam (év)',
        'procreationAgeAxisTitle': 'Átlagos szaporodási életkor (év)',
        'marriageAgeAxisTitle': 'Átlagos házasságkötési életkor (év)',
        'firstChildAgeAxisTitle': 'Átlagos életkor az első gyermeknél (év)',
        'childrenCountAxisTitle': 'Átlagos gyermekszám',
        'defaultAxisTitle': 'Átlagérték',
        'generalAverage': 'Általános átlag',
        'men': 'Férfiak',
        'women': 'Nők',
        'bc': 'i.e.',
        'mostFrequent2': 'leggyakoribb évszázadonként'
      }
    };
  
    // Récupérer la langue actuelle
    const currentLang = window.CURRENT_LANGUAGE || 'fr';
    
    // Retourner la traduction ou le fallback en français
    return translations[currentLang]?.[key] || translations['fr'][key];
  }



// Fonction auxiliaire pour obtenir le libellé pour un type
// function getTypeLabel(type, form = 'plural') {
//     switch (type) {
//         case 'prenoms':
//             return form === 'plural' ? 'prénoms' : 'prénom';
//         case 'noms':
//             return form === 'plural' ? 'noms de famille' : 'nom de famille';
//         case 'professions':
//             return form === 'plural' ? 'métiers' : 'métier';
//         case 'lieux':
//             return form === 'plural' ? 'lieux' : 'lieu';
//         default:
//             return form === 'plural' ? 'éléments' : 'élément';
//     }
// }

function getTypeLabel(type, form = 'plural') {
    const typeMapping = {
        'prenoms': form === 'plural' ? 'firstnamesPlural' : 'firstnamesSingular',
        'noms': form === 'plural' ? 'lastnamesPlural' : 'lastnamesSingular',
        'professions': form === 'plural' ? 'professionsPlural' : 'professionsSingular',
        'lieux': form === 'plural' ? 'placesPlural' : 'placesSingular',
        'default': form === 'plural' ? 'elementsPlural' : 'elementsSingular'
    };
    
    const key = typeMapping[type] || typeMapping['default'];
    return getCenturyTranslation(key);
}

// Fonction complète showCenturyStatsModal avec modifications pour les types non numériques
export function showCenturyStatsModal(type) {
    // Afficher un indicateur de chargement pendant le calcul
    const loadingIndicator = document.createElement('div');
    loadingIndicator.style.position = 'fixed';
    loadingIndicator.style.top = '50%';
    loadingIndicator.style.left = '50%';
    loadingIndicator.style.transform = 'translate(-50%, -50%)';
    loadingIndicator.style.backgroundColor = 'white';
    loadingIndicator.style.padding = '20px';
    loadingIndicator.style.borderRadius = '8px';
    loadingIndicator.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    loadingIndicator.style.zIndex = '9999';
    // loadingIndicator.innerHTML = '<p>Calcul des statistiques par siècle...</p><progress style="width: 100%;"></progress>';
    loadingIndicator.innerHTML = `<p>${getCenturyTranslation('loadingStats')}</p><progress style="width: 100%;"></progress>`;
    document.body.appendChild(loadingIndicator);

    // NOUVEAU: Vérifier si c'est un type numérique ou non
    const numericTypes = ['duree_vie', 'age_procreation', 'age_marriage', 'age_first_child', 'nombre_enfants'];
    const isNumericType = numericTypes.includes(type);

    // Utiliser setTimeout pour ne pas bloquer l'interface pendant le calcul
    setTimeout(() => {
        try {
            // Récupérer les statistiques par siècle

            const centuryStats = collectCenturyData(type);
            
            // Supprimer l'indicateur de chargement
            document.body.removeChild(loadingIndicator);
            
            if (!centuryStats) {
                alert('Aucune donnée disponible pour les statistiques par siècle');
                return;
            }
            
            // Récupérer la configuration pour ce type
            const cfg = statsConfig[type];
            if (!cfg) return;



            let modalId; 
            modalId = `century-stats-modal-${state.centuryStatsModalCounter}`;
            state.centuryStatsModalCounter++; 

            // Création du modal
            const modal = document.createElement('div');
            modal.id = modalId;
            modal.className = `century-stats-modal-${type}`;
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
            modal.style.padding = '0px 10px';
            modal.style.borderRadius = '8px';
            modal.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
            modal.style.zIndex = state.topZindex;
            modal.style.maxWidth = '800px';
            modal.style.minWidth = state.minModalWidth + 'px';
            // modal.style.maxWidth = '90%';
            modal.style.width = '90%';
            
            modal.style.maxHeight = ratioHeight +'vh';
            modal.style.minHeight = state.minModalHeight + 'px';
            modal.style.overflow = 'auto';

            // modal.style.display = "flex";           // Pour que l'ascenseur s'adapte automatiquement à la hauteur de la modal quand on resize
            // modal.style.flexDirection = "column";   // Pour que l'ascenseur s'adapte automatiquement à la hauteur de la modal quand on resize
            
            
            // En-tête du modal
            const header = document.createElement('div');
            header.style.display = 'flex';
            header.style.justifyContent = 'space-between';
            header.style.alignItems = 'center';
            header.style.marginTop= '0px';
            header.style.marginBottom = '5px';
            header.style.borderBottom = '1px solid #eee';
            header.style.paddingBottom = '10px';
            // Nouvelles propriétés pour rendre l'en-tête sticky
            header.style.position = 'sticky';
            header.style.top = '0';
            header.style.backgroundColor =  '#EBF8FF'; //'white';
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

            
            const title = document.createElement('h2');
            title.textContent = ` ${getCenturyTranslation('Evolution')} ${cfg.modalArticle} ${cfg.modalTitle} ${getCenturyTranslation('perCentury')}`; //  par siècle
            title.style.margin = '0 10px';
            // title.style.fontSize = '15px';
            title.style.fontSize = nameCloudState.mobilePhone ? '12px' : '15px';
            
            const closeButton = document.createElement('button');
            closeButton.textContent = '×';
            closeButton.style.background = 'none';
            closeButton.style.border = 'none';
            closeButton.style.fontSize = '24px';
            closeButton.style.cursor = 'pointer';
            closeButton.style.padding = '1 8px';
            closeButton.style.marginRight = '10px';
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
            
            header.appendChild(title);
            header.appendChild(closeButton);
            modal.appendChild(header);
            
            
            // MODIFICATION IMPORTANTE: Contenu différent selon le type
            if (isNumericType) {
                // Version originale pour les types numériques
                // Conteneur pour le graphique
                const chartContainer = document.createElement('div');
                chartContainer.style.height = '400px';
                chartContainer.style.marginBottom = '20px';
                chartContainer.style.marginLeft = '2px';
                chartContainer.id = `century-chart-${type}`;
                modal.appendChild(chartContainer);
                
                // Affichage des statistiques supplémentaires
                const statsContainer = document.createElement('div');
                statsContainer.style.display = 'grid';
                statsContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
                statsContainer.style.gap = '10px';
                statsContainer.style.marginTop = '20px';
                
                // Chercher le premier et le dernier siècle avec des données
                let firstCentury = 2100;
                let lastCentury = -600;
                let totalPersons = 0;
                
                for (const century in centuryStats) {
                    if (centuryStats[century].count > 0) {
                        const centuryNum = parseInt(century);
                        firstCentury = Math.min(firstCentury, centuryNum);
                        lastCentury = Math.max(lastCentury, centuryNum);
                        totalPersons += centuryStats[century].count;
                    }
                }
                
                // Ajout des statistiques globales
                const globalStats = document.createElement('div');
                globalStats.style.gridColumn = '1 / -1';
                globalStats.style.padding = '10px';
                globalStats.style.backgroundColor = '#f8f9fa';
                globalStats.style.borderRadius = '5px';
                globalStats.style.marginBottom = '10px';
                globalStats.style.marginTop = (window.innerHeight < 400) ? '-130px' : '-70px';

                

                let legend_person = '';
                if (type === 'prenoms') {
                } else if (type === 'noms') {
                } else if (type === 'professions') {
                } else if (type === 'lieux') {
                // } else if (type === 'duree_vie') {
                //     legend_person = 'Total de personnes ayant une date de naissance et de décés';
                // } else if (type === 'age_procreation') {
                //     legend_person = 'Total de personnes ayant une date de naissance et un enfant avec une date de naissance';
                // } else if (type === 'age_marriage') {   
                //     legend_person = 'Total de personnes ayant une date de mariage';        
                // } else if (type === 'age_first_child') {
                //     legend_person = 'Total de personnes ayant une date de naissance et un 1ier enfant avec une date de naissance';
                // } else if (type === 'nombre_enfants') {
                //     legend_person = 'Total de personnes ayant au moins 1 enfant';
                // } 
                } else if (type === 'duree_vie') {
                    legend_person = getCenturyTranslation('totalPersonsWithBirthDeath');
                } else if (type === 'age_procreation') {
                    legend_person = getCenturyTranslation('totalPersonsWithBirthChild');
                } else if (type === 'age_marriage') {   
                    legend_person = getCenturyTranslation('totalPersonsWithMarriage');        
                } else if (type === 'age_first_child') {
                    legend_person = getCenturyTranslation('totalPersonsWithFirstChild');
                } else if (type === 'nombre_enfants') {
                    legend_person = getCenturyTranslation('totalPersonsWithChildren');
                } 


        
                // globalStats.innerHTML = `
                //     <div style="font-weight: bold; margin-bottom: 5px;">Statistiques globales</div>
                //     <div>Période: ${firstCentury === 2100 ? 'N/A' : `du <span style="font-weight: bold; color: #3949AB"> ${getDisplayCentury(firstCentury)}</span> au <span style="font-weight: bold; color: #3949AB"> ${getDisplayCentury(lastCentury)}`}</span></div>
                //     <div>${legend_person}:<span style="font-weight: bold; color: #3949AB"> ${totalPersons}</span></div>
                // `;

                // globalStats.innerHTML = `
                //     <div style="font-weight: bold; margin-bottom: 5px;">${getCenturyTranslation('globalStats')}</div>
                //     <div>${getCenturyTranslation('period')}: ${firstCentury === 2100 ? 'N/A' : `${getCenturyTranslation('from')} <span style="font-weight: bold; color: #3949AB"> ${getDisplayCentury(firstCentury)}</span> ${getCenturyTranslation('to')} <span style="font-weight: bold; color: #3949AB"> ${getDisplayCentury(lastCentury)}`}</span></div>
                //     <div>${legend_person}:<span style="font-weight: bold; color: #3949AB"> ${totalPersons}</span></div>
                // `;
                // globalStats.innerHTML = `
                //     <div style="font-weight: bold; margin-bottom: 5px;">${getCenturyTranslation('globalStats')}</div>
                //     <div>${getCenturyTranslation('period')}: ${firstCentury === 2100 ? 'N/A' : `${getCenturyTranslation('from')} <span style="font-weight: bold; color: #3949AB"> ${getDisplayCentury(firstCentury)}</span> ${getCenturyTranslation('to')} <span style="font-weight: bold; color: #3949AB"> ${getDisplayCentury(lastCentury)}`}</span></div>
                //     <div>${getCenturyTranslation('totalOccurrences')}:<span style="font-weight: bold; color: #3949AB"> ${totalItems}</span></div>
                // `;

                globalStats.innerHTML = `
                    <div style="font-weight: bold; margin-bottom: 5px;">${getCenturyTranslation('globalStats')}</div>
                    <div>${getCenturyTranslation('period')}: ${firstCentury === 2100 ? 'N/A' : `${getCenturyTranslation('from')} <span style="font-weight: bold; color: #3949AB"> ${getDisplayCentury(firstCentury)}</span> ${getCenturyTranslation('to')} <span style="font-weight: bold; color: #3949AB"> ${getDisplayCentury(lastCentury)}`}</span></div>
                    <div>${legend_person}:<span style="font-weight: bold; color: #3949AB"> ${totalPersons}</span></div>
                `;
                        
                statsContainer.appendChild(globalStats);
                
                // Ajouter un tableau des valeurs moyennes par siècle
                if (firstCentury < 2100) {
                    const tableContainer = document.createElement('div');
                    tableContainer.style.gridColumn = '1 / -1';
                    tableContainer.style.overflow = 'auto';
                    // tableContainer.style.marginTop = '10px';
                    tableContainer.style.marginTop = (window.innerHeight < 400) ? '-50px' : '10px';                    
                    const table = document.createElement('table');
                    table.style.width = '100%';
                    table.style.borderCollapse = 'collapse';
                    
                    // Créer l'en-tête du tableau
                    const thead = document.createElement('thead');
                    const headerRow = document.createElement('tr');
                    
                    // const headers = ['Siècle', 'Nbre', 'Moy.', 'Moy. H', 'Moy. F'];
                    const headers = [
                        getCenturyTranslation('century'),
                        getCenturyTranslation('count'),
                        getCenturyTranslation('avg'),
                        getCenturyTranslation('maleAvg'),
                        getCenturyTranslation('femaleAvg')
                    ];
                    headers.forEach(headerText => {
                        const th = document.createElement('th');
                        th.textContent = headerText;
                        th.style.padding = '8px';
                        th.style.borderBottom = '2px solid #ddd';
                        th.style.textAlign = 'left';
                        headerRow.appendChild(th);
                    });
                    
                    thead.appendChild(headerRow);
                    table.appendChild(thead);
                    
                    // Créer le corps du tableau
                    const tbody = document.createElement('tbody');
                    
                    // Inclure tous les siècles de firstCentury à lastCentury
                    for (let century = firstCentury; century <= lastCentury; century += 100) {
                        const stats = centuryStats[century];
                        
                        const row = document.createElement('tr');
                        
                        // Appliquer des styles alternés aux lignes
                        if ((century - firstCentury) / 100 % 2 === 0) {
                            row.style.backgroundColor = '#f5f5f5';
                        }
                        
                        // Siècle
                        const centuryCell = document.createElement('td');
                        centuryCell.textContent = getDisplayCentury(century);
                        centuryCell.style.padding = '8px';
                        centuryCell.style.borderBottom = '1px solid #ddd';
                        row.appendChild(centuryCell);
                        
                        // Nombre
                        const countCell = document.createElement('td');
                        countCell.textContent = stats.count || '0';
                        countCell.style.padding = '8px';
                        countCell.style.borderBottom = '1px solid #ddd';
                        row.appendChild(countCell);
                        
                        // Moyenne générale
                        const avgCell = document.createElement('td');
                        avgCell.textContent = stats.count ? stats.average.toFixed(1) : '-';
                        avgCell.style.padding = '8px';
                        avgCell.style.borderBottom = '1px solid #ddd';
                        avgCell.style.fontWeight = stats.count ? 'bold' : 'normal';
                        row.appendChild(avgCell);
                        
                        // Moyenne hommes
                        const maleAvgCell = document.createElement('td');
                        maleAvgCell.textContent = stats.males.count ? stats.males.average.toFixed(1) : '-';
                        maleAvgCell.style.padding = '8px';
                        maleAvgCell.style.borderBottom = '1px solid #ddd';
                        maleAvgCell.style.color = stats.males.count ? '#4299e1' : '#777';
                        row.appendChild(maleAvgCell);
                        
                        // Moyenne femmes
                        const femaleAvgCell = document.createElement('td');
                        femaleAvgCell.textContent = stats.females.count ? stats.females.average.toFixed(1) : '-';
                        femaleAvgCell.style.padding = '8px';
                        femaleAvgCell.style.borderBottom = '1px solid #ddd';
                        femaleAvgCell.style.color = stats.females.count ? '#F687B3' : '#777';
                        row.appendChild(femaleAvgCell);
                        
                        tbody.appendChild(row);
                    }
                    
                    // Ajouter une ligne de total au tableau
                    const totalRow = document.createElement('tr');
                    totalRow.style.backgroundColor = '#e0f7fa'; // Couleur d'arrière-plan distinctive
                    totalRow.style.fontWeight = 'bold';
                    totalRow.style.borderTop = '2px solid #666';

                    // Calcul des totaux
                    let totalCount = 0;
                    let totalSum = 0;
                    let totalMaleCount = 0;
                    let totalMaleSum = 0;
                    let totalFemaleCount = 0;
                    let totalFemaleSum = 0;

                    for (let century = firstCentury; century <= lastCentury; century += 100) {
                        const stats = centuryStats[century];
                        if (stats) {
                            totalCount += stats.count || 0;
                            totalSum += stats.sum || 0;
                            totalMaleCount += stats.males.count || 0;
                            totalMaleSum += stats.males.sum || 0;
                            totalFemaleCount += stats.females.count || 0;
                            totalFemaleSum += stats.females.sum || 0;
                        }
                    }

                    // Calculer les moyennes globales
                    const globalAverage = totalCount > 0 ? (totalSum / totalCount).toFixed(1) : '-';
                    const globalMaleAverage = totalMaleCount > 0 ? (totalMaleSum / totalMaleCount).toFixed(1) : '-';
                    const globalFemaleAverage = totalFemaleCount > 0 ? (totalFemaleSum / totalFemaleCount).toFixed(1) : '-';

                    // Cellule pour le total
                    const totalCell = document.createElement('td');
                    totalCell.textContent = 'TOTAL';
                    totalCell.style.padding = '10px 8px';
                    totalCell.style.borderBottom = '1px solid #ddd';
                    totalCell.style.fontWeight = 'bold';
                    totalRow.appendChild(totalCell);

                    // Cellule pour le nombre total
                    const countCell = document.createElement('td');
                    countCell.textContent = totalCount;
                    countCell.style.padding = '10px 8px';
                    countCell.style.borderBottom = '1px solid #ddd';
                    countCell.style.fontWeight = 'bold';
                    totalRow.appendChild(countCell);

                    // Cellule pour la moyenne générale
                    const avgCell = document.createElement('td');
                    avgCell.textContent = globalAverage;
                    avgCell.style.padding = '10px 8px';
                    avgCell.style.borderBottom = '1px solid #ddd';
                    avgCell.style.fontWeight = 'bold';
                    avgCell.style.color = '#3949AB';
                    totalRow.appendChild(avgCell);

                    // Cellule pour la moyenne des hommes
                    const maleAvgCell = document.createElement('td');
                    maleAvgCell.textContent = globalMaleAverage;
                    maleAvgCell.style.padding = '10px 8px';
                    maleAvgCell.style.borderBottom = '1px solid #ddd';
                    maleAvgCell.style.fontWeight = 'bold';
                    maleAvgCell.style.color = '#4299e1';
                    totalRow.appendChild(maleAvgCell);

                    // Cellule pour la moyenne des femmes
                    const femaleAvgCell = document.createElement('td');
                    femaleAvgCell.textContent = globalFemaleAverage;
                    femaleAvgCell.style.padding = '10px 8px';
                    femaleAvgCell.style.borderBottom = '1px solid #ddd';
                    femaleAvgCell.style.fontWeight = 'bold';
                    femaleAvgCell.style.color = '#F687B3';
                    totalRow.appendChild(femaleAvgCell);

                    // Ajouter la ligne de total
                    tbody.appendChild(totalRow);
                    
                    table.appendChild(tbody);
                    tableContainer.appendChild(table);
                    statsContainer.appendChild(tableContainer);
                }
                
                modal.appendChild(statsContainer);
                
                // Initialiser le graphique après ajout au DOM
                setTimeout(() => {
                    initializeCenturyChart(centuryStats, firstCentury, lastCentury, chartContainer, type);
                }, 100);
            } else {
                // NOUVEAU CODE POUR LES TYPES NON NUMÉRIQUES (prénoms, noms, métiers, lieux)
                
                // Chercher le premier et le dernier siècle avec des données
                let firstCentury = 2100;
                let lastCentury = -600;
                let totalItems = 0;
                
                for (const century in centuryStats) {
                    if (centuryStats[century].count > 0) {
                        const centuryNum = parseInt(century);
                        firstCentury = Math.min(firstCentury, centuryNum);
                        lastCentury = Math.max(lastCentury, centuryNum);
                        totalItems += centuryStats[century].count;
                    }
                }
                
                // Conteneur pour le graphique
                const chartContainer = document.createElement('div');
                chartContainer.style.height = '400px';
                chartContainer.style.marginBottom = '20px';
                chartContainer.id = `century-chart-${type}`;
                modal.appendChild(chartContainer);
                
                // Explication
                const explanation = document.createElement('div');
                explanation.style.margin = '10px 0';
                explanation.style.marginLeft = '10px';
                explanation.style.marginTop = '-80px';
                explanation.style.fontSize = '14px';
                explanation.style.color = '#555';
                explanation.innerHTML = `<strong>top 3</strong> ${getCenturyTranslation('of')} ${getTypeLabel(type)} ${getCenturyTranslation('mostFrequent2')}`;
                modal.appendChild(explanation);
                
                // Ajout des statistiques globales
                const globalStats = document.createElement('div');
                globalStats.style.padding = '10px';
                globalStats.style.backgroundColor = '#f8f9fa';
                globalStats.style.borderRadius = '5px';
                globalStats.style.marginBottom = '10px';
                
                // globalStats.innerHTML = `
                //     <div style="font-weight: bold; margin-bottom: 5px;">Statistiques globales</div>
                //     <div>Période: ${firstCentury === 2100 ? 'N/A' : `du <span style="font-weight: bold; color: #3949AB"> ${getDisplayCentury(firstCentury)}</span> au <span style="font-weight: bold; color: #3949AB"> ${getDisplayCentury(lastCentury)}`}</span></div>
                //     <div>Total d'occurrences:<span style="font-weight: bold; color: #3949AB"> ${totalItems}</span></div>
                // `;
                globalStats.innerHTML = `
                    <div style="font-weight: bold; margin-bottom: 5px;">${getCenturyTranslation('globalStats')}</div>
                    <div>${getCenturyTranslation('period')}: ${firstCentury === 2100 ? 'N/A' : `${getCenturyTranslation('from')} <span style="font-weight: bold; color: #3949AB"> ${getDisplayCentury(firstCentury)}</span> ${getCenturyTranslation('to')} <span style="font-weight: bold; color: #3949AB"> ${getDisplayCentury(lastCentury)}`}</span></div>
                    <div>${getCenturyTranslation('totalOccurrences')}:<span style="font-weight: bold; color: #3949AB"> ${totalItems}</span></div>
                `;
                
                modal.appendChild(globalStats);
                
                // Conteneur pour afficher les listes détaillées
                const detailsContainer = document.createElement('div');
                detailsContainer.id = 'century-details-container';
                detailsContainer.style.marginTop = '20px';
                detailsContainer.style.display = 'none';
                detailsContainer.style.border = '1px solid #ddd';
                detailsContainer.style.borderRadius = '5px';
                detailsContainer.style.padding = '15px';
                modal.appendChild(detailsContainer);
                
                // Initialiser le graphique après ajout au DOM
                setTimeout(() => {
                    initializeNonNumericCenturyChart(centuryStats, firstCentury, lastCentury, chartContainer, detailsContainer, type);
                }, 100);
            }
          
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
                if( isModalVisible(modal.id)) {
                    console.log('\n\n*** debug resize in showCenturyStatsModal in nameCloudCentury for resizeModal \n\n');
                    resizeModal(modal, true);
                }
            }, 150)); // Attend 150ms après le dernier resize

            resizeModal(modal, true);

        } catch (error) {
            // En cas d'erreur, supprimer l'indicateur de chargement et afficher l'erreur
            if (document.body.contains(loadingIndicator)) {
                document.body.removeChild(loadingIndicator);
            }
            console.error('Erreur lors du calcul des statistiques par siècle:', error);
            alert('Une erreur est survenue lors du calcul des statistiques par siècle. Veuillez réessayer.');
        }
    }, 10); // Délai minimal pour permettre l'affichage de l'indicateur de chargement
}


function showCenturyDetails(century, stats, container, type) {

    // console.log('\n\n, showCenturyDetails(century, stats, container, type)', century, stats, container, type )

    // Vider le conteneur
    container.innerHTML = '';
    
    // Afficher le conteneur
    container.style.display = 'block';
    
    // Titre
    const title = document.createElement('h3');
    title.textContent = `${getDisplayCentury(century)} siècle - ${getTypeLabel(type)}`;
    title.style.margin = '0 0 15px 0';
    title.style.fontSize = '16px';
    title.style.borderBottom = '1px solid #ddd';
    title.style.paddingBottom = '8px';
    container.appendChild(title);
    
    // Vérifier s'il y a des données
    if (!stats || !stats.sortedFrequencies || stats.sortedFrequencies.length === 0) {
        const noData = document.createElement('p');
        noData.textContent = 'Aucune donnée disponible pour ce siècle.';
        noData.style.fontStyle = 'italic';
        noData.style.color = '#666';
        container.appendChild(noData);
        return;
    }
    
    // Créer un tableau pour afficher les fréquences
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    
    // En-tête du tableau
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const headers = ['Rang', getTypeLabel(type, 'singular'), 'nbre', ' % '];
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        th.style.padding = '8px';
        th.style.borderBottom = '2px solid #ddd';
        th.style.textAlign = 'left';
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Corps du tableau
    const tbody = document.createElement('tbody');
    
    // Afficher tous les éléments sans limitation
    stats.sortedFrequencies.forEach((item, index) => {
        const row = document.createElement('tr');
        
        // Appliquer des styles alternés aux lignes
        if (index % 2 === 0) {
            row.style.backgroundColor = '#f5f5f5';
        }
        
        // Appliquer un style spécial pour le top 3
        if (index < 3) {
            row.style.backgroundColor = index === 0 ? '#e6f2ff' : (index === 1 ? '#ecf4ff' : '#f2f8ff');
            row.style.fontWeight = 'bold';
        }
        
        // Rang
        const rankCell = document.createElement('td');
        rankCell.textContent = index + 1;
        rankCell.style.padding = '8px';
        rankCell.style.borderBottom = '1px solid #ddd';
        row.appendChild(rankCell);
        
        // Texte (prénom, nom, métier ou lieu) - RENDU CLIQUABLE
        const textCell = document.createElement('td');
        const textLink = document.createElement('a');
        textLink.textContent = item.text;
        textLink.style.color = '#4361ee';
        textLink.style.textDecoration = 'underline';
        textLink.style.cursor = 'pointer';
        textLink.onclick = () => {
            // Appeler la même fonction que pour le cloud map
            // Fermer le conteneur de détails
            container.style.display = 'none';
            
            // Récupérer la configuration actuelle
            const currentConfig = nameCloudState.currentConfig || { type };
            
            // Calculer les dates de début et de fin pour ce siècle
            const startDate = century; // Début du siècle (ex: 1800)
            const endDate = century + 99; // Fin du siècle (ex: 1899)
            
            // Créer une configuration temporaire avec les dates du siècle
            const tempConfig = {
                ...currentConfig,
                startDate: startDate,
                endDate: endDate
            };
            
            // Utiliser la fonction existante avec la configuration temporaire
            new showPersonsList(
                `${item.text} (${getDisplayCentury(century)})`, // Titre avec indication du siècle
                findPeopleWithName(item.text, tempConfig, item.originalName),      // Filtrer par siècle
                tempConfig                                      // Config temporaire avec dates du siècle
            );
        };
        
        textCell.appendChild(textLink);
        textCell.style.padding = '8px';
        textCell.style.borderBottom = '1px solid #ddd';
        row.appendChild(textCell);
        
        // Nombre d'occurrences
        const countCell = document.createElement('td');
        countCell.textContent = item.count;
        countCell.style.padding = '8px';
        countCell.style.borderBottom = '1px solid #ddd';
        row.appendChild(countCell);
        
        // Pourcentage
        const percentCell = document.createElement('td');
        const percent = (item.count / stats.count * 100).toFixed(1);
        percentCell.textContent = `${percent}%`;
        percentCell.style.padding = '8px';
        percentCell.style.borderBottom = '1px solid #ddd';
        row.appendChild(percentCell);
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    container.appendChild(table);
    
    // Bouton pour masquer les détails
    const hideButton = document.createElement('button');
    hideButton.textContent = 'Masquer les détails';
    hideButton.style.marginTop = '15px';
    hideButton.style.padding = '5px 10px';
    hideButton.style.backgroundColor = '#f0f0f0';
    hideButton.style.border = '1px solid #ddd';
    hideButton.style.borderRadius = '4px';
    hideButton.style.cursor = 'pointer';
    
    hideButton.onclick = () => {
        container.style.display = 'none';
    };
    
    container.appendChild(hideButton);
    
    // Faire défiler jusqu'au conteneur de détails
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function initializeNonNumericCenturyChart(centuryStats, firstCentury, lastCentury, container, detailsContainer, type) {
    // S'assurer que d3 est disponible
    if (!window.d3) {
        console.error("D3.js n'est pas chargé");
        return;
    }
    
    // Vider le conteneur
    d3.select(container).html("");

    const containerWidth = container.clientWidth;

    // Ajustez le conteneur lui-même
    container.style.paddingLeft = '2';
    container.style.paddingRight = '0';
    
    // Vérifier si l'écran est petit
    const isSmallScreen = container.clientWidth < 400;


    // Cherchez le modal et ajustez son padding
    const modal = document.querySelector('.century-stats-modal-' + type);
    if (modal && isSmallScreen) {
        modal.style.padding = '4px';
        modal.style.width = '98%';
    }
    
    // Dimensions du graphique - réduire encore plus les marges pour les petits écrans
    const margin = {
        top: -10, 
        right: isSmallScreen ? 0 : 20, // Encore plus réduit pour petits écrans
        bottom: 80, 
        left: isSmallScreen ? 0 : 30    // Encore plus réduit pour petits écrans
    };

    // Calculer la largeur en compensant l'offset négatif si nécessaire
    const additionalWidth = isSmallScreen ? 20 : 0; // Compenser l'offset négatif + extra
    const width = isSmallScreen ? containerWidth + additionalWidth : container.clientWidth - margin.left - margin.right;
    const height = container.clientHeight - margin.top - margin.bottom;
    
    // Créer le SVG
    const svg = d3.select(container).append("svg")
        .attr("width", width + margin.left + margin.right ) // Ajuster la largeur totale
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    
    // Couleurs plus pétantes pour les top 3
    const colorScale = d3.scaleOrdinal()
        .domain([0, 1, 2])
        .range(["#4361ee", "#38b000", "#ff6b00"]); // Bleu, Vert, Orange
    
    // Préparer les données pour le graphique
    const chartData = [];
    
    // Inclure tous les siècles de firstCentury à lastCentury
    for (let century = firstCentury; century <= lastCentury; century += 100) {
        const stats = centuryStats[century];
        
        if (stats.count > 0) {
            // Pour chaque siècle, créer une entrée avec le top 3
            chartData.push({
                century: century,
                centuryLabel: century < 0 ? `-${Math.abs(century/100)}e` : `${century/100 + 1}e`, // Format compact
                top3: stats.top3 || [],
                totalCount: stats.count
            });
        }
    }
    
    // Si aucune donnée
    if (chartData.length === 0) {
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height / 2)
            .attr("text-anchor", "middle")
            // .text("Aucune donnée disponible");
            .text(getCenturyTranslation('noDataAvailable'));
        return;
    }
    
    // Échelle X pour les siècles - réduire encore le padding pour petits écrans
    const x = d3.scaleBand()
        .domain(chartData.map(d => d.centuryLabel))
        .range([0, width])
        .padding(isSmallScreen ? 0.05 : 0.1); // Padding encore plus réduit pour maximiser l'espace
    
    // Hauteur fixe des barres
    const barHeight = height * 0.8;
    
    // Barres pour chaque siècle
    const bars = svg.selectAll(".century-bar")
        .data(chartData)
        .enter().append("g")
        .attr("class", "century-bar")
        .attr("transform", d => `translate(${x(d.centuryLabel)},0)`)
        .on("click", function(event, d) {
            // Afficher les détails pour ce siècle
            showCenturyDetails(d.century, centuryStats[d.century], detailsContainer, type);
        })
        .style("cursor", "pointer");
    
    // Pour chaque barre, ajouter un rectangle pour le fond
    bars.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", x.bandwidth())
        .attr("height", barHeight)
        .attr("fill", "#f0f0f0")
        .attr("stroke", "#ddd");
    
    // Ajouter les sections pour le top 3 - invertir l'ordre (top 1 en bas, top 3 en haut)
    bars.each(function(d) {
        const group = d3.select(this);
        const sectionHeight = barHeight / 3;
        
        // Si aucune donnée dans top3, ne rien faire
        if (!d.top3 || d.top3.length === 0) return;
        
        // Inverser l'ordre: top 1 en bas, top 2 au milieu, top 3 en haut
        for (let i = 0; i < Math.min(3, d.top3.length); i++) {
            const invIndex = 2 - i; // Pour inverser l'ordre (2, 1, 0 au lieu de 0, 1, 2)
            const item = d.top3[i];
            const yPos = invIndex * sectionHeight; // Position Y inversée
            
            // Section de la barre
            group.append("rect")
                .attr("x", 0)
                .attr("y", yPos)
                .attr("width", x.bandwidth())
                .attr("height", sectionHeight)
                .attr("fill", colorScale(i)) // Garder les couleurs dans l'ordre original
                .attr("opacity", 0.8);
            
            // Tronquer le texte à 8 caractères si nécessaire
            let displayText = item.text;
            if (displayText.length > 11) {
                displayText = displayText.substring(0, 11);
            }
            displayText = `${displayText}   ${item.count}`; // Remplacer ":" par 3 espaces
            
            // Texte avec rotation
            group.append("text")
                .attr("x", x.bandwidth() / 2)
                .attr("y", yPos + sectionHeight / 2)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .attr("transform", `rotate(-90, ${x.bandwidth() / 2}, ${yPos + sectionHeight / 2})`)
                .attr("fill", "white")
                .style("font-size", "11px")
                .style("font-weight", "bold")
                .text(displayText);
        }
    });
    
    // Axe X
    svg.append("g")
        .attr("transform", `translate(-10,${barHeight +10})`)
        .call(d3.axisBottom(x).tickSize(0)) // tickSize(0) supprime les graduations
        .call(g => g.select(".domain").remove()) // Supprime la ligne horizontale
        .selectAll("text")
        .style("text-anchor", "middle")
        .attr("dx", 0)
        .attr("dy", "1em") // Remonte les étiquettes (valeur positive = vers le bas)
        .style("font-size", isSmallScreen ? "8px" : "10px")
        .attr("transform", `rotate(-90)`);



    const legend = svg.append("g")
    .attr("transform", `translate(${width/2 - 150}, ${barHeight + 30})`); // Centré en bas

    // Légende pour le top 3 en horizontal
// ['1er', '2e', '3e'].forEach((label, i) => {
    const mostFrequentLabels = [
        getCenturyTranslation('1stMostFrequent'),
        getCenturyTranslation('2ndMostFrequent'),
        getCenturyTranslation('3rdMostFrequent')
    ];
    
    mostFrequentLabels.forEach((label, i) => {        
        legend.append("rect")
            .attr("width", 12)
            .attr("height", 12)
            .attr("x", i * 100) // Espacement horizontal
            .attr("y", 0)
            .attr("fill", colorScale(i))
            .attr("opacity", 0.8);
        
        legend.append("text")
            .attr("x", i * 100 + 16)
            .attr("y", 9)
            .attr("font-size", "10px")
            // .text(`${label} plus fréquent`);
            .text(`${label} ${getCenturyTranslation('mostFrequent')}`);
    });
    
    // Instructions de clic
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", barHeight + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .style("font-size", "11px")
        .style("font-style", "italic")
        // .text("Cliquez sur une barre pour la liste complète par siècle");
        .text(getCenturyTranslation('clickBarForList'));
}

// Fonction pour initialiser le graphique par siècle
function initializeCenturyChart(centuryStats, firstCentury, lastCentury, container, type) {
    // S'assurer que d3 est disponible
    if (!window.d3) {
        console.error("D3.js n'est pas chargé");
        return;
    }
    
    // Vider le conteneur
    d3.select(container).html("");
    


    const containerWidth = container.clientWidth;

    // Ajustez le conteneur lui-même
    container.style.paddingLeft = '2';
    container.style.paddingRight = '0';
    
    // Vérifier si l'écran est petit
    const isSmallScreen = container.clientWidth < 400;


    // Cherchez le modal et ajustez son padding
    const modal = document.querySelector('.century-stats-modal-' + type);
    if (modal && isSmallScreen) {
        modal.style.padding = '4px';
        modal.style.width = '98%';
    }
    
    // Dimensions du graphique - réduire encore plus les marges pour les petits écrans
    const margin = {
        top: 10, 
        right: isSmallScreen ? 0 : 20, // Encore plus réduit pour petits écrans
        bottom:  80, 
        left: isSmallScreen ? 30 : 30    // Encore plus réduit pour petits écrans
    };

    // bottom: (window.innerHeight < 400) ? 160 : 80, 





    // // Dimensions du graphique
    // const margin = {top: 30, right: 50, bottom: 60, left: 60};
    const heightreduction = (window.innerHeight < 400) ? 60 : 0; // Compenser l'offset négatif + extra
    const width = container.clientWidth - margin.left - margin.right;
    const height = container.clientHeight - margin.top - margin.bottom - heightreduction;
    
    // Créer le SVG
    const svg = d3.select(container).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Préparer les données pour le graphique
    const chartData = [];
    
    // Inclure tous les siècles de firstCentury à lastCentury
    for (let century = firstCentury; century <= lastCentury; century += 100) {
        const stats = centuryStats[century];
        
        chartData.push({
            century: century,
            // centuryLabel: getDisplayCentury(century),
            centuryLabel: century < 0 ? `-${Math.abs(century/100)}e` : `${century/100 + 1}e`, // Format compact
            value: stats.average || 0,
            maleValue: stats.males.average || 0,
            femaleValue: stats.females.average || 0,
            count: stats.count || 0
        });
    }
    
    // Échelle X
    const x = d3.scaleBand()
        .domain(chartData.map(d => d.centuryLabel))
        .range([0, width])
        // .padding(0.2);
        .padding(isSmallScreen ? 0.05 : 0.1); // Padding encore plus réduit pour maximiser l'espace
    
    // Trouver le maximum pour l'échelle Y
    const yMax = d3.max(chartData, d => Math.max(d.value, d.maleValue, d.femaleValue)) * 1.1;
    
    // Échelle Y
    const y = d3.scaleLinear()
        .domain([0, yMax])
        .nice()
        .range([height, 0]);
    
    // Barres pour les valeurs moyennes globales
    svg.selectAll(".bar-average")
        .data(chartData)
        .enter().append("rect")
        .attr("class", "bar-average")
        .attr("x", d => x(d.centuryLabel))
        .attr("y", d => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", d => d.count > 0 ? "#4361ee" : "#ccc")
        .attr("opacity", 0.7)
        .attr("rx", 3);
    
    // Créer la ligne pour les hommes
    const maleLine = d3.line()
        .x(d => x(d.centuryLabel) + x.bandwidth() / 2)
        .y(d => y(d.maleValue));
    
    svg.append("path")
        .datum(chartData.filter(d => d.maleValue > 0))
        .attr("fill", "none")
        .attr("stroke", "#4299e1")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .attr("d", maleLine);
    
    // Points pour les hommes
    svg.selectAll(".point-male")
        .data(chartData.filter(d => d.maleValue > 0))
        .enter().append("circle")
        .attr("class", "point-male")
        .attr("cx", d => x(d.centuryLabel) + x.bandwidth() / 2)
        .attr("cy", d => y(d.maleValue))
        .attr("r", 4)
        .attr("fill", "#4299e1");
    
    // Créer la ligne pour les femmes
    const femaleLine = d3.line()
        .x(d => x(d.centuryLabel) + x.bandwidth() / 2)
        .y(d => y(d.femaleValue));
    
    svg.append("path")
        .datum(chartData.filter(d => d.femaleValue > 0))
        .attr("fill", "none")
        .attr("stroke", "#F687B3")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .attr("d", femaleLine);
    
    // Points pour les femmes
    svg.selectAll(".point-female")
        .data(chartData.filter(d => d.femaleValue > 0))
        .enter().append("circle")
        .attr("class", "point-female")
        .attr("cx", d => x(d.centuryLabel) + x.bandwidth() / 2)
        .attr("cy", d => y(d.femaleValue))
        .attr("r", 4)
        .attr("fill", "#F687B3");
    
    // Ajouter le nombre de personnes au-dessus de chaque barre
    svg.selectAll(".bar-label")
        .data(chartData)
        .enter().append("text")
        .attr("class", "bar-label")
        .attr("x", d => x(d.centuryLabel) + x.bandwidth() / 2)
        .attr("y", d => y(d.value) - 5)
        .attr("text-anchor", "middle")
        .attr("fill", "#333")
        .style("font-size", "9px")
        .text(d => d.count > 0 ? d.count : "");
    
    // Axe X
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        // .call(d3.axisBottom(x))
        .call(d3.axisBottom(x).tickSize(0))  // Ajoutez .tickSize(0) ici
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", isSmallScreen ? "rotate(-90)": "rotate(-45)");
    
    // Axe Y
    svg.append("g")
        .call(d3.axisLeft(y).ticks(5));
    
    // Titre de l'axe Y
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 7 + 2)
        .attr("x", -height / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text(getYAxisTitle(type));
    
    // Légende
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 200}, 0)`);
    
    // Légende pour la moyenne générale
    legend.append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", "#4361ee")
        .attr("opacity", 0.7)
        .attr("rx", 2);
    
    legend.append("text")
        .attr("x", 16)
        .attr("y", 9)
        .attr("font-size", "10px")
        // .text("Moyenne générale");
        .text(getCenturyTranslation('generalAverage'));
    
    // Légende pour les hommes
    legend.append("g")
        .attr("transform", "translate(0, 20)")
        .call(g => {
            g.append("line")
                .attr("x1", 0)
                .attr("x2", 12)
                .attr("y1", 6)
                .attr("y2", 6)
                .attr("stroke", "#4299e1")
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "5,5");
            
            g.append("circle")
                .attr("cx", 6)
                .attr("cy", 6)
                .attr("r", 4)
                .attr("fill", "#4299e1");
            
            g.append("text")
                .attr("x", 16)
                .attr("y", 9)
                .attr("font-size", "10px")
                // .text("Hommes");
                .text(getCenturyTranslation('men'));
        });
    
    // Légende pour les femmes
    legend.append("g")
        .attr("transform", "translate(0, 40)")
        .call(g => {
            g.append("line")
                .attr("x1", 0)
                .attr("x2", 12)
                .attr("y1", 6)
                .attr("y2", 6)
                .attr("stroke", "#F687B3")
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "5,5");
            
            g.append("circle")
                .attr("cx", 6)
                .attr("cy", 6)
                .attr("r", 4)
                .attr("fill", "#F687B3");
            
            g.append("text")
                .attr("x", 16)
                .attr("y", 9)
                .attr("font-size", "10px")
                // .text("Femmes");
                .text(getCenturyTranslation('women'));
        });
}

// Fonction pour obtenir le titre de l'axe Y en fonction du type
// function getYAxisTitle(type) {
//     switch (type) {
//         case 'duree_vie':
//             return 'Durée de vie moyenne (années)';
//         case 'age_procreation':
//             return 'Âge moyen de procréation (années)';
//         case 'age_marriage':
//             return 'Âge moyen au mariage (années)';
//         case 'age_first_child':
//             return 'Âge moyen au premier enfant (années)';
//         case 'nombre_enfants':
//             return 'Nombre moyen d\'enfants';
//         default:
//             return 'Valeur moyenne';
//     }
// }
function getYAxisTitle(type) {
    switch (type) {
        case 'duree_vie':
            return getCenturyTranslation('lifespanAxisTitle');
        case 'age_procreation':
            return getCenturyTranslation('procreationAgeAxisTitle');
        case 'age_marriage':
            return getCenturyTranslation('marriageAgeAxisTitle');
        case 'age_first_child':
            return getCenturyTranslation('firstChildAgeAxisTitle');
        case 'nombre_enfants':
            return getCenturyTranslation('childrenCountAxisTitle');
        default:
            return getCenturyTranslation('defaultAxisTitle');
    }
}

// Fonction pour formater l'affichage du siècle
function getDisplayCentury(century) {
    if (century < 0) {
        // return `${Math.abs(century + 100) / 100}e av JC`;
        return `${Math.abs(century + 100) / 100}e ${getCenturyTranslation('bc')}`;
    } else {
        return `${(century / 100) + 1}e `;
    }
}


// Fonction pour redimensionner le graphique dans la modale des statistiques par siècle
function resizeCenturyCharts() {
    // Rechercher tous les conteneurs de graphiques dans les modales
    const chartContainers = document.querySelectorAll('[id^="century-chart-"]');
    
    if (chartContainers.length === 0) return; // Pas de graphique à redimensionner
    
    console.log('\n\n*** debug resize in nameCloudCentury for resizeCenturyCharts \n\n');


    chartContainers.forEach(container => {
        // Extraire le type à partir de l'ID du conteneur (format: "century-chart-TYPE")
        const type = container.id.replace('century-chart-', '');
        
        // Vérifier si c'est un type numérique
        const numericTypes = ['duree_vie', 'age_procreation', 'age_marriage', 'age_first_child', 'nombre_enfants'];
        const isNumericType = numericTypes.includes(type);
        
        // Récupérer les statistiques
        const centuryStats = collectCenturyData(type);
        
        if (!centuryStats) return;
        
        // Trouver le premier et le dernier siècle avec des données
        let firstCentury = 2100;
        let lastCentury = -600;
        
        for (const century in centuryStats) {
            if (centuryStats[century].count > 0) {
                const centuryNum = parseInt(century);
                firstCentury = Math.min(firstCentury, centuryNum);
                lastCentury = Math.max(lastCentury, centuryNum);
            }
        }
        
        // Vider le conteneur
        container.innerHTML = '';
        
        // Trouver le conteneur de détails pour les types non numériques
        const detailsContainer = document.getElementById('century-details-container');
        
        // Redessiner le graphique avec la nouvelle taille
        if (isNumericType) {
            initializeCenturyChart(centuryStats, firstCentury, lastCentury, container, type);
        } else if (detailsContainer) {
            initializeNonNumericCenturyChart(centuryStats, firstCentury, lastCentury, container, detailsContainer, type);
        }
    });
}


// Ajouter un écouteur d'événement pour le redimensionnement de la fenêtre
window.addEventListener('resize', debounce(function() {
    // console.log('\n\n*** debug resize in nameCloudCentury for resizeCenturyCharts \n\n');

    // Utiliser un délai pour éviter de redessiner trop souvent pendant le redimensionnement
    if (window.centuryChartResizeTimer) {
        clearTimeout(window.centuryChartResizeTimer);
    }
    
    window.centuryChartResizeTimer = setTimeout(function() {
        resizeCenturyCharts();
    }, 250); // 250ms de délai

}, 150));