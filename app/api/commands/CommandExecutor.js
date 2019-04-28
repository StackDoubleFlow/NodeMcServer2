import CommandHandler from "./CommandHandler";
import CommandContext from "./CommandContext";
import Plugin from "../plugins/Plugin";

class CommandExecutor {
    /**
     * @param {CommandHandler} handler
     * @param {Plugin} plugin 
     * @param {Object<String, any>} options
     * @param {Function} callback
     */
    constructor(handler, plugin, options, callback) {
        /**
         * @type {CommandHandler}
         */
        this.handler = handler;
        /**
         * @type {Plugin}
         */
        this.plugin = plugin;
        /**
         * @type {Object<String, any>}
         */
        this.options = options;
        /**
         * @type {Function}
         */
        this.callback = callback;
    }

    call(context) {
        return this.callback.bind(this.plugin)(context);
    }
}

module.exports = CommandExecutor;