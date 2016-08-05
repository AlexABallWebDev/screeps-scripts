/**Upgrader role designed to gather source and use it to upgrade
 * a room's controller.
 */

//Tell jshint (atom package) to stop showing certain irrelevent warnings.
/*jshint esversion: 6 */

/**Harvester Role.*/
var roleHarvester = require('role.harvester');

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
        creep.moveTo(creep.room.controller);
      }
    } else {
      //If the upgrader is not trying to upgrade, go harvest source.
      roleHarvester.run(creep);
    }
  } //End run function.
}; //End module.

//Make this module available to the other modules.
module.exports = roleUpgrader;
