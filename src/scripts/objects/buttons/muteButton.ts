import { sourceModel } from '../../models/source'
import { LayerIDX } from '../_common/common'
import AudioHelper from '../_common/audioHelper'

/** Pixel mute button — bottom-left. Frame 0 = sound on, 1 = muted. */
export default class MuteButton {
  private readonly icon: Phaser.GameObjects.Sprite;
  /** Recut frames are 188×206 (equalized width); keep compact in the corner. */
  private static readonly FRAME_W = 188;
  private static readonly SCALE = 0.4;

  constructor(scene: Phaser.Scene) {
    AudioHelper.applyMute(scene);

    const key = sourceModel.spriteMute.mappingKey;
    if (scene.textures.exists(key)) {
      scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
    }

    // Origin center-bottom so frame swap / hover scale stay planted.
    this.icon = scene.add.sprite(
      20 + (MuteButton.FRAME_W * MuteButton.SCALE) / 2,
      scene.cameras.main.height - 16,
      key,
      MuteButton.frame(AudioHelper.isMuted())
    )
      .setOrigin(0.5, 1)
      .setScale(MuteButton.SCALE)
      .setDepth(LayerIDX.GUI + 2)
      .setInteractive({ useHandCursor: true });

    this.icon.on('pointerdown', () => {
      const muted = AudioHelper.toggleMute(scene);
      this.icon.setFrame(MuteButton.frame(muted), false, false);
      scene.sound.play(sourceModel.soundButton.mappingKey);
    });

    this.icon.on('pointerover', () => this.icon.setScale(MuteButton.SCALE * 1.08));
    this.icon.on('pointerout', () => this.icon.setScale(MuteButton.SCALE));
  }

  private static frame(muted: boolean): number {
    return muted ? 1 : 0;
  }
}
