import {state, positionFormContainer} from './main.js';


export function browserBarPuzzle() {
    if (state.isMobile && state.isTouchDevice && !state.isPWA) {
    // if (true) {
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'auto' });
        }, 200); // Petit délai pour s'assurer que tout est prêt
            
        console.log("\n\n 🚀  ***** debug :  appel de PuzzleSwipe:  state.isTouchDevice, state.isMobile, state.isIOS, state.isPWA ",  state.isTouchDevice, state.isMobile, state.isIOS, state.isPWA , 'state.heightDifferenceAtInit=',state.heightDifferenceAtInit, window.screen.height - window.innerHeight, " \n\n ");

        // 👉 activer le puzzle pour faire disparaitre la barre du navigateur
        if (state.firstTimePuzzle) {
            state.firstTimePuzzle = false;
            state.isPuzzleSwipe = true;
        } else {
            state.isPuzzleSwipe = !state.isPuzzleSwipe;
        }

        const browserBarButton = document.getElementById('browserBar-button');
        const browserBarLabel = document.getElementById('browserBarLabel');
        
        if (browserBarButton) {
            const span = browserBarButton.querySelector('span');
            if (span) {
                span.textContent = (!state.isPuzzleSwipe) ? '💻' : '↩️';
            }
            browserBarLabel.dataset.textKey = (!state.isPuzzleSwipe) ? 'hideBrowserBarLabel' : 'showBrowserBarLabel';
            window.i18n.updateUI();
        }

        if (state.isPuzzleSwipe) {
            import('./puzzleSwipe.js')
                .then(() => console.log("PuzzleSwipe chargé"))
                .catch(err => console.error(err));
            initializePuzzleSwipe();

            setTimeout(() => {
                positionFormContainer();
            }, 200); // Petit délai pour s'assurer que tout est prêt

            // setTimeout(() => {
            if (state.isPuzzleSwipe) { resetPuzzle(); }
            // }, 200); // Petit délai pour s'assurer que tout est prê
        } else {
            const slot = document.getElementById('puzzleSlot'); slot.remove();
            const piece = document.getElementById('puzzlePiece'); piece.remove();
            const message = document.getElementById('puzzleMessage'); message.remove();
            setTimeout(() => {
                positionFormContainer();
            }, 200); // Petit délai pour s'assurer que tout est prêt

        }


    } else {
        // 👉 ignorer le puzzle : inutile car la barre du navigateur est déjà cachée en PWA, et sur PC c'est inutile car l'écran est grand
        state.isPuzzleSwipe = false;
        setTimeout(() => {
            positionFormContainer();
        }, 200); // Petit délai pour s'assurer que tout est prêt       
    }

}



