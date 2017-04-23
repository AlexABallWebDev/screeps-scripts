const creepBehavior = require('behavior.creep');

const roleHarvester = {

  /** @param {Creep} creep **/
  run: function(creep) {
    if (creep.carry.energy < creep.carryCapacity) {
      creepBehavior.gatherFromClosestSource(creep);
    } else {
      creepBehavior.dropOffEnergyAtNearbyStructure(creep);
    }
  }
};

module.exports = roleHarvester;
