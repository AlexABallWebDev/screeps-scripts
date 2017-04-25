const creepBehavior = require('behavior.creep');

const roleDefender = {
  /** @param {Creep} creep **/
  run: function(creep) {
    let target = Game.getObjectById(creep.memory.targetHostileCreep);
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

module.exports = roleDefender;
