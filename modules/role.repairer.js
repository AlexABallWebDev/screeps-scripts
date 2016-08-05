/**Repairer role designed to gather source and use it to Repaire
 * damaged structures.
 */

//Tell jshint (atom package) to stop showing certain irrelevent warnings.
/*jshint esversion: 6 */

/**Builder Role.*/
var roleBuilder = require('role.builder');

/**Harvester Role.*/
var roleHarvester = require('role.harvester');

//Begin module.
var roleRepairer = {

  /**Run function that executes the logic for this role.
   * @param {Creep} creep The creep that uses this role.
   */
  run: function(creep) {

      if (creep.memory.working && creep.carry.energy === 0) {
        //If the repairer is trying to repair but has no energy,
        //go gather more source.
        creep.memory.working = false;
        creep.say('harvesting');
      }
      if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
        //If the repairer is not repairing but is full of energy,
        //go repair.
        creep.memory.working = true;
        creep.say('repairing');
      }

      if (creep.memory.working) {
        //If the repairer is trying to repair, go to the
        //structure and repair it.

        //Find a damaged structure that is not a wall.
        let structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: (structure) => structure.hits < structure.hitsMax &&
            structure.structureType != STRUCTURE_WALL
        });

        if (structure !== undefined && structure !== null) {
          //Repair or move to the damaged structure.
          if (creep.repair(structure) == ERR_NOT_IN_RANGE) {
            creep.moveTo(structure);
          }
        } else {
          //If there are no damaged structures, then the repairer
          //should act like a builder.
          roleBuilder.run(creep);
        }

      } else {
        //If the repairer is not trying to repair, go harvest source.
        roleHarvester.run(creep);
      }
    } //End run function.
}; //End module.

//Make this module available to the other modules.
module.exports = roleRepairer;
