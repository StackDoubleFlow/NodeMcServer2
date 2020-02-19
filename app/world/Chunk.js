import ChunkSection from "./ChunkSection";
import { writeInt, writeByte, writeVarInt, createBufferObject, appendData, writeUShort, writeByteArray, blockIdToStateId } from "../utils";
import { writeNBTToPacket } from "../nbt";

export default class Chunk {
  constructor(x, z, world, sections) {
    this.x = x;
    this.z = z;
    this.world = world;
    this.tileEntities = [];

    if (sections) {
      this.sections = sections;
    } else {
      this.sections = new Array(16);

      const data = this.world.generator.getChunk(this.x, this.y);

      for(let s = 0; s < 16; s++) {
        if (data[s]) {
          this.sections[s] = new ChunkSection(this, s, data[s]);
        }
      }
    }
  }

  calculateChunkSectionBitMask() {
    let bitmask = 0;
    for (let i = 0; i < 16; i++)
      if (this.sections[i])
        bitmask |= 1 << i;
    return bitmask;
  }

  getChunkData() {
    const chunkData = createBufferObject();
    const fullChunk = true;

    writeInt(chunkData, this.x);
    writeInt(chunkData, this.z);
    writeByte(chunkData, fullChunk ? 1 : 0); // Full chunk
    writeVarInt(chunkData, this.calculateChunkSectionBitMask()); // Primary Bit Mask
    // Heightmaps
    this.writeHeightmap(chunkData);
    // Biomes
    if (fullChunk) {
      for (let i = 0; i < 1024; i++) {
        writeInt(chunkData, 0);
      }
    }

    // Chunk data
    const sectionsData = createBufferObject();
    this.sections.forEach(section => {
      if (section)
        appendData(sectionsData, section.getChunkSectionData());
    });
    writeVarInt(chunkData, sectionsData.b.length);
    appendData(chunkData, sectionsData.b);

    // Block Entities
    writeVarInt(chunkData, 0);

    return chunkData;
  }

  getBlockState(x, y, z) {
    const sectionY = y >> 4;
    if (!this.sections[sectionY]) return 0;
    return this.sections[sectionY].getBlockState(x, y - sectionY, z);
  }

  setBlockState(x, y, z, state) {
    const sectionY = y >> 4;
    if (!this.sections[sectionY]) 
      this.sections[sectionY] = new ChunkSection(this, sectionY, new Array(4096).fill(0));
    this.sections[sectionY].setBlockState(x, y - sectionY * 16, z, state);
  }

  getTopMostBlock(x, z) {
    for(let s = 15; s >= 0; s--) {
      const section = this.sections[s];
      if(section) {
        for(let y = 15; y >= 0; y--) {
          const blockState = section.getBlockState(x, y, z);

          if(blockState) 
            return (s * 15) + y;
        }
      }
    }

    return 0;
  }

  writeHeightmap(bufferObject) { // TODO: Optimize
    const longs = [];
    const longMask = 0xFFFFFFFFFFFFFFFFn;
    const bitsPerNum = 9;
    for (let i = 0; i < 256; i++) {
      const num = BigInt(this.getTopMostBlock(Math.floor(i / 16), i % 16));
      const longOffset = BigInt((i * bitsPerNum) % 64);
      const longIndex = Math.floor((i * bitsPerNum) / 64)
      let shiftedLong = num << longOffset;
      if (!longs[longIndex]) longs[longIndex] = 0n;
      longs[longIndex] |= shiftedLong & longMask;
      const overflow = shiftedLong & (longMask << 64n);
      if (overflow) {
        if (!longs[longIndex + 1]) longs[longIndex + 1] = 0n;
        longs[longIndex + 1] |= overflow >> 64n;
      }
    }

    writeNBTToPacket(bufferObject, {
      "": {
        type: "compound",
        val: {
            MOTION_BLOCKING: {
            type: "longArray",
            val: longs
          }
        }
      }
    });
  }
}