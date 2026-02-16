
import { getCachedResourceUrl } from './photoPlayer.js';
import { calcFontSize } from './main.js'

/**
 * @file documentation.js
 * Ce fichier contient la fonction documentation() exportée avec le multilingue intégré.
 */

let expertModeDisplayValue;


// export async function documentation() {
export function documentation() {
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
                    <h3>{usedSymbols}</h3>
                    <ul class="symbol-list" style="margin-left: 20px; list-style: none; line-height: 1.6;">
                        <li>💾 / 📱 : {legend_install}</li>
                        <li>🔒 : {legend_password}</li>
                        <li>🎙️ : {legend_voice}</li>
                        <li>🔍 : {legend_search}</li>
                        <li>🌳 : {legend_tree}</li>
                        <li>🎯 : {legend_radar}</li>
                        <li>💖 : {legend_cloud}</li>
                        <li>📊 : {legend_stats}</li>
                        <li>🌍 : {legend_geoloc}</li>
                        <li>❓ : {legend_faq}</li>
                        <li>📞 : {legend_contact}</li>
                        <li>💡 : {legend_help}</li>
                        <li>👆 / 🚫 : {legend_buttons}</li>
                        <li>🗣️ / 🔇 : {legend_sound}</li>
                        <li>➕ / ➖ : {legend_zoom}</li>
                        <li>🔌📺 : {legend_hdmi}</li>
                        <li>⚙️ : {legend_settings}</li>
                        <li>🔙 : {legend_back}</li>
                        <li>🔊 / 🔇 : {legend_audio}</li>
                        <li>▶️ / ⏸️ : {legend_play}</li>
                        <li>☰ : {legend_menu}</li>
                        <li>🎵 : {legend_music}</li>
                        <li>🔄 : {legend_reset}</li>
                        <li>⤡ : {legend_fullscreen}</li>
                        <li>✥ : {legend_move}</li>
                        <li>X : {legend_close}</li>
                        <li>👶 : {legend_birth}</li>
                        <li>💍 : {legend_marriage}</li>
                        <li>✝️ : {legend_death}</li>
                        <li>🏠 : {legend_residence}</li>
                        <li>💼 : {legend_job}</li>
                        <li>✓ / ✶ : {legend_root}</li>
                        <li>🔤 : {legend_sort}</li>
                    </ul>
                    <div class="video-example">
                        <h4>{quickVideoDemo}</h4>
                        <div class="media-injection-point video-demo-container"></div>
                    </div>
                </div>
                <div class="warning-box"> {gedcomSize_warning} </div>

            `,
            install: `
                <div class="help-section">
                    <h3>{installTitle}</h3>
                    
                    <h4>{whatIsPWA_title}</h4>
                    <p>{whatIsPWA_p1}</p>
                    
                    <h4>{whyInstall_title}</h4>
                    <ul>
                        <li><strong>{whyInstall_li1_strong}</strong>: {whyInstall_li1_p}</li>
                        <li><strong>{whyInstall_li2_strong}</strong>: {whyInstall_li2_p}</li>
                        <li><strong>{whyInstall_li3_strong}</strong>: {whyInstall_li3_p}</li>
                    </ul>

                    <h4>{howInstall_title_desktop}</h4>
                    <p>{howInstall_p_desktop}</p>
                    <ol>
                        <li>{howInstall_desktop_li1}</li>
                        <li>{howInstall_desktop_li2}</li>
                    </ol>

                    <h4>{howInstall_title_mobile}</h4>
                    <p><strong>Android (Chrome):</strong></p>
                    <ol>
                        <li>{howInstall_android_li1}</li>
                        <li>{howInstall_android_li2}</li>
                    </ol>
                    <p><strong>iOS (Safari):</strong></p>
                    <ol>
                        <li>{howInstall_ios_li1}</li>
                        <li>{howInstall_ios_li2}</li>
                        <li>{howInstall_ios_li3}</li>
                    </ol>

                    <h4>{updates_title}</h4>
                    <p>{updates_p}</p>
                </div>
            `,
            login: `
                <div class="help-section">
                    <h3>{howToLogTitle}</h3>
                    <p>{loginIntro}</p>
                    <ol style="margin-left: 20px;">
                        <li>{loginStep0}</li>
                        <li>{loginStep1}</li>
                        <li>{loginStep2}</li>
                        <li>{loginStep3}</li>
                    </ol>
                    <p>{secondOption}</p>
                    <div style="margin-top: 15px; background-color: #f0f8ff; padding: 10px; border-radius: 5px; border-left: 4px solid #4e54c8;">
                        <p><strong>🎙️ {voiceLoginTitle} :</strong> {voiceLoginDesc}</p>
                    </div>
                    <div class="video-example">
                        <h4>{logVideoDemo}</h4>
                        <div class="media-injection-point video-demo-container"></div>
                    </div>
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
                    <div class="image-example">
                        <div class="media-injection-point tree-image-container"></div>
                        <p class="caption">{classicalTreeView}</p>
                    </div>
                    <p style="margin-left: 20px;">{treeViewIntro}</p>
                    <div class="image-example">
                        <div class="media-injection-point treeDetails-image-container"></div>
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
                    <div class="image-example">
                        <div class="media-injection-point radar-image-container"></div>
                    </div>
                    <p style="margin-left: 20px;">{radarViewIntro}</p>
                </div>
                <div class="warning-box"> {gedcomSize_warning} </div>
            `,
            cloud: `
                <div class="help-section">
                    <h3>{cloudViewTitle}</h3>
                    <div class="image-example">
                        <div class="media-injection-point cloudFirstNames-image-container"></div>
                    </div>
                    <p style="margin-left: 20px;">{cloudViewIntro}</p>
                    <div class="image-example">
                        <div class="media-injection-point cloudNames-image-container"></div>
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
            voice: `
                <div class="help-section">
                    <h3>{voiceTitle}</h3>
                    <p style="margin-left: 20px;">{voiceIntro}</p>
                    
                    <h4>{voiceCommandsTitle}</h4>
                    <ul style="margin-left: 20px; line-height: 1.6;">
                        <li><strong>{voiceCmdSearch}</strong> : {voiceCmdSearchDesc}</li>
                        <li><strong>{voiceCmdInfo}</strong> : {voiceCmdInfoDesc}</li>
                        <li><strong>{voiceCmdAge}</strong> : {voiceCmdAgeDesc}</li>
                        <li><strong>{voiceCmdAgeBis}</strong> : {voiceCmdAgeDescBis}</li>
                        <li><strong>{voiceCmdFirstName}</strong> : {voiceCmdFirstNameDesc}</li>
                        <li><strong>{voiceCmdLastName}</strong> : {voiceCmdLastNameDesc}</li>
                        <li><strong>{voiceCmdQuestion}</strong> : {voiceCmdQuestionDesc}</li>
                    </ul>
                    {voiceCommandList}
                    <ul style="margin-left: 20px; line-height: 1.6;">
                        <li><strong>{voiceCmdFirstNameSpell}</strong> : {voiceCmdFirstNameSpellDesc}</li>
                    </ul>
                    
                    <div class="warning-box" style="margin-top: 20px;">
                        <p><em>{voiceNote}</em></p>
                    </div>
                </div>
            `,
            faq: `
            <div class="help-section">
                <h3>{faqTitle}</h3>
                <div class="faq-item"><h4>{faq_q1_title}</h4><p>{faq_q1_p}</p></div>
                <div class="faq-item"><h4>{faq_q2_title}</h4><p>{faq_q2_p}</p></div>
                <div class="faq-item"><h4>{faq_q3_title}</h4><p>{faq_q3_p}</p></div>
                <div class="faq-item"><h4>{faq_q4_title}</h4><p>{faq_q4_p}</p></div>
                <div class="faq-item"><h4>{faq_q5_title}</h4><p>{faq_q5_p}</p></div>
                <div class="faq-item"><h4>{faq_q6_title}</h4><p>{faq_q6_p}</p></div>
                <div class="faq-item"><h4>{faq_q7_title}</h4><p>{faq_q7_p}</p></div>
                <div class="faq-item"><h4>{faq_q8_title}</h4><p>{faq_q8_p}</p></div>
            </div>
            <style>
                .faq-item { margin-bottom: 20px; padding-left: 15px; border-left: 3px solid #e0e0e0; }
                .faq-item h4 { font-size: ${calcFontSize(18)}px; color: #333; margin-bottom: 8px; }
                .faq-item p { line-height: 1.6; color: #555; }
                .faq-item strong { color: #4e54c8; }
            </style>
            `,
            contact: `
                <div class="help-section">
                    <h3>{contactTitle}</h3>
                    <p style="margin-left: 20px;">{contactIntro}</p>
                </div>
            `,
        },
        // --- Métadonnées des Ressources ---
        resourceMetadata: [
            { 
                targetClass: 'tree-image-container', 
                type: 'image',
                path: 'doc/images/tree.jpx',
                styles: 'width: 100%; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);'
            },
            { 
                targetClass: 'treeDetails-image-container', 
                type: 'image',
                path: 'doc/images/detail.jpx',
                styles: 'width: 100%; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);'
            },
            { 
                targetClass: 'treeGeoloc-image-container', 
                type: 'image',
                path: 'doc/images/geoloc.jpx',
                styles: 'width: 100%; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);'
            },
            // ... (autres métadonnées existantes)
        ],


        // --- Français (FR) ---
        fr: {
            title: "Aide 🚀",
            // Clé: ID interne de l'onglet, Valeur: Nom affiché
            tabs: {
                summary: { 
                    long: 'aperçu📖', 
                    short: 'Aperçu📖', 
                },
                install:{
                    long: 'install💾',
                    short: 'Install 💾'
                },
                login: { 
                    long: 'login🔒', 
                    short: 'Login  🔒',
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
                voice: {
                    long: 'vocal🎙️',
                    short: 'Vocal 🎙️'
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
            usedSymbols: 'Symboles utilisés',

            // Légende des symboles
            legend_install: "Comment installer l'application et faire les mises à jour logicielles",
            legend_password: "Mot de passe pour ouvrir le fichier gedcom crypté",
            legend_voice: "Commande vocale",
            legend_search: "Rechercher et sélectionner une personne racine (par nom, lieu, profession...)",
            legend_tree: "Vue classique de l'arbre (navigation, animation, fiches)",
            legend_radar: "Vue radar/roue (ancêtres, roue de la fortune, quizz)",
            legend_cloud: "Vue nuage de mots (prénoms, noms, lieux, métiers...)",
            legend_stats: "Statistiques détaillées",
            legend_geoloc: "Géolocalisation (carte de chaleur, lieux précis)",
            legend_faq: "FAQ : Questions fréquentes",
            legend_contact: "Contact / Support",
            legend_help: "Aide / Documentation",
            legend_buttons: "Afficher / Cacher les boutons",
            legend_sound: "Activer / Désactiver la voix (TTS)",
            legend_zoom: "Agrandir / Réduire",
            legend_hdmi: "Connexion HDMI (TV)",
            legend_settings: "Paramètres",
            legend_back: "Retour",
            legend_audio: "Son On/Off",
            legend_play: "Play / Pause animation",
            legend_menu: "Menu principal",
            legend_music: "Lecteur audio",
            legend_reset: "Réinitialiser / Paramètres par défaut",
            legend_fullscreen: "Plein écran",
            legend_move: "Déplacer",
            legend_close: "Fermer",
            legend_birth: "Naissance",
            legend_marriage: "Mariage",
            legend_death: "Décès",
            legend_residence: "Résidence",
            legend_job: "Métier",
            legend_root: "Personne racine",
            legend_sort: "Tri alphabétique",

            installTitle: "💾 Installation et Mises à Jour",
            whatIsPWA_title: "Qu'est-ce qu'une Progressive Web App (PWA) ?",
            whatIsPWA_p1: "Cette application est une 'Progressive Web App'. C'est un site web qui peut être 'installé' sur votre appareil (ordinateur, téléphone ou tablette). Il se comportera alors comme une application native, avec sa propre icône, tout en restant léger et sécurisé comme un site web.",
            whyInstall_title: "Pourquoi installer l'application ?",
            whyInstall_li1_strong: "Accès hors ligne",
            whyInstall_li1_p: "Une fois installée, l'application fonctionne même sans connexion internet, en utilisant les données déjà chargées.",
            whyInstall_li2_strong: "Performances",
            whyInstall_li2_p: "L'application se lance plus rapidement et offre une expérience plus fluide, comme une application native.",
            whyInstall_li3_strong: "Facilité d'accès",
            whyInstall_li3_p: "Une icône est ajoutée sur votre bureau ou écran d'accueil, vous permettant de lancer l'application en un clic.",
            howInstall_title_desktop: "Installation sur Ordinateur (Chrome, Edge)",
            howInstall_p_desktop: "Une icône d'installation apparaît dans la barre d'adresse de votre navigateur lorsque l'application est prête à être installée.",
            howInstall_desktop_li1: "Cliquez sur l'icône d'installation (souvent un écran avec une flèche vers le bas) située à droite dans la barre d'adresse.",
            howInstall_desktop_li2: "Confirmez l'installation dans la fenêtre qui apparaît. Un raccourci sera créé sur votre bureau.",
            updates_title: "Mises à Jour",
            updates_p: "L'application vérifie les mises à jour automatiquement. Si une nouvelle version est disponible, un message apparaîtra en bas de l'écran vous proposant de l'installer en un clic. Vous pouvez également forcer la mise à jour en cliquant sur le bouton 'Mise à jour du logiciel' dans le menu principal.",

            howInstall_title_mobile: "Installation sur Mobile",
            howInstall_android_li1: "Appuyez sur le menu de Chrome (les trois points verticaux).",
            howInstall_android_li2: "Sélectionnez 'Installer l'application' ou 'Ajouter à l'écran d'accueil'.",
            howInstall_ios_li1: "Appuyez sur le bouton de partage (un carré avec une flèche vers le haut).",
            howInstall_ios_li2: "Faites défiler la liste des options et appuyez sur 'Sur l'écran d'accueil'.",
            howInstall_ios_li3: "Confirmez en appuyant sur 'Ajouter'.",

            howToLogTitle : 'Comment se logger et démarrer',
            loginIntro: "L'accès à l'arbre est sécurisé et personnalisé. Suivez ces étapes simples :",
            loginStep0: "Saisissez le mot de passe pour dévérouiller le fichier gedcom crypté.",
            loginStep1: "Saisissez un <strong>Prénom</strong> (ex: Jean) pour définir la personne racine de l'arbre (facultatif).",
            loginStep2: "Saisissez un <strong>Nom</strong> (ex: Dupont) pour définir la personne racine de l'arbre (facultatif).",
            loginStep3: "Cliquez sur le bouton <strong>Entrez</strong> pour valider.",
            voiceLoginTitle: "Astuce Vocale",
            voiceLoginDesc: "Vous pouvez dicter vos nom et prénom ! Cliquez simplement sur l'icône micro 🎙️ à côté des champs. Dites par exemple: prénom Hugues valider nom Capet valider entrer",
            secondOption: "Une autre solution est d'ouvrir un fichier gedcom non crypté (pas de mot de passe) en cliquant sur ⚙️ puis 'Choisir un fichier'",
            logVideoDemo : '🎬 Démonstration Rapide',

            rootPersonTitle : 'Changement et recherche d\'une personne racine',
            rootPersonIntro : `Cette fonction ouvre une fenêtre de recherche avancée pour trouver et définir une nouvelle personne racine pour l'arbre.
    <ul>
    <li><strong>Trois modes de recherche :</strong>
    <ul><li><strong>Par Prénom/Nom :</strong> Saisissez un prénom et/ou un nom. La recherche est flexible et tolère les accents.</li><li><strong>Par Lieux :</strong> Retrouvez toutes les personnes associées à un lieu spécifique (naissance, décès, résidence, mariage).</li><li><strong>Par Profession :</strong> Listez les individus exerçant un métier ou un titre particulier.</li></ul>
    </li>
    <li><strong>Filtrage par dates :</strong> Cliquez sur l'icône ⚙️ pour affiner votre recherche en spécifiant une période (année de début et/ou de fin). Ce filtre s'applique aux dates de naissance, de mariage et de décès.</li>
    <li><strong>Résultats :</strong> La liste des résultats s'affiche dynamiquement. Cliquez sur une personne pour la définir comme nouvelle racine de l'arbre.</li>
    <li><strong>Carte de chaleur :</strong> Cliquez sur l'icône 🌍 en haut de la liste de résultats pour visualiser la répartition géographique des personnes trouvées.</li>
    </ul>`,

            treeViewTitle : 'La Vue en arbre 🌳',
            treeViewIntro : `C'est la vue principale de l'application, offrant une exploration interactive de votre généalogie. Voici ses fonctionnalités clés :
    <ul>
        <li><strong>Navigation et Contrôles :</strong>
            <ul>
                <li>Affichez les boutons de contrôle sur l'écran via le menu hamburger (☰) / 👆 .</li>
                <li>Déplacez l'arbre en cliquant et glissant avec la souris, ou en faisant glisser votre doigt sur un écran tactile.</li>
                <li>Zoomez et dézoomez avec la molette de la souris ou en pinçant sur un écran tactile.</li>
                <li>Affichez jusqu'à 100 générations en ajustant le curseur "nbre géné.".</li>
                <li>Changez le mode d'affichage pour voir les 'ascendants + fratrie', 'ascendants directs', les 'descendants + conjoints', 'descendants directs' , ou les deux ('both').</li>
            </ul>
        </li>
        <li><strong>Exploration de l'Arbre :</strong>
            <ul>
                <li>Cliquez sur les icônes ➕ et ➖ à gauche ou à droite d'une personne pour afficher ou masquer respectivement ses descendants ou ses ascendants.</li>
                <li>Les couleurs vous guident : les hommes sont en bleu, les femmes en rose, et les frères et sœurs (siblings) en vert.</li>
                <li>Cliquez sur l'étoile orange (✶) d'une personne pour la définir comme nouvelle personne racine de l'arbre.</li>
            </ul>
        </li>
        <li><strong>Fonctionnalités Avancées :</strong>
            <ul>
                <li>Cliquez sur une personne pour afficher sa fiche détaillée avec des informations supplémentaires, avec un quizz, et possibilité de lire la fiche en synthèse vocale.</li>
                <li>Cliquez sur l'icône 🌍 pour afficher une carte de chaleur (heatmap) montrant la répartition géographique des personnes actuellement visibles à l'écran.</li>
                <li>Lancez une animation généalogique en utilisant les boutons de contrôle (▶️/⏸️) ou via le menu hamburger (☰) pour sélectionner ou créer une animation personnalisée. Explorez les différentes animations pour découvrir des ancêtres ou coussins célèbres</li>
            </ul>
        </li>
        <li><strong>Réglages :</strong>
            <ul>
                <li>Changez le fond d'écran via le menu ⚙️ / Fond d'écran .</li>
                <li>Changez l'affichage des noms des personnes en autorisant 1, 2, 3 ou 4 prénoms.</li>
                <li>Changez le look de l'arbre via le menu ⚙️ / Arbre.</li>        
            </ul>
        </li>

    </ul>`,
            detailPersonView: 'Fig. 2: affichage de la fiche détaillés d\'une personne de l\'arbre 🌳',
            geoLocView : 'Fig. 3: geolocalistion 🌍 des personnes de l\'arbre visibles à l\'écran',

            radarViewTitle : 'La Vue Radiale (Roue) 🎯',
            radarViewIntro : `Cette vue circulaire affiche les ancêtres autour de la personne racine. Elle offre également un mode de jeu interactif : la 'Roue de la Fortune'.
    <ul>
        <li><strong>Vue Standard :</strong> 
            <ul>
                <li>Affiche les ancêtres directs sur plusieurs générations sous forme de cercles concentriques.</li>
                <li>Activez ce mode via le menu hamburger (☰) et 🎯.</li>
                <li>ou affichez les boutons de contrôle sur l'écran via le menu hamburger (☰) / 👆, et cliquer sur 🎯.</li>
                <li>Vous pouvez afficher la roue en mode 'ancêtres' avec la racine au milieu et les ancêtres autour</li>
                <li>ou en mode 'descendants' avec l'ancêtre au milieu et les descendants autour.</li>
                <li>Vous pouvez afficher jusqu'à 20 generations d'ancêtres.</li>
            </ul>

        <li><strong>Jeu de la Roue de la Fortune :</strong>
            <ul>
                <li>Tirez sur le levier virtuel pour lancer la roue.</li>
                <li>La roue tournera et s'arrêtera aléatoirement sur un ancêtre.</li>
                <li>Un **quiz vocal** se lancera alors, vous posant des questions pour vous faire deviner de qui il s'agit.</li>
            </ul>
        </li>
    </ul>`,


            cloudViewTitle : 'La Vue en nuage de mots 💖',
            cloudViewIntro : `Cette vue offre une perspective unique sur votre généalogie sous forme de nuages de mots interactifs.
    <ul>

        <li>Activez ce mode via le menu hamburger (☰) et 💖.</li>
        <li>ou affichez les boutons de contrôle sur l'écran via le menu hamburger (☰) / 👆, et cliquer sur 💖.</li>
        <li><strong>Exploration par Thèmes :</strong> Visualisez votre arbre selon différents critères :
            <ul>
                <li>Prénoms, Noms, Lieux, Métiers.</li>
                <li>Données démographiques : Durée de vie, Âge à la procréation, Âge au 1er enfant, Âge au mariage, Nombre d'enfants.</li>
            </ul>
        </li>
        <li><strong>Interactivité :</strong> Cliquez sur n'importe quel mot du nuage pour afficher la liste des personnes associées à ce terme.</li>
        <li><strong>Filtres Avancés :</strong>
            <ul>
                <li><strong>Portée :</strong> Analysez tout le fichier GEDCOM, ou restreignez l'analyse à la branche ascendante ou descendante de la personne racine.</li>
                <li><strong>Chronologie :</strong> Filtrez les données sur une plage de dates spécifique.</li>
            </ul>
        </li>
        <li><strong>Statistiques :</strong> Accédez à des analyses plus poussées via les boutons "Statistiques détaillées" (vue globale) ou "Stat. par siècles" (évolution temporelle).</li>
    </ul>`,

            cloudViewSurname : 'Fig. 1: Vue en nuage de mots de l\'arbre pour les prénoms ',
            cloudViewName : 'Fig. 2: Vue en nuage de mots de l\'arbre pour les noms',
            cloudViewNameGeo : 'Fig. 3: Vue en nuage de mots de l\'arbre pour les les noms avec carte de chaleur (heatmap)',
            cloudViewProfession : 'Fig. 4: Vue en nuage de mots de l\'arbre pour les métiers',
            cloudViewPlace : 'Fig. 5: Vue en nuage de mots de l\'arbre pour les lieux',
            cloudViewLifeSpan : 'Fig. 6: Vue en nuage de mots de l\'arbre pour les durées de vie',
            cloudViewLifeSpanGraph : 'Fig. 7: Vue en nuage de mots de l\'arbre pour les durées de vie avec graphe',
            cloudViewLifeSpanCenturyGraph : 'Fig. 8: Vue en nuage de mots de l\'arbre pour les durées de vie avec graphe par siècle',
            cloudViewProcreationAge : 'Fig. 9: Vue en nuage de mots de l\'arbre pour les ages de procréation',
            cloudViewFirstChildAge : 'Fig. 10: Vue en nuage de mots de l\'arbre pour les ages au 1ier enfant',    
            cloudViewMarriageAge : 'Fig. 11: Vue en nuage de mots de l\'arbre pour les agesde mariage',    
            cloudViewChildrenNumber : 'Fig. 12: Vue en nuage de mots de l\'arbre pour les nombres d\'enfants',    


            statsTitle : 'Statistiques',
            // statsIntro : 'Permet de visualiser les statistiques de l\'arbre.\nOn peut sélectionner une statistique par : prénoms / noms / lieux / métiers / durée de vie / age de procréation / age au 1ier enfant / age de mariage / nombre d\'enfant.\nOn peut filter avec un mot de filtrage (ou morceau de mot) sur le nom, le prénom, le lieu, la profession, l\'age, .... \nOn peut aussi filtrer sur une plage de dates. On peut aussi filter sur tout le fichier gedcom, ou sur la branche ascendante ou descendante d\'une personne racine.\nOn peut sélectionner une statistique globale, ou une statistique par siècles',
            statsIntro : `Cette section vous permet d'analyser votre arbre généalogique sous forme de graphiques et de données chiffrées.
    <ul>
        <li>Activez ce mode via le menu hamburger (☰) et 📊.</li>
        <li>ou affichez les boutons de contrôle sur l'écran via le menu hamburger (☰) / 👆, et cliquer sur 📊.</li>
        <li><strong>Types de statistiques :</strong> Explorez la répartition des prénoms, noms, lieux, métiers, ainsi que des données démographiques comme la durée de vie, l'âge à la procréation, l'âge au premier enfant, l'âge au mariage et le nombre d'enfants.</li>
        <li><strong>Filtres puissants :</strong> Affinez les résultats en filtrant par mot-clé (nom, lieu, profession...), par plage de dates, ou en limitant l'analyse à une branche spécifique (ascendante ou descendante) ou à l'ensemble du fichier GEDCOM.</li>
        <li><strong>Modes de visualisation :</strong> Choisissez entre une vue globale pour une synthèse rapide ou une vue par siècles pour observer l'évolution au fil du temps.</li>
    </ul>`,

            geoLocTitle : 'Géolocalisation 🌍',
            geoLocIntro : `Cette fonctionnalité permet de visualiser les événements de vie sur une carte interactive.
    <ul>
        <li>Activez ce mode via le menu hamburger (☰) et 🌍.</li>
        <li>ou affichez les boutons de contrôle sur l'écran via le menu hamburger (☰) / 👆, et cliquer sur 🌍.</li>
        <li><strong>Carte Individuelle :</strong> Affiche les lieux de naissance, mariage, décès et résidence d'une personne spécifique avec des marqueurs précis.</li>
        <li><strong>Carte de Chaleur (Heatmap) :</strong> Visualisez la concentration géographique de votre arbre ou d'une branche.
            <ul>
                <li>Accessible via la recherche de racine (bouton 🌍) ou la vue Nuage de mots.</li>
                <li>Les zones rouges indiquent une forte concentration d'ancêtres.</li>
            </ul>
        </li>
        <li><strong>Contrôles :</strong> Zoomez, déplacez-vous et cliquez sur les marqueurs pour plus de détails.</li>
    </ul>`,

            // --- Section Vocale ---
            voiceTitle: "Commande Vocale 🎙️",
            voiceIntro: "Contrôlez l'application à la voix ! Cliquez sur le micro et prononcez des commandes pour naviguer ou rechercher.",
            voiceCommandsTitle: "Exemples de commandes :",
            voiceCmdSearch: "« Chercher [Prénom] [Nom] valider »",
            voiceCmdSearchDesc: "Lire la fiche de la personne. ex: « Chercher Hugues Capet valider »",
            voiceCmdInfo: "« Qui est tu valider? »",
            voiceCmdInfoDesc: "Donne des infos sur le logiciel.",
            voiceCmdAge: "« Quel âge a [Prénom] [Nom] valider »",
            voiceCmdAgeDesc: "Calcule l'âge de la personne. ex: « Quel âge a Hugues Capet valider »",
            voiceCmdAgeBis: "« prénom [Prénom] nom [Nom] Quel âge a valider »",
            voiceCmdAgeDescBis: "Calcule l'âge de la personne. ex: « prénom Hugues nom Capet Quel âge a valider »",

            voiceCmdFirstName: "«Prénom [Prénom] valider»",
            voiceCmdFirstNameDesc: "entrer le prénom de la personne. ex: «Prénom Hugues valider»",
            voiceCmdLastName: "«Nom [Nom] valider»",
            voiceCmdLastNameDesc: "entrer le nom de la personne. ex: «Nom Capet valider»",
            voiceCmdQuestion: "Question [Question] valider»",
            voiceCmdQuestionDesc: "entrer la question . ex: «Question Quel âge à valider»",

            voiceCmdFirstNameSpell: "«Prénom lettre par lettre H E N R I valider»",
            voiceCmdFirstNameSpellDesc: "entrer le prénom de la personne lettre par lettre»",



            voiceCommandList: `
            <ul style="margin-left: -30px; margin-bottom: -20px; line-height: 0.8; "><strong>Liste des questions possible:</strong></ul>
            <ul style="margin-left: 20px; line-height: 1.0;">
                <li>chercher, rechercher</strong></li>
                <li>quand est né</strong></li>
                <li>quand est mort, quand est morte, quand est décédé</strong></li>
                <li>quel âge a, quel âge avait</strong></li>
                <li>ou habite, ou habitait</strong></li>
                <li>quelle est la profession de, quelle était la profession de</strong></li>
                <li>quel est le métier de, quel etait le métier de</strong></li>
                <li>avec qui est marié, avec qui etait marié</strong></li>
                <li>combien d'enfants a, combien d'enfant a eu</strong></li>
                <li>qui est le père de, qui etait le père de</strong></li>
                <li>qui est la mère de, qui etait la mère de</strong></li>
                <li>qui sont les frères et sœurs de, qui étaient les frères et sœurs de</strong></li>
                <li>quel est le contexte historique de, quel était le contexte historique de</strong></li>
                <li>quelles sont les notes de</strong></li>
                <li>qui es-tu, quel est ton nom, comment t'appelles-tu</strong></li>
                <li>qui t'a créé</strong></li>
                <li>à quoi sert tu</strong></li>
            </ul>
            <ul style="margin-left: -30px; margin-bottom: -20px; line-height: 0.8; "><strong>Mode épeller lettre par lettre:</strong></ul>
            
            `,
            voiceNote: "Note : La reconnaissance vocale fonctionne mieux sur Google Chrome.",

            faqTitle: "Questions Fréquentes (FAQ)",
            faq_q1_title: "Comment naviguer dans l'arbre (zoom/déplacement) ?",
            faq_q1_p: "<strong>Souris :</strong> Utilisez la molette pour zoomer/dézoomer. Cliquez et maintenez pour déplacer l'arbre.<br><strong>Tactile :</strong> Pincez avec deux doigts pour zoomer. Faites glisser un doigt pour déplacer.",
            faq_q2_title: "Comment changer la personne racine de l'arbre ?",
            faq_q2_p: "Cliquez sur l'icône de recherche (🔍) en haut à gauche pour une recherche avancée par nom, lieu ou profession. Vous pouvez aussi cliquer directement sur l'étoile (✶) d'une personne dans la vue en arbre.",
            faq_q3_title: "L'application semble lente, que faire ?",
            faq_q3_p: "La performance dépend de la taille de votre fichier GEDCOM et de la puissance de votre appareil. Pour les très grands arbres, certaines vues comme le nuage de mots ou les statistiques peuvent prendre plus de temps à charger. L'installation de l'application (PWA) peut améliorer les performances.",
            faq_q4_title: "La commande vocale ne fonctionne pas. Pourquoi ?",
            faq_q4_p: "La reconnaissance vocale est mieux supportée par le navigateur <strong>Google Chrome</strong>. Assurez-vous d'avoir autorisé l'accès à votre microphone lorsque le navigateur vous l'a demandé.",
            faq_q5_title: "Comment fonctionne l'animation généalogique ?",
            faq_q5_p: "L'animation (accessible via le menu ☰) raconte une histoire en naviguant automatiquement de la personne racine à un ancêtre ou un cousin célèbre. Elle affiche les lieux sur une carte et lit les informations biographiques à chaque étape. Vous pouvez la mettre en pause (⏸️) à tout moment.",
            faq_q6_title: "À quoi sert le jeu de la 'Roue de la Fortune' ?",
            faq_q6_p: "C'est un mode de jeu interactif dans la vue Radar (🎯). Tirez sur le levier pour que la roue sélectionne un ancêtre au hasard. Un quiz vocal se lance alors pour vous faire deviner de qui il s'agit. C'est une façon ludique de tester vos connaissances sur votre famille !",
            faq_q7_title: "Puis-je utiliser mon propre fichier GEDCOM ?",
            faq_q7_p: "Oui. Dans le menu principal (☰), allez dans le 'Menu utilisateur avancé' (⚙️) et cliquez sur 'Choisir un fichier' pour charger votre propre fichier GEDCOM. L'application ne nécessite pas de mot de passe pour les fichiers non cryptés.",
            faq_q8_title: "Comment mettre à jour l'application ?",
            faq_q8_p: "L'application vérifie les mises à jour au démarrage. Si une nouvelle version est disponible, un message apparaîtra pour vous proposer de l'installer. Vous pouvez aussi forcer la mise à jour via le menu ☰ > ⚙️ > 'Mise à jour du logiciel'.",

            contactTitle : 'Contact et support technique',
            contactIntro : 'Notre équipe est là pour vous aider ! Contacter patrick.dumenil@gmail.com',


        },
        // --- English (EN) --- (Les images doivent aussi être définies ici si nécessaire)
        en: { 
            title: "Help 🚀",
            tabs: {
                summary: { long: 'overview📖', short: 'Overview📖' },
                install: { long: 'install💾', short: 'Install 💾' },
                login: { long: 'login🔒', short: 'Login  🔒' },
                root: { long: 'root🔍', short: 'Root 🔍' },
                tree: { long: 'tree🌳', short: 'Tree  🌳' },
                radar: { long: 'radar🎯', short: 'Radar  🎯' },
                cloud: { long: 'cloud💖', short: 'Cloud 💖' },
                stats: { long: 'stats📊', short: 'Stats.  📊' },
                geoloc: { long: 'geoloc🌍', short: 'Geoloc 🌍' },
                voice: { long: 'voice🎙️', short: 'Voice 🎙️' },
                faq: { long: 'FAQ❓', short: 'FAQ.  ❓' },
                contact: { long: 'contact📞', short: 'Contact 📞' },
            },
            overviewTitle: 'First view of your tree',
            discover: 'Discover the different types of views for your family tree',
            classicalTreeView: 'Fig. 1: Classic Tree View 🌳',
            radarView: 'Fig. 2: Radar/Wheel Tree View 🎯',
            cloudView: 'Fig. 3: Word Cloud Tree View 💖',
            interact: 'Interactions and Zoom',
            clickOnPeople: 'Click on an individual to view their detailed profile.',
            useMolette: 'Use the **mouse wheel** to zoom, and drag the mouse to move the view.',
            videoDemo: 'To see a full demonstration, play the video below.',
            quickVideoDemo: '🎬 Quick View Demo (30s)',
            gedcomSize_warning: `Importing very large GEDCOM files may take a few moments depending on your browser.`,
            usedSymbols: 'Symbols used',
            
            legend_install: "How to install the app and update software",
            legend_password: "Password to open encrypted gedcom file",
            legend_voice: "Voice command",
            legend_search: "Search and select a root person (by name, place, profession...)",
            legend_tree: "Classic tree view (navigation, animation, profiles)",
            legend_radar: "Radar/Wheel view (ancestors, wheel of fortune, quiz)",
            legend_cloud: "Word cloud view (names, places, jobs...)",
            legend_stats: "Detailed statistics",
            legend_geoloc: "Geolocation (heatmap, precise locations)",
            legend_faq: "FAQ: Frequently Asked Questions",
            legend_contact: "Contact / Support",
            legend_help: "Help / Documentation",
            legend_buttons: "Show / Hide buttons",
            legend_sound: "Enable / Disable voice (TTS)",
            legend_zoom: "Zoom In / Out",
            legend_hdmi: "HDMI Connection (TV)",
            legend_settings: "Settings",
            legend_back: "Back",
            legend_audio: "Sound On/Off",
            legend_play: "Play / Pause animation",
            legend_menu: "Main menu",
            legend_music: "Audio player",
            legend_reset: "Reset / Default Settings",
            legend_fullscreen: "Fullscreen",
            legend_move: "Move",
            legend_close: "Close",
            legend_birth: "Birth",
            legend_marriage: "Marriage",
            legend_death: "Death",
            legend_residence: "Residence",
            legend_job: "Job",
            legend_root: "Root person",
            legend_sort: "Alphabetical sort",

            howToLogTitle: 'How to log in and start',
            loginIntro: "Access to the tree is secure and personalized. Follow these simple steps:",
            loginStep0: "Enter the password to unlock the encrypted gedcom file.",
            loginStep1: "Enter a <strong>First Name</strong> (e.g. John) to define the root person of the tree (optional).",
            loginStep2: "Enter a <strong>Last Name</strong> (e.g. Doe) to define the root person of the tree (optional).",
            loginStep3: "Click the <strong>Enter</strong> button to validate.",
            voiceLoginTitle: "Voice Tip",
            voiceLoginDesc: "You can dictate your name! Simply click the microphone icon 🎙️ next to the fields. Say for example: first name Hugh validate last name Capet validate enter",
            secondOption: "Another solution is to open an unencrypted gedcom file (no password) by clicking on ⚙️ then 'Choose a file'",
            logVideoDemo: '🎬 Quick Demo',
            installTitle: "💾 Installation and Updates",
            whatIsPWA_title: "What is a Progressive Web App (PWA)?",
            whatIsPWA_p1: "This application is a 'Progressive Web App'. It's a website that can be 'installed' on your device (computer, phone, or tablet). It will then behave like a native application, with its own icon, while remaining light and secure like a website.",
            whyInstall_title: "Why install the application?",
            whyInstall_li1_strong: "Offline Access",
            whyInstall_li1_p: "Once installed, the application works even without an internet connection, using already loaded data.",
            whyInstall_li2_strong: "Performance",
            whyInstall_li2_p: "The application launches faster and provides a smoother experience, like a native app.",
            whyInstall_li3_strong: "Easy Access",
            whyInstall_li3_p: "An icon is added to your desktop or home screen, allowing you to launch the application with a single click.",
            howInstall_title_desktop: "Installation on Desktop (Chrome, Edge)",
            howInstall_p_desktop: "An installation icon appears in your browser's address bar when the application is ready to be installed.",
            howInstall_desktop_li1: "Click the installation icon (often a screen with a down arrow) on the right side of the address bar.",
            howInstall_desktop_li2: "Confirm the installation in the pop-up window. A shortcut will be created on your desktop.",
            updates_title: "Updates",
            updates_p: "The application checks for updates automatically. If a new version is available, a message will appear at the bottom of the screen offering to install it with one click. You can also force the update by clicking the 'Update Software' button in the main menu.",
            rootPersonTitle: 'Changing and searching for a root person',
            rootPersonIntro: `This function opens an advanced search window to find and set a new root person for the tree.
    <ul>
    <li><strong>Three search modes:</strong>
    <ul><li><strong>By First Name/Name:</strong> Enter a first name and/or a last name. The search is flexible and handles accents.</li><li><strong>By Places:</strong> Find all people associated with a specific place (birth, death, residence, marriage).</li><li><strong>By Profession:</strong> List individuals with a particular job or title.</li></ul>
    </li>
    <li><strong>Date Filtering:</strong> Click the ⚙️ icon to refine your search by specifying a period (start and/or end year). This filter applies to birth, marriage, and death dates.</li>
    <li><strong>Results:</strong> The results list is displayed dynamically. Click on a person to set them as the new root of the tree.</li>
    <li><strong>Heatmap:</strong> Click the 🌍 icon at the top of the results list to visualize the geographical distribution of the found people.</li>
    </ul>`,
            treeViewTitle: 'The Tree View 🌳',        
            treeViewIntro : `This is the main view of the application, offering an interactive exploration of your genealogy. Here are its key features:
    <ul>
        <li><strong>Navigation and Controls:</strong>
            <ul>
                <li>Display the control buttons on the screen via the hamburger menu (☰) / 👆.</li>
                <li>Move the tree by clicking and dragging with the mouse, or by swiping your finger on a touch screen.</li>
                <li>Zoom in and out with the mouse wheel or by pinching on a touch screen.</li>
                <li>Display up to 100 generations by adjusting the "nbre géné." slider.</li>
                <li>Change the display mode to see 'ascendants + siblings', 'direct ancestors', 'descendants + spouses', 'direct descendants', or both ('both').</li>
            </ul>
        </li>
        <li><strong>Tree Exploration:</strong>
            <ul>
                <li>Click on the ➕ and ➖ icons to the left or right of a person to show or hide their descendants or ancestors, respectively.</li>
                <li>Colors guide you: men are in blue, women in pink, and siblings in green.</li>
                <li>Click on a person's orange star (✶) to set them as the new root person of the tree.</li>
            </ul>
        </li>
        <li><strong>Advanced Features:</strong>
            <ul>
                <li>Click on a person to display their detailed profile with additional information, a quiz, and the option to read the profile using text-to-speech.</li>
                <li>Click on the 🌍 icon to display a heatmap showing the geographical distribution of the people currently visible on the screen.</li>
                <li>Start a genealogical animation using the control buttons (▶️/⏸️) or via the hamburger menu (☰) to select or create a custom animation. Explore different animations to discover famous ancestors or cousins.</li>
            </ul>
        </li>
        <li><strong>Settings:</strong>
            <ul>
                <li>Change the background via the ⚙️ / Background menu.</li>
                <li>Change the display of names by allowing 1, 2, 3, or 4 first names.</li>
                <li>Change the look of the tree via the ⚙️ / Tree menu.</li>        
            </ul>
        </li>
    </ul>`,
            detailPersonView: 'Fig. 2: Detailed profile display of a person in the tree 🌳',
            geoLocView: 'Fig. 3: Geolocation 🌍 of people visible on screen',
            radarViewTitle: 'The Radial View (Wheel) 🎯',        
            radarViewIntro : `This circular view displays ancestors around the root person. It also offers an interactive game mode: the 'Wheel of Fortune'.
    <ul>
        <li><strong>Standard View:</strong> 
            <ul>
                <li>Displays direct ancestors over several generations in the form of concentric circles.</li>
                <li>Activate this mode via the hamburger menu (☰) and 🎯.</li>
                <li>Or display the control buttons on the screen via the hamburger menu (☰) / 👆, and click on 🎯.</li>
                <li>You can display the wheel in 'ancestors' mode with the root in the middle and ancestors around it.</li>
                <li>Or in 'descendants' mode with the ancestor in the middle and descendants around them.</li>
                <li>You can display up to 20 generations of ancestors.</li>
            </ul>
        </li>
        <li><strong>Wheel of Fortune Game:</strong>
            <ul>
                <li>Pull the virtual lever to spin the wheel.</li>
                <li>The wheel will spin and stop randomly on an ancestor.</li>
                <li>A **voice quiz** will then start, asking you questions to help you guess who it is.</li>
            </ul>
        </li>
    </ul>`,
            cloudViewTitle: 'The Word Cloud View 💖',
            cloudViewIntro: `This view offers a unique perspective on your genealogy in the form of interactive word clouds.
    <ul>
        <li>Activate this mode via the hamburger menu (☰) and 💖.</li>
        <li>Or display the control buttons on the screen via the hamburger menu (☰) / 👆, and click on 💖.</li>
        <li><strong>Exploration by Themes:</strong> Visualize your tree according to different criteria:
            <ul>
                <li>First Names, Last Names, Places, Occupations.</li>
                <li>Demographic data: Lifespan, Age at procreation, Age at 1st child, Age at marriage, Number of children.</li>
            </ul>
        </li>
        <li><strong>Interactivity:</strong> Click on any word in the cloud to display the list of people associated with that term.</li>
        <li><strong>Advanced Filters:</strong>
            <ul>
                <li><strong>Scope:</strong> Analyze the entire GEDCOM file, or restrict the analysis to the ascending or descending branch of the root person.</li>
                <li><strong>Timeline:</strong> Filter data over a specific date range.</li>
            </ul>
        </li>
        <li><strong>Statistics:</strong> Access deeper analyses via the "Detailed statistics" (global view) or "Stats by centuries" (temporal evolution) buttons.</li>
    </ul>`,
            cloudViewSurname: 'Fig. 1: Word cloud view for first names',
            cloudViewName: 'Fig. 2: Word cloud view for last names',
            cloudViewNameGeo: 'Fig. 3: Word cloud view for last names with heatmap',
            cloudViewProfession: 'Fig. 4: Word cloud view for professions',
            cloudViewPlace: 'Fig. 5: Word cloud view for places',
            cloudViewLifeSpan: 'Fig. 6: Word cloud view for lifespans',
            cloudViewLifeSpanGraph: 'Fig. 7: Word cloud view for lifespans with graph',
            cloudViewLifeSpanCenturyGraph: 'Fig. 8: Word cloud view for lifespans with graph by century',
            cloudViewProcreationAge: 'Fig. 9: Word cloud view for procreation ages',
            cloudViewFirstChildAge: 'Fig. 10: Word cloud view for age at 1st child',
            cloudViewMarriageAge: 'Fig. 11: Word cloud view for marriage ages',
            cloudViewChildrenNumber: 'Fig. 12: Word cloud view for number of children',
            statsTitle: 'Statistics',
            statsIntro: `This section allows you to analyze your family tree through charts and numerical data.
    <ul>
        <li>Activate this mode via the hamburger menu (☰) and 📊.</li>
        <li>Or display the control buttons on the screen via the hamburger menu (☰) / 👆, and click on 📊.</li>
        <li><strong>Types of Statistics:</strong> Explore the distribution of first names, last names, places, occupations, as well as demographic data such as lifespan, age at procreation, age at first child, age at marriage, and number of children.</li>
        <li><strong>Powerful Filters:</strong> Refine results by filtering by keyword (name, place, profession...), date range, or by restricting the analysis to a specific branch (ancestors or descendants) or the entire GEDCOM file.</li>
        <li><strong>Visualization Modes:</strong> Choose between a global view for a quick summary or a view by centuries to observe evolution over time.</li>
    </ul>`,
            geoLocTitle: 'Geolocation 🌍',
            geoLocIntro: `This feature allows you to visualize life events on an interactive map.
    <ul>
        <li>Activate this mode via the hamburger menu (☰) and 🌍.</li>
        <li>Or display the control buttons on the screen via the hamburger menu (☰) / 👆, and click on 🌍.</li>
        <li><strong>Individual Map:</strong> Displays birth, marriage, death, and residence places for a specific person with precise markers.</li>
        <li><strong>Heatmap:</strong> Visualize the geographical concentration of your tree or a branch.
            <ul>
                <li>Accessible via the root search (🌍 button) or the Word Cloud view.</li>
                <li>Red areas indicate a high concentration of ancestors.</li>
            </ul>
        </li>
        <li><strong>Controls:</strong> Zoom, pan, and click on markers for more details.</li>
    </ul>`,
            
            voiceTitle: "Voice Command 🎙️",
            voiceIntro: "Control the app with your voice! Click the microphone and speak commands to navigate or search.",
            voiceCommandsTitle: "Example commands:",
            voiceCmdSearch: "« Search [Firstname] [Lastname] validate »",
            voiceCmdSearchDesc: "Read the person's profile. ex: « Search Hugues Capet validate »",
            voiceCmdInfo: "« Who are you validate? »",
            voiceCmdInfoDesc: "Gives info about the software.",
            voiceCmdAge: "« How old is [Firstname] [Lastname] validate »",
            voiceCmdAgeDesc: "Calculates the person's age. ex: « How old is Hugues Capet validate »",
            voiceCmdAgeBis: "« first name [Firstname] last name [Lastname] How old is validate »",
            voiceCmdAgeDescBis: "Calculates the person's age. ex: « first name Hugues last name Capet How old is validate »",

            voiceCmdFirstName: "«First Name [Name] validate»",
            voiceCmdFirstNameDesc: "enter the person's first name. ex: «First Name Hugues validate»",
            voiceCmdLastName: "«Last Name [Name] validate»",
            voiceCmdLastNameDesc: "enter the person's last name. ex: «Last Name Capet validate»",
            voiceCmdQuestion: "Question [Question] validate»",
            voiceCmdQuestionDesc: "enter the question. ex: «Question How old is validate»",

            voiceCmdFirstNameSpell: "«First Name letter by letter H E N R I validate»",
            voiceCmdFirstNameSpellDesc: "enter the person's first name letter by letter»",

            voiceCommandList: `<ul style="margin-left: 20px; line-height: 1.6;">
            <ul style="margin-left: -30px; margin-bottom: -20px; line-height: 0.8; "><strong>List of possible questions:</strong></ul>
            <ul style="margin-left: 20px; line-height: 1.0;">
                <li>search, research</strong></li>
                <li>when was born</strong></li>
                <li>when died, when passed away</strong></li>
                <li>how old is, how old was</strong></li>
                <li>where lives, where lived</strong></li>
                <li>what is the profession of, what was the profession of</strong></li>
                <li>what is the job of, what was the job of</strong></li>
                <li>who is married to, who was married to</strong></li>
                <li>how many children does have, how many children did have</strong></li>
                <li>who is the father of, who was the father of</strong></li>
                <li>who is the mother of, who was the mother of</strong></li>
                <li>who are the siblings of, who were the siblings of</strong></li>
                <li>what is the historical context of, what was the historical context of</strong></li>
                <li>what are the notes of</strong></li>
                <li>who are you, what is your name</strong></li>
                <li>who created you</strong></li>
                <li>what are you for</strong></li>
            </ul>,
            <ul style="margin-left: -30px; margin-bottom: -20px; line-height: 0.8; "><strong>Spell letter by letter mode:</strong></ul>
            
            `,
            voiceNote: "Note: Voice recognition works best on Google Chrome.",

            faqTitle: "Frequently Asked Questions (FAQ)",
            faq_q1_title: "How do I navigate the tree (zoom/pan)?",
            faq_q1_p: "<strong>Mouse:</strong> Use the wheel to zoom in/out. Click and hold to move the tree.<br><strong>Touch:</strong> Pinch with two fingers to zoom. Swipe with one finger to move.",
            faq_q2_title: "How do I change the root person of the tree?",
            faq_q2_p: "Click the search icon (🔍) at the top left for an advanced search by name, place, or profession. You can also click directly on a person's star (✶) in the tree view.",
            faq_q3_title: "The application seems slow, what can I do?",
            faq_q3_p: "Performance depends on the size of your GEDCOM file and your device's power. For very large trees, some views like the word cloud or statistics may take longer to load. Installing the application (PWA) can improve performance.",
            faq_q4_title: "Voice command isn't working. Why?",
            faq_q4_p: "Voice recognition is best supported by the <strong>Google Chrome</strong> browser. Make sure you have allowed access to your microphone when prompted by the browser.",
            faq_q5_title: "How does the genealogical animation work?",
            faq_q5_p: "The animation (accessible via the ☰ menu) tells a story by automatically navigating from the root person to a famous ancestor or cousin. It displays locations on a map and reads biographical information at each step. You can pause it (⏸️) at any time.",
            faq_q6_title: "What is the 'Wheel of Fortune' game for?",
            faq_q6_p: "It's an interactive game mode in the Radar view (🎯). Pull the lever to have the wheel randomly select an ancestor. A voice quiz will then start to help you guess who it is. It's a fun way to test your family knowledge!",
            faq_q7_title: "Can I use my own GEDCOM file?",
            faq_q7_p: "Yes. In the main menu (☰), go to the 'Advanced user menu' (⚙️) and click 'Choose a file' to load your own GEDCOM file. The application does not require a password for unencrypted files.",
            faq_q8_title: "How do I update the application?",
            faq_q8_p: "The application checks for updates on startup. If a new version is available, a message will appear offering to install it. You can also force an update via the ☰ menu > ⚙️ > 'Software Update'.",

            contactTitle: 'Contact and technical support',
            contactIntro: 'Our team is here to help you! Contact patrick.dumenil@gmail.com',

            howInstall_title_mobile: "Installation on Mobile",
            howInstall_android_li1: "Tap the Chrome menu (the three vertical dots).",
            howInstall_android_li2: "Select 'Install app' or 'Add to Home screen'.",
            howInstall_ios_li1: "Tap the Share button (a square with an arrow pointing up).",
            howInstall_ios_li2: "Scroll through the options and tap 'Add to Home Screen'.",
            howInstall_ios_li3: "Confirm by tapping 'Add'.",
        },
        es: { 
            title: "Ayuda 🚀",
            tabs: {
                summary: { long: 'resumen📖', short: 'Resumen📖' },
                install: { long: 'instalar💾', short: 'Instalar 💾' },
                login: { long: 'login🔒', short: 'Login  🔒' },
                root: { long: 'raíz🔍', short: 'Raíz 🔍' },
                tree: { long: 'árbol🌳', short: 'Árbol  🌳' },
                radar: { long: 'radar🎯', short: 'Radar  🎯' },
                cloud: { long: 'nube💖', short: 'Nube 💖' },
                stats: { long: 'estad.📊', short: 'Estad.  📊' },
                geoloc: { long: 'geoloc🌍', short: 'Geoloc 🌍' },
                voice: { long: 'voz🎙️', short: 'Voz 🎙️' },
                faq: { long: 'FAQ❓', short: 'FAQ.  ❓' },
                contact: { long: 'contacto📞', short: 'Contacto 📞' },
            },
            overviewTitle: 'Primera visualización de su árbol',
            discover: 'Descubra los diferentes tipos de vistas para su árbol genealógico',
            classicalTreeView: 'Fig. 1: Vista Clásica del Árbol 🌳',
            radarView: 'Fig. 2: Vista del árbol en modo radar 🎯',
            cloudView: 'Fig. 3: Vista del árbol en modo nube de palabras 💖',
            interact: 'Interacciones y Zoom',
            clickOnPeople: 'Haga clic en un individuo para ver su perfil detallado.',
            useMolette: 'Use la **rueda del ratón** para hacer zoom y arrastre el ratón para mover la vista.',
            videoDemo: 'Para ver una demostración completa, reproduzca el video a continuación.',
            quickVideoDemo: '🎬 Demostración Rápida (30s)',
            gedcomSize_warning: `La importación de archivos GEDCOM muy grandes puede tardar unos instantes según su navegador.`,
            usedSymbols: 'Símbolos utilizados',

            legend_install: "Cómo instalar la aplicación y actualizar el software",
            legend_password: "Contraseña para abrir el archivo gedcom cifrado",
            legend_voice: "Comando de voz",
            legend_search: "Buscar y seleccionar una persona raíz (por nombre, lugar, profesión...)",
            legend_tree: "Vista clásica del árbol (navegación, animación, perfiles)",
            legend_radar: "Vista radar/rueda (ancestros, rueda de la fortuna, cuestionario)",
            legend_cloud: "Vista nube de palabras (nombres, lugares, trabajos...)",
            legend_stats: "Estadísticas detalladas",
            legend_geoloc: "Geolocalización (mapa de calor, ubicaciones precisas)",
            legend_faq: "FAQ: Preguntas frecuentes",
            legend_contact: "Contacto / Soporte",
            legend_help: "Ayuda / Documentación",
            legend_buttons: "Mostrar / Ocultar botones",
            legend_sound: "Activar / Desactivar voz (TTS)",
            legend_zoom: "Acercar / Alejar",
            legend_hdmi: "Conexión HDMI (TV)",
            legend_settings: "Configuración",
            legend_back: "Atrás",
            legend_audio: "Sonido On/Off",
            legend_play: "Reproducir / Pausar animación",
            legend_menu: "Menú principal",
            legend_music: "Reproductor de audio",
            legend_reset: "Restablecer / Configuración predeterminada",
            legend_fullscreen: "Pantalla completa",
            legend_move: "Mover",
            legend_close: "Cerrar",
            legend_birth: "Nacimiento",
            legend_marriage: "Matrimonio",
            legend_death: "Muerte",
            legend_residence: "Residencia",
            legend_job: "Trabajo",
            legend_root: "Persona raíz",
            legend_sort: "Orden alfabético",

            howToLogTitle: 'Cómo iniciar sesión y comenzar',
            loginIntro: "El acceso al árbol es seguro y personalizado. Siga estos sencillos pasos:",
            loginStep0: "Ingrese la contraseña para desbloquear el archivo gedcom cifrado.",
            loginStep1: "Ingrese un <strong>Nombre</strong> (ej: Juan) para definir la persona raíz del árbol (opcional).",
            loginStep2: "Ingrese un <strong>Apellido</strong> (ej: Pérez) para definir la persona raíz del árbol (opcional).",
            loginStep3: "Haga clic en el botón <strong>Entrar</strong> para validar.",
            voiceLoginTitle: "Consejo de Voz",
            voiceLoginDesc: "¡Puede dictar su nombre y apellido! Simplemente haga clic en el icono de micrófono 🎙️ junto a los campos. Diga por ejemplo: nombre Hugo validar apellido Capeto validar entrar",
            secondOption: "Otra solución es abrir un archivo gedcom no cifrado (sin contraseña) haciendo clic en ⚙️ y luego en 'Elegir un archivo'",
            logVideoDemo: '🎬 Demostración Rápida',
            installTitle: "💾 Instalación y Actualizaciones",
            whatIsPWA_title: "¿Qué es una Aplicación Web Progresiva (PWA)?",
            whatIsPWA_p1: "Esta aplicación es una 'Aplicación Web Progresiva'. Es un sitio web que se puede 'instalar' en su dispositivo (ordenador, teléfono o tableta). Se comportará como una aplicación nativa, con su propio icono, pero seguirá siendo ligera y segura como un sitio web.",
            whyInstall_title: "¿Por qué instalar la aplicación?",
            whyInstall_li1_strong: "Acceso sin conexión",
            whyInstall_li1_p: "Una vez instalada, la aplicación funciona incluso sin conexión a internet, utilizando los datos ya cargados.",
            whyInstall_li2_strong: "Rendimiento",
            whyInstall_li2_p: "La aplicación se inicia más rápido y ofrece una experiencia más fluida, como una aplicación nativa.",
            whyInstall_li3_strong: "Fácil acceso",
            whyInstall_li3_p: "Se añade un icono a su escritorio o pantalla de inicio, permitiéndole iniciar la aplicación con un solo clic.",
            howInstall_title_desktop: "Instalación en Ordenador (Chrome, Edge)",
            howInstall_p_desktop: "Aparece un icono de instalación en la barra de direcciones de su navegador cuando la aplicación está lista para ser instalada.",
            howInstall_desktop_li1: "Haga clic en el icono de instalación (a menudo una pantalla con una flecha hacia abajo) en el lado derecho de la barra de direcciones.",
            howInstall_desktop_li2: "Confirme la instalación en la ventana emergente. Se creará un acceso directo en su escritorio.",
            updates_title: "Actualizaciones",
            updates_p: "La aplicación busca actualizaciones automáticamente. Si hay una nueva versión disponible, aparecerá un mensaje en la parte inferior de la pantalla para instalarla con un solo clic. También puede forzar la actualización haciendo clic en el botón 'Actualizar software' en el menú principal.",
            rootPersonTitle: 'Cambio y búsqueda de una persona raíz',
            rootPersonIntro: `Esta función abre una ventana de búsqueda avanzada para encontrar y establecer una nueva persona raíz para el árbol.
    <ul>
    <li><strong>Tres modos de búsqueda:</strong>
    <ul><li><strong>Por Nombre/Apellido:</strong> Ingrese un nombre y/o un apellido. La búsqueda es flexible y maneja acentos.</li><li><strong>Por Lugares:</strong> Encuentre a todas las personas asociadas con un lugar específico (nacimiento, muerte, residencia, matrimonio).</li><li><strong>Por Profesión:</strong> Liste a los individuos con un trabajo o título en particular.</li></ul>
    </li>
    <li><strong>Filtrado por fecha:</strong> Haga clic en el icono ⚙️ para refinar su búsqueda especificando un período (año de inicio y/o fin). Este filtro se aplica a las fechas de nacimiento, matrimonio y muerte.</li>
    <li><strong>Resultados:</strong> La lista de resultados se muestra dinámicamente. Haga clic en una persona para establecerla como la nueva raíz del árbol.</li>
    <li><strong>Mapa de calor:</strong> Haga clic en el icono 🌍 en la parte superior de la lista de resultados para visualizar la distribución geográfica de las personas encontradas.</li>
    </ul>`,
            treeViewTitle: 'La Vista de Árbol 🌳',        
            treeViewIntro : `Ez az alkalmazás fő nézete, amely interaktív felfedezést kínál a családfájához. Íme a legfontosabb funkciók:
    <ul>
        <li><strong>Navigáció és Vezérlés:</strong>
            <ul>
                <li>Jelenítse meg a vezérlőgombokat a képernyőn a hamburger menü (☰) / 👆 segítségével.</li>
                <li>Mozgassa a fát az egérrel való kattintással és húzással, vagy érintőképernyőn az ujja elhúzásával.</li>
                <li>Nagyítson és kicsinyítsen az egérgörgővel vagy az érintőképernyőn két ujjával.</li>
                <li>Jelenítsen meg akár 100 generációt a "nbre géné." csúszka beállításával.</li>
                <li>Váltson nézetet az 'ősök + testvérek', 'közvetlen ősök', 'leszármazottak + házastársak', 'közvetlen leszármazottak' vagy mindkettő ('both') megjelenítéséhez.</li>
            </ul>
        </li>
        <li><strong>A családfa felfedezése:</strong>
            <ul>
                <li>Kattintson a ➕ és ➖ ikonokra egy személy mellett balra vagy jobbra a leszármazottak vagy az ősök megjelenítéséhez, illetve elrejtéséhez.</li>
                <li>A színek segítenek az eligazodásban: a férfiak kék, a nők rózsaszín, a testvérek pedig zöld színnel vannak jelölve.</li>
                <li>Kattintson egy személy narancssárga csillagára (✶), hogy őt állítsa be a családfa új kiindulópontjaként (gyökérszemély).</li>
            </ul>
        </li>
        <li><strong>Speciális Funkciók:</strong>
            <ul>
                <li>Kattintson egy személyre a részletes adatlap megjelenítéséhez, ahol további információkat, kvízt talál, és lehetőség van az adatlap felolvastatására is.</li>
                <li>Kattintson a 🌍 ikonra a hőtérkép (heatmap) megjelenítéséhez, amely a képernyőn aktuálisan látható személyek földrajzi eloszlását mutatja.</li>
                <li>Indítson családfa-animációt a vezérlőgombokkal (▶️/⏸️) vagy a hamburger menün (☰) keresztül egy egyedi animáció kiválasztásához vagy létrehozásához. Fedezze fel a különböző animációkat, hogy híres ősökre vagy unokatestvérekre bukkanjon.</li>
            </ul>
        </li>
        <li><strong>Beállítások:</strong>
            <ul>
                <li>Változtassa meg a hátteret a ⚙️ / Háttérkép menüben.</li>
                <li>Módosítsa a nevek megjelenítését 1, 2, 3 vagy 4 keresztnév engedélyezésével.</li>
                <li>Változtassa meg a fa stílusát a ⚙️ / Családfa menüben.</li>        
            </ul>
        </li>
    </ul>`,
            detailPersonView: 'Fig. 2: visualización del perfil detallado de una persona del árbol 🌳',
            geoLocView: 'Fig. 3: geolocalización 🌍 de las personas del árbol visibles en pantalla',
            radarViewTitle: 'La Vista Radial (Rueda) 🎯',        
            radarViewIntro : `Esta vista circular muestra a los antepasados alrededor de la persona raíz. También ofrece un modo de juego interactivo: la 'Rueda de la Fortuna'.
    <ul>
        <li><strong>Vista Estándar:</strong> 
            <ul>
                <li>Muestra a los antepasados directos a lo largo de varias generaciones en forma de círculos concéntricos.</li>
                <li>Active este modo a través del menú hamburguesa (☰) y 🎯.</li>
                <li>O muestre los botones de control en la pantalla a través del menú hamburguesa (☰) / 👆, y haga clic en 🎯.</li>
                <li>Puede mostrar la rueda en modo 'antepasados' con la raíz en el centro y los antepasados alrededor.</li>
                <li>O en modo 'descendientes' con el antepasado en el centro y los descendientes alrededor.</li>
                <li>Puede mostrar hasta 20 generaciones de antepasados.</li>
            </ul>
        </li>
        <li><strong>Juego de la Rueda de la Fortuna:</strong>
            <ul>
                <li>Tire de la palanca virtual para girar la rueda.</li>
                <li>La rueda girará y se detendrá aleatoriamente en un antepasado.</li>
                <li>Se iniciará entonces un **cuestionario de voz**, haciéndole preguntas para que adivine de quién se trata.</li>
            </ul>
        </li>
    </ul>`,
            cloudViewTitle: 'La Vista de Nube de Palabras 💖',
            cloudViewIntro: `Esta vista ofrece una perspectiva única de su genealogía en forma de nubes de palabras interactivas.
    <ul>
        <li>Active este modo a través del menú hamburguesa (☰) y 💖.</li>
        <li>O muestre los botones de control en la pantalla a través del menú hamburguesa (☰) / 👆, y haga clic en 💖.</li>
        <li><strong>Exploración por Temas:</strong> Visualice su árbol según diferentes criterios:
            <ul>
                <li>Nombres, Apellidos, Lugares, Profesiones.</li>
                <li>Datos demográficos: Esperanza de vida, Edad de procreación, Edad al 1er hijo, Edad de matrimonio, Número de hijos.</li>
            </ul>
        </li>
        <li><strong>Interactividad:</strong> Haga clic en cualquier palabra de la nube para mostrar la lista de personas asociadas con ese término.</li>
        <li><strong>Filtros Avanzados:</strong>
            <ul>
                <li><strong>Alcance:</strong> Analice todo el archivo GEDCOM, o restrinja el análisis a la rama ascendente o descendente de la persona raíz.</li>
                <li><strong>Cronología:</strong> Filtre los datos en un rango de fechas específico.</li>
            </ul>
        </li>
        <li><strong>Estadísticas:</strong> Acceda a análisis más profundos a través de los botones "Estadísticas detalladas" (vista global) o "Estad. por siglos" (evolución temporal).</li>
    </ul>`,
            cloudViewSurname: 'Fig. 1: Vista de nube de palabras para nombres',
            cloudViewName: 'Fig. 2: Vista de nube de palabras para apellidos',
            cloudViewNameGeo: 'Fig. 3: Vista de nube de palabras para apellidos con mapa de calor',
            cloudViewProfession: 'Fig. 4: Vista de nube de palabras para profesiones',
            cloudViewPlace: 'Fig. 5: Vista de nube de palabras para lugares',
            cloudViewLifeSpan: 'Fig. 6: Vista de nube de palabras para esperanza de vida',
            cloudViewLifeSpanGraph: 'Fig. 7: Vista de nube de palabras para esperanza de vida con gráfico',
            cloudViewLifeSpanCenturyGraph: 'Fig. 8: Vista de nube de palabras para esperanza de vida con gráfico por siglo',
            cloudViewProcreationAge: 'Fig. 9: Vista de nube de palabras para edades de procreación',
            cloudViewFirstChildAge: 'Fig. 10: Vista de nube de palabras para edad al 1er hijo',
            cloudViewMarriageAge: 'Fig. 11: Vista de nube de palabras para edades de matrimonio',
            cloudViewChildrenNumber: 'Fig. 12: Vista de nube de palabras para número de hijos',
            statsTitle: 'Estadísticas',
            statsIntro: `Esta sección le permite analizar su árbol genealógico a través de gráficos y datos numéricos.
    <ul>
        <li>Active este modo a través del menú hamburguesa (☰) y 📊.</li>
        <li>O muestre los botones de control en la pantalla a través del menú hamburguesa (☰) / 👆, y haga clic en 📊.</li>
        <li></strong> Explore la distribución de nombres, apellidos, lugares, profesiones, así como datos demográficos como la esperanza de vida, edad de procreación, edad al primer hijo, edad de matrimonio y número de hijos.</li>
        <li><strong>Filtros Potentes:</strong> Refine los resultados filtrando por palabra clave (nombre, lugar, profesión...), rango de fechas, o restringiendo el análisis a una rama específica (ascendientes o descendientes) o a todo el archivo GEDCOM.</li>
        <li><strong>Modos de Visualización:</strong> Elija entre una vista global para un resumen rápido o una vista por siglos para observar la evolución a lo largo del tiempo.</li>
    </ul>`,
            geoLocTitle: 'Geolocalización 🌍',
            geoLocIntro: `Esta función le permite visualizar los eventos de la vida en un mapa interactivo.
    <ul>
        <li>Active este modo a través del menú hamburguesa (☰) y 🌍.</li>
        <li>O muestre los botones de control en la pantalla a través del menú hamburguesa (☰) / 👆, y haga clic en 🌍.</li>
        <li><strong>Mapa Individual:</strong> Muestra los lugares de nacimiento, matrimonio, defunción y residencia de una persona específica con marcadores precisos.</li>
        <li><strong>Mapa de Calor (Heatmap):</strong> Visualice la concentración geográfica de su árbol o de una rama.
            <ul>
                <li>Accesible a través de la búsqueda de raíz (botón 🌍) o la vista de Nube de Palabras.</li>
                <li>Las zonas rojas indican una alta concentración de antepasados.</li>
            </ul>
        </li>
        <li><strong>Controles:</strong> Acerque, desplácese y haga clic en los marcadores para obtener más detalles.</li>
    </ul>`,
            
            voiceTitle: "Comando de Voz 🎙️",
            voiceIntro: "¡Controla la aplicación con tu voz! Haz clic en el micrófono y di comandos para navegar o buscar.",
            voiceCommandsTitle: "Ejemplos de comandos:",
            voiceCmdSearch: "« Buscar [Nombre] [Apellido] validar »",
            voiceCmdSearchDesc: "Leer la ficha de la persona. ej: « Buscar Hugues Capet validar »",
            voiceCmdInfo: "« ¿Quién eres? »",
            voiceCmdInfoDesc: "Da información sobre el software.",
            voiceCmdAge: "« Qué edad tiene [Nombre] [Apellido] validar »",
            voiceCmdAgeDesc: "Calcula la edad de la persona. ej: « Qué edad tiene Hugues Capet validar »",
            voiceCmdAgeBis: "« nombre [Nombre] apellido [Apellido] Qué edad tiene validar »",
            voiceCmdAgeDescBis: "Calcula la edad de la persona. ej: « nombre Hugues apellido Capet Qué edad tiene validar »",

            voiceCmdFirstName: "«Nombre [Nombre] validar»",
            voiceCmdFirstNameDesc: "introducir el nombre de la persona. ej: «Nombre Hugues validar»",
            voiceCmdLastName: "«Apellido [Apellido] validar»",
            voiceCmdLastNameDesc: "introducir el apellido de la persona. ej: «Apellido Capet validar»",
            voiceCmdQuestion: "Pregunta [Pregunta] validar»",
            voiceCmdQuestionDesc: "introducir la pregunta. ej: «Pregunta Qué edad tiene validar»",

            voiceCmdFirstNameSpell: "«Nombre letra por letra H E N R I validar»",
            voiceCmdFirstNameSpellDesc: "introducir el nombre de la persona letra por letra»",

            voiceCommandList: `<ul style="margin-left: 20px; line-height: 1.6;">
            <ul style="margin-left: -30px; margin-bottom: -20px; line-height: 0.8; "><strong>Lista de preguntas posibles:</strong></ul>
            <ul style="margin-left: 20px; line-height: 1.0;">
                <li>buscar</strong></li>
                <li>cuándo nació</strong></li>
                <li>cuándo murió, cuándo falleció</strong></li>
                <li>qué edad tiene, qué edad tenía</strong></li>
                <li>dónde vive, dónde vivía</strong></li>
                <li>cuál es la profesión de, cuál era la profesión de</strong></li>
                <li>cuál es el oficio de, cuál era el oficio de</strong></li>
                <li>con quién está casado, con quién estaba casado</strong></li>
                <li>cuántos hijos tiene, cuántos hijos tuvo</strong></li>
                <li>quién es el padre de, quién era el padre de</strong></li>
                <li>quién es la madre de, quién era la madre de</strong></li>
                <li>quiénes son los hermanos de, quiénes eran los hermanos de</strong></li>
                <li>cuál es el contexto histórico de, cuál era el contexto histórico de</strong></li>
                <li>cuáles son las notas de</strong></li>
                <li>quién eres, cómo te llamas</strong></li>
                <li>quién te creó</strong></li>
                <li>para qué sirves</strong></li>
            </ul>
            <ul style="margin-left: -30px; margin-bottom: -20px; line-height: 0.8; "><strong>Modo deletrear letra por letra:</strong></ul>
            
            `,
            voiceNote: "Nota: El reconocimiento de voz funciona mejor en Google Chrome.",

            faqTitle: "Preguntas Frecuentes (FAQ)",
            faq_q1_title: "¿Cómo navego por el árbol (zoom/desplazamiento)?",
            faq_q1_p: "<strong>Ratón:</strong> Use la rueda para acercar/alejar. Haga clic y mantenga presionado para mover el árbol.<br><strong>Táctil:</strong> Pellizque con dos dedos para hacer zoom. Deslice un dedo para mover.",
            faq_q2_title: "¿Cómo cambio la persona raíz del árbol?",
            faq_q2_p: "Haga clic en el icono de búsqueda (🔍) en la parte superior izquierda para una búsqueda avanzada por nombre, lugar o profesión. También puede hacer clic directamente en la estrella (✶) de una persona en la vista de árbol.",
            faq_q3_title: "La aplicación parece lenta, ¿qué puedo hacer?",
            faq_q3_p: "El rendimiento depende del tamaño de su archivo GEDCOM y de la potencia de su dispositivo. Para árboles muy grandes, algunas vistas como la nube de palabras o las estadísticas pueden tardar más en cargarse. Instalar la aplicación (PWA) puede mejorar el rendimiento.",
            faq_q4_title: "El comando de voz no funciona. ¿Por qué?",
            faq_q4_p: "El reconocimiento de voz es mejor soportado por el navegador <strong>Google Chrome</strong>. Asegúrese de haber permitido el acceso a su micrófono cuando el navegador se lo solicitó.",
            faq_q5_title: "¿Cómo funciona la animación genealógica?",
            faq_q5_p: "La animación (accesible a través del menú ☰) cuenta una historia navegando automáticamente desde la persona raíz hasta un antepasado o primo famoso. Muestra lugares en un mapa y lee información biográfica en cada paso. Puede pausarla (⏸️) en cualquier momento.",
            faq_q6_title: "¿Para qué sirve el juego de la 'Rueda de la Fortuna'?",
            faq_q6_p: "Es un modo de juego interactivo en la vista Radar (🎯). Tire de la palanca para que la rueda seleccione un antepasado al azar. Luego, se inicia un cuestionario de voz para ayudarle a adivinar de quién se trata. ¡Es una forma divertida de poner a prueba sus conocimientos familiares!",
            faq_q7_title: "¿Puedo usar mi propio archivo GEDCOM?",
            faq_q7_p: "Sí. En el menú principal (☰), vaya al 'Menú de usuario avanzado' (⚙️) y haga clic en 'Seleccionar archivo' para cargar su propio archivo GEDCOM. La aplicación no requiere contraseña para archivos no cifrados.",
            faq_q8_title: "¿Cómo actualizo la aplicación?",
            faq_q8_p: "La aplicación busca actualizaciones al iniciarse. Si hay una nueva versión disponible, aparecerá un mensaje para instalarla. También puede forzar la actualización a través del menú ☰ > ⚙️ > 'Actualización de Software'.",

            contactTitle: 'Contacto y soporte técnico',
            contactIntro: '¡Nuestro equipo está aquí para ayudarle! Contacte a patrick.dumenil@gmail.com',

            howInstall_title_mobile: "Instalación en Móvil",
            howInstall_android_li1: "Toque el menú de Chrome (los tres puntos verticales).",
            howInstall_android_li2: "Seleccione 'Instalar aplicación' o 'Añadir a la pantalla de inicio'.",
            howInstall_ios_li1: "Toque el botón de Compartir (un cuadrado con una flecha hacia arriba).",
            howInstall_ios_li2: "Desplácese por las opciones y toque 'Añadir a la pantalla de inicio'.",
            howInstall_ios_li3: "Confirme tocando 'Añadir'.",
        },
        hu: { 
            title: "Segítség 🚀",
            tabs: {
                summary: { long: 'áttekintés📖', short: 'Áttekintés📖' },
                install: { long: 'telepítés💾', short: 'Telepítés 💾' },
                login: { long: 'belépés🔒', short: 'Belépés  🔒' },
                root: { long: 'gyökér🔍', short: 'Gyökér 🔍' },
                tree: { long: 'fa🌳', short: 'Fa  🌳' },
                radar: { long: 'radar🎯', short: 'Radar  🎯' },
                cloud: { long: 'felhő💖', short: 'Felhő 💖' },
                stats: { long: 'stat.📊', short: 'Stat.  📊' },
                geoloc: { long: 'geoloc🌍', short: 'Geoloc 🌍' },
                voice: { long: 'hang🎙️', short: 'Hang 🎙️' },
                faq: { long: 'GYIK❓', short: 'GYIK.  ❓' },
                contact: { long: 'kapcsolat📞', short: 'Kapcsolat 📞' },
            },
            overviewTitle: 'A fa első megtekintése',
            discover: 'Fedezze fel a családfa különböző nézeteit',
            classicalTreeView: '1. ábra: Klasszikus Fa Nézet 🌳',
            radarView: '2. ábra: Fa nézet radar módban 🎯',
            cloudView: '3. ábra: Fa nézet szófelhő módban 💖',
            interact: 'Interakciók és Zoom',
            clickOnPeople: 'Kattintson egy személyre a részletes profil megtekintéséhez.',
            useMolette: 'Használja az **egérgörgőt** a nagyításhoz, és húzza az egeret a nézet mozgatásához.',
            videoDemo: 'A teljes bemutató megtekintéséhez indítsa el az alábbi videót.',
            quickVideoDemo: '🎬 Gyors Nézet Bemutató (30mp)',
            gedcomSize_warning: `A nagyon nagy GEDCOM fájlok importálása eltarthat egy ideig a böngészőtől függően.`,
            usedSymbols: 'Használt szimbólumok',

            legend_install: "Hogyan telepítse az alkalmazást és frissítse a szoftvert",
            legend_password: "Jelszó a titkosított gedcom fájl megnyitásához",
            legend_voice: "Hangvezérlés",
            legend_search: "Gyökérszemély keresése és kiválasztása (név, hely, foglalkozás...)",
            legend_tree: "Klasszikus fa nézet (navigáció, animáció, profilok)",
            legend_radar: "Radar/Kerék nézet (ősök, szerencsekerék, kvíz)",
            legend_cloud: "Szófelhő nézet (nevek, helyek, munkák...)",
            legend_stats: "Részletes statisztikák",
            legend_geoloc: "Helymeghatározás (hőtérkép, pontos helyek)",
            legend_faq: "GYIK: Gyakran Ismételt Kérdések",
            legend_contact: "Kapcsolat / Támogatás",
            legend_help: "Segítség / Dokumentáció",
            legend_buttons: "Gombok megjelenítése / elrejtése",
            legend_sound: "Hang engedélyezése / letiltása (TTS)",
            legend_zoom: "Nagyítás / Kicsinyítés",
            legend_hdmi: "HDMI csatlakozás (TV)",
            legend_settings: "Beállítások",
            legend_back: "Vissza",
            legend_audio: "Hang Be/Ki",
            legend_play: "Animáció Lejátszása / Szüneteltetése",
            legend_menu: "Főmenü",
            legend_music: "Audio lejátszó",
            legend_reset: "Visszaállítás / Alapértelmezett beállítások",
            legend_fullscreen: "Teljes képernyő",
            legend_move: "Mozgatás",
            legend_close: "Bezárás",
            legend_birth: "Születés",
            legend_marriage: "Házasság",
            legend_death: "Halál",
            legend_residence: "Lakóhely",
            legend_job: "Munka",
            legend_root: "Gyökérszemély",
            legend_sort: "Betűrendes rendezés",

            howToLogTitle: 'Hogyan jelentkezzen be és kezdjen',
            loginIntro: "A fához való hozzáférés biztonságos és személyre szabott. Kövesse ezeket az egyszerű lépéseket:",
            loginStep0: "Írja be a jelszót a titkosított gedcom fájl feloldásához.",
            loginStep1: "Írjon be egy <strong>Keresztnevet</strong> (pl. János) a fa gyökérszemélyének meghatározásához (opcionális).",
            loginStep2: "Írjon be egy <strong>Vezetéknevet</strong> (pl. Kovács) a fa gyökérszemélyének meghatározásához (opcionális).",
            loginStep3: "Kattintson a <strong>Belépés</strong> gombra az érvényesítéshez.",
            voiceLoginTitle: "Hang Tipp",
            voiceLoginDesc: "Lediktálhatja a nevét! Egyszerűen kattintson a mikrofon ikonra 🎙️ a mezők mellett. Mondja például: keresztnév Hugó érvényesít vezetéknév Capet érvényesít belépés",
            secondOption: "Egy másik megoldás egy titkosítatlan gedcom fájl megnyitása (jelszó nélkül) a ⚙️ gombra, majd a 'Fájl kiválasztása' gombra kattintva.",
            logVideoDemo: '🎬 Gyors Bemutató',
            installTitle: "💾 Telepítés és Frissítések",
            whatIsPWA_title: "Mi az a Progresszív Webalkalmazás (PWA)?",
            whatIsPWA_p1: "Ez az alkalmazás egy 'Progresszív Webalkalmazás'. Ez egy weboldal, amelyet 'telepíteni' lehet az eszközére (számítógép, telefon vagy táblagép). Ezután natív alkalmazásként fog viselkedni, saját ikonnal, miközben könnyű és biztonságos marad, mint egy weboldal.",
            whyInstall_title: "Miért telepítse az alkalmazást?",
            whyInstall_li1_strong: "Offline hozzáférés",
            whyInstall_li1_p: "A telepítés után az alkalmazás internetkapcsolat nélkül is működik, a már betöltött adatok felhasználásával.",
            whyInstall_li2_strong: "Teljesítmény",
            whyInstall_li2_p: "Az alkalmazás gyorsabban indul és zökkenőmentesebb élményt nyújt, mint egy natív alkalmazás.",
            whyInstall_li3_strong: "Könnyű hozzáférés",
            whyInstall_li3_p: "Egy ikon kerül az asztalra vagy a kezdőképernyőre, amely lehetővé teszi az alkalmazás egy kattintással történő elindítását.",
            howInstall_title_desktop: "Telepítés számítógépre (Chrome, Edge)",
            howInstall_p_desktop: "Egy telepítési ikon jelenik meg a böngésző címsorában, amikor az alkalmazás telepítésre kész.",
            howInstall_desktop_li1: "Kattintson a telepítési ikonra (gyakran egy képernyő lefelé mutató nyíllal) a címsor jobb oldalán.",
            howInstall_desktop_li2: "Erősítse meg a telepítést a felugró ablakban. Egy parancsikon jön létre az asztalon.",
            updates_title: "Frissítések",
            updates_p: "Az alkalmazás automatikusan ellenőrzi a frissítéseket. Ha új verzió érhető el, egy üzenet jelenik meg a képernyő alján, amely felajánlja a telepítést egy kattintással. Ezenkívül a főmenüben a 'Szoftver frissítése' gombra kattintva is kényszerítheti a frissítést.",
            rootPersonTitle: 'Gyökérszemély váltása és keresése',
            rootPersonIntro: `Ez a funkció egy speciális keresőablakot nyit meg, hogy új gyökérszemélyt találjon és állítson be a fához.
    <ul>
    <li><strong>Három keresési mód:</strong>
    <ul><li><strong>Keresztnév/Név szerint:</strong> Adjon meg egy keresztnevet és/vagy egy vezetéknevet. A keresés rugalmas és kezeli az ékezeteket.</li><li><strong>Helyek szerint:</strong> Találja meg az összes személyt, aki egy adott helyhez kapcsolódik (születés, halál, lakóhely, házasság).</li><li><strong>Foglalkozás szerint:</strong> Listázza azokat a személyeket, akik egy adott munkakörrel vagy címmel rendelkeznek.</li></ul>
    </li>
    <li><strong>Dátumszűrés:</strong> Kattintson a ⚙️ ikonra a keresés finomításához egy időszak (kezdő és/vagy befejező év) megadásával. Ez a szűrő a születési, házassági és halálozási dátumokra vonatkozik.</li>
    <li><strong>Eredmények:</strong> Az eredmények listája dinamikusan jelenik meg. Kattintson egy személyre, hogy őt állítsa be a fa új gyökérszemélyének.</li>
    <li><strong>Hőtérkép:</strong> Kattintson az 🌍 ikonra az eredmények listájának tetején, hogy megjelenítse a talált személyek földrajzi eloszlását.</li>
    </ul>`,
            treeViewTitle: 'A Fa Nézet 🌳',        
            treeViewIntro: `Ez az alkalmazás fő nézete, amely interaktív felfedezést kínál a genealógiájában. Íme a legfontosabb funkciói:
    <ul>
        <li><strong>Navigáció és Vezérlők:</strong>
            <ul>
                <li>Mozgassa a fát az egérrel kattintva és húzva, vagy az ujját csúsztatva egy érintőképernyőn.</li>
                <li>Nagyítson és kicsinyítsen az egérgörgővel vagy egy érintőképernyőn csippentve.</li>
                <li>Jelenítsen meg akár 100 generációt a "gene. szám" csúszka beállításával.</li>
                <li>Változtassa meg a megjelenítési módot a ⚙️ menün keresztül, hogy 'ősöket', 'leszármazottakat' vagy 'mindkettőt' lássa.</li>
            </ul>
        </li>
        <li><strong>A Fa Felfedezése:</strong>
            <ul>
                <li>Kattintson a ➕ és ➖ ikonokra egy személytől balra vagy jobbra, hogy megjelenítse vagy elrejtse a leszármazottait, illetve az őseit.</li>
                <li>A színek segítenek: a férfiak kékkel, a nők rózsaszínnel, a testvérek pedig zölddel vannak jelölve.</li>
                <li>Kattintson egy személy csillagára (✶), hogy őt állítsa be a fa új gyökérszemélyének.</li>
            </ul>
        </li>
        <li><strong>Haladó Funkciók:</strong>
            <ul>
                <li>Kattintson az 🌍 ikonra egy hőtérkép megjelenítéséhez, amely a képernyőn jelenleg látható személyek földrajzi eloszlását mutatja.</li>
                <li>Indítson el egy genealógiai animációt a vezérlőgombok (▶️/⏸️) segítségével vagy a hamburger menün (☰) keresztül egy egyéni animáció kiválasztásához vagy létrehozásához.</li>
            </ul>
        </li>
    </ul>`,
            detailPersonView: '2. ábra: egy személy részletes adatlapjának megjelenítése a fában 🌳',
            geoLocView: '3. ábra: a képernyőn látható személyek helymeghatározása 🌍',
            radarViewTitle: 'A Radiális Nézet (Kerék) 🎯',        
            radarViewIntro : `Ez a körkörös nézet a gyökérszemély körüli ősöket jeleníti meg. Egy interaktív játékmódot is kínál: a „Szerencsekereket”.
    <ul>
        <li><strong>Standard nézet:</strong> 
            <ul>
                <li>A közvetlen ősöket jeleníti meg több generáción keresztül, koncentrikus körök formájában.</li>
                <li>Aktiválja ezt a módot a hamburger menü (☰) és a 🎯 segítségével.</li>
                <li>Vagy jelenítse meg a vezérlőgombokat a képernyőn a hamburger menü (☰) / 👆 segítségével, és kattintson a 🎯 ikonra.</li>
                <li>Megjelenítheti a kereket „ősök” módban, ahol a gyökérszemély van középen és az ősök körülötte.</li>
                <li>Vagy „leszármazottak” módban, ahol az ős van középen és a leszármazottak körülötte.</li>
                <li>Akár 20 generációnyi őst is megjeleníthet.</li>
            </ul>
        </li>
        <li><strong>Szerencsekerék játék:</strong>
            <ul>
                <li>Húzza meg a virtuális kart a kerék megforgatásához.</li>
                <li>A kerék megpördül, és véletlenszerűen megáll egy ősnél.</li>
                <li>Ekkor elindul egy **hangalapú kvíz**, amely kérdéseket tesz fel, hogy kitalálja, kiről van szó.</li>
            </ul>
        </li>
    </ul>`,
            cloudViewTitle: 'A Szófelhő Nézet 💖',
            cloudViewIntro: `Ez a nézet egyedi perspektívát kínál a genealógiájáról interaktív szófelhők formájában.
    <ul>
        <li>Aktiválja ezt a módot a hamburger menü (☰) és a 💖 segítségével.</li>
        <li>Vagy jelenítse meg a vezérlőgombokat a képernyőn a hamburger menü (☰) / 👆 segítségével, és kattintson a 💖  ikonra.</li>
        <li><strong>Felfedezés Témák szerint:</strong> Vizualizálja a fát különböző kritériumok alapján:
            <ul>
                <li>Keresztnevek, Vezetéknevek, Helyek, Foglalkozások.</li>
                <li>Demográfiai adatok: Élettartam, Nemzési életkor, Életkor az 1. gyermeknél, Házassági életkor, Gyermekek száma.</li>
            </ul>
        </li>
        <li><strong>Interaktivitás:</strong> Kattintson a felhő bármely szavára, hogy megjelenítse az adott kifejezéshez kapcsolódó személyek listáját.</li>
        <li><strong>Haladó Szűrők:</strong>
            <ul>
                <li><strong>Hatókör:</strong> Elemezze a teljes GEDCOM fájlt, vagy korlátozza az elemzést a gyökérszemély felmenő vagy lemenő ágára.</li>
                <li><strong>Idővonal:</strong> Szűrje az adatokat egy adott dátumtartományra.</li>
            </ul>
        </li>
        <li><strong>Statisztikák:</strong> Férjen hozzá mélyebb elemzésekhez a "Részletes statisztikák" (globális nézet) vagy a "Stat. évszázadonként" (időbeli fejlődés) gombok segítségével.</li>
    </ul>`,
            cloudViewSurname: '1. ábra: Szófelhő nézet keresztnevekhez',
            cloudViewName: '2. ábra: Szófelhő nézet vezetéknevekhez',
            cloudViewNameGeo: '3. ábra: Szófelhő nézet vezetéknevekhez hőtérképpel',
            cloudViewProfession: '4. ábra: Szófelhő nézet szakmákhoz',
            cloudViewPlace: '5. ábra: Szófelhő nézet helyekhez',
            cloudViewLifeSpan: '6. ábra: Szófelhő nézet élettartamhoz',
            cloudViewLifeSpanGraph: '7. ábra: Szófelhő nézet élettartamhoz grafikonnal',
            cloudViewLifeSpanCenturyGraph: '8. ábra: Szófelhő nézet élettartamhoz grafikonnal évszázadonként',
            cloudViewProcreationAge: '9. ábra: Szófelhő nézet nemzési életkorokhoz',
            cloudViewFirstChildAge: '10. ábra: Szófelhő nézet az 1. gyermek születési életkorához',
            cloudViewMarriageAge: '11. ábra: Szófelhő nézet házassági életkorokhoz',
            cloudViewChildrenNumber: '12. ábra: Szófelhő nézet gyermekek számához',
            statsTitle: 'Statisztikák',
            statsIntro: `Ez a szakasz lehetővé teszi családfájának elemzését grafikonok és számadatok segítségével.
    <ul>
        <li>Aktiválja ezt a módot a hamburger menü (☰) és a 📊 segítségével.</li>
        <li>Vagy jelenítse meg a vezérlőgombokat a képernyőn a hamburger menü (☰) / 👆 segítségével, és kattintson a 📊 ikonra.</li>
        <li><strong>Statisztika Típusok:</strong> Fedezze fel a keresztnevek, vezetéknevek, helyek, foglalkozások eloszlását, valamint olyan demográfiai adatokat, mint az élettartam, nemzési életkor, életkor az első gyermeknél, házassági életkor és gyermekek száma.</li>
        <li><strong>Hatékony Szűrők:</strong> Finomítsa az eredményeket kulcsszó (név, hely, foglalkozás...), dátumtartomány szerinti szűréssel, vagy az elemzés korlátozásával egy adott ágra (felmenők vagy lemenők) vagy a teljes GEDCOM fájlra.</li>
        <li><strong>Megjelenítési Módok:</strong> Válasszon a globális nézet a gyors összefoglaláshoz vagy az évszázadonkénti nézet között az időbeli fejlődés megfigyeléséhez.</li>
    </ul>`,
            geoLocTitle: 'Helymeghatározás 🌍',
            geoLocIntro: `Ez a funkció lehetővé teszi az életesemények megjelenítését egy interaktív térképen.
    <ul>
        <li>Aktiválja ezt a módot a hamburger menü (☰) és a 🌍 segítségével.</li>
        <li>Vagy jelenítse meg a vezérlőgombokat a képernyőn a hamburger menü (☰) / 👆 segítségével, és kattintson a 🌍 ikonra.</li>
        <li><strong>Egyéni Térkép:</strong> Megjeleníti egy adott személy születési, házassági, halálozási és lakóhelyeit pontos jelölőkkel.</li>
        <li><strong>Hőtérkép (Heatmap):</strong> Vizualizálja a fa vagy egy ág földrajzi koncentrációját.
            <ul>
                <li>Elérhető a gyökérkeresésen (🌍 gomb) vagy a Szófelhő nézeten keresztül.</li>
                <li>A vörös területek az ősök magas koncentrációját jelzik.</li>
            </ul>
        </li>
        <li><strong>Vezérlők:</strong> Nagyítson, pásztázzon és kattintson a jelölőkre további részletekért.</li>
    </ul>`,
            
            voiceTitle: "Hangvezérlés 🎙️",
            voiceIntro: "Irányítsa az alkalmazást a hangjával! Kattintson a mikrofonra, és mondjon parancsokat a navigáláshoz vagy kereséshez.",
            voiceCommandsTitle: "Példa parancsok:",
            voiceCmdSearch: "« Keresés [Keresztnév] [Vezetéknév] mehet »",
            voiceCmdSearchDesc: "A személy adatlapjának felolvasása. pl: « Keresés Hugues Capet mehet »",
            voiceCmdInfo: "« Ki vagy te mehet? »",
            voiceCmdInfoDesc: "Információt ad a szoftverről.",
            voiceCmdAge: "« Hány éves [Keresztnév] [Vezetéknév] mehet »",
            voiceCmdAgeDesc: "Kiszámítja a személy életkorát. pl: « Hány éves Hugues Capet mehet »",
            voiceCmdAgeBis: "« keresztnév [Keresztnév] vezetéknév [Vezetéknév] Hány éves mehet »",
            voiceCmdAgeDescBis: "Kiszámítja a személy életkorát. pl: « keresztnév Hugues vezetéknév Capet Hány éves mehet »",

            voiceCmdFirstName: "«Keresztnév [Név] mehet»",
            voiceCmdFirstNameDesc: "adja meg a személy keresztnevét. pl: «Keresztnév Hugues mehet»",
            voiceCmdLastName: "«Vezetéknév [Név] mehet»",
            voiceCmdLastNameDesc: "adja meg a személy vezetéknevét. pl: «Vezetéknév Capet mehet»",
            voiceCmdQuestion: "Kérdés [Kérdés] mehet»",
            voiceCmdQuestionDesc: "adja meg a kérdést. pl: «Kérdés Hány éves mehet»",

            voiceCmdFirstNameSpell: "«Keresztnév betűről betűre H E N R I mehet»",
            voiceCmdFirstNameSpellDesc: "adja meg a személy keresztnevét betűről betűre»",

            voiceCommandList: `<ul style="margin-left: 20px; line-height: 1.6;">
            <ul style="margin-left: -30px; margin-bottom: -20px; line-height: 0.8; "><strong>Lehetséges kérdések listája:</strong></ul>
            <ul style="margin-left: 20px; line-height: 1.0;">
                <li>keresés</strong></li>
                <li>mikor született</strong></li>
                <li>mikor halt meg, mikor hunyt el</strong></li>
                <li>hány éves, hány éves volt</strong></li>
                <li>hol lakik, hol lakott</strong></li>
                <li>mi a foglalkozása, mi volt a foglalkozása</strong></li>
                <li>mi a munkája, mi volt a munkája</strong></li>
                <li>kivel házas, kivel volt házas</strong></li>
                <li>hány gyermeke van, hány gyermeke volt</strong></li>
                <li>ki az apja, ki volt az apja</strong></li>
                <li>ki az anyja, ki volt az anyja</strong></li>
                <li>kik a testvérei, kik voltak a testvérei</strong></li>
                <li>mi a történelmi háttere, mi volt a történelmi háttere</strong></li>
                <li>mik a jegyzetek</strong></li>
                <li>ki vagy te, mi a neved</strong></li>
                <li>ki alkotott téged</strong></li>
                <li>mire vagy jó</strong></li>
            </ul>
            <ul style="margin-left: -30px; margin-bottom: -20px; line-height: 0.8; "><strong>Betűről betűre mód:</strong></ul>
            
            `,
            voiceNote: "Megjegyzés: A hangfelismerés a Google Chrome-ban működik a legjobban.",

            faqTitle: "Gyakran Ismételt Kérdések (GYIK)",
            faq_q1_title: "Hogyan navigáljak a fán (nagyítás/mozgatás)?",
            faq_q1_p: "<strong>Egér:</strong> Használja a görgőt a nagyításhoz/kicsinyítéshez. Kattintson és tartsa lenyomva a fa mozgatásához.<br><strong>Érintőképernyő:</strong> Csípje össze két ujjával a nagyításhoz. Húzza el egy ujjával a mozgatáshoz.",
            faq_q2_title: "Hogyan változtassam meg a fa gyökérszemélyét?",
            faq_q2_p: "Kattintson a keresés ikonra (🔍) a bal felső sarokban a név, hely vagy foglalkozás szerinti speciális kereséshez. Közvetlenül is rákattinthat egy személy csillagára (✶) a fa nézetben.",
            faq_q3_title: "Az alkalmazás lassúnak tűnik, mit tehetek?",
            faq_q3_p: "A teljesítmény a GEDCOM fájl méretétől és az eszköz teljesítményétől függ. Nagyon nagy fák esetén egyes nézetek, mint a szófelhő vagy a statisztikák, lassabban töltődhetnek be. Az alkalmazás telepítése (PWA) javíthatja a teljesítményt.",
            faq_q4_title: "A hangvezérlés nem működik. Miért?",
            faq_q4_p: "A hangfelismerést a <strong>Google Chrome</strong> böngésző támogatja a legjobban. Győződjön meg róla, hogy engedélyezte a mikrofonhoz való hozzáférést, amikor a böngésző kérte.",
            faq_q5_title: "Hogyan működik a genealógiai animáció?",
            faq_q5_p: "Az animáció (a ☰ menüből érhető el) egy történetet mesél el, automatikusan navigálva a gyökérszemélytől egy híres őshöz vagy unokatestvérhez. Helyszíneket jelenít meg egy térképen, és minden lépésnél felolvassa az életrajzi információkat. Bármikor szüneteltetheti (⏸️).",
            faq_q6_title: "Mire jó a 'Szerencsekerék' játék?",
            faq_q6_p: "Ez egy interaktív játékmód a Radar nézetben (🎯). Húzza meg a kart, hogy a kerék véletlenszerűen kiválasszon egy őst. Ezután egy hangalapú kvíz indul, hogy segítsen kitalálni, kiről van szó. Szórakoztató módja a családi ismeretek tesztelésének!",
            faq_q7_title: "Használhatom a saját GEDCOM fájlomat?",
            faq_q7_p: "Igen. A főmenüben (☰) lépjen a 'Haladó felhasználói menübe' (⚙️), majd kattintson a 'Fájl kiválasztása' gombra a saját GEDCOM fájl betöltéséhez. Az alkalmazás nem igényel jelszót a nem titkosított fájlokhoz.",
            faq_q8_title: "Hogyan frissítsem az alkalmazást?",
            faq_q8_p: "Az alkalmazás indításkor ellenőrzi a frissítéseket. Ha új verzió érhető el, egy üzenet jelenik meg, amely felajánlja a telepítést. A frissítést a ☰ menü > ⚙️ > 'Szoftverfrissítés' gombra kattintva is kényszerítheti.",

            contactTitle: 'Kapcsolat és technikai támogatás',
            contactIntro: 'Csapatunk itt van, hogy segítsen! Lépjen kapcsolatba velünk: patrick.dumenil@gmail.com',

            howInstall_title_mobile: "Telepítés mobilra",
            howInstall_android_li1: "Érintse meg a Chrome menüjét (a három függőleges pont).",
            howInstall_android_li2: "Válassza az 'Alkalmazás telepítése' vagy a 'Hozzáadás a kezdőképernyőhöz' lehetőséget.",
            howInstall_ios_li1: "Érintse meg a Megosztás gombot (egy négyzet, felfelé mutató nyíllal).",
            howInstall_ios_li2: "Görgessen a lehetőségek között, és érintse meg a 'Hozzáadás a kezdőképernyőhöz' gombot.",
            howInstall_ios_li3: "Erősítse meg a 'Hozzáadás' gomb megérintésével.",
        }
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

    function closeHelp() {
        const modal = document.getElementById('helpModal');
        if (modal) {
            modal.classList.remove('active');
        }
        document.body.style.overflow = '';

        const secretTargetArea = document.getElementById('secret-trigger-area');

        // Vous pouvez maintenant tester la valeur sans risque :
        if (expertModeDisplayValue === 'none') {
            console.log("L'élément etait masqué (display: none)");
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
            btn.className = `docTab-button tab-index-${tabIndex % 13}`; // Utiliser le modulo pour recycler les 10 couleurs
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
                --pastel-light-11: 220, 230, 255; /* Bleu ciel très clair */
                --pastel-light-12: 220, 255, 230; /* Vert menthe très clair */

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
                --pastel-medium-11: #9bb0e0;
                --pastel-medium-11: #9bb0e0;
                --pastel-medium-12: #87c59b;

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
            .docModal-header h2 { font-size: ${calcFontSize(26)}px; font-weight: 700; letter-spacing: 0.5px; margin: 0; margin-left: 40px; line-height: 1.1;}



            /* Bouton de Fermeture */
            .close-button {
                background: #c82333; border: 2px solid white; color: white; font-size: ${calcFontSize(20)}px;
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
                font-size: ${calcFontSize(16)}px;
                transition: all 0.3s; 
                white-space: nowrap; 
                font-weight: 500;
                
                /* 💥 NOUVEAU : Position relative pour gérer le chevauchement et z-index */
                position: relative;
                
                /* 💥 NOUVEAU : Crée le chevauchement vers la gauche */
                margin-left: 0px; 
                
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
            .tab-index-0 { background: var(--pastel-medium-1); color: var(--color-text-dark); z-index: 10; }
            .tab-index-1 { background: var(--pastel-medium-2); color: var(--color-text-dark); z-index: 9; }
            .tab-index-2 { background: var(--pastel-medium-3); color: var(--color-text-dark); z-index: 8; }
            .tab-index-3 { background: var(--pastel-medium-4); color: var(--color-text-dark); z-index: 7; }
            .tab-index-4 { background: var(--pastel-medium-5); color: var(--color-text-dark); z-index: 6; }
            .tab-index-5 { background: var(--pastel-medium-6); color: var(--color-text-dark); z-index: 5; }
            .tab-index-6 { background: var(--pastel-medium-7); color: var(--color-text-dark); z-index: 4; }
            .tab-index-7 { background: var(--pastel-medium-8); color: var(--color-text-dark); z-index: 3; }
            .tab-index-8 { background: var(--pastel-medium-9); color: var(--color-text-dark); z-index: 2; }
            .tab-index-9 { background: var(--pastel-medium-10); color: var(--color-text-dark); z-index: 1; }
            .tab-index-10 { background: var(--pastel-medium-2); color: var(--color-text-dark); z-index: 0; }

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
            .tab-index-10.active { background: rgb(var(--pastel-light-2)) !important; }

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
            
            .help-section ul, .help-section ol {
                padding-left: 30px; /* Décalage des puces vers la droite */
                margin-left: 5px;
                margin-bottom: 10px;
            }

            .help-section h3 { 
                color: #4e54c8; 
                font-size: ${calcFontSize(22)}px; 
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
                font-size: ${calcFontSize(18)}px; 
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
                font-style: italic; color: #6c757d; margin-top: 10px; font-size: ${calcFontSize(14)}px; 
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
                font-size: ${calcFontSize(14)}px;
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
                font-size: ${calcFontSize(14)}px;
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
                font-size: ${calcFontSize(18)}px; margin: 0; margin-left: 40px; line-height: 1.1;/* Optionnel: Réduire la taille du titre */
            }

        .close-button {
                width: 30px; /* Optionnel: Réduire la taille du bouton de fermeture */
                height: 30px;
                font-size: ${calcFontSize(20)}px;
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
                font-size: ${calcFontSize(18)}px; /* Optionnel: Réduire la taille des sous-titres */
            }
        }
        `;
        document.head.appendChild(style);
    }



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
