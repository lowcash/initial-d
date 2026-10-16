import { sourceModel } from '../../models/source'
import { LayerIDX } from '../_common/common'
import AudioHelper from '../_common/audioHelper'

/** Pixel mute button — bottom-left. Frame 0 = sound on, 1 = muted. Also toggles with M. */
export default class MuteButton {
  private readonly icon: Phaser.GameObjects.Sprite;
  private readonly scene: Phaser.Scene;
  private readonly onMuteKey: () => void;

  /** Recut frames are 188×206 (equalized width); keep compact in the corner. */
  private static readonly FRAME_W = 188;
  private static readonly SCALE = 0.4;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    AudioHelper.applyMute(scene);

    const key = sourceModel.spriteMute.mappingKey;
    if (scene.textures.exists(key)) {
      scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
    }

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

    this.icon.on('pointerdown', () => this.toggle());
    this.icon.on('pointerover', () => this.icon.setScale(MuteButton.SCALE * 1.08));
    this.icon.on('pointerout', () => this.icon.setScale(MuteButton.SCALE));

    // Quiet keyboard shortcut — no on-screen "[M]" (clutters the pixel HUD).
    this.onMuteKey = () => this.toggle();
    scene.input.keyboard?.on('keydown-M', this.onMuteKey);

    this.icon.on('destroy', () => {
      scene.input.keyboard?.off('keydown-M', this.onMuteKey);
    });
  }

  private toggle(): void {
    const muted = AudioHelper.toggleMute(this.scene);
    this.icon.setFrame(MuteButton.frame(muted), false, false);
    this.scene.sound.play(sourceModel.soundButton.mappingKey);
  }

  private static frame(muted: boolean): number {
    return muted ? 1 : 0;
  }
}
