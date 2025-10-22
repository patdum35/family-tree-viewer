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




//     if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
//         console.log("Mode sombre activé par votre browser Web!");
//         message.style.top = '200px';    
//         message.textContent = "Mode sombre activé par votre browser Web!";
//         // afficher ton message d'avertissement
//     }



//     // créer un div invisible avec couleur connue
//     const testDiv = document.createElement('div');
//     testDiv.style.color = '#ffffff';
//     testDiv.style.display = 'none';
//     document.body.appendChild(testDiv);

//     // lire la couleur calculée
//     const computedColor = getComputedStyle(testDiv).color;
//     document.body.removeChild(testDiv);

//     if (computedColor !== 'rgb(255, 255, 255)') {
//         console.log("Couleurs transformées, probablement mode sombre forcé !");

//         message.style.top = '150px';    
//         message.textContent = "Couleurs transformées, probablement mode sombre forcé par votre browser Web!";
//         // avertir l'utilisateur
//     }

//     function detectSamsungDarkMode(callback) {
//         // if (/Samsung/i.test(navigator.userAgent) && window.matchMedia) {
//             // Crée une image SVG blanche de 1x1 px
//             const img = new Image();
//             img.onload = function() {
//             const ctx = document.createElement('canvas').getContext('2d');
//             ctx.drawImage(img, 0, 0);
//             const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
//             if (r < 255 || g < 255 || b < 255) {
//                 // Le navigateur a transformé la couleur → mode sombre forcé
//                 callback();
//             }
//             };
//             img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IndoaXRlIi8+PC9zdmc+';
//         // }
//         console.log('\n\n **** debug dark 2 ')
//     }



//     detectSamsungDarkMode(() => {
//         console.log('\n\n **** debug dark 1 ')
//         alert("Attention detectSamsungDarkMode : votre navigateur force le mode sombre. Pour un affichage correct, activez le mode clair ou utilisez Chrome.");
        
//         // Ou mieux, affiche un bandeau sur la page
//         const banner = document.createElement('div');
//         banner.textContent = "Votre navigateur force le mode sombre. Pour un rendu correct, utilisez Chrome ou désactivez 'Use website dark theme'.";
//         banner.style.cssText = "position:fixed;top:0;left:0;width:100%;background:#ffcc00;color:#000;padding:10px;text-align:center;z-index:10000;";
//         document.body.appendChild(banner);
//     });



//     function detectWhiteRendering(callback) {
//         // Créer un canvas et obtenir son contexte
//         const canvas = document.createElement('canvas');
//         const ctx = canvas.getContext('2d');

//         // Définir les dimensions du canvas
//         canvas.width = 1;
//         canvas.height = 1;

//         // Remplir le canvas avec une couleur blanche
//         ctx.fillStyle = '#ffffff';
//         ctx.fillRect(0, 0, 1, 1);

//         // Obtenir les données du pixel
//         const pixel = ctx.getImageData(0, 0, 1, 1).data;

//         // Vérifier si la couleur est blanche
//         if (pixel[0] !== 255 || pixel[1] !== 255 || pixel[2] !== 255) {
//             callback();
//         }

//                 console.log('\n\n **** debug dark 4 ')
//     }

//     detectWhiteRendering(() => {
//         console.log('\n\n **** debug dark 3 ')
//         alert("Attention detectWhiteRendering : votre navigateur force le mode sombre. Pour un affichage correct, activez le mode clair ou utilisez Chrome.");
        
//         // Ou mieux, affiche un bandeau sur la page
//         const banner = document.createElement('div');
//         banner.textContent = "Votre navigateur force le mode sombre. Pour un rendu correct, utilisez Chrome ou désactivez 'Use website dark theme'.";
//         banner.style.cssText = "position:fixed;top:0;left:0;width:100%;background:#ffcc00;color:#000;padding:10px;text-align:center;z-index:10000;";
//         document.body.appendChild(banner);
//     });





//     // async function getActualPixelColor(x, y) {
//     //     // 1. Capturer l'écran
//     //     try {
//     //         const stream = await navigator.mediaDevices.getDisplayMedia({
//     //             video: { 
//     //                 cursor: "never",
//     //                 displaySurface: "browser"
//     //             },
//     //             audio: false
//     //         });
            
