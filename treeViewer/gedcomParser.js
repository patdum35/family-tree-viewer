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
        resultsSelect.style.display = 'block';
    } else {
        alert('Aucune personne trouvée');
    }
}



// function selectRootPerson() {
//     const resultsSelect = document.getElementById('root-person-results');
//     const selectedPersonId = resultsSelect.value;

//     console.log("Personne sélectionnée - ID :", selectedPersonId);
//     console.log("Données globales :", globalGedcomData);

//     if (selectedPersonId) {
//         try {
//             // Vérifier que la personne existe
//             const selectedPerson = globalGedcomData.individuals[selectedPersonId];
//             console.log("Personne sélectionnée :", selectedPerson);

//             // Sauvegarder globalement
//             globalRootPersonId = selectedPersonId;

//             // Redessiner l'arbre avec la personne sélectionnée
//             displayPedigree(globalGedcomData, selectedPersonId);
            
//             // Masquer la liste déroulante
//             resultsSelect.style.display = 'none';
//         } catch (error) {
//             console.error("Erreur lors de la sélection de la personne :", error);
//             alert("Erreur lors de la sélection de la personne");
//         }
//     }
// }


function selectRootPerson() {
    const resultsSelect = document.getElementById('root-person-results');
    const selectedPersonId = resultsSelect.value;

    if (selectedPersonId) {
        // Sauvegarder globalement
        globalRootPersonId = selectedPersonId;

        // Redessiner l'arbre avec la personne sélectionnée
        displayPedigree(globalGedcomData, selectedPersonId);
        
        // Ne pas masquer la liste, mais garder l'option sélectionnée visible
        resultsSelect.style.display = 'block';
    }
}

// SOLUTION MARCHE SUR téléphone
// function setupRootPersonSearch() {
//     const searchInput = document.getElementById('root-person-search');
    
//     // Ajouter des écouteurs pour différents types d'événements
//     searchInput.addEventListener('keydown', function(event) {
//         // Vérifier si la touche Entrée est pressée (code 13)
//         if (event.keyCode === 13 || event.key === 'Enter') {
//             event.preventDefault(); // Empêcher le comportement par défaut
//             searchRootPerson(event);
//         }
//     });

//     // Ajouter un écouteur pour les appareils mobiles
//     searchInput.addEventListener('keypress', function(event) {
//         if (event.keyCode === 13 || event.key === 'Enter') {
//             event.preventDefault();
//             searchRootPerson(event);
//         }
//     });

//     // Ajouter un bouton de recherche pour les appareils mobiles
//     const searchButton = document.createElement('button');
//     searchButton.textContent = '🔍';
//     searchButton.addEventListener('click', searchRootPerson);
//     searchInput.parentNode.insertBefore(searchButton, searchInput.nextSibling);
// }
// Ajouter des écouteurs d'événements
// document.getElementById('root-person-search').addEventListener('keyup', searchRootPerson);
// document.getElementById('root-person-search').addEventListener('keyup', searchRootPerson);
// document.getElementById('root-person-results').addEventListener('change', selectRootPerson);
// document.addEventListener('DOMContentLoaded', setupRootPersonSearch);



// function setupRootPersonSearch() {
//     const searchInput = document.getElementById('root-person-search');
    
//     // Vérifier si c'est un appareil mobile
//     const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

//     if (isMobile) {
//         // Pour les appareils mobiles, utiliser l'événement 'search'
//         searchInput.addEventListener('search', function(event) {
//             event.preventDefault();
//             searchRootPerson(event);
//         });
//     } else {
//         // Pour les ordinateurs, conserver le comportement existant
//         searchInput.addEventListener('keydown', function(event) {
//             if (event.key === 'Enter' || event.keyCode === 13) {
//                 event.preventDefault();
//                 searchRootPerson(event);
//             }
//         });
//     }
// }

// // Charger la configuration au démarrage
// document.addEventListener('DOMContentLoaded', setupRootPersonSearch);



function setupRootPersonSearch() {
    const searchInput = document.getElementById('root-person-search');
    
    // Détecter les appareils mobiles
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
        // Ajouter un bouton de recherche pour les appareils mobiles
        const searchButton = document.createElement('button');
        searchButton.textContent = '🔍';
        searchButton.addEventListener('click', searchRootPerson);
        searchInput.parentNode.insertBefore(searchButton, searchInput.nextSibling);

        // CSS pour le bouton
        searchButton.style.marginLeft = '5px';
        searchButton.style.padding = '8px';
        searchButton.style.backgroundColor = 'transparent';
        searchButton.style.border = '1px solid #ccc';
        searchButton.style.borderRadius = '4px';
        searchButton.style.cursor = 'pointer';
    }
}

// Écouteurs d'événements
document.getElementById('root-person-search').addEventListener('keyup', searchRootPerson);
document.getElementById('root-person-results').addEventListener('change', selectRootPerson);
document.addEventListener('DOMContentLoaded', setupRootPersonSearch);



document.getElementById("textInput").addEventListener("keydown", function(event) {
    if (event.key === "Enter") { // Détection de la touche Enter sur PC
        event.preventDefault();  // Empêcher le saut de ligne
        validerTexte();
    }
});

function validerTexte() {
    let texte = document.getElementById("textInput").value;
    if (texte.trim() !== "") {
        document.getElementById("resultat").textContent = "Texte validé : " + texte;
    } else {
        alert("Veuillez entrer du texte !");
    }
}