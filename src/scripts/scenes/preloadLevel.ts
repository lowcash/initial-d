import { sourceModel } from '../models/source'
import { SettingsModel } from '../models/settings'

export default class PreloadLevel extends Phaser.Scene {
  private menuSettings: SettingsModel;

  constructor() {
    super({ key: 'PreloadLevel' })
  }

  private init(data: SettingsModel): void {
    this.menuSettings = data;
  }

  private preload(): void {
    const { width, height } = this.cameras.main;

    // Visible progress — first START used to look like a black freeze while BGM (~2.4MB) decoded.
    const label = this.add.text(width / 2, height / 2 - 36, 'LOADING...', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#ffffff'
    }).setOrigin(0.5);

    const track = this.add.rectangle(width / 2, height / 2 + 8, 420, 18, 0x333333).setOrigin(0.5);
    const fill = this.add.rectangle(track.x - track.width / 2, track.y, 0, 14, 0xffcc33).setOrigin(0, 0.5);

    this.load.on('progress', (value: number) => {
      fill.width = 420 * value;
      label.setText(`LOADING... ${Math.floor(value * 100)}%`);
    });

    // Skip anything already cached from the menu (or a prior run).
    this.loadImageIfMissing(sourceModel.imageCity.mappingKey, sourceModel.imageCity.sourcePath);
    this.loadImageIfMissing(sourceModel.imageHill.mappingKey, sourceModel.imageHill.sourcePath);
    this.loadImageIfMissing(sourceModel.imageForest.mappingKey, sourceModel.imageForest.sourcePath);
    this.loadImageIfMissing(sourceModel.imageClouds.mappingKey, sourceModel.imageClouds.sourcePath);
    this.loadImageIfMissing(sourceModel.imageRoadStraight0.mappingKey, sourceModel.imageRoadStraight0.sourcePath);
    this.loadImageIfMissing(sourceModel.imageRoadStraight1.mappingKey, sourceModel.imageRoadStraight1.sourcePath);
    this.loadImageIfMissing(sourceModel.imageGameOver.mappingKey, sourceModel.imageGameOver.sourcePath);

    if (!this.textures.exists(sourceModel.font.mappingKey)) {
      this.load.bitmapFont(sourceModel.font.mappingKey, sourceModel.font.sourcePath, sourceModel.font.sourceMapperPath);
    }

    this.loadSheetIfMissing(sourceModel.spriteArrowsPlay.mappingKey, sourceModel.spriteArrowsPlay.sourcePath, 84, 76);
    this.loadSheetIfMissing(sourceModel.spriteAgain.mappingKey, sourceModel.spriteAgain.sourcePath, 608, 228);
    this.loadSheetIfMissing(sourceModel.spriteMenu.mappingKey, sourceModel.spriteMenu.sourcePath, 602, 228);
    this.loadSheetIfMissing(sourceModel.spriteMute.mappingKey, sourceModel.spriteMute.sourcePath, 188, 206);
    this.loadSheetIfMissing(sourceModel.spriteExplosion.mappingKey, sourceModel.spriteExplosion.sourcePath, 17, 17);
    this.loadSheetIfMissing(sourceModel.spriteCoin.mappingKey, sourceModel.spriteCoin.sourcePath, 32, 32);

    if (!this.textures.exists(sourceModel.atlasVehicle.mappingKey)) {
      this.load.atlas(
        sourceModel.atlasVehicle.mappingKey,
        sourceModel.atlasVehicle.sourcePath,
        sourceModel.atlasVehicle.sourceMapperPath
      );
    }

    this.loadAudioIfMissing(sourceModel.soundButton.mappingKey, sourceModel.soundButton.sourcePath);
    this.loadAudioIfMissing(sourceModel.soundBgm.mappingKey, sourceModel.soundBgm.sourcePath);
    this.loadAudioIfMissing(sourceModel.soundExplosion.mappingKey, sourceModel.soundExplosion.sourcePath);
    this.loadAudioIfMissing(sourceModel.soundCoin.mappingKey, sourceModel.soundCoin.sourcePath);
  }

  private create(): void {
    this.scene.start('SceneLevel', this.menuSettings);
  }

  private loadImageIfMissing(key: string, path: string): void {
    if (!this.textures.exists(key)) {
      this.load.image(key, path);
    }
  }

  private loadSheetIfMissing(key: string, path: string, frameWidth: number, frameHeight: number): void {
    if (!this.textures.exists(key)) {
      this.load.spritesheet(key, path, { frameWidth, frameHeight });
    }
  }

  private loadAudioIfMissing(key: string, path: string): void {
    if (!this.cache.audio.exists(key)) {
      this.load.audio(key, path);
    }
  }
}
