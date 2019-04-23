
'use strict'

var net = require('net');
var Player = require('./player');
var crypto = require('crypto');
var https = require('https');


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
    var data = player.TCPSocket.read(player.TCPSocket.readableLength);
    data = Buffer.from(data);
    player.InternalBuffer = data;
    if(player.UseEncryption) {
        var decipher = crypto.createDecipheriv("aes-128-cfb8", player.SharedSecret, player.SharedSecret);
        decipher.update(data);
        data = decipher.final();
    }
    if(!player.InternalBuffer) console.log("Internal Buffer was null");
    player.InternalIndex = 0;
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
    if(player.InternalIndex > player.InternalBuffer.length) {
        console.log("Out of bounds error reading internal buffer: " + player.InternalIndex + " > " + player.InternalBuffer.length);
    }
    var data = player.InternalBuffer.slice(player.InternalIndex, bytes + player.InternalIndex);
    player.InternalIndex += bytes;
    return data;
}

/**
 * Reads a VarLong from the network stream
 * 
 * @param {Player} player
 * Player to read from
 * @return {number} value
 * Value of the VarLong that has been read
 */
export function readUShort(player) {
    var buffer = readBytes(player, 2);
    return buffer.readUIntBE(0, 2);
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
 */
export function writeByteArray(bytes, bufferObject) {
    writeVarInt(bytes.length, bufferObject);
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
 * @@param {Object} buffer 
 * The object containing the buffer to write to
 */
export function writeInt(value, buffer) {
    var temp = Buffer.alloc(4);
    temp.writeInt32BE(value, 0);
    appendData(buffer, temp);
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
 */
export function writePacket(packetID, data, player) {
    var bufferObject = createBufferObject();
    var temp = createBufferObject();
    writeVarInt(packetID, temp); // Packet ID
    prependData(data, temp.b);
    writeVarInt(data.b.length, bufferObject); // Length
    appendData(bufferObject, data.b);
    if(player.UseEncryption) {
        player.Cipher.write(bufferObject.b);
    } else {
        player.TCPSocket.write(bufferObject.b);
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
