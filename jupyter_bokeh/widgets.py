#-----------------------------------------------------------------------------
# Copyright (c) 2012 - 2021, Anaconda, Inc., and Bokeh Contributors.
# All rights reserved.
#
# The full license is in the file LICENSE.txt, distributed with this software.
#-----------------------------------------------------------------------------
"""
Defines a Bokeh model wrapper for Jupyter notebook/lab, which renders Bokeh models
and performs bi-directional syncing just like bokeh server does.

"""

#-----------------------------------------------------------------------------
# Boilerplate
#-----------------------------------------------------------------------------
from __future__ import annotations

# Standard library imports
import json
from typing import TYPE_CHECKING, Any, TypedDict

# External imports
from ipywidgets import DOMWidget
from traitlets import Bool, Dict, Unicode

# Bokeh imports
from bokeh.core.json_encoder import serialize_json
from bokeh.document import Document
from bokeh.embed.elements import div_for_render_item
from bokeh.embed.util import standalone_docs_json_and_render_items
from bokeh.events import Event
from bokeh.models import LayoutDOM
from bokeh.protocol import Protocol
from bokeh.util.dependencies import import_optional

from ._version import __version__

if TYPE_CHECKING:
    from bokeh.core.types import ID
    from bokeh.document.events import DocumentPatchedEvent
    from bokeh.document.json import DocJson
    from bokeh.model import Model

#-----------------------------------------------------------------------------
# Globals and constants
#-----------------------------------------------------------------------------

__all__ = (
    "BokehModel",
)

_module_name = "@bokeh/jupyter_bokeh"
_module_version = "^" + str(__version__)

#-----------------------------------------------------------------------------
# General API
#-----------------------------------------------------------------------------

class RenderBundle(TypedDict):

    docs_json: dict[ID, DocJson]
    render_items: list[dict[str, Any]] # TODO: list[RenderItemJson]
    div: str

class BokehModel(DOMWidget):

    _model_name = Unicode("BokehModel").tag(sync=True)
    _model_module = Unicode(_module_name).tag(sync=True)
    _model_module_version = Unicode(_module_version).tag(sync=True)

    _view_name = Unicode("BokehView").tag(sync=True)
    _view_module = Unicode(_module_name).tag(sync=True)
    _view_module_version = Unicode(_module_version).tag(sync=True)

    combine_events = Bool(False).tag(sync=True)
    render_bundle = Dict().tag(sync=True, to_json=lambda obj, _: serialize_json(obj))

    _model: Model

    @property
    def _document(self) -> Document | None:
        return self._model.document

    def __init__(self, model: LayoutDOM, **kwargs: Any) -> None:
        assert isinstance(model, LayoutDOM)
        self.update_from_model(model)
        super(BokehModel, self).__init__(**kwargs)
        self.on_msg(self._sync_model)

    def close(self) -> None:
        super().close()
        if self._document is not None:
            self._document.remove_on_change(self)

    @classmethod
    def _model_to_traits(cls, model: Model) -> RenderBundle:
        if model.document is None:
            document = Document()
            document.add_root(model)
        (docs_json, [render_item]) = standalone_docs_json_and_render_items([model], suppress_callback_warning=True)
        render_bundle = RenderBundle(
            docs_json=docs_json,
            render_items=[render_item.to_json()],
            div=div_for_render_item(render_item),
        )
        return render_bundle

    def update_from_model(self, model: Model) -> None:
        self._model = model
        self.render_bundle = self._model_to_traits(model)
        self._document.on_change_dispatch_to(self)

    def _document_patched(self, event: DocumentPatchedEvent) -> None:
        if event.setter is self:
            return
        msg = Protocol().create("PATCH-DOC", [event])

        self.send({"msg": "patch", "payload": msg.header_json})
        self.send({"msg": "patch", "payload": msg.metadata_json})
        self.send({"msg": "patch", "payload": msg.content_json})
        for header, buffer in msg.buffers:
            self.send({"msg": "patch", "payload": json.dumps(header)})
            self.send({"msg": "patch"}, [buffer])

    def _sync_model(self, _, content: dict[str, Any], _buffers) -> None:
        if content.get("event", "") != "jsevent":
            return
        kind = content.get("kind")
        if kind == 'ModelChanged':
            hint = content.get("hint")
            if hint:
                cds = self._model.select_one({"id": hint["column_source"]["id"]})
                if "patches" in hint:
                    # Handle ColumnsPatchedEvent
                    cds.patch(hint["patches"], setter=self)
                elif "data" in hint:
                    # Handle ColumnsStreamedEvent
                    cds._stream(hint["data"], rollover=hint["rollover"], setter=self)
                return

            # Handle ModelChangedEvent
            new, old, attr = content["new"], content["old"], content["attr"]
            submodel = self._model.select_one({"id": content["id"]})
            descriptor = submodel.lookup(content['attr'])
            try:
                descriptor._set(submodel, old, new, hint=hint, setter=self)
            except Exception:
                return
            for cb in submodel._callbacks.get(attr, []):
                cb(attr, old, new)
        elif kind == 'MessageSent':
            self._document.callbacks.trigger_json_event(content["msg_data"])

#-----------------------------------------------------------------------------
# Dev API
#-----------------------------------------------------------------------------
