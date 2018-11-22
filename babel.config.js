const config = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          ie: '11'
        }
        // useBuiltIns: 'usage'
      }
    ]
  ]
};

module.exports = config;
