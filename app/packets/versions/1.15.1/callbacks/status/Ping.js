import Player from "../../../../../Player";

const utils = require("../../../../../utils");

/**
 * @param {Player} player
 * @param {number} dataLength
 */
module.exports = (player, dataLength) => {
  const payload = utils.readLong(player);
  const pong = utils.createBufferObject();
  utils.writeLong(pong, payload);
  utils.writePacket(0x01, pong, player, "stat", "Pong");
};