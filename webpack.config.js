const fs = require("fs")
const path = require("path")

const {name, version} = require("./package.json")

const metadata = JSON.stringify({name, version})
fs.writeFileSync("./lib/metadata.js", `Object.assign(exports, ${metadata})`)

const externals = [/^@jupyterlab\/.+$/]

module.exports = (env={}, argv={}) => {
  const mode = argv.mode ?? "production"
  const minimize = mode === "production"
  return [
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
        path: path.resolve(__dirname, "jupyter_bokeh", "nbextension"),
        libraryTarget: "amd",
      },
      externals,
      devtool: "source-map",
      performance: {hints: false},
      mode,
      optimization: {minimize},
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
        library: name,
        publicPath: `https://unpkg.com/${name}@${version}/dist/`,
      },
      externals,
      devtool: "source-map",
      performance: {hints: false},
      mode,
      optimization: {minimize},
    },
  ]
}
