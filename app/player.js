
'use strict'

var net = require('net');
var utils = require('./utils');
var PacketManager = require('./packets/packet_manager');
var packets = require('./packets/packets');
var MinecraftServer = require('./minecraft_server');
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
         * The cipher used for encryption
         * @type {crypto.Cipher}
         */
        this.Cipher = undefined;
        /**
         * The entity ID of the player
         */
        this.EntityID = 0;

        packets.registerAllPackets(this.PacketManager);
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
        var length = utils.readVarInt(this);
        var packetID = utils.readVarInt(this);
        this.PacketManager.handlePacket(length, this.State, packetID, this);
        
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
