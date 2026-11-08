# Release process

To publish to PyPI, tag the commit you want to release from `main` and
push the tag. Use `X.Y.Z` for stable releases and `X.Y.Z-dev.N` for
development releases. The release workflow sets `package.json` to the
tag in its build checkout and verifies that both distributions match
the Python version. For example, `4.2.0-dev.1` builds as `4.2.0.dev1`.

After the build passes, open the GitHub Actions run and select
**Review deployments** to approve publishing to the `pypi` environment.
