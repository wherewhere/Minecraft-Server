import * as GameTest from "mojang-gametest";
import {
  BlockLocation,
  BlockProperties,
  MinecraftBlockTypes,
  Color,
  Direction,
  ExplosionOptions,
  FluidContainer,
  MinecraftEffectTypes,
  MinecraftItemTypes,
  ItemStack,
  Location,
  World,
} from "mojang-minecraft";

GameTest.register("APITests", "on_entity_created", (test) => {
  const entityCreatedCallback = World.events.entityCreate.subscribe((entity) => {
    if (entity) {
      test.succeed();
    } else {
      test.fail("Expected entity");
    }
  });
  test.spawn("minecraft:horse<minecraft:ageable_grow_up>", new BlockLocation(1, 2, 1));
  World.events.entityCreate.unsubscribe(entityCreatedCallback);
})
  .structureName("ComponentTests:animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "assert_is_waterlogged", (test) => {
  const waterChestLoc = new BlockLocation(5, 2, 1);
  const waterLoc = new BlockLocation(4, 2, 1);
  const chestLoc = new BlockLocation(2, 2, 1);
  const airLoc = new BlockLocation(1, 2, 1);

  test.assertIsWaterlogged(waterChestLoc, true);
  test.assertIsWaterlogged(waterLoc, false);
  test.assertIsWaterlogged(chestLoc, false);
  test.assertIsWaterlogged(airLoc, false);
  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "assert_redstone_power", (test) => {
  const redstoneBlockLoc = new BlockLocation(3, 2, 1);
  const redstoneTorchLoc = new BlockLocation(2, 2, 1);
  const poweredLampLoc = new BlockLocation(1, 2, 1);
  const unpoweredLampLoc = new BlockLocation(0, 2, 1);
  const airLoc = new BlockLocation(3, 2, 0);
  const redstoneWireLoc = new BlockLocation(0, 1, 0);

  test.succeedWhen(() => {
    test.assertRedstonePower(redstoneBlockLoc, 15);
    test.assertRedstonePower(redstoneTorchLoc, 15);
    test.assertRedstonePower(poweredLampLoc, 15);
    test.assertRedstonePower(unpoweredLampLoc, 0);
    test.assertRedstonePower(airLoc, -1);
    test.assertRedstonePower(redstoneWireLoc, 13); // 3 length wire
  });
})
  .maxTicks(20)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "spawn_item", (test) => {
  const featherItem = new ItemStack(MinecraftItemTypes.feather, 1, 0);
  test.spawnItem(featherItem, new Location(1.5, 3.5, 1.5));
  test.succeedWhen(() => {
    test.assertEntityPresent("minecraft:item", new BlockLocation(1, 2, 1), true);
  });
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "assert_entity_data", (test) => {
  const pigId = "minecraft:pig<minecraft:ageable_grow_up>";
  const pigLoc = new BlockLocation(1, 2, 1);
  test.spawn(pigId, pigLoc);
  test.succeedWhen(() => {
    test.assertEntityState(pigLoc, pigId, (entity) => entity.id !== undefined);
  });
})
  .structureName("ComponentTests:animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "add_effect", (test) => {
  const villagerId = "minecraft:villager_v2<minecraft:ageable_grow_up>";
  const villagerLoc = new BlockLocation(1, 2, 1);
  const villager = test.spawn(villagerId, villagerLoc);
  const duration = 20;
  villager.addEffect(MinecraftEffectTypes.poison, duration, 1);

  test.assertEntityState(
    villagerLoc,
    villagerId,
    (entity) => entity.getEffect(MinecraftEffectTypes.poison).duration == duration
  );
  test.assertEntityState(
    villagerLoc,
    villagerId,
    (entity) => entity.getEffect(MinecraftEffectTypes.poison).amplifier == 1
  );

  test.runAfterDelay(duration, () => {
    test.assertEntityState(
      villagerLoc,
      villagerId,
      (entity) => entity.getEffect(MinecraftEffectTypes.poison) === undefined
    );
    test.succeed();
  });
})
  .structureName("ComponentTests:animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "assert_entity_present", (test) => {
  const villagerId = "minecraft:villager_v2";
  const villagerLoc = new BlockLocation(1, 2, 3);
  const emeraldItem = new ItemStack(MinecraftItemTypes.emerald, 1, 0);
  const emeraldItemLoc = new BlockLocation(3, 2, 3);
  const minecartId = "minecraft:minecart";
  const minecartLoc = new BlockLocation(3, 2, 1);
  const armorStandId = "minecraft:armor_stand";
  const armorStandLoc = new BlockLocation(1, 2, 1);

  test.spawn(villagerId, villagerLoc);
  test.spawnItem(emeraldItem, new Location(3.5, 4.5, 3.5));

  test.succeedWhen(() => {
    test.assertEntityPresent(villagerId, villagerLoc, true);
    test.assertItemEntityPresent(MinecraftItemTypes.emerald, emeraldItemLoc, 0, true);
    test.assertEntityPresent(armorStandId, armorStandLoc, true);

    // Check all blocks surrounding the minecart
    for (let x = -1; x <= 1; x++) {
      for (let z = -1; z <= 1; z++) {
        let offsetLoc = new BlockLocation(minecartLoc.x + x, minecartLoc.y, minecartLoc.z + z);
        if (x == 0 && z == 0) {
          test.assertEntityPresent(minecartId, offsetLoc, true);
        } else {
          test.assertEntityPresent(minecartId, offsetLoc, false);
        }
      }
    }
  });
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "assert_entity_not_present", (test) => {
  const armorStandId = "minecraft:armor_stand";
  const pigId = "minecraft:pig";
  const armorStandLoc = new BlockLocation(1, 2, 1);
  const airLoc = new BlockLocation(0, 2, 1);

  try {
    test.assertEntityPresentInArea(armorStandId, false);
    test.fail(); // this assert should throw
  } catch (e) {}

  try {
    test.assertEntityPresent(armorStandId, armorStandLoc, false);
    test.fail(); // this assert should throw
  } catch (e) {}

  test.assertEntityPresent(armorStandId, airLoc, false);
  test.assertEntityPresentInArea(pigId, false);

  test.succeed();
})
  .structureName("APITests:armor_stand")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "assert_item_entity_count_is", (test) => {
  let oneItemLoc = new BlockLocation(3, 2, 1);
  let fiveItemsLoc = new BlockLocation(1, 2, 1);
  let noItemsLoc = new BlockLocation(2, 2, 1);
  let diamondPickaxeLoc = new BlockLocation(2, 2, 4);

  const oneEmerald = new ItemStack(MinecraftItemTypes.emerald, 1, 0);
  const onePickaxe = new ItemStack(MinecraftItemTypes.diamondPickaxe, 1, 0);
  const fiveEmeralds = new ItemStack(MinecraftItemTypes.emerald, 5, 0);

  test.spawnItem(oneEmerald, new Location(3.5, 3, 1.5));
  test.spawnItem(fiveEmeralds, new Location(1.5, 3, 1.5));

  // spawn 9 pickaxes in a 3x3 grid
  for (let x = 1.5; x <= 3.5; x++) {
    for (let z = 3.5; z <= 5.5; z++) {
      test.spawnItem(onePickaxe, new Location(x, 3, z));
    }
  }

  test.assertItemEntityCountIs(MinecraftItemTypes.emerald, noItemsLoc, 0, 0);

  test.succeedWhen(() => {
    test.assertItemEntityCountIs(MinecraftItemTypes.feather, oneItemLoc, 0, 0);
    test.assertItemEntityCountIs(MinecraftItemTypes.emerald, oneItemLoc, 0, 1);
    test.assertItemEntityCountIs(MinecraftItemTypes.feather, fiveItemsLoc, 0, 0);
    test.assertItemEntityCountIs(MinecraftItemTypes.emerald, fiveItemsLoc, 0, 5);
    test.assertItemEntityCountIs(MinecraftItemTypes.emerald, fiveItemsLoc, 0, 5);
    test.assertItemEntityCountIs(MinecraftItemTypes.diamondPickaxe, diamondPickaxeLoc, 1, 9);
    test.assertItemEntityCountIs(MinecraftItemTypes.diamondPickaxe, diamondPickaxeLoc, 0, 1);
  });
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "assert_entity_touching", (test) => {
  const armorStandId = "minecraft:armor_stand";

  test.assertEntityTouching(armorStandId, new Location(1.5, 2.5, 1.5), true);
  test.assertEntityTouching(armorStandId, new Location(1.5, 3.5, 1.5), true);
  test.assertEntityTouching(armorStandId, new Location(1.0, 2.5, 1.5), false);
  test.assertEntityTouching(armorStandId, new Location(2.0, 2.5, 1.5), false);
  test.assertEntityTouching(armorStandId, new Location(1.5, 2.5, 1.0), false);
  test.assertEntityTouching(armorStandId, new Location(1.5, 2.5, 2.0), false);

  test.succeed();
})
  .structureName("APITests:armor_stand")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "pulse_redstone", (test) => {
  const pulseLoc = new BlockLocation(1, 2, 2);
  const lampLoc = new BlockLocation(1, 2, 1);
  test.assertRedstonePower(lampLoc, 0);
  test.pulseRedstone(pulseLoc, 2);

  test
    .startSequence()
    .thenIdle(2)
    .thenExecute(() => test.assertRedstonePower(lampLoc, 15))
    .thenIdle(2)
    .thenExecute(() => test.assertRedstonePower(lampLoc, 0))
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "block_location", (test) => {
  let testLoc = new BlockLocation(1, 1, 1);
  let worldLoc = test.worldBlockLocation(testLoc);
  let relativeLoc = test.relativeBlockLocation(worldLoc);
  test.assert(!relativeLoc.equals(worldLoc), "Expected relativeLoc and worldLoc to be different");
  test.assert(relativeLoc.equals(testLoc), "Expected relativeLoc to match testLoc");
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "location", (test) => {
  let testLoc = new Location(1.2, 1.2, 1.2);
  let worldLoc = test.worldLocation(testLoc);
  let relativeLoc = test.relativeLocation(worldLoc);
  test.assert(!relativeLoc.isNear(worldLoc, 0.01), "Expected relativeLoc and worldLoc to be different");
  test.assert(relativeLoc.isNear(testLoc, 0.01), "Expected relativeLoc to match testLoc");
  test.succeed();
})
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "create_explosion_basic", (test) => {
  let overworld = World.getDimension("overworld");
  const center = new BlockLocation(2, 3, 2);

  test.assertBlockPresent(MinecraftBlockTypes.cobblestone, center, true);

  const loc = test.worldBlockLocation(center);
  const explosionLoc = new Location(loc.x + 0.5, loc.y + 0.5, loc.z + 0.5);
  overworld.createExplosion(explosionLoc, 10, new ExplosionOptions());

  for (let x = 1; x <= 3; x++) {
    for (let y = 2; y <= 4; y++) {
      for (let z = 1; z <= 3; z++) {
        test.assertBlockPresent(MinecraftBlockTypes.cobblestone, new BlockLocation(x, y, z), false);
      }
    }
  }

  test.succeed();
})
  .padding(10) // The blast can destroy nearby items and mobs
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "create_explosion_advanced", (test) => {
  let overworld = World.getDimension("overworld");
  const center = new BlockLocation(3, 3, 3);

  const pigId = "minecraft:pig<minecraft:ageable_grow_up>";
  const pigLoc = new BlockLocation(3, 4, 3);
  test.spawn(pigId, pigLoc);

  const loc = test.worldBlockLocation(center);
  const explosionLoc = new Location(loc.x + 0.5, loc.y + 0.5, loc.z + 0.5);
  let explosionOptions = new ExplosionOptions();

  test.assertBlockPresent(MinecraftBlockTypes.cobblestone, center, true);

  // Start by exploding without breaking blocks
  explosionOptions.breaksBlocks = false;
  const creeper = test.spawn("minecraft:creeper", new BlockLocation(1, 2, 1));
  explosionOptions.source = creeper;
  test.assertEntityPresent(pigId, pigLoc, true);
  overworld.createExplosion(explosionLoc, 10, explosionOptions);
  creeper.kill();
  test.assertEntityPresent(pigId, pigLoc, false);
  test.assertBlockPresent(MinecraftBlockTypes.cobblestone, center, true);

  // Next, explode with fire
  explosionOptions = new ExplosionOptions();
  explosionOptions.causesFire = true;

  let findFire = () => {
    let foundFire = false;
    for (let x = 0; x <= 6; x++) {
      for (let z = 0; z <= 6; z++) {
        try {
          test.assertBlockPresent(MinecraftBlockTypes.fire, new BlockLocation(x, 3, z), true);
          foundFire = true;
          break;
        } catch (e) {}
      }
    }
    return foundFire;
  };

  test.assert(!findFire(), "Unexpected fire");
  overworld.createExplosion(explosionLoc, 15, explosionOptions);
  test.assertBlockPresent(MinecraftBlockTypes.cobblestone, center, false);
  test.assert(findFire(), "No fire found");

  // Finally, explode in water
  explosionOptions.allowUnderwater = true;
  const belowWaterLoc = new BlockLocation(3, 1, 3);
  test.assertBlockPresent(MinecraftBlockTypes.air, belowWaterLoc, false);
  overworld.createExplosion(explosionLoc, 10, explosionOptions);
  test.assertBlockPresent(MinecraftBlockTypes.air, belowWaterLoc, true);
  test.succeed();
})
  .padding(10) // The blast can destroy nearby items and mobs
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "triggerEvent", (test) => {
  const creeper = test.spawn("creeper", new BlockLocation(1, 2, 1));
  creeper.triggerEvent("minecraft:start_exploding_forced");

  test.succeedWhen(() => {
    test.assertEntityPresentInArea("creeper", false);
  });
})
  .structureName("ComponentTests:glass_cage")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "chat", (test) => {
  test.print("subscribing");

  const chatCallback = World.events.beforeChat.subscribe((eventData) => {
    if (eventData.message === "!killme") {
      eventData.sender.kill();
      eventData.cancel = true;
    } else if (eventData.message === "!players") {
      test.print(`There are ${eventData.targets.length} players in the server.`);
      for (const target of eventData.targets) {
        test.print("Player: " + target.name);
      }
    } else {
      eventData.message = `Modified '${eventData.message}'`;
    }
  });

  test
    .startSequence()
    .thenIdle(200)
    .thenExecute(() => {
      World.events.beforeChat.unsubscribe(chatCallback);
      test.print("unsubscribed");
    })
    .thenSucceed();
})
  .structureName("ComponentTests:platform")
  .maxTicks(1000)
  .tag(GameTest.Tags.suiteDisabled);

