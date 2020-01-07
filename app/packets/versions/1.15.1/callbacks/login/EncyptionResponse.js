import Player from "../../../../../Player";

const utils = require("../../../../../utils");
const crypto = require("crypto");
const https = require('https');
const http = require('http');

/**
 * @param {Player} player
 * @param {number} dataLength
 * @param {http.IncomingMessage} response
 * @param {string} data
 */
function HandleMojangLoginResponse(player, dataLength, response, data) {
    if (response.statusCode !== 200) {
        console.log("Mojang Server responded with " + response.statusCode);
    }
    var responseData = JSON.parse(data);
    /** @type {string} */
    var unformattedUUID = responseData.id;
    player.unformattedUUID = unformattedUUID;
    var UUID = `${unformattedUUID.substr(0, 8)}-${unformattedUUID.substr(8, 4)}-${unformattedUUID.substr(12, 4)}-${unformattedUUID.substr(16, 4)}-${unformattedUUID.substr(20, 12)}`;
    player.UUID = UUID;
    var loginSuccess = utils.createBufferObject();
    utils.writeString(player.UUID, 36, loginSuccess);
    utils.writeString(player.username, 16, loginSuccess);
    utils.writePacket(0x02, loginSuccess, player, "logn", "LoginSuccess");
    player.entityID = crypto.randomBytes(2).readUIntBE(0, 2);

    var joinGame = utils.createBufferObject();
    utils.writeInt(player.entityID, joinGame); //Entity ID
    utils.writeByte(1, joinGame); // Gamemode
    utils.writeInt(0, joinGame); // Dimention
    utils.writeLong(0, joinGame); // First 8 bytes of the SHA-256 hash of the world's seed
    utils.writeByte(100, joinGame); // Max players
    utils.writeString("default", 16, joinGame); // Level type
    utils.writeVarInt(16, joinGame); // View distance
    utils.writeByte(0, joinGame); // Reduced debug info
    utils.writeByte(1, joinGame); // Enable respawn screen
    utils.writePacket(0x26, joinGame, player, "logn", "JoinGame");

    const pluginMessage = utils.createBufferObject();
    utils.writeString("minecraft:brand", 32767, pluginMessage);
    utils.writeByteArray(Buffer.from("NodeMC"), pluginMessage, false);
    utils.writePacket(0x19, joinGame, player, "logn", "PluginMessage");
    

    player.state = "play";
    player.server.onPlayerConnected(player);

    player.location.y = 16;

    var playerPositionAndLook = utils.createBufferObject();
    // Quick 0 position test
    utils.writeDouble(player.location.x, playerPositionAndLook); // X
    utils.writeDouble(player.location.y, playerPositionAndLook); // Y
    utils.writeDouble(player.location.z, playerPositionAndLook); // Z
    utils.writeFloat(player.location.yaw, playerPositionAndLook); // Yaw
    utils.writeFloat(player.location.pitch, playerPositionAndLook); // Pitch
    utils.writeByte(0, playerPositionAndLook);
    utils.writeVarInt(10121, playerPositionAndLook);
    utils.writePacket(0x36, playerPositionAndLook, player, "play", "PlayerPositionAndLook");

    


    //fs.writeFileSync("./chunkdump.hex", player.server.world.getChunkPacket(x, z, true).b, 'hex');

    // Chunk data
    for(var x = -7; x < 7; x++) {
        for(var z = -7; z < 7; z++) {
            utils.writePacket(0x22, player.server.world.getChunkPacket(x, z, true), player, "play", "ChunkData");
        }
    }

    // Tab Player List
    var playerListHeaderAndFooter = utils.createBufferObject();
    utils.writeJson({ text: "MCNodeServer" }, 32767, playerListHeaderAndFooter);
    utils.writeJson({ "text": "Made by StackDoubleFlow & Allen" }, 32767, playerListHeaderAndFooter);
    utils.writePacket(0x54, playerListHeaderAndFooter, player, "play", "PlayerListHeaderAndFooter");
    
    https.get("https://sessionserver.mojang.com/session/minecraft/profile/" + player.unformattedUUID + "?unsigned=false", (res) => {
        let data = '';
        res.on('end', () => HandleMojangProfileResponse(player, dataLength, res, data));
        res.on('data', (buf) => data += buf.toString());
    }).on('error', (err) => console.log(err));


}


/**
 * @param {Player} player
 * @param {number} dataLength
 * @param {http.IncomingMessage} response
 * @param {string} data
 */
