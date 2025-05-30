import { state, displayGenealogicTree } from './main.js';
import { historicalFigures } from './historicalData.js';
import { extractYear } from './utils.js';
import { geocodeLocation } from './geoLocalisation.js';
import { nameCloudState } from './nameCloud.js';
import { createEnhancedMarkerIcon, fitMapToMarkers, locationSymbols, collectPersonLocations, createLocationMap } from './mapUtils.js';

/**
* Affiche une fenêtre modale détaillée pour une personne
* Version améliorée de afficherDetails() avec plus de fonctionnalités et un meilleur formatage
* 
* @param {string} personId - L'identifiant unique de la personne dans state.gedcomData
* 
* Affiche dans des sections distinctes :
* - Identité : Nom complet formaté
* - Naissance : Date et lieu (si disponibles)
* - Décès : Date et lieu (si disponibles)
* - Profession (si disponible)
* - Notes : Formatées avec paragraphes (si disponibles)
* - Sources : Avec liens cliquables pour les URLs (si disponibles)
* - Actions : Bouton pour définir la personne comme racine de l'arbre
* 
* Particularités :
* - Transforme automatiquement les URLs en liens cliquables dans les sources
* - N'affiche que les sections contenant des informations
* - Permet de définir la personne comme nouveau point de départ de l'arbre
* - Utilise un style moderne avec des sections distinctes et colorées
*/


/**
* Affiche une fenêtre modale détaillée pour une personne
* Version compacte optimisée pour mobile
* 
* @param string/**
    * Traite un lieu pour supprimer "France" à la fin s'il est présent
    * @param {string} place - Le lieu à traiter
    * @returns {string} - Le lieu sans "France" à la fin
    */
function cleanupPlace(place) {
    if (!place) return '';
    
    // Supprimer ", France" ou variations à la fin
    return place.replace(/,\s*(France|FRANCE|france)$/i, '');
} 

/**
* Formate une date GEDCOM en français
* @param {string} dateStr - Date au format GEDCOM
* @returns {string} - Date formatée en français
*/
function formatGedcomDate(dateStr) {
    if (!dateStr) return '';
    
    // Table de conversion des mois en anglais vers français (5 lettres)
    const monthsMap = {
        'JAN': 'janvier',
        'FEB': 'février',
        'MAR': 'mars',
        'APR': 'avril',
        'MAY': 'mai',
        'JUN': 'juin',
        'JUL': 'juillet',
        'AUG': 'août',
        'SEP': 'septem',
        'OCT': 'octob',
        'NOV': 'novem',
        'DEC': 'décem'
    };
    
    // Table de conversion des préfixes et modificateurs GEDCOM
    const prefixMap = {
        'ABT': 'vers',
        'ABOUT': 'vers',
        'BEF': 'avant',
        'BEFORE': 'avant',
        'AFT': 'après',
        'AFTER': 'après',
        'BET': 'entre',
        'BETWEEN': 'entre',
        'AND': 'et',
        'FROM': 'de',
        'TO': 'à',
        'EST': 'estimé',
        'ESTIMATED': 'estimé',
        'CAL': 'calculé',
        'CALCULATED': 'calculé'
    };
    
    // Remplacer les préfixes
    let formattedDate = dateStr;
    
    // Traiter les préfixes
    Object.entries(prefixMap).forEach(([gedcomPrefix, frenchPrefix]) => {
        const regExp = new RegExp(`^${gedcomPrefix}\\s+`, 'i');
        formattedDate = formattedDate.replace(regExp, `${frenchPrefix} `);
    });
    
    // Remplacer "AND" à l'intérieur de la chaîne (pour les périodes "BETWEEN x AND y")
    formattedDate = formattedDate.replace(/\sAND\s/i, ' et ');
    
    // Remplacer les mois en anglais par leurs équivalents français
    Object.entries(monthsMap).forEach(([englishMonth, frenchMonth]) => {
        const regExp = new RegExp(`\\b${englishMonth}\\b`, 'gi');
        formattedDate = formattedDate.replace(regExp, frenchMonth);
    });
    
    return formattedDate;
}


