def add_source_to_gedcom(input_file, output_file, comment):
    with open(input_file, 'r', encoding='utf-8') as gedcom_file:
        lines = gedcom_file.readlines()

    with open(output_file, 'w', encoding='utf-8') as output_gedcom:
        for line in lines:
            output_gedcom.write(line)
            if line.startswith('0 @I') and line.strip().endswith('INDI'):
                # Ajouter le commentaire SOUR après chaque individu
                output_gedcom.write(f"1 SOUR {comment}\n")

# Paramètres
# input_gedcom = 'votre_fichier.ged'  # Remplacez par le chemin de votre fichier GEDCOM
# output_gedcom = 'votre_fichier_modifie.ged'  # Le fichier de sortie
# commentaire = "Votre commentaire ici"  # Le commentaire à ajouter dans le champ SOUR

# Chemin vers votre fichier GEDCOM
input_gedcom = "C:/Users/xxx/xxx/gedcom.ged"
output_gedcom = "C:/Users/xxx/xxx/gedcom_new.ged"
# Commentaire à ajouter dans le champ SOUR ( quand on récupère le fichier gedcom d'une autre personne pour mettre le lien sur sa référence geneanet.org)
commentaire = "Arbre Geneanet xxxx (https://gw.geneanet.org/xxxx)"



# Exécuter la fonction
add_source_to_gedcom(input_gedcom, output_gedcom, commentaire)

print(f"Le fichier GEDCOM modifié a été enregistré sous : {output_gedcom}")