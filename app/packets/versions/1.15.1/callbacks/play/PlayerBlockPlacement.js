import Player from "../../../../../Player";

const utils = require("../../../../../utils");

/**
 * @param {Player} player
 * @param {number} dataLength
 */
module.exports = (player, dataLength) => {
  const hand = utils.readVarInt(player);
  const location = utils.readPosition(player);
  const face = utils.readVarInt(player);
  const cursorX = utils.readFloat(player);
  const cursorY = utils.readFloat(player);
  const cursorZ = utils.readFloat(player);
  const insideBlock = utils.readBoolean(player);
  const blockId = utils.blockIdToStateId("1.15.2", "minecraft:wet_sponge");
  if (face == 0) { // -Y
    location.y--;
  } else if (face == 1) { // +Y
    location.y++;
  } else if (face == 2) { // -Z
    location.z--;
  } else if (face == 3) { // +Z
    location.z++;
  } else if (face == 4) { // -X
    location.x--;
  } else if (face == 5) { // +X
    location.x++;
  }
  if (
    Math.floor(player.location.x) == location.x &&
    Math.floor(player.location.y) == location.y &&
    Math.floor(player.location.z) == location.z
  ) return;
  player.server.world.setBlockState(location.x, location.y, location.z, blockId);
};