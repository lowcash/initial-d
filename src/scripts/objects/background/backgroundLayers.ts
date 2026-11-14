import { sourceModel } from '../../models/source'
import { BackgroundTileSpriteMapping } from '../tilesprites/backgroundTileSprite'
import BackgroundTileSpriteExtended from '../tilesprites/backgroundTileSpriteExtended'
import Map from '../map/map'
import Traffic from '../traffic/traffic'

export type BackgroundLayerKey = 'city' | 'hill' | 'clouds' | 'nearForest' | 'farForest' | 'farthestForest'

export type BackgroundLayers = Record<BackgroundLayerKey, BackgroundTileSpriteMapping>

export function createBackgroundLayerConfigs(): BackgroundLayers {
  return {
    city: {
      mappingKey: sourceModel.imageCity.mappingKey,
      screenOffsetMult: new Phaser.Math.Vector2(0.5, 0.35),
      moveSpeed: -0.25,
      depth: 0,
    },
    hill: {
      mappingKey: sourceModel.imageHill.mappingKey,
      screenOffsetMult: new Phaser.Math.Vector2(0.5, 0.65),
      moveSpeed: -0.5,
      depth: 0,
    },
    clouds: {
      mappingKey: sourceModel.imageClouds.mappingKey,
      screenOffsetMult: new Phaser.Math.Vector2(0.5, 0.12),
      moveSpeed: -0.25,
      innerScale: 1.25,
      depth: 10,
    },
    nearForest: {
      mappingKey: sourceModel.imageForest.mappingKey,
      moveSpeed: -1.0,
      innerScale: 1.3,
      depth: 50,
      origin: new Phaser.Math.Vector2(0.5, 1.0),
    },
    farForest: {
      mappingKey: sourceModel.imageForest.mappingKey,
      screenOffsetMult: new Phaser.Math.Vector2(0.5, 0.72),
      moveSpeed: -1.0,
      innerScale: 0.7,
      origin: new Phaser.Math.Vector2(0.5, 1.0),
      depth: 8,
    },
    farthestForest: {
      mappingKey: sourceModel.imageForest.mappingKey,
      screenOffsetMult: new Phaser.Math.Vector2(0.5, 0.72),
      moveSpeed: -1.0,
      innerScale: 0.5,
      origin: new Phaser.Math.Vector2(0.5, 1.0),
      depth: 7,
    },
  }
}

export function createBackgroundLayers(scene: Phaser.Scene, layers: BackgroundLayers): BackgroundLayers {
  for (const layer of Object.values(layers)) {
    if (!layer.tileSprite) {
      layer.tileSprite = new BackgroundTileSpriteExtended(
        scene,
        layer.mappingKey,
        layer.moveSpeed,
        layer.outerScale,
        layer.innerScale,
        layer.depth,
        layer.origin,
        layer.screenOffsetMult,
      )
    }
  }
  return layers
}

export function moveBackgroundLayers(layers: BackgroundLayers, dt: number): void {
  for (const layer of Object.values(layers)) {
    layer.tileSprite?.move(dt)
  }
}

export const MAP_DEFAULTS = {
  depth: 9,
  screenOffsetMult: new Phaser.Math.Vector2(0, 1),
  startNumChunks: 8,
  moveSpeed: -1.0,
}

export const TRAFFIC_DEFAULTS = {
  playerStartOffset: new Phaser.Math.Vector2(50, 0),
  depth: MAP_DEFAULTS.depth,
}

export function prepareMap(
  scene: Phaser.Scene,
  existing: Map | undefined,
  depth: number,
  screenOffsetMult: Phaser.Math.Vector2,
  startNumChunks: number,
): Map {
  if (existing) {
    existing.generateMap(startNumChunks)
    return existing
  }
  return new Map(
    scene,
    depth,
    new Phaser.Math.Vector2(
      scene.cameras.main.width * screenOffsetMult.x,
      scene.cameras.main.height * screenOffsetMult.y,
    ),
    startNumChunks,
  )
}

export function prepareTraffic(scene: Phaser.Scene, map: Map, depth: number, existing?: Traffic): Traffic {
  if (existing) {
    return existing
  }
  return new Traffic(scene, map, depth)
}
