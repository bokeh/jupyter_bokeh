import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the @bokeh/jupyter_bokeh extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: '@bokeh/jupyter_bokeh:plugin',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension @bokeh/jupyter_bokeh is activated!');
  }
};

export default extension;
