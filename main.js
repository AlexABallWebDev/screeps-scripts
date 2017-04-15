/**
Author: Alex Ball
screeps-scripts

scripts for the JavaScript-based MMO Screeps.
*/

// Require other modules and prototypes.

/**Prototype for spawn objects.*/
require('prototype.spawn')();

/**Prototype for creep objects.*/
require('prototype.creep')();

/**Tower Logic*/
require('tower').runTowerLogic();

/**Functions that are used across different modules.*/
const FUNCTIONS = require('functions');

// Constants

/**Minimum number of harvesters.*/
const HARVESTER_MINIMUM = 2;

/**Minimum number of upgraders.*/
const UPGRADER_MINIMUM = 2;

/**Minimum number of builders.*/
const BUILDER_MINIMUM = 3;

/**Minimum number of repairers.*/
const REPAIRER_MINIMUM = 2;

/**Minimum number of creeps.*/
const WORKERS_MINIMUM = HARVESTER_MINIMUM +
  UPGRADER_MINIMUM +
  BUILDER_MINIMUM +
  REPAIRER_MINIMUM;

/**Base Worker Body. 2W, 1C, 1M.*/
const BASE_WORKER_BODY = [WORK, WORK, CARRY, MOVE];

//Begin main loop.
module.exports.loop = function() {
  FUNCTIONS.respawn();

  //Cleanup memory.
  FUNCTIONS.clearDeadCreepMemory();

  let spawn = Game.spawns.Spawn1;

  FUNCTIONS.checkForLevelUp(spawn);

  //Count the number of each creep role.
  let upgraders = _.filter(Game.creeps, (creep) =>
    creep.memory.role == 'upgrader');
  console.log('Upgraders: ' + upgraders.length);

  let builders = _.filter(Game.creeps, (creep) =>
    creep.memory.role == 'builder');
  console.log('Builders: ' + builders.length);

  let harvesters = _.filter(Game.creeps, (creep) =>
    creep.memory.role == 'harvester');
  console.log('Harvesters: ' + harvesters.length);

  let repairers = _.filter(Game.creeps, (creep) =>
    creep.memory.role == 'repairer');
  console.log('Repairers: ' + repairers.length);

  let totalWorkers = upgraders.length +
    builders.length +
    harvesters.length +
    repairers.length;

  let name;
  let energyCapacity = spawn.room.energyCapacityAvailable;

  //Autobuild creeps:
  //Prioritize maintaining the minimum number of each creep in order.
  if (harvesters.length < HARVESTER_MINIMUM) {
    name = spawn.createBiggestWorkerCreep(energyCapacity, 'harvester');
    if (name == ERR_NOT_ENOUGH_ENERGY &&
      harvesters.length < CRITICAL_HARVESTER_COUNT) {
      //If very few harvesters are alive, build one
      //using whatever energy is available.
      spawn.createBiggestWorkerCreep(spawn.room.energyAvailable, 'harvester');
    }
  } else if (repairers.length < REPAIRER_MINIMUM) {
    name = spawn.createBiggestWorkerCreep(energyCapacity, 'repairer');
  } else if (builders.length < BUILDER_MINIMUM) {
    name = spawn.createBiggestWorkerCreep(energyCapacity, 'builder');
  } else if (upgraders.length < UPGRADER_MINIMUM) {
    name = spawn.createBiggestWorkerCreep(energyCapacity, 'upgrader');
  } else {
    //Excess creeps will be of this role.
    name = spawn.createBiggestWorkerCreep(energyCapacity, 'builder');
  }

  //For each creep, have it act (run) according to its role.
  for (let name in Game.creeps) {
    let creep = Game.creeps[name];
    if (creep.memory.role == 'harvester') {
      creep.roleHarvester();
    } else if (creep.memory.role == 'upgrader') {
      creep.roleUpgrader();
    } else if (creep.memory.role == 'builder') {
      creep.roleBuilder();
    } else if (creep.memory.role == 'repairer') {
      creep.roleRepairer();
    }
  }
}; //End main loop.
