let zoom = d3.zoom().scaleExtent([0.1, 3]);
let svg = d3.select("#tree-svg");
let g = svg.append("g");

// async function loadData() {
//     const password = document.getElementById('password').value;
//     if (password !== 'dumenil') {  // À changer
//         alert('Mot de passe incorrect');
//         return;
//     }

//     try {
//         const response = await fetch('arbre.zip');
//         const blob = await response.blob();
//         const zip = await JSZip.loadAsync(blob);
//         const gedcom = await zip.file('arbre.ged').async('text');
        
//         document.getElementById('password-form').style.display = 'none';
//         document.getElementById('tree-container').style.display = 'block';
        
//         displayTree(parseGedcom(gedcom));
//     } catch (error) {
//         console.error('Erreur:', error);
//         alert('Erreur de chargement des données');
//     }
// }


// // Dans tree-viewer.js, modifiez loadData() :
// async function loadData() {
//     const password = document.getElementById('password').value;
    
//     try {
//         console.log("Chargement du fichier");
//         const response = await fetch('arbre.enc');
//         const encryptedText = await response.text();
//         console.log("Contenu reçu:", encryptedText.substring(0, 100));

//         const wordArray = CryptoJS.enc.Base64.parse(encryptedText);
//         console.log("WordArray créé");

//         const decrypted = CryptoJS.AES.decrypt(wordArray, password);
//         console.log("Décryptage effectué");

//         document.getElementById('password-form').style.display = 'none';
//         document.getElementById('tree-container').style.display = 'block';
        
//         displayTree(parseGedcom(gedcom));
//     } catch (error) {
//         console.error('Erreur:', error);
//         alert('Mot de passe incorrect ou erreur de chargement');
//     }
// }


async function decrypt(encryptedData, key) {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const keyBuffer = new Uint8Array(key);
    
    try {
        const data = base64ToArrayBuffer(encryptedData);
        const cryptoKey = await window.crypto.subtle.importKey(
            "raw",
            keyBuffer,
            "AES-CBC",
            false,
            ["decrypt"]
        );
        
        const decrypted = await window.crypto.subtle.decrypt(
            {
                name: "AES-CBC",
                iv: data.slice(0, 16)
            },
            cryptoKey,
            data.slice(16)
        );
        
        return decoder.decode(decrypted);
    } catch (error) {
        throw new Error('Décryptage échoué');
    }
}

function base64ToArrayBuffer(base64) {
    const binary_string = window.atob(base64);
    const bytes = new Uint8Array(binary_string.length);
    for (let i = 0; i < binary_string.length; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes;
}



async function loadData() {
    const password = document.getElementById('password').value;
    try {
        console.log("Chargement du fichier");
        const response = await fetch('arbre.enc');
        const encryptedData = await response.text();
        console.log("Données reçues:", encryptedData.substring(0, 50));

        // Dérivation de la clé
        const salt = 'salt_';
        const iterations = 100000;
        const keyMaterial = await window.crypto.subtle.importKey(
            "raw",
            new TextEncoder().encode(password),
            { name: "PBKDF2" },
            false,
            ["deriveBits"]
        );
        
        const key = await window.crypto.subtle.deriveBits(
            {
                name: "PBKDF2",
                salt: new TextEncoder().encode(salt),
                iterations: iterations,
                hash: "SHA-256",
            },
            keyMaterial,
            256
        );

        // Décryptage
        const decrypted = await decrypt(encryptedData, key);
        console.log("Décrypté:", decrypted.substring(0, 50));

        displayTree(parseGedcom(decrypted));
        
        document.getElementById('password-form').style.display = 'none';
        document.getElementById('tree-container').style.display = 'block';
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur de décryptage');
    }
}

function parseGedcom(gedcom) {
    // Code de parsing similaire à notre script Python
    // Retourne une structure de données pour D3
}

function displayTree(data) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    const tree = d3.tree().size([height - 100, width - 200]);
    const root = d3.hierarchy(data);
    
    const treeData = tree(root);
    
    // Dessiner les liens
    g.selectAll('.link')
        .data(treeData.links())
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('d', d3.linkHorizontal()
            .x(d => d.y)
            .y(d => d.x));
    
    // Dessiner les nœuds
    const node = g.selectAll('.node')
        .data(treeData.descendants())
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', d => `translate(${d.y},${d.x})`);
    
    node.append('circle')
        .attr('r', 10);
    
    node.append('text')
        .attr('dy', '.35em')
        .attr('x', d => d.children ? -13 : 13)
        .style('text-anchor', d => d.children ? 'end' : 'start')
        .text(d => d.data.name);
        
    svg.call(zoom.on('zoom', event => {
        g.attr('transform', event.transform);
    }));
}

function zoomIn() {
    svg.transition().call(zoom.scaleBy, 1.2);
}

function zoomOut() {
    svg.transition().call(zoom.scaleBy, 0.8);
}