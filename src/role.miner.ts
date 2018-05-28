export const roleMiner = {
  /** @param {Creep} creep **/
  run(creep: Creep) {
    const source = Game.getObjectById(creep.memory.assignedSourceId) as Source;
    if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
      creep.moveTo(source, {
        visualizePathStyle: {
          stroke: '#ffaa00'
        }
      });
    }
  }
};
