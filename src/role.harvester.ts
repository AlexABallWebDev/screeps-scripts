import * as creepBehavior from "./behavior.creep";

export const roleHarvester = {

  /** @param {Creep} creep **/
  run(creep: Creep) {
    if (creep.memory.carting && creep.carry.energy === 0) {
      creep.memory.carting = false;
      creep.say('harvesting');
    }

    if (!creep.memory.carting && creep.carry.energy == creep.carryCapacity) {
      creep.memory.carting = true;
      creep.say('carting');
    }

    if (!creep.memory.carting) {
      creepBehavior.gatherFromClosestSource(creep);
    } else {
      creepBehavior.dropOffEnergyAtNearbyStructure(creep);
    }
  }
};
