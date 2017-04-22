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

/**Functions that are used across different modules.*/
const FUNCTIONS = require('functions');

//Begin main loop.
module.exports.loop = function() {
  FUNCTIONS.respawn();
  FUNCTIONS.clearDeadCreepMemory();

  let harvesters = {};
  let upgraders = {};
  let builders = {};
  let miners = {};

  for (let name in Game.creeps) {
    let creep = Game.creeps[name];
    if (creep.memory.role == 'harvester') {
      harvesters[name] = creep.id;
      roleHarvester.run(creep);
    }
    if (creep.memory.role == 'upgrader') {
      upgraders[name] = creep.id;
      roleUpgrader.run(creep);
    }
    if (creep.memory.role == 'builder') {
      builders[name] = creep.id;
      roleBuilder.run(creep);
    }
    if (creep.memory.role == 'miner') {
      miners[name] = creep.id;
      roleMiner.run(creep);
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
    roomFunctions.buildMiners(room, spawn);

    if (_.size(harvesters) < 2) {
      spawnFunctions.createCreepWithRole(spawn, 'harvester');
    } else if (_.size(upgraders) < 1) {
      spawnFunctions.createCreepWithRole(spawn, 'upgrader');
    } else if (_.size(builders) < 0) {
      spawnFunctions.createCreepWithRole(spawn, 'builder');
    }

    spawnFunctions.displayCreateCreepVisual(spawn);
  }
};
