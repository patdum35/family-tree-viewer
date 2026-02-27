// Système de chargement des bibliothèques avec fallback
// Configuration des ressources avec leurs fallbacks

const isProduction = window.location.pathname.includes('/obfusc/');
const LIBS_PATH = isProduction ? '../libs/' : './libs/';
const resources = [
  {
    id: "leaflet-css",
    type: "css",
    urls: [
      `${LIBS_PATH}leaflet.css`,
      "https://unpkg.com/leaflet@1.7.1/dist/leaflet.css",
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.min.css",
      "https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/leaflet.css"
    ]
  },
  {
    id: "d3-js",
    type: "script",
    urls: [
      `${LIBS_PATH}d3.v7.min.js`,
      "https://d3js.org/d3.v7.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/d3/7.0.0/d3.min.js",
      "https://cdn.jsdelivr.net/npm/d3@7.0.0/dist/d3.min.js"
    ]
  },
  {
    id: "pako-js",
    type: "script",
    urls: [
      `${LIBS_PATH}pako.min.js`,
      "https://cdnjs.cloudflare.com/ajax/libs/pako/2.0.3/pako.min.js",
      "https://cdn.jsdelivr.net/npm/pako@2.0.3/dist/pako.min.js",
      "https://unpkg.com/pako@2.0.3/dist/pako.min.js"
    ]
  },
  {
    id: "lodash-js",
    type: "script",
    urls: [
      `${LIBS_PATH}lodash.min.js`,
      "https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js",
      "https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js",
      "https://unpkg.com/lodash@4.17.21/lodash.min.js"
    ]
  },
  {
    id: "leaflet-js",
    type: "script",
    urls: [
     `${LIBS_PATH}leaflet.js`,
      "https://unpkg.com/leaflet@1.7.1/dist/leaflet.js",
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.min.js",
      "https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/leaflet.js"
    ],
    dependencies: ["leaflet-css"]
  },
  {
    id: "leaflet-heat-js",
    type: "script",
    urls: [
      `${LIBS_PATH}leaflet-heat.js`,
      "https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js",
      "https://cdn.jsdelivr.net/npm/leaflet.heat@0.2.0/dist/leaflet-heat.js",
      "https://rawcdn.githack.com/Leaflet/Leaflet.heat/gh-pages/dist/leaflet-heat.js"
    ],
    dependencies: ["leaflet-js"] // Ce script dépend de leaflet.js
  },
  {
    id: "react-js",
    type: "script",
    urls: [
      `${LIBS_PATH}react.production.min.js`, 
      "https://unpkg.com/react@18/umd/react.production.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js",
      "https://cdn.jsdelivr.net/npm/react@18.2.0/umd/react.production.min.js"
    ]
  },
  {
    id: "react-dom-js",
    type: "script",
    urls: [
      `${LIBS_PATH}react-dom.production.min.js`,
      "https://unpkg.com/react-dom@18/umd/react-dom.production.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js",
      "https://cdn.jsdelivr.net/npm/react-dom@18.2.0/umd/react-dom.production.min.js"
    ],
    dependencies: ["react-js"] // ReactDOM dépend de React
  },
  {
    id: "d3-cloud-js",
    type: "script",
    urls: [
      `${LIBS_PATH}d3.layout.cloud.min.js`,
      "https://cdnjs.cloudflare.com/ajax/libs/d3-cloud/1.2.5/d3.layout.cloud.min.js",
      "https://cdn.jsdelivr.net/npm/d3-cloud@1.2.5/build/d3.layout.cloud.min.js",
      "https://rawcdn.githack.com/jasondavies/d3-cloud/master/build/d3.layout.cloud.js"
    ],
    dependencies: ["d3-js"] // d3-cloud dépend de d3
  },  
];


const loadState = {};
const libraryReport = { cached: [], downloaded: [], failed: [] };

// --- LOG ET BILAN ---
function logResourceStatus(type, id, url, isCache) {
    const icon = isCache ? "📦" : "🌐";
    const source = isCache ? "CACHE" : "RÉSEAU";
    console.log(`${icon} [${type.toUpperCase()}] ${id} : succès depuis ${source} (${url})`);
    
    // On remplit le rapport pour le console.table final
    if (isCache) {
        if (!libraryReport.cached.includes(id)) libraryReport.cached.push(id);
    } else {
        if (!libraryReport.downloaded.includes(id)) libraryReport.downloaded.push(id);
    }
}

