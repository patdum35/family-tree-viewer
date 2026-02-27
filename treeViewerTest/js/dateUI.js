// dateUI.js - Interface pour la sélection de dates historiques

// Fonction pour obtenir les traductions selon la langue actuelle
function getTranslation(key) {
    const translations = {
      'fr': {
        'selectCentury': 'Sélectionner un siècle',
        'selectDecade': 'Sélectionner une décennie ou valider',
        'selectYear': 'Sélectionner une année ou valider',
        'defaultDate': 'Date par défaut',
        'cancel': 'Annuler',
        'validate': 'Valider',
        'back': 'Retour',
        'bc': 'av. J.-C.'
      },
      'en': {
        'selectCentury': 'Select a century',
        'selectDecade': 'Select a decade or confirm',
        'selectYear': 'Select a year or confirm',
        'defaultDate': 'Default date',
        'cancel': 'Cancel',
        'validate': 'Confirm',
        'back': 'Back',
        'bc': 'BC'
      },
      'es': {
        'selectCentury': 'Seleccionar un siglo',
        'selectDecade': 'Seleccionar una década o confirmar',
        'selectYear': 'Seleccionar un año o confirmar',
        'defaultDate': 'Fecha predeterminada',
        'cancel': 'Cancelar',
        'validate': 'Confirmar',
        'back': 'Volver',
        'bc': 'a.C.'
      },
      'hu': {
        'selectCentury': 'Válasszon évszázadot',
        'selectDecade': 'Válasszon évtizedet vagy erősítse meg',
        'selectYear': 'Válasszon évet vagy erősítse meg',
        'defaultDate': 'Alapértelmezett dátum',
        'cancel': 'Mégse',
        'validate': 'Megerősít',
        'back': 'Vissza',
        'bc': 'i.e.'
      }
    };
  
    // Récupérer la langue actuelle
    const currentLang = window.CURRENT_LANGUAGE || 'fr';
    
    // Retourner la traduction ou le fallback en français
    return translations[currentLang]?.[key] || translations['fr'][key];
  }

// Fonction pour formater l'affichage des années
function formatYearDisplay(year) {
    if (year < 0) {
        // return `${Math.abs(year)} av. J.-C.`;
        return `${Math.abs(year)} ${getTranslation('bc')}`;
    }
    else if (year === 0) {
        return `1`; // L'an 0 n'existe pas historiquement
    }
    else {
        return `${year}`;
    }
}

// Classe du sélecteur de date historique
export class HistoricDatePicker {
    constructor(initialYear = 1500, onSelectCallback = null) {
        this.currentSelected = {
            century: Math.floor(parseInt(initialYear) / 100) * 100,
            decade: Math.floor(parseInt(initialYear) / 10) * 10,
            year: parseInt(initialYear)
        };

        this.centuries = [-500, -400, -300, -200, -100, 0, 100, 200, 300, 400, 500, 
                        600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 
                        1600, 1700, 1800, 1900, 2000];
        
        this.currentView = 'century'; // 'century', 'decade', 'year'
        this.onSelectCallback = onSelectCallback;
        this.modalId = `date-picker-modal-${Date.now()}`;
        
        // Initialiser le modal mais ne pas l'afficher
        this.createModal();
    }
    
