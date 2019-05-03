import Player from "./Player";

var net = require('net');
var crypto = require('crypto');
var https = require('https');
var Position = require('./world/Position.js');
var zlib = require('zlib');

export const types = {
    read: {
        boolean: readBoolean,
        double: readDouble,
        float: readFloat,
        long: readLong,
        position: readPosition,
        string: readString,
        ushort: readUShort,
        varint: readVarInt,
        varlong: readVarLong,
        null: () => {}
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
    })     .on('error', e => reject(e));
});

/**
 * Used for compression
 * 
 * @param {number} length 
 * @param {Player} player
 */
export function inflate(length, player) {
    var data = player.internalBuffer.slice(player.internalIndex, player.internalIndex+length);
    var inflatedData = zlib.inflateSync(data);
    var dataToBeRead = player.internalBuffer.slice(player.internalIndex+length, player.internalBuffer.length-1);
    player.internalBuffer = Buffer.concat([inflatedData, dataToBeRead]);
    player.internalIndex = 0;
}

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
    if(player.internalIndex > player.internalBuffer.length) {
        console.log("Out of bounds error reading internal buffer: ", player.internalIndex, " > ", player.internalBuffer.length-1);
    }
    var data = player.internalBuffer.slice(player.internalIndex, bytes + player.internalIndex);
    player.internalIndex += bytes;
    return data;
}

export function readType(type, player, ...args) {
    return types.read[type](player, ...args);
}

/**
 * @param {string} param
 * @param {Player} player
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
    
        for(let i = 0; i < length; i++) {
            if(arg.parameters) {
                const v = {};
                for(let a of arg.parameters) {
                    v[a.name] = readParameter(a, player);
                }
                value.push(v);
            } else {
                let v = readType(type, player, arg.max);
                if(arg.values && v in arg.values)
                    v = arg.values[v];
                value.push(v);
            }
        }

        return value;
    } else {
        let value = readType(type, player, arg.max);
        if(arg.values && value in arg.values)
            value = arg.values[value];
        return value;
    }
}

/**
 * @param {object<string, *>} params
 * @param {Player} player
 * Player to read from
 * @return {Array} arguments
 */
