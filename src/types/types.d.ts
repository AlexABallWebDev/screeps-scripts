interface CreepMemory { 
  assignedSourceId?: string
  building?: boolean
  carting?: boolean
  colonizing?: boolean
  colonySpawnSiteID?: string
  role: string
  targetHostileCreep?: string
  targetResource?: string
  upgrading?: boolean
}

interface SourceAssignment {
  minerName: string
  path: PathStep[]
  towersAssigned: number
}

interface RoomMemory { 
  extensionSquareLayerCount?: number
  // index should be the source.id
  sourceAssignments: {[name: string]: SourceAssignment}
  controllerLevel?: number
}

interface FlagMemory {
  x: number
  y: number
  roomName: string
}