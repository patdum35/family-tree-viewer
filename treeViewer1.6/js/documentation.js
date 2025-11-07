
import { getCachedResourceUrl } from './photoPlayer.js';

/**
 * @file documentation.js
 * Ce fichier contient la fonction documentation() exportée avec le multilingue intégré.
 */

const DOC_CONTENT = {
    // --- Français (FR) ---
    fr: {
        title: "Aide 🚀",
        // Clé: ID interne de l'onglet, Valeur: Nom affiché
        tabs: {
            summary: '📖Aperçu',
            login: '🔑login',
            tree: '🌳Arbre',
            radar: '🎯Radar',
            cloud: '💖Nuage',
            stats: 'Stats',
            root: '√ Racine',
            geoloc: '🌍Geoloc',
            faq: '❓FAQ',
            contact: '📞Contact',
        },
        summary: `
            <div class="help-section">
                <h3>Première visualisation de votre arbre</h3>
                <p>Découvrez les différents types de vues pour votre arbre généalogique</p>
                <div class="image-example">
                    <div class="media-injection-point tree-image-container"></div>
                    <p class="caption">Fig. 1: Vue Classique de l'Arbre 🌳</p>
                    <br><div class="media-injection-point radar-image-container"></div>
                    <p class="caption">Fig. 2: Vue de l'arbre en mode radar 🎯</p>
                    <br><div class="media-injection-point cloudNames-image-container"></div>
                    <p class="caption">Fig. 3: Vue de l'arbre en mode nuage de mots 💖</p>
                    </div>
            </div>
            <div class="help-section">
                <h3>Interactions et Zoom</h3>
                <ol>
                    <li>Cliquez sur un individu pour afficher son profil détaillé.</li>
                    <li>Utilisez la **molette** pour zoomer, et glissez la souris pour déplacer la vue.</li>
                    <li>Pour voir une démonstration complète, lancez la vidéo ci-dessous.</li>
                </ol>
                <div class="video-example">
                    <h4>🎬 Démonstration Rapide des Vues (30s)</h4>
                    <div class="media-injection-point video-demo-container"></div>
                </div>
            </div>
            <div class="warning-box">
                L'import de très grands fichiers GEDCOM peut prendre quelques instants selon votre navigateur.
            </div>

                `,
        login: `
            <div class="help-section">
                <h3>comment se logger et démarrer</h3>
                <div class="video-example">
                    <h4>🎬 Démonstration Rapide </h4>
                    <div class="media-injection-point video-demo-container"></div>
                </div>>
            </div>

        `,
        tree: `
            <div class="help-section">
                <h3>La Vue en arbre 🌳 </h3>
                <p>C'est la fonctionnalité de base! Elle permet de visualiser jusqu'à 100 générations à perir d'un personne racine.</p>
                <div class="image-example">
                    <div class="media-injection-point tree-image-container"></div>
                    <p class="caption">Fig. 1: Vue de l'arbre en mode 🌳</p>
                    <br><div class="media-injection-point treeDetails-image-container"></div>
                    <p class="caption">Fig. 2: affichage de la fiche détaillés d'une personne de l'arbre 🌳</p>
                    <br><div class="media-injection-point treeGeoloc-image-container"></div>
                    <p class="caption">Fig. 3: geolocalistion 🌍 des personnes de l'arbre visibles à l'écran</p>
                </div>
            </div>
            <div class="warning-box">
                L'import de très grands fichiers GEDCOM peut prendre quelques instants selon votre navigateur.
            </div>
        `,

        radar: `
            <div class="help-section">
                <h3>La Vue Radiale (Roue) 🎯</h3>
                <p>C'est notre fonctionnalité signature! Elle permet de visualiser jusqu'à 100 générations autour d'un individu central (racine).</p>
                <div class="image-example">
                    <div class="media-injection-point radar-image-container"></div>
                </div>
            </div>
            <div class="warning-box">
                L'import de très grands fichiers GEDCOM peut prendre quelques instants selon votre navigateur.
            </div>
        `,
        cloud: `
            <div class="help-section">
                <h3>La Vue en  nuage de mots 💖 </h3>
                <p>Elle permet de visualiser l'arbre sous une forme originale en nuage de mots.</p>
                <div class="image-example">
                    <div class="media-injection-point cloudFirstNames-image-container"></div>
                    <p class="caption">Fig. 1: Vue en nuage de mots de l'arbre pour les prénoms </p>
                    <br><div class="media-injection-point cloudNames-image-container"></div>
                    <p class="caption">Fig. 2: Vue en nuage de mots de l'arbre pour les noms </p>
                    <br><div class="media-injection-point cloudNamesHeatmap-image-container"></div>
                    <p class="caption">Fig. 3: Vue en nuage de mots de l'arbre pour les noms avec heatmpa </p>
                    <br><div class="media-injection-point cloudProfessions-image-container"></div>
                    <p class="caption">Fig. 4: Vue en nuage de mots de l'arbre pour les métiers </p>
                    <br><div class="media-injection-point cloudLifeSpan-image-container"></div>
                    <p class="caption">Fig. 5: Vue en nuage de mots de l'arbre pour les durées de vie </p>
                    <br><div class="media-injection-point cloudLifeSpanGraph-image-container"></div>
                    <p class="caption">Fig. 6: Vue en nuage de mots de l'arbre pour les les durées de vie avec graphe </p>
                    <br><div class="media-injection-point cloudLifeSpanCenturyGraph-image-container"></div>
                    <p class="caption">Fig. 7: Vue en nuage de mots de l'arbre pour les les durées de vie avec graphe par siècle </p>
                </div>
            </div>
            <div class="warning-box">
                L'import de très grands fichiers GEDCOM peut prendre quelques instants selon votre navigateur.
            </div>
        `,
        stats: `
            <div class="help-section">
                <h3>Statistiques </h3>
                <p>Permet de visualiser les statistiques de l'arbre</p>
                <div class="media-injection-point stats-image-container"></div>
            </div>
            <div class="warning-box">
                L'import de très grands fichiers GEDCOM peut prendre quelques instants selon votre navigateur.
            </div>
        `,
        root: `
            <div class="help-section">
                <h3>changement et recherche d'un personne racine</h3>
            </div>
            <div class="warning-box">
                L'import de très grands fichiers GEDCOM peut prendre quelques instants selon votre navigateur.
            </div>
        `,
        geoloc: `
            <div class="help-section">
                <h3>Géolocalisation</h3>
            </div>
            <div class="warning-box">
                L'import de très grands fichiers GEDCOM peut prendre quelques instants selon votre navigateur.
            </div>
        `,
        faq: `
            <div class="help-section">
                <h3>Questions les plus féquentes?</h3>
                <p>Cliquez sur l'icône de la maison (<span style="font-size: 1.2em;">🏠</span>) pour centrer et redimensionner l'arbre complet.</p>
            </div>
        `,
        contact: `
            <div class="help-section">
                <h3>Contact et support technique</h3>
                <p>Notre équipe est là pour vous aider !</p>
            </div>
        `
    },
    // --- English (EN) --- (Les images doivent aussi être définies ici si nécessaire)
    en: { /* ... contenu anglais inchangé ... */ },
    es: { /* ... contenu espagnol inchangé ... */ },
    hu: { /* ... contenu hongrois inchangé ... */ }
};

