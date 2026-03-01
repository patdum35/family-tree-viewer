 // cacheConfig.js - Seul endroit où le nom du cache est défini
const CACHE_NAME = 'treeViewer-app-v9';

// Exporter pour le contexte de Service Worker
if (typeof self !== 'undefined' && self.constructor && 
    self.constructor.name === 'ServiceWorkerGlobalScope') {
    self.CACHE_NAME = CACHE_NAME;
}

// Exporter pour le contexte Window (page web)
if (typeof window !== 'undefined') {
    window.CACHE_NAME = CACHE_NAME;
}