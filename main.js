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

/**Functions that are used across different modules.*/
const FUNCTIONS = require('functions');

//Begin main loop.
module.exports.loop = function() {
  FUNCTIONS.respawn();
  FUNCTIONS.clearDeadCreepMemory();

  let harvesters = {};
  let upgraders = {};
  let builders = {};

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

    //check if a source is MISSING a miner OR its assigned miner will
    //die within the time it takes a new miner to replace it.

    //if so, then build a new miner which will be assigned to
    //that source.

    if (_.size(harvesters) < 2) {
      spawnFunctions.createCreepWithRole(spawn, 'harvester');
    } else if (_.size(upgraders) < 2) {
      spawnFunctions.createCreepWithRole(spawn, 'upgrader');
    } else if (_.size(builders) < 2) {
      spawnFunctions.createCreepWithRole(spawn, 'builder');
    }

    spawnFunctions.displayCreateCreepVisual(spawn);
  }
};
