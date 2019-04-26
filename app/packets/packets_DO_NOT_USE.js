
'use strict'

var PacketManager = require('./PacketManager.js');
var Player = require('./../Player.js');
var utils = require('./../utils.js');
var crypto = require('crypto');
var https = require('https');
var http = require('http');

/**
 * @param {Player} player
 * @param {number} dataLength
 */
function HandleHandshake(player, dataLength) {
    var version = utils.readVarInt(player);
    var serverAddress = utils.readString(player, 255);
    var port = utils.readUShort(player);
    var nextState = utils.readVarInt(player);
    if (nextState == 1) {
        player.State = "stat";
    } else if (nextState == 2) {
        player.State = "logn";
    } else {
        console.error("Invalid next state: " + nextState);
    }
}

/**
 * @param {Player} player
 * @param {number} dataLength
 */
function HandleRequest(player, dataLength) {
    var response = utils.createBufferObject();
    var responseData = {
        "version": {
            "name": "1.13.2",
            "protocol": 404
        },
        "players": {
            "max": player.Server.Config['max_players'],
            "online": player.Server.OnlinePlayers.length,
            "sample": []
        },
        "description": {
            "text": player.Server.Config['motd']
        },
        "favicon": "data:image/png;base64," + player.Server.Icons[Math.floor(Math.random() * player.Server.Icons.length)]
    }
    player.Server.OnlinePlayers.forEach(player => {
        responseData.players.sample.push({
            "name": player.Username,
            "id": player.UUID
        });
    });
    utils.writeJson(responseData, 32767, response);
    utils.writePacket(0x00, response, player, "stat", "Response");
}

/**
 * @param {Player} player
 * @param {number} dataLength
 */
function HandlePing(player, dataLength) {
    var payload = utils.readLong(player);
    var pong = utils.createBufferObject();
    utils.writeLong(payload, pong);
    utils.writePacket(0x01, pong, player, "stat", "Pong");
}

/**
 * @param {Player} player
 * @param {number} dataLength
 */
function HandleLoginStart(player, dataLength) {
    var username = utils.readString(player, 16);
    player.Username = username;
    var encryptionRequest = utils.createBufferObject();
    utils.writeString("", 20, encryptionRequest);
    utils.writeByteArray(player.Server.PublicKeyDER, encryptionRequest, true);
    utils.writeByteArray(player.VerifyToken, encryptionRequest, true);
    utils.writePacket(0x01, encryptionRequest, player, "logn", "EncryptionRequest");
}

/**
 * @param {Player} player
 * @param {number} dataLength
 */
