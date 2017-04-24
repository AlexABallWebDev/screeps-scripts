/**
Author: Alex Ball
screeps-scripts

scripts for the JavaScript-based MMO Screeps.
*/

require('tower').runTowerLogic();

const spawnFunctions = require('spawn');
const roomFunctions = require('room');

const roleHarvester = require('role.harvester');
const roleUpgrader = require('role.upgrader');
const roleBuilder = require('role.builder');
const roleMiner = require('role.miner');
const roleCourier = require('role.courier');

const roles = {
  harvester: roleHarvester,
  upgrader: roleUpgrader,
  builder: roleBuilder,
  miner: roleMiner,
  courier: roleCourier,
};

/**Diagnostic and utility functions*/
const FUNCTIONS = require('functions');

//Begin main loop.
module.exports.loop = function() {
  FUNCTIONS.respawn();
  FUNCTIONS.clearDeadCreepMemory();
  FUNCTIONS.clearMissingFlagMemory();

  let creepsOfRole = {};

  for (let roleName in roles) {
    creepsOfRole[roleName] = {};
  }

  for (let name in Game.creeps) {
    let creep = Game.creeps[name];
    if (roles[creep.memory.role]) {
      creepsOfRole[creep.memory.role][name] = creep.id;
      roles[creep.memory.role].run(creep);
    }
  }

  for (let roomName in Game.rooms) {
    let room = Game.rooms[roomName];

    FUNCTIONS.checkForLevelUp(room);

    let spawns = room.find(FIND_MY_STRUCTURES, {
      filter: {
        structureType: STRUCTURE_SPAWN
      }
    });

    let spawn = spawns[0];

    const CREEP_BODY = {
      harvester: [WORK, CARRY, MOVE],
      courier: [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY],
      miner: [WORK, WORK, MOVE, WORK, WORK, MOVE, WORK],
      builder: [WORK, WORK, CARRY, MOVE, CARRY, MOVE, WORK],
      upgrader: [WORK, WORK, CARRY, MOVE, WORK, WORK]
    };

    roomFunctions.checkForSources(room);
    let sourceIdMissingMiner = roomFunctions.findSourceIdMissingMiner(room);

    if (_.size(Game.creeps) < 2) {
      spawnFunctions.createCreepWithRole(spawn, "harvester", CREEP_BODY.harvester);
    } else if (_.size(creepsOfRole.courier) < 1) {
      spawnFunctions.createCreepWithRole(spawn, "courier", CREEP_BODY.courier);
    } else if (sourceIdMissingMiner) {
      roomFunctions.buildMiner(room, sourceIdMissingMiner, spawn, CREEP_BODY.miner);
    } else if (_.size(creepsOfRole.courier) < 2) {
      spawnFunctions.createCreepWithRole(spawn, "courier", CREEP_BODY.courier);
    } else if (_.size(creepsOfRole.builder) < 2) {
      spawnFunctions.createCreepWithRole(spawn, "builder", CREEP_BODY.builder);
    } else if (_.size(creepsOfRole.upgrader) < 1) {
      spawnFunctions.createCreepWithRole(spawn, "upgrader", CREEP_BODY.upgrader);
    }

    spawnFunctions.displayCreateCreepVisual(spawn);

    if (!Memory.flags[room.name + " upContainer"]) {
      roomFunctions.placeUpgraderContainer(room, spawn.pos);
    }

    roomFunctions.addExtensionsToRoom(room, spawn.pos);
  }
};
