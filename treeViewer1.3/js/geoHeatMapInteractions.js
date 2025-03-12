import { nameCloudState } from './nameCloud.js';
import { refreshHeatmap } from './geoHeatMapDataProcessor.js';
import { filterPeopleByText, extractSearchTextFromTitle } from './nameCloud.js';
import { showPersonsList } from './nameCloudInteractions.js';


/**
 * Sauvegarde la position et les dimensions de la heatmap
 */
export function saveHeatmapPosition() {
    const wrapper = document.getElementById('namecloud-heatmap-wrapper');
    if (!wrapper) return;
    
    // Obtenir la position et les dimensions réelles de l'élément
    const rect = wrapper.getBoundingClientRect();
    
    // Vérifier que les valeurs sont raisonnables
    if (rect.width < 50 || rect.height < 50 || rect.top < 0 || rect.left < 0) {
        console.warn("Valeurs de position/taille invalides détectées, sauvegarde ignorée");
        return;
    }
    
    // S'assurer que l'objet existe
    if (!nameCloudState.heatmapPosition) {
        nameCloudState.heatmapPosition = {};
    }
    
    // Stocker les valeurs
    nameCloudState.heatmapPosition = {
        top: Math.round(rect.top),
        left: Math.round(rect.left),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
    };
}

/**
 * Rend un élément déplaçable
 * 
 * @param {HTMLElement} element - Élément à rendre déplaçable
 * @param {Array|HTMLElement} handles - Poignée(s) pour le déplacement
 */
export function makeElementDraggable(element, handles) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    // Convertir en tableau si ce n'est pas déjà le cas
    if (!Array.isArray(handles)) {
        handles = [handles];
    }
    
    // Attacher l'événement à chaque poignée
    handles.forEach(handle => {
        if (handle) {
            handle.onmousedown = dragMouseDown;
            
            // Support tactile
            handle.ontouchstart = touchDragStart;
        }
    });
    
    // Si aucune poignée n'est fournie, l'élément entier devient la poignée
    if (handles.length === 0 || !handles[0]) {
        element.onmousedown = dragMouseDown;
        element.ontouchstart = touchDragStart;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // Obtenir la position de la souris au démarrage
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // Appeler la fonction quand la souris bouge
        document.onmousemove = elementDrag;
    }
    
    // Fonction pour gérer les événements tactiles
    function touchDragStart(e) {
        if (e.touches && e.touches.length === 1) {
            e.preventDefault();
            const touch = e.touches[0];
            pos3 = touch.clientX;
            pos4 = touch.clientY;
            document.ontouchend = closeDragElement;
            document.ontouchcancel = closeDragElement;
            document.ontouchmove = elementTouchDrag;
        }
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // Calculer la nouvelle position
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        // Limiter le déplacement pour ne pas sortir de la fenêtre
        const newTop = (element.offsetTop - pos2);
        const newLeft = (element.offsetLeft - pos1);
        
        // Empêcher de sortir à gauche ou en haut
        if (newTop < 0) pos2 = element.offsetTop;
        if (newLeft < 0) pos1 = element.offsetLeft;
        
        // Empêcher de sortir à droite ou en bas
        const maxRight = window.innerWidth - element.offsetWidth;
        const maxBottom = window.innerHeight - element.offsetHeight;
        
        if (newLeft > maxRight) pos1 = element.offsetLeft - maxRight;
        if (newTop > maxBottom) pos2 = element.offsetTop - maxBottom;
        
        // Définir la nouvelle position de l'élément
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";

        // Ajouter un délai pour la sauvegarde (throttling)
        if (!elementDrag.saveTimeout) {
            elementDrag.saveTimeout = setTimeout(() => {
                saveHeatmapPosition();
                elementDrag.saveTimeout = null;
            }, 200);
        }
    }
    
    // Fonction pour gérer le déplacement tactile
    function elementTouchDrag(e) {
        if (e.touches && e.touches.length === 1) {
            e.preventDefault();
            const touch = e.touches[0];
            
            pos1 = pos3 - touch.clientX;
            pos2 = pos4 - touch.clientY;
            pos3 = touch.clientX;
            pos4 = touch.clientY;
            
            // Appliquer les mêmes limites que pour la souris
            const newTop = (element.offsetTop - pos2);
            const newLeft = (element.offsetLeft - pos1);
            
            if (newTop < 0) pos2 = element.offsetTop;
            if (newLeft < 0) pos1 = element.offsetLeft;
            
            const maxRight = window.innerWidth - element.offsetWidth;
            const maxBottom = window.innerHeight - element.offsetHeight;
            
            if (newLeft > maxRight) pos1 = element.offsetLeft - maxRight;
            if (newTop > maxBottom) pos2 = element.offsetTop - maxBottom;
            
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
        }
    }

    function closeDragElement() {
        // Arrêter de déplacer quand on relâche la souris ou le toucher
        document.onmouseup = null;
        document.onmousemove = null;
        document.ontouchend = null;
        document.ontouchcancel = null;
        document.ontouchmove = null;
        
        // Sauvegarder la position si la fonction existe
        if (typeof saveHeatmapPosition === 'function') {
            saveHeatmapPosition();
        }
    }
}

