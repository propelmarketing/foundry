const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');
const path = require('path');

const root = process.cwd();

module.exports = {
  output: {
    devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]'
  },
  resolve: {
    modules: [
      path.join(root, 'node_modules')
    ],
  },
  module: {
    loaders: [
      {
        test: /\.(html|ejs)$/,
        use: 'html-loader'
      },
      {
        test: /\.js$/,
        loader: "babel-loader",
        exclude: [/node_modules/, /json/],
      }
    ],
    noParse: [
      /sinon/,
      /iconv-loader/
    ]
  },
  target: 'node',
  externals: [nodeExternals()],
  devtool: "source-map"
};
