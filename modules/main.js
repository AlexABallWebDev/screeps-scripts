

// Require other modules and prototypes.

/**Prototype for spawn objects.*/
require('prototype.spawn')();

/**Prototype for creep objects.*/
require('prototype.creep')();

/**Functions that are used across different modules.*/
const FUNCTIONS = require('functions');

// Constants

/**Critical number of harvesters. We need to have at least this many
 * harvesters before building bigger creeps
 */
const CRITICAL_HARVESTER_COUNT = 1;

/**Minimum number of harvesters.*/
const HARVESTER_MINIMUM = 2;

/**Minimum number of upgraders.*/
const UPGRADER_MINIMUM = 1;

/**Minimum number of builders.*/
const BUILDER_MINIMUM = 2;

/**Minimum number of repairers.*/
const REPAIRER_MINIMUM = 1;

/**Minimum number of creeps.*/
const WORKERS_MINIMUM = HARVESTER_MINIMUM +
  UPGRADER_MINIMUM +
  BUILDER_MINIMUM +
  REPAIRER_MINIMUM;

/**Only targets with less that this much health will be repaired by towers.*/
const TOWER_REPAIR_MAX_HEALTH = 100000;

/**Minimum energy for towers to save for attacking hostile targets.*/
const TOWER_MINIMUM_ENERGY = 700;

/**filter for helping a tower find a target to repair.*/
const TOWER_REPAIR_TARGET = {
  filter: (structure) => structure.hits < structure.hitsMax &&
    structure.hits !== undefined &&
    structure.hits > 0
};

/**Base Worker Body. 2W, 1C, 1M.*/
const BASE_WORKER_BODY = [WORK, WORK, CARRY, MOVE];

//Begin main loop.
module.exports.loop = function() {

  //Cleanup memory.
  FUNCTIONS.clearDeadCreepMemory();

  let spawn = Game.spawns.Spawn1;

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
    //name = spawn.createBiggestWorkerCreep(energyCapacity, 'builder');
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

  //Tower logic

  //Get towers.
  let towers = _.filter(Game.structures, (structure) =>
    structure.structureType == STRUCTURE_TOWER);
  for (let tower of towers) {

    //Find damaged structures.
    let structures = tower.room.find(FIND_STRUCTURES, TOWER_REPAIR_TARGET);

    let lowestHitsStructure;

    //Find the most damaged (lowest hits) structure.
    for (let structure of structures) {
      if (lowestHitsStructure === undefined ||
        structure.hits < lowestHitsStructure.hits) {
        lowestHitsStructure = structure;
      }
    }

    /*
    //find closest damaged structure.
    let closestDamagedStructure = tower.pos
      .findClosestByRange(FIND_STRUCTURES, TOWER_REPAIR_TARGET);
    */

    //find closest hostile creep.
    let closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);

    //prioritize shooting enemy creeps over repairing structures.
    if (closestHostile) {
      tower.attack(closestHostile);
    } else if (lowestHitsStructure &&
      tower.energy > TOWER_MINIMUM_ENERGY &&
      totalWorkers >= WORKERS_MINIMUM &&
      lowestHitsStructure.hits < TOWER_REPAIR_MAX_HEALTH) {
      //Only repair if enough energy is saved up (in case of attacks)
      //and enough workers are supplying the base.
      tower.repair(lowestHitsStructure);
    }
  }
}; //End main loop.
