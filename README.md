# jupyterlab_bokeh

A JupyterLab extension for rendering Bokeh content

## Prerequisites

* JupyterLab

## Installation

To install the latest version:

```bash
jupyter labextension install jupyterlab_bokeh
```

To install a specific version:

```bash
jupyter labextension install jupyterlab_bokeh@x.y.x
```

## Development

For a development install (requires npm version 4 or later), do the following in the repository directory:

```bash
npm install
jupyter labextension link .
```

To rebuild the package and the JupyterLab app:

```bash
npm run build
jupyter lab build
```

To incrementally rebuild the extension and JupyterLab after changes you can run

```bash
npm run watch
```

and in another terminal run

```bash
jupyter lab --watch
```

## Testing

There is a directory named ``test_cases`` which contains a collection of notebooks that cover the various ``jupyterlab_bokeh`` functionalities. If you update the extension for new JupyterLab releases, please manually execute each and check that the expected behavior occurs. If you extend the ``jupyterlab_bokeh``, please add a new notebook that covers the new functionality.
