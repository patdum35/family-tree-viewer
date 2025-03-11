import { nameCloudState } from './nameCloud.js';
import { refreshHeatmap } from './geoHeatMapDataProcessor.js';

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
    
    // Fonction de rafraîchissement qui vérifie s'il y a eu un vrai changement
    const smartRefresh = (element, key) => {
        // Vérifier si la valeur a vraiment changé
        if (hasValueChanged(element, key)) {
            if (typeof refreshHeatmap === 'function' && 
                document.getElementById('namecloud-heatmap-wrapper')) {
                refreshHeatmap();
            }
        }
    };
    
    // Version debounced du rafraîchissement intelligent
    const debouncedSmartRefresh = debounce(smartRefresh, 1000);
    
    // Attacher des écouteurs aux éléments de typeSelect et scopeSelect
    const typeSelect = document.querySelector('[data-text-key="typeSelect"]');
    const scopeSelect = document.querySelector('[data-text-key="scopeSelect"]');
    const startDateInput = document.querySelector('[data-text-key="startDateInput"]');
    const endDateInput = document.querySelector('[data-text-key="endDateInput"]');
    const rootPersonSelect = document.querySelector('[data-text-key="rootPersonResults"]');
    
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
    
    // Pour le bouton OK/Valider
    const validateButton = document.querySelector('button[title="Valider"]');
    if (validateButton) {
        validateButton.addEventListener('click', () => {
            if (typeof refreshHeatmap === 'function' && 
                document.getElementById('namecloud-heatmap-wrapper')) {
                refreshHeatmap();
            }
        });
    }
}