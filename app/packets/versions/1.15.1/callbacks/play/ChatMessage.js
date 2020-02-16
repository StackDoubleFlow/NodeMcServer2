import Client from "../../../../../Client";

const utils = require("../../../../../utils");

/**
 * @param {Client} player
 * @param {number} dataLength
 */
module.exports = (player, dataLength, chatMessage) => {
  // var chatMessage = utils.readString(player, 256);
  if(chatMessage.startsWith("/")) {
      console.log("player command", chatMessage.substr(1));
      player.server.commandHandler.runCommand(player, chatMessage.substr(1));
      return;
  }
  console.log(player.username + ": " + chatMessage);
  const responseData = {
      "text": "",
      "extra": [
          player.chatName(),
          {
              "text": " > ",
              "bold": true,
              "color": "dark_gray"
          },
          {
              "text": chatMessage
          }
      ]
  };

  player.server.broadcast(responseData);
};