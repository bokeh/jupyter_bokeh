#!/bin/bash

set -e
set -x

git clean -dfx
jlpm install
jlpm run build:prod
npm publish --access public # token is configured in ~/.npmrc; requires OTP

git clean -dfx
hatch build
hatch publish -u __token__ -a $(cat ~/.tokens/pypi_jupyter_bokeh)

VERSION=`hatch version` conda build conda.recipe
PKG=$(conda build conda.recipe --output)
anaconda --token ~/.tokens/anaconda upload -u bokeh -l dev -l main $PKG
