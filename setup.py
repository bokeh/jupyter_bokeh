#!/usr/bin/env python

import sys
from setuptools import setup, find_packages, Command

class BuildJS(Command):

    description = "runs 'npm install && npm run prepack'"
    user_options = []

    def initialize_options(self):
        pass

    def finalize_options(self):
        pass

    def run(self):
        npm = "npm" if sys.platform != "win32" else "npm.bat"
        self.spawn([npm, "install"])
        self.spawn([npm, "run", "prepack"])

install_requires = [
    "bokeh >=2.0.0",
    "ipywidgets >=7.0.0",
]

setup_args = dict(
    name="jupyter_bokeh",
    version="2.0.0",
    install_requires=install_requires,
    python_requires=">=3.6",
    description="A Jupyter extension for rendering Bokeh content.",
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    author="Bokeh Team",
    author_email="info@bokeh.org",
    license="BSD-3-Clause",
    url="https://github.com/bokeh/jupyter_bokeh",
    packages=find_packages(),
    classifiers=[
        "License :: OSI Approved :: BSD License",
        "Development Status :: 5 - Production/Stable",
        "Programming Language :: Python :: 3.6",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Operating System :: OS Independent",
        "Intended Audience :: Science/Research",
        "Intended Audience :: Developers",
        "Natural Language :: English",
        "Topic :: Scientific/Engineering",
        "Topic :: Software Development :: Libraries",
    ],
    cmdclass={"build_js": BuildJS},
    include_package_data=True,
    data_files=[
        ("share/jupyter/nbextensions/jupyter_bokeh", [
            "jupyter_bokeh/nbextension/static/extension.js",
            "jupyter_bokeh/nbextension/static/index.js",
            "jupyter_bokeh/nbextension/static/index.js.map",
        ]),
        ("etc/jupyter/nbconfig/notebook.d", [
            "jupyter_bokeh.json",
        ]),
    ],
)

if __name__ == "__main__":
    setup(**setup_args)
