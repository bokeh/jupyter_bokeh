from playwright.sync_api import expect


DOCUMENT = "Object.values(window.Bokeh?.index ?? {}).find(view => view.model.name === 'test-layout')?.model.document"


def execute(page, code):
    return page.evaluate(
        """async (code) => {
            const kernel = window.jupyterapp.shell.currentWidget.sessionContext.session.kernel
            const future = kernel.requestExecute({code})
            const errors = []
            future.onIOPub = (message) => {
                if (message.header.msg_type === 'error')
                    errors.push(message.content.traceback.join('\\n'))
            }
            const reply = await future.done
            if (reply.content.status !== 'ok' || errors.length)
                throw new Error(errors.join('\\n') || JSON.stringify(reply.content))
        }""",
        code,
    )


def test_notebook_plot_sync(notebook_page):
    page = notebook_page
    page.evaluate("void window.jupyterapp.commands.execute('notebook:run-all-cells')")
    page.wait_for_function(f"{DOCUMENT} != null")
    plot = page.locator('.jp-OutputArea-output .bk-Figure')
    expect(plot).to_be_visible()
    expect(plot.locator('svg')).not_to_have_count(0)
    expect(plot.get_by_text('Initial title', exact=True).first).to_be_visible()

    execute(page, 'plot.title.text = "Updated from Python"\nsource.data = dict(x=[1, 2, 3], y=[3, 2, 1])')
    expect(plot.get_by_text('Updated from Python', exact=True).first).to_be_visible()
    page.wait_for_function(f"JSON.stringify(({DOCUMENT}).get_model_by_name('test-source').data.y) === '[3,2,1]'")

    slider = page.get_by_role('slider')
    expect(slider).to_be_visible()
    slider.focus()
    slider.press('ArrowRight')
    page.wait_for_function(f"({DOCUMENT}).get_model_by_name('test-slider').value === 2")
    expect(plot.get_by_text('Multiplier: 2', exact=True).first).to_be_visible()
    execute(page, 'assert slider.value == 2\nassert source.data["y"] == [2, 4, 6]\nassert callback_values == [(1, 2)]')
    page.wait_for_function(f"JSON.stringify(({DOCUMENT}).get_model_by_name('test-source').data.y) === '[2,4,6]'")


def test_widget_waits_for_bokeh_resources(notebook_page):
    page = notebook_page
    run_cell = "window.jupyterapp.commands.execute('notebook:run-cell')"
    page.evaluate(run_cell)
    page.wait_for_function("typeof window.Bokeh?.require === 'function'")

    page.evaluate("""() => {
        window.jupyterapp.shell.currentWidget.content.activeCellIndex = 1
        window.savedBokeh = window.Bokeh
        window.Bokeh = undefined
        Object.defineProperty(window, '_bokeh_is_loading', {
            configurable: true,
            get() {
                window.bokehLoadingChecked = true
                return 1
            },
        })
    }""")
    # Launch the widget render while BokehJS is unavailable.
    page.evaluate(f"void {run_cell}")
    output = page.locator('.jp-CodeCell').nth(1)
    page.wait_for_function("window.jupyterapp.shell.currentWidget.content.widgets[1].outputArea.model.length > 0")
    page.evaluate("window.Bokeh = window.savedBokeh")
    page.wait_for_function("window.bokehLoadingChecked === true")
    plot = output.locator('.bk-Figure')
    expect(plot).not_to_be_visible()
    page.evaluate("Object.defineProperty(window, '_bokeh_is_loading', {value: 0, writable: true})")

    expect(plot).to_be_visible()
    execute(page, 'plot.title.text = "Updated after loading"')
    expect(plot.get_by_text('Updated after loading', exact=True).first).to_be_visible()
