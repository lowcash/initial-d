import { SourceMapping, sourceModel } from '../../models/source'

/** Load helpers that read frame sizes / paths only from the asset manifest. */
export function loadImage(scene: Phaser.Scene, asset: SourceMapping): void {
  scene.load.image(asset.mappingKey, asset.sourcePath)
}

export function loadImageIfMissing(scene: Phaser.Scene, asset: SourceMapping): void {
  if (!scene.textures.exists(asset.mappingKey)) {
    loadImage(scene, asset)
  }
}

export function loadBitmapFont(scene: Phaser.Scene, asset: SourceMapping): void {
  scene.load.bitmapFont(asset.mappingKey, asset.sourcePath, asset.sourceMapperPath)
}

export function loadBitmapFontIfMissing(scene: Phaser.Scene, asset: SourceMapping): void {
  if (!scene.textures.exists(asset.mappingKey)) {
    loadBitmapFont(scene, asset)
  }
}

export function loadSpritesheet(scene: Phaser.Scene, asset: SourceMapping): void {
  scene.load.spritesheet(asset.mappingKey, asset.sourcePath, {
    frameWidth: asset.frameWidth!,
    frameHeight: asset.frameHeight!,
  })
}

export function loadSpritesheetIfMissing(scene: Phaser.Scene, asset: SourceMapping): void {
  if (!scene.textures.exists(asset.mappingKey)) {
    loadSpritesheet(scene, asset)
  }
}

export function loadAtlas(scene: Phaser.Scene, asset: SourceMapping): void {
  scene.load.atlas(asset.mappingKey, asset.sourcePath, asset.sourceMapperPath)
}

export function loadAtlasIfMissing(scene: Phaser.Scene, asset: SourceMapping): void {
  if (!scene.textures.exists(asset.mappingKey)) {
    loadAtlas(scene, asset)
  }
}

export function loadAudio(scene: Phaser.Scene, asset: SourceMapping): void {
  scene.load.audio(asset.mappingKey, asset.sourcePath)
}

export function loadAudioIfMissing(scene: Phaser.Scene, asset: SourceMapping): void {
  if (!scene.cache.audio.exists(asset.mappingKey)) {
    loadAudio(scene, asset)
  }
}

/** Prefetch heavy level assets from the menu while the player picks a car. */
export function prefetchLevelAssets(scene: Phaser.Scene): void {
  let queued = false
  const queueAudio = (asset: SourceMapping) => {
    if (!scene.cache.audio.exists(asset.mappingKey)) {
      loadAudio(scene, asset)
      queued = true
    }
  }
  const queueSheet = (asset: SourceMapping) => {
    if (!scene.textures.exists(asset.mappingKey)) {
      loadSpritesheet(scene, asset)
      queued = true
    }
  }
  const queueImage = (asset: SourceMapping) => {
    if (!scene.textures.exists(asset.mappingKey)) {
      loadImage(scene, asset)
      queued = true
    }
  }

  queueAudio(sourceModel.soundBgm)
  queueAudio(sourceModel.soundExplosion)
  queueAudio(sourceModel.soundCoin)
  queueSheet(sourceModel.spriteCoin)
  queueSheet(sourceModel.spriteAgain)
  queueSheet(sourceModel.spriteMenu)
  queueSheet(sourceModel.spriteArrowsPlay)
  queueImage(sourceModel.imageGameOver)

  if (queued) {
    scene.load.start()
  }
}
