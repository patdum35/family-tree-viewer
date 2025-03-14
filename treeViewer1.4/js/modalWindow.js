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

    const modalName = document.getElementById('modal-person-name');
    const detailsContent = document.getElementById('person-details-content');
    const modal = document.getElementById('person-details-modal');
    
    // Rendre l'arrière-plan de la modale semi-transparent
    modal.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';

    // Style général pour les conteneurs
    const sectionStyle = `
        <style>
            /* Style pour le modal complètement transparent */
            #person-details-modal {
                background-color: transparent !important;
                width: calc(100% - 20px) !important;
                left: 10px !important;
                right: 10px !important;
            }
            .modal-content {
                background-color: rgba(255, 255, 255, 0.95) !important;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15) !important;
                cursor: move; /* Indiquer que la modale est déplaçable */
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
        modal.style.left = 'auto';
        modal.style.right = 'auto';
        modal.style.width = 'auto';
        modal.style.maxWidth = '600px';
    }

    // Rendre la modale déplaçable
    setTimeout(() => {
        makeModalDraggable();
    }, 100);
    

    // Créer la carte avec un petit délai pour assurer que le DOM est prêt
    setTimeout(() => {
        displayEnhancedLocationMap(personId);
    }, 150);
}
   
   
//Mise à jour de makeModalDraggable pour fonctionner en tactile
function makeModalDraggable() {
    const modal = document.getElementById('person-details-modal');
    const modalHeader = modal.querySelector('.modal-header');
    
    if (!modalHeader) return;
    
    // Supprimer les contraintes de style qui bloquent le déplacement
    modal.style.setProperty('position', 'absolute', 'important');
    
    // Charger la position/taille depuis le stockage si disponible
    if (state.modalSettings && state.modalSettings.personDetailsModal) {
        const settings = state.modalSettings.personDetailsModal;
        if (settings.width) modal.style.setProperty('width', `${settings.width}px`, 'important');
        if (settings.height) modal.style.setProperty('height', `${settings.height}px`, 'important');
        if (settings.left) modal.style.setProperty('left', `${settings.left}px`, 'important');
        if (settings.top) modal.style.setProperty('top', `${settings.top}px`, 'important');
    } else {
        // Valeurs par défaut si aucun paramètre n'est sauvegardé
        modal.style.setProperty('width', '600px', 'important');
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
    const existingHandles = modal.querySelectorAll('.resize-handle');
    existingHandles.forEach(handle => handle.remove());
    
    // Positions des poignées
    const positions = ['e', 'se', 's', 'sw', 'w', 'nw', 'n', 'ne'];
    
    positions.forEach(pos => {
        const handle = document.createElement('div');
        handle.className = `resize-handle resize-${pos}`;
        handle.style.position = 'absolute';
        handle.style.zIndex = '1001';
        
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
                handle.style.width = '20px';
                handle.style.height = '20px';
                handle.style.cursor = 'nwse-resize';
                handle.style.background = 'linear-gradient(135deg, transparent 70%, rgba(0,0,0,0.5) 30%)';
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
                handle.style.width = '20px';
                handle.style.height = '20px';
                handle.style.cursor = 'nesw-resize';
                handle.style.background = 'linear-gradient(-135deg, transparent 70%, rgba(0,0,0,0.5) 30%)';
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
                handle.style.width = '20px';
                handle.style.height = '20px';
                handle.style.cursor = 'nwse-resize';
                handle.style.background = 'linear-gradient(-45deg, transparent 70%, rgba(0,0,0,0.5) 30%)';
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
                handle.style.background = 'linear-gradient(45deg, transparent 70%, rgba(0,0,0,0.5) 30%)';
                break;
        }
        
        // Pour les poignées invisibles (haut, bas, gauche, droite), ajouter une couleur au survol
        if (!['se', 'sw', 'nw', 'ne'].includes(pos)) {
            handle.style.backgroundColor = 'rgba(0,0,0,0.05)';
            handle.style.transition = 'background-color 0.3s';
            handle.style.touchAction = 'none'; // Empêcher le scroll en tactile
            
            handle.addEventListener('mouseover', () => {
                handle.style.backgroundColor = 'rgba(0,0,0,0.2)';
            });
            
            handle.addEventListener('mouseout', () => {
                handle.style.backgroundColor = 'rgba(0,0,0,0.05)';
            });
        }
        
        // Configurer les événements de redimensionnement avec support tactile
        setupResizeEvents(handle, modal, pos);
        
        modal.appendChild(handle);
    });
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
        startResize(touch.clientX, touch.clientY);
        
        document.addEventListener('touchmove', resizeWithTouch);
        document.addEventListener('touchend', stopResize);
        document.addEventListener('touchcancel', stopResize);
    });
    
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
        
        // Redimensionnement horizontal
        if (pos.includes('e')) {
            newWidth = startWidth + (clientX - startX);
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
        if (newWidth >= 300) {
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
        attribution: false
    });
}