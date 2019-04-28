module.exports = {
    api: {
        commands: {},
        plugins: {},
        events: {}
    },
    world: {
        entities: {
            Entity: null
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