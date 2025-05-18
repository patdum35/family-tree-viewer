// const CACHE_NAME = 'treeViewer-app-v3';
// if (typeof CACHE_NAME === 'undefined') {
//     const CACHE_NAME = 'treeViewer-app-v4';
//   }


  // cacheConfig.js - Seul endroit où le nom du cache est défini
const CACHE_NAME = 'treeViewer-app-v4';

// Exporter pour le contexte de Service Worker
if (typeof self !== 'undefined' && self.constructor && 
    self.constructor.name === 'ServiceWorkerGlobalScope') {
    self.CACHE_NAME = CACHE_NAME;
}

// Exporter pour le contexte Window (page web)
if (typeof window !== 'undefined') {
    window.CACHE_NAME = CACHE_NAME;
}