
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
    constructor() {
        /**
         * The total amount of registered packets
         * @type {number}
         */
        this.registeredPackets = 0;
        /**
         * The callbacks of the registed packets
         * @type {Map<string, function>}
         */
        this.callbacks = new Map();
    }

    /**
     * Adds packet to the packet_manager
     * 
     * @param {string} state
     * @param {number} packetID
     * @param {PacketCallback} callback
     */
    registerPacket(state, packetID, callback) {
        this.callbacks.set(state+packetID, callback);
        this.registeredPackets++;
    }


    /**
     * Callback used when the server receives a certain packet
     * 
     * @callback PacketCallback
     * @param {Player} player
     * @param {number} dataLength
     */

    /**
     * Gets a packet by using its state and packetID, and returns the callback function
     * 
     * @param {string} state
     * @param {number} packetID
     * @return {PacketCallback} callback
     */
    getPacketCallback(state, packetID) {
        return this.callbacks.get(state+packetID);
    }

    /**
     * Handles a packet sent by a player
     * 
     * @param {number} data
     * @param {string} state
     * @param {number} packetID
     * @param {Player} player
     */
    handlePacket(length, state, packetID, player) {
        var callback = this.getPacketCallback(state, packetID);
        if(!callback) {
            console.log("Unable to handle packet: " + state + " " + packetID.toString(16));
            utils.readBytes(player, length);
        } else {
            console.log("~~ C->S ~~", state, "~", callback.name.substr(6));
            callback(player, length);
        }
        
    }

}

module.exports = PacketManager;