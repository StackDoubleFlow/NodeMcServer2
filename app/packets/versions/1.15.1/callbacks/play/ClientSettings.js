import Client from "../../../../../Client";

const utils = require("../../../../../utils");

/**
 * @param {Client} player
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
  utils.writeVarInt(entityMetadata, player.entityID);
  utils.writeByte(entityMetadata, 16); // Displayed Skin Parts
  utils.writeVarInt(entityMetadata, 0);
  utils.writeByte(entityMetadata, player.displayedSkinParts);
  utils.writeByte(entityMetadata, 0xff); // End of metadata
  player.server.writePacketToAll(0x44, entityMetadata, "play", "EntityMetadata"/*, [player]*/);
};