import logging
from typing import Dict, List, Tuple, Set
import re

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GedcomMerger:

    def __init__(self, file1: str, file2: str, main_person: str, spouse: str, sibling: str):
        self.file1 = file1
        self.file2 = file2
        self.id_mapping = {}
        self.max_indi_id = 0
        self.max_fam_id = 0
        self.indi_offset = 0
        self.fam_offset = 0
        self.file2_with_offset = None
        # Correspondances entre les personnes des deux fichiers
        self.person_mappings = {
            main_person: {
                'name': main_person,
                'file1_id': None,
                'file2_id': None,
                'spouse_name': spouse,
                'spouse_file1_id': None,
                'spouse_file2_id': None,
                'sibling_name': sibling,
                'sibling_file1_id': None,
                'sibling_file2_id': None
            }
        }
        self.family_id_with_offset = None

    def analyze_file1_ids(self):
        """Analyse les plages d'IDs dans le fichier 1"""
        logger.info(f"Analyse des IDs dans {self.file1}")
        with open(self.file1, 'r', encoding='utf-8') as file:
            for line in file:
                if '@I' in line:
                    match = re.search(r'@I(\d+)@', line)
                    if match:
                        self.max_indi_id = max(self.max_indi_id, int(match.group(1)))
                elif '@F' in line:
                    match = re.search(r'@F(\d+)@', line)
                    if match:
                        self.max_fam_id = max(self.max_fam_id, int(match.group(1)))
        
        # Calculer les offsets sûrs (arrondir au millier supérieur + 1000)
        self.indi_offset = ((self.max_indi_id // 1000) + 2) * 1000
        self.fam_offset = ((self.max_fam_id // 1000) + 2) * 1000
        
        logger.info(f"Plus grand ID INDI: @I{self.max_indi_id}@ -> Offset: {self.indi_offset}")
        logger.info(f"Plus grand ID FAM: @F{self.max_fam_id}@ -> Offset: {self.fam_offset}")

    def generate_new_id(self, old_id: str) -> str:
        """Génère un nouvel ID avec offset"""
        if old_id in self.id_mapping:
            return self.id_mapping[old_id]
            
        match = re.search(r'@([IF])(\d+)@', old_id)
        if match:
            id_type = match.group(1)
            old_num = int(match.group(2))
            
            if id_type == 'I':
                new_num = old_num + self.indi_offset
                new_id = f"@I{new_num}@"
            else:  # id_type == 'F'
                new_num = old_num + self.fam_offset
                new_id = f"@F{new_num}@"
                
            self.id_mapping[old_id] = new_id
            logger.debug(f"Mapping ID: {old_id} -> {new_id}")
            return new_id
        return old_id

    def find_person_details(self, filename: str, is_file1: bool):
        """Trouve les IDs des personnes et leurs relations"""
        current_person = None
        current_id = None
        
        with open(filename, 'r', encoding='utf-8') as file:
            for line in file:
                parts = line.strip().split(' ', 2)
                if len(parts) >= 2:
                    level = int(parts[0])
                    tag = parts[1]
                    
                    if level == 0 and len(parts) > 2 and parts[2] == 'INDI':
                        current_id = tag
                    elif level == 1 and tag == 'NAME' and len(parts) > 2:
                        name = parts[2].replace('/', '')
                        # Vérifier chaque personne et leurs relations
                        for person_info in self.person_mappings.values():
                            if name == person_info['name']:
                                if is_file1:
                                    person_info['file1_id'] = current_id
                                else:
                                    person_info['file2_id'] = current_id
                            elif name == person_info['spouse_name']:
                                if is_file1:
                                    person_info['spouse_file1_id'] = current_id
                                else:
                                    person_info['spouse_file2_id'] = current_id
                            elif name == person_info['sibling_name']:
                                if is_file1:
                                    person_info['sibling_file1_id'] = current_id
                                else:
                                    person_info['sibling_file2_id'] = current_id

    def find_family(self, filename: str, person_id: str) -> str:
        """Trouve l'ID de la famille où la personne est enfant"""
        in_person = False
        famc_id = None
        
        with open(filename, 'r', encoding='utf-8') as file:
            for line in file:
                if person_id in line:
                    in_person = True
                elif in_person and '1 FAMC' in line:
                    famc_id = line.strip().split(' ')[2]
                    break
                elif in_person and line.startswith('0'):
                    break
        
        return famc_id

    def create_offset_copy(self):
        """Crée une copie du fichier 2 avec offset sur les IDs"""
        self.file2_with_offset = self.file2.replace('.ged', '_avec_offset.ged')
        logger.info(f"Création d'une copie avec offset de {self.file2}")
        
        with open(self.file2, 'r', encoding='utf-8') as infile, \
             open(self.file2_with_offset, 'w', encoding='utf-8') as outfile:
            
            for line in infile:
                new_line = line
                # Rechercher les IDs dans la ligne
                ids = re.findall(r'@[IF]\d+@', line)
                for old_id in ids:
                    new_id = self.generate_new_id(old_id)
                    new_line = new_line.replace(old_id, new_id)
                outfile.write(new_line)
                
        logger.info(f"Fichier créé avec offset : {self.file2_with_offset}")

    def create_merged_file(self, output_file: str):
        """Crée le fichier final fusionné"""
        # IDs à exclure du fichier 2 (avec offset)
        ids_to_exclude = set()
        for person_info in self.person_mappings.values():
            if person_info['file2_id']:
                ids_to_exclude.add(self.id_mapping[person_info['file2_id']])
                logger.info(f"\nInformation sur la personne à fusionner:")
                logger.info(f"  Personne {person_info['name']} (ID: {person_info['file2_id']})")
                logger.info(f"  Famille d'origine FAMC: {self.family_id_with_offset}")
            if person_info['spouse_file2_id']:
                ids_to_exclude.add(self.id_mapping[person_info['spouse_file2_id']])
            if person_info['sibling_file2_id']:
                ids_to_exclude.add(self.id_mapping[person_info['sibling_file2_id']])

        logger.info(f"IDs à exclure du fichier 2: {ids_to_exclude}")

        # Écrire le fichier fusionné
        with open(self.file1, 'r', encoding='utf-8') as f1, \
            open(output_file, 'w', encoding='utf-8') as out:
            
            in_person = False
            current_id = None
            
            # Copier le fichier 1 en ajoutant les nouveaux FAMC
            for line in f1:
                parts = line.strip().split(' ', 2)
                if len(parts) >= 2:
                    level = int(parts[0])
                    
                    if level == 0:
                        if len(parts) > 2 and parts[2] == 'INDI':
                            current_id = parts[1]
                            in_person = True
                        else:
                            in_person = False
                    
                    # Ajouter le nouveau FAMC après le FAMC existant
                    if in_person and '1 FAMC' in line:
                        out.write(line)
                        # Vérifier si cette personne doit avoir le nouveau FAMC
                        for person_info in self.person_mappings.values():
                            if current_id in [person_info['file1_id'], person_info['sibling_file1_id']]:
                                logger.info(f"Ajout du nouveau FAMC {self.family_id_with_offset} à {current_id}")
                                out.write(f'1 FAMC {self.family_id_with_offset}\n')
                        continue
                
                # Ne pas écrire le TRLR du fichier 1
                if not line.startswith('0 TRLR'):
                    out.write(line)
            
            # Copier le fichier 2 (avec offset) en excluant certaines personnes et en mettant à jour les liens
            skip_person = False
            current_id = None
            in_header = True
            
            in_target_family = False

            with open(self.file2_with_offset, 'r', encoding='utf-8') as f2:
                for line in f2:
                    # Gestion de l'en-tête du fichier 2
                    if in_header:
                        if '@' in line:  # Premier ID trouvé
                            in_header = False
                        else:
                            continue  # Sauter cette ligne d'en-tête
                    
                    parts = line.strip().split(' ', 2)
                    if len(parts) >= 2:
                        level = int(parts[0])
                        
                        if level == 0:
                            if len(parts) > 2 and parts[2] == 'INDI':
                                current_id = parts[1]
                                skip_person = current_id in ids_to_exclude
                                
                        if not skip_person:
                            # Mettre à jour les références dans la famille

                            # Détection de la famille cible (celle avec l'offset)
                            if line.startswith(f'0 {self.family_id_with_offset}'):
                                in_target_family = True
                                logger.info(f"Début de traitement de la famille {self.family_id_with_offset}")
                                out.write(line)
                                continue
                            elif in_target_family and line.startswith('0'):
                                in_target_family = False
                                logger.info(f"Fin de traitement de la famille {self.family_id_with_offset}")

                            if in_target_family:
                                # Si c'est une ligne CHIL, vérifier les mappings
                                if '1 CHIL' in line:
                                    for person_info in self.person_mappings.values():
                                        # ID dans le fichier 2 avec offset
                                        file2_id_with_offset = self.id_mapping[person_info['file2_id']]
                                        sibling_file2_id_with_offset = self.id_mapping[person_info['sibling_file2_id']]

                                        if file2_id_with_offset in line:
                                            new_line = line.replace(file2_id_with_offset, person_info['file1_id'])
                                            logger.info(f"Remplacement dans famille {self.family_id_with_offset}: {line.strip()} -> {new_line.strip()}")
                                            line = new_line
                                        elif sibling_file2_id_with_offset in line:
                                            new_line = line.replace(sibling_file2_id_with_offset, person_info['sibling_file1_id'])
                                            logger.info(f"Remplacement dans famille {self.family_id_with_offset}: {line.strip()} -> {new_line.strip()}")
                                            line = new_line

                            out.write(line)
            
    def process_files(self, output_file: str):
        """Traitement complet des fichiers"""
        # 1. Analyser les IDs du fichier 1 pour calculer les offsets
        self.analyze_file1_ids()
        
        # 2. Trouver les IDs des personnes dans les deux fichiers
        self.find_person_details(self.file1, True)
        self.find_person_details(self.file2, False)
        
        # Afficher les correspondances trouvées
        logger.info("\nCorrespondances trouvées :")
        for name, info in self.person_mappings.items():
            logger.info(f"\nPour {name}:")
            logger.info(f"  Fichier 1: {info['file1_id']}")
            logger.info(f"  Fichier 2: {info['file2_id']}")
            logger.info(f"  Conjoint F1: {info['spouse_file1_id']}")
            logger.info(f"  Conjoint F2: {info['spouse_file2_id']}")
            logger.info(f"  Sibling F1: {info['sibling_file1_id']}")
            logger.info(f"  Sibling F2: {info['sibling_file2_id']}")
        
        # 3. Trouver la famille dans le fichier 2
        family_id = None
        for person_info in self.person_mappings.values():
            if person_info['file2_id']:
                family_id = self.find_family(self.file2, person_info['file2_id'])
                if family_id:
                    logger.info(f"\nFamille trouvée dans fichier 2: {family_id}")
                    break
        
        if not family_id:
            logger.error("Famille non trouvée dans le fichier 2")
            return
        
        # 4. Créer la version avec offset et obtenir le nouvel ID de la famille
        self.create_offset_copy()
        self.family_id_with_offset = self.generate_new_id(family_id)
        logger.info(f"ID famille avec offset: {self.family_id_with_offset}")
        
        # 5. Créer le fichier final fusionné
        self.create_merged_file(output_file)
        logger.info(f"\nFichier final créé: {output_file}")

    def verify_person_exists(self, filename: str, name: str) -> bool:
        """Vérifie si une personne existe dans un fichier"""
        with open(filename, 'r', encoding='utf-8') as file:
            for line in file:
                if '1 NAME' in line and name in line.replace('/', ''):
                    return True
        return False

    def verify_all_persons(self, main_person: str, spouse: str, sibling: str) -> bool:
            """Vérifie que toutes les personnes existent dans les deux fichiers"""
            logger.info("\nVérification de l'existence des personnes...")
            
            # Vérifier dans le fichier 1
            logger.info("\nDans le fichier 1:")
            main_exists1 = self.verify_person_exists(self.file1, main_person)
            spouse_exists1 = self.verify_person_exists(self.file1, spouse)
            sibling_exists1 = self.verify_person_exists(self.file1, sibling)
            
            logger.info(f"  {main_person}: {'trouvé' if main_exists1 else 'NON TROUVÉ'}")
            logger.info(f"  {spouse}: {'trouvé' if spouse_exists1 else 'NON TROUVÉ'}")
            logger.info(f"  {sibling}: {'trouvé' if sibling_exists1 else 'NON TROUVÉ'}")
            
            # Vérifier dans le fichier 2
            logger.info("\nDans le fichier 2:")
            main_exists2 = self.verify_person_exists(self.file2, main_person)
            spouse_exists2 = self.verify_person_exists(self.file2, spouse)
            sibling_exists2 = self.verify_person_exists(self.file2, sibling)
            
            logger.info(f"  {main_person}: {'trouvé' if main_exists2 else 'NON TROUVÉ'}")
            logger.info(f"  {spouse}: {'trouvé' if spouse_exists2 else 'NON TROUVÉ'}")
            logger.info(f"  {sibling}: {'trouvé' if sibling_exists2 else 'NON TROUVÉ'}")
            
            # Vérifier que toutes les personnes sont présentes dans les deux fichiers
            all_exist = main_exists1 and main_exists2 and spouse_exists1 and spouse_exists2 and sibling_exists1 and sibling_exists2
            
            if not all_exist:
                logger.error("\nERREUR: Certaines personnes n'ont pas été trouvées dans les deux fichiers!")
                
                if not (main_exists1 and main_exists2):
                    logger.error(f"- {main_person} doit être présent dans les deux fichiers")
                if not (spouse_exists1 and spouse_exists2):
                    logger.error(f"- {spouse} doit être présent dans les deux fichiers")
                if not (sibling_exists1 and sibling_exists2):
                    logger.error(f"- {sibling} doit être présent dans les deux fichiers")
                    
            return all_exist

def main():
    file1 = "C:/Users/xxx/xxx/gedcom1.ged"
    # file2 = "C:/Users/patri/Documents/arbre_genealogique/damijo_2025-01-29/arbreHoueClaudeIA.ged"
    file2 = "C:/Users/xxx/xxx/gedcom2.ged"
    output_file = "C:/Users/xxx/xxx/gedcomMerged.ged"

    while True:
        # main_person = input("\nEntrez le nom de la personne principale : ")
        # spouse = input("Entrez le nom de son conjoint : ")
        # sibling = input("Entrez le nom de son frère/sa soeur : ")
        main_person = 'Henriette xxx'
        spouse = 'Georges xxxx'
        sibling = 'Berthe xxxx'        
        merger = GedcomMerger(file1, file2, main_person, spouse, sibling)
        
        # Vérifier l'existence des personnes
        if merger.verify_all_persons(main_person, spouse, sibling):
            logger.info("\nToutes les personnes ont été trouvées. Début du traitement...")
            merger.process_files(output_file)
            break
        else:
            retry = input("\nVoulez-vous réessayer avec d'autres noms ? (o/n) : ")
            if retry.lower() != 'o':
                logger.info("Opération annulée.")
                break

if __name__ == "__main__":
    main()