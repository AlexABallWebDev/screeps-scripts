let spawnFunctions = require('spawn');

/**
check for sources that are not known in this room and add
them to the list of possible sourceAssignments for this room.
@param {Room} room
*/
function checkForSources(room) {
  if (!room.memory.sourceAssignments) {
    room.memory.sourceAssignments = {};

    _.forEach(room.find(FIND_SOURCES), (source) => {
      if (!room.memory.sourceAssignments[source.id]) {
        room.memory.sourceAssignments[source.id] = "none";
      }
    });
  }
}

/**
Check if a source is missing a miner.
@param {Room} room
*/
function findSourceIdMissingMiner(room) {
  _.forEach(room.memory.sourceAssignments, (creepName, sourceId) => {
    if (!Game.creeps[creepName]) {
      return sourceId;
    }
  });

  return 0;
}

/**
Build a miner for the given room and sourceId.
@param {Room} room
@param {string} sourceId
@param {Spawn} spawn
*/
function buildMiner(room, sourceId, spawn) {
  if (sourceId) {
    let newCreepName = spawnFunctions.createCreepWithMemory(spawn, {
      role: "miner",
      assignedSourceId: sourceId
    });

    if (newCreepName != ERR_NOT_ENOUGH_ENERGY && newCreepName != ERR_BUSY) {
      room.memory.sourceAssignments[sourceId] = newCreepName;
    } else {
      return sourceId;
    }
  }
}

module.exports = {
  checkForSources,
  findSourceIdMissingMiner,
  buildMiner
};
