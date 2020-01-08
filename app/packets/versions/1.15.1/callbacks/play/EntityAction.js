import Player from "../../../../../Player";

const utils = require("../../../../../utils");

/**
 * @param {Player} player
 * @param {number} dataLength
 */
module.exports = (player, dataLength, entityId, actionId, jumpBoost) => {

  switch(actionId) {
    case "startSneaking":
      player.isSneaking = true;
      break;
    case "stopSneaking":
      player.isSneaking = false;
      break;
    case "leaveBed":
      break;
    case "startSprinting":
      player.isSprinting = true;
      break;
    case "stopSprinting":
      player.isSprinting = false;
      break;
    case "startHorseJump":
      break;
    case "stopHorseJump":
      break;
    case "openHorseInventory":
      break;
    case "startFlyingWithElytra":
      break;
  }

  const entityMetadata = utils.createBufferObject();
  utils.writeVarInt(entityMetadata, player.entityID);
  utils.writeByte(entityMetadata, 0); // Status meta data (Index 0)
  utils.writeVarInt(entityMetadata, 0); // Byte Type
  utils.writeByte(entityMetadata, player.getStatusMetaDataBitMask());
  utils.writeByte(entityMetadata, 6); // Pose (Index 6)
  utils.writeVarInt(entityMetadata, 18); // Pose Type
  utils.writeVarInt(entityMetadata, player.isSneaking ? 3 : 0);
  utils.writeByte(entityMetadata, 0xff); // End of metadata
  player.server.writePacketToAll(0x44, entityMetadata, "play", "EntityMetadata", [player]);
};