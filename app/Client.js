
'use strict'

import { inflate } from 'zlib';
import MinecraftServer from "./MinecraftServer";
import PacketManager from "./packets/PacketManager"
import Location from "./world/Location";
import Item from "./world/Item";

const net = require('net');
const utils = require('./utils');
const crypto = require('crypto');

export default class Client {
  /**
   * Initializes a player object
   * 
   * @param {net.Socket} socket
   * The player's TCP socket
   * @param {MinecraftServer} server
   * The server the player is connected too
   */
  constructor(socket, server) {
    /**
     * @type {Location}
     */
    this.location = new Location(server.world, 0, server.world.getTopMostBlock(0, 0) + 1, 0, 0, 0);
    /**
     * The player's network state
     * @type {string}
     */
    this.state = "none";
    /**
     * The player's network state
     * @type {net.Socket}
     */
    this.tcpSocket = socket;
    /**
     * If set, packets with be compressed with zlib
     */
    this.usePacketCompression = false;
    /**
     * The PacketManager this player will use
     */
    this.packetManager = new PacketManager();
    /**
     * The server instance
     * @type {MinecraftServer}
     */
    this.server = server;
    /**
     * If set, this player is acually an online player
     */
    this.isOnline = false;
    /**
     * Verify token used for encryption
     */
    this.verifyToken = crypto.randomBytes(4);
    /**
     * The player's username
     */
    this.username = "";
    /**
     * The shared secret used for encryption
     */
    this.sharedSecret = undefined;
    /**
     * Use encryption
     */
    this.useEncryption = false;
    /**
     * Internal buffer used for packet reading
     */
    this.internalBuffer = Buffer.alloc(0);
    /**
     * Index on the InternalBuffer
     */
    this.internalIndex = 0;
    /**
     * UUID of the player
     * @type {string}
     */
    this.UUID = undefined;
    /**
     * Unformatted UUID of the player
     * @type {string}
     */
    this.unformattedUUID = undefined;
    /**
     * The cipher used for encryption
     * @type {crypto.Cipher}
     */
    this.cipher = undefined;
    /**
     * The decipher used for encryption
     * @type {crypto.Decipher}
     */
    this.decipher = undefined;
    /**
     * The player's properties
     */
    this.properties = [];
    /**
     * The entity ID of the player
     */
    this.entityID = 0;
    /**
     * The ping player
     */
    this.ping = -1;
    /**
     * Is true when the player is on the ground
     */
    this.onGround = true;
    /**
     * A bitmask containing all the enabled skin parts
     */
    this.displayedSkinParts = 0;
    this.isSneaking = false;
    this.isSprinting = false;
    this.gamemode = "creative";
    this.inventory = new Array(46);
    this.enderChest = new Array(27);
    this.heldItemSlot = 0;

    this.tcpSocket.on('readable', this.onStreamReadable.bind(this));
    this.tcpSocket.on('end', this.onStreamEnd.bind(this));
    this.tcpSocket.on('error', this.onStreamEnd.bind(this));
  }

  /**
   * @type {Item}
   */
  get heldItem() {
    return this.inventory[this.heldItemSlot + 36];
  }

  teleport(loc) {
    // TODO: Validate location
    this.location.x = loc.x;
    this.location.x = loc.y;
    this.location.x = loc.z;
    this.location.x = loc.yaw;
    this.location.x = loc.pitch;

    const teleportPacket = utils.createBufferObject();
    utils.writeVarInt(teleportPacket, this.entityID);
    utils.writeDouble(teleportPacket, loc.x);
    utils.writeDouble(teleportPacket, loc.y);
    utils.writeDouble(teleportPacket, loc.z);
    utils.writeDouble(teleportPacket, loc.yaw);
    utils.writeDouble(teleportPacket, loc.pitch);
    utils.writeByte(teleportPacket, 0);
    this.server.writePacketToAll(0x57, teleportPacket, "play", "EntityTeleport", [this]);

    const teleportSelfPacket = utils.createBufferObject();
    utils.writeDouble(teleportSelfPacket, loc.x);
    utils.writeDouble(teleportSelfPacket, loc.y);
    utils.writeDouble(teleportSelfPacket, loc.z);
    utils.writeFloat(teleportSelfPacket, loc.yaw);
    utils.writeFloat(teleportSelfPacket, loc.pitch);
    utils.writeByte(teleportSelfPacket, 0);
    utils.writePacket(0x36, teleportSelfPacket, this, "play", "PlayerPositionAndLook");
  }

