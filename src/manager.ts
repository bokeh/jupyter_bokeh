import { IDisposable } from '@lumino/disposable'
import { DocumentRegistry } from '@jupyterlab/docregistry'

/**
 * A micro manager that contains the document context
 *
 * This will grow in the future if we implement bokeh.io.push_notebook
 */
export type Context = DocumentRegistry.IContext<DocumentRegistry.IModel>

export class ContextManager implements IDisposable {
  private _context: Context | null

  constructor(context: Context) {
    this._context = context
  }

  get context(): Context {
    if (this._context != null) {
      return this._context
    } else {
      throw new Error('context was already disposed')
    }
  }

  get isDisposed(): boolean {
    return this._context == null
  }

  dispose(): void {
    if (this.isDisposed) {
      return
    }
    this._context = null
  }
}
