import profiler from "screeps-profiler";

import { creepBody } from "./creepBody";
import { roomPositionFunctions } from "./roomPosition";
import { spawnFunctions } from "./spawn";

/**
 * Contains constants and methods for rooms.
 */
const roomFunctions = {
  /**
   * Check for sources that are not known in this room and create
   * a list of possible sourceAssignments in room.memory.
   * Also marks miningSpots with flags so that buildings are not placed there.
   * @param {Room} room
   */
  checkForSources(room: Room): void {
    if (!room.memory.sourceAssignments) {
      const sourceAssignments: any = {};

      _.forEach(room.find(FIND_SOURCES), (source) => {
        if (!room.memory.sourceAssignments[source.id]) {
          sourceAssignments[source.id] = {minerName: "none", path: []};

          // mark mining spots with flags so that buildings are not placed there.
          const adjacentObjects = roomPositionFunctions.getAdjacentObjects(source.pos, true) as LookAtResultWithPos[];
          let miningSpotNumber = 0;
          for (const object of adjacentObjects) {
            if (object.terrain && object.terrain !== "wall") {
              const flagPosition = new RoomPosition(object.x, object.y, room.name);
              let flagName: any = source.id + " miningSpot " + miningSpotNumber;
              flagName = flagPosition.createFlag(flagName, COLOR_YELLOW);
              Memory.flags[flagName] = flagPosition;
              miningSpotNumber++;
            }
          }
        }
      });

      room.memory.sourceAssignments = sourceAssignments;
    }
  },

  /**
   * Check if any sources in this room are missing an assigned miner.
   * If there is a source that is missing a miner, this method returns the
   * id of that source. Returns undefined otherwise.
   * @param {Room} room
   */
  findSourceIdMissingMiner(room: Room): string | undefined {
    let result: string | undefined;

    _.forEach(room.memory.sourceAssignments, (sourceAssignment, sourceId) => {
      const miner = Game.creeps[sourceAssignment.minerName];
      if (!miner) {
        result = sourceId;
      } else if (!miner.spawning && sourceAssignment.path && sourceAssignment.path.length) {
        // if the miner will die in the time it takes a new miner to arrive,
        // then we need a new miner.
        const distanceFromSource = sourceAssignment.path.length;
        const MINER_TICKS_PER_MOVE = creepBody.calculateTicksPerMove(creepBody.miner);
        const MINER_SPAWN_TIME = creepBody.calculateSpawnTime(creepBody.miner);
        if (miner.ticksToLive! < (distanceFromSource * MINER_TICKS_PER_MOVE) + MINER_SPAWN_TIME) {
          result = sourceId;
        }
      }
    });

    return result;
  },

  /**
   * Creates tower assignments in memory for the given room.
   * @param {Room} room
   */
  createTowerAssignments(room: Room): void {
    if (!room.memory.towerAssignments) {
      room.memory.towerAssignments = {};

      // add sources to the tower assignments list.
      const sources = room.find(FIND_SOURCES);
      if (sources.length) {
        for (const source in sources) {
          room.memory.towerAssignments[sources[source].id] = {};
        }
      }
    }
  }
};

profiler.registerObject(roomFunctions, "room");
export { roomFunctions };
