import { state } from './main.js';

export function extractYear(dateString) {
    // if (!dateString) return '0';
    if (!dateString) return null;
    // Test spécifique pour les entiers seuls (1, 12, 123, 1234, -50, etc.)
    if (/^-?\d+$/.test(dateString)) {
        return parseInt(dateString);
    }
    
    const parts = dateString.split(' ');
    
    // Chercher un nombre à 4 chiffres, sans restriction
    const yearMatch = dateString.match(/\b(\d{4})\b/);
    
    if (yearMatch) {
        const year = parseInt(yearMatch[1]);
        return year;
    }
    
    // Fallback sur la méthode originale si pas de match
    const year = parts[parts.length - 1];
    // return parseInt(year) || '0';
    return parseInt(year) || null;
}

const excludedSurNames = new Set([
    'XXX', 'N.', '1er', 'I', 'II', 'III', 'IV', 'V', 'VI', 
    'le', 'Le', 'LA', 'La', "La",'LE', 'au', 'Au', 'ou', 'Ou','de', 'De', 'Ne', 'Nn', 'ou',"D'" ,"d'", 'St', 'ou', 'Ép', 'Sa',
    'Ho', 'Femme', 'Nc', 'Ap', 'Dit', 'Dite', 'Ker', 'Sap', 
    'Anonyme', 'Inconnu', 'Inconnue', 'duménil', 'Duménil', 'Dumenil', 
    'Main', "Sans", "Nom", 'nom', 'Dieppois', 'Blanc', 'Prophetesse', 'Mer', 'Grand', 'grand', 'Saint', 'saint', 'Confesseur',
    'i', 'Ii', 'iII', 'Ier', '1er', '1ère'
]);

export function cleanSurName(name) {
    // Supprimer les caractères spéciaux et nettoyer les espaces
    return name
        .replace(/[(),\.]/g, '') // Supprimer parenthèses, virgules, points
        .replace(/\s+/g, ' ')    // Normaliser les espaces
        .trim();                 // Supprimer les espaces début/fin
}

export function isValidSurName(name) {
    // Le prénom doit :
    // - Ne pas être dans la liste d'exclusion
    // - Avoir au moins 2 caractères
    // - Ne pas contenir que des chiffres romains
    // - Ne pas être composé uniquement de chiffres
    // - Ne pas être composé uniquement de caractères spéciaux
    return !excludedSurNames.has(name) &&
            name.length >= 2 &&
            !/^[IVXLCDM]+$/i.test(name) &&
            !/^\d+$/.test(name) &&
            /[a-zA-Z]/.test(name);
}

const excludedFamilyNames = new Set([
    '? Xx?', '? ? XX?', 'Nc'
]);

export function cleanFamilyName(name) {
    return name
        .replace(/[(),\.]/g, '') // Supprimer parenthèses, virgules, points
        .replace(/\s+/g, ' ')    // Normaliser les espaces
        .trim();                 // Supprimer les espaces début/fin
}

export function isValidFamilyName(name) {
    return !excludedFamilyNames.has(name) &&
           name.length >= 2 &&
           !/^[IVXLCDM]+$/i.test(name) &&
           !/^\d+$/.test(name) &&
           /[a-zA-Z]/.test(name);
}


