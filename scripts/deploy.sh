#!/bin/bash

set -e
set -x

git clean -dfx
jlpm install
jlpm run build:prod
npm login
npm publish --access public

git clean -dfx
hatch build
hatch publish -u __token__ -a $(cat ~/.tokens/pypi_jupyter_bokeh)

VERSION=`hatch version` conda build conda.recipe
PKG=$(VERSION=`hatch version` conda build conda.recipe --output)
anaconda --token ~/.tokens/anaconda upload -u bokeh -l dev -l main $PKG
