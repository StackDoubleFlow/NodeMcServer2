import Player from "../../../../../Player";

const utils = require("../../../../../utils");

/**
 * @param {Player} player
 * @param {number} dataLength
 */
module.exports = (player, dataLength, hand) => {  
  player.server.sendPacketToAll("Animation", [player], player.entityID, hand == "main" ? 0 : 3)
};