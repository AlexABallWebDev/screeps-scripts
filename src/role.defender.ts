export const roleDefender = {
  /** @param {Creep} creep **/
  run(creep: Creep) {
    let target = Game.getObjectById(creep.memory.targetHostileCreep) as Creep;
    if (!target || target.room == creep.room) {
      target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
      if (target) {
        creep.memory.targetHostileCreep = target.id;
      }
    }

    if (target) {
      creep.moveTo(target, {
        visualizePathStyle: {
          stroke: '#ff0000'
        }
      });
      creep.attack(target);
    }
  }
};
