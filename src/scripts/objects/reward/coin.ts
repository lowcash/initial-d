import ICollidable from '../interfaces/ICollidable';
import { GameEvent } from '../_common/common';

export default class Coin implements ICollidable {
    private readonly scene: Phaser.Scene;

    private readonly id: string;

    private readonly sprite: Phaser.Physics.Arcade.Sprite;

    private readonly gridPos: Phaser.Math.Vector2;

    private readonly rewardPoints: number;

    private isAlive: boolean = true;
    private isCollecting: boolean = false;

    private readonly checkEvent?: Phaser.Time.TimerEvent;

    constructor(scene: Phaser.Scene, id: string, sprite: Phaser.Physics.Arcade.Sprite, gridPos: Phaser.Math.Vector2, collideWith: Array<Phaser.Physics.Arcade.Sprite> = [], rewardPoints: number = 200) {
        this.scene = scene;

        this.id = id;
        this.sprite = sprite;

        this.gridPos = gridPos;

        this.rewardPoints = rewardPoints;

        for (const c of collideWith) {
            this.registerCollision(c);
        }

        // Phaser timer (not async while) so clear/restart can stop cleanly.
        this.checkEvent = this.scene.time.addEvent({
            delay: 60,
            loop: true,
            callback: this.checkOffscreen,
            callbackScope: this
        });
    }

    public registerCollision(collideWith: Phaser.Physics.Arcade.Sprite): void {
        this.scene.physics.add.overlap(this.sprite, collideWith, () => {
            if (!this.isAlive || this.isCollecting) {
                return;
            }

            this.scene.events.emit(GameEvent.COIN_COLLIDED, this.id);
        });
    }

    /** Atomic claim to prevent double-scoring from multi-overlap. */
    public tryBeginCollect(): boolean {
        if (!this.isAlive || this.isCollecting) {
            return false;
        }

        this.isCollecting = true;
        return true;
    }

    public getPosition(): Phaser.Math.Vector2 {
        return new Phaser.Math.Vector2(this.sprite.x, this.sprite.y);
    }

    public getSprite(): Phaser.Physics.Arcade.Sprite {
        return this.sprite;
    }

    public destroyCoin(): void {
        if (!this.isAlive) {
            return;
        }

        this.isAlive = false;
        this.stopWatching();

        if (this.sprite && this.sprite.active) {
            this.sprite.destroy();
        }

        if (!this.isCollecting) {
            this.scene.events.emit(GameEvent.COIN_DESTROYED, this.id);
        }
    }

    /** Hard stop used by clear/restart — no destroy event, no tweens left running. */
    public dispose(): void {
        this.isAlive = false;
        this.isCollecting = true;
        this.stopWatching();

        if (this.sprite && this.sprite.active) {
            this.scene.tweens.killTweensOf(this.sprite);
            this.sprite.destroy();
        }
    }

    /**
     * Keep scrolling with the road (pass through the car) while fading out.
     * `scrollSpeed` is the same per-frame delta Reward.move() uses via incX.
     * Call only after tryBeginCollect().
     */
    public collectWithMotion(durationMs: number, scrollSpeed: number, onDone?: () => void): void {
        if (!this.isCollecting) {
            return;
        }

        this.isAlive = false;
        this.stopWatching();

        if (this.sprite.body) {
            this.scene.physics.world.disable(this.sprite);
        }

        // Approximate remaining scroll over the FX window (~60fps ticks).
        const travelX = scrollSpeed * (durationMs / (1000 / 60));

        this.scene.tweens.add({
            targets: this.sprite,
            x: this.sprite.x + travelX,
            scale: this.sprite.scale * 1.2,
            alpha: 0,
            duration: durationMs,
            ease: 'Linear',
            onComplete: () => {
                if (this.sprite && this.sprite.active) {
                    this.sprite.destroy();
                }

                // Scene may already have restarted (AGAIN) before tween finished.
                if (!this.scene.sys.isActive()) {
                    return;
                }

                if (onDone) {
                    onDone();
                }
            }
        });
    }

    public getLane(): number {
        return this.gridPos.y;
    }

    public getRewardPoints(): number {
        return this.rewardPoints;
    }

    private checkOffscreen(): void {
        if (!this.isAlive || this.isCollecting) {
            this.stopWatching();
            return;
        }

        if (!this.sprite || !this.sprite.active) {
            this.isAlive = false;
            this.stopWatching();
            return;
        }

        if (this.sprite.x < -this.sprite.width) {
            this.destroyCoin();
        }
    }

    private stopWatching(): void {
        if (this.checkEvent) {
            this.checkEvent.remove(false);
        }
    }
};
