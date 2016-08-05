//Tell jshint (atom package) to stop showing certain irrelevent warnings.
/*jshint esversion: 6 */

// Constants

/**Minimum number of harvesters.*/
let HARVESTER_MINIMUM = 6;

/**Minimum number of upgraders.*/
let UPGRADER_MINIMUM = 2;

/**Minimum number of builders.*/
let BUILDER_MINIMUM = 2;

/**Minimum number of builders.*/
let REPAIRER_MINIMUM = 2;

/**Only targets with less that this much health will be repaired by towers.*/
let TOWER_REPAIR_MAX_HEALTH = 200000;

/**Minimum energy for towers to save for attacking hostile targets.*/
let TOWER_MINIMUM_ENERGY = 800;

/**filter for helping a tower find a target to repair.*/
let TOWER_REPAIR_TARGET = {
  filter: (structure) => structure.hits < structure.hitsMax &&
    //structure.structureType != STRUCTURE_WALL &&
    structure.hits < TOWER_REPAIR_MAX_HEALTH
};

/**Base Worker Body. 2W, 1C, 1M.*/
let BASE_WORKER_BODY = [WORK, WORK, WORK, CARRY, MOVE, MOVE];

// Require other modules.

/**Harvester role.*/
let roleHarvester = require('role.harvester');

/**Upgrader role.*/
let roleUpgrader = require('role.upgrader');

/**Builder role.*/
let roleBuilder = require('role.builder');

/**Repairer role.*/
let roleRepairer = require('role.repairer');

/**Functions that are used across different modules.*/
let functions = require('functions');

//Begin main loop.
module.exports.loop = function() {

  //Cleanup memory.
  functions.clearDeadCreepMemory();

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

  //Autobuild creeps:
  //Prioritize maintaining the minimum number of each creep in order.
  if (harvesters.length < HARVESTER_MINIMUM) {
    functions.spawnHarvester(BASE_WORKER_BODY);
  } else if (repairers.length < REPAIRER_MINIMUM) {
    functions.spawnRepairer(BASE_WORKER_BODY);
  } else if (builders.length < BUILDER_MINIMUM) {
    functions.spawnBuilder(BASE_WORKER_BODY);
  } else if (upgraders.length < UPGRADER_MINIMUM) {
    functions.spawnUpgrader(BASE_WORKER_BODY);
  } else {
    //Excess creeps will be of this role.
    functions.spawnBuilder(BASE_WORKER_BODY);
  }

  //For each creep, have it act (run) according to its role.
  for (let name in Game.creeps) {
    let creep = Game.creeps[name];
    if (creep.memory.role == 'harvester') {
      roleHarvester.run(creep);
    } else if (creep.memory.role == 'upgrader') {
      roleUpgrader.run(creep);
    } else if (creep.memory.role == 'builder') {
      roleBuilder.run(creep);
    } else if (creep.memory.role == 'repairer') {
      roleRepairer.run(creep);
    }
  }

  //Tower logic, works for a single tower that has a given ID.

  //get towers.
  let towers = _.filter(Game.structures, (structure) =>
    structure.structureType == STRUCTURE_TOWER);
  //let tower = Game.getObjectById('57a295732787488b246b8961');
  for (let towerref in towers) {
    //Get tower out of towers hash
    let tower = towers[towerref];

    //find closest damaged structure.
    let closestDamagedStructure = tower.pos
      .findClosestByRange(FIND_STRUCTURES, TOWER_REPAIR_TARGET);

    //find closest hostile creep.
    let closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);

    //prioritize shooting enemy creeps over repairing structures.
    if (closestHostile) {
      tower.attack(closestHostile);
    } else if (closestDamagedStructure &&
      tower.energy > TOWER_MINIMUM_ENERGY) {
      //Only repair if enough energy is saved up (in case of attacks).
      tower.repair(closestDamagedStructure);
    }
  }
}; //End main loop.
