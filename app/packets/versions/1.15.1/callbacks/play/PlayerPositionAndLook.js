import Player from "../../../../../Player";

const utils = require("../../../../../utils");

/**
 * @param {Player} player
 * @param {number} dataLength
 */
module.exports = (player, dataLength, newX, newY, newZ, yaw, pitch, onGround) => {
  const oldX = player.location.x;
  const oldY = player.location.y;
  const oldZ = player.location.z;

  player.location.x = newX;
  player.location.y = newY;
  player.location.z = newZ;
  player.location.yaw = yaw;
  player.location.pitch = pitch;
  player.onGround = onGround;

  const deltaX = Math.round(((newX * 32) - (oldX * 32)) * 128);
  const deltaY = Math.round(((newY * 32) - (oldY * 32)) * 128);
  const deltaZ = Math.round(((newZ * 32) - (oldZ * 32)) * 128);
  
  const entityLookAndRelativeMove = utils.createBufferObject();
  utils.writeVarInt(entityLookAndRelativeMove, player.entityID);
  utils.writeShort(entityLookAndRelativeMove, deltaX);
  utils.writeShort(entityLookAndRelativeMove, deltaY);
  utils.writeShort(entityLookAndRelativeMove, deltaZ);
  utils.writeAngle(entityLookAndRelativeMove, yaw);
  utils.writeAngle(entityLookAndRelativeMove, pitch);
  utils.writeByte(entityLookAndRelativeMove, player.onGround ? 1 : 0);
  player.server.writePacketToAll(0x2A, entityLookAndRelativeMove, "play", "EntityLookAndRelativeMove", [player]);

  const entityHeadLook = utils.createBufferObject();
  utils.writeVarInt(entityHeadLook, player.entityID);
  utils.writeAngle(entityHeadLook, yaw);
  player.server.writePacketToAll(0x3C, entityHeadLook, "play", "EntityHeadLook", [player]);
};