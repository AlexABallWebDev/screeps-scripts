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
Check if a source is missing a miner or its assigned miner will
die within the time it takes a new miner to replace it.
@param {Room} room
*/
function buildMiners(room, spawn) {
  let sourceIdWhichNeedsMiner;
  let foundMissingMiner = false;

  _.forEach(room.memory.sourceAssignments, (creepName, sourceId) => {
    console.log("creepName: " + creepName);
    console.log("sourceId: " + sourceId);
    if (!foundMissingMiner && !Game.creeps[creepName]) {
      sourceIdWhichNeedsMiner = sourceId;
      foundMissingMiner = true;
    }
  });

  if (sourceIdWhichNeedsMiner) {
    let newCreepName = spawnFunctions.createCreepWithMemory(spawn, {
      role: "miner",
      assignedSourceId: sourceIdWhichNeedsMiner
    });

    if (newCreepName != ERR_NOT_ENOUGH_ENERGY && newCreepName != ERR_BUSY) {
      room.memory.sourceAssignments[sourceIdWhichNeedsMiner] = newCreepName;
    }
  }
}

module.exports = {
  checkForSources,
  buildMiners
};
