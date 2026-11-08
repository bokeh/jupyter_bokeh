# Release process

To publish to PyPI, push a new bare version tag such as `4.1.1` on the
commit you want to release from `main`. The release workflow sets the
version in `package.json` in its build checkout and verifies that both
distributions match the tag.

After the build passes, open the GitHub Actions run and select
**Review deployments** to approve publishing to the `pypi` environment.
