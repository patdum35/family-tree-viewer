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