export function cleanProfession(profession) {
    if (!profession) return [];

    const professions = profession.split(',')
        .map(p => {
            const parts = p.split(':');
            if (parts.length > 1) {
                // Nettoyer la partie avant le ':'
                const before = parts[0].trim().toLowerCase().replace(/[^a-zà-ÿ\s'-]/gi, '').replace(/\s+/g, ' ');
                // Garder la partie après le ':' telle quelle (trim seulement)
                const after = parts.slice(1).join(':').trim().toLowerCase().replace(/from/, 'de').replace(/to/, 'à');
                return before + ' : ' + after;
            } else {
                // Traitement habituel
                return p.trim().toLowerCase().replace(/[^a-zà-ÿ\s'-]/gi, '').replace(/\s+/g, ' ');
            }
        })
        .filter(p => p.length > 0);

    return [...new Set(professions)].slice(0, 10);
}


const excludedLocations = new Set([
    '?', 
    'inconnu', 
    'unknown', 
    'nc', 
    'n.c', 
    'non communiqué', 
    'non spécifié',
    'non renseigné'
]);




// Liste extensible de professions à isoler si elles sont en début de chaîne
const specialProfessions = [
    'seigneur', 'sieur', 'sire', 'écuyer', 'chevalier', 'dame', 'demoiselle', 'prince', 'grand-prince', 'princesse', "compagnon d'armes", 'co-seigneur',
    'châtelain', 'châtelaine',
    'roi', 'reine', 'empereur', 'impératrice','régent', 'régente','archiduc', 'archiduchesse', 'infant', 'infante',
    'duc', 'duchesse', 'marquis', 'marquise', 'comte', 'co-comte', 'comtesse', 'vicomte', 'vicomtesse', 'baron', 'baronne', 'comtesse consort',
    'chambellan', 'connétable', 'grand connétable','ambassadeur', 'ambassadrice', 'ministre',
    'abbesse', 'évêque', 'archevêque', 'cardinal', 'pape', 'prêtre', 'curé', 'chanoine', 'chanoinesse', 'moine', 'nonne', 'frère', 'abbé', 
    'capitaine', 'colonel', 'général', 'maréchal', 'commandant', 'lieutenant-général', 'lieutenant', 'brigadier', "grand-maître de l'artillerie",
    'gouverneur', 'sénéchal', 'bailli', 'prévôt', 'maire du palais','maire', 'échevin', 'conseiller', 'conseillère', 
    'docteur', 'avocat', 'procureur-général','notaire', 'bourgmestre', 'juge', 'recteur', 'bourgeois', 'greffier', 'huissier', 'clerc', 
    "maître d'hôtel", 'baillistre', 'stratège', 'domestique', 'trésorier', 'intendant', 'surintendant', 'commissaire', 'préfet', 'chambrier', 
    'noble', 'noble dame', 'gentilhomme', 'gentilhomme de la chambre', 'gentilhomme ordinaire','héritier', 'héritière', 'prétendant',
    'président', 'présidente', 
    // Ajoutez ici autant de titres que nécessaire
];



// const specialProfRegex = new RegExp(`^(${specialProfessions.join('|')})\\b`, 'i');
const specialProfRegex = new RegExp(`^(${specialProfessions.join('|')})(\\s|$)`, 'i');


export function cleanProfessionForNameCloud(profession) {
    if (!profession) return [];

    // console.log('\ndebug before cleaning****', profession);
    // const professions = profession.split(',')
    const professions = profession.split(/[,.;\/]| - /) // split sur ',' ou '/' ou ' - '
        .map(p => {
            let cleaned = p.trim().toLowerCase().replace(/[^a-zà-ÿ\s'-]/gi, '').replace(/\s+/g, ' ');
            // console.log('cleaned 1 ****', cleaned);
            const match = cleaned.match(specialProfRegex);
            if (match) {
                // console.log('match found ****', match[1]);
                return match[1];
            }
            return cleaned;
        })
        .filter(p => p.length > 0);

    const unique = [...new Set(professions)].slice(0, 10);
    // console.log('debug after cleaning****', unique);

    return unique;
}



export function cleanLocation(location) {
    if (!location) return '';
    
    // Convertir en minuscules et supprimer les espaces supplémentaires
    location = location.toLowerCase().trim();
    
    // Supprimer les guillemets
    location = location.replace(/"/g, '');

    // Vérifier si le lieu est dans la liste d'exclusion
    if (excludedLocations.has(location)) return '';
    
    // Supprimer les parenthèses et les chiffres
    location = location.replace(/\(.*?\)/g, ',').replace(/\d+/g, ',');
    
    // Prendre la partie avant la virgule
    location = location.split(',')[0];
    
    // Diviser en mots et garder les 3 premiers
    const words = location.trim().split(/\s+/)
        .slice(0, 4)
        .filter(word => !excludedLocations.has(word));
    
    // Capitaliser le premier mot
    if (words.length > 0) {
        words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    }
    
    return words.join(' ').trim();
}

export function capitalizeName(name) {
    return name
        .split('-')  // Gérer les prénoms composés avec tiret
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join('-');
}

export function formatFamilyName(familyName) {
    // Vérifier si le nom est vide ou non défini
    if (!familyName) return '';

    // Diviser le nom en mots
    const words = familyName.trim()
        .split(' ')
        // .slice(0, 3)  // Limiter à 3 mots
        .slice(0, 6)  // Limiter à 4 mots
        .map(word => {
            // Mettre le mot en minuscules
            const lowercaseWord = word.toLowerCase();
            // Mettre la première lettre en majuscule
            return lowercaseWord.charAt(0).toUpperCase() + lowercaseWord.slice(1);
        });

    // Rejoindre les mots
    return words.join(' ');
}

export function hasDateInRange(person, config, stats) {
    const isValidYear = (year) => {
        const numYear = typeof year === 'string' ? parseInt(year) : year;
        return !isNaN(numYear) && 
               numYear !== 0;
    };

    const isYearIntarget = (year) => {
        const numYear = typeof year === 'string' ? parseInt(year) : year;
        return !isNaN(numYear) && 
               numYear !== 0 && 
               numYear >= Math.min(config.startDate, config.endDate) && 
               numYear <= Math.max(config.startDate, config.endDate);
    };


    // Variable pour stocker la date pertinente
    let relevantDate = null;
    let currentDate = null

    // Vérifier dates directes
    
    // console.log('\n\n Debug: Checking person ID', person.id, person.name, person);
    if (person.birthDate && isYearIntarget(extractYear(person.birthDate))) {
        // stats.directDates.birth++;
        // stats.directDates.people.add(person.id);
        relevantDate = extractYear(person.birthDate);
        return { inRange: true, date: relevantDate };
    }
    if (person.deathDate && isYearIntarget(extractYear(person.deathDate))) {
        // stats.directDates.death++;
        // stats.directDates.people.add(person.id);
        if (person.birthDate && isValidYear(extractYear(person.birthDate)))
            return { inRange: false, date: null };
        else {
            relevantDate = extractYear(person.deathDate);
            return { inRange: true, date: relevantDate };
        }
    }

    // Vérifier mariages
    if (person.spouseFamilies) {
        for (const famId of person.spouseFamilies) {
            const family = state.gedcomData.families[famId];
            if (family && family.marriageDate && isYearIntarget(extractYear(family.marriageDate))) {
                // stats.directDates.marriage++;
                // stats.directDates.people.add(person.id);
                relevantDate = extractYear(family.marriageDate);
                return { inRange: true, date: relevantDate };
            }
        }
    }

    // Chercher dans les ancêtres/descendants si pas de date directe
    const dateInfo = findDateForPerson(person.id, stats);
    if (dateInfo && isYearIntarget(dateInfo.year)) {
        relevantDate = dateInfo.year;
        return { inRange: true, date: relevantDate };
    }

    // Si aucune date trouvée, ajouter aux stats noDates
    // stats.noDates.push({
    //     id: person.id,
    //     name: person.name.replace(/\//g, '')
    // });

    return { inRange: false, date: null };
}

export function findDateForPerson(personId, stats) {
    const person = state.gedcomData.individuals[personId];
    if (!person) return null;

    // Vérifier les dates directes
    if (person.birthDate) {
        // stats.directDates.birth++;
        // stats.total++;
        return { year: extractYear(person.birthDate), type: 'birth' };
    }
    if (person.deathDate) {
        // stats.directDates.death++;
        // stats.total++;
        return { year: extractYear(person.deathDate), type: 'death' };
    }

    // Vérifier les dates de mariage
    if (person.spouseFamilies) {
        for (const famId of person.spouseFamilies) {
            const family = state.gedcomData.families[famId];
            if (family && family.marriageDate) {
                // stats.directDates.marriage++;
                // stats.total++;
                return { year: extractYear(family.marriageDate), type: 'marriage' };
            }
        }
    }

    // Liste pour stocker les dates trouvées
    let dates = [];
    let dateFound = false;

    // Fonction pour remonter aux ancêtres
    function checkAncestors(currentId, depth = 0, visited = new Set()) {
        if (dateFound) return;
        
        if (depth > 20 || !currentId || visited.has(currentId)) return;
        
        visited.add(currentId);
        const current = state.gedcomData.individuals[currentId];
        if (!current) return;

        // Vérifier les dates
        if (current.birthDate) {
            dates.push({ 
                year: extractYear(current.birthDate), 
                type: 'ancestor_birth', 
                depth,
                name: current.name.replace(/\//g, '')
            });
            dateFound = true;
            return;
        }
        if (current.deathDate) {
            dates.push({ 
                year: extractYear(current.deathDate), 
                type: 'ancestor_death', 
                depth,
                name: current.name.replace(/\//g, '')
            });
            dateFound = true;
            return;
        }

        // Vérifier mariages
        if (current.spouseFamilies) {
            for (const famId of current.spouseFamilies) {
                const family = state.gedcomData.families[famId];
                if (family && family.marriageDate) {
                    dates.push({ 
                        year: extractYear(family.marriageDate), 
                        type: 'ancestor_marriage', 
                        depth,
                        name: current.name.replace(/\//g, '')
                    });
                    dateFound = true;
                    return;
                }
            }
        }

        // Remonter aux parents
        if (!dateFound && current.families && current.families.length > 0) {
            const parentFamily = state.gedcomData.families[current.families[0]];
            if (parentFamily) {
                if (parentFamily.husband) {
                    checkAncestors(parentFamily.husband, depth + 1, visited);
                }
                if (!dateFound && parentFamily.wife) {
                    checkAncestors(parentFamily.wife, depth + 1, visited);
                }
            }
        }
        
    }

    // Fonction pour descendre aux descendants
    function checkDescendants(currentId, depth = 0, visited = new Set()) {
        if (dateFound) return;
        
        if (depth > 20 || !currentId || visited.has(currentId)) return;

        visited.add(currentId);
        const current = state.gedcomData.individuals[currentId];
        if (!current) return;

        // Vérifier les dates
        if (current.birthDate) {
            dates.push({ 
                year: extractYear(current.birthDate), 
                type: 'descendant_birth', 
                depth,
                name: current.name.replace(/\//g, '')
            });
            dateFound = true;
            return;
        }
        if (current.deathDate) {
            dates.push({ 
                year: extractYear(current.deathDate), 
                type: 'descendant_death', 
                depth,
                name: current.name.replace(/\//g, '')
            });
            dateFound = true;
            return;
        }

        if (!dateFound && current.spouseFamilies) {
            for (const famId of current.spouseFamilies) {
                const family = state.gedcomData.families[famId];
                if (family) {
                    if (family.marriageDate) {
                        dates.push({ 
                            year: extractYear(family.marriageDate), 
                            type: 'descendant_marriage', 
                            depth,
                            name: current.name.replace(/\//g, '')
                        });
                        dateFound = true;
                        return;
                    }
                    if (!dateFound && family.children) {
                        for (const childId of family.children) {
                            if (!dateFound) {
                                checkDescendants(childId, depth + 1, visited);
                            }
                        }
                    }
                }
            }
        }
    }

    // remonter aux ancêtres
    checkAncestors(personId, 0, new Set());

    // remonter au conjoint pour avoir une date
    if (!dateFound) {
        let spouseInfo = null;
        let spouseId = null;
        if (person.spouseFamilies && person.spouseFamilies.length > 0) {
            const firstSpouseFamily = state.gedcomData.families[person.spouseFamilies[0]];
            if (firstSpouseFamily) {
                spouseId = firstSpouseFamily.husband === personId 
                    ? firstSpouseFamily.wife 
                    : firstSpouseFamily.husband;
                
                if (spouseId) {
                    const spouse = state.gedcomData.individuals[spouseId];
                    if (spouse) {
                        if (spouse.birthDate) {
                            return { year: extractYear(spouse.birthDate), type: 'birth' };
                        }
                        if (spouse.deathDate) {
                            return { year: extractYear(spouse.deathDate), type: 'birth' };
                        }                        
                    }
                }
            }
        }

        // remonter aux ancêtres du conjoint pour avoir une date
        if (!dateFound && spouseId) {
            checkAncestors(spouseId, 0, new Set());
        }
    }


    if (!dateFound) {
        checkDescendants(personId, 0, new Set());
    }

    if (dates.length > 0) {
        dates.sort((a, b) => a.depth - b.depth);
        const foundDate = dates[0];
                
        return foundDate;
    }
    
    return null;
}