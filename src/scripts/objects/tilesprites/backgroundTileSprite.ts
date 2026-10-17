import IMovable from '../interfaces/IMovable'
import { Mapping } from '../_common/mappingHelper';

export interface BackgroundTileSpriteMapping extends Mapping {
    tileSprite?: BackgroundTileSprite;

    screenOffsetMult?: Phaser.Math.Vector2;
    
    origin?: Phaser.Math.Vector2;
    outerScale?: number;
    innerScale?: number;

    moveSpeed: number;

    depth?: number;
};

export default class BackgroundTileSprite extends Phaser.GameObjects.TileSprite implements IMovable {
    public speed: number;

    constructor(scene: Phaser.Scene, mappingKey: string, speed: number, outerScale?: number, innerScale?: number, depth?: number, origin?: Phaser.Math.Vector2, screenOffsetMult?: Phaser.Math.Vector2) {
        super(
            scene, 
            scene.cameras.main.width * (screenOffsetMult?.x ?? (origin?.x ?? .5)), 
            scene.cameras.main.height * (screenOffsetMult?.y ?? (origin?.y ?? .5)),
            0,
            0,
            mappingKey
        );

        this.speed = speed;
        
        if (origin) {
            this.setOrigin(origin.x, origin.y);
        }

        if (outerScale) {
            this.setScale(outerScale);
        }

        if (innerScale) {
            this.setTileScale(innerScale);
        }

        if (depth) {
            this.setDepth(depth);
        }

        scene.add.existing(this);
     }

     public setSpeed(speed: number): void {
         this.speed = speed;
     }

     public move(dt: number = 1): void {
         this.tilePositionX += this.speed * dt;
     }
  }