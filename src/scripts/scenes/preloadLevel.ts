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
    this.load.bitmapFont(sourceModel.font.mappingKey, sourceModel.font.sourcePath, sourceModel.font.sourceMapperPath);

    this.load.image(sourceModel.imageCity.mappingKey, sourceModel.imageCity.sourcePath);
    this.load.image(sourceModel.imageHill.mappingKey, sourceModel.imageHill.sourcePath);
    this.load.image(sourceModel.imageForest.mappingKey, sourceModel.imageForest.sourcePath);
    this.load.image(sourceModel.imageClouds.mappingKey, sourceModel.imageClouds.sourcePath);

    this.load.spritesheet(
      sourceModel.spriteArrowsPlay.mappingKey,
      sourceModel.spriteArrowsPlay.sourcePath,
      {
        frameWidth: 84,
        frameHeight: 76
      }
    );

    this.load.spritesheet(
      sourceModel.spriteAgain.mappingKey,
      sourceModel.spriteAgain.sourcePath,
      {
        frameWidth: 608,
        frameHeight: 228
      }
    );

    this.load.spritesheet(
      sourceModel.spriteMenu.mappingKey,
      sourceModel.spriteMenu.sourcePath,
      {
        frameWidth: 602,
        frameHeight: 228
      }
    );

    this.load.image(sourceModel.imageGameOver.mappingKey, sourceModel.imageGameOver.sourcePath);

    this.load.spritesheet(
      sourceModel.spriteMute.mappingKey,
      sourceModel.spriteMute.sourcePath,
      {
        frameWidth: 188,
        frameHeight: 206
      }
    );

    this.load.audio(sourceModel.soundButton.mappingKey, sourceModel.soundButton.sourcePath);
    this.load.audio(sourceModel.soundBgm.mappingKey, sourceModel.soundBgm.sourcePath);

    this.load.image(sourceModel.imageRoadStraight0.mappingKey, sourceModel.imageRoadStraight0.sourcePath);
    this.load.image(sourceModel.imageRoadStraight1.mappingKey, sourceModel.imageRoadStraight1.sourcePath);

    this.load.atlas(
      sourceModel.atlasVehicle.mappingKey,
      sourceModel.atlasVehicle.sourcePath,
      sourceModel.atlasVehicle.sourceMapperPath
    );

    this.load.spritesheet(
      sourceModel.spriteExplosion.mappingKey,
      sourceModel.spriteExplosion.sourcePath,
      {
        frameWidth: 17,
        frameHeight: 17
      }
    );

    this.load.audio(sourceModel.soundExplosion.mappingKey, sourceModel.soundExplosion.sourcePath);

    this.load.spritesheet(
      sourceModel.spriteCoin.mappingKey,
      sourceModel.spriteCoin.sourcePath,
      {
        frameWidth: 32,
        frameHeight: 32
      }
    );

    this.load.audio(sourceModel.soundCoin.mappingKey, sourceModel.soundCoin.sourcePath);
  }

  private create(): void {
    this.scene.start('SceneLevel', this.menuSettings);
  }
}
