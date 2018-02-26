import {
  IDisposable
} from '@phosphor/disposable';

import {
  DocumentRegistry
} from '@jupyterlab/docregistry';

import {
  Kernel,
  KernelMessage
} from '@jupyterlab/services';


/**
 * A micro manager that contains the document context
 *
 */
export
class ContextManager implements IDisposable {
  private _context: DocumentRegistry.IContext<DocumentRegistry.IModel>;
  private _documentId: string
  private _serverId: string

  constructor(context: DocumentRegistry.IContext<DocumentRegistry.IModel>) {
    this._context = context;

    this._context.session.kernelChanged.connect((session, kernel) => {
      this.newKernel(kernel);
    }, this);

    if (context.session.kernel) {
      this.newKernel(context.session.kernel);
    }
  }

  private newKernel(kernel: Kernel.IKernelConnection) {
    if (!kernel) {
      return
    }
    if (this._documentId) {
      (window as any).Bokeh.embed.kernels[this._documentId] = kernel
    }
  }

  set documentId(id: string) {
    (window as any).Bokeh.embed.kernels[id] = this._context.session.kernel
    this._documentId = id
  }

  set serverId(id: string) {
    this._serverId = id
  }

  get isDisposed(): boolean {
    return this._context === null;
  }

  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    this.clearManager()
    this._context = null
  }

  clearManager() {
    if (this._documentId) {
      delete (window as any).Bokeh.embed.kernels[this._documentId]
      this._documentId = null
    } else if (this._serverId) {
      let content: KernelMessage.IExecuteRequest = {
        code: `import bokeh.io.notebook as ion; ion.destroy_server('${this._serverId}')`
      }
      this._context.session.kernel.requestExecute(content, true)
      this._serverId = null
    }
  }
}
