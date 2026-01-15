// ====================================
// Fonctions utilitaires
// ====================================
import { state } from './main.js';

/**
 * Vérifie si un nœud est masqué dans l'arbre
 * @param {Object} node - Le nœud à vérifier
 * @returns {boolean} - true si le nœud est masqué
 */
export function isNodeHidden(node) {
    let current = node;
    while (current) {
        if (current.data._hiddenDescendants || 
            current.data._isDescendantNode ||
            (current.parent && current.parent.data._hiddenDescendants)) {
            return true;
        }
        current = current.parent;
    }
    return false;
}

/**
 * Extrait l'année d'une chaîne de date
 * @param {string} dateString - La date au format string
 * @returns {string} - L'année extraite ou '0'
 */
export function extractYear(dateString) {
    if (!dateString) return '0';
    const parts = dateString.split(' ');
    const year = parts[parts.length - 1];
    return parseInt(year) || '0';
}


// export function extractYear(dateString) {
//     if (!dateString) return '0';
//     const parts = dateString.split(' ');
    
//     // Chercher un nombre à 4 chiffres, sans restriction
//     const yearMatch = dateString.match(/\b(\d{4})\b/);
    
//     if (yearMatch) {
//         const year = parseInt(yearMatch[1]);
//         return year;
//     }
    
//     // Fallback sur la méthode originale si pas de match
//     const year = parts[parts.length - 1];
//     return parseInt(year) || '0';
// }


/**
 * Trouve la personne la plus jeune dans les données GEDCOM
 * @returns {Object} - La personne la plus jeune
 */
export function findYoungestPerson() {
    const personsWithBirthDate = Object.values(state.gedcomData.individuals)
        .filter(person => {
            if (!person.birthDate) return false;
            
            try {
                const birthYear = extractYear(person.birthDate);
                const birthYearNum = parseInt(birthYear);
                return !isNaN(birthYearNum) && birthYearNum > 0 && birthYearNum <= new Date().getFullYear();
            } catch (error) {
                return false;
            }
        });

    const youngest = personsWithBirthDate.sort((a, b) => {
        const yearA = parseInt(extractYear(a.birthDate));
        const yearB = parseInt(extractYear(b.birthDate));
        return yearB - yearA;
    })[0];

    if (!youngest) {
        console.error("Aucune personne valide trouvée");
        return Object.values(state.gedcomData.individuals)[0];
    }

    return youngest;
}

/**
 * Trouve toutes les personnes dont le nom contient une chaîne spécifique
 * @param {string} nameToFind - La chaîne de caractères à rechercher dans les noms
 * @returns {Array} - Tableau des personnes trouvées ou tableau vide si aucune personne ne correspond
 */
// export function findPersonsByName(nameToFind, date = null) {
//     if (!state.gedcomData || !state.gedcomData.individuals) {
//         return [];
//     }
    
//     // Convertir en minuscules pour une recherche insensible à la casse
//     const searchStr = nameToFind.toLowerCase();

//     console.log("\n\n\n in findPersonsByName: Recherche de personnes avec le nom contenant :", searchStr, '\n\n\n');
    
//     // Rechercher parmi tous les individus
//     let count = 0
//     return Object.values(state.gedcomData.individuals)
//         .filter(person => {
//             count += 1;
//             const fullName = person.name.toLowerCase().replace(/\//g, '');
//             if (count >6344 && count < 6370) {console.log("Vérification de la personne :", person.name, 'fullName' , fullName, 'searchStr=', searchStr, 'count', count, person);}

//             return fullName.includes(searchStr);
//         });
// }


/**
 * Trouve toutes les personnes dont le nom contient une chaîne spécifique
 * @param {string} nameToFind - La chaîne de caractères à rechercher dans les noms
 * @returns {Array} - Tableau des personnes trouvées ou tableau vide si aucune personne ne correspond
 */
export function findPersonsByName(nameToFind, date = null) {
    if (!state.gedcomData || !state.gedcomData.individuals) {
        return [];
    }

    const searchStr = nameToFind.toLowerCase();
    // On prépare la date en string pour la comparaison si elle existe

    const dateStr = date ? date.toString() : null;
    // let count = 0
    return Object.values(state.gedcomData.individuals)
        .filter(person => {

            // count += 1;
            // 1. Vérification du nom (toujours requise)
            const fullName = person.name.toLowerCase().replace(/\//g, '');
            const nameMatches = fullName.includes(searchStr);

            // Si le nom ne matche pas, on s'arrête là
            if (!nameMatches) return false;

            // 2. Vérification de la date (seulement si 'date' est fournie)
            if (dateStr) {
                const birthDate = person.birthDate ? person.birthDate.toString() : "";
                // const birthYear = extractYear(person.birthDate);
                const deathDate = person.deathDate ? person.deathDate.toString() : "";
                // const deathYear = extractYear(person.deathDate);

                // if (count >6344 && count < 6370) {console.log("Vérification de la personne :", person.name, 'fullName' , fullName, 'searchStr=', searchStr, 'count', count, person);}                
                // On garde la personne seulement si la date est incluse dans l'un des deux champs

                return birthDate.includes(dateStr) || deathDate.includes(dateStr) ;
            }

            // Si aucune date n'est fournie, le match sur le nom suffit
            return true;
        });
}







/**
 * Trouve une personne dont le nom contient une chaîne spécifique
 * @param {string} nameToFind - La chaîne de caractères à rechercher dans les noms
 * @returns {Object|null} - La première personne trouvée ou null si aucune personne ne correspond
 */
export function findPersonByName(nameToFind, date = null) {
    // Utiliser findPersonsByName et retourner le premier résultat ou null
    const results = findPersonsByName(nameToFind, date);
    return results.length > 0 ? results[0] : null;
}



// /**
//  * Vérifie si une personne a des descendants
//  * @param {string} personId - ID de la personne à vérifier
//  * @returns {boolean} - true si la personne a des descendants
//  */
// export function hasDescendants(personId) {
//     const person = state.gedcomData.individuals[personId];
//     if (!person || !person.spouseFamilies) return false;

//     return person.spouseFamilies.some(famId => {
//         const family = state.gedcomData.families[famId];
//         return family && family.children && family.children.length > 0;
//     });
// }

/**
 * Formate du texte pour l'affichage
 * @param {string} text - Le texte à formater
 * @param {number} width - La largeur maximale
 * @returns {string[]} - Les lignes formatées
 */
export function formatText(text, width) {
    const words = text.split(' ');
    const lines = [""];
    let line = 0;
    
    words.forEach(word => {
        const testLine = lines[line] + word + " ";
        if (testLine.length * 6 > width) {
            lines.push(word + " ");
            line++;
        } else {
            lines[line] = testLine;
        }
    });
    return lines;
}

/**
 * Formate un nom de famille
 * @param {string} text - Le texte à formater
 * @returns {Array} - Les mots formatés
 */
export function formatLastWord(text) {
    const words = text.split(' ');
    const lastName = words[words.length - 1];
    const formattedLastName = lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();
    words[words.length - 1] = formattedLastName;
    return words;
}