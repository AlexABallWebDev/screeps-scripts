//Tell jshint (atom package) to stop showing certain irrelevent warnings.
/*jshint esversion: 6 */

module.exports = function() {
  /**function for executing the harvester role.*/
  Creep.prototype.roleHarvester = function() {
    if (this.memory.working && this.carry.energy === 0) {
      //If the repairer is trying to return but has no energy,
      //go gather more source.
      this.memory.working = false;
      this.say('harvesting');
    }
    if (!this.memory.working && this.carry.energy == this.carryCapacity) {
      //If the harvester is not returning but is full of energy,
      //return.
      this.memory.working = true;
      this.say('returning energy');
    }

    if (this.memory.working) {
      //Find the closest structure that needs energy.
      let target = this.pos.findClosestByPath(FIND_MY_STRUCTURES, {
        filter: (structure) => {
          return (structure.structureType == STRUCTURE_EXTENSION ||
              structure.structureType == STRUCTURE_SPAWN ||
              //Only return to tower if a large dropoff can be made.
              (structure.structureType == STRUCTURE_TOWER &&
                this.carry.energy <= structure.energyCapacity -
                structure.energy)) &&
            structure.energy < structure.energyCapacity;
        }
      });

      //Move to the target and return energy to it.
      if (target !== undefined && target !== null) {
        if (this.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          this.moveTo(target);
        }
      }
    } else {
      //If this harvester is not full of energy, go gather source.

      let closestSource = this.pos.findClosestByPath(FIND_SOURCES);
      if (this.harvest(closestSource) == ERR_NOT_IN_RANGE) {
        this.moveTo(closestSource);
      }
    }
  }; //End roleHarvester function.


  /**function for executing the upgrader role.*/
  Creep.prototype.roleUpgrader = function() {

    if (this.memory.working && this.carry.energy === 0) {
      //If the upgrader is trying to upgrade but has no energy,
      //go gather more source.
      this.memory.working = false;
      this.say('harvesting');
    }
    if (!this.memory.working && this.carry.energy == this.carryCapacity) {
      //If the upgrader is not upgrading but is full of energy,
      //go upgrade.
      this.memory.working = true;
      this.say('upgrading');
    }

    if (this.memory.working) {
      //If the upgrader is trying to upgrade, go to the
      //room controller and upgrade it.
      if (this.upgradeController(this.room.controller) == ERR_NOT_IN_RANGE) {
        this.moveTo(this.room.controller);
      }
    } else {
      //If the upgrader is not trying to upgrade, go harvest source.
      this.roleHarvester();
    }
  }; //End roleUpgrader function.


  /**function for executing the builder role.*/
  Creep.prototype.roleBuilder = function() {

    if (this.memory.working && this.carry.energy === 0) {
      //If the builder is trying to build something but it is out of energy,
      //then it will to go gather more source (stop building).
      this.memory.working = false;
      this.say('harvesting');
    }

    if (!this.memory.working && this.carry.energy == this.carryCapacity) {
      //If the builder is not building anything, but is full of energy,
      //then it will go build something (start building).
      this.memory.working = true;
      this.say('building');
    }

    if (this.memory.working) {
      //If this builder is trying to build something,
      //check for construction sites.
      let targets = this.room.find(FIND_CONSTRUCTION_SITES);
      if (targets.length) {
        //If there is at least one construction site, go to a site and build.
        if (this.build(targets[0]) == ERR_NOT_IN_RANGE) {
          this.moveTo(targets[0]);
        }
      } else {
        //If there are no construction sites, then the builder
        //should act like an upgrader.
        this.roleUpgrader();
      }
    } else {
      //If this builder is not trying to build something, go gather source.
      this.roleHarvester();
    }
  }; //End roleBuilder function.


  /**function for executing the repairer role.*/
  Creep.prototype.roleRepairer = function() {

    if (this.memory.working && this.carry.energy === 0) {
      //If the repairer is trying to repair but has no energy,
      //go gather more source.
      this.memory.working = false;
      this.say('harvesting');
    }
    if (!this.memory.working && this.carry.energy == this.carryCapacity) {
      //If the repairer is not repairing but is full of energy,
      //go repair.
      this.memory.working = true;
      this.say('repairing');
    }

    if (this.memory.working) {
      //If the repairer is trying to repair, go to the
      //structure and repair it.

      /*
      //Find a damaged structure that is not a wall.
      let repairTarget = this.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (structure) => structure.hits < structure.hitsMax &&
          structure.structureType != STRUCTURE_WALL
      });
      */

      //Find damaged structures.
      let structures = this.room.find(FIND_STRUCTURES, {
        filter: (structure) => structure.hits < structure.hitsMax &&
          structure.hits !== undefined &&
          structure.hits > 0
      });

      let repairTarget;

      //Find the most damaged (lowest hits) structure.
      for (let structure of structures) {
        if (repairTarget === undefined ||
          structure.hits < repairTarget.hits) {
          repairTarget = structure;
        }
      }

      if (repairTarget !== undefined && repairTarget !== null) {
        //Repair or move to the damaged structure.
        if (this.repair(repairTarget) == ERR_NOT_IN_RANGE) {
          this.moveTo(repairTarget);
        }
      } else {
        //If there are no damaged structures, then the repairer
        //should act like a builder.
        this.roleBuilder();
      }

    } else {
      //If the repairer is not trying to repair, go harvest source.
      this.roleHarvester();
    }
  }; //End run function.
}; //End module.
