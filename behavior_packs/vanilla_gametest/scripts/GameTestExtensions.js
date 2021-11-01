export default class GameTestExtensions {
  constructor(test) {
    this.test = test;
  }

  addEntityInBoat(entityType, blockLoc) {
    const boat = this.test.spawn("boat", blockLoc);
    this.test.assert(boat !== undefined, "Failed to spawn boat");
    const rider = this.test.spawn(entityType, blockLoc);
    this.test.assert(rider !== undefined, "Failed to spawn rider");
    const boatRideableComp = boat.getComponent("rideable");
    this.test.assert(boatRideableComp !== undefined, "Boat missing rideable component");
    this.test.assert(boatRideableComp.addRider(rider), "Failed to add rider");
    return rider;
  }

  makeAboutToDrown(entity) {
    this.test.assert(entity !== undefined, "Expected entity");
    const healthComp = entity.getComponent("health");
    this.test.assert(healthComp !== undefined, "Entity missing health component");
    const breathableComp = entity.getComponent("breathable");
    this.test.assert(breathableComp !== undefined, "Entity missing breathable component");
    healthComp.setCurrent(1);
    breathableComp.setAirSupply(0);
  }

  assertBlockProperty(propertyName, value, blockLocation) {
    this.test.assertBlockState(blockLocation, (block) => {
      return block.permutation.getProperty(propertyName).value == value;
    });
  }
}
