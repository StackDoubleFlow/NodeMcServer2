import MinecraftServer from "../../MinecraftServer";


export default class Plugin {
  /**
   * @param {MinecraftServer}
   */
  constructor(server) {
    /**
     * @type {MinecraftServer}
     */
    this.server = server;
  }

  /**
   * @param {string} eventName
   * @param {Function} handler
   * @param {object} options
   * @param {boolean} options.ignoreCanceled
   * @param {("highest"|"high"|"normal"|"low"|"lowest"|"monitor")} options.priority
   */
  on(eventName, handler, options) {
    this.server.eventManager.on(this, eventName, handler, options);
  }

  onLoad() {}
  onEnable() {}
  onDisable() {}
}
