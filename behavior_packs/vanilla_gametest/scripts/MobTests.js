import * as GameTest from "mojang-gametest";
import GameTestExtensions from "./GameTestExtensions.js";

import { BlockLocation, MinecraftEffectTypes, MinecraftBlockTypes } from "mojang-minecraft";

const TicksPerSecond = 20;

GameTest.register("MobTests", "zombie_burn", (test) => {
  const zombieEntityType = "minecraft:zombie";
  const zombiePosition = new BlockLocation(1, 2, 1);

  test.succeedWhenEntityPresent(zombieEntityType, zombiePosition, false);
})
  .maxTicks(TicksPerSecond * 30)
  .tag(GameTest.Tags.suiteDefault)
  .batch("day");

GameTest.register("MobTests", "effect_durations_longer_first", (test) => {
  const testEx = new GameTestExtensions(test);
  const villagerId = "minecraft:villager_v2";
  const villagerPos = new BlockLocation(1, 2, 1);
  const buttonPos = new BlockLocation(1, 4, 0);
  const strongPotion = new BlockLocation(0, 4, 0);
  const weakPotion = new BlockLocation(2, 4, 0);
  const strongPotionDuration = TicksPerSecond * 16;

  test.spawn(villagerId, villagerPos);

  test
    .startSequence()
    .thenExecute(() => test.setBlockType(MinecraftBlockTypes.air, weakPotion))
    .thenExecuteAfter(4, () => test.pressButton(buttonPos))
    .thenWait(() => testEx.assertBlockProperty("button_pressed_bit", 0, buttonPos))
    .thenExecute(() => test.setBlockType(MinecraftBlockTypes.air, strongPotion))
    .thenExecuteAfter(4, () => test.pressButton(buttonPos))
    .thenIdle(strongPotionDuration)
    .thenWait(() => {
      test.assertEntityState(
        villagerPos,
        villagerId,
        (entity) => entity.getEffect(MinecraftEffectTypes.regeneration).amplifier == 0
      ); // Strength level I
      test.assertEntityState(
        villagerPos,
        villagerId,
        (entity) => entity.getEffect(MinecraftEffectTypes.regeneration).duration > TicksPerSecond * 10
      );
    })
    .thenSucceed();
})
  .structureName("MobTests:effect_durations")
  .maxTicks(400)
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); // Weak potion duration is 33 seconds, strong is 16. After the strong potion expires the weak potion effect should have time remaining

GameTest.register("MobTests", "drowning_test", (test) => {
  const villagerEntitySpawnType = "minecraft:villager_v2";
  const pigSpawnType = "minecraft:pig";

  test.spawn(villagerEntitySpawnType, new BlockLocation(3, 2, 2));
  test.spawn(pigSpawnType, new BlockLocation(3, 2, 4));
  test.succeedWhen(() => {
    test.assertEntityPresentInArea(pigSpawnType, false);
    test.assertEntityPresentInArea(villagerEntitySpawnType, false);
  });
})
  .maxTicks(TicksPerSecond * 45)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("MobTests", "golem_vs_pillager", (test) => {
  const ironGolem = "minecraft:iron_golem";
  const pillager = "minecraft:pillager";
  const ironGolemPos = new BlockLocation(3, 2, 3);
  const pillagerPos = new BlockLocation(3, 2, 4);

  test.spawn(ironGolem, ironGolemPos);
  test.spawn(pillager, pillagerPos);

  test.succeedWhen(() => {
    test.assertEntityPresent(pillager, ironGolemPos, false);
    test.assertEntityPresent(ironGolem, pillagerPos, true);
  });
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MobTests", "effect_durations_stronger_first", (test) => {
  const testEx = new GameTestExtensions(test);
  const villagerId = "minecraft:villager_v2";
  const villagerPos = new BlockLocation(1, 2, 1);
  const buttonPos = new BlockLocation(1, 4, 0);
  const strongPotion = new BlockLocation(0, 4, 0);
  const weakPotion = new BlockLocation(2, 4, 0);
  const strongPotionDuration = TicksPerSecond * 16;

  test.spawn(villagerId, villagerPos);

  test
    .startSequence()
    .thenExecute(() => test.setBlockType(MinecraftBlockTypes.air, strongPotion))
    .thenExecuteAfter(4, () => test.pressButton(buttonPos))
    .thenWait(() => testEx.assertBlockProperty("button_pressed_bit", 0, buttonPos))
    .thenExecute(() => test.setBlockType(MinecraftBlockTypes.air, weakPotion))
    .thenExecuteAfter(4, () => test.pressButton(buttonPos))
    .thenIdle(strongPotionDuration)
    .thenWait(() => {
      test.assertEntityState(
        villagerPos,
        villagerId,
        (entity) => entity.getEffect(MinecraftEffectTypes.regeneration).amplifier == 0
      ); // Strength level I
      test.assertEntityState(
        villagerPos,
        villagerId,
        (entity) => entity.getEffect(MinecraftEffectTypes.regeneration).duration > TicksPerSecond * 10
      );
    })
    .thenSucceed();
})
  .structureName("MobTests:effect_durations")
  .maxTicks(400)
  .tag("suite:java_parity")
  .tag(GameTest.Tags.suiteDisabled); // Weak potion duration is 33 seconds, strong is 16. After the strong potion expires the weak potion effect should have time remaining

