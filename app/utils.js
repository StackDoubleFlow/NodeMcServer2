
'use strict'

var net = require('net');
var Player = require('./player');
var crypto = require('crypto');
var https = require('https');
var Position = require('./world/Position.js');

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
    })     .on('error', e => reject(e));
});

/**
 * Resets the internal buffer of the player using the data from the player
 * 
 * @param {Player} player 
 * Player to read from
 */
export function resetInternalBuffer(player) {
    player.internalBuffer = player.tcpSocket.read();
    if(!player.internalBuffer) console.log("Internal Buffer was null");
    player.internalIndex = 0;
}

/**
 * Resets the internal buffer of the player using the data from the player's decipher
 * 
 * @param {Player} player 
 * Player to read from
 */
export function resetInternalBufferUsingDecipher(player) {
    player.internalBuffer = player.decipher.read();
    if(!player.internalBuffer) console.log("Internal Buffer was null");
    player.internalIndex = 0;
}

/**
 * Reads a byte from the network stream
 * 
 * @param {Player} player
 * Player to read from
 * @param {number} bytes
 * Number of bytes to read
 * @return {Buffer} data
 * Data that has been read
 */
export function readBytes(player, bytes) {
    if(player.internalIndex-1 > player.internalBuffer.length) {
        console.log("Out of bounds error reading internal buffer: ", player.internalIndex, " > ", player.internalBuffer.length-1);
    }
    var data = player.internalBuffer.slice(player.internalIndex, bytes + player.internalIndex);
    player.internalIndex += bytes;
    return data;
}

/**
 * Reads a Unsigned Short from the network stream
 * 
 * @param {Player} player
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
 * @param {Player} player
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
 * @param {Player} player
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
 * @param {Player} player
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
 * @param {Player} player 
 * Player to read from
 * @return {Position}
 */
