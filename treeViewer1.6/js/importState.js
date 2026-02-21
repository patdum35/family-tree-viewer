/**
 * importState.js - Registre centralisé des modules dynamiques
 */

// 1. Le Garde du corps (Proxy)
// Il intercepte les appels si le module n'est pas chargé
const createGuard = (moduleName) => new Proxy({}, {
    get: (target, prop) => {
        return (...args) => {
            console.error(`❌ ERREUR : Le module "${moduleName}" n'est pas chargé.`);
            console.warn(`👉 L'appel à "${prop}()" a échoué. Vérifiez l'init dans main.js.`);
            return null; 
        };
    }
});

// 2. Définition du importLinks
/** @typedef {import('./treeOperations.js')} TreeOps */
/** @typedef {import('./treeRenderer.js')} TreeRenderer */
/** @typedef {import('./treeAnimation.js')} TreeAnimation */
/** @typedef {import('./nodeControls.js')} NodeControls */
/** @typedef {import('./nodeRenderer.js')} NodeRenderer */
/** @typedef {import('./mainUI.js')} MainUI */

export const importLinks = {
    _modules: {
        /** @type {TreeOps} */
        treeOperations: null,
        /** @type {TreeRenderer} */
        treeRenderer: null,
        /** @type {TreeAnimation} */
        treeAnimation: null,
        /** @type {NodeControls} */
        nodeControls: null,
        /** @type {NodeRenderer} */
        nodeRenderer: null,
        /** @type {MainUI} */
        mainUI: null
    },

    /** @returns {TreeOps} */
    get treeOperations() { return this._modules.treeOperations || createGuard('treeOperations'); },
    
    /** @returns {TreeRenderer} */
    get treeRenderer()   { return this._modules.treeRenderer   || createGuard('treeRenderer'); },

    /** @returns {TreeAnimation} */
    get treeAnimation()  { return this._modules.treeAnimation  || createGuard('treeAnimation'); },

    /** @returns {NodeControls} */
    get nodeControls()   { return this._modules.nodeControls   || createGuard('nodeControls'); },

    /** @returns {NodeRenderer} */
    get nodeRenderer()   { return this._modules.nodeRenderer   || createGuard('nodeRenderer'); },

    /** @returns {MainUI} */
    get mainUI()   { return this._modules.mainUI   || createGuard('mainUI'); },    
};






/**
 * Fonction utilitaire pour charger un module et l'injecter dans le state
 * À appeler uniquement depuis main.js
 */
export async function loadModule(key, path) {
    try {
        const module = await import(path);
        importLinks._modules[key] = module;
        console.log(`✅ Module chargé avec succès : ${key}`);
        return module;
    } catch (err) {
        console.error(`🚨 Échec du chargement du module : ${key} à l'adresse ${path}`, err);
    }
}