import profiler from "screeps-profiler";

import { creepBody } from "./creepBody";
import { roomPositionFunctions } from "./roomPosition";
import { spawnFunctions } from "./spawn";

const roomFunctions = {
  /**
  Check for sources that are not known in this room and create
  a list of possible sourceAssignments for this room.
  Also marks miningSpots with flags.
  @param {Room} room
  */
  checkForSources(room: Room): void {
    if (!room.memory.sourceAssignments) {
      room.memory.sourceAssignments = {};

      _.forEach(room.find(FIND_SOURCES), (source) => {
        if (!room.memory.sourceAssignments[source.id]) {
          room.memory.sourceAssignments[source.id] = {};
          room.memory.sourceAssignments[source.id].minerName = "none";
          let adjacentObjects = roomPositionFunctions.getAdjacentObjects(source.pos, true) as LookAtResultWithPos[];
          let miningSpotNumber = 0;
          for (let i in adjacentObjects) {
            if (adjacentObjects[i].terrain && adjacentObjects[i].terrain != "wall") {
              let flagPosition = new RoomPosition(adjacentObjects[i].x, adjacentObjects[i].y, room.name);
              let flagName: any = source.id + " miningSpot " + miningSpotNumber;
              flagName = flagPosition.createFlag(flagName, COLOR_YELLOW);
              Memory.flags[flagName] = flagPosition;
              miningSpotNumber++;
            }
          }
        }
      });
    }
  },

  /**
  Check if a source is missing a miner.
  @param {Room} room
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
  Build a miner for the given room and sourceId.
  @param {Room} room
  @param {string} sourceId
  @param {StructureSpawn} spawn
  @param {BodyPartConstant[]} body
  @param {string} name = undefined
  */
  buildMiner(room: Room, sourceId: string, spawn: StructureSpawn, body: BodyPartConstant[], name: string | undefined = undefined): string | ScreepsReturnCode | undefined {
    if (sourceId) {
      let newCreepName: any = spawnFunctions.createCreepWithMemory(spawn, {
        role: "miner",
        assignedSourceId: sourceId
      }, body, name);

      let minerPath = spawn.pos.findPathTo(Game.getObjectById(sourceId) as Source, {
        ignoreCreeps: true
      });
      room.memory.sourceAssignments[sourceId].path = minerPath;

      if (newCreepName != ERR_NOT_ENOUGH_ENERGY && newCreepName != ERR_BUSY) {
        room.memory.sourceAssignments[sourceId].minerName = newCreepName;
      }

      return newCreepName as string | ScreepsReturnCode;
    }
    return undefined;
  },

  /**
  Creates tower assignments in memory for the given room.
  @param {Room} room
  */
  createTowerAssignments(room: Room): void {
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
};

profiler.registerObject(roomFunctions, "room");
export { roomFunctions };
