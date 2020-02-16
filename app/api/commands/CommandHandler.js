import MinecraftServer from "../../MinecraftServer";
import CommandExecutor from "./CommandExecutor";
import CommandContext from "./CommandContext";
import Client from "./../../Client";

export default class CommandHandler {
    constructor(server) {
        /**
         * @type {MinecraftServer}
         */
        this.server = server;
        /**
         * @type {Map<string, CommandExecutor>}
         */
        this.commands = new Map();
    }

    /**
     * @callback commandCallback
     * @param {CommandContext} context
     */
    /**
     * @param {Plugin} plugin
     * @param {object} options
     * @param {commandCallback} callback
     */
    addCommand(plugin, options, callback) {
        if(!options.name) throw new Error("Must contain command name");
        const executor = new CommandExecutor(this, plugin, options, callback);
        this.commands.set(options.name, executor);
        if ('aliases' in options) {
            for(let alias of options.aliases) {
                this.commands.set(alias, executor);
            }
        }
    }

    removeCommand(name) {
        this.commands.delete(name);
    }

    /**
     * @param {any} sender the command sender
     * @param {string} str the command string
     */
    runCommand(sender, str) {
        const label = str.split(" ")[0].toLowerCase();
        try {
            
            if (!this.commands.has(label)) {
                if(sender instanceof Client) sender.sendMessage({ text: "Unknown command", color: "red" });
                return false;
            };

            const executor = this.commands.get(label);
            const args = str.substring(label.length + 1);
            const context = new CommandContext(this, sender, executor, label, args);

            executor.call(context);
        } catch(e) {
            console.error("Error while executing command " + label);
            console.error(e.stack);
        }
    }
}