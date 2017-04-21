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

  if (Object.keys(Memory.creepInfo.harvesters).length < 2) {
    let newName = Game.spawns.Spawn1.createCreep([WORK, WORK, CARRY, MOVE], undefined, {
      role: 'harvester'
    });
    console.log('Spawning new harvester: ' + newName);
  }

  if (Game.spawns.Spawn1.spawning) {
    let spawningCreep = Game.creeps[Game.spawns.Spawn1.spawning.name];
    Game.spawns.Spawn1.room.visual.text(
      '🛠️' + spawningCreep.memory.role,
      Game.spawns.Spawn1.pos.x + 1,
      Game.spawns.Spawn1.pos.y, {
        align: 'left',
        opacity: 0.8
      });
  }

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
};
