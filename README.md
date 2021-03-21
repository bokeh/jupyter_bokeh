# jupyter_bokeh

![Github Actions Status](https://github.com/bokeh/jupyter_bokeh/workflows/Build/badge.svg)

A Jupyter extension for rendering [Bokeh](https://bokeh.org) content within Jupyter.  See also the separate [ipywidgets_bokeh](https://github.com/bokeh/ipywidgets_bokeh) library for support for using Jupyter widgets/ipywidgets objects within Bokeh applications.


## Install

To install the latest version in Jupyter Lab:

```bash
pip install jupyter_bokeh
```

or

```
conda install -c bokeh jupyter_bokeh
```

For versions of Jupyter Lab <3.0 you must install the labextension
separately:

```bash
conda install -c bokeh jupyter_bokeh
jupyter labextension install @jupyter-widgets/jupyterlab-manager
jupyter labextension install @bokeh/jupyter_bokeh
```

To install a specific version:

```bash
jupyter labextension install @bokeh/jupyter_bokeh@x.y.x
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
| 3.0.x         | 3.0.0            |

## Contributing

### Development install

Note: You will need NodeJS to build the extension package.

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Change directory to the jupyter_bokeh directory
# Install package in development mode
pip install -e .
# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite
# Rebuild extension Typescript source after making changes
jlpm run build
```

You can watch the source directory and run JupyterLab at the same time in different terminals to watch for changes in the extension's source and automatically rebuild the extension.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm run watch
# Run JupyterLab in another terminal
jupyter lab
```

With the watch command running, every saved change will immediately be built locally and available in your running JupyterLab. Refresh JupyterLab to load the change in your browser (you may need to wait several seconds for the extension to be rebuilt).

By default, the `jlpm run build` command generates the source maps for this extension to make it easier to debug using the browser dev tools. To also generate source maps for the JupyterLab core extensions, you can run the following command:

```bash
jupyter lab build --minimize=False
```

### Uninstall

```bash
pip uninstall jupyter_bokeh
```
