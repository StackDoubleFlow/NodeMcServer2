import Player from "../../../../../Player";

const utils = require("../../../../../utils");

/**
 * @param {Player} player
 * @param {number} dataLength
 */
module.exports = (player, dataLength) => {
  const status = utils.readVarInt(player);
  const pos = utils.readPosition(player);
  const face = utils.readBytes(player, 1);

  if(status === 0) {
      const blockBreak = utils.createBufferObject();
      utils.writePosition(pos, blockBreak);
      utils.writeVarInt(0, blockBreak);

      const blockBreakParticle = utils.createBufferObject();
      utils.writeInt(2001, blockBreakParticle);
      utils.writePosition(pos, blockBreakParticle);
      utils.writeInt(1, blockBreakParticle);
      utils.writeByte(0, blockBreakParticle);

      player.server.writePacketToAll(0x0C, blockBreak, "play", "BlockUpdate", [player]);
      player.server.writePacketToAll(0x23, blockBreakParticle, "play", "Effect", [player]);
  }
  
  
};