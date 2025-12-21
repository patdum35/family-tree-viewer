import { state } from './main.js';
import { debounce, isModalVisible } from './eventHandlers.js';

export function makeModalInteractive(modal) {
    // modal.style.position = "fixed";   // ou absolute selon ton cas
    state.topZindex++;
    modal.style.zIndex = state.topZindex;
    // console.log('\n\n debug init makeModalInteractive ', modal.id, state.topZindex);

    // écoute tout ce qui se passe dans la modal (y compris header)

    modal.addEventListener("mousedown", bringToFront, true);
    modal.addEventListener("touchstart", bringToFront, true);

    function bringToFront() {
        state.topZindex++;
        modal.style.zIndex = state.topZindex;
        // console.log('bringToFront', modal.id, state.topZindex);
        if (modal.id === 'search-modal') { 
            bringToFrontOfHamburgerButton();
        }
    }
}

export function bringToFrontOfHamburgerButton() {
    // verifier si le bouton hamburger se superpose à la modal searchModal
    // dans ce cas chnager le zIndex
    const hamburgerButton = document.getElementById('hamburger-menu');
    const searchModal = document.getElementById('search-modal');
    const searchContent = searchModal.querySelector('.searchModal-content'); 

    if (hamburgerButton) {
        // Récupérer les rectangles de position
        const modalRect = searchContent.getBoundingClientRect();
        const hamburgerRect = hamburgerButton.getBoundingClientRect();

        // Vérifier s’il y a chevauchement avec la zone de recherche de texte situé 30px sous le bandeau et 10px à droite
        const chevauchement =
            modalRect.left + 10 < hamburgerRect.right &&
            modalRect.right > hamburgerRect.left &&
            modalRect.top + 45 < hamburgerRect.bottom &&
            modalRect.bottom > hamburgerRect.top;

        if (chevauchement) {
            const hamburgerZ = parseInt(getComputedStyle(hamburgerButton).zIndex) || 0;
            searchModal.style.zIndex = hamburgerZ + 1;
            // console.log('\n\n **** -debug : Chevauchement détecté → z-index modal ajusté à', searchModal.style.zIndex,', hamburger=' , hamburgerRect, ', search=', modalRect);
        } else {
            // console.log('\n\n **** -debug :Aucun chevauchement détecté');
        }
    }
}


/**
 * Rend une modale déplaçable et redimensionnable
 * @param {HTMLElement} modal - L'élément de la modale
 * @param {HTMLElement} handle - L'élément qui sert de poignée pour déplacer la modale (généralement l'en-tête)
 */