export function initializePuzzleSwipe() {
    // --- Styles ---
    const style = document.createElement('style');
    style.textContent = `
    body {
        margin: 0;
        font-family: Arial;
        min-height: 120vh;
        // background: linear-gradient(to bottom, #87ceeb, #f0e68c);
        overflow-x: hidden;
    }
    #puzzleSlot {
        font-size: 50px; /* taille du slot */
        position: fixed; left: 50%;
        transform: translateX(-50%) rotate(45deg);
        color: rgba(255,255,255,0.3);
        z-index: 0;
    }
    #puzzlePiece {
        font-size: 50px;
        position: fixed;
        left: 50%;
        transform: translateX(-50%) rotate(45deg);
        /* touch-action: none; */
        pointer-events: none;
        cursor: grab;
        z-index: 1;
        text-shadow: 2px 2px 5px rgba(0,0,0,0.5);
    }

    @keyframes puzzle-glow {
        0%, 100% {
        text-shadow: 0 0 2px rgba(255, 255, 150, 0.2);
        filter: brightness(1);
        }
        50% {
        text-shadow: 0 0 2px rgba(255, 255, 120, 0.8);
        filter: brightness(1.3);
        }
    }
    #piece.dragging {
        cursor: grabbing;
        text-shadow: 3px 3px 8px rgba(0,0,0,0.7);
    }
    #puzzleMessage {
        position: fixed; 
        font-size: 16px; color: #fff;
        text-align: center;
        text-shadow: 1px 1px 2px #000;
        z-index: 0;
    }
    .confetti {
        position: fixed; width: 10px; height: 10px;
        top: 0; pointer-events: none; opacity: 0.8;
        border-radius: 50%;
        animation: fall 1.2s linear forwards;
    }
    @keyframes fall {
        0% { transform: translateY(0) rotate(0deg); }
        100% { transform: translateY(500px) rotate(360deg); opacity: 0; }
    }
    `;
    document.head.appendChild(style);

    // --- Éléments ---
    const slot = document.createElement('div');
    slot.id = 'puzzleSlot';
    slot.style.opacity = "1.0";
    slot.style.background = "transparent";   // fond transparent autour
    slot.textContent = "🧩";
    slot.style.textShadow = '0 0 1px rgba(255, 255, 2555, 1)';
    slot.style.filter =  'brightness(5.0)';
    slot.style.top = '50px';

    document.body.appendChild(slot);

    const slotInitialTop = 50;

    const piece = document.createElement('div');
    piece.id = 'puzzlePiece';
    piece.textContent = "🧩"; // pièce à déplacer
    piece.style.animation = 'puzzle-glow 3s ease-in-out infinite';

    document.body.appendChild(piece);

    piece.style.top = '120px';

    const message = document.createElement('div');
    message.id = 'puzzleMessage';
    message.dataset.textKey = 'puzzleMessage';
    // message.textContent = "optionnel:\nglissez la pièce vers le haut pour cacher la barre du navigateur !";

    message.style.whiteSpace = 'pre-line';
    message.style.marginLeft = '0px';
    message.style.zIndex = 1;
    document.body.appendChild(message);

    window.i18n.updateUI();

    // const audio = document.createElement('audio');
    // audio.src = "https://www.soundjay.com/buttons/sounds/button-3.mp3";
    // audio.preload = "auto";
    // document.body.appendChild(audio);

    // --- Confettis ---
    function spawnConfetti() {
        for (let i = 0; i < 30; i++) {
            const conf = document.createElement('div');
            conf.className = 'confetti';
            conf.style.left = (Math.random() * 90 + 5) + '%';
            conf.style.backgroundColor = `hsl(${Math.random() * 360},80%,60%)`;
            const size = 5 + Math.random() * 8;
            conf.style.width = conf.style.height = size + 'px';
            conf.style.animationDuration = (0.8 + Math.random() * 0.5) + 's';
            document.body.appendChild(conf);
            setTimeout(() => conf.remove(), 1500);
        }
    }

    // --- Drag & Drop + Scroll réel ---
    // handlers à remplacer
    let isDragging = false;
    let touchStartY = 0;
    let pieceStartTop = 0;

    piece.addEventListener('touchstart', e => {
        isDragging = true;
        // position initiale de la pièce (viewport coords)
        pieceStartTop = piece.getBoundingClientRect().top;
        touchStartY = e.touches[0].clientY;
        piece.classList.add('dragging');
    }, { passive: true });

    piece.addEventListener('touchmove', e => {
        if (!isDragging) return;

        // Empêcher le comportement natif de scroll sur certains appareils
        e.preventDefault();

        const touchY = e.touches[0].clientY;
        const deltaY = touchStartY - touchY; // >0 quand on glisse vers le haut

        // Déplacer la pièce pour qu'elle suive le doigt (viewport coords)
        const newTop = pieceStartTop - deltaY;
        // piece.style.top = `${newTop}px`;
        slot.style.top = `${newTop}px`;

        // Faire scroller la page en parallèle (scroll réel)
        // on scrolle d'une fraction du delta si tu veux adoucir, sinon delta
        window.scrollBy({ top: deltaY, behavior: 'auto' });

        // IMPORTANT : ne pas toucher slot.style.top -> le slot reste fixe
        return false;
    }, { passive: false });

    piece.addEventListener('touchend', e => {
        isDragging = false;
        piece.classList.remove('dragging');
        checkPieceInSlot() ;
    });

    window.addEventListener('scroll', () => {
        slot.style.top = `${slotInitialTop + window.scrollY * 1.2}px`;
        checkPieceInSlot() ;
    });

    // Vérifie si la pièce touche le slot
    function checkPieceInSlot() {

        if (!state.resetPuzzle) {

            // const pieceRect = piece.getBoundingClientRect();
            // const slotRect  = slot.getBoundingClientRect();

            // // Vérifie chevauchement horizontal et vertical
            // const inSlot = (
            //     pieceRect.top + pieceRect.height/8 > slotRect.top &&
            //     pieceRect.bottom - pieceRect.height/8 < slotRect.bottom &&
            //     pieceRect.left + pieceRect.width/8 > slotRect.left &&
            //     pieceRect.right - pieceRect.width/8 < slotRect.right
            // );

            // if (inSlot) {
            const isAddressBarVisible = (state.heightDifferenceAtInit -  (window.screen.height - window.innerHeight) <= 50);

            if (!isAddressBarVisible) {
                message.dataset.textKey = 'bravoPuzzleMessage';
                spawnConfetti();
                // audio.play().catch(()=>{});
                if (navigator.vibrate) navigator.vibrate([100,50,100]);
                slot.style.visibility = 'hidden';
                piece.style.visibility = 'hidden'
            } else {
                message.dataset.textKey = 'higherPuzzleMessage';
                slot.style.visibility = 'visible';
                piece.style.visibility = 'visible';                
            }
            // console.log('\n\n **** debug in checkPieceInSlot touchStartY , pieceStartTop, isDragging, pieceRect, slotRect', touchStartY , pieceStartTop , isDragging, window.screen.height, window.innerHeight,' \n\n\n')
            window.i18n.updateUI();
            state.isbrowserBarHidden = (!isAddressBarVisible);
        }
        state.resetPuzzle = false;
        // state.isbrowserBarHidden = (!isAddressBarVisible);
    }
}

export function resetPuzzle() {
    const slot = document.getElementById('puzzleSlot'); 
    const piece = document.getElementById('puzzlePiece'); 
    const message = document.getElementById('puzzleMessage');

    // const isAddressBarVisible = (window.screen.height > (window.innerHeight + 40));
    const isAddressBarVisible = (state.heightDifferenceAtInit -  (window.screen.height - window.innerHeight) <= 50);
    if (!isAddressBarVisible) {
        message.dataset.textKey = '';
        // message.textContent = `la barre est cachée !!!  ${window.screen.height - window.innerHeight}`;
        message.dataset.textKey = 'bravoPuzzleMessage';
        slot.style.visibility = 'hidden';
        piece.style.visibility = 'hidden'
    } else {
        message.dataset.textKey = 'puzzleMessage';       
        slot.style.visibility = 'visible';
        piece.style.visibility = 'visible';   
    }

    window.i18n.updateUI();
    console.log('\n\n **** debug in resetPuzzle \n\n\n')
    state.resetPuzzle = true;
    state.isbrowserBarHidden = (!isAddressBarVisible);
}
