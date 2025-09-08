import { state, displayPersonDetails } from './main.js';
import { startAncestorAnimation } from './treeAnimation.js';
import { nameCloudState, extractSearchTextFromTitle, filterPeopleByText } from './nameCloud.js'
import { extractYear } from './nameCloudUtils.js';
import { removeAllStatsElements } from './nameCloudAverageAge.js';
import { createDataForHeatMap, refreshHeatmap } from './geoHeatMapDataProcessor.js';
import { createImprovedHeatmap } from './geoHeatMapUI.js';
import { geocodeLocation } from './geoLocalisation.js';
import { collectPersonLocations, createEnhancedMarkerIcon, fitMapToMarkers, clearMap, addMapTitle, addMapButton, addLoadingOverlay, removeLoadingOverlay, setupCustomPopupStyle } from './mapUtils.js';


window.lastSelectedLocationId = null;
window.isIndividualMapMode = false;



/**
 * Fonction pour obtenir le titre traduit selon le type de configuration et la langue courante
 * @param {string} name - Le nom/prénom/métier/âge/lieu à afficher dans le titre
 * @param {number} count - Le nombre de personnes
 * @param {Object} config - La configuration avec le type de données
 * @returns {string} - Le titre traduit
 */
function getPersonsListTitle(name, count, config) {
    const translations = {
      'fr': {
        'prenoms': `Personnes avec le prénom "${name}" (${count} personnes)`,
        'noms': `Personnes avec le nom "${name}" (${count} personnes)`,
        'professions': `Personnes avec la profession "${name}" (${count} personnes)`,
        'duree_vie': `Personnes ayant vécu ${name} ans (${count} personnes)`,
        'age_procreation': `Personnes ayant eu un enfant à ${name} ans (${count} personnes)`,
        'age_marriage': `Personnes s'étant mariées à ${name} ans (${count} personnes)`,
        'age_first_child': `Personnes ayant eu leur premier enfant à ${name} ans (${count} personnes)`,
        'nombre_enfants': `Personnes ayant eu ${name} enfant(s) (${count} personnes)`,
        'lieux': `Personnes ayant un lien avec le lieu ${name} (${count} personnes)`,
        'default': `Personnes (${count})`
      },
      'en': {
        'prenoms': `People with first name "${name}" (${count} people)`,
        'noms': `People with last name "${name}" (${count} people)`,
        'professions': `People with occupation "${name}" (${count} people)`,
        'duree_vie': `People who lived for ${name} years (${count} people)`,
        'age_procreation': `People who had a child at ${name} years old (${count} people)`,
        'age_marriage': `People who got married at ${name} years old (${count} people)`,
        'age_first_child': `People who had their first child at ${name} years old (${count} people)`,
        'nombre_enfants': `People who had ${name} child(ren) (${count} people)`,
        'lieux': `People connected to the place ${name} (${count} people)`,
        'default': `People (${count})`
      },
      'es': {
        'prenoms': `Personas con el nombre "${name}" (${count} personas)`,
        'noms': `Personas con el apellido "${name}" (${count} personas)`,
        'professions': `Personas con la profesión "${name}" (${count} personas)`,
        'duree_vie': `Personas que vivieron ${name} años (${count} personas)`,
        'age_procreation': `Personas que tuvieron un hijo a los ${name} años (${count} personas)`,
        'age_marriage': `Personas que se casaron a los ${name} años (${count} personas)`,
        'age_first_child': `Personas que tuvieron su primer hijo a los ${name} años (${count} personas)`,
        'nombre_enfants': `Personas que tuvieron ${name} hijo(s) (${count} personas)`,
        'lieux': `Personas relacionadas con el lugar ${name} (${count} personas)`,
        'default': `Personas (${count})`
      },
      'hu': {
        'prenoms': `Személyek "${name}" keresztnévvel (${count} személy)`,
        'noms': `Személyek "${name}" vezetéknévvel (${count} személy)`,
        'professions': `Személyek "${name}" foglalkozással (${count} személy)`,
        'duree_vie': `Személyek, akik ${name} évig éltek (${count} személy)`,
        'age_procreation': `Személyek, akik ${name} évesen gyermeket nemzettek (${count} személy)`,
        'age_marriage': `Személyek, akik ${name} évesen házasodtak (${count} személy)`,
        'age_first_child': `Személyek, akiknek ${name} évesen született az első gyermekük (${count} személy)`,
        'nombre_enfants': `Személyek, akiknek ${name} gyermekük volt (${count} személy)`,
        'lieux': `Személyek kapcsolódva a(z) ${name} helyhez (${count} személy)`,
        'default': `Személyek (${count})`
      }
    };
  
    // Récupérer la langue actuelle
    const currentLang = window.CURRENT_LANGUAGE || 'fr';
    
    // Récupérer les traductions pour la langue actuelle ou fallback vers le français
    const langTranslations = translations[currentLang] || translations['fr'];
    
    // Retourner le titre pour le type de config ou le titre par défaut
    return langTranslations[config.type] || langTranslations['default'];
  }
  

