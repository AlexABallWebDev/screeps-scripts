/**This module contains functions. These were pulled out of main.js to
 * reduce its length.
 */

//Tell jshint (atom package) to stop showing certain irrelevent warnings.
/*jshint esversion: 6 */

//Begin module.
var functions = {
  /**Clears memory of creeps that are not currently alive in Game.creeps.*/
  clearDeadCreepMemory: function() {
    for (let name in Memory.creeps) {
      if (!Game.creeps[name]) {
        delete Memory.creeps[name];
        console.log('Clearing non-existing creep memory:', name);
      }
    }
  },

  /**Gets the next source (represented as a number for now) and returns it.
   * @return The next source.
   */
  getNextSource: function() {
    let harvestSource = 0;
    let sources = Game.spawns.Spawn1.room.find(FIND_SOURCES);
    if (Game.spawns.Spawn1.memory.nextSource === undefined || Game.spawns.Spawn1.memory.nextSource >= sources.length) {
      Game.spawns.Spawn1.memory.nextSource = 0;
    } else {
      harvestSource = Game.spawns.Spawn1.memory.nextSource;
    }
    Game.spawns.Spawn1.memory.nextSource += 1;
    console.log('Assigning creep to source: ' + harvestSource);
    return harvestSource;
  },

  /**Spawns an upgrader.*/
  spawnUpgrader: function() {
    let creepMemory = {
      role: 'upgrader'
    };
    let newName = Game.spawns.Spawn1.createCreep([WORK, CARRY, MOVE, MOVE], undefined, creepMemory);
    if (newName >= 0 || typeof(newName) == 'string') {
      let harvestSource = this.getNextSource();
      Game.creeps[newName].memory.source = harvestSource;
      console.log('Spawning new upgrader: ' + newName);
    }
  },

  /**Spawns a harvester.*/
  spawnHarvester: function() {
    let creepMemory = {
      role: 'harvester'
    };
    let newName = Game.spawns.Spawn1.createCreep([WORK, CARRY, MOVE, MOVE], undefined, creepMemory);
    if (newName >= 0 || typeof(newName) == 'string') {
      let harvestSource = this.getNextSource();
      Game.creeps[newName].memory.source = harvestSource;
      console.log('Spawning new harvester: ' + newName);
    }
  },

  /**Spawns a builder.*/
  spawnBuilder: function() {
    let creepMemory = {
      role: 'builder'
    };
    let newName = Game.spawns.Spawn1.createCreep([WORK, CARRY, MOVE, MOVE], undefined, creepMemory);
    if (newName >= 0 || typeof(newName) == 'string') {
      let harvestSource = this.getNextSource();
      Game.creeps[newName].memory.source = harvestSource;
      console.log('Spawning new builder: ' + newName);
    }
  }
}; //End module.

//Make this module available to other modules.
module.exports = functions;
