/**Builder role, designed to build structures. When there are no
 * construction sites, it defaults to acting like an upgrader.
 */

//Tell jshint (atom package) to stop showing certain irrelevent warnings.
/*jshint esversion: 6 */

/**Upgrader Role.*/
var roleUpgrader = require('role.upgrader');

//Begin module.
var roleBuilder = {

  /**Run function that executes the logic for this role.
   * @param {Creep} creep The creep that uses this role.
   */
  run: function(creep) {

      if (creep.memory.building && creep.carry.energy === 0) {
        //If the builder is trying to build something but it is out of energy,
        //then it will to go gather more source (stop building).
        creep.memory.building = false;
        creep.say('harvesting');
      }

      if (!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
        //If the builder is not building anything, but is full of energy,
        //then it will go build something (start building).
        creep.memory.building = true;
        creep.say('building');
      }

      if (creep.memory.building) {
        //If this builder is trying to build something,
        //check for construction sites.
        let targets = creep.room.find(FIND_CONSTRUCTION_SITES);
        if (targets.length) {
          //If there is at least one construction site, go to a site and build.
          if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[0], {
              reusePath: 5
            });
          }
        } else {
          //If there are no construction sites, then the builder
          //should act like an upgrader.
          roleUpgrader.run(creep);
        }
      } else {
        //If this builder is not trying to build something, go gather source.
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
module.exports = roleBuilder;
