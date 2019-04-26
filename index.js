
'use strict';

var MinecraftServer = require('./app/MinecraftServer.js');
console.log("Starting server...");

var server = new MinecraftServer();
console.log("Binding port");
server.listen(require('./config.json').port);
