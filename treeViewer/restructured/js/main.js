// ====================================
// Configuration et initialisation
// ====================================
import { parseGEDCOM } from './gedcomParser.js';
import { initializeEventHandlers } from './eventHandlers.js';
import { drawTree } from './treeRenderer.js';
import { findYoungestPerson } from './utils.js';
import { buildAncestorTree, buildDescendantTree } from './treeOperations.js';
import { 
    displayPersonDetails, 
    closePersonDetails,
    setAsRootPerson,
    closeModal
} from './modalWindow.js';
import {
    updatePrenoms,
    updateGenerations,
    zoomIn,
    zoomOut,
    resetZoom,
    searchTree
} from './eventHandlers.js';

export const state = {
    gedcomData: null,
    rootPersonId: null,
    currentTree: null,
    nombre_prenoms: 2,
    nombre_generation: 6,
    boxWidth: 150,
    boxHeight: 50,
    treeMode: 'ancestors' // ou 'descendants'
};
/**
 * Initialise l'application
 */
function initialize() {
    initializeGenerationSelect();
    initializeEventHandlers();
}

/**
 * Initialise le sélecteur de générations
 */
function initializeGenerationSelect() {
    const select = document.getElementById('generations');
    for (let i = 2; i <= 101; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.text = i;
        if (i === 6) option.selected = true;
        select.appendChild(option);
    }
}

/**
 * Charge les données GEDCOM
 */
export async function loadData() {
    const fileInput = document.getElementById('gedFile');
    const passwordInput = document.getElementById('password');
    
    try {
        let gedcomContent = await loadGedcomContent(fileInput, passwordInput);
        state.gedcomData = parseGEDCOM(gedcomContent);
        
        document.getElementById('password-form').style.display = 'none';
        document.getElementById('tree-container').style.display = 'block';
        
        displayGenealogicTree(null, true);  // Appel avec isInit = true
    } catch (error) {
        console.error('Erreur complète:', error);
        alert(error.message);
    }
}

/**
 * Charge le contenu du fichier GEDCOM
 * @private
 */
async function loadGedcomContent(fileInput, passwordInput) {
    if ((!passwordInput.value) && (!fileInput.files[0])) {
        throw new Error('Veuillez sélectionner un fichier');
    }

    if (passwordInput.value) {
        return await loadEncryptedContent(passwordInput.value);
    } else {
        return await loadFileContent(fileInput.files[0]);
    }
}

/**
 * Charge le contenu crypté
 * @private
 */
async function loadEncryptedContent(password) {
    const response = await fetch('arbre.enc');
    const encryptedData = await response.text();
    const decoded = atob(encryptedData);
    
    const key = password.repeat(decoded.length);
    const decrypted = new Uint8Array(decoded.length);
    
    for(let i = 0; i < decoded.length; i++) {
        decrypted[i] = decoded.charCodeAt(i) ^ key.charCodeAt(i);
    }
    
    validatePassword(password, decrypted);
    
    return pako.inflate(decrypted.slice(8), {to: 'string'});
}

/**
 * Valide le mot de passe
 * @private
 */
async function validatePassword(password, decrypted) {
    const expectedHash = decrypted.slice(0, 8);
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', passwordData);
    const actualHash = new Uint8Array(hashBuffer).slice(0, 8);
    
    if (!actualHash.every((val, i) => val === expectedHash[i])) {
        throw new Error('Mot de passe incorrect');
    }
}

/**
 * Charge le contenu du fichier
 * @private
 */
async function loadFileContent(file) {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onload = () => resolve(fileReader.result);
        fileReader.onerror = reject;
        fileReader.readAsText(file);
    });
}

/**
 * Affiche l'arbre généalogique
 * @param {string} rootPersonId - ID optionnel de la personne racine
 * @param {boolean} isInit - Indique s'il s'agit de l'initialisation
 */
export function displayGenealogicTree(rootPersonId = null, isInit = false) {
    state.rootPersonId = rootPersonId || state.rootPersonId;
    const person = state.rootPersonId 
        ? state.gedcomData.individuals[state.rootPersonId] 
        : findYoungestPerson();

    // Si c'est l'initialisation, configurer le sélecteur de personne racine
    if (isInit) {
        const rootPersonResults = document.getElementById('root-person-results');
        rootPersonResults.innerHTML = '';
        
        const option = document.createElement('option');
        option.value = person.id;
        option.textContent = person.name.replace(/\//g, '').trim();
        rootPersonResults.appendChild(option);
        
        rootPersonResults.style.display = 'block';
        rootPersonResults.style.backgroundColor = 'orange';
    }


    updateBoxWidth();
    
    state.currentTree = buildAncestorTree(person.id);
    drawTree();
}




/**
 * Met à jour le mode d'affichage de l'arbre
 * @param {string} mode - 'ancestors' ou 'descendants'
 */
export function updateTreeMode(mode) {
    state.treeMode = mode;

    // Reconstruire l'arbre avec le mode approprié
    state.currentTree = mode === 'ancestors' 
        ? buildAncestorTree(state.rootPersonId)
        : buildDescendantTree(state.rootPersonId);

    // Redessiner l'arbre
    drawTree();
}



/**
 * Met à jour la largeur des boîtes en fonction du nombre de prénoms
 * @private
 */
function updateBoxWidth() {
    if (typeof state.nombre_prenoms === 'string') {
        state.nombre_prenoms = parseInt(state.nombre_prenoms, 10);
    }
    state.boxWidth = state.nombre_prenoms === 1 ? 90 : 120;
}

// Export des variables et fonctions nécessaires
export {
    displayPersonDetails,
    closePersonDetails,
    setAsRootPerson,
    closeModal,
    updatePrenoms,
    updateGenerations,
    zoomIn,
    zoomOut,
    resetZoom,
    searchTree
};

window.addEventListener('load', initialize);
