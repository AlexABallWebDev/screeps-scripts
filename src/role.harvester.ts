const creepBehavior = require('./behavior.creep');

const roleHarvester = {

  /** @param {Creep} creep **/
  run: function(creep) {
    if (creep.memory.carting && creep.carry.energy === 0) {
      creep.memory.carting = false;
      creep.say('🌄 harvest');
    }

    if (!creep.memory.carting && creep.carry.energy == creep.carryCapacity) {
      creep.memory.carting = true;
      creep.say('🔄 carting');
    }

    if (!creep.memory.carting) {
      creepBehavior.gatherFromClosestSource(creep);
    } else {
      creepBehavior.dropOffEnergyAtNearbyStructure(creep);
    }
  }
};

module.exports = roleHarvester;
