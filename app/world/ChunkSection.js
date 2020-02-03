import { writeNumsToNLongBuffer, writeVarInt, writeUShort, writeByte, appendData, createBufferObject } from "../utils";

export default class ChunkSection {
  constructor(chunk, y, data) {
    if(data) {
      this.blockStates = data;
    } else {
      this.blockStates = new Array(4096).fill(0);
    }
    this.chunk = chunk;
    this.y = y;
  }

  setBlockState(x, y, z, state) {
    const blockIndex = (y * 256) + (z * 16) + x;
    this.blockStates[blockIndex] = state;
  }

  getBlockState(x, y, z) {
    const blockIndex = (y * 256) + (z * 16) + x;
    return this.blockStates[blockIndex];
  }

  setBlockState(x, y, z, state) {
    const blockIndex = (y * 256) + (z * 16) + x;
    this.blockStates[blockIndex] = state;
  }

  calcualtePalette() {
    const states = [...(new Set(this.blockStates))];
    const bitsPerBlock = Math.max(4, Math.floor(Math.log(states.length) / Math.log(2)) + 1);
    return { states, bitsPerBlock };
  }

  calcualteBlockCount() {
    let blockCount = 0;
    this.blockStates.forEach(state => {
      if(state) blockCount++;
    });
    return blockCount;
  }

  getChunkSectionData() {
    const palette = this.calcualtePalette();

    const chunkSection = createBufferObject();
    
    writeUShort(chunkSection, this.calcualteBlockCount());
    writeByte(chunkSection, palette.bitsPerBlock);
    
    if(palette.bitsPerBlock < 9) {
      writeVarInt(chunkSection, palette.states.length);
      palette.states.forEach(state => writeVarInt(chunkSection, state));

      const paletteRefs = [];
      this.blockStates.forEach(state => {
        paletteRefs.push(palette.states.indexOf(state));
      });

      writeNumsToNLongBuffer(chunkSection, palette.bitsPerBlock, paletteRefs);
    } else {
      writeNumsToNLongBuffer(chunkSection, palette.bitsPerBlock, this.blockStates);
    }

    return chunkSection.b;
  }
}