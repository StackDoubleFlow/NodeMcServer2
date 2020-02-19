import Client from "../../../../../Client";

const utils = require("../../../../../utils");
const crypto = require("crypto");
const https = require('https');
const http = require('http');

/**
 * @param {Client} player
 * @param {number} dataLength
 * @param {http.IncomingMessage} response
 * @param {string} data
 */
function HandleMojangLoginResponse(player, dataLength, response, data) {
  if (response.statusCode !== 200) {
    console.log("Mojang Server responded with " + response.statusCode);
  }
  const responseData = JSON.parse(data);
  /** @type {string} */
  const unformattedUUID = responseData.id;
  player.unformattedUUID = unformattedUUID;
  const UUID = `${unformattedUUID.substr(0, 8)}-${unformattedUUID.substr(8, 4)}-${unformattedUUID.substr(12, 4)}-${unformattedUUID.substr(16, 4)}-${unformattedUUID.substr(20, 12)}`;
  player.UUID = UUID;
  const loginSuccess = utils.createBufferObject();
  utils.writeString(loginSuccess, player.UUID, 36);
  utils.writeString(loginSuccess, player.username, 16);
  utils.writePacket(0x02, loginSuccess, player, "logn", "LoginSuccess");
  player.entityID = crypto.randomBytes(2).readUIntBE(0, 2);

  const joinGame = utils.createBufferObject();
  utils.writeInt(joinGame, player.entityID); //Entity ID
  utils.writeByte(joinGame, 1); // Gamemode
  utils.writeInt(joinGame, 0); // Dimention
  utils.writeLong(joinGame, 0); // First 8 bytes of the SHA-256 hash of the world's seed
  utils.writeByte(joinGame, 100); // Max players
  utils.writeString(joinGame, "default", 16); // Level type
  utils.writeVarInt(joinGame, 16); // View distance
  utils.writeByte(joinGame, 0); // Reduced debug info
  utils.writeByte(joinGame, 1); // Enable respawn screen
  utils.writePacket(0x26, joinGame, player, "logn", "JoinGame");

  const pluginMessage = utils.createBufferObject();
  utils.writeString(pluginMessage, "minecraft:brand", 32767);
  utils.writeByteArray(pluginMessage, Buffer.from("NodeMC"), false);
  utils.writePacket(0x19, joinGame, player, "logn", "PluginMessage");


  player.state = "play";
  player.server.onPlayerConnected(player);

  const playerPositionAndLook = utils.createBufferObject();
  // Quick 0 position test
  utils.writeDouble(playerPositionAndLook, player.location.x); // X
  utils.writeDouble(playerPositionAndLook, player.location.y); // Y
  utils.writeDouble(playerPositionAndLook, player.location.z); // Z
  utils.writeFloat(playerPositionAndLook, player.location.yaw); // Yaw
  utils.writeFloat(playerPositionAndLook, player.location.pitch); // Pitch
  utils.writeByte(playerPositionAndLook, 0);
  utils.writeVarInt(playerPositionAndLook, 10121);
  utils.writePacket(0x36, playerPositionAndLook, player, "play", "PlayerPositionAndLook");

  // Chunk data
  for (let x = -7; x < 7; x++) {
    for (let z = -7; z < 7; z++) {
      utils.writePacket(0x22, player.server.world.getChunkPacket(x, z, true), player, "play", "ChunkData");
    }
  }

  // Tab Player List
  const playerListHeaderAndFooter = utils.createBufferObject();
  utils.writeJson(playerListHeaderAndFooter, { text: "MCNodeServer" }, 32767);
  utils.writeJson(playerListHeaderAndFooter, { "text": "Made by StackDoubleFlow & Allen" }, 32767);
  utils.writePacket(0x54, playerListHeaderAndFooter, player, "play", "PlayerListHeaderAndFooter");

  https.get("https://sessionserver.mojang.com/session/minecraft/profile/" + player.unformattedUUID + "?unsigned=false", (res) => {
    let data = '';
    res.on('end', () => HandleMojangProfileResponse(player, dataLength, res, data));
    res.on('data', (buf) => data += buf.toString());
  }).on('error', (err) => console.log(err));


}


