import Chunk from "./Chunk";
import * as utils from "../utils";
import SuperflatGenerator from "./generators/SuperflatGenerator";
var fs = require('fs');
var zlib = require('zlib');

/**
 * A minecraft world represented in my own format
 * 
 * World format:
 * 
 */
export default class World {
  /**
   * Loads a world
   * 
   * @param {string} filename 
   */
  constructor(path) {
    this.generator = new SuperflatGenerator(this);
    this.chunks = [];

    // Chunk data
    for (var x = -7; x < 7; x++) {
      for (var z = -7; z < 7; z++) {
        this.getChunkPacket(x, z, true);
      }
    }

    this.difficulty = "creative";
    this.difficultyLocked = false;

    this.dimention = "overworld";
    
  }

  getTopMostBlock(x, z) {
    let chunkX = Math.floor(x / 16);
    let chunkZ = Math.floor(z / 16);
    if (!this.chunks[chunkX]) return 0;
    if (!this.chunks[chunkX][chunkZ]) return 0;
    return this.chunks[chunkX][chunkZ].getTopMostBlock(x - chunkX * 16, z - chunkZ * 16);
  }

  setBlockState(x, y, z, state) {
    let chunkX = Math.floor(x / 16);
    let chunkZ = Math.floor(z / 16);
    
    if (!this.chunks[chunkX]) this.chunks[chunkX] = [];
    if (!this.chunks[chunkX][chunkZ])
      this.chunks[chunkX][chunkZ] = new Chunk(chunkX, chunkZ, this);
    this.chunks[chunkX][chunkZ].setBlockState(x - chunkX * 16, y, z - chunkZ * 16, state);
  }

  getChunkPacket(x, z, fullChunk) {
    if (!this.chunks[x]) this.chunks[x] = [];
    if (!this.chunks[x][z])
      this.chunks[x][z] = new Chunk(x, z, this);

    return this.chunks[x][z].getChunkData();
  }

  loadWorld() {
    const levelFile = fs.readFileSync(this.path + "/level.dat");
    const levelRaw = zlib.gunzipSync(levelFile);
    const levelNbt = utils.readNBT(levelRaw);
  }

}
