const World = require('./World.js');
const Position = require('./Position.js');

class Location extends Position {
  
  /**
   * @param {World} world
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @param {number} [yaw]
   * @param {number} [pitch]
   */
  constructor(world, x, y, z, yaw, pitch) {
    super(x, y, z)
    this.world = world;
    this.yaw = yaw;
    this.pitch = pitch;
  }

  /**
   * Add to location. To subtract, just add `-` before each parameter
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @param {number} [yaw]
   * @param {number} [pitch]
   */
  add(x, y, z, yaw = 0, pitch = 0) {
    this.x += x;
    this.y += y;
    this.z += z;
    this.yaw += yaw;
    this.pitch += pitch;
  }

  /**
   * Add a location to this location.
   * 
   * @param {Location} location
   */
  addPosition(location) {
    this.x += location.x;
    this.y += location.y;
    this.z += location.z;
    this.yaw += location.yaw;
    this.pitch += location.pitch;
  }

  /**
   * Subtract a location from this location
   * 
   * @param {Location} location
   */
  subLocation(location) {
    this.x -= location.x;
    this.y -= location.y;
    this.z -= location.z;
    this.yaw -= location.yaw;
    this.pitch -= location.pitch;
  }
}

module.exports = Location;