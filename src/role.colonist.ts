import profiler from "screeps-profiler";
import { creepBehavior } from "./behavior.creep";

/**
 * Builder / Harvester that goes to the room with the newColonyFlagName flag
 * in it and gathers energy from sources, then builds a constructionSite for
 * a Spawn in that room.
 */
const roleColonist = {
  newColonyFlagName: "newColony",

  /**
   * Runs role logic on the given creep.
   * @param {Creep} creep
   */
  run(creep: Creep) {
    // if not in target room, go to target room.
    const colonyFlag = Game.flags[this.newColonyFlagName];
    if (colonyFlag && creep.room.name !== colonyFlag.pos.roomName) {
      creep.moveTo(colonyFlag.pos, {
        visualizePathStyle: {
          stroke: "#B99CFB"
        }
      });
    } else if (creep.room.find(FIND_MY_SPAWNS).length) {
      // if in target room AND a completed spawn exists, change Memory role to harvester.
      creep.memory.role = "harvester";
      console.log("Colonist " + creep.name + " changed role to harvester in room " + creep.room.name);
    } else {
      // if harvesting, harvest until full. When full go to build.
      if (creep.memory.colonizing && creep.carry.energy === 0) {
        creep.memory.colonizing = false;
        creep.say("harvest");
      }

      // if building, build until empty. Then go harvest.
      if (!creep.memory.colonizing && creep.carry.energy === creep.carryCapacity) {
        creep.memory.colonizing = true;
        creep.say("building spawn");
      }

      if (!creep.memory.colonizing) {
        creepBehavior.gatherFromClosestSource(creep);
      } else {
        // if the creep does not have the spawn constructionsiteID
        // in memory, get it.
        if (!creep.memory.colonySpawnSiteID) {
          creep.memory.colonySpawnSiteID = creep.room.find(FIND_MY_CONSTRUCTION_SITES, {
            filter: (structure) => {
              return structure.structureType === STRUCTURE_SPAWN;
            }
          })[0].id;
        }
        const colonySpawn = Game.getObjectById(creep.memory.colonySpawnSiteID) as ConstructionSite;
        if (creep.build(colonySpawn) === ERR_NOT_IN_RANGE) {
          creep.moveTo(colonySpawn, {
            visualizePathStyle: {
              stroke: "#ffffff"
            }
          });
        }
      }
    }
  }
};

profiler.registerObject(roleColonist, "role.colonist");
export { roleColonist };
