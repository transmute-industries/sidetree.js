module.exports = {
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.(ts|tsx)$': './node_modules/ts-jest',
  },
  testPathIgnorePatterns: ['<rootDir>/test/'],
  testMatch: ['**/*.(int.test|test).(ts)'],
};
