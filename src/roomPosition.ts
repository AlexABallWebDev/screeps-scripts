/**
Find an adjacent position for the given position and direction
@param {RoomPosition} position
@param {DirectionConstant} direction
*/
export function findAdjacent(position: RoomPosition, direction: DirectionConstant): RoomPosition {
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
    default: // case TOP_LEFT:
      return new RoomPosition(position.x - 1, position.y - 1, position.roomName);
  }
}

/**
Finds and returns an object (or array if isArray is true) containing
the objects in adjacent positions to the given position. This object (or array)
is found from room.lookAtArea.
@param {RoomPosition} position
@param {boolean} isArray = false
*/
export function getAdjacentObjects(position: RoomPosition, isArray: boolean = false): LookAtResultMatrix | LookAtResultWithPos[] {
  const room = Game.rooms[position.roomName];

  // remove objects at the given position so we are left with only adjacent objects.
  if (isArray) {
    const adjacentObjects: LookAtResultWithPos[] = room.lookAtArea(position.y - 1, position.x - 1,
      position.y + 1, position.x + 1, isArray) as LookAtResultWithPos[];

    for (let i = 0; i < adjacentObjects.length; i++) {
      const adjacentObject = adjacentObjects[i];
      if (adjacentObject.x == position.x && adjacentObject.y == position.y) {
        adjacentObjects.splice(i, 1);
        i--;
      }
    }

    return adjacentObjects;
  } else {
    const adjacentObjects: LookAtResultMatrix = room.lookAtArea(position.y - 1, position.x - 1,
      position.y + 1, position.x + 1, isArray) as LookAtResultMatrix;

    delete adjacentObjects[position.y][position.x];

    return adjacentObjects;
  }
}
