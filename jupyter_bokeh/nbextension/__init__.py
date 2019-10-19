def _jupyter_nbextension_paths():
    return [{
        "section": "notebook",
        "src": "nbextension/static",
        "dest": "jupyter_bokeh",
        "require": "jupyter_bokeh/extension",
    }]
