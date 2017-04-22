/**
Gather from the nearest source.
@param {Creep} creep
*/
function gatherFromClosestSource(creep) {
  var sources = creep.room.find(FIND_SOURCES);
  if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
    creep.moveTo(sources[0], {
      visualizePathStyle: {
        stroke: '#ffaa00'
      }
    });
  }
}

/**
Drop off energy at the closest structure that is not full of energy.
@param {Creep} creep
*/
function dropOffEnergyAtClosestStructure(creep) {
  var targets = creep.room.find(FIND_STRUCTURES, {
    filter: (structure) => {
      return (structure.structureType == STRUCTURE_EXTENSION ||
          structure.structureType == STRUCTURE_SPAWN ||
          structure.structureType == STRUCTURE_TOWER) &&
        structure.energy < structure.energyCapacity;
    }
  });
  if (targets.length > 0) {
    if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(targets[0], {
        visualizePathStyle: {
          stroke: '#ffffff'
        }
      });
    }
  }
}

/**
Find the biggest dropped pile of energy in the room and pick it up.
@param {Creep} creep
*/
function pickupBiggestEnergyPile(creep) {
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
        if (droppedResources[i].amount > biggestResource) {
          biggestResource = droppedResources[i];
        }
      }
    }
    if (creep.pickup(biggestResource) == ERR_NOT_IN_RANGE) {
      creep.moveTo(biggestResource);
    }
  }
}

/**
Upgrade this rooms controller.
@param {Creep} creep
*/
function upgradeRoomController(creep) {
  if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
    creep.moveTo(creep.room.controller, {
      visualizePathStyle: {
        stroke: '#ffffff'
      }
    });
  }
}

module.exports = {
  gatherFromClosestSource,
  dropOffEnergyAtClosestStructure,
  pickupBiggestEnergyPile,
  upgradeRoomController
};
