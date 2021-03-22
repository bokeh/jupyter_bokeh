define(function() {
    "use strict";

    window['requirejs'].config({
        map: {
            '*': {
                '@bokeh/jupyter_bokeh': 'nbextensions/jupyter_bokeh/index',
            },
        }
    });
    // Export the required load_ipython_extension function.
    return {
        load_ipython_extension: function() {},
    };
});