export function displayPersonDetails(personId) {
    console.log("Affichage des détails de la personne :", personId);
    
    const person = state.gedcomData.individuals[personId];
    if (!person) return;

    // Ajouter un style pour personnaliser les ascenseurs
    const style = document.createElement("style");
    
    if (state.isTouchDevice) {
        // Sur les appareils tactiles, masquer complètement les scrollbars mais garder la fonctionnalité
        style.textContent = `
            /* Masquer les scrollbars sur les appareils tactiles tout en gardant la fonctionnalité */
            .modal-person-name {
                -ms-overflow-style: none;  /* IE et Edge */
                scrollbar-width: none;  /* Firefox */
            }
            .modal-person-name::-webkit-scrollbar {
                display: none; /* Chrome, Safari et Opera */
            }
        `;
    } else {
        // Style standard pour les ascenseurs sur les appareils non-tactiles
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
        `;
    }
    
    // Ajouter le style au document
    document.head.appendChild(style);

//     // Le reste de votre code continue ici...

// export function displayPersonDetails(personId) {
//     console.log("Affichage des détails de la personne :", personId);
    
//     const person = state.gedcomData.individuals[personId];
//     if (!person) return;



//     // Ajouter un style pour personnaliser les ascenseurs
//     const style = document.createElement("style");
//     style.textContent = `
//         .custom-modal::-webkit-scrollbar {
//             width: 10px;
//             height: 10px;
//         }

//         .custom-modal::-webkit-scrollbar-button {
//             height: 0px;
//             width: 0px;
//             display: none;
//         }

//         .custom-modal::-webkit-scrollbar-thumb {
//             background-color: #888;
//             border-radius: 6px; 
//             border: 3px solid transparent;
//             }

//         .custom-modal::-webkit-scrollbar-track {
//             background-color: #f1f1f1;
//             border-radius: 4px;
//             margin: 30px;
//         }
//     `;
    // Ajouter le style au document
    document.head.appendChild(style);




    const modalName = document.getElementById('modal-person-name');
    const detailsContent = document.getElementById('person-details-content');
    const modal = document.getElementById('person-details-modal');
    
    modal.className = `modal-person-name custom-modal`;

    // Rendre l'arrière-plan de la modale semi-transparent
    modal.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';

    // Style général pour les conteneurs
    const sectionStyle = `
        <style>
        /* Style unifié pour le modal */
            #person-details-modal {
                background-color: rgba(255, 255, 255, 0.95) !important;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15) !important;
                border-radius: 8px !important;
                position: absolute !important;
                overflow: auto !important;
                max-width: calc(100% - 20px) !important;
                max-height: calc(100% - 50px) !important;
                /*left: 10px !important; */
            }
            
            .modal-content {
                background-color: transparent !important;
                box-shadow: none !important;
                width: 100% !important;
                max-width: 100% !important;
                overflow: visible !important;
                padding: 10px !important;
                margin: 0 !important;
                box-sizing: border-box !important;
            }
            
            #person-details-content {
                width: 100% !important;
                max-width: 100% !important;
            }
            /* Réduire la hauteur du bandeau titre */
            #modal-person-name {
                font-size: ${nameCloudState && nameCloudState.mobilePhone ? '14px' : '16px'};
                padding: 6px !important;
                margin: 0 !important;
                line-height: 1.2 !important;
            }
            .modal-header {
                padding: 4px !important;
                min-height: unset !important;
                background-color: rgba(248, 249, 250, 0.95) !important;
                border-bottom: 1px solid rgba(0, 0, 0, 0.1) !important;

                /* Rendre l'en-tête fixe */
                position: sticky !important;
                top: 0 !important;
                z-index: 1001 !important;
                width: 100% !important;
                
                /* Ajouter une ombre pour démarcation visuelle */
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
            }
            .details-section {
                margin-bottom: 6px;
                padding: 6px;
                border-radius: 6px;
                font-size: ${nameCloudState && nameCloudState.mobilePhone ? '11px' : '13px'};
                background-color: rgba(255, 255, 255, 0.7);
                backdrop-filter: blur(3px);
            }
            .details-icon {
                font-size: 1.8em;
                vertical-align: middle;
                margin-right: 4px;
            }
            .details-value {
                display: inline-block;
            }
            .details-section.birth { background-color: #E3F2FD; }
            .details-section.death { background-color: #EFEBE9; }
            .details-section.marriage { background-color: #F8BBD0; }
            .details-section.residence { background-color: #E8F5E9; }
            .details-section.notes { background-color: #FFF8E1; }
            .details-section.sources { background-color: #F3E5F5; font-size: 85%; }
            .details-section.context { background-color: #E0F2F1; }
            .details-section.actions { background-color: #ECEFF1; text-align: center; }
            .set-root-btn {
                background-color: #4361ee;
                color: white;
                border: none;
                padding: 5px 10px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
                margin-top: 2px;
            }
            .sources-link {
                color: #3f51b5;
                text-decoration: underline;
                font-size: 80%;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                display: inline-block;
                max-width: 100%;
            }
        </style>
    `;




    // Nettoyer l'ID en retirant les @ s'ils existent
    const cleanId = personId.replace(/@/g, '');

    // Set the name in the modal header (with reduced size)
    modalName.textContent = person.name.replace(/\//g, '');

    // Préparer le contenu HTML
    let detailsHTML = sectionStyle;

    // Identifiant GEDCOM
    detailsHTML += `
        <div class="details-section">
            <small>ID GEDCOM: ${cleanId}</small>
        </div>
    `;

    // Profession (si existante)
    if (person.occupation) {
        detailsHTML += `
            <div class="details-section">
                <span class="details-icon">💼</span>
                <span class="details-value">${person.occupation}</span>
            </div>
        `;
    }

    // Naissance (si date ou lieu existants)
    if (person.birthDate || person.birthPlace) {
        detailsHTML += `
            <div class="details-section birth">
                <span class="details-icon">👶</span>
                ${person.birthDate ? `<span class="details-value">${formatGedcomDate(person.birthDate)}</span>` : ''}
                ${person.birthDate && person.birthPlace ? '<br>' : ''}
                ${person.birthPlace ? `<span class="details-value">${cleanupPlace(person.birthPlace)}</span>` : ''}
            </div>
        `;
    }

    // Mariage (si date ou lieu existants)
    if (person.spouseFamilies && person.spouseFamilies.length > 0) {
        const marriageFamily = state.gedcomData.families[person.spouseFamilies[0]];
        if (marriageFamily && (marriageFamily.marriageDate || marriageFamily.marriagePlace)) {
            detailsHTML += `
                <div class="details-section marriage">
                    <span class="details-icon">💍</span>
                    ${marriageFamily.marriageDate ? `<span class="details-value">${formatGedcomDate(marriageFamily.marriageDate)}</span>` : ''}
                    ${marriageFamily.marriageDate && marriageFamily.marriagePlace ? '<br>' : ''}
                    ${marriageFamily.marriagePlace ? `<span class="details-value">${cleanupPlace(marriageFamily.marriagePlace)}</span>` : ''}
                </div>
            `;
        }
    }

    // Décès (si date ou lieu existants)
    if (person.deathDate || person.deathPlace) {
        detailsHTML += `
            <div class="details-section death">
                <span class="details-icon">✝️</span>
                ${person.deathDate ? `<span class="details-value">${formatGedcomDate(person.deathDate)}</span>` : ''}
                ${person.deathDate && person.deathPlace ? '<br>' : ''}
                ${person.deathPlace ? `<span class="details-value">${cleanupPlace(person.deathPlace)}</span>` : ''}
            </div>
        `;
    }

    // Résidences (regroupées dans une seule section)
    const residences = [];
    if (person.residPlace1 || person.residDate1) residences.push({ place: person.residPlace1, date: person.residDate1 });
    if (person.residPlace2 || person.residDate2) residences.push({ place: person.residPlace2, date: person.residDate2 });
    if (person.residPlace3 || person.residDate3) residences.push({ place: person.residPlace3, date: person.residDate3 });

    if (residences.length > 0) {
        detailsHTML += `<div class="details-section residence"><span class="details-icon">🏠</span>`;
        residences.forEach((residence, index) => {
            if (residence.date || residence.place) {
                detailsHTML += `
                    ${index > 0 ? '<hr style="border-top: 1px dashed #aaa; margin: 2px 0;">' : ''}
                    ${residence.date ? `<span class="details-value">${formatGedcomDate(residence.date)}</span>` : ''}
                    ${residence.date && residence.place ? '<br>' : ''}
                    ${residence.place ? `<span class="details-value">${cleanupPlace(residence.place)}</span>` : ''}
                `;
            }
        });
        detailsHTML += `</div>`;
    }

    // Notes (si disponibles)
    if (person.notes && person.notes.length > 0) {
        const validNotes = person.notes
            .map(noteRef => {
                const note = state.gedcomData.notes[noteRef];
                return note && note.text && note.text.trim() !== '' ? note.text.trim() : null;
            })
            .filter(note => note !== null);

        if (validNotes.length > 0) {
            detailsHTML += `
                <div class="details-section notes">
                    <small>${validNotes.map(noteText => `<p>${noteText}</p>`).join('')}</small>
                </div>
            `;
        }
    }

    // Sources (si disponibles, format compact)
    if (person.sources && person.sources.length > 0) {
        const validSources = person.sources
            .map(sourceRef => {
                const source = state.gedcomData.sources[sourceRef];
                return source && source.text && source.text.trim() !== '' ? source.text.trim() : null;
            })
            .filter(source => source !== null);

        if (validSources.length > 0) {
            detailsHTML += `
                <div class="details-section sources">
                    <span class="details-label">Sources :</span>
                    ${validSources.map(sourceText => `<div class="sources-link">${extractAndLinkUrls(sourceText)}</div>`).join('')}
                </div>
            `;
        }
    }

    // Contexte historique (format condensé)
    const historicalContext = findContextualHistoricalFigures(personId);
    if (historicalContext) {
        let contextHTML = '<div class="details-section context">';
        contextHTML += '<small>Contexte historique :</small><br>';
        
        // Fonction pour formater chaque contexte de manière compacte avec emoji
        const formatContext = (context, eventEmoji) => {
            if (!context) return '';
            
            let result = '';
            if (context.governmentType || (context.rulers && context.rulers.length > 0)) {
                result += `<small><b>Au moment de ${eventEmoji}:</b> `;
                
                // Ajouter les dirigeants
                if (context.rulers && context.rulers.length > 0) {
                    const rulerNames = context.rulers.map(ruler => 
                        `${ruler.name} (${ruler.type})`
                    ).join(', ');
                    result += rulerNames;
                }
                
                // Ajouter le type de gouvernement
                if (context.governmentType) {
                    if (context.rulers && context.rulers.length > 0) result += ' - ';
                    result += context.governmentType.type;
                }
                
                result += '</small><br>';
            }
            return result;
        };
        
        // Ajouter chaque contexte avec emoji correspondant
        contextHTML += formatContext(historicalContext.birthContext, '👶');
        contextHTML += formatContext(historicalContext.marriageContext, '💍');
        contextHTML += formatContext(historicalContext.deathContext, '✝️');
        
        contextHTML += '</div>';
        
        if (contextHTML.includes('<b>')) { // Vérifier qu'il y a du contenu
            detailsHTML += contextHTML;
        }
    }

    // Ajouter un bouton pour définir comme racine de l'arbre
    detailsHTML += `
        <div class="details-section actions">
            <button onclick="setAsRootPerson('${personId}')" class="set-root-btn">
                Définir comme point de départ de l'arbre
            </button>
        </div>
    `;


    // Définir le contenu et afficher la modale
    detailsContent.innerHTML = detailsHTML;
    modal.style.display = 'block';

    // Position initiale centrée si pas de position sauvegardée
    if (!state.modalSettings || !state.modalSettings.personDetailsModal) {
        // Définir d'abord les dimensions
        const modalWidth = Math.min(600, window.innerWidth - 20); // Largeur initiale de 600px maximum
        modal.style.width = `${modalWidth}px`;
        modal.style.maxWidth = `${window.innerWidth - 20}px`;
        modal.style.maxHeight = `${window.innerHeight - 50}px`;
        
        // Centrer horizontalement
        modal.style.left = `${(window.innerWidth - modalWidth) / 2}px`;
        modal.style.right = 'auto';
        
        // Centrer verticalement (optionnel)
        const modalHeight = Math.min(400, window.innerHeight - 50); // Hauteur initiale estimée
        modal.style.top = `${(window.innerHeight - modalHeight) / 2}px`;
    }
    // Rendre la modale déplaçable et resizable
    setTimeout(() => {
        makeModalDraggable();
    }, 100);
    

    // Ajouter cet écouteur d'événement pour le resize de l'écran
    window.addEventListener('resize', adjustModalOnResize);


    // Créer la carte avec un petit délai pour assurer que le DOM est prêt
    setTimeout(() => {
        displayEnhancedLocationMap(personId);
    }, 150);
}
   
   

// makeModalDraggable pour fonctionner en tactile    
function makeModalDraggable() {
    const modal = document.getElementById('person-details-modal');
    const modalHeader = modal.querySelector('.modal-header');
    const modalContent = modal.querySelector('.modal-content');
    const detailsContent = document.getElementById('person-details-content');
    
    if (!modalHeader) return;
    
    // Supprimer les contraintes de style qui bloquent le déplacement
    modal.style.setProperty('position', 'absolute', 'important');
    
    // Forcer le contenu à occuper tout l'espace disponible
    modal.style.setProperty('overflow', 'auto', 'important');
    modal.style.setProperty('background-color', 'rgba(255, 255, 255, 0.95)', 'important');
    modal.style.setProperty('box-shadow', '0 4px 15px rgba(0, 0, 0, 0.15)', 'important');
    modal.style.setProperty('border-radius', '8px', 'important');
    
    // Supprimer toutes les limitations de largeur sur le contenu
    modalContent.style.setProperty('width', '100%', 'important');
    modalContent.style.setProperty('max-width', '100%', 'important');
    modalContent.style.setProperty('overflow', 'visible', 'important');
    modalContent.style.setProperty('box-sizing', 'border-box', 'important');
    modalContent.style.setProperty('margin', '0', 'important');
    modalContent.style.setProperty('padding', '10px', 'important');
    
    // S'assurer que le contenu des détails s'adapte également
    detailsContent.style.setProperty('width', '100%', 'important');
    detailsContent.style.setProperty('max-width', '100%', 'important');
    
    // Récupérer les limites max de l'écran
    const maxAvailableWidth = window.innerWidth - 20;
    const maxAvailableHeight = window.innerHeight - 50;
    
    // Charger la position/taille depuis le stockage si disponible
    if (state.modalSettings && state.modalSettings.personDetailsModal) {
        const settings = state.modalSettings.personDetailsModal;
        // Limiter la largeur/hauteur au maximum disponible
        const width = Math.min(settings.width || 600, maxAvailableWidth);
        const height = Math.min(settings.height || 'auto', maxAvailableHeight);
        
        modal.style.setProperty('width', `${width}px`, 'important');
        if (height !== 'auto') modal.style.setProperty('height', `${height}px`, 'important');
        if (settings.left) modal.style.setProperty('left', `${settings.left}px`, 'important');
        if (settings.top) modal.style.setProperty('top', `${settings.top}px`, 'important');
    } else {
        // Valeurs par défaut si aucun paramètre n'est sauvegardé
        modal.style.setProperty('width', `${Math.min(600, maxAvailableWidth)}px`, 'important');
        modal.style.setProperty('height', 'auto', 'important');
    }
    
    // Autres styles nécessaires
    modal.style.setProperty('right', 'auto', 'important');
    modal.style.setProperty('bottom', 'auto', 'important');
    modal.style.setProperty('transform', 'none', 'important');
    modal.style.setProperty('margin', '0', 'important');
    





    // Variables pour le tracking
    let isDragging = false;
    let startX, startY, startLeft, startTop;
    
    modalHeader.style.cursor = 'move';
    
    // === ÉVÉNEMENTS SOURIS ===
    modalHeader.addEventListener('mousedown', function(e) {
        // Ne pas capturer les clics sur le bouton de fermeture
        if (e.target.className === 'modal-close') return;
        
        e.preventDefault();
        startDrag(e.clientX, e.clientY);
        
        document.addEventListener('mousemove', dragWithMouse);
        document.addEventListener('mouseup', stopDrag);
    });
    
    // === ÉVÉNEMENTS TACTILES ===
    modalHeader.addEventListener('touchstart', function(e) {
        // Ne pas capturer les touches sur le bouton de fermeture
        if (e.target.className === 'modal-close') return;
        
        // Empêcher le scroll de la page lors du déplacement
        e.preventDefault();
        
        const touch = e.touches[0];
        startDrag(touch.clientX, touch.clientY);
        
        document.addEventListener('touchmove', dragWithTouch);
        document.addEventListener('touchend', stopDrag);
        document.addEventListener('touchcancel', stopDrag);
    });
    
    // Fonction commune pour démarrer le déplacement
    function startDrag(x, y) {
        isDragging = true;
        startX = x;
        startY = y;
        startLeft = parseInt(window.getComputedStyle(modal).left) || 0;
        startTop = parseInt(window.getComputedStyle(modal).top) || 0;
    }
    
    // Fonction pour le déplacement avec la souris
    function dragWithMouse(e) {
        if (!isDragging) return;
        
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        
        updatePosition(dx, dy);
    }
    
    // Fonction pour le déplacement avec le toucher
    function dragWithTouch(e) {
        if (!isDragging) return;
        
        // Empêcher le scroll de la page
        e.preventDefault();
        
        const touch = e.touches[0];
        const dx = touch.clientX - startX;
        const dy = touch.clientY - startY;
        
        updatePosition(dx, dy);
    }
    
    // Mise à jour de la position
    function updatePosition(dx, dy) {
        const newLeft = startLeft + dx;
        const newTop = startTop + dy;
        
        modal.style.setProperty('left', `${newLeft}px`, 'important');
        modal.style.setProperty('top', `${newTop}px`, 'important');
    }
    
    // Fonction pour arrêter le déplacement
    function stopDrag() {
        if (isDragging) {
            isDragging = false;
            
            // Sauvegarder la position actuelle
            saveModalSettings();
            
            // Supprimer les écouteurs d'événements
            document.removeEventListener('mousemove', dragWithMouse);
            document.removeEventListener('touchmove', dragWithTouch);
            document.removeEventListener('mouseup', stopDrag);
            document.removeEventListener('touchend', stopDrag);
            document.removeEventListener('touchcancel', stopDrag);
        }
    }
    
    // Ajouter les poignées de redimensionnement avec support tactile
    addResizeHandles(modal);
}

// Mise à jour de addResizeHandles pour fonctionner avec les événements tactiles
function addResizeHandles(modal) {
    // Supprimer des poignées existantes
    const existingHandles = document.querySelectorAll('.resize-handle');
    existingHandles.forEach(handle => handle.remove());
    
    // Positions des poignées
    const positions = ['e', 'se', 's', 'sw', 'w', 'nw', 'n', 'ne'];
    
    // Créer un conteneur spécifique pour les poignées qui reste fixe
    // lors du défilement du contenu
    let handleContainer = document.getElementById('resize-handles-container');
    if (!handleContainer) {
        handleContainer = document.createElement('div');
        handleContainer.id = 'resize-handles-container';
        handleContainer.style.position = 'absolute';
        handleContainer.style.top = '0';
        handleContainer.style.left = '0';
        handleContainer.style.right = '0';
        handleContainer.style.bottom = '0';
        handleContainer.style.pointerEvents = 'none'; // Permets les clics à travers
        handleContainer.style.zIndex = '1000';
        
        // Ajouter le conteneur au document BODY plutôt qu'à la modale
        document.body.appendChild(handleContainer);
    }
    
    // Ajuster le conteneur pour qu'il couvre exactement la modale
    const modalRect = modal.getBoundingClientRect();
    handleContainer.style.width = `${modal.offsetWidth}px`;
    handleContainer.style.height = `${modal.offsetHeight}px`;
    handleContainer.style.left = `${modalRect.left}px`;
    handleContainer.style.top = `${modalRect.top}px`;
    
    // positions.forEach(pos => {
    //     const handle = document.createElement('div');
    //     handle.className = `resize-handle resize-${pos}`;
    //     handle.style.position = 'absolute';
    //     handle.style.zIndex = '1001';
    //     handle.style.pointerEvents = 'auto'; // Cette poignée capturera les événements
        
    //     // Configurer l'apparence et la position de chaque poignée selon sa position
    //     switch(pos) {
    //         case 'e':  // Est (droite)
    //             handle.style.right = '0px';
    //             handle.style.top = '50%';
    //             handle.style.transform = 'translateY(-50%)';
    //             handle.style.width = '10px';
    //             handle.style.height = '100%';
    //             handle.style.cursor = 'ew-resize';
    //             break;
    //         case 'se': // Sud-Est (bas droite)
    //             handle.style.right = '0px';
    //             handle.style.bottom = '0px';
    //             handle.style.width = '25px';
    //             handle.style.height = '25px';
    //             handle.style.cursor = 'nwse-resize';
    //             handle.style.background = 'linear-gradient(135deg, transparent 70%, rgba(0,0,0,0.5) 30%)';
    //             break;
    //             case 's':  // Sud (bas)
    //             handle.style.bottom = '0px';
    //             handle.style.left = '50%';
    //             handle.style.transform = 'translateX(-50%)';
    //             handle.style.width = '100%';
    //             handle.style.height = '10px';
    //             handle.style.cursor = 'ns-resize';
    //             break;
    //         case 'sw': // Sud-Ouest (bas gauche)
    //             handle.style.left = '0px';
    //             handle.style.bottom = '0px';
    //             handle.style.width = '25px';
    //             handle.style.height = '25px';
    //             handle.style.cursor = 'nesw-resize';
    //             handle.style.background = 'linear-gradient(-135deg, transparent 70%, rgba(0,0,0,0.5) 30%)';
    //             break;
    //         case 'w':  // Ouest (gauche)
    //             handle.style.left = '0px';
    //             handle.style.top = '50%';
    //             handle.style.transform = 'translateY(-50%)';
    //             handle.style.width = '10px';
    //             handle.style.height = '100%';
    //             handle.style.cursor = 'ew-resize';
    //             break;
    //         case 'nw': // Nord-Ouest (haut gauche)
    //             handle.style.left = '0px';
    //             handle.style.top = '0px';
    //             handle.style.width = '25px';
    //             handle.style.height = '25px';
    //             handle.style.cursor = 'nwse-resize';
    //             handle.style.background = 'linear-gradient(-45deg, transparent 70%, rgba(0,0,0,0.5) 30%)';
    //             break;
    //         case 'n':  // Nord (haut)
    //             handle.style.top = '0px';
    //             handle.style.left = '50%';
    //             handle.style.transform = 'translateX(-50%)';
    //             handle.style.width = '100%';
    //             handle.style.height = '10px';
    //             handle.style.cursor = 'ns-resize';
    //             break;
    //         case 'ne': // Nord-Est (haut droite)
    //             handle.style.right = '0px';
    //             handle.style.top = '0px';
    //             handle.style.width = '25px';
    //             handle.style.height = '25px';
    //             handle.style.cursor = 'nesw-resize';
    //             handle.style.background = 'linear-gradient(45deg, transparent 70%, rgba(0,0,0,0.5) 30%)';
    //             break;
    //     }
        
    //     // Configurer les événements de redimensionnement pour cette poignée
    //     setupResizeEvents(handle, modal, pos, handleContainer);
        
    //     // Ajouter la poignée au conteneur fixe, pas à la modale scrollable
    //     handleContainer.appendChild(handle);
    // });
    
    

    positions.forEach(pos => {
        const handle = document.createElement('div');
        handle.className = `resize-handle resize-${pos}`;
        handle.style.position = 'absolute';
        handle.style.zIndex = '1001';
        handle.style.pointerEvents = 'auto';
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
                handle.style.width = '25px';
                handle.style.height = '25px';
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
                handle.style.width = '25px';
                handle.style.height = '25px';
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
                handle.style.width = '25px';
                handle.style.height = '25px';
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
                handle.style.width = '25px';
                handle.style.height = '25px';
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
        // Configurer les événements de redimensionnement pour cette poignée
        setupResizeEvents(handle, modal, pos, handleContainer);
        
        // Ajouter la poignée au conteneur fixe, pas à la modale scrollable
        handleContainer.appendChild(handle);
    });
    

    
    
    
    
    
    
    
    // Mettre à jour la position du conteneur de poignées quand la modale bouge
    const updateHandleContainer = () => {
        if (handleContainer && modal.style.display !== 'none') {
            const rect = modal.getBoundingClientRect();
            handleContainer.style.width = `${modal.offsetWidth}px`;
            handleContainer.style.height = `${modal.offsetHeight}px`;
            handleContainer.style.left = `${rect.left}px`;
            handleContainer.style.top = `${rect.top}px`;
        }
    };
    
    // Observer les changements de position/taille de la modale
    const modalObserver = new MutationObserver(updateHandleContainer);
    modalObserver.observe(modal, { attributes: true, attributeFilter: ['style'] });
    
    // Et aussi mettre à jour lors du défilement
    window.addEventListener('scroll', updateHandleContainer);
    modal.addEventListener('scroll', updateHandleContainer);
    
    // Stocker les références pour le nettoyage
    modal._handleContainer = handleContainer;
    modal._modalObserver = modalObserver;

    // Ajout d'un délai pour s'assurer que la modale est complètement rendue
    setTimeout(() => {
        // Recalculer la position et la taille du conteneur de poignées
        const updatedRect = modal.getBoundingClientRect();
        handleContainer.style.width = `${modal.offsetWidth}px`;
        handleContainer.style.height = `${modal.offsetHeight}px`;
        handleContainer.style.left = `${updatedRect.left}px`;
        handleContainer.style.top = `${updatedRect.top}px`;
    }, 50);  // Un petit délai de 50ms devrait suffire


}



//Configuration des événements de redimensionnement pour la souris et le tactile
function setupResizeEvents(handle, modal, pos) {
    let isResizing = false;
    let startX, startY, startWidth, startHeight, startLeft, startTop;
    
    // === ÉVÉNEMENTS SOURIS ===
    handle.addEventListener('mousedown', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        startResize(e.clientX, e.clientY);
        
        document.addEventListener('mousemove', resizeWithMouse);
        document.addEventListener('mouseup', stopResize);
    });
    
    // === ÉVÉNEMENTS TACTILES ===
    handle.addEventListener('touchstart', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const touch = e.touches[0];
        
        // Rendre la poignée visible lors du toucher en mode tactile
        showResizeHandleVisual(handle, pos);

        startResize(touch.clientX, touch.clientY);
        
        document.addEventListener('touchmove', resizeWithTouch);
        document.addEventListener('touchend', stopResize);
        document.addEventListener('touchcancel', stopResize);
    });
    
     // Fonction pour poignées visiable pendant ele resiz
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
            
    // Fonction commune pour démarrer le redimensionnement
    function startResize(x, y) {
        isResizing = true;
        startX = x;
        startY = y;
        startWidth = modal.offsetWidth;
        startHeight = modal.offsetHeight;
        startLeft = parseInt(window.getComputedStyle(modal).left) || 0;
        startTop = parseInt(window.getComputedStyle(modal).top) || 0;
    }
    
    // Fonction pour le redimensionnement avec la souris
    function resizeWithMouse(e) {
        if (!isResizing) return;
        
        e.preventDefault();
        handleResize(e.clientX, e.clientY);
    }
    
    // Fonction pour le redimensionnement avec le toucher
    function resizeWithTouch(e) {
        if (!isResizing) return;
        
        e.preventDefault();
        
        const touch = e.touches[0];
        handleResize(touch.clientX, touch.clientY);
    }
    
    // Traitement du redimensionnement
    function handleResize(clientX, clientY) {
        // Calcul des nouvelles dimensions et positions
        let newWidth = startWidth;
        let newHeight = startHeight;
        let newLeft = startLeft;
        let newTop = startTop;
        
        // Obtenir la largeur maximale de la modale
        const maxModalWidth = parseInt(window.innerWidth - 10);
        
        // Redimensionnement horizontal
        if (pos.includes('e')) {
            newWidth = startWidth + (clientX - startX);
            // Limiter à la largeur maximale
            if (newWidth > maxModalWidth) {
                newWidth = maxModalWidth;
            }
        } else if (pos.includes('w')) {
            newWidth = startWidth - (clientX - startX);
            newLeft = startLeft + (clientX - startX);
        }
        
        // Redimensionnement vertical
        if (pos.includes('s')) {
            newHeight = startHeight + (clientY - startY);
        } else if (pos.includes('n')) {
            newHeight = startHeight - (clientY - startY);
            newTop = startTop + (clientY - startY);
        }
        
        // Appliquer les nouvelles dimensions avec limites min.
        if (newWidth >= 300 && newWidth <= maxModalWidth) {
            modal.style.setProperty('width', `${newWidth}px`, 'important');
            modal.style.setProperty('left', `${newLeft}px`, 'important');
        }
        
        if (newHeight >= 200) {
            modal.style.setProperty('height', `${newHeight}px`, 'important');
            modal.style.setProperty('top', `${newTop}px`, 'important');
        }
    }
    
    // Arrêter le redimensionnement
    function stopResize() {
        if (isResizing) {
            isResizing = false;
            
            // Sauvegarder les nouvelles dimensions
            saveModalSettings();
            
            // Supprimer les écouteurs d'événements
            document.removeEventListener('mousemove', resizeWithMouse);
            document.removeEventListener('touchmove', resizeWithTouch);
            document.removeEventListener('mouseup', stopResize);
            document.removeEventListener('touchend', stopResize);
            document.removeEventListener('touchcancel', stopResize);
            
            // Masquer la poignée après le redimensionnement
            handle.style.background = 'transparent';
            
            // Supprimer l'indicateur de curseur
            if (handle._cursorIndicator) {
                handle._cursorIndicator.remove();
                delete handle._cursorIndicator;
            }
        }
    }
}





