import Client from "./Client";
import Position from "./world/Position";
import { readNBTFromPlayer } from "./nbt";

var net = require('net');
var crypto = require('crypto');
var https = require('https');
var zlib = require('zlib');

export const types = {
  read: {
    byte: readByte,
    boolean: readBoolean,
    double: readDouble,
    float: readFloat,
    long: readLong,
    position: readPosition,
    string: readString,
    ushort: readUShort,
    varint: readVarInt,
    varlong: readVarLong,
    nbt: readNBTFromPlayer,
    "null": () => { },
    [null]: () => { }
  },
  write: {
    byte: writeByte,
    boolean: writeByte,
    double: writeDouble,
    float: writeFloat,
    long: writeLong,
    position: writePosition,
    string: writeString,
    ushort: writeUShort,
    varint: writeVarInt,
    varlong: writeVarLong,
    angle: writeAngle,
    int: writeInt,
    json: writeJson,
    nbitlong: writeNBitLong,
    nbt: writeNbt,
    short: writeShort,
    uuid: writeUUID,
    buffer: appendData,
    "null": () => { },
    [null]: () => { }
  }
}

/*
 * This is just a place to put things until I find a better place to put them.
 */

/**
 * Makes a get request to the specified url
 * 
 * @param {string} url
 * The url to fetch from 
 * @return {string} data
 */
export const createGetRequest = (url) => new Promise((resolve, reject) => {
  https.get(url, (res) => {
    let data = '';
    res.on('end', () => resolve(data));
    res.on('data', (buf) => data += buf.toString());
  }).on('error', e => reject(e));
});

/**
 * Used for compression
 * 
 * @param {number} length 
 * @param {Client} player
 */
export function inflate(length, player) {
  var data = player.internalBuffer.slice(player.internalIndex, player.internalIndex + length);
  var inflatedData = zlib.inflateSync(data);
  var dataToBeRead = player.internalBuffer.slice(player.internalIndex + length, player.internalBuffer.length - 1);
  player.internalBuffer = Buffer.concat([inflatedData, dataToBeRead]);
  player.internalIndex = 0;
}

/**
 * Resets the internal buffer of the player using the data from the player
 * 
 * @param {Client} player 
 * Player to read from
 */
export function resetInternalBuffer(player) {
  player.internalBuffer = player.tcpSocket.read();
  if (!player.internalBuffer) console.log("Internal Buffer was null");
  player.internalIndex = 0;
}

/**
 * Resets the internal buffer of the player using the data from the player's decipher
 * 
 * @param {Client} player 
 * Player to read from
 */
export function resetInternalBufferUsingDecipher(player) {
  player.internalBuffer = player.decipher.read();
  if (!player.internalBuffer) console.log("Internal Buffer was null");
  player.internalIndex = 0;
}

/**
 * Reads a byte from the network stream
 * 
 * @param {Client} player
 * Player to read from
 * @param {number} bytes
 * Number of bytes to read
 * @return {Buffer} data
 * Data that has been read
 */
export function readBytes(player, bytes) {
  if (player.internalIndex > player.internalBuffer.length) {
    console.log("Out of bounds error reading internal buffer: ", player.internalIndex, " > ", player.internalBuffer.length - 1);
  }
  var data = player.internalBuffer.slice(player.internalIndex, bytes + player.internalIndex);
  player.internalIndex += bytes;
  return data;
}

export function readByte(player) {
  return readBytes(player, 1);
}

export function readType(type, player, ...args) {
  return types.read[type](player, ...args);
}

export function writeType(type, player, ...args) {
  return types.write[type](player, ...args);
}

/**
 * @param {string} param
 * @param {Client} player
 * Player to read from
 * @return {Array} arguments
 */
export function readParameter(arg, player) {
  /**
   * @type {string}
   */
  let type = arg.type;
  let isArray = arg.array;
  let length = 1;

  if (isArray) {
    const value = [];
    length = readType(arg.lengthType, player);

    for (let i = 0; i < length; i++) {
      if (arg.parameters) {
        const v = {};
        for (let a of arg.parameters) {
          v[a.name] = readParameter(a, player);
        }
        value.push(v);
      } else {
        let v = readType(type, player, arg.max);
        if (arg.values && v in arg.values)
          v = arg.values[v];
        value.push(v);
      }
    }

    return value;
  } else {
    let value = readType(type, player, arg.max);
    if (arg.values && value in arg.values)
      value = arg.values[value];
    return value;
  }
}

