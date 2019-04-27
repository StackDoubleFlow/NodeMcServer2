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
        parameters: [],
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
    utils.writeByte(100, joinGame); // Max players
    utils.writeString("default", 16, joinGame); // Level type
    utils.writeVarInt(16, joinGame); // View distance
    utils.writeByte(0, joinGame);
    utils.writePacket(0x25, joinGame, player, "logn", "JoinGame");

    player.state = "play";
    player.server.onPlayerConnected(player);


    var playerPositionAndLook = utils.createBufferObject();
    // Quick 0 position test
    utils.writeByteArray(Buffer.alloc(8), playerPositionAndLook, false); // X
    utils.writeByteArray(Buffer.alloc(8), playerPositionAndLook, false); // Y
    utils.writeByteArray(Buffer.alloc(8), playerPositionAndLook, false); // Z
    utils.writeByteArray(Buffer.alloc(4), playerPositionAndLook, false); // Yaw
    utils.writeByteArray(Buffer.alloc(4), playerPositionAndLook, false); // Pitch
    utils.writeByte(0, playerPositionAndLook);
    utils.writeVarInt(10121, playerPositionAndLook);
    utils.writePacket(0x35, playerPositionAndLook, player, "play", "PlayerPositionAndLook");


    utils.writePacket(0x21, player.server.world.getChunkPacket(0, 0, true), player, "play", "ChunkData");

    var playerListHeaderAndFooter = utils.createBufferObject();
    utils.writeJson({ text: "MCNodeServer" }, 32767, playerListHeaderAndFooter);
    utils.writeJson({ "text": "Made by StackDoubleFlow & Allen" }, 32767, playerListHeaderAndFooter);
    utils.writePacket(0x53, playerListHeaderAndFooter, player, "play", "PlayerListHeaderAndFooter");
    
    https.get("https://sessionserver.mojang.com/session/minecraft/profile/" + player.unformattedUUID, (res) => {
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
    if(response.statusCode !== 200) {
        console.log("Unable to retrieve player profile!");
    }
    data = JSON.parse(data);
    if(data["error"]) {
        console.log("(TODO: Try again later) Error getting player profile: " + date["error"]);
    }
    console.log(data);
    player.properties = data["properties"];
    var playerInfo = utils.createBufferObject();
    utils.writeVarInt(0, playerInfo);
    utils.writeVarInt(player.server.onlinePlayers.length, playerInfo);
    player.server.onlinePlayers.forEach(plr => {
        utils.writeUUID(player, playerInfo);
        utils.writeString(plr.username, 16, playerInfo);
        utils.writeVarInt(plr.properties, playerInfo);
        
    });

}

const version = {
    name: "1.14",
    version: 477,
    types: {
    },
    outboundPackets: {
        none: {},
        stat: {},
        login: {},
        play: {}
    },
    senders: {
        none: {

        },
        stat: {

        },
        logn: {
            sendLoginRequest: (player, UUID, username) => {

            }
        },
        play: {

        }
    },
    inboundPackets: {
        none: {
            0x00: {
                name: "Handshake",
                parameters: [
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
            }
        },
        stat: {
            0x00: {
                name: "Request",
                parameters: []
            },
            0x01: {
                name: "Ping",
                parameters: [
                    {
                        name: "pingId",
                        type: "long"
                    }
                ]
            }
        },
        logn: {
            0x00: {
                name: "LoginStart",
                parameters: [
                    {
                        name: "username",
                        type: "string",
                        max: 16
                    }
                ]
            },
            0x01: {
                name: "EncyptionResponse",
                parameters: [
                    {
                        name: "sharedSecret",
                        lengthType: "varint",
                        type: "byte[]"
                    },
                    {
                        name: "verifyToken",
                        lengthType: "varint",
                        type: "byte[]"
                    }
                ]
            }
        },
        play: {
            0x03: {
                name: "ChatMessage",
                parameters: [
                    {
                        name: "message",
                        type: "string",
                        max: 256
                    }
                ]
            },
            0x0F: {
                name: "KeepAlive",
                parameters: [
                    {
                        name: "keepAliveId",
                        type: "long"
                    }
                ]
            },

            // TODO
            0x00: placeholder("TeleportConfirm"),
            0x01: placeholder("QueryBlockNBT"),
            0x02: placeholder("SetDifficulty"),
            0x04: placeholder("ClientStatus"),
            0x05: placeholder("ClientSettings"),
            0x06: placeholder("TabComplete"),
            0x07: placeholder("ConfirmTransaction"),
            0x08: placeholder("EnchantItem"),
            0x09: placeholder("ClickWindow"),
            0x0A: placeholder("CloseWindow"),
            0x0B: placeholder("PluginMessage"),
            0x0C: placeholder("EditBook"),
            0x0D: placeholder("QueryEntityNBT"),
            0x0E: placeholder("UseEntity"),
            0x10: placeholder("LockDifficulty"),
            0x11: placeholder("PlayerPosition"),
            0x12: placeholder("PlayerPositionAndLook"),
            0x13: placeholder("PlayerLook"),
            0x14: placeholder("Player"),
            0x15: placeholder("VehicleMove"),
            0x16: placeholder("SteerBoat"),
            0x17: placeholder("PickItem"),
            0x18: placeholder("CraftRecipeRequest"),
            0x19: placeholder("PlayerAbilities"),
            0x1A: placeholder("PlayerDigging"),
            0x1B: placeholder("EntityAction"),
            0x1C: placeholder("SteerVehicle"),
            0x1D: placeholder("RecipeBookData"),
            0x1E: placeholder("NameItem"),
            0x1F: placeholder("ResourcePackStatus"),
            0x20: placeholder("AdvancementTab"),
            0x21: placeholder("SelectTrade"),
            0x22: placeholder("SetBeaconEffect"),
            0x23: placeholder("HeldItemChange"),
            0x24: placeholder("UpdateCommandBlock"),
            0x25: placeholder("UpdateCommandBlockMinecart"),
            0x26: placeholder("CreativeInventoryAction"),
            0x27: placeholder("UpdateJigsawBlock"),
            0x28: placeholder("UpdateStructureBlock"),
            0x29: placeholder("UpdateSign"),
            0x2A: placeholder("Animation"),
            0x2B: placeholder("Spectate"),
            0x2C: placeholder("PlayerBlockPlacement"),
            0x2D: placeholder("UseItem")
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
                    player.state = "stat";
                } else if (nextState == 2) {
                    player.state = "logn";
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
                        "name": "NodeMC 1.14",
                        "protocol": 477
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
                player.username = username;
                var encryptionRequest = utils.createBufferObject();
                utils.writeString("", 20, encryptionRequest);
                utils.writeByteArray(player.server.publicKeyDER, encryptionRequest, true);
                utils.writeByteArray(player.verifyToken, encryptionRequest, true);
                utils.writePacket(0x01, encryptionRequest, player, "logn", "EncryptionRequest");
            },
            /**
             * @param {Player} player
             * @param {number} dataLength
             */
            EncyptionResponse: (player, dataLength) => {
                var sharedSecret = Buffer.from(utils.readByteArray(player));
                player.sharedSecret = crypto.privateDecrypt({ key: player.server.privateKeyPEM, padding: player.server.encryptionPadding }, sharedSecret);
                var verifyToken = Buffer.from(utils.readByteArray(player));
                var decryptedVerifyToken = crypto.privateDecrypt({ key: player.server.privateKeyPEM, padding: player.server.encryptionPadding }, verifyToken);
                if (Buffer.compare(decryptedVerifyToken, player.verifyToken) != 0) {
                    console.log("Client sent back an incorrent verification token, things will probably go badly from here");
                }
                player.useEncryption = true;
                var cryptoServerHash = crypto.createHash('sha1');
                cryptoServerHash.update("");
                cryptoServerHash.update(player.sharedSecret);
                cryptoServerHash.update(player.server.publicKeyDER);                                   // DONT FUCKING TOUCH THIS CODE 
                var digest = cryptoServerHash.digest();
                var serverHash = utils.minecraftHexDigest(digest);
                player.cipher = crypto.createCipheriv("aes-128-cfb8", player.sharedSecret, player.sharedSecret);
                player.cipher.pipe(player.tcpSocket);
                player.decipher = crypto.createDecipheriv("aes-128-cfb8", player.sharedSecret, player.sharedSecret);
                https.get("https://sessionserver.mojang.com/session/minecraft/hasJoined?username=" + player.username + "&serverId=" + serverHash, (res) => {
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
                if(chatMessage.startsWith("/")) {
                    var command = chatMessage.split(" ")[0].substr(1);
                    var commandArguments = chatMessage.split(" ").splice(0, 1);
                    if(command == "leave") {
                        player.kick("Bye bye!");
                    }
                    console.log(player.username + " issued the command: " + chatMessage);
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
            },
            /**
             * @param {Player} player
             * @param {number} dataLength
             */
            KeepAlive: (player, dataLength) => {
                var time = utils.readLong(player);
                var ping = new Date().getTime() - time;
                player.ping = ping;
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

module.exports = version;