//     //         const video = document.createElement('video');
//     //         video.srcObject = stream;
//     //         await video.play();
            
//     //         // 2. Créer un canvas pour analyser l'image
//     //         const canvas = document.createElement('canvas');
//     //         const ctx = canvas.getContext('2d');
            
//     //         canvas.width = video.videoWidth;
//     //         canvas.height = video.videoHeight;
            
//     //         // 3. Dessiner l'image capturée
//     //         ctx.drawImage(video, 0, 0);
            
//     //         // 4. Lire le pixel
//     //         const imageData = ctx.getImageData(x, y, 1, 1);
//     //         const pixel = imageData.data;
            
//     //         // 5. Arrêter le stream
//     //         stream.getTracks().forEach(track => track.stop());
            
//     //         return {
//     //             r: pixel[0],
//     //             g: pixel[1],
//     //             b: pixel[2],
//     //             a: pixel[3],
//     //             hex: `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1)}`,
//     //             rgba: `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3] / 255})`
//     //         };
            
//     //     } catch (error) {
//     //         console.error('Erreur de capture:', error);
//     //         return null;
//     //     }
//     // }

//     // // Utilisation
//     // getActualPixelColor(100, 150).then(color => {
//     //     console.log('Couleur réelle:', color);
//     // });







//     // function getElementActualColor(element, relativeX = 0, relativeY = 0) {
//     //     // const rect = element.getBoundingClientRect();

//     //     const rect = piece.getBoundingClientRect();
//     //     // const slotRect  = slot.getBoundingClientRect();


        
//     //     // Créer un canvas de la taille de l'élément
//     //     const canvas = document.createElement('canvas');
//     //     const ctx = canvas.getContext('2d');
        
//     //     canvas.width = rect.width;
//     //     canvas.height = rect.height;
        
//     //     // Récupérer le style calculé
//     //     const computedStyle = window.getComputedStyle(element);
        
//     //     // Dessiner l'arrière-plan
//     //     if (computedStyle.backgroundColor && computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') {
//     //         ctx.fillStyle = computedStyle.backgroundColor;
//     //         ctx.fillRect(0, 0, rect.width, rect.height);
//     //     }
        
//     //     // Si c'est un élément avec du texte
//     //     if (element.textContent && element.textContent.trim() !== '') {
//     //         ctx.fillStyle = computedStyle.color;
//     //         ctx.font = computedStyle.font;
//     //         ctx.textBaseline = 'top';
            
//     //         // Essayer de positionner le texte approximativement
//     //         const fontSize = parseInt(computedStyle.fontSize) || 16;
//     //         ctx.fillText(element.textContent, 0, fontSize);
//     //     }
        
//     //     // Si c'est une image
//     //     if (element.tagName === 'IMG' && element.complete) {
//     //         try {
//     //             ctx.drawImage(element, 0, 0, rect.width, rect.height);
//     //         } catch (e) {
//     //             console.warn('Impossible de dessiner l\'image:', e);
//     //         }
//     //     }
        
//     //     // Lire le pixel
//     //     const imageData = ctx.getImageData(relativeX, relativeY, 1, 1);
//     //     const pixel = imageData.data;
        
//     //     return {
//     //         r: pixel[0],
//     //         g: pixel[1],
//     //         b: pixel[2],
//     //         a: pixel[3],
//     //         hex: `#${pixel[0].toString(16).padStart(2, '0')}${pixel[1].toString(16).padStart(2, '0')}${pixel[2].toString(16).padStart(2, '0')}`,
//     //         rgba: `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3] / 255})`
//     //     };
//     // }




//     // // Lire la couleur de fond d'un élément
//     // const element = slot; //document.getElementById('input-form-firstName');
//     // const color = getElementActualColor(element, 10, 10);
//     // console.log('Couleur au point (10,10):', color);
    
//     // // Lire la couleur du texte
//     // const textColor = getElementActualColor(element, 5, 15);
//     // console.log('Couleur du texte:', textColor);
    
//     // // Lire une couleur d'un dégradé
//     // const gradientElement = document.querySelector('.test-div');
//     // const gradientColor1 = getElementActualColor(gradientElement, 10, 10);
//     // const gradientColor2 = getElementActualColor(gradientElement, 250, 10);
//     // console.log('Début du dégradé:', gradientColor1);
//     // console.log('Fin du dégradé:', gradientColor2);



