/**
Author: Alex Ball
screeps-scripts

scripts for the JavaScript-based MMO Screeps.
*/

require('tower').runTowerLogic();

let spawnFunctions = require('spawn');

let roleHarvester = require('role.harvester');
let roleUpgrader = require('role.upgrader');
let roleBuilder = require('role.builder');

/**Functions that are used across different modules.*/
const FUNCTIONS = require('functions');

//Begin main loop.
module.exports.loop = function() {
  FUNCTIONS.respawn();
  FUNCTIONS.clearDeadCreepMemory();

  let spawn = Game.spawns.Spawn1;

  FUNCTIONS.checkForLevelUp(spawn);

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

  if (Object.keys(harvesters).length < 2) {
    spawnFunctions.spawn(spawn, 'harvester');
  } else if (Object.keys(upgraders).length < 2) {
    spawnFunctions.spawn(spawn, 'upgrader');
  } else if (Object.keys(builders).length < 2) {
    spawnFunctions.spawn(spawn, 'upgrader');
  }

  if (spawn.spawning) {
    let spawningCreep = Game.creeps[spawn.spawning.name];
    spawn.room.visual.text(
      '🛠️' + spawningCreep.memory.role,
      spawn.pos.x + 1,
      spawn.pos.y, {
        align: 'left',
        opacity: 0.8
      });
  }
};
