import Chunk from "./Chunk";
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
    // const levelFile = fs.readFileSync(this.path + "/level.dat");
    // const levelRaw = zlib.gunzipSync(levelFile);
    // const levelNbt = readNBT(levelRaw);
    const regionFolderPath = this.worldPath + "region/";
    const regionFileNames = fs.readdirSync(regionFolderPath);
    for (const fileName of regionFileNames) {
      const rawFile = fs.readFileSync(regionFolderPath + fileName);
      // const regionX = fileName.split(".")[1];
      // const regionZ = fileName.split(".")[2];
      for (let chunkZ = 0; chunkZ < 32; chunkZ++) {
        for (let chunkX = 0; chunkX < 32; chunkX++) {
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

  loadChunk(chunkData) {
    //console.log(chunkData.toString("hex"));
    fs.writeFileSync("test.nbt", chunkData);
    const chunkNbt = readNBT(chunkData)[""];
    //console.log(chunkNbt.Level.xPos, chunkNbt.Level.zPos);
  }

}