export function showPersonsList(name, people, config) {
    


    // console.log("\n\n debug showPersonsList ", name, people, config)



    // Ajouter un style pour personnaliser les ascenseurs
    const style = document.createElement("style");
    style.textContent = `
        .custom-modal::-webkit-scrollbar {
            width: 10px;
            height: 10px;
        }

        .custom-modal::-webkit-scrollbar-button {
            height: 0px;
            width: 0px;
            display: none;
        }

        .custom-modal::-webkit-scrollbar-thumb {
            background-color: #888;
            border-radius: 6px; 
            border: 3px solid transparent;
            }

        .custom-modal::-webkit-scrollbar-track {
            background-color: #f1f1f1;
            border-radius: 4px;
            margin: 30px;
        }

        /* Style pour agrandir le bouton de fermeture - NOUVELLE SECTION */
        #person-list-close-button {
            font-size: 24px !important;
            width: 40px !important;
            height: 30px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            line-height: 1 !important;
            padding: 0 !important;
            margin: 0 !important;
            cursor: pointer !important;
            border-radius: 4px !important;
            transition: background-color 0.2s ease !important;
            border: none !important;
            background: none !important;
        }
        
        #person-list-close-button:hover {
            background-color: rgba(0, 0, 0, 0.1) !important;
        }
        
        /* Sur les appareils tactiles, augmenter encore plus la zone */
        @media (pointer: coarse) {
            #person-list-close-button {
                font-size: 28px !important;
                width: 40px !important;
                height: 30px !important;
            }
        }
    `;
    // Ajouter le style au document
    document.head.appendChild(style);
    
    const modal = document.createElement('div');
    // modal.className = 'person-list-modal'; // Ajouter une classe pour faciliter la sélection ultérieure

    modal.className = `person-list-modal custom-modal`; // Ajouter une classe pour faciliter la sélection ultérieure


    // Position et taille différentes si la heatmap est visible
    let heatmapWrapper = null;

    if (nameCloudState.isHeatmapVisible)  {
        heatmapWrapper = nameCloudState.heatmapWrapper
        adjustSplitScreenLayout(modal, heatmapWrapper);
        modal.style.backgroundColor = 'transparent'; // Fond transparent au lieu de rgba(0,0,0,0.8)
        // modal.style.pointerEvents = 'auto'; // Important: assure que la modale capte les événements
        modal.style.pointerEvents = 'none'; // Permet aux clics de passer à travers
    } else {
        // Configuration standard (sans heatmap visible)
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'transparent'; // Fond transparent au lieu de rgba(0,0,0,0.8)
        // modal.style.pointerEvents = 'auto'; // Important: assure que la modale capte les événements
        modal.style.pointerEvents = 'none'; // Permet aux clics de passer à travers
    }
    
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '2000';

    const content = document.createElement('div');
    content.style.backgroundColor = 'white';
    content.style.padding = '20px';
    content.style.borderRadius = '10px';


    content.style.border = '2px solid rgba(200, 220, 255, 0.9)'; // Bordure bleue pâle
    content.style.boxShadow = '0 0 15px rgba(200, 220, 255, 0.5)'; // Ombre bleue légère
    // content.style.pointerEvents = 'auto'; // Assure que le contenu capte les événements

    
    // Ajuster la taille du contenu si la heatmap est visible
    if (nameCloudState.isHeatmapVisible)  {
        // content.style.width = '90%';
        // content.style.maxWidth = '100%';
        // content.style.height = '90%';
        content.style.maxHeight = '80vh';
    } else {
        // content.style.width = '80%';
        // content.style.maxWidth = '800px';
        // content.style.maxHeight = '80vh';
        // Centrage horizontal en mode normal (sans heatmap)
        content.style.position = 'fixed';
        content.style.top = '50%';
        content.style.left = '50%';
        content.style.transform = 'translate(-55%, -50%)';
        content.style.maxWidth = '700px';
        content.style.width = '75%';
        content.style.maxHeight = '80vh';
    }
  
    
    // modal.style.width = 'fit-content';
    // modal.style.height = 'fit-content';

    content.style.overflowY = 'auto';
    content.style.position = 'relative';

    content.style.pointerEvents = 'auto'; // S'assure que le contenu de la modale capte les événements







    // Créer un conteneur pour l'en-tête qui restera fixe
    const headerContainer = document.createElement('div');
    headerContainer.style.position = 'sticky';
    headerContainer.style.top = '0';
    headerContainer.style.zIndex = '1001';
    headerContainer.style.backgroundColor = 'rgba(235, 245, 255, 0.95)';
    headerContainer.style.padding = '8px';
    headerContainer.style.borderRadius = '8px 8px 0 0';
    headerContainer.style.borderBottom = '1px solid rgba(200, 220, 255, 0.8)';
    headerContainer.style.marginTop = '-20px';
    headerContainer.style.marginLeft = '-20px';
    headerContainer.style.marginRight = '-20px';
    headerContainer.style.paddingLeft = '20px';
    headerContainer.style.display = 'flex';
    headerContainer.style.justifyContent = 'space-between';
    headerContainer.style.alignItems = 'center';
    headerContainer.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';





    // Titre
    const title = document.createElement('h2');
    title.textContent = getPersonsListTitle(name, people.length, config);

    // on ajoute un titre caché en français , qui était l'ancien titre avant le multilingue pour le filtrage de personnes dans showHeatmapAndAdjustLayout qui est resté en français
    const hiddenFormerFrenchTitle = config.type === 'prenoms' ? 
        `Personnes avec le prénom "${name}" (${people.length} personnes)` :
        config.type === 'noms' ?
            `Personnes avec le nom "${name}" (${people.length} personnes)` :
            config.type === 'professions' ? 
                `Personnes avec la profession "${name}" (${people.length} personnes)` :
                config.type === 'duree_vie' ? 
                    `Personnes ayant vécu ${name} ans (${people.length} personnes)` :
                    config.type === 'age_procreation' ?
                    `Personnes ayant eu un enfant à ${name} ans (${people.length} personnes)` : 
                        config.type === 'lieux' ?
                        `Personnes ayant un lien avec le lieu ${name}  (${people.length} personnes)`:
                        'Personnes';



    title.style.backgroundColor = 'rgba(235, 245, 255, 0.9)'; // Fond bleu pâle
    title.style.borderBottom = '1px solid rgba(200, 220, 255, 0.8)'; // Bordure bleue pâle


    title.style.marginBottom = '0';  // Changer à 0 car l'en-tête a déjà un padding
    title.style.paddingBottom = '0';
    title.style.fontSize = nameCloudState.mobilePhone ? '12px' : '16px';
    title.style.flex = '1';  // Permet au titre de prendre l'espace disponible


    // Bouton de fermeture
    const closeBtn = document.createElement('button');
    closeBtn.id = 'person-list-close-button';  // Ajout d'un ID unique
    closeBtn.innerHTML = '×';
    // closeBtn.style.position = 'absolute';
    closeBtn.style.right = '10px';
    closeBtn.style.top = '10px';
    closeBtn.style.border = 'none';
    closeBtn.style.background = 'none';
    closeBtn.style.fontSize = '20px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.marginLeft = '10px';  // Espace entre le titre et le bouton
    


    // Ajouter le titre et le bouton à l'en-tête
    headerContainer.appendChild(title);
    headerContainer.appendChild(closeBtn);

    // Ajouter l'en-tête au contenu avant la liste
    content.appendChild(headerContainer);

    // Ajuster le style du content pour accommoder l'en-tête fixe
    content.style.paddingTop = '0';  // Réduire le padding car l'en-tête a son propre padding




    closeBtn.onclick = () => {
        // console.log("Fermeture explicite de la modale via le bouton de fermeture");
        // Nettoyer toutes les poignées de redimensionnement
        removeAllResizeHandles();
        if (modal.parentNode) {
            modal.removeAttribute('data-splitscreen-mode');
            modal.parentNode.removeChild(modal);
            
            // Restaurer la taille originale de la heatmap si elle était visible
            if ((nameCloudState.isHeatmapVisible) && heatmapWrapper) {
                try {
                    const originalStyle = JSON.parse(modal.dataset.originalHeatmapStyle || '{}');
                    if (originalStyle.top) heatmapWrapper.style.top = originalStyle.top;
                    if (originalStyle.left) heatmapWrapper.style.left = originalStyle.left;
                    if (originalStyle.width) heatmapWrapper.style.width = originalStyle.width;
                    if (originalStyle.height) heatmapWrapper.style.height = originalStyle.height;
                    
                    // Réinitialiser les variables de suivi
                    lastSelectedLocationId = null;
                    isIndividualMapMode = false;
                    
                    // Rafraîchir la carte avec les données initiales (toutes les personnes)
                    if (typeof refreshHeatmap === 'function') {
                        refreshHeatmap();
                    } else if (heatmapWrapper.map) {
                        setTimeout(() => {
                            heatmapWrapper.map.invalidateSize();
                        }, 100);
                    }
                } catch (error) {
                    // console.error('Erreur lors de la restauration du style de la heatmap:', error);
                    
                    // Restaurer aux valeurs par défaut en cas d'erreur
                    heatmapWrapper.style.top = '60px';
                    heatmapWrapper.style.left = '20px';
                    heatmapWrapper.style.width = 'calc(100% - 40px)';
                    heatmapWrapper.style.height = 'calc(100% - 100px)';
                    
                    setTimeout(() => {
                        if (heatmapWrapper.map) {
                            heatmapWrapper.map.invalidateSize();
                        }
                    }, 100);
                }
            }
        }
    };



    // Liste des personnes
    const list = document.createElement('div');
    list.style.display = 'grid';
    list.style.gap = '2px';  // Espacement réduit
    list.style.fontSize = '14px';  // Taille de police réduite
    list.style.paddingTop = '20px';

    // Trier les personnes par date
    const peopleWithDates = people.map(person => {
        let date = '';
        let sortDate = 0;
        let symbolType = ''; // Pour stocker le type de symbole
        const individual = state.gedcomData.individuals[person.id];

        if (individual) {
            if (individual.birthDate) {
                symbolType = 'birth';
                date = `<span class="date-symbol" style="font-size: 1.5em; vertical-align: middle;">👶</span> ${individual.birthDate}`; //🚼
                sortDate = extractYear(individual.birthDate) || 0;
            } else if (individual.deathDate) {
                symbolType = 'death';
                date = `<span class="date-symbol" style="font-size: 1.6em; vertical-align: middle;">✝️</span> ${individual.deathDate}`; //'✝'; ////☦🏴⚰️
                sortDate = extractYear(individual.deathDate) || 0;
            } else if (individual.spouseFamilies && individual.spouseFamilies.length > 0) {
                for (const famId of individual.spouseFamilies) {
                    const family = state.gedcomData.families[famId];
                    if (family && family.marriageDate) {
                        symbolType = 'marriage';
                        date = `<span class="date-symbol" style="font-size: 1.6em; vertical-align: middle;">💍</span> ${family.marriageDate}`; //🔗💞⚭
                        sortDate = extractYear(family.marriageDate) || 0;
                        break;
                    }
                }
            }
            
            // Ajouter les informations de lieu
            individual.hasLocations = !!(
                individual.birthPlace || 
                individual.deathPlace || 
                individual.residPlace1 || 
                individual.residPlace2 || 
                individual.residPlace3 ||
                (individual.spouseFamilies && individual.spouseFamilies.some(famId => {
                    const family = state.gedcomData.families[famId];
                    return family && family.marriagePlace;
                }))
            );
        }

        return {
            name: person.name,
            id: person.id,
            date: date,
            symbolType: symbolType,
            sortDate: sortDate,
            hasLocations: individual ? individual.hasLocations : false
        };
    }).sort((a, b) => b.sortDate - a.sortDate);


    /**
     * Crée une carte individuelle avec les lieux d'une personne
     * @param {string} personId - ID de la personne
     * @returns {Promise<void>}
     */
    async function createIndividualLocationMap(personId) {
        // Vérifier que le wrapper de la heatmap existe
        const heatmapWrapper = document.getElementById('namecloud-heatmap-wrapper');
        if (!heatmapWrapper) {
            console.error("Wrapper de heatmap non trouvé");
            return;
        }
        
        // Vérifier que la carte existe dans le wrapper
        if (!heatmapWrapper.map) {
            console.error("Carte Leaflet non trouvée dans le wrapper");
            return;
        }
        
        // Configurer le style personnalisé pour les popups
        setupCustomPopupStyle();

        // Récupérer les informations de la personne
        const person = state.gedcomData.individuals[personId];
        if (!person) {
            console.error("Personne non trouvée avec l'ID:", personId);
            return;
        }
        
        console.log("Personne trouvée:", person.name);
        
        // Collecter les lieux de la personne avec la fonction centralisée
        const locations = collectPersonLocations(person, state.gedcomData.families);
        
        if (locations.length === 0) {
            console.log('Aucun lieu trouvé pour cette personne');
            alert('Aucun lieu trouvé pour cette personne');
            return;
        }
        
        // Afficher un indicateur de chargement
        const loadingOverlay = addLoadingOverlay(heatmapWrapper, 'Chargement des lieux...');
        
        try {
            // Récupérer la carte
            const map = heatmapWrapper.map;
            
            // Nettoyer toutes les couches existantes sauf la couche de tuiles
            clearMap(map);
            
            // Tableau pour stocker les marqueurs
            const markers = [];
            
            // Géocoder et placer les marqueurs
            for (const location of locations) {
                try {
                    console.log("Géocodage de:", location.place);
                    const coords = await geocodeLocation(location.place);
                    
                    if (coords && !isNaN(coords.lat) && !isNaN(coords.lon)) {
                        console.log("Coordonnées trouvées:", coords);
                        
                        // Créer l'icône pour le marqueur avec un style amélioré
                        const markerIcon = createEnhancedMarkerIcon(location.type);
                        
                        // Créer et ajouter le marqueur
                        const marker = L.marker([coords.lat, coords.lon], { icon: markerIcon })
                            .addTo(map)
                            .bindPopup(`<strong>${location.type}:</strong> ${location.place}`);
                        
                        markers.push(marker);
                    } else {
                        console.warn("Coordonnées invalides pour:", location.place);
                    }
                } catch (error) {
                    console.error(`Erreur lors du géocodage de ${location.place}:`, error);
                }
            }
            
            // Vérifier si des marqueurs ont été ajoutés
            if (markers.length === 0) {
                console.warn("Aucun marqueur n'a pu être ajouté à la carte");
                alert("Aucun lieu n'a pu être localisé sur la carte");
                loadingOverlay.remove();
                return;
            }
            
            // Ajuster la vue de la carte pour inclure tous les marqueurs
            await fitMapToMarkers(map, markers, {
                maxZoom: 9,
                animate: true,
                duration: 1.5,
                easeLinearity: 0.25
            });
            
            // Améliorer aussi les popups pour plus de lisibilité
            markers.forEach(marker => {
                // Personnaliser le style de la popup
                const popup = marker.getPopup();
                if (popup) {
                    popup.options.className = 'custom-popup';
                }
            });
    
            // Ajouter un titre à la carte
            addMapTitle(heatmapWrapper, `Lieux de ${person.name.replace(/\//g, '')}`);
            
            // Ajouter un bouton pour revenir à la heatmap originale
            addMapButton(heatmapWrapper, 'Voir tous les lieux', () => {
                // Rétablir la heatmap originale
                if (typeof refreshHeatmap === 'function') {
                    refreshHeatmap();
                    
                    // Réinitialiser les variables de suivi
                    window.lastSelectedLocationId = null;
                    window.isIndividualMapMode = false;
                    
                    // Mettre à jour l'apparence des icônes de localisation
                    document.querySelectorAll('.location-icon').forEach(icon => {
                        icon.style.color = '';
                        icon.style.backgroundColor = '';
                    });
                }
                
                // Supprimer le titre et le bouton de reset
                const mapTitle = heatmapWrapper.querySelector('.individual-map-title');
                if (mapTitle) mapTitle.remove();
                
                const resetButton = heatmapWrapper.querySelector('.reset-heatmap-button');
                if (resetButton) resetButton.remove();
            });
            
        } catch (error) {
            console.error('Erreur lors de la création de la carte individuelle:', error);
            alert('Erreur lors de la création de la carte: ' + error.message);
        } finally {
            // Supprimer l'overlay de chargement
            removeLoadingOverlay(heatmapWrapper);
        }

        // Mettre à jour les variables de suivi
        window.lastSelectedLocationId = personId;
        window.isIndividualMapMode = true;

        // Mettre en évidence l'icône de localisation correspondante
        document.querySelectorAll('.location-icon').forEach(icon => {
            const parentElement = icon.closest('[data-person-id]');
            const iconPersonId = parentElement ? parentElement.dataset.personId : null;
            
            if (iconPersonId === personId) {
                icon.style.color = '#ffffff';
                icon.style.backgroundColor = '#4361ee';
                icon.style.opacity = '1';
            } else {
                icon.style.color = '';
                icon.style.backgroundColor = '';
                icon.style.opacity = '0.7';
            }
        });
    }


    peopleWithDates.forEach((person, index) => {
        const personDiv = document.createElement('div');
        personDiv.style.padding = '3px 5px';
        personDiv.style.backgroundColor = index % 2 === 0 ? '#f9f9f9' : 'white';
        personDiv.style.display = 'flex';
        personDiv.style.justifyContent = 'space-between';
        personDiv.style.alignItems = 'center';
        personDiv.style.lineHeight = '1.2';
        personDiv.style.cursor = 'pointer';

        // Partie gauche pour le nom et l'icône de localisation
        const leftPart = document.createElement('div');
        leftPart.style.display = 'flex';
        leftPart.style.alignItems = 'center';
        leftPart.style.gap = '5px';
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = person.name;
        if (nameCloudState.mobilePhone) {
            nameSpan.style.fontSize = '12px';
        }
        
        // Ajouter l'icône de localisation si la personne a des lieux
        // if (person.hasLocations && isHeatmapVisible) {
        if (person.hasLocations) {
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
            if (lastSelectedLocationId === person.id && isIndividualMapMode) {
                locationIcon.style.color = '#ffffff';
                locationIcon.style.backgroundColor = '#4361ee';
                locationIcon.style.opacity = '1';
            }
            
            // Effet de survol
            locationIcon.addEventListener('mouseover', () => {
                locationIcon.style.opacity = '1';
            });
            
            locationIcon.addEventListener('mouseout', () => {
                if (lastSelectedLocationId !== person.id || !isIndividualMapMode) {
                    locationIcon.style.opacity = '0.7';
                }
            });
            


            // Gestionnaire de clic pour l'icône de localisation
            locationIcon.addEventListener('click', async (e) => {
                e.stopPropagation(); // Empêcher la propagation au div parent
                
                // console.log("Clic sur l'icône de localisation pour la personne:", person.id);
                
                // Vérifier si une heatmap est déjà visible
                let heatmapWrapper = document.getElementById('namecloud-heatmap-wrapper');
                const currentlyHeatmapVisible = heatmapWrapper !== null;
                
                // Si la heatmap n'est pas visible, il faut la créer et ajuster le layout
                if (!currentlyHeatmapVisible) {
                    // Utiliser notre fonction qui réutilise le code existant
                    heatmapWrapper = await showHeatmapAndAdjustLayout(modal, nameCloudState.currentConfig, hiddenFormerFrenchTitle);
                    
                    if (heatmapWrapper && heatmapWrapper.map) {
                        // Attendre un peu que la carte soit complètement initialisée
                        setTimeout(() => {
                            // Créer une carte avec les lieux de cette personne
                            createIndividualLocationMap(person.id);
                            
                            // Mettre à jour les variables de suivi
                            window.lastSelectedLocationId = person.id;
                            window.isIndividualMapMode = true;
                            
                            // Mettre en évidence cette icône
                            locationIcon.style.color = '#ffffff';
                            locationIcon.style.backgroundColor = '#4361ee';
                            locationIcon.style.opacity = '1';
                        }, 300);
                    }
                } else {
                    // La heatmap est déjà visible, comportement habituel
                    if (window.lastSelectedLocationId === person.id && window.isIndividualMapMode) {
                        // Si on clique sur la personne déjà sélectionnée, revenir à la heatmap originale
                        if (typeof refreshHeatmap === 'function') {
                            refreshHeatmap();
                            
                            // Réinitialiser les variables de suivi
                            window.lastSelectedLocationId = null;
                            window.isIndividualMapMode = false;
                            
                            // Réinitialiser le style de l'icône
                            locationIcon.style.color = '';
                            locationIcon.style.backgroundColor = '';
                            locationIcon.style.opacity = '0.7';
                            
                            // Supprimer le titre et le bouton de reset
                            const mapTitle = heatmapWrapper.querySelector('.individual-map-title');
                            if (mapTitle) mapTitle.remove();
                            
                            const resetButton = heatmapWrapper.querySelector('.reset-heatmap-button');
                            if (resetButton) resetButton.remove();
                        }
                    } else {
                        // Afficher les lieux de cette personne
                        createIndividualLocationMap(person.id);
                        
                        // Mettre à jour les variables de suivi
                        window.lastSelectedLocationId = person.id;
                        window.isIndividualMapMode = true;
                        
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
                }
            });


            leftPart.appendChild(nameSpan);
            leftPart.appendChild(locationIcon);
        } else {
            leftPart.appendChild(nameSpan);
        }

        const dateSpan = document.createElement('span');
        dateSpan.innerHTML = person.date; // Utiliser innerHTML pour interpréter les balises span
        dateSpan.style.color = 'darkblue';
        dateSpan.style.whiteSpace = 'nowrap';
        if (nameCloudState.mobilePhone) {
            dateSpan.style.fontSize = '10px';
        }

        personDiv.appendChild(leftPart);
        personDiv.appendChild(dateSpan);

        personDiv.addEventListener('click', (event) => {
            // console.log('Clicked on person:', person.name, person.id);
            event.stopPropagation();
            showPersonActions(person, event);
        });

        list.appendChild(personDiv);
    });

    // content.appendChild(closeBtn);
    // content.appendChild(title);
    content.appendChild(list);
    modal.appendChild(content);
    document.body.appendChild(modal);


    // Gestion de la touche Échap
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            // console.log("Fermeture par touche Escape", new Error().stack);
            removeAllResizeHandles();
            if (modal.parentNode) {
                modal.removeAttribute('data-splitscreen-mode');
                modal.parentNode.removeChild(modal);
                
                // Restaurer la taille originale de la heatmap si elle était visible
                if ((nameCloudState.isHeatmapVisible) && heatmapWrapper) {
                    try {
                        const originalStyle = JSON.parse(modal.dataset.originalHeatmapStyle || '{}');
                        if (originalStyle.top) heatmapWrapper.style.top = originalStyle.top;
                        if (originalStyle.left) heatmapWrapper.style.left = originalStyle.left;
                        if (originalStyle.width) heatmapWrapper.style.width = originalStyle.width;
                        if (originalStyle.height) heatmapWrapper.style.height = originalStyle.height;
                        
                        // Rafraîchir la carte avec les données initiales (toutes les personnes)
                        if (typeof refreshHeatmap === 'function') {
                            refreshHeatmap();
                        } else if (heatmapWrapper.map) {
                            // heatmapWrapper.map.invalidateSize();
                            setTimeout(() => {
                                if (heatmapWrapper && heatmapWrapper.map) {
                                    try {
                                        heatmapWrapper.map.invalidateSize({ animate: false });
                                    } catch (error) {
                                        console.error("Erreur lors de l'invalidation de la taille de la carte:", error);
                                    }
                                }
                            }, 200);
                        }
                        
                        // Réinitialiser les variables de suivi
                        lastSelectedLocationId = null;
                        isIndividualMapMode = false;
                    } catch (error) {
                        console.error('Erreur lors de la restauration du style de la heatmap:', error);
                    }
                }
            }
            document.removeEventListener('keydown', handleEscape);
        }
    };

    document.addEventListener('keydown', handleEscape);


    
    // Gérer la redimension de fenêtre si la heatmap est visible
    if ((nameCloudState.isHeatmapVisible) ) {
        const resizeHandler = () => {
            if (!document.body.contains(modal)) {
                window.removeEventListener('resize', resizeHandler);
                return;
            }
            
            const isLandscapeNow = window.innerWidth > window.innerHeight;
            
            if (isLandscapeNow) {
                // Mode paysage
                modal.style.top = '0';
                modal.style.left = '50%';
                modal.style.width = '50%';
                modal.style.height = '100%';
                
                heatmapWrapper.style.width = '50%';
                heatmapWrapper.style.height = 'calc(100% - 60px)';
                heatmapWrapper.style.left = '0';
                heatmapWrapper.style.top = '60px';
            } else {
                // Mode portrait
                modal.style.top = '50%';
                modal.style.left = '0';
                modal.style.width = '100%';
                modal.style.height = '50%';
                
                heatmapWrapper.style.width = '100%';
                heatmapWrapper.style.height = '50%';
                heatmapWrapper.style.top = '60px';
                heatmapWrapper.style.left = '0';
            }
            
            // Invalider la taille de la carte
            if (heatmapWrapper.map) {
                heatmapWrapper.map.invalidateSize();
            }
        };
        
        window.addEventListener('resize', resizeHandler);
        
        // Assurons-nous que l'écouteur est supprimé si la modale est fermée
        const originalCloseHandler = closeBtn.onclick;
        closeBtn.onclick = (e) => {
            window.removeEventListener('resize', resizeHandler);
            if (originalCloseHandler) originalCloseHandler.call(closeBtn, e);
        };
    }



    modal.addEventListener('mousedown', function(e) {
        e.stopPropagation();
        // console.log("Mousedown sur la modale intercepté");
    });
    
    content.addEventListener('mousedown', function(e) {
        e.stopPropagation();
        // console.log("Mousedown sur le contenu intercepté");
    });



    makeModalDraggableAndResizable(modal, title);



}

