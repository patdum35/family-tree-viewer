import dash
from dash import html, dcc, Input, Output, State
import dash_cytoscape as cyto
from dash import Dash
from pathlib import Path
import base64
import zlib
import hashlib
import os




# Enregistrer le layout dagre
cyto.load_extra_layouts()


class GenealogyViewer:
    def __init__(self):
        self.app = dash.Dash(__name__)
        self.app.layout = html.Div([
            html.Div([
                dcc.Input(id='password-input', type='password', placeholder='Mot de passe', value=''),
                html.Button('Voir arbre', id='submit-button', n_clicks=0),
                html.Div([
                    html.Button('Zoom +', id='zoom-in'),
                    html.Button('Zoom -', id='zoom-out'),
                    dcc.Input(id='search', placeholder='Rechercher...')
                ], id='controls')
            ]),
            cyto.Cytoscape(
                id='tree',
                style={'width': '100%', 'height': '90vh'},
                layout={
                    'name': 'breadthfirst',
                    'rankDir': 'TB',
                    'spacingFactor': 1.5
                },
                stylesheet=[
                    {
                        'selector': 'node',
                        'style': {
                            'content': 'data(label)',
                            'text-wrap': 'wrap',
                            'text-valign': 'center',
                            'text-halign': 'center',
                            'background-color': 'white',
                            'border-color': '#666',
                            'border-width': 2,
                            'width': 150,
                            'height': 50,
                            'font-size': '10px'
                        }
                    },
                    {
                        'selector': 'edge',
                        'style': {
                            'curve-style': 'bezier',
                            'target-arrow-shape': 'triangle',
                            'width': 1
                        }
                    }
                ]
            )
        ])
        self.setup_callbacks()

    def decrypt_data(self, encrypted_data, password):
        decoded = base64.b64decode(encrypted_data)
        key = password.encode() * (len(decoded) // len(password) + 1)
        decrypted = bytes(a ^ b for a, b in zip(decoded, key[:len(decoded)]))
        return zlib.decompress(decrypted[8:]).decode()


    def parse_gedcom(self, content):
        individuals = {}
        families = {}
        current_id = None
        current_fam = None
        
        for line in content.split('\n'):
            line = line.strip()
            if not line:
                continue
            
            parts = line.split(' ', 2)
            if len(parts) < 2:
                continue
            
            level, tag = parts[0], parts[1]
            value = parts[2] if len(parts) > 2 else ''
            
            if level == '0':
                # Réinitialiser les ID
                if tag.startswith('@I'):
                    current_id = tag
                    individuals[current_id] = {'name': '', 'families': []}
                elif tag.startswith('@F'):
                    current_fam = tag
                    families[current_fam] = {'parents': [], 'children': []}
            
            elif tag == 'NAME' and current_id:
                individuals[current_id]['name'] = value.replace('/', '')
            
            elif current_fam:
                if tag == 'HUSB':
                    families[current_fam]['parents'].append(value)
                elif tag == 'WIFE':
                    families[current_fam]['parents'].append(value)
                elif tag == 'CHIL':
                    families[current_fam]['children'].append(value)

        # Créer les nœuds
        nodes = [{'data': {'id': k, 'label': v['name']}} for k, v in individuals.items()]
        
        # Créer les arêtes
        edges = []
        for fam in families.values():
            for parent in fam['parents']:
                for child in fam['children']:
                    edges.append({
                        'data': {
                            'source': parent,
                            'target': child
                        }
                    })

        return nodes, edges


    def setup_callbacks(self):
        @self.app.callback(
            [Output('tree', 'elements'),
             Output('controls', 'style')],
            Input('submit-button', 'n_clicks'),
            State('password-input', 'value')
        )
        def update_output(n_clicks, password):
            if not n_clicks:
                return [], {'display': 'none'}
            
            try:
                with open('arbre.enc', 'r') as f:
                    encrypted_data = f.read()
                gedcom_content = self.decrypt_data(encrypted_data, password)
                nodes, edges = self.parse_gedcom(gedcom_content)
                elements = nodes + edges
                return elements, {'display': 'block'}
            except Exception as e:
                print(f"Erreur: {str(e)}")
                return [], {'display': 'none'}

    def run(self):
        self.app.run_server(debug=True)


if __name__ == '__main__':
    app = GenealogyViewer()
    app.run()