/**
 * @param {object<string, *>} params
 * @param {Client} player
 * Player to read from
 * @return {Array} arguments
 */
export function readParameters(params, player) {
  const args = [];
  for (let arg of params) {
    args.push(readParameter(arg, player));
  }
  return args;
}

/**
 * @param {string} param
 * @param {Client} bufferObj
 * Player to read from
 * @return {Array} arguments
 */
export function writeParameter(def, bufferObj, value) {
  /**
   * @type {string}
   */
  let type = def.type;
  let isArray = def.array;

  if (isArray) {
    if (def.lengthType)
      writeType(def.lengthType, bufferObj, value.length);

    for (let i = 0; i < value.length; i++) {
      if (def.parameters) {
        for (let a of def.parameters)
          writeParameter(a, bufferObj, value[i]);
      } else {
        if (def.values && value[i] in def.values)
          value = arg.values[value[i]];
        writeType(type, bufferObj, value[i], def.max);
      }
    }

    return value;
  } else {
    if (def.parameters) {
      for (let a of def.parameters)
        writeParameter(a, bufferObj, value);
    } else {
      if (def.values && value in def.values)
        value = arg.values[value];
      writeType(type, bufferObj, value, def.max);
    }
  }
}

/**
 * Player to write to
 * 
 * @param {object<string, *>} params
 * @param {Client} player
 */
export function writeParameters(params, player, ...values) {
  if (params.length !== values.length)
    throw new Error("Missing or too much data");

  for (let i = 0; i < params.length; i++)
    writeParameter(params[i], player, values[i]);
}

/**
 * Reads a Unsigned Short from the network stream
 * 
 * @param {Client} player
 * Player to read from
 * @return {number} value
 * Value of the Unsigned Shor that has been read
 */
export function readUShort(player) {
  var buffer = readBytes(player, 2);
  return buffer.readUIntBE(0, 2);
}

/**
 * Reads a Float from the network stream
 * 
 * @param {Client} player
 * Player to read from
 * @return {number} value
 * Value of the Float that has been read
 */
export function readFloat(player) {
  var buffer = readBytes(player, 4);
  return buffer.readFloatBE(0);
}

/**
 * Reads a Double from the network stream
 * 
 * @param {Client} player
 * Player to read from
 * @return {number} value
 * Value of the Double that has been read
 */
export function readDouble(player) {
  var buffer = readBytes(player, 8);
  return buffer.readDoubleBE(0);
}


/**
 * Reads a Boolean from the network stream
 * 
 * @param {Client} player
 * Player to read from
 * @return {number} value
 * Value of the Boolean that has been read
 */
export function readBoolean(player) {
  var byte = readBytes(player, 1).readInt8(0);
  return (byte === 0 ? false : true);
}

/**
 * 
 * @param {Client} player 
 * Player to read from
 * @return {Position}
 */
export function readPosition(player) {
  var data = readBytes(player, 8);
  var x = data.readUInt32BE(0) >>> 6;
  var zHigh = (data.readUInt32BE(2) & 0x003FFFFF) << 4;
  var zLow = (data.readUInt32BE(4) & 0x0000F000) >> 12;
  var z = zLow | zHigh;
  var y = data.readUInt32BE(4) & 0x00000FFF;
  if (x >= 0x02000000) x -= 67108864;
  if (z >= 0x02000000) z -= 67108864;
  //if (y >= 0x800)       y -= 0x1000;
  return new Position(x, y, z);
}

/**
 * @param {Position} pos
 * @param {Client} bufferObject
 */
export function writePosition(bufferObject, pos) {
  var x = pos.x, y = pos.y, z = pos.z;
  var data = Buffer.alloc(8);
  var longHigh = ((x & 0x3FFFFFF) << 38) | ((z & 0x003FFFFF) >>> 16); // This shit shouldn't even work
  var longLow = (y & 0xFFF) | ((z & 0xFFFFF) << 12);                  // I'm probably utilizing a bug in js but that's cool I guess
  data.writeInt32BE(longHigh >> 32, 0);
  data.writeInt32BE(longLow, 4);
  appendData(bufferObject, data);
}

