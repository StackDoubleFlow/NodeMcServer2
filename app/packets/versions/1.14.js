import Player from "../../Player";

var PacketManager = require('../PacketManager.js');
var utils = require('../../utils.js');
var crypto = require('crypto');
var https = require('https');
var http = require('http');


function placeholder(name, log=true) {
    return {
        name: name,
        parameters: [],
        todo: true,
        log: log
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
    utils.writePacket(0x35, playerPositionAndLook, player, "play", "PlayerPositionAndLook");

    


    //fs.writeFileSync("./chunkdump.hex", player.server.world.getChunkPacket(x, z, true).b, 'hex');

    // Chunk data
    for(var x = -7; x < 7; x++) {
        for(var z = -7; z < 7; z++) {
            utils.writePacket(0x21, player.server.world.getChunkPacket(x, z, true), player, "play", "ChunkData");
        }
    }

    // Tab Player List
    var playerListHeaderAndFooter = utils.createBufferObject();
    utils.writeJson({ text: "MCNodeServer" }, 32767, playerListHeaderAndFooter);
    utils.writeJson({ "text": "Made by StackDoubleFlow & Allen" }, 32767, playerListHeaderAndFooter);
    utils.writePacket(0x53, playerListHeaderAndFooter, player, "play", "PlayerListHeaderAndFooter");
    
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
    utils.writePacket(0x33, playerInfo, player, "play", "PlayerInfo");

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
    player.server.writePacketToAll(0x33, playerInfo, "play", "PlayerInfo", [player]);

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
    utils.writePacket(0x11, declareCommands, player, "play", "DeclareCommands");
    

    
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
        utils.writeByte(15, spawnPlayer); // Displayed Skin Parts
        utils.writeVarInt(0, spawnPlayer);
        utils.writeByte(plr.displayedSkinParts, spawnPlayer);
        utils.writeByte(0xFF, spawnPlayer); // End metadata
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
    utils.writeByte(15, spawnPlayer); // Displayed Skin Parts
    utils.writeVarInt(0, spawnPlayer);
    utils.writeByte(0b01111111, spawnPlayer);
    utils.writeByte(0xFF, spawnPlayer); // End of metadata
    player.server.writePacketToAll(0x05, spawnPlayer, "play", "SpawnPlayer", [player]);

    
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
                ],
                auto: true
            },
            0x05: {
                name: "ClientSettings",
                parameters: [
                    {
                        name: "locale",
                        type: "string",
                        max: 16
                    },
                    {
                        name: "viewDistance",
                        type: "byte"
                    },
                    {
                        name: "chatMode",
                        type: "varint"
                    },
                    {
                        name: "chatColors",
                        type: "boolean"
                    },
                    {
                        name: "displayedSkinParts",
                        type: "byte"
                    },
                    {
                        name: "mainHand",
                        type: "varint"
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
            0x11: {
                name: "PlayerPosition",
                parameters: [
                    {
                        name: "x",
                        type: "double"
                    },
                    {
                        name: "y",
                        type: "double"
                    },
                    {
                        name: "z",
                        type: "double"
                    },
                    {
                        name: "onGround",
                        type: "boolean"
                    }
                ]
            },
            0x13: {
                name: "PlayerLook",
                parameters: [
                    {
                        name: "yaw",
                        type: "float"
                    },
                    {
                        name: "pitch",
                        type: "float"
                    },
                    {
                        name: "onGround",
                        type: "boolean"
                    }
                ]
            },
            0x1A: {
                name: "PlayerDigging",
                parameters: [
                    {
                        name: "status",
                        type: "varint"
                    },
                    {
                        name: "location",
                        type: "position"
                    },
                    {
                        name: "face",
                        type: "byte"
                    }
                ]
            },
            0x2C: {
                name: "PlayerBlockPlacement",
                parameters: [
                    {
                        name: "hand",
                        type: "varint"
                    },
                    {
                        name: "location",
                        type: "position"
                    },
                    {
                        name: "face",
                        type: "varint"
                    },
                    {
                        name: "cursorPositionX",
                        type: "float"
                    },
                    {
                        name: "cursorPositionY",
                        type: "float"
                    },
                    {
                        name: "cursorPositionZ",
                        type: "float"
                    },
                    {
                        name: "insideBlock",
                        type: "boolean"
                    }
                ]
            },
            0x2A: {
                name: "Animation",
                parameters: [
                    {
                        name: "hand",
                        type: "varint",
                        values: {
                            0: "main",
                            1: "offhand"
                        }
                    }
                ]
            },
            0x1B: {
                name: "EntityAction",
                parameters: [
                    {
                        name: "entityId",
                        type: "varint"
                    },
                    {
                        name: "actionId",
                        type: "varint",
                        values: {
                            0: "startSneaking",
                            1: "stopSneaking",
                            2: "leaveBed",
                            3: "startSprinting",
                            4: "stopSprinting",
                            5: "startHorseJump",
                            6: "stopHorseJump",
                            7: "openHorseInventory",
                            8: "startFlyingWithElytra"
                        }
                    },
                    {
                        name: "jumpBoost",
                        type: "varint"
                    }
                ],
                auto: true
            },

            // TODO
            0x00: placeholder("TeleportConfirm"),
            0x01: placeholder("QueryBlockNBT"),
            0x02: placeholder("SetDifficulty"),
            0x04: placeholder("ClientStatus"),
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
            0x12: placeholder("PlayerPositionAndLook", false),
            0x14: placeholder("Player"),
            0x15: placeholder("VehicleMove"),
            0x16: placeholder("SteerBoat"),
            0x17: placeholder("PickItem"),
            0x18: placeholder("CraftRecipeRequest"),
            0x19: placeholder("PlayerAbilities"),
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
            0x2B: placeholder("Spectate"),
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
                player.tcpSocket.removeListener('readable', player.onStreamReadable);
                player.tcpSocket.pipe(player.decipher);
                player.decipher.on('readable', player.onDecipherReadable.bind(player));
                var setCompression = utils.createBufferObject();
                utils.writeVarInt(500, setCompression);
                utils.writePacket(0x03, setCompression, player, "logn", "SetCompression");
                player.usePacketCompression = true;
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
            ChatMessage: (player, dataLength, chatMessage) => {
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
                            "text": chatMessage.replace(/[^a-zA-Z0-9~`!@#$%^&*()_=+* \[\];':",.<>?/\\-]/g, '*')
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
                var keepAliveID = utils.readLong(player);
                var timeSinceLastKeepAlive = new Date().getTime() - player.server.timeOfLastKeepAlive;
                player.ping = timeSinceLastKeepAlive;
                var playerInfo = utils.createBufferObject();
                utils.writeVarInt(2, playerInfo); // Action (Update Latency)
                utils.writeVarInt(1, playerInfo); // Number of players
                utils.writeUUID(player, playerInfo) // UUID
                utils.writeVarInt(player.ping, playerInfo);
                player.server.writePacketToAll(0x33, playerInfo, "play", "PlayerInfo");
            },
            /**
             * @param {Player} player
             * @param {number} dataLength
             */
            PlayerDigging: (player, dataLength) => {
                const status = utils.readVarInt(player);
                const pos = utils.readPosition(player);
                const face = utils.readBytes(player, 1);

                if(status === 0) {
                    const blockBreak = utils.createBufferObject();
                    utils.writePosition(pos, blockBreak);
                    utils.writeVarInt(0, blockBreak);

                    const blockBreakParticle = utils.createBufferObject();
                    utils.writeInt(2001, blockBreakParticle);
                    utils.writePosition(pos, blockBreakParticle);
                    utils.writeInt(1, blockBreakParticle);
                    utils.writeByte(0, blockBreakParticle);

                    player.server.writePacketToAll(0x0B, blockBreak, "play", "BlockUpdate", [player]);
                    player.server.writePacketToAll(0x22, blockBreakParticle, "play", "Effect", [player]);
                }
                
                
            },
            /**
             * @param {Player} player
             * @param {number} dataLength
             */
            PlayerPosition: (player, dataLength) => {
                var oldX = player.location.x;
                var oldY = player.location.y;
                var oldZ = player.location.z;
                var newX = player.location.x = utils.readDouble(player);
                var newY = player.location.y = utils.readDouble(player);
                var newZ = player.location.z = utils.readDouble(player);
                var deltaX = Math.round(((newX * 32) - (oldX * 32)) * 128);
                var deltaY = Math.round(((newY * 32) - (oldY * 32)) * 128);
                var deltaZ = Math.round(((newZ * 32) - (oldZ * 32)) * 128);
                player.onGround = utils.readBoolean(player);
                var entityRelativeMove = utils.createBufferObject();
                utils.writeVarInt(player.entityID, entityRelativeMove);
                utils.writeShort(deltaX, entityRelativeMove);
                utils.writeShort(deltaY, entityRelativeMove);
                utils.writeShort(deltaZ, entityRelativeMove);
                utils.writeByte(player.onGround ? 1 : 0, entityRelativeMove);
                player.server.writePacketToAll(0x28, entityRelativeMove, "play", "EntityRelativeMove", [player]);
            },
            /**
             * @param {Player} player
             * @param {number} dataLength
             */
            PlayerLook: (player, dataLength) => {
                var yaw = player.location.yaw = utils.readFloat(player);
                var pitch = player.location.pitch = utils.readFloat(player);
                var onGround = player.onGround = utils.readBoolean(player);
                var entityLook = utils.createBufferObject();
                utils.writeVarInt(player.entityID, entityLook);
                utils.writeAngle(yaw, entityLook);
                utils.writeAngle(pitch, entityLook);
                utils.writeByte(onGround ? 1 : 0, entityLook);
                player.server.writePacketToAll(0x2A, entityLook, "play", "EntityLook", [player]);
            },
            /**
             * @param {Player} player
             * @param {number} dataLength
             */
            PlayerBlockPlacement: (player, dataLength) => {
                var hand = utils.readVarInt(player);
                var location = utils.readPosition(player);
                var face = utils.readVarInt(player);
                var cursorX = utils.readFloat(player);
                var cursorY = utils.readFloat(player);
                var cursorZ = utils.readFloat(player);
                var insideBlock = utils.readBoolean(player);
            },
            /**
             * @param {Player} player
             * @param {number} dataLength
             */
            Animation: (player, dataLength) => {
                const hand = utils.readVarInt(player);
                var animation = utils.createBufferObject();
                utils.writeVarInt(player.entityID, animation);
                utils.writeByte(hand == 0 ? 0 : 3, animation);
                player.server.writePacketToAll(0x06, animation, "play", "Animation", [player]);
            },
            /**
             * @param {Player} player
             * @param {number} dataLength
             */
            ClientSettings: (player, dataLength) => {
                var locale = utils.readString(player, 16);
                var viewDistance = utils.readBytes(player, 1);
                var chatMode = utils.readVarInt(player);
                var chatColors = utils.readBoolean(player);
                player.displayedSkinParts = utils.readBytes(player, 1)[0];
                var mainHand = utils.readVarInt(player);
                var entityMetadata = utils.createBufferObject();
                utils.writeVarInt(player.entityID, entityMetadata);
                utils.writeByte(15, entityMetadata); // Displayed Skin Parts
                utils.writeVarInt(0, entityMetadata);
                utils.writeByte(player.displayedSkinParts, entityMetadata);
                utils.writeByte(0xff, entityMetadata); // End of metadata
                player.server.writePacketToAll(0x43, entityMetadata, "play", "EntityMetadata"/*, [player]*/);
            },
            /**
             * @param {Player} player
             * @param {number} dataLength
             */
            EntityAction: (player, dataLength, entityId, actionId, jumpBoost) => {
                switch(actionId) {
                    case "startSneaking":
                        player.isSneaking = true;
                        break;
                    case "stopSneaking":
                        player.isSneaking = false;
                        break;
                    case "leaveBed":
                        break;
                    case "startSprinting":
                        player.isSprinting = true;
                        break;
                    case "stopSprinting":
                        player.isSprinting = false;
                        break;
                    case "startHorseJump":
                        break;
                    case "stopHorseJump":
                        break;
                    case "openHorseInventory":
                        break;
                    case "startFlyingWithElytra":
                        break;
                }

                var entityMetadata = utils.createBufferObject();
                utils.writeVarInt(player.entityID, entityMetadata);
                utils.writeByte(0, entityMetadata); // Status meta data
                utils.writeVarInt(1, entityMetadata);
                utils.writeVarInt(player.getStatusMetaDataBitMask(), entityMetadata);
                utils.writeByte(0xff, entityMetadata); // End of metadata
                player.server.writePacketToAll(0x43, entityMetadata, "play", "EntityMetadata", [player]);
            },


            // TODO
            TeleportConfirm: () => { },
            QueryBlockNBT: () => { },
            ClientStatus: () => { },
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
            PlayerPositionAndLook: () => { },
            VehicleMove: () => { },
            SteerBoat: () => { },
            PickItem: () => { },
            CraftRecipeRequest: () => { },
            PlayerAbilities: () => { },
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
            Spectate: () => { },
            UseItem: () => { }
        }
    }
}

module.exports = version;