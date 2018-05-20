module.exports = {
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
  calculateSpawnTime: function(body) {
    return body.length * CREEP_SPAWN_TIME;
  },

  /**
  Calculates the ticks per movement for a creep with the given body.
  @param {array} body
  */
  calculateTicksPerMove: function(body) {
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
  @param {array} body
  */
  bodyCost: function(body) {
    return body.reduce(function(cost, part) {
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
  @param {array} body
  @param {Object} priorities = default priorities
  */
  sortBody: function(body, priorities = {
    [TOUGH]: 0,
    [WORK]: 1,
    [MOVE]: 2,
    [CARRY]: 3,
    [CLAIM]: 4,
    [HEAL]: 5,
    [RANGED_ATTACK]: 6,
    [ATTACK]: 7,
    drivingMove: 8
  }) {
    let drivingMovePartSet = false;

    let sortedBody = _.sortBy(body, function(part) {
      //put one move part at the end so the creep can always move
      if (!drivingMovePartSet && part == MOVE) {
        drivingMovePartSet = true;
        return priorities.drivingMove;
      }
      return priorities[part];
    });

    return sortedBody;
  },

  /**
  Trims parts off of the given body array until the cost of the given body is
  less than room.energyCapacityAvailable.
  @param {Room} room
  @param {array} body
  */
  trimExtraParts: function(room, body) {
    let cost = this.bodyCost(body);

    if (cost > room.energyCapacityAvailable) {
      let trimmedBody = [];
      let newCost = 0;
      for (let i = 0; i < body.length; i++) {
        if (newCost + BODYPART_COST[body[i]] > room.energyCapacityAvailable) {
          return trimmedBody;
        }

        newCost += BODYPART_COST[body[i]];
        trimmedBody.push(body[i]);
      }
    }

    return body;
  }
};
