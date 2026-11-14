export default class HUD extends Phaser.GameObjects.Graphics {
  constructor(
    scene: Phaser.Scene,
    shape: Phaser.Geom.Rectangle,
    color: number = 0x000000,
    alpha: number = 1,
    depth?: number,
  ) {
    super(scene)

    this.fillStyle(color, alpha)
    this.beginPath()
    this.moveTo(shape.x, shape.y)
    this.lineTo(shape.width, shape.y)
    this.lineTo(shape.width, shape.height)
    this.lineTo(shape.x, shape.height)
    this.lineTo(shape.x, shape.y)
    this.closePath()
    this.fillPath()

    if (depth) {
      this.setDepth(depth)
    }

    scene.add.existing(this)
  }
}

export type HUDFrameSettings = {
  text?: string
  textPadding?: number
  fontSize?: number
  color?: number
  alpha?: number
}
