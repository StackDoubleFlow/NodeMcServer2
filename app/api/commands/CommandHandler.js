import MinecraftServer from "../../MinecraftServer";

class CommandHandler {
    constructor(server) {
        /**
         * @type {MinecraftServer}
         */
        this.server = server;
        this.commands = Map();
    }

    addCommand(plugin, options, callback) {

    }
}

module.exports = CommandHandler;