// ----------------------------------------------------
// 2. Métadonnées des Ressources (L'endroit où vous gérez les fichiers)
// ----------------------------------------------------

const RESOURCE_METADATA = [
    { 
        targetClass: 'tree-image-container', 
        type: 'image', // Type de média pour savoir quelle balise créer
        path: 'doc/images/tree.jpx', // Image cryptée
        styles: 'width: 100%; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);'
    },
    { 
        targetClass: 'treeDetails-image-container', 
        type: 'image', // Type de média pour savoir quelle balise créer
        path: 'doc/images/detail.jpx', // Image cryptée
        styles: 'width: 100%; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);'
    },
    { 
        targetClass: 'treeGeoloc-image-container', 
        type: 'image', // Type de média pour savoir quelle balise créer
        path: 'doc/images/geoloc.jpx', // Image cryptée
        styles: 'width: 100%; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);'
    },
    { 
        targetClass: 'radar-image-container', 
        type: 'image', 
        path: 'doc/images/radar.jpx', // Image JPG normale ou 'doc/radar.jpx'
        styles: 'width: 80%; border: 1px solid #ddd; margin-top: 15px;'
    },
    { 
        targetClass: 'cloudFirstNames-image-container', 
        type: 'image', 
        path: 'doc/images/nuage_prenoms.jpx', // Image JPG normale ou 'doc/radar.jpx'
        styles: 'width: 80%; border: 1px solid #ddd; margin-top: 15px;'
    },
    { 
        targetClass: 'cloudNames-image-container', 
        type: 'image', 
        path: 'doc/images/nuage_noms.jpx', // Image JPG normale ou 'doc/radar.jpx'
        styles: 'width: 80%; border: 1px solid #ddd; margin-top: 15px;'
    },
    { 
        targetClass: 'cloudNamesHeatmap-image-container', 
        type: 'image', 
        path: 'doc/images/heatmap_noms.jpx', // Image JPG normale ou 'doc/radar.jpx'
        styles: 'width: 80%; border: 1px solid #ddd; margin-top: 15px;'
    },    
    { 
        targetClass: 'cloudProfessions-image-container', 
        type: 'image', 
        path: 'doc/images/nuage_metiers.jpx', // Image JPG normale ou 'doc/radar.jpx'
        styles: 'width: 80%; border: 1px solid #ddd; margin-top: 15px;'
    },
    { 
        targetClass: 'cloudPlaces-image-container', 
        type: 'image', 
        path: 'doc/images/nuage_lieux.jpx', // Image JPG normale ou 'doc/radar.jpx'
        styles: 'width: 80%; border: 1px solid #ddd; margin-top: 15px;'
    },
    { 
        targetClass: 'cloudLifeSpan-image-container', 
        type: 'image', 
        path: 'doc/images/nuage_dureeVie.jpx', // Image JPG normale ou 'doc/radar.jpx'
        styles: 'width: 80%; border: 1px solid #ddd; margin-top: 15px;'
    },     
    { 
        targetClass: 'cloudLifeSpanGraph-image-container', 
        type: 'image', 
        path: 'doc/images/graph_dureeVie.jpx', // Image JPG normale ou 'doc/radar.jpx'
        styles: 'width: 80%; border: 1px solid #ddd; margin-top: 15px;'
    },    
    { 
        targetClass: 'cloudLifeSpanCenturyGraph-image-container', 
        type: 'image', 
        path: 'doc/images/centuryGraph_dureeVie.jpx', // Image JPG normale ou 'doc/radar.jpx'
        styles: 'width: 80%; border: 1px solid #ddd; margin-top: 15px;'
    },      
    { 
        targetClass: 'video-demo-container', 
        type: 'video', 
        // path: 'doc/videos/loginTree.mp4', // Vidéo cryptée (ou .mp4 si non cryptée)
        path: 'doc/videos/loginTree.mvx', // Vidéo cryptée (ou .mp4 si non cryptée)
        styles: 'width: 100%; max-width: 500px; border-radius: 8px;'
    },

    // Ajoutez simplement d'autres objets ici pour plus d'images/vidéos
];



