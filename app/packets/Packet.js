var utils = require('../utils.js');

class Packet {
  constructor(packetId, def) {
    this.packetId = packetId;
    this.def = def;
    this.args = null;
  }

  readPlayer(player) {
    this.args = utils.readParameters(packet.parameters, player);
  }

  create(...args) {
    this.args = args;
  }

  toBuffer() {
    const buffer = utils.createBufferObject();

    utils.writeParameters(this.def, buffer, ...this.args);

    return buffer;
  }
}


module.exports = Packet;