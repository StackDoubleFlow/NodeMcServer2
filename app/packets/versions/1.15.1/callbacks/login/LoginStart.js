import Player from "../../../../../Player";

const utils = require("../../../../../utils");

/**
 * @param {Player} player
 * @param {number} dataLength
 */
module.exports = (player, dataLength) => {
  const username = utils.readString(player, 16);
  player.username = username;
  const encryptionRequest = utils.createBufferObject();
  utils.writeString("", 20, encryptionRequest);
  utils.writeByteArray(player.server.publicKeyDER, encryptionRequest, true);
  utils.writeByteArray(player.verifyToken, encryptionRequest, true);
  utils.writePacket(0x01, encryptionRequest, player, "logn", "EncryptionRequest");
};