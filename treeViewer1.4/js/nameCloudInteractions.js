import { state, displayPersonDetails } from './main.js';
import { startAncestorAnimation } from './treeAnimation.js';
import { nameCloudState } from './nameCloud.js'
import { extractYear } from './nameCloudUtils.js';

export function showPersonsList(name, people, config) {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '2000';

    const content = document.createElement('div');
    content.style.backgroundColor = 'white';
    content.style.padding = '20px';
    content.style.borderRadius = '10px';
    content.style.width = '80%';
    content.style.maxWidth = '800px';
    content.style.maxHeight = '80vh';
    content.style.overflowY = 'auto';
    content.style.position = 'relative';

    // Titre
    const title = document.createElement('h2');
    title.textContent = config.type === 'prenoms' ? 
        `Personnes avec le prénom "${name}" (${people.length} personnes)` :
        config.type === 'noms' ?
            `Personnes avec le nom "${name}" (${people.length} personnes)` :
            config.type === 'professions' ? 
                `Personnes avec la profession "${name}" (${people.length} personnes)` :
                config.type === 'duree_vie' ? 
                    `Personnes ayant vécu ${name} ans (${people.length} personnes)` :
                    config.type === 'age_procreation' ?
                    `Personnes ayant eu un enfant à ${name} ans (${people.length} personnes)` : 
                        config.type === 'lieux' ?
                        `Personnes ayant un lien avec le lieu ${name}  (${people.length} personnes)`:
                        'Personnes';

    title.style.marginBottom = '10px';
    title.style.borderBottom = '1px solid #eee';
    title.style.paddingBottom = '5px';
    title.style.fontSize = nameCloudState.mobilePhone ? '12px' : '16px'; 

    // Bouton de fermeture
    const closeBtn = document.createElement('button');
    closeBtn.id = 'person-list-close-button';  // Ajout d'un ID unique
    closeBtn.innerHTML = '×';
    closeBtn.style.position = 'absolute';
    closeBtn.style.right = '10px';
    closeBtn.style.top = '10px';
    closeBtn.style.border = 'none';
    closeBtn.style.background = 'none';
    closeBtn.style.fontSize = '20px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = () => {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    };

    // Liste des personnes
    const list = document.createElement('div');
    list.style.display = 'grid';
    list.style.gap = '2px';  // Espacement réduit
    list.style.fontSize = '14px';  // Taille de police réduite

    // // Trier les personnes par date
    // const peopleWithDates = people.map(person => {
    //     let date = '';
    //     let sortDate = 0;
    //     const individual = state.gedcomData.individuals[person.id];

    //     if (individual) {
    //         if (individual.birthDate) {
    //             date = `👶 ${individual.birthDate}`; //🚼
    //             sortDate = extractYear(individual.birthDate) || 0;
    //         } else if (individual.deathDate) {
    //             date = `✝ ${individual.deathDate}`; // ☦ 🏴 ⚰️
    //             sortDate = extractYear(individual.deathDate) || 0;
    //         } else if (individual.spouseFamilies && individual.spouseFamilies.length > 0) {
    //             for (const famId of individual.spouseFamilies) {
    //                 const family = state.gedcomData.families[famId];
    //                 if (family && family.marriageDate) {
    //                     date = `💍 ${family.marriageDate}`;  //🔗 💞 ⚭ 
    //                     sortDate = extractYear(family.marriageDate) || 0;
    //                     break;
    //                 }
    //             }
    //         }
    //     }

    //     return {
    //         name: person.name,
    //         id: person.id,  // Assurez-vous d'inclure l'ID ici
    //         date: date,
    //         sortDate: sortDate
    //     };
    // }).sort((a, b) => b.sortDate - a.sortDate);


    // peopleWithDates.forEach((person, index) => {
    //     const personDiv = document.createElement('div');
    //     personDiv.style.padding = '3px 5px';
    //     personDiv.style.backgroundColor = index % 2 === 0 ? '#f9f9f9' : 'white';
    //     personDiv.style.display = 'flex';
    //     personDiv.style.justifyContent = 'space-between';
    //     personDiv.style.alignItems = 'center';
    //     personDiv.style.lineHeight = '1.2';
    //     personDiv.style.cursor = 'pointer';

    //     const nameSpan = document.createElement('span');
    //     nameSpan.textContent = person.name;
    //     nameSpan.style.marginRight = '10px';
    //     if (nameCloudState.mobilePhone)
    //         {nameSpan.style.fontSize = '12px';} // Taille fixe en pixels

    //     const dateSpan = document.createElement('span');
    //     dateSpan.textContent = person.date;
    //     dateSpan.style.color = 'darkblue';
    //     dateSpan.style.whiteSpace = 'nowrap';
    //     if (nameCloudState.mobilePhone)
    //         {dateSpan.style.fontSize = '10px';} // Taille fixe en pixels

    //     personDiv.appendChild(nameSpan);
    //     personDiv.appendChild(dateSpan);

    //     personDiv.addEventListener('click', (event) => {
    //         console.log('Clicked on person:', person.name, person.id); // Log pour vérifier le clic et l'ID

    //         event.stopPropagation();
    //         showPersonActions(person, event);
    //     });

    //     list.appendChild(personDiv);
    // });






    // Trier les personnes par date
    const peopleWithDates = people.map(person => {
        let date = '';
        let sortDate = 0;
        let symbolType = ''; // Pour stocker le type de symbole
        const individual = state.gedcomData.individuals[person.id];

        if (individual) {
            if (individual.birthDate) {
                symbolType = 'birth';
                date = `<span class="date-symbol" style="font-size: 1.5em; vertical-align: middle;">👶</span> ${individual.birthDate}`; //🚼
                sortDate = extractYear(individual.birthDate) || 0;
            } else if (individual.deathDate) {
                symbolType = 'death';
                date = `<span class="date-symbol" style="font-size: 1.6em; vertical-align: middle;">✝</span> ${individual.deathDate}`; //☦🏴⚰️
                sortDate = extractYear(individual.deathDate) || 0;
            } else if (individual.spouseFamilies && individual.spouseFamilies.length > 0) {
                for (const famId of individual.spouseFamilies) {
                    const family = state.gedcomData.families[famId];
                    if (family && family.marriageDate) {
                        symbolType = 'marriage';
                        date = `<span class="date-symbol" style="font-size: 1.6em; vertical-align: middle;">💍</span> ${family.marriageDate}`; //🔗💞⚭
                        sortDate = extractYear(family.marriageDate) || 0;
                        break;
                    }
                }
            }
        }

        return {
            name: person.name,
            id: person.id,
            date: date,
            symbolType: symbolType,
            sortDate: sortDate
        };
    }).sort((a, b) => b.sortDate - a.sortDate);


    peopleWithDates.forEach((person, index) => {
        const personDiv = document.createElement('div');
        personDiv.style.padding = '3px 5px';
        personDiv.style.backgroundColor = index % 2 === 0 ? '#f9f9f9' : 'white';
        personDiv.style.display = 'flex';
        personDiv.style.justifyContent = 'space-between';
        personDiv.style.alignItems = 'center';
        personDiv.style.lineHeight = '1.2';
        personDiv.style.cursor = 'pointer';

        const nameSpan = document.createElement('span');
        nameSpan.textContent = person.name;
        nameSpan.style.marginRight = '10px';
        if (nameCloudState.mobilePhone)
            {nameSpan.style.fontSize = '12px';} // Taille fixe en pixels

        const dateSpan = document.createElement('span');
        dateSpan.innerHTML = person.date; // Utiliser innerHTML pour interpréter les balises span
        dateSpan.style.color = 'darkblue';
        dateSpan.style.whiteSpace = 'nowrap';
        if (nameCloudState.mobilePhone)
            {dateSpan.style.fontSize = '10px';} // Taille fixe en pixels

        personDiv.appendChild(nameSpan);
        personDiv.appendChild(dateSpan);

        personDiv.addEventListener('click', (event) => {
            console.log('Clicked on person:', person.name, person.id);
            event.stopPropagation();
            showPersonActions(person, event);
        });

        list.appendChild(personDiv);
    });









    content.appendChild(closeBtn);
    content.appendChild(title);
    content.appendChild(list);
    modal.appendChild(content);
    document.body.appendChild(modal);


    // Gestion de la touche Échap
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);

}

