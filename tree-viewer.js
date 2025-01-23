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


// Dans tree-viewer.js, modifiez loadData() :
async function loadData() {
    const password = document.getElementById('password').value;
    
    try {
        // const response = await fetch('arbre.ged');
        const response = await fetch('arbre.enc');  // au lieu de arbre.ged
        const encryptedData = await response.arrayBuffer();
        
        const wordArray = CryptoJS.lib.WordArray.create(encryptedData);
        const decrypted = CryptoJS.AES.decrypt(wordArray, password);
        const gedcom = decrypted.toString(CryptoJS.enc.Utf8);
        
        if (!gedcom) {
            throw new Error('Décryptage échoué');
        }

        document.getElementById('password-form').style.display = 'none';
        document.getElementById('tree-container').style.display = 'block';
        
        displayTree(parseGedcom(gedcom));
    } catch (error) {
        console.error('Erreur:', error);
        alert('Mot de passe incorrect ou erreur de chargement');
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