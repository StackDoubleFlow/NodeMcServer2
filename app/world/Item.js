const utils = require("../utils");

export default class Item {
    /**
     * @param {string} id
     */
    constructor(id, amount=1) {
        id = id.toLowerCase();
        if(!id.startsWith("minecraft:"))
            id += "minecraft:";
        this.id = id;
        //this.pallatteId = Item.registry.entries[this.id].protocol_id; // e
        this.amount = amount;
        this.nbt = {};
    }

    getProtocolId(version) {
        return utils.itemIdtoItemProtocolId(version, this.id);
    }

    toSlotData(version) {
        const slotData = utils.createBufferObject();

        if (!this.id) {
            utils.writeByte(slotData, 0); // Is not present
            return slotData;
        }

        utils.writeByte(slotData, 1); // Is present
        utils.writeVarInt(slotData, this.getProtocolId(version)); // Item Id
        utils.writeByte(slotData, this.amount); // Amount

        if (Object.keys(this.nbt).length === 0) { // NBT
            utils.writeByte(slotData, 0); // No nbt needed
        } else {
            utils.writeNbt(slotData, this.nbt); // Item NBT
        }

        return slotData;
    }

    static fromProtocolId(version, pid, amt=1) {
        const id = utils.itemProtocolIdToItemId(version, pid);

        return new Item(id, amt);
    }
    
}
