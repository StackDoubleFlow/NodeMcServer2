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


// export function readNBTFromPlayer(player) {
//   var nbtStructure = {};
//   /**
//    * @type {Array<string>}
//    */
//   var currentCompound = [];
//   var nbtBackup = [];
//   var inArray = false;
//   var arrayIndex = 0;
//   var currentArrayType = 0;
//   var currentArrayLength = 0;
//   var currentArrayName = "";

//   /**
//    * @param {string} name 
//    * @param {any} value 
//    */
//   function setValue(name, value) {
//     //console.log(currentCompound.join(".") + "." + name);
//     var fullPath = "";
//     currentCompound.forEach(child => {
//       fullPath += `["${child}"]`;
//       if (eval("nbtStructure" + fullPath) == undefined) eval("nbtStructure" + fullPath + " = {};");
//     });
//     fullPath += `["${name}"]`;
//     if (typeof value == "object") {
//       value = JSON.stringify(value);
//     }
//     var command = "nbtStructure" + fullPath + " = " + value + ";";
//     eval(command);
//   }

//   function endArray() {
//     var name = currentArrayName;
//     currentArrayName = nbtBackup.pop();
//     var length = currentArrayLength;
//     arrayIndex = nbtBackup.pop();
//     currentCompound = nbtBackup.pop();
//     currentArrayLength = nbtBackup.pop();
//     currentArrayType = nbtBackup.pop();
//     inArray = nbtBackup.pop();
//     var generatedStructure = nbtStructure;
//     nbtStructure = nbtBackup.pop();
//     var array = [];
//     for (var i = 0; i < length; i++) {
//       array.push(generatedStructure[i]);
//     }
//     setValue(name, array);
//   }

//   function readNext() {
//     if (inArray && currentArrayLength == arrayIndex) endArray();
//     var typeID;
//     var nameLength;
//     var name;
//     if (inArray) {
//       typeID = currentArrayType;
//       currentCompound.unshift(arrayIndex);
//       name = currentCompound.pop();
//       if (currentCompound.length == 0) arrayIndex++;
//       if (typeID == 10 && currentCompound.length > 0) {
//         typeID = utils.readBytes(player, 1).readInt8();
//         if (typeID == 0) {
//           currentCompound.pop();
//           return;
//         };
//         nameLength = utils.readBytes(player, 2).readUInt16BE(0);
//         name = utils.readBytes(player, nameLength).toString('utf-8');
//       }
//     } else {
//       typeID = utils.readBytes(player, 1).readInt8();
//       if (typeID == 0) {
//         currentCompound.pop();
//         return;
//       };
//       nameLength = utils.readBytes(player, 2).readUInt16BE(0);
//       name = utils.readBytes(player, nameLength).toString('utf-8');
//     }

//     var types = {
//       0: () => {
//         currentCompound.pop();
//       },
//       1: () => {
//         var data = utils.readBytes(player, 1);
//         return setValue(name, data.readInt8(0));
//       },
//       2: () => {
//         var data = utils.readBytes(player, 2);
//         return setValue(name, data.readInt16BE(0));
//       },
//       3: () => {
//         var data = utils.readBytes(player, 4);
//         return setValue(name, data.readInt32BE(0));
//       },
//       4: () => {
//         var data = utils.readBytes(player, 8);
//         var low = data.readInt32BE(4);
//         var n = data.readInt32BE() * 4294967296.0 + low;
//         if (low < 0) n += 4294967296;
//         return setValue(name, n);
//       },
//       5: () => {
//         var data = utils.readBytes(player, 4);
//         return setValue(name, data.readFloatBE());
//       },
//       6: () => {
//         var data = utils.readBytes(player, 8);
//         return setValue(name, data.readDoubleBE());
//       },
//       8: () => {
//         var length = utils.readBytes(player, 2).readUInt16BE();
//         var string = utils.readBytes(player, length).toString('utf-8');
//         return setValue(name, `"${string}"`);
//       },
//       9: () => {
//         var listType = utils.readBytes(player, 1).readInt8();
//         var length = utils.readBytes(player, 4).readInt32BE();
//         nbtBackup.push(nbtStructure);
//         nbtStructure = {};
//         nbtBackup.push(inArray);
//         nbtBackup.push(currentArrayType);
//         nbtBackup.push(currentArrayLength);
//         nbtBackup.push(currentCompound);
//         nbtBackup.push(arrayIndex);
//         nbtBackup.push(currentArrayName);
//         inArray = true;
//         arrayIndex = listType == 10 ? -1 : 0;
//         currentArrayType = listType;
//         currentArrayLength = length;
//         currentArrayName = name;
//         currentCompound = [];
//       },
//       10: () => {
//         if (name !== "") currentCompound.push(name);
//       }
//     }
//     types[typeID]();
//   }
//   readNext();

//   return nbtStructure;
// }
