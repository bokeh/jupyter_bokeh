#!/bin/bash

set -e
set -x

if [[ $(jq '.version' package.json) =~ "dev" ]];
then
    echo "dev build"
    exit 1
fi

git clean -dfx
npm install
npm publish --access public # token is configured in ~/.npmrc; requires OTP

git clean -dfx
python setup.py build_js sdist
twine upload -u __token__ -p $(cat ~/.tokens/pypi_jupyter_bokeh) dist/jupyter_bokeh-*.tar.gz

git clean -dfx
conda build conda.recipe
PKG=$(conda build conda.recipe --output)
anaconda --token ~/.tokens/anaconda upload -u bokeh -l dev -l main $PKG
