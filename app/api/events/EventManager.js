

class EventManager {
  constructor(server) {
    this.listeners = {
      playerjoin: {
        "highest": [],
        "high": [],
        "normal": [],
        "low": [],
        "lowest": [],
        "monitor": []
      }
    }
  }

  call(eventName, ...args) {
    eventName = eventName.toLowerCase();
    if (!this.listeners[eventName]) return;

    let canceled = false;

    for(let priority of Object.keys(this.listeners[eventName]))
      for(let handler of this.listeners[eventName][priority]) {
        try {
          if(!canceled || handler.ignoreCanceled) {
            const rtn = handler.handler.call(handler.plugin, ...args);

            if(rtn === false)
              canceled === true;
          }
        } catch(e) {
          console.error(`Error whitlist calling event ${eventName} for plugin ${handler.plugin.name}`);
        }
      }


    return canceled;
  }

  on(plugin, eventName, handler, options={}) {
    eventName = eventName.toLowerCase();
    if (!this.listeners[eventName])
      this.listeners[eventName] = {
        "highest": [],
        "high": [],
        "normal": [],
        "low": [],
        "lowest": [],
        "monitor": []
      }

      const ignoreCanceled = options.ignoreCanceled === undefined ? true : options.ignoreCanceled;
      let priority = options.priority.toLowerCase() || "normal";

      if (["highest", "high", "normal", "low", "lowest", "monitor"].includes(priority))
        throw new Error("Invalid priority");

    this.listeners[eventName][priority].push({
      plugin,
      ignoreCanceled,
      handler
    })
  }
}

module.exports = EventManager;