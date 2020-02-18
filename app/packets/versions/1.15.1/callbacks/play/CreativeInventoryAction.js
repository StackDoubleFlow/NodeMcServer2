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
  const present = utils.readBoolean(player);
  console.log(slot, present);
  if (!present) {
    player.inventory[slot] = undefined;
    return;
  }
  
  const itemID = utils.readVarInt(player);
  const itemCount = utils.readByte(player);
  const nbt = readNBTFromPlayer(player);
  player.inventory[slot] = Item.fromProtocolId("1.15.2", itemID, itemCount); 
};