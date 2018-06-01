import profiler from "screeps-profiler";

import { creepBody } from "./creepBody";

/**
 * Contains constants and methods related to Spawns, including methods for
 * spawning creeps.
 */
const spawnFunctions = {
  /**
   * Build and assign a miner for the given room and sourceId.
   * @param {string} sourceId
   * @param {StructureSpawn} spawn
   * @param {BodyPartConstant[]} body
   * @param {string} name = undefined
   */
  buildMiner(
    sourceId: string,
    spawn: StructureSpawn,
    body: BodyPartConstant[],
    name?: string): string | ScreepsReturnCode | undefined {
    if (sourceId) {
      const newCreepName: any = this.createCreepWithMemory(spawn, {
        assignedSourceId: sourceId,
        role: "miner"
      }, body, name);

      const minerPath = spawn.pos.findPathTo(Game.getObjectById(sourceId) as Source, {
        ignoreCreeps: true
      });
      spawn.room.memory.sourceAssignments[sourceId].path = minerPath;

      if (newCreepName !== ERR_NOT_ENOUGH_ENERGY && newCreepName !== ERR_BUSY) {
        spawn.room.memory.sourceAssignments[sourceId].minerName = newCreepName;
      }

      return newCreepName as string | ScreepsReturnCode;
    }
    return undefined;
  },

  /**
   * Creates a creep with the given memory.
   * Optionally, a body and name can be provided.
   * @param {StructureSpawn} spawn
   * @param {any} memory
   * @param {BodyPartConstant[]} body = [WORK, WORK, CARRY, MOVE]
   * @param {string} name = undefined
   */
  createCreepWithMemory(
    spawn: StructureSpawn,
    memory: any,
    body: BodyPartConstant[] = [WORK, CARRY, MOVE, MOVE],
    name?: string): string | ScreepsReturnCode {
    const trimmedBody: BodyPartConstant[] = creepBody.trimExtraPartsToEnergyCapacity(spawn.room, body);
    const sortedBody = creepBody.sortBody(trimmedBody);

    const nameOutput = spawn.createCreep(sortedBody, name, memory);

    if (nameOutput !== ERR_NOT_ENOUGH_ENERGY && nameOutput !== ERR_BUSY) {
      console.log("Room " + spawn.room.name + ": Spawning new " + memory.role + ": " + nameOutput);
    }

    return nameOutput;
  },

  /**
   * Creates a creep with the given role.
   * Optionally, a body and name can be provided.
   * @param {StructureSpawn} spawn
   * @param {string} role
   * @param {BodyPartConstant[]} body = [WORK, WORK, CARRY, MOVE]
   * @param {string} name = undefined
   */
  createCreepWithRole(
    spawn: StructureSpawn,
    role: string,
    body: BodyPartConstant[] = [WORK, WORK, CARRY, MOVE],
    name?: string): string | ScreepsReturnCode {
    return this.createCreepWithMemory(spawn, { role }, body, name);
  },

  /**
   * Display a visual if the spawn is creating a creep.
   * @param {StructureSpawn} spawn
   */
  displayCreateCreepVisual(spawn: StructureSpawn) {
    if (spawn.spawning) {
      const spawningCreep = Game.creeps[spawn.spawning.name];
      const progressPercentage = Math.round(((spawn.spawning.needTime -
        (spawn.spawning.remainingTime - 1)) / spawn.spawning.needTime) * 100);
      spawn.room.visual.text(
        spawningCreep.memory.role + " " + spawningCreep.name +
        " (" + progressPercentage + "%)",
        spawn.pos.x + 1,
        spawn.pos.y, {
          align: "left",
          opacity: 0.8
        });
    }
  }
};

profiler.registerObject(spawnFunctions, "spawn");
export { spawnFunctions };