    createModal() {
        
        const styleElement = document.createElement('style');
        styleElement.textContent = `
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `;
        document.head.appendChild(styleElement);

        const modalOverlay = document.createElement('div');
        modalOverlay.id = this.modalId;
        modalOverlay.style.position = 'fixed';
        modalOverlay.style.top = '0';
        modalOverlay.style.left = '0';
        modalOverlay.style.width = '100%';
        modalOverlay.style.height = '100%';
        modalOverlay.style.backgroundColor = 'rgba(0,0,0,0.7)';
        modalOverlay.style.display = 'none';
        modalOverlay.style.justifyContent = 'center';
        modalOverlay.style.alignItems = 'center';
        modalOverlay.style.zIndex = '99999';
        modalOverlay.style.animation = 'fadeIn 0.3s ease-out';
        
        const modalContent = document.createElement('div');
        modalContent.style.backgroundColor = 'transparent';
        modalContent.style.padding = '10px';
        modalContent.style.borderRadius = '8px';
        modalContent.style.width = '70%';
        modalContent.style.maxWidth = '220px';
        modalContent.style.textAlign = 'center';
        modalContent.style.maxHeight = '100vh';
        modalContent.style.overflowY = 'auto';
        modalContent.style.overflowX = 'hidden'; // Masquer l'ascenseur horizontal
        modalContent.style.boxSizing = 'border-box';
        
        // En-tête
        const modalHeader = document.createElement('div');
        modalHeader.style.backgroundColor = 'rgba(63, 81, 181, 0.8)'; // Bleu semi-transparent
        modalHeader.style.color = 'white';
        modalHeader.style.padding = '8px 8px'
        modalHeader.style.margin = '-12px -12px 12px -12px';
        modalHeader.style.borderRadius = '8px 8px 0 0';
        modalHeader.style.display = 'flex';
        modalHeader.style.flexDirection = 'column';
        modalHeader.style.alignItems = 'center';
        modalHeader.style.backdropFilter = 'blur(5px)'; // Ajout de l'effet de flou
        modalHeader.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)'; // Ombre légère
        
        const modalTitle = document.createElement('h3');
        modalTitle.id = `modal-title-${this.modalId}`;
        modalTitle.style.margin = '0 0 2px 0';
        modalTitle.style.fontSize = '14px';
        modalTitle.style.fontWeight = '500';
        modalTitle.textContent = 'Sélectionner un siècle';
        
        const modalSubtitle = document.createElement('p');
        modalSubtitle.id = `modal-subtitle-${this.modalId}`;
        modalSubtitle.style.margin = '0';
        modalSubtitle.style.fontSize = '11px';
        modalSubtitle.style.opacity = '0.9';
        modalSubtitle.textContent = `Date par défaut : ${formatYearDisplay(this.currentSelected.century)}`;
        
        modalHeader.appendChild(modalTitle);
        modalHeader.appendChild(modalSubtitle);
        
        // Corps
        const modalBody = document.createElement('div');
        modalBody.id = `modal-body-${this.modalId}`;
        modalBody.style.overflowY = 'hidden'; // Masquer l'ascenseur vertical
        modalBody.style.overflowX = 'hidden'; // Masquer l'ascenseur horizontal
        modalBody.style.width = '100%'; // S'assurer que la largeur est bien gérée
        modalBody.style.boxSizing = 'border-box'; // Inclure padding et bordure dans la largeur


        // Pied       
        const modalFooter = document.createElement('div');
        modalFooter.style.display = 'flex';
        modalFooter.style.justifyContent = 'space-between';
        modalFooter.style.marginTop = '6px';
        modalFooter.style.paddingTop = '6px';
        modalFooter.style.borderTop = '1px solid rgba(224, 224, 224, 0.5)'; // Bordure semi-transparente
        
        const cancelButton = document.createElement('button');
        cancelButton.textContent = getTranslation('cancel'); //'Annuler';
        cancelButton.style.padding = '4px 8px';
        cancelButton.style.border = 'none';
        cancelButton.style.borderRadius = '4px';
        cancelButton.style.backgroundColor = 'rgba(245, 245, 245, 0.7)'; // Fond semi-transparent
        cancelButton.style.color = '#757575';
        cancelButton.style.fontSize = '11px';
        cancelButton.style.fontWeight = '500';
        cancelButton.style.cursor = 'pointer';
        cancelButton.style.backdropFilter = 'blur(2px)'; // Effet de flou

        
        cancelButton.addEventListener('click', (e) => {
            e.preventDefault(); // Empêche la propagation de l'événement
            e.stopPropagation(); // Empêche la propagation de l'événement
            this.close(); // Ferme la modale
        });
        
        // Effets visuels de survol
        cancelButton.addEventListener('mouseover', () => {
            cancelButton.style.backgroundColor = 'rgba(245, 245, 245, 0.9)';
            cancelButton.style.transform = 'scale(1.05)';
            cancelButton.style.transition = 'all 0.2s ease';
        });
        
