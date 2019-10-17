def _jupyter_nbextension_paths():
    return [{
        "section": "notebook",
        "src": "nbextension/static",
        "dest": "jupyterlab_bokeh",
        "require": "jupyterlab_bokeh/extension",
    }]
