var webpack = require('webpack');
var config = require('./webpack.js');
var wds = {
    hostname: process.env.HOSTNAME || 'localhost',
    port: 8080,
  };

config.cache = true;

config.entry.unshift(
    'webpack/hot/poll?1000'
);

config.output.publicPath = 'http://' + wds.hostname + ':' + wds.port + '/server';

config.plugins.shift();
config.plugins.unshift(
    new webpack.DefinePlugin({
        "process.env": {
            __CLIENT__: false,
            __SERVER__: true,
            __PRODUCTION__: false,
            __DEV__: true,
        }
    })
);
config.plugins.unshift(
  new webpack.HotModuleReplacementPlugin()
);

module.exports = config;
