# Release process

## Update package version

| File                        | Entry             | Content        |
| --------------------------- | ----------------- | -------------- |
| `jupyter_bokeh/__init__.py` | `__version__`     | `2.0.1dev2`    |
| `jupyter_bokeh/widgets.py`  | `_module_version` | `^2.0.1-dev.2` |
| `package.json`              | `version`         | `2.0.1-dev.2`  |
| `setup.py`                  | `version`         | `2.0.1dev2`    |
