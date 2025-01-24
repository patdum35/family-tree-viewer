# from app import GenealogyViewer
# import os
# import shutil
# import json

# def build_static():
#     app = GenealogyViewer()
    
#     os.makedirs('build', exist_ok=True)
    
#     # Copie fichier de données
#     shutil.copy2('arbre.enc', 'build/')
    
#     # Génère index.html avec tous les composants
#     html = app.app.index()
    
#     # Sauvegarde
#     with open('build/index.html', 'w', encoding='utf-8') as f:
#         f.write(html)

# if __name__ == '__main__':
#     build_static()


########################################

# from app import GenealogyViewer
# import os
# import shutil

# def build_static():
#     app = GenealogyViewer()
    
#     os.makedirs('build', exist_ok=True)
    
#     # Copie fichier de données
#     shutil.copy2('arbre.enc', 'build/')
    
#     # Génération HTML statique complète
#     static_html = f"""
#     <!DOCTYPE html>
#     <html lang="fr">
#     <head>
#         <meta charset="UTF-8">
#         <title>Arbre Généalogique</title>
#         <script src="https://unpkg.com/dash-html-components@2.0.0/dash_html_components/bundle.js"></script>
#         <script src="https://unpkg.com/dash-core-components@2.0.0/dash_core_components/bundle.js"></script>
#         <script src="https://unpkg.com/dash-cytoscape@0.3.0/dash_cytoscape/bundle.js"></script>
#         <link rel="stylesheet" href="https://codepen.io/chriddyp/pen/bWLwgP.css">
#     </head>
#     <body>
#         {app.app.layout}
#         <script>
#             // Ajoutez ici tout script nécessaire pour l'interactivité
#         </script>
#     </body>
#     </html>
#     """
    
#     # Sauvegarde
#     with open('build/index.html', 'w', encoding='utf-8') as f:
#         f.write(static_html)
    
#     print("Fichiers dans build:", os.listdir('build'))

# if __name__ == '__main__':
#     build_static()

#######################################

from app import GenealogyViewer
import os
import shutil

def build_static():
    os.makedirs('build', exist_ok=True)
    
    # Copie fichier de données
    shutil.copy2('arbre.enc', 'build/')
    
    # Instance de l'application
    app = GenealogyViewer()
    
    # Générer un fichier HTML minimal
    html_content = f"""
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <title>Arbre Généalogique</title>
        <script src="https://unpkg.com/dash@2.13.0/dash.min.js"></script>
        <script src="https://unpkg.com/dash-html-components@2.0.0/dash_html_components/bundle.js"></script>
        <script src="https://unpkg.com/dash-core-components@2.0.0/dash_core_components/bundle.js"></script>
        <script src="https://unpkg.com/dash-cytoscape@0.3.0/dash_cytoscape/bundle.js"></script>
    </head>
    <body>
        {str(app.app.layout)}
    </body>
    </html>
    """
    
    with open('build/index.html', 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print("Fichiers dans build:", os.listdir('build'))

if __name__ == '__main__':
    build_static()



