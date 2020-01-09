
'use strict';

// var MinecraftServer = require('./app/MinecraftServer.js');
import { MinecraftServer } from "./app";

var server = new MinecraftServer();
global.server = server;
server.listen(require('./server_data/config.json').port);
