def _jupyter_nbextension_paths():
    return [{
        'section': 'notebook',
        'src': 'lib',
        'dest': 'jupyterlab_bokeh',
        'require': 'jupyterlab_bokeh/index'
    }]
