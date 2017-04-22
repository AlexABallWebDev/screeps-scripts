let roleCourier = {

  /** @param {Creep} creep **/
  run: function(creep) {
    if (creep.carry.energy < creep.carryCapacity) {
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
    } else {
      let targets = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          return (structure.structureType == STRUCTURE_EXTENSION ||
            structure.structureType == STRUCTURE_SPAWN ||
            structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
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
  }
};

module.exports = roleCourier;