/**
 * Décrypte la ressource et l'injecte dans TOUS les conteneurs cibles (par classe).
 * @param {object} resourceMeta - Métadonnées de la ressource (maintenant avec targetClass).
 */
async function injectResource(resourceMeta) {
    // 💥 CHANGEMENT CLÉ : Utiliser querySelectorAll pour obtenir une liste de tous les éléments
    const targetElements = document.querySelectorAll(`.${resourceMeta.targetClass}`);
    
    // S'il ne trouve aucun élément, on sort
    if (targetElements.length === 0) return; 
    
    try {
        // 1. Appel de votre fonction asynchrone pour obtenir l'URL Blob
        const resourceUrl = await getCachedResourceUrl(resourceMeta.path);

        // 2. Création de la balise appropriée (à l'extérieur de la boucle)
        let baseElement;
        
        if (resourceMeta.type === 'image') {
            baseElement = document.createElement('img');
            baseElement.alt = resourceMeta.alt || 'Ressource visuelle';

        } else if (resourceMeta.type === 'video' || resourceMeta.type === 'audio') {
            baseElement = document.createElement(resourceMeta.type);
            baseElement.controls = true; 
            baseElement.autoplay = false;
        } else {
            // Gérer l'erreur si besoin pour le premier élément
            targetElements[0].innerHTML = `<p style="color: orange;">Type de média '${resourceMeta.type}' non supporté.</p>`;
            return;
        }

        // Configuration et styles
        baseElement.src = resourceUrl;
        baseElement.style.cssText = resourceMeta.styles || ''; 

        // 3. Injection dans CHAQUE conteneur trouvé
        targetElements.forEach(targetElement => {
            // 💡 IMPORTANT : Cloner l'élément pour ne pas le déplacer, mais le dupliquer
            const mediaElement = baseElement.cloneNode(true);
            targetElement.innerHTML = ''; // Nettoyer le conteneur
            targetElement.appendChild(mediaElement);
        });

    } catch (error) {
        console.error(`Échec du chargement ou de l'injection pour ${resourceMeta.path}:`, error);
        // Afficher l'erreur sur le premier conteneur trouvé
        targetElements[0].innerHTML = `<p style="color: red;">Erreur de chargement de la ressource.</p>`;
    }
}



