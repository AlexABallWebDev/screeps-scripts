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
Places construction sites in a line, starting at position, placing
numberOfConstructionSites sites of type structureType spaced dotLength apart.
dotLength is optional and defaults to 0.
Returns the position of the last constructionSite placed.
@param {RoomPosition} position
@param {number} direction
@param {number} structureType
@param {number} numberOfConstructionSites
@param {number} dotLength = 0
*/
function placeConstructionSitesInALine(position, direction, structureType,
  numberOfConstructionSites,
  dotLength = 0) {
  let positionOfLastConstructionSite = position;

  for (let i = numberOfConstructionSites; i > 0; i--) {
    Game.rooms[position.roomName].createConstructionSite(position, structureType);
    positionOfLastConstructionSite = position;
    for (let i = 0; i < dotLength + 1; i++) {
      position = findAdjacent(position, direction);
    }
  }

  return positionOfLastConstructionSite;
}

/**
Places extension construction sites around the given corners until the
maximum number of extensions have been placed in the given room.
@param {Room} room
*/
function addExtensionsToRoom(room, position) {
  let maxExtensions = CONTROLLER_STRUCTURES.extension[room.controller.level];

  //skip every other square so creeps have room to move.
  const DOT_LENGTH = 1;
  let extensionCount = countExtensions(room);

  if (extensionCount < maxExtensions) {
    let layer = checkExtensionLayer(extensionCount);

    //start by moving diagonally TOP_LEFT to the corner of the square.
    for (let i = layer - 1; i > 0; i--) {
      position = findAdjacent(position, TOP_LEFT);
    }

    //then place the sides of the square. Traces from top left, to top right,
    //to bottom right, to bottom left, finally back to top left.
    _.forEach([RIGHT, BOTTOM, LEFT, TOP], (direction) => {
      position = placeConstructionSitesInALine(position, direction, STRUCTURE_EXTENSION,
        layer,
        DOT_LENGTH);
    });
  }
}

/**
Places a construction site for the given structureType as close to the
endPosition as possible, while still placing it adjacent to (but not on) the
path between startPosition and endPosition.
@param {RoomPosition} startPosition
@param {RoomPosition} endPosition
@param {number} structureType
*/
function placeBuildingAdjacentToPathDestination(startPosition, endPosition, structureType) {
  let room = Game.rooms[startPosition.roomName];
  let path = startPosition.findPathTo(endPosition, {
    ignoreCreeps: true
  });

  if (path.length) {
    const FIRST_STEP = 0;
    const LAST_STEP = path.length - 1;
    for (let stepNumber = LAST_STEP - 1; stepNumber > FIRST_STEP; stepNumber--) {
      let step = path[stepNumber];
      let previousStep = path[stepNumber - 1];
      let nextStep = path[stepNumber + 1];

      let adjacentObjects = getAdjacentObjects(new RoomPosition(step.x, step.y, room.name));

      //check each adjacent position to this position
      for (let yCoordinate in adjacentObjects) {
        yCoordinate = parseInt(yCoordinate);
        for (let xCoordinate in adjacentObjects[yCoordinate]) {
          xCoordinate = parseInt(xCoordinate);

          //if the position we are checking is not on the path, try to build here.
          if (!(xCoordinate == previousStep.x && yCoordinate == previousStep.y) &&
            !(xCoordinate == nextStep.x && yCoordinate == nextStep.y)) {
            let constructionSitePosition = new RoomPosition(xCoordinate, yCoordinate, room.name);

            let constructionSiteResult = room.createConstructionSite(constructionSitePosition, structureType);
            if (constructionSiteResult == OK) {
              return constructionSitePosition;
            }
          }
        }
      }
    }
  }
}

/**
Finds and returns an object (or array if isArray is true) containing
the objects in adjacent positions to the given position. This object (or array)
is found from room.lookAtArea.
@param {RoomPosition} position
@param {boolean} isArray = false
*/
function getAdjacentObjects(position, isArray = false) {
  let room = Game.rooms[position.roomName];
  let adjacentObjects = room.lookAtArea(position.y - 1, position.x - 1,
    position.y + 1, position.x + 1, isArray);

  //remove objects at the given position so we are left with only adjacent objects.
  adjacentObjects[position.y][position.x] = undefined;

  return adjacentObjects;
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
  checkExtensionLayer,
  placeConstructionSitesInALine,
  addExtensionsToRoom,
  placeBuildingAdjacentToPathDestination,
  getAdjacentObjects
};
