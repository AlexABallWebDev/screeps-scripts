import profiler from "screeps-profiler";
import { creepBehavior } from "./behavior.creep";

/**
 * Couriers pick up energy piles in their room and returns them to energy
 * using structures in that room.
 */
const roleCourier = {
  /**
   * Runs role logic on the given creep.
   * @param {Creep} creep
   */
  run(creep: Creep) {
    if (creep.memory.carting && creep.carry.energy === 0) {
      creep.memory.carting = false;
      creep.say("looting");
    }

    if (!creep.memory.carting && creep.carry.energy === creep.carryCapacity) {
      creep.memory.carting = true;
      creep.memory.targetResource = undefined;
      creep.say("carting");
    }

    if (!creep.memory.carting) {
      let targetResource = Game.getObjectById(creep.memory.targetResource) as Resource;

      // if this creep does not have a target resource in memory, find the biggest
      // energy pile and place it in memory.
      if (!targetResource) {
        const biggestResource = creepBehavior.findBiggestEnergyPile(creep);
        if (biggestResource) {
          creep.memory.targetResource = biggestResource.id;
          targetResource = biggestResource;
        }
      }

      if (targetResource) {
        if (creep.pickup(targetResource) === ERR_NOT_IN_RANGE) {
          creep.moveTo(targetResource, {
            visualizePathStyle: {
              stroke: "#ffaa00"
            }
          });
        }
      }
    } else {
      creepBehavior.dropOffEnergyAtNearbyStructure(creep);
    }
  }
};

profiler.registerObject(roleCourier, "role.courier");
export { roleCourier };
