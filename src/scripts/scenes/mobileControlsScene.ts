import { sourceModel } from '../models/source'
import { ControlState } from '../models/settings'
import { LayerIDX } from '../objects/_common/common'

/** Shared with SceneLevel — side gutters outside the shrunken playfield. */
export const MOBILE_GUTTER_RATIO = 0.17;

/**
 * Full-screen overlay: huge left/right tap zones living in the canvas gutters
 * while SceneLevel's playfield is inset. No aiming required — whole rail is hot.
 */
export default class MobileControlsScene extends Phaser.Scene {
  private enabled = true;
  private upArrow?: Phaser.GameObjects.Image;
  private downArrow?: Phaser.GameObjects.Image;
  private leftRail?: Phaser.GameObjects.Rectangle;
  private rightRail?: Phaser.GameObjects.Rectangle;

  constructor() {
    super({ key: 'MobileControls' });
  }

  private create(): void {
    const w = this.scale.width;
    const h = this.scale.height;
    const gutter = Math.round(w * MOBILE_GUTTER_RATIO);

    this.cameras.main.setBackgroundColor('rgba(0,0,0,0)');

    // Full-height rails — the entire gutter is the button.
    this.leftRail = this.add.rectangle(gutter / 2, h / 2, gutter, h, 0x111111, 0.55)
      .setStrokeStyle(2, 0xffffff, 0.25)
      .setInteractive()
      .setDepth(LayerIDX.GUI);

    this.rightRail = this.add.rectangle(w - gutter / 2, h / 2, gutter, h, 0x111111, 0.55)
      .setStrokeStyle(2, 0xffffff, 0.25)
      .setInteractive()
      .setDepth(LayerIDX.GUI);

    this.upArrow = this.add.image(gutter / 2, h * 0.5, sourceModel.spriteArrowsPlay.mappingKey, ControlState.PENDING)
      .setAngle(90)
      .setScale(1.7)
      .setAlpha(0.75)
      .setDepth(LayerIDX.GUI + 1);

    this.downArrow = this.add.image(w - gutter / 2, h * 0.5, sourceModel.spriteArrowsPlay.mappingKey, ControlState.PENDING)
      .setAngle(-90)
      .setScale(1.7)
      .setAlpha(0.75)
      .setDepth(LayerIDX.GUI + 1);

    this.leftRail.on('pointerdown', () => this.press('up'));
    this.rightRail.on('pointerdown', () => this.press('down'));

    const releaseUp = () => this.release('up');
    const releaseDown = () => this.release('down');
    this.leftRail.on('pointerup', releaseUp);
    this.leftRail.on('pointerout', releaseUp);
    this.leftRail.on('pointerupoutside', releaseUp);
    this.rightRail.on('pointerup', releaseDown);
    this.rightRail.on('pointerout', releaseDown);
    this.rightRail.on('pointerupoutside', releaseDown);

    this.game.events.on('mobileControlsEnabled', this.setEnabled, this);
    this.events.once('shutdown', () => {
      this.game.events.off('mobileControlsEnabled', this.setEnabled, this);
    });
  }

  private setEnabled = (enabled: boolean): void => {
    this.enabled = enabled;
    this.leftRail?.setVisible(enabled).setActive(enabled);
    this.rightRail?.setVisible(enabled).setActive(enabled);
    this.upArrow?.setVisible(enabled);
    this.downArrow?.setVisible(enabled);

    if (!enabled) {
      this.leftRail?.disableInteractive();
      this.rightRail?.disableInteractive();
    } else {
      this.leftRail?.setInteractive();
      this.rightRail?.setInteractive();
    }
  };

  private press(side: 'up' | 'down'): void {
    if (!this.enabled) {
      return;
    }

    const arrow = side === 'up' ? this.upArrow : this.downArrow;
    const rail = side === 'up' ? this.leftRail : this.rightRail;
    arrow?.setFrame(ControlState.SELECTED).setAlpha(1);
    rail?.setFillStyle(0x333333, 0.7);

    this.sound.play(sourceModel.soundButton.mappingKey);
    this.game.events.emit(side === 'up' ? 'mobileLaneUp' : 'mobileLaneDown');
  }

  private release(side: 'up' | 'down'): void {
    const arrow = side === 'up' ? this.upArrow : this.downArrow;
    const rail = side === 'up' ? this.leftRail : this.rightRail;
    arrow?.setFrame(ControlState.PENDING).setAlpha(0.75);
    rail?.setFillStyle(0x111111, 0.55);
  }
}
