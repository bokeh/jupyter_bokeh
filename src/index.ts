import {
  IRenderMime
} from '@jupyterlab/rendermime-interfaces';

import {
  Widget
} from '@phosphor/widgets';


/**
 * The MIME type for BokehJS.
 */
export
const BOKEHJS_MIME_TYPE = 'application/vnd.bokeh.v0+json';

/**
 * Load BokehJS into window
 */
export
class BokehJSModuleLoader extends Widget implements IRenderMime.IRenderer {


  /**
   * Create a new widget
   */
  constructor(options: IRenderMime.IRendererOptions) {
    super();

    this._mimetype = options.mimeType;
  }

  // where is `Message` defined?
  // processMessage(msg: Message) {
  //   ;
  // }

  renderModel(model: IRenderMime.IMimeModel): Promise<void> {
    // let payload = model.data[this._mimetype]
    //
    // do the things
    //
    return Promise.resolve()
  }

  private _mimetype: string;
}

/**
 * A mime renderer factory for Bokeh
 */
export
const rendererFactory: IRenderMime.IRendererFactory = {
  safe: true,
  mimeTypes: [BOKEHJS_MIME_TYPE],
  createRenderer: options => new BokehJSModuleLoader(options)
}

const extension: IRenderMime.IExtension = {
  name: 'bokeh',
  rendererFactory,
  rank: 1, //needs to higher than application/javascript
  dataType: 'json' // probably won't be json
}

export default extension;
