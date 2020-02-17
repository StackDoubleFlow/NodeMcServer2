import Client from "../../../../../Client";

const utils = require("../../../../../utils");

/**
 * @param {Client} player
 * @param {number} dataLength
 */
module.exports = (player, dataLength) => {
  player.heldItemSlot = utils.readUShort(player);

  const heldItem = player.heldItem;

  const equipmentChangeData = utils.createBufferObject(); 

  utils.writeVarInt(equipmentChangeData, player.entityID);
  utils.writeVarInt(equipmentChangeData, 0);

  if (heldItem) {
    utils.appendData(equipmentChangeData, heldItem.toSlotData("1.15.2").b);
  } else {
    utils.writeByte(equipmentChangeData, 0);
  }

  player.server.writePacketToAll(0x47, equipmentChangeData, "play", "EntityEquipment", [player]);
};