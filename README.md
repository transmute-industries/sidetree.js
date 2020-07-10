# Sidetree.js

[![npm version](https://badge.fury.io/js/sidetree.js.svg)](https://badge.fury.io/js/sidetree.js)

![Continuous Integration](https://github.com/transmute-industries/sidetree.js/workflows/CI/badge.svg)

## How to pull individual packages from the mono repo

- Copy the global eslint config to the package
- Make sure the linked packages are published

## Release process

### Unstable releases

Unstable releases are automatic, from CD:

- On every commit to master an unstable release is pushed. An unstable release is a release with a tag of the form: vA.B.C-unstable.X. Everytime a PR is merged, X is incremented.
- If "skip-ci" is present in the commit message, the aforementioned behavior is skipped

### Stable releases

Stable releases are triggered by a dev locally

- Make sure you are familiar with [Semantic Versioning](https://semver.org/)
- Run `npm install` and `npm build` in the root level directory
- Run
  - `npm run publish:stable:patch` for a patch version increment
  - `npm run publish:stable:minor` for a minor version increment
  - `npm run publish:stable:major` for a major version increment


### Example

- Current version is v0.1.0
- A PR is made to fix bug A. When it's merged a release is made: v0.1.0-unstable-0
- A PR is made to add feature B. When it's merged a release is made: v0.1.0-unstable-1
- A PR is made to add feature C. When it's merged a release is made: v0.1.0-unstable-2
- Dev runs `npm run publish:stable:patch`. Current version is v0.1.0
- A PR is made to fix bug D. When it's merged a release is made: v0.1.1-unstable-0
- etc...

### Docker Commands

You may find it useful to prune all docker data:

```
docker system prune
```

## License

Substantial portions of this software have been copied from [decentralized-identity/sidetree](https://github.com/decentralized-identity/sidetree). In some cases no changes were made, in others, substantial changes were made to support modularity, independent versioning, seperation of concerns, and incremental security upgrades.

For more information see [decentralized-identity/sidetree LICENSE](https://github.com/decentralized-identity/sidetree/blob/master/LICENSE).

All documents in this Repository are licensed by contributors
under the
[W3C Software and Document License](https://www.w3.org/Consortium/Legal/copyright-software).
