import { Mapping } from '../_common/mappingHelper'
import AudioHelper from '../_common/audioHelper'

export interface BasicButtonMapping extends Mapping {
  button?: BasicButton

  screenOffsetMult?: Phaser.Math.Vector2

  standartScale?: number
  actionScale?: number

  depth?: number
}

export default class BasicButton extends Phaser.GameObjects.Sprite {
  private readonly soundKey?: string

  constructor(
    scene: Phaser.Scene,
    pos: Phaser.Math.Vector2,
    mappingKey: string,
    depth?: number,
    scale?: number,
    angleRotation?: number,
    soundKey?: string,
  ) {
    super(scene, pos.x, pos.y, mappingKey)

    if (scale) {
      this.setScale(scale)
    }

    if (depth) {
      this.setDepth(depth)
    }

    if (angleRotation) {
      this.setOrigin(0.5, 0.5)
      this.setAngle(angleRotation)
    }

    this.soundKey = soundKey

    this.setInteractive()

    scene.add.existing(this)
  }

  public playSound(): void {
    if (this.soundKey) {
      AudioHelper.playSfx(this.scene, this.soundKey)
    }
  }
}
