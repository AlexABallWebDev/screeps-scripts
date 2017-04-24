/**
This module contains functions. These were pulled out of main.js to
reduce its length.
*/

/**
Clears memory of creeps that are not currently alive in Game.creeps.
*/
function clearDeadCreepMemory() {
  for (let name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
      console.log('Clearing non-existing creep memory:', name);
    }
  }
}

/**
Saves a message to memory so that I can see it after returning
to the game.
@param {string} message
*/
function saveMessage(message) {
  Memory.myMessages.push(message);
  console.log(message);
}

/**
Bootstrapper for colony respawn. Checks if respawn occurred, then
runs respawn specific code.
*/
function respawn() {
  if (_.size(Game.rooms) == 1 &&
    Game.spawns.Spawn1 &&
    Game.spawns.Spawn1.room.controller.level == 1) {
    if (!Memory.respawnComplete) {
      Memory.respawnComplete = true;

      //record when my colony last respawned
      Memory.startTime = Game.time;

      Memory.myMessages = [];
      Memory.creeps = {};
      Memory.flags = {};
      Memory.rooms = {};
      Memory.spawns = {};

      saveMessage("Respawn complete. Welcome back, commander.");
    }
  } else {
    Memory.respawnComplete = false;
  }
}

/**
Simple diagnostics recording when a spawn's room controller levels up.
@param {Room} room
*/
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

module.exports = {
  clearDeadCreepMemory,
  saveMessage,
  respawn,
  checkForLevelUp
};
