// Configuration globale
const config = {
    boxWidth: 150,
    boxHeight: 40,
    duration: 750,
    nodeSpacing: 1.5,
    levelSpacing: 180
};

let currentTransform = { k: 1, x: 0, y: 0 };
let tooltip = d3.select(".tooltip");
let nombre_prenoms = 2;
let nombre_generation = 6;
let zoom;  // Déclarer zoom comme variable globale
let globalGedcomData = null; // Global variable to store GEDCOM data
let globalRootPersonId = null; // Variable globale pour stocker l'ID de la personne racine
let lastTransform = null; // Variable globale pour stocker la dernière transformation
let boxWidth = 150;


// Générer les options de génération dynamiquement
const select = document.getElementById('generations');
for (let i = 2; i <= 101; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.text = i;
    if (i === 6) option.selected = true;
    select.appendChild(option);
}

// Gestion du redimensionnement
window.addEventListener('resize', _.debounce(() => {
    const svg = d3.select("#tree-svg")
        .attr("width", window.innerWidth)
        .attr("height", window.innerHeight);
}, 250));

// Add event listener to close modal when clicking outside of it
window.addEventListener('click', function(event) {
    const modal = document.getElementById('person-details-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});


// chargement du fichier gedcom
async function loadData() {
    const fileInput = document.getElementById('gedFile');
    const passwordInput = document.getElementById('password');
    
    try {
        let gedcomContent;
        const file = fileInput.files[0];
        
        if ((!passwordInput.value)&&(!file)) {
            alert('Veuillez sélectionner un fichier');
            return;
        }

        const fileReader = new FileReader();
        if ((!passwordInput.value)&&(file)) {

            // Lecture du fichier
            fileReader.readAsText(file);
            
            await new Promise((resolve, reject) => {
                fileReader.onload = resolve;
                fileReader.onerror = reject;
            });

        }

        // Vérifier si c'est un fichier crypté ou non
        if ((passwordInput.value)&&(!file)) {
            // Fichier crypté et compressé
            // const encryptedData = fileReader.result;
            const response = await fetch('arbre.enc');
            const encryptedData = await response.text();

            const decoded = atob(encryptedData);
            const key = passwordInput.value.repeat(decoded.length);
            const decrypted = new Uint8Array(decoded.length);
            
            for(let i = 0; i < decoded.length; i++) {
                decrypted[i] = decoded.charCodeAt(i) ^ key.charCodeAt(i);
            }
            
            const expectedHash = decrypted.slice(0, 8);
            const content = decrypted.slice(8);
            
            const encoder = new TextEncoder();
            const passwordData = encoder.encode(passwordInput.value);
            const hashBuffer = await crypto.subtle.digest('SHA-256', passwordData);
            const actualHash = new Uint8Array(hashBuffer).slice(0, 8);
            
            if (!actualHash.every((val, i) => val === expectedHash[i])) {
                throw new Error('Mot de passe incorrect');
            }
            
            gedcomContent = pako.inflate(content, {to: 'string'});
        } else {
            // Fichier non crypté
            gedcomContent = fileReader.result;
        }
        
        const gedcomData = parseGEDCOM(gedcomContent);
        
        // Stocker globalement
        window.globalGedcomData = gedcomData;
        
        console.log("DEBUG: Données GEDCOM parsées", gedcomData);

        displayPedigree(gedcomData);
        
        document.getElementById('password-form').style.display = 'none';
        document.getElementById('tree-container').style.display = 'block';
    } catch (error) {
        console.error('Erreur complète:', error);
        alert(error.message);
    }
}

document.addEventListener('focus', function(e) {
    if (/input|select|textarea/i.test(e.target.tagName)) {
        document.body.classList.add('fixfixed');
    }
}, true);

document.addEventListener('blur', function(e) {
    if (/input|select|textarea/i.test(e.target.tagName)) {
        document.body.classList.remove('fixfixed');
    }
}, true);


function showTooltip(event, d) {
    const person = d.data;
    let html = `<strong>${person.name}</strong><br>`;
    if (person.birthDate) html += `Naissance: ${person.birthDate}<br>`;
    if (person.deathDate) html += `Décès: ${person.deathDate}<br>`;
    if (person.occupation) html += `Occupation: ${person.occupation}<br>`;
    if (person.marriageDate) html += `Mariage: ${person.marriageDate}`;

    tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY + 10) + "px")
        .style("opacity", 1)
        .html(html);
}

function hideTooltip() {
    tooltip.style("opacity", 0);
}
