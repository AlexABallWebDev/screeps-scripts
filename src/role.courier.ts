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
      let targetResource = Game.getObjectById(creep.memory.targetResource) as Resource | Tombstone | undefined;

      // check if there is any energy in the target resource pile or tombstone.
      // if not, unset targetResource so that a new target can be found.
      if (targetResource &&
        targetResource instanceof Tombstone &&
        targetResource.store &&
        targetResource.store[RESOURCE_ENERGY] === 0) {
          targetResource = undefined;
          creep.memory.targetResource = undefined;
      }

      // if this creep does not have a target resource in memory, find the biggest
      // energy pile and place it in memory.
      if (!targetResource) {
        // check for tombstones that contain energy and check for energy piles.
        const tombstoneWithMostEnergy = creepBehavior.findTombstoneWithMostEnergy(creep);
        const biggestResource = creepBehavior.findBiggestEnergyPile(creep);

        // if both tombstones and energy piles are in the room, target the one
        // with the most energy.
        if (tombstoneWithMostEnergy && biggestResource) {
          if (tombstoneWithMostEnergy.store[RESOURCE_ENERGY] > biggestResource.amount) {
            creep.memory.targetResource = tombstoneWithMostEnergy.id;
            targetResource = tombstoneWithMostEnergy;
          } else {
            creep.memory.targetResource = biggestResource.id;
            targetResource = biggestResource;
          }
        } else if (tombstoneWithMostEnergy) {
          creep.memory.targetResource = tombstoneWithMostEnergy.id;
          targetResource = tombstoneWithMostEnergy;
        } else if (biggestResource) {
          creep.memory.targetResource = biggestResource.id;
          targetResource = biggestResource;
        }
      }

      // If there is a target resource, retrieve energy from it.
      if (targetResource) {
        // If the resource is a Tombstone, use the withdraw method.
        if (targetResource instanceof Tombstone) {
          if (creep.withdraw(targetResource, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(targetResource, {
              visualizePathStyle: {
                stroke: "#ffaa00"
              }
            });
          }
        } else {
          // If the resource is a resource pile, use the pickup method.
          if (creep.pickup(targetResource) === ERR_NOT_IN_RANGE) {
            creep.moveTo(targetResource, {
              visualizePathStyle: {
                stroke: "#ffaa00"
              }
            });
          }
        }
      }
    } else {
      creepBehavior.dropOffEnergyAtNearbyStructure(creep);
    }
  }
};

profiler.registerObject(roleCourier, "role.courier");
export { roleCourier };
