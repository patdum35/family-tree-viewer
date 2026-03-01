// Système de chargement des bibliothèques avec fallback
// Configuration des ressources avec leurs fallbacks
const resources = [
  {
    id: "leaflet-css",
    type: "css",
    urls: [
      "./libs/leaflet.css",
      "https://unpkg.com/leaflet@1.7.1/dist/leaflet.css",
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.min.css",
      "https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/leaflet.css"
    ]
  },
  {
    id: "d3-js",
    type: "script",
    urls: [
      "./libs/d3.v7.min.js",
      "https://d3js.org/d3.v7.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/d3/7.0.0/d3.min.js",
      "https://cdn.jsdelivr.net/npm/d3@7.0.0/dist/d3.min.js"
    ]
  },
  {
    id: "pako-js",
    type: "script",
    urls: [
      "./libs/pako.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/pako/2.0.3/pako.min.js",
      "https://cdn.jsdelivr.net/npm/pako@2.0.3/dist/pako.min.js",
      "https://unpkg.com/pako@2.0.3/dist/pako.min.js"
    ]
  },
  {
    id: "lodash-js",
    type: "script",
    urls: [
      "./libs/lodash.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js",
      "https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js",
      "https://unpkg.com/lodash@4.17.21/lodash.min.js"
    ]
  },
  {
    id: "leaflet-js",
    type: "script",
    urls: [
      "./libs/leaflet.js",
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
      "./libs/leaflet-heat.js",
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
      "./libs/react.production.min.js", 
      "https://unpkg.com/react@18/umd/react.production.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js",
      "https://cdn.jsdelivr.net/npm/react@18.2.0/umd/react.production.min.js"
    ]
  },
  {
    id: "react-dom-js",
    type: "script",
    urls: [
      "./libs/react-dom.production.min.js",
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
      "./libs/d3.layout.cloud.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/d3-cloud/1.2.5/d3.layout.cloud.min.js",
      "https://cdn.jsdelivr.net/npm/d3-cloud@1.2.5/build/d3.layout.cloud.min.js",
      "https://rawcdn.githack.com/jasondavies/d3-cloud/master/build/d3.layout.cloud.js"
    ],
    dependencies: ["d3-js"] // d3-cloud dépend de d3
  },  
];






// Ajouter une fonction pour charger les ressources JSON
function loadJSON(resource, urlIndex = 0) {
  // Si toutes les URL ont été essayées sans succès
  if (urlIndex >= resource.urls.length) {
    console.error(`Échec de chargement du JSON ${resource.id} après avoir essayé toutes les sources`);
    return Promise.reject(new Error(`Failed to load JSON ${resource.id}`));
  }
  
  return new Promise((resolve, reject) => {
    fetch(resource.urls[urlIndex])
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log(`JSON chargé avec succès: ${resource.id} depuis ${resource.urls[urlIndex]}`);
        
        // Pour meSpeak, initialiser avec les données
        if (resource.id === "mespeak-config") {
          window.meSpeak.loadConfig(data);
        } else if (resource.id === "mespeak-voice-fr") {
          window.meSpeak.loadVoice(data);
        }
        
        loadState[resource.id] = true;
        resolve();
      })
      .catch(error => {
        console.warn(`Échec de chargement du JSON ${resource.id} depuis ${resource.urls[urlIndex]}, essai de la source suivante...`);
        loadJSON(resource, urlIndex + 1).then(resolve).catch(reject);
      });
  });
}




// État de chargement des ressources
const loadState = {};

