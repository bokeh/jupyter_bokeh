import pytest

from bokeh.layouts import column
from bokeh.plotting import figure

from jupyter_bokeh import BokehModel


def _capture_sent(widget):
    sent = []
    widget.send = lambda content, buffers=None: sent.append(content)
    return sent


def test_close_twice():
    widget = BokehModel(figure())
    widget.close()
    widget.close()


def test_update_from_model_stops_syncing_previous_document():
    old_model = figure()
    new_model = figure()
    widget = BokehModel(old_model)
    sent = _capture_sent(widget)

    widget.update_from_model(new_model)
    old_model.title.text = "old"
    assert sent == []

    new_model.title.text = "new"
    assert len(sent) > 0


def test_close_after_update_from_model_releases_previous_document():
    old_model = figure()
    new_model = figure()
    widget = BokehModel(old_model)
    widget.update_from_model(new_model)
    widget.close()
    sent = _capture_sent(widget)

    old_model.title.text = "old"
    new_model.title.text = "new"
    assert sent == []


def test_failed_model_update_keeps_previous_model_and_document():
    model = figure()
    widget = BokehModel(model)
    sent = _capture_sent(widget)
    bundle = widget.render_bundle

    with pytest.raises(RuntimeError, match="Models must be owned by only a single document"):
        widget.update_from_model(column(model))

    assert widget._model is model
    assert widget.render_bundle is bundle
    model.title.text = "Still synchronized"
    assert any("Still synchronized" in message.get("payload", "") for message in sent)
