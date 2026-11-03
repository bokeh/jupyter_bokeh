from bokeh.plotting import figure

from jupyter_bokeh import BokehModel, _jupyter_labextension_paths, _jupyter_nbextension_paths


def test_extension_paths():
    assert _jupyter_labextension_paths() == [
        {"src": "labextension", "dest": "@bokeh/jupyter_bokeh"},
    ]
    assert _jupyter_nbextension_paths() == [
        {
            "section": "notebook",
            "src": "nbextension",
            "dest": "jupyter_bokeh",
            "require": "jupyter_bokeh/extension",
        },
    ]


def test_model_serialization():
    model = figure()
    bundle = BokehModel._model_to_traits(model)
    assert model.document is not None
    assert model in model.document.roots
    render_item, = bundle["render_items"]
    assert render_item["docid"] in bundle["docs_json"]
    assert model.id in render_item["roots"]
    assert render_item["roots"][model.id] in bundle["div"]
