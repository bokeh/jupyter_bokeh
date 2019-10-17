define(function() {
    "use strict";

    window['requirejs'].config({
        map: {
            '*': {
                'jupyterlab_bokeh': 'nbextensions/jupyterlab_bokeh/index',
            },
        }
    });
    // Export the required load_ipython_extension function.
    return {
        load_ipython_extension: function() {},
    };
});
