import { sourceModel } from '../models/source'
import { SettingsModel } from '../models/settings'
import {
  loadAtlasIfMissing,
  loadAudioIfMissing,
  loadBitmapFontIfMissing,
  loadImageIfMissing,
  loadSpritesheetIfMissing,
} from '../objects/_common/assetLoader'

export default class PreloadLevel extends Phaser.Scene {
  private menuSettings: SettingsModel

  constructor() {
    super({ key: 'PreloadLevel' })
  }

  private init(data: SettingsModel): void {
    this.menuSettings = data
  }

  private preload(): void {
    const { width, height } = this.cameras.main

    const label = this.add
      .text(width / 2, height / 2 - 36, 'LOADING...', {
        fontFamily: 'monospace',
        fontSize: '28px',
        color: '#ffffff',
      })
      .setOrigin(0.5)

    const track = this.add.rectangle(width / 2, height / 2 + 8, 420, 18, 0x333333).setOrigin(0.5)
    const fill = this.add.rectangle(track.x - track.width / 2, track.y, 0, 14, 0xffcc33).setOrigin(0, 0.5)

    this.load.on('progress', (value: number) => {
      fill.width = 420 * value
      label.setText(`LOADING... ${Math.floor(value * 100)}%`)
    })

    loadImageIfMissing(this, sourceModel.imageCity)
    loadImageIfMissing(this, sourceModel.imageHill)
    loadImageIfMissing(this, sourceModel.imageForest)
    loadImageIfMissing(this, sourceModel.imageClouds)
    loadImageIfMissing(this, sourceModel.imageRoadStraight0)
    loadImageIfMissing(this, sourceModel.imageRoadStraight1)
    loadImageIfMissing(this, sourceModel.imageGameOver)

    loadBitmapFontIfMissing(this, sourceModel.font)

    loadSpritesheetIfMissing(this, sourceModel.spriteArrowsPlay)
    loadSpritesheetIfMissing(this, sourceModel.spriteAgain)
    loadSpritesheetIfMissing(this, sourceModel.spriteMenu)
    loadSpritesheetIfMissing(this, sourceModel.spriteMute)
    loadSpritesheetIfMissing(this, sourceModel.spriteExplosion)
    loadSpritesheetIfMissing(this, sourceModel.spriteCoin)

    loadAtlasIfMissing(this, sourceModel.atlasVehicle)

    loadAudioIfMissing(this, sourceModel.soundButton)
    loadAudioIfMissing(this, sourceModel.soundBgm)
    loadAudioIfMissing(this, sourceModel.soundExplosion)
    loadAudioIfMissing(this, sourceModel.soundCoin)
  }

  private create(): void {
    this.scene.start('SceneLevel', this.menuSettings)
  }
}
