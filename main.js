/**
Author: Alex Ball
screeps-scripts

scripts for the JavaScript-based MMO Screeps.
*/

require('tower').runTowerLogic();

let spawnFunctions = require('spawn');
let roomFunctions = require('room');

let roleHarvester = require('role.harvester');
let roleUpgrader = require('role.upgrader');
let roleBuilder = require('role.builder');
let roleMiner = require('role.miner');
let roleCourier = require('role.courier');

let roles = {
  harvester: roleHarvester,
  upgrader: roleUpgrader,
  builder: roleBuilder,
  miner: roleMiner,
  courier: roleCourier,
};

/**Functions that are used across different modules.*/
const FUNCTIONS = require('functions');

//Begin main loop.
module.exports.loop = function() {
  FUNCTIONS.respawn();
  FUNCTIONS.clearDeadCreepMemory();

  let creepsOfRole = {};

  _.forEach(roles, (role, roleName) => {
    creepsOfRole[roleName] = {};
  });

  for (let name in Game.creeps) {
    let creep = Game.creeps[name];
    if (roles[creep.memory.role]) {
      creepsOfRole[creep.memory.role][name] = creep.id;
      roles[creep.memory.role].run(creep);
    }
  }

  let spawn = Game.spawns.Spawn1;
  for (let roomName in Game.rooms) {
    let room = Game.rooms[roomName];

    FUNCTIONS.checkForLevelUp(room);

    let spawns = room.find(FIND_MY_STRUCTURES, {
      filter: {
        structureType: STRUCTURE_SPAWN
      }
    });

    let spawn = spawns[0];

    roomFunctions.checkForSources(room);
    let sourceIdMissingMiner = roomFunctions.findSourceIdMissingMiner(room);

    if (_.size(Game.creeps) < 2) {
      spawnFunctions.createCreepWithRole(spawn, 'harvester');
    } else if (_.size(creepsOfRole.courier) < 1) {
      spawnFunctions.createCreepWithRole(spawn, 'courier');
    } else if (sourceIdMissingMiner) {
      roomFunctions.buildMiner(room, sourceIdMissingMiner, spawn);
    } else if (_.size(creepsOfRole.courier) < 2) {
      spawnFunctions.createCreepWithRole(spawn, 'courier');
    } else if (_.size(creepsOfRole.upgraders) < 2) {
      spawnFunctions.createCreepWithRole(spawn, 'upgrader');
    } else if (_.size(creepsOfRole.builders) < 1) {
      spawnFunctions.createCreepWithRole(spawn, 'builder');
    }

    spawnFunctions.displayCreateCreepVisual(spawn);
  }
};