// --- LES OUVRIERS ---
function loadScript(resource, urlIndex = 0) {
    if (urlIndex >= resource.urls.length) {
        libraryReport.failed.push(resource.id);
        return Promise.reject();
    }

    return new Promise((resolve, reject) => {
        const url = resource.urls[urlIndex];
        
        // --- LA CLÉ : On lance la vérification cache en PARALLÈLE ---
        // On n'attend pas (pas de await ici) pour ne pas bloquer le chargement
        const cacheCheck = caches.match(url).then(match => !!match);

        const script = document.createElement('script');
        script.id = resource.id;
        script.src = url;
        
        script.onload = async () => {
            const isCache = await cacheCheck; // On récupère le résultat ici
            logResourceStatus("js", resource.id, url, isCache);
            loadState[resource.id] = true;
            resolve();
        };
        
        script.onerror = () => {
            script.remove();
            loadScript(resource, urlIndex + 1).then(resolve).catch(reject);
        };
        document.head.appendChild(script);
    });
}

function loadCSS(resource, urlIndex = 0) {
    if (urlIndex >= resource.urls.length) {
        libraryReport.failed.push(resource.id);
        return Promise.reject();
    }

    return new Promise((resolve, reject) => {
        const url = resource.urls[urlIndex];
        const cacheCheck = caches.match(url).then(match => !!match);

        let link = document.getElementById(resource.id) || document.createElement('link');
        link.id = resource.id;
        link.rel = 'stylesheet';
        link.href = url;
        
        link.onload = async () => {
            const isCache = await cacheCheck;
            logResourceStatus("css", resource.id, url, isCache);
            loadState[resource.id] = true;
            resolve();
        };
        
        link.onerror = () => loadCSS(resource, urlIndex + 1).then(resolve).catch(reject);
        if (!link.parentNode) document.head.appendChild(link);
    });
}

async function loadJSON(resource, urlIndex = 0) {
    if (urlIndex >= resource.urls.length) {
        libraryReport.failed.push(resource.id);
        return Promise.reject();
    }
    const url = resource.urls[urlIndex];
    // Pour JSON/Fetch, on vérifie le cache AVANT le fetch car c'est très rapide
    const isCache = await caches.match(url).then(m => !!m);

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error();
        const data = await response.json();
        
        logResourceStatus("json", resource.id, url, isCache);
        
        if (resource.id === "mespeak-config") window.meSpeak.loadConfig(data);
        else if (resource.id === "mespeak-voice-fr") window.meSpeak.loadVoice(data);
        
        loadState[resource.id] = true;
    } catch (e) {
        return loadJSON(resource, urlIndex + 1);
    }
}

// --- L'AIGUILLEUR ---
function loadResource(resource) {
    if (loadState[resource.id]) return Promise.resolve();
    const loadDeps = () => {
        if (resource.dependencies?.length > 0) {
            return Promise.all(resource.dependencies.map(depId => {
                const dep = resources.find(r => r.id === depId);
                return dep ? loadResource(dep) : Promise.resolve();
            }));
        }
        return Promise.resolve();
    };
    return loadDeps().then(() => {
        if (resource.type === 'css') return loadCSS(resource);
        if (resource.type === 'script') return loadScript(resource);
        if (resource.type === 'json') return loadJSON(resource);
    });
}

// --- LE CHEF D'ORCHESTRE ---
export async function loadAllResources() {
    try {
        console.time("⏱️ Temps de chargement");
        console.log(`🚀 Lancement de ${resources.length} ressources...`);
        
        // Reset des rapports
        libraryReport.cached = []; libraryReport.downloaded = []; libraryReport.failed = [];

        const independent = resources.filter(r => !r.dependencies?.length);
        const dependent = resources.filter(r => r.dependencies?.length > 0);

        // Chargement parallèle (Tout part en même temps : fetch + cache check)
        await Promise.all(independent.map(r => loadResource(r)));

        // Chargement des extensions (Leaflet-heat, etc.)
        for (const r of dependent) {
            await loadResource(r);
        }

        // --- BILAN FINAL ---
        console.group("📊 BILAN DES LIBRAIRIES");
        if (libraryReport.cached.length) {
            console.log(`📦 CACHE (${libraryReport.cached.length}) :`);
            console.table(libraryReport.cached);
        }
        if (libraryReport.downloaded.length) {
            console.log(`🌐 RÉSEAU (${libraryReport.downloaded.length}) :`);
            console.table(libraryReport.downloaded);
        }
        if (libraryReport.failed.length) {
            console.error(`❌ ÉCHECS (${libraryReport.failed.length}) :`);
            console.table(libraryReport.failed);
        }
        console.groupEnd();

        console.timeEnd("⏱️ Temps de chargement");
        document.dispatchEvent(new Event('libraries-loaded'));

    } catch (error) {
        console.error("❌ Erreur critique :", error);
    }
}

window.startAppLoading = loadAllResources;