/**
 * @param {Client} player
 * @param {number} dataLength
 * @param {http.IncomingMessage} response
 * @param {string} data
 */
function HandleMojangProfileResponse(player, dataLength, response, data) {
  let useCache = false;
  if (response.statusCode !== 200) {
    //console.log("Unable to retrieve player profile!");
    useCache = true;
  }
  data = JSON.parse(data);
  if (data["error"]) {
    //console.log("(TODO: Try again later) Error getting player profile: " + data["error"]);
    useCache = true;
  }

  if (useCache) {
    if (player.server.playerPropertyCache.has(player.username)) {
      player.properties = player.server.playerPropertyCache.get(player.username);
    } else {
      player.kick("Authentication failed, please try again later");
    }
  } else {
    player.properties = data["properties"];
    player.server.playerPropertyCache.set(player.username, player.properties);
  }

  const playerInfo = utils.createBufferObject();
  utils.writeVarInt(playerInfo, 0); // Action (Add Player)
  utils.writeVarInt(playerInfo, player.server.onlinePlayers.length); // Number of players
  player.server.onlinePlayers.forEach(plr => {
    utils.writeUUID(playerInfo, plr); // UUID
    utils.writeString(playerInfo, plr.username, 16); /// Username
    utils.writeVarInt(playerInfo, plr.properties.length); // Number of properties
    plr.properties.forEach((property) => {
      //console.log(property);
      utils.writeString(playerInfo, property.name, 32767); // Property name
      utils.writeString(playerInfo, property.value, 32767); // Property value
      utils.writeByte(playerInfo, 1); // Is Property Signed (True)
      utils.writeString(playerInfo, property.signature, 32767); // Yggdrasil's signature
    });
    utils.writeVarInt(playerInfo, 1); // Gamemode
    utils.writeVarInt(playerInfo, player.ping); // Ping
    utils.writeByte(playerInfo, 0); // Has display name (False)
  });
  utils.writePacket(0x34, playerInfo, player, "play", "PlayerInfo");

  /* Why was this here? Maybe to update latency?
  const playerInfo = utils.createBufferObject();
  utils.writeVarInt(playerInfo, 0); // Action (Add Player)
  utils.writeVarInt(playerInfo, 1); // Number of players
  utils.writeUUID(playerInfo, player) // UUID
  utils.writeString(playerInfo, player.username, 16); /// Username
  utils.writeVarInt(playerInfo, player.properties.length); // Number of properties
  player.properties.forEach((property) => {
    utils.writeString(playerInfo, property.name, 32767); // Property name
    utils.writeString(playerInfo, property.value, 32767); // Property value
    utils.writeByte(playerInfo, 1); // Is Property Signed (True)
    utils.writeString(playerInfo, property.signature, 32767); // Yggdrasil's signature
  });
  utils.writeVarInt(playerInfo, 1); // Gamemode
  utils.writeVarInt(playerInfo, player.ping); // Ping
  utils.writeByte(playerInfo, 0); // Has display name (False)
  player.server.writePacketToAll(0x34, playerInfo, "play", "PlayerInfo", [player]);
  */

  const declareCommands = utils.createBufferObject();
  utils.writeVarInt(declareCommands, player.server.commandHandler.commands.size + 1); // Num of elements in array
  utils.writeByte(declareCommands, 0); // Flags (root)
  utils.writeVarInt(declareCommands, player.server.commandHandler.commands.size); // Num of children
  for (let i = 1; i <= player.server.commandHandler.commands.size; i++) utils.writeVarInt(declareCommands, i);
  player.server.commandHandler.commands.forEach((command, name) => {
    utils.writeByte(declareCommands, 0x5); // Flags (literal, executable)
    utils.writeVarInt(declareCommands, 0); // Num of children
    utils.writeString(declareCommands, name, 32767); // Command name
  });
  utils.writeVarInt(declareCommands, 0); // Root node index
  utils.writePacket(0x12, declareCommands, player, "play", "DeclareCommands");



  player.server.onlinePlayers.forEach((plr) => {
    if (plr === player) return;
    const spawnPlayer = utils.createBufferObject();
    utils.writeVarInt(spawnPlayer, plr.entityID);
    utils.writeUUID(spawnPlayer, plr);
    utils.writeDouble(spawnPlayer, plr.location.x);
    utils.writeDouble(spawnPlayer, plr.location.y);
    utils.writeDouble(spawnPlayer, plr.location.z);
    utils.writeAngle(spawnPlayer, plr.location.yaw);
    utils.writeAngle(spawnPlayer, plr.location.pitch);
    /*
    utils.writeByte(15, spawnPlayer); // Displayed Skin Parts
    utils.writeVarInt(0, spawnPlayer);
    utils.writeByte(plr.displayedSkinParts, spawnPlayer);
    utils.writeByte(0xFF, spawnPlayer); // End metadata
    */
    utils.writePacket(0x05, spawnPlayer, player, "play", "SpawnPlayer");
  });

  const spawnPlayer = utils.createBufferObject();
  utils.writeVarInt(spawnPlayer, player.entityID);
  utils.writeUUID(spawnPlayer, player);
  utils.writeDouble(spawnPlayer, player.location.x);
  utils.writeDouble(spawnPlayer, player.location.y);
  utils.writeDouble(spawnPlayer, player.location.z);
  utils.writeAngle(spawnPlayer, player.location.yaw);
  utils.writeAngle(spawnPlayer, player.location.pitch);
  /*
  utils.writeByte(spawnPlayer, 15); // Displayed Skin Parts
  utils.writeVarInt(spawnPlayer, 0);
  utils.writeByte(spawnPlayer, 0b01111111);
  utils.writeByte(spawnPlayer, 0xFF); // End of metadata
  */
  player.server.writePacketToAll(0x05, spawnPlayer, "play", "SpawnPlayer", [player]);


}

