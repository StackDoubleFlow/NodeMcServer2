const utils = require("../../../../../utils");

module.exports = (player, dataLength) => {
  const version = utils.readVarInt(player);
  const serverAddress = utils.readString(player, 255);
  const port = utils.readUShort(player);
  const nextState = utils.readVarInt(player);
  if (nextState == 1) {
      player.state = "stat";
  } else if (nextState == 2) {
      player.state = "logn";
  } else {
      console.error("Invalid next state: " + nextState);
  }
}