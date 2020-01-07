
'use strict'

import { inflate } from 'zlib';

var net = require('net');
var utils = require('./utils');
var PacketManager = require('./packets/PacketManager');
var MinecraftServer = require('./MinecraftServer');
var crypto = require('crypto');
const Location = require('./world/Location');

export default class Player {
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
         * @type {Location}
         */
        this.location = new Location(server.world, 0, 0, 0, 0, 0);
        /**
         * The player's network state
         * @type {string}
         */
        this.state = "none";
        /**
         * The player's network state
         * @type {net.Socket}
         */
        this.tcpSocket = socket;
        /**
         * If set, packets with be compressed with zlib
         */
        this.usePacketCompression = false;
        /**
         * The PacketManager this player will use
         */
        this.packetManager = new PacketManager();
        /**
         * The server instance
         * @type {MinecraftServer}
         */
        this.server = server;
        /**
         * If set, this player is acually an online player
         */
        this.isOnline = false;
        /**
         * Verify token used for encryption
         */
        this.verifyToken = crypto.randomBytes(4);
        /**
         * The player's username
         */
        this.username = "";
        /**
         * The shared secret used for encryption
         */
        this.sharedSecret = undefined;
        /**
         * Use encryption
         */
        this.useEncryption = false;
        /**
         * Internal buffer used for packet reading
         */
        this.internalBuffer = Buffer.alloc(0);
        /**
         * Index on the InternalBuffer
         */
        this.internalIndex = 0;
        /**
         * UUID of the player
         * @type {string}
         */
        this.UUID = undefined;
        /**
         * Unformatted UUID of the player
         * @type {string}
         */
        this.unformattedUUID = undefined;
        /**
         * The cipher used for encryption
         * @type {crypto.Cipher}
         */
        this.cipher = undefined;
        /**
         * The decipher used for encryption
         * @type {crypto.Decipher}
         */
        this.decipher = undefined;
        /**
         * The player's properties
         */
        this.properties = [];
        /**
         * The entity ID of the player
         */
        this.entityID = 0;
        /**
         * The ping player
         */
        this.ping = -1;
        /**
         * Is true when the player is on the ground
         */
        this.onGround = true;
        /**
         * A bitmask containing all the enabled skin parts
         */
        this.displayedSkinParts = 0;
        this.isSneaking = false;
        this.isSprinting = false;

        this.tcpSocket.on('readable', this.onStreamReadable.bind(this));
        this.tcpSocket.on('end', this.onStreamEnd.bind(this));
        this.tcpSocket.on('error', this.onStreamEnd.bind(this));
    }

    getStatusMetaDataBitMask() {
        let n = 0;

        // TODO: if (this.onFire) n |= 0x01;
        if (this.isSneaking) n |= 0x02;
        if (this.isSprinting) n |= 0x08;
        // TODO: if (this.isSwimming) n |= 0x10;
        // TODO: if (this.isInvisible) n |= 0x20;
        // TODO: if (this.isGlowing) n |= 0x40;
        // TODO: if (this.isFlyingWithElytra) n |= 0x80;

        return n;
    }

    /**
     * Called when the stream is readable
     * 
     */
    onStreamReadable() {
        if(this.tcpSocket.readableLength == 0) return;
        /*if(this.useEncryption) {
            this.decipher.write(this.tcpSocket.read());
            return;
        }*/
        utils.resetInternalBuffer(this);
        while(this.internalIndex < this.internalBuffer.length) {
            this.readNextPacket();
        }
    }
    
    onDecipherReadable() {
        if(this.decipher.readableLength == 0) return;
        utils.resetInternalBufferUsingDecipher(this);
        while(this.internalIndex < this.internalBuffer.length) {
            //console.log(this.internalIndex);
            this.readNextPacket();
        }
    }

    /**
     * Called when the stream ends
     * 
     */
    onStreamEnd() {
        if(this.isOnline) {
            this.server.onPlayerDisconnected(this);
        }
        this.isOnline = false;
    }

    /**
     * Reads the next packet (or tries too)
     * 
     */
    readNextPacket() {
        try {
            if(this.usePacketCompression) {
                var packetLength = utils.readVarInt(this);
                var dataLength = utils.readVarInt(this);
                if (dataLength !== 0) {
                    utils.inflate(dataLength, this);
                    var packetID = utils.readVarInt(this, true);
                    this.packetManager.handlePacket(dataLength-packetID.len, this.state, packetID.val, this);
                } else {
                    var packetID = utils.readVarInt(this);
                    this.packetManager.handlePacket(packetLength - 1, this.state, packetID, this);
                }
            } else {
                var length = utils.readVarInt(this);
                var packetID = utils.readVarInt(this);
                this.packetManager.handlePacket(length, this.state, packetID, this);
            }
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
            "text": this.username,
            "color": special[this.username] || color,
            "clickEvent": {
                "action": "suggest_command",
                "value": "/tell " + this.username + " "
            },
            "hoverEvent": {
                "action": "show_text",
                "value": this.UUID
            }
        };
    }

    sendMessage(message, type=1) {
        if (this.state !== "play") throw Error('Can only send messages to player in "play" state');
        if (typeof message === "string")
            message = { "text": message };
        
        const response = utils.createBufferObject();
        utils.writeJson(message, 32767, response);
        utils.writeByte(type, response);
        utils.writePacket(0x0F, response, this, "play", "ChatMessage");
    }

    kick(reason) {
        if (this.state !== "play") throw Error('Can only kick a player in "play" state');
        if (typeof reason === "string")
            reason = { "text": reason };
        
        const response = utils.createBufferObject();
        utils.writeJson(reason, 32767, response);
        utils.writePacket(0x1B, response, this, "play", "Disconnect");
        
        this.tcpSocket.end();
    }

}
