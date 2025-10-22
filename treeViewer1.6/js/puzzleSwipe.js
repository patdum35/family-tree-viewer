console.log("🚀 puzzleSwipe.js mis à jour");

// --- Styles ---
const style = document.createElement('style');
style.textContent = `
body {
    margin: 0;
    font-family: Arial;
    min-height: 120vh;
    background: linear-gradient(to bottom, #87ceeb, #f0e68c);
    overflow-x: hidden;
}
#puzzleSlot {
    font-size: 50px; /* taille du slot */
    position: fixed; top: 40px; left: 50%;
    transform: translateX(-50%) rotate(45deg);
    color: rgba(255,255,255,0.3);
    z-index: 0;
}
#piece {
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
    position: fixed; bottom: 10px;
    font-size: 18px; color: #fff;
    text-shadow: 1px 1px 2px #000;
    z-index: 10001;
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







// setTimeout(() => {
//     window.scrollTo({ top: window.scrollY + 50, behavior: 'auto' }); 

// },
// 500);

// window.scrollTo({ top: 150, behavior: 'auto' });













// --- Éléments ---
const slot = document.createElement('div');
slot.id = 'puzzleSlot';
slot.style.opacity = "1.0";
slot.style.background = "transparent";   // fond transparent autour
slot.textContent = "🧩";
slot.style.textShadow = '0 0 1px rgba(255, 255, 2555, 1)';
slot.style.filter =  'brightness(5.0)';


document.body.appendChild(slot);


const slotInitialTop = slot.offsetTop;


const piece = document.createElement('div');
piece.id = 'piece';
piece.textContent = "🧩"; // pièce à déplacer
piece.style.animation = 'puzzle-glow 3s ease-in-out infinite';

document.body.appendChild(piece);

// Position initiale du carré orange juste sous le slot
const slotRect = slot.getBoundingClientRect();
piece.style.top = `${slotRect.bottom -20}px`;

const message = document.createElement('div');
message.id = 'puzzleMessage';
message.textContent = "Glissez la pièce vers le haut pour cacher la barre !";
message.style.marginLeft = '10px';
message.style.zIndex = 1;
document.body.appendChild(message);

const audio = document.createElement('audio');
audio.src = "https://www.soundjay.com/buttons/sounds/button-3.mp3";
audio.preload = "auto";
document.body.appendChild(audio);

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
    const pieceRect = piece.getBoundingClientRect();
    const slotRect  = slot.getBoundingClientRect();

    console.log("Vérification position pièce/slot :", pieceRect, slotRect);

    // Vérifie chevauchement horizontal et vertical
    const inSlot = (
        pieceRect.top + pieceRect.height/8 > slotRect.top &&
        pieceRect.bottom - pieceRect.height/8 < slotRect.bottom &&
        pieceRect.left + pieceRect.width/8 > slotRect.left &&
        pieceRect.right - pieceRect.width/8 < slotRect.right
    );

    if (inSlot) {
        message.textContent = "🎉 Bravo ! La barre devrait disparaître maintenant";
        spawnConfetti();
        audio.play().catch(()=>{});
        if (navigator.vibrate) navigator.vibrate([100,50,100]);
    } else {
        message.textContent = "Glissez plus haut pour cacher la barre";
    }

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        console.log("Mode sombre activé par votre browser Web!");
        message.style.top = '200px';    
        message.textContent = "Mode sombre activé par votre browser Web!";
        // afficher ton message d'avertissement
    }



    // créer un div invisible avec couleur connue
    const testDiv = document.createElement('div');
    testDiv.style.color = '#ffffff';
    testDiv.style.display = 'none';
    document.body.appendChild(testDiv);

    // lire la couleur calculée
    const computedColor = getComputedStyle(testDiv).color;
    document.body.removeChild(testDiv);

    if (computedColor !== 'rgb(255, 255, 255)') {
        console.log("Couleurs transformées, probablement mode sombre forcé !");

        message.style.top = '150px';    
        message.textContent = "Couleurs transformées, probablement mode sombre forcé par votre browser Web!";
        // avertir l'utilisateur
    }

    function detectSamsungDarkMode(callback) {
        // if (/Samsung/i.test(navigator.userAgent) && window.matchMedia) {
            // Crée une image SVG blanche de 1x1 px
            const img = new Image();
            img.onload = function() {
            const ctx = document.createElement('canvas').getContext('2d');
            ctx.drawImage(img, 0, 0);
            const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
            if (r < 255 || g < 255 || b < 255) {
                // Le navigateur a transformé la couleur → mode sombre forcé
                callback();
            }
            };
            img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IndoaXRlIi8+PC9zdmc+';
        // }
        console.log('\n\n **** debug dark 2 ')
    }


    detectSamsungDarkMode(() => {
        console.log('\n\n **** debug dark 1 ')
        alert("Attention detectSamsungDarkMode : votre navigateur force le mode sombre. Pour un affichage correct, activez le mode clair ou utilisez Chrome.");
        
        // Ou mieux, affiche un bandeau sur la page
        const banner = document.createElement('div');
        banner.textContent = "Votre navigateur force le mode sombre. Pour un rendu correct, utilisez Chrome ou désactivez 'Use website dark theme'.";
        banner.style.cssText = "position:fixed;top:0;left:0;width:100%;background:#ffcc00;color:#000;padding:10px;text-align:center;z-index:10000;";
        document.body.appendChild(banner);
    });



    function detectWhiteRendering(callback) {
        // Créer un canvas et obtenir son contexte
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Définir les dimensions du canvas
        canvas.width = 1;
        canvas.height = 1;

        // Remplir le canvas avec une couleur blanche
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 1, 1);

        // Obtenir les données du pixel
        const pixel = ctx.getImageData(0, 0, 1, 1).data;

        // Vérifier si la couleur est blanche
        if (pixel[0] !== 255 || pixel[1] !== 255 || pixel[2] !== 255) {
            callback();
        }

                console.log('\n\n **** debug dark 4 ')
    }

    detectWhiteRendering(() => {
        console.log('\n\n **** debug dark 3 ')
        alert("Attention detectWhiteRendering : votre navigateur force le mode sombre. Pour un affichage correct, activez le mode clair ou utilisez Chrome.");
        
        // Ou mieux, affiche un bandeau sur la page
        const banner = document.createElement('div');
        banner.textContent = "Votre navigateur force le mode sombre. Pour un rendu correct, utilisez Chrome ou désactivez 'Use website dark theme'.";
        banner.style.cssText = "position:fixed;top:0;left:0;width:100%;background:#ffcc00;color:#000;padding:10px;text-align:center;z-index:10000;";
        document.body.appendChild(banner);
    });




}

console.log("Puzzle amélioré prêt !");

