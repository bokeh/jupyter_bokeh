import {DOMWidgetModel, DOMWidgetView} from "@jupyter-widgets/base"

// Use only `import type`, so that all imports are erased at run time
import type {Document, DocJson, Patch, DocumentChangedEvent} from "@bokeh/bokehjs/document"
import type {DocumentChanged} from "@bokeh/bokehjs/document/events"
import type {Receiver, Fragment} from "@bokeh/bokehjs/protocol/receiver"
import type {RenderItem} from "@bokeh/bokehjs/embed/json"
import type {HasProps} from "@bokeh/bokehjs/core/has_props"
import type {Ref} from "@bokeh/bokehjs/core/util/refs"
import type {Serializer} from "@bokeh/bokehjs/core/serialization"
import type {BokehEvent} from "@bokeh/bokehjs/core/bokeh_events"
import type {add_document_standalone} from "@bokeh/bokehjs/embed/standalone"

import {name, version} from './metadata'

declare const Bokeh: {require(name: string): unknown}

function bk_require<T>(name: string): T {
  return Bokeh.require(name) as T
}

declare const Jupyter: {notebook?: unknown}

declare function require(name: string): unknown

const {keys} = Object

const version_range = `^${version}`

export type RenderBundle = {
  docs_json: DocJson[]
  render_items: RenderItem[]
  div: string
}

/*
declare interface DocumentChanged {
  event: "jsevent"
}
*/

export class BokehModel extends DOMWidgetModel {
  defaults(): {[key: string]: unknown} {
    return {
      ...super.defaults(),

      _model_name: 'BokehModel',
      _model_module: name,
      _model_module_version: version_range,

      _view_name: 'BokehView',
      _view_module: name,
      _view_module_version: version_range,

      combine_events: false,
      render_bundle: {},
    }
  }

  static serializers = {
    ...DOMWidgetModel.serializers
  }
}

export class BokehView extends DOMWidgetView {
  private _document: Document | null
  private _receiver: Receiver
  private _blocked: boolean
  private _msgs: DocumentChanged[]
  private _idle: boolean
  private _combine: boolean

  constructor(options?: unknown) {
    super(options)
    this._document = null
    this._blocked = false
    this._idle = true
    this._combine = true
    this._msgs = []
    const receiver = bk_require<{Receiver: typeof Receiver}>('protocol/receiver')
    this._receiver = new receiver.Receiver()
    this.model.on('change:render_bundle', () => this.render())
    if (Jupyter?.notebook != null) {
      // Handle classic Jupyter notebook
      const events = require('base/js/events')
      events.on('kernel_idle.Kernel', () => this._process_msg())
    } else if ((this.model.widget_manager as any).context != null) {
      // Handle JupyterLab and Voila
      const context = (this.model.widget_manager as any).context
      const statusChanged =
        context.session != null
          ? context.session.kernel.statusChanged
          : context.sessionContext.statusChanged
      if (statusChanged != null) {
        statusChanged.connect((_: any, status: any) => {
          if (status === 'idle') {
            this._process_msg()
          }
        })
      } else if (this.model.get('combine_events')) {
        console.warn('BokehView cannot combine events because Kernel idle status cannot be determined.')
        this._combine = false
      }
    } else if (this.model.get('combine_events')) {
      console.warn('BokehView cannot combine events because Kernel idle status cannot be determined.')
      this._combine = false
    }
    this.listenTo(this.model, 'msg:custom', (content, buffers) =>
      this._consume_patch(content, buffers)
    )
  }

  protected _process_msg(): void {
    if (this._msgs.length == 0) {
      this._idle = true
      return
    }
    this.send(this._msgs.shift())
  }

  render(): void {
    const bundle = JSON.parse(this.model.get('render_bundle'))
    const {docs_json, render_items, div} = bundle as RenderBundle
    this.el.innerHTML = div
    const element = this.el.children[0] as HTMLElement
    // assumes docs_json.length == 1 && render_items.length == 1
    const doc_json = docs_json[0]
    const render_item = render_items[0]
    const document = bk_require<{Document: typeof Document}>('document')
    const standalone = bk_require<{add_document_standalone: typeof add_document_standalone}>('embed/standalone')
    this._document = document.Document.from_json(doc_json)
    const roots: {[key: string]: HTMLElement} = {}
    for (const root_id in render_item.roots) {
      roots[root_id] = element
    }
    standalone.add_document_standalone(this._document, element, roots)
    this._document.on_change((event) => this._change_event(event))
  }

  _combine_events(new_msg: DocumentChanged): DocumentChanged[] {
    const new_msgs: DocumentChanged[] = []
    for (const msg of this._msgs) {
      if (new_msg.kind != msg.kind) {
        new_msgs.push(msg)
      } else if (msg.kind == 'ModelChanged' && new_msg.kind == 'ModelChanged') {
        if (msg.id != new_msg.id || msg.attr != new_msg.attr) {
          new_msgs.push(msg)
        }
      } else if (msg.kind == 'MessageSent' && new_msg.kind == 'MessageSent') {
        // assert msg.msg_type == "bokeh_event"
        const data = msg.msg_data as BokehEvent
        const new_data = new_msg.msg_data as BokehEvent
        if (
          data.event_values.model == null ||
          data.event_values.model.id != new_data.event_values.model.id ||
          data.event_name != new_data.event_name
        ) {
          new_msgs.push(msg)
        }
      }
    }
    new_msgs.push(new_msg)
    return new_msgs
  }

  _send(msg: DocumentChanged): void {
    if (!this._idle && this._combine && this.model.get('combine_events')) {
      // Queue event and drop previous events on same model attribute
      this._msgs = this._combine_events(msg)
    } else {
      this._idle = false
      this.send(msg)
    }
  }

  protected _change_event(event: DocumentChangedEvent): void {
    if (this._blocked) {
      return
    }
    const serialization = bk_require<{Serializer: typeof Serializer}>("core/serialization")
    const references: Map<HasProps, Ref> = new Map()
    for (const model of event.document._all_models.values()) {
      references.set(model, model.ref())
    }
    const serializer = new serialization.Serializer({references})
    const event_rep = serializer.encode(event) as DocumentChanged & {event: "jsevent"}
    event_rep.event = "jsevent"
    this._send(event_rep)
  }

  protected _consume_patch(content: {msg: 'patch'; payload?: Fragment}, buffers: DataView[]): void {
    if (this._document == null) {
      return
    }
    if (content.msg == 'patch') {
      const { payload } = content
      this._receiver.consume(payload != null ? payload : buffers[0].buffer)
      const comm_msg = this._receiver.message
      if (comm_msg != null && keys(comm_msg.content).length > 0) {
        this._blocked = true
        try {
          this._document.apply_json_patch(comm_msg.content as Patch, comm_msg.buffers)
        } finally {
          this._blocked = false
        }
      }
    }
  }
}
