module.exports = {
  coverageDirectory: 'test/coverage/',
  moduleFileExtensions: ['ts', 'js'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '(/__tests__/.*\\.([t]sx?)|(\\.|/)(test|spec))\\.([t]sx?)$',
  transform: { '^.+\\.tsx?$': 'ts-jest' },
  moduleDirectories: ['src', 'node_modules'],
}
