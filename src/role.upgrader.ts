import * as creepBehavior from "./behavior.creep";

export const roleUpgrader = {

  /** @param {Creep} creep **/
  run(creep: Creep) {

    if (creep.memory.upgrading && creep.carry.energy === 0) {
      creep.memory.upgrading = false;
      creep.say('refueling');
    }
    if (!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
      creep.memory.upgrading = true;
      creep.say('upgrading');
    }

    if (creep.memory.upgrading) {
      creepBehavior.upgradeRoomController(creep);
      creepBehavior.repairUpContainer(creep);
      if (!creep.room.controller!.sign || creep.room.controller!.sign!.text != Memory.controllerSign) {
        creepBehavior.signRoomController(creep);
      }
    } else {
      creepBehavior.retrieveEnergyForUpgrading(creep);
    }
  }
};
