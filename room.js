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
Find an adjacent position for the given position and direction
@param {Room} room
@param {number} direction
*/
function findAdjacent(position, direction) {
  switch (direction) {
    case TOP:
      return new RoomPosition(position.x, position.y - 1, position.roomName);
    case TOP_RIGHT:
      return new RoomPosition(position.x + 1, position.y - 1, position.roomName);
    case RIGHT:
      return new RoomPosition(position.x + 1, position.y, position.roomName);
    case BOTTOM_RIGHT:
      return new RoomPosition(position.x + 1, position.y + 1, position.roomName);
    case BOTTOM:
      return new RoomPosition(position.x, position.y + 1, position.roomName);
    case BOTTOM_LEFT:
      return new RoomPosition(position.x - 1, position.y + 1, position.roomName);
    case LEFT:
      return new RoomPosition(position.x - 1, position.y, position.roomName);
    case TOP_LEFT:
      return new RoomPosition(position.x - 1, position.y - 1, position.roomName);
    default:
      return 0;
  }
}

/**
Finds the squares diagonal to the given position and returns them in an array.
Returned in order of TOP_LEFT, TOP_RIGHT, BOTTOM_RIGHT, BOTTOM_LEFT.
@param {RoomPosition} position
*/
function getCorners(position) {
  let corners = [];
  corners.push(findAdjacent(position, TOP_LEFT));
  corners.push(findAdjacent(position, TOP_RIGHT));
  corners.push(findAdjacent(position, BOTTOM_RIGHT));
  corners.push(findAdjacent(position, BOTTOM_LEFT));

  return corners;
}

/**
Returns the number of extensions and extension construction sites
in the room.
@param {Room} room
*/
function countExtensions(room) {
  let extensions = room.find(FIND_MY_STRUCTURES, {
    filter: {
      structureType: STRUCTURE_EXTENSION
    }
  });

  let extensionConstructionSites = room.find(FIND_MY_CONSTRUCTION_SITES, {
    filter: {
      structureType: STRUCTURE_EXTENSION
    }
  });

  return _.size(extensions.concat(extensionConstructionSites));
}

/**
Places construction sites for extensions on the squares diagonal to
the given position.
@param {Room} room
@param {RoomPosition} position
*/
function addExtensionsToDiagonals(room, position) {
  let corners = getCorners(position);

  console.log("Adding extensions at diagonals of location: " + JSON.stringify(position));

  //build on corners
  corners.forEach((corner) => {
    room.createConstructionSite(corner, STRUCTURE_EXTENSION);
  });

  return corners;
}

/**
Returns the concentric square layer to build new extensions in for the given
number of extensions.
@param {number} extensionCount
*/
function checkExtensionLayer(extensionCount) {
  let layer = 2;
  extensionCount -= Math.pow(layer, 2);

  while (extensionCount >= 0) {
    layer++;
    extensionCount -= (Math.pow(layer, 2) - Math.pow(layer - 2, 2));
  }
  return layer;
}

/**
Places extension construction sites around the given corners until the
maximum number of extensions have been placed in the given room.
@param {Room} room
*/
function addExtensionsToRoom(room, position) {
  let maxExtensions = CONTROLLER_STRUCTURES.extension[room.controller.level];

  //skip every other square so creeps have room to move.
  const STEPS = 2;
  let extensionCount = countExtensions(room);

  if (extensionCount < maxExtensions) {
    let layer = checkExtensionLayer(extensionCount);
    let sideLength = layer - 1;

    //start by moving diagonally TOP_LEFT to the corner of the square.
    for (let i = sideLength; i > 0; i--) {
      position = findAdjacent(position, TOP_LEFT);
      console.log("moved TOP_LEFT");
      room.createConstructionSite(position, STRUCTURE_EXTENSION);
    }

    //move right until done with top
    for (let i = sideLength; i > 0; i--) {
      for (let i = 0; i < STEPS; i++) {
        position = findAdjacent(position, RIGHT);
      }
      console.log("moved RIGHT");
      room.createConstructionSite(position, STRUCTURE_EXTENSION);
    }

    //move down until done with right side.
    for (let i = sideLength; i > 0; i--) {
      for (let i = 0; i < STEPS; i++) {
        position = findAdjacent(position, BOTTOM);
      }
      console.log("moved BOTTOM");
      room.createConstructionSite(position, STRUCTURE_EXTENSION);
    }

    //move left until done with bottom.
    for (let i = sideLength; i > 0; i--) {
      for (let i = 0; i < STEPS; i++) {
        position = findAdjacent(position, LEFT);
      }
      console.log("moved LEFT");
      room.createConstructionSite(position, STRUCTURE_EXTENSION);
    }

    //move up until done with left side.
    for (let i = sideLength; i > 0; i--) {
      for (let i = 0; i < STEPS; i++) {
        position = findAdjacent(position, TOP);
      }
      console.log("moved TOP");
      room.createConstructionSite(position, STRUCTURE_EXTENSION);
    }
  }
}

module.exports = {
  checkForSources,
  findSourceIdMissingMiner,
  buildMiner,
  placeUpgraderContainer,
  findAdjacent,
  getCorners,
  countExtensions,
  addExtensionsToDiagonals,
  addExtensionsToRoom
};
