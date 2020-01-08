var fs = require('fs');
var utils = require('../utils.js');
var zlib = require('zlib');

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
    constructor(path) {
        // this.path = "./" + path;
        // const fileExists = fs.existsSync(path);
        // const isDirectory = fs.lstatSync(path).isDirectory();
        // if(isDirectory) {
        //     this.loadWorld();
        // } else {
        //     console.log("Unable to load world!");
        // }
    }

    getChunkPosition(x, z) {

    }

    getChunkPacket(x, z, fullChunk) {
        const fullPacket = utils.createBufferObject();
        utils.writeInt(fullPacket, x);
        utils.writeInt(fullPacket, z);
        utils.writeByte(fullPacket, 1);
        utils.writeVarInt(fullPacket, 0x1);
        // Heightmaps
        utils.writeHeightmap(fullPacket);
        if(fullChunk) {
            // Biomes
            for(let i = 0; i < 1024; i++) {
                utils.writeInt(fullPacket, 0);
            }
        }
        // Chunk data
        this.getChunkData(x, z, fullPacket);
        // Block Entities
        utils.writeVarInt(fullPacket, 0);

        return fullPacket;
    }

    getChunkData(x, z, fullPacket) {
        const data = utils.createBufferObject();
        // Chunk sections
        utils.writeVarInt(data, 3);
        utils.appendData(data, this.getChunkSection(x, 0, z));
        //utils.appendData(data, this.getChunkSection(x, 1, z));
        //utils.appendData(data, this.getChunkSection(x, 2, z));
        //utils.appendData(data, this.getChunkSection(x, 3, z));
        //utils.appendData(data, this.getChunkSection(x, 4, z));
        //utils.appendData(data, this.getChunkSection(x, 5, z));
        //utils.appendData(data, this.getChunkSection(x, 6, z));
        //utils.appendData(data, this.getChunkSection(x, 7, z));
        //utils.appendData(data, this.getChunkSection(x, 8, z));
        //utils.appendData(data, this.getChunkSection(x, 9, z));
        utils.appendData(data, this.getChunkSection(x, 10, z));
        //utils.appendData(data, this.getChunkSection(x, 11, z));
        //utils.appendData(data, this.getChunkSection(x, 12, z));
        //utils.appendData(data, this.getChunkSection(x, 13, z));
        //utils.appendData(data, this.getChunkSection(x, 14, z));
        utils.appendData(data, this.getChunkSection(x, 15, z));
        // Write length in bytes
        utils.writeVarInt(fullPacket, data.b.length);
        // Write data structures
        utils.appendData(fullPacket, data.b);
    }

    getChunkSection(x, y, z, palette) {
        const chunkSection = utils.createBufferObject();
        // Block Count
        utils.writeUShort(chunkSection, 16*16*16);
        // This cannot be any more than 32
        const bitsPerBlock = 4;
        utils.writeByte(chunkSection, bitsPerBlock);
        // Palette
        utils.writeVarInt(chunkSection, 1);
        utils.writeVarInt(chunkSection, 1);
        // Data Array
        const longs = [];
        let longLow = 0;
        let longHigh = 0;
        for(let yCurrent = 0; yCurrent < 16; yCurrent++) {
            for(let zCurrent = 0; zCurrent < 16; zCurrent++) {
                for(let xCurrent = 0; xCurrent < 16; xCurrent++) {
                    // Testing block state
                    const blockStateID = 0;
                    const blockIndex = (((yCurrent * 16) + zCurrent) * 16) + xCurrent;
                    const longOffset = (blockIndex * bitsPerBlock) % 64;
                    if(longOffset < 64 && longOffset + bitsPerBlock - 1 >= 64) {
                        longHigh |= (blockStateID << longOffset) & 0xFFFFFF;
                        const temp = Buffer.alloc(8);
                        temp.writeInt32BE(longHigh);
                        temp.writeInt32BE(longLow, 4);
                        longs.push(temp);
                        longLow = longHigh = 0;
                        longLow |= blockStateID >> (64 - longOffset);
                    } else if(longOffset < 32 && longOffset + bitsPerBlock - 1 >= 32) {
                        longLow |= (blockStateID << longOffset) & 0xFFFFFF;
                        longHigh |= blockStateID >> (32 - longOffset - 1);
                    } else if(longOffset < 32) {
                        longLow |= blockStateID << longOffset;
                    } else {
                        longHigh |= blockStateID << longOffset;
                    }
                    if(64 - longOffset == bitsPerBlock) {
                        const temp = Buffer.alloc(8);
                        temp.writeInt32BE(longHigh);
                        temp.writeInt32BE(longLow, 4);
                        longs.push(temp);
                        longLow = longHigh = 0;
                    }
                }
            }
        }
        utils.writeVarInt(chunkSection, longs.length);
        utils.writeByteArray(chunkSection, Buffer.concat(longs));
        return chunkSection.b;    
    }


    loadWorld() {
        const levelFile = fs.readFileSync(this.path + "/level.dat");
        const levelRaw = zlib.gunzipSync(levelFile);
        const levelNbt = utils.readNBT(levelRaw);
    }

}

module.exports = World;