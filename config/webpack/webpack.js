const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');

// This is not particularly robust...
const root = process.cwd();
const entry = 'src/arbiter.js';

module.exports = {
  target: 'node',
  cache: false,
  devtool: 'source-map',
  entry: [
    "babel-polyfill",
    path.join(root, entry)
  ],
  resolve: {
    modules: [
      path.join(root, 'node_modules'),
      path.join(root, 'static'),
    ],
    alias: {
      configuration: path.join(root, 'config'),
      server: path.join(root, 'src/server'),
      views: path.join(root, 'src/views'),
      static: path.join(root, 'static'),
      'pg-native': path.join(root, 'aliases/pg-native.js')
    },
    aliasFields: ['browser'],
    extensions: ['.json', '.js', '.min.js']
  },
  module: {
    rules: [
      {
        test: /\.(html|ejs)$/,
        use: 'html-loader'
      },
      {
        test: /\.(ico|gif|png|jpg|jpeg|svg|webp)$/,
        use: [
          {
            loader: 'file?context=static&name=/[path][name].[ext]',
            options: {
              exclude: /node_modules/
            }
          }
        ]
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
        exclude: /node_modules/
      },
      {
        test: /\.y(a)?ml$/,
        loader: 'yml-loader',
        exclude: /node_modules/
      }
    ],
    noParse: /\.min\.js/
  },
  externals: [nodeExternals()],
  plugins: [
    new webpack.EnvironmentPlugin({
      DEBUG: false,
      __CLIENT__: false,
      __SERVER__: true,
      __PRODUCTION__: false,
      __DEV__: true
    })
  ],
  output: {
    chunkFilename: '[name].[id].js',
    filename: 'index.js',
    library: 'Arbiter',
    libraryTarget: "commonjs-module",
    path: path.join(root, 'dist/')
  }
};
