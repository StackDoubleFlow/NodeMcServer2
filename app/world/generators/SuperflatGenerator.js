import Generator from "../Generator";
import { blockIdToStateId } from "../../utils"

export default class SuperflatGenerator extends Generator {
  getChunk(x, z) {
    const sections = new Array(16);

    sections[0] = new Array(4096);

    for(let x = 0; x < 16; x++) {
      for(let y = 0; y < 16; y++) {
        for(let z = 0; z < 16; z++) {
          const blockIndex = (y * 256) + (z * 16) + x;

          if(y === 0) {
            sections[0][blockIndex] = blockIdToStateId("1.15.2", "minecraft:bedrock");
          } else if(y === 1 || y === 2) {
            sections[0][blockIndex] = blockIdToStateId("1.15.2", "minecraft:dirt");
          } else if(y === 3) {
            sections[0][blockIndex] = blockIdToStateId("1.15.2", "minecraft:grass_block");
          } else {
            sections[0][blockIndex] = 0;
          }
        }
      }
    }

    return sections;
  }
}