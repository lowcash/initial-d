import { sourceModel } from '../models/source'
import { ControlState } from '../models/settings'
import { LayerIDX } from '../objects/_common/common'

/** Fraction of screen height for each top/bottom tap rail. */
export const MOBILE_RAIL_RATIO = 0.14;

/**
 * Full-screen overlay: wide top/bottom tap rails.
 * Maps naturally to upper/lower lanes without shrinking the playfield
 * and without covering the center of the road.
 */
export default class MobileControlsScene extends Phaser.Scene {
  private enabled = true;
  private upArrow?: Phaser.GameObjects.Image;
  private downArrow?: Phaser.GameObjects.Image;
  private topRail?: Phaser.GameObjects.Rectangle;
  private bottomRail?: Phaser.GameObjects.Rectangle;

  constructor() {
    super({ key: 'MobileControls' });
  }

  private create(): void {
    const w = this.scale.width;
    const h = this.scale.height;
    const railH = Math.round(h * MOBILE_RAIL_RATIO);

    this.cameras.main.setBackgroundColor('rgba(0,0,0,0)');

    // Top = upper lane (sky / city band). Full width — easy to hit.
    this.topRail = this.add.rectangle(w / 2, railH / 2, w, railH, 0x000000, 0.22)
      .setStrokeStyle(1, 0xffffff, 0.2)
      .setInteractive()
      .setDepth(LayerIDX.GUI);

    // Bottom = lower lane. Leave bottom-left clear for the mute button.
    const muteSafe = 120;
    const bottomW = w - muteSafe;
    this.bottomRail = this.add.rectangle(
      muteSafe + bottomW / 2,
      h - railH / 2,
      bottomW,
      railH,
      0x000000,
      0.22
    )
      .setStrokeStyle(1, 0xffffff, 0.2)
      .setInteractive()
      .setDepth(LayerIDX.GUI);

    this.upArrow = this.add.image(w / 2, railH * 0.5, sourceModel.spriteArrowsPlay.mappingKey, ControlState.PENDING)
      .setAngle(90)
      .setScale(1.35)
      .setAlpha(0.7)
      .setDepth(LayerIDX.GUI + 1);

    this.downArrow = this.add.image(
      muteSafe + bottomW / 2,
      h - railH * 0.5,
      sourceModel.spriteArrowsPlay.mappingKey,
      ControlState.PENDING
    )
      .setAngle(-90)
      .setScale(1.35)
      .setAlpha(0.7)
      .setDepth(LayerIDX.GUI + 1);

    this.topRail.on('pointerdown', () => this.press('up'));
    this.bottomRail.on('pointerdown', () => this.press('down'));

    const releaseUp = () => this.release('up');
    const releaseDown = () => this.release('down');
    this.topRail.on('pointerup', releaseUp);
    this.topRail.on('pointerout', releaseUp);
    this.topRail.on('pointerupoutside', releaseUp);
    this.bottomRail.on('pointerup', releaseDown);
    this.bottomRail.on('pointerout', releaseDown);
    this.bottomRail.on('pointerupoutside', releaseDown);

    this.game.events.on('mobileControlsEnabled', this.setEnabled, this);
    this.events.once('shutdown', () => {
      this.game.events.off('mobileControlsEnabled', this.setEnabled, this);
    });
  }

  private setEnabled = (enabled: boolean): void => {
    this.enabled = enabled;
    this.topRail?.setVisible(enabled).setActive(enabled);
    this.bottomRail?.setVisible(enabled).setActive(enabled);
    this.upArrow?.setVisible(enabled);
    this.downArrow?.setVisible(enabled);

    if (!enabled) {
      this.topRail?.disableInteractive();
      this.bottomRail?.disableInteractive();
    } else {
      this.topRail?.setInteractive();
      this.bottomRail?.setInteractive();
    }
  };

  private press(side: 'up' | 'down'): void {
    if (!this.enabled) {
      return;
    }

    const arrow = side === 'up' ? this.upArrow : this.downArrow;
    const rail = side === 'up' ? this.topRail : this.bottomRail;
    arrow?.setFrame(ControlState.SELECTED).setAlpha(1);
    rail?.setFillStyle(0x222222, 0.4);

    this.sound.play(sourceModel.soundButton.mappingKey);
    this.game.events.emit(side === 'up' ? 'mobileLaneUp' : 'mobileLaneDown');
  }

  private release(side: 'up' | 'down'): void {
    const arrow = side === 'up' ? this.upArrow : this.downArrow;
    const rail = side === 'up' ? this.topRail : this.bottomRail;
    arrow?.setFrame(ControlState.PENDING).setAlpha(0.7);
    rail?.setFillStyle(0x000000, 0.22);
  }
}
