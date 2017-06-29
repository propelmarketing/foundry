var webpack = require('webpack');
var config = require('./webpack.js');

config.plugins.shift();
config.plugins.unshift(
  new webpack.EnvironmentPlugin({
    NODE_ENV: 'development',
    DEBUG: false,
    __CLIENT__: false,
    __SERVER__: true,
    __PRODUCTION__: false,
    __DEV__: true
  })
);

module.exports = config;
