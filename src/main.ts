/**
Author: Alex Ball
screeps-scripts

scripts for the JavaScript-based MMO Screeps.
*/

// 3rd party imports
import profiler from "screeps-profiler";

import { ErrorMapper } from "utils/ErrorMapper";

// My codebase imports
import { towerFunctions } from "./tower";

import { creepBody } from "./creepBody";
import { roomFunctions } from "./room";
import { roomConstruction } from "./roomConstruction";
import { spawnFunctions } from "./spawn";

import { roleBuilder } from "./role.builder";
import { roleClaimer } from "./role.claimer";
import { roleColonist } from "./role.colonist";
import { roleCourier } from "./role.courier";
import { roleDefender } from "./role.defender";
import { roleHarvester } from "./role.harvester";
import { roleMiner } from "./role.miner";
import { roleUpgrader } from "./role.upgrader";

/**Diagnostic and utility functions*/
import { utilityFunctions } from "./functions";

const roles: any = {
  defender: roleDefender,
  harvester: roleHarvester,
  upgrader: roleUpgrader,
  builder: roleBuilder,
  miner: roleMiner,
  courier: roleCourier,
  claimer: roleClaimer,
  colonist: roleColonist,
};

// profiler.enable();
// Begin main loop.
export const loop = ErrorMapper.wrapLoop(() => {
  profiler.wrap(() => {
    utilityFunctions.respawn();
    utilityFunctions.clearDeadCreepMemory();
    utilityFunctions.clearMissingFlagMemory();

    // cleanup dead claimer
    if (Memory.claimerName && !Game.creeps[Memory.claimerName]) {
      Memory.claimerName = undefined;
    }

    // cleanup dead colonists
    for (let name in Memory.colonistNames) {
      if (!Game.creeps[name]) {
        delete Memory.colonistNames[name];
      }
    }

    // count my rooms (used for determining if I can expand)
    let myRooms = _.filter(Game.rooms, { controller: { my: true}});
    let myRoomCount = _.size(myRooms);

    towerFunctions.runTowerLogic();

    for (let roomName in Game.rooms) {
      let room = Game.rooms[roomName];

      roomFunctions.checkForSources(room);

      // if there is a newClaim in one of my rooms, delete it and replace
      // it with a newColony if there is not already a newColony.
      let claimFlag = Game.flags['newClaim'];
      if (claimFlag &&
        !Game.flags['newColony'] &&
        Game.rooms[claimFlag.pos.roomName] &&
        Game.rooms[claimFlag.pos.roomName].controller &&
        Game.rooms[claimFlag.pos.roomName].controller!.my) {
        // replace newClaim with newColony in the same position
        claimFlag.pos.createFlag('newColony', COLOR_PURPLE);
        claimFlag.remove();
      }

      // handle a new colony. Decides to build a spawn in,
      // abandon, or finish a colony.
      let colonyFlag = Game.flags['newColony'];
      if (colonyFlag) {
        if (!colonyFlag.room!.controller!.my) {
          // If the colony is in a room that is not mine, abandon it.
          console.log('Colony room not owned by me. Abandoning colony: ' + colonyFlag.room!.name);
          Memory.colonySpawnSiteID = undefined;
          colonyFlag.remove();
        } else if (!Memory.colonySpawnSiteID) {
          // If the spawn constructionSite is not in memory, get it.
          colonyFlag.pos.createConstructionSite(STRUCTURE_SPAWN);
          let colonySpawnSites = colonyFlag.room!.find(FIND_MY_CONSTRUCTION_SITES, {
            filter: (constructionSite) => constructionSite.structureType === STRUCTURE_SPAWN
          });
          if (colonySpawnSites.length && colonySpawnSites[0].id) {
            Memory.colonySpawnSiteID = colonySpawnSites[0].id;
          }
        } else if (Memory.colonySpawnSiteID && !Game.getObjectById(Memory.colonySpawnSiteID)) {
          // If we can't find the spawn constructionSite, it either finished
          // or was destroyed. Either way, delete the colony flag.
          console.log('Colony spawn finished/destroyed. removing colony flag in: ' + colonyFlag.room!.name);
          Memory.colonySpawnSiteID = undefined;
          colonyFlag.remove();
        }
      }

      let creepsOfRole: any = {};

      for (let roleName in roles) {
        creepsOfRole[roleName] = {};
      }

      let roomCreeps = room.find(FIND_MY_CREEPS);

      for (let creepIndex in roomCreeps) {
        let creep = roomCreeps[creepIndex];
        if (roles[creep.memory.role]) {
          creepsOfRole[creep.memory.role][creep.name] = creep.id;
          roles[creep.memory.role].run(creep);
        }
      }

      if (room.controller && room.controller.my) {
        utilityFunctions.checkForLevelUp(room);

        roomFunctions.createTowerAssignments(room);

        let spawns: StructureSpawn[] = room.find(FIND_MY_STRUCTURES, {
          filter: (structure) => structure.structureType === STRUCTURE_SPAWN
        }) as StructureSpawn[];

        for (let spawnIndex in spawns) {
          let spawn = spawns[spawnIndex];
          let sourceIdMissingMiner = roomFunctions.findSourceIdMissingMiner(room);

          if (_.size(room.find(FIND_HOSTILE_CREEPS)) > 0 && _.size(creepsOfRole.defender) < 2) {
            spawnFunctions.createCreepWithRole(spawn, "defender", creepBody.defender);
          } else if (_.size(Game.creeps) < 2) {
            spawnFunctions.createCreepWithRole(spawn, "harvester", creepBody.harvester);
          } else if (_.size(creepsOfRole.courier) < 1) {
            spawnFunctions.createCreepWithRole(spawn, "courier", creepBody.courier);
          } else if (sourceIdMissingMiner) {
            let minerName = roomFunctions.buildMiner(room, sourceIdMissingMiner, spawn, creepBody.miner);
            if (minerName == ERR_NOT_ENOUGH_ENERGY && _.size(creepsOfRole.miner) < 1 && _.size(creepsOfRole.harvester) < 2) {
              spawnFunctions.createCreepWithRole(spawn, "harvester", creepBody.harvester);
            }
          } else if (_.size(creepsOfRole.courier) < 3) {
            spawnFunctions.createCreepWithRole(spawn, "courier", creepBody.courier);
          } else if (_.size(room.find(FIND_MY_CONSTRUCTION_SITES)) > 0 && _.size(creepsOfRole.builder) < 2) {
            spawnFunctions.createCreepWithRole(spawn, "builder", creepBody.builder);
          } else if (_.size(creepsOfRole.upgrader) < 2) {
            spawnFunctions.createCreepWithRole(spawn, "upgrader", creepBody.upgrader);
          } else if (myRoomCount < Game.gcl.level &&
            Game.flags['newClaim'] && !Memory.claimerName &&
            creepBody.bodyCost(creepBody.claimer) <= room.energyCapacityAvailable) {
            let claimerName = spawnFunctions.createCreepWithRole(spawn, 'claimer', creepBody.claimer);
            if (typeof claimerName == 'string') {
              Memory.claimerName = claimerName;
            }
          } else if (Game.flags['newColony'] && _.size(Memory.colonistNames) < 3) {
            let colonistName = spawnFunctions.createCreepWithRole(spawn, 'colonist', creepBody.colonist);
            if (typeof colonistName == 'string') {
              Memory.colonistNames[colonistName] = colonistName;
            }
          }

          spawnFunctions.displayCreateCreepVisual(spawn);

          roomConstruction.placeUpgraderContainer(room, spawn.pos);

          roomConstruction.addExtensionsToRoom(room, spawn.pos);

          roomConstruction.placeTowers(room, spawn.pos);
        }
      }
    }
  });
});
