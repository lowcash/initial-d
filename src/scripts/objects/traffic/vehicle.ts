import Common, { Range, Direction, GameEvent } from '../_common/common'

import ICollidable from '../interfaces/ICollidable'
import IMovable from '../interfaces/IMovable'

import Map from '../map/map'

export enum VehicleType {
    AE_86_TRUENO = 'ae_86_trueno', 
    AE_86_LEVIN = 'ae_86_levin',
    EVO_3 = 'evo_3',
    EVO_4 = 'evo_4',
    _180_SX = '180_sx',
    CIVIC = 'civic',
    R_32 = 'r_32',
    RX_7_FC = 'rx_7_fc',
    RX_7_FD = 'rx_7_fd',
    S_13 = 's_13'
};

class VehicleProperties {
    type: VehicleType;

    speed: Range;
    turningStrength: number;

    constructor(type: VehicleType, speed: Range, turningStrength: number) {
        this.type = type;

        this.speed = speed;
        this.turningStrength = turningStrength;
    } 
};

export const vehicles: { [id: string]: VehicleProperties } = {
    [VehicleType.AE_86_TRUENO.toString()]: new VehicleProperties(VehicleType.AE_86_TRUENO, {from: 1, to: 3}, 130),
    [VehicleType.AE_86_LEVIN.toString()]: new VehicleProperties(VehicleType.AE_86_LEVIN, {from: 1, to: 3}, 150),
    [VehicleType.EVO_3.toString()]: new VehicleProperties(VehicleType.EVO_3, {from: 1, to: 4}, 170),
    [VehicleType.EVO_4.toString()]: new VehicleProperties(VehicleType.EVO_4, {from: 1, to: 3},  140),
    [VehicleType._180_SX.toString()]: new VehicleProperties(VehicleType._180_SX, {from: 1, to: 3},  140),
    [VehicleType.CIVIC.toString()]: new VehicleProperties(VehicleType.CIVIC, {from: 1, to: 3},  140),
    [VehicleType.R_32.toString()]: new VehicleProperties(VehicleType.R_32, {from: 1, to: 4}, 140),
    [VehicleType.RX_7_FC.toString()]: new VehicleProperties(VehicleType.RX_7_FC, {from: 1, to: 4},  140),
    [VehicleType.RX_7_FD.toString()]: new VehicleProperties(VehicleType.RX_7_FD, {from: 1, to: 4},  140),
    [VehicleType.S_13.toString()]: new VehicleProperties(VehicleType.S_13, {from: 1, to: 3},  140)
};

export default class Vehicle implements ICollidable, IMovable {
    private readonly scene: Phaser.Scene;
    private readonly map: Map;

    private readonly id: string;

    private readonly sprite: Phaser.Physics.Arcade.Sprite;

    private readonly gridPos: Phaser.Math.Vector2;

    private readonly depthLayer: number;

    private mapSpeed: number;

    private type: VehicleType;
    private turningStrength: number;
    
    private isAlive: boolean = true;
    private isTurning: boolean = false;
    private canTurn: boolean = true;

    private turnTimer?: Phaser.Time.TimerEvent;

    private readonly onMapSpeedChangedHandler: (speed: number) => void;
    
    speed: number;

    constructor(scene: Phaser.Scene, map: Map, id: string, sprite: Phaser.Physics.Arcade.Sprite, gridPos: Phaser.Math.Vector2, collideWith: Array<Phaser.Physics.Arcade.Sprite> = [], depth: number, type: VehicleType, speed: number, mapSpeed: number, turningStrength: number) {
        this.scene = scene;
        this.map = map;

        this.id = id;
        this.sprite = sprite;

        this.gridPos = gridPos;

        this.depthLayer = depth;

        this.type = type;
        this.speed = speed;
        this.turningStrength = turningStrength;

        this.mapSpeed = mapSpeed;

        for (const c of collideWith) {
            this.registerCollision(c);
        }

        this.onMapSpeedChangedHandler = (speed: number) => this.handleMapSpeedChanged(speed);
        this.scene.events.on(GameEvent.MAP_SPEED_CHANGED, this.onMapSpeedChangedHandler);
    }

