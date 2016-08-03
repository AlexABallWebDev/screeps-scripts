/**Upgrader role designed to gather source and use it to upgrade
 * a room's controller.
 */

//Tell jshint (atom package) to stop showing certain irrelevent warnings.
/*jshint esversion: 6 */

//Begin module.
var roleUpgrader = {

  /**Run function that executes the logic for this role.
   * @param {Creep} creep The creep that uses this role.
   */
  run: function(creep) {

    if (creep.memory.working && creep.carry.energy === 0) {
      //If the upgrader is trying to upgrade but has no energy,
      //go gather more source.
      creep.memory.working = false;
      creep.say('harvesting');
    }
    if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
      //If the upgrader is not upgrading but is full of energy,
      //go upgrade.
      creep.memory.working = true;
      creep.say('upgrading');
    }

    if (creep.memory.working) {
      //If the upgrader is trying to upgrade, go to the
      //room controller and upgrade it.
      if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller, {
          reusePath: 5
        });
      }
    } else {
      //If the upgrader is not trying to upgrade, go harvest source.

      /*if(creep.withdraw(Game.spawns.Spawn1, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(Game.spawns.Spawn1, {reusePath: 5});
      }
      */
      //let sources = creep.room.find(FIND_SOURCES);
      let closestSource = creep.pos.findClosestByPath(FIND_SOURCES);
      if (creep.harvest(closestSource) == ERR_NOT_IN_RANGE) {
        creep.moveTo(closestSource, {
          reusePath: 5
        });
      }
    }
  } //End run function.
}; //End module.

//Make this module available to the other modules.
module.exports = roleUpgrader;