        cancelButton.addEventListener('mouseout', () => {
            cancelButton.style.backgroundColor = 'rgba(245, 245, 245, 0.7)';
            cancelButton.style.transform = 'scale(1)';
        });


        
        const validateButton = document.createElement('button');
        validateButton.id = `validate-button-${this.modalId}`;
        validateButton.textContent = getTranslation('validate'); //'Valider';
        validateButton.style.padding = '4px 8px';
        validateButton.style.border = 'none';
        validateButton.style.borderRadius = '4px';
        validateButton.style.backgroundColor = 'rgba(63, 81, 181, 0.8)'; // Fond semi-transparent
        validateButton.style.color = 'white';
        validateButton.style.fontSize = '11px';
        validateButton.style.fontWeight = '500';
        validateButton.style.cursor = 'pointer';
        validateButton.style.backdropFilter = 'blur(2px)'; // Effet de flou

        validateButton.addEventListener('mouseover', () => {
            validateButton.style.backgroundColor = 'rgba(63, 81, 181, 0.95)';
            validateButton.style.transform = 'scale(1.05)';
            validateButton.style.boxShadow = '0 2px 6px rgba(63, 81, 181, 0.4)';
            validateButton.style.transition = 'all 0.2s ease';
        });
        
        validateButton.addEventListener('mouseout', () => {
            validateButton.style.backgroundColor = 'rgba(63, 81, 181, 0.8)';
            validateButton.style.transform = 'scale(1)';
            validateButton.style.boxShadow = 'none';
        });


        
        modalFooter.appendChild(cancelButton);
        modalFooter.appendChild(validateButton);
        
        // Assembler le modal
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
        modalContent.appendChild(modalFooter);
        modalOverlay.appendChild(modalContent);
        
        // Ajouter au body
        document.body.appendChild(modalOverlay);
        
