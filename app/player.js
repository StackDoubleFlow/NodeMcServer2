
'use strict'

var net = require('net');
var utils = require('./utils');
var PacketManager = require('./packets/PacketManager');
var MinecraftServer = require('./MinecraftServer');
var crypto = require('crypto');

class Player {
    /**
     * Initializes a player object
     * 
     * @param {net.Socket} socket
     * The player's TCP socket
     * @param {MinecraftServer} server
     * The server the player is connected too
     */
    constructor(socket, server) {
        /**
         * The player's x position
         * @type {number}
         */
        this.PosX = 0;
        /**
         * The player's y position
         * @type {number}
         */
        this.PosY = 0;
        /**
         * The player's z position
         * @type {number}
         */
        this.PosZ = 0;
        /**
         * The player's network state
         * @type {string}
         */
        this.State = "none";
        /**
         * The player's network state
         * @type {net.Socket}
         */
        this.TCPSocket = socket;
        /**
         * If set, packets with be compressed with zlib
         */
        this.UsePacketCompression = false;
        /**
         * The PacketManager this player will use
         */
        this.PacketManager = new PacketManager();
        /**
         * The server instance
         */
        this.Server = server;
        /**
         * If set, this player is acually a player
         */
        this.IsPlayer = false;
        /**
         * Verify token used for encryption
         */
        this.VerifyToken = crypto.randomBytes(4);
        /**
         * The player's username
         */
        this.Username = "";
        /**
         * The shared secret used for encryption
         */
        this.SharedSecret = undefined;
        /**
         * Use encryption
         */
        this.UseEncryption = false;
        /**
         * Internal buffer used for packet reading
         */
        this.InternalBuffer = Buffer.alloc(0);
        /**
         * Index on the InternalBuffer
         */
        this.InternalIndex = 0;
        /**
         * UUID of the player
         */
        this.UUID = undefined;
        /**
         * Unformatted UUID of the player
         */
        this.UnformattedUUID = undefined;
        /**
         * The cipher used for encryption
         * @type {crypto.Cipher}
         */
        this.Cipher = undefined;
        /**
         * The decipher used for encryption
         * @type {crypto.Decipher}
         */
        this.Decipher = undefined;
        /**
         * The player's properties
         */
        this.Properties = undefined;
        /**
         * The entity ID of the player
         */
        this.EntityID = 0;
        /**
         * The ping player
         */
        this.ping = -1;

        this.TCPSocket.on('readable', this.onStreamReadable.bind(this));
        this.TCPSocket.on('end', this.onStreamEnd.bind(this));
    }

    /**
     * Called when the stream is readable
     * 
     */
    onStreamReadable() {
        if(this.TCPSocket.readableLength == 0) return;
        utils.resetInternalBuffer(this);
        while(this.InternalIndex < this.InternalBuffer.length) {
            this.readNextPacket();
        }
    }

    /**
     * Called when the stream ends
     * 
     */
    onStreamEnd() {
        if(this.IsPlayer) {
            this.Server.onPlayerDisconnected(this);
        }
    }

    /**
     * Reads the next packet (or tries too)
     * 
     */
    readNextPacket() {
        try {
            var length = utils.readVarInt(this);
            var packetID = utils.readVarInt(this);
            this.PacketManager.handlePacket(length, this.State, packetID, this);
        } catch(e) {
            console.error(e.stack);
            /* this.kick({
                "text": "Internal server error",
                "color": "red"
            }); */
        }
        
    }

    chatName(color="white") {
        const special = {
            "Notch": "gold",
            "StackDoubleFlow": "green",
            "AL_1": "aqua"
        };
        return {
            "text": this.Username,
            "color": special[this.Username] || color,
            "clickEvent": {
                "action": "suggest_command",
                "value": "/tell " + this.Username + " "
            },
            "hoverEvent": {
                "action": "show_text",
                "value": this.UUID
            }
        };
    }

    sendMessage(message, type=1) {
        if (this.State !== "play") throw Error('Can only send messages to player in "play" state');
        if (typeof message === "string")
            message = { "text": message };
        
        const response = utils.createBufferObject();
        utils.writeJson(message, 32767, response);
        utils.writeByte(type, response);
        utils.writePacket(0x0E, response, this, "play", "ChatMessage");
    }

    kick(reason) {
        if (this.State !== "play") throw Error('Can only kick a player in "play" state');
        if (typeof reason === "string")
            reason = { "text": reason };
        
        const response = utils.createBufferObject();
        utils.writeJson(reason, 32767, response);
        utils.writePacket(0x1B, response, this, "play", "Disconnect");
        
        this.TCPSocket.end();
    }

    /**
     * Sets a player position
     * 
     * @param {number} x
     * The new x position
     * @param {number} y
     * The new y position
     * @param {number} z
     * The new z position
     */
    setPosition(x, y, z) {
        this.PosX = x;
        this.PosY = y;
        this.PosZ = z;
    }

    /**
     * Moves a player
     * 
     * @param {number} x
     * The x value to move the player by
     * @param {number} y
     * The y value to move the player by
     * @param {number} z
     * The z value to move the player by
     */
    move(x, y, z) {
        this.PosX += x;
        this.PosY += y;
        this.PosZ += z;
    }

}

module.exports = Player;
