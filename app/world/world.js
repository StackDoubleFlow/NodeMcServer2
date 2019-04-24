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

    getChunkPosition(x, z) {

    }

    getChunkPacket(x, z, fullChunk) {
        var fullPacket = utils.createBufferObject();
        utils.writeInt(x, fullPacket);
        utils.writeInt(z, fullPacket);
        utils.writeByte(fullChunk ? 1 : 0, fullPacket);
        // Chunk data
        this.getChunkData(x, z, fullPacket);
        // Primary Bit Mask
        utils.writeVarInt(0x8, fullPacket);
        // Block Entities
        utils.writeVarInt(0, fullPacket);

        return fullPacket;
    }

    getChunkData(x, z, fullPacket) {
        var buffer = utils.createBufferObject();
        // Chunk sections
        utils.appendData(buffer, this.getChunkSection(x, 0, z));
        utils.appendData(buffer, this.getChunkSection(x, 1, z));
        utils.appendData(buffer, this.getChunkSection(x, 2, z));
        utils.appendData(buffer, this.getChunkSection(x, 3, z));
        utils.appendData(buffer, this.getChunkSection(x, 4, z));
        utils.appendData(buffer, this.getChunkSection(x, 5, z));
        utils.appendData(buffer, this.getChunkSection(x, 6, z));
        utils.appendData(buffer, this.getChunkSection(x, 7, z));
        // Biomes
        for(var i = 0; i < 256; i++) {
            utils.writeInt(0, buffer);
        }
        utils.writeVarInt(buffer.b.byteLength);
        utils.writeByteArray(buffer.b);
    }

    getChunkSection(x, y, z, palette) {
        var chunkSection = utils.createBufferObject();
        // This cannot be any more than 32
        var bitsPerBlock = 4;
        utils.writeByte(bitsPerBlock, chunkSection);
        // Palette
        utils.writeVarInt(1, chunkSection);
        utils.writeVarInt(1, chunkSection);
        // Data Array
        var longs = [];
        var longLow = 0;
        var longHigh = 0;
        for(var yCurrent = 0; yCurrent < 16; yCurrent++) {
            for(var zCurrent = 0; zCurrent < 16; zCurrent++) {
                for(var xCurrent = 0; xCurrent < 16; xCurrent++) {
                    // Testing block state
                    var blockStateID = 0;
                    var blockIndex = (((yCurrent * 16) + zCurrent) * 16) + xCurrent;
                    var longOffset = (blockIndex * bitsPerBlock) % 64;
                    if(longOffset < 64 && longOffset + bitsPerBlock - 1 >= 64) {
                        longHigh |= (blockStateID << longOffset) & 0xFFFFFF;
                        var temp = Buffer.alloc(8);
                        temp.writeInt32BE(longHigh);
                        temp.writeInt32BE(longLow, 4);
                        longs.push(temp);
                        longLow = longHigh = 0;
                        longLow |= blockStateID >> (64 - longOffset);
                        //console.log(longIndex, endingLongIndex, longOffset, temp.toString('hex'), 64 - longOffset);
                    } else if(longOffset < 32 && longOffset + bitsPerBlock - 1 >= 32) {
                        longLow |= (blockStateID << longOffset) & 0xFFFFFF;
                        longHigh |= blockStateID >> (32 - longOffset - 1);
                    } else if(longOffset < 32) {
                        longLow |= blockStateID << longOffset;
                    } else {
                        longHigh |= blockStateID << longOffset;
                    }
                    if(64 - longOffset == bitsPerBlock) {
                        var temp = Buffer.alloc(8);
                        temp.writeInt32BE(longHigh);
                        temp.writeInt32BE(longLow, 4);
                        longs.push(temp);
                        longLow = longHigh = 0;
                        //console.log(longIndex, endingLongIndex, longOffset, temp.toString('hex'), 64 - longOffset);
                    }
                }
            }
        }
        utils.writeByteArray(Buffer.concat(longs), chunkSection);
        // Block Light
        utils.writeByteArray(Buffer.alloc(2048, 0xFF), chunkSection);
        console.log(longs.length);
        // Sky Light
        utils.writeByteArray(Buffer.alloc(2048, 0xFF), chunkSection);
        return chunkSection;

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