/**
 * Reads a string from the network stream
 * 
 * @param {Client} player 
 * Player to read from
 * @param {number} n 
 * Maximum string length
 */
export function readString(player, n) {
  var length = readVarInt(player);
  if (n > 32767) {
    console.log("n was greater than 32767 while reading string!");
  }
  return readBytes(player, length).toString("utf-8");
}

/**
 * Reads a VarInt from the network stream
 * 
 * @param {Client} player
 * Player to read from
 * @param {boolean} returnLength
 * @return {number} value
 * Value of the VarInt that has been read
 */
export function readVarInt(player, returnLength = false) {
  var numRead = 0;
  var result = 0;
  var read;
  do {
    read = readBytes(player, 1).readUInt8(0);
    var value = (read & 0b01111111);
    result |= (value << (7 * numRead));
    numRead++;
    if (numRead > 5) {
      console.error("VarInt is too big");
    }
  } while ((read & 0b10000000) != 0);
  if (returnLength) {
    return { val: result, len: numRead };
  } else {
    return result;
  }
}

/**
 * Reads a VarLong from the network stream
 * 
 * @param {Client} player
 * Player to read from
 * @return {number} value
 * Value of the VarLong that has been read
 */
export function readVarLong(player) {
  var numRead = 0;
  var result = 0;
  var read;
  do {
    read = readBytes(player, 1);
    var value = (read & 0b01111111);
    result |= (value << (7 * numRead));

    numRead++;
    if (numRead > 10) {
      console.error("VarLong is too big");
    }
  } while ((read & 0b10000000) != 0);

  return result;
}

/**
 * Reads a Long from the network stream
 * 
 * @param {Client} player
 * Player to read from
 * @return {number} value
 * Value of the Long that has been read
 */
export function readLong(player) {
  var buffer = readBytes(player, 8);
  var low = buffer.readInt32BE(4);
  var n = buffer.readInt32BE() * 4294967296.0 + low;
  if (low < 0) n += 4294967296;
  return n;
}

/**
 * Appends data to a buffer
 * 
 * @param {Object} bufferObject 
 * The object containing the buffer to write to
 * @param {Buffer} data 
 * The data to append to the buffer
 */
export function appendData(bufferObject, data) {
  bufferObject.b = Buffer.concat([bufferObject.b, data]);
}

/**
 * Prepends data to a buffer
 * 
 * @param {Object} bufferObject 
 * The object containing the buffer to write to
 * @param {Buffer} data 
 * The data to prepend to the buffer
 */
export function prependData(bufferObject, data) {
  bufferObject.b = Buffer.concat([data, bufferObject.b]);
}

/**
 * Writes a byte to the buffer
 * 
 * @param {number} byte 
 * The byte to write to the buffer
 * @param {Object} bufferObject 
 * The object containing the buffer to write to
 */
export function writeByte(bufferObject, byte) {
  appendData(bufferObject, Buffer.from([byte]));
}

/**
 * Writes a byte array to the buffer
 * 
 * @param {Array<number>} bytes
 * The bytes to write to the buffer
 * @param {Object} bufferObject 
 * The object containing the buffer to write to
 * @param {boolean} writeLength
 */
export function writeByteArray(bufferObject, bytes, writeLength) {
  if (writeLength) writeVarInt(bufferObject, bytes.length);
  appendData(bufferObject, Buffer.from(bytes));
}

/**
 * Writes an angle to the buffer
 * 
 * @param {number} degrees 
 * The amount of degrees to write to the buffer
 * @param {Object} bufferObject 
 * The object containing the buffer to write to
 */
export function writeAngle(bufferObject, degrees) {
  var angle = Math.floor(((degrees % 360) / 360) * 256);
  writeByte(bufferObject, angle);
}


/**
 * Reads a byte array from the network stream
 * 
 * @param {Client} player
 * Player to read from
 * @return {Array<number>} bytes
 * Bytes of byte array that has been read
 */
export function readByteArray(player) {
  var out = new Array();
  var length = readVarInt(player);
  for (var i = 0; i < length; i++) {
    out.push(readBytes(player, 1).readUInt8());
  }
  return out;
}


