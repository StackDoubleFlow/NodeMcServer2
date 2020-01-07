import Player from "../../../../../Player";

const utils = require("../../../../../utils");

/**
 * @param {Player} player
 * @param {number} dataLength
 */
module.exports = (player, dataLength) => {
  const locale = utils.readString(player, 16);
  const viewDistance = utils.readBytes(player, 1);
  const chatMode = utils.readVarInt(player);
  const chatColors = utils.readBoolean(player);
  player.displayedSkinParts = utils.readBytes(player, 1)[0];
  const mainHand = utils.readVarInt(player);

  const entityMetadata = utils.createBufferObject();
  utils.writeVarInt(player.entityID, entityMetadata);
  utils.writeByte(16, entityMetadata); // Displayed Skin Parts
  utils.writeVarInt(0, entityMetadata);
  utils.writeByte(player.displayedSkinParts, entityMetadata);
  utils.writeByte(0xff, entityMetadata); // End of metadata
  player.server.writePacketToAll(0x44, entityMetadata, "play", "EntityMetadata"/*, [player]*/);
};