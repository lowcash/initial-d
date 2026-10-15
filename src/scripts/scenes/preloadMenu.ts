import { sourceModel } from '../models/source'

export default class PreloadMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadMenu' })
    }

    private preload(): void {
        this.load.bitmapFont(sourceModel.font.mappingKey, sourceModel.font.sourcePath, sourceModel.font.sourceMapperPath);

        this.load.image(sourceModel.imageLogo.mappingKey, sourceModel.imageLogo.sourcePath);
        this.load.image(sourceModel.imageCity.mappingKey, sourceModel.imageCity.sourcePath);
        this.load.image(sourceModel.imageHill.mappingKey, sourceModel.imageHill.sourcePath);
        this.load.image(sourceModel.imageForest.mappingKey, sourceModel.imageForest.sourcePath);
        this.load.image(sourceModel.imageClouds.mappingKey, sourceModel.imageClouds.sourcePath);

        this.load.spritesheet(
            sourceModel.spriteStart.mappingKey,
            sourceModel.spriteStart.sourcePath,
            {
                frameWidth: 191,
                frameHeight: 69
            }
        );

        this.load.image(sourceModel.imageMuteOn.mappingKey, sourceModel.imageMuteOn.sourcePath);
        this.load.image(sourceModel.imageMuteOff.mappingKey, sourceModel.imageMuteOff.sourcePath);

        this.load.audio(sourceModel.soundButton.mappingKey, sourceModel.soundButton.sourcePath);

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
    }

    private create(): void {
        this.scene.start('SceneMenu');
    }
}