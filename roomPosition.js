/**
Find an adjacent position for the given position and direction
@param {RoomPosition} position
@param {number} direction
*/
function findAdjacent(position, direction) {
  switch (direction) {
    case TOP:
      return new RoomPosition(position.x, position.y - 1, position.roomName);
    case TOP_RIGHT:
      return new RoomPosition(position.x + 1, position.y - 1, position.roomName);
    case RIGHT:
      return new RoomPosition(position.x + 1, position.y, position.roomName);
    case BOTTOM_RIGHT:
      return new RoomPosition(position.x + 1, position.y + 1, position.roomName);
    case BOTTOM:
      return new RoomPosition(position.x, position.y + 1, position.roomName);
    case BOTTOM_LEFT:
      return new RoomPosition(position.x - 1, position.y + 1, position.roomName);
    case LEFT:
      return new RoomPosition(position.x - 1, position.y, position.roomName);
    case TOP_LEFT:
      return new RoomPosition(position.x - 1, position.y - 1, position.roomName);
    default:
      return 0;
  }
}



/**
Finds and returns an object (or array if isArray is true) containing
the objects in adjacent positions to the given position. This object (or array)
is found from room.lookAtArea.
@param {RoomPosition} position
@param {boolean} isArray = false
*/
function getAdjacentObjects(position, isArray = false) {
  let room = Game.rooms[position.roomName];
  let adjacentObjects = room.lookAtArea(position.y - 1, position.x - 1,
    position.y + 1, position.x + 1, isArray);

  //remove objects at the given position so we are left with only adjacent objects.
  adjacentObjects[position.y][position.x] = undefined;

  return adjacentObjects;
}

module.exports = {
  findAdjacent,
  getAdjacentObjects
};
