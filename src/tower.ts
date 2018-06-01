import profiler from "screeps-profiler";

/**
 * Contains constants and methods for running tower logic, including
 * targeting logic.
 */
const towerFunctions = {
  /**
   * Only targets with less that this much health will be repaired by towers.
   */
  TOWER_REPAIR_MAX_HEALTH: 100000,

  /**
   * Minimum energy for towers to save for attacking hostile targets.
   */
  TOWER_MINIMUM_ENERGY: 700,

  /**
   * filter for helping a tower find a target to repair.
   */
  TOWER_REPAIR_TARGET: {
    filter: (structure: Structure) => structure.hits < structure.hitsMax / 4 &&
      structure.hits !== undefined &&
      structure.hits > 0
  },

  /**
   * Runs tower logic for all towers.
   */
  runTowerLogic() {
    const towers: StructureTower[] = _.filter(Game.structures, (structure) =>
      structure.structureType === STRUCTURE_TOWER) as StructureTower[];
    for (const tower of towers) {

      const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);

      // prioritize shooting enemy creeps over healing or repairing structures.
      if (closestHostile) {
        tower.attack(closestHostile);
      } else {
        const damagedCreeps = tower.room.find(FIND_MY_CREEPS, {
          filter: (creep) => {
            return creep.hits < creep.hitsMax;
          }
        });

        // prioritize healing creeps over repairing structures
        if (damagedCreeps.length) {
          tower.heal(damagedCreeps[0]);
        } else {
          const structures = tower.room.find(FIND_MY_STRUCTURES, this.TOWER_REPAIR_TARGET);

          let lowestHitsStructure;
          for (const structure of structures) {
            if (lowestHitsStructure === undefined ||
              structure.hits < lowestHitsStructure.hits) {
              lowestHitsStructure = structure;
            }
          }
          // Only repair if enough energy is saved up (in case of attacks)
          if (lowestHitsStructure &&
            tower.energy > this.TOWER_MINIMUM_ENERGY &&
            lowestHitsStructure.hits < this.TOWER_REPAIR_MAX_HEALTH) {
            tower.repair(lowestHitsStructure);
          }
        }
      }
    }
  }
};

profiler.registerObject(towerFunctions, "tower");
export { towerFunctions };
