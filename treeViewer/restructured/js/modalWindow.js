import { state, displayGenealogicTree } from './main.js';
import { historicalFigures } from './historicalData.js';
import { extractYear } from './utils.js';

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





 


export function displayPersonDetails(personId) {
    const person = state.gedcomData.individuals[personId];
    if (!person) return;

    const modalName = document.getElementById('modal-person-name');
    const detailsContent = document.getElementById('person-details-content');
    const modal = document.getElementById('person-details-modal');

    // Ajouter un bouton pour définir comme racine de l'arbre
    let actionHTML = `
        <div class="details-section">
            <h3>Actions</h3>
            <button onclick="setAsRootPerson('${personId}')" class="set-root-btn">
                Définir comme point de départ de l'arbre
            </button>
        </div>
    `;

    // Set the name in the modal header
    modalName.textContent = person.name.replace(/\//g, '');

    // Nettoyer l'ID en retirant les @ s'ils existent
    const cleanId = personId.replace(/@/g, '');


    // Prepare the details content
    let detailsHTML = `
        <div class="details-section">
            <h3>Identité</h3>
            <p><strong>Nom complet :</strong> ${person.name.replace(/\//g, '')}</p>
            <p><strong>Identifiant :</strong> ${cleanId}</p>
        </div>
    `;

    // Add birth details only if they exist
    if (person.birthDate || person.birthPlace) {
        detailsHTML += `
            <div class="details-section">
                <h3>Naissance</h3>
                ${person.birthDate ? `<p><strong>Date :</strong> ${person.birthDate}</p>` : ''}
                ${person.birthPlace ? `<p><strong>Lieu :</strong> ${person.birthPlace}</p>` : ''}
            </div>
        `;
    }

    // Add death details only if they exist
    if (person.deathDate || person.deathPlace) {
        detailsHTML += `
            <div class="details-section">
                <h3>Décès</h3>
                ${person.deathDate ? `<p><strong>Date :</strong> ${person.deathDate}</p>` : ''}
                ${person.deathPlace ? `<p><strong>Lieu :</strong> ${person.deathPlace}</p>` : ''}
            </div>
        `;
    }

    // Add profession only if it exists
    if (person.occupation) {
        detailsHTML += `
            <div class="details-section">
                <h3>Profession</h3>
                <p>${person.occupation}</p>
            </div>
        `;
    }

    // Add notes if available and text is not empty
    if (person.notes && person.notes.length > 0) {
        const validNotes = person.notes
            .map(noteRef => {
                const note = state.gedcomData.notes[noteRef];
                return note && note.text && note.text.trim() !== '' ? note.text.trim() : null;
            })
            .filter(note => note !== null);

        if (validNotes.length > 0) {
            detailsHTML += `
                <div class="details-section">
                    <h3>Notes</h3>
                    ${validNotes.map(noteText => `<p>${noteText}</p>`).join('')}
                </div>
            `;
        }
    }

    // Add sources if available and text is not empty
    if (person.sources && person.sources.length > 0) {
        const validSources = person.sources
            .map(sourceRef => {
                const source = state.gedcomData.sources[sourceRef];
                return source && source.text && source.text.trim() !== '' ? source.text.trim() : null;
            })
            .filter(source => source !== null);

        if (validSources.length > 0) {
            detailsHTML += `
                <div class="details-section">
                    <h3>Sources</h3>
                    ${validSources.map(sourceText => `<p>${extractAndLinkUrls(sourceText)}</p>`).join('')}
                </div>
            `;
        }
    }




   // Rechercher le contexte historique
   const historicalContext = findContextualHistoricalFigures(personId);
    
   if (historicalContext) {
        let contextHTML = '<div class="details-section">';
        contextHTML += '<h3>Contexte historique</h3>';
        
        // Contexte à la naissance
        if (historicalContext.birthContext) {
            contextHTML += '<p><strong>Au moment de la naissance :</strong></p>';
            
            if (historicalContext.birthContext.governmentType) {
                contextHTML += `<p>Type de gouvernement : ${historicalContext.birthContext.governmentType.type}</p>`;
            }
            
            if (historicalContext.birthContext.rulers && historicalContext.birthContext.rulers.length > 0) {
                const rulerNames = historicalContext.birthContext.rulers.map(ruler => 
                    `${ruler.name} (${ruler.type})`
                ).join(', ');
                
                contextHTML += `<p>Dirigeant(s) : ${rulerNames}</p>`;
            }
        }

        // Contexte au mariage
        if (historicalContext.marriageContext) {
            contextHTML += '<p><strong>Au moment du mariage :</strong></p>';
            
            if (historicalContext.marriageContext.governmentType) {
                contextHTML += `<p>Type de gouvernement : ${historicalContext.marriageContext.governmentType.type}</p>`;
            }
            
            if (historicalContext.marriageContext.rulers && historicalContext.marriageContext.rulers.length > 0) {
                const rulerNames = historicalContext.marriageContext.rulers.map(ruler => 
                    `${ruler.name} (${ruler.type})`
                ).join(', ');
                
                contextHTML += `<p>Dirigeant(s) : ${rulerNames}</p>`;
            }
        }

        // Contexte au décès
        if (historicalContext.deathContext) {
            contextHTML += '<p><strong>Au moment du décès :</strong></p>';
            
            if (historicalContext.deathContext.governmentType) {
                contextHTML += `<p>Type de gouvernement : ${historicalContext.deathContext.governmentType.type}</p>`;
            }
            
            if (historicalContext.deathContext.rulers && historicalContext.deathContext.rulers.length > 0) {
                const rulerNames = historicalContext.deathContext.rulers.map(ruler => 
                    `${ruler.name} (${ruler.type})`
                ).join(', ');
                
                contextHTML += `<p>Dirigeant(s) : ${rulerNames}</p>`;
            }
        }
        
        contextHTML += '</div>';
        
        // Ajouter au contenu de la modale
        detailsHTML += contextHTML;
    }

    // Ajouter la carte si un lieu de naissance est disponible
    // if (person.birthPlace) {
    //     let contextHTML = '<div class="details-section">';
    //     contextHTML += '<h3>Lieu de naissance</h3>';
    //     contextHTML += `<p>${person.birthPlace}</p>`;
    //     contextHTML += '</div>';
    //     detailsHTML += contextHTML;

    //     // Ajouter la carte après l'affichage des détails
    //     setTimeout(() => {
    //         displayBirthLocationMap(person.birthPlace);
    //     }, 100);
    // }
    let locationToDisplay = person.birthPlace || 
                            (person.spouseFamilies && 
                             person.spouseFamilies.length > 0 && 
                             state.gedcomData.families[person.spouseFamilies[0]].marriagePlace) || 
                            person.deathPlace;

    console.log('Lieu trouvé:', locationToDisplay);

    if (locationToDisplay) {
        let contextHTML = '<div class="details-section">';
        contextHTML += '<h3>Lieu</h3>';
        contextHTML += `<p>${locationToDisplay}</p>`;
        contextHTML += '</div>';
        detailsHTML += contextHTML;

        // Ajouter la carte après l'affichage des détails
        setTimeout(() => {
            displayBirthLocationMap(locationToDisplay);
        }, 100);
    }

    detailsHTML += actionHTML;

    // Set the content and display the modal
    detailsContent.innerHTML = detailsHTML;
    modal.style.display = 'block';
}

/**
 * Transforme les URLs en liens cliquables
 * @private
 */
function extractAndLinkUrls(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
        return `<a href="${url}" target="_blank" style="color: blue; text-decoration: underline;">${url}</a>`;
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

export async function geocodeLocation(location) {
    try {
        // Utiliser l'API de Nominatim (OpenStreetMap)
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`);
        const data = await response.json();
        
        if (data && data.length > 0) {
            // Retourner les coordonnées du premier résultat
            return {
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon)
            };
        }
        return null;
    } catch (error) {
        console.error('Erreur de géocodage:', error);
        return null;
    }
}

function displayBirthLocationMap(location) {

    console.log('Tentative de géocodage pour:', location);

    // Créer un conteneur pour la carte dans la modale
    const mapContainer = document.createElement('div');
    mapContainer.id = 'birth-location-map';
    mapContainer.style.height = '300px';
    mapContainer.style.width = '100%';

    // Ajouter le conteneur de carte à la modale
    const detailsContent = document.getElementById('person-details-content');
    detailsContent.appendChild(mapContainer);

    // Géocoder et afficher la carte
    geocodeLocation(location).then(coords => {
        console.log('Résultat du géocodage:', coords);
        if (coords) {
            // Initialiser la carte
            const map = L.map('birth-location-map').setView([coords.lat, coords.lon], 10);
            
            // Ajouter la couche de tuiles OpenStreetMap
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            // Ajouter un marqueur
            L.marker([coords.lat, coords.lon]).addTo(map)
                .bindPopup(location)
                .openPopup();
        } else {
            console.error('Erreur complète lors du géocodage:', error);
            mapContainer.innerHTML = `<p>Impossible de localiser ${location}</p>`;
        }
    });
}