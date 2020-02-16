import Location from "../world/Location";

export default class Entity {
  constructor(server, entityId, type, location) {
    this.server = server;
    this.id = entityId;
    this.type = type;

    this.location = location || new Location(server.world, 0, 0, 0, 0, 0);
    this.velocity = [0, 0, 0];

    this.scoreboardTags = {};

    this.nbt;
  }

  // Naturally Dynamic
  // These change naturally through normal gameplay
  get fallDistance() { return 0; }
  get fireTicks() { return 0; }
  get lastDamageCause() { return null; }
  get passengers() { return []; }
  get portalCooldown() { return 0; }
  get ticksLived() { return 0; }
  
  // Naturally Static
  // These can be cahnged ingame
  get maxFireTicks() { return 0; }
  get hasGravity() { return 0; }
  get isCustomNameVisable() { return true; }
  get dead() { return false; }
  get glowing() { return false; }
  get silent() { return false; }

  // Static
  // These can not be changed ingame
  get height() { return 0; }
  get width() { return 0; }
}