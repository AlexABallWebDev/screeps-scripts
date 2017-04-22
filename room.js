/**
check for sources that are not known in this room.
@param {Room} room
*/
function checkForSources(room) {
  if (!room.memory.sourceIds) {
    room.memory.sourceIds = {};

    _.forEach(room.find(FIND_SOURCES), (source, sourceId, sources) => {
      if (!room.memory.sourceIds[source.id]) {
        room.memory.sourceIds[source.id] = "none";
      }
    });
  }
}

module.exports = {
  checkForSources
};
