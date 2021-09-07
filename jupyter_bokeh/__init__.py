import json

from pathlib import Path

from ._version import __version__

HERE = Path(__file__).parent.resolve()

from .widgets import BokehModel
with (HERE / "labextension" / "package.json").open() as fid:
    data = json.load(fid)

def _jupyter_labextension_paths():
    return [{
        "src": "labextension",
        "dest": data["name"]
    }]

def _jupyter_nbextension_paths():
    return [{
        "section": "notebook",
        "src": "nbextension/static",
        "dest": "jupyter_bokeh",
        "require": "jupyter_bokeh/extension",
    }]
