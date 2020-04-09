# jupyter_bokeh

A Jupyter extension for rendering Bokeh content.

## Prerequisites

* Jupyter Lab or Notebook

## Installation

To install the latest version in Jupyter Lab:

```bash
conda install -c bokeh jupyter_bokeh
jupyter labextension install @jupyter-widgets/jupyterlab-manager
jupyter labextension install @bokeh/jupyter_bokeh
```

To install a specific version:

```bash
jupyter labextension install @bokeh/jupyter_bokeh@x.y.x
```

On slow or limited memory systems, one can use `--minimize=False` to reduce compilation
times or make Jupyter Lab build runtime bundles at all.

jupyter_bokeh is automatically installed in Jupyter Notebook. In case of a non-standard
setup, one can install the extensions with:

```bash
jupyter nbextension install --sys-prefix --symlink --py jupyter_bokeh
jupyter nbextension enable jupyter_bokeh --py --sys-prefix
```

## Compatibility

The core [Bokeh](https://github.com/bokeh/bokeh) library is generally version independent of
[JupyterLab](https://github.com/jupyterlab/jupyterlab) and this ``jupyter_bokeh`` extension
for versions of ``bokeh>=2.0.0``.

Our goal is that ``jupyter_bokeh`` minor releases (using the [SemVer](https://semver.org/) pattern) are
made to follow JupyterLab minor release bumps and micro releases are for new ``jupyter_bokeh`` features
or bug fix releases. We've been previously inconsistent with having the extension release minor version bumps
track that of JupyterLab, so users seeking to find extension releases that are compatible with their JupyterLab
installation may refer to the below table.

###### Compatible JupyterLab and `jupyter_bokeh` versions

| JupyterLab    | `jupyter_bokeh`  |
| ------------- | ---------------- |
| 0.34.x        | 0.6.2            |
| 0.35.x        | 0.6.3            |
| 1.0.x         | 1.0.0            |
| 2.0.x         | 2.0.0            |

## Development

For a development install (requires npm version 6 or later), do the following in the repository directory:

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

When making a new release for compatibility with a new JupyterLab minor release series, please make a minor
release bump in this extension (i.e. 0.6.3 -> 0.7.0). Conversely, when creating a release for a new feature or bug fix,
please make a micro release bump (i.e. 0.6.3 -> 0.6.4).

## Testing

There is a directory named ``examples`` which contains a collection of notebooks that cover the various ``jupyter_bokeh``
functionalities. If you update the extension for new JupyterLab releases, please manually execute each and check that the
expected behavior occurs. If you extend the ``jupyter_bokeh``, please add a new notebook that covers the new functionality.