/**
 * Attache des écouteurs d'événements aux filtres pour mettre à jour la heatmap automatiquement
 */
export function attachFilterListeners() {

    // Fonction debounce pour éviter de réagir trop souvent
    const debounce = (func, wait) => {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };
    
    // Stocker les valeurs précédentes pour détecter les vrais changements
    const previousValues = {
        type: null,
        scope: null,
        startDate: null,
        endDate: null,
        rootPerson: null
    };
    

    // Fonction pour vérifier si une valeur a réellement changé
    const hasValueChanged = (element, key) => {
        
        // Si c'est un élément select ou input standard
        if (element.tagName === 'SELECT' || element.tagName === 'INPUT') {
            if (previousValues[key] === null) {
                previousValues[key] = element.value;
                return false; // Premier chargement, pas de changement
            }
            
            const hasChanged = element.value !== previousValues[key];
            if (hasChanged) {
                previousValues[key] = element.value;
            }
            return hasChanged;
        }
        
        // Pour les sélecteurs personnalisés
        if (element.className === 'custom-select-container') {
            const value = element.value || element.dataset?.value;
            if (previousValues[key] === null) {
                previousValues[key] = value;
                return false; // Premier chargement, pas de changement
            }
            
            const hasChanged = value !== previousValues[key];
            if (hasChanged) {
                previousValues[key] = value;
            }
            return hasChanged;
        }
        
        return false; // Par défaut, pas de changement
    };

    
    /**
     * Modification de smartRefresh dans attachFilterListeners
     */
    const smartRefresh = (element, key) => {
        
        // Vérifier si la valeur a vraiment changé
        console.log("[LOG BASE] smartRefresh appelé");
        if (hasValueChanged(element, key)) {
            console.log("[LOG] smartRefresh - Valeur changée pour:", key);
            // Mettre à jour la heatmap si elle est visible
            if (typeof refreshHeatmap === 'function' && 
                document.getElementById('namecloud-heatmap-wrapper')) {
                refreshHeatmap();
            }
            
            // Rafraîchir la liste après un petit délai
            setTimeout(() => {
                console.log("[LOG] Tentative d'appel à refreshPersonList");
                refreshPersonList();
            }, 400);
        }
    };
    
    
    // Version debounced du rafraîchissement intelligent
    const debouncedSmartRefresh = debounce(smartRefresh, 1000);
    
    // Attacher des écouteurs aux éléments de typeSelect et scopeSelect
    const rootPersonSelect = document.querySelector('[data-text-key="rootPersonResults"]');
    const typeSelect = document.querySelector('[data-text-key="typeSelect"], .custom-select-container[data-value]');
    const scopeSelect = document.querySelector('[data-text-key="scopeSelect"], .custom-select-container[data-value]');
    const startDateInput = document.querySelector('input[type="number"][data-text-key="startDateInput"]');
    const endDateInput = document.querySelector('input[type="number"][data-text-key="endDateInput"]');
    
    console.log("Sélecteurs trouvés :", {
        typeSelect: typeSelect ? typeSelect.outerHTML : null,
        scopeSelect: scopeSelect ? scopeSelect.outerHTML : null,
        startDateInput: startDateInput ? startDateInput.outerHTML : null,
        endDateInput: endDateInput ? endDateInput.outerHTML : null
    });

    
    // Pour le typeSelect
    if (typeSelect) {
        typeSelect.addEventListener('change', () => debouncedSmartRefresh(typeSelect, 'type'));
    }
    
    // Pour le scopeSelect
    if (scopeSelect) {
        scopeSelect.addEventListener('change', () => debouncedSmartRefresh(scopeSelect, 'scope'));
    }
    
    // Pour les dates
    if (startDateInput) {
        startDateInput.addEventListener('change', () => debouncedSmartRefresh(startDateInput, 'startDate'));
    }
    
    if (endDateInput) {
        endDateInput.addEventListener('change', () => debouncedSmartRefresh(endDateInput, 'endDate'));
    }
    


    console.log("[TRACE] Éléments trouvés:", {
        typeSelect: !!typeSelect,
        scopeSelect: !!scopeSelect,
        startDateInput: !!startDateInput,
        endDateInput: !!endDateInput,
        // validateButton: !!validateButton
    });

    // Pour le bouton OK/Valider
    const validateButton = document.querySelector('button[title="Valider"]');
    if (validateButton) {
        // Modification du gestionnaire du bouton Valider aussi dans geoHeatMapInteractions.js
        validateButton.addEventListener('click', () => {
            if (typeof refreshHeatmap === 'function' && 
                document.getElementById('namecloud-heatmap-wrapper')) {
                refreshHeatmap();
                
                // Rafraîchir la liste après un petit délai
                setTimeout(refreshPersonList, 400);
            }
        });
    }
}


