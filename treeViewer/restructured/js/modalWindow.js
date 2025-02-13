import { state, displayGenealogicTree } from './main.js';

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

    // Prepare the details content
    let detailsHTML = `
        <div class="details-section">
            <h3>Identité</h3>
            <p><strong>Nom complet :</strong> ${person.name.replace(/\//g, '')}</p>
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