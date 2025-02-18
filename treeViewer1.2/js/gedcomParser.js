/**
* Parse un fichier GEDCOM en un objet structuré contenant les individus, familles, notes et sources
* 
* @param {string} gedcomText - Le contenu texte du fichier GEDCOM à parser
* @returns {Object} Un objet contenant:
*   - individuals: Map des individus indexée par ID
*   - families: Map des familles indexée par ID
*   - notes: Map des notes indexée par ID 
*   - sources: Map des sources indexée par ID
* 
* Pour chaque individu:
*   - id: Identifiant unique
*   - name: Nom complet au format "Prénoms /NOM/"
*   - birthDate: Date de naissance 
*   - deathDate: Date de décès
*   - occupation: Profession
*   - families: Liste des IDs de familles auxquelles l'individu appartient
*   - notes: Liste des IDs des notes associées
*   - sources: Liste des IDs des sources associées
* 
* Pour chaque famille:
*   - id: Identifiant unique
*   - husband: ID de l'époux
*   - wife: ID de l'épouse 
*   - children: Liste des IDs des enfants
*   - marriageDate: Date du mariage
*   - notes: Liste des IDs des notes associées
*   - sources: Liste des IDs des sources associées
*/
export function parseGEDCOM(gedcomText) {
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
                    birthPlace: "",
                    deathDate: "",
                    deathPlace: "",
                    marriagePlace: "",
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
                currentEntity._expectingBirthPlace = true;
            } else if (tag === "DEAT") {
                currentEntity._expectingDeathDate = true;
                currentEntity._expectingDeathPlace = true;
            } else if (tag === "MARR") {
                currentEntity._expectingMarriagePlace = true;
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
                const noteId = `NOTE_${currentNoteCounter++}`;
                notes[noteId] = { text: data.trim() };
                currentEntity.notes.push(noteId);
            } else if (tag === "SOUR") {
                const sourceId = `SOURCE_${currentSourceCounter++}`;
                sources[sourceId] = { text: data.trim() };
                currentEntity.sources.push(sourceId);
            }
        } else if (currentEntity && level === "2") {
            if (tag === "PLAC") {
                if (currentEntity._expectingBirthPlace) {
                    currentEntity.birthPlace = data;
                    delete currentEntity._expectingBirthPlace;
                } else if (currentEntity._expectingDeathPlace) {
                    currentEntity.deathPlace = data;
                    delete currentEntity._expectingDeathPlace;
                } else if (currentEntity._expectingMarriagePlace) {
                    currentEntity.marriagePlace = data;
                    delete currentEntity._expectingMarriagePlace;
                }
            }
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
                const noteId = `NOTE_${currentNoteCounter++}`;
                notes[noteId] = { text: data.trim() };
                currentEntity.notes.push(noteId);
            } else if (tag === "SOUR") {
                const sourceId = `SOURCE_${currentSourceCounter++}`;
                sources[sourceId] = { text: data.trim() };
                currentEntity.sources.push(sourceId);
            } else if ((tag === "CONT" || tag === "CONC") && currentEntity.notes.length > 0) {
                const lastNoteId = currentEntity.notes[currentEntity.notes.length - 1];
                notes[lastNoteId].text += (tag === "CONT" ? "\n" : "") + (data || '');
            } else if ((tag === "CONT" || tag === "CONC") && currentEntity.sources.length > 0) {
                const lastSourceId = currentEntity.sources[currentEntity.sources.length - 1];
                sources[lastSourceId].text += (tag === "CONT" ? "\n" : "") + (data || '');
            }
        }
    }

    return { 
        individuals, 
        families, 
        notes, 
        sources 
    };
}