/**
 * Exécute l'injection pour toutes les ressources définies.
 * @param {Array<object>} resourceMetadata - Tableau des métadonnées.
 */
async function runResourceInjection(resourceMetadata) {
    // Utiliser Promise.all pour lancer toutes les injections en même temps et attendre qu'elles soient toutes terminées
    const injectionPromises = resourceMetadata.map(meta => injectResource(meta));
    await Promise.all(injectionPromises);
}


// ----------------------------------------------------
// 4. Fonction principale exportée (MAJ : `async` et appel à l'injection)
// ----------------------------------------------------

// export async function documentation() {
export function documentation() {
    // Détermine la langue (utilise 'fr' par défaut)
    const lang = window.CURRENT_LANGUAGE || 'fr'; 

    // Injecte les styles une seule fois
    if (!document.getElementById('doc-style')) {
        injectStyles();
    }
    // Crée le modal une seule fois
    if (!document.getElementById('helpModal')) {
        createDocumentationModal();
        addModalListeners();
    }



    

    // Récupère le contenu et met à jour le modal (pour le multilingue ou l'ajout de tabs)
    const content = DOC_CONTENT[lang] || DOC_CONTENT['fr'];
    updateDocumentationContent(content);
    

    // Afficher le modal immédiatement (TRES IMPORTANT !)
    document.getElementById('helpModal').classList.add('active');
    document.body.style.overflow = 'hidden';


    //💥 Lancer l'injection en arrière-plan (sans 'await').
    // L'injection se fait, mais le code CONTINU immédiatement après cette ligne.
    // await runResourceInjection(RESOURCE_METADATA);
    runResourceInjection(RESOURCE_METADATA);

    // Affiche le modal
    document.getElementById('helpModal').classList.add('active');
    document.body.style.overflow = 'hidden'; // Empêche le scroll de l'arrière-plan
}


