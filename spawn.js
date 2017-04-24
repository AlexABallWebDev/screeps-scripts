/**
Calculates the cost of a given body.
@param {array} body
*/
function bodyCost(body) {
  return body.reduce(function(cost, part) {
    return cost + BODYPART_COST[part];
  }, 0);
}

/**
Trims parts off of the given body array until the cost of the given body is
less than room.energyCapacityAvailable.
@param {Room} room
@param {array} body
*/
function trimExtraParts(room, body) {
  let cost = bodyCost(body);

  if (cost > room.energyCapacityAvailable) {
    let trimmedBody = [];
    let newCost = 0;
    for(let i = 0; i < body.length; i++) {
      if (newCost + BODYPART_COST[body[i]] > room.energyCapacityAvailable) {
        return trimmedBody;
      }

      newCost += BODYPART_COST[body[i]];
      trimmedBody.push(body[i]);
    }
  }

  return body;
}

/**
Creates a creep with the given memory.
Optionally, a body and name can be provided.
@param {Spawn} spawn
@param {Object} memory
@param {array} body = [WORK, WORK, CARRY, MOVE]
@param {string} name = undefined
*/
function createCreepWithMemory(spawn, memory, body = [WORK, WORK, CARRY, MOVE],
  name = undefined) {
  let trimmedBody = trimExtraParts(spawn.room, body);
  
  name = spawn.createCreep(trimmedBody, name, memory);

  if (name != ERR_NOT_ENOUGH_ENERGY && name != ERR_BUSY) {
    console.log('Spawning new ' + memory.role + ': ' + name);
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
  bodyCost,
  trimExtraParts,
  createCreepWithMemory,
  createCreepWithRole,
  displayCreateCreepVisual
};
