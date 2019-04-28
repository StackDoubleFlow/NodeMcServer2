
'use strict';

const Player = require('../player');
var utils = require('./../utils');

/**
 * Manages all packets
 */
class PacketManager {


    /**
     * Initializes the packet manager
     * 
     */
    constructor(version="1.14") {
        const versionInfo = require(`./versions/${version}.js`);

        /**
         * Version number
         * 
         * @type {number}
         */
        this.version = versionInfo.version;

        /**
         * Version name
         * 
         * @type {string}
         */
        this.versionName = versionInfo.name;

        /**
         * Packet types
         * 
         * @type {Object<string, Object<number, Object<String, any>>>}
         */
        this.inboundPackets = versionInfo.inboundPackets;

        /**
         * Packet callbacks
         * 
         * @type {Object<string, Object<string, Function>>}
         */
        this.callbacks = versionInfo.callbacks;
    }
    
    /**
     * Gets a packet by using its state and packetID, and returns the callback function
     * 
     * @param {string} state
     * @param {number} packetID
     * @return {PacketCallback} callback
     */
    getPacketCallback(state, packetId) {
        return this.callbacks[this.inboundPackets[state][packetId]];
    }

    /**
     * Handles a packet sent by a player
     * 
     * @param {number} data
     * @param {string} state
     * @param {number} packetId
     * @param {Player} player
     */
    handlePacket(length, state, packetId, player) {
        var packet = this.inboundPackets[state][packetId];

        if (packet === undefined) {
            console.log("Unable to handle packet: " + state + " " + packetId.toString(16));
            utils.readBytes(player, length);
            return;
        }

        var callback = this.callbacks[state][packet.name];

        var oldInternalIndex = player.internalIndex;
        length--;
        if(packet.todo) utils.readBytes(player, length);

        const clientName = player.username || player.tcpSocket.remoteAddress.substr(7);

        if (packet.log) 
            console.log(clientName + "                ".substr(0, 16-clientName.length), "~~ C->S ~~", state, "~", packet.name, packet.todo ? "~ TODO" : "");
        callback(player, length);
        var totalBytesRead = player.internalIndex - oldInternalIndex;
        if(totalBytesRead !== length) {
            console.log(length, totalBytesRead);
        }
    }

}

module.exports = PacketManager;