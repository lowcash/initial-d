export default interface ICollidable {
  registerCollision(collideWith: Phaser.Physics.Arcade.Sprite): void
}