//     // window.tesCounter = 0;

//     // // Fonction pour créer un élément carré blanc
//     // function createTestSquare() {
//     //     const square = document.createElement('div');
//     //     square.id = 'testSquare';
//     //     square.style.width = '100px';
//     //     square.style.height = '100px';
//     //     square.style.backgroundColor = 'white';
//     //     square.style.border = '2px solid #333';
//     //     square.style.margin = '20px';
//     //     square.style.display = 'flex';
//     //     square.style.alignItems = 'center';
//     //     square.style.justifyContent = 'center';
//     //     square.style.color = 'black';
//     //     square.style.fontWeight = 'bold';
//     //     square.textContent = 'Test';
//     //     square.style.top = '200px';
//     //     square.style.top = '200px';
//     //     square.style.position = 'fixed';
        
//     //     document.body.appendChild(square);
//     //     console.log('✅ Carré blanc créé avec succès!');
//     //     return square;
//     // }

//     // // Fonction pour lire la couleur (version sécurisée)
//     // function getElementActualColor(element, relativeX = 0, relativeY = 0) {
//     //     // Vérification de sécurité
//     //     if (!element || !(element instanceof Element)) {
//     //         console.error('❌ Element invalide:', element);
//     //         return null;
//     //     }
        
//     //     try {
//     //         const rect = element.getBoundingClientRect();
//     //         console.log('📏 Dimensions de l\'élément:', rect.width, 'x', rect.height);
            
//     //         // Vérifier si l'élément est visible
//     //         if (rect.width === 0 || rect.height === 0) {
//     //             console.error('❌ Element invisible ou taille nulle');
//     //             return null;
//     //         }
            
//     //         const canvas = document.createElement('canvas');
//     //         const ctx = canvas.getContext('2d');
            
//     //         canvas.width = Math.max(1, rect.width);
//     //         canvas.height = Math.max(1, rect.height);
            
//     //         // Récupérer le style calculé
//     //         const computedStyle = window.getComputedStyle(element);
//     //         console.log('🎨 Couleur de fond calculée:', computedStyle.backgroundColor);
            
//     //         // Dessiner l'arrière-plan
//     //         if (computedStyle.backgroundColor && computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') {
//     //             ctx.fillStyle = computedStyle.backgroundColor;
//     //             ctx.fillRect(0, 0, canvas.width, canvas.height);
//     //         }
            
//     //         // Dessiner le texte si présent
//     //         if (element.textContent && element.textContent.trim() !== '') {
//     //             ctx.fillStyle = computedStyle.color;
//     //             ctx.font = computedStyle.font;
//     //             ctx.textBaseline = 'top';
//     //             ctx.fillText(element.textContent, 10, 10);
//     //         }
            
//     //         // S'assurer que les coordonnées sont dans les limites
//     //         const safeX = Math.max(0, Math.min(relativeX, canvas.width - 1));
//     //         const safeY = Math.max(0, Math.min(relativeY, canvas.height - 1));
            
//     //         console.log('📍 Lecture du pixel aux coordonnées:', safeX, safeY);
            
//     //         const imageData = ctx.getImageData(safeX, safeY, 1, 1);
//     //         const pixel = imageData.data;
            
//     //         const result = {
//     //             r: pixel[0],
//     //             g: pixel[1],
//     //             b: pixel[2],
//     //             a: pixel[3],
//     //             hex: `#${pixel[0].toString(16).padStart(2, '0')}${pixel[1].toString(16).padStart(2, '0')}${pixel[2].toString(16).padStart(2, '0')}`,
//     //             rgba: `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3] / 255})`
//     //         };
            
//     //         console.log('🎯 Couleur lue:', result);
//     //         return result;
            
//     //     } catch (error) {
//     //         console.error('❌ Erreur dans getElementActualColor:', error);
//     //         return null;
//     //     }
//     // }

//     // Fonction de test complète
//     // function testColorReading() {











