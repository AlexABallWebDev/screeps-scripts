/**
Author: Alex Ball
screeps-scripts

scripts for the JavaScript-based MMO Screeps.
*/

require('tower').runTowerLogic();

const spawnFunctions = require('spawn');
const roomFunctions = require('room');

const roleHarvester = require('role.harvester');
const roleUpgrader = require('role.upgrader');
const roleBuilder = require('role.builder');
const roleMiner = require('role.miner');
const roleCourier = require('role.courier');

const roles = {
  harvester: roleHarvester,
  upgrader: roleUpgrader,
  builder: roleBuilder,
  miner: roleMiner,
  courier: roleCourier,
};

/**Diagnostic and utility functions*/
const FUNCTIONS = require('functions');

//Begin main loop.
module.exports.loop = function() {
  FUNCTIONS.respawn();
  FUNCTIONS.clearDeadCreepMemory();

  let creepsOfRole = {};

  for (let roleName in roles) {
    creepsOfRole[roleName] = {};
  }

  for (let name in Game.creeps) {
    let creep = Game.creeps[name];
    if (roles[creep.memory.role]) {
      creepsOfRole[creep.memory.role][name] = creep.id;
      roles[creep.memory.role].run(creep);
    }
  }

  let spawn = Game.spawns.Spawn1;
  for (let roomName in Game.rooms) {
    let room = Game.rooms[roomName];

    FUNCTIONS.checkForLevelUp(room);

    let spawns = room.find(FIND_MY_STRUCTURES, {
      filter: {
        structureType: STRUCTURE_SPAWN
      }
    });

    let spawn = spawns[0];

    roomFunctions.checkForSources(room);
    let sourceIdMissingMiner = roomFunctions.findSourceIdMissingMiner(room);

    if (_.size(Game.creeps) < 2) {
      spawnFunctions.createCreepWithRole(spawn, 'harvester');
    } else if (_.size(creepsOfRole.courier) < 1) {
      spawnFunctions.createCreepWithRole(spawn, 'courier');
    } else if (sourceIdMissingMiner) {
      roomFunctions.buildMiner(room, sourceIdMissingMiner, spawn);
    } else if (_.size(creepsOfRole.courier) < 4) {
      spawnFunctions.createCreepWithRole(spawn, 'courier');
    } else if (_.size(creepsOfRole.builder) < 2) {
      spawnFunctions.createCreepWithRole(spawn, 'builder');
    } else if (_.size(creepsOfRole.upgrader) < 2) {
      spawnFunctions.createCreepWithRole(spawn, 'upgrader');
    }

    spawnFunctions.displayCreateCreepVisual(spawn);

    if (!Memory.flags[room.name + " upContainer"]) {
      roomFunctions.placeUpgraderContainer(room, spawn.pos);
    }

    // roomFunctions.AddExtensionsToRoom(room, spawn.pos);
    console.log(JSON.stringify(Game.cpu.getUsed()));
  }
};
