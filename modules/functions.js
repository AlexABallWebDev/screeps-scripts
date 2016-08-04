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
   * @return {number} nextSource The next source.
   */
  getNextSource: function() {
    let harvestSource = 0;
    let sources = Game.spawns.Spawn1.room.find(FIND_SOURCES);
    if (Game.spawns.Spawn1.memory.nextSource === undefined ||
      Game.spawns.Spawn1.memory.nextSource === null ||
      Game.spawns.Spawn1.memory.nextSource >= sources.length) {
      Game.spawns.Spawn1.memory.nextSource = 0;
    } else {
      harvestSource = Game.spawns.Spawn1.memory.nextSource;
    }
    Game.spawns.Spawn1.memory.nextSource += 1;
    console.log('Assigning creep to source: ' + harvestSource);
    return harvestSource;
  },

  /**Spawns an upgrader.
   * @param {body} creep The body of the new creep.
   */
  spawnUpgrader: function(body) {
    let creepMemory = {
      role: 'upgrader'
    };
    this.spawnCreep(body, creepMemory);
  },

  /**Spawns a harvester.
   * @param {body} creep The body of the new creep.
   */
  spawnHarvester: function(body) {
    let creepMemory = {
      role: 'harvester'
    };
    this.spawnCreep(body, creepMemory);
  },

  /**Spawns a builder.
   * @param {body} creep The body of the new creep.
   */
  spawnBuilder: function(body) {
    let creepMemory = {
      role: 'builder'
    };
    this.spawnCreep(body, creepMemory);
  },

  /**Spawns a builder.
   * @param {body} creep The body of the new creep.
   */
  spawnRepairer: function(body) {
    let creepMemory = {
      role: 'repairer'
    };
    this.spawnCreep(body, creepMemory);
  },

  /**Spawns a creep.
   * @param {body} creep The body of the new creep.
   * @param {creepMemory} creepMemory The memory of the new creep.
   * @param {string} name=undefined A name to give to the new creep.
   * @return {string} newName The name of the new creep.
   */
  spawnCreep: function(body, creepMemory, name = undefined) {
    let newName = Game.spawns.Spawn1.createCreep(body, name, creepMemory);
    if (newName >= 0 || typeof(newName) == 'string') {
      let harvestSource = this.getNextSource();
      Game.creeps[newName].memory.source = harvestSource;
      console.log('Spawning new ' + creepMemory.role + ': ' + newName);
    }
    return newName;
  }
}; //End module.

//Make this module available to other modules.
module.exports = functions;
