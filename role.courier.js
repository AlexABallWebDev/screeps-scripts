const creepBehavior = require('behavior.creep');

const roleCourier = {

  /** @param {Creep} creep **/
  run: function(creep) {
    if (creep.carry.energy < creep.carryCapacity) {
      creepBehavior.pickupBiggestEnergyPile(creep);
    } else {
      creepBehavior.dropOffEnergyAtClosestStructure(creep);
    }
  }
};

module.exports = roleCourier;
