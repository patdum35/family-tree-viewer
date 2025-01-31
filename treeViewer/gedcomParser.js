// Fonction pour charger le fichier de l'arbre GEDCOM compressé et crypté pour le parser
function parseGEDCOM(gedcomText) {
    const individuals = {};
    const families = {};
    const notes = {};
    const sources = {};
    const lines = gedcomText.split(/\r?\n/);
    let currentEntity = null;
    let currentNoteCounter = 1;
    let currentSourceCounter = 1;

    for (const line of lines) {
        const match = line.match(/^\s*(\d+)\s+(@\w+@)?\s*(\w+)?\s*(.*)?$/);
        if (!match) continue;

        const [_, level, id, tag, data] = match;

        if (level === "0" && id) {
            if (tag === "INDI") {
                individuals[id] = { 
                    id, 
                    name: "", 
                    birthDate: "", 
                    deathDate: "",
                    occupation: "",
                    families: [],
                    notes: [],
                    sources: []
                };
                currentEntity = individuals[id];
            } else if (tag === "FAM") {
                families[id] = { 
                    id, 
                    husband: null, 
                    wife: null, 
                    children: [],
                    marriageDate: "",
                    notes: [],
                    sources: []
                };
                currentEntity = families[id];
            } else {
                currentEntity = null;
            }
        } else if (currentEntity && level === "1") {
            if (tag === "NAME" && currentEntity.name !== undefined) {
                currentEntity.name = data;
            } else if (tag === "BIRT") {
                currentEntity._expectingBirthDate = true;
            } else if (tag === "DEAT") {
                currentEntity._expectingDeathDate = true;
            } else if (tag === "OCCU") {
                currentEntity.occupation = data;
            } else if (tag === "HUSB" && currentEntity.husband !== undefined) {
                currentEntity.husband = data;
            } else if (tag === "WIFE" && currentEntity.wife !== undefined) {
                currentEntity.wife = data;
            } else if (tag === "CHIL" && currentEntity.children !== undefined) {
                currentEntity.children.push(data);
            } else if (tag === "FAMC" || tag === "FAMS") {
                currentEntity.families.push(data);
                if (tag === "FAMS") {
                    if (!currentEntity.spouseFamilies) {
                        currentEntity.spouseFamilies = [];
                    }
                    currentEntity.spouseFamilies.push(data);
                }
            } else if (tag === "MARR") {
                currentEntity._expectingMarriageDate = true;
            } else if (tag === "NOTE") {
                // Capture les notes au niveau 1
                const noteId = `NOTE_${currentNoteCounter++}`;
                notes[noteId] = { text: data.trim() };
                currentEntity.notes.push(noteId);
            } else if (tag === "SOUR") {
                // Capture les sources au niveau 1
                const sourceId = `SOURCE_${currentSourceCounter++}`;
                sources[sourceId] = { text: data.trim() };
                currentEntity.sources.push(sourceId);
            }
        } else if (currentEntity && level === "2") {
            if (tag === "DATE") {
                if (currentEntity._expectingBirthDate) {
                    currentEntity.birthDate = data;
                    delete currentEntity._expectingBirthDate;
                } else if (currentEntity._expectingDeathDate) {
                    currentEntity.deathDate = data;
                    delete currentEntity._expectingDeathDate;
                } else if (currentEntity._expectingMarriageDate) {
                    currentEntity.marriageDate = data;
                    delete currentEntity._expectingMarriageDate;
                }
            } else if (tag === "NOTE") {
                // Capture les notes au niveau 2
                const noteId = `NOTE_${currentNoteCounter++}`;
                notes[noteId] = { text: data.trim() };
                currentEntity.notes.push(noteId);
            } else if (tag === "SOUR") {
                // Capture les sources au niveau 2
                const sourceId = `SOURCE_${currentSourceCounter++}`;
                sources[sourceId] = { text: data.trim() };
                currentEntity.sources.push(sourceId);
            } else if ((tag === "CONT" || tag === "CONC") && currentEntity.notes.length > 0) {
                // Continuation des notes
                const lastNoteId = currentEntity.notes[currentEntity.notes.length - 1];
                notes[lastNoteId].text += (tag === "CONT" ? "\n" : "") + (data || '');
            } else if ((tag === "CONT" || tag === "CONC") && currentEntity.sources.length > 0) {
                // Continuation des sources
                const lastSourceId = currentEntity.sources[currentEntity.sources.length - 1];
                sources[lastSourceId].text += (tag === "CONT" ? "\n" : "") + (data || '');
            }
        }
    }

    // console.log("Données finales extraites :");
    // console.log("Nombre d'individus :", Object.keys(individuals).length);
    // console.log("Nombre de familles :", Object.keys(families).length);
    // console.log("Nombre de notes :", Object.keys(notes).length);
    // console.log("Nombre de sources :", Object.keys(sources).length);

    return { 
        individuals, 
        families, 
        notes, 
        sources 
    };
}

function searchRootPerson(event) {
    // Vérifier si la touche pressée est Entrée
    if (event.key !== 'Enter') return;

    const searchInput = document.getElementById('root-person-search');
    const resultsSelect = document.getElementById('root-person-results');
    const searchStr = searchInput.value.toLowerCase();

    // Réinitialiser les résultats
    resultsSelect.innerHTML = '<option value="">Select</option>';
    resultsSelect.style.display = 'none';

    if (!searchStr) return;

    // Rechercher dans les individus
    const matchedPersons = Object.values(globalGedcomData.individuals)
        .filter(person => {
            const fullName = person.name.toLowerCase().replace(/\//g, '');
            return fullName.includes(searchStr);
        });

    // Afficher les résultats
    if (matchedPersons.length > 0) {
        matchedPersons.forEach(person => {
            const option = document.createElement('option');
            option.value = person.id;
            option.textContent = person.name.replace(/\//g, '').trim();
            resultsSelect.appendChild(option);
        });
        // Animation pour indiquer des résultats trouvés
        resultsSelect.style.display = 'block';
        resultsSelect.style.animation = 'findResults 1s infinite';
        resultsSelect.style.backgroundColor = 'yellow'; 
    } else {
        alert('Aucune personne trouvée');
    }
}


function selectRootPerson() {
    console.log('selectRootPerson function called');
    
    const resultsSelect = document.getElementById('root-person-results');
    const selectedPersonId = resultsSelect.value;

    console.log('Selected Person ID:', selectedPersonId);

    if (selectedPersonId) {
        console.log('Inside if block');

        // Forcer la suppression de l'animation et le changement de couleur
        resultsSelect.style.animation = 'none';
        resultsSelect.style.backgroundColor = 'orange';

        console.log('Styles applied:', resultsSelect.style.animation, resultsSelect.style.backgroundColor);

        // Sauvegarder globalement
        globalRootPersonId = selectedPersonId;

        // Redessiner l'arbre avec la personne sélectionnée
        displayPedigree(globalGedcomData, selectedPersonId);
        
        // Ne pas masquer la liste, mais garder l'option sélectionnée visible
        resultsSelect.style.display = 'block';
    }
}


document.getElementById("root-person-search").addEventListener("keydown", function(event) {
    if (event.key === "Enter") { // Détection de la touche Enter sur PC
        event.preventDefault();  // Empêcher le saut de ligne
        searchRootPerson(event);
    }
});

document.getElementById('root-person-results').addEventListener('change', selectRootPerson);
