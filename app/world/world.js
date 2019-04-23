var fs = require('fs');
var utils = require('./../utils');

/**
 * A minecraft world represented in my own format
 * 
 * World format:
 * 
 */

class World {
    /**
     * Loads a world
     * 
     * @param {string} filename 
     */
    constructor(filename) {
        this.FilePath = "./" + filename;
        var fileExists = fs.existsSync(filename);
        if(!fileExists) {
            this.generateWorld();
        } else {
            this.checkWorldSignature();
        }
    }

    getChunkData(x, y, fullChunk) {
        var fullPacket = utils.createBufferObject();
        utils.writeInt(x, fullPacket);
        utils.writeInt(y, fullPacket);
        utils.writeByte(fullChunk ? 1 : 0, fullPacket);
        
    }

    generateChunk(x, y) {

    }

    loadWorld() {

    }

    generateWorld() {

    }

    checkWorldSignature() {

    }
}

module.exports = World;