        // Fermer le modal si on clique à l'extérieur
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                this.close();
            }
        });
        
        // Ajouter un gestionnaire d'événement pour la touche Échap
        const handleEscapeKey = (e) => {
            if (e.key === 'Escape' && modalOverlay.style.display === 'flex') {
                this.close();
                document.removeEventListener('keydown', handleEscapeKey);
            }
        };
        document.addEventListener('keydown', handleEscapeKey);
    }
    
    open(onSelect) {
        this.onSelectCallback = onSelect || this.onSelectCallback;
        
        if (!this.onSelectCallback) {
            console.error("No callback function provided for date selection");
            return;
        }
        
        const modal = document.getElementById(this.modalId);
        modal.style.display = 'flex';
        

    
        // Vérifier la hauteur de l'écran
        if (window.innerHeight < 500) {
            // Si la hauteur est inférieure à 500px, positionner la modale en haut
            modal.style.alignItems = 'flex-start';
            modal.style.paddingTop = '10px'; // Ajouter un petit espace en haut

            // Optimisation supplémentaire pour les petits écrans
            const modalContent = modal.querySelector('div'); // Premier div enfant (le contenu)
            if (modalContent) {
                modalContent.style.padding = '8px'; // Réduire davantage le padding sur petit écran
            }

        } else {
            // Sinon, conserver le centrage vertical
            modal.style.alignItems = 'center';
            modal.style.paddingTop = '0';
        }


        // Afficher la vue des siècles par défaut
        this.showCenturyView();
    }
    
    close() {
        const modal = document.getElementById(this.modalId);
        modal.style.display = 'none';
    }
    
    showCenturyView() {
        this.currentView = 'century';
        
        // Mettre à jour le titre et sous-titre
        // document.getElementById(`modal-title-${this.modalId}`).textContent = 'Sélectionner un siècle';
        // document.getElementById(`modal-subtitle-${this.modalId}`).textContent = `Date par défaut : ${formatYearDisplay(this.currentSelected.century)}`;
        document.getElementById(`modal-title-${this.modalId}`).textContent = getTranslation('selectCentury');
        document.getElementById(`modal-subtitle-${this.modalId}`).textContent = `${getTranslation('defaultDate')} : ${formatYearDisplay(this.currentSelected.century)}`;


        // Configuration du bouton de validation
        const validateBtn = document.getElementById(`validate-button-${this.modalId}`);
        validateBtn.onclick = () => {
            this.onSelectCallback(this.currentSelected.century);
            this.close();
        };
        
 
        // Vider et recréer la grille
        const modalBody = document.getElementById(`modal-body-${this.modalId}`);
        modalBody.innerHTML = '';



        
        // Créer la grille des siècles
        const gridContainer = document.createElement('div');
        gridContainer.style.display = 'grid';
        gridContainer.style.gridTemplateColumns = 'repeat(5, 1fr)';
        gridContainer.style.gap = '4px'; //'4px';
        gridContainer.style.marginBottom = '4px';
        gridContainer.style.width = '100%'; // S'assurer que la grille prend 100% de la largeur
        gridContainer.style.boxSizing = 'border-box'; // Inclure padding et bordure dans la largeur
        gridContainer.style.overflowX = 'hidden'; // Masquer tout débordement horizontal

        
        // Trouver l'indice du siècle actuel
        const currentCenturyIndex = this.centuries.findIndex(century => century === this.currentSelected.century);
        
        this.centuries.forEach(century => {
            const gridItem = document.createElement('div');
            gridItem.style.display = 'flex';
            gridItem.style.justifyContent = 'center';
            gridItem.style.alignItems = 'center';
            gridItem.style.aspectRatio = '1 / 1';
            gridItem.style.borderRadius = '50%';
            gridItem.style.fontSize = '11px'; //'11px';
            gridItem.style.cursor = 'pointer';
            gridItem.style.transition = 'all 0.15s ease';
            gridItem.style.userSelect = 'none';
            gridItem.style.width = '100%'; //'100%';
            gridItem.style.height = 'auto';

            gridItem.style.maxWidth = '35px'; // Limite la taille maximum
            gridItem.style.margin = '0 auto'; // Centre les ronds horizontalement
            gridItem.style.padding = '0'; // Supprime tout padding

            
            // Style pour les siècles
            gridItem.style.backgroundColor = 'rgba(227, 242, 253, 0.7)'; // Bleu très clair transparent
            gridItem.style.backdropFilter = 'blur(2px)';
            gridItem.style.color = '#212121';
            
            // Style si sélectionné
            if (century === this.currentSelected.century) {
                gridItem.style.backgroundColor = 'rgba(33, 150, 243, 0.8)'; // Bleu sélectionné transparent
                gridItem.style.backdropFilter = 'blur(3px)';
                gridItem.style.color = 'white';
                gridItem.style.fontWeight = 'bold';
                gridItem.style.boxShadow = '0 2px 6px rgba(33, 150, 243, 0.4)';
            }
            
            // Hover effect
            gridItem.addEventListener('mouseover', () => {
                if (century !== this.currentSelected.century) {
                    gridItem.style.backgroundColor = '#2196f3';
                    gridItem.style.color = 'white';
                    gridItem.style.transform = 'scale(1.1)';
                }
            });
            
            gridItem.addEventListener('mouseout', () => {
                if (century !== this.currentSelected.century) {
                    gridItem.style.backgroundColor = '#e3f2fd';
                    gridItem.style.color = '#212121';
                    gridItem.style.transform = 'scale(1)';
                }
            });
            
            // Afficher le texte du siècle
            if (century < 0) {
                gridItem.textContent = `-${Math.abs(century)}`;
            } else {
                gridItem.textContent = century;
            }
            
            gridItem.addEventListener('click', () => {
                this.currentSelected.century = century;
                // Par défaut, sélectionner la première décennie
                this.currentSelected.decade = century;
                // Par défaut, sélectionner l'année zéro de la décennie
                this.currentSelected.year = century;
                
                this.showDecadeView();
            });
            
            gridContainer.appendChild(gridItem);
        });
        
        modalBody.appendChild(gridContainer);
        
        // Faire défiler jusqu'au siècle sélectionné
        if (currentCenturyIndex !== -1) {
            setTimeout(() => {
                const selectedItem = gridContainer.children[currentCenturyIndex];
                if (selectedItem) {
                    selectedItem.scrollIntoView({ block: 'center', behavior: 'smooth' });
                }
            }, 100);
        }
    }
    
    showDecadeView() {
        this.currentView = 'decade';
        
        // Mettre à jour le titre et sous-titre
        // document.getElementById(`modal-title-${this.modalId}`).textContent = 'Sélectionner une décennie ou valider';
        // document.getElementById(`modal-subtitle-${this.modalId}`).textContent = `Date par défaut : ${formatYearDisplay(this.currentSelected.decade)}`;
        document.getElementById(`modal-title-${this.modalId}`).textContent = getTranslation('selectDecade');
        document.getElementById(`modal-subtitle-${this.modalId}`).textContent = `${getTranslation('defaultDate')} : ${formatYearDisplay(this.currentSelected.decade)}`;

        // Configuration du bouton de validation
        const validateBtn = document.getElementById(`validate-button-${this.modalId}`);
        validateBtn.onclick = () => {
            this.onSelectCallback(this.currentSelected.decade);
            this.close();
        };
        
        // Vider et recréer la grille
        const modalBody = document.getElementById(`modal-body-${this.modalId}`);
        modalBody.innerHTML = '';
        
        // Bouton de retour
        const backButton = document.createElement('button');
        backButton.style.backgroundColor = 'rgba(245, 245, 245, 0.7)';
        backButton.style.border = 'none';
        backButton.style.borderRadius = '4px';
        backButton.style.padding = '4px 8px';
        backButton.style.marginBottom = '8px';
        backButton.style.cursor = 'pointer';
        backButton.style.display = 'flex';
        backButton.style.alignItems = 'center';
        backButton.style.fontWeight = '500';
        backButton.style.fontSize = '11px';
        backButton.style.color = '#757575';
        // backButton.innerHTML = '<span style="margin-right:4px">←</span> Retour';
        backButton.innerHTML = `<span style="margin-right:4px">←</span> ${getTranslation('back')}`;
        
        backButton.addEventListener('click', () => this.showCenturyView());
        modalBody.appendChild(backButton);
        
        // Créer la grille des décennies
        const gridContainer = document.createElement('div');
        gridContainer.style.display = 'grid';
        gridContainer.style.gridTemplateColumns = 'repeat(5, 1fr)';
        gridContainer.style.gap = '4px';
        gridContainer.style.marginBottom = '8px';
        
        // Générer les décennies pour ce siècle
        for (let decade = this.currentSelected.century; decade < this.currentSelected.century + 100; decade += 10) {
            const gridItem = document.createElement('div');
            gridItem.style.display = 'flex';
            gridItem.style.justifyContent = 'center';
            gridItem.style.alignItems = 'center';
            gridItem.style.aspectRatio = '1 / 1';
            gridItem.style.borderRadius = '50%';
            gridItem.style.fontSize = '11px';
            gridItem.style.cursor = 'pointer';
            gridItem.style.transition = 'all 0.15s ease';
            gridItem.style.userSelect = 'none';
            gridItem.style.width = '100%';
            gridItem.style.height = 'auto';
            
            // Style pour les décennies
            gridItem.style.backgroundColor = 'rgba(232, 245, 233, 0.7)';
            gridItem.style.color = '#212121';
            
            // Style si sélectionné
            if (decade === this.currentSelected.decade) {
                gridItem.style.backgroundColor = 'rgba(76, 175, 80, 0.8)';
                gridItem.style.color = 'white';
                gridItem.style.fontWeight = 'bold';
                gridItem.style.boxShadow = '0 2px 6px rgba(76, 175, 80, 0.4)';
            }
            
            // Hover effect
            gridItem.addEventListener('mouseover', () => {
                if (decade !== this.currentSelected.decade) {
                    gridItem.style.backgroundColor = '#4caf50';
                    gridItem.style.color = 'white';
                    gridItem.style.transform = 'scale(1.1)';
                }
            });
            
            gridItem.addEventListener('mouseout', () => {
                if (decade !== this.currentSelected.decade) {
                    gridItem.style.backgroundColor = '#e8f5e9';
                    gridItem.style.color = '#212121';
                    gridItem.style.transform = 'scale(1)';
                }
            });
            
            // Afficher le texte de la décennie
            if (decade < 0) {
                gridItem.textContent = `-${Math.abs(decade)}`;
            } else {
                gridItem.textContent = decade;
            }
            
            gridItem.addEventListener('click', () => {
                this.currentSelected.decade = decade;
                // Par défaut, sélectionner l'année zéro de la décennie
                this.currentSelected.year = decade;
                
                this.showYearView();
            });
            
            gridContainer.appendChild(gridItem);
        }
        
        modalBody.appendChild(gridContainer);
    }
    
    showYearView() {
        this.currentView = 'year';
        
        // Mettre à jour le titre et sous-titre
        // document.getElementById(`modal-title-${this.modalId}`).textContent = 'Sélectionner une année ou valider';
        // document.getElementById(`modal-subtitle-${this.modalId}`).textContent = `Date par défaut : ${formatYearDisplay(this.currentSelected.year)}`;
        document.getElementById(`modal-title-${this.modalId}`).textContent = getTranslation('selectYear');
        document.getElementById(`modal-subtitle-${this.modalId}`).textContent = `${getTranslation('defaultDate')} : ${formatYearDisplay(this.currentSelected.year)}`;

        // Configuration du bouton de validation
        const validateBtn = document.getElementById(`validate-button-${this.modalId}`);
        validateBtn.onclick = () => {
            this.onSelectCallback(this.currentSelected.year);
            this.close();
        };
        
        // Vider et recréer la grille
        const modalBody = document.getElementById(`modal-body-${this.modalId}`);
        modalBody.innerHTML = '';
        
        // Bouton de retour
        const backButton = document.createElement('button');
        backButton.style.backgroundColor = 'rgba(245, 245, 245, 0.7)';
        backButton.style.border = 'none';
        backButton.style.borderRadius = '4px';
        backButton.style.padding = '4px 8px';
        backButton.style.marginBottom = '8px';
        backButton.style.cursor = 'pointer';
        backButton.style.display = 'flex';
        backButton.style.alignItems = 'center';
        backButton.style.fontWeight = '500';
        backButton.style.fontSize = '11px';
        backButton.style.color = '#757575';
        backButton.innerHTML = '<span style="margin-right:4px">←</span> Retour';
        
        backButton.addEventListener('click', () => this.showDecadeView());
        modalBody.appendChild(backButton);
        
        // Créer la grille des années
        const gridContainer = document.createElement('div');
        gridContainer.style.display = 'grid';
        gridContainer.style.gridTemplateColumns = 'repeat(5, 1fr)';
        gridContainer.style.gap = '4px';
        gridContainer.style.marginBottom = '8px';
        
        // Générer les années pour cette décennie
        for (let year = this.currentSelected.decade; year < this.currentSelected.decade + 10; year++) {
            const gridItem = document.createElement('div');
            gridItem.style.display = 'flex';
            gridItem.style.justifyContent = 'center';
            gridItem.style.alignItems = 'center';
            gridItem.style.aspectRatio = '1 / 1';
            gridItem.style.borderRadius = '50%';
            gridItem.style.fontSize = '11px';
            gridItem.style.cursor = 'pointer';
            gridItem.style.transition = 'all 0.15s ease';
            gridItem.style.userSelect = 'none';
            gridItem.style.width = '100%';
            gridItem.style.height = 'auto';
            
            // Style pour les années
            gridItem.style.backgroundColor = 'rgba(255, 248, 225, 0.7)';
            gridItem.style.color = '#212121';
            
            // Style si sélectionné
            if (year === this.currentSelected.year) {
                gridItem.style.backgroundColor = 'rgba(255, 193, 7, 0.8)';
                gridItem.style.color = '#212121';
                gridItem.style.fontWeight = 'bold';
                gridItem.style.boxShadow = '0 2px 6px rgba(255, 193, 7, 0.4)';
            }
            
            // Hover effect
            gridItem.addEventListener('mouseover', () => {
                if (year !== this.currentSelected.year) {
                    gridItem.style.backgroundColor = '#ffc107';
                    gridItem.style.color = '#212121';
                    gridItem.style.transform = 'scale(1.1)';
                }
            });
            
            gridItem.addEventListener('mouseout', () => {
                if (year !== this.currentSelected.year) {
                    gridItem.style.backgroundColor = '#fff8e1';
                    gridItem.style.color = '#212121';
                    gridItem.style.transform = 'scale(1)';
                }
            });
            
            // Afficher le texte de l'année
            if (year < 0) {
                gridItem.textContent = `-${Math.abs(year)}`;
            } else if (year === 0) {
                gridItem.textContent = '1'; // L'an 0 n'existe pas historiquement
            } else {
                gridItem.textContent = year;
            }
            
            gridItem.addEventListener('click', () => {
                this.currentSelected.year = year;
                this.onSelectCallback(year);
                this.close();
            });
            
            gridContainer.appendChild(gridItem);
        }
        
        modalBody.appendChild(gridContainer);
    }
}

