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
}

interface RoomMemory { 
  extensionSquareLayerCount?: number
  sourceAssignments: {[name: string]: SourceAssignment}
  towerAssignments?: any
  controllerLevel?: number
}

interface FlagMemory {
  x: number
  y: number
  roomName: string
}