// // Fonction pour capturer la couleur RÉELLE d'un pixel à l'écran
// async function getRealPixelColor(x, y) {
//     try {
//         // 1. Capturer l'écran (demande la permission à l'utilisateur)
//         const stream = await navigator.mediaDevices.getDisplayMedia({
//             video: { 
//                 cursor: "never",
//                 displaySurface: "browser"
//             },
//             audio: false
//         });
        
//         // 2. Créer un élément video pour afficher la capture
//         const video = document.createElement('video');
//         video.srcObject = stream;
        
//         // Attendre que la vidéo soit prête
//         await new Promise((resolve) => {
//             video.onloadedmetadata = () => {
//                 video.play();
//                 resolve();
//             };
//         });
        
//         // 3. Créer un canvas pour analyser l'image
//         const canvas = document.createElement('canvas');
//         const ctx = canvas.getContext('2d');
        
//         canvas.width = video.videoWidth;
//         canvas.height = video.videoHeight;
        
//         // Attendre un peu que l'image soit stable
//         await new Promise(resolve => setTimeout(resolve, 100));
        
//         // 4. Dessiner l'image capturée (qui inclut le mode sombre)
//         ctx.drawImage(video, 0, 0);
        
//         // 5. Lire le pixel exact
//         const imageData = ctx.getImageData(x, y, 1, 1);
//         const pixel = imageData.data;
        
//         // 6. Arrêter le stream
//         stream.getTracks().forEach(track => track.stop());
        
//         const result = {
//             r: pixel[0],
//             g: pixel[1],
//             b: pixel[2],
//             a: pixel[3],
//             hex: `#${pixel[0].toString(16).padStart(2, '0')}${pixel[1].toString(16).padStart(2, '0')}${pixel[2].toString(16).padStart(2, '0')}`,
//             rgba: `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3] / 255})`
//         };
        
//         console.log('🎯 Couleur RÉELLE lue:', result);
//         return result;
        
//     } catch (error) {
//         console.error('❌ Erreur de capture:', error);
//         return null;
//     }
// }

// // Fonction de test avec un carré blanc
// function createTestSquare() {
//     const square = document.createElement('div');
//     square.id = 'testSquare';
//     square.style.width = '100px';
//     square.style.height = '100px';
//     square.style.backgroundColor = 'white';
//     square.style.border = '2px solid #333';
//     square.style.margin = '20px';
//     square.style.position = 'fixed';
//     square.style.top = '100px';
//     square.style.left = '100px';
//     square.style.zIndex = '10000';
//     square.textContent = 'TEST';
//     square.style.display = 'flex';
//     square.style.alignItems = 'center';
//     square.style.justifyContent = 'center';
//     square.style.color = 'black';
//     square.style.fontWeight = 'bold';
//     square.style.top = '200px';
//     square.style.position = 'fixed';

//     document.body.appendChild(square);
//     console.log('✅ Carré blanc créé en position (100px, 100px)');
//     return square;
// }



//     window.tesCounter = 0;
// // Test complet
// // async function testRealColorReading() {

// if (window.tesCounter === 0) {
//     console.log('🚀 Test de lecture de couleur RÉELLE...');
    
//     // Créer le carré à une position connue
//     const square = createTestSquare();
//     const rect = square.getBoundingClientRect();
    
//     // Coordonnées du centre du carré (relatives à l'écran)
//     const centerX = Math.floor(rect.left + rect.width / 2);
//     const centerY = Math.floor(rect.top + rect.height / 2);
    
//     console.log(`📍 Lecture au centre du carré: (${centerX}, ${centerY})`);
    
//     // Lire la couleur RÉELLE (avec capture d'écran)
//     const realColor = getRealPixelColor(centerX, centerY);


    
//     if (realColor) {
//         console.log('--- RÉSULTAT FINAL ---');
//         console.log('Couleur CSS définie: white (#FFFFFF)');
//         console.log('Couleur RÉELLE affichée:', realColor.hex);
        
//         // Vérifier la couleur réelle
//         const banner = document.createElement('div');
//         if (realColor.r > 240 && realColor.g > 240 && realColor.b > 240) {
//             console.log('🎉 VRAI BLANC: Le carré est affiché en blanc (pas de mode sombre)');
//             banner.textContent = `🎉 RAI BLANC: Le carré est affiché en blanc (pas de mode sombre) (RGB: ${realColor.r}, ${realColor.g}, ${realColor.b})`;
//             banner.style.cssText = "position:fixed;top:340px;left:100px;width:50%;background:#ffcc00;color:#000;padding:10px;text-align:center;z-index:10000;";

