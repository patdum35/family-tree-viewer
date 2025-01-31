#
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GedcomProcessor:
    def __init__(self, input_file: str):
        self.individuals = {}
        self.families = {}
        self.input_file = input_file
        
    def read_gedcom(self):
        logger.info("Début de la lecture du fichier GEDCOM")
        current_type = None
        current_id = None
        current_record = None
        nb_individuals = 0
        nb_families = 0

        with open(self.input_file, 'r', encoding='utf-8') as file:
            for line in file:
                parts = line.strip().split(' ', 2)
                level = int(parts[0])
                tag = parts[1]
                
                if level == 0:
                    if tag.startswith('@I') or tag.startswith('@F'):
                        current_id = tag
                        current_type = 'INDI' if tag.startswith('@I') else 'FAM'
                        
                        if current_type == 'INDI':
                            current_record = {'id': current_id, 'name': '', 'famc': [], 'fams': []}
                            self.individuals[current_id] = current_record
                            nb_individuals += 1
                        elif current_type == 'FAM':
                            current_record = {'id': current_id, 'husb': '', 'wife': '', 'chil': []}
                            self.families[current_id] = current_record
                            nb_families += 1
                            
                elif current_record is not None:
                    if tag == 'NAME' and len(parts) > 2:
                        current_record['name'] = parts[2].replace('/', '')
                        logger.debug(f"Nom lu: {current_record['name']} (ID: {current_id})")
                    elif tag == 'FAMC' and len(parts) > 2:
                        current_record['famc'].append(parts[2])
                    elif tag == 'FAMS' and len(parts) > 2:
                        current_record['fams'].append(parts[2])
                    elif tag == 'HUSB' and len(parts) > 2:
                        current_record['husb'] = parts[2]
                    elif tag == 'WIFE' and len(parts) > 2:
                        current_record['wife'] = parts[2]
                    elif tag == 'CHIL' and len(parts) > 2:
                        current_record['chil'].append(parts[2])

        logger.info(f"Lecture terminée : {nb_individuals} individus, {nb_families} familles")

    def find_path(self, start_name: str, end_name: str):
        logger.info(f"Recherche du chemin entre '{start_name}' et '{end_name}'")
        
        # Recherche plus flexible des personnes
        start_candidates = []
        end_candidates = []
        for id, person in self.individuals.items():
            person_name_parts = person['name'].lower().split()
            start_name_parts = start_name.lower().split()
            end_name_parts = end_name.lower().split()
            
            if all(part in " ".join(person_name_parts) for part in start_name_parts):
                start_candidates.append((id, person['name']))
            if all(part in " ".join(person_name_parts) for part in end_name_parts):
                end_candidates.append((id, person['name']))
        
        logger.info(f"Candidats trouvés pour '{start_name}': {start_candidates}")
        logger.info(f"Candidats trouvés pour '{end_name}': {end_candidates}")
        
        if not start_candidates or not end_candidates:
            logger.error("Une ou les deux personnes n'ont pas été trouvées")
            return None
        
        # Recherche du chemin
        path = None
        for start_id, start_full_name in start_candidates:
            for end_id, end_full_name in end_candidates:
                logger.info(f"Tentative de recherche de chemin entre {start_full_name} et {end_full_name}")
                path = self.find_path_between_people(start_id, end_id)
                if path:
                    logger.info("Chemin trouvé!")
                    logger.info("Chemin complet:")
                    for person_id in path:
                        logger.info(f"- {self.individuals[person_id]['name']}")
                    return path
        
        logger.error("Aucun chemin trouvé entre les personnes")
        return None

    def find_path_between_people(self, start_id, end_id, visited=None, depth=0):
        if visited is None:
            visited = set()
        
        if start_id in visited:
            return None
        
        visited.add(start_id)
        current_person = self.individuals[start_id]
        
        if start_id == end_id:
            return [start_id]
        
        # Chercher dans les ancêtres
        for fam_id in current_person['famc']:
            family = self.families[fam_id]
            
            # Vérifier le père
            if family['husb']:
                path = self.find_path_between_people(family['husb'], end_id, visited.copy(), depth+1)
                if path:
                    return [start_id] + path
            
            # Vérifier la mère
            if family['wife']:
                path = self.find_path_between_people(family['wife'], end_id, visited.copy(), depth+1)
                if path:
                    return [start_id] + path
        
        # Chercher dans les descendants
        for fam_id in current_person['fams']:
            family = self.families[fam_id]
            for child_id in family['chil']:
                if child_id not in visited:
                    path = self.find_path_between_people(child_id, end_id, visited.copy(), depth+1)
                    if path:
                        return [start_id] + path
        
        return None

    def create_subset_gedcom(self, path, output_file):
        """Crée un nouveau fichier GEDCOM avec les personnes du chemin et leurs informations liées"""
        logger.info(f"Création du fichier GEDCOM pour {len(path)} personnes")
        
        # Collecter tous les IDs à inclure
        ids_to_include = set(path)
        families_to_include = set()
        
        # Collecter les familles et conjoints
        for person_id in path:
            person = self.individuals[person_id]
            # Ajouter toutes les familles liées
            families_to_include.update(person['famc'])
            families_to_include.update(person['fams'])
            
            # Pour chaque famille, ajouter les conjoints et enfants
            for fam_id in person['fams'] + person['famc']:
                if fam_id in self.families:
                    family = self.families[fam_id]
                    if family['husb']:
                        ids_to_include.add(family['husb'])
                    if family['wife']:
                        ids_to_include.add(family['wife'])
                    ids_to_include.update(family['chil'])
        
        logger.info(f"Personnes à inclure : {len(ids_to_include)}")
        logger.info(f"Familles à inclure : {len(families_to_include)}")
        
        # Écrire le nouveau fichier
        with open(self.input_file, 'r', encoding='utf-8') as infile, \
             open(output_file, 'w', encoding='utf-8') as outfile:
            
            current_record = None
            include_record = True
            header_written = False
            
            for line in infile:
                parts = line.strip().split(' ', 2)
                level = int(parts[0])
                tag = parts[1]
                
                # Gérer l'en-tête
                if not header_written and level == 0 and tag == 'HEAD':
                    include_record = True
                    header_written = True
                # Gérer les individus et familles
                elif level == 0 and len(parts) > 2:
                    if tag.startswith('@I'):
                        include_record = tag in ids_to_include
                    elif tag.startswith('@F'):
                        include_record = tag in families_to_include
                    else:
                        include_record = True  # Autres types d'enregistrements
                
                if include_record:
                    outfile.write(line)
        
        logger.info(f"Fichier GEDCOM créé : {output_file}")

def main():
    input_file = "C:/Users/xxx/xxx/gedcom.ged"
    output_file = "C:/Users/xxx/xxx/gedcom_new.ged"
    # output_file = input("Entrez le nom du fichier GEDCOM de sortie: ")
    # start_name = input("Entrez le nom de la première personne: ")
    # end_name = input("Entrez le nom de la deuxième personne: ")

    # Utilisation
    processor = GedcomProcessor(input_file)    
    processor.read_gedcom()


    # Test avec deux personnes spécifiques
    start_name = "Emma xxx"
    end_name = "Guillaume xxx"  # 



    path = processor.find_path(start_name, end_name)
    if path:

        processor.create_subset_gedcom(path, output_file)
    else:
        logger.error("Impossible de créer le sous-ensemble GEDCOM car aucun chemin n'a été trouvé")

if __name__ == "__main__":
    main()