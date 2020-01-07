import Player from "../../../../../Player";

const utils = require("../../../../../utils");

/**
 * @param {Player} player
 * @param {number} dataLength
 */
module.exports = (player, dataLength) => {
  const hand = utils.readVarInt(player);
  const animation = utils.createBufferObject();
  utils.writeVarInt(player.entityID, animation);
  utils.writeByte(hand == 0 ? 0 : 3, animation);
  player.server.writePacketToAll(0x06, animation, "play", "Animation", [player]);
};