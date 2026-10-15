import { sourceModel } from '../../models/source'
import { LayerIDX } from '../_common/common'
import AudioHelper from '../_common/audioHelper'

/**
 * 16×16 pixel-art speaker — bottom-left, nearest-neighbor scale.
 */
export default class MuteButton {
  private readonly icon: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene) {
    AudioHelper.applyMute(scene);

    for (const key of [sourceModel.imageMuteOn.mappingKey, sourceModel.imageMuteOff.mappingKey]) {
      if (scene.textures.exists(key)) {
        scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
      }
    }

    this.icon = scene.add.image(
      20,
      scene.cameras.main.height - 20,
      MuteButton.textureKey(AudioHelper.isMuted())
    )
      .setOrigin(0, 1)
      .setScale(3.5)
      .setDepth(LayerIDX.GUI + 2)
      .setInteractive({ useHandCursor: true });

    this.icon.on('pointerdown', () => {
      const muted = AudioHelper.toggleMute(scene);
      this.icon.setTexture(MuteButton.textureKey(muted));
      scene.sound.play(sourceModel.soundButton.mappingKey);
    });

    this.icon.on('pointerover', () => this.icon.setScale(3.85));
    this.icon.on('pointerout', () => this.icon.setScale(3.5));
  }

  private static textureKey(muted: boolean): string {
    return muted
      ? sourceModel.imageMuteOff.mappingKey
      : sourceModel.imageMuteOn.mappingKey;
  }
}
