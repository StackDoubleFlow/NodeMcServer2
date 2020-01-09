import CommandHandler from "./CommandHandler";
import CommandExecutor from "./CommandExecutor";
import MinecraftServer from "./../../MinecraftServer";
import Player from "./../../Player";

export default class CommandContext {

    /**
     * @param {CommandHandler} handler
     * @param {*} sender
     * @param {CommandExecutor} command
     * @param {string} label
     * @param {string} args
     */
    constructor(handler, sender, command, label, args) {
        /**
         * @type {CommandHandler}
         */
        this.commandHandler = handler;
        /**
         * @type {MinecraftServer}
         */
        this.server = handler.server;
        /**
         * @type {*}
         */
        this.sender = sender;
        /**
         * @type {Player}
         */
        this.player = sender;
        /**
         * @type {string}
         */
        this.label = label;
        /**
         * @type {string}
         */
        this.argString = args;
        /**
         * @type {Array<string>}
         */
        this.args = args.split(" ");
    }

    isSenderPlayer() {
        return this.sender instanceof Player;
    }

    isSenderServer() {
        return this.sender === this.server;
    }
}