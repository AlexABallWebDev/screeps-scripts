//Tell jshint (atom package) to stop showing certain irrelevent warnings.
/*jshint esversion: 6 */

// Constants

/**Minimum number of harvesters.*/
let HARVESTER_MINIMUM = 10;

/**Minimum number of upgraders.*/
let UPGRADER_MINIMUM = 1;

/**Minimum number of builders.*/
let BUILDER_MINIMUM = 2;

// Require the other modules.

/**Harvester role.*/
let roleHarvester = require('role.harvester');

/**Upgrader role.*/
let roleUpgrader = require('role.upgrader');

/**Builder role.*/
let roleBuilder = require('role.builder');

let functions = require('functions');

//Begin main loop.
module.exports.loop = function () {

    //Cleanup memory.
    functions.clearDeadCreepMemory();

    //Count the number of each creep role.
    let upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    console.log('Upgraders: ' + upgraders.length);

    let builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    console.log('Builders: ' + builders.length);

    let harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    console.log('Harvesters: ' + harvesters.length);

    //Autobuild creeps:
    if(harvesters.length < HARVESTER_MINIMUM) {
        //Prioritize maintaining the minimum number of harvesters first.
        functions.spawnHarvester();
    } else if(builders.length < BUILDER_MINIMUM) {
        //Prioritize builders next.
        functions.spawnBuilder();
    } else if(upgraders.length < UPGRADER_MINIMUM){
        //Prioritize upgraders next.
        functions.spawnUpgrader();
    } else {
        //Excess creeps will be of this role.
        functions.spawnBuilder();
    }

    //For each creep, have it act (run) according to its role.
    for(let name in Game.creeps) {
        let creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
    }

    //Tower logic, works for a single tower that has a given ID.
    /*
    let tower = Game.getObjectById('519170edb0e79b2eeb360e71');
    if(tower) {
        let closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });
        if(closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
        }

        let closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
        }
    }*/
}; //End main game loop.
