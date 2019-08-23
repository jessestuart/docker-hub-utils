module.exports = {
  compact: true,
  comments: false,
  sourceRoot: 'src/',
  ignore: ['*.spec.ts'],
  presets: ['@babel/preset-env', '@babel/preset-typescript', 'minify'],
  plugins: [
    '@babel/plugin-transform-runtime',
    '@babel/plugin-proposal-object-rest-spread',
    'lodash',
    ['module-resolver', { root: './src', extensions: ['.ts', '.json'] }],
  ],
}

module.exports = {
  compact: true,
  comments: false,
  sourceRoot: 'src/',
  ignore: ['*.spec.ts'],
  presets: ['@babel/preset-env', '@babel/preset-typescript', 'minify'],
  plugins: [
    '@babel/plugin-transform-runtime',
    '@babel/plugin-proposal-object-rest-spread',
    'lodash',
    ['module-resolver', { root: './src', extensions: ['.ts', '.json'] }],
  ],
}
