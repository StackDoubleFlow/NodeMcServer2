
declare module 'nodemcserver' {
  /* API */

  // Commands
  export class CommandContext {
    public commandHandler: CommandHandler;
    public server: MinecraftServer;
    public sender: MinecraftServer | Player;
    public label: string;
    public argString: string;
    public args: string[];

    public isSenderPlayer(): boolean;
    public isSenderServer(): boolean;
  }
  export class CommandExecutor {
    public handler: CommandHandler;
    public plugin: Plugin;
    public options: { [string]: any };
    public callback: (context: CommandContext) => void;

    public call(context: {}): boolean;
  }
  export class CommandHandler {
    public server: MinecraftServer;
    public commands: Map<string, CommandExecutor>;

    public addCommand(plugin: Plugin, options: {}, callback: (context: CommandContext) => void);
    public removeCommand(name: string);
    public runCommand(sender: MinecraftServer | Player, str: string);
  }

  export interface EventListenerOptions {
    ignoreCanceled: boolean;
    priority: "highest" | "high" | "normal" | "low" | "lowest" | "monitor";
  }
  export interface MinecraftEvet { }
  export interface CancellableEvent extends MinecraftEvet {
    isCanceled: boolean;
    setCanceled(cancel: boolean): void;
  }

  // Events
  export class EventManager {

    public call(event: string, ...args: any)


