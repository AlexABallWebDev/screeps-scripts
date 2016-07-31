//Tell jshint (atom package) to stop showing certain irrelevent warnings.
/*jshint esversion: 6 */

var harvesterCapacity = 4;

var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');

var clearDeadCreepMemory = function() {
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
};

var getNextSource = function() {
    var harvestSource = 0;
    var sources = Game.spawns.Spawn1.room.find(FIND_SOURCES);
    if (Game.spawns.Spawn1.nextSource === undefined || Game.spawns.Spawn1.nextSource >= sources.length) {
        Game.spawns.Spawn1.nextSource = 0;
    }
    else {
        harvestSource = sources[Game.spawns.Spawn1.nextSource];
        Game.spawns.Spawn1.nextSource += 1;
    }
    return harvestSource;
};

var spawnUpgrader = function() {
    var harvestSource = getNextSource();

    var creepMemory = {role: 'upgrader', source: harvestSource};
    var newName = Game.spawns.Spawn1.createCreep([WORK,CARRY,MOVE], undefined, creepMemory);
    if (newName != -6) {
        console.log('Spawning new upgrader: ' + newName);
    }
};

var spawnHarvester = function () {
    var harvestSource = getNextSource();

    var creepMemory = {role: 'harvester', source: harvestSource};
    var newName = Game.spawns.Spawn1.createCreep([WORK,CARRY,MOVE], undefined, creepMemory);
    if (newName != -6) {
        console.log('Spawning new harvester: ' + newName);
    }
};

module.exports.loop = function () {

    var tower = Game.getObjectById('519170edb0e79b2eeb360e71');
    if(tower) {
        var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });
        if(closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
        }

        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
        }
    }

    clearDeadCreepMemory();

    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    console.log('Harvesters: ' + harvesters.length);

    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    console.log('Upgraders: ' + upgraders.length);

    if(harvesters.length < harvesterCapacity) {
        spawnHarvester();
    }

    if(upgraders.length < harvesterCapacity) {
        spawnUpgrader();
    }

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
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
