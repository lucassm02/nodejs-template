module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: '24' }, modules: false }],
    '@babel/preset-typescript'
  ],
  plugins: [
    './script/babel/dynamic-import-extension.cjs',
    [
      'module-resolver',
      {
        alias: {
          '@': './src'
        }
      }
    ],
    '@babel/plugin-transform-modules-commonjs',
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-proposal-private-property-in-object', { loose: true }]
  ]
};