GameTest.register("MobTests", "silverfish_no_suffocate", (test) => {
  const silverfishPos = new BlockLocation(1, 2, 1);
  const silverfish = "minecraft:silverfish";

  test
    .startSequence()
    .thenExecute(() => test.assertEntityHasComponent(silverfish, "minecraft:health", silverfishPos, true))
    .thenIdle(40)
    .thenExecute(() => test.assertEntityHasComponent(silverfish, "minecraft:health", silverfishPos, true))
    .thenSucceed();
  test
    .startSequence()
    .thenWait(() => test.assertEntityPresent(silverfish, silverfishPos, false))
    .thenFail("Silverfish died");
})
  .maxTicks(TicksPerSecond * 30)
  .required(false)
  .tag(GameTest.Tags.suiteDefault);

GameTest.register("MobTests", "small_mobs_keep_head_above_water", (test) => {
  const testEx = new GameTestExtensions(test);
  const swimmerPos = new BlockLocation(1, 3, 1); //When the silverfish is produced at (1, 2, 1), the silverfish is stuck in the glass below and dies, so the y-axis goes up one frame
  const swimmer = test.spawn("minecraft:silverfish", swimmerPos);

  const drownerPos = new BlockLocation(5, 2, 1);
  const drowner = test.spawn("minecraft:silverfish", drownerPos);

  testEx.makeAboutToDrown(swimmer);
  testEx.makeAboutToDrown(drowner);

  test
    .startSequence()
    .thenWaitAfter(40, () => {
      test.assertEntityPresent("minecraft:silverfish", swimmerPos, true);
      test.assertEntityPresent("minecraft:silverfish", drownerPos, false);
    })
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);

GameTest.register("MobTests", "small_mobs_breathe_in_boats", (test) => {
  const testEx = new GameTestExtensions(test);
  const catPos = new BlockLocation(2, 3, 2);
  const cat = testEx.addEntityInBoat("minecraft:cat", catPos);
  testEx.makeAboutToDrown(cat);

  const silverfishPos = new BlockLocation(4, 3, 2);
  const silverfish = testEx.addEntityInBoat("minecraft:silverfish", silverfishPos);
  testEx.makeAboutToDrown(silverfish);

  const underWaterPos = new BlockLocation(6, 2, 2);
  const silverfish2 = testEx.addEntityInBoat("minecraft:silverfish", underWaterPos);
  testEx.makeAboutToDrown(silverfish2);

  test
    .startSequence()
    .thenIdle(40)
    .thenExecute(() => test.assertEntityPresent("minecraft:cat", catPos, true))
    .thenExecute(() => test.assertEntityPresent("minecraft:silverfish", silverfishPos, true))
    .thenExecute(() => test.assertEntityPresent("minecraft:silverfish", underWaterPos, false))
    .thenSucceed();
}).tag(GameTest.Tags.suiteDefault);
