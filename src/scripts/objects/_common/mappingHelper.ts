export interface Mapping {
  mappingKey: string
}

export interface KeyMapping extends Mapping {
  key: string
}

export interface SpriteMapping extends KeyMapping {
  sprite?: Phaser.Physics.Arcade.Sprite | Phaser.GameObjects.TileSprite
}

export interface SpriteMappingSized extends SpriteMapping {
  size: number
}
