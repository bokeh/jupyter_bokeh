#!/bin/bash

set -e
set -x

git clean -dfx
jlpm install
jlpm run build:prod
npm publish --access public # token is configured in ~/.npmrc; requires OTP

git clean -dfx
python setup.py sdist bdist_wheel
twine upload -u __token__ -p $(cat ~/.tokens/pypi_jupyter_bokeh) dist/jupyter_bokeh-*.tar.gz

git clean -dfx
conda build conda.recipe
PKG=$(conda build conda.recipe --output)
anaconda --token ~/.tokens/anaconda upload -u bokeh -l dev -l main $PKG
