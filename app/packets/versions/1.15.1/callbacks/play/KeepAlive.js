import Client from "../../../../../Client";

const utils = require("../../../../../utils");

/**
 * @param {Client} player
 * @param {number} dataLength
 */
module.exports = (player, dataLength) => {
  const keepAliveID = utils.readLong(player);
  const timeSinceLastKeepAlive = new Date().getTime() - player.server.timeOfLastKeepAlive;
  player.ping = timeSinceLastKeepAlive;
  const playerInfo = utils.createBufferObject();
  utils.writeVarInt(playerInfo, 2); // Action (Update Latency)
  utils.writeVarInt(playerInfo, 1); // Number of players
  utils.writeUUID(playerInfo, player) // UUID
  utils.writeVarInt(playerInfo, player.ping);
  player.server.writePacketToAll(0x34, playerInfo, "play", "PlayerInfo");
};