GameTest.register("APITests", "add_effect_event", (test) => {
  const villagerId = "minecraft:villager_v2<minecraft:ageable_grow_up>";
  const villager = test.spawn(villagerId, new BlockLocation(1, 2, 1));

  const effectAddCallback = World.events.effectAdd.subscribe((eventData) => {
    test.assert(eventData.entity.id === "minecraft:villager_v2", "Unexpected id");
    test.assert(eventData.effect.displayName === "Poison II", "Unexpected display name");
    test.assert(eventData.effectState === 1, "Unexpected effect state");
    test.succeed();
  });

  villager.addEffect(MinecraftEffectTypes.poison, 5, 1);
  World.events.effectAdd.unsubscribe(effectAddCallback);
})
  .structureName("ComponentTests:animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "piston", (test) => {
  const overworld = World.getDimension("overworld");
  const pistonLoc = new BlockLocation(1, 2, 1);
  const redstoneLoc = new BlockLocation(1, 2, 0);
  const pistonComp = overworld.getBlock(test.worldBlockLocation(pistonLoc)).getComponent("piston");

  test.assert(pistonComp != undefined, "Expected piston component");

  let assertPistonState = (isMoving, isExpanded, isExpanding, isRetracted, isRetracting) => {
    test.assert(pistonComp.isMoving === isMoving, "Unexpected isMoving");
    test.assert(pistonComp.isExpanded === isExpanded, "Unexpected isExpanded");
    test.assert(pistonComp.isExpanding === isExpanding, "Unexpected isExpanding");
    test.assert(pistonComp.isRetracted === isRetracted, "Unexpected isRetracted");
    test.assert(pistonComp.isRetracting === isRetracting, "Unexpected isRetracting");
  };

  test
    .startSequence()
    .thenExecute(() => {
      test.assert(pistonComp.attachedBlocks.length === 0, "Expected 0 attached blocks");
      assertPistonState(false, false, false, true, false); // isRetracted
      test.setBlockType(MinecraftBlockTypes.redstoneBlock, redstoneLoc);
    })
    .thenIdle(4)
    .thenExecute(() => {
      test.assert(pistonComp.attachedBlocks.length === 3, "Expected 3 attached blocks");
      assertPistonState(true, false, true, false, false); // isMoving, isExpanding
    })
    .thenIdle(2)
    .thenExecute(() => {
      assertPistonState(false, true, false, false, false); // isExpanded

      test.setBlockType(MinecraftBlockTypes.air, redstoneLoc);
    })
    .thenIdle(4)
    .thenExecute(() => {
      assertPistonState(true, false, false, false, true); // isMoving, isRetracting
    })
    .thenIdle(2)
    .thenExecute(() => {
      assertPistonState(false, false, false, true, false); // isRetracted
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "piston_event", (test) => {
  let expanded = false;
  let retracted = false;
  const redstoneLoc = new BlockLocation(1, 2, 0);
  const pistonLoc = new BlockLocation(1, 2, 1);
  const planksLoc = new BlockLocation(2, 2, 1);

  const pistonCallback = World.events.pistonActivate.subscribe((pistonEvent) => {
    test.assert(pistonEvent.piston !== undefined, "Expected piston");
    if (pistonEvent.piston.location.equals(test.worldBlockLocation(pistonLoc))) {
      if (pistonEvent.isExpanding) {
        expanded = true;
      } else {
        retracted = true;
      }
    }
  });

  test
    .startSequence()
    .thenExecute(() => {
      test.pulseRedstone(redstoneLoc, 2);
    })
    .thenExecuteAfter(8, () => {
      test.assertBlockPresent(MinecraftBlockTypes.air, planksLoc, true);
      test.assert(expanded, "Expected piston expanding event");
      test.assert(retracted, "Expected piston retracting event");
      World.events.beforePistonActivate.unsubscribe(pistonCallback);
    })
    .thenSucceed();
})
  .structureName("APITests:piston")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "piston_event_canceled", (test) => {
  let canceled = false;
  const redstoneLoc = new BlockLocation(1, 2, 0);
  const pistonLoc = new BlockLocation(1, 2, 1);
  const planksLoc = new BlockLocation(2, 2, 1);

  const pistonCallback = World.events.beforePistonActivate.subscribe((pistonEvent) => {
    test.assert(pistonEvent.piston !== undefined, "Expected piston");
    if (pistonEvent.piston.location.equals(test.worldBlockLocation(pistonLoc))) {
      pistonEvent.cancel = true;
      canceled = true;
    }
  });

  test
    .startSequence()
    .thenExecute(() => {
      test.pulseRedstone(redstoneLoc, 2);
    })
    .thenExecuteAfter(8, () => {
      test.assert(canceled, "Expected canceled beforePistonActivate event");
      test.assertBlockPresent(MinecraftBlockTypes.planks, planksLoc, true);
      World.events.beforePistonActivate.unsubscribe(pistonCallback);
    })
    .thenSucceed();
})
  .structureName("APITests:piston")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "sneaking", (test) => {
  const pigId = "minecraft:pig<minecraft:ageable_grow_up>";
  const pigLoc = new BlockLocation(1, 2, 1);
  const pig = test.spawn(pigId, pigLoc);
  pig.isSneaking = true;
  test
    .startSequence()
    .thenExecuteAfter(120, () => {
      test.assertEntityPresent(pigId, pigLoc, true);
    })
    .thenSucceed();
})
  .maxTicks(130)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "assert_can_reach_location", (test) => {
  const villagerId = "minecraft:villager_v2<minecraft:ageable_grow_up>";
  const villager1 = test.spawn(villagerId, new BlockLocation(1, 2, 1));
  const villager2 = test.spawn(villagerId, new BlockLocation(1, 2, 3));
  const villager3 = test.spawn(villagerId, new BlockLocation(1, 2, 5));
  test.assertCanReachLocation(villager1, new BlockLocation(4, 2, 1), true);
  test.assertCanReachLocation(villager2, new BlockLocation(4, 2, 3), false);
  test.assertCanReachLocation(villager3, new BlockLocation(4, 2, 5), false);
  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

const isLocationInTest = (test, worldLoc) => {
  const size = 4;
  let loc = test.relativeBlockLocation(worldLoc);
  return loc.x >= 0 && loc.y >= 0 && loc.z >= 0 && loc.x < size && loc.y < size && loc.z < size;
};

GameTest.register("APITests", "explosion_event", (test) => {
  let exploded = false;
  const cobblestoneLoc = new BlockLocation(1, 3, 1);
  const polishedAndesiteLoc = new BlockLocation(1, 1, 1);

  const beforeExplosionCallback = World.events.beforeExplosion.subscribe((explosionEvent) => {
    if (!isLocationInTest(test, explosionEvent.impactedBlocks[0])) return;
    test.assert(explosionEvent.dimension !== undefined, "Expected dimension");
    test.assert(explosionEvent.source !== undefined, "Expected source");
    test.assert(explosionEvent.impactedBlocks.length === 10, "Unexpected number of impacted blocks");
    test.assertBlockPresent(MinecraftBlockTypes.cobblestone, cobblestoneLoc, true);
    explosionEvent.impactedBlocks = [test.worldBlockLocation(cobblestoneLoc)];
  });

  const explosionCallback = World.events.explosion.subscribe((explosionEvent) => {
    test.assert(explosionEvent.dimension !== undefined, "Expected dimension");
    test.assert(explosionEvent.source !== undefined, "Expected source");
    test.assert(explosionEvent.impactedBlocks.length === 1, "Unexpected number of impacted blocks");
    exploded = true;
  });

  test
    .startSequence()
    .thenExecute(() => {
      test.setBlockType(MinecraftBlockTypes.cobblestone, cobblestoneLoc);
      test.spawn("tnt", new BlockLocation(1, 2, 1));
    })
    .thenExecuteAfter(85, () => {
      test.assert(exploded, "Expected explosion event");
      test.assertBlockPresent(MinecraftBlockTypes.stone, polishedAndesiteLoc, true);
      test.assertBlockPresent(MinecraftBlockTypes.cobblestone, cobblestoneLoc, false);
      World.events.beforeExplosion.unsubscribe(beforeExplosionCallback);
      World.events.explosion.unsubscribe(explosionCallback);
    })
    .thenSucceed();
})
  .padding(10) // The blast can destroy nearby items and mobs
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "explosion_event_canceled", (test) => {
  let canceled = false;
  const cobblestoneLoc = new BlockLocation(1, 3, 1);

  const explosionCallback = World.events.beforeExplosion.subscribe((explosionEvent) => {
    if (!isLocationInTest(test, explosionEvent.impactedBlocks[0])) return;
    test.assert(explosionEvent.dimension !== undefined, "Expected dimension");
    test.assert(explosionEvent.source !== undefined, "Expected source");
    test.assert(explosionEvent.impactedBlocks.length === 10, "Unexpected number of impacted blocks");
    explosionEvent.cancel = true;
    canceled = true;
  });

  test
    .startSequence()
    .thenExecute(() => {
      test.setBlockType(MinecraftBlockTypes.cobblestone, cobblestoneLoc);
      test.spawn("tnt", new BlockLocation(1, 2, 1));
    })
    .thenExecuteAfter(85, () => {
      test.assert(canceled, "Expected canceled beforeExplosionEvent event");
      test.assertBlockPresent(MinecraftBlockTypes.cobblestone, cobblestoneLoc, true);
      World.events.beforeExplosion.unsubscribe(explosionCallback);
    })
    .thenSucceed();
})
  .padding(10) // The blast can destroy nearby items and mobs
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "explode_block_event", (test) => {
  let explodedCount = 0;
  const cobblestoneLoc = new BlockLocation(1, 3, 1);

  const blockExplodeCallback = World.events.blockExplode.subscribe((blockExplodeEvent) => {
    if (!isLocationInTest(test, blockExplodeEvent.destroyedBlock.location)) return;
    test.assert(blockExplodeEvent.source !== undefined, "Expected source");
    explodedCount++;
  });

  test
    .startSequence()
    .thenExecute(() => {
      test.setBlockType(MinecraftBlockTypes.cobblestone, cobblestoneLoc);
      test.spawn("tnt", new BlockLocation(1, 2, 1));
    })
    .thenExecuteAfter(85, () => {
      test.assert(explodedCount === 10, "Unexpected number of exploded blocks");
      World.events.blockExplode.unsubscribe(blockExplodeCallback);
    })
    .thenSucceed();
})
  .padding(10) // The blast can destroy nearby items and mobs
  .structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "connectivity", (test) => {
  const centerLoc = new BlockLocation(1, 2, 1);

  let connectivity = test.getFenceConnectivity(centerLoc);

  test.assert(!connectivity.north, "The stair is not oriented the right way to connect");
  test.assert(connectivity.east, "Should connect to another fence");
  test.assert(connectivity.south, "Should connect to another fence");
  test.assert(connectivity.west, "Should connect to the back of the stairs");

  test.succeed();
})
  .rotateTest(true)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "spawn_at_location", (test) => {
  const spawnLoc = new Location(1.3, 2, 1.3);
  const chicken = test.spawnAtLocation("chicken", spawnLoc);

  test
    .startSequence()
    .thenExecute(() => {
      const chickenLoc = chicken.location;
      const relativeChickenLoc = test.relativeLocation(chickenLoc);
      test.assert(relativeChickenLoc.isNear(spawnLoc, 0.01), "Unexpected spawn location");
    })
    .thenSucceed();
})
  .structureName("ComponentTests:animal_pen")
  .rotateTest(true)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "walk_to_location", (test) => {
  const spawnLoc = new BlockLocation(1, 2, 1);
  const chicken = test.spawnWithoutBehaviors("chicken", spawnLoc);

  const targetLoc = new Location(2.2, 2, 3.2);
  test.walkToLocation(chicken, targetLoc, 1);

  test.succeedWhen(() => {
    const chickenLoc = chicken.location;
    const relativeChickenLoc = test.relativeLocation(chickenLoc);
    // Mobs will stop navigating as soon as they intersect the target location
    test.assert(relativeChickenLoc.isNear(targetLoc, 0.65), "Chicken did not reach the target location");
  });
})
  .structureName("ComponentTests:large_animal_pen")
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "spread_from_face_toward_direction", (test) => {
  let multifaceLoc = new BlockLocation(1, 4, 0);
  let spreadLoc = new BlockLocation(1, 3, 0);

  const glowLichenPermutation = MinecraftBlockTypes.glowLichen.createDefaultBlockPermutation();
  glowLichenPermutation.getProperty(BlockProperties.multiFaceDirectionBits).value = 1 << test.getTestDirection();
  test.setBlockPermutation(glowLichenPermutation, multifaceLoc);

  test.assertBlockPresent(MinecraftBlockTypes.glowLichen, multifaceLoc, true);
  test.assertBlockPresent(MinecraftBlockTypes.glowLichen, spreadLoc, false);

  test.spreadFromFaceTowardDirection(multifaceLoc, test.getTestDirection(), Direction.down);
  test
    .startSequence()
    .thenExecuteAfter(1, () => {
      test.assertBlockPresent(MinecraftBlockTypes.glowLichen, spreadLoc, true);
    })
    .thenSucceed();
})
  .rotateTest(true)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "rotate_direction", (test) => {
  test.assert(
    test.rotateDirection(Direction.south) == test.getTestDirection(),
    "Expected rotated south direction to match test direction"
  );

  switch (test.getTestDirection()) {
    case Direction.north:
      test.assert(
        test.rotateDirection(Direction.north) === Direction.south,
        "Unexpected rotated direction for Direction.north with testDirection Direction.north"
      );
      test.assert(
        test.rotateDirection(Direction.east) === Direction.west,
        "Unexpected rotated direction for Direction.east with testDirection Direction.north"
      );
      test.assert(
        test.rotateDirection(Direction.south) === Direction.north,
        "Unexpected rotated direction for Direction.south with testDirection Direction.north"
      );
      test.assert(
        test.rotateDirection(Direction.west) === Direction.east,
        "Unexpected rotated direction for Direction.west with testDirection Direction.north"
      );
      break;
    case Direction.east:
      test.assert(
        test.rotateDirection(Direction.north) === Direction.west,
        "Unexpected rotated direction for Direction.north with testDirection Direction.east"
      );
      test.assert(
        test.rotateDirection(Direction.east) === Direction.north,
        "Unexpected rotated direction for Direction.east with testDirection Direction.east"
      );
      test.assert(
        test.rotateDirection(Direction.south) === Direction.east,
        "Unexpected rotated direction for Direction.south with testDirection Direction.east"
      );
      test.assert(
        test.rotateDirection(Direction.west) === Direction.south,
        "Unexpected rotated direction for Direction.west with testDirection Direction.east"
      );
      break;
    case Direction.south:
      test.assert(
        test.rotateDirection(Direction.north) === Direction.north,
        "Unexpected rotated direction for Direction.north with testDirection Direction.south"
      );
      test.assert(
        test.rotateDirection(Direction.east) === Direction.east,
        "Unexpected rotated direction for Direction.east with testDirection Direction.south"
      );
      test.assert(
        test.rotateDirection(Direction.south) === Direction.south,
        "Unexpected rotated direction for Direction.south with testDirection Direction.south"
      );
      test.assert(
        test.rotateDirection(Direction.west) === Direction.west,
        "Unexpected rotated direction for Direction.west with testDirection Direction.south"
      );
      break;
    case Direction.west:
      test.assert(
        test.rotateDirection(Direction.north) === Direction.east,
        "Unexpected rotated direction for Direction.north with testDirection Direction.west"
      );
      test.assert(
        test.rotateDirection(Direction.east) === Direction.south,
        "Unexpected rotated direction for Direction.east with testDirection Direction.west"
      );
      test.assert(
        test.rotateDirection(Direction.south) === Direction.west,
        "Unexpected rotated direction for Direction.south with testDirection Direction.west"
      );
      test.assert(
        test.rotateDirection(Direction.west) === Direction.north,
        "Unexpected rotated direction for Direction.west with testDirection Direction.west"
      );
      break;
    default:
      test.assert(false, "Invalid test direction");
  }

  const buttonLoc = new BlockLocation(1, 2, 1);
  const buttonPermutation = MinecraftBlockTypes.stoneButton.createDefaultBlockPermutation();
  buttonPermutation.getProperty(BlockProperties.facingDirection).value = test.rotateDirection(Direction.north);
  test.setBlockPermutation(buttonPermutation, buttonLoc);

  test
    .startSequence()
    .thenExecuteAfter(2, () => {
      test.assertBlockPresent(MinecraftBlockTypes.stoneButton, buttonLoc, true);
    })
    .thenSucceed();
})
  .rotateTest(true)
  .tag(GameTest.Tags.suiteDefault);

