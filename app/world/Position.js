export default class Position {
  
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */
  constructor(x, y, z) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
  }

  /**
   * Add to position. To subtract, just add `-` before each parameter
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */
  add(x, y, z) {
    this.x += x;
    this.y += y;
    this.z += z;
  }

  /**
   * Add a position to this position.
   * 
   * @param {Position} location
   */
  addPosition(position) {
    this.x += position.x;
    this.y += position.y;
    this.z += position.z;
  }

  /**
   * Subtract a position from this position
   * 
   * @param {Position} position
   */
  aubPosition(position) {
    this.x -= position.x;
    this.y -= position.y;
    this.z -= position.z;
  }
}