export function readPosition(player) {
    var data = readBytes(player, 8);
    console.log(data.toString('hex'));
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
 * @param {Player} bufferObject
 */
export function writePosition(pos, bufferObject) {
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
 * @param {Player} player 
 * Player to read from
 * @param {number} n 
 * Maximum string length
 */
export function readString(player, n) {
    var length = readVarInt(player);
    if(n > 32767) {
        console.log("n was greater than 32767 while reading string!");
    }
    return readBytes(player, length).toString("utf-8");
}

/**
 * Reads a VarInt from the network stream
 * 
 * @param {Player} player
 * Player to read from
 * @return {number} value
 * Value of the VarInt that has been read
 */
export function readVarInt(player) {
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
    return result;
}

/**
 * Reads a VarLong from the network stream
 * 
 * @param {Player} player
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
 * @param {Player} player
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
export function writeByte(byte, bufferObject) {
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
export function writeByteArray(bytes, bufferObject, writeLength) {
    if(writeLength) writeVarInt(bytes.length, bufferObject);
    appendData(bufferObject, Buffer.from(bytes));
}

/**
 * Reads a byte array from the network stream
 * 
 * @param {Player} player
 * Player to read from
 * @return {Array<number>} bytes
 * Bytes of byte array that has been read
 */
export function readByteArray(player) {
    var out = new Array();
    var length = readVarInt(player);
    for(var i = 0; i < length; i++) {
        out.push(readBytes(player, 1).readUInt8());
    }
    return out;
}


/**
 * Writes a string to a buffer
 * 
 * @param {string} string 
 * String to write to the network stream
 * @param {number} n 
 * Maximum string length
 * @param {Object} bufferObject 
 * The object containing the buffer to write to
 */
export function writeString(string, n, bufferObject) {
    var out = Buffer.from(string, 'utf-8');
    if(string.length > n || out.length > n*4) {
        console.error("Error writing string to network stream: ", string.length, n);
    }
    writeVarInt(string.length, bufferObject);
    appendData(bufferObject, out);
}

/**
 * Writes a float to the buffer object
 * 
 * @param {number} value 
 * @param {Object} bufferObject 
 */
export function writeFloat(value, bufferObject) {
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
export function writeDouble(value, bufferObject) {
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
export function writeJson(json, m, bufferObject) {
    writeString(JSON.stringify(json), m, bufferObject);
}

/**
 * Writes a Long to the network stream
 * 
 * @param {number} value
 * Value to write to the network stream
 * @param {Object} bufferObject 
 * The object containing the buffer to write to
 */
export function writeLong(value, bufferObject) {
    const b = Buffer.alloc(8);
    const MAX_UINT32 = 0xFFFFFFFF;
    const big = ~~(value / MAX_UINT32);
    const low = (value % MAX_UINT32) - big;
    b.writeUInt32BE(big, 0);
    b.writeUInt32BE(low, 4) ;
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
export function writeVarInt(value, bufferObject) {
    do {
        var temp = value & 0b01111111;
        // Note: >>> means that the sign bit is shifted with the rest of the number rather than being left alone
        value >>>= 7;
        if (value != 0) {
            temp |= 0b10000000;
        }
        writeByte(temp, bufferObject);
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
export function writeVarLong(value, bufferObject) {
    do {
        var temp = value & 0b01111111;
        // Note: >>> means that the sign bit is shifted with the rest of the number rather than being left alone
        value >>>= 7;
        if (value != 0) {
            temp |= 0b10000000;
        }
        writeByte(temp, bufferObject);
    } while (value != 0);
}

/**
 * Writes a Int to the network stream
 * 
 * @param {number} value
 * Value to write to the network stream
 * @param {Object} buffer 
 * The object containing the buffer to write to
 */
export function writeInt(value, buffer) {
    var temp = Buffer.alloc(4);
    temp.writeInt32BE(value, 0);
    appendData(buffer, temp);
}

/**
 * Writes an unsigned short to the network stream
 * 
 * @param {number} value 
 * @param {Object} bufferObject 
 */
export function writeUShort(value, bufferObject) {
    var temp = Buffer.alloc(2);
    temp.writeUInt16BE(value);
    appendData(bufferObject, temp);
}

/**
 * Writes a UUID to the network stream
 * 
 * @param {Player} player
 * The player containing the UUID
 * @param {Object} bufferObject
 * the object containing the buffer to write to
 */
export function writeUUID(player, bufferObject) {
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
export function writeNbt(value, bufferObject) {
    
}

export function writeNBitLong(n, value, bufferObject) {
    if (n % 8 !== 0) throw new Error("no");
    
    var longs = [];
    var longLow = 0;
    var longHigh = 0;
    for(var i = 0; i < 1; i++) {
        var longOffset = (i * 9) % 64;
        if(longOffset < 64 && longOffset + n - 1 >= 64) {
            longHigh |= (value << longOffset) & 0xFFFFFF;
            var temp = Buffer.alloc(8);
            temp.writeInt32BE(longHigh);
            temp.writeInt32BE(longLow, 4);
            longs.push(temp);
            longLow = longHigh = 0;
            longLow |= value >> (64 - longOffset);
        } else if(longOffset < 32 && longOffset + n - 1 >= 32) {
            longLow |= (value << longOffset) & 0xFFFFFF;
            longHigh |= value >> (32 - longOffset - 1);
        } else if(longOffset < 32) {
            longLow |= value << longOffset;
        } else {
            longHigh |= value << longOffset;
        }
        if(64 - longOffset == 9) {
            var temp = Buffer.alloc(8);
            temp.writeInt32BE(longHigh);
            temp.writeInt32BE(longLow, 4);
            longs.push(temp);
            longLow = longHigh = 0;
        }
    }

    writeByteArray(longs, bufferObject);
}

export function writeHeightmap(bufferObject) {
    function writeStr(name) {
        var out = Buffer.from(name, 'utf-8');
        writeUShort(name.length, bufferObject);
        appendData(bufferObject, out);
    }
    
    var longs = [];
    var longLow = 0;
    var longHigh = 0;
    for(var i = 0; i < 256; i++) {
        // Testing maxHeight
        var maxHeight = 256;
        var longOffset = (i * 9) % 64;
        if(longOffset < 64 && longOffset + 9 - 1 >= 64) {
            longHigh |= (maxHeight << longOffset) & 0xFFFFFF;
            var temp = Buffer.alloc(8);
            temp.writeInt32BE(longHigh);
            temp.writeInt32BE(longLow, 4);
            longs.push(temp);
            longLow = longHigh = 0;
            longLow |= maxHeight >> (64 - longOffset);
        } else if(longOffset < 32 && longOffset + 9 - 1 >= 32) {
            longLow |= (maxHeight << longOffset) & 0xFFFFFF;
            longHigh |= maxHeight >> (32 - longOffset - 1);
        } else if(longOffset < 32) {
            longLow |= maxHeight << longOffset;
        } else {
            longHigh |= maxHeight << longOffset;
        }
        if(64 - longOffset == 9) {
            var temp = Buffer.alloc(8);
            temp.writeInt32BE(longHigh);
            temp.writeInt32BE(longLow, 4);
            longs.push(temp);
            longLow = longHigh = 0;
        }
    }


    // Compound
    writeByte(0x0A, bufferObject); // Type ID (Compound)
    writeStr("Hightmap"); // Name

    // Long array
    writeByte(0x0C, bufferObject); // Type ID (TAG_Long_Array)
    writeStr("MOTION_BLOCKING"); // Name
    writeInt(longs.length, bufferObject); // Length
    writeByteArray(Buffer.concat(longs), bufferObject, false); // Write the long boi
    
    writeByte(0x00, bufferObject); // End Compound
} 

/**
 * Writes a packet to the network stream
 * 
 * @param {number} packetID 
 * The ID of the packet to write in the header
 * @param {Object} data 
 * The data of the packet
 * @param {Player} player
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
        writeVarInt(packetID, temp); // Packet ID
        prependData(dataDuplicate, temp.b);
        writeVarInt(dataDuplicate.b.length, bufferObject); // Length
        appendData(bufferObject, dataDuplicate.b);
        if(player.useEncryption) {
            player.cipher.write(bufferObject.b);
        } else {
            player.tcpSocket.write(bufferObject.b);
        }
        const clientName = player.username || player.tcpSocket.remoteAddress.substr(7);
        if (!(['ChunkData', 'ChatMessage', 'KeepAlive'].includes(name)))
            console.log(clientName + "                ".substr(0, 16-clientName.length), "~~ S->C ~~ " + state + " ~ " + name);
    } catch(e) {
        console.error(e.stack);
    }
}

/**
 * Creates a buffer object to create packets
 * 
 * @return {Object}
 * The buffer object
 */
export function createBufferObject() {
    return {b: Buffer.from([])};
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

//TODO: Packet Compression

/**
 * Writes a compressed packet to the network stream (Including the packet header)
 * 
 * @param {number} packetID
 * @param {Buffer} data
 */
export function writeCompressedPacket(packetID, data) {

}

