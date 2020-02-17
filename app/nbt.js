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
    this.buffer = Buffer.alloc();
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