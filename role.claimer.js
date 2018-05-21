let roleClaimer = {
/** @param {Creep} creep **/
  run: (creep) => {
    let claimFlag = Game.flags['newClaim'];
    if (claimFlag) {
      // Move towards the controller (even if not in the room)
      // until in range to claim the controller.
      let claimResult = creep.claimController(creep.room.controller);
      if (creep.room.name != claimFlag.pos.roomName) {
        creep.moveTo(claimFlag.pos, {
          visualizePathStyle: {
            stroke: '#B99CFB'
          }
        });
      } else if (claimResult == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller, {
          visualizePathStyle: {
            stroke: '#B99CFB'
          }
        });
      } else {
        console.log(creep.name + ' cannot claim room due to error: ' + claimResult);
      }
    } else {
      console.log('Claimer ' + creep.name + ' Cannot find a newClaim flag.');
      creep.suicide();
    }
  }
};

module.exports = roleClaimer;