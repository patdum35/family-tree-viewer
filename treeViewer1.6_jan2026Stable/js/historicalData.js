export const historicalFigures = {
    governmentTypes: [
        { type: 'Monarchie', start: -800, end: 1792 },
        { type: 'Première République', start: 1792, end: 1804 },
        { type: 'Premier Empire', start: 1804, end: 1814 },
        { type: 'Première Restauration', start: 1814, end: 1815 },
        { type: 'Cent-Jours', start: 1815, end: 1815 },
        { type: 'Seconde Restauration', start: 1815, end: 1830 },
        { type: 'Monarchie de Juillet', start: 1830, end: 1848 },
        { type: 'Deuxième République', start: 1848, end: 1852 },
        { type: 'Second Empire', start: 1852, end: 1870 },
        { type: 'Troisième République', start: 1870, end: 1940 },
        { type: 'Régime de Vichy', start: 1940, end: 1944 },
        { type: 'Gouvernement provisoire', start: 1944, end: 1946 },
        { type: 'Quatrième République', start: 1946, end: 1958 },
        { type: 'Cinquième République', start: 1958, end: null }
    ],
    
    rulers: [
        // Période Gauloise et Romaine
        { name: 'Vercingétorix', type: 'Chef gaulois', start: -52, end: -51 },
        { name: 'Jules César', type: 'Consul romain', start: -58, end: -44 },
        { name: 'Auguste', type: 'Empereur romain', start: -27, end: 14 },

        // Période 14 - 481 : Empire romain et début des invasions
        { name: 'Tibère', type: 'Empereur romain', start: 14, end: 37 },
        { name: 'Caligula', type: 'Empereur romain', start: 37, end: 41 },
        { name: 'Claude', type: 'Empereur romain', start: 41, end: 54 },
        { name: 'Néron', type: 'Empereur romain', start: 54, end: 68 },
        { name: 'Vespasien', type: 'Empereur romain', start: 69, end: 79 },
        { name: 'Tetricus Ier', type: 'Empereur des Gaules', start: 260, end: 274 },
        { name: 'Dioclétien', type: 'Empereur romain', start: 284, end: 305 },
        { name: 'Constantin Ier', type: 'Empereur romain', start: 306, end: 337 },
        { name: 'Julien l\'Apostat', type: 'Empereur romain', start: 361, end: 363 },
        { name: 'Valentinien Ier', type: 'Empereur romain', start: 364, end: 375 },
        { name: 'Théodose Ier', type: 'Empereur romain', start: 379, end: 395 },
        { name: 'Honorius', type: 'Empereur romain d\'Occident', start: 395, end: 423 },
        { name: 'Valentinien III', type: 'Empereur romain d\'Occident', start: 425, end: 455 },
        { name: 'Romulus Augustule', type: 'Dernier Empereur romain d\'Occident', start: 475, end: 476 },
        { name: 'Odoacre', type: 'Roi des Hérules', start: 476, end: 493 },
        { name: 'Clovis Ier', type: 'Roi des Francs', start: 481, end: 511 },
        
        // Mérovingiens
        { name: 'Clovis Ier', type: 'Roi', start: 481, end: 511 },
        { name: 'Clotaire Ier', type: 'Roi', start: 511, end: 561 },
        { name: 'Chilpéric Ier', type: 'Roi', start: 561, end: 584 },
        { name: 'Childebert II', type: 'Roi mérovingien', start: 584, end: 595 },
        { name: 'Thierry II', type: 'Roi mérovingien', start: 596, end: 613 },
        { name: 'Clotaire II', type: 'Roi mérovingien', start: 613, end: 629 },
        { name: 'Dagobert Ier', type: 'Roi', start: 629, end: 639 },
        { name: 'Clovis II', type: 'Roi mérovingien', start: 639, end: 657 },
        { name: 'Thierry III', type: 'Roi mérovingien', start: 675, end: 691 },
        { name: 'Childbert III', type: 'Roi mérovingien', start: 695, end: 711 },
        { name: 'Dagobert III', type: 'Roi mérovingien', start: 711, end: 715 },
        { name: 'Chilpéric II', type: 'Roi mérovingien', start: 715, end: 721 },
        { name: 'Thierry IV', type: 'Roi mérovingien', start: 721, end: 737 },
        { name: 'Charles Martel', type: 'Maire du Palais', start: 737, end: 741 },
        { name: 'Pépin le Bref', type: 'Roi des Francs', start: 741, end: 751 }, 
              
        // Carolingiens
        { name: 'Pépin le Bref', type: 'Roi', start: 751, end: 768 },
        { name: 'Charlemagne', type: 'Empereur', start: 768, end: 814 },
        { name: 'Louis le Pieux', type: 'Empereur', start: 814, end: 840 },
        { name: 'Charles le Chauve', type: 'Roi', start: 840, end: 877 },

        // Période 877 - 987 : Période intermédiaire
        { name: 'Carloman Ier', type: 'Roi des Francs', start: 877, end: 884 },
        { name: 'Charles le Gros', type: 'Empereur carolingien', start: 884, end: 888 },
        { name: 'Arnulf de Carinthie', type: 'Roi des Francs', start: 888, end: 899 },
        { name: 'Louis l\'Aveugle', type: 'Roi de Provence', start: 899, end: 905 },
        { name: 'Charles le Simple', type: 'Roi des Francs', start: 911, end: 923 },
        { name: 'Raoul de Bourgogne', type: 'Roi des Francs', start: 923, end: 936 },
        { name: 'Louis d\'Outremer', type: 'Roi des Francs', start: 936, end: 954 },
        { name: 'Lothaire de France', type: 'Roi des Francs', start: 954, end: 986 }, 

        // Capétiens directs
        { name: 'Hugues Capet', type: 'Roi', start: 987, end: 996 },
        { name: 'Robert II le Pieux', type: 'Roi', start: 996, end: 1031 },
        { name: 'Henri Ier', type: 'Roi', start: 1031, end: 1060 },
        { name: 'Philippe Ier', type: 'Roi', start: 1060, end: 1108 },
        { name: 'Louis VI le Gros', type: 'Roi', start: 1108, end: 1137 },
        { name: 'Louis VII le Jeune', type: 'Roi', start: 1137, end: 1180 },
        { name: 'Philippe II Auguste', type: 'Roi', start: 1180, end: 1223 },
        { name: 'Louis VIII le Lion', type: 'Roi', start: 1223, end: 1226 },
        { name: 'Saint Louis (Louis IX)', type: 'Roi', start: 1226, end: 1270 },
        { name: 'Philippe III le Hardi', type: 'Roi', start: 1270, end: 1285 },
        { name: 'Philippe IV le Bel', type: 'Roi', start: 1285, end: 1314 },
        { name: 'Louis X le Hutin', type: 'Roi', start: 1314, end: 1316 },
        { name: 'Philippe V le Long', type: 'Roi', start: 1316, end: 1322 },
        { name: 'Charles IV le Bel', type: 'Roi', start: 1322, end: 1328 },

        // Valois
        { name: 'Philippe VI de Valois', type: 'Roi', start: 1328, end: 1350 },
        { name: 'Jean II le Bon', type: 'Roi', start: 1350, end: 1364 },
        { name: 'Charles V le Sage', type: 'Roi', start: 1364, end: 1380 },
        { name: 'Charles VI le Fou', type: 'Roi', start: 1380, end: 1422 },
        { name: 'Charles VII le Victorieux', type: 'Roi', start: 1422, end: 1461 },
        { name: 'Louis XI', type: 'Roi', start: 1461, end: 1483 },
        // Période 1483 - 1515 : Transition entre Valois et Bourbon
        { name: 'Charles VIII', type: 'Roi', start: 1483, end: 1498 },
        { name: 'Louis XII', type: 'Roi', start: 1498, end: 1515 },
       
        // Bourbon
        { name: 'François Ier', type: 'Roi', start: 1515, end: 1547 },
        { name: 'Henri II', type: 'Roi', start: 1547, end: 1559 },
        { name: 'François II', type: 'Roi', start: 1559, end: 1560 },
        { name: 'Charles IX', type: 'Roi', start: 1560, end: 1574 },
        { name: 'Henri III', type: 'Roi', start: 1574, end: 1589 },
        { name: 'Henri IV', type: 'Roi', start: 1589, end: 1610 },
        { name: 'Louis XIII', type: 'Roi', start: 1610, end: 1643 },
        { name: 'Louis XIV le Roi Soleil', type: 'Roi', start: 1643, end: 1715 },
        { name: 'Louis XV', type: 'Roi', start: 1715, end: 1774 },
        { name: 'Louis XVI', type: 'Roi', start: 1774, end: 1792 },

        // Période 1792 - 1799 : Période révolutionnaire
        { name: 'Assemblée législative', type: 'Gouvernement', start: 1792, end: 1793 },
        { name: 'Convention nationale', type: 'Gouvernement révolutionnaire', start: 1793, end: 1795 },
        { name: 'Directoire', type: 'Gouvernement', start: 1795, end: 1799 },
      
        // Période révolutionnaire et napoléonienne
        { name: 'Napoléon Bonaparte', type: 'Consul', start: 1799, end: 1804 },
        { name: 'Napoléon Ier', type: 'Empereur', start: 1804, end: 1814 },
        { name: 'Louis XVIII', type: 'Roi', start: 1814, end: 1815 },
        { name: 'Napoléon (Cent-Jours)', type: 'Empereur', start: 1815, end: 1815 },
        { name: 'Louis XVIII (restauration)', type: 'Roi', start: 1815, end: 1824 },
        { name: 'Charles X', type: 'Roi', start: 1824, end: 1830 },
        
        // Monarchie de Juillet
        { name: 'Louis-Philippe Ier', type: 'Roi', start: 1830, end: 1848 },
        
        // Deuxième République
        { name: 'Louis-Napoléon Bonaparte', type: 'Président', start: 1848, end: 1852 },
        
        // Second Empire
        { name: 'Napoléon III', type: 'Empereur', start: 1852, end: 1870 },
        
        // Troisième République
        { name: 'Adolphe Thiers', type: 'Président', start: 1871, end: 1873 },
        { name: 'Patrice de MacMahon', type: 'Président', start: 1873, end: 1879 },
        { name: 'Jules Grévy', type: 'Président', start: 1879, end: 1887 },
        { name: 'Sadi Carnot', type: 'Président', start: 1887, end: 1894 },
        { name: 'Jean Casimir-Perier', type: 'Président', start: 1894, end: 1895 },
        { name: 'Félix Faure', type: 'Président', start: 1895, end: 1899 },
        { name: 'Émile Loubet', type: 'Président', start: 1899, end: 1906 },
        { name: 'Armand Fallières', type: 'Président', start: 1906, end: 1913 },
        { name: 'Raymond Poincaré', type: 'Président', start: 1913, end: 1920 },
        { name: 'Alexandre Millerand', type: 'Président', start: 1920, end: 1924 },
        { name: 'Gaston Doumergue', type: 'Président', start: 1924, end: 1931 },
        { name: 'Paul Doumer', type: 'Président', start: 1931, end: 1932 },
        { name: 'Albert Lebrun', type: 'Président', start: 1932, end: 1940 },
        
        // Régime de Vichy
        { name: 'Philippe Pétain', type: 'Chef de l\'État', start: 1940, end: 1944 },

        // Période 1944 - 1947 : Gouvernement provisoire
        { name: 'Charles de Gaulle', type: 'Président du Gouvernement provisoire', start: 1944, end: 1946 },
        { name: 'Félix Gouin', type: 'Président du Gouvernement provisoire', start: 1946, end: 1947 },        
        // Quatrième République
        { name: 'Vincent Auriol', type: 'Président', start: 1947, end: 1954 },
        { name: 'René Coty', type: 'Président', start: 1954, end: 1959 },
        
        // Cinquième République
        { name: 'Charles de Gaulle', type: 'Président', start: 1959, end: 1969 },
        { name: 'Georges Pompidou', type: 'Président', start: 1969, end: 1974 },
        { name: 'Valéry Giscard d\'Estaing', type: 'Président', start: 1974, end: 1981 },
        { name: 'François Mitterrand', type: 'Président', start: 1981, end: 1995 },
        { name: 'Jacques Chirac', type: 'Président', start: 1995, end: 2007 },
        { name: 'Nicolas Sarkozy', type: 'Président', start: 2007, end: 2012 },
        { name: 'François Hollande', type: 'Président', start: 2012, end: 2017 },
        { name: 'Emmanuel Macron', type: 'Président', start: 2017, end: 2027},
    ],

    // Méthode pour trouver les dirigeants d'une année
    findRulersForYear(year) {
        return {
            rulers: this.rulers.filter(ruler => year >= ruler.start && year <= ruler.end),
            governmentType: this.governmentTypes.find(gov => year >= gov.start && year <= gov.end)
        };
    }
};