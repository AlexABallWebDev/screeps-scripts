//Tell jshint (atom package) to stop showing certain irrelevent warnings.
/*jshint esversion: 6 */

var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.upgrading && creep.carry.energy === 0) {
            creep.memory.upgrading = false;
            creep.say('harvesting');
	    }
	    if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.upgrading = true;
	        creep.say('upgrading');
	    }

	    if(creep.memory.upgrading) {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {reusePath: 5});
            }
        }
        else {
            /*if(creep.withdraw(Game.spawns.Spawn1, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.spawns.Spawn1, {reusePath: 5});
            }
            */
            let sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[creep.memory.source]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[creep.memory.source], {reusePath: 5});
            }
        }
	}
};

module.exports = roleUpgrader;
