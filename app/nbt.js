import * as utils from "./utils";

class NBTReader {
  constructor(buffer) {
    this.buffer = buffer;
    this.i = 0;

    this.readers = {
      0:  undefined,
      1:  this.readByte.bind(this),
      2:  this.readShort.bind(this),
      3:  this.readInt.bind(this),
      4:  this.readLong.bind(this),
      5:  this.readFloat.bind(this),
      6:  this.readDouble.bind(this),
      7:  this.readByteArray.bind(this),
      8:  this.readString.bind(this),
      9:  this.readList.bind(this),
      10: this.readCompound.bind(this),
      11: this.readIntArray.bind(this),
      12: this.readLongArray.bind(this)
    };
  }

  read() {
    return this.readCompound();
  }

  getReaderFromTypeID(typeID) {
    return this.readers[typeID];
  }

  readByte() {
    return this.buffer[this.i++];
  }

  readShort() {
    const val = this.buffer.readInt16BE(this.i);
    this.i += 2;
    return val;
  }

  readInt() {
    const val = this.buffer.readInt32BE(this.i);
    this.i += 4;
    return val;
  }

  readLong() {
    const val = this.buffer.readBigInt64BE(this.i);
    this.i += 8;
    return val;
  }

  readFloat() {
    const val = this.buffer.readFloatBE(this.i);
    this.i += 4;
    return val;
  }

  readDouble() {
    const val = this.buffer.readDoubleBE(this.i);
    this.i += 8;
    return val;
  }

  readByteArray() {
    const size = this.readInt();
    const array = [];
    for (let i = 0; i < size; i++) {
      array.push(this.readByte());
    }
    return array;
  }

  readString() {
    const length = this.readShort();
    const val = this.buffer.slice(this.i, this.i + length).toString();
    this.i += length;
    return val;
  }

  readName() {
    const length = this.readShort();
    const val = this.buffer.slice(this.i, this.i + length).toString();
    this.i += length;
    return val;
  }

  readList() {
    const typeID = this.readByte();
    const reader = this.getReaderFromTypeID(typeID);
    const length = this.readInt();
    const array = [];
    for (let i = 0; i < length; i++) {
      array.push(reader());
    }
    return array;
  }
  
  readCompound() {
    const compound = {};
    while (true) {
      const typeID = this.readByte();
      if (typeID > 12) {
        throw new Error("During NBT read, typeID was " + typeID + " which is invalid.");
      }
      const reader = this.getReaderFromTypeID(typeID);
      if (!reader) return compound;
      const name = this.readName();
      const val = reader();
      //console.log(name, val);
      compound[name] = val;
    }
  }

  readIntArray() {
    const size = this.readInt();
    const array = [];
    for (let i = 0; i < size; i++) {
      array.push(this.readInt());
    }
    return array;
  }

  readLongArray() {
    const size = this.readInt();
    const array = [];
    for (let i = 0; i < size; i++) {
      array.push(this.readLong());
    }
    return array;
  }

}

class NBTWriter {
  constructor(data) {
    this.data = data;
    this.buffer = Buffer.alloc(0);
    this.types = {
      byte: {
        id: 1,
        writer: this.writeByte.bind(this)
      },
      short: {
        id: 2,
        writer: this.writeShort.bind(this)
      },
      int: {
        id: 3,
        writer: this.writeInt.bind(this)
      },
      long: {
        id: 4,
        writer: this.writeLong.bind(this)
      },
      float: {
        id: 5,
        writer: this.writeFloat.bind(this)
      },
      double: {
        id: 6,
        writer: this.writeDouble.bind(this)
      },
      byteArray: {
        id: 7,
        writer: this.writeByteArray.bind(this)
      },
      string: {
        id: 8,
        writer: this.writeString.bind(this)
      },
      list: {
        id: 9,
        writer: this.writeList.bind(this)
      },
      compound: {
        id: 10,
        writer: this.writeCompound.bind(this)
      },
      intArray: {
        id: 11,
        writer: this.writeIntArray.bind(this)
      },
      longArray: {
        id: 12,
        writer: this.writeLongArray.bind(this)
      },
    }
  }

  write() {
    this.writeCompound(this.data);
    return this.buffer;
  }

  writeBytes(data) {
    this.buffer = Buffer.concat([this.buffer, Buffer.from(data)]);;
  }

  writeByte(byte) {
    this.writeBytes(Buffer.from([byte]));
  }

  writeEnd() {
    this.writeByte(0);
  }

  writeByte(val) {
    this.writeBytes([val]);
  }

  writeShort(val) {
    let temp = Buffer.alloc(2);
    temp.writeInt16BE(val);
    this.writeBytes(temp);
  }

  writeInt(val) {
    let temp = Buffer.alloc(4);
    temp.writeInt32BE(val);
    this.writeBytes(temp);
  }

  writeLong(val) {
    let temp = Buffer.alloc(8);
    temp.writeBigUInt64BE(val);
    this.writeBytes(temp);
  }

  writeFloat(val) {
    let temp = Buffer.alloc(4);
    temp.writeFloatBE(val);
    this.writeBytes(temp);
  }

  writeDouble(val) {
    let temp = Buffer.alloc(8);
    temp.writeDoubleBE(val);
    this.writeBytes(temp);
  }

  writeByteArray(val) {
    this.writeInt(val.length);
    this.writeBytes(Buffer.from(val));
  }

  writeString(val) {
    this.writeShort(val.length);
    this.writeBytes(Buffer.from(val, "utf8"));
  }

  writeList(list) {
    const type = list.type;
    const typeID = this.types[type].id;
    this.writeByte(typeID);
    this.writeInt(list.val.length);
    const writer = this.types[type].writer;
    for (const item in list.val) {
      writer(item);
    }
  }

  writeCompound(compound) {
    for (const name of Object.keys(compound)) {
      const type = compound[name].type;
      const val = compound[name].val;
      const typeID = this.types[type].id;
      const writer = this.types[type].writer;
      this.writeByte(typeID);
      this.writeString(name);
      writer(val);
      if (type == "compound") 
        this.writeEnd();
    }
  }
  
  writeIntArray(array) {
    this.writeInt(array.length);
    for (const item of array) {
      this.writeInt(item);
    }
  }

  writeLongArray(array) {
    this.writeInt(array.length);
    for (const item of array) {
      this.writeLong(item);
    }
  }
}

export function readNBT(data) {
  const reader = new NBTReader(data);
  return reader.read();
}

export function readNBTFromPlayer(player) {
  const data = player.internalBuffer.slice(player.internalIndex);
  const reader = new NBTReader(data);
  const nbt = reader.read();
  player.internalIndex += reader.i;
  return nbt;
}

export function writeNBT(data) {
  const writer = new NBTWriter(data);
  return writer.write();
}

export function writeNBTToPacket(bufferObject, data) {
  let buf = writeNBT(data);
  //console.log(buf.toString('hex'));
  //console.log(buf.toString('utf8'));
  utils.appendData(bufferObject, buf);
}