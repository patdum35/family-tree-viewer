// Mapping des images pour chaque période historique précise
const periodImages = {
    // Période antique
    'antiquite': {
        startYear: -800,
        endYear: 481,
        image: 'background_images/antiquite.jpg'
    },
    // Mérovingiens
    'merovingiens': {
        startYear: 481,
        endYear: 751,
        image: 'background_images/merovingiens.jpg'
    },
    // Carolingiens
    'carolingiens': {
        startYear: 751,
        endYear: 987,
        image: 'background_images/carolingiens.jpg'
    },
    // Capétiens
    'capetiens': {
        startYear: 987,
        endYear: 1328,
        image: 'background_images/capetiens.jpg'
    },
    // Valois
    'valois': {
        startYear: 1328,
        endYear: 1589,
        image: 'background_images/valois.jpg'
    },
    // Bourbons
    'bourbons': {
        startYear: 1589,
        endYear: 1792,
        image: 'background_images/bourbons.jpg'
    },
    // Révolution
    'revolution': {
        startYear: 1792,
        endYear: 1804,
        image: 'background_images/revolution.jpg'
    },
    // Empire
    'empire': {
        startYear: 1804,
        endYear: 1814,
        image: 'background_images/empire.jpg'
    },
    // Restauration
    'restauration': {
        startYear: 1814,
        endYear: 1848,
        image: 'background_images/restauration.jpg'
    },
    // Second Empire et République
    'republique': {
        startYear: 1848,
        endYear: 1900,
        image: 'background_images/republique.jpg'
    },
    // Période contemporaine
    'contemporain': {
        startYear: 1900,
        endYear: 2100,
        image: 'background_images/contemporain.jpg'
    }
};

function getImageForYear(year) {
    // Trouver la période correspondant à l'année
    for (const [period, data] of Object.entries(periodImages)) {
        if (year >= data.startYear && year <= (data.endYear || 2100)) {
            return data.image;
        }
    }
    // Image par défaut si aucune période ne correspond
    return periodImages.contemporain.image;
}

let currentImage = null;
let nextImage = null;


export function initBackgroundContainer() {
    // Créer le conteneur s'il n'existe pas
    if (!document.querySelector('.background-container')) {
        const container = document.createElement('div');
        container.className = 'background-container';
        document.body.insertBefore(container, document.body.firstChild);
        console.log("debug0, initBackgroundContainer")    

    }
}


export function updateBackgroundImage(year) {
    console.log("Année reçue:", year);
    const newImageSrc = getImageForYear(year);
    console.log("Image sélectionnée:", newImageSrc);
    
    const container = document.querySelector('.background-container');
    if (!container) {
        return;
    }

    // Créer l'image si elle n'existe pas
    let img = container.querySelector('.background-image');
    if (!img) {
        img = document.createElement('img');
        img.className = 'background-image';
        container.appendChild(img);
    }

    // Définir la source de l'image
    img.src = newImageSrc;
    
    // Forcer l'opacité
    img.style.opacity = '0.15';
    
}