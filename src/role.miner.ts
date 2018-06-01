import profiler from "screeps-profiler";

/**
 * Basic miner that takes advantage of being assigned to a source. Creeps of
 * this role will move to the source until they can gather from it, then
 * they will harvest until they die.
 */
const roleMiner = {
  /**
   * Runs role logic on the given creep.
   * @param {Creep} creep
   */
  run(creep: Creep) {
    const source = Game.getObjectById(creep.memory.assignedSourceId) as Source;
    if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
      creep.moveTo(source, {
        visualizePathStyle: {
          stroke: "#ffaa00"
        }
      });
    }
  }
};

profiler.registerObject(roleMiner, "role.miner");
export { roleMiner };
