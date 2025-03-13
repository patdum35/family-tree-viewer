import { state, displayGenealogicTree } from './main.js';
import { historicalFigures } from './historicalData.js';
import { extractYear } from './utils.js';
import { geocodeLocation } from './geoLocalisation.js';
import { nameCloudState } from './nameCloud.js';

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
   /*personId - L'identifiant unique de la personne dans state.gedcomData
   */
   /**
   * Affiche une fenêtre modale détaillée pour une personne
   * Version compacte optimisée pour mobile
   * 
   * @param {string} personId - L'identifiant unique de la personne dans state.gedcomData
   */
   
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
   
       // Rendre la modale déplaçable
       setTimeout(() => {
           makeModalDraggable();
       }, 100);
       
       // Définir le contenu et afficher la modale
       detailsContent.innerHTML = detailsHTML;
       modal.style.display = 'block';
       modal.style.left = 'auto';
        modal.style.right = 'auto';
        modal.style.width = 'auto';
        modal.style.maxWidth = '600px';
   
       // Créer la carte avec un petit délai pour assurer que le DOM est prêt
       setTimeout(() => {
           displayEnhancedLocationMap(personId);
       }, 150);
   }
   
   /**
    * Rend la modale déplaçable avec la souris
    */
    // function makeModalDraggable() {
    //     const modal = document.getElementById('person-details-modal');
    //     const modalHeader = modal.querySelector('.modal-header') || modal.querySelector('h3') || modal.firstElementChild;
        
    //     if (!modalHeader) return;
        
    //     // Position initiale
    //     let offsetX = 0, offsetY = 0, initialX = 0, initialY = 0;
        
    //     // Appliquer une position relative au modal s'il est en position statique
    //     if (window.getComputedStyle(modal).position === 'static') {
    //         modal.style.position = 'relative';
    //     }
        
    //     modalHeader.style.cursor = 'move';
    //     modalHeader.addEventListener('mousedown', startDrag);

    //     // Force le positionnement absolu et supprime les contraintes horizontales
    //     modal.style.position = 'absolute';
    //     modal.style.right = 'auto';
    //     modal.style.transform = 'none';
    //     modal.style.margin = '0';
        
    //     function startDrag(e) {
    //         e.preventDefault();
    //         initialX = e.clientX;
    //         initialY = e.clientY;
            
    //         offsetX = modal.offsetLeft;
    //         offsetY = modal.offsetTop;
            
    //         document.addEventListener('mousemove', drag);
    //         document.addEventListener('mouseup', stopDrag);
    //     }
        
    //     function drag(e) {
    //         e.preventDefault();
    //         const dx = e.clientX - initialX;
    //         const dy = e.clientY - initialY;
            
    //         modal.style.left = (offsetX + dx) + 'px';
    //         modal.style.top = (offsetY + dy) + 'px';
    //     }
        
    //     function stopDrag() {
    //         document.removeEventListener('mousemove', drag);
    //         document.removeEventListener('mouseup', stopDrag);
    //     }
    // }



    // function makeModalDraggable() {
    //     const modal = document.getElementById('person-details-modal');
    //     const modalContent = modal.querySelector('.modal-content');
    //     const modalHeader = modal.querySelector('.modal-header');
        
    //     if (!modalHeader || !modalContent) return;
        
    //     // Surcharger les styles CSS qui bloquent le déplacement horizontal
    //     modal.style.position = 'absolute';
    //     modal.style.width = 'auto';
    //     modal.style.maxWidth = '600px';
    //     modal.style.left = '50%';
    //     modal.style.transform = 'translateX(-50%)';
    //     modal.style.right = 'auto';
        
    //     // Centrer initialement puis obtenir une position absolue
    //     setTimeout(() => {
    //         const rect = modal.getBoundingClientRect();
    //         modal.style.left = rect.left + 'px';
    //         modal.style.top = rect.top + 'px';
    //         modal.style.transform = 'none';
            
    //         // Ajouter des poignées de redimensionnement
    //         addResizeHandles(modal);
    //     }, 50);
        
    //     // Configuration du déplacement
    //     let isDragging = false;
    //     let dragStartX, dragStartY, initialLeft, initialTop;
        
    //     modalHeader.style.cursor = 'move';
    //     modalHeader.addEventListener('mousedown', startDrag);
    //     modalHeader.addEventListener('touchstart', handleTouchStart, { passive: false });
        
    //     function startDrag(e) {
    //         e.preventDefault();
    //         isDragging = true;
    //         dragStartX = e.clientX;
    //         dragStartY = e.clientY;
    //         initialLeft = modal.offsetLeft;
    //         initialTop = modal.offsetTop;
            
    //         document.addEventListener('mousemove', drag);
    //         document.addEventListener('mouseup', stopDrag);
    //     }
        
    //     function handleTouchStart(e) {
    //         e.preventDefault();
    //         const touch = e.touches[0];
    //         isDragging = true;
    //         dragStartX = touch.clientX;
    //         dragStartY = touch.clientY;
    //         initialLeft = modal.offsetLeft;
    //         initialTop = modal.offsetTop;
            
    //         document.addEventListener('touchmove', handleTouchMove, { passive: false });
    //         document.addEventListener('touchend', handleTouchEnd);
    //     }
        
    //     function drag(e) {
    //         if (!isDragging) return;
    //         e.preventDefault();
            
    //         const dx = e.clientX - dragStartX;
    //         const dy = e.clientY - dragStartY;
            
    //         modal.style.left = (initialLeft + dx) + 'px';
    //         modal.style.top = (initialTop + dy) + 'px';
    //     }
        
    //     function handleTouchMove(e) {
    //         if (!isDragging) return;
    //         e.preventDefault();
            
    //         const touch = e.touches[0];
    //         const dx = touch.clientX - dragStartX;
    //         const dy = touch.clientY - dragStartY;
            
    //         modal.style.left = (initialLeft + dx) + 'px';
    //         modal.style.top = (initialTop + dy) + 'px';
    //     }
        
    //     function stopDrag() {
    //         isDragging = false;
    //         document.removeEventListener('mousemove', drag);
    //         document.removeEventListener('mouseup', stopDrag);
    //     }
        
    //     function handleTouchEnd() {
    //         isDragging = false;
    //         document.removeEventListener('touchmove', handleTouchMove);
    //         document.removeEventListener('touchend', handleTouchEnd);
    //     }
    // }


    // function makeModalDraggable() {
    //     const modal = document.getElementById('person-details-modal');
        
    //     // Réinitialiser TOUS les styles qui pourraient influencer le positionnement horizontal
    //     const computedStyle = window.getComputedStyle(modal);
    //     const currentWidth = computedStyle.width;
    //     const currentLeft = computedStyle.left;
        
    //     // Supprimer complètement le style actuel
    //     modal.removeAttribute('style');
        
    //     // Reconstruire les styles essentiels
    //     const inlineStyles = `
    //         position: absolute !important;
    //         width: ${parseInt(currentWidth)}px !important;
    //         left: ${parseInt(currentLeft)}px !important;
    //         top: 50px !important;
    //         z-index: 1000 !important;
    //         background-color: transparent !important;
    //         transform: none !important;
    //         margin: 0 !important;
    //         right: auto !important;
    //         bottom: auto !important;
    //         display: block !important;
    //     `;
        
    //     modal.setAttribute('style', inlineStyles);
        
    //     // Configurer le déplacement comme avant mais avec priorité maximale
    //     const modalHeader = modal.querySelector('.modal-header');
    //     if (!modalHeader) return;
        
    //     let isDragging = false;
    //     let startX, startY, startLeft, startTop;
        
    //     modalHeader.style.cursor = 'move';
    //     modalHeader.onmousedown = function(e) {
    //         e.preventDefault();
    //         isDragging = true;
    //         startX = e.clientX;
    //         startY = e.clientY;
    //         startLeft = modal.offsetLeft;
    //         startTop = modal.offsetTop;
            
    //         document.onmousemove = function(e) {
    //             if (!isDragging) return;
    //             e.preventDefault();
                
    //             const dx = e.clientX - startX;
    //             const dy = e.clientY - startY;
                
    //             // Utiliser !important pour forcer la priorité
    //             modal.style.setProperty('left', (startLeft + dx) + 'px', 'important');
    //             modal.style.setProperty('top', (startTop + dy) + 'px', 'important');
    //         };
            
    //         document.onmouseup = function() {
    //             isDragging = false;
    //             document.onmousemove = null;
    //             document.onmouseup = null;
    //         };
    //     };
        
    //     // Ajouter une poignée unique de redimensionnement dans le coin inférieur droit
    //     const resizeHandle = document.createElement('div');
    //     resizeHandle.style.cssText = `
    //         position: absolute !important;
    //         right: 0 !important;
    //         bottom: 0 !important;
    //         width: 20px !important;
    //         height: 20px !important;
    //         cursor: nwse-resize !important;
    //         background: linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.3) 50%) !important;
    //         z-index: 1001 !important;
    //     `;
    //     modal.appendChild(resizeHandle);
        
    //     // Configurer le redimensionnement
    //     let isResizing = false;
    //     let resizeStartX, resizeStartY, resizeStartWidth, resizeStartHeight;
        
    //     resizeHandle.onmousedown = function(e) {
    //         e.preventDefault();
    //         isResizing = true;
    //         resizeStartX = e.clientX;
    //         resizeStartY = e.clientY;
    //         resizeStartWidth = modal.offsetWidth;
    //         resizeStartHeight = modal.offsetHeight;
            
    //         document.onmousemove = function(e) {
    //             if (!isResizing) return;
    //             e.preventDefault();
                
    //             const width = resizeStartWidth + (e.clientX - resizeStartX);
    //             const height = resizeStartHeight + (e.clientY - resizeStartY);
                
    //             if (width > 200) {
    //                 modal.style.setProperty('width', width + 'px', 'important');
    //             }
                
    //             if (height > 150) {
    //                 modal.style.setProperty('height', height + 'px', 'important');
    //             }
    //         };
            
    //         document.onmouseup = function() {
    //             isResizing = false;
    //             document.onmousemove = null;
    //             document.onmouseup = null;
    //         };
    //     };
    // }



    // function makeModalDraggable() {
    //     const modal = document.getElementById('person-details-modal');
    //     const modalContent = modal.querySelector('.modal-content');
    //     const modalHeader = modal.querySelector('.modal-header');
        
    //     if (!modalHeader) return;
        
    //     // Supprimer les contraintes de style qui bloquent le déplacement horizontal
    //     modal.style.setProperty('position', 'absolute', 'important');
    //     modal.style.setProperty('width', 'auto', 'important');
    //     modal.style.setProperty('right', 'auto', 'important');
    //     modal.style.setProperty('bottom', 'auto', 'important');
    //     modal.style.setProperty('transform', 'none', 'important');
    //     modal.style.setProperty('margin', '0', 'important');
    //     modal.style.setProperty('max-width', '80%', 'important');
        
    //     // Configuration du déplacement
    //     let isDragging = false;
    //     let startX, startY, startLeft, startTop;
        
    //     modalHeader.style.cursor = 'move';
    //     modalHeader.onmousedown = function(e) {
    //         // Ne pas capturer les clics sur le bouton de fermeture
    //         if (e.target.className === 'modal-close') return;
            
    //         e.preventDefault();
    //         isDragging = true;
    //         startX = e.clientX;
    //         startY = e.clientY;
    //         startLeft = modal.offsetLeft;
    //         startTop = modal.offsetTop;
            
    //         document.onmousemove = function(e) {
    //             if (!isDragging) return;
    //             e.preventDefault();
                
    //             const dx = e.clientX - startX;
    //             const dy = e.clientY - startY;
                
    //             modal.style.setProperty('left', (startLeft + dx) + 'px', 'important');
    //             modal.style.setProperty('top', (startTop + dy) + 'px', 'important');
    //         };
            
    //         document.onmouseup = function() {
    //             isDragging = false;
    //             document.onmousemove = null;
    //             document.onmouseup = null;
    //         };
    //     };
        
    //     // Ajouter une poignée de redimensionnement visible
    //     addResizeHandle(modal);
    // }

    // function addResizeHandle(modal) {
    //     // Supprimer une poignée existante s'il y en a une
    //     const existingHandle = document.getElementById('modal-resize-handle');
    //     if (existingHandle) {
    //         existingHandle.remove();
    //     }
        
    //     // Créer une nouvelle poignée
    //     const resizeHandle = document.createElement('div');
    //     resizeHandle.id = 'modal-resize-handle';
    //     resizeHandle.style.cssText = `
    //         position: absolute;
    //         right: 0;
    //         bottom: 0;
    //         width: 20px;
    //         height: 20px;
    //         background: linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.5) 50%);
    //         cursor: nwse-resize;
    //         z-index: 1001;
    //         border-radius: 0 0 5px 0;
    //     `;
    //     modal.appendChild(resizeHandle);
        
    //     // Configuration du redimensionnement
    //     let isResizing = false;
    //     let startX, startY, startWidth, startHeight;
        
    //     resizeHandle.onmousedown = function(e) {
    //         e.preventDefault();
    //         e.stopPropagation();
    //         isResizing = true;
    //         startX = e.clientX;
    //         startY = e.clientY;
    //         startWidth = modal.offsetWidth;
    //         startHeight = modal.offsetHeight;
            
    //         document.onmousemove = function(e) {
    //             if (!isResizing) return;
    //             e.preventDefault();
                
    //             const width = startWidth + (e.clientX - startX);
    //             const height = startHeight + (e.clientY - startY);
                
    //             if (width > 200) {
    //                 modal.style.setProperty('width', width + 'px', 'important');
    //             }
                
    //             if (height > 200) {
    //                 modal.style.setProperty('height', height + 'px', 'important');
    //             }
    //         };
            
    //         document.onmouseup = function() {
    //             isResizing = false;
    //             document.onmousemove = null;
    //             document.onmouseup = null;
    //         };
    //     };
    // }








    function makeModalDraggable() {
        const modal = document.getElementById('person-details-modal');
        const modalContent = modal.querySelector('.modal-content');
        const modalHeader = modal.querySelector('.modal-header');
        
        if (!modalHeader) return;
        
        // Supprimer les contraintes de style qui bloquent le déplacement horizontal
        modal.style.setProperty('position', 'absolute', 'important');
        modal.style.setProperty('width', '600px', 'important');  // Largeur fixe initiale
        modal.style.setProperty('height', 'auto', 'important');
        modal.style.setProperty('right', 'auto', 'important');
        modal.style.setProperty('bottom', 'auto', 'important');
        modal.style.setProperty('transform', 'none', 'important');
        modal.style.setProperty('margin', '0', 'important');
        
        // Configuration du déplacement
        let isDragging = false;
        let startX, startY, startLeft, startTop;
        
        modalHeader.style.cursor = 'move';
        modalHeader.onmousedown = function(e) {
            // Ne pas capturer les clics sur le bouton de fermeture
            if (e.target.className === 'modal-close') return;
            
            e.preventDefault();
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = modal.offsetLeft;
            startTop = modal.offsetTop;
            
            document.onmousemove = function(e) {
                if (!isDragging) return;
                e.preventDefault();
                
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                
                modal.style.setProperty('left', (startLeft + dx) + 'px', 'important');
                modal.style.setProperty('top', (startTop + dy) + 'px', 'important');
            };
            
            document.onmouseup = function() {
                isDragging = false;
                document.onmousemove = null;
                document.onmouseup = null;
            };
        };
        
        // Ajouter les poignées de redimensionnement
        addResizeHandles(modal);
    }
    
    function addResizeHandles(modal) {
        // Supprimer des poignées existantes
        const existingHandles = modal.querySelectorAll('.resize-handle');
        existingHandles.forEach(handle => handle.remove());
        
        // Ajouter les nouvelles poignées de redimensionnement
        const positions = ['e', 'se', 's', 'sw', 'w', 'nw', 'n', 'ne'];
        
        positions.forEach(pos => {
            const handle = document.createElement('div');
            handle.className = `resize-handle resize-${pos}`;
            handle.style.position = 'absolute';
            handle.style.zIndex = '1001';
            
            // Configurer l'apparence et la position de chaque poignée
            switch(pos) {
                case 'e':
                    handle.style.right = '0px';
                    handle.style.top = '50%';
                    handle.style.transform = 'translateY(-50%)';
                    handle.style.width = '8px';
                    handle.style.height = '100%';
                    handle.style.cursor = 'ew-resize';
                    break;
                case 'se':
                    handle.style.right = '0px';
                    handle.style.bottom = '0px';
                    handle.style.width = '16px';
                    handle.style.height = '16px';
                    handle.style.cursor = 'nwse-resize';
                    handle.style.background = 'linear-gradient(135deg, transparent 70%, rgba(0,0,0,0.5) 30%)';
                    break;
                case 's':
                    handle.style.bottom = '0px';
                    handle.style.left = '50%';
                    handle.style.transform = 'translateX(-50%)';
                    handle.style.width = '100%';
                    handle.style.height = '8px';
                    handle.style.cursor = 'ns-resize';
                    break;
                case 'sw':
                    handle.style.left = '0px';
                    handle.style.bottom = '0px';
                    handle.style.width = '16px';
                    handle.style.height = '16px';
                    handle.style.cursor = 'nesw-resize';
                    handle.style.background = 'linear-gradient(-135deg, transparent 70%, rgba(0,0,0,0.5) 30%)';
                    break;
                case 'w':
                    handle.style.left = '0px';
                    handle.style.top = '50%';
                    handle.style.transform = 'translateY(-50%)';
                    handle.style.width = '8px';
                    handle.style.height = '100%';
                    handle.style.cursor = 'ew-resize';
                    break;
                case 'nw':
                    handle.style.left = '0px';
                    handle.style.top = '0px';
                    handle.style.width = '16px';
                    handle.style.height = '16px';
                    handle.style.cursor = 'nwse-resize';
                    handle.style.background = 'linear-gradient(45deg, transparent 70%, rgba(0,0,0,0.5) 30%)';
                    break;
                case 'n':
                    handle.style.top = '0px';
                    handle.style.left = '50%';
                    handle.style.transform = 'translateX(-50%)';
                    handle.style.width = '100%';
                    handle.style.height = '8px';
                    handle.style.cursor = 'ns-resize';
                    break;
                case 'ne':
                    handle.style.right = '0px';
                    handle.style.top = '0px';
                    handle.style.width = '16px';
                    handle.style.height = '16px';
                    handle.style.cursor = 'nesw-resize';
                    handle.style.background = 'linear-gradient(-45deg, transparent 70%, rgba(0,0,0,0.5) 30%)';
                    break;
            }
            
            // Pour les poignées invisibles, ajouter une couleur au survol
            if (!['se', 'sw', 'nw', 'ne'].includes(pos)) {
                handle.style.backgroundColor = 'transparent';
                handle.style.transition = 'background-color 0.3s';
                handle.addEventListener('mouseover', () => {
                    handle.style.backgroundColor = 'rgba(0,0,0,0.1)';
                });
                handle.addEventListener('mouseout', () => {
                    handle.style.backgroundColor = 'transparent';
                });
            }
            
            // Configurer le comportement de redimensionnement
            setupResizeEvents(handle, modal, pos);
            
            modal.appendChild(handle);
        });
    }
    
    function setupResizeEvents(handle, modal, pos) {
        let isResizing = false;
        let startX, startY, startWidth, startHeight, startLeft, startTop;
        
        handle.onmousedown = function(e) {
            e.preventDefault();
            e.stopPropagation();
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = modal.offsetWidth;
            startHeight = modal.offsetHeight;
            startLeft = modal.offsetLeft;
            startTop = modal.offsetTop;
            
            document.onmousemove = function(e) {
                if (!isResizing) return;
                e.preventDefault();
                
                // Calcul des nouvelles dimensions et positions
                let newWidth = startWidth;
                let newHeight = startHeight;
                let newLeft = startLeft;
                let newTop = startTop;
                
                // Redimensionnement horizontal
                if (pos.includes('e')) {
                    newWidth = startWidth + (e.clientX - startX);
                } else if (pos.includes('w')) {
                    newWidth = startWidth - (e.clientX - startX);
                    newLeft = startLeft + (e.clientX - startX);
                }
                
                // Redimensionnement vertical
                if (pos.includes('s')) {
                    newHeight = startHeight + (e.clientY - startY);
                } else if (pos.includes('n')) {
                    newHeight = startHeight - (e.clientY - startY);
                    newTop = startTop + (e.clientY - startY);
                }
                
                // Appliquer les nouvelles dimensions avec des limites
                if (newWidth >= 300) {
                    modal.style.setProperty('width', newWidth + 'px', 'important');
                    modal.style.setProperty('left', newLeft + 'px', 'important');
                }
                
                if (newHeight >= 200) {
                    modal.style.setProperty('height', newHeight + 'px', 'important');
                    modal.style.setProperty('top', newTop + 'px', 'important');
                }
            };
            
            document.onmouseup = function() {
                isResizing = false;
                document.onmousemove = null;
                document.onmouseup = null;
            };
        };
    }






    
    // Fonction pour ajouter des poignées de redimensionnement
    // function addResizeHandles(modal) {
    //     const modalContent = modal.querySelector('.modal-content');
        
    //     // Créer les poignées de redimensionnement
    //     const positions = ['se', 'sw', 'ne', 'nw', 'n', 's', 'e', 'w'];
    //     const cursors = {
    //         'se': 'nwse-resize', 'nw': 'nwse-resize',
    //         'ne': 'nesw-resize', 'sw': 'nesw-resize',
    //         'n': 'ns-resize', 's': 'ns-resize',
    //         'e': 'ew-resize', 'w': 'ew-resize'
    //     };
        
    //     positions.forEach(pos => {
    //         const handle = document.createElement('div');
    //         handle.className = `resize-handle resize-${pos}`;
    //         handle.style.position = 'absolute';
    //         handle.style.width = '10px';
    //         handle.style.height = '10px';
    //         handle.style.cursor = cursors[pos];
    //         handle.style.zIndex = '1000';
            
    //         // Positionner la poignée
    //         if (pos.includes('n')) handle.style.top = '0px';
    //         if (pos.includes('s')) handle.style.bottom = '0px';
    //         if (pos.includes('e')) handle.style.right = '0px';
    //         if (pos.includes('w')) handle.style.left = '0px';
            
    //         // Pour les coins, augmenter la taille pour faciliter la prise
    //         if (pos.length === 2) {
    //             handle.style.width = '15px';
    //             handle.style.height = '15px';
    //         }
            
    //         // Ajouter les écouteurs d'événements pour le redimensionnement
    //         setupResizeEvents(handle, modal, pos);
            
    //         modalContent.appendChild(handle);
    //     });
    // }
    
    // function setupResizeEvents(handle, modal, pos) {
    //     let isResizing = false;
    //     let startX, startY, startWidth, startHeight, startLeft, startTop;
        
    //     const startResize = (e) => {
    //         e.preventDefault();
    //         isResizing = true;
            
    //         startX = e.clientX || e.touches[0].clientX;
    //         startY = e.clientY || e.touches[0].clientY;
    //         startWidth = parseInt(document.defaultView.getComputedStyle(modal).width, 10);
    //         startHeight = parseInt(document.defaultView.getComputedStyle(modal).height, 10);
    //         startLeft = modal.offsetLeft;
    //         startTop = modal.offsetTop;
            
    //         document.addEventListener('mousemove', resize);
    //         document.addEventListener('touchmove', resize, { passive: false });
    //         document.addEventListener('mouseup', stopResize);
    //         document.addEventListener('touchend', stopResize);
    //     };
        
    //     const resize = (e) => {
    //         if (!isResizing) return;
    //         e.preventDefault();
            
    //         const clientX = e.clientX || (e.touches && e.touches[0].clientX) || startX;
    //         const clientY = e.clientY || (e.touches && e.touches[0].clientY) || startY;
            
    //         // Calculer les nouvelles dimensions et positions
    //         let newWidth = startWidth;
    //         let newHeight = startHeight;
    //         let newLeft = startLeft;
    //         let newTop = startTop;
            
    //         // Horizontalement
    //         if (pos.includes('e')) {
    //             newWidth = startWidth + clientX - startX;
    //         } else if (pos.includes('w')) {
    //             newWidth = startWidth - (clientX - startX);
    //             newLeft = startLeft + (clientX - startX);
    //         }
            
    //         // Verticalement
    //         if (pos.includes('s')) {
    //             newHeight = startHeight + clientY - startY;
    //         } else if (pos.includes('n')) {
    //             newHeight = startHeight - (clientY - startY);
    //             newTop = startTop + (clientY - startY);
    //         }
            
    //         // Appliquer les nouvelles dimensions et positions
    //         if (newWidth > 200) {
    //             modal.style.width = newWidth + 'px';
    //             modal.style.left = newLeft + 'px';
    //         }
            
    //         if (newHeight > 150) {
    //             modal.style.height = newHeight + 'px';
    //             modal.style.top = newTop + 'px';
    //         }
    //     };
        
    //     const stopResize = () => {
    //         isResizing = false;
    //         document.removeEventListener('mousemove', resize);
    //         document.removeEventListener('touchmove', resize);
    //         document.removeEventListener('mouseup', stopResize);
    //         document.removeEventListener('touchend', stopResize);
    //     };
        
    //     handle.addEventListener('mousedown', startResize);
    //     handle.addEventListener('touchstart', startResize, { passive: false });
    // }

    
   
   /**
    * Affiche une carte améliorée avec les lieux de la personne
    */
   function displayEnhancedLocationMap(personId) {
       const person = state.gedcomData.individuals[personId];
       if (!person) return;
   
       // Collecter les lieux
       const locations = [
           { type: 'Naissance', place: person.birthPlace },
           { type: 'Décès', place: person.deathPlace },
           { type: 'Résidence1', place: person.residPlace1 },
           { type: 'Résidence2', place: person.residPlace2 },
           { type: 'Résidence3', place: person.residPlace3 }
       ];
   
       // Ajouter le lieu de mariage depuis la famille
       if (person.spouseFamilies && person.spouseFamilies.length > 0) {
           const marriageFamily = state.gedcomData.families[person.spouseFamilies[0]];
           if (marriageFamily && marriageFamily.marriagePlace) {
               locations.splice(1, 0, { type: 'Mariage', place: marriageFamily.marriagePlace });
           }
       }
   
       // Filtrer les lieux non-nuls
       const validLocations = locations.filter(loc => loc.place);
   
       // Créer la carte si des lieux sont disponibles
       if (validLocations.length > 0) {
           createEnhancedLocationMap(validLocations);
       }
   }
   
   /**
    * Crée une carte améliorée avec des marqueurs colorés et des icônes
    * @param {Array} locations - Liste des lieux à afficher
    */
   function createEnhancedLocationMap(locations) {
       // Créer un conteneur pour la carte
       const mapContainer = document.createElement('div');
       mapContainer.id = 'multi-location-map';
       mapContainer.style.height = '200px'; // Hauteur encore plus réduite
       mapContainer.style.width = '100%';
       mapContainer.style.borderRadius = '6px';
       mapContainer.style.overflow = 'hidden';
       mapContainer.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12)';
       mapContainer.style.marginBottom = '8px';
   
       // Ajouter le conteneur à la modale
       const detailsContent = document.getElementById('person-details-content');
       detailsContent.insertBefore(mapContainer, detailsContent.firstChild); // Placer la carte en haut
   
       // Initialiser la carte
       const map = L.map('multi-location-map', {
           attributionControl: false, // Masquer l'attribution pour économiser de l'espace
           zoomControl: false // Désactiver les contrôles de zoom pour économiser de l'espace
       }).setView([46.2276, 2.2137], 5);
       
       // Ajouter un petit contrôle de zoom personnalisé
       L.control.zoom({
           position: 'bottomright',
           zoomInTitle: '+',
           zoomOutTitle: '-'
       }).addTo(map);
       
       L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
           attribution: '© OpenStreetMap contributors'
       }).addTo(map);
   
       // Symboles améliorés pour chaque type de lieu avec couleurs plus vives
       const locationSymbols = {
           'Naissance': { emoji: '👶', color: '#1976D2', bgColor: '#E3F2FD' },
           'Mariage': { emoji: '💍', color: '#D81B60', bgColor: '#FCE4EC' },
           'Décès': { emoji: '✝️', color: '#5D4037', bgColor: '#EFEBE9' },
           'Résidence1': { emoji: '🏠', color: '#388E3C', bgColor: '#E8F5E9' },
           'Résidence2': { emoji: '🏠', color: '#388E3C', bgColor: '#E8F5E9' },
           'Résidence3': { emoji: '🏠', color: '#388E3C', bgColor: '#E8F5E9' }
       };
   
       // Stocker les coordonnées pour ajuster la vue
       const coordinates = [];
   
       // Géocoder et placer les marqueurs
       const markerPromises = locations.map(location => {
           return geocodeLocation(location.place).then(coords => {
               if (coords) {
                   coordinates.push([coords.lat, coords.lon]);
   
                   // Obtenir le symbole et la couleur pour ce type de lieu
                   const symbolInfo = locationSymbols[location.type] || { emoji: '📍', color: '#757575', bgColor: '#F5F5F5' };
   
                   // Créer un marqueur personnalisé avec emoji et style amélioré avec taille plus grande
                   const markerIcon = L.divIcon({
                       className: 'custom-marker',
                       html: `<div style="
                           font-size: 28px;
                           display: flex;
                           justify-content: center;
                           align-items: center;
                           width: 40px;
                           height: 40px;
                           background-color: ${symbolInfo.bgColor};
                           color: ${symbolInfo.color};
                           border: 3px solid ${symbolInfo.color};
                           border-radius: 50%;
                           box-shadow: 0 3px 6px rgba(0,0,0,0.3);
                           text-shadow: 0 0 2px white;
                       ">${symbolInfo.emoji}</div>`,
                       iconSize: [40, 40],
                       iconAnchor: [20, 20]
                   });
   
                   // Ajouter le marqueur avec popup amélioré
                   return L.marker([coords.lat, coords.lon], { icon: markerIcon })
                       .addTo(map)
                       .bindPopup(`<div style="font-weight:bold;text-align:center;">${symbolInfo.emoji} ${location.place}</div>`);
               }
               return null;
           });
       });
   
       // Ajuster la vue pour contenir tous les marqueurs
       Promise.all(markerPromises).then(() => {
           if (coordinates.length > 0) {
               if (coordinates.length === 1) {
                   // Si un seul point, zoomer à un niveau fixe
                   map.setView(coordinates[0], 10);
               } else {
                   // Pour plusieurs points, créer des limites
                   const bounds = L.latLngBounds(coordinates);
                   map.fitBounds(bounds, { padding: [20, 20] });
               }
           }
       });
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

