function createCreepWithRole(spawn, role, name = undefined) {
  name = spawn.createCreep([WORK, WORK, CARRY, MOVE],
    name, {
      role: role
    });

  if (name != -6) {
    console.log('Spawning new ' + role + ': ' + name);
  }
}

module.exports = {
  createCreepWithRole
};