// Fonction pour charger une feuille de style CSS
function loadCSS(resource, urlIndex = 0) {
  // Si toutes les URL ont été essayées sans succès
  if (urlIndex >= resource.urls.length) {
    console.error(`Échec de chargement du CSS ${resource.id} après avoir essayé toutes les sources`);
    return Promise.reject(new Error(`Failed to load CSS ${resource.id}`));
  }
  
  return new Promise((resolve, reject) => {
    // Remplacer l'élément existant s'il existe
    let linkElement = document.getElementById(resource.id);
    if (!linkElement) {
      linkElement = document.createElement('link');
      linkElement.id = resource.id;
      linkElement.rel = 'stylesheet';
      document.head.appendChild(linkElement);
    }
    
    linkElement.href = resource.urls[urlIndex];
    
    // Gérer le succès
    linkElement.onload = () => {
      console.log(`CSS chargé avec succès: ${resource.id} depuis ${resource.urls[urlIndex]}`);
      loadState[resource.id] = true;
      resolve();
    };
    
    // Gérer l'échec et essayer la prochaine URL
    linkElement.onerror = () => {
      console.warn(`Échec de chargement du CSS ${resource.id} depuis ${resource.urls[urlIndex]}, essai de la source suivante...`);
      loadCSS(resource, urlIndex + 1).then(resolve).catch(reject);
    };
  });
}

// Fonction pour charger un script JS
function loadScript(resource, urlIndex = 0) {
  // Si toutes les URL ont été essayées sans succès
  if (urlIndex >= resource.urls.length) {
    console.error(`Échec de chargement du script ${resource.id} après avoir essayé toutes les sources`);
    return Promise.reject(new Error(`Failed to load script ${resource.id}`));
  }
  
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = resource.id;
    script.src = resource.urls[urlIndex];
    
    // Gérer le succès
    script.onload = () => {
      console.log(`Script chargé avec succès: ${resource.id} depuis ${resource.urls[urlIndex]}`);
      loadState[resource.id] = true;
      resolve();
    };
    
    // Gérer l'échec et essayer la prochaine URL
    script.onerror = () => {
      console.warn(`Échec de chargement du script ${resource.id} depuis ${resource.urls[urlIndex]}, essai de la source suivante...`);
      // Supprimer l'élément script qui a échoué
      script.remove();
      loadScript(resource, urlIndex + 1).then(resolve).catch(reject);
    };
    
    document.head.appendChild(script);
  });
}





// Mise à jour de la fonction loadResource pour gérer le type JSON
function loadResource(resource) {
  // Vérifier si la ressource est déjà chargée
  if (loadState[resource.id]) {
    return Promise.resolve();
  }
  
  // Charger les dépendances d'abord
  const loadDependencies = () => {
    if (resource.dependencies && resource.dependencies.length > 0) {
      const dependencyPromises = resource.dependencies.map(depId => {
        const depResource = resources.find(r => r.id === depId);
        if (depResource) {
          return loadResource(depResource);
        }
        return Promise.resolve(); // Ignorer les dépendances non trouvées
      });
      return Promise.all(dependencyPromises);
    }
    return Promise.resolve();
  };
  
  // Une fois les dépendances chargées, charger cette ressource
  return loadDependencies().then(() => {
    if (resource.type === 'css') {
      return loadCSS(resource);
    } else if (resource.type === 'script') {
      return loadScript(resource);
    } else if (resource.type === 'json') {
      return loadJSON(resource);
    }
    return Promise.reject(new Error(`Type de ressource inconnu: ${resource.type}`));
  });
}


// Charger toutes les ressources en séquence pour respecter les dépendances
async function loadAllResources() {
  try {
    // Charger les ressources en séquence pour respecter l'ordre des dépendances
    for (const resource of resources) {
      await loadResource(resource);

    }
    

    
    console.log("Toutes les bibliothèques ont été chargées avec succès!");
    
    // Déclencher un événement pour signaler que tout est chargé
    document.dispatchEvent(new Event('libraries-loaded'));
    
  } catch (error) {
    console.error("Erreur lors du chargement des bibliothèques:", error);
  }
}





// Démarrer le chargement quand le DOM est prêt
function initLibraryLoader() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAllResources);
  } else {
    loadAllResources();
  }
}

// Exporter les fonctions qui pourraient être nécessaires ailleurs
export {
  initLibraryLoader,
  loadAllResources,
  resources
};

// Initialiser automatiquement le chargeur
initLibraryLoader();