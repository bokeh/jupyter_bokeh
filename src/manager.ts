import {IDisposable} from "@phosphor/disposable"
import {DocumentRegistry} from "@jupyterlab/docregistry"

/**
 * A micro manager that contains the document context
 *
 * This will grow in the future if we implement bokeh.io.push_notebook
 */
export class ContextManager implements IDisposable {
  private _context: DocumentRegistry.IContext<DocumentRegistry.IModel>

  constructor(context: DocumentRegistry.IContext<DocumentRegistry.IModel>) {
    this._context = context
  }

  get context() {
    return this._context
  }

  get isDisposed(): boolean {
    return this._context === null
  }

  dispose(): void {
    if (this.isDisposed)
      return
    this._context = null
  }
}
