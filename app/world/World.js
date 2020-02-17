import Chunk from "./Chunk";
import ChunkSection from "./ChunkSection";
import * as utils from "../utils";
import { readNBT } from "../nbt";
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
  constructor(server, path) {
    this.server = server;
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
    this.worldPath = "./server_data/worlds/test_world/";

    this.gamerules = {
      announceAdvancements: true,
      disableElytraMovementCheck: false,
      disableRaids: false,
      doLimitedCrafting: false,
      doPatrolSpawning: true,
      doTraderSpawning: true,
      logAdminCommands: true,
      maxEntityCramming: 24,
      reducedDebugInfo: false,
      spectatorsGenerateChunks: true,
      commandBlockOutput: true,
      doDaylightCycle: true,
      doEntityDrops: true,
      doFireTick: true,
      doInsomnia: true,
      doImmediateRespawn: false,
      doMobLoot: true,
      doMobSpawning: true,
      doTileDrops: true,
      doWeatherCycle: true,
      drowningDamage: true,
      fallDamage: true,
      fireDamage: true,
      keepInventory: false,
      maxCommandChainLength: 65536,
      mobGriefing: true,
      naturalRegeneration: true,
      randomTickSpeed: 3,
      sendCommandFeedback: true,
      showDeathMessages: true,
      spawnRadius: 10
    };
    
    const bigtest = fs.readFileSync("./bigtest.nbt");
    const uncomressedBigtest = zlib.gunzipSync(bigtest);
    //console.log(readNBT(uncomressedBigtest));
    this.loadWorld();
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

    const blockChange = utils.createBufferObject();
    utils.writePosition(blockChange, {x, y, z});
    utils.writeVarInt(blockChange, state);
    this.server.writePacketToAll(0x0C, blockChange, "play", "BlockChange");
  }

  getBlockState(x, y, z) {
    let chunkX = Math.floor(x / 16);
    let chunkZ = Math.floor(z / 16);
    
    if (!this.chunks[chunkX]) this.chunks[chunkX] = [];
    if (!this.chunks[chunkX][chunkZ])
      this.chunks[chunkX][chunkZ] = new Chunk(chunkX, chunkZ, this);
    return this.chunks[chunkX][chunkZ].getBlockState(x - chunkX * 16, y, z - chunkZ * 16);
  }

  getChunkPacket(x, z, fullChunk) {
    if (!this.chunks[x]) this.chunks[x] = [];
    if (!this.chunks[x][z])
      this.chunks[x][z] = new Chunk(x, z, this);

    return this.chunks[x][z].getChunkData();
  }

  loadWorld() {
    // const levelFile = fs.readFileSync(this.worldPath + "/level.dat");
    // const levelRaw = zlib.inflateSync(levelFile);
    // this.levelNbt = readNBT(levelFile);z

    const regionFolderPath = this.worldPath + "region/";
    const regionFileNames = fs.readdirSync(regionFolderPath);

    const totalChunks = regionFileNames.length * 32 * 32;
    let lastP = 0;

    for (const fileName of regionFileNames) {
      const rawFile = fs.readFileSync(regionFolderPath + fileName);
      // const regionX = fileName.split(".")[1];
      // const regionZ = fileName.split(".")[2];
      for (let chunkZ = 0; chunkZ < 32; chunkZ++) {
        for (let chunkX = 0; chunkX < 32; chunkX++) {

          // Loading %
          // -------------------
          const chunkIndex = (chunkZ * 32) + (regionFileNames.indexOf(fileName) * 32 * 32) + chunkX;
          const complete = Math.floor(chunkIndex / totalChunks * 100);

          if (complete != lastP) {
            console.log(complete + "% complete");
            lastP = complete;
          }
          // -------------------
          
          const locationOffset = 4 * ((chunkX & 31) + (chunkZ & 31) * 32);
          const offset = rawFile.readUIntBE(locationOffset, 3) * 4096;
          if (offset == 0) continue;
          // const sectorCount = rawFile.readInt8(locationOffset + 3);
          const length = rawFile.readUInt32BE(offset);
          const compressionType = rawFile.readInt8(offset + 4);
          const rawChunkData = rawFile.slice(offset + 5, (offset + 5) + (length - 1));
          let chunkData;
          if (compressionType == 2) {
            chunkData = zlib.inflateSync(rawChunkData);
          } else {
            console.error("Unable to load chunk: chunk data is compressed wrongly!");
            console.error("Chunk was compressed using type " + compressionType);
            continue;
          }
          this.loadChunk(chunkData);
        }
      }
    }
  }

  smallestEncompassingPowerOfTwo(value) {
    let i = value - 1;
    i = i | i >> 1;
    i = i | i >> 2;
    i = i | i >> 4;
    i = i | i >> 8;
    i = i | i >> 16;
    return i + 1;
 }

  test(value) {
    value = (value & (value - 1)) === 0 ? value : this.smallestEncompassingPowerOfTwo(value);
    return [0, 1, 28, 2, 29, 14, 24, 3, 30, 22, 20, 15, 25, 17, 4, 8, 31, 27, 13, 23, 21, 19, 16, 7, 26, 12, 18, 6, 11, 5, 10, 9][(value * 125613361 >> 27) & 31]
  }

  loadChunk(chunkData) {
    const chunkNbt = readNBT(chunkData)[""];
    fs.writeFileSync("chunk.json", require("json-bigint").stringify(chunkNbt, null, 2));
    const x = chunkNbt.Level.xPos;
    const z = chunkNbt.Level.zPos;
    console.log("Loading chunk " + x + " " + z);
    const chunk = new Chunk(x, z, this, new Array(16));

    if (!this.chunks[x]) this.chunks[x] = [];

    chunkNbt.Level.Sections.shift();
    let timer1 = 0n;
    let timer2 = 0n;

    for(const section of chunkNbt.Level.Sections) {  
      //const bitsPerBlock = Math.max(4, Math.floor(Math.log(section.Palette.length) / Math.log(2)) + 1);
      let startTime = process.hrtime.bigint();
      // ******* Timer 1 *******
      const bitsPerBlock = Math.max(4, this.test(section.Palette.length));
      console.log(bitsPerBlock);
      const paletteIndicies = utils.nBitLongToNums(section.BlockStates, bitsPerBlock);
      const states = new Array(4096);
      // ***********************
      timer1 += process.hrtime.bigint() - startTime;
      startTime = process.hrtime.bigint();
      
      // ******* Timer 2 *******
      for(let i = 0; i < paletteIndicies.length; i++) {
        const paletteIndex = paletteIndicies[i];

        if(paletteIndex != null && paletteIndex < section.Palette.length) {
          const palette = section.Palette[paletteIndex];

          if(!palette) continue;
          
          states[i] = utils.blockIdToStateId("1.15.2", palette.Name, palette.Properties);
        }
      }

      chunk.sections[section.Y] = new ChunkSection(chunk, section.y, states);
      // ***********************

      timer2 += process.hrtime.bigint() - startTime;
    }
    console.log("Timer 1: " + Number(timer1) / 1000000.0 + "ms");
    console.log("Timer 2: " + Number(timer2) / 1000000.0 + "ms");
    
    this.chunks[x][z] = chunk;
  }

}
