import { creepBehavior } from "./behavior.creep";

/**
 * Upgraders move to their room's upContainer, take energy from it, then
 * continuously upgrade their room's controller. They also repair the
 * upContainer and sign the room controller.
 */
export const roleUpgrader = {
  /**
   * Runs role logic on the given creep.
   * @param {Creep} creep
   */
  run(creep: Creep) {

    if (creep.memory.upgrading && creep.carry.energy === 0) {
      creep.memory.upgrading = false;
      creep.say("refueling");
    }
    if (!creep.memory.upgrading && creep.carry.energy === creep.carryCapacity) {
      creep.memory.upgrading = true;
      creep.say("upgrading");
    }

    if (creep.memory.upgrading) {
      creepBehavior.upgradeRoomController(creep);
      creepBehavior.repairUpContainer(creep);
      if (!creep.room.controller!.sign || creep.room.controller!.sign!.text !== Memory.controllerSign) {
        creepBehavior.signRoomController(creep);
      }
    } else {
      creepBehavior.retrieveEnergyForUpgrading(creep);
    }
  }
};