function HandleMojangProfileResponse(player, dataLength, response, data) {
    var useCache = false;
    if(response.statusCode !== 200) {
        //console.log("Unable to retrieve player profile!");
        useCache = true;
    }
    data = JSON.parse(data);
    if(data["error"]) {
        //console.log("(TODO: Try again later) Error getting player profile: " + data["error"]);
        useCache = true;
    }

    if(useCache) {
        if(player.server.playerPropertyCache.has(player.username)) {
            player.properties = player.server.playerPropertyCache.get(player.username);
        } else {
            player.kick("Authentication failed, please try again later");
        }
    } else {
        player.properties = data["properties"];
        player.server.playerPropertyCache.set(player.username, player.properties);
    }
    
    var playerInfo = utils.createBufferObject();
    utils.writeVarInt(0, playerInfo); // Action (Add Player)
    utils.writeVarInt(player.server.onlinePlayers.length, playerInfo); // Number of players
    player.server.onlinePlayers.forEach(plr => {
        utils.writeUUID(plr, playerInfo); // UUID
        utils.writeString(plr.username, 16, playerInfo); /// Username
        utils.writeVarInt(plr.properties.length, playerInfo); // Number of properties
        plr.properties.forEach((property) => {
            //console.log(property);
            utils.writeString(property.name, 32767, playerInfo); // Property name
            utils.writeString(property.value, 32767, playerInfo); // Property value
            utils.writeByte(1, playerInfo); // Is Property Signed (True)
            utils.writeString(property.signature, 32767, playerInfo); // Yggdrasil's signature
        });
        utils.writeVarInt(1, playerInfo); // Gamemode
        utils.writeVarInt(player.ping, playerInfo); // Ping
        utils.writeByte(0, playerInfo); // Has display name (False)
    });
    utils.writePacket(0x34, playerInfo, player, "play", "PlayerInfo");

    var playerInfo = utils.createBufferObject();
    utils.writeVarInt(0, playerInfo); // Action (Add Player)
    utils.writeVarInt(1, playerInfo); // Number of players
    utils.writeUUID(player, playerInfo) // UUID
    utils.writeString(player.username, 16, playerInfo); /// Username
    utils.writeVarInt(player.properties.length, playerInfo); // Number of properties
    player.properties.forEach((property) => {
        utils.writeString(property.name, 32767, playerInfo); // Property name
        utils.writeString(property.value, 32767, playerInfo); // Property value
        utils.writeByte(1, playerInfo); // Is Property Signed (True)
        utils.writeString(property.signature, 32767, playerInfo); // Yggdrasil's signature
    });
    utils.writeVarInt(1, playerInfo); // Gamemode
    utils.writeVarInt(player.ping, playerInfo); // Ping
    utils.writeByte(0, playerInfo); // Has display name (False)
    player.server.writePacketToAll(0x34, playerInfo, "play", "PlayerInfo", [player]);

    const declareCommands = utils.createBufferObject();
    utils.writeVarInt(player.server.commandHandler.commands.size + 1, declareCommands); // Num of elements in array
    utils.writeByte(0, declareCommands); // Flags (root)
    utils.writeVarInt(player.server.commandHandler.commands.size, declareCommands); // Num of children
    for(let i = 1; i <= player.server.commandHandler.commands.size; i++) utils.writeVarInt(i, declareCommands);
    player.server.commandHandler.commands.forEach((command, name) => {
        utils.writeByte(0x5, declareCommands); // Flags (literal, executable)
        utils.writeVarInt(0, declareCommands); // Num of children
        utils.writeString(name, 32767, declareCommands); // Command name
    });
    utils.writeVarInt(0, declareCommands); // Root node index
    utils.writePacket(0x12, declareCommands, player, "play", "DeclareCommands");
    

    
    player.server.onlinePlayers.forEach((plr) => {
        if(plr === player) return;
        var spawnPlayer = utils.createBufferObject();
        utils.writeVarInt(plr.entityID, spawnPlayer);
        utils.writeUUID(plr, spawnPlayer);
        utils.writeDouble(plr.location.x, spawnPlayer);
        utils.writeDouble(plr.location.y, spawnPlayer);
        utils.writeDouble(plr.location.z, spawnPlayer);
        utils.writeAngle(plr.location.yaw, spawnPlayer);
        utils.writeAngle(plr.location.pitch, spawnPlayer);
        /*
        utils.writeByte(15, spawnPlayer); // Displayed Skin Parts
        utils.writeVarInt(0, spawnPlayer);
        utils.writeByte(plr.displayedSkinParts, spawnPlayer);
        utils.writeByte(0xFF, spawnPlayer); // End metadata
        */
        utils.writePacket(0x05, spawnPlayer, player, "play", "SpawnPlayer");
    });

    var spawnPlayer = utils.createBufferObject();
    utils.writeVarInt(player.entityID, spawnPlayer);
    utils.writeUUID(player, spawnPlayer);
    utils.writeDouble(player.location.x, spawnPlayer);
    utils.writeDouble(player.location.y, spawnPlayer);
    utils.writeDouble(player.location.z, spawnPlayer);
    utils.writeAngle(player.location.yaw, spawnPlayer);
    utils.writeAngle(player.location.pitch, spawnPlayer);
    /*
    utils.writeByte(15, spawnPlayer); // Displayed Skin Parts
    utils.writeVarInt(0, spawnPlayer);
    utils.writeByte(0b01111111, spawnPlayer);
    utils.writeByte(0xFF, spawnPlayer); // End of metadata
    */
    player.server.writePacketToAll(0x05, spawnPlayer, "play", "SpawnPlayer", [player]);

    
}

/**
 * @param {Player} player
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
  utils.writeVarInt(500, setCompression);
  utils.writePacket(0x03, setCompression, player, "logn", "SetCompression");
  player.usePacketCompression = true;
  https.get("https://sessionserver.mojang.com/session/minecraft/hasJoined?username=" + player.username + "&serverId=" + serverHash, (res) => {
      let data = '';
      res.on('end', () => HandleMojangLoginResponse(player, dataLength, res, data));
      res.on('data', (buf) => data += buf.toString());
  }).on('error', (err) => console.log(err));
};