export default class Item {
    /**
     * @param {string} id
     */
    constructor(id, amount=1) {
        id = id.toLowerCase();
        if(!id.startsWith("minecraft:"))
            id += "minecraft:";
        this.id = id;
        this.pallatteId = Item.registry.entries[this.id].protocol_id; // e
        this.amount = amount;
    }
}
