import logging
from typing import Dict, Set, List, Tuple

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GedcomProcessor:
    def __init__(self, input_file: str):
        self.individuals = {}
        self.families = {}
        self.input_file = input_file
        self.header_content = []
        
    def read_gedcom(self):
        """Lit le fichier GEDCOM et stocke les informations"""
        logger.info("Début de la lecture du fichier GEDCOM")
        
        current_record = None
        current_type = None
        in_header = False
        
        with open(self.input_file, 'r', encoding='utf-8') as file:
            for line in file:
                parts = line.strip().split(' ', 2)
                level = int(parts[0])
                tag = parts[1]
                
                # Gestion des enregistrements de niveau 0
                if level == 0:
                    if tag == 'HEAD':
                        in_header = True
                        self.header_content = [line]
                        continue
                    elif in_header:
                        in_header = False
                        self.header_content.append(line)
                        continue
                    
                    # Nouvel enregistrement
                    if len(parts) > 2:
                        current_record = tag
                        if parts[2] == 'INDI':
                            current_type = 'INDI'
                            self.individuals[current_record] = {
                                'id': current_record,
                                'name': '',
                                'famc': [],
                                'fams': [],
                                'content': [line]
                            }
                        elif parts[2] == 'FAM':
                            current_type = 'FAM'
                            self.families[current_record] = {
                                'id': current_record,
                                'husb': '',
                                'wife': '',
                                'chil': [],
                                'content': [line]
                            }
                    else:
                        current_record = None
                        current_type = None
                        
                # Gestion des lignes de l'en-tête
                elif in_header:
                    self.header_content.append(line)
                    continue
                    
                # Gestion des lignes de contenu
                elif current_record:
                    if current_type == 'INDI':
                        self.individuals[current_record]['content'].append(line)
                        if tag == 'NAME' and len(parts) > 2:
                            self.individuals[current_record]['name'] = parts[2].replace('/', '')
                        elif tag == 'FAMC' and len(parts) > 2:
                            self.individuals[current_record]['famc'].append(parts[2])
                        elif tag == 'FAMS' and len(parts) > 2:
                            self.individuals[current_record]['fams'].append(parts[2])
                    elif current_type == 'FAM':
                        self.families[current_record]['content'].append(line)
                        if tag == 'HUSB' and len(parts) > 2:
                            self.families[current_record]['husb'] = parts[2]
                        elif tag == 'WIFE' and len(parts) > 2:
                            self.families[current_record]['wife'] = parts[2]
                        elif tag == 'CHIL' and len(parts) > 2:
                            self.families[current_record]['chil'].append(parts[2])

    def find_person(self, name: str) -> List[Tuple[str, str]]:
        """Trouve une personne par son nom"""
        candidates = []
        for id, person in self.individuals.items():
            if person['name']:
                person_name_parts = person['name'].lower().split()
                name_parts = name.lower().split()
                
                if all(part in " ".join(person_name_parts) for part in name_parts):
                    candidates.append((id, person['name']))
        return candidates

    def collect_ancestors_and_families(self, person_id: str) -> Tuple[Set[str], Set[str]]:
        """Collecte tous les ancêtres et leurs familles associées"""
        ancestors = set()
        family_ids = set()
        
        def add_ancestor_and_family(pid: str):
            if pid not in ancestors and pid in self.individuals:
                ancestors.add(pid)
                person = self.individuals[pid]
                
                # Collecter les familles où la personne est enfant
                for fam_id in person['famc']:
                    if fam_id in self.families:
                        family = self.families[fam_id]
                        family_ids.add(fam_id)
                        
                        # Ajouter les parents
                        if family['husb']:
                            add_ancestor_and_family(family['husb'])
                        if family['wife']:
                            add_ancestor_and_family(family['wife'])
                
                # Collecter les familles où la personne est parent
                for fam_id in person['fams']:
                    if fam_id in self.families:
                        family_ids.add(fam_id)
        
        # Commencer avec la personne initiale
        add_ancestor_and_family(person_id)
        
        # S'assurer que tous les membres des familles sont inclus
        families_to_process = list(family_ids)
        for fam_id in families_to_process:
            family = self.families[fam_id]
            # Ajouter les époux
            if family['husb'] and family['husb'] in self.individuals:
                ancestors.add(family['husb'])
            if family['wife'] and family['wife'] in self.individuals:
                ancestors.add(family['wife'])
            # Ajouter les enfants
            for child_id in family['chil']:
                if child_id in self.individuals:
                    ancestors.add(child_id)
                    # Ajouter les familles des enfants
                    child = self.individuals[child_id]
                    for child_fam in child['fams']:
                        if child_fam in self.families:
                            family_ids.add(child_fam)
        
        logger.info(f"Nombre d'individus collectés : {len(ancestors)}")
        logger.info(f"Nombre de familles collectées : {len(family_ids)}")
        return ancestors, family_ids

    def write_ancestry_gedcom(self, person_id: str, output_file: str):
        """Écrit le fichier GEDCOM avec les ancêtres"""
        ancestors, family_ids = self.collect_ancestors_and_families(person_id)
        
        with open(output_file, 'w', encoding='utf-8') as out:
            # Écrire l'en-tête
            for line in self.header_content:
                out.write(line)
                
            # Écrire les individus
            for indi_id in sorted(ancestors):
                for line in self.individuals[indi_id]['content']:
                    out.write(line)
                    
            # Écrire les familles
            for fam_id in sorted(family_ids):
                for line in self.families[fam_id]['content']:
                    out.write(line)
            
            # Écrire le trailer
            out.write('0 TRLR\n')
        
        logger.info(f"Fichier GEDCOM créé : {output_file}")
        logger.info(f"Nombre d'individus écrits : {len(ancestors)}")
        logger.info(f"Nombre de familles écrites : {len(family_ids)}")

def main():

    input_file = "C:/Users/xxx/xxx/gedcom.ged"
    output_file = "C:/Users/xxx/xxx/gedcom_new.ged"
    start_name = 'Henriette xxx'

    processor = GedcomProcessor(input_file)
    processor.read_gedcom()

    candidates = processor.find_person(start_name)
    if not candidates:
        logger.error("Personne non trouvée")
        return
        
    if len(candidates) > 1:
        print("\nPlusieurs personnes trouvées:")
        for i, (id, name) in enumerate(candidates):
            print(f"{i+1}. {name}")
        choice = int(input("Choisissez le numéro de la personne : ")) - 1
        person_id = candidates[choice][0]
    else:
        person_id = candidates[0][0]

    processor.write_ancestry_gedcom(person_id, output_file)
    print(f"Fichier GEDCOM créé : {output_file}")

if __name__ == "__main__":
    main()