export function showPersonActions(person, event) {
    console.log('Showing actions for:', person.name, person.id);

    // Supprimer tout menu contextuel existant
    const existingMenu = document.getElementById('person-actions-menu');
    if (existingMenu) {
        existingMenu.remove();
    }

    const actionsMenu = document.createElement('div');
    actionsMenu.id = 'person-actions-menu';
    actionsMenu.style.position = 'fixed';
    actionsMenu.style.left = `${event.clientX}px`;
    actionsMenu.style.top = `${event.clientY}px`;
    actionsMenu.style.backgroundColor = 'white';
    actionsMenu.style.border = '1px solid #ccc';
    actionsMenu.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    actionsMenu.style.zIndex = '10000';

    const actions = [
        { text: "Voir dans l'arbre", action: () => showInTree(person.id) },
        { text: "Voir la fiche", action: () => showPersonDetails(person.id) },
        { text: "Animation", action: () => startAnimation(person.id) }
    ];

    actions.forEach(action => {
        const actionButton = document.createElement('button');
        actionButton.textContent = action.text;
        actionButton.style.display = 'block';
        actionButton.style.width = '100%';
        actionButton.style.padding = '5px 10px';
        actionButton.style.border = 'none';
        actionButton.style.backgroundColor = 'transparent';
        actionButton.style.textAlign = 'left';
        actionButton.style.cursor = 'pointer';

        actionButton.addEventListener('mouseenter', () => {
            actionButton.style.backgroundColor = '#f0f0f0';
        });

        actionButton.addEventListener('mouseleave', () => {
            actionButton.style.backgroundColor = 'transparent';
        });

        actionButton.addEventListener('click', (e) => {
            e.stopPropagation();
            actionsMenu.remove();
            action.action();
        });

        actionsMenu.appendChild(actionButton);
    });

    document.body.appendChild(actionsMenu);

    // Fermer le menu si on clique ailleurs
    document.addEventListener('click', function closeMenu(e) {
        const menu = document.getElementById('person-actions-menu');
        if (menu && !menu.contains(e.target)) {
            if (menu.parentNode) {
                menu.parentNode.removeChild(menu);
            }
            document.removeEventListener('click', closeMenu);
        }
    });
}

export function showPersonDetails(personId) {
    console.log('Showing details for:', personId);
    displayPersonDetails(personId);

    const modal = document.querySelector('.modal-container');
    if (modal) {
        modal.remove();
    }
}

export function startAnimation(personId) {
    state.rootPersonId = personId;
    console.log('Starting animation with:', personId);
    startAncestorAnimation();

    const modal = document.querySelector('.modal-container');
    if (modal) {
        modal.remove();
    }
}

export function showInTree(personId) {
    state.rootPersonId = personId;
    state.treeMode = 'ancestors';
    console.log('Showing in tree:', personId);
    
    // Vous devrez importer ou définir cette fonction
    import('./treeRenderer.js').then(module => {
        module.drawTree();
    });

    const modal = document.querySelector('.modal-container');
    if (modal) {
        modal.remove();
    }
}