function HandleEncyptionResponse(player, dataLength) {
    var sharedSecret = Buffer.from(utils.readByteArray(player));
    player.SharedSecret = crypto.privateDecrypt({ key: player.Server.PrivateKeyPEM, padding: player.Server.EncryptionPadding }, sharedSecret);
    var verifyToken = Buffer.from(utils.readByteArray(player));
    var decryptedVerifyToken = crypto.privateDecrypt({ key: player.Server.PrivateKeyPEM, padding: player.Server.EncryptionPadding }, verifyToken);
    if (Buffer.compare(decryptedVerifyToken, player.VerifyToken) != 0) {
        console.log("Client sent back an incorrent verification token, things will probably go badly from here");
    }
    player.UseEncryption = true;
    var cryptoServerHash = crypto.createHash('sha1');
    cryptoServerHash.update("");
    cryptoServerHash.update(player.SharedSecret);
    cryptoServerHash.update(player.Server.PublicKeyDER);                                   // DONT FUCKING TOUCH THIS CODE 
    var digest = cryptoServerHash.digest();
    var serverHash = utils.minecraftHexDigest(digest);
    player.Cipher = crypto.createCipheriv("aes-128-cfb8", player.SharedSecret, player.SharedSecret);
    player.Cipher.pipe(player.TCPSocket);
    player.Decipher = crypto.createDecipheriv("aes-128-cfb8", player.SharedSecret, player.SharedSecret);
    https.get("https://sessionserver.mojang.com/session/minecraft/hasJoined?username=" + player.Username + "&serverId=" + serverHash, (res) => { 
        let data = '';
        res.on('end', () => HandleMojangLoginResponse(player, dataLength, res, data));
        res.on('data', (buf) => data += buf.toString());
    }).on('error', (err) => console.log(err));

}

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
    player.UnformattedUUID = unformattedUUID;
    var UUID = `${unformattedUUID.substr(0, 8)}-${unformattedUUID.substr(8, 4)}-${unformattedUUID.substr(12, 4)}-${unformattedUUID.substr(16, 4)}-${unformattedUUID.substr(20, 12)}`;
    player.UUID = UUID;
    var loginSuccess = utils.createBufferObject();
    utils.writeString(player.UUID, 36, loginSuccess);
    utils.writeString(player.Username, 16, loginSuccess);
    utils.writePacket(0x02, loginSuccess, player, "logn", "LoginSuccess");
    player.EntityID = crypto.randomBytes(2).readUIntBE(0, 2);

    var joinGame = utils.createBufferObject();
    utils.writeInt(player.EntityID, joinGame); //Entity ID
    utils.writeByte(1, joinGame); // Gamemode
    utils.writeInt(0, joinGame); // Dimention
    utils.writeByte(0, joinGame); // Difficulty
    utils.writeByte(100, joinGame); // Max players
    utils.writeString("default", 16, joinGame); // Level type
    utils.writeByte(0, joinGame);
    utils.writePacket(0x25, joinGame, player, "logn", "JoinGame");

    player.State = "play";
    player.Server.onPlayerConnected(player);
    

    var playerPositionAndLook = utils.createBufferObject();
    // Quick 0 position test
    utils.writeByteArray(Buffer.alloc(8), playerPositionAndLook, false); // X
    utils.writeByteArray(Buffer.alloc(8), playerPositionAndLook, false); // Y
    utils.writeByteArray(Buffer.alloc(8), playerPositionAndLook, false); // Z
    utils.writeByteArray(Buffer.alloc(4), playerPositionAndLook, false); // Yaw
    utils.writeByteArray(Buffer.alloc(4), playerPositionAndLook, false); // Pitch
    utils.writeByte(0, playerPositionAndLook);
    utils.writeVarInt(10121, playerPositionAndLook);
    utils.writePacket(0x32, playerPositionAndLook, player, "play", "PlayerPositionAndLook");


    utils.writePacket(0x22, player.Server.World.getChunkPacket(0, 0, true), player);

    var playerListHeaderAndFooter = utils.createBufferObject();
    utils.writeJson({ text: "MCNodeServer" }, 32767, playerListHeaderAndFooter);
    utils.writeJson({ "text": "Made by StackDoubleFlow & Allen" }, 32767, playerListHeaderAndFooter);
    utils.writePacket(0x4E, playerListHeaderAndFooter, player, "play", "PlayerListHeaderAndFooter");

    https.get(" https://sessionserver.mojang.com/session/minecraft/profile/" + player.UnformattedUUID + "&unsigned=true", (res) => {
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

    console.log(response);
    console.log(data);

    var playerInfo = utils.createBufferObject();
    utils.writeVarInt(0, playerInfo);
    utils.writeVarInt(player.Server.OnlinePlayers.length, playerInfo);
    player.Server.OnlinePlayers.forEach(plr => {
        utils.writeString(plr.Username, 16, playerInfo);
    });

}


/**
 * @param {Player} player
 * @param {number} dataLength
 */
function HandleChatMessage(player, dataLength) {
    var chatMessage = utils.readString(player, 256);
    if (chatMessage == "/leave") {
        player.kick("Bye bye!");
        return;
    }
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

    player.Server.broadcast(responseData);

}

function placeholder(name) {
    var f = function () { return true; };
    Object.defineProperty(f, 'name', {value: "Handle" + name, writable: false});
    f.isTodo = true;
    return f;
}

/**
 * Registers all packets into a packetManager
 * 
 * @param {PacketManager} packetManager 
 */
export function registerAllPackets(packetManager) {
    packetManager.registerPacket("none", 0x00, HandleHandshake);

    packetManager.registerPacket("stat", 0x00, HandleRequest);
    packetManager.registerPacket("stat", 0x01, HandlePing);

    packetManager.registerPacket("logn", 0x00, HandleLoginStart);
    packetManager.registerPacket("logn", 0x01, HandleEncyptionResponse);

    packetManager.registerPacket("play", 0x02, HandleChatMessage);

    // TODO
    packetManager.registerPacket("play", 0x00, placeholder("TeleportConfirm"));
    packetManager.registerPacket("play", 0x01, placeholder("QueryBlockNBT"));
    packetManager.registerPacket("play", 0x03, placeholder("ClientStatus"));
    packetManager.registerPacket("play", 0x04, placeholder("ClientSettings"));
    packetManager.registerPacket("play", 0x05, placeholder("TabComplete"));
    packetManager.registerPacket("play", 0x06, placeholder("ConfirmTransaction"));
    packetManager.registerPacket("play", 0x07, placeholder("EnchantItem"));
    packetManager.registerPacket("play", 0x08, placeholder("ClickWindow"));
    packetManager.registerPacket("play", 0x09, placeholder("CloseWindow"));
    packetManager.registerPacket("play", 0x0A, placeholder("PluginMessage"));
    packetManager.registerPacket("play", 0x0C, placeholder("QueryEntityNBT"));
    packetManager.registerPacket("play", 0x0D, placeholder("UseEntity"));
    packetManager.registerPacket("play", 0x0B, placeholder("EditBook"));
    packetManager.registerPacket("play", 0x0E, placeholder("KeepAlive"));
    packetManager.registerPacket("play", 0x0F, placeholder("Player"));
    packetManager.registerPacket("play", 0x10, placeholder("PlayerPosition"));
    packetManager.registerPacket("play", 0x11, placeholder("PlayerPositionAndLook"));
    packetManager.registerPacket("play", 0x12, placeholder("PlayerLook"));
    packetManager.registerPacket("play", 0x13, placeholder("VehicleMove"));
    packetManager.registerPacket("play", 0x14, placeholder("SteerBoat"));
    packetManager.registerPacket("play", 0x15, placeholder("PickItem"));
    packetManager.registerPacket("play", 0x16, placeholder("CraftRecipeRequest"));
    packetManager.registerPacket("play", 0x17, placeholder("PlayerAbilities"));
    packetManager.registerPacket("play", 0x18, placeholder("PlayerDigging"));
    packetManager.registerPacket("play", 0x19, placeholder("EntityAction"));
    packetManager.registerPacket("play", 0x1A, placeholder("SteerVehicle"));
    packetManager.registerPacket("play", 0x1B, placeholder("RecipeBookData"));
    packetManager.registerPacket("play", 0x1C, placeholder("NameItem"));
    packetManager.registerPacket("play", 0x1D, placeholder("ResourcePackStatus"));
    packetManager.registerPacket("play", 0x1E, placeholder("AdvancementTab"));
    packetManager.registerPacket("play", 0x1F, placeholder("SelectTrade"));
    packetManager.registerPacket("play", 0x20, placeholder("SetBeaconEffect"));
    packetManager.registerPacket("play", 0x21, placeholder("HeldItemChange"));
    packetManager.registerPacket("play", 0x22, placeholder("UpdateCommandBlock"));
    packetManager.registerPacket("play", 0x23, placeholder("UpdateCommandBlockMinecart"));
    packetManager.registerPacket("play", 0x24, placeholder("CreativeInventoryAction"));
    packetManager.registerPacket("play", 0x25, placeholder("UpdateStructureBlock"));
    packetManager.registerPacket("play", 0x26, placeholder("UpdateSign"));
    packetManager.registerPacket("play", 0x27, placeholder("Animation"));
    packetManager.registerPacket("play", 0x28, placeholder("Spectate"));
    packetManager.registerPacket("play", 0x29, placeholder("PlayerBlockPlacement"));
    packetManager.registerPacket("play", 0x2A, placeholder("UseItem"));

}