function displayLocationPoints(personId) {
    const person = state.gedcomData.individuals[personId];
    if (!person) return;

    // Collecter les lieux
    const locations = [
        { type: 'Naissance', place: person.birthPlace },
        { type: 'Décès', place: person.deathPlace },
        { type: 'Résidence1', place: person.residPlace1 },
        { type: 'Résidence2', place: person.residPlace2 },
        { type: 'Résidence3', place: person.residPlace3 }
    ];


    // Ajouter le lieu de mariage depuis la famille
    if (person.spouseFamilies && person.spouseFamilies.length > 0) {
        const marriageFamily = state.gedcomData.families[person.spouseFamilies[0]];
        if (marriageFamily && marriageFamily.marriagePlace) {
            locations.splice(1, 0, { type: 'Mariage', place: marriageFamily.marriagePlace });
        }
    }


    // Filtrer les lieux non-nuls
    const validLocations = locations.filter(loc => loc.place);

    // Créer la carte si des lieux sont disponibles
    if (validLocations.length > 0) {
        createMultiLocationMap(validLocations);
    }
}

function createMultiLocationMap(locations) {
    // Créer un conteneur pour la carte
    const mapContainer = document.createElement('div');
    mapContainer.id = 'multi-location-map';
    mapContainer.style.height = '300px';
    mapContainer.style.width = '100%';

    // Ajouter le conteneur à la modale
    const detailsContent = document.getElementById('person-details-content');
    detailsContent.appendChild(mapContainer);

    // Initialiser la carte
    const map = L.map('multi-location-map').setView([46.2276, 2.2137], 5);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Symboles pour chaque type de lieu
    const locationSymbols = {
        'Naissance': '🌳', //'👶'
        'Mariage': '❤️', //<span style="color: #FF0000;">🔗</span>', //.'💍'
        'Décès': '✝️', //'✟' //'✟', 
        'Résidence1': '🏠',
        'Résidence2': '🏠',
        'Résidence3': '🏠'
    };

    // Stocker les coordonnées pour ajuster la vue
    const coordinates = [];

    // Géocoder et placer les marqueurs
    const markerPromises = locations.map(location => {
        return geocodeLocation(location.place).then(coords => {
            if (coords) {
                coordinates.push([coords.lat, coords.lon]);

                // Créer un marqueur personnalisé avec emoji
                const markerIcon = L.divIcon({
                    className: 'custom-marker',
                    html: `<div style="font-size: 20px; display: flex; justify-content: center; align-items: center;">
                             ${locationSymbols[location.type]}
                           </div>`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                });

                // Ajouter le marqueur
                return L.marker([coords.lat, coords.lon], { icon: markerIcon })
                    .addTo(map)
                    .bindPopup(`${location.type}: ${location.place}`);
            }
            return null;
        });
    });

    // Ajuster la vue pour contenir tous les marqueurs
    Promise.all(markerPromises).then(() => {
        if (coordinates.length > 0) {
            if (coordinates.length === 1) {
                // Si un seul point, zoomer à un niveau fixe
                map.setView(coordinates[0], 10);
            } else {
                // Calculer les distances entre les points
                const distances = [];
                for (let i = 0; i < coordinates.length; i++) {
                    for (let j = i + 1; j < coordinates.length; j++) {
                        const distance = L.latLng(coordinates[i]).distanceTo(L.latLng(coordinates[j])) / 1000; // en km
                        distances.push(distance);
                    }
                }

                // Trouver la distance maximale
                const maxDistance = Math.max(...distances);

                // Créer un groupe de limites
                const bounds = new L.LatLngBounds(coordinates);
                const center = bounds.getCenter();

                // Définir un niveau de zoom basé sur la distance maximale
                // Limiter le zoom entre 6 et 10
                // const zoom = Math.max(
                //     6, 
                //     Math.min(
                //         10, 
                //         10 - Math.log2(Math.min(maxDistance, 200) / 10)
                //     )
                // );

                const zoom = Math.max(
                    8, 
                    Math.min(
                        11, 
                        11 - Math.log2(Math.min(maxDistance, 200) / 11)
                    )
                );


                // Définir la vue centrée avec un zoom adapté
                map.setView(center, zoom);
            }
        }
    });
}