import json
import os
from pathlib import Path
import subprocess
import sys
import time
from urllib.error import URLError
from urllib.request import urlopen

import nbformat
import pytest
from playwright.sync_api import sync_playwright


@pytest.fixture
def notebook_page(tmp_path):
    notebook = nbformat.v4.new_notebook(
        cells=[nbformat.v4.new_code_cell('''\
from bokeh.io import output_notebook
from bokeh.layouts import column
from bokeh.models import ColumnDataSource, Slider
from bokeh.plotting import figure
from bokeh.resources import INLINE
from IPython.display import display
from jupyter_bokeh import BokehModel

output_notebook(resources=INLINE)

source = ColumnDataSource(data=dict(x=[1, 2, 3], y=[1, 2, 3]), name="test-source")
plot = figure(width=400, height=300, title="Initial title", output_backend="svg", name="test-plot")
plot.line("x", "y", source=source, line_width=4)
slider = Slider(start=1, end=10, value=1, step=1, title="Multiplier", name="test-slider")

callback_values = []

def update(attr, old, new):
    callback_values.append((old, new))
    source.data = dict(x=[1, 2, 3], y=[new, 2*new, 3*new])
    plot.title.text = f"Multiplier: {new}"

slider.on_change("value", update)
widget = BokehModel(column(plot, slider, name="test-layout"))
display(widget)
''')],
        metadata={"kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"}},
    )
    nbformat.write(notebook, tmp_path / "sync.ipynb")
    env = dict(os.environ)
    for name in ("CONFIG", "DATA", "RUNTIME"):
        env[f"JUPYTER_{name}_DIR"] = str(tmp_path / name.lower())
    runtime = Path(env["JUPYTER_RUNTIME_DIR"])
    log_path = tmp_path / "jupyter.log"
    with log_path.open("w") as log:
        server = subprocess.Popen(
            [sys.executable, "-m", "jupyterlab", "--no-browser", "--ServerApp.port=0",
             "--ServerApp.ip=127.0.0.1", "--LabApp.expose_app_in_browser=True",
             f"--ServerApp.root_dir={tmp_path}"],
            env=env, stdout=log, stderr=subprocess.STDOUT,
        )
        try:
            deadline = time.monotonic() + 60
            while time.monotonic() < deadline:
                info_files = list(runtime.glob("jpserver-*.json"))
                if info_files:
                    info = json.loads(info_files[0].read_text())
                    url = f"{info['url']}lab/tree/sync.ipynb?token={info['token']}"
                    try:
                        with urlopen(url, timeout=1):
                            break
                    except (URLError, TimeoutError):
                        # Server info can appear before HTTP is ready. Retry until the deadline.
                        pass
                assert server.poll() is None, log_path.read_text()
                time.sleep(0.1)
            else:
                pytest.fail(f"JupyterLab did not start:\n{log_path.read_text()}")
            with sync_playwright() as playwright:
                browser = playwright.chromium.launch()
                page = browser.new_page()
                page.set_default_timeout(30_000)
                try:
                    page.goto(url)
                    page.wait_for_function("window.jupyterapp?.shell.currentWidget?.sessionContext?.session?.kernel != null")
                    yield page
                finally:
                    page.screenshot(path=str(tmp_path / "notebook.png"))
                    browser.close()
        finally:
            server.terminate()
            try:
                server.wait(timeout=15)
            except subprocess.TimeoutExpired:
                server.kill()
                server.wait()