// Fonction de création d'un sélecteur de date adapté (remplace createDateInput)
export function createMobileDateInput(label, defaultValue, onChange) {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    
    const labelElement = document.createElement('div');
    labelElement.innerHTML = label;
    labelElement.style.fontSize = '12px';
    labelElement.style.marginBottom = '0.25em';
    labelElement.dataset.role = 'fontSizeChangeCloudName';
    labelElement.id = 'dateButtonLabel-'+label;
    
    const dateButton = document.createElement('button');
    // dateButton.textContent = defaultValue;
    dateButton.style.width = '3.6em';
    dateButton.style.padding = '0.3em 0px';
    dateButton.style.fontSize = '10px';
    dateButton.style.border = '0.1em solid #3f51b5';
    dateButton.style.borderRadius = '0.3em';
    dateButton.style.backgroundColor = '#e8eaf6';
    dateButton.style.color = '#3f51b5';
    dateButton.style.cursor = 'pointer';
    dateButton.style.fontWeight = 'bold';
    dateButton.dataset.role = 'fontSizeChangeChromeCloudName';
    dateButton.id = 'dateButton-'+label;

    const dateButtonSpan = document.createElement('span');
    dateButtonSpan.textContent = defaultValue;
    dateButtonSpan.dataset.role = 'fontSizeChangeCloudName';
    dateButtonSpan.style.fontSize = '13px';
    dateButtonSpan.id = 'dateButtonSpan-'+label;
    dateButton.appendChild(dateButtonSpan);
    
    
    // Input caché pour stocker la valeur
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.value = defaultValue;
    
    // Événement pour ouvrir le sélecteur
    dateButton.addEventListener('click', () => {
        const datePicker = new HistoricDatePicker(hiddenInput.value, (selectedYear) => {
            hiddenInput.value = selectedYear;
            dateButton.querySelector('span').textContent = selectedYear;
            
            // Déclencher un événement de changement
            const event = new Event('change');
            hiddenInput.dispatchEvent(event);
            
            if (typeof onChange === 'function') {
                onChange(selectedYear);
            }
        });
        
        datePicker.open();
    });
    
    container.appendChild(labelElement);
    container.appendChild(dateButton);
    container.appendChild(hiddenInput);
    
    return { container, input: hiddenInput };
}

