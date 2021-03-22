import { DocumentRegistry } from '@jupyterlab/docregistry'
import { INotebookModel, NotebookPanel } from '@jupyterlab/notebook'
import { JupyterFrontEndPlugin, JupyterFrontEnd } from '@jupyterlab/application'
import { IJupyterWidgetRegistry } from '@jupyter-widgets/base'
import { IDisposable, DisposableDelegate } from '@lumino/disposable'

import { ContextManager } from './manager'
import {
  BokehJSExec,
  BokehJSLoad,
  BOKEHJS_EXEC_MIME_TYPE,
  BOKEHJS_LOAD_MIME_TYPE
} from './renderer'

export type INBWidgetExtension = DocumentRegistry.IWidgetExtension<
  NotebookPanel,
  INotebookModel
>

export class NBWidgetExtension implements INBWidgetExtension {
  createNew(
    nb: NotebookPanel,
    context: DocumentRegistry.IContext<INotebookModel>
  ): IDisposable {
    const manager = new ContextManager(context)

    nb.content.rendermime.addFactory(
      {
        safe: false,
        mimeTypes: [BOKEHJS_LOAD_MIME_TYPE],
        createRenderer: options => new BokehJSLoad(options)
      },
      0
    )

    // the rank has to be -1, so that the priority is higher than the
    // default javascript mime extension (rank=0)
    nb.content.rendermime.addFactory(
      {
        safe: false,
        mimeTypes: [BOKEHJS_EXEC_MIME_TYPE],
        createRenderer: options => new BokehJSExec(options, manager)
      },
      -1
    )

    return new DisposableDelegate(() => {
      if (nb.content.rendermime) {
        nb.content.rendermime.removeMimeType(BOKEHJS_EXEC_MIME_TYPE)
      }
      manager.dispose()
    })
  }
}

import { name, version } from './metadata'
import { BokehModel, BokehView } from './widgets'

export const extension: JupyterFrontEndPlugin<void> = {
  id: name,
  requires: [IJupyterWidgetRegistry],
  activate: (app: JupyterFrontEnd, widgets: IJupyterWidgetRegistry) => {
    // this adds the Bokeh widget extension onto Notebooks specifically
    app.docRegistry.addWidgetExtension('Notebook', new NBWidgetExtension())

    widgets.registerWidget({
      name,
      version,
      exports: {
        BokehModel: BokehModel as any,
        BokehView: BokehView as any
      }
    })
  },
  autoStart: true
}