/**
 * @param {Client} player
 * @param {number} dataLength
 */
module.exports = (player, dataLength) => {
  const sharedSecret = Buffer.from(utils.readByteArray(player));
  player.sharedSecret = crypto.privateDecrypt({
    key: player.server.privateKeyPEM,
    padding: player.server.encryptionPadding,
    passphrase: player.server.encryptionPassphrase
  }, sharedSecret);
  const verifyToken = Buffer.from(utils.readByteArray(player));
  const decryptedVerifyToken = crypto.privateDecrypt({
    key: player.server.privateKeyPEM,
    padding: player.server.encryptionPadding,
    passphrase: player.server.encryptionPassphrase
  }, verifyToken);
  if (Buffer.compare(decryptedVerifyToken, player.verifyToken) != 0) {
    console.log("Client sent back an incorrent verification token, things will probably go badly from here");
  }
  player.useEncryption = true;
  const cryptoServerHash = crypto.createHash('sha1');
  cryptoServerHash.update("");
  cryptoServerHash.update(player.sharedSecret);
  cryptoServerHash.update(player.server.publicKeyDER);                                   // DONT FUCKING TOUCH THIS CODE 
  const digest = cryptoServerHash.digest();
  const serverHash = utils.minecraftHexDigest(digest);
  player.cipher = crypto.createCipheriv("aes-128-cfb8", player.sharedSecret, player.sharedSecret);
  player.cipher.pipe(player.tcpSocket);
  player.decipher = crypto.createDecipheriv("aes-128-cfb8", player.sharedSecret, player.sharedSecret);
  player.tcpSocket.removeListener('readable', player.onStreamReadable);
  player.tcpSocket.pipe(player.decipher);
  player.decipher.on('readable', player.onDecipherReadable.bind(player));
  const setCompression = utils.createBufferObject();
  utils.writeVarInt(setCompression, 500);
  utils.writePacket(0x03, setCompression, player, "logn", "SetCompression");
  player.usePacketCompression = true;
  https.get("https://sessionserver.mojang.com/session/minecraft/hasJoined?username=" + player.username + "&serverId=" + serverHash, (res) => {
    let data = '';
    res.on('end', () => HandleMojangLoginResponse(player, dataLength, res, data));
    res.on('data', (buf) => data += buf.toString());
  }).on('error', (err) => console.log(err));
};