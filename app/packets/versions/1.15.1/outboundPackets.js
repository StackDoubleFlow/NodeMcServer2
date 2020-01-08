function placeholder(name, log = true) {
  return {
    name: name,
    parameters: [],
    todo: true,
    log: log
  };
}

module.exports = {
  none: {},
  stat: {
    Response: {
      id: 0x00,
      parameters: [],
      parameters: [
        {
          name: "JsonResponse",
          type: "json",
          max: 32767
        }
      ]
    },
    Pong: {
      id: 0x01,
      parameters: [],
      parameters: [
        {
          name: "Payload",
          type: "long"
        }
      ]
    }
  },
  login: {},
  play: {
    SpawnObject: {
      id: 0x00,
      parameters: []
    },
    SpawnExperienceOrb: {
      id: 0x01,
      parameters: []
    },
    SpawnGlobalEntity: {
      id: 0x02,
      parameters: []
    },
    SpawnMob: {
      id: 0x03,
      parameters: []
    },
    SpawnPainting: {
      id: 0x04,
      parameters: []
    },
    SpawnPlayer: {
      id: 0x05,
      parameters: []
    },
    Animation: {
      id: 0x06,
      parameters: [
        {
          name: "EntityId",
          type: "varint"
        },
        {
          name: "Animation",
          type: "byte",
          values: {
            swing_main_arm: 0,
            take_damage: 1,
            leave_bed: 2,
            swing_offhand: 3,
            critical_effect: 4,
            magic_critical_effect: 5
          }
        }
      ]
    },
    Statistics: {
      id: 0x07,
      parameters: []
    },
    AcknowledgePlayerDigging: {
      id: 0x08,
      parameters: []
    },
    BlockBreakAnimation: {
      id: 0x09,
      parameters: []
    },
    UpdateBlockEntity: {
      id: 0x0A,
      parameters: [
        {
          name: "Location",
          type: "position"
        },
        {
          name: "Action",
          type: "byte"
        },
        {
          name: "NbtData",
          type: "nbt"
        }
      ]
    },
    BlockAction: {
      id: 0x0B,
      parameters: []
    },
    BlockChange: {
      id: 0x0C,
      parameters: []
    },
    BossBar: {
      id: 0x0D,
      parameters: []
    },
    ServerDifficulty: {
      id: 0x0E,
      parameters: []
    },
    ChatMessage: {
      id: 0x0F,
      parameters: [],
      parameters: [
        {
          name: "Message",
          type: "json",
          max: 32767
        },
        {
          name: "Type",
          type: "byte"
        }
      ]
    },
    MultiBlockChange: {
      id: 0x10,
      parameters: []
    },
    TabComplete: {
      id: 0x11,
      parameters: []
    },
    DeclareCommands: {
      id: 0x12,
      parameters: []
    },
    ConfirmTransaction: {
      id: 0x13,
      parameters: []
    },
    CloseWindow: {
      id: 0x14,
      parameters: []
    },
    WindowItems: {
      id: 0x15,
      parameters: []
    },
    WindowProperty: {
      id: 0x16,
      parameters: []
    },
    SetSlot: {
      id: 0x17,
      parameters: []
    },
    SetCooldown: {
      id: 0x18,
      parameters: []
    },
    PluginMessage: {
      id: 0x19,
      parameters: []
    },
    NamedSoundEffect: {
      id: 0x1A,
      parameters: []
    },
    Disconnect: {
      id: 0x1B,
      parameters: []
    },
    EntityStatus: {
      id: 0x1C,
      parameters: []
    },
    Explosion: {
      id: 0x1D,
      parameters: []
    },
    UnloadChunk: {
      id: 0x1E,
      parameters: []
    },
    ChangeGameState: {
      id: 0x1F,
      parameters: []
    },
    OpenHorseWindow: {
      id: 0x20,
      parameters: []
    },
    KeepAlive: {
      id: 0x21,
      parameters: []
    },
    ChunkData: {
      id: 0x22,
      parameters: []
    },
    Effect: {
      id: 0x23,
      parameters: []
    },
    Particle: {
      id: 0x24,
      parameters: []
    },
    UpdateLight: {
      id: 0x25,
      parameters: []
    },
    JoinGame: {
      id: 0x26,
      parameters: [
        {
          name: "EntityID",
          type: "int"
        },
        {
          name: "Gamemode",
          type: "byte",
          values: {
            survival: 0,
            creative: 1,
            adventure: 2,
            spectator: 3,
            hardcore_survival: 0 | 0x8,
            hardcore_creative: 1 | 0x8,
            hardcore_adventure: 2 | 0x8,
            hardcore_spectator: 3 | 0x8
          }
        },
        {
          name: "Dimension",
          type: "int",
          values: {
            nether: -1,
            overworld: 0,
            end: 1
          }
        }
      ]
    },
    MapData: {
      id: 0x27,
      parameters: []
    },
    TradeList: {
      id: 0x28,
      parameters: []
    },
    EntityRelativeMove: {
      id: 0x29,
      parameters: []
    },
    EntityLookAndRelativeMove: {
      id: 0x2A,
      parameters: []
    },
    EntityLook: {
      id: 0x2B,
      parameters: []
    },
    Entity: {
      id: 0x2C,
      parameters: []
    },
    VehicleMove: {
      id: 0x2D,
      parameters: []
    },
    OpenBook: {
      id: 0x2E,
      parameters: []
    },
    OpenWindow: {
      id: 0x2F,
      parameters: []
    },
    OpenSignEditor: {
      id: 0x30,
      parameters: []
    },
    CraftRecipeResponse: {
      id: 0x31,
      parameters: []
    },
    PlayerAbilities: {
      id: 0x32,
      parameters: []
    },
    CombatEvent: {
      id: 0x33,
      parameters: []
    },
    PlayerInfo: {
      id: 0x34,
      parameters: []
    },
    FacePlayer: {
      id: 0x35,
      parameters: []
    },
    PlayerPositionAndLook: {
      id: 0x36,
      parameters: []
    },
    UnlockRecipes: {
      id: 0x37,
      parameters: []
    },
    DestroyEntities: {
      id: 0x38,
      parameters: []
    },
    RemoveEntityEffect: {
      id: 0x39,
      parameters: []
    },
    ResourcePackSend: {
      id: 0x3A,
      parameters: []
    },
    Respawn: {
      id: 0x3B,
      parameters: []
    },
    EntityHeadLook: {
      id: 0x3C,
      parameters: []
    },
    SelectAdvancementTab: {
      id: 0x3D,
      parameters: []
    },
    WorldBorder: {
      id: 0x3E,
      parameters: []
    },
    Camera: {
      id: 0x3F,
      parameters: []
    },
    HeldItemChange: {
      id: 0x40,
      parameters: []
    },
    UpdateViewPosition: {
      id: 0x41,
      parameters: []
    },
    UpdateViewDistance: {
      id: 0x42,
      parameters: []
    },
    DisplayScoreboard: {
      id: 0x43,
      parameters: []
    },
    EntityMetadata: {
      id: 0x44,
      parameters: []
    },
    AttachEntity: {
      id: 0x45,
      parameters: []
    },
    EntityVelocity: {
      id: 0x46,
      parameters: []
    },
    EntityEquipment: {
      id: 0x47,
      parameters: []
    },
    SetExperience: {
      id: 0x48,
      parameters: []
    },
    UpdateHealth: {
      id: 0x49,
      parameters: []
    },
    ScoreboardObjective: {
      id: 0x4A,
      parameters: []
    },
    SetPassengers: {
      id: 0x4B,
      parameters: []
    },
    Teams: {
      id: 0x4C,
      parameters: []
    },
    UpdateScore: {
      id: 0x4D,
      parameters: []
    },
    SpawnPosition: {
      id: 0x4E,
      parameters: []
    },
    TimeUpdate: {
      id: 0x4F,
      parameters: []
    },
    Title: {
      id: 0x50,
      parameters: []
    },
    EntitySoundEffect: {
      id: 0x51,
      parameters: []
    },
    SoundEffect: {
      id: 0x52,
      parameters: []
    },
    StopSound: {
      id: 0x53,
      parameters: []
    },
    PlayerListHeaderAndFooter: {
      id: 0x54,
      parameters: []
    },
    NBTQueryResponse: {
      id: 0x55,
      parameters: []
    },
    CollectItem: {
      id: 0x56,
      parameters: []
    },
    EntityTeleport: {
      id: 0x57,
      parameters: []
    },
    Advancements: {
      id: 0x58,
      parameters: []
    },
    EntityProperties: {
      id: 0x59,
      parameters: []
    },
    EntityEffect: {
      id: 0x5A,
      parameters: []
    },
    DeclareRecipes: {
      id: 0x5B,
      parameters: []
    },
    Tags: {
      id: 0x5C,
      parameters: []
    }
  }
}