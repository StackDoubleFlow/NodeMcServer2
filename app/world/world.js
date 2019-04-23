var fs = require('fs');

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

    getChunkData(x, y) {
        
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