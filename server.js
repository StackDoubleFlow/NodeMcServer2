
'use strict';

var MinecraftServer = require('./app/MinecraftServer.js');

var server = new MinecraftServer();
global.server = server;
server.listen(require('./server_data/config.json').port);
