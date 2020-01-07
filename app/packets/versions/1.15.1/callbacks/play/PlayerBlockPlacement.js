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
};