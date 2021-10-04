// Configuration is extended from @commitlint/config-conventional
// @see https://github.com/conventional-changelog/commitlint/tree/master/@commitlint/config-conventional

const packages = ['core', 'element', 'photon', 'ion'];

module.exports = {
  rules: {
    'body-leading-blank': [1, 'always'],
    'body-max-line-length': [2, 'always', 100],
    'footer-leading-blank': [1, 'always'],
    'footer-max-line-length': [2, 'always', 100],
    'header-max-length': [2, 'always', 100],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-case': [
      2,
      'never',
      ['sentence-case', 'start-case', 'pascal-case', 'upper-case'],
    ],
    'scope-empty': [2, 'never'],
    'scope-enum': [2, 'always', packages],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'type-enum': [
      2,
      'always',
      // see https://github.com/conventional-changelog/commitlint/blob/99d8881d0d951deded6d9e31bbb279d04101549b/%40commitlint/config-conventional/index.js#L38
      [
        'build', // Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
        'chore', // Other changes that don't modify src or test files
        'ci', // Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
        'docs', // Documentation only changes
        'feat', // A new feature
        'fix', // A bug fix
        'perf', // A code change that improves performance
        'refactor', // A code change that neither fixes a bug nor adds a feature
        'revert', // Reverts a previous commit
        'style', // Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
        'test', // Adding missing tests or correcting existing tests
      ],
    ],
  },
};
