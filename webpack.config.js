const path = require("path")
const {version} = require("./package.json")

const externals = [/^@jupyterlab\/.+$/]

module.exports = [
  /**
   * Notebook extension
   *
   * This bundle only contains the part of the JavaScript that is run on load of
   * the notebook.
   */
  {
    entry: "./lib/extension.js",
    output: {
      filename: "index.js",
      path: path.resolve(__dirname, "jupyter_bokeh", "nbextension", "static"),
      libraryTarget: "amd"
    },
    externals,
    devtool: "source-map",
    performance: {hints: false},
  },

  /**
   * Embeddable bundle
   *
   * This bundle is almost identical to the notebook extension bundle. The only
   * difference is in the configuration of the webpack public path for the
   * static assets.
   *
   * The target bundle is always `dist/index.js`, which is the path required by
   * the custom widget embedder.
   */
  {
    entry: "./lib/index.js",
    output: {
      filename: "index.js",
      path: path.resolve(__dirname, "dist"),
      libraryTarget: "amd",
      library: "@bokeh/jupyter_bokeh",
      publicPath: "https://unpkg.com/@bokeh/jupyter_bokeh@" + version + "/dist/"
    },
    externals,
    devtool: "source-map",
    performance: {hints: false},
  },
]
