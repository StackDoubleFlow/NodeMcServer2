export class Item {
    /**
     * @param {string} id
     */
    constructor(id) {
        id = id.toLowerCase();
        if(!id.startsWith("minecraft:"))
            id += "minecraft:";
        this.id = id;
        this.pallatteId = Item.registry.entries[this.id].protocol_id; // e
    }

    /**
     * @param {number} id
     */
    static fromPalatteId(id) {
        for(let entryId of Object.keys(Item.registry.entries)) {
            const entry = Item.registry.entries[entryId];
            if (entry.protocol_id == id) return entryId;
        }
    }

    static setRegistry(obj) {
        Item.registry = obj;
    }
}

module.exports = Item;