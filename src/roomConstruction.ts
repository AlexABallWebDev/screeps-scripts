import profiler from "screeps-profiler";

import { roomPositionFunctions } from "./roomPosition";

/**
 * Contains constants and methods specifically for constructing buildings,
 * including logic for placing buildings in specific locations / patterns.
 */
const roomConstruction = {
  /**
   * Wrapper for room.createConstructionSite(). Returns ERR_INVALID_TARGET if there
   * is a flag that does not match the given flagName in the given x,y position. If no
   * flagName is given, then ERR_INVALID_TARGET will be returned if any flag is in
   * the given x,y position. Otherwise, this function should behave
   * like room.createConstructionSite().
   * @param {Room} room
   * @param {number} x
   * @param {number} y
   * @param {BuildableStructureConstant} structureType
   * @param {string} flagName
   */
  createConstructionSite(
    room: Room,
    x: number,
    y: number,
    structureType: BuildableStructureConstant,
    flagName?: string): ScreepsReturnCode {
    // get objects on the given position
    const flags = room.lookForAt(LOOK_FLAGS, x, y);

    if (flags.length) {
      for (const flag of flags) {
        if (flagName !== flag.name) {
          return ERR_INVALID_TARGET;
        }
      }
    }

    return room.createConstructionSite(x, y, structureType);
  },

  /**
   * Locates an open position for a container that a creep can move on that
   * is near to the given room's controller, marks it with a flag, and
   * creates a constructionSite for the container.
   * Also attempts to rebuild the container if there is no container on the flag.
   * @param {Room} room
   * @param {RoomPosition} startPosition
   */
  placeUpgraderContainer(room: Room, startPosition: RoomPosition): void {
    const flagName = room.name + " upContainer";
    const flag = Memory.flags[flagName];
    if (!flag) {
      let upContainerPosition = this.placeBuildingAdjacentToPathDestination(startPosition,
        room.controller!.pos, STRUCTURE_CONTAINER);

      if (upContainerPosition !== ERR_RCL_NOT_ENOUGH &&
        upContainerPosition !== ERR_NOT_FOUND &&
        upContainerPosition !== ERR_INVALID_TARGET) {
        upContainerPosition = upContainerPosition as RoomPosition;
        room.createFlag(upContainerPosition.x, upContainerPosition.y, flagName, COLOR_PURPLE);
        Memory.flags[flagName] = Game.flags[flagName].pos;
      } else {
        console.log("roomConstruction.js: placeUpgraderContainer failed to place upgraderContainer " +
          "due to error: " + upContainerPosition);
      }
    } else {
      this.createConstructionSite(room, flag.x, flag.y, STRUCTURE_CONTAINER, flagName);
    }
  },

  /**
   * Returns the number of extensions and extension construction sites
   * in the room.
   * @param {Room} room
   */
  countExtensions(room: Room): number {
    const extensions: any[] = room.find(FIND_MY_STRUCTURES, {
      filter: (structure) => structure.structureType === STRUCTURE_EXTENSION
    });

    const extensionConstructionSites: any[] = room.find(FIND_MY_CONSTRUCTION_SITES, {
      filter: (constructionSite) => constructionSite.structureType === STRUCTURE_EXTENSION
    });

    return _.size(extensions.concat(extensionConstructionSites));
  },

  /**
   * Places construction sites in a line, starting at position, placing
   * numberOfConstructionSites sites of type structureType spaced dotLength apart.
   * dotLength is optional and defaults to 0.
   * Returns the position of the last constructionSite placed.
   * @param {RoomPosition} position
   * @param {DirectionConstant} direction
   * @param {BuildableStructureConstant} structureType
   * @param {number} numberOfConstructionSites
   * @param {number} dotLength = 0
   */
  placeConstructionSitesInALine(
    position: RoomPosition,
    direction: DirectionConstant,
    structureType: BuildableStructureConstant,
    numberOfConstructionSites: number,
    dotLength: number = 0): RoomPosition {
    let positionOfLastConstructionSite = position;

    for (let i = numberOfConstructionSites; i > 0; i--) {
      this.createConstructionSite(Game.rooms[position.roomName], position.x, position.y, structureType);
      positionOfLastConstructionSite = position;
      for (let j = 0; j < dotLength + 1; j++) {
        position = roomPositionFunctions.findAdjacent(position, direction);
      }
    }

    return positionOfLastConstructionSite;
  },

  /**
   * Places extension construction sites around the given corners until the
   * maximum number of extensions have been placed in the given room.
   * @param {Room} room
   * @param {RoomPosition} position
   */
  addExtensionsToRoom(room: Room, position: RoomPosition): void {
    const maxExtensions = CONTROLLER_STRUCTURES.extension[room.controller!.level];

    // skip every other square so creeps have room to move.
    const DOT_LENGTH = 1;
    const extensionCount = this.countExtensions(room);

    if (extensionCount < maxExtensions) {
      // 2nd layer is 1 square away (corners of a square around the position).
      // This is the first layer that we care about.
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

      // start by moving diagonally TOP_LEFT to the corner of the square.
      for (let i = layer - 1; i > 0; i--) {
        position = roomPositionFunctions.findAdjacent(position, TOP_LEFT);
      }

      // then place the sides of the square. Traces from top left, to top right,
      // to bottom right, to bottom left, finally back to top left.
      _.forEach([RIGHT, BOTTOM, LEFT, TOP], (direction) => {
        position = this.placeConstructionSitesInALine(position, direction, STRUCTURE_EXTENSION,
          layer,
          DOT_LENGTH);
      });
    } else {
      room.memory.extensionSquareLayerCount = 0;
    }
  },

  /**
   * Places a construction site for the given structureType as close to the
   * endPosition as possible, while still placing it adjacent to (but not on) the
   * path between startPosition and endPosition.
   * @param {RoomPosition} startPosition
   * @param {RoomPosition} endPosition
   * @param {number} structureType
   */
  placeBuildingAdjacentToPathDestination(
    startPosition: RoomPosition,
    endPosition: RoomPosition,
    structureType: BuildableStructureConstant): RoomPosition | ScreepsReturnCode {
    return this.placeBuildingAdjacentToPath(startPosition, endPosition, structureType);
  },

  /**
   * Places a construction site for the given structureType as close to the
   * endPosition as possible, starting stepsFromDestination from the given
   * endPosition, while still placing it adjacent to (but not on) the path between
   * startPosition and endPosition.
   * @param {RoomPosition} startPosition
   * @param {RoomPosition} endPosition
   * @param {BuildableStructureConstant} structureType
   * @param {number} stepsFromDestination
   */
  placeBuildingAdjacentToPath(
    startPosition: RoomPosition,
    endPosition: RoomPosition,
    structureType: BuildableStructureConstant,
    stepsFromDestination: number = 1): RoomPosition | ERR_RCL_NOT_ENOUGH | ERR_NOT_FOUND | ERR_INVALID_TARGET {
    const room = Game.rooms[startPosition.roomName];
    const path = startPosition.findPathTo(endPosition, {
      ignoreCreeps: true
    });

    if (path.length) {
      const FIRST_STEP = 0;
      const LAST_STEP = path.length - stepsFromDestination;
      for (let stepNumber = LAST_STEP - 1; stepNumber > FIRST_STEP; stepNumber--) {
        const step = path[stepNumber];
        const previousStep = path[stepNumber - 1];
        const nextStep = path[stepNumber + 1];

        const adjacentObjects = roomPositionFunctions.getAdjacentObjects(new RoomPosition(step.x, step.y, room.name));

        // check each adjacent position to this position
        for (const stringYCoordinate in adjacentObjects) {
          const yCoordinate = parseInt(stringYCoordinate, 10);
          for (const stringXCoordinate in adjacentObjects[yCoordinate]) {
            const xCoordinate = parseInt(stringXCoordinate, 10);

            // if the position we are checking is not on the path, try to build here.
            if (!(xCoordinate === previousStep.x && yCoordinate === previousStep.y) &&
              !(xCoordinate === nextStep.x && yCoordinate === nextStep.y)) {

              const constructionSiteResult = this.createConstructionSite(room, xCoordinate, yCoordinate, structureType);

              if (constructionSiteResult === OK) {
                const constructionSitePosition = new RoomPosition(xCoordinate, yCoordinate, room.name);
                return constructionSitePosition;
              } else if (constructionSiteResult === ERR_RCL_NOT_ENOUGH) {
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
  },

  /**
   * Places tower flags and constructionSites based on tower assignments for the
   * given room if the max number of towers in the room has not been reached.
   * Also replaces towers by placing a tower constructionSite on tower flags.
   * @param {Room} room
   * @param {RoomPosition} startPosition
   */
  placeTowers(room: Room, startPosition: RoomPosition): void {
    if (room.memory.towerAssignments) {
      let numberOfTowersAssigned = 0;
      const towerAssignmentsToRemove: any[] = [];
      _.forEach(room.memory.towerAssignments, (towerFlagsContainer, towerAssignmentName) => {
        _.forEach(towerFlagsContainer, (towerFlagPosition, towerFlagName) => {
          // mark tower assignments that are missing a flag.
          if (!Memory.flags[towerFlagName]) {
            towerAssignmentsToRemove.push({
              towerAssignmentName,
              towerFlagName
            });
          } else {
            numberOfTowersAssigned++;
            // replace dead towers
            this.createConstructionSite(room, towerFlagPosition.x, towerFlagPosition.y,
              STRUCTURE_TOWER, towerFlagName);
          }
        });
      });

      // remove tower assignments that do not have a flag
      if (towerAssignmentsToRemove.length) {
        for (const towerAssignmentToRemove of towerAssignmentsToRemove) {
          const towerAssignmentName = towerAssignmentToRemove.towerAssignmentName;
          const towerFlagName = towerAssignmentToRemove.towerFlagName;
          room.memory.towerAssignments[towerAssignmentName][towerFlagName] = undefined;
        }
      }

      if (numberOfTowersAssigned < CONTROLLER_STRUCTURES[STRUCTURE_TOWER][room.controller!.level]) {

        // iterate over tower assignments, find the lowest tower count.
        let lowestTowerAssignment;
        let lowestTowerCount = CONTROLLER_STRUCTURES[STRUCTURE_TOWER][8];
        for (const assignmentObjectId in room.memory.towerAssignments) {
          const towerCount = _.size(room.memory.towerAssignments[assignmentObjectId]);
          if (towerCount < lowestTowerCount) {
            lowestTowerCount = towerCount;
            lowestTowerAssignment = Game.getObjectById(assignmentObjectId);
          }
        }

        if (lowestTowerAssignment) {
          // build a tower near the lowest count tower assignment and add it to the assignment.
          let towerPosition = this.placeBuildingAdjacentToPathDestination(
            startPosition,
            lowestTowerAssignment.pos,
            STRUCTURE_TOWER
          );
          if (towerPosition !== ERR_RCL_NOT_ENOUGH &&
            towerPosition !== ERR_NOT_FOUND &&
            towerPosition !== ERR_INVALID_TARGET) {
            towerPosition = towerPosition as RoomPosition;
            const towerFlagName = towerPosition.createFlag(
              lowestTowerAssignment.id + " tower " + lowestTowerCount,
              COLOR_BLUE
            );

            // save tower flag to towerAssignments
            room.memory.towerAssignments[lowestTowerAssignment.id][towerFlagName] = Game.flags[towerFlagName].pos;
            Memory.flags[towerFlagName] = Game.flags[towerFlagName].pos;
          }
        }
      }
    }
  }
};

profiler.registerObject(roomConstruction, "roomConstruction");
export { roomConstruction };
