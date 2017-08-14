import {
  IRenderMime
} from '@jupyterlab/rendermime-interfaces';

import {
  Widget
} from '@phosphor/widgets';


/**
 * The MIME type for BokehJS.
 */
const BOKEHJS_LOAD_MIME_TYPE = 'application/vnd.bokehjs_load.v0';
const BOKEHJS_EXEC_MIME_TYPE = 'application/vnd.bokehjs_exec.v0';


/**
 * Load BokehJS into dom
 */
export
class BokehJSLoad extends Widget implements IRenderMime.IRenderer {

  /**
   * Create a new widget
   */
  constructor(options: IRenderMime.IRendererOptions) {
    super();
    this._script_element = document.createElement("script")
  }

  renderModel(model: IRenderMime.IMimeModel): Promise<void> {
    this._script_element.textContent = model.data[this._load_mimetype] as string | ""
    this.node.appendChild(this._script_element)

    return Promise.resolve()
  }

  private _load_mimetype: string = BOKEHJS_LOAD_MIME_TYPE;
  private _script_element: HTMLScriptElement;
}


/**
 * Exec BokehJS into window
 */
export
class BokehJSExec extends Widget implements IRenderMime.IRenderer {

  /**
   * Create a new widget
   */
  constructor(options: IRenderMime.IRendererOptions) {
    super();
    this._script_element = document.createElement("script")
    this._div_element = document.createElement("div")
  }

  renderModel(model: IRenderMime.IMimeModel): Promise<void> {
    // this loads a div and script that renders the bokeh document and replaces the div
    const payload = model.data[this._exec_mimetype] as {script: string, div: string} | {"script": "", "div": ""}
    this._script_element.textContent = payload["script"]
    this._div_element.innerHTML = payload["div"]
    this.node.appendChild(this._script_element)
    this.node.appendChild(this._div_element)

    return Promise.resolve()
  }

  private _exec_mimetype: string = BOKEHJS_EXEC_MIME_TYPE;
  private _script_element: HTMLScriptElement;
  private _div_element: HTMLDivElement;
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
    dataType: 'string'
  },
  {
    name: 'bokeh_exec',
    rendererFactory: execRendererFactory,
    rank: 0,
    dataType: 'json' // {"script": script, "div": div}
  }
]

export default extensions;
