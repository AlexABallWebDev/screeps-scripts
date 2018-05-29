import profiler from "screeps-profiler";

const creepBody = {
  // common role bodies with parts in order that they should be added as
  // energy capacity becomes available.
  defender: [ATTACK, ATTACK, MOVE, MOVE, ATTACK, ATTACK, MOVE, MOVE],
  harvester: [WORK, MOVE, CARRY, MOVE],
  courier: [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, CARRY, MOVE, CARRY,
    MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY
  ],
  miner: [WORK, WORK, MOVE, WORK, WORK, MOVE, WORK],
  builder: [WORK, WORK, CARRY, MOVE, MOVE, MOVE, CARRY, WORK, MOVE, CARRY,
    WORK, MOVE, CARRY, WORK, MOVE, CARRY, WORK, MOVE, CARRY, WORK, MOVE, CARRY, WORK
  ],
  upgrader: [WORK, WORK, CARRY, MOVE, CARRY, WORK, MOVE, WORK, WORK,
    MOVE, CARRY, WORK, MOVE, WORK, WORK, MOVE, CARRY, WORK, MOVE, WORK, WORK, MOVE
  ],
  claimer: [CLAIM, MOVE],
  colonist: [WORK, MOVE, CARRY, MOVE, MOVE, WORK, MOVE, CARRY, MOVE, WORK,
    MOVE, CARRY, MOVE, WORK, MOVE, CARRY, MOVE, WORK, MOVE, CARRY
  ],

  /**
  Calculates the spawn time for a creep with the given body and returns it.
  @param {array} body
  */
  calculateSpawnTime(body: BodyPartConstant[]): number {
    return body.length * CREEP_SPAWN_TIME;
  },

  /**
  Calculates the ticks per movement for a creep with the given body.
  @param {BodyPartConstant} body
  */
  calculateTicksPerMove(body: BodyPartConstant[]): number {
    let movePartCount = 0;
    let nonMovePartCount = 0;
    for (let i = 0; i < body.length; i++) {
      if (body[i] == MOVE) {
        movePartCount++;
      } else {
        nonMovePartCount++;
      }
    }
    return Math.ceil(nonMovePartCount / movePartCount);
  },

  /**
  Calculates the cost of a given body.
  @param {BodyPartConstant[]} body
  */
  bodyCost(body: BodyPartConstant[]): number {
    return body.reduce((cost, part) => {
      return cost + BODYPART_COST[part];
    }, 0);
  },

  /**
  Sorts a body and returns the sorted body.
  Default priorities:
  [TOUGH]: 0,
  [WORK]: 1,
  [MOVE]: 2,
  [CARRY]: 3,
  [CLAIM]: 4,
  [HEAL]: 5,
  [RANGED_ATTACK]: 6,
  [ATTACK]: 7
  drivingMove: 8
  @param {BodyPartConstant[]} body
  @param {any} priorities = default priorities
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
      if (!drivingMovePartSet && part == MOVE) {
        drivingMovePartSet = true;
        return priorities.drivingMove as number;
      }
      return priorities[part] as number;
    });

    return sortedBody;
  },

  /**
  Trims parts off of the given body array until the cost of the given body is
  less than room.energyCapacityAvailable.
  @param {Room} room
  @param {BodyPartConstant[]} body
  */
  trimExtraParts(room: Room, body: BodyPartConstant[]): BodyPartConstant[] {
    const cost = this.bodyCost(body);

    if (cost > room.energyCapacityAvailable) {
      let trimmedBody: BodyPartConstant[] = [];
      let newCost = 0;
      for (let i = 0; i < body.length; i++) {
        if (newCost + BODYPART_COST[body[i]] > room.energyCapacityAvailable) {
          return trimmedBody;
        }

        newCost += BODYPART_COST[body[i]];
        trimmedBody.push(body[i]);
      }
    }

    if (!body.length) {
      console.log('Empty trimmedBody being returned.');
    }
    return body;
  }
};

profiler.registerObject(creepBody, "creepBody");
export { creepBody };
