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
    let residenceCounter = 0;
    let nameCounter = 0;
    // let titleCounter = 0;
    let previousIndividualsId = null;
    let previousFamiliesId = null;

    for (const line of lines) {
        const match = line.match(/^\s*(\d+)\s+(@\w+@)?\s*(\w+)?\s*(.*)?$/);
        if (!match) continue;

        const [_, level, id, tag, data] = match;

        if (level === "0" && id) {
            if (tag === "INDI") {

                individuals[id] = { 
                    id, 
                    name: "",
                    // name2: "",
                    // givn: "",
                    // surn: "",
                    sex: "", 
                    birthDate: "", 
                    // birthPlace: "",
                    deathDate: "",
                    // deathPlace: "",
                    // marriagePlace: "",
                    // residDate1: "",
                    // residPlace1: "",
                    // residDate2: "",
                    // residPlace2: "",
                    // residDate3: "",
                    // residPlace3: "",
                    // occupation: "",
                    occupationFull: "",
                    families: [],
                    notes: [],
                    sources: []
                };
                currentEntity = individuals[id];  
                nameCounter = 0;
                residenceCounter = 0;

                if (previousIndividualsId) {
                    delete individuals[previousIndividualsId]._expectingBirthDate;                    delete individuals[id]._expectingBirthPlace;
                    delete individuals[previousIndividualsId]._expectingBirthPlace;
                    delete individuals[previousIndividualsId]._expectingDeathDate;                    delete individuals[id]._expectingBirthPlace;
                    delete individuals[previousIndividualsId]._expectingDeathPlace;
                    delete individuals[previousIndividualsId]._expectingResidDate1;                    delete individuals[id]._expectingBirthPlace;
                    delete individuals[previousIndividualsId]._expectingResidPlace1;
                    delete individuals[previousIndividualsId]._expectingResidDate2;                    delete individuals[id]._expectingBirthPlace;
                    delete individuals[previousIndividualsId]._expectingResidPlace2;
                    delete individuals[previousIndividualsId]._expectingResidDate3;                    delete individuals[id]._expectingBirthPlace;
                    delete individuals[previousIndividualsId]._expectingResidPlace3;
                }

                previousIndividualsId = id;
            } else if (tag === "FAM") {
                families[id] = { 
                    id, 
                    husband: null, 
                    wife: null, 
                    children: [],
                    // marriageDate: "",
                    // marriagePlace: "",
                    notes: [],
                    sources: []
                };
                currentEntity = families[id];
                if (previousFamiliesId) {
                    delete families[previousFamiliesId]._expectingMarriageDate;
                    delete families[previousFamiliesId]._expectingMarriagePlace;
                }
                previousFamiliesId = id;
            } else {
                currentEntity = null;
            }
        } else if (currentEntity && level === "1") {
            if (tag === "NAME" && currentEntity.name !== undefined) {
                nameCounter++;
                if (nameCounter === 1) {
                    currentEntity.name = data;
                } else if (nameCounter === 2) {
                    currentEntity.name2 = data;
                    currentEntity.name = currentEntity.name + ' ' + data;
                }
                // currentEntity.name = data;
            } else if (tag === "SEX" && currentEntity.sex !== undefined) {
                currentEntity.sex = data;  // M ou F typiquement
            } else if (tag === "BIRT") {
                currentEntity._expectingBirthDate = true;
                currentEntity._expectingBirthPlace = true;

                currentEntity._expectingDeathDate = false;
                currentEntity._expectingDeathPlace = false;
            } else if (tag === "DEAT") {
                currentEntity._expectingDeathDate = true;
                currentEntity._expectingDeathPlace = true;
                
                currentEntity._expectingBirthDate = false;
                currentEntity._expectingBirthPlace = false;
            } else if (tag === "BAPM") {
                currentEntity._expectingBirthDate = true;
                currentEntity._expectingBirthPlace = true;

                currentEntity._expectingDeathDate = false;
                currentEntity._expectingDeathPlace = false;                
            } else if (tag === "BURI") {
                currentEntity._expectingDeathDate = true;
                currentEntity._expectingDeathPlace = true;
                
                currentEntity._expectingBirthDate = false;
                currentEntity._expectingBirthPlace = false;

            } else if (tag === "MARR") {
                currentEntity._expectingMarriageDate = true;
                currentEntity._expectingMarriagePlace = true;
            } else if (tag === "OCCU") {
                currentEntity.occupation = data;
                if (currentEntity.occupationFull === '') {
                    currentEntity.occupationFull = data;
                } else {
                    currentEntity.occupationFull = currentEntity.occupationFull + ', ' + data;
                }
            } else if (tag === "TITL") {
                if (currentEntity.occupationFull === '') {
                    currentEntity.occupationFull = data.replace(/,/g, '');
                } else {
                    currentEntity.occupationFull = currentEntity.occupationFull + ', ' + data.replace(/,/g, '');
                }
                currentEntity._expectingTitle = true;

                                 
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
            // } else if (tag === "MARR") {
            //     currentEntity._expectingMarriageDate = true;
            } else if (tag === "NOTE") {
                const noteId = `NOTE_${currentNoteCounter++}`;
                notes[noteId] = { text: data.trim() };
                currentEntity.notes.push(noteId);
            } else if (tag === "SOUR") {
                const sourceId = `SOURCE_${currentSourceCounter++}`;
                sources[sourceId] = { text: data.trim() };
                currentEntity.sources.push(sourceId);
            } else if (tag === "RESI") {
                residenceCounter++;
                if (residenceCounter === 1) {
                    currentEntity._expectingResidDate1 = true;
                    currentEntity._expectingResidPlace1 = true;

                    currentEntity._expectingBirthDate = false;
                    currentEntity._expectingBirthPlace = false;
                    currentEntity._expectingDeathDate = false;
                    currentEntity._expectingDeathPlace = false;
                } else if (residenceCounter === 2) {
                    currentEntity._expectingResidDate2 = true;
                    currentEntity._expectingResidPlace2 = true;

                    currentEntity._expectingBirthDate = false;
                    currentEntity._expectingBirthPlace = false;
                    currentEntity._expectingDeathDate = false;
                    currentEntity._expectingDeathPlace = false;
                    currentEntity._expectingResidDate1 = false;
                    currentEntity._expectingResidPlace1 = false;
                } else if (residenceCounter === 3) {
                    currentEntity._expectingResidDate3 = true;
                    currentEntity._expectingResidPlace3 = true;

                    currentEntity._expectingBirthDate = false;
                    currentEntity._expectingBirthPlace = false;
                    currentEntity._expectingDeathDate = false;
                    currentEntity._expectingDeathPlace = false;
                    currentEntity._expectingResidDate1 = false;
                    currentEntity._expectingResidPlace1 = false;
                    currentEntity._expectingResidDate2 = false;
                    currentEntity._expectingResidPlace2 = false;
                }
            }


        } else if (currentEntity && level === "2") {
            if (tag === "GIVN") {
                currentEntity.givn = data;  // M ou F typiquement 
            } else if (tag === "SURN") {
                currentEntity.surn = data;  // M ou F typiquement
            } else if (tag === "PLAC") {
                if (currentEntity._expectingBirthPlace) {
                    if (!currentEntity.birthPlace) {
                        currentEntity.birthPlace = data;
                    } 
                    // else {
                    //     // console.log('*** BAPM: in parseGedcom ignoring birthPlace for bapteme, only if not already set', currentEntity.name,currentEntity.birthPlace, data);
                    // }
                    delete currentEntity._expectingBirthPlace;
                } else if (currentEntity._expectingDeathPlace) {
                    if (!currentEntity.deathPlace) {
                        currentEntity.deathPlace = data;
                    }
                    // else {
                    //     console.log('*** BURI: in parseGedcom ignoring burial for deathPlace, only if not already set', currentEntity.name, currentEntity.deathPlace, data);
                    // }
                    delete currentEntity._expectingDeathPlace;
                } else if (currentEntity._expectingMarriagePlace) {
                    currentEntity.marriagePlace = data;
                    // console.log('in parseGedcom marriagePlace= ',data);
                    delete currentEntity._expectingMarriagePlace;
                } else if (currentEntity._expectingResidPlace1) {
                    currentEntity.residPlace1 = data;
                    delete currentEntity._expectingResidPlace1;
                } else if (currentEntity._expectingResidPlace2) {
                    currentEntity.residPlace2 = data;
                    delete currentEntity._expectingResidPlace2;
                } else if (currentEntity._expectingResidPlace3) {
                    currentEntity.residPlace3 = data;
                    delete currentEntity._expectingResidPlace3;
                }
                
                
                

            } else if (tag === "DATE") {
                if (currentEntity._expectingBirthDate) {
                    // if birthDate is already set, do not overwrite it with a baptism date
                    if (currentEntity.birthDate === '') { 
                        currentEntity.birthDate = data;
                    } 
                    // else {
                    //     console.log('in parseGedcom ignoring birthDate from bapteme= ',data,' already have ',currentEntity.birthDate, currentEntity.name);
                    // }
                    delete currentEntity._expectingBirthDate;
                } else if (currentEntity._expectingDeathDate) {
                    // if deathDate is already set, do not overwrite it with a burial date
                    if (currentEntity.deathDate === '') { 
                        currentEntity.deathDate = data;
                    } 
                    // else {
                    //     console.log('in parseGedcom ignoring deathDate from burial= ',data,' already have ',currentEntity.deathDate, currentEntity.name);
                    // }
                    delete currentEntity._expectingDeathDate;
                } else if (currentEntity._expectingMarriageDate) {
                    currentEntity.marriageDate = data;
                    // console.log('in parseGedcom marriageDate= ',data);
                    delete currentEntity._expectingMarriageDate;
                } else if (currentEntity._expectingResidDate1) {
                    currentEntity.residDate1 = data;
                    delete currentEntity._expectingResidDate1;
                } else if (currentEntity._expectingResidDate2) {
                    currentEntity.residDate2 = data;
                    delete currentEntity._expectingResidDate2;
                } else if (currentEntity._expectingResidDate3) {    
                    currentEntity.residDate3 = data;
                    delete currentEntity._expectingResidDate3;
                } else if (currentEntity._expectingTitle) {    
                    currentEntity.occupationFull = currentEntity.occupationFull + ' : ' + data;
                    delete currentEntity._expectingTitle;
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
        } else if (currentEntity && level === "3") {
            if ((tag === "CONT" || tag === "CONC") && currentEntity.notes.length > 0) {
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