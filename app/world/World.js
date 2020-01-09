var fs = require('fs');
var utils = require('../utils.js');
var zlib = require('zlib');

const SECTION_HEIGHT = 16;
const SECTION_WIDTH = 16;
const SECTION_LENGTH = 16;

export default class World {
    constructor(path) {}

    getChunkPosition(x, z) {}

    getChunkPacket(x, z, fullChunk) {
        const buf = utils.createBufferObject();

        const chunkData = this.getChunkData(x, y);
        
        utils.writeInt(buf, x); // Chunk X
        utils.writeInt(buf, y); // Chunk Y

    }

    getChunkData(x, y) {}

    getChunkSection(x, y, z) {}
}


/**
 * A minecraft world represented in my own format
 * 
 * World format:
 * 
 */
export default class World2 {
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
        utils.writeByte(fullPacket, 0);
        utils.writeVarInt(fullPacket, 0x0000000000000001);
        // Heightmaps
        utils.writeHeightmap(fullPacket);
        // Chunk data
        this.getChunkData(x, z, fullPacket);

        if(false) {
            // Biomes
            for(let i = 0; i < 1024; i++) {
                utils.writeInt(fullPacket, 0);
            }
