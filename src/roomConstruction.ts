import * as roomPositionFunctions from "./roomPosition";

/**
Wrapper for room.createConstructionSite(). Returns ERR_INVALID_TARGET if there
is a flag that does not match the given flagName in the given x,y position. If no
flagName is given, then ERR_INVALID_TARGET will be returned if any flag is in
the given x,y position. Otherwise, this function should behave
like room.createConstructionSite().
@param {Room} room
@param {number} x
@param {number} y
@param {BuildableStructureConstant} structureType
@param {string} flagName
*/
export function createConstructionSite(room: Room, x: number, y: number,
  structureType: BuildableStructureConstant, flagName: string | undefined = undefined): ScreepsReturnCode {
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
export function placeUpgraderContainer(room: Room, startPosition: RoomPosition): void {
  let flagName = room.name + " upContainer";
  let flag = Memory.flags[flagName];
  if (!flag) {
    let upContainerPosition = placeBuildingAdjacentToPathDestination(startPosition,
      room.controller!.pos, STRUCTURE_CONTAINER);

    if (upContainerPosition != ERR_RCL_NOT_ENOUGH &&
      upContainerPosition != ERR_NOT_FOUND &&
      upContainerPosition != ERR_INVALID_TARGET) {
      upContainerPosition = upContainerPosition as RoomPosition;
      room.createFlag(upContainerPosition.x, upContainerPosition.y, flagName, COLOR_PURPLE);
      Memory.flags[flagName] = Game.flags[flagName].pos;
    } else {
      console.log("roomConstruction.js: placeUpgraderContainer failed to place upgraderContainer " +
        "due to error: " + upContainerPosition);
    }
  } else {
    createConstructionSite(room, flag.x, flag.y, STRUCTURE_CONTAINER, flagName);
  }
}

/**
Returns the number of extensions and extension construction sites
in the room.
@param {Room} room
*/
export function countExtensions(room: Room): number {
  let extensions: any[] = room.find(FIND_MY_STRUCTURES, {
    filter: (structure) => structure.structureType === STRUCTURE_EXTENSION
  });

  let extensionConstructionSites: any[] = room.find(FIND_MY_CONSTRUCTION_SITES, {
    filter: (constructionSite) => constructionSite.structureType === STRUCTURE_EXTENSION
  });

  return _.size(extensions.concat(extensionConstructionSites));
}

/**
Places construction sites in a line, starting at position, placing
numberOfConstructionSites sites of type structureType spaced dotLength apart.
dotLength is optional and defaults to 0.
Returns the position of the last constructionSite placed.
@param {RoomPosition} position
@param {DirectionConstant} direction
@param {BuildableStructureConstant} structureType
@param {number} numberOfConstructionSites
@param {number} dotLength = 0
*/
export function placeConstructionSitesInALine(position: RoomPosition, direction: DirectionConstant, structureType: BuildableStructureConstant,
  numberOfConstructionSites: number,
  dotLength: number = 0): RoomPosition {
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
@param {RoomPosition} position
*/
export function addExtensionsToRoom(room: Room, position: RoomPosition): void {
  let maxExtensions = CONTROLLER_STRUCTURES.extension[room.controller!.level];

  //skip every other square so creeps have room to move.
  const DOT_LENGTH = 1;
  let extensionCount = countExtensions(room);

  if (extensionCount < maxExtensions) {
    //2nd layer is 1 square away (corners of a square around the position).
    //This is the first layer that we care about.
    let layer = 2;

    const MAX_EXTENSION_SQUARE_LAYER_COUNTER = 25;

    if (room.memory.extensionSquareLayerCount === undefined) {
      room.memory.extensionSquareLayerCount = 0;
    }

    layer += room.memory.extensionSquareLayerCount;

    if (room.memory.extensionSquareLayerCount <= MAX_EXTENSION_SQUARE_LAYER_COUNTER) {
      room.memory.extensionSquareLayerCount++;
    } else {
      console.log("roomConstruction.js: Attempting to place extensions at layer: " + layer);
    }

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
  } else {
    room.memory.extensionSquareLayerCount = 0;
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
export function placeBuildingAdjacentToPathDestination(startPosition: RoomPosition,
  endPosition: RoomPosition, structureType: BuildableStructureConstant): RoomPosition | ScreepsReturnCode {
  return placeBuildingAdjacentToPath(startPosition, endPosition, structureType);
}

/**
Places a construction site for the given structureType as close to the
endPosition as possible, starting stepsFromDestination from the given
endPosition, while still placing it adjacent to (but not on) the path between
startPosition and endPosition.
@param {RoomPosition} startPosition
@param {RoomPosition} endPosition
@param {BuildableStructureConstant} structureType
@param {number} stepsFromDestination
*/
export function placeBuildingAdjacentToPath(startPosition: RoomPosition,
  endPosition: RoomPosition, structureType: BuildableStructureConstant,
  stepsFromDestination: number = 1): RoomPosition | ERR_RCL_NOT_ENOUGH | ERR_NOT_FOUND | ERR_INVALID_TARGET {
  let room = Game.rooms[startPosition.roomName];
  let path = startPosition.findPathTo(endPosition, {
    ignoreCreeps: true
  });

  if (path.length) {
    const FIRST_STEP = 0;
    const LAST_STEP = path.length - stepsFromDestination;
    for (let stepNumber = LAST_STEP - 1; stepNumber > FIRST_STEP; stepNumber--) {
      let step = path[stepNumber];
      let previousStep = path[stepNumber - 1];
      let nextStep = path[stepNumber + 1];

      let adjacentObjects = roomPositionFunctions.getAdjacentObjects(new RoomPosition(step.x, step.y, room.name));

      //check each adjacent position to this position
      for (let stringYCoordinate in adjacentObjects) {
        const yCoordinate = parseInt(stringYCoordinate);
        for (let stringXCoordinate in adjacentObjects[yCoordinate]) {
          const xCoordinate = parseInt(stringXCoordinate);

          //if the position we are checking is not on the path, try to build here.
          if (!(xCoordinate == previousStep.x && yCoordinate == previousStep.y) &&
            !(xCoordinate == nextStep.x && yCoordinate == nextStep.y)) {

            let constructionSiteResult = createConstructionSite(room, xCoordinate, yCoordinate, structureType);

            if (constructionSiteResult == OK) {
              let constructionSitePosition = new RoomPosition(xCoordinate, yCoordinate, room.name);
              return constructionSitePosition;
            } else if (constructionSiteResult == ERR_RCL_NOT_ENOUGH) {
              console.log("roomConstruction.js: placeBuildingAdjacentToPathDestination attempted " +
                "to place constructionSite for " + structureType + " failed due to max # " +
                "of structures of this type at this RCL.");
              return ERR_RCL_NOT_ENOUGH;
            }
          }
        }
      }
    }
    console.log("roomConstruction.js: placeBuildingAdjacentToPathDestination " +
      "valid constructionSite not found along path between startPosition and " +
      "endDestination.");
    return ERR_NOT_FOUND;
  } else {
    console.log("roomConstruction.js: placeBuildingAdjacentToPathDestination " +
    "cannot find path from startPosition to endDestination.");
    return ERR_INVALID_TARGET;
  }
}

/**
Places tower flags and constructionSites based on tower assignments for the
given room if the max number of towers in the room has not been reached.
Also replaces towers by placing a tower constructionSite on tower flags.
@param {Room} room
@param {RoomPosition} startPosition
*/
export function placeTowers(room: Room, startPosition: RoomPosition): void {
  if (room.memory.towerAssignments) {
    let numberOfTowersAssigned = 0;
    let towerAssignmentsToRemove: any[] = [];
    _.forEach(room.memory.towerAssignments, (towerFlagsContainer, towerAssignmentName) => {
      _.forEach(towerFlagsContainer, (towerFlagPosition, towerFlagName) => {
        //mark tower assignments that are missing a flag.
        if (!Memory.flags[towerFlagName]) {
          towerAssignmentsToRemove.push({
            towerAssignmentName: towerAssignmentName,
            towerFlagName: towerFlagName
          });
        } else {
          numberOfTowersAssigned++;
          //replace dead towers
          createConstructionSite(room, towerFlagPosition.x, towerFlagPosition.y,
            STRUCTURE_TOWER, towerFlagName);
        }
      });
    });

    //remove tower assignments that do not have a flag
    if (towerAssignmentsToRemove.length) {
      for (let i = 0; i < towerAssignmentsToRemove.length; i++) {
        let towerAssignmentName = towerAssignmentsToRemove[i].towerAssignmentName;
        let towerFlagName = towerAssignmentsToRemove[i].towerFlagName;
        room.memory.towerAssignments[towerAssignmentName][towerFlagName] = undefined;
      }
    }

    if (numberOfTowersAssigned < CONTROLLER_STRUCTURES[STRUCTURE_TOWER][room.controller!.level]) {

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
        if (towerPosition != ERR_RCL_NOT_ENOUGH &&
          towerPosition != ERR_NOT_FOUND &&
          towerPosition != ERR_INVALID_TARGET) {
          towerPosition = towerPosition as RoomPosition
          let towerFlagName = towerPosition.createFlag(lowestTowerAssignment.id + " tower " + lowestTowerCount, COLOR_BLUE);

          //save tower flag to towerAssignments
          room.memory.towerAssignments[lowestTowerAssignment.id][towerFlagName] = Game.flags[towerFlagName].pos;
          Memory.flags[towerFlagName] = Game.flags[towerFlagName].pos;
        }
      }
    }
  }
}