/**
 * Affiche la heatmap et ajuste le layout pour l'écran partagé
 * @param {HTMLElement} modal - La modale de liste de personnes
 * @param {Object} config - La configuration actuelle
 * @returns {Promise<HTMLElement|null>} - Le wrapper de heatmap ou null en cas d'erreur
 */
async function showHeatmapAndAdjustLayout(modal, config, hiddenFormerFrenchTitle) {
    // Afficher un indicateur de chargement
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
    loadingIndicator.innerHTML = '<p>Génération de la heatmap...</p><progress style="width: 100%;"></progress>';
    document.body.appendChild(loadingIndicator);
    
    try {
        // Extraire le titre pour obtenir le texte de recherche
        const titleElement = modal.querySelector('h2');
        // const searchText1 = extractSearchTextFromTitle(titleElement);

        // Créer un élément h2 pour mettre l'ancien titre en français car le extractSearchTextFromTitle travaille sur le français alors que le titleElement = modal.querySelector('h2'); est en multilingue
        const h2Element = document.createElement('h2');
        h2Element.textContent = hiddenFormerFrenchTitle;
        const searchText = extractSearchTextFromTitle(h2Element);

        
        let heatmapData;
        
        if (searchText) {
            // Utiliser les personnes déjà filtrées que nous avons dans la liste
            const filteredPeople = filterPeopleByText(searchText, config);
            
            if (filteredPeople && filteredPeople.length > 0) {
                console.log(`Création de la heatmap pour ${filteredPeople.length} personnes filtrées avec "${searchText}"`);
                
                // Utiliser la fonction qui crée des données de heatmap à partir de personnes spécifiques
                // Cette fonction existe déjà dans geoHeatMapDataProcessor.js sous le nom de updateHeatmapIfVisible
                heatmapData = await createHeatmapDataForPeople(filteredPeople);
            } else {
                console.warn("Aucune personne filtrée trouvée pour", searchText);
                heatmapData = await createDataForHeatMap(config);
            }
        } else {
            // Fallback vers la méthode standard
            heatmapData = await createDataForHeatMap(config);
        }
        
        // Supprimer l'indicateur de chargement
        document.body.removeChild(loadingIndicator);
        
        if (!heatmapData || heatmapData.length === 0) {
            console.error("Aucune donnée géographique disponible");
            alert("Aucune donnée géographique disponible.");
            return null;
        }
        
        // Créer un titre pour la heatmap
        let heatmapTitle = "Heatmap";
        if (titleElement) {
            // Extraire un titre plus propre de l'élément de titre
            const titleText = titleElement.textContent;
            // const match = titleText.match(/^(Personnes.+?)\s*\(\d+\s*personnes\)$/);
            const patterns = {
                'fr': /^(Personnes.+?)\s*\(\d+\s*personnes\)$/,
                'en': /^(People.+?)\s*\(\d+\s*people\)$/,
                'es': /^(Personas.+?)\s*\(\d+\s*personas\)$/,
                'hu': /^(Személyek.+?)\s*\(\d+\s*személy\)$/
            };
            const currentLang = window.CURRENT_LANGUAGE || 'fr';
            const pattern = patterns[currentLang] || patterns['fr'];
            
            const match = titleText.match(pattern);
            if (match && match[1]) {
                heatmapTitle = `Heatmap - ${match[1]}`;
            } else {
                heatmapTitle = `Heatmap - ${titleText}`;
            }
        }
        
        // Utiliser la fonction existante pour créer la heatmap
        createImprovedHeatmap(heatmapData, heatmapTitle);
        
        // Récupérer la référence à la heatmap nouvellement créée
        const heatmapWrapper = document.getElementById('namecloud-heatmap-wrapper');
        if (!heatmapWrapper) {
            console.error("La heatmap n'a pas été créée correctement");
            return null;
        }
        
        // Ajuster la disposition pour le mode écran partagé
        adjustSplitScreenLayout(modal, heatmapWrapper);
        
        return heatmapWrapper;
    } catch (error) {
        console.error("Erreur lors de la création de la heatmap:", error);
        if (document.body.contains(loadingIndicator)) {
            document.body.removeChild(loadingIndicator);
        }
        alert("Erreur lors de la création de la carte: " + error.message);
        return null;
    }
}




