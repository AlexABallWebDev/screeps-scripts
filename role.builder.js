const creepBehavior = require('behavior.creep');

const roleBuilder = {

  /** @param {Creep} creep **/
  run: function(creep) {

    if (creep.memory.building && creep.carry.energy === 0) {
      creep.memory.building = false;
      creep.say('🔄 refuel');
    }
    if (!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
      creep.memory.building = true;
      creep.say('🚧 build');
    }

    if (creep.memory.building) {
      let targets = creep.room.find(FIND_CONSTRUCTION_SITES);
      if (targets.length) {
        let closestToFinished = targets[0];
        if (targets.length > 1) {
          for (let i = 1; i < targets.length; i++) {
            if (targets[i].progress > closestToFinished.progress) {
              closestToFinished = targets[i];
            }
          }
        }
        if (creep.build(closestToFinished) == ERR_NOT_IN_RANGE) {
          creep.moveTo(closestToFinished, {
            visualizePathStyle: {
              stroke: '#ffffff'
            }
          });
        }
      } else {
        creepBehavior.upgradeRoomController(creep);
        creepBehavior.repairUpContainer(creep);
      }
    } else {
      creepBehavior.retrieveEnergyForUpgrading(creep);
    }
  }
};

module.exports = roleBuilder;