/**
 * Writes a string to a buffer
 * 
 * @param {string} str 
 * String to write to the network stream
 * @param {number} n 
 * Maximum string length
 * @param {Object} bufferObject 
 * The object containing the buffer to write to
 */
export function writeString(bufferObject, str, n) {
  var out = Buffer.from(str, 'utf-8');
  if (str.length > n || out.length > n * 4) {
    console.error("Error writing string to network stream: ", str.length, n);
  }
  writeVarInt(bufferObject, out.length);
  appendData(bufferObject, out);
}

/**
 * Writes a float to the buffer object
 * 
 * @param {number} value 
 * @param {Object} bufferObject 
 */
export function writeFloat(bufferObject, value) {
  var temp = Buffer.alloc(4);
  temp.writeFloatBE(value, 0);
  appendData(bufferObject, temp);
}

/**
 * Writes a double to the buffer object
 * 
 * @param {number} value 
 * @param {Object} bufferObject 
 */
export function writeDouble(bufferObject, value) {
  var temp = Buffer.alloc(8);
  temp.writeDoubleBE(value, 0);
  appendData(bufferObject, temp);
}

/**
 * Writes a string to a buffer
 * 
 * @param {any} json 
 * Any object or primative that can be stringified
 * @param {number} n 
 * Maximum string length
 * @param {Object} bufferObject 
 * The object containing the buffer to write to
 */
export function writeJson(bufferObject, json, m) {
  writeString(bufferObject, JSON.stringify(json), m);
}

/**
 * Writes a Long to the network stream
 * 
 * @param {number} value
 * Value to write to the network stream
 * @param {Object} bufferObject 
 * The object containing the buffer to write to
 */
export function writeLong(bufferObject, value) {
  const b = Buffer.alloc(8);
  const MAX_UINT32 = 0xFFFFFFFF;
  const big = ~~(value / MAX_UINT32);
  const low = (value % MAX_UINT32) - big;
  b.writeUInt32BE(big, 0);
  b.writeUInt32BE(low, 4);
  appendData(bufferObject, b);
}

/**
 * Writes a VarInt to the network stream
 * 
 * @param {number} value
 * Value to write to the network stream
 * @param {Object} bufferObject 
 * The object containing the buffer to write to
 */
export function writeVarInt(bufferObject, value) {
  do {
    var temp = value & 0b01111111;
    // Note: >>> means that the sign bit is shifted with the rest of the number rather than being left alone
    value >>>= 7;
    if (value != 0) {
      temp |= 0b10000000;
    }
    writeByte(bufferObject, temp);
  } while (value != 0);
}

/**
 * Writes a VarLong to the network stream
 * 
 * @param {number} value
 * value to write to the network stream
 * @@param {Object} bufferObject
 * The object containing the buffer to write to
 */
export function writeVarLong(bufferObject, value) {
  do {
    var temp = value & 0b01111111;
    // Note: >>> means that the sign bit is shifted with the rest of the number rather than being left alone
    value >>>= 7;
    if (value != 0) {
      temp |= 0b10000000;
    }
    writeByte(bufferObject, temp);
  } while (value != 0);
}

/**
 * Writes a Int to the network stream
 * 
 * @param {number} value
 * Value to write to the network stream
 * @param {Object} bufferObject 
 * The object containing the buffer to write to
 */
export function writeInt(bufferObject, value) {
  var temp = Buffer.alloc(4);
  temp.writeInt32BE(value, 0);
  appendData(bufferObject, temp);
}

/**
 * Writes a short to the network stream
 * 
 * @param {number} value 
 * @param {Object} bufferObject 
 */
export function writeShort(bufferObject, value) {
  var temp = Buffer.alloc(2);
  temp.writeInt16BE(value);
  appendData(bufferObject, temp);
}

/**
 * Writes an unsigned short to the network stream
 * 
 * @param {number} value 
 * @param {Object} bufferObject 
 */
export function writeUShort(bufferObject, value) {
  var temp = Buffer.alloc(2);
  temp.writeUInt16BE(value);
  appendData(bufferObject, temp);
}

/**
 * Writes a UUID to the network stream
 * 
 * @param {Client} player
 * The player containing the UUID
 * @param {Object} bufferObject
 * the object containing the buffer to write to
 */
