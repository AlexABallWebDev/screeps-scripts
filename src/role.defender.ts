import profiler from "screeps-profiler";

/**
 * Simple melee defender that rushes a hostile Creep in its room and attacks it.
 * Creeps of this role are idle, checking for new targets, otherwise.
 */
const roleDefender = {
  /**
   * Runs role logic on the given creep.
   * @param {Creep} creep
   */
  run(creep: Creep) {
    let target = Game.getObjectById(creep.memory.targetHostileCreep) as Creep;
    if (!target || target.room === creep.room) {
      target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
      if (target) {
        creep.memory.targetHostileCreep = target.id;
      }
    }

    if (target) {
      creep.moveTo(target, {
        visualizePathStyle: {
          stroke: "#ff0000"
        }
      });
      creep.attack(target);
    }
  }
};

profiler.registerObject(roleDefender, "role.defender");
export { roleDefender };
