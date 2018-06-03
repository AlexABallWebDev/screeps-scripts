import profiler from "screeps-profiler";

import { roomPositionFunctions } from "./roomPosition";

/**
 * Contains constants and methods that give Creeps commands / behavior.
 * These can be combined into roles that are assigned to Creeps.
 */
const creepBehavior = {
  /**
   * Gather from the closest active source to the given creep.
   * @param {Creep} creep
   */
  gatherFromClosestSource(creep: Creep): void {
    const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
    if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
      creep.moveTo(source, {
        visualizePathStyle: {
          stroke: "#ffaa00"
        }
      });
    }
  },

  /**
   * Returns the closest spawn or extension to the given creep.
   * @param {Creep} creep
   */
  findClosestSpawnOrExtension(creep: Creep): StructureSpawn | StructureExtension {
    const target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
      filter: (structure) => {
        return (structure.structureType === STRUCTURE_EXTENSION ||
            structure.structureType === STRUCTURE_SPAWN) &&
          structure.energy < structure.energyCapacity;
      }
    }) as StructureSpawn | StructureExtension;

    return target;
  },

  /**
   * Sorts an array of targets by the given priority list (optional). isUnderAttack
   * can be used to give towers higher priority during an attack.
   * @param {Structure[]} targets
   * @param {boolean} isUnderAttack
   * @param {Object} priorities
   */
  sortStructureEnergyDropoffTargets(targets: Structure[], isUnderAttack: boolean = false, priorities: any = {
    underAttackTower: 0,
    [STRUCTURE_SPAWN]: 1,
    [STRUCTURE_EXTENSION]: 2,
    [STRUCTURE_TOWER]: 3,
    [STRUCTURE_CONTAINER]: 4
  }): Structure[] {
    const sortedTargets: Structure[] = _.sortBy(targets, (target) => {
      // if under attack, prioritize towers higher than other buildings.
      if (isUnderAttack && priorities[target.structureType] === priorities[STRUCTURE_TOWER]) {
        return priorities.underAttackTower as number;
      }
      return priorities[target.structureType] as number;
    });

    return sortedTargets;
  },

  /**
   * Drop off energy at a structure in the same room as the creep that is not full
   * of energy. Prioritizes spawns and extensions.
   * @param {Creep} creep
   */
  dropOffEnergyAtNearbyStructure(creep: Creep): void {
    const targets = creep.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        // targets must be a building that is not at its energy capacity.
        if (structure.structureType === STRUCTURE_EXTENSION ||
          structure.structureType === STRUCTURE_SPAWN ||
          structure.structureType === STRUCTURE_TOWER) {
          return structure.energy < structure.energyCapacity;
        } else if (structure.structureType === STRUCTURE_CONTAINER) {
          return (structure.store && structure.store[RESOURCE_ENERGY] < structure.storeCapacity);
        } else {
          // This is not a building that we want to drop energy off at.
          return false;
        }
      }
    });

    if (targets.length > 0) {
      // prioritize targets with higher priorities at smaller indices
      const sortedTargets = this.sortStructureEnergyDropoffTargets(targets);
      let target = sortedTargets[0];

      // if a spawn/extension is found, target the closest one.
      if (target.structureType === STRUCTURE_SPAWN ||
        target.structureType === STRUCTURE_EXTENSION) {
        target = this.findClosestSpawnOrExtension(creep);
      }

      if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(target, {
          visualizePathStyle: {
            stroke: "#ffffff"
          }
        });
      }
    }
  },

  /**
   * Find the biggest dropped pile of energy in the room and return it.
   * @param {Creep} creep
   */
  findBiggestEnergyPile(creep: Creep): Resource<RESOURCE_ENERGY> | undefined {
    // Filter to only find energy.
    const droppedResources: Array<Resource<RESOURCE_ENERGY>> = creep.room.find(FIND_DROPPED_RESOURCES, {
      filter: (resource) => {
        return resource.resourceType === RESOURCE_ENERGY;
      }
    }) as Array<Resource<RESOURCE_ENERGY>>;
    if (droppedResources.length) {
      // determine which pile of resources is biggest
      let biggestResource = droppedResources[0];
      if (droppedResources.length > 1) {
        for (const droppedResourceIndex in droppedResources) {
          if (droppedResources[droppedResourceIndex].amount > biggestResource.amount) {
            biggestResource = droppedResources[droppedResourceIndex];
          }
        }
      }

      return biggestResource;
    } else {
      return undefined;
    }
  },

  /**
   * Find the tombstone with the most energy in the same room as the creep.
   * @param {Creep} creep
   */
  findTombstoneWithMostEnergy(creep: Creep): Tombstone | undefined {
    // Filter to only find energy.
    const tombstones: Tombstone[] = creep.room.find(FIND_TOMBSTONES, {
      filter: (tombstone) => {
        return tombstone.store[RESOURCE_ENERGY] !== 0;
      }
    });
    if (tombstones.length) {
      // determine which pile of resources is biggest
      let tombstoneWithMostEnergy = tombstones[0];
      if (tombstones.length > 1) {
        for (const tombstoneIndex in tombstones) {
          if (tombstones[tombstoneIndex].store[RESOURCE_ENERGY] > tombstoneWithMostEnergy.store[RESOURCE_ENERGY]) {
            tombstoneWithMostEnergy = tombstones[tombstoneIndex];
          }
        }
      }

      return tombstoneWithMostEnergy;
    } else {
      return undefined;
    }
  },

  /**
   * Find the biggest dropped pile of energy in the room and pick it up.
   * @param {Creep} creep
   */
  pickupBiggestEnergyPile(creep: Creep): void {
    const biggestResource = this.findBiggestEnergyPile(creep);
    if (biggestResource) {
      if (creep.pickup(biggestResource) === ERR_NOT_IN_RANGE) {
        creep.moveTo(biggestResource, {
          visualizePathStyle: {
            stroke: "#ffaa00"
          }
        });
      }
    }
  },

  /**
   * Upgrade this rooms controller.
   * @param {Creep} creep
   */
  upgradeRoomController(creep: Creep): void {
    creep.upgradeController(creep.room.controller!);
    if (!creep.pos.isNearTo(creep.room.controller!)) {
      creep.moveTo(creep.room.controller!, {
        visualizePathStyle: {
          stroke: "#ffffff"
        }
      });
    }
  },

  /**
   * Retrieve energy from an upgrader container. If one is not found,
   * retrieve energy from spawn.
   * @param {Creep} creep
   */
  retrieveEnergyForUpgrading(creep: Creep): void {
    const upContainer = this.getUpContainer(creep);
    if (upContainer) {
      if (creep.withdraw(upContainer, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(upContainer, {
          visualizePathStyle: {
            stroke: "#ffaa00"
          }
        });
      } else {
        // if in range, but the upContainer pos is open, move to it.
        const upContainerCreeps = upContainer.pos.lookFor(LOOK_CREEPS);
        if (upContainerCreeps.length <= 0) {
          creep.moveTo(upContainer, {
            visualizePathStyle: {
              stroke: "#ffaa00"
            }
          });
        }
      }
    } else {
      // if upContainer not found, check for spawn and retrieve from there.
      const spawns = creep.room.find(FIND_MY_SPAWNS);
      // Only take energy from spawn if there is excess.
      if (creep.room.energyAvailable + BODYPART_COST[MOVE] >=
        creep.room.energyCapacityAvailable) {
        if (creep.withdraw(spawns[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(spawns[0], {
            visualizePathStyle: {
              stroke: "#ffaa00"
            }
          });
        }
      } else {
        // If there is not enough energy in the spawn, stay away to reduce congestion.
        this.stayAtRange(creep, spawns[0].pos, 3);
      }
    }
  },

  /**
   * The creep will move towards the target, but will move away if it is
   * within range of the target.
   * @param {Creep} creep
   * @param {RoomPosition} target
   * @param {number} range
   */
  stayAtRange(creep: Creep, target: RoomPosition, range: number): void {
    const distanceFromSpawn = creep.pos.getRangeTo(target);
    if (distanceFromSpawn < range) {
      const towardsSpawn = creep.pos.getDirectionTo(target);
      creep.move(roomPositionFunctions.reverseDirection(towardsSpawn));
    } else if (distanceFromSpawn > range) {
      creep.moveTo(target, {
        visualizePathStyle: {
          stroke: "#ffffff"
        }
      });
    }
  },

  /**
   * returns the upContainer for the creep's room. If there is no upContainer,
   * returns undefined.
   * @param {Creep} creep
   */
  getUpContainer(creep: Creep): StructureContainer | undefined {
    const upContainerFlag = Game.flags[creep.room.name + " upContainer"];
    if (upContainerFlag) {
      const lookResults = upContainerFlag.pos.lookFor(LOOK_STRUCTURES);
      if (lookResults.length) {
        for (const lookResult of lookResults) {
          if (lookResult.structureType === STRUCTURE_CONTAINER) {
            return lookResult as StructureContainer;
          }
        }
      }
    }

    return undefined;
  },

  /**
   * Repair the upContainer in the creep's room. Note that this function does
   * not move the creep towards the upContainer.
   * @param {Creep} creep
   */
  repairUpContainer(creep: Creep): void {
    const upContainer = this.getUpContainer(creep);
    if (upContainer && upContainer.hits < upContainer.hitsMax) {
      creep.repair(upContainer);
    }
  },

  /**
   * Signs the creep's room's controller with my sign.
   * @param {Creep} creep
   */
  signRoomController(creep: Creep, message: string): void {
    if (creep.signController(creep.room.controller!, message) === ERR_NOT_IN_RANGE) {
      creep.moveTo(creep.room.controller!, {
        visualizePathStyle: {
          stroke: "#800080"
        }
      });
    }
  }
};

profiler.registerObject(creepBehavior, "behavior.creep");
export { creepBehavior };