export function makeModalDraggableAndResizable(modal, handle, rememberPositionAndSize = true) {
    // 1. Trouver le contenu réel à redimensionner (la modale elle-même dans ce cas)
    if (!modal) return;

    // console.log('n\n- debug in makeModalDraggableAndResizable  RESET position and size', rememberPositionAndSize);


    // exposer le flag et la fonction de reset
    modal._rememberPositionAndSize= !!rememberPositionAndSize;
    modal.resetPositionAndSize = function() {
        // cible l'élément sur lequel on a appliqué les styles (ici "modal")
        ['left','top','width','height','transform'].forEach(p => modal.style.removeProperty(p));
    };



    // Ajouter la classe pour le style des scrollbars
    if (!modal.className.includes('custom-modal')) {
        modal.className += ' custom-modal';
    }

    modal.classList.add('modal-resizable');

    // Ajouter la classe pour le style des scrollbars uniquement sur les appareils non tactiles
    if (!state.isTouchDevice) {
        if (!modal.className.includes('custom-modal')) {
            modal.className += ' custom-modal';
        }

        // Ajouter le style des scrollbars s'il n'existe pas déjà
        if (!document.getElementById('custom-modal-scrollbar-style')) {
            const style = document.createElement("style");
            style.id = 'custom-modal-scrollbar-style'; // ID pour éviter les doublons
            style.textContent = `
                .custom-modal::-webkit-scrollbar {
                    width: 10px;
                    height: 10px;
                }

                .custom-modal::-webkit-scrollbar-button {
                    height: 0px;
                    width: 0px;
                    display: none;
                }

                .custom-modal::-webkit-scrollbar-thumb {
                    background-color: #888;
                    border-radius: 6px; 
                    border: 3px solid transparent;
                }

                .custom-modal::-webkit-scrollbar-track {
                    background-color: #f1f1f1;
                    border-radius: 4px;
                    margin: 30px;
                }
            `;
            document.head.appendChild(style);
        }
    } else {
        // Sur les appareils tactiles, masquer complètement les scrollbars mais garder la fonctionnalité
        if (!document.getElementById('touch-device-scrollbar-style')) {
            const style = document.createElement("style");
            style.id = 'touch-device-scrollbar-style';

            style.textContent = `
                /* Masquer les scrollbars sur les appareils tactiles tout en gardant la fonctionnalité */

                .modal-resizable {
                    -ms-overflow-style: none;  /* IE et Edge */
                    scrollbar-width: none;  /* Firefox */
                }

                .modal-resizable::-webkit-scrollbar {
                    display: none; /* Chrome, Safari et Opera */
                }
            `;
            document.head.appendChild(style);
        }
    }


    // 2. S'assurer que la modale est correctement positionnée
    modal.style.position = 'fixed';
    
    // IMPORTANT: Forcer l'initialisation correcte des coordonnées
    // Si la modale utilise transform pour le centrage, la convertir en coordonnées absolues
    const rect = modal.getBoundingClientRect();
    
    if (modal.style.transform && modal.style.transform.includes('translate')) {
        // Garder la taille actuelle
        const width = rect.width;
        const height = rect.height;
        
        // Calculer la position absolue
        const left = rect.left;
        const top = rect.top;
        
        // Appliquer les nouvelles coordonnées sans transform
        modal.style.left = `${left}px`;
        modal.style.top = `${top}px`;
        modal.style.transform = 'none';
        
        // S'assurer que la taille reste la même
        modal.style.width = `${width}px`;
        modal.style.height = `${height}px`;
    }
    
    // 3. Gestion du déplacement
    handle.style.cursor = 'move';
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;
    
    // Démarrer le déplacement (souris)
    handle.addEventListener('mousedown', function(e) {
        // Ignorer si on clique sur le bouton de fermeture
        if (e.target.tagName === 'BUTTON' || e.target.textContent === '×') return;
        
        const rect = modal.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;
        startX = e.clientX;
        startY = e.clientY;
        isDragging = true;
        modal.setAttribute('data-dragging', 'true');
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        e.preventDefault();
        e.stopPropagation();
    });
    
    // Démarrer le déplacement (tactile)
    handle.addEventListener('touchstart', function(e) {
        // Ignorer si on touche le bouton de fermeture
        if (e.target.tagName === 'BUTTON' || e.target.textContent === '×') return;
        
        const touch = e.touches[0];
        const rect = modal.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;
        startX = touch.clientX;
        startY = touch.clientY;
        isDragging = true;
        
        document.addEventListener('touchmove', onTouchMove, { passive: false });
        document.addEventListener('touchend', onTouchEnd);
        e.preventDefault();
    });
    
    // Déplacer avec la souris
    function onMouseMove(e) {
        if (!isDragging) return;
        
        moveContent(e.clientX, e.clientY);
        e.preventDefault();
        e.stopPropagation();
    }
    
    // Déplacer avec le toucher
    function onTouchMove(e) {
        if (!isDragging) return;
        
        const touch = e.touches[0];
        moveContent(touch.clientX, touch.clientY);
        e.preventDefault();
    }
    
    // Fonction commune pour déplacer le contenu
    function moveContent(clientX, clientY) {
        const dx = clientX - startX;
        const dy = clientY - startY;
        
        modal.style.left = `${initialLeft + dx}px`;
        modal.style.top = `${initialTop + dy}px`;
        
        // Limites d'écran pour position fixed
        const rect = modal.getBoundingClientRect();
        if (rect.top < 0) modal.style.top = '0px';
        if (rect.left < 0) modal.style.left = '0px';
        if (rect.right > window.innerWidth) 
            modal.style.left = `${window.innerWidth - rect.width}px`;
        if (rect.bottom > window.innerHeight) 
            modal.style.top = `${window.innerHeight - rect.height}px`;
    }
    
    // Arrêter le déplacement (souris)
    function onMouseUp() {
        isDragging = false;
        modal.setAttribute('data-dragging', 'false');
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        
        // Actualiser les poignées
        createResizeHandles();
    }
    
    // Arrêter le déplacement (tactile)
    function onTouchEnd() {
        isDragging = false;
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);
        
        // Actualiser les poignées
        createResizeHandles();
    }
    
    // 4. Gestion du redimensionnement
    function createResizeHandles() {
        // Supprimer les anciennes poignées
        modal.querySelectorAll('.resize-handle').forEach(h => h.remove());
        
        // Positions des poignées
        const positions = ['e', 'se', 's', 'sw', 'w', 'nw', 'n', 'ne'];
        
        positions.forEach(pos => {
            const handle = document.createElement('div');
            handle.className = `resize-handle resize-${pos}`;
            handle.style.position = 'fixed';
            handle.style.zIndex = '10001';
            handle.style.background = 'transparent'; // Rendre invisible
            
            // Configurer l'apparence de chaque poignée selon sa position
            switch(pos) {
                case 'e':  // Est (droite)
                    handle.style.width = '10px';
                    handle.style.height = '100px';
                    handle.style.cursor = 'ew-resize';
                    break;
                case 'se': // Sud-Est (bas droite)
                    handle.style.width = '25px';
                    handle.style.height = '25px';
                    handle.style.cursor = 'nwse-resize';
                    // Montrer un indicateur visuel uniquement au survol
                    handle.addEventListener('mouseover', () => {
                        handle.style.background = 'linear-gradient(135deg, transparent 70%, rgba(0,0,0,0.3) 30%)';
                    });
                    handle.addEventListener('mouseout', () => {
                        handle.style.background = 'transparent';
                    });
                    break;
                case 's':  // Sud (bas)
                    handle.style.width = '100px';
                    handle.style.height = '10px';
                    handle.style.cursor = 'ns-resize';
                    break;
                case 'sw': // Sud-Ouest (bas gauche)
                    handle.style.width = '25px';
                    handle.style.height = '25px';
                    handle.style.cursor = 'nesw-resize';
                    // Montrer un indicateur visuel uniquement au survol
                    handle.addEventListener('mouseover', () => {
                        handle.style.background = 'linear-gradient(-135deg, transparent 70%, rgba(0,0,0,0.3) 30%)';
                    });
                    handle.addEventListener('mouseout', () => {
                        handle.style.background = 'transparent';
                    });
                    break;
                case 'w':  // Ouest (gauche)
                    handle.style.width = '10px';
                    handle.style.height = '100px';
                    handle.style.cursor = 'ew-resize';
                    break;
                case 'nw': // Nord-Ouest (haut gauche)
                    handle.style.width = '25px';
                    handle.style.height = '25px';
                    handle.style.cursor = 'nwse-resize';
                    // Montrer un indicateur visuel uniquement au survol
                    handle.addEventListener('mouseover', () => {
                        handle.style.background = 'linear-gradient(-45deg, transparent 70%, rgba(0,0,0,0.3) 30%)';
                    });
                    handle.addEventListener('mouseout', () => {
                        handle.style.background = 'transparent';
                    });
                    break;
                case 'n':  // Nord (haut)
                    handle.style.width = '100px';
                    handle.style.height = '10px';
                    handle.style.cursor = 'ns-resize';
                    break;
                case 'ne': // Nord-Est (haut droite)
                    handle.style.width = '25px';
                    handle.style.height = '25px';
                    handle.style.cursor = 'nesw-resize';
                    // Montrer un indicateur visuel uniquement au survol
                    handle.addEventListener('mouseover', () => {
                        handle.style.background = 'linear-gradient(45deg, transparent 70%, rgba(0,0,0,0.3) 30%)';
                    });
                    handle.addEventListener('mouseout', () => {
                        handle.style.background = 'transparent';
                    });
                    break;
            }
            
            setupResizeHandlers(handle, pos);
            modal.appendChild(handle);
        });
        
         // Fonction pour mettre à jour la position des poignées
        function updateHandlesPosition() {
            // Obtenir les dimensions actuelles de la modale par rapport à la fenêtre
            const rect = modal.getBoundingClientRect();
            
            // Mettre à jour la position de chaque poignée
            modal.querySelectorAll('.resize-handle').forEach(handle => {
                const pos = handle.className.replace('resize-handle resize-', '');
                
                switch(pos) {
                    case 'e':
                        handle.style.top = (rect.top + rect.height/2 - handle.offsetHeight/2) + 'px';
                        handle.style.left = (rect.right - 5) + 'px';
                        break;
                    case 'se':
                        handle.style.top = (rect.bottom - handle.offsetHeight) + 'px';
                        handle.style.left = (rect.right - handle.offsetWidth) + 'px';
                        break;
                    case 's':
                        handle.style.top = (rect.bottom - 5) + 'px';
                        handle.style.left = (rect.left + rect.width/2 - handle.offsetWidth/2) + 'px';
                        break;
                    case 'sw':
                        handle.style.top = (rect.bottom - handle.offsetHeight) + 'px';
                        handle.style.left = rect.left + 'px';
                        break;
                    case 'w':
                        handle.style.top = (rect.top + rect.height/2 - handle.offsetHeight/2) + 'px';
                        handle.style.left = (rect.left - 5) + 'px';
                        break;
                    case 'nw':
                        handle.style.top = rect.top + 'px';
                        handle.style.left = rect.left + 'px';
                        break;
                    case 'n':
                        handle.style.top = (rect.top - 5) + 'px';
                        handle.style.left = (rect.left + rect.width/2 - handle.offsetWidth/2) + 'px';
                        break;
                    case 'ne':
                        handle.style.top = rect.top + 'px';
                        handle.style.left = (rect.right - handle.offsetWidth) + 'px';
                        break;
                }
            });
        }
        
        // Ajouter des écouteurs d'événements pour mettre à jour la position des poignées
        window.addEventListener('scroll', updateHandlesPosition);
        document.addEventListener('scroll', updateHandlesPosition, true);
        window.addEventListener('resize', debounce(() => {
            if(isModalVisible(modal.id)) {
                console.log('\n\n*** debug resize in createResizeHandles in resizableModalUtils for updateHandlesPosition \n\n');
                updateHandlesPosition();
            }
        }, 150));
        modal.addEventListener('scroll', updateHandlesPosition);
        
        // Mettre à jour initialement
        updateHandlesPosition();
        
        // Utiliser requestAnimationFrame pour une mise à jour plus fluide
        let animationFrameId = null;
        function updateOnAnimation() {
            updateHandlesPosition();
            animationFrameId = requestAnimationFrame(updateOnAnimation);
        }
        animationFrameId = requestAnimationFrame(updateOnAnimation);
    
        // Stocker l'ID pour le nettoyage
        modal._animationFrameId = animationFrameId;
    }
    

   // Fonction pour configurer les gestionnaires d'événements pour chaque poignée
    function setupResizeHandlers(handle, pos) {
        let isResizing = false;
        let resizeStartX, resizeStartY, initialWidth, initialHeight, initialLeft, initialTop;
        
        // Démarrer le redimensionnement (souris)
        handle.addEventListener('mousedown', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const rect = modal.getBoundingClientRect();
            initialWidth = rect.width;
            initialHeight = rect.height;
            initialLeft = rect.left;
            initialTop = rect.top;
            resizeStartX = e.clientX;
            resizeStartY = e.clientY;
            isResizing = true;
            
            document.addEventListener('mousemove', onResizeMove);
            document.addEventListener('mouseup', onResizeEnd);
        });
        
        // Démarrer le redimensionnement (tactile)
        handle.addEventListener('touchstart', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Rendre la poignée visible lors du toucher en mode tactile
            showResizeHandleVisual(handle, pos);
            
            const touch = e.touches[0];
            const rect = modal.getBoundingClientRect();
            initialWidth = rect.width;
            initialHeight = rect.height;
            initialLeft = rect.left;
            initialTop = rect.top;
            resizeStartX = touch.clientX;
            resizeStartY = touch.clientY;
            isResizing = true;
            
            document.addEventListener('touchmove', onResizeTouchMove, { passive: false });
            document.addEventListener('touchend', onResizeEnd);
        });
        
        // Fonction pour afficher la visualisation de la poignée
        function showResizeHandleVisual(handle, pos) {
            // Définir le style de fond selon la position
            switch(pos) {
                case 'se':
                    handle.style.background = 'linear-gradient(135deg, transparent 70%, rgba(0,0,0,0.5) 30%)';
                    break;
                case 'sw':
                    handle.style.background = 'linear-gradient(-135deg, transparent 70%, rgba(0,0,0,0.5) 30%)';
                    break;
                case 'nw':
                    handle.style.background = 'linear-gradient(-45deg, transparent 70%, rgba(0,0,0,0.5) 30%)';
                    break;
                case 'ne':
                    handle.style.background = 'linear-gradient(45deg, transparent 70%, rgba(0,0,0,0.5) 30%)';
                    break;
                case 'e':
                case 'w':
                    handle.style.background = 'rgba(0,0,0,0.2)';
                    break;
                case 'n':
                case 's':
                    handle.style.background = 'rgba(0,0,0,0.2)';
                    break;
            }
            
            // Ajouter un indicateur de curseur visuel pour le tactile
            // (petite icône ou élément qui simule le curseur)
            const cursorIndicator = document.createElement('div');
            cursorIndicator.className = 'touch-cursor-indicator';
            cursorIndicator.style.position = 'absolute';
            cursorIndicator.style.width = '24px';
            cursorIndicator.style.height = '24px';
            cursorIndicator.style.pointerEvents = 'none';
            cursorIndicator.style.zIndex = '10002';
            
            // Définir l'indicateur selon la direction
            if (pos.includes('e') || pos.includes('w')) {
                cursorIndicator.innerHTML = '⟷'; // Indicateur horizontal
            } else if (pos.includes('n') || pos.includes('s')) {
                cursorIndicator.innerHTML = '⟺'; // Indicateur vertical
            } else {
                cursorIndicator.innerHTML = '⤡'; // Indicateur diagonal
            }
            
            // Positionner l'indicateur près de la poignée
            handle.appendChild(cursorIndicator);
            
            // Stocker une référence pour la suppression
            handle._cursorIndicator = cursorIndicator;
        }
        
        // Redimensionner avec la souris
        function onResizeMove(e) {
            if (!isResizing) return;
            
            resizeContent(e.clientX, e.clientY);
            e.preventDefault();
        }
        
        // Redimensionner avec le toucher
        function onResizeTouchMove(e) {
            if (!isResizing) return;
            
            const touch = e.touches[0];
            resizeContent(touch.clientX, touch.clientY);
            e.preventDefault();
        }
        
        // Fonction commune pour redimensionner
        function resizeContent(clientX, clientY) {
            const dx = clientX - resizeStartX;
            const dy = clientY - resizeStartY;
            
            // Valeurs par défaut (pas de changement)
            let newWidth = initialWidth;
            let newHeight = initialHeight;
            let newLeft = initialLeft;
            let newTop = initialTop;
            
            // Redimensionnement horizontal
            if (pos.includes('e')) {
                newWidth = initialWidth + dx;
            } else if (pos.includes('w')) {
                newWidth = initialWidth - dx;
                newLeft = initialLeft + dx;
            }
            
            // Redimensionnement vertical
            if (pos.includes('s')) {
                newHeight = initialHeight + dy;
            } else if (pos.includes('n')) {
                newHeight = initialHeight - dy;
                newTop = initialTop + dy;
            }
            
            // Limites minimales
            const minWidth = 50; //300;
            const minHeight = 50; //200;
            
            // Appliquer les nouvelles dimensions avec limites
            if ((pos.includes('w') || pos.includes('e')) && newWidth >= minWidth) {
                modal.style.width = `${newWidth}px`;
                if (pos.includes('w')) {
                    modal.style.left = `${newLeft}px`;
                }
            }
            
            if ((pos.includes('n') || pos.includes('s')) && newHeight >= minHeight) {
                modal.style.height = `${newHeight}px`;
                if (pos.includes('n')) {
                    modal.style.top = `${newTop}px`;
                }
            }
            
            // Assurer que la modale reste dans l'écran
            const rect = modal.getBoundingClientRect();
            if (rect.right > window.innerWidth) {
                modal.style.width = `${window.innerWidth - rect.left}px`;
            }
            if (rect.bottom > window.innerHeight) {
                modal.style.height = `${window.innerHeight - rect.top}px`;
            }
            if (rect.left < 0 && pos.includes('w')) {
                const adjustedWidth = initialWidth + initialLeft;
                modal.style.left = '0px';
                modal.style.width = `${adjustedWidth}px`;
            }
            if (rect.top < 0 && pos.includes('n')) {
                const adjustedHeight = initialHeight + initialTop;
                modal.style.top = '0px';
                modal.style.height = `${adjustedHeight}px`;
            }

            if (modal.id.includes('person-fullDetails-modal') ) {
                const innerContent = document.getElementById('person-details-content');
                if (innerContent) {
                    // console.log('\n\n - debug innerContent detected in resizeContent ', window.innerHeight, modal.offsetTop)
                    innerContent.style.maxWidth = Math.min(440, window.innerWidth - modal.offsetLeft) +'px';
                    innerContent.style.maxHeight = window.innerHeight - modal.offsetTop + 'px';
                }
            }
        }
        
        // Arrêter le redimensionnement
        function onResizeEnd() {
            isResizing = false;
            document.removeEventListener('mousemove', onResizeMove);
            document.removeEventListener('touchmove', onResizeTouchMove);
            document.removeEventListener('mouseup', onResizeEnd);
            document.removeEventListener('touchend', onResizeEnd);
            
            // Masquer la poignée après le redimensionnement
            handle.style.background = 'transparent';
            
            // Supprimer l'indicateur de curseur
            if (handle._cursorIndicator) {
                handle._cursorIndicator.remove();
                delete handle._cursorIndicator;
            }
        }
    }
    
    // 5. Initialiser les poignées
    createResizeHandles();

    // Fonction de nettoyage
    modal._cleanupDraggable = function() {
        window.removeEventListener('scroll', modal._handlesUpdateFn);
        document.removeEventListener('scroll', modal._handlesUpdateFn, true);
        window.removeEventListener('resize', modal._handlesUpdateFn);
        modal.removeEventListener('scroll', modal._handlesUpdateFn);

        // si on ne veut pas garder la position/taille entre ouvertures -> on reset
        if (!modal._rememberPositionAndSize) {
            try { modal.resetPositionAndSize(); } catch(e){ /* safe */ }
        }
              
        if (modal._animationFrameId) {
            cancelAnimationFrame(modal._animationFrameId);
        }
        modal.querySelectorAll('.resize-handle').forEach(h => {
            if (h.parentNode) h.parentNode.removeChild(h);
        });
    };
}