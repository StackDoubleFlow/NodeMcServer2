import MinecraftServer from "../../MinecraftServer";
import EventEmmiter from "events";


/**
 * This callback is displayed as part of the Requester class.
 * @callback eventListener
 * @param {...any} args
 */

/**
 * Plugin
 *
 * @fires Plugin#join
 */
export default class Plugin {
  /**
   * @param {MinecraftServer}
   */
  constructor(server) {
    /**
     * @type {MinecraftServer}
     */
    this.server = server;

    
    /**
     * Player join event.
     *
     * @event join
     * @type {object}
     * @property {boolean} isPacked - Indicates whether the snowball is tightly packed.
     */
  }

  /**
   * @param {string | symbol} event
   * @param {eventListener} listener
   * @param {object} options
   * @param {boolean} options.ignoreCanceled
   * @param {("highest"|"high"|"normal"|"low"|"lowest"|"monitor")} options.priority
   */
  on2(event, listener, options) {
    this.server.eventManager.on(this, event, listener, options);
  }

  onLoad() {}
  onEnable() {}
  onDisable() {}
}

// EVENTS
