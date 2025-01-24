from app import GenealogyViewer
import os
import shutil
import json

def build_static():
    app = GenealogyViewer()
    
    os.makedirs('build', exist_ok=True)
    
    # Copie fichier de données
    shutil.copy2('arbre.enc', 'build/')
    
    # Génère index.html avec tous les composants
    html = app.app.index()
    
    # Sauvegarde
    with open('build/index.html', 'w', encoding='utf-8') as f:
        f.write(html)

if __name__ == '__main__':
    build_static()