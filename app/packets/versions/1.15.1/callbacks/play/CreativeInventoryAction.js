import Client from "../../../../../Client";
import Item from "../../../../../world/Item";
import { readNBTFromPlayer } from "../../../../../nbt";

const utils = require("../../../../../utils");

/**
 * @param {Client} player
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
  const nbt = readNBTFromPlayer(player);
  player.inventory[slot] = new Item(utils.stateIdToBlockId("1.15.2", itemID), itemCount);
  console.log(player.inventory);
};