import { sourceModel } from '../models/source'
import { ControlState } from '../models/settings'
import { LayerIDX } from '../objects/_common/common'

/** Height of the bottom control bar as a fraction of screen height. */
export const MOBILE_BAR_RATIO = 0.16;

/**
 * Full-screen overlay: both lane buttons sit in one bottom bar (side by side).
 * Thumb-friendly on landscape phones; top of the playfield stays clear.
 */
export default class MobileControlsScene extends Phaser.Scene {
  private enabled = true;
  private bar?: Phaser.GameObjects.Rectangle;
  private upArrow?: Phaser.GameObjects.Image;
  private downArrow?: Phaser.GameObjects.Image;
  private upZone?: Phaser.GameObjects.Zone;
  private downZone?: Phaser.GameObjects.Zone;

  constructor() {
    super({ key: 'MobileControls' });
  }

  private create(): void {
    // Scene instances are reused across AGAIN — reset after game-over disable.
    this.enabled = true;

    const w = this.scale.width;
    const h = this.scale.height;
    const barH = Math.round(h * MOBILE_BAR_RATIO);
    const barY = h - barH / 2;
    // Leave bottom-left clear for the mute button on SceneLevel.
    const muteSafe = 110;
    const barX = muteSafe;
    const barW = w - muteSafe;
    const halfW = barW / 2;

    this.cameras.main.setBackgroundColor('rgba(0,0,0,0)');

    this.bar = this.add.rectangle(barX + barW / 2, barY, barW, barH, 0x000000, 0.35)
      .setStrokeStyle(2, 0xffffff, 0.22)
      .setDepth(LayerIDX.GUI);

    // Left half of the bar = upper lane, right half = lower lane.
    this.upZone = this.add.zone(barX + halfW / 2, barY, halfW, barH)
      .setInteractive()
      .setDepth(LayerIDX.GUI + 1);

    this.downZone = this.add.zone(barX + halfW + halfW / 2, barY, halfW, barH)
      .setInteractive()
      .setDepth(LayerIDX.GUI + 1);

    this.upArrow = this.add.image(barX + halfW / 2, barY, sourceModel.spriteArrowsPlay.mappingKey, ControlState.PENDING)
      .setAngle(90)
      .setScale(1.45)
      .setAlpha(0.8)
      .setDepth(LayerIDX.GUI + 2);

    this.downArrow = this.add.image(barX + halfW + halfW / 2, barY, sourceModel.spriteArrowsPlay.mappingKey, ControlState.PENDING)
      .setAngle(-90)
      .setScale(1.45)
      .setAlpha(0.8)
      .setDepth(LayerIDX.GUI + 2);

    // Subtle divider between the two halves.
    this.add.rectangle(barX + halfW, barY, 2, barH * 0.7, 0xffffff, 0.25)
      .setDepth(LayerIDX.GUI + 1);

    this.upZone.on('pointerdown', () => this.press('up'));
    this.downZone.on('pointerdown', () => this.press('down'));

    const releaseUp = () => this.release('up');
    const releaseDown = () => this.release('down');
    this.upZone.on('pointerup', releaseUp);
    this.upZone.on('pointerout', releaseUp);
    this.upZone.on('pointerupoutside', releaseUp);
    this.downZone.on('pointerup', releaseDown);
    this.downZone.on('pointerout', releaseDown);
    this.downZone.on('pointerupoutside', releaseDown);

    this.game.events.on('mobileControlsEnabled', this.setEnabled, this);
    this.events.once('shutdown', () => {
      this.game.events.off('mobileControlsEnabled', this.setEnabled, this);
    });
  }

  private setEnabled = (enabled: boolean): void => {
    this.enabled = enabled;
    this.bar?.setVisible(enabled);
    this.upArrow?.setVisible(enabled);
    this.downArrow?.setVisible(enabled);
    this.upZone?.setVisible(enabled).setActive(enabled);
    this.downZone?.setVisible(enabled).setActive(enabled);

    if (!enabled) {
      this.upZone?.disableInteractive();
      this.downZone?.disableInteractive();
    } else {
      this.upZone?.setInteractive();
      this.downZone?.setInteractive();
    }
  };

  private press(side: 'up' | 'down'): void {
    if (!this.enabled) {
      return;
    }

    const arrow = side === 'up' ? this.upArrow : this.downArrow;
    arrow?.setFrame(ControlState.SELECTED).setAlpha(1);
    this.bar?.setFillStyle(0x111111, 0.5);

    this.sound.play(sourceModel.soundButton.mappingKey);
    this.game.events.emit(side === 'up' ? 'mobileLaneUp' : 'mobileLaneDown');
  }

  private release(side: 'up' | 'down'): void {
    const arrow = side === 'up' ? this.upArrow : this.downArrow;
    arrow?.setFrame(ControlState.PENDING).setAlpha(0.8);
    this.bar?.setFillStyle(0x000000, 0.35);
  }
}
