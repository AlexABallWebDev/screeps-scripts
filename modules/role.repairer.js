/**Repairer role designed to gather source and use it to Repaire
 * damaged structures.
 */

//Tell jshint (atom package) to stop showing certain irrelevent warnings.
/*jshint esversion: 6 */

//Begin module.
var roleRepairer = {

  /**Run function that executes the logic for this role.
   * @param {Creep} creep The creep that uses this role.
   */
  run: function(creep) {

      if (creep.memory.repairing && creep.carry.energy === 0) {
        //If the repairer is trying to repair but has no energy,
        //go gather more source.
        creep.memory.repairing = false;
        creep.say('harvesting');
      }
      if (!creep.memory.repairing && creep.carry.energy == creep.carryCapacity) {
        //If the repairer is not repairing but is full of energy,
        //go repair.
        creep.memory.repairing = true;
        creep.say('repairing');
      }

      if (creep.memory.repairing) {
        //If the repairer is trying to repair, go to the
        //structure and repair it.

        //Find a damaged structure that is not a wall.
        structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: (structure) => structure.hits < structure.hitsMax &&
          structure.structureType != STRUCTURE_WALL
        });

        if (structure !== undefined) {
          //Repair or move to the damaged structure.
          if (creep.repair(structure) == ERR_NOT_IN_RANGE) {
            creep.moveTo(structure, {
              reusePath: 5
            });
          }
        }
        else {
          //If there are no damaged structures, then the repairer
          //should act like a builder.
          roleBuilder.run(creep);
        }

      } else {
        //If the repairer is not trying to repair, go harvest source.

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
module.exports = roleRepairer;
