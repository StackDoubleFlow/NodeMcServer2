function placeholder(name, log = true) {
  return {
    name: name,
    parameters: [],
    todo: true,
    log: log
  };
}

module.exports = {
  none: {
    0x00: {
      name: "Handshake",
      parameters: [
        {
          name: "version",
          type: "varint"
        },
        {
          name: "port",
          type: "ushort"
        },
        {
          name: "NextState",
          type: "varint"
        }
      ],
    }
  },
  stat: {
    0x00: {
      name: "Request",
      parameters: []
    },
    0x01: {
      name: "Ping",
      parameters: [
        {
          name: "pingId",
          type: "long"
        }
      ]
    }
  },
  logn: {
    0x00: {
      name: "LoginStart",
      parameters: [
        {
          name: "username",
          type: "string",
          max: 16
        }
      ]
    },
    0x01: {
      name: "EncyptionResponse",
      parameters: [
        {
          name: "sharedSecret",
          lengthType: "varint",
          type: "byte[]"
        },
        {
          name: "verifyToken",
          lengthType: "varint",
          type: "byte[]"
        }
      ]
    }
  },
  play: {
    0x03: {
      name: "ChatMessage",
      parameters: [
        {
          name: "message",
          type: "string",
          max: 256
        }
      ],
      auto: true
    },
    0x05: {
      name: "ClientSettings",
      parameters: [
        {
          name: "locale",
          type: "string",
          max: 16
        },
        {
          name: "viewDistance",
          type: "byte"
        },
        {
          name: "chatMode",
          type: "varint"
        },
        {
          name: "chatColors",
          type: "boolean"
        },
        {
          name: "displayedSkinParts",
          type: "byte"
        },
        {
          name: "mainHand",
          type: "varint"
        }
      ]
    },
    0x0F: {
      name: "KeepAlive",
      parameters: [
        {
          name: "keepAliveId",
          type: "long"
        }
      ]
    },
    0x11: {
      name: "PlayerPosition",
      parameters: [
        {
          name: "x",
          type: "double"
        },
        {
          name: "y",
          type: "double"
        },
        {
          name: "z",
          type: "double"
        },
        {
          name: "onGround",
          type: "boolean"
        }
      ]
    },
    0x13: {
      name: "PlayerLook",
      parameters: [
        {
          name: "yaw",
          type: "float"
        },
        {
          name: "pitch",
          type: "float"
        },
        {
          name: "onGround",
          type: "boolean"
        }
      ]
    },
    0x19: {

    },
    0x1A: {
      name: "PlayerDigging",
      parameters: [
        {
          name: "status",
          type: "varint"
        },
        {
          name: "location",
          type: "position"
        },
        {
          name: "face",
          type: "byte"
        }
      ]
    },
    0x2C: {
      name: "PlayerBlockPlacement",
      parameters: [
        {
          name: "hand",
          type: "varint"
        },
        {
          name: "location",
          type: "position"
        },
        {
          name: "face",
          type: "varint"
        },
        {
          name: "cursorPositionX",
          type: "float"
        },
        {
          name: "cursorPositionY",
          type: "float"
        },
        {
          name: "cursorPositionZ",
          type: "float"
        },
        {
          name: "insideBlock",
          type: "boolean"
        }
      ]
    },
    0x2A: {
      name: "Animation",
      auto: true,
      parameters: [
        {
          name: "hand",
          type: "varint",
          values: {
            0: "main",
            1: "offhand"
          }
        }
      ]
    },
    0x1B: {
      name: "EntityAction",
      parameters: [
        {
          name: "entityId",
          type: "varint"
        },
        {
          name: "actionId",
          type: "varint",
          values: {
            0: "startSneaking",
            1: "stopSneaking",
            2: "leaveBed",
            3: "startSprinting",
            4: "stopSprinting",
            5: "startHorseJump",
            6: "stopHorseJump",
            7: "openHorseInventory",
            8: "startFlyingWithElytra"
          }
        },
        {
          name: "jumpBoost",
          type: "varint"
        }
      ],
      auto: true
    },
    0x12: {
      name: "PlayerPositionAndLook",
      parameters: [
        {
          name: "x",
          type: "double"
        },
        {
          name: "y",
          type: "double"
        },
        {
          name: "z",
          type: "double"
        },
        {
          name: "yaw",
          type: "float"
        },
        {
          name: "pitch",
          type: "float"
        },
        {
          name: "onGround",
          type: "boolean"
        }
      ],
      log: false,
      auto: true
    },

    // TODO
    0x00: placeholder("TeleportConfirm"),
    0x01: placeholder("QueryBlockNBT"),
    0x02: placeholder("SetDifficulty"),
    0x04: placeholder("ClientStatus"),
    0x06: placeholder("TabComplete"),
    0x07: placeholder("ConfirmTransaction"),
    0x08: placeholder("EnchantItem"),
    0x09: placeholder("ClickWindow"),
    0x0A: placeholder("CloseWindow"),
    0x0B: placeholder("PluginMessage"),
    0x0C: placeholder("EditBook"),
    0x0D: placeholder("QueryEntityNBT"),
    0x0E: placeholder("UseEntity"),
    0x10: placeholder("LockDifficulty"),
    0x14: placeholder("Player"),
    0x15: placeholder("VehicleMove"),
    0x16: placeholder("SteerBoat"),
    0x17: placeholder("PickItem"),
    0x18: placeholder("CraftRecipeRequest"),
    0x1C: placeholder("SteerVehicle"),
    0x1D: placeholder("RecipeBookData"),
    0x1E: placeholder("NameItem"),
    0x1F: placeholder("ResourcePackStatus"),
    0x20: placeholder("AdvancementTab"),
    0x21: placeholder("SelectTrade"),
    0x22: placeholder("SetBeaconEffect"),
    0x23: placeholder("HeldItemChange"),
    0x24: placeholder("UpdateCommandBlock"),
    0x25: placeholder("UpdateCommandBlockMinecart"),
    0x26: placeholder("CreativeInventoryAction"),
    0x27: placeholder("UpdateJigsawBlock"),
    0x28: placeholder("UpdateStructureBlock"),
    0x29: placeholder("UpdateSign"),
    0x2B: placeholder("Spectate"),
    0x2D: placeholder("UseItem")
  }
};