    public registerCollision(collideWith: Phaser.Physics.Arcade.Sprite): void {
        this.scene.physics.add.overlap(this.sprite, collideWith, () => {
            this.scene.events.emit(GameEvent.VEHICLE_COLLIDED, this.id);
        });
    }

    public destroyVehicle(): void {
        this.isAlive = false;

        this.turnTimer?.remove(false);
        this.scene.events.off(GameEvent.MAP_SPEED_CHANGED, this.onMapSpeedChangedHandler);

        if (this.sprite.active) {
            this.sprite.destroy();
        }
    }

    public getLane(): number {
        return this.gridPos.y;
    }

    public getSprite(): Phaser.Physics.Arcade.Sprite {
        return this.sprite;
    }

    public getGridPos(): Phaser.Math.Vector2 {
        return this.gridPos;
    }

    public move(dt: number = 1): void {
        if (!this.isAlive) {
            return;
        }

        this.sprite.setPosition(this.sprite.x + (this.mapSpeed + this.speed) * dt, this.sprite.y);

        // Left the screen — free the lane and let Traffic spawn a replacement.
        if (this.sprite.x < -this.sprite.width) {
            this.destroyVehicle();

            this.scene.events.emit(GameEvent.VEHICLE_DESTROYED, this.id);
        }
    }

    public setEnableTurn(enableTurn: boolean): void {
        this.canTurn = enableTurn;
    }

    public stop(): void {
        this.speed = 0;
    }

    public turnLeft() {
        if(this.canTurn && !this.isTurning && 
            this.gridPos.y < this.map.getNumRoadChunkLanes(this.gridPos.x) - 1) {
            this.turn(Direction.LEFT, this.turningStrength);

            this.gridPos.y++;

            this.isTurning = true;
        }
    }

    public turnRight() {
        if(this.canTurn && !this.isTurning &&
             this.gridPos.y > 0) {
            this.turn(Direction.RIGHT, this.turningStrength);

            this.gridPos.y--;

            this.isTurning = true;
        }
    }

    public static getRandomVehicle(): VehicleProperties {
        return vehicles[Common.getRandomEnumValue(VehicleType)];
    }

    private laneDepth(laneY: number): number {
        return this.depthLayer + this.map.getNumRoadChunkLanes(this.gridPos.x) - laneY;
    }

    private turn(direction: Direction, velocity: number): void {
        const isLeft = direction === Direction.LEFT;
        const targetLane = this.gridPos.y + (isLeft ? 1 : -1);

        const fromDepth = this.laneDepth(this.gridPos.y);
        const position: number = this.map.getLanePosition(this.gridPos.x, targetLane);
        const scale: number = this.map.getPerspectiveScale(this.gridPos.x, targetLane);

        this.sprite.anims.play(`${this.type.toString()}_${direction}`, true);

        // Left = upper lane: slip under (lower z) during the cut. Right = lower lane: pass over.
        this.sprite.setDepth(isLeft ? fromDepth - 1 : fromDepth + 1);
        this.sprite.setVelocityY(isLeft ? -velocity : velocity);

        const isArrived = (): boolean => isLeft ? this.sprite.y <= position : this.sprite.y >= position;

        const step = (): void => {
            if (!this.isAlive || !this.sprite.active) {
                this.turnTimer?.remove(false);
                return;
            }

            if (!isArrived()) {
                this.sprite.setScale((this.sprite.y / position) * scale);
                return;
            }

            this.turnTimer?.remove(false);

            this.sprite.y = position;
            this.sprite
                .setVelocityY(0)
                .setDepth(this.laneDepth(this.gridPos.y))
                .anims.play(`${this.type.toString()}_${Direction.FRONT.toString()}`, true);

            this.isTurning = false;
        };

        // Scene timer instead of async/await: cancelled automatically when the scene shuts down.
        this.turnTimer = this.scene.time.addEvent({ delay: 60, loop: true, callback: step });
    }

    private handleMapSpeedChanged(mapSpeed: number) {
        this.mapSpeed = mapSpeed;
    }
}
