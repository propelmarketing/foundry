/**
 * { item_description }
 */

var Server = require('./dist/index').default;
var server = new Server();

server.start();