function isNear(a, b) {
  return Math.abs(a - b) < 0.001;
}

GameTest.register("APITests", "cauldron", (test) => {
  const loc = new BlockLocation(0, 1, 0);
  var block = test.getBlock(loc);

  test.setFluidContainer(loc, GameTest.FluidType.water);
  test.assert(block.getComponent("waterContainer") != null, "This is a water container");
  test.assert(
    block.getComponent("lavaContainer") == null,
    "A water container should not have a lavaContainer component"
  );
  test.assert(
    block.getComponent("snowContainer") == null,
    "A water container should not have a snowContainer component"
  );
  test.assert(
    block.getComponent("potionContainer") == null,
    "A water container should not have a potionContainer component"
  );

  block.getComponent("waterContainer").fillLevel = FluidContainer.maxFillLevel;
  test.assert(
    block.getComponent("waterContainer").fillLevel == FluidContainer.maxFillLevel,
    "The fill level should match with what it was set to"
  );

  block.getComponent("waterContainer").customColor = new Color(1, 0, 0, 1);
  test.assert(block.getComponent("waterContainer").customColor.red == 1, "red component should be set");
  test.assert(block.getComponent("waterContainer").customColor.green == 0, "green component should be set");
  test.assert(block.getComponent("waterContainer").customColor.blue == 0, "blue component should be set");

  block.getComponent("waterContainer").addDye(MinecraftItemTypes.blueDye);
  test.assert(isNear(block.getComponent("waterContainer").customColor.red, 0.616), "red component should be set");
  test.assert(isNear(block.getComponent("waterContainer").customColor.green, 0.133), "green component should be set");
  test.assert(isNear(block.getComponent("waterContainer").customColor.blue, 0.333), "blue component should be set");

  test.setFluidContainer(loc, GameTest.FluidType.lava);
  test.assert(
    block.getComponent("waterContainer") == null,
    "A lava container should not have a waterContainer component"
  );
  test.assert(block.getComponent("lavaContainer") != null, "This is a lava component");
  test.assert(
    block.getComponent("snowContainer") == null,
    "A lava container should not have a snowContainer component"
  );
  test.assert(
    block.getComponent("potionContainer") == null,
    "A lava container should not have a potionContainer component"
  );

  test.setFluidContainer(loc, GameTest.FluidType.powderSnow);
  test.assert(
    block.getComponent("waterContainer") == null,
    "A snow container should not have a waterContainer component"
  );
  test.assert(
    block.getComponent("lavaContainer") == null,
    "A snow container should not have a lavaContainer component"
  );
  test.assert(block.getComponent("snowContainer") != null, "This is a snow container");
  test.assert(
    block.getComponent("potionContainer") == null,
    "A snow container should not have a potionContainer component"
  );

  test.setFluidContainer(loc, GameTest.FluidType.potion);
  test.assert(
    block.getComponent("snowContainer") == null,
    "A potion container should not have a waterContainer component"
  );
  test.assert(
    block.getComponent("lavaContainer") == null,
    "A potion container should not have a lavaContainer component"
  );
  test.assert(
    block.getComponent("snowContainer") == null,
    "A potion container should not have a snowContainer component"
  );
  test.assert(block.getComponent("potionContainer") != null, "This is a potion container");

  test.succeed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("APITests", "jukebox", (test) => {
  var jukeboxBlock = test.getBlock(new BlockLocation(0, 1, 0));
  var musicPlayerComp = jukeboxBlock.getComponent("recordPlayer");

  try {
    musicPlayerComp.setRecord(MinecraftItemTypes.apple);
    test.fail("An exception should be thrown when playing an item that is not a music disk");
  } catch (e) {}

  test.assert(musicPlayerComp.isPlaying() === false, "Should be stopped");
  musicPlayerComp.setRecord(MinecraftItemTypes.musicDiscMellohi);
  test.assert(musicPlayerComp.isPlaying() === true, "Should be playing");

  test
    .startSequence()
    .thenExecuteAfter(20, () => {
      test.assert(musicPlayerComp.isPlaying() === true, "Disk should not be finished yet");
      musicPlayerComp.clearRecord();
      test.assert(musicPlayerComp.isPlaying() === false, "Disk should be stopped now");
    })
    .thenSucceed();
})
  .maxTicks(25)
  .tag(GameTest.Tags.suiteDefault);