// Ajouter cette fonction à la fin du fichier
function adjustModalOnResize() {
    const modal = document.getElementById('person-details-modal');
    if (modal && modal.style.display === 'block') {
        // Limiter la largeur et la hauteur au maximum disponible avec marge de 10px
        const maxAvailableWidth = window.innerWidth - 10;
        const maxAvailableHeight = window.innerHeight - 50;
        const currentWidth = parseInt(modal.style.width);
        const currentHeight = parseInt(modal.style.height);
        
        // Si la largeur actuelle dépasse l'espace disponible, réduire
        if (currentWidth > maxAvailableWidth) {
            modal.style.width = `${maxAvailableWidth}px`;
            
            // S'assurer que la modale reste visible dans la fenêtre
            const currentLeft = parseInt(modal.style.left);
            if (currentLeft + currentWidth > window.innerWidth) {
                modal.style.left = `${window.innerWidth - currentWidth - 5}px`;
            }
            
            // Mettre à jour les paramètres sauvegardés
            if (state.modalSettings && state.modalSettings.personDetailsModal) {
                state.modalSettings.personDetailsModal.width = maxAvailableWidth;
            }
        }
        // Si la hauteur actuelle dépasse l'espace disponible, réduire
        if (currentHeight > maxAvailableHeight) {
            modal.style.height = `${maxAvailableHeight}px`;
            
            // S'assurer que la modale reste visible dans la fenêtre
            const currentTop= parseInt(modal.style.top);
            if (currentTop + currentHeight > window.innerHeight) {
                modal.style.top = `${window.innerHeight - currentHeight - 5}px`;
            }
            
            // Mettre à jour les paramètres sauvegardés
            if (state.modalSettings && state.modalSettings.personDetailsModal) {
                state.modalSettings.personDetailsModal.height = maxAvailableHeight;
            }
        }

    }
}

