import { IRenderMime } from '@jupyterlab/rendermime-interfaces'
import { KernelMessage, Kernel } from '@jupyterlab/services'
import { ReadonlyJSONObject } from '@lumino/coreutils'
import { Widget } from '@lumino/widgets'
import { ContextManager } from './manager'

export declare interface KernelProxy {
  // copied from https://github.com/jupyterlab/jupyterlab/blob/master/packages/services/src/kernel/default.ts#L605
  registerCommTarget(
    targetName: string,
    callback: (comm: Kernel.IComm, msg: KernelMessage.ICommOpenMsg) => Promise<void>
  ): void
}

declare const Bokeh: any

function poll(fn: () => boolean, wait = 1000, interval = 100): Promise<void> {
  return new Promise((resolve, reject) => {
    if (fn()) {
      resolve()
    } else {
      const id = setInterval(() => {
        if (fn()) {
          clearInterval(id)
          resolve()
        }
        wait -= interval
        if (wait <= 0) {
          clearInterval(id)
          reject(new Error('timeout'))
        }
      }, interval)
    }
  })
}

/**
 * The MIME types for BokehJS.
 */
export const BOKEHJS_LOAD_MIME_TYPE = 'application/vnd.bokehjs_load.v0+json'
export const BOKEHJS_EXEC_MIME_TYPE = 'application/vnd.bokehjs_exec.v0+json'

/**
 * Load BokehJS and CSS into the DOM
 */
export class BokehJSLoad extends Widget implements IRenderMime.IRenderer {
  private _script_element: HTMLScriptElement

  constructor(_options: IRenderMime.IRendererOptions) {
    super()
    this._script_element = document.createElement('script')
  }

  renderModel(model: IRenderMime.IMimeModel): Promise<void> {
    const data = model.data[BOKEHJS_LOAD_MIME_TYPE] as string
    this._script_element.textContent = data
    this.node.appendChild(this._script_element)

    return Promise.resolve()
  }
}

/**
 * Exec BokehJS in window
 */
export class BokehJSExec extends Widget implements IRenderMime.IRenderer {
  private _manager: ContextManager | null
  private _script_element: HTMLScriptElement
  private _server_id: string | null = null
  private _document_id: string | null = null

  constructor(_options: IRenderMime.IRendererOptions, manager: ContextManager) {
    super()
    this._script_element = document.createElement('script')
    this._manager = manager
  }

  async renderModel(model: IRenderMime.IMimeModel): Promise<void> {
    const metadata = model.metadata[BOKEHJS_EXEC_MIME_TYPE] as ReadonlyJSONObject

    if (metadata.id !== undefined) {
      // I'm a static document
      const data = model.data['application/javascript'] as string
      this._script_element.textContent = data
      await poll(() => typeof Bokeh !== 'undefined')
      this._document_id = metadata.id as string
      const { _manager } = this
      const kernel_proxy: KernelProxy = {
        registerCommTarget(
          targetName: string,
          callback: (comm: Kernel.IComm, msg: KernelMessage.ICommOpenMsg) => void
        ) {
          const kernel = _manager!.context.sessionContext.session?.kernel
          if (kernel != null) {
            kernel.registerCommTarget(targetName, callback)
          }
        }
      }
      Bokeh.embed.kernels[this._document_id] = kernel_proxy
      _manager!.context.sessionContext.statusChanged.connect(
        (_session, status) => {
          if (status === 'restarting' || status === 'dead') {
            delete Bokeh.embed.kernels[this._document_id!]
          }
        },
        this
      )
    } else if (metadata.server_id !== undefined) {
      // I'm a server document
      this._server_id = metadata.server_id as string
      const data = model.data['text/html'] as string
      const d = document.createElement('div')
      d.innerHTML = data
      const script_attrs = d.children[0].attributes
      for (const attr of script_attrs) {
        this._script_element.setAttribute(attr.name, attr.value)
      }
      this._script_element.textContent = d.textContent
    }

    this.node.appendChild(this._script_element)
  }

  dispose(): void {
    if (this.isDisposed) {
      return
    }

    super.dispose()

    if (this._server_id) {
      const content: KernelMessage.IExecuteRequestMsg['content'] = {
        code: `import bokeh.io.notebook as ion; ion.destroy_server("${this._server_id}")`
      }
      const kernel = this._manager!.context.sessionContext.session?.kernel
      if (kernel != null) {
        kernel.requestExecute(content, true)
      }
      this._server_id = null
    } else if (this._document_id) {
      if (Bokeh.embed.kernels !== undefined) {
        delete Bokeh.embed.kernels[this._document_id]
      }
      this._document_id = null
    }
    this._manager = null
  }
}
