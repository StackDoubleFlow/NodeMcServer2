import Client from "../../../../../Client";

const utils = require("../../../../../utils");

/**
 * @param {Client} player
 * @param {number} dataLength
 */
module.exports = (player, dataLength) => {
  const username = utils.readString(player, 16);
  player.username = username;
  const encryptionRequest = utils.createBufferObject();
  utils.writeString(encryptionRequest, "", 20);
  utils.writeByteArray(encryptionRequest, player.server.publicKeyDER, true);
  utils.writeByteArray(encryptionRequest, player.verifyToken, true);
  utils.writePacket(0x01, encryptionRequest, player, "logn", "EncryptionRequest");
};