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
          creep.moveTo(closestSource, {
            reusePath: 5
          });
        }
      } else {
        //If this harvester is full of energy, return it.

        /*
        let targets = creep.room.find(FIND_STRUCTURES, {
          filter: (structure) => {
            return (structure.structureType == STRUCTURE_EXTENSION ||
              structure.structureType == STRUCTURE_SPAWN ||
              structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
          }
        });
        if (targets.length > 0) {
          if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[0], {
              reusePath: 5
            });
          }
        }
        */

        //Find the closest structure that needs energy.
        let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: (structure) => {
            return (structure.structureType == STRUCTURE_EXTENSION ||
              structure.structureType == STRUCTURE_SPAWN ||
              structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
          }
        });

        //Move to the target and return energy to it.
        if (target !== undefined && target !== null) {
          if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, {
              reusePath: 5
            });
          }
        }
      }
    } //End run function.
}; //End module.

//Make this module available to other modules.
module.exports = roleHarvester;
