import { Plugin } from "nodemcserver";

export default class ExamplePlugin extends Plugin {
  onEnable() {
    console.log("Plugin Enabled");
    this.server.eventManager.on(this, )
  }
}