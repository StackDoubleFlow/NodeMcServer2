import Client from "../../../../../Client";

const utils = require("../../../../../utils");

/**
 * @param {Client} player
 * @param {number} dataLength
 */
module.exports = (player, dataLength) => {
  const packetManager = player.packetManager;
  const response = utils.createBufferObject();

  const responseData = {
    "version": {
        "name": "NodeMC " + packetManager.versionName,
        "protocol": packetManager.version
    },
    "players": {
        "max": player.server.config['max_players'],
        "online": player.server.onlinePlayers.length,
        "sample": []
    },
    "description": {
        "text": player.server.config['motd']
    },
    "favicon": "data:image/png;base64," + player.server.icons[Math.floor(Math.random() * player.server.icons.length)]
  }
  player.server.onlinePlayers.forEach(player => {
    responseData.players.sample.push({
      "name": player.username,
      "id": player.UUID
    });
  });
  utils.writeJson(response, responseData, 32767);
  utils.writePacket(0x00, response, player, "stat", "Response");
};