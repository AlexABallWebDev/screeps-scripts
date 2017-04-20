/**
Author: Alex Ball
screeps-scripts

scripts for the JavaScript-based MMO Screeps.
*/

require('tower').runTowerLogic();

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

  for (let name in Game.creeps) {
    let creep = Game.creeps[name];
    if (creep.memory.role == 'harvester') {
      Memory.creepInfo.harvesters[name] = creep.id;
      roleHarvester.run(creep);
    }
    if (creep.memory.role == 'upgrader') {
      Memory.creepInfo.upgraders[name] = creep.id;
      roleUpgrader.run(creep);
    }
    if (creep.memory.role == 'builder') {
      Memory.creepInfo.builders[name] = creep.id;
      roleBuilder.run(creep);
    }
  }

  console.log("harvesters count: " +
    Object.keys(Memory.creepInfo.harvesters).length);
  console.log("upgraders count: " +
    Object.keys(Memory.creepInfo.upgraders).length);
  console.log("builders count: " +
    Object.keys(Memory.creepInfo.builders).length);
};
