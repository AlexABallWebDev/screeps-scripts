interface CreepMemory { 
  assignedSourceId: string
  building: boolean
  carting: boolean
  colonizing: boolean
  colonySpawnSiteID: string
  role: string
  targetHostileCreep: string | undefined
  targetResource: string | undefined
  upgrading: boolean
}

interface RoomMemory { 
  extensionSquareLayerCount: number
  sourceAssignments: any
  towerAssignments: any
  controllerLevel: number | undefined
}

interface FlagMemory {
  x: number
  y: number
  roomName: string
}