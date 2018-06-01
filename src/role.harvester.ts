import profiler from "screeps-profiler";
import { creepBehavior } from "./behavior.creep";

/**
 * Basic harvester that will gather from the closest source to this creep,
 * then return the energy to a nearby structure.
 */
const roleHarvester = {
  /**
   * Runs role logic on the given creep.
   * @param {Creep} creep
   */
  run(creep: Creep) {
    if (creep.memory.carting && creep.carry.energy === 0) {
      creep.memory.carting = false;
      creep.say("harvesting");
    }

    if (!creep.memory.carting && creep.carry.energy === creep.carryCapacity) {
      creep.memory.carting = true;
      creep.say("carting");
    }

    if (!creep.memory.carting) {
      creepBehavior.gatherFromClosestSource(creep);
    } else {
      creepBehavior.dropOffEnergyAtNearbyStructure(creep);
    }
  }
};

profiler.registerObject(roleHarvester, "role.harvester");
export { roleHarvester };