  setGamemode(gamemode) {
    const gamemodes = {
      0: 0,
      "s": 0,
      "survival": 0,
      1: 1,
      "c": 1,
      "creative": 1,
      2: 2,
      "a": 2,
      "adventure": 2,
      3: 3,
      "sp": 3,
      "spectator": 3
    }

    gamemode = gamemodes[gamemode];

    if (gamemode === undefined)
      throw new Error("Invalid gamemode");

    this.gamemode = ["survival", "creative", "adventure", "spectator"][gamemode];

    const changeGameState = utils.createBufferObject();
    utils.writeByte(changeGameState, 3);
    utils.writeFloat(changeGameState, gamemode);
    utils.writePacket(0x1F, changeGameState, this, "play", "ChangeGameState");
    this.sendPlayerAblilites();
  }

  getStatusMetaDataBitMask() {
    let n = 0;

    // TODO: if (this.onFire) n |= 0x01;
    if (this.isSneaking) n |= 0x02;
    if (this.isSprinting) n |= 0x08;
    // TODO: if (this.isSwimming) n |= 0x10;
    // TODO: if (this.isInvisible) n |= 0x20;
    // TODO: if (this.isGlowing) n |= 0x40;
    // TODO: if (this.isFlyingWithElytra) n |= 0x80;

    return n;
  }

  /**
   * Called when the stream is readable
   * 
   */
  onStreamReadable() {
    if (this.tcpSocket.readableLength == 0) return;
    /*if(this.useEncryption) {
        this.decipher.write(this.tcpSocket.read());
        return;
    }*/
    utils.resetInternalBuffer(this);
    while (this.internalIndex < this.internalBuffer.length) {
      this.readNextPacket();
    }
  }

  onDecipherReadable() {
    if (this.decipher.readableLength == 0) return;
    utils.resetInternalBufferUsingDecipher(this);
    while (this.internalIndex < this.internalBuffer.length) {
      //console.log(this.internalIndex);
      this.readNextPacket();
    }
  }

  /**
   * Called when the stream ends
   * 
   */
  onStreamEnd() {
    if (this.isOnline) {
      this.server.onPlayerDisconnected(this);
    }
    this.isOnline = false;
  }

  /**
   * Reads the next packet (or tries too)
   * 
   */
  readNextPacket() {
    try {
      if (this.usePacketCompression) {
        const packetLength = utils.readVarInt(this);
        const dataLength = utils.readVarInt(this);
        if (dataLength !== 0) {
          utils.inflate(dataLength, this);
          const packetID = utils.readVarInt(this, true);
          this.packetManager.handlePacket(dataLength - packetID.len, this.state, packetID.val, this);
        } else {
          const packetID = utils.readVarInt(this);
          this.packetManager.handlePacket(packetLength - 1, this.state, packetID, this);
        }
      } else {
        const length = utils.readVarInt(this);
        const packetID = utils.readVarInt(this);
        this.packetManager.handlePacket(length, this.state, packetID, this);
      }
    } catch (e) {
      console.error(e.stack);
      /* this.kick({
          "text": "Internal server error",
          "color": "red"
      }); */
    }

  }

  chatName(color = "white") {
    const special = {
      "Notch": "gold",
      "StackDoubleFlow": "green",
      "AL_1": "aqua"
    };
    return {
      "text": this.username,
      "color": special[this.username] || color,
      "clickEvent": {
        "action": "suggest_command",
        "value": "/tell " + this.username + " "
      },
      "hoverEvent": {
        "action": "show_text",
        "value": this.UUID
      }
    };
  }

  sendMessage(message, type = 1) {
    if (this.state !== "play") throw Error('Can only send messages to player in "play" state');
    if (typeof message === "string")
      message = { "text": message };

    const response = utils.createBufferObject();
    utils.writeJson(response, message, 32767);
    utils.writeByte(response, type);
    utils.writePacket(0x0F, response, this, "play", "ChatMessage");
  }

  kick(reason) {
    if (this.state !== "play") throw Error('Can only kick a player in "play" state');
    if (typeof reason === "string")
      reason = { "text": reason };

    const response = utils.createBufferObject();
    utils.writeJson(response, reason, 32767);
    utils.writePacket(0x1B, response, this, "play", "Disconnect");

    this.tcpSocket.end();
  }

  sendPlayerAblilites() {

  }

  sendPacket(name, ...args) {
    const packetDef = this.packetManager.outboundPackets[this.state][name];

    if (!packetDef) {
      console.error(`Unknown packet "${name}" for state "${this.state}"`)
      return;
    };

    const packetData = utils.createBufferObject();
    utils.writeParameters(packetDef.parameters, packetData, ...args);

    utils.writePacket(packetDef.id, packetData, this, this.state, name);
  }

}
