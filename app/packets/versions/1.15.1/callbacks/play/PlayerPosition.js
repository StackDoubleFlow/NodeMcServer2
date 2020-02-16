import Client from "../../../../../Client";

const utils = require("../../../../../utils");

/**
 * @param {Client} player
 * @param {number} dataLength
 */
module.exports = (player, dataLength) => {
  const oldX = player.location.x;
  const oldY = player.location.y;
  const oldZ = player.location.z;
  const newX = player.location.x = utils.readDouble(player);
  const newY = player.location.y = utils.readDouble(player);
  const newZ = player.location.z = utils.readDouble(player);
  const deltaX = Math.round(((newX * 32) - (oldX * 32)) * 128);
  const deltaY = Math.round(((newY * 32) - (oldY * 32)) * 128);
  const deltaZ = Math.round(((newZ * 32) - (oldZ * 32)) * 128);
  player.onGround = utils.readBoolean(player);
  const entityRelativeMove = utils.createBufferObject();
  utils.writeVarInt(entityRelativeMove, player.entityID);
  utils.writeShort(entityRelativeMove, deltaX);
  utils.writeShort(entityRelativeMove, deltaY);
  utils.writeShort(entityRelativeMove, deltaZ);
  utils.writeByte(entityRelativeMove, player.onGround ? 1 : 0);
  player.server.writePacketToAll(0x29, entityRelativeMove, "play", "EntityRelativeMove", [player]);
};