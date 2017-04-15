

/**Only targets with less that this much health will be repaired by towers.*/
const TOWER_REPAIR_MAX_HEALTH = 100000;

/**Minimum energy for towers to save for attacking hostile targets.*/
const TOWER_MINIMUM_ENERGY = 700;

/**filter for helping a tower find a target to repair.*/
const TOWER_REPAIR_TARGET = {
filter: (structure) => structure.hits < structure.hitsMax &&
  structure.hits !== undefined &&
  structure.hits > 0
};

//Tower logic
function runTowerLogic() {
  //Get towers.
  let towers = _.filter(Game.structures, (structure) =>
    structure.structureType == STRUCTURE_TOWER);
  for (let tower of towers) {

    //Find damaged structures.
    let structures = tower.room.find(FIND_STRUCTURES, TOWER_REPAIR_TARGET);

    let lowestHitsStructure;

    //Find the most damaged (lowest hits) structure.
    for (let structure of structures) {
      if (lowestHitsStructure === undefined ||
        structure.hits < lowestHitsStructure.hits) {
        lowestHitsStructure = structure;
      }
    }

    /*
    //find closest damaged structure.
    let closestDamagedStructure = tower.pos
      .findClosestByRange(FIND_STRUCTURES, TOWER_REPAIR_TARGET);
    */

    //find closest hostile creep.
    let closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);

    //prioritize shooting enemy creeps over repairing structures.
    if (closestHostile) {
      tower.attack(closestHostile);
    } else if (lowestHitsStructure &&
      tower.energy > TOWER_MINIMUM_ENERGY &&
      totalWorkers >= WORKERS_MINIMUM &&
      lowestHitsStructure.hits < TOWER_REPAIR_MAX_HEALTH) {
      //Only repair if enough energy is saved up (in case of attacks)
      //and enough workers are supplying the base.
      tower.repair(lowestHitsStructure);
    }
  }
}

module.exports = {
  runTowerLogic
};
