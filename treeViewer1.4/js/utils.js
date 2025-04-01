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
export function findPersonsByName(nameToFind) {
    if (!state.gedcomData || !state.gedcomData.individuals) {
        return [];
    }
    
    // Convertir en minuscules pour une recherche insensible à la casse
    const searchStr = nameToFind.toLowerCase();
    
    // Rechercher parmi tous les individus
    return Object.values(state.gedcomData.individuals)
        .filter(person => {
            const fullName = person.name.toLowerCase().replace(/\//g, '');
            return fullName.includes(searchStr);
        });
}

/**
 * Trouve une personne dont le nom contient une chaîne spécifique
 * @param {string} nameToFind - La chaîne de caractères à rechercher dans les noms
 * @returns {Object|null} - La première personne trouvée ou null si aucune personne ne correspond
 */
export function findPersonByName(nameToFind) {
    // Utiliser findPersonsByName et retourner le premier résultat ou null
    const results = findPersonsByName(nameToFind);
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