// Fonction pour sauvegarder les paramètres de la modal
function saveModalSettings() {
    const modal = document.getElementById('person-details-modal');
    if (!modal) return;
    
    // Initialiser l'objet modalSettings s'il n'existe pas
    if (!state.modalSettings) {
        state.modalSettings = {};
    }
    
    // Sauvegarder les paramètres actuels
    state.modalSettings.personDetailsModal = {
        width: parseInt(window.getComputedStyle(modal).width),
        height: parseInt(window.getComputedStyle(modal).height),
        left: parseInt(window.getComputedStyle(modal).left),
        top: parseInt(window.getComputedStyle(modal).top)
    };
    
    console.log('Modal settings saved:', state.modalSettings.personDetailsModal);
}

/**
* Transforme les URLs en liens cliquables
* @private
*/
function extractAndLinkUrls(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
        return `<a href="${url}" target="_blank" style="color: #3f51b5; text-decoration: underline; font-size: 90%;">${url}</a>`;
    });
}

/**
 * Ferme la fenêtre modale des détails
 */
export function closePersonDetails() {
    const modal = document.getElementById('person-details-modal');

    // Nettoyer les observateurs et le conteneur de poignées
    if (modal._modalObserver) {
        modal._modalObserver.disconnect();
        delete modal._modalObserver;
    }
    
    // Nettoyer le conteneur de poignées spécifique à la modale
    if (modal._handleContainer) {
        if (document.body.contains(modal._handleContainer)) {
            document.body.removeChild(modal._handleContainer);
        }
        delete modal._handleContainer;
    }

    // Nettoyer TOUS les conteneurs de poignées par sécurité
    const allHandleContainers = document.querySelectorAll('#resize-handles-container');
    allHandleContainers.forEach(container => {
        if (document.body.contains(container)) {
            document.body.removeChild(container);
        }
    });

    // Nettoyer également toutes les poignées individuelles qui pourraient rester
    const allHandles = document.querySelectorAll('.resize-handle');
    allHandles.forEach(handle => {
        if (handle.parentNode) {
            handle.parentNode.removeChild(handle);
        }
    });

    // Supprimer l'écouteur d'événement resize
    window.removeEventListener('resize', adjustModalOnResize);

    modal.style.display = 'none';
}

