import { LayerIDX } from '../_common/common'
import { sourceModel } from '../../models/source'

/**
 * Coin pickup juice — sparks + "+N" share one short timeline so they read as one beat.
 */
export default class PickupFx {
  static readonly DURATION_MS = 420;

  static play(scene: Phaser.Scene, x: number, y: number, points: number): void {
    const depth = LayerIDX.GUI + 4;

    const label = scene.add.bitmapText(
      x,
      y,
      sourceModel.font.mappingKey,
      `+${points}`,
      30
    )
      .setOrigin(0.5, 0.5)
      .setDepth(depth)
      .setTint(0xffe066)
      .setScale(0.7)
      .setAlpha(0);

    const ring = scene.add.circle(x, y, 6, 0xffe066, 0.4)
      .setStrokeStyle(2, 0xffffff, 0.85)
      .setDepth(depth - 1)
      .setScale(0.4);

    const sparks: Phaser.GameObjects.Rectangle[] = [];
    const colors = [0xffe066, 0xffcc33, 0xffffff, 0xff9933];
    for (let i = 0; i < 8; i++) {
      sparks.push(
        scene.add.rectangle(x, y, 3, 3, colors[i % colors.length]).setDepth(depth)
      );
    }

    // One shared "pop" beat for label + ring.
    scene.tweens.add({
      targets: label,
      alpha: 1,
      scale: 1.15,
      y: y - 36,
      duration: PickupFx.DURATION_MS * 0.45,
      ease: 'Back.easeOut',
      onComplete: () => {
        scene.tweens.add({
          targets: label,
          alpha: 0,
          y: y - 58,
          scale: 1.05,
          duration: PickupFx.DURATION_MS * 0.55,
          ease: 'Quad.easeIn',
          onComplete: () => label.destroy()
        });
      }
    });

    scene.tweens.add({
      targets: ring,
      scale: 2.4,
      alpha: 0,
      duration: PickupFx.DURATION_MS,
      ease: 'Quad.easeOut',
      onComplete: () => ring.destroy()
    });

    sparks.forEach((spark, i) => {
      const angle = (Math.PI * 2 * i) / sparks.length;
      const dist = 22 + (i % 3) * 6;
      scene.tweens.add({
        targets: spark,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist - 10,
        alpha: 0,
        scale: 0.3,
        duration: PickupFx.DURATION_MS,
        ease: 'Quad.easeOut',
        onComplete: () => spark.destroy()
      });
    });
  }
}
