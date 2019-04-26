'use strict'

var PacketManager = require('./../PacketManager.js');
var Player = require('./../../Player.js');
var utils = require('./../../utils.js');
var crypto = require('crypto');
var https = require('https');
var http = require('http');


function placeholder(name) {
    return {
        name: name,
        read: [],
        write: [],
        todo: true
    };
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


    // utils.writePacket(0x22, player.Server.World.getChunkPacket(0, 0, true), player);

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
    utils.writeVarInt(player.Server.onlinePlayers.length, playerInfo);
    player.Server.onlinePlayers.forEach(plr => {
        utils.writeString(plr.Username, 16, playerInfo);
        utils.writeVarInt(plr.Properties, playerInfo);
    });

}

module.exports = {
    name: "1.13.2",
    version: 404,
    packets: {
        none: {
            0x00: {
                name: "Handshake",
                read: [
                    {
                        name: "version",
                        type: "varint"
                    },
                    {
                        name: "port",
                        type: "ushort"
                    },
                    {
                        name: "NextState",
                        type: "varint"
                    }
                ],
                write: []
            }
        },
        stat: {
            0x00: {
                name: "Request",
                read: [],
                write: []
            },
            0x01: {
                name: "Ping",
                read: [],
                write: []
            }
        },
        logn: {
            0x00: {
                name: "LoginStart",
                read: [],
                write: []
            },
            0x01: {
                name: "EncyptionResponse",
                read: [],
                write: []
            }
        },
        play: {
            0x02: {
                name: "ChatMessage"
            },
            0x0E: {
                name: "KeepAlive"
            },

            // TODO
            0x00: placeholder("TeleportConfirm"),
            0x01: placeholder("QueryBlockNBT"),
            0x03: placeholder("ClientStatus"),
            0x04: placeholder("ClientSettings"),
            0x05: placeholder("TabComplete"),
            0x06: placeholder("ConfirmTransaction"),
            0x07: placeholder("EnchantItem"),
            0x08: placeholder("ClickWindow"),
            0x09: placeholder("CloseWindow"),
            0x0A: placeholder("PluginMessage"),
            0x0C: placeholder("QueryEntityNBT"),
            0x0D: placeholder("UseEntity"),
            0x0B: placeholder("EditBook"),
            0x0F: placeholder("Player"),
            0x10: placeholder("PlayerPosition"),
            0x11: placeholder("PlayerPositionAndLook"),
            0x12: placeholder("PlayerLook"),
            0x13: placeholder("VehicleMove"),
            0x14: placeholder("SteerBoat"),
            0x15: placeholder("PickItem"),
            0x16: placeholder("CraftRecipeRequest"),
            0x17: placeholder("PlayerAbilities"),
            0x18: placeholder("PlayerDigging"),
            0x19: placeholder("EntityAction"),
            0x1A: placeholder("SteerVehicle"),
            0x1B: placeholder("RecipeBookData"),
            0x1C: placeholder("NameItem"),
            0x1D: placeholder("ResourcePackStatus"),
            0x1E: placeholder("AdvancementTab"),
            0x1F: placeholder("SelectTrade"),
            0x20: placeholder("SetBeaconEffect"),
            0x21: placeholder("HeldItemChange"),
            0x22: placeholder("UpdateCommandBlock"),
            0x23: placeholder("UpdateCommandBlockMinecart"),
            0x24: placeholder("CreativeInventoryAction"),
            0x25: placeholder("UpdateStructureBlock"),
            0x26: placeholder("UpdateSign"),
            0x27: placeholder("Animation"),
            0x28: placeholder("Spectate"),
            0x29: placeholder("PlayerBlockPlacement"),
            0x2A: placeholder("UseItem")
        }
    },
    callbacks: {
        none: {
            /**
             * @param {Player} player
             * @param {number} dataLength
             */
            Handshake: (player, dataLength) => {
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
        },
        stat: {
            /**
             * @param {Player} player
             * @param {number} dataLength
             */
            Request: (player, dataLength) => {
                var response = utils.createBufferObject();
                var responseData = {
                    "version": {
                        "name": "1.13.2",
                        "protocol": 404
                    },
                    "players": {
                        "max": player.Server.config['max_players'],
                        "online": player.Server.onlinePlayers.length,
                        "sample": []
                    },
                    "description": {
                        "text": player.Server.config['motd']
                    },
                    "favicon": "data:image/png;base64," + player.Server.icons[Math.floor(Math.random() * player.Server.icons.length)]
                }
                player.Server.onlinePlayers.forEach(player => {
                    responseData.players.sample.push({
                        "name": player.Username,
                        "id": player.UUID
                    });
                });
                utils.writeJson(responseData, 32767, response);
                utils.writePacket(0x00, response, player, "stat", "Response");
            },
            /**
             * @param {Player} player
             * @param {number} dataLength
             */
            Ping: (player, dataLength) => {
                var payload = utils.readLong(player);
                var pong = utils.createBufferObject();
                utils.writeLong(payload, pong);
                utils.writePacket(0x01, pong, player, "stat", "Pong");
            }
        },
        logn: {
            /**
             * @param {Player} player
             * @param {number} dataLength
             */
            LoginStart: (player, dataLength) => {
                var username = utils.readString(player, 16);
                player.Username = username;
                var encryptionRequest = utils.createBufferObject();
                utils.writeString("", 20, encryptionRequest);
                utils.writeByteArray(player.Server.publicKeyDER, encryptionRequest, true);
                utils.writeByteArray(player.VerifyToken, encryptionRequest, true);
                utils.writePacket(0x01, encryptionRequest, player, "logn", "EncryptionRequest");
            },
            /**
             * @param {Player} player
             * @param {number} dataLength
             */
            EncyptionResponse: (player, dataLength) => {
                var sharedSecret = Buffer.from(utils.readByteArray(player));
                player.SharedSecret = crypto.privateDecrypt({ key: player.Server.privateKeyPEM, padding: player.Server.encryptionPadding }, sharedSecret);
                var verifyToken = Buffer.from(utils.readByteArray(player));
                var decryptedVerifyToken = crypto.privateDecrypt({ key: player.Server.privateKeyPEM, padding: player.Server.encryptionPadding }, verifyToken);
                if (Buffer.compare(decryptedVerifyToken, player.VerifyToken) != 0) {
                    console.log("Client sent back an incorrent verification token, things will probably go badly from here");
                }
                player.UseEncryption = true;
                var cryptoServerHash = crypto.createHash('sha1');
                cryptoServerHash.update("");
                cryptoServerHash.update(player.SharedSecret);
                cryptoServerHash.update(player.Server.publicKeyDER);                                   // DONT FUCKING TOUCH THIS CODE 
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
        },
        play: {
            /**
             * @param {Player} player
             * @param {number} dataLength
             */
            ChatMessage: (player, dataLength) => {
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
            },
            /**
             * @param {Player} player
             * @param {number} dataLength
             */
            KeepAlive: (player, dataLength) => {
                var time = utils.readLong(player);
                var ping = new Date().getTime() - time;
                player.ping = ping;
                console.log(ping);
            },

            // TODO
            TeleportConfirm: () => { },
            QueryBlockNBT: () => { },
            ClientStatus: () => { },
            ClientSettings: () => { },
            TabComplete: () => { },
            ConfirmTransaction: () => { },
            EnchantItem: () => { },
            ClickWindow: () => { },
            CloseWindow: () => { },
            PluginMessage: () => { },
            QueryEntityNBT: () => { },
            UseEntity: () => { },
            EditBook: () => { },
            Player: () => { },
            PlayerPosition: () => { },
            PlayerPositionAndLook: () => { },
            PlayerLook: () => { },
            VehicleMove: () => { },
            SteerBoat: () => { },
            PickItem: () => { },
            CraftRecipeRequest: () => { },
            PlayerAbilities: () => { },
            PlayerDigging: () => { },
            EntityAction: () => { },
            SteerVehicle: () => { },
            RecipeBookData: () => { },
            NameItem: () => { },
            ResourcePackStatus: () => { },
            AdvancementTab: () => { },
            SelectTrade: () => { },
            SetBeaconEffect: () => { },
            HeldItemChange: () => { },
            UpdateCommandBlock: () => { },
            UpdateCommandBlockMinecart: () => { },
            CreativeInventoryAction: () => { },
            UpdateStructureBlock: () => { },
            UpdateSign: () => { },
            Animation: () => { },
            Spectate: () => { },
            PlayerBlockPlacement: () => { },
            UseItem: () => { }
        }
    }
}