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
  utils.writeVarInt(player.entityID, entityMetadata);
  utils.writeByte(0, entityMetadata); // Status meta data
  utils.writeVarInt(1, entityMetadata);
  utils.writeVarInt(player.getStatusMetaDataBitMask(), entityMetadata);
  utils.writeByte(0xff, entityMetadata); // End of metadata
  player.server.writePacketToAll(0x44, entityMetadata, "play", "EntityMetadata", [player]);
};