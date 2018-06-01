import profiler from "screeps-profiler";

/**
 * This module contains functions. These were pulled out of main.js to
 * reduce its length.
 */
const utilityFunctions = {
  /**
   * Clears memory of creeps that are not currently alive in Game.creeps.
   */
  clearDeadCreepMemory(): void {
    for (const name in Memory.creeps) {
      if (!Game.creeps[name]) {
        delete Memory.creeps[name];
        console.log("Clearing non-existing creep memory:", name);
      }
    }
  },

  /**
   * Clears memory of flags that are not currently in Game.flags.
   */
  clearMissingFlagMemory(): void {
    for (const name in Memory.flags) {
      if (!Game.flags[name]) {
        delete Memory.flags[name];
        console.log("Clearing non-existing flag memory:", name);
      }
    }
  },

  /**
   * Saves a message to memory so that I can see it after returning
   * to the game.
   * @param {string} message
   */
  saveMessage(message: string): void {
    if (!Memory.myMessages) {
      Memory.myMessages = [];
    }
    Memory.myMessages.push(message);
    console.log(message);
  },

  /**
   * Bootstrapper for colony respawn. Checks if respawn occurred, then
   * runs respawn specific code.
   */
  respawn(): void {
    if (_.size(Game.rooms) === 1 &&
      Game.spawns.Spawn1 &&
      Game.spawns.Spawn1.room.controller!.level === 1) {
      if (!Memory.respawnComplete) {
        Memory.respawnComplete = true;

        // record when my colony last respawned
        Memory.startTime = Game.time;

        Memory.myMessages = [];
        Memory.creeps = {};
        Memory.flags = {};
        Memory.rooms = {};
        Memory.spawns = {};
        Memory.colonistNames = {};

        this.saveMessage("Respawn complete. Welcome back, commander.");
      }
    } else {
      Memory.respawnComplete = false;
    }
  },

  /**
   * Checks if a level up occurred, then saves a message with the new level of
   * a room's controller and the Game.time when it levelled up.
   * @param {Room} room
   */
  checkForLevelUp(room: Room) {
    if (!room.memory.controllerLevel) {
      room.memory.controllerLevel = 0;
    }

    if (room.memory.controllerLevel < room.controller!.level) {
      room.memory.controllerLevel = room.controller!.level;
      const levelUpMessage = room.name + " controller level up to: " +
        room.memory.controllerLevel + " at respawn lifetime: " +
        (Game.time - Memory.startTime);
      this.saveMessage(levelUpMessage);
    }
  }
};

profiler.registerObject(utilityFunctions, "functions");
export { utilityFunctions };