//         } else if (realColor.r < 50 && realColor.g < 50 && realColor.b < 50) {
//             console.log('🌙 MODE SOMBRE: Le carré est affiché en noir (transformé par le mode sombre)');
//             banner.textContent = `🌙 MODE SOMBRE: Le carré est affiché en noir (transformé par le mode sombre) (RGB: ${realColor.r}, ${realColor.g}, ${realColor.b})`;
//             banner.style.cssText = "position:fixed;top:340px;left:100px;width:50%;background:#ffcc00;color:#000;padding:10px;text-align:center;z-index:10000;";
//         } else {
//             console.log('🌈 AUTRE COULEUR: Le carré a une couleur différente');
//             banner.textContent = `🌈 AUTRE COULEUR: Le carré a une couleur différente. (RGB: ${realColor.r}, ${realColor.g}, ${realColor.b})`;
//             banner.style.cssText = "position:fixed;top:340px;left:100px;width:50%;background:#ffcc00;color:#000;padding:10px;text-align:center;z-index:10000;";
//         }


//     }
    
//     // return realColor;
// }

// // Utilisation
// console.log('💡 Appelez testRealColorReading() pour lancer le test');



















//     // if (window.tesCounter === 0) {
//     //     console.log('🚀 Début du test de lecture de couleur...');
        
//     //     // Créer le carré de test
//     //     const testSquare = createTestSquare();
        
//     //     // Attendre que l'élément soit rendu
//     //     setTimeout(() => {
//     //         console.log('🔍 Lecture de la couleur du carré...');
            
//     //         // Tester plusieurs points
//     //         const points = [
//     //             { x: 10, y: 10, description: 'Coin supérieur gauche' },
//     //             { x: 50, y: 50, description: 'Centre' },
//     //             { x: 90, y: 90, description: 'Coin inférieur droit' }
//     //         ];
            
//     //         points.forEach(point => {
//     //             console.log(`\n📌 Test ${point.description}:`);
//     //             const color = getElementActualColor(testSquare, point.x, point.y);
                
//     //             if (color) {
//     //                 console.log(`✅ ${point.description}: ${color.hex} (RGB: ${color.r}, ${color.g}, ${color.b})`);
                    
//     //                 // Vérifier si c'est bien du blanc (ou presque)
//     //                 if (color.r > 240 && color.g > 240 && color.b > 240) {
//     //                     console.log('🎉 SUCCÈS: Couleur blanche détectée!');
//     //                     // alert("🎉 SUCCÈS: Couleur blanche détectée!");
                        
//     //                     // Ou mieux, affiche un bandeau sur la page
//     //                     const banner = document.createElement('div');
//     //                     banner.textContent = `🎉 SUCCÈS: Couleur blanche détectée!. (RGB: ${color.r}, ${color.g}, ${color.b})`;
//     //                     banner.style.cssText = "position:fixed;top:340px;left:100px;width:50%;background:#ffcc00;color:#000;padding:10px;text-align:center;z-index:10000;";
//     //                     document.body.appendChild(banner);


//     //                 } else {
//     //                     console.log('⚠️ ATTENTION: La couleur n\'est pas blanche pure');
//     //                     // alert("⚠️ ATTENTION: La couleur n\'est pas blanche pure'");
                        
//     //                     // Ou mieux, affiche un bandeau sur la page
//     //                     const banner = document.createElement('div');
//     //                     banner.textContent = `⚠️ ATTENTION: La couleur n\'est pas blanche pure' (RGB: ${color.r}, ${color.g}, ${color.b})`;
//     //                     banner.style.cssText = "position:fixed;top:340px;left:100px;width:50%;background:#ffcc00;color:#000;padding:10px;text-align:center;z-index:10000;";
//     //                     document.body.appendChild(banner);

//     //                 }
//     //             }
//     //         });
            
//     //     }, 100);
//     //     window.tesCounter++;
//     // // }

//     // }
















}

console.log("Puzzle amélioré prêt !");

