/**
Gather from the nearest active source.
@param {Creep} creep
*/
function gatherFromClosestSource(creep) {
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
function findClosestSpawnOrExtension(creep) {
  let target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
    filter: (structure) => {
      return (structure.structureType == STRUCTURE_EXTENSION ||
          structure.structureType == STRUCTURE_SPAWN) &&
        structure.energy < structure.energyCapacity;
    }
  });

  return target;
}

/**
Drop off energy at a structure that is not full of energy. Prioritizes spawns
and extensions.
@param {Creep} creep
*/
function dropOffEnergyAtNearbyStructure(creep) {
  let targets = creep.room.find(FIND_STRUCTURES, {
    filter: (structure) => {
      return (structure.structureType == STRUCTURE_EXTENSION ||
          structure.structureType == STRUCTURE_SPAWN ||
          structure.structureType == STRUCTURE_TOWER ||
          structure.structureType == STRUCTURE_CONTAINER) &&
        structure.energy < structure.energyCapacity ||
        (structure.store && structure.store[RESOURCE_ENERGY] < structure.storeCapacity);
    }
  });

  if (targets.length > 0) {
    let target = targets[0];
    //prioritize spawns and extensions
    for (let i = 1; i < targets.length; i++) {
      //if a spawn/extension is found, target the closest one.
      if (targets[i].structureType == STRUCTURE_SPAWN ||
        targets[i].structureType == STRUCTURE_EXTENSION) {
        target = findClosestSpawnOrExtension(creep);
        break;
      }
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
function findBiggestResourcePile(creep) {
  let droppedResources = creep.room.find(FIND_DROPPED_RESOURCES, {
    filter: {
      resourceType: RESOURCE_ENERGY
    }
  });
  if (droppedResources.length) {
    //determine which pile of resources is biggest
    let biggestResource = droppedResources[0];
    if (droppedResources.length > 1) {
      for (let i = 1; i < droppedResources.length; i++) {
        if (droppedResources[i].amount > biggestResource.amount) {
          biggestResource = droppedResources[i];
        }
      }
    }

    return biggestResource;
  }
}

/**
Find the biggest dropped pile of energy in the room and pick it up.
@param {Creep} creep
*/
function pickupBiggestEnergyPile(creep) {
  let biggestResource = findBiggestResourcePile(creep);
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
function upgradeRoomController(creep) {
  creep.upgradeController(creep.room.controller);
  if (!creep.pos.isNearTo(creep.room.controller)) {
    creep.moveTo(creep.room.controller, {
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
function retrieveEnergyForUpgrading(creep) {
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
      filter: {
        structureType: STRUCTURE_SPAWN
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
function getUpContainer(creep) {
  let upContainerFlagPos = Memory.flags[creep.room.name + " upContainer"];
  if (upContainerFlagPos) {
    let lookResults = creep.room.lookForAt(LOOK_STRUCTURES,
      upContainerFlagPos.x,
      upContainerFlagPos.y);
    if (lookResults.length) {
      for (let i = 0; i < lookResults.length; i++) {
        if (lookResults[i].structureType == STRUCTURE_CONTAINER) {
          return lookResults[i];
        }
      }
    }
  }

  return 0;
}

/**
Repair the upContainer. Note that this function does not move the creep towards
the upContainer.
@param {Creep} creep
*/
function repairUpContainer(creep) {
  let upContainer = getUpContainer(creep);
  if (upContainer && upContainer.hits < upContainer.hitsMax) {
    creep.repair(upContainer);
  }
}

/**
Signs the room controller with my sign.
@param {Creep} creep
*/
function signRoomController(creep) {
  let message = Memory.controllerSign;
  if (!message) {
    message = "";
  }

  if (creep.signController(creep.room.controller, message) == ERR_NOT_IN_RANGE) {
    creep.moveTo(creep.room.controller, {
      visualizePathStyle: {
        stroke: '#800080'
      }
    });
  }
}

module.exports = {
  gatherFromClosestSource,
  findClosestSpawnOrExtension,
  dropOffEnergyAtNearbyStructure,
  findBiggestResourcePile,
  pickupBiggestEnergyPile,
  upgradeRoomController,
  retrieveEnergyForUpgrading,
  getUpContainer,
  repairUpContainer,
  signRoomController
};