// ----------------------------------------------------
// 5. Fonctions d'aide (Logique de l'interface) - INCHANGÉES SAUF L'APPEL AU DESSUS
// ----------------------------------------------------

function closeHelp() {
    const modal = document.getElementById('helpModal');
    if (modal) {
        modal.classList.remove('active');
    }
    document.body.style.overflow = '';
}

function closeHelpOnOverlay(event) {
    if (event.target.id === 'helpModal') {
        closeHelp();
    }
}

function addModalListeners() {
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeHelp();
        }
    });
    // Rend closeHelp disponible globalement pour le onclick du HTML injecté
    window.closeHelp = closeHelp; 
    
    // Ferme si on clique sur l'overlay (en dehors du modal)
    document.getElementById('helpModal').addEventListener('click', closeHelpOnOverlay);
}

function switchTab(tabName, clickedButton) {
    // 1. Désactiver tous les onglets
    document.querySelectorAll('.modal-tabs .tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.modal-content-container .tab-content').forEach(content => content.classList.remove('active'));

    // 2. Activer l'onglet sélectionné
    if (clickedButton) {
        clickedButton.classList.add('active');

        // Faire défiler l'onglet pour qu'il soit entièrement visible horizontalement
        clickedButton.scrollIntoView({
            behavior: 'smooth', 
            block: 'nearest',   
            inline: 'nearest'   
        });
    }

    // 3. Afficher le contenu de l'onglet
    const targetContent = document.getElementById(tabName);
    if (targetContent) {
        targetContent.classList.add('active');
    }
    
    // Si vous voulez injecter les images SEULEMENT quand l'onglet est actif,
    // vous pouvez déplacer l'appel `runResourceInjection` ici.
    // Mais le faire une seule fois au chargement est plus simple.
}

