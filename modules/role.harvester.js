/**Harvester role designed to gather source and return it.
 */

//Tell jshint (atom package) to stop showing certain irrelevent warnings.
/*jshint esversion: 6 */

//Begin module.
var roleHarvester = {

  /**Run function that executes the logic for this role.
   * @param {Creep} creep The creep that uses this role.
   */
  run: function(creep) {
      if (creep.carry.energy < creep.carryCapacity) {
        //If this harvester is not full of energy, go gather source.

        //let sources = creep.room.find(FIND_SOURCES);
        let closestSource = creep.pos.findClosestByPath(FIND_SOURCES);
        if (creep.harvest(closestSource) == ERR_NOT_IN_RANGE) {
          creep.moveTo(closestSource);
        }
      } else {
        //Find the closest structure that needs energy.
        let target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
          filter: (structure) => {
            return (structure.structureType == STRUCTURE_EXTENSION ||
                structure.structureType == STRUCTURE_SPAWN ||
                structure.structureType == STRUCTURE_TOWER) &&
              structure.energy < structure.energyCapacity;
          }
        });

        //Move to the target and return energy to it.
        if (target !== undefined && target !== null) {
          if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
          }
        }
      }
    } //End run function.
}; //End module.

//Make this module available to other modules.
module.exports = roleHarvester;
