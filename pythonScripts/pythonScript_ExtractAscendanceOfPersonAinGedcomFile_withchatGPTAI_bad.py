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
        with open(self.input_file, 'r', encoding='utf-8') as file:
            current_record = None
            for line in file:
                parts = line.strip().split(' ', 2)
                level = int(parts[0])
                tag = parts[1]
                
                if level == 0:
                    if tag.startswith('@I'):
                        current_record = {'id': tag, 'name': '', 'famc': [], 'fams': [], 'valid': False}
                        self.individuals[tag] = current_record
                    elif tag.startswith('@F'):
                        current_record = {'id': tag, 'husb': '', 'wife': '', 'chil': []}
                        self.families[tag] = current_record
                elif current_record is not None:
                    if tag == 'NAME' and len(parts) > 2:
                        current_record['name'] = parts[2].replace('/', '')
                        current_record['valid'] = True
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
        
        # Log des individus sans nom
        for ind_id, ind in self.individuals.items():
            if not ind['valid']:
                logger.warning(f"Individu sans nom détecté : {ind_id}")
    
    def get_ancestors(self, person_id, ancestors=None, families=None):
        if ancestors is None:
            ancestors = set()
        if families is None:
            families = set()
        
        if person_id in ancestors:
            return ancestors, families
        
        ancestors.add(person_id)
        person = self.individuals.get(person_id)
        if not person:
            return ancestors, families
        
        for fam_id in person['famc']:
            if fam_id in self.families:
                families.add(fam_id)
                family = self.families[fam_id]
                if family['husb']:
                    self.get_ancestors(family['husb'], ancestors, families)
                if family['wife']:
                    self.get_ancestors(family['wife'], ancestors, families)
        
        return ancestors, families

    def create_ancestor_gedcom(self, start_name, output_file):
        logger.info(f"Création du fichier GEDCOM contenant l'ascendance de {start_name}")
        person_id = next((id for id, p in self.individuals.items() if p['name'].lower() == start_name.lower()), None)
        if not person_id:
            logger.error(f"Personne '{start_name}' non trouvée")
            return
        
        ancestors, families_to_include = self.get_ancestors(person_id)
        ancestors = {ind for ind in ancestors if self.individuals[ind]['valid']}  # Supprimer les individus sans nom
        
        valid_families = {fam for fam in families_to_include if any(ind in ancestors for ind in self.families[fam]['chil'])}
        
        logger.info("Individus retenus pour le fichier GEDCOM :")
        for ind in ancestors:
            logger.info(f"- {self.individuals[ind]['name']} ({ind})")
        
        with open(output_file, 'w', encoding='utf-8') as outfile:
            outfile.write("0 HEAD\n")
            outfile.write("1 SOUR CustomGEDCOMExtractor\n")
            outfile.write("2 NAME CustomGEDCOM\n")
            outfile.write("2 VERS 1.0\n")
            outfile.write("1 GEDC\n")
            outfile.write("2 VERS 5.5.1\n")
            outfile.write("2 FORM LINEAGE-LINKED\n")
            outfile.write("1 CHAR UTF-8\n")
            
            with open(self.input_file, 'r', encoding='utf-8') as infile:
                include = False
                for line in infile:
                    parts = line.strip().split(' ', 2)
                    level = int(parts[0])
                    tag = parts[1]
                    
                    if level == 0 and len(parts) > 2:
                        include = (parts[1].startswith('@I') and parts[1] in ancestors) or \
                                  (parts[1].startswith('@F') and parts[1] in valid_families)
                    if include:
                        outfile.write(line)
            
            outfile.write("0 TRLR\n")  # Ajout d'une ligne de terminaison GEDCOM
        
        logger.info(f"Fichier GEDCOM généré : {output_file}")




def main():
    # input_file = "mon_fichier.ged"
    # output_file = "mon_fichier_ascendance.ged"
    # start_name = "Nom de la personne"
    
    input_file = "C:/Users/xxx/xxx/gedcom.ged"
    output_file = "C:/Users/xxx/xxx/gedcom_new.ged"
    start_name = 'Henriette xxx'


    processor = GedcomProcessor(input_file)
    processor.read_gedcom()
    processor.create_ancestor_gedcom(start_name, output_file)

if __name__ == "__main__":
    main()
