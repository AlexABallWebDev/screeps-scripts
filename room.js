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

/**
Locates an open position for a container that a creep can move on that
is adjacent to the given room's controller, marks it with a flag, and
creates a constructionSite for the container.
@param {Room} room
@param {RoomPosition} startPosition
*/
function placeUpgraderContainer(room, startPosition) {
  let steps = startPosition.findPathTo(room.controller.pos);
  let lastStep = steps[steps.length - 2];
  let flagName = room.name + " upContainer";

  room.createFlag(lastStep.x, lastStep.y, flagName, COLOR_PURPLE);
  Memory.flags[flagName] = Game.flags[flagName].pos;
  room.createConstructionSite(lastStep.x, lastStep.y, STRUCTURE_CONTAINER);
}

module.exports = {
  checkForSources,
  findSourceIdMissingMiner,
  buildMiner,
  placeUpgraderContainer
};