export function readParameters(params, player) {
    const args = [];
    for(let arg of params) {
        args.push(readParameter(arg, player));
    }
    return args
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
 * @param {boolean} returnLength
 * @return {number} value
 * Value of the VarInt that has been read
 */
export function readVarInt(player, returnLength=false) {
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
    if(returnLength) {
        return { val: result, len: numRead };
    } else {
        return result;
    }
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
 * Writes an angle to the buffer
 * 
 * @param {number} degrees 
 * The amount of degrees to write to the buffer
 * @param {Object} bufferObject 
 * The object containing the buffer to write to
 */
export function writeAngle(degrees, bufferObject) {
    if(degrees > 360 || degrees < -360) {
        var negative = degrees < 0 ? true : false;
        degrees = Math.abs(degrees);
        var multiplier = Math.floor(degrees / 360);
        degrees -= 360 * multiplier;
        if(negative) degrees = -degrees;
    }
    var angle = Math.floor((degrees / 360) * 256);
    writeByte(angle, bufferObject);
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
 * Writes a short to the network stream
 * 
 * @param {number} value 
 * @param {Object} bufferObject 
 */
export function writeShort(value, bufferObject) {
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
        if(player.usePacketCompression) {
            if(data.b.length >= 500) {
                temp = createBufferObject(); // Buffer containing uncompressed packet length
                writeVarInt(dataDuplicate.b.length, temp); // Uncompressed packet length
                dataDuplicate.b = zlib.deflateSync(dataDuplicate.b); // Compress packet
                prependData(dataDuplicate, temp.b); // Put uncompressed packet length before packet data
                writeVarInt(dataDuplicate.b.length, bufferObject); // Write length of uncompressed packet length + compressed data and packet ID length 
                appendData(bufferObject, dataDuplicate.b); // Put that length because anything else
            } else {
                temp = createBufferObject(); // Buffer containing uncompressed packet length
                writeVarInt(0, temp); // Uncompressed packet length (Zero since uncompressed)
                prependData(dataDuplicate, temp.b); // Put uncompressed packet length before packet data
                writeVarInt(dataDuplicate.b.length, bufferObject); // Write length of uncompressed packet length + compressed data and packet ID length 
                appendData(bufferObject, dataDuplicate.b); // Put that length because anything else
            }
        } else {
            writeVarInt(dataDuplicate.b.length, bufferObject); // Length
            appendData(bufferObject, dataDuplicate.b);
        }
        
        if(player.useEncryption) {
            player.cipher.write(bufferObject.b);
        } else {
            player.tcpSocket.write(bufferObject.b);
        }
        const clientName = player.username || player.tcpSocket.remoteAddress.substr(7);
        if (!(['ChunkData', 'ChatMessage', 'KeepAlive', 'Animation', "EntityLook", "EntityRelativeMove", "PlayerInfo"].includes(name)))
            console.log(clientName + "                ".substr(0, 16-clientName.length), "~~ S->C ~~ " + state + " ~ " + name + (player.usePacketCompression && data.b.length >= 500 ? " ~~ Compressed: Saved " + (data.b.length - bufferObject.b.length) + " bytes" : " ~~ Not Compressed"));
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

/**
 * Reads NBT data and puts it into an object
 * 
 * @param {Buffer} data 
 * @return {Object} nbtStructure
 */
export function readNBT(data) {
    var nbtStructure = {};
    var readIndex = 0;
    /**
     * @type {Array<string>}
     */
    var currentCompound = [];
    var nbtBackup = [];
    var inArray = false;
    var arrayIndex = 0;
    var currentArrayType = 0;
    var currentArrayLength = 0;
    var currentArrayName = "";

    /**
     * @param {number} bytes 
     * @return {Buffer} data;
     */
    function readBytes(bytes) {
        var readData = data.slice(readIndex, readIndex + bytes);
        readIndex += bytes;
        return readData;
    }

    /**
     * @param {string} name 
     * @param {any} value 
     */
    function setValue(name, value) {
        //console.log(currentCompound.join(".") + "." + name);
        var fullPath = "";
        currentCompound.forEach(child => {
            fullPath += `["${child}"]`;
            if(eval("nbtStructure" + fullPath) == undefined) eval("nbtStructure" + fullPath + " = {};");
        });
        fullPath += `["${name}"]`;
        if(typeof value == "object") {
            value = JSON.stringify(value);
        }
        var command = "nbtStructure" + fullPath + " = " + value + ";";
        eval(command);
    }

    function endArray() {
        var name = currentArrayName;
        currentArrayName = nbtBackup.pop();
        var length = currentArrayLength;
        arrayIndex = nbtBackup.pop();
        currentCompound = nbtBackup.pop();
        currentArrayLength = nbtBackup.pop();
        currentArrayType = nbtBackup.pop();
        inArray = nbtBackup.pop();
        var generatedStructure = nbtStructure;
        nbtStructure = nbtBackup.pop();
        var array = [];
        for(var i = 0; i < length; i++) {
            array.push(generatedStructure[i]);
        }
        setValue(name, array);
    }

    function readNext() {
        if(inArray && currentArrayLength == arrayIndex) endArray();
        var typeID;
        var nameLength;
        var name;
        if(inArray) {
            typeID = currentArrayType;
            currentCompound.unshift(arrayIndex);
            name = currentCompound.pop();
            if(currentCompound.length == 0) arrayIndex++;
            if(typeID == 10 && currentCompound.length > 0) {
                typeID = readBytes(1).readInt8();
                if(typeID == 0) {
                    currentCompound.pop();
                    return;
                };
                nameLength = readBytes(2).readUInt16BE(0);
                name = readBytes(nameLength).toString('utf-8');
            }
        } else {
            typeID = readBytes(1).readInt8();
            if(typeID == 0) {
                currentCompound.pop();
                return;
            };
            nameLength = readBytes(2).readUInt16BE(0);
            name = readBytes(nameLength).toString('utf-8');
        }
        
        var types = {
            0: () => {
                currentCompound.pop();
            },
            1: () => {
                var data = readBytes(1);
                return setValue(name, data.readInt8(0));
            },
            2: () => {
                var data = readBytes(2);
                return setValue(name, data.readInt16BE(0));
            },
            3: () => {
                var data = readBytes(4);
                return setValue(name, data.readInt32BE(0));
            },
            4: () => {
                var data = readBytes(8);
                var low = data.readInt32BE(4);
                var n = data.readInt32BE() * 4294967296.0 + low;
                if (low < 0) n += 4294967296;
                return setValue(name, n);
            },
            5: () => {
                var data = readBytes(4);
                return setValue(name, data.readFloatBE());
            },
            6: () => {
                var data = readBytes(8);
                return setValue(name, data.readDoubleBE());
            },
            8: () => {
                var length = readBytes(2).readUInt16BE();
                var string = readBytes(length).toString('utf-8');
                return setValue(name, `"${string}"`);
            },
            9: () => {
                var listType = readBytes(1).readInt8();
                var length = readBytes(4).readInt32BE();
                nbtBackup.push(nbtStructure);
                nbtStructure = {};
                nbtBackup.push(inArray);
                nbtBackup.push(currentArrayType);
                nbtBackup.push(currentArrayLength);
                nbtBackup.push(currentCompound);
                nbtBackup.push(arrayIndex);
                nbtBackup.push(currentArrayName);
                inArray = true;
                arrayIndex = listType == 10 ? -1 : 0;
                currentArrayType = listType;
                currentArrayLength = length;
                currentArrayName = name;
                currentCompound = [];
            },
            10: () => {
                if(name !== "") currentCompound.push(name);
            }
        }
        types[typeID]();
    }
    while(readIndex < data.length) {
        readNext();
    }

    return nbtStructure;
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

