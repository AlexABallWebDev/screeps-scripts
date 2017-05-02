let roomPositionFunctions = require('roomPosition');

/**
Wrapper for room.createConstructionSite(). Returns ERR_INVALID_TARGET if there
is a flag that does not match the given flagName in the given x,y position. If no
flagName is given, then ERR_INVALID_TARGET will be returned if any flag is in
the given x,y position. Otherwise, this function should behave
like room.createConstructionSite().
@param {Room} room
@param {number} x
@param {number} y
@param {string} structureType
@param {string} flagName
*/
function createConstructionSite(room, x, y, structureType, flagName = undefined) {
  //get objects on the given position
  let flags = room.lookForAt(LOOK_FLAGS, x, y);

  if (flags.length) {
    for (let i = 0; i < flags.length; i++) {
      if (flagName != flags[i].name) {
        return ERR_INVALID_TARGET;
      }
    }
  }

  return room.createConstructionSite(x, y, structureType);
}

/**
Locates an open position for a container that a creep can move on that
is near to the given room's controller, marks it with a flag, and
creates a constructionSite for the container.
Also attempts to rebuild the container if there is no container on the flag.
@param {Room} room
@param {RoomPosition} startPosition
*/
function placeUpgraderContainer(room, startPosition) {
  let flagName = room.name + " upContainer";
  let flag = Memory.flags[flagName];
  if (!flag) {
    let upContainerPosition = placeBuildingAdjacentToPathDestination(startPosition,
      room.controller.pos, STRUCTURE_CONTAINER);

    room.createFlag(upContainerPosition.x, upContainerPosition.y, flagName, COLOR_PURPLE);
    Memory.flags[flagName] = Game.flags[flagName].pos;
  } else {
    createConstructionSite(room, flag.x, flag.y, STRUCTURE_CONTAINER, flagName);
  }
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
    createConstructionSite(Game.rooms[position.roomName], position.x, position.y, structureType);
    positionOfLastConstructionSite = position;
    for (let i = 0; i < dotLength + 1; i++) {
      position = roomPositionFunctions.findAdjacent(position, direction);
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
      position = roomPositionFunctions.findAdjacent(position, TOP_LEFT);
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

      let adjacentObjects = roomPositionFunctions.getAdjacentObjects(new RoomPosition(step.x, step.y, room.name));

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
            } else if (constructionSiteResult == ERR_RCL_NOT_ENOUGH) {
              console.log("room.js: placeBuildingAdjacentToPathDestination attempted " +
                "to place constructionSite for " + structureType + " failed due to max # " +
                "of structures of this type at this RCL.");
              return ERR_RCL_NOT_ENOUGH;
            }
          }
        }
      }
    }
    console.log("room.js: placeBuildingAdjacentToPathDestination constructionSite " +
      "not found.");
  }
}

/**
Places tower flags and constructionSites based on tower assignments for the
given room if the max number of towers in the room has not been reached.
Also replaces towers by placing a tower constructionSite on tower flags.
@param {Room} room
*/
function placeTowers(room, startPosition) {
  if (room.memory.towerAssignments) {
    let numberOfTowersAssigned = 0;
    _.forEach(room.memory.towerAssignments, (towerFlagsContainer) => {
      _.forEach(towerFlagsContainer, (towerFlagPosition, towerFlagName) => {
        numberOfTowersAssigned++;
        //replace dead towers
        createConstructionSite(room, towerFlagPosition.x, towerFlagPosition.y,
          STRUCTURE_TOWER, towerFlagName);
      });
    });

    if (numberOfTowersAssigned < CONTROLLER_STRUCTURES[STRUCTURE_TOWER][room.controller.level]) {

      //iterate over tower assignments, find the lowest tower count.
      let lowestTowerAssignment;
      let lowestTowerCount = CONTROLLER_STRUCTURES[STRUCTURE_TOWER][8];
      for (let assignmentObjectId in room.memory.towerAssignments) {
        let towerCount = _.size(room.memory.towerAssignments[assignmentObjectId]);
        if (towerCount < lowestTowerCount) {
          lowestTowerCount = towerCount;
          lowestTowerAssignment = Game.getObjectById(assignmentObjectId);
        }
      }

      if (lowestTowerAssignment) {
        //build a tower near the lowest count tower assignment and add it to the assignment.
        let towerPosition = placeBuildingAdjacentToPathDestination(startPosition, lowestTowerAssignment.pos, STRUCTURE_TOWER);
        if (towerPosition && towerPosition != ERR_RCL_NOT_ENOUGH) {
          let towerFlagName = towerPosition.createFlag(lowestTowerAssignment.id + " tower " + lowestTowerCount, COLOR_BLUE);

          //save tower flag to towerAssignments
          room.memory.towerAssignments[lowestTowerAssignment.id][towerFlagName] = Game.flags[towerFlagName].pos;
          Memory.flags[towerFlagName] = Game.flags[towerFlagName].pos;
        }
      }
    }
  }
}

module.exports = {
  placeUpgraderContainer,
  countExtensions,
  placeConstructionSitesInALine,
  addExtensionsToRoom,
  placeBuildingAdjacentToPathDestination,
  placeTowers
};
