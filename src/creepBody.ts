import profiler from "screeps-profiler";

/**
 * Contains constants and methods related to Creep body parts.
 */
const creepBody = {
  // common role bodies with parts in order that they should be added as
  // energy capacity becomes available.
  /**
   * Body for the builder role.
   */
  builder: [WORK, WORK, CARRY, MOVE, MOVE, MOVE, CARRY, WORK, MOVE, CARRY,
    WORK, MOVE, CARRY, WORK, MOVE, CARRY, WORK, MOVE, CARRY, WORK, MOVE, CARRY, WORK
  ],
  /**
   * Body for the claimer role.
   */
  claimer: [CLAIM, MOVE],
  /**
   * Body for the colonist role.
   */
  colonist: [WORK, MOVE, CARRY, MOVE, MOVE, WORK, MOVE, CARRY, MOVE, WORK,
    MOVE, CARRY, MOVE, WORK, MOVE, CARRY, MOVE, WORK, MOVE, CARRY
  ],
  /**
   * Body for the courier role.
   */
  courier: [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, CARRY, MOVE, CARRY,
    MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY
  ],
  /**
   * Body for the defender role.
   */
  defender: [ATTACK, ATTACK, MOVE, MOVE, ATTACK, ATTACK, MOVE, MOVE],
  /**
   * Body for the harvester role.
   */
  harvester: [WORK, MOVE, CARRY, MOVE],
  /**
   * Body for the miner role.
   */
  miner: [WORK, WORK, MOVE, WORK, WORK, MOVE, WORK],
  /**
   * Body for the upgrader role.
   */
  upgrader: [WORK, WORK, CARRY, MOVE, CARRY, WORK, MOVE, WORK, WORK,
    MOVE, CARRY, WORK, MOVE, WORK, WORK, MOVE, CARRY, WORK, MOVE, WORK, WORK, MOVE
  ],

  /**
   * Calculates the spawn time for a creep with the given body and returns it.
   * @param {array} body
   */
  calculateSpawnTime(body: BodyPartConstant[]): number {
    return body.length * CREEP_SPAWN_TIME;
  },

  /**
   * Calculates the ticks per movement for a creep with the given body.
   * @param {BodyPartConstant} body
   */
  calculateTicksPerMove(body: BodyPartConstant[]): number {
    let movePartCount = 0;
    let nonMovePartCount = 0;
    for (const bodyPart of body) {
      if (bodyPart === MOVE) {
        movePartCount++;
      } else {
        nonMovePartCount++;
      }
    }
    return Math.ceil(nonMovePartCount / movePartCount);
  },

  /**
   * Calculates the energy cost of a given body.
   * @param {BodyPartConstant[]} body
   */
  bodyCost(body: BodyPartConstant[]): number {
    return body.reduce((cost, part) => {
      return cost + BODYPART_COST[part];
    }, 0);
  },

  /**
   * Sorts a body and returns the sorted body.
   * Default priorities:
   * [TOUGH]: 0,
   * [WORK]: 1,
   * [MOVE]: 2,
   * [CARRY]: 3,
   * [CLAIM]: 4,
   * [HEAL]: 5,
   * [RANGED_ATTACK]: 6,
   * [ATTACK]: 7
   * drivingMove: 8
   * @param {BodyPartConstant[]} body
   * @param {any} priorities = default priorities
   */
  sortBody(body: BodyPartConstant[], priorities: any = {
    [TOUGH]: 0,
    [WORK]: 1,
    [MOVE]: 2,
    [CARRY]: 3,
    [CLAIM]: 4,
    [HEAL]: 5,
    [RANGED_ATTACK]: 6,
    [ATTACK]: 7,
    drivingMove: 8
  }): BodyPartConstant[] {
    let drivingMovePartSet = false;

    const sortedBody: BodyPartConstant[] = _.sortBy(body, (part) => {
      // put one move part at the end so the creep can always move
      if (!drivingMovePartSet && part === MOVE) {
        drivingMovePartSet = true;
        return priorities.drivingMove as number;
      }
      return priorities[part] as number;
    });

    return sortedBody;
  },

  /**
   * Trims parts off of the given body array until the cost of the given body is
   * less than or equal to room.energyCapacityAvailable.
   * @param {Room} room
   * @param {BodyPartConstant[]} body
   */
  trimExtraPartsToEnergyCapacity(room: Room, body: BodyPartConstant[]): BodyPartConstant[] {
    const cost = this.bodyCost(body);

    if (cost > room.energyCapacityAvailable) {
      const trimmedBody: BodyPartConstant[] = [];
      let newCost = 0;
      for (const bodyPart of body) {
        if (newCost + BODYPART_COST[bodyPart] > room.energyCapacityAvailable) {
          return trimmedBody;
        }

        newCost += BODYPART_COST[bodyPart];
        trimmedBody.push(bodyPart);
      }
    }

    if (!body.length) {
      console.log("Empty trimmedBody being returned.");
    }
    return body;
  }
};

profiler.registerObject(creepBody, "creepBody");
export { creepBody };
