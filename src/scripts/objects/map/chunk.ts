export enum ChunkType {
  ROAD_STRAIGHT_0 = 'image_road_straight_0',
  ROAD_STRAIGHT_1 = 'image_road_straight_1',
  //ROAD_STRAIGHT_2 = 'image_road_straight_2'
}

export class ChunkProperties {
  type: ChunkType

  possibleNextType: ChunkType[]

  constructor(type: ChunkType, possibleNextType: ChunkType[]) {
    this.type = type

    this.possibleNextType = possibleNextType
  }
}

export class RoadChunkProperties extends ChunkProperties {
  lanes: LaneProperties[]

  constructor(type: ChunkType, lanes: LaneProperties[], possibleNextType: ChunkType[]) {
    super(type, possibleNextType)

    this.lanes = lanes
  }
}

export class LaneProperties {
  id: number

  position: number
  perspectiveScale: number

  constructor(id: number, position: number, perspectiveScale: number) {
    this.id = id

    this.position = position
    this.perspectiveScale = perspectiveScale
  }
}

export const roadChunks: { [id: string]: RoadChunkProperties } = {
  [ChunkType.ROAD_STRAIGHT_0.toString()]: new RoadChunkProperties(
    ChunkType.ROAD_STRAIGHT_0,
    [
      new LaneProperties(0, 110, 1.0),
      new LaneProperties(1, 155, 0.93),
      new LaneProperties(2, 200, 0.86),
      new LaneProperties(3, 245, 0.79),
    ],
    [
      ChunkType.ROAD_STRAIGHT_0,
      ChunkType.ROAD_STRAIGHT_0,
      ChunkType.ROAD_STRAIGHT_0,
      ChunkType.ROAD_STRAIGHT_1,
      ChunkType.ROAD_STRAIGHT_1,
    ],
  ),
  [ChunkType.ROAD_STRAIGHT_1.toString()]: new RoadChunkProperties(
    ChunkType.ROAD_STRAIGHT_1,
    [
      new LaneProperties(0, 110, 1.0),
      new LaneProperties(1, 155, 0.93),
      new LaneProperties(2, 200, 0.86),
      new LaneProperties(3, 245, 0.79),
    ],
    [
      ChunkType.ROAD_STRAIGHT_1,
      ChunkType.ROAD_STRAIGHT_1,
      ChunkType.ROAD_STRAIGHT_1,
      ChunkType.ROAD_STRAIGHT_0,
      ChunkType.ROAD_STRAIGHT_0,
    ],
  ) /*,
    [ChunkType.ROAD_STRAIGHT_2.toString()]: new RoadChunkProperties(
        ChunkType.ROAD_STRAIGHT_2, 
        [
            new LaneProperties(0, 5, 1.00),
            new LaneProperties(1, 13, 0.93),
            new LaneProperties(2, 21, 0.86),
            new LaneProperties(3, 29, 0.79)
        ], 
        [
            ChunkType.ROAD_STRAIGHT_2, ChunkType.ROAD_STRAIGHT_2, ChunkType.ROAD_STRAIGHT_2, 
            ChunkType.ROAD_STRAIGHT_1, ChunkType.ROAD_STRAIGHT_0
        ]
    )*/,
}
