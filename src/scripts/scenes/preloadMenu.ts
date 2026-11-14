import { sourceModel } from '../models/source'
import { loadAtlas, loadAudio, loadBitmapFont, loadImage, loadSpritesheet } from '../objects/_common/assetLoader'

export default class PreloadMenu extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadMenu' })
  }

  private preload(): void {
    loadBitmapFont(this, sourceModel.font)

    loadImage(this, sourceModel.imageLogo)
    loadImage(this, sourceModel.imageCity)
    loadImage(this, sourceModel.imageHill)
    loadImage(this, sourceModel.imageForest)
    loadImage(this, sourceModel.imageClouds)

    loadSpritesheet(this, sourceModel.spriteStart)
    loadSpritesheet(this, sourceModel.spriteMute)

    loadAudio(this, sourceModel.soundButton)

    loadImage(this, sourceModel.imageRoadStraight0)
    loadImage(this, sourceModel.imageRoadStraight1)

    loadAtlas(this, sourceModel.atlasVehicle)
    loadSpritesheet(this, sourceModel.spriteExplosion)
  }

  private create(): void {
    this.scene.start('SceneMenu')
  }
}
