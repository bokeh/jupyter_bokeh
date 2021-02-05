import os
import json

HERE = os.path.abspath(os.path.dirname(__file__))

with open(os.path.join(HERE, 'package.json')) as fid:
    data = json.load(fid)

def _jupyter_labextension_paths():
    return [{
        'src': 'labextension',
        'dest': data['name']
    }]

