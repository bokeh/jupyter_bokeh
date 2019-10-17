const path = require("path")

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
      path: path.resolve(__dirname, "jupyterlab_bokeh", "nbextension", "static"),
      libraryTarget: "amd"
    },
    devtool: "source-map",
    externals: [/^@jupyterlab\/.+$/],
  },
]
