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

      // logic for deciding when to pick up energy from storage.
      // count energy from all energy piles in this room.
      const energyPiles = creep.room.find(FIND_DROPPED_RESOURCES, {
        filter: (drop) => drop.resourceType === RESOURCE_ENERGY
      });
      let pileEnergyCount = 0;
      for (const pile of energyPiles) {
        pileEnergyCount += pile.amount;
      }

      // If it is smaller than carry capacity or the scarcity limit (500 per source in the room)
      // and there is energy in the storage, then take from storage.
      const scarcityLimit = 500 * creep.room.find(FIND_SOURCES).length;
      if (pileEnergyCount < Math.min(creep.carryCapacity, scarcityLimit)) {
        // Prioritize tombstones over storage if we are not under attack.
        if (creep.room.find(FIND_HOSTILE_CREEPS).length === 0) {
          const tombstone = creepBehavior.findTombstoneWithMostEnergy(creep);
          if (tombstone) {
            if (creep.withdraw(tombstone, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
              creep.moveTo(tombstone, {
                visualizePathStyle: {
                  stroke: "#ffaa00"
                }
              });
            }
            return;
          }
        }

        // Only take from storage if it exists and there is energy in it.
        const storage = creepBehavior.getStorage(creep);
        if (storage && storage.store[RESOURCE_ENERGY] > 0) {
          if (creep.withdraw(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(storage, {
              visualizePathStyle: {
                stroke: "#ffaa00"
              }
            });
          }
        }
      } else {
        // logic for picking up resources off the ground (piles or tombstones).
        const targetResource = creepBehavior.getBiggestEnergyPileOrTombstone(creep, creep.memory.targetResource);
        if (targetResource === undefined) {
          creep.memory.targetResource = undefined;
        }

        // If there is a target resource, retrieve energy from it.
        if (targetResource) {
          // save the target's id so we can reuse it.
          creep.memory.targetResource = targetResource.id;

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
      }
    } else {
      // if creep.memory.carting
      creepBehavior.dropOffEnergyAtNearbyStructure(creep);
    }
  }
};

profiler.registerObject(roleCourier, "role.courier");
export { roleCourier };
