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

  if (status === 0) {
    const blockBreak = utils.createBufferObject();
    utils.writePosition(blockBreak, pos);
    utils.writeVarInt(blockBreak, 0);

    const blockBreakParticle = utils.createBufferObject();
    utils.writeInt(blockBreakParticle, 2001);
    utils.writePosition(blockBreakParticle, pos);
    utils.writeInt(blockBreakParticle, player.server.world.getBlockState(pos.x, pos.y, pos.z));
    utils.writeByte(blockBreakParticle, 0);
    player.server.writePacketToAll(0x0C, blockBreak, "play", "BlockUpdate", [player]);
    player.server.writePacketToAll(0x23, blockBreakParticle, "play", "Effect", [player]);
    player.server.world.setBlockState(pos.x, pos.y, pos.z, 0);
  }


};