/**
 * Ajuste la disposition en mode écran partagé pour la modale et la heatmap
 * @param {HTMLElement} modal - La modale de liste de personnes
 * @param {HTMLElement} heatmapWrapper - Le wrapper de la heatmap
 */
function adjustSplitScreenLayout(modal, heatmapWrapper) {
    
    console.log("Debug  Ajustement de la disposition en mode écran partagé");
    
    modal.setAttribute('data-splitscreen-mode', 'true');
    const isLandscape = window.innerWidth > window.innerHeight;
    
    // Sauvegarder le style original pour restauration ultérieure
    const originalHeatmapStyle = {
        top: heatmapWrapper.style.top || '60px',
        left: heatmapWrapper.style.left || '20px',
        width: heatmapWrapper.style.width || 'calc(100% - 40px)',
        height: heatmapWrapper.style.height || 'calc(100% - 100px)'
    };
    
    modal.dataset.originalHeatmapStyle = JSON.stringify(originalHeatmapStyle);
    
    if (isLandscape) {
        // Mode paysage : heatmap à gauche, liste à droite
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '50%';
        modal.style.width = '48%';
        modal.style.height = '95%';
        const content = modal.querySelector('div');
        if (content) {
            content.style.position = 'relative'; // Au lieu de fixed
            content.style.width = '90%';
            content.style.maxWidth = '95%';
            content.style.height = '90%';
            content.style.maxHeight = '95%';
            content.style.top = '5%';  // Centrer verticalement
            content.style.left = '2%'; // Centrer horizontalement
            content.style.transform = 'none'; // Supprimer le transform qui pourrait interférer
        }


        heatmapWrapper.style.width = '50%';
        heatmapWrapper.style.height = 'calc(100% - 60px)';
        heatmapWrapper.style.left = '0';
        heatmapWrapper.style.top = '60px';
    } else {
        // Mode portrait : heatmap en haut, liste en bas
        // CORRECTION: Ajuster la position de la modale pour qu'elle commence exactement
        // là où se termine la heatmap, en évitant tout chevauchement
        
        const mapHeight = 'calc(50% - 30px)'; // Réduire légèrement la hauteur de la carte
        const modalTop = 'calc(50% - 2px)'; // Début de la modale après la carte
        


        // Ajuster la heatmap
        heatmapWrapper.style.width = '100%';
        heatmapWrapper.style.height = mapHeight;
        heatmapWrapper.style.left = '0';
        heatmapWrapper.style.top = '60px'; // Laisser de l'espace en haut pour les contrôles
        
        // Ajuster la modale
        modal.style.position = 'fixed';
        modal.style.top = modalTop; // Commencer exactement où se termine la carte
        modal.style.left = '0';
        modal.style.width = '90%';
        modal.style.height = 'calc(48% )'; // Augmenter légèrement la hauteur
        // modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
        modal.style.backgroundColor = 'transparent';
        modal.style.pointerEvents = 'none'; // Permet aux clics de passer à travers
        // modal.style.pointerEvents = 'auto'; // Changé de 'none' à 'auto'
        

        // IMPORTANT: Configurer aussi le contenu principal
        const content = modal.querySelector('div'); 
        if (content) {
            content.style.position = 'relative'; // Au lieu de fixed
            content.style.width = '90%';
            content.style.maxWidth = '100%';
            content.style.height = 'calc(100% - 40px)'; // Laisser un peu d'espace
            content.style.maxHeight = '100%';
            content.style.top = '20px';  // Un peu d'espace en haut
            content.style.left = '5%';   // Centrer horizontalement
            content.style.margin = '0 auto'; // Centrage horizontal
            content.style.transform = 'none'; // Supprimer le transform
            content.style.pointerEvents = 'auto'; // S'assurer que les clics fonctionnent
        }


    }
    

    // Attendre que le DOM soit complètement mis à jour avant d'invalider la taille
    setTimeout(() => {
        if (heatmapWrapper && heatmapWrapper.map) {
            // Vérifier que la carte a des dimensions non nulles
            const mapContainer = heatmapWrapper.querySelector('#ancestors-heatmap');
            if (mapContainer && mapContainer.offsetWidth > 0 && mapContainer.offsetHeight > 0) {
                try {
                    // Forcer un recalcul du style avant d'invalider la taille
                    void mapContainer.offsetHeight;
                    
                    // Désactiver l'animation pendant l'invalidation
                    heatmapWrapper.map.invalidateSize({
                        animate: false,
                        pan: false
                    });
                    
                    console.log("Carte redimensionnée avec succès");
                } catch (error) {
                    console.error("Erreur lors de l'invalidation de la taille de la carte:", error);
                }
            } else {
                console.warn("Le conteneur de carte a des dimensions nulles, invalidation ignorée");
            }
        }
    }, 300); // Augmenter le délai à 300ms pour plus de sécurité
}












