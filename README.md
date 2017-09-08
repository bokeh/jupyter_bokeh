# jupyterlab_bokeh

A JupyterLab extension for rendering Bokeh content

## Prerequisites

* JupyterLab

## Installation

```bash
jupyter labextension install jupyterlab_bokeh
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
