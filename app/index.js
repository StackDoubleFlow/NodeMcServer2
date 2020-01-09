
import CommandContext from "./api/commands/CommandContext";
import CommandExecutor from "./api/commands/CommandExecutor";
import CommandHandler from "./api/commands/CommandHandler";
import EventManager from "./api/events/EventManager";
import Plugin from "./api/plugins/Plugin";
import ConsoleInterface from "./console/ConsoleInterface";
import Packet from "./packets/Packet";
import PacketManager from "./packets/PacketManager";
import Block from "./world/Block";
import BlockPalette from "./world/BlockPalette";
import Chunk from "./world/Chunk";
import Item from "./world/Item";
import Location from "./world/Location";
import Position from "./world/Position";
import World from "./world/World";
import MinecraftServer from "./MinecraftServer";
import Player from "./Player";

import versions from "./packets/versions/versions";
import utils from "./utils";

module.exports = {
    CommandContext,
    CommandExecutor,
    CommandHandler,
    EventManager,
    Plugin,
    ConsoleInterface,
    versions,
    Packet,
    PacketManager,
    Block,
    BlockPalette,
    Chunk,
    Item,
    Location,
    Position,
    World,
    MinecraftServer,
    Player,
    utils
};

const test = {
    api: {
        commands: {},
        plugins: {
            Plugin
        },
        events: {}
    },
    world: {
        entities: {
            Entity: null,
            LivingEntity: null,
            UtilityEntity: null,
            HostileEntity: null,
            NeutralEntity: null,
            PassiveEntity: null,
            BossEntity: null,
            living: {
                passive: {
                    // Peaceful
                    Bat: null,
                    BrownMooshroom: null,
                    Chicken: null,
                    Cod: null,
                    Cow: null,
                    Donkey: null,
                    Fox: null,
                    Horse: null,
                    RedMooshroom: null,
                    mule: null,
                    Ocelot: null,
                    Panda: null,
                    Parrot: null,
                    Pig: null,
                    Rabbit: null,
                    Sheep: null,
                    SkeletonHorse: null,
                    Salmon: null,
                    Squid: null,
                    Turtle: null,
                    TropicalFish: null,
                    Villager: null,
                    WanderingTrader: null,

                    // Defensive
                    Pufferfish: null
                },
                neutral: {
                    // Animals
                    Dolphin: null,
                    Llama: null,
                    PolarBear: null,
                    TraderLama: null,
                    Wolf: null,

                    // Monsters
                    CaveSpider: null,
                    Enderman: null,
                    Spider: null,
                    ZombiePigman: null
                },
                hostile: {
                    Blaze: null,
                    Creeper: null,
                    Drowned: null,
                    ElderGuardian: null,
                    Endermite: null,
                    Evoker: null,
                    Ghast: null,
                    Guardian: null,
                    Husk: null,
                    MagmaCube: null,
                    Phantom: null,
                    Pillager: null,
                    Ravager: null,
                    Shulker: null,
                    Silverfish: null,
                    Skeleton: null,
                    Slime: null,
                    Stray: null,
                    Vex: null,
                    Vindicator: null,
                    Witch: null,
                    WitherSkeleton: null,
                    Zombie: null,
                    ZombieVillager: null
                },
                utility: {
                    IronGolem: null,
                    SnowGolem: null
                },
                boss: {
                    EnderDragon: null,
                    Wither: null
                }
            }
        },
        blocks: {},
        World: null,
        Location: null,
        Position: null,
        Chunk: null
    },
    packets: {
        PacketManager: null,
        versions: null
    },
    MinecraftServer: null,
    utils: null
}