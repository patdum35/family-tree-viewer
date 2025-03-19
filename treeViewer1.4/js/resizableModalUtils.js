/**
 * Rend une modale déplaçable et redimensionnable
 * @param {HTMLElement} modal - L'élément de la modale
 * @param {HTMLElement} handle - L'élément qui sert de poignée pour déplacer la modale (généralement l'en-tête)
 */
export function makeModalDraggableAndResizable(modal, handle) {
    // 1. Trouver le contenu réel à redimensionner (la modale elle-même dans ce cas)
    if (!modal) return;



    // Ajouter la classe pour le style des scrollbars
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
    // function createResizeHandles() {
    //     // Supprimer les anciennes poignées
    //     modal.querySelectorAll('.resize-handle').forEach(h => h.remove());
        
    //     // Positions des poignées
    //     const positions = ['e', 'se', 's', 'sw', 'w', 'nw', 'n', 'ne'];
        
    //     positions.forEach(pos => {
    //         const handle = document.createElement('div');
    //         handle.className = `resize-handle resize-${pos}`;
    //         handle.style.position = 'absolute';
    //         handle.style.zIndex = '9999';
            
    //         // Configurer l'apparence et la position de chaque poignée selon sa position
    //         switch(pos) {
    //             case 'e':  // Est (droite)
    //                 handle.style.right = '0px';
    //                 handle.style.top = '50%';
    //                 handle.style.transform = 'translateY(-50%)';
    //                 handle.style.width = '10px';
    //                 handle.style.height = '100%';
    //                 handle.style.cursor = 'ew-resize';
    //                 break;
    //             case 'se': // Sud-Est (bas droite)
    //                 handle.style.right = '0px';
    //                 handle.style.bottom = '0px';
    //                 handle.style.width = '20px';
    //                 handle.style.height = '20px';
    //                 handle.style.cursor = 'nwse-resize';
    //                 handle.style.backgroundColor = 'rgba(100, 150, 255, 0.5)';
    //                 break;
    //             case 's':  // Sud (bas)
    //                 handle.style.bottom = '0px';
    //                 handle.style.left = '50%';
    //                 handle.style.transform = 'translateX(-50%)';
    //                 handle.style.width = '100%';
    //                 handle.style.height = '10px';
    //                 handle.style.cursor = 'ns-resize';
    //                 break;
    //             case 'sw': // Sud-Ouest (bas gauche)
    //                 handle.style.left = '0px';
    //                 handle.style.bottom = '0px';
    //                 handle.style.width = '20px';
    //                 handle.style.height = '20px';
    //                 handle.style.cursor = 'nesw-resize';
    //                 handle.style.backgroundColor = 'rgba(100, 150, 255, 0.2)';
    //                 break;
    //             case 'w':  // Ouest (gauche)
    //                 handle.style.left = '0px';
    //                 handle.style.top = '50%';
    //                 handle.style.transform = 'translateY(-50%)';
    //                 handle.style.width = '10px';
    //                 handle.style.height = '100%';
    //                 handle.style.cursor = 'ew-resize';
    //                 break;
    //             case 'nw': // Nord-Ouest (haut gauche)
    //                 handle.style.left = '0px';
    //                 handle.style.top = '0px';
    //                 handle.style.width = '20px';
    //                 handle.style.height = '20px';
    //                 handle.style.cursor = 'nwse-resize';
    //                 handle.style.backgroundColor = 'rgba(100, 150, 255, 0.2)';
    //                 break;
    //             case 'n':  // Nord (haut)
    //                 handle.style.top = '0px';
    //                 handle.style.left = '50%';
    //                 handle.style.transform = 'translateX(-50%)';
    //                 handle.style.width = '100%';
    //                 handle.style.height = '10px';
    //                 handle.style.cursor = 'ns-resize';
    //                 break;
    //             case 'ne': // Nord-Est (haut droite)
    //                 handle.style.right = '0px';
    //                 handle.style.top = '0px';
    //                 handle.style.width = '20px';
    //                 handle.style.height = '20px';
    //                 handle.style.cursor = 'nesw-resize';
    //                 handle.style.backgroundColor = 'rgba(100, 150, 255, 0.2)';
    //                 break;
    //         }
            
    //         setupResizeHandlers(handle, pos);
            
    //         // Ajouter la poignée au modal
    //         modal.appendChild(handle);
    //     });
    // }

    // function createResizeHandles() {
    //     // Supprimer les anciennes poignées
    //     modal.querySelectorAll('.resize-handle').forEach(h => h.remove());
        
    //     // Positions des poignées
    //     const positions = ['e', 'se', 's', 'sw', 'w', 'nw', 'n', 'ne'];
        
    //     positions.forEach(pos => {
    //         const handle = document.createElement('div');
    //         handle.className = `resize-handle resize-${pos}`;
    //         handle.style.position = 'fixed'; // Position fixe par rapport à la fenêtre
    //         // handle.style.zIndex = '9999';
    //         handle.style.zIndex = '10001'; // Augmenter le z-index
            
    //         // Configurer l'apparence de chaque poignée selon sa position
    //         switch(pos) {
    //             case 'e':  // Est (droite)
    //                 handle.style.width = '10px';
    //                 handle.style.height = '100px'; // Hauteur fixe
    //                 handle.style.cursor = 'ew-resize';
    //                 break;
    //             case 'se': // Sud-Est (bas droite)
    //                 handle.style.width = '20px';
    //                 handle.style.height = '20px';
    //                 handle.style.cursor = 'nwse-resize';
    //                 handle.style.backgroundColor = 'rgba(100, 150, 255, 0.5)';
    //                 break;
    //             case 's':  // Sud (bas)
    //                 handle.style.width = '100px'; // Largeur fixe
    //                 handle.style.height = '10px';
    //                 handle.style.cursor = 'ns-resize';
    //                 break;
    //             case 'sw': // Sud-Ouest (bas gauche)
    //                 handle.style.width = '20px';
    //                 handle.style.height = '20px';
    //                 handle.style.cursor = 'nesw-resize';
    //                 handle.style.backgroundColor = 'rgba(100, 150, 255, 0.2)';
    //                 break;
    //             case 'w':  // Ouest (gauche)
    //                 handle.style.width = '10px';
    //                 handle.style.height = '100px'; // Hauteur fixe
    //                 handle.style.cursor = 'ew-resize';
    //                 break;
    //             case 'nw': // Nord-Ouest (haut gauche)
    //                 handle.style.width = '20px';
    //                 handle.style.height = '20px';
    //                 handle.style.cursor = 'nwse-resize';
    //                 handle.style.backgroundColor = 'rgba(100, 150, 255, 0.2)';
    //                 break;
    //             case 'n':  // Nord (haut)
    //                 handle.style.width = '100px'; // Largeur fixe
    //                 handle.style.height = '10px';
    //                 handle.style.cursor = 'ns-resize';
    //                 break;
    //             case 'ne': // Nord-Est (haut droite)
    //                 handle.style.width = '20px';
    //                 handle.style.height = '20px';
    //                 handle.style.cursor = 'nesw-resize';
    //                 handle.style.backgroundColor = 'rgba(100, 150, 255, 0.2)';
    //                 break;
    //         }
            
    //         // Configurer les gestionnaires d'événements pour cette poignée
    //         setupResizeHandlers(handle, pos);
            
    //         // Ajouter la poignée au modal
    //         modal.appendChild(handle);
    //     });
        
    //     // Fonction pour mettre à jour la position des poignées
    //     function updateHandlesPosition() {
    //         // Obtenir les dimensions actuelles de la modale par rapport à la fenêtre
    //         const rect = modal.getBoundingClientRect();
            
    //         // Mettre à jour la position de chaque poignée
    //         modal.querySelectorAll('.resize-handle').forEach(handle => {
    //             const pos = handle.className.replace('resize-handle resize-', '');
                
    //             switch(pos) {
    //                 case 'e':
    //                     handle.style.top = (rect.top + rect.height/2 - handle.offsetHeight/2) + 'px';
    //                     handle.style.left = (rect.right - 5) + 'px';
    //                     break;
    //                 case 'se':
    //                     handle.style.top = (rect.bottom - handle.offsetHeight) + 'px';
    //                     handle.style.left = (rect.right - handle.offsetWidth) + 'px';
    //                     // handle.style.top = (rect.bottom + 2) + 'px';
    //                     // handle.style.left = (rect.right + 2) + 'px';
    //                     break;
    //                 case 's':
    //                     handle.style.top = (rect.bottom - 5) + 'px';
    //                     handle.style.left = (rect.left + rect.width/2 - handle.offsetWidth/2) + 'px';
    //                     break;
    //                 case 'sw':
    //                     handle.style.top = (rect.bottom - handle.offsetHeight) + 'px';
    //                     handle.style.left = rect.left + 'px';
    //                     break;
    //                 case 'w':
    //                     handle.style.top = (rect.top + rect.height/2 - handle.offsetHeight/2) + 'px';
    //                     handle.style.left = (rect.left - 5) + 'px';
    //                     break;
    //                 case 'nw':
    //                     handle.style.top = rect.top + 'px';
    //                     handle.style.left = rect.left + 'px';
    //                     break;
    //                 case 'n':
    //                     handle.style.top = (rect.top - 5) + 'px';
    //                     handle.style.left = (rect.left + rect.width/2 - handle.offsetWidth/2) + 'px';
    //                     break;
    //                 case 'ne':
    //                     handle.style.top = rect.top + 'px';
    //                     handle.style.left = (rect.right - handle.offsetWidth) + 'px';
    //                     break;
    //             }
    //         });
    //     }
        
    //     // Ajouter des écouteurs d'événements pour mettre à jour la position des poignées
    //     window.addEventListener('scroll', updateHandlesPosition);
    //     document.addEventListener('scroll', updateHandlesPosition, true);
    //     window.addEventListener('resize', updateHandlesPosition);
    //     modal.addEventListener('scroll', updateHandlesPosition);
        
    //     // Mettre à jour initialement
    //     updateHandlesPosition();
        
    //     // // Mettre à jour périodiquement
    //     // const positionInterval = setInterval(updateHandlesPosition, 100);
        
    //     // // Stocker les références pour le nettoyage
    //     // modal._handlesUpdateFn = updateHandlesPosition;
    //     // modal._handlesInterval = positionInterval;


    //     // Utiliser requestAnimationFrame pour une mise à jour plus fluide
    //     let animationFrameId = null;
    //     function updateOnAnimation() {
    //         updateHandlesPosition();
    //         animationFrameId = requestAnimationFrame(updateOnAnimation);
    //     }
    //     animationFrameId = requestAnimationFrame(updateOnAnimation);

    //     // Stocker l'ID pour le nettoyage
    //     modal._animationFrameId = animationFrameId;

    // }




    function createResizeHandles() {
        // Supprimer les anciennes poignées
        modal.querySelectorAll('.resize-handle').forEach(h => h.remove());
        
        // Positions des poignées
        const positions = ['e', 'se', 's', 'sw', 'w', 'nw', 'n', 'ne'];
        
        positions.forEach(pos => {
            const handle = document.createElement('div');
            handle.className = `resize-handle resize-${pos}`;
            handle.style.position = 'fixed'; // Position fixe par rapport à la fenêtre
            handle.style.zIndex = '10001'; // Augmenter le z-index
            
            // Configurer l'apparence de chaque poignée selon sa position
            switch(pos) {
                case 'e':  // Est (droite)
                    handle.style.width = '10px';
                    handle.style.height = '100px'; // Hauteur fixe
                    handle.style.cursor = 'ew-resize';
                    break;
                case 'se': // Sud-Est (bas droite)
                    handle.style.width = '25px';
                    handle.style.height = '25px';
                    handle.style.cursor = 'nwse-resize';
                    handle.style.background = 'linear-gradient(135deg, transparent 70%, rgba(0,0,0,0.5) 30%)';
                    break;
                case 's':  // Sud (bas)
                    handle.style.width = '100px'; // Largeur fixe
                    handle.style.height = '10px';
                    handle.style.cursor = 'ns-resize';
                    break;
                case 'sw': // Sud-Ouest (bas gauche)
                    handle.style.width = '25px';
                    handle.style.height = '25px';
                    handle.style.cursor = 'nesw-resize';
                    handle.style.background = 'linear-gradient(-135deg, transparent 70%, rgba(0,0,0,0.5) 30%)';
                    break;
                case 'w':  // Ouest (gauche)
                    handle.style.width = '10px';
                    handle.style.height = '100px'; // Hauteur fixe
                    handle.style.cursor = 'ew-resize';
                    break;
                case 'nw': // Nord-Ouest (haut gauche)
                    handle.style.width = '25px';
                    handle.style.height = '25px';
                    handle.style.cursor = 'nwse-resize';
                    handle.style.background = 'linear-gradient(-45deg, transparent 70%, rgba(0,0,0,0.5) 30%)';
                    break;
                case 'n':  // Nord (haut)
                    handle.style.width = '100px'; // Largeur fixe
                    handle.style.height = '10px';
                    handle.style.cursor = 'ns-resize';
                    break;
                case 'ne': // Nord-Est (haut droite)
                    handle.style.width = '25px';
                    handle.style.height = '25px';
                    handle.style.cursor = 'nesw-resize';
                    handle.style.background = 'linear-gradient(45deg, transparent 70%, rgba(0,0,0,0.5) 30%)';
                    break;
            }
            
            // Configurer les gestionnaires d'événements pour cette poignée
            setupResizeHandlers(handle, pos);
            
            // Ajouter la poignée au modal
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
        window.addEventListener('resize', updateHandlesPosition);
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
            const minWidth = 300;
            const minHeight = 200;
            
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
        }
        
        // Arrêter le redimensionnement
        function onResizeEnd() {
            isResizing = false;
            document.removeEventListener('mousemove', onResizeMove);
            document.removeEventListener('touchmove', onResizeTouchMove);
            document.removeEventListener('mouseup', onResizeEnd);
            document.removeEventListener('touchend', onResizeEnd);
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
        
        // if (modal._handlesInterval) {
        //     clearInterval(modal._handlesInterval);
        // }
        
        if (modal._animationFrameId) {
            cancelAnimationFrame(modal._animationFrameId);
        }



        modal.querySelectorAll('.resize-handle').forEach(h => {
            if (h.parentNode) h.parentNode.removeChild(h);
        });
    };
    
}

