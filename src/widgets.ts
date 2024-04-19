import { DOMWidgetModel, DOMWidgetView } from '@jupyter-widgets/base'

//import {Document, DocumentChangedEvent, ModelChangedEvent} from "document"
//import {Receiver, Fragment} from "protocol/receiver"
//import {keys, values} from "core/util/object"

import { name, version } from './metadata'

function bk_require(name: string): any {
  return (window as any).Bokeh.require(name)
}

type DocsJson = any
type RenderItem = any
type Document = any
type DocumentChangedEvent = any
type Receiver = any
type Fragment = any
type HasProps = any

const { keys, values } = Object

const version_range = `^${version}`

export type RenderBundle = {
  docs_json: DocsJson
  render_items: RenderItem[]
  div: string
}

export interface Ref {
  id: string
}

export interface DocumentChanged {
  event: 'jsevent'
  kind: string
}

export interface ModelChanged extends DocumentChanged {
  event: 'jsevent'
  kind: 'ModelChanged'
  model: Ref
  new: unknown
  attr: string
}

export interface MessageSent extends DocumentChanged {
  event: 'jsevent'
  kind: 'MessageSent'
  msg_data: {
    event_name: string
    event_values: {
      model: { id: string }
      [other: string]: any
    }
  }
  msg_type: string
}

export class BokehModel extends DOMWidgetModel {
  defaults(): any {
    return {
      ...super.defaults(),

      _model_name: 'BokehModel',
      _model_module: name,
      _model_module_version: version_range,

      _view_name: 'BokehView',
      _view_module: name,
      _view_module_version: version_range,

      combine_events: false,
      render_bundle: {}
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
  private _msgs: any[]
  private _events: any[]
  private _idle: boolean
  private _combine: boolean

  constructor(options?: any) {
    super(options)
    this._document = null
    this._blocked = false
    this._idle = true
    this._combine = true
    this._msgs = []
    const { Receiver } = bk_require('protocol/receiver')
    this._receiver = new Receiver()
    this.model.on('change:render_bundle', () => this.render())
    if (
      (window as any).Jupyter != null &&
      (window as any).Jupyter.notebook != null
    ) {
      // Handle classic Jupyter notebook
      const events = (window as any).require('base/js/events')
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
        console.warn(
          'BokehView cannot combine events because Kernel idle status cannot be determined.'
        )
        this._combine = false
      }
    } else if (this.model.get('combine_events')) {
      console.warn(
        'BokehView cannot combine events because Kernel idle status cannot be determined.'
      )
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
    const { docs_json, render_items, div } = bundle as RenderBundle
    this.el.innerHTML = div
    const element = this.el.children[0]
    const json = values(docs_json)[0]
    const { Document } = bk_require('document')
    const { add_document_standalone } = bk_require('embed/standalone')
    this._document = Document.from_json(json)
    for (const item of render_items) {
      const roots: { [key: string]: Element } = {}
      for (const root_id in item.roots) {
        roots[root_id] = element
      }
      add_document_standalone(this._document, element, roots)
    }
    this._document.on_change((event: any) => this._change_event(event))
  }

  _combine_events(
    new_msg: ModelChanged | MessageSent
  ): (ModelChanged | MessageSent)[] {
    const new_msgs = []
    for (const msg of this._msgs) {
      if (new_msg.kind != msg.kind) {
        new_msgs.push(msg)
      } else if (msg.kind == 'ModelChanged' && new_msg.kind == 'ModelChanged') {
        if (msg.model.id != new_msg.model.id || msg.attr != new_msg.attr) {
          new_msgs.push(msg)
        }
      } else if (msg.kind == 'MessageSent' && new_msg.kind == 'MessageSent') {
        if (
          msg.msg_data.event_values.model == null ||
          msg.msg_data.event_values.model.id !=
          new_msg.msg_data.event_values.model.id ||
          msg.msg_data.event_name != new_msg.msg_data.event_name
        ) {
          new_msgs.push(msg)
        }
      }
    }
    new_msgs.push(new_msg)
    return new_msgs
  }

  _send(msg: ModelChanged | MessageSent): void {
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
      this._events.push(event)
      return
    }
    const { Serializer } = bk_require('core/serialization')
    const references: Map<HasProps, Ref> = new Map()
    for (const model of event.document._all_models.values()) {
      references.set(model, model.ref())
    }
    const serializer = new Serializer({references})
    const event_rep = serializer.encode(event)
    event_rep.event = 'jsevent'
    this._send(event_rep)
  }

  protected _consume_patch(
    content: { msg: 'patch'; payload?: Fragment },
    buffers: DataView[]
  ): void {
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
          this._document.apply_json_patch(comm_msg.content, comm_msg.buffers)
        } finally {
          this._blocked = false
          const events = [...this._events]
          this._events = []
          for (const event of events) {
            this._change_event(event)
          }
        }
      }
    }
  }
}