export function writeUUID(bufferObject, player) {
  var temp = Buffer.from(player.unformattedUUID, 'hex');
  appendData(bufferObject, temp);
}

/**
 * Writes NBT to the network stream
 * 
 * @param {Object} value
 * JSON NBT stuff
 * @param {Object} bufferObject
 * the object containing the buffer to write to
 */
export function writeNbt(bufferObject, value) {

}

export function writeNBitLong(bufferObject, n, value) {
  if (n % 8 !== 0) throw new Error("no");

  var longs = [];
  var longLow = 0;
  var longHigh = 0;
  for (var i = 0; i < 1; i++) {
    var longOffset = (i * 9) % 64;
    if (longOffset < 64 && longOffset + n - 1 >= 64) {
      longHigh |= (value << longOffset) & 0xFFFFFF;
      var temp = Buffer.alloc(8);
      temp.writeInt32BE(longHigh);
      temp.writeInt32BE(longLow, 4);
      longs.push(temp);
      longLow = longHigh = 0;
      longLow |= value >> (64 - longOffset);
    } else if (longOffset < 32 && longOffset + n - 1 >= 32) {
      longLow |= (value << longOffset) & 0xFFFFFF;
      longHigh |= value >> (32 - longOffset - 1);
    } else if (longOffset < 32) {
      longLow |= value << longOffset;
    } else {
      longHigh |= value << longOffset;
    }
    if (64 - longOffset == 9) {
      var temp = Buffer.alloc(8);
      temp.writeInt32BE(longHigh);
      temp.writeInt32BE(longLow, 4);
      longs.push(temp);
      longLow = longHigh = 0;
    }
  }

  writeByteArray(longs, bufferObject);
}


export function writeNumsToNLongBuffer(data, bitsPerNum, nums) {
  const longs = new Array(16 * 16 * 16 * bitsPerNum / 64).fill(0n);
  const longMask = 0xFFFFFFFFFFFFFFFFn;

  for (let i = 0; i < nums.length; i++) {
    const num = BigInt(nums[i] || 0);
    const longOffset = BigInt((i * bitsPerNum) % 64);
    const longIndex = Math.floor((i * bitsPerNum) / 64);
    let shiftedLong = num << longOffset;
    longs[longIndex] |= shiftedLong & longMask;
    const overflow = shiftedLong & (longMask << 64n);
    if (overflow) longs[longIndex + 1] |= overflow >> 64n;
  }

  writeVarInt(data, longs.length);

  let buf = Buffer.alloc(longs.length * 8);
  for (let i = 0; i < longs.length; i++) {
    buf.writeBigUInt64BE(longs[i], i * 8);
  }
  writeByteArray(data, buf);
}

/**
 * Writes a packet to the network stream
 * 
 * @param {number} packetID 
 * The ID of the packet to write in the header
 * @param {Object} data 
 * The data of the packet
 * @param {Client} player
 * The player to write to
 * @param {string} state
 * The state of the packet used for logging
 * @param {string} name
 * The name of the packet used for logging
 */
