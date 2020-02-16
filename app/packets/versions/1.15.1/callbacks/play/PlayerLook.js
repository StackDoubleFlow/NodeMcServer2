import Client from "../../../../../Client";

const utils = require("../../../../../utils");

/**
 * @param {Client} player
 * @param {number} dataLength
 */
module.exports = (player, dataLength) => {
  const yaw = player.location.yaw = utils.readFloat(player);
  const pitch = player.location.pitch = utils.readFloat(player);
  const onGround = player.onGround = utils.readBoolean(player);
  const entityLook = utils.createBufferObject();
  utils.writeVarInt(entityLook, player.entityID);
  utils.writeAngle(entityLook, yaw);
  utils.writeAngle(entityLook, pitch);
  utils.writeByte(entityLook, onGround ? 1 : 0);
  player.server.writePacketToAll(0x2B, entityLook, "play", "EntityLook", [player]);

  const entityHeadLook = utils.createBufferObject();
  utils.writeVarInt(entityHeadLook, player.entityID);
  utils.writeAngle(entityHeadLook, yaw);
  player.server.writePacketToAll(0x3C, entityHeadLook, "play", "EntityHeadLook", [player]);
};