import {
  IRenderMime
} from '@jupyterlab/rendermime-interfaces'

import {
  Widget
} from '@phosphor/widgets'

import {
  ReadonlyJSONObject
} from '@phosphor/coreutils'

/**
 * The MIME type for BokehJS.
 */
const HTML_MIME_TYPE = 'text/html'
const JS_MIME_TYPE = 'application/javascript'
const BOKEHJS_LOAD_MIME_TYPE = 'application/vnd.bokehjs_load.v0+json'
const BOKEHJS_EXEC_MIME_TYPE = 'application/vnd.bokehjs_exec.v0+json'

/**
 * Load BokehJS into dom
 */
export
class BokehJSLoad extends Widget implements IRenderMime.IRenderer {

  /**
   * Create a new widget
   */
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

  private _load_mimetype: string = BOKEHJS_LOAD_MIME_TYPE
  private _script_element: HTMLScriptElement
}


/**
 * Exec BokehJS in window
 */
export
class BokehJSExec extends Widget implements IRenderMime.IRenderer {

  /**
   * Create a new widget
   */
  constructor(options: IRenderMime.IRendererOptions) {
    super()
    this._script_element = document.createElement("script")
  }

  renderModel(model: IRenderMime.IMimeModel): Promise<void> {

    let metadata = model.metadata[this._exec_mimetype] as ReadonlyJSONObject

    if (metadata.id !== undefined) {
      // I'm a static document
      let data = model.data[this._js_mimetype] as string
      this._script_element.textContent = data
    } else if (metadata.server_id !== undefined) {
      // I'm a server document
      let data = model.data[this._html_mimetype] as string
      const d = document.createElement('div')
      d.innerHTML = data
      const script_attrs : NamedNodeMap = d.children[0].attributes
      for (let i in script_attrs) {
        this._script_element.setAttribute(script_attrs[i].name, script_attrs[i].value)
      }
    }

    this.node.appendChild(this._script_element)

    return Promise.resolve()
  }

  // for classic nb compat reasons, the payload one of these mime messages
  private _html_mimetype: string = HTML_MIME_TYPE
  private _js_mimetype: string = JS_MIME_TYPE
  // the metadata is stored here
  private _exec_mimetype: string = BOKEHJS_EXEC_MIME_TYPE
  private _script_element: HTMLScriptElement
}


/**
 * A mime renderer factory for Bokeh
 */
export
const loadRendererFactory: IRenderMime.IRendererFactory = {
  safe: true,
  mimeTypes: [BOKEHJS_LOAD_MIME_TYPE],
  createRenderer: options => new BokehJSLoad(options)
}

export
const execRendererFactory: IRenderMime.IRendererFactory = {
  safe: true,
  mimeTypes: [BOKEHJS_EXEC_MIME_TYPE],
  createRenderer: options => new BokehJSExec(options)
}


const extensions: IRenderMime.IExtension[] = [
  {
    name: 'bokeh_load',
    rendererFactory: loadRendererFactory,
    rank: 0,
    dataType: 'json' // {"script": script, "div": div}
  },
  {
    name: 'bokeh_exec',
    rendererFactory: execRendererFactory,
    rank: 0,
    dataType: 'json' // {"script": script, "div": div}
  }
]

export default extensions
