import Player from "../../../../../Player";

const utils = require("../../../../../utils");

/**
 * @param {Player} player
 * @param {number} dataLength
 */
module.exports = (player, dataLength) => {
  const keepAliveID = utils.readLong(player);
  const timeSinceLastKeepAlive = new Date().getTime() - player.server.timeOfLastKeepAlive;
  player.ping = timeSinceLastKeepAlive;
  const playerInfo = utils.createBufferObject();
  utils.writeVarInt(2, playerInfo); // Action (Update Latency)
  utils.writeVarInt(1, playerInfo); // Number of players
  utils.writeUUID(player, playerInfo) // UUID
  utils.writeVarInt(player.ping, playerInfo);
  player.server.writePacketToAll(0x34, playerInfo, "play", "PlayerInfo");
};