/**
 * Ferme la fenêtre modale classique
 */
export function closeModal() {
    document.getElementById('myModal').style.display = "none";
}

/**
 * Définit une personne comme racine de l'arbre
 */
export function setAsRootPerson(personId) {
    console.log("Définition de la personne comme racine :", personId);
    
    // Fermer la modale
    document.getElementById('person-details-modal').style.display = 'none';
    
    // Redessiner l'arbre avec cette personne comme point de départ
    displayGenealogicTree(personId, true);
}

export function findContextualHistoricalFigures(personId) {
    const person = state.gedcomData.individuals[personId];
    
    if (!person) return null;

    const context = {
        birthContext: null,
        marriageContext: null,
        deathContext: null
    };

    // Contexte à la naissance
    if (person.birthDate) {
        const birthYear = extractYear(person.birthDate);
        if (birthYear) {
            context.birthContext = historicalFigures.findRulersForYear(birthYear);
        }
    }

    // Contexte au mariage
    if (person.spouseFamilies && person.spouseFamilies.length > 0) {
        const marriageYears = person.spouseFamilies
            .map(familyId => {
                const family = state.gedcomData.families[familyId];
                return family && family.marriageDate ? extractYear(family.marriageDate) : null;
            })
            .filter(year => year !== null);

        if (marriageYears.length > 0) {
            // Prendre la première année de mariage
            context.marriageContext = historicalFigures.findRulersForYear(marriageYears[0]);
        }
    }

    // Contexte au décès
    if (person.deathDate) {
        const deathYear = extractYear(person.deathDate);
        if (deathYear) {
            context.deathContext = historicalFigures.findRulersForYear(deathYear);
        }
    }

    return context;
}

function displayEnhancedLocationMap(personId) {
    const person = state.gedcomData.individuals[personId];
    if (!person) return;

    // Collecter les lieux avec la fonction centralisée
    const locations = collectPersonLocations(person, state.gedcomData.families);

    // Créer la carte si des lieux sont disponibles
    if (locations.length > 0) {
        createEnhancedLocationMap(locations);
    }
}

function createEnhancedLocationMap(locations) {
    // Créer un conteneur pour la carte
    const mapContainer = document.createElement('div');
    mapContainer.id = 'multi-location-map';
    mapContainer.style.height = '200px';
    mapContainer.style.width = '100%';
    mapContainer.style.borderRadius = '6px';
    mapContainer.style.overflow = 'hidden';
    mapContainer.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12)';
    mapContainer.style.marginBottom = '8px';

    // Ajouter le conteneur à la modale
    const detailsContent = document.getElementById('person-details-content');
    detailsContent.insertBefore(mapContainer, detailsContent.firstChild);

    // Utiliser la fonction centralisée pour créer la carte
    createLocationMap('multi-location-map', locations, {
        maxZoom: 9,
        zoomControl: false,
        attribution: false,
        useLocalTiles: true 
    });
}