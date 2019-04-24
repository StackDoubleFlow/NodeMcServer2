
'use strict'

var PacketManager = require('./packet_manager');
var Player = require('./../player');
var utils = require('./../utils');
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
    if(nextState == 1) {
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
        "favicon": "data:image/png;base64," + player.Server.Icon
    }
    utils.writeString(JSON.stringify(responseData), 32767, response);
    utils.writePacket(0x00, response, player);
    console.log("~~ S->C ~~ stat ~ Response");
}

/**
 * @param {Player} player
 * @param {number} dataLength
 */
function HandlePing(player, dataLength) {
    var payload = utils.readLong(player);
    var pong = utils.createBufferObject();
    utils.writeLong(payload, pong);
    utils.writePacket(0x01, pong, player);
    console.log("~~ S->C ~~ stat ~ Pong");
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
    utils.writeByteArray(player.Server.PublicKeyDER, encryptionRequest);
    utils.writeByteArray(player.VerifyToken, encryptionRequest);
    utils.writePacket(0x01, encryptionRequest, player);
    console.log("~~ S->C ~~ logn ~ EncryptionRequest");
}

/**
 * @param {Player} player
 * @param {number} dataLength
 */
function HandleEncyptionResponse(player, dataLength) {
    var sharedSecret = Buffer.from(utils.readByteArray(player));
    player.SharedSecret = crypto.privateDecrypt({key: player.Server.PrivateKeyPEM, padding: player.Server.EncryptionPadding}, sharedSecret);
    var verifyToken = Buffer.from(utils.readByteArray(player));
    var decryptedVerifyToken = crypto.privateDecrypt({key: player.Server.PrivateKeyPEM, padding: player.Server.EncryptionPadding}, verifyToken);
    if(Buffer.compare(decryptedVerifyToken, player.VerifyToken) != 0) {
        console.log("Client sent back an incorrent verification token, things will probably go badly from here");
    }
    player.UseEncryption = true;
    var cryptoServerHash = crypto.createHash('sha1');
    cryptoServerHash.update("");
    cryptoServerHash.update(player.SharedSecret);
    cryptoServerHash.update(player.Server.PublicKeyDER);
    var digest = cryptoServerHash.digest();
    var serverHash = utils.minecraftHexDigest(digest);
    player.Cipher = crypto.createCipheriv("aes-128-cfb8", player.SharedSecret, player.SharedSecret);
    player.Cipher.pipe(player.TCPSocket);
    https.get("https://sessionserver.mojang.com/session/minecraft/hasJoined?username=" + player.Username + "&serverId=" + serverHash, (res) => {
        let data = '';
        res.on('end', () => HandleMojangResponse(player, dataLength, res, data));
        res.on('data', (buf) => data += buf.toString());
    }).on('error', (err) => console.log(err)); 
}

/**
 * @param {Player} player
 * @param {number} dataLength
 * @param {http.IncomingMessage} response
 * @param {string} data
 */
function HandleMojangResponse(player, dataLength, response, data) {
    if(response.statusCode !== 200) {
        console.log("Mojang Server responded with " + response.statusCode);
    }
    var responseData = JSON.parse(data);
    /** @type {string} */
    var unformattedUUID = responseData.id;
    var UUID = `${unformattedUUID.substr(0, 8)}-${unformattedUUID.substr(8, 4)}-${unformattedUUID.substr(12, 4)}-${unformattedUUID.substr(16, 4)}-${unformattedUUID.substr(20, 12)}`;
    player.UUID = UUID;
    var loginSuccess = utils.createBufferObject();
    utils.writeString(player.UUID, 36, loginSuccess);
    utils.writeString(player.Username, 16, loginSuccess);
    utils.writePacket(0x02, loginSuccess, player);
    console.log("~~ S->C ~~ logn ~ LoginSuccess");
    player.EntityID = crypto.randomBytes(2).readUIntBE(0, 2);

    var joinGame = utils.createBufferObject();
    utils.writeInt(player.EntityID, joinGame); //Entity ID
    utils.writeByte(1, joinGame); // Gamemode
    utils.writeInt(0, joinGame); // Dimention
    utils.writeByte(0, joinGame); // Difficulty
    utils.writeByte(100, joinGame); // Max players
    utils.writeString("default", 16, joinGame); // Level type
    utils.writeByte(0, joinGame);
    utils.writePacket(0x25, joinGame, player);

    //var positionAndLook = 
    player.State = "play";
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
}

