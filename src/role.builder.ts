import { creepBehavior } from "./behavior.creep";

/**
 * Builder that takes energy from the upContainer of the room and builds
 * constructionSites in its room.
 */
export const roleBuilder = {
  /**
   * Runs role logic on the given creep.
   * @param {Creep} creep
   */
  run(creep: Creep) {

    if (creep.memory.building && creep.carry.energy === 0) {
      creep.memory.building = false;
      creep.say("refuel");
    }
    if (!creep.memory.building && creep.carry.energy === creep.carryCapacity) {
      creep.memory.building = true;
      creep.say("build");
    }

    if (creep.memory.building) {
      const targets = creep.room.find(FIND_CONSTRUCTION_SITES);
      if (targets.length) {
        let closestToFinished = targets[0];
        if (targets.length > 1) {
          for (let i = 1; i < targets.length; i++) {
            if (targets[i].progress > closestToFinished.progress) {
              closestToFinished = targets[i];
            }
          }
        }
        creepBehavior.stayAtRange(creep, closestToFinished.pos, 3);
        if (creep.build(closestToFinished) === ERR_NOT_IN_RANGE) {
          creep.moveTo(closestToFinished, {
            visualizePathStyle: {
              stroke: "#ffffff"
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
