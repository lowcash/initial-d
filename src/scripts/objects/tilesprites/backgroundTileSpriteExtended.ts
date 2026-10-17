import { GameEvent } from '../_common/common';
import BackgroundTileSprite from './backgroundTileSprite'

/**
 * BackgrounTileSprite extended by map change handling and adjusting its speed
 */
export default class BackgroundTileSpriteExtended extends BackgroundTileSprite {
    private readonly defaultSpeed: number;

    constructor(scene: Phaser.Scene,  mappingKey: string, speed: number, outerScale?: number, innerScale?: number, depth?: number, origin?: Phaser.Math.Vector2, screenOffsetMult?: Phaser.Math.Vector2) {
        super(scene, mappingKey, speed, outerScale, innerScale, depth, origin, screenOffsetMult);
        
        this.defaultSpeed = speed;

        this.scene.events.on(GameEvent.MAP_SPEED_CHANGED, this.handleMapSpeedChanged, this);
    }

    private handleMapSpeedChanged(speed: number) {
        this.speed = speed * this.defaultSpeed;
    }
};