export function writePacket(packetID, data, player, state, name) {
  try {
    var dataDuplicate = createBufferObject();
    prependData(dataDuplicate, data.b);
    var bufferObject = createBufferObject();
    var temp = createBufferObject();
    writeVarInt(temp, packetID); // Packet ID
    prependData(dataDuplicate, temp.b);
    if (player.usePacketCompression) {
      if (data.b.length >= 500) {
        temp = createBufferObject(); // Buffer containing uncompressed packet length
        writeVarInt(temp, dataDuplicate.b.length); // Uncompressed packet length
        dataDuplicate.b = zlib.deflateSync(dataDuplicate.b); // Compress packet
        prependData(dataDuplicate, temp.b); // Put uncompressed packet length before packet data
        writeVarInt(bufferObject, dataDuplicate.b.length); // Write length of uncompressed packet length + compressed data and packet ID length 
        appendData(bufferObject, dataDuplicate.b); // Put that length before anything else
      } else {
        temp = createBufferObject(); // Buffer containing uncompressed packet length
        writeVarInt(temp, 0); // Uncompressed packet length (Zero since uncompressed)
        prependData(dataDuplicate, temp.b); // Put uncompressed packet length before packet data
        writeVarInt(bufferObject, dataDuplicate.b.length); // Write length of uncompressed packet length + compressed data and packet ID length 
        appendData(bufferObject, dataDuplicate.b); // Put that length before anything else
      }
    } else {
      writeVarInt(bufferObject, dataDuplicate.b.length); // Length
      appendData(bufferObject, dataDuplicate.b);
    }

    if (player.useEncryption) {
      player.cipher.write(bufferObject.b);
    } else {
      player.tcpSocket.write(bufferObject.b);
    }
    const clientName = player.username || player.tcpSocket.remoteAddress.substr(7);
    if (!(['ChunkData', 'ChatMessage', 'KeepAlive', 'Animation', "EntityLook", "EntityRelativeMove", "PlayerInfo",
      "EntityLookAndRelativeMove", "EntityHeadLook", "EntityMetadata"].includes(name)))
      console.log(clientName + "                ".substr(0, 16 - clientName.length), "~~ S->C ~~ " + state + " ~ " + name + (player.usePacketCompression && data.b.length >= 500 ? " ~~ Compressed: Saved " + (data.b.length - bufferObject.b.length) + " bytes" : " ~~ Not Compressed"));
  } catch (e) {
    console.error(e.stack);
  }
}

/**
 * Creates a buffer object to create packets
 * 
 * @return {{b: Buffer}}
 * The buffer object
 */
export function createBufferObject() {
  return { b: Buffer.from([]) };
}

/**
 * Weird java thing
 * 
 * @param {Buffer} buffer 
 */
export function performTwosCompliment(buffer) {
  var carry = true;
  var i, newByte, value;
  for (i = buffer.length - 1; i >= 0; --i) {
    value = buffer.readUInt8(i);
    newByte = ~value & 0xff;
    if (carry) {
      carry = newByte === 0xff;
      buffer.writeUInt8(carry ? 0 : (newByte + 1), i);
    } else {
      buffer.writeUInt8(newByte, i);
    }
  }
}

/**
 * Another weird java thing that minecraft uses
 * 
 * @param {Buffer} hash 
 */
export function minecraftHexDigest(hash) { //TODO: Clean-up
  var negative = hash.readInt8(0) < 0;
  if (negative) performTwosCompliment(hash);
  var digest = hash.toString('hex');
  digest = digest.replace(/^0+/g, '');
  if (negative) digest = '-' + digest;
  return digest;
}

export function itemProtocolIdToItemId(version, protocolId) {
  const items = require(`./generated_data/${version}/reports/registries.json`)["minecraft:item"].entries;
  //console.log(items);
  for (const name of Object.keys(items)) {
    const id = items[name].protocol_id;
    if (id == protocolId) return name;
  }

  return null
}

export function blockIdToStateId(version, id, properties) {
  id = id.toLowerCase();
  const blocks = require(`./generated_data/${version}/reports/blocks.json`);

  const block = blocks[id];

  if(!block)
    return 0;

  // Block has no properties
  if (!block.properties) {
    return block.states[0].id;

  // Block has properties, but none were provided
  } else if (!properties || Object.keys(properties) === 0) {
    for (const state of block.states)
      if (state.default)
        return state.id;

  // Check properties given with all states until match is found
  } else {
    // Validate properties
    for (const prop of Object.keys(block.properties))
      if (properties[prop]) {
        properties[prop] = properties[prop].toLowerCase()
        if (!block.properties[prop].includes(properties[prop]))
          throw new Error(`Invalid property value ${properties[prop]} for ${prop} on block ${id}`);
      } else {
          throw new Error(`Missing property ${prop} on block ${id}`);
      }


    states:
    for (const state of block.states) {
      for (const prop of Object.keys(block.properties)) {
        if (block.properties[prop] !== properties[prop]) {
            break states;
        }
      }
      return state;
    }

    throw new Error(`Unknown state for given properties of ${id}`);
  }
}

export function stateIdToBlockId(version, stateId) {
    const blocks = require(`./generated_data/${version}/reports/blocks.json`);

    for(let id of Object.keys(blocks)) {
        const block = blocks[id];
        for(let state of block.states) {
            if (state.id === stateId) {
                return {
                    id,
                    properties: state.properties
                };
            }
        }
    }

    return null;
}
