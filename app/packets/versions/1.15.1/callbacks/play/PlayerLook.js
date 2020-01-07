import Player from "../../../../../Player";

const utils = require("../../../../../utils");

/**
 * @param {Player} player
 * @param {number} dataLength
 */
module.exports = (player, dataLength) => {
  const yaw = player.location.yaw = utils.readFloat(player);
  const pitch = player.location.pitch = utils.readFloat(player);
  const onGround = player.onGround = utils.readBoolean(player);
  const entityLook = utils.createBufferObject();
  utils.writeVarInt(player.entityID, entityLook);
  utils.writeAngle(yaw, entityLook);
  utils.writeAngle(pitch, entityLook);
  utils.writeByte(onGround ? 1 : 0, entityLook);
  player.server.writePacketToAll(0x2B, entityLook, "play", "EntityLook", [player]);

  const entityHeadLook = utils.createBufferObject();
  utils.writeVarInt(player.entityID, entityHeadLook);
  utils.writeAngle(yaw, entityHeadLook);
  player.server.writePacketToAll(0x3C, entityHeadLook, "play", "EntityHeadLook", [player]);
};