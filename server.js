
'use strict';

var MinecraftServer = require('./app/MinecraftServer.js');

var server = new MinecraftServer();
server.listen(require('./config.json').port);