// Version desktop (reprise de l'ancien code)
export function createDesktopDateInput(label, defaultValue, onChange) {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    
    const labelElement = document.createElement('div');
    labelElement.innerHTML = label;
    labelElement.style.fontSize = '12px';
    labelElement.style.marginBottom = '3px';
    
    const input = document.createElement('input');
    input.type = 'number';
    input.style.width = '57px';
    input.style.padding = '0px';
    input.style.height = '25px';
    input.value = defaultValue;
    input.step = '100';
    
    input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            const currentValue = parseInt(input.value) || 0;
            const newValue = e.key === 'ArrowUp' ? currentValue + 100 : currentValue - 100;
            input.value = newValue;
            
            if (typeof onChange === 'function') {
                onChange(newValue);
            }
        }
    });
    
    input.addEventListener('change', () => {
        if (typeof onChange === 'function') {
            onChange(parseInt(input.value));
        }
    });
    
    container.appendChild(labelElement);
    container.appendChild(input);
    
    return { container, input };
}

// Fonction principale qui choisit le sélecteur approprié selon le dispositif
export function createDateInput(label, defaultValue, onChange) {
    // Déterminer si nous sommes sur mobile
    if (true) {
    // if (nameCloudState.mobilePhone) {
        return createMobileDateInput(label, defaultValue, onChange);
    } else {
        return createDesktopDateInput(label, defaultValue, onChange);
    }
}