//Tell jshint (atom package) to stop showing certain irrelevent warnings.
/*jshint esversion: 6 */

module.exports = function() {
  /**function for spawning the biggest worker creep
   * that this room can spawn.
   * @param {number} energyCapacity The amount of energy that could possibly
   * be used to build a new creep.
   * @param {string} role The role of the new creep.
   * @param {string} name=undefined A name to give to the new creep.
   */
  StructureSpawn.prototype.createBiggestWorkerCreep =
    function(energyCapacity, role, name = undefined) {
      //Add one part of each type for every 200 energyCapacity in the room.
      var numberOfParts = Math.floor(energyCapacity / 200);

      //Build body.
      var body = [];
      for (let i = 0; i < numberOfParts; i++) {
        body.push(WORK);
      }
      for (let i = 0; i < numberOfParts; i++) {
        body.push(CARRY);
      }
      for (let i = 0; i < numberOfParts; i++) {
        body.push(MOVE);
      }

      //Spawn the creep.
      return this.spawnCreep(body, {role: role}, name);
    };

  /**Spawns a creep.
   * @param {body} creep The body of the new creep.
   * @param {creepMemory} creepMemory The memory of the new creep.
   * @param {string} name=undefined A name to give to the new creep.
   * @return {string} newName The name of the new creep.
   */
  StructureSpawn.prototype.spawnCreep =
    function(body, creepMemory, name = undefined) {
      let newName = this.createCreep(body, name, creepMemory);

      //If a creep is spawned, log a console message with
      //the creep's name and role.
      if (newName >= 0 || typeof(newName) == 'string') {
        console.log('Spawning new ' + creepMemory.role + ': ' + newName);
      }
      return newName;
    };
};
