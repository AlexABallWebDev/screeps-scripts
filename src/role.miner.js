let roleMiner = {
  /** @param {Creep} creep **/
  run: (creep) => {
    let source = Game.getObjectById(creep.memory.assignedSourceId);
    if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
      creep.moveTo(source, {
        visualizePathStyle: {
          stroke: '#ffaa00'
        }
      });
    }
  }
};

module.exports = roleMiner;
