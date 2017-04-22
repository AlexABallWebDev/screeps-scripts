/**
Creates a creep with the given memory.
Optionally, a name can be provided.
@param {Spawn} spawn
@param {Object} memory
@param {string} name = undefined
*/
function createCreepWithMemory(spawn, memory, name = undefined) {
  name = spawn.createCreep([WORK, WORK, CARRY, MOVE], name, memory);

  if (name != -6) {
    console.log('Spawning new ' + memory.role + ': ' + name);
  }

  return name;
}

/**
Creates a creep with the given role.
Optionally, a name can be provided.
@param {Spawn} spawn
@param {string} role
@param {string} name = undefined
*/
function createCreepWithRole(spawn, role, name = undefined) {
  return createCreepWithMemory(spawn, {
    role: role
  }, name);
}

/**
Display a visual if the spawn is creating a creep.
@param {Spawn} spawn
*/
function displayCreateCreepVisual(spawn) {
  if (spawn.spawning) {
    let spawningCreep = Game.creeps[spawn.spawning.name];
    spawn.room.visual.text(
      '🛠️' + spawningCreep.memory.role,
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
