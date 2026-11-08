import pytest

from bokeh.models import RadioGroup, Slider

from jupyter_bokeh import BokehModel


@pytest.mark.parametrize(("model", "attr", "values"), [
    (RadioGroup(labels=["A", "B", "C"], active=0), "active", [0, 1, 2]),
    (Slider(start=0, end=10, value=1), "value", [1, 2, 3]),
])
def test_browser_changes_dispatch_callbacks_once(model, attr, values):
    calls = []

    def callback(attr, old, new):
        calls.append((attr, old, new))

    model.on_change(attr, callback)
    widget = BokehModel(model)
    document = model.document
    try:
        for old, value in zip(values, values[1:]):
            calls.clear()
            widget._sync_model(widget, {
                "event": "jsevent",
                "kind": "ModelChanged",
                "model": {"id": model.id},
                "attr": attr,
                "new": value,
            }, [])
            assert getattr(model, attr) == value
            assert calls == [(attr, old, value)]
    finally:
        widget.close()
        document.remove_root(model)
