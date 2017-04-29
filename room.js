let spawnFunctions = require('spawn');
let roomPositionFunctions = require('roomPosition');

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
  let result = 0;

  _.forEach(room.memory.sourceAssignments, (creepName, sourceId) => {
    if (!Game.creeps[creepName]) {
      result = sourceId;
    }
  });

  return result;
}

/**
Build a miner for the given room and sourceId.
@param {Room} room
@param {string} sourceId
@param {Spawn} spawn
@param {array} body = [WORK, WORK, CARRY, MOVE]
@param {String} name = undefined
*/
function buildMiner(room, sourceId, spawn, body = undefined, name = undefined) {
  if (sourceId) {
    let newCreepName = spawnFunctions.createCreepWithMemory(spawn, {
      role: "miner",
      assignedSourceId: sourceId
    }, body, name);

    if (newCreepName != ERR_NOT_ENOUGH_ENERGY && newCreepName != ERR_BUSY) {
      room.memory.sourceAssignments[sourceId] = newCreepName;
    }

    return newCreepName;
  }
}

/**
Creates tower assignments in memory for the given room.
@param {Room} room
*/
function createTowerAssignments(room) {
  if (!room.memory.towerAssignments) {
    room.memory.towerAssignments = {};

    //add sources to the tower assignments list.
    let sources = room.find(FIND_SOURCES);
    if (sources.length) {
      for (let source in sources) {
        room.memory.towerAssignments[sources[source].id] = {};
      }
    }
  }
}

module.exports = {
  checkForSources,
  findSourceIdMissingMiner,
  buildMiner,
  createTowerAssignments
};
