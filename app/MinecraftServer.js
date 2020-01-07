import Player from "./Player";

var net = require('net');
var fs = require('fs');
var crypto = require('crypto');
var World = require('./world/World');
var utils = require('./utils');
var path = require('path');
const ConsoleInterface = require("./console/ConsoleInterface.js");
const Item = require("./world/Item");
const CommandHandler = require("./api/commands/CommandHandler").default;

class MinecraftServer {

    /**
     * Initializes a minecraft server
     * 
     */
    constructor() {
        this.sendMessage("Starting server...");
        this.tcpServer = net.createServer(this.onClientConnected.bind(this));
        /**
         * @type {Array<Player>}
         */
        this.onlinePlayers = [];

        this.sendMessage("Loading config");

        this.config = JSON.parse(fs.readFileSync(__dirname + "/../config.json").toString('utf-8'));
        if(!this.config) console.error("Unable to find config file");

        this.sendMessage("Loading icon(s)");
        
        this.icons = [];
        try {
            const iconPath = this.config["icon_file"];
            const iconStat = fs.statSync(iconPath);
            if (iconStat.isFile()) {
                this.icons.push(Buffer.from(fs.readFileSync(iconPath)).toString('base64'));
            } else if (iconStat.isDirectory()) {
                const files = fs.readdirSync(iconPath);
                files.forEach(file => {
                    if (!file.endsWith(".png")) return;
                    this.icons.push(Buffer.from(fs.readFileSync(path.join(iconPath, file))).toString('base64'));
                });
            }
        } catch(ignore) {}
        
        if(this.icons.length === 0) console.error("Unable to find valid icon file");

        this.sendMessage("Generating encryption KeyPair");

        this.encryptionPassphrase = '';
        var { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 1024, 
            publicExponent: 65537,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs1',
                format: 'pem',
                cipher: 'aes-128-cfb8',
                passphrase: this.encryptionPassphrase
            }
        });
        this.publicKeyPEM = publicKey;
        this.publicKeyDER = Buffer.from(this.publicKeyPEM.substr(27, 219), 'base64'); // Convert PEM to DER
        this.privateKeyPEM = privateKey;
        this.encryptionPadding = crypto.constants.RSA_PKCS1_PADDING;

        this.sendMessage("Loading world");

        this.world = new World("test_world");

        /**
         * @type {ConsoleInterface}
         */
        this.console = new ConsoleInterface(this);
        Item.setRegistry(require("./generated_data/1.14/reports/registries.json")['minecraft:item']);
        /**
         * @type {CommandHandler}
         */
        this.commandHandler = new CommandHandler(this);
        
        /**
         * Player properties
         * @type {Map<string, Object>}
         */
        this.playerPropertyCache = new Map();

        /**
         * The time of the last keep alive sent 
         */
        this.timeOfLastKeepAlive = 0;

        setInterval(this.sendKeepAlive.bind(this), 15000);

        this.commandHandler.addCommand(this, {name: "stop"}, (context) => {
            this.stop();
        });
        this.commandHandler.addCommand(this, {name: "leave"}, (context) => {
            if(!context.isSenderPlayer()) return;
            context.sender.kick("Bye bye!");
        });
        this.commandHandler.addCommand(this, {name: "eval"}, (context) => {
            context.sender.sendMessage("" + eval(context.argString));
        });
        this.commandHandler.addCommand(this, {name: "kick"}, (context) => {
            if (context.args.length === 0) {
                context.sender.sendMessage({
                    text: "You must specify a player",
                    color: "red"
                });
                return;
            }
            
            const player = this.getOnlinePlayer(context.args[0]);

            if (!player) {
                context.sender.sendMessage({
                    text: "Player '" + context.args[0] + "' not found",
                    color: "red"
                });
                return;
            }

            let message = {text: "Kicked by an admin", color: "gold"};

            if (context.args.length > 1) {
                message = context.argString.substr(context.args[0].length + 1);
            }

            player.kick(message);
        });
        this.commandHandler.addCommand(this, {name: "tell", aliases: ["w", "whisper", "msg", "message"]}, (context) => {
            if (context.args.length === 0) {
                context.sender.sendMessage({
                    text: "You must specify a recipient and message",
                    color: "red"
                });
                return;
            } else if(context.args.length === 1) {
                context.sender.sendMessage({
                    text: "You must supply a message",
                    color: "red"
                });
                return;
            }

            const player = this.getOnlinePlayer(context.args[0]);

            if (!player) {
                context.sender.sendMessage({
                    text: "Player '" + context.args[0] + "' not found",
                    color: "red"
                });
                return;
            }
            
            const message = context.argString.substr(context.args[0].length + 1);

            context.sender.lastMessaged = player;
            player.lastMessaged = context.sender;

            context.sender.sendMessage({
                text: "[ Me -> " + player.username + " ] " + message
            });

            player.sendMessage({
                text: "[ " + context.sender.username + " -> Me ] " + message
            });
        });
        
        this.commandHandler.addCommand(this, {name: "reply", aliases: ["r"]}, (context) => {
            if(context.args.length === 0) {
                context.sender.sendMessage({
                    text: "You must supply a message",
                    color: "red"
                });
                return;
            }

            if (!context.sender.lastMessaged) {
                context.sender.sendMessage({
                    text: "You have no one to reply to",
                    color: "red"
                });
                return;
            }

            const player = context.sender.lastMessaged;
            const message = context.argString;

            context.sender.sendMessage({
                text: "[ Me -> " + player.username + " ] " + message
            });

            player.sendMessage({
                text: "[ " + context.sender.username + " -> Me ] " + message
            });
        });

        this.username = "CONSOLE";
        this.uuid = null;
        this.lastTick = 0;
        this.tickCount = 0;

        this.tick();
    }

    tick() {
        this.lastTick = (new Date()).getTime();

        // Do ticky stuff
        // TODO: RTS

        if(this.tickCount % 20 === 0) {
            // Update world time
        }

        if (this.tickCount % 2 == 0) {
            // Redstone
        }

        this.tickCount++;
        setTimeout(() => this.tick(), 50 - ((new Date()).getTime() - this.lastTick));
    }

    sendMessage(msg) {
        console.log(msg);
    }

    getOnlinePlayer(query) {
        query = query.toLowerCase();

        const options = [];

        const uuidSearch = this.onlinePlayers.find(v => v.UUID.toLowerCase() === query);
        if(uuidSearch) return uuidSearch;

        const fullSearch = this.onlinePlayers.find(v => v.username.toLowerCase() === query);
        if(fullSearch) return fullSearch;

        const firstSearch = this.onlinePlayers.find(v => v.username.toLowerCase().startsWith(query));
        if(firstSearch) return firstSearch;

        return null;
    }

    sendKeepAlive() {
        var keepAlive = utils.createBufferObject();
        this.timeOfLastKeepAlive = new Date().getTime();
        utils.writeLong(this.timeOfLastKeepAlive, keepAlive);
        this.writePacketToAll(0x21, keepAlive, "play", "KeepAlive");
    }

    /**
     * Get called whenever a client connects
     * 
     * @param {net.Socket} socket 
     */
    onClientConnected(socket) {
        var player = new Player(socket, this);
    }

    /**
     * Gets called whenever a player connects
     * 
     * @param {Player} player 
     */
    onPlayerConnected(player) {
        this.onlinePlayers.push(player);
        player.isOnline = true;
        this.broadcast({
            text: "",
            extra: [
                {
                    text: "[",
                    color: "dark_gray",
                    bold: true
                },
                {
                    text: "+",
                    color: "dark_green"
                },
                {
                    text: "] ",
                    color: "dark_gray",
                    bold: true
                },
                player.chatName("gray")
            ]
        });
        this.sendKeepAlive();
        
    }

    /**
     * Gets called whenever a player disconnects
     * 
     * @param {Player} player 
     */
    onPlayerDisconnected(player) {
        this.onlinePlayers.forEach((onlinePlayer, i) => {
            if(onlinePlayer === player) {
                this.onlinePlayers.splice(i, 1);
            }
        });
        
        this.broadcast({
            text: "",
            extra: [
                {
                    text: "[",
                    color: "dark_gray",
                    bold: true
                },
                {
                    text: "-",
                    color: "dark_red"
                },
                {
                    text: "] ",
                    color: "dark_gray",
                    bold: true
                },
                player.chatName("gray")
            ]
        }, 1);

        var playerInfo = utils.createBufferObject();
        utils.writeVarInt(4, playerInfo); // Action (Remove Player)
        utils.writeVarInt(1, playerInfo); // Number of players
        utils.writeUUID(player, playerInfo) // UUID
        this.writePacketToAll(0x34, playerInfo, "play", "PlayerInfo");

    }

    /**
     * Lets the server listen on a specific port
     * 
     * @param {number} port 
     */
    listen(port) {
        this.sendMessage("Binding port");
        this.tcpServer.listen(port);
        this.sendMessage("Server listening on port " + port);
    }

    /**
     * Writes a packet to all player
     * 
     * @param {number} packetID 
     * The ID of the packet to write in the header
     * @param {Object} data 
     * The data of the packet
     * @param {string} state
     * The state of the packet used for logging
     * @param {string} name
     * The name of the packet used for logging
     * @param {Array<Player>} exeptions
     * Players to not send the packet to
     */
    writePacketToAll(packetID, data, state, name, exeptions=[]) {
        for(let player of this.onlinePlayers) {
            if(exeptions.includes(player)) continue;
            try {
                utils.writePacket(packetID, data, player, state, name);
            } catch(e) {
                console.error(e.message, e.stack);
            }
        }
    }
    
    broadcast(message, type=1) {
        if (typeof message === "string")
            message = { "text": message };
        
        const response = utils.createBufferObject();

        utils.writeJson(message, 32767, response);
        utils.writeByte(type, response);

        this.writePacketToAll(0x0F, response, "play", "ChatMessage");
    }

    stop() {
        this.broadcast({
            text: "Stopping server...",
            color: "red"
        });

        for (let player of this.onlinePlayers) {
            player.kick({
                text: "Server closed",
                color: "red"
            })
        }

        process.exit();
    }
}

module.exports = MinecraftServer;