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

/**
Places construction sites for extensions on the squares diagonal to
the given position.
@param {Room} room
@param {RoomPosition} position
*/
function addExtensionsToDiagonals(room, position) {
  //find corners
  let corners = [];
  corners.push(findDiagonal(position, TOP_LEFT));
  corners.push(findDiagonal(position, TOP_RIGHT));
  corners.push(findDiagonal(position, BOTTOM_RIGHT));
  corners.push(findDiagonal(position, BOTTOM_LEFT));

  //build on corners
  corners.forEach((corner) => {
    room.createConstructionSite(corner, STRUCTURE_EXTENSION);
  });
}

/**
Find the corner position for the given position and direction
@param {Room} room
@param {number} direction
*/
function findDiagonal(position, direction) {
  switch (direction) {
    case TOP_LEFT:
      return new RoomPosition(position.x - 1, position.y - 1, position.roomName);
    case TOP_RIGHT:
      return new RoomPosition(position.x + 1, position.y - 1, position.roomName);
    case BOTTOM_RIGHT:
      return new RoomPosition(position.x + 1, position.y + 1, position.roomName);
    case BOTTOM_LEFT:
      return new RoomPosition(position.x - 1, position.y + 1, position.roomName);
    default:
      return 0;
  }
}

module.exports = {
  checkForSources,
  findSourceIdMissingMiner,
  buildMiner,
  placeUpgraderContainer,
  addExtensionsToDiagonals,
  findDiagonal
};
