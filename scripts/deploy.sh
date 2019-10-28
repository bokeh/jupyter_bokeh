#!/bin/bash

# Assumptions:
#
# 1. NPM token is configured in ~/.npmrc
# 2. PyPI user and token is configured in ~/.pypirc
# 3. Anaconda token is configured in ~/.tokens/anaconda

set -e
set -x

if [[ $(jq '.version' package.json) =~ "dev" ]];
then
    echo "dev build"
    exit 1
fi

git clean -dfx
npm publish --access public

git clean -dfx
python setup.py build_js sdist upload

git clean -dfx
conda build conda.recipe
PKG=$(conda build conda.recipe --output)
anaconda --token ~/.tokens/anaconda upload -u bokeh -l dev -l main $PKG