    // Block
    public on(plugin: Plugin, event: "blockBreak", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "blockBurn", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "blockCanBuild", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "blockCook", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "blockDamage", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "blockDispenseArmor", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "blockDispense", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "blockDropItem", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "blockExp", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "blockExplode", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "blockFade", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "blockFertilize", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "blockForm", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "blockFromTo", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "blockGrow", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "blockIgnite", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "blockMultiPlace", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "blockPhysics", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "blockPiston", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "blockPistonExtend", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "blockPistonRetract", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "blockPlace", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "blockRedstone", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "blockShearEntity", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "blockSpread", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "cauldronLevelChange", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "entityBlockForm", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "fluidLevelChange", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "leavesDecay", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "moistureChange", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "notePlay", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "signChange", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "spongeAbsorb", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;

    // Enchantment
    public on(plugin: Plugin, event: "enchantItem", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "prepareItemEnchant", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;

    // Entity
    public on(plugin: Plugin, event: "areaEffectCloudApply", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "batToggleSleep", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "creatureSpawn", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "creeperPower", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "enderDragonChangePhase", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "entityAirChange", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "entityBreakDoor", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "entityBreed", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "entityChangeBlock", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "entityCombustByBlock", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "entityCombustByEntity", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "entityCombust", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "entityCreatePortal", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "entityDamageByBlock", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "entityDamageByEntity", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "entityDamage", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "entityDeath", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "entityDropItem", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "entityExplode", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "entityInteract", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "entityPickupItem", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "entityPlace", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "entityPortalEnter", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "entityPortal", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "entityPortalExit", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "entityPoseChange", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "entityPotionEffect", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "entityRegainHealth", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "entityResurrect", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "entityShootBow", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "entitySpawn", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "entityTame", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "entityTarget", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "entityTargetLivingEntity", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "entityTeleport", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "entityToggleGlide", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "entityToggleSwim", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "entityTransform", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "entityUnleash", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "expBottle", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "explosionPrime", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "fireworkExplode", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "foodLevelChange", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "horseJump", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "itemDespawn", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "itemMerge", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "itemSpawn", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "lingeringPotionSplash", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "pigZap", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "pigZombieAnger", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerDeath", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerLeashEntity", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "potionSplash", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "projectileHit", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "projectileLaunch", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "sheepDyeWool", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "sheepRegrowWool", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "slimeSplit", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "spawnerSpawn", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "villagerAcquireTrade", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "villagerCareerChange", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "villagerReplenishTrade", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;

    // Hanging Entities
    public on(plugin: Plugin, event: "hangingBreakByEntity", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "hangingBreak", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "hangingPlace", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;

    // Inventory
    public on(plugin: Plugin, event: "brew", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "brewingStandFuel", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "craftItem", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "furnaceBurn", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "furnaceExtract", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "furnaceSmelt", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "inventoryClick", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "inventoryClose", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "inventoryCreative", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "inventoryDrag", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "inventoryInteract", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "inventoryMoveItem", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "inventoryOpen", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "inventoryPickupItem", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "prepareAnvil", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "prepareItemCraft", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "tradeSelect", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;

    // Player
    public on(plugin: Plugin, event: "chat", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerAdvancementDone", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerAnimation", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerArmorStandManipulate", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerBedEnter", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerBedLeave", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerBucketEmpty", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerBucket", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerBucketFill", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerChangedMainHand", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerChangedWorld", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerChannel", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerChat", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerChatTabComplete", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerCommandPreprocess", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerCommandSend", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerDropItem", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerEditBook", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerEggThrow", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerExpChange", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerFish", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerGameModeChange", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerInteractAtEntity", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerInteractEntity", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerInteract", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerItemBreak", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerItemConsume", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerItemDamage", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerItemHeld", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerItemMend", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerJoin", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerKick", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerLevelChange", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerLocaleChange", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerLogin", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerMove", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerPickupArrow", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerPickupItem", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerPortal", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerPreLogin", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerQuit", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerRecipeDiscover", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerRegisterChannel", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerResourcePackStatus", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerRespawn", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerRiptide", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerShearEntity", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerStatisticIncrement", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerSwapHandItems", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerTakeLecternBook", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerTeleport", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerToggleFlight", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerToggleSneak", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerToggleSprint", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerUnleashEntity", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerUnregisterChannel", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "playerVelocity", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;

    // Events
    public on(plugin: Plugin, event: "finishEvent", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "spawnWaveEvent", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "stopEvent", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "triggerEvent", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;

    // Server
    public on(plugin: Plugin, event: "broadcastMessage", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "mapInitialize", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "pluginDisable", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "pluginEnable", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "remoteServerCommand", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "serverCommand", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "serverListPing", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "serverLoad", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "serviceRegister", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "serviceUnregister", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "tabComplete", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;

    // Vehicle
    public on(plugin: Plugin, event: "vehicleBlockCollision", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "vehicleCollision", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "vehicleCreate", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "vehicleDamage", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "vehicleDestroy", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "vehicleEnter", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "vehicleEntityCollision", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "vehicleExit", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "vehicleMove", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "vehicleUpdate", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;

    // Weather
    public on(plugin: Plugin, event: "lightningStrike", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "thunderChange", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "weatherChange", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;

    // World
    public on(plugin: Plugin, event: "chunkLoad", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "chunkPopulate", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "chunkUnload", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "portalCreate", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "spawnChange", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "structureGrow", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "timeSkip", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "worldInit", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "worldLoad", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "worldSave", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(plugin: Plugin, event: "worldUnload", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
  }

  // Plugins
  export class Plugin {

    // Block
    public on(event: "blockBreak", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "blockBurn", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "blockCanBuild", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "blockCook", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "blockDamage", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "blockDispenseArmor", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "blockDispense", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "blockDropItem", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "blockExp", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "blockExplode", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "blockFade", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "blockFertilize", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "blockForm", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "blockFromTo", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "blockGrow", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "blockIgnite", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "blockMultiPlace", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "blockPhysics", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "blockPiston", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "blockPistonExtend", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "blockPistonRetract", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "blockPlace", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "blockRedstone", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "blockShearEntity", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "blockSpread", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "cauldronLevelChange", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "entityBlockForm", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "fluidLevelChange", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "leavesDecay", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "moistureChange", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "notePlay", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "signChange", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "spongeAbsorb", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;

    // Enchantment
    public on(event: "enchantItem", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "prepareItemEnchant", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;

    // Entity
    public on(event: "areaEffectCloudApply", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "batToggleSleep", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "creatureSpawn", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "creeperPower", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "enderDragonChangePhase", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "entityAirChange", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "entityBreakDoor", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "entityBreed", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "entityChangeBlock", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "entityCombustByBlock", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "entityCombustByEntity", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "entityCombust", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "entityCreatePortal", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "entityDamageByBlock", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "entityDamageByEntity", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "entityDamage", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "entityDeath", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "entityDropItem", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "entityExplode", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "entityInteract", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "entityPickupItem", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "entityPlace", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "entityPortalEnter", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "entityPortal", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "entityPortalExit", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "entityPoseChange", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "entityPotionEffect", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "entityRegainHealth", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "entityResurrect", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "entityShootBow", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "entitySpawn", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "entityTame", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "entityTarget", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "entityTargetLivingEntity", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "entityTeleport", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "entityToggleGlide", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "entityToggleSwim", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "entityTransform", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "entityUnleash", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "expBottle", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "explosionPrime", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "fireworkExplode", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "foodLevelChange", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "horseJump", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "itemDespawn", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "itemMerge", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "itemSpawn", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "lingeringPotionSplash", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "pigZap", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "pigZombieAnger", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerDeath", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerLeashEntity", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "potionSplash", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "projectileHit", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "projectileLaunch", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "sheepDyeWool", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "sheepRegrowWool", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "slimeSplit", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "spawnerSpawn", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "villagerAcquireTrade", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "villagerCareerChange", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "villagerReplenishTrade", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;

    // Hanging Entities
    public on(event: "hangingBreakByEntity", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "hangingBreak", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "hangingPlace", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;

    // Inventory
    public on(event: "brew", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "brewingStandFuel", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "craftItem", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "furnaceBurn", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "furnaceExtract", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "furnaceSmelt", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "inventoryClick", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "inventoryClose", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "inventoryCreative", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "inventoryDrag", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "inventoryInteract", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "inventoryMoveItem", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "inventoryOpen", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "inventoryPickupItem", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "prepareAnvil", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "prepareItemCraft", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "tradeSelect", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;

    // Player
    public on(event: "chat", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerPreLogin", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerAdvancementDone", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerAnimation", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerArmorStandManipulate", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerBedEnter", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerBedLeave", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerBucketEmpty", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerBucket", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerBucketFill", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerChangedMainHand", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerChangedWorld", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerChannel", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerChat", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerChatTabComplete", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerCommandPreprocess", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerCommandSend", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerDropItem", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerEditBook", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerEggThrow", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerExpChange", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerFish", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerGameModeChange", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerInteractAtEntity", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerInteractEntity", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerInteract", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerItemBreak", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerItemConsume", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerItemDamage", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerItemHeld", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerItemMend", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerJoin", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerKick", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerLevelChange", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerLocaleChange", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerLogin", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerMove", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerPickupArrow", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerPickupItem", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerPortal", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerQuit", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerRecipeDiscover", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerRegisterChannel", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerResourcePackStatus", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerRespawn", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerRiptide", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerShearEntity", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerStatisticIncrement", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerSwapHandItems", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerTakeLecternBook", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerTeleport", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerToggleFlight", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerToggleSneak", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerToggleSprint", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerUnleashEntity", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerUnregisterChannel", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "playerVelocity", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;

    // Events
    public on(event: "finishEvent", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "spawnWaveEvent", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "stopEvent", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "triggerEvent", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;

    // Server
    public on(event: "broadcastMessage", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "mapInitialize", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "pluginDisable", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "pluginEnable", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "remoteServerCommand", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "serverCommand", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "serverListPing", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "serverLoad", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "serviceRegister", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "serviceUnregister", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "tabComplete", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;

    // Vehicle
    public on(event: "vehicleBlockCollision", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "vehicleCollision", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "vehicleCreate", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "vehicleDamage", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "vehicleDestroy", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "vehicleEnter", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "vehicleEntityCollision", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "vehicleExit", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "vehicleMove", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "vehicleUpdate", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;

    // Weather
    public on(event: "lightningStrike", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "thunderChange", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "weatherChange", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;

    // World
    public on(event: "chunkLoad", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "chunkPopulate", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "chunkUnload", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "portalCreate", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "spawnChange", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "structureGrow", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "timeSkip", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "worldInit", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "worldLoad", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "worldSave", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
    public on(event: "worldUnload", listener: (event: CancellableEvent) => void, options?: EventListenerOptions): void;
  }

  /* Console */
  export class ConsoleInterface { }

  /* Packets */

  export class Packet { }
  export class PacketManager { }

  /* World */
  export class Block { }
  export class BlockPalette { }
  export class Chunk { }
  export class Item { }
  export class Location { }
  export class Position { }
  export class World { }

  /* App */
  export class MinecraftServer { }
  export class Player { }
}