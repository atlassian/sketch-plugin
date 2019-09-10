/* eslint-disable no-param-reassign */
const merge = require('webpack-merge');

module.exports = config => {
  // required for async/await support

  config.entry = ['regenerator-runtime/runtime', config.entry];
  config = merge(config, {
    module: {
      rules: [
        {
          test: /\.(html)$/,
          use: [
            {
              loader: '@skpm/extract-loader',
            },
            {
              loader: 'html-loader',
              options: {
                attrs: ['img:src', 'link:href'],
                interpolate: true,
              },
            },
          ],
        },
      ],
    },
  });
};
