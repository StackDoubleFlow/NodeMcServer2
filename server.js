
'use strict';

// const MinecraftServer = require('./app/MinecraftServer.js');
import { MinecraftServer } from "./app";

const server = new MinecraftServer();
global.server = server;
server.listen(require('./server_data/config.json').port);
