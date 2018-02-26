import {
  IRenderMime
} from '@jupyterlab/rendermime-interfaces'

import {
  KernelMessage
} from '@jupyterlab/services'

import {
    IClientSession
} from '@jupyterlab/apputils';

import {
  ReadonlyJSONObject
} from '@phosphor/coreutils'

import {
  Widget
} from '@phosphor/widgets'

import {
  ContextManager
} from './manager';


/**
 * The MIME types for BokehJS.
 */
const HTML_MIME_TYPE = 'text/html'
const JS_MIME_TYPE = 'application/javascript'
export const BOKEHJS_LOAD_MIME_TYPE = 'application/vnd.bokehjs_load.v0+json'
export const BOKEHJS_EXEC_MIME_TYPE = 'application/vnd.bokehjs_exec.v0+json'

/**
 * Load BokehJS and CSS into the DOM
 */
export
class BokehJSLoad extends Widget implements IRenderMime.IRenderer {
  private _load_mimetype: string = BOKEHJS_LOAD_MIME_TYPE
  private _script_element: HTMLScriptElement

  constructor(options: IRenderMime.IRendererOptions) {
    super()
    this._script_element = document.createElement("script")
  }

  renderModel(model: IRenderMime.IMimeModel): Promise<void> {
    let data = model.data[this._load_mimetype] as string
    this._script_element.textContent = data
    this.node.appendChild(this._script_element)

    return Promise.resolve()
  }
}


/**
 * Exec BokehJS in window
 */
export
class BokehJSExec extends Widget implements IRenderMime.IRenderer {
  // for classic nb compat reasons, the payload in contained in these mime messages
  private _html_mimetype: string = HTML_MIME_TYPE
  private _js_mimetype: string = JS_MIME_TYPE
  // the metadata is stored here
  private _document_id: string
  private _exec_mimetype: string = BOKEHJS_EXEC_MIME_TYPE
  private _script_element: HTMLScriptElement
  private _server_id: string
  private _manager: ContextManager;

  constructor(options: IRenderMime.IRendererOptions, manager: ContextManager) {
    super()
    this._script_element = document.createElement("script")
    this._manager = manager
  }

  get isDisposed(): boolean {
    return this._manager === null;
  }

  renderModel(model: IRenderMime.IMimeModel): Promise<void> {
    let metadata = model.metadata[this._exec_mimetype] as ReadonlyJSONObject

    if (metadata.id !== undefined) {
      // I'm a static document
      let data = model.data[this._js_mimetype] as string
      this._script_element.textContent = data
      if ((window as any).Bokeh.embed.kernels !== undefined) {
        const kernel = this._manager.context.session.kernel;
        (window as any).Bokeh.embed.kernels[String(metadata.id)] = kernel;
        this._document_id = String(metadata.id);
        this._manager.context.session.statusChanged.connect((session: IClientSession, status: string) => {
          if (status == "restarting") {
              delete (window as any).Bokeh.embed.kernels[String(metadata.id)];
          }
        });
      }
    } else if (metadata.server_id !== undefined) {
      // I'm a server document
      this._server_id = metadata.server_id as string
      let data = model.data[this._html_mimetype] as string
      const d = document.createElement('div')
      d.innerHTML = data
      const script_attrs: NamedNodeMap = d.children[0].attributes
      for (let i in script_attrs) {
        this._script_element.setAttribute(script_attrs[i].name, script_attrs[i].value)
      }
    }

    this.node.appendChild(this._script_element)

    return Promise.resolve()
  }

  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    if (this._server_id) {
      let content: KernelMessage.IExecuteRequest = {
        code: `import bokeh.io.notebook as ion; ion.destroy_server('${this._server_id}')`
      }
      this._manager.context.session.kernel.requestExecute(content, true)
      this._server_id = null
    } else if (this._document_id) {
      if ((window as any).Bokeh.embed.kernels !== undefined) {
        delete (window as any).Bokeh.embed.kernels[this._document_id];
      }
      this._document_id = null;
    }
    this._manager = null;
  }
}
