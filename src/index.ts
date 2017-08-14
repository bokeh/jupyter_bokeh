import {
  IRenderMime
} from '@jupyterlab/rendermime-interfaces';

import {
  Widget
} from '@phosphor/widgets';

import {
  Message
} from '@phosphor/messaging'

/**
 * The MIME type for BokehJS.
 */
export
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
    this._mimetype = options.mimeType;
  }

  renderModel(model: IRenderMime.IMimeModel): Promise<void> {
    let payload = model.data[this._mimetype] as string
    const load_func = new Function(payload)
    load_func()

    return Promise.resolve()
  }

  private _mimetype: string;
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
    this._mimetype = options.mimeType;
    this.div = document.createElement('div');
  }

  renderModel(model: IRenderMime.IMimeModel): Promise<void> {
    // this loads a div and script that renders the bokeh document and replaces the div
    const payload = model.data[this._mimetype] as {script: string, div: string}
    this.div.innerHTML = payload["div"]
    this.node.appendChild(this.div)
    this.script = new Function(payload["script"])

    return Promise.resolve()
  }

  onAfterAttach(msg: Message): void {
    this.script()
  }


  private _mimetype: string;
  div: any;
  script: Function;
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
