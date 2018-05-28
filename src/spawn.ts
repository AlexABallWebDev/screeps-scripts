import * as creepBody from "./creepBody";

/**
Creates a creep with the given memory.
Optionally, a body and name can be provided.
@param {StructureSpawn} spawn
@param {any} memory
@param {BodyPartConstant[]} body = [WORK, WORK, CARRY, MOVE]
@param {string} name = undefined
*/
export function createCreepWithMemory(spawn: StructureSpawn, memory: any, body: BodyPartConstant[] = [WORK, CARRY, MOVE, MOVE],
  name: any = undefined): string {
  const trimmedBody: BodyPartConstant[] = creepBody.trimExtraParts(spawn.room, body);
  const sortedBody = creepBody.sortBody(trimmedBody);

  const nameOutput = spawn.createCreep(sortedBody, name, memory);

  if (nameOutput != ERR_NOT_ENOUGH_ENERGY && nameOutput != ERR_BUSY) {
    console.log('Room ' + spawn.room.name + ': Spawning new ' + memory.role + ': ' + nameOutput);
  }

  return nameOutput as string;
}

/**
Creates a creep with the given role.
Optionally, a body and name can be provided.
@param {StructureSpawn} spawn
@param {string} role
@param {BodyPartConstant[]} body = [WORK, WORK, CARRY, MOVE]
@param {string} name = undefined
*/
export function createCreepWithRole(spawn: StructureSpawn, role: string, body: BodyPartConstant[] = [WORK, WORK, CARRY, MOVE],
  name: any = undefined): string {
  return createCreepWithMemory(spawn, {
    role: role
  }, body, name);
}

/**
Display a visual if the spawn is creating a creep.
@param {StructureSpawn} spawn
*/
export function displayCreateCreepVisual(spawn: StructureSpawn) {
  if (spawn.spawning) {
    let spawningCreep = Game.creeps[spawn.spawning.name];
    let progressPercentage = Math.round(((spawn.spawning.needTime -
      (spawn.spawning.remainingTime - 1)) / spawn.spawning.needTime) * 100);
    spawn.room.visual.text(
      '🛠️' + spawningCreep.memory.role + " " + spawningCreep.name +
      " (" + progressPercentage + "%)",
      spawn.pos.x + 1,
      spawn.pos.y, {
        align: 'left',
        opacity: 0.8
      });
  }
}
