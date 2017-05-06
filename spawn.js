let creepBody = require('creepBody');

/**
Creates a creep with the given memory.
Optionally, a body and name can be provided.
@param {Spawn} spawn
@param {Object} memory
@param {array} body = [WORK, WORK, CARRY, MOVE]
@param {string} name = undefined
*/
function createCreepWithMemory(spawn, memory, body = [WORK, CARRY, MOVE, MOVE],
  name = undefined) {
  let trimmedBody = creepBody.trimExtraParts(spawn.room, body);
  let sortedBody = creepBody.sortBody(trimmedBody);

  name = spawn.createCreep(sortedBody, name, memory);

  if (name != ERR_NOT_ENOUGH_ENERGY && name != ERR_BUSY) {
    console.log('Room ' + spawn.room.name + ': Spawning new ' + memory.role + ': ' + name);
  }

  return name;
}

/**
Creates a creep with the given role.
Optionally, a body and name can be provided.
@param {Spawn} spawn
@param {string} role
@param {array} body = [WORK, WORK, CARRY, MOVE]
@param {string} name = undefined
*/
function createCreepWithRole(spawn, role, body = [WORK, WORK, CARRY, MOVE],
  name = undefined) {
  return createCreepWithMemory(spawn, {
    role: role
  }, body, name);
}

/**
Display a visual if the spawn is creating a creep.
@param {Spawn} spawn
*/
function displayCreateCreepVisual(spawn) {
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

module.exports = {
  createCreepWithMemory,
  createCreepWithRole,
  displayCreateCreepVisual
};
