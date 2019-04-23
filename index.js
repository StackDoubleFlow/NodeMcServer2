
'use strict';

var MinecraftServer = require('./app/minecraft_server');
console.log("Starting server...");

var server = new MinecraftServer();
console.log("Binding port");
server.listen(require('./config.json').port);
