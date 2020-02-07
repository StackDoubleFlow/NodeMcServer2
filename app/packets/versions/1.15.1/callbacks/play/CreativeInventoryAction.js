import Player from "../../../../../Player";
import Item from "../../../../../world/Item";

const utils = require("../../../../../utils");

/**
 * @param {Player} player
 * @param {number} dataLength
 */
module.exports = (player, dataLength) => {
  const slot = utils.readUShort(player);
  console.log(slot);
  const present = utils.readBoolean(player);
  if (!present) {
    console.log(`Setting slot ${slot} to empty`);
    player.inventory[slot] = undefined;
    return;
  }
  
  const itemID = utils.readVarInt(player);
  const itemCount = utils.readVarInt(player);
  const nbt = utils.readNBT(player);
  player.inventory[slot] = new Item(utils.stateIdToBlockId("1.15.2", itemID), itemCount);
  console.log(player.inventory);
};