/**
 * Créer les données de heatmap pour un ensemble spécifique de personnes
 * @param {Array} people - Liste des personnes avec leurs IDs
 * @returns {Promise<Array>} - Données formatées pour la heatmap
 */
async function createHeatmapDataForPeople(people) {
    try {
        // Récupérer les personnes complètes à partir de leurs IDs
        const selectedPersons = people.map(p => state.gedcomData.individuals[p.id])
            .filter(p => p !== undefined);
        
        // Collecter tous les lieux non nettoyés
        const locationData = {};
        const locationDetails = {};
        
        // Traiter chaque personne pour extraire ses lieux
        for (const person of selectedPersons) {
            // Fonction pour ajouter les détails d'un lieu
            const addLocationDetail = (place, type, date) => {
                if (!place || place.trim() === '') return;
                
                if (!locationDetails[place]) {
                    locationDetails[place] = {
                        events: [],
                        families: {}
                    };
                }
                
                // Extraire l'année si disponible
                let year = null;
                if (date) {
                    const match = date.match(/\d{4}/);
                    if (match) {
                        year = match[0];
                    }
                }
                
                // Ajouter l'événement
                locationDetails[place].events.push({
                    type: type,
                    name: person.name.replace(/\//g, '').trim(),
                    year: year
                });
                
                // Ajouter le nom de famille
                const familyName = person.name.split('/')[1]?.trim().toUpperCase();
                if (familyName) {
                    locationDetails[place].families[familyName] = 
                        (locationDetails[place].families[familyName] || 0) + 1;
                }
            };
            
            // Ajouter les détails pour chaque type de lieu
            if (person.birthPlace) addLocationDetail(person.birthPlace, 'Naissance', person.birthDate);
            if (person.deathPlace) addLocationDetail(person.deathPlace, 'Décès', person.deathDate);
            if (person.residPlace1) addLocationDetail(person.residPlace1, 'Résidence', null);
            if (person.residPlace2) addLocationDetail(person.residPlace2, 'Résidence', null);
            if (person.residPlace3) addLocationDetail(person.residPlace3, 'Résidence', null);
            
            // Ajouter les mariages
            if (person.spouseFamilies) {
                for (const famId of person.spouseFamilies) {
                    const family = state.gedcomData.families[famId];
                    if (family && family.marriagePlace) {
                        addLocationDetail(family.marriagePlace, 'Mariage', family.marriageDate);
                    }
                }
            }
            
            // Collecter les lieux pour la densité de la heatmap
            const addLocationCount = (place) => {
                if (place && place.trim() !== '') {
                    locationData[place] = (locationData[place] || 0) + 1;
                }
            };
            
            addLocationCount(person.birthPlace);
            addLocationCount(person.deathPlace);
            addLocationCount(person.residPlace1);
            addLocationCount(person.residPlace2);
            addLocationCount(person.residPlace3);
            
            if (person.spouseFamilies) {
                for (const famId of person.spouseFamilies) {
                    const family = state.gedcomData.families[famId];
                    if (family && family.marriagePlace) {
                        addLocationCount(family.marriagePlace);
                    }
                }
            }
        }

        // Convertir les données de lieu en format pour la heatmap
        const heatmapData = {};
        
        // Géocoder chaque lieu et ajouter les détails
        for (const [place, count] of Object.entries(locationData)) {
            if (!place || place.trim() === '') continue;
            
            try {
                const coords = await geocodeLocation(place);
                
                if (coords) {
                    const key = `${coords.lat.toFixed(2)},${coords.lon.toFixed(2)}`;
                    
                    if (!heatmapData[key]) {
                        heatmapData[key] = {
                            coords: coords,
                            count: 0,
                            families: {},
                            locations: [],
                            placeName: place
                        };
                    }
                    
                    // Ajouter le nombre d'occurrences
                    heatmapData[key].count += count;
                    
                    // Ajouter les détails du lieu si disponibles
                    if (locationDetails[place]) {
                        // Ajouter les événements
                        heatmapData[key].locations.push(...locationDetails[place].events);
                        
                        // Fusionner les compteurs de noms de famille
                        for (const [family, famCount] of Object.entries(locationDetails[place].families)) {
                            heatmapData[key].families[family] = 
                                (heatmapData[key].families[family] || 0) + famCount;
                        }
                    } else {
                        // Fallback si pas de détails
                        heatmapData[key].locations.push({
                            type: 'Lieu',
                            name: place,
                            count: count
                        });
                    }
                }
            } catch (error) {
                console.error(`Erreur de géocodage pour "${place}":`, error);
            }
        }
        
        // Convertir l'objet en tableau
        return Object.values(heatmapData);
    } catch (error) {
        console.error('Erreur lors de la création des données pour la heatmap:', error);
        throw error;
    }
}

export function showPersonActions(person, event) {
    console.log('Showing actions for:', person.name, person.id);

    // Supprimer tout menu contextuel existant
    const existingMenu = document.getElementById('person-actions-menu');
    if (existingMenu) {
        existingMenu.remove();
    }

    const actionsMenu = document.createElement('div');
    actionsMenu.id = 'person-actions-menu';
    actionsMenu.style.position = 'fixed';
    actionsMenu.style.left = `${event.clientX}px`;
    actionsMenu.style.top = `${event.clientY}px`;
    actionsMenu.style.backgroundColor = 'white';
    actionsMenu.style.border = '1px solid #ccc';
    actionsMenu.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    actionsMenu.style.zIndex = '10000';

    const actions = [
        { text: "Voir dans l'arbre", action: () => showInTree(person.id) },
        { text: "Voir la fiche", action: () => showPersonDetails(person.id) },
        { text: "Animation", action: () => startAnimation(person.id) }
    ];

    actions.forEach(action => {
        const actionButton = document.createElement('button');
        actionButton.textContent = action.text;
        actionButton.style.display = 'block';
        actionButton.style.width = '100%';
        actionButton.style.padding = '5px 10px';
        actionButton.style.border = 'none';
        actionButton.style.backgroundColor = 'transparent';
        actionButton.style.textAlign = 'left';
        actionButton.style.cursor = 'pointer';

        actionButton.addEventListener('mouseenter', () => {
            actionButton.style.backgroundColor = '#f0f0f0';
        });

        actionButton.addEventListener('mouseleave', () => {
            actionButton.style.backgroundColor = 'transparent';
        });

        actionButton.addEventListener('click', (e) => {
            e.stopPropagation();
            actionsMenu.remove();
            action.action();
        });

        actionsMenu.appendChild(actionButton);
    });

    document.body.appendChild(actionsMenu);

    // Fermer le menu si on clique ailleurs
    document.addEventListener('click', function closeMenu(e) {
        const menu = document.getElementById('person-actions-menu');
        if (menu && !menu.contains(e.target)) {
            if (menu.parentNode) {
                menu.parentNode.removeChild(menu);
            }
            document.removeEventListener('click', closeMenu);
        }
    });
}

export function showPersonDetails(personId) {
    console.log('Showing details for:', personId);

    if (typeof removeAllStatsElements === 'function') {
        removeAllStatsElements();
    }


    displayPersonDetails(personId);

    const modal = document.querySelector('.modal-container');
    if (modal) {
        modal.remove();
    }
}

export function startAnimation(personId) {
    state.rootPersonId = personId;
    console.log('Starting animation with:', personId);

    if (typeof removeAllStatsElements === 'function') {
        removeAllStatsElements();
    }

    startAncestorAnimation();

    const modal = document.querySelector('.modal-container');
    if (modal) {
        modal.remove();
    }
}

export function showInTree(personId) {
    state.rootPersonId = personId;
    state.treeMode = 'ancestors';
    console.log('Showing in tree:', personId);
    

    if (typeof removeAllStatsElements === 'function') {
        removeAllStatsElements();
    }

    // Vous devrez importer ou définir cette fonction
    import('./treeRenderer.js').then(module => {
        module.drawTree();
    });

    const modal = document.querySelector('.modal-container');
    if (modal) {
        modal.remove();
    }
}


(function initializeGlobalListeners() {
    document.addEventListener('cloudMapRefreshed', (event) => {
        // console.log('CloudMap rafraîchie', event.detail);
        
        const refreshListEvent = new CustomEvent('refreshPersonList', {
            detail: {
                config: event.detail.config,
                timestamp: Date.now()
            }
        });
        document.dispatchEvent(refreshListEvent);
    });
})();


/**
 * Rend une modale déplaçable et redimensionnable - solution simplifiée et stabilisée
 * @param {HTMLElement} modal - L'élément de la modale
 * @param {HTMLElement} handle - L'élément qui sert de poignée pour déplacer la modale (titre)
 */
function makeModalDraggableAndResizable(modal, handle) {
    // 1. Trouver le contenu réel qui doit être redimensionné
    const content = modal.querySelector('div');
    if (!content) return;
    
    // 2. S'assurer que le contenu est correctement positionné
    content.style.position = 'fixed';
    content.style.overflow = 'auto';
    
    
    // 3. Gestion du déplacement
    handle.style.cursor = 'move';
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;
    
    // Démarrer le déplacement (souris)
    handle.addEventListener('mousedown', function(e) {
        if (e.target.id === 'person-list-close-button') return;
        
        const rect = content.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;
        startX = e.clientX;
        startY = e.clientY;
        isDragging = true;
        modal.setAttribute('data-dragging', 'true'); // Ajouter un flag
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        e.preventDefault();
    });
    
    // Démarrer le déplacement (tactile)
    handle.addEventListener('touchstart', function(e) {
        if (e.target.id === 'person-list-close-button') return;
        
        const touch = e.touches[0];
        const rect = content.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;
        startX = touch.clientX;
        startY = touch.clientY;
        isDragging = true;
        
        document.addEventListener('touchmove', onTouchMove, { passive: false });
        document.addEventListener('touchend', onTouchEnd);
        e.preventDefault();
    });
    
    // Déplacer avec la souris
    function onMouseMove(e) {
        if (!isDragging) return;
        
        moveContent(e.clientX, e.clientY);
        e.preventDefault();
    }
    
    // Déplacer avec le toucher
    function onTouchMove(e) {
        if (!isDragging) return;
        
        const touch = e.touches[0];
        moveContent(touch.clientX, touch.clientY);
        e.preventDefault();
    }
    


    function moveContent(clientX, clientY) {
        const dx = clientX - startX;
        const dy = clientY - startY;
        
        // Vérifier le mode splitscreen
        const isSplitscreen = modal.getAttribute('data-splitscreen-mode') === 'true';
        
        // Vérifier le mode de positionnement actuel
        const isRelativePosition = content.style.position === 'relative';
        
        if (isSplitscreen && isRelativePosition) {
            // En mode splitscreen + position relative, utiliser des pourcentages
            const parentRect = modal.getBoundingClientRect();
            const deltaXPercent = (dx / parentRect.width) * 100;
            const deltaYPercent = (dy / parentRect.height) * 100;
            
            // Récupérer les positions actuelles en pourcentage
            let currentLeft = parseFloat(content.style.left) || 0;
            let currentTop = parseFloat(content.style.top) || 0;
            
            // Si la valeur actuelle contient "%", alors on utilise directement la valeur
            if (content.style.left.includes('%')) {
                currentLeft = parseFloat(content.style.left);
            }
            
            if (content.style.top.includes('%')) {
                currentTop = parseFloat(content.style.top);
            }
            
            // Calculer les nouvelles positions en pourcentage
            const newLeft = currentLeft + deltaXPercent;
            const newTop = currentTop + deltaYPercent;
            
            // Limiter entre 0% et 90% pour éviter la sortie complète
            const limitedLeft = Math.max(0, Math.min(90, newLeft)); 
            const limitedTop = Math.max(0, Math.min(90, newTop));
            
            // Appliquer les nouvelles positions
            content.style.left = `${limitedLeft}%`;
            content.style.top = `${limitedTop}%`;
            
            // En mode splitscreen, on met à jour les points de départ
            startX = clientX;
            startY = clientY;
        } else {
            // Mode standard avec position fixed - on garde la logique d'origine
            // IMPORTANT: En mode normal, on ne met PAS à jour startX et startY
            content.style.left = `${initialLeft + dx}px`;
            content.style.top = `${initialTop + dy}px`;
            content.style.transform = 'none';
            
            // Limites d'écran pour position fixed
            const rect = content.getBoundingClientRect();
            if (rect.top < 0) content.style.top = '0px';
            if (rect.left < 0) content.style.left = '0px';
            if (rect.right > window.innerWidth) 
                content.style.left = `${window.innerWidth - rect.width}px`;
            if (rect.bottom > window.innerHeight) 
                content.style.top = `${window.innerHeight - rect.height}px`;
        }
    }

    
    // Arrêter le déplacement (souris)
    function onMouseUp() {
        isDragging = false;
        modal.setAttribute('data-dragging', 'false'); // Réinitialiser le flag
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        
        // Actualiser les poignées
        createResizeHandles();
    }
    
    // Arrêter le déplacement (tactile)
    function onTouchEnd() {
        isDragging = false;
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);
        
        // Actualiser les poignées
        createResizeHandles();
    }
    
    // Gestion du redimensionnement
    function createResizeHandles() {
        // Supprimer les anciennes poignées
        content.querySelectorAll('.resize-handle').forEach(h => h.remove());
    
        // IMPORTANT: Forcer l'initialisation correcte des coordonnées
        const rect = content.getBoundingClientRect();
        
        // Si la position est centrée avec transform, la convertir en coordonnées absolues
        if (content.style.transform && content.style.transform.includes('translate')) {
            // Garder la taille actuelle
            const width = rect.width;
            const height = rect.height;
            
            // Calculer la position absolue
            const left = rect.left;
            const top = rect.top;
            
            // Appliquer les nouvelles coordonnées sans transform
            content.style.left = `${left}px`;
            content.style.top = `${top}px`;
            content.style.transform = 'none';
            
            // S'assurer que la taille reste la même
            content.style.width = `${width}px`;
            content.style.height = `${height}px`;
        }
        
        // Positions des poignées
        const positions = ['e', 'se', 's', 'sw', 'w', 'nw', 'n', 'ne'];
        
        positions.forEach(pos => {
            const handle = document.createElement('div');
            handle.className = `resize-handle resize-${pos}`;
            handle.style.position = 'absolute';
            handle.style.zIndex = '9999';
            handle.style.background = 'transparent'; // Rendre invisible par défaut
            
            // Configurer l'apparence et la position de chaque poignée selon sa position
            switch(pos) {
                case 'e':  // Est (droite)
                    handle.style.right = '0px';
                    handle.style.top = '50%';
                    handle.style.transform = 'translateY(-50%)';
                    handle.style.width = '10px';
                    handle.style.height = '100%';
                    handle.style.cursor = 'ew-resize';
                    break;
                case 'se': // Sud-Est (bas droite)
                    handle.style.right = '0px';
                    handle.style.bottom = '0px';
                    handle.style.width = '30px';
                    handle.style.height = '30px';
                    handle.style.cursor = 'nwse-resize';
                    // Montrer un indicateur visuel uniquement au survol
                    handle.addEventListener('mouseover', () => {
                        handle.style.background = 'linear-gradient(135deg, transparent 70%, rgba(0,0,0,0.3) 30%)';
                    });
                    handle.addEventListener('mouseout', () => {
                        handle.style.background = 'transparent';
                    });
                    break;
                case 's':  // Sud (bas)
                    handle.style.bottom = '0px';
                    handle.style.left = '50%';
                    handle.style.transform = 'translateX(-50%)';
                    handle.style.width = '100%';
                    handle.style.height = '10px';
                    handle.style.cursor = 'ns-resize';
                    break;
                case 'sw': // Sud-Ouest (bas gauche)
                    handle.style.left = '0px';
                    handle.style.bottom = '0px';
                    handle.style.width = '35px';
                    handle.style.height = '35px';
                    handle.style.cursor = 'nesw-resize';
                    // Montrer un indicateur visuel uniquement au survol
                    handle.addEventListener('mouseover', () => {
                        handle.style.background = 'linear-gradient(-135deg, transparent 70%, rgba(0,0,0,0.3) 30%)';
                    });
                    handle.addEventListener('mouseout', () => {
                        handle.style.background = 'transparent';
                    });
                    break;
                case 'w':  // Ouest (gauche)
                    handle.style.left = '0px';
                    handle.style.top = '50%';
                    handle.style.transform = 'translateY(-50%)';
                    handle.style.width = '10px';
                    handle.style.height = '100%';
                    handle.style.cursor = 'ew-resize';
                    break;
                case 'nw': // Nord-Ouest (haut gauche)
                    handle.style.left = '0px';
                    handle.style.top = '0px';
                    handle.style.width = '35px';
                    handle.style.height = '35px';
                    handle.style.cursor = 'nwse-resize';
                    // Montrer un indicateur visuel uniquement au survol
                    handle.addEventListener('mouseover', () => {
                        handle.style.background = 'linear-gradient(-45deg, transparent 70%, rgba(0,0,0,0.3) 30%)';
                    });
                    handle.addEventListener('mouseout', () => {
                        handle.style.background = 'transparent';
                    });
                    break;
                case 'n':  // Nord (haut)
                    handle.style.top = '0px';
                    handle.style.left = '50%';
                    handle.style.transform = 'translateX(-50%)';
                    handle.style.width = '100%';
                    handle.style.height = '10px';
                    handle.style.cursor = 'ns-resize';
                    break;
                case 'ne': // Nord-Est (haut droite)
                    handle.style.right = '0px';
                    handle.style.top = '0px';
                    handle.style.width = '20px';
                    handle.style.height = '20px';
                    handle.style.cursor = 'nesw-resize';
                    // Montrer un indicateur visuel uniquement au survol
                    handle.addEventListener('mouseover', () => {
                        handle.style.background = 'linear-gradient(45deg, transparent 70%, rgba(0,0,0,0.3) 30%)';
                    });
                    handle.addEventListener('mouseout', () => {
                        handle.style.background = 'transparent';
                    });
                    break;
            }
    
            setupResizeHandlers(handle, pos);
            
            // Ajouter la poignée au contenu
            content.appendChild(handle);
        });
    }

    // Fonction pour configurer les gestionnaires d'événements pour chaque poignée
    function setupResizeHandlers(handle, pos) {
        let isResizing = false;
        let resizeStartX, resizeStartY, initialWidth, initialHeight, initialLeft, initialTop;
        
        // Démarrer le redimensionnement (souris)
        handle.addEventListener('mousedown', function(e) {
            if (e.target.id === 'person-list-close-button') return;
            
            e.preventDefault();
            e.stopPropagation();
            
            const rect = content.getBoundingClientRect();
            initialWidth = rect.width;
            initialHeight = rect.height;
            initialLeft = rect.left;
            initialTop = rect.top;
            resizeStartX = e.clientX;
            resizeStartY = e.clientY;
            isResizing = true;
            
            document.addEventListener('mousemove', onResizeMove);
            document.addEventListener('mouseup', onResizeEnd);
        });
        
        // Démarrer le redimensionnement (tactile)
        handle.addEventListener('touchstart', function(e) {
            if (e.target.id === 'person-list-close-button') return;
            
            e.preventDefault();
            e.stopPropagation();
            
            // Rendre la poignée visible lors du toucher en mode tactile
            showResizeHandleVisual(handle, pos);
            
            const touch = e.touches[0];
            const rect = content.getBoundingClientRect();
            initialWidth = rect.width;
            initialHeight = rect.height;
            initialLeft = rect.left;
            initialTop = rect.top;
            resizeStartX = touch.clientX;
            resizeStartY = touch.clientY;
            isResizing = true;
            
            document.addEventListener('touchmove', onResizeTouchMove, { passive: false });
            document.addEventListener('touchend', onResizeEnd);
        });
        
        // Fonction pour afficher la visualisation de la poignée
        function showResizeHandleVisual(handle, pos) {
            // Définir le style de fond selon la position
            switch(pos) {
                case 'se':
                    handle.style.background = 'linear-gradient(135deg, transparent 70%, rgba(0,0,0,0.5) 30%)';
                    break;
                case 'sw':
                    handle.style.background = 'linear-gradient(-135deg, transparent 70%, rgba(0,0,0,0.5) 30%)';
                    break;
                case 'nw':
                    handle.style.background = 'linear-gradient(-45deg, transparent 70%, rgba(0,0,0,0.5) 30%)';
                    break;
                case 'ne':
                    handle.style.background = 'linear-gradient(45deg, transparent 70%, rgba(0,0,0,0.5) 30%)';
                    break;
                case 'e':
                case 'w':
                    handle.style.background = 'rgba(0,0,0,0.2)';
                    break;
                case 'n':
                case 's':
                    handle.style.background = 'rgba(0,0,0,0.2)';
                    break;
            }
            
            // Ajouter un indicateur de curseur visuel pour le tactile
            const cursorIndicator = document.createElement('div');
            cursorIndicator.className = 'touch-cursor-indicator';
            cursorIndicator.style.position = 'absolute';
            cursorIndicator.style.width = '24px';
            cursorIndicator.style.height = '24px';
            cursorIndicator.style.pointerEvents = 'none';
            cursorIndicator.style.zIndex = '10002';
            
            // Définir l'indicateur selon la direction
            if (pos.includes('e') || pos.includes('w')) {
                cursorIndicator.innerHTML = '⟷'; // Indicateur horizontal
            } else if (pos.includes('n') || pos.includes('s')) {
                cursorIndicator.innerHTML = '⟺'; // Indicateur vertical
            } else {
                cursorIndicator.innerHTML = '⤡'; // Indicateur diagonal
            }
            
            // Positionner l'indicateur près de la poignée
            handle.appendChild(cursorIndicator);
            
            // Stocker une référence pour la suppression
            handle._cursorIndicator = cursorIndicator;
        }
        
         // Arrêter le redimensionnement
        function onResizeEnd() {
            isResizing = false;
            document.removeEventListener('mousemove', onResizeMove);
            document.removeEventListener('touchmove', onResizeTouchMove);
            document.removeEventListener('mouseup', onResizeEnd);
            document.removeEventListener('touchend', onResizeEnd);
            
            // Masquer la poignée après le redimensionnement
            handle.style.background = 'transparent';
            
            // Supprimer l'indicateur de curseur
            if (handle._cursorIndicator) {
                handle._cursorIndicator.remove();
                delete handle._cursorIndicator;
            }
        }
        
          // Redimensionner avec la souris
        function onResizeMove(e) {
            if (!isResizing) return;
            
            resizeContent(e.clientX, e.clientY);
            e.preventDefault();
        }
        
        // Redimensionner avec le toucher
        function onResizeTouchMove(e) {
            if (!isResizing) return;
            
            const touch = e.touches[0];
            resizeContent(touch.clientX, touch.clientY);
            e.preventDefault();
        }
        
        // Fonction commune pour redimensionner
        function resizeContent(clientX, clientY) {
            const dx = clientX - resizeStartX;
            const dy = clientY - resizeStartY;
            
            // Valeurs par défaut (pas de changement)
            let newWidth = initialWidth;
            let newHeight = initialHeight;
            let newLeft = initialLeft;
            let newTop = initialTop;
            
            // Redimensionnement horizontal
            if (pos.includes('e')) {
                newWidth = initialWidth + dx;
            } else if (pos.includes('w')) {
                newWidth = initialWidth - dx;
                newLeft = initialLeft + dx;
            }
            
            // Redimensionnement vertical
            if (pos.includes('s')) {
                newHeight = initialHeight + dy;
            } else if (pos.includes('n')) {
                newHeight = initialHeight - dy;
                newTop = initialTop + dy;
            }
            
            // Limites minimales
            const minWidth = 300;
            const minHeight = 200;
            
            // Vérifier le mode splitscreen
            const isSplitscreen = modal.getAttribute('data-splitscreen-mode') === 'true';
            const isRelativePosition = content.style.position === 'relative';
            
            // Gestion différente selon le mode
            if (isSplitscreen && isRelativePosition) {
                // Pour le mode splitscreen, adapter les limites
                // (implementation plus simple car les positions sont déjà relatives)
                if ((pos.includes('w') || pos.includes('e')) && newWidth >= minWidth) {
                    content.style.width = `${newWidth}px`;
                }
                
                if ((pos.includes('n') || pos.includes('s')) && newHeight >= minHeight) {
                    content.style.height = `${newHeight}px`;
                }
            } else {
                // Appliquer les nouvelles dimensions avec limites
                if ((pos.includes('w') || pos.includes('e')) && newWidth >= minWidth) {
                    content.style.width = `${newWidth}px`;
                    if (pos.includes('w')) {
                        content.style.left = `${newLeft}px`;
                    }
                }
                
                if ((pos.includes('n') || pos.includes('s')) && newHeight >= minHeight) {
                    content.style.height = `${newHeight}px`;
                    if (pos.includes('n')) {
                        content.style.top = `${newTop}px`;
                    }
                }
                
                // Assurer que la modale reste dans l'écran
                const rect = content.getBoundingClientRect();
                if (rect.right > window.innerWidth) {
                    content.style.width = `${window.innerWidth - rect.left}px`;
                }
                if (rect.bottom > window.innerHeight) {
                    content.style.height = `${window.innerHeight - rect.top}px`;
                }
                if (rect.left < 0 && pos.includes('w')) {
                    const adjustedWidth = initialWidth + initialLeft;
                    content.style.left = '0px';
                    content.style.width = `${adjustedWidth}px`;
                }
                if (rect.top < 0 && pos.includes('n')) {
                    const adjustedHeight = initialHeight + initialTop;
                    content.style.top = '0px';
                    content.style.height = `${adjustedHeight}px`;
                }
            }
        }

    }


    // 5. Centrer initialement le contenu si nécessaire
    if (!content.style.left || !content.style.top) {
        content.style.left = '50%';
        content.style.top = '50%';
        content.style.transform = 'translate(-50%, -50%)';
    }
    
    // 6. Nettoyer les poignées lors de la fermeture
    const closeButton = document.getElementById('person-list-close-button');
    if (closeButton) {
        const originalOnClick = closeButton.onclick;
        closeButton.onclick = function(e) {
            content.querySelectorAll('.resize-handle').forEach(h => h.remove());
            
            if (originalOnClick) {
                originalOnClick.call(this, e);
            }
        };
    }
    
    // 7. Gestion de la touche Échap
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            content.querySelectorAll('.resize-handle').forEach(h => h.remove());
        }
    });
    
    // 8. Initialiser les poignées
    createResizeHandles();
}



