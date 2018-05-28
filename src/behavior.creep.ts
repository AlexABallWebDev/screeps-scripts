/**
Gather from the nearest active source.
@param {Creep} creep
*/
export function gatherFromClosestSource(creep: Creep): void {
  let source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
  if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
    creep.moveTo(source, {
      visualizePathStyle: {
        stroke: '#ffaa00'
      }
    });
  }
}

/**
Returns the closest spawn or extension to the given creep.
@param {Creep} creep
*/
export function findClosestSpawnOrExtension(creep: Creep): StructureSpawn | StructureExtension {
  let target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
    filter: (structure) => {
      return (structure.structureType == STRUCTURE_EXTENSION ||
          structure.structureType == STRUCTURE_SPAWN) &&
        structure.energy < structure.energyCapacity;
    }
  }) as StructureSpawn | StructureExtension;

  return target;
}

/**
Sorts an array of targets by the given priority list (optional). isUnderAttack
can be used to give towers higher priority during an attack.
@param {Structure[]} targets
@param {boolean} isUnderAttack
@param {Object} priorities
*/
export function sortStructureEnergyDropoffTargets(targets: Structure[], isUnderAttack: boolean = false, priorities: any = {
  underAttackTower: 0,
  [STRUCTURE_SPAWN]: 1,
  [STRUCTURE_EXTENSION]: 2,
  [STRUCTURE_TOWER]: 3,
  [STRUCTURE_CONTAINER]: 4
}): Structure[] {
  let sortedTargets: Structure[] = _.sortBy(targets, function(target) {
    //if under attack, prioritize towers higher than other buildings.
    if (isUnderAttack && priorities[target.structureType] == priorities[STRUCTURE_TOWER]) {
      return priorities.underAttackTower as number;
    }
    return priorities[target.structureType] as number;
  });

  return sortedTargets;
}

/**
Drop off energy at a structure in the same room as the creep that is not full
of energy. Prioritizes spawns and extensions.
@param {Creep} creep
*/
export function dropOffEnergyAtNearbyStructure(creep: Creep): void {
  let targets = creep.room.find(FIND_STRUCTURES, {
    filter: (structure) => {
      // targets must be a building that is not at its energy capacity.
      if (structure.structureType == STRUCTURE_EXTENSION ||
        structure.structureType == STRUCTURE_SPAWN ||
        structure.structureType == STRUCTURE_TOWER) {
        return structure.energy < structure.energyCapacity;
      } else if (structure.structureType == STRUCTURE_CONTAINER) {
        return (structure.store && structure.store[RESOURCE_ENERGY] < structure.storeCapacity);
      } else {
        // This is not a building that we want to drop energy off at.
        return false;
      }
    }
  });

  if (targets.length > 0) {
    //prioritize targets with higher priorities at smaller indices
    let sortedTargets = sortStructureEnergyDropoffTargets(targets);
    let target = sortedTargets[0];

    //if a spawn/extension is found, target the closest one.
    if (target.structureType == STRUCTURE_SPAWN ||
      target.structureType == STRUCTURE_EXTENSION) {
      target = findClosestSpawnOrExtension(creep);
    }

    if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(target, {
        visualizePathStyle: {
          stroke: '#ffffff'
        }
      });
    }
  }
}

/**
Find the biggest dropped pile of energy in the room and return it.
@param {Creep} creep
*/
export function findBiggestEnergyPile(creep: Creep): Resource<RESOURCE_ENERGY> | undefined {
  // Filter to only find energy.
  let droppedResources: Resource<RESOURCE_ENERGY>[] = creep.room.find(FIND_DROPPED_RESOURCES, {
    filter: (resource) => {
      return resource.resourceType == RESOURCE_ENERGY
    }
  }) as Resource<RESOURCE_ENERGY>[];
  if (droppedResources.length) {
    // determine which pile of resources is biggest
    let biggestResource = droppedResources[0];
    if (droppedResources.length > 1) {
      for (let i = 1; i < droppedResources.length; i++) {
        if (droppedResources[i].amount > biggestResource.amount) {
          biggestResource = droppedResources[i];
        }
      }
    }

    return biggestResource;
  } else {
    return undefined;
  }
}

/**
Find the biggest dropped pile of energy in the room and pick it up.
@param {Creep} creep
*/
export function pickupBiggestEnergyPile(creep: Creep): void {
  let biggestResource = findBiggestEnergyPile(creep);
  if (biggestResource) {
    if (creep.pickup(biggestResource) == ERR_NOT_IN_RANGE) {
      creep.moveTo(biggestResource, {
        visualizePathStyle: {
          stroke: '#ffaa00'
        }
      });
    }
  }
}

/**
Upgrade this rooms controller.
@param {Creep} creep
*/
export function upgradeRoomController(creep: Creep): void {
  creep.upgradeController(creep.room.controller!);
  if (!creep.pos.isNearTo(creep.room.controller!)) {
    creep.moveTo(creep.room.controller!, {
      visualizePathStyle: {
        stroke: '#ffffff'
      }
    });
  }
}

/**
Retrieve energy from an upgrader container. If one is not found,
retrieve energy from spawn.
@param {Creep} creep
*/
export function retrieveEnergyForUpgrading(creep: Creep): void {
  let upContainer = getUpContainer(creep);
  if (upContainer) {
    if (creep.withdraw(upContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(upContainer, {
        visualizePathStyle: {
          stroke: '#ffaa00'
        }
      });
    } else {
      //if in range, but the upContainer pos is open, move to it.
      let upContainerCreeps = upContainer.pos.lookFor(LOOK_CREEPS);
      if (upContainerCreeps.length <= 0) {
        creep.moveTo(upContainer, {
          visualizePathStyle: {
            stroke: '#ffaa00'
          }
        });
      }
    }
  } else {
    //if not found, check for spawn and retrieve from there.
    let spawns = creep.room.find(FIND_MY_STRUCTURES, {
      filter: (structure) => {
        return structure.structureType == STRUCTURE_SPAWN;
      }
    });
    if (creep.withdraw(spawns[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(spawns[0], {
        visualizePathStyle: {
          stroke: '#ffaa00'
        }
      });
    }
  }
}

/**
returns the upContainer for the creep's room. If there is no upContainer,
returns 0.
@param {Creep} creep
*/
export function getUpContainer(creep: Creep): StructureContainer | undefined {
  let upContainerFlagPos = Memory.flags[creep.room.name + " upContainer"];
  if (upContainerFlagPos) {
    let lookResults = creep.room.lookForAt(LOOK_STRUCTURES,
      upContainerFlagPos.x,
      upContainerFlagPos.y);
    if (lookResults.length) {
      for (let i = 0; i < lookResults.length; i++) {
        if (lookResults[i].structureType == STRUCTURE_CONTAINER) {
          return lookResults[i] as StructureContainer;
        }
      }
    }
  }

  return undefined;
}

/**
Repair the upContainer. Note that this function does not move the creep towards
the upContainer.
@param {Creep} creep
*/
export function repairUpContainer(creep: Creep): void {
  let upContainer = getUpContainer(creep);
  if (upContainer && upContainer.hits < upContainer.hitsMax) {
    creep.repair(upContainer);
  }
}

/**
Signs the room controller with my sign.
@param {Creep} creep
*/
export function signRoomController(creep: Creep): void {
  let message = Memory.controllerSign;
  if (!message) {
    message = "";
  }

  if (creep.signController(creep.room.controller!, message) == ERR_NOT_IN_RANGE) {
    creep.moveTo(creep.room.controller!, {
      visualizePathStyle: {
        stroke: '#800080'
      }
    });
  }
}
