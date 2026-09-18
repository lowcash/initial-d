import Map from '../map/map';
import BackgroundTileSprite from './backgroundTileSprite'

/**
 * BackgrounTileSprite extended by map change handling and adjusting its speed
 */
export default class BackgroundTileSpriteExtended extends BackgroundTileSprite {
    private readonly defaultSpeed: number;

    constructor(scene: Phaser.Scene,  mappingKey: string, speed: number, outerScale?: number, innerScale?: number, depth?: number, origin?: Phaser.Math.Vector2, screenOffsetMult?: Phaser.Math.Vector2) {
        super(scene, mappingKey, speed, outerScale, innerScale, depth, origin, screenOffsetMult);
        
        this.defaultSpeed = speed;

        this.scene.events.on('onMapSpeedChanged', (speed: number) => {
            this.handleMapSpeedChanged(speed);
        });
    }

    private handleMapSpeedChanged(speed: number) {
        this.speed = speed * this.defaultSpeed;
    }
};