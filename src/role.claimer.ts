import profiler from "screeps-profiler";

/**
 * Creeps of this role will go to the room with the newClaimFlagName flag and
 * claim it.
 */
const roleClaimer = {
  newClaimFlagName: "newClaim",

  /**
   * Runs role logic on the given creep.
   * @param {Creep} creep
   */
  run(creep: Creep)  {
    const claimFlag = Game.flags[this.newClaimFlagName];
    if (claimFlag) {
      // Move towards the controller (even if not in the room)
      // until in range to claim the controller.
      if (creep.room.name !== claimFlag.pos.roomName) {
        creep.moveTo(claimFlag.pos, {
          visualizePathStyle: {
            stroke: "#B99CFB"
          }
        });
      } else {
        const claimResult = creep.claimController(creep.room.controller!);
        if (claimResult === ERR_NOT_IN_RANGE) {
          creep.moveTo(creep.room.controller!, {
            visualizePathStyle: {
              stroke: "#B99CFB"
            }
          });
        } else {
          console.log(creep.name + " cannot claim room due to error: " + claimResult);
        }
      }
    } else {
      console.log("Claimer " + creep.name + " Cannot find a newClaim flag.");
      creep.suicide();
    }
  }
};

profiler.registerObject(roleClaimer, "role.claimer");
export { roleClaimer };
