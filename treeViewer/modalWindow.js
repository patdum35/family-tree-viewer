// Fonction pour afficher les détails de la fiche GEDCOM
function afficherDetails(personneId) {
    // Récupérer les informations de la fiche GEDCOM 
    const personne = gedcomData[personneId];
    if (personne) {
        document.getElementById('modal-name').innerText = personne.name;
        document.getElementById('modal-occupation').innerText = personne.occupation;
        document.getElementById('modal-birth').innerText = `${personne.birthDate} ${personne.birthPlace}`;
        document.getElementById('modal-death').innerText = `${personne.deathDate} ${personne.deathPlace}`;
        document.getElementById('modal-marriage').innerText = `${personne.marriageDate} ${personne.marriagePlace}`;
        document.getElementById('modal-notes').innerText = personne.notes;
        document.getElementById('modal-sources').innerText = personne.sources;

        // Afficher la fenêtre modale
        document.getElementById('myModal').style.display = "block";
    }
}

function displayPersonDetails(personId) {
    // console.log("DEBUG: displayPersonDetails appelée avec l'ID :", personId);
    // console.log("DEBUG: globalGedcomData :", globalGedcomData);

    const person = globalGedcomData.individuals[personId];
    if (!person) return;

    const modalName = document.getElementById('modal-person-name');
    const detailsContent = document.getElementById('person-details-content');
    const modal = document.getElementById('person-details-modal');

    // Fonction pour transformer les URLs en liens cliquables
    function extractAndLinkUrls(text) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, function(url) {
            return `<a href="${url}" target="_blank" style="color: blue; text-decoration: underline;">${url}</a>`;
        });
    }


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
                const note = globalGedcomData.notes[noteRef];
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
                const source = globalGedcomData.sources[sourceRef];
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

function extractAndLinkUrls(text) {
    // Expression régulière pour trouver les URL
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    // Remplacer les URL par des liens cliquables
    return text.replace(urlRegex, function(url) {
        return `<a href="${url}" target="_blank" style="color: blue; text-decoration: underline;">${url}</a>`;
    });
}

function closePersonDetails() {
    const modal = document.getElementById('person-details-modal');
    modal.style.display = 'none';
}

// Fermer la fenêtre modale
function closeModal() {
    document.getElementById('myModal').style.display = "none";
}