/**
 * Fonction de nettoyage pour supprimer toutes les poignées de redimensionnement
 */
function removeAllResizeHandles() {
    // Nettoyer toutes les poignées individuelles
    document.querySelectorAll('.resize-handle').forEach(handle => {
        if (handle.parentNode) {
            handle.parentNode.removeChild(handle);
        }
    });
    
    // Nettoyer le conteneur de poignées
    const handleContainer = document.getElementById('resize-handles-container');
    if (handleContainer && handleContainer.parentNode) {
        handleContainer.parentNode.removeChild(handleContainer);
    }
    
    // Arrêter tous les observateurs
    document.querySelectorAll('[data-has-observer="true"]').forEach(el => {
        if (el._modalObserver) {
            el._modalObserver.disconnect();
            delete el._modalObserver;
        }
    });
    
    // Supprimer les écouteurs d'événements window si nécessaire
    window.removeEventListener('scroll', updateHandleContainerPosition);
}

// Fonction utilitaire pour mettre à jour la position du conteneur de poignées
function updateHandleContainerPosition() {
    const handleContainer = document.getElementById('resize-handles-container');
    if (!handleContainer) return;
    
    const targetModal = document.querySelector('[data-has-observer="true"]');
    if (targetModal) {
        const rect = targetModal.getBoundingClientRect();
        handleContainer.style.width = `${targetModal.offsetWidth}px`;
        handleContainer.style.height = `${targetModal.offsetHeight}px`;
        handleContainer.style.left = `${rect.left}px`;
        handleContainer.style.top = `${rect.top}px`;
    }
}