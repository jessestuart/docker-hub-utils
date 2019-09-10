module.exports = {
  coverageDirectory: 'test/coverage/',
  moduleDirectories: ['src', 'node_modules'],
  moduleFileExtensions: ['ts', 'js'],
  preset: 'ts-jest',
  reporters: ['default', 'jest-junit'],
  testEnvironment: 'node',
  testRegex: '(/__tests__/.*\\.(tsx?)|(\\.|/)(test|spec))\\.(tsx?)$',
  transform: { '^.+\\.tsx?$': 'ts-jest' },
}
