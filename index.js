/**
 * { item_description }
 */

// Set Config root dir
process.env.NODE_CONFIG_DIR = 'config/server';

// Allow config mutations
process.env.ALLOW_CONFIG_MUTATIONS = true;

// Enable Newrelic Reporting if the server is in a production environment
global.newrelic = null;
if (process.env.NODE_ENV === 'production') {
  global.newrelic = require('newrelic');
}

var Server = require('./dist/index').default;
var server = new Server();

server.start();
