import {
  DocumentRegistry
} from '@jupyterlab/docregistry'

import {
  INotebookModel,
  NotebookPanel
} from '@jupyterlab/notebook'

import {
  JupyterLabPlugin,
  JupyterLab
} from '@jupyterlab/application'

import {
  IDisposable,
  DisposableDelegate
} from '@phosphor/disposable'

import {
  ContextManager
} from './manager'

import {
  BokehJSExec,
  BokehJSLoad,
  BOKEHJS_EXEC_MIME_TYPE,
  BOKEHJS_LOAD_MIME_TYPE
} from './renderer'


export
type INBWidgetExtension = DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel>;


export
class NBWidgetExtension implements INBWidgetExtension {
  createNew(nb: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>): IDisposable {
    let manager = new ContextManager(context);

    nb.rendermime.addFactory({
        safe: false,
        mimeTypes: [BOKEHJS_LOAD_MIME_TYPE],
        createRenderer: (options) => new BokehJSLoad(options, manager)
    }, 0);

    nb.rendermime.addFactory({
        safe: false,
        mimeTypes: [BOKEHJS_EXEC_MIME_TYPE],
        createRenderer: (options) => new BokehJSExec(options, manager)
    }, 0);

    return new DisposableDelegate(() => {
        if (nb.rendermime) {
            nb.rendermime.removeMimeType(BOKEHJS_EXEC_MIME_TYPE);
        }
        manager.dispose();
    });
  }
}

export
  const extension: JupyterLabPlugin<void> = {
    id: 'jupyterlab_bokeh',
    autoStart: true,
    activate: (app: JupyterLab) => {
        // this adds the Bokeh widget extension onto Notebooks specifically
        app.docRegistry.addWidgetExtension('Notebook', new NBWidgetExtension());
    }
}
