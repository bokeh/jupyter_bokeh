# jupyterlab_bokeh

A JupyterLab extension for rendering Bokeh content.

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

## Compatibility

The core [Bokeh](https://github.com/bokeh/bokeh) library is generally version independent of
[JupyterLab](https://github.com/jupyterlab/jupyterlab) and this ``jupyterlab_bokeh`` extension for versions
of ``bokeh>=0.12.0``.

Our goal is that ``jupyterlab_bokeh`` minor releases (using the [SemVer](https://semver.org/) pattern) are
made to follow JupyterLab minor release bumps and micro releases are for new ``jupyterlab_bokeh`` features
or bug fix releases. We've been previously inconsistent with having the extension release minor version bumps
track that of JupyterLab, so users seeking to find extension releases that are compatible with their JupyterLab
installation may refer to the below table.

###### Compatible JupyterLab and jupyterlab_bokeh versions

| JupyterLab    | jupyterlab_bokeh |
| ------------- | ---------------- |
| 0.34.x        | 0.6.2            |
| 0.35.x        | 0.6.3            |
| 1.0.x         | 1.0.0            |

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

When making a new release for compatibility with a new JupyterLab minor release series, please make a minor
release bump in this extension (i.e. 0.6.3 -> 0.7.0). Conversely, when creating a release for a new feature or bug fix,
please make a micro release bump (i.e. 0.6.3 -> 0.6.4).

## Testing

There is a directory named ``test_cases`` which contains a collection of notebooks that cover the various ``jupyterlab_bokeh``
functionalities. If you update the extension for new JupyterLab releases, please manually execute each and check that the
expected behavior occurs. If you extend the ``jupyterlab_bokeh``, please add a new notebook that covers the new functionality.
