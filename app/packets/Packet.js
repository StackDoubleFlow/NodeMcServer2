const utils = require('../utils.js');

export default class Packet {
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