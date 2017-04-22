/**This module contains functions. These were pulled out of main.js to
 * reduce its length.
 */

/**Clears memory of creeps that are not currently alive in Game.creeps.*/
function clearDeadCreepMemory() {
  for (let name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
      console.log('Clearing non-existing creep memory:', name);
    }
  }
}

//saves a message to memory so that I can see it after returning to the game.
function saveMessage(message) {
  Memory.myMessages.push(message);
  console.log(message);
}

//bootstrapper for colony respawn
function respawn() {
  if (_.size(Game.rooms) == 1 &&
    Game.spawns.Spawn1 &&
    Game.spawns.Spawn1.room.controller.level == 1) {
    if (!Memory.respawnComplete) {
      Memory.respawnComplete = true;

      //record when my colony last respawned
      Memory.startTime = Game.time;

      Memory.myMessages = [];

      saveMessage("Respawn complete. Welcome back, commander.");
    }
  } else {
    Memory.respawnComplete = false;
  }
}

//simple diagnostics recording when a spawn's room controller levels up.
function checkForLevelUp(room) {
  if (!room.memory.controllerLevel) {
    room.memory.controllerLevel = 0;
  }

  if (room.memory.controllerLevel < room.controller.level) {
    room.memory.controllerLevel = room.controller.level;
    let levelUpMessage = room.name + " controller level up to: " +
      room.memory.controllerLevel + " at colony lifetime: " +
      (Game.time - Memory.startTime);
    saveMessage(levelUpMessage);
  }
}

function bodyCost(body) {
  return body.reduce(function(cost, part) {
    return cost + BODYPART_COST[part];
  }, 0);
}

//Make this module available to other modules.
module.exports = {
  clearDeadCreepMemory,
  saveMessage,
  respawn,
  checkForLevelUp,
  bodyCost
};
