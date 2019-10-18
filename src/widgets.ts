import {DOMWidgetModel, DOMWidgetView} from "@jupyter-widgets/base"

//import {Document, DocumentChangedEvent, ModelChangedEvent} from "document"
//import {Receiver, Fragment} from "protocol/receiver"
//import {keys, values} from "core/util/object"

function bk_require(name: string): any {
  return (window as any).Bokeh.require(name)
}

type DocsJson = any
type RenderItem = any
type Document = any
type DocumentChangedEvent = any
type Receiver = any
type Fragment = any

const {keys, values} = Object as any

const module_name = "jupyterlab_bokeh"
const module_version = "^1.1.0-dev.1"

export type RenderBundle = {
  docs_json: DocsJson
  render_items: RenderItem[]
  div: string
}

export class BokehModel extends DOMWidgetModel {
  defaults() {
    return {
      ...super.defaults(),

      _model_name: "BokehModel",
      _model_module: module_name,
      _model_module_version: module_version,

      _view_name: "BokehView",
      _view_module: module_name,
      _view_module_version: module_version,

      render_bundle: {},
    }
  }

  static serializers = {
    ...DOMWidgetModel.serializers,
  }
}

export class BokehView extends DOMWidgetView {
  private _document: Document | null
  private _receiver: Receiver
  private _blocked: boolean

  constructor(options?: any) {
    super(options)
    this._document = null
    this._blocked = false
    const {Receiver} = bk_require("protocol/receiver")
    this._receiver = new Receiver()
    this.model.on("change:render_bundle", () => this.render())
    this.listenTo(this.model, "msg:custom", (content, buffers) => this._consume_patch(content, buffers))
  }

  render(): void {
    const bundle = JSON.parse(this.model.get("render_bundle"))
    const {docs_json, render_items, div} = bundle as RenderBundle
    this.el.innerHTML = div
    const element = this.el.children[0]
    const json = values(docs_json)[0]
    const {Document} = bk_require("document")
    const {add_document_standalone} = bk_require("embed/standalone")
    this._document = Document.from_json(json)
    for (const item of render_items) {
      const roots: {[key: string]: HTMLElement} = {}
      for (const root_id in item.roots)
        roots[root_id] = element
      add_document_standalone(this._document, element, roots)
    }
    this._document.on_change((event: any) => this._change_event(event))
  }

  protected _change_event(event: DocumentChangedEvent): void {
    const {ModelChangedEvent} = bk_require("document/events")
    if (!this._blocked && event instanceof ModelChangedEvent)
      this.send({event: "jsevent", id: event.model.id, new: event.new_, attr: event.attr, old: event.old})
  }

  protected _consume_patch(content: {msg: "patch", payload?: Fragment}, buffers: DataView[]): void {
    if (this._document == null)
      return
    if (content.msg == "patch") {
      const {payload} = content
      this._receiver.consume(payload != null ? payload : buffers[0].buffer)
      const comm_msg = this._receiver.message
      if (comm_msg != null && keys(comm_msg.content).length > 0) {
        this._blocked = true
        try {
          this._document.apply_json_patch(comm_msg.content, comm_msg.buffers)
        } finally {
          this._blocked = false
        }
      }
    }
  }
}
