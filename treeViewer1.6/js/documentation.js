
import { getCachedResourceUrl } from './photoPlayer.js';


/**
 * @file documentation.js
 * Ce fichier contient la fonction documentation() exportée avec le multilingue intégré.
 */


const MULTILINGUE_DOC_CONTENT = {
    // 💥 NOUVEAU : Contient les modèles HTML uniques, indépendants de la langue
    templates: {
        summary: `
            <div class="help-section">
                <h3>{overviewTitle}</h3>
                <p style="margin-left: 20px;">{discover}</p>
                <div class="image-example">
                    <div class="media-injection-point tree-image-container"></div>
                    <p class="caption">{classicalTreeView}</p>
                    <br><div class="media-injection-point radar-image-container"></div>
                    <p class="caption">{radarView}</p>
                    <br><div class="media-injection-point cloudNames-image-container"></div>
                    <p class="caption">{cloudView}</p>
                    </div>
            </div>
            <div class="help-section">
                <h3>{interact}</h3>
                <ol style="margin-left: 20px;">
                    <li>{clickOnPeople}</li>
                    <li>{useMolette}</li>
                    <li>{videoDemo}</li>
                </ol>
                <div class="video-example">
                    <h4>{quickVideoDemo}</h4>
                    <div class="media-injection-point video-demo-container"></div>
                </div>
            </div>
            <div class="warning-box"> {gedcomSize_warning} </div>

        `,
        login: `
            <div class="help-section">
                <h3>{howToLogTitle}</h3>
                <div class="video-example">
                    <h4>{logVideoDemo}</h4>
                    <div class="media-injection-point video-demo-container"></div>
                </div>>
            </div>

        `,
        root: `
            <div class="help-section">
                <h3>{rootPersonTitle}</h3>
                <p style="margin-left: 20px;">{rootPersonIntro}</p>
                </div>
            <div class="warning-box"> {gedcomSize_warning} </div>
        `,
        tree: `
            <div class="help-section">
                <h3>{treeViewTitle}</h3>
                <p style="margin-left: 20px;">{treeViewIntro}</p>
                <div class="image-example">
                    <div class="media-injection-point tree-image-container"></div>
                    <p class="caption">{classicalTreeView}</p>
                    <br><div class="media-injection-point treeDetails-image-container"></div>
                    <p class="caption">{detailPersonView}</p>
                    <br><div class="media-injection-point treeGeoloc-image-container"></div>
                    <p class="caption">{geoLocView}</p>
                </div>
            </div>
            <div class="warning-box"> {gedcomSize_warning} </div>
        `,
        radar: `
            <div class="help-section">
                <h3>{radarViewTitle}</h3>
                <p style="margin-left: 20px;">{radarViewIntro}</p>
                <div class="image-example">
                    <div class="media-injection-point radar-image-container"></div>
                </div>
            </div>
            <div class="warning-box"> {gedcomSize_warning} </div>
        `,
        cloud: `
            <div class="help-section">
                <h3>{cloudViewTitle}</h3>
                <p style="margin-left: 20px;">{cloudViewIntro}</p>
                <div class="image-example">
                    <div class="media-injection-point cloudFirstNames-image-container"></div>
                    <p class="caption">{cloudViewSurname}</p>
                    <br><div class="media-injection-point cloudNames-image-container"></div>
                    <p class="caption">{cloudViewName}</p>
                    <br><div class="media-injection-point cloudNamesHeatmap-image-container"></div>
                    <p class="caption">{cloudViewNameGeo}</p>
                    <br><div class="media-injection-point cloudProfessions-image-container"></div>
                    <p class="caption">{cloudViewProfession}</p>
                    <br><div class="media-injection-point cloudLifeSpan-image-container"></div>
                    <p class="caption">{cloudViewLifeSpan}</p>
                    <br><div class="media-injection-point cloudLifeSpanGraph-image-container"></div>
                    <p class="caption">{cloudViewLifeSpanGraph}</p>
                    <br><div class="media-injection-point cloudLifeSpanCenturyGraph-image-container"></div>
                    <p class="caption">{cloudViewLifeSpanCenturyGraph}</p>
                </div>
            </div>
            <div class="warning-box"> {gedcomSize_warning} </div>
        `,
        stats: `
            <div class="help-section">
                <h3>{statsTitle}</h3>
                <p style="margin-left: 20px;">{statsIntro}</p>
                <div class="media-injection-point stats-image-container"></div>
            </div>
            <div class="warning-box"> {gedcomSize_warning} </div>
        `,
        geoloc: `
            <div class="help-section">
                <h3>{geoLocTitle}</h3>
                <p style="margin-left: 20px;">{geoLocIntro}</p>
            </div>
            <div class="warning-box"> {gedcomSize_warning} </div>
        `,
        faq: `
            <div class="help-section">
                <h3>{faqTitle}</h3>
                <p style="margin-left: 20px;">Cliquez sur l'icône de la maison (<span style="font-size: 1.2em;">🏠</span>) pour centrer et redimensionner l'arbre complet.</p>
            </div>
        `,
        contact: `
            <div class="help-section">
                <h3>{contactTitle}</h3>
                <p style="margin-left: 20px;">Notre équipe est là pour vous aider !</p>
            </div>
        `,
    },
    // --- Français (FR) ---
    fr: {
        title: "Aide 🚀",
        // Clé: ID interne de l'onglet, Valeur: Nom affiché
        tabs: {
            summary: { 
                long: 'aperçu📖', 
                short: 'Aperçu📖', 
            },
            login: { 
                long: 'login🔒', 
                short: 'login  🔒',
            },
            root: { 
                long: 'racine🔍', 
                short: 'Racine 🔍', 
            },
            tree: { 
                long: 'arbre🌳', 
                short: 'Arbre  🌳',
            },
            radar: { 
                long: 'radar🎯', 
                short: 'Radar  🎯',
            },
            cloud: { 
                long: 'nuage💖', 
                short: 'Nuage 💖', 
            },
            stats: { 
                long: 'stats📊', 
                short: 'Stats.  📊',
            },
            geoloc: { 
                long: 'geoloc🌍', 
                short: 'Geoloc 🌍',
            },
            faq: { 
                long: 'FAQ❓', 
                short: 'FAQ.  ❓', 
            },
            contact: { 
                long: 'contact📞', 
                short: 'Contact 📞',
            },
        },



        overviewTitle : 'Première visualisation de votre arbre',
        discover :  'Découvrez les différents types de vues pour votre arbre généalogique',
        classicalTreeView: 'Fig. 1: Vue Classique de l\'Arbre 🌳',
        radarView : 'Fig. 2: Vue de l\'arbre en mode radar 🎯',
        cloudView : 'Fig. 3: Vue de l\'arbre en mode nuage de mots 💖',
        interact : 'Interactions et Zoom',
        clickOnPeople :'Cliquez sur un individu pour afficher son profil détaillé.',
        useMolette : 'Utilisez la **molette** pour zoomer, et glissez la souris pour déplacer la vue.',
        videoDemo : 'Pour voir une démonstration complète, lancez la vidéo ci-dessous.',
        quickVideoDemo : '🎬 Démonstration Rapide des Vues (30s)',
        gedcomSize_warning : `l'import de très grands fichiers GEDCOM peut prendre quelques instants selon votre navigateur.`,

        howToLogTitle : 'Comment se logger et démarrer',
        logVideoDemo : '🎬 Démonstration Rapide',

        rootPersonTitle : 'Changement et recherche d\'un personne racine',
        rootPersonIntro : 'Cette fonction permet une recherche avancée de la personne racine par prénom et/ou nom, ou par lieu ou par profession. On peut aussi filtrer avec une plage de dates.',

        treeViewTitle : 'La Vue en arbre 🌳',
        treeViewIntro : 'C\'est la fonctionnalité de base! Elle permet de visualiser jusqu\'à 100 générations à partir d\'une personne racine.',
        detailPersonView: 'Fig. 2: affichage de la fiche détaillés d\'une personne de l\'arbre 🌳',
        geoLocView : 'Fig. 3: geolocalistion 🌍 des personnes de l\'arbre visibles à l\'écran',

        radarViewTitle : 'La Vue Radiale (Roue) 🎯',
        radarViewIntro : 'Cette vue permet de visualiser les ancêtres autour d\'un individu central (racine).',

        cloudViewTitle : 'La Vue en nuage de mots 💖',
        cloudViewIntro : 'Cette vue permet de visualiser l\'arbre sous une forme originale en nuage de mots. On peut cliquer sur chaque mot du nuage pour faire apparaitre la liste des personnes contenant ce mot. On peut sélectionner une vue en nuage par : prénoms / noms / lieux / métiers / durée de vie / age de procréation / age au 1ier enfant / age de mariage / nombre d\'enfant.  On peut filtrer sur une plage de dates. On peut aussi filter sur tout le fichier gedcom, ou sur la branche ascendante ou descendante d\'une personne racine. En plus de la vue en nuage de mot, on peut sélectionner une statistique globale (bouton "Statistiques détaillées"), ou une statistique par siècles (bouton "Stat. par siècles")',
        cloudViewSurname : 'Fig. 1: Vue en nuage de mots de l\'arbre pour les prénoms ',
        cloudViewName : 'Fig. 2: Vue en nuage de mots de l\'arbre pour les noms',
        cloudViewNameGeo : 'Fig. 3: Vue en nuage de mots de l\'arbre pour les les noms avec carte de chaleur (heatmap)',
        cloudViewProfession : 'Fig. 4: Vue en nuage de mots de l\'arbre pour les métiers',
        cloudViewPlace : 'Fig. 5: Vue en nuage de mots de l\'arbre pour les lieux',
        cloudViewLifeSpan : 'Fig. 6: Vue en nuage de mots de l\'arbre pour les durées de vie',
        cloudViewLifeSpanGraph : 'Fig. 7: Vue en nuage de mots de l\'arbre pour les durées de vie avec graphe',
        cloudViewLifeSpanCenturyGraph : 'Fig. 8: Vue en nuage de mots de l\'arbre pour les durées de vie avec graphe par siècle',
        cloudViewProcreationAge : 'Fig. 9: Vue en nuage de mots de l\'arbre pour les ages de procréation',
        cloudViewProcreationAge : 'Fig. 10: Vue en nuage de mots de l\'arbre pour les ages au 1ier enfant',    
        cloudViewMarriageAge : 'Fig. 11: Vue en nuage de mots de l\'arbre pour les agesde mariage',    
        cloudViewChildrenNumber : 'Fig. 12: Vue en nuage de mots de l\'arbre pour les nombres d\'enfants',    


        statsTitle : 'Statistiques',
        statsIntro : 'Permet de visualiser les statistiques de l\'arbre.\nOn peut sélectionner une statistique par : prénoms / noms / lieux / métiers / durée de vie / age de procréation / age au 1ier enfant / age de mariage / nombre d\'enfant.\nOn peut filter avec un mot de filtrage (ou morceau de mot) sur le nom, le prénom, le lieu, la profession, l\'age, .... \nOn peut aussi filtrer sur une plage de dates. On peut aussi filter sur tout le fichier gedcom, ou sur la branche ascendante ou descendante d\'une personne racine.\nOn peut sélectionner une statistique globale, ou une statistique par siècles',


        geoLocTitle : 'Géolocalisation',
        geoLocIntro : 'Permet d\'afficher une carte avec la localisation des lieux d\'une personne, ou une carte de chaleur (heatmap) quand il y a plusieurs personnes ou un groupe de personnes.',

        faqTitle : 'Questions les plus fréquentes?',
        faqIntro : '',

        contactTitle : 'Contact et support technique',
        contactIntro : '',


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
        styles: 'width: 100%; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);'
    },
    { 
        targetClass: 'cloudFirstNames-image-container', 
        type: 'image', 
        path: 'doc/images/nuage_prenoms.jpx', // Image JPG normale ou 'doc/radar.jpx'
        styles: 'width: 100%; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);'
    },
    { 
        targetClass: 'cloudNames-image-container', 
        type: 'image', 
        path: 'doc/images/nuage_noms.jpx', // Image JPG normale ou 'doc/radar.jpx'
        styles: 'width: 100%; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);'
    },
    { 
        targetClass: 'cloudNamesHeatmap-image-container', 
        type: 'image', 
        path: 'doc/images/heatmap_noms.jpx', // Image JPG normale ou 'doc/radar.jpx'
        styles: 'width: 100%; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);'
    },    
    { 
        targetClass: 'cloudProfessions-image-container', 
        type: 'image', 
        path: 'doc/images/nuage_metiers.jpx', // Image JPG normale ou 'doc/radar.jpx'
        styles: 'width: 100%; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);'
    },
    { 
        targetClass: 'cloudPlaces-image-container', 
        type: 'image', 
        path: 'doc/images/nuage_lieux.jpx', // Image JPG normale ou 'doc/radar.jpx'
        styles: 'width: 100%; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);'
    },
    { 
        targetClass: 'cloudLifeSpan-image-container', 
        type: 'image', 
        path: 'doc/images/nuage_dureeVie.jpx', // Image JPG normale ou 'doc/radar.jpx'
        styles: 'width: 100%; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);'
    },     
    { 
        targetClass: 'cloudLifeSpanGraph-image-container', 
        type: 'image', 
        path: 'doc/images/graph_dureeVie.jpx', // Image JPG normale ou 'doc/radar.jpx'
        styles: 'width: 100%; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);'
    },    
    { 
        targetClass: 'cloudLifeSpanCenturyGraph-image-container', 
        type: 'image', 
        path: 'doc/images/centuryGraph_dureeVie.jpx', // Image JPG normale ou 'doc/radar.jpx'
        styles: 'width: 100%; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);'
    },      
    { 
        targetClass: 'video-demo-container', 
        type: 'video', 
        // path: 'doc/videos/loginTree.mp4', // Vidéo cryptée (ou .mp4 si non cryptée)
        path: 'doc/videos/loginTree.mvx', // Vidéo cryptée (ou .mp4 si non cryptée)
        // styles: 'width: 100%; max-width: 500px; border-radius: 8px;'
        styles: 'width: 100%; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);'

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


let expertModeDisplayValue;

// ----------------------------------------------------
// 4. Fonction principale exportée (MAJ : `async` et appel à l'injection)
// ----------------------------------------------------

// export async function documentation() {
export function documentation() {
    // Détermine la langue (utilise 'fr' par défaut)
    const lang = window.CURRENT_LANGUAGE || 'fr'; 


    const secretTargetArea = document.getElementById('secret-trigger-area');
    // Lis la valeur de 'display' depuis les styles calculés
    expertModeDisplayValue = window.getComputedStyle(secretTargetArea).getPropertyValue('display'); 

    // Vous pouvez maintenant tester la valeur sans risque :
    if (expertModeDisplayValue === 'none') {
        console.log("L'élément est masqué (display: none)");
    } else {
        console.log(`L'élément est affiché (display: ${expertModeDisplayValue})`);
    }

    secretTargetArea.style.display = 'none';





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
    const multilingueContent = MULTILINGUE_DOC_CONTENT[lang] || MULTILINGUE_DOC_CONTENT['fr'];
    updateDocumentationContent(multilingueContent);
    

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

    const secretTargetArea = document.getElementById('secret-trigger-area');

    // Vous pouvez maintenant tester la valeur sans risque :
    if (expertModeDisplayValue === 'none') {
        console.log("L'élément etair masqué (display: none)");
    } else {
        console.log(`L'élément doit être affiché (display: ${expertModeDisplayValue})`);
        secretTargetArea.style.display = expertModeDisplayValue;
    }

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
    document.querySelectorAll('.docModal-tabs .docTab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.docModal-content-container .docTab-content').forEach(content => content.classList.remove('active'));

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
        <div class="docModal-overlay" id="helpModal">
            <div class="help-modal">
                <div class="docModal-header">
                    <h2 id="docModal-title"></h2>
                    <button class="close-button" onclick="closeHelp()">&times;</button>
                </div>

                <div class="docModal-tabs" id="docModal-tabs-nav">
                </div>

                <div class="docModal-content-container" id="docModal-content-container"> 
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
    document.getElementById('docModal-title').innerHTML = content.title;

    const tabsNav = document.getElementById('docModal-tabs-nav');
    const contentContainer = document.getElementById('docModal-content-container');
    tabsNav.innerHTML = '';
    contentContainer.innerHTML = ''; 
    
    let firstTabId = '';
    let tabIndex = 0; // Index pour la génération des couleurs CSS

    for (const [id, name] of Object.entries(content.tabs)) {
        if (!firstTabId) firstTabId = id;

        // Création du bouton (Tab)
        const btn = document.createElement('button');
        // On utilise l'index pour appliquer une classe CSS générique (tab-index-0, tab-index-1, ...)
        btn.className = `docTab-button tab-index-${tabIndex % 10}`; // Utiliser le modulo pour recycler les 10 couleurs
        btn.textContent = name;

        // 💥 MODIFICATION ICI : Insérer le texte long et le texte court avec des classes
        btn.innerHTML = `<span class="tab-text-long">${name.long}</span><span class="tab-text-short">${name.short}</span>`;

        // btn.onclick = (e) => switchTab(id, e.target);
        btn.onclick = function(e) {
            // S'assurer que le bouton est l'élément passé, même si le clic est sur un span
            const clickedButton = e.currentTarget; 
            
            // Le premier argument est l'ID de l'onglet (id), le second est l'élément bouton
            switchTab(id, clickedButton);
        };

        tabsNav.appendChild(btn);

        // Création du contenu (Content Div)
        const tabContentDiv = document.createElement('div');
        tabContentDiv.className = 'docTab-content';
        tabContentDiv.id = id; // L'ID sert à lier le bouton au contenu
        // tabContentDiv.innerHTML = content[id] || '';

        // 💥 NOUVEAU : Récupération du HTML à partir des templates centralisés
        // On utilise DOC_CONTENT (l'objet global) pour accéder aux templates
        let htmlContent = MULTILINGUE_DOC_CONTENT.templates[id] || '';

        // 💥 : Remplacement des marqueurs {clé} par la traduction.
        // On boucle sur TOUTES les propriétés de l'objet de langue (content)
        // pour remplacer les marqueurs, sauf les propriétés 'tabs' et 'title'.
        // for (const [key, value] of Object.entries(content)) {
        //     // On s'assure que la valeur est une chaîne de caractères et qu'elle n'est pas l'objet tabs
        //     if (typeof value === 'string' && key !== 'title' && key !== id) {
        //         // Crée une expression régulière globale pour remplacer toutes les occurrences de {clé}
        //         const regex = new RegExp(`{${key}}`, 'g');
        //         htmlContent = htmlContent.replace(regex, value);
        //     }
        // }
        for (const [key, value] of Object.entries(content)) {
            if (typeof value === 'string' && key !== 'title' && key !== id) {
                
                // 💥 NOUVEAU : Convertir les retours à la ligne (\n) en balises <br>
                let translatedText = value.replace(/\n/g, '<br>');
                
                const regex = new RegExp(`{${key}}`, 'g');
                // Utiliser le texte traité (avec les <br>) pour le remplacement
                htmlContent = htmlContent.replace(regex, translatedText);
            }
        }

        tabContentDiv.innerHTML = htmlContent;

        contentContainer.appendChild(tabContentDiv);

        tabIndex++;
    }
    
    // // Activer le premier onglet par défaut
    const firstButton = tabsNav.querySelector('.docTab-button');
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
            --pastel-light-1: 220, 230, 255; /* Bleu ciel très clair */
            --pastel-light-2: 220, 255, 230; /* Vert menthe très clair */
            --pastel-light-3: 255, 220, 230; /* Rose blush très clair */
            --pastel-light-4: 255, 255, 220; /* Jaune très clair */
            --pastel-light-5: 245, 230, 255; /* Lavande très clair */
            --pastel-light-6: 255, 230, 220; /* Pêche très clair */
            --pastel-light-7: 230, 255, 255; /* Cyan très clair */
            --pastel-light-8: 255, 220, 255; /* Magenta doux très clair */
            --pastel-light-9: 240, 240, 240; /* Gris très clair */
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
    
        /* //  * { margin: 0; padding: 0; box-sizing: border-box; } */     /* le box-sizing: border-box; provoque un bug sur la barre de titre des autres modals */

        * { margin: 0; padding: 0; }
        
        /* CORRECTION MAJEURE: Centrage Vertical/Horizontal et positionnement */
        .docModal-overlay {
            display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            /*  background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(5px); */
            background: rgba(150, 150, 150, 0.3); backdrop-filter: none; 
            /* Gris léger (150, 150, 150) et très transparent (0.2) */
            z-index: 2000; animation: none
            animation: fadeIn 0.3s ease; 
        }
        .docModal-overlay.active {
            display: flex; 
            justify-content: center; /* Centre horizontalement */
            align-items: flex-start; /* Commence en haut pour ne pas cacher le haut sur mobile */
            padding: 5vh 5px; /* Ajoute de l'espace en haut et sur les côtés */
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
        .docModal-header {
            background: var(--color-header-bg);
            color: white; padding: 5px 30px; display: flex;
            justify-content: space-between; align-items: center; flex-shrink: 0;

            // border-bottom: 1px solid #e0e0e0;
            margin-bottom: 15px;


        }
        .docModal-header h2 { font-size: 26px; font-weight: 700; letter-spacing: 0.5px; margin: 0; line-height: 1.1;}

        /* Bouton de Fermeture */
        .close-button {
            background: #c82333; border: 2px solid white; color: white; font-size: 20px;
            cursor: pointer; width: 35px; height: 35px; display: flex; align-items: center;
            justify-content: center; border-radius: 50%; transition: all 0.3s; line-height: 1; 
        }
        .close-button:hover { background: #a82e38; transform: scale(1.1) rotate(90deg); }

        /* Style des Scrollbars Modernes */
        .docModal-content-container, .docModal-tabs, .docModal-overlay.active { 
            /* Règle CSS pour cibler tous les conteneurs avec scroll */
            scrollbar-width: thin; /* Firefox */
            scrollbar-color: #c4c4c4 transparent; /* Firefox */
        }
        .docModal-content-container, .docModal-tabs, .docModal-overlay.active { 
            /* Scrollbar pour Webkit (Chrome, Safari, Edge) */
            &::-webkit-scrollbar { width: 5px; height: 5px; }
            &::-webkit-scrollbar-track { background: transparent; }
            &::-webkit-scrollbar-thumb { 
                background-color: #c4c4c4; border-radius: 10px; border: 1px solid transparent; 
            }
            &::-webkit-scrollbar-thumb:hover { background-color: #8f94fb; }
        }


        /* --- Bloc 1 : .docModal-tabs --- */
        .docModal-tabs {
            display: flex; 
            background: #e9ecef; 
            border-bottom: 2px solid #e0e0e0; 
            overflow-x: auto;
            margin-top: -10px; 
            /* ❌ SUPPRIMER/IGNORER : gap: 1px; */
            flex-shrink: 0;
            
            /* 💥 NOUVEAU : Ajouter un padding à droite pour que le dernier onglet soit visible */
            padding-right: 20px;
        }

        /* --- Bloc 2 : .docTab-button --- */
        .docTab-button {
            /* flex-basis: 0; */
            flex-basis: 0; /*60px;*/
            flex-grow: 0;
            flex-shrink: 0;
            /* min-width: 75px; */
            padding-top: 10px; 
            padding-bottom: 10px;
            padding-left: 4px;
            padding-right: 0;
            border: none; 
            cursor: pointer; 
            font-size: 16px;
            transition: all 0.3s; 
            white-space: nowrap; 
            font-weight: 500;
            
            /* 💥 NOUVEAU : Position relative pour gérer le chevauchement et z-index */
            position: relative;
            
            /* 💥 NOUVEAU : Crée le chevauchement vers la gauche */
            margin-left: -4px; 
            
            /* 💥 NOUVEAU : Ajoute une bordure pour simuler l'épaisseur de la feuille */
            border-right: 1px solid #d0d0d0 !important; 
            border-radius: 8px 8px 0 0; /* Arrondi seulement en haut */
        }


        /* --- Styles par Défaut (Grand Écran) --- */
        .docTab-button .tab-text-long {
            display: inline; /* Affiché par défaut sur grand écran */
        }
        .docTab-button .tab-text-short {
            display: none; /* Caché par défaut */
        }

        .docTab-button:hover { filter: brightness(1.1); } 

        /* --- COULEURS GÉNÉRIQUES PAR INDEX --- */
        /* TABS NON SÉLECTIONNÉS (Fond Pastel Moyen/Saturé) */
        /* 💥 NOUVEAU : Ajoutez un z-index progressif */
        .tab-index-0 { background: var(--pastel-medium-1); color: var(--color-text-dark); z-index: 9; }
        .tab-index-1 { background: var(--pastel-medium-2); color: var(--color-text-dark); z-index: 8; }
        .tab-index-2 { background: var(--pastel-medium-3); color: var(--color-text-dark); z-index: 7; }
        .tab-index-3 { background: var(--pastel-medium-4); color: var(--color-text-dark); z-index: 6; }
        .tab-index-4 { background: var(--pastel-medium-5); color: var(--color-text-dark); z-index: 5; }
        .tab-index-5 { background: var(--pastel-medium-6); color: var(--color-text-dark); z-index: 4; }
        .tab-index-6 { background: var(--pastel-medium-7); color: var(--color-text-dark); z-index: 3; }
        .tab-index-7 { background: var(--pastel-medium-8); color: var(--color-text-dark); z-index: 2; }
        .tab-index-8 { background: var(--pastel-medium-9); color: var(--color-text-dark); z-index: 1; }
        .tab-index-9 { background: var(--pastel-medium-10); color: var(--color-text-dark); z-index: 0; }


        /* TABS ACTIFS (Fond Pastel CLAIR) */
        .docTab-button.active {
            color: var(--color-text-dark) !important; 
            font-weight: 700;
            box-shadow: 0 -3px 5px rgba(0, 0, 0, 0.1); 
            border-bottom: 4px solid #fff; 
            filter: none;
            
            /* 💥 NOUVEAU : Annuler le chevauchement */
            margin-left: 0;
            
            /* 💥 NOUVEAU : Assurer qu'il est au premier plan (z-index élevé) */
            z-index: 10;
            
            /* Assurer que sa bordure n'est pas écrasée */
            border-right-color: transparent !important; /* Cache la bordure droite du tab actif */
        }


        /* 💥 CORRECTION (Fond Pastel CLAIR) : Utilisation de la syntaxe correcte rgb(var(--...)) */
        .tab-index-0.active { background: rgb(var(--pastel-light-1)) !important; }
        .tab-index-1.active { background: rgb(var(--pastel-light-2)) !important; }
        .tab-index-2.active { background: rgb(var(--pastel-light-3)) !important; }
        .tab-index-3.active { background: rgb(var(--pastel-light-4)) !important; }
        .tab-index-4.active { background: rgb(var(--pastel-light-5)) !important; }
        .tab-index-5.active { background: rgb(var(--pastel-light-6)) !important; }
        .tab-index-6.active { background: rgb(var(--pastel-light-7)) !important; }
        .tab-index-7.active { background: rgb(var(--pastel-light-8)) !important; }
        .tab-index-8.active { background: rgb(var(--pastel-light-9)) !important; }
        .tab-index-9.active { background: rgb(var(--pastel-light-10)) !important; }

        /* Contenu */
        /* Correction de l'ascenseur vertical */
        .docModal-content-container { 
            max-height: calc(90vh - 130px); 
            overflow-y: auto; 
            padding: 0px;  
            flex-grow: 1; 
        }
        .docTab-content { display: none; }
        .docTab-content.active { display: block; animation: fadeIn 0.3s ease; }


        /* Autres styles de contenu */
        .help-section  {
            padding: 10px; 
        }

        .help-section h3 { 
            color: #4e54c8; 
            font-size: 22px; 
            font-weight: 600; 
            margin-bottom: 15px; 
            padding-bottom: 5px; 
            border-bottom: 1px solid #f0f0f0;
            
            /* 💥 NOUVEAU : Positionnement relatif pour l'icône absolue */
            position: relative; 
            
            /* 💥 NOUVEAU : Espace à gauche pour l'icône (20px icône + 10px marge) */
            padding-left: 30px; 
        }

        .help-section h3::before { 
            content: '🔗'; 
            color: var(--color-warning-border); 
            font-size: 18px; 
            /* margin-right: 10px; <--- INUTILE/SUPPRIMÉ grâce au padding-left du h3 */
            
            /* 💥 NOUVEAU : Sort l'icône du flux pour la positionner dans le padding */
            position: absolute;
            left: 0;
            top: 50%; /* Centre verticalement (ajustement fin avec transform) */
            transform: translateY(-50%); /* Ajustement précis du centrage vertical */
            
            /* Vous pouvez ajouter une largeur pour garantir l'alignement, si besoin */
            width: 20px; 
        }

        .image-example, .video-example { 
            margin: 25px 0; padding: 0px; background: #f8f9fa; border-radius: 10px; border: 1px solid #e9ecef; text-align: center; 
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
    @media (max-width: 400px) {
        .docTab-button {
            flex-basis: 77px;
            flex-grow: 0;
            flex-shrink: 0;
            min-width: 75px; 
            padding-top: 10px; 
            padding-bottom: 10px;
            padding-left: 2px;
            padding-right: 0;
            font-size: 14px;
            margin-left: -50px; 
        }

        /* Cacher le texte long et afficher le texte court/icône */
        .docTab-button .tab-text-short {
            display: inline; /* Afficher le texte court (l'icône) */
        }
        .docTab-button .tab-text-long {
            display: none; /* Masquer le texte long */
        }

    }

    @media (max-height: 400px) {
        .docTab-button {
            font-size: 14px;
        }
    }

    @media (max-width: 400px), (max-height: 400px) {
        /* 1. OCCUPER TOUT L'ESPACE & REDUIRE LES ARRONDIS */
        .docModal-overlay.active {
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
        .docModal-header {
            padding: 7px 15px; /* Réduit le padding de l'en-tête (de 20px 30px à 15px) */
        }

        .docModal-header h2 {
            font-size: 18px; margin: 0; line-height: 1.1;/* Optionnel: Réduire la taille du titre */
        }

       .close-button {
            width: 30px; /* Optionnel: Réduire la taille du bouton de fermeture */
            height: 30px;
            font-size: 20px;
        }

        .docModal-content-container { 
            /*padding: 15px;  Réduit le padding du contenu principal (de 30px à 15px) */
            /* Recalcul de la hauteur maximale pour remplir tout l'espace */
            max-height: calc(100vh - 100px); 
        }

        .help-section  {
            padding: 2px; 
        }

        .help-section h3 {
            font-size: 18px; /* Optionnel: Réduire la taille des sous-titres */
        }
    }
    `;
    document.head.appendChild(style);
}