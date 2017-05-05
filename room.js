let spawnFunctions = require('spawn');
let roomPositionFunctions = require('roomPosition');

/**
Check for sources that are not known in this room and create
a list of possible sourceAssignments for this room.
Also marks miningSpots with flags.
@param {Room} room
*/
function checkForSources(room) {
  if (!room.memory.sourceAssignments) {
    room.memory.sourceAssignments = {};

    _.forEach(room.find(FIND_SOURCES), (source) => {
      if (!room.memory.sourceAssignments[source.id]) {
        room.memory.sourceAssignments[source.id] = {};
        room.memory.sourceAssignments[source.id].minerName = "none";
        let adjacentObjects = roomPositionFunctions.getAdjacentObjects(source.pos, true);
        let miningSpotNumber = 0;
        for (let i in adjacentObjects) {
          if (adjacentObjects[i].terrain && adjacentObjects[i].terrain != "wall") {
            let flagPosition = new RoomPosition(adjacentObjects[i].x, adjacentObjects[i].y, room.name);
            let flagName = source.id + " miningSpot " + miningSpotNumber;
            flagName = flagPosition.createFlag(flagName, COLOR_YELLOW);
            Memory.flags[flagName] = flagPosition;
            miningSpotNumber++;
          }
        }
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

  _.forEach(room.memory.sourceAssignments, (sourceAssignment, sourceId) => {
    let miner = Game.creeps[sourceAssignment.minerName];
    if (!miner) {
      result = sourceId;
    } else if (!miner.spawning && sourceAssignment.path && sourceAssignment.path.length) {
      //if the miner will die in the time it takes a new miner to arrive,
      //then we need a new miner.
      let distanceFromSource = sourceAssignment.path.length;
      let MINER_TICKS_PER_MOVE = 3;
      console.log(miner.name + " has " + miner.ticksToLive + " ticks to live.");
      console.log(miner.name + "'s source is " + distanceFromSource + " away from spawn.");
      console.log(miner.name + " distanceFromSource*MINER_TICKS_PER_MOVE: " + distanceFromSource * MINER_TICKS_PER_MOVE);
      if (miner.ticksToLive < distanceFromSource * MINER_TICKS_PER_MOVE) {
        console.log(miner.name + " is being replaced!");
        result = sourceId;
      }
    }
  });

  return result;
}

/**
Build a miner for the given room and sourceId.
@param {Room} room
@param {string} sourceId
@param {Spawn} spawn
@param {array} body = undefined
@param {String} name = undefined
*/
function buildMiner(room, sourceId, spawn, body = undefined, name = undefined) {
  if (sourceId) {
    let newCreepName = spawnFunctions.createCreepWithMemory(spawn, {
      role: "miner",
      assignedSourceId: sourceId
    }, body, name);

    let minerPath = spawn.pos.findPathTo(Game.getObjectById(sourceId), {
      ignoreCreeps: true
    });
    room.memory.sourceAssignments[sourceId].path = minerPath;

    if (newCreepName != ERR_NOT_ENOUGH_ENERGY && newCreepName != ERR_BUSY) {
      room.memory.sourceAssignments[sourceId].minerName = newCreepName;
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