// Ajouter cet écouteur quelque part où il sera initialisé une seule fois
document.addEventListener('refreshPersonList', (event) => {
    console.log('Événement de rafraîchissement de liste reçu', event.detail);
    
    // Vérifier si une liste de personnes est actuellement affichée
    const personListModal = document.querySelector('.person-list-modal');
    if (!personListModal) return;
    
    // Extraire le texte de recherche
    const titleElement = personListModal.querySelector('h2');
    const searchText = extractSearchTextFromTitle(titleElement);
    
    if (!searchText) {
        console.log("Impossible d'extraire le texte de recherche");
        return;
    }
    
    // Utiliser la configuration actuelle
    const config = event.detail.config;
    
    // Filtrer les personnes
    const filteredPeople = filterPeopleByText(searchText, config);
    
    // Fermer l'ancienne liste et en ouvrir une nouvelle
    personListModal.remove();
    showPersonsList(searchText, filteredPeople, config);
});


/**
 * Fonction pour rafraîchir la liste de personnes
 */
function refreshPersonList() {

    console.log("[LOG] Début de refreshPersonList");

    // Vérifier si une liste de personnes est visible
    const personListModal = document.querySelector('.person-list-modal');
    if (!personListModal) return;
    
    // Récupérer le titre
    const titleElement = personListModal.querySelector('h2');
    const searchText = extractSearchTextFromTitle(titleElement);
    
    if (!searchText) {
        console.log("Impossible d'extraire le texte de recherche du titre");
        return;
    }
    
    console.log("Texte de recherche extrait:", searchText);
    
    // Récupérer la configuration actuelle
    const config = nameCloudState.currentConfig;
    if (!config) {
        console.log("Configuration actuelle non disponible");
        return;
    }
    
    // Utiliser la fonction factoriséé pour filtrer les personnes
    const filteredPeople = filterPeopleByText(searchText, config);
    console.log(`Personnes filtrées: ${filteredPeople.length}`);
    
    // Ajouter un effet de transition
    personListModal.style.transition = 'opacity 0.3s ease';
    personListModal.style.opacity = '0';
    
    // Attendre la fin de la transition avant de fermer/rouvrir
    setTimeout(() => {
        // Fermer la liste actuelle
        personListModal.remove();
        
        // Afficher la liste mise à jour
        showPersonsList(searchText, filteredPeople, config);
        
        // Ajouter un effet d'apparition à la nouvelle liste
        setTimeout(() => {
            const newListModal = document.querySelector('.person-list-modal');
            if (newListModal) {
                newListModal.style.opacity = '0';
                newListModal.style.transition = 'opacity 0.3s ease';
                
                // Petit délai pour s'assurer que le style initial est appliqué
                requestAnimationFrame(() => {
                    newListModal.style.opacity = '1';
                });
            }
        }, 10);
    }, 300); // Attendre la fin de la transition
}

