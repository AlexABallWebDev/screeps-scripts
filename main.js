/**
Author: Alex Ball
screeps-scripts

scripts for the JavaScript-based MMO Screeps.
*/

const towerFunctions = require('tower');

const spawnFunctions = require('spawn');
const roomFunctions = require('room');
const roomConstruction = require('roomConstruction');

const roleDefender = require("role.defender");
const roleHarvester = require('role.harvester');
const roleUpgrader = require('role.upgrader');
const roleBuilder = require('role.builder');
const roleMiner = require('role.miner');
const roleCourier = require('role.courier');

const roles = {
  defender: roleDefender,
  harvester: roleHarvester,
  upgrader: roleUpgrader,
  builder: roleBuilder,
  miner: roleMiner,
  courier: roleCourier,
};

/**Diagnostic and utility functions*/
const utilityFunctions = require('functions');

//Begin main loop.
module.exports.loop = function() {
  utilityFunctions.respawn();
  utilityFunctions.clearDeadCreepMemory();
  utilityFunctions.clearMissingFlagMemory();

  towerFunctions.runTowerLogic();

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

  for (let roomName in Game.rooms) {
    let room = Game.rooms[roomName];

    utilityFunctions.checkForLevelUp(room);

    let spawns = room.find(FIND_MY_STRUCTURES, {
      filter: {
        structureType: STRUCTURE_SPAWN
      }
    });

    for (let spawnIndex in spawns) {
      let spawn = spawns[spawnIndex];

      const CREEP_BODY = {
        defender: [ATTACK, ATTACK, MOVE, MOVE, ATTACK, ATTACK, MOVE, MOVE],
        harvester: [WORK, MOVE, CARRY, MOVE],
        courier: [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, CARRY, MOVE, CARRY,
          MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY
        ],
        miner: [WORK, WORK, MOVE, WORK, WORK, MOVE, WORK],
        builder: [WORK, WORK, CARRY, MOVE, MOVE, MOVE, CARRY, WORK, MOVE, CARRY,
          WORK, MOVE, CARRY, WORK, MOVE, CARRY, WORK, MOVE, CARRY, WORK, MOVE, CARRY, WORK
        ],
        upgrader: [WORK, WORK, CARRY, MOVE, CARRY, WORK, MOVE, WORK, WORK,
          MOVE, CARRY, WORK, MOVE, WORK, WORK, MOVE, CARRY, WORK, MOVE, WORK, WORK, MOVE
        ]
      };

      roomFunctions.checkForSources(room);
      let sourceIdMissingMiner = roomFunctions.findSourceIdMissingMiner(room);

      if (_.size(room.find(FIND_HOSTILE_CREEPS)) > 0 && _.size(creepsOfRole.defender) < 2) {
        spawnFunctions.createCreepWithRole(spawn, "defender", CREEP_BODY.defender);
      } else if (_.size(Game.creeps) < 2) {
        spawnFunctions.createCreepWithRole(spawn, "harvester", CREEP_BODY.harvester);
      } else if (_.size(creepsOfRole.courier) < 1) {
        spawnFunctions.createCreepWithRole(spawn, "courier", CREEP_BODY.courier);
      } else if (sourceIdMissingMiner) {
        let minerName = roomFunctions.buildMiner(room, sourceIdMissingMiner, spawn, CREEP_BODY.miner);
        if (minerName == ERR_NOT_ENOUGH_ENERGY && _.size(creepsOfRole.miner) < 1 && _.size(creepsOfRole.harvester) < 2) {
          spawnFunctions.createCreepWithRole(spawn, "harvester", CREEP_BODY.harvester);
        }
      } else if (_.size(creepsOfRole.courier) < 3) {
        spawnFunctions.createCreepWithRole(spawn, "courier", CREEP_BODY.courier);
      } else if (_.size(room.find(FIND_MY_CONSTRUCTION_SITES)) > 0 && _.size(creepsOfRole.builder) < 2) {
        spawnFunctions.createCreepWithRole(spawn, "builder", CREEP_BODY.builder);
      } else if (_.size(creepsOfRole.upgrader) < 2) {
        spawnFunctions.createCreepWithRole(spawn, "upgrader", CREEP_BODY.upgrader);
      }

      spawnFunctions.displayCreateCreepVisual(spawn);

      roomConstruction.placeUpgraderContainer(room, spawn.pos);

      roomConstruction.addExtensionsToRoom(room, spawn.pos);

      roomFunctions.createTowerAssignments(room);

      roomConstruction.placeTowers(room, spawn.pos);
    }
  }
};
