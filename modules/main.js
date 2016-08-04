//Tell jshint (atom package) to stop showing certain irrelevent warnings.
/*jshint esversion: 6 */

// Constants

/**Minimum number of harvesters.*/
let HARVESTER_MINIMUM = 10;

/**Minimum number of upgraders.*/
let UPGRADER_MINIMUM = 2;

/**Minimum number of builders.*/
let BUILDER_MINIMUM = 2;

/**Minimum number of builders.*/
let REPAIRER_MINIMUM = 2;

/**filter for helping a tower find a target to repair.*/
let TOWER_REPAIR_TARGET = {
  filter: (structure) => structure.hits < structure.hitsMax &&
    structure.structureType != STRUCTURE_WALL &&
    structure.hits < 200000
};

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
    functions.spawnHarvester();
  } else if (repairers.length < REPAIRER_MINIMUM) {
    functions.spawnRepairer();
  } else if (builders.length < BUILDER_MINIMUM) {
    functions.spawnBuilder();
  } else if (upgraders.length < UPGRADER_MINIMUM) {
    functions.spawnUpgrader();
  } else {
    //Excess creeps will be of this role.
    functions.spawnBuilder();
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
    } else if (closestDamagedStructure && tower.energy > 600) {
      tower.repair(closestDamagedStructure);
    }
  }
}; //End main loop.
