/**This module contains functions. These were pulled out of main.js to
 * reduce its length.
 */

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
  }
}; //End module.

//Make this module available to other modules.
module.exports = functions;