function createDocumentationModal() {
    // Crée la structure principale du modal
    const modalHTML = `
        <div class="modal-overlay" id="helpModal">
            <div class="help-modal">
                <div class="modal-header">
                    <h2 id="modal-title"></h2>
                    <button class="close-button" onclick="closeHelp()">&times;</button>
                </div>

                <div class="modal-tabs" id="modal-tabs-nav">
                    </div>

                <div class="modal-content-container" id="modal-content-container"> 
                    </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

/**
 * Met à jour le contenu avec l'objet de contenu de la langue sélectionnée et génère les tabs.
 */
function updateDocumentationContent(content) {
    document.getElementById('modal-title').innerHTML = content.title;

    const tabsNav = document.getElementById('modal-tabs-nav');
    const contentContainer = document.getElementById('modal-content-container');
    tabsNav.innerHTML = '';
    contentContainer.innerHTML = ''; 
    
    let firstTabId = '';
    let tabIndex = 0; // Index pour la génération des couleurs CSS

    for (const [id, name] of Object.entries(content.tabs)) {
        if (!firstTabId) firstTabId = id;

        // Création du bouton (Tab)
        const btn = document.createElement('button');
        // On utilise l'index pour appliquer une classe CSS générique (tab-index-0, tab-index-1, ...)
        btn.className = `tab-button tab-index-${tabIndex % 10}`; // Utiliser le modulo pour recycler les 10 couleurs
        btn.textContent = name;
        btn.onclick = (e) => switchTab(id, e.target);
        tabsNav.appendChild(btn);

        // Création du contenu (Content Div)
        const tabContentDiv = document.createElement('div');
        tabContentDiv.className = 'tab-content';
        tabContentDiv.id = id; // L'ID sert à lier le bouton au contenu
        tabContentDiv.innerHTML = content[id] || '';
        contentContainer.appendChild(tabContentDiv);

        tabIndex++;
    }
    
    // Activer le premier onglet par défaut
    const firstButton = tabsNav.querySelector('.tab-button');
    if (firstButton) {
        switchTab(firstTabId, firstButton);
    }
}

/**
 * Injecte les styles (CSS) avec correction de la position et de la palette pastel.
 */
function injectStyles() {
    const style = document.createElement('style');
    style.id = 'doc-style';
    style.textContent = `
        /* ------------------------------------------- */
        /* NOUVEAU: Palette de Couleurs Pastels & Corrigée */
        /* ------------------------------------------- */
        :root {
            /* Couleurs Pastels CLAIRES (utilisées sur le tab sélectionné) */
            --pastel-light-1: 220, 230, 255;  /* Bleu ciel très clair */
            --pastel-light-2: 220, 255, 230;  /* Vert menthe très clair */
            --pastel-light-3: 255, 220, 230;  /* Rose blush très clair */
            --pastel-light-4: 255, 255, 220;  /* Jaune très clair */
            --pastel-light-5: 245, 230, 255;  /* Lavande très clair */
            --pastel-light-6: 255, 230, 220;  /* Pêche très clair */
            --pastel-light-7: 230, 255, 255;  /* Cyan très clair */
            --pastel-light-8: 255, 220, 255;  /* Magenta doux très clair */
            --pastel-light-9: 240, 240, 240;  /* Gris très clair */
            --pastel-light-10: 220, 220, 255; /* Indigo très clair */

            /* Couleurs LÉGÈREMENT PLUS SATURÉES (utilisées sur les tabs non sélectionnés) */
            --pastel-medium-1: #9bb0e0;
            --pastel-medium-2: #87c59b;
            --pastel-medium-3: #e09ba5;
            --pastel-medium-4: #e0d99b;
            --pastel-medium-5: #bda3e0;
            --pastel-medium-6: #e0b09b;
            --pastel-medium-7: #9bc5e0;
            --pastel-medium-8: #e09be0;
            --pastel-medium-9: #b3b3b3;
            --pastel-medium-10: #a3a3e0;
            
            /* Couleurs pour les avertissements/titres */
            --color-warning-border: #ffc107;
            --color-header-bg: linear-gradient(135deg, #4e54c8 0%, #8f94fb 100%);
            --color-text-dark: #333;
        }
    
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        /* CORRECTION MAJEURE: Centrage Vertical/Horizontal et positionnement */
        .modal-overlay {
            display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(5px);
            z-index: 2000; animation: fadeIn 0.3s ease;
        }
        .modal-overlay.active {
            display: flex; 
            justify-content: center; /* Centre horizontalement */
            align-items: flex-start; /* Commence en haut pour ne pas cacher le haut sur mobile */
            padding: 5vh 10px; /* Ajoute de l'espace en haut et sur les côtés */
            overflow-y: auto; /* Permet le défilement si le contenu est trop grand pour l'écran */
        }

        .help-modal {
            font-family: 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', sans-serif;
            background: #ffffff; border-radius: 20px; max-width: 900px; width: 100%; /* Important: utiliser 100% dans la limite de max-width */
            max-height: 90vh; /* Augmenté légèrement pour mieux s'adapter */
            overflow: hidden; 
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
            animation: slideUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            margin: 0; /* Supprime l'ancienne marge */
            /* Ajout pour la correction de l'ascenseur vertical */
            display: flex; 
            flex-direction: column;
        }

        /* En-tête */
        .modal-header {
            background: var(--color-header-bg);
            color: white; padding: 5px 30px; display: flex;
            justify-content: space-between; align-items: center; flex-shrink: 0;
        }
        .modal-header h2 { font-size: 26px; font-weight: 700; letter-spacing: 0.5px; margin: 0; line-height: 1.1;}

        /* Bouton de Fermeture */
        .close-button {
            background: #c82333; border: 2px solid white; color: white; font-size: 20px;
            cursor: pointer; width: 35px; height: 35px; display: flex; align-items: center;
            justify-content: center; border-radius: 50%; transition: all 0.3s; line-height: 1; 
        }
        .close-button:hover { background: #a82e38; transform: scale(1.1) rotate(90deg); }

        /* Style des Scrollbars Modernes */
        .modal-content-container, .modal-tabs, .modal-overlay.active { 
            /* Règle CSS pour cibler tous les conteneurs avec scroll */
            scrollbar-width: thin; /* Firefox */
            scrollbar-color: #c4c4c4 transparent; /* Firefox */
        }
        .modal-content-container, .modal-tabs, .modal-overlay.active { 
            /* Scrollbar pour Webkit (Chrome, Safari, Edge) */
            &::-webkit-scrollbar { width: 5px; height: 5px; }
            &::-webkit-scrollbar-track { background: transparent; }
            &::-webkit-scrollbar-thumb { 
                background-color: #c4c4c4; border-radius: 10px; border: 1px solid transparent; 
            }
            &::-webkit-scrollbar-thumb:hover { background-color: #8f94fb; }
        }

        /* Navigation par onglets */
        .modal-tabs {
            display: flex; background: #e9ecef; border-bottom: 2px solid #e0e0e0; overflow-x: auto;
            margin-top: -10px; gap: 1px; flex-shrink: 0;
        }
        .tab-button {
            flex-basis: 0; flex-grow: 1; padding: 10px 10px; border: none; cursor: pointer; font-size: 16px;
            transition: all 0.3s; position: relative; white-space: nowrap; font-weight: 500;
        }
        .tab-button:hover { filter: brightness(1.1); } 

        /* --- COULEURS GÉNÉRIQUES PAR INDEX --- */
        /* TABS NON SÉLECTIONNÉS (Fond Pastel Moyen/Saturé) */
        .tab-index-0 { background: var(--pastel-medium-1); color: var(--color-text-dark); }
        .tab-index-1 { background: var(--pastel-medium-2); color: var(--color-text-dark); }
        .tab-index-2 { background: var(--pastel-medium-3); color: var(--color-text-dark); }
        .tab-index-3 { background: var(--pastel-medium-4); color: var(--color-text-dark); }
        .tab-index-4 { background: var(--pastel-medium-5); color: var(--color-text-dark); }
        .tab-index-5 { background: var(--pastel-medium-6); color: var(--color-text-dark); }
        .tab-index-6 { background: var(--pastel-medium-7); color: var(--color-text-dark); }
        .tab-index-7 { background: var(--pastel-medium-8); color: var(--color-text-dark); }
        .tab-index-8 { background: var(--pastel-medium-9); color: var(--color-text-dark); }
        .tab-index-9 { background: var(--pastel-medium-10); color: var(--color-text-dark); }

        /* TABS ACTIFS (Fond Pastel CLAIR) */
        .tab-button.active {
            color: var(--color-text-dark) !important; /* Texte sombre sur fond clair */
            font-weight: 700;
            box-shadow: 0 -3px 5px rgba(0, 0, 0, 0.1); 
            border-bottom: 4px solid #fff; /* Ligne blanche pour le séparer du contenu */
            filter: none; /* Désactive le survol/brightness sur l'actif */
        }

        /* Utilisation des couleurs CLAIRES (light) en fond pour l'actif */
        .tab-index-0.active { background: rgba(var(--pastel-light-1), 1); }
        .tab-index-1.active { background: rgba(var(--pastel-light-2), 1); }
        .tab-index-2.active { background: rgba(var(--pastel-light-3), 1); }
        .tab-index-3.active { background: rgba(var(--pastel-light-4), 1); }
        .tab-index-4.active { background: rgba(var(--pastel-light-5), 1); }
        .tab-index-5.active { background: rgba(var(--pastel-light-6), 1); }
        .tab-index-6.active { background: rgba(var(--pastel-light-7), 1); }
        .tab-index-7.active { background: rgba(var(--pastel-light-8), 1); }
        .tab-index-8.active { background: rgba(var(--pastel-light-9), 1); }
        .tab-index-9.active { background: rgba(var(--pastel-light-10), 1); }
        
        /* Contenu */
        /* Correction de l'ascenseur vertical */
        .modal-content-container { 
            max-height: calc(90vh - 130px); 
            overflow-y: auto; 
            padding: 30px;  
            flex-grow: 1; 
        }
        .tab-content { display: none; }
        .tab-content.active { display: block; animation: fadeIn 0.3s ease; }

        /* Autres styles de contenu */
        .help-section h3 { color: #4e54c8; font-size: 22px; font-weight: 600; margin-bottom: 15px; padding-bottom: 5px; border-bottom: 1px solid #f0f0f0; }
        .help-section h3::before { content: '🔗'; color: var(--color-warning-border); font-size: 18px; margin-right: 10px; }
        
        .image-example, .video-example { 
            margin: 25px 0; padding: 15px; background: #f8f9fa; border-radius: 10px; border: 1px solid #e9ecef; text-align: center; 
        }
        .image-example .caption, .video-example .caption { 
            font-style: italic; color: #6c757d; margin-top: 10px; font-size: 14px; 
        }
        .caption {
            text-align: center; 
        }

        /* 💥 CORRECTION AJOUTÉE POUR CENTRER LES IMAGES ET VIDÉOS BLOCK */
        .image-example img, .video-example video {
            display: block; 
            margin-left: auto;
            margin-right: auto;
        }



        .warning-box { background: #fff3cd; border-left: 4px solid var(--color-warning-border); padding: 15px; border-radius: 4px; margin: 15px 0; }
        .warning-box::before { content: '⚠️ Attention : '; font-weight: 600; color: #856404; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(0px) scale(0.95); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }


    /* ------------------------------------------- */
    /* NOUVEAU: Optimisation Mobile (Max 400px) */
    /* ------------------------------------------- */
    @media (max-width: 400px), (max-height: 400px) {
        /* 1. OCCUPER TOUT L'ESPACE & REDUIRE LES ARRONDIS */
        .modal-overlay.active {
            padding: 1px; /* Supprime l'espace autour du modal */
            align-items: stretch; /* Étend le modal pour remplir la hauteur */
            justify-content: stretch; /* Étend le modal pour remplir la largeur */
        }

        .help-modal {
            max-width: 100%; /* Occupe toute la largeur */
            width: 100%;
            max-height: 100vh; /* Occupe toute la hauteur de la vue */
            border-radius: 4px; /* Supprime les coins arrondis */
            margin: 2px; /* S'assure qu'il n'y a pas de marge */
            height: 100%; /* Important pour certains navigateurs */
        }

        /* 2. RÉDUIRE TOUS LES PADDINGS */
        .modal-header {
            padding: 7px 15px; /* Réduit le padding de l'en-tête (de 20px 30px à 15px) */
        }

        .modal-header h2 {
            font-size: 18px; margin: 0; line-height: 1.1;/* Optionnel: Réduire la taille du titre */
        }

       .close-button {
            width: 30px; /* Optionnel: Réduire la taille du bouton de fermeture */
            height: 30px;
            font-size: 20px;
        }

        .tab-button {
            padding: 8px 8px; /* Réduit le padding des boutons d'onglet (de 15px 10px à 12px 5px) */
            font-size: 14px; /* Optionnel: Réduire la taille de la police des onglets */
        }

        .modal-content-container { 
            padding: 15px; /* Réduit le padding du contenu principal (de 30px à 15px) */
            /* Recalcul de la hauteur maximale pour remplir tout l'espace */
            max-height: calc(100vh - 100px); 
        }

        .help-section h3 {
            font-size: 18px; /* Optionnel: Réduire la taille des sous-titres */
        }
    }


    `;
    document.head.appendChild(style);
}