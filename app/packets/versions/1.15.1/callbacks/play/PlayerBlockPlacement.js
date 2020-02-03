import Player from "../../../../../Player";

const utils = require("../../../../../utils");

/**
 * @param {Player} player
 * @param {number} dataLength
 */
module.exports = (player, dataLength) => {
  const hand = utils.readVarInt(player);
  const location = utils.readPosition(player);
  const face = utils.readVarInt(player);
  const cursorX = utils.readFloat(player);
  const cursorY = utils.readFloat(player);
  const cursorZ = utils.readFloat(player);
  const insideBlock = utils.readBoolean(player);
  const blockId = utils.blockIdToStateId("1.15.2", "minecraft:wet_sponge");
  console.log(location.x, location.y, location.z);
  player.server.world.setBlockState(location.x, location.y += 1, location.z, blockId);

  const blockChange = utils.createBufferObject();
  utils.writePosition(blockChange, location);
  utils.writeVarInt(blockChange, blockId);
  player.server.writePacketToAll(0x0C, blockChange, "play", "BlockChange", [player]);
};