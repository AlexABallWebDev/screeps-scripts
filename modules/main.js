//Tell jshint (atom package) to stop showing certain irrelevent warnings.
/*jshint esversion: 6 */

var harvesterCapacity = 6;
var upgraderCapacity = 10;
var builderCapacity = 2;

var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');

var clearDeadCreepMemory = function() {
    for(let name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
};

var getNextSource = function() {
    let harvestSource = 0;
    let sources = Game.spawns.Spawn1.room.find(FIND_SOURCES);
    if (Game.spawns.Spawn1.memory.nextSource === undefined || Game.spawns.Spawn1.memory.nextSource >= sources.length) {
        Game.spawns.Spawn1.memory.nextSource = 0;
    }
    else {
        harvestSource = Game.spawns.Spawn1.memory.nextSource;
        Game.spawns.Spawn1.memory.nextSource += 1;
    }
    return harvestSource;
};

var spawnUpgrader = function() {
    let harvestSource = getNextSource();

    let creepMemory = {role: 'upgrader', source: harvestSource};
    let newName = Game.spawns.Spawn1.createCreep([WORK,CARRY,MOVE,MOVE], undefined, creepMemory);
    if (newName >= 0 || typeof(newName) == 'string') {
        console.log('Spawning new upgrader: ' + newName);
    }
};

var spawnHarvester = function () {
    let harvestSource = getNextSource();

    let creepMemory = {role: 'harvester', source: harvestSource};
    let newName = Game.spawns.Spawn1.createCreep([WORK,CARRY,MOVE,MOVE], undefined, creepMemory);
    if (newName >= 0 || typeof(newName) == 'string') {
        console.log('Spawning new harvester: ' + newName);
    }
};

var spawnBuilder = function () {
    let harvestSource = getNextSource();

    let creepMemory = {role: 'builder', source: harvestSource};
    let newName = Game.spawns.Spawn1.createCreep([WORK,CARRY,MOVE,MOVE], undefined, creepMemory);
    if (newName >= 0 || typeof(newName) == 'string') {
        console.log('Spawning new builder: ' + newName);
    }
};

module.exports.loop = function () {

    var tower = Game.getObjectById('519170edb0e79b2eeb360e71');
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
    }

    clearDeadCreepMemory();

    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    console.log('Upgraders: ' + upgraders.length);

    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    console.log('Builders: ' + builders.length);

    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    console.log('Harvesters: ' + harvesters.length);

    if(harvesters.length < harvesterCapacity) {
        spawnHarvester();
    } else if(builders.length < builderCapacity) {
        spawnBuilder();
    } else